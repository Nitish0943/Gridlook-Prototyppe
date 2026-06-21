import apiClient from './client';
import { StatsResponse } from '../types';

export const getStats = async (): Promise<StatsResponse> => {
  const response = await apiClient.get<StatsResponse>('/api/stats');
  return response.data;
};
