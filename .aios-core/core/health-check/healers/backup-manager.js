/**
 * Backup Manager
 *
 * Manages file backups for self-healing operations.
 * Ensures safe rollback capability before any modifications.
 *
 * @module aios-core/health-check/healers/backup-manager
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Default backup directory
 */
const DEFAULT_BACKUP_DIR = '.aios/backups/health-check';

/**
 * Maximum backup retention (in days)
 */
const MAX_RETENTION_DAYS = 7;

/**
 * Backup Manager
 *
 * Handles file backup and restoration for self-healing operations.
 *
 * @class BackupManager
 */
class BackupManager {
  /**
   * Create a new BackupManager
   * @param {string} [backupDir] - Custom backup directory
   */
  constructor(backupDir = null) {
    this.backupDir = backupDir || DEFAULT_BACKUP_DIR;
    this.backups = new Map(); // file -> backupPath
    this.metadata = new Map(); // backupPath -> metadata
  }

  /**
   * Ensure backup directory exists
   * @private
   */
  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create backup directory: ${error.message}`);
    }
  }

  /**
   * Create a backup of a file
   * @param {string} filePath - Path to file to backup
   * @returns {Promise<string>} Path to backup file
   */
  async create(filePath) {
    await this.ensureBackupDir();

    const absolutePath = path.resolve(filePath);
    const timestamp = Date.now();
    const hash = this.generateHash(absolutePath);
    const backupName = `${path.basename(filePath)}.${timestamp}.${hash}.bak`;
    const backupPath = path.join(this.backupDir, backupName);

    try {
      // Check if file exists
      const stats = await fs.stat(absolutePath);
      if (!stats.isFile()) {
        throw new Error('Target is not a file');
      }

      // Create backup
      await fs.copyFile(absolutePath, backupPath);

      // Store backup reference
      this.backups.set(absolutePath, backupPath);
      this.metadata.set(backupPath, {
        originalPath: absolutePath,
        timestamp,
        size: stats.size,
        hash,
      });

      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup for ${filePath}: ${error.message}`);
    }
  }

  /**
   * Restore a file from backup
   * @param {string} filePath - Original file path
   * @returns {Promise<boolean>} True if restored successfully
   */
  async restore(filePath) {
    const absolutePath = path.resolve(filePath);
    const backupPath = this.backups.get(absolutePath);

    if (!backupPath) {
      throw new Error(`No backup found for ${filePath}`);
    }

    try {
      // Verify backup exists
      await fs.access(backupPath);

      // Restore from backup
      await fs.copyFile(backupPath, absolutePath);

      return true;
    } catch (error) {
      throw new Error(`Failed to restore ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if a file has a backup
   * @param {string} filePath - File path to check
   * @returns {boolean} True if backup exists
   */
  hasBackup(filePath) {
    const absolutePath = path.resolve(filePath);
    return this.backups.has(absolutePath);
  }

  /**
   * Get backup path for a file
   * @param {string} filePath - Original file path
   * @returns {string|null} Backup path or null
   */
  getBackupPath(filePath) {
    const absolutePath = path.resolve(filePath);
    return this.backups.get(absolutePath) || null;
  }

  /**
   * Get backup metadata
   * @param {string} backupPath - Backup file path
   * @returns {Object|null} Backup metadata or null
   */
  getMetadata(backupPath) {
    return this.metadata.get(backupPath) || null;
  }

  /**
   * List all backups
   * @returns {Promise<Object[]>} Array of backup info objects
   */
  async listBackups() {
    try {
      await this.ensureBackupDir();
      const files = await fs.readdir(this.backupDir);

      const backups = [];
      for (const file of files) {
        if (file.endsWith('.bak')) {
          const backupPath = path.join(this.backupDir, file);
          const stats = await fs.stat(backupPath);
          const metadata = this.metadata.get(backupPath);

          backups.push({
            path: backupPath,
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            originalPath: metadata?.originalPath || 'unknown',
          });
        }
      }

      return backups.sort((a, b) => b.created - a.created);
    } catch (_error) {
      return [];
    }
  }

  /**
   * Clean up old backups
   * @param {number} [maxAgeDays] - Maximum age in days
   * @returns {Promise<number>} Number of backups removed
   */
  async cleanup(maxAgeDays = MAX_RETENTION_DAYS) {
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    let removed = 0;

    try {
      const backups = await this.listBackups();

      for (const backup of backups) {
        if (backup.created.getTime() < cutoff) {
          try {
            await fs.unlink(backup.path);
            this.metadata.delete(backup.path);

            // Remove from backups map
            for (const [origPath, bkPath] of this.backups.entries()) {
              if (bkPath === backup.path) {
                this.backups.delete(origPath);
                break;
              }
            }

            removed++;
          } catch (_error) {
            // Ignore individual deletion errors
          }
        }
      }

      return removed;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Remove a specific backup
   * @param {string} filePath - Original file path
   * @returns {Promise<boolean>} True if removed
   */
  async remove(filePath) {
    const absolutePath = path.resolve(filePath);
    const backupPath = this.backups.get(absolutePath);

    if (!backupPath) {
      return false;
    }

    try {
      await fs.unlink(backupPath);
      this.backups.delete(absolutePath);
      this.metadata.delete(backupPath);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Verify backup integrity
   * @param {string} filePath - Original file path
   * @returns {Promise<Object>} Verification result
   */
  async verify(filePath) {
    const absolutePath = path.resolve(filePath);
    const backupPath = this.backups.get(absolutePath);

    if (!backupPath) {
      return {
        valid: false,
        error: 'No backup found',
      };
    }

    try {
      const [originalStats, backupStats] = await Promise.all([
        fs.stat(absolutePath).catch(() => null),
        fs.stat(backupPath).catch(() => null),
      ]);

      if (!backupStats) {
        return {
          valid: false,
          error: 'Backup file not found',
        };
      }

      const metadata = this.metadata.get(backupPath);

      return {
        valid: true,
        backup: {
          path: backupPath,
          size: backupStats.size,
          created: backupStats.birthtime,
        },
        original: {
          exists: !!originalStats,
          modified: originalStats ? originalStats.mtime : null,
        },
        metadata,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate a short hash for file identification
   * @private
   * @param {string} input - Input string
   * @returns {string} Short hash
   */
  generateHash(input) {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 8);
  }

  /**
   * Get backup statistics
   * @returns {Promise<Object>} Backup statistics
   */
  async getStats() {
    const backups = await this.listBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    return {
      count: backups.length,
      totalSize,
      totalSizeFormatted: this.formatSize(totalSize),
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].created : null,
      newestBackup: backups.length > 0 ? backups[0].created : null,
      backupDir: this.backupDir,
    };
  }

  /**
   * Format file size for display
   * @private
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

module.exports = BackupManager;
