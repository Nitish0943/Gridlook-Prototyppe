from fastapi import APIRouter, Depends
from typing import Dict, Any, List

from app.models.peak_hours import (
    PeakHourResponse,
    JunctionPeakDetail,
    PeakHourSummaryResponse,
)
from app.api.deps import (
    get_peak_hours,
    get_junction_peak_hours,
    get_peak_hours_summary,
)
from app.utils.logger import logger

router = APIRouter(prefix="/api/peak-hours", tags=["Peak Hours Prediction"])


@router.get("", response_model=PeakHourResponse)
def get_peak_hours_data(data: list = Depends(get_peak_hours)):
    """
    Returns predicted violations, risk scores, and risk classifications for the next 24 hours.
    """
    logger.info("API Request: Fetching peak hours predictions.")
    return {"peak_hours": data}


@router.get("/junctions", response_model=List[JunctionPeakDetail])
def get_junction_peaks(data: list = Depends(get_junction_peak_hours)):
    """
    Returns predicted peak hour and violation volume for each junction.
    """
    logger.info("API Request: Fetching junction peak hours.")
    return data


@router.get("/summary", response_model=PeakHourSummaryResponse)
def get_peak_summary(summary: Dict[str, Any] = Depends(get_peak_hours_summary)):
    """
    Returns citywide summary metrics for peak hour analysis.
    """
    logger.info("API Request: Fetching peak hour summary.")
    return summary
