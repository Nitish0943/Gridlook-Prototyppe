import apiClient from './client';
import { HotspotDetail, HotspotsSummaryResponse, MapDataResponse } from '../types';

export const getHotspots = async (): Promise<HotspotDetail[]> => {
  const response = await apiClient.get<{ hotspots: HotspotDetail[] }>('/api/hotspots');
  return response.data.hotspots;
};

export const getHotspotsSummary = async (): Promise<HotspotsSummaryResponse> => {
  const response = await apiClient.get<HotspotsSummaryResponse>('/api/hotspots/summary');
  return response.data;
};

export const getMapData = async (): Promise<MapDataResponse> => {
  const response = await apiClient.get<MapDataResponse>('/api/map-data');
  return response.data;
};

