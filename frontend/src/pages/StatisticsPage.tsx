import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStatistics } from '../hooks/useStatistics';
import { useWeightHistory } from '../hooks/useWeightHistory';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import WeightEntryModal from '../features/statistics/WeightEntryModal';
import DateRangePickerModal from '../features/statistics/DateRangePickerModal';
import Card from '../components/Card';
import Loading from '../components/Loading';
import type { StatisticsPeriod } from '../types/statistics';

export default function StatisticsPage() {
  const { t, i18n } = useTranslation('statistics');
  const { t: tCommon } = useTranslation('common');
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);

  const {
    statistics,
    loading,
    error,
    period,
    customRange,
    setPeriod,
    setCustomRange,
    refetch,
  } = useStatistics();
  const { history: weightHistory, addEntry, refetch: refetchWeight } = useWeightHistory();

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
    if (period === 'week') {
      return date.toLocaleDateString(locale, { weekday: 'short' });
    }
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const handlePeriodChange = (newPeriod: StatisticsPeriod) => {
    setPeriod(newPeriod);
  };

  const handleCustomRange = (startDate: Date, endDate: Date) => {
    setCustomRange(startDate, endDate);
  };

  const handleAddWeight = async (data: { weight: number; recorded_date: string; note?: string | null }) => {
    await addEntry(data);
    await refetch();
    await refetchWeight();
  };

  const formatCustomRangeLabel = () => {
    if (!customRange) return '';
    const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
    const start = customRange.startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const end = customRange.endDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4 font-medium">{error}</p>
        <button
          onClick={refetch}
          className="text-primary-600 font-semibold"
        >
          {tCommon('buttons.retry')}
        </button>
      </div>
    );
  }

  const caloriesData = statistics?.daily_stats.map((d) => ({
    label: formatDateLabel(d.date),
    value: d.calories,
    goal: d.goal,
  })) || [];

  const weightData = statistics?.weight_data.map((d) => ({
    label: formatDateLabel(d.date),
    value: d.weight,
  })) || [];

  return (
    <div className="p-4 space-y-4 pb-24 animate-fade-in">
      <header className="pt-1">
        <h1 className="text-xl font-bold text-surface-900 tracking-tight">{t('title')}</h1>
        <p className="text-surface-400 text-sm font-medium">{t('subtitle')}</p>
      </header>

      <div className="flex gap-2">
        {(['week', 'month'] as StatisticsPeriod[]).map((periodKey) => (
          <button
            key={periodKey}
            onClick={() => handlePeriodChange(periodKey)}
            className={`flex-1 py-2.5 px-3 rounded-[12px] font-semibold text-sm transition-all duration-200 ease-spring ${
              period === periodKey
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-button'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {t(`periods.${periodKey}`)}
          </button>
        ))}
        <button
          onClick={() => setDateRangeModalOpen(true)}
          className={`flex-1 py-2.5 px-3 rounded-[12px] font-semibold text-sm transition-all duration-200 ease-spring flex items-center justify-center gap-1.5 ${
            period === 'custom'
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-button'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          {period === 'custom' ? formatCustomRangeLabel() : t('periods.custom')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center py-3">
          <div className="w-9 h-9 mx-auto mb-2 bg-accent-50 rounded-[10px] flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-surface-900 tracking-tight">
            {Math.round(statistics?.averages.calories || 0)}
          </p>
          <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide">{t('summary.avgCalories')}</p>
        </Card>
        <Card className="text-center py-3">
          <div className="w-9 h-9 mx-auto mb-2 bg-primary-50 rounded-[10px] flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-surface-900 tracking-tight">
            {statistics?.total_entries || 0}
          </p>
          <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide">{t('summary.totalEntries')}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
          <h2 className="font-bold text-surface-900">{t('charts.calories')}</h2>
        </div>
        <BarChart
          data={caloriesData}
          height={200}
          emptyMessage={t('charts.noData')}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
            </svg>
            <h2 className="font-bold text-surface-900">{t('charts.weight')}</h2>
          </div>
          <button
            onClick={() => setWeightModalOpen(true)}
            className="flex items-center gap-1.5 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('weight.addButton')}
          </button>
        </div>
        <LineChart
          data={weightData}
          height={200}
          color="#3B82F6"
          unit=" kg"
          emptyMessage={t('charts.noWeightData')}
        />
        {weightHistory && weightHistory.weight_change !== null && (
          <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between text-sm">
            <span className="text-surface-500 font-medium">{t('weight.change')}</span>
            <span className={`font-bold ${
              weightHistory.weight_change > 0
                ? 'text-red-500'
                : weightHistory.weight_change < 0
                  ? 'text-emerald-500'
                  : 'text-surface-500'
            }`}>
              {weightHistory.weight_change > 0 ? '+' : ''}
              {weightHistory.weight_change.toFixed(1)} {tCommon('units.kg')}
            </span>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.75a7.5 7.5 0 017.5 7.5h-7.5V3.75z" />
          </svg>
          <h2 className="font-bold text-surface-900">{t('macros.title')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-indigo-50/80 rounded-button">
            <svg className="w-5 h-5 mx-auto mb-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            <p className="text-lg font-bold text-indigo-600">
              {statistics?.averages.protein.toFixed(0) || 0}g
            </p>
            <p className="text-[10px] text-surface-400 font-medium uppercase">{t('macros.protein')}</p>
          </div>
          <div className="text-center p-3 bg-amber-50/80 rounded-button">
            <svg className="w-5 h-5 mx-auto mb-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
            <p className="text-lg font-bold text-amber-600">
              {statistics?.averages.fat.toFixed(0) || 0}g
            </p>
            <p className="text-[10px] text-surface-400 font-medium uppercase">{t('macros.fat')}</p>
          </div>
          <div className="text-center p-3 bg-primary-50/80 rounded-button">
            <svg className="w-5 h-5 mx-auto mb-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <p className="text-lg font-bold text-primary-600">
              {statistics?.averages.carbs.toFixed(0) || 0}g
            </p>
            <p className="text-[10px] text-surface-400 font-medium uppercase">{t('macros.carbs')}</p>
          </div>
        </div>
      </Card>

      <Card className="text-center py-2.5 text-sm text-surface-400 font-medium">
        {t('summary.daysTracked', { count: statistics?.days_with_entries || 0 })}
      </Card>

      <WeightEntryModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSubmit={handleAddWeight}
      />

      <DateRangePickerModal
        isOpen={dateRangeModalOpen}
        onClose={() => setDateRangeModalOpen(false)}
        onApply={handleCustomRange}
        initialStartDate={customRange?.startDate}
        initialEndDate={customRange?.endDate}
      />
    </div>
  );
}
