import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.cluster import DBSCAN
from app.core.config import settings
from app.utils.logger import logger
from app.services.hotspot_engine import HotspotEngine

class RecommendationEngine:
    """
    RecommendationEngine analyzes illegal parking hotspots and impact scores
    to prioritize and generate actionable enforcement recommendations.
    """
    
    def __init__(self, eps: float = settings.DBSCAN_EPS, min_samples: int = settings.DBSCAN_MIN_SAMPLES):
        self.eps = eps
        self.min_samples = min_samples

    def determine_recommended_time_window(self, group_df: pd.DataFrame) -> str:
        """
        Finds the 3 consecutive hours circular window with the highest violation counts.
        
        Args:
            group_df (pd.DataFrame): Dataframe slice for a specific junction.
            
        Returns:
            str: Recommended time window in "HH:00-HH:00" format.
        """
        if group_df.empty or 'hour' not in group_df.columns:
            return "08:00-11:00"
            
        # Get count of violations for each hour (0 to 23)
        hour_counts = group_df['hour'].dropna().value_counts().reindex(range(24), fill_value=0)
        
        max_sum = -1
        best_start = 8 # Default start at 8 AM
        
        # Slide window of size 3 (circular sum)
        for h in range(24):
            current_sum = (
                hour_counts[h] + 
                hour_counts[(h + 1) % 24] + 
                hour_counts[(h + 2) % 24]
            )
            if current_sum > max_sum:
                max_sum = current_sum
                best_start = h
                
        end_hour = (best_start + 3) % 24
        return f"{best_start:02d}:00-{end_hour:02d}:00"

    def generate_explanation(self, junction_name: str, priority: str, officers: int, time_window: str, reduction: int) -> str:
        """
        Generates a human-readable, AI-style explanation for the recommendation.
        """
        if priority == "Critical":
            return (f"{junction_name} is currently a Critical zone with extremely high illegal parking activity. "
                    f"Deploying {officers} officers during the peak window of {time_window} is urgently needed "
                    f"and could reduce violations by approximately {reduction}%.")
        elif priority == "High":
            return (f"{junction_name} experiences a high concentration of illegal parking. "
                    f"Deploying {officers} officers between {time_window} is highly recommended "
                    f"to mitigate traffic congestion and reduce violations by {reduction}%.")
        elif priority == "Medium":
            return (f"{junction_name} exhibits moderate illegal parking patterns. "
                    f"Allocating {officers} officer between {time_window} will help manage the flow "
                    f"and reduce parking offenses by {reduction}%.")
        else:
            return (f"{junction_name} shows a lower concentration of violations. "
                    f"Active officer deployment is not currently needed; continuous monitoring "
                    f"during the {time_window} window is recommended to prevent future hotspots.")

    def generate_recommendations(
        self, 
        df: pd.DataFrame, 
        hotspots: List[Dict[str, Any]], 
        impact_data: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Generates ranked recommendations and summary statistics.
        
        Args:
            df (pd.DataFrame): Processed violations dataframe.
            hotspots (List[Dict[str, Any]]): Precomputed hotspots list.
            impact_data (List[Dict[str, Any]]): Precomputed impact score locations.
            
        Returns:
            Tuple[List[Dict[str, Any]], Dict[str, Any]]:
                - List of dicts representing each recommendation, ranked.
                - Dict containing summary statistics of recommendations.
        """
        logger.info("Generating enforcement recommendations...")
        
        if df is None or df.empty or not impact_data:
            logger.warning("Empty input data passed to RecommendationEngine. Returning empty results.")
            return [], {
                "total_recommendations": 0,
                "critical_zones": 0,
                "high_zones": 0,
                "estimated_citywide_reduction": 0
            }
            
        try:
            # 1. Map junctions to hotspots by replicating DBSCAN labels
            # Clean coordinate coordinates
            hotspot_eng = HotspotEngine(self.eps, self.min_samples)
            df_coords = hotspot_eng.clean_coordinates(df)
            
            # Map of junction name to hotspot info
            junction_hotspot_map = {}
            
            if not df_coords.empty:
                # Execute DBSCAN to find labels
                coords_matrix = df_coords[['latitude', 'longitude']].values
                db = DBSCAN(eps=self.eps, min_samples=self.min_samples).fit(coords_matrix)
                df_coords['cluster_label'] = db.labels_
                
                # Group by junction to find dominant cluster
                grouped_coords = df_coords.groupby('junction_name')
                for j_name, group in grouped_coords:
                    cluster_counts = group['cluster_label'].dropna()
                    # Filter out noise label (-1)
                    valid_clusters = cluster_counts[cluster_counts != -1]
                    
                    if not valid_clusters.empty:
                        # Find cluster label with maximum occurrences
                        dominant_label = valid_clusters.value_counts().index[0]
                        # Look up corresponding hotspot severity
                        # cluster_id is dominant_label + 1 (1-based index)
                        target_cluster_id = int(dominant_label) + 1
                        matching_hotspot = next((h for h in hotspots if h["cluster_id"] == target_cluster_id), None)
                        
                        if matching_hotspot:
                            junction_hotspot_map[j_name] = {
                                "severity": matching_hotspot["severity"],
                                "score": 100 if matching_hotspot["severity"] == "Critical" else
                                         75 if matching_hotspot["severity"] == "High" else
                                         50 if matching_hotspot["severity"] == "Medium" else 25
                            }
            
            # 2. Build recommendations list
            recommendations_raw = []
            
            # Group df by junction_name for temporal time window searches
            grouped_df = df.groupby('junction_name')
            
            # Process each location that has impact data
            for loc in impact_data:
                j_name = loc["junction_name"]
                impact_score = loc["impact_score"]
                
                # Check associated hotspot info
                hotspot_info = junction_hotspot_map.get(j_name, {"severity": "Low", "score": 0})
                hotspot_score = hotspot_info["score"]
                
                # Calculate priority score: 0.60 * impact + 0.40 * hotspot
                priority_score = int(round(0.60 * impact_score + 0.40 * hotspot_score))
                
                # Assign Priority Categories
                if priority_score >= 81:
                    priority = "Critical"
                elif priority_score >= 61:
                    priority = "High"
                elif priority_score >= 31:
                    priority = "Medium"
                else:
                    priority = "Low"
                    
                # Determine time window
                j_group = grouped_df.get_group(j_name) if j_name in grouped_df.groups else pd.DataFrame()
                time_window = self.determine_recommended_time_window(j_group)
                
                # Officer Allocation
                officers = 3 if priority == "Critical" else \
                           2 if priority == "High" else \
                           1 if priority == "Medium" else 0 # 0 represents Monitor Only
                           
                # Estimated reductions
                expected_violation_reduction = 40 if priority == "Critical" else \
                                               30 if priority == "High" else \
                                               20 if priority == "Medium" else 10
                                               
                expected_congestion_reduction = 35 if priority == "Critical" else \
                                                25 if priority == "High" else \
                                                15 if priority == "Medium" else 5
                                                
                # Generate explanation
                reason = self.generate_explanation(
                    j_name, priority, officers, time_window, expected_violation_reduction
                )
                
                recommendations_raw.append({
                    "junction_name": j_name,
                    "priority_score": priority_score,
                    "priority": priority,
                    "officers": officers,
                    "recommended_time_window": time_window,
                    "expected_violation_reduction": expected_violation_reduction,
                    "expected_congestion_reduction": expected_congestion_reduction,
                    "reason": reason
                })
                
            # Sort recommendations by priority_score descending (and violations/priority secondary for stable sorting)
            recommendations_raw.sort(key=lambda x: -x["priority_score"])
            
            # 3. Assign recommendation ranks
            ranked_recommendations = []
            for rank, rec in enumerate(recommendations_raw, start=1):
                rec["rank"] = rank
                ranked_recommendations.append(rec)
                
            # 4. Generate summary statistics
            total_recommendations = len(ranked_recommendations)
            critical_zones = sum(1 for r in ranked_recommendations if r["priority"] == "Critical")
            high_zones = sum(1 for r in ranked_recommendations if r["priority"] == "High")
            
            # Citywide estimated reduction is the average violation reduction across all zones
            if total_recommendations > 0:
                avg_reduction = np.mean([r["expected_violation_reduction"] for r in ranked_recommendations])
                estimated_citywide_reduction = int(round(avg_reduction))
            else:
                estimated_citywide_reduction = 0
                
            summary = {
                "total_recommendations": total_recommendations,
                "critical_zones": critical_zones,
                "high_zones": high_zones,
                "estimated_citywide_reduction": estimated_citywide_reduction
            }
            
            logger.info("Enforcement recommendations successfully generated.")
            return ranked_recommendations, summary
            
        except Exception as e:
            logger.error(f"Error during recommendation engine execution: {str(e)}")
            raise e
