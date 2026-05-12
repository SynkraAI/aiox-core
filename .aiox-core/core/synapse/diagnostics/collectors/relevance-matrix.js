/**
 * Relevance Matrix — Agent-specific importance mapping for context components.
 *
 * Maps each UAP loader and Hook layer to an importance level per agent type.
 * Used by diagnostics to show which context is most critical for the active agent.
 *
 * @module core/synapse/diagnostics/collectors/relevance-matrix
 * @version 1.0.0
 * @created Story SYN-14
 */

'use strict';

const path = require('path');
const { safeReadJson } = require('./safe-read-json');

/**
 * Importance levels for context components.
 * @enum {string}
 */
const IMPORTANCE = {
  CRITICAL: 'critical',
  IMPORTANT: 'important',
  OPTIONAL: 'optional',
  IRRELEVANT: 'irrelevant',
};

/**
 * Default relevance map — applies to agents without specific overrides.
 * @type {Object.<string, string>}
 */
const DEFAULT_RELEVANCE = {
  // UAP loaders
  agentConfig: IMPORTANCE.CRITICAL,
  permissionMode: IMPORTANCE.OPTIONAL,
  gitConfig: IMPORTANCE.OPTIONAL,
  sessionContext: IMPORTANCE.IMPORTANT,
  projectStatus: IMPORTANCE.OPTIONAL,
  memories: IMPORTANCE.IMPORTANT,
  synapseSession: IMPORTANCE.OPTIONAL,
  // Hook layers
  constitution: IMPORTANCE.CRITICAL,
  global: IMPORTANCE.IMPORTANT,
  agent: IMPORTANCE.CRITICAL,
  workflow: IMPORTANCE.OPTIONAL,
  task: IMPORTANCE.OPTIONAL,
  squad: IMPORTANCE.IRRELEVANT,
  keyword: IMPORTANCE.OPTIONAL,
  'star-command': IMPORTANCE.OPTIONAL,
};

/**
 * Agent-specific overrides. Only components that differ from DEFAULT_RELEVANCE.
 * @type {Object.<string, Object.<string, string>>}
 */
const AGENT_OVERRIDES = {
  dev: {
    gitConfig: IMPORTANCE.IMPORTANT,
    projectStatus: IMPORTANCE.IMPORTANT,
    workflow: IMPORTANCE.IMPORTANT,
    task: IMPORTANCE.CRITICAL,
  },
  qa: {
    projectStatus: IMPORTANCE.IMPORTANT,
    task: IMPORTANCE.IMPORTANT,
  },
  devops: {
    gitConfig: IMPORTANCE.CRITICAL,
    permissionMode: IMPORTANCE.IMPORTANT,
    squad: IMPORTANCE.OPTIONAL,
  },
  architect: {
    projectStatus: IMPORTANCE.IMPORTANT,
    memories: IMPORTANCE.CRITICAL,
  },
  pm: {
    projectStatus: IMPORTANCE.CRITICAL,
    workflow: IMPORTANCE.IMPORTANT,
  },
  sm: {
    workflow: IMPORTANCE.IMPORTANT,
    task: IMPORTANCE.IMPORTANT,
  },
};

/**
 * Build relevance matrix for a given agent.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{
 *   available: boolean,
 *   agentId: string,
 *   matrix: Array<{ component: string, importance: string, status: string, gap: boolean }>,
 *   gaps: Array<{ component: string, importance: string }>,
 *   score: number
 * }}
 */
function collectRelevanceMatrix(projectRoot) {
  const metricsDir = path.join(projectRoot, '.synapse', 'metrics');

  const uapData = safeReadJson(path.join(metricsDir, 'uap-metrics.json'));
  const hookData = safeReadJson(path.join(metricsDir, 'hook-metrics.json'));
  const bridgeData = safeReadJson(path.join(projectRoot, '.synapse', 'sessions', '_active-agent.json'));

  const agentId = (uapData && uapData.agentId) || (bridgeData && bridgeData.id) || 'unknown';

  if (!uapData && !hookData) {
    return { available: false, agentId, matrix: [], gaps: [], score: 0 };
  }

  const relevanceMap = _getRelevanceForAgent(agentId);
  const matrix = [];
  const gaps = [];
  let totalWeight = 0;
  let achievedWeight = 0;

  const weightMap = { critical: 4, important: 2, optional: 1, irrelevant: 0 };

  for (const [component, importance] of Object.entries(relevanceMap)) {
    const weight = weightMap[importance] || 0;
    totalWeight += weight;

    const status = _getComponentStatus(component, uapData, hookData);
    const gap = importance !== IMPORTANCE.IRRELEVANT && status !== 'ok' && status !== 'skipped';

    if (gap && weight > 0) {
      gaps.push({ component, importance });
    } else {
      achievedWeight += weight;
    }

    matrix.push({ component, importance, status, gap });
  }

  const score = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  return { available: true, agentId, matrix, gaps, score };
}

/**
 * Get relevance map for a specific agent (default + overrides).
 * @param {string} agentId
 * @returns {Object.<string, string>}
 */
function _getRelevanceForAgent(agentId) {
  const overrides = AGENT_OVERRIDES[agentId] || {};
  return { ...DEFAULT_RELEVANCE, ...overrides };
}

/**
 * Get the status of a component from UAP or Hook data.
 * @param {string} component
 * @param {Object|null} uapData
 * @param {Object|null} hookData
 * @returns {string}
 */
function _getComponentStatus(component, uapData, hookData) {
  // Check UAP loaders
  if (uapData && uapData.loaders && uapData.loaders[component]) {
    return uapData.loaders[component].status || 'unknown';
  }
  // Check Hook layers
  if (hookData && hookData.perLayer && hookData.perLayer[component]) {
    return hookData.perLayer[component].status || 'unknown';
  }
  return 'missing';
}

module.exports = {
  collectRelevanceMatrix,
  IMPORTANCE,
  DEFAULT_RELEVANCE,
  AGENT_OVERRIDES,
};
