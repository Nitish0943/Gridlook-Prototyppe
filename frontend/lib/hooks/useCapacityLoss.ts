import { useQuery } from '@tanstack/react-query';
import { getCapacityLossData, getCapacityLossSummary, getCapacityLossMap } from '../api/capacityLoss';

export const useCapacityLossData = () => {
  return useQuery({
    queryKey: ['capacityLossData'],
    queryFn: getCapacityLossData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCapacityLossSummary = () => {
  return useQuery({
    queryKey: ['capacityLossSummary'],
    queryFn: getCapacityLossSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCapacityLossMap = () => {
  return useQuery({
    queryKey: ['capacityLossMap'],
    queryFn: getCapacityLossMap,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
