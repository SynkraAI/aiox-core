'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const requireFromRoot = (modulePath) => require(path.join(repoRoot, modulePath));

const {
  CircuitBreaker,
  STATE_HALF_OPEN,
  STATE_OPEN,
} = requireFromRoot('.aiox-core/core/ids/circuit-breaker');
const ConditionEvaluator = requireFromRoot('.aiox-core/core/orchestration/condition-evaluator');
const { GotchasMemory } = requireFromRoot('.aiox-core/core/memory/gotchas-memory');
const IdeationEngine = requireFromRoot('.aiox-core/core/ideation/ideation-engine');

function createProfile(overrides = {}) {
  return {
    hasDatabase: false,
    hasFrontend: false,
    hasBackend: false,
    hasTypeScript: false,
    hasTests: false,
    database: {
      type: null,
      envVarsConfigured: false,
      hasRLS: false,
      hasMigrations: false,
    },
    frontend: {
      framework: null,
      styling: null,
    },
    ...overrides,
  };
}

function withMockedNow(startMs) {
  let now = startMs;
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now);
  return {
    advance: (ms) => {
      now += ms;
      return now;
    },
    restore: () => spy.mockRestore(),
  };
}

describe('resilience subsystem regressions', () => {
  describe('CircuitBreaker', () => {
    it('preserves the recovery timeout when failures continue while OPEN', () => {
      const clock = withMockedNow(1_000);
      const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1_000 });

      try {
        breaker.recordFailure();
        const openedAt = breaker.getStats().lastFailureTime;

        clock.advance(500);
        breaker.recordFailure();

        expect(breaker.getState()).toBe(STATE_OPEN);
        expect(breaker.getStats().lastFailureTime).toBe(openedAt);

        clock.advance(500);
        expect(breaker.isAllowed()).toBe(true);
        expect(breaker.getState()).toBe(STATE_HALF_OPEN);
      } finally {
        clock.restore();
      }
    });
  });

  describe('ConditionEvaluator', () => {
    it('fails safe for unknown conditions', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const evaluator = new ConditionEvaluator(createProfile());

      try {
        expect(evaluator.evaluate('has_databse')).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith('[ConditionEvaluator] Unknown condition: has_databse');
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('keeps known runtime workflow conditions overridable', () => {
      const evaluator = new ConditionEvaluator(createProfile());

      expect(evaluator.evaluate('user_wants_ai_generation')).toBe(true);

      evaluator.setRuntimeCondition('user_wants_ai_generation', false);
      expect(evaluator.evaluate('user_wants_ai_generation')).toBe(false);

      evaluator.setRuntimeConditions({
        stories_remaining: false,
        epic_complete: true,
      });
      expect(evaluator.evaluate('stories_remaining')).toBe(false);
      expect(evaluator.evaluate('epic_complete')).toBe(true);
    });
  });

  describe('GotchasMemory', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gotchas-regression-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('counts repeated errors only inside errorWindowMs', () => {
      const clock = withMockedNow(10_000);
      const memory = new GotchasMemory(tmpDir, {
        repeatThreshold: 2,
        errorWindowMs: 100,
        quiet: true,
      });
      const error = { message: 'Database migration failed repeatedly', file: 'migrate.js' };

      try {
        expect(memory.trackError(error)).toBeNull();

        clock.advance(150);
        expect(memory.trackError(error)).toBeNull();
        expect([...memory.errorTracking.values()][0].count).toBe(1);

        clock.advance(50);
        const captured = memory.trackError(error);

        expect(captured).not.toBeNull();
        expect(captured.source.occurrences).toBe(2);
      } finally {
        clock.restore();
      }
    });

    it('sorts critical gotchas before warnings and info', () => {
      const memory = new GotchasMemory(tmpDir, { quiet: true });
      const lastSeen = '2026-01-01T00:00:00.000Z';

      memory.addGotcha({
        title: 'Info',
        description: 'Info issue',
        severity: 'info',
        lastSeen,
      });
      memory.addGotcha({
        title: 'Critical',
        description: 'Critical issue',
        severity: 'critical',
        lastSeen,
      });
      memory.addGotcha({
        title: 'Warning',
        description: 'Warning issue',
        severity: 'warning',
        lastSeen,
      });

      expect(memory.listGotchas().map((gotcha) => gotcha.severity)).toEqual([
        'critical',
        'warning',
        'info',
      ]);
    });
  });

  describe('IdeationEngine', () => {
    it('uses listGotchas to filter known suggestions', async () => {
      const gotchasMemory = {
        listGotchas: jest.fn().mockResolvedValue([
          {
            description: 'database migration repeated failure pattern',
          },
        ]),
      };
      const engine = new IdeationEngine({
        areas: ['architecture'],
        gotchasMemory,
      });
      engine.analyzers = {
        architecture: {
          analyze: jest.fn().mockResolvedValue([
            {
              title: 'Database migration repeated failure pattern',
              description: 'Avoid another database migration repeated failure pattern',
              effort: 'low',
              impact: 0.9,
            },
            {
              title: 'Cache project metadata',
              description: 'Cache expensive project metadata lookups',
              effort: 'low',
              impact: 0.8,
            },
          ]),
        },
      };

      const result = await engine.ideate({ focus: ['architecture'] });

      expect(gotchasMemory.listGotchas).toHaveBeenCalledTimes(1);
      expect(result.summary.totalSuggestions).toBe(1);
      expect(result.quickWins[0].title).toBe('Cache project metadata');
    });
  });
});
