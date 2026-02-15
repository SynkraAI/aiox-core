/**
 * Quality Collector — Unit Tests
 *
 * Tests for collectQualityMetrics() which scores context relevance.
 *
 * @module tests/synapse/diagnostics/quality-collector
 * @story SYN-12 - Timing Metrics + Context Quality Analysis
 * @coverage Target: >85%
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  collectQualityMetrics,
  UAP_RUBRIC,
  HOOK_RUBRIC,
  BRACKET_ACTIVE_LAYERS,
  MAX_STALENESS_MS,
} = require('../../../.aios-core/core/synapse/diagnostics/collectors/quality-collector');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir;

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'quality-test-'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function buildAllOkUap() {
  const loaders = {};
  for (const r of UAP_RUBRIC) {
    loaders[r.name] = { duration: 10, status: 'ok' };
  }
  return { agentId: 'dev', quality: 'full', totalDuration: 100, loaders, timestamp: new Date().toISOString() };
}

function buildAllOkHook(bracket = 'MODERATE') {
  const perLayer = {};
  for (const r of HOOK_RUBRIC) {
    perLayer[r.name] = { duration: 5, status: 'ok', rules: 3 };
  }
  return { totalDuration: 50, bracket, perLayer, timestamp: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  tmpDir = createTmpDir();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---- UAP scoring ----

describe('collectQualityMetrics — UAP scoring', () => {
  test('100 score when all loaders ok', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.available).toBe(true);
    expect(result.uap.score).toBe(100);
  });

  test('0 score when all loaders missing', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      totalDuration: 0,
      quality: 'fallback',
      loaders: {},
    });

    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.available).toBe(true);
    expect(result.uap.score).toBe(0);
  });

  test('partial score when some loaders fail', () => {
    const uap = buildAllOkUap();
    uap.loaders.agentConfig.status = 'error'; // -25
    uap.loaders.memories.status = 'timeout'; // -20
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), uap);

    const result = collectQualityMetrics(tmpDir);

    // max=90 (without 25+20=45 lost), total=45/90... no, maxPossible is always sum of all weights
    // score = (90-45)/90 * 100 = 50... no, maxPossible = sum of all weights = 90
    // actual: all ok except agentConfig(25) and memories(20) = 90-45 = 45
    // normalized = 45/90 * 100 = 50
    expect(result.uap.score).toBe(50);
  });

  test('loader entries include criticality and impact from rubric', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());

    const result = collectQualityMetrics(tmpDir);

    const agentConfig = result.uap.loaders.find((l) => l.name === 'agentConfig');
    expect(agentConfig.criticality).toBe('CRITICAL');
    expect(agentConfig.impact).toBe('Agent identity and commands');
    expect(agentConfig.score).toBe(25);
    expect(agentConfig.maxScore).toBe(25);
  });

  test('unavailable when no uap-metrics.json', () => {
    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.available).toBe(false);
  });

  test('unavailable when uap-metrics.json is malformed', () => {
    writeFile(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), '!!!');

    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.available).toBe(false);
  });
});

// ---- Hook scoring ----

describe('collectQualityMetrics — Hook scoring', () => {
  test('100 score when all expected layers ok for MODERATE', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook('MODERATE'));

    const result = collectQualityMetrics(tmpDir);

    expect(result.hook.available).toBe(true);
    expect(result.hook.score).toBe(100);
    expect(result.hook.bracket).toBe('MODERATE');
  });

  test('adjusts maxPossible based on FRESH bracket (only 4 layers expected)', () => {
    const hook = buildAllOkHook('FRESH');
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), hook);

    const result = collectQualityMetrics(tmpDir);

    // FRESH expects: constitution(25), global(20), agent(25), star-command(2) = 72
    expect(result.hook.available).toBe(true);
    expect(result.hook.score).toBe(100); // all ok
  });

  test('adjusts maxPossible based on CRITICAL bracket (only 2 layers)', () => {
    const hook = buildAllOkHook('CRITICAL');
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), hook);

    const result = collectQualityMetrics(tmpDir);

    // CRITICAL expects: constitution(25), agent(25) = 50
    expect(result.hook.score).toBe(100);
  });

  test('partial score when expected layer fails', () => {
    const hook = buildAllOkHook('MODERATE');
    hook.perLayer.constitution.status = 'error'; // -25 of 100
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), hook);

    const result = collectQualityMetrics(tmpDir);

    expect(result.hook.score).toBe(75);
  });

  test('layers include rules count', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);

    const constitution = result.hook.layers.find((l) => l.name === 'constitution');
    expect(constitution.rules).toBe(3);
  });

  test('not-expected layers have score 0 and maxScore 0', () => {
    // FRESH: workflow, task, squad, keyword are not expected
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook('FRESH'));

    const result = collectQualityMetrics(tmpDir);

    const workflow = result.hook.layers.find((l) => l.name === 'workflow');
    expect(workflow.status).toBe('not-expected');
    expect(workflow.score).toBe(0);
    expect(workflow.maxScore).toBe(0);
  });

  test('unavailable when no hook-metrics.json', () => {
    const result = collectQualityMetrics(tmpDir);

    expect(result.hook.available).toBe(false);
  });
});

// ---- Overall scoring ----

describe('collectQualityMetrics — Overall scoring', () => {
  test('weighted average: 40% UAP + 60% Hook', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);

    expect(result.overall.score).toBe(100);
    expect(result.overall.grade).toBe('A');
    expect(result.overall.label).toBe('EXCELLENT');
  });

  test('grade A for score >= 90', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);
    expect(result.overall.grade).toBe('A');
  });

  test('grade B for score 75-89', () => {
    const uap = buildAllOkUap();
    uap.loaders.agentConfig.status = 'error'; // drops UAP to ~72
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), uap);
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);
    // UAP: ~72 * 0.4 = 28.8, Hook: 100 * 0.6 = 60, total = 88.8 → 89
    expect(result.overall.grade).toBe('B');
  });

  test('grade F for score < 45', () => {
    // All loaders fail
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      totalDuration: 0, quality: 'fallback', loaders: {},
    });
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), {
      totalDuration: 0, bracket: 'MODERATE', perLayer: {},
    });

    const result = collectQualityMetrics(tmpDir);
    expect(result.overall.grade).toBe('F');
    expect(result.overall.score).toBe(0);
  });

  test('uses only UAP score when hook unavailable', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());

    const result = collectQualityMetrics(tmpDir);

    expect(result.overall.score).toBe(100);
    expect(result.hook.available).toBe(false);
  });

  test('uses only Hook score when UAP unavailable', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);

    expect(result.overall.score).toBe(100);
    expect(result.uap.available).toBe(false);
  });

  test('score 0 when both unavailable', () => {
    const result = collectQualityMetrics(tmpDir);

    expect(result.overall.score).toBe(0);
    expect(result.overall.grade).toBe('F');
  });
});

// ---- Rubric exports ----

describe('Rubric exports', () => {
  test('UAP_RUBRIC weights sum to 90', () => {
    const sum = UAP_RUBRIC.reduce((s, r) => s + r.weight, 0);
    expect(sum).toBe(90);
  });

  test('HOOK_RUBRIC weights sum to 100', () => {
    const sum = HOOK_RUBRIC.reduce((s, r) => s + r.weight, 0);
    expect(sum).toBe(100);
  });

  test('BRACKET_ACTIVE_LAYERS has all 4 brackets', () => {
    expect(Object.keys(BRACKET_ACTIVE_LAYERS).sort()).toEqual(
      ['CRITICAL', 'DEPLETED', 'FRESH', 'MODERATE'],
    );
  });

  test('MAX_STALENESS_MS is 30 minutes', () => {
    expect(MAX_STALENESS_MS).toBe(30 * 60 * 1000);
  });
});

// ---- Staleness detection (SYN-14) ----

describe('collectQualityMetrics — Staleness detection', () => {
  test('stale=false when timestamp is recent', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.stale).toBe(false);
    expect(result.hook.stale).toBe(false);
  });

  test('stale UAP data applies 50% degradation (not zero)', () => {
    const old = new Date(Date.now() - MAX_STALENESS_MS - 10000).toISOString();
    const uap = buildAllOkUap();
    uap.timestamp = old;
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), uap);
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildAllOkHook());

    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.stale).toBe(true);
    // Score is degraded (50% of normal) but NOT zeroed
    expect(result.uap.score).toBeGreaterThan(0);
    expect(result.uap.available).toBe(true);
  });

  test('stale Hook data applies 50% degradation (not zero)', () => {
    const old = new Date(Date.now() - MAX_STALENESS_MS - 10000).toISOString();
    const hook = buildAllOkHook();
    hook.timestamp = old;
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildAllOkUap());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), hook);

    const result = collectQualityMetrics(tmpDir);

    expect(result.hook.stale).toBe(true);
    // Score is degraded (50% of normal) but NOT zeroed
    expect(result.hook.score).toBeGreaterThan(0);
    expect(result.hook.available).toBe(true);
  });

  test('both stale gives degraded score (not zero/F)', () => {
    const old = new Date(Date.now() - MAX_STALENESS_MS - 10000).toISOString();
    const uap = buildAllOkUap();
    uap.timestamp = old;
    const hook = buildAllOkHook();
    hook.timestamp = old;
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), uap);
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), hook);

    const result = collectQualityMetrics(tmpDir);

    // Both degraded at 50% → overall ~50 (grade D, not F)
    expect(result.overall.score).toBeGreaterThan(0);
    expect(result.overall.score).toBeLessThanOrEqual(50);
    expect(result.overall.grade).not.toBe('F');
  });

  test('stale=false when no data available', () => {
    const result = collectQualityMetrics(tmpDir);

    expect(result.uap.stale).toBe(false);
    expect(result.hook.stale).toBe(false);
  });
});
