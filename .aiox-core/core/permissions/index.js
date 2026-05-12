/**
 * Permissions Module
 *
 * Provides permission mode management and operation guarding
 * for safe autonomous agent operations.
 *
 * @module permissions
 * @version 1.0.0
 *
 * @example
 * const { PermissionMode, OperationGuard } = require('./.aiox-core/core/permissions');
 *
 * // Check current mode
 * const mode = new PermissionMode();
 * await mode.load();
 * console.log(mode.getBadge()); // [⚠️ Ask]
 *
 * // Guard an operation
 * const guard = new OperationGuard(mode);
 * const result = await guard.guard('Bash', { command: 'rm -rf node_modules' });
 * if (result.blocked) {
 *   console.log(result.message);
 * }
 */

const { PermissionMode } = require('./permission-mode');
const { OperationGuard } = require('./operation-guard');

/**
 * Create a pre-configured guard instance
 * @param {string} projectRoot - Project root path
 * @returns {Promise<{mode: PermissionMode, guard: OperationGuard}>}
 */
async function createGuard(projectRoot = process.cwd()) {
  const mode = new PermissionMode(projectRoot);
  await mode.load();
  const guard = new OperationGuard(mode);
  return { mode, guard };
}

/**
 * Quick check if an operation is allowed
 * @param {string} tool - Tool name
 * @param {Object} params - Tool parameters
 * @param {string} projectRoot - Project root path
 * @returns {Promise<Object>} Guard result
 */
async function checkOperation(tool, params, projectRoot = process.cwd()) {
  const { guard } = await createGuard(projectRoot);
  return guard.guard(tool, params);
}

/**
 * Get current mode badge
 * @param {string} projectRoot - Project root path
 * @returns {Promise<string>} Mode badge like "[⚠️ Ask]"
 */
async function getModeBadge(projectRoot = process.cwd()) {
  const mode = new PermissionMode(projectRoot);
  await mode.load();
  return mode.getBadge();
}

/**
 * Set permission mode
 * @param {string} modeName - Mode name (explore, ask, auto)
 * @param {string} projectRoot - Project root path
 * @returns {Promise<Object>} Mode info
 */
async function setMode(modeName, projectRoot = process.cwd()) {
  const mode = new PermissionMode(projectRoot);
  return mode.setMode(modeName);
}

/**
 * Cycle permission mode: ask -> auto -> explore -> ask
 * Used by the *yolo command across all agents.
 * @param {string} projectRoot - Project root path
 * @returns {Promise<Object>} New mode info with badge
 */
async function cycleMode(projectRoot = process.cwd()) {
  const mode = new PermissionMode(projectRoot);
  const info = await mode.cycleMode();
  return {
    ...info,
    badge: mode.getBadge(),
    message: `Permission mode changed to: ${info.name} ${mode.getBadge()}`,
  };
}

/**
 * Enforce permission check before a destructive operation.
 * Returns a structured result that agents can use to decide
 * whether to proceed, prompt the user, or block the operation.
 *
 * @param {string} tool - Tool name (Write, Edit, Bash, etc.)
 * @param {Object} params - Tool parameters
 * @param {string} projectRoot - Project root path
 * @returns {Promise<Object>} Enforcement result:
 *   - { action: 'allow' } - Operation can proceed
 *   - { action: 'prompt', message: string } - Must ask user for confirmation
 *   - { action: 'deny', message: string } - Operation is blocked
 */
async function enforcePermission(tool, params = {}, projectRoot = process.cwd()) {
  const { guard } = await createGuard(projectRoot);
  const result = await guard.guard(tool, params);

  if (result.proceed) {
    return { action: 'allow', operation: result.operation };
  }

  if (result.needsConfirmation) {
    return {
      action: 'prompt',
      operation: result.operation,
      tool: result.tool,
      params: result.params,
      message: result.message,
    };
  }

  // Blocked
  return {
    action: 'deny',
    operation: result.operation,
    message: result.message,
  };
}

module.exports = {
  PermissionMode,
  OperationGuard,
  createGuard,
  checkOperation,
  getModeBadge,
  setMode,
  cycleMode,
  enforcePermission,
};
