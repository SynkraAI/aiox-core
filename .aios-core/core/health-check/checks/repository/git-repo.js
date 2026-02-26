/**
 * Git Repository Check
 *
 * Verifies the project is a valid Git repository.
 *
 * @module aios-core/health-check/checks/repository/git-repo
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Git repository check
 *
 * @class GitRepoCheck
 * @extends BaseCheck
 */
class GitRepoCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.git-repo',
      name: 'Git Repository',
      description: 'Verifies project is a valid Git repository',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.CRITICAL,
      timeout: 3000,
      cacheable: true,
      healingTier: 2, // Can initialize with confirmation
      tags: ['git', 'repository'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const gitDir = path.join(projectRoot, '.git');

    try {
      // Check if .git exists
      const stats = await fs.stat(gitDir);
      if (!stats.isDirectory()) {
        return this.fail('.git exists but is not a directory');
      }

      // Verify it's a valid git repo
      execSync('git rev-parse --git-dir', {
        cwd: projectRoot,
        encoding: 'utf8',
        windowsHide: true,
      });

      // Get repository info
      let branch = 'unknown';
      let remoteUrl = 'none';
      let commitCount = 0;

      try {
        branch = execSync('git rev-parse --abbrev-ref HEAD', {
          cwd: projectRoot,
          encoding: 'utf8',
          windowsHide: true,
        }).trim();
      } catch {
        // May fail if no commits yet
      }

      try {
        remoteUrl = execSync('git remote get-url origin', {
          cwd: projectRoot,
          encoding: 'utf8',
          windowsHide: true,
        }).trim();
      } catch {
        // No remote configured
      }

      try {
        const countOutput = execSync('git rev-list --count HEAD', {
          cwd: projectRoot,
          encoding: 'utf8',
          windowsHide: true,
        });
        commitCount = parseInt(countOutput.trim(), 10);
      } catch {
        // May fail if no commits
      }

      const details = {
        branch,
        remote: remoteUrl !== 'none' ? this.sanitizeUrl(remoteUrl) : 'none',
        commits: commitCount,
      };

      if (remoteUrl === 'none') {
        return this.warning('Git repository has no remote configured', {
          recommendation: 'Add a remote with: git remote add origin <url>',
          details,
        });
      }

      if (commitCount === 0) {
        return this.warning('Git repository has no commits', {
          recommendation: 'Make your first commit',
          details,
        });
      }

      return this.pass(`Valid Git repository on branch ${branch}`, { details });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.fail('Not a Git repository', {
          recommendation: 'Initialize with: git init',
          healable: true,
          healingTier: 2,
        });
      }

      return this.error(`Git check failed: ${error.message}`, error);
    }
  }

  /**
   * Sanitize remote URL (remove credentials)
   * @private
   */
  sanitizeUrl(url) {
    return url.replace(/\/\/[^@]+@/, '//');
  }

  /**
   * Get healer
   */
  getHealer() {
    return {
      name: 'git-init',
      action: 'initialize-git',
      promptMessage: 'Initialize Git repository?',
      promptQuestion: 'Initialize a new Git repository in this directory?',
      promptDescription: 'This will run git init and create a .git directory',
      risk: 'low',
      fix: async () => {
        execSync('git init', { cwd: process.cwd(), windowsHide: true });
        return { success: true, message: 'Git repository initialized' };
      },
    };
  }
}

module.exports = GitRepoCheck;
