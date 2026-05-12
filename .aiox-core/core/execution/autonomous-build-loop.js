#!/usr/bin/env node

/**
 * Autonomous Build Loop - Story 8.1
 *
 * Executes builds autonomously in a loop: load spec → create plan → execute subtasks → verify → retry/complete.
 * Inspired by Auto-Claude's Coder Agent but with AIOX extensibility.
 *
 * Features:
 * - AC1: Located in `.aiox-core/core/execution/`
 * - AC2: Loop: load spec → create plan → execute subtasks → verify → retry/complete
 * - AC3: Maximum 10 iterations per subtask (configurable)
 * - AC4: Global timeout of 30 minutes per story (configurable)
 * - AC5: Command `*build-autonomous {story-id}` in @dev
 * - AC6: State persisted in `plan/build-state.json` for recovery
 * - AC7: Events emitted: build_started, subtask_completed, build_failed, build_success
 * - AC8: Integration with Epic 5 (Recovery System) for resume
 *
 * @module autonomous-build-loop
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Import Epic 8.4 Build State Manager
const { BuildStateManager } = require('./build-state-manager');

// Import Epic 5 Recovery System
let RecoveryTracker;
try {
  RecoveryTracker = require('../../infrastructure/scripts/recovery-tracker').RecoveryTracker;
} catch {
  RecoveryTracker = null;
}

// Import Epic 8.2 Worktree Manager (Story 8.2 integration - AC8)
let WorktreeManager;
try {
  WorktreeManager = require('../../infrastructure/scripts/worktree-manager');
} catch {
  WorktreeManager = null;
}

// Optional chalk for CLI output
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
    bgRed: (s) => s,
    bgGreen: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  maxIterations: 10, // AC3: Max attempts per subtask
  globalTimeout: 30 * 60 * 1000, // AC4: 30 minutes global timeout
  subtaskTimeout: 5 * 60 * 1000, // 5 minutes per subtask
  selfCritiqueEnabled: true, // Enable self-critique steps (5.5, 6.5)
  verificationEnabled: true, // Run verification after each subtask
  autoCommit: true, // Auto-commit after successful subtask
  pauseOnFailure: false, // Pause build on failure (vs continue)
  verbose: false, // Verbose logging
  // Worktree isolation (Story 8.2 - AC8)
  useWorktree: false, // Execute in isolated worktree
  worktreeCleanup: true, // Auto-cleanup worktree after success
};

const BuildEvent = {
  BUILD_STARTED: 'build_started', // AC7
  SUBTASK_STARTED: 'subtask_started',
  SUBTASK_COMPLETED: 'subtask_completed', // AC7
  SUBTASK_FAILED: 'subtask_failed',
  ITERATION_STARTED: 'iteration_started',
  ITERATION_COMPLETED: 'iteration_completed',
  SELF_CRITIQUE: 'self_critique',
  VERIFICATION_STARTED: 'verification_started',
  VERIFICATION_COMPLETED: 'verification_completed',
  BUILD_FAILED: 'build_failed', // AC7
  BUILD_SUCCESS: 'build_success', // AC7
  BUILD_TIMEOUT: 'build_timeout',
  BUILD_PAUSED: 'build_paused',
};

const SubtaskResult = {
  SUCCESS: 'success',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  SKIPPED: 'skipped',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              AUTONOMOUS BUILD LOOP CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * AutonomousBuildLoop - Executes builds autonomously
 *
 * Integrates with:
 * - BuildStateManager (Epic 8.4) for state persistence and recovery
 * - RecoveryTracker (Epic 5) for attempt tracking
 * - SubtaskExecutor (Epic 4) for subtask execution
 */
