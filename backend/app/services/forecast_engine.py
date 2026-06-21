import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from app.utils.logger import logger

class ForecastEngine:
    """
    Geospatial Parking Risk Forecasting Engine.
    Predicts future illegal parking violations and congestion risks using
    exponential smoothing (Holt-Winters) scaled by historical growth patterns.
    """

    def __init__(self, forecast_days: int = 90):
        self.forecast_days = forecast_days

    def _classify_risk(self, score: float) -> str:
        """Classifies future risk score into risk categories."""
        if score >= 81:
            return "Critical"
        elif score >= 61:
            return "High"
        elif score >= 31:
            return "Medium"
        else:
            return "Low"

    def calculate_forecast(
        self,
        df: pd.DataFrame,
        hotspots: List[Dict[str, Any]],
        impact_data: List[Dict[str, Any]],
        spillover_data: List[Dict[str, Any]],
    ) -> Tuple[list, dict, dict, list]:
        """
        Calculates 7/30/90 day forecasts for each junction.

        Args:
            df: Processed DataFrame.
            hotspots: List of hotspots.
            impact_data: List of impact score details.
            spillover_data: List of spillover details.

        Returns:
            Tuple of:
                - forecast: List of ForecastDetail dicts
                - summary: Summary aggregate dict
                - trends: Dict containing daily/weekly/monthly lists of trend points
                - map_data: Map-ready coordinate/forecast dicts
        """
        logger.info("Initializing Future Parking Risk Forecast Engine...")

        if df is None or df.empty:
            logger.warning("Empty DataFrame passed to ForecastEngine. Returning empty results.")
            return [], self._empty_summary(), {"daily": [], "weekly": [], "monthly": []}, []

        try:
            # 1. Clean data and filter to valid junctions
            df_junctions = df.dropna(subset=["junction_name", "created_datetime"]).copy()
            df_junctions = df_junctions[
                (df_junctions["junction_name"] != "No Junction")
                & (df_junctions["junction_name"].astype(str).str.strip() != "")
            ]

            if df_junctions.empty:
                logger.warning("No valid junctions found. Returning empty forecast results.")
                return [], self._empty_summary(), {"daily": [], "weekly": [], "monthly": []}, []

            # Ensure TZ-naive datetime for pandas resample/grouping
            df_junctions["created_datetime"] = pd.to_datetime(df_junctions["created_datetime"], errors="coerce")
            df_junctions = df_junctions.dropna(subset=["created_datetime"])
            df_junctions["date"] = df_junctions["created_datetime"].dt.date

            # Calculate days span in dataset
            min_date = df_junctions["date"].min()
            max_date = df_junctions["date"].max()
            days_span = max(1.0, float((max_date - min_date).days))

            # Lookups for Impact Score & Spillover Score
            impact_map = {item["junction_name"]: item["impact_score"] for item in impact_data if item.get("junction_name")}
            spillover_map = {item["junction_name"]: item.get("spillover_score", 0) for item in spillover_data if item.get("junction_name")}

            # Coords lookup from hotspots
            hotspot_coords = {}
            for h in hotspots:
                jname = h.get("junction_name", "")
                if jname:
                    hotspot_coords[jname] = {
                        "latitude": h["latitude"],
                        "longitude": h["longitude"],
                    }

            # Fallback average coordinates
            df_coords = df_junctions.dropna(subset=["latitude", "longitude"]).copy()
            df_coords["latitude"] = pd.to_numeric(df_coords["latitude"], errors="coerce")
            df_coords["longitude"] = pd.to_numeric(df_coords["longitude"], errors="coerce")
            df_coords = df_coords.dropna(subset=["latitude", "longitude"])
            junction_avg_coords = (
                df_coords.groupby("junction_name")
                .agg({"latitude": "mean", "longitude": "mean"})
                .to_dict("index")
            )

            # 2. Fit Holt-Winters Exponential Smoothing on citywide daily violations
            citywide_daily = df_junctions.groupby("date").size().reset_index(name="count")
            citywide_daily = citywide_daily.set_index(pd.to_datetime(citywide_daily["date"]))
            citywide_daily = citywide_daily.reindex(pd.date_range(start=min_date, end=max_date), fill_value=0)

            series_data = citywide_daily["count"].astype(float)
            
            # Fit model
            try:
                model = ExponentialSmoothing(series_data, trend="add", seasonal=None)
                fitted_model = model.fit()
                forecast_series = fitted_model.forecast(steps=self.forecast_days)
                # Keep values positive
                forecast_series = np.clip(forecast_series, a_min=0, a_max=None)
            except Exception as fe:
                logger.warning(f"Statsmodels fit failed: {str(fe)}. Falling back to simple moving average projection.")
                # Fallback: simple average trend projection
                mean_val = float(series_data.mean())
                forecast_series = pd.Series([mean_val] * self.forecast_days, index=pd.date_range(start=max_date + pd.Timedelta(days=1), periods=self.forecast_days))

            # 3. Compute forecasts per junction
            grouped = df_junctions.groupby("junction_name")
            forecast_list = []
            map_data = []

            # Pre-calculate normalizer max values
            raw_forecast_scores = []

            for junction_name, group in grouped:
                current_violations = len(group)
                
                # Split in two halves to find historical growth rate
                group_sorted = group.sort_values("created_datetime")
                midpoint = len(group_sorted) // 2
                first_half = len(group_sorted.iloc[:midpoint])
                second_half = len(group_sorted.iloc[midpoint:])
                
                growth_rate = 0.0
                if first_half > 0:
                    growth_rate = ((second_half - first_half) / first_half) * 100.0
                else:
                    growth_rate = 0.0

                # Proportion of citywide violations contributed by this junction
                junction_share = current_violations / len(df_junctions)

                # Future violations projections
                # Projected violations for 30 days = sum of 30 days of projected citywide violations * share * growth multiplier
                growth_multiplier = max(0.5, min(2.5, 1.0 + (growth_rate / 100.0)))
                
                proj_7_days = float(forecast_series.iloc[:7].sum() * junction_share * growth_multiplier)
                proj_30_days = float(forecast_series.iloc[:30].sum() * junction_share * growth_multiplier)
                proj_90_days = float(forecast_series.iloc[:90].sum() * junction_share * growth_multiplier)

                current_impact = float(impact_map.get(str(junction_name), 0.0))
                spillover_score = float(spillover_map.get(str(junction_name), 0.0))

                # Coordinates
                coords = hotspot_coords.get(
                    str(junction_name),
                    junction_avg_coords.get(str(junction_name), {"latitude": 12.9716, "longitude": 77.5946})
                )

                raw_forecast_scores.append({
                    "junction_name": str(junction_name),
                    "current_violations": current_violations,
                    "predicted_violations": int(round(proj_30_days)),
                    "predicted_7_days": int(round(proj_7_days)),
                    "predicted_90_days": int(round(proj_90_days)),
                    "growth_rate": round(growth_rate, 1),
                    "current_impact": current_impact,
                    "spillover_score": spillover_score,
                    "latitude": float(coords["latitude"]),
                    "longitude": float(coords["longitude"]),
                })

            if not raw_forecast_scores:
                return [], self._empty_summary(), {"daily": [], "weekly": [], "monthly": []}, []

            # Normalize values for Risk Score calculation
            max_pred = max(loc["predicted_violations"] for loc in raw_forecast_scores) if raw_forecast_scores else 1
            max_growth = max(abs(loc["growth_rate"]) for loc in raw_forecast_scores) if raw_forecast_scores else 1

            for idx, item in enumerate(raw_forecast_scores):
                # Normalize metrics (0 - 100)
                norm_pred = (item["predicted_violations"] / max_pred) * 100.0 if max_pred > 0 else 0.0
                norm_growth = (max(0.0, item["growth_rate"]) / max_growth) * 100.0 if max_growth > 0 else 0.0
                
                # Weighted Risk Score: 40% Forecasted Violations, 30% Growth Rate, 20% Current Impact Score, 10% Spillover Score
                risk_score = (
                    0.40 * norm_pred +
                    0.30 * norm_growth +
                    0.20 * item["current_impact"] +
                    0.10 * item["spillover_score"]
                )
                risk_score = max(0.0, min(100.0, risk_score))
                risk_level = self._classify_risk(risk_score)

                forecast_list.append({
                    "junction_name": item["junction_name"],
                    "current_violations": item["current_violations"],
                    "predicted_violations": item["predicted_violations"],
                    "predicted_7_days": item["predicted_7_days"],
                    "predicted_90_days": item["predicted_90_days"],
                    "growth_rate": item["growth_rate"],
                    "future_risk_score": round(risk_score, 1),
                    "risk": risk_level,
                    "latitude": item["latitude"],
                    "longitude": item["longitude"],
                })

                # Map data
                map_data.append({
                    "id": f"fore_{idx}",
                    "latitude": item["latitude"],
                    "longitude": item["longitude"],
                    "current_violations": item["current_violations"],
                    "predicted_violations": item["predicted_violations"],
                    "growth_rate": item["growth_rate"],
                    "future_risk_score": round(risk_score, 1),
                    "risk": risk_level,
                    "label": item["junction_name"],
                    "radius": max(5, int(min(30, item["predicted_violations"] / 40))),
                })

            # Sort forecast list by future risk score descending
            forecast_list.sort(key=lambda x: x["future_risk_score"], reverse=True)

            # 4. Generate summary statistics
            high_risk_count = sum(1 for loc in forecast_list if loc["risk"] == "High")
            critical_count = sum(1 for loc in forecast_list if loc["risk"] == "Critical")
            highest_growth = max(forecast_list, key=lambda x: x["growth_rate"]) if forecast_list else None
            avg_growth = float(np.mean([loc["growth_rate"] for loc in forecast_list])) if forecast_list else 0.0

            summary = {
                "high_risk_areas": high_risk_count,
                "critical_future_hotspots": critical_count,
                "highest_growth_area": highest_growth["junction_name"] if highest_growth else "N/A",
                "average_growth_rate": round(avg_growth, 1),
            }

            # 5. Generate daily, weekly, monthly timeline trend response
            daily_trends = []
            weekly_trends = []
            monthly_trends = []

            # Populate forecasted daily points
            last_date = pd.to_datetime(max_date)
            for i, val in enumerate(forecast_series):
                future_day = last_date + pd.Timedelta(days=i+1)
                daily_trends.append({
                    "date": future_day.strftime("%Y-%m-%d"),
                    "predicted": int(round(val)),
                })

            # Weekly resampling of forecasted points
            df_fore_daily = pd.DataFrame(daily_trends)
            df_fore_daily["date"] = pd.to_datetime(df_fore_daily["date"])
            df_fore_daily = df_fore_daily.set_index("date")

            df_weekly = df_fore_daily.resample("W").sum()
            for date_idx, row in df_weekly.iterrows():
                weekly_trends.append({
                    "date": date_idx.strftime("%Y-%m-%d"),
                    "predicted": int(row["predicted"]),
                })

            # Monthly resampling
            df_monthly = df_fore_daily.resample("ME").sum()
            for date_idx, row in df_monthly.iterrows():
                monthly_trends.append({
                    "date": date_idx.strftime("%Y-%m"),
                    "predicted": int(row["predicted"]),
                })

            trends = {
                "daily": daily_trends,
                "weekly": weekly_trends,
                "monthly": monthly_trends,
            }

            logger.info("Forecasting calculations completed successfully.")
            return forecast_list, summary, trends, map_data

        except Exception as e:
            logger.error(f"Error computing forecast metrics: {str(e)}")
            raise e

    def _empty_summary(self) -> Dict[str, Any]:
        return {
            "high_risk_areas": 0,
            "critical_future_hotspots": 0,
            "highest_growth_area": "N/A",
            "average_growth_rate": 0.0,
        }
