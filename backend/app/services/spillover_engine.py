import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.preprocessing import MinMaxScaler
from app.utils.logger import logger
import math

class SpilloverEngine:
    """
    Spillover Parking Analysis Engine.
    Detects parking spillover effects when major hotspots become saturated and illegal parking spreads to nearby roads.
    """
    
    def __init__(self, risk_radius_m: int = 1000):
        self.risk_radius_m = risk_radius_m
        
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on the earth in meters.
        """
        R = 6371000  # radius of Earth in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    def calculate_spillover(self, df: pd.DataFrame, hotspots: List[Dict[str, Any]], impact_data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[Dict[str, Any]]]:
        """
        Calculates spillover metrics for hotspots.
        Returns:
            spillovers: List of SpilloverDetail dicts
            summary: Summary dict
            map_data: List of SpilloverMapDetail dicts
        """
        logger.info("Initializing Spillover Engine...")
        if df is None or df.empty or not hotspots:
            logger.warning("Empty dataframe or no hotspots. Returning empty spillover results.")
            return [], {"total_spillover_zones": 0, "critical_spillovers": 0, "average_spillover_score": 0.0, "max_risk_radius_m": self.risk_radius_m}, []
            
        try:
            # Clean df coordinates and parse datetime
            df_coords = df.dropna(subset=['latitude', 'longitude']).copy()
            df_coords['latitude'] = pd.to_numeric(df_coords['latitude'], errors='coerce')
            df_coords['longitude'] = pd.to_numeric(df_coords['longitude'], errors='coerce')
            df_coords = df_coords.dropna(subset=['latitude', 'longitude'])
            
            if 'created_datetime' in df_coords.columns:
                df_coords['created_datetime'] = pd.to_datetime(df_coords['created_datetime'], errors='coerce')
                
            impact_map = {item['junction_name']: item['impact_score'] for item in impact_data if item.get('junction_name')}
            
            # Map severity to a numerical value for score calculation
            severity_map = {"Low": 25, "Medium": 50, "High": 75, "Critical": 100}
            
            raw_spillovers = []
            map_data = []
            
            # Get unique junctions for secondary zone mapping
            df_junctions = df_coords.dropna(subset=['junction_name']).copy()
            df_junctions = df_junctions[df_junctions['junction_name'] != 'No Junction']
            # Find center of each junction by average lat/lon
            junction_centers = df_junctions.groupby('junction_name').agg({'latitude': 'mean', 'longitude': 'mean'}).reset_index()
            junction_list = junction_centers.to_dict('records')

            for hotspot in hotspots:
                h_lat = hotspot['latitude']
                h_lon = hotspot['longitude']
                h_junction = hotspot.get('junction_name', '')
                
                # 1. Calculate distance from all points to this hotspot center
                # Use vectorized haversine-like calculation for speed on df_coords
                # For simplicity in pure python/pandas:
                lats = np.radians(df_coords['latitude'].values)
                lons = np.radians(df_coords['longitude'].values)
                h_lat_rad = math.radians(h_lat)
                h_lon_rad = math.radians(h_lon)
                
                dlon = lons - h_lon_rad
                dlat = lats - h_lat_rad
                
                a = np.sin(dlat/2.0)**2 + np.cos(lats) * math.cos(h_lat_rad) * np.sin(dlon/2.0)**2
                c = 2 * np.arcsin(np.sqrt(a))
                distances = 6371000 * c
                
                # Nearby violations
                nearby_mask = distances <= self.risk_radius_m
                df_nearby = df_coords[nearby_mask]
                nearby_violation_density = len(df_nearby)
                
                # Growth rate
                growth_rate = 1.0
                if 'created_datetime' in df_nearby.columns and not df_nearby.empty:
                    df_nearby = df_nearby.sort_values('created_datetime').dropna(subset=['created_datetime'])
                    if not df_nearby.empty:
                        midpoint = df_nearby['created_datetime'].iloc[len(df_nearby)//2]
                        first_half = len(df_nearby[df_nearby['created_datetime'] <= midpoint])
                        second_half = len(df_nearby[df_nearby['created_datetime'] > midpoint])
                        if first_half > 0:
                            growth_rate = second_half / first_half
                        else:
                            growth_rate = 1.0
                            
                # Hotspot severity
                severity_score = severity_map.get(hotspot.get('severity', 'Low'), 25)
                
                # Impact Score
                impact_score = impact_map.get(h_junction, 0) if h_junction else 0
                
                # Find secondary zones
                secondary_zones = []
                for j in junction_list:
                    if j['junction_name'] != h_junction:
                        dist = self.haversine_distance(h_lat, h_lon, j['latitude'], j['longitude'])
                        if dist <= self.risk_radius_m:
                            secondary_zones.append(j['junction_name'])
                            
                # Raw spillover score
                # spillover_score (40% hotspot severity, 30% nearby violation density, 20% impact score, 10% hotspot growth rate)
                # We need to normalize density and growth later, but let's compute raw combined score first
                raw_score = (0.40 * severity_score) + (0.20 * impact_score)
                
                raw_spillovers.append({
                    "hotspot_id": str(hotspot.get('cluster_id')),
                    "junction_name": h_junction if h_junction else f"Hotspot {hotspot.get('cluster_id')}",
                    "latitude": h_lat,
                    "longitude": h_lon,
                    "nearby_violation_density": nearby_violation_density,
                    "hotspot_growth_rate": growth_rate,
                    "raw_score_base": raw_score,
                    "impact_score": impact_score,
                    "risk_radius_m": self.risk_radius_m,
                    "secondary_zones": secondary_zones[:5] # limit to 5
                })

            if not raw_spillovers:
                return [], {"total_spillover_zones": 0, "critical_spillovers": 0, "average_spillover_score": 0.0, "max_risk_radius_m": self.risk_radius_m}, []

            # Normalize density and growth to 0-100 to add to raw_score
            densities = np.array([s['nearby_violation_density'] for s in raw_spillovers]).reshape(-1, 1)
            growths = np.array([s['hotspot_growth_rate'] for s in raw_spillovers]).reshape(-1, 1)
            
            scaler = MinMaxScaler(feature_range=(0, 100))
            norm_densities = scaler.fit_transform(densities).flatten() if len(densities) > 1 else np.array([50.0]*len(densities))
            norm_growths = scaler.fit_transform(growths).flatten() if len(growths) > 1 else np.array([50.0]*len(growths))
            
            final_spillovers = []
            for i, s in enumerate(raw_spillovers):
                final_score = s['raw_score_base'] + (0.30 * norm_densities[i]) + (0.10 * norm_growths[i])
                # Ensure it's between 0 and 100
                final_score = max(0, min(100, final_score))
                
                final_spillovers.append({
                    "hotspot_id": s['hotspot_id'],
                    "junction_name": s['junction_name'],
                    "latitude": s['latitude'],
                    "longitude": s['longitude'],
                    "spillover_score": round(final_score, 1),
                    "nearby_violation_density": s['nearby_violation_density'],
                    "hotspot_growth_rate": round(s['hotspot_growth_rate'], 2),
                    "impact_score": s['impact_score'],
                    "risk_radius_m": s['risk_radius_m'],
                    "secondary_zones": s['secondary_zones']
                })
                
                # Add to map data
                map_data.append({
                    "id": s['hotspot_id'],
                    "type": "primary",
                    "latitude": s['latitude'],
                    "longitude": s['longitude'],
                    "radius": self.risk_radius_m,
                    "score": round(final_score, 1),
                    "label": s['junction_name']
                })
                # Add secondary zones as secondary points in map data
                # To avoid duplicating secondary zones on map, we could just add them if not present.
                # Here we just add them as type="secondary"
                for sec in s['secondary_zones']:
                    # Find coordinates of this secondary zone
                    sec_junc = next((j for j in junction_list if j['junction_name'] == sec), None)
                    if sec_junc:
                        map_data.append({
                            "id": f"sec_{s['hotspot_id']}_{sec}",
                            "type": "secondary",
                            "latitude": sec_junc['latitude'],
                            "longitude": sec_junc['longitude'],
                            "radius": 100,  # Smaller radius for secondary
                            "score": round(final_score * 0.7, 1), # Inherit partial score
                            "label": sec
                        })
            
            # Sort final spillovers by score DESC
            final_spillovers.sort(key=lambda x: x['spillover_score'], reverse=True)
            
            # De-duplicate map data based on id
            unique_map_data = {item['id']: item for item in map_data}.values()
            
            # Compute summary
            total_spillover_zones = len(final_spillovers)
            critical_spillovers = sum(1 for s in final_spillovers if s['spillover_score'] >= 80)
            avg_score = float(np.mean([s['spillover_score'] for s in final_spillovers])) if total_spillover_zones > 0 else 0.0
            
            summary = {
                "total_spillover_zones": total_spillover_zones,
                "critical_spillovers": critical_spillovers,
                "average_spillover_score": round(avg_score, 1),
                "max_risk_radius_m": self.risk_radius_m
            }
            
            logger.info("Spillover calculations completed successfully.")
            return final_spillovers, summary, list(unique_map_data)
            
        except Exception as e:
            logger.error(f"Error computing spillover metrics: {str(e)}")
            raise e
