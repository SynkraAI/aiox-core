/**
 * QA Issues Validation — Tests that reproduce the 7 issues identified
 * in the SYNAPSE Diagnostics QA Report (2026-02-14).
 *
 * Each describe block maps to one issue. The test SHOULD FAIL with current
 * code to confirm the problem, then PASS after the fix.
 *
 * @created 2026-02-14 by Quinn (@qa)
 */

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

// Collectors under test
const { collectQualityMetrics, BRACKET_ACTIVE_LAYERS, MAX_STALENESS_MS } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/quality-collector',
);
const { collectConsistencyMetrics, MAX_TIMESTAMP_GAP_MS } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/consistency-collector',
);
const { collectOutputAnalysis, UAP_OUTPUT_EXPECTATIONS } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/output-analyzer',
);
const { collectRelevanceMatrix, IMPORTANCE } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/relevance-matrix',
);
const { getActiveLayers } = require(
  '../../../.aios-core/core/synapse/context/context-tracker',
);

// Helpers
function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-qa-'));
  const synapsePath = path.join(dir, '.synapse');
  const metricsDir = path.join(synapsePath, 'metrics');
  const sessionsDir = path.join(synapsePath, 'sessions');
  fs.mkdirSync(metricsDir, { recursive: true });
  fs.mkdirSync(sessionsDir, { recursive: true });
  return { dir, metricsDir, sessionsDir };
}

function writeMetrics(metricsDir, filename, data) {
  fs.writeFileSync(path.join(metricsDir, filename), JSON.stringify(data, null, 2), 'utf8');
}

function cleanupDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Issue #1: Quality Score Artificially Low by Staleness Penalty
// ─────────────────────────────────────────────────────────────────────────────
describe('Issue #1: Staleness should degrade, not zero out UAP score', () => {
  let project;

  beforeEach(() => { project = createTempProject(); });
  afterEach(() => { cleanupDir(project.dir); });

  test('UAP metrics 6 minutes old (just past MAX_STALENESS) should NOT zero score', () => {
    const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();

    writeMetrics(project.metricsDir, 'uap-metrics.json', {
      agentId: 'dev',
      quality: 'full',
      totalDuration: 145,
      timestamp: sixMinAgo,
      loaders: {
        agentConfig: { status: 'ok', duration: 45 },
        permissionMode: { status: 'ok', duration: 12 },
        gitConfig: { status: 'ok', duration: 8 },
        sessionContext: { status: 'ok', duration: 23 },
        projectStatus: { status: 'ok', duration: 34 },
        memories: { status: 'skipped', duration: 0 },
        synapseSession: { status: 'ok', duration: 2 },
      },
    });

    writeMetrics(project.metricsDir, 'hook-metrics.json', {
      totalDuration: 0.88,
      bracket: 'FRESH',
      layersLoaded: 3,
      layersSkipped: 5,
      totalRules: 70,
      timestamp: new Date().toISOString(),
      perLayer: {
        constitution: { status: 'ok', duration: 0.3, rules: 34 },
        global: { status: 'ok', duration: 0.2, rules: 25 },
        agent: { status: 'ok', duration: 0.38, rules: 11 },
      },
    });

    const result = collectQualityMetrics(project.dir);

    // BUG: Currently UAP score is zeroed when stale, making overall = 42
    // EXPECTED: UAP should still score, possibly with degradation penalty
    // A perfect UAP (6/7 loaders ok) should NOT produce overall grade F
    expect(result.overall.grade).not.toBe('F');
    expect(result.uap.score).toBeGreaterThan(0);
  });

  test('MAX_STALENESS_MS should be 30 minutes (covers typical session length)', () => {
    // UAP writes metrics once at agent activation.
    // 30 min threshold covers normal session length.
    // Additionally, stale data is degraded (50%) instead of zeroed.
    expect(MAX_STALENESS_MS).toBe(30 * 60 * 1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #2: Timestamp Gap Threshold Too Restrictive
// ─────────────────────────────────────────────────────────────────────────────
describe('Issue #2: Timestamp gap between UAP and Hook should allow > 30s', () => {
  let project;

  beforeEach(() => { project = createTempProject(); });
  afterEach(() => { cleanupDir(project.dir); });

  test('MAX_TIMESTAMP_GAP_MS should be 10 minutes (covers independent pipeline lifecycle)', () => {
    // UAP: written once at activation
    // Hook: written every prompt
    // 10 min threshold covers normal operation gaps
    expect(MAX_TIMESTAMP_GAP_MS).toBe(10 * 60 * 1000);
  });

  test('2-minute gap between UAP and Hook should PASS (normal operation)', () => {
    const uapTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const hookTime = new Date().toISOString();

    writeMetrics(project.metricsDir, 'uap-metrics.json', {
      agentId: 'po',
      quality: 'full',
      totalDuration: 168,
      timestamp: uapTime,
      loaders: { agentConfig: { status: 'ok', duration: 45 } },
    });

    writeMetrics(project.metricsDir, 'hook-metrics.json', {
      totalDuration: 0.88,
      bracket: 'FRESH',
      layersLoaded: 3,
      timestamp: hookTime,
      perLayer: {
        constitution: { status: 'ok', duration: 0.3, rules: 34 },
      },
    });

    // Write active-agent bridge
    fs.writeFileSync(
      path.join(project.dir, '.synapse', 'sessions', '_active-agent.json'),
      JSON.stringify({ id: 'po' }),
    );

    const result = collectConsistencyMetrics(project.dir);
    const timestampCheck = result.checks.find(c => c.name === 'timestamp');

    // BUG: Currently FAILS because 120s > 30s threshold
    // EXPECTED: Should PASS — 2 minutes is normal for independent pipelines
    expect(timestampCheck.status).toBe('PASS');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #3: hookBootMs Always 0
// ─────────────────────────────────────────────────────────────────────────────
describe('Issue #3: hookBootMs should propagate from hook to engine metrics', () => {
  test('engine._persistHookMetrics receives config with _hookBootTime', () => {
    // Verify the flow: hook passes _hookBootTime → engine.process → _persistHookMetrics
    const { SynapseEngine } = require('../../../.aios-core/core/synapse/engine');
    const project = createTempProject();

    try {
      const engine = new SynapseEngine(path.join(project.dir, '.synapse'));

      // Simulate what the hook does: pass a hrtime bigint
      const mockBootTime = process.hrtime.bigint() - BigInt(50 * 1e6); // 50ms ago

      // Spy on _persistHookMetrics
      let capturedConfig;
      const original = engine._persistHookMetrics.bind(engine);
      engine._persistHookMetrics = function(summary, bracket, config) {
        capturedConfig = config;
        original(summary, bracket, config);
      };

      // Run process with _hookBootTime (simulating hook entry)
      return engine.process('test prompt', { prompt_count: 0 }, { _hookBootTime: mockBootTime })
        .then(() => {
          expect(capturedConfig).toBeDefined();
          expect(capturedConfig._hookBootTime).toBe(mockBootTime);

          // Verify the metrics file has hookBootMs > 0
          const metricsPath = path.join(project.dir, '.synapse', 'metrics', 'hook-metrics.json');
          if (fs.existsSync(metricsPath)) {
            const data = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            expect(data.hookBootMs).toBeGreaterThan(0);
          }
        });
    } finally {
      cleanupDir(project.dir);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #4: Memories Loader Missing Context
// ─────────────────────────────────────────────────────────────────────────────
describe('Issue #4: Missing memories loader should say "Optional — Pro feature"', () => {
  let project;

  beforeEach(() => { project = createTempProject(); });
  afterEach(() => { cleanupDir(project.dir); });

  test('output analyzer shows generic message for missing memories instead of Pro context', () => {
    writeMetrics(project.metricsDir, 'uap-metrics.json', {
      loaders: {
        agentConfig: { status: 'ok', duration: 45 },
        // memories is intentionally absent — it's a Pro feature
      },
    });

    const result = collectOutputAnalysis(project.dir);
    const memoriesEntry = result.uapAnalysis.find(a => a.name === 'memories');

    expect(memoriesEntry).toBeDefined();
    expect(memoriesEntry.status).toBe('missing');

    // BUG: Shows generic "Loader not present in metrics"
    // EXPECTED: Should mention it's a Pro/Optional feature
    expect(memoriesEntry.detail).toContain('Optional');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #5: Relevance Matrix Treats "skipped" as Gap
// ─────────────────────────────────────────────────────────────────────────────
describe('Issue #5: Skipped layers should NOT count as gaps', () => {
  let project;

  beforeEach(() => { project = createTempProject(); });
  afterEach(() => { cleanupDir(project.dir); });

  test('layers skipped by bracket (no data) should not be gaps', () => {
    // Agent @po in FRESH bracket: only L0, L1, L2, L7 active
    // L3-L6 are skipped by design — they have no workflow/task/squad
    writeMetrics(project.metricsDir, 'uap-metrics.json', {
      agentId: 'po',
      loaders: {
        agentConfig: { status: 'ok', duration: 20 },
        sessionContext: { status: 'ok', duration: 15 },
      },
    });

    writeMetrics(project.metricsDir, 'hook-metrics.json', {
      bracket: 'FRESH',
      perLayer: {
        constitution: { status: 'ok', rules: 34 },
        global: { status: 'ok', rules: 25 },
        agent: { status: 'ok', rules: 11 },
        workflow: { status: 'skipped', rules: 0 },
        task: { status: 'skipped', rules: 0 },
        squad: { status: 'skipped', rules: 0 },
        keyword: { status: 'skipped', rules: 0 },
        'star-command': { status: 'skipped', rules: 0 },
      },
    });

    fs.writeFileSync(
      path.join(project.dir, '.synapse', 'sessions', '_active-agent.json'),
      JSON.stringify({ id: 'po' }),
    );

    const result = collectRelevanceMatrix(project.dir);

    // BUG: Currently counts skipped layers as gaps
    // For @po with no workflow/task, skipped L3-L6 is NORMAL
    const skippedGaps = result.gaps.filter(g =>
      ['workflow', 'task', 'keyword', 'star-command'].includes(g.component),
    );

    // EXPECTED: skipped layers should NOT appear as gaps
    expect(skippedGaps.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #7: BRACKET_ACTIVE_LAYERS Inconsistent with Engine
// ─────────────────────────────────────────────────────────────────────────────
describe('Issue #7: BRACKET_ACTIVE_LAYERS should match engine context-tracker', () => {
  test('FRESH bracket: quality-collector expects same layers as context-tracker', () => {
    // context-tracker LAYER_CONFIGS.FRESH = [0, 1, 2, 7]
    // = ['constitution', 'global', 'agent', 'star-command']
    const engineLayers = getActiveLayers('FRESH');
    const engineLayerNames = engineLayers.layers.map(n => {
      const map = {
        0: 'constitution', 1: 'global', 2: 'agent', 3: 'workflow',
        4: 'task', 5: 'squad', 6: 'keyword', 7: 'star-command',
      };
      return map[n];
    });

    const qualityLayers = BRACKET_ACTIVE_LAYERS.FRESH;

    // BUG: quality-collector and engine may have different layer expectations
    expect(qualityLayers.sort()).toEqual(engineLayerNames.sort());
  });

  test('MODERATE bracket: quality-collector expects same layers as context-tracker', () => {
    const engineLayers = getActiveLayers('MODERATE');
    const engineLayerNames = engineLayers.layers.map(n => {
      const map = {
        0: 'constitution', 1: 'global', 2: 'agent', 3: 'workflow',
        4: 'task', 5: 'squad', 6: 'keyword', 7: 'star-command',
      };
      return map[n];
    });

    const qualityLayers = BRACKET_ACTIVE_LAYERS.MODERATE;

    // This should match — both expect all 8 layers for MODERATE
    // The REAL problem is that even though all are "active",
    // layers without data (no workflow, no task) return null → skipped
    expect(qualityLayers.sort()).toEqual(engineLayerNames.sort());
  });

  test('quality-collector penalizes layers that engine skips due to no data (false negative)', () => {
    // Even in MODERATE (all layers active), L3-L6 often produce 0 results
    // because there's no active workflow, task, squad, or keyword.
    // The quality scorer gives 0 points for these, which is unfair.
    const project = createTempProject();

    try {
      writeMetrics(project.metricsDir, 'hook-metrics.json', {
        totalDuration: 0.88,
        bracket: 'MODERATE',
        timestamp: new Date().toISOString(),
        perLayer: {
          constitution: { status: 'ok', duration: 0.3, rules: 34 },
          global: { status: 'ok', duration: 0.2, rules: 25 },
          agent: { status: 'ok', duration: 0.38, rules: 11 },
          // These 5 layers are "active" per bracket but have no data
          workflow: { status: 'skipped', rules: 0 },
          task: { status: 'skipped', rules: 0 },
          squad: { status: 'skipped', rules: 0 },
          keyword: { status: 'skipped', rules: 0 },
          'star-command': { status: 'skipped', rules: 0 },
        },
      });

      const result = collectQualityMetrics(project.dir);

      // With 3/8 layers ok and 5 skipped, hook score should reflect
      // that skipped-by-no-data is not the same as skipped-by-error
      // Current: score = 70/100 (constitution+global+agent = 70 weight)
      //          maxPossible = 100 (all 8 layers expected for MODERATE)
      //          normalized = 70% → Grade B
      // This is actually CORRECT for MODERATE bracket — all layers SHOULD load
      // The issue is that "skipped" means "no data available" not "failed to load"

      // The hook score should be >= 70% since the 3 critical layers are ok
      expect(result.hook.score).toBeGreaterThanOrEqual(70);
    } finally {
      cleanupDir(project.dir);
    }
  });
});
