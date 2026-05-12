'use strict';

const path = require('path');

// Module paths
const CIRCUIT_BREAKER_PATH = path.resolve(
  __dirname,
  '../../../.aiox-core/core/ids/circuit-breaker.js',
);
const VERIFICATION_GATE_PATH = path.resolve(
  __dirname,
  '../../../.aiox-core/core/ids/verification-gate.js',
);
const G1_PATH = path.resolve(
  __dirname,
  '../../../.aiox-core/core/ids/gates/g1-epic-creation.js',
);
const G2_PATH = path.resolve(
  __dirname,
  '../../../.aiox-core/core/ids/gates/g2-story-creation.js',
);
const G3_PATH = path.resolve(
  __dirname,
  '../../../.aiox-core/core/ids/gates/g3-story-validation.js',
);
const G4_PATH = path.resolve(
  __dirname,
  '../../../.aiox-core/core/ids/gates/g4-dev-context.js',
);

const {
  CircuitBreaker,
  STATE_CLOSED,
  STATE_OPEN,
  STATE_HALF_OPEN,
  DEFAULT_FAILURE_THRESHOLD,
  DEFAULT_SUCCESS_THRESHOLD,
  DEFAULT_RESET_TIMEOUT_MS,
} = require(CIRCUIT_BREAKER_PATH);

const {
  VerificationGate,
  createGateResult,
  DEFAULT_TIMEOUT_MS,
} = require(VERIFICATION_GATE_PATH);

const { G1EpicCreationGate } = require(G1_PATH);
const { G2StoryCreationGate } = require(G2_PATH);
const { G3StoryValidationGate } = require(G3_PATH);
const { G4DevContextGate, G4_DEFAULT_TIMEOUT_MS } = require(G4_PATH);

// ================================================================
// Test Helpers
// ================================================================

/**
 * Create a mock logger that suppresses output and records calls.
 */
function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
}

/**
 * Create a mock IncrementalDecisionEngine.
 * @param {object} [analyzeResult] — Custom result for analyze()
 */
function createMockDecisionEngine(analyzeResult) {
  const defaultResult = {
    intent: 'test',
    recommendations: [],
    summary: { totalEntities: 100, matchesFound: 0, decision: 'CREATE', confidence: 'low' },
    rationale: 'No matches found.',
  };

  return {
    analyze: jest.fn().mockReturnValue(analyzeResult || defaultResult),
  };
}

/**
 * Create a mock RegistryLoader.
 */
function createMockRegistryLoader() {
  return {
    load: jest.fn(),
    queryByPath: jest.fn().mockReturnValue([]),
    queryByKeywords: jest.fn().mockReturnValue([]),
    queryByType: jest.fn().mockReturnValue([]),
    queryByPurpose: jest.fn().mockReturnValue([]),
  };
}

/**
 * Create a concrete subclass for testing the abstract base.
 */
class TestGate extends VerificationGate {
  constructor(config = {}, verifyImpl) {
    super({ gateId: 'TEST', agent: '@test', ...config });
    this._verifyImpl = verifyImpl || (async () => ({
      passed: true,
      warnings: [],
      opportunities: [],
    }));
  }

  async _doVerify(context) {
    return this._verifyImpl(context);
  }
}

// ================================================================
// CircuitBreaker Tests
// ================================================================

