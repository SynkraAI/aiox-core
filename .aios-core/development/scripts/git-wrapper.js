const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const _path = require('path');
const _fs = require('fs').promises;
const chalk = require('chalk');

/**
 * Git operations wrapper for AIOS framework modifications
 */
class GitWrapper {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.gitPath = options.gitPath || 'git';
    this.defaultBranch = options.defaultBranch || 'main';
    this.metaAgentPrefix = options.metaAgentPrefix || 'meta-agent/';
  }

  /**
   * Execute a git command
   * @private
   */
  async execGit(command, options = {}) {
    try {
      const { stdout, stderr } = await execAsync(`${this.gitPath} ${command}`, {
        cwd: this.rootPath,
        ...options
      });
      
      if (stderr && !options.ignoreStderr) {
        console.warn(chalk.yellow(`Git warning: ${stderr}`));
      }
      
      return stdout.trim();
    } catch (_error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Check if git is initialized
   * @returns {Promise<boolean>}
   */
  async isGitInitialized() {
    try {
      await this.execGit('status');
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Initialize git repository if not already initialized
   * @returns {Promise<void>}
   */
  async initializeRepository() {
    const initialized = await this.isGitInitialized();
    if (!initialized) {
      await this.execGit('init');
      console.log(chalk.green('✅ Git repository initialized'));
    }
  }

  /**
   * Get current branch name
   * @returns {Promise<string>}
   */
  async getCurrentBranch() {
    return await this.execGit('rev-parse --abbrev-ref HEAD');
  }

  /**
   * Create a new branch
   * @param {string} branchName - Name of the branch to create
   * @param {boolean} checkout - Whether to checkout the branch
   * @returns {Promise<void>}
   */
  async createBranch(branchName, checkout = true) {
    try {
      if (checkout) {
        await this.execGit(`checkout -b ${branchName}`);
      } else {
        await this.execGit(`branch ${branchName}`);
      }
      console.log(chalk.green(`✅ Created branch: ${branchName}`));
    } catch (_error) {
      // Branch might already exist
      if (error.message.includes('already exists')) {
        console.log(chalk.yellow(`Branch already exists: ${branchName}`));
        if (checkout) {
          await this.checkoutBranch(branchName);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Checkout an existing branch
   * @param {string} branchName - Name of the branch to checkout
   * @returns {Promise<void>}
   */
  async checkoutBranch(branchName) {
    await this.execGit(`checkout ${branchName}`);
    console.log(chalk.green(`✅ Checked out branch: ${branchName}`));
  }

  /**
   * Create a branch for meta-agent modifications
   * @param {string} modificationName - Name of the modification
   * @returns {Promise<string>} Branch name
   */
  async createModificationBranch(modificationName) {
    const timestamp = new Date().toISOString().substring(0, 10);
    const branchName = `${this.metaAgentPrefix}${modificationName}-${timestamp}`;
    await this.createBranch(branchName);
    return branchName;
  }

  /**
   * Stage files for commit
   * @param {Array<string>} files - Files to stage
   * @returns {Promise<void>}
   */
  async stageFiles(files) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided to stage');
    }

    for (const file of files) {
      await this.execGit(`add "${file}"`);
    }
    
    console.log(chalk.green(`✅ Staged ${files.length} files`));
  }

  /**
   * Commit changes with message
   * @param {string} message - Commit message
   * @param {Object} options - Commit options
   * @returns {Promise<string>} Commit hash
   */
  async commit(message, options = {}) {
    const {
      author = 'aios-developer <aios-developer@aios-fullstack.local>',
      signoff = true
    } = options;

    let command = `commit -m "${message.replace(/"/g, '\\"')}"`;
    
    if (author) {
      command += ` --author="${author}"`;
    }
    
    if (signoff) {
      command += ' --signoff';
    }

    const output = await this.execGit(command);
    const hashMatch = output.match(/\[[\w-]+ ([\w]+)\]/);
    const commitHash = hashMatch ? hashMatch[1] : 'unknown';
    
    console.log(chalk.green(`✅ Committed: ${commitHash}`));
    return commitHash;
  }

  /**
   * Create a commit for component modifications
   * @param {Array<string>} files - Files to commit
   * @param {string} message - Commit message
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<string>} Commit hash
   */
  async commitModification(files, message, metadata = {}) {
    await this.stageFiles(files);
    
    // Add metadata to commit message
    let fullMessage = message;
    if (metadata.componentType && metadata.componentName) {
      fullMessage = `${metadata.componentType}(${metadata.componentName}): ${message}`;
    }
    
    if (metadata.breakingChange) {
      fullMessage += '\n\nBREAKING CHANGE: ' + metadata.breakingChange;
    }
    
    if (metadata.approvedBy) {
      fullMessage += `\n\nApproved-by: ${metadata.approvedBy}`;
    }
    
    fullMessage += '\n\nGenerated by: aios-developer meta-agent';
    
    return await this.commit(fullMessage);
  }

  /**
   * Get git status
   * @returns {Promise<Object>} Status information
   */
  async getStatus() {
    const porcelainStatus = await this.execGit('status --porcelain');
    const branch = await this.getCurrentBranch();
    
    const files = {
      modified: [],
      added: [],
      deleted: [],
      untracked: []
    };
    
    if (porcelainStatus) {
      const lines = porcelainStatus.split('\n');
      for (const line of lines) {
        if (!line) continue;
        
        const status = line.substring(0, 2);
        const filename = line.substring(3);
        
        if (status.includes('M')) files.modified.push(filename);
        else if (status.includes('A')) files.added.push(filename);
        else if (status.includes('D')) files.deleted.push(filename);
        else if (status === '??') files.untracked.push(filename);
      }
    }
    
    return {
      branch,
      clean: porcelainStatus === '',
      files
    };
  }

  /**
   * Get commit history
   * @param {number} limit - Number of commits to retrieve
   * @returns {Promise<Array>} Commit history
   */
  async getHistory(limit = 10) {
    const format = '%H|%an|%ae|%at|%s';
    const output = await this.execGit(`log -${limit} --format="${format}"`);
    
    if (!output) return [];
    
    return output.split('\n').map(line => {
      const [hash, author, email, timestamp, subject] = line.split('|');
      return {
        hash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1000),
        subject
      };
    });
  }

  /**
   * Check for conflicts
   * @returns {Promise<Array>} List of conflicted files
   */
  async getConflicts() {
    try {
      const output = await this.execGit('diff --name-only --diff-filter=U');
      return output ? output.split('\n').filter(Boolean) : [];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Merge a branch
   * @param {string} branchName - Branch to merge
   * @param {Object} options - Merge options
   * @returns {Promise<Object>} Merge result
   */
  async mergeBranch(branchName, options = {}) {
    const {
      strategy = 'recursive',
      message = null,
      noFastForward = true
    } = options;

    let command = `merge ${branchName}`;
    
    if (strategy) {
      command += ` --strategy=${strategy}`;
    }
    
    if (noFastForward) {
      command += ' --no-ff';
    }
    
    if (message) {
      command += ` -m "${message.replace(/"/g, '\\"')}"`;
    }

    try {
      const output = await this.execGit(command);
      return {
        success: true,
        message: output
      };
    } catch (_error) {
      // Check for conflicts
      const conflicts = await this.getConflicts();
      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
          error: 'Merge conflicts detected'
        };
      }
      throw error;
    }
  }

  /**
   * Create a tag
   * @param {string} tagName - Name of the tag
   * @param {string} message - Tag message
   * @returns {Promise<void>}
   */
  async createTag(tagName, message) {
    await this.execGit(`tag -a ${tagName} -m "${message.replace(/"/g, '\\"')}"`);
    console.log(chalk.green(`✅ Created tag: ${tagName}`));
  }

  /**
   * Push changes to remote
   * @param {string} remote - Remote name
   * @param {string} branch - Branch name
   * @param {Object} options - Push options
   * @returns {Promise<void>}
   */
  async push(remote = 'origin', branch = null, options = {}) {
    const currentBranch = branch || await this.getCurrentBranch();
    let command = `push ${remote} ${currentBranch}`;
    
    if (options.tags) {
      command += ' --tags';
    }
    
    if (options.force) {
      command += ' --force';
    }
    
    if (options.setUpstream) {
      command = `push -u ${remote} ${currentBranch}`;
    }

    await this.execGit(command);
    console.log(chalk.green(`✅ Pushed to ${remote}/${currentBranch}`));
  }

  /**
   * Get diff between commits or working tree
   * @param {Object} options - Diff options
   * @returns {Promise<string>} Diff output
   */
  async getDiff(options = {}) {
    const {
      from = 'HEAD',
      to = null,
      files = [],
      nameOnly = false
    } = options;

    let command = 'diff';
    
    if (nameOnly) {
      command += ' --name-only';
    }
    
    if (to) {
      command += ` ${from} ${to}`;
    } else {
      command += ` ${from}`;
    }
    
    if (files.length > 0) {
      command += ` -- ${files.join(' ')}`;
    }

    return await this.execGit(command);
  }

  /**
   * Stash changes
   * @param {string} message - Stash message
   * @returns {Promise<void>}
   */
  async stash(message = 'Meta-agent modifications') {
    await this.execGit(`stash push -m "${message}"`);
    console.log(chalk.green('✅ Changes stashed'));
  }

  /**
   * Apply stash
   * @param {string} stashRef - Stash reference
   * @returns {Promise<void>}
   */
  async stashApply(stashRef = 'stash@{0}') {
    await this.execGit(`stash apply ${stashRef}`);
    console.log(chalk.green('✅ Stash applied'));
  }

  /**
   * Get remote information
   * @returns {Promise<Array>} Remote information
   */
  async getRemotes() {
    const output = await this.execGit('remote -v');
    if (!output) return [];

    const remotes = {};
    output.split('\n').forEach(line => {
      const [name, url, type] = line.split(/\s+/);
      if (!remotes[name]) {
        remotes[name] = {};
      }
      remotes[name][type.replace(/[()]/g, '')] = url;
    });

    return Object.entries(remotes).map(([name, urls]) => ({
      name,
      fetchUrl: urls.fetch,
      pushUrl: urls.push
    }));
  }

  /**
   * Generate commit message for modifications
   * @param {Object} modification - Modification details
   * @returns {string} Generated commit message
   */
  generateCommitMessage(modification) {
    const {
      action,
      componentType,
      _componentName,
      summary,
      details = [],
      breakingChanges = []
    } = modification;

    let message = `${action}(${componentType}): ${summary}`;
    
    if (details.length > 0) {
      message += '\n\n' + details.map(d => `- ${d}`).join('\n');
    }
    
    if (breakingChanges.length > 0) {
      message += '\n\nBREAKING CHANGES:\n' + 
        breakingChanges.map(bc => `- ${bc}`).join('\n');
    }

    return message;
  }
}

module.exports = GitWrapper;