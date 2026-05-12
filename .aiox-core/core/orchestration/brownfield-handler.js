/**
 * Brownfield Handler - Story 12.8
 *
 * Epic 12: Bob Full Integration — Completando o PRD v2.0
 *
 * Handles first execution behavior for existing projects without AIOX documentation.
 * Executes the brownfield-discovery.yaml workflow to analyze the codebase and
 * generate technical debt assessment.
 *
 * Features:
 * - AC1: Detects first execution via EXISTING_NO_DOCS state
 * - AC2: Welcome conversation with time estimate (4-8h)
 * - AC3: Executes brownfield-discovery.yaml via WorkflowExecutor
 * - AC4: Generates system-architecture.md and TECHNICAL-DEBT-REPORT.md
 * - AC5: Post-discovery flow: resolve debts or add feature
 * - AC6: Idempotent re-execution (update, don't duplicate)
 *
 * @module core/orchestration/brownfield-handler
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BROWNFIELD PHASES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Brownfield discovery phases
 * @enum {string}
 */
const BrownfieldPhase = {
  WELCOME: 'welcome',
  SYSTEM_DOCUMENTATION: 'system_documentation',
  DATABASE_DOCUMENTATION: 'database_documentation',
  FRONTEND_DOCUMENTATION: 'frontend_documentation',
  INITIAL_CONSOLIDATION: 'initial_consolidation',
  DATABASE_REVIEW: 'database_specialist_review',
  UX_REVIEW: 'ux_specialist_review',
  QA_REVIEW: 'qa_general_review',
  FINAL_ASSESSMENT: 'final_assessment',
  EXECUTIVE_REPORT: 'executive_awareness_report',
  PLANNING: 'epic_creation',
  COMPLETE: 'complete',
};

/**
 * User decision after discovery
 * @enum {string}
 */
const PostDiscoveryChoice = {
  RESOLVE_DEBTS: 'resolve_debts',
  ADD_FEATURE: 'add_feature',
};

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
//                              BROWNFIELD HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * BrownfieldHandler - Manages first execution behavior for existing projects
 */
class BrownfieldHandler extends EventEmitter {
  /**
   * @param {string} projectRoot - Project root path
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {Object} [options.workflowExecutor] - WorkflowExecutor instance
   * @param {Object} [options.surfaceChecker] - SurfaceChecker instance
   * @param {Object} [options.sessionState] - SessionState instance
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

    // Lazy-loaded dependencies
    this._workflowExecutor = options.workflowExecutor || null;
    this._surfaceChecker = options.surfaceChecker || null;
    this._sessionState = options.sessionState || null;

    // Workflow path
    this.workflowPath = path.join(
      projectRoot,
      '.aiox-core/development/workflows/brownfield-discovery.yaml',
    );

    // Phase progress tracking
    this.phaseProgress = {};

    this._log('BrownfieldHandler initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LAZY DEPENDENCY LOADING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Get WorkflowExecutor instance
   * @private
   */
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

  /**
   * Get SurfaceChecker instance
   * @private
   */
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

  /**
   * Get SessionState instance
   * @private
   */
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
  //                              MAIN HANDLER (AC1-6)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Main entry point - handles brownfield discovery flow
   *
   * @param {Object} context - Execution context
   * @param {Object} [context.techStack] - Detected tech stack
   * @param {boolean} [context.userAccepted] - Whether user accepted analysis
   * @param {string} [context.postDiscoveryChoice] - User choice after discovery
   * @returns {Promise<Object>} Handler result
   */
  async handle(context = {}) {
    this._log('🔍 First execution detected — project has code but no AIOX docs');

    // Step 1: Check if user has already accepted (resuming)
    if (context.userAccepted === true) {
      return this._executeDiscovery(context);
    }

    // Step 2: Check if this is post-discovery routing
    if (context.postDiscoveryChoice) {
      return this._handlePostDiscoveryChoice(context.postDiscoveryChoice, context);
    }

    // Step 3: Present welcome message and ask for acceptance (AC2)
    return this._presentWelcomeMessage(context);
  }

