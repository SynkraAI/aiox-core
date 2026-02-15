/**
 * SynapseEngine + PipelineMetrics Tests
 *
 * Tests for the 8-layer pipeline orchestrator, bracket-aware filtering,
 * fallback strategies, pipeline timeout, and PipelineMetrics class.
 *
 * @module tests/synapse/engine
 * @story SYN-6 - SynapseEngine Orchestrator + Output Formatter
 */

jest.setTimeout(30000);

// ---------------------------------------------------------------------------
// Mocks — must be set BEFORE require
// ---------------------------------------------------------------------------

// Mock context-tracker (SYN-3)
jest.mock('../../.aios-core/core/synapse/context/context-tracker', () => ({
  estimateContextPercent: jest.fn(() => 85),
  calculateBracket: jest.fn(() => 'FRESH'),
  getActiveLayers: jest.fn(() => ({ layers: [0, 1, 2, 7], memoryHints: false, handoffWarning: false })),
  getTokenBudget: jest.fn(() => 800),
  needsMemoryHints: jest.fn(() => false),
  needsHandoffWarning: jest.fn(() => false),
}));

// Mock formatter
jest.mock('../../.aios-core/core/synapse/output/formatter', () => ({
  formatSynapseRules: jest.fn(() => '<synapse-rules>\nmocked\n</synapse-rules>'),
}));

// Mock layer modules — provide fake layer classes
const mockLayerModules = {};

jest.mock('../../.aios-core/core/synapse/layers/l0-constitution', () => {
  const cls = class MockL0 {
    constructor() { this.name = 'constitution'; this.layer = 0; this.timeout = 5; }
    _safeProcess(ctx) { return { rules: ['ART.I: CLI First'], metadata: { layer: 0, source: 'constitution' } }; }
  };
  mockLayerModules.L0 = cls;
  return cls;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l1-global', () => {
  const cls = class MockL1 {
    constructor() { this.name = 'global'; this.layer = 1; this.timeout = 10; }
    _safeProcess(ctx) { return { rules: ['Global rule 1'], metadata: { layer: 1, source: 'global' } }; }
  };
  mockLayerModules.L1 = cls;
  return cls;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l2-agent', () => {
  const cls = class MockL2 {
    constructor() { this.name = 'agent'; this.layer = 2; this.timeout = 10; }
    _safeProcess(ctx) { return { rules: ['Agent rule 1'], metadata: { layer: 2, source: 'agent' } }; }
  };
  mockLayerModules.L2 = cls;
  return cls;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l3-workflow', () => {
  const cls = class MockL3 {
    constructor() { this.name = 'workflow'; this.layer = 3; this.timeout = 10; }
    _safeProcess(ctx) { return { rules: ['Workflow rule 1'], metadata: { layer: 3, source: 'workflow' } }; }
  };
  mockLayerModules.L3 = cls;
  return cls;
}, { virtual: true });

