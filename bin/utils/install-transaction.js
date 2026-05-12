/**
 * InstallTransaction - Transaction manager for AIOX installer
 *
 * Provides atomic installation operations with automatic rollback on failure.
 * Backs up files before modification and restores them if installation fails.
 *
 * @module bin/utils/install-transaction
 * @see Story 1.9 - Error Handling & Rollback
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Error classification constants
const ERROR_TYPES = {
  CRITICAL: 'CRITICAL',
  RECOVERABLE: 'RECOVERABLE',
  WARNING: 'WARNING',
};

// Critical errors that trigger immediate rollback
const CRITICAL_ERRORS = [
  'EACCES',   // Permission denied
  'ENOSPC',   // No space left on device
  'EROFS',    // Read-only file system
  'ENOTDIR',  // Not a directory
  'EISDIR',   // Is a directory
];

class InstallTransaction {
  /**
   * Create a new installation transaction
   *
   * @param {Object} options - Transaction options
   * @param {string} [options.backupDir] - Custom backup directory path
   * @param {string} [options.logFile] - Custom log file path
   */
  constructor(options = {}) {
    this.backupDir = options.backupDir || path.join(process.cwd(), '.aiox-backup', this._generateTimestamp());
    this.logFile = options.logFile || path.join(process.cwd(), '.aiox-install.log');
    this.backups = [];  // [{original, backup, hash, isDirectory}]
    this.operations = [];  // [{timestamp, level, message}]
    this.isCommitted = false;
    this.isRolledBack = false;
  }

  /**
   * Generate timestamp for backup directory naming
   * Format: 2025-01-23_14-30-45-123Z
   *
   * @private
   * @returns {string} ISO timestamp with safe filename characters
   */
  _generateTimestamp() {
    // Replace colons, dots, and T separator for Windows compatibility
    return new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .replace('T', '_');
  }

  /**
   * Backup a single file before modification
   *
   * @param {string} filePath - Path to file to backup
   * @throws {Error} If backup operation fails
   *
   * @example
   * await transaction.backup('package.json');
   */
  async backup(filePath) {
    const originalPath = path.resolve(filePath);

    // Check if file exists
    if (!(await fs.pathExists(originalPath))) {
      this.log('WARN', `File not found for backup: ${filePath}`);
      return;
    }

    // Prevent symlink attacks (security)
    const stats = await fs.lstat(originalPath);
    if (stats.isSymbolicLink()) {
      throw new Error(`Symlink detected in backup path - potential security risk: ${filePath}`);
    }

    // Skip if already backed up
    if (this.backups.find((b) => b.original === originalPath)) {
      this.log('DEBUG', `File already backed up: ${filePath}`);
      return;
    }

    // Generate unique backup filename using path hash to prevent collisions
    // e.g., /app/config.json and /data/config.json won't overwrite each other
    const pathHash = crypto.createHash('sha256').update(originalPath).digest('hex').substring(0, 8);
    const backupFilename = `${path.basename(filePath)}.${pathHash}.backup`;
    const backupPath = path.join(this.backupDir, backupFilename);
    await fs.ensureDir(this.backupDir);

    // Set restrictive permissions on backup directory (owner only)
    try {
      await fs.chmod(this.backupDir, 0o700);
    } catch (error) {
      // Windows doesn't support chmod - log warning but continue
      this.log('DEBUG', `Could not set backup directory permissions: ${error.message}`);
    }

    await fs.copy(originalPath, backupPath);

    const hash = await this._calculateHash(originalPath);
    this.backups.push({ original: originalPath, backup: backupPath, hash });
    this.log('INFO', `Backed up: ${filePath}`);
  }

  /**
   * Backup entire directory recursively
   *
   * @param {string} dirPath - Path to directory to backup
   * @throws {Error} If backup operation fails
   *
   * @example
   * await transaction.backupDirectory('.aiox-core/');
   */
  async backupDirectory(dirPath) {
    const originalPath = path.resolve(dirPath);

    if (!(await fs.pathExists(originalPath))) {
      this.log('WARN', `Directory not found for backup: ${dirPath}`);
      return;
    }

    // Prevent symlink attacks (security) - use lstat to detect symlinks
    const stats = await fs.lstat(originalPath);
    if (stats.isSymbolicLink()) {
      throw new Error(`Symlink detected in backup path - potential security risk: ${dirPath}`);
    }

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }

    // Skip if already backed up
    if (this.backups.find((b) => b.original === originalPath)) {
      this.log('DEBUG', `Directory already backed up: ${dirPath}`);
      return;
    }

    // Generate unique backup dirname using path hash to prevent collisions
    const pathHash = crypto.createHash('sha256').update(originalPath).digest('hex').substring(0, 8);
    const backupDirname = `${path.basename(dirPath)}.${pathHash}`;
    const backupPath = path.join(this.backupDir, backupDirname);
    await fs.ensureDir(this.backupDir);

    // Set restrictive permissions
    try {
      await fs.chmod(this.backupDir, 0o700);
    } catch (error) {
      this.log('DEBUG', `Could not set backup directory permissions: ${error.message}`);
    }

    await fs.copy(originalPath, backupPath, { recursive: true });

    this.backups.push({ original: originalPath, backup: backupPath, isDirectory: true });
    this.log('INFO', `Backed up directory: ${dirPath}`);
  }

  /**
   * Calculate SHA-256 hash of file for verification
   *
   * @private
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} Hex-encoded hash
   */
  async _calculateHash(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Verify backup integrity by comparing hashes
   *
   * @private
   * @param {Object} backup - Backup entry {original, backup, hash}
   * @returns {Promise<boolean>} True if backup is valid
   */
  async _verifyBackup(backup) {
    if (backup.isDirectory) {
      // For directories, just check existence
      return await fs.pathExists(backup.backup);
    }

    if (!(await fs.pathExists(backup.backup))) {
      return false;
    }

    const backupHash = await this._calculateHash(backup.backup);
    return backupHash === backup.hash;
  }

  /**
   * Rollback all changes by restoring backups
   *
   * @returns {Promise<boolean>} True if rollback succeeded, false if partial failure
   *
   * @example
   * try {
   *   await installAIOX();
   * } catch (error) {
   *   await transaction.rollback();
   * }
   */
  async rollback() {
    if (this.isCommitted) {
      this.log('ERROR', 'Cannot rollback: transaction already committed');
      return false;
    }

    if (this.isRolledBack) {
      this.log('WARN', 'Transaction already rolled back');
      return true;
    }

    this.log('ERROR', 'Installation failed. Starting rollback...');
    let rollbackSuccess = true;
    const failedRestores = [];

    // Restore in reverse order (LIFO - last backup restored first)
    for (const backup of [...this.backups].reverse()) {
      try {
        // Verify backup integrity before restore
        const isValid = await this._verifyBackup(backup);
        if (!isValid) {
          this.log('ERROR', `Backup verification failed for ${backup.original}`);
          failedRestores.push(backup.original);
          rollbackSuccess = false;
          continue;
        }

        // Atomic restore: Copy to temp first, then move to original
        // This prevents data loss if copy fails
        const tempPath = `${backup.original}.restore-temp`;

        try {
          // Copy backup to temporary location
          await fs.copy(backup.backup, tempPath, { recursive: backup.isDirectory });

          // Remove failed installation artifacts (safe now that restore is ready)
          if (await fs.pathExists(backup.original)) {
            await fs.remove(backup.original);
          }

          // Atomic move from temp to original
          await fs.move(tempPath, backup.original, { overwrite: true });
        } finally {
          // Cleanup temp file if it still exists (error case)
          if (await fs.pathExists(tempPath)) {
            await fs.remove(tempPath);
          }
        }

        this.log('INFO', `Restored: ${backup.original}`);
      } catch (error) {
        this.log('ERROR', `Failed to restore ${backup.original}: ${error.message}`);
        failedRestores.push(backup.original);
        rollbackSuccess = false;
      }
    }

    // Cleanup backup directory
    try {
      await fs.remove(this.backupDir);
      this.log('INFO', 'Backup directory cleaned up');
    } catch (error) {
      this.log('WARN', `Failed to cleanup backup directory: ${error.message}`);
    }

    this.isRolledBack = true;

    if (failedRestores.length > 0) {
      this.log('ERROR', `Rollback completed with errors. Failed to restore: ${failedRestores.join(', ')}`);
    } else {
      this.log('INFO', 'Rollback completed successfully');
    }

    return rollbackSuccess;
  }

  /**
   * Commit transaction and cleanup backups (installation succeeded)
   *
   * @example
   * await transaction.commit();
   * console.log('Installation successful!');
   */
  async commit() {
    if (this.isRolledBack) {
      this.log('ERROR', 'Cannot commit: transaction already rolled back');
      return;
    }

    if (this.isCommitted) {
      this.log('WARN', 'Transaction already committed');
      return;
    }

    this.log('INFO', 'Installation successful. Cleaning up backups...');

    try {
      await fs.remove(this.backupDir);
      this.log('INFO', 'Backups cleaned up successfully');
    } catch (error) {
      this.log('WARN', `Failed to cleanup backups: ${error.message}`);
    }

    this.isCommitted = true;
  }

  /**
   * Log message with timestamp and level
   * Sanitizes credentials before writing to log file
   *
   * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
   * @param {string} message - Log message
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}\n`;

    // Sanitize credentials (API keys, tokens, passwords)
    const sanitized = this._sanitizeCredentials(logLine);

    // Write to log file (append mode)
    try {
      fs.appendFileSync(this.logFile, sanitized);
    } catch (error) {
      // If logging fails, don't crash - just write to console
      console.error(`Failed to write to log file: ${error.message}`);
    }

    // Store in memory for programmatic access
    this.operations.push({ timestamp, level, message });

    // Rotate log if it exceeds 10MB
    this._rotateLogIfNeeded();
  }

  /**
   * Sanitize sensitive data from log messages
   * Prevents API keys, tokens, and passwords from being logged
   *
   * @private
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  _sanitizeCredentials(text) {
    // Pattern 1: Long hex strings (API keys, tokens)
    let sanitized = text.replace(/[a-f0-9]{32,}/gi, '[REDACTED]');

    // Pattern 2: Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');

    // Pattern 3: Password fields (password=xxx, pwd=xxx)
    sanitized = sanitized.replace(/(password|pwd|token|key|secret|auth)[:=]\s*[^\s,}]+/gi, '$1=[REDACTED]');

    // Pattern 4: Environment variables that look like secrets
    sanitized = sanitized.replace(/([A-Z_]+_(?:KEY|TOKEN|SECRET|PASSWORD|AUTH))[:=]\s*[^\s,}]+/gi, '$1=[REDACTED]');

    return sanitized;
  }

  /**
   * Rotate log file if it exceeds 10MB
   * Keeps last 5 logs
   *
   * @private
   */
  _rotateLogIfNeeded() {
    try {
      // Check if log file exists before trying to get stats
      if (!fs.existsSync(this.logFile)) {
        return;
      }

      const stats = fs.statSync(this.logFile);
      const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
      const MAX_LOG_FILES = 5;

      if (stats.size < MAX_LOG_SIZE) {
        return;
      }

      // Rotate existing logs (log.4 -> log.5, log.3 -> log.4, etc.)
      for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
        const oldPath = `${this.logFile}.${i}`;
        const newPath = `${this.logFile}.${i + 1}`;

        if (fs.existsSync(oldPath)) {
          if (i === MAX_LOG_FILES - 1) {
            fs.unlinkSync(oldPath); // Delete oldest log
          } else {
            fs.renameSync(oldPath, newPath);
          }
        }
      }

      // Move current log to .1
      fs.renameSync(this.logFile, `${this.logFile}.1`);

      this.log('INFO', 'Log file rotated');
    } catch (error) {
      // Rotation failure is non-critical
      console.error(`Log rotation failed: ${error.message}`);
    }
  }

  /**
   * Classify error type based on error code
   *
   * @param {Error} error - Error object
   * @returns {string} ERROR_TYPES constant (CRITICAL, RECOVERABLE, WARNING)
   */
  classifyError(error) {
    if (!error.code) {
      return ERROR_TYPES.RECOVERABLE;
    }

    if (CRITICAL_ERRORS.includes(error.code)) {
      return ERROR_TYPES.CRITICAL;
    }

    return ERROR_TYPES.RECOVERABLE;
  }

  /**
   * Check if error is critical (requires rollback)
   *
   * @param {Error} error - Error object
   * @returns {boolean} True if error is critical
   */
  isCriticalError(error) {
    return this.classifyError(error) === ERROR_TYPES.CRITICAL;
  }
}

module.exports = { InstallTransaction, ERROR_TYPES, CRITICAL_ERRORS };