  /**
   * Presents welcome message with time estimate (AC2 - PRD §3.2)
   *
   * @param {Object} context - Execution context
   * @returns {Object} Welcome result with surface prompt
   * @private
   */
  _presentWelcomeMessage(context) {
    this._log('Presenting welcome message for first execution');

    const welcomeMessage = `Bem-vindo! Percebi que é a primeira vez que trabalho neste projeto.
Posso dar uma olhada no que você tem aqui e configurar tudo para a gente
trabalhar bem. Isso leva entre 4-8 horas dependendo do tamanho do projeto.
Quer que eu comece?`;

    // Use SurfaceChecker to determine if we should surface this decision
    const surfaceChecker = this._getSurfaceChecker();
    const surfaceResult = surfaceChecker
      ? surfaceChecker.shouldSurface({
        valid_options_count: 2,
        options_with_tradeoffs: [
          '1. Sim — Iniciar análise completa do projeto (4-8 horas)',
          '2. Não — Pular análise e usar configurações padrão',
        ].join('\n'),
      })
      : { should_surface: true };

    return {
      action: 'brownfield_welcome',
      phase: BrownfieldPhase.WELCOME,
      data: {
        message: welcomeMessage,
        timeEstimate: '4-8 horas',
        options: ['accept', 'decline'],
        surfaceResult,
        context,
      },
    };
  }

  /**
   * Handles user acceptance/decline of brownfield analysis
   *
   * @param {boolean} accepted - Whether user accepted
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handleUserDecision(accepted, context = {}) {
    this._log(`User decision: ${accepted ? 'ACCEPTED' : 'DECLINED'}`);

    if (!accepted) {
      // User declined - route to existing project handler with defaults
      return {
        action: 'brownfield_declined',
        data: {
          message: 'Análise pulada. Usando configurações padrão.',
          nextStep: 'existing_project_defaults',
          context,
        },
      };
    }

    // User accepted - execute discovery workflow
    return this._executeDiscovery({ ...context, userAccepted: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              DISCOVERY EXECUTION (AC3)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Executes the brownfield-discovery.yaml workflow (AC3)
   *
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _executeDiscovery(context) {
    this._log('Starting brownfield discovery workflow execution');

    const workflowExecutor = this._getWorkflowExecutor();
    if (!workflowExecutor) {
      return {
        action: 'brownfield_error',
        error: 'WorkflowExecutor not available',
      };
    }

    // Check if workflow file exists
    if (!fs.existsSync(this.workflowPath)) {
      return {
        action: 'brownfield_error',
        error: `Workflow file not found: ${this.workflowPath}`,
      };
    }

    try {
      // Record phase in session state
      await this._recordPhase(BrownfieldPhase.SYSTEM_DOCUMENTATION, context);

      // Execute workflow
      const result = await workflowExecutor.executeWorkflow(this.workflowPath, {
        projectRoot: this.projectRoot,
        techStack: context.techStack || {},
        onPhaseStart: (phase) => this._onPhaseStart(phase, context),
        onPhaseComplete: (phase, output) => this._onPhaseComplete(phase, output, context),
        onPhaseError: (phase, error) => this._onPhaseError(phase, error, context),
      });

      // Check if workflow completed successfully
      if (result.success) {
        return this._handleDiscoveryComplete(result, context);
      }

      // Workflow failed
      return {
        action: 'brownfield_failed',
        data: {
          result,
          message: 'Brownfield discovery workflow failed',
          canRetry: true,
        },
      };
    } catch (error) {
      this._log(`Discovery execution error: ${error.message}`, 'error');
      return {
        action: 'brownfield_error',
        error: error.message,
        canRetry: true,
      };
    }
  }

  /**
   * Handles phase start event
   * @private
   */
  async _onPhaseStart(phase, context) {
    this._log(`Phase started: ${phase}`);
    this.phaseProgress[phase] = { status: 'in_progress', startTime: Date.now() };

    await this._recordPhase(phase, context);

    this.emit('phaseStart', { phase, context });
  }

  /**
   * Handles phase complete event
   * @private
   */
  async _onPhaseComplete(phase, output, context) {
    this._log(`Phase completed: ${phase}`);
    this.phaseProgress[phase] = {
      ...this.phaseProgress[phase],
      status: 'complete',
      endTime: Date.now(),
      output,
    };

    this.emit('phaseComplete', { phase, output, context });
  }

