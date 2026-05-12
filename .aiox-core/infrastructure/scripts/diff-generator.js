/**
 * @fileoverview Diff Generator
 *
 * Generates diffs between file versions for commit messages and change tracking.
 * Used by CommitMessageGenerator for analyzing modifications.
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Generates diff information for files and commits
 */
class DiffGenerator {
  constructor(options = {}) {
    this.maxDiffLines = options.maxDiffLines || 100;
    this.contextLines = options.contextLines || 3;
  }

  /**
   * Get diff for staged changes
   * @returns {string} Diff output
   */
  getStagedDiff() {
    try {
      return execSync('git diff --cached', { encoding: 'utf-8' });
    } catch (error) {
      return '';
    }
  }

  /**
   * Get diff for unstaged changes
   * @returns {string} Diff output
   */
  getUnstagedDiff() {
    try {
      return execSync('git diff', { encoding: 'utf-8' });
    } catch (error) {
      return '';
    }
  }

  /**
   * Get diff between two commits
   * @param {string} fromCommit - Starting commit
   * @param {string} toCommit - Ending commit
   * @returns {string} Diff output
   */
  getCommitDiff(fromCommit, toCommit = 'HEAD') {
    try {
      return execSync(`git diff ${fromCommit} ${toCommit}`, { encoding: 'utf-8' });
    } catch (error) {
      return '';
    }
  }

  /**
   * Get list of changed files
   * @param {boolean} staged - Whether to get staged files only
   * @returns {Array<Object>} List of changed files with status
   */
  getChangedFiles(staged = false) {
    try {
      const cmd = staged ? 'git diff --cached --name-status' : 'git diff --name-status';
      const output = execSync(cmd, { encoding: 'utf-8' });

      return output.trim().split('\n')
        .filter(line => line)
        .map(line => {
          const [status, ...fileParts] = line.split('\t');
          const filePath = fileParts.join('\t');
          return {
            status: this._parseStatus(status),
            path: filePath,
          };
        });
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse git status code to human-readable status
   * @private
   */
  _parseStatus(code) {
    const statusMap = {
      'A': 'added',
      'M': 'modified',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied',
    };
    return statusMap[code] || 'unknown';
  }

  /**
   * Analyze diff and return summary
   * @param {string} diff - Diff content
   * @returns {Object} Diff summary
   */
  analyzeDiff(diff) {
    const lines = diff.split('\n');
    let additions = 0;
    let deletions = 0;
    const files = new Set();

    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---')) {
        const match = line.match(/^[+-]{3} [ab]\/(.+)$/);
        if (match) files.add(match[1]);
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;
      }
    }

    return {
      files: Array.from(files),
      additions,
      deletions,
      total: additions + deletions,
    };
  }
}

module.exports = DiffGenerator;
