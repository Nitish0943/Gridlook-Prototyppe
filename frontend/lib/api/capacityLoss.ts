import apiClient from './client';
import { CapacityLossListResponse, CapacityLossSummaryResponse, CapacityLossMapResponse } from '../types';

export const getCapacityLossData = async (): Promise<CapacityLossListResponse> => {
  const response = await apiClient.get<CapacityLossListResponse>('/api/capacity-loss');
  return response.data;
};

export const getCapacityLossSummary = async (): Promise<CapacityLossSummaryResponse> => {
  const response = await apiClient.get<CapacityLossSummaryResponse>('/api/capacity-loss/summary');
  return response.data;
};

export const getCapacityLossMap = async (): Promise<CapacityLossMapResponse> => {
  const response = await apiClient.get<CapacityLossMapResponse>('/api/capacity-loss/map');
  return response.data;
};
