import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysWithEntries?: Set<string>;
}

export default function Calendar({ selectedDate, onSelectDate, daysWithEntries = new Set() }: CalendarProps) {
  const { t, i18n } = useTranslation('dashboard');
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date(selectedDate);
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const weekdays = useMemo(() => {
    if (i18n.language === 'uk') {
      return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    }
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }, [i18n.language]);

  const monthName = useMemo(() => {
    const date = new Date(viewDate.year, viewDate.month, 1);
    const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [viewDate, i18n.language]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewDate.year, viewDate.month, 1);
    const lastDay = new Date(viewDate.year, viewDate.month + 1, 0);

    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(viewDate.year, viewDate.month, day));
    }

    return days;
  }, [viewDate]);

  const navigateMonth = (delta: number) => {
    setViewDate(prev => {
      const newMonth = prev.month + delta;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      } else if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: newMonth };
    });
  };

  const goToToday = () => {
    setViewDate({ year: today.getFullYear(), month: today.getMonth() });
    onSelectDate(today);
  };

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isFutureDate = (date: Date): boolean => {
    return date > today;
  };

  const canNavigateForward = !(viewDate.year === today.getFullYear() && viewDate.month === today.getMonth());

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 capitalize">{monthName}</h3>
        <button
          onClick={() => navigateMonth(1)}
          disabled={!canNavigateForward}
          className={cn(
            "p-2 rounded-full transition-colors",
            canNavigateForward ? "hover:bg-gray-100" : "opacity-30 cursor-not-allowed"
          )}
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isSameDay(day, today);
          const isFuture = isFutureDate(day);
          const dateKey = formatDateKey(day);
          const hasEntries = daysWithEntries.has(dateKey);

          return (
            <button
              key={dateKey}
              onClick={() => !isFuture && onSelectDate(day)}
              disabled={isFuture}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-full text-sm transition-colors relative",
                isSelected && "bg-primary-500 text-white",
                !isSelected && isCurrentDay && "bg-primary-100 text-primary-700 font-semibold",
                !isSelected && !isCurrentDay && !isFuture && "hover:bg-gray-100",
                isFuture && "text-gray-300 cursor-not-allowed"
              )}
            >
              {day.getDate()}
              {hasEntries && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={goToToday}
        className="mt-4 w-full py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
      >
        {t('calendar.today')}
      </button>
    </div>
  );
}
