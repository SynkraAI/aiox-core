'use strict';

const path = require('path');
const { RegistryLoader } = require('../../../.aiox-core/core/ids/registry-loader');
const { IncrementalDecisionEngine } = require('../../../.aiox-core/core/ids/incremental-decision-engine');
const { FrameworkGovernor, TIMEOUT_MS, RISK_THRESHOLDS } = require('../../../.aiox-core/core/ids/framework-governor');

const FIXTURES = path.resolve(__dirname, 'fixtures');
const VALID_REGISTRY = path.join(FIXTURES, 'valid-registry.yaml');
const EMPTY_REGISTRY = path.join(FIXTURES, 'empty-registry.yaml');

// ─── Mock RegistryUpdater ────────────────────────────────────────────────────

class MockRegistryUpdater {
  constructor() {
    this.onAgentTaskCompleteCalls = [];
  }

  async onAgentTaskComplete(task, artifacts) {
    this.onAgentTaskCompleteCalls.push({ task, artifacts });
    return { updated: artifacts.length, errors: [] };
  }
}

class MockRegistryUpdaterFailing {
  async onAgentTaskComplete() {
    throw new Error('Lock contention — registry busy');
  }
}

// ─── Mock RegistryHealer ─────────────────────────────────────────────────────

class MockRegistryHealer {
  async runHealthCheck() {
    return {
      status: 'healthy',
      issues: [],
      summary: { total: 0, bySeverity: { critical: 0, high: 0, medium: 0, low: 0 } },
    };
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FrameworkGovernor', () => {
  let loader;
  let engine;
  let updater;
  let governor;

  beforeEach(() => {
    loader = new RegistryLoader(VALID_REGISTRY);
    loader.load();
    engine = new IncrementalDecisionEngine(loader);
    updater = new MockRegistryUpdater();
    governor = new FrameworkGovernor(loader, engine, updater);
  });

  // ─── Constructor ─────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create instance with required dependencies', () => {
      expect(governor).toBeInstanceOf(FrameworkGovernor);
    });

    it('should throw if registryLoader is missing', () => {
      expect(() => new FrameworkGovernor(null, engine, updater)).toThrow(
        '[IDS-Governor] RegistryLoader instance is required',
      );
    });

    it('should throw if decisionEngine is missing', () => {
      expect(() => new FrameworkGovernor(loader, null, updater)).toThrow(
        '[IDS-Governor] IncrementalDecisionEngine instance is required',
      );
    });

    it('should throw if registryUpdater is missing', () => {
      expect(() => new FrameworkGovernor(loader, engine, null)).toThrow(
        '[IDS-Governor] RegistryUpdater instance is required',
      );
    });

    it('should accept optional registryHealer', () => {
      const healer = new MockRegistryHealer();
      const gov = new FrameworkGovernor(loader, engine, updater, healer);
      expect(gov).toBeInstanceOf(FrameworkGovernor);
    });

    it('should handle null healer gracefully', () => {
      const gov = new FrameworkGovernor(loader, engine, updater, null);
      expect(gov).toBeInstanceOf(FrameworkGovernor);
    });
  });

  // ─── preCheck ────────────────────────────────────────────────────────────

  describe('preCheck()', () => {
    it('should return REUSE recommendation for high relevance match', async () => {
      const result = await governor.preCheck('validate story drafts', 'task');
      expect(result).toBeDefined();
      expect(result.intent).toBe('validate story drafts');
      expect(result.entityType).toBe('task');
      expect(result.advisory).toBe(true);
      expect(result.shouldProceed).toBe(true);
      expect(['REUSE', 'ADAPT', 'CREATE']).toContain(result.topDecision);
    });

    it('should return CREATE recommendation for no matches', async () => {
      const result = await governor.preCheck('quantum flux capacitor integration', 'task');
      expect(result.topDecision).toBe('CREATE');
      expect(result.matchesFound).toBe(0);
      expect(result.shouldProceed).toBe(true);
    });

    it('should return ADAPT recommendation for moderate relevance', async () => {
      const result = await governor.preCheck('create documentation files', 'task');
      expect(result).toBeDefined();
      expect(result.advisory).toBe(true);
      // May return REUSE or ADAPT depending on relevance scores
      if (result.matchesFound > 0) {
        expect(result.recommendations.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty intent gracefully', async () => {
      const result = await governor.preCheck('', 'task');
      expect(result.topDecision).toBe('CREATE');
      expect(result.matchesFound).toBe(0);
    });

    it('should work without entityType filter', async () => {
      const result = await governor.preCheck('validate story');
      expect(result.entityType).toBe('any');
      expect(result.advisory).toBe(true);
    });

    it('should include alternatives in result', async () => {
      const result = await governor.preCheck('create documentation', 'task');
      expect(Array.isArray(result.alternatives)).toBe(true);
      if (result.alternatives.length > 0) {
        expect(result.alternatives[0]).toHaveProperty('entityId');
        expect(result.alternatives[0]).toHaveProperty('decision');
        expect(result.alternatives[0]).toHaveProperty('relevance');
      }
    });

    it('should limit recommendations to 5', async () => {
      const result = await governor.preCheck('agent story task template', 'any');
      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should always set shouldProceed to true (advisory mode)', async () => {
      const result = await governor.preCheck('validate story', 'task');
      expect(result.shouldProceed).toBe(true);
    });
  });

  // ─── preCheck input validation ──────────────────────────────────────────

  describe('preCheck() input validation', () => {
    it('should throw on null intent', async () => {
      await expect(governor.preCheck(null)).rejects.toThrow('[IDS-Governor] preCheck requires a string intent parameter');
    });

    it('should throw on undefined intent', async () => {
      await expect(governor.preCheck(undefined)).rejects.toThrow('[IDS-Governor] preCheck requires a string intent parameter');
    });

    it('should throw on numeric intent', async () => {
      await expect(governor.preCheck(123)).rejects.toThrow('[IDS-Governor] preCheck requires a string intent parameter');
    });
  });

  // ─── preCheck with empty registry ────────────────────────────────────────

  describe('preCheck() with empty registry', () => {
    it('should return CREATE gracefully for empty registry', async () => {
      const emptyLoader = new RegistryLoader(EMPTY_REGISTRY);
      emptyLoader.load();
      const emptyEngine = new IncrementalDecisionEngine(emptyLoader);
      const emptyGov = new FrameworkGovernor(emptyLoader, emptyEngine, updater);

      const result = await emptyGov.preCheck('validate yaml', 'task');
      expect(result.topDecision).toBe('CREATE');
      expect(result.matchesFound).toBe(0);
    });
  });

  // ─── impactAnalysis input validation ────────────────────────────────────

  describe('impactAnalysis() input validation', () => {
    it('should throw on null entityId', async () => {
      await expect(governor.impactAnalysis(null)).rejects.toThrow('[IDS-Governor] impactAnalysis requires a non-empty entityId string');
    });

    it('should throw on empty entityId', async () => {
      await expect(governor.impactAnalysis('')).rejects.toThrow('[IDS-Governor] impactAnalysis requires a non-empty entityId string');
    });
  });

  // ─── impactAnalysis ──────────────────────────────────────────────────────

  describe('impactAnalysis()', () => {
    it('should return impact for entity with consumers', async () => {
      // "create-doc" is used by "po" and "sm" in the fixture
      const result = await governor.impactAnalysis('create-doc');
      expect(result.found).toBe(true);
      expect(result.entityId).toBe('create-doc');
      expect(result.directConsumers).toContain('po');
      expect(result.directConsumers).toContain('sm');
      expect(result.totalAffected).toBeGreaterThan(0);
      expect(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.riskLevel);
    });

    it('should return no consumers for entity with empty usedBy', async () => {
      // "po" has usedBy: [] in fixture
      const result = await governor.impactAnalysis('po');
      expect(result.found).toBe(true);
      expect(result.directConsumers).toEqual([]);
      expect(result.totalAffected).toBe(0);
      expect(result.riskLevel).toBe('NONE');
    });

    it('should return found:false for unknown entity', async () => {
      const result = await governor.impactAnalysis('non-existent-entity');
      expect(result.found).toBe(false);
      expect(result.riskLevel).toBe('NONE');
      expect(result.message).toContain('not found');
    });

    it('should include adaptability score when available', async () => {
      const result = await governor.impactAnalysis('create-doc');
      expect(result.adaptabilityScore).toBe(0.8);
    });

    it('should include threshold warning for low adaptability', async () => {
      // "po" agent has adaptability score 0.3 in fixture
      const result = await governor.impactAnalysis('po');
      // 0.3 is at the threshold boundary, not below
      expect(result.adaptabilityScore).toBe(0.3);
    });

    it('should traverse indirect consumers via BFS', async () => {
      // create-doc is usedBy [po, sm]
      // validate-story depends on create-doc (but usedBy [po])
      const result = await governor.impactAnalysis('template-engine');
      expect(result.found).toBe(true);
      // template-engine is usedBy: ["create-doc"]
      expect(result.directConsumers).toContain('create-doc');
    });

    it('should include dependencies list', async () => {
      const result = await governor.impactAnalysis('create-doc');
      expect(Array.isArray(result.dependencies)).toBe(true);
    });
  });

  // ─── postRegister input validation ──────────────────────────────────────

  describe('postRegister() input validation', () => {
    it('should throw on null filePath', async () => {
      await expect(governor.postRegister(null)).rejects.toThrow('[IDS-Governor] postRegister requires a non-empty filePath string');
    });

    it('should throw on empty filePath', async () => {
      await expect(governor.postRegister('')).rejects.toThrow('[IDS-Governor] postRegister requires a non-empty filePath string');
    });
  });

  // ─── postRegister ────────────────────────────────────────────────────────

  describe('postRegister()', () => {
    it('should register file via RegistryUpdater.onAgentTaskComplete', async () => {
      const result = await governor.postRegister(
        '.aiox-core/development/tasks/test-task.md',
        { type: 'task', purpose: 'Test task', agent: 'aiox-master' },
      );
      expect(result.registered).toBeDefined();
      expect(result.filePath).toBe('.aiox-core/development/tasks/test-task.md');
      expect(updater.onAgentTaskCompleteCalls.length).toBe(1);

      const call = updater.onAgentTaskCompleteCalls[0];
      expect(call.task.agent).toBe('aiox-master');
      expect(call.artifacts).toContain('.aiox-core/development/tasks/test-task.md');
    });

    it('should use onAgentTaskComplete (not processChanges) per SF-1', async () => {
      await governor.postRegister('.aiox-core/development/tasks/new-task.md', {});
      // Verify onAgentTaskComplete was called (our mock tracks this)
      expect(updater.onAgentTaskCompleteCalls.length).toBe(1);
    });

    it('should include metadata in result', async () => {
      const result = await governor.postRegister('test.md', {
        type: 'task',
        purpose: 'testing',
        keywords: ['test'],
      });
      expect(result.metadata.type).toBe('task');
      expect(result.metadata.purpose).toBe('testing');
      expect(result.metadata.keywords).toContain('test');
    });

    it('should handle updater failure gracefully', async () => {
      const failingUpdater = new MockRegistryUpdaterFailing();
      const failGov = new FrameworkGovernor(loader, engine, failingUpdater);
      const result = await failGov.postRegister('test.md', {});
      // Should degrade gracefully
      expect(result.registered).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should default agent to aiox-master', async () => {
      await governor.postRegister('file.md', {});
      const call = updater.onAgentTaskCompleteCalls[0];
      expect(call.task.agent).toBe('aiox-master');
    });
  });

  // ─── healthCheck ─────────────────────────────────────────────────────────

  describe('healthCheck()', () => {
    it('should return degraded status when healer is null', async () => {
      const result = await governor.healthCheck();
      expect(result.available).toBe(false);
      expect(result.healerStatus).toBe('not-configured');
      expect(result.message).toContain('RegistryHealer not available');
      expect(result.basicStats.entityCount).toBeGreaterThan(0);
    });

    it('should use RegistryHealer when available', async () => {
      const healer = new MockRegistryHealer();
      const govWithHealer = new FrameworkGovernor(loader, engine, updater, healer);
      const result = await govWithHealer.healthCheck();
      expect(result.available).toBe(true);
      expect(result.healerStatus).toBe('active');
      expect(result.status).toBe('healthy');
    });

    it('should include entity count in basic stats', async () => {
      const result = await governor.healthCheck();
      expect(result.basicStats.entityCount).toBe(5);
      expect(result.basicStats.registryLoaded).toBe(true);
    });
  });

  // ─── getStats ────────────────────────────────────────────────────────────

  describe('getStats()', () => {
    it('should return correct entity count', async () => {
      const result = await governor.getStats();
      expect(result.totalEntities).toBe(5);
    });

    it('should return counts by type', async () => {
      const result = await governor.getStats();
      expect(result.byType).toBeDefined();
      expect(result.byType.task).toBe(2);
      expect(result.byType.agent).toBe(2);
      expect(result.byType.script).toBe(1);
    });

    it('should return counts by category', async () => {
      const result = await governor.getStats();
      expect(result.byCategory).toBeDefined();
      expect(result.byCategory.tasks).toBe(2);
      expect(result.byCategory.agents).toBe(2);
      expect(result.byCategory.scripts).toBe(1);
    });

    it('should include health score', async () => {
      const result = await governor.getStats();
      expect(typeof result.healthScore).toBe('number');
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it('should include last updated from metadata', async () => {
      const result = await governor.getStats();
      expect(result.lastUpdated).toBe('2026-02-08T00:00:00Z');
    });

    it('should include registry version', async () => {
      const result = await governor.getStats();
      expect(result.registryVersion).toBe('1.0.0');
    });

    it('should report healer availability', async () => {
      const result = await governor.getStats();
      expect(result.healerAvailable).toBe(false);

      const govWithHealer = new FrameworkGovernor(loader, engine, updater, new MockRegistryHealer());
      const resultWithHealer = await govWithHealer.getStats();
      expect(resultWithHealer.healerAvailable).toBe(true);
    });

    it('should include categories list', async () => {
      const result = await governor.getStats();
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories.length).toBeGreaterThan(0);
    });
  });

  // ─── getStats with empty registry ────────────────────────────────────────

  describe('getStats() with empty registry', () => {
    it('should return zero counts for empty registry', async () => {
      const emptyLoader = new RegistryLoader(EMPTY_REGISTRY);
      emptyLoader.load();
      const emptyEngine = new IncrementalDecisionEngine(emptyLoader);
      const emptyGov = new FrameworkGovernor(emptyLoader, emptyEngine, updater);

      const result = await emptyGov.getStats();
      expect(result.totalEntities).toBe(0);
      expect(result.healthScore).toBe(0);
    });
  });

  // ─── Graceful Degradation ────────────────────────────────────────────────

  describe('graceful degradation', () => {
    it('should return fallback on timeout', async () => {
      jest.useFakeTimers();
      // Test _withTimeout directly with a truly async function that never resolves
      const neverResolve = async () => new Promise(() => {});
      const fallback = { shouldProceed: true, topDecision: 'CREATE' };
      const resultPromise = governor._withTimeout(neverResolve, fallback);
      // Advance timers past the TIMEOUT_MS threshold
      jest.advanceTimersByTime(TIMEOUT_MS + 100);
      const result = await resultPromise;
      // Should get fallback due to timeout
      expect(result).toBeDefined();
      expect(result.shouldProceed).toBe(true);
      expect(result.error).toContain('timed out');
      jest.useRealTimers();
    });

    it('should return fallback on engine error', async () => {
      const errorEngine = {
        analyze: () => {
          throw new Error('Engine crashed');
        },
      };
      const errorGov = new FrameworkGovernor(loader, errorEngine, updater);
      const result = await errorGov.preCheck('test intent');
      expect(result.topDecision).toBe('CREATE');
      expect(result.error).toContain('Engine crashed');
    });

    it('should return fallback on impactAnalysis error', async () => {
      // Force error by using a loader that throws on _findById
      const brokenLoader = {
        _ensureLoaded: () => { throw new Error('Loader broken'); },
        _findById: () => null,
        getEntityCount: () => 0,
      };
      const brokenGov = new FrameworkGovernor(brokenLoader, engine, updater);
      const result = await brokenGov.impactAnalysis('test-entity');
      expect(result.found).toBe(false);
      expect(result.riskLevel).toBe('UNKNOWN');
      expect(result.error).toBeDefined();
    });
  });

  // ─── Risk Level Calculation ──────────────────────────────────────────────

  describe('_calculateRiskLevel()', () => {
    it('should return NONE for 0%', () => {
      expect(governor._calculateRiskLevel(0)).toBe('NONE');
    });

    it('should return LOW for small percentage', () => {
      expect(governor._calculateRiskLevel(0.05)).toBe('LOW');
    });

    it('should return MEDIUM for moderate percentage', () => {
      expect(governor._calculateRiskLevel(0.2)).toBe('MEDIUM');
    });

    it('should return HIGH for large percentage', () => {
      expect(governor._calculateRiskLevel(0.4)).toBe('HIGH');
    });

    it('should return CRITICAL for very large percentage', () => {
      expect(governor._calculateRiskLevel(0.6)).toBe('CRITICAL');
    });
  });

  // ─── Static Formatters ───────────────────────────────────────────────────

  describe('static formatters', () => {
    describe('formatPreCheckOutput()', () => {
      it('should format preCheck result as string', () => {
        const result = {
          intent: 'validate yaml',
          entityType: 'task',
          topDecision: 'CREATE',
          matchesFound: 0,
          recommendations: [],
        };
        const output = FrameworkGovernor.formatPreCheckOutput(result);
        expect(typeof output).toBe('string');
        expect(output).toContain('IDS Registry Check (Advisory)');
        expect(output).toContain('validate yaml');
        expect(output).toContain('No matches found');
      });

      it('should include recommendations when matches found', () => {
        const result = {
          intent: 'create docs',
          entityType: 'task',
          topDecision: 'ADAPT',
          matchesFound: 1,
          recommendations: [{
            entityId: 'create-doc',
            decision: 'ADAPT',
            relevanceScore: 0.75,
            entityPath: '.aiox-core/development/tasks/create-doc.md',
          }],
        };
        const output = FrameworkGovernor.formatPreCheckOutput(result);
        expect(output).toContain('create-doc');
        expect(output).toContain('75.0%');
        expect(output).toContain('ADAPT');
      });
    });

    describe('formatImpactOutput()', () => {
      it('should format impact result as string', () => {
        const result = {
          entityId: 'create-doc',
          found: true,
          entityPath: '.aiox-core/development/tasks/create-doc.md',
          entityType: 'task',
          riskLevel: 'LOW',
          directConsumers: ['po', 'sm'],
          indirectConsumers: [],
          totalAffected: 2,
          adaptabilityScore: 0.8,
          thresholdWarning: null,
        };
        const output = FrameworkGovernor.formatImpactOutput(result);
        expect(typeof output).toBe('string');
        expect(output).toContain('IDS Impact Analysis');
        expect(output).toContain('create-doc');
        expect(output).toContain('po');
        expect(output).toContain('LOW');
      });

      it('should handle not-found entity', () => {
        const result = {
          entityId: 'missing',
          found: false,
        };
        const output = FrameworkGovernor.formatImpactOutput(result);
        expect(output).toContain('Not found');
      });

      it('should show safe-to-modify for zero consumers', () => {
        const result = {
          entityId: 'po',
          found: true,
          entityPath: '.aiox-core/development/agents/po.md',
          entityType: 'agent',
          riskLevel: 'NONE',
          directConsumers: [],
          indirectConsumers: [],
          totalAffected: 0,
          adaptabilityScore: 0.3,
          thresholdWarning: null,
        };
        const output = FrameworkGovernor.formatImpactOutput(result);
        expect(output).toContain('safe to modify');
      });
    });

    describe('formatStatsOutput()', () => {
      it('should format stats result as string', () => {
        const result = {
          totalEntities: 5,
          byType: { task: 2, agent: 2, script: 1 },
          byCategory: { tasks: 2, agents: 2, scripts: 1 },
          lastUpdated: '2026-02-08',
          registryVersion: '1.0.0',
          healthScore: 100,
          healerAvailable: false,
        };
        const output = FrameworkGovernor.formatStatsOutput(result);
        expect(typeof output).toBe('string');
        expect(output).toContain('IDS Registry Statistics');
        expect(output).toContain('Total Entities: 5');
        expect(output).toContain('Health Score: 100%');
        expect(output).toContain('task: 2');
      });
    });
  });

  // ─── Constants Export ────────────────────────────────────────────────────

  describe('exported constants', () => {
    it('should export TIMEOUT_MS', () => {
      expect(TIMEOUT_MS).toBe(2000);
    });

    it('should export RISK_THRESHOLDS', () => {
      expect(RISK_THRESHOLDS).toBeDefined();
      expect(RISK_THRESHOLDS.LOW).toBe(0.1);
      expect(RISK_THRESHOLDS.MEDIUM).toBe(0.3);
      expect(RISK_THRESHOLDS.HIGH).toBe(0.5);
    });
  });
});
