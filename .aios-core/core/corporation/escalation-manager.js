/**
 * EscalationManager -- Corporation Escalation Chain Engine
 *
 * Resolves the chain of command via `reports_to` in org-config.yaml.
 * When an agent cannot perform an action, the system escalates
 * to the next level automatically.
 *
 * Supports:
 *   - Intra-department escalation (via hierarchical chain)
 *   - Cross-department escalation (with dual approval)
 *   - Loop detection (DAG enforcement)
 *   - Full audit trail via ActivityLogger
 *
 * @module core/corporation/escalation-manager
 * @version 1.0.0
 * @story CORP-4 - EscalationManager -- Cadeia de Comando
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { isCorporationEnabled } = require('./utils');

// =====================================================
// CONSTANTS
// =====================================================

const MAX_CHAIN_DEPTH = 10;

/**
 * Notification severity thresholds.
 * Maps escalation levels to notification triggers.
 * @type {Object<string, number>}
 */
const NOTIFICATION_SEVERITY_LEVELS = {
  all: 0,
  high: 4,    // L4+
  critical: 5, // L5 only
};

/**
 * Default stale escalation threshold in minutes.
 * @type {number}
 */
const DEFAULT_STALE_THRESHOLD_MINUTES = 30;

/**
 * Escalation resolution types.
 * @type {Object<string, string>}
 */
const RESOLUTION_TYPES = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DELEGATED: 'delegated',
  ESCALATED_FURTHER: 'escalated_further',
};

/**
 * Escalation trigger types and their behaviors.
 * @type {Object<string, Object>}
 */
const ESCALATION_TRIGGERS = {
  task_failed: { escalate_by: 1 },
  timeout: { escalate_by: 1 },
  security_incident: { escalate_to: 'L5' },
  cost_above_threshold: { escalate_to: 'L4' },
  permission_denied: { escalate_by: 1 },
  chain_exhausted: { escalate_to: 'L5' },
};

/**
 * Timeout thresholds by level (in seconds).
 * @type {Object<string, number>}
 */
const LEVEL_TIMEOUTS = {
  L1: 300,    // 5 min
  L2: 900,    // 15 min
  L3: 3600,   // 1 hour
  L4: 14400,  // 4 hours
};

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

/**
 * Persistence configuration.
 */
const PERSISTENCE_DIR = path.join('.aios', 'corporation');
const QUEUE_FILE = 'escalation-queue.jsonl';
const EXPIRY_DAYS = 7;

// =====================================================
// EscalationManager Class
// =====================================================

class EscalationManager {
  /**
   * @param {import('./org-engine').OrgEngine} orgEngine - Loaded OrgEngine instance
   * @param {import('./permission-engine').PermissionEngine} permissionEngine - PermissionEngine instance
   * @param {import('./activity-logger').ActivityLogger|null} activityLogger - Logger for audit trail
   */
  constructor(orgEngine, permissionEngine, activityLogger) {
    if (!orgEngine) throw new Error('OrgEngine is required');
    if (!permissionEngine) throw new Error('PermissionEngine is required');

    this.org = orgEngine;
    this.permissions = permissionEngine;
    this.logger = activityLogger || null;

    // In-memory escalation queue
    this._queue = new Map(); // escalationId -> escalation object
    this._notified = new Set(); // Track notified escalation IDs to avoid spam
    this._stats = {
      total: 0,
      resolved: 0,
      by_level: {},
      by_department: {},
      by_trigger: {},
    };

    // Persistence path: .aios/corporation/escalation-queue.jsonl
    this._persistDir = path.join(process.cwd(), PERSISTENCE_DIR);
    this._persistPath = path.join(this._persistDir, QUEUE_FILE);

    // Restore queue from disk (non-blocking, failure-safe)
    this._loadQueue();
  }

  // =====================================================
  // PUBLIC API -- Escalation
  // =====================================================

