#!/usr/bin/env node

/**
 * Build Orchestrator - Story 8.5
 *
 * Single command to run complete autonomous builds.
 * Integrates: Worktree → Plan → Execute → Verify → Merge → Cleanup
 *
 * Features:
 * - AC1: Integrates all components (worktree, loop, merge, QA)
 * - AC2: Command `*build {story-id}` executes complete pipeline
 * - AC3: Pipeline: worktree → plan → execute → verify → merge → cleanup
 * - AC4: Flags: --dry-run, --no-merge, --keep-worktree, --verbose
 * - AC5: Notification on complete (future dashboard integration)
 * - AC6: Final report in plan/build-report.md
 * - AC7: Support for multiple simultaneous builds
 * - AC8: QA loop integration before merge
 *
 * @module build-orchestrator
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { EventEmitter } = require('events');

// Import components
const { AutonomousBuildLoop, BuildEvent } = require('./autonomous-build-loop');
const { BuildStateManager: _BuildStateManager } = require('./build-state-manager');

// Epic 10: Parallel Execution Components (optional - loaded dynamically when needed)
// These are available for future parallel execution features but not used in current pipeline

let WorktreeManager;
try {
  WorktreeManager = require('../../infrastructure/scripts/worktree-manager');
} catch {
  WorktreeManager = null;
}

let GotchasMemory;
try {
  GotchasMemory = require('../memory/gotchas-memory').GotchasMemory;
} catch {
  GotchasMemory = null;
}

// Optional chalk
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
    magenta: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  // Pipeline options
  useWorktree: true,
  runQA: true,
  autoMerge: true,
  cleanupOnSuccess: true,

  // Execution
  maxIterations: 10,
  globalTimeout: 45 * 60 * 1000, // 45 minutes
  subtaskTimeout: 10 * 60 * 1000, // 10 minutes per subtask

  // Epic 10: Parallel Execution
  parallelMode: false, // Enable wave-based parallel execution
  maxParallel: 4, // Max concurrent tasks per wave
  useSubagentDispatch: false, // Route tasks to specialized agents

  // Claude CLI
  claudeModel: null, // Use default model from CLI config
  claudeMaxTokens: 16000,

  // Paths
  planDir: 'plan',
  reportDir: 'plan',
  storiesDir: 'docs/stories',

  // Flags
  dryRun: false,
  verbose: false,
  keepWorktree: false,
  noMerge: false,
};

const OrchestratorEvent = {
  BUILD_QUEUED: 'build_queued',
  PHASE_STARTED: 'phase_started',
  PHASE_COMPLETED: 'phase_completed',
  PHASE_FAILED: 'phase_failed',
  SUBTASK_EXECUTING: 'subtask_executing',
  QA_STARTED: 'qa_started',
  QA_COMPLETED: 'qa_completed',
  MERGE_STARTED: 'merge_started',
  MERGE_COMPLETED: 'merge_completed',
  BUILD_COMPLETED: 'build_completed',
  BUILD_FAILED: 'build_failed',
  REPORT_GENERATED: 'report_generated',
};

const Phase = {
  INIT: 'init',
  WORKTREE: 'worktree',
  PLAN: 'plan',
  EXECUTE: 'execute',
  QA: 'qa',
  MERGE: 'merge',
  CLEANUP: 'cleanup',
  REPORT: 'report',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BUILD ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class BuildOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rootPath = config.rootPath || process.cwd();
    this.activeBuilds = new Map(); // storyId -> buildContext
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              MAIN BUILD PIPELINE (AC3)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Execute complete build pipeline (AC2, AC3)
   * Pipeline: worktree → plan → execute → verify → merge → cleanup
   */
  async build(storyId, options = {}) {
    const config = { ...this.config, ...options };
    const startTime = Date.now();

    // Check for existing build (AC7)
    if (this.activeBuilds.has(storyId)) {
      throw new Error(`Build already in progress for ${storyId}`);
    }

    // Initialize build context
    const ctx = {
      storyId,
      config,
      startTime,
      phases: {},
      worktree: null,
      plan: null,
      result: null,
      qaResult: null,
      mergeResult: null,
      errors: [],
    };

    this.activeBuilds.set(storyId, ctx);
    this.emit(OrchestratorEvent.BUILD_QUEUED, { storyId, config });

    try {
      // Phase 1: Initialize
      await this.runPhase(ctx, Phase.INIT, () => this.phaseInit(ctx));

      // Phase 2: Create worktree (optional)
      if (config.useWorktree && WorktreeManager) {
        await this.runPhase(ctx, Phase.WORKTREE, () => this.phaseWorktree(ctx));
      }

      // Phase 3: Load/Generate plan
      await this.runPhase(ctx, Phase.PLAN, () => this.phasePlan(ctx));

      // Phase 4: Execute (the actual build) - THIS IS THE KEY PART
      await this.runPhase(ctx, Phase.EXECUTE, () => this.phaseExecute(ctx));

      // Phase 5: QA verification (AC8)
      if (config.runQA) {
        await this.runPhase(ctx, Phase.QA, () => this.phaseQA(ctx));
      }

      // Phase 6: Merge to main (if enabled)
      if (config.autoMerge && !config.noMerge && ctx.worktree) {
        await this.runPhase(ctx, Phase.MERGE, () => this.phaseMerge(ctx));
      }

      // Phase 7: Cleanup
      if (config.cleanupOnSuccess && !config.keepWorktree) {
        await this.runPhase(ctx, Phase.CLEANUP, () => this.phaseCleanup(ctx));
      }

      // Phase 8: Generate report (AC6)
      await this.runPhase(ctx, Phase.REPORT, () => this.phaseReport(ctx));

      // Success!
      const duration = Date.now() - startTime;
      this.emit(OrchestratorEvent.BUILD_COMPLETED, {
        storyId,
        duration,
        success: true,
        report: ctx.reportPath,
      });

      return {
        success: true,
        storyId,
        duration,
        phases: ctx.phases,
        reportPath: ctx.reportPath,
      };
    } catch (error) {
      ctx.errors.push(error);

      // Generate failure report
      try {
        await this.phaseReport(ctx, true);
      } catch (reportError) {
        // Log failure report error but don't override the original error
        const errorMsg = reportError instanceof Error ? reportError.message : 'Unknown error';
        ctx.errors.push(new Error(`Failed to generate failure report: ${errorMsg}`));
      }

      this.emit(OrchestratorEvent.BUILD_FAILED, {
        storyId,
        error: error.message,
        phase: ctx.currentPhase,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        storyId,
        error: error.message,
        phase: ctx.currentPhase,
        phases: ctx.phases,
      };
    } finally {
      this.activeBuilds.delete(storyId);
    }
  }

  /**
   * Run a phase with event emission and error handling
   */
  async runPhase(ctx, phaseName, fn) {
    ctx.currentPhase = phaseName;
    const phaseStart = Date.now();

    this.emit(OrchestratorEvent.PHASE_STARTED, {
      storyId: ctx.storyId,
      phase: phaseName,
    });

    this.log(`[${phaseName.toUpperCase()}] Starting...`, 'info');

    try {
      const result = await fn();

      ctx.phases[phaseName] = {
        status: 'completed',
        duration: Date.now() - phaseStart,
        result,
      };

      this.emit(OrchestratorEvent.PHASE_COMPLETED, {
        storyId: ctx.storyId,
        phase: phaseName,
        duration: Date.now() - phaseStart,
      });

      this.log(`[${phaseName.toUpperCase()}] Completed in ${Date.now() - phaseStart}ms`, 'success');

      return result;
    } catch (error) {
      ctx.phases[phaseName] = {
        status: 'failed',
        duration: Date.now() - phaseStart,
        error: error.message,
      };

      this.emit(OrchestratorEvent.PHASE_FAILED, {
        storyId: ctx.storyId,
        phase: phaseName,
        error: error.message,
      });

      this.log(`[${phaseName.toUpperCase()}] Failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              PHASE IMPLEMENTATIONS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Phase 1: Initialize
   */
  async phaseInit(ctx) {
    // Verify story exists
    const storyPath = this.findStoryFile(ctx.storyId);
    if (!storyPath) {
      throw new Error(`Story not found: ${ctx.storyId}`);
    }
    ctx.storyPath = storyPath;

    // Load gotchas for context injection
    if (GotchasMemory) {
      ctx.gotchasMemory = new GotchasMemory(this.rootPath);
      ctx.relevantGotchas = ctx.gotchasMemory.getContextForTask(`Implementing ${ctx.storyId}`, []);
    }

    return { storyPath, gotchasCount: ctx.relevantGotchas?.length || 0 };
  }

  /**
   * Phase 2: Create worktree
   */
  async phaseWorktree(ctx) {
    if (ctx.config.dryRun) {
      this.log('DRY RUN: Would create worktree', 'info');
      return { dryRun: true };
    }

    const manager = new WorktreeManager(this.rootPath);

    // Check if worktree already exists
    const existing = await manager.get(ctx.storyId);
    if (existing) {
      ctx.worktree = existing;
      this.log(`Using existing worktree: ${existing.path}`, 'info');
      return existing;
    }

    // Create new worktree
    ctx.worktree = await manager.create(ctx.storyId);
    return ctx.worktree;
  }

  /**
   * Phase 3: Load/Generate plan
   */
  async phasePlan(ctx) {
    const planPath = path.join(
      ctx.worktree?.path || this.rootPath,
      ctx.config.planDir,
      'implementation.yaml',
    );

    // Check if plan exists
    if (fs.existsSync(planPath)) {
      const yaml = require('js-yaml');
      ctx.plan = yaml.load(fs.readFileSync(planPath, 'utf-8'));
      return { source: 'existing', path: planPath };
    }

    // Generate plan using Claude
    if (ctx.config.dryRun) {
      this.log('DRY RUN: Would generate plan', 'info');
      return { dryRun: true };
    }

    ctx.plan = await this.generatePlan(ctx);
    return { source: 'generated', subtasks: ctx.plan.phases?.length || 0 };
  }

  /**
   * Phase 4: Execute - THE MAIN BUILD LOOP
   */
  async phaseExecute(ctx) {
    if (ctx.config.dryRun) {
      this.log('DRY RUN: Would execute build loop', 'info');
      return { dryRun: true };
    }

    // Create executor that uses Claude CLI
    const executor = async (subtask, execCtx) => {
      return this.executeSubtaskWithClaude(subtask, execCtx, ctx);
    };

    // Initialize build loop
    const loop = new AutonomousBuildLoop({
      maxIterations: ctx.config.maxIterations,
      globalTimeout: ctx.config.globalTimeout,
      subtaskTimeout: ctx.config.subtaskTimeout,
      verbose: ctx.config.verbose,
      executor, // THE KEY: inject our Claude executor
    });

    // Forward events
    loop.on(BuildEvent.SUBTASK_STARTED, (e) => {
      this.emit(OrchestratorEvent.SUBTASK_EXECUTING, e);
    });

    // Run the loop
    ctx.result = await loop.run(ctx.storyId, {
      rootPath: ctx.worktree?.path || this.rootPath,
      plan: ctx.plan,
    });

    return ctx.result;
  }

  /**
   * Execute a single subtask using Claude CLI
   * THIS IS WHERE THE MAGIC HAPPENS
   */
  async executeSubtaskWithClaude(subtask, execCtx, buildCtx) {
    const workDir = buildCtx.worktree?.path || this.rootPath;

    // Build the prompt for Claude
    const prompt = this.buildSubtaskPrompt(subtask, execCtx, buildCtx);

    this.log(`Executing subtask: ${subtask.id}`, 'info');
    if (buildCtx.config.verbose) {
      this.log(`Prompt: ${prompt.substring(0, 200)}...`, 'debug');
    }

    try {
      // Execute using Claude CLI
      const result = await this.runClaudeCLI(prompt, workDir, buildCtx.config);

      // Check if implementation was successful
      const success = this.validateSubtaskResult(result, subtask);

      return {
        success,
        output: result.stdout,
        filesModified: this.extractModifiedFiles(result.stdout),
        error: success ? null : 'Implementation did not pass validation',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stderr || error.message,
      };
    }
  }

  /**
   * Build prompt for subtask execution
   */
  buildSubtaskPrompt(subtask, execCtx, buildCtx) {
    let prompt = `You are implementing Story ${buildCtx.storyId}.

## Current Subtask
ID: ${subtask.id}
Description: ${subtask.description}
${subtask.files ? `Files to modify: ${subtask.files.join(', ')}` : ''}
${subtask.acceptanceCriteria ? `Acceptance Criteria:\n${subtask.acceptanceCriteria.map((ac) => `- ${ac}`).join('\n')}` : ''}

## Instructions
1. Implement the subtask completely
2. Write clean, working code
3. Follow existing patterns in the codebase
4. Run tests if available
5. Fix any errors before completing

## Iteration Info
This is attempt ${execCtx.iteration} of ${execCtx.config.maxIterations}.
${execCtx.iteration > 1 ? 'Previous attempt failed. Review the error and try a different approach.' : ''}
`;

    // Add gotchas context
    if (buildCtx.relevantGotchas && buildCtx.relevantGotchas.length > 0) {
      prompt += '\n## Known Gotchas (IMPORTANT - Review Before Coding)\n';
      for (const gotcha of buildCtx.relevantGotchas) {
        prompt += `\n### ${gotcha.title}\n${gotcha.description}\n`;
        if (gotcha.workaround) {
          prompt += `Workaround: ${gotcha.workaround}\n`;
        }
      }
    }

    // Add verification command if specified
    if (subtask.verification) {
      prompt += `\n## Verification
After implementing, run: ${subtask.verification.command || subtask.verification}
The subtask is complete only when verification passes.
`;
    }

    return prompt;
  }

  /**
   * Run Claude CLI with prompt delivered via stdin.
   * 
   * @param {string} prompt - The prompt to execute
   * @param {string} workDir - Working directory for execution
   * @param {Object} config - Orchestrator configuration
   * @returns {Promise<Object>} - Execution result with stdout and exit code
   */
  async runClaudeCLI(prompt, workDir, config) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('runClaudeCLI requires a non-empty string prompt');
    }

    return new Promise((resolve, reject) => {
      const args = [
        '--print', // Non-interactive mode
        '--dangerously-skip-permissions', // Allow file writes
      ];

      if (config.claudeModel) {
        args.push('--model', config.claudeModel);
      }

      this.log(`Running Claude CLI in ${workDir}`, 'debug');

      const child = spawn('claude', args, {
        cwd: workDir,
        env: { ...process.env },
        timeout: config.subtaskTimeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      child.on('error', (error) => {
        reject(error);
      });

      let stdinError = null;
      // Prevent unhandled stream errors if the pipe breaks or process exits early
      child.stdin.on('error', (err) => {
        stdinError = err;
        this.log(`Claude stdin stream error: ${err.message}`, 'debug');
      });

      // Write prompt via stdin to avoid shell-related issues and command injection
      if (child.stdin.writable) {
        child.stdin.write(prompt);
        child.stdin.end();
      } else {
        child.kill();
        reject(new Error('Claude stdin was not writable immediately after spawn'));
        return;
      }

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (config.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (config.verbose) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code, signal) => {
        if (stdinError) {
          reject(new Error(`Claude CLI stdin write failed (prompt not delivered): ${stdinError.message}`));
        } else if (code === 0) {
          resolve({ stdout, stderr, code });
        } else if (signal) {
          reject(new Error(`Claude CLI killed by signal ${signal} (timeout or external kill): ${stderr}`));
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        }
      });
    });
  }

  /**
   * Validate subtask result
   */
  validateSubtaskResult(result, subtask) {
    // Check for common failure patterns
    const output = result.stdout.toLowerCase();

    if (output.includes('error:') && output.includes('failed')) {
      return false;
    }

    if (output.includes('test failed') || output.includes('tests failed')) {
      return false;
    }

    // If verification command specified, check it was run
    if (subtask.verification) {
      const verifyCmd = subtask.verification.command || subtask.verification;
      if (!output.includes('verification passed') && !output.includes('✓')) {
        // Try running verification ourselves
        try {
          execSync(verifyCmd, {
            cwd: this.rootPath,
            timeout: 30000,
            stdio: 'pipe',
          });
          return true;
        } catch {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Extract modified files from Claude output
   */
  extractModifiedFiles(output) {
    const files = [];
    const patterns = [
      /(?:wrote|created|modified|updated|edited)\s+[`"]?([^\s`"]+\.[a-z]+)[`"]?/gi,
      /file:\s*([^\s]+\.[a-z]+)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        if (!files.includes(match[1])) {
          files.push(match[1]);
        }
      }
    }

    return files;
  }

  /**
   * Phase 5: QA verification (AC8)
   */
  async phaseQA(ctx) {
    if (ctx.config.dryRun) {
      this.log('DRY RUN: Would run QA', 'info');
      return { dryRun: true };
    }

    this.emit(OrchestratorEvent.QA_STARTED, { storyId: ctx.storyId });

    const workDir = ctx.worktree?.path || this.rootPath;

    try {
      // Run linting
      this.log('Running lint...', 'info');
      try {
        execSync('npm run lint', { cwd: workDir, stdio: 'pipe', timeout: 60000 });
      } catch (_e) {
        this.log('Lint warnings (non-blocking)', 'warn');
      }

      // Run tests
      this.log('Running tests...', 'info');
      try {
        execSync('npm test -- --passWithNoTests', { cwd: workDir, stdio: 'pipe', timeout: 120000 });
      } catch (e) {
        throw new Error(`Tests failed: ${e.message}`);
      }

      // Run typecheck if available
      this.log('Running typecheck...', 'info');
      try {
        execSync('npm run typecheck', { cwd: workDir, stdio: 'pipe', timeout: 60000 });
      } catch {
        // TypeCheck not available or failed (non-blocking)
      }

      ctx.qaResult = { success: true };

      this.emit(OrchestratorEvent.QA_COMPLETED, {
        storyId: ctx.storyId,
        success: true,
      });

      return ctx.qaResult;
    } catch (error) {
      ctx.qaResult = { success: false, error: error.message };

      this.emit(OrchestratorEvent.QA_COMPLETED, {
        storyId: ctx.storyId,
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Phase 6: Merge to main
   */
  async phaseMerge(ctx) {
    if (ctx.config.dryRun || ctx.config.noMerge) {
      this.log('DRY RUN/NO-MERGE: Would merge to main', 'info');
      return { dryRun: true };
    }

    if (!ctx.worktree || !WorktreeManager) {
      return { skipped: true, reason: 'No worktree to merge' };
    }

    this.emit(OrchestratorEvent.MERGE_STARTED, { storyId: ctx.storyId });

    const manager = new WorktreeManager(this.rootPath);

    // Merge worktree branch to main
    ctx.mergeResult = await manager.mergeToBase(ctx.storyId, {
      cleanup: false, // We'll do cleanup in next phase
      message: `feat: implement ${ctx.storyId} [autonomous build]`,
    });

    this.emit(OrchestratorEvent.MERGE_COMPLETED, {
      storyId: ctx.storyId,
      success: ctx.mergeResult.success,
    });

    if (!ctx.mergeResult.success) {
      throw new Error(`Merge failed: ${ctx.mergeResult.error}`);
    }

    return ctx.mergeResult;
  }

  /**
   * Phase 7: Cleanup
   */
  async phaseCleanup(ctx) {
    if (ctx.config.dryRun || ctx.config.keepWorktree) {
      this.log('DRY RUN/KEEP: Would cleanup worktree', 'info');
      return { dryRun: true };
    }

    if (ctx.worktree && WorktreeManager) {
      const manager = new WorktreeManager(this.rootPath);
      try {
        await manager.remove(ctx.storyId, { force: true });
        return { cleaned: true };
      } catch (e) {
        this.log(`Cleanup warning: ${e.message}`, 'warn');
        return { cleaned: false, error: e.message };
      }
    }

    return { skipped: true };
  }

  /**
   * Phase 8: Generate report (AC6)
   */
  async phaseReport(ctx, isFailed = false) {
    const duration = Date.now() - ctx.startTime;
    const reportDir = path.join(this.rootPath, ctx.config.reportDir);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `build-report-${ctx.storyId}.md`);

    const report = this.generateReport(ctx, duration, isFailed);

    fs.writeFileSync(reportPath, report, 'utf-8');
    ctx.reportPath = reportPath;

    this.emit(OrchestratorEvent.REPORT_GENERATED, {
      storyId: ctx.storyId,
      path: reportPath,
    });

    return { path: reportPath };
  }

  /**
   * Generate markdown report (AC6)
   */
  generateReport(ctx, duration, isFailed) {
    const status = isFailed ? '❌ FAILED' : '✅ SUCCESS';
    const now = new Date().toISOString();

    let report = `# Build Report: ${ctx.storyId}

> **Status:** ${status}
> **Duration:** ${this.formatDuration(duration)}
> **Generated:** ${now}

---

## Summary

| Metric | Value |
|--------|-------|
| Story | ${ctx.storyId} |
| Status | ${isFailed ? 'Failed' : 'Completed'} |
| Duration | ${this.formatDuration(duration)} |
| Worktree | ${ctx.worktree ? ctx.worktree.path : 'N/A'} |
| QA Passed | ${ctx.qaResult?.success ? 'Yes' : 'No'} |
| Merged | ${ctx.mergeResult?.success ? 'Yes' : 'No'} |

---

## Phases

| Phase | Status | Duration |
|-------|--------|----------|
`;

    for (const [phase, data] of Object.entries(ctx.phases)) {
      const statusIcon = data.status === 'completed' ? '✅' : '❌';
      report += `| ${phase} | ${statusIcon} ${data.status} | ${data.duration}ms |\n`;
    }

    if (ctx.errors.length > 0) {
      report += '\n---\n\n## Errors\n\n';
      for (const error of ctx.errors) {
        report += `- ${error.message}\n`;
      }
    }

    if (ctx.result) {
      report += '\n---\n\n## Build Loop Results\n\n';
      report += `- Completed Subtasks: ${ctx.result.stats?.completedSubtasks || 0}\n`;
      report += `- Failed Subtasks: ${ctx.result.stats?.failedSubtasks || 0}\n`;
      report += `- Total Iterations: ${ctx.result.stats?.totalIterations || 0}\n`;
    }

    report += '\n---\n\n*Generated by AIOS Build Orchestrator v1.0.0*\n';

    return report;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              HELPERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Find story file
   */
  findStoryFile(storyId) {
    const patterns = [
      path.join(this.rootPath, 'docs', 'stories', `${storyId}.md`),
      path.join(this.rootPath, 'docs', 'stories', storyId, 'README.md'),
      path.join(this.rootPath, 'docs', 'stories', storyId, `${storyId}.md`),
    ];

    // Also search subdirectories
    const storiesDir = path.join(this.rootPath, 'docs', 'stories');
    if (fs.existsSync(storiesDir)) {
      const dirs = fs.readdirSync(storiesDir, { withFileTypes: true });
      for (const dir of dirs) {
        if (dir.isDirectory()) {
          patterns.push(path.join(storiesDir, dir.name, `${storyId}.md`));
        }
      }
    }

    for (const p of patterns) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  /**
   * Generate implementation plan using Claude
   */
  async generatePlan(ctx) {
    // For now, return a basic plan structure
    // In a full implementation, this would use Claude to analyze the story
    // and generate a detailed implementation plan

    const storyContent = fs.readFileSync(ctx.storyPath, 'utf-8');

    // Extract acceptance criteria
    const acMatches = storyContent.match(/- \[ \] AC\d+:.*$/gm) || [];

    const subtasks = acMatches.map((ac, i) => ({
      id: `1.${i + 1}`, // Format: phase.subtask (e.g., "1.1", "1.2")
      description: ac.replace(/- \[ \] AC\d+:\s*/, ''),
      files: [],
      verification: null,
    }));

    return {
      storyId: ctx.storyId,
      generatedAt: new Date().toISOString(),
      phases: [
        {
          id: 'implementation',
          name: 'Implementation',
          subtasks,
        },
      ],
    };
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Log message
   */
  log(message, level = 'info') {
    const prefix =
      {
        info: chalk.blue('ℹ'),
        warn: chalk.yellow('⚠'),
        error: chalk.red('✗'),
        success: chalk.green('✓'),
        debug: chalk.gray('…'),
      }[level] || '';

    if (level === 'debug' && !this.config.verbose) {
      return;
    }

    console.log(`${prefix} ${message}`);
  }

  /**
   * Get active builds (AC7)
   */
  getActiveBuilds() {
    return Array.from(this.activeBuilds.entries()).map(([storyId, ctx]) => ({
      storyId,
      phase: ctx.currentPhase,
      duration: Date.now() - ctx.startTime,
    }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.bold('Build Orchestrator')} - AIOS Autonomous Build (Story 8.5)

${chalk.cyan('Usage:')}
  build-orchestrator <story-id> [options]
  *build <story-id> [options]

${chalk.cyan('Options:')}
  --dry-run             Show what would happen without executing
  --no-merge            Skip merge phase
  --keep-worktree       Don't cleanup worktree after build
  --no-worktree         Execute in main directory (no isolation)
  --no-qa               Skip QA phase
  --verbose, -v         Enable verbose output
  --timeout <ms>        Global timeout (default: 2700000 = 45min)
  --help, -h            Show this help

${chalk.cyan('Pipeline:')} (AC3)
  worktree → plan → execute → verify → merge → cleanup

${chalk.cyan('Examples:')}
  build-orchestrator story-8.5
  build-orchestrator story-8.5 --dry-run
  build-orchestrator story-8.5 --no-merge --verbose
  build-orchestrator story-8.5 --keep-worktree

${chalk.cyan('Acceptance Criteria:')}
  AC1: Integrates all components
  AC2: Command *build {story-id} executes complete pipeline
  AC3: Pipeline: worktree → plan → execute → verify → merge → cleanup
  AC4: Flags: --dry-run, --no-merge, --keep-worktree, --verbose
  AC5: Notification on complete
  AC6: Final report in plan/build-report.md
  AC7: Support multiple simultaneous builds
  AC8: QA loop integration before merge
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  let storyId = null;
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-merge') {
      options.noMerge = true;
    } else if (arg === '--keep-worktree') {
      options.keepWorktree = true;
    } else if (arg === '--no-worktree') {
      options.useWorktree = false;
    } else if (arg === '--no-qa') {
      options.runQA = false;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--timeout') {
      options.globalTimeout = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      storyId = arg;
    }
  }

  if (!storyId) {
    console.error(chalk.red('Error: story-id is required'));
    process.exit(1);
  }

  console.log(chalk.bold(`\n🚀 Starting autonomous build for ${storyId}\n`));

  const orchestrator = new BuildOrchestrator(options);

  // Progress logging
  orchestrator.on(OrchestratorEvent.PHASE_STARTED, (e) => {
    console.log(chalk.cyan(`\n▶ Phase: ${e.phase}`));
  });

  orchestrator.on(OrchestratorEvent.SUBTASK_EXECUTING, (e) => {
    console.log(chalk.dim(`  → Executing: ${e.subtaskId}`));
  });

  try {
    const result = await orchestrator.build(storyId, options);

    if (result.success) {
      console.log(chalk.green('\n✅ Build completed successfully!'));
      console.log(chalk.gray(`   Report: ${result.reportPath}`));
    } else {
      console.log(chalk.red(`\n❌ Build failed in phase: ${result.phase}`));
      console.log(chalk.red(`   Error: ${result.error}`));
    }

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  BuildOrchestrator,
  OrchestratorEvent,
  Phase,
  DEFAULT_CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
