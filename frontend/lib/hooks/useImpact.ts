import { useQuery } from '@tanstack/react-query';
import { getImpactData, getImpactSummary } from '../api/impact';

export const useImpactData = () => {
  return useQuery({
    queryKey: ['impactData'],
    queryFn: getImpactData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useImpactSummary = () => {
  return useQuery({
    queryKey: ['impactSummary'],
    queryFn: getImpactSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
