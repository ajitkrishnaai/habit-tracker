// Date utility functions for the habit tracker

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getTodayString = (): string => {
  return formatDate(new Date());
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

export const getDaysInRange = (
  startDate: string,
  endDate: string
): string[] => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const days: string[] = [];

  for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
    days.push(formatDate(date));
  }

  return days;
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};
