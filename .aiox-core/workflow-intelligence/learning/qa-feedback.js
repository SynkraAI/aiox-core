/**
 * QA Feedback Loop - Story 12.5
 *
 * Receive feedback from QA results to adjust pattern confidence
 * and deprecate patterns that consistently fail.
 *
 * Absorbed from Auto-Claude's QA_RESULT episode type.
 *
 * @module qa-feedback
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  // Confidence adjustments
  successBoost: 0.05, // Increase on success
  failurePenalty: 0.1, // Decrease on failure
  criticalPenalty: 0.2, // Decrease on critical failure

  // Deprecation thresholds
  deprecateAfterFailures: 3, // Consecutive failures to deprecate
  minConfidenceThreshold: 0.3, // Below this = deprecated

  // Feedback storage
  feedbackStorePath: '.aiox/qa-feedback.json',
  maxFeedbackHistory: 1000,

  // Suggestions
  suggestAlternativeThreshold: 0.5, // Confidence below this triggers suggestion
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              QA FEEDBACK PROCESSOR
// ═══════════════════════════════════════════════════════════════════════════════════

class QAFeedbackProcessor {
  /**
   * Create a new QAFeedbackProcessor
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.patternStore] - Pattern store instance
   * @param {Object} [options.gotchaRegistry] - Gotcha registry instance
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.storePath = path.join(this.rootPath, this.config.feedbackStorePath);

    this.patternStore = options.patternStore || null;
    this.gotchaRegistry = options.gotchaRegistry || null;

    this._feedbackHistory = null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STORAGE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Load feedback history
   */
  loadFeedback() {
    if (this._feedbackHistory) {
      return this._feedbackHistory;
    }

    if (!fs.existsSync(this.storePath)) {
      this._feedbackHistory = {
        history: [],
        patternStats: {},
        metadata: { version: '1.0.0', lastUpdated: null },
      };
      return this._feedbackHistory;
    }

    try {
      const content = fs.readFileSync(this.storePath, 'utf-8');
      this._feedbackHistory = JSON.parse(content);
      return this._feedbackHistory;
    } catch (error) {
      console.error('Failed to load feedback history:', error.message);
      this._feedbackHistory = {
        history: [],
        patternStats: {},
        metadata: { version: '1.0.0', lastUpdated: null },
      };
      return this._feedbackHistory;
    }
  }

  /**
   * Save feedback history
   */
  saveFeedback() {
    if (!this._feedbackHistory) {
      return;
    }

    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Enforce max history
    if (this._feedbackHistory.history.length > this.config.maxFeedbackHistory) {
      this._feedbackHistory.history = this._feedbackHistory.history.slice(
        -this.config.maxFeedbackHistory,
      );
    }

    this._feedbackHistory.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.storePath, JSON.stringify(this._feedbackHistory, null, 2), 'utf-8');
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              PROCESS QA RESULT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Process QA result and update pattern confidence
   *
   * @param {Object} qaResult - QA result from qa-review-build
   * @param {Object} context - Context information
   * @returns {Object} Feedback processing result
   */
  processQAResult(qaResult, context = {}) {
    this.loadFeedback();

    const result = {
      processed: true,
      patternsAffected: [],
      gotchasCreated: [],
      suggestions: [],
      actions: [],
    };

    // Extract pattern from context
    const patternId = context.patternId || this._inferPattern(context);

    if (!patternId) {
      result.processed = false;
      result.reason = 'No pattern identified';
      return result;
    }

    // Determine outcome
    const outcome = this._determineOutcome(qaResult);

    // Record feedback
    const feedback = {
      id: this._generateId(),
      patternId,
      storyId: context.storyId,
      outcome: outcome.status,
      severity: outcome.severity,
      issues: outcome.issues,
      timestamp: new Date().toISOString(),
    };

    this._feedbackHistory.history.push(feedback);

    // Update pattern stats
    const stats = this._updatePatternStats(patternId, outcome);
    result.patternsAffected.push({ patternId, stats });

    // Process based on outcome
    if (outcome.status === 'failure') {
      // Check for deprecation
      if (stats.consecutiveFailures >= this.config.deprecateAfterFailures) {
        result.actions.push({
          type: 'deprecate',
          patternId,
          reason: `${stats.consecutiveFailures} consecutive failures`,
        });
        this._deprecatePattern(patternId);
      }

      // Create gotcha if critical
      if (outcome.severity === 'critical' && this.gotchaRegistry) {
        const gotcha = this._createGotchaFromFailure(patternId, outcome, context);
        if (gotcha) {
          result.gotchasCreated.push(gotcha);
        }
      }

      // Suggest alternatives
      const suggestions = this._suggestAlternatives(patternId, context);
      result.suggestions = suggestions;
    }

    // Adjust confidence in pattern store
    this._adjustPatternConfidence(patternId, outcome);

    this.saveFeedback();

    return result;
  }

  /**
   * Determine outcome from QA result
   * @private
   */
  _determineOutcome(qaResult) {
    const outcome = {
      status: 'success',
      severity: 'none',
      issues: [],
    };

    // Check gate decision
    if (qaResult.gateDecision === 'FAIL') {
      outcome.status = 'failure';
      outcome.severity = 'critical';
    } else if (qaResult.gateDecision === 'CONCERNS') {
      outcome.status = 'partial';
      outcome.severity = 'high';
    }

    // Check for blocking issues
    if (qaResult.blockingIssues?.length > 0) {
      outcome.status = 'failure';
      outcome.severity = 'critical';
      outcome.issues = qaResult.blockingIssues;
    }

    // Check security issues
    if (qaResult.securityChecklist?.critical > 0) {
      outcome.status = 'failure';
      outcome.severity = 'critical';
      outcome.issues.push('Critical security vulnerabilities');
    }

    // Check test failures
    if (qaResult.testing?.unit?.failed > 0 || qaResult.testing?.integration?.failed > 0) {
      if (outcome.status === 'success') {
        outcome.status = 'partial';
        outcome.severity = 'high';
      }
      outcome.issues.push('Test failures detected');
    }

    return outcome;
  }

  /**
   * Infer pattern from context
   * @private
   */
  _inferPattern(context) {
    if (context.sequence) {
      return `sequence:${context.sequence.join('->')}`;
    }
    if (context.workflow) {
      return `workflow:${context.workflow}`;
    }
    if (context.agent && context.action) {
      return `${context.agent}:${context.action}`;
    }
    return null;
  }

  /**
   * Update pattern statistics
   * @private
   */
  _updatePatternStats(patternId, outcome) {
    if (!this._feedbackHistory.patternStats[patternId]) {
      this._feedbackHistory.patternStats[patternId] = {
        totalExecutions: 0,
        successes: 0,
        failures: 0,
        partials: 0,
        consecutiveFailures: 0,
        lastOutcome: null,
        lastExecuted: null,
      };
    }

    const stats = this._feedbackHistory.patternStats[patternId];
    stats.totalExecutions++;
    stats.lastOutcome = outcome.status;
    stats.lastExecuted = new Date().toISOString();

    if (outcome.status === 'success') {
      stats.successes++;
      stats.consecutiveFailures = 0;
    } else if (outcome.status === 'failure') {
      stats.failures++;
      stats.consecutiveFailures++;
    } else {
      stats.partials++;
      // Don't reset consecutive failures for partial
    }

    return { ...stats };
  }

  /**
   * Adjust pattern confidence in pattern store
   * @private
   */
  _adjustPatternConfidence(patternId, outcome) {
    if (!this.patternStore) {
      return;
    }

    try {
      const pattern = this.patternStore.getPattern(patternId);
      if (!pattern) {
        return;
      }

      let adjustment = 0;

      if (outcome.status === 'success') {
        adjustment = this.config.successBoost;
      } else if (outcome.status === 'failure') {
        adjustment =
          outcome.severity === 'critical'
            ? -this.config.criticalPenalty
            : -this.config.failurePenalty;
      } else {
        adjustment = -this.config.failurePenalty / 2;
      }

      const newConfidence = Math.max(0, Math.min(1, pattern.confidence + adjustment));

      this.patternStore.updatePattern(patternId, {
        confidence: newConfidence,
        status: newConfidence < this.config.minConfidenceThreshold ? 'deprecated' : pattern.status,
      });
    } catch (error) {
      console.error('Failed to adjust pattern confidence:', error.message);
    }
  }

  /**
   * Deprecate pattern
   * @private
   */
  _deprecatePattern(patternId) {
    if (!this.patternStore) {
      return;
    }

    try {
      this.patternStore.updatePattern(patternId, {
        status: 'deprecated',
        deprecatedAt: new Date().toISOString(),
        deprecatedReason: 'Consecutive QA failures',
      });
    } catch (error) {
      console.error('Failed to deprecate pattern:', error.message);
    }
  }

  /**
   * Create gotcha from failure
   * @private
   */
  _createGotchaFromFailure(patternId, outcome, context) {
    if (!this.gotchaRegistry) {
      return null;
    }

    try {
      return this.gotchaRegistry.recordGotcha({
        pattern: patternId,
        context: context.agent || 'unknown',
        error: outcome.issues.join('; '),
        reason: `Pattern failed QA with ${outcome.severity} severity`,
        keywords: [context.agent, context.action, 'qa-failure'].filter(Boolean),
        source: 'qa-feedback',
      });
    } catch (error) {
      console.error('Failed to create gotcha:', error.message);
      return null;
    }
  }

  /**
   * Suggest alternatives for failing pattern
   * @private
   */
  _suggestAlternatives(patternId, _context) {
    const suggestions = [];

    // Get pattern stats
    const stats = this._feedbackHistory.patternStats[patternId];

    if (!stats) {
      return suggestions;
    }

    // Calculate success rate
    const successRate = stats.successes / stats.totalExecutions;

    if (successRate < this.config.suggestAlternativeThreshold) {
      // Look for similar successful patterns
      const alternatives = this._findSuccessfulAlternatives(patternId);

      for (const alt of alternatives) {
        suggestions.push({
          type: 'alternative_pattern',
          original: patternId,
          suggested: alt.patternId,
          reason: `Higher success rate: ${(alt.successRate * 100).toFixed(0)}%`,
          confidence: alt.successRate,
        });
      }

      // Suggest manual review
      if (stats.consecutiveFailures >= 2) {
        suggestions.push({
          type: 'manual_review',
          reason: 'Multiple consecutive failures suggest fundamental issue',
          action: 'Review pattern implementation and requirements',
        });
      }
    }

    return suggestions;
  }

  /**
   * Find successful alternative patterns
   * @private
   */
  _findSuccessfulAlternatives(patternId) {
    const alternatives = [];

    // Extract pattern type
    const [type] = patternId.split(':');

    for (const [id, stats] of Object.entries(this._feedbackHistory.patternStats)) {
      if (id === patternId) continue;
      if (!id.startsWith(type)) continue;

      const successRate = stats.successes / stats.totalExecutions;

      if (successRate >= 0.8 && stats.totalExecutions >= 3) {
        alternatives.push({ patternId: id, successRate, stats });
      }
    }

    return alternatives.sort((a, b) => b.successRate - a.successRate).slice(0, 3);
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `fb-${timestamp}-${random}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get feedback statistics
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    this.loadFeedback();

    const history = this._feedbackHistory.history;
    const stats = this._feedbackHistory.patternStats;

    if (history.length === 0) {
      return {
        totalFeedback: 0,
        successRate: 0,
        patternsTracked: 0,
        deprecatedPatterns: 0,
        recentTrend: 'neutral',
      };
    }

    const outcomes = history.reduce((acc, f) => {
      acc[f.outcome] = (acc[f.outcome] || 0) + 1;
      return acc;
    }, {});

    const deprecatedCount = Object.values(stats).filter(
      (s) => s.consecutiveFailures >= this.config.deprecateAfterFailures,
    ).length;

    // Calculate recent trend (last 10 vs previous 10)
    const recent = history.slice(-10);
    const previous = history.slice(-20, -10);

    const recentSuccessRate = recent.filter((f) => f.outcome === 'success').length / recent.length;
    const previousSuccessRate =
      previous.length > 0
        ? previous.filter((f) => f.outcome === 'success').length / previous.length
        : recentSuccessRate;

    let trend = 'neutral';
    if (recentSuccessRate > previousSuccessRate + 0.1) trend = 'improving';
    if (recentSuccessRate < previousSuccessRate - 0.1) trend = 'declining';

    return {
      totalFeedback: history.length,
      successRate: (outcomes.success || 0) / history.length,
      failureRate: (outcomes.failure || 0) / history.length,
      patternsTracked: Object.keys(stats).length,
      deprecatedPatterns: deprecatedCount,
      recentTrend: trend,
      breakdown: outcomes,
    };
  }

  /**
   * Get pattern performance report
   *
   * @param {string} patternId - Pattern ID
   * @returns {Object} Performance report
   */
  getPatternReport(patternId) {
    this.loadFeedback();

    const stats = this._feedbackHistory.patternStats[patternId];

    if (!stats) {
      return null;
    }

    const history = this._feedbackHistory.history
      .filter((f) => f.patternId === patternId)
      .slice(-20);

    return {
      patternId,
      stats,
      successRate: stats.successes / stats.totalExecutions,
      recentHistory: history,
      isDeprecated: stats.consecutiveFailures >= this.config.deprecateAfterFailures,
      recommendation: this._getRecommendation(stats),
    };
  }

  /**
   * Get recommendation for pattern
   * @private
   */
  _getRecommendation(stats) {
    const successRate = stats.successes / stats.totalExecutions;

    if (successRate >= 0.9) {
      return { action: 'keep', reason: 'High success rate' };
    }

    if (successRate >= 0.7) {
      return { action: 'monitor', reason: 'Moderate success rate' };
    }

    if (successRate >= 0.5) {
      return { action: 'review', reason: 'Below average success rate' };
    }

    return { action: 'replace', reason: 'Low success rate - consider alternatives' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  QAFeedbackProcessor,
  DEFAULT_CONFIG,
};
