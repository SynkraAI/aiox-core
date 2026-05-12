/**
 * Decision Tracking Context for Yolo Mode
 *
 * Maintains execution context and decision log during autonomous development.
 * Used by dev agent in yolo mode to track decisions, files, tests, and metrics.
 *
 * @module decision-context
 * @see .aiox-core/scripts/decision-log-generator.js - Generates final log from this context
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Decision classification types (AC7)
 */
const DECISION_TYPES = {
  'library-choice': 'Selecting external dependencies',
  'architecture': 'System design and structural decisions',
  'algorithm': 'Algorithm selection and optimization',
  'error-handling': 'Error handling and recovery strategies',
  'testing-strategy': 'Test approach and coverage decisions',
  'performance': 'Performance optimization choices',
  'security': 'Security implementation decisions',
  'database': 'Data model and query optimization',
};

/**
 * Priority levels for decisions (AC7)
 */
const PRIORITY_LEVELS = {
  'critical': 'High-impact architectural decisions with long-term consequences',
  'high': 'Significant technical choices affecting multiple components',
  'medium': 'Standard implementation decisions with local impact',
  'low': 'Minor preference decisions with minimal impact',
};

/**
 * Decision Tracking Context
 *
 * Tracks all decisions, file changes, tests, and metrics during yolo mode execution.
 */
class DecisionContext {
  /**
   * Initialize decision tracking context
   *
   * @param {string} agentId - Agent identifier (e.g., 'dev')
   * @param {string} storyPath - Path to story file being implemented
   * @param {Object} options - Additional options
   * @param {boolean} options.enabled - Whether decision logging is enabled (default: true)
   */
  constructor(agentId, storyPath, options = {}) {
    this.agentId = agentId;
    this.storyPath = storyPath;
    this.startTime = Date.now();
    this.endTime = null;
    this.status = 'running';
    this.enabled = options.enabled !== false;

    // Core tracking arrays
    this.decisions = [];
    this.filesModified = [];
    this.testsRun = [];
    this.metrics = {
      agentLoadTime: options.agentLoadTime || 0,
      taskExecutionTime: 0,
    };

    // Capture git commit for rollback (AC5)
    try {
      this.commitBefore = execSync('git rev-parse HEAD').toString().trim();
    } catch (error) {
      this.commitBefore = 'unknown';
      console.warn('Warning: Could not capture git commit hash:', error.message);
    }
  }

  /**
   * Record an autonomous decision (AC2, AC7)
   *
   * @param {Object} decision - Decision details
   * @param {string} decision.description - What decision was made
   * @param {string} decision.reason - Why this choice was made
   * @param {string[]} decision.alternatives - Other options considered
   * @param {string} decision.type - Decision type (from DECISION_TYPES)
   * @param {string} decision.priority - Priority level (from PRIORITY_LEVELS)
   * @returns {Object} The recorded decision with timestamp
   */
  recordDecision({ description, reason, alternatives = [], type = 'architecture', priority = 'medium' }) {
    if (!this.enabled) return null;

    // Validate decision type and priority
    if (!DECISION_TYPES[type]) {
      console.warn(`Warning: Unknown decision type "${type}", using "architecture"`);
      type = 'architecture';
    }
    if (!PRIORITY_LEVELS[priority]) {
      console.warn(`Warning: Unknown priority level "${priority}", using "medium"`);
      priority = 'medium';
    }

    const decision = {
      timestamp: Date.now(),
      description,
      reason,
      alternatives: Array.isArray(alternatives) ? alternatives : [],
      type,
      priority,
    };

    this.decisions.push(decision);
    return decision;
  }

  /**
   * Track a file modification (AC2)
   *
   * @param {string} filePath - Path to modified file
   * @param {string} action - Action performed ('created', 'modified', 'deleted')
   */
  trackFile(filePath, action = 'modified') {
    if (!this.enabled) return;

    const normalizedPath = path.normalize(filePath);

    // Avoid duplicates - update existing entry if path already tracked
    const existingIndex = this.filesModified.findIndex(f =>
      (typeof f === 'string' ? f : f.path) === normalizedPath,
    );

    if (existingIndex >= 0) {
      if (typeof this.filesModified[existingIndex] === 'string') {
        this.filesModified[existingIndex] = { path: normalizedPath, action };
      } else {
        this.filesModified[existingIndex].action = action;
      }
    } else {
      this.filesModified.push({ path: normalizedPath, action });
    }
  }

  /**
   * Track test execution (AC2)
   *
   * @param {Object} test - Test details
   * @param {string} test.name - Test file or suite name
   * @param {boolean} test.passed - Whether test passed
   * @param {number} test.duration - Execution time in ms
   * @param {string} test.error - Error message if failed
   */
  trackTest({ name, passed, duration, error }) {
    if (!this.enabled) return;

    this.testsRun.push({
      name,
      passed,
      duration: duration || 0,
      error: error || null,
      timestamp: Date.now(),
    });
  }

  /**
   * Update execution metrics (AC2, AC8)
   *
   * @param {Object} metrics - Metrics to update
   * @param {number} metrics.agentLoadTime - Agent initialization time in ms
   * @param {number} metrics.taskExecutionTime - Task execution time in ms
   */
  updateMetrics(metrics) {
    if (!this.enabled) return;
    this.metrics = { ...this.metrics, ...metrics };
  }

  /**
   * Mark execution as complete
   *
   * @param {string} status - Final status ('completed', 'failed', 'cancelled')
   */
  complete(status = 'completed') {
    this.endTime = Date.now();
    this.status = status;
    this.metrics.taskExecutionTime = this.endTime - this.startTime;
  }

  /**
   * Get context as plain object for decision log generation
   *
   * @returns {Object} Context data
   */
  toObject() {
    return {
      agentId: this.agentId,
      storyPath: this.storyPath,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      decisions: this.decisions,
      filesModified: this.filesModified,
      testsRun: this.testsRun,
      metrics: this.metrics,
      commitBefore: this.commitBefore,
    };
  }

  /**
   * Get summary statistics
   *
   * @returns {Object} Summary stats
   */
  getSummary() {
    return {
      decisionsCount: this.decisions.length,
      filesModifiedCount: this.filesModified.length,
      testsRunCount: this.testsRun.length,
      testsPassed: this.testsRun.filter(t => t.passed).length,
      testsFailed: this.testsRun.filter(t => !t.passed).length,
      duration: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime,
      status: this.status,
    };
  }
}

module.exports = {
  DecisionContext,
  DECISION_TYPES,
  PRIORITY_LEVELS,
};
