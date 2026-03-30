/**
 * ActivityLogger -- Corporation Event Sourcing System
 *
 * Registers ALL agent actions as immutable JSONL events.
 * Buffer-based for performance, with periodic flush to disk.
 *
 * @module core/corporation/activity-logger
 * @version 1.0.0
 * @story CORP-3 - ActivityLogger + JSONL Storage
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_MAX_BUFFER_SIZE = 50;
const DEFAULT_RETENTION_DAYS = 90;
const DEFAULT_QUERY_LIMIT = 100;
const FILE_PREFIX = 'activity-';
const FILE_EXTENSION = '.jsonl';

const VALID_RESULTS = ['success', 'failure', 'pending', 'escalated', 'denied', 'queued'];
const VALID_LEVELS = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];

// =====================================================
// ActivityLogger
// =====================================================

class ActivityLogger {
  /**
   * @param {Object} options
   * @param {string} [options.logDir] - Directory for JSONL files
   * @param {number} [options.flushInterval] - Flush interval in ms (default 5000)
   * @param {number} [options.maxBufferSize] - Max buffer before auto-flush (default 50)
   * @param {number} [options.retentionDays] - Days to keep logs (default 90)
   * @param {boolean} [options.autoStart] - Start flush timer on construction (default true)
   */
  constructor(options = {}) {
    this.logDir = options.logDir
      || path.join(process.cwd(), '.aios', 'corporation', 'activity');
    this.flushInterval = options.flushInterval || DEFAULT_FLUSH_INTERVAL_MS;
    this.maxBufferSize = options.maxBufferSize || DEFAULT_MAX_BUFFER_SIZE;
    this.retentionDays = options.retentionDays || DEFAULT_RETENTION_DAYS;

    this.buffer = [];
    this._timer = null;
    this._closed = false;
    this._ensuredDir = false;

    // Auto-start flush timer unless explicitly disabled
    if (options.autoStart !== false) {
      this._startTimer();
    }

    // Graceful shutdown handlers
    this._exitHandler = () => this.close();
    process.on('exit', this._exitHandler);
    process.on('SIGINT', this._exitHandler);
    process.on('SIGTERM', this._exitHandler);
  }

  // =====================================================
  // PUBLIC API -- Logging
  // =====================================================

  /**
   * Log an event. Accepts partial event, auto-fills id and timestamp.
   * Buffered -- does NOT write to disk immediately.
   *
   * @param {Object} event - Partial CorporationEvent
   * @param {string} event.agent_id - Agent identifier
   * @param {string} event.action - Action performed
   * @param {string} [event.level] - Hierarchy level (L0-L5)
   * @param {string} [event.department] - Department name
   * @param {string} [event.target] - What was acted upon
   * @param {string} [event.result] - Action result
   * @param {number} [event.duration_ms] - Duration in milliseconds
   * @param {Object} [event.metadata] - Extra data
   * @param {string} [event.correlation_id] - Links related events
   * @param {string} [event.parent_event] - Parent event ID
   * @returns {string} Generated event ID
   */
  log(event) {
    if (this._closed) {
      throw new Error('ActivityLogger is closed');
    }

    const fullEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      agent_id: event.agent_id || 'unknown',
      level: event.level || 'L0',
      department: event.department || 'unassigned',
      action: event.action || 'unknown',
      target: event.target || '',
      result: event.result || 'success',
      duration_ms: event.duration_ms ?? null,
      metadata: event.metadata || {},
      correlation_id: event.correlation_id || null,
      parent_event: event.parent_event || null,
    };

    this.buffer.push(fullEvent);

    // Auto-flush on threshold
    if (this.buffer.length >= this.maxBufferSize) {
      this._flush();
    }

    return fullEvent.id;
  }

  /**
   * Force flush buffer to disk immediately.
   */
  flush() {
    this._flush();
  }

  /**
   * Graceful shutdown: flush + cleanup timers + remove handlers.
   */
  close() {
    if (this._closed) return;
    this._closed = true;

    this._stopTimer();
    this._flush();

    // Remove process handlers
    process.removeListener('exit', this._exitHandler);
    process.removeListener('SIGINT', this._exitHandler);
    process.removeListener('SIGTERM', this._exitHandler);
  }

  // =====================================================
  // PUBLIC API -- Query
  // =====================================================

  /**
   * Query events from JSONL files with filters.
   *
   * @param {Object} query
   * @param {string} [query.agent_id] - Filter by agent
   * @param {string} [query.department] - Filter by department
   * @param {string} [query.action] - Filter by action
   * @param {string} [query.result] - Filter by result
   * @param {string} [query.since] - ISO date string (inclusive)
   * @param {string} [query.until] - ISO date string (inclusive)
   * @param {number} [query.limit] - Max results (default 100)
   * @returns {Object[]} Matching events
   */
  query(query = {}) {
    // Flush buffer first so in-memory events are queryable
    this._flush();

    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const files = this._getLogFiles(query.since, query.until);
    const events = [];

    for (const file of files) {
      if (!fs.existsSync(file)) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (this._matchesQuery(event, query)) {
            events.push(event);
            if (events.length >= limit) return events;
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    return events;
  }

  /**
   * Get summary statistics grouped by department, action, agent, result.
   *
   * @param {Object} options
   * @param {string} [options.since] - ISO date for start range
   * @param {string} [options.until] - ISO date for end range
   * @returns {Object} Summary with total_events, by_department, by_action, by_agent, by_result
   */
  summarize(options = {}) {
    const events = this.query({
      since: options.since,
      until: options.until,
      limit: 10000,
    });

    return {
      total_events: events.length,
      by_department: this._groupBy(events, 'department'),
      by_action: this._groupBy(events, 'action'),
      by_agent: this._groupBy(events, 'agent_id'),
      by_result: this._groupBy(events, 'result'),
    };
  }

  // =====================================================
  // PUBLIC API -- Retention
  // =====================================================

  /**
   * Remove log files older than retention period.
   * Called manually or during startup.
   *
   * @param {number} [daysToKeep] - Override retention days
   * @returns {string[]} List of removed file names
   */
  cleanup(daysToKeep) {
    const days = daysToKeep || this.retentionDays;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const removed = [];

    if (!fs.existsSync(this.logDir)) return removed;

    const files = fs.readdirSync(this.logDir);
    for (const file of files) {
      if (!file.startsWith(FILE_PREFIX) || !file.endsWith(FILE_EXTENSION)) continue;

      const dateStr = file.replace(FILE_PREFIX, '').replace(FILE_EXTENSION, '');
      if (dateStr < cutoffStr) {
        fs.unlinkSync(path.join(this.logDir, file));
        removed.push(file);
      }
    }

    return removed;
  }

  // =====================================================
  // INTERNAL -- Flush
  // =====================================================

  /**
   * @private
   * Write buffered events to disk as JSONL.
   * Uses appendFileSync for atomicity.
   */
  _flush() {
    if (this.buffer.length === 0) return;

    this._ensureDir();

    const today = new Date().toISOString().split('T')[0];
    const filePath = path.join(this.logDir, `${FILE_PREFIX}${today}${FILE_EXTENSION}`);

    const lines = this.buffer.map(e => JSON.stringify(e)).join('\n') + '\n';

    try {
      fs.appendFileSync(filePath, lines, 'utf-8');
    } catch (err) {
      // If write fails, keep buffer for next attempt
      console.error(`[ActivityLogger] Failed to flush: ${err.message}`);
      return;
    }

    this.buffer = [];
  }

  // =====================================================
  // INTERNAL -- Timer
  // =====================================================

  /** @private */
  _startTimer() {
    if (this._timer) return;
    this._timer = setInterval(() => {
      this._flush();
    }, this.flushInterval);

    // Unref so timer doesn't keep process alive
    if (this._timer.unref) {
      this._timer.unref();
    }
  }

  /** @private */
  _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // =====================================================
  // INTERNAL -- File Operations
  // =====================================================

  /** @private */
  _ensureDir() {
    if (this._ensuredDir) return;
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this._ensuredDir = true;
  }

  /**
   * @private
   * Get log file paths for the given date range.
   * Returns files sorted chronologically.
   */
  _getLogFiles(since, until) {
    if (!fs.existsSync(this.logDir)) return [];

    const allFiles = fs.readdirSync(this.logDir)
      .filter(f => f.startsWith(FILE_PREFIX) && f.endsWith(FILE_EXTENSION))
      .sort();

    const sinceDate = since ? since.split('T')[0] : null;
    const untilDate = until ? until.split('T')[0] : null;

    return allFiles
      .filter(f => {
        const dateStr = f.replace(FILE_PREFIX, '').replace(FILE_EXTENSION, '');
        if (sinceDate && dateStr < sinceDate) return false;
        if (untilDate && dateStr > untilDate) return false;
        return true;
      })
      .map(f => path.join(this.logDir, f));
  }

  // =====================================================
  // INTERNAL -- Query Helpers
  // =====================================================

  /**
   * @private
   * Check if event matches all query filters.
   */
  _matchesQuery(event, query) {
    if (query.agent_id && event.agent_id !== query.agent_id) return false;
    if (query.department && event.department !== query.department) return false;
    if (query.action && event.action !== query.action) return false;
    if (query.result && event.result !== query.result) return false;

    if (query.since) {
      const sinceDate = new Date(query.since);
      const eventDate = new Date(event.timestamp);
      if (eventDate < sinceDate) return false;
    }

    if (query.until) {
      const untilDate = new Date(query.until);
      const eventDate = new Date(event.timestamp);
      if (eventDate > untilDate) return false;
    }

    return true;
  }

  /**
   * @private
   * Group events by a field and count occurrences.
   */
  _groupBy(events, field) {
    const groups = {};
    for (const event of events) {
      const key = event[field] || 'unknown';
      groups[key] = (groups[key] || 0) + 1;
    }
    return groups;
  }
}

// =====================================================
// SINGLETON FACTORY
// =====================================================

let _instance = null;

/**
 * Get or create the ActivityLogger singleton.
 * Respects corporation.enabled flag from core-config.yaml.
 *
 * @param {Object} [options] - Constructor options (only used on first call)
 * @returns {ActivityLogger|null} Logger instance or null if corporation disabled
 */
function getActivityLogger(options = {}) {
  if (_instance) return _instance;

  // Check feature flag
  if (!_isCorporationEnabled()) {
    return null;
  }

  _instance = new ActivityLogger(options);

  // Run retention cleanup on startup
  try {
    _instance.cleanup();
  } catch {
    // Non-fatal
  }

  return _instance;
}

// Shared utility — migrated from inline duplicate (2026-03-30)
const { isCorporationEnabled: _isCorporationEnabled } = require('./utils');

/**
 * Reset singleton (for testing).
 * @private
 */
function _resetInstance() {
  if (_instance) {
    _instance.close();
    _instance = null;
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  ActivityLogger,
  getActivityLogger,
  _resetInstance,
  // Constants exposed for CLI and tests
  VALID_RESULTS,
  VALID_LEVELS,
  DEFAULT_QUERY_LIMIT,
  DEFAULT_RETENTION_DAYS,
};
