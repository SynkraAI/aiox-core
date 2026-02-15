/**
 * Output Analyzer — Unit Tests
 *
 * @module tests/synapse/diagnostics/output-analyzer
 * @story SYN-14
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { collectOutputAnalysis, UAP_OUTPUT_EXPECTATIONS } = require(
  '../../../.aios-core/core/synapse/diagnostics/collectors/output-analyzer',
);

let tmpDir;

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'output-test-'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

beforeEach(() => { tmpDir = createTmpDir(); });
afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe('collectOutputAnalysis', () => {
  test('available=false when no metrics', () => {
    const result = collectOutputAnalysis(tmpDir);
    expect(result.available).toBe(false);
  });

  test('analyzes UAP loaders with ok status as good', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      loaders: { agentConfig: { duration: 10, status: 'ok' } },
    });
    const result = collectOutputAnalysis(tmpDir);
    expect(result.available).toBe(true);
    const agent = result.uapAnalysis.find(a => a.name === 'agentConfig');
    expect(agent.quality).toBe('good');
  });

  test('marks error loaders as bad quality', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      loaders: { agentConfig: { duration: 10, status: 'error', error: 'fail' } },
    });
    const result = collectOutputAnalysis(tmpDir);
    const agent = result.uapAnalysis.find(a => a.name === 'agentConfig');
    expect(agent.quality).toBe('bad');
  });

  test('marks timeout loaders as bad quality', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      loaders: { agentConfig: { duration: 100, status: 'timeout' } },
    });
    const result = collectOutputAnalysis(tmpDir);
    const agent = result.uapAnalysis.find(a => a.name === 'agentConfig');
    expect(agent.quality).toBe('bad');
  });

  test('marks slow loaders (>200ms) as degraded', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      loaders: { agentConfig: { duration: 300, status: 'ok' } },
    });
    const result = collectOutputAnalysis(tmpDir);
    const agent = result.uapAnalysis.find(a => a.name === 'agentConfig');
    expect(agent.quality).toBe('degraded');
  });

  test('analyzes hook layers with rules as good', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), {
      perLayer: { constitution: { duration: 5, status: 'ok', rules: 3 } },
    });
    const result = collectOutputAnalysis(tmpDir);
    const layer = result.hookAnalysis.find(a => a.name === 'constitution');
    expect(layer.quality).toBe('good');
    expect(layer.rules).toBe(3);
  });

  test('marks layers with 0 rules as empty quality', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), {
      perLayer: { constitution: { duration: 5, status: 'ok', rules: 0 } },
    });
    const result = collectOutputAnalysis(tmpDir);
    const layer = result.hookAnalysis.find(a => a.name === 'constitution');
    expect(layer.quality).toBe('empty');
  });

  test('summary counts healthy components', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      loaders: {
        agentConfig: { duration: 10, status: 'ok' },
        gitConfig: { duration: 5, status: 'error' },
      },
    });
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), {
      perLayer: {
        constitution: { duration: 5, status: 'ok', rules: 3 },
        agent: { duration: 8, status: 'ok', rules: 5 },
      },
    });
    const result = collectOutputAnalysis(tmpDir);
    expect(result.summary.uapHealthy).toBe(1);
    expect(result.summary.uapTotal).toBeGreaterThanOrEqual(2);
    expect(result.summary.hookHealthy).toBe(2);
    expect(result.summary.hookTotal).toBe(2);
  });

  test('exports UAP_OUTPUT_EXPECTATIONS', () => {
    expect(UAP_OUTPUT_EXPECTATIONS).toBeDefined();
    expect(UAP_OUTPUT_EXPECTATIONS.agentConfig).toBeDefined();
  });
});
