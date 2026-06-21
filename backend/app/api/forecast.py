from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.models.forecast import (
    ForecastListResponse,
    ForecastSummaryResponse,
    ForecastTrendResponse,
    ForecastMapResponse,
)
from app.api.deps import (
    get_forecast_data,
    get_forecast_summary,
    get_forecast_trends,
    get_forecast_map,
)
from app.utils.logger import logger

router = APIRouter(prefix="/api/forecast", tags=["Geospatial Forecast"])


@router.get("", response_model=ForecastListResponse)
def get_forecast_locations(data: list = Depends(get_forecast_data)):
    """
    Returns detailed geospatial parking risk forecast per junction.
    """
    logger.info("API Request: Fetching forecast locations.")
    return {"forecast": data}


@router.get("/summary", response_model=ForecastSummaryResponse)
def get_forecast_summary_data(summary: Dict[str, Any] = Depends(get_forecast_summary)):
    """
    Returns citywide summary metrics for forecasting analysis.
    """
    logger.info("API Request: Fetching forecast summary.")
    return summary


@router.get("/trends", response_model=ForecastTrendResponse)
def get_forecast_trends_data(trends: Dict[str, list] = Depends(get_forecast_trends)):
    """
    Returns daily, weekly, and monthly forecasting trends.
    """
    logger.info("API Request: Fetching forecast trends.")
    return trends


@router.get("/map", response_model=ForecastMapResponse)
def get_forecast_map_data(locations: list = Depends(get_forecast_map)):
    """
    Returns Leaflet GIS map elements weighted by future violations.
    """
    logger.info("API Request: Fetching forecast map data.")
    return {"locations": locations}
