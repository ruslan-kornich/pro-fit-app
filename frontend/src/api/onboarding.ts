import { apiClient } from './client';
import type { Onboarding } from '../types/user';

export async function getOnboarding(): Promise<Onboarding> {
  const response = await apiClient.get<Onboarding>('/onboarding');
  return response.data;
}

export async function updateOnboardingStep(step: number): Promise<Onboarding> {
  const response = await apiClient.patch<Onboarding>('/onboarding/step', { step });
  return response.data;
}

export async function completeOnboarding(): Promise<Onboarding> {
  const response = await apiClient.post<Onboarding>('/onboarding/complete');
  return response.data;
}
