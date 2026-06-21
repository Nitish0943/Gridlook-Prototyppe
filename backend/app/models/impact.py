from pydantic import BaseModel, Field
from typing import List

class LocationImpactDetail(BaseModel):
    rank: int = Field(..., description="The impact rank of this location (1 = highest impact score)")
    junction_name: str = Field(..., description="Name of the junction/location")
    impact_score: int = Field(..., description="Calculated and normalized impact score (0-100)")
    category: str = Field(..., description="Impact category (Low, Medium, High, Critical)")
    violations: int = Field(..., description="Total violations at this location")
    peak_hour_violations: int = Field(..., description="Violations occurring during peak hours")
    repeat_offenders: int = Field(..., description="Count of vehicles appearing multiple times")

class ImpactListResponse(BaseModel):
    locations: List[LocationImpactDetail] = Field(..., description="List of ranked location impact details")

class ImpactSummaryResponse(BaseModel):
    total_locations: int = Field(..., description="Total number of evaluated locations")
    average_impact_score: float = Field(..., description="Average impact score across all locations")
    critical_locations: int = Field(..., description="Count of locations categorized as Critical (81-100)")
    high_locations: int = Field(..., description="Count of locations categorized as High (61-80)")
    medium_locations: int = Field(..., description="Count of locations categorized as Medium (31-60)")
    low_locations: int = Field(..., description="Count of locations categorized as Low (0-30)")
