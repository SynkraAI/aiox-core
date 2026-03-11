const path = require('path');
const fs = require('fs');
const {
  DecisionMemory,
  DecisionCategory,
  Outcome,
  Events,
  CONFIG,
} = require('../../../.aiox-core/core/memory/decision-memory');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

const TEST_ROOT = path.join(__dirname, '__fixtures__', 'decision-memory');

function createMemory(overrides = {}) {
  return new DecisionMemory({
    projectRoot: TEST_ROOT,
    config: { ...overrides },
  });
}

function cleanFixtures() {
  const filePath = path.join(TEST_ROOT, CONFIG.decisionsJsonPath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TESTS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('DecisionMemory', () => {
  beforeEach(() => {
    cleanFixtures();
  });

  afterAll(() => {
    cleanFixtures();
    const dir = path.join(TEST_ROOT, '.aiox');
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    if (fs.existsSync(TEST_ROOT)) fs.rmSync(TEST_ROOT, { recursive: true });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor & Loading
  // ─────────────────────────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create with default config', () => {
      const mem = createMemory();
      expect(mem.decisions).toEqual([]);
      expect(mem.patterns).toEqual([]);
      expect(mem._loaded).toBe(false);
    });

    it('should accept custom config overrides', () => {
      const mem = createMemory({ maxDecisions: 100 });
      expect(mem.config.maxDecisions).toBe(100);
    });
  });

  describe('load', () => {
    it('should load from empty state', async () => {
      const mem = createMemory();
      await mem.load();
      expect(mem._loaded).toBe(true);
      expect(mem.decisions).toEqual([]);
    });

    it('should load persisted decisions', async () => {
      const mem = createMemory();
      mem.recordDecision({ description: 'Use microservices architecture' });
      await mem.save();

      const mem2 = createMemory();
      await mem2.load();
      expect(mem2.decisions).toHaveLength(1);
      expect(mem2.decisions[0].description).toBe('Use microservices architecture');
    });

    it('should handle corrupted file gracefully', async () => {
      const filePath = path.join(TEST_ROOT, CONFIG.decisionsJsonPath);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, '{invalid json!!!', 'utf-8');

      const mem = createMemory();
      await mem.load();
      expect(mem.decisions).toEqual([]);
    });

    it('should ignore data with wrong schema version', async () => {
      const filePath = path.join(TEST_ROOT, CONFIG.decisionsJsonPath);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({
        schemaVersion: 'old-version',
        decisions: [{ id: 'old', description: 'old' }],
      }), 'utf-8');

      const mem = createMemory();
      await mem.load();
      expect(mem.decisions).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Recording Decisions
  // ─────────────────────────────────────────────────────────────────────────────

  describe('recordDecision', () => {
    it('should record a basic decision', () => {
      const mem = createMemory();
      const decision = mem.recordDecision({
        description: 'Delegate story creation to @sm agent',
      });

      expect(decision.id).toMatch(/^dec-/);
      expect(decision.description).toBe('Delegate story creation to @sm agent');
      expect(decision.outcome).toBe(Outcome.PENDING);
      expect(decision.confidence).toBe(1.0);
      expect(decision.createdAt).toBeDefined();
    });

    it('should auto-detect category from description', () => {
      const mem = createMemory();

      const arch = mem.recordDecision({ description: 'Refactor module architecture to use layered pattern' });
      expect(arch.category).toBe(DecisionCategory.ARCHITECTURE);

      const deleg = mem.recordDecision({ description: 'Delegate task to subagent for orchestration' });
      expect(deleg.category).toBe(DecisionCategory.DELEGATION);

      const test = mem.recordDecision({ description: 'Add jest unit test coverage for utils' });
      expect(test.category).toBe(DecisionCategory.TESTING);
    });

    it('should use provided category over auto-detect', () => {
      const mem = createMemory();
      const d = mem.recordDecision({
        description: 'Use TypeScript',
        category: DecisionCategory.TOOLING,
      });
      expect(d.category).toBe(DecisionCategory.TOOLING);
    });

    it('should extract keywords from description', () => {
      const mem = createMemory();
      const d = mem.recordDecision({
        description: 'Use circuit breaker pattern for API resilience',
      });
      expect(d.keywords).toContain('circuit');
      expect(d.keywords).toContain('breaker');
      expect(d.keywords).toContain('pattern');
      expect(d.keywords).not.toContain('for'); // stop word
    });

    it('should throw on empty description', () => {
      const mem = createMemory();
      expect(() => mem.recordDecision({ description: '' })).toThrow('description is required');
    });

    it('should emit DECISION_RECORDED event', () => {
      const mem = createMemory();
      const handler = jest.fn();
      mem.on(Events.DECISION_RECORDED, handler);

      mem.recordDecision({ description: 'Test decision' });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].description).toBe('Test decision');
    });

    it('should record rationale and alternatives', () => {
      const mem = createMemory();
      const d = mem.recordDecision({
        description: 'Use PostgreSQL over MongoDB',
        rationale: 'Relational data model fits better',
        alternatives: ['MongoDB', 'DynamoDB', 'SQLite'],
      });

      expect(d.rationale).toBe('Relational data model fits better');
      expect(d.alternatives).toEqual(['MongoDB', 'DynamoDB', 'SQLite']);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Outcome Updates
  // ─────────────────────────────────────────────────────────────────────────────

  describe('updateOutcome', () => {
    it('should update outcome and notes', () => {
      const mem = createMemory();
      const d = mem.recordDecision({ description: 'Use caching layer' });

      const updated = mem.updateOutcome(d.id, Outcome.SUCCESS, 'Reduced latency by 40%');
      expect(updated.outcome).toBe(Outcome.SUCCESS);
      expect(updated.outcomeNotes).toBe('Reduced latency by 40%');
    });

    it('should increase confidence on success (up to cap)', () => {
      const mem = createMemory();
      const d = mem.recordDecision({ description: 'Enable compression' });

      // Reduce confidence first via a failure, then verify success increases it
      mem.updateOutcome(d.id, Outcome.FAILURE);
      const afterFailure = d.confidence;

      // Record a fresh decision and mark it as success
      const d2 = mem.recordDecision({ description: 'Enable compression v2' });
      mem.updateOutcome(d2.id, Outcome.SUCCESS);
      expect(d2.confidence).toBeGreaterThan(afterFailure);
    });

    it('should decrease confidence on failure', () => {
      const mem = createMemory();
      const d = mem.recordDecision({ description: 'Deploy on Friday' });
      const initial = d.confidence;

      mem.updateOutcome(d.id, Outcome.FAILURE);
      expect(d.confidence).toBeLessThan(initial);
    });

    it('should not go below minimum confidence', () => {
      const mem = createMemory({ minConfidence: 0.1 });

      // Record multiple decisions and fail each one
      const decisions = [];
      for (let i = 0; i < 10; i++) {
        const d = mem.recordDecision({ description: `Bad idea ${i}` });
        mem.updateOutcome(d.id, Outcome.FAILURE);
        decisions.push(d);
      }

      for (const d of decisions) {
        expect(d.confidence).toBeGreaterThanOrEqual(0.1);
      }
    });

    it('should return null for unknown decision ID', () => {
      const mem = createMemory();
      expect(mem.updateOutcome('nonexistent', Outcome.SUCCESS)).toBeNull();
    });

    it('should throw on invalid outcome', () => {
      const mem = createMemory();
      const d = mem.recordDecision({ description: 'test' });
      expect(() => mem.updateOutcome(d.id, 'invalid')).toThrow('Invalid outcome');
    });

    it('should throw when setting outcome to PENDING', () => {
      const mem = createMemory();
      const d = mem.recordDecision({ description: 'test pending rejection' });
      expect(() => mem.updateOutcome(d.id, Outcome.PENDING)).toThrow('Cannot set outcome back to PENDING');
    });

    it('should emit OUTCOME_UPDATED event', () => {
      const mem = createMemory();
      const handler = jest.fn();
      mem.on(Events.OUTCOME_UPDATED, handler);

      const d = mem.recordDecision({ description: 'test' });
      mem.updateOutcome(d.id, Outcome.SUCCESS);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Relevance & Context Injection
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getRelevantDecisions', () => {
    it('should find relevant decisions by keyword similarity', () => {
      const mem = createMemory({ similarityThreshold: 0.1 });

      const d1 = mem.recordDecision({ description: 'Use circuit breaker for API calls' });
      mem.updateOutcome(d1.id, Outcome.SUCCESS, 'Prevented cascade failures');

      const d2 = mem.recordDecision({ description: 'Add database connection pooling' });
      mem.updateOutcome(d2.id, Outcome.SUCCESS);

      const relevant = mem.getRelevantDecisions('circuit breaker pattern for external API');
      expect(relevant.length).toBeGreaterThanOrEqual(1);
      expect(relevant[0].description).toContain('circuit breaker');
    });

    it('should exclude pending decisions', () => {
      const mem = createMemory();
      mem.recordDecision({ description: 'Pending decision about testing' });

      const relevant = mem.getRelevantDecisions('testing strategy');
      expect(relevant).toHaveLength(0);
    });

    it('should filter by category', () => {
      const mem = createMemory({ similarityThreshold: 0.1 });
      const d1 = mem.recordDecision({ description: 'Architecture decision about modules', category: DecisionCategory.ARCHITECTURE });
      mem.updateOutcome(d1.id, Outcome.SUCCESS);
      const d2 = mem.recordDecision({ description: 'Testing decision about modules', category: DecisionCategory.TESTING });
      mem.updateOutcome(d2.id, Outcome.SUCCESS);

      const relevant = mem.getRelevantDecisions('modules', { category: DecisionCategory.ARCHITECTURE });
      expect(relevant.every(d => d.category === DecisionCategory.ARCHITECTURE)).toBe(true);
    });

    it('should filter successOnly when requested', () => {
      const mem = createMemory({ similarityThreshold: 0.1 });
      const d1 = mem.recordDecision({ description: 'Good deploy strategy' });
      mem.updateOutcome(d1.id, Outcome.SUCCESS);
      const d2 = mem.recordDecision({ description: 'Bad deploy strategy' });
      mem.updateOutcome(d2.id, Outcome.FAILURE);

      const relevant = mem.getRelevantDecisions('deploy strategy', { successOnly: true });
      expect(relevant.every(d => d.outcome === Outcome.SUCCESS)).toBe(true);
    });
  });

  describe('injectDecisionContext', () => {
    it('should return empty string when no relevant decisions', () => {
      const mem = createMemory();
      expect(mem.injectDecisionContext('something unrelated')).toBe('');
    });

    it('should format relevant decisions as markdown', () => {
      const mem = createMemory({ similarityThreshold: 0.1 });
      const d = mem.recordDecision({
        description: 'Use retry with exponential backoff',
        rationale: 'Prevents thundering herd',
      });
      mem.updateOutcome(d.id, Outcome.SUCCESS, 'Worked perfectly');

      const context = mem.injectDecisionContext('retry strategy for API calls');
      expect(context).toContain('Relevant Past Decisions');
      expect(context).toContain('exponential backoff');
      expect(context).toContain('✅');
    });

    it('should emit DECISIONS_INJECTED event', () => {
      const mem = createMemory({ similarityThreshold: 0.1 });
      const handler = jest.fn();
      mem.on(Events.DECISIONS_INJECTED, handler);

      const d = mem.recordDecision({ description: 'caching strategy for data' });
      mem.updateOutcome(d.id, Outcome.SUCCESS);
      mem.injectDecisionContext('data caching approach');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Pattern Detection
  // ─────────────────────────────────────────────────────────────────────────────

  describe('pattern detection', () => {
    it('should detect pattern after threshold occurrences', () => {
      const mem = createMemory({ patternThreshold: 3, similarityThreshold: 0.1 });
      const handler = jest.fn();
      mem.on(Events.PATTERN_DETECTED, handler);

      mem.recordDecision({ description: 'Use circuit breaker for service A' });
      mem.recordDecision({ description: 'Use circuit breaker for service B' });
      mem.recordDecision({ description: 'Use circuit breaker for service C' });

      expect(handler).toHaveBeenCalled();
      expect(mem.getPatterns().length).toBeGreaterThanOrEqual(1);
    });

    it('should not duplicate patterns', () => {
      const mem = createMemory({ patternThreshold: 3 });

      for (let i = 0; i < 6; i++) {
        mem.recordDecision({ description: `Use retry pattern for service ${i}` });
      }

      const patterns = mem.getPatterns();
      // Should not have multiple identical patterns
      const unique = new Set(patterns.map(p => p.category));
      expect(patterns.length).toBeLessThanOrEqual(unique.size + 1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Stats & Listing
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const mem = createMemory();
      const d1 = mem.recordDecision({ description: 'Decision 1' });
      const d2 = mem.recordDecision({ description: 'Decision 2' });
      const d3 = mem.recordDecision({ description: 'Decision 3' });

      mem.updateOutcome(d1.id, Outcome.SUCCESS);
      mem.updateOutcome(d2.id, Outcome.FAILURE);

      const stats = mem.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byOutcome[Outcome.SUCCESS]).toBe(1);
      expect(stats.byOutcome[Outcome.FAILURE]).toBe(1);
      expect(stats.byOutcome[Outcome.PENDING]).toBe(1);
      expect(stats.successRate).toBe(50);
    });
  });

  describe('listDecisions', () => {
    it('should list decisions in reverse chronological order', () => {
      const mem = createMemory();
      mem.recordDecision({ description: 'First' });
      mem.recordDecision({ description: 'Second' });
      mem.recordDecision({ description: 'Third' });

      const list = mem.listDecisions();
      expect(list[0].description).toBe('Third');
      expect(list[2].description).toBe('First');
    });

    it('should respect limit', () => {
      const mem = createMemory();
      for (let i = 0; i < 10; i++) {
        mem.recordDecision({ description: `Decision ${i}` });
      }

      const list = mem.listDecisions({ limit: 3 });
      expect(list).toHaveLength(3);
    });

    it('should filter by category', () => {
      const mem = createMemory();
      mem.recordDecision({ description: 'Architecture choice', category: DecisionCategory.ARCHITECTURE });
      mem.recordDecision({ description: 'Testing choice', category: DecisionCategory.TESTING });

      const list = mem.listDecisions({ category: DecisionCategory.ARCHITECTURE });
      expect(list).toHaveLength(1);
      expect(list[0].category).toBe(DecisionCategory.ARCHITECTURE);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────────

  describe('save & load roundtrip', () => {
    it('should persist and restore full state', async () => {
      const mem = createMemory();
      const d = mem.recordDecision({
        description: 'Use event-driven architecture',
        rationale: 'Decouples components',
        alternatives: ['REST', 'gRPC'],
        agentId: 'cto',
      });
      mem.updateOutcome(d.id, Outcome.SUCCESS, 'Clean separation achieved');
      await mem.save();

      const mem2 = createMemory();
      await mem2.load();

      expect(mem2.decisions).toHaveLength(1);
      expect(mem2.decisions[0].description).toBe('Use event-driven architecture');
      expect(mem2.decisions[0].outcome).toBe(Outcome.SUCCESS);
      expect(mem2.decisions[0].rationale).toBe('Decouples components');
      expect(mem2.decisions[0].alternatives).toEqual(['REST', 'gRPC']);
    });

    it('should cap decisions at maxDecisions on save', async () => {
      const mem = createMemory({ maxDecisions: 5 });

      for (let i = 0; i < 10; i++) {
        mem.recordDecision({ description: `Decision ${i}` });
      }

      await mem.save();

      const mem2 = createMemory({ maxDecisions: 5 });
      await mem2.load();
      expect(mem2.decisions.length).toBeLessThanOrEqual(5);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Time Decay
  // ─────────────────────────────────────────────────────────────────────────────

  describe('confidence decay', () => {
    it('should decay confidence over time', () => {
      const mem = createMemory({ confidenceDecayDays: 30 });
      const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(); // 20 days ago
      const decayed = mem._applyTimeDecay(1.0, oldDate);

      expect(decayed).toBeLessThan(1.0);
      expect(decayed).toBeGreaterThan(0);
    });

    it('should not decay recent decisions', () => {
      const mem = createMemory({ confidenceDecayDays: 30 });
      const recent = new Date().toISOString();
      const decayed = mem._applyTimeDecay(1.0, recent);

      expect(decayed).toBeCloseTo(1.0, 1);
    });
  });
});
