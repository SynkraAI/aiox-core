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
      // Acquire orchestration lock (AC14)
      const lockAcquired = await this.lockManager.acquireLock(resource);
      if (!lockAcquired) {
        return {
          success: false,
          projectState: null,
          action: 'lock_failed',
          error: 'Another Bob orchestration is already running. Wait or check .aiox/locks/',
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

      // Story 12.5: Run data lifecycle cleanup BEFORE session check (AC8-11)
      const cleanupResult = await this.dataLifecycleManager.runStartupCleanup();
      this._log(`Startup cleanup: ${JSON.stringify(cleanupResult)}`);

      // Step 1: Detect project state (AC3-6)
      const projectState = this.detectProjectState(this.projectRoot);
      this._log(`Detected project state: ${projectState}`);

      // Story 12.5: Check for existing session with formatted summary (AC1-4)
      const sessionCheck = await this._checkExistingSession();
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
        // AC3 [3]: Reset story (keep epic progress, clear story workflow state)
        this._log(`Restarting story ${result.story}`);
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

    // Check 3: Does AIOX documentation exist? (AC4, AC5)
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
        return {
          action: 'unknown_state',
          error: `Unknown project state: ${projectState}`,
        };
    }
  }

  /**
   * Handles NO_CONFIG state — onboarding or defaults (AC3)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleNoConfig(_context) {
    this._log('No config detected — triggering onboarding');

    return {
      action: 'onboarding',
      data: {
        message: 'Projeto sem configuração AIOX detectado. Iniciando onboarding...',
        nextStep: 'run_aiox_init',
      },
    };
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
    this._log('🔍 First execution detected — project has code but no AIOX docs');

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
