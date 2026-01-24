import { apiClient } from './client';
import type { WeightEntry, WeightEntryCreate, WeightHistoryResponse } from '../types/weight';

export async function createWeightEntry(data: WeightEntryCreate): Promise<WeightEntry> {
  const response = await apiClient.post<WeightEntry>('/weight/entries', data);
  return response.data;
}

export async function getWeightHistory(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<WeightHistoryResponse> {
  const response = await apiClient.get<WeightHistoryResponse>('/weight/entries', { params });
  return response.data;
}

export async function deleteWeightEntry(entryId: string): Promise<void> {
  await apiClient.delete(`/weight/entries/${entryId}`);
}
