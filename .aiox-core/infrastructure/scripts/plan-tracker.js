#!/usr/bin/env node

/**
 * AIOX Plan Progress Tracker
 *
 * Story: 4.6 - Execution Engine
 * Epic: Epic 4 - Execution Engine
 *
 * Tracks and displays implementation progress for stories.
 * Generates visual progress bars and integrates with dashboard status.json.
 *
 * Features:
 * - AC1: Located in `.aiox-core/infrastructure/scripts/`
 * - AC2: Calculates total, completed, in-progress, pending, failed
 * - AC3: Global `*plan-status {story-id}` command support
 * - AC4: Visual progress bars output
 * - AC5: Generates `plan/build-progress.txt` snapshot
 * - AC6: Auto-updates after each subtask
 * - AC7: Integrates with `.aiox/dashboard/status.json`
 *
 * @author @architect (Aria)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  progressBarWidth: 10,
  progressBarFilled: '▓',
  progressBarEmpty: '░',
  // AC7: Dashboard integration path
  dashboardStatusPath: '.aiox/dashboard/status.json',
  // Legacy status path for backwards compatibility
  legacyStatusPath: '.aiox/status.json',
  // AC5: Build progress snapshot file
  buildProgressFile: 'build-progress.txt',
  // Plan file name
  implementationFile: 'implementation.yaml',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATUS ENUM
// ═══════════════════════════════════════════════════════════════════════════════════

const Status = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
  SKIPPED: 'skipped',
};

const StatusEmoji = {
  [Status.PENDING]: '⏳',
  [Status.IN_PROGRESS]: '🔄',
  [Status.COMPLETED]: '✅',
  [Status.FAILED]: '❌',
  [Status.BLOCKED]: '🚫',
  [Status.SKIPPED]: '⏭️',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PLAN TRACKER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class PlanTracker {
  /**
   * Create a new PlanTracker instance
   *
   * @param {Object|string} options - Options object or story ID string
   * @param {string} [options.storyId] - Story ID (e.g., 'STORY-42')
   * @param {string} [options.planPath] - Explicit path to implementation.yaml
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   */
  constructor(options) {
    // Support both object and string (legacy) constructor
    if (typeof options === 'string') {
      this.storyId = options;
      this.rootPath = process.cwd();
      this.planPath = null;
    } else {
      this.storyId = options?.storyId;
      this.rootPath = options?.rootPath || process.cwd();
      this.planPath = options?.planPath || null;
    }

    this.plan = null;
    this._initPaths();
  }

  /**
   * Initialize file paths based on story ID or explicit plan path
   * @private
   */
  _initPaths() {
    // If explicit planPath provided, use it
    if (this.planPath) {
      if (!path.isAbsolute(this.planPath)) {
        this.planPath = path.join(this.rootPath, this.planPath);
      }
      // Derive progress path from plan path
      this.progressPath = path.join(path.dirname(this.planPath), CONFIG.buildProgressFile);
      return;
    }

    // Otherwise, try to find plan file for story ID
    if (this.storyId) {
      const planPath = this._findPlanPath();
      if (planPath) {
        this.planPath = planPath;
        this.progressPath = path.join(path.dirname(this.planPath), CONFIG.buildProgressFile);
      } else {
        // Default paths for new plans
        this.planPath = path.join(
          this.rootPath,
          'docs/stories',
          this.storyId,
          'plan',
          CONFIG.implementationFile
        );
        this.progressPath = path.join(
          this.rootPath,
          'docs/stories',
          this.storyId,
          'plan',
          CONFIG.buildProgressFile
        );
      }
    }
  }

  /**
   * Find implementation plan file in common locations
   * @private
   * @returns {string|null} Path to plan file or null
   */
  _findPlanPath() {
    const searchPaths = [
      // Standard story plan location
      path.join(this.rootPath, 'docs/stories', this.storyId, 'plan', CONFIG.implementationFile),
      // Lowercase story ID
      path.join(
        this.rootPath,
        'docs/stories',
        this.storyId.toLowerCase(),
        'plan',
        CONFIG.implementationFile
      ),
      // Story ID with hyphens
      path.join(
        this.rootPath,
        'docs/stories',
        this.storyId.replace(/[_]/g, '-'),
        'plan',
        CONFIG.implementationFile
      ),
      // .aiox plans location
      path.join(this.rootPath, '.aiox/plans', this.storyId, CONFIG.implementationFile),
      // Epic-based location (e.g., aiox-core-ade/story-4.6)
      ...this._getEpicBasedPaths(),
    ];

    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  /**
   * Get epic-based search paths
   * @private
   * @returns {string[]} Array of potential paths
   */
  _getEpicBasedPaths() {
    const paths = [];
    const storiesDir = path.join(this.rootPath, 'docs/stories');

    if (fs.existsSync(storiesDir)) {
      try {
        const epicDirs = fs
          .readdirSync(storiesDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);

        for (const epicDir of epicDirs) {
          paths.push(
            path.join(storiesDir, epicDir, this.storyId, 'plan', CONFIG.implementationFile),
            path.join(
              storiesDir,
              epicDir,
              this.storyId.toLowerCase(),
              'plan',
              CONFIG.implementationFile
            )
          );
        }
      } catch {
        // Ignore errors reading directories
      }
    }

    return paths;
  }

  /**
   * Load implementation plan
   */
  load() {
    if (!fs.existsSync(this.planPath)) {
      throw new Error(`Implementation plan not found: ${this.planPath}`);
    }

    this.plan = yaml.load(fs.readFileSync(this.planPath, 'utf-8'));
    return this;
  }

  /**
   * Calculate progress statistics
   */
  getStats() {
    if (!this.plan) {
      this.load();
    }

    const stats = {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      phases: [],
      current: null,
    };

    for (const phase of this.plan.phases || []) {
      const phaseStats = {
        id: phase.id,
        name: phase.name,
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0,
        subtasks: [],
      };

      for (const subtask of phase.subtasks || []) {
        const status = subtask.status || Status.PENDING;

        phaseStats.total++;
        stats.total++;

        switch (status) {
          case Status.COMPLETED:
            phaseStats.completed++;
            stats.completed++;
            break;
          case Status.IN_PROGRESS:
            phaseStats.inProgress++;
            stats.inProgress++;
            if (!stats.current) {
              stats.current = {
                phase: phase.name,
                subtask: subtask.id,
                description: subtask.description,
              };
            }
            break;
          case Status.PENDING:
            phaseStats.pending++;
            stats.pending++;
            break;
          case Status.FAILED:
            phaseStats.failed++;
            stats.failed++;
            break;
          case Status.BLOCKED:
            stats.blocked++;
            break;
          case Status.SKIPPED:
            stats.skipped++;
            break;
        }

        phaseStats.subtasks.push({
          id: subtask.id,
          description: subtask.description,
          status,
        });
      }

      stats.phases.push(phaseStats);
    }

    // Calculate percentages
    stats.percentComplete = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    for (const phase of stats.phases) {
      phase.percentComplete =
        phase.total > 0 ? Math.round((phase.completed / phase.total) * 100) : 0;
    }

    // Determine overall status
    if (stats.completed === stats.total) {
      stats.status = Status.COMPLETED;
    } else if (stats.failed > 0) {
      stats.status = Status.FAILED;
    } else if (stats.inProgress > 0) {
      stats.status = Status.IN_PROGRESS;
    } else if (stats.blocked > 0) {
      stats.status = Status.BLOCKED;
    } else {
      stats.status = Status.PENDING;
    }

    return stats;
  }

  /**
   * Generate progress bar
   */
  progressBar(percent, width = CONFIG.progressBarWidth) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return CONFIG.progressBarFilled.repeat(filled) + CONFIG.progressBarEmpty.repeat(empty);
  }

  /**
   * Generate visual progress report
   */
  generateReport() {
    const stats = this.getStats();
    const lines = [];

    // Header
    lines.push('');
    lines.push(`📊 Implementation Progress: ${this.storyId}`);
    lines.push('━'.repeat(50));

    // Phase progress
    for (const phase of stats.phases) {
      const bar = this.progressBar(phase.percentComplete);
      const count = `(${phase.completed}/${phase.total})`;
      const percent = `${phase.percentComplete}%`.padStart(4);
      lines.push(`${phase.name.padEnd(18)} ${bar} ${percent} ${count}`);
    }

    lines.push('━'.repeat(50));

    // Total progress
    const totalBar = this.progressBar(stats.percentComplete);
    lines.push(`Total: ${stats.percentComplete}% (${stats.completed}/${stats.total} subtasks)`);
    lines.push(`Status: ${StatusEmoji[stats.status]} ${stats.status.toUpperCase()}`);

    // Current task
    if (stats.current) {
      lines.push(`Current: ${stats.current.subtask} - ${stats.current.description}`);
    }

    // Failures
    if (stats.failed > 0) {
      lines.push('');
      lines.push(`⚠️  ${stats.failed} subtask(s) failed - review required`);
    }

    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate detailed report with all subtasks
   */
  generateDetailedReport() {
    const stats = this.getStats();
    const lines = [];

    lines.push('');
    lines.push('╔' + '═'.repeat(58) + '╗');
    lines.push('║' + ` Implementation Progress: ${this.storyId}`.padEnd(58) + '║');
    lines.push('╚' + '═'.repeat(58) + '╝');
    lines.push('');

    for (const phase of stats.phases) {
      const bar = this.progressBar(phase.percentComplete);
      lines.push(`📁 ${phase.name}`);
      lines.push(`   ${bar} ${phase.percentComplete}% (${phase.completed}/${phase.total})`);
      lines.push('');

      for (const subtask of phase.subtasks) {
        const emoji = StatusEmoji[subtask.status];
        const statusText = subtask.status.padEnd(12);
        lines.push(`   ${emoji} ${subtask.id.padEnd(5)} ${statusText} ${subtask.description}`);
      }

      lines.push('');
    }

    // Summary
    lines.push('─'.repeat(60));
    lines.push('');
    lines.push(`📈 Overall Progress: ${stats.percentComplete}%`);
    lines.push(
      `   Total: ${stats.total} | Completed: ${stats.completed} | In Progress: ${stats.inProgress} | Failed: ${stats.failed}`
    );
    lines.push(`   Status: ${StatusEmoji[stats.status]} ${stats.status.toUpperCase()}`);

    if (stats.current) {
      lines.push('');
      lines.push(`🎯 Current: ${stats.current.subtask} - ${stats.current.description}`);
    }

    // Next subtask
    const nextPending = this.getNextPending(stats);
    if (nextPending && stats.status !== Status.COMPLETED) {
      lines.push(`📌 Next: ${nextPending.id} - ${nextPending.description}`);
    }

    lines.push('');

    return lines.join('\n');
  }

  /**
   * Get next pending subtask
   */
  getNextPending(stats) {
    for (const phase of stats.phases) {
      for (const subtask of phase.subtasks) {
        if (subtask.status === Status.PENDING) {
          return subtask;
        }
      }
    }
    return null;
  }

  /**
   * Save progress snapshot to file
   */
  saveProgress() {
    const report = this.generateDetailedReport();
    const dir = path.dirname(this.progressPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.progressPath, report, 'utf-8');
    return this.progressPath;
  }

  /**
   * Update dashboard status.json with progress (AC7)
   *
   * Updates `.aiox/dashboard/status.json` for dashboard integration.
   * Also updates legacy `.aiox/status.json` for backwards compatibility.
   *
   * @returns {string} Path to updated status file
   */
  updateStatusJson() {
    const stats = this.getStats();

    // AC7: Update dashboard status.json
    const dashboardPath = path.join(this.rootPath, CONFIG.dashboardStatusPath);
    this._updateStatusFile(dashboardPath, stats);

    // Also update legacy path for backwards compatibility
    const legacyPath = path.join(this.rootPath, CONFIG.legacyStatusPath);
    this._updateStatusFile(legacyPath, stats);

    return dashboardPath;
  }

  /**
   * Update a specific status file
   * @private
   * @param {string} statusPath - Path to status file
   * @param {Object} stats - Progress statistics
   */
  _updateStatusFile(statusPath, stats) {
    let status = {};

    if (fs.existsSync(statusPath)) {
      try {
        status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
      } catch {
        // Invalid JSON, start fresh
        status = {};
      }
    }

    // Initialize structure if needed
    if (!status.version) status.version = '1.0';
    if (!status.stories) {
      status.stories = { inProgress: [], completed: [] };
    }

    // AC7: Add/update planProgress section for this story
    if (!status.planProgress) {
      status.planProgress = {};
    }

    status.planProgress[this.storyId] = {
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      pending: stats.pending,
      failed: stats.failed,
      percentage: stats.percentComplete,
      status: stats.status,
      current: stats.current,
      phases: stats.phases.map((p) => ({
        id: p.id,
        name: p.name,
        total: p.total,
        completed: p.completed,
        percentage: p.percentComplete,
      })),
      updatedAt: new Date().toISOString(),
    };

    // Update stories lists based on status
    const inProgressList = status.stories.inProgress || [];
    const completedList = status.stories.completed || [];

    const inProgressIdx = inProgressList.indexOf(this.storyId);
    const completedIdx = completedList.indexOf(this.storyId);

    if (stats.status === Status.COMPLETED) {
      // Move to completed list
      if (inProgressIdx !== -1) {
        inProgressList.splice(inProgressIdx, 1);
      }
      if (completedIdx === -1) {
        completedList.push(this.storyId);
      }
    } else if (stats.status === Status.IN_PROGRESS) {
      // Ensure in inProgress list
      if (completedIdx !== -1) {
        completedList.splice(completedIdx, 1);
      }
      if (inProgressIdx === -1) {
        inProgressList.push(this.storyId);
      }
    }

    status.stories.inProgress = inProgressList;
    status.stories.completed = completedList;
    status.updatedAt = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(statusPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(statusPath, JSON.stringify(status, null, 2), 'utf-8');
  }

  /**
   * Update dashboard status asynchronously
   * @returns {Promise<string>} Path to updated status file
   */
  async updateDashboardStatus() {
    return this.updateStatusJson();
  }

  /**
   * Mark subtask as started
   */
  startSubtask(subtaskId) {
    return this.updateSubtaskStatus(subtaskId, Status.IN_PROGRESS);
  }

  /**
   * Mark subtask as completed
   */
  completeSubtask(subtaskId) {
    return this.updateSubtaskStatus(subtaskId, Status.COMPLETED, {
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark subtask as failed
   */
  failSubtask(subtaskId, error) {
    return this.updateSubtaskStatus(subtaskId, Status.FAILED, {
      failedAt: new Date().toISOString(),
      error,
    });
  }

  /**
   * Update subtask status in implementation.yaml
   */
  updateSubtaskStatus(subtaskId, status, extra = {}) {
    if (!this.plan) {
      this.load();
    }

    let found = false;

    for (const phase of this.plan.phases) {
      for (const subtask of phase.subtasks) {
        if (subtask.id === subtaskId) {
          subtask.status = status;
          Object.assign(subtask, extra);
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      throw new Error(`Subtask ${subtaskId} not found`);
    }

    // Save updated plan
    fs.writeFileSync(this.planPath, yaml.dump(this.plan), 'utf-8');

    // Update status.json
    this.updateStatusJson();

    return this.getStats();
  }

  /**
   * Get progress in the expected interface format (AC2)
   *
   * @returns {Object} Progress metrics
   * { total, completed, inProgress, pending, failed, percentage }
   */
  getProgress() {
    const stats = this.getStats();
    return {
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      pending: stats.pending,
      failed: stats.failed,
      percentage: stats.percentComplete,
      status: stats.status,
      current: stats.current,
      phases: stats.phases,
    };
  }

  /**
   * Print progress to console (AC4)
   */
  printProgress() {
    console.log(this.generateReport());
  }

  /**
   * Save snapshot to file (AC5)
   *
   * @param {string} [outputPath] - Custom output path
   * @returns {Promise<string>} Path to saved file
   */
  async saveSnapshot(outputPath) {
    const savePath = outputPath
      ? path.isAbsolute(outputPath)
        ? outputPath
        : path.join(this.rootPath, outputPath)
      : this.progressPath;

    return this.saveProgress();
  }

  /**
   * Get JSON representation of progress
   */
  toJSON() {
    return this.getStats();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick helper to get progress for a story without creating tracker instance
 *
 * @param {string} storyId - Story ID
 * @returns {Object} Progress metrics
 */
function getPlanProgress(storyId) {
  const tracker = new PlanTracker(storyId);
  try {
    tracker.load();
    return tracker.getProgress();
  } catch {
    return null;
  }
}

/**
 * Update progress after a subtask operation (AC6)
 * Called automatically by subtask operations
 *
 * @param {string} storyId - Story ID
 * @param {string} subtaskId - Subtask ID
 * @param {string} status - New status
 * @returns {Object} Updated stats
 */
function updateAfterSubtask(storyId, subtaskId, status) {
  const tracker = new PlanTracker(storyId);
  tracker.load();
  tracker.updateSubtaskStatus(subtaskId, status);
  return tracker.getStats();
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log(`
\u{1F4CA} Plan Progress Tracker - AIOX Execution Engine (Story 4.6)

Usage:
  node plan-tracker.js <story-id> [command] [options]
  *plan-status <story-id> [command] [options]

Commands:
  status          Show progress status (default)
  detailed        Show detailed progress with all subtasks
  json            Output progress as JSON
  save            Save progress snapshot to plan/build-progress.txt (AC5)
  update          Update dashboard status.json (AC7)
  all             Save snapshot AND update dashboard
  start <id>      Mark subtask as in_progress
  complete <id>   Mark subtask as completed (auto-updates dashboard - AC6)
  fail <id>       Mark subtask as failed (auto-updates dashboard - AC6)

Options:
  --plan-path <path>    Explicit path to implementation.yaml
  --quiet, -q           Suppress visual output
  --help, -h            Show this help message

Examples:
  node plan-tracker.js STORY-42
  node plan-tracker.js STORY-42 detailed
  node plan-tracker.js STORY-42 json
  node plan-tracker.js STORY-42 save
  node plan-tracker.js STORY-42 all
  node plan-tracker.js STORY-42 start 1.1
  node plan-tracker.js STORY-42 complete 1.1
  node plan-tracker.js --plan-path docs/stories/STORY-42/plan/implementation.yaml

Acceptance Criteria Coverage:
  AC1: Located in .aiox-core/infrastructure/scripts/
  AC2: Calculates total, completed, in-progress, pending, failed
  AC3: *plan-status {story-id} command globally available
  AC4: Visual progress bars in output
  AC5: Generates plan/build-progress.txt snapshot
  AC6: Auto-updates after each subtask
  AC7: Integrates with .aiox/dashboard/status.json
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  let storyId = null;
  let planPath = null;
  let command = 'status';
  let subtaskId = null;
  let errorMessage = null;
  let quiet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--plan-path' && args[i + 1]) {
      planPath = args[++i];
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else if (!command || command === 'status') {
        command = arg;
      } else if (!subtaskId) {
        subtaskId = arg;
      } else {
        errorMessage = arg;
      }
    }
  }

  if (!storyId && !planPath) {
    console.error('Error: Story ID or --plan-path required');
    process.exit(1);
  }

  try {
    const tracker = new PlanTracker({
      storyId,
      planPath,
    });

    switch (command) {
      case 'status':
        console.log(tracker.generateReport());
        break;

      case 'detailed':
        console.log(tracker.generateDetailedReport());
        break;

      case 'json':
        console.log(JSON.stringify(tracker.getProgress(), null, 2));
        break;

      case 'save':
        const savePath = tracker.saveProgress();
        if (!quiet) console.log(`\u2705 Progress snapshot saved to: ${savePath}`);
        break;

      case 'update':
        const updatePath = tracker.updateStatusJson();
        if (!quiet) console.log(`\u2705 Dashboard status.json updated: ${updatePath}`);
        break;

      case 'all':
        const snapshotPath = tracker.saveProgress();
        const dashboardPath = tracker.updateStatusJson();
        if (!quiet) {
          console.log(`\u2705 Progress snapshot saved to: ${snapshotPath}`);
          console.log(`\u2705 Dashboard status.json updated: ${dashboardPath}`);
        }
        break;

      case 'start':
        if (!subtaskId) {
          console.error('Error: subtask ID required for start command');
          process.exit(1);
        }
        tracker.startSubtask(subtaskId);
        if (!quiet) {
          console.log(`\u{1F504} Subtask ${subtaskId} marked as in_progress`);
          console.log(tracker.generateReport());
        }
        break;

      case 'complete':
        if (!subtaskId) {
          console.error('Error: subtask ID required for complete command');
          process.exit(1);
        }
        tracker.completeSubtask(subtaskId);
        // AC6: Auto-update dashboard after subtask completion
        tracker.updateStatusJson();
        if (!quiet) {
          console.log(`\u2705 Subtask ${subtaskId} marked as completed`);
          console.log(tracker.generateReport());
        }
        break;

      case 'fail':
        if (!subtaskId) {
          console.error('Error: subtask ID required for fail command');
          process.exit(1);
        }
        tracker.failSubtask(subtaskId, errorMessage || 'Unknown error');
        // AC6: Auto-update dashboard after subtask failure
        tracker.updateStatusJson();
        if (!quiet) {
          console.log(`\u274C Subtask ${subtaskId} marked as failed`);
          console.log(tracker.generateReport());
        }
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n\u274C Error: ${error.message}`);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  PlanTracker,
  Status,
  StatusEmoji,
  // Helper functions
  getPlanProgress,
  updateAfterSubtask,
  // Config for external use
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
