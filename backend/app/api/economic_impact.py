from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.models.economic_impact import (
    EconomicImpactListResponse,
    EconomicImpactSummaryResponse,
    EconomicTrendResponse,
    EconomicMapResponse,
)
from app.api.deps import (
    get_economic_impact_data,
    get_economic_impact_summary,
    get_economic_impact_trends,
    get_economic_impact_map,
)
from app.utils.logger import logger

router = APIRouter(prefix="/api/economic-impact", tags=["Economic Impact"])


@router.get("", response_model=EconomicImpactListResponse)
def get_economic_impact_locations(data: list = Depends(get_economic_impact_data)):
    """
    Returns detailed economic impact analysis per junction.
    """
    logger.info("API Request: Fetching economic impact locations list.")
    return {"locations": data}


@router.get("/summary", response_model=EconomicImpactSummaryResponse)
def get_economic_impact_summary_data(summary: Dict[str, Any] = Depends(get_economic_impact_summary)):
    """
    Returns citywide economic impact aggregates (daily, monthly, yearly loss).
    """
    logger.info("API Request: Fetching economic impact summary.")
    return summary


@router.get("/trends", response_model=EconomicTrendResponse)
def get_economic_impact_trends_data(trends: list = Depends(get_economic_impact_trends)):
    """
    Returns historical weekly economic loss trend series.
    """
    logger.info("API Request: Fetching economic impact trends.")
    return {"trends": trends}


@router.get("/map", response_model=EconomicMapResponse)
def get_economic_impact_map_data(locations: list = Depends(get_economic_impact_map)):
    """
    Returns Leaflet GIS coordinates and radii weighted by economic loss.
    """
    logger.info("API Request: Fetching economic impact map telemetry.")
    return {"locations": locations}
