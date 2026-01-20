export type Goal = 'lose' | 'maintain' | 'gain';
export type Language = 'uk' | 'en';

export interface Profile {
  id: string;
  name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: string | null;
  activity_level: number | null;
  language: Language;
  goal: Goal;
  daily_calorie_norm: number | null;
  is_calorie_goal_manual: boolean;
  created_at: string;
  updated_at: string;
}

export interface Onboarding {
  id: string;
  current_step: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile | null;
  onboarding: Onboarding | null;
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
  language?: Language;
  goal?: Goal;
  daily_calorie_norm?: number;
  is_calorie_goal_manual?: boolean;
}

export interface AICalorieRecommendation {
  recommended_calories_min: number;
  recommended_calories_max: number;
  recommended_calories_optimal: number;
  explanation: string;
  personalized_tips: string[];
  factors_considered: string[];
}
