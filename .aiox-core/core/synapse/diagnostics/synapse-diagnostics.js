/**
 * SYNAPSE Diagnostics Orchestrator
 *
 * Coordinates all collectors and generates a comprehensive diagnostic report
 * comparing expected vs. actual SYNAPSE pipeline state.
 *
 * Usage:
 *   const { runDiagnostics } = require('.../synapse-diagnostics');
 *   const report = runDiagnostics('/path/to/project');
 *
 * @module core/synapse/diagnostics/synapse-diagnostics
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const path = require('path');
const { collectHookStatus } = require('./collectors/hook-collector');
const { collectSessionStatus } = require('./collectors/session-collector');
const { collectManifestIntegrity } = require('./collectors/manifest-collector');
const { collectPipelineSimulation } = require('./collectors/pipeline-collector');
const { collectUapBridgeStatus } = require('./collectors/uap-collector');
const { formatReport } = require('./report-formatter');
const { parseManifest } = require('../domain/domain-loader');

/**
 * Safely execute a collector, returning an error object on failure.
 * Diagnostics must be resilient — a broken collector should not crash the entire run.
 * @param {string} name - Collector name for error reporting
 * @param {Function} fn - Collector function to execute
 * @returns {*} Collector result or { error: true, collector, message, checks, fields, entries }
 */
function _safeCollect(name, fn) {
  try {
    return fn();
  } catch (error) {
    return { error: true, collector: name, message: error.message, checks: [], fields: [], entries: [] };
  }
}

/**
 * Run all collectors and return raw results.
 * Shared orchestration logic used by both runDiagnostics and runDiagnosticsRaw.
 * @param {string} projectRoot - Absolute path to project root
 * @param {object} options - Diagnostic options
 * @returns {{ hook, session, manifest, pipeline, uap }} Collector results
 */
function _collectAll(projectRoot, options) {
  if (!projectRoot || typeof projectRoot !== 'string') {
    throw new Error('projectRoot is required and must be a string');
  }

  const synapsePath = path.join(projectRoot, '.synapse');
  const manifestPath = path.join(synapsePath, 'manifest');

  const hook = _safeCollect('hook', () => collectHookStatus(projectRoot));
  const session = _safeCollect('session', () => collectSessionStatus(projectRoot, options.sessionId));
  const manifest = _safeCollect('manifest', () => collectManifestIntegrity(projectRoot));
  const parsedManifest = _safeCollect('parsedManifest', () => parseManifest(manifestPath));

  const promptCount = session?.raw?.session?.prompt_count || 0;
  const activeAgentId = session?.raw?.bridgeData?.id || session?.raw?.session?.active_agent?.id || null;

  const pipeline = _safeCollect('pipeline', () => collectPipelineSimulation(promptCount, activeAgentId, parsedManifest));
  const uap = _safeCollect('uap', () => collectUapBridgeStatus(projectRoot));

  return { hook, session, manifest, pipeline, uap };
}

/**
 * Run full SYNAPSE diagnostics and return formatted markdown report.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {object} [options] - Diagnostic options
 * @param {string} [options.sessionId] - Session UUID for session-specific checks
 * @returns {string} Formatted markdown diagnostic report
 */
function runDiagnostics(projectRoot, options = {}) {
  const data = _collectAll(projectRoot, options);
  return formatReport(data);
}

/**
 * Run diagnostics and return raw collector data (for programmatic use).
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {object} [options] - Diagnostic options
 * @returns {object} Raw collector results
 */
function runDiagnosticsRaw(projectRoot, options = {}) {
  return _collectAll(projectRoot, options);
}

module.exports = { runDiagnostics, runDiagnosticsRaw };
