from pydantic import BaseModel
from typing import List, Dict


class EconomicCostBreakdown(BaseModel):
    fuel_waste: float
    delay_cost: float
    productivity_loss: float
    enforcement_cost: float


class EconomicImpactDetail(BaseModel):
    junction_name: str
    daily_loss: float
    weekly_loss: float
    monthly_loss: float
    yearly_loss: float
    category: str
    violations_count: int
    breakdown: EconomicCostBreakdown
    latitude: float
    longitude: float


class EconomicImpactListResponse(BaseModel):
    locations: List[EconomicImpactDetail]


class EconomicImpactSummaryResponse(BaseModel):
    citywide_daily_loss: float
    citywide_monthly_loss: float
    citywide_yearly_loss: float
    highest_loss_area: str


class EconomicTrendPoint(BaseModel):
    date: str
    cost: float
    violations: int


class EconomicTrendResponse(BaseModel):
    trends: List[EconomicTrendPoint]


class EconomicMapDetail(BaseModel):
    id: str
    latitude: float
    longitude: float
    daily_loss: float
    monthly_loss: float
    yearly_loss: float
    category: str
    label: str
    radius: int


class EconomicMapResponse(BaseModel):
    locations: List[EconomicMapDetail]
