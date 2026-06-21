import { useQuery } from '@tanstack/react-query';
import {
  getPeakHoursData,
  getJunctionPeakHours,
  getPeakHoursSummary,
} from '../api/peakHours';

export const usePeakHours = () => {
  return useQuery({
    queryKey: ['peakHours'],
    queryFn: getPeakHoursData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useJunctionPeakHours = () => {
  return useQuery({
    queryKey: ['junctionPeakHours'],
    queryFn: getJunctionPeakHours,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePeakHoursSummary = () => {
  return useQuery({
    queryKey: ['peakHoursSummary'],
    queryFn: getPeakHoursSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