  /**
   * Escalate a task/decision to the next level in the chain.
   *
   * Walks the reports_to chain from fromAgentId, checking each superior
   * via PermissionEngine.canPerform(). Returns the first agent that can
   * handle the action.
   *
   * @param {string} fromAgentId - Agent requesting escalation
   * @param {string} action - Action that requires escalation
   * @param {Object} [context] - Additional context
   * @param {string} [context.reason] - Why escalation is needed
   * @param {string} [context.trigger] - Trigger type (task_failed, timeout, etc.)
   * @param {string} [context.targetDepartment] - For cross-dept context
   * @returns {Object} EscalationResult
   *   { escalated_to, level, department, chain, reason, escalation_id }
   */
  escalate(fromAgentId, action, context = {}) {
    // Validate agent exists
    const fromAgent = this.org.getAgent(fromAgentId);
    if (!fromAgent) {
      const result = {
        escalated_to: null,
        level: null,
        department: null,
        chain: [],
        reason: `Unknown agent: ${fromAgentId}`,
      };
      this._logEscalation(fromAgentId, action, result, context);
      return result;
    }

    // Check trigger-based escalation overrides
    const trigger = context.trigger;
    if (trigger && ESCALATION_TRIGGERS[trigger]) {
      const triggerDef = ESCALATION_TRIGGERS[trigger];
      if (triggerDef.escalate_to) {
        return this._escalateToLevel(fromAgentId, fromAgent, action, triggerDef.escalate_to, context);
      }
    }

    // Get the escalation chain from OrgEngine
    const chain = this.org.getEscalationChain(fromAgentId);

    // Detect loops
    const loopError = this._detectLoop(fromAgentId);
    if (loopError) {
      const result = {
        escalated_to: null,
        level: null,
        department: null,
        chain: chain.map(a => a.id),
        reason: loopError,
        error: 'loop_detected',
      };
      this._logEscalation(fromAgentId, action, result, context);
      throw new Error(loopError);
    }

    // Walk the chain to find a resolver
    for (const superior of chain) {
      const canDo = this.permissions.canPerform(superior.id, action, context);
      if (canDo.allowed) {
        const escalationId = randomUUID();
        const result = {
          escalated_to: superior.id,
          level: superior.level,
          department: superior.department,
          chain: chain.map(a => a.id),
          reason: context.reason || `Escalated from ${fromAgentId} to ${superior.id}`,
          escalation_id: escalationId,
        };

        // Add to queue as pending
        this._addToQueue(escalationId, fromAgentId, superior.id, action, context, result);

        // Log escalation
        this._logEscalation(fromAgentId, action, result, context);

        // Update stats
        this._updateStats(fromAgentId, superior, context);

        return result;
      }
    }

    // Chain exhausted -- escalate to human (L5)
    const escalationId = randomUUID();
    const result = {
      escalated_to: 'human',
      level: 'L5',
      department: null,
      chain: chain.map(a => a.id),
      reason: 'chain exhausted',
      escalation_id: escalationId,
    };

    this._addToQueue(escalationId, fromAgentId, 'human', action, context, result);
    this._logEscalation(fromAgentId, action, result, context);
    this._updateStats(fromAgentId, { level: 'L5', department: null }, context);

    return result;
  }

  /**
   * Cross-department escalation.
   * Requires approval from BOTH department heads.
   * Auto-approves if requester is L4+ (C-Suite).
   *
   * @param {string} fromAgentId - Agent requesting cross-dept action
   * @param {string} targetDept - Target department ID
   * @param {string} action - Action to perform
   * @param {Object} [context] - Additional context
   * @returns {Object} CrossDeptResult
   *   { approved, requires_approval, reason, escalation_id }
   */
  crossDeptEscalate(fromAgentId, targetDept, action, context = {}) {
    const fromAgent = this.org.getAgent(fromAgentId);
    if (!fromAgent) {
      return {
        approved: false,
        requires_approval: [],
        reason: `Unknown agent: ${fromAgentId}`,
      };
    }

    const fromDept = this.org.getDepartment(fromAgent.department);
    const targetDeptObj = this.org.getDepartment(targetDept);

    if (!targetDeptObj) {
      return {
        approved: false,
        requires_approval: [],
        reason: `Unknown department: ${targetDept}`,
      };
    }

    const agentLevelNum = this._levelToNumber(fromAgent.level);

    // Auto-approve if requester is L4+ (C-Suite)
    if (agentLevelNum >= 4) {
      const escalationId = randomUUID();
      const result = {
        approved: true,
        requires_approval: [],
        reason: 'C-Suite auto-approval',
        escalation_id: escalationId,
      };

      this._logCrossDept(fromAgentId, targetDept, action, result, context);
      return result;
    }

    // Requires approval from both department heads
    const approvers = [];
    if (fromDept && fromDept.head) approvers.push(fromDept.head);
    if (targetDeptObj.head) approvers.push(targetDeptObj.head);

    // Deduplicate (same head for both departments)
    const uniqueApprovers = [...new Set(approvers)];

    const escalationId = randomUUID();
    const result = {
      approved: false,
      requires_approval: uniqueApprovers,
      reason: `Cross-department request requires approval from ${uniqueApprovers.join(' and ')}`,
      escalation_id: escalationId,
    };

    this._addToQueue(escalationId, fromAgentId, uniqueApprovers.join(','), action, {
      ...context,
      cross_department: true,
      from_dept: fromAgent.department,
      target_dept: targetDept,
    }, result);

    this._logCrossDept(fromAgentId, targetDept, action, result, context);

    return result;
  }

