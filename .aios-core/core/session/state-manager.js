/**
 * SessionStateManager
 *
 * Manages persistent session state for multi-tab context tracking.
 * Provides CRUD operations, file locking, caching, and event emission.
 *
 * Architecture:
 * - File-based state (.aios/session.json) for persistence
 * - In-memory cache (5s TTL) for fast reads
 * - File locking (wx flag) to prevent race conditions
 * - Event emission for real-time updates
 * - PID-based garbage collection for stale sessions
 *
 * Performance targets:
 * - Cached reads: <5ms
 * - Uncached reads: <20ms
 * - Zero overhead in non-AIOS projects
 *
 * @module session/state-manager
 */

const fs = require('fs');
const fsSync = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Session schema version
const SESSION_SCHEMA_VERSION = '1.0.0';

// Cache TTL in milliseconds (5 seconds)
const CACHE_TTL_MS = 5000;

// Default session state
const DEFAULT_SESSION = {
  version: SESSION_SCHEMA_VERSION,
  pid: process.pid,
  sessionId: null,
  project: {
    type: 'unknown',
    name: '',
    emoji: '📦',
  },
  status: {
    phase: '',
    progress: null,
    currentTask: '',
    emoji: '',
  },
  metadata: {
    startedAt: null,
    lastUpdatedAt: null,
    activeAgent: null,
    story: null,
  },
};

/**
 * SessionStateManager class
 * Singleton pattern for session state management
 */
class SessionStateManager extends EventEmitter {
  constructor(basePath = null) {
    super();
    this.basePath = basePath || process.cwd();
    this.sessionPath = path.join(this.basePath, '.aios', 'session.json');
    this.historyDir = path.join(this.basePath, '.aios', 'sessions', 'history');
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheFileMtimeMs = null;
  }

