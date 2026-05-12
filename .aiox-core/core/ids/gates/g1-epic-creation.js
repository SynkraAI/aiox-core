'use strict';

/**
 * G1 — Epic Creation Gate
 *
 * Agent: @pm
 * Type: Human-in-loop, Advisory
 * Latency SLA: < 24h (async)
 * Blocking: No (advisory only)
 *
 * Purpose: Queries the registry for related entities before epic approval.
 * Presents potentially reusable artifacts to the PM agent so they can
 * decide whether to REUSE, ADAPT, or CREATE new work.
 *
 * Composes with IncrementalDecisionEngine.analyze() (public API).
 *
 * Source: IDS-5a, ids-principles.md G1 definition
 */

const path = require('path');
const { VerificationGate } = require(path.resolve(__dirname, '../verification-gate.js'));

class G1EpicCreationGate extends VerificationGate {
  /**
   * @param {object} options
   * @param {import('../incremental-decision-engine').IncrementalDecisionEngine} options.decisionEngine
   * @param {object} [options.circuitBreakerOptions]
   * @param {number} [options.timeoutMs]
   * @param {Function} [options.logger]
   */
  constructor(options = {}) {
    if (!options.decisionEngine) {
      throw new Error('[IDS-G1] decisionEngine is required');
    }

    super({
      gateId: 'G1',
      agent: '@pm',
      blocking: false,
      timeoutMs: options.timeoutMs,
      circuitBreakerOptions: options.circuitBreakerOptions,
      logger: options.logger,
    });

    this._decisionEngine = options.decisionEngine;
  }

  /**
   * Verify epic creation context against the registry.
   *
   * @param {object} context
   * @param {string} context.intent — Epic description or intent
   * @param {string} [context.epicTitle] — Epic title for additional context
   * @returns {Promise<object>} { passed, warnings, opportunities }
   */
  async _doVerify(context) {
    if (!context || !context.intent) {
      return {
        passed: true,
        warnings: ['No epic intent provided for G1 verification'],
        opportunities: [],
      };
    }

    const intent = context.epicTitle
      ? `${context.epicTitle}: ${context.intent}`
      : context.intent;

    const analysis = this._decisionEngine.analyze(intent, {
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
        `Found ${opportunities.length} related entities that may be reusable`,
      );
    }

    if (analysis.warnings) {
      warnings.push(...analysis.warnings);
    }

    // Advisory gate: always passes, surfaces opportunities
    return {
      passed: true,
      warnings,
      opportunities,
    };
  }
}

module.exports = { G1EpicCreationGate };
