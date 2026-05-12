/**
 * Dashboard Event Emitter
 *
 * Singleton that emits high-level events to the monitor-server
 * for real-time dashboard observability.
 *
 * Features:
 * - Non-blocking HTTP POST to monitor-server
 * - 500ms timeout (never blocks CLI)
 * - Silent failure with fallback to file
 * - Lazy initialization
 *
 * @module core/events/dashboard-emitter
 */

const { randomUUID } = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { DashboardEventType } = require('./types');

const MONITOR_SERVER_URL = process.env.AIOX_MONITOR_URL || 'http://localhost:4001/events';
const EMIT_TIMEOUT_MS = 500;

/**
 * DashboardEmitter - Singleton for emitting events to monitor-server
 */
class DashboardEmitter {
  static instance = null;

  constructor() {
    this.sessionId = process.env.CLAUDE_CODE_SESSION_ID || randomUUID();
    this.projectRoot = process.cwd();
    this.fallbackPath = path.join(this.projectRoot, '.aiox', 'dashboard', 'events.jsonl');
    this.currentAgent = null;
    this.currentStoryId = null;
    this.enabled = true;

    // Disable in test environment
    if (process.env.NODE_ENV === 'test') {
      this.enabled = false;
    }
  }

  /**
   * Get singleton instance
   * @returns {DashboardEmitter}
   */
  static getInstance() {
    if (!DashboardEmitter.instance) {
      DashboardEmitter.instance = new DashboardEmitter();
    }
    return DashboardEmitter.instance;
  }

  /**
   * Set current agent context
   * @param {string|null} agentId
   */
  setAgent(agentId) {
    this.currentAgent = agentId;
  }

  /**
   * Set current story context
   * @param {string|null} storyId
   */
  setStoryId(storyId) {
    this.currentStoryId = storyId;
  }

