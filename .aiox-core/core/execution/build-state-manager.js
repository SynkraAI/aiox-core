#!/usr/bin/env node

/**
 * Build State Manager - Story 8.4
 *
 * Manages build state for autonomous builds, enabling resume from checkpoints
 * after failures or interruptions.
 *
 * Features:
 * - AC1: build-state.json schema with checkpoints
 * - AC2: Checkpoint saved after each subtask completion
 * - AC3: Resume build from last checkpoint
 * - AC4: Show current build status
 * - AC5: Detect abandoned builds (> 1 hour)
 * - AC6: Notification on max iterations failure
 * - AC7: Complete attempt logging for debugging
 * - AC8: Integration with stuck-detector.js
 *
 * @module build-state-manager
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Optional dependencies with graceful fallback
let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
    dim: (s) => s,
    bgRed: (s) => s,
    bgYellow: (s) => s,
    bgGreen: (s) => s,
  };
}

// Import Epic 5 components for integration (AC8)
let StuckDetector, RecoveryTracker;
try {
  StuckDetector = require('../../infrastructure/scripts/stuck-detector').StuckDetector;
  RecoveryTracker = require('../../infrastructure/scripts/recovery-tracker').RecoveryTracker;
} catch {
  // Will be null if not available - handled gracefully
  StuckDetector = null;
  RecoveryTracker = null;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  maxIterations: 10, // Max attempts per subtask
  globalTimeout: 30 * 60 * 1000, // 30 minutes
  abandonedThreshold: 60 * 60 * 1000, // 1 hour (AC5)
  autoCheckpoint: true, // Auto-save checkpoint after subtask
  checkpointDir: 'checkpoints', // Subdirectory for checkpoint files
  stateFile: 'build-state.json', // Main state file
  logFile: 'build-attempts.log', // Attempt log file (AC7)
  schemaVersion: '1.0.0',
};

const BuildStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  ABANDONED: 'abandoned',
  FAILED: 'failed',
  COMPLETED: 'completed',
};

const NotificationType = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  STUCK: 'stuck',
  ABANDONED: 'abandoned',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              SCHEMA VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Validate build state against schema
 * @param {Object} state - State to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateBuildState(state) {
  const errors = [];

  // Required fields
  const required = ['storyId', 'status', 'startedAt', 'checkpoints'];
  for (const field of required) {
    if (state[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type checks
  if (state.storyId && typeof state.storyId !== 'string') {
    errors.push('storyId must be a string');
  }

  const validStatuses = Object.values(BuildStatus);
  if (state.status && !validStatuses.includes(state.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  if (state.checkpoints && !Array.isArray(state.checkpoints)) {
    errors.push('checkpoints must be an array');
  }

  if (state.completedSubtasks && !Array.isArray(state.completedSubtasks)) {
    errors.push('completedSubtasks must be an array');
  }

  if (state.failedAttempts && !Array.isArray(state.failedAttempts)) {
    errors.push('failedAttempts must be an array');
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BUILD STATE MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * BuildStateManager - Manages autonomous build state
 *
 * Integrates with Epic 5 Recovery System for stuck detection
 * and attempt tracking.
 */
