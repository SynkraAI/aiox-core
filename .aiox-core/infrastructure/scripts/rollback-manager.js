#!/usr/bin/env node

/**
 * AIOX Rollback Manager
 *
 * Story: 5.4 - Rollback Manager
 * Epic: Epic 5 - Recovery & Resilience
 *
 * Manages targeted rollbacks for subtasks, storing commit checkpoints
 * and providing safe rollback operations with confirmation.
 *
 * Features:
 * - AC1: Located in `.aiox-core/infrastructure/scripts/`
 * - AC2: Stores last good commit per subtask in `recovery/commits.json`
 * - AC3: Command `*rollback {subtask-id}` in @dev
 * - AC4: Targeted rollback - only affects files for specific subtask
 * - AC5: Warning/confirmation before executing rollback
 * - AC6: Log of rollbacks in `recovery/rollback-log.json`
 * - AC7: Option `--hard` to force without confirmation
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Handle different execa versions (v5 exports directly, v6+ exports under .execa)
let execa;
try {
  const execaModule = require('execa');
  execa = execaModule.execa || execaModule;
} catch {
  execa = null;
}

// ===============================================================================
//                              CONFIGURATION
// ===============================================================================

const CONFIG = {
  // File names for recovery data
  commitsFile: 'commits.json',
  rollbackLogFile: 'rollback-log.json',
  // Default recovery directory relative to story path
  defaultRecoveryDir: 'recovery',
  // Stories base path
  storiesBasePath: 'docs/stories',
};

// ===============================================================================
//                              ROLLBACK MANAGER CLASS
// ===============================================================================

class RollbackManager {
  /**
   * Create a new RollbackManager instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.storyId - Story ID (e.g., 'STORY-42')
   * @param {string} [options.recoveryPath] - Explicit path to recovery directory
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   */
  constructor(options = {}) {
    this.storyId = options.storyId;
    this.rootPath = options.rootPath || process.cwd();
    this.recoveryPath = options.recoveryPath || null;

    this._initPaths();
  }

  /**
   * Initialize file paths based on story ID or explicit recovery path
   * @private
   */
  _initPaths() {
    if (this.recoveryPath) {
      // Use explicit recovery path
      if (!path.isAbsolute(this.recoveryPath)) {
        this.recoveryPath = path.join(this.rootPath, this.recoveryPath);
      }
    } else if (this.storyId) {
      // Derive recovery path from story ID
      const storyPath = this._findStoryPath();
      if (storyPath) {
        this.recoveryPath = path.join(storyPath, CONFIG.defaultRecoveryDir);
      } else {
        // Default path for new stories
        this.recoveryPath = path.join(
          this.rootPath,
          CONFIG.storiesBasePath,
          this.storyId,
          CONFIG.defaultRecoveryDir
        );
      }
    }

    // Define file paths
    this.commitsPath = path.join(this.recoveryPath, CONFIG.commitsFile);
    this.rollbackLogPath = path.join(this.recoveryPath, CONFIG.rollbackLogFile);
  }

  /**
   * Find story path in common locations
   * @private
   * @returns {string|null} Path to story directory or null
   */
  _findStoryPath() {
    const searchPaths = [
      path.join(this.rootPath, CONFIG.storiesBasePath, this.storyId),
      path.join(this.rootPath, CONFIG.storiesBasePath, this.storyId.toLowerCase()),
      path.join(this.rootPath, CONFIG.storiesBasePath, this.storyId.replace(/[_]/g, '-')),
    ];

    // Also search in epic-based directories
    const storiesDir = path.join(this.rootPath, CONFIG.storiesBasePath);
    if (fs.existsSync(storiesDir)) {
      try {
        const epicDirs = fs
          .readdirSync(storiesDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);

        for (const epicDir of epicDirs) {
          searchPaths.push(
            path.join(storiesDir, epicDir, this.storyId),
            path.join(storiesDir, epicDir, this.storyId.toLowerCase())
          );
        }
      } catch {
        // Ignore errors reading directories
      }
    }

    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  /**
   * Ensure recovery directory exists
   * @private
   */
  async _ensureRecoveryDir() {
    if (!fs.existsSync(this.recoveryPath)) {
      await fsPromises.mkdir(this.recoveryPath, { recursive: true });
    }
  }

  /**
   * Load commits data from file
   * @returns {Promise<Object>} Commits data
   */
  async loadCommits() {
    try {
      if (fs.existsSync(this.commitsPath)) {
        const content = await fsPromises.readFile(this.commitsPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Warning: Could not load commits file: ${error.message}`);
    }

    // Return default structure
    return {
      storyId: this.storyId,
      commits: {},
    };
  }

  /**
   * Save commits data to file (AC2)
   * @param {Object} commitsData - Commits data to save
   */
  async saveCommits(commitsData) {
    await this._ensureRecoveryDir();
    await fsPromises.writeFile(this.commitsPath, JSON.stringify(commitsData, null, 2), 'utf-8');
  }

  /**
   * Load rollback log from file
   * @returns {Promise<Object>} Rollback log data
   */
  async loadRollbackLog() {
    try {
      if (fs.existsSync(this.rollbackLogPath)) {
        const content = await fsPromises.readFile(this.rollbackLogPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Warning: Could not load rollback log: ${error.message}`);
    }

    // Return default structure
    return {
      rollbacks: [],
    };
  }

  /**
   * Save rollback log to file (AC6)
   * @param {Object} logData - Rollback log data to save
   */
  async saveRollbackLog(logData) {
    await this._ensureRecoveryDir();
    await fsPromises.writeFile(this.rollbackLogPath, JSON.stringify(logData, null, 2), 'utf-8');
  }

  /**
   * Get current git commit hash
   * @returns {Promise<string>} Current commit hash
   */
  async getCurrentCommit() {
    if (!execa) {
      throw new Error('execa module not available for git operations');
    }
    try {
      const { stdout } = await execa('git', ['rev-parse', 'HEAD'], {
        cwd: this.rootPath,
      });
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get current commit: ${error.message}`);
    }
  }

  /**
   * Save a checkpoint for a subtask (AC2)
   *
   * @param {string} subtaskId - Subtask ID (e.g., '2.1')
   * @param {Object} options - Checkpoint options
   * @param {string} [options.commit] - Commit hash (defaults to current HEAD)
   * @param {string[]} [options.files] - List of files associated with this subtask
   * @returns {Promise<Object>} Saved checkpoint data
   */
  async saveCheckpoint(subtaskId, options = {}) {
    const commit = options.commit || (await this.getCurrentCommit());
    const files = options.files || [];
    const timestamp = new Date().toISOString();

    const commitsData = await this.loadCommits();

    commitsData.commits[subtaskId] = {
      lastGood: commit,
      timestamp,
      files,
    };

    await this.saveCommits(commitsData);

    console.log(`Checkpoint saved for subtask ${subtaskId}`);
    console.log(`  Commit: ${commit.substring(0, 7)}`);
    console.log(`  Files: ${files.length > 0 ? files.join(', ') : '(none specified)'}`);

    return commitsData.commits[subtaskId];
  }

  /**
   * Get checkpoint for a subtask
   *
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<Object|null>} Checkpoint data or null if not found
   */
  async getCheckpoint(subtaskId) {
    const commitsData = await this.loadCommits();
    return commitsData.commits[subtaskId] || null;
  }

  /**
   * Prompt user for confirmation (AC5)
   * @private
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>} True if confirmed
   */
  async _confirmAction(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * Perform targeted rollback for a subtask (AC3, AC4)
   *
   * @param {string} subtaskId - Subtask ID to rollback
   * @param {Object} options - Rollback options
   * @param {boolean} [options.hard=false] - Skip confirmation (AC7)
   * @param {string} [options.reason] - Reason for rollback
   * @returns {Promise<Object>} Rollback result
   */
  async rollback(subtaskId, options = {}) {
    const { hard = false, reason = 'manual rollback' } = options;

    const result = {
      success: false,
      subtaskId,
      from: null,
      to: null,
      filesAffected: [],
      timestamp: new Date().toISOString(),
      reason,
    };

    // Get checkpoint for this subtask
    const checkpoint = await this.getCheckpoint(subtaskId);
    if (!checkpoint) {
      throw new Error(`No checkpoint found for subtask ${subtaskId}`);
    }

    // Get current commit
    const currentCommit = await this.getCurrentCommit();
    result.from = currentCommit;
    result.to = checkpoint.lastGood;

    // Check if already at the checkpoint
    if (currentCommit === checkpoint.lastGood) {
      console.log(
        `Already at checkpoint ${checkpoint.lastGood.substring(0, 7)} for subtask ${subtaskId}`
      );
      result.success = true;
      result.message = 'Already at checkpoint';
      return result;
    }

    // Display warning and get confirmation (AC5)
    console.log('\n========================================');
    console.log('           ROLLBACK WARNING            ');
    console.log('========================================\n');
    console.log(`Story: ${this.storyId}`);
    console.log(`Subtask: ${subtaskId}`);
    console.log(`Current commit: ${currentCommit.substring(0, 7)}`);
    console.log(`Target commit:  ${checkpoint.lastGood.substring(0, 7)}`);
    console.log(`Reason: ${reason}`);

    if (checkpoint.files && checkpoint.files.length > 0) {
      console.log(`\nFiles that may be affected:`);
      for (const file of checkpoint.files) {
        console.log(`  - ${file}`);
      }
      result.filesAffected = checkpoint.files;
    }

    console.log('\nThis operation will:');
    if (checkpoint.files && checkpoint.files.length > 0) {
      console.log('  - Restore specific files to their checkpoint state (targeted rollback)');
    } else {
      console.log('  - Reset HEAD to the checkpoint commit');
    }
    console.log('');

    // Confirm unless --hard is specified (AC7)
    if (!hard) {
      const confirmed = await this._confirmAction('Proceed with rollback?');
      if (!confirmed) {
        console.log('Rollback cancelled.');
        result.message = 'Cancelled by user';
        return result;
      }
    } else {
      console.log('--hard flag specified, skipping confirmation...\n');
    }

    try {
      if (!execa) {
        throw new Error('execa module not available for git operations');
      }

      // Perform targeted rollback (AC4)
      if (checkpoint.files && checkpoint.files.length > 0) {
        // Targeted rollback: only restore specific files
        console.log('Performing targeted rollback...');

        for (const file of checkpoint.files) {
          try {
            await execa('git', ['checkout', checkpoint.lastGood, '--', file], {
              cwd: this.rootPath,
            });
            console.log(`  Restored: ${file}`);
          } catch (fileError) {
            console.warn(`  Warning: Could not restore ${file}: ${fileError.message}`);
          }
        }
      } else {
        // Full rollback: reset to checkpoint commit
        console.log('Performing full rollback (no specific files tracked)...');
        await execa('git', ['checkout', checkpoint.lastGood], {
          cwd: this.rootPath,
        });
      }

      result.success = true;
      result.message = 'Rollback completed successfully';

      console.log('\nRollback completed successfully!');

      // Log the rollback (AC6)
      await this._logRollback(result);
    } catch (error) {
      result.success = false;
      result.error = error.message;
      console.error(`\nRollback failed: ${error.message}`);

      // Still log the failed attempt
      await this._logRollback(result);
    }

    return result;
  }

  /**
   * Log a rollback operation (AC6)
   * @private
   * @param {Object} rollbackResult - Rollback result to log
   */
  async _logRollback(rollbackResult) {
    const logData = await this.loadRollbackLog();

    logData.rollbacks.push({
      subtaskId: rollbackResult.subtaskId,
      timestamp: rollbackResult.timestamp,
      from: rollbackResult.from,
      to: rollbackResult.to,
      reason: rollbackResult.reason,
      filesAffected: rollbackResult.filesAffected,
      success: rollbackResult.success,
      error: rollbackResult.error || null,
    });

    await this.saveRollbackLog(logData);
  }

  /**
   * Get rollback log (AC6)
   * @returns {Promise<Object>} Rollback log data
   */
  async getRollbackLog() {
    return await this.loadRollbackLog();
  }

  /**
   * List all checkpoints for this story
   * @returns {Promise<Object>} All checkpoints
   */
  async listCheckpoints() {
    const commitsData = await this.loadCommits();
    return commitsData.commits;
  }

  /**
   * Remove a checkpoint
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<boolean>} True if removed
   */
  async removeCheckpoint(subtaskId) {
    const commitsData = await this.loadCommits();

    if (commitsData.commits[subtaskId]) {
      delete commitsData.commits[subtaskId];
      await this.saveCommits(commitsData);
      console.log(`Checkpoint removed for subtask ${subtaskId}`);
      return true;
    }

    console.log(`No checkpoint found for subtask ${subtaskId}`);
    return false;
  }

  /**
   * Clear all checkpoints for this story
   * @returns {Promise<void>}
   */
  async clearAllCheckpoints() {
    await this.saveCommits({
      storyId: this.storyId,
      commits: {},
    });
    console.log(`All checkpoints cleared for story ${this.storyId}`);
  }
}

// ===============================================================================
//                              CLI INTERFACE
// ===============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Rollback Manager - AIOX Recovery System (Story 5.4)

Usage:
  node rollback-manager.js <command> <story-id> [subtask-id] [options]
  *rollback <story-id> <subtask-id> [options]

Commands:
  checkpoint <story-id> <subtask-id>    Save current commit as checkpoint for subtask
  rollback <story-id> <subtask-id>      Rollback subtask to last checkpoint
  log <story-id>                        View rollback history
  list <story-id>                       List all checkpoints for story
  remove <story-id> <subtask-id>        Remove checkpoint for subtask
  clear <story-id>                      Clear all checkpoints for story

Options:
  --hard                   Skip confirmation for rollback (AC7)
  --reason <text>          Reason for rollback
  --files <file1,file2>    Files associated with checkpoint (comma-separated)
  --commit <hash>          Specific commit hash for checkpoint
  --recovery-path <path>   Custom path to recovery directory
  --help, -h               Show this help message

Examples:
  # Save checkpoint for subtask 2.1
  node rollback-manager.js checkpoint STORY-42 2.1 --files src/stores/authStore.ts

  # Rollback subtask 2.1 with confirmation
  node rollback-manager.js rollback STORY-42 2.1 --reason "stuck after 3 attempts"

  # Force rollback without confirmation
  node rollback-manager.js rollback STORY-42 2.1 --hard --reason "manual reset"

  # View rollback history
  node rollback-manager.js log STORY-42

  # List all checkpoints
  node rollback-manager.js list STORY-42

Acceptance Criteria Coverage:
  AC1: Located in .aiox-core/infrastructure/scripts/
  AC2: Stores last good commit per subtask in recovery/commits.json
  AC3: Command *rollback {subtask-id} support
  AC4: Targeted rollback - only affects subtask files
  AC5: Warning/confirmation before rollback
  AC6: Log of rollbacks in recovery/rollback-log.json
  AC7: Option --hard for force without confirmation
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  const command = args[0];
  let storyId = null;
  let subtaskId = null;
  let reason = 'manual';
  let hard = false;
  let files = [];
  let commit = null;
  let recoveryPath = null;

  // Parse positional and flag arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--hard') {
      hard = true;
    } else if (arg === '--reason' && args[i + 1]) {
      reason = args[++i];
    } else if (arg === '--files' && args[i + 1]) {
      files = args[++i].split(',').map((f) => f.trim());
    } else if (arg === '--commit' && args[i + 1]) {
      commit = args[++i];
    } else if (arg === '--recovery-path' && args[i + 1]) {
      recoveryPath = args[++i];
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else if (!subtaskId) {
        subtaskId = arg;
      }
    }
  }

  // Validate required arguments
  if (!storyId && !recoveryPath) {
    console.error('Error: Story ID required');
    process.exit(1);
  }

  try {
    const manager = new RollbackManager({
      storyId,
      recoveryPath,
    });

    switch (command) {
      case 'checkpoint': {
        if (!subtaskId) {
          console.error('Error: Subtask ID required for checkpoint command');
          process.exit(1);
        }
        const checkpointOptions = {};
        if (files.length > 0) checkpointOptions.files = files;
        if (commit) checkpointOptions.commit = commit;

        await manager.saveCheckpoint(subtaskId, checkpointOptions);
        break;
      }

      case 'rollback': {
        if (!subtaskId) {
          console.error('Error: Subtask ID required for rollback command');
          process.exit(1);
        }
        const result = await manager.rollback(subtaskId, { hard, reason });

        if (
          !result.success &&
          result.message !== 'Cancelled by user' &&
          result.message !== 'Already at checkpoint'
        ) {
          process.exit(1);
        }
        break;
      }

      case 'log': {
        const log = await manager.getRollbackLog();

        if (log.rollbacks.length === 0) {
          console.log(`\nNo rollbacks recorded for story ${storyId}`);
        } else {
          console.log(`\nRollback History for ${storyId}:`);
          console.log('─'.repeat(60));

          for (const entry of log.rollbacks) {
            const status = entry.success ? 'SUCCESS' : 'FAILED';
            console.log(`\n[${entry.timestamp}] ${status}`);
            console.log(`  Subtask: ${entry.subtaskId}`);
            console.log(
              `  From: ${entry.from?.substring(0, 7) || 'N/A'} -> To: ${entry.to?.substring(0, 7) || 'N/A'}`
            );
            console.log(`  Reason: ${entry.reason}`);
            if (entry.filesAffected && entry.filesAffected.length > 0) {
              console.log(`  Files: ${entry.filesAffected.join(', ')}`);
            }
            if (entry.error) {
              console.log(`  Error: ${entry.error}`);
            }
          }
        }
        break;
      }

      case 'list': {
        const checkpoints = await manager.listCheckpoints();
        const entries = Object.entries(checkpoints);

        if (entries.length === 0) {
          console.log(`\nNo checkpoints found for story ${storyId}`);
        } else {
          console.log(`\nCheckpoints for ${storyId}:`);
          console.log('─'.repeat(60));

          for (const [id, data] of entries) {
            console.log(`\n  Subtask ${id}:`);
            console.log(`    Commit: ${data.lastGood?.substring(0, 7) || 'N/A'}`);
            console.log(`    Timestamp: ${data.timestamp}`);
            if (data.files && data.files.length > 0) {
              console.log(`    Files: ${data.files.join(', ')}`);
            }
          }
        }
        break;
      }

      case 'remove': {
        if (!subtaskId) {
          console.error('Error: Subtask ID required for remove command');
          process.exit(1);
        }
        await manager.removeCheckpoint(subtaskId);
        break;
      }

      case 'clear': {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const confirmed = await new Promise((resolve) => {
          rl.question(`Clear ALL checkpoints for ${storyId}? (y/N): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
          });
        });

        if (confirmed) {
          await manager.clearAllCheckpoints();
        } else {
          console.log('Operation cancelled.');
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run with --help for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

// ===============================================================================
//                              EXPORTS
// ===============================================================================

module.exports = {
  RollbackManager,
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
