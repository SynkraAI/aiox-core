'use strict';

/**
 * G3 — Story Validation Gate
 *
 * Agent: @po
 * Type: Human-in-loop, Soft Block
 * Latency SLA: < 4h (async)
 * Blocking: Soft (can override with reason)
 *
 * Purpose: Validates that artifacts referenced in a story actually exist
 * in the registry, and detects potential duplication with existing entities.
 * Returns soft-block if references are invalid.
 *
 * Composes with IncrementalDecisionEngine.analyze() (public API).
 *
 * Source: IDS-5a, ids-principles.md G3 definition
 */

const path = require('path');
const { VerificationGate } = require(path.resolve(__dirname, '../verification-gate.js'));

class G3StoryValidationGate extends VerificationGate {
  /**
   * @param {object} options
   * @param {import('../incremental-decision-engine').IncrementalDecisionEngine} options.decisionEngine
   * @param {import('../registry-loader').RegistryLoader} options.registryLoader
   * @param {object} [options.circuitBreakerOptions]
   * @param {number} [options.timeoutMs]
   * @param {Function} [options.logger]
   */
  constructor(options = {}) {
    if (!options.decisionEngine) {
      throw new Error('[IDS-G3] decisionEngine is required');
    }
    if (!options.registryLoader) {
      throw new Error('[IDS-G3] registryLoader is required');
    }

    super({
      gateId: 'G3',
      agent: '@po',
      blocking: true, // Soft block: blocks validation but can be overridden
      timeoutMs: options.timeoutMs,
      circuitBreakerOptions: options.circuitBreakerOptions,
      logger: options.logger,
    });

    this._decisionEngine = options.decisionEngine;
    this._registryLoader = options.registryLoader;
  }

  /**
   * Validate story references and detect potential duplication.
   *
   * @param {object} context
   * @param {string} context.intent — Story description or intent
   * @param {string[]} [context.referencedArtifacts] — Artifact paths referenced in story
   * @param {object} [context.override] — Override object { reason, user }
   * @returns {Promise<object>} { passed, warnings, opportunities, override }
   */
  async _doVerify(context) {
    if (!context || !context.intent) {
      return {
        passed: true,
        warnings: ['No story intent provided for G3 verification'],
        opportunities: [],
      };
    }

    const warnings = [];
    const opportunities = [];
    let hasCriticalIssue = false;

    // Phase 1: Verify referenced artifacts exist in registry
    if (context.referencedArtifacts && context.referencedArtifacts.length > 0) {
      const validationResult = this._validateReferences(context.referencedArtifacts);
      if (validationResult.missingRefs.length > 0) {
        hasCriticalIssue = true;
        warnings.push(
          `${validationResult.missingRefs.length} referenced artifacts not found in registry: ` +
          validationResult.missingRefs.join(', '),
        );
      }
      if (validationResult.foundRefs.length > 0) {
        warnings.push(
          `${validationResult.foundRefs.length} referenced artifacts verified in registry`,
        );
      }
    }

    // Phase 2: Detect potential duplication
    const analysis = this._decisionEngine.analyze(context.intent, {
      type: context.type || undefined,
      category: context.category || undefined,
    });

    const duplicates = (analysis.recommendations || [])
      .filter((rec) => rec.relevanceScore >= 0.8)
      .map((rec) => ({
        entity: rec.entityPath,
        relevance: rec.relevanceScore,
        recommendation: rec.decision,
        reason: rec.rationale,
      }));

    if (duplicates.length > 0) {
      hasCriticalIssue = true;
      warnings.push(
        `Potential duplication detected: ${duplicates.length} highly similar entities found`,
      );
    }

    // Also surface lower-relevance opportunities
    const otherOpportunities = (analysis.recommendations || [])
      .filter((rec) => rec.relevanceScore < 0.8)
      .map((rec) => ({
        entity: rec.entityPath,
        relevance: rec.relevanceScore,
        recommendation: rec.decision,
        reason: rec.rationale,
      }));

    opportunities.push(...duplicates, ...otherOpportunities);

    if (analysis.warnings) {
      warnings.push(...analysis.warnings);
    }

    // Soft block: if critical issues found AND no override provided
    const hasValidOverride = Boolean(context.override && context.override.reason);
    const passed = !hasCriticalIssue || hasValidOverride;

    return {
      passed,
      warnings,
      opportunities,
      override: context.override || null,
    };
  }

  /**
   * Validate that artifact references exist in the registry.
   * Uses RegistryLoader.queryByPath() public API.
   *
   * @param {string[]} artifactPaths
   * @returns {object} { foundRefs, missingRefs }
   */
  _validateReferences(artifactPaths) {
    const foundRefs = [];
    const missingRefs = [];

    for (const artifactPath of artifactPaths) {
      const matches = this._registryLoader.queryByPath(artifactPath);
      if (matches.length > 0) {
        foundRefs.push(artifactPath);
      } else {
        missingRefs.push(artifactPath);
      }
    }

    return { foundRefs, missingRefs };
  }
}

module.exports = { G3StoryValidationGate };
