import apiClient from './client';
import { LocationImpactDetail, ImpactSummaryResponse } from '../types';

export const getImpactData = async (): Promise<LocationImpactDetail[]> => {
  const response = await apiClient.get<{ locations: LocationImpactDetail[] }>('/api/impact');
  return response.data.locations;
};

export const getImpactSummary = async (): Promise<ImpactSummaryResponse> => {
  const response = await apiClient.get<ImpactSummaryResponse>('/api/impact/summary');
  return response.data;
};
