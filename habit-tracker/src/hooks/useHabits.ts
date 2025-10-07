import { useState, useEffect } from 'react';
import type { Habit, DailyEntry } from '../types';

// This is a placeholder hook - will be replaced with Firebase integration later
export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Placeholder - will be replaced with Firebase calls
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock data for development
        const mockHabits: Habit[] = [
          {
            id: '1',
            name: 'Morning Exercise',
            createdDate: new Date('2024-01-01'),
            isActive: true,
            order: 0,
          },
        ];

        setHabits(mockHabits);
        setDailyEntries([]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addHabit = async (name: string) => {
    // Placeholder implementation
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      createdDate: new Date(),
      isActive: true,
      order: habits.length,
    };

    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabitCompletion = async (
    habitId: string,
    date: string,
    completed: boolean
  ) => {
    // Placeholder implementation
    const existingEntry = dailyEntries.find(
      entry => entry.habitId === habitId && entry.date === date
    );

    if (existingEntry) {
      setDailyEntries(prev =>
        prev.map(entry =>
          entry.id === existingEntry.id
            ? { ...entry, completed, timestamp: new Date() }
            : entry
        )
      );
    } else {
      const newEntry: DailyEntry = {
        id: Date.now().toString(),
        date,
        habitId,
        completed,
        reflection: '',
        timestamp: new Date(),
      };
      setDailyEntries(prev => [...prev, newEntry]);
    }
  };

  const updateReflection = async (
    habitId: string,
    date: string,
    reflection: string
  ) => {
    // Placeholder implementation
    const existingEntry = dailyEntries.find(
      entry => entry.habitId === habitId && entry.date === date
    );

    if (existingEntry) {
      setDailyEntries(prev =>
        prev.map(entry =>
          entry.id === existingEntry.id
            ? { ...entry, reflection, timestamp: new Date() }
            : entry
        )
      );
    }
  };

  return {
    habits,
    dailyEntries,
    isLoading,
    error,
    addHabit,
    toggleHabitCompletion,
    updateReflection,
  };
};
