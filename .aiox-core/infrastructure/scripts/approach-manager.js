#!/usr/bin/env node

/**
 * AIOX Approach Manager
 *
 * Story: 5.3 - Current Approach Tracker
 * Epic: Epic 5 - Recovery & Learning System
 *
 * Manages current approach tracking for implementation attempts.
 * Enables stuck detection comparison and suggests alternatives.
 *
 * Features:
 * - AC1: recovery/current-approach.md updated before each attempt
 * - AC2: Documents approach summary, key decisions, files being modified
 * - AC3: Referenced by stuck detection for comparison
 * - AC4: Cleaned automatically after success
 * - AC5: Used to suggest alternatives when stuck
 * - AC6: Template structured for consistency
 * - AC7: History maintained in approach-history.json
 *
 * @author @architect (Aria)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC6: Template file location
  templatePath: '.aiox-core/product/templates/current-approach-tmpl.md',
  // AC1: Current approach file name
  currentApproachFile: 'current-approach.md',
  // AC7: History file name
  historyFile: 'approach-history.json',
  // Recovery directory name
  recoveryDir: 'recovery',
  // Maximum history entries per subtask
  maxHistoryPerSubtask: 10,
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              APPROACH MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class ApproachManager {
  /**
   * Create a new ApproachManager instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.storyId - Story ID (e.g., 'STORY-42')
   * @param {string} [options.recoveryPath] - Custom recovery directory path
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   */
  constructor(options) {
    if (!options?.storyId) {
      throw new Error('storyId is required');
    }

    this.storyId = options.storyId;
    this.rootPath = options.rootPath || process.cwd();

    // AC1: Set recovery path
    if (options.recoveryPath) {
      this.recoveryPath = path.isAbsolute(options.recoveryPath)
        ? options.recoveryPath
        : path.join(this.rootPath, options.recoveryPath);
    } else {
      this.recoveryPath = path.join(
        this.rootPath,
        'docs/stories',
        this.storyId,
        CONFIG.recoveryDir
      );
    }

    // File paths
    this.currentApproachPath = path.join(this.recoveryPath, CONFIG.currentApproachFile);
    this.historyPath = path.join(this.recoveryPath, CONFIG.historyFile);
    this.templatePath = path.join(this.rootPath, CONFIG.templatePath);

    // In-memory cache
    this._currentApproaches = new Map();
    this._history = null;
  }

  /**
   * Initialize recovery directory structure
   * @private
   */
  async _ensureRecoveryDir() {
    if (!fs.existsSync(this.recoveryPath)) {
      await fsPromises.mkdir(this.recoveryPath, { recursive: true });
    }
  }

  /**
   * Load template file
   * @private
   * @returns {string} Template content
   */
  _loadTemplate() {
    if (fs.existsSync(this.templatePath)) {
      return fs.readFileSync(this.templatePath, 'utf-8');
    }

    // Fallback template if file not found
    return `# Current Approach: Subtask {{subtaskId}}

## Summary
{{approach_summary}}

## Key Decisions
{{#each decisions}}
- {{this}}
{{/each}}

## Files Being Modified
{{#each files}}
- \`{{this.path}}\` ({{this.action}})
{{/each}}

## Expected Challenges
{{#each expectedChallenges}}
- {{this}}
{{/each}}

## Started At
{{startedAt}}

## Attempt Number
{{attemptNumber}}
`;
  }

  /**
   * Simple template rendering (Handlebars-like syntax)
   * @private
   * @param {string} template - Template string
   * @param {Object} data - Data to render
   * @returns {string} Rendered content
   */
  _renderTemplate(template, data) {
    let result = template;

    // Handle simple placeholders {{key}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (data[key] !== undefined) {
        return String(data[key]);
      }
      return match;
    });

    // Handle {{#each array}}...{{/each}} blocks
    result = result.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayKey, itemTemplate) => {
        const array = data[arrayKey];
        if (!Array.isArray(array) || array.length === 0) {
          return '- (none specified)';
        }

        return array
          .map((item) => {
            if (typeof item === 'string') {
              return itemTemplate.replace(/\{\{this\}\}/g, item).trim();
            }
            // Handle object items
            let rendered = itemTemplate;
            for (const [key, value] of Object.entries(item)) {
              rendered = rendered.replace(
                new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g'),
                String(value)
              );
            }
            return rendered.trim();
          })
          .join('\n');
      }
    );

    return result;
  }

  /**
   * AC1: Start a new approach for a subtask
   *
   * @param {string} subtaskId - Subtask identifier (e.g., '2.1')
   * @param {Object} approachData - Approach details
   * @param {string} approachData.summary - Brief description of the approach
   * @param {string[]} approachData.decisions - Key decisions made
   * @param {Array<{path: string, action: string}>} approachData.files - Files being modified
   * @param {string[]} [approachData.expectedChallenges] - Expected challenges
   * @param {string} [approachData.phase] - Phase name
   * @param {string} [approachData.notes] - Additional notes
   * @returns {Promise<Object>} Created approach record
   */
  async startApproach(subtaskId, approachData) {
    await this._ensureRecoveryDir();

    // Load history to get attempt number
    const history = await this.getApproachHistory(subtaskId);
    const attemptNumber = history.approaches.length + 1;

    const timestamp = new Date().toISOString();

    // AC2: Create approach record
    const approach = {
      subtaskId,
      storyId: this.storyId,
      attemptNumber,
      summary: approachData.summary || '',
      decisions: approachData.decisions || [],
      files: approachData.files || [],
      expectedChallenges: approachData.expectedChallenges || [],
      phase: approachData.phase || '',
      notes: approachData.notes || '',
      startedAt: timestamp,
      endedAt: null,
      success: null,
      previousAttempts: attemptNumber - 1,
    };

    // Cache current approach
    this._currentApproaches.set(subtaskId, approach);

    // AC1: Write current-approach.md
    await this._writeCurrentApproachFile(approach);

    return approach;
  }

  /**
   * Write current approach to markdown file
   * @private
   * @param {Object} approach - Approach data
   */
  async _writeCurrentApproachFile(approach) {
    const template = this._loadTemplate();

    // Prepare template data
    const data = {
      subtaskId: approach.subtaskId,
      storyId: approach.storyId,
      approach_summary: approach.summary,
      decisions: approach.decisions,
      files: approach.files,
      expectedChallenges: approach.expectedChallenges,
      startedAt: approach.startedAt,
      attemptNumber: approach.attemptNumber,
      phase: approach.phase,
      previousAttempts: approach.previousAttempts,
      notes: approach.notes,
    };

    const content = this._renderTemplate(template, data);
    await fsPromises.writeFile(this.currentApproachPath, content, 'utf-8');
  }

  /**
   * AC3: Get current approach for stuck detection comparison
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {Object|null} Current approach or null if not found
   */
  getCurrentApproach(subtaskId) {
    // Check memory cache first
    if (this._currentApproaches.has(subtaskId)) {
      return this._currentApproaches.get(subtaskId);
    }

    // Try to load from file
    if (fs.existsSync(this.currentApproachPath)) {
      try {
        const content = fs.readFileSync(this.currentApproachPath, 'utf-8');
        // Parse basic info from markdown
        const approach = this._parseApproachFromMarkdown(content);
        if (approach && approach.subtaskId === subtaskId) {
          this._currentApproaches.set(subtaskId, approach);
          return approach;
        }
      } catch {
        // File exists but couldn't be parsed
        return null;
      }
    }

    return null;
  }

  /**
   * Parse approach data from markdown content
   * @private
   * @param {string} content - Markdown content
   * @returns {Object} Parsed approach data
   */
  _parseApproachFromMarkdown(content) {
    const approach = {
      subtaskId: null,
      summary: '',
      decisions: [],
      files: [],
      expectedChallenges: [],
      startedAt: null,
      attemptNumber: null,
    };

    // Extract subtask ID from header
    const subtaskMatch = content.match(/# Current Approach: Subtask ([\d.]+)/);
    if (subtaskMatch) {
      approach.subtaskId = subtaskMatch[1];
    }

    // Extract summary
    const summaryMatch = content.match(/## Summary\n([\s\S]*?)(?=\n##|$)/);
    if (summaryMatch) {
      approach.summary = summaryMatch[1].trim();
    }

    // Extract decisions
    const decisionsMatch = content.match(/## Key Decisions\n([\s\S]*?)(?=\n##|$)/);
    if (decisionsMatch) {
      const lines = decisionsMatch[1].trim().split('\n');
      approach.decisions = lines
        .filter((line) => line.startsWith('- '))
        .map((line) => line.substring(2).trim());
    }

    // Extract files
    const filesMatch = content.match(/## Files Being Modified\n([\s\S]*?)(?=\n##|$)/);
    if (filesMatch) {
      const lines = filesMatch[1].trim().split('\n');
      approach.files = lines
        .filter((line) => line.startsWith('- '))
        .map((line) => {
          const fileMatch = line.match(/`([^`]+)`\s*\((\w+)\)/);
          if (fileMatch) {
            return { path: fileMatch[1], action: fileMatch[2] };
          }
          return null;
        })
        .filter(Boolean);
    }

    // Extract started at
    const startedMatch = content.match(/## Started At\n(.+)/);
    if (startedMatch) {
      approach.startedAt = startedMatch[1].trim();
    }

    // Extract attempt number
    const attemptMatch = content.match(/## Attempt Number\n(\d+)/);
    if (attemptMatch) {
      approach.attemptNumber = parseInt(attemptMatch[1], 10);
    }

    return approach;
  }

  /**
   * AC4: Clear approach on success
   *
   * @param {string} subtaskId - Subtask identifier
   * @param {Object} [options] - Clearance options
   * @param {boolean} [options.success=true] - Whether the approach succeeded
   * @param {string} [options.notes] - Additional notes
   * @returns {Promise<Object>} Archived approach record
   */
  async clearApproach(subtaskId, options = {}) {
    const { success = true, notes = '' } = options;

    const approach = this.getCurrentApproach(subtaskId);
    if (!approach) {
      throw new Error(`No current approach found for subtask ${subtaskId}`);
    }

    // Update approach with end data
    approach.endedAt = new Date().toISOString();
    approach.success = success;
    if (notes) {
      approach.notes = (approach.notes ? approach.notes + '\n' : '') + notes;
    }

    // AC7: Archive to history
    await this._archiveApproach(subtaskId, approach);

    // Clear from cache
    this._currentApproaches.delete(subtaskId);

    // AC4: Remove current-approach.md on success
    if (success && fs.existsSync(this.currentApproachPath)) {
      await fsPromises.unlink(this.currentApproachPath);
    }

    return approach;
  }

  /**
   * Archive approach to history file
   * @private
   * @param {string} subtaskId - Subtask identifier
   * @param {Object} approach - Approach to archive
   */
  async _archiveApproach(subtaskId, approach) {
    const history = await this._loadHistory();

    // Find or create subtask history
    let subtaskHistory = history.subtasks.find((s) => s.subtaskId === subtaskId);
    if (!subtaskHistory) {
      subtaskHistory = {
        subtaskId,
        approaches: [],
      };
      history.subtasks.push(subtaskHistory);
    }

    // Add approach to history
    subtaskHistory.approaches.push({
      attemptNumber: approach.attemptNumber,
      summary: approach.summary,
      startedAt: approach.startedAt,
      endedAt: approach.endedAt,
      success: approach.success,
      decisions: approach.decisions,
      files: approach.files.map((f) => (typeof f === 'string' ? f : f.path)),
      notes: approach.notes,
    });

    // Trim history if needed
    if (subtaskHistory.approaches.length > CONFIG.maxHistoryPerSubtask) {
      subtaskHistory.approaches = subtaskHistory.approaches.slice(-CONFIG.maxHistoryPerSubtask);
    }

    // Update metadata
    history.lastUpdated = new Date().toISOString();
    history.totalAttempts = history.subtasks.reduce((sum, s) => sum + s.approaches.length, 0);

    await this._saveHistory(history);
  }

  /**
   * Load history from file
   * @private
   * @returns {Promise<Object>} History data
   */
  async _loadHistory() {
    if (this._history) {
      return this._history;
    }

    if (fs.existsSync(this.historyPath)) {
      try {
        const content = await fsPromises.readFile(this.historyPath, 'utf-8');
        this._history = JSON.parse(content);
        return this._history;
      } catch {
        // Invalid JSON, start fresh
      }
    }

    // Initialize new history
    this._history = {
      version: '1.0.0',
      storyId: this.storyId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalAttempts: 0,
      subtasks: [],
    };

    return this._history;
  }

  /**
   * Save history to file
   * @private
   * @param {Object} history - History data
   */
  async _saveHistory(history) {
    await this._ensureRecoveryDir();
    await fsPromises.writeFile(this.historyPath, JSON.stringify(history, null, 2), 'utf-8');
    this._history = history;
  }

  /**
   * AC7: Get approach history for a subtask
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {Promise<Object>} Subtask history
   */
  async getApproachHistory(subtaskId) {
    const history = await this._loadHistory();
    const subtaskHistory = history.subtasks.find((s) => s.subtaskId === subtaskId);

    if (!subtaskHistory) {
      return {
        subtaskId,
        approaches: [],
      };
    }

    return subtaskHistory;
  }

  /**
   * Get full history for all subtasks
   * @returns {Promise<Object>} Complete history
   */
  async getFullHistory() {
    return this._loadHistory();
  }

  /**
   * AC5: Get alternative suggestions based on history
   *
   * Analyzes previous failed approaches to suggest alternatives.
   *
   * @param {string} subtaskId - Subtask identifier
   * @returns {Promise<Object>} Suggestions object
   */
  async getSuggestions(subtaskId) {
    const history = await this.getApproachHistory(subtaskId);
    const failedApproaches = history.approaches.filter((a) => a.success === false);

    const suggestions = {
      subtaskId,
      totalAttempts: history.approaches.length,
      failedAttempts: failedApproaches.length,
      successfulAttempts: history.approaches.filter((a) => a.success === true).length,
      previousDecisions: [],
      avoidPatterns: [],
      recommendedActions: [],
    };

    if (failedApproaches.length === 0) {
      suggestions.recommendedActions.push('No previous failures - proceed with current approach');
      return suggestions;
    }

    // Collect failed decisions to avoid
    const decisionCounts = new Map();
    for (const approach of failedApproaches) {
      for (const decision of approach.decisions || []) {
        const count = decisionCounts.get(decision) || 0;
        decisionCounts.set(decision, count + 1);
      }
    }

    // Mark decisions that failed multiple times
    for (const [decision, count] of decisionCounts.entries()) {
      suggestions.previousDecisions.push({
        decision,
        failCount: count,
      });

      if (count >= 2) {
        suggestions.avoidPatterns.push({
          pattern: decision,
          reason: `Failed ${count} times previously`,
        });
      }
    }

    // Generate recommendations
    if (failedApproaches.length >= 3) {
      suggestions.recommendedActions.push(
        'Consider fundamentally different approach - multiple attempts have failed'
      );
      suggestions.recommendedActions.push(
        'Review story requirements for possible misunderstanding'
      );
      suggestions.recommendedActions.push('Check if dependencies are blocking progress');
    } else if (failedApproaches.length >= 2) {
      suggestions.recommendedActions.push('Try alternative implementation strategy');
      suggestions.recommendedActions.push('Review error patterns from previous attempts');
    } else {
      suggestions.recommendedActions.push('Analyze why previous attempt failed before retrying');
    }

    // Add specific file-based suggestions
    const modifiedFiles = new Set();
    for (const approach of failedApproaches) {
      for (const file of approach.files || []) {
        modifiedFiles.add(file);
      }
    }

    if (modifiedFiles.size > 0) {
      suggestions.previouslyModifiedFiles = Array.from(modifiedFiles);
    }

    return suggestions;
  }

  /**
   * Check if currently tracking an approach
   * @param {string} subtaskId - Subtask identifier
   * @returns {boolean}
   */
  hasActiveApproach(subtaskId) {
    return (
      this._currentApproaches.has(subtaskId) ||
      (fs.existsSync(this.currentApproachPath) &&
        this._parseApproachFromMarkdown(fs.readFileSync(this.currentApproachPath, 'utf-8'))
          ?.subtaskId === subtaskId)
    );
  }

  /**
   * Add note to current approach
   * @param {string} subtaskId - Subtask identifier
   * @param {string} note - Note to add
   */
  async addNote(subtaskId, note) {
    const approach = this.getCurrentApproach(subtaskId);
    if (!approach) {
      throw new Error(`No current approach found for subtask ${subtaskId}`);
    }

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    approach.notes = (approach.notes ? approach.notes + '\n' : '') + `[${timestamp}] ${note}`;

    this._currentApproaches.set(subtaskId, approach);
    await this._writeCurrentApproachFile(approach);
  }

  /**
   * Update files being modified
   * @param {string} subtaskId - Subtask identifier
   * @param {Array<{path: string, action: string}>} files - Updated file list
   */
  async updateFiles(subtaskId, files) {
    const approach = this.getCurrentApproach(subtaskId);
    if (!approach) {
      throw new Error(`No current approach found for subtask ${subtaskId}`);
    }

    approach.files = files;
    this._currentApproaches.set(subtaskId, approach);
    await this._writeCurrentApproachFile(approach);
  }

  /**
   * Get JSON representation
   * @returns {Promise<Object>}
   */
  async toJSON() {
    return {
      storyId: this.storyId,
      recoveryPath: this.recoveryPath,
      currentApproaches: Object.fromEntries(this._currentApproaches),
      history: await this.getFullHistory(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick helper to start an approach
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @param {Object} approachData - Approach data
 * @returns {Promise<Object>} Created approach
 */
async function startApproach(storyId, subtaskId, approachData) {
  const manager = new ApproachManager({ storyId });
  return manager.startApproach(subtaskId, approachData);
}

/**
 * Quick helper to clear an approach
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @param {Object} options - Clear options
 * @returns {Promise<Object>} Cleared approach
 */
async function clearApproach(storyId, subtaskId, options) {
  const manager = new ApproachManager({ storyId });
  return manager.clearApproach(subtaskId, options);
}

/**
 * Quick helper to get suggestions
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @returns {Promise<Object>} Suggestions
 */
async function getSuggestions(storyId, subtaskId) {
  const manager = new ApproachManager({ storyId });
  return manager.getSuggestions(subtaskId);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Approach Manager - AIOX Recovery System (Story 5.3)

Usage:
  node approach-manager.js <story-id> <command> [subtask-id] [options]

Commands:
  start <subtask-id>    Start tracking a new approach
  current <subtask-id>  Show current approach
  clear <subtask-id>    Clear current approach (mark as success)
  fail <subtask-id>     Clear current approach (mark as failed)
  history <subtask-id>  Show approach history for subtask
  suggest <subtask-id>  Get suggestions based on history
  full-history          Show full history for all subtasks
  note <subtask-id>     Add note to current approach

Options:
  --summary <text>      Approach summary (for start command)
  --decisions <json>    Key decisions as JSON array
  --files <json>        Files being modified as JSON array
  --challenges <json>   Expected challenges as JSON array
  --notes <text>        Additional notes
  --recovery-path <p>   Custom recovery directory path
  --json                Output as JSON
  --help, -h            Show this help message

Examples:
  node approach-manager.js STORY-42 start 2.1 --summary "Using Zustand with persist"
  node approach-manager.js STORY-42 current 2.1
  node approach-manager.js STORY-42 clear 2.1
  node approach-manager.js STORY-42 fail 2.1 --notes "Type inference failed"
  node approach-manager.js STORY-42 history 2.1
  node approach-manager.js STORY-42 suggest 2.1
  node approach-manager.js STORY-42 full-history --json

Acceptance Criteria Coverage:
  AC1: recovery/current-approach.md updated before each attempt
  AC2: Documents approach summary, key decisions, files being modified
  AC3: Referenced by stuck detection for comparison
  AC4: Cleaned automatically after success
  AC5: Used to suggest alternatives when stuck
  AC6: Template structured for consistency
  AC7: History maintained in approach-history.json
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  let storyId = null;
  let command = null;
  let subtaskId = null;
  let summary = '';
  let decisions = [];
  let files = [];
  let challenges = [];
  let notes = '';
  let recoveryPath = null;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--summary' && args[i + 1]) {
      summary = args[++i];
    } else if (arg === '--decisions' && args[i + 1]) {
      try {
        decisions = JSON.parse(args[++i]);
      } catch {
        console.error('Error: --decisions must be valid JSON');
        process.exit(1);
      }
    } else if (arg === '--files' && args[i + 1]) {
      try {
        files = JSON.parse(args[++i]);
      } catch {
        console.error('Error: --files must be valid JSON');
        process.exit(1);
      }
    } else if (arg === '--challenges' && args[i + 1]) {
      try {
        challenges = JSON.parse(args[++i]);
      } catch {
        console.error('Error: --challenges must be valid JSON');
        process.exit(1);
      }
    } else if (arg === '--notes' && args[i + 1]) {
      notes = args[++i];
    } else if (arg === '--recovery-path' && args[i + 1]) {
      recoveryPath = args[++i];
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else if (!command) {
        command = arg;
      } else if (!subtaskId) {
        subtaskId = arg;
      }
    }
  }

  if (!storyId) {
    console.error('Error: Story ID required');
    process.exit(1);
  }

  try {
    const manager = new ApproachManager({
      storyId,
      recoveryPath,
    });

    let result;

    switch (command) {
      case 'start':
        if (!subtaskId) {
          console.error('Error: subtask ID required for start command');
          process.exit(1);
        }
        result = await manager.startApproach(subtaskId, {
          summary,
          decisions,
          files,
          expectedChallenges: challenges,
          notes,
        });
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(
            `Started approach for subtask ${subtaskId} (attempt #${result.attemptNumber})`
          );
          console.log(`Current approach file: ${manager.currentApproachPath}`);
        }
        break;

      case 'current':
        if (!subtaskId) {
          console.error('Error: subtask ID required for current command');
          process.exit(1);
        }
        result = manager.getCurrentApproach(subtaskId);
        if (!result) {
          console.log(`No current approach found for subtask ${subtaskId}`);
          process.exit(0);
        }
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`\nCurrent Approach for ${subtaskId}:`);
          console.log(`  Summary: ${result.summary}`);
          console.log(`  Attempt: #${result.attemptNumber}`);
          console.log(`  Started: ${result.startedAt}`);
          console.log(`  Decisions: ${result.decisions.length} recorded`);
          console.log(`  Files: ${result.files.length} being modified`);
        }
        break;

      case 'clear':
        if (!subtaskId) {
          console.error('Error: subtask ID required for clear command');
          process.exit(1);
        }
        result = await manager.clearApproach(subtaskId, { success: true, notes });
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Cleared approach for subtask ${subtaskId} (success)`);
          console.log(`Archived to: ${manager.historyPath}`);
        }
        break;

      case 'fail':
        if (!subtaskId) {
          console.error('Error: subtask ID required for fail command');
          process.exit(1);
        }
        result = await manager.clearApproach(subtaskId, { success: false, notes });
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Cleared approach for subtask ${subtaskId} (failed)`);
          console.log(`Archived to: ${manager.historyPath}`);
        }
        break;

      case 'history':
        if (!subtaskId) {
          console.error('Error: subtask ID required for history command');
          process.exit(1);
        }
        result = await manager.getApproachHistory(subtaskId);
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`\nApproach History for ${subtaskId}:`);
          console.log(`  Total attempts: ${result.approaches.length}`);
          for (const approach of result.approaches) {
            const status =
              approach.success === true
                ? 'SUCCESS'
                : approach.success === false
                  ? 'FAILED'
                  : 'UNKNOWN';
            console.log(`  #${approach.attemptNumber}: ${status} - ${approach.summary}`);
          }
        }
        break;

      case 'suggest':
        if (!subtaskId) {
          console.error('Error: subtask ID required for suggest command');
          process.exit(1);
        }
        result = await manager.getSuggestions(subtaskId);
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`\nSuggestions for ${subtaskId}:`);
          console.log(`  Total attempts: ${result.totalAttempts}`);
          console.log(`  Failed: ${result.failedAttempts}`);
          console.log(`  Successful: ${result.successfulAttempts}`);
          console.log(`\n  Recommendations:`);
          for (const action of result.recommendedActions) {
            console.log(`    - ${action}`);
          }
          if (result.avoidPatterns.length > 0) {
            console.log(`\n  Patterns to avoid:`);
            for (const pattern of result.avoidPatterns) {
              console.log(`    - ${pattern.pattern} (${pattern.reason})`);
            }
          }
        }
        break;

      case 'full-history':
        result = await manager.getFullHistory();
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`\nFull History for ${storyId}:`);
          console.log(`  Total attempts: ${result.totalAttempts}`);
          console.log(`  Subtasks tracked: ${result.subtasks.length}`);
          for (const subtask of result.subtasks) {
            const successes = subtask.approaches.filter((a) => a.success === true).length;
            const failures = subtask.approaches.filter((a) => a.success === false).length;
            console.log(
              `  ${subtask.subtaskId}: ${subtask.approaches.length} attempts (${successes} success, ${failures} failed)`
            );
          }
        }
        break;

      case 'note':
        if (!subtaskId) {
          console.error('Error: subtask ID required for note command');
          process.exit(1);
        }
        if (!notes) {
          console.error('Error: --notes required for note command');
          process.exit(1);
        }
        await manager.addNote(subtaskId, notes);
        console.log(`Note added to approach for subtask ${subtaskId}`);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  ApproachManager,
  // Helper functions
  startApproach,
  clearApproach,
  getSuggestions,
  // Config for external use
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
