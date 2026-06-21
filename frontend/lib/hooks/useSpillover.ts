import { useQuery } from '@tanstack/react-query';
import { fetchSpillovers, fetchSpilloverSummary, fetchSpilloverMap } from '../api/spillover';
import { SpilloverListResponse, SpilloverSummaryResponse, SpilloverMapResponse } from '../types';

export const useSpilloverData = () => {
  return useQuery<SpilloverListResponse, Error>({
    queryKey: ['spillovers'],
    queryFn: fetchSpillovers,
    refetchInterval: 300000, // 5 minutes
  });
};

export const useSpilloverSummary = () => {
  return useQuery<SpilloverSummaryResponse, Error>({
    queryKey: ['spilloverSummary'],
    queryFn: fetchSpilloverSummary,
    refetchInterval: 300000,
  });
};

export const useSpilloverMapData = () => {
  return useQuery<SpilloverMapResponse, Error>({
    queryKey: ['spilloverMap'],
    queryFn: fetchSpilloverMap,
    refetchInterval: 300000,
  });
};