  // =====================================================
  // PUBLIC API -- Queue Management
  // =====================================================

  /**
   * Get all pending escalations.
   *
   * @returns {Object[]} Array of pending escalation objects
   */
  getEscalationQueue() {
    const pending = [];
    for (const [, escalation] of this._queue) {
      if (escalation.status === 'pending') {
        pending.push({ ...escalation });
      }
    }
    return pending;
  }

  /**
   * Resolve a pending escalation.
   *
   * @param {string} escalationId - UUID of the escalation
   * @param {string} resolution - One of: approved, rejected, delegated, escalated_further
   * @param {string} resolvedBy - Agent ID resolving
   * @returns {Object} Resolution result { resolved, escalation_id, resolution, resolved_by }
   */
  resolveEscalation(escalationId, resolution, resolvedBy) {
    const escalation = this._queue.get(escalationId);
    if (!escalation) {
      return {
        resolved: false,
        escalation_id: escalationId,
        reason: `Escalation not found: ${escalationId}`,
      };
    }

    if (escalation.status !== 'pending') {
      return {
        resolved: false,
        escalation_id: escalationId,
        reason: `Escalation already ${escalation.status}`,
      };
    }

    const validResolutions = Object.values(RESOLUTION_TYPES);
    if (!validResolutions.includes(resolution)) {
      return {
        resolved: false,
        escalation_id: escalationId,
        reason: `Invalid resolution: ${resolution}. Valid: ${validResolutions.join(', ')}`,
      };
    }

    // Update the escalation
    escalation.status = 'resolved';
    escalation.resolution = resolution;
    escalation.resolved_by = resolvedBy;
    escalation.resolved_at = new Date().toISOString();

    this._stats.resolved++;

    // Persist updated queue (resolved items will be filtered out on next load)
    this._persistQueue();

    // Log resolution
    this._logResolution(escalationId, resolution, resolvedBy, escalation);

    return {
      resolved: true,
      escalation_id: escalationId,
      resolution,
      resolved_by: resolvedBy,
    };
  }

  // =====================================================
  // PUBLIC API -- Statistics
  // =====================================================

  /**
   * Get escalation statistics.
   *
   * @returns {Object} Stats { total, resolved, pending, by_level, by_department, by_trigger }
   */
  getEscalationStats() {
    const pending = this.getEscalationQueue().length;

    return {
      total: this._stats.total,
      resolved: this._stats.resolved,
      pending,
      by_level: { ...this._stats.by_level },
      by_department: { ...this._stats.by_department },
      by_trigger: { ...this._stats.by_trigger },
    };
  }

  // =====================================================
  // PUBLIC API -- Resolver Lookup
  // =====================================================

  /**
   * Find who can resolve a specific action, starting from an agent.
   * Walks the escalation chain until finding an agent with permission.
   *
   * @param {string} action - Action to find resolver for
   * @param {string} startingAgentId - Agent to start from
   * @returns {Object|null} Agent data of the resolver, or null
   */
  findResolver(action, startingAgentId) {
    const chain = this.org.getEscalationChain(startingAgentId);

    for (const superior of chain) {
      const canDo = this.permissions.canPerform(superior.id, action);
      if (canDo.allowed) {
        return superior;
      }
    }

    // No one in chain can resolve
    return null;
  }

  // =====================================================
  // PRIVATE -- Escalation Helpers
  // =====================================================

