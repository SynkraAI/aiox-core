/**
 * CLI Commands - Story 0.9
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * CLI command handlers for orchestrator control.
 *
 * Features:
 * - AC1: *orchestrate {story-id} starts full pipeline
 * - AC2: *orchestrate-status {story-id} shows progress
 * - AC3: *orchestrate-stop {story-id} stops execution
 * - AC4: *orchestrate-resume {story-id} continues execution
 * - AC5: --epic N flag for specific epic start
 * - AC6: --dry-run flag for preview
 * - AC7: Commands available globally
 *
 * @module core/orchestration/cli-commands
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const MasterOrchestrator = require('./master-orchestrator');

// Optional chalk for colored output
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
    magenta: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              COMMAND: orchestrate (AC1)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Execute orchestrate command (AC1)
 *
 * @param {string} storyId - Story ID to orchestrate
 * @param {Object} options - Command options
 * @param {number} [options.epic] - Start from specific epic (AC5)
 * @param {boolean} [options.dryRun] - Preview without execution (AC6)
 * @param {boolean} [options.strict] - Enable strict gate mode
 * @param {string} [options.projectRoot] - Project root path
 * @returns {Promise<Object>} Command result
 */
async function orchestrate(storyId, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  if (!storyId) {
    return {
      success: false,
      exitCode: 3,
      error: 'Story ID is required',
    };
  }

  console.log(chalk.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold(`  🚀 AIOX Orchestrator: ${storyId}`));
  console.log(chalk.cyan('═══════════════════════════════════════════════════════════\n'));

  // Dry run mode (AC6)
  if (options.dryRun) {
    return await orchestrateDryRun(storyId, options);
  }

  try {
    const orchestrator = new MasterOrchestrator(projectRoot, {
      storyId,
      strictGates: options.strict ?? false,
      dashboardAutoUpdate: true,
    });

    // Start dashboard
    await orchestrator.startDashboard();

    // Setup event handlers
    setupEventHandlers(orchestrator);

    let result;

    // Start from specific epic (AC5)
    if (options.epic) {
      console.log(chalk.yellow(`Starting from Epic ${options.epic}...`));
      result = await orchestrator.resumeFromEpic(options.epic);
    } else {
      console.log(chalk.green('Starting full pipeline...'));
      result = await orchestrator.executeFullPipeline();
    }

    // Stop dashboard
    orchestrator.stopDashboard();

    // Display final result
    displayResult(result);

    return {
      success: result.success,
      exitCode: result.success ? 0 : result.blocked ? 2 : 1,
      result,
    };
  } catch (error) {
    console.log(chalk.red(`\n❌ Orchestration failed: ${error.message}`));
    return {
      success: false,
      exitCode: 1,
      error: error.message,
    };
  }
}

/**
 * Dry run orchestration (AC6)
 * @private
 */
