/**
 * @module learning
 * @description Pattern Learning module for Workflow Intelligence System
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 *
 * @example
 * const learning = require('./.aiox-core/workflow-intelligence/learning');
 *
 * // Capture a session pattern
 * const capture = learning.createPatternCapture();
 * const result = capture.captureSession({
 *   commands: ['validate-story-draft', 'develop', 'review-qa'],
 *   agentSequence: ['po', 'dev', 'qa'],
 *   success: true,
 *   timestamp: Date.now()
 * });
 *
 * // Validate the pattern
 * const validator = learning.createPatternValidator();
 * const validation = validator.validate(result.pattern);
 *
 * // Store if valid
 * if (validation.valid) {
 *   const store = learning.createPatternStore();
 *   store.save(result.pattern);
 * }
 */

'use strict';

const {
  PatternCapture,
  createPatternCapture,
  DEFAULT_MIN_SEQUENCE_LENGTH,
  KEY_WORKFLOW_COMMANDS,
} = require('./pattern-capture');

const {
  PatternValidator,
  createPatternValidator,
  DEFAULT_VALIDATION_RULES,
  KNOWN_COMMANDS,
} = require('./pattern-validator');

const {
  PatternStore,
  createPatternStore,
  DEFAULT_STORAGE_PATH,
  DEFAULT_MAX_PATTERNS,
  DEFAULT_PRUNE_THRESHOLD,
  PATTERN_STATUS,
} = require('./pattern-store');

const {
  GotchaRegistry,
  DEFAULT_CONFIG: GOTCHA_DEFAULT_CONFIG,
  GOTCHA_SCHEMA,
} = require('./gotcha-registry');

const {
  QAFeedbackProcessor,
  DEFAULT_CONFIG: QA_FEEDBACK_DEFAULT_CONFIG,
} = require('./qa-feedback');

const {
  SemanticSearch,
  createSemanticSearch,
  DEFAULT_CONFIG: SEMANTIC_SEARCH_DEFAULT_CONFIG,
} = require('./semantic-search');

/**
 * Singleton instances for default usage
 */
let defaultCapture = null;
let defaultValidator = null;
let defaultStore = null;
let defaultGotchaRegistry = null;
let defaultQAFeedbackProcessor = null;
let defaultSemanticSearch = null;

/**
 * Get or create the default PatternCapture instance
 * @returns {PatternCapture} Default capture instance
 */
function getDefaultCapture() {
  if (!defaultCapture) {
    defaultCapture = createPatternCapture();
  }
  return defaultCapture;
}

/**
 * Get or create the default PatternValidator instance
 * @returns {PatternValidator} Default validator instance
 */
function getDefaultValidator() {
  if (!defaultValidator) {
    defaultValidator = createPatternValidator();
  }
  return defaultValidator;
}

/**
 * Get or create the default PatternStore instance
 * @returns {PatternStore} Default store instance
 */
function getDefaultStore() {
  if (!defaultStore) {
    defaultStore = createPatternStore();
  }
  return defaultStore;
}

/**
 * Get or create the default GotchaRegistry instance
 * @param {Object} options - Options for GotchaRegistry
 * @returns {GotchaRegistry} Default gotcha registry instance
 */
function getDefaultGotchaRegistry(options = {}) {
  if (!defaultGotchaRegistry) {
    defaultGotchaRegistry = new GotchaRegistry(options);
  }
  return defaultGotchaRegistry;
}

/**
 * Get or create the default QAFeedbackProcessor instance
 * @param {Object} options - Options for QAFeedbackProcessor
 * @returns {QAFeedbackProcessor} Default QA feedback processor instance
 */
function getDefaultQAFeedbackProcessor(options = {}) {
  if (!defaultQAFeedbackProcessor) {
    // Inject gotcha registry and pattern store
    defaultQAFeedbackProcessor = new QAFeedbackProcessor({
      ...options,
      gotchaRegistry: getDefaultGotchaRegistry(),
      patternStore: getDefaultStore(),
    });
  }
  return defaultQAFeedbackProcessor;
}