describe('CircuitBreaker', () => {
  let cb;

  beforeEach(() => {
    cb = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      resetTimeoutMs: 100,
    });
  });

  describe('constructor', () => {
    it('uses default values when no options provided', () => {
      const defaultCb = new CircuitBreaker();
      const stats = defaultCb.getStats();
      expect(stats.state).toBe(STATE_CLOSED);
      expect(stats.failureCount).toBe(0);
      expect(stats.totalTrips).toBe(0);
    });

    it('accepts custom thresholds', () => {
      expect(cb.getState()).toBe(STATE_CLOSED);
    });
  });

  describe('CLOSED state', () => {
    it('allows requests when closed', () => {
      expect(cb.isAllowed()).toBe(true);
    });

    it('resets failure count on success', () => {
      cb.recordFailure();
      cb.recordFailure();
      cb.recordSuccess();
      expect(cb.getStats().failureCount).toBe(0);
    });

    it('opens after reaching failure threshold', () => {
      cb.recordFailure();
      cb.recordFailure();
      cb.recordFailure(); // threshold = 3
      expect(cb.getState()).toBe(STATE_OPEN);
      expect(cb.getStats().totalTrips).toBe(1);
    });

    it('stays closed if failures are below threshold', () => {
      cb.recordFailure();
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_CLOSED);
      expect(cb.isAllowed()).toBe(true);
    });
  });

  describe('OPEN state', () => {
    beforeEach(() => {
      // Trip the circuit
      cb.recordFailure();
      cb.recordFailure();
      cb.recordFailure();
    });

    it('blocks requests when open', () => {
      expect(cb.isAllowed()).toBe(false);
    });

    it('transitions to HALF_OPEN after reset timeout', async () => {
      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cb.isAllowed()).toBe(true);
      expect(cb.getState()).toBe(STATE_HALF_OPEN);
    });

    it('reports correct stats', () => {
      const stats = cb.getStats();
      expect(stats.state).toBe(STATE_OPEN);
      expect(stats.failureCount).toBe(3);
      expect(stats.totalTrips).toBe(1);
      expect(stats.lastFailureTime).toBeGreaterThan(0);
    });
  });

  describe('HALF_OPEN state', () => {
    beforeEach(async () => {
      cb.recordFailure();
      cb.recordFailure();
      cb.recordFailure();
      await new Promise((resolve) => setTimeout(resolve, 150));
      cb.isAllowed(); // Triggers transition to HALF_OPEN (first probe)
    });

    it('blocks additional requests while probe is in-flight', () => {
      // First probe was consumed by isAllowed() in beforeEach
      expect(cb.isAllowed()).toBe(false);
    });

    it('allows new probe after success resets in-flight flag', () => {
      cb.recordSuccess(); // Clears in-flight flag
      expect(cb.isAllowed()).toBe(true);
    });

    it('closes circuit after success threshold reached', () => {
      cb.recordSuccess();
      cb.recordSuccess(); // threshold = 2
      expect(cb.getState()).toBe(STATE_CLOSED);
      expect(cb.getStats().failureCount).toBe(0);
    });

    it('re-opens on any failure', () => {
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_OPEN);
      expect(cb.getStats().totalTrips).toBe(2);
    });

    it('stays half-open if not enough successes', () => {
      cb.recordSuccess();
      expect(cb.getState()).toBe(STATE_HALF_OPEN);
    });
  });

  describe('reset()', () => {
    it('resets to CLOSED state', () => {
      cb.recordFailure();
      cb.recordFailure();
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_OPEN);

      cb.reset();
      expect(cb.getState()).toBe(STATE_CLOSED);
      expect(cb.getStats().failureCount).toBe(0);
      expect(cb.isAllowed()).toBe(true);
    });
  });

  describe('exported constants', () => {
    it('exports state constants', () => {
      expect(STATE_CLOSED).toBe('CLOSED');
      expect(STATE_OPEN).toBe('OPEN');
      expect(STATE_HALF_OPEN).toBe('HALF_OPEN');
    });

    it('exports default configuration values', () => {
      expect(DEFAULT_FAILURE_THRESHOLD).toBe(5);
      expect(DEFAULT_SUCCESS_THRESHOLD).toBe(3);
      expect(DEFAULT_RESET_TIMEOUT_MS).toBe(60000);
    });
  });
});

// ================================================================
// VerificationGate Base Class Tests
// ================================================================

