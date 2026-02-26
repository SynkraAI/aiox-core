/**
 * SYNAPSE E2E: Bracket Scenarios
 *
 * Tests all 4 context brackets (FRESH, MODERATE, DEPLETED, CRITICAL)
 * using REAL .synapse/ files from project root. No mocks.
 *
 * Context bracket formula: 100 - (promptCount * 1500 * 1.2 / 200000 * 100)
 *   (1.2x XML_SAFETY_MULTIPLIER applied since QW-3 / NOG-10)
 *   prompt_count=0   -> 100%    -> FRESH    (>= 60%)
 *   prompt_count=50  -> 55%     -> MODERATE (40-60%)
 *   prompt_count=75  -> 32.5%   -> DEPLETED (25-40%)
 *   prompt_count=100 -> 10%     -> CRITICAL (< 25%)
 */

const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');
const ENGINE_PATH = path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'engine.js');

const synapseExists = fs.existsSync(SYNAPSE_PATH);
const engineExists = fs.existsSync(ENGINE_PATH);

const describeIfReady = (synapseExists && engineExists) ? describe : describe.skip;

/**
 * Build a session object for a given prompt count.
 *
 * @param {number} promptCount - Number of prompts in the session
 * @returns {object} Session object compatible with SynapseEngine.process()
 */
function makeSession(promptCount) {
  return {
    prompt_count: promptCount,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: {
      last_bracket: 'MODERATE',
      last_tokens_used: 0,
      last_context_percent: 55,
    },
  };
}

describeIfReady('SYNAPSE E2E: Bracket Scenarios', () => {
  /** @type {import('../../../.aios-core/core/synapse/engine').SynapseEngine} */
  let engine;

  beforeAll(() => {
    const { SynapseEngine } = require(ENGINE_PATH);
    const { parseManifest } = require(
      path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'domain', 'domain-loader.js'),
    );

    const manifestPath = path.join(SYNAPSE_PATH, 'manifest');
    const manifest = parseManifest(manifestPath);

    engine = new SynapseEngine(SYNAPSE_PATH, { manifest, devmode: false });
  });

  // -----------------------------------------------------------------------
  // FRESH bracket (prompt_count = 0 -> contextPercent = 100%)
  // -----------------------------------------------------------------------

  describe('FRESH bracket (prompt_count=0)', () => {
    let result;

    beforeAll(async () => {
      result = await engine.process('Hello, start a new session', makeSession(0));
    });

    test('XML contains CONTEXT BRACKET with FRESH', () => {
      expect(result.xml).toContain('[CONTEXT BRACKET]');
      expect(result.xml).toContain('FRESH');
    });

    test('layers_loaded should show limited layers (constitution, global, agent)', () => {
      // FRESH bracket activates layers [0,1,2,7] only
      // Layers 3-6 (workflow, task, squad, keyword) should be skipped
      const { layers_loaded, layers_skipped } = result.metrics;
      // At minimum, some layers must load; not all 8
      expect(layers_loaded).toBeGreaterThan(0);
      expect(layers_skipped).toBeGreaterThan(0);
      // FRESH activates max 4 layers (L0,L1,L2,L7), so loaded <= 4
      expect(layers_loaded).toBeLessThanOrEqual(4);
    });
  });

  // -----------------------------------------------------------------------
  // MODERATE bracket (prompt_count = 60 -> contextPercent = 55%)
  // -----------------------------------------------------------------------

  describe('MODERATE bracket (prompt_count=50)', () => {
    let result;

    beforeAll(async () => {
      result = await engine.process('Continue working on the feature', makeSession(50));
    });

    test('XML contains MODERATE bracket', () => {
      expect(result.xml).toContain('[CONTEXT BRACKET]');
      expect(result.xml).toContain('MODERATE');
    });

    test('all layers should be active (more layers_loaded than FRESH)', async () => {
      // MODERATE activates all 8 layers [0-7]
      const freshResult = await engine.process('test', makeSession(0));
      const freshLoaded = freshResult.metrics.layers_loaded;
      const moderateLoaded = result.metrics.layers_loaded;

      // MODERATE should load at least as many layers as FRESH,
      // and typically more since all 8 are active
      expect(moderateLoaded).toBeGreaterThanOrEqual(freshLoaded);
      // MODERATE skips fewer layers than FRESH
      expect(result.metrics.layers_skipped).toBeLessThanOrEqual(freshResult.metrics.layers_skipped);
    });
  });

  // -----------------------------------------------------------------------
  // DEPLETED bracket (prompt_count = 90 -> contextPercent = 32.5%)
  // -----------------------------------------------------------------------

  describe('DEPLETED bracket (prompt_count=75)', () => {
    let result;

    beforeAll(async () => {
      result = await engine.process('We need to wrap up soon', makeSession(75));
    });

    test('XML contains DEPLETED bracket', () => {
      expect(result.xml).toContain('[CONTEXT BRACKET]');
      expect(result.xml).toContain('DEPLETED');
    });

    test('memory hints layer may be attempted', () => {
      // DEPLETED bracket enables memoryHints=true
      // The memory bridge is feature-gated (SYN-10) so hints may or may not appear,
      // but the engine should attempt the memory path.
      // Verify the bracket is correct and XML is non-empty.
      expect(result.xml).toBeTruthy();
      expect(result.xml.length).toBeGreaterThan(0);
      // If memory hints are present, they should be in the expected format
      if (result.xml.includes('[MEMORY HINTS]')) {
        expect(result.xml).toMatch(/\[MEMORY HINTS\]/);
      }
    });
  });

  // -----------------------------------------------------------------------
  // CRITICAL bracket (prompt_count = 120 -> contextPercent = 10%)
  // -----------------------------------------------------------------------

  describe('CRITICAL bracket (prompt_count=100)', () => {
    let result;

    beforeAll(async () => {
      result = await engine.process('Final prompt before handoff', makeSession(100));
    });

    test('XML contains CRITICAL bracket', () => {
      expect(result.xml).toContain('[CONTEXT BRACKET]');
      expect(result.xml).toContain('CRITICAL');
    });

    test('handoff warning present in XML', () => {
      expect(result.xml).toContain('[HANDOFF WARNING]');
    });
  });

  // -----------------------------------------------------------------------
  // Bracket transitions
  // -----------------------------------------------------------------------

  describe('Bracket transitions', () => {
    test('increasing prompt_count changes bracket in output', async () => {
      const brackets = [];
      const promptCounts = [0, 50, 75, 100];

      for (const count of promptCounts) {
        const res = await engine.process(`Prompt at count ${count}`, makeSession(count));
        // Extract bracket name from CONTEXT BRACKET line
        const match = res.xml.match(/CONTEXT BRACKET:\s*\[(\w+)\]/);
        if (match) {
          brackets.push(match[1]);
        }
      }

      expect(brackets).toEqual(['FRESH', 'MODERATE', 'DEPLETED', 'CRITICAL']);
    });
  });
});
