import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateContext } from '../context/DateContext';
import { useDaysWithEntries } from '../hooks/useDaysWithEntries';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Button from '../components/Button';
import CalendarModal from '../components/Calendar/CalendarModal';
import { getFoodEntries, deleteFoodEntry } from '../api/food';
import type { FoodEntry } from '../types/food';
import { formatTime } from '../utils/formatters';
import { toast } from '../utils/toast';
import { cn } from '../utils/cn';

export default function HistoryPage() {
  const { t, i18n } = useTranslation('food');
  const { t: tCommon } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const { selectedDate, setSelectedDate, isToday, displayDate } = useDateContext();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { daysWithEntries } = useDaysWithEntries(
    displayDate.getFullYear(),
    displayDate.getMonth()
  );

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleSelectDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(formatDateForApi(date));
    }
    setPage(1);
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const loadEntries = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      const dateStr = selectedDate ?? formatDateForApi(new Date());
      const response = await getFoodEntries({
        start_date: dateStr,
        end_date: dateStr,
        page: pageNum,
        page_size: 20
      });
      if (append) {
        setEntries((prev) => [...prev, ...response.entries]);
      } else {
        setEntries(response.entries);
      }
      setHasMore(response.entries.length === 20);
    } catch {
      toast.error(t('history.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t, selectedDate]);

  useEffect(() => {
    loadEntries(1);
  }, [loadEntries]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadEntries(nextPage, true);
  };

  const handleDelete = async (entryId: string) => {
    setDeleting(entryId);
    try {
      await deleteFoodEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      toast.success(t('history.deleteSuccess'));
    } catch {
      toast.error(t('history.deleteFailed'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="flex justify-between items-center pt-1">
        <div>
          <h1 className="text-xl font-bold text-surface-900 tracking-tight">{t('history.title')}</h1>
          <p className="text-surface-400 text-sm font-medium">{entries.length} {t('history.entries')}</p>
        </div>
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-button border border-surface-100 shadow-card hover:shadow-card-hover transition-all duration-200 ease-spring active:scale-[0.97]"
        >
          <div className="text-right">
            <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide">{isToday ? tDashboard('today') : tDashboard('viewing')}</p>
            <p className="font-semibold text-sm text-surface-800">{formatDisplayDate(displayDate)}</p>
          </div>
          <div className="w-8 h-8 bg-primary-50 rounded-[10px] flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        </button>
      </header>

      {!isToday && (
        <button
          onClick={() => setSelectedDate(null)}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {tDashboard('backToToday')}
        </button>
      )}

      {entries.length === 0 ? (
        <Card className="text-center py-10">
          <div className="w-16 h-16 bg-surface-100 rounded-[18px] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-surface-600 font-medium">{t('history.noEntries')}</p>
          <p className="text-surface-400 text-sm mt-1">{t('history.startTracking')}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const hasIngredients = entry.ingredients && entry.ingredients.length > 0;
            const isExpanded = expandedEntries.has(entry.id);

            return (
              <Card key={entry.id} className="overflow-hidden">
                <div className="flex items-center gap-3">
                  {entry.photo_url ? (
                    <img
                      src={entry.photo_url.startsWith('/') ? entry.photo_url : `/${entry.photo_url}`}
                      alt={entry.name}
                      className="w-14 h-14 rounded-[12px] object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-[12px] bg-surface-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-surface-900 truncate">{entry.name}</p>
                      {hasIngredients && (
                        <span className="text-[10px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-pill">
                          {entry.ingredients.length} {t('history.items')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-500 font-medium">
                      {entry.calories} {tCommon('units.kcal')} · {formatTime(entry.created_at)}
                    </p>
                    <div className="flex gap-2 text-[10px] text-surface-400 font-medium mt-0.5">
                      {entry.protein && <span>P: {entry.protein}{tCommon('units.grams')}</span>}
                      {entry.fat && <span>F: {entry.fat}{tCommon('units.grams')}</span>}
                      {entry.carbs && <span>C: {entry.carbs}{tCommon('units.grams')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {hasIngredients && (
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="p-2 text-surface-400 hover:text-surface-600 transition-colors rounded-[10px] hover:bg-surface-50"
                      >
                        <svg
                          className={cn("w-5 h-5 transition-transform duration-200", isExpanded && "rotate-180")}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="p-2 text-surface-400 hover:text-red-500 transition-colors rounded-[10px] hover:bg-red-50"
                    >
                      {deleting === entry.id ? (
                        <Loading size="sm" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {hasIngredients && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-surface-100 space-y-1.5">
                    <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{t('history.ingredients')}</p>
                    {entry.ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between py-2 px-3 bg-surface-50 rounded-[10px]">
                        <div>
                          <p className="text-sm font-medium text-surface-700">{ingredient.name}</p>
                          <p className="text-[10px] text-surface-400 font-medium">
                            {ingredient.grams && `${ingredient.grams}${tCommon('units.grams')}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-surface-900">{ingredient.calories} {tCommon('units.kcal')}</p>
                          <p className="text-[10px] text-surface-400 font-medium">
                            P:{ingredient.protein || 0} F:{ingredient.fat || 0} C:{ingredient.carbs || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}

          {hasMore && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLoadMore}
              loading={loading}
            >
              {tCommon('buttons.loadMore')}
            </Button>
          )}
        </div>
      )}

      <CalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={displayDate}
        onSelectDate={handleSelectDate}
        daysWithEntries={daysWithEntries}
      />
    </div>
  );
}
