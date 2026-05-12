const execa = require('execa');
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');

/**
 * @typedef {Object} WorktreeInfo
 * @property {string} storyId - The story identifier
 * @property {string} path - Absolute path to the worktree
 * @property {string} branch - Branch name (auto-claude/{storyId})
 * @property {Date} createdAt - When the worktree was created
 * @property {number} uncommittedChanges - Number of uncommitted changes
 * @property {'active'|'stale'} status - Worktree status (stale if > 30 days)
 */

/**
 * @typedef {Object} WorktreeManagerOptions
 * @property {number} [maxWorktrees=10] - Maximum number of concurrent worktrees
 * @property {string} [worktreeDir='.aiox/worktrees'] - Directory for worktrees
 * @property {string} [branchPrefix='auto-claude/'] - Prefix for worktree branches
 * @property {number} [staleDays=30] - Days after which a worktree is considered stale
 * @property {string} [mergeLogDir='.aiox/logs/merges'] - Directory for merge audit logs
 */

/**
 * @typedef {Object} MergeOptions
 * @property {boolean} [staged=false] - Merge without committing (--no-commit)
 * @property {boolean} [squash=false] - Squash commits before merge (--squash)
 * @property {boolean} [cleanup=false] - Remove worktree after successful merge
 * @property {string} [message] - Custom merge commit message
 */

/**
 * @typedef {Object} MergeResult
 * @property {boolean} success - Whether the merge was successful
 * @property {string} storyId - Story identifier that was merged
 * @property {string} sourceBranch - Branch that was merged from
 * @property {string} targetBranch - Branch that was merged into
 * @property {string[]} conflicts - List of conflicting files (if any)
 * @property {string} [commitHash] - Resulting commit hash (if committed)
 * @property {string} [error] - Error message if merge failed
 * @property {Date} timestamp - When the merge was attempted
 * @property {string} [logPath] - Path to merge audit log
 */

/**
 * WorktreeManager - Manages Git worktrees for isolated story development
 *
 * Provides functionality to create, list, and remove Git worktrees,
 * enabling parallel development of multiple stories in isolation.
 *
 * @example
 * const manager = new WorktreeManager('/path/to/repo');
 * await manager.create('STORY-42');
 * const worktrees = await manager.list();
 * await manager.remove('STORY-42');
 */
