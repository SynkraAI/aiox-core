/**
 * Consistency Collector — Unit Tests
 *
 * @module tests/synapse/diagnostics/consistency-collector
 * @story SYN-14
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { collectConsistencyMetrics, MAX_TIMESTAMP_GAP_MS } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/consistency-collector',
);

let tmpDir;

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'consistency-test-'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function buildUapMetrics(overrides = {}) {
  return {
    agentId: 'dev', quality: 'full', totalDuration: 100,
    loaders: { agentConfig: { duration: 10, status: 'ok' } },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

function buildHookMetrics(overrides = {}) {
  return {
    totalDuration: 50, bracket: 'MODERATE', layersLoaded: 3,
    perLayer: { constitution: { duration: 5, status: 'ok', rules: 3 } },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => { tmpDir = createTmpDir(); });
afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe('collectConsistencyMetrics', () => {
  test('available=false when no metrics files', () => {
    const result = collectConsistencyMetrics(tmpDir);
    expect(result.available).toBe(false);
    expect(result.checks).toHaveLength(0);
  });

  test('WARN when only UAP exists', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());
    const result = collectConsistencyMetrics(tmpDir);
    expect(result.available).toBe(true);
    expect(result.checks[0].status).toBe('WARN');
    expect(result.checks[0].detail).toContain('Hook metrics missing');
  });

  test('WARN when only Hook exists', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());
    const result = collectConsistencyMetrics(tmpDir);
    expect(result.checks[0].detail).toContain('UAP metrics missing');
  });

  test('bracket check PASS for valid bracket', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());
    const result = collectConsistencyMetrics(tmpDir);
    const bracket = result.checks.find(c => c.name === 'bracket');
    expect(bracket.status).toBe('PASS');
  });

  test('bracket check FAIL for unknown bracket', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics());
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ bracket: 'INVALID' }));
    const result = collectConsistencyMetrics(tmpDir);
    const bracket = result.checks.find(c => c.name === 'bracket');
    expect(bracket.status).toBe('FAIL');
  });

  test('agent check PASS when UAP matches bridge', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ agentId: 'dev' }));
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());
    writeJson(path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json'), { id: 'dev' });
    const result = collectConsistencyMetrics(tmpDir);
    const agent = result.checks.find(c => c.name === 'agent');
    expect(agent.status).toBe('PASS');
  });

  test('agent check FAIL when UAP != bridge', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ agentId: 'dev' }));
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics());
    writeJson(path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json'), { id: 'qa' });
    const result = collectConsistencyMetrics(tmpDir);
    const agent = result.checks.find(c => c.name === 'agent');
    expect(agent.status).toBe('FAIL');
  });

  test('timestamp check PASS when gap < 30s', () => {
    const now = new Date().toISOString();
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ timestamp: now }));
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ timestamp: now }));
    const result = collectConsistencyMetrics(tmpDir);
    const ts = result.checks.find(c => c.name === 'timestamp');
    expect(ts.status).toBe('PASS');
  });

  test('timestamp check FAIL when gap > 10 minutes', () => {
    const old = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 min gap
    const now = new Date().toISOString();
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ timestamp: old }));
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ timestamp: now }));
    const result = collectConsistencyMetrics(tmpDir);
    const ts = result.checks.find(c => c.name === 'timestamp');
    expect(ts.status).toBe('FAIL');
  });

  test('quality check PASS for full quality + layers loaded', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ quality: 'full' }));
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ layersLoaded: 5 }));
    const result = collectConsistencyMetrics(tmpDir);
    const q = result.checks.find(c => c.name === 'quality');
    expect(q.status).toBe('PASS');
  });

  test('score counts passing checks', () => {
    const now = new Date().toISOString();
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), buildUapMetrics({ timestamp: now }));
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), buildHookMetrics({ timestamp: now }));
    const result = collectConsistencyMetrics(tmpDir);
    expect(result.maxScore).toBe(4);
    expect(result.score).toBeGreaterThanOrEqual(2); // bracket + timestamp + quality at minimum
  });

  test('exports MAX_TIMESTAMP_GAP_MS constant', () => {
    expect(MAX_TIMESTAMP_GAP_MS).toBe(10 * 60 * 1000); // 10 minutes
  });
});
