import { useQuery } from '@tanstack/react-query';
import { getStats } from '../api/stats';

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
