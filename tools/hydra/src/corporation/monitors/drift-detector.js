/**
 * DriftDetector -- Agent Output Quality Drift Monitor
 *
 * Monitors agent output quality over time by comparing current metrics
 * against rolling baselines. Detects silent degradation patterns:
 *   - Response time anomalies (tasks taking significantly longer)
 *   - Error rate spikes
 *   - Output length deviations (suddenly shorter/longer outputs)
 *   - Tool usage pattern changes
 *
 * Drift score: 0 (normal) to 1 (total degradation).
 * Alerts when score exceeds threshold (default 0.3).
 *
 * Based on AgentDrift (Wu et al., 2026) -- arXiv:2603.12564
 * Complemented by AgentFixer (Mulian et al., 2026) -- arXiv:2603.29848
 *
 * @module corporation/monitors/drift-detector
 * @version 1.0.0
 */

import { DriftBaseline } from './drift-baseline.js';

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_THRESHOLD = 0.3;
const CRITICAL_THRESHOLD = 0.7;
const MIN_SAMPLES_FOR_DETECTION = 10;

/**
 * Weights for each drift dimension in the composite score.
 * Sum should equal 1.0 for normalized scoring.
 */
const DRIFT_WEIGHTS = {
  duration: 0.25,
  error_rate: 0.30,
  output_length: 0.20,
  tool_pattern: 0.25,
};

/**
 * Health status labels mapped to score ranges.
 */
const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  DEGRADED: 'degraded',
  CRITICAL: 'critical',
};

// =====================================================
// DriftDetector
// =====================================================

