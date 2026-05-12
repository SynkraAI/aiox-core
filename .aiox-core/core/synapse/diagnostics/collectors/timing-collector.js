/**
 * Timing Collector — Reads persisted UAP and Hook metrics for diagnostics.
 *
 * Reads `.synapse/metrics/uap-metrics.json` and `.synapse/metrics/hook-metrics.json`
 * written by the UAP activation pipeline and SynapseEngine respectively.
 *
 * @module core/synapse/diagnostics/collectors/timing-collector
 * @version 1.0.0
 * @created Story SYN-12
 */

'use strict';

const path = require('path');
const { safeReadJson } = require('./safe-read-json');

/**
 * Loader tier mapping for UAP loaders.
 * @type {Object.<string, string>}
 */
/** Maximum staleness threshold in ms (5 minutes). Data older than this is WARN. */
const MAX_STALENESS_MS = 5 * 60 * 1000;

const LOADER_TIER_MAP = {
  agentConfig: 'Critical',
  permissionMode: 'High',
  gitConfig: 'High',
  sessionContext: 'Best-effort',
  projectStatus: 'Best-effort',
  memories: 'Pro',
  synapseSession: 'Bridge',
};

/**
 * Collect timing metrics from persisted UAP and Hook metrics files.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{
 *   uap: { available: boolean, totalDuration: number, quality: string, loaders: Array },
 *   hook: { available: boolean, totalDuration: number, bracket: string, layers: Array },
 *   combined: { totalMs: number }
 * }}
 */
function collectTimingMetrics(projectRoot) {
  const metricsDir = path.join(projectRoot, '.synapse', 'metrics');
  const now = Date.now();

  // --- UAP Metrics ---
  const uapData = safeReadJson(path.join(metricsDir, 'uap-metrics.json'));
  const uap = _buildUapTiming(uapData, now);

  // --- Hook Metrics ---
  const hookData = safeReadJson(path.join(metricsDir, 'hook-metrics.json'));
  const hook = _buildHookTiming(hookData, now);

  return {
    uap,
    hook,
    combined: {
      totalMs: (uap.available ? uap.totalDuration : 0) + (hook.available ? hook.totalDuration : 0),
    },
  };
}

/**
 * Build UAP timing section from persisted data.
 * @param {Object|null} data - Parsed uap-metrics.json
 * @returns {Object} UAP timing data
 */
function _buildUapTiming(data, now) {
  if (!data || !data.loaders) {
    return { available: false, totalDuration: 0, quality: 'unknown', loaders: [], stale: false, ageMs: 0 };
  }

  const ageMs = data.timestamp ? now - new Date(data.timestamp).getTime() : 0;
  const stale = ageMs > MAX_STALENESS_MS;

  const loaders = Object.entries(data.loaders).map(([name, info]) => ({
    name,
    duration: info.duration || 0,
    status: info.status || 'unknown',
    tier: LOADER_TIER_MAP[name] || 'Unknown',
  }));

  return {
    available: true,
    totalDuration: data.totalDuration || 0,
    quality: data.quality || 'unknown',
    loaders,
    stale,
    ageMs,
  };
}

/**
 * Build Hook timing section from persisted data.
 * @param {Object|null} data - Parsed hook-metrics.json
 * @returns {Object} Hook timing data
 */
function _buildHookTiming(data, now) {
  if (!data || !data.perLayer) {
    return { available: false, totalDuration: 0, bracket: 'unknown', layers: [], stale: false, ageMs: 0 };
  }

  const ageMs = data.timestamp ? now - new Date(data.timestamp).getTime() : 0;
  const stale = ageMs > MAX_STALENESS_MS;

  const layers = Object.entries(data.perLayer).map(([name, info]) => ({
    name,
    duration: info.duration || 0,
    status: info.status || 'unknown',
    rules: info.rules || 0,
  }));

  return {
    available: true,
    totalDuration: data.totalDuration || 0,
    hookBootMs: data.hookBootMs || 0,
    bracket: data.bracket || 'unknown',
    layers,
    stale,
    ageMs,
  };
}

module.exports = { collectTimingMetrics, LOADER_TIER_MAP, MAX_STALENESS_MS };
