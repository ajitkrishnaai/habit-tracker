import { useCallback, useMemo } from 'react';
import { orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from './useFirestore';
import type { Habit, HabitData } from '../types';
import {
  convertToHabitData,
  createNewHabit,
  validateHabit,
  getNextOrder,
  reorderHabits,
} from '../services/habitService';

interface UseHabitsReturn {
  habits: HabitData[];
  loading: boolean;
  error: string | null;
  addHabit: (name: string) => Promise<string>;
  updateHabit: (habitId: string, updates: Partial<HabitData>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  reactivateHabit: (habitId: string) => Promise<void>;
  reorderHabitsList: (habitIds: string[]) => Promise<void>;
}

/**
 * Custom hook for habit-specific operations
 * Provides type-safe CRUD operations for habits with validation and business logic
 */
export const useHabits = (): UseHabitsReturn => {
  const COLLECTION_PATH = 'habits';

  // Use Firestore hook with ordering by order field
  const {
    data: firestoreHabits,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useFirestore<Habit>(COLLECTION_PATH, [orderBy('order', 'asc')]);

  // Convert Firestore habits to client-side format
  const habits = useMemo(() => {
    return firestoreHabits.map(convertToHabitData);
  }, [firestoreHabits]);

  /**
   * Add a new habit
   */
  const addHabit = useCallback(
    async (name: string): Promise<string> => {
      // Validate habit name
      const validation = validateHabit(name);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Get next order number
      const order = getNextOrder(habits);

      // Create new habit object
      const newHabit = createNewHabit(name, order);

      // Save to Firestore
      const habitId = await addDocument(COLLECTION_PATH, newHabit);

      return habitId;
    },
    [habits, addDocument]
  );

  /**
   * Update an existing habit
   */
  const updateHabit = useCallback(
    async (habitId: string, updates: Partial<HabitData>): Promise<void> => {
      // Validate name if it's being updated
      if (updates.name !== undefined) {
        const validation = validateHabit(updates.name);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Prepare updates (convert Date to Timestamp if needed)
      const habitUpdates: Partial<Habit> = {
        id: updates.id,
        name: updates.name,
        isActive: updates.isActive,
        order: updates.order,
      };

      // Convert Date to Timestamp if createdDate exists
      if (updates.createdDate) {
        habitUpdates.createdDate = Timestamp.fromDate(updates.createdDate);
      }

      // Update in Firestore
      await updateDocument(COLLECTION_PATH, habitId, habitUpdates);
    },
    [updateDocument]
  );

  /**
   * Delete a habit permanently
   */
  const deleteHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await deleteDocument(COLLECTION_PATH, habitId);

      // Reorder remaining habits
      const remainingHabits = habits.filter(h => h.id !== habitId);
      const reordered = reorderHabits(remainingHabits);

      // Batch update orders
      await Promise.all(
        reordered.map(habit =>
          updateDocument(COLLECTION_PATH, habit.id, { order: habit.order })
        )
      );
    },
    [habits, deleteDocument, updateDocument]
  );

  /**
   * Archive a habit (soft delete - keeps historical data)
   */
  const archiveHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await updateDocument(COLLECTION_PATH, habitId, { isActive: false });
    },
    [updateDocument]
  );

  /**
   * Reactivate an archived habit
   */
  const reactivateHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await updateDocument(COLLECTION_PATH, habitId, { isActive: true });
    },
    [updateDocument]
  );

  /**
   * Reorder habits based on new order
   */
  const reorderHabitsList = useCallback(
    async (habitIds: string[]): Promise<void> => {
      // Validate that all habit IDs exist
      const habitMap = new Map(habits.map(h => [h.id, h]));
      const invalidIds = habitIds.filter(id => !habitMap.has(id));

      if (invalidIds.length > 0) {
        throw new Error(`Invalid habit IDs: ${invalidIds.join(', ')}`);
      }

      // Create batch updates with new order
      const updates = habitIds.map((habitId, index) => ({
        habitId,
        order: index,
      }));

      // Update all habits in parallel
      await Promise.all(
        updates.map(({ habitId, order }) =>
          updateDocument(COLLECTION_PATH, habitId, { order })
        )
      );
    },
    [habits, updateDocument]
  );

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    reactivateHabit,
    reorderHabitsList,
  };
};
