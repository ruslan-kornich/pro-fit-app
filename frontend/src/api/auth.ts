import { apiClient, setTokens, clearTokens } from './client';
import type { LoginRequest, RegisterRequest, TokenResponse } from '../types/auth';

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', data);
  setTokens(response.data.access_token, response.data.refresh_token);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/register', data);
  setTokens(response.data.access_token, response.data.refresh_token);
  return response.data;
}

export function logout(): void {
  clearTokens();
}