  /**
   * Escalate directly to a specific level (e.g., security_incident -> L5).
   *
   * @param {string} fromAgentId
   * @param {Object} fromAgent
   * @param {string} action
   * @param {string} targetLevel - Level to escalate to (e.g., 'L5')
   * @param {Object} context
   * @returns {Object} EscalationResult
   * @private
   */
  _escalateToLevel(fromAgentId, fromAgent, action, targetLevel, context) {
    const chain = this.org.getEscalationChain(fromAgentId);
    const targetLevelNum = this._levelToNumber(targetLevel);

    // Find first agent at or above the target level
    for (const superior of chain) {
      const superiorLevelNum = this._levelToNumber(superior.level);
      if (superiorLevelNum >= targetLevelNum) {
        const escalationId = randomUUID();
        const result = {
          escalated_to: superior.id,
          level: superior.level,
          department: superior.department,
          chain: chain.map(a => a.id),
          reason: context.reason || `Direct escalation to ${targetLevel} (trigger: ${context.trigger})`,
          escalation_id: escalationId,
        };

        this._addToQueue(escalationId, fromAgentId, superior.id, action, context, result);
        this._logEscalation(fromAgentId, action, result, context);
        this._updateStats(fromAgentId, superior, context);

        return result;
      }
    }

    // If no one at target level, escalate to human
    const escalationId = randomUUID();
    const result = {
      escalated_to: 'human',
      level: 'L5',
      department: null,
      chain: chain.map(a => a.id),
      reason: context.reason || `Direct escalation to ${targetLevel} (trigger: ${context.trigger})`,
      escalation_id: escalationId,
    };

    this._addToQueue(escalationId, fromAgentId, 'human', action, context, result);
    this._logEscalation(fromAgentId, action, result, context);
    this._updateStats(fromAgentId, { level: 'L5', department: null }, context);

    return result;
  }

  /**
   * Detect loops in the reports_to chain.
   * The chain should form a DAG (directed acyclic graph).
   *
   * @param {string} agentId
   * @returns {string|null} Error message if loop detected, null otherwise
   * @private
   */
  _detectLoop(agentId) {
    const visited = new Set();
    let currentId = agentId;

    for (let i = 0; i < MAX_CHAIN_DEPTH + 1; i++) {
      if (visited.has(currentId)) {
        return `Circular escalation chain detected: ${currentId} appears in its own chain (visited: ${[...visited].join(' -> ')} -> ${currentId})`;
      }

      visited.add(currentId);
      const agent = this.org.getAgent(currentId);
      if (!agent || !agent.reports_to) break;
      currentId = agent.reports_to;
    }

    return null;
  }

  /**
   * Convert level string to number.
   * @param {string} level
   * @returns {number}
   * @private
   */
  _levelToNumber(level) {
    if (level in LEVEL_MAP) return LEVEL_MAP[level];
    const num = parseInt(String(level).replace('L', ''), 10);
    return isNaN(num) ? -1 : num;
  }

  // =====================================================
  // PRIVATE -- Queue Management
  // =====================================================

  /**
   * Add an escalation to the internal queue.
   * @private
   */
  _addToQueue(escalationId, fromAgentId, escalatedTo, action, context, result) {
    const item = {
      id: escalationId,
      from_agent: fromAgentId,
      escalated_to: escalatedTo,
      action,
      context: { ...context },
      result: { ...result },
      status: 'pending',
      created_at: new Date().toISOString(),
      resolution: null,
      resolved_by: null,
      resolved_at: null,
    };

    this._queue.set(escalationId, item);
    this._persistQueue();

    // Fire-and-forget notifications (NEVER block escalation flow)
    const levelNum = this._levelToNumber(result.level);
    const notifThreshold = this._getNotificationThreshold();

    if (escalatedTo === 'human' || result.level === 'L5') {
      this._notify({
        id: escalationId,
        severity: 'L5',
        department: result.department,
        description: result.reason || context.reason,
        agent: fromAgentId,
      }, 'human_required').catch(() => {});
    } else if (levelNum >= notifThreshold) {
      this._notify({
        id: escalationId,
        severity: result.level,
        department: result.department,
        description: result.reason || context.reason,
        agent: fromAgentId,
      }, 'severity_high').catch(() => {});
    }
  }

  // =====================================================
  // PRIVATE -- Stats
  // =====================================================

