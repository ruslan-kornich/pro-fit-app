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
    <div className="p-4 space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('history.title')}</h1>
          <p className="text-gray-600 text-sm">{entries.length} {t('history.entries')}</p>
        </div>
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-2 p-2 -m-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="text-right">
            <p className="text-sm text-gray-500">{isToday ? tDashboard('today') : tDashboard('viewing')}</p>
            <p className="font-medium">{formatDisplayDate(displayDate)}</p>
          </div>
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </header>

      {!isToday && (
        <button
          onClick={() => setSelectedDate(null)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          ← {tDashboard('backToToday')}
        </button>
      )}

      {entries.length === 0 ? (
        <Card className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-card flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">{t('history.noEntries')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('history.startTracking')}</p>
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
                      className="w-14 h-14 rounded-button object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-button bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                      {hasIngredients && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          {entry.ingredients.length} {t('history.items')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {entry.calories} {tCommon('units.kcal')} • {formatTime(entry.created_at)}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                      {entry.protein && <span>P: {entry.protein}{tCommon('units.grams')}</span>}
                      {entry.fat && <span>F: {entry.fat}{tCommon('units.grams')}</span>}
                      {entry.carbs && <span>C: {entry.carbs}{tCommon('units.grams')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasIngredients && (
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {deleting === entry.id ? (
                        <Loading size="sm" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {hasIngredients && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('history.ingredients')}</p>
                    {entry.ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm text-gray-700">{ingredient.name}</p>
                          <p className="text-xs text-gray-400">
                            {ingredient.grams && `${ingredient.grams}${tCommon('units.grams')}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{ingredient.calories} {tCommon('units.kcal')}</p>
                          <p className="text-xs text-gray-400">
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
