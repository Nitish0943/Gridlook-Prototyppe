from pydantic import BaseModel, Field
from typing import List, Dict

class HealthResponse(BaseModel):
    status: str = Field(..., description="Application health status", examples=["healthy"])
    dataset_loaded: bool = Field(..., description="Indicates whether the dataset is loaded in memory", examples=[True])

class ViolationTypeCount(BaseModel):
    violation_type: str = Field(..., description="Name of the violation type", examples=["WRONG PARKING"])
    count: int = Field(..., description="Frequency of the violation", examples=[164977])

class StatsResponse(BaseModel):
    total_violations: int = Field(..., description="Total count of violation records", examples=[196861])
    total_police_stations: int = Field(..., description="Number of unique police stations", examples=[12])
    total_junctions: int = Field(..., description="Number of unique junctions", examples=[35])
    top_violation_types: List[ViolationTypeCount] = Field(..., description="Top violation types by frequency")

class DateRange(BaseModel):
    start: str = Field(..., description="Start of date range (created_datetime)", examples=["2023-11-09 19:11:46"])
    end: str = Field(..., description="End of date range (created_datetime)", examples=["2024-04-08 17:30:46"])

class DatasetInfoResponse(BaseModel):
    columns: List[str] = Field(..., description="List of dataset columns after feature engineering")
    rows: int = Field(..., description="Total number of rows in the dataset", examples=[196861])
    date_range: DateRange = Field(..., description="Date range of violations in the dataset")
