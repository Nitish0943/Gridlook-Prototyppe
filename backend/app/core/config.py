import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Parking Intelligence Platform"
    API_STR: str = "/api"
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_PATH: Path = BASE_DIR / "data" / "violations.csv"
    
    # Peak hours configurations (inclusive start, exclusive end)
    # Morning: 7 AM - 11 AM (hour >= 7 and hour < 11)
    # Evening: 5 PM - 9 PM (hour >= 17 and hour < 21)
    PEAK_HOURS_MORNING: tuple[int, int] = (7, 11)
    PEAK_HOURS_EVENING: tuple[int, int] = (17, 21)
    
    # DBSCAN settings for geospatial clustering
    DBSCAN_EPS: float = 0.002
    DBSCAN_MIN_SAMPLES: int = 10
    
    class Config:
        case_sensitive = True

settings = Settings()
