// Validation utilities for forms and data

export const validateHabitName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Habit name is required';
  }
  if (name.trim().length > 50) {
    return 'Habit name must be 50 characters or less';
  }
  return null;
};

export const validateReflection = (reflection: string): string | null => {
  if (reflection.length > 500) {
    return 'Reflection must be 500 characters or less';
  }
  return null;
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};