describe('VerificationGate', () => {
  let logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  describe('constructor', () => {
    it('requires gateId', () => {
      expect(() => new TestGate({ gateId: undefined, agent: '@test' })).toThrow(
        /gateId is required/,
      );
    });

    it('requires agent', () => {
      expect(() => new TestGate({ gateId: 'T1', agent: undefined })).toThrow(
        /agent is required/,
      );
    });

    it('initializes with correct defaults', () => {
      const gate = new TestGate({ logger });
      expect(gate.getGateId()).toBe('TEST');
      expect(gate.getAgent()).toBe('@test');
      expect(gate.isBlocking()).toBe(false);
      expect(gate.getInvocationCount()).toBe(0);
      expect(gate.getLastResult()).toBeNull();
    });
  });

  describe('verify()', () => {
    it('returns a valid GateResult structure', async () => {
      const gate = new TestGate({ logger });
      const result = await gate.verify({ intent: 'test' });

      expect(result).toHaveProperty('gateId', 'TEST');
      expect(result).toHaveProperty('agent', '@test');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('passed', true);
      expect(result.result).toHaveProperty('blocking', false);
      expect(result.result).toHaveProperty('warnings');
      expect(result.result).toHaveProperty('opportunities');
      expect(result).toHaveProperty('executionMs');
      expect(result).toHaveProperty('circuitBreakerState');
      expect(result).toHaveProperty('override', null);
    });

    it('increments invocation count', async () => {
      const gate = new TestGate({ logger });
      await gate.verify({});
      await gate.verify({});
      expect(gate.getInvocationCount()).toBe(2);
    });

    it('stores last result', async () => {
      const gate = new TestGate({ logger });
      const result = await gate.verify({ intent: 'hello' });
      expect(gate.getLastResult()).toEqual(result);
    });

    it('logs invocation', async () => {
      const gate = new TestGate({ logger });
      await gate.verify({});
      expect(logger.info).toHaveBeenCalled();
    });

    it('passes context to _doVerify', async () => {
      const verifyFn = jest.fn().mockResolvedValue({
        passed: true,
        warnings: [],
        opportunities: [],
      });
      const gate = new TestGate({ logger }, verifyFn);
      const ctx = { intent: 'test intent' };
      await gate.verify(ctx);
      expect(verifyFn).toHaveBeenCalledWith(ctx);
    });

    it('surfaces warnings from _doVerify', async () => {
      const gate = new TestGate({ logger }, async () => ({
        passed: true,
        warnings: ['Watch out!'],
        opportunities: [],
      }));
      const result = await gate.verify({});
      expect(result.result.warnings).toContain('Watch out!');
    });

    it('surfaces opportunities from _doVerify', async () => {
      const opp = { entity: 'test.js', relevance: 0.9, recommendation: 'REUSE', reason: 'exact' };
      const gate = new TestGate({ logger }, async () => ({
        passed: true,
        warnings: [],
        opportunities: [opp],
      }));
      const result = await gate.verify({});
      expect(result.result.opportunities).toHaveLength(1);
      expect(result.result.opportunities[0]).toEqual(opp);
    });
  });

  describe('timeout handling', () => {
    it('returns warn-and-proceed on timeout', async () => {
      const gate = new TestGate(
        { timeoutMs: 50, logger },
        () => new Promise((resolve) => setTimeout(() => resolve({
          passed: true,
          warnings: [],
          opportunities: [],
        }), 200)),
      );

      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('timed out')]),
      );
    });

    it('returns normal result when within timeout', async () => {
      const gate = new TestGate(
        { timeoutMs: 500, logger },
        async () => ({
          passed: true,
          warnings: ['fast result'],
          opportunities: [],
        }),
      );

      const result = await gate.verify({});
      expect(result.result.warnings).toContain('fast result');
    });
  });

  describe('error handling (graceful degradation)', () => {
    it('returns warn-and-proceed on error', async () => {
      const gate = new TestGate({ logger }, async () => {
        throw new Error('Database connection failed');
      });

      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('Database connection failed')]),
      );
    });

    it('logs warning on error', async () => {
      const gate = new TestGate({ logger }, async () => {
        throw new Error('Test error');
      });

      await gate.verify({});
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Gate failed'),
      );
    });

    it('records failure in circuit breaker on error', async () => {
      const gate = new TestGate({ logger }, async () => {
        throw new Error('Failure');
      });

      await gate.verify({});
      const stats = gate.getCircuitBreakerStats();
      expect(stats.failureCount).toBe(1);
    });
  });

  describe('circuit breaker integration', () => {
    it('skips gate when circuit breaker is open', async () => {
      const verifyFn = jest.fn().mockResolvedValue({
        passed: true,
        warnings: [],
        opportunities: [],
      });

      const gate = new TestGate(
        {
          logger,
          circuitBreakerOptions: { failureThreshold: 2, resetTimeoutMs: 60000 },
        },
        async () => { throw new Error('fail'); },
      );

      // Trip the circuit
      await gate.verify({});
      await gate.verify({});

      // Now replace with the mock to check it's NOT called
      gate._doVerify = verifyFn;
      const result = await gate.verify({});

      expect(verifyFn).not.toHaveBeenCalled();
      expect(result.result.passed).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('circuit breaker open')]),
      );
    });

    it('records success in circuit breaker on successful verify', async () => {
      const gate = new TestGate({ logger });
      await gate.verify({});
      const stats = gate.getCircuitBreakerStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.state).toBe('CLOSED');
    });

    it('exposes circuit breaker stats', () => {
      const gate = new TestGate({ logger });
      const stats = gate.getCircuitBreakerStats();
      expect(stats).toHaveProperty('state');
      expect(stats).toHaveProperty('failureCount');
      expect(stats).toHaveProperty('successCount');
      expect(stats).toHaveProperty('totalTrips');
    });
  });

  describe('abstract _doVerify', () => {
    it('throws when not overridden', async () => {
      // Test the raw VerificationGate (not TestGate)
      // We need to create a minimal concrete subclass that does NOT override _doVerify
      class RawGate extends VerificationGate {
        constructor() {
          super({ gateId: 'RAW', agent: '@raw', logger: createMockLogger() });
        }
      }

      const gate = new RawGate();
      const result = await gate.verify({});
      // It should gracefully degrade (error -> warn-and-proceed)
      expect(result.result.passed).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('_doVerify() must be implemented')]),
      );
    });
  });

  describe('createGateResult()', () => {
    it('creates result with defaults', () => {
      const result = createGateResult();
      expect(result.gateId).toBeNull();
      expect(result.agent).toBeNull();
      expect(result.timestamp).toBeDefined();
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
      expect(result.result.warnings).toEqual([]);
      expect(result.result.opportunities).toEqual([]);
      expect(result.override).toBeNull();
    });

    it('creates result with custom fields', () => {
      const result = createGateResult({
        gateId: 'G1',
        agent: '@pm',
        passed: false,
        blocking: true,
        warnings: ['warning1'],
        opportunities: [{ entity: 'test' }],
        override: { reason: 'urgent' },
      });

      expect(result.gateId).toBe('G1');
      expect(result.agent).toBe('@pm');
      expect(result.result.passed).toBe(false);
      expect(result.result.blocking).toBe(true);
      expect(result.result.warnings).toEqual(['warning1']);
      expect(result.result.opportunities).toEqual([{ entity: 'test' }]);
      expect(result.override).toEqual({ reason: 'urgent' });
    });
  });

  describe('exported constants', () => {
    it('exports DEFAULT_TIMEOUT_MS', () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(2000);
    });
  });
});

