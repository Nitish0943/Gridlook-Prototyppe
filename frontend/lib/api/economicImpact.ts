import apiClient from './client';
import {
  EconomicImpactListResponse,
  EconomicImpactSummaryResponse,
  EconomicTrendResponse,
  EconomicMapResponse,
} from '../types';

export const getEconomicImpactData = async (): Promise<EconomicImpactListResponse> => {
  const response = await apiClient.get<EconomicImpactListResponse>('/api/economic-impact');
  return response.data;
};

export const getEconomicImpactSummary = async (): Promise<EconomicImpactSummaryResponse> => {
  const response = await apiClient.get<EconomicImpactSummaryResponse>('/api/economic-impact/summary');
  return response.data;
};

export const getEconomicImpactTrends = async (): Promise<EconomicTrendResponse> => {
  const response = await apiClient.get<EconomicTrendResponse>('/api/economic-impact/trends');
  return response.data;
};

export const getEconomicImpactMap = async (): Promise<EconomicMapResponse> => {
  const response = await apiClient.get<EconomicMapResponse>('/api/economic-impact/map');
  return response.data;
};
