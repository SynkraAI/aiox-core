const GitWrapper = require('./git-wrapper');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');

/**
 * Manages git branches for meta-agent modifications
 */
class BranchManager {
  constructor(options = {}) {
    this.git = new GitWrapper(options);
    this.branchPrefix = options.branchPrefix || 'meta-agent/';
    this.maxBranches = options.maxBranches || 10;
    this.autoCleanup = options.autoCleanup !== false;
  }

  /**
   * Create a modification branch with proper naming
   * @param {Object} modification - Modification details
   * @returns {Promise<Object>} Branch creation result
   */
  async createModificationBranch(modification) {
    const {
      type,
      target,
      action,
      ticketId
    } = modification;

    // Generate branch name
    const timestamp = Date.now();
    const sanitizedTarget = target.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const sanitizedAction = action.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    
    let branchName = `${this.branchPrefix}${type}/${sanitizedTarget}-${sanitizedAction}-${timestamp}`;
    
    if (ticketId) {
      branchName = `${this.branchPrefix}${ticketId}/${type}-${sanitizedTarget}`;
    }

    try {
      // Ensure we're on the default branch first
      const currentBranch = await this.git.getCurrentBranch();
      if (currentBranch !== this.git.defaultBranch) {
        console.log(chalk.yellow(`Switching to ${this.git.defaultBranch} before creating new branch`));
        await this.git.checkoutBranch(this.git.defaultBranch);
      }

      // Create and checkout the new branch
      await this.git.createBranch(branchName, true);

      return {
        success: true,
        branchName,
        baseBranch: this.git.defaultBranch,
        timestamp: new Date(timestamp).toISOString()
      };
    } catch (error) {
      console.error(chalk.red(`Failed to create branch: ${error.message}`));
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all modification branches
   * @returns {Promise<Array>} List of modification branches
   */
  async getModificationBranches() {
    try {
      const output = await this.git.execGit('branch -a');
      const branches = output.split('\n')
        .map(line => line.trim().replace('* ', ''))
        .filter(branch => branch.startsWith(this.branchPrefix));

      const branchDetails = [];
      for (const branch of branches) {
        const lastCommit = await this.git.execGit(`log -1 --format="%H|%at|%s" ${branch}`);
        const [hash, timestamp, subject] = lastCommit.split('|');
        
        branchDetails.push({
          name: branch,
          lastCommitHash: hash,
          lastCommitDate: new Date(parseInt(timestamp) * 1000),
          lastCommitMessage: subject,
          age: this.calculateAge(parseInt(timestamp) * 1000)
        });
      }

      return branchDetails.sort((a, b) => b.lastCommitDate - a.lastCommitDate);
    } catch (error) {
      console.error(chalk.red(`Failed to get modification branches: ${error.message}`));
      return [];
    }
  }

  /**
   * Switch to a modification branch
   * @param {string} branchName - Branch to switch to
   * @returns {Promise<Object>} Switch result
   */
  async switchToBranch(branchName) {
    try {
      // Check for uncommitted changes
      const status = await this.git.getStatus();
      if (!status.clean) {
        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'You have uncommitted changes. What would you like to do?',
          choices: [
            { name: 'Stash changes and switch', value: 'stash' },
            { name: 'Commit changes first', value: 'commit' },
            { name: 'Cancel', value: 'cancel' }
          ]
        }]);

        if (action === 'cancel') {
          return { success: false, reason: 'User cancelled' };
        }

        if (action === 'stash') {
          await this.git.stash(`Auto-stash before switching to ${branchName}`);
        } else if (action === 'commit') {
          await this.git.stageFiles(['.']);
          await this.git.commit('WIP: Auto-commit before branch switch');
        }
      }

      await this.git.checkoutBranch(branchName);
      return { success: true, branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Merge modification branch back to main
   * @param {string} branchName - Branch to merge
   * @param {Object} options - Merge options
   * @returns {Promise<Object>} Merge result
   */
  async mergeModificationBranch(branchName, options = {}) {
    try {
      // Switch to target branch
      const targetBranch = options.targetBranch || this.git.defaultBranch;
      await this.git.checkoutBranch(targetBranch);

      // Attempt merge
      const mergeResult = await this.git.mergeBranch(branchName, {
        message: options.message || `Merge modification branch '${branchName}'`,
        noFastForward: true
      });

      if (mergeResult.success) {
        // Optionally delete the branch after successful merge
        if (options.deleteBranch) {
          await this.deleteBranch(branchName);
        }
        
        return {
          success: true,
          message: 'Branch merged successfully',
          targetBranch
        };
      } else {
        return {
          success: false,
          conflicts: mergeResult.conflicts,
          message: 'Merge conflicts detected'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a modification branch
   * @param {string} branchName - Branch to delete
   * @param {boolean} force - Force delete even if not merged
   * @returns {Promise<Object>} Deletion result
   */
  async deleteBranch(branchName, force = false) {
    try {
      const flag = force ? '-D' : '-d';
      await this.git.execGit(`branch ${flag} ${branchName}`);
      
      console.log(chalk.green(`✅ Deleted branch: ${branchName}`));
      return { success: true };
    } catch (error) {
      if (error.message.includes('not fully merged')) {
        console.error(chalk.red('Branch not fully merged. Use force=true to delete anyway.'));
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old modification branches
   * @param {number} daysOld - Delete branches older than this many days
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupOldBranches(daysOld = 30) {
    const branches = await this.getModificationBranches();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const toDelete = branches.filter(branch => 
      branch.lastCommitDate < cutoffDate && 
      branch.name !== await this.git.getCurrentBranch()
    );

    if (toDelete.length === 0) {
      console.log(chalk.yellow('No old branches to clean up'));
      return { deleted: 0 };
    }

    console.log(chalk.blue(`Found ${toDelete.length} branches older than ${daysOld} days:`));
    toDelete.forEach(branch => {
      console.log(chalk.gray(`  - ${branch.name} (${branch.age})`));
    });

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Delete ${toDelete.length} old branches?`,
      default: false
    }]);

    if (!confirm) {
      return { deleted: 0, cancelled: true };
    }

    let deleted = 0;
    for (const branch of toDelete) {
      const result = await this.deleteBranch(branch.name, true);
      if (result.success) deleted++;
    }

    return { deleted, total: toDelete.length };
  }

  /**
   * Create a branch protection strategy
   * @param {string} branchName - Branch to protect
   * @returns {Promise<Object>} Protection result
   */
  async protectBranch(branchName) {
    // This would integrate with GitHub/GitLab API for real protection
    // For now, we'll track it locally
    const protectionFile = path.join(
      this.git.rootPath,
      '.git',
      'aios-branch-protection.json'
    );

    try {
      let protections = {};
      try {
        const content = await require('fs').promises.readFile(protectionFile, 'utf-8');
        protections = JSON.parse(content);
      } catch (_e) {
        // File doesn't exist yet
      }

      protections[branchName] = {
        protected: true,
        requiredReviews: 1,
        dismissStaleReviews: true,
        requireUpToDate: true,
        protectedAt: new Date().toISOString()
      };

      await require('fs').promises.writeFile(
        protectionFile,
        JSON.stringify(protections, null, 2)
      );

      console.log(chalk.green(`✅ Branch protection enabled for: ${branchName}`));
      return { success: true, protection: protections[branchName] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get branch comparison
   * @param {string} branch1 - First branch
   * @param {string} branch2 - Second branch (default: main)
   * @returns {Promise<Object>} Comparison result
   */
  async compareBranches(branch1, branch2 = null) {
    const targetBranch = branch2 || this.git.defaultBranch;
    
    try {
      // Get commits ahead/behind
      const ahead = await this.git.execGit(
        `rev-list --count ${targetBranch}..${branch1}`
      );
      const behind = await this.git.execGit(
        `rev-list --count ${branch1}..${targetBranch}`
      );

      // Get changed files
      const changedFiles = await this.git.getDiff({
        from: targetBranch,
        to: branch1,
        nameOnly: true
      });

      return {
        branch: branch1,
        compareTo: targetBranch,
        ahead: parseInt(ahead),
        behind: parseInt(behind),
        changedFiles: changedFiles.split('\n').filter(Boolean),
        canFastForward: parseInt(behind) === 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate age string from timestamp
   * @private
   */
  calculateAge(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'recently';
    }
  }

  /**
   * Create branch strategy for different modification types
   * @param {string} modificationType - Type of modification
   * @returns {Object} Branch strategy
   */
  getBranchStrategy(modificationType) {
    const strategies = {
      enhancement: {
        prefix: 'feature/',
        baseFrom: 'main',
        protectByDefault: false,
        autoMerge: false
      },
      bugfix: {
        prefix: 'fix/',
        baseFrom: 'main',
        protectByDefault: false,
        autoMerge: true
      },
      experiment: {
        prefix: 'experiment/',
        baseFrom: 'develop',
        protectByDefault: false,
        autoMerge: false
      },
      'self-modification': {
        prefix: 'self-mod/',
        baseFrom: 'main',
        protectByDefault: true,
        autoMerge: false,
        requireApproval: true
      }
    };

    return strategies[modificationType] || strategies.enhancement;
  }
}

module.exports = BranchManager;