// ================================================================
// G1 Epic Creation Gate Tests
// ================================================================

describe('G1EpicCreationGate', () => {
  let logger;
  let decisionEngine;

  beforeEach(() => {
    logger = createMockLogger();
    decisionEngine = createMockDecisionEngine();
  });

  describe('constructor', () => {
    it('requires decisionEngine', () => {
      expect(() => new G1EpicCreationGate({ logger })).toThrow(
        /decisionEngine is required/,
      );
    });

    it('creates gate with correct config', () => {
      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      expect(gate.getGateId()).toBe('G1');
      expect(gate.getAgent()).toBe('@pm');
      expect(gate.isBlocking()).toBe(false);
    });
  });

  describe('verify()', () => {
    it('returns passed=true with empty intent', async () => {
      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('No epic intent')]),
      );
    });

    it('calls decisionEngine.analyze with intent', async () => {
      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      await gate.verify({ intent: 'user authentication system' });
      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        'user authentication system',
        expect.any(Object),
      );
    });

    it('combines epicTitle with intent', async () => {
      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      await gate.verify({
        intent: 'implement SSO login',
        epicTitle: 'Auth Epic',
      });
      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        'Auth Epic: implement SSO login',
        expect.any(Object),
      );
    });

    it('surfaces opportunities from analysis', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          {
            entityPath: 'tasks/create-auth.md',
            relevanceScore: 0.85,
            decision: 'ADAPT',
            rationale: 'Existing auth task',
          },
        ],
        summary: { totalEntities: 100, matchesFound: 1, decision: 'ADAPT', confidence: 'high' },
        rationale: 'Found match.',
      });

      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'auth system' });

      expect(result.result.opportunities).toHaveLength(1);
      expect(result.result.opportunities[0].entity).toBe('tasks/create-auth.md');
      expect(result.result.opportunities[0].relevance).toBe(0.85);
      expect(result.result.opportunities[0].recommendation).toBe('ADAPT');
    });

    it('reports warning when opportunities found', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'a.md', relevanceScore: 0.9, decision: 'REUSE', rationale: 'match' },
          { entityPath: 'b.md', relevanceScore: 0.7, decision: 'ADAPT', rationale: 'partial' },
        ],
        summary: { totalEntities: 100, matchesFound: 2, decision: 'REUSE', confidence: 'high' },
        rationale: 'Found matches.',
      });

      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'something' });

      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('2 related entities')]),
      );
    });

    it('always passes (advisory gate)', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'x.md', relevanceScore: 0.99, decision: 'REUSE', rationale: 'exact' },
        ],
        summary: { totalEntities: 100, matchesFound: 1, decision: 'REUSE', confidence: 'high' },
        rationale: 'Exact match found.',
      });

      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'something' });
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
    });

    it('passes type/category context to analyze', async () => {
      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      await gate.verify({
        intent: 'test',
        type: 'task',
        category: 'development',
      });
      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        'test',
        { type: 'task', category: 'development' },
      );
    });

    it('forwards analysis warnings', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [],
        summary: { totalEntities: 5, matchesFound: 0, decision: 'CREATE', confidence: 'low' },
        rationale: 'No matches.',
        warnings: ['Registry sparse'],
      });

      const gate = new G1EpicCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'something' });
      expect(result.result.warnings).toContain('Registry sparse');
    });
  });
});

