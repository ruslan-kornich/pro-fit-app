import React, { createContext, useContext, useState, useCallback } from 'react';

interface DateContextType {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  resetToToday: () => void;
  isToday: boolean;
  displayDate: Date;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const resetToToday = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = selectedDate === null;

  const displayDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;

  const value = {
    selectedDate,
    setSelectedDate,
    resetToToday,
    isToday,
    displayDate,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

export function useDateContext() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDateContext must be used within a DateProvider');
  }
  return context;
}
