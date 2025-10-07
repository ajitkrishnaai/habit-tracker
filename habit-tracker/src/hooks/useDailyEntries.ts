import { useCallback, useMemo } from 'react';
import { orderBy as firestoreOrderBy, where, Timestamp } from 'firebase/firestore';
import { useFirestore } from './useFirestore';
import type { DailyEntry, DailyEntryData } from '../types';
import {
  convertToDailyEntryData,
  createNewDailyEntry,
  validateDailyEntry,
  findEntry,
  groupEntriesByDate,
  groupEntriesByHabit,
  sortEntriesByDate,
} from '../services/dailyEntryService';

interface UseDailyEntriesReturn {
  entries: DailyEntryData[];
  loading: boolean;
  error: string | null;
  saveEntry: (
    habitId: string,
    date: string,
    completed: boolean,
    reflection?: string
  ) => Promise<string>;
  updateEntry: (
    entryId: string,
    updates: Partial<DailyEntryData>
  ) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  getEntryForHabitAndDate: (
    habitId: string,
    date: string
  ) => DailyEntryData | undefined;
  getEntriesByDate: (date: string) => DailyEntryData[];
  getEntriesByHabit: (habitId: string) => DailyEntryData[];
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  updateReflection: (
    habitId: string,
    date: string,
    reflection: string
  ) => Promise<void>;
}

/**
 * Custom hook for daily entry operations
 * Provides type-safe CRUD operations for daily habit completions and reflections
 *
 * @param dateFilter - Optional date to filter entries (YYYY-MM-DD format)
 * @param habitIdFilter - Optional habit ID to filter entries
 */
export const useDailyEntries = (
  dateFilter?: string,
  habitIdFilter?: string
): UseDailyEntriesReturn => {
  const COLLECTION_PATH = 'entries';

  // Build query constraints based on filters
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (dateFilter) {
      constraints.push(where('date', '==', dateFilter));
    }

    if (habitIdFilter) {
      constraints.push(where('habitId', '==', habitIdFilter));
    }

    // Always order by timestamp descending (most recent first)
    constraints.push(firestoreOrderBy('timestamp', 'desc'));

    return constraints;
  }, [dateFilter, habitIdFilter]);

  // Use Firestore hook with query constraints
  const {
    data: firestoreEntries,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useFirestore<DailyEntry>(COLLECTION_PATH, queryConstraints);

  // Convert Firestore entries to client-side format
  const entries = useMemo(() => {
    return firestoreEntries.map(convertToDailyEntryData);
  }, [firestoreEntries]);

  /**
   * Save a new entry or update existing one
   */
  const saveEntry = useCallback(
    async (
      habitId: string,
      date: string,
      completed: boolean,
      reflection: string = ''
    ): Promise<string> => {
      // Validate entry data
      const validation = validateDailyEntry(habitId, date, reflection);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check if entry already exists for this habit and date
      const existingEntry = findEntry(entries, habitId, date);

      if (existingEntry) {
        // Update existing entry
        await updateDocument(COLLECTION_PATH, existingEntry.id, {
          completed,
          reflection: reflection.trim(),
          timestamp: Timestamp.now(),
        });
        return existingEntry.id;
      } else {
        // Create new entry
        const newEntry = createNewDailyEntry(habitId, date, completed, reflection);
        const entryId = await addDocument(COLLECTION_PATH, newEntry);
        return entryId;
      }
    },
    [entries, addDocument, updateDocument]
  );

  /**
   * Update an existing entry
   */
  const updateEntry = useCallback(
    async (
      entryId: string,
      updates: Partial<DailyEntryData>
    ): Promise<void> => {
      // Validate if reflection is being updated
      if (updates.reflection !== undefined && updates.reflection.length > 500) {
        throw new Error('Reflection must be 500 characters or less');
      }

      // Prepare updates (convert Date to Timestamp if needed)
      const entryUpdates: Partial<DailyEntry> = {
        date: updates.date,
        habitId: updates.habitId,
        completed: updates.completed,
        reflection: updates.reflection?.trim(),
      };

      // Always update timestamp
      entryUpdates.timestamp = Timestamp.now();

      // Update in Firestore
      await updateDocument(COLLECTION_PATH, entryId, entryUpdates);
    },
    [updateDocument]
  );

  /**
   * Delete an entry
   */
  const deleteEntry = useCallback(
    async (entryId: string): Promise<void> => {
      await deleteDocument(COLLECTION_PATH, entryId);
    },
    [deleteDocument]
  );

  /**
   * Get entry for specific habit and date
   */
  const getEntryForHabitAndDate = useCallback(
    (habitId: string, date: string): DailyEntryData | undefined => {
      return findEntry(entries, habitId, date);
    },
    [entries]
  );

  /**
   * Get all entries for a specific date
   */
  const getEntriesByDate = useCallback(
    (date: string): DailyEntryData[] => {
      return entries.filter(entry => entry.date === date);
    },
    [entries]
  );

  /**
   * Get all entries for a specific habit
   */
  const getEntriesByHabit = useCallback(
    (habitId: string): DailyEntryData[] => {
      return sortEntriesByDate(
        entries.filter(entry => entry.habitId === habitId),
        false
      );
    },
    [entries]
  );

  /**
   * Toggle completion status for a habit on a specific date
   */
  const toggleCompletion = useCallback(
    async (habitId: string, date: string): Promise<void> => {
      const existingEntry = findEntry(entries, habitId, date);

      if (existingEntry) {
        // Toggle existing entry
        await updateDocument(COLLECTION_PATH, existingEntry.id, {
          completed: !existingEntry.completed,
          timestamp: Timestamp.now(),
        });
      } else {
        // Create new entry with completed = true
        const newEntry = createNewDailyEntry(habitId, date, true);
        await addDocument(COLLECTION_PATH, newEntry);
      }
    },
    [entries, addDocument, updateDocument]
  );

  /**
   * Update reflection for a habit on a specific date
   */
  const updateReflection = useCallback(
    async (habitId: string, date: string, reflection: string): Promise<void> => {
      // Validate reflection
      if (reflection.length > 500) {
        throw new Error('Reflection must be 500 characters or less');
      }

      const existingEntry = findEntry(entries, habitId, date);

      if (existingEntry) {
        // Update existing entry
        await updateDocument(COLLECTION_PATH, existingEntry.id, {
          reflection: reflection.trim(),
          timestamp: Timestamp.now(),
        });
      } else {
        // Create new entry with reflection (completed = false by default)
        const newEntry = createNewDailyEntry(habitId, date, false, reflection);
        await addDocument(COLLECTION_PATH, newEntry);
      }
    },
    [entries, addDocument, updateDocument]
  );

  return {
    entries,
    loading,
    error,
    saveEntry,
    updateEntry,
    deleteEntry,
    getEntryForHabitAndDate,
    getEntriesByDate,
    getEntriesByHabit,
    toggleCompletion,
    updateReflection,
  };
};
