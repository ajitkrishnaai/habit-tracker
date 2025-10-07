import {
  formatDate,
  formatDisplayDate,
  getTodayString,
  parseDate,
  addDays,
  isToday,
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date for display', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDisplayDate(date);
      expect(formatted).toContain('January 15, 2024');
    });
  });

  describe('getTodayString', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const today = getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('parseDate', () => {
    it('should parse date string correctly', () => {
      const dateString = '2024-01-15';
      const parsed = parseDate(dateString);
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0); // January is 0
      expect(parsed.getDate()).toBe(15);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(formatDate(result)).toBe('2024-01-20');
    });

    it('should subtract days when adding negative number', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(formatDate(result)).toBe('2024-01-10');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = getTodayString();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = formatDate(addDays(new Date(), -1));
      expect(isToday(yesterday)).toBe(false);
    });
  });
});
