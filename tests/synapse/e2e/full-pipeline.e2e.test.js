/**
 * SYNAPSE E2E: Full Pipeline
 *
 * End-to-end tests for the SYNAPSE context engine pipeline.
 * Uses REAL .synapse/ files at project root — no mocks.
 *
 * @module tests/synapse/e2e/full-pipeline.e2e.test
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
 * @param {object} [overrides] - Fields to override
 * @returns {object} Session object matching SYN-2 schema
 */
function buildSession(overrides = {}) {
  return {
    prompt_count: 5,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: {
      last_bracket: 'FRESH',
      last_tokens_used: 0,
      last_context_percent: 96,
    },
    ...overrides,
  };
}

const describeIfSynapse = synapseExists ? describe : describe.skip;

describeIfSynapse('SYNAPSE E2E: Full Pipeline', () => {
  /** @type {object} */
  let manifest;

  /** @type {SynapseEngine} */
  let engine;

  /** @type {SynapseEngine} */
  let engineDevmode;

  beforeAll(() => {
    manifest = parseManifest(MANIFEST_PATH);

    engine = new SynapseEngine(SYNAPSE_PATH, {
      manifest,
      devmode: false,
    });

    engineDevmode = new SynapseEngine(SYNAPSE_PATH, {
      manifest,
      devmode: true,
    });
  });

  // -----------------------------------------------------------------------
  // 1. Engine processes prompt and returns xml string
  // -----------------------------------------------------------------------
  test('processes a prompt and returns an object with xml string and metrics', async () => {
    const session = buildSession();
    const result = await engine.process('Implement the login feature', session);

    expect(result).toBeDefined();
    expect(typeof result.xml).toBe('string');
    expect(result.xml.length).toBeGreaterThan(0);
    expect(result.metrics).toBeDefined();
    expect(typeof result.metrics).toBe('object');
  });

  // -----------------------------------------------------------------------
  // 2. XML contains <synapse-rules> wrapper tags
  // -----------------------------------------------------------------------
  test('XML output is wrapped in <synapse-rules> tags', async () => {
    const session = buildSession();
    const { xml } = await engine.process('Build the dashboard component', session);

    expect(xml).toMatch(/^<synapse-rules>/);
    expect(xml).toMatch(/<\/synapse-rules>$/);
  });

  // -----------------------------------------------------------------------
  // 3. XML contains CONTEXT BRACKET section
  // -----------------------------------------------------------------------
  test('XML contains CONTEXT BRACKET section with bracket name and percentage', async () => {
    const session = buildSession({ prompt_count: 5 });
    const { xml } = await engine.process('Create a new service', session);

    expect(xml).toContain('[CONTEXT BRACKET]');
    expect(xml).toContain('CONTEXT BRACKET:');
    // With prompt_count=5, contextPercent = 100 - (5*1500/200000*100) = 96.25 -> FRESH
    expect(xml).toContain('[FRESH]');
  });

  // -----------------------------------------------------------------------
  // 4. XML contains CONSTITUTION section (NON-NEGOTIABLE)
  // -----------------------------------------------------------------------
  test('XML contains CONSTITUTION section marked as NON-NEGOTIABLE', async () => {
    const session = buildSession();
    const { xml } = await engine.process('Refactor the auth module', session);

    // The constitution layer is ALWAYS_ON and NON_NEGOTIABLE per manifest
    expect(xml).toContain('[CONSTITUTION]');
    expect(xml).toContain('NON-NEGOTIABLE');
  });

  // -----------------------------------------------------------------------
  // 5. Metrics contains expected structure
  // -----------------------------------------------------------------------
  test('metrics object contains total_ms, layers_loaded, total_rules, and per_layer', async () => {
    const session = buildSession();
    const { metrics } = await engine.process('Add unit tests', session);

    expect(metrics).toHaveProperty('total_ms');
    expect(typeof metrics.total_ms).toBe('number');
    expect(metrics.total_ms).toBeGreaterThanOrEqual(0);

    expect(metrics).toHaveProperty('layers_loaded');
    expect(typeof metrics.layers_loaded).toBe('number');

    expect(metrics).toHaveProperty('layers_skipped');
    expect(typeof metrics.layers_skipped).toBe('number');

    expect(metrics).toHaveProperty('layers_errored');
    expect(typeof metrics.layers_errored).toBe('number');

    expect(metrics).toHaveProperty('total_rules');
    expect(typeof metrics.total_rules).toBe('number');

    expect(metrics).toHaveProperty('per_layer');
    expect(typeof metrics.per_layer).toBe('object');

    // At minimum, some layers should have loaded
    expect(metrics.layers_loaded).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------
  // 6. Engine handles session with active agent (AGENT section)
  // -----------------------------------------------------------------------
  test('includes ACTIVE AGENT section when session has an active agent', async () => {
    const session = buildSession({
      active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    });
    const { xml } = await engine.process('Fix the broken endpoint', session);

    // Agent layer (L2) should produce an ACTIVE AGENT section for @dev
    expect(xml).toContain('[ACTIVE AGENT:');
    expect(xml).toContain('@dev');
  });

  // -----------------------------------------------------------------------
  // 7. DEVMODE=true includes DEVMODE STATUS section
  // -----------------------------------------------------------------------
  test('DEVMODE=true includes DEVMODE STATUS section in output', async () => {
    // Use CRITICAL bracket (high token budget: 2500) so DEVMODE section is not truncated
    const session = buildSession({
      prompt_count: 140,
      context: { last_bracket: 'CRITICAL', last_tokens_used: 0, last_context_percent: 0 },
    });
    const { xml } = await engineDevmode.process('Debug the pipeline', session);

    expect(xml).toContain('[DEVMODE STATUS]');
    expect(xml).toContain('SYNAPSE DEVMODE');
    expect(xml).toContain('Pipeline Metrics:');
  });

  // -----------------------------------------------------------------------
  // 8. DEVMODE=false does NOT include DEVMODE STATUS section
  // -----------------------------------------------------------------------
  test('DEVMODE=false does NOT include DEVMODE STATUS section', async () => {
    const session = buildSession();
    const { xml } = await engine.process('Implement feature flag', session);

    expect(xml).not.toContain('[DEVMODE STATUS]');
    expect(xml).not.toContain('SYNAPSE DEVMODE');
  });

  // -----------------------------------------------------------------------
  // 9. Multiple consecutive calls produce consistent results
  // -----------------------------------------------------------------------
  test('multiple consecutive calls produce consistent results', async () => {
    const session = buildSession();
    const prompt = 'Create the notification service';

    const result1 = await engine.process(prompt, session);
    const result2 = await engine.process(prompt, session);

    // Both should have valid xml output
    expect(result1.xml.length).toBeGreaterThan(0);
    expect(result2.xml.length).toBeGreaterThan(0);

    // Same prompt + session should yield same bracket and sections
    expect(result1.xml).toContain('[CONTEXT BRACKET]');
    expect(result2.xml).toContain('[CONTEXT BRACKET]');

    // Both should contain the same bracket designation
    const bracketMatch1 = result1.xml.match(/CONTEXT BRACKET: \[(\w+)\]/);
    const bracketMatch2 = result2.xml.match(/CONTEXT BRACKET: \[(\w+)\]/);
    expect(bracketMatch1).not.toBeNull();
    expect(bracketMatch2).not.toBeNull();
    expect(bracketMatch1[1]).toBe(bracketMatch2[1]);

    // Metrics structure should be consistent
    expect(result1.metrics.layers_loaded).toBe(result2.metrics.layers_loaded);
  });

  // -----------------------------------------------------------------------
  // 10. Engine handles empty prompt gracefully
  // -----------------------------------------------------------------------
  test('handles empty prompt gracefully without throwing', async () => {
    const session = buildSession();

    // Should not throw
    const resultEmpty = await engine.process('', session);
    expect(resultEmpty).toBeDefined();
    expect(typeof resultEmpty.xml).toBe('string');
    expect(resultEmpty.metrics).toBeDefined();

    // Should also handle null/undefined prompt
    const resultNull = await engine.process(null, session);
    expect(resultNull).toBeDefined();
    expect(typeof resultNull.xml).toBe('string');
    expect(resultNull.metrics).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // 11. LOADED DOMAINS SUMMARY section is present (uses CRITICAL for higher token budget)
  // -----------------------------------------------------------------------
  test('XML contains LOADED DOMAINS SUMMARY section', async () => {
    // FRESH bracket has low token budget (800) which may truncate SUMMARY.
    // Use CRITICAL bracket (2500 token budget) to ensure SUMMARY survives.
    const session = buildSession({
      prompt_count: 140,
      context: { last_bracket: 'CRITICAL', last_tokens_used: 0, last_context_percent: 0 },
    });
    const { xml } = await engine.process('Deploy the application', session);

    expect(xml).toContain('[LOADED DOMAINS SUMMARY]');
    expect(xml).toContain('LOADED DOMAINS:');
  });

  // -----------------------------------------------------------------------
  // 12. CRITICAL bracket triggers HANDOFF WARNING
  // -----------------------------------------------------------------------
  test('CRITICAL bracket includes HANDOFF WARNING section', async () => {
    // prompt_count > 133 gives contextPercent < 0 which maps to CRITICAL
    // contextPercent = 100 - (140 * 1500 / 200000 * 100) = 100 - 105 = -5
    const session = buildSession({
      prompt_count: 140,
      context: { last_bracket: 'CRITICAL', last_tokens_used: 0, last_context_percent: 0 },
    });
    const { xml } = await engine.process('Save progress', session);

    expect(xml).toContain('[HANDOFF WARNING]');
  });
});