class BuildStateManager {
  /**
   * Create a new BuildStateManager
   *
   * @param {string} storyId - Story identifier
   * @param {Object} options - Configuration options
   * @param {string} [options.planDir] - Directory containing plan files
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.config] - Config overrides
   */
  constructor(storyId, options = {}) {
    if (!storyId) {
      throw new Error('storyId is required');
    }

    this.storyId = storyId;
    this.rootPath = options.rootPath || process.cwd();
    this.planDir = options.planDir || path.join(this.rootPath, 'plan');
    this.config = { ...DEFAULT_CONFIG, ...options.config };

    // State file paths
    this.stateFilePath = path.join(this.planDir, this.config.stateFile);
    this.checkpointDir = path.join(this.planDir, this.config.checkpointDir);
    this.logFilePath = path.join(this.planDir, this.config.logFile);

    // Epic 5 integration (AC8)
    this.stuckDetector = StuckDetector
      ? new StuckDetector({
        maxAttempts: this.config.maxIterations,
        verbose: options.verbose,
      })
      : null;

    this.recoveryTracker = RecoveryTracker
      ? new RecoveryTracker({
        storyId,
        rootPath: this.rootPath,
      })
      : null;

    // Internal state
    this._state = null;
    this._logBuffer = [];
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Create new build state (AC1)
   *
   * @param {Object} options - Initial state options
   * @returns {Object} Created state
   */
  createState(options = {}) {
    const now = new Date().toISOString();

    const state = {
      storyId: this.storyId,
      startedAt: now,
      lastCheckpoint: null,
      status: BuildStatus.PENDING,
      currentPhase: null,
      currentSubtask: null,
      completedSubtasks: [],
      failedAttempts: [],
      worktree: options.worktree || null,
      plan: options.plan || null,
      checkpoints: [],
      metrics: {
        totalSubtasks: options.totalSubtasks || 0,
        completedSubtasks: 0,
        totalAttempts: 0,
        totalFailures: 0,
        averageTimePerSubtask: 0,
        totalDuration: 0,
      },
      abandoned: false,
      abandonedAt: null,
      abandonedReason: null,
      notifications: [],
      config: this.config,
      schemaVersion: this.config.schemaVersion,
    };

    // Validate before saving
    const validation = validateBuildState(state);
    if (!validation.valid) {
      throw new Error(`Invalid state: ${validation.errors.join(', ')}`);
    }

    this._state = state;
    return state;
  }

  /**
   * Load existing build state
   *
   * @returns {Object|null} Loaded state or null if not exists
   */
  loadState() {
    if (!fs.existsSync(this.stateFilePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.stateFilePath, 'utf-8');
      const state = JSON.parse(content);

      // Validate
      const validation = validateBuildState(state);
      if (!validation.valid) {
        throw new Error(`Invalid state file: ${validation.errors.join(', ')}`);
      }

      this._state = state;
      return state;
    } catch (error) {
      throw new Error(`Failed to load build state: ${error.message}`);
    }
  }

  /**
   * Save current build state
   *
   * @param {Object} options - Save options
   * @param {boolean} [options.updateCheckpoint=false] - Update lastCheckpoint timestamp
   * @returns {Object} Saved state
   */
  saveState(options = {}) {
    if (!this._state) {
      throw new Error('No state to save. Call createState() or loadState() first.');
    }

    // Ensure directory exists
    if (!fs.existsSync(this.planDir)) {
      fs.mkdirSync(this.planDir, { recursive: true });
    }

    // Only update timestamp if explicitly requested (via saveCheckpoint)
    if (options.updateCheckpoint) {
      this._state.lastCheckpoint = new Date().toISOString();
    }

    // Validate before saving
    const validation = validateBuildState(this._state);
    if (!validation.valid) {
      throw new Error(`Invalid state: ${validation.errors.join(', ')}`);
    }

    // Write state file
    fs.writeFileSync(this.stateFilePath, JSON.stringify(this._state, null, 2), 'utf-8');

    // Flush log buffer
    this._flushLogBuffer();

    return this._state;
  }

  /**
   * Get current state (in memory)
   *
   * @returns {Object|null} Current state
   */
  getState() {
    return this._state;
  }

  /**
   * Load or create state
   *
   * @param {Object} createOptions - Options for creating new state
   * @returns {Object} Loaded or created state
   */
  loadOrCreateState(createOptions = {}) {
    const existing = this.loadState();
    if (existing) {
      return existing;
    }
    return this.createState(createOptions);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CHECKPOINT MANAGEMENT (AC2)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Save checkpoint after subtask completion (AC2)
   *
   * @param {string} subtaskId - Completed subtask ID
   * @param {Object} options - Checkpoint options
   * @returns {Object} Checkpoint object
   */
  saveCheckpoint(subtaskId, options = {}) {
    if (!this._state) {
      throw new Error('No state loaded');
    }

    // Ensure checkpoint directory exists
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }

    const checkpointId = this._generateCheckpointId();
    const now = new Date().toISOString();

    const checkpoint = {
      id: checkpointId,
      timestamp: now,
      subtaskId,
      status: options.status || 'completed',
      gitCommit: options.gitCommit || null,
      filesModified: options.filesModified || [],
      metrics: {
        duration: options.duration || 0,
        attempts: options.attempts || 1,
      },
    };

    // Add to state
    this._state.checkpoints.push(checkpoint);
    this._state.lastCheckpoint = now;

    // Update completed subtasks
    if (!this._state.completedSubtasks.includes(subtaskId)) {
      this._state.completedSubtasks.push(subtaskId);
      this._state.metrics.completedSubtasks++;
    }

    // Update metrics
    this._updateMetrics(checkpoint);

    // Save checkpoint file
    const checkpointPath = path.join(this.checkpointDir, `${checkpointId}.json`);
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2), 'utf-8');

    // Save main state with checkpoint timestamp update
    this.saveState({ updateCheckpoint: true });

    // Log attempt (AC7)
    this._logAttempt(subtaskId, 'checkpoint', {
      checkpointId,
      status: 'success',
    });

