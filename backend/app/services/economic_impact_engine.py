import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from app.utils.logger import logger

class EconomicImpactEngine:
    """
    Economic Impact Analysis Engine.
    Quantifies the financial consequences of illegal parking by calculating
    Fuel Waste, Travel Delay, Productivity Loss, and Enforcement Cost.
    """

    def __init__(
        self,
        fuel_waste_rate: float = 10.0,         # ₹10 per violation
        travel_delay_minutes: float = 5.0,     # 5 minutes per violation
        average_hourly_wage: float = 150.0,     # ₹150 / hour
        enforcement_cost_rate: float = 5.0,    # ₹5 per violation
        travel_delay_cost_rate: float = 180.0, # ₹180 / hour (equals ₹15 per 5 mins)
    ):
        self.fuel_waste_rate = fuel_waste_rate
        self.travel_delay_minutes = travel_delay_minutes
        self.average_hourly_wage = average_hourly_wage
        self.enforcement_cost_rate = enforcement_cost_rate
        self.travel_delay_cost_rate = travel_delay_cost_rate

    def _classify_category(self, monthly_loss: float) -> str:
        """Classifies monthly economic loss into risk categories."""
        if monthly_loss >= 200000:
            return "Critical"
        elif monthly_loss >= 50001:
            return "High"
        elif monthly_loss >= 10001:
            return "Medium"
        else:
            return "Low"

    def calculate_economic_impact(
        self,
        df: pd.DataFrame,
        hotspots: List[Dict[str, Any]],
        impact_data: List[Dict[str, Any]],
    ) -> Tuple[list, dict, list, list]:
        """
        Calculates economic impact metrics for each junction.

        Args:
            df: Processed DataFrame with violation records.
            hotspots: Hotspots list (for coordinate lookup).
            impact_data: Impact scores list.

        Returns:
            Tuple of:
                - locations: List of EconomicImpactDetail dicts
                - summary: Summary dict
                - trends: List of trend data dicts (weekly/monthly aggregates)
                - map_data: Map-ready coordinate/severity dicts
        """
        logger.info("Initializing Economic Impact Analysis Engine...")

        if df is None or df.empty:
            logger.warning("Empty DataFrame passed to EconomicImpactEngine. Returning empty results.")
            return [], self._empty_summary(), [], []

        try:
            # 1. Clean data and filter to valid junctions
            df_junctions = df.dropna(subset=["junction_name"]).copy()
            df_junctions = df_junctions[
                (df_junctions["junction_name"] != "No Junction")
                & (df_junctions["junction_name"].astype(str).str.strip() != "")
            ]

            if df_junctions.empty:
                logger.warning("No valid junctions found. Returning empty economic impact results.")
                return [], self._empty_summary(), [], []

            # Determine the date span in days (min to max)
            if "created_datetime" in df_junctions.columns:
                df_junctions["created_datetime"] = pd.to_datetime(df_junctions["created_datetime"], errors="coerce")
                valid_dates = df_junctions["created_datetime"].dropna()
                if not valid_dates.empty:
                    min_date = valid_dates.min()
                    max_date = valid_dates.max()
                    days_span = max(1.0, float((max_date - min_date).days))
                else:
                    days_span = 151.0
            else:
                days_span = 151.0

            logger.info(f"Dataset covers a duration of {days_span} days.")

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

            # 2. Group by junction and calculate costs
            grouped = df_junctions.groupby("junction_name")
            locations = []
            map_data = []

            for junction_name, group in grouped:
                total_violations = len(group)
                daily_violations = total_violations / days_span

                # Daily calculations
                fuel_waste = daily_violations * self.fuel_waste_rate
                delay_minutes = daily_violations * self.travel_delay_minutes
                delay_cost = (delay_minutes / 60.0) * self.travel_delay_cost_rate
                productivity_loss = (delay_minutes / 60.0) * self.average_hourly_wage
                enforcement_cost = daily_violations * self.enforcement_cost_rate
                
                daily_loss = fuel_waste + delay_cost + productivity_loss + enforcement_cost

                # Projections
                weekly_loss = daily_loss * 7.0
                monthly_loss = daily_loss * 30.0
                yearly_loss = daily_loss * 365.0

                category = self._classify_category(monthly_loss)

                # Get coordinates
                coords = hotspot_coords.get(
                    str(junction_name),
                    junction_avg_coords.get(str(junction_name), {"latitude": 12.9716, "longitude": 77.5946}),
                )

                locations.append({
                    "junction_name": str(junction_name),
                    "daily_loss": round(daily_loss, 2),
                    "weekly_loss": round(weekly_loss, 2),
                    "monthly_loss": round(monthly_loss, 2),
                    "yearly_loss": round(yearly_loss, 2),
                    "category": category,
                    "violations_count": total_violations,
                    "breakdown": {
                        "fuel_waste": round(fuel_waste, 2),
                        "delay_cost": round(delay_cost, 2),
                        "productivity_loss": round(productivity_loss, 2),
                        "enforcement_cost": round(enforcement_cost, 2),
                    },
                    "latitude": float(coords["latitude"]),
                    "longitude": float(coords["longitude"]),
                })

            # Sort locations by daily loss descending
            locations.sort(key=lambda x: x["daily_loss"], reverse=True)

            # Build map data
            for i, loc in enumerate(locations):
                map_data.append({
                  "id": f"econ_{i}",
                  "latitude": loc["latitude"],
                  "longitude": loc["longitude"],
                  "daily_loss": loc["daily_loss"],
                  "monthly_loss": loc["monthly_loss"],
                  "yearly_loss": loc["yearly_loss"],
                  "category": loc["category"],
                  "label": loc["junction_name"],
                  "radius": max(6, int(min(30, loc["daily_loss"] / 200))),
                })

            # 3. Compute citywide summary
            total_daily = sum(loc["daily_loss"] for loc in locations)
            total_monthly = total_daily * 30.0
            total_yearly = total_daily * 365.0
            highest_loss_area = locations[0]["junction_name"] if locations else "N/A"

            summary = {
                "citywide_daily_loss": round(total_daily, 2),
                "citywide_monthly_loss": round(total_monthly, 2),
                "citywide_yearly_loss": round(total_yearly, 2),
                "highest_loss_area": highest_loss_area,
            }

            # 4. Generate trend series
            # We will group all valid violations by week to generate a trend of weekly costs
            trends = []
            if "created_datetime" in df_junctions.columns:
                df_trends = df_junctions.dropna(subset=["created_datetime"]).copy()
                df_trends["week_start"] = df_trends["created_datetime"].dt.to_period("W").dt.start_time
                weekly_counts = df_trends.groupby("week_start").size().reset_index(name="count")
                weekly_counts = weekly_counts.sort_values("week_start")

                for _, row in weekly_counts.iterrows():
                    week_date_str = row["week_start"].strftime("%Y-%m-%d")
                    violations_in_week = int(row["count"])

                    # Cost calculations for the week's violations
                    f_waste = violations_in_week * self.fuel_waste_rate
                    d_mins = violations_in_week * self.travel_delay_minutes
                    d_cost = (d_mins / 60.0) * self.travel_delay_cost_rate
                    p_loss = (d_mins / 60.0) * self.average_hourly_wage
                    e_cost = violations_in_week * self.enforcement_cost_rate

                    total_week_loss = f_waste + d_cost + p_loss + e_cost

                    trends.append({
                        "date": week_date_str,
                        "cost": round(total_week_loss, 2),
                        "violations": violations_in_week,
                    })

            logger.info("Economic Impact calculations completed successfully.")
            return locations, summary, trends, map_data

        except Exception as e:
            logger.error(f"Error computing economic impact metrics: {str(e)}")
            raise e

    def _empty_summary(self) -> Dict[str, Any]:
        return {
            "citywide_daily_loss": 0.0,
            "citywide_monthly_loss": 0.0,
            "citywide_yearly_loss": 0.0,
            "highest_loss_area": "N/A",
        }
