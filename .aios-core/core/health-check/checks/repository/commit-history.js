/**
 * Commit History Check
 *
 * Verifies commit history quality and patterns.
 *
 * @module aios-core/health-check/checks/repository/commit-history
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Conventional commit prefixes
 */
const COMMIT_PREFIXES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'build',
  'ci',
  'perf',
];

/**
 * Commit history check
 *
 * @class CommitHistoryCheck
 * @extends BaseCheck
 */
class CommitHistoryCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.commit-history',
      name: 'Commit History',
      description: 'Verifies commit history quality',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.INFO,
      timeout: 5000,
      cacheable: true,
      healingTier: 0,
      tags: ['git', 'commits', 'quality'],
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
      // Get recent commits
      const logOutput = execSync('git log --oneline -50', {
        cwd: projectRoot,
        encoding: 'utf8',
        windowsHide: true,
      });

      const commits = logOutput
        .trim()
        .split('\n')
        .filter((l) => l);

      if (commits.length === 0) {
        return this.pass('No commits yet', {
          details: { commitCount: 0 },
        });
      }

      // Analyze commit messages
      let conventionalCount = 0;
      let shortMessages = 0;
      let longMessages = 0;

      for (const commit of commits) {
        const message = commit.substring(8); // Skip hash

        // Check for conventional commit format
        const isConventional = COMMIT_PREFIXES.some(
          (prefix) =>
            message.toLowerCase().startsWith(`${prefix}:`) ||
            message.toLowerCase().startsWith(`${prefix}(`),
        );

        if (isConventional) conventionalCount++;

        // Check message length
        if (message.length < 10) shortMessages++;
        if (message.length > 72) longMessages++;
      }

      const conventionalPercent = Math.round((conventionalCount / commits.length) * 100);

      const details = {
        analyzed: commits.length,
        conventional: conventionalCount,
        conventionalPercent: `${conventionalPercent}%`,
        shortMessages,
        longMessages,
        recentCommits: commits.slice(0, 5).map((c) => c.substring(0, 50)),
      };

      // Warnings for poor commit hygiene
      const issues = [];

      if (conventionalPercent < 50 && commits.length > 5) {
        issues.push('Low conventional commit usage');
      }

      if (shortMessages > commits.length * 0.3) {
        issues.push('Many commits have very short messages');
      }

      if (issues.length > 0) {
        return this.warning(`Commit history could be improved: ${issues.join(', ')}`, {
          recommendation:
            'Use conventional commits (feat:, fix:, docs:, etc.) for better changelogs',
          details,
        });
      }

      return this.pass(`Commit history healthy (${conventionalPercent}% conventional)`, {
        details,
      });
    } catch (error) {
      if (error.message.includes('does not have any commits')) {
        return this.pass('No commits yet', { details: { commitCount: 0 } });
      }
      return this.error(`Commit history check failed: ${error.message}`, error);
    }
  }
}

module.exports = CommitHistoryCheck;