export class DriftDetector {
  /**
   * @param {Object} [options]
   * @param {DriftBaseline} [options.baseline] - Pre-configured baseline instance
   * @param {number} [options.threshold] - Alert threshold (default 0.3)
   * @param {number} [options.criticalThreshold] - Critical threshold (default 0.7)
   * @param {Function} [options.onAlert] - Callback when drift exceeds threshold
   * @param {Object} [options.weights] - Custom drift dimension weights
   * @param {string} [options.dataDir] - Data directory for baseline
   */
  constructor(options = {}) {
    this.baseline = options.baseline || new DriftBaseline({ dataDir: options.dataDir });
    this.threshold = options.threshold ?? DEFAULT_THRESHOLD;
    this.criticalThreshold = options.criticalThreshold ?? CRITICAL_THRESHOLD;
    this.onAlert = options.onAlert || null;
    this.weights = { ...DRIFT_WEIGHTS, ...(options.weights || {}) };

    /** @type {Map<string, Object[]>} agentId -> drift history */
    this._driftHistory = new Map();

    /** @type {Map<string, Object>} agentId -> latest drift result */
    this._latestScores = new Map();
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Record an interaction and compute drift score.
   * This is the main entry point -- call after every agent interaction.
   *
   * @param {string} agentId - Agent identifier
   * @param {Object} interaction - Interaction metrics
   * @param {number} interaction.duration_ms - Response time in ms
   * @param {number} interaction.output_length - Output character count
   * @param {boolean} interaction.error - Whether interaction errored
   * @param {string[]} [interaction.tools_used] - Tools called
   * @param {string} [interaction.task_type] - Type of task
   * @param {string} [interaction.result] - Result status
   * @returns {Object} DriftResult { score, status, dimensions, alert, agentId }
   */
  evaluate(agentId, interaction) {
    // Record to baseline (which updates rolling stats)
    this.baseline.record(agentId, interaction);

    // Need minimum data for meaningful detection
    if (!this.baseline.hasBaseline(agentId, MIN_SAMPLES_FOR_DETECTION)) {
      return {
        agentId,
        score: 0,
        status: HEALTH_STATUS.HEALTHY,
        dimensions: {},
        alert: false,
        reason: 'Insufficient data for drift detection',
        sample_size: this.baseline.getBaseline(agentId)?.sample_size || 0,
      };
    }

    const baselineStats = this.baseline.getBaseline(agentId);
    const dimensions = this._computeDimensions(interaction, baselineStats);
    const score = this._computeCompositeScore(dimensions);
    const status = this._scoreToStatus(score);
    const alert = score >= this.threshold;

    const result = {
      agentId,
      score: Math.round(score * 1000) / 1000,
      status,
      dimensions,
      alert,
      timestamp: new Date().toISOString(),
      sample_size: baselineStats.sample_size,
    };

    // Track history
    this._trackDriftHistory(agentId, result);
    this._latestScores.set(agentId, result);

    // Fire alert callback
    if (alert && this.onAlert) {
      try {
        this.onAlert(result);
      } catch {
        // Alert callback failure should never break detection
      }
    }

    return result;
  }

  /**
   * Get the latest drift score for an agent.
   *
   * @param {string} agentId
   * @returns {Object|null}
   */
  getLatestScore(agentId) {
    return this._latestScores.get(agentId) || null;
  }

  /**
   * Get drift scores for all tracked agents.
   *
   * @returns {Object} Map of agentId -> latest drift result
   */
  getAllScores() {
    const result = {};
    for (const [agentId, score] of this._latestScores) {
      result[agentId] = score;
    }
    return result;
  }

  /**
   * Get agents sorted by drift score (highest first).
   *
   * @param {number} [limit=10]
   * @returns {Object[]} Sorted drift results
   */
  getTopDrifters(limit = 10) {
    const all = [...this._latestScores.values()];
    return all
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get agents currently in alert state (score >= threshold).
   *
   * @returns {Object[]}
   */
  getAlertingAgents() {
    return [...this._latestScores.values()].filter(s => s.alert);
  }

  /**
   * Get drift trend for an agent (improving/stable/worsening).
   *
   * @param {string} agentId
   * @param {number} [windowSize=5] - Number of recent scores to analyze
   * @returns {Object} { trend, direction, recent_scores }
   */
  getTrend(agentId, windowSize = 5) {
    const history = this._driftHistory.get(agentId) || [];
    if (history.length < 2) {
      return { trend: 'insufficient_data', direction: 0, recent_scores: [] };
    }

    const recent = history.slice(-windowSize);
    const scores = recent.map(h => h.score);

    // Simple linear regression slope
    const direction = this._computeSlope(scores);

    let trend;
    if (Math.abs(direction) < 0.01) {
      trend = 'stable';
    } else if (direction > 0) {
      trend = 'worsening';
    } else {
      trend = 'improving';
    }

    return {
      trend,
      direction: Math.round(direction * 1000) / 1000,
      recent_scores: scores,
    };
  }

  /**
   * Get the health status for an agent.
   *
   * @param {string} agentId
   * @returns {string} healthy|warning|degraded|critical
   */
  getHealthStatus(agentId) {
    const latest = this._latestScores.get(agentId);
    if (!latest) return HEALTH_STATUS.HEALTHY;
    return latest.status;
  }

  /**
   * Persist current state (delegates to baseline).
   */
  save() {
    this.baseline.save();
  }

  // =====================================================
  // PRIVATE -- Drift Computation
  // =====================================================

  /**
   * Compute individual drift dimensions.
   * Each dimension returns a value between 0 and 1.
   *
   * @private
   * @param {Object} interaction - Current interaction
   * @param {Object} baseline - Baseline stats
   * @returns {Object} Dimension scores
   */
  _computeDimensions(interaction, baseline) {
    return {
      duration: this._computeDurationDrift(interaction.duration_ms, baseline),
      error_rate: this._computeErrorRateDrift(interaction.error, baseline),
      output_length: this._computeOutputDrift(interaction.output_length, baseline),
      tool_pattern: this._computeToolPatternDrift(interaction.tools_used || [], baseline),
    };
  }

  /**
   * Duration drift: how far is current duration from baseline?
   * Uses z-score normalized to [0, 1].
   *
   * @private
   */
  _computeDurationDrift(durationMs, baseline) {
    if (!baseline.std_duration_ms || baseline.std_duration_ms === 0) return 0;
    const zScore = Math.abs(durationMs - baseline.avg_duration_ms) / baseline.std_duration_ms;
    return this._clamp(zScore / 3); // 3 std devs = max drift
  }

  /**
   * Error rate drift: spike detection against baseline error rate.
   * Uses a sliding comparison of recent errors vs historical rate.
   *
   * @private
   */
  _computeErrorRateDrift(isError, baseline) {
    if (!isError) return 0;
    // If baseline error rate is already high, single error is less alarming
    const baselineRate = baseline.error_rate || 0;
    if (baselineRate >= 0.5) return 0.3; // Already problematic baseline
    // Error against low-error baseline is a strong drift signal
    return this._clamp(1 - baselineRate);
  }

  /**
   * Output length drift: deviation from expected output size.
   *
   * @private
   */
  _computeOutputDrift(outputLength, baseline) {
    if (!baseline.std_output_length || baseline.std_output_length === 0) return 0;
    const zScore = Math.abs(outputLength - baseline.avg_output_length) / baseline.std_output_length;
    return this._clamp(zScore / 3);
  }

  /**
   * Tool pattern drift: measures change in tool usage patterns.
   * Compares tools used in current interaction vs baseline frequency.
   *
   * @private
   */
  _computeToolPatternDrift(toolsUsed, baseline) {
    const baseFreq = baseline.tool_frequency || {};
    const baseTools = Object.keys(baseFreq);

    if (baseTools.length === 0 && toolsUsed.length === 0) return 0;
    if (baseTools.length === 0) return 0.2; // New tools with no baseline

    // Check for unseen tools (novel tool usage)
    const novelTools = toolsUsed.filter(t => !baseFreq[t]);
    const novelRatio = toolsUsed.length > 0 ? novelTools.length / toolsUsed.length : 0;

    // Check for missing expected tools
    const totalBaseUsage = Object.values(baseFreq).reduce((s, v) => s + v, 0);
    const expectedTools = baseTools.filter(t => (baseFreq[t] / totalBaseUsage) > 0.2);
    const missingExpected = expectedTools.filter(t => !toolsUsed.includes(t));
    const missingRatio = expectedTools.length > 0 ? missingExpected.length / expectedTools.length : 0;

    return this._clamp((novelRatio * 0.4 + missingRatio * 0.6));
  }

  /**
   * Compute weighted composite drift score.
   *
   * @private
   * @param {Object} dimensions
   * @returns {number} Score between 0 and 1
   */
  _computeCompositeScore(dimensions) {
    let score = 0;
    for (const [dim, weight] of Object.entries(this.weights)) {
      score += (dimensions[dim] || 0) * weight;
    }
    return this._clamp(score);
  }

  /**
   * Map score to health status label.
   *
   * @private
   * @param {number} score
   * @returns {string}
   */
  _scoreToStatus(score) {
    if (score >= this.criticalThreshold) return HEALTH_STATUS.CRITICAL;
    if (score >= this.threshold) return HEALTH_STATUS.DEGRADED;
    if (score >= this.threshold * 0.6) return HEALTH_STATUS.WARNING;
    return HEALTH_STATUS.HEALTHY;
  }

  // =====================================================
  // PRIVATE -- History & Trend
  // =====================================================

  /**
   * Track drift score in history for trend analysis.
   * @private
   */
  _trackDriftHistory(agentId, result) {
    if (!this._driftHistory.has(agentId)) {
      this._driftHistory.set(agentId, []);
    }
    const history = this._driftHistory.get(agentId);
    history.push({
      score: result.score,
      status: result.status,
      timestamp: result.timestamp,
    });

    // Keep last 100 entries
    if (history.length > 100) {
      this._driftHistory.set(agentId, history.slice(-100));
    }
  }

  /**
   * Compute linear regression slope for a sequence of values.
   * Positive slope = worsening, negative = improving.
   *
   * @private
   * @param {number[]} values
   * @returns {number}
   */
  _computeSlope(values) {
    const n = values.length;
    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return 0;
    return (n * sumXY - sumX * sumY) / denominator;
  }

  /**
   * Clamp value to [0, 1].
   * @private
   * @param {number} v
   * @returns {number}
   */
  _clamp(v) {
    return Math.min(1, Math.max(0, v));
  }
}

// =====================================================
// EXPORTS
// =====================================================

export {
  DEFAULT_THRESHOLD,
  CRITICAL_THRESHOLD,
  MIN_SAMPLES_FOR_DETECTION,
  DRIFT_WEIGHTS,
  HEALTH_STATUS,
};
