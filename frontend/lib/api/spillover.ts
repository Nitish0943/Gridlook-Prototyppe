import axios from 'axios';
import { SpilloverListResponse, SpilloverSummaryResponse, SpilloverMapResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-a41f7.up.railway.app/';

export const fetchSpillovers = async (): Promise<SpilloverListResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/spillover`);
  return response.data;
};

export const fetchSpilloverSummary = async (): Promise<SpilloverSummaryResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/spillover/summary`);
  return response.data;
};

export const fetchSpilloverMap = async (): Promise<SpilloverMapResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/spillover/map`);
  return response.data;
};
