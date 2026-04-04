/**
 * @file error-registry.js
 * @description Central error registration and persistence module for Synkra AIOX.
 * Part of Principle VII: Error Governance.
 */

const fs = require('fs');
const path = require('path');
const AIOXError = require('../utils/aiox-error');

/**
 * Manages the persistence and classification of errors across the framework.
 */
class ErrorRegistry {
  constructor() {
    this.logDir = path.join(process.cwd(), '.aiox', 'logs');
    this.logFile = path.join(this.logDir, 'errors.json');
    this._initialized = false;
  }

  /**
   * Initializes the log directory and file.
   * @private
   */
  _init() {
    if (this._initialized) return;

    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      if (!fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, JSON.stringify([], null, 2), 'utf8');
      }
      this._initialized = true;
    } catch (err) {
      // Inception error: Cannot log the failure of the logger to the logger
      console.error('[ErrorRegistry] Failed to initialize logs:', err.message);
    }
  }

  /**
   * Registers an error into the persistent log.
   * 
   * @param {Error|AIOXError|string} error - The error object or message to log.
   * @param {Object} [options={}] - Additional context and log options.
   * @returns {AIOXError} The normalized AIOXError that was logged.
   */
  async log(error, options = {}) {
    this._init();

    // Normalize error to AIOXError
    let aioxError;
    if (error instanceof AIOXError) {
      aioxError = error;
      // Merge additional options if provided
      Object.assign(aioxError, options);
    } else if (error instanceof Error) {
      aioxError = new AIOXError(error.message, {
        category: 'SYSTEM',
        ...options,
        metadata: { ...options.metadata, originalStack: error.stack }
      });
    } else {
      aioxError = new AIOXError(String(error), {
        category: 'OPERATIONAL',
        ...options
      });
    }

    // Output to console (stderr) for immediate feedback
    // Defaults to true unless 'silent' is true or 'display' is explicitly false
    const shouldDisplay = options.display !== false && !aioxError.silent;
    
    if (shouldDisplay) {
      if (options.raw) {
        console.error(aioxError.message);
      } else {
        const icon = aioxError.category === 'SYSTEM' ? '🔴' : '🟡';
        const agentSuffix = aioxError.agentId ? ` (${aioxError.agentId})` : '';
        console.error(`${icon} [${aioxError.category}] ${aioxError.message}${agentSuffix}`);
      }
    }

    await this._persist(aioxError);
    return aioxError;
  }

  /**
   * Persists the error to the JSON log file.
   * @private
   * @param {AIOXError} aioxError 
   */
  async _persist(aioxError) {
    const lockfile = require('proper-lockfile');
    let release;

    try {
      // 1. Acquire lock to prevent concurrent overwrites
      release = await lockfile.lock(this.logFile, { retries: 5 });

      const data = fs.readFileSync(this.logFile, 'utf8');
      let logs = [];
      
      try {
        logs = JSON.parse(data);
      } catch (parseErr) {
        // 2. SELF-HEALING: If file is corrupted, backup and reset
        const backupFile = `${this.logFile}.${Date.now()}.bak`;
        fs.writeFileSync(backupFile, data, 'utf8');
        console.error(`[ErrorRegistry] Log corruption detected! Recovery: Backup created at ${backupFile}`);
        logs = []; 
      }
      
      logs.push(aioxError.toJSON());

      // Limit log size to last 500 entries to prevent bloating
      const limitedLogs = logs.slice(-500);

      // 3. SAFE SERIALIZATION: Handle circular references in metadata
      const cache = new WeakSet();
      const safeJson = JSON.stringify(limitedLogs, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) return '[Circular]';
          cache.add(value);
        }
        return value;
      }, 2);

      fs.writeFileSync(this.logFile, safeJson, 'utf8');
    } catch (err) {
      console.error('[ErrorRegistry] Persistence failure:', err.message);
    } finally {
      if (release) await release();
    }
  }

  /**
   * Retrieves the last N errors from the log.
   * @param {number} [count=10]
   * @returns {Array<Object>}
   */
  getRecentErrors(count = 10) {
    this._init();
    try {
      const data = fs.readFileSync(this.logFile, 'utf8');
      const logs = JSON.parse(data);
      return logs.slice(-count);
    } catch (err) {
      return [];
    }
  }
}

// Export singleton instance
module.exports = new ErrorRegistry();
