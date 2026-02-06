const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const tar = require('tar');
const { promisify } = require('util');
const zlib = require('zlib');
const _gzip = promisify(zlib.gzip);
const _gunzip = promisify(zlib.gunzip);

/**
 * Manages backups for safe self-modification rollback
 */
class BackupManager {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.backupDir = path.join(this.rootPath, '.aios', 'backup');
    this.maxBackups = options.maxBackups || 10;
    this.compressionLevel = options.compressionLevel || 6;
    
    // Active backup tracking
    this.activeBackup = null;
    
    // Backup metadata
    this.metadataFile = path.join(this.backupDir, 'backup-metadata.json');
  }

  /**
   * Initialize backup system
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Initialize metadata if not exists
      try {
        await fs.access(this.metadataFile);
      } catch {
        await this.saveMetadata({
          version: '1.0.0',
          backups: [],
          statistics: {
            total_backups: 0,
            successful_restores: 0,
            failed_restores: 0,
            total_size: 0
          }
        });
      }
    } catch (error) {
      console.error(chalk.red(`Failed to initialize backup system: ${error.message}`));
    }
  }

  /**
   * Create full backup of specified files
   * @param {Object} params - Backup parameters
   * @returns {Promise<string>} Backup ID
   */
  async createFullBackup(params) {
    const { files, metadata = {} } = params;
    
    await this.initialize();
    
    console.log(chalk.blue('📦 Creating backup...'));
    
    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    const backupInfo = {
      id: backupId,
      timestamp: new Date().toISOString(),
      files: files.map(f => path.relative(this.rootPath, f)),
      metadata,
      size: 0,
      checksums: {},
      compressed: true,
      status: 'creating'
    };

    try {
      // Create temporary directory for backup files
      const tempDir = path.join(this.backupDir, `temp-${backupId}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Copy files to temp directory maintaining structure
      for (const file of files) {
        const relPath = path.relative(this.rootPath, file);
        const tempPath = path.join(tempDir, relPath);
        
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        
        try {
          await fs.copyFile(file, tempPath);
          
          // Calculate checksum
          const content = await fs.readFile(file);
          const checksum = crypto.createHash('sha256').update(content).digest('hex');
          backupInfo.checksums[relPath] = checksum;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not backup ${file}: ${error.message}`));
        }
      }

      // Create backup manifest
      await fs.writeFile(
        path.join(tempDir, 'backup-manifest.json'),
        JSON.stringify(backupInfo, null, 2)
      );

      // Create tar archive
      await tar.create(
        {
          gzip: { level: this.compressionLevel },
          file: backupPath,
          cwd: tempDir
        },
        ['.']
      );

      // Get backup size
      const stats = await fs.stat(backupPath);
      backupInfo.size = stats.size;
      backupInfo.status = 'completed';

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      // Update metadata
      await this.addBackupToMetadata(backupInfo);
      
      // Set as active backup
      this.activeBackup = backupId;
      
      // Clean old backups
      await this.cleanOldBackups();

      console.log(chalk.green(`✅ Backup created: ${backupId}`));
      console.log(chalk.gray(`   Files: ${files.length}, Size: ${this.formatSize(backupInfo.size)}`));

      return backupId;

    } catch (error) {
      // Clean up on failure
      try {
        await fs.unlink(backupPath);
      } catch {}
      
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  /**
   * Restore backup
   * @param {string} backupId - Backup ID to restore
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore result
   */
  async restoreBackup(backupId, options = {}) {
    const { targetPath = this.rootPath, dryRun = false } = options;
    
    console.log(chalk.blue(`🔄 Restoring backup: ${backupId}`));
    
    const result = {
      success: true,
      backupId,
      restored_files: [],
      failed_files: [],
      warnings: []
    };

    try {
      // Load backup metadata
      const metadata = await this.loadMetadata();
      const backupInfo = metadata.backups.find(b => b.id === backupId);
      
      if (!backupInfo) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
      
      // Verify backup exists
      try {
        await fs.access(backupPath);
      } catch {
        throw new Error(`Backup file missing: ${backupPath}`);
      }

      // Create restore temp directory
      const restoreTemp = path.join(this.backupDir, `restore-${Date.now()}`);
      await fs.mkdir(restoreTemp, { recursive: true });

      // Extract backup
      await tar.extract({
        file: backupPath,
        cwd: restoreTemp
      });

      // Load manifest
      const manifestPath = path.join(restoreTemp, 'backup-manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

      // Verify checksums
      for (const [relPath, expectedChecksum] of Object.entries(manifest.checksums)) {
        const tempFile = path.join(restoreTemp, relPath);
        try {
          const content = await fs.readFile(tempFile);
          const actualChecksum = crypto.createHash('sha256').update(content).digest('hex');
          
          if (actualChecksum !== expectedChecksum) {
            result.warnings.push(`Checksum mismatch for ${relPath}`);
          }
        } catch (error) {
          result.warnings.push(`Could not verify ${relPath}: ${error.message}`);
        }
      }

      if (!dryRun) {
        // Restore files
        for (const relPath of manifest.files) {
          const sourcePath = path.join(restoreTemp, relPath);
          const destPath = path.join(targetPath, relPath);
          
          try {
            // Create backup of current file if it exists
            try {
              await fs.access(destPath);
              await fs.copyFile(destPath, `${destPath}.pre-restore`);
            } catch {}
            
            // Ensure directory exists
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            
            // Restore file
            await fs.copyFile(sourcePath, destPath);
            result.restored_files.push(relPath);
            
          } catch (error) {
            result.failed_files.push({
              file: relPath,
              error: error.message
            });
            result.success = false;
          }
        }
      }

      // Clean up
      await fs.rm(restoreTemp, { recursive: true, force: true });

      // Update statistics
      if (!dryRun && result.success) {
        metadata.statistics.successful_restores++;
      } else if (!dryRun) {
        metadata.statistics.failed_restores++;
      }
      await this.saveMetadata(metadata);

      console.log(chalk.green(`✅ Restore ${dryRun ? 'preview' : 'completed'}`));
      console.log(chalk.gray(`   Restored: ${result.restored_files.length} files`));
      if (result.failed_files.length > 0) {
        console.log(chalk.red(`   Failed: ${result.failed_files.length} files`));
      }

    } catch (error) {
      result.success = false;
      result.error = error.message;
      console.error(chalk.red(`Restore failed: ${error.message}`));
    }

    return result;
  }

  /**
   * Emergency restore - restores the last active backup
   * @returns {Promise<Object>} Restore result
   */
  async emergencyRestore() {
    console.log(chalk.red('🚨 EMERGENCY RESTORE INITIATED'));
    
    if (!this.activeBackup) {
      // Find most recent backup
      const metadata = await this.loadMetadata();
      const backups = metadata.backups
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (backups.length === 0) {
        throw new Error('No backups available for emergency restore');
      }
      
      this.activeBackup = backups[0].id;
    }
    
    console.log(chalk.yellow(`Restoring backup: ${this.activeBackup}`));
    return await this.restoreBackup(this.activeBackup);
  }

  /**
   * List available backups
   * @param {Object} filter - Filter options
   * @returns {Promise<Array>} List of backups
   */
  async listBackups(filter = {}) {
    const metadata = await this.loadMetadata();
    let backups = metadata.backups;

    // Apply filters
    if (filter.status) {
      backups = backups.filter(b => b.status === filter.status);
    }
    
    if (filter.after) {
      const afterDate = new Date(filter.after);
      backups = backups.filter(b => new Date(b.timestamp) > afterDate);
    }
    
    if (filter.metadata) {
      backups = backups.filter(b => {
        return Object.entries(filter.metadata).every(([key, value]) => 
          b.metadata[key] === value
        );
      });
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups.map(b => ({
      id: b.id,
      timestamp: b.timestamp,
      files: b.files.length,
      size: this.formatSize(b.size),
      metadata: b.metadata,
      isActive: b.id === this.activeBackup
    }));
  }

  /**
   * Delete specific backup
   * @param {string} backupId - Backup ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteBackup(backupId) {
    try {
      const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
      await fs.unlink(backupPath);
      
      // Remove from metadata
      const metadata = await this.loadMetadata();
      const index = metadata.backups.findIndex(b => b.id === backupId);
      
      if (index !== -1) {
        const backup = metadata.backups[index];
        metadata.statistics.total_size -= backup.size;
        metadata.backups.splice(index, 1);
        await this.saveMetadata(metadata);
      }
      
      // Clear active backup if deleted
      if (this.activeBackup === backupId) {
        this.activeBackup = null;
      }
      
      console.log(chalk.gray(`Deleted backup: ${backupId}`));
      return true;
      
    } catch (error) {
      console.error(chalk.red(`Failed to delete backup: ${error.message}`));
      return false;
    }
  }

  /**
   * Get backup details
   * @param {string} backupId - Backup ID
   * @returns {Promise<Object>} Backup details
   */
  async getBackupDetails(backupId) {
    const metadata = await this.loadMetadata();
    const backup = metadata.backups.find(b => b.id === backupId);
    
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }
    
    return backup;
  }

  /**
   * Verify backup integrity
   * @param {string} backupId - Backup ID to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyBackup(backupId) {
    console.log(chalk.blue(`🔍 Verifying backup: ${backupId}`));
    
    const result = {
      valid: true,
      backupId,
      errors: [],
      warnings: []
    };

    try {
      const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
      
      // Check file exists
      try {
        await fs.access(backupPath);
      } catch {
        result.valid = false;
        result.errors.push('Backup file not found');
        return result;
      }

      // Try to list archive contents
      try {
        const entries = [];
        await tar.list({
          file: backupPath,
          onentry: entry => entries.push(entry.path)
        });
        
        if (!entries.includes('./backup-manifest.json')) {
          result.valid = false;
          result.errors.push('Missing backup manifest');
        }
      } catch (error) {
        result.valid = false;
        result.errors.push(`Archive corrupted: ${error.message}`);
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Verification failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Check if has active backup
   * @returns {boolean}
   */
  hasActiveBackup() {
    return this.activeBackup !== null;
  }

  /**
   * Load metadata
   * @private
   */
  async loadMetadata() {
    try {
      const content = await fs.readFile(this.metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        version: '1.0.0',
        backups: [],
        statistics: {
          total_backups: 0,
          successful_restores: 0,
          failed_restores: 0,
          total_size: 0
        }
      };
    }
  }

  /**
   * Save metadata
   * @private
   */
  async saveMetadata(metadata) {
    await fs.writeFile(
      this.metadataFile,
      JSON.stringify(metadata, null, 2)
    );
  }

  /**
   * Add backup to metadata
   * @private
   */
  async addBackupToMetadata(backupInfo) {
    const metadata = await this.loadMetadata();
    
    metadata.backups.push(backupInfo);
    metadata.statistics.total_backups++;
    metadata.statistics.total_size += backupInfo.size;
    
    await this.saveMetadata(metadata);
  }

  /**
   * Clean old backups
   * @private
   */
  async cleanOldBackups() {
    const metadata = await this.loadMetadata();
    const backups = metadata.backups
      .filter(b => b.status === 'completed')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        await this.deleteBackup(backup.id);
      }
      
      console.log(chalk.gray(`Cleaned ${toDelete.length} old backups`));
    }
  }

  /**
   * Generate backup ID
   * @private
   */
  generateBackupId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `backup-${timestamp}-${random}`;
  }

  /**
   * Format file size
   * @private
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Export backup for external storage
   * @param {string} backupId - Backup ID to export
   * @param {string} exportPath - Path to export to
   * @returns {Promise<Object>} Export result
   */
  async exportBackup(backupId, exportPath) {
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    const metadataPath = path.join(this.backupDir, `${backupId}-metadata.json`);
    
    try {
      // Copy backup file
      await fs.copyFile(backupPath, exportPath);
      
      // Export metadata
      const metadata = await this.getBackupDetails(backupId);
      await fs.writeFile(
        metadataPath,
        JSON.stringify(metadata, null, 2)
      );
      
      return {
        success: true,
        exported: exportPath,
        metadata: metadataPath,
        size: metadata.size
      };
      
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Import external backup
   * @param {string} importPath - Path to backup file
   * @param {Object} metadata - Backup metadata
   * @returns {Promise<string>} Imported backup ID
   */
  async importBackup(importPath, metadata) {
    const backupId = metadata.id || this.generateBackupId();
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    
    try {
      // Copy backup file
      await fs.copyFile(importPath, backupPath);
      
      // Update metadata
      metadata.id = backupId;
      metadata.imported = new Date().toISOString();
      
      await this.addBackupToMetadata(metadata);
      
      return backupId;
      
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}

module.exports = BackupManager;