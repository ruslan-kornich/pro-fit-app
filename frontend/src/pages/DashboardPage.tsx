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
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="flex justify-between items-center pt-1">
        <div>
          <p className="text-surface-400 text-xs font-medium tracking-wide uppercase">{t('greeting')}</p>
          <h1 className="text-xl font-bold text-surface-900 tracking-tight">
            {user?.profile?.name || t('defaultUser')}
          </h1>
        </div>
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-button border border-surface-100 shadow-card hover:shadow-card-hover transition-all duration-200 ease-spring active:scale-[0.97]"
        >
          <div className="text-right">
            <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide">{isToday ? t('today') : t('viewing')}</p>
            <p className="font-semibold text-sm text-surface-800">{formatDisplayDate(displayDate)}</p>
          </div>
          <div className="w-8 h-8 bg-primary-50 rounded-[10px] flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
          {t('backToToday')}
        </button>
      )}

      {!user?.profile?.daily_calorie_norm && (
        <Card className="bg-amber-50/80 border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-amber-800 text-sm">
              {t('profilePrompt')}{' '}
              <Link to="/profile" className="font-semibold underline underline-offset-2">
                {t('setupProfile')}
              </Link>
            </p>
          </div>
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
                className="w-12 h-12 rounded-[12px] object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-[12px] bg-surface-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide">{t('lastMeal')}</p>
              <p className="font-semibold text-surface-900 text-sm truncate">{lastEntry.name}</p>
              <p className="text-xs text-surface-500">
                {lastEntry.calories} {t('calories.of', { ns: 'common' })} · {formatTime(lastEntry.created_at)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/add">
          <Card className="text-center py-4 hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 ease-spring">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-[14px] flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <p className="font-semibold text-surface-800 text-sm">{t('scanFood')}</p>
          </Card>
        </Link>
        <Link to="/recommendations">
          <Card className="text-center py-4 hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 ease-spring">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-50 to-accent-100 rounded-[14px] flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <p className="font-semibold text-surface-800 text-sm">{t('aiTips')}</p>
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
