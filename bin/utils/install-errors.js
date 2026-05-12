/**
 * Installation Error Messages - User-friendly error communication
 *
 * Provides classified error messages with recovery suggestions
 * for AIOX installer failures.
 *
 * @module bin/utils/install-errors
 * @see Story 1.9 - Error Handling & Rollback
 */

const chalk = require('chalk');
const { CRITICAL_ERRORS } = require('./install-transaction');

/**
 * Error classification taxonomy
 */
const ERROR_CLASSIFICATION = {
  CRITICAL: {
    level: 'CRITICAL',
    color: chalk.red.bold,
    icon: '❌',
  },
  RECOVERABLE: {
    level: 'RECOVERABLE',
    color: chalk.yellow,
    icon: '⚠️',
  },
  WARNING: {
    level: 'WARNING',
    color: chalk.yellow,
    icon: '⚡',
  },
};

/**
 * Error message templates with recovery suggestions
 */
const ERROR_MESSAGES = {
  // File system errors
  EACCES: {
    title: 'Permission Denied',
    description: 'Installation failed due to insufficient file system permissions.',
    recovery: [
      'Run the installer with administrator/sudo privileges',
      'Check file permissions for the installation directory',
      'Ensure you have write access to the project folder',
    ],
  },
  ENOSPC: {
    title: 'Disk Space Exhausted',
    description: 'Installation failed because the disk is full.',
    recovery: [
      'Free up disk space (at least 500MB recommended)',
      'Delete unnecessary files or move data to another drive',
      'Run the installer again after freeing space',
    ],
  },
  EROFS: {
    title: 'Read-Only File System',
    description: 'Installation failed because the file system is read-only.',
    recovery: [
      'Ensure you are not installing to a read-only volume',
      'Check file system mount options',
      'Choose a different installation directory with write access',
    ],
  },
  ENOTDIR: {
    title: 'Invalid Directory',
    description: 'Installation failed because the path is not a directory.',
    recovery: [
      'Verify the installation path is a valid directory',
      'Remove any files with conflicting names',
      'Create the target directory manually before running installer',
    ],
  },

  // Network errors
  NETWORK_TIMEOUT: {
    title: 'Network Timeout',
    description: 'Installation failed due to network connection timeout.',
    recovery: [
      'Check your internet connection',
      'Try again in a few moments',
      'Use a wired connection if possible',
      'Check if npm registry is accessible: npm config get registry',
    ],
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    description: 'Installation failed due to network connectivity issues.',
    recovery: [
      'Verify internet connection is active',
      'Check firewall/proxy settings',
      'Try using a different network',
    ],
  },

  // Package errors
  DEPENDENCY_FAILED: {
    title: 'Dependency Installation Failed',
    description: 'One or more npm dependencies failed to install.',
    recovery: [
      'Clear npm cache: npm cache clean --force',
      'Delete node_modules and package-lock.json',
      'Run: npm install manually',
      'Check npm version compatibility: npm --version',
    ],
  },
  PACKAGE_CORRUPTION: {
    title: 'Package Corruption',
    description: 'Installation failed due to corrupted package files.',
    recovery: [
      'Clear npm cache: npm cache clean --force',
      'Verify package integrity with npm audit',
      'Try installing with --force flag',
    ],
  },

  // Configuration errors
  CONFIG_PARSE_ERROR: {
    title: 'Configuration Parse Error',
    description: 'Installation failed due to invalid configuration file syntax.',
    recovery: [
      'Check YAML/JSON syntax in configuration files',
      'Validate config files with a linter',
      'Restore default configuration and retry',
    ],
  },
  CONFIG_WRITE_ERROR: {
    title: 'Configuration Write Failed',
    description: 'Installation failed while writing configuration files.',
    recovery: [
      'Check write permissions for config directories',
      'Ensure config directory exists',
      'Check disk space availability',
    ],
  },

  // Git errors
  GIT_CORRUPTION: {
    title: 'Git Repository Corruption',
    description: 'Installation detected git repository corruption.',
    recovery: [
      'Run: git fsck to check repository integrity',
      'Restore from backup if available',
      'Re-initialize git repository: git init (warning: loses history)',
    ],
  },
  GIT_CONFLICT: {
    title: 'Git Conflict Detected',
    description: 'Installation failed due to uncommitted changes or conflicts.',
    recovery: [
      'Commit or stash your changes: git stash',
      'Resolve any merge conflicts',
      'Run installer in a clean git state',
    ],
  },

  // Generic errors
  UNKNOWN_ERROR: {
    title: 'Unknown Installation Error',
    description: 'Installation failed due to an unexpected error.',
    recovery: [
      'Check the installation log: .aiox-install.log',
      'Review error details in the log file',
      'Report the issue if problem persists',
      'Try running installer again',
    ],
  },
};

/**
 * Format error message with classification, description, and recovery steps
 *
 * @param {Error} error - Error object
 * @param {string} [errorCode] - Error code (e.g., 'EACCES', 'NETWORK_TIMEOUT')
 * @returns {string} Formatted error message
 *
 * @example
 * const message = formatErrorMessage(error, 'EACCES');
 * console.error(message);
 */
