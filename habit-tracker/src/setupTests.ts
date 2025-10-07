import '@testing-library/jest-dom';

// Custom Jest matchers for habit tracker testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidHabitData(): R;
      toBeValidFirestoreDate(): R;
    }
  }
}

// Custom matcher to validate habit data structure
expect.extend({
  toHaveValidHabitData(received) {
    const isValid =
      received &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      received.name.length > 0 &&
      received.createdDate &&
      typeof received.isActive === 'boolean';

    if (isValid) {
      return {
        message: () => `Expected habit data to be invalid, but it was valid`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected habit data to be valid, but got: ${JSON.stringify(received)}`,
        pass: false,
      };
    }
  },

  toBeValidFirestoreDate(received) {
    const isValid =
      received &&
      (received instanceof Date ||
        (typeof received === 'object' &&
          received.seconds &&
          received.nanoseconds));

    if (isValid) {
      return {
        message: () => `Expected ${received} not to be a valid Firestore date`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid Firestore date`,
        pass: false,
      };
    }
  },
});

// Helper functions for testing
export const createMockHabit = (overrides = {}) => ({
  id: 'test-habit-id',
  name: 'Test Habit',
  createdDate: new Date(),
  isActive: true,
  order: 0,
  ...overrides,
});

export const createMockDailyEntry = (overrides = {}) => ({
  id: 'test-entry-id',
  date: '2023-01-01',
  habitId: 'test-habit-id',
  completed: false,
  reflection: '',
  timestamp: new Date(),
  ...overrides,
});

// Utility to wait for async operations in tests
export const waitForAsync = (ms = 0) =>
  new Promise(resolve => setTimeout(resolve, ms));
