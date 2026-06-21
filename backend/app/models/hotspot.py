from pydantic import BaseModel, Field
from typing import List, Optional

class HotspotDetail(BaseModel):
    cluster_id: int = Field(..., description="The unique ID of the clustered hotspot")
    rank: int = Field(..., description="The severity rank of this hotspot (1 = highest violation count)")
    latitude: float = Field(..., description="Mean latitude coordinate of the hotspot center")
    longitude: float = Field(..., description="Mean longitude coordinate of the hotspot center")
    violation_count: int = Field(..., description="Total number of violations logged in this hotspot")
    severity: str = Field(..., description="Severity category (Low, Medium, High, Critical)")
    unique_vehicles: int = Field(..., description="Count of unique vehicle numbers involved")
    unique_violation_types: int = Field(..., description="Count of unique violation categories")
    police_stations: int = Field(..., description="Count of unique police stations overseeing this hotspot area")
    junction_name: Optional[str] = Field(None, description="Representative junction name for the hotspot area")
    police_station: Optional[str] = Field(None, description="Representative police station name for the hotspot area")

class HotspotsListResponse(BaseModel):
    hotspots: List[HotspotDetail] = Field(..., description="List of all detected illegal parking hotspots, ranked")

class HotspotsSummaryResponse(BaseModel):
    total_hotspots: int = Field(..., description="Total count of hotspots detected")
    critical_hotspots: int = Field(..., description="Count of Critical hotspots (>500 violations)")
    high_hotspots: int = Field(..., description="Count of High hotspots (201-500 violations)")
    medium_hotspots: int = Field(..., description="Count of Medium hotspots (51-200 violations)")
    low_hotspots: int = Field(..., description="Count of Low hotspots (0-50 violations)")

class MapViolationDetail(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate of the violation")
    longitude: float = Field(..., description="Longitude coordinate of the violation")
    violation_type: str = Field(..., description="Type of violation")
    junction_name: str = Field(..., description="Name of the junction")
    police_station: str = Field(..., description="Name of the police station")
    severity: str = Field(..., description="Severity level")

class MapDataResponse(BaseModel):
    hotspots: List[HotspotDetail] = Field(..., description="Hotspots data")
    heatmap: List[List[float]] = Field(..., description="Heatmap data [[lat, lng, weight], ...]")
    violations: List[MapViolationDetail] = Field(..., description="Downsampled violations for clustering")
