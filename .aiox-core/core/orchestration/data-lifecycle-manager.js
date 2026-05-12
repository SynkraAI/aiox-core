/**
 * Data Lifecycle Manager - Cleanup and archival of stale data
 *
 * Story 12.5: Session State Integration with Bob (AC8-11)
 *
 * Provides automated cleanup of:
 * - Session states older than 30 days (archived to .aiox/archive/sessions/)
 * - Snapshots older than 90 days (removed, reference kept in index.json)
 * - Orphan lock files (delegated to LockManager)
 *
 * @module core/orchestration/data-lifecycle-manager
 * @version 1.0.0
 */

'use strict';

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LockManager = require('./lock-manager');

// Constants
const STALE_SESSION_DAYS = 30;
const STALE_SNAPSHOT_DAYS = 90;
const SESSION_STATE_FILENAME = '.session-state.yaml';
const ARCHIVE_DIR = '.aiox/archive/sessions';
const SNAPSHOTS_DIR = '.aiox/snapshots';
const SNAPSHOTS_INDEX = 'index.json';

/**
 * Cleanup result summary
 * @typedef {Object} CleanupResult
 * @property {number} locksRemoved - Number of stale locks removed
 * @property {number} sessionsArchived - Number of sessions archived
 * @property {number} snapshotsRemoved - Number of snapshots removed
 * @property {string[]} errors - Any errors encountered during cleanup
 */

/**
 * DataLifecycleManager - Manages data cleanup and archival
 */
class DataLifecycleManager {
  /**
   * Creates a new DataLifecycleManager instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Manager options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {number} [options.staleSessionDays=30] - Days before session is stale
   * @param {number} [options.staleSnapshotDays=90] - Days before snapshot is stale
   */
  constructor(projectRoot, options = {}) {
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      staleSessionDays: STALE_SESSION_DAYS,
      staleSnapshotDays: STALE_SNAPSHOT_DAYS,
      ...options,
    };

