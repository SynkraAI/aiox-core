/**
 * Bob Orchestrator - Decision Tree Entry Point
 *
 * Story 12.3: Bob Orchestration Logic (Decision Tree)
 * PRD Reference: §3.3 (Decision Tree), §3.7 (Router not God Class)
 *
 * This is the main entry point for Bob (PM agent). It detects project state
 * and routes to the appropriate workflow using codified decision logic
 * (no LLM reasoning for routing decisions).
 *
 * Integrates all Epic 11 modules:
 * - ExecutorAssignment (11.1) — agent selection
 * - TerminalSpawner (11.2) — agent spawning
 * - WorkflowExecutor (11.3) — development cycle
 * - SurfaceChecker (11.4) — human decision criteria
 * - SessionState (11.5) — session persistence
 *
 * Constraint: < 50 lines of other-agent-specific logic (PRD §3.7)
 *
 * @module core/orchestration/bob-orchestrator
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { resolveConfig } = require('../config/config-resolver');
const ExecutorAssignment = require('./executor-assignment');
const { WorkflowExecutor } = require('./workflow-executor');
const { SurfaceChecker } = require('./surface-checker');
const { SessionState } = require('./session-state');
const LockManager = require('./lock-manager');
const { DataLifecycleManager } = require('./data-lifecycle-manager');

// Story 12.8: Brownfield Handler
const { BrownfieldHandler } = require('./brownfield-handler');

// Story 12.13: Greenfield Handler
const { GreenfieldHandler } = require('./greenfield-handler');

// Story 12.6: Observability Panel Integration + Dashboard Bridge
const { ObservabilityPanel, PanelMode } = require('../ui/observability-panel');
const { BobStatusWriter } = require('./bob-status-writer');
const { getDashboardEmitter } = require('../events/dashboard-emitter');

// Story 12.7: Educational Mode
const { MessageFormatter } = require('./message-formatter');
const { setUserConfigValue } = require('../config/config-resolver');

/**
 * Project state enum — detected by decision tree
 * @enum {string}
 */
const ProjectState = {
  NO_CONFIG: 'NO_CONFIG',
  EXISTING_NO_DOCS: 'EXISTING_NO_DOCS',
  EXISTING_WITH_DOCS: 'EXISTING_WITH_DOCS',
  GREENFIELD: 'GREENFIELD',
};

/**
 * Orchestration result
 * @typedef {Object} OrchestrationResult
 * @property {boolean} success - Whether orchestration completed successfully
 * @property {string} projectState - Detected project state
 * @property {string} action - Action taken
 * @property {Object} [data] - Additional result data
 * @property {string} [error] - Error message if failed
 */

/**
 * BobOrchestrator — Main decision tree and orchestration entry point
 */
