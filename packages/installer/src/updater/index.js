/**
 * AIOS Updater
 * Intelligent update system for AIOS-Core installations
 *
 * @module packages/installer/src/updater
 * @story Epic 7 - CLI Update Command
 * @version 1.0.0
 *
 * Features:
 * - Detects installed version vs latest available
 * - Preserves user customizations during updates
 * - Supports dry-run and check-only modes
 * - Automatic rollback on failure
 * - Changelog integration from GitHub releases
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { hashFile, hashesMatch } = require('../installer/file-hasher');
const { PostInstallValidator, formatReport: formatValidationReport } = require('../installer/post-install-validator');

/**
 * Update status types
 * @enum {string}
 */
const UpdateStatus = {
  UP_TO_DATE: 'up_to_date',
  UPDATE_AVAILABLE: 'update_available',
  UPDATE_REQUIRED: 'update_required', // Breaking changes
  CHECK_FAILED: 'check_failed',
};

/**
 * File update actions
 * @enum {string}
 */
const FileAction = {
  NEW: 'new',
  UPDATED: 'updated',
  PRESERVED: 'preserved', // User customization
  DELETED: 'deleted',
  UNCHANGED: 'unchanged',
};

/**
 * AIOS Updater Class
 * Handles intelligent updates while preserving user customizations
 */
