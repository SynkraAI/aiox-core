/**
 * Gitignore Check
 *
 * Verifies .gitignore has required patterns.
 *
 * @module aios-core/health-check/checks/repository/gitignore
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Required gitignore patterns
 */
const REQUIRED_PATTERNS = ['node_modules', '.env'];

/**
 * Recommended patterns
 */
const RECOMMENDED_PATTERNS = ['.env.local', '.DS_Store', '*.log', 'dist', 'coverage'];

/**
 * Gitignore check
 *
 * @class GitignoreCheck
 * @extends BaseCheck
 */
class GitignoreCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.gitignore',
      name: 'Gitignore Configuration',
      description: 'Verifies .gitignore has required patterns',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.MEDIUM,
      timeout: 2000,
      cacheable: true,
      healingTier: 1, // Can auto-add missing patterns
      tags: ['git', 'gitignore', 'security'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const gitignorePath = path.join(projectRoot, '.gitignore');

    try {
      let content;
      try {
        content = await fs.readFile(gitignorePath, 'utf8');
      } catch (error) {
        if (error.code === 'ENOENT') {
          return this.fail('.gitignore not found', {
            recommendation: 'Create a .gitignore file with standard patterns',
            healable: true,
            healingTier: 1,
          });
        }
        throw error;
      }

      const lines = content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
      const patterns = new Set(lines);

      const missingRequired = [];
      const missingRecommended = [];

      // Check required patterns
      for (const pattern of REQUIRED_PATTERNS) {
        if (!this.hasPattern(patterns, pattern)) {
          missingRequired.push(pattern);
        }
      }

      // Check recommended patterns
      for (const pattern of RECOMMENDED_PATTERNS) {
        if (!this.hasPattern(patterns, pattern)) {
          missingRecommended.push(pattern);
        }
      }

      const details = {
        patterns: lines.length,
        missingRequired,
        missingRecommended,
      };

      // Missing required is a failure
      if (missingRequired.length > 0) {
        return this.fail(`Missing required gitignore patterns: ${missingRequired.join(', ')}`, {
          recommendation: `Add missing patterns to .gitignore: ${missingRequired.join(', ')}`,
          healable: true,
          healingTier: 1,
          details,
        });
      }

      // Missing recommended is a warning
      if (missingRecommended.length > 0) {
        return this.warning(
          `Missing recommended gitignore patterns: ${missingRecommended.join(', ')}`,
          {
            recommendation: 'Consider adding recommended patterns to .gitignore',
            healable: true,
            healingTier: 1,
            details,
          },
        );
      }

      return this.pass(`.gitignore configured with ${lines.length} patterns`, {
        details,
      });
    } catch (error) {
      return this.error(`Gitignore check failed: ${error.message}`, error);
    }
  }

  /**
   * Check if patterns set has a pattern (supports wildcards)
   * @private
   */
  hasPattern(patterns, target) {
    // Direct match
    if (patterns.has(target)) return true;
    if (patterns.has(`/${target}`)) return true;
    if (patterns.has(`${target}/`)) return true;

    // Check for glob patterns that would match
    for (const pattern of patterns) {
      // node_modules/ matches node_modules
      if (pattern === `${target}/`) return true;

      // **/node_modules matches node_modules
      if (pattern === `**/${target}`) return true;
    }

    return false;
  }

  /**
   * Get healer
   */
  getHealer() {
    return {
      name: 'add-gitignore-patterns',
      action: 'update-gitignore',
      successMessage: 'Added missing patterns to .gitignore',
      targetFile: '.gitignore',
      fix: async (_result) => {
        const projectRoot = process.cwd();
        const gitignorePath = path.join(projectRoot, '.gitignore');

        let content = '';
        try {
          content = await fs.readFile(gitignorePath, 'utf8');
        } catch {
          // File doesn't exist
        }

        const missing = [...REQUIRED_PATTERNS, ...RECOMMENDED_PATTERNS];
        const toAdd = missing.filter((p) => !content.includes(p));

        if (toAdd.length > 0) {
          const newContent =
            content +
            (content.endsWith('\n') ? '' : '\n') +
            '# Added by AIOS Health Check\n' +
            toAdd.join('\n') +
            '\n';

          await fs.writeFile(gitignorePath, newContent);
        }

        return { success: true, message: `Added ${toAdd.length} patterns` };
      },
    };
  }
}

module.exports = GitignoreCheck;
