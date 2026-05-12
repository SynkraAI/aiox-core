'use strict';

/**
 * G4 — Dev Context Gate
 *
 * Agent: @dev
 * Type: Automated, Informational
 * Latency SLA: < 2s
 * Blocking: No (non-blocking, logged only for metrics)
 *
 * Purpose: Automated reminder at start of development task.
 * Queries registry for relevant artifacts and displays matching entities
 * as informational context. ALL invocations are logged for metrics.
 *
 * Performance target: < 2s execution time.
 *
 * Composes with IncrementalDecisionEngine.analyze() (public API).
 *
 * Source: IDS-5a, ids-principles.md G4 definition
 */

const path = require('path');
const { VerificationGate } = require(path.resolve(__dirname, '../verification-gate.js'));

// G4 has stricter timeout since it must be < 2s
const G4_DEFAULT_TIMEOUT_MS = 2000;

class G4DevContextGate extends VerificationGate {
  /**
   * @param {object} options
   * @param {import('../incremental-decision-engine').IncrementalDecisionEngine} options.decisionEngine
   * @param {object} [options.circuitBreakerOptions]
   * @param {number} [options.timeoutMs=2000] — G4 defaults to 2s
   * @param {Function} [options.logger]
   */
  constructor(options = {}) {
    if (!options.decisionEngine) {
      throw new Error('[IDS-G4] decisionEngine is required');
    }

    super({
      gateId: 'G4',
      agent: '@dev',
      blocking: false, // Never blocks
      timeoutMs: options.timeoutMs ?? G4_DEFAULT_TIMEOUT_MS,
      circuitBreakerOptions: options.circuitBreakerOptions,
      logger: options.logger,
    });

    this._decisionEngine = options.decisionEngine;
    this._metricsLog = [];
  }

  /**
   * Query registry for relevant artifacts at dev context start.
   *
   * @param {object} context
   * @param {string} context.intent — Story/task description
   * @param {string} [context.storyId] — Story ID for logging
   * @param {string[]} [context.filePaths] — File paths being worked on
   * @returns {Promise<object>} { passed, warnings, opportunities }
   */
  async _doVerify(context) {
    if (!context || !context.intent) {
      return {
        passed: true,
        warnings: ['No intent provided for G4 dev context check'],
        opportunities: [],
      };
    }

    const startTime = Date.now();

    // Build enriched intent from story context + file paths
    let enrichedIntent = context.intent;
    if (context.filePaths && context.filePaths.length > 0) {
      // Extract meaningful parts from file paths
      const pathKeywords = context.filePaths
        .map((p) => path.basename(p, path.extname(p)))
        .join(' ');
      enrichedIntent += ' ' + pathKeywords;
    }

    const analysis = this._decisionEngine.analyze(enrichedIntent, {
      type: context.type || undefined,
      category: context.category || undefined,
    });

    const opportunities = (analysis.recommendations || []).map((rec) => ({
      entity: rec.entityPath,
      relevance: rec.relevanceScore,
      recommendation: rec.decision,
      reason: rec.rationale,
    }));

    const warnings = [];
    if (opportunities.length > 0) {
      warnings.push(
        `[Dev Context] ${opportunities.length} relevant artifacts found. Consider REUSE/ADAPT before creating new.`,
      );
    }

    if (analysis.warnings) {
      warnings.push(...analysis.warnings);
    }

    // Log metrics for every invocation
    const executionTimeMs = Date.now() - startTime;
    this._recordMetrics({
      storyId: context.storyId || 'unknown',
      intent: context.intent,
      matchesFound: opportunities.length,
      executionTimeMs,
      timestamp: new Date().toISOString(),
    });

    // Informational gate: always passes, never blocks
    return {
      passed: true,
      warnings,
      opportunities,
    };
  }

  /**
   * Record metrics for this invocation.
   * Kept in-memory for now; future IDS stories may persist to file.
   *
   * @param {object} metrics
   */
  _recordMetrics(metrics) {
    this._metricsLog.push(metrics);
    this._log('info', `Metrics recorded for ${metrics.storyId}`, {
      matchesFound: metrics.matchesFound,
      executionTimeMs: metrics.executionTimeMs,
    });
  }

  /**
   * Get accumulated metrics log.
   * @returns {object[]}
   */
  getMetricsLog() {
    return [...this._metricsLog];
  }

  /**
   * Clear metrics log.
   */
  clearMetricsLog() {
    this._metricsLog = [];
  }
}

module.exports = { G4DevContextGate, G4_DEFAULT_TIMEOUT_MS };
