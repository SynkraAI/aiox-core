'use strict';

/**
 * Tests for Event Timeline Formatter
 *
 * Tests formatCompactTimeline(), formatEvent(), extractTime().
 *
 * @see Story AIOX-HO-2.3
 */

const {
  formatCompactTimeline,
  formatEvent,
  extractTime,
  DEFAULT_LIMIT,
} = require('../../.claude/lib/handoff/formatters/event-timeline');

describe('Event Timeline Formatter (Story AIOX-HO-2.3)', () => {
  // --- extractTime ---

  describe('extractTime()', () => {
    test('extracts HH:MM from ISO 8601 timestamp', () => {
      expect(extractTime('2026-03-25T14:30:00Z')).toBe('14:30');
      expect(extractTime('2026-03-25T09:05:00Z')).toBe('09:05');
      expect(extractTime('2026-03-25T00:00:00Z')).toBe('00:00');
    });

    test('extracts HH:MM from ISO timestamp with timezone offset', () => {
      expect(extractTime('2026-03-25T14:30:00+03:00')).toBe('14:30');
      expect(extractTime('2026-03-25T23:59:59-05:00')).toBe('23:59');
    });

    test('returns ??:?? for null, undefined, or non-string input', () => {
      expect(extractTime(null)).toBe('??:??');
      expect(extractTime(undefined)).toBe('??:??');
      expect(extractTime(123)).toBe('??:??');
      expect(extractTime('')).toBe('??:??');
    });

    test('returns ??:?? for unparseable string', () => {
      expect(extractTime('not-a-date')).toBe('??:??');
      expect(extractTime('random text')).toBe('??:??');
    });
  });

  // --- formatEvent ---

  describe('formatEvent()', () => {
    test('formats a standard event with all fields', () => {
      const event = {
        timestamp: '2026-03-25T14:30:00Z',
        agent: 'dev',
        type: 'story_start',
        story: 'AIOX-HO-2.3',
      };
      expect(formatEvent(event)).toBe('[14:30] @dev story_start AIOX-HO-2.3');
    });

    test('formats periodic event with prompt count', () => {
      const event = {
        timestamp: '2026-03-25T10:00:00Z',
        agent: 'dev',
        type: 'periodic',
        prompt_count: 25,
      };
      expect(formatEvent(event)).toBe('[10:00] @dev periodic (prompt 25)');
    });

    test('handles missing agent with @?', () => {
      const event = {
        timestamp: '2026-03-25T10:00:00Z',
        type: 'story_start',
        story: 'HO-2.3',
      };
      expect(formatEvent(event)).toBe('[10:00] @? story_start HO-2.3');
    });

    test('handles missing story field', () => {
      const event = {
        timestamp: '2026-03-25T10:00:00Z',
        agent: 'qa',
        type: 'agent_switch',
      };
      expect(formatEvent(event)).toBe('[10:00] @qa agent_switch');
    });

    test('returns empty string for null event', () => {
      expect(formatEvent(null)).toBe('');
      expect(formatEvent(undefined)).toBe('');
    });

    test('handles missing type field', () => {
      const event = {
        timestamp: '2026-03-25T10:00:00Z',
        agent: 'dev',
      };
      expect(formatEvent(event)).toBe('[10:00] @dev unknown');
    });
  });

  // --- formatCompactTimeline ---

  describe('formatCompactTimeline()', () => {
    test('returns "No events recorded." for empty or null input', () => {
      expect(formatCompactTimeline(null)).toBe('No events recorded.');
      expect(formatCompactTimeline([])).toBe('No events recorded.');
      expect(formatCompactTimeline(undefined)).toBe('No events recorded.');
    });

    test('formats last 10 events by default in reverse order (newest first)', () => {
      const events = [];
      for (let i = 0; i < 15; i++) {
        events.push({
          timestamp: `2026-03-25T${String(i + 8).padStart(2, '0')}:00:00Z`,
          agent: 'dev',
          type: 'periodic',
          prompt_count: (i + 1) * 5,
        });
      }

      const result = formatCompactTimeline(events);
      const lines = result.split('\n');

      // Should show 10 lines (DEFAULT_LIMIT)
      expect(lines).toHaveLength(10);

      // Newest first (22:00 before 21:00)
      expect(lines[0]).toContain('[22:00]');
      expect(lines[9]).toContain('[13:00]');
    });

    test('shows all events when fewer than limit', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', agent: 'dev', type: 'story_start', story: 'HO-2.3' },
        { timestamp: '2026-03-25T11:00:00Z', agent: 'dev', type: 'commit', story: 'HO-2.3' },
      ];

      const result = formatCompactTimeline(events);
      const lines = result.split('\n');

      expect(lines).toHaveLength(2);
      // Newest first
      expect(lines[0]).toContain('[11:00]');
      expect(lines[1]).toContain('[10:00]');
    });

    test('respects custom limit parameter', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', agent: 'dev', type: 'story_start', story: 'HO-2.3' },
        { timestamp: '2026-03-25T11:00:00Z', agent: 'dev', type: 'periodic', prompt_count: 5 },
        { timestamp: '2026-03-25T12:00:00Z', agent: 'qa', type: 'agent_switch', story: 'HO-2.3' },
      ];

      const result = formatCompactTimeline(events, 2);
      const lines = result.split('\n');

      expect(lines).toHaveLength(2);
      // Should show last 2 events, newest first
      expect(lines[0]).toContain('[12:00]');
      expect(lines[1]).toContain('[11:00]');
    });

    test('DEFAULT_LIMIT is 10', () => {
      expect(DEFAULT_LIMIT).toBe(10);
    });
  });
});
