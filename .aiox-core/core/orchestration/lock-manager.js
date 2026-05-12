/**
 * Lock Manager - File-based locking with formal schema
 *
 * Story 12.3: Bob Orchestration Logic - File Locking (AC14-17)
 *
 * Provides file-based locking to prevent race conditions in
 * multi-terminal Bob orchestration. Lock files use a formal
 * schema with PID, TTL, and owner tracking.
 *
 * Lock file schema (YAML):
 *   pid: <process PID>
 *   owner: <module identifier>
 *   created_at: <ISO timestamp>
 *   ttl_seconds: <auto-expire time>
 *   resource: <protected resource name>
 *
 * @module core/orchestration/lock-manager
 * @version 1.0.0
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Constants
const DEFAULT_TTL_SECONDS = 300; // 5 minutes
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 3;
const LOCKS_DIR = '.aiox/locks';

/**
 * LockManager - File-based locking with PID/TTL management
 */
class LockManager {
  /**
   * Creates a new LockManager instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Manager options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {number} [options.ttlSeconds=300] - Default TTL in seconds
   * @param {string} [options.owner='bob-orchestrator'] - Lock owner identifier
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ttlSeconds: DEFAULT_TTL_SECONDS,
      owner: 'bob-orchestrator',
      ...options,
    };

    this.locksDir = path.join(projectRoot, LOCKS_DIR);
  }

  /**
   * Ensures the locks directory exists
   * @returns {Promise<void>}
   * @private
   */
  async _ensureLocksDir() {
    await fs.mkdir(this.locksDir, { recursive: true });
  }

