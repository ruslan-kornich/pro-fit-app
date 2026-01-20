import { useState, useEffect, useCallback } from 'react';
import { getFoodEntries } from '../api/food';

export function useDaysWithEntries(year: number, month: number) {
  const [daysWithEntries, setDaysWithEntries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchDaysWithEntries = useCallback(async () => {
    try {
      setLoading(true);

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const formatDate = (date: Date): string => {
        const yearNum = date.getFullYear();
        const monthNum = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        return `${yearNum}-${monthNum}-${dayNum}`;
      };

      const response = await getFoodEntries({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        page_size: 100,
      });

      const days = new Set<string>();
      response.entries.forEach(entry => {
        const entryDate = new Date(entry.created_at);
        days.add(formatDate(entryDate));
      });

      setDaysWithEntries(days);
    } catch {
      setDaysWithEntries(new Set());
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchDaysWithEntries();
  }, [fetchDaysWithEntries]);

  return { daysWithEntries, loading, refetch: fetchDaysWithEntries };
}
