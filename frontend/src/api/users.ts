import { apiClient } from './client';
import type { User, UserUpdateRequest, AICalorieRecommendation } from '../types/user';

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}

export async function updateCurrentUser(data: UserUpdateRequest): Promise<User> {
  const response = await apiClient.patch<User>('/users/me', data);
  return response.data;
}

export async function getAICalorieRecommendation(): Promise<AICalorieRecommendation> {
  const response = await apiClient.get<AICalorieRecommendation>('/users/me/ai-calorie-recommendation');
  return response.data;
}
