'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  updateSessionState,
  getSessionState,
  initSessionState,
  resetSessionState,
  getEventCount,
  serializeState,
  parseState,
  EVENT_TYPES,
} = require('../../.claude/lib/handoff/session-state');

describe('Tier 2: Session State', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-state-test-'));
    fs.mkdirSync(path.join(tmpDir, '.aiox', 'current-session'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, '.aiox', 'session-history'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('initSessionState', () => {
    test('creates state file with session header', () => {
      const state = initSessionState('sess-123', 'aios-core', tmpDir);

      expect(state.session.id).toBe('sess-123');
      expect(state.session.project).toBe('aios-core');
      expect(state.session.started).toBeTruthy();
      expect(state.events).toEqual([]);
    });

    test('persists to disk', () => {
      initSessionState('sess-456', 'test-project', tmpDir);
      const filePath = path.join(tmpDir, '.aiox', 'current-session', 'state.yaml');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('sess-456');
      expect(content).toContain('test-project');
    });

    test('generates session ID when none provided', () => {
      const state = initSessionState(null, 'test', tmpDir);
      expect(state.session.id).toMatch(/^session-\d+$/);
    });
  });

  describe('updateSessionState', () => {
    test('appends agent_switch event', () => {
      initSessionState('sess-1', 'test', tmpDir);

      const evt = updateSessionState('agent_switch', {
        agent: 'dev',
        story: 'AIOX-HO-1',
        branch: 'main',
        details: 'Switched from @sm to @dev',
      }, tmpDir);

      expect(evt.type).toBe('agent_switch');
      expect(evt.agent).toBe('dev');

      const state = getSessionState(tmpDir);
      expect(state.events.length).toBe(1);
    });

    test('appends periodic event with prompt count', () => {
      initSessionState('sess-2', 'test', tmpDir);

      updateSessionState('periodic', {
        agent: 'dev',
        prompt_count: 5,
        story: 'AIOX-HO-1',
        branch: 'main',
        files_modified: 3,
      }, tmpDir);

      const state = getSessionState(tmpDir);
      expect(state.events[0].prompt_count).toBe(5);
      expect(state.events[0].files_modified).toBe(3);
    });

    test('appends multiple events preserving timeline', () => {
      initSessionState('sess-3', 'test', tmpDir);

      updateSessionState('story_start', { agent: 'dev', story: 'HO-1' }, tmpDir);
      updateSessionState('commit', { agent: 'dev', commit_hash: 'abc123' }, tmpDir);
      updateSessionState('story_complete', { agent: 'dev', story: 'HO-1' }, tmpDir);

      const state = getSessionState(tmpDir);
      expect(state.events.length).toBe(3);
      expect(state.events[0].type).toBe('story_start');
      expect(state.events[1].type).toBe('commit');
      expect(state.events[2].type).toBe('story_complete');
    });

    test('throws on invalid event type', () => {
      initSessionState('sess-4', 'test', tmpDir);
      expect(() => {
        updateSessionState('invalid_type', {}, tmpDir);
      }).toThrow('Invalid event type: invalid_type');
    });

    test('auto-initializes state if file does not exist', () => {
      // Do NOT call initSessionState first
      const evt = updateSessionState('agent_switch', {
        agent: 'dev',
        project: 'auto-init',
      }, tmpDir);

      expect(evt.type).toBe('agent_switch');
      const state = getSessionState(tmpDir);
      expect(state.events.length).toBe(1);
    });

    test('handles qa_gate event with verdict', () => {
      initSessionState('sess-5', 'test', tmpDir);
      updateSessionState('qa_gate', {
        agent: 'qa',
        verdict: 'PASS',
        story: 'HO-1',
      }, tmpDir);

      const state = getSessionState(tmpDir);
      expect(state.events[0].verdict).toBe('PASS');
    });
  });

  describe('getSessionState', () => {
    test('returns empty state when file does not exist', () => {
      const state = getSessionState(tmpDir);
      expect(state.session.id).toBe('');
      expect(state.events).toEqual([]);
    });

    test('reads persisted state correctly', () => {
      initSessionState('sess-read', 'test-read', tmpDir);
      updateSessionState('agent_switch', { agent: 'dev' }, tmpDir);

      const state = getSessionState(tmpDir);
      expect(state.session.id).toBe('sess-read');
      expect(state.events.length).toBe(1);
    });
  });

  describe('resetSessionState', () => {
    test('archives current state and clears file', () => {
      initSessionState('sess-reset', 'test-project', tmpDir);
      updateSessionState('agent_switch', { agent: 'dev' }, tmpDir);

      const archivePath = resetSessionState('test-project', tmpDir);

      expect(archivePath).toBeTruthy();
      expect(fs.existsSync(archivePath)).toBe(true);

      // Current state should be empty
      const state = getSessionState(tmpDir);
      expect(state.events).toEqual([]);
    });

    test('returns null when nothing to archive', () => {
      const result = resetSessionState('empty-project', tmpDir);
      expect(result).toBeNull();
    });
  });

  describe('getEventCount', () => {
    test('returns 0 for empty state', () => {
      expect(getEventCount(tmpDir)).toBe(0);
    });

    test('counts events accurately', () => {
      initSessionState('sess-count', 'test', tmpDir);
      updateSessionState('agent_switch', { agent: 'dev' }, tmpDir);
      updateSessionState('periodic', { prompt_count: 5 }, tmpDir);
      expect(getEventCount(tmpDir)).toBe(2);
    });
  });

  describe('serializeState / parseState roundtrip', () => {
    test('serializes and parses back correctly', () => {
      const original = {
        session: { id: 'rt-1', started: '2026-03-25T10:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T10:01:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-1' },
          { timestamp: '2026-03-25T10:05:00Z', type: 'periodic', prompt_count: 5, files_modified: 3 },
        ],
      };

      const yaml = serializeState(original);
      const parsed = parseState(yaml);

      expect(parsed.session.id).toBe('rt-1');
      expect(parsed.session.project).toBe('test');
      expect(parsed.events.length).toBe(2);
      expect(parsed.events[0].type).toBe('agent_switch');
      expect(parsed.events[0].agent).toBe('dev');
      expect(parsed.events[1].prompt_count).toBe(5);
    });
  });

  describe('EVENT_TYPES', () => {
    test('contains all required event types', () => {
      expect(EVENT_TYPES).toContain('agent_switch');
      expect(EVENT_TYPES).toContain('story_start');
      expect(EVENT_TYPES).toContain('story_complete');
      expect(EVENT_TYPES).toContain('qa_gate');
      expect(EVENT_TYPES).toContain('commit');
      expect(EVENT_TYPES).toContain('periodic');
      expect(EVENT_TYPES.length).toBe(6);
    });
  });
});
