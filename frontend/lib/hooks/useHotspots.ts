import { useQuery } from '@tanstack/react-query';
import { getHotspots, getHotspotsSummary, getMapData } from '../api/hotspots';

export const useHotspots = () => {
  return useQuery({
    queryKey: ['hotspots'],
    queryFn: getHotspots,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHotspotsSummary = () => {
  return useQuery({
    queryKey: ['hotspotsSummary'],
    queryFn: getHotspotsSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMapData = () => {
  return useQuery({
    queryKey: ['mapData'],
    queryFn: getMapData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