  /**
   * Update internal statistics.
   * @private
   */
  _updateStats(fromAgentId, escalatedToAgent, context) {
    this._stats.total++;

    // By level
    const level = escalatedToAgent.level || 'unknown';
    this._stats.by_level[level] = (this._stats.by_level[level] || 0) + 1;

    // By department
    const dept = escalatedToAgent.department || 'cross-functional';
    this._stats.by_department[dept] = (this._stats.by_department[dept] || 0) + 1;

    // By trigger
    const trigger = context.trigger || 'manual';
    this._stats.by_trigger[trigger] = (this._stats.by_trigger[trigger] || 0) + 1;
  }

  // =====================================================
  // PRIVATE -- Persistence
  // =====================================================

  /**
   * Persist all non-resolved queue items to disk as JSONL.
   * Uses atomic write (tmp + rename) to avoid partial writes.
   * Failure is non-fatal -- logs a warning but does not throw.
   * @private
   */
  _persistQueue() {
    try {
      // Ensure directory exists
      if (!fs.existsSync(this._persistDir)) {
        fs.mkdirSync(this._persistDir, { recursive: true });
      }

      // Collect non-resolved items
      const lines = [];
      for (const [, item] of this._queue) {
        if (item.status !== 'resolved') {
          lines.push(JSON.stringify(item));
        }
      }

      const content = lines.length > 0 ? lines.join('\n') + '\n' : '';

      // Atomic write: write to tmp, then rename
      const tmpPath = this._persistPath + '.tmp.' + process.pid;
      fs.writeFileSync(tmpPath, content, 'utf-8');

      try {
        fs.renameSync(tmpPath, this._persistPath);
      } catch {
        // Windows: rename fails if target exists -- fall back to direct write
        fs.writeFileSync(this._persistPath, content, 'utf-8');
        // Clean up tmp if it still exists
        try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
      }
    } catch (err) {
      // Non-fatal: persistence failure must NOT block escalation
      console.warn(`[EscalationManager] Failed to persist queue: ${err.message}`);
    }
  }

