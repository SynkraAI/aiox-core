/**
 * Master Orchestrator - Epic 0: Autonomous Development Engine
 *
 * Story: 0.1 - Master Orchestrator Core
 *
 * Central orchestrator that connects all ADE epics (3→4→5→6) in a unified
 * execution pipeline for truly autonomous development.
 *
 * Features:
 * - AC1: Located in `.aios-core/core/orchestration/`
 * - AC2: constructor(projectRoot, options) with storyId, maxRetries, autoRecovery
 * - AC3: executeFullPipeline() runs Epics 3→4→5→6
 * - AC4: executeEpic(epicNum, options) for individual epic execution
 * - AC5: resumeFromEpic(epicNum) to continue from specific point
 * - AC6: State machine: INITIALIZED, READY, IN_PROGRESS, BLOCKED, COMPLETE
 * - AC7: Integrates with TechStackDetector for pre-flight detection
 *
 * @module core/orchestration/master-orchestrator
 * @version 1.0.0
 * @author @dev (Dex)
 */

const fs = require('fs-extra');
const path = require('path');
const { EventEmitter } = require('events');

// Core dependencies
const TechStackDetector = require('./tech-stack-detector');

// Epic Executors (Story 0.3)
const { createExecutor, hasExecutor } = require('./executors');

// Recovery Handler (Story 0.5)
const { RecoveryHandler, RecoveryStrategy: _RecoveryStrategy } = require('./recovery-handler');

// Gate Evaluator (Story 0.6)
const { GateEvaluator, GateVerdict } = require('./gate-evaluator');

// Agent Invoker (Story 0.7)
const { AgentInvoker, SUPPORTED_AGENTS: _SUPPORTED_AGENTS } = require('./agent-invoker');

// Dashboard Integration (Story 0.8)
const { DashboardIntegration, NotificationType: _NotificationType } = require('./dashboard-integration');

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
//                              STATE MACHINE (AC6)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Orchestrator state machine states
 * @enum {string}
 */
const OrchestratorState = {
  /** Initial state after construction */
  INITIALIZED: 'initialized',
  /** Ready to execute after pre-flight checks */
  READY: 'ready',
  /** Currently executing epics */
  IN_PROGRESS: 'in_progress',
  /** Blocked due to error or requiring intervention */
  BLOCKED: 'blocked',
  /** All epics completed successfully */
  COMPLETE: 'complete',
};

/**
 * Epic execution status
 * @enum {string}
 */
const EpicStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

/**
 * Epic configuration - maps epic numbers to their metadata
 */