// ================================================================
// G2 Story Creation Gate Tests
// ================================================================

describe('G2StoryCreationGate', () => {
  let logger;
  let decisionEngine;

  beforeEach(() => {
    logger = createMockLogger();
    decisionEngine = createMockDecisionEngine();
  });

  describe('constructor', () => {
    it('requires decisionEngine', () => {
      expect(() => new G2StoryCreationGate({ logger })).toThrow(
        /decisionEngine is required/,
      );
    });

    it('creates gate with correct config', () => {
      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      expect(gate.getGateId()).toBe('G2');
      expect(gate.getAgent()).toBe('@sm');
      expect(gate.isBlocking()).toBe(false);
    });
  });

  describe('verify()', () => {
    it('returns passed=true with empty intent', async () => {
      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('No story intent')]),
      );
    });

    it('queries for tasks and templates separately', async () => {
      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      await gate.verify({ intent: 'create login form' });

      expect(decisionEngine.analyze).toHaveBeenCalledTimes(2);
      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        'create login form',
        { type: 'task' },
      );
      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        'create login form',
        { type: 'template' },
      );
    });

    it('enriches intent with acceptance criteria', async () => {
      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      await gate.verify({
        intent: 'login form',
        acceptanceCriteria: ['user can login', 'error shown on failure'],
      });

      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        expect.stringContaining('user can login'),
        expect.any(Object),
      );
    });

    it('reports task matches as opportunities', async () => {
      decisionEngine.analyze.mockImplementation((_, context) => {
        if (context.type === 'task') {
          return {
            recommendations: [
              { entityPath: 'tasks/login.md', relevanceScore: 0.8, decision: 'ADAPT', rationale: 'match' },
            ],
            summary: { totalEntities: 100, matchesFound: 1 },
          };
        }
        return { recommendations: [], summary: { totalEntities: 100, matchesFound: 0 } };
      });

      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'login form' });

      expect(result.result.opportunities.some((o) => o.type === 'task')).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('1 existing tasks')]),
      );
    });

    it('reports template matches as opportunities', async () => {
      decisionEngine.analyze.mockImplementation((_, context) => {
        if (context.type === 'template') {
          return {
            recommendations: [
              { entityPath: 'templates/form.md', relevanceScore: 0.7, decision: 'ADAPT', rationale: 'form match' },
            ],
            summary: { totalEntities: 100, matchesFound: 1 },
          };
        }
        return { recommendations: [], summary: { totalEntities: 100, matchesFound: 0 } };
      });

      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'create form' });

      expect(result.result.opportunities.some((o) => o.type === 'template')).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('1 existing templates')]),
      );
    });

    it('sorts opportunities by relevance descending', async () => {
      decisionEngine.analyze.mockImplementation((_, context) => {
        if (context.type === 'task') {
          return {
            recommendations: [
              { entityPath: 'tasks/a.md', relevanceScore: 0.6, decision: 'ADAPT', rationale: 'low' },
            ],
            summary: { totalEntities: 100, matchesFound: 1 },
          };
        }
        return {
          recommendations: [
            { entityPath: 'templates/b.md', relevanceScore: 0.9, decision: 'REUSE', rationale: 'high' },
          ],
          summary: { totalEntities: 100, matchesFound: 1 },
        };
      });

      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'something' });

      expect(result.result.opportunities[0].relevance).toBeGreaterThanOrEqual(
        result.result.opportunities[1].relevance,
      );
    });

    it('always passes (advisory gate)', async () => {
      const gate = new G2StoryCreationGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'anything' });
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
    });
  });
});