    return checkpoint;
  }

  /**
   * Get last valid checkpoint
   *
   * @returns {Object|null} Last checkpoint or null
   */
  getLastCheckpoint() {
    if (!this._state || !this._state.checkpoints || this._state.checkpoints.length === 0) {
      return null;
    }
    return this._state.checkpoints[this._state.checkpoints.length - 1];
  }

  /**
   * Get checkpoint by ID
   *
   * @param {string} checkpointId - Checkpoint ID
   * @returns {Object|null} Checkpoint or null
   */
  getCheckpoint(checkpointId) {
    if (!this._state) {
      return null;
    }
    return this._state.checkpoints.find((c) => c.id === checkpointId) || null;
  }

  /**
   * Generate unique checkpoint ID
   * @private
   */
  _generateCheckpointId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `cp-${timestamp}-${random}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              BUILD RESUME (AC3)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Resume build from last checkpoint (AC3)
   *
   * @returns {Object} Resume context
   */
  resumeBuild() {
    const state = this.loadState();

    if (!state) {
      throw new Error(`No build state found for ${this.storyId}`);
    }

    // Check if build can be resumed
    if (state.status === BuildStatus.COMPLETED) {
      throw new Error('Build already completed');
    }

    if (state.status === BuildStatus.FAILED) {
      // Allow resume of failed builds
      this._log('Resuming failed build');
    }

    // Get last checkpoint
    const lastCheckpoint = this.getLastCheckpoint();

    // Calculate next subtask
    const nextSubtask = this._calculateNextSubtask(state);

    // Update state
    state.status = BuildStatus.IN_PROGRESS;
    state.abandoned = false;
    state.abandonedAt = null;

    // Add notification
    this._addNotification(
      NotificationType.INFO,
      `Build resumed from checkpoint ${lastCheckpoint?.id || 'start'}`,
    );

    // Save updated state
    this.saveState();

    // Log resume (AC7)
    this._logAttempt(nextSubtask, 'resume', {
      fromCheckpoint: lastCheckpoint?.id,
      completedSubtasks: state.completedSubtasks.length,
    });

    return {
      storyId: this.storyId,
      status: state.status,
      lastCheckpoint,
      nextSubtask,
      completedSubtasks: state.completedSubtasks,
      worktree: state.worktree,
      plan: state.plan,
      metrics: state.metrics,
    };
  }

  /**
   * Calculate next subtask to execute
   * @private
   */
  _calculateNextSubtask(state) {
    // If current subtask is set and not completed, resume it
    if (state.currentSubtask && !state.completedSubtasks.includes(state.currentSubtask)) {
      return state.currentSubtask;
    }

    // Otherwise return null - caller should determine from plan
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              BUILD STATUS (AC4)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get build status (AC4)
   *
   * @returns {Object} Status object
   */
  getStatus() {
    const state = this.loadState();

    if (!state) {
      return {
        exists: false,
        storyId: this.storyId,
        message: 'No build state found',
      };
    }

    // Calculate duration
    const startTime = new Date(state.startedAt);
    const now = new Date();
    const duration = now - startTime;

    // Check if abandoned (AC5)
    const isAbandoned = this._checkAbandoned(state);

    return {
      exists: true,
      storyId: this.storyId,
      status: isAbandoned ? BuildStatus.ABANDONED : state.status,
      startedAt: state.startedAt,
      lastCheckpoint: state.lastCheckpoint,
      duration: this._formatDuration(duration),
      durationMs: duration,
      currentPhase: state.currentPhase,
      currentSubtask: state.currentSubtask,
      progress: {
        completed: state.metrics.completedSubtasks,
        total: state.metrics.totalSubtasks,
        percentage:
          state.metrics.totalSubtasks > 0
            ? Math.round((state.metrics.completedSubtasks / state.metrics.totalSubtasks) * 100)
            : 0,
      },
      metrics: state.metrics,
      recentFailures: state.failedAttempts.slice(-5),
      abandoned: isAbandoned,
      worktree: state.worktree,
      checkpointCount: state.checkpoints.length,
      notificationCount: state.notifications.filter((n) => !n.acknowledged).length,
    };
  }

  /**
   * Get all active builds
   *
   * @param {string} baseDir - Base directory to search
   * @returns {Object[]} Array of build statuses
   */
  static getAllBuilds(baseDir = process.cwd()) {
    const builds = [];
    const planDirs = [];

    // Search for plan directories
    const searchDirs = [path.join(baseDir, 'plan'), path.join(baseDir, 'docs', 'stories')];

    for (const searchDir of searchDirs) {
      if (fs.existsSync(searchDir)) {
        const files = fs.readdirSync(searchDir, { withFileTypes: true });
        for (const file of files) {
          if (file.isDirectory()) {
            const statePath = path.join(searchDir, file.name, 'build-state.json');
            if (fs.existsSync(statePath)) {
              planDirs.push({
                dir: path.join(searchDir, file.name),
                storyId: file.name,
              });
            }
          }
        }
      }
    }

    // Check root plan directory
    const rootStatePath = path.join(baseDir, 'plan', 'build-state.json');
    if (fs.existsSync(rootStatePath)) {
      try {
        const content = fs.readFileSync(rootStatePath, 'utf-8');
        const state = JSON.parse(content);
        planDirs.push({
          dir: path.join(baseDir, 'plan'),
          storyId: state.storyId,
        });
      } catch {
        // Skip invalid files
      }
    }

    // Load each build status
    for (const { dir, storyId } of planDirs) {
      try {
        const manager = new BuildStateManager(storyId, {
          planDir: dir,
          rootPath: baseDir,
        });
        builds.push(manager.getStatus());
      } catch {
        // Skip invalid builds
      }
    }

    return builds;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              ABANDONED DETECTION (AC5)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Check if build is abandoned (AC5)
   *
   * @param {Object} [state] - State to check (uses loaded state if not provided)
   * @returns {boolean} True if abandoned
   */
  _checkAbandoned(state = null) {
    const s = state || this._state;
    if (!s) return false;

    // Already marked as abandoned or completed
    if (s.abandoned || s.status === BuildStatus.COMPLETED) {
      return s.abandoned;
    }

    // Check if in progress and last checkpoint is old
    if (s.status === BuildStatus.IN_PROGRESS && s.lastCheckpoint) {
      const lastTime = new Date(s.lastCheckpoint);
      const now = new Date();
      const elapsed = now - lastTime;

      if (elapsed > this.config.abandonedThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect and mark abandoned builds (AC5)
   *
   * @param {number} [threshold] - Custom threshold in ms
   * @returns {Object} Detection result
   */
  detectAbandoned(threshold = null) {
    const state = this.loadState();
    if (!state) {
      return { detected: false, reason: 'No build state' };
    }

    const thresholdMs = threshold || this.config.abandonedThreshold;
    const lastTime = state.lastCheckpoint
      ? new Date(state.lastCheckpoint)
      : new Date(state.startedAt);
    const now = new Date();
    const elapsed = now - lastTime;

    if (elapsed > thresholdMs && state.status === BuildStatus.IN_PROGRESS) {
      // Mark as abandoned
      state.abandoned = true;
      state.abandonedAt = now.toISOString();
      state.abandonedReason = `No activity for ${this._formatDuration(elapsed)}`;
      state.status = BuildStatus.ABANDONED;

      // Add notification
      this._addNotification(
        NotificationType.ABANDONED,
        `Build abandoned: ${state.abandonedReason}`,
      );

      this.saveState();

      // Log (AC7)
      this._logAttempt(state.currentSubtask || 'unknown', 'abandoned', {
        elapsed: this._formatDuration(elapsed),
        threshold: this._formatDuration(thresholdMs),
      });

      return {
        detected: true,
        storyId: this.storyId,
        elapsed: this._formatDuration(elapsed),
        threshold: this._formatDuration(thresholdMs),
        lastActivity: lastTime.toISOString(),
      };
    }

    return {
      detected: false,
      storyId: this.storyId,
      elapsed: this._formatDuration(elapsed),
      threshold: this._formatDuration(thresholdMs),
    };
  }

  /**
   * Cleanup abandoned builds
   *
   * @param {Object} options - Cleanup options
   * @returns {Object} Cleanup result
   */
  async cleanup(options = {}) {
    const state = this.loadState();
    if (!state) {
      return { cleaned: false, reason: 'No build state' };
    }

    const result = {
      storyId: this.storyId,
      cleaned: false,
      filesRemoved: [],
    };

    // Only cleanup abandoned or completed builds
    if (
      !options.force &&
      state.status !== BuildStatus.ABANDONED &&
      state.status !== BuildStatus.COMPLETED
    ) {
      result.reason = `Build status is ${state.status}, not abandoned or completed`;
      return result;
    }

    // Remove checkpoint files
    if (fs.existsSync(this.checkpointDir)) {
      const files = fs.readdirSync(this.checkpointDir);
      for (const file of files) {
        const filePath = path.join(this.checkpointDir, file);
        fs.unlinkSync(filePath);
        result.filesRemoved.push(filePath);
      }
      fs.rmdirSync(this.checkpointDir);
    }

    // Remove state file
    if (fs.existsSync(this.stateFilePath)) {
      fs.unlinkSync(this.stateFilePath);
      result.filesRemoved.push(this.stateFilePath);
    }

    // Remove log file
    if (fs.existsSync(this.logFilePath)) {
      fs.unlinkSync(this.logFilePath);
      result.filesRemoved.push(this.logFilePath);
    }

    result.cleaned = true;
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FAILURE NOTIFICATION (AC6)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Record failed attempt
   *
   * @param {string} subtaskId - Subtask that failed
   * @param {Object} options - Failure details
   * @returns {Object} Failure record
   */
  recordFailure(subtaskId, options = {}) {
    if (!this._state) {
      throw new Error('No state loaded');
    }

    const failure = {
      subtaskId,
      attempt:
        options.attempt ||
        this._state.failedAttempts.filter((f) => f.subtaskId === subtaskId).length + 1,
      error: options.error || 'Unknown error',
      timestamp: new Date().toISOString(),
      approach: options.approach || null,
      duration: options.duration || null,
    };

    this._state.failedAttempts.push(failure);
    this._state.metrics.totalFailures++;
    this._state.metrics.totalAttempts++;

    // Check if stuck (AC8 - integration with stuck-detector)
    const isStuck = this._checkIfStuck(subtaskId);

    if (isStuck.stuck) {
      // Generate notification (AC6)
      this._notifyFailure(subtaskId, failure, isStuck);
    }

    // Log attempt (AC7)
    this._logAttempt(subtaskId, 'failure', {
      attempt: failure.attempt,
      error: failure.error,
      isStuck: isStuck.stuck,
    });

    this.saveState();

    return {
      failure,
      isStuck: isStuck.stuck,
      stuckReason: isStuck.reason,
      suggestions: isStuck.suggestions,
    };
  }

  /**
   * Check if subtask is stuck (AC8)
   * @private
   */
  _checkIfStuck(subtaskId) {
    if (!this.stuckDetector || !this._state) {
      return { stuck: false };
    }

    // Get attempts for this subtask
    const attempts = this._state.failedAttempts
      .filter((f) => f.subtaskId === subtaskId)
      .map((f) => ({
        success: false,
        error: f.error,
        approach: f.approach,
        timestamp: f.timestamp,
      }));

    return this.stuckDetector.check(attempts);
  }

  /**
   * Notify on failure (AC6)
   * @private
   */
  _notifyFailure(subtaskId, failure, stuckResult) {
    const notification = {
      type: NotificationType.STUCK,
      message: `Subtask ${subtaskId} stuck after ${failure.attempt} attempts: ${failure.error}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      context: {
        subtaskId,
        attempt: failure.attempt,
        error: failure.error,
        suggestions: stuckResult.suggestions || [],
      },
    };

    this._state.notifications.push(notification);

    // Also add to log (AC7)
    this._logAttempt(subtaskId, 'stuck_notification', {
      attempt: failure.attempt,
      suggestions: stuckResult.suggestions?.slice(0, 3),
    });

    return notification;
  }

  /**
   * Add notification
   * @private
   */
  _addNotification(type, message, context = {}) {
    if (!this._state) return;

    this._state.notifications.push({
      type,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      context,
    });
  }

  /**
   * Get unacknowledged notifications
   *
   * @returns {Object[]} Notifications
   */
  getNotifications() {
    if (!this._state) return [];
    return this._state.notifications.filter((n) => !n.acknowledged);
  }

  /**
   * Acknowledge notification
   *
   * @param {number} index - Notification index
   */
  acknowledgeNotification(index) {
    if (!this._state || !this._state.notifications[index]) return;
    this._state.notifications[index].acknowledged = true;
    this.saveState();
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              ATTEMPT LOGGING (AC7)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Log attempt for debugging (AC7)
   * @private
   */
  _logAttempt(subtaskId, action, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      storyId: this.storyId,
      subtaskId,
      action,
      ...details,
    };

    // Format log line
    const logLine = `[${entry.timestamp}] [${this.storyId}] [${subtaskId}] ${action}: ${JSON.stringify(details)}\n`;

    this._logBuffer.push(logLine);

    // Auto-flush if buffer is large
    if (this._logBuffer.length >= 10) {
      this._flushLogBuffer();
    }
  }

  /**
   * Flush log buffer to file
   * @private
   */
  _flushLogBuffer() {
    if (this._logBuffer.length === 0) return;

    // Ensure directory exists
    if (!fs.existsSync(this.planDir)) {
      fs.mkdirSync(this.planDir, { recursive: true });
    }

    // Append to log file
    fs.appendFileSync(this.logFilePath, this._logBuffer.join(''), 'utf-8');
    this._logBuffer = [];
  }

  /**
   * Get attempt log
   *
   * @param {Object} options - Options
   * @returns {string[]} Log lines
   */
  getAttemptLog(options = {}) {
    if (!fs.existsSync(this.logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(this.logFilePath, 'utf-8');
    let lines = content.split('\n').filter((l) => l.trim());

    // Filter by subtask if specified
    if (options.subtaskId) {
      lines = lines.filter((l) => l.includes(`[${options.subtaskId}]`));
    }

    // Limit lines
    if (options.limit) {
      lines = lines.slice(-options.limit);
    }

    return lines;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              SUBTASK MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Start working on a subtask
   *
   * @param {string} subtaskId - Subtask ID
   * @param {Object} options - Options
   */
  startSubtask(subtaskId, options = {}) {
    if (!this._state) {
      throw new Error('No state loaded');
    }

    this._state.currentSubtask = subtaskId;
    this._state.currentPhase = options.phase || this._state.currentPhase;
    this._state.status = BuildStatus.IN_PROGRESS;
    this._state.metrics.totalAttempts++;

    // Log (AC7)
    this._logAttempt(subtaskId, 'start', {
      phase: options.phase,
      attempt: options.attempt || 1,
    });

    this.saveState();
  }

  /**
   * Complete a subtask
   *
   * @param {string} subtaskId - Subtask ID
   * @param {Object} options - Completion options
   */
  completeSubtask(subtaskId, options = {}) {
    if (!this._state) {
      throw new Error('No state loaded');
    }

    // Save checkpoint (AC2)
    this.saveCheckpoint(subtaskId, options);

    // Clear current subtask
    this._state.currentSubtask = null;

    // Log (AC7)
    this._logAttempt(subtaskId, 'complete', {
      duration: options.duration,
      filesModified: options.filesModified?.length || 0,
    });
  }

  /**
   * Mark build as completed
   */
  completeBuild() {
    if (!this._state) {
      throw new Error('No state loaded');
    }

    this._state.status = BuildStatus.COMPLETED;
    this._state.currentSubtask = null;

    // Calculate final metrics
    const startTime = new Date(this._state.startedAt);
    const endTime = new Date();
    this._state.metrics.totalDuration = endTime - startTime;

    // Add completion notification
    this._addNotification(
      NotificationType.INFO,
      `Build completed successfully in ${this._formatDuration(this._state.metrics.totalDuration)}`,
    );

    // Log (AC7)
    this._logAttempt('build', 'complete', {
      totalDuration: this._formatDuration(this._state.metrics.totalDuration),
      totalSubtasks: this._state.metrics.completedSubtasks,
      totalAttempts: this._state.metrics.totalAttempts,
    });

    this.saveState();
  }

  /**
   * Mark build as failed
   *
   * @param {string} reason - Failure reason
   */
  failBuild(reason) {
    if (!this._state) {
      throw new Error('No state loaded');
    }

    this._state.status = BuildStatus.FAILED;

    // Add failure notification
    this._addNotification(NotificationType.ERROR, `Build failed: ${reason}`);

    // Log (AC7)
    this._logAttempt('build', 'failed', { reason });

    this.saveState();
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              METRICS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Update metrics after checkpoint
   * @private
   */
  _updateMetrics(checkpoint) {
    if (!this._state || !checkpoint.metrics) return;

    const metrics = this._state.metrics;

    // Update average time
    if (checkpoint.metrics.duration > 0) {
      const totalTime =
        metrics.averageTimePerSubtask * (metrics.completedSubtasks - 1) +
        checkpoint.metrics.duration;
      metrics.averageTimePerSubtask = Math.round(totalTime / metrics.completedSubtasks);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              HELPERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format duration
   * @private
   */
  _formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMins = minutes % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }
    if (minutes > 0) {
      const remainingSecs = seconds % 60;
      return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  }

  /**
   * Internal log helper
   * @private
   */
  _log(_message) {
    // Silent by default - can be overridden
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CLI FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format status for CLI display
   *
   * @returns {string} Formatted status
   */
  formatStatus() {
    const status = this.getStatus();
    const lines = [];

    if (!status.exists) {
      return chalk.yellow(`No build state found for ${this.storyId}`);
    }

    const statusColors = {
      [BuildStatus.PENDING]: chalk.gray,
      [BuildStatus.IN_PROGRESS]: chalk.blue,
      [BuildStatus.PAUSED]: chalk.yellow,
      [BuildStatus.ABANDONED]: chalk.red,
      [BuildStatus.FAILED]: chalk.red,
      [BuildStatus.COMPLETED]: chalk.green,
    };

    const statusColor = statusColors[status.status] || chalk.gray;

    lines.push('');
    lines.push(chalk.bold(`Build Status: ${this.storyId}`));
    lines.push('─'.repeat(50));
    lines.push(`Status:      ${statusColor(status.status.toUpperCase())}`);
    lines.push(`Started:     ${status.startedAt}`);
    lines.push(`Duration:    ${status.duration}`);
    lines.push(`Last Check:  ${status.lastCheckpoint || 'N/A'}`);
    lines.push('');

    // Progress bar
    const progressWidth = 30;
    const filled = Math.round((status.progress.percentage / 100) * progressWidth);
    const empty = progressWidth - filled;
    const progressBar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    lines.push(`Progress:    [${progressBar}] ${status.progress.percentage}%`);
    lines.push(`             ${status.progress.completed}/${status.progress.total} subtasks`);
    lines.push('');

    // Current work
    if (status.currentSubtask) {
      lines.push(`Current:     ${chalk.cyan(status.currentSubtask)}`);
    }
    if (status.currentPhase) {
      lines.push(`Phase:       ${status.currentPhase}`);
    }

    // Metrics
    lines.push('');
    lines.push(chalk.bold('Metrics:'));
    lines.push(`  Attempts:  ${status.metrics.totalAttempts}`);
    lines.push(`  Failures:  ${status.metrics.totalFailures}`);
    lines.push(
      `  Avg Time:  ${this._formatDuration(status.metrics.averageTimePerSubtask)}/subtask`,
    );
    lines.push(`  Checkpts:  ${status.checkpointCount}`);

    // Warnings
    if (status.abandoned) {
      lines.push('');
      lines.push(chalk.bgRed.white(' ⚠ BUILD ABANDONED '));
    }

    if (status.notificationCount > 0) {
      lines.push('');
      lines.push(chalk.yellow(`📬 ${status.notificationCount} unread notification(s)`));
    }

    // Recent failures
    if (status.recentFailures.length > 0) {
      lines.push('');
      lines.push(chalk.bold('Recent Failures:'));
      for (const f of status.recentFailures.slice(-3)) {
        const errorPreview = f.error?.substring(0, 40) || 'Unknown';
        lines.push(chalk.red(`  • [${f.subtaskId}] ${errorPreview}...`));
      }
    }

    lines.push('');
    lines.push('─'.repeat(50));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Format all builds status
   *
   * @param {string} baseDir - Base directory
   * @returns {string} Formatted output
   */
  static formatAllBuilds(baseDir = process.cwd()) {
    const builds = BuildStateManager.getAllBuilds(baseDir);
    const lines = [];

    lines.push('');
    lines.push(chalk.bold('All Active Builds'));
    lines.push('═'.repeat(70));

    if (builds.length === 0) {
      lines.push(chalk.dim('  No active builds found.'));
    } else {
      for (const build of builds) {
        const statusIcon =
          {
            [BuildStatus.PENDING]: '○',
            [BuildStatus.IN_PROGRESS]: '◐',
            [BuildStatus.PAUSED]: '◑',
            [BuildStatus.ABANDONED]: '✗',
            [BuildStatus.FAILED]: '✗',
            [BuildStatus.COMPLETED]: '✓',
          }[build.status] || '?';

        const statusColor =
          {
            [BuildStatus.PENDING]: chalk.gray,
            [BuildStatus.IN_PROGRESS]: chalk.blue,
            [BuildStatus.PAUSED]: chalk.yellow,
            [BuildStatus.ABANDONED]: chalk.red,
            [BuildStatus.FAILED]: chalk.red,
            [BuildStatus.COMPLETED]: chalk.green,
          }[build.status] || chalk.gray;

        const progress = `${build.progress.completed}/${build.progress.total}`;

        lines.push(
          `${statusColor(statusIcon)} ${build.storyId.padEnd(20)} ${build.status.padEnd(12)} ${progress.padEnd(8)} ${build.duration}`,
        );
      }
    }

    lines.push('');
    lines.push('═'.repeat(70));
    lines.push('');

    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.bold('Build State Manager')} - AIOX Build Recovery System (Story 8.4)

${chalk.cyan('Usage:')}
  build-state-manager <command> <story-id> [options]

${chalk.cyan('Commands:')}
  create <story-id>             Create new build state
  status <story-id>             Show build status (AC4)
  status --all                  Show all active builds
  resume <story-id>             Resume build from checkpoint (AC3)
  checkpoint <story-id> <sub>   Save checkpoint for subtask (AC2)
  detect-abandoned <story-id>   Check if build is abandoned (AC5)
  cleanup <story-id>            Clean up build state
  log <story-id>                Show attempt log (AC7)

${chalk.cyan('Options:')}
  --threshold <ms>    Abandoned threshold in ms (default: 3600000)
  --force             Force cleanup even if not abandoned
  --limit <n>         Limit log output lines
  --verbose, -v       Enable verbose output
  --help, -h          Show this help

${chalk.cyan('Acceptance Criteria:')}
  AC1: build-state.json schema with checkpoints
  AC2: Checkpoint saved after subtask completion
  AC3: Resume build from last checkpoint
  AC4: Show current build status
  AC5: Detect abandoned builds (> 1 hour)
  AC6: Notification on max iterations failure
  AC7: Complete attempt logging for debugging
  AC8: Integration with stuck-detector.js

${chalk.cyan('Examples:')}
  build-state-manager create story-8.4
  build-state-manager status story-8.4
  build-state-manager status --all
  build-state-manager resume story-8.4
  build-state-manager checkpoint story-8.4 1.1
  build-state-manager detect-abandoned story-8.4 --threshold 1800000
  build-state-manager log story-8.4 --limit 20
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  const command = args[0];
  let storyId = null;
  let subtaskId = null;
  let threshold = null;
  let force = false;
  let limit = null;
  let verbose = false;
  let all = false;

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--threshold') {
      threshold = parseInt(args[++i], 10);
    } else if (arg === '--force') {
      force = true;
    } else if (arg === '--limit') {
      limit = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--all') {
      all = true;
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else if (!subtaskId) {
        subtaskId = arg;
      }
    }
  }

  try {
    switch (command) {
      case 'create': {
        if (!storyId) {
          console.error(chalk.red('Error: story-id required'));
          process.exit(1);
        }

        const manager = new BuildStateManager(storyId, { verbose });
        manager.createState();
        manager.saveState();

        console.log(chalk.green(`\n✓ Created build state for ${storyId}`));
        console.log(chalk.dim(`  State file: ${manager.stateFilePath}`));
        break;
      }

      case 'status': {
        if (all) {
          console.log(BuildStateManager.formatAllBuilds());
        } else {
          if (!storyId) {
            console.error(chalk.red('Error: story-id required (or use --all)'));
            process.exit(1);
          }

          const manager = new BuildStateManager(storyId, { verbose });
          console.log(manager.formatStatus());
        }
        break;
      }

      case 'resume': {
        if (!storyId) {
          console.error(chalk.red('Error: story-id required'));
          process.exit(1);
        }

        const manager = new BuildStateManager(storyId, { verbose });
        const context = manager.resumeBuild();

        console.log(chalk.green(`\n✓ Resumed build for ${storyId}`));
        console.log(chalk.dim(`  From checkpoint: ${context.lastCheckpoint?.id || 'start'}`));
        console.log(chalk.dim(`  Completed: ${context.completedSubtasks.length} subtasks`));
        console.log(chalk.dim(`  Next subtask: ${context.nextSubtask || 'determine from plan'}`));
        break;
      }

      case 'checkpoint': {
        if (!storyId || !subtaskId) {
          console.error(chalk.red('Error: story-id and subtask-id required'));
          process.exit(1);
        }

        const manager = new BuildStateManager(storyId, { verbose });
        manager.loadState();
        const checkpoint = manager.saveCheckpoint(subtaskId);

        console.log(chalk.green(`\n✓ Checkpoint saved: ${checkpoint.id}`));
        console.log(chalk.dim(`  Subtask: ${subtaskId}`));
        break;
      }

      case 'detect-abandoned': {
        if (!storyId) {
          console.error(chalk.red('Error: story-id required'));
          process.exit(1);
        }

        const manager = new BuildStateManager(storyId, { verbose });
        const result = manager.detectAbandoned(threshold);

        if (result.detected) {
          console.log(chalk.red(`\n⚠ Build ${storyId} is ABANDONED`));
          console.log(chalk.dim(`  Last activity: ${result.lastActivity}`));
          console.log(chalk.dim(`  Elapsed: ${result.elapsed}`));
          console.log(chalk.dim(`  Threshold: ${result.threshold}`));
        } else {
          console.log(chalk.green(`\n✓ Build ${storyId} is active`));
          console.log(chalk.dim(`  Elapsed since last activity: ${result.elapsed}`));
        }
        break;
      }

      case 'cleanup': {
        if (!storyId) {
          console.error(chalk.red('Error: story-id required'));
          process.exit(1);
        }

        const manager = new BuildStateManager(storyId, { verbose });
        const result = await manager.cleanup({ force });

        if (result.cleaned) {
          console.log(chalk.green(`\n✓ Cleaned up build state for ${storyId}`));
          console.log(chalk.dim(`  Removed ${result.filesRemoved.length} files`));
        } else {
          console.log(chalk.yellow(`\n⚠ Could not cleanup: ${result.reason}`));
        }
        break;
      }

      case 'log': {
        if (!storyId) {
          console.error(chalk.red('Error: story-id required'));
          process.exit(1);
        }

        const manager = new BuildStateManager(storyId, { verbose });
        const logs = manager.getAttemptLog({ limit, subtaskId });

        console.log(chalk.bold(`\nAttempt Log: ${storyId}`));
        console.log('─'.repeat(70));

        if (logs.length === 0) {
          console.log(chalk.dim('  No log entries found.'));
        } else {
          for (const line of logs) {
            console.log(line);
          }
        }
        break;
      }

      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}`));
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  BuildStateManager,
  BuildStatus,
  NotificationType,
  validateBuildState,
  DEFAULT_CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
