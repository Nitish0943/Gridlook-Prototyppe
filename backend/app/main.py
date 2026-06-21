from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.services.data_loader import DataLoader
from app.services.feature_eng import FeatureEngineer
from app.services.statistics import StatisticsService
from app.services.hotspot_engine import HotspotEngine
from app.api.endpoints import router as api_router
from app.api.hotspots import router as hotspots_router
from app.api.impact import router as impact_router
from app.api.recommendations import router as recommendations_router
from app.api.digital_twin import router as digital_twin_router
from app.api.spillover import router as spillover_router
from app.api.capacity_loss import router as capacity_loss_router
from app.api.economic_impact import router as economic_impact_router
from app.api.forecast import router as forecast_router
from app.api.peak_hours import router as peak_hours_router
from app.services.impact_engine import ImpactEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.spillover_engine import SpilloverEngine
from app.services.capacity_loss_engine import CapacityLossEngine
from app.services.economic_impact_engine import EconomicImpactEngine
from app.services.forecast_engine import ForecastEngine
from app.services.peak_hour_engine import PeakHourEngine
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Asynchronous lifespan context manager for startup and shutdown execution tasks.
    Performs one-time CSV loading, feature engineering, stats pre-computation, hotspot clustering, and recommendation generation.
    """
    logger.info("FastAPI lifecycle starting up. Initializing Data Ingestion & Engineering...")
    
    try:
        # Load dataset using DataLoader service
        data_loader = DataLoader()
        raw_df = data_loader.load_data()
        
        # Run feature engineering pipeline
        feature_engineer = FeatureEngineer()
        processed_df = feature_engineer.process(raw_df)
        
        # Calculate summary statistics once on startup
        stats_service = StatisticsService()
        summary_stats = stats_service.calculate_summary(processed_df)
        
        # Run hotspot engine detection once on startup
        logger.info("Executing geospatial Hotspot Engine (DBSCAN)...")
        hotspot_engine = HotspotEngine()
        hotspots, hotspots_summary = hotspot_engine.detect_hotspots(processed_df)
        
        # Run impact score engine once on startup
        logger.info("Executing Parking Impact Score Engine...")
        impact_engine = ImpactEngine()
        impact_data, impact_summary = impact_engine.calculate_impact(processed_df)
        
        # Run recommendation engine once on startup
        logger.info("Executing Enforcement Recommendation Engine...")
        recommendation_engine = RecommendationEngine()
        recommendations, recommendations_summary = recommendation_engine.generate_recommendations(
            processed_df, hotspots, impact_data
        )
        
        # Run spillover engine once on startup
        logger.info("Executing Spillover Analysis Engine...")
        spillover_engine = SpilloverEngine()
        spillovers, spillover_summary, spillover_map = spillover_engine.calculate_spillover(
            processed_df, hotspots, impact_data
        )
        
        # Run capacity loss engine once on startup
        logger.info("Executing Road Capacity Loss Engine...")
        capacity_loss_engine = CapacityLossEngine()
        capacity_loss_data, capacity_loss_summary, capacity_loss_map = capacity_loss_engine.calculate_capacity_loss(
            processed_df, hotspots, impact_data
        )
        
        # Run economic impact engine once on startup
        logger.info("Executing Economic Impact Analysis Engine...")
        economic_impact_engine = EconomicImpactEngine()
        economic_impact_data, economic_impact_summary, economic_impact_trends, economic_impact_map = economic_impact_engine.calculate_economic_impact(
            processed_df, hotspots, impact_data
        )
        
        # Run forecast engine once on startup
        logger.info("Executing Future Parking Risk Forecast Engine...")
        forecast_engine = ForecastEngine()
        forecast_data, forecast_summary, forecast_trends, forecast_map = forecast_engine.calculate_forecast(
            processed_df, hotspots, impact_data, spillovers
        )
        
        # Run peak hour engine once on startup
        logger.info("Executing Peak Hour Prediction Engine...")
        peak_hour_engine = PeakHourEngine()
        peak_hours, junction_peak_hours, peak_hours_summary = peak_hour_engine.calculate_peak_hours(
            processed_df, impact_data, spillovers
        )
        
        # Store df, stats, hotspots, summary, impact details, and recommendations in app state
        app.state.df = processed_df
        app.state.stats = summary_stats
        app.state.hotspots = hotspots
        app.state.hotspots_summary = hotspots_summary
        app.state.impact_data = impact_data
        app.state.impact_summary = impact_summary
        app.state.recommendations = recommendations
        app.state.recommendations_summary = recommendations_summary
        app.state.spillovers = spillovers
        app.state.spillover_summary = spillover_summary
        app.state.spillover_map = spillover_map
        app.state.capacity_loss_data = capacity_loss_data
        app.state.capacity_loss_summary = capacity_loss_summary
        app.state.capacity_loss_map = capacity_loss_map
        app.state.economic_impact_data = economic_impact_data
        app.state.economic_impact_summary = economic_impact_summary
        app.state.economic_impact_trends = economic_impact_trends
        app.state.economic_impact_map = economic_impact_map
        app.state.forecast_data = forecast_data
        app.state.forecast_summary = forecast_summary
        app.state.forecast_trends = forecast_trends
        app.state.forecast_map = forecast_map
        app.state.peak_hours = peak_hours
        app.state.junction_peak_hours = junction_peak_hours
        app.state.peak_hours_summary = peak_hours_summary
        
        logger.info("Data components, hotspots, and recommendations successfully loaded and stored in-memory.")
    except Exception as e:
        logger.critical(f"Startup execution failed: {str(e)}")
        # Allow the application to start in a degraded state for debugging/health check
        app.state.df = None
        app.state.stats = None
        app.state.hotspots = None
        app.state.hotspots_summary = None
        app.state.impact_data = None
        app.state.impact_summary = None
        app.state.recommendations = None
        app.state.recommendations_summary = None
        app.state.spillovers = None
        app.state.spillover_summary = None
        app.state.spillover_map = None
        app.state.capacity_loss_data = None
        app.state.capacity_loss_summary = None
        app.state.capacity_loss_map = None
        app.state.economic_impact_data = None
        app.state.economic_impact_summary = None
        app.state.economic_impact_trends = None
        app.state.economic_impact_map = None
        app.state.forecast_data = None
        app.state.forecast_summary = None
        app.state.forecast_trends = None
        app.state.forecast_map = None
        app.state.peak_hours = None
        app.state.junction_peak_hours = None
        app.state.peak_hours_summary = None
        
    yield
    
    # Shutdown clean up
    logger.info("FastAPI lifecycle shutting down. Cleaning up in-memory resources...")
    if hasattr(app.state, "df"):
        del app.state.df
    if hasattr(app.state, "stats"):
        del app.state.stats
    if hasattr(app.state, "hotspots"):
        del app.state.hotspots
    if hasattr(app.state, "hotspots_summary"):
        del app.state.hotspots_summary
    if hasattr(app.state, "impact_data"):
        del app.state.impact_data
    if hasattr(app.state, "impact_summary"):
        del app.state.impact_summary
    if hasattr(app.state, "recommendations"):
        del app.state.recommendations
    if hasattr(app.state, "recommendations_summary"):
        del app.state.recommendations_summary
    if hasattr(app.state, "spillovers"):
        del app.state.spillovers
    if hasattr(app.state, "spillover_summary"):
        del app.state.spillover_summary
    if hasattr(app.state, "spillover_map"):
        del app.state.spillover_map
    if hasattr(app.state, "capacity_loss_data"):
        del app.state.capacity_loss_data
    if hasattr(app.state, "capacity_loss_summary"):
        del app.state.capacity_loss_summary
    if hasattr(app.state, "capacity_loss_map"):
        del app.state.capacity_loss_map
    if hasattr(app.state, "economic_impact_data"):
        del app.state.economic_impact_data
    if hasattr(app.state, "economic_impact_summary"):
        del app.state.economic_impact_summary
    if hasattr(app.state, "economic_impact_trends"):
        del app.state.economic_impact_trends
    if hasattr(app.state, "economic_impact_map"):
        del app.state.economic_impact_map
    if hasattr(app.state, "forecast_data"):
        del app.state.forecast_data
    if hasattr(app.state, "forecast_summary"):
        del app.state.forecast_summary
    if hasattr(app.state, "forecast_trends"):
        del app.state.forecast_trends
    if hasattr(app.state, "forecast_map"):
        del app.state.forecast_map
    if hasattr(app.state, "peak_hours"):
        del app.state.peak_hours
    if hasattr(app.state, "junction_peak_hours"):
        del app.state.junction_peak_hours
    if hasattr(app.state, "peak_hours_summary"):
        del app.state.peak_hours_summary
    logger.info("Resource cleanup completed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Phase 5: Parking Intelligence Platform Digital Twin Simulation.",
    version="1.4.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(api_router)
app.include_router(hotspots_router)
app.include_router(impact_router)
app.include_router(recommendations_router)
app.include_router(digital_twin_router)
app.include_router(spillover_router)
app.include_router(capacity_loss_router)
app.include_router(economic_impact_router)
app.include_router(forecast_router)
app.include_router(peak_hours_router)



