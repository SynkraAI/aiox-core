/**
 * @module PatternValidator
 * @description Validates workflow patterns before storage
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 */

'use strict';

/**
 * Default validation rules
 * @type {Object}
 */
const DEFAULT_VALIDATION_RULES = {
  minSequenceLength: 3,
  maxSequenceLength: 10,
  minOccurrences: 2,
  minSuccessRate: 0.8,
  requiredKeyCommands: [
    'develop',
    'review-qa',
    'create-story',
    'validate-story-draft',
    'apply-qa-fixes',
    'run-tests',
  ],
  similarityThreshold: 0.85, // For fuzzy duplicate detection
};

/**
 * Known AIOX task registry commands
 * @type {Set<string>}
 */
const KNOWN_COMMANDS = new Set([
  'develop',
  'develop-yolo',
  'develop-interactive',
  'develop-preflight',
  'review-qa',
  'apply-qa-fixes',
  'run-tests',
  'create-story',
  'create-next-story',
  'validate-story-draft',
  'create-pr',
  'push',
  'backlog-debt',
  'help',
  'exit',
  'guide',
  'explain',
  'session-info',
  'load-full',
  'clear-cache',
  'patterns',
  'next',
]);

/**
 * PatternValidator class for validating pattern quality
 */
class PatternValidator {
  /**
   * Create a PatternValidator instance
   * @param {Object} options - Configuration options
   * @param {Object} options.rules - Custom validation rules
   */
  constructor(options = {}) {
    this.rules = { ...DEFAULT_VALIDATION_RULES, ...options.rules };
  }

