import { apiClient } from './client';
import type { StatisticsResponse, StatisticsPeriod } from '../types/statistics';

interface GetStatisticsParams {
  period?: StatisticsPeriod;
  start_date?: string;
  end_date?: string;
}

export async function getStatistics(params: GetStatisticsParams = {}): Promise<StatisticsResponse> {
  const response = await apiClient.get<StatisticsResponse>('/statistics', {
    params,
  });
  return response.data;
}
