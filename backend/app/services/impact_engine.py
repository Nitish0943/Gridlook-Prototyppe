import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.preprocessing import MinMaxScaler
from app.utils.logger import logger
from app.services.statistics import StatisticsService

class ImpactEngine:
    """
    Parking Impact Score Engine to quantify the disruption of illegal parking
    at each junction based on frequency, peak hours, repeat offenders, and diversity.
    """
    
    def calculate_impact(self, df: pd.DataFrame) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Calculates impact scores and summaries for all valid junctions.
        
        Args:
            df (pd.DataFrame): Dataframe with engineered features.
            
        Returns:
            Tuple[List[Dict[str, Any]], Dict[str, Any]]:
                - List of dicts representing each junction and its impact score, ranked.
                - Dict containing summary statistics of the impact score.
        """
        logger.info("Initializing Parking Impact Score Engine...")
        
        if df is None or df.empty:
            logger.warning("Empty or None DataFrame passed to ImpactEngine. Returning empty results.")
            return [], {
                "total_locations": 0,
                "average_impact_score": 0.0,
                "critical_locations": 0,
                "high_locations": 0,
                "medium_locations": 0,
                "low_locations": 0
            }
            
        try:
            # 1. Filter out empty, null, or 'No Junction' values in junction_name
            df_junctions = df.dropna(subset=['junction_name']).copy()
            df_junctions = df_junctions[
                (df_junctions['junction_name'] != 'No Junction') & 
                (df_junctions['junction_name'].astype(str).str.strip() != '')
            ]
            
            if df_junctions.empty:
                logger.warning("No valid junctions found in dataset. Returning empty results.")
                return [], {
                    "total_locations": 0,
                    "average_impact_score": 0.0,
                    "critical_locations": 0,
                    "high_locations": 0,
                    "medium_locations": 0,
                    "low_locations": 0
                }
                
            # Pre-parse unique violation types to avoid expensive repeated string/JSON parsing
            unique_violation_strings = df_junctions['violation_type'].dropna().unique()
            parsed_violation_map = {
                val: StatisticsService.parse_violation_types(val) 
                for val in unique_violation_strings
            }
            
            # 2. Group by junction_name and calculate raw scores
            grouped = df_junctions.groupby('junction_name')
            raw_locations = []
            
            for junction_name, group in grouped:
                # Count total violations
                violations = len(group)
                
                # Count peak hour violations
                # is_peak_hour is a boolean/Nullable boolean column. Fill NA/None with False
                peak_hour_violations = int(group['is_peak_hour'].fillna(False).sum())
                
                # Count repeat offenders: unique vehicles appearing multiple times (>=2)
                # Drop nulls in vehicle_number first
                vehicle_counts = group['vehicle_number'].dropna().value_counts()
                repeat_offenders = int((vehicle_counts > 1).sum())
                
                # Count unique violation types (violation diversity)
                # Use pre-parsed mapping to look up values quickly
                unique_violations = set()
                for val in group['violation_type'].dropna().unique():
                    unique_violations.update(parsed_violation_map[val])
                violation_diversity = len(unique_violations)
                
                # Apply the Impact Formula (raw)
                # impact_score = 0.40 * F + 0.30 * P + 0.20 * R + 0.10 * D
                raw_score = (
                    0.40 * violations +
                    0.30 * peak_hour_violations +
                    0.20 * repeat_offenders +
                    0.10 * violation_diversity
                )
                
                raw_locations.append({
                    "junction_name": str(junction_name),
                    "violations": violations,
                    "peak_hour_violations": peak_hour_violations,
                    "repeat_offenders": repeat_offenders,
                    "violation_diversity": violation_diversity,
                    "raw_score": raw_score
                })
                
            # 3. Normalize scores using MinMaxScaler to 0 - 100
            raw_scores = np.array([loc["raw_score"] for loc in raw_locations]).reshape(-1, 1)
            
            scaler = MinMaxScaler(feature_range=(0, 100))
            normalized_scores = scaler.fit_transform(raw_scores).flatten()
            
            # Map categories and round normalized scores
            for idx, loc in enumerate(raw_locations):
                score = int(np.round(normalized_scores[idx]))
                loc["impact_score"] = score
                
                # Categorize impact
                if score >= 81:
                    loc["category"] = "Critical"
                elif score >= 61:
                    loc["category"] = "High"
                elif score >= 31:
                    loc["category"] = "Medium"
                else:
                    loc["category"] = "Low"
                    
            # 4. Sort locations by impact_score DESC (and secondary by violations DESC for stable sorting)
            raw_locations.sort(key=lambda x: (-x["impact_score"], -x["violations"]))
            
            # 5. Assign rank
            ranked_locations = []
            for rank, loc in enumerate(raw_locations, start=1):
                ranked_locations.append({
                    "rank": rank,
                    "junction_name": loc["junction_name"],
                    "impact_score": loc["impact_score"],
                    "category": loc["category"],
                    "violations": loc["violations"],
                    "peak_hour_violations": loc["peak_hour_violations"],
                    "repeat_offenders": loc["repeat_offenders"]
                })
                
            # 6. Calculate summary metrics
            total_locations = len(ranked_locations)
            avg_impact = float(np.mean([loc["impact_score"] for loc in ranked_locations])) if total_locations > 0 else 0.0
            
            summary = {
                "total_locations": total_locations,
                "average_impact_score": round(avg_impact, 2),
                "critical_locations": sum(1 for loc in ranked_locations if loc["category"] == "Critical"),
                "high_locations": sum(1 for loc in ranked_locations if loc["category"] == "High"),
                "medium_locations": sum(1 for loc in ranked_locations if loc["category"] == "Medium"),
                "low_locations": sum(1 for loc in ranked_locations if loc["category"] == "Low")
            }
            
            logger.info("Parking Impact Score calculation and summary statistics finished successfully.")
            return ranked_locations, summary
            
        except Exception as e:
            logger.error(f"Error occurred during impact score calculations: {str(e)}")
            raise e
