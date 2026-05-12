/**
 * Pipeline Collector — Simulates engine pipeline for expected vs. actual comparison.
 *
 * Calculates which layers should be active for the current bracket
 * and compares against what was actually loaded.
 *
 * @module core/synapse/diagnostics/collectors/pipeline-collector
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const {
  estimateContextPercent,
  calculateBracket,
  getActiveLayers,
} = require('../../context/context-tracker');

const LAYER_NAMES = {
  0: 'L0 Constitution',
  1: 'L1 Global',
  2: 'L2 Agent',
  3: 'L3 Workflow',
  4: 'L4 Task',
  5: 'L5 Squad',
  6: 'L6 Keyword',
  7: 'L7 Star-Command',
};

/**
 * Collect pipeline simulation data.
 *
 * @param {number} promptCount - Current prompt count from session
 * @param {string|null} activeAgentId - Active agent ID (for L2 match check)
 * @param {object} manifest - Parsed manifest object
 * @returns {{ bracket: string, contextPercent: number, layers: Array<{ layer: string, expected: string, status: string }> }}
 */
function collectPipelineSimulation(promptCount, activeAgentId, manifest) {
  const contextPercent = estimateContextPercent(promptCount || 0);
  const bracket = calculateBracket(contextPercent);
  const layerConfig = getActiveLayers(bracket);

  const activeLayers = layerConfig ? layerConfig.layers : [];
  const layers = [];

  for (let i = 0; i <= 7; i++) {
    const layerName = LAYER_NAMES[i] || `L${i}`;
    const isActive = activeLayers.includes(i);

    let expected = isActive ? 'ACTIVE' : `SKIP (${bracket})`;
    let status = 'PASS';

    // For L2, check if active agent has a matching domain
    if (i === 2 && isActive && activeAgentId) {
      const domains = manifest?.domains || {};
      const hasMatchingDomain = Object.values(domains).some(
        (d) => d.agentTrigger === activeAgentId,
      );

      if (hasMatchingDomain) {
        expected = `ACTIVE (agent: ${activeAgentId})`;
      } else {
        expected = `ACTIVE (no domain for ${activeAgentId})`;
        status = 'WARN';
      }
    }

    layers.push({ layer: layerName, expected, status });
  }

  return { bracket, contextPercent, layers };
}

module.exports = { collectPipelineSimulation };