  /**
   * Set session ID
   * @param {string} sessionId
   */
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }

  /**
   * Enable/disable emitter
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Emit an event to monitor-server
   * Non-blocking, silent failure
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  async emit(type, data = {}) {
    if (!this.enabled) return;

    const event = {
      id: randomUUID(),
      type,
      timestamp: Date.now(),
      session_id: this.sessionId,
      aiox_agent: this.currentAgent || undefined,
      aiox_story_id: this.currentStoryId || undefined,
      data,
    };

    // Try HTTP POST first, non-blocking
    this._postEvent(event).catch(() => {
      // Fallback to file on failure
      this._writeToFile(event).catch(() => {
        // Silent failure - never interrupt CLI
      });
    });
  }

  /**
   * Emit AgentActivated event
   * @param {string} agentId
   * @param {string} agentName
   * @param {string} [persona]
   */
  async emitAgentActivated(agentId, agentName, persona) {
    this.setAgent(agentId);
    await this.emit(DashboardEventType.AGENT_ACTIVATED, {
      agentId,
      agentName,
      persona,
    });
  }

  /**
   * Emit AgentDeactivated event
   * @param {string} agentId
   * @param {string} agentName
   * @param {string} [reason]
   */
  async emitAgentDeactivated(agentId, agentName, reason) {
    await this.emit(DashboardEventType.AGENT_DEACTIVATED, {
      agentId,
      agentName,
      reason,
    });
    this.setAgent(null);
  }

  /**
   * Emit CommandStart event
   * @param {string} command
   * @param {string[]} [args]
   */
  async emitCommandStart(command, args) {
    await this.emit(DashboardEventType.COMMAND_START, {
      command,
      args,
      agentId: this.currentAgent,
    });
  }

  /**
   * Emit CommandComplete event
   * @param {string} command
   * @param {number} duration_ms
   * @param {boolean} success
   * @param {*} [result]
   */
  async emitCommandComplete(command, duration_ms, success, result) {
    await this.emit(DashboardEventType.COMMAND_COMPLETE, {
      command,
      duration_ms,
      success,
      result,
    });
  }

  /**
   * Emit CommandError event
   * @param {string} command
   * @param {string} error
   * @param {number} [duration_ms]
   */
  async emitCommandError(command, error, duration_ms) {
    await this.emit(DashboardEventType.COMMAND_ERROR, {
      command,
      error,
      duration_ms,
    });
  }

  /**
   * Emit StoryStatusChange event
   * @param {string} storyId
   * @param {string} previousStatus
   * @param {string} newStatus
   * @param {number} [progress]
   */
  async emitStoryStatusChange(storyId, previousStatus, newStatus, progress) {
    this.setStoryId(storyId);
    await this.emit(DashboardEventType.STORY_STATUS_CHANGE, {
      storyId,
      previousStatus,
      newStatus,
      progress,
    });
  }

  /**
   * Emit SessionStart event
   * @param {string} [project]
   * @param {string} [cwd]
   */
  async emitSessionStart(project, cwd) {
    await this.emit(DashboardEventType.SESSION_START, {
      project,
      cwd: cwd || this.projectRoot,
    });
  }

  /**
   * Emit SessionEnd event
   * @param {number} duration_ms
   * @param {string} [reason]
   */
  async emitSessionEnd(duration_ms, reason) {
    await this.emit(DashboardEventType.SESSION_END, {
      duration_ms,
      reason,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                    Story 12.6: Bob-specific Events (AC7, AC10)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Emit BobPhaseChange event (AC10)
   * @param {string} phase - Current phase name
   * @param {string} story - Story ID
   * @param {string} executor - Executor agent ID
   */
  async emitBobPhaseChange(phase, story, executor) {
    await this.emit(DashboardEventType.BOB_PHASE_CHANGE, {
      phase,
      story,
      executor,
    });
  }

  /**
   * Emit BobAgentSpawned event (AC10)
   * @param {string} agent - Agent ID
   * @param {number} pid - Process ID
   * @param {string} task - Task being executed
   */
  async emitBobAgentSpawned(agent, pid, task) {
    await this.emit(DashboardEventType.BOB_AGENT_SPAWNED, {
      agent,
      pid,
      task,
    });
  }

  /**
   * Emit BobAgentCompleted event (AC10)
   * @param {string} agent - Agent ID
   * @param {number} pid - Process ID
   * @param {boolean} success - Whether agent completed successfully
   * @param {number} duration - Duration in milliseconds
   */
  async emitBobAgentCompleted(agent, pid, success, duration) {
    await this.emit(DashboardEventType.BOB_AGENT_COMPLETED, {
      agent,
      pid,
      success,
      duration,
    });
  }

  /**
   * Emit BobSurfaceDecision event (AC10)
   * @param {string} criteria - Decision criteria ID
   * @param {string} action - Action taken
   * @param {Object} [context] - Additional context
   */
  async emitBobSurfaceDecision(criteria, action, context = {}) {
    await this.emit(DashboardEventType.BOB_SURFACE_DECISION, {
      criteria,
      action,
      context,
    });
  }

  /**
   * Emit BobError event (AC10)
   * @param {string} phase - Phase where error occurred
   * @param {string} message - Error message
   * @param {boolean} [recoverable=true] - Whether error is recoverable
   */
  async emitBobError(phase, message, recoverable = true) {
    await this.emit(DashboardEventType.BOB_ERROR, {
      phase,
      message,
      recoverable,
    });
  }

  /**
   * POST event to monitor-server with timeout
   * @private
   * @param {Object} event
   */
  async _postEvent(event) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EMIT_TIMEOUT_MS);

    try {
      const response = await fetch(MONITOR_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: event.type,
          timestamp: event.timestamp,
          data: {
            ...event.data,
            session_id: event.session_id,
            aiox_agent: event.aiox_agent,
            aiox_story_id: event.aiox_story_id,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Write event to fallback file
   * @private
   * @param {Object} event
   */
  async _writeToFile(event) {
    try {
      await fs.ensureDir(path.dirname(this.fallbackPath));
      const line = JSON.stringify(event) + '\n';
      await fs.appendFile(this.fallbackPath, line);
    } catch {
      // Silent failure
    }
  }
}

/**
 * Get singleton emitter instance
 * @returns {DashboardEmitter}
 */
function getDashboardEmitter() {
  return DashboardEmitter.getInstance();
}

module.exports = {
  DashboardEmitter,
  getDashboardEmitter,
};
