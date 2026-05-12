#!/usr/bin/env node

/**
 * AIOX Recovery Tracker
 *
 * Story: 5.1 - Attempt Tracker
 * Epic: Epic 5 - Recovery System
 *
 * Tracks implementation attempts for subtasks during story development.
 * Records approach, changes, success/failure, and error information.
 *
 * Features:
 * - AC1: Located in `.aiox-core/infrastructure/scripts/`
 * - AC2: Registra: attempt_number, timestamp, approach, success/fail, error
 * - AC3: Output: `docs/stories/{story-id}/recovery/attempts.json`
 * - AC4: Comando `*track-attempt {subtask-id}` no @dev
 * - AC5: Schema de validacao para attempts.json
 * - AC6: Historico mantido por subtask (nao por story)
 * - AC7: Auto-increment de attempt_number
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Optional dependencies with graceful fallback
let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
    dim: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC3: Default recovery directory within story
  recoveryDir: 'recovery',
  // AC3: Attempts file name
  attemptsFile: 'attempts.json',
  // Stories base directory
  storiesBasePath: 'docs/stories',
  // Schema version
  schemaVersion: '1.0',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATUS ENUM
// ═══════════════════════════════════════════════════════════════════════════════════

const AttemptStatus = {
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
};

const SubtaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              SCHEMA VALIDATION (AC5)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * JSON Schema for attempts.json
 * AC5: Schema de validacao para attempts.json
 */