/**
 * Get or create the default SemanticSearch instance
 * @param {Object} options - Options for SemanticSearch
 * @returns {SemanticSearch} Default semantic search instance
 */
function getDefaultSemanticSearch(options = {}) {
  if (!defaultSemanticSearch) {
    defaultSemanticSearch = createSemanticSearch(options);
  }
  return defaultSemanticSearch;
}

/**
 * Capture and store a pattern in one operation
 * @param {Object} sessionData - Session data
 * @returns {Object} Result with captured and stored status
 */
function captureAndStore(sessionData) {
  const capture = getDefaultCapture();
  const validator = getDefaultValidator();
  const store = getDefaultStore();

  // Capture
  const captureResult = capture.captureSession(sessionData);

  if (!captureResult.valid) {
    return {
      success: false,
      stage: 'capture',
      reason: captureResult.reason,
    };
  }

  // Validate
  const validation = validator.validate(captureResult.pattern);

  if (!validation.valid) {
    return {
      success: false,
      stage: 'validation',
      reason: validation.reason,
      errors: validation.errors,
    };
  }

  // Check for duplicates
  const existingPatterns = store.load().patterns;
  const duplicateCheck = validator.isDuplicate(captureResult.pattern, existingPatterns);

  if (duplicateCheck.isDuplicate) {
    // Update existing pattern instead
    const existing = existingPatterns.find((p) => p.id === duplicateCheck.duplicateOf);
    if (existing) {
      store.save(existing); // This will increment occurrences
      return {
        success: true,
        action: 'merged',
        patternId: existing.id,
      };
    }
  }

  // Store
  const storeResult = store.save(captureResult.pattern);

  return {
    success: true,
    action: storeResult.action,
    pattern: storeResult.pattern,
  };
}

/**
 * Get learned patterns for suggestions
 * @param {Object} options - Options
 * @param {boolean} options.activeOnly - Only return active/promoted patterns
 * @returns {Object[]} Patterns
 */
function getLearnedPatterns(options = {}) {
  const store = getDefaultStore();

  if (options.activeOnly) {
    return store.getActivePatterns();
  }

  return store.load().patterns;
}

/**
 * Find patterns matching a command sequence
 * @param {string[]} sequence - Command sequence to match
 * @returns {Object[]} Matching patterns
 */
function findMatchingPatterns(sequence) {
  const store = getDefaultStore();
  return store.findSimilar(sequence);
}

/**
 * Get pattern learning statistics
 * @returns {Object} Statistics
 */
function getStats() {
  return getDefaultStore().getStats();
}

/**
 * Reset singleton instances (for testing)
 */
function reset() {
  defaultCapture = null;
  defaultValidator = null;
  defaultStore = null;
  defaultGotchaRegistry = null;
  defaultQAFeedbackProcessor = null;
  defaultSemanticSearch = null;
}

module.exports = {
  // High-level API
  captureAndStore,
  getLearnedPatterns,
  findMatchingPatterns,
  getStats,
  reset,

  // Singleton accessors
  getDefaultCapture,
  getDefaultValidator,
  getDefaultStore,
  getDefaultGotchaRegistry,
  getDefaultQAFeedbackProcessor,
  getDefaultSemanticSearch,

  // Factory functions
  createPatternCapture,
  createPatternValidator,
  createPatternStore,
  createSemanticSearch,

  // Classes (for advanced usage)
  PatternCapture,
  PatternValidator,
  PatternStore,
  GotchaRegistry,
  QAFeedbackProcessor,
  SemanticSearch,

  // Constants
  DEFAULT_MIN_SEQUENCE_LENGTH,
  KEY_WORKFLOW_COMMANDS,
  DEFAULT_VALIDATION_RULES,
  KNOWN_COMMANDS,
  DEFAULT_STORAGE_PATH,
  DEFAULT_MAX_PATTERNS,
  DEFAULT_PRUNE_THRESHOLD,
  PATTERN_STATUS,
  GOTCHA_DEFAULT_CONFIG,
  GOTCHA_SCHEMA,
  QA_FEEDBACK_DEFAULT_CONFIG,
  SEMANTIC_SEARCH_DEFAULT_CONFIG,
};
