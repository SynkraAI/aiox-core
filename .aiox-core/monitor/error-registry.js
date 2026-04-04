/**
 * @file error-registry.js
 * @description Central error registration and persistence module for Synkra AIOX.
 * Part of Principle VII: Error Governance.
 *
 * Uses a Write Queue pattern to coalesce concurrent log() calls into a single
 * disk I/O operation, eliminating lock contention under high concurrency.
 */

'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const LockManager = require('../core/orchestration/lock-manager');
const AIOXError = require('../utils/aiox-error');

/**
 * Maximum number of entries to keep in the persistent log file.
 * @type {number}
 */
const MAX_LOG_ENTRIES = 500;

/**
 * Manages the persistence and classification of errors across the framework.
 * Singleton — exported as a pre-instantiated instance.
 *
 * Architecture: Instead of each `log()` call independently acquiring a file lock,
 * entries are pushed to an in-memory queue. A single "drain" operation coalesces
 * all pending entries into one lock-read-write-unlock cycle. This reduces N
 * concurrent writes from O(N) disk operations to O(1).
 */
class ErrorRegistry {
  constructor() {
    this.logDir = path.join(process.cwd(), '.aiox', 'logs');
    this.logFile = path.join(this.logDir, 'errors.json');
    this.lockManager = new LockManager(process.cwd(), { owner: 'error-registry' });

    /**
     * Stores the initialization promise to prevent duplicate async init calls.
     * @type {Promise<void>|null}
     * @private
     */
    this._initPromise = null;

    /**
     * Write queue — holds pending entries waiting to be flushed to disk.
     * Each item is { entry: Object, resolve: Function, reject: Function }.
     * @type {Array<{entry: Object, resolve: Function, reject: Function}>}
     * @private
     */
    this._queue = [];

    /**
     * Whether a drain operation is already scheduled for the next tick.
     * @type {boolean}
     * @private
     */
    this._drainScheduled = false;
    this._isDraining = false;
  }

  // ──────────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────────

  /**
   * Initializes the log directory and file.
   * Ensures the storage location exists and is writable.
   * @returns {Promise<void>}
   */
  async init() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        if (!fs.existsSync(this.logDir)) {
          await fsp.mkdir(this.logDir, { recursive: true });
        }

