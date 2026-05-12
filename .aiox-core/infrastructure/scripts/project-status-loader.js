const execa = require('execa');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const WorktreeManager = require('./worktree-manager');

/**
 * ProjectStatusLoader - Dynamic project status for agent activation context
 *
 * Story 6.1.2.4: Captures git state, recent work, and current story/epic
 * for display in agent greetings across all 11 AIOX agents.
 *
 * Story ACT-3: Reliability overhaul
 * - Event-driven cache invalidation via git state change detection
 * - Multi-terminal safe file locking for cache writes
 * - Worktree-aware cache paths
 * - Performance optimized (<100ms cached, <500ms regeneration)
 *
 * Features:
 * - Git integration (branch, status, recent commits)
 * - Current story/epic detection from docs/stories/
 * - Smart cache invalidation via .git/HEAD and .git/index mtime
 * - Multi-terminal lock file protection
 * - Worktree-aware cache paths
 * - Cross-platform support (Windows/Linux/macOS)
 * - Graceful fallback for non-git projects
 */

/**
 * Default lock timeout in milliseconds.
 * If a lock cannot be acquired within this time, skip locking and proceed.
 * @type {number}
 */
const LOCK_TIMEOUT_MS = 3000;

/**
 * Lock file stale threshold in milliseconds.
 * If a lock file is older than this, it is considered stale and will be removed.
 * @type {number}
 */
const LOCK_STALE_MS = 10000;

/**
 * Active-session cache TTL in seconds.
 * Used when git state has NOT changed since last cache write.
 * @type {number}
 */
const ACTIVE_SESSION_TTL = 15;

/**
 * Idle cache TTL in seconds.
 * Used as the maximum TTL fallback even if git state check fails.
 * @type {number}
 */
const IDLE_TTL = 60;

class ProjectStatusLoader {
  constructor(rootPath = null) {
    this.rootPath = rootPath || process.cwd();

    // Load config values (QA Fix: Issue 6.1.2.4-I1)
    this.config = this.loadConfig();
    this.maxModifiedFiles = this.config?.projectStatus?.maxModifiedFiles || 5;
    this.maxRecentCommits = this.config?.projectStatus?.maxRecentCommits || 2;

    // ACT-11: Cache git dir from constructor to avoid duplicate execSync calls
    this._resolvedGitDir = null;
    this._isGitRepo = false;

    // ACT-3: Determine cache file path (worktree-aware)
    // ACT-11: _resolveCacheFilePath now also caches _resolvedGitDir and _isGitRepo
    this.cacheFile = this._resolveCacheFilePath();
    this.lockFile = this.cacheFile + '.lock';

    // ACT-3: Smart TTLs - active session vs idle
    this.activeSessionTTL = ACTIVE_SESSION_TTL;
    this.idleTTL = IDLE_TTL;
    // Keep cacheTTL for backward compat (used in isCacheValid as fallback)
    this.cacheTTL = IDLE_TTL;

    // ACT-3: Track git state fingerprint for change detection
    this._lastGitFingerprint = null;

    // ACT-11: Support skipGitStatus config for slow environments
    this.skipGitStatus = this.config?.projectStatus?.skipGitStatus || false;
  }

