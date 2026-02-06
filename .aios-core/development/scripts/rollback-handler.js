/**
 * Rollback Handler for AIOS-FULLSTACK
 * Handles undo operations for component transactions
 * @module rollback-handler
 */

const TransactionManager = require('./transaction-manager');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs').promises;
const ModificationValidator = require('./modification-validator');

class RollbackHandler {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.transactionManager = new TransactionManager({ rootPath: this.rootPath });
    this.modificationValidator = new ModificationValidator();
    this.backupPath = path.join(this.rootPath, 'aios-core', '.backups');
  }

  /**
   * Execute undo-last command
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} Rollback result
   */
  async undoLast(options = {}) {
    try {
      let transaction;
      
      if (options.transactionId) {
        // Load specific transaction
        transaction = await this.transactionManager.loadTransaction(options.transactionId);
        if (!transaction) {
          throw new Error(`Transaction not found: ${options.transactionId}`);
        }
      } else {
        // Get last transaction
        transaction = await this.transactionManager.getLastTransaction();
        if (!transaction) {
          console.log(chalk.yellow('No transactions found to rollback'));
          return { success: false, error: 'No transactions found' };
        }
      }
      
      // Display transaction details
      console.log(chalk.blue('\n📋 Transaction Details:'));
      console.log(chalk.gray(`ID: ${transaction.id}`));
      console.log(chalk.gray(`Type: ${transaction.type}`));
      console.log(chalk.gray(`Date: ${new Date(transaction.startTime).toLocaleString()}`));
      console.log(chalk.gray(`Status: ${transaction.status}`));
      console.log(chalk.gray(`Operations: ${transaction.operations.length}`));
      
      // Show operations
      console.log(chalk.blue('\n📝 Operations to rollback:'));
      for (const op of transaction.operations) {
        const icon = this.getOperationIcon(op.type);
        console.log(chalk.gray(`  ${icon} ${op.type}: ${path.basename(op.path)}`));
      }
      
      // Confirm rollback
      if (!options.force) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to rollback this transaction?',
          default: true
        }]);
        
        if (!confirm) {
          console.log(chalk.yellow('Rollback cancelled'));
          return { success: false, error: 'User cancelled' };
        }
      }
      
      // Execute rollback
      console.log(chalk.blue('\n⚙️  Executing rollback...'));
      
      const rollbackResult = await this.transactionManager.rollbackTransaction(
        transaction.id,
        {
          continueOnError: options.continueOnError !== false
        }
      );
      
      // Display results
      this.displayRollbackResults(rollbackResult);
      
      return {
        success: rollbackResult.failed.length === 0,
        result: rollbackResult
      };
      
    } catch (error) {
      console.error(chalk.red(`\n❌ Rollback failed: ${error.message}`));
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List recent transactions
   * @param {number} limit - Number of transactions to show
   * @returns {Promise<void>}
   */
  async listTransactions(limit = 10) {
    try {
      const transactions = await this.transactionManager.listTransactions(limit);
      
      if (transactions.length === 0) {
        console.log(chalk.yellow('No transactions found'));
        return;
      }
      
      console.log(chalk.blue('\n📋 Recent Transactions:'));
      console.log(chalk.gray('─'.repeat(80)));
      
      for (const txn of transactions) {
        const date = new Date(txn.startTime).toLocaleString();
        const duration = txn.endTime 
          ? `${new Date(txn.endTime) - new Date(txn.startTime)}ms`
          : 'active';
        
        console.log(chalk.white(`\nID: ${txn.id}`));
        console.log(chalk.gray(`Type: ${txn.type}`));
        console.log(chalk.gray(`Description: ${txn.description}`));
        console.log(chalk.gray(`User: ${txn.user}`));
        console.log(chalk.gray(`Date: ${date}`));
        console.log(chalk.gray(`Status: ${this.getStatusColor(txn.status)}`));
        console.log(chalk.gray(`Operations: ${txn.operations}`));
        console.log(chalk.gray(`Duration: ${duration}`));
        console.log(chalk.gray('─'.repeat(80)));
      }
      
    } catch (error) {
      console.error(chalk.red(`Failed to list transactions: ${error.message}`));
    }
  }

  /**
   * Execute selective rollback
   * @param {string} transactionId - Transaction ID
   * @param {Array<string>} operationIds - Specific operations to rollback
   * @returns {Promise<Object>} Rollback result
   */
  async selectiveRollback(transactionId, operationIds) {
    try {
      const transaction = await this.transactionManager.loadTransaction(transactionId);
      if (!transaction) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }
      
      // Filter operations
      const selectedOps = transaction.operations.filter(op => 
        operationIds.includes(op.id)
      );
      
      if (selectedOps.length === 0) {
        throw new Error('No matching operations found');
      }
      
      console.log(chalk.blue(`\n📝 Selective rollback: ${selectedOps.length} operations`));
      
      // Create a new transaction for selective rollback
      const rollbackTxnId = await this.transactionManager.beginTransaction({
        type: 'selective_rollback',
        description: `Selective rollback of ${transactionId}`,
        metadata: {
          originalTransaction: transactionId,
          selectedOperations: operationIds
        }
      });
      
      const results = {
        successful: [],
        failed: [],
        warnings: []
      };
      
      // Rollback selected operations
      for (const op of selectedOps) {
        try {
          await this.transactionManager.rollbackOperation(op, results);
        } catch (error) {
          results.failed.push({
            operation: op.id,
            error: error.message
          });
        }
      }
      
      // Commit rollback transaction
      await this.transactionManager.commitTransaction(rollbackTxnId);
      
      this.displayRollbackResults(results);
      
      return {
        success: results.failed.length === 0,
        result: results
      };
      
    } catch (error) {
      console.error(chalk.red(`Selective rollback failed: ${error.message}`));
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up old transactions
   * @returns {Promise<number>} Number cleaned
   */
  async cleanup() {
    try {
      console.log(chalk.blue('🧹 Cleaning up old transactions...'));
      const cleaned = await this.transactionManager.cleanupOldTransactions();
      console.log(chalk.green(`✅ Cleaned up ${cleaned} old transactions`));
      return cleaned;
    } catch (error) {
      console.error(chalk.red(`Cleanup failed: ${error.message}`));
      return 0;
    }
  }

  /**
   * Create backup before modification
   * @param {string} componentType - Type of component
   * @param {string} componentName - Name of component
   * @param {string} content - Content to backup
   * @returns {Promise<string>} Backup file path
   */
  async createBackup(componentType, componentName, content) {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupPath, { recursive: true });
      
      // Create subdirectory for component type
      const typeBackupPath = path.join(this.backupPath, componentType);
      await fs.mkdir(typeBackupPath, { recursive: true });
      
      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `${componentName}.${timestamp}.backup`;
      const backupFilePath = path.join(typeBackupPath, backupFilename);
      
      // Write backup
      await fs.writeFile(backupFilePath, content, 'utf8');
      
      // Record backup in transaction
      if (this.currentTransactionId) {
        await this.transactionManager.recordOperation({
          type: 'backup_created',
          path: backupFilePath,
          componentType,
          componentName,
          timestamp
        });
      }
      
      return backupFilePath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Restore from backup
   * @param {string} backupPath - Path to backup file
   * @param {string} targetPath - Path to restore to
   * @returns {Promise<boolean>} Success status
   */
  async restoreFromBackup(backupPath, targetPath) {
    try {
      // Verify backup exists
      await fs.access(backupPath);
      
      // Read backup content
      const content = await fs.readFile(backupPath, 'utf8');
      
      // Restore to target
      await fs.writeFile(targetPath, content, 'utf8');
      
      console.log(chalk.green(`✅ Restored from backup: ${path.basename(backupPath)}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to restore from backup: ${error.message}`));
      return false;
    }
  }

  /**
   * Validate modification before applying
   * @param {string} componentType - Type of component
   * @param {string} originalContent - Original content
   * @param {string} modifiedContent - Modified content
   * @returns {Promise<Object>} Validation result
   */
  async validateModification(componentType, originalContent, modifiedContent) {
    const validation = await this.modificationValidator.validateModification(
      componentType,
      originalContent,
      modifiedContent
    );
    
    if (!validation.valid) {
      console.log(chalk.red('\n❌ Modification validation failed:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`   • ${error}`));
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`   • ${warning}`));
      });
    }
    
    if (validation.breakingChanges.length > 0) {
      console.log(chalk.red('\n🚨 Breaking Changes Detected:'));
      validation.breakingChanges.forEach(change => {
        console.log(chalk.red(`   • ${change.type}: ${change.impact}`));
        if (change.items) {
          console.log(chalk.red(`     Items: ${change.items.join(', ')}`));
        }
      });
    }
    
    return validation;
  }

  /**
   * Rollback modification
   * @param {Object} modificationData - Modification details
   * @returns {Promise<Object>} Rollback result
   */
  async rollbackModification(modificationData) {
    const { componentType, componentName, backupPath, targetPath } = modificationData;
    
    try {
      console.log(chalk.blue(`\n⏪ Rolling back ${componentType}: ${componentName}`));
      
      // Restore from backup
      const restored = await this.restoreFromBackup(backupPath, targetPath);
      
      if (restored) {
        // Record rollback
        await this.transactionManager.recordOperation({
          type: 'modification_rollback',
          componentType,
          componentName,
          backupPath,
          targetPath,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          message: `Successfully rolled back ${componentType}: ${componentName}`
        };
      } else {
        throw new Error('Restoration failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List available backups for a component
   * @param {string} componentType - Type of component
   * @param {string} componentName - Name of component
   * @returns {Promise<Array>} List of backups
   */
  async listBackups(componentType, componentName) {
    try {
      const typeBackupPath = path.join(this.backupPath, componentType);
      const files = await fs.readdir(typeBackupPath);
      
      const backups = files
        .filter(file => file.startsWith(`${componentName}.`) && file.endsWith('.backup'))
        .map(file => {
          const match = file.match(/\.(\d{4}-\d{2}-\d{2}T[\d-]+Z)\.backup$/);
          const timestamp = match ? match[1].replace(/-/g, ':') : 'unknown';
          
          return {
            filename: file,
            path: path.join(typeBackupPath, file),
            timestamp: new Date(timestamp),
            componentName,
            componentType
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);
      
      return backups;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Clean up old backups
   * @param {number} daysToKeep - Number of days to keep backups
   * @returns {Promise<number>} Number of backups deleted
   */
  async cleanupBackups(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      // Iterate through component types
      const componentTypes = await fs.readdir(this.backupPath);
      
      for (const componentType of componentTypes) {
        const typePath = path.join(this.backupPath, componentType);
        const stat = await fs.stat(typePath);
        
        if (!stat.isDirectory()) continue;
        
        const files = await fs.readdir(typePath);
        
        for (const file of files) {
          if (!file.endsWith('.backup')) continue;
          
          const filePath = path.join(typePath, file);
          const fileStat = await fs.stat(filePath);
          
          if (fileStat.mtime < cutoffDate) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error(chalk.red(`Backup cleanup failed: ${error.message}`));
      return 0;
    }
  }

  /**
   * Get operation icon
   * @private
   */
  getOperationIcon(type) {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      manifest_update: '📋',
      metadata_update: '📊',
      component_created: '📦',
      backup_created: '💾',
      modification_rollback: '⏪'
    };
    
    return icons[type] || '•';
  }

  /**
   * Get status color
   * @private
   */
  getStatusColor(status) {
    switch (status) {
      case 'active':
        return chalk.yellow(status);
      case 'committed':
        return chalk.green(status);
      case 'rolled_back':
        return chalk.blue(status);
      case 'failed':
        return chalk.red(status);
      default:
        return status;
    }
  }

  /**
   * Display rollback results
   * @private
   */
  displayRollbackResults(results) {
    console.log(chalk.blue('\n📊 Rollback Results:'));
    
    if (results.successful.length > 0) {
      console.log(chalk.green(`\n✅ Successful (${results.successful.length}):`));
      results.successful.forEach(item => {
        console.log(chalk.green(`   ✓ ${item.action}: ${path.basename(item.path)}`));
      });
    }
    
    if (results.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Warnings (${results.warnings.length}):`));
      results.warnings.forEach(item => {
        console.log(chalk.yellow(`   ⚠ ${item.warning}: ${path.basename(item.path || 'N/A')}`));
      });
    }
    
    if (results.failed.length > 0) {
      console.log(chalk.red(`\n❌ Failed (${results.failed.length}):`));
      results.failed.forEach(item => {
        console.log(chalk.red(`   ✗ ${item.operation}: ${item.error}`));
      });
    }
    
    // Summary
    const total = results.successful.length + results.failed.length;
    const successRate = total > 0 ? (results.successful.length / total * 100).toFixed(0) : 0;
    
    console.log(chalk.blue('\n📈 Summary:'));
    console.log(chalk.gray(`   Total operations: ${total}`));
    console.log(chalk.gray(`   Success rate: ${successRate}%`));
  }
}

module.exports = RollbackHandler;