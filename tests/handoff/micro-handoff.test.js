'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  saveMicroHandoff,
  readMicroHandoff,
  markConsumed,
  getUnconsumedCount,
  clearHandoffs,
  readAllHandoffs,
  validateSchema,
  MAX_DECISIONS,
  MAX_FILES,
  MAX_BLOCKERS,
  MAX_UNCONSUMED,
  MAX_MEMORY_HINTS,
} = require('../../.claude/lib/handoff/micro-handoff');

describe('Tier 1: Micro-Handoff', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-test-'));
    fs.mkdirSync(path.join(tmpDir, '.aiox', 'current-session'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('saveMicroHandoff', () => {
    test('creates a handoff file with correct structure', () => {
      const result = saveMicroHandoff('dev', 'qa', {
        story_context: {
          story_id: 'AIOX-HO-1',
          story_path: 'docs/stories/active/AIOX-HO-1.story.md',
          story_status: 'In Progress',
          current_task: 'Task 4',
          branch: 'main',
        },
        decisions: ['Used CommonJS'],
        files_modified: ['micro-handoff.js'],
        blockers: [],
        next_action: 'Run QA gate',
      }, tmpDir);

      expect(result.from_agent).toBe('dev');
      expect(result.to_agent).toBe('qa');
      expect(result.consumed).toBe(false);
      expect(result.story_context.story_id).toBe('AIOX-HO-1');
      expect(result.decisions).toEqual(['Used CommonJS']);
      expect(result.version).toBe('1.0');
    });

    test('persists to disk as JSON array', () => {
      saveMicroHandoff('sm', 'dev', {
        next_action: 'Implement story',
      }, tmpDir);

      const filePath = path.join(tmpDir, '.aiox', 'current-session', 'micro-handoff.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(Array.isArray(raw)).toBe(true);
      expect(raw.length).toBe(1);
    });

    test('appends multiple handoffs', () => {
      saveMicroHandoff('sm', 'dev', { next_action: 'step 1' }, tmpDir);
      saveMicroHandoff('dev', 'qa', { next_action: 'step 2' }, tmpDir);

      const all = readAllHandoffs(tmpDir);
      expect(all.length).toBe(2);
      expect(all[0].from_agent).toBe('sm');
      expect(all[1].from_agent).toBe('dev');
    });

    test('generates unique handoff ID', () => {
      const h = saveMicroHandoff('dev', 'qa', {}, tmpDir);
      expect(h.id).toMatch(/^handoff-dev-to-qa-/);
    });

    test('saves handoff with memory_hints field (Story AIOX-HO-2.2)', () => {
      const result = saveMicroHandoff('dev', 'qa', {
        memory_hints: ['Greeting System Architecture', 'Test Mocking Pattern'],
        next_action: 'Review code',
      }, tmpDir);

      expect(result.memory_hints).toEqual(['Greeting System Architecture', 'Test Mocking Pattern']);

      // Verify persisted
      const all = readAllHandoffs(tmpDir);
      expect(all[0].memory_hints).toEqual(['Greeting System Architecture', 'Test Mocking Pattern']);
    });
  });

  describe('readMicroHandoff', () => {
    test('returns null when no handoffs exist', () => {
      const result = readMicroHandoff(tmpDir);
      expect(result).toBeNull();
    });

    test('returns latest unconsumed handoff', () => {
      saveMicroHandoff('sm', 'dev', { next_action: 'first' }, tmpDir);
      saveMicroHandoff('dev', 'qa', { next_action: 'second' }, tmpDir);

      const latest = readMicroHandoff(tmpDir);
      expect(latest.from_agent).toBe('dev');
      expect(latest.to_agent).toBe('qa');
      expect(latest.next_action).toBe('second');
    });

    test('skips consumed handoffs', () => {
      const h1 = saveMicroHandoff('sm', 'dev', { next_action: 'first' }, tmpDir);
      saveMicroHandoff('dev', 'qa', { next_action: 'second' }, tmpDir);

      markConsumed(h1.id, tmpDir);
      // The second handoff is still the latest unconsumed (dev->qa)
      const latest = readMicroHandoff(tmpDir);
      expect(latest.from_agent).toBe('dev');
    });
  });

  describe('markConsumed', () => {
    test('marks a handoff as consumed', () => {
      const h = saveMicroHandoff('dev', 'qa', {}, tmpDir);
      expect(h.consumed).toBe(false);

      const found = markConsumed(h.id, tmpDir);
      expect(found).toBe(true);

      const all = readAllHandoffs(tmpDir);
      const updated = all.find((x) => x.id === h.id);
      expect(updated.consumed).toBe(true);
    });

    test('returns false for unknown ID', () => {
      saveMicroHandoff('dev', 'qa', {}, tmpDir);
      const found = markConsumed('nonexistent-id', tmpDir);
      expect(found).toBe(false);
    });
  });

  describe('getUnconsumedCount', () => {
    test('returns 0 when no handoffs', () => {
      expect(getUnconsumedCount(tmpDir)).toBe(0);
    });

    test('counts unconsumed correctly', () => {
      const h1 = saveMicroHandoff('sm', 'dev', {}, tmpDir);
      saveMicroHandoff('dev', 'qa', {}, tmpDir);

      expect(getUnconsumedCount(tmpDir)).toBe(2);

      markConsumed(h1.id, tmpDir);
      expect(getUnconsumedCount(tmpDir)).toBe(1);
    });
  });

  describe('validateSchema', () => {
    test('truncates decisions to MAX_DECISIONS', () => {
      const input = {
        decisions: Array(10).fill('decision'),
      };
      const result = validateSchema(input);
      expect(result.decisions.length).toBe(MAX_DECISIONS);
    });

    test('truncates files_modified to MAX_FILES', () => {
      const input = {
        files_modified: Array(15).fill('file.js'),
      };
      const result = validateSchema(input);
      expect(result.files_modified.length).toBe(MAX_FILES);
    });

    test('truncates blockers to MAX_BLOCKERS', () => {
      const input = {
        blockers: Array(5).fill('blocker'),
      };
      const result = validateSchema(input);
      expect(result.blockers.length).toBe(MAX_BLOCKERS);
    });

    test('sets defaults for missing fields', () => {
      const result = validateSchema({});
      expect(result.version).toBe('1.0');
      expect(result.from_agent).toBe('unknown');
      expect(result.to_agent).toBe('unknown');
      expect(result.consumed).toBe(false);
      expect(result.story_context).toBeDefined();
      expect(result.decisions).toEqual([]);
      expect(result.memory_hints).toEqual([]);
    });

    test('truncates memory_hints to MAX_MEMORY_HINTS', () => {
      const input = {
        memory_hints: ['hint 1', 'hint 2', 'hint 3', 'hint 4', 'hint 5'],
      };
      const result = validateSchema(input);
      expect(result.memory_hints.length).toBe(MAX_MEMORY_HINTS);
    });

    test('preserves valid memory_hints array', () => {
      const input = {
        memory_hints: ['Greeting System Architecture', 'Test Mocking Pattern'],
      };
      const result = validateSchema(input);
      expect(result.memory_hints).toEqual(['Greeting System Architecture', 'Test Mocking Pattern']);
    });

    test('defaults memory_hints to empty array when not provided', () => {
      const result = validateSchema({ decisions: ['d1'] });
      expect(result.memory_hints).toEqual([]);
    });

    test('backward compatibility: older handoffs without memory_hints still validate', () => {
      // Simulate an older handoff without memory_hints
      const oldHandoff = {
        version: '1.0',
        from_agent: 'sm',
        to_agent: 'dev',
        decisions: ['decision1'],
        files_modified: ['file.js'],
        blockers: [],
        next_action: 'implement',
      };
      const result = validateSchema(oldHandoff);
      expect(result.memory_hints).toEqual([]);
      expect(result.decisions).toEqual(['decision1']);
    });
  });

  describe('rotation', () => {
    test('keeps only MAX_UNCONSUMED unconsumed handoffs', () => {
      // Create MAX_UNCONSUMED + 2 handoffs
      for (let i = 0; i < MAX_UNCONSUMED + 2; i++) {
        saveMicroHandoff(`agent${i}`, `agent${i + 1}`, {
          next_action: `action ${i}`,
        }, tmpDir);
      }

      const unconsumed = readAllHandoffs(tmpDir).filter((h) => !h.consumed);
      expect(unconsumed.length).toBe(MAX_UNCONSUMED);
    });
  });

  describe('clearHandoffs', () => {
    test('removes the handoff file', () => {
      saveMicroHandoff('dev', 'qa', {}, tmpDir);
      clearHandoffs(tmpDir);
      expect(readAllHandoffs(tmpDir)).toEqual([]);
    });

    test('does not throw if file does not exist', () => {
      expect(() => clearHandoffs(tmpDir)).not.toThrow();
    });
  });
});
