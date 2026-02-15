/**
 * Relevance Matrix — Unit Tests
 *
 * @module tests/synapse/diagnostics/relevance-matrix
 * @story SYN-14
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  collectRelevanceMatrix,
  IMPORTANCE,
  DEFAULT_RELEVANCE,
  AGENT_OVERRIDES,
} = require('../../../.aios-core/core/synapse/diagnostics/collectors/relevance-matrix');

let tmpDir;

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'relevance-test-'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

beforeEach(() => { tmpDir = createTmpDir(); });
afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe('collectRelevanceMatrix', () => {
  test('available=false when no metrics', () => {
    const result = collectRelevanceMatrix(tmpDir);
    expect(result.available).toBe(false);
    expect(result.matrix).toHaveLength(0);
  });

  test('builds matrix for default agent', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      agentId: 'analyst', loaders: { agentConfig: { status: 'ok' } },
    });
    const result = collectRelevanceMatrix(tmpDir);
    expect(result.available).toBe(true);
    expect(result.agentId).toBe('analyst');
    expect(result.matrix.length).toBe(Object.keys(DEFAULT_RELEVANCE).length);
  });

  test('uses agent overrides for dev agent', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      agentId: 'dev', loaders: { agentConfig: { status: 'ok' }, gitConfig: { status: 'ok' } },
    });
    const result = collectRelevanceMatrix(tmpDir);
    const git = result.matrix.find(m => m.component === 'gitConfig');
    expect(git.importance).toBe(IMPORTANCE.IMPORTANT); // dev override
  });

  test('identifies gaps for critical missing components', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      agentId: 'dev', loaders: {},
    });
    const result = collectRelevanceMatrix(tmpDir);
    const agentGap = result.gaps.find(g => g.component === 'agentConfig');
    expect(agentGap).toBeDefined();
    expect(agentGap.importance).toBe(IMPORTANCE.CRITICAL);
  });

  test('no gaps when all critical components are ok', () => {
    const loaders = {};
    for (const key of Object.keys(DEFAULT_RELEVANCE)) {
      loaders[key] = { status: 'ok' };
    }
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'uap-metrics.json'), {
      agentId: 'dev', loaders,
    });
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), {
      perLayer: {
        constitution: { status: 'ok' },
        global: { status: 'ok' },
        agent: { status: 'ok' },
        workflow: { status: 'ok' },
        task: { status: 'ok' },
        squad: { status: 'ok' },
        keyword: { status: 'ok' },
        'star-command': { status: 'ok' },
      },
    });
    const result = collectRelevanceMatrix(tmpDir);
    expect(result.gaps).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  test('reads agentId from bridge file as fallback', () => {
    writeJson(path.join(tmpDir, '.synapse', 'metrics', 'hook-metrics.json'), {
      perLayer: { constitution: { status: 'ok' } },
    });
    writeJson(path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json'), { id: 'qa' });
    const result = collectRelevanceMatrix(tmpDir);
    expect(result.agentId).toBe('qa');
  });

  test('exports constants', () => {
    expect(IMPORTANCE.CRITICAL).toBe('critical');
    expect(IMPORTANCE.IRRELEVANT).toBe('irrelevant');
    expect(AGENT_OVERRIDES.dev).toBeDefined();
    expect(AGENT_OVERRIDES.devops).toBeDefined();
  });
});