class BobOrchestrator {
  /**
   * Creates a new BobOrchestrator instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Orchestrator options
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(projectRoot, options = {}) {
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ...options,
    };

    // Initialize Epic 11 dependencies
    this.surfaceChecker = new SurfaceChecker();
    this.sessionState = new SessionState(projectRoot, { debug: this.options.debug });
    this.workflowExecutor = new WorkflowExecutor(projectRoot, { debug: this.options.debug });
    this.lockManager = new LockManager(projectRoot, { debug: this.options.debug });

    // Story 12.5: Data Lifecycle Manager
    this.dataLifecycleManager = new DataLifecycleManager(projectRoot, { debug: this.options.debug });

    // Story 12.8: Brownfield Handler
    this.brownfieldHandler = new BrownfieldHandler(projectRoot, {
      debug: this.options.debug,
      workflowExecutor: this.workflowExecutor,
      surfaceChecker: this.surfaceChecker,
      sessionState: this.sessionState,
    });

    // Story 12.13: Greenfield Handler
    this.greenfieldHandler = new GreenfieldHandler(projectRoot, {
      debug: this.options.debug,
      workflowExecutor: this.workflowExecutor,
      surfaceChecker: this.surfaceChecker,
      sessionState: this.sessionState,
    });

    // Story 12.7: Educational Mode (AC1-2)
    // Educational mode is resolved from: session override > user config > default (false)
    this.educationalMode = this._resolveEducationalMode();
    this.messageFormatter = new MessageFormatter({ educationalMode: this.educationalMode });

    // Story 12.6: Observability Panel Integration (AC1-5)
    // Story 12.7: Panel mode based on educational mode (AC2, AC7)
    this.observabilityPanel = new ObservabilityPanel({
      mode: this.educationalMode ? PanelMode.DETAILED : PanelMode.MINIMAL,
      refreshRate: 1000, // 1 second refresh (AC3)
    });

    // Story 12.6: Dashboard Bridge (AC6-11)
    this.bobStatusWriter = new BobStatusWriter(projectRoot, { debug: this.options.debug });
    this.dashboardEmitter = getDashboardEmitter();

    // Story 12.6: Wire up callbacks (AC1, AC2)
    this._setupObservabilityCallbacks();

    // BOB-BUGFIX-1: Cleanup orphan monitor processes from previous sessions
    this._cleanupOrphanMonitors();

    this._log('BobOrchestrator initialized');
  }

  /**
   * Sets up observability panel callbacks (Story 12.6 - AC1, AC2, AC6-11)
   * @private
   */
  _setupObservabilityCallbacks() {
    // Map phase ID to pipeline stage
    const stageMap = {
      '1_validation': 'validation',
      '2_development': 'development',
      '3_self_healing': 'self_healing',
      '4_quality_gate': 'quality_gate',
      '5_push': 'push',
      '6_checkpoint': 'checkpoint',
    };

    // Map agent ID to agent name
    const agentNameMap = {
      '@dev': 'Dex',
      '@qa': 'Quinn',
      '@architect': 'Aria',
      '@devops': 'Gage',
      '@pm': 'Morgan',
      '@po': 'Pax',
      '@sm': 'River',
      dev: 'Dex',
      qa: 'Quinn',
      architect: 'Aria',
      devops: 'Gage',
      pm: 'Morgan',
      po: 'Pax',
      sm: 'River',
    };

    // AC2: Phase change callback
    this.workflowExecutor.onPhaseChange((phase, storyId, executor) => {
      const stageName = stageMap[phase] || phase;

      // CLI Panel update (AC2)
      this.observabilityPanel.setPipelineStage(stageName);
      this._log(`Panel updated: phase=${stageName}, story=${storyId}, executor=${executor}`);

      // Dashboard Bridge: bob-status.json update (AC6)
      this.bobStatusWriter.updatePhase(stageName).catch((err) => {
        this._log(`BobStatusWriter error: ${err.message}`);
      });

      // Dashboard Bridge: WebSocket event (AC7)
      this.dashboardEmitter.emitBobPhaseChange(stageName, storyId, executor).catch((err) => {
        this._log(`DashboardEmitter error: ${err.message}`);
      });
    });

    // AC1: Agent spawn callback
    this.workflowExecutor.onAgentSpawn((agent, task) => {
      const agentId = agent.startsWith('@') ? agent : `@${agent}`;
      const agentName = agentNameMap[agent] || agent;
      const reason = `Assigned for ${task}`;

      // CLI Panel update (AC1)
      this.observabilityPanel.setCurrentAgent(agentId, agentName, task, reason);
      this._log(`Panel updated: agent=${agentId}, name=${agentName}, task=${task}`);

      // Dashboard Bridge: bob-status.json update (AC6)
      this.bobStatusWriter.updateAgent(agentId, agentName, task, reason).catch((err) => {
        this._log(`BobStatusWriter error: ${err.message}`);
      });
    });

    // Story 12.13: Greenfield handler observability callbacks (AC10)
    this.greenfieldHandler.on('phaseStart', ({ phase }) => {
      this.observabilityPanel.setPipelineStage(phase);
      this._log(`Greenfield panel updated: phase=${phase}`);
      this.bobStatusWriter.updatePhase(phase).catch((err) => {
        this._log(`BobStatusWriter error: ${err.message}`);
      });
    });

    this.greenfieldHandler.on('agentSpawn', ({ agent, task }) => {
      const agentId = agent.startsWith('@') ? agent : `@${agent}`;
      const agentName = agentNameMap[agent] || agentNameMap[agent.replace('@', '')] || agent;
      this.observabilityPanel.setCurrentAgent(agentId, agentName, task, `Greenfield: ${task}`);
      this._log(`Greenfield panel updated: agent=${agentId}, task=${task}`);
      this.bobStatusWriter.updateAgent(agentId, agentName, task, `Greenfield: ${task}`).catch((err) => {
        this._log(`BobStatusWriter error: ${err.message}`);
      });
    });

    this.greenfieldHandler.on('terminalSpawn', ({ agent, pid, task }) => {
      this.observabilityPanel.addTerminal(agent, pid, task);
      this._log(`Greenfield panel updated: terminal agent=${agent}, pid=${pid}`);
      this.bobStatusWriter.addTerminal(agent, pid, task).catch((err) => {
        this._log(`BobStatusWriter error: ${err.message}`);
      });
      this.dashboardEmitter.emitBobAgentSpawned(agent, pid, task).catch((err) => {
        this._log(`DashboardEmitter error: ${err.message}`);
      });
    });

    // AC1: Terminal spawn callback
    this.workflowExecutor.onTerminalSpawn((agent, pid, task) => {
      // CLI Panel update (AC1)
      this.observabilityPanel.addTerminal(agent, pid, task);
      this._log(`Panel updated: terminal added agent=${agent}, pid=${pid}, task=${task}`);

      // Dashboard Bridge: bob-status.json update (AC6)
      this.bobStatusWriter.addTerminal(agent, pid, task).catch((err) => {
        this._log(`BobStatusWriter error: ${err.message}`);
      });

      // Dashboard Bridge: WebSocket event (AC7)
      this.dashboardEmitter.emitBobAgentSpawned(agent, pid, task).catch((err) => {
        this._log(`DashboardEmitter error: ${err.message}`);
      });
    });
  }

  /**
   * Resolves the educational mode value (Story 12.7 - AC1, AC2)
   *
   * Priority: session override > user config (L5) > default (false)
   *
   * @returns {boolean} Educational mode value
   * @private
   */
  _resolveEducationalMode() {
    // 1. Check session override (highest priority)
    const sessionOverride = this.sessionState.getSessionOverride('educational_mode');
    if (sessionOverride !== null) {
      this._log(`Educational mode from session override: ${sessionOverride}`);
      return Boolean(sessionOverride);
    }

    // 2. Check user config (L5)
    try {
      const configResult = resolveConfig(this.projectRoot, { skipCache: true });
      if (configResult?.config?.educational_mode !== undefined) {
        this._log(`Educational mode from user config: ${configResult.config.educational_mode}`);
        return Boolean(configResult.config.educational_mode);
      }
    } catch {
      // Config error — fall through to default
    }

    // 3. Default: OFF
    this._log('Educational mode defaulting to false');
    return false;
  }

