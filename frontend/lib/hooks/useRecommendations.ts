import { useQuery } from '@tanstack/react-query';
import { getRecommendations, getRecommendationsSummary } from '../api/recommendations';

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecommendationsSummary = () => {
  return useQuery({
    queryKey: ['recommendationsSummary'],
    queryFn: getRecommendationsSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
