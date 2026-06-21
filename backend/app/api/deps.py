import pandas as pd
from fastapi import Request
from typing import Any, Dict

def get_df(request: Request) -> pd.DataFrame:
    """
    Dependency injection helper to retrieve the in-memory processed DataFrame.
    """
    if not hasattr(request.app.state, "df") or request.app.state.df is None:
        raise RuntimeError("DataFrame is not loaded in application state.")
    return request.app.state.df

def get_stats(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve the in-memory precalculated summary statistics.
    """
    if not hasattr(request.app.state, "stats") or request.app.state.stats is None:
        raise RuntimeError("Statistics are not loaded in application state.")
    return request.app.state.stats

def get_hotspots(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated hotspots list.
    """
    if not hasattr(request.app.state, "hotspots") or request.app.state.hotspots is None:
        raise RuntimeError("Hotspots are not loaded in application state.")
    return request.app.state.hotspots

def get_hotspots_summary(request: Request) -> Dict[str, int]:
    """
    Dependency injection helper to retrieve the precalculated hotspots summary.
    """
    if not hasattr(request.app.state, "hotspots_summary") or request.app.state.hotspots_summary is None:
        raise RuntimeError("Hotspots summary is not loaded in application state.")
    return request.app.state.hotspots_summary


def get_impact_data(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated impact data list.
    """
    if not hasattr(request.app.state, "impact_data") or request.app.state.impact_data is None:
        raise RuntimeError("Impact data is not loaded in application state.")
    return request.app.state.impact_data


def get_impact_summary(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve the precalculated impact summary.
    """
    if not hasattr(request.app.state, "impact_summary") or request.app.state.impact_summary is None:
        raise RuntimeError("Impact summary is not loaded in application state.")
    return request.app.state.impact_summary

def get_recommendations(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated recommendations list.
    """
    if not hasattr(request.app.state, "recommendations") or request.app.state.recommendations is None:
        raise RuntimeError("Recommendations are not loaded in application state.")
    return request.app.state.recommendations

def get_recommendations_summary(request: Request) -> Dict[str, int]:
    """
    Dependency injection helper to retrieve the precalculated recommendations summary.
    """
    if not hasattr(request.app.state, "recommendations_summary") or request.app.state.recommendations_summary is None:
        raise RuntimeError("Recommendations summary is not loaded in application state.")
    return request.app.state.recommendations_summary

def get_spillovers(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated spillovers list.
    """
    if not hasattr(request.app.state, "spillovers") or request.app.state.spillovers is None:
        raise RuntimeError("Spillovers are not loaded in application state.")
    return request.app.state.spillovers

def get_spillover_summary(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve the precalculated spillover summary.
    """
    if not hasattr(request.app.state, "spillover_summary") or request.app.state.spillover_summary is None:
        raise RuntimeError("Spillover summary is not loaded in application state.")
    return request.app.state.spillover_summary

def get_spillover_map(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated spillover map data.
    """
    if not hasattr(request.app.state, "spillover_map") or request.app.state.spillover_map is None:
        raise RuntimeError("Spillover map data is not loaded in application state.")
    return request.app.state.spillover_map

def get_capacity_loss_data(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated capacity loss data.
    """
    if not hasattr(request.app.state, "capacity_loss_data") or request.app.state.capacity_loss_data is None:
        raise RuntimeError("Capacity loss data is not loaded in application state.")
    return request.app.state.capacity_loss_data

def get_capacity_loss_summary(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve the precalculated capacity loss summary.
    """
    if not hasattr(request.app.state, "capacity_loss_summary") or request.app.state.capacity_loss_summary is None:
        raise RuntimeError("Capacity loss summary is not loaded in application state.")
    return request.app.state.capacity_loss_summary

def get_capacity_loss_map(request: Request) -> list:
    """
    Dependency injection helper to retrieve the precalculated capacity loss map data.
    """
    if not hasattr(request.app.state, "capacity_loss_map") or request.app.state.capacity_loss_map is None:
        raise RuntimeError("Capacity loss map data is not loaded in application state.")
    return request.app.state.capacity_loss_map

def get_economic_impact_data(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated economic impact locations list.
    """
    if not hasattr(request.app.state, "economic_impact_data") or request.app.state.economic_impact_data is None:
        raise RuntimeError("Economic impact data is not loaded in application state.")
    return request.app.state.economic_impact_data

def get_economic_impact_summary(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve precalculated economic impact summary.
    """
    if not hasattr(request.app.state, "economic_impact_summary") or request.app.state.economic_impact_summary is None:
        raise RuntimeError("Economic impact summary is not loaded in application state.")
    return request.app.state.economic_impact_summary

def get_economic_impact_trends(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated economic impact weekly trends.
    """
    if not hasattr(request.app.state, "economic_impact_trends") or request.app.state.economic_impact_trends is None:
        raise RuntimeError("Economic impact trends are not loaded in application state.")
    return request.app.state.economic_impact_trends

def get_economic_impact_map(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated economic impact map coordinates.
    """
    if not hasattr(request.app.state, "economic_impact_map") or request.app.state.economic_impact_map is None:
        raise RuntimeError("Economic impact map is not loaded in application state.")
    return request.app.state.economic_impact_map

def get_forecast_data(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated forecast locations list.
    """
    if not hasattr(request.app.state, "forecast_data") or request.app.state.forecast_data is None:
        raise RuntimeError("Forecast data is not loaded in application state.")
    return request.app.state.forecast_data

def get_forecast_summary(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve precalculated forecast summary.
    """
    if not hasattr(request.app.state, "forecast_summary") or request.app.state.forecast_summary is None:
        raise RuntimeError("Forecast summary is not loaded in application state.")
    return request.app.state.forecast_summary

def get_forecast_trends(request: Request) -> Dict[str, list]:
    """
    Dependency injection helper to retrieve precalculated forecast trends.
    """
    if not hasattr(request.app.state, "forecast_trends") or request.app.state.forecast_trends is None:
        raise RuntimeError("Forecast trends are not loaded in application state.")
    return request.app.state.forecast_trends

def get_forecast_map(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated forecast map data.
    """
    if not hasattr(request.app.state, "forecast_map") or request.app.state.forecast_map is None:
        raise RuntimeError("Forecast map is not loaded in application state.")
    return request.app.state.forecast_map


def get_peak_hours(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated peak hours predictions list.
    """
    if not hasattr(request.app.state, "peak_hours") or request.app.state.peak_hours is None:
        raise RuntimeError("Peak hours predictions are not loaded in application state.")
    return request.app.state.peak_hours


def get_junction_peak_hours(request: Request) -> list:
    """
    Dependency injection helper to retrieve precalculated junction peak hours list.
    ```
    """
    if not hasattr(request.app.state, "junction_peak_hours") or request.app.state.junction_peak_hours is None:
        raise RuntimeError("Junction peak hours are not loaded in application state.")
    return request.app.state.junction_peak_hours


def get_peak_hours_summary(request: Request) -> Dict[str, Any]:
    """
    Dependency injection helper to retrieve precalculated peak hours summary.
    """
    if not hasattr(request.app.state, "peak_hours_summary") or request.app.state.peak_hours_summary is None:
        raise RuntimeError("Peak hours summary is not loaded in application state.")
    return request.app.state.peak_hours_summary





