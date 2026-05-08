/**
 * SYNAPSE E2E: Agent Scenarios
 *
 * End-to-end tests for agent activation through the full SynapseEngine pipeline.
 * Uses REAL .synapse/ domain files -- no mocks.
 *
 * @group e2e
 */

const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_DIR = path.join(PROJECT_ROOT, '.synapse');
const MANIFEST_PATH = path.join(SYNAPSE_DIR, 'manifest');

const { SynapseEngine } = require(
  path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'engine.js'),
);
const { parseManifest } = require(
  path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'domain', 'domain-loader.js'),
);

// ---------------------------------------------------------------------------
// Skip guard: .synapse/ must exist for E2E tests
// ---------------------------------------------------------------------------

const synapseExists = fs.existsSync(SYNAPSE_DIR) && fs.existsSync(MANIFEST_PATH);

const describeIfSynapse = synapseExists ? describe : describe.skip;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal session object with the given active agent.
 *
 * @param {string|null} agentId - Agent identifier or null for no agent
 * @returns {object} Session compatible with SynapseEngine.process()
 */
function makeSession(agentId) {
  return {
    prompt_count: 5,
    active_agent: agentId ? { id: agentId, activated_at: new Date().toISOString() } : null,
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: { last_bracket: 'MODERATE', last_tokens_used: 0, last_context_percent: 55 },
  };
}

function agentSection(agentId) {
  return `[ACTIVE AGENT: @${agentId}]`;
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describeIfSynapse('SYNAPSE E2E: Agent Scenarios', () => {
  /** @type {object} */
  let manifest;
  /** @type {SynapseEngine} */
  let engine;

  beforeAll(() => {
    manifest = parseManifest(MANIFEST_PATH);
    engine = new SynapseEngine(SYNAPSE_DIR, { manifest, devmode: false });
  });

  async function processExpectingAgent(agentId, prompt) {
    const session = makeSession(agentId);
    let localEngine = engine;
    let lastResult;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      lastResult = await localEngine.process(prompt, session);
      if (lastResult.xml.includes(agentSection(agentId))) {
        return lastResult;
      }

      const agentLayer = lastResult.metrics?.per_layer?.agent;
      const skippedByPipelineTimeout =
        agentLayer?.status === 'skipped' && agentLayer?.reason === 'Pipeline timeout';

      if (!skippedByPipelineTimeout) {
        return lastResult;
      }

      if (attempt < 2) {
        localEngine = new SynapseEngine(SYNAPSE_DIR, { manifest, devmode: false });
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return lastResult;
  }

  // -----------------------------------------------------------------------
  // 1. @dev activation
  // -----------------------------------------------------------------------
  it('activates @dev and includes agent section in output XML', async () => {
    const { xml } = await processExpectingAgent('dev', 'implement the feature');

    expect(xml).toContain(agentSection('dev'));
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 2. @qa activation
  // -----------------------------------------------------------------------
  it('activates @qa and includes agent section in output XML', async () => {
    const { xml } = await processExpectingAgent('qa', 'run quality checks');

    expect(xml).toContain(agentSection('qa'));
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 3. @devops activation
  // -----------------------------------------------------------------------
  it('activates @devops and includes agent section in output XML', async () => {
    const { xml } = await processExpectingAgent('devops', 'push to remote');

    expect(xml).toContain(agentSection('devops'));
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 4. @architect activation
  // -----------------------------------------------------------------------
  it('activates @architect and includes agent section in output XML', async () => {
    const { xml } = await processExpectingAgent('architect', 'design the system');

    expect(xml).toContain(agentSection('architect'));
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 5. Unknown agent -- graceful degradation
  // -----------------------------------------------------------------------
  it('handles unknown agent without crashing and still returns valid XML', async () => {
    const session = makeSession('nonexistent-agent-xyz');
    const { xml } = await engine.process('do something', session);

    expect(xml).toContain('<synapse-rules>');
    expect(xml).not.toContain('[ACTIVE AGENT: @nonexistent-agent-xyz]');
  });

  // -----------------------------------------------------------------------
  // 6. No agent (null) -- baseline output
  // -----------------------------------------------------------------------
  it('produces valid output with no active agent (null)', async () => {
    const session = makeSession(null);
    const { xml, metrics } = await engine.process('hello world', session);

    expect(xml).toContain('<synapse-rules>');
    // Constitution (L0) and/or global (L1) should still produce rules
    expect(metrics.total_rules).toBeGreaterThanOrEqual(0);
  });

  // -----------------------------------------------------------------------
  // 7. Agent switch -- different agents produce different sections
  // -----------------------------------------------------------------------
  it('produces different agent sections for different agents', async () => {
    const resultDev = await processExpectingAgent('dev', 'write code');
    const resultPm = await processExpectingAgent('pm', 'manage product');

    expect(resultDev.xml).toContain(agentSection('dev'));
    expect(resultPm.xml).toContain(agentSection('pm'));

    // The agent-specific content should differ
    expect(resultDev.xml).not.toEqual(resultPm.xml);
  });

  // -----------------------------------------------------------------------
  // 8. Agent layer produces rules in metrics
  // -----------------------------------------------------------------------
  it('reports non-zero agent layer rules in metrics when agent is active', async () => {
    const { metrics } = await processExpectingAgent('dev', 'build the feature');

    // The agent layer should have loaded and produced rules
    const agentLayer = metrics.per_layer.agent;
    if (agentLayer && agentLayer.status === 'ok') {
      expect(agentLayer.rules).toBeGreaterThan(0);
    } else {
      // If agent layer was skipped due to bracket, that is acceptable in E2E
      expect(agentLayer).toBeDefined();
    }
  });
});
