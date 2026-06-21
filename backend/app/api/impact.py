from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.models.impact import ImpactListResponse, ImpactSummaryResponse
from app.api.deps import get_impact_data, get_impact_summary
from app.utils.logger import logger

router = APIRouter()

@router.get("/api/impact", response_model=ImpactListResponse, tags=["Impact Score"])
def get_parking_impact_scores(impact_data: list = Depends(get_impact_data)) -> Any:
    """
    Retrieve precalculated parking impact scores for all junctions, ranked by impact score descending.
    Each location contains violation frequency, peak hour violations, and repeat offender metrics,
    making it directly consumable by dashboard charting libraries like Recharts.
    """
    logger.info("Parking impact score details API called.")
    return {"locations": impact_data}

@router.get("/api/impact/summary", response_model=ImpactSummaryResponse, tags=["Impact Score"])
def get_parking_impact_summary(summary: Dict[str, Any] = Depends(get_impact_summary)) -> Any:
    """
    Retrieve summary metrics of parking impact scores across all junctions,
    including average impact score and counts of locations categorized by severity.
    """
    logger.info("Parking impact summary API called.")
    return summary
