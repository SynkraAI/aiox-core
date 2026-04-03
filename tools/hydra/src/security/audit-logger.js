/**
 * @module audit-logger
 * @description Story 6.4 -- Structured audit trail for HYDRA pipeline.
 * SQLite-backed, append-only, queryable audit log in hydra.db.
 */

import { randomUUID } from 'node:crypto';

/**
 * Audit event severity levels.
 */
export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * @typedef {Object} AuditEntry
 * @property {string} run_id
 * @property {string} action
 * @property {string} [content_id]
 * @property {string} [source_type]
 * @property {string} [source_url]
 * @property {string} [tier]
 * @property {number} [score]
 * @property {string} [severity]
 * @property {Object} [details]
 * @property {string} [error]
 */

export class AuditLogger {
  /**
   * @param {Object} db - better-sqlite3 database instance (shared with DedupStore)
   */
  constructor(db) {
    this.db = db;
    this._statements = null;
    this._init();
  }

  /**
   * Create the audit_log table and indexes.
   * @private
   */
  _init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        run_id TEXT NOT NULL,
        action TEXT NOT NULL,
        content_id TEXT,
        source_type TEXT,
        source_url TEXT,
        tier TEXT,
        score REAL,
        severity TEXT DEFAULT 'info',
        details TEXT,
        error TEXT
      )
    `);

    // Create indexes if they don't exist
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_run_id ON audit_log(run_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_content_id ON audit_log(content_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_log(severity)`);

    this._statements = {
      insert: this.db.prepare(`
        INSERT INTO audit_log (run_id, action, content_id, source_type, source_url, tier, score, severity, details, error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      getRunHistory: this.db.prepare(`
        SELECT run_id, MIN(timestamp) as started, MAX(timestamp) as ended,
               COUNT(*) as event_count,
               SUM(CASE WHEN action = 'run_start' THEN 1 ELSE 0 END) as started_flag,
               SUM(CASE WHEN action = 'run_end' THEN 1 ELSE 0 END) as ended_flag
        FROM audit_log
        GROUP BY run_id
        ORDER BY started DESC
        LIMIT ?
      `),
      getContentHistory: this.db.prepare(`
        SELECT * FROM audit_log WHERE content_id = ? ORDER BY timestamp ASC
      `),
      getRunEvents: this.db.prepare(`
        SELECT * FROM audit_log WHERE run_id = ? ORDER BY timestamp ASC
      `),
      getActionCounts: this.db.prepare(`
        SELECT action, COUNT(*) as count
        FROM audit_log
        WHERE timestamp >= datetime('now', ?)
        GROUP BY action
        ORDER BY count DESC
      `),
      getBySeverity: this.db.prepare(`
        SELECT * FROM audit_log
        WHERE severity = ? AND timestamp >= datetime('now', ?)
        ORDER BY timestamp DESC
        LIMIT ?
      `),
      cleanup: this.db.prepare(`
        DELETE FROM audit_log WHERE timestamp < datetime('now', ?)
      `),
      getCount: this.db.prepare(`SELECT COUNT(*) as count FROM audit_log`),
    };
  }

  /**
   * Generate a new run ID.
   * @returns {string}
   */
  static generateRunId() {
    return randomUUID();
  }

  /**
   * Log a pipeline action.
   * @param {string} runId - Pipeline run ID
   * @param {string} action - Action type
   * @param {AuditEntry} [entry={}] - Entry details
   */
  logAction(runId, action, entry = {}) {
    try {
      this._statements.insert.run(
        runId,
        action,
        entry.contentId || null,
        entry.sourceType || null,
        entry.sourceUrl || null,
        entry.tier || null,
        entry.score ?? null,
        entry.severity || SEVERITY.INFO,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.error || null
      );
    } catch (err) {
      // Audit logging should never crash the pipeline
      console.error(`[AuditLogger] Failed to log action: ${err.message}`);
    }
  }

  /**
   * Log pipeline run start.
   * @param {string} runId
   * @param {Object} meta - Run metadata
   */
  logRunStart(runId, meta = {}) {
    this.logAction(runId, 'run_start', {
      details: meta,
      severity: SEVERITY.INFO,
    });
  }

  /**
   * Log pipeline run end.
   * @param {string} runId
   * @param {Object} result - Pipeline result summary
   */
  logRunEnd(runId, result = {}) {
    this.logAction(runId, 'run_end', {
      details: result,
      severity: result.error ? SEVERITY.ERROR : SEVERITY.INFO,
      error: result.error || null,
    });
  }

  /**
   * Log a security alert.
   * @param {string} runId
   * @param {string} alertType - Alert type (injection_suspect, pii_redacted, etc.)
   * @param {Object} details - Alert details
   */
  logSecurityAlert(runId, alertType, details = {}) {
    this.logAction(runId, `security_${alertType}`, {
      ...details,
      severity: SEVERITY.WARNING,
    });
  }

  /**
   * Get run history.
   * @param {number} [limit=10]
   * @returns {Object[]}
   */
  getRunHistory(limit = 10) {
    return this._statements.getRunHistory.all(limit);
  }

  /**
   * Get full history for a content item.
   * @param {string} contentId
   * @returns {Object[]}
   */
  getContentHistory(contentId) {
    return this._statements.getContentHistory.all(contentId);
  }

  /**
   * Get all events for a specific run.
   * @param {string} runId
   * @returns {Object[]}
   */
  getRunEvents(runId) {
    return this._statements.getRunEvents.all(runId);
  }

  /**
   * Get action counts since a given time offset.
   * @param {string} [since='-7 days'] - SQLite date modifier
   * @returns {Object[]}
   */
  getActionCounts(since = '-7 days') {
    return this._statements.getActionCounts.all(since);
  }

  /**
   * Get entries by severity.
   * @param {string} severity
   * @param {string} [since='-7 days']
   * @param {number} [limit=50]
   * @returns {Object[]}
   */
  getBySeverity(severity, since = '-7 days', limit = 50) {
    return this._statements.getBySeverity.all(severity, since, limit);
  }

  /**
   * Cleanup old audit entries.
   * @param {number} [retentionDays=90]
   * @returns {{ deleted: number }}
   */
  cleanup(retentionDays = 90) {
    const result = this._statements.cleanup.run(`-${retentionDays} days`);
    return { deleted: result.changes };
  }

  /**
   * Get total count of audit entries.
   * @returns {number}
   */
  getCount() {
    return this._statements.getCount.get().count;
  }

  /**
   * Format run history for CLI display.
   * @param {Object[]} runs
   * @returns {string}
   */
  static formatRunHistory(runs) {
    if (!runs || runs.length === 0) return 'No audit log entries found.';

    const lines = ['Run History:', ''];
    for (const run of runs) {
      lines.push(`  Run: ${run.run_id}`);
      lines.push(`    Started: ${run.started}`);
      lines.push(`    Ended:   ${run.ended || 'in progress'}`);
      lines.push(`    Events:  ${run.event_count}`);
      lines.push('');
    }
    return lines.join('\n');
  }

  /**
   * Format action counts for CLI display.
   * @param {Object[]} counts
   * @returns {string}
   */
  static formatActionCounts(counts) {
    if (!counts || counts.length === 0) return 'No actions recorded.';

    const lines = ['Action Summary:', ''];
    for (const { action, count } of counts) {
      lines.push(`  ${action}: ${count}`);
    }
    return lines.join('\n');
  }
}
