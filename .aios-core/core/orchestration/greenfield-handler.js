/**
 * Greenfield Handler - Story 12.13
 *
 * Epic 12: Bob Full Integration — Completando o PRD v2.0
 *
 * Orchestrates the complete Greenfield Workflow (greenfield-fullstack.yaml)
 * for users starting a brand new project from scratch.
 *
 * Features:
 * - AC1: Detects Greenfield state (no package.json, .git, docs/)
 * - AC2-5: Orchestrates 4 phases (Bootstrap → Discovery → Sharding → Dev Cycle)
 * - AC6-10: Integrates with all Epic 11 modules
 * - AC11-14: Surface decisions between phases with PAUSE/resume
 * - AC15-17: Error handling (Retry/Skip/Abort) and idempotency
 *
 * @module core/orchestration/greenfield-handler
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GREENFIELD CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Default indicators that signal a project is NOT greenfield
 * @constant {string[]}
 */
const DEFAULT_GREENFIELD_INDICATORS = [
  'package.json',
  '.git',
  'docs/',
  'src/',
  '.aios-core/',
];

/**
 * Greenfield workflow phases
 * @enum {string}
 */
const GreenfieldPhase = {
  DETECTION: 'detection',
  BOOTSTRAP: 'phase_0_bootstrap',
  DISCOVERY: 'phase_1_discovery',
  SHARDING: 'phase_2_sharding',
  DEV_CYCLE: 'phase_3_dev_cycle',
  COMPLETE: 'complete',
};

/**
 * Phase 1 agent sequence (Discovery & Planning)
 * @constant {Array<{agent: string, task: string, creates: string}>}
 */
const PHASE_1_SEQUENCE = [
  { agent: '@analyst', task: 'project-brief', creates: 'docs/project-brief.md' },
  { agent: '@pm', task: 'create-prd', creates: 'docs/prd.md' },
  { agent: '@ux-design-expert', task: 'front-end-spec', creates: 'docs/front-end-spec.md' },
  { agent: '@architect', task: 'architecture', creates: 'docs/fullstack-architecture.md' },
  { agent: '@po', task: 'validate-artifacts', creates: null },
];

/**
 * Phase failure action
 * @enum {string}
 */