  /**
   * Checks if a process belongs to the current user (Task #3 - Security)
   * Prevents attempting to kill processes owned by other users
   * @param {string|number} pid - Process ID to check
   * @returns {boolean} True if process belongs to current user
   * @private
   */
  _isProcessOwnedByCurrentUser(pid) {
    try {
      const { execSync } = require('child_process');
      const os = require('os');

      // Get current user's UID
      const currentUid = os.userInfo().uid;

      // Get process owner UID (works on macOS, Linux, WSL)
      const processUidOutput = execSync(`ps -p ${pid} -o uid= 2>/dev/null || true`, {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();

      if (!processUidOutput) {
        // Process doesn't exist or ps failed
        return false;
      }

      const processUid = parseInt(processUidOutput, 10);

      // Only return true if UIDs match
      return processUid === currentUid;
    } catch (err) {
      // Error checking UID - assume not owned for safety
      if (this.options.debug) {
        this._log(`UID check failed for PID ${pid}: ${err.message}`);
      }
      return false;
    }
  }

  /**
   * Cleanup orphan monitor processes from previous sessions (BOB-BUGFIX-1)
   *
   * Detects and terminates monitor-claude-status.sh processes that are orphaned
   * (their parent process no longer exists). This prevents resource waste from
   * crashed or improperly terminated Bob sessions.
   *
   * Task #3 Security: Validates process ownership before kill
   *
   * @private
   */
  _cleanupOrphanMonitors() {
    try {
      const { execSync } = require('child_process');

      // Find all monitor-claude-status.sh processes
      const monitorsOutput = execSync('pgrep -f "monitor-claude-status.sh" 2>/dev/null || true', {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();

      if (!monitorsOutput) {
        return; // No monitors running
      }

      const monitors = monitorsOutput.split('\n').filter(Boolean);
      let cleaned = 0;
      let skipped = 0;

      for (const pid of monitors) {
        if (!pid) continue;

        try {
          // SECURITY: Verify process belongs to current user before attempting kill (Task #3)
          if (!this._isProcessOwnedByCurrentUser(pid)) {
            skipped++;
            if (this.options.debug) {
              this._log(`Skipped monitor ${pid}: not owned by current user (UID mismatch)`);
            }
            continue;
          }

          // Get parent PID
          const ppidOutput = execSync(`ps -p ${pid} -o ppid= 2>/dev/null || true`, {
            encoding: 'utf8',
            timeout: 5000,
          }).trim();

          if (!ppidOutput) continue;

          const ppid = ppidOutput.trim();

          // Check if parent process still exists
          try {
            execSync(`ps -p ${ppid} 2>/dev/null`, {
              timeout: 5000,
            });
            // Parent exists - monitor is valid, skip
          } catch {
            // Parent doesn't exist - orphan detected
            // Safe to kill: ownership already validated
            process.kill(parseInt(pid, 10), 'SIGTERM');
            cleaned++;
            this._log(`Cleaned orphan monitor process: ${pid} (parent ${ppid} dead)`);
          }
        } catch (err) {
          // Error checking this process - skip
          if (this.options.debug) {
            this._log(`Could not check monitor ${pid}: ${err.message}`);
          }
        }
      }

      if (cleaned > 0) {
        this._log(`Cleanup: ${cleaned} orphan monitor processes removed`);
      }
      if (skipped > 0 && this.options.debug) {
        this._log(`Cleanup: ${skipped} monitors skipped (UID mismatch - not owned by current user)`);
      }
    } catch (err) {
      // pgrep failed or no monitors - ignore
      if (this.options.debug) {
        this._log(`Orphan monitor cleanup error: ${err.message}`);
      }
    }
  }

  /**
   * Detects educational mode toggle commands in user input (Story 12.7 - AC5)
   *
   * Supported commands (case-insensitive):
   * - "ativa modo educativo", "ativa educativo", "modo educativo on", "educational mode on"
   * - "desativa modo educativo", "desativa educativo", "modo educativo off", "educational mode off"
   *
   * @param {string} userInput - User input text
   * @returns {Object|null} Toggle result or null if not a toggle command
   * @returns {boolean} result.enable - Whether to enable educational mode
   * @returns {string} result.command - Matched command
   */
  _detectEducationalModeToggle(userInput) {
    if (!userInput || typeof userInput !== 'string') {
      return null;
    }

    const input = userInput.toLowerCase().trim();

    // Disable patterns - check BEFORE enable patterns
    // because "desativa" contains "ativa" and would false-match enable patterns
    const disablePatterns = [
      /desativa\s+modo\s+educativo/,
      /desativa\s+educativo/,
      /modo\s+educativo\s+off/,
      /educational\s+mode\s+off/,
      /disable\s+educational\s+mode/,
      /bob[,\s]+desativa\s+modo\s+educativo/,
      /bob[,\s]+desativa\s+educativo/,
    ];

    // Enable patterns
    const enablePatterns = [
      /(?<![a-z])ativa\s+modo\s+educativo/,
      /(?<![a-z])ativa\s+educativo/,
      /modo\s+educativo\s+on/,
      /educational\s+mode\s+on/,
      /enable\s+educational\s+mode/,
      /bob[,\s]+ativa\s+modo\s+educativo/,
      /bob[,\s]+ativa\s+educativo/,
    ];

    // Check disable patterns first (since "desativa" contains "ativa")
    for (const pattern of disablePatterns) {
      if (pattern.test(input)) {
        return { enable: false, command: input };
      }
    }

    for (const pattern of enablePatterns) {
      if (pattern.test(input)) {
        return { enable: true, command: input };
      }
    }

    return null;
  }

  /**
   * Handles educational mode toggle (Story 12.7 - AC5, AC6)
   *
   * @param {boolean} enable - Whether to enable educational mode
   * @param {string} [persistenceType='session'] - 'session' or 'permanent'
   * @returns {Promise<Object>} Toggle result
   */
  async handleEducationalModeToggle(enable, persistenceType = 'session') {
    this._log(`Handling educational mode toggle: enable=${enable}, persistence=${persistenceType}`);

    // Update internal state
    this.educationalMode = enable;
    this.messageFormatter.setEducationalMode(enable);

    // Update observability panel mode (AC7)
    this.observabilityPanel.setMode(enable ? PanelMode.DETAILED : PanelMode.MINIMAL);

    // Clear/fill tradeoffs based on mode (AC7)
    if (enable) {
      // DETAILED mode: tradeoffs will be populated during execution
      this._log('Educational mode ON: Panel set to DETAILED');
    } else {
      // MINIMAL mode: clear tradeoffs and reasoning
      this.observabilityPanel.updateState({ tradeoffs: [], next_steps: [] });
      this._log('Educational mode OFF: Panel set to MINIMAL, tradeoffs cleared');
    }

    // Persist based on type (AC6)
    if (persistenceType === 'permanent') {
      // Write to user config (L5)
      setUserConfigValue('educational_mode', enable);
      this._log('Educational mode persisted permanently to user config');
    } else {
      // Write to session state
      const sessionExists = await this.sessionState.exists();
      if (sessionExists) {
        await this.sessionState.setSessionOverride('educational_mode', enable);
        this._log('Educational mode persisted to session override');
      }
    }

    // Return formatted feedback
    return {
      success: true,
      educationalMode: enable,
      persistenceType,
      message: this.messageFormatter.formatToggleFeedback(enable),
    };
  }

  /**
   * Gets the persistence prompt for educational mode toggle (Story 12.7 - AC6)
   * @returns {string} Prompt message
   */
  getEducationalModePersistencePrompt() {
    return this.messageFormatter.formatPersistencePrompt();
  }

  /**
   * Main entry point — executes the decision tree and routes to workflow
   *
   * @param {Object} [context] - Optional execution context
   * @param {string} [context.userGoal] - User's stated goal
   * @param {string} [context.storyPath] - Path to story file (if known)
   * @returns {Promise<OrchestrationResult>} Orchestration result
   */
  async orchestrate(context = {}) {
    const resource = 'bob-orchestration';

    // Story 12.7: Detect educational mode toggle BEFORE any routing (AC5)
    // This allows toggle to work regardless of project state
    if (context.userGoal) {
      const toggleResult = this._detectEducationalModeToggle(context.userGoal);
      if (toggleResult !== null) {
        this._log(`Educational mode toggle detected: enable=${toggleResult.enable}`);
        // Return early with toggle prompt for persistence choice
        return {
          success: true,
          projectState: null,
          action: 'educational_mode_toggle',
          data: {
            enable: toggleResult.enable,
            command: toggleResult.command,
            persistencePrompt: this.getEducationalModePersistencePrompt(),
          },
        };
      }
    }

    try {
      // BOB-SAFE-1: Check dependencies on startup
      const depsCheck = await this._checkDependencies();
      if (!depsCheck.healthy) {
        return {
          success: false,
          projectState: null,
          action: 'dependencies_missing',
          error: depsCheck.message,
          missing: depsCheck.missing,
        };
      }

      // Acquire orchestration lock (AC14)
      const lockAcquired = await this.lockManager.acquireLock(resource);
      if (!lockAcquired) {
        return {
          success: false,
          projectState: null,
          action: 'lock_failed',
          error: 'Another Bob orchestration is already running. Wait or check .aios/locks/',
        };
      }

      // Story 12.7: Refresh educational mode from session state after loading (AC2)
      // Session state might have been loaded by previous operations
      this.educationalMode = this._resolveEducationalMode();
      this.messageFormatter.setEducationalMode(this.educationalMode);
      this.observabilityPanel.setMode(this.educationalMode ? PanelMode.DETAILED : PanelMode.MINIMAL);
      this._log(`Educational mode resolved: ${this.educationalMode}`);

      // Story 12.6: Start observability panel (AC1, AC3, AC7)
      this.observabilityPanel.start();
      this._log('Observability panel started');

      // Story 12.6: Initialize Dashboard Bridge (AC6, AC11)
      await this.bobStatusWriter.initialize();
      this._log('Bob status writer initialized');

      // BOB-VETO-3: Load session FIRST to prevent state corruption
      const sessionCheck = await this._checkExistingSession();
      this._log(`Session check complete: hasSession=${sessionCheck.hasSession}`);

      // BOB-SAFE-1: Validate session state schema if session exists
      if (sessionCheck.hasSession && sessionCheck.state) {
        const validation = this._validateSessionStateSchema(sessionCheck.state);
        if (!validation.valid) {
          this._log(`Session state validation failed: ${validation.errors.join(', ')}`, 'error');
          // Discard corrupted session to prevent undefined behavior
          await this.sessionState.clear();
          sessionCheck.hasSession = false;
          this._log('Corrupted session discarded, proceeding as fresh start');
        }
      }

      // BOB-VETO-3: Extract protected files from session
      const protectedFiles = sessionCheck.hasSession && sessionCheck.state
        ? this._extractProtectedFiles(sessionCheck.state)
        : [];

      if (protectedFiles.length > 0) {
        this._log(`Protecting ${protectedFiles.length} session files from cleanup`);
      }

      // BOB-SAFE-1: Check disk space before cleanup/workflow
      const spaceCheck = await this._checkDiskSpace(100);
      if (!spaceCheck.safe) {
        await this.lockManager.releaseLock(resource).catch(() => {});
        return {
          success: false,
          projectState: null,
          action: 'insufficient_disk_space',
          error: spaceCheck.message,
          available: spaceCheck.available,
          required: spaceCheck.required,
        };
      }

      // Story 12.5: Run data lifecycle cleanup WITH protected files (AC8-11)
      const cleanupResult = await this.dataLifecycleManager.runStartupCleanup({
        protectFiles: protectedFiles,
      });
      this._log(`Startup cleanup: ${JSON.stringify(cleanupResult)}`);

      // Step 1: Detect project state (AC3-6)
      const projectState = this.detectProjectState(this.projectRoot);
      this._log(`Detected project state: ${projectState}`);
      if (sessionCheck.hasSession) {
        this._log(`Session found: ${sessionCheck.summary}`);

        // Surface to ask user about resume (AC3)
        const surfaceResult = this.surfaceChecker.shouldSurface({
          valid_options_count: 4,
          options_with_tradeoffs: sessionCheck.summary,
        });

        if (surfaceResult.should_surface) {
          // Story 12.6: Stop panel when returning early (AC7)
          this.observabilityPanel.stop();
          await this.bobStatusWriter.complete().catch(() => {});
          await this.lockManager.releaseLock(resource);
          return {
            success: true,
            projectState,
            action: 'resume_prompt',
            data: {
              surfaceResult,
              resumeOptions: this.sessionState.getResumeOptions(),
              summary: sessionCheck.summary,
              crashInfo: sessionCheck.crashInfo,
              formattedMessage: sessionCheck.formattedMessage,
              cleanupResult,
            },
          };
        }
      }

      // Step 3: Route based on project state (AC7 — codified decision tree)
      const result = await this._routeByState(projectState, context);

      // Story 12.6: Stop observability panel and complete status (AC7)
      this.observabilityPanel.stop();
      await this.bobStatusWriter.complete();
      this._log('Observability panel stopped');

      // Release lock
      await this.lockManager.releaseLock(resource);

      return {
        success: true,
        projectState,
        cleanupResult,
        ...result,
      };
    } catch (error) {
      // Story 12.6: Stop observability panel on error (AC7)
      this.observabilityPanel.stop();
      await this.bobStatusWriter.complete().catch(() => {});

      // Ensure lock is released on error
      await this.lockManager.releaseLock(resource).catch(() => {});

      return {
        success: false,
        projectState: null,
        action: 'error',
        error: `Orchestration failed: ${error.message}`,
      };
    }
  }

  /**
   * Checks for existing session and builds formatted summary (Story 12.5 - AC1, AC2, AC4)
   *
   * @returns {Promise<Object>} Session check result
   * @private
   */
  async _checkExistingSession() {
    // AC1: Check for session state file
    const sessionExists = await this.sessionState.exists();
    if (!sessionExists) {
      return { hasSession: false };
    }

    // AC1: Load session state
    const state = await this.sessionState.loadSessionState();
    if (!state) {
      return { hasSession: false };
    }

    // AC4: Check for crash
    const crashInfo = await this.sessionState.detectCrash();

    // AC2: Calculate elapsed time
    const lastUpdated = new Date(state.session_state.last_updated);
    const now = new Date();
    const elapsedMs = now - lastUpdated;
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    // Format elapsed time string
    let elapsedString;
    if (elapsedDays > 0) {
      elapsedString = `${elapsedDays} dia${elapsedDays > 1 ? 's' : ''}`;
    } else if (elapsedHours > 0) {
      elapsedString = `${elapsedHours} hora${elapsedHours > 1 ? 's' : ''}`;
    } else {
      elapsedString = `${elapsedMinutes} minuto${elapsedMinutes > 1 ? 's' : ''}`;
    }

    // AC2: Build formatted message
    const epicTitle = state.session_state.epic?.title || 'Unknown Epic';
    const currentStory = state.session_state.progress?.current_story || 'N/A';
    const currentPhase = state.session_state.workflow?.current_phase || 'N/A';

    let formattedMessage = `Bem-vindo de volta! Você pausou há ${elapsedString}. Epic: ${epicTitle}, Story: ${currentStory}, Fase: ${currentPhase}`;

    // AC4: Prepend crash warning if detected
    if (crashInfo.isCrash) {
      formattedMessage = `⚠️ Sessão anterior pode ter crashado (última atualização há ${crashInfo.minutesSinceUpdate} min)\n\n${formattedMessage}`;
    }

    return {
      hasSession: true,
      state,
      crashInfo,
      elapsedString,
      formattedMessage,
      summary: this.sessionState.getResumeSummary(),
      epicTitle,
      currentStory,
      currentPhase,
    };
  }

  /**
   * Handles session resume based on user selection (Story 12.5 - AC3, AC7)
   *
   * @param {string} option - Resume option (continue|review|restart|discard)
   * @returns {Promise<Object>} Resume result
   */
  async handleSessionResume(option) {
    this._log(`Handling session resume: ${option}`);

    const result = await this.sessionState.handleResumeOption(option);

    switch (result.action) {
      case 'continue':
        // AC3 [1]: Continue from where user paused
        this._log(`Continuing story ${result.story} from phase ${result.phase}`);
        return {
          success: true,
          action: 'continue',
          storyPath: this._resolveStoryPath(result.story),
          phase: result.phase,
          message: `Continuando story ${result.story} da fase ${result.phase}`,
        };

      case 'review':
        // AC3 [2]: Show details and re-prompt
        return {
          success: true,
          action: 'review',
          summary: result.summary,
          message: 'Detalhes da sessão disponíveis. Escolha uma opção após revisar.',
          needsReprompt: true,
        };

      case 'restart':
        // BOB-VETO-2: Check for uncommitted work before allowing restart
        const workStatus = await this._checkUncommittedWork(result.story);

        if (workStatus.hasChanges) {
          this._log(`Restart blocked: ${workStatus.count} uncommitted files`, 'warn');
          return {
            success: false,
            action: 'restart_blocked',
            data: {
              reason: 'Há trabalho não commitado.',
              vetoCondition: 'uncommitted_changes',
              filesAffected: workStatus.files,
              fileCount: workStatus.count,
              suggestion: 'Commit ou stash suas mudanças antes de restart.',
              story: result.story,
            },
          };
        }

        // AC3 [3]: Reset story (keep epic progress, clear story workflow state)
        this._log(`Restarting story ${result.story} (no uncommitted work)`);
        return {
          success: true,
          action: 'restart',
          storyPath: this._resolveStoryPath(result.story),
          message: `Recomeçando story ${result.story} do início`,
        };

      case 'discard':
        // AC3 [4]: Delete session state and start fresh
        this._log('Session discarded');
        return {
          success: true,
          action: 'discard',
          message: 'Sessão descartada. Pronto para novo épico.',
        };

      default:
        return {
          success: false,
          action: 'unknown',
          error: `Unknown resume option: ${option}`,
        };
    }
  }

  /**
   * Resolves story ID to full path
   * @param {string} storyId - Story ID (e.g., "12.5" or "story-12.5")
   * @returns {string} Full path to story file
   * @private
   */
  _resolveStoryPath(storyId) {
    // Normalize story ID
    const normalizedId = storyId.replace('story-', '').replace('.story', '');

    // Try active stories first
    const activePath = path.join(this.projectRoot, 'docs/stories/active', `${normalizedId}.story.md`);
    if (fs.existsSync(activePath)) {
      return activePath;
    }

    // Try docs/stories root
    const rootPath = path.join(this.projectRoot, 'docs/stories', `${normalizedId}.story.md`);
    if (fs.existsSync(rootPath)) {
      return rootPath;
    }

    // Return best guess path
    return activePath;
  }

  /**
   * Detects the current project state (AC3-6)
   *
   * Decision tree implemented as pure if/else statements (AC7 — no LLM).
   *
   * @param {string} [projectRoot=this.projectRoot] - Project root directory (defaults to instance projectRoot)
   * @returns {string} ProjectState enum value
   */
  detectProjectState(projectRoot = this.projectRoot) {
    // Check 1: Is this a greenfield project? (AC6)
    // No package.json, no .git, no docs/ → brand new project
    const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
    const hasGit = fs.existsSync(path.join(projectRoot, '.git'));
    const hasDocs = fs.existsSync(path.join(projectRoot, 'docs'));

    if (!hasPackageJson && !hasGit && !hasDocs) {
      return ProjectState.GREENFIELD;
    }

    // Check 2: Does config exist? (AC3)
    let configExists = false;
    try {
      const result = resolveConfig(projectRoot, { skipCache: true });
      configExists = result && result.config && Object.keys(result.config).length > 0;
    } catch {
      configExists = false;
    }

    if (!configExists) {
      return ProjectState.NO_CONFIG;
    }

    // Check 3: Does AIOS documentation exist? (AC4, AC5)
    const hasArchDocs = fs.existsSync(path.join(projectRoot, 'docs/architecture'));

    if (!hasArchDocs) {
      return ProjectState.EXISTING_NO_DOCS;
    }

    return ProjectState.EXISTING_WITH_DOCS;
  }

  /**
   * Routes to the appropriate workflow based on project state (AC7)
   *
   * All routing is codified — no LLM reasoning involved.
   *
   * @param {string} projectState - Detected project state
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Route result
   * @private
   */
  async _routeByState(projectState, context) {
    switch (projectState) {
      case ProjectState.NO_CONFIG:
        return this._handleNoConfig(context);

      case ProjectState.EXISTING_NO_DOCS:
        return this._handleBrownfield(context);

      case ProjectState.EXISTING_WITH_DOCS:
        return this._handleExistingProject(context);

      case ProjectState.GREENFIELD:
        return this._handleGreenfield(context);

      default:
        // BOB-VETO-4: Fail-fast on unknown state
        const validStates = Object.values(ProjectState).join(', ');
        const errorMsg =
          `FATAL: Unknown project state '${projectState}'. ` +
          `Valid states: ${validStates}`;

        this._log(errorMsg, 'error');

        throw new Error(errorMsg);
    }
  }

  /**
   * Handles NO_CONFIG state — onboarding or defaults (AC3)
   *
   * Story BOB-VETO-1: Prevents infinite loop by checking if AIOS was already initialized
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleNoConfig(_context) {
    this._log('No config detected');

    // BOB-VETO-1: Check if already initialized to prevent infinite loop
    if (this._isAiosInitialized()) {
      this._log('AIOS directory exists but config missing — repair needed', 'warn');
      return {
        action: 'config_repair',
        data: {
          message: 'AIOS já foi inicializado mas o arquivo de configuração está faltando.',
          nextStep: 'repair_config',
          vetoCondition: 'aios_already_initialized',
        },
      };
    }

    // First time init
    this._log('First time setup — triggering onboarding');
    return {
      action: 'onboarding',
      data: {
        message: 'Projeto sem configuração AIOS detectado. Iniciando onboarding...',
        nextStep: 'run_aios_init',
      },
    };
  }

  /**
   * Checks if AIOS was already initialized (BOB-VETO-1)
   * @returns {boolean} True if .aios directory exists
   * @private
   */
  _isAiosInitialized() {
    const aiosDir = path.join(this.projectRoot, '.aios');
    try {
      return fs.existsSync(aiosDir);
    } catch {
      // Permission denied or other error - assume not initialized
      return false;
    }
  }

  /**
   * Checks for uncommitted changes in working directory (BOB-VETO-2)
   * @param {string} storyId - Story ID (for context logging)
   * @returns {Promise<Object>} Status with hasChanges flag and file list
   * @private
   */
  async _checkUncommittedWork(storyId) {
    try {
      const { execSync } = require('child_process');

      // Get git status
      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        timeout: 5000,
      });

      if (!status.trim()) {
        return { hasChanges: false, files: [] };
      }

      const files = status.trim().split('\n').map((line) => line.trim());

      return {
        hasChanges: true,
        files,
        count: files.length,
      };
    } catch (error) {
      this._log(`Git status check failed: ${error.message}`, 'warn');
      // Fail safe: assume no changes if git check fails (might not be a git repo)
      return { hasChanges: false, files: [], error: error.message };
    }
  }

  /**
   * Extracts list of files to protect from cleanup based on session state (BOB-VETO-3)
   * @param {Object} sessionState - Session state object
   * @returns {string[]} List of file paths to protect
   * @private
   */
  _extractProtectedFiles(sessionState) {
    const files = new Set();

    // Protect files from context snapshot
    if (sessionState.session_state?.context_snapshot?.files_modified) {
      const modified = sessionState.session_state.context_snapshot.files_modified;
      if (Array.isArray(modified)) {
        modified.forEach((f) => files.add(f));
      }
    }

    // Protect workflow artifacts
    if (sessionState.session_state?.workflow?.phase_results) {
      const phaseResults = sessionState.session_state.workflow.phase_results;
      Object.values(phaseResults).forEach((result) => {
        if (result.implementation?.files_created) {
          result.implementation.files_created.forEach((f) => files.add(f));
        }
        if (result.implementation?.files_modified) {
          result.implementation.files_modified.forEach((f) => files.add(f));
        }
      });
    }

    return Array.from(files);
  }

  /**
   * Checks if sufficient disk space is available (BOB-SAFE-1)
   * @param {number} requiredMB - Required space in MB
   * @returns {Promise<Object>} Safety check result
   * @private
   */
  async _checkDiskSpace(requiredMB = 100) {
    try {
      const { execSync } = require('child_process');
      const df = execSync('df -m .', { encoding: 'utf8' });
      const lines = df.trim().split('\n');
      const data = lines[1].split(/\s+/);
      const availableMB = parseInt(data[3], 10);

      if (availableMB < requiredMB) {
        return {
          safe: false,
          reason: 'insufficient_disk_space',
          available: availableMB,
          required: requiredMB,
          message: `Espaço em disco insuficiente. Disponível: ${availableMB}MB, Necessário: ${requiredMB}MB`,
        };
      }

      return { safe: true, available: availableMB };
    } catch (error) {
      // Fail safe: assume space is available if check fails
      this._log(`Disk space check failed: ${error.message}`, 'warn');
      return { safe: true, warning: 'check_failed' };
    }
  }

  /**
   * Validates session state schema integrity (BOB-SAFE-1)
   * @param {Object} sessionState - Session state to validate
   * @returns {Object} Validation result
   * @private
   */
  _validateSessionStateSchema(sessionState) {
    const errors = [];

    // Required top-level fields
    if (!sessionState.session_state) {
      errors.push('Missing session_state object');
    }

    // Required session fields
    const required = ['epic', 'progress', 'workflow', 'last_updated'];
    required.forEach((field) => {
      if (!sessionState.session_state?.[field]) {
        errors.push(`Missing required field: session_state.${field}`);
      }
    });

    // Validate workflow structure
    if (sessionState.session_state?.workflow) {
      if (!sessionState.session_state.workflow.current_phase) {
        errors.push('Missing workflow.current_phase');
      }
      if (!sessionState.session_state.workflow.phase_results) {
        errors.push('Missing workflow.phase_results');
      }
    }

    // Validate last_updated is a valid date
    if (sessionState.session_state?.last_updated) {
      const date = new Date(sessionState.session_state.last_updated);
      if (isNaN(date.getTime())) {
        errors.push('Invalid last_updated timestamp');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Double-checks lock ownership before critical operation (BOB-SAFE-1)
   * @param {string} resource - Resource name
   * @returns {Promise<Object>} Lock verification result
   * @private
   */
  async _verifyLockOwnership(resource) {
    const isOwner = await this.lockManager.isLockOwner(resource);

    if (!isOwner) {
      return {
        verified: false,
        reason: 'lock_lost',
        message: 'Lock foi perdido durante a operação. Outra instância pode estar executando.',
        action: 'abort',
      };
    }

    return { verified: true };
  }

  /**
   * Validates required dependencies are available (BOB-SAFE-1)
   * @returns {Promise<Object>} Dependency check result
   * @private
   */
  async _checkDependencies() {
    const required = ['git', 'node'];
    const missing = [];

    for (const dep of required) {
      try {
        const { execSync } = require('child_process');
        execSync(`which ${dep}`, { stdio: 'ignore' });
      } catch {
        missing.push(dep);
      }
    }

    if (missing.length > 0) {
      return {
        healthy: false,
        missing,
        message: `Dependências faltando: ${missing.join(', ')}`,
      };
    }

    return { healthy: true };
  }

  /**
   * Checks if backup should be suggested before destructive operation (BOB-SAFE-1)
   * @param {string} operation - Operation type (delete, reset, etc)
   * @param {Object} context - Operation context
   * @returns {Object} Backup recommendation
   * @private
   */
  _shouldPromptBackup(operation, context) {
    const destructiveOps = ['delete', 'reset', 'discard', 'force-restart'];

    if (destructiveOps.includes(operation)) {
      // Check if git has uncommitted changes
      const hasUncommitted = context.uncommittedFiles?.length > 0;

      if (hasUncommitted) {
        return {
          recommend: true,
          reason: 'uncommitted_changes',
          message: 'Há mudanças não commitadas. Recomendamos criar um commit antes de prosseguir.',
          severity: 'high',
        };
      }

      return {
        recommend: true,
        reason: 'destructive_operation',
        message: 'Esta operação não pode ser desfeita. Considere criar um backup.',
        severity: 'medium',
      };
    }

    return { recommend: false };
  }

  /**
   * Handles EXISTING_NO_DOCS state — Brownfield Discovery (AC4)
   *
   * Story 12.8: Delegates to BrownfieldHandler for first execution behavior.
   * - AC1: Detects first execution (EXISTING_NO_DOCS state)
   * - AC2: Presents welcome message with time estimate
   * - AC3: Executes brownfield-discovery.yaml workflow
   * - AC4: Generates system-architecture.md and TECHNICAL-DEBT-REPORT.md
   * - AC5: Post-discovery flow (resolve debts vs add feature)
   * - AC6: Idempotent re-execution
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleBrownfield(context) {
    this._log('🔍 First execution detected — project has code but no AIOS docs');

    // Delegate to BrownfieldHandler (Story 12.8 - Task 3.6)
    return this.brownfieldHandler.handle(context);
  }

  /**
   * Handles brownfield user decision (accept/decline analysis)
   *
   * Story 12.8 - AC2: User accepts or declines the brownfield discovery.
   *
   * @param {boolean} accepted - Whether user accepted analysis
   * @param {Object} [context={}] - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handleBrownfieldDecision(accepted, context = {}) {
    this._log(`Brownfield decision: ${accepted ? 'ACCEPTED' : 'DECLINED'}`);
    return this.brownfieldHandler.handleUserDecision(accepted, context);
  }

  /**
   * Handles brownfield phase failure action (retry/skip/abort)
   *
   * Story 12.8 - AC3 Task 3.5: User chooses action on phase failure.
   *
   * @param {string} phase - Failed phase
   * @param {string} action - User action (retry/skip/abort)
   * @param {Object} [context={}] - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handleBrownfieldPhaseFailure(phase, action, context = {}) {
    this._log(`Brownfield phase failure action: ${action} for ${phase}`);
    return this.brownfieldHandler.handlePhaseFailureAction(phase, action, context);
  }

  /**
   * Handles post-discovery choice (resolve debts vs add feature)
   *
   * Story 12.8 - AC5: User chooses next step after discovery.
   *
   * @param {string} choice - User choice (resolve_debts/add_feature)
   * @param {Object} [context={}] - Execution context
   * @returns {Promise<Object>} Routing result
   */
  async handlePostDiscoveryChoice(choice, context = {}) {
    this._log(`Post-discovery choice: ${choice}`);
    return this.brownfieldHandler.handle({ ...context, postDiscoveryChoice: choice });
  }

  /**
   * Handles EXISTING_WITH_DOCS state — ask user goal (AC5)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleExistingProject(context) {
    this._log('Existing project with docs — asking objective');

    // If user already provided a story, execute it directly (AC8-10)
    if (context.storyPath) {
      return this._executeStory(context.storyPath);
    }

    // Surface to ask user what they want to do (AC11)
    const surfaceResult = this.surfaceChecker.shouldSurface({
      valid_options_count: 4,
      options_with_tradeoffs: [
        '1. Feature — Adicionar funcionalidade nova',
        '2. Bug Fix — Corrigir um problema',
        '3. Refactor — Melhorar código existente',
        '4. Tech Debt — Resolver dívida técnica',
      ].join('\n'),
    });

    return {
      action: 'ask_objective',
      data: {
        message: 'Projeto configurado. O que você quer fazer?',
        options: ['feature', 'bug', 'refactor', 'debt'],
        surfaceResult,
      },
    };
  }

  /**
   * Handles GREENFIELD state — delegates to GreenfieldHandler (AC6)
   *
   * Story 12.13: Greenfield Workflow via Bob
   * - AC1: Greenfield detected (no package.json, .git, docs/)
   * - AC2-5: Orchestrates 4 phases via GreenfieldHandler
   * - AC6-10: Integrates with all Epic 11 modules
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleGreenfield(context) {
    this._log('Greenfield project — delegating to greenfield-handler');

    // Delegate to GreenfieldHandler (Story 12.13)
    return this.greenfieldHandler.handle(context);
  }

  /**
   * Handles greenfield surface decision (GO/PAUSE/text input)
   *
   * Story 12.13 - AC11-14: Surface decisions between phases
   *
   * @param {string} decision - User decision
   * @param {number} nextPhase - Next phase number
   * @param {Object} [context={}] - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handleGreenfieldSurfaceDecision(decision, nextPhase, context = {}) {
    this._log(`Greenfield surface decision: ${decision}, next phase: ${nextPhase}`);
    return this.greenfieldHandler.handleSurfaceDecision(decision, nextPhase, context);
  }

  /**
   * Handles greenfield phase failure action (retry/skip/abort)
   *
   * Story 12.13 - AC15: Error handling with Retry/Skip/Abort
   *
   * @param {string} phase - Failed phase
   * @param {string} action - User action (retry/skip/abort)
   * @param {Object} [context={}] - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handleGreenfieldPhaseFailure(phase, action, context = {}) {
    this._log(`Greenfield phase failure: action=${action}, phase=${phase}`);
    return this.greenfieldHandler.handlePhaseFailureAction(phase, action, context);
  }

  /**
   * Executes a story through the development cycle (AC8-10)
   *
   * Delegates to Epic 11 modules:
   * - ExecutorAssignment for agent selection (AC8)
   * - TerminalSpawner for agent spawning (AC9)
   * - WorkflowExecutor for development cycle (AC10)
   *
   * Story 12.5 AC5: Updates session state at each phase transition.
   *
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _executeStory(storyPath) {
    this._log(`Executing story: ${storyPath}`);

    // AC8: Assign executor using story content
    const storyContent = fs.readFileSync(storyPath, 'utf8');
    const assignment = ExecutorAssignment.assignExecutorFromContent(storyContent);
    const storyId = path.basename(storyPath, '.story.md');

    this._log(`Assigned executor: ${assignment.executor}, gate: ${assignment.quality_gate}`);

    // Ensure session state is loaded
    const sessionExists = await this.sessionState.exists();
    if (sessionExists) {
      await this.sessionState.loadSessionState();
    }

    // Story 12.5 AC5: Track validation phase
    await this._updatePhase('validation', storyId, assignment.executor);

    // Story 12.5 AC5: Track development phase
    await this._updatePhase('development', storyId, assignment.executor);

    // AC10: Execute development cycle via WorkflowExecutor
    const result = await this.workflowExecutor.execute(storyPath);

    // Story 12.5 AC5: Track self_healing phase (if applicable)
    if (result.selfHealing) {
      await this._updatePhase('self_healing', storyId, assignment.executor);
    }

    // Story 12.5 AC5: Track quality_gate phase
    await this._updatePhase('quality_gate', storyId, assignment.quality_gate);

    // Story 12.5 AC5: Track push phase (if applicable)
    if (result.success) {
      await this._updatePhase('push', storyId, '@devops');
    }

    // Story 12.5 AC5: Track checkpoint
    await this._updatePhase('checkpoint', storyId, assignment.executor);

    return {
      action: 'story_executed',
      data: {
        assignment,
        result,
        storyPath,
      },
    };
  }

  /**
   * Updates session state for a phase transition (Story 12.5 - AC5)
   *
   * @param {string} phase - Phase name
   * @param {string} storyId - Story ID
   * @param {string} executor - Executor agent
   * @returns {Promise<void>}
   * @private
   */
  async _updatePhase(phase, storyId, executor) {
    try {
      const sessionExists = await this.sessionState.exists();
      if (sessionExists && this.sessionState.state) {
        await this.sessionState.recordPhaseChange(phase, storyId, executor);
        this._log(`Phase updated: ${phase} for ${storyId} by ${executor}`);
      }
    } catch (error) {
      this._log(`Failed to update phase: ${error.message}`);
    }
  }

  /**
   * Debug logger
   * @param {string} message - Log message
   * @private
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[BobOrchestrator] ${message}`);
    }
  }
}

module.exports = {
  BobOrchestrator,
  ProjectState,
};
