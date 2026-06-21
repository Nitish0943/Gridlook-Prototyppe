from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.models.spillover import SpilloverListResponse, SpilloverSummaryResponse, SpilloverMapResponse
from app.api.deps import get_spillovers, get_spillover_summary, get_spillover_map
from app.utils.logger import logger

router = APIRouter(prefix="/api/spillover", tags=["Spillover Analysis"])

@router.get("", response_model=SpilloverListResponse)
def get_spillover_data(spillovers: list = Depends(get_spillovers)):
    """
    Returns the computed spillover parking zones and their scores.
    """
    logger.info("API Request: Fetching spillover data.")
    return {"spillovers": spillovers}

@router.get("/summary", response_model=SpilloverSummaryResponse)
def get_spillover_summary_data(summary: Dict[str, Any] = Depends(get_spillover_summary)):
    """
    Returns summary statistics for the spillover analysis.
    """
    logger.info("API Request: Fetching spillover summary.")
    return summary

@router.get("/map", response_model=SpilloverMapResponse)
def get_spillover_map_data(zones: list = Depends(get_spillover_map)):
    """
    Returns data for the interactive spillover GIS map.
    """
    logger.info("API Request: Fetching spillover map data.")
    return {"zones": zones}
