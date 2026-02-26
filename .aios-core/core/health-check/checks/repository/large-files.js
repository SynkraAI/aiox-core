/**
 * Large Files Check
 *
 * Checks for large files that shouldn't be in git.
 *
 * @module aios-core/health-check/checks/repository/large-files
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Size threshold for warnings (5MB)
 */
const WARNING_SIZE_MB = 5;

/**
 * Size threshold for errors (50MB)
 */
const ERROR_SIZE_MB = 50;

/**
 * Large files check
 *
 * @class LargeFilesCheck
 * @extends BaseCheck
 */
class LargeFilesCheck extends BaseCheck {
  constructor() {
    super({
      id: 'repository.large-files',
      name: 'Large Files',
      description: 'Checks for large files in the repository',
      domain: CheckDomain.REPOSITORY,
      severity: CheckSeverity.MEDIUM,
      timeout: 30000,
      cacheable: true,
      healingTier: 3, // Manual - needs git-lfs or removal
      tags: ['git', 'files', 'size'],
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
      // Find large tracked files
      const largeFiles = [];

      try {
        // Get all tracked files with sizes
        const output = execSync('git ls-files -z', {
          cwd: projectRoot,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          windowsHide: true,
        });

        const files = output.split('\0').filter((f) => f);

        // Check sizes (batch for performance)
        for (const file of files.slice(0, 1000)) {
          // Limit to first 1000 files
          try {
            const _sizeOutput = execSync(`git ls-files -s "${file}"`, {
              cwd: projectRoot,
              encoding: 'utf8',
              windowsHide: true,
            });

            // Get actual file size from working tree
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(projectRoot, file);

            try {
              const stats = fs.statSync(filePath);
              const sizeMB = stats.size / (1024 * 1024);

              if (sizeMB >= WARNING_SIZE_MB) {
                largeFiles.push({
                  path: file,
                  size: sizeMB,
                  sizeFormatted: this.formatSize(stats.size),
                });
              }
            } catch {
              // File might not exist in working tree
            }
          } catch {
            // Skip files that can't be checked
          }
        }
      } catch {
        // Git command failed, skip
      }

      // Sort by size descending
      largeFiles.sort((a, b) => b.size - a.size);

      const details = {
        largeFiles: largeFiles.length,
        threshold: `${WARNING_SIZE_MB} MB`,
      };

      // Check for very large files
      const veryLarge = largeFiles.filter((f) => f.size >= ERROR_SIZE_MB);
      const justLarge = largeFiles.filter((f) => f.size < ERROR_SIZE_MB);

      if (veryLarge.length > 0) {
        return this.fail(
          `Found ${veryLarge.length} very large file(s) (>${ERROR_SIZE_MB}MB) in repository`,
          {
            recommendation: 'Consider using Git LFS for large files or removing them',
            healable: false,
            healingTier: 3,
            details: {
              ...details,
              veryLarge: veryLarge.slice(0, 5),
              large: justLarge.slice(0, 5),
            },
          },
        );
      }

      if (largeFiles.length > 0) {
        return this.warning(`Found ${largeFiles.length} large file(s) (>${WARNING_SIZE_MB}MB)`, {
          recommendation: 'Review if large files should be tracked by Git LFS',
          details: {
            ...details,
            files: largeFiles.slice(0, 10),
          },
        });
      }

      return this.pass('No unusually large files found', { details });
    } catch (error) {
      return this.error(`Large files check failed: ${error.message}`, error);
    }
  }

  /**
   * Format file size
   * @private
   */
  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'large-files-guide',
      action: 'manual',
      manualGuide: 'Handle large files in Git',
      steps: [
        'Install Git LFS: git lfs install',
        'Track large file types: git lfs track "*.zip" "*.tar.gz"',
        'Add .gitattributes to git',
        'Or remove large files from history: git filter-repo --path <file> --invert-paths',
        'Force push if needed (coordinate with team)',
      ],
      documentation: 'https://git-lfs.com/',
      warning: 'Removing files from history rewrites history - coordinate with your team',
    };
  }
}

module.exports = LargeFilesCheck;
