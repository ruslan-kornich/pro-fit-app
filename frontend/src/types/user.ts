export interface User {
  id: string;
  email: string;
  name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: string | null;
  activity_level: number | null;
  daily_calorie_norm: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateRequest {
  name?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activity_level?: number;
}
