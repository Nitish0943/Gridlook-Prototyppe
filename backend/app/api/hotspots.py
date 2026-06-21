from fastapi import APIRouter, Depends
from typing import Dict, Any, List
import pandas as pd
from app.models.hotspot import HotspotsListResponse, HotspotsSummaryResponse, MapDataResponse, MapViolationDetail
from app.api.deps import get_hotspots, get_hotspots_summary, get_df, get_impact_data
from app.utils.logger import logger

router = APIRouter()

@router.get("/api/hotspots", response_model=HotspotsListResponse, tags=["Hotspots"])
def get_parking_hotspots(hotspots: list = Depends(get_hotspots)) -> Any:
    """
    Retrieve detected illegal parking hotspots, ranked by violation count descending.
    Each hotspot contains centroid latitude/longitude, total violations, and severity,
    making it directly consumable by map frontends like Mapbox, Leaflet, and react-map-gl.
    """
    logger.info("Geospatial parking hotspots API called.")
    return {"hotspots": hotspots}

@router.get("/api/hotspots/summary", response_model=HotspotsSummaryResponse, tags=["Hotspots"])
def get_parking_hotspots_summary(summary: Dict[str, int] = Depends(get_hotspots_summary)) -> Any:
    """
    Retrieve summary metrics of hotspots categorized by severity levels.
    """
    logger.info("Parking hotspots summary API called.")
    return summary

@router.get("/api/map-data", response_model=MapDataResponse, tags=["Hotspots"])
def get_map_telemetry_data(
    hotspots: list = Depends(get_hotspots),
    df: pd.DataFrame = Depends(get_df),
    impact_data: list = Depends(get_impact_data)
) -> Any:
    """
    Retrieve optimized GIS map data combining hotspots, downsampled individual violations for clustering,
    and heatmap coordinate lists to enable smooth Leaflet visualization.
    """
    logger.info("GIS Map Data telemetry endpoint called.")
    
    # 1. Map junction name to impact category for severity mapping
    junction_severity_map = {loc["junction_name"]: loc["category"] for loc in impact_data}
    
    # 2. Downsample violations for smooth Leaflet rendering (max 5,000 points)
    sample_size = min(5000, len(df))
    sampled_df = df.sample(n=sample_size, random_state=42).copy()
    
    violations_list = []
    heatmap_list = []
    
    # Pre-clean NaN values to avoid serialization errors
    sampled_df['latitude'] = sampled_df['latitude'].fillna(0.0)
    sampled_df['longitude'] = sampled_df['longitude'].fillna(0.0)
    sampled_df['violation_type'] = sampled_df['violation_type'].fillna("WRONG PARKING")
    sampled_df['junction_name'] = sampled_df['junction_name'].fillna("No Junction")
    sampled_df['police_station'] = sampled_df['police_station'].fillna("Unknown")
    
    for _, row in sampled_df.iterrows():
        lat = float(row['latitude'])
        lng = float(row['longitude'])
        
        # Discard zero coordinate markers
        if lat == 0.0 or lng == 0.0:
            continue
            
        j_name = str(row['junction_name'])
        severity = junction_severity_map.get(j_name, "Low")
        
        violations_list.append(MapViolationDetail(
            latitude=lat,
            longitude=lng,
            violation_type=str(row['violation_type']),
            junction_name=j_name,
            police_station=str(row['police_station']),
            severity=severity
        ))
        
        # Heatmap point format: [lat, lng, weight]
        heatmap_list.append([lat, lng, 1.0])
        
    return {
        "hotspots": hotspots,
        "violations": violations_list,
        "heatmap": heatmap_list
    }
