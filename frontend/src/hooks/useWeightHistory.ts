import { useState, useEffect, useCallback } from 'react';
import { getWeightHistory, createWeightEntry, deleteWeightEntry } from '../api/weight';
import type { WeightHistoryResponse, WeightEntryCreate } from '../types/weight';

interface UseWeightHistoryResult {
  history: WeightHistoryResponse | null;
  loading: boolean;
  error: string | null;
  addEntry: (data: WeightEntryCreate) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useWeightHistory(): UseWeightHistoryResult {
  const [history, setHistory] = useState<WeightHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeightHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weight history');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEntry = useCallback(async (data: WeightEntryCreate) => {
    await createWeightEntry(data);
    await fetchHistory();
  }, [fetchHistory]);

  const removeEntry = useCallback(async (entryId: string) => {
    await deleteWeightEntry(entryId);
    await fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    addEntry,
    removeEntry,
    refetch: fetchHistory,
  };
}
