/**
 * Git Status Check
 *
 * Verifies working directory status and uncommitted changes.
 *
 * @module aios-core/health-check/checks/repository/git-status
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Git status check
 *
 * @class GitStatusCheck
 * @extends BaseCheck
 */
class GitStatusCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.git-status',
      name: 'Git Status',
      description: 'Checks for uncommitted changes and working directory status',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.LOW,
      timeout: 5000,
      cacheable: false, // Status changes frequently
      healingTier: 0,
      tags: ['git', 'status'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();

    try {
      // Get status
      const status = execSync('git status --porcelain', {
        cwd: projectRoot,
        encoding: 'utf8',
        windowsHide: true,
      });

      const lines = status
        .trim()
        .split('\n')
        .filter((l) => l);
      const staged = [];
      const modified = [];
      const untracked = [];

      for (const line of lines) {
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const file = line.substring(3);

        if (indexStatus === '?') {
          untracked.push(file);
        } else if (indexStatus !== ' ') {
          staged.push(file);
        }

        if (workTreeStatus === 'M' || workTreeStatus === 'D') {
          modified.push(file);
        }
      }

      const details = {
        staged: staged.length,
        modified: modified.length,
        untracked: untracked.length,
        total: lines.length,
      };

      // Check if ahead/behind remote
      let aheadBehind = { ahead: 0, behind: 0 };
      try {
        const revList = execSync('git rev-list --left-right --count HEAD...@{u}', {
          cwd: projectRoot,
          encoding: 'utf8',
          windowsHide: true,
        }).trim();

        const [ahead, behind] = revList.split('\t').map(Number);
        aheadBehind = { ahead, behind };
        details.ahead = ahead;
        details.behind = behind;
      } catch {
        // No upstream configured
      }

      // Clean working directory
      if (lines.length === 0) {
        if (aheadBehind.ahead > 0) {
          return this.warning(
            `Working directory clean, ${aheadBehind.ahead} commit(s) ahead of remote`,
            {
              recommendation: 'Consider pushing your commits',
              details,
            },
          );
        }

        if (aheadBehind.behind > 0) {
          return this.warning(
            `Working directory clean, ${aheadBehind.behind} commit(s) behind remote`,
            {
              recommendation: 'Consider pulling latest changes',
              details,
            },
          );
        }

        return this.pass('Working directory clean and in sync', { details });
      }

      // Has changes
      const parts = [];
      if (staged.length > 0) parts.push(`${staged.length} staged`);
      if (modified.length > 0) parts.push(`${modified.length} modified`);
      if (untracked.length > 0) parts.push(`${untracked.length} untracked`);

      return this.warning(`Working directory has changes: ${parts.join(', ')}`, {
        recommendation: 'Commit or stash changes before major operations',
        details: {
          ...details,
          files: {
            staged: staged.slice(0, 5),
            modified: modified.slice(0, 5),
            untracked: untracked.slice(0, 5),
          },
        },
      });
    } catch (error) {
      return this.error(`Git status check failed: ${error.message}`, error);
    }
  }
}

module.exports = GitStatusCheck;