const EPIC_CONFIG = {
  3: {
    name: 'Spec Pipeline',
    description: 'Requirements → Specification generation',
    executor: 'Epic3Executor',
    icon: '📝',
  },
  4: {
    name: 'Execution Engine',
    description: 'Plan tracking and subtask execution',
    executor: 'Epic4Executor',
    icon: '⚙️',
  },
  5: {
    name: 'Recovery System',
    description: 'Error detection and recovery',
    executor: 'Epic5Executor',
    icon: '🔄',
    onDemand: true, // Only triggered on errors
  },
  6: {
    name: 'QA Loop',
    description: 'Quality assurance and validation',
    executor: 'Epic6Executor',
    icon: '🔍',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              MASTER ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Master Orchestrator - Coordinates all ADE epics in unified execution
 * @extends EventEmitter
 */
class MasterOrchestrator extends EventEmitter {
  /**
   * Create a new MasterOrchestrator instance (AC2)
   *
   * @param {string} projectRoot - Project root directory
   * @param {Object} options - Configuration options
   * @param {string} [options.storyId] - Story identifier (e.g., 'STORY-42')
   * @param {number} [options.maxRetries=3] - Maximum retry attempts per epic
   * @param {boolean} [options.autoRecovery=true] - Enable automatic recovery on failures
   * @param {string} [options.source='story'] - Source type: 'story', 'prd', 'prompt'
   * @param {string} [options.prdPath] - Path to PRD if source is 'prd'
   * @param {boolean} [options.strictGates=false] - Fail on any gate failure
   * @param {Function} [options.onEpicStart] - Callback when epic starts
   * @param {Function} [options.onEpicComplete] - Callback when epic completes
   * @param {Function} [options.onStateChange] - Callback on state transitions
   * @param {Function} [options.invokeAgent] - Function to invoke agents for tasks
   */
  constructor(projectRoot, options = {}) {
    super();

    // Core configuration
    this.projectRoot = projectRoot;
    this.storyId = options.storyId || null;
    this.maxRetries = options.maxRetries ?? 3;
    this.autoRecovery = options.autoRecovery ?? true;
    this.source = options.source || 'story';
    this.prdPath = options.prdPath || null;
    this.strictGates = options.strictGates ?? false;

    // Callbacks
    this.onEpicStart = options.onEpicStart || this._defaultEpicStart.bind(this);
    this.onEpicComplete = options.onEpicComplete || this._defaultEpicComplete.bind(this);
    this.onStateChange = options.onStateChange || this._defaultStateChange.bind(this);
    this.invokeAgent = options.invokeAgent || null;

    // State machine (AC6)
    this._state = OrchestratorState.INITIALIZED;
    this._previousState = null;
    this._inFullPipeline = false; // Flag for gate evaluation during full pipeline

    // Execution state
    this.executionState = {
      workflowId: null,
      storyId: this.storyId,
      status: 'initialized',
      startedAt: null,
      updatedAt: null,
      techStackProfile: null,
      epics: this._initializeEpicsState(),
      currentEpic: null,
      errors: [],
      insights: [],
      retryCount: {},
    };

    // Components (AC7)
    this.techStackDetector = new TechStackDetector(projectRoot);
    this.executors = {}; // Will be loaded lazily

    // Recovery Handler (Story 0.5)
    this.recoveryHandler = new RecoveryHandler({
      projectRoot,
      storyId: this.storyId,
      maxRetries: this.maxRetries,
      autoEscalate: this.autoRecovery,
      orchestrator: this,
    });

    // Gate Evaluator (Story 0.6)
    this.gateEvaluator = new GateEvaluator({
      projectRoot,
      strictMode: this.strictGates,
    });

    // Agent Invoker (Story 0.7)
    this.agentInvoker = new AgentInvoker({
      projectRoot,
      defaultTimeout: options.taskTimeout || 300000, // 5 min
      maxRetries: this.maxRetries,
      executor: this.invokeAgent, // Use custom executor if provided
    });

    // Dashboard Integration (Story 0.8)
    this.dashboardIntegration = new DashboardIntegration({
      projectRoot,
      orchestrator: this,
      autoUpdate: options.dashboardAutoUpdate ?? false, // Default off for tests
      updateInterval: options.dashboardUpdateInterval || 5000,
    });

    // State persistence paths
    this.statePath = path.join(
      projectRoot,
      '.aios',
      'master-orchestrator',
      this.storyId ? `${this.storyId}.json` : 'current.json',
    );

    // Log initialization
    this._log('MasterOrchestrator initialized', {
      projectRoot,
      storyId: this.storyId,
      maxRetries: this.maxRetries,
      autoRecovery: this.autoRecovery,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              STATE MACHINE (AC6)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Get current state
   * @returns {OrchestratorState}
   */
  get state() {
    return this._state;
  }

  /**
   * Transition to a new state
   * @param {OrchestratorState} newState - Target state
   * @param {Object} [context] - Additional context for the transition
   * @private
   */
  _transitionTo(newState, context = {}) {
    const validTransitions = {
      [OrchestratorState.INITIALIZED]: [OrchestratorState.READY, OrchestratorState.BLOCKED],
      [OrchestratorState.READY]: [OrchestratorState.IN_PROGRESS, OrchestratorState.BLOCKED],
      [OrchestratorState.IN_PROGRESS]: [
        OrchestratorState.COMPLETE,
        OrchestratorState.BLOCKED,
        OrchestratorState.IN_PROGRESS, // Allow staying in progress for multiple epics
      ],
      [OrchestratorState.BLOCKED]: [
        OrchestratorState.READY,
        OrchestratorState.IN_PROGRESS,
        OrchestratorState.COMPLETE,
      ],
      [OrchestratorState.COMPLETE]: [], // Terminal state
    };

    const allowed = validTransitions[this._state] || [];
    if (!allowed.includes(newState) && newState !== this._state) {
      this._log(`Invalid state transition: ${this._state} → ${newState}`, { level: 'warn' });
      return false;
    }

    this._previousState = this._state;
    this._state = newState;
    this.executionState.status = newState;
    this.executionState.updatedAt = new Date().toISOString();

    // Emit state change event
    this.emit('stateChange', {
      from: this._previousState,
      to: newState,
      context,
    });

    this.onStateChange(this._previousState, newState, context);
    this._log(`State transition: ${this._previousState} → ${newState}`, context);

    return true;
  }

  /**
   * Initialize epics state structure
   * @private
   */
  _initializeEpicsState() {
    const epics = {};
    for (const epicNum of Object.keys(EPIC_CONFIG)) {
      epics[epicNum] = {
        status: EpicStatus.PENDING,
        startedAt: null,
        completedAt: null,
        result: null,
        attempts: 0,
        errors: [],
      };
    }
    return epics;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Initialize the orchestrator - run pre-flight checks (AC7)
   * @returns {Promise<void>}
   */
  async initialize() {
    this._log('Starting initialization...');

    try {
      // Ensure state directory exists
      await fs.ensureDir(path.dirname(this.statePath));

      // Try to load existing state
      const existingState = await this._loadState();
      if (existingState && existingState.status !== OrchestratorState.COMPLETE) {
        this._log('Found existing state, resuming...', { storyId: existingState.storyId });
        // Deep merge for nested objects like epics
        this.executionState = {
          ...this.executionState,
          ...existingState,
          epics: {
            ...this.executionState.epics,
            ...existingState.epics,
          },
          retryCount: {
            ...this.executionState.retryCount,
            ...(existingState.retryCount || {}),
          },
        };
        this._state = existingState.status || OrchestratorState.INITIALIZED;
      }

      // Generate workflow ID if not exists
      if (!this.executionState.workflowId) {
        this.executionState.workflowId = `master-ade-${this.storyId || Date.now()}`;
      }

      // Record start time if fresh start
      if (!this.executionState.startedAt) {
        this.executionState.startedAt = new Date().toISOString();
      }

      // Run pre-flight tech stack detection (AC7)
      this._log('Running pre-flight tech stack detection...');
      const techStack = await this._detectTechStack();
      this.executionState.techStackProfile = techStack;

      // Log detection summary
      const summary = TechStackDetector.getSummary(techStack);
      this._log(`Tech stack detected: ${summary}`, { confidence: techStack.confidence });

      // Transition to ready
      this._transitionTo(OrchestratorState.READY, { techStack });

      // Save initial state
      await this._saveState();

      this._log('Initialization complete');
    } catch (error) {
      this._log(`Initialization failed: ${error.message}`, { level: 'error' });
      this._transitionTo(OrchestratorState.BLOCKED, { error: error.message });
      throw error;
    }
  }

  /**
   * Detect tech stack using TechStackDetector (AC7)
   * @private
   * @returns {Promise<Object>} Tech stack profile
   */
  async _detectTechStack() {
    return await this.techStackDetector.detect();
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PIPELINE EXECUTION (AC3)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Execute the full ADE pipeline: Epics 3→4→5→6→7 (AC3)
   *
   * @returns {Promise<Object>} Pipeline execution result
   */
  async executeFullPipeline() {
    this._log('Starting full pipeline execution...');

    // Ensure initialized
    if (this._state === OrchestratorState.INITIALIZED) {
      await this.initialize();
    }

    // Validate ready state
    if (this._state !== OrchestratorState.READY && this._state !== OrchestratorState.IN_PROGRESS) {
      throw new Error(`Cannot execute pipeline in state: ${this._state}`);
    }

    // Transition to in progress
    this._transitionTo(OrchestratorState.IN_PROGRESS, { action: 'executeFullPipeline' });

    const pipelineResult = {
      success: true,
      epicsExecuted: [],
      epicsFailed: [],
      epicsSkipped: [],
      startTime: Date.now(),
      endTime: null,
      techStack: this.executionState.techStackProfile,
    };

    // Flag for gate evaluation (only during full pipeline)
    this._inFullPipeline = true;

    try {
      // Execute epics in sequence: 3 → 4 → 6
      // Note: Epic 5 (Recovery) is triggered on-demand, not sequentially
      const epicSequence = [3, 4, 6];

      for (const epicNum of epicSequence) {
        // Check if already completed (for resume scenarios)
        if (this.executionState.epics[epicNum]?.status === EpicStatus.COMPLETED) {
          this._log(`Epic ${epicNum} already completed, skipping...`);
          pipelineResult.epicsSkipped.push(epicNum);
          continue;
        }

        // Check if blocked
        if (this._state === OrchestratorState.BLOCKED) {
          this._log(`Pipeline blocked, cannot continue to Epic ${epicNum}`);
          break;
        }

        try {
          // Execute epic
          const result = await this.executeEpic(epicNum);

          if (result.success) {
            pipelineResult.epicsExecuted.push(epicNum);
          } else {
            pipelineResult.epicsFailed.push(epicNum);

            // In strict mode or if epic is critical, stop pipeline
            if (this.strictGates || this._isEpicCritical(epicNum)) {
              this._log(`Critical epic ${epicNum} failed, halting pipeline`);
              pipelineResult.success = false;
              break;
            }
          }
        } catch (error) {
          this._log(`Epic ${epicNum} threw error: ${error.message}`, { level: 'error' });
          pipelineResult.epicsFailed.push(epicNum);
          pipelineResult.success = false;

          // Record error
          this.executionState.errors.push({
            epic: epicNum,
            error: error.message,
            timestamp: new Date().toISOString(),
          });

          // Try recovery if enabled
          if (this.autoRecovery) {
            const recovered = await this._attemptRecovery(epicNum, error);
            if (recovered) {
              pipelineResult.epicsFailed = pipelineResult.epicsFailed.filter((e) => e !== epicNum);
              pipelineResult.epicsExecuted.push(epicNum);
              pipelineResult.success = true;
            }
          }

          // If not recovered and strict, stop
          if (!pipelineResult.success && this.strictGates) {
            break;
          }
        }

        // Save state after each epic
        await this._saveState();
      }

      // Finalize pipeline
      pipelineResult.endTime = Date.now();
      pipelineResult.duration = pipelineResult.endTime - pipelineResult.startTime;

      // Transition to final state
      if (pipelineResult.success && pipelineResult.epicsFailed.length === 0) {
        this._transitionTo(OrchestratorState.COMPLETE, { result: pipelineResult });
      } else if (pipelineResult.epicsFailed.length > 0) {
        this._transitionTo(OrchestratorState.BLOCKED, {
          failedEpics: pipelineResult.epicsFailed,
        });
      }

      // Save final state
      await this._saveState();

      return this.finalize(pipelineResult);
    } catch (error) {
      this._log(`Pipeline execution failed: ${error.message}`, { level: 'error' });
      this._transitionTo(OrchestratorState.BLOCKED, { error: error.message });
      await this._saveState();
      throw error;
    } finally {
      // Reset pipeline flag
      this._inFullPipeline = false;
    }
  }

  /**
   * Check if an epic is critical (failure should halt pipeline)
   * @private
   */
  _isEpicCritical(epicNum) {
    // Epics 3 (Spec) and 4 (Execution) are critical
    return [3, 4].includes(epicNum);
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SINGLE EPIC EXECUTION (AC4)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Execute a single epic (AC4)
   *
   * @param {number} epicNum - Epic number (3, 4, 5, 6, or 7)
   * @param {Object} [options] - Epic-specific options
   * @returns {Promise<Object>} Epic execution result
   */
  async executeEpic(epicNum, options = {}) {
    const epicConfig = EPIC_CONFIG[epicNum];
    if (!epicConfig) {
      throw new Error(`Unknown epic number: ${epicNum}`);
    }

    this._log(`Starting Epic ${epicNum}: ${epicConfig.name}`, { icon: epicConfig.icon });

    // Update epic state
    this.executionState.currentEpic = epicNum;
    this.executionState.epics[epicNum] = {
      ...this.executionState.epics[epicNum],
      status: EpicStatus.IN_PROGRESS,
      startedAt: new Date().toISOString(),
      attempts: (this.executionState.epics[epicNum]?.attempts || 0) + 1,
    };

    // Emit epic start event
    this.emit('epicStart', { epicNum, config: epicConfig });
    this.onEpicStart(epicNum, epicConfig);

    try {
      // Build context for this epic
      const context = this._buildContextForEpic(epicNum);

      // Get or create executor
      const executor = await this._getExecutor(epicNum);

      // Execute the epic
      const result = await executor.execute({
        ...context,
        ...options,
        orchestrator: this,
      });

      // Mark as completed
      this.executionState.epics[epicNum] = {
        ...this.executionState.epics[epicNum],
        status: EpicStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        result,
      };

      // Evaluate quality gate (Story 0.6) - only in full pipeline mode
      // Skip gate evaluation if result is from stub executor
      let gateResult = null;
      const isStubResult = result && result.status === 'stub';
      if (this._inFullPipeline && result && result.success !== false && !isStubResult) {
        gateResult = await this._evaluateGate(epicNum, result);

        // Store gate result if exists
        if (gateResult) {
          this.executionState.epics[epicNum].gateResult = gateResult;
        }
      }

      // Save state after epic completion
      await this._saveState();

      // Emit epic complete event
      this.emit('epicComplete', { epicNum, result, gateResult });
      this.onEpicComplete(epicNum, result);

      this._log(`Epic ${epicNum} completed successfully`, { icon: '✅' });

      // Check gate verdict (only block/warn during full pipeline)
      if (gateResult && this._inFullPipeline) {
        if (this.gateEvaluator.shouldBlock(gateResult.verdict)) {
          this._log(`Gate blocked: ${gateResult.gate}`, { level: 'warn', icon: '🚫' });
          this._transitionTo(OrchestratorState.BLOCKED, {
            reason: 'gate_blocked',
            gate: gateResult.gate,
            issues: gateResult.issues,
          });
          return { success: false, epicNum, result, gateResult, blocked: true };
        }

        if (this.gateEvaluator.needsRevision(gateResult.verdict)) {
          this._log(`Gate needs revision: ${gateResult.gate}`, { level: 'warn', icon: '⚠️' });
          result.needsRevision = true;
        }
      }

      return { success: true, epicNum, result, gateResult };
    } catch (error) {
      // Mark as failed
      this.executionState.epics[epicNum] = {
        ...this.executionState.epics[epicNum],
        status: EpicStatus.FAILED,
        errors: [
          ...(this.executionState.epics[epicNum]?.errors || []),
          { message: error.message, timestamp: new Date().toISOString() },
        ],
      };

      this._log(`Epic ${epicNum} failed: ${error.message}`, { level: 'error', icon: '❌' });

      // Check retry count
      const retries = this.executionState.retryCount[epicNum] || 0;
      if (retries < this.maxRetries && this.autoRecovery) {
        this.executionState.retryCount[epicNum] = retries + 1;
        this._log(`Retrying Epic ${epicNum} (attempt ${retries + 1}/${this.maxRetries})...`);
        return this.executeEpic(epicNum, options);
      }

      return { success: false, epicNum, error: error.message };
    }
  }

  /**
   * Get or create an executor for the epic (Story 0.3)
   * @private
   */
  async _getExecutor(epicNum) {
    if (!this.executors[epicNum]) {
      // Use real executors from Story 0.3
      if (hasExecutor(epicNum)) {
        this.executors[epicNum] = createExecutor(epicNum, this);
      } else {
        // Fallback to stub for unknown epics
        this.executors[epicNum] = new StubEpicExecutor(this, epicNum);
      }
    }
    return this.executors[epicNum];
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              RESUME EXECUTION (AC5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Resume execution from a specific epic (AC5)
   *
   * @param {number} fromEpic - Epic number to resume from
   * @returns {Promise<Object>} Pipeline execution result
   */
  async resumeFromEpic(fromEpic) {
    this._log(`Resuming from Epic ${fromEpic}...`);

    // Load existing state
    const existingState = await this._loadState();
    if (existingState) {
      Object.assign(this.executionState, existingState);
    }

    // Reset state for epics >= fromEpic
    for (const epicNumStr of Object.keys(this.executionState.epics)) {
      const epicNum = parseInt(epicNumStr, 10);
      if (epicNum >= fromEpic) {
        this.executionState.epics[epicNum] = {
          status: EpicStatus.PENDING,
          startedAt: null,
          completedAt: null,
          result: null,
          attempts: 0,
          errors: [],
        };
        this.executionState.retryCount[epicNum] = 0;
      }
    }

    // Clear blocked state if set
    if (this._state === OrchestratorState.BLOCKED) {
      this._transitionTo(OrchestratorState.READY, { action: 'resume', fromEpic });
    }

    // Execute pipeline from this point
    return this.executeFullPipeline();
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              CONTEXT BUILDING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Build context for a specific epic
   * This will be expanded in Story 0.4 (Context Threading)
   * @private
   */
  _buildContextForEpic(epicNum) {
    const baseContext = {
      storyId: this.storyId,
      workflowId: this.executionState.workflowId,
      techStack: this.executionState.techStackProfile,
      projectRoot: this.projectRoot,
      previousGates: this._getCompletedGates(),
    };

    switch (epicNum) {
      case 3: // Spec Pipeline
        return {
          ...baseContext,
          source: this.source,
          prdPath: this.prdPath,
        };

      case 4: // Execution Engine
        return {
          ...baseContext,
          spec: this.executionState.epics[3]?.result?.specPath,
          complexity: this.executionState.epics[3]?.result?.complexity,
          requirements: this.executionState.epics[3]?.result?.requirements,
        };

      case 5: // Recovery (on-demand)
        return {
          ...baseContext,
          implementationPath: this.executionState.epics[4]?.result?.implementationPath,
          errors: this.executionState.errors,
          attempts: this.executionState.epics[4]?.attempts,
        };

      case 6: // QA Loop
        return {
          ...baseContext,
          buildResult: this.executionState.epics[4]?.result,
          testResults: this.executionState.epics[4]?.result?.testResults,
          codeChanges: this.executionState.epics[4]?.result?.codeChanges,
        };

      case 7: // Memory Layer
        return {
          ...baseContext,
          qaReport: this.executionState.epics[6]?.result,
          patterns: this.executionState.insights,
          sessionInsights: this._collectSessionInsights(),
        };

      default:
        return baseContext;
    }
  }

  /**
   * Get list of completed gates/epics
   * @private
   */
  _getCompletedGates() {
    return Object.entries(this.executionState.epics)
      .filter(([_, epic]) => epic.status === EpicStatus.COMPLETED)
      .map(([num, _]) => parseInt(num, 10));
  }

  /**
   * Collect session insights for memory layer
   * @private
   */
  _collectSessionInsights() {
    return {
      duration: this.executionState.startedAt
        ? Date.now() - new Date(this.executionState.startedAt).getTime()
        : 0,
      errorsEncountered: this.executionState.errors.length,
      recoveryAttempts: Object.values(this.executionState.retryCount).reduce((a, b) => a + b, 0),
      completedEpics: this._getCompletedGates().length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              QUALITY GATES (Story 0.6)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Evaluate quality gate after epic completion (AC1)
   * @private
   * @param {number} epicNum - Completed epic number
   * @param {Object} result - Epic result
   * @returns {Promise<Object|null>} Gate result or null if no gate
   */
  async _evaluateGate(epicNum, result) {
    // Determine next epic for gate evaluation
    const epicSequence = [3, 4, 6, 7];
    const currentIndex = epicSequence.indexOf(epicNum);

    // No gate after last epic or if epic not in sequence
    if (currentIndex === -1 || currentIndex === epicSequence.length - 1) {
      return null;
    }

    const nextEpic = epicSequence[currentIndex + 1];

    this._log(`Evaluating gate: Epic ${epicNum} -> Epic ${nextEpic}`, { icon: '🚦' });

    try {
      const gateResult = await this.gateEvaluator.evaluate(epicNum, nextEpic, result);

      // Log gate result
      this._log(`Gate verdict: ${gateResult.verdict} (score: ${gateResult.score.toFixed(1)})`, {
        level: gateResult.verdict === GateVerdict.APPROVED ? 'info' : 'warn',
      });

      return gateResult;
    } catch (error) {
      this._log(`Gate evaluation error: ${error.message}`, { level: 'error' });
      // Return blocked gate on error if strict
      if (this.strictGates) {
        return {
          gate: `epic${epicNum}_to_epic${nextEpic}`,
          verdict: GateVerdict.BLOCKED,
          issues: [{ check: 'evaluation_error', message: error.message, severity: 'critical' }],
        };
      }
      return null;
    }
  }

  /**
   * Get gate evaluator for external access (AC6)
   * @returns {GateEvaluator}
   */
  getGateEvaluator() {
    return this.gateEvaluator;
  }

  /**
   * Get all gate results (AC6)
   * @returns {Object[]}
   */
  getGateResults() {
    return this.gateEvaluator.getResults();
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              AGENT INVOCATION (Story 0.7)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Get the agent invoker instance (Story 0.7)
   * @returns {AgentInvoker}
   */
  getAgentInvoker() {
    return this.agentInvoker;
  }

  /**
   * Invoke an agent to execute a task (Story 0.7 - AC1)
   *
   * @param {string} agentName - Agent name (e.g., 'dev', 'qa', 'architect')
   * @param {string} taskPath - Path to task file or task name
   * @param {Object} [inputs={}] - Inputs to pass to the task
   * @returns {Promise<Object>} Invocation result
   */
  async invokeAgentForTask(agentName, taskPath, inputs = {}) {
    // Add orchestration context to inputs
    const enrichedInputs = {
      ...inputs,
      orchestration: {
        storyId: this.storyId,
        currentEpic: this.executionState.currentEpic,
        techStack: this.executionState.techStackProfile,
        state: this._state,
      },
    };

    return this.agentInvoker.invokeAgent(agentName, taskPath, enrichedInputs);
  }

  /**
   * Get supported agents (Story 0.7 - AC2)
   * @returns {Object} Map of supported agents
   */
  getSupportedAgents() {
    return this.agentInvoker.getSupportedAgents();
  }

  /**
   * Get agent invocation history (Story 0.7 - AC7)
   * @returns {Object[]} Invocation records
   */
  getAgentInvocations() {
    return this.agentInvoker.getInvocations();
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              DASHBOARD INTEGRATION (Story 0.8)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Get the dashboard integration instance (Story 0.8)
   * @returns {DashboardIntegration}
   */
  getDashboardIntegration() {
    return this.dashboardIntegration;
  }

  /**
   * Start dashboard monitoring (Story 0.8 - AC1)
   */
  async startDashboard() {
    await this.dashboardIntegration.start();
  }

  /**
   * Stop dashboard monitoring (Story 0.8)
   */
  stopDashboard() {
    this.dashboardIntegration.stop();
  }

  /**
   * Get dashboard status (Story 0.8 - AC1, AC2)
   * @returns {Object} Dashboard status
   */
  getDashboardStatus() {
    return this.dashboardIntegration.buildStatus();
  }

  /**
   * Get execution history (Story 0.8 - AC5)
   * @returns {Object[]} History entries
   */
  getExecutionHistory() {
    return this.dashboardIntegration.getHistory();
  }

  /**
   * Get notifications (Story 0.8 - AC7)
   * @param {boolean} [unreadOnly=false] - Only unread notifications
   * @returns {Object[]} Notifications
   */
  getNotifications(unreadOnly = false) {
    return this.dashboardIntegration.getNotifications(unreadOnly);
  }

  /**
   * Add notification (Story 0.8 - AC7)
   * @param {Object} notification - Notification object
   */
  addNotification(notification) {
    this.dashboardIntegration.addNotification(notification);
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              RECOVERY (Story 0.5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Attempt recovery for a failed epic (AC1-AC7 of Story 0.5)
   * Uses RecoveryHandler for intelligent recovery with stuck detection
   * @private
   * @param {number} epicNum - Failed epic number
   * @param {Error} error - Error that caused failure
   * @returns {Promise<boolean>} True if should retry
   */
  async _attemptRecovery(epicNum, error) {
    this._log(`Attempting recovery for Epic ${epicNum}...`, { error: error.message });

    // Don't try to recover from recovery failures (avoid infinite loop)
    if (epicNum === 5) {
      this._log('Cannot recover from recovery epic failure', { level: 'warn' });
      return false;
    }

    // Check if we can still retry (AC5)
    if (!this.recoveryHandler.canRetry(epicNum)) {
      this._log(`Max retries reached for Epic ${epicNum}`, { level: 'warn' });
      return false;
    }

    try {
      // Use RecoveryHandler for intelligent recovery (AC1)
      const result = await this.recoveryHandler.handleEpicFailure(epicNum, error, {
        approach: this.executionState.epics[epicNum]?.currentApproach || 'default',
        subtaskId: this.executionState.epics[epicNum]?.currentSubtask,
        affectedFiles: this.executionState.epics[epicNum]?.result?.codeChanges || [],
      });

      // Log recovery result (AC7)
      this._log(
        `Recovery result: ${JSON.stringify({
          strategy: result.strategy,
          success: result.success,
          shouldRetry: result.shouldRetry,
          escalated: result.escalated,
        })}`,
        { level: result.success ? 'info' : 'warn' },
      );

      // Track retry count
      this.executionState.retryCount[epicNum] = (this.executionState.retryCount[epicNum] || 0) + 1;

      // Handle escalation
      if (result.escalated) {
        this._transitionTo(OrchestratorState.BLOCKED, {
          reason: 'escalated_to_human',
          epicNum,
          error: error.message,
        });
        return false;
      }

      // Should we retry?
      return result.shouldRetry;
    } catch (recoveryError) {
      this._log(`Recovery handler error: ${recoveryError.message}`, { level: 'error' });
      return false;
    }
  }

  /**
   * Get recovery handler for external access
   * @returns {RecoveryHandler}
   */
  getRecoveryHandler() {
    return this.recoveryHandler;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              STATE PERSISTENCE (Story 0.2)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Save current state to disk (AC1, AC3)
   * Called after each epic completion and state transition
   * @returns {Promise<boolean>} Success status
   */
  async saveState() {
    try {
      await fs.ensureDir(path.dirname(this.statePath));

      // Build comprehensive state object (AC2, AC6, AC7)
      const stateToSave = {
        // Metadata
        schemaVersion: '1.0',
        workflowId: this.executionState.workflowId,
        storyId: this.storyId,
        status: this._state,

        // Timestamps (AC6)
        timestamps: {
          startedAt: this.executionState.startedAt,
          updatedAt: new Date().toISOString(),
          savedAt: new Date().toISOString(),
          completedAt: this._state === OrchestratorState.COMPLETE ? new Date().toISOString() : null,
        },

        // Tech stack profile (AC7)
        techStackProfile: this.executionState.techStackProfile,

        // Epic tracking (AC2)
        currentEpic: this.executionState.currentEpic,
        completedEpics: this._getCompletedGates(),
        failedEpics: this._getFailedEpics(),
        pendingEpics: this._getPendingEpics(),

        // Full epics state
        epics: this.executionState.epics,

        // Recovery tracking
        retryCount: this.executionState.retryCount,

        // Context for resume (AC2)
        context: {
          source: this.source,
          prdPath: this.prdPath,
          strictGates: this.strictGates,
          maxRetries: this.maxRetries,
          autoRecovery: this.autoRecovery,
        },

        // Errors and insights
        errors: this.executionState.errors,
        insights: this.executionState.insights,

        // Session insights
        sessionInsights: this._collectSessionInsights(),
      };

      await fs.writeJson(this.statePath, stateToSave, { spaces: 2 });
      this._log('State saved successfully', { path: this.statePath });

      return true;
    } catch (error) {
      this._log(`Failed to save state: ${error.message}`, { level: 'warn' });
      return false;
    }
  }

  /**
   * Internal save state wrapper (calls public method)
   * @private
   */
  async _saveState() {
    return this.saveState();
  }

  /**
   * Load state for a specific story ID (AC4)
   * @param {string} [storyId] - Story ID to load (defaults to this.storyId)
   * @returns {Promise<Object|null>} Loaded state or null
   */
  async loadState(storyId = null) {
    const targetStoryId = storyId || this.storyId;
    const targetPath = targetStoryId
      ? path.join(this.projectRoot, '.aios', 'master-orchestrator', `${targetStoryId}.json`)
      : this.statePath;

    try {
      if (await fs.pathExists(targetPath)) {
        const state = await fs.readJson(targetPath);

        // Validate state schema
        if (!this._validateStateSchema(state)) {
          this._log('Invalid state schema, ignoring saved state', { level: 'warn' });
          return null;
        }

        this._log('State loaded successfully', { storyId: targetStoryId });
        return state;
      }
    } catch (error) {
      this._log(`Failed to load state: ${error.message}`, { level: 'warn' });
    }
    return null;
  }

  /**
   * Internal load state wrapper (calls public method)
   * @private
   */
  async _loadState() {
    return this.loadState();
  }

  /**
   * Find and load the most recent valid state (AC5)
   * Searches for any resumable state in the master-orchestrator directory
   * @returns {Promise<Object|null>} Most recent valid state or null
   */
  async findLatestValidState() {
    const stateDir = path.join(this.projectRoot, '.aios', 'master-orchestrator');

    try {
      if (!(await fs.pathExists(stateDir))) {
        return null;
      }

      const files = await fs.readdir(stateDir);
      const stateFiles = files.filter((f) => f.endsWith('.json'));

      if (stateFiles.length === 0) {
        return null;
      }

      // Load all states and find most recent valid one
      const states = [];
      for (const file of stateFiles) {
        try {
          const filePath = path.join(stateDir, file);
          const state = await fs.readJson(filePath);

          if (this._validateStateSchema(state) && this._isResumable(state)) {
            const updatedAt = new Date(state.timestamps?.updatedAt || 0).getTime();
            states.push({ file, state, updatedAt });
          }
        } catch {
          // Skip invalid files
        }
      }

      if (states.length === 0) {
        return null;
      }

      // Sort by most recent
      states.sort((a, b) => b.updatedAt - a.updatedAt);

      this._log(`Found ${states.length} resumable state(s), using most recent`, {
        storyId: states[0].state.storyId,
      });

      return states[0].state;
    } catch (error) {
      this._log(`Failed to find latest state: ${error.message}`, { level: 'warn' });
      return null;
    }
  }

  /**
   * Validate state object against expected schema
   * @private
   */
  _validateStateSchema(state) {
    if (!state || typeof state !== 'object') return false;

    // Required fields
    const requiredFields = ['workflowId', 'status', 'epics'];
    for (const field of requiredFields) {
      if (state[field] === undefined) {
        return false;
      }
    }

    // Validate epics structure
    if (typeof state.epics !== 'object') return false;

    return true;
  }

  /**
   * Check if state is resumable (not complete, not too old)
   * @private
   */
  _isResumable(state) {
    // Can't resume completed states
    if (state.status === OrchestratorState.COMPLETE) {
      return false;
    }

    // Check if state is not too old (24 hours)
    const updatedAt = new Date(state.timestamps?.updatedAt || 0).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - updatedAt > maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Get list of failed epics
   * @private
   */
  _getFailedEpics() {
    return Object.entries(this.executionState.epics)
      .filter(([_, epic]) => epic.status === EpicStatus.FAILED)
      .map(([num, _]) => parseInt(num, 10));
  }

  /**
   * Get list of pending epics
   * @private
   */
  _getPendingEpics() {
    return Object.entries(this.executionState.epics)
      .filter(([_, epic]) => epic.status === EpicStatus.PENDING)
      .map(([num, _]) => parseInt(num, 10));
  }

  /**
   * Clear saved state for current story
   * @returns {Promise<boolean>} Success status
   */
  async clearState() {
    try {
      if (await fs.pathExists(this.statePath)) {
        await fs.remove(this.statePath);
        this._log('State cleared', { path: this.statePath });
        return true;
      }
    } catch (error) {
      this._log(`Failed to clear state: ${error.message}`, { level: 'warn' });
    }
    return false;
  }

  /**
   * List all saved states
   * @returns {Promise<Array>} List of state summaries
   */
  async listSavedStates() {
    const stateDir = path.join(this.projectRoot, '.aios', 'master-orchestrator');

    try {
      if (!(await fs.pathExists(stateDir))) {
        return [];
      }

      const files = await fs.readdir(stateDir);
      const states = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filePath = path.join(stateDir, file);
          const state = await fs.readJson(filePath);

          states.push({
            storyId: state.storyId || file.replace('.json', ''),
            workflowId: state.workflowId,
            status: state.status,
            progress: this._calculateProgressFromState(state),
            updatedAt: state.timestamps?.updatedAt,
            resumable: this._isResumable(state),
          });
        } catch {
          // Skip invalid files
        }
      }

      return states.sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
      );
    } catch (error) {
      this._log(`Failed to list states: ${error.message}`, { level: 'warn' });
      return [];
    }
  }

  /**
   * Calculate progress percentage from a state object
   * @private
   */
  _calculateProgressFromState(state) {
    if (!state.epics) return 0;

    const totalEpics = Object.keys(EPIC_CONFIG).filter((num) => !EPIC_CONFIG[num].onDemand).length;

    const completedEpics = Object.values(state.epics).filter(
      (epic) => epic.status === EpicStatus.COMPLETED,
    ).length;

    return Math.round((completedEpics / totalEpics) * 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              FINALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Finalize pipeline execution and generate summary
   * @param {Object} pipelineResult - Raw pipeline result
   * @returns {Object} Finalized result
   */
  finalize(pipelineResult = {}) {
    const duration =
      pipelineResult.duration ||
      (this.executionState.startedAt
        ? Date.now() - new Date(this.executionState.startedAt).getTime()
        : 0);

    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return {
      workflowId: this.executionState.workflowId,
      storyId: this.storyId,
      status: this._state,
      success: pipelineResult.success ?? this._state === OrchestratorState.COMPLETE,
      duration: `${minutes}m ${seconds}s`,
      durationMs: duration,
      techStack: TechStackDetector.getSummary(this.executionState.techStackProfile || {}),
      epics: {
        executed: pipelineResult.epicsExecuted || [],
        failed: pipelineResult.epicsFailed || [],
        skipped: pipelineResult.epicsSkipped || [],
      },
      errors: this.executionState.errors,
      insights: this.executionState.insights,
      state: this.executionState,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Calculate overall progress percentage
   * @returns {number} Progress 0-100
   */
  getProgressPercentage() {
    const totalEpics = Object.keys(EPIC_CONFIG).filter((num) => !EPIC_CONFIG[num].onDemand).length;

    const completedEpics = Object.values(this.executionState.epics).filter(
      (epic) => epic.status === EpicStatus.COMPLETED,
    ).length;

    return Math.round((completedEpics / totalEpics) * 100);
  }

  /**
   * Get current execution status summary
   * @returns {Object} Status summary
   */
  getStatus() {
    return {
      state: this._state,
      storyId: this.storyId,
      currentEpic: this.executionState.currentEpic,
      progress: this.getProgressPercentage(),
      epics: Object.fromEntries(
        Object.entries(this.executionState.epics).map(([num, epic]) => [
          num,
          { status: epic.status, attempts: epic.attempts },
        ]),
      ),
      errors: this.executionState.errors.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LOGGING & CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Internal logging
   * @private
   */
  _log(message, options = {}) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const level = options.level || 'info';
    const icon = options.icon || '';

    let coloredMessage;
    switch (level) {
      case 'error':
        coloredMessage = chalk.red(message);
        break;
      case 'warn':
        coloredMessage = chalk.yellow(message);
        break;
      case 'success':
        coloredMessage = chalk.green(message);
        break;
      default:
        coloredMessage = chalk.gray(message);
    }

    console.log(
      `${chalk.dim(`[${timestamp}]`)} ${chalk.cyan('[MasterOrchestrator]')} ${icon} ${coloredMessage}`,
    );

    // Emit log event for external listeners
    this.emit('log', { timestamp, level, message, ...options });
  }

  /**
   * Default epic start callback
   * @private
   */
  _defaultEpicStart(epicNum, config) {
    console.log(chalk.blue(`\n${config.icon} Starting Epic ${epicNum}: ${config.name}`));
    console.log(chalk.gray(`   ${config.description}`));
  }

  /**
   * Default epic complete callback
   * @private
   */
  _defaultEpicComplete(epicNum, result) {
    const status = result?.success !== false ? '✅' : '❌';
    console.log(chalk.green(`   ${status} Epic ${epicNum} complete`));
  }

  /**
   * Default state change callback
   * @private
   */
  _defaultStateChange(from, to, _context) {
    console.log(chalk.magenta(`   📊 State: ${from} → ${to}`));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STUB EXECUTOR (placeholder)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Stub Epic Executor - placeholder for Story 0.3
 * Real executors will be implemented in Story 0.3
 */
class StubEpicExecutor {
  constructor(orchestrator, epicNum) {
    this.orchestrator = orchestrator;
    this.epicNum = epicNum;
    this.config = EPIC_CONFIG[epicNum];
  }

  async execute(_context) {
    console.log(chalk.yellow(`   ⚠️  Using stub executor for Epic ${this.epicNum}`));
    console.log(chalk.gray(`      Real executor (${this.config.executor}) not yet implemented`));
    console.log(chalk.gray('      See Story 0.3: Epic Executors'));

    // Return minimal success result for pipeline to continue
    return {
      status: 'stub',
      epicNum: this.epicNum,
      message: `Stub executor for ${this.config.name}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = MasterOrchestrator;
module.exports.OrchestratorState = OrchestratorState;
module.exports.EpicStatus = EpicStatus;
module.exports.EPIC_CONFIG = EPIC_CONFIG;