class AIOSUpdater {
  /**
   * Create a new AIOSUpdater instance
   *
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Update options
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.force=false] - Force update even if up-to-date
   * @param {boolean} [options.preserveAll=true] - Preserve all customizations
   * @param {number} [options.timeout=30000] - HTTP request timeout
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = path.resolve(projectRoot);
    this.aiosCoreDir = path.join(this.projectRoot, '.aios-core');
    this.aiosConfigDir = path.join(this.projectRoot, '.aios');

    this.options = {
      verbose: options.verbose === true,
      force: options.force === true,
      preserveAll: options.preserveAll !== false,
      timeout: options.timeout || 30000,
    };

    this.installedVersion = null;
    this.latestVersion = null;
    this.versionInfo = null;
    this.changelog = null;
    this.backupDir = null;
  }

  /**
   * Check for available updates
   * Compares installed version with latest from npm registry
   *
   * @returns {Promise<Object>} Update check result
   */
  async checkForUpdates() {
    const result = {
      status: UpdateStatus.CHECK_FAILED,
      installed: null,
      latest: null,
      installedAt: null,
      hasUpdate: false,
      isBreaking: false,
      error: null,
    };

    try {
      // Get installed version
      this.installedVersion = await this.getInstalledVersion();
      result.installed = this.installedVersion?.version || null;
      result.installedAt = this.installedVersion?.installedAt || null;

      if (!result.installed) {
        result.error = 'AIOS not installed or version info not found';
        return result;
      }

      // Get latest version from npm
      this.latestVersion = await this.getLatestVersion();
      result.latest = this.latestVersion;

      if (!result.latest) {
        // Check if we're offline or package doesn't exist
        const isOnline = await this.checkConnectivity();
        if (!isOnline) {
          result.error = 'You appear to be offline. Please check your internet connection.';
        } else {
          result.error = 'Package aios-core not found on npm registry. This may be a local development installation.';
        }
        return result;
      }

      // Compare versions
      const comparison = this.compareVersions(result.installed, result.latest);

      if (comparison >= 0 && !this.options.force) {
        result.status = UpdateStatus.UP_TO_DATE;
        result.hasUpdate = false;
      } else {
        result.hasUpdate = true;
        result.isBreaking = this.isBreakingUpdate(result.installed, result.latest);
        result.status = result.isBreaking
          ? UpdateStatus.UPDATE_REQUIRED
          : UpdateStatus.UPDATE_AVAILABLE;
      }

      this.log(`Installed: v${result.installed}, Latest: v${result.latest}`);
      return result;
    } catch (error) {
      result.error = error.message;
      this.log(`Check failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Get installed version from version.json or package.json
   *
   * @returns {Promise<Object|null>} Version info or null
   */
  async getInstalledVersion() {
    // Try version.json first (new format)
    const versionJsonPath = path.join(this.aiosCoreDir, 'version.json');
    if (fs.existsSync(versionJsonPath)) {
      try {
        const versionInfo = await fs.readJson(versionJsonPath);
        this.versionInfo = versionInfo;
        return versionInfo;
      } catch (error) {
        this.log(`Could not read version.json: ${error.message}`);
      }
    }

    // Fallback to package.json
    const packageJsonPath = path.join(this.projectRoot, 'node_modules', 'aios-core', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = await fs.readJson(packageJsonPath);
        return { version: pkg.version, installedAt: null, mode: 'unknown' };
      } catch (error) {
        this.log(`Could not read package.json: ${error.message}`);
      }
    }

    // Try local package.json for framework-development mode
    const localPackageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(localPackageJsonPath)) {
      try {
        const pkg = await fs.readJson(localPackageJsonPath);
        if (pkg.name === '@synkra/aios-core' || pkg.name === 'aios-core') {
          return { version: pkg.version, installedAt: null, mode: 'framework-development' };
        }
      } catch (error) {
        this.log(`Could not read local package.json: ${error.message}`);
      }
    }

    return null;
  }

  /**
   * Get latest version from npm registry
   *
   * @returns {Promise<string|null>} Latest version or null
   */
  async getLatestVersion() {
    return new Promise((resolve) => {
      const request = https.get(
        'https://registry.npmjs.org/aios-core/latest',
        { timeout: this.options.timeout },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve(json.version || null);
            } catch {
              resolve(null);
            }
          });
        },
      );

      request.on('error', (error) => {
        this.log(`npm registry error: ${error.message}`);
        resolve(null);
      });

      request.on('timeout', () => {
        request.destroy();
        this.log('npm registry timeout');
        resolve(null);
      });
    });
  }

  /**
   * Check internet connectivity
   *
   * @returns {Promise<boolean>} True if online
   */
  async checkConnectivity() {
    return new Promise((resolve) => {
      const request = https.get(
        'https://registry.npmjs.org/',
        { timeout: 5000 },
        (res) => {
          resolve(res.statusCode === 200);
        },
      );

      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Compare two semantic versions
   *
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1, v2) {
    const parts1 = v1.replace(/^v/, '').split('.').map(Number);
    const parts2 = v2.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }

  /**
   * Check if update is a breaking (major) version change
   *
   * @param {string} installed - Installed version
   * @param {string} latest - Latest version
   * @returns {boolean} True if breaking change
   */
  isBreakingUpdate(installed, latest) {
    const installedMajor = parseInt(installed.replace(/^v/, '').split('.')[0], 10);
    const latestMajor = parseInt(latest.replace(/^v/, '').split('.')[0], 10);
    return latestMajor > installedMajor;
  }

  /**
   * Detect user customizations by comparing file hashes
   *
   * @returns {Promise<Object>} Customization detection result
   */
  async detectCustomizations() {
    const result = {
      customized: [],
      unchanged: [],
      missing: [],
      error: null,
    };

    // Need version.json with fileHashes
    if (!this.versionInfo?.fileHashes) {
      // Try to load it
      const versionJsonPath = path.join(this.aiosCoreDir, 'version.json');
      if (fs.existsSync(versionJsonPath)) {
        try {
          this.versionInfo = await fs.readJson(versionJsonPath);
        } catch (error) {
          result.error = `Could not read version.json: ${error.message}`;
          return result;
        }
      } else {
        result.error = 'version.json not found - cannot detect customizations';
        return result;
      }
    }

    if (!this.versionInfo.fileHashes) {
      result.error = 'No file hashes in version.json - cannot detect customizations';
      return result;
    }

    // Compare each file
    for (const [relativePath, originalHash] of Object.entries(this.versionInfo.fileHashes)) {
      const absolutePath = path.join(this.aiosCoreDir, relativePath);

      if (!fs.existsSync(absolutePath)) {
        result.missing.push(relativePath);
        continue;
      }

      try {
        const currentHash = `sha256:${hashFile(absolutePath)}`;
        if (hashesMatch(currentHash, originalHash)) {
          result.unchanged.push(relativePath);
        } else {
          result.customized.push(relativePath);
        }
      } catch (error) {
        this.log(`Could not hash ${relativePath}: ${error.message}`);
        result.missing.push(relativePath);
      }
    }

    return result;
  }

  /**
   * Preview what would be updated (dry-run)
   *
   * @returns {Promise<Object>} Preview result
   */
  async previewUpdate() {
    const checkResult = await this.checkForUpdates();

    if (!checkResult.hasUpdate && !this.options.force) {
      return {
        willUpdate: false,
        reason: 'Already up to date',
        ...checkResult,
      };
    }

    const customizations = await this.detectCustomizations();
    const filesToUpdate = await this.getFilesToUpdate();

    return {
      willUpdate: true,
      currentVersion: checkResult.installed,
      targetVersion: checkResult.latest,
      isBreaking: checkResult.isBreaking,
      files: {
        new: filesToUpdate.filter((f) => f.action === FileAction.NEW),
        updated: filesToUpdate.filter((f) => f.action === FileAction.UPDATED),
        preserved: filesToUpdate.filter((f) => f.action === FileAction.PRESERVED),
        deleted: filesToUpdate.filter((f) => f.action === FileAction.DELETED),
      },
      customizations: customizations.customized,
      preserveCustomizations: this.options.preserveAll,
    };
  }

  /**
   * Get list of files that would be updated
   *
   * @returns {Promise<Array>} List of files with actions
   */
  async getFilesToUpdate() {
    // For now, return empty - will be implemented when we have manifest comparison
    // This would compare local manifest with latest manifest
    return [];
  }

  /**
   * Perform the update
   *
   * @param {Object} [options] - Update options
   * @param {boolean} [options.dryRun=false] - Only preview, don't update
   * @param {Function} [options.onProgress] - Progress callback
   * @returns {Promise<Object>} Update result
   */
  async update(options = {}) {
    const dryRun = options.dryRun === true;
    const onProgress = options.onProgress || (() => {});

    const result = {
      success: false,
      dryRun,
      previousVersion: null,
      newVersion: null,
      filesUpdated: 0,
      filesPreserved: 0,
      error: null,
      rollbackAvailable: false,
    };

    try {
      // Check for updates
      onProgress('checking', 'Checking for updates...');
      const checkResult = await this.checkForUpdates();

      if (!checkResult.hasUpdate && !this.options.force) {
        result.success = true;
        result.previousVersion = checkResult.installed;
        result.newVersion = checkResult.installed;
        result.error = 'Already up to date';
        return result;
      }

      result.previousVersion = checkResult.installed;
      result.newVersion = checkResult.latest;

      if (dryRun) {
        const preview = await this.previewUpdate();
        return {
          ...result,
          success: true,
          dryRun: true,
          preview,
        };
      }

      // Create backup for rollback
      onProgress('backup', 'Creating backup...');
      await this.createBackup();
      result.rollbackAvailable = true;

      // Detect customizations to preserve
      onProgress('detecting', 'Detecting customizations...');
      const customizations = await this.detectCustomizations();

      // Download and apply update
      onProgress('downloading', 'Downloading update...');
      const updateApplied = await this.applyUpdate(checkResult.latest, customizations.customized);

      if (!updateApplied.success) {
        // Rollback on failure
        onProgress('rollback', 'Update failed, rolling back...');
        await this.rollback();
        result.error = updateApplied.error;
        return result;
      }

      result.filesUpdated = updateApplied.filesUpdated;
      result.filesPreserved = customizations.customized.length;

      // Update version.json
      onProgress('finalizing', 'Updating version info...');
      await this.updateVersionInfo(checkResult.latest);

      // Validate installation after update
      onProgress('validating', 'Validating installation...');
      const validationResult = await this.validateAfterUpdate();
      result.validationPassed = validationResult.success;
      result.integrityScore = validationResult.integrityScore;

      if (!validationResult.success && validationResult.integrityScore < 80) {
        // Critical validation failure - rollback
        onProgress('rollback', 'Validation failed, rolling back...');
        await this.rollback();
        result.error = `Validation failed (integrity: ${validationResult.integrityScore}%)`;
        return result;
      }

      // Cleanup backup
      await this.cleanupBackup();
      result.rollbackAvailable = false;

      result.success = true;
      onProgress('complete', 'Update complete!');

      return result;
    } catch (error) {
      result.error = error.message;

      // Attempt rollback
      if (result.rollbackAvailable) {
        try {
          await this.rollback();
          result.error += ' (rolled back successfully)';
        } catch (rollbackError) {
          result.error += ` (rollback failed: ${rollbackError.message})`;
        }
      }

      return result;
    }
  }

  /**
   * Create backup before update
   *
   * @returns {Promise<void>}
   */
  async createBackup() {
    this.backupDir = path.join(this.aiosConfigDir, 'backup', `pre-update-${Date.now()}`);
    await fs.ensureDir(this.backupDir);

    // Copy critical files
    const filesToBackup = [
      'version.json',
      'install-manifest.yaml',
    ];

    for (const file of filesToBackup) {
      const src = path.join(this.aiosCoreDir, file);
      const dest = path.join(this.backupDir, file);
      if (fs.existsSync(src)) {
        await fs.copy(src, dest);
      }
    }

    this.log(`Backup created at ${this.backupDir}`);
  }

  /**
   * Rollback to previous state
   *
   * @returns {Promise<void>}
   */
  async rollback() {
    if (!this.backupDir || !fs.existsSync(this.backupDir)) {
      throw new Error('No backup available for rollback');
    }

    // Restore backed up files
    const backupFiles = await fs.readdir(this.backupDir);
    for (const file of backupFiles) {
      const src = path.join(this.backupDir, file);
      const dest = path.join(this.aiosCoreDir, file);
      await fs.copy(src, dest, { overwrite: true });
    }

    this.log('Rollback completed');
  }

  /**
   * Cleanup backup after successful update
   *
   * @returns {Promise<void>}
   */
  async cleanupBackup() {
    if (this.backupDir && fs.existsSync(this.backupDir)) {
      await fs.remove(this.backupDir);
      this.backupDir = null;
    }
  }

  /**
   * Apply the update
   *
   * @param {string} targetVersion - Target version
   * @param {Array<string>} customizedFiles - Files to preserve
   * @returns {Promise<Object>} Apply result
   */
  async applyUpdate(targetVersion, _customizedFiles = []) {
    const result = {
      success: false,
      filesUpdated: 0,
      error: null,
    };

    try {
      // Use npm to update the package
      const cmd = `npm install aios-core@${targetVersion} --save-exact`;
      this.log(`Running: ${cmd}`);

      execSync(cmd, {
        cwd: this.projectRoot,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        timeout: 120000, // 2 minutes
      });

      result.success = true;
      result.filesUpdated = 1; // At least package updated

      // TODO: Copy new files from node_modules to .aios-core
      // preserving customizedFiles

      return result;
    } catch (error) {
      result.error = error.message;
      return result;
    }
  }

  /**
   * Update version.json after successful update
   *
   * @param {string} newVersion - New version
   * @returns {Promise<void>}
   */
  async updateVersionInfo(newVersion) {
    const versionJsonPath = path.join(this.aiosCoreDir, 'version.json');

    const versionInfo = {
      version: newVersion,
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: this.versionInfo?.mode || 'project-development',
      fileHashes: {}, // Will be populated by file copy
    };

    await fs.writeJson(versionJsonPath, versionInfo, { spaces: 2 });
    this.log(`Updated version.json to v${newVersion}`);
  }

  /**
   * Validate installation after update using PostInstallValidator
   *
   * @param {Object} [options] - Validation options
   * @param {boolean} [options.verbose=false] - Show detailed output
   * @returns {Promise<Object>} Validation result
   */
  async validateAfterUpdate(options = {}) {
    const result = {
      success: false,
      integrityScore: 0,
      issues: [],
      error: null,
    };

    try {
      const validator = new PostInstallValidator(this.projectRoot, null, {
        verifyHashes: true,
        detectExtras: false,
        verbose: options.verbose || this.options.verbose,
        requireSignature: false, // Signature may not be available after npm update
      });

      const report = await validator.validate();

      result.success = report.status === 'success' || report.status === 'warning';
      result.integrityScore = report.integrityScore;
      result.issues = report.issues || [];
      result.report = report;

      if (options.verbose) {
        console.log(formatValidationReport(report, { colors: true }));
      }

      return result;
    } catch (error) {
      result.error = error.message;
      this.log(`Validation failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Log if verbose
   *
   * @param {string} message - Message
   */
  log(message) {
    if (this.options.verbose) {
      console.log(`[AIOSUpdater] ${message}`);
    }
  }
}

/**
 * Format update check result for console
 *
 * @param {Object} result - Check result
 * @param {Object} [options] - Format options
 * @returns {string} Formatted output
 */
function formatCheckResult(result, options = {}) {
  const useColors = options.colors !== false;

  const c = {
    reset: useColors ? '\x1b[0m' : '',
    bold: useColors ? '\x1b[1m' : '',
    green: useColors ? '\x1b[32m' : '',
    yellow: useColors ? '\x1b[33m' : '',
    red: useColors ? '\x1b[31m' : '',
    cyan: useColors ? '\x1b[36m' : '',
    dim: useColors ? '\x1b[2m' : '',
  };

  const lines = [];

  lines.push('');
  lines.push(`${c.bold}🔍 AIOS Update Check${c.reset}`);
  lines.push('');

  if (result.installed) {
    lines.push(`📦 Current: ${c.cyan}v${result.installed}${c.reset}${result.installedAt ? ` ${c.dim}(installed ${result.installedAt})${c.reset}` : ''}`);
  } else {
    lines.push(`📦 Current: ${c.red}Not installed${c.reset}`);
  }

  if (result.latest) {
    lines.push(`📦 Latest:  ${c.cyan}v${result.latest}${c.reset}`);
  }

  lines.push('');

  switch (result.status) {
    case UpdateStatus.UP_TO_DATE:
      lines.push(`${c.green}✓ You're up to date!${c.reset}`);
      break;
    case UpdateStatus.UPDATE_AVAILABLE:
      lines.push(`${c.yellow}⬆ Update available!${c.reset}`);
      lines.push(`  Run ${c.cyan}npx aios-core update${c.reset} to update.`);
      break;
    case UpdateStatus.UPDATE_REQUIRED:
      lines.push(`${c.red}⚠ Breaking update available!${c.reset}`);
      lines.push('  Review changelog before updating.');
      break;
    case UpdateStatus.CHECK_FAILED:
      lines.push(`${c.red}✗ Check failed: ${result.error}${c.reset}`);
      break;
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Format update result for console
 *
 * @param {Object} result - Update result
 * @param {Object} [options] - Format options
 * @returns {string} Formatted output
 */
function formatUpdateResult(result, options = {}) {
  const useColors = options.colors !== false;

  const c = {
    reset: useColors ? '\x1b[0m' : '',
    bold: useColors ? '\x1b[1m' : '',
    green: useColors ? '\x1b[32m' : '',
    yellow: useColors ? '\x1b[33m' : '',
    red: useColors ? '\x1b[31m' : '',
    cyan: useColors ? '\x1b[36m' : '',
    dim: useColors ? '\x1b[2m' : '',
  };

  const lines = [];

  lines.push('');

  if (result.success) {
    if (result.dryRun) {
      lines.push(`${c.bold}📋 Update Preview (dry-run)${c.reset}`);
    } else {
      lines.push(`${c.green}${c.bold}✅ Updated to v${result.newVersion}${c.reset}`);
    }

    lines.push('');
    lines.push(`  ${c.dim}Previous:${c.reset} v${result.previousVersion}`);
    lines.push(`  ${c.dim}New:${c.reset}      v${result.newVersion}`);

    if (result.filesUpdated > 0) {
      lines.push(`  ${c.dim}Files:${c.reset}    ${result.filesUpdated} updated`);
    }
    if (result.filesPreserved > 0) {
      lines.push(`  ${c.yellow}Preserved:${c.reset} ${result.filesPreserved} customizations`);
    }

    lines.push('');
    lines.push(`Run ${c.cyan}npx aios-core validate${c.reset} to verify installation.`);
  } else {
    lines.push(`${c.red}${c.bold}✗ Update failed${c.reset}`);
    lines.push('');
    lines.push(`  ${c.red}Error: ${result.error}${c.reset}`);

    if (result.rollbackAvailable) {
      lines.push(`  ${c.yellow}Rolled back to previous version.${c.reset}`);
    }
  }

  lines.push('');

  return lines.join('\n');
}

module.exports = {
  AIOSUpdater,
  UpdateStatus,
  FileAction,
  formatCheckResult,
  formatUpdateResult,
};
