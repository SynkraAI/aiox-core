const { execa } = require('execa');
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');

/**
 * GitWrapper - Centralized git operations for AIOX
 *
 * Refactored to use execa for cross-platform compatibility
 * All git operations route through execGit() method
 */
class GitWrapper {
  constructor(rootPath) {
    this.rootPath = rootPath || process.cwd();
    this.gitPath = 'git';
  }

  /**
   * Execute git command using execa
   *
   * @param {string} command - Git command with arguments as string
   * @param {object} options - Execution options
   * @returns {string} Command stdout output
   */
  async execGit(command, options = {}) {
    try {
      // Split command string into array for execa
      const args = command.split(' ');
      const { stdout, stderr } = await execa(this.gitPath, args, {
        cwd: this.rootPath,
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
   * Check if current directory is a git repository
   */
  async isGitInitialized() {
    try {
      await this.execGit('rev-parse --git-dir');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize a new git repository
   */
  async initializeRepository() {
    try {
      await this.execGit('init');
      return true;
    } catch (error) {
      throw new Error(`Failed to initialize git repository: ${error.message}`);
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch() {
    try {
      return await this.execGit('rev-parse --abbrev-ref HEAD');
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error.message}`);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName, baseBranch = null) {
    try {
      if (baseBranch) {
        await this.execGit(`checkout -b ${branchName} ${baseBranch}`);
      } else {
        await this.execGit(`checkout -b ${branchName}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to create branch ${branchName}: ${error.message}`);
    }
  }

  /**
   * Checkout existing branch
   */
  async checkoutBranch(branchName) {
    try {
      await this.execGit(`checkout ${branchName}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to checkout branch ${branchName}: ${error.message}`);
    }
  }

  /**
   * Create a modification branch with timestamp
   */
  async createModificationBranch(modificationId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `modification/${modificationId}/${timestamp}`;
    await this.createBranch(branchName);
    return branchName;
  }

  /**
   * Stage files for commit
   */
  async stageFiles(files) {
    try {
      if (Array.isArray(files)) {
        for (const file of files) {
          await this.execGit(`add ${file}`);
        }
      } else {
        await this.execGit(`add ${files}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to stage files: ${error.message}`);
    }
  }

  /**
   * Create a commit
   */
  async commit(message, options = {}) {
    try {
      const commitArgs = ['commit', '-m', message];

      if (options.allowEmpty) {
        commitArgs.push('--allow-empty');
      }

      // Note: execa handles arguments array directly
      const { stdout } = await execa(this.gitPath, commitArgs, {
        cwd: this.rootPath,
      });

      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to create commit: ${error.message}`);
    }
  }

  /**
   * Create a modification commit with metadata
   */
  async commitModification(modificationId, description, metadata = {}) {
    const message = `[Modification ${modificationId}] ${description}

Metadata:
${JSON.stringify(metadata, null, 2)}`;

    return await this.commit(message);
  }

  /**
   * Get repository status
   */
  async getStatus() {
    try {
      const output = await this.execGit('status --porcelain');

      const status = {
        clean: !output,
        modified: [],
        staged: [],
        untracked: [],
      };

      if (!output) return status;

      const lines = output.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const statusCode = line.substring(0, 2);
        const file = line.substring(3);

        if (statusCode[0] === 'M') {
          status.staged.push(file);
        } else if (statusCode[1] === 'M') {
          status.modified.push(file);
        } else if (statusCode === '??') {
          status.untracked.push(file);
        }
      }

      return status;
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  /**
   * Get commit history
   */
  async getHistory(limit = 10) {
    try {
      const output = await this.execGit(`log --oneline -n ${limit}`);
      return output.split('\n').map(line => {
        const [hash, ...messageParts] = line.split(' ');
        return {
          hash,
          message: messageParts.join(' '),
        };
      });
    } catch (error) {
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  /**
   * Check for merge conflicts
   */
  async getConflicts() {
    try {
      const output = await this.execGit('diff --name-only --diff-filter=U');
      return output ? output.split('\n').filter(f => f.trim()) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Merge a branch
   */
  async mergeBranch(branchName, options = {}) {
    try {
      const mergeArgs = ['merge', branchName];

      if (options.noFf) {
        mergeArgs.push('--no-ff');
      }

      if (options.message) {
        mergeArgs.push('-m', options.message);
      }

      const { stdout } = await execa(this.gitPath, mergeArgs, {
        cwd: this.rootPath,
      });

      return {
        success: true,
        output: stdout.trim(),
      };
    } catch (error) {
      const conflicts = await this.getConflicts();
      return {
        success: false,
        conflicts,
        error: error.message,
      };
    }
  }

  /**
   * Create a git tag
   */
  async createTag(tagName, message = null) {
    const tagArgs = message
      ? `tag -a ${tagName} -m "${message}"`
      : `tag ${tagName}`;

    return await this.execGit(tagArgs);
  }

  /**
   * Push to remote
   */
  async push(remote = 'origin', branch = null, options = {}) {
    try {
      const pushArgs = ['push', remote];

      if (branch) {
        pushArgs.push(branch);
      }

      if (options.setUpstream) {
        pushArgs.push('--set-upstream');
      }

      if (options.force) {
        pushArgs.push('--force');
      }

      const { stdout } = await execa(this.gitPath, pushArgs, {
        cwd: this.rootPath,
      });

      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  /**
   * Get diff for files
   */
  async getDiff(files = null, options = {}) {
    try {
      let diffCommand = 'diff';

      if (options.staged) {
        diffCommand += ' --staged';
      }

      if (options.nameOnly) {
        diffCommand += ' --name-only';
      }

      if (files) {
        if (Array.isArray(files)) {
          diffCommand += ' ' + files.join(' ');
        } else {
          diffCommand += ' ' + files;
        }
      }

      return await this.execGit(diffCommand);
    } catch (error) {
      return '';
    }
  }

  /**
   * Stash changes
   */
  async stash(message = null) {
    const stashCommand = message
      ? `stash save "${message}"`
      : 'stash';

    return await this.execGit(stashCommand);
  }

  /**
   * Apply stashed changes
   */
  async stashApply(stashRef = null) {
    const applyCommand = stashRef
      ? `stash apply ${stashRef}`
      : 'stash apply';

    return await this.execGit(applyCommand);
  }

  /**
   * Get remote repositories
   */
  async getRemotes() {
    try {
      const output = await this.execGit('remote -v');
      const remotes = {};

      if (!output) return remotes;

      const lines = output.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const [name, url, type] = line.split(/\s+/);
        if (!remotes[name]) {
          remotes[name] = { fetch: null, push: null };
        }
        remotes[name][type.replace(/[()]/g, '')] = url;
      }

      return remotes;
    } catch (error) {
      return {};
    }
  }

  /**
   * Add remote repository
   */
  async addRemote(name, url) {
    return await this.execGit(`remote add ${name} ${url}`);
  }

  /**
   * Remove remote repository
   */
  async removeRemote(name) {
    return await this.execGit(`remote remove ${name}`);
  }

  /**
   * Fetch from remote
   */
  async fetch(remote = 'origin', options = {}) {
    const fetchArgs = ['fetch', remote];

    if (options.prune) {
      fetchArgs.push('--prune');
    }

    if (options.all) {
      fetchArgs.push('--all');
    }

    const { stdout } = await execa(this.gitPath, fetchArgs, {
      cwd: this.rootPath,
    });

    return stdout.trim();
  }

  /**
   * Pull from remote
   */
  async pull(remote = 'origin', branch = null, options = {}) {
    const pullArgs = ['pull', remote];

    if (branch) {
      pullArgs.push(branch);
    }

    if (options.rebase) {
      pullArgs.push('--rebase');
    }

    const { stdout } = await execa(this.gitPath, pullArgs, {
      cwd: this.rootPath,
    });

    return stdout.trim();
  }
}

module.exports = GitWrapper;
