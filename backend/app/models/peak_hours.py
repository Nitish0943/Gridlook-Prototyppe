from pydantic import BaseModel
from typing import List


class PeakHourDetail(BaseModel):
    hour: str
    predicted_violations: int
    risk_score: float
    risk: str  # "Low" | "Medium" | "High" | "Critical"


class PeakHourResponse(BaseModel):
    peak_hours: List[PeakHourDetail]


class JunctionPeakDetail(BaseModel):
    junction_name: str
    peak_hour: str
    predicted_violations: int


class PeakHourSummaryResponse(BaseModel):
    next_peak_hour: str
    highest_risk_junction: str
    predicted_citywide_violations: int
