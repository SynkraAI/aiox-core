/**
 * SYNAPSE Diagnostic Collectors — Unit Tests
 *
 * Tests for all 5 collectors: hook, session, manifest, pipeline, UAP.
 *
 * @module tests/synapse/diagnostics/collectors
 * @story SYN-13 - UAP Session Bridge + SYNAPSE Diagnostics
 * @coverage Target: >85% for collectors
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// Mock parseManifest before requiring manifest-collector
jest.mock(
  '../../../.aios-core/core/synapse/domain/domain-loader',
  () => ({
    parseManifest: jest.fn(),
    loadDomainFile: jest.fn(() => []),
    isExcluded: jest.fn(() => false),
    matchKeywords: jest.fn(() => false),
    extractDomainInfo: jest.fn(() => ({ domainName: null, suffix: null })),
    domainNameToFile: jest.fn((name) => name.toLowerCase().replace(/_/g, '-')),
    KNOWN_SUFFIXES: [],
    GLOBAL_KEYS: [],
  })
);

const { collectHookStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/hook-collector');
const { collectSessionStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/session-collector');
const { collectManifestIntegrity } = require('../../../.aios-core/core/synapse/diagnostics/collectors/manifest-collector');
const { collectPipelineSimulation } = require('../../../.aios-core/core/synapse/diagnostics/collectors/pipeline-collector');
const { collectUapBridgeStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/uap-collector');
const { parseManifest } = require('../../../.aios-core/core/synapse/domain/domain-loader');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir;

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-test-'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

// ---------------------------------------------------------------------------
// hook-collector
// ---------------------------------------------------------------------------

describe('hook-collector: collectHookStatus', () => {
  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns PASS when settings.local.json has synapse-engine hook', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: {
        UserPromptSubmit: ['node .claude/hooks/synapse-engine.js'],
      },
    });

    // Create the hook file so check 2 + 3 also pass
    writeFile(
      path.join(tmpDir, '.claude', 'hooks', 'synapse-engine.js'),
      'module.exports = {};'
    );

    const result = collectHookStatus(tmpDir);

    expect(result.checks).toBeDefined();
    const registered = result.checks.find((c) => c.name === 'Hook registered');
    expect(registered.status).toBe('PASS');
    expect(registered.detail).toContain('synapse-engine');
  });

  test('returns FAIL when settings.local.json is missing', () => {
    const result = collectHookStatus(tmpDir);

    const registered = result.checks.find((c) => c.name === 'Hook registered');
    expect(registered.status).toBe('FAIL');
    expect(registered.detail).toContain('not found');
  });

  test('returns FAIL when hook not registered in settings', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: {
        UserPromptSubmit: ['node some-other-hook.js'],
      },
    });

    const result = collectHookStatus(tmpDir);

    const registered = result.checks.find((c) => c.name === 'Hook registered');
    expect(registered.status).toBe('FAIL');
    expect(registered.detail).toContain('No synapse-engine hook found');
  });

  test('returns PASS for hook file exists when file is present', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: { UserPromptSubmit: [] },
    });
    writeFile(
      path.join(tmpDir, '.claude', 'hooks', 'synapse-engine.js'),
      '// hook\nmodule.exports = {};'
    );

    const result = collectHookStatus(tmpDir);

    const fileCheck = result.checks.find((c) => c.name === 'Hook file exists');
    expect(fileCheck.status).toBe('PASS');
    expect(fileCheck.detail).toContain('lines');
    expect(fileCheck.detail).toContain('bytes');
  });

  test('returns FAIL for hook file exists when file is missing', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: { UserPromptSubmit: [] },
    });

    const result = collectHookStatus(tmpDir);

    const fileCheck = result.checks.find((c) => c.name === 'Hook file exists');
    expect(fileCheck.status).toBe('FAIL');
    expect(fileCheck.detail).toContain('not found');
  });

  test('returns PASS for hook executable when file is valid JS', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: { UserPromptSubmit: [] },
    });
    writeFile(
      path.join(tmpDir, '.claude', 'hooks', 'synapse-engine.js'),
      'module.exports = {};'
    );

    const result = collectHookStatus(tmpDir);

    const execCheck = result.checks.find((c) => c.name === 'Hook executable');
    expect(execCheck.status).toBe('PASS');
    expect(execCheck.detail).toContain('resolve');
  });

  test('returns SKIP for hook executable when hook file does not exist', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: { UserPromptSubmit: [] },
    });

    const result = collectHookStatus(tmpDir);

    const execCheck = result.checks.find((c) => c.name === 'Hook executable');
    expect(execCheck.status).toBe('SKIP');
  });

  test('handles hook entry as object with command property', () => {
    writeJson(path.join(tmpDir, '.claude', 'settings.local.json'), {
      hooks: {
        UserPromptSubmit: [
          { command: 'node .claude/hooks/synapse-engine.js', timeout: 5000 },
        ],
      },
    });
    writeFile(
      path.join(tmpDir, '.claude', 'hooks', 'synapse-engine.js'),
      'module.exports = {};'
    );

    const result = collectHookStatus(tmpDir);

    const registered = result.checks.find((c) => c.name === 'Hook registered');
    expect(registered.status).toBe('PASS');
  });

  test('handles malformed JSON in settings.local.json', () => {
    writeFile(
      path.join(tmpDir, '.claude', 'settings.local.json'),
      '{ invalid json'
    );

    const result = collectHookStatus(tmpDir);

    const registered = result.checks.find((c) => c.name === 'Hook registered');
    expect(registered.status).toBe('ERROR');
    expect(registered.detail).toContain('Failed to read settings');
  });
});

// ---------------------------------------------------------------------------
// session-collector
// ---------------------------------------------------------------------------

describe('session-collector: collectSessionStatus', () => {
  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns PASS when _active-agent.json exists with valid data', () => {
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      id: 'dev',
      activation_quality: 'full',
      source: 'uap',
    });

    const result = collectSessionStatus(tmpDir);

    expect(result.fields).toBeDefined();
    expect(result.raw).toBeDefined();

    const agentField = result.fields.find((f) => f.field === 'active_agent.id');
    expect(agentField.status).toBe('PASS');
    expect(agentField.actual).toBe('dev');

    const qualityField = result.fields.find((f) => f.field === 'activation_quality');
    expect(qualityField.status).toBe('PASS');
    expect(qualityField.actual).toBe('full');

    const bridgeField = result.fields.find((f) => f.field === '_active-agent.json');
    expect(bridgeField.status).toBe('PASS');
  });

  test('returns WARN when no agent data found', () => {
    const result = collectSessionStatus(tmpDir);

    const agentField = result.fields.find((f) => f.field === 'active_agent.id');
    expect(agentField.status).toBe('WARN');
    expect(agentField.actual).toBe('(none)');

    const bridgeField = result.fields.find((f) => f.field === '_active-agent.json');
    expect(bridgeField.status).toBe('WARN');
  });

  test('returns INFO for prompt_count and bracket when no session file', () => {
    const result = collectSessionStatus(tmpDir);

    const promptField = result.fields.find((f) => f.field === 'prompt_count');
    expect(promptField.status).toBe('INFO');
    expect(promptField.actual).toBe('(no session)');

    const bracketField = result.fields.find((f) => f.field === 'bracket');
    expect(bracketField.status).toBe('INFO');
    expect(bracketField.actual).toBe('(no session)');
  });

  test('reads session file by sessionId when provided', () => {
    const sessionsDir = path.join(tmpDir, '.synapse', 'sessions');
    const sessionId = 'abc-123-def';
    writeJson(path.join(sessionsDir, `${sessionId}.json`), {
      active_agent: { id: 'qa', activation_quality: 'partial' },
      prompt_count: 5,
      context: { last_bracket: 'MODERATE' },
    });

    const result = collectSessionStatus(tmpDir, sessionId);

    const agentField = result.fields.find((f) => f.field === 'active_agent.id');
    expect(agentField.status).toBe('PASS');
    expect(agentField.actual).toBe('qa');

    const promptField = result.fields.find((f) => f.field === 'prompt_count');
    expect(promptField.status).toBe('PASS');
    expect(promptField.actual).toBe('5');

    const bracketField = result.fields.find((f) => f.field === 'bracket');
    expect(bracketField.status).toBe('PASS');
    expect(bracketField.actual).toBe('MODERATE');
  });

  test('reads bridge file as fallback when sessionId not found', () => {
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      id: 'architect',
      activation_quality: 'fallback',
    });

    const result = collectSessionStatus(tmpDir, 'nonexistent-session-id');

    const agentField = result.fields.find((f) => f.field === 'active_agent.id');
    expect(agentField.status).toBe('PASS');
    expect(agentField.actual).toBe('architect');
  });

  test('returns all 5 expected fields', () => {
    const result = collectSessionStatus(tmpDir);

    expect(result.fields).toHaveLength(5);
    const fieldNames = result.fields.map((f) => f.field);
    expect(fieldNames).toEqual([
      'active_agent.id',
      'activation_quality',
      'prompt_count',
      'bracket',
      '_active-agent.json',
    ]);
  });
});

// ---------------------------------------------------------------------------
// manifest-collector (mocked parseManifest)
// ---------------------------------------------------------------------------

describe('manifest-collector: collectManifestIntegrity', () => {
  beforeEach(() => {
    tmpDir = createTmpDir();
    parseManifest.mockReset();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns PASS for domains with existing files', () => {
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });

    // Create domain files
    writeFile(path.join(synapsePath, 'agent-dev'), 'DEV_RULE_1=code stuff');
    writeFile(path.join(synapsePath, 'workflow-story'), 'WF_RULE_1=story stuff');

    parseManifest.mockReturnValue({
      devmode: false,
      globalExclude: [],
      domains: {
        AGENT_DEV: { file: 'agent-dev', state: 'active', agentTrigger: 'dev' },
        WORKFLOW_STORY: { file: 'workflow-story', state: 'active', workflowTrigger: 'story-dev' },
      },
    });

    const result = collectManifestIntegrity(tmpDir);

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].status).toBe('PASS');
    expect(result.entries[0].fileExists).toBe(true);
    expect(result.entries[1].status).toBe('PASS');
    expect(result.orphanedFiles).toHaveLength(0);
  });

  test('returns FAIL for domains with missing files', () => {
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });

    parseManifest.mockReturnValue({
      devmode: false,
      globalExclude: [],
      domains: {
        AGENT_QA: { file: 'agent-qa', state: 'active' },
      },
    });

    const result = collectManifestIntegrity(tmpDir);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe('FAIL');
    expect(result.entries[0].fileExists).toBe(false);
    expect(result.entries[0].domain).toBe('agent-qa');
  });

  test('detects orphaned files not in manifest', () => {
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });

    // Create files: one in manifest, one orphaned
    writeFile(path.join(synapsePath, 'agent-dev'), 'rule content');
    writeFile(path.join(synapsePath, 'stale-domain'), 'old rule content');

    parseManifest.mockReturnValue({
      devmode: false,
      globalExclude: [],
      domains: {
        AGENT_DEV: { file: 'agent-dev', state: 'active' },
      },
    });

    const result = collectManifestIntegrity(tmpDir);

    expect(result.orphanedFiles).toContain('stale-domain');
    expect(result.orphanedFiles).not.toContain('agent-dev');
  });

  test('skips manifest file and dotfiles when detecting orphans', () => {
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });

    writeFile(path.join(synapsePath, 'manifest'), 'AGENT_DEV_STATE=active');
    writeFile(path.join(synapsePath, '.gitignore'), '*');
    writeFile(path.join(synapsePath, 'agent-dev'), 'rules');

    parseManifest.mockReturnValue({
      devmode: false,
      globalExclude: [],
      domains: {
        AGENT_DEV: { file: 'agent-dev', state: 'active' },
      },
    });

    const result = collectManifestIntegrity(tmpDir);

    expect(result.orphanedFiles).toHaveLength(0);
  });

  test('includes trigger and state info in inManifest field', () => {
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });
    writeFile(path.join(synapsePath, 'agent-dev'), 'rules');

    parseManifest.mockReturnValue({
      devmode: false,
      globalExclude: [],
      domains: {
        AGENT_DEV: {
          file: 'agent-dev',
          state: 'active',
          agentTrigger: 'dev',
          alwaysOn: true,
        },
      },
    });

    const result = collectManifestIntegrity(tmpDir);

    expect(result.entries[0].inManifest).toContain('active');
    expect(result.entries[0].inManifest).toContain('trigger=dev');
    expect(result.entries[0].inManifest).toContain('ALWAYS_ON');
  });

  test('handles empty manifest gracefully', () => {
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });

    parseManifest.mockReturnValue({
      devmode: false,
      globalExclude: [],
      domains: {},
    });

    const result = collectManifestIntegrity(tmpDir);

    expect(result.entries).toHaveLength(0);
    expect(result.orphanedFiles).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// pipeline-collector
// ---------------------------------------------------------------------------

describe('pipeline-collector: collectPipelineSimulation', () => {
  test('returns FRESH bracket for promptCount=0', () => {
    const result = collectPipelineSimulation(0, null, { domains: {} });

    expect(result.bracket).toBe('FRESH');
    expect(result.contextPercent).toBe(100);
  });

  test('reports all 8 layers (L0-L7)', () => {
    const result = collectPipelineSimulation(0, null, { domains: {} });

    expect(result.layers).toHaveLength(8);
    expect(result.layers[0].layer).toBe('L0 Constitution');
    expect(result.layers[7].layer).toBe('L7 Star-Command');
  });

  test('FRESH bracket: only L0, L1, L2, L7 are ACTIVE', () => {
    const result = collectPipelineSimulation(0, null, { domains: {} });

    const activeIndices = [0, 1, 2, 7];
    const skipIndices = [3, 4, 5, 6];

    for (const i of activeIndices) {
      expect(result.layers[i].expected).toContain('ACTIVE');
    }
    for (const i of skipIndices) {
      expect(result.layers[i].expected).toContain('SKIP');
    }
  });

  test('MODERATE bracket: all 8 layers ACTIVE', () => {
    // promptCount=60 => usedTokens=90000 => percent=55 => MODERATE
    const result = collectPipelineSimulation(60, null, { domains: {} });

    expect(result.bracket).toBe('MODERATE');
    for (const layer of result.layers) {
      expect(layer.expected).toContain('ACTIVE');
    }
  });

  test('L2 WARN when agent has no matching domain', () => {
    const manifest = {
      domains: {
        AGENT_QA: { file: 'agent-qa', agentTrigger: 'qa' },
      },
    };

    const result = collectPipelineSimulation(0, 'dev', manifest);

    const l2 = result.layers[2];
    expect(l2.status).toBe('WARN');
    expect(l2.expected).toContain('no domain for dev');
  });

  test('L2 PASS when agent has matching domain', () => {
    const manifest = {
      domains: {
        AGENT_DEV: { file: 'agent-dev', agentTrigger: 'dev' },
      },
    };

    const result = collectPipelineSimulation(0, 'dev', manifest);

    const l2 = result.layers[2];
    expect(l2.status).toBe('PASS');
    expect(l2.expected).toContain('agent: dev');
  });

  test('CRITICAL bracket for very high prompt count', () => {
    // promptCount=120 => usedTokens=180000 => percent=10 => CRITICAL
    const result = collectPipelineSimulation(120, null, { domains: {} });

    expect(result.bracket).toBe('CRITICAL');
    expect(result.contextPercent).toBeLessThanOrEqual(25);
  });

  test('L2 check not applied when no activeAgentId', () => {
    const manifest = {
      domains: {
        AGENT_DEV: { file: 'agent-dev', agentTrigger: 'dev' },
      },
    };

    const result = collectPipelineSimulation(0, null, manifest);

    const l2 = result.layers[2];
    expect(l2.status).toBe('PASS');
    // No agent-specific detail when activeAgentId is null
    expect(l2.expected).not.toContain('agent:');
  });

  test('handles null manifest gracefully', () => {
    const result = collectPipelineSimulation(0, 'dev', null);

    const l2 = result.layers[2];
    expect(l2.status).toBe('WARN');
    expect(l2.expected).toContain('no domain for dev');
  });
});

// ---------------------------------------------------------------------------
// uap-collector
// ---------------------------------------------------------------------------

describe('uap-collector: collectUapBridgeStatus', () => {
  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns FAIL when _active-agent.json missing', () => {
    const result = collectUapBridgeStatus(tmpDir);

    expect(result.checks).toBeDefined();
    const existsCheck = result.checks.find((c) => c.name === '_active-agent.json exists');
    expect(existsCheck.status).toBe('FAIL');
    expect(existsCheck.detail).toContain('not found');

    // Should also have SKIP for active_agent matches
    const matchCheck = result.checks.find((c) => c.name === 'active_agent matches');
    expect(matchCheck.status).toBe('SKIP');
  });

  test('returns PASS when bridge file is valid with id field', () => {
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      id: 'dev',
      activation_quality: 'full',
      source: 'uap',
      activated_at: new Date().toISOString(),
    });

    const result = collectUapBridgeStatus(tmpDir);

    const existsCheck = result.checks.find((c) => c.name === '_active-agent.json exists');
    expect(existsCheck.status).toBe('PASS');

    const matchCheck = result.checks.find((c) => c.name === 'active_agent matches');
    expect(matchCheck.status).toBe('PASS');
    expect(matchCheck.detail).toContain('Agent: dev');
    expect(matchCheck.detail).toContain('quality: full');
  });

  test('returns WARN for stale bridge (>60min old)', () => {
    const staleTime = new Date(Date.now() - 90 * 60 * 1000); // 90 minutes ago
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      id: 'pm',
      activation_quality: 'full',
      activated_at: staleTime.toISOString(),
    });

    const result = collectUapBridgeStatus(tmpDir);

    const freshnessCheck = result.checks.find((c) => c.name === 'Bridge freshness');
    expect(freshnessCheck.status).toBe('WARN');
    expect(freshnessCheck.detail).toContain('stale');
  });

  test('returns PASS for fresh bridge (<60min old)', () => {
    const freshTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      id: 'dev',
      activated_at: freshTime.toISOString(),
    });

    const result = collectUapBridgeStatus(tmpDir);

    const freshnessCheck = result.checks.find((c) => c.name === 'Bridge freshness');
    expect(freshnessCheck.status).toBe('PASS');
    expect(freshnessCheck.detail).not.toContain('stale');
  });

  test('returns ERROR when bridge file is invalid JSON', () => {
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeFile(bridgePath, '{ not valid json !!!');

    const result = collectUapBridgeStatus(tmpDir);

    const existsCheck = result.checks.find((c) => c.name === '_active-agent.json exists');
    expect(existsCheck.status).toBe('PASS'); // File exists, just invalid

    const matchCheck = result.checks.find((c) => c.name === 'active_agent matches');
    expect(matchCheck.status).toBe('ERROR');
    expect(matchCheck.detail).toContain('Failed to parse');
  });

  test('returns FAIL when bridge file has no id field', () => {
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      activation_quality: 'full',
      source: 'uap',
    });

    const result = collectUapBridgeStatus(tmpDir);

    const matchCheck = result.checks.find((c) => c.name === 'active_agent matches');
    expect(matchCheck.status).toBe('FAIL');
    expect(matchCheck.detail).toContain('id field is missing');
  });

  test('no freshness check when activated_at is missing', () => {
    const bridgePath = path.join(tmpDir, '.synapse', 'sessions', '_active-agent.json');
    writeJson(bridgePath, {
      id: 'dev',
      activation_quality: 'full',
    });

    const result = collectUapBridgeStatus(tmpDir);

    const freshnessCheck = result.checks.find((c) => c.name === 'Bridge freshness');
    expect(freshnessCheck).toBeUndefined();
    // Should only have 2 checks: exists + matches
    expect(result.checks).toHaveLength(2);
  });
});
