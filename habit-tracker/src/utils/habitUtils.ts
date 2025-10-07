// Utility functions for habit calculations and operations

import type { Habit, DailyEntry, HabitStats } from '../types';
import { formatDate, parseDate, subtractDays } from './dateUtils';

export const calculateStreak = (
  entries: DailyEntry[],
  habitId: string
): number => {
  const habitEntries = entries
    .filter(entry => entry.habitId === habitId && entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (habitEntries.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();

  for (const entry of habitEntries) {
    const entryDate = parseDate(entry.date);
    const expectedDate = subtractDays(currentDate, streak);

    if (formatDate(entryDate) === formatDate(expectedDate)) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (
  entries: DailyEntry[],
  habitId: string
): number => {
  const habitEntries = entries
    .filter(entry => entry.habitId === habitId && entry.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (habitEntries.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < habitEntries.length; i++) {
    const prevDate = parseDate(habitEntries[i - 1].date);
    const currentDate = parseDate(habitEntries[i].date);
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
};

export const calculateCompletionRate = (
  entries: DailyEntry[],
  habitId: string,
  habit: Habit
): number => {
  const daysSinceCreated =
    Math.floor(
      (new Date().getTime() - habit.createdDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const completedEntries = entries.filter(
    entry => entry.habitId === habitId && entry.completed
  ).length;

  return Math.round((completedEntries / daysSinceCreated) * 100);
};

export const calculateHabitStats = (
  habit: Habit,
  entries: DailyEntry[]
): HabitStats => {
  const currentStreak = calculateStreak(entries, habit.id);
  const longestStreak = calculateLongestStreak(entries, habit.id);
  const totalCompletions = entries.filter(
    entry => entry.habitId === habit.id && entry.completed
  ).length;
  const completionRate = calculateCompletionRate(entries, habit.id, habit);

  const lastCompletedEntry = entries
    .filter(entry => entry.habitId === habit.id && entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return {
    habitId: habit.id,
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
    lastCompletedDate: lastCompletedEntry?.date,
  };
};

export const getNextHabitOrder = (habits: Habit[]): number => {
  return Math.max(0, ...habits.map(h => h.order)) + 1;
};
