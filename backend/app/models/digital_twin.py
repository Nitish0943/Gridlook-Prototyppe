from pydantic import BaseModel, Field
from typing import List

class SimulateRequest(BaseModel):
    reduction_percentage: int = Field(
        ..., 
        description="The simulated percentage reduction in illegal parking violations (0-100)",
        ge=0,
        le=100,
        examples=[30]
    )

class CitySummary(BaseModel):
    violations_before: int = Field(..., description="Total citywide violations before simulation")
    violations_after: int = Field(..., description="Projected citywide violations after simulation")
    impact_before: int = Field(..., description="Average traffic impact score before simulation")
    impact_after: int = Field(..., description="Projected average traffic impact score after simulation")
    congestion_before: int = Field(..., description="Average congestion proxy before simulation")
    congestion_after: int = Field(..., description="Projected average congestion proxy after simulation")
    improvement_percentage: int = Field(..., description="Overall projected citywide improvement percentage", examples=[30])

class HotspotSimulationDetail(BaseModel):
    junction_name: str = Field(..., description="The name of the junction being simulated")
    before_violations: int = Field(..., description="Junction violations count before simulation")
    after_violations: int = Field(..., description="Projected violations count after simulation")
    before_impact: int = Field(..., description="Junction impact score before simulation")
    after_impact: int = Field(..., description="Projected impact score after simulation")
    improvement_percentage: int = Field(..., description="Simulated improvement percentage", examples=[30])

class SimulateResponse(BaseModel):
    city_summary: CitySummary = Field(..., description="City-wide aggregated simulation metrics")
    hotspots: List[HotspotSimulationDetail] = Field(..., description="Hotspot-level comparative simulation results")
    insight: str = Field(..., description="AI-generated recommendation/insight based on the simulation")

class ScenarioDetail(BaseModel):
    scenario: str = Field(..., description="Scenario label (e.g. '10%')", examples=["10%"])
    impact_reduction: int = Field(..., description="Projected reduction in traffic impact score", examples=[10])
