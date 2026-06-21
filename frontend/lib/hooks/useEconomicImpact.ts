import { useQuery } from '@tanstack/react-query';
import {
  getEconomicImpactData,
  getEconomicImpactSummary,
  getEconomicImpactTrends,
  getEconomicImpactMap,
} from '../api/economicImpact';

export const useEconomicImpactData = () => {
  return useQuery({
    queryKey: ['economicImpactData'],
    queryFn: getEconomicImpactData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEconomicImpactSummary = () => {
  return useQuery({
    queryKey: ['economicImpactSummary'],
    queryFn: getEconomicImpactSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEconomicImpactTrends = () => {
  return useQuery({
    queryKey: ['economicImpactTrends'],
    queryFn: getEconomicImpactTrends,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEconomicImpactMap = () => {
  return useQuery({
    queryKey: ['economicImpactMap'],
    queryFn: getEconomicImpactMap,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
