import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.ensemble import RandomForestRegressor
from app.core.config import settings
from app.utils.logger import logger

class PeakHourEngine:
    """
    Peak Hour Prediction Engine.
    Uses Random Forest Regressor to predict expected violations per hour
    and identify future peak hours and risk levels.
    """

    def calculate_peak_hours(
        self,
        df: pd.DataFrame,
        impact_data: List[Dict[str, Any]],
        spillover_data: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Calculates peak hour predictions, junction peaks, and summary metrics.

        Args:
            df: Processed DataFrame.
            impact_data: List of impact score details.
            spillover_data: List of spillover details.

        Returns:
            Tuple of:
                - peak_hours: List of PeakHourDetail dicts (next 24 hours chronological)
                - junction_peaks: List of JunctionPeakDetail dicts
                - summary: PeakHourSummaryResponse dict
        """
        logger.info("Initializing Peak Hour Prediction Engine...")

        if df is None or df.empty:
            logger.warning("Empty DataFrame passed to PeakHourEngine. Returning empty results.")
            return [], [], self._empty_summary()

        try:
            # 1. Data Cleaning
            df_clean = df.dropna(subset=["junction_name", "created_datetime"]).copy()
            df_clean = df_clean[
                (df_clean["junction_name"] != "No Junction")
                & (df_clean["junction_name"].astype(str).str.strip() != "")
            ]

            if df_clean.empty:
                logger.warning("No valid data for peak hour modeling. Returning empty results.")
                return [], [], self._empty_summary()

            # Ensure timezone-naive datetime
            df_clean["created_datetime"] = pd.to_datetime(df_clean["created_datetime"], errors="coerce")
            df_clean = df_clean.dropna(subset=["created_datetime"])
            df_clean["date"] = df_clean["created_datetime"].dt.date
            df_clean["hour"] = df_clean["created_datetime"].dt.hour

            # 2. Grid Creation for selection-bias free training
            unique_dates = df_clean["date"].dropna().unique()
            unique_junctions = df_clean["junction_name"].dropna().unique()
            hours_list = list(range(24))

            if len(unique_dates) == 0 or len(unique_junctions) == 0:
                return [], [], self._empty_summary()

            # Create full MultiIndex grid
            grid = pd.MultiIndex.from_product(
                [unique_dates, unique_junctions, hours_list],
                names=["date", "junction_name", "hour"]
            ).to_frame().reset_index(drop=True)

            # Group actual data by date, junction, and hour to get counts
            actual_counts = df_clean.groupby(["date", "junction_name", "hour"]).size().reset_index(name="violation_count")

            # Merge actual counts into grid
            grid = pd.merge(grid, actual_counts, on=["date", "junction_name", "hour"], how="left")
            grid["violation_count"] = grid["violation_count"].fillna(0).astype(int)

            # Feature engineering on grid
            grid["datetime"] = pd.to_datetime(grid["date"].astype(str) + " " + grid["hour"].astype(str) + ":00:00")
            grid["weekday"] = grid["datetime"].dt.weekday
            grid["month"] = grid["datetime"].dt.month
            grid["is_weekend"] = grid["weekday"].isin([5, 6]).astype(int)

            morning_start, morning_end = settings.PEAK_HOURS_MORNING
            evening_start, evening_end = settings.PEAK_HOURS_EVENING
            grid["is_peak_hour"] = (
                ((grid["hour"] >= morning_start) & (grid["hour"] < morning_end)) |
                ((grid["hour"] >= evening_start) & (grid["hour"] < evening_end))
            ).astype(int)

            # Label Encode Junctions
            junctions_list = sorted(list(unique_junctions))
            junction_map = {name: idx for idx, name in enumerate(junctions_list)}
            grid["junction_idx"] = grid["junction_name"].map(junction_map)

            # 3. Model Training
            feature_cols = ["junction_idx", "hour", "weekday", "month", "is_weekend", "is_peak_hour"]
            X = grid[feature_cols].values
            y = grid["violation_count"].values

            model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
            model.fit(X, y)

            # 4. Predict Next 24 Hours (Chronological)
            last_time = df_clean["created_datetime"].max()
            if pd.isnull(last_time):
                last_time = pd.Timestamp.now()

            start_timestamp = last_time.floor("h")
            next_timestamps = [start_timestamp + pd.Timedelta(hours=i) for i in range(1, 25)]

            pred_rows = []
            for ts in next_timestamps:
                h = ts.hour
                wd = ts.weekday()
                m = ts.month
                we = 1 if wd in [5, 6] else 0
                ph = 1 if (morning_start <= h < morning_end or evening_start <= h < evening_end) else 0

                for j_name in junctions_list:
                    j_idx = junction_map[j_name]
                    pred_rows.append({
                        "timestamp": ts,
                        "hour_str": ts.strftime("%H:00"),
                        "hour": h,
                        "weekday": wd,
                        "month": m,
                        "is_weekend": we,
                        "is_peak_hour": ph,
                        "junction_name": j_name,
                        "junction_idx": j_idx
                    })

            df_pred = pd.DataFrame(pred_rows)
            X_pred = df_pred[feature_cols].values
            df_pred["predicted"] = model.predict(X_pred)
            df_pred["predicted"] = np.clip(df_pred["predicted"], a_min=0, a_max=None)

            # 5. Compute Citywide Risk Scores per Hour
            hourly_citywide = df_pred.groupby(["timestamp", "hour_str"])["predicted"].sum().reset_index()
            max_predicted_citywide = hourly_citywide["predicted"].max()
            if max_predicted_citywide == 0:
                max_predicted_citywide = 1

            # Historical hourly frequency
            df_clean["hour_str"] = df_clean["created_datetime"].dt.strftime("%H:00")
            historical_counts = df_clean.groupby("hour_str").size().to_dict()
            max_historical = max(historical_counts.values()) if historical_counts else 1

            # Impact and Spillover stats
            avg_impact = np.mean([item["impact_score"] for item in impact_data]) if impact_data else 0.0
            avg_spillover = np.mean([item.get("spillover_score", 0.0) for item in spillover_data]) if spillover_data else 0.0

            peak_hours_result = []
            for _, row in hourly_citywide.iterrows():
                h_str = row["hour_str"]
                pred_val = row["predicted"]

                # 40% Predicted Violations
                norm_pred = (pred_val / max_predicted_citywide) * 100.0
                # 30% Historical Frequency
                hist_val = historical_counts.get(h_str, 0)
                norm_hist = (hist_val / max_historical) * 100.0 if max_historical > 0 else 0.0

                # 40% Predicted + 30% Historical + 20% Impact + 10% Spillover
                risk_score = 0.40 * norm_pred + 0.30 * norm_hist + 0.20 * avg_impact + 0.10 * avg_spillover
                risk_score = max(0.0, min(100.0, risk_score))

                # Classify Risk Levels
                if risk_score >= 81:
                    risk_level = "Critical"
                elif risk_score >= 61:
                    risk_level = "High"
                elif risk_score >= 31:
                    risk_level = "Medium"
                else:
                    risk_level = "Low"

                peak_hours_result.append({
                    "hour": h_str,
                    "predicted_violations": int(round(pred_val)),
                    "risk_score": int(round(risk_score)),
                    "risk": risk_level
                })

            # 6. Junction Peak Analysis
            junction_peaks = []
            for j_name in junctions_list:
                j_df = df_pred[df_pred["junction_name"] == j_name]
                if j_df.empty:
                    continue
                best_idx = j_df["predicted"].idxmax()
                best_row = j_df.loc[best_idx]
                junction_peaks.append({
                    "junction_name": j_name,
                    "peak_hour": best_row["hour_str"],
                    "predicted_violations": int(round(best_row["predicted"]))
                })
            # Sort junctions by violation volumes descending
            junction_peaks.sort(key=lambda x: x["predicted_violations"], reverse=True)

            # 7. Summary Metrics
            best_hour_idx = hourly_citywide["predicted"].idxmax()
            best_hour_row = hourly_citywide.loc[best_hour_idx]
            next_peak_hour = best_hour_row["hour_str"]
            
            highest_risk_j = "N/A"
            if junction_peaks:
                highest_risk_j = junction_peaks[0]["junction_name"]

            predicted_citywide_violations = int(round(df_pred["predicted"].sum()))

            summary = {
                "next_peak_hour": next_peak_hour,
                "highest_risk_junction": highest_risk_j,
                "predicted_citywide_violations": predicted_citywide_violations
            }

            logger.info("Peak Hour Prediction calculations completed successfully.")
            return peak_hours_result, junction_peaks, summary

        except Exception as e:
            logger.error(f"Error computing peak hours: {str(e)}")
            raise e

    def _empty_summary(self) -> Dict[str, Any]:
        return {
            "next_peak_hour": "N/A",
            "highest_risk_junction": "N/A",
            "predicted_citywide_violations": 0
        }