  /**
   * Gets the lock file path for a resource
   * @param {string} resource - Resource name
   * @returns {string} Lock file path
   * @private
   */
  _getLockPath(resource) {
    // Sanitize resource name for filesystem safety
    const safeName = resource.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.locksDir, `${safeName}.lock`);
  }

  /**
   * Acquires a lock on a resource (AC14)
   *
   * If the lock is held by another process, retries up to MAX_RETRIES
   * times with RETRY_DELAY_MS between attempts (AC4.7).
   *
   * @param {string} resource - Resource to lock
   * @param {Object} [options] - Lock options
   * @param {number} [options.ttlSeconds] - TTL override
   * @param {string} [options.owner] - Owner override
   * @returns {Promise<boolean>} True if lock acquired
   */
  async acquireLock(resource, options = {}) {
    await this._ensureLocksDir();

    const lockPath = this._getLockPath(resource);
    const ttl = options.ttlSeconds || this.options.ttlSeconds;
    const owner = options.owner || this.options.owner;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      // Check if lock already exists
      const existingLock = await this._readLock(lockPath);

      if (existingLock) {
        // Check if lock is stale (TTL expired or PID dead)
        if (this._isLockStale(existingLock)) {
          this._log(`Removing stale lock for ${resource} (attempt ${attempt})`);
          await this._removeLock(lockPath);
        } else {
          // Lock is active — retry after delay (AC4.7)
          this._log(`Lock active for ${resource}, retrying in ${RETRY_DELAY_MS}ms (attempt ${attempt}/${MAX_RETRIES})`);

          if (attempt < MAX_RETRIES) {
            await this._sleep(RETRY_DELAY_MS);
            continue;
          }

          this._log(`Failed to acquire lock for ${resource} after ${MAX_RETRIES} attempts`);
          return false;
        }
      }

      // Create lock file (AC14 — formal schema)
      const lockData = {
        pid: process.pid,
        owner,
        created_at: new Date().toISOString(),
        ttl_seconds: ttl,
        resource,
      };

      try {
        await fs.writeFile(lockPath, yaml.dump(lockData), { flag: 'wx' });
        this._log(`Lock acquired for ${resource}`);
        return true;
      } catch (error) {
        // EEXIST means another process created the file between our check and write
        if (error.code === 'EEXIST') {
          this._log(`Race condition on lock for ${resource}, retrying`);
          if (attempt < MAX_RETRIES) {
            await this._sleep(RETRY_DELAY_MS);
            continue;
          }
          return false;
        }
        throw error;
      }
    }

    return false;
  }

  /**
   * Releases a lock on a resource
   *
   * @param {string} resource - Resource to unlock
   * @returns {Promise<boolean>} True if lock was released
   */
  async releaseLock(resource) {
    const lockPath = this._getLockPath(resource);

    const existingLock = await this._readLock(lockPath);
    if (!existingLock) {
      return false; // No lock to release
    }

    // Only release if we own the lock
    if (existingLock.pid !== process.pid) {
      this._log(`Cannot release lock for ${resource} — owned by PID ${existingLock.pid}`);
      return false;
    }

    await this._removeLock(lockPath);
    this._log(`Lock released for ${resource}`);
    return true;
  }

  /**
   * Checks if a resource is currently locked
   *
   * @param {string} resource - Resource to check
   * @returns {Promise<boolean>} True if resource is locked (non-stale)
   */
  async isLocked(resource) {
    const lockPath = this._getLockPath(resource);
    const lock = await this._readLock(lockPath);

    if (!lock) return false;
    if (this._isLockStale(lock)) return false;

    return true;
  }

  /**
   * Cleans up stale locks on startup (AC16, AC17)
   *
   * Iterates all *.lock files and removes those with:
   * - Expired TTL (AC16)
   * - Dead PID (AC17)
   *
   * @returns {Promise<number>} Number of stale locks removed
   */
  async cleanupStaleLocks() {
    await this._ensureLocksDir();

    let cleaned = 0;

    try {
      const files = await fs.readdir(this.locksDir);
      const lockFiles = files.filter((f) => f.endsWith('.lock'));

      for (const file of lockFiles) {
        const lockPath = path.join(this.locksDir, file);
        const lock = await this._readLock(lockPath);

        if (lock && this._isLockStale(lock)) {
          await this._removeLock(lockPath);
          cleaned++;
          this._log(`Cleaned stale lock: ${file} (PID: ${lock.pid})`);
        }
      }
    } catch (error) {
      this._log(`Error during lock cleanup: ${error.message}`);
    }

    if (cleaned > 0) {
      this._log(`Cleaned ${cleaned} stale lock(s)`);
    }

    return cleaned;
  }

  /**
   * Reads and parses a lock file
   * @param {string} lockPath - Path to lock file
   * @returns {Promise<Object|null>} Lock data or null
   * @private
   */
  async _readLock(lockPath) {
    try {
      const content = await fs.readFile(lockPath, 'utf8');
      return yaml.load(content);
    } catch {
      return null;
    }
  }

  /**
   * Checks if a lock is stale (TTL expired or PID dead)
   * @param {Object} lock - Lock data
   * @returns {boolean} True if lock is stale
   * @private
   */
  _isLockStale(lock) {
    if (!lock) return true;

    // Check TTL expiration (AC16)
    const createdAt = new Date(lock.created_at);
    const ttlMs = (lock.ttl_seconds || DEFAULT_TTL_SECONDS) * 1000;
    const now = Date.now();

    if (now - createdAt.getTime() > ttlMs) {
      return true;
    }

    // Check if PID is still alive (AC17)
    if (!this._isPidAlive(lock.pid)) {
      return true;
    }

    return false;
  }

  /**
   * Checks if a process with given PID is still running (AC17)
   *
   * Uses process.kill(pid, 0) which doesn't actually kill the process,
   * just checks if it exists.
   *
   * @param {number} pid - Process ID to check
   * @returns {boolean} True if process is alive
   * @private
   */
  _isPidAlive(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes a lock file
   * @param {string} lockPath - Path to lock file
   * @returns {Promise<void>}
   * @private
   */
  async _removeLock(lockPath) {
    try {
      await fs.unlink(lockPath);
    } catch {
      // Ignore if already removed
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @private
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Debug logger
   * @param {string} message - Log message
   * @private
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[LockManager] ${message}`);
    }
  }
}

module.exports = LockManager;
