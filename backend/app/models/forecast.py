from pydantic import BaseModel
from typing import List


class ForecastDetail(BaseModel):
    junction_name: str
    current_violations: int
    predicted_violations: int
    predicted_7_days: int
    predicted_90_days: int
    growth_rate: float
    future_risk_score: float
    risk: str  # "Low" | "Medium" | "High" | "Critical"
    latitude: float
    longitude: float


class ForecastListResponse(BaseModel):
    forecast: List[ForecastDetail]


class ForecastSummaryResponse(BaseModel):
    high_risk_areas: int
    critical_future_hotspots: int
    highest_growth_area: str
    average_growth_rate: float


class TrendPoint(BaseModel):
    date: str
    predicted: int


class ForecastTrendResponse(BaseModel):
    daily: List[TrendPoint]
    weekly: List[TrendPoint]
    monthly: List[TrendPoint]


class ForecastMapDetail(BaseModel):
    id: str
    latitude: float
    longitude: float
    current_violations: int
    predicted_violations: int
    growth_rate: float
    future_risk_score: float
    risk: str
    label: str
    radius: int


class ForecastMapResponse(BaseModel):
    locations: List[ForecastMapDetail]
