from fastapi import APIRouter, Depends, Request
import pandas as pd
from typing import Any, Dict
from app.models.schemas import HealthResponse, StatsResponse, DatasetInfoResponse
from app.api.deps import get_df, get_stats
from app.utils.logger import logger

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["System"])
def health_check(request: Request) -> Any:
    """
    System health check. Verifies if the dataset is successfully loaded and parsed in memory.
    """
    logger.info("Health check endpoint called.")
    dataset_loaded = hasattr(request.app.state, "df") and request.app.state.df is not None
    return {
        "status": "healthy",
        "dataset_loaded": dataset_loaded
    }

@router.get("/api/stats", response_model=StatsResponse, tags=["Analytics"])
def get_analytics_stats(stats: Dict[str, Any] = Depends(get_stats)) -> Any:
    """
    Get precalculated summary analytics stats including total violations, police stations, junctions, and top violation types.
    """
    logger.info("Analytics stats endpoint called.")
    return stats

@router.get("/api/dataset-info", response_model=DatasetInfoResponse, tags=["Analytics"])
def get_dataset_info(df: pd.DataFrame = Depends(get_df)) -> Any:
    """
    Get detailed information about the dataset structure, including total rows, column list, and the date range.
    """
    logger.info("Dataset info endpoint called.")
    
    # Retrieve columns list
    columns = list(df.columns)
    
    # Retrieve row count
    rows_count = len(df)
    
    # Extract min and max dates
    start_date = ""
    end_date = ""
    
    if 'created_datetime' in df.columns:
        valid_dates = df['created_datetime'].dropna()
        if not valid_dates.empty:
            start_date = valid_dates.min().strftime("%Y-%m-%d %H:%M:%S")
            end_date = valid_dates.max().strftime("%Y-%m-%d %H:%M:%S")
            
    return {
        "columns": columns,
        "rows": rows_count,
        "date_range": {
            "start": start_date,
            "end": end_date
        }
    }