// ================================================================
// G3 Story Validation Gate Tests
// ================================================================

describe('G3StoryValidationGate', () => {
  let logger;
  let decisionEngine;
  let registryLoader;

  beforeEach(() => {
    logger = createMockLogger();
    decisionEngine = createMockDecisionEngine();
    registryLoader = createMockRegistryLoader();
  });

  describe('constructor', () => {
    it('requires decisionEngine', () => {
      expect(() => new G3StoryValidationGate({ registryLoader, logger })).toThrow(
        /decisionEngine is required/,
      );
    });

    it('requires registryLoader', () => {
      expect(() => new G3StoryValidationGate({ decisionEngine, logger })).toThrow(
        /registryLoader is required/,
      );
    });

    it('creates gate with correct config', () => {
      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      expect(gate.getGateId()).toBe('G3');
      expect(gate.getAgent()).toBe('@po');
      expect(gate.isBlocking()).toBe(true);
    });
  });

  describe('verify()', () => {
    it('returns passed=true with empty intent', async () => {
      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
    });

    it('validates referenced artifacts exist in registry', async () => {
      registryLoader.queryByPath
        .mockReturnValueOnce([{ id: 'test', path: 'tasks/auth.md' }])  // found
        .mockReturnValueOnce([]);  // not found

      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({
        intent: 'auth story',
        referencedArtifacts: ['tasks/auth.md', 'tasks/missing.md'],
      });

      expect(registryLoader.queryByPath).toHaveBeenCalledTimes(2);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('1 referenced artifacts not found'),
          expect.stringContaining('1 referenced artifacts verified'),
        ]),
      );
    });

    it('soft blocks when references are invalid (no override)', async () => {
      registryLoader.queryByPath.mockReturnValue([]);

      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({
        intent: 'auth story',
        referencedArtifacts: ['tasks/nonexistent.md'],
      });

      expect(result.result.passed).toBe(false);
    });

    it('passes when override provided', async () => {
      registryLoader.queryByPath.mockReturnValue([]);

      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({
        intent: 'auth story',
        referencedArtifacts: ['tasks/nonexistent.md'],
        override: { reason: 'New artifact being created', user: '@pm' },
      });

      expect(result.result.passed).toBe(true);
    });

    it('detects potential duplication (relevance >= 0.8)', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'tasks/similar.md', relevanceScore: 0.85, decision: 'REUSE', rationale: 'near duplicate' },
          { entityPath: 'tasks/related.md', relevanceScore: 0.6, decision: 'ADAPT', rationale: 'related' },
        ],
        summary: { totalEntities: 100, matchesFound: 2 },
      });

      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({ intent: 'similar task' });

      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('Potential duplication detected')]),
      );
      // Duplication (>=0.8) causes soft block
      expect(result.result.passed).toBe(false);
    });

    it('passes when no duplication and references valid', async () => {
      registryLoader.queryByPath.mockReturnValue([{ id: 'exists' }]);
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'tasks/related.md', relevanceScore: 0.5, decision: 'ADAPT', rationale: 'low relevance' },
        ],
        summary: { totalEntities: 100, matchesFound: 1 },
      });

      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({
        intent: 'new unique task',
        referencedArtifacts: ['tasks/existing.md'],
      });

      expect(result.result.passed).toBe(true);
    });

    it('surfaces all opportunities regardless of blocking', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'a.md', relevanceScore: 0.9, decision: 'REUSE', rationale: 'dup' },
          { entityPath: 'b.md', relevanceScore: 0.5, decision: 'ADAPT', rationale: 'partial' },
        ],
        summary: { totalEntities: 100, matchesFound: 2 },
      });

      const gate = new G3StoryValidationGate({ decisionEngine, registryLoader, logger });
      const result = await gate.verify({ intent: 'test' });

      expect(result.result.opportunities).toHaveLength(2);
    });
  });
});

