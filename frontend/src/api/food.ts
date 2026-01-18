import { apiClient } from './client';
import type {
  FoodAnalysisResponse,
  DishAnalysisResponse,
  FoodEntry,
  FoodEntryCreate,
  FoodEntriesListResponse,
  DailyStats,
  RecommendationResponse,
} from '../types/food';

export async function analyzePhoto(file: File): Promise<FoodAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<FoodAnalysisResponse>('/food/analyze-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function analyzePhotoDetailed(file: File): Promise<DishAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<DishAnalysisResponse>('/food/analyze-photo-detailed', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function createFoodEntry(data: FoodEntryCreate): Promise<FoodEntry> {
  const response = await apiClient.post<FoodEntry>('/food/entries', data);
  return response.data;
}

export async function getFoodEntries(params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}): Promise<FoodEntriesListResponse> {
  const response = await apiClient.get<FoodEntriesListResponse>('/food/entries', { params });
  return response.data;
}

export async function deleteFoodEntry(entryId: string): Promise<void> {
  await apiClient.delete(`/food/entries/${entryId}`);
}

export async function getDailyStats(date?: string): Promise<DailyStats> {
  const response = await apiClient.get<DailyStats>('/food/daily-stats', {
    params: date ? { target_date: date } : undefined,
  });
  return response.data;
}

export async function getAIRecommendations(): Promise<RecommendationResponse> {
  const response = await apiClient.get<RecommendationResponse>('/food/ai-recommendations');
  return response.data;
}
