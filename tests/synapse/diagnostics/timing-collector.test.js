/**
 * Timing Collector — Unit Tests
 *
 * Tests for collectTimingMetrics() which reads persisted UAP and Hook metrics files.
 *
 * @module tests/synapse/diagnostics/timing-collector
 * @story SYN-12 - Timing Metrics + Context Quality Analysis
 * @coverage Target: >85%
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { collectTimingMetrics, LOADER_TIER_MAP, MAX_STALENESS_MS } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/timing-collector',
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir;

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'timing-test-'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function buildUapMetrics(overrides = {}) {
  return {
    agentId: 'dev',
    quality: 'full',
    totalDuration: 145,
    loaders: {
      agentConfig: { duration: 45, status: 'ok', start: 0, end: 45 },
      permissionMode: { duration: 12, status: 'ok', start: 45, end: 57 },
      gitConfig: { duration: 8, status: 'ok', start: 45, end: 53 },
      sessionContext: { duration: 23, status: 'ok', start: 57, end: 80 },
      projectStatus: { duration: 34, status: 'timeout', start: 57, end: 91, error: 'timeout' },
      synapseSession: { duration: 2, status: 'ok', start: 91, end: 93 },
    },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

function buildHookMetrics(overrides = {}) {
  return {
    totalDuration: 87,
    bracket: 'MODERATE',
    layersLoaded: 5,
    layersSkipped: 2,
    layersErrored: 0,
    totalRules: 42,
    perLayer: {
      constitution: { duration: 12, status: 'ok', rules: 5 },
      global: { duration: 11, status: 'ok', rules: 3 },
      agent: { duration: 22, status: 'ok', rules: 12 },
      workflow: { duration: 15, status: 'ok', rules: 8 },
      task: { duration: 18, status: 'ok', rules: 10 },
      squad: { duration: 0, status: 'skipped', reason: 'Not active in FRESH' },
      keyword: { duration: 0, status: 'skipped', reason: 'Not active in FRESH' },
    },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
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

describe('collectTimingMetrics — UAP metrics', () => {
  test('returns available=true when uap-metrics.json exists', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.available).toBe(true);
    expect(result.uap.totalDuration).toBe(145);
    expect(result.uap.quality).toBe('full');
  });

  test('returns correct loader count and tier mapping', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.loaders).toHaveLength(6);
    const agentConfig = result.uap.loaders.find((l) => l.name === 'agentConfig');
    expect(agentConfig.tier).toBe('Critical');
    expect(agentConfig.duration).toBe(45);
    expect(agentConfig.status).toBe('ok');
  });

  test('maps tiers correctly for all known loaders', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());

    const result = collectTimingMetrics(tmpDir);

    for (const loader of result.uap.loaders) {
      expect(LOADER_TIER_MAP[loader.name]).toBe(loader.tier);
    }
  });

  test('includes timeout status loaders', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());

    const result = collectTimingMetrics(tmpDir);

    const projectStatus = result.uap.loaders.find((l) => l.name === 'projectStatus');
    expect(projectStatus.status).toBe('timeout');
    expect(projectStatus.duration).toBe(34);
  });

  test('returns available=false when uap-metrics.json does not exist', () => {
    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.available).toBe(false);
    expect(result.uap.totalDuration).toBe(0);
    expect(result.uap.loaders).toHaveLength(0);
  });

  test('returns available=false when uap-metrics.json is malformed', () => {
    writeFile(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), '{ invalid }');

    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.available).toBe(false);
  });

  test('handles uap-metrics.json with empty loaders', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      totalDuration: 10,
      quality: 'fallback',
      loaders: {},
    });

    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.available).toBe(true);
    expect(result.uap.loaders).toHaveLength(0);
  });
});

describe('collectTimingMetrics — Hook metrics', () => {
  test('returns available=true when hook-metrics.json exists', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.available).toBe(true);
    expect(result.hook.totalDuration).toBe(87);
    expect(result.hook.bracket).toBe('MODERATE');
  });

  test('returns correct layer data', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.layers.length).toBeGreaterThan(0);
    const constitution = result.hook.layers.find((l) => l.name === 'constitution');
    expect(constitution.duration).toBe(12);
    expect(constitution.status).toBe('ok');
    expect(constitution.rules).toBe(5);
  });

  test('includes skipped layers with rules=0', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());

    const result = collectTimingMetrics(tmpDir);

    const squad = result.hook.layers.find((l) => l.name === 'squad');
    expect(squad.status).toBe('skipped');
    expect(squad.rules).toBe(0);
  });

  test('returns available=false when hook-metrics.json does not exist', () => {
    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.available).toBe(false);
    expect(result.hook.totalDuration).toBe(0);
    expect(result.hook.layers).toHaveLength(0);
  });

  test('returns available=false when hook-metrics.json is malformed', () => {
    writeFile(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), 'not json');

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.available).toBe(false);
  });
});

describe('collectTimingMetrics — Combined', () => {
  test('combined totalMs sums UAP and Hook totals', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.combined.totalMs).toBe(145 + 87);
  });

  test('combined totalMs is 0 when no metrics available', () => {
    const result = collectTimingMetrics(tmpDir);

    expect(result.combined.totalMs).toBe(0);
  });

  test('combined totalMs uses only available pipeline', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.combined.totalMs).toBe(145);
  });
});

describe('collectTimingMetrics — Staleness (SYN-14)', () => {
  test('exports MAX_STALENESS_MS constant as 5 minutes', () => {
    expect(MAX_STALENESS_MS).toBe(5 * 60 * 1000);
  });

  test('uap stale=false when timestamp is recent', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.stale).toBe(false);
    expect(result.uap.ageMs).toBeLessThan(MAX_STALENESS_MS);
  });

  test('uap stale=true when timestamp > 5 min old', () => {
    const old = new Date(Date.now() - MAX_STALENESS_MS - 10000).toISOString();
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ timestamp: old }));

    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.stale).toBe(true);
    expect(result.uap.ageMs).toBeGreaterThan(MAX_STALENESS_MS);
  });

  test('hook stale=false when timestamp is recent', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.stale).toBe(false);
  });

  test('hook stale=true when timestamp > 5 min old', () => {
    const old = new Date(Date.now() - MAX_STALENESS_MS - 10000).toISOString();
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ timestamp: old }));

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.stale).toBe(true);
  });

  test('hook includes hookBootMs field', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ hookBootMs: 42.5 }));

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.hookBootMs).toBe(42.5);
  });

  test('hookBootMs defaults to 0 when not present', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());

    const result = collectTimingMetrics(tmpDir);

    expect(result.hook.hookBootMs).toBe(0);
  });

  test('stale defaults to false when no metrics available', () => {
    const result = collectTimingMetrics(tmpDir);

    expect(result.uap.stale).toBe(false);
    expect(result.hook.stale).toBe(false);
  });
});