    this.lockManager = new LockManager(projectRoot, { debug: this.options.debug });
    this.archiveDir = path.join(projectRoot, ARCHIVE_DIR);
    this.snapshotsDir = path.join(projectRoot, SNAPSHOTS_DIR);
  }

  /**
   * Runs all startup cleanup operations (AC8-11)
   *
   * @returns {Promise<CleanupResult>} Cleanup result summary
   */
  async runStartupCleanup() {
    const result = {
      locksRemoved: 0,
      sessionsArchived: 0,
      snapshotsRemoved: 0,
      errors: [],
    };

    try {
      // AC9: Cleanup orphan locks (delegate to LockManager)
      result.locksRemoved = await this.cleanupOrphanLocks();
    } catch (error) {
      result.errors.push(`Lock cleanup failed: ${error.message}`);
      this._log(`Lock cleanup error: ${error.message}`);
    }

    try {
      // AC8: Cleanup stale sessions
      result.sessionsArchived = await this.cleanupStaleSessions();
    } catch (error) {
      result.errors.push(`Session cleanup failed: ${error.message}`);
      this._log(`Session cleanup error: ${error.message}`);
    }

    try {
      // AC10: Cleanup stale snapshots
      result.snapshotsRemoved = await this.cleanupStaleSnapshots();
    } catch (error) {
      result.errors.push(`Snapshot cleanup failed: ${error.message}`);
      this._log(`Snapshot cleanup error: ${error.message}`);
    }

    // AC11: Log cleanup summary
    this._logCleanupSummary(result);

    return result;
  }

  /**
   * Cleans up stale session states (AC8)
   *
   * Sessions with last_updated > 30 days are moved to .aiox/archive/sessions/
   *
   * @returns {Promise<number>} Number of sessions archived
   */
  async cleanupStaleSessions() {
    const sessionPath = path.join(this.projectRoot, 'docs/stories', SESSION_STATE_FILENAME);

    // Check if session state exists
    if (!fsSync.existsSync(sessionPath)) {
      this._log('No session state file found');
      return 0;
    }

    try {
      // Load and parse session state
      const content = await fs.readFile(sessionPath, 'utf8');
      let state;
      try {
        state = yaml.load(content);
      } catch (parseError) {
        this._log(`Session state YAML corrupted: ${parseError.message}`);
        return 0;
      }

      if (!state?.session_state?.last_updated) {
        this._log('Session state missing last_updated field');
        return 0;
      }

      // Calculate age in days
      const lastUpdated = new Date(state.session_state.last_updated);
      const now = new Date();
      const ageInDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);

      if (ageInDays <= this.options.staleSessionDays) {
        this._log(`Session state is ${Math.round(ageInDays)} days old (threshold: ${this.options.staleSessionDays})`);
        return 0;
      }

      // Archive the session
      await this._ensureDir(this.archiveDir);

      const timestamp = lastUpdated.toISOString().split('T')[0];
      const archiveName = `session-state-${timestamp}.yaml`;
      const archivePath = path.join(this.archiveDir, archiveName);

      await fs.rename(sessionPath, archivePath);
      this._log(`Archived stale session to: ${archivePath}`);

      return 1;
    } catch (error) {
      this._log(`Failed to cleanup session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleans up stale snapshots (AC10)
   *
   * Snapshots older than 90 days are removed.
   * Reference is kept in index.json for audit trail.
   *
   * @returns {Promise<number>} Number of snapshots removed
   */
  async cleanupStaleSnapshots() {
    // Check if snapshots directory exists
    if (!fsSync.existsSync(this.snapshotsDir)) {
      this._log('No snapshots directory found');
      return 0;
    }

    let removed = 0;
    const removedSnapshots = [];

    try {
      const files = await fs.readdir(this.snapshotsDir);
      const snapshotFiles = files.filter((f) => f.endsWith('.json') && f !== SNAPSHOTS_INDEX);

      const now = new Date();
      const thresholdMs = this.options.staleSnapshotDays * 24 * 60 * 60 * 1000;

      for (const file of snapshotFiles) {
        const filePath = path.join(this.snapshotsDir, file);

        try {
          const stats = await fs.stat(filePath);
          const ageMs = now - stats.mtime;

          if (ageMs > thresholdMs) {
            // Read snapshot metadata before removing
            const content = await fs.readFile(filePath, 'utf8');
            const snapshot = JSON.parse(content);

            // Record removal info
            removedSnapshots.push({
              filename: file,
              removed_at: now.toISOString(),
              original_created: stats.mtime.toISOString(),
              age_days: Math.round(ageMs / (24 * 60 * 60 * 1000)),
              epic_id: snapshot?.epic_id || 'unknown',
              story_id: snapshot?.story_id || 'unknown',
            });

            // Remove the file
            await fs.unlink(filePath);
            removed++;
            this._log(`Removed stale snapshot: ${file}`);
          }
        } catch (error) {
          this._log(`Error processing snapshot ${file}: ${error.message}`);
        }
      }

      // Update index.json with removed snapshots
      if (removedSnapshots.length > 0) {
        await this._updateSnapshotsIndex(removedSnapshots);
      }

      return removed;
    } catch (error) {
      this._log(`Failed to cleanup snapshots: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleans up orphan lock files (AC9)
   *
   * Delegates to LockManager.cleanupStaleLocks() which removes:
   * - Locks with expired TTL
   * - Locks from dead PIDs
   *
   * @returns {Promise<number>} Number of locks removed
   */
  async cleanupOrphanLocks() {
    return this.lockManager.cleanupStaleLocks();
  }

  /**
   * Updates snapshots index.json with removed snapshot references
   * @param {Object[]} removedSnapshots - Array of removed snapshot info
   * @returns {Promise<void>}
   * @private
   */
  async _updateSnapshotsIndex(removedSnapshots) {
    const indexPath = path.join(this.snapshotsDir, SNAPSHOTS_INDEX);

    let index = { removed_snapshots: [] };

    // Load existing index if exists
    if (fsSync.existsSync(indexPath)) {
      try {
        const content = await fs.readFile(indexPath, 'utf8');
        index = JSON.parse(content);
        if (!Array.isArray(index.removed_snapshots)) {
          index.removed_snapshots = [];
        }
      } catch {
        // Start fresh if parse fails
        index = { removed_snapshots: [] };
      }
    }

    // Add newly removed snapshots
    index.removed_snapshots.push(...removedSnapshots);
    index.last_cleanup = new Date().toISOString();

    // Write updated index
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
    this._log(`Updated snapshots index with ${removedSnapshots.length} removed entries`);
  }

  /**
   * Ensures a directory exists
   * @param {string} dirPath - Directory path
   * @returns {Promise<void>}
   * @private
   */
  async _ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Logs cleanup summary (AC11)
   * @param {CleanupResult} result - Cleanup result
   * @private
   */
  _logCleanupSummary(result) {
    const hasCleanup = result.locksRemoved > 0 || result.sessionsArchived > 0 || result.snapshotsRemoved > 0;

    if (hasCleanup || this.options.debug) {
      const message = `🧹 Cleanup: ${result.locksRemoved} locks removidos, ${result.sessionsArchived} sessions arquivadas, ${result.snapshotsRemoved} snapshots removidos`;
      console.log(message);
    }

    if (result.errors.length > 0) {
      console.log(`⚠️ Cleanup errors: ${result.errors.join(', ')}`);
    }
  }

  /**
   * Debug logger
   * @param {string} message - Log message
   * @private
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[DataLifecycleManager] ${message}`);
    }
  }
}

/**
 * Creates a new DataLifecycleManager instance
 * @param {string} projectRoot - Project root directory
 * @param {Object} [options] - Manager options
 * @returns {DataLifecycleManager} DataLifecycleManager instance
 */
function createDataLifecycleManager(projectRoot, options = {}) {
  return new DataLifecycleManager(projectRoot, options);
}

/**
 * Runs startup cleanup for a project
 * @param {string} projectRoot - Project root directory
 * @param {Object} [options] - Manager options
 * @returns {Promise<CleanupResult>} Cleanup result
 */
async function runStartupCleanup(projectRoot, options = {}) {
  const manager = new DataLifecycleManager(projectRoot, options);
  return manager.runStartupCleanup();
}

module.exports = {
  DataLifecycleManager,
  createDataLifecycleManager,
  runStartupCleanup,
  STALE_SESSION_DAYS,
  STALE_SNAPSHOT_DAYS,
};
