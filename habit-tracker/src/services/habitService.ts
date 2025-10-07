import { Timestamp } from 'firebase/firestore';
import { Habit, HabitData } from '../types';

/**
 * Habit Service
 * Business logic layer for habit data operations
 * Provides type-safe functions for saving, loading, updating, and deleting habits
 */

/**
 * Convert Firestore Habit to client-side HabitData
 */
export const convertToHabitData = (habit: Habit): HabitData => {
  return {
    id: habit.id,
    name: habit.name,
    createdDate: habit.createdDate.toDate(),
    isActive: habit.isActive,
    order: habit.order,
  };
};

/**
 * Convert client-side HabitData to Firestore Habit format
 */
export const convertToHabit = (habitData: Partial<HabitData>): Partial<Habit> => {
  const habit: Partial<Habit> = {
    ...habitData,
  };

  // Convert Date to Timestamp if createdDate exists
  if (habitData.createdDate) {
    habit.createdDate = Timestamp.fromDate(habitData.createdDate);
  }

  return habit;
};

/**
 * Create a new habit object with default values
 */
export const createNewHabit = (name: string, order: number): Omit<Habit, 'id'> => {
  return {
    name: name.trim(),
    createdDate: Timestamp.now(),
    isActive: true,
    order,
  };
};

/**
 * Validate habit data
 */
export const validateHabit = (name: string): { valid: boolean; error?: string } => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { valid: false, error: 'Habit name is required' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Habit name must be 100 characters or less' };
  }

  return { valid: true };
};

/**
 * Sort habits by order
 */
export const sortHabitsByOrder = (habits: HabitData[]): HabitData[] => {
  return [...habits].sort((a, b) => a.order - b.order);
};

/**
 * Get the next available order number for a new habit
 */
export const getNextOrder = (habits: HabitData[]): number => {
  if (habits.length === 0) return 0;
  return Math.max(...habits.map(h => h.order)) + 1;
};

/**
 * Reorder habits after deletion or reordering
 */
export const reorderHabits = (habits: HabitData[]): HabitData[] => {
  const sorted = sortHabitsByOrder(habits);
  return sorted.map((habit, index) => ({
    ...habit,
    order: index,
  }));
};
