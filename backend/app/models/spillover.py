from pydantic import BaseModel
from typing import List

class SpilloverDetail(BaseModel):
    hotspot_id: str
    junction_name: str
    latitude: float
    longitude: float
    spillover_score: float
    nearby_violation_density: int
    hotspot_growth_rate: float
    impact_score: float
    risk_radius_m: int
    secondary_zones: List[str]

class SpilloverListResponse(BaseModel):
    spillovers: List[SpilloverDetail]

class SpilloverSummaryResponse(BaseModel):
    total_spillover_zones: int
    critical_spillovers: int
    average_spillover_score: float
    max_risk_radius_m: int

class SpilloverMapDetail(BaseModel):
    id: str
    type: str  # "primary" or "secondary"
    latitude: float
    longitude: float
    radius: int
    score: float
    label: str

class SpilloverMapResponse(BaseModel):
    zones: List[SpilloverMapDetail]
