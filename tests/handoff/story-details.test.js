'use strict';

/**
 * Tests for Story Details Aggregator
 *
 * Tests aggregateStoryDetails() and formatStoryDetailsTable().
 *
 * @see Story AIOX-HO-2.3
 */

const {
  aggregateStoryDetails,
  formatStoryDetailsTable,
} = require('../../.claude/lib/handoff/aggregators/story-details');

describe('Story Details Aggregator (Story AIOX-HO-2.3)', () => {
  // --- aggregateStoryDetails ---

  describe('aggregateStoryDetails()', () => {
    test('returns empty array for null or empty events', () => {
      expect(aggregateStoryDetails(null)).toEqual([]);
      expect(aggregateStoryDetails([])).toEqual([]);
      expect(aggregateStoryDetails(undefined)).toEqual([]);
    });

    test('returns empty array when no events have story field', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
      ];
      expect(aggregateStoryDetails(events)).toEqual([]);
    });

    test('aggregates single story with multiple events', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.3' },
        { timestamp: '2026-03-25T11:00:00Z', type: 'periodic', agent: 'dev', story: 'HO-2.3', prompt_count: 10 },
        { timestamp: '2026-03-25T12:00:00Z', type: 'commit', agent: 'dev', story: 'HO-2.3' },
      ];

      const result = aggregateStoryDetails(events);
      expect(result).toHaveLength(1);
      expect(result[0].storyId).toBe('HO-2.3');
      expect(result[0].status).toBe('InProgress');
      expect(result[0].events).toBe(3);
      expect(result[0].agents).toEqual(['@dev']);
    });

    test('aggregates multiple stories sorted by event count', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.1' },
        { timestamp: '2026-03-25T10:30:00Z', type: 'periodic', agent: 'dev', story: 'HO-2.1', prompt_count: 5 },
        { timestamp: '2026-03-25T11:00:00Z', type: 'story_complete', agent: 'dev', story: 'HO-2.1' },
        { timestamp: '2026-03-25T12:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.2' },
        { timestamp: '2026-03-25T13:00:00Z', type: 'agent_switch', agent: 'qa', story: 'HO-2.2' },
      ];

      const result = aggregateStoryDetails(events);
      expect(result).toHaveLength(2);

      // HO-2.1 has 3 events (most), should be first
      expect(result[0].storyId).toBe('HO-2.1');
      expect(result[0].events).toBe(3);
      expect(result[0].status).toBe('Done');
      expect(result[0].agents).toEqual(['@dev']);

      // HO-2.2 has 2 events
      expect(result[1].storyId).toBe('HO-2.2');
      expect(result[1].events).toBe(2);
      expect(result[1].status).toBe('InProgress');
      expect(result[1].agents).toContain('@dev');
      expect(result[1].agents).toContain('@qa');
    });

    test('deduplicates agents per story', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.3' },
        { timestamp: '2026-03-25T11:00:00Z', type: 'periodic', agent: 'dev', story: 'HO-2.3' },
        { timestamp: '2026-03-25T12:00:00Z', type: 'commit', agent: 'dev', story: 'HO-2.3' },
      ];

      const result = aggregateStoryDetails(events);
      expect(result[0].agents).toEqual(['@dev']);
      expect(result[0].agents).toHaveLength(1);
    });

    test('determines status correctly based on story_complete event', () => {
      const eventsInProgress = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.3' },
      ];

      const eventsComplete = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.3' },
        { timestamp: '2026-03-25T14:00:00Z', type: 'story_complete', agent: 'dev', story: 'HO-2.3' },
      ];

      expect(aggregateStoryDetails(eventsInProgress)[0].status).toBe('InProgress');
      expect(aggregateStoryDetails(eventsComplete)[0].status).toBe('Done');
    });

    test('handles events without agent field', () => {
      const events = [
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', story: 'HO-2.3' },
      ];

      const result = aggregateStoryDetails(events);
      expect(result).toHaveLength(1);
      expect(result[0].agents).toEqual([]);
    });
  });

  // --- formatStoryDetailsTable ---

  describe('formatStoryDetailsTable()', () => {
    test('returns message for empty stories', () => {
      expect(formatStoryDetailsTable([])).toBe('No stories tracked in this session.');
      expect(formatStoryDetailsTable(null)).toBe('No stories tracked in this session.');
    });

    test('formats single story into table', () => {
      const stories = [
        { storyId: 'HO-2.3', status: 'InProgress', events: 5, agents: ['@dev'] },
      ];

      const result = formatStoryDetailsTable(stories);

      // Should have header, separator, and 1 data row
      const lines = result.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('Story');
      expect(lines[0]).toContain('Status');
      expect(lines[0]).toContain('Events');
      expect(lines[0]).toContain('Agents');
      expect(lines[2]).toContain('HO-2.3');
      expect(lines[2]).toContain('InProgress');
      expect(lines[2]).toContain('@dev');
    });

    test('formats multiple stories with proper alignment', () => {
      const stories = [
        { storyId: 'AIOX-HO-2.1', status: 'Done', events: 18, agents: ['@sm', '@dev'] },
        { storyId: 'AIOX-HO-2.2', status: 'InProgress', events: 12, agents: ['@dev', '@qa'] },
      ];

      const result = formatStoryDetailsTable(stories);
      const lines = result.split('\n');

      expect(lines).toHaveLength(4); // header + separator + 2 rows
      expect(lines[2]).toContain('AIOX-HO-2.1');
      expect(lines[2]).toContain('Done');
      expect(lines[3]).toContain('AIOX-HO-2.2');
      expect(lines[3]).toContain('InProgress');
    });
  });
});
