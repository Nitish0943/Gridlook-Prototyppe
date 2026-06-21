import apiClient from './client';
import {
  PeakHourResponse,
  JunctionPeakDetail,
  PeakHourSummaryResponse,
} from '../types';

export const getPeakHoursData = async (): Promise<PeakHourResponse> => {
  const response = await apiClient.get<PeakHourResponse>('/api/peak-hours');
  return response.data;
};

export const getJunctionPeakHours = async (): Promise<JunctionPeakDetail[]> => {
  const response = await apiClient.get<JunctionPeakDetail[]>('/api/peak-hours/junctions');
  return response.data;
};

export const getPeakHoursSummary = async (): Promise<PeakHourSummaryResponse> => {
  const response = await apiClient.get<PeakHourSummaryResponse>('/api/peak-hours/summary');
  return response.data;
};
