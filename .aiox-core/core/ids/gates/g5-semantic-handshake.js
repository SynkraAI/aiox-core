'use strict';

/**
 * G5 — Semantic Handshake Gate
 *
 * Agent: @dev
 * Type: Automated, Blocking when Semantic Handshake reports BLOCKER violations
 *
 * Purpose: Preserve intent integrity between planning and implementation by
 * evaluating proposed code against executable planning constraints.
 */

const path = require('path');
const { VerificationGate } = require(path.resolve(__dirname, '../verification-gate.js'));
const {
  SemanticHandshakeEngine,
} = require(path.resolve(__dirname, '../../synapse/context/semantic-handshake-engine.js'));

const G5_DEFAULT_TIMEOUT_MS = 2000;

class G5SemanticHandshakeGate extends VerificationGate {
  constructor(options = {}) {
    super({
      gateId: 'G5',
      agent: '@dev',
      blocking: true,
      timeoutMs: options.timeoutMs ?? G5_DEFAULT_TIMEOUT_MS,
      circuitBreakerOptions: options.circuitBreakerOptions,
      logger: options.logger,
    });

    this._engine = options.engine || new SemanticHandshakeEngine({
      constraints: options.constraints || [],
    });
  }

  async _doVerify(context = {}) {
    const engine = this._createScopedEngine(context);

    const constraints = engine.getConstraints();
    if (constraints.length === 0) {
      return {
        passed: true,
        warnings: ['No Semantic Handshake constraints registered'],
        opportunities: [],
      };
    }

    if (!this._hasCodeContext(context)) {
      return {
        passed: true,
        warnings: ['Semantic Handshake constraints registered, but no proposed code was provided'],
        opportunities: constraints.map(constraint => ({
          entity: constraint.id,
          recommendation: constraint.description,
          severity: constraint.severity,
        })),
      };
    }

    const result = await engine.validateExecutionIntent(context);
    const report = engine.generateComplianceReport(result);

    return {
      passed: result.passed,
      warnings: [
        ...result.warnings,
        ...result.blockingViolations.map(violation => violation.message),
      ],
      opportunities: [
        ...result.verifiedConstraints.map(constraint => ({
          entity: constraint.id,
          recommendation: 'Constraint verified',
          severity: constraint.severity,
        })),
        ...result.violations.map(violation => ({
          entity: violation.id,
          recommendation: violation.message,
          severity: violation.severity,
          matches: violation.matches,
        })),
      ],
      override: result.passed ? null : {
        reason: 'Semantic Handshake blocker violation',
        correctionPrompt: result.correctionPrompt,
        report,
      },
    };
  }

  _createScopedEngine(context) {
    const engine = typeof this._engine.clone === 'function'
      ? this._engine.clone()
      : new SemanticHandshakeEngine();

    this._registerContextConstraints(engine, context);
    return engine;
  }

  _registerContextConstraints(engine, context) {
    const planningText = [
      context.planningOutput,
      context.planningText,
      context.architectureText,
      context.storyText,
    ].filter(Boolean).join('\n\n');

    if (planningText.trim()) {
      engine.registerConstraints(planningText, {
        source: context.source || '@architect',
        metadata: {
          storyId: context.storyId || 'unknown',
        },
      });
    }

    if (Array.isArray(context.constraints)) {
      for (const constraint of context.constraints) {
        engine.addConstraint(constraint);
      }
    }
  }

  _hasCodeContext(context) {
    return Boolean(
      context.proposedCode ||
      (Array.isArray(context.files) && context.files.length > 0) ||
      (Array.isArray(context.diffs) && context.diffs.length > 0) ||
      (Array.isArray(context.codeFiles) && context.codeFiles.length > 0),
    );
  }
}

module.exports = {
  G5SemanticHandshakeGate,
  G5_DEFAULT_TIMEOUT_MS,
};
