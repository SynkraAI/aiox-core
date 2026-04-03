/**
 * @module lock-manager
 * @description File-based lock with TTL to prevent duplicate scheduler instances.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} LockOptions
 * @property {string} [lockFile] - Path to lock file
 * @property {number} [ttlMs=3600000] - Lock TTL in ms (default 1 hour)
 * @property {number} [staleCheckMs=300000] - Stale check interval (5 min)
 */

export class LockManager {
  /**
   * @param {LockOptions} [options={}]
   */
  constructor(options = {}) {
    this.lockFile = options.lockFile ??
      path.resolve(__dirname, '../../hydra-data/state/scheduler.lock');
    this.ttlMs = options.ttlMs ?? 3600000;
    this.staleCheckMs = options.staleCheckMs ?? 300000;
  }

  /**
   * Acquire the lock. Returns true if lock was acquired.
   * If an existing lock is stale (TTL expired), it is removed first.
   * @returns {boolean}
   */
  acquire() {
    // Check for stale lock
    if (this._isStale()) {
      this.release();
    }

    const dir = path.dirname(this.lockFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.writeFileSync(this.lockFile, JSON.stringify({
        pid: process.pid,
        acquiredAt: new Date().toISOString(),
        ttlMs: this.ttlMs,
      }), { flag: 'wx' }); // Exclusive create — fails if file exists
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') {
        return false; // Lock already held
      }
      throw err;
    }
  }

  /**
   * Release the lock.
   */
  release() {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile);
      }
    } catch {
      // Best effort
    }
  }

  /**
   * Check if a lock is currently held.
   * @returns {boolean}
   */
  isLocked() {
    if (!fs.existsSync(this.lockFile)) return false;
    if (this._isStale()) {
      this.release();
      return false;
    }
    return true;
  }

  /**
   * Get lock info if locked.
   * @returns {Object|null}
   */
  getLockInfo() {
    try {
      if (!fs.existsSync(this.lockFile)) return null;
      return JSON.parse(fs.readFileSync(this.lockFile, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Refresh the lock timestamp (heartbeat).
   */
  refresh() {
    try {
      if (fs.existsSync(this.lockFile)) {
        const data = JSON.parse(fs.readFileSync(this.lockFile, 'utf-8'));
        data.acquiredAt = new Date().toISOString();
        fs.writeFileSync(this.lockFile, JSON.stringify(data), 'utf-8');
      }
    } catch {
      // Best effort
    }
  }

  /** @private */
  _isStale() {
    try {
      if (!fs.existsSync(this.lockFile)) return false;
      const data = JSON.parse(fs.readFileSync(this.lockFile, 'utf-8'));
      const acquiredAt = new Date(data.acquiredAt).getTime();
      const ttl = data.ttlMs || this.ttlMs;
      return Date.now() - acquiredAt > ttl;
    } catch {
      return true; // Corrupted lock file is stale
    }
  }
}
