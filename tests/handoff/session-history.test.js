'use strict';

/**
 * Tests for Session History Command
 *
 * Tests scanArchives(), parseSessionMetadata(), formatHistoryTable(),
 * generateHistory(), formatDuration(), extractDate().
 *
 * @see Story AIOX-HO-2.3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  generateHistory,
  scanArchives,
  formatHistoryTable,
  parseSessionMetadata,
  formatDuration,
  extractDate,
  DEFAULT_LIMIT,
} = require('../../.claude/lib/handoff/commands/session-history');

const { serializeState } = require('../../.claude/lib/handoff/session-state');

describe('Session History Command (Story AIOX-HO-2.3)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `test-session-history-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {
      // Ignore cleanup errors
    }
  });

  /**
   * Helper: create an archived state file in the temp archive directory.
   */
  function createArchivedState(project, filename, state) {
    const archiveDir = path.join(tmpDir, '.aiox', 'session-history', project);
    fs.mkdirSync(archiveDir, { recursive: true });
    const filePath = path.join(archiveDir, filename);
    fs.writeFileSync(filePath, serializeState(state), 'utf8');
    return filePath;
  }

  // --- formatDuration ---

  describe('formatDuration()', () => {
    test('returns "<1m" for zero or negative', () => {
      expect(formatDuration(0)).toBe('<1m');
      expect(formatDuration(-100)).toBe('<1m');
      expect(formatDuration(null)).toBe('<1m');
    });

    test('returns minute-range durations', () => {
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(300000)).toBe('5m');
      expect(formatDuration(2700000)).toBe('45m');
    });

    test('returns hour-range durations', () => {
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(8100000)).toBe('2h 15m');
      expect(formatDuration(7200000)).toBe('2h');
    });
  });

  // --- extractDate ---

  describe('extractDate()', () => {
    test('extracts date from ISO timestamp', () => {
      expect(extractDate('2026-03-25T10:00:00Z')).toBe('2026-03-25');
    });

    test('returns "unknown" for null or empty input', () => {
      expect(extractDate(null)).toBe('unknown');
      expect(extractDate('')).toBe('unknown');
      expect(extractDate(undefined)).toBe('unknown');
    });

    test('returns "unknown" for unparseable string', () => {
      expect(extractDate('not-a-date')).toBe('unknown');
    });
  });

  // --- parseSessionMetadata ---

  describe('parseSessionMetadata()', () => {
    test('returns null for empty content', () => {
      expect(parseSessionMetadata('')).toBeNull();
      expect(parseSessionMetadata(null)).toBeNull();
      expect(parseSessionMetadata('   ')).toBeNull();
    });

    test('parses valid state YAML with session header and events', () => {
      const state = {
        session: { id: 'test-123', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-2.3' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 10 },
          { timestamp: '2026-03-25T14:00:00Z', type: 'agent_switch', agent: 'qa', story: 'HO-2.3' },
        ],
      };

      const yaml = serializeState(state);
      const metadata = parseSessionMetadata(yaml);

      expect(metadata).not.toBeNull();
      expect(metadata.sessionId).toBe('test-123');
      expect(metadata.started).toBe('2026-03-25T09:00:00Z');
      expect(metadata.project).toBe('aios-core');
      expect(metadata.eventCount).toBe(3);
      expect(metadata.agents).toContain('@dev');
      expect(metadata.agents).toContain('@qa');
      expect(metadata.durationMs).toBe(5 * 3600000); // 5 hours
    });

    test('deduplicates agents from multiple events', () => {
      const state = {
        session: { id: 'test-dup', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev' },
          { timestamp: '2026-03-25T11:00:00Z', type: 'story_start', agent: 'dev' },
        ],
      };

      const yaml = serializeState(state);
      const metadata = parseSessionMetadata(yaml);

      expect(metadata.agents).toEqual(['@dev']);
    });

    test('computes correct duration from first to last event', () => {
      const state = {
        session: { id: 'test-dur', started: '2026-03-25T10:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev' },
          { timestamp: '2026-03-25T12:30:00Z', type: 'periodic', agent: 'dev' },
        ],
      };

      const yaml = serializeState(state);
      const metadata = parseSessionMetadata(yaml);

      // 2h 30m = 9000000ms
      expect(metadata.durationMs).toBe(9000000);
    });

    test('returns null for content with no events and no session ID', () => {
      expect(parseSessionMetadata('some random text')).toBeNull();
    });
  });

  // --- scanArchives ---

  describe('scanArchives()', () => {
    test('returns empty when archive directory does not exist', () => {
      const result = scanArchives('nonexistent', { projectRoot: tmpDir });
      expect(result.sessions).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    test('scans single archived session file', () => {
      createArchivedState('aios-core', 'state-2026-03-25T10-00-00-000Z.yaml', {
        session: { id: 'sess-1', started: '2026-03-25T10:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-2.3' },
          { timestamp: '2026-03-25T12:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 10 },
        ],
      });

      const result = scanArchives('aios-core', { projectRoot: tmpDir });
      expect(result.sessions).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.sessions[0].sessionId).toBe('sess-1');
      expect(result.sessions[0].eventCount).toBe(2);
    });

    test('scans multiple sessions sorted by date descending', () => {
      createArchivedState('aios-core', 'state-2026-03-24T10-00-00-000Z.yaml', {
        session: { id: 'sess-old', started: '2026-03-24T10:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-24T10:00:00Z', type: 'agent_switch', agent: 'dev' },
        ],
      });

      createArchivedState('aios-core', 'state-2026-03-25T10-00-00-000Z.yaml', {
        session: { id: 'sess-new', started: '2026-03-25T10:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev' },
          { timestamp: '2026-03-25T14:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 20 },
        ],
      });

      const result = scanArchives('aios-core', { projectRoot: tmpDir });
      expect(result.sessions).toHaveLength(2);
      expect(result.totalCount).toBe(2);

      // Most recent first
      expect(result.sessions[0].sessionId).toBe('sess-new');
      expect(result.sessions[1].sessionId).toBe('sess-old');
    });

    test('respects limit parameter', () => {
      // Create 5 archived sessions
      for (let i = 1; i <= 5; i++) {
        createArchivedState('aios-core', `state-2026-03-${String(20 + i).padStart(2, '0')}T10-00-00-000Z.yaml`, {
          session: { id: `sess-${i}`, started: `2026-03-${20 + i}T10:00:00Z`, project: 'aios-core' },
          events: [
            { timestamp: `2026-03-${20 + i}T10:00:00Z`, type: 'agent_switch', agent: 'dev' },
          ],
        });
      }

      const result = scanArchives('aios-core', { projectRoot: tmpDir, limit: 3 });
      expect(result.sessions).toHaveLength(3);
      expect(result.totalCount).toBe(5);
    });

    test('skips empty/tiny files', () => {
      // Create a valid file
      createArchivedState('aios-core', 'state-2026-03-25T10-00-00-000Z.yaml', {
        session: { id: 'sess-valid', started: '2026-03-25T10:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev' },
        ],
      });

      // Create a tiny/empty file
      const archiveDir = path.join(tmpDir, '.aiox', 'session-history', 'aios-core');
      fs.writeFileSync(path.join(archiveDir, 'state-2026-03-24T10-00-00-000Z.yaml'), '', 'utf8');

      const result = scanArchives('aios-core', { projectRoot: tmpDir });
      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0].sessionId).toBe('sess-valid');
    });

    test('DEFAULT_LIMIT is 20', () => {
      expect(DEFAULT_LIMIT).toBe(20);
    });
  });

  // --- formatHistoryTable ---

  describe('formatHistoryTable()', () => {
    test('shows "No archived sessions" for empty sessions', () => {
      const result = formatHistoryTable('aios-core', [], 0, 20);
      expect(result).toContain('No archived sessions found');
      expect(result).toContain('Session History -- aios-core');
    });

    test('formats sessions into CLI table', () => {
      const sessions = [
        {
          sessionId: 'a3f2b8c4-test-session',
          started: '2026-03-25T09:00:00Z',
          project: 'aios-core',
          eventCount: 42,
          agents: ['@sm', '@dev', '@qa'],
          durationMs: 20700000, // 5h 45m
        },
      ];

      const result = formatHistoryTable('aios-core', sessions, 1, 20);

      expect(result).toContain('Session History -- aios-core');
      expect(result).toContain('2026-03-25');
      expect(result).toContain('42');
      expect(result).toContain('@sm, @dev, @qa');
      expect(result).toContain('5h 45m');
      expect(result).toContain('a3f2b8c4-tes'); // Truncated to 12 chars
    });

    test('shows footer with "use --last N" when totalCount > limit', () => {
      const sessions = [
        {
          sessionId: 'sess-1',
          started: '2026-03-25T09:00:00Z',
          project: 'aios-core',
          eventCount: 10,
          agents: ['@dev'],
          durationMs: 3600000,
        },
      ];

      const result = formatHistoryTable('aios-core', sessions, 45, 20);
      expect(result).toContain('Showing last 1 of 45 sessions');
      expect(result).toContain('--last N');
    });

    test('shows "Showing all" when totalCount <= limit', () => {
      const sessions = [
        {
          sessionId: 'sess-1',
          started: '2026-03-25T09:00:00Z',
          project: 'aios-core',
          eventCount: 10,
          agents: ['@dev'],
          durationMs: 3600000,
        },
      ];

      const result = formatHistoryTable('aios-core', sessions, 1, 20);
      expect(result).toContain('Showing all 1 sessions');
    });
  });

  // --- generateHistory ---

  describe('generateHistory()', () => {
    test('returns usage message for missing project', () => {
      const result = generateHistory('');
      expect(result).toContain('Usage');
      expect(result).toContain('session-history');
    });

    test('returns empty result for project with no archives', () => {
      const result = generateHistory('no-archives', { projectRoot: tmpDir });
      expect(result).toContain('No archived sessions found');
    });

    test('generates full report for project with archives', () => {
      createArchivedState('my-project', 'state-2026-03-25T10-00-00-000Z.yaml', {
        session: { id: 'sess-full', started: '2026-03-25T10:00:00Z', project: 'my-project' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-2.3' },
          { timestamp: '2026-03-25T14:30:00Z', type: 'story_complete', agent: 'dev', story: 'HO-2.3' },
        ],
      });

      const result = generateHistory('my-project', { projectRoot: tmpDir });
      expect(result).toContain('Session History -- my-project');
      expect(result).toContain('2026-03-25');
      expect(result).toContain('sess-full');
    });

    test('respects --last limit option', () => {
      for (let i = 1; i <= 5; i++) {
        createArchivedState('aios-core', `state-2026-03-${String(20 + i).padStart(2, '0')}T10-00-00-000Z.yaml`, {
          session: { id: `sess-${i}`, started: `2026-03-${20 + i}T10:00:00Z`, project: 'aios-core' },
          events: [
            { timestamp: `2026-03-${20 + i}T10:00:00Z`, type: 'agent_switch', agent: 'dev' },
          ],
        });
      }

      const result = generateHistory('aios-core', { projectRoot: tmpDir, limit: 2 });
      expect(result).toContain('Last 2 sessions');
      expect(result).toContain('Showing last 2 of 5 sessions');
    });
  });

  // --- Performance ---

  describe('Performance', () => {
    test('scans 50 archived sessions in under 2 seconds', () => {
      // Create 50 sessions
      for (let i = 0; i < 50; i++) {
        const day = String(Math.floor(i / 28) + 1).padStart(2, '0');
        const month = String(Math.floor(i / 28) + 1).padStart(2, '0');
        const id = `sess-perf-${String(i).padStart(3, '0')}`;

        const events = [];
        for (let e = 0; e < 20; e++) {
          events.push({
            timestamp: `2026-${month}-${day}T${String(8 + e).padStart(2, '0')}:00:00Z`,
            type: e % 3 === 0 ? 'agent_switch' : 'periodic',
            agent: e % 2 === 0 ? 'dev' : 'qa',
            prompt_count: (e + 1) * 5,
          });
        }

        createArchivedState('perf-test', `state-2026-${month}-${day}T${String(i).padStart(2, '0')}-00-00-000Z.yaml`, {
          session: { id, started: `2026-${month}-${day}T08:00:00Z`, project: 'perf-test' },
          events,
        });
      }

      const start = Date.now();
      const result = generateHistory('perf-test', { projectRoot: tmpDir, limit: 50 });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000); // <2s
      expect(result).toContain('Session History -- perf-test');
    });
  });
});
