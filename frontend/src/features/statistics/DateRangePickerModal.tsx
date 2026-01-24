import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import Button from '../../components/Button';

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export default function DateRangePickerModal({
  isOpen,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}: DateRangePickerModalProps) {
  const { t, i18n } = useTranslation('statistics');
  const { t: tCommon } = useTranslation('common');

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [viewDate, setViewDate] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectingStart, setSelectingStart] = useState(true);

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
    setViewDate((prev) => {
      const newMonth = prev.month + delta;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      } else if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: newMonth };
    });
  };

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isFutureDate = (date: Date): boolean => {
    return date > today;
  };

  const handleSelectDate = (date: Date) => {
    if (selectingStart) {
      setStartDate(date);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      if (date < startDate!) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
      onClose();
    }
  };

  const handleClose = () => {
    setStartDate(initialStartDate || null);
    setEndDate(initialEndDate || null);
    setSelectingStart(true);
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '---';
    const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const canNavigateForward = !(
    viewDate.year === today.getFullYear() && viewDate.month === today.getMonth()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('dateRange.title')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectingStart(true)}
              className={cn(
                'flex-1 p-3 rounded-lg border-2 text-left transition-colors',
                selectingStart
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              )}
            >
              <p className="text-xs text-gray-500">{t('dateRange.from')}</p>
              <p className="font-semibold text-gray-900">{formatDate(startDate)}</p>
            </button>
            <button
              onClick={() => setSelectingStart(false)}
              className={cn(
                'flex-1 p-3 rounded-lg border-2 text-left transition-colors',
                !selectingStart
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              )}
            >
              <p className="text-xs text-gray-500">{t('dateRange.to')}</p>
              <p className="font-semibold text-gray-900">{formatDate(endDate)}</p>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                'p-2 rounded-full transition-colors',
                canNavigateForward ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'
              )}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day) => (
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

              const isStart = isSameDay(day, startDate);
              const isEnd = isSameDay(day, endDate);
              const inRange = isInRange(day);
              const isFuture = isFutureDate(day);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isFuture && handleSelectDate(day)}
                  disabled={isFuture}
                  className={cn(
                    'aspect-square flex items-center justify-center rounded-full text-sm transition-colors',
                    (isStart || isEnd) && 'bg-primary-500 text-white',
                    inRange && !isStart && !isEnd && 'bg-primary-100 text-primary-700',
                    !isStart && !isEnd && !inRange && isToday && 'ring-2 ring-primary-300',
                    !isStart && !isEnd && !inRange && !isFuture && 'hover:bg-gray-100',
                    isFuture && 'text-gray-300 cursor-not-allowed'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              {tCommon('buttons.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className="flex-1"
            >
              {t('dateRange.apply')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
