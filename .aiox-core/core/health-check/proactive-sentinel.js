#!/usr/bin/env node

/**
 * AIOX Proactive Sentinel
 *
 * Story: HCS-3 - Proactive Health Monitoring
 * Epic: Epic 9 - Persistent Memory Layer / Health Check System
 *
 * Continuously monitors system health indicators and triggers
 * preventive actions before failures occur. Works with HealerManager
 * for automated remediation.
 *
 * Features:
 * - AC1: Registers watchpoints for system health indicators
 * - AC2: Evaluates watchpoints on configurable intervals
 * - AC3: Fires alerts with severity levels (info, warning, critical)
 * - AC4: Tracks alert history for pattern detection
 * - AC5: Integrates with HealerManager for auto-remediation
 * - AC6: Supports custom watchpoint functions
 * - AC7: Provides health score (0-100) aggregated from all watchpoints
 * - AC8: Persists alert history in .aiox/sentinel-alerts.json
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  alertsPath: '.aiox/sentinel-alerts.json',
  maxAlerts: 1000,
  retentionDays: 30,
  defaultIntervalMs: 60000, // 1 minute
  healthScoreWeights: {
    critical: 30,
    warning: 10,
    info: 2,
  },
  version: '1.0.0',
  schemaVersion: 'aiox-sentinel-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

const WatchpointStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  FAILING: 'failing',
  UNKNOWN: 'unknown',
};

const Events = {
  ALERT_FIRED: 'sentinel:alert',
  WATCHPOINT_REGISTERED: 'sentinel:watchpoint:registered',
  WATCHPOINT_EVALUATED: 'sentinel:watchpoint:evaluated',
  HEALTH_SCORE_CHANGED: 'sentinel:health:changed',
  SENTINEL_STARTED: 'sentinel:started',
  SENTINEL_STOPPED: 'sentinel:stopped',
  ALERTS_PRUNED: 'sentinel:alerts:pruned',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PROACTIVE SENTINEL
// ═══════════════════════════════════════════════════════════════════════════════════

class ProactiveSentinel extends EventEmitter {
  constructor(options = {}) {
    super();
    this.projectRoot = options.projectRoot || process.cwd();
    this.config = { ...CONFIG, ...options.config };
    this.watchpoints = new Map();
    this.alerts = [];
    this.running = false;
    this._timers = new Map();
    this._lastHealthScore = 100;
    this._loaded = false;
  }

  /**
   * Get the alerts file path
   */
  _getFilePath() {
    return path.join(this.projectRoot, this.config.alertsPath);
  }

  /**
   * Load alert history from disk
   */
  async load() {
    const filePath = this._getFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (data.schemaVersion !== this.config.schemaVersion) {
          this.alerts = [];
          this._loaded = true;
          return;
        }

        this.alerts = Array.isArray(data.alerts) ? data.alerts : [];
      }
    } catch {
      this.alerts = [];
    }
    this._loaded = true;
  }

  /**
   * Save alert history to disk
   */
  async save() {
    const filePath = this._getFilePath();
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      schemaVersion: this.config.schemaVersion,
      version: this.config.version,
      savedAt: new Date().toISOString(),
      alerts: this.alerts,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Register a watchpoint
   *
   * @param {Object} watchpoint
   * @param {string} watchpoint.id - Unique watchpoint ID
   * @param {string} watchpoint.name - Human-readable name
   * @param {string} watchpoint.description - What this monitors
   * @param {Function} watchpoint.check - Async function returning { status, message, data }
   * @param {number} [watchpoint.intervalMs] - Check interval (default: 60000)
   * @param {string} [watchpoint.severity] - Alert severity when failing (default: warning)
   * @param {boolean} [watchpoint.autoHeal] - Whether to trigger auto-healing (default: false)
   * @param {string} [watchpoint.healerId] - HealerManager check ID for remediation
   */
  registerWatchpoint(watchpoint) {
    if (!watchpoint.id || !watchpoint.name || !watchpoint.check) {
      throw new Error('Required fields: id, name, check');
    }

    if (typeof watchpoint.check !== 'function') {
      throw new Error('check must be a function');
    }

    const entry = {
      id: watchpoint.id,
      name: watchpoint.name,
      description: watchpoint.description || '',
      check: watchpoint.check,
      intervalMs: watchpoint.intervalMs ?? this.config.defaultIntervalMs,
      severity: watchpoint.severity ?? AlertSeverity.WARNING,
      autoHeal: watchpoint.autoHeal ?? false,
      healerId: watchpoint.healerId || null,
      lastStatus: WatchpointStatus.UNKNOWN,
      lastCheck: null,
      consecutiveFailures: 0,
    };

    this.watchpoints.set(watchpoint.id, entry);

    // If sentinel is already running, create a timer for the new watchpoint immediately
    if (this.running) {
      const timer = setInterval(() => {
        this.evaluateWatchpoint(entry.id).catch(() => {});
      }, entry.intervalMs);
      if (timer.unref) timer.unref();
      this._timers.set(entry.id, timer);
    }

    this.emit(Events.WATCHPOINT_REGISTERED, { id: entry.id, name: entry.name });
    return entry;
  }

  /**
   * Unregister a watchpoint
   * @param {string} id - Watchpoint ID
   * @returns {boolean} True if removed
   */
  unregisterWatchpoint(id) {
    if (this._timers.has(id)) {
      clearInterval(this._timers.get(id));
      this._timers.delete(id);
    }
    return this.watchpoints.delete(id);
  }

  /**
   * Evaluate a single watchpoint
   *
   * @param {string} id - Watchpoint ID
   * @returns {Object} Evaluation result
   */
  async evaluateWatchpoint(id) {
    const wp = this.watchpoints.get(id);
    if (!wp) {
      throw new Error(`Unknown watchpoint: ${id}`);
    }

    let result;
    try {
      result = await wp.check();
    } catch (error) {
      result = {
        status: WatchpointStatus.FAILING,
        message: `Check threw: ${error.message}`,
        data: null,
      };
    }

    const prevStatus = wp.lastStatus;
    wp.lastStatus = result.status || WatchpointStatus.UNKNOWN;
    wp.lastCheck = new Date().toISOString();

    // Track consecutive failures (DEGRADED counts as a soft failure)
    if (wp.lastStatus === WatchpointStatus.FAILING || wp.lastStatus === WatchpointStatus.DEGRADED) {
      wp.consecutiveFailures++;
    } else if (wp.lastStatus === WatchpointStatus.HEALTHY) {
      wp.consecutiveFailures = 0;
    }

    const evaluation = {
      watchpointId: id,
      name: wp.name,
      status: wp.lastStatus,
      previousStatus: prevStatus,
      message: result.message || '',
      data: result.data || null,
      consecutiveFailures: wp.consecutiveFailures,
      timestamp: wp.lastCheck,
    };

    this.emit(Events.WATCHPOINT_EVALUATED, evaluation);

    // Fire alert on non-healthy status or repeated failures
    if (
      wp.lastStatus !== WatchpointStatus.HEALTHY &&
      wp.lastStatus !== WatchpointStatus.UNKNOWN &&
      (prevStatus !== wp.lastStatus || wp.consecutiveFailures > 1)
    ) {
      this._fireAlert(wp, evaluation);
    }

    // Recalculate health score
    this._updateHealthScore();

    return evaluation;
  }

  /**
   * Evaluate all watchpoints
   * @returns {Object[]} All evaluation results
   */
  async evaluateAll() {
    const results = [];
    for (const [id] of this.watchpoints) {
      const result = await this.evaluateWatchpoint(id);
      results.push(result);
    }
    return results;
  }

  /**
   * Start continuous monitoring
   */
  start() {
    if (this.running) return;
    this.running = true;

    for (const [id, wp] of this.watchpoints) {
      const timer = setInterval(() => {
        this.evaluateWatchpoint(id).catch(() => {});
      }, wp.intervalMs);

      // Prevent timer from keeping process alive
      if (timer.unref) timer.unref();
      this._timers.set(id, timer);
    }

    this.emit(Events.SENTINEL_STARTED, {
      watchpoints: this.watchpoints.size,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Stop continuous monitoring
   */
  stop() {
    if (!this.running) return;
    this.running = false;

    for (const [id, timer] of this._timers) {
      clearInterval(timer);
      this._timers.delete(id);
    }

    this.emit(Events.SENTINEL_STOPPED, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get current health score (0-100)
   * @returns {number} Health score
   */
  getHealthScore() {
    return this._lastHealthScore;
  }

  /**
   * Get status of all watchpoints
   * @returns {Object[]} Watchpoint statuses
   */
  getStatus() {
    const statuses = [];
    for (const [, wp] of this.watchpoints) {
      statuses.push({
        id: wp.id,
        name: wp.name,
        status: wp.lastStatus,
        lastCheck: wp.lastCheck,
        consecutiveFailures: wp.consecutiveFailures,
        severity: wp.severity,
      });
    }
    return statuses;
  }

  /**
   * Get alert history
   * @param {Object} [filter]
   * @param {string} [filter.severity]
   * @param {string} [filter.watchpointId]
   * @param {number} [filter.limit]
   * @returns {Object[]} Filtered alerts
   */
  getAlerts(filter = {}) {
    let results = [...this.alerts];

    if (filter.severity) results = results.filter((a) => a.severity === filter.severity);
    if (filter.watchpointId)
      results = results.filter((a) => a.watchpointId === filter.watchpointId);
    if (filter.limit) results = results.slice(-filter.limit);

    return results;
  }

  /**
   * Get statistics summary
   */
  getStats() {
    const bySeverity = {};
    const byWatchpoint = {};

    for (const alert of this.alerts) {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      byWatchpoint[alert.watchpointId] = (byWatchpoint[alert.watchpointId] || 0) + 1;
    }

    return {
      totalAlerts: this.alerts.length,
      totalWatchpoints: this.watchpoints.size,
      healthScore: this._lastHealthScore,
      running: this.running,
      bySeverity,
      byWatchpoint,
    };
  }

  /**
   * Prune old alerts beyond retention window
   * @returns {number} Number of pruned alerts
   */
  prune() {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const before = this.alerts.length;

    this.alerts = this.alerts.filter((a) => new Date(a.timestamp).getTime() >= cutoff);

    const pruned = before - this.alerts.length;
    if (pruned > 0) {
      this.emit(Events.ALERTS_PRUNED, { count: pruned });
    }
    return pruned;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              BUILT-IN WATCHPOINTS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Register built-in system watchpoints
   */
  registerBuiltInWatchpoints() {
    const projectRoot = this.projectRoot;

    // 1. Config file integrity
    this.registerWatchpoint({
      id: 'config-integrity',
      name: 'Config File Integrity',
      description: 'Checks that core JSON config files are valid and YAML files are readable',
      severity: AlertSeverity.CRITICAL,
      check: async () => {
        const configFiles = [
          path.join(projectRoot, 'core-config.yaml'),
          path.join(projectRoot, 'package.json'),
        ];

        for (const file of configFiles) {
          if (!fs.existsSync(file)) continue;
          try {
            const content = fs.readFileSync(file, 'utf8');
            if (file.endsWith('.json')) {
              JSON.parse(content);
            } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
              // Without a YAML parser, verify the file is readable and non-empty
              if (!content.trim()) {
                return {
                  status: WatchpointStatus.FAILING,
                  message: `Empty config: ${path.basename(file)}`,
                  data: { file },
                };
              }
            }
          } catch {
            return {
              status: WatchpointStatus.FAILING,
              message: `Corrupted config: ${path.basename(file)}`,
              data: { file },
            };
          }
        }
        return { status: WatchpointStatus.HEALTHY, message: 'All configs valid' };
      },
    });

    // 2. Memory file integrity
    this.registerWatchpoint({
      id: 'memory-integrity',
      name: 'Memory Files Integrity',
      description: 'Checks that .aiox JSON files are parseable',
      severity: AlertSeverity.WARNING,
      check: async () => {
        const memDir = path.join(projectRoot, '.aiox');
        if (!fs.existsSync(memDir)) {
          return { status: WatchpointStatus.HEALTHY, message: 'No memory dir yet' };
        }

        const files = fs.readdirSync(memDir).filter((f) => f.endsWith('.json'));
        const corrupted = [];

        for (const file of files) {
          try {
            JSON.parse(fs.readFileSync(path.join(memDir, file), 'utf8'));
          } catch {
            corrupted.push(file);
          }
        }

        if (corrupted.length > 0) {
          return {
            status: WatchpointStatus.FAILING,
            message: `Corrupted memory files: ${corrupted.join(', ')}`,
            data: { corrupted },
          };
        }
        return { status: WatchpointStatus.HEALTHY, message: 'All memory files valid' };
      },
    });

    // 3. Stale lock files
    this.registerWatchpoint({
      id: 'stale-locks',
      name: 'Stale Lock File Detection',
      description: 'Detects orphaned .lock files that may block operations',
      severity: AlertSeverity.WARNING,
      autoHeal: true,
      check: async () => {
        const lockDir = path.join(projectRoot, '.aiox');
        const staleLocks = [];
        const maxAge = 30 * 60 * 1000; // 30 minutes

        if (fs.existsSync(lockDir)) {
          const files = fs.readdirSync(lockDir).filter((f) => f.endsWith('.lock'));
          for (const file of files) {
            const filePath = path.join(lockDir, file);
            try {
              const stat = fs.statSync(filePath);
              if (Date.now() - stat.mtimeMs > maxAge) {
                staleLocks.push(filePath);
              }
            } catch {
              // ignore inaccessible files
            }
          }
        }

        if (staleLocks.length > 0) {
          return {
            status: WatchpointStatus.DEGRADED,
            message: `Found ${staleLocks.length} stale lock file(s)`,
            data: { locks: staleLocks },
          };
        }
        return { status: WatchpointStatus.HEALTHY, message: 'No stale locks' };
      },
    });

    // 4. Disk space
    this.registerWatchpoint({
      id: 'disk-space',
      name: 'Disk Space Monitor',
      description: 'Monitors available disk space for .aiox directory',
      severity: AlertSeverity.WARNING,
      check: async () => {
        const memDir = path.join(projectRoot, '.aiox');
        if (!fs.existsSync(memDir)) {
          return { status: WatchpointStatus.HEALTHY, message: 'No .aiox dir' };
        }

        const totalSize = this._getDirectorySize(memDir);

        const maxSize = 50 * 1024 * 1024; // 50MB warning threshold
        if (totalSize > maxSize) {
          return {
            status: WatchpointStatus.DEGRADED,
            message: `Memory dir is ${Math.round(totalSize / 1024 / 1024)}MB (threshold: 50MB)`,
            data: { totalSizeBytes: totalSize },
          };
        }
        return {
          status: WatchpointStatus.HEALTHY,
          message: `Memory dir: ${Math.round(totalSize / 1024)}KB`,
        };
      },
    });

    // 5. Workspace structure
    this.registerWatchpoint({
      id: 'workspace-structure',
      name: 'Workspace Directory Structure',
      description: 'Verifies essential directories exist',
      severity: AlertSeverity.INFO,
      check: async () => {
        const requiredDirs = ['.aiox-core', 'tests', 'bin'];
        const missing = requiredDirs.filter((d) => !fs.existsSync(path.join(projectRoot, d)));

        // Also check .aios-core for backward compat
        if (missing.includes('.aiox-core') && fs.existsSync(path.join(projectRoot, '.aios-core'))) {
          missing.splice(missing.indexOf('.aiox-core'), 1);
        }

        if (missing.length > 0) {
          return {
            status: WatchpointStatus.DEGRADED,
            message: `Missing directories: ${missing.join(', ')}`,
            data: { missing },
          };
        }
        return { status: WatchpointStatus.HEALTHY, message: 'All directories present' };
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              INTERNAL METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Recursively compute the total size of a directory in bytes
   * @param {string} dir - Directory path
   * @returns {number} Total size in bytes
   * @private
   */
  _getDirectorySize(dir) {
    let totalSize = 0;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        try {
          if (entry.isDirectory()) {
            totalSize += this._getDirectorySize(fullPath);
          } else {
            const stat = fs.statSync(fullPath);
            totalSize += stat.size;
          }
        } catch {
          // ignore inaccessible entries
        }
      }
    } catch {
      // ignore unreadable directories
    }
    return totalSize;
  }

  /**
   * Fire an alert
   * @private
   */
  _fireAlert(watchpoint, evaluation) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      watchpointId: watchpoint.id,
      name: watchpoint.name,
      severity: watchpoint.severity,
      status: evaluation.status,
      message: evaluation.message,
      data: evaluation.data,
      consecutiveFailures: evaluation.consecutiveFailures,
      autoHeal: watchpoint.autoHeal,
      healerId: watchpoint.healerId,
      timestamp: new Date().toISOString(),
    };

    this.alerts.push(alert);

    // Enforce max alerts
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts.shift();
    }

    this.emit(Events.ALERT_FIRED, alert);
    return alert;
  }

  /**
   * Update aggregated health score
   * @private
   */
  _updateHealthScore() {
    if (this.watchpoints.size === 0) {
      this._lastHealthScore = 100;
      return;
    }

    let deductions = 0;
    for (const [, wp] of this.watchpoints) {
      if (wp.lastStatus === WatchpointStatus.FAILING) {
        deductions += this.config.healthScoreWeights[wp.severity] || 10;
      } else if (wp.lastStatus === WatchpointStatus.DEGRADED) {
        deductions += (this.config.healthScoreWeights[wp.severity] || 10) * 0.5;
      }
    }

    const newScore = Math.max(0, Math.min(100, 100 - deductions));
    if (newScore !== this._lastHealthScore) {
      const prev = this._lastHealthScore;
      this._lastHealthScore = newScore;
      this.emit(Events.HEALTH_SCORE_CHANGED, { previous: prev, current: newScore });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = ProactiveSentinel;
module.exports.ProactiveSentinel = ProactiveSentinel;
module.exports.AlertSeverity = AlertSeverity;
module.exports.WatchpointStatus = WatchpointStatus;
module.exports.Events = Events;
module.exports.CONFIG = CONFIG;
