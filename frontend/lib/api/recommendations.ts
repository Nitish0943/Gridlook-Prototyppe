import apiClient from './client';
import { RecommendationDetail, RecommendationsSummaryResponse } from '../types';

export const getRecommendations = async (): Promise<RecommendationDetail[]> => {
  const response = await apiClient.get<{ recommendations: RecommendationDetail[] }>('/api/recommendations');
  return response.data.recommendations;
};

export const getRecommendationsSummary = async (): Promise<RecommendationsSummaryResponse> => {
  const response = await apiClient.get<RecommendationsSummaryResponse>('/api/recommendations/summary');
  return response.data;
};
