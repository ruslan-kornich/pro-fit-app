import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import { useDateContext } from '../context/DateContext';
import { useDailyStats } from '../hooks/useDailyStats';
import { useDaysWithEntries } from '../hooks/useDaysWithEntries';
import CalorieProgress from '../features/dashboard/CalorieProgress';
import MacroCard from '../features/dashboard/MacroCard';
import Card from '../components/Card';
import Loading from '../components/Loading';
import CalendarModal from '../components/Calendar/CalendarModal';
import { getFoodEntries } from '../api/food';
import type { FoodEntry } from '../types/food';
import { formatTime } from '../utils/formatters';

export default function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const { user } = useAuth();
  const { selectedDate, setSelectedDate, isToday, displayDate } = useDateContext();
  const { stats, loading: statsLoading } = useDailyStats(selectedDate ?? undefined);
  const [lastEntry, setLastEntry] = useState<FoodEntry | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { daysWithEntries } = useDaysWithEntries(
    displayDate.getFullYear(),
    displayDate.getMonth()
  );

  useEffect(() => {
    const loadLastEntry = async () => {
      try {
        const dateStr = selectedDate ?? formatDateForApi(new Date());
        const response = await getFoodEntries({
          start_date: dateStr,
          end_date: dateStr,
          page_size: 1
        });
        if (response.entries.length > 0) {
          setLastEntry(response.entries[0]);
        } else {
          setLastEntry(null);
        }
      } catch {
        setLastEntry(null);
      }
    };
    loadLastEntry();
  }, [selectedDate]);

  const calorieGoal = user?.profile?.daily_calorie_norm || 2000;

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
  };

  if (statsLoading) {
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
          <p className="text-gray-500 text-xs">{t('greeting')}</p>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.profile?.name || t('defaultUser')}
          </h1>
        </div>
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-2 p-2 -m-2 hover:bg-gray-100 rounded-button transition-all duration-200"
        >
          <div className="text-right">
            <p className="text-sm text-gray-500">{isToday ? t('today') : t('viewing')}</p>
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
          ← {t('backToToday')}
        </button>
      )}

      {!user?.profile?.daily_calorie_norm && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            {t('profilePrompt')}{' '}
            <Link to="/profile" className="font-medium underline">
              {t('setupProfile')}
            </Link>
          </p>
        </Card>
      )}

      <CalorieProgress
        consumed={stats?.total_calories || 0}
        goal={calorieGoal}
      />

      <MacroCard
        protein={stats?.total_protein || 0}
        fat={stats?.total_fat || 0}
        carbs={stats?.total_carbs || 0}
      />

      {lastEntry && (
        <Card className="py-3">
          <div className="flex items-center gap-3">
            {lastEntry.photo_url ? (
              <img
                src={lastEntry.photo_url.startsWith('/') ? lastEntry.photo_url : `/${lastEntry.photo_url}`}
                alt={lastEntry.name}
                className="w-12 h-12 rounded-button object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-button bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">{t('lastMeal')}</p>
              <p className="font-medium text-gray-900 text-sm truncate">{lastEntry.name}</p>
              <p className="text-xs text-gray-600">
                {lastEntry.calories} {t('calories.of', { ns: 'common' })} • {formatTime(lastEntry.created_at)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/add">
          <Card className="text-center py-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-button flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900 text-sm">{t('scanFood')}</p>
          </Card>
        </Link>
        <Link to="/recommendations">
          <Card className="text-center py-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-button flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900 text-sm">{t('aiTips')}</p>
          </Card>
        </Link>
      </div>

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