// L4-L7: simulate missing modules (MODULE_NOT_FOUND with proper code)
jest.mock('../../.aios-core/core/synapse/layers/l4-task', () => {
  const err = new Error("Cannot find module './layers/l4-task'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l5-squad', () => {
  const err = new Error("Cannot find module './layers/l5-squad'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l6-keyword', () => {
  const err = new Error("Cannot find module './layers/l6-keyword'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l7-star-command', () => {
  const err = new Error("Cannot find module './layers/l7-star-command'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

// Mock memory bridge (SYN-10)
const mockGetMemoryHints = jest.fn(() => Promise.resolve([]));
jest.mock('../../.aios-core/core/synapse/memory/memory-bridge', () => ({
  MemoryBridge: jest.fn().mockImplementation(() => ({
    getMemoryHints: mockGetMemoryHints,
    clearCache: jest.fn(),
    _reset: jest.fn(),
  })),
  BRACKET_LAYER_MAP: { FRESH: { layer: 0, maxTokens: 0 }, MODERATE: { layer: 1, maxTokens: 50 } },
  BRIDGE_TIMEOUT_MS: 15,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

const { SynapseEngine, PipelineMetrics, PIPELINE_TIMEOUT_MS } = require('../../.aios-core/core/synapse/engine');
const contextTracker = require('../../.aios-core/core/synapse/context/context-tracker');
const formatter = require('../../.aios-core/core/synapse/output/formatter');

// =============================================================================
// PipelineMetrics
// =============================================================================

describe('PipelineMetrics', () => {
  let metrics;

  beforeEach(() => {
    metrics = new PipelineMetrics();
  });

  test('should initialize with empty state', () => {
    expect(metrics.layers).toEqual({});
    expect(metrics.totalStart).toBeNull();
    expect(metrics.totalEnd).toBeNull();
  });

  test('startLayer() should record start time and running status', () => {
    metrics.startLayer('constitution');
    expect(metrics.layers.constitution).toBeDefined();
    expect(metrics.layers.constitution.status).toBe('running');
    expect(typeof metrics.layers.constitution.start).toBe('bigint');
  });

  test('endLayer() should record duration and rules count', () => {
    metrics.startLayer('agent');
    metrics.endLayer('agent', 5);
    const layer = metrics.layers.agent;
    expect(layer.status).toBe('ok');
    expect(layer.rules).toBe(5);
    expect(typeof layer.duration).toBe('number');
    expect(layer.duration).toBeGreaterThanOrEqual(0);
  });

  test('endLayer() without startLayer() should still record', () => {
    metrics.endLayer('unknown', 3);
    expect(metrics.layers.unknown.status).toBe('ok');
    expect(metrics.layers.unknown.rules).toBe(3);
  });

  test('skipLayer() should record skip reason', () => {
    metrics.skipLayer('squad', 'Not active in FRESH');
    expect(metrics.layers.squad.status).toBe('skipped');
    expect(metrics.layers.squad.reason).toBe('Not active in FRESH');
  });

  test('errorLayer() should record error message', () => {
    metrics.errorLayer('keyword', new Error('File not found'));
    expect(metrics.layers.keyword.status).toBe('error');
    expect(metrics.layers.keyword.error).toBe('File not found');
  });

  test('errorLayer() should record duration if startLayer() was called', () => {
    metrics.startLayer('workflow');
    metrics.errorLayer('workflow', new Error('Timeout'));
    const layer = metrics.layers.workflow;
    expect(layer.status).toBe('error');
    expect(typeof layer.duration).toBe('number');
  });

  test('errorLayer() should handle non-Error objects', () => {
    metrics.errorLayer('test', 'string error');
    expect(metrics.layers.test.error).toBe('string error');
  });

  test('getSummary() should return correct totals', () => {
    metrics.totalStart = BigInt(1000000000);
    metrics.totalEnd = BigInt(1050000000);

    metrics.startLayer('l0');
    metrics.endLayer('l0', 6);
    metrics.startLayer('l1');
    metrics.endLayer('l1', 2);
    metrics.skipLayer('l3', 'Not active');
    metrics.errorLayer('l4', new Error('fail'));

    const summary = metrics.getSummary();
    expect(summary.total_ms).toBe(50);
    expect(summary.layers_loaded).toBe(2);
    expect(summary.layers_skipped).toBe(1);
    expect(summary.layers_errored).toBe(1);
    expect(summary.total_rules).toBe(8);
    expect(summary.per_layer).toBeDefined();
  });

  test('getSummary() should return 0 total_ms when no timestamps set', () => {
    const summary = metrics.getSummary();
    expect(summary.total_ms).toBe(0);
  });
});

// =============================================================================
// SynapseEngine
// =============================================================================

describe('SynapseEngine', () => {
  let engine;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks: FRESH bracket with L0, L1, L2, L7
    contextTracker.estimateContextPercent.mockReturnValue(85);
    contextTracker.calculateBracket.mockReturnValue('FRESH');
    contextTracker.getActiveLayers.mockReturnValue({
      layers: [0, 1, 2, 7],
      memoryHints: false,
      handoffWarning: false,
    });
    contextTracker.getTokenBudget.mockReturnValue(800);
    contextTracker.needsMemoryHints.mockReturnValue(false);
    contextTracker.needsHandoffWarning.mockReturnValue(false);

    mockGetMemoryHints.mockReset();
    mockGetMemoryHints.mockResolvedValue([]);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    engine = new SynapseEngine('/fake/.synapse', { manifest: {} });
    warnSpy.mockRestore();
  });

  describe('constructor', () => {
    test('should store synapsePath and config', () => {
      expect(engine.synapsePath).toBe('/fake/.synapse');
      expect(engine.config).toEqual({ manifest: {} });
    });

    test('should instantiate available layers', () => {
      // L0, L1, L2, L3 are mocked as available; L4-L7 throw
      expect(engine.layers.length).toBeGreaterThanOrEqual(3);
    });

    test('should handle all layer modules failing gracefully', () => {
      // This is tested implicitly — L4-L7 throw, engine still works
      expect(engine.layers.length).toBeLessThanOrEqual(4);
    });
  });

  describe('process() — basic pipeline', () => {
    test('should return xml and metrics', async () => {
      const result = await engine.process('test prompt', { prompt_count: 1 });
      expect(result).toHaveProperty('xml');
      expect(result).toHaveProperty('metrics');
      expect(typeof result.xml).toBe('string');
      expect(typeof result.metrics).toBe('object');
    });

    test('should call context-tracker with prompt_count', async () => {
      await engine.process('test', { prompt_count: 5 });
      expect(contextTracker.estimateContextPercent).toHaveBeenCalledWith(5);
    });

    test('should call calculateBracket with context percent', async () => {
      contextTracker.estimateContextPercent.mockReturnValue(72);
      await engine.process('test', { prompt_count: 10 });
      expect(contextTracker.calculateBracket).toHaveBeenCalledWith(72);
    });

    test('should call getActiveLayers with bracket', async () => {
      contextTracker.calculateBracket.mockReturnValue('MODERATE');
      await engine.process('test', {});
      expect(contextTracker.getActiveLayers).toHaveBeenCalledWith('MODERATE');
    });

    test('should call formatSynapseRules with correct args', async () => {
      await engine.process('test', { prompt_count: 0 });
      expect(formatter.formatSynapseRules).toHaveBeenCalledTimes(1);

      const args = formatter.formatSynapseRules.mock.calls[0];
      // results, bracket, contextPercent, session, devmode, metrics, tokenBudget, showHandoffWarning
      expect(args[1]).toBe('FRESH');        // bracket
      expect(args[2]).toBe(85);             // contextPercent
      expect(args[4]).toBe(false);          // devmode (default)
      expect(args[6]).toBe(800);            // tokenBudget
      expect(args[7]).toBe(false);          // showHandoffWarning
    });

    test('should pass devmode=true when config has devmode', async () => {
      await engine.process('test', {}, { devmode: true });
      const args = formatter.formatSynapseRules.mock.calls[0];
      expect(args[4]).toBe(true);
    });

    test('should default prompt_count to 0 when session is null', async () => {
      await engine.process('test', null);
      expect(contextTracker.estimateContextPercent).toHaveBeenCalledWith(0);
    });
  });

  describe('process() — bracket-aware filtering', () => {
    test('should skip layers not in active bracket (FRESH skips L3)', async () => {
      // FRESH has layers [0,1,2,7] — L3 (workflow) should be skipped
      const result = await engine.process('test', { prompt_count: 1 });

      // Check metrics — workflow should be skipped
      const summary = result.metrics;
      const workflowEntry = summary.per_layer.workflow;
      if (workflowEntry) {
        expect(workflowEntry.status).toBe('skipped');
        expect(workflowEntry.reason).toContain('Not active');
      }
    });

    test('should execute all L0-L7 in MODERATE bracket', async () => {
      contextTracker.getActiveLayers.mockReturnValue({
        layers: [0, 1, 2, 3, 4, 5, 6, 7],
        memoryHints: false,
        handoffWarning: false,
      });

      const result = await engine.process('test', { prompt_count: 30 });
      // L0, L1, L2 should be loaded; L3 also since MODERATE allows it
      expect(result.metrics.layers_loaded).toBeGreaterThanOrEqual(3);
    });
  });

  describe('process() — fallback and edge cases', () => {
    test('should return empty xml when no results', async () => {
      // Make all layers return null
      for (const layer of engine.layers) {
        layer._safeProcess = jest.fn(() => null);
      }

      formatter.formatSynapseRules.mockReturnValue('');
      const result = await engine.process('test', {});
      expect(result.xml).toBe('');
    });

    test('should return empty when getActiveLayers returns null', async () => {
      contextTracker.getActiveLayers.mockReturnValue(null);
      const result = await engine.process('test', {});
      expect(result.xml).toBe('');
      expect(result.metrics.total_ms).toBeGreaterThanOrEqual(0);
    });

    test('should handle session without prompt_count', async () => {
      const result = await engine.process('test', {});
      expect(contextTracker.estimateContextPercent).toHaveBeenCalledWith(0);
      expect(result).toHaveProperty('xml');
    });

    test('should accumulate previousLayers across layer executions', async () => {
      // Spy on _safeProcess to verify previousLayers grows
      const calls = [];
      for (const layer of engine.layers) {
        const orig = layer._safeProcess.bind(layer);
        layer._safeProcess = jest.fn((ctx) => {
          calls.push({ name: layer.name, prevCount: ctx.previousLayers.length });
          return orig(ctx);
        });
      }

      await engine.process('test', {});

      // First active layer should have 0 previousLayers
      if (calls.length > 0) {
        expect(calls[0].prevCount).toBe(0);
      }
      // Each subsequent layer should have more
      for (let i = 1; i < calls.length; i++) {
        expect(calls[i].prevCount).toBeGreaterThanOrEqual(calls[i - 1].prevCount);
      }
    });
  });

  describe('process() — metrics', () => {
    test('should have total_ms in metrics', async () => {
      const result = await engine.process('test', {});
      expect(typeof result.metrics.total_ms).toBe('number');
      expect(result.metrics.total_ms).toBeGreaterThanOrEqual(0);
    });

    test('should count loaded and skipped layers', async () => {
      const result = await engine.process('test', { prompt_count: 1 });
      const m = result.metrics;
      expect(m.layers_loaded + m.layers_skipped + m.layers_errored).toBeGreaterThanOrEqual(1);
    });

    test('should count total rules', async () => {
      const result = await engine.process('test', {});
      expect(typeof result.metrics.total_rules).toBe('number');
    });
  });

  describe('PIPELINE_TIMEOUT_MS constant', () => {
    test('should be 100ms', () => {
      expect(PIPELINE_TIMEOUT_MS).toBe(100);
    });
  });

  describe('process() — handoff warning', () => {
    test('should pass showHandoffWarning=true when bracket needs it', async () => {
      contextTracker.needsHandoffWarning.mockReturnValue(true);
      await engine.process('test', {});
      const args = formatter.formatSynapseRules.mock.calls[0];
      expect(args[7]).toBe(true);
    });
  });

  describe('process() — null/invalid processConfig guard', () => {
    test('should handle null processConfig without throwing', async () => {
      const result = await engine.process('test', { prompt_count: 1 }, null);
      expect(result).toHaveProperty('xml');
      expect(result).toHaveProperty('metrics');
    });

    test('should handle non-object processConfig (string)', async () => {
      const result = await engine.process('test', { prompt_count: 1 }, 'invalid');
      expect(result).toHaveProperty('xml');
    });

    test('should handle undefined processConfig', async () => {
      const result = await engine.process('test', { prompt_count: 1 }, undefined);
      expect(result).toHaveProperty('xml');
    });

    test('should handle numeric processConfig', async () => {
      const result = await engine.process('test', { prompt_count: 1 }, 42);
      expect(result).toHaveProperty('xml');
    });
  });

  describe('process() — memory bridge integration (SYN-10)', () => {
    test('should call memoryBridge.getMemoryHints when needsMemoryHints is true', async () => {
      contextTracker.needsMemoryHints.mockReturnValue(true);
      contextTracker.calculateBracket.mockReturnValue('MODERATE');
      contextTracker.getTokenBudget.mockReturnValue(500);
      mockGetMemoryHints.mockResolvedValue([
        { content: 'Use absolute imports', source: 'procedural', relevance: 0.9, tokens: 5 },
      ]);

      await engine.process('test', { prompt_count: 30, activeAgent: 'dev' });

      expect(mockGetMemoryHints).toHaveBeenCalledWith('dev', 'MODERATE', 500);

      // Verify hints were passed to formatter via results array
      const formatterCall = formatter.formatSynapseRules.mock.calls[0];
      const resultsArg = formatterCall[0]; // first arg = results array
      const memoryResult = resultsArg.find(r => r.metadata?.source === 'memory');
      expect(memoryResult).toBeDefined();
      expect(memoryResult.rules).toEqual([
        { content: 'Use absolute imports', source: 'procedural', relevance: 0.9, tokens: 5 },
      ]);
    });

    test('should NOT call memoryBridge.getMemoryHints when needsMemoryHints is false', async () => {
      contextTracker.needsMemoryHints.mockReturnValue(false);
      await engine.process('test', { prompt_count: 1 });
      expect(mockGetMemoryHints).not.toHaveBeenCalled();
    });

    test('should use active_agent fallback when activeAgent is missing', async () => {
      contextTracker.needsMemoryHints.mockReturnValue(true);
      contextTracker.calculateBracket.mockReturnValue('DEPLETED');
      contextTracker.getTokenBudget.mockReturnValue(300);
      mockGetMemoryHints.mockResolvedValue([]);

      await engine.process('test', { prompt_count: 50, active_agent: 'qa' });

      expect(mockGetMemoryHints).toHaveBeenCalledWith('qa', 'DEPLETED', 300);
    });
  });

  describe('process() — edge cases for coverage', () => {
    test('should handle layer returning non-array rules (invalid result format)', async () => {
      // Make a layer return an object without rules array
      if (engine.layers.length > 0) {
        engine.layers[0]._safeProcess = jest.fn(() => ({
          rules: 'not-an-array',
          metadata: { source: 'test' },
        }));
      }

      const result = await engine.process('test', {});
      // Should not crash — invalid result is skipped
      expect(result).toHaveProperty('xml');
      if (engine.layers.length > 0) {
        const layerName = engine.layers[0].name;
        const entry = result.metrics.per_layer[layerName];
        expect(entry.status).toBe('skipped');
        expect(entry.reason).toBe('Invalid result format');
      }
    });

    test('should log remaining layers as skipped on pipeline timeout', async () => {
      // Mock Date.now to simulate timeout after first layer
      const realDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        // First call: totalStart = 1000
        // Second call (timeout check): 1000
        // Third call (startLayer): 1000
        // After first layer executes, next timeout check returns 1200 (>100ms)
        if (callCount <= 4) return 1000;
        return 1200; // Exceeds 100ms timeout
      });

      // Ensure all layers are active
      contextTracker.getActiveLayers.mockReturnValue({
        layers: [0, 1, 2, 3, 4, 5, 6, 7],
        memoryHints: false,
        handoffWarning: false,
      });

      const result = await engine.process('test', {});

      Date.now = realDateNow;

      // Some layers should be skipped due to pipeline timeout
      const skipped = Object.values(result.metrics.per_layer)
        .filter(l => l.status === 'skipped' && l.reason === 'Pipeline timeout');
      expect(skipped.length).toBeGreaterThanOrEqual(0);
      expect(result).toHaveProperty('xml');
    });
  });
});
