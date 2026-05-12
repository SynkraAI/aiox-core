'use strict';

/**
 * G2 — Story Creation Gate
 *
 * Agent: @sm
 * Type: Human-in-loop, Advisory
 * Latency SLA: < 24h (async)
 * Blocking: No (advisory only)
 *
 * Purpose: Checks for existing tasks and templates matching the story work
 * before story creation. Suggests existing artifacts the SM can reference.
 *
 * Composes with IncrementalDecisionEngine.analyze() (public API).
 *
 * Source: IDS-5a, ids-principles.md G2 definition
 */

const path = require('path');
const { VerificationGate } = require(path.resolve(__dirname, '../verification-gate.js'));

class G2StoryCreationGate extends VerificationGate {
  /**
   * @param {object} options
   * @param {import('../incremental-decision-engine').IncrementalDecisionEngine} options.decisionEngine
   * @param {object} [options.circuitBreakerOptions]
   * @param {number} [options.timeoutMs]
   * @param {Function} [options.logger]
   */
  constructor(options = {}) {
    if (!options.decisionEngine) {
      throw new Error('[IDS-G2] decisionEngine is required');
    }

    super({
      gateId: 'G2',
      agent: '@sm',
      blocking: false,
      timeoutMs: options.timeoutMs,
      circuitBreakerOptions: options.circuitBreakerOptions,
      logger: options.logger,
    });

    this._decisionEngine = options.decisionEngine;
  }

  /**
   * Verify story creation context against existing tasks/templates.
   *
   * @param {object} context
   * @param {string} context.intent — Story description or intent
   * @param {string[]} [context.acceptanceCriteria] — AC list for richer matching
   * @returns {Promise<object>} { passed, warnings, opportunities }
   */
  async _doVerify(context) {
    if (!context || !context.intent) {
      return {
        passed: true,
        warnings: ['No story intent provided for G2 verification'],
        opportunities: [],
      };
    }

    // Build enriched intent from story description + acceptance criteria
    let enrichedIntent = context.intent;
    if (context.acceptanceCriteria && context.acceptanceCriteria.length > 0) {
      enrichedIntent += ' ' + context.acceptanceCriteria.join(' ');
    }

    // Query for matching tasks
    const taskAnalysis = this._decisionEngine.analyze(enrichedIntent, {
      type: 'task',
    });

    // Query for matching templates
    const templateAnalysis = this._decisionEngine.analyze(enrichedIntent, {
      type: 'template',
    });

    const opportunities = [];
    const warnings = [];

    // Collect task matches
    const taskMatches = (taskAnalysis.recommendations || []).map((rec) => ({
      entity: rec.entityPath,
      relevance: rec.relevanceScore,
      recommendation: rec.decision,
      reason: rec.rationale,
      type: 'task',
    }));

    // Collect template matches
    const templateMatches = (templateAnalysis.recommendations || []).map((rec) => ({
      entity: rec.entityPath,
      relevance: rec.relevanceScore,
      recommendation: rec.decision,
      reason: rec.rationale,
      type: 'template',
    }));

    opportunities.push(...taskMatches, ...templateMatches);

    // Sort by relevance descending
    opportunities.sort((a, b) => b.relevance - a.relevance);

    if (taskMatches.length > 0) {
      warnings.push(
        `Found ${taskMatches.length} existing tasks matching story work`,
      );
    }
    if (templateMatches.length > 0) {
      warnings.push(
        `Found ${templateMatches.length} existing templates matching story output`,
      );
    }

    if (taskAnalysis.warnings) {
      warnings.push(...taskAnalysis.warnings);
    }
    if (templateAnalysis.warnings) {
      warnings.push(...templateAnalysis.warnings);
    }

    // Advisory gate: always passes
    return {
      passed: true,
      warnings,
      opportunities,
    };
  }
}

module.exports = { G2StoryCreationGate };
