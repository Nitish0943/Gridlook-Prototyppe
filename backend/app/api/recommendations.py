from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.models.recommendation import RecommendationsListResponse, RecommendationsSummaryResponse
from app.api.deps import get_recommendations, get_recommendations_summary
from app.utils.logger import logger

router = APIRouter()

@router.get("/api/recommendations", response_model=RecommendationsListResponse, tags=["Recommendations"])
def get_enforcement_recommendations(recommendations: list = Depends(get_recommendations)) -> Any:
    """
    Retrieve precalculated officer deployment and enforcement recommendations, ranked by priority score descending.
    Each recommendation is table-ready and contains junction name, priority category, recommended officers count,
    recommended time window, expected violation/congestion reductions, priority score, and reason.
    """
    logger.info("Enforcement recommendations API called.")
    return {"recommendations": recommendations}

@router.get("/api/recommendations/summary", response_model=RecommendationsSummaryResponse, tags=["Recommendations"])
def get_enforcement_recommendations_summary(summary: Dict[str, int] = Depends(get_recommendations_summary)) -> Any:
    """
    Retrieve summary analytics of recommendations, including total recommendation count, critical/high zone counts,
    and estimated citywide violation reduction.
    """
    logger.info("Enforcement recommendations summary API called.")
    return summary
