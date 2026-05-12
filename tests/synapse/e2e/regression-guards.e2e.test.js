/**
 * SYNAPSE E2E: Regression Guards
 *
 * Performance assertions that enforce pipeline performance targets.
 * Uses REAL .synapse/ files — runs 50 iterations to get reliable p95.
 *
 * Targets (from EPIC-SYN-INDEX):
 *   Pipeline total p95: <100ms (hard limit)
 *   Individual layer p95: <20ms (hard limit, L0/L7: <10ms)
 *   Startup p95: <10ms (hard limit)
 *   Session I/O p95: <15ms (hard limit)
 *
 * @module tests/synapse/e2e/regression-guards.e2e.test
 */

const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');
const MANIFEST_PATH = path.join(SYNAPSE_PATH, 'manifest');

const synapseExists = fs.existsSync(SYNAPSE_PATH) && fs.existsSync(MANIFEST_PATH);

const { SynapseEngine } = require(
  path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'engine.js'),
);
const { parseManifest } = require(
  path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'domain', 'domain-loader.js'),
);
const { loadSession } = require(
  path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'session', 'session-manager.js'),
);

const ITERATIONS = 50;
const WARMUP = 5;

/**
 * Calculate a percentile from a sorted array.
 */
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

const describeIfSynapse = synapseExists ? describe : describe.skip;

describeIfSynapse('SYNAPSE E2E: Regression Guards', () => {
  let manifest;
  let engine;
  const pipelineDurations = [];
  const startupDurations = [];
  const sessionIODurations = [];
  const layerDurations = {};

  const session = {
    prompt_count: 60,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: { last_bracket: 'MODERATE', last_tokens_used: 0, last_context_percent: 55 },
  };

  beforeAll(async () => {
    manifest = parseManifest(MANIFEST_PATH);

    // Warm-up
    const warmEngine = new SynapseEngine(SYNAPSE_PATH, { manifest, devmode: false });
    for (let i = 0; i < WARMUP; i++) {
      await warmEngine.process('warm up prompt', session);
    }

    // Measure startup multiple times for statistical significance
    for (let s = 0; s < ITERATIONS; s++) {
      const s0 = performance.now();
      const tempEngine = new SynapseEngine(SYNAPSE_PATH, { manifest, devmode: false });
      startupDurations.push(performance.now() - s0);
      if (s === 0) engine = tempEngine; // keep first instance for pipeline tests
    }

    // Measured iterations
    for (let i = 0; i < ITERATIONS; i++) {

      // Session I/O measurement
      const sIO0 = performance.now();
      const sessionsDir = path.join(SYNAPSE_PATH, 'sessions');
      loadSession('perf-guard-session', sessionsDir);
      sessionIODurations.push(performance.now() - sIO0);

      // Pipeline measurement
      const p0 = performance.now();
      const result = await engine.process('Implement the user auth feature', session);
      pipelineDurations.push(performance.now() - p0);

      // Per-layer timings
      if (result && result.metrics && result.metrics.per_layer) {
        for (const [name, info] of Object.entries(result.metrics.per_layer)) {
          if (info.duration != null) {
            if (!layerDurations[name]) layerDurations[name] = [];
            layerDurations[name].push(info.duration);
          }
        }
      }
    }
  }, 30000);

  // -----------------------------------------------------------------------
  // Pipeline p95 hard limit: <100ms
  // -----------------------------------------------------------------------
  test('pipeline p95 < 100ms (hard limit)', () => {
    const sorted = [...pipelineDurations].sort((a, b) => a - b);
    const p95 = percentile(sorted, 95);
    expect(p95).toBeLessThan(100);
  });

  // -----------------------------------------------------------------------
  // Pipeline p95 target: <70ms (informational — warn only)
  // -----------------------------------------------------------------------
  test('pipeline p95 should be within target (<70ms) or warn', () => {
    const sorted = [...pipelineDurations].sort((a, b) => a - b);
    const p95 = percentile(sorted, 95);
    if (p95 >= 70) {
      console.warn(`[WARN] Pipeline p95 (${p95.toFixed(2)}ms) approaching hard limit (target: <70ms)`);
    }
    // Enforce the 70ms target — warn was logged above, hard-fail at target
    expect(p95).toBeLessThan(70);
  });

  // -----------------------------------------------------------------------
  // Individual layer p95: <20ms (hard limit)
  // -----------------------------------------------------------------------
  test('each layer p95 < 20ms (hard limit)', () => {
    for (const [name, durations] of Object.entries(layerDurations)) {
      const sorted = [...durations].sort((a, b) => a - b);
      const p95 = percentile(sorted, 95);
      expect(p95).toBeLessThan(20);
    }
  });

  // -----------------------------------------------------------------------
  // Edge layers (constitution, star-command) p95: <10ms (hard limit)
  // -----------------------------------------------------------------------
  test('edge layers (L0/L7) p95 < 10ms (hard limit)', () => {
    const edgeLayers = ['constitution', 'star-command'];
    for (const name of edgeLayers) {
      if (layerDurations[name]) {
        const sorted = [...layerDurations[name]].sort((a, b) => a - b);
        const p95 = percentile(sorted, 95);
        expect(p95).toBeLessThan(10);
      }
    }
  });

  // -----------------------------------------------------------------------
  // Startup p95: <10ms (hard limit)
  // -----------------------------------------------------------------------
  test('startup p95 < 10ms (hard limit)', () => {
    const sorted = [...startupDurations].sort((a, b) => a - b);
    const p95 = percentile(sorted, 95);
    expect(p95).toBeLessThan(10);
  });

  // -----------------------------------------------------------------------
  // Session I/O p95: <15ms (hard limit)
  // -----------------------------------------------------------------------
  test('session I/O p95 < 15ms (hard limit)', () => {
    const sorted = [...sessionIODurations].sort((a, b) => a - b);
    const p95 = percentile(sorted, 95);
    expect(p95).toBeLessThan(15);
  });

  // -----------------------------------------------------------------------
  // Total E2E test count regression guard
  // -----------------------------------------------------------------------
  test('total synapse E2E test files >= 5 (coverage guard)', () => {
    // Guards against accidental test file removal. The suite has 6 E2E files
    // with 53 tests total. File count is the stable assertion here.
    const e2eDir = path.join(PROJECT_ROOT, 'tests', 'synapse', 'e2e');
    const testFiles = fs.readdirSync(e2eDir).filter(f => f.endsWith('.test.js'));
    expect(testFiles.length).toBeGreaterThanOrEqual(5);
  });

  // -----------------------------------------------------------------------
  // Metrics structure guard
  // -----------------------------------------------------------------------
  test('engine returns valid metrics structure', async () => {
    const result = await engine.process('test metrics guard', session);
    expect(result.metrics).toBeDefined();
    expect(typeof result.metrics.total_ms).toBe('number');
    expect(typeof result.metrics.layers_loaded).toBe('number');
    expect(typeof result.metrics.layers_skipped).toBe('number');
    expect(typeof result.metrics.layers_errored).toBe('number');
    expect(typeof result.metrics.total_rules).toBe('number');
    expect(result.metrics.per_layer).toBeDefined();
  });
});
