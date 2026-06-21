import { useQuery, useMutation } from '@tanstack/react-query';
import { getScenarios, simulateReduction } from '../api/digitalTwin';

export const useScenarios = () => {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: getScenarios,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSimulate = () => {
  return useMutation({
    mutationFn: (reductionPercentage: number) => simulateReduction(reductionPercentage),
  });
};