const PhaseFailureAction = {
  RETRY: 'retry',
  SKIP: 'skip',
  ABORT: 'abort',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GREENFIELD HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GreenfieldHandler - Orchestrates the complete Greenfield Workflow
 */
class GreenfieldHandler extends EventEmitter {
  /**
   * @param {string} projectRoot - Project root path
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {Object} [options.workflowExecutor] - WorkflowExecutor instance
   * @param {Object} [options.surfaceChecker] - SurfaceChecker instance
   * @param {Object} [options.sessionState] - SessionState instance
   * @param {string[]} [options.indicators] - Custom greenfield indicators
   */
  constructor(projectRoot, options = {}) {
    super();

    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ...options,
    };

    // Configurable indicators (AC1)
    this.indicators = options.indicators || DEFAULT_GREENFIELD_INDICATORS;

    // Lazy-loaded dependencies
    this._workflowExecutor = options.workflowExecutor || null;
    this._surfaceChecker = options.surfaceChecker || null;
    this._sessionState = options.sessionState || null;

    // Workflow path
    this.workflowPath = path.join(
      projectRoot,
      '.aios-core/development/workflows/greenfield-fullstack.yaml',
    );

    // Phase progress tracking
    this.phaseProgress = {};

    this._log('GreenfieldHandler initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LAZY DEPENDENCY LOADING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /** @private */
  _getWorkflowExecutor() {
    if (!this._workflowExecutor) {
      try {
        const { WorkflowExecutor } = require('./workflow-executor');
        this._workflowExecutor = new WorkflowExecutor(this.projectRoot, {
          debug: this.options.debug,
        });
      } catch (error) {
        this._log(`WorkflowExecutor not available: ${error.message}`, 'warn');
      }
    }
    return this._workflowExecutor;
  }

  /** @private */
  _getSurfaceChecker() {
    if (!this._surfaceChecker) {
      try {
        const { SurfaceChecker } = require('./surface-checker');
        this._surfaceChecker = new SurfaceChecker();
      } catch (error) {
        this._log(`SurfaceChecker not available: ${error.message}`, 'warn');
      }
    }
    return this._surfaceChecker;
  }

  /** @private */
  _getSessionState() {
    if (!this._sessionState) {
      try {
        const { SessionState } = require('./session-state');
        this._sessionState = new SessionState(this.projectRoot, {
          debug: this.options.debug,
        });
      } catch (error) {
        this._log(`SessionState not available: ${error.message}`, 'warn');
      }
    }
    return this._sessionState;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              GREENFIELD DETECTION (AC1, AC16)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Detects if a project path is a greenfield project (AC1)
   *
   * Greenfield = NONE of the configured indicators exist.
   *
   * @param {string} [projectPath] - Path to check (defaults to projectRoot)
   * @returns {boolean} True if greenfield
   */
  isGreenfield(projectPath) {
    const targetPath = projectPath || this.projectRoot;

    return this.indicators.every((indicator) => {
      const fullPath = path.join(targetPath, indicator);
      return !fs.existsSync(fullPath);
    });
  }

  /**
   * Checks if Phase 0 (Bootstrap) can be skipped (AC16)
   *
   * Phase 0 is unnecessary if project already has package.json + .git
   *
   * @param {string} [projectPath] - Path to check (defaults to projectRoot)
   * @returns {boolean} True if Phase 0 should be skipped
   */
  shouldSkipBootstrap(projectPath) {
    const targetPath = projectPath || this.projectRoot;

    const hasPackageJson = fs.existsSync(path.join(targetPath, 'package.json'));
    const hasGit = fs.existsSync(path.join(targetPath, '.git'));

    return hasPackageJson && hasGit;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              MAIN HANDLER (AC2-5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Main entry point - handles greenfield workflow orchestration
   *
   * @param {Object} context - Execution context
   * @param {string} [context.userGoal] - User's project description
   * @param {number} [context.resumeFromPhase] - Phase to resume from (0-3)
   * @returns {Promise<Object>} Handler result
   */
  async handle(context = {}) {
    this._log('Greenfield handler invoked');

    // Check for resume (AC14)
    const resumePhase = context.resumeFromPhase;
    if (typeof resumePhase === 'number' && resumePhase >= 0) {
      return this._executeFromPhase(resumePhase, context);
    }

    // Determine starting phase
    const skipBootstrap = this.shouldSkipBootstrap();
    const startPhase = skipBootstrap ? 1 : 0;

    if (skipBootstrap) {
      this._log('Phase 0 skipped: package.json + .git already exist (AC16)');
    }

    // Start orchestration from the appropriate phase
    return this._executeFromPhase(startPhase, context);
  }

  /**
   * Executes workflow starting from a specific phase
   *
   * @param {number} phaseNumber - Phase to start from (0-3)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _executeFromPhase(phaseNumber, context) {
    this._log(`Starting from Phase ${phaseNumber}`);

    // Record starting phase in session state (AC9)
    await this._recordPhase(this._getPhaseEnum(phaseNumber), context);

    switch (phaseNumber) {
      case 0:
        return this._executePhase0(context);
      case 1:
        return this._executePhase1(context);
      case 2:
        return this._executePhase2(context);
      case 3:
        return this._executePhase3(context);
      default:
        return {
          action: 'greenfield_error',
          error: `Invalid phase number: ${phaseNumber}`,
        };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PHASE 0: BOOTSTRAP (AC2)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Phase 0: Spawn @devops for environment bootstrap (AC2)
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Phase result with surface prompt for Phase 1
   * @private
   */
  async _executePhase0(context) {
    this._log('Phase 0: Environment Bootstrap');
    this.phaseProgress[GreenfieldPhase.BOOTSTRAP] = { status: 'in_progress', startTime: Date.now() };

    this.emit('phaseStart', { phase: GreenfieldPhase.BOOTSTRAP, context });

    // AC2: Spawn @devops for environment-bootstrap
    const spawnResult = await this._spawnAgent('@devops', 'environment-bootstrap', {
      instructions: 'Execute *environment-bootstrap to set up the development environment',
      creates: ['.aios/config.yaml', '.aios/environment-report.json', '.gitignore', 'README.md', 'package.json'],
    });

    this.phaseProgress[GreenfieldPhase.BOOTSTRAP] = {
      status: spawnResult.success ? 'complete' : 'failed',
      endTime: Date.now(),
      result: spawnResult,
    };

    this.emit('phaseComplete', { phase: GreenfieldPhase.BOOTSTRAP, result: spawnResult, context });

    if (!spawnResult.success) {
      return this._handlePhaseFailure(GreenfieldPhase.BOOTSTRAP, spawnResult.error, context);
    }

    // AC11: Surface between Phase 0 → Phase 1
    // Ask user to describe what they want to build
    return this._surfaceBetweenPhases(0, 1, {
      message: 'Ambiente configurado. Descreva o que quer construir.',
      promptType: 'text_input',
      context: { ...context, phase0Result: spawnResult },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PHASE 1: DISCOVERY & PLANNING (AC3)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Phase 1: Spawn agents sequentially for Discovery & Planning (AC3)
   *
   * Sequence: @analyst → @pm → @ux-design-expert → @architect → @po
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Phase result with surface prompt for Phase 2
   * @private
   */
  async _executePhase1(context) {
    this._log('Phase 1: Discovery & Planning');
    this.phaseProgress[GreenfieldPhase.DISCOVERY] = { status: 'in_progress', startTime: Date.now() };

    this.emit('phaseStart', { phase: GreenfieldPhase.DISCOVERY, context });

    const stepResults = [];

    // Execute each agent in sequence
    for (const step of PHASE_1_SEQUENCE) {
      this._log(`Phase 1 step: ${step.agent} → ${step.task}`);

      const spawnResult = await this._spawnAgent(step.agent, step.task, {
        instructions: `Execute ${step.task} for greenfield project`,
        creates: step.creates ? [step.creates] : [],
        previousResults: stepResults,
      });

      stepResults.push({
        agent: step.agent,
        task: step.task,
        creates: step.creates,
        success: spawnResult.success,
        result: spawnResult,
      });

      // If a step fails, offer Retry/Skip/Abort (AC15)
      if (!spawnResult.success) {
        return this._handlePhaseFailure(
          `${GreenfieldPhase.DISCOVERY}:${step.agent}`,
          spawnResult.error || `Agent ${step.agent} failed on ${step.task}`,
          { ...context, failedStep: step, completedSteps: stepResults },
        );
      }

      // Check idempotency — if artifact already exists, it was updated not duplicated (AC17)
      if (step.creates) {
        this._checkAndLogIdempotency(step.creates);
      }
    }

    this.phaseProgress[GreenfieldPhase.DISCOVERY] = {
      status: 'complete',
      endTime: Date.now(),
      stepResults,
    };

    this.emit('phaseComplete', { phase: GreenfieldPhase.DISCOVERY, result: stepResults, context });

    // Build artifacts summary for surface prompt
    const artifactsSummary = this._buildArtifactsSummary(stepResults);

    // AC12: Surface between Phase 1 → Phase 2
    // Show artifacts summary and ask GO/PAUSE
    return this._surfaceBetweenPhases(1, 2, {
      message: `Artefatos de planejamento criados:\n${artifactsSummary}\n\nDeseja continuar com o sharding dos documentos?`,
      promptType: 'go_pause',
      context: { ...context, phase1Results: stepResults },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PHASE 2: DOCUMENT SHARDING (AC4)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Phase 2: Spawn @po for document sharding (AC4)
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Phase result with surface prompt for Phase 3
   * @private
   */
  async _executePhase2(context) {
    this._log('Phase 2: Document Sharding');
    this.phaseProgress[GreenfieldPhase.SHARDING] = { status: 'in_progress', startTime: Date.now() };

    this.emit('phaseStart', { phase: GreenfieldPhase.SHARDING, context });

    // AC4: Spawn @po for document sharding
    const spawnResult = await this._spawnAgent('@po', 'shard-documents', {
      instructions: 'Shard docs/prd.md and docs/fullstack-architecture.md into development-ready chunks',
      creates: ['docs/prd/', 'docs/architecture/'],
      requires: ['docs/prd.md', 'docs/front-end-spec.md', 'docs/fullstack-architecture.md'],
    });

    this.phaseProgress[GreenfieldPhase.SHARDING] = {
      status: spawnResult.success ? 'complete' : 'failed',
      endTime: Date.now(),
      result: spawnResult,
    };

    this.emit('phaseComplete', { phase: GreenfieldPhase.SHARDING, result: spawnResult, context });

    if (!spawnResult.success) {
      return this._handlePhaseFailure(GreenfieldPhase.SHARDING, spawnResult.error, context);
    }

    // AC13: Surface between Phase 2 → Phase 3
    // Show created stories and ask GO
    return this._surfaceBetweenPhases(2, 3, {
      message: 'Documentos fragmentados para desenvolvimento. Stories criadas. Deseja iniciar o ciclo de desenvolvimento?',
      promptType: 'go_pause',
      context: { ...context, phase2Result: spawnResult },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PHASE 3: DEVELOPMENT CYCLE (AC5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Phase 3: Transition to Development Cycle (AC5)
   *
   * Reuses WorkflowExecutor from Story 11.3
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Phase result
   * @private
   */
  async _executePhase3(context) {
    this._log('Phase 3: Development Cycle');
    this.phaseProgress[GreenfieldPhase.DEV_CYCLE] = { status: 'in_progress', startTime: Date.now() };

    this.emit('phaseStart', { phase: GreenfieldPhase.DEV_CYCLE, context });

    // AC5: Transition to Development Cycle via WorkflowExecutor
    const workflowExecutor = this._getWorkflowExecutor();

    this.phaseProgress[GreenfieldPhase.DEV_CYCLE] = {
      status: 'complete',
      endTime: Date.now(),
    };

    this.emit('phaseComplete', { phase: GreenfieldPhase.DEV_CYCLE, context });

    return {
      action: 'greenfield_dev_cycle',
      phase: GreenfieldPhase.DEV_CYCLE,
      data: {
        message: 'Greenfield workflow completo! Entrando no ciclo de desenvolvimento.',
        nextStep: 'development_cycle',
        workflowExecutorAvailable: !!workflowExecutor,
        handoff: 'Use @sm → *create-story para iniciar o ciclo de stories',
        context,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AGENT SPAWNING (AC6, AC7)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Spawns an agent via TerminalSpawner (AC7) with ExecutorAssignment (AC6)
   *
   * @param {string} agent - Agent ID (e.g., '@devops')
   * @param {string} task - Task to execute
   * @param {Object} spawnContext - Spawn context
   * @returns {Promise<Object>} Spawn result
   * @private
   */
  async _spawnAgent(agent, task, spawnContext = {}) {
    this._log(`Spawning ${agent} for ${task}`);

    this.emit('agentSpawn', { agent, task, context: spawnContext });

    try {
      // Try TerminalSpawner first (AC7)
      const TerminalSpawner = require('./terminal-spawner');

      if (TerminalSpawner.isSpawnerAvailable()) {
        const agentId = agent.replace('@', '');
        const result = await TerminalSpawner.spawnAgent(agentId, task, {
          context: {
            instructions: spawnContext.instructions || `Execute ${task}`,
            creates: spawnContext.creates || [],
            requires: spawnContext.requires || [],
            metadata: spawnContext.previousResults || {},
          },
          timeout: 7200000, // 2 hours
          debug: this.options.debug,
        });

        if (result.pid) {
          this.emit('terminalSpawn', { agent, pid: result.pid, task });
        }

        return {
          success: result.success !== false,
          pid: result.pid,
          output: result.output,
          outputFile: result.outputFile,
        };
      }

      // Fallback: Return instructions for manual execution
      this._log(`TerminalSpawner not available, returning manual instructions for ${agent}`);
      return {
        success: true,
        manual: true,
        instructions: `Spawn ${agent} manually and execute: *${task}`,
      };
    } catch (error) {
      this._log(`Failed to spawn ${agent}: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SURFACE DECISIONS (AC8, AC11-14)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Creates a surface decision point between phases (AC8, AC11-14)
   *
   * @param {number} fromPhase - Phase just completed
   * @param {number} toPhase - Next phase to execute
   * @param {Object} surfaceConfig - Surface configuration
   * @param {string} surfaceConfig.message - Message to display
   * @param {string} surfaceConfig.promptType - 'text_input' | 'go_pause'
   * @param {Object} surfaceConfig.context - Context to carry forward
   * @returns {Object} Surface result
   * @private
   */
  _surfaceBetweenPhases(fromPhase, toPhase, surfaceConfig) {
    const surfaceChecker = this._getSurfaceChecker();

    // Build options based on prompt type
    const options = surfaceConfig.promptType === 'go_pause'
      ? ['GO', 'PAUSE']
      : ['continue'];

    const surfaceResult = surfaceChecker
      ? surfaceChecker.shouldSurface({
        valid_options_count: options.length,
        options_with_tradeoffs: surfaceConfig.message,
      })
      : { should_surface: true };

    return {
      action: 'greenfield_surface',
      phase: this._getPhaseEnum(fromPhase),
      nextPhase: toPhase,
      data: {
        message: surfaceConfig.message,
        promptType: surfaceConfig.promptType,
        options,
        surfaceResult,
        resumeFromPhase: toPhase,
        context: surfaceConfig.context,
      },
    };
  }

  /**
   * Handles user response to a surface decision
   *
   * @param {string} decision - User decision ('GO', 'PAUSE', or text input)
   * @param {number} nextPhase - Phase to execute if GO
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handleSurfaceDecision(decision, nextPhase, context = {}) {
    this._log(`Surface decision: ${decision}, next phase: ${nextPhase}`);

    const normalizedDecision = decision.toUpperCase().trim();

    // AC14: PAUSE saves current state for resume
    if (normalizedDecision === 'PAUSE') {
      await this._savePhaseForResume(nextPhase, context);
      return {
        action: 'greenfield_paused',
        data: {
          message: `Workflow pausado. Resume da Phase ${nextPhase} quando quiser continuar.`,
          savedPhase: nextPhase,
          context,
        },
      };
    }

    // GO or text input: continue to next phase
    if (normalizedDecision === 'GO' || normalizedDecision === 'CONTINUE') {
      return this._executeFromPhase(nextPhase, context);
    }

    // Text input (likely project description from Phase 0 → 1 surface)
    return this._executeFromPhase(nextPhase, {
      ...context,
      userGoal: decision,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              ERROR HANDLING (AC15)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Handles phase failure with Retry/Skip/Abort options (AC15)
   *
   * @param {string} phase - Failed phase identifier
   * @param {string} errorMessage - Error description
   * @param {Object} context - Execution context
   * @returns {Object} Failure result with options
   * @private
   */
  _handlePhaseFailure(phase, errorMessage, context) {
    this._log(`Phase failed: ${phase} - ${errorMessage}`, 'error');

    this.emit('phaseError', { phase, error: errorMessage, context });

    return {
      action: 'greenfield_phase_failure',
      phase,
      error: errorMessage,
      options: [
        { action: PhaseFailureAction.RETRY, label: '1. Tentar novamente' },
        { action: PhaseFailureAction.SKIP, label: '2. Pular esta fase' },
        { action: PhaseFailureAction.ABORT, label: '3. Cancelar workflow' },
      ],
      context,
    };
  }

  /**
   * Handles phase failure action from user (AC15)
   *
   * @param {string} phase - Failed phase
   * @param {string} action - User chosen action (retry/skip/abort)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handlePhaseFailureAction(phase, action, context = {}) {
    this._log(`Handling phase failure: action=${action}, phase=${phase}`);

    switch (action) {
      case PhaseFailureAction.RETRY: {
        const phaseNumber = this._getPhaseNumber(phase);
        if (phaseNumber >= 0) {
          return this._executeFromPhase(phaseNumber, context);
        }
        // Retry at the step level within Phase 1
        if (context.failedStep) {
          return this._executePhase1(context);
        }
        return { action: 'retry_failed', error: `Cannot determine phase number for: ${phase}` };
      }

      case PhaseFailureAction.SKIP: {
        this._log(`Skipping phase: ${phase}`);
        this.phaseProgress[phase] = { status: 'skipped' };
        const nextPhase = this._getNextPhaseNumber(phase);
        if (nextPhase <= 3) {
          return this._executeFromPhase(nextPhase, context);
        }
        return { action: 'greenfield_complete', data: { message: 'Workflow completo (com fases puladas).' } };
      }

      case PhaseFailureAction.ABORT:
        this._log(`Aborting workflow at phase: ${phase}`);
        return {
          action: 'greenfield_aborted',
          data: {
            message: 'Greenfield workflow cancelado.',
            lastPhase: phase,
            progress: this.phaseProgress,
          },
        };

      default:
        return { action: 'invalid_action', error: `Unknown action: ${action}` };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              IDEMPOTENCY (AC17)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Checks if an artifact exists and logs idempotency info (AC17)
   *
   * @param {string} artifactPath - Relative path to artifact
   * @returns {Object} Idempotency info
   */
  checkIdempotency(artifactPath) {
    const fullPath = path.join(this.projectRoot, artifactPath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      this._log(`Updating existing ${artifactPath} (idempotent re-run)`);
      return { exists: true, path: fullPath, action: 'update' };
    }

    return { exists: false, path: fullPath, action: 'create' };
  }

  /**
   * Logs idempotency check for an artifact
   * @param {string} artifactPath - Relative path
   * @private
   */
  _checkAndLogIdempotency(artifactPath) {
    const result = this.checkIdempotency(artifactPath);
    if (result.exists) {
      this._log(`Idempotent: ${artifactPath} already exists, will be updated`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SESSION STATE (AC9, AC14)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Records phase progress in session state (AC9)
   *
   * @param {string} phase - Current phase
   * @param {Object} context - Execution context
   * @private
   */
  async _recordPhase(phase, context) {
    const sessionState = this._getSessionState();
    if (!sessionState) {
      return;
    }

    try {
      const exists = await sessionState.exists();
      if (exists) {
        await sessionState.loadSessionState();
        await sessionState.recordPhaseChange(`greenfield_${phase}`, 'greenfield-fullstack', '@pm');
        this._log(`Phase recorded in session state: ${phase}`);
      }
    } catch (error) {
      this._log(`Failed to record phase: ${error.message}`, 'warn');
    }
  }

  /**
   * Saves current phase for resume (AC14)
   *
   * @param {number} phaseNumber - Phase number to resume from
   * @param {Object} context - Context to save
   * @private
   */
  async _savePhaseForResume(phaseNumber, context) {
    const sessionState = this._getSessionState();
    if (!sessionState) {
      return;
    }

    try {
      const exists = await sessionState.exists();
      if (exists) {
        await sessionState.loadSessionState();
        await sessionState.updateSessionState({
          workflow: {
            current_phase: `greenfield_phase_${phaseNumber}`,
            greenfield_resume: {
              phaseNumber,
              savedAt: new Date().toISOString(),
              context,
            },
          },
        });
        this._log(`Phase ${phaseNumber} saved for resume`);
      }
    } catch (error) {
      this._log(`Failed to save phase for resume: ${error.message}`, 'warn');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Builds a summary of created artifacts
   * @param {Array} stepResults - Phase 1 step results
   * @returns {string} Formatted summary
   * @private
   */
  _buildArtifactsSummary(stepResults) {
    return stepResults
      .filter((s) => s.creates && s.success)
      .map((s) => `- ${s.creates} (${s.agent})`)
      .join('\n');
  }

  /**
   * Gets the GreenfieldPhase enum for a phase number
   * @param {number} phaseNumber - Phase number (0-3)
   * @returns {string} GreenfieldPhase value
   * @private
   */
  _getPhaseEnum(phaseNumber) {
    const map = {
      0: GreenfieldPhase.BOOTSTRAP,
      1: GreenfieldPhase.DISCOVERY,
      2: GreenfieldPhase.SHARDING,
      3: GreenfieldPhase.DEV_CYCLE,
    };
    return map[phaseNumber] || GreenfieldPhase.DETECTION;
  }

  /**
   * Gets phase number from phase string
   * @param {string} phase - Phase string
   * @returns {number} Phase number (-1 if not found)
   * @private
   */
  _getPhaseNumber(phase) {
    if (phase.includes('phase_0') || phase.includes('bootstrap')) return 0;
    if (phase.includes('phase_1') || phase.includes('discovery')) return 1;
    if (phase.includes('phase_2') || phase.includes('sharding')) return 2;
    if (phase.includes('phase_3') || phase.includes('dev_cycle')) return 3;
    return -1;
  }

  /**
   * Gets the next phase number after a given phase
   * @param {string} phase - Current phase
   * @returns {number} Next phase number
   * @private
   */
  _getNextPhaseNumber(phase) {
    const current = this._getPhaseNumber(phase);
    return current >= 0 ? current + 1 : 4;
  }

  /**
   * Debug logger
   * @param {string} message - Log message
   * @param {string} [level='info'] - Log level
   * @private
   */
  _log(message, level = 'info') {
    if (this.options.debug || level === 'error' || level === 'warn') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🌱';
      console.log(`[GreenfieldHandler] ${prefix} ${message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  GreenfieldHandler,
  GreenfieldPhase,
  PhaseFailureAction,
  DEFAULT_GREENFIELD_INDICATORS,
  PHASE_1_SEQUENCE,
};
