/**
 * Epic Executors Index
 *
 * Story: 0.3 - Epic Executors
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Exports all epic executors and utility functions.
 *
 * @module core/orchestration/executors
 * @version 1.0.0
 */

const EpicExecutor = require('./epic-executor');
const Epic3Executor = require('./epic-3-executor');
const Epic4Executor = require('./epic-4-executor');
const Epic5Executor = require('./epic-5-executor');
const Epic6Executor = require('./epic-6-executor');

const { ExecutionStatus } = EpicExecutor;
const { RecoveryStrategy } = Epic5Executor;
const { QAVerdict } = Epic6Executor;

/**
 * Map of epic numbers to executor classes
 */
const EXECUTOR_MAP = {
  3: Epic3Executor,
  4: Epic4Executor,
  5: Epic5Executor,
  6: Epic6Executor,
};

/**
 * Create an executor for the given epic number
 * @param {number} epicNum - Epic number (3-6)
 * @param {Object} orchestrator - Parent orchestrator instance
 * @returns {EpicExecutor} Executor instance
 */
function createExecutor(epicNum, orchestrator) {
  const ExecutorClass = EXECUTOR_MAP[epicNum];

  if (!ExecutorClass) {
    throw new Error(`No executor found for epic ${epicNum}`);
  }

  return new ExecutorClass(orchestrator);
}

/**
 * Check if an executor exists for the given epic
 * @param {number} epicNum - Epic number
 * @returns {boolean} True if executor exists
 */
function hasExecutor(epicNum) {
  return EXECUTOR_MAP[epicNum] !== undefined;
}

/**
 * Get all available epic numbers
 * @returns {number[]} Array of epic numbers with executors
 */
function getAvailableEpics() {
  return Object.keys(EXECUTOR_MAP).map((n) => parseInt(n, 10));
}

module.exports = {
  // Base class
  EpicExecutor,

  // Specific executors
  Epic3Executor,
  Epic4Executor,
  Epic5Executor,
  Epic6Executor,

  // Enums
  ExecutionStatus,
  RecoveryStrategy,
  QAVerdict,

  // Factory and utilities
  createExecutor,
  hasExecutor,
  getAvailableEpics,
  EXECUTOR_MAP,
};