  /**
   * Initialize session file if it doesn't exist
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Check if .aios directory exists
      const aiosDir = path.join(this.basePath, '.aios');
      if (!fs.existsSync(aiosDir)) {
        // Not an AIOS project, fail fast
        return;
      }

      // Ensure .aios directory exists
      await fs.promises.mkdir(aiosDir, { recursive: true });

      // Create session file if it doesn't exist
      if (!fs.existsSync(this.sessionPath)) {
        await this._writeSession(this._createDefaultSession());
      }
    } catch (error) {
      // Fail silently if not an AIOS project
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Create default session with current timestamp
   * @returns {Object} Default session object
   * @private
   */
  _createDefaultSession() {
    const now = new Date().toISOString();
    return {
      ...DEFAULT_SESSION,
      sessionId: this._generateSessionId(),
      pid: process.pid,
      metadata: {
        ...DEFAULT_SESSION.metadata,
        startedAt: now,
        lastUpdatedAt: now,
      },
    };
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   * @private
   */
  _generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Read session from file with caching
   * @returns {Promise<Object>} Session state
   */
  async read() {
    const now = Date.now();

    // Return cached value if still valid (TTL not expired) and file unchanged
    if (this.cache && this.cacheTimestamp && (now - this.cacheTimestamp < CACHE_TTL_MS)) {
      try {
        const stats = fsSync.statSync(this.sessionPath);
        if (this.cacheFileMtimeMs !== null && stats.mtimeMs === this.cacheFileMtimeMs) {
          return { ...this.cache }; // Return copy to prevent mutations
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    // Read from file
    try {
      const data = await fs.promises.readFile(this.sessionPath, 'utf8');
      const session = JSON.parse(data);
      const stats = await fs.promises.stat(this.sessionPath);

      // Update cache
      this.cache = session;
      this.cacheTimestamp = now;
      this.cacheFileMtimeMs = stats.mtimeMs;

      return { ...session }; // Return copy
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Session file doesn't exist, create it
        const defaultSession = this._createDefaultSession();
        await this._writeSession(defaultSession);
        this.cache = defaultSession;
        this.cacheTimestamp = now;
        const stats = await fs.promises.stat(this.sessionPath);
        this.cacheFileMtimeMs = stats.mtimeMs;
        return { ...defaultSession };
      }
      throw error;
    }
  }

  /**
   * Update session state
   * @param {Object} updates - Partial session updates
   * @returns {Promise<Object>} Updated session state
   */
  async update(updates) {
    // Read current session
    const current = await this.read();

    // Merge updates (deep merge for nested objects)
    const updated = {
      ...current,
      ...updates,
      project: { ...current.project, ...(updates.project || {}) },
      status: { ...current.status, ...(updates.status || {}) },
      metadata: {
        ...current.metadata,
        ...(updates.metadata || {}),
        lastUpdatedAt: new Date().toISOString(),
      },
      pid: process.pid,
    };

    // Write to file
    await this._writeSession(updated);

    // Invalidate cache
    this.cache = updated;
    this.cacheTimestamp = Date.now();

    // Emit event
    this.emit('session:updated', updated);

    return { ...updated }; // Return copy
  }

  /**
   * Clear session (reset to defaults)
   * @returns {Promise<Object>} Default session state
   */
  async clear() {
    // Archive current session before clearing
    await this.archive();

    // Create new default session
    const defaultSession = this._createDefaultSession();
    await this._writeSession(defaultSession);

    // Invalidate cache
    this.cache = defaultSession;
    this.cacheTimestamp = Date.now();

    // Emit event
    this.emit('session:cleared', defaultSession);

    return { ...defaultSession };
  }

  /**
   * Archive current session to history
   * @returns {Promise<void>}
   */
  async archive() {
    try {
      // Read current session
      const session = await this.read();

      // Only archive if session has meaningful data (not just initialized)
      if (!session.sessionId || !session.project.name) {
        return;
      }

      // Ensure history directory exists
      await fs.promises.mkdir(this.historyDir, { recursive: true });

      // Create archive filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveFilename = `session-${timestamp}.json`;
      const archivePath = path.join(this.historyDir, archiveFilename);

      // Write archive
      await fs.promises.writeFile(
        archivePath,
        JSON.stringify(session, null, 2),
        'utf8',
      );

      // Emit event
      this.emit('session:archived', { session, archivePath });
    } catch (error) {
      // Fail silently if archiving fails (non-critical)
      console.warn('Failed to archive session:', error.message);
    }
  }

  /**
   * Garbage collection: cleanup stale sessions and old archives
   * @param {number} maxAgeDays - Maximum age in days for archives (default: 30)
   * @returns {Promise<Object>} Cleanup results
   */
  async gc(maxAgeDays = 30) {
    const results = {
      staleSessionsRemoved: 0,
      archivedSessionsRemoved: 0,
    };

    try {
      // Check if current session PID is still alive
      const session = await this.read();
      if (session.pid && session.pid !== process.pid) {
        let isStale = false;
        try {
          // Check if process exists (throws if not)
          process.kill(session.pid, 0);
        } catch (error) {
          // Process doesn't exist, session is stale
          isStale = true;
        }

        if (isStale) {
          await this.clear();
          results.staleSessionsRemoved = 1;
        }
      }

      // Cleanup old archives
      if (fs.existsSync(this.historyDir)) {
        const files = await fs.promises.readdir(this.historyDir);
        const now = Date.now();
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

        for (const file of files) {
          const filePath = path.join(this.historyDir, file);
          const stats = await fs.promises.stat(filePath);

          if (now - stats.mtimeMs > maxAgeMs) {
            await fs.promises.unlink(filePath);
            results.archivedSessionsRemoved++;
          }
        }
      }

      // Emit event
      this.emit('session:gc', results);

      return results;
    } catch (error) {
      console.warn('Garbage collection failed:', error.message);
      return results;
    }
  }

  /**
   * Write session to file with atomic write (using rename)
   * @param {Object} session - Session state
   * @returns {Promise<void>}
   * @private
   */
  async _writeSession(session) {
    const tempPath = `${this.sessionPath}.tmp.${process.pid}.${Date.now()}`;

    try {
      // Write to temp file first
      await fs.promises.writeFile(
        tempPath,
        JSON.stringify(session, null, 2),
        'utf8',
      );

      // Atomic rename (on POSIX systems)
      try {
        await fs.promises.rename(tempPath, this.sessionPath);
      } catch (error) {
        // Fallback for Windows or race condition
        if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'ENOENT') {
          // Target might not exist yet, or got deleted by another process
          // Try direct write as fallback
          await fs.promises.writeFile(
            this.sessionPath,
            JSON.stringify(session, null, 2),
            'utf8',
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      // Cleanup temp file if write failed
      try {
        if (fs.existsSync(tempPath)) {
          await fs.promises.unlink(tempPath);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error;
    } finally {
      // Cleanup temp file if it still exists
      try {
        if (fs.existsSync(tempPath)) {
          await fs.promises.unlink(tempPath);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    try {
      const stats = await fs.promises.stat(this.sessionPath);
      this.cacheFileMtimeMs = stats.mtimeMs;
    } catch {
      // Ignore stat failures (non-fatal for write path)
    }
  }

  /**
   * Check if current project is AIOS-enabled
   * @returns {boolean} True if AIOS project
   */
  isAiosProject() {
    const aiosDir = path.join(this.basePath, '.aios');
    return fs.existsSync(aiosDir);
  }
}

// Export singleton instance
const instance = new SessionStateManager();

module.exports = instance;
module.exports.SessionStateManager = SessionStateManager;
