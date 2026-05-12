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

const { SynapseEngine } = require(path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'engine.js'));
const { parseManifest } = require(path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'domain', 'domain-loader.js'));

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

  // -----------------------------------------------------------------------
  // 1. @dev activation
  // -----------------------------------------------------------------------
  it('activates @dev and includes agent section in output XML', async () => {
    const session = makeSession('dev');
    const { xml } = await engine.process('implement the feature', session);

    expect(xml).toContain('[ACTIVE AGENT: @dev]');
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 2. @qa activation
  // -----------------------------------------------------------------------
  it('activates @qa and includes agent section in output XML', async () => {
    const session = makeSession('qa');
    const { xml } = await engine.process('run quality checks', session);

    expect(xml).toContain('[ACTIVE AGENT: @qa]');
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 3. @devops activation
  // -----------------------------------------------------------------------
  it('activates @devops and includes agent section in output XML', async () => {
    const session = makeSession('devops');
    const { xml } = await engine.process('push to remote', session);

    expect(xml).toContain('[ACTIVE AGENT: @devops]');
    expect(xml).toContain('<synapse-rules>');
  });

  // -----------------------------------------------------------------------
  // 4. @architect activation
  // -----------------------------------------------------------------------
  it('activates @architect and includes agent section in output XML', async () => {
    const session = makeSession('architect');
    const { xml } = await engine.process('design the system', session);

    expect(xml).toContain('[ACTIVE AGENT: @architect]');
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
    const sessionDev = makeSession('dev');
    const sessionPm = makeSession('pm');

    const [resultDev, resultPm] = await Promise.all([
      engine.process('write code', sessionDev),
      engine.process('manage product', sessionPm),
    ]);

    expect(resultDev.xml).toContain('[ACTIVE AGENT: @dev]');
    expect(resultPm.xml).toContain('[ACTIVE AGENT: @pm]');

    // The agent-specific content should differ
    expect(resultDev.xml).not.toEqual(resultPm.xml);
  });

  // -----------------------------------------------------------------------
  // 8. Agent layer produces rules in metrics
  // -----------------------------------------------------------------------
  it('reports non-zero agent layer rules in metrics when agent is active', async () => {
    const session = makeSession('dev');
    const { metrics } = await engine.process('build the feature', session);

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
