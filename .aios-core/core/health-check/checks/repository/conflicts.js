/**
 * Conflicts Check
 *
 * Checks for merge conflicts in the repository.
 *
 * @module aios-core/health-check/checks/repository/conflicts
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Conflict markers
 */
const _CONFLICT_MARKERS = ['<<<<<<<', '=======', '>>>>>>>'];

/**
 * Conflicts check
 *
 * @class ConflictsCheck
 * @extends BaseCheck
 */
class ConflictsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.conflicts',
      name: 'Merge Conflicts',
      description: 'Checks for unresolved merge conflicts',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.CRITICAL,
      timeout: 10000,
      cacheable: false,
      healingTier: 3, // Manual resolution required
      tags: ['git', 'conflicts', 'merge'],
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
      // Check for conflict markers using git grep
      let conflictFiles = [];

      try {
        const output = execSync(
          'git grep -l "^<<<<<<<" -- "*.js" "*.ts" "*.json" "*.yaml" "*.yml" "*.md"',
          {
            cwd: projectRoot,
            encoding: 'utf8',
            windowsHide: true,
          },
        );

        conflictFiles = output
          .trim()
          .split('\n')
          .filter((f) => f);
      } catch {
        // git grep returns non-zero if no matches, which is good
      }

      // Also check if in middle of a merge
      let inMerge = false;
      try {
        execSync('git merge HEAD 2>&1', {
          cwd: projectRoot,
          encoding: 'utf8',
          windowsHide: true,
        });
      } catch (error) {
        if (error.message.includes('You have not concluded your merge')) {
          inMerge = true;
        }
      }

      // Check for MERGE_HEAD
      try {
        execSync('git rev-parse MERGE_HEAD', {
          cwd: projectRoot,
          encoding: 'utf8',
          windowsHide: true,
        });
        inMerge = true;
      } catch {
        // No MERGE_HEAD means not in merge
      }

      const details = {
        conflictFiles: conflictFiles.length,
        inMerge,
      };

      if (conflictFiles.length > 0) {
        return this.fail(`Found ${conflictFiles.length} file(s) with merge conflicts`, {
          recommendation: 'Resolve merge conflicts before continuing',
          healable: false,
          healingTier: 3,
          details: {
            ...details,
            files: conflictFiles.slice(0, 10),
          },
        });
      }

      if (inMerge) {
        return this.fail('Repository is in the middle of a merge', {
          recommendation: 'Complete or abort the merge (git merge --abort)',
          healable: false,
          healingTier: 3,
          details,
        });
      }

      return this.pass('No merge conflicts found', { details });
    } catch (error) {
      return this.error(`Conflict check failed: ${error.message}`, error);
    }
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'resolve-conflicts-guide',
      action: 'manual',
      manualGuide: 'Resolve merge conflicts',
      steps: [
        'Open each conflicted file in your editor',
        'Look for conflict markers: <<<<<<<, =======, >>>>>>>',
        'Choose which changes to keep and remove markers',
        'Stage resolved files: git add <filename>',
        'Complete the merge: git commit',
        'Or abort: git merge --abort',
      ],
      documentation:
        'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts',
    };
  }
}

module.exports = ConflictsCheck;
