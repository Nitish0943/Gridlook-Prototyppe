import apiClient from './client';
import { SimulateResponse, ScenarioDetail } from '../types';

export const simulateReduction = async (reductionPercentage: number): Promise<SimulateResponse> => {
  const response = await apiClient.post<SimulateResponse>('/api/digital-twin/simulate', {
    reduction_percentage: reductionPercentage,
  });
  return response.data;
};

export const getScenarios = async (): Promise<ScenarioDetail[]> => {
  const response = await apiClient.get<ScenarioDetail[]>('/api/digital-twin/scenarios');
  return response.data;
};
