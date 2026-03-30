/**
 * PermissionEngine -- Corporation Authorization Engine
 *
 * Validates whether an agent at level X, department Y, can execute action Z.
 * Operates as a gate BEFORE the existing PermissionMode (explore/ask/auto).
 *
 * Two independent axes:
 *   - Authority (PermissionEngine): corporate hierarchy check
 *   - Autonomy  (PermissionMode):   execution mode check
 *
 * Flow: PermissionEngine (authority) -> PermissionMode (autonomy) -> Execution
 *
 * @module core/corporation/permission-engine
 * @version 1.0.0
 * @story CORP-2 - PermissionEngine + permissions.yaml
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// =====================================================
// CONSTANTS
// =====================================================

const PERMISSIONS_FILE = 'permissions.yaml';

/**
 * Level string to number mapping.
 * @type {Object<string, number>}
 */
const LEVEL_MAP = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
};

// =====================================================
// PermissionEngine Class
// =====================================================

class PermissionEngine {
  /**
   * @param {import('./org-engine').OrgEngine} orgEngine - Loaded OrgEngine instance
   * @param {Object} [options]
   * @param {string} [options.permissionsPath] - Override path to permissions.yaml
   * @param {import('./activity-logger').ActivityLogger|null} [options.activityLogger] - Logger for audit trail
   */
  constructor(orgEngine, options = {}) {
    this.org = orgEngine;
    this.permissionsPath = options.permissionsPath
      || path.join(
        orgEngine.projectRoot,
        '.aios-core', 'core', 'corporation', PERMISSIONS_FILE,
      );
    this.activityLogger = options.activityLogger || null;

    // Internal state -- lazy loaded
    this._rules = null;
    this._loaded = false;
    this._resolvedLevelCan = null; // Cache: level -> Set of allowed actions
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Core permission check.
   *
   * Performs 6 sequential checks:
   *   1. Agent existence
   *   2. Action existence
   *   3. L5 override (CEO/human can do anything)
   *   4. Level minimum
   *   5. restricted_to list
   *   6. requires_approval_from
   *   7. Cross-department rules (if context.targetDepartment)
   *
   * @param {string} agentId - Agent requesting action
   * @param {string} action - Action to perform
   * @param {Object} [context] - Additional context
   * @param {string} [context.targetDepartment] - For cross-dept requests
   * @param {string} [context.targetAgent] - For delegation
   * @returns {Object} PermissionResult { allowed, reason, escalateTo?, requiresApproval? }
   */
  canPerform(agentId, action, context = {}) {
    this._ensureLoaded();

    // Check 1: Agent exists
    const agent = this.org.getAgent(agentId);
    if (!agent) {
      const result = { allowed: false, reason: `Unknown agent: ${agentId}` };
      this._logCheck(agentId, action, result, null);
      return result;
    }

    // Check 2: Action exists
    const actionDef = this._rules.actions[action];
    if (!actionDef) {
      const result = { allowed: false, reason: `Unknown action: ${action}` };
      this._logCheck(agentId, action, result, agent);
      return result;
    }

    // Check 3: L5 override -- CEO/human can do everything
    const agentLevelNum = this._levelToNumber(agent.level);
    if (agentLevelNum >= 5) {
      const result = { allowed: true, reason: 'L5 override: unrestricted authority' };
      this._logCheck(agentId, action, result, agent);
      return result;
    }

    // Check 4: Level minimum
    const minLevelNum = this._levelToNumber(actionDef.min_level);
    if (agentLevelNum < minLevelNum) {
      const chain = this.org.getEscalationChain(agentId);
      const escalateTo = chain.length > 0 ? chain[0].id : null;
      const result = {
        allowed: false,
        reason: `Level ${agent.level} insufficient for ${action} (requires ${actionDef.min_level})`,
        escalateTo,
      };
      this._logCheck(agentId, action, result, agent);
      return result;
    }

    // Check 5: restricted_to -- only specific agents can perform
    if (actionDef.restricted_to && Array.isArray(actionDef.restricted_to)) {
      if (!actionDef.restricted_to.includes(agentId)) {
        const result = {
          allowed: false,
          reason: `${action} is restricted to: ${actionDef.restricted_to.join(', ')}`,
        };
        this._logCheck(agentId, action, result, agent);
        return result;
      }
    }

    // Check 6: requires_approval_from
    if (actionDef.requires_approval_from) {
      // L5 already handled above (check 3)
      // L4+ auto-approves for some cases
      if (agentLevelNum >= 4) {
        // C-Suite auto-approves
        const result = { allowed: true, reason: 'C-Suite auto-approval' };
        this._logCheck(agentId, action, result, agent);
        return result;
      }

      const approver = this._resolveApprover(actionDef.requires_approval_from, agent);
      const result = {
        allowed: false,
        reason: `${action} requires approval from ${approver}`,
        requiresApproval: [approver],
      };
      this._logCheck(agentId, action, result, agent);
      return result;
    }

    // Check 7: Cross-department rules
    if (context.targetDepartment && context.targetDepartment !== agent.department) {
      const crossResult = this._checkCrossDept(agent, context.targetDepartment, action);
      this._logCheck(agentId, action, crossResult, agent);
      return crossResult;
    }

    // All checks passed
    const result = { allowed: true, reason: 'Authorized' };
    this._logCheck(agentId, action, result, agent);
    return result;
  }

  /**
   * Quick boolean check (convenience wrapper).
   *
   * @param {string} agentId
   * @param {string} action
   * @param {Object} [context]
   * @returns {boolean}
   */
  isAllowed(agentId, action, context = {}) {
    const result = this.canPerform(agentId, action, context);
    return result.allowed;
  }

  /**
   * Batch permission check for multiple actions.
   *
   * @param {string} agentId
   * @param {string[]} actions
   * @param {Object} [context]
   * @returns {Object<string, Object>} Map of action -> PermissionResult
   */
  canPerformAll(agentId, actions, context = {}) {
    const results = {};
    for (const action of actions) {
      results[action] = this.canPerform(agentId, action, context);
    }
    return results;
  }

  /**
   * Get all actions an agent is allowed to perform.
   *
   * @param {string} agentId
   * @returns {string[]} List of allowed action names
   */
  getAllowedActions(agentId) {
    this._ensureLoaded();
    const actionNames = Object.keys(this._rules.actions);
    return actionNames.filter(action => this.isAllowed(agentId, action));
  }

  /**
   * Get the loaded rules (for inspection/debugging).
   * @returns {Object|null}
   */
  getRules() {
    return this._rules;
  }

  /**
   * Check if rules are loaded.
   * @returns {boolean}
   */
  isLoaded() {
    return this._loaded;
  }

  /**
   * Force reload of permissions.yaml.
   */
  reload() {
    this._loaded = false;
    this._rules = null;
    this._resolvedLevelCan = null;
    this._ensureLoaded();
  }

  // =====================================================
  // PRIVATE -- Loading
  // =====================================================

  /**
   * Lazy-load permissions.yaml on first use.
   * Fail-closed: if rules cannot load, all checks deny.
   * @private
   */
  _ensureLoaded() {
    if (this._loaded) return;

    if (!fs.existsSync(this.permissionsPath)) {
      throw new Error(`permissions.yaml not found: ${this.permissionsPath}`);
    }

    const raw = fs.readFileSync(this.permissionsPath, 'utf8');
    const rules = yaml.load(raw);

    if (!rules || !rules.actions) {
      throw new Error('permissions.yaml is invalid: missing actions');
    }

    this._rules = rules;
    this._buildLevelCache();
    this._loaded = true;
  }

  /**
   * Pre-compute the resolved "can" set for each level (with inheritance).
   * @private
   */
  _buildLevelCache() {
    this._resolvedLevelCan = {};
    const levelRules = this._rules.level_rules || {};

    // Resolve inheritance chain for each level
    for (const level of ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']) {
      const resolved = new Set();
      let current = level;

      // Walk inheritance chain
      const visited = new Set();
      while (current && !visited.has(current)) {
        visited.add(current);
        const rule = levelRules[current];
        if (rule && rule.can) {
          for (const action of rule.can) {
            resolved.add(action);
          }
        }
        current = rule ? rule.inherits : null;
      }

      this._resolvedLevelCan[level] = resolved;
    }
  }

  // =====================================================
  // PRIVATE -- Helpers
  // =====================================================

  /**
   * Convert level string to number.
   * @param {string} level - 'L0' through 'L5'
   * @returns {number} 0-5, or -1 if invalid
   * @private
   */
  _levelToNumber(level) {
    if (level in LEVEL_MAP) return LEVEL_MAP[level];
    // Try parsing (e.g., 'L4' -> 4)
    const num = parseInt(String(level).replace('L', ''), 10);
    return isNaN(num) ? -1 : num;
  }

  /**
   * Resolve who needs to approve an action.
   * Handles 'dept_head' and level-based (e.g., 'L4') specs.
   *
   * @param {string} approverSpec - 'dept_head' or level string
   * @param {Object} agent - Agent data from OrgEngine
   * @returns {string} Agent ID or level of the required approver
   * @private
   */
  _resolveApprover(approverSpec, agent) {
    if (approverSpec === 'dept_head') {
      const dept = this.org.getDepartment(agent.department);
      if (dept && dept.head) return dept.head;
      // Fallback to reports_to
      return agent.reports_to || 'unknown';
    }

    // Level-based: e.g., 'L4' -- find the first agent in the escalation chain at that level
    const targetLevelNum = this._levelToNumber(approverSpec);
    if (targetLevelNum >= 0) {
      const chain = this.org.getEscalationChain(agent.id);
      for (const superior of chain) {
        if (this._levelToNumber(superior.level) >= targetLevelNum) {
          return superior.id;
        }
      }
      // No one found at that level, return the spec as-is
      return approverSpec;
    }

    return approverSpec;
  }

  /**
   * Validate cross-department request.
   *
   * Rules:
   *   - requester_min_level: L2
   *   - Requires approval from both department heads
   *   - Auto-approve if requester is L4+ (C-Suite)
   *   - Auto-approve if escalated from L3
   *
   * @param {Object} agent - Requester agent data
   * @param {string} targetDept - Target department ID
   * @param {string} action - Action being requested
   * @returns {Object} PermissionResult
   * @private
   */
  _checkCrossDept(agent, targetDept, _action) {
    const crossRules = this._rules.cross_department;
    if (!crossRules || !crossRules.request_protocol) {
      // No cross-dept rules defined, allow by default
      return { allowed: true, reason: 'No cross-department rules defined' };
    }

    const protocol = crossRules.request_protocol;
    const agentLevelNum = this._levelToNumber(agent.level);

    // Check minimum level
    const minLevel = protocol.requester_min_level || 'L2';
    const minLevelNum = this._levelToNumber(minLevel);
    if (agentLevelNum < minLevelNum) {
      return {
        allowed: false,
        reason: `Cross-department request requires minimum level ${minLevel} (agent is ${agent.level})`,
      };
    }

    // Auto-approve for C-Suite (L4+)
    if (protocol.auto_approve_if) {
      const autoLevel = protocol.auto_approve_if.requester_level;
      if (autoLevel && agentLevelNum >= this._levelToNumber(autoLevel)) {
        return { allowed: true, reason: 'C-Suite auto-approval for cross-department request' };
      }

      // Auto-approve if escalated from L3
      const escalatedFrom = protocol.auto_approve_if.escalated_from;
      if (escalatedFrom && agentLevelNum >= this._levelToNumber(escalatedFrom)) {
        return { allowed: true, reason: 'VP-level auto-approval for cross-department request' };
      }
    }

    // Requires approval from both department heads
    const requesterDept = this.org.getDepartment(agent.department);
    const targetDeptObj = this.org.getDepartment(targetDept);

    const approvers = [];
    if (requesterDept && requesterDept.head) approvers.push(requesterDept.head);
    if (targetDeptObj && targetDeptObj.head) approvers.push(targetDeptObj.head);

    if (approvers.length > 0) {
      return {
        allowed: false,
        reason: 'Cross-department request requires approval from department heads',
        requiresApproval: approvers,
      };
    }

    return { allowed: true, reason: 'Cross-department request authorized' };
  }

  /**
   * Log a permission check via ActivityLogger.
   *
   * @param {string} agentId
   * @param {string} action
   * @param {Object} result - PermissionResult
   * @param {Object|null} agent - Agent data (may be null for unknown agents)
   * @private
   */
  _logCheck(agentId, action, result, agent) {
    if (!this.activityLogger) return;

    try {
      this.activityLogger.log({
        agent_id: agentId,
        level: agent ? agent.level : 'unknown',
        department: agent ? agent.department : 'unknown',
        action: 'permission_check',
        target: action,
        result: result.allowed ? 'success' : 'denied',
        metadata: {
          reason: result.reason,
          escalateTo: result.escalateTo || null,
          requiresApproval: result.requiresApproval || null,
        },
      });
    } catch {
      // Non-fatal: logging failure should not block permission checks
    }
  }
}

// =====================================================
// FACTORY -- Feature Flag Aware
// =====================================================

/**
 * Create a PermissionEngine that respects the corporation.enabled flag.
 * If disabled, returns a pass-through engine that always allows.
 *
 * @param {import('./org-engine').OrgEngine} orgEngine
 * @param {Object} [options]
 * @returns {PermissionEngine|Object} Engine or pass-through proxy
 */
function createPermissionEngine(orgEngine, options = {}) {
  if (!_isCorporationEnabled()) {
    return _createPassThrough();
  }
  return new PermissionEngine(orgEngine, options);
}

/**
 * Create a pass-through proxy that always allows everything.
 * Used when corporation.enabled = false.
 * @private
 */
function _createPassThrough() {
  return {
    canPerform: () => ({ allowed: true, reason: 'Corporation feature disabled' }),
    isAllowed: () => true,
    canPerformAll: (_agentId, actions) => {
      const results = {};
      for (const action of actions) {
        results[action] = { allowed: true, reason: 'Corporation feature disabled' };
      }
      return results;
    },
    getAllowedActions: () => [],
    getRules: () => null,
    isLoaded: () => false,
    reload: () => {},
    _isPassThrough: true,
  };
}

// Shared utility — migrated from inline duplicate (2026-03-30)
const { isCorporationEnabled: _isCorporationEnabled } = require('./utils');

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  PermissionEngine,
  createPermissionEngine,
  LEVEL_MAP,
};
