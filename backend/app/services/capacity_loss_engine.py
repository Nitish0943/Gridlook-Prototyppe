import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.preprocessing import MinMaxScaler
from app.utils.logger import logger


class CapacityLossEngine:
    """
    Road Capacity Loss Estimator Engine.
    Estimates how much road carrying capacity is lost due to illegal parking
    by mapping vehicle types to occupied road widths and computing capacity loss percentages.
    """

    # Vehicle type to occupied road width mapping (meters)
    VEHICLE_WIDTH_MAP: Dict[str, float] = {
        "motorcycle": 1.0,
        "auto rickshaw": 2.0,
        "car": 2.5,
        "suv": 2.7,
        "bus": 3.0,
        "truck": 3.0,
    }
    DEFAULT_VEHICLE_WIDTH: float = 2.5  # Unknown / unmapped types
    DEFAULT_ROAD_WIDTH: float = 10.0  # meters

    def __init__(self, road_width: float = DEFAULT_ROAD_WIDTH):
        self.road_width = road_width

    def _get_vehicle_width(self, vehicle_type: Any) -> float:
        """Maps a vehicle_type string to its estimated occupied road width in meters."""
        if not isinstance(vehicle_type, str) or not vehicle_type.strip():
            return self.DEFAULT_VEHICLE_WIDTH
        return self.VEHICLE_WIDTH_MAP.get(vehicle_type.strip().lower(), self.DEFAULT_VEHICLE_WIDTH)

    def _classify_risk(self, capacity_loss: float) -> str:
        """Classifies capacity loss percentage into risk categories."""
        if capacity_loss >= 76:
            return "Critical"
        elif capacity_loss >= 51:
            return "High"
        elif capacity_loss >= 26:
            return "Medium"
        else:
            return "Low"

    def calculate_capacity_loss(
        self,
        df: pd.DataFrame,
        hotspots: List[Dict[str, Any]],
        impact_data: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[Dict[str, Any]]]:
        """
        Calculates road capacity loss metrics for each junction.

        Args:
            df: Processed DataFrame with violation records.
            hotspots: List of hotspot dicts from HotspotEngine.
            impact_data: List of impact score dicts from ImpactEngine.

        Returns:
            Tuple of:
                - locations: List of CapacityLossDetail dicts sorted by capacity_loss DESC
                - summary: Summary dict with aggregate metrics
                - map_data: List of map-ready dicts for Leaflet rendering
        """
        logger.info("Initializing Road Capacity Loss Engine...")

        if df is None or df.empty:
            logger.warning("Empty DataFrame passed to CapacityLossEngine. Returning empty results.")
            return [], self._empty_summary(), []

        try:
            # Filter to valid junctions
            df_junctions = df.dropna(subset=["junction_name"]).copy()
            df_junctions = df_junctions[
                (df_junctions["junction_name"] != "No Junction")
                & (df_junctions["junction_name"].astype(str).str.strip() != "")
            ]

            if df_junctions.empty:
                logger.warning("No valid junctions found. Returning empty capacity loss results.")
                return [], self._empty_summary(), []

            # Build impact score lookup
            impact_map = {
                item["junction_name"]: item["impact_score"]
                for item in impact_data
                if item.get("junction_name")
            }

            # Build junction coordinate lookup from hotspots
            hotspot_junction_coords = {}
            for h in hotspots:
                jname = h.get("junction_name", "")
                if jname:
                    hotspot_junction_coords[jname] = {
                        "latitude": h["latitude"],
                        "longitude": h["longitude"],
                    }

            # Fallback: compute average coordinates per junction from the dataframe
            df_coords = df_junctions.dropna(subset=["latitude", "longitude"]).copy()
            df_coords["latitude"] = pd.to_numeric(df_coords["latitude"], errors="coerce")
            df_coords["longitude"] = pd.to_numeric(df_coords["longitude"], errors="coerce")
            df_coords = df_coords.dropna(subset=["latitude", "longitude"])

            junction_avg_coords = (
                df_coords.groupby("junction_name")
                .agg({"latitude": "mean", "longitude": "mean"})
                .to_dict("index")
            )

            # Group by junction and compute capacity loss
            grouped = df_junctions.groupby("junction_name")
            raw_locations = []

            for junction_name, group in grouped:
                # Calculate occupied width from vehicle types
                vehicle_widths = group["vehicle_type"].apply(self._get_vehicle_width)
                occupied_width = float(vehicle_widths.sum())
                available_width = max(0.0, self.road_width - occupied_width)
                capacity_loss = min(100.0, (occupied_width / self.road_width) * 100.0)
                risk = self._classify_risk(capacity_loss)
                vehicle_count = len(group)

                # Get impact score for this junction
                impact_score = impact_map.get(str(junction_name), 0)

                # Get coordinates (prefer hotspot coords, fallback to average)
                coords = hotspot_junction_coords.get(
                    str(junction_name),
                    junction_avg_coords.get(str(junction_name), {"latitude": 0.0, "longitude": 0.0}),
                )

                raw_locations.append({
                    "junction_name": str(junction_name),
                    "capacity_loss_raw": capacity_loss,
                    "occupied_width": round(occupied_width, 2),
                    "available_width": round(available_width, 2),
                    "road_width": self.road_width,
                    "risk": risk,
                    "vehicle_count": vehicle_count,
                    "impact_score": impact_score,
                    "violation_density": vehicle_count,  # used for congestion amplification
                    "latitude": float(coords["latitude"]),
                    "longitude": float(coords["longitude"]),
                })

            if not raw_locations:
                return [], self._empty_summary(), []

            # Compute Congestion Amplification Factor
            # Formula: 0.5 × normalized_capacity_loss + 0.3 × normalized_impact_score + 0.2 × normalized_density
            capacity_losses = np.array([loc["capacity_loss_raw"] for loc in raw_locations]).reshape(-1, 1)
            impact_scores = np.array([loc["impact_score"] for loc in raw_locations]).reshape(-1, 1)
            densities = np.array([loc["violation_density"] for loc in raw_locations]).reshape(-1, 1)

            scaler = MinMaxScaler(feature_range=(0, 100))

            norm_losses = scaler.fit_transform(capacity_losses).flatten() if len(capacity_losses) > 1 else np.full(len(capacity_losses), 50.0)
            norm_impacts = scaler.fit_transform(impact_scores).flatten() if len(impact_scores) > 1 else np.full(len(impact_scores), 50.0)
            norm_densities = scaler.fit_transform(densities).flatten() if len(densities) > 1 else np.full(len(densities), 50.0)

            # Build final results
            final_locations = []
            map_data = []

            for i, loc in enumerate(raw_locations):
                congestion_amp = (
                    0.5 * norm_losses[i]
                    + 0.3 * norm_impacts[i]
                    + 0.2 * norm_densities[i]
                )
                congestion_amp = max(0.0, min(100.0, congestion_amp))

                final_locations.append({
                    "junction_name": loc["junction_name"],
                    "capacity_loss": round(loc["capacity_loss_raw"], 1),
                    "occupied_width": loc["occupied_width"],
                    "available_width": loc["available_width"],
                    "road_width": loc["road_width"],
                    "risk": loc["risk"],
                    "congestion_amplification": round(congestion_amp, 1),
                    "vehicle_count": loc["vehicle_count"],
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                })

                # Map data entry
                if loc["latitude"] != 0.0 and loc["longitude"] != 0.0:
                    map_data.append({
                        "id": f"cap_{i}",
                        "latitude": loc["latitude"],
                        "longitude": loc["longitude"],
                        "capacity_loss": round(loc["capacity_loss_raw"], 1),
                        "risk": loc["risk"],
                        "label": loc["junction_name"],
                        "radius": max(5, int(loc["capacity_loss_raw"] / 5)),  # proportional circle size
                    })

            # Sort by capacity loss descending
            final_locations.sort(key=lambda x: x["capacity_loss"], reverse=True)

            # Compute summary
            all_losses = [loc["capacity_loss"] for loc in final_locations]
            avg_loss = float(np.mean(all_losses)) if all_losses else 0.0
            critical_count = sum(1 for loc in final_locations if loc["risk"] == "Critical")
            highest_loss_area = final_locations[0]["junction_name"] if final_locations else "N/A"
            citywide_loss = float(np.median(all_losses)) if all_losses else 0.0

            summary = {
                "average_capacity_loss": round(avg_loss, 1),
                "critical_locations": critical_count,
                "highest_loss_area": highest_loss_area,
                "citywide_capacity_loss": round(citywide_loss, 1),
            }

            logger.info(
                f"Road Capacity Loss calculations completed. "
                f"{len(final_locations)} junctions analyzed, {critical_count} critical."
            )
            return final_locations, summary, map_data

        except Exception as e:
            logger.error(f"Error computing road capacity loss metrics: {str(e)}")
            raise e

    def _empty_summary(self) -> Dict[str, Any]:
        """Returns an empty summary dict for edge cases."""
        return {
            "average_capacity_loss": 0.0,
            "critical_locations": 0,
            "highest_loss_area": "N/A",
            "citywide_capacity_loss": 0.0,
        }
