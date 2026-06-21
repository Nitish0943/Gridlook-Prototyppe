from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.models.capacity_loss import CapacityLossListResponse, CapacityLossSummaryResponse, CapacityLossMapResponse
from app.api.deps import get_capacity_loss_data, get_capacity_loss_summary, get_capacity_loss_map
from app.utils.logger import logger

router = APIRouter(prefix="/api/capacity-loss", tags=["Road Capacity Loss"])


@router.get("", response_model=CapacityLossListResponse)
def get_capacity_loss_locations(data: list = Depends(get_capacity_loss_data)):
    """
    Returns the computed road capacity loss metrics for all junctions.
    """
    logger.info("API Request: Fetching capacity loss data.")
    return {"locations": data}


@router.get("/summary", response_model=CapacityLossSummaryResponse)
def get_capacity_loss_summary_data(summary: Dict[str, Any] = Depends(get_capacity_loss_summary)):
    """
    Returns summary statistics for road capacity loss analysis.
    """
    logger.info("API Request: Fetching capacity loss summary.")
    return summary


@router.get("/map", response_model=CapacityLossMapResponse)
def get_capacity_loss_map_data(locations: list = Depends(get_capacity_loss_map)):
    """
    Returns map-ready data for the road capacity loss GIS visualization.
    """
    logger.info("API Request: Fetching capacity loss map data.")
    return {"locations": locations}
