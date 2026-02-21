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
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-primary-600 font-medium"
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
    <div className="p-4 space-y-4 pb-24">
      <header>
        <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('subtitle')}</p>
      </header>

      <div className="flex gap-2">
        <button
          onClick={() => handlePeriodChange('week')}
          className={`flex-1 py-2 px-3 rounded-input font-medium text-sm transition-all duration-200 ${
            period === 'week'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-button'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('periods.week')}
        </button>
        <button
          onClick={() => handlePeriodChange('month')}
          className={`flex-1 py-2 px-3 rounded-input font-medium text-sm transition-all duration-200 ${
            period === 'month'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-button'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('periods.month')}
        </button>
        <button
          onClick={() => setDateRangeModalOpen(true)}
          className={`flex-1 py-2 px-3 rounded-input font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1 ${
            period === 'custom'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-button'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📅 {period === 'custom' ? formatCustomRangeLabel() : t('periods.custom')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center py-3">
          <span className="text-lg">🔥</span>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(statistics?.averages.calories || 0)}
          </p>
          <p className="text-xs text-gray-500">{t('summary.avgCalories')}</p>
        </Card>
        <Card className="text-center py-3">
          <span className="text-lg">📊</span>
          <p className="text-2xl font-bold text-gray-900">
            {statistics?.total_entries || 0}
          </p>
          <p className="text-xs text-gray-500">{t('summary.totalEntries')}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">🔥 {t('charts.calories')}</h2>
        <BarChart
          data={caloriesData}
          height={200}
          emptyMessage={t('charts.noData')}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">⚖️ {t('charts.weight')}</h2>
          <button
            onClick={() => setWeightModalOpen(true)}
            className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:text-primary-700 transition-colors"
          >
            ➕ {t('weight.addButton')}
          </button>
        </div>
        <LineChart
          data={weightData}
          height={200}
          color="#10B981"
          unit=" kg"
          emptyMessage={t('charts.noWeightData')}
        />
        {weightHistory && weightHistory.weight_change !== null && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('weight.change')}</span>
            <span className={`font-medium ${
              weightHistory.weight_change > 0
                ? 'text-red-600'
                : weightHistory.weight_change < 0
                  ? 'text-green-600'
                  : 'text-gray-600'
            }`}>
              {weightHistory.weight_change > 0 ? '+' : ''}
              {weightHistory.weight_change.toFixed(1)} {tCommon('units.kg')}
            </span>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">📊 {t('macros.title')}</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-red-50 rounded-button">
            <span className="text-lg">🥩</span>
            <p className="text-lg font-bold text-red-600">
              {statistics?.averages.protein.toFixed(0) || 0}g
            </p>
            <p className="text-xs text-gray-500">{t('macros.protein')}</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-button">
            <span className="text-lg">🥑</span>
            <p className="text-lg font-bold text-yellow-600">
              {statistics?.averages.fat.toFixed(0) || 0}g
            </p>
            <p className="text-xs text-gray-500">{t('macros.fat')}</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-button">
            <span className="text-lg">🍞</span>
            <p className="text-lg font-bold text-blue-600">
              {statistics?.averages.carbs.toFixed(0) || 0}g
            </p>
            <p className="text-xs text-gray-500">{t('macros.carbs')}</p>
          </div>
        </div>
      </Card>

      <Card className="text-center py-2 text-sm text-gray-500">
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
