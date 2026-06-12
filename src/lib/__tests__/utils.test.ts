import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDate,
  formatRelativeTime,
  slugify,
  truncate,
  getInitials,
  debounce,
  sleep,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(30)).toBe('30s');
      expect(formatTime(90)).toBe('1m 30s');
      expect(formatTime(3661)).toBe('1h 1m');
      expect(formatTime(7200)).toBe('2h 0m');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative times', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(formatRelativeTime(now)).toBe('just now');
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1m ago');
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
      expect(formatRelativeTime(oneDayAgo)).toBe('1d ago');
    });
  });

  describe('slugify', () => {
    it('should create valid slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('AI Engineer Roadmap!')).toBe('ai-engineer-roadmap');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('Special@#$%Chars')).toBe('specialchars');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Exact Length', 12)).toBe('Exact Length');
    });
  });

  describe('getInitials', () => {
    it('should extract initials', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice')).toBe('A');
      expect(getInitials('John Jacob Smith')).toBe('JJ');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let count = 0;
      const debounced = debounce(() => count++, 50);
      
      debounced();
      debounced();
      debounced();
      expect(count).toBe(0);
      
      await sleep(100);
      expect(count).toBe(1);
    });
  });
});