        if (!fs.existsSync(this.logFile)) {
          await fsp.writeFile(this.logFile, JSON.stringify([], null, 2), 'utf8');
        }
      } catch (err) {
        // Inception error: Cannot log the failure of the logger to the logger
        process.stderr.write(`[ErrorRegistry] CRITICAL: Failed to initialize logs: ${err.message}\n`);
      }
    })();

    return this._initPromise;
  }

  /**
   * Registers an error into the persistent log.
   *
   * The entry is enqueued and flushed to disk in a batched write.
   * Multiple concurrent `log()` calls are coalesced into a single I/O operation.
   *
   * @param {Error|AIOXError|string} error - The error object or message to log.
   * @param {Object} [options={}] - Additional context and log options.
   * @param {boolean} [options.display] - Force display on/off (default: true unless silent).
   * @param {boolean} [options.raw] - Display raw message without icons/formatting.
   * @returns {Promise<AIOXError>} The normalized AIOXError that was logged.
   */
  async log(error, options = {}) {
    // Fast-path: avoid re-awaiting init if already fully initialized
    if (!this._initPromise) {
      await this.init();
    } else {
      // Still need to ensure it finished if it's in progress
      await this._initPromise;
    }

    // Normalize error to AIOXError
    const aioxError = this._normalizeError(error, options);

    // Output to console (stderr) for immediate feedback
    this._displayIfNeeded(aioxError, options);

    // Enqueue for batched persistence
    await this._enqueue(aioxError);
    return aioxError;
  }

  /**
   * Retrieves the last N errors from the log.
   * Synchronous because it's often used in CLI teardowns or summary views.
   * @param {number} [count=10]
   * @returns {Array<Object>}
   */
  getRecentErrors(count = 10) {
    try {
      if (!fs.existsSync(this.logFile)) return [];
      const data = fs.readFileSync(this.logFile, 'utf8');
      const logs = JSON.parse(data);
      return logs.slice(-count);
    } catch (err) {
      return [];
    }
  }

  // ──────────────────────────────────────────────
  //  Private: Normalization & UI
  // ──────────────────────────────────────────────

  /**
   * Normalizes various error inputs into a standard AIOXError instance.
   * @private
   * @param {Error|AIOXError|string} error
   * @param {Object} options
   * @returns {AIOXError}
   */
  _normalizeError(error, options) {
    if (error instanceof AIOXError) {
      // Clone to avoid mutating original instance (Principle VII integrity)
      const clone = Object.create(Object.getPrototypeOf(error));
      Object.assign(clone, error, options);
      // Ensure non-enumerable Error properties are preserved
      clone.message = error.message;
      clone.stack = error.stack;
      return clone;
    }

    if (error instanceof Error) {
      return new AIOXError(error.message, {
        category: 'SYSTEM',
        ...options,
        metadata: { ...options.metadata, originalStack: error.stack },
      });
    }

    return new AIOXError(String(error), {
      category: 'OPERATIONAL',
      ...options,
    });
  }

  /**
   * Conditionally outputs an error to stderr for immediate CLI feedback.
   * @private
   * @param {AIOXError} aioxError
   * @param {Object} options
   */
  _displayIfNeeded(aioxError, options) {
    const shouldDisplay = options.display !== false && !aioxError.silent;
    if (!shouldDisplay) return;

    if (options.raw) {
      process.stderr.write(`${aioxError.message}\n`);
    } else {
      const icon = aioxError.category === 'SYSTEM' ? '🔴' : '🟡';
      const agentSuffix = aioxError.agentId ? ` (${aioxError.agentId})` : '';
      process.stderr.write(`${icon} [${aioxError.category}] ${aioxError.message}${agentSuffix}\n`);
    }
  }

  // ──────────────────────────────────────────────
  //  Private: Write Queue (Batched Persistence)
  // ──────────────────────────────────────────────

  /**
   * Enqueues a serialized error entry for batched disk write.
   * Returns a Promise that resolves when the entry has been persisted.
   * @private
   * @param {AIOXError} aioxError
   * @returns {Promise<void>}
   */
  _enqueue(aioxError) {
    return new Promise((resolve, reject) => {
      this._queue.push({ entry: aioxError.toJSON(), resolve, reject });
      this._scheduleDrain();
    });
  }

  /**
   * Schedules a drain operation. Coalesces concurrent calls.
   * @private
   */
  _scheduleDrain() {
    if (this._isDraining || this._drainScheduled) return;
    
    this._drainScheduled = true;
    process.nextTick(() => {
      this._drain().catch(err => {
        process.stderr.write(`[ErrorRegistry] FATAL DRAIN ERROR: ${err.message}\n`);
      });
    });
  }

  /**
   * Drains the write queue: acquires the file lock once, appends all
   * pending entries, writes the file, and resolves all pending promises.
   * @private
   * @returns {Promise<void>}
   */
  async _drain() {
    if (this._isDraining) return;
    
    this._isDraining = true;
    this._drainScheduled = false;

    // Capture the current queue and clear it immediately
    const batch = [...this._queue];
    this._queue = [];

    if (batch.length === 0) {
      this._isDraining = false;
      return;
    }

    try {
      // 1. Acquire lock (Formal LockManager from Story 12.3)
      const lockAcquired = await this.lockManager.acquireLock('errors-json', { ttlSeconds: 60 });
      if (!lockAcquired) {
        throw new Error('Could not acquire lock on error registry after multiple retries');
      }

      // 2. Read
      const logs = await this._readLogFile();

      // 3. Append batch
      for (const item of batch) {
        logs.push(item.entry);
      }

      // 4. Rotate & Serialize
      const rotated = this._rotateEntries(logs);
      const serialized = this._safeStringify(rotated);

      // 5. Write
      await fsp.writeFile(this.logFile, serialized, 'utf8');

      // 6. Success: Resolve all
      for (const item of batch) {
        item.resolve();
      }
    } catch (err) {
      process.stderr.write(`[ErrorRegistry] Persistence failure: ${err.message}\n`);
      // Fail: Reject all
      for (const item of batch) {
        item.reject(err);
      }
    } finally {
      // 7. Release lock
      await this.lockManager.releaseLock('errors-json');
      
      // 8. Ready for next
      this._isDraining = false;
      
      // 9. If more items arrived during write, schedule again
      if (this._queue.length > 0) {
        this._scheduleDrain();
      }
    }
  }

  // ──────────────────────────────────────────────
  //  Private: File I/O Helpers
  // ──────────────────────────────────────────────

  /**
   * Reads and parses the log file. If the file is corrupted,
   * creates a backup with a unique filename and returns an empty array.
   * @private
   * @returns {Promise<Array<Object>>}
   */
  async _readLogFile() {
    let data;
    try {
      if (!fs.existsSync(this.logFile)) return [];
      data = await fsp.readFile(this.logFile, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      
      // SELF-HEALING: If corruption detected, backup and start fresh
      const backupFile = `${this.logFile}.${Date.now()}.corrupt.bak`;
      try {
        if (data) {
          await fsp.writeFile(backupFile, data, 'utf8');
        } else {
          // If reading failed, try a sync copy of whatever is left
          fs.copyFileSync(this.logFile, backupFile);
        }
        process.stderr.write(`[ErrorRegistry] Log corruption detected! Recovery: Backup created at ${backupFile}\n`);
      } catch (backupErr) { /* ignore backup failure */ }
      
      return [];
    }
  }

  /**
   * Truncates the log to the maximum allowed size.
   * @private
   * @param {Array<Object>} entries 
   * @returns {Array<Object>}
   */
  _rotateEntries(entries) {
    if (entries.length <= MAX_LOG_ENTRIES) return entries;
    return entries.slice(-MAX_LOG_ENTRIES);
  }

  /**
   * Safely stringifies the log data, handling potential circular references.
   * @private
   * @param {Array<Object>} data 
   * @returns {string}
   */
  _safeStringify(data) {
    const cache = new WeakSet();
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return '[Circular]';
        cache.add(value);
      }
      return value;
    }, 2);
  }
}

// Export singleton instance
module.exports = new ErrorRegistry();