async function orchestrateDryRun(storyId, options) {
  console.log(chalk.yellow('🔍 DRY RUN MODE - No actual execution\n'));

  const projectRoot = options.projectRoot || process.cwd();
  const orchestrator = new MasterOrchestrator(projectRoot, {
    storyId,
    strictGates: options.strict ?? false,
  });

  // Initialize to detect tech stack
  await orchestrator.initialize();

  // Display what would happen
  console.log(chalk.bold('Pipeline Preview:'));
  console.log(chalk.gray('─'.repeat(50)));

  const epicConfig = orchestrator.constructor.EPIC_CONFIG;
  const startEpic = options.epic || 3;

  // Use dynamic epic list from config (excludes onDemand epics like Epic 5)
  const epicNums = Object.keys(epicConfig)
    .map(Number)
    .filter((num) => !epicConfig[num].onDemand)
    .sort((a, b) => a - b);

  for (const epicNum of epicNums) {
    const config = epicConfig[epicNum];
    if (epicNum < startEpic) {
      console.log(chalk.gray(`  ⏭️  Epic ${epicNum}: ${config.name} (skipped)`));
    } else {
      console.log(chalk.cyan(`  ▶️  Epic ${epicNum}: ${config.name}`));
    }
  }

  console.log(chalk.gray('─'.repeat(50)));

  if (orchestrator.executionState.techStackProfile) {
    console.log(chalk.bold('\nDetected Tech Stack:'));
    const tech = orchestrator.executionState.techStackProfile;
    if (tech.hasDatabase)
      console.log(chalk.green(`  ✓ Database: ${tech.database?.type || 'detected'}`));
    if (tech.hasFrontend)
      console.log(chalk.green(`  ✓ Frontend: ${tech.frontend?.framework || 'detected'}`));
    if (tech.hasBackend)
      console.log(chalk.green(`  ✓ Backend: ${tech.backend?.framework || 'detected'}`));
  }

  console.log(chalk.yellow('\n✅ Dry run complete. Run without --dry-run to execute.\n'));

  return {
    success: true,
    exitCode: 0,
    dryRun: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              COMMAND: orchestrate-status (AC2)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Show orchestrator status (AC2)
 *
 * @param {string} storyId - Story ID to check
 * @param {Object} options - Command options
 * @param {string} [options.projectRoot] - Project root path
 * @returns {Promise<Object>} Command result
 */
async function orchestrateStatus(storyId, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  if (!storyId) {
    return {
      success: false,
      exitCode: 3,
      error: 'Story ID is required',
    };
  }

  const statePath = path.join(projectRoot, '.aiox', 'master-orchestrator', `${storyId}.json`);

  if (!(await fs.pathExists(statePath))) {
    console.log(chalk.yellow(`\n⚠️  No orchestrator state found for ${storyId}`));
    console.log(chalk.gray(`   Run *orchestrate ${storyId} to start.\n`));
    return {
      success: false,
      exitCode: 1,
      error: 'State not found',
    };
  }

  try {
    const state = await fs.readJson(statePath);

    console.log(chalk.cyan(`\n📊 Orchestrator Status: ${storyId}`));
    console.log(chalk.gray('═'.repeat(50)));

    // State
    console.log(`\nState: ${formatState(state.status)}`);
    console.log(`Current Epic: ${state.currentEpic || 'N/A'}`);

    // Progress
    const progress = calculateProgress(state);
    console.log(`Progress: ${formatProgress(progress)}%`);

    // Epic status
    console.log(chalk.bold('\nEpic Status:'));
    const epicConfig = MasterOrchestrator.EPIC_CONFIG;
    for (const [num, epic] of Object.entries(state.epics || {})) {
      const config = epicConfig[num] || { name: `Epic ${num}` };
      console.log(
        `  ${formatEpicStatus(epic.status)} Epic ${num}: ${config.name} - ${epic.status}`,
      );
    }

    // Timing
    console.log(chalk.bold('\nTiming:'));
    console.log(`  Started: ${formatDate(state.startedAt)}`);
    console.log(`  Updated: ${formatDate(state.updatedAt)}`);

    // Errors
    const errorCount = (state.errors || []).length;
    console.log(`\nErrors: ${errorCount > 0 ? chalk.red(errorCount) : chalk.green('0')}`);
    console.log(`Blocked: ${state.status === 'blocked' ? chalk.red('Yes') : chalk.green('No')}`);

    console.log(chalk.gray('\n' + '═'.repeat(50) + '\n'));

    return {
      success: true,
      exitCode: 0,
      state,
    };
  } catch (error) {
    console.log(chalk.red(`\n❌ Failed to read status: ${error.message}\n`));
    return {
      success: false,
      exitCode: 1,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              COMMAND: orchestrate-stop (AC3)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Stop orchestrator execution (AC3)
 *
 * @param {string} storyId - Story ID to stop
 * @param {Object} options - Command options
 * @param {string} [options.projectRoot] - Project root path
 * @returns {Promise<Object>} Command result
 */
async function orchestrateStop(storyId, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  if (!storyId) {
    return {
      success: false,
      exitCode: 3,
      error: 'Story ID is required',
    };
  }

  const statePath = path.join(projectRoot, '.aiox', 'master-orchestrator', `${storyId}.json`);

  if (!(await fs.pathExists(statePath))) {
    console.log(chalk.yellow(`\n⚠️  No orchestrator state found for ${storyId}\n`));
    return {
      success: false,
      exitCode: 1,
      error: 'State not found',
    };
  }

  try {
    console.log(chalk.yellow(`\n🛑 Stopping orchestrator for ${storyId}...`));

    const state = await fs.readJson(statePath);

    // Update state to stopped
    state.status = 'stopped';
    state.updatedAt = new Date().toISOString();

    await fs.writeJson(statePath, state, { spaces: 2 });

    console.log(chalk.gray(`\nCurrent state: ${state.status}`));
    console.log(chalk.gray(`Current epic: ${state.currentEpic || 'N/A'}`));
    console.log(chalk.gray(`\nState saved at: ${statePath}`));

    console.log(chalk.green('\n✅ Orchestrator stopped successfully.'));
    console.log(chalk.gray(`   Run *orchestrate-resume ${storyId} to continue.\n`));

    return {
      success: true,
      exitCode: 0,
    };
  } catch (error) {
    console.log(chalk.red(`\n❌ Failed to stop: ${error.message}\n`));
    return {
      success: false,
      exitCode: 1,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              COMMAND: orchestrate-resume (AC4)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Resume orchestrator execution (AC4)
 *
 * @param {string} storyId - Story ID to resume
 * @param {Object} options - Command options
 * @param {string} [options.projectRoot] - Project root path
 * @returns {Promise<Object>} Command result
 */
async function orchestrateResume(storyId, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  if (!storyId) {
    return {
      success: false,
      exitCode: 3,
      error: 'Story ID is required',
    };
  }

  const statePath = path.join(projectRoot, '.aiox', 'master-orchestrator', `${storyId}.json`);

  if (!(await fs.pathExists(statePath))) {
    console.log(chalk.yellow(`\n⚠️  No saved state found for ${storyId}`));
    console.log(chalk.gray(`   Run *orchestrate ${storyId} to start fresh.\n`));
    return {
      success: false,
      exitCode: 1,
      error: 'State not found',
    };
  }

  try {
    const state = await fs.readJson(statePath);

    // Check if resumable
    if (state.status === 'complete') {
      console.log(chalk.green(`\n✅ Story ${storyId} already completed.`));
      console.log(chalk.gray(`   Run *orchestrate ${storyId} --epic 3 to restart.\n`));
      return {
        success: false,
        exitCode: 2,
        error: 'Already completed',
      };
    }

    console.log(chalk.cyan(`\n🔄 Resuming orchestrator for ${storyId}...`));
    console.log(chalk.gray(`\nLoading state from: ${statePath}`));

    console.log(chalk.bold('\nPrevious state:'));
    console.log(chalk.gray(`  Status: ${state.status}`));
    console.log(chalk.gray(`  Last Epic: ${state.currentEpic || 'N/A'}`));
    console.log(chalk.gray(`  Stopped at: ${formatDate(state.updatedAt)}`));

    // Find resume point
    let resumeEpic = state.currentEpic || 3;
    const epicState = state.epics?.[resumeEpic];
    if (epicState?.status === 'completed') {
      // Find next incomplete epic
      for (const num of [3, 4, 6, 7]) {
        if (state.epics?.[num]?.status !== 'completed') {
          resumeEpic = num;
          break;
        }
      }
    }

    console.log(chalk.yellow(`\nResuming from Epic ${resumeEpic}...\n`));

    // Create orchestrator and resume
    const orchestrator = new MasterOrchestrator(projectRoot, {
      storyId,
      dashboardAutoUpdate: true,
    });

    await orchestrator.startDashboard();
    setupEventHandlers(orchestrator);

    const result = await orchestrator.resumeFromEpic(resumeEpic);

    orchestrator.stopDashboard();
    displayResult(result);

    return {
      success: result.success,
      exitCode: result.success ? 0 : result.blocked ? 2 : 1,
      result,
    };
  } catch (error) {
    console.log(chalk.red(`\n❌ Failed to resume: ${error.message}\n`));
    return {
      success: false,
      exitCode: 1,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Setup event handlers for orchestrator
 * @private
 */
function setupEventHandlers(orchestrator) {
  orchestrator.on('stateChange', (data) => {
    console.log(chalk.gray(`   📊 State: ${data.oldState} → ${data.newState}`));
  });

  orchestrator.on('epicStart', (data) => {
    const epicConfig = orchestrator.constructor.EPIC_CONFIG;
    const config = epicConfig[data.epicNum] || {};
    console.log(chalk.cyan(`\n📝 Starting Epic ${data.epicNum}: ${config.name || 'Unknown'}`));
    if (config.description) {
      console.log(chalk.gray(`   ${config.description}`));
    }
  });

  orchestrator.on('epicComplete', (data) => {
    console.log(chalk.green(`   ✅ Epic ${data.epicNum} complete`));
    if (data.gateResult) {
      console.log(chalk.gray(`   Gate: ${data.gateResult.verdict}`));
    }
  });
}

/**
 * Display final result
 * @private
 */
function displayResult(result) {
  console.log(chalk.cyan('\n═══════════════════════════════════════════════════════════'));

  if (result.success) {
    console.log(chalk.green.bold('  ✅ ORCHESTRATION COMPLETE'));
  } else if (result.blocked) {
    console.log(chalk.red.bold('  🚫 ORCHESTRATION BLOCKED'));
  } else {
    console.log(chalk.red.bold('  ❌ ORCHESTRATION FAILED'));
  }

  console.log(chalk.cyan('═══════════════════════════════════════════════════════════'));

  console.log(chalk.gray(`\nDuration: ${result.duration || 'N/A'}`));
  console.log(chalk.gray(`Epics Executed: ${result.epics?.executed?.length || 0}`));

  if (result.errors?.length > 0) {
    console.log(chalk.red(`\nErrors: ${result.errors.length}`));
    for (const err of result.errors.slice(0, 3)) {
      console.log(chalk.red(`  - ${err.message || err}`));
    }
  }

  console.log('');
}

/**
 * Format state for display
 * @private
 */
function formatState(status) {
  const colors = {
    initialized: chalk.gray,
    ready: chalk.cyan,
    in_progress: chalk.yellow,
    complete: chalk.green,
    blocked: chalk.red,
    stopped: chalk.yellow,
    failed: chalk.red,
  };
  return (colors[status] || chalk.white)(status);
}

/**
 * Format epic status for display
 * @private
 */
function formatEpicStatus(status) {
  const icons = {
    pending: '⏸️',
    in_progress: '⏳',
    completed: '✅',
    failed: '❌',
    skipped: '⏭️',
  };
  return icons[status] || '⬜';
}

/**
 * Format progress as percentage
 * @private
 */
function formatProgress(progress) {
  if (progress >= 100) return chalk.green(progress);
  if (progress >= 50) return chalk.yellow(progress);
  return chalk.gray(progress);
}

/**
 * Format date for display
 * @private
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

/**
 * Calculate progress from state
 * @private
 */
function calculateProgress(state) {
  if (!state.epics) return 0;

  const epics = [3, 4, 6, 7];
  const completed = epics.filter((num) => state.epics[num]?.status === 'completed').length;
  return Math.round((completed / epics.length) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  orchestrate,
  orchestrateStatus,
  orchestrateStop,
  orchestrateResume,

  // Aliases for command parsing
  commands: {
    orchestrate: orchestrate,
    'orchestrate-status': orchestrateStatus,
    'orchestrate-stop': orchestrateStop,
    'orchestrate-resume': orchestrateResume,
  },
};
