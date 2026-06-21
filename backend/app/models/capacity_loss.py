from pydantic import BaseModel
from typing import List


class CapacityLossDetail(BaseModel):
    junction_name: str
    capacity_loss: float
    occupied_width: float
    available_width: float
    road_width: float
    risk: str  # "Low" | "Medium" | "High" | "Critical"
    congestion_amplification: float
    vehicle_count: int
    latitude: float
    longitude: float


class CapacityLossListResponse(BaseModel):
    locations: List[CapacityLossDetail]


class CapacityLossSummaryResponse(BaseModel):
    average_capacity_loss: float
    critical_locations: int
    highest_loss_area: str
    citywide_capacity_loss: float


class CapacityLossMapDetail(BaseModel):
    id: str
    latitude: float
    longitude: float
    capacity_loss: float
    risk: str
    label: str
    radius: int


class CapacityLossMapResponse(BaseModel):
    locations: List[CapacityLossMapDetail]