const ATTEMPTS_SCHEMA = {
  type: 'object',
  required: ['subtaskId', 'storyId', 'attempts', 'currentAttempt', 'status'],
  properties: {
    subtaskId: { type: 'string', pattern: '^\\d+\\.\\d+$' },
    storyId: { type: 'string' },
    attempts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['number', 'timestamp', 'approach'],
        properties: {
          number: { type: 'integer', minimum: 1 },
          timestamp: { type: 'string', format: 'date-time' },
          approach: { type: 'string' },
          changes: { type: 'array', items: { type: 'string' } },
          success: { type: 'boolean' },
          error: { type: 'string' },
          duration: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
        },
      },
    },
    currentAttempt: { type: 'integer', minimum: 0 },
    status: { enum: ['pending', 'in_progress', 'completed', 'failed'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

/**
 * Validate attempts data against schema
 * @param {Object} data - Data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateAttemptsSchema(data) {
  const errors = [];

  // Required fields
  for (const field of ATTEMPTS_SCHEMA.required) {
    if (data[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type checks
  if (typeof data.subtaskId !== 'string') {
    errors.push('subtaskId must be a string');
  } else if (!/^\d+\.\d+$/.test(data.subtaskId)) {
    errors.push('subtaskId must match pattern X.Y (e.g., "2.1")');
  }

  if (typeof data.storyId !== 'string') {
    errors.push('storyId must be a string');
  }

  if (!Array.isArray(data.attempts)) {
    errors.push('attempts must be an array');
  } else {
    for (let i = 0; i < data.attempts.length; i++) {
      const attempt = data.attempts[i];
      if (typeof attempt.number !== 'number' || attempt.number < 1) {
        errors.push(`attempts[${i}].number must be a positive integer`);
      }
      if (typeof attempt.timestamp !== 'string') {
        errors.push(`attempts[${i}].timestamp must be a string`);
      }
      if (typeof attempt.approach !== 'string') {
        errors.push(`attempts[${i}].approach must be a string`);
      }
      if (attempt.changes !== undefined && !Array.isArray(attempt.changes)) {
        errors.push(`attempts[${i}].changes must be an array`);
      }
    }
  }

  if (typeof data.currentAttempt !== 'number' || data.currentAttempt < 0) {
    errors.push('currentAttempt must be a non-negative integer');
  }

  const validStatuses = ['pending', 'in_progress', 'completed', 'failed'];
  if (!validStatuses.includes(data.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              RECOVERY TRACKER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * RecoveryTracker - Tracks implementation attempts for subtasks
 *
 * AC6: Historico mantido por subtask (nao por story)
 * Each subtask has its own attempts history within the story's recovery folder.
 */
class RecoveryTracker {
  /**
   * Create a new RecoveryTracker instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.storyId - Story ID (e.g., 'STORY-42')
   * @param {string} [options.recoveryPath] - Explicit path to recovery directory
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   */
  constructor(options = {}) {
    if (!options.storyId) {
      throw new Error('storyId is required');
    }

    this.storyId = options.storyId;
    this.rootPath = options.rootPath || process.cwd();
    this.recoveryPath = options.recoveryPath || this._getDefaultRecoveryPath();

    // Cache for loaded subtask attempts
    this._cache = new Map();
  }

  /**
   * Get default recovery path for story
   * @private
   * @returns {string}
   */
  _getDefaultRecoveryPath() {
    return path.join(this.rootPath, CONFIG.storiesBasePath, this.storyId, CONFIG.recoveryDir);
  }

  /**
   * Get attempts file path for a subtask
   * AC6: Each subtask has its own file
   * @private
   * @param {string} subtaskId - Subtask identifier (e.g., '2.1')
   * @returns {string}
   */
  _getAttemptsFilePath(subtaskId) {
    // Sanitize subtask ID for filename (2.1 -> subtask-2.1.json)
    const safeId = subtaskId.replace(/[^0-9.]/g, '');
    return path.join(this.recoveryPath, `subtask-${safeId}.json`);
  }

  /**
   * Ensure recovery directory exists
   * @private
   */
  _ensureRecoveryDir() {
    if (!fs.existsSync(this.recoveryPath)) {
      fs.mkdirSync(this.recoveryPath, { recursive: true });
    }
  }

  /**
   * Load attempts for a subtask
   * @param {string} subtaskId - Subtask identifier
   * @returns {Object} Attempts data
   */
  loadAttempts(subtaskId) {
    // Check cache first
    if (this._cache.has(subtaskId)) {
      return this._cache.get(subtaskId);
    }

    const filePath = this._getAttemptsFilePath(subtaskId);

    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this._cache.set(subtaskId, data);
        return data;
      } catch (error) {
        throw new Error(`Failed to load attempts for ${subtaskId}: ${error.message}`);
      }
    }

    // Return default structure for new subtask
    const defaultData = {
      subtaskId,
      storyId: this.storyId,
      attempts: [],
      currentAttempt: 0,
      status: SubtaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this._cache.set(subtaskId, defaultData);
    return defaultData;
  }

  /**
   * Save attempts for a subtask
   * @private
   * @param {string} subtaskId - Subtask identifier
   * @param {Object} data - Attempts data
   */
  _saveAttempts(subtaskId, data) {
    this._ensureRecoveryDir();

    // Update timestamp
    data.updatedAt = new Date().toISOString();

    // Validate before saving (AC5)
    const validation = validateAttemptsSchema(data);
    if (!validation.valid) {
      throw new Error(`Invalid attempts data: ${validation.errors.join(', ')}`);
    }

    const filePath = this._getAttemptsFilePath(subtaskId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // Update cache
    this._cache.set(subtaskId, data);
  }

  /**
   * Start a new attempt for a subtask
   * AC7: Auto-increment de attempt_number
   *
   * @param {string} subtaskId - Subtask identifier (e.g., '2.1')
   * @param {Object} options - Attempt options
   * @param {string} options.approach - Description of the approach being tried
   * @param {string[]} [options.changes] - Files/paths that will be changed
   * @param {string} [options.notes] - Additional notes
   * @returns {Object} The new attempt object
   */
  startAttempt(subtaskId, options = {}) {
    if (!options.approach) {
      throw new Error('approach is required for startAttempt');
    }

    const data = this.loadAttempts(subtaskId);

    // AC7: Auto-increment attempt number
    const attemptNumber = data.attempts.length + 1;

    const newAttempt = {
      number: attemptNumber,
      timestamp: new Date().toISOString(),
      approach: options.approach,
      changes: options.changes || [],
      success: null, // Will be set on complete
      error: null,
      duration: null,
      notes: options.notes || null,
    };

    data.attempts.push(newAttempt);
    data.currentAttempt = attemptNumber;
    data.status = SubtaskStatus.IN_PROGRESS;

    this._saveAttempts(subtaskId, data);

    return newAttempt;
  }

  /**
   * Complete the current attempt for a subtask
   *
   * @param {string} subtaskId - Subtask identifier
   * @param {Object} options - Completion options
   * @param {boolean} options.success - Whether the attempt succeeded
   * @param {string} [options.error] - Error message if failed
   * @param {string} [options.notes] - Additional notes
   * @returns {Object} The completed attempt object
   */
  completeAttempt(subtaskId, options = {}) {
    if (options.success === undefined) {
      throw new Error('success is required for completeAttempt');
    }

    const data = this.loadAttempts(subtaskId);

    if (data.currentAttempt === 0 || data.attempts.length === 0) {
      throw new Error(`No active attempt for subtask ${subtaskId}`);
    }

    // Get the current (last) attempt
    const currentAttempt = data.attempts[data.attempts.length - 1];

    // Calculate duration
    const startTime = new Date(currentAttempt.timestamp);
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationStr = this._formatDuration(durationMs);

    // Update attempt
    currentAttempt.success = options.success;
    currentAttempt.error = options.error || null;
    currentAttempt.duration = durationStr;
    currentAttempt.completedAt = endTime.toISOString();
    if (options.notes) {
      currentAttempt.notes = options.notes;
    }

    // Update subtask status
    if (options.success) {
      data.status = SubtaskStatus.COMPLETED;
    } else {
      // Keep in_progress to allow retries, or set to failed if explicitly marked
      data.status = SubtaskStatus.IN_PROGRESS;
    }

    this._saveAttempts(subtaskId, data);

    return currentAttempt;
  }

  /**
   * Abandon the current attempt (mark as abandoned without completing)
   *
   * @param {string} subtaskId - Subtask identifier
   * @param {string} [reason] - Reason for abandoning
   * @returns {Object} The abandoned attempt object
   */
  abandonAttempt(subtaskId, reason) {
    const data = this.loadAttempts(subtaskId);

    if (data.currentAttempt === 0 || data.attempts.length === 0) {
      throw new Error(`No active attempt for subtask ${subtaskId}`);
    }

    const currentAttempt = data.attempts[data.attempts.length - 1];

    // Calculate duration
    const startTime = new Date(currentAttempt.timestamp);
    const endTime = new Date();
    const durationMs = endTime - startTime;

    currentAttempt.success = false;
    currentAttempt.error = reason || 'Attempt abandoned';
    currentAttempt.duration = this._formatDuration(durationMs);
    currentAttempt.completedAt = endTime.toISOString();
    currentAttempt.abandoned = true;

    this._saveAttempts(subtaskId, data);

    return currentAttempt;
  }

  /**
   * Get all attempts for a subtask
   * AC6: Historico mantido por subtask
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {Object[]} Array of attempt objects
   */
  getAttempts(subtaskId) {
    const data = this.loadAttempts(subtaskId);
    return data.attempts;
  }

  /**
   * Get the current attempt for a subtask
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {Object|null} Current attempt or null if none
   */
  getCurrentAttempt(subtaskId) {
    const data = this.loadAttempts(subtaskId);
    if (data.attempts.length === 0) {
      return null;
    }
    return data.attempts[data.attempts.length - 1];
  }

  /**
   * Get full subtask status including attempts
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {Object} Full subtask data
   */
  getSubtaskStatus(subtaskId) {
    return this.loadAttempts(subtaskId);
  }

  /**
   * Mark subtask as completed (sets final status)
   *
   * @param {string} subtaskId - Subtask identifier
   */
  markCompleted(subtaskId) {
    const data = this.loadAttempts(subtaskId);
    data.status = SubtaskStatus.COMPLETED;
    this._saveAttempts(subtaskId, data);
  }

  /**
   * Mark subtask as failed (sets final status)
   *
   * @param {string} subtaskId - Subtask identifier
   */
  markFailed(subtaskId) {
    const data = this.loadAttempts(subtaskId);
    data.status = SubtaskStatus.FAILED;
    this._saveAttempts(subtaskId, data);
  }

  /**
   * Get summary statistics for all tracked subtasks
   *
   * @returns {Object} Summary statistics
   */
  getSummary() {
    this._ensureRecoveryDir();

    const files = fs
      .readdirSync(this.recoveryPath)
      .filter((f) => f.startsWith('subtask-') && f.endsWith('.json'));

    const summary = {
      storyId: this.storyId,
      totalSubtasks: files.length,
      totalAttempts: 0,
      completed: 0,
      inProgress: 0,
      failed: 0,
      pending: 0,
      subtasks: [],
    };

    for (const file of files) {
      const filePath = path.join(this.recoveryPath, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        summary.totalAttempts += data.attempts.length;

        switch (data.status) {
          case SubtaskStatus.COMPLETED:
            summary.completed++;
            break;
          case SubtaskStatus.IN_PROGRESS:
            summary.inProgress++;
            break;
          case SubtaskStatus.FAILED:
            summary.failed++;
            break;
          default:
            summary.pending++;
        }

        summary.subtasks.push({
          subtaskId: data.subtaskId,
          status: data.status,
          attempts: data.attempts.length,
          lastAttempt:
            data.attempts.length > 0 ? data.attempts[data.attempts.length - 1].timestamp : null,
        });
      } catch {
        // Skip invalid files
      }
    }

    // Sort subtasks by ID
    summary.subtasks.sort((a, b) => {
      const [aMajor, aMinor] = a.subtaskId.split('.').map(Number);
      const [bMajor, bMinor] = b.subtaskId.split('.').map(Number);
      return aMajor - bMajor || aMinor - bMinor;
    });

    return summary;
  }

  /**
   * Format duration from milliseconds to human-readable string
   * @private
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration (e.g., "5m", "1h 30m")
   */
  _formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMins = minutes % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }

  /**
   * Generate a visual report of attempt history
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {string} Formatted report
   */
  generateReport(subtaskId) {
    const data = this.loadAttempts(subtaskId);
    const lines = [];

    lines.push('');
    lines.push(chalk.bold(`Recovery History: ${this.storyId} / Subtask ${subtaskId}`));
    lines.push('━'.repeat(60));
    lines.push('');

    if (data.attempts.length === 0) {
      lines.push(chalk.dim('  No attempts recorded yet.'));
    } else {
      for (const attempt of data.attempts) {
        const statusIcon =
          attempt.success === true
            ? chalk.green('✓')
            : attempt.success === false
              ? chalk.red('✗')
              : chalk.yellow('◌');

        const duration = attempt.duration ? chalk.dim(` (${attempt.duration})`) : '';
        const timestamp = new Date(attempt.timestamp).toLocaleString();

        lines.push(`${statusIcon} Attempt #${attempt.number}${duration}`);
        lines.push(chalk.dim(`  Started: ${timestamp}`));
        lines.push(`  Approach: ${attempt.approach}`);

        if (attempt.changes && attempt.changes.length > 0) {
          lines.push(`  Changes: ${attempt.changes.join(', ')}`);
        }

        if (attempt.error) {
          lines.push(chalk.red(`  Error: ${attempt.error}`));
        }

        if (attempt.notes) {
          lines.push(chalk.cyan(`  Notes: ${attempt.notes}`));
        }

        lines.push('');
      }
    }

    // Status summary
    lines.push('─'.repeat(60));
    const statusColors = {
      [SubtaskStatus.COMPLETED]: chalk.green,
      [SubtaskStatus.IN_PROGRESS]: chalk.yellow,
      [SubtaskStatus.FAILED]: chalk.red,
      [SubtaskStatus.PENDING]: chalk.dim,
    };
    const statusColor = statusColors[data.status] || chalk.dim;
    lines.push(`Status: ${statusColor(data.status.toUpperCase())}`);
    lines.push(`Total Attempts: ${data.attempts.length}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate summary report for all subtasks
   *
   * @returns {string} Formatted summary report
   */
  generateSummaryReport() {
    const summary = this.getSummary();
    const lines = [];

    lines.push('');
    lines.push(chalk.bold(`Recovery Summary: ${this.storyId}`));
    lines.push('━'.repeat(60));
    lines.push('');

    lines.push(`Total Subtasks: ${summary.totalSubtasks}`);
    lines.push(`Total Attempts: ${summary.totalAttempts}`);
    lines.push('');

    lines.push(`  ${chalk.green('✓')} Completed: ${summary.completed}`);
    lines.push(`  ${chalk.yellow('◌')} In Progress: ${summary.inProgress}`);
    lines.push(`  ${chalk.red('✗')} Failed: ${summary.failed}`);
    lines.push(`  ${chalk.dim('○')} Pending: ${summary.pending}`);
    lines.push('');

    if (summary.subtasks.length > 0) {
      lines.push('─'.repeat(60));
      lines.push('Subtasks:');
      lines.push('');

      for (const st of summary.subtasks) {
        const statusIcon =
          {
            [SubtaskStatus.COMPLETED]: chalk.green('✓'),
            [SubtaskStatus.IN_PROGRESS]: chalk.yellow('◌'),
            [SubtaskStatus.FAILED]: chalk.red('✗'),
            [SubtaskStatus.PENDING]: chalk.dim('○'),
          }[st.status] || chalk.dim('?');

        lines.push(`  ${statusIcon} ${st.subtaskId} - ${st.attempts} attempt(s)`);
      }
    }

    lines.push('');

    return lines.join('\n');
  }

  /**
   * Export schema for external validation
   * AC5: Schema de validacao
   *
   * @returns {Object} JSON Schema
   */
  static getSchema() {
    return ATTEMPTS_SCHEMA;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick helper to start tracking an attempt
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @param {string} approach - Approach description
 * @returns {Object} The new attempt
 */
function trackAttempt(storyId, subtaskId, approach) {
  const tracker = new RecoveryTracker({ storyId });
  return tracker.startAttempt(subtaskId, { approach });
}

/**
 * Quick helper to complete an attempt
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @param {boolean} success - Whether succeeded
 * @param {string} [error] - Error message if failed
 * @returns {Object} The completed attempt
 */
function completeAttempt(storyId, subtaskId, success, error) {
  const tracker = new RecoveryTracker({ storyId });
  return tracker.completeAttempt(subtaskId, { success, error });
}

/**
 * Quick helper to get attempt history
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @returns {Object[]} Array of attempts
 */
function getAttemptHistory(storyId, subtaskId) {
  const tracker = new RecoveryTracker({ storyId });
  return tracker.getAttempts(subtaskId);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.bold('Recovery Tracker')} - AIOX Attempt Tracking System (Story 5.1)

${chalk.cyan('Usage:')}
  node recovery-tracker.js <command> <story-id> <subtask-id> [options]
  *track-attempt <subtask-id> --approach "..." [options]

${chalk.cyan('Commands:')}
  start <story-id> <subtask-id>     Start a new attempt
  complete <story-id> <subtask-id>  Complete current attempt
  abandon <story-id> <subtask-id>   Abandon current attempt
  history <story-id> <subtask-id>   Show attempt history
  summary <story-id>                Show summary for all subtasks
  json <story-id> <subtask-id>      Output attempts as JSON
  schema                            Output JSON schema for validation

${chalk.cyan('Options:')}
  --approach, -a <text>   Approach description (required for start)
  --changes, -c <files>   Comma-separated list of changed files
  --success               Mark attempt as successful (for complete)
  --fail                  Mark attempt as failed (for complete)
  --error, -e <text>      Error message (for complete --fail)
  --notes, -n <text>      Additional notes
  --quiet, -q             Suppress visual output
  --help, -h              Show this help message

${chalk.cyan('Examples:')}
  ${chalk.dim('# Start a new attempt')}
  node recovery-tracker.js start STORY-42 2.1 --approach "Using zustand with middleware"

  ${chalk.dim('# Complete with success')}
  node recovery-tracker.js complete STORY-42 2.1 --success

  ${chalk.dim('# Complete with failure')}
  node recovery-tracker.js complete STORY-42 2.1 --fail --error "Type error: Property persist does not exist"

  ${chalk.dim('# View attempt history')}
  node recovery-tracker.js history STORY-42 2.1

  ${chalk.dim('# View summary for story')}
  node recovery-tracker.js summary STORY-42

${chalk.cyan('Acceptance Criteria Coverage:')}
  AC1: Located in .aiox-core/infrastructure/scripts/
  AC2: Registra: attempt_number, timestamp, approach, success/fail, error
  AC3: Output: docs/stories/{story-id}/recovery/attempts.json
  AC4: Comando *track-attempt {subtask-id} no @dev
  AC5: Schema de validacao para attempts.json
  AC6: Historico mantido por subtask (nao por story)
  AC7: Auto-increment de attempt_number
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  const command = args[0];
  let storyId = null;
  let subtaskId = null;
  let approach = null;
  let changes = [];
  let success = null;
  let error = null;
  let notes = null;
  let quiet = false;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--approach' || arg === '-a') {
      approach = args[++i];
    } else if (arg === '--changes' || arg === '-c') {
      changes = args[++i].split(',').map((s) => s.trim());
    } else if (arg === '--success') {
      success = true;
    } else if (arg === '--fail') {
      success = false;
    } else if (arg === '--error' || arg === '-e') {
      error = args[++i];
    } else if (arg === '--notes' || arg === '-n') {
      notes = args[++i];
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else if (!subtaskId) {
        subtaskId = arg;
      }
    }
  }

  try {
    // Handle schema command (no story needed)
    if (command === 'schema') {
      console.log(JSON.stringify(ATTEMPTS_SCHEMA, null, 2));
      process.exit(0);
    }

    // Validate required arguments
    if (!storyId && command !== 'schema') {
      console.error(chalk.red('Error: story-id is required'));
      process.exit(1);
    }

    if (!subtaskId && !['summary', 'schema'].includes(command)) {
      console.error(chalk.red('Error: subtask-id is required'));
      process.exit(1);
    }

    const tracker = new RecoveryTracker({ storyId });

    switch (command) {
      case 'start': {
        if (!approach) {
          console.error(chalk.red('Error: --approach is required for start command'));
          process.exit(1);
        }

        const attempt = tracker.startAttempt(subtaskId, { approach, changes, notes });

        if (!quiet) {
          console.log(
            chalk.green(`\n✓ Started attempt #${attempt.number} for ${storyId}/${subtaskId}`)
          );
          console.log(chalk.dim(`  Approach: ${approach}`));
          if (changes.length > 0) {
            console.log(chalk.dim(`  Changes: ${changes.join(', ')}`));
          }
          console.log('');
        }
        break;
      }

      case 'complete': {
        if (success === null) {
          console.error(chalk.red('Error: --success or --fail is required for complete command'));
          process.exit(1);
        }

        const attempt = tracker.completeAttempt(subtaskId, { success, error, notes });

        if (!quiet) {
          if (success) {
            console.log(chalk.green(`\n✓ Attempt #${attempt.number} completed successfully`));
          } else {
            console.log(chalk.red(`\n✗ Attempt #${attempt.number} failed`));
            if (error) {
              console.log(chalk.dim(`  Error: ${error}`));
            }
          }
          console.log(chalk.dim(`  Duration: ${attempt.duration}`));
          console.log('');
        }
        break;
      }

      case 'abandon': {
        const attempt = tracker.abandonAttempt(subtaskId, error || notes);

        if (!quiet) {
          console.log(chalk.yellow(`\n⚠ Attempt #${attempt.number} abandoned`));
          if (attempt.error) {
            console.log(chalk.dim(`  Reason: ${attempt.error}`));
          }
          console.log('');
        }
        break;
      }

      case 'history': {
        console.log(tracker.generateReport(subtaskId));
        break;
      }

      case 'summary': {
        console.log(tracker.generateSummaryReport());
        break;
      }

      case 'json': {
        const data = tracker.getSubtaskStatus(subtaskId);
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        process.exit(1);
    }
  } catch (err) {
    console.error(chalk.red(`\n✗ Error: ${err.message}`));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  RecoveryTracker,
  AttemptStatus,
  SubtaskStatus,
  // Schema (AC5)
  ATTEMPTS_SCHEMA,
  validateAttemptsSchema,
  // Helper functions
  trackAttempt,
  completeAttempt,
  getAttemptHistory,
  // Config for external use
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