  /**
   * Handles phase error event (AC3 - Task 3.5)
   *
   * @param {string} phase - Phase that failed
   * @param {Error} error - Error that occurred
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Error handling result with options
   * @private
   */
  async _onPhaseError(phase, error, context) {
    this._log(`Phase failed: ${phase} - ${error.message}`, 'error');
    this.phaseProgress[phase] = {
      ...this.phaseProgress[phase],
      status: 'failed',
      endTime: Date.now(),
      error: error.message,
    };

    this.emit('phaseError', { phase, error, context });

    // Return failure options for user decision
    return {
      action: 'phase_failure',
      phase,
      error: error.message,
      options: [
        { action: PhaseFailureAction.RETRY, label: '1. Tentar novamente' },
        { action: PhaseFailureAction.SKIP, label: '2. Pular esta fase' },
        { action: PhaseFailureAction.ABORT, label: '3. Cancelar discovery' },
      ],
    };
  }

  /**
   * Handles phase failure action from user
   *
   * @param {string} phase - Failed phase
   * @param {string} action - User chosen action (retry/skip/abort)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Next step result
   */
  async handlePhaseFailureAction(phase, action, context = {}) {
    this._log(`Handling phase failure action: ${action} for phase ${phase}`);

    switch (action) {
      case PhaseFailureAction.RETRY:
        this._log(`Retrying phase: ${phase}`);
        return { action: 'retry_phase', phase, context };

      case PhaseFailureAction.SKIP:
        this._log(`Skipping phase: ${phase}`);
        this.phaseProgress[phase] = { ...this.phaseProgress[phase], status: 'skipped' };
        return { action: 'skip_phase', phase, context };

      case PhaseFailureAction.ABORT:
        this._log(`Aborting discovery at phase: ${phase}`);
        return {
          action: 'brownfield_aborted',
          data: {
            message: 'Discovery cancelado pelo usuário',
            lastPhase: phase,
            progress: this.phaseProgress,
          },
        };

      default:
        return { action: 'invalid_action', error: `Unknown action: ${action}` };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              POST-DISCOVERY FLOW (AC4, AC5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Handles discovery complete and presents summary (AC4, AC5)
   *
   * @param {Object} result - Workflow execution result
   * @param {Object} context - Execution context
   * @returns {Object} Summary with next step options
   * @private
   */
  _handleDiscoveryComplete(result, context) {
    this._log('Discovery workflow completed successfully');

    // Build summary from generated outputs
    const summary = this._buildDiscoverySummary();

    // Format summary message (PRD §3.2)
    const summaryMessage = this._formatSummaryMessage(summary);

    // Next step question
    const nextStepQuestion =
      'Quer que eu monte um plano para resolver os débitos primeiro, ou prefere adicionar uma feature nova?';

    return {
      action: 'brownfield_complete',
      phase: BrownfieldPhase.COMPLETE,
      data: {
        summary,
        summaryMessage,
        nextStepQuestion,
        options: [
          {
            choice: PostDiscoveryChoice.RESOLVE_DEBTS,
            label: '1. Resolver débitos técnicos',
          },
          {
            choice: PostDiscoveryChoice.ADD_FEATURE,
            label: '2. Adicionar feature nova',
          },
        ],
        outputs: {
          systemArchitecture: 'docs/architecture/system-architecture.md',
          technicalDebtReport: 'docs/reports/TECHNICAL-DEBT-REPORT.md',
        },
        result,
        context,
      },
    };
  }

  /**
   * Builds summary from generated outputs
   * @private
   */
  _buildDiscoverySummary() {
    const summary = {
      structureOk: false,
      databaseIssues: 0,
      testingConfigured: false,
      estimatedDebt: 'N/A',
      indicators: [],
    };

    // Check for generated files and extract info
    const archPath = path.join(this.projectRoot, 'docs/architecture/system-architecture.md');
    const debtReportPath = path.join(this.projectRoot, 'docs/reports/TECHNICAL-DEBT-REPORT.md');

    if (fs.existsSync(archPath)) {
      summary.structureOk = true;
      summary.indicators.push({ type: 'success', message: 'Estrutura de pastas organizada' });
    }

    if (fs.existsSync(debtReportPath)) {
      try {
        const reportContent = fs.readFileSync(debtReportPath, 'utf8');

        // Extract debt estimate from report (simple regex)
        const debtMatch = reportContent.match(/Custo Estimado[:\s]*R\$\s*([\d.,]+)/i);
        if (debtMatch) {
          summary.estimatedDebt = `R$ ${debtMatch[1]}`;
        }

        // Count issues
        const dbIssuesMatch = reportContent.match(/Database[:\s]*(\d+)\s*(?:issues?|problemas?)/i);
        if (dbIssuesMatch) {
          summary.databaseIssues = parseInt(dbIssuesMatch[1], 10);
        }

        // Check testing
        if (reportContent.includes('testes configurados') || reportContent.includes('tests configured')) {
          summary.testingConfigured = true;
        }
      } catch {
        // Ignore read errors
      }
    }

    // Build indicators based on findings
    if (summary.databaseIssues > 0) {
      summary.indicators.push({
        type: 'warning',
        message: `${summary.databaseIssues} problemas de banco de dados`,
      });
    }

    if (!summary.testingConfigured) {
      summary.indicators.push({
        type: 'warning',
        message: 'Sem testes configurados',
      });
    }

    if (summary.estimatedDebt !== 'N/A') {
      summary.indicators.push({
        type: 'critical',
        message: `${summary.estimatedDebt} estimados em débito técnico`,
      });
    }

    return summary;
  }

  /**
   * Formats summary message with indicators (PRD §3.2)
   * @private
   */
  _formatSummaryMessage(summary) {
    const lines = ['Encontrei algumas coisas:'];

    for (const indicator of summary.indicators) {
      let icon;
      switch (indicator.type) {
        case 'success':
          icon = '✅';
          break;
        case 'warning':
          icon = '⚠️';
          break;
        case 'critical':
          icon = '❌';
          break;
        default:
          icon = '•';
      }
      lines.push(`- ${icon} ${indicator.message}`);
    }

    return lines.join('\n');
  }

  /**
   * Handles post-discovery choice (AC5 - Task 2.6, 2.7)
   *
   * @param {string} choice - User choice (resolve_debts | add_feature)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Routing result
   * @private
   */
  async _handlePostDiscoveryChoice(choice, context) {
    this._log(`Handling post-discovery choice: ${choice}`);

    switch (choice) {
      case PostDiscoveryChoice.RESOLVE_DEBTS:
        // Route to brownfield-create-epic task
        return {
          action: 'route_to_debt_resolution',
          data: {
            message: 'Vou criar um plano para resolver os débitos técnicos.',
            nextStep: 'brownfield_create_epic',
            taskPath: '.aiox-core/development/tasks/brownfield-create-epic.md',
            context,
          },
        };

      case PostDiscoveryChoice.ADD_FEATURE:
        // Route to existing project handler (enhancement workflow)
        return {
          action: 'route_to_enhancement',
          data: {
            message: 'Ok! Vamos adicionar uma feature nova.',
            nextStep: 'existing_project_enhancement',
            context,
          },
        };

      default:
        return {
          action: 'invalid_choice',
          error: `Unknown post-discovery choice: ${choice}`,
        };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              IDEMPOTENCY (AC6)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Checks if output file exists and prepares for idempotent update (AC6)
   *
   * @param {string} outputPath - Path to output file
   * @returns {Object} Idempotency info
   */
  checkIdempotency(outputPath) {
    const fullPath = path.join(this.projectRoot, outputPath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      this._log(`📄 Updating existing ${outputPath} (idempotent re-run)`);
      try {
        const existingContent = fs.readFileSync(fullPath, 'utf8');
        return {
          exists: true,
          existingContent,
          path: fullPath,
        };
      } catch {
        return { exists: true, existingContent: null, path: fullPath };
      }
    }

    return { exists: false, existingContent: null, path: fullPath };
  }

  /**
   * Writes output file idempotently (AC6 - Task 5.3)
   *
   * @param {string} outputPath - Path to output file
   * @param {string} content - Content to write
   * @returns {boolean} Success
   */
  writeOutputIdempotent(outputPath, content) {
    const fullPath = path.join(this.projectRoot, outputPath);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Overwrite (not append) for idempotency
    fs.writeFileSync(fullPath, content, 'utf8');
    this._log(`📄 Wrote ${outputPath}`);

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SESSION STATE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Records phase progress in session state (Task 3.4)
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
        await sessionState.recordPhaseChange(`brownfield_${phase}`, 'brownfield-discovery', '@architect');
        this._log(`Phase recorded in session state: ${phase}`);
      }
    } catch (error) {
      this._log(`Failed to record phase: ${error.message}`, 'warn');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LOGGING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Debug logger
   * @param {string} message - Log message
   * @param {string} [level='info'] - Log level
   * @private
   */
  _log(message, level = 'info') {
    if (this.options.debug || level === 'error' || level === 'warn') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔍';
      console.log(`[BrownfieldHandler] ${prefix} ${message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  BrownfieldHandler,
  BrownfieldPhase,
  PostDiscoveryChoice,
  PhaseFailureAction,
};
