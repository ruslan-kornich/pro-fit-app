import { useState, useEffect, useCallback } from 'react';
import { getStatistics } from '../api/statistics';
import type { StatisticsResponse, StatisticsPeriod } from '../types/statistics';

type PeriodType = StatisticsPeriod | 'custom';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseStatisticsResult {
  statistics: StatisticsResponse | null;
  loading: boolean;
  error: string | null;
  period: PeriodType;
  customRange: DateRange | null;
  setPeriod: (period: StatisticsPeriod) => void;
  setCustomRange: (startDate: Date, endDate: Date) => void;
  refetch: () => Promise<void>;
}

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useStatistics(initialPeriod: StatisticsPeriod = 'week'): UseStatisticsResult {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriodState] = useState<PeriodType>(initialPeriod);
  const [customRange, setCustomRangeState] = useState<DateRange | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: StatisticsResponse;
      if (period === 'custom' && customRange) {
        data = await getStatistics({
          start_date: formatDateForApi(customRange.startDate),
          end_date: formatDateForApi(customRange.endDate),
        });
      } else {
        data = await getStatistics({ period: period as StatisticsPeriod });
      }
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [period, customRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const setPeriod = useCallback((newPeriod: StatisticsPeriod) => {
    setPeriodState(newPeriod);
    setCustomRangeState(null);
  }, []);

  const setCustomRange = useCallback((startDate: Date, endDate: Date) => {
    setPeriodState('custom');
    setCustomRangeState({ startDate, endDate });
  }, []);

  return {
    statistics,
    loading,
    error,
    period,
    customRange,
    setPeriod,
    setCustomRange,
    refetch: fetchStatistics,
  };
}
