/**
 * Quality Collector — Scores context relevance for UAP loaders and SYNAPSE layers.
 *
 * Uses weighted rubrics to produce a 0-100 score for each pipeline,
 * then combines them into an overall grade.
 *
 * @module core/synapse/diagnostics/collectors/quality-collector
 * @version 1.0.0
 * @created Story SYN-12
 */

'use strict';

const path = require('path');
const { safeReadJson } = require('./safe-read-json');

/**
 * UAP loader scoring rubric.
 * Weight = max points for this loader. Criticality = human label.
 * @type {Array<{ name: string, weight: number, criticality: string, impact: string }>}
 */
const UAP_RUBRIC = [
  { name: 'agentConfig', weight: 25, criticality: 'CRITICAL', impact: 'Agent identity and commands' },
  { name: 'memories', weight: 20, criticality: 'HIGH', impact: 'Context from progressive retrieval' },
  { name: 'sessionContext', weight: 15, criticality: 'MEDIUM', impact: 'Session continuity' },
  { name: 'projectStatus', weight: 12, criticality: 'MEDIUM', impact: 'Project status context' },
  { name: 'gitConfig', weight: 8, criticality: 'LOW', impact: 'Branch name context' },
  { name: 'permissionMode', weight: 5, criticality: 'LOW', impact: 'Permission badge visual' },
  { name: 'synapseSession', weight: 5, criticality: 'LOW', impact: 'Bridge write for SYNAPSE' },
];

/**
 * Hook layer scoring rubric.
 * @type {Array<{ name: string, weight: number, criticality: string, impact: string }>}
 */
const HOOK_RUBRIC = [
  { name: 'constitution', weight: 25, criticality: 'CRITICAL', impact: 'Framework principles' },
  { name: 'agent', weight: 25, criticality: 'CRITICAL', impact: 'Agent-specific instructions' },
  { name: 'global', weight: 20, criticality: 'CRITICAL', impact: 'Project-wide rules' },
  { name: 'workflow', weight: 10, criticality: 'MEDIUM', impact: 'Workflow context' },
  { name: 'task', weight: 10, criticality: 'MEDIUM', impact: 'Task instructions' },
  { name: 'squad', weight: 5, criticality: 'LOW', impact: 'Squad rules' },
  { name: 'keyword', weight: 3, criticality: 'LOW', impact: 'Keyword triggers' },
  { name: 'star-command', weight: 2, criticality: 'LOW', impact: 'Command-specific rules' },
];

/**
 * Layers expected to be active per bracket.
 * Used to adjust max possible score for hook layers.
 * @type {Object.<string, string[]>}
 */
/** Maximum staleness threshold in ms (30 minutes).
 * UAP metrics are written once at agent activation, so staleness > 5 min is normal.
 * After this threshold, scores are degraded (50% penalty) rather than zeroed.
 */
const MAX_STALENESS_MS = 30 * 60 * 1000;

/** Degradation factor applied to stale metrics (50% penalty). */
const STALE_DEGRADATION_FACTOR = 0.5;

const BRACKET_ACTIVE_LAYERS = {
  FRESH: ['constitution', 'global', 'agent', 'star-command'],
  MODERATE: ['constitution', 'global', 'agent', 'workflow', 'task', 'squad', 'keyword', 'star-command'],
  DEPLETED: ['constitution', 'global', 'agent', 'workflow', 'task', 'squad', 'keyword', 'star-command'],
  CRITICAL: ['constitution', 'agent'],
};

/**
 * Grade thresholds.
 * @param {number} score - Score 0-100
 * @returns {string} Grade letter
 */
function _getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

/**
 * Grade label.
 * @param {string} grade
 * @returns {string}
 */
function _getGradeLabel(grade) {
  const labels = { A: 'EXCELLENT', B: 'GOOD', C: 'ADEQUATE', D: 'POOR', F: 'FAILING' };
  return labels[grade] || 'UNKNOWN';
}

/**
 * Collect context quality analysis from persisted metrics files.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{
 *   uap: { available: boolean, score: number, maxPossible: number, loaders: Array },
 *   hook: { available: boolean, score: number, maxPossible: number, bracket: string, layers: Array },
 *   overall: { score: number, grade: string, label: string }
 * }}
 */
