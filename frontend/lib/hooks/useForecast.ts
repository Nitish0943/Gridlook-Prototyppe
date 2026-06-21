import { useQuery } from '@tanstack/react-query';
import {
  getForecastData,
  getForecastSummary,
  getForecastTrends,
  getForecastMap,
} from '../api/forecast';

export const useForecastData = () => {
  return useQuery({
    queryKey: ['forecastData'],
    queryFn: getForecastData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useForecastSummary = () => {
  return useQuery({
    queryKey: ['forecastSummary'],
    queryFn: getForecastSummary,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useForecastTrends = () => {
  return useQuery({
    queryKey: ['forecastTrends'],
    queryFn: getForecastTrends,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useForecastMap = () => {
  return useQuery({
    queryKey: ['forecastMap'],
    queryFn: getForecastMap,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
