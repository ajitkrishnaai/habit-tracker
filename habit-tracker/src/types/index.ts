// Core data types for the habit tracker app

import { Timestamp } from 'firebase/firestore';

// Habit document structure in Firestore: users/{userId}/habits/{habitId}
export interface Habit {
  id: string;
  name: string;
  createdDate: Timestamp;
  isActive: boolean;
  order: number;
}

// DailyEntry document structure in Firestore: users/{userId}/entries/{entryId}
export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  habitId: string;
  completed: boolean;
  reflection: string;
  timestamp: Timestamp;
}

// Client-side versions with Date objects (converted from Firestore Timestamps)
export interface HabitData {
  id: string;
  name: string;
  createdDate: Date;
  isActive: boolean;
  order: number;
}

export interface DailyEntryData {
  id: string;
  date: string; // YYYY-MM-DD format
  habitId: string;
  completed: boolean;
  reflection: string;
  timestamp: Date;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0-100 percentage
  lastCompletedDate?: string;
}

export interface User {
  id: string;
  createdAt: Date;
  lastActiveDate: Date;
}

// UI state types
export interface AppState {
  isLoading: boolean;
  error: string | null;
  currentDate: string;
  selectedHabitId: string | null;
}

// Firebase related types
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Form types
export interface HabitFormData {
  name: string;
}

export interface ReflectionFormData {
  reflection: string;
}

// View/Component prop types
export interface HabitCardProps {
  habit: HabitData;
  dailyEntry?: DailyEntryData;
  stats: HabitStats;
  onToggleComplete: (_habitId: string, _completed: boolean) => void;
  onEditReflection: (_habitId: string, _reflection: string) => void;
}

export interface ProgressChartProps {
  habits: HabitData[];
  entries: DailyEntryData[];
  dateRange: {
    start: string;
    end: string;
  };
}
