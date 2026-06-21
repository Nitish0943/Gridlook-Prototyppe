import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.cluster import DBSCAN
from app.core.config import settings
from app.utils.logger import logger
from app.services.statistics import StatisticsService

class HotspotEngine:
    """
    Geospatial Hotspot Engine using DBSCAN to identify and rank illegal parking hotspots.
    """
    def __init__(self, eps: float = settings.DBSCAN_EPS, min_samples: int = settings.DBSCAN_MIN_SAMPLES):
        self.eps = eps
        self.min_samples = min_samples

    def clean_coordinates(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans coordinate columns by removing missing, null, or out-of-range latitude/longitude pairs.
        
        Args:
            df (pd.DataFrame): Input dataframe containing latitude/longitude columns.
            
        Returns:
            pd.DataFrame: Cleaned dataframe.
        """
        logger.info("Cleaning coordinate columns before clustering...")
        
        if 'latitude' not in df.columns or 'longitude' not in df.columns:
            logger.error("Required coordinate columns 'latitude' or 'longitude' are missing.")
            return pd.DataFrame()
            
        # Drop rows where coordinates are null
        df_clean = df.dropna(subset=['latitude', 'longitude']).copy()
        
        # Ensure numerical types
        df_clean['latitude'] = pd.to_numeric(df_clean['latitude'], errors='coerce')
        df_clean['longitude'] = pd.to_numeric(df_clean['longitude'], errors='coerce')
        df_clean = df_clean.dropna(subset=['latitude', 'longitude'])
        
        # Bounding check for valid coordinates: latitude [-90, 90], longitude [-180, 180], and discard exactly (0.0, 0.0)
        valid_coords = (
            (df_clean['latitude'] >= -90.0) & (df_clean['latitude'] <= 90.0) &
            (df_clean['longitude'] >= -180.0) & (df_clean['longitude'] <= 180.0) &
            (df_clean['latitude'] != 0.0) & (df_clean['longitude'] != 0.0)
        )
        df_filtered = df_clean[valid_coords].copy()
        
        logger.info(f"Coordinate cleaning done. Rows before: {len(df)}, Rows after: {len(df_filtered)}")
        return df_filtered

    def calculate_severity(self, count: int) -> str:
        """
        Categorizes hotspot severity based on violation counts.
        
        Severity categories:
            0-50 violations -> Low
            51-200 -> Medium
            201-500 -> High
            500+ -> Critical
        """
        if count >= 501:
            return "Critical"
        elif count >= 21:  # Note: The prompt says "201-500 -> High", but wait, "51-200 -> Medium".
            # Wait, let's follow the prompt exactly:
            # 0-50 violations -> Low
            # 51-200 -> Medium
            # 201-500 -> High
            # 500+ -> Critical (meaning >= 501 or >= 500)
            # Let's write standard threshold logic:
            if count > 500:
                return "Critical"
            elif count >= 201:
                return "High"
            elif count >= 51:
                return "Medium"
            else:
                return "Low"
        return "Low"

    def detect_hotspots(self, df: pd.DataFrame) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        """
        Executes DBSCAN clustering to locate illegal parking hotspots and computes metadata metrics.
        
        Args:
            df (pd.DataFrame): Dataframe.
            
        Returns:
            Tuple[List[Dict[str, Any]], Dict[str, int]]:
                - List of ranked hotspots containing cluster_id, rank, lat/lon, count, severity, and unique counts.
                - Summary analytics dict.
        """
        logger.info(f"Starting DBSCAN hotspot detection (eps={self.eps}, min_samples={self.min_samples})...")
        
        df_coords = self.clean_coordinates(df)
        if df_coords.empty:
            logger.warning("No valid coordinates available for clustering. Returning empty hotspot results.")
            return [], {
                "total_hotspots": 0,
                "critical_hotspots": 0,
                "high_hotspots": 0,
                "medium_hotspots": 0,
                "low_hotspots": 0
            }
            
        try:
            # Prepare coord matrix
            coords = df_coords[['latitude', 'longitude']].values
            
            # Execute DBSCAN clustering
            db = DBSCAN(eps=self.eps, min_samples=self.min_samples).fit(coords)
            labels = db.labels_
            
            df_coords['cluster_label'] = labels
            
            # Outliers are labeled -1; discard them for hotspot ranking
            df_clusters = df_coords[df_coords['cluster_label'] != -1]
            unique_labels = set(labels) - {-1}
            
            logger.info(f"DBSCAN finished. Identified {len(unique_labels)} hotspot clusters.")
            
            hotspots = []
            
            for label in unique_labels:
                cluster_df = df_clusters[df_clusters['cluster_label'] == label]
                
                # Compute center coordinates (centroid mean)
                center_lat = float(cluster_df['latitude'].mean())
                center_lon = float(cluster_df['longitude'].mean())
                
                # Aggregate metrics
                violation_count = len(cluster_df)
                unique_vehicles = int(cluster_df['vehicle_number'].dropna().nunique())
                unique_police_stations = int(cluster_df['police_station'].dropna().nunique())
                
                # Aggregate and parse violation types
                violation_types = []
                for val in cluster_df['violation_type'].dropna():
                    violation_types.extend(StatisticsService.parse_violation_types(val))
                unique_violation_types_count = int(pd.Series(violation_types).nunique())
                
                severity = self.calculate_severity(violation_count)

                # Extract representative junction and police station (mode of values)
                representative_junction = ""
                if 'junction_name' in cluster_df.columns:
                    valid_juncs = cluster_df['junction_name'].dropna()
                    valid_juncs = valid_juncs[(valid_juncs != 'No Junction') & (valid_juncs != '')]
                    if not valid_juncs.empty:
                        representative_junction = str(valid_juncs.mode().iloc[0])

                representative_station = ""
                if 'police_station' in cluster_df.columns:
                    valid_stats = cluster_df['police_station'].dropna()
                    valid_stats = valid_stats[valid_stats != '']
                    if not valid_stats.empty:
                        representative_station = str(valid_stats.mode().iloc[0])
                
                hotspots.append({
                    "cluster_id": int(label) + 1,  # Convert to 1-based index
                    "latitude": round(center_lat, 5),
                    "longitude": round(center_lon, 5),
                    "violation_count": violation_count,
                    "severity": severity,
                    "unique_vehicles": unique_vehicles,
                    "unique_violation_types": unique_violation_types_count,
                    "police_stations": unique_police_stations,
                    "junction_name": representative_junction,
                    "police_station": representative_station
                })
                
            # Sort hotspots by violation count descending
            hotspots.sort(key=lambda x: x['violation_count'], reverse=True)
            
            # Assign ranks based on sorted counts
            for rank, hs in enumerate(hotspots, start=1):
                hs['rank'] = rank
                
            # Generate summary metrics
            summary = {
                "total_hotspots": len(hotspots),
                "critical_hotspots": sum(1 for h in hotspots if h['severity'] == "Critical"),
                "high_hotspots": sum(1 for h in hotspots if h['severity'] == "High"),
                "medium_hotspots": sum(1 for h in hotspots if h['severity'] == "Medium"),
                "low_hotspots": sum(1 for h in hotspots if h['severity'] == "Low")
            }
            
            logger.info("Hotspot extraction, ranking, and severity categorization complete.")
            return hotspots, summary
            
        except Exception as e:
            logger.error(f"Critical failure during DBSCAN hotspot execution: {str(e)}")
            raise e