class WorktreeManager {
  /**
   * @param {string} [projectRoot] - Root path of the git repository
   * @param {WorktreeManagerOptions} [options] - Configuration options
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot || process.cwd();
    this.maxWorktrees = options.maxWorktrees || 10;
    this.worktreeDir = options.worktreeDir || '.aiox/worktrees';
    this.branchPrefix = options.branchPrefix || 'auto-claude/';
    this.staleDays = options.staleDays || 30;
    this.mergeLogDir = options.mergeLogDir || '.aiox/logs/merges';
    this.gitPath = 'git';
  }

  /**
   * Execute git command using execa
   * @private
   * @param {string[]} args - Git command arguments
   * @param {Object} [options] - Execution options
   * @returns {Promise<string>} Command stdout output
   */
  async execGit(args, options = {}) {
    try {
      const { stdout, stderr } = await execa(this.gitPath, args, {
        cwd: this.projectRoot,
        ...options,
      });

      if (stderr && !options.ignoreStderr) {
        console.warn(chalk.yellow(`Git warning: ${stderr}`));
      }

      return stdout.trim();
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Get the worktree path for a story
   * @private
   * @param {string} storyId - Story identifier
   * @returns {string} Absolute path to worktree
   */
  getWorktreePath(storyId) {
    return path.join(this.projectRoot, this.worktreeDir, storyId);
  }

  /**
   * Get the branch name for a story
   * @private
   * @param {string} storyId - Story identifier
   * @returns {string} Branch name
   */
  getBranchName(storyId) {
    return `${this.branchPrefix}${storyId}`;
  }

  /**
   * Create a new worktree for a story
   *
   * @param {string} storyId - Story identifier (e.g., 'STORY-42')
   * @returns {Promise<WorktreeInfo>} Created worktree information
   * @throws {Error} If max worktrees limit reached or worktree already exists
   */
  async create(storyId) {
    // Check if worktree already exists
    if (await this.exists(storyId)) {
      throw new Error(`Worktree for story '${storyId}' already exists`);
    }

    // Check max worktrees limit
    const currentWorktrees = await this.list();
    if (currentWorktrees.length >= this.maxWorktrees) {
      throw new Error(
        `Maximum worktrees limit (${this.maxWorktrees}) reached. ` +
          `Remove stale worktrees before creating new ones.`
      );
    }

    const worktreePath = this.getWorktreePath(storyId);
    const branchName = this.getBranchName(storyId);

    // Ensure parent directory exists
    const parentDir = path.dirname(worktreePath);
    await fs.mkdir(parentDir, { recursive: true });

    // Create worktree with new branch
    await this.execGit(['worktree', 'add', worktreePath, '-b', branchName]);

    console.log(chalk.green(`✓ Created worktree for ${storyId} at ${worktreePath}`));

    return this.get(storyId);
  }

  /**
   * Remove a worktree and its associated branch
   *
   * @param {string} storyId - Story identifier
   * @param {Object} [options] - Removal options
   * @param {boolean} [options.force=false] - Force removal even with uncommitted changes
   * @returns {Promise<boolean>} True if successfully removed
   * @throws {Error} If worktree doesn't exist
   */
  async remove(storyId, options = {}) {
    if (!(await this.exists(storyId))) {
      throw new Error(`Worktree for story '${storyId}' does not exist`);
    }

    const worktreePath = this.getWorktreePath(storyId);
    const branchName = this.getBranchName(storyId);

    // Remove worktree
    const worktreeArgs = ['worktree', 'remove', worktreePath];
    if (options.force) {
      worktreeArgs.push('--force');
    }
    await this.execGit(worktreeArgs);

    // Delete branch
    try {
      const branchArgs = ['branch', '-d', branchName];
      if (options.force) {
        branchArgs[1] = '-D'; // Force delete
      }
      await this.execGit(branchArgs);
    } catch (error) {
      console.warn(
        chalk.yellow(`Warning: Could not delete branch ${branchName}: ${error.message}`)
      );
    }

    console.log(chalk.green(`✓ Removed worktree for ${storyId}`));
    return true;
  }

  /**
   * List all worktrees with their status
   *
   * @returns {Promise<WorktreeInfo[]>} Array of worktree information
   */
  async list() {
    const output = await this.execGit(['worktree', 'list', '--porcelain']);

    if (!output) {
      return [];
    }

    const worktrees = [];
    const blocks = output.split('\n\n').filter(Boolean);

    for (const block of blocks) {
      const lines = block.split('\n');
      const worktreePath = lines[0]?.replace('worktree ', '') || '';
      const branchLine = lines.find((l) => l.startsWith('branch '));
      const branch = branchLine?.replace('branch refs/heads/', '') || '';

      // Skip main worktree and non-auto-claude worktrees
      if (!branch.startsWith(this.branchPrefix)) {
        continue;
      }

      const storyId = branch.replace(this.branchPrefix, '');
      const expectedPath = this.getWorktreePath(storyId);

      // Only include worktrees in our managed directory
      if (!worktreePath.includes(this.worktreeDir)) {
        continue;
      }

      const info = await this.getWorktreeInfo(storyId, worktreePath, branch);
      if (info) {
        worktrees.push(info);
      }
    }

    return worktrees;
  }

  /**
   * Get detailed information about a worktree
   * @private
   * @param {string} storyId - Story identifier
   * @param {string} worktreePath - Path to worktree
   * @param {string} branch - Branch name
   * @returns {Promise<WorktreeInfo|null>} Worktree information
   */
  async getWorktreeInfo(storyId, worktreePath, branch) {
    try {
      // Get creation time from directory
      const stats = await fs.stat(worktreePath);
      const createdAt = stats.birthtime || stats.mtime;

      // Get uncommitted changes count
      let uncommittedChanges = 0;
      try {
        const statusOutput = await execa(this.gitPath, ['status', '--porcelain'], {
          cwd: worktreePath,
        });
        uncommittedChanges = statusOutput.stdout
          ? statusOutput.stdout.split('\n').filter(Boolean).length
          : 0;
      } catch {
        // Worktree might be in invalid state
      }

      // Determine status
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const status = daysSinceCreation > this.staleDays ? 'stale' : 'active';

      return {
        storyId,
        path: worktreePath,
        branch,
        createdAt,
        uncommittedChanges,
        status,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get information about a specific worktree
   *
   * @param {string} storyId - Story identifier
   * @returns {Promise<WorktreeInfo|null>} Worktree information or null if not found
   */
  async get(storyId) {
    const worktreePath = this.getWorktreePath(storyId);
    const branchName = this.getBranchName(storyId);

    try {
      await fs.access(worktreePath);
      return this.getWorktreeInfo(storyId, worktreePath, branchName);
    } catch {
      return null;
    }
  }

  /**
   * Check if a worktree exists for a story
   *
   * @param {string} storyId - Story identifier
   * @returns {Promise<boolean>} True if worktree exists
   */
  async exists(storyId) {
    const worktreePath = this.getWorktreePath(storyId);

    try {
      await fs.access(worktreePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get count of active worktrees
   *
   * @returns {Promise<{total: number, active: number, stale: number}>} Worktree counts
   */
  async getCount() {
    const worktrees = await this.list();
    return {
      total: worktrees.length,
      active: worktrees.filter((w) => w.status === 'active').length,
      stale: worktrees.filter((w) => w.status === 'stale').length,
    };
  }

  /**
   * Remove all stale worktrees
   *
   * @returns {Promise<string[]>} List of removed story IDs
   */
  async cleanupStale() {
    const worktrees = await this.list();
    const stale = worktrees.filter((w) => w.status === 'stale');
    const removed = [];

    for (const worktree of stale) {
      try {
        await this.remove(worktree.storyId, { force: true });
        removed.push(worktree.storyId);
      } catch (error) {
        console.warn(
          chalk.yellow(
            `Warning: Could not remove stale worktree ${worktree.storyId}: ${error.message}`
          )
        );
      }
    }

    if (removed.length > 0) {
      console.log(chalk.green(`✓ Cleaned up ${removed.length} stale worktrees`));
    }

    return removed;
  }

  /**
   * Detect potential merge conflicts before merging
   *
   * Performs a dry-run merge to identify conflicting files without
   * permanently modifying the working tree.
   *
   * @param {string} storyId - Story identifier
   * @returns {Promise<string[]>} List of files that would conflict
   * @throws {Error} If worktree doesn't exist
   */
  async detectConflicts(storyId) {
    if (!(await this.exists(storyId))) {
      throw new Error(`Worktree for story '${storyId}' does not exist`);
    }

    const branchName = this.getBranchName(storyId);

    // Save current HEAD to restore if needed
    const currentHead = await this.execGit(['rev-parse', 'HEAD']);

    try {
      // Attempt a dry-run merge with --no-commit
      await execa(this.gitPath, ['merge', '--no-commit', '--no-ff', branchName], {
        cwd: this.projectRoot,
      });

      // No conflicts - abort the successful merge
      await execa(this.gitPath, ['merge', '--abort'], {
        cwd: this.projectRoot,
      }).catch(() => {
        // If abort fails, reset to original HEAD
        return execa(this.gitPath, ['reset', '--hard', currentHead], {
          cwd: this.projectRoot,
        });
      });

      return [];
    } catch (mergeError) {
      // Merge failed - likely conflicts
      let conflicts = [];

      try {
        // Get conflict list using diff
        const { stdout: conflictOutput } = await execa(
          this.gitPath,
          ['diff', '--name-only', '--diff-filter=U'],
          { cwd: this.projectRoot }
        );
        conflicts = conflictOutput ? conflictOutput.split('\n').filter((f) => f.trim()) : [];
      } catch {
        // If diff fails, try ls-files with unmerged
        try {
          const { stdout: lsOutput } = await execa(this.gitPath, ['ls-files', '--unmerged'], {
            cwd: this.projectRoot,
          });
          // Extract unique filenames from ls-files output
          const fileSet = new Set();
          lsOutput.split('\n').forEach((line) => {
            const parts = line.split('\t');
            if (parts[1]) {
              fileSet.add(parts[1]);
            }
          });
          conflicts = Array.from(fileSet);
        } catch {
          // Unable to get conflicts
        }
      }

      // Abort the failed merge and reset
      try {
        await execa(this.gitPath, ['merge', '--abort'], {
          cwd: this.projectRoot,
        });
      } catch {
        // If abort fails, reset to original HEAD
        await execa(this.gitPath, ['reset', '--hard', currentHead], {
          cwd: this.projectRoot,
        });
      }

      return conflicts;
    }
  }

  /**
   * Merge worktree branch back to base branch
   *
   * @param {string} storyId - Story identifier
   * @param {MergeOptions} [options] - Merge options
   * @returns {Promise<MergeResult>} Result of the merge operation
   * @throws {Error} If worktree doesn't exist
   */
  async mergeToBase(storyId, options = {}) {
    const timestamp = new Date();
    const branchName = this.getBranchName(storyId);

    // Validate worktree exists
    if (!(await this.exists(storyId))) {
      throw new Error(`Worktree for story '${storyId}' does not exist`);
    }

    // Get current branch (base branch to merge into)
    const baseBranch = await this.execGit(['rev-parse', '--abbrev-ref', 'HEAD']);

    // Initialize result object
    const result = {
      success: false,
      storyId,
      sourceBranch: branchName,
      targetBranch: baseBranch,
      conflicts: [],
      timestamp,
    };

    try {
      // Check for conflicts first
      const conflicts = await this.detectConflicts(storyId);
      if (conflicts.length > 0) {
        result.conflicts = conflicts;
        result.error = `Merge would result in ${conflicts.length} conflict(s)`;
        console.log(chalk.red(`✗ Cannot merge ${storyId}: ${conflicts.length} conflicts detected`));
        conflicts.forEach((file) => console.log(chalk.yellow(`  - ${file}`)));

        await this.writeMergeLog(result);
        return result;
      }

      // Build merge arguments
      const mergeArgs = ['merge'];

      if (options.squash) {
        mergeArgs.push('--squash');
      }

      if (options.staged || options.squash) {
        mergeArgs.push('--no-commit');
      }

      // Force merge commit (no fast-forward) when staged without squash
      // (squash already implies non-fast-forward behavior)
      if (options.staged && !options.squash) {
        mergeArgs.push('--no-ff');
      }

      // Custom message or default
      const mergeMessage = options.message || `Merge ${branchName} (Story: ${storyId})`;
      if (!options.staged && !options.squash) {
        mergeArgs.push('-m', mergeMessage);
      }

      mergeArgs.push(branchName);

      // Perform the merge
      await execa(this.gitPath, mergeArgs, {
        cwd: this.projectRoot,
      });

      // If squash merge, we need to commit manually unless staged option
      if (options.squash && !options.staged) {
        await execa(this.gitPath, ['commit', '-m', mergeMessage], {
          cwd: this.projectRoot,
        });
      }

      // Get the resulting commit hash (if committed)
      if (!options.staged) {
        try {
          const commitHash = await this.execGit(['rev-parse', 'HEAD']);
          result.commitHash = commitHash;
        } catch {
          // Commit hash not available
        }
      }

      result.success = true;

      // Write audit log
      const logPath = await this.writeMergeLog(result);
      result.logPath = logPath;

      // Status message
      if (options.staged) {
        console.log(chalk.green(`✓ Merged ${storyId} (staged, not committed)`));
        console.log(chalk.gray('  Use "git commit" to complete the merge'));
      } else if (options.squash) {
        console.log(
          chalk.green(`✓ Merged ${storyId} (squashed) → ${result.commitHash?.substring(0, 7)}`)
        );
      } else {
        console.log(chalk.green(`✓ Merged ${storyId} → ${result.commitHash?.substring(0, 7)}`));
      }

      // Cleanup worktree if requested
      if (options.cleanup && result.success) {
        await this.remove(storyId, { force: true });
        console.log(chalk.gray(`  Cleaned up worktree for ${storyId}`));
      }

      return result;
    } catch (error) {
      // Merge failed
      result.error = error.message;

      // Try to get conflict list
      try {
        const conflictOutput = await this.execGit(['diff', '--name-only', '--diff-filter=U']);
        result.conflicts = conflictOutput ? conflictOutput.split('\n').filter((f) => f.trim()) : [];
      } catch {
        // No conflicts available
      }

      // Abort the failed merge
      try {
        await this.execGit(['merge', '--abort'], { ignoreStderr: true });
      } catch {
        // Abort might fail if nothing to abort
      }

      console.log(chalk.red(`✗ Merge failed for ${storyId}: ${error.message}`));
      if (result.conflicts.length > 0) {
        console.log(chalk.yellow('  Conflicting files:'));
        result.conflicts.forEach((file) => console.log(chalk.yellow(`    - ${file}`)));
      }

      await this.writeMergeLog(result);
      return result;
    }
  }

  /**
   * Write merge audit log
   * @private
   * @param {MergeResult} result - Merge result to log
   * @returns {Promise<string>} Path to the log file
   */
  async writeMergeLog(result) {
    const logDir = path.join(this.projectRoot, this.mergeLogDir);
    await fs.mkdir(logDir, { recursive: true });

    const timestamp = result.timestamp.toISOString().replace(/[:.]/g, '-');
    const logFileName = `merge-${result.storyId}-${timestamp}.json`;
    const logPath = path.join(logDir, logFileName);

    const logEntry = {
      ...result,
      timestamp: result.timestamp.toISOString(),
      projectRoot: this.projectRoot,
    };

    await fs.writeFile(logPath, JSON.stringify(logEntry, null, 2), 'utf8');

    return logPath;
  }

  /**
   * Get merge history for a story
   *
   * @param {string} [storyId] - Story identifier (optional, returns all if not provided)
   * @returns {Promise<MergeResult[]>} Array of merge results
   */
  async getMergeHistory(storyId = null) {
    const logDir = path.join(this.projectRoot, this.mergeLogDir);

    try {
      await fs.access(logDir);
    } catch {
      return []; // No logs yet
    }

    const files = await fs.readdir(logDir);
    const pattern = storyId ? `merge-${storyId}-` : 'merge-';
    const logFiles = files.filter((f) => f.startsWith(pattern) && f.endsWith('.json'));

    const history = [];
    for (const file of logFiles) {
      try {
        const content = await fs.readFile(path.join(logDir, file), 'utf8');
        const entry = JSON.parse(content);
        entry.timestamp = new Date(entry.timestamp);
        history.push(entry);
      } catch {
        // Skip invalid log files
      }
    }

    // Sort by timestamp descending
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Format worktree list for display
   *
   * @param {WorktreeInfo[]} worktrees - List of worktrees
   * @returns {string} Formatted output string
   */
  formatList(worktrees) {
    if (worktrees.length === 0) {
      return chalk.gray('No active worktrees');
    }

    const lines = [
      chalk.bold(`📁 Active Worktrees (${worktrees.length}/${this.maxWorktrees})`),
      chalk.gray('━'.repeat(50)),
    ];

    for (const wt of worktrees) {
      const statusIcon = wt.status === 'active' ? (wt.uncommittedChanges > 0 ? '🟢' : '🟡') : '⚫';
      const changesText =
        wt.uncommittedChanges > 0 ? `${wt.uncommittedChanges} uncommitted` : 'clean';
      const age = this.formatAge(wt.createdAt);
      const staleTag = wt.status === 'stale' ? chalk.red(' (stale)') : '';

      lines.push(
        `${statusIcon} ${chalk.cyan(wt.storyId.padEnd(12))} │ ${wt.branch.padEnd(25)} │ ${changesText.padEnd(15)} │ ${age}${staleTag}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Format age for display
   * @private
   * @param {Date} date - Date to format
   * @returns {string} Formatted age string
   */
  formatAge(date) {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    }
    if (hours > 0) {
      return `${hours}h ago`;
    }
    return 'just now';
  }
}

module.exports = WorktreeManager;
