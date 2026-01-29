/**
 * Unit Tests for Format Duration Utility
 * Story: TEST-1 - Dashboard Demo
 *
 * @jest-environment node
 */

const { formatDuration, formatDurationShort } = require('../../.aios-core/utils/format-duration');

describe('formatDuration', () => {
  describe('basic conversions', () => {
    test('should format seconds only', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(30000)).toBe('30s');
      expect(formatDuration(59000)).toBe('59s');
    });

    test('should format minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(61000)).toBe('1m 1s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(3599000)).toBe('59m 59s');
    });

    test('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(3661000)).toBe('1h 1m 1s');
      expect(formatDuration(7200000)).toBe('2h');
      expect(formatDuration(7325000)).toBe('2h 2m 5s');
    });

    test('should format days', () => {
      expect(formatDuration(86400000)).toBe('1d');
      expect(formatDuration(90061000)).toBe('1d 1h 1m 1s');
      expect(formatDuration(172800000)).toBe('2d');
    });
  });

  describe('edge cases', () => {
    test('should handle zero', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    test('should handle negative numbers', () => {
      expect(formatDuration(-1000)).toBe('-1s');
      expect(formatDuration(-3661000)).toBe('-1h 1m 1s');
    });

    test('should handle very large numbers', () => {
      const veryLarge = 1000 * 24 * 60 * 60 * 1000; // 1000 days
      expect(formatDuration(veryLarge)).toBe('999d+');
    });

    test('should handle non-numeric input', () => {
      expect(formatDuration(null)).toBe('0s');
      expect(formatDuration(undefined)).toBe('0s');
      expect(formatDuration('invalid')).toBe('0s');
      expect(formatDuration(NaN)).toBe('0s');
    });

    test('should handle floating point numbers', () => {
      expect(formatDuration(1500)).toBe('1s');
      expect(formatDuration(1999)).toBe('1s');
      expect(formatDuration(61500)).toBe('1m 1s');
    });
  });

  describe('sub-second values', () => {
    test('should show 0s for values less than 1 second', () => {
      expect(formatDuration(500)).toBe('0s');
      expect(formatDuration(999)).toBe('0s');
    });
  });
});

describe('formatDurationShort', () => {
  describe('basic conversions', () => {
    test('should format minutes and seconds', () => {
      expect(formatDurationShort(0)).toBe('0:00');
      expect(formatDurationShort(1000)).toBe('0:01');
      expect(formatDurationShort(60000)).toBe('1:00');
      expect(formatDurationShort(90000)).toBe('1:30');
    });

    test('should format hours, minutes, and seconds', () => {
      expect(formatDurationShort(3600000)).toBe('1:00:00');
      expect(formatDurationShort(3661000)).toBe('1:01:01');
      expect(formatDurationShort(7325000)).toBe('2:02:05');
    });

    test('should pad single digits', () => {
      expect(formatDurationShort(61000)).toBe('1:01');
      expect(formatDurationShort(3605000)).toBe('1:00:05');
    });
  });

  describe('edge cases', () => {
    test('should handle invalid input', () => {
      expect(formatDurationShort(null)).toBe('0:00');
      expect(formatDurationShort(-1000)).toBe('0:00');
      expect(formatDurationShort(NaN)).toBe('0:00');
    });
  });
});