class AutonomousBuildLoop extends EventEmitter {
  /**
   * Create a new AutonomousBuildLoop
   *
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    super();

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stateManager = null;
    this.recoveryTracker = null;
    this.worktreeManager = null; // Story 8.2 integration
    this.worktreePath = null; // Story 8.2 integration
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.currentSubtask = null;

    // Statistics
    this.stats = {
      totalSubtasks: 0,
      completedSubtasks: 0,
      failedSubtasks: 0,
      totalIterations: 0,
      successfulIterations: 0,
      failedIterations: 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              MAIN LOOP (AC2)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Run the autonomous build loop (AC2)
   *
   * Loop: load spec → create plan → execute subtasks → verify → retry/complete
   *
   * @param {string} storyId - Story identifier
   * @param {Object} options - Run options
   * @returns {Promise<Object>} Build result
   */
  async run(storyId, options = {}) {
    if (this.isRunning) {
      throw new Error('Build loop is already running');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();

    // Initialize state manager (AC6)
    this.stateManager = new BuildStateManager(storyId, {
      planDir: options.planDir || path.join(process.cwd(), 'plan'),
      rootPath: options.rootPath || process.cwd(),
      config: this.config,
    });

    // Initialize recovery tracker (AC8)
    if (RecoveryTracker) {
      this.recoveryTracker = new RecoveryTracker({
        storyId,
        rootPath: options.rootPath || process.cwd(),
      });
    }

    // Initialize worktree manager (Story 8.2 - AC8)
    if (this.config.useWorktree && WorktreeManager) {
      this.worktreeManager = new WorktreeManager(options.rootPath || process.cwd());
      try {
        const worktreeInfo = await this.worktreeManager.create(storyId);
        this.worktreePath = worktreeInfo.path;
        this.log(`Created worktree at ${this.worktreePath}`, 'success');
      } catch (error) {
        // Worktree might already exist
        const existing = await this.worktreeManager.get(storyId);
        if (existing) {
          this.worktreePath = existing.path;
          this.log(`Using existing worktree at ${this.worktreePath}`, 'info');
        } else {
          this.log(
            `Worktree creation failed: ${error.message}, continuing without isolation`,
            'warn',
          );
        }
      }
    }

    try {
      // Load or create state
      const state = this.stateManager.loadOrCreateState({
        totalSubtasks: options.totalSubtasks || 0,
        worktree: options.worktree,
        plan: options.plan,
      });

      // Emit build started (AC7)
      this.emit(BuildEvent.BUILD_STARTED, {
        storyId,
        startTime: this.startTime,
        config: this.config,
        resuming: state.checkpoints.length > 0,
      });

      // Load implementation plan
      const plan = await this.loadPlan(storyId, options);
      if (!plan) {
        throw new Error(`No implementation plan found for ${storyId}`);
      }

      this.stats.totalSubtasks = this.countSubtasks(plan);
      this.stateManager._state.metrics.totalSubtasks = this.stats.totalSubtasks;
      this.stateManager.saveState();

      // Main execution loop
      const result = await this.executeLoop(plan, state);

      // Finalize
      if (result.success) {
        this.stateManager.completeBuild();

        // Cleanup worktree on success (Story 8.2)
        if (this.worktreeManager && this.worktreePath && this.config.worktreeCleanup) {
          try {
            await this.worktreeManager.remove(storyId);
            this.log(`Cleaned up worktree for ${storyId}`, 'success');
          } catch (err) {
            this.log(`Worktree cleanup failed: ${err.message}`, 'warn');
          }
        }

        this.emit(BuildEvent.BUILD_SUCCESS, {
          storyId,
          duration: Date.now() - this.startTime,
          stats: this.stats,
          worktreePath: this.worktreePath,
        });
      } else {
        this.stateManager.failBuild(result.error || 'Build failed');
        this.emit(BuildEvent.BUILD_FAILED, {
          storyId,
          error: result.error,
          duration: Date.now() - this.startTime,
          stats: this.stats,
        });
      }

      return this.generateReport(storyId, result);
    } catch (error) {
      this.emit(BuildEvent.BUILD_FAILED, {
        storyId,
        error: error.message,
        duration: Date.now() - this.startTime,
      });

      if (this.stateManager) {
        this.stateManager.failBuild(error.message);
      }

      throw error;
    } finally {
      this.isRunning = false;
      this.currentSubtask = null;
    }
  }

  /**
   * Execute the main loop over all subtasks
   * @private
   */
  async executeLoop(plan, state) {
    const completedSubtasks = new Set(state.completedSubtasks || []);
    const results = [];

    for (const phase of plan.phases || []) {
      for (const subtask of phase.subtasks || []) {
        // Check global timeout (AC4)
        if (this.isTimedOut()) {
          this.emit(BuildEvent.BUILD_TIMEOUT, {
            elapsed: Date.now() - this.startTime,
            timeout: this.config.globalTimeout,
          });
          return {
            success: false,
            error: 'Global timeout exceeded',
            results,
          };
        }

        // Check if paused
        if (this.isPaused) {
          this.emit(BuildEvent.BUILD_PAUSED, {
            currentSubtask: subtask.id,
          });
          return {
            success: false,
            error: 'Build paused',
            paused: true,
            results,
          };
        }

        // Skip completed subtasks
        if (completedSubtasks.has(subtask.id)) {
          this.log(`Skipping completed subtask: ${subtask.id}`);
          continue;
        }

        // Execute subtask with retry loop
        const subtaskResult = await this.executeSubtaskWithRetry(subtask, phase);
        results.push(subtaskResult);

        if (subtaskResult.status === SubtaskResult.SUCCESS) {
          completedSubtasks.add(subtask.id);
          this.stats.completedSubtasks++;
        } else if (subtaskResult.status === SubtaskResult.FAILED) {
          this.stats.failedSubtasks++;

          if (this.config.pauseOnFailure) {
            return {
              success: false,
              error: `Subtask ${subtask.id} failed after max iterations`,
              failedSubtask: subtask.id,
              results,
            };
          }
        }
      }
    }

    // Check if all subtasks completed
    const allCompleted = this.stats.completedSubtasks >= this.stats.totalSubtasks;

    return {
      success: allCompleted,
      error: allCompleted ? null : 'Not all subtasks completed',
      results,
    };
  }

  /**
   * Execute a single subtask with retry loop (AC3)
   * @private
   */
  async executeSubtaskWithRetry(subtask, phase) {
    this.currentSubtask = subtask.id;

    this.emit(BuildEvent.SUBTASK_STARTED, {
      subtaskId: subtask.id,
      phase: phase.id,
      description: subtask.description,
    });

    // Update state
    this.stateManager.startSubtask(subtask.id, { phase: phase.id });

    let lastError = null;
    let attempts = 0;

    // Retry loop (AC3)
    for (let iteration = 1; iteration <= this.config.maxIterations; iteration++) {
      attempts++;
      this.stats.totalIterations++;

      // Check timeout
      if (this.isTimedOut()) {
        return {
          subtaskId: subtask.id,
          status: SubtaskResult.TIMEOUT,
          attempts,
          error: 'Global timeout',
        };
      }

      this.emit(BuildEvent.ITERATION_STARTED, {
        subtaskId: subtask.id,
        iteration,
        maxIterations: this.config.maxIterations,
      });

      // Track attempt (AC8)
      if (this.recoveryTracker) {
        this.recoveryTracker.startAttempt(subtask.id, {
          approach: `Iteration ${iteration}: ${subtask.description}`,
          changes: subtask.files || [],
        });
      }

      try {
        // Execute the subtask
        const startTime = Date.now();
        const result = await this.executeSubtask(subtask, iteration);
        const duration = Date.now() - startTime;

        if (result.success) {
          this.stats.successfulIterations++;

          // Complete recovery tracking
          if (this.recoveryTracker) {
            this.recoveryTracker.completeAttempt(subtask.id, {
              success: true,
              notes: `Completed in iteration ${iteration}`,
            });
          }

          // Save checkpoint
          this.stateManager.completeSubtask(subtask.id, {
            duration,
            filesModified: result.filesModified || subtask.files || [],
            attempts: iteration,
          });

          this.emit(BuildEvent.SUBTASK_COMPLETED, {
            subtaskId: subtask.id,
            iteration,
            duration,
            filesModified: result.filesModified,
          });

          return {
            subtaskId: subtask.id,
            status: SubtaskResult.SUCCESS,
            attempts: iteration,
            duration,
            result,
          };
        }

        // Failed iteration
        lastError = result.error || 'Unknown error';
        this.stats.failedIterations++;

        // Record failure
        this.stateManager.recordFailure(subtask.id, {
          attempt: iteration,
          error: lastError,
          duration,
        });

        if (this.recoveryTracker) {
          this.recoveryTracker.completeAttempt(subtask.id, {
            success: false,
            error: lastError,
          });
        }

        this.emit(BuildEvent.ITERATION_COMPLETED, {
          subtaskId: subtask.id,
          iteration,
          success: false,
          error: lastError,
        });

        // Self-critique before retry
        if (this.config.selfCritiqueEnabled && iteration < this.config.maxIterations) {
          await this.performSelfCritique(subtask, result, iteration);
        }
      } catch (error) {
        lastError = error.message;
        this.stats.failedIterations++;

        this.stateManager.recordFailure(subtask.id, {
          attempt: iteration,
          error: lastError,
        });

        if (this.recoveryTracker) {
          this.recoveryTracker.completeAttempt(subtask.id, {
            success: false,
            error: lastError,
          });
        }

        this.log(`Iteration ${iteration} error: ${lastError}`, 'error');
      }
    }

    // Max iterations reached
    this.emit(BuildEvent.SUBTASK_FAILED, {
      subtaskId: subtask.id,
      attempts,
      error: lastError,
    });

    return {
      subtaskId: subtask.id,
      status: SubtaskResult.FAILED,
      attempts,
      error: lastError,
    };
  }

  /**
   * Execute a single subtask iteration
   * @private
   */
  async executeSubtask(subtask, iteration) {
    // This is where the actual subtask execution happens
    // In a full implementation, this would:
    // 1. Load context (project-context, files-context)
    // 2. Understand the subtask requirements
    // 3. Write code
    // 4. Run self-critique (Step 5.5)
    // 5. Run tests
    // 6. Run self-critique (Step 6.5)
    // 7. Fix issues
    // 8. Run linter
    // 9. Fix lint issues
    // 10. Verify

    // For now, we provide a hook for external execution
    if (this.config.executor) {
      return await this.config.executor(subtask, {
        iteration,
        storyId: this.stateManager.storyId,
        config: this.config,
      });
    }

    // Default: simulate execution (for testing)
    this.log(`Executing subtask ${subtask.id} (iteration ${iteration})`, 'info');

    // Check for verification command
    if (subtask.verification && this.config.verificationEnabled) {
      const verifyResult = await this.runVerification(subtask);
      if (!verifyResult.success) {
        return {
          success: false,
          error: verifyResult.error || 'Verification failed',
        };
      }
    }

    return {
      success: true,
      filesModified: subtask.files || [],
    };
  }

  /**
   * Run verification for a subtask
   * @private
   */
  async runVerification(subtask) {
    this.emit(BuildEvent.VERIFICATION_STARTED, {
      subtaskId: subtask.id,
      verification: subtask.verification,
    });

    try {
      // Different verification types
      const verification = subtask.verification;

      if (verification.type === 'command') {
        // Run shell command
        const { execSync } = require('child_process');
        execSync(verification.command, {
          timeout: this.config.subtaskTimeout,
          stdio: 'pipe',
        });
      } else if (verification.type === 'test') {
        // Run specific test
        const { execSync } = require('child_process');
        execSync(verification.testCommand || 'npm test', {
          timeout: this.config.subtaskTimeout,
          stdio: 'pipe',
        });
      }

      this.emit(BuildEvent.VERIFICATION_COMPLETED, {
        subtaskId: subtask.id,
        success: true,
      });

      return { success: true };
    } catch (error) {
      this.emit(BuildEvent.VERIFICATION_COMPLETED, {
        subtaskId: subtask.id,
        success: false,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Perform self-critique before retry
   * @private
   */
  async performSelfCritique(subtask, failedResult, iteration) {
    this.emit(BuildEvent.SELF_CRITIQUE, {
      subtaskId: subtask.id,
      iteration,
      failedResult,
    });

    // Self-critique analysis
    const critique = {
      predictedBugs: [],
      edgeCases: [],
      errorHandling: [],
      patternAdherence: [],
    };

    // In a full implementation, this would analyze:
    // Step 5.5: Predicted bugs, edge cases, error handling
    // Step 6.5: Pattern adherence, no hardcoded values, tests, docs

    this.log(`Self-critique for ${subtask.id}: analyzing failure...`, 'info');

    return critique;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              PLAN MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Load implementation plan for story
   * @private
   */
  async loadPlan(storyId, options) {
    // Try different plan locations
    const planPaths = [
      options.planPath,
      path.join(process.cwd(), 'plan', 'implementation.yaml'),
      path.join(process.cwd(), 'plan', 'implementation.json'),
      path.join(process.cwd(), 'docs', 'stories', storyId, 'plan', 'implementation.yaml'),
      path.join(process.cwd(), 'docs', 'stories', storyId, 'plan', 'implementation.json'),
    ].filter(Boolean);

    for (const planPath of planPaths) {
      if (fs.existsSync(planPath)) {
        const content = fs.readFileSync(planPath, 'utf-8');

        if (planPath.endsWith('.yaml') || planPath.endsWith('.yml')) {
          const yaml = require('js-yaml');
          return yaml.load(content);
        }

        return JSON.parse(content);
      }
    }

    // Check if plan is provided directly
    if (options.plan) {
      return options.plan;
    }

    return null;
  }

  /**
   * Count total subtasks in plan
   * @private
   */
  countSubtasks(plan) {
    let count = 0;
    for (const phase of plan.phases || []) {
      count += (phase.subtasks || []).length;
    }
    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CONTROL METHODS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Pause the build loop
   */
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.log('Build paused', 'warn');
    }
  }

  /**
   * Resume the build loop
   *
   * @param {string} storyId - Story identifier
   * @param {Object} options - Resume options
   * @returns {Promise<Object>} Build result
   */
  async resume(storyId, options = {}) {
    if (this.isRunning) {
      throw new Error('Build loop is already running');
    }

    // Load state
    const stateManager = new BuildStateManager(storyId, {
      planDir: options.planDir || path.join(process.cwd(), 'plan'),
      rootPath: options.rootPath || process.cwd(),
    });

    const resumeContext = stateManager.resumeBuild();

    this.log(`Resuming build from checkpoint: ${resumeContext.lastCheckpoint?.id}`, 'info');

    // Run with existing state
    return this.run(storyId, {
      ...options,
      plan: resumeContext.plan,
      worktree: resumeContext.worktree,
    });
  }

  /**
   * Stop the build loop
   */
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      this.isPaused = false;
      this.log('Build stopped', 'warn');
    }
  }

  /**
   * Check if build has timed out (AC4)
   * @private
   */
  isTimedOut() {
    if (!this.startTime || !this.config.globalTimeout) {
      return false;
    }
    return Date.now() - this.startTime > this.config.globalTimeout;
  }

  /**
   * Check if build is complete
   */
  isComplete() {
    return this.stats.completedSubtasks >= this.stats.totalSubtasks;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              REPORTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Generate build report
   * @private
   */
  generateReport(storyId, result) {
    const duration = Date.now() - this.startTime;

    return {
      storyId,
      success: result.success,
      error: result.error,
      duration,
      durationFormatted: this.formatDuration(duration),
      stats: { ...this.stats },
      config: {
        maxIterations: this.config.maxIterations,
        globalTimeout: this.config.globalTimeout,
      },
      results: result.results,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Format duration for display
   * @private
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Log message
   * @private
   */
  log(message, level = 'info') {
    if (!this.config.verbose && level === 'debug') {
      return;
    }

    const prefix =
      {
        info: chalk.blue('ℹ'),
        warn: chalk.yellow('⚠'),
        error: chalk.red('✗'),
        success: chalk.green('✓'),
        debug: chalk.gray('…'),
      }[level] || '';

    console.log(`${prefix} ${message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CLI FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format status for CLI display
   */
  formatStatus() {
    const lines = [];

    lines.push('');
    lines.push(chalk.bold('Autonomous Build Loop Status'));
    lines.push('─'.repeat(50));

    lines.push(`Running:    ${this.isRunning ? chalk.green('Yes') : chalk.gray('No')}`);
    lines.push(`Paused:     ${this.isPaused ? chalk.yellow('Yes') : chalk.gray('No')}`);

    if (this.currentSubtask) {
      lines.push(`Current:    ${chalk.cyan(this.currentSubtask)}`);
    }

    if (this.startTime) {
      const elapsed = Date.now() - this.startTime;
      const timeout = this.config.globalTimeout;
      const remaining = timeout - elapsed;

      lines.push(`Elapsed:    ${this.formatDuration(elapsed)}`);
      lines.push(
        `Remaining:  ${remaining > 0 ? this.formatDuration(remaining) : chalk.red('TIMEOUT')}`,
      );
    }

    lines.push('');
    lines.push(chalk.bold('Statistics'));
    lines.push('─'.repeat(50));

    const progress =
      this.stats.totalSubtasks > 0
        ? Math.round((this.stats.completedSubtasks / this.stats.totalSubtasks) * 100)
        : 0;

    lines.push(
      `Progress:   ${progress}% (${this.stats.completedSubtasks}/${this.stats.totalSubtasks})`,
    );
    lines.push(`Completed:  ${chalk.green(this.stats.completedSubtasks)}`);
    lines.push(`Failed:     ${chalk.red(this.stats.failedSubtasks)}`);
    lines.push(
      `Iterations: ${this.stats.totalIterations} (${chalk.green(this.stats.successfulIterations)} ok, ${chalk.red(this.stats.failedIterations)} fail)`,
    );
    lines.push('');

    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.bold('Autonomous Build Loop')} - AIOX Coder Agent Loop (Story 8.1)

${chalk.cyan('Usage:')}
  autonomous-build-loop <command> <story-id> [options]

${chalk.cyan('Commands:')}
  run <story-id>        Run autonomous build
  resume <story-id>     Resume build from checkpoint
  status <story-id>     Show build status

${chalk.cyan('Options:')}
  --max-iterations <n>  Max iterations per subtask (default: 10)
  --timeout <ms>        Global timeout in ms (default: 1800000)
  --no-self-critique    Disable self-critique steps
  --no-verification     Disable verification
  --pause-on-failure    Pause on first failure
  --worktree            Execute in isolated worktree (Story 8.2)
  --no-worktree-cleanup Keep worktree after success
  --verbose, -v         Enable verbose logging
  --plan <path>         Path to implementation plan
  --help, -h            Show this help

${chalk.cyan('Events Emitted:')} (AC7)
  build_started, subtask_completed, build_failed, build_success

${chalk.cyan('Examples:')}
  autonomous-build-loop run STORY-42
  autonomous-build-loop run STORY-42 --max-iterations 5 --verbose
  autonomous-build-loop resume STORY-42
  autonomous-build-loop status STORY-42

${chalk.cyan('Acceptance Criteria:')}
  AC1: Located in .aiox-core/core/execution/
  AC2: Loop: load spec → create plan → execute → verify → retry/complete
  AC3: Maximum 10 iterations per subtask (configurable)
  AC4: Global timeout of 30 minutes (configurable)
  AC5: Command *build-autonomous {story-id} in @dev
  AC6: State persisted in plan/build-state.json
  AC7: Events: build_started, subtask_completed, build_failed, build_success
  AC8: Integration with Epic 5 Recovery System
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  const command = args[0];
  let storyId = null;
  let maxIterations = null;
  let timeout = null;
  let selfCritique = true;
  let verification = true;
  let pauseOnFailure = false;
  let verbose = false;
  let planPath = null;
  let useWorktree = false;
  let worktreeCleanup = true;

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--max-iterations') {
      maxIterations = parseInt(args[++i], 10);
    } else if (arg === '--timeout') {
      timeout = parseInt(args[++i], 10);
    } else if (arg === '--no-self-critique') {
      selfCritique = false;
    } else if (arg === '--no-verification') {
      verification = false;
    } else if (arg === '--pause-on-failure') {
      pauseOnFailure = true;
    } else if (arg === '--worktree') {
      useWorktree = true;
    } else if (arg === '--no-worktree-cleanup') {
      worktreeCleanup = false;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--plan') {
      planPath = args[++i];
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      }
    }
  }

  if (!storyId && command !== 'help') {
    console.error(chalk.red('Error: story-id is required'));
    process.exit(1);
  }

  const config = {
    maxIterations: maxIterations || DEFAULT_CONFIG.maxIterations,
    globalTimeout: timeout || DEFAULT_CONFIG.globalTimeout,
    selfCritiqueEnabled: selfCritique,
    verificationEnabled: verification,
    pauseOnFailure,
    verbose,
    useWorktree, // Story 8.2
    worktreeCleanup, // Story 8.2
  };

  const loop = new AutonomousBuildLoop(config);

  // Event listeners for verbose output
  if (verbose) {
    loop.on(BuildEvent.BUILD_STARTED, (e) =>
      console.log(chalk.blue(`\n▶ Build started: ${e.storyId}`)),
    );
    loop.on(BuildEvent.SUBTASK_STARTED, (e) =>
      console.log(chalk.cyan(`  → Starting subtask: ${e.subtaskId}`)),
    );
    loop.on(BuildEvent.ITERATION_STARTED, (e) =>
      console.log(chalk.dim(`    Iteration ${e.iteration}/${e.maxIterations}`)),
    );
    loop.on(BuildEvent.SUBTASK_COMPLETED, (e) =>
      console.log(chalk.green(`  ✓ Subtask completed: ${e.subtaskId}`)),
    );
    loop.on(BuildEvent.SUBTASK_FAILED, (e) =>
      console.log(chalk.red(`  ✗ Subtask failed: ${e.subtaskId} - ${e.error}`)),
    );
    loop.on(BuildEvent.BUILD_SUCCESS, (e) =>
      console.log(chalk.green(`\n✓ Build successful! Duration: ${loop.formatDuration(e.duration)}`)),
    );
    loop.on(BuildEvent.BUILD_FAILED, (e) => console.log(chalk.red(`\n✗ Build failed: ${e.error}`)));
  }

  try {
    switch (command) {
      case 'run': {
        const result = await loop.run(storyId, { planPath });
        console.log(loop.formatStatus());
        console.log(chalk.dim(JSON.stringify(result, null, 2)));
        process.exit(result.success ? 0 : 1);
        break;
      }

      case 'resume': {
        const result = await loop.resume(storyId, { planPath });
        console.log(loop.formatStatus());
        process.exit(result.success ? 0 : 1);
        break;
      }

      case 'status': {
        const stateManager = new BuildStateManager(storyId);
        console.log(stateManager.formatStatus());
        break;
      }

      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}`));
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  AutonomousBuildLoop,
  BuildEvent,
  SubtaskResult,
  DEFAULT_CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
