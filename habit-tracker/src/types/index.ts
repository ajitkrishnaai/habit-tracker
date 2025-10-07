// Core data types for the habit tracker app

export interface Habit {
  id: string;
  name: string;
  createdDate: Date;
  isActive: boolean;
  order: number;
}

export interface DailyEntry {
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
  habit: Habit;
  dailyEntry?: DailyEntry;
  stats: HabitStats;
  onToggleComplete: (_habitId: string, _completed: boolean) => void;
  onEditReflection: (_habitId: string, _reflection: string) => void;
}

export interface ProgressChartProps {
  habits: Habit[];
  entries: DailyEntry[];
  dateRange: {
    start: string;
    end: string;
  };
}
