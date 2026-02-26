/**
 * Healer Manager
 *
 * Manages self-healing operations for health check failures.
 * Implements three-tier safety model for auto-fixes.
 *
 * @module aios-core/health-check/healers
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const BackupManager = require('./backup-manager');
const { CheckStatus } = require('../base-check');

/**
 * Healing tiers
 * @enum {number}
 */
const HealingTier = {
  NONE: 0,
  SILENT: 1, // Safe, reversible, framework-only
  PROMPTED: 2, // Moderate risk, requires confirmation
  MANUAL: 3, // High risk, provides instructions only
};

/**
 * Healer Manager
 *
 * Orchestrates self-healing operations with safety controls:
 * - Tier 1 (Silent): Auto-fix without user interaction
 * - Tier 2 (Prompted): Request user confirmation before fix
 * - Tier 3 (Manual): Provide instructions for manual fix
 *
 * @class HealerManager
 */
class HealerManager {
  /**
   * Create a new HealerManager
   * @param {Object} config - Configuration options
   * @param {number} [config.autoFixTier=1] - Maximum tier for auto-fix
   * @param {string} [config.backupDir] - Backup directory path
   * @param {boolean} [config.dryRun=false] - If true, don't apply fixes
   */
  constructor(config = {}) {
    this.config = config;
    this.maxAutoFixTier = config.autoFixTier || 1;
    this.dryRun = config.dryRun || false;
    this.backup = new BackupManager(config.backupDir);
    this.healers = new Map();
    this.healingLog = [];

    // Safety blocklist - never modify these
    this.blocklist = [
      /\.env$/,
      /\.env\..+$/,
      /credentials\.json$/,
      /secrets?\./i,
      /\.pem$/,
      /\.key$/,
      /id_rsa/,
      /\.ssh\//,
    ];

    // Register built-in healers
    this.registerBuiltInHealers();
  }

  /**
   * Apply fixes to check results
   * @param {Object[]} checkResults - Array of check results
   * @param {number} [maxTier] - Maximum tier to auto-fix
   * @returns {Promise<Object[]>} Array of healing results
   */
  async applyFixes(checkResults, maxTier = this.maxAutoFixTier) {
    const healingResults = [];

    // Filter healable issues
    const healableResults = checkResults.filter(
      (r) =>
        r.healable && r.healingTier > 0 && r.healingTier <= maxTier && r.status !== CheckStatus.PASS,
    );

    for (const result of healableResults) {
      const healingResult = await this.heal(result, maxTier);
      healingResults.push(healingResult);
      this.healingLog.push({
        ...healingResult,
        timestamp: new Date().toISOString(),
      });
    }

    return healingResults;
  }

  /**
   * Heal a single check result
   * @param {Object} checkResult - Check result to heal
   * @param {number} maxTier - Maximum tier to apply
   * @returns {Promise<Object>} Healing result
   */
  async heal(checkResult, maxTier) {
    const { checkId, healingTier } = checkResult;

    // Safety check
    if (healingTier > maxTier) {
      return this.createManualGuide(checkResult);
    }

    // Get healer for this check
    const healer = this.healers.get(checkId);
    if (!healer) {
      return {
        checkId,
        success: false,
        tier: healingTier,
        message: 'No healer registered for this check',
        action: 'none',
      };
    }

    // Tier-based execution
    switch (healingTier) {
      case HealingTier.SILENT:
        return await this.executeTier1(checkResult, healer);

      case HealingTier.PROMPTED:
        return await this.executeTier2(checkResult, healer);

      case HealingTier.MANUAL:
        return this.createManualGuide(checkResult);

      default:
        return {
          checkId,
          success: false,
          tier: healingTier,
          message: `Unknown healing tier: ${healingTier}`,
          action: 'none',
        };
    }
  }

