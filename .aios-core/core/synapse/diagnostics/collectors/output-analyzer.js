/**
 * Output Analyzer — Per-component quality checks for UAP loaders and Hook layers.
 *
 * Examines the actual output quality beyond binary pass/fail by checking:
 * - UAP loaders: Did the loader produce meaningful data?
 * - Hook layers: Did the layer produce rules? How many?
 *
 * @module core/synapse/diagnostics/collectors/output-analyzer
 * @version 1.0.0
 * @created Story SYN-14
 */

'use strict';

const path = require('path');
const { safeReadJson } = require('./safe-read-json');

/**
 * Expected UAP loader output characteristics.
 * @type {Object.<string, { minFields: number, description: string }>}
 */
const UAP_OUTPUT_EXPECTATIONS = {
  agentConfig: { minFields: 3, description: 'Should have name, id, title at minimum' },
  permissionMode: { minFields: 1, description: 'Should have mode value' },
  gitConfig: { minFields: 1, description: 'Should have branch name' },
  sessionContext: { minFields: 1, description: 'Should have session type' },
  projectStatus: { minFields: 1, description: 'Should have status data' },
  memories: { minFields: 0, description: 'Optional — Pro feature' },
  synapseSession: { minFields: 1, description: 'Should have bridge write confirmation' },
};

/**
 * Analyze output quality from persisted metrics.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{
 *   available: boolean,
 *   uapAnalysis: Array<{ name: string, status: string, quality: string, detail: string }>,
 *   hookAnalysis: Array<{ name: string, status: string, rules: number, quality: string, detail: string }>,
 *   summary: { uapHealthy: number, uapTotal: number, hookHealthy: number, hookTotal: number }
 * }}
 */
function collectOutputAnalysis(projectRoot) {
  const metricsDir = path.join(projectRoot, '.synapse', 'metrics');

  const uapData = safeReadJson(path.join(metricsDir, 'uap-metrics.json'));
  const hookData = safeReadJson(path.join(metricsDir, 'hook-metrics.json'));

  if (!uapData && !hookData) {
    return {
      available: false,
      uapAnalysis: [],
      hookAnalysis: [],
      summary: { uapHealthy: 0, uapTotal: 0, hookHealthy: 0, hookTotal: 0 },
    };
  }

  const uapAnalysis = _analyzeUapOutput(uapData);
  const hookAnalysis = _analyzeHookOutput(hookData);

  return {
    available: true,
    uapAnalysis,
    hookAnalysis,
    summary: {
      uapHealthy: uapAnalysis.filter(a => a.quality === 'good').length,
      uapTotal: uapAnalysis.length,
      hookHealthy: hookAnalysis.filter(a => a.quality === 'good').length,
      hookTotal: hookAnalysis.length,
    },
  };
}

/**
 * Analyze UAP loader outputs.
 * @param {Object|null} data
 * @returns {Array<{ name: string, status: string, quality: string, detail: string }>}
 */
function _analyzeUapOutput(data) {
  if (!data || !data.loaders) return [];

  return Object.entries(UAP_OUTPUT_EXPECTATIONS).map(([name, _expectation]) => {
    const loader = data.loaders[name];
    if (!loader) {
      const desc = _expectation.description || '';
      const detail = desc.includes('Optional') ? desc : 'Loader not present in metrics';
      return { name, status: 'missing', quality: 'none', detail };
    }
    if (loader.status === 'error') {
      return { name, status: 'error', quality: 'bad', detail: `Error: ${loader.error || 'unknown'}` };
    }
    if (loader.status === 'timeout') {
      return { name, status: 'timeout', quality: 'bad', detail: `Timeout after ${loader.duration || 0}ms` };
    }
    if (loader.status === 'skipped') {
      return { name, status: 'skipped', quality: 'none', detail: 'Loader was skipped' };
    }
    // Status 'ok' — check duration for anomalies
    if (loader.duration > 200) {
      return { name, status: 'ok', quality: 'degraded', detail: `Slow: ${loader.duration}ms (>200ms)` };
    }
    return { name, status: 'ok', quality: 'good', detail: `${loader.duration}ms` };
  });
}

/**
 * Analyze Hook layer outputs.
 * @param {Object|null} data
 * @returns {Array<{ name: string, status: string, rules: number, quality: string, detail: string }>}
 */
function _analyzeHookOutput(data) {
  if (!data || !data.perLayer) return [];

  return Object.entries(data.perLayer).map(([name, info]) => {
    const rules = info.rules || 0;
    const status = info.status || 'unknown';

    if (status === 'error') {
      return { name, status, rules, quality: 'bad', detail: 'Error in layer' };
    }
    if (status === 'skipped') {
      return { name, status, rules, quality: 'none', detail: info.reason || 'Skipped' };
    }
    if (status === 'ok' && rules === 0) {
      return { name, status, rules, quality: 'empty', detail: 'Loaded but produced 0 rules' };
    }
    if (status === 'ok' && rules > 0) {
      return { name, status, rules, quality: 'good', detail: `${rules} rules in ${info.duration || 0}ms` };
    }
    return { name, status, rules, quality: 'unknown', detail: `Status: ${status}` };
  });
}

module.exports = { collectOutputAnalysis, UAP_OUTPUT_EXPECTATIONS };
