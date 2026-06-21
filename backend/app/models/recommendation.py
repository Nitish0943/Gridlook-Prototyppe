from pydantic import BaseModel, Field
from typing import List

class RecommendationDetail(BaseModel):
    rank: int = Field(..., description="The priority rank of this recommendation (1 = highest priority)")
    junction_name: str = Field(..., description="The name of the junction being prioritized")
    priority_score: int = Field(..., description="Normalized priority score (0-100)", examples=[95])
    priority: str = Field(..., description="Priority category (Low, Medium, High, Critical)", examples=["Critical"])
    officers: int = Field(..., description="Number of recommended officers to deploy (0-3)", examples=[3])
    recommended_time_window: str = Field(..., description="Recommended time window for deployment", examples=["08:00-11:00"])
    expected_violation_reduction: int = Field(..., description="Estimated violation reduction percentage", examples=[40])
    expected_congestion_reduction: int = Field(..., description="Estimated congestion reduction percentage", examples=[35])
    reason: str = Field(..., description="Detailed explanation reasoning the recommendation")

class RecommendationsListResponse(BaseModel):
    recommendations: List[RecommendationDetail] = Field(..., description="Ranked list of enforcement recommendations")

class RecommendationsSummaryResponse(BaseModel):
    total_recommendations: int = Field(..., description="Total count of junctions recommended for action")
    critical_zones: int = Field(..., description="Count of Critical priority zones")
    high_zones: int = Field(..., description="Count of High priority zones")
    estimated_citywide_reduction: int = Field(..., description="Estimated citywide violation reduction percentage", examples=[28])