  /**
   * Validate a pattern against all rules
   * @param {Object} pattern - Pattern to validate
   * @returns {Object} Validation result with valid flag and reasons
   */
  validate(pattern) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!pattern) {
      return { valid: false, errors: ['Pattern is null or undefined'], warnings: [] };
    }

    if (!pattern.sequence || !Array.isArray(pattern.sequence)) {
      return { valid: false, errors: ['Missing or invalid sequence'], warnings: [] };
    }

    // Rule 1: Minimum sequence length
    if (pattern.sequence.length < this.rules.minSequenceLength) {
      errors.push(
        `Sequence too short: ${pattern.sequence.length} < minimum ${this.rules.minSequenceLength}`,
      );
    }

    // Rule 2: Maximum sequence length
    if (pattern.sequence.length > this.rules.maxSequenceLength) {
      warnings.push(
        `Sequence unusually long: ${pattern.sequence.length} > ${this.rules.maxSequenceLength}`,
      );
    }

    // Rule 3: Minimum occurrences for promotion
    if (pattern.occurrences !== undefined && pattern.occurrences < this.rules.minOccurrences) {
      warnings.push(
        `Low occurrences: ${pattern.occurrences} < minimum ${this.rules.minOccurrences} for promotion`,
      );
    }

    // Rule 4: Minimum success rate
    if (pattern.successRate !== undefined && pattern.successRate < this.rules.minSuccessRate) {
      errors.push(
        `Success rate too low: ${(pattern.successRate * 100).toFixed(1)}% < ${(this.rules.minSuccessRate * 100).toFixed(1)}%`,
      );
    }

    // Rule 5: Must contain at least one key workflow command
    const hasKeyCommand = pattern.sequence.some((cmd) =>
      this.rules.requiredKeyCommands.some((key) => cmd.includes(key)),
    );
    if (!hasKeyCommand) {
      errors.push('Sequence must contain at least one key workflow command');
    }

    // Rule 6: All commands should exist in AIOX task registry
    const unknownCommands = pattern.sequence.filter((cmd) => !this._isKnownCommand(cmd));
    if (unknownCommands.length > 0) {
      warnings.push(`Unknown commands: ${unknownCommands.join(', ')}`);
    }

    // Rule 7: No duplicate consecutive commands
    const hasDuplicateConsecutive = pattern.sequence.some(
      (cmd, i) => i > 0 && cmd === pattern.sequence[i - 1],
    );
    if (hasDuplicateConsecutive) {
      warnings.push('Pattern contains duplicate consecutive commands');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      reason: errors.length > 0 ? errors.join('; ') : null,
    };
  }

  /**
   * Check if a pattern is a duplicate of existing patterns
   * @param {Object} pattern - Pattern to check
   * @param {Object[]} existingPatterns - Existing patterns to compare against
   * @returns {Object} Duplicate check result
   */
  isDuplicate(pattern, existingPatterns) {
    if (!existingPatterns || existingPatterns.length === 0) {
      return { isDuplicate: false };
    }

    for (const existing of existingPatterns) {
      // Exact match check first
      if (this._isExactMatch(pattern.sequence, existing.sequence)) {
        return {
          isDuplicate: true,
          duplicateOf: existing.id,
          similarity: 1.0,
          exact: true,
        };
      }

      // Then similarity check
      const similarity = this._calculateSimilarity(pattern.sequence, existing.sequence);

      if (similarity >= this.rules.similarityThreshold) {
        return {
          isDuplicate: true,
          duplicateOf: existing.id,
          similarity: similarity,
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Check if pattern meets minimum threshold for promotion
   * @param {Object} pattern - Pattern to check
   * @returns {Object} Threshold check result
   */
  meetsMinimumThreshold(pattern) {
    const meetsOccurrences = pattern.occurrences >= this.rules.minOccurrences;
    const meetsSuccessRate = pattern.successRate >= this.rules.minSuccessRate;

    return {
      meetsThreshold: meetsOccurrences && meetsSuccessRate,
      meetsOccurrences: meetsOccurrences,
      meetsSuccessRate: meetsSuccessRate,
      currentOccurrences: pattern.occurrences,
      requiredOccurrences: this.rules.minOccurrences,
      currentSuccessRate: pattern.successRate,
      requiredSuccessRate: this.rules.minSuccessRate,
    };
  }

  /**
   * Get current validation rules
   * @returns {Object} Current validation rules
   */
  getValidationRules() {
    return { ...this.rules };
  }

  /**
   * Update validation rules
   * @param {Object} newRules - New rules to merge
   */
  updateRules(newRules) {
    this.rules = { ...this.rules, ...newRules };
  }

  /**
   * Check if a command is known in the AIOX task registry
   * @param {string} command - Command to check
   * @returns {boolean} True if command is known
   * @private
   */
  _isKnownCommand(command) {
    const normalized = command.toLowerCase().replace(/^\*/, '').trim();

    // Direct match
    if (KNOWN_COMMANDS.has(normalized)) {
      return true;
    }

    // Prefix match (e.g., "develop-yolo" starts with known "develop")
    for (const known of KNOWN_COMMANDS) {
      if (normalized.startsWith(known) || known.startsWith(normalized)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate similarity between two sequences using Jaccard similarity
   * @param {string[]} seq1 - First sequence
   * @param {string[]} seq2 - Second sequence
   * @returns {number} Similarity score (0-1)
   * @private
   */
  _calculateSimilarity(seq1, seq2) {
    if (!seq1 || !seq2 || seq1.length === 0 || seq2.length === 0) {
      return 0;
    }

    const set1 = new Set(seq1);
    const set2 = new Set(seq2);

    // Jaccard similarity
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const jaccardSimilarity = intersection.size / union.size;

    // Order similarity (for sequence patterns, order matters)
    let orderScore = 0;
    const minLen = Math.min(seq1.length, seq2.length);
    for (let i = 0; i < minLen; i++) {
      if (seq1[i] === seq2[i]) {
        orderScore++;
      }
    }
    const orderSimilarity = orderScore / Math.max(seq1.length, seq2.length);

    // Combined score (weighted average)
    return jaccardSimilarity * 0.4 + orderSimilarity * 0.6;
  }

  /**
   * Check if two sequences are exactly the same
   * @param {string[]} seq1 - First sequence
   * @param {string[]} seq2 - Second sequence
   * @returns {boolean} True if exact match
   * @private
   */
  _isExactMatch(seq1, seq2) {
    if (seq1.length !== seq2.length) {
      return false;
    }
    return seq1.every((cmd, i) => cmd === seq2[i]);
  }
}

/**
 * Create a new PatternValidator instance
 * @param {Object} options - Configuration options
 * @returns {PatternValidator} New instance
 */
function createPatternValidator(options = {}) {
  return new PatternValidator(options);
}

module.exports = {
  PatternValidator,
  createPatternValidator,
  DEFAULT_VALIDATION_RULES,
  KNOWN_COMMANDS,
};