  /**
   * Execute Tier 1 (Silent) fix
   * @private
   * @param {Object} checkResult - Check result
   * @param {Object} healer - Healer configuration
   * @returns {Promise<Object>} Healing result
   */
  async executeTier1(checkResult, healer) {
    const { checkId } = checkResult;

    try {
      // Check blocklist
      if (healer.targetFile && this.isBlocked(healer.targetFile)) {
        return {
          checkId,
          success: false,
          tier: HealingTier.SILENT,
          message: 'Target file is in security blocklist',
          action: 'blocked',
        };
      }

      // Create backup if needed
      let backupPath = null;
      if (healer.targetFile && !this.dryRun) {
        backupPath = await this.backup.create(healer.targetFile);
      }

      // Execute fix
      if (!this.dryRun) {
        await healer.fix(checkResult);
      }

      return {
        checkId,
        success: true,
        tier: HealingTier.SILENT,
        message: healer.successMessage || 'Issue fixed automatically',
        action: healer.action || 'fixed',
        backupPath,
        dryRun: this.dryRun,
      };
    } catch (error) {
      // Attempt rollback on failure
      if (healer.targetFile && !this.dryRun) {
        try {
          await this.backup.restore(healer.targetFile);
        } catch (_rollbackError) {
          // Log rollback failure
        }
      }

      return {
        checkId,
        success: false,
        tier: HealingTier.SILENT,
        message: `Fix failed: ${error.message}`,
        action: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Execute Tier 2 (Prompted) fix
   * @private
   * @param {Object} checkResult - Check result
   * @param {Object} healer - Healer configuration
   * @returns {Promise<Object>} Healing result
   */
  async executeTier2(checkResult, healer) {
    const { checkId } = checkResult;

    // In non-interactive mode, return prompt result
    // The CLI will handle user interaction
    return {
      checkId,
      success: false,
      tier: HealingTier.PROMPTED,
      message: healer.promptMessage || 'Fix requires confirmation',
      action: 'prompt',
      prompt: {
        question: healer.promptQuestion || `Apply fix for ${checkResult.name}?`,
        description: healer.promptDescription || checkResult.recommendation,
        risk: healer.risk || 'moderate',
        healer: healer.name,
      },
      fix: async (confirmed) => {
        if (!confirmed) {
          return { success: false, message: 'Fix declined by user' };
        }
        return await this.executeTier1(checkResult, healer);
      },
    };
  }

  /**
   * Create manual guide for Tier 3 issues
   * @private
   * @param {Object} checkResult - Check result
   * @returns {Object} Manual guide result
   */
  createManualGuide(checkResult) {
    const { checkId, recommendation } = checkResult;

    const healer = this.healers.get(checkId);
    const _guide = healer?.manualGuide || recommendation;

    return {
      checkId,
      success: false,
      tier: HealingTier.MANUAL,
      message: 'Manual intervention required',
      action: 'manual',
      guide: {
        title: `Fix ${checkResult.name}`,
        description: checkResult.message,
        steps: healer?.steps || [recommendation || 'Follow the recommendation'],
        documentation: healer?.documentation || null,
        warning: healer?.warning || 'Backup your files before making changes',
      },
    };
  }

  /**
   * Check if a file is in the blocklist
   * @private
   * @param {string} filePath - File path to check
   * @returns {boolean} True if blocked
   */
  isBlocked(filePath) {
    return this.blocklist.some((pattern) => pattern.test(filePath));
  }

  /**
   * Register a healer for a check
   * @param {string} checkId - Check ID
   * @param {Object} healer - Healer configuration
   * @param {string} healer.name - Healer name
   * @param {Function} healer.fix - Fix function
   * @param {string} [healer.targetFile] - Target file for backup
   * @param {string} [healer.successMessage] - Success message
   * @param {string} [healer.promptMessage] - Prompt message for Tier 2
   * @param {string} [healer.manualGuide] - Guide for Tier 3
   * @param {string[]} [healer.steps] - Step-by-step guide for Tier 3
   */
  registerHealer(checkId, healer) {
    this.healers.set(checkId, healer);
  }

  /**
   * Register built-in healers
   * @private
   */
  registerBuiltInHealers() {
    // Healers will be registered by individual checks
    // This is a placeholder for future built-in healers
  }

  /**
   * Get healing log
   * @returns {Object[]} Healing log entries
   */
  getHealingLog() {
    return [...this.healingLog];
  }

  /**
   * Clear healing log
   */
  clearLog() {
    this.healingLog = [];
  }

  /**
   * Get backup manager
   * @returns {BackupManager} Backup manager instance
   */
  getBackupManager() {
    return this.backup;
  }
}

module.exports = HealerManager;
module.exports.HealingTier = HealingTier;
module.exports.BackupManager = BackupManager;
