export interface FoodAnalysisResponse {
  name: string;
  calories: number;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  grams: number | null;
  confidence: number | null;
  photo_url: string;
}

export interface FoodItemAnalysis {
  name: string;
  calories: number;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  grams: number | null;
}

export interface DishAnalysisResponse {
  dish_name: string;
  total_calories: number;
  total_grams: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  items: FoodItemAnalysis[];
  confidence: number | null;
  photo_url: string;
}

export interface FoodEntryCreate {
  name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  grams?: number | null;
  photo_url?: string | null;
}

export interface IngredientCreate {
  name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  grams?: number | null;
}

export interface FoodEntryWithIngredientsCreate {
  name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  grams?: number | null;
  photo_url?: string | null;
  ingredients: IngredientCreate[];
}

export interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  grams: number | null;
}

export interface FoodEntry {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  calories: number;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  grams: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  ingredients: Ingredient[];
}

export interface FoodEntriesListResponse {
  entries: FoodEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface DailyStats {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  remaining_calories: number | null;
  calorie_goal: number | null;
  entries_count: number;
}

export interface RecommendationResponse {
  recommendations: string[];
  insights: string;
  protein_status: string;
  balance_score: number;
}

export interface NutritionSearchResult {
  name: string;
  calories: number;
  protein_g: number;
  fat_total_g: number;
  carbohydrates_total_g: number;
  serving_size_g: number;
}

export interface NutritionSearchResponse {
  query: string;
  results: NutritionSearchResult[];
}