// ================================================================
// G4 Dev Context Gate Tests
// ================================================================

describe('G4DevContextGate', () => {
  let logger;
  let decisionEngine;

  beforeEach(() => {
    logger = createMockLogger();
    decisionEngine = createMockDecisionEngine();
  });

  describe('constructor', () => {
    it('requires decisionEngine', () => {
      expect(() => new G4DevContextGate({ logger })).toThrow(
        /decisionEngine is required/,
      );
    });

    it('creates gate with correct config', () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      expect(gate.getGateId()).toBe('G4');
      expect(gate.getAgent()).toBe('@dev');
      expect(gate.isBlocking()).toBe(false);
    });

    it('defaults to 2s timeout', () => {
      expect(G4_DEFAULT_TIMEOUT_MS).toBe(2000);
    });
  });

  describe('verify()', () => {
    it('returns passed=true with empty intent', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('No intent provided')]),
      );
    });

    it('calls decisionEngine.analyze with intent', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      await gate.verify({ intent: 'implement circuit breaker' });
      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        'implement circuit breaker',
        expect.any(Object),
      );
    });

    it('enriches intent with file path keywords', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      await gate.verify({
        intent: 'implement gate',
        filePaths: ['verification-gate.js', 'circuit-breaker.js'],
      });

      expect(decisionEngine.analyze).toHaveBeenCalledWith(
        expect.stringContaining('verification-gate'),
        expect.any(Object),
      );
    });

    it('surfaces relevant artifacts as opportunities', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'core/ids/registry-loader.js', relevanceScore: 0.7, decision: 'ADAPT', rationale: 'related IDS module' },
        ],
        summary: { totalEntities: 100, matchesFound: 1 },
      });

      const gate = new G4DevContextGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'IDS gate' });

      expect(result.result.opportunities).toHaveLength(1);
      expect(result.result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('1 relevant artifacts found')]),
      );
    });

    it('always passes and never blocks', async () => {
      decisionEngine.analyze.mockReturnValue({
        intent: 'test',
        recommendations: [
          { entityPath: 'exact-match.js', relevanceScore: 0.99, decision: 'REUSE', rationale: 'exact' },
        ],
        summary: { totalEntities: 100, matchesFound: 1 },
      });

      const gate = new G4DevContextGate({ decisionEngine, logger });
      const result = await gate.verify({ intent: 'test' });
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
    });

    it('records metrics for every invocation', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      await gate.verify({ intent: 'first', storyId: 'IDS-5a' });
      await gate.verify({ intent: 'second', storyId: 'IDS-5b' });

      const metrics = gate.getMetricsLog();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].storyId).toBe('IDS-5a');
      expect(metrics[1].storyId).toBe('IDS-5b');
      expect(metrics[0]).toHaveProperty('executionTimeMs');
      expect(metrics[0]).toHaveProperty('timestamp');
      expect(metrics[0]).toHaveProperty('matchesFound');
    });

    it('uses "unknown" storyId when not provided', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      await gate.verify({ intent: 'no story id' });

      const metrics = gate.getMetricsLog();
      expect(metrics[0].storyId).toBe('unknown');
    });

    it('clears metrics log', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      await gate.verify({ intent: 'test' });
      expect(gate.getMetricsLog()).toHaveLength(1);

      gate.clearMetricsLog();
      expect(gate.getMetricsLog()).toHaveLength(0);
    });
  });

  describe('performance', () => {
    it('executes within 2s timeout for normal operations', async () => {
      const gate = new G4DevContextGate({ decisionEngine, logger });
      const start = Date.now();
      await gate.verify({ intent: 'performance test' });
      const elapsed = Date.now() - start;

      // Should be well under 2s for mock operations
      expect(elapsed).toBeLessThan(2000);
    });
  });
});