  /**
   * Load configuration from core-config.yaml
   *
   * @returns {Object|null} Config object or null if not found
   */
  loadConfig() {
    try {
      const configPath = path.join(this.rootPath, '.aiox-core', 'core-config.yaml');
      const configContent = fsSync.readFileSync(configPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      // Config not found - use defaults
      return null;
    }
  }

  /**
   * ACT-3 Task 4: Resolve cache file path with worktree awareness.
   *
   * ACT-11: Caches _resolvedGitDir and _isGitRepo for reuse by
   * getGitStateFingerprint() and isGitRepository(), eliminating
   * duplicate execSync calls later in the pipeline.
   *
   * If running inside a git worktree (not the main working tree),
   * uses a worktree-specific cache file to prevent cross-worktree conflicts.
   *
   * @returns {string} Resolved cache file path
   * @private
   */
  _resolveCacheFilePath() {
    try {
      const { execSync } = require('child_process');

      // Get the git directory for the current worktree
      const gitDir = execSync('git rev-parse --git-dir', {
        cwd: this.rootPath,
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      // Get the common git directory (shared across worktrees)
      const gitCommonDir = execSync('git rev-parse --git-common-dir', {
        cwd: this.rootPath,
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      // ACT-11: Cache the resolved git dir for getGitStateFingerprint()
      const normalizedGitDir = path.resolve(this.rootPath, gitDir);
      this._resolvedGitDir = normalizedGitDir;
      this._isGitRepo = true;

      // Normalize paths for comparison
      const normalizedCommonDir = path.resolve(this.rootPath, gitCommonDir);

      // If git-dir !== git-common-dir, we are in a worktree
      if (normalizedGitDir !== normalizedCommonDir) {
        // Create a short hash from the worktree path for a unique cache filename
        const worktreeHash = this._hashString(this.rootPath).substring(0, 8);
        return path.join(this.rootPath, '.aiox', `project-status-${worktreeHash}.yaml`);
      }
    } catch (error) {
      // Not a git repo or git not available - use default path
    }

    return path.join(this.rootPath, '.aiox', 'project-status.yaml');
  }

  /**
   * Simple string hash for creating unique cache file names.
   *
   * @param {string} str - String to hash
   * @returns {string} Hex hash string
   * @private
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * ACT-3 Task 1: Get git state fingerprint from .git/HEAD and .git/index mtime.
   *
   * ACT-11: Reuses _resolvedGitDir from constructor instead of running execSync again.
   * This eliminates one synchronous git command (~30-50ms on Windows).
   *
   * @returns {Promise<string|null>} Fingerprint string or null if not available
   */
  async getGitStateFingerprint() {
    try {
      // ACT-11: Reuse cached git dir from constructor
      let resolvedGitDir = this._resolvedGitDir;

      if (!resolvedGitDir) {
        // Fallback if constructor didn't resolve (shouldn't happen in normal flow)
        const { execSync } = require('child_process');
        const gitDir = execSync('git rev-parse --git-dir', {
          cwd: this.rootPath,
          encoding: 'utf8',
          timeout: 2000,
          stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();
        resolvedGitDir = path.resolve(this.rootPath, gitDir);
      }

      const headPath = path.join(resolvedGitDir, 'HEAD');
      const indexPath = path.join(resolvedGitDir, 'index');

      const mtimes = await Promise.all([
        fs.stat(headPath).then(s => s.mtimeMs).catch(() => 0),
        fs.stat(indexPath).then(s => s.mtimeMs).catch(() => 0),
      ]);

      return `${mtimes[0]}:${mtimes[1]}`;
    } catch (error) {
      return null;
    }
  }

  /**
   * Load project status with smart caching
   *
   * ACT-3: Uses event-driven cache invalidation instead of fixed 60s TTL.
   * Cache is invalidated when git state (HEAD or index) changes.
   *
   * @returns {Promise<ProjectStatus>} Current project status
   */
  async loadProjectStatus() {
    try {
      // ACT-3: Get current git state fingerprint
      const currentFingerprint = await this.getGitStateFingerprint();

      // Try to load from cache first
      const cached = await this.loadCache();

      if (cached && this.isCacheValid(cached, currentFingerprint)) {
        return cached.status;
      }

      // Cache miss or expired - generate fresh status
      const status = await this.generateStatus();

      // Save to cache with lock protection
      await this.saveCacheWithLock(status, currentFingerprint);

      return status;
    } catch (error) {
      console.warn('Project status loading failed, using defaults:', error.message);
      return this.getDefaultStatus();
    }
  }

  /**
   * Generate fresh project status
   *
   * ACT-3 Task 5: All git commands run in parallel via Promise.all()
   * ACT-11: Supports skipGitStatus config to skip expensive git status command
   *
   * @returns {Promise<ProjectStatus>}
   */
  async generateStatus() {
    const isGit = await this.isGitRepository();

    if (!isGit) {
      return this.getNonGitStatus();
    }

    // ACT-11: When skipGitStatus is enabled, skip the expensive getModifiedFiles()
    const modifiedFilesPromise = this.skipGitStatus
      ? Promise.resolve({ files: [], totalCount: 0 })
      : this.getModifiedFiles();

    const [branch, modifiedFilesResult, recentCommits, storyInfo, worktrees] = await Promise.all([
      this.getGitBranch(),
      modifiedFilesPromise,
      this.getRecentCommits(),
      this.getCurrentStoryInfo(),
      this.getWorktreesStatus(),
    ]);

    const status = {
      branch,
      modifiedFiles: modifiedFilesResult.files,
      modifiedFilesTotalCount: modifiedFilesResult.totalCount,
      recentCommits,
      currentEpic: storyInfo.epic || null,
      currentStory: storyInfo.story || null,
      lastUpdate: new Date().toISOString(),
      isGitRepo: true,
    };

    // Story 1.5: Include worktrees section if any exist
    if (worktrees) {
      status.worktrees = worktrees;
    }

    return status;
  }

  /**
   * Check if current directory is a git repository
   *
   * @returns {Promise<boolean>}
   */
  async isGitRepository() {
    try {
      await execa('git', ['rev-parse', '--is-inside-work-tree'], {
        cwd: this.rootPath,
        stderr: 'ignore',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current git branch name
   *
   * @returns {Promise<string>}
   */
  async getGitBranch() {
    try {
      // Try modern git command first (git >= 2.22)
      const { stdout } = await execa('git', ['branch', '--show-current'], {
        cwd: this.rootPath,
      });
      return stdout.trim();
    } catch (error) {
      // Fallback for older git versions
      try {
        const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
          cwd: this.rootPath,
        });
        return stdout.trim();
      } catch (fallbackError) {
        return 'unknown';
      }
    }
  }

  /**
   * Get modified files from git status
   *
   * @returns {Promise<{files: string[], totalCount: number}>}
   */
  async getModifiedFiles() {
    try {
      const { stdout } = await execa('git', ['status', '--porcelain'], {
        cwd: this.rootPath,
      });

      if (!stdout) return { files: [], totalCount: 0 };

      // Parse porcelain output
      const allFiles = stdout
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          // Remove status prefix (e.g., " M ", "A  ", "?? ")
          return line.substring(3).trim();
        });

      const totalCount = allFiles.length;
      const files = allFiles.slice(0, this.maxModifiedFiles); // Use config value

      return { files, totalCount };
    } catch (error) {
      return { files: [], totalCount: 0 };
    }
  }

  /**
   * Get recent commits
   *
   * @returns {Promise<string[]>}
   */
  async getRecentCommits() {
    try {
      const { stdout } = await execa(
        'git',
        ['log', `-${this.maxRecentCommits}`, '--oneline', '--no-decorate'],
        {
          cwd: this.rootPath,
        }
      );

      if (!stdout) return [];

      // Parse commit lines (remove hash, keep message)
      const commits = stdout
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          // Remove commit hash (first 7-8 characters)
          return line.substring(8).trim();
        });

      return commits;
    } catch (error) {
      // No commits yet or error
      return [];
    }
  }

  /**
   * Get worktrees status using WorktreeManager
   *
   * Story 1.5: Worktree Status Integration
   *
   * @returns {Promise<Object>} Worktrees status object
   */
  async getWorktreesStatus() {
    try {
      const worktreeManager = new WorktreeManager(this.rootPath);
      const worktrees = await worktreeManager.list();

      if (worktrees.length === 0) {
        return null;
      }

      const worktreesStatus = {};

      for (const wt of worktrees) {
        worktreesStatus[wt.storyId] = {
          path: wt.path,
          branch: wt.branch,
          createdAt: wt.createdAt instanceof Date ? wt.createdAt.toISOString() : wt.createdAt,
          lastActivity: new Date().toISOString(), // Updated on status check
          uncommittedChanges: wt.uncommittedChanges,
          status: wt.status,
        };
      }

      return worktreesStatus;
    } catch (error) {
      // WorktreeManager failed - likely not a git repo or git not available
      return null;
    }
  }

  /**
   * Detect current story and epic from docs/stories/
   *
   * Scans for Status: InProgress or Status: In Progress
   *
   * @returns {Promise<{story: string|null, epic: string|null}>}
   */
  async getCurrentStoryInfo() {
    try {
      const storiesDir = path.join(this.rootPath, 'docs', 'stories');

      // Check if stories directory exists
      try {
        await fs.access(storiesDir);
      } catch {
        return { story: null, epic: null };
      }

      // Read all markdown files recursively
      const storyFiles = await this.findMarkdownFiles(storiesDir);

      for (const file of storyFiles) {
        const content = await fs.readFile(file, 'utf8');

        // Check for InProgress status
        const statusMatch = content.match(
          /\*\*Status:\*\*\s*(InProgress|In Progress|🔄\s*InProgress|🔄\s*In Progress)/i
        );

        if (statusMatch) {
          // Extract story ID and epic
          const storyIdMatch = content.match(/\*\*Story ID:\*\*\s*([A-Z]+-[\d.]+)/);
          const epicMatch = content.match(/\*\*Epic:\*\*\s*([^\n]+)/);

          return {
            story: storyIdMatch ? storyIdMatch[1] : path.basename(file, '.md'),
            epic: epicMatch ? epicMatch[1].trim() : null,
          };
        }
      }

      return { story: null, epic: null };
    } catch (error) {
      return { story: null, epic: null };
    }
  }

  /**
   * Find all markdown files in directory recursively
   *
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>}
   */
  async findMarkdownFiles(dir) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors (permission denied, etc.)
    }

    return files;
  }

  /**
   * Load status from cache file
   *
   * ACT-3 Task 2: Added corrupted cache recovery.
   * If the YAML is invalid, delete the file and return null.
   *
   * @returns {Promise<{status: ProjectStatus, timestamp: number, ttl: number, gitFingerprint: string|null}|null>}
   */
  async loadCache() {
    try {
      const content = await fs.readFile(this.cacheFile, 'utf8');
      const parsed = yaml.load(content);

      // ACT-3: Validate cache structure (corrupted cache recovery)
      if (!parsed || typeof parsed !== 'object' || !parsed.status) {
        // Cache is corrupted - delete and regenerate
        await this.clearCache();
        return null;
      }

      return parsed;
    } catch (error) {
      if (error.name === 'YAMLException') {
        // Corrupted YAML - delete the file
        await this.clearCache();
      }
      return null;
    }
  }

  /**
   * Check if cache is still valid
   *
   * ACT-3 Task 1: Event-driven invalidation.
   * - If git state fingerprint changed, cache is invalid immediately
   * - If fingerprint same, use active-session TTL (15s)
   * - If fingerprint unavailable, use idle TTL (60s)
   *
   * @param {{timestamp: number, ttl: number, gitFingerprint: string|null}} cache
   * @param {string|null} [currentFingerprint] - Current git state fingerprint
   * @returns {boolean}
   */
  isCacheValid(cache, currentFingerprint) {
    if (!cache || !cache.timestamp) return false;

    const age = Date.now() - cache.timestamp;

    // ACT-3: Event-driven invalidation via git fingerprint
    if (currentFingerprint && cache.gitFingerprint) {
      if (cache.gitFingerprint !== currentFingerprint) {
        // Git state changed - cache is immediately invalid
        return false;
      }
      // Git state unchanged - use active-session TTL (15s)
      return age < this.activeSessionTTL * 1000;
    }

    // Fallback: No fingerprint available - use idle TTL (60s)
    const ttl = cache.ttl || this.cacheTTL;
    return age < ttl * 1000;
  }

  /**
   * ACT-3 Task 2: Acquire a lock file for multi-terminal safety.
   *
   * Uses `fs.open()` with 'wx' flag (exclusive create) for cross-platform file locking.
   * Stale locks (older than LOCK_STALE_MS) are automatically cleaned up.
   *
   * @returns {Promise<boolean>} true if lock acquired, false otherwise
   * @private
   */
  async _acquireLock() {
    const startTime = Date.now();

    while (Date.now() - startTime < LOCK_TIMEOUT_MS) {
      try {
        // Try exclusive create - fails if file exists
        // Write lock data (PID + timestamp) directly to the lock file path
        const lockData = JSON.stringify({ pid: process.pid, timestamp: Date.now() });
        await fs.writeFile(this.lockFile, lockData, { flag: 'wx' });
        return true;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock exists - check if stale
          const isStale = await this._isLockStale();
          if (isStale) {
            // Remove stale lock and retry
            await this._releaseLock();
            continue;
          }
          // Wait briefly and retry
          await new Promise(resolve => setTimeout(resolve, 50));
          continue;
        }
        // Other error (e.g., ENOENT for missing directory) - skip locking
        return false;
      }
    }

    // Timeout - could not acquire lock
    return false;
  }

  /**
   * Check if the current lock file is stale.
   *
   * @returns {Promise<boolean>} true if lock is stale
   * @private
   */
  async _isLockStale() {
    try {
      const content = await fs.readFile(this.lockFile, 'utf8');
      const lockData = JSON.parse(content);
      return (Date.now() - lockData.timestamp) > LOCK_STALE_MS;
    } catch (error) {
      // Cannot read lock file - consider it stale
      return true;
    }
  }

  /**
   * Release the lock file.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _releaseLock() {
    try {
      await fs.unlink(this.lockFile);
    } catch (error) {
      // Lock file already removed or doesn't exist - that's fine
    }
  }

  /**
   * ACT-3 Task 2: Save cache with file locking for multi-terminal safety.
   *
   * Writes to a temporary file first, then renames atomically.
   * Uses lock file to prevent concurrent write corruption.
   *
   * @param {ProjectStatus} status
   * @param {string|null} gitFingerprint - Current git state fingerprint
   */
  async saveCacheWithLock(status, gitFingerprint) {
    const lockAcquired = await this._acquireLock();

    try {
      // Ensure .aiox directory exists
      const cacheDir = path.dirname(this.cacheFile);
      await fs.mkdir(cacheDir, { recursive: true });

      const cache = {
        status,
        timestamp: Date.now(),
        ttl: this.cacheTTL,
        gitFingerprint: gitFingerprint || null,
      };

      const content = yaml.dump(cache);

      // Atomic write: write to temp file, then rename
      const tempFile = this.cacheFile + '.tmp.' + process.pid;
      await fs.writeFile(tempFile, content, 'utf8');

      try {
        await fs.rename(tempFile, this.cacheFile);
      } catch (renameError) {
        // On Windows, rename can fail if target exists - fall back to direct write
        await fs.writeFile(this.cacheFile, content, 'utf8');
        // Clean up temp file
        try { await fs.unlink(tempFile); } catch { /* ignore */ }
      }
    } catch (error) {
      // Cache write failure is non-critical, just log
      console.warn('Failed to write status cache:', error.message);
    } finally {
      if (lockAcquired) {
        await this._releaseLock();
      }
    }
  }

  /**
   * Save status to cache file (backward-compatible wrapper)
   *
   * @param {ProjectStatus} status
   */
  async saveCache(status) {
    await this.saveCacheWithLock(status, null);
  }

  /**
   * Clear cache file
   */
  async clearCache() {
    try {
      await fs.unlink(this.cacheFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get default status for non-git projects
   *
   * @returns {ProjectStatus}
   */
  getNonGitStatus() {
    return {
      branch: null,
      modifiedFiles: [],
      recentCommits: [],
      currentEpic: null,
      currentStory: null,
      lastUpdate: new Date().toISOString(),
      isGitRepo: false,
    };
  }

  /**
   * Get default status on error
   *
   * @returns {ProjectStatus}
   */
  getDefaultStatus() {
    return {
      branch: 'unknown',
      modifiedFiles: [],
      recentCommits: [],
      currentEpic: null,
      currentStory: null,
      lastUpdate: new Date().toISOString(),
      isGitRepo: false,
    };
  }

  /**
   * Format status for display in agent greeting
   *
   * @param {ProjectStatus} status
   * @returns {string}
   */
  formatStatusDisplay(status) {
    if (!status.isGitRepo) {
      return '  (Not a git repository)';
    }

    const lines = [];

    if (status.branch) {
      lines.push(`  - Branch: ${status.branch}`);
    }

    if (status.modifiedFiles && status.modifiedFiles.length > 0) {
      let filesDisplay = status.modifiedFiles.join(', ');

      // QA Fix: Issue 6.1.2.4-I3 - Add truncation message
      const totalCount = status.modifiedFilesTotalCount || status.modifiedFiles.length;
      if (totalCount > status.modifiedFiles.length) {
        const remaining = totalCount - status.modifiedFiles.length;
        filesDisplay += ` ...and ${remaining} more`;
      }

      lines.push(`  - Modified: ${filesDisplay}`);
    }

    if (status.recentCommits && status.recentCommits.length > 0) {
      lines.push(`  - Recent: ${status.recentCommits.join(', ')}`);
    }

    if (status.currentStory) {
      lines.push(`  - Story: ${status.currentStory}`);
    }

    // Story 1.5: Display worktrees status
    if (status.worktrees && Object.keys(status.worktrees).length > 0) {
      const worktreeCount = Object.keys(status.worktrees).length;
      const activeCount = Object.values(status.worktrees).filter(
        (w) => w.status === 'active'
      ).length;
      const withChanges = Object.values(status.worktrees).filter(
        (w) => w.uncommittedChanges > 0
      ).length;

      let worktreeInfo = `${activeCount}/${worktreeCount} active`;
      if (withChanges > 0) {
        worktreeInfo += `, ${withChanges} with changes`;
      }
      lines.push(`  - Worktrees: ${worktreeInfo}`);
    }

    if (lines.length === 0) {
      return '  (No recent activity)';
    }

    return lines.join('\n');
  }
}

/**
 * @typedef {Object} WorktreeStatusInfo
 * @property {string} path - Relative path to worktree (.aiox/worktrees/{story-id})
 * @property {string} branch - Branch name (auto-claude/{story-id})
 * @property {string} createdAt - ISO timestamp when worktree was created
 * @property {string} lastActivity - ISO timestamp of last activity check
 * @property {number} uncommittedChanges - Number of uncommitted changes
 * @property {'active'|'stale'} status - Worktree status (stale if > 30 days)
 */

/**
 * @typedef {Object} ProjectStatus
 * @property {string|null} branch - Current git branch
 * @property {string[]} modifiedFiles - List of modified files (max 5)
 * @property {string[]} recentCommits - Recent commit messages (max 2)
 * @property {string|null} currentEpic - Current epic name
 * @property {string|null} currentStory - Current story ID
 * @property {string} lastUpdate - ISO timestamp of last update
 * @property {boolean} isGitRepo - Whether this is a git repository
 * @property {Object<string, WorktreeStatusInfo>} [worktrees] - Worktrees status by story ID (Story 1.5)
 */

// Export singleton instance
const loader = new ProjectStatusLoader();

module.exports = {
  loadProjectStatus: () => loader.loadProjectStatus(),
  clearCache: () => loader.clearCache(),
  formatStatusDisplay: (status) => loader.formatStatusDisplay(status),
  ProjectStatusLoader,
  // ACT-3: Export constants for testing
  LOCK_TIMEOUT_MS,
  LOCK_STALE_MS,
  ACTIVE_SESSION_TTL,
  IDLE_TTL,
};
