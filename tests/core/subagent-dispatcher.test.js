/**
 * Subagent Dispatcher - Test Suite
 * Story EXC-1, AC7 - subagent-dispatcher.js coverage
 *
 * Tests: constructor, resolveAgent, dispatch, enrichContext,
 * buildPrompt, extractModifiedFiles, isRelevantGotcha,
 * agent mapping, logging, formatStatus
 */

const {
  createMockMemoryQuery,
  createMockGotchasMemory,
  collectEvents,
} = require('./execution-test-helpers');

// Mock gotchas-memory (exists but exports object, not constructor directly)
jest.mock('../../.aios-core/core/memory/gotchas-memory', () => { throw new Error('mocked'); });

const { SubagentDispatcher } = require('../../.aios-core/core/execution/subagent-dispatcher');

describe('SubagentDispatcher', () => {
  // ── Constructor ─────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates with defaults', () => {
      const sd = new SubagentDispatcher();
      expect(sd.defaultAgent).toBe('@dev');
      expect(sd.maxRetries).toBe(2);
      expect(sd.retryDelay).toBe(2000);
      expect(sd.agentMapping.database).toBe('@data-engineer');
      expect(sd.agentMapping.test).toBe('@qa');
    });

    test('accepts custom config', () => {
      const sd = new SubagentDispatcher({
        defaultAgent: '@qa',
        maxRetries: 5,
        agentMapping: { custom: '@custom' },
      });
      expect(sd.defaultAgent).toBe('@qa');
      expect(sd.maxRetries).toBe(5);
      expect(sd.agentMapping.custom).toBe('@custom');
    });

    test('extends EventEmitter', () => {
      const sd = new SubagentDispatcher();
      expect(typeof sd.on).toBe('function');
    });

    test('accepts injected memory dependencies', () => {
      const mq = createMockMemoryQuery();
      const gm = createMockGotchasMemory();
      const sd = new SubagentDispatcher({ memoryQuery: mq, gotchasMemory: gm });
      expect(sd.memoryQuery).toBe(mq);
      expect(sd.gotchasMemory).toBe(gm);
    });
  });

  // ── resolveAgent ──────────────────────────────────────────────────────

  describe('resolveAgent', () => {
    let sd;

    beforeEach(() => {
      sd = new SubagentDispatcher();
    });

    test('uses explicit agent from task', () => {
      expect(sd.resolveAgent({ agent: '@qa' })).toBe('@qa');
    });

    test('adds @ prefix to agent name', () => {
      expect(sd.resolveAgent({ agent: 'dev' })).toBe('@dev');
    });

    test('resolves from task type', () => {
      expect(sd.resolveAgent({ type: 'database', description: '' })).toBe('@data-engineer');
      expect(sd.resolveAgent({ type: 'test', description: '' })).toBe('@qa');
      expect(sd.resolveAgent({ type: 'deploy', description: '' })).toBe('@devops');
    });

    test('resolves from task tags', () => {
      expect(sd.resolveAgent({ tags: ['testing', 'coverage'], description: '' })).toBe('@qa');
    });

    test('infers from description', () => {
      expect(sd.resolveAgent({ description: 'Create database migration' })).toBe('@data-engineer');
      expect(sd.resolveAgent({ description: 'Write tests for user service' })).toBe('@qa');
      expect(sd.resolveAgent({ description: 'Deploy to production' })).toBe('@devops');
      expect(sd.resolveAgent({ description: 'Document API endpoints' })).toBe('@pm');
    });

    test('falls back to default agent', () => {
      expect(sd.resolveAgent({ description: 'Do something generic' })).toBe('@dev');
    });
  });

  // ── dispatch ──────────────────────────────────────────────────────────

  describe('dispatch', () => {
    test('emits dispatch_started event', async () => {
      const sd = new SubagentDispatcher();
      sd.maxRetries = 0;
      sd.retryDelay = 0;
      sd.spawnSubagent = jest.fn().mockRejectedValue(new Error('fail'));
      const events = collectEvents(sd, ['dispatch_started']);

      await sd.dispatch({ id: 't1', description: 'Test task' });

      expect(events.count('dispatch_started')).toBe(1);
    });

    test('returns failure after all retries fail', async () => {
      const sd = new SubagentDispatcher({ maxRetries: 1, retryDelay: 0 });
      sd.sleep = () => Promise.resolve();
      sd.spawnSubagent = jest.fn().mockRejectedValue(new Error('spawn failed'));

      const result = await sd.dispatch({ id: 't1', description: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('spawn failed');
      expect(sd.spawnSubagent).toHaveBeenCalledTimes(2); // 1 + 1 retry
    });

    test('succeeds on retry', async () => {
      const sd = new SubagentDispatcher({ maxRetries: 2, retryDelay: 0 });
      sd.sleep = () => Promise.resolve();

      let calls = 0;
      sd.spawnSubagent = jest.fn().mockImplementation(() => {
        calls++;
        if (calls === 1) throw new Error('temp fail');
        return Promise.resolve({ success: true, output: 'done', filesModified: ['a.js'] });
      });

      const result = await sd.dispatch({ id: 't1', description: 'Test' });

      expect(result.success).toBe(true);
      expect(result.output).toBe('done');
      expect(result.filesModified).toEqual(['a.js']);
    });

    test('emits dispatch_completed on success', async () => {
      const sd = new SubagentDispatcher();
      sd.spawnSubagent = jest.fn().mockResolvedValue({ success: true, output: 'ok' });

      const events = collectEvents(sd, ['dispatch_completed']);
      await sd.dispatch({ id: 't1', description: 'Test' });

      expect(events.count('dispatch_completed')).toBe(1);
    });

    test('emits dispatch_failed after all retries', async () => {
      const sd = new SubagentDispatcher({ maxRetries: 0 });
      sd.spawnSubagent = jest.fn().mockRejectedValue(new Error('fail'));

      const events = collectEvents(sd, ['dispatch_failed']);
      await sd.dispatch({ id: 't1', description: 'Test' });

      expect(events.count('dispatch_failed')).toBe(1);
    });
  });

  // ── enrichContext ─────────────────────────────────────────────────────

  describe('enrichContext', () => {
    test('returns base context when no memory', async () => {
      const sd = new SubagentDispatcher({ memoryQuery: null, gotchasMemory: null });
      const result = await sd.enrichContext({ id: 't1', description: 'test' }, { base: true });
      expect(result.base).toBe(true);
      expect(result.projectContext).toBeDefined();
    });

    test('enriches with memory when available', async () => {
      const mq = createMockMemoryQuery({
        getContextForAgent: jest.fn().mockResolvedValue({
          relevantMemory: [{ type: 'pattern', content: 'use hooks' }],
          suggestedPatterns: [{ name: 'hooks-pattern' }],
        }),
      });
      const sd = new SubagentDispatcher({ memoryQuery: mq });
      const result = await sd.enrichContext({ id: 't1', description: 'test' }, {});
      expect(result.memory.length).toBe(1);
      expect(result.patterns.length).toBe(1);
    });

    test('handles memory query errors gracefully', async () => {
      const mq = createMockMemoryQuery({
        getContextForAgent: jest.fn().mockRejectedValue(new Error('query failed')),
      });
      const sd = new SubagentDispatcher({ memoryQuery: mq });
      const result = await sd.enrichContext({ id: 't1', description: 'test' }, {});
      // Should not throw, just skip memory
      expect(result.projectContext).toBeDefined();
    });
  });

  // ── buildPrompt ───────────────────────────────────────────────────────

  describe('buildPrompt', () => {
    test('includes agent and task info', () => {
      const sd = new SubagentDispatcher();
      const prompt = sd.buildPrompt('@dev', {
        id: 't1',
        description: 'Build feature X',
        acceptanceCriteria: ['AC1', 'AC2'],
        files: ['src/app.js'],
      }, {});

      expect(prompt).toContain('@dev');
      expect(prompt).toContain('Build feature X');
      expect(prompt).toContain('AC1');
      expect(prompt).toContain('src/app.js');
    });

    test('includes gotchas and patterns from context', () => {
      const sd = new SubagentDispatcher();
      const prompt = sd.buildPrompt('@dev', { id: 't1', description: 'test' }, {
        gotchas: [{ pattern: 'avoid X', workaround: 'use Y' }],
        patterns: [{ name: 'Pattern A', description: 'Desc' }],
      });

      expect(prompt).toContain('avoid X');
      expect(prompt).toContain('Pattern A');
    });
  });

  // ── extractModifiedFiles ──────────────────────────────────────────────

  describe('extractModifiedFiles', () => {
    test('extracts files from output', () => {
      const sd = new SubagentDispatcher();
      const output = "Created `src/app.js` and modified 'lib/utils.ts'";
      const files = sd.extractModifiedFiles(output);
      expect(files.length).toBeGreaterThanOrEqual(1);
    });

    test('returns empty for empty output', () => {
      const sd = new SubagentDispatcher();
      expect(sd.extractModifiedFiles('')).toEqual([]);
    });
  });

  // ── isRelevantGotcha ──────────────────────────────────────────────────

  describe('isRelevantGotcha', () => {
    let sd;

    beforeEach(() => {
      sd = new SubagentDispatcher();
    });

    test('matches by pattern', () => {
      const gotcha = { pattern: 'database', description: '' };
      const task = { description: 'Fix database connection', type: '', tags: [] };
      expect(sd.isRelevantGotcha(gotcha, task)).toBe(true);
    });

    test('matches by category', () => {
      const gotcha = { category: 'test', description: '' };
      const task = { description: '', type: 'test', tags: [] };
      expect(sd.isRelevantGotcha(gotcha, task)).toBe(true);
    });

    test('matches by keyword overlap', () => {
      const gotcha = { description: 'connection timeout error handling' };
      const task = { description: 'handle connection timeout error gracefully', tags: [] };
      expect(sd.isRelevantGotcha(gotcha, task)).toBe(true);
    });

    test('returns false for unrelated gotcha', () => {
      const gotcha = { description: 'quantum physics' };
      const task = { description: 'build login form', tags: [] };
      expect(sd.isRelevantGotcha(gotcha, task)).toBe(false);
    });
  });

  // ── Agent mapping ─────────────────────────────────────────────────────

  describe('Agent mapping', () => {
    test('getAgentMapping returns copy', () => {
      const sd = new SubagentDispatcher();
      const mapping = sd.getAgentMapping();
      mapping.custom = '@custom';
      expect(sd.agentMapping.custom).toBeUndefined();
    });

    test('updateAgentMapping adds new mappings', () => {
      const sd = new SubagentDispatcher();
      sd.updateAgentMapping({ custom: '@custom-agent' });
      expect(sd.agentMapping.custom).toBe('@custom-agent');
      // Original mappings preserved
      expect(sd.agentMapping.database).toBe('@data-engineer');
    });
  });

  // ── Logging ───────────────────────────────────────────────────────────

  describe('Logging', () => {
    test('log stores entries', () => {
      const sd = new SubagentDispatcher();
      sd.log('test_event', { key: 'value' });
      expect(sd.dispatchLog.length).toBe(1);
      expect(sd.dispatchLog[0].type).toBe('test_event');
    });

    test('log trims to maxLogSize', () => {
      const sd = new SubagentDispatcher();
      sd.maxLogSize = 3;
      for (let i = 0; i < 5; i++) {
        sd.log(`event-${i}`, {});
      }
      expect(sd.dispatchLog.length).toBe(3);
    });

    test('getLog returns limited entries', () => {
      const sd = new SubagentDispatcher();
      for (let i = 0; i < 10; i++) {
        sd.log(`e-${i}`, {});
      }
      expect(sd.getLog(5).length).toBe(5);
    });
  });

  // ── formatStatus ──────────────────────────────────────────────────────

  describe('formatStatus', () => {
    test('returns formatted status', () => {
      const sd = new SubagentDispatcher();
      const status = sd.formatStatus();
      expect(status).toContain('Subagent Dispatcher');
      expect(status).toContain('Agent Mapping');
    });
  });
});