function formatErrorMessage(error, errorCode = null) {
  const code = errorCode || error.code || 'UNKNOWN_ERROR';
  const template = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  // Derive classification from error code instead of hardcoding CRITICAL
  const classification = getErrorClassification(code);

  const lines = [];
  lines.push('');
  lines.push(classification.color('═══════════════════════════════════════════════════════'));
  lines.push(classification.color(`${classification.icon}  ${template.title}`));
  lines.push(classification.color('═══════════════════════════════════════════════════════'));
  lines.push('');
  lines.push(chalk.white(template.description));
  lines.push('');

  if (template.recovery && template.recovery.length > 0) {
    lines.push(chalk.cyan.bold('Recovery Steps:'));
    template.recovery.forEach((step, index) => {
      lines.push(chalk.cyan(`  ${index + 1}. ${step}`));
    });
    lines.push('');
  }

  lines.push(chalk.gray('Error Details:'));
  lines.push(chalk.gray(`  Code: ${code}`));
  if (error.message && !error.message.includes(template.title)) {
    // Only show technical message if it adds new info
    lines.push(chalk.gray(`  Message: ${error.message}`));
  }
  lines.push('');
  lines.push(chalk.gray('Installation log: .aiox-install.log'));
  lines.push('');

  return lines.join('\n');
}

/**
 * Format rollback message
 *
 * @param {boolean} success - Whether rollback succeeded
 * @param {string[]} [failedFiles] - List of files that failed to restore
 * @returns {string} Formatted rollback message
 */
function formatRollbackMessage(success, failedFiles = []) {
  const lines = [];
  lines.push('');

  if (success) {
    lines.push(chalk.green('═══════════════════════════════════════════════════════'));
    lines.push(chalk.green('✅  Rollback Completed Successfully'));
    lines.push(chalk.green('═══════════════════════════════════════════════════════'));
    lines.push('');
    lines.push(chalk.white('Your system has been restored to its previous state.'));
    lines.push(chalk.white('No files were modified.'));
  } else {
    lines.push(chalk.red('═══════════════════════════════════════════════════════'));
    lines.push(chalk.red('⚠️  Rollback Completed with Errors'));
    lines.push(chalk.red('═══════════════════════════════════════════════════════'));
    lines.push('');
    lines.push(chalk.yellow('Some files could not be restored automatically.'));
    lines.push('');
    lines.push(chalk.yellow.bold('Manual Recovery Required:'));

    if (failedFiles.length > 0) {
      failedFiles.forEach((file) => {
        lines.push(chalk.yellow(`  - ${file}`));
      });
    }

    lines.push('');
    lines.push(chalk.cyan('Recovery Steps:'));
    lines.push(chalk.cyan('  1. Check backup directory: .aiox-backup/'));
    lines.push(chalk.cyan('  2. Manually restore failed files from backups'));
    lines.push(chalk.cyan('  3. Review installation log: .aiox-install.log'));
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format success message (installation complete)
 *
 * @returns {string} Formatted success message
 */
function formatSuccessMessage() {
  const lines = [];
  lines.push('');
  lines.push(chalk.green('═══════════════════════════════════════════════════════'));
  lines.push(chalk.green('✅  Installation Completed Successfully'));
  lines.push(chalk.green('═══════════════════════════════════════════════════════'));
  lines.push('');
  lines.push(chalk.white('AIOX has been installed and configured.'));
  lines.push('');
  lines.push(chalk.cyan.bold('Next Steps:'));
  lines.push(chalk.cyan('  1. Review installation log: .aiox-install.log'));
  lines.push(chalk.cyan('  2. Verify configuration: aiox config --check'));
  lines.push(chalk.cyan('  3. Run validation: aiox validate'));
  lines.push('');
  return lines.join('\n');
}

/**
 * Sanitize error for user display
 * Removes stack traces and technical details
 *
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message (single line)
 */
function sanitizeErrorForUser(error) {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Extract just the message, no stack trace
  const message = error.message || error.toString();

  // Remove file paths from error messages
  const sanitized = message.replace(/(?:at\s+)?(?:[A-Z]:\\|\/)[^\s:]+:\d+:\d+/g, '[file]');

  // Remove stack trace lines
  const firstLine = sanitized.split('\n')[0];

  return firstLine;
}

/**
 * Get error classification for an error
 *
 * @param {string} errorCode - Error code
 * @returns {Object} Classification object {level, color, icon}
 */
function getErrorClassification(errorCode) {
  // Use shared CRITICAL_ERRORS constant from install-transaction.js
  const additionalCriticalCodes = ['GIT_CORRUPTION'];
  const recoverableCodes = ['NETWORK_TIMEOUT', 'NETWORK_ERROR', 'DEPENDENCY_FAILED'];

  if (CRITICAL_ERRORS.includes(errorCode) || additionalCriticalCodes.includes(errorCode)) {
    return ERROR_CLASSIFICATION.CRITICAL;
  }

  if (recoverableCodes.includes(errorCode)) {
    return ERROR_CLASSIFICATION.RECOVERABLE;
  }

  return ERROR_CLASSIFICATION.WARNING;
}

module.exports = {
  ERROR_CLASSIFICATION,
  ERROR_MESSAGES,
  formatErrorMessage,
  formatRollbackMessage,
  formatSuccessMessage,
  sanitizeErrorForUser,
  getErrorClassification,
};
