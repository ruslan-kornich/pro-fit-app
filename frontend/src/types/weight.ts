export interface WeightEntryCreate {
  weight: number;
  recorded_date: string;
  note?: string | null;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  recorded_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeightHistoryResponse {
  entries: WeightEntry[];
  total: number;
  start_weight: number | null;
  current_weight: number | null;
  weight_change: number | null;
}
