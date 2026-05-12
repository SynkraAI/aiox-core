/**
 * SYNAPSE E2E: DEVMODE Scenarios
 *
 * End-to-end tests for the DEVMODE diagnostic output in the SYNAPSE context engine.
 * Uses REAL .synapse/ files at project root -- no mocks.
 *
 * Validates that:
 * - DEVMODE=false (default) produces NO diagnostic section
 * - DEVMODE=true (via constructor or per-call override) includes the full
 *   [DEVMODE STATUS] section with bracket, layers, session, and pipeline metrics
 *
 * @module tests/synapse/e2e/devmode-scenarios.e2e.test
 */

const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');
const MANIFEST_PATH = path.join(SYNAPSE_PATH, 'manifest');

// Guard: skip entire suite if .synapse/ is missing
const synapseExists = fs.existsSync(SYNAPSE_PATH) && fs.existsSync(MANIFEST_PATH);

const { SynapseEngine } = require(path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'engine.js'));
const { parseManifest } = require(path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'domain', 'domain-loader.js'));

/**
 * Build a default session object for testing.
 *
 * Uses prompt_count=60 to land in MODERATE bracket (~55% remaining, 1500 token
 * budget) which has sufficient headroom for the DEVMODE section after token
 * budget enforcement. FRESH bracket (prompt_count<=7) only allows 800 tokens,
 * which is not enough for constitution + global rules + DEVMODE combined.
 *
 * @param {object} [overrides] - Fields to override
 * @returns {object} Session object matching SYN-2 schema
 */
function buildSession(overrides = {}) {
  return {
    prompt_count: 60,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: {
      last_bracket: 'MODERATE',
      last_tokens_used: 0,
      last_context_percent: 55,
    },
    ...overrides,
  };
}

const describeIfSynapse = synapseExists ? describe : describe.skip;

describeIfSynapse('SYNAPSE E2E: DEVMODE Scenarios', () => {
  /** @type {object} */
  let manifest;

  /** @type {SynapseEngine} Engine with devmode OFF (default) */
  let engineDefault;

  /** @type {SynapseEngine} Engine with devmode ON via constructor */
  let engineDevmode;

  beforeAll(() => {
    manifest = parseManifest(MANIFEST_PATH);

    engineDefault = new SynapseEngine(SYNAPSE_PATH, {
      manifest,
      devmode: false,
    });

    engineDevmode = new SynapseEngine(SYNAPSE_PATH, {
      manifest,
      devmode: true,
    });
  });

  // -----------------------------------------------------------------------
  // 1. DEVMODE=false (default): output does NOT contain [DEVMODE STATUS]
  // -----------------------------------------------------------------------
  test('DEVMODE=false: output does NOT contain [DEVMODE STATUS]', async () => {
    const session = buildSession();
    const result = await engineDefault.process('Implement user authentication', session);

    expect(result).toBeDefined();
    expect(typeof result.xml).toBe('string');
    expect(result.xml).not.toContain('[DEVMODE STATUS]');
    expect(result.xml).not.toContain('SYNAPSE DEVMODE');
  });

  // -----------------------------------------------------------------------
  // 2. DEVMODE=true via constructor: output contains [DEVMODE STATUS]
  // -----------------------------------------------------------------------
  test('DEVMODE=true via constructor: output contains [DEVMODE STATUS]', async () => {
    const session = buildSession();
    const result = await engineDevmode.process('Implement user authentication', session);

    expect(result).toBeDefined();
    expect(typeof result.xml).toBe('string');
    expect(result.xml).toContain('[DEVMODE STATUS]');
  });

  // -----------------------------------------------------------------------
  // 3. DEVMODE=true: output contains SYNAPSE DEVMODE text
  // -----------------------------------------------------------------------
  test('DEVMODE=true: output contains SYNAPSE DEVMODE header text', async () => {
    const session = buildSession();
    const result = await engineDevmode.process('Create the database schema', session);

    expect(result.xml).toContain('SYNAPSE DEVMODE');
  });

  // -----------------------------------------------------------------------
  // 4. DEVMODE=true: output contains Layers Loaded section
  // -----------------------------------------------------------------------
  test('DEVMODE=true: output contains Layers Loaded section', async () => {
    const session = buildSession();
    const result = await engineDevmode.process('Refactor the API endpoints', session);

    expect(result.xml).toContain('Layers Loaded:');
  });

  // -----------------------------------------------------------------------
  // 5. DEVMODE=true: output contains Pipeline Metrics section
  // -----------------------------------------------------------------------
  test('DEVMODE=true: output contains Pipeline Metrics section', async () => {
    const session = buildSession();
    const result = await engineDevmode.process('Add unit tests for the service layer', session);

    expect(result.xml).toContain('Pipeline Metrics:');
  });

  // -----------------------------------------------------------------------
  // 6. DEVMODE=true: metrics object has valid structure
  // -----------------------------------------------------------------------
  test('DEVMODE=true: metrics object has valid structure with expected fields', async () => {
    const session = buildSession();
    const result = await engineDevmode.process('Optimize query performance', session);

    expect(result.metrics).toBeDefined();
    expect(typeof result.metrics.total_ms).toBe('number');
    expect(result.metrics.total_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.metrics.layers_loaded).toBe('number');
    expect(typeof result.metrics.layers_skipped).toBe('number');
    expect(typeof result.metrics.layers_errored).toBe('number');
    expect(typeof result.metrics.total_rules).toBe('number');
    expect(result.metrics.per_layer).toBeDefined();
    expect(typeof result.metrics.per_layer).toBe('object');
  });

  // -----------------------------------------------------------------------
  // 7. DEVMODE per-call override: processConfig { devmode: true } enables
  //    DEVMODE even when engine was constructed without it
  // -----------------------------------------------------------------------
  test('per-call override: processConfig { devmode: true } shows DEVMODE section on non-devmode engine', async () => {
    const session = buildSession();

    // Confirm engine default does NOT produce DEVMODE output
    const resultOff = await engineDefault.process('Setup CI pipeline', session);
    expect(resultOff.xml).not.toContain('[DEVMODE STATUS]');

    // Same engine, but with per-call devmode override
    const resultOn = await engineDefault.process('Setup CI pipeline', session, { devmode: true });
    expect(resultOn.xml).toContain('[DEVMODE STATUS]');
    expect(resultOn.xml).toContain('SYNAPSE DEVMODE');
    expect(resultOn.xml).toContain('Layers Loaded:');
    expect(resultOn.xml).toContain('Pipeline Metrics:');
  });
});