// ================================================================
// Graceful Degradation Integration Tests
// ================================================================

describe('Graceful Degradation (Integration)', () => {
  let logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('gate never blocks even with repeated failures', async () => {
    let callCount = 0;
    const gate = new TestGate(
      {
        logger,
        circuitBreakerOptions: { failureThreshold: 2, resetTimeoutMs: 60000 },
      },
      async () => {
        callCount++;
        throw new Error(`Failure #${callCount}`);
      },
    );

    // All invocations should pass (graceful degradation)
    for (let i = 0; i < 5; i++) {
      const result = await gate.verify({});
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
    }
  });

  it('circuit breaker prevents cascading failures', async () => {
    let doVerifyCalls = 0;
    const gate = new TestGate(
      {
        logger,
        circuitBreakerOptions: { failureThreshold: 2, resetTimeoutMs: 60000 },
      },
      async () => {
        doVerifyCalls++;
        throw new Error('Persistent failure');
      },
    );

    // Trip the circuit: 2 failures
    await gate.verify({});
    await gate.verify({});
    expect(doVerifyCalls).toBe(2);

    // After circuit opens, _doVerify should NOT be called
    await gate.verify({});
    await gate.verify({});
    expect(doVerifyCalls).toBe(2); // No additional calls
  });

  it('timeout does not block execution', async () => {
    const gate = new TestGate(
      { timeoutMs: 50, logger },
      () => new Promise((resolve) => setTimeout(() => resolve({
        passed: false,
        warnings: ['should not appear'],
        opportunities: [],
      }), 500)),
    );

    const start = Date.now();
    const result = await gate.verify({});
    const elapsed = Date.now() - start;

    expect(result.result.passed).toBe(true); // Warn-and-proceed
    expect(elapsed).toBeLessThan(200); // Should timeout at ~50ms, not wait 500ms
  });

  it('all G1-G4 gates degrade gracefully on engine error', async () => {
    const brokenEngine = {
      analyze: jest.fn().mockImplementation(() => {
        throw new Error('Engine crashed');
      }),
    };

    const brokenLoader = createMockRegistryLoader();
    brokenLoader.queryByPath.mockImplementation(() => {
      throw new Error('Loader crashed');
    });

    const gates = [
      new G1EpicCreationGate({ decisionEngine: brokenEngine, logger }),
      new G2StoryCreationGate({ decisionEngine: brokenEngine, logger }),
      new G3StoryValidationGate({
        decisionEngine: brokenEngine,
        registryLoader: brokenLoader,
        logger,
      }),
      new G4DevContextGate({ decisionEngine: brokenEngine, logger }),
    ];

    for (const gate of gates) {
      const result = await gate.verify({ intent: 'test' });
      expect(result.result.passed).toBe(true);
      expect(result.result.blocking).toBe(false);
      expect(result.result.warnings.length).toBeGreaterThan(0);
    }
  });
});