  /**
   * Load persisted queue from disk on initialization.
   * Filters out resolved and expired items (older than EXPIRY_DAYS).
   * Deduplicates by ID, keeping the entry with the most recent created_at.
   * Failure is non-fatal -- starts with empty queue.
   * @private
   */
  _loadQueue() {
    try {
      if (!fs.existsSync(this._persistPath)) return;

      const content = fs.readFileSync(this._persistPath, 'utf-8');
      if (!content.trim()) return;

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);
      const cutoffISO = cutoff.toISOString();

      // Parse lines, dedup by ID (keep most recent)
      const byId = new Map();
      const lines = content.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          if (!item || !item.id) continue;

          // Skip resolved items
          if (item.status === 'resolved') continue;

          // Skip expired items (older than 7 days)
          if (item.created_at && item.created_at < cutoffISO) continue;

          // Dedup: keep the most recent entry per ID
          const existing = byId.get(item.id);
          if (existing && existing.created_at >= item.created_at) continue;

          byId.set(item.id, item);
        } catch {
          // Skip malformed lines
        }
      }

      // Populate queue
      for (const [id, item] of byId) {
        this._queue.set(id, item);
      }
    } catch (err) {
      // Non-fatal: start with empty queue
      console.warn(`[EscalationManager] Failed to load persisted queue: ${err.message}`);
    }
  }

  // =====================================================
  // PRIVATE -- Notifications
  // =====================================================

  /**
   * Send notification for an escalation event.
   * Supports three channels: file (always), console (always), webhook (optional).
   * Fire-and-forget: notification failure NEVER blocks escalation flow.
   *
   * @param {Object} escalation - Escalation data
   * @param {string} escalation.id - Escalation ID
   * @param {string} escalation.severity - Level string (e.g., 'L4', 'L5')
   * @param {string} [escalation.department] - Department
   * @param {string} [escalation.description] - Description/reason
   * @param {string} [escalation.agent] - Originating agent ID
   * @param {string} reason - Notification reason: 'severity_high', 'human_required', 'stale_escalation'
   * @returns {Promise<void>}
   * @private
   */
  async _notify(escalation, reason) {
    // Dedup: only notify once per escalation+reason combo
    const dedupeKey = `${escalation.id}:${reason}`;
    if (this._notified.has(dedupeKey)) return;
    this._notified.add(dedupeKey);

    const notification = {
      id: escalation.id || `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reason,
      escalation: {
        severity: escalation.severity,
        department: escalation.department || null,
        description: escalation.description || null,
        agent: escalation.agent || null,
      },
    };

    // Channel 1: File-based notification (always available)
    try {
      const notifDir = path.join(this._persistDir, 'notifications', 'pending');
      fs.mkdirSync(notifDir, { recursive: true });
      const filename = `${Date.now()}-${reason}.json`;
      fs.writeFileSync(
        path.join(notifDir, filename),
        JSON.stringify(notification, null, 2),
        'utf-8',
      );
    } catch {
      // Silent: file notification failure is non-fatal
    }

    // Channel 2: Console warning (always)
    try {
      const prefix = reason === 'human_required'
        ? '[ESCALATION-CRITICAL]'
        : '[ESCALATION-WARNING]';
      const desc = escalation.description || 'No description';
      console.error(
        `${prefix} [${escalation.severity}] ${desc} (${reason}) -- agent: ${escalation.agent || 'unknown'}`,
      );
    } catch {
      // Silent
    }

    // Channel 3: Webhook (optional, fire-and-forget)
    try {
      const webhookUrl = this._getNotificationWebhookUrl();
      if (webhookUrl) {
        const url = new URL(webhookUrl);
        const payload = JSON.stringify(notification);
        const httpModule = url.protocol === 'https:' ? require('https') : require('http');
        const req = httpModule.request({
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + (url.search || ''),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 5000,
        });
        req.on('error', () => {}); // fire-and-forget
        req.on('timeout', () => { req.destroy(); });
        req.write(payload);
        req.end();
      }
    } catch {
      // Silent: webhook failure is non-fatal
    }
  }

  /**
   * Get the webhook URL from core-config.yaml (corporation.notifications.webhook_url).
   * Returns null if not configured or on any error.
   *
   * @returns {string|null}
   * @private
   */
  _getNotificationWebhookUrl() {
    try {
      const configPath = path.join(__dirname, '..', '..', 'core-config.yaml');
      const raw = fs.readFileSync(configPath, 'utf-8');
      const match = raw.match(/webhook_url:\s*['"]?([^\s'"#]+)/);
      return match && match[1] ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get the notification severity threshold from core-config.yaml.
   * Returns the numeric level at which notifications trigger.
   * Default: 4 (L4+, i.e., 'high').
   *
   * @returns {number}
   * @private
   */
  _getNotificationThreshold() {
    try {
      const configPath = path.join(__dirname, '..', '..', 'core-config.yaml');
      const raw = fs.readFileSync(configPath, 'utf-8');
      const match = raw.match(/notify_on_severity:\s*['"]?(\w+)/);
      if (match && match[1] && NOTIFICATION_SEVERITY_LEVELS[match[1]] !== undefined) {
        return NOTIFICATION_SEVERITY_LEVELS[match[1]];
      }
    } catch {
      // Fall through to default
    }
    return NOTIFICATION_SEVERITY_LEVELS.high; // default: L4+
  }

  /**
   * Check the queue for stale escalations (pending > threshold minutes).
   * Sends 'stale_escalation' notification for items that have not been notified yet.
   * Should be called periodically (e.g., from external scheduler or manual check).
   *
   * @returns {number} Number of stale escalations found
   */
  checkStaleEscalations() {
    const threshold = this._getStaleThresholdMs();
    const now = Date.now();
    let staleCount = 0;

    for (const [, item] of this._queue) {
      if (item.status !== 'pending') continue;

      const createdAt = new Date(item.created_at).getTime();
      if (isNaN(createdAt)) continue;

      const ageMs = now - createdAt;
      if (ageMs > threshold) {
        staleCount++;
        this._notify({
          id: item.id,
          severity: item.result ? item.result.level : 'unknown',
          department: item.result ? item.result.department : null,
          description: item.result ? item.result.reason : item.action,
          agent: item.from_agent,
        }, 'stale_escalation').catch(() => {});
      }
    }

    return staleCount;
  }

  /**
   * Get the stale threshold in milliseconds from core-config.yaml.
   * Default: 30 minutes.
   *
   * @returns {number} Threshold in milliseconds
   * @private
   */
  _getStaleThresholdMs() {
    try {
      const configPath = path.join(__dirname, '..', '..', 'core-config.yaml');
      const raw = fs.readFileSync(configPath, 'utf-8');
      const match = raw.match(/stale_threshold_minutes:\s*(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10) * 60 * 1000;
      }
    } catch {
      // Fall through to default
    }
    return DEFAULT_STALE_THRESHOLD_MINUTES * 60 * 1000;
  }

  // =====================================================
  // PRIVATE -- Logging
  // =====================================================

  /**
   * Log an escalation event via ActivityLogger.
   * @private
   */
  _logEscalation(fromAgentId, action, result, context) {
    if (!this.logger) return;

    try {
      const fromAgent = this.org.getAgent(fromAgentId);
      this.logger.log({
        agent_id: fromAgentId,
        level: fromAgent ? fromAgent.level : 'unknown',
        department: fromAgent ? fromAgent.department : 'unknown',
        action: 'escalation',
        target: action,
        result: result.escalated_to ? 'escalated' : 'failed',
        metadata: {
          escalated_to: result.escalated_to,
          escalated_to_level: result.level,
          chain: result.chain,
          reason: result.reason,
          trigger: context.trigger || 'manual',
          escalation_id: result.escalation_id,
        },
      });
    } catch {
      // Non-fatal: logging failure should not block escalation
    }
  }

  /**
   * Log a cross-department escalation event.
   * @private
   */
  _logCrossDept(fromAgentId, targetDept, action, result, _context) {
    if (!this.logger) return;

    try {
      const fromAgent = this.org.getAgent(fromAgentId);
      this.logger.log({
        agent_id: fromAgentId,
        level: fromAgent ? fromAgent.level : 'unknown',
        department: fromAgent ? fromAgent.department : 'unknown',
        action: 'cross_dept_escalation',
        target: action,
        result: result.approved ? 'approved' : 'pending_approval',
        metadata: {
          target_department: targetDept,
          approved: result.approved,
          requires_approval: result.requires_approval,
          reason: result.reason,
          escalation_id: result.escalation_id,
        },
      });
    } catch {
      // Non-fatal
    }
  }

  /**
   * Log escalation resolution.
   * @private
   */
  _logResolution(escalationId, resolution, resolvedBy, escalation) {
    if (!this.logger) return;

    try {
      this.logger.log({
        agent_id: resolvedBy,
        action: 'escalation_resolution',
        target: escalation.action,
        result: resolution,
        metadata: {
          escalation_id: escalationId,
          original_from: escalation.from_agent,
          resolution,
        },
      });
    } catch {
      // Non-fatal
    }
  }
}

// =====================================================
// FACTORY -- Feature Flag Aware
// =====================================================

/**
 * Create an EscalationManager that respects the corporation.enabled flag.
 * If disabled, returns a no-op proxy.
 *
 * @param {import('./org-engine').OrgEngine} orgEngine
 * @param {import('./permission-engine').PermissionEngine} permissionEngine
 * @param {import('./activity-logger').ActivityLogger|null} activityLogger
 * @returns {EscalationManager|Object}
 */
function createEscalationManager(orgEngine, permissionEngine, activityLogger) {
  if (!isCorporationEnabled()) {
    return _createPassThrough();
  }
  return new EscalationManager(orgEngine, permissionEngine, activityLogger);
}

/**
 * Create a pass-through proxy when corporation feature is disabled.
 * @private
 */
function _createPassThrough() {
  return {
    escalate: () => ({ escalated_to: null, level: null, department: null, chain: [], reason: 'Corporation feature disabled' }),
    crossDeptEscalate: () => ({ approved: true, requires_approval: [], reason: 'Corporation feature disabled' }),
    getEscalationQueue: () => [],
    resolveEscalation: () => ({ resolved: false, reason: 'Corporation feature disabled' }),
    getEscalationStats: () => ({ total: 0, resolved: 0, pending: 0, by_level: {}, by_department: {}, by_trigger: {} }),
    findResolver: () => null,
    checkStaleEscalations: () => 0,
    _isPassThrough: true,
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  EscalationManager,
  createEscalationManager,
  ESCALATION_TRIGGERS,
  LEVEL_TIMEOUTS,
  RESOLUTION_TYPES,
  MAX_CHAIN_DEPTH,
  NOTIFICATION_SEVERITY_LEVELS,
  DEFAULT_STALE_THRESHOLD_MINUTES,
};