function collectQualityMetrics(projectRoot) {
  const metricsDir = path.join(projectRoot, '.synapse', 'metrics');
  const now = Date.now();

  const uapData = safeReadJson(path.join(metricsDir, 'uap-metrics.json'));
  const hookData = safeReadJson(path.join(metricsDir, 'hook-metrics.json'));

  // SYN-14: Staleness detection — stale data scores 0
  const uapAge = uapData && uapData.timestamp ? now - new Date(uapData.timestamp).getTime() : 0;
  const hookAge = hookData && hookData.timestamp ? now - new Date(hookData.timestamp).getTime() : 0;
  const uapStale = uapAge > MAX_STALENESS_MS;
  const hookStale = hookAge > MAX_STALENESS_MS;

  // SYN-14 fix: Stale data is degraded (50% penalty) instead of zeroed.
  // UAP writes once at activation; being "stale" after 5 min is normal behavior.
  const uap = _scoreUap(uapData);
  if (uapStale) uap.stale = true;
  const hook = _scoreHook(hookData);
  if (hookStale) hook.stale = true;

  let uapNormalized = uap.maxPossible > 0 ? (uap.score / uap.maxPossible) * 100 : 0;
  let hookNormalized = hook.maxPossible > 0 ? (hook.score / hook.maxPossible) * 100 : 0;
  if (uapStale) uapNormalized *= STALE_DEGRADATION_FACTOR;
  if (hookStale) hookNormalized *= STALE_DEGRADATION_FACTOR;

  let overallScore;
  if (uap.available && hook.available) {
    overallScore = Math.round(uapNormalized * 0.4 + hookNormalized * 0.6);
  } else if (uap.available) {
    overallScore = Math.round(uapNormalized);
  } else if (hook.available) {
    overallScore = Math.round(hookNormalized);
  } else {
    overallScore = 0;
  }

  const grade = _getGrade(overallScore);

  return {
    uap: {
      available: uap.available,
      score: Math.round(uapNormalized),
      maxPossible: uap.maxPossible,
      loaders: uap.loaders,
      stale: uapStale,
    },
    hook: {
      available: hook.available,
      score: Math.round(hookNormalized),
      maxPossible: hook.maxPossible,
      bracket: hook.bracket,
      layers: hook.layers,
      stale: hookStale,
    },
    overall: {
      score: overallScore,
      grade,
      label: _getGradeLabel(grade),
    },
  };
}

/**
 * Score UAP loaders based on rubric.
 * @param {Object|null} data - Parsed uap-metrics.json
 * @returns {{ available: boolean, score: number, maxPossible: number, loaders: Array }}
 */
function _scoreUap(data) {
  if (!data || !data.loaders) {
    return { available: false, score: 0, maxPossible: 0, loaders: [] };
  }

  const maxPossible = UAP_RUBRIC.reduce((sum, r) => sum + r.weight, 0);
  let totalScore = 0;

  const loaders = UAP_RUBRIC.map((rubric) => {
    const loader = data.loaders[rubric.name];
    const isOk = loader && loader.status === 'ok';
    const score = isOk ? rubric.weight : 0;
    totalScore += score;

    return {
      name: rubric.name,
      score,
      maxScore: rubric.weight,
      criticality: rubric.criticality,
      impact: rubric.impact,
      status: loader ? loader.status : 'missing',
    };
  });

  return { available: true, score: totalScore, maxPossible, loaders };
}

/**
 * Score Hook layers based on rubric, adjusted by bracket.
 * @param {Object|null} data - Parsed hook-metrics.json
 * @returns {{ available: boolean, score: number, maxPossible: number, bracket: string, layers: Array }}
 */
function _scoreHook(data) {
  if (!data || !data.perLayer) {
    return { available: false, score: 0, maxPossible: 0, bracket: 'unknown', layers: [] };
  }

  const bracket = data.bracket || 'MODERATE';
  const activeLayers = BRACKET_ACTIVE_LAYERS[bracket] || BRACKET_ACTIVE_LAYERS.MODERATE;

  let totalScore = 0;
  let maxPossible = 0;

  const layers = HOOK_RUBRIC.map((rubric) => {
    const isExpected = activeLayers.includes(rubric.name);
    if (!isExpected) {
      return {
        name: rubric.name,
        score: 0,
        maxScore: 0,
        criticality: rubric.criticality,
        impact: rubric.impact,
        status: 'not-expected',
        rules: 0,
      };
    }

    maxPossible += rubric.weight;
    const layer = data.perLayer[rubric.name];
    const isOk = layer && layer.status === 'ok';
    const score = isOk ? rubric.weight : 0;
    totalScore += score;

    return {
      name: rubric.name,
      score,
      maxScore: rubric.weight,
      criticality: rubric.criticality,
      impact: rubric.impact,
      status: layer ? layer.status : 'missing',
      rules: layer ? (layer.rules || 0) : 0,
    };
  });

  return { available: true, score: totalScore, maxPossible, bracket, layers };
}

module.exports = {
  collectQualityMetrics,
  UAP_RUBRIC,
  HOOK_RUBRIC,
  BRACKET_ACTIVE_LAYERS,
  MAX_STALENESS_MS,
  STALE_DEGRADATION_FACTOR,
};
