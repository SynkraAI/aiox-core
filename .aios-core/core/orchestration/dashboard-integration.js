/**
 * Dashboard Integration - Story 0.8
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Integrates orchestrator with dashboard for real-time monitoring.
 *
 * Features:
 * - AC1: Updates `.aios/dashboard/status.json`
 * - AC2: Status includes: currentEpic, progress, estimatedTime
 * - AC3: Event emitter for real-time updates
 * - AC4: getProgressPercentage() method for UI
 * - AC5: History of completed/failed epics
 * - AC6: Link to detailed logs
 * - AC7: Notification when blocked or complete
 *
 * @module core/orchestration/dashboard-integration
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const { getDashboardEmitter } = require('../events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              NOTIFICATION TYPES (AC7)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Notification types for dashboard
 */
const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  BLOCKED: 'blocked',
  COMPLETE: 'complete',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              DASHBOARD INTEGRATION CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * DashboardIntegration - Real-time orchestrator monitoring (AC1)
 */
class DashboardIntegration extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.projectRoot - Project root path
   * @param {Object} options.orchestrator - MasterOrchestrator instance
   * @param {boolean} [options.autoUpdate=true] - Automatically update status file
   * @param {number} [options.updateInterval=5000] - Update interval in ms
   */
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.orchestrator = options.orchestrator || null;
    this.autoUpdate = options.autoUpdate ?? true;
    this.updateInterval = options.updateInterval ?? 5000;

    // Paths
    this.dashboardDir = path.join(this.projectRoot, '.aios', 'dashboard');
    this.statusPath = path.join(this.dashboardDir, 'status.json');
    this.logsDir = path.join(this.projectRoot, '.aios', 'logs');

    // State
    this.history = [];
    this.notifications = [];
    this.updateTimer = null;
    this.isRunning = false;

    // Bind orchestrator events if provided
    if (this.orchestrator) {
      this._bindOrchestratorEvents();
    }
  }

  /**
   * Start dashboard integration
   */
  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    await fs.ensureDir(this.dashboardDir);
    await fs.ensureDir(this.logsDir);

    // Initial update
    await this.updateStatus();

    // Start auto-update if enabled
    if (this.autoUpdate) {
      this.updateTimer = setInterval(async () => {
        await this.updateStatus();
      }, this.updateInterval);
    }

    this.emit('started');
  }

  /**
   * Stop dashboard integration
   */
  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.isRunning = false;
    this.emit('stopped');
  }

  /**
   * Bind to orchestrator events (AC3)
   * @private
   */
  _bindOrchestratorEvents() {
    const orch = this.orchestrator;
    const emitter = getDashboardEmitter();

    // State changes
    orch.on('stateChange', async (data) => {
      await this.updateStatus();
      this.emit('statusUpdate', { type: 'stateChange', data });

      // Emit story status change to dashboard
      if (orch.storyId) {
        emitter.emitStoryStatusChange(
          orch.storyId,
          data.previousState || 'unknown',
          data.newState,
          orch.getProgressPercentage?.() || 0,
        );
      }

      // Notification for blocked state (AC7)
      if (data.newState === 'blocked') {
        this.addNotification({
          type: NotificationType.BLOCKED,
          title: 'Pipeline Blocked',
          message: data.context?.reason || 'Pipeline execution has been blocked',
          timestamp: new Date().toISOString(),
        });
      }

      // Notification for complete state (AC7)
      if (data.newState === 'complete') {
        this.addNotification({
          type: NotificationType.COMPLETE,
          title: 'Pipeline Complete',
          message: `Story ${orch.storyId} completed successfully`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Epic start
    orch.on('epicStart', async (data) => {
      await this.updateStatus();
      this.emit('statusUpdate', { type: 'epicStart', data });

      // Emit command start for epic execution
      const epicConfig = orch.constructor.EPIC_CONFIG || {};
      const epicName = epicConfig[data.epicNum]?.name || `Epic ${data.epicNum}`;
      emitter.emitCommandStart(epicName);
    });

    // Epic complete (AC5)
    orch.on('epicComplete', async (data) => {
      // Add to history
      this.addToHistory({
        type: 'epicComplete',
        epicNum: data.epicNum,
        result: data.result,
        gateResult: data.gateResult,
        timestamp: new Date().toISOString(),
      });

      await this.updateStatus();
      this.emit('statusUpdate', { type: 'epicComplete', data });

      // Emit command complete for epic execution
      const epicConfig = orch.constructor.EPIC_CONFIG || {};
      const epicName = epicConfig[data.epicNum]?.name || `Epic ${data.epicNum}`;
      emitter.emitCommandComplete(epicName, data.duration_ms || 0, true, data.result);
    });

    // Epic failed (AC5)
    orch.on('epicFailed', async (data) => {
      this.addToHistory({
        type: 'epicFailed',
        epicNum: data.epicNum,
        error: data.error,
        timestamp: new Date().toISOString(),
      });

      await this.updateStatus();
      this.emit('statusUpdate', { type: 'epicFailed', data });

      // Emit command error for epic execution
      const epicConfig = orch.constructor.EPIC_CONFIG || {};
      const epicName = epicConfig[data.epicNum]?.name || `Epic ${data.epicNum}`;
      emitter.emitCommandError(epicName, data.error?.message || 'Epic execution failed', data.duration_ms);

      // Add error notification
      this.addNotification({
        type: NotificationType.ERROR,
        title: `Epic ${data.epicNum} Failed`,
        message: data.error?.message || 'Epic execution failed',
        timestamp: new Date().toISOString(),
      });
    });

    // Agent activation (for agent systems that use orchestrator)
    orch.on('agentActivated', async (data) => {
      emitter.emitAgentActivated(data.agentId, data.agentName, data.persona);
    });

    // Agent deactivation
    orch.on('agentDeactivated', async (data) => {
      emitter.emitAgentDeactivated(data.agentId, data.agentName, data.reason);
    });

    // Command execution (for task/command systems)
    orch.on('commandStart', async (data) => {
      emitter.emitCommandStart(data.command, data.args);
    });

    orch.on('commandComplete', async (data) => {
      emitter.emitCommandComplete(data.command, data.duration_ms, data.success, data.result);
    });

    orch.on('commandError', async (data) => {
      emitter.emitCommandError(data.command, data.error, data.duration_ms);
    });
  }

  /**
   * Update status file (AC1)
   */
  async updateStatus() {
    if (!this.orchestrator) return;

    const status = this.buildStatus();

    try {
      await fs.ensureDir(this.dashboardDir);
      await fs.writeJson(this.statusPath, status, { spaces: 2 });
      this.emit('statusUpdated', status);
    } catch (error) {
      this._emitSafeError({ type: 'statusUpdate', error });
    }

    return status;
  }

  /**
   * Emit error event only when listeners are present, otherwise degrade to warning.
   * Avoids unhandled EventEmitter 'error' exceptions in background update flows.
   * @private
   * @param {Object} payload
   */
  _emitSafeError(payload) {
    if (this.listenerCount('error') > 0) {
      this.emit('error', payload);
      return;
    }

    const message = payload?.error?.message || 'unknown dashboard error';
    console.warn(`[DashboardIntegration] ${payload?.type || 'error'}: ${message}`);
  }

  /**
   * Build status object (AC2)
   * @returns {Object} Status object
   */
  buildStatus() {
    const orch = this.orchestrator;
    if (!orch) return {};

    const storyId = orch.storyId || 'current';
    const currentEpic = orch.executionState.currentEpic;

    // Get epic name
    const epicConfig = orch.constructor.EPIC_CONFIG || {};
    const epicName = currentEpic && epicConfig[currentEpic] ? epicConfig[currentEpic].name : null;

    // Build per-epic progress
    const epicProgress = {};
    for (const [num, epic] of Object.entries(orch.executionState.epics)) {
      if (epic.status === 'completed') {
        epicProgress[`epic${num}`] = 100;
      } else if (epic.status === 'in_progress') {
        epicProgress[`epic${num}`] = 50; // Estimate 50% for in-progress
      } else {
        epicProgress[`epic${num}`] = 0;
      }
    }

    return {
      orchestrator: {
        [storyId]: {
          // Core status (AC2)
          status: orch.state,
          currentEpic,
          epicName,

          // Progress (AC2, AC4)
          progress: {
            overall: orch.getProgressPercentage(),
            ...epicProgress,
          },

          // Task info
          currentTask: this._getCurrentTask(),

          // Timing
          startedAt: orch.executionState.startedAt,
          updatedAt: new Date().toISOString(),

          // History (AC5)
          history: this.history.slice(-20), // Last 20 entries

          // Errors
          errors: orch.executionState.errors.map((e) => ({
            message: e.message,
            timestamp: e.timestamp,
          })),

          // Status flags
          blocked: orch.state === 'blocked',

          // Logs path (AC6)
          logsPath: this._getLogsPath(),

          // Notifications (AC7)
          notifications: this.notifications.slice(-10), // Last 10
        },
      },
    };
  }

  /**
   * Get current task description
   * @private
   */
  _getCurrentTask() {
    const orch = this.orchestrator;
    if (!orch) return null;

    const currentEpic = orch.executionState.currentEpic;
    if (!currentEpic) return null;

    const epicConfig = orch.constructor.EPIC_CONFIG || {};
    const config = epicConfig[currentEpic];

    if (config) {
      return `Executing ${config.name}`;
    }

    return `Executing Epic ${currentEpic}`;
  }

  /**
   * Get logs path for current story (AC6)
   * @private
   */
  _getLogsPath() {
    const orch = this.orchestrator;
    if (!orch || !orch.storyId) return null;

    return path.join(this.logsDir, `${orch.storyId}.log`);
  }

  /**
   * Get overall progress percentage (AC4)
   * @returns {number} Progress 0-100
   */
  getProgressPercentage() {
    if (!this.orchestrator) return 0;
    return this.orchestrator.getProgressPercentage();
  }

  /**
   * Add entry to history (AC5)
   * @param {Object} entry - History entry
   */
  addToHistory(entry) {
    this.history.push({
      ...entry,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    // Keep last 100 entries
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
  }

  /**
   * Get history (AC5)
   * @returns {Object[]} History entries
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get history for specific epic (AC5)
   * @param {number} epicNum - Epic number
   * @returns {Object[]} History entries for epic
   */
  getHistoryForEpic(epicNum) {
    return this.history.filter((h) => h.epicNum === epicNum);
  }

  /**
   * Add notification (AC7)
   * @param {Object} notification - Notification object
   */
  addNotification(notification) {
    const notif = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
    };

    this.notifications.push(notif);
    this.emit('notification', notif);

    // Keep last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(-50);
    }
  }

  /**
   * Get notifications (AC7)
   * @param {boolean} [unreadOnly=false] - Only return unread notifications
   * @returns {Object[]} Notifications
   */
  getNotifications(unreadOnly = false) {
    if (unreadOnly) {
      return this.notifications.filter((n) => !n.read);
    }
    return [...this.notifications];
  }

  /**
   * Mark notification as read (AC7)
   * @param {string} notificationId - Notification ID
   */
  markNotificationRead(notificationId) {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }

  /**
   * Mark all notifications as read (AC7)
   */
  markAllNotificationsRead() {
    for (const notif of this.notifications) {
      notif.read = true;
    }
  }

  /**
   * Clear notifications (AC7)
   */
  clearNotifications() {
    this.notifications = [];
  }

  /**
   * Get status file path
   * @returns {string} Path to status file
   */
  getStatusPath() {
    return this.statusPath;
  }

  /**
   * Read current status from file
   * @returns {Promise<Object|null>} Status object or null
   */
  async readStatus() {
    try {
      if (await fs.pathExists(this.statusPath)) {
        return await fs.readJson(this.statusPath);
      }
    } catch (error) {
      this.emit('error', { type: 'readStatus', error });
    }
    return null;
  }

  /**
   * Clear all state
   */
  clear() {
    this.history = [];
    this.notifications = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  DashboardIntegration,
  NotificationType,
};
