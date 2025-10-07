import { Timestamp } from 'firebase/firestore';
import type { DailyEntry, DailyEntryData } from '../types';

/**
 * Daily Entry Service
 * Business logic layer for daily entry data operations
 * Provides type-safe functions for saving, loading, and managing daily habit completions
 */

/**
 * Convert Firestore DailyEntry to client-side DailyEntryData
 */
export const convertToDailyEntryData = (entry: DailyEntry): DailyEntryData => {
  return {
    id: entry.id,
    date: entry.date,
    habitId: entry.habitId,
    completed: entry.completed,
    reflection: entry.reflection,
    timestamp: entry.timestamp.toDate(),
  };
};

/**
 * Convert client-side DailyEntryData to Firestore DailyEntry format
 */
export const convertToDailyEntry = (
  entryData: Partial<DailyEntryData>
): Partial<DailyEntry> => {
  const entry: Partial<DailyEntry> = {
    id: entryData.id,
    date: entryData.date,
    habitId: entryData.habitId,
    completed: entryData.completed,
    reflection: entryData.reflection,
  };

  // Convert Date to Timestamp if timestamp exists
  if (entryData.timestamp) {
    entry.timestamp = Timestamp.fromDate(entryData.timestamp);
  }

  return entry;
};

/**
 * Create a new daily entry object with default values
 */
export const createNewDailyEntry = (
  habitId: string,
  date: string,
  completed: boolean,
  reflection: string = ''
): Omit<DailyEntry, 'id'> => {
  return {
    habitId,
    date,
    completed,
    reflection: reflection.trim(),
    timestamp: Timestamp.now(),
  };
};

/**
 * Validate daily entry data
 */
export const validateDailyEntry = (
  habitId: string,
  date: string,
  reflection?: string
): { valid: boolean; error?: string } => {
  if (!habitId) {
    return { valid: false, error: 'Habit ID is required' };
  }

  if (!date || !isValidDateFormat(date)) {
    return { valid: false, error: 'Valid date (YYYY-MM-DD) is required' };
  }

  if (reflection && reflection.length > 500) {
    return { valid: false, error: 'Reflection must be 500 characters or less' };
  }

  return { valid: true };
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDateFormat = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return formatDate(new Date());
};

/**
 * Generate a composite key for daily entry lookup
 */
export const generateEntryKey = (habitId: string, date: string): string => {
  return `${habitId}_${date}`;
};

/**
 * Parse entry key back to habitId and date
 */
export const parseEntryKey = (
  key: string
): { habitId: string; date: string } | null => {
  const parts = key.split('_');
  if (parts.length !== 2) return null;

  const [habitId, date] = parts;
  return { habitId, date };
};

/**
 * Group entries by date
 */
export const groupEntriesByDate = (
  entries: DailyEntryData[]
): Map<string, DailyEntryData[]> => {
  const grouped = new Map<string, DailyEntryData[]>();

  entries.forEach(entry => {
    const existing = grouped.get(entry.date) || [];
    grouped.set(entry.date, [...existing, entry]);
  });

  return grouped;
};

/**
 * Group entries by habit ID
 */
export const groupEntriesByHabit = (
  entries: DailyEntryData[]
): Map<string, DailyEntryData[]> => {
  const grouped = new Map<string, DailyEntryData[]>();

  entries.forEach(entry => {
    const existing = grouped.get(entry.habitId) || [];
    grouped.set(entry.habitId, [...existing, entry]);
  });

  return grouped;
};

/**
 * Find entry for specific habit and date
 */
export const findEntry = (
  entries: DailyEntryData[],
  habitId: string,
  date: string
): DailyEntryData | undefined => {
  return entries.find(e => e.habitId === habitId && e.date === date);
};

/**
 * Sort entries by date (most recent first)
 */
export const sortEntriesByDate = (
  entries: DailyEntryData[],
  ascending = false
): DailyEntryData[] => {
  return [...entries].sort((a, b) => {
    const comparison = a.date.localeCompare(b.date);
    return ascending ? comparison : -comparison;
  });
};
