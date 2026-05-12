/**
 * Consistency Collector — Cross-validates UAP and Hook metrics for coherence.
 *
 * Performs 4 consistency checks between the two pipeline metrics files:
 * 1. Bracket consistency — Hook bracket matches expected for session state
 * 2. Agent consistency — UAP agentId matches Hook session active_agent
 * 3. Timestamp consistency — Both metrics from same activation window
 * 4. Quality consistency — UAP quality aligns with Hook layer count
 *
 * @module core/synapse/diagnostics/collectors/consistency-collector
 * @version 1.0.0
 * @created Story SYN-14
 */

'use strict';

const path = require('path');
const { safeReadJson } = require('./safe-read-json');

/** Maximum time gap (ms) between UAP and Hook timestamps to be considered consistent.
 * UAP writes once at activation; Hook writes every prompt. Gaps of several minutes are normal.
 */
const MAX_TIMESTAMP_GAP_MS = 10 * 60 * 1000;

/**
 * Collect cross-pipeline consistency checks.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{
 *   available: boolean,
 *   checks: Array<{ name: string, status: string, detail: string }>,
 *   score: number,
 *   maxScore: number
 * }}
 */
function collectConsistencyMetrics(projectRoot) {
  const metricsDir = path.join(projectRoot, '.synapse', 'metrics');

  const uapData = safeReadJson(path.join(metricsDir, 'uap-metrics.json'));
  const hookData = safeReadJson(path.join(metricsDir, 'hook-metrics.json'));

  if (!uapData && !hookData) {
    return { available: false, checks: [], score: 0, maxScore: 0 };
  }

  // If only one side exists, partial consistency is possible
  if (!uapData || !hookData) {
    return {
      available: true,
      checks: [{
        name: 'data-completeness',
        status: 'WARN',
        detail: !uapData ? 'UAP metrics missing — only Hook available' : 'Hook metrics missing — only UAP available',
      }],
      score: 0,
      maxScore: 4,
    };
  }

  const checks = [];
  let score = 0;
  const maxScore = 4;

  // Check 1: Bracket consistency
  const bracketCheck = _checkBracket(hookData);
  checks.push(bracketCheck);
  if (bracketCheck.status === 'PASS') score++;

  // Check 2: Agent consistency
  const agentCheck = _checkAgent(uapData, projectRoot);
  checks.push(agentCheck);
  if (agentCheck.status === 'PASS') score++;

  // Check 3: Timestamp consistency
  const timestampCheck = _checkTimestamp(uapData, hookData);
  checks.push(timestampCheck);
  if (timestampCheck.status === 'PASS') score++;

  // Check 4: Quality consistency
  const qualityCheck = _checkQuality(uapData, hookData);
  checks.push(qualityCheck);
  if (qualityCheck.status === 'PASS') score++;

  return { available: true, checks, score, maxScore };
}

/**
 * Check 1: Bracket is a known value.
 * @param {Object} hookData
 * @returns {{ name: string, status: string, detail: string }}
 */
function _checkBracket(hookData) {
  const validBrackets = ['FRESH', 'MODERATE', 'DEPLETED', 'CRITICAL'];
  const bracket = hookData.bracket;
  if (validBrackets.includes(bracket)) {
    return { name: 'bracket', status: 'PASS', detail: `Hook bracket: ${bracket}` };
  }
  return { name: 'bracket', status: 'FAIL', detail: `Unknown bracket: ${bracket || 'undefined'}` };
}

/**
 * Check 2: UAP agentId matches _active-agent.json bridge file.
 * @param {Object} uapData
 * @param {string} projectRoot
 * @returns {{ name: string, status: string, detail: string }}
 */
function _checkAgent(uapData, projectRoot) {
  const bridgePath = path.join(projectRoot, '.synapse', 'sessions', '_active-agent.json');
  const bridgeData = safeReadJson(bridgePath);

  if (!bridgeData || !bridgeData.id) {
    return { name: 'agent', status: 'WARN', detail: 'No active-agent bridge file found' };
  }
  if (uapData.agentId === bridgeData.id) {
    return { name: 'agent', status: 'PASS', detail: `Agent match: ${uapData.agentId}` };
  }
  return {
    name: 'agent',
    status: 'FAIL',
    detail: `UAP agent (${uapData.agentId}) != bridge agent (${bridgeData.id})`,
  };
}

/**
 * Check 3: UAP and Hook timestamps are within MAX_TIMESTAMP_GAP_MS.
 * @param {Object} uapData
 * @param {Object} hookData
 * @returns {{ name: string, status: string, detail: string }}
 */
function _checkTimestamp(uapData, hookData) {
  if (!uapData.timestamp || !hookData.timestamp) {
    return { name: 'timestamp', status: 'WARN', detail: 'Missing timestamp in one or both metrics' };
  }
  const gap = Math.abs(new Date(uapData.timestamp).getTime() - new Date(hookData.timestamp).getTime());
  if (gap <= MAX_TIMESTAMP_GAP_MS) {
    return { name: 'timestamp', status: 'PASS', detail: `Gap: ${Math.round(gap / 1000)}s (within ${MAX_TIMESTAMP_GAP_MS / 1000}s)` };
  }
  return {
    name: 'timestamp',
    status: 'FAIL',
    detail: `Gap: ${Math.round(gap / 1000)}s (exceeds ${MAX_TIMESTAMP_GAP_MS / 1000}s threshold)`,
  };
}

/**
 * Check 4: UAP quality aligns with Hook layer count.
 * 'full' quality should have layers loaded; 'fallback' may have zero.
 * @param {Object} uapData
 * @param {Object} hookData
 * @returns {{ name: string, status: string, detail: string }}
 */
function _checkQuality(uapData, hookData) {
  const quality = uapData.quality;
  const layersLoaded = hookData.layersLoaded || 0;

  if (quality === 'fallback' && layersLoaded > 0) {
    return { name: 'quality', status: 'PASS', detail: `UAP fallback but Hook loaded ${layersLoaded} layers (Hook independent)` };
  }
  if (quality === 'full' && layersLoaded === 0) {
    return { name: 'quality', status: 'WARN', detail: 'UAP full quality but Hook loaded 0 layers' };
  }
  if (quality === 'full' && layersLoaded > 0) {
    return { name: 'quality', status: 'PASS', detail: `UAP ${quality}, Hook ${layersLoaded} layers` };
  }
  return { name: 'quality', status: 'PASS', detail: `UAP ${quality || 'unknown'}, Hook ${layersLoaded} layers` };
}

module.exports = { collectConsistencyMetrics, MAX_TIMESTAMP_GAP_MS };
