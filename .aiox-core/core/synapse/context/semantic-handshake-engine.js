/**
 * Semantic Handshake Engine
 *
 * Converts planning constraints into executable assertions that can be
 * validated before development execution. The engine is deterministic and
 * offline-friendly: callers may add structured constraints directly, or ask
 * the engine to extract a small set of known hard rules from planning text.
 *
 * @module core/synapse/context/semantic-handshake-engine
 * @created Story 483.1 - Semantic Handshake Contract and Pre-Execution Gate
 */

'use strict';

const DEFAULT_SOURCE = '@architect';

const ConstraintType = Object.freeze({
  TECH_STACK: 'TECH_STACK',
  PATTERN: 'PATTERN',
  SECURITY: 'SECURITY',
  PERFORMANCE: 'PERFORMANCE',
  IMPORTS: 'IMPORTS',
  CUSTOM: 'CUSTOM',
});

const ConstraintSeverity = Object.freeze({
  BLOCKER: 'BLOCKER',
  WARNING: 'WARNING',
});

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSeverity(value) {
  return value === ConstraintSeverity.WARNING
    ? ConstraintSeverity.WARNING
    : ConstraintSeverity.BLOCKER;
}

function normalizeType(value) {
  return Object.values(ConstraintType).includes(value) ? value : ConstraintType.CUSTOM;
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function normalizePattern(pattern) {
  if (!pattern) return null;
  if (pattern instanceof RegExp) return pattern;

  if (typeof pattern === 'string') {
    return new RegExp(escapeRegExp(pattern), 'i');
  }

  if (pattern.pattern) {
    return new RegExp(pattern.pattern, pattern.flags || 'i');
  }

  return null;
}

function normalizePatterns(patterns) {
  if (!patterns) return [];
  const input = Array.isArray(patterns) ? patterns : [patterns];
  return input.map(normalizePattern).filter(Boolean);
}

function patternMatches(pattern, text) {
  pattern.lastIndex = 0;
  return pattern.test(text);
}

function findPatternMatches(patterns, text) {
  const matches = [];

  for (const pattern of patterns) {
    if (patternMatches(pattern, text)) {
      matches.push(pattern.toString());
    }
  }

  return matches;
}

function normalizeContent(value) {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

function normalizeFiles(input = {}) {
  if (typeof input === 'string') {
    return [{ path: '<inline>', content: input }];
  }

  if (input.proposedCode) {
    return [{ path: input.path || '<inline>', content: input.proposedCode }];
  }

  const candidates = input.files || input.diffs || input.codeFiles || [];
  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates
    .map((file, index) => {
      if (typeof file === 'string') {
        return { path: `<inline:${index + 1}>`, content: file };
      }

      if (!file || typeof file !== 'object') {
        return null;
      }

      return {
        path: file.path || file.filePath || `<inline:${index + 1}>`,
        content: normalizeContent(file.content ?? file.after ?? file.diff ?? file.code),
      };
    })
    .filter(Boolean);
}

function buildCodeContext(files) {
  return files.map(file => `// File: ${file.path}\n${file.content}`).join('\n\n');
}

const DEFAULT_EXTRACTORS = [
  {
    id: 'TECH-POSTGRESQL',
    detects: [/\bpostgres(?:ql)?\b/i],
    constraint: {
      source: DEFAULT_SOURCE,
      type: ConstraintType.TECH_STACK,
      severity: ConstraintSeverity.BLOCKER,
      description: 'Must use PostgreSQL adapter, not SQLite or another local database.',
      appliesWhen: [
        /\b(sqlite|better-sqlite3|mysql|mongodb|database|db|datasource|prisma|typeorm|sequelize|pg|postgres(?:ql)?)\b/i,
      ],
      requiredPatterns: [
        /\bpg\b/i,
        /\bpostgres(?:ql)?\b/i,
        /from\s+['"]pg['"]/i,
        /require\(\s*['"]pg['"]\s*\)/i,
      ],
      forbiddenPatterns: [
        /\bsqlite\b/i,
        /\bbetter-sqlite3\b/i,
      ],
    },
  },
  {
    id: 'ARCH-SERVERLESS-STATE',
    detects: [/\bserverless\b/i],
    constraint: {
      source: DEFAULT_SOURCE,
      type: ConstraintType.PATTERN,
      severity: ConstraintSeverity.BLOCKER,
      description: 'Serverless architecture must not write runtime state to the local filesystem.',
      forbiddenPatterns: [
        /\bfs\.writeFile(?:Sync)?\s*\(/,
        /\bfs\.appendFile(?:Sync)?\s*\(/,
        /\bfs\.createWriteStream\s*\(/,
        /require\(\s*['"]fs['"]\s*\)\.writeFile(?:Sync)?\s*\(/,
      ],
    },
  },
  {
    id: 'IMPORT-ABSOLUTE',
    detects: [/\babsolute imports?\b/i, /\bimports? absolutos?\b/i],
    constraint: {
      source: DEFAULT_SOURCE,
      type: ConstraintType.IMPORTS,
      severity: ConstraintSeverity.BLOCKER,
      description: 'Use absolute imports; parent-directory relative imports are not allowed.',
      forbiddenPatterns: [
        /from\s+['"]\.\.\//,
        /require\(\s*['"]\.\.\//,
      ],
    },
  },
  {
    id: 'SEC-NO-EVAL',
    detects: [/\bno eval\b/i, /\bnever use eval\b/i, /\bsem eval\b/i],
    constraint: {
      source: '@security',
      type: ConstraintType.SECURITY,
      severity: ConstraintSeverity.BLOCKER,
      description: 'Do not execute dynamic code with eval or new Function.',
      forbiddenPatterns: [
        /\beval\s*\(/,
        /\bnew\s+Function\s*\(/,
      ],
    },
  },
];

class SemanticHandshakeEngine {
  constructor(options = {}) {
    this._constraints = new Map();
    this._extractors = options.extractors || DEFAULT_EXTRACTORS;

    if (Array.isArray(options.constraints)) {
      for (const constraint of options.constraints) {
        this.addConstraint(constraint);
      }
    }
  }

  clone() {
    return new SemanticHandshakeEngine({
      extractors: this._extractors,
      constraints: [...this._constraints.values()].map(constraint => ({
        id: constraint.id,
        source: constraint.source,
        type: constraint.type,
        severity: constraint.severity,
        description: constraint.description,
        appliesWhen: constraint.appliesWhen,
        requiredPatterns: constraint.requiredPatterns,
        forbiddenPatterns: constraint.forbiddenPatterns,
        validator: constraint.validator,
        metadata: cloneValue(constraint.metadata || {}),
      })),
    });
  }

  /**
   * Extract known hard constraints from planning text.
   *
   * @param {string} planningOutput
   * @param {object} [options]
   * @returns {object[]} Registered constraints.
   */
  registerConstraints(planningOutput, options = {}) {
    const text = normalizeContent(planningOutput);
    const registered = [];

    for (const extractor of this._extractors) {
      const detects = normalizePatterns(extractor.detects);
      if (!detects.some(pattern => patternMatches(pattern, text))) {
        continue;
      }

      const constraint = this.addConstraint({
        id: extractor.id,
        ...extractor.constraint,
        source: options.source || extractor.constraint.source || DEFAULT_SOURCE,
        metadata: {
          ...(extractor.constraint.metadata || {}),
          ...(options.metadata || {}),
          extractedFrom: options.extractedFrom || 'planning-output',
        },
      });

      registered.push(constraint);
    }

    return registered;
  }

  addConstraint(input) {
    if (!input || typeof input !== 'object') {
      throw new TypeError('constraint must be an object');
    }

    if (!input.id && !input.description) {
      throw new Error('constraint requires id or description');
    }

    const id = String(input.id || input.description)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!id) {
      throw new Error('constraint id normalizes to an empty value');
    }

    const constraint = {
      id,
      source: input.source || DEFAULT_SOURCE,
      type: normalizeType(input.type),
      severity: normalizeSeverity(input.severity),
      description: input.description || id,
      appliesWhen: normalizePatterns(input.appliesWhen),
      requiredPatterns: normalizePatterns(input.requiredPatterns),
      forbiddenPatterns: normalizePatterns(input.forbiddenPatterns),
      validator: typeof input.validator === 'function' ? input.validator : null,
      metadata: cloneValue(input.metadata || {}),
    };

    this._constraints.set(id, constraint);
    return this._publicConstraint(constraint);
  }

  getConstraints() {
    return [...this._constraints.values()].map(constraint => this._publicConstraint(constraint));
  }

  clear() {
    this._constraints.clear();
  }

  /**
   * Validate proposed code or file list against registered constraints.
   *
   * @param {string|object} executionIntent
   * @returns {Promise<object>}
   */
  async validateExecutionIntent(executionIntent = {}) {
    const files = normalizeFiles(executionIntent);
    const codeContext = buildCodeContext(files);
    const violations = [];
    const blockingViolations = [];
    const warnings = [];
    const verifiedConstraints = [];
    const skippedConstraints = [];

    for (const constraint of this._constraints.values()) {
      const result = await this._evaluateConstraint(constraint, codeContext, files, executionIntent);

      if (result.skipped) {
        skippedConstraints.push(this._publicConstraint(constraint));
        continue;
      }

      if (result.passed) {
        verifiedConstraints.push(this._publicConstraint(constraint));
        continue;
      }

      violations.push(result.violation);
      if (constraint.severity === ConstraintSeverity.BLOCKER) {
        blockingViolations.push(result.violation);
      } else {
        warnings.push(result.violation.message);
      }
    }

    const passed = blockingViolations.length === 0;
    const response = {
      passed,
      evaluatedAt: new Date().toISOString(),
      constraintCount: this._constraints.size,
      files: files.map(file => file.path),
      verifiedConstraints,
      skippedConstraints,
      violations,
      blockingViolations,
      warnings,
    };

    response.correctionPrompt = this.buildCorrectionPrompt(response);
    return response;
  }

  generateComplianceReport(result) {
    const lines = ['Semantic Handshake Report'];
    lines.push(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    lines.push(`Constraints evaluated: ${result.constraintCount || 0}`);

    if (result.verifiedConstraints?.length) {
      lines.push('');
      lines.push('Verified constraints:');
      for (const constraint of result.verifiedConstraints) {
        lines.push(`- ${constraint.id}: ${constraint.description}`);
      }
    }

    if (result.skippedConstraints?.length) {
      lines.push('');
      lines.push('Skipped constraints:');
      for (const constraint of result.skippedConstraints) {
        lines.push(`- ${constraint.id}: not applicable to current code context`);
      }
    }

    if (result.violations?.length) {
      lines.push('');
      lines.push('Violations:');
      for (const violation of result.violations) {
        lines.push(`- [${violation.severity}] ${violation.id}: ${violation.message}`);
      }
    }

    if (!result.passed) {
      lines.push('');
      lines.push('Action: update the implementation or request an explicit architecture override.');
    }

    return lines.join('\n');
  }

  buildCorrectionPrompt(result) {
    if (!result || result.passed) {
      return '';
    }

    const lines = [
      'Semantic Handshake failed. Revise the implementation before continuing.',
      'Blocking constraints:',
    ];

    for (const violation of result.blockingViolations || []) {
      lines.push(`- ${violation.id}: ${violation.message}`);
    }

    return lines.join('\n');
  }

  toContextMessage(result, options = {}) {
    const content = [
      options.prefix || 'Pre-execution Semantic Handshake result:',
      this.generateComplianceReport(result),
      result?.correctionPrompt || '',
    ].filter(Boolean).join('\n\n');

    return {
      role: 'system',
      content,
      metadata: {
        aiox: {
          type: 'semantic_handshake_report',
          passed: Boolean(result?.passed),
          blockingViolationCount: result?.blockingViolations?.length || 0,
          violationCount: result?.violations?.length || 0,
          verifiedConstraintCount: result?.verifiedConstraints?.length || 0,
        },
      },
    };
  }

  async _evaluateConstraint(constraint, codeContext, files, executionIntent) {
    if (!this._constraintApplies(constraint, codeContext)) {
      return { skipped: true };
    }

    if (constraint.validator) {
      let validation;
      try {
        validation = await constraint.validator({
          codeContext,
          files,
          executionIntent,
          constraint: this._publicConstraint(constraint),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        validation = {
          passed: false,
          message: `Constraint validator failed: ${errorMessage}`,
          matches: ['validator-error'],
          metadata: {
            validatorError: {
              message: errorMessage,
              stack: error instanceof Error ? error.stack : null,
            },
          },
        };
      }
      return this._normalizeValidatorResult(validation, constraint);
    }

    const forbiddenMatches = findPatternMatches(constraint.forbiddenPatterns, codeContext);
    if (forbiddenMatches.length > 0) {
      return {
        passed: false,
        violation: this._buildViolation(constraint, {
          message: constraint.description,
          matches: forbiddenMatches,
        }),
      };
    }

    if (
      constraint.requiredPatterns.length > 0 &&
      findPatternMatches(constraint.requiredPatterns, codeContext).length === 0
    ) {
      return {
        passed: false,
        violation: this._buildViolation(constraint, {
          message: `Required implementation evidence missing: ${constraint.description}`,
          matches: [],
        }),
      };
    }

    return { passed: true };
  }

  _constraintApplies(constraint, codeContext) {
    if (!codeContext.trim()) return false;
    if (constraint.appliesWhen.length === 0) return true;
    return constraint.appliesWhen.some(pattern => patternMatches(pattern, codeContext));
  }

  _normalizeValidatorResult(validation, constraint) {
    if (validation === true || validation?.passed === true) {
      return { passed: true };
    }

    const message = validation?.message || constraint.description;
    return {
      passed: false,
      violation: this._buildViolation(constraint, {
        message,
        matches: validation?.matches || [],
        metadata: validation?.metadata || {},
      }),
    };
  }

  _buildViolation(constraint, fields = {}) {
    return {
      id: constraint.id,
      source: constraint.source,
      type: constraint.type,
      severity: constraint.severity,
      description: constraint.description,
      message: fields.message || constraint.description,
      matches: fields.matches || [],
      metadata: {
        ...cloneValue(constraint.metadata || {}),
        ...cloneValue(fields.metadata || {}),
      },
    };
  }

  _publicConstraint(constraint) {
    return {
      id: constraint.id,
      source: constraint.source,
      type: constraint.type,
      severity: constraint.severity,
      description: constraint.description,
      metadata: cloneValue(constraint.metadata || {}),
    };
  }
}

module.exports = {
  SemanticHandshakeEngine,
  ConstraintType,
  ConstraintSeverity,
  DEFAULT_EXTRACTORS,
};
