from fastapi import APIRouter, Depends
from typing import List, Any
import pandas as pd
from app.models.digital_twin import SimulateRequest, SimulateResponse, ScenarioDetail
from app.api.deps import get_df, get_impact_data
from app.services.digital_twin_engine import DigitalTwinEngine
from app.utils.logger import logger

router = APIRouter()

@router.post("/api/digital-twin/simulate", response_model=SimulateResponse, tags=["Digital Twin"])
def run_simulation(
    payload: SimulateRequest,
    df: pd.DataFrame = Depends(get_df),
    impact_data: list = Depends(get_impact_data)
) -> Any:
    """
    Simulate the effect of reducing illegal parking violations by a custom percentage (0-100%).
    Returns a citywide summary, junction-level before/after details, and AI recommendations,
    optimized for rendering comparison charts (Before vs After) on dashboards.
    """
    logger.info(f"Custom digital twin simulation requested: {payload.reduction_percentage}% reduction.")
    total_violations = len(df)
    engine = DigitalTwinEngine()
    results = engine.simulate_reduction(payload.reduction_percentage, total_violations, impact_data)
    return results

@router.get("/api/digital-twin/scenarios", response_model=List[ScenarioDetail], tags=["Digital Twin"])
def get_scenarios() -> Any:
    """
    Retrieve precalculated scenario comparisons (10%, 20%, 30%, and 50% reductions)
    suitable for comparative dashboard charts like Recharts LineChart, BarChart, or AreaChart.
    """
    logger.info("Comparative simulation scenarios requested.")
    engine = DigitalTwinEngine()
    scenarios = engine.generate_scenarios()
    return scenarios
