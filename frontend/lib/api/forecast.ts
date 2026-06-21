import apiClient from './client';
import {
  ForecastListResponse,
  ForecastSummaryResponse,
  ForecastTrendResponse,
  ForecastMapResponse,
} from '../types';

export const getForecastData = async (): Promise<ForecastListResponse> => {
  const response = await apiClient.get<ForecastListResponse>('/api/forecast');
  return response.data;
};

export const getForecastSummary = async (): Promise<ForecastSummaryResponse> => {
  const response = await apiClient.get<ForecastSummaryResponse>('/api/forecast/summary');
  return response.data;
};

export const getForecastTrends = async (): Promise<ForecastTrendResponse> => {
  const response = await apiClient.get<ForecastTrendResponse>('/api/forecast/trends');
  return response.data;
};

export const getForecastMap = async (): Promise<ForecastMapResponse> => {
  const response = await apiClient.get<ForecastMapResponse>('/api/forecast/map');
  return response.data;
};
