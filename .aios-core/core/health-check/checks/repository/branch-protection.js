/**
 * Branch Protection Check
 *
 * Verifies branch protection best practices.
 *
 * @module aios-core/health-check/checks/repository/branch-protection
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Protected branch names
 */
const PROTECTED_BRANCHES = ['main', 'master', 'develop', 'production'];

/**
 * Branch protection check
 *
 * @class BranchProtectionCheck
 * @extends BaseCheck
 */
class BranchProtectionCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.branch-protection',
      name: 'Branch Protection',
      description: 'Verifies branch protection best practices',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.LOW,
      timeout: 3000,
      cacheable: true,
      healingTier: 0,
      tags: ['git', 'branches', 'protection'],
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
      // Get current branch
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: projectRoot,
        encoding: 'utf8',
        windowsHide: true,
      }).trim();

      // Get all branches
      const branchOutput = execSync('git branch -a', {
        cwd: projectRoot,
        encoding: 'utf8',
        windowsHide: true,
      });

      const branches = branchOutput
        .split('\n')
        .map((b) => b.replace(/^\*?\s+/, '').trim())
        .filter((b) => b && !b.includes('->'));

      const localBranches = branches.filter((b) => !b.startsWith('remotes/'));
      const mainBranch = localBranches.find((b) => PROTECTED_BRANCHES.includes(b));

      const details = {
        currentBranch,
        mainBranch: mainBranch || 'none',
        localBranches: localBranches.length,
        totalBranches: branches.length,
      };

      // Check if on protected branch
      const onProtectedBranch = PROTECTED_BRANCHES.includes(currentBranch);

      if (onProtectedBranch) {
        return this.warning(`Currently on protected branch '${currentBranch}'`, {
          recommendation: 'Consider creating a feature branch for development',
          details,
        });
      }

      // Check if main branch exists
      if (!mainBranch) {
        return this.warning('No standard main branch found (main/master/develop)', {
          recommendation: 'Create a main branch for your primary development',
          details,
        });
      }

      return this.pass(`Working on branch '${currentBranch}', main branch is '${mainBranch}'`, {
        details,
      });
    } catch (error) {
      return this.error(`Branch check failed: ${error.message}`, error);
    }
  }
}

module.exports = BranchProtectionCheck;
