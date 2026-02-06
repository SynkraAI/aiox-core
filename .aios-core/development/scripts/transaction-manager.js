/**
 * Transaction Manager for AIOS-FULLSTACK
 * Manages component operations with rollback support
 * @module transaction-manager
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');
const ComponentMetadata = require('./component-metadata');

class TransactionManager {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.transactionPath = path.join(this.rootPath, 'aios-core', 'transactions');
    this.backupPath = path.join(this.rootPath, 'aios-core', 'backups');
    this.componentMetadata = new ComponentMetadata({ rootPath: this.rootPath });
    
    // Active transactions
    this.activeTransactions = new Map();
    
    // Transaction retention (30 days)
    this.retentionDays = options.retentionDays || 30;
  }

  /**
   * Begin a new transaction
   * @param {Object} options - Transaction options
   * @returns {Promise<string>} Transaction ID
   */
  async beginTransaction(options = {}) {
    try {
      const transactionId = this.generateTransactionId();
      
      const transaction = {
        id: transactionId,
        type: options.type || 'component_operation',
        description: options.description || 'Component operation',
        user: options.user || process.env.USER || 'system',
        startTime: new Date().toISOString(),
        status: 'active',
        operations: [],
        backups: [],
        metadata: options.metadata || {},
        rollbackOnError: options.rollbackOnError !== false
      };
      
      // Save initial transaction state
      await this.saveTransaction(transaction);
      
      // Store in active transactions
      this.activeTransactions.set(transactionId, transaction);
      
      console.log(chalk.blue(`📋 Transaction started: ${transactionId}`));
      
      return transactionId;
      
    } catch (error) {
      console.error(chalk.red(`Failed to begin transaction: ${error.message}`));
      throw error;
    }
  }

  /**
   * Record a file operation in the transaction
   * @param {string} transactionId - Transaction ID
   * @param {Object} operation - Operation details
   * @returns {Promise<void>}
   */
  async recordOperation(transactionId, operation) {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }
      
      const operationRecord = {
        id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: operation.type, // create, update, delete
        target: operation.target, // file, manifest, metadata
        path: operation.path,
        previousState: null,
        newState: null,
        metadata: operation.metadata || {}
      };
      
      // Backup current state if needed
      if (operation.type === 'update' || operation.type === 'delete') {
        operationRecord.previousState = await this.backupCurrentState(operation.path);
      }
      
      // Record new state for create/update
      if (operation.type === 'create' || operation.type === 'update') {
        operationRecord.newState = operation.content || operation.data;
      }
      
      // Add to transaction
      transaction.operations.push(operationRecord);
      
      // Save updated transaction
      await this.saveTransaction(transaction);
      
    } catch (error) {
      console.error(chalk.red(`Failed to record operation: ${error.message}`));
      throw error;
    }
  }

  /**
   * Commit a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Commit result
   */
  async commitTransaction(transactionId) {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }
      
      transaction.endTime = new Date().toISOString();
      transaction.status = 'committed';
      transaction.duration = new Date(transaction.endTime) - new Date(transaction.startTime);
      
      // Save final transaction state
      await this.saveTransaction(transaction);
      
      // Clean up backups after successful commit (keep for history)
      await this.archiveBackups(transaction);
      
      // Remove from active transactions
      this.activeTransactions.delete(transactionId);
      
      console.log(chalk.green(`✅ Transaction committed: ${transactionId}`));
      
      return {
        transactionId,
        operations: transaction.operations.length,
        duration: transaction.duration
      };
      
    } catch (error) {
      console.error(chalk.red(`Failed to commit transaction: ${error.message}`));
      throw error;
    }
  }

  /**
   * Rollback a transaction
   * @param {string} transactionId - Transaction ID
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} Rollback result
   */
  async rollbackTransaction(transactionId, options = {}) {
    try {
      const transaction = this.activeTransactions.get(transactionId) || 
                         await this.loadTransaction(transactionId);
      
      if (!transaction) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }
      
      console.log(chalk.yellow(`⚙️  Rolling back transaction: ${transactionId}`));
      
      const rollbackResults = {
        transactionId,
        successful: [],
        failed: [],
        warnings: []
      };
      
      // Process operations in reverse order
      const operations = [...transaction.operations].reverse();
      
      for (const operation of operations) {
        try {
          await this.rollbackOperation(operation, rollbackResults);
        } catch (error) {
          rollbackResults.failed.push({
            operation: operation.id,
            error: error.message
          });
          
          if (!options.continueOnError) {
            throw error;
          }
        }
      }
      
      // Update transaction status
      transaction.status = 'rolled_back';
      transaction.rollbackTime = new Date().toISOString();
      transaction.rollbackResults = rollbackResults;
      
      await this.saveTransaction(transaction);
      
      // Remove from active transactions
      this.activeTransactions.delete(transactionId);
      
      console.log(chalk.green(`✅ Rollback completed`));
      console.log(chalk.gray(`   Successful: ${rollbackResults.successful.length}`));
      console.log(chalk.gray(`   Failed: ${rollbackResults.failed.length}`));
      console.log(chalk.gray(`   Warnings: ${rollbackResults.warnings.length}`));
      
      return rollbackResults;
      
    } catch (error) {
      console.error(chalk.red(`Rollback failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Rollback a single operation
   * @private
   */
  async rollbackOperation(operation, results) {
    console.log(chalk.gray(`  Rolling back: ${operation.type} ${operation.path}`));
    
    switch (operation.type) {
      case 'create':
        // Delete created file
        if (await fs.pathExists(operation.path)) {
          await fs.remove(operation.path);
          results.successful.push({
            operation: operation.id,
            action: 'deleted',
            path: operation.path
          });
        } else {
          results.warnings.push({
            operation: operation.id,
            warning: 'File already removed',
            path: operation.path
          });
        }
        break;
        
      case 'update':
        // Restore previous state
        if (operation.previousState) {
          await this.restoreFromBackup(operation.path, operation.previousState);
          results.successful.push({
            operation: operation.id,
            action: 'restored',
            path: operation.path
          });
        } else {
          results.warnings.push({
            operation: operation.id,
            warning: 'No backup available',
            path: operation.path
          });
        }
        break;
        
      case 'delete':
        // Restore deleted file
        if (operation.previousState) {
          await this.restoreFromBackup(operation.path, operation.previousState);
          results.successful.push({
            operation: operation.id,
            action: 'restored',
            path: operation.path
          });
        } else {
          results.warnings.push({
            operation: operation.id,
            warning: 'No backup available',
            path: operation.path
          });
        }
        break;
        
      case 'manifest_update':
        // Special handling for manifest updates
        await this.rollbackManifestUpdate(operation, results);
        break;
        
      case 'metadata_update':
        // Special handling for metadata updates
        await this.rollbackMetadataUpdate(operation, results);
        break;
        
      default:
        results.warnings.push({
          operation: operation.id,
          warning: `Unknown operation type: ${operation.type}`
        });
    }
  }

  /**
   * Get the last transaction for selective rollback
   * @returns {Promise<Object|null>} Last transaction
   */
  async getLastTransaction() {
    try {
      const transactionsDir = this.transactionPath;
      if (!await fs.pathExists(transactionsDir)) {
        return null;
      }
      
      // Get all transaction files
      const files = await fs.readdir(transactionsDir);
      const transactionFiles = files.filter(f => f.endsWith('.json'));
      
      if (transactionFiles.length === 0) {
        return null;
      }
      
      // Sort by timestamp (newest first)
      const transactions = [];
      for (const file of transactionFiles) {
        const transaction = await fs.readJson(path.join(transactionsDir, file));
        transactions.push(transaction);
      }
      
      transactions.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
      
      return transactions[0];
      
    } catch (error) {
      console.error(chalk.red(`Failed to get last transaction: ${error.message}`));
      return null;
    }
  }

  /**
   * List recent transactions
   * @param {number} limit - Number of transactions to return
   * @returns {Promise<Array>} Recent transactions
   */
  async listTransactions(limit = 10) {
    try {
      const transactionsDir = this.transactionPath;
      if (!await fs.pathExists(transactionsDir)) {
        return [];
      }
      
      const files = await fs.readdir(transactionsDir);
      const transactionFiles = files.filter(f => f.endsWith('.json'));
      
      const transactions = [];
      for (const file of transactionFiles) {
        const transaction = await fs.readJson(path.join(transactionsDir, file));
        transactions.push({
          id: transaction.id,
          type: transaction.type,
          description: transaction.description,
          user: transaction.user,
          startTime: transaction.startTime,
          endTime: transaction.endTime,
          status: transaction.status,
          operations: transaction.operations.length
        });
      }
      
      // Sort by start time (newest first)
      transactions.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
      
      return transactions.slice(0, limit);
      
    } catch (error) {
      console.error(chalk.red(`Failed to list transactions: ${error.message}`));
      return [];
    }
  }

  /**
   * Clean up old transactions
   * @returns {Promise<number>} Number of transactions cleaned
   */
  async cleanupOldTransactions() {
    try {
      const transactionsDir = this.transactionPath;
      if (!await fs.pathExists(transactionsDir)) {
        return 0;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      const files = await fs.readdir(transactionsDir);
      let cleaned = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(transactionsDir, file);
          const transaction = await fs.readJson(filePath);
          
          if (new Date(transaction.startTime) < cutoffDate) {
            // Clean up transaction and its backups
            await fs.remove(filePath);
            
            // Remove associated backups
            if (transaction.backups) {
              for (const backup of transaction.backups) {
                if (await fs.pathExists(backup.path)) {
                  await fs.remove(backup.path);
                }
              }
            }
            
            cleaned++;
          }
        }
      }
      
      console.log(chalk.gray(`🧹 Cleaned up ${cleaned} old transactions`));
      return cleaned;
      
    } catch (error) {
      console.error(chalk.red(`Cleanup failed: ${error.message}`));
      return 0;
    }
  }

  /**
   * Backup current state of a file
   * @private
   */
  async backupCurrentState(filePath) {
    try {
      if (!await fs.pathExists(filePath)) {
        return null;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      
      const backup = {
        path: filePath,
        content: content,
        hash: hash,
        timestamp: new Date().toISOString()
      };
      
      // Save backup
      const backupId = `backup-${Date.now()}-${hash.substr(0, 8)}`;
      const backupPath = path.join(this.backupPath, backupId);
      
      await fs.ensureDir(this.backupPath);
      await fs.writeJson(backupPath, backup, { spaces: 2 });
      
      return backupId;
      
    } catch (error) {
      console.error(chalk.red(`Backup failed: ${error.message}`));
      return null;
    }
  }

  /**
   * Restore from backup
   * @private
   */
  async restoreFromBackup(targetPath, backupId) {
    try {
      const backupPath = path.join(this.backupPath, backupId);
      const backup = await fs.readJson(backupPath);
      
      // Ensure directory exists
      await fs.ensureDir(path.dirname(targetPath));
      
      // Restore content
      await fs.writeFile(targetPath, backup.content, 'utf8');
      
      console.log(chalk.green(`   ✓ Restored: ${path.basename(targetPath)}`));
      
    } catch (error) {
      console.error(chalk.red(`Restore failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Rollback manifest update
   * @private
   */
  async rollbackManifestUpdate(operation, results) {
    try {
      const manifestPath = path.join(this.rootPath, 'aios-core', 'team-manifest.yaml');
      
      if (operation.previousState) {
        // Restore previous manifest state
        const backupPath = path.join(this.backupPath, operation.previousState);
        const backup = await fs.readJson(backupPath);
        await fs.writeFile(manifestPath, backup.content, 'utf8');
        
        results.successful.push({
          operation: operation.id,
          action: 'manifest_restored',
          path: manifestPath
        });
      } else {
        results.warnings.push({
          operation: operation.id,
          warning: 'No manifest backup available'
        });
      }
      
    } catch (error) {
      results.failed.push({
        operation: operation.id,
        error: `Manifest rollback failed: ${error.message}`
      });
    }
  }

  /**
   * Rollback metadata update
   * @private
   */
  async rollbackMetadataUpdate(operation, results) {
    try {
      if (operation.metadata?.componentType && operation.metadata?.componentId) {
        // Revert metadata changes
        // This would need integration with ComponentMetadata
        results.warnings.push({
          operation: operation.id,
          warning: 'Metadata rollback not fully implemented'
        });
      }
      
    } catch (error) {
      results.failed.push({
        operation: operation.id,
        error: `Metadata rollback failed: ${error.message}`
      });
    }
  }

  /**
   * Archive backups after successful commit
   * @private
   */
  async archiveBackups(transaction) {
    // Move backups to archive directory with transaction reference
    const archivePath = path.join(this.backupPath, 'archive', transaction.id);
    await fs.ensureDir(archivePath);
    
    // Archive transaction file
    const transactionArchive = path.join(archivePath, 'transaction.json');
    await fs.writeJson(transactionArchive, transaction, { spaces: 2 });
  }

  /**
   * Generate transaction ID
   * @private
   */
  generateTransactionId() {
    return `txn-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Save transaction to disk
   * @private
   */
  async saveTransaction(transaction) {
    await fs.ensureDir(this.transactionPath);
    const filePath = path.join(this.transactionPath, `${transaction.id}.json`);
    await fs.writeJson(filePath, transaction, { spaces: 2 });
  }

  /**
   * Load transaction from disk
   * @private
   */
  async loadTransaction(transactionId) {
    try {
      const filePath = path.join(this.transactionPath, `${transactionId}.json`);
      if (await fs.pathExists(filePath)) {
        return await fs.readJson(filePath);
      }
      return null;
    } catch (error) {
      console.error(chalk.red(`Failed to load transaction: ${error.message}`));
      return null;
    }
  }
}

module.exports = TransactionManager;