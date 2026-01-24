export interface DailyStatsSummary {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  goal: number | null;
  entries_count: number;
}

export interface WeightDataPoint {
  date: string;
  weight: number;
}

export interface MacroAverages {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface StatisticsResponse {
  period_start: string;
  period_end: string;
  daily_stats: DailyStatsSummary[];
  weight_data: WeightDataPoint[];
  averages: MacroAverages;
  total_entries: number;
  days_with_entries: number;
}

export type StatisticsPeriod = 'week' | 'month';
