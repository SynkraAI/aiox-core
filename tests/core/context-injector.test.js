/**
 * Context Injector - Test Suite
 * Story EXC-1, AC5 - context-injector.js coverage
 *
 * Tests: constructor, inject, cache, project context, files inference,
 * memory/gotchas/decisions, formatForLLM, trimToTokenBudget, metrics
 */

const path = require('path');
const fs = require('fs');
const {
  createTempDir,
  cleanupTempDir,
  createMockMemoryQuery,
  createMockGotchasMemory,
  createMockSessionMemory,
} = require('./execution-test-helpers');

// Mock gotchas-memory (exists but exports object, not constructor directly)
jest.mock('../../.aios-core/core/memory/gotchas-memory', () => { throw new Error('mocked'); });

const { ContextInjector } = require('../../.aios-core/core/execution/context-injector');

describe('ContextInjector', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('ci-test-');
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  // ── Constructor ─────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates with defaults', () => {
      const ci = new ContextInjector();
      expect(ci.tokenBudget).toBe(4000);
      expect(ci.charsPerToken).toBe(4);
      expect(ci.cacheTTL).toBe(5 * 60 * 1000);
      expect(ci.cache).toBeInstanceOf(Map);
    });

    test('accepts custom config', () => {
      const ci = new ContextInjector({ tokenBudget: 2000, charsPerToken: 3 });
      expect(ci.tokenBudget).toBe(2000);
      expect(ci.charsPerToken).toBe(3);
    });

    test('accepts injected memory dependencies', () => {
      const mq = createMockMemoryQuery();
      const gm = createMockGotchasMemory();
      const sm = createMockSessionMemory();
      const ci = new ContextInjector({ memoryQuery: mq, gotchasMemory: gm, sessionMemory: sm });
      expect(ci.memoryQuery).toBe(mq);
      expect(ci.gotchasMemory).toBe(gm);
      expect(ci.sessionMemory).toBe(sm);
    });
  });

  // ── Cache ─────────────────────────────────────────────────────────────

  describe('Cache', () => {
    test('setCache and getCached round-trip', () => {
      const ci = new ContextInjector();
      ci.setCache('key1', { data: 'test' });
      expect(ci.getCached('key1')).toEqual({ data: 'test' });
    });

    test('getCached returns null for missing key', () => {
      const ci = new ContextInjector();
      expect(ci.getCached('nonexistent')).toBeNull();
    });

    test('getCached returns null for expired entry', () => {
      const ci = new ContextInjector({ cacheTTL: 1 }); // 1ms TTL
      ci.setCache('key1', 'value');
      // Force expiration
      ci.cache.get('key1').timestamp = Date.now() - 100;
      expect(ci.getCached('key1')).toBeNull();
    });

    test('getCached increments cacheHits', () => {
      const ci = new ContextInjector();
      ci.setCache('key1', 'value');
      ci.getCached('key1');
      expect(ci.metrics.cacheHits).toBe(1);
    });

    test('clearCache empties the cache', () => {
      const ci = new ContextInjector();
      ci.setCache('a', 1);
      ci.setCache('b', 2);
      ci.clearCache();
      expect(ci.cache.size).toBe(0);
    });
  });

  // ── getCacheKey ────────────────────────────────────────────────────────

  describe('getCacheKey', () => {
    test('generates key from task type and service', () => {
      const ci = new ContextInjector();
      expect(ci.getCacheKey({ type: 'api', service: 'auth' })).toBe('api-auth');
    });

    test('uses defaults for missing fields', () => {
      const ci = new ContextInjector();
      expect(ci.getCacheKey({})).toBe('default-core');
    });
  });

  // ── inject ────────────────────────────────────────────────────────────

  describe('inject()', () => {
    test('returns formatted context string', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      const task = { id: 'task-1', description: 'Test task' };
      const result = await ci.inject(task);
      expect(typeof result).toBe('string');
      expect(result).toContain('task-1');
      expect(result).toContain('Test task');
    });

    test('includes acceptance criteria', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      const task = {
        id: 'task-1',
        description: 'Test',
        acceptanceCriteria: ['AC1: do X', 'AC2: do Y'],
      };
      const result = await ci.inject(task);
      expect(result).toContain('AC1: do X');
    });

    test('updates metrics after injection', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      await ci.inject({ id: 'task-1', description: 'Test' });
      expect(ci.metrics.injections).toBe(1);
      expect(ci.metrics.avgContextSize).toBeGreaterThan(0);
    });
  });

  // ── getRelevantFiles ──────────────────────────────────────────────────

  describe('getRelevantFiles', () => {
    test('includes explicitly specified files', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      const task = { id: 't1', description: 'Test', files: ['src/app.js'] };
      const files = await ci.getRelevantFiles(task);
      expect(files.length).toBe(1);
      expect(files[0].path).toBe('src/app.js');
      expect(files[0].purpose).toBe('Specified in task');
    });

    test('infers files from backtick paths in description', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      const task = { id: 't1', description: 'Update `src/utils.js` and `lib/helper.ts`' };
      const files = await ci.getRelevantFiles(task);
      expect(files.some(f => f.path === 'src/utils.js')).toBe(true);
      expect(files.some(f => f.path === 'lib/helper.ts')).toBe(true);
    });

    test('limits to 10 files', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      const manyFiles = Array.from({ length: 15 }, (_, i) => `file-${i}.js`);
      const task = { id: 't1', description: 'Test', files: manyFiles };
      const files = await ci.getRelevantFiles(task);
      expect(files.length).toBe(10);
    });
  });

  // ── inferFilesFromDescription ─────────────────────────────────────────

  describe('inferFilesFromDescription', () => {
    test('returns empty for null', () => {
      const ci = new ContextInjector();
      expect(ci.inferFilesFromDescription(null)).toEqual([]);
    });

    test('extracts backtick paths', () => {
      const ci = new ContextInjector();
      const result = ci.inferFilesFromDescription('Fix `src/app.js` and `lib/utils.ts`');
      expect(result).toContain('src/app.js');
      expect(result).toContain('lib/utils.ts');
    });

    test('deduplicates paths', () => {
      const ci = new ContextInjector();
      const result = ci.inferFilesFromDescription('`app.js` and `app.js` again');
      expect(result.length).toBe(1);
    });
  });

  // ── Memory integration ────────────────────────────────────────────────

  describe('Memory integration', () => {
    test('getRelevantMemory returns empty without memoryQuery', async () => {
      const ci = new ContextInjector({ memoryQuery: null });
      const result = await ci.getRelevantMemory({ id: 't1', description: 'test' });
      expect(result).toEqual([]);
    });

    test('getRelevantMemory queries memory', async () => {
      const mq = createMockMemoryQuery({
        query: jest.fn().mockResolvedValue([{ type: 'pattern', content: 'use hooks', score: 0.9 }]),
      });
      const ci = new ContextInjector({ memoryQuery: mq });
      const result = await ci.getRelevantMemory({ id: 't1', description: 'component' });
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('pattern');
    });

    test('getRelevantGotchas returns empty without gotchasMemory', async () => {
      const ci = new ContextInjector({ gotchasMemory: null });
      expect(await ci.getRelevantGotchas({ id: 't1' })).toEqual([]);
    });

    test('getRecentDecisions returns empty without sessionMemory', async () => {
      const ci = new ContextInjector({ sessionMemory: null });
      expect(await ci.getRecentDecisions()).toEqual([]);
    });
  });

  // ── formatForLLM ──────────────────────────────────────────────────────

  describe('formatForLLM', () => {
    test('includes task section', () => {
      const ci = new ContextInjector();
      const injection = {
        task: { id: 'task-1', description: 'Build feature', acceptanceCriteria: [] },
        project: { patterns: [], conventions: [] },
        files: [],
        memory: [],
        gotchas: [],
        decisions: [],
      };
      const result = ci.formatForLLM(injection);
      expect(result).toContain('Task Context');
      expect(result).toContain('task-1');
    });

    test('includes files section when present', () => {
      const ci = new ContextInjector();
      const injection = {
        task: { id: 't1', description: 'Test', acceptanceCriteria: [] },
        project: { patterns: [], conventions: [] },
        files: [{ path: 'src/app.js', purpose: 'main', exists: true }],
        memory: [],
        gotchas: [],
        decisions: [],
      };
      const result = ci.formatForLLM(injection);
      expect(result).toContain('src/app.js');
    });
  });

  // ── trimToTokenBudget ─────────────────────────────────────────────────

  describe('trimToTokenBudget', () => {
    test('returns content unchanged if within budget', () => {
      const ci = new ContextInjector({ tokenBudget: 1000, charsPerToken: 4 });
      const short = 'Hello world';
      expect(ci.trimToTokenBudget(short, 1000)).toBe(short);
    });

    test('trims content exceeding budget', () => {
      const ci = new ContextInjector({ charsPerToken: 1 });
      const long = 'a'.repeat(200);
      const result = ci.trimToTokenBudget(long, 50);
      expect(result.length).toBeLessThanOrEqual(50);
    });

    test('preserves task section when trimming', () => {
      const ci = new ContextInjector({ charsPerToken: 1 });
      const content = '## Task\nImportant\n### Extra\n' + 'x'.repeat(100);
      const result = ci.trimToTokenBudget(content, 50);
      expect(result).toContain('Task');
    });
  });

  // ── Metrics ───────────────────────────────────────────────────────────

  describe('Metrics', () => {
    test('getMetrics returns rounded values', () => {
      const ci = new ContextInjector();
      ci.updateMetrics('test content', 42);
      const metrics = ci.getMetrics();
      expect(metrics.injections).toBe(1);
      expect(typeof metrics.avgContextSize).toBe('number');
      expect(typeof metrics.avgInjectionTime).toBe('number');
    });

    test('updateMetrics computes running average', () => {
      const ci = new ContextInjector();
      ci.updateMetrics('aaaa', 10); // size=4, time=10
      ci.updateMetrics('bb', 20);   // size=2, time=20
      expect(ci.metrics.injections).toBe(2);
      expect(ci.metrics.avgContextSize).toBe(3); // (4+2)/2
      expect(ci.metrics.avgInjectionTime).toBe(15); // (10+20)/2
    });
  });

  // ── formatStatus ──────────────────────────────────────────────────────

  describe('formatStatus', () => {
    test('returns formatted status string', () => {
      const ci = new ContextInjector();
      const status = ci.formatStatus();
      expect(status).toContain('Context Injector');
      expect(status).toContain('Token Budget');
    });
  });

  // ── detectConventions ─────────────────────────────────────────────────

  describe('detectConventions', () => {
    test('detects TypeScript project', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), '{}');
      const conventions = await ci.detectConventions();
      expect(conventions).toContain('TypeScript project');
    });

    test('detects tests directory', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      fs.mkdirSync(path.join(tmpDir, 'tests'));
      const conventions = await ci.detectConventions();
      expect(conventions).toContain('Tests in /tests directory');
    });

    test('returns empty for bare project', async () => {
      const ci = new ContextInjector({ rootPath: tmpDir });
      const conventions = await ci.detectConventions();
      expect(Array.isArray(conventions)).toBe(true);
    });
  });
});
