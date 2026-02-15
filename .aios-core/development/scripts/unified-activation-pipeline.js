// SYN-14: Boot time captured before ANY require — measures cold start
const _BOOT_TIME = process.hrtime.bigint();

/**
 * Unified Activation Pipeline - Single Entry Point for All 12 Agents
 *
 * Story ACT-6: Eliminates divergence between Path A (9 agents) and Path B (3 agents)
 * by providing a single activation pipeline with identical context richness for ALL agents.
 *
 * Story ACT-11: Pipeline Performance Optimization & Loader Prioritization
 * - Tiered loading: Critical > High > Best-effort (instead of flat Promise.all)
 * - Per-loader profiling via _profileLoader() with context.metrics output
 * - Partial greeting support (between full and fallback)
 * - Configurable timeout budgets via core-config.yaml and env vars
 * - CoreConfig shared with GreetingBuilder to eliminate double read
 *
 * Story ACT-12: Native Language Delegation
 * - Language handling delegated to Claude Code's native `language` setting in settings.json
 * - Removed language extraction/propagation from pipeline
 * - FALLBACK_PHRASES simplified to single English FALLBACK_PHRASE constant
 *
 * Architecture (ACT-11 Tiered):
 *   Phase 0: Load CoreConfig (shared, fast)
 *   Phase 1 (Critical, 80ms): AgentConfigLoader — greeting is broken without this
 *   Phase 2 (High, parallel with remaining budget): PermissionMode + GitConfigDetector
 *   Phase 3 (Best-effort, parallel with remaining budget): SessionContext + ProjectStatus
 *   Sequential: GreetingPreferenceManager, ContextDetector, WorkflowNavigator
 *   Final: GreetingBuilder.buildGreeting(enrichedContext)
 *
 * Performance Targets (ACT-11):
 *   - Pipeline p50 (warm): <150ms
 *   - Pipeline p95 (cold): <250ms
 *   - Fallback rate: <5%
 *
 * @module development/scripts/unified-activation-pipeline
 * @see greeting-builder.js - Core greeting class
 * @see generate-greeting.js - CLI wrapper (now thin wrapper around this pipeline)
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const yaml = require('js-yaml');

const GreetingBuilder = require('./greeting-builder');
const { AgentConfigLoader } = require('./agent-config-loader');
const SessionContextLoader = require('../../core/session/context-loader');
const { loadProjectStatus } = require('../../infrastructure/scripts/project-status-loader');
const GitConfigDetector = require('../../infrastructure/scripts/git-config-detector');
const { PermissionMode } = require('../../core/permissions');
const GreetingPreferenceManager = require('./greeting-preference-manager');
const ContextDetector = require('../../core/session/context-detector');
const WorkflowNavigator = require('./workflow-navigator');
// BUG-1 fix (INS-1): Graceful degradation when pro-detector is not available
// In installed projects, bin/utils/pro-detector.js does not exist
let isProAvailable, loadProModule;
try {
  ({ isProAvailable, loadProModule } = require('../../../bin/utils/pro-detector'));
} catch {
  isProAvailable = () => false;
  loadProModule = () => null;
}

/**
 * ACT-11: Loader importance tiers with per-tier timeout budgets.
 * Tier 1 (Critical) must complete for a meaningful greeting.
 * Tier 2 (High) adds important visual elements (badge, branch).
 * Tier 3 (Best-effort) adds optional context (status, session).
 * @type {Object}
 */
const LOADER_TIERS = {
  critical: {
    loaders: ['agentConfig'],
    timeout: 80,
    description: 'Agent identity — greeting is broken without this',
  },
  high: {
    loaders: ['permissionMode', 'gitConfig'],
    timeout: 120,
    description: 'Permission badge + branch name — visually degraded without these',
  },
  bestEffort: {
    loaders: ['sessionContext', 'projectStatus'],
    timeout: 180,
    description: 'Session awareness + project status — greeting works fine without these',
  },
};

/**
 * Default total pipeline timeout (ms).
 * Can be overridden via core-config.yaml pipeline.timeout_ms or AIOS_PIPELINE_TIMEOUT env var.
 * @type {number}
 */
const DEFAULT_PIPELINE_TIMEOUT_MS = 500;

/**
 * All 12 supported agent IDs.
 * @type {string[]}
 */
const ALL_AGENT_IDS = [
  'dev', 'qa', 'architect', 'pm', 'po', 'sm',
  'analyst', 'data-engineer', 'ux-design-expert',
  'devops', 'aios-master', 'squad-creator',
];

/**
 * ACT-12: Fallback phrase for minimal greeting (English-only safety net).
 * Language handling is delegated to Claude Code's native `language` setting in settings.json.
 * @type {string}
 */
const FALLBACK_PHRASE = 'Type `*help` to see available commands.';

class UnifiedActivationPipeline {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.greetingBuilder = options.greetingBuilder || new GreetingBuilder();
    this.preferenceManager = options.preferenceManager || new GreetingPreferenceManager();
    this.contextDetector = options.contextDetector || new ContextDetector();
    this.workflowNavigator = options.workflowNavigator || new WorkflowNavigator();
    this.gitConfigDetector = options.gitConfigDetector || new GitConfigDetector();
  }

  /**
   * Static convenience method — creates instance and activates.
   * Allows both `UnifiedActivationPipeline.activate('dev')` and
   * `new UnifiedActivationPipeline().activate('dev')`.
   *
   * @param {string} agentId - Agent identifier (e.g., 'dev', 'qa', 'pm')
   * @param {Object} [options] - Activation options
   * @returns {Promise<{greeting: string, context: Object, duration: number, quality: string, metrics: Object}>}
   */
  static activate(agentId, options = {}) {
    return new UnifiedActivationPipeline().activate(agentId, options);
  }

  /**
   * Activate an agent through the unified pipeline.
   *
   * ACT-11: Uses tiered loading with graceful degradation.
   * Returns 'full', 'partial', or 'fallback' quality level instead of boolean.
   *
   * @param {string} agentId - Agent identifier (e.g., 'dev', 'qa', 'pm')
   * @param {Object} [options] - Activation options
   * @param {Array} [options.conversationHistory] - Conversation history for context detection
   * @returns {Promise<{greeting: string, context: Object, duration: number, quality: string, metrics: Object}>}
   *   greeting - Formatted greeting string ready for display
   *   context  - The enriched context object assembled by the pipeline
   *   duration - Total activation time in ms
   *   quality  - 'full' | 'partial' | 'fallback'
   *   metrics  - Loader timing data
   */
  async activate(agentId, options = {}) {
    const startTime = Date.now();

    try {
      // ACT-11: Load config early for timeout settings
      const coreConfig = await this._loadCoreConfig();
      const pipelineTimeout = this._resolvePipelineTimeout(coreConfig);

      // Race: full pipeline vs timeout (clear timer to prevent leak)
      const { promise: timeoutPromise, timerId } = this._timeoutFallback(agentId, pipelineTimeout);
      const result = await Promise.race([
        this._runPipeline(agentId, options, coreConfig, startTime),
        timeoutPromise,
      ]);
      clearTimeout(timerId);

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      console.warn(`[UnifiedActivationPipeline] Activation failed for ${agentId}:`, error.message);
      const fallbackGreeting = this._generateFallbackGreeting(agentId);
      return {
        greeting: fallbackGreeting,
        context: this._getDefaultContext(agentId),
        duration: Date.now() - startTime,
        quality: 'fallback',
        // ACT-11: backward compat — keep fallback field
        fallback: true,
        metrics: { loaders: {} },
      };
    }
  }

  /**
   * ACT-11: Run the tiered activation pipeline.
   *
   * Instead of flat Promise.all() for all 5 loaders, uses tiered execution:
   * - Tier 1 (Critical): AgentConfigLoader must complete
   * - Tier 2 (High): PermissionMode + GitConfigDetector, best-effort
   * - Tier 3 (Best-effort): SessionContext + ProjectStatus, optional
   *
   * After each tier, remaining budget is checked. Slow lower-tier loaders
   * cannot prevent the greeting from being built with available context.
   *
   * @private
   * @param {string} agentId - Agent identifier
   * @param {Object} options - Activation options
   * @param {Object} coreConfig - Pre-loaded core config (shared, not read again)
   * @returns {Promise<{greeting: string, context: Object, quality: string, metrics: Object}>}
   */
  async _runPipeline(agentId, options = {}, coreConfig = {}, startTime = Date.now()) {
    const pipelineStart = Date.now();
    const metrics = { loaders: {} };

    // --- Tier 1: Critical (AgentConfig) ---
    const tier1Budget = LOADER_TIERS.critical.timeout;
    const agentComplete = await this._profileLoader('agentConfig', metrics, tier1Budget, () => {
      const loader = new AgentConfigLoader(agentId);
      return loader.loadComplete(coreConfig);
    });

    // If Tier 1 failed, we can still build a minimal greeting but mark as fallback
    const agentDefinition = this._buildAgentDefinition(agentId, agentComplete);

    if (!agentComplete) {
      // Tier 1 failure: return fallback greeting
      const greeting = this._generateFallbackGreeting(agentId);
      return {
        greeting,
        context: this._getDefaultContext(agentId),
        quality: 'fallback',
        fallback: true,
        metrics,
      };
    }

    // --- Tier 2: High (PermissionMode + GitConfig) — parallel ---
    const tier2Budget = LOADER_TIERS.high.timeout;
    const elapsedAfterT1 = Date.now() - pipelineStart;
    const tier2Remaining = Math.max(tier2Budget - elapsedAfterT1, 20);

    const [permissionData, gitConfig] = await Promise.all([
      this._profileLoader('permissionMode', metrics, tier2Remaining, async () => {
        const mode = new PermissionMode(this.projectRoot);
        await mode.load();
        return { mode: mode.currentMode, badge: mode.getBadge() };
      }),
      this._profileLoader('gitConfig', metrics, tier2Remaining, () => {
        return this.gitConfigDetector.get();
      }),
    ]);

    // --- Memory Loader (MIS-6): Load agent memories if pro available ---
    let memories = [];
    try {
      if (isProAvailable()) {
        const MemoryLoader = loadProModule('memory/memory-loader');
        if (MemoryLoader) {
          // Check feature gate for memory.extended
          const featureGate = loadProModule('license/feature-gate');
          const isMemoryEnabled = featureGate?.featureGate?.isAvailable('pro.memory.extended') ?? false;

          if (isMemoryEnabled) {
            const memoryBudget = agentComplete?.config?.memoryBudget || 2000;
            const memoryTimeout = 500; // 500ms timeout for memory load

            memories = await this._profileLoader('memories', metrics, memoryTimeout, async () => {
              const loader = new MemoryLoader(this.projectRoot);
              const result = await loader.loadForAgent(agentId, { budget: memoryBudget });
              return result?.memories || [];
            });
          }
        }
      }
    } catch (error) {
      // Graceful degradation: log error but continue with empty memories
      if (metrics?.loaders?.memories) {
        metrics.loaders.memories.error = error.message;
      }
      memories = [];
    }

    // --- Tier 3: Best-effort (SessionContext + ProjectStatus) — parallel ---
    const tier3Budget = LOADER_TIERS.bestEffort.timeout;
    const elapsedAfterT2 = Date.now() - pipelineStart;
    const tier3Remaining = Math.max(tier3Budget - elapsedAfterT2, 20);

    const [sessionContext, projectStatus] = await Promise.all([
      this._profileLoader('sessionContext', metrics, tier3Remaining, () => {
        const loader = new SessionContextLoader();
        return loader.loadContext(agentId);
      }),
      this._profileLoader('projectStatus', metrics, tier3Remaining, () => {
        return loadProjectStatus();
      }),
    ]);

    // --- Sequential steps with data dependencies ---

    // Step 6: Greeting preference (sync, fast)
    // ACT-11: Share coreConfig with GreetingBuilder to avoid double resolveConfig()
    const userProfile = this.greetingBuilder.loadUserProfile(coreConfig);
    const preference = this._resolvePreference(agentDefinition, userProfile);

    // Step 7: Session type detection
    const sessionType = this._detectSessionType(sessionContext, options);

    // Step 8: Workflow state detection
    const workflowState = this._detectWorkflowState(sessionContext, sessionType);

    // --- Assemble enriched context ---
    const enrichedContext = {
      agent: agentDefinition,
      config: agentComplete?.config || {},
      session: sessionContext || this._getDefaultSessionContext(),
      projectStatus: projectStatus || null,
      gitConfig: gitConfig || { configured: false, type: null, branch: null },
      permissions: permissionData || { mode: 'ask', badge: '[Ask]' },
      preference,
      sessionType,
      workflowState,
      userProfile,
      // MIS-6: Agent memories from progressive retrieval
      memories: memories || [],
      // ACT-11: Share coreConfig with GreetingBuilder to eliminate double resolveConfig()
      _coreConfig: coreConfig,
      // Legacy context fields for backward compatibility with GreetingBuilder
      conversationHistory: options.conversationHistory || [],
      lastCommands: sessionContext?.lastCommands || [],
      previousAgent: sessionContext?.previousAgent || null,
      sessionMessage: sessionContext?.message || null,
      workflowActive: sessionContext?.workflowActive || null,
      sessionStory: sessionContext?.currentStory || null,
    };

    // --- Build greeting via GreetingBuilder ---
    const greeting = await this.greetingBuilder.buildGreeting(agentDefinition, enrichedContext);

    // ACT-11: Determine quality level based on what loaded successfully
    const quality = this._determineQuality(metrics);

    // SYN-13: Write active agent to SYNAPSE session (fire-and-forget, 20ms budget)
    this._writeSynapseSession(agentId, quality, metrics);

    // SYN-14: Persist UAP metrics for diagnostics (fire-and-forget)
    this._persistUapMetrics(agentId, quality, metrics, Date.now() - startTime);

    return {
      greeting,
      context: enrichedContext,
      quality,
      // ACT-11: backward compat — fallback is false unless quality is 'fallback'
      fallback: quality === 'fallback',
      metrics,
    };
  }

  /**
   * ACT-11: Profile a loader with timing and status tracking.
   *
   * Wraps a loader function with:
   * - Start/end/duration timing in milliseconds
   * - Status: 'ok' | 'timeout' | 'error'
   * - Per-loader timeout with graceful null return
   *
   * Results are recorded in metrics.loaders[name].
   *
   * @private
   * @param {string} name - Loader name for metrics
   * @param {Object} metrics - Metrics object to populate
   * @param {number} timeoutMs - Timeout budget for this loader
   * @param {Function} loaderFn - Async function that performs the load
   * @returns {Promise<*>} Loaded data or null on failure/timeout
   */
  async _profileLoader(name, metrics, timeoutMs, loaderFn) {
    const start = Date.now();
    let timer;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${name} timeout (${timeoutMs}ms)`)), timeoutMs);
      });
      const result = await Promise.race([
        loaderFn(),
        timeoutPromise,
      ]);
      clearTimeout(timer);
      const duration = Date.now() - start;
      metrics.loaders[name] = { duration, status: 'ok', start, end: start + duration };
      return result;
    } catch (error) {
      clearTimeout(timer);
      const duration = Date.now() - start;
      const status = error.message.includes('timeout') ? 'timeout' : 'error';
      metrics.loaders[name] = { duration, status, start, end: start + duration, error: error.message };
      console.warn(`[UnifiedActivationPipeline] ${name} ${status}: ${error.message}`);
      return null;
    }
  }

  /**
   * ACT-11: Determine greeting quality based on loader results.
   *
   * - 'full': All loaders succeeded (or at least Tier 1 + Tier 2)
   * - 'partial': Tier 1 succeeded but some Tier 2/3 loaders failed
   * - 'fallback': Tier 1 (agentConfig) failed
   *
   * @private
   * @param {Object} metrics - Metrics object with loader results
   * @returns {string} 'full' | 'partial' | 'fallback'
   */
  _determineQuality(metrics) {
    const loaders = metrics.loaders;

    // Tier 1 failure = fallback
    if (!loaders.agentConfig || loaders.agentConfig.status !== 'ok') {
      return 'fallback';
    }

    // Check if any loader failed
    const allLoaderNames = Object.keys(loaders);
    const failedLoaders = allLoaderNames.filter(name => loaders[name].status !== 'ok');

    if (failedLoaders.length === 0) {
      return 'full';
    }

    return 'partial';
  }

  /**
   * Load core configuration from YAML.
   * ACT-11: This is read once and shared with GreetingBuilder and all loaders.
   * @private
   * @returns {Promise<Object>} Core config object
   */
  async _loadCoreConfig() {
    try {
      const configPath = path.join(this.projectRoot, '.aios-core', 'core-config.yaml');
      const content = await fs.readFile(configPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      console.warn('[UnifiedActivationPipeline] Failed to load core config:', error.message);
      return {};
    }
  }

  /**
   * ACT-11: Resolve pipeline timeout from config hierarchy.
   * Priority: AIOS_PIPELINE_TIMEOUT env > core-config.yaml pipeline.timeout_ms > default
   * @private
   * @param {Object} coreConfig - Core config object
   * @returns {number} Pipeline timeout in ms
   */
  _resolvePipelineTimeout(coreConfig) {
    // Env var override (for CI/testing)
    const envTimeout = process.env.AIOS_PIPELINE_TIMEOUT;
    if (envTimeout) {
      const parsed = parseInt(envTimeout, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    // Config override
    const configTimeout = coreConfig?.pipeline?.timeout_ms;
    if (configTimeout && typeof configTimeout === 'number' && configTimeout > 0) {
      return configTimeout;
    }

    return DEFAULT_PIPELINE_TIMEOUT_MS;
  }

  /**
   * Build agent definition from loaded config data.
   * @private
   * @param {string} agentId - Agent ID
   * @param {Object|null} agentComplete - Data from AgentConfigLoader.loadComplete()
   * @returns {Object} Agent definition object suitable for GreetingBuilder
   */
  _buildAgentDefinition(agentId, agentComplete) {
    if (agentComplete && agentComplete.agent) {
      return {
        ...agentComplete.agent,
        id: agentComplete.agent.id || agentId,
        persona_profile: agentComplete.persona_profile || agentComplete.definition?.persona_profile,
        persona: agentComplete.definition?.persona || agentComplete.persona,
        commands: agentComplete.commands || agentComplete.definition?.commands || [],
      };
    }

    // Fallback: minimal agent definition
    return {
      id: agentId,
      name: agentId,
      icon: this._getDefaultIcon(agentId),
      persona_profile: {
        greeting_levels: {
          minimal: `${this._getDefaultIcon(agentId)} ${agentId} Agent ready`,
          named: `${this._getDefaultIcon(agentId)} ${agentId} ready`,
          archetypal: `${this._getDefaultIcon(agentId)} ${agentId} ready`,
        },
      },
      persona: { role: agentId },
      commands: [],
    };
  }

  /**
   * Resolve greeting preference, accounting for bob mode and PM agent.
   * @private
   * @param {Object} agentDefinition - Agent definition
   * @param {string} userProfile - User profile ('bob' | 'advanced')
   * @returns {string} Effective preference
   */
  _resolvePreference(agentDefinition, userProfile) {
    // PM agent bypasses bob mode restriction (PM is primary interface in bob mode)
    const effectiveProfile = (userProfile === 'bob' && agentDefinition.id === 'pm')
      ? 'advanced'
      : userProfile;

    return this.preferenceManager.getPreference(effectiveProfile);
  }

  /**
   * Detect session type from session context.
   * @private
   * @param {Object|null} sessionContext - Session context data
   * @param {Object} options - Activation options
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  _detectSessionType(sessionContext, options) {
    try {
      // If conversation history provided, prefer that
      if (options.conversationHistory && options.conversationHistory.length > 0) {
        return this.contextDetector.detectSessionType(options.conversationHistory);
      }

      // Use pre-detected session type from SessionContextLoader
      if (sessionContext && sessionContext.sessionType) {
        return sessionContext.sessionType;
      }

      // Fallback to file-based detection
      return this.contextDetector.detectSessionType([]);
    } catch (error) {
      console.warn('[UnifiedActivationPipeline] Session type detection failed:', error.message);
      return 'new';
    }
  }

  /**
   * Detect workflow state from session context and session type.
   * Story ACT-5: Relaxed trigger - now detects workflows for any non-new session.
   * @private
   * @param {Object|null} sessionContext - Session context data
   * @param {string} sessionType - Detected session type
   * @returns {Object|null} Workflow state or null
   */
  _detectWorkflowState(sessionContext, sessionType) {
    try {
      if (sessionType === 'new' || !sessionContext) {
        return null;
      }

      const commandHistory = sessionContext.lastCommands || [];
      if (commandHistory.length === 0) {
        return null;
      }

      return this.workflowNavigator.detectWorkflowState(commandHistory, sessionContext);
    } catch (error) {
      console.warn('[UnifiedActivationPipeline] Workflow detection failed:', error.message);
      return null;
    }
  }

  /**
   * Create a timeout promise that resolves with a fallback greeting.
   * ACT-12: Language delegated to Claude Code native settings.json.
   * @private
   * @param {string} agentId - Agent ID
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {{promise: Promise, timerId: NodeJS.Timeout}} Promise and timer ID
   */
  _timeoutFallback(agentId, timeoutMs) {
    let timerId;
    const promise = new Promise((resolve) => {
      timerId = setTimeout(() => {
        console.warn(`[UnifiedActivationPipeline] Pipeline timeout (${timeoutMs}ms) for ${agentId}`);
        resolve({
          greeting: this._generateFallbackGreeting(agentId),
          context: this._getDefaultContext(agentId),
          quality: 'fallback',
          fallback: true,
          metrics: { loaders: {} },
        });
      }, timeoutMs);
    });
    return { promise, timerId };
  }

  /**
   * Generate fallback greeting when pipeline fails.
   * ACT-12: Language delegated to Claude Code native settings.json.
   * Fallback is English-only safety net — Claude Code translates natively.
   * @private
   * @param {string} agentId - Agent ID
   * @returns {string} Simple fallback greeting
   */
  _generateFallbackGreeting(agentId) {
    const icon = this._getDefaultIcon(agentId);
    return `${icon} ${agentId} Agent ready\n\n${FALLBACK_PHRASE}`;
  }

  /**
   * Get default icon for agent.
   * @private
   * @param {string} agentId - Agent ID
   * @returns {string} Default icon emoji
   */
  _getDefaultIcon(agentId) {
    const icons = {
      'dev': '\uD83D\uDCBB',
      'qa': '\uD83D\uDD0D',
      'architect': '\uD83C\uDFD7\uFE0F',
      'pm': '\uD83D\uDCCA',
      'po': '\uD83D\uDCCB',
      'sm': '\uD83C\uDFC3',
      'analyst': '\uD83D\uDD2C',
      'data-engineer': '\uD83D\uDDC4\uFE0F',
      'ux-design-expert': '\uD83C\uDFA8',
      'devops': '\u2699\uFE0F',
      'aios-master': '\uD83D\uDC51',
      'squad-creator': '\uD83D\uDC65',
    };
    return icons[agentId] || '\uD83E\uDD16';
  }

  /**
   * Get default session context when loader fails.
   * @private
   * @returns {Object} Default session context
   */
  _getDefaultSessionContext() {
    return {
      sessionType: 'new',
      message: null,
      previousAgent: null,
      lastCommands: [],
      workflowActive: null,
      currentStory: null,
    };
  }

  /**
   * Get default enriched context when pipeline fails.
   * @private
   * @param {string} agentId - Agent ID
   * @returns {Object} Default context
   */
  _getDefaultContext(agentId) {
    return {
      agent: { id: agentId, name: agentId, icon: this._getDefaultIcon(agentId) },
      config: {},
      session: this._getDefaultSessionContext(),
      projectStatus: null,
      gitConfig: { configured: false, type: null, branch: null },
      permissions: { mode: 'ask', badge: '[Ask]' },
      preference: 'auto',
      sessionType: 'new',
      workflowState: null,
      userProfile: 'advanced',
      // MIS-6: Include memories field in fallback context
      memories: [],
      conversationHistory: [],
      lastCommands: [],
      previousAgent: null,
      sessionMessage: null,
      workflowActive: null,
      sessionStory: null,
    };
  }

  /**
   * SYN-13: Write active agent to SYNAPSE session bridge file.
   *
   * Writes `.synapse/sessions/_active-agent.json` as a singleton file.
   * Uses fs.writeFileSync directly (not updateSession) to avoid prompt_count
   * side effects. Fire-and-forget with try/catch — never blocks activation.
   *
   * @private
   * @param {string} agentId - Agent ID being activated
   * @param {string} quality - Activation quality ('full'|'partial'|'fallback')
   * @param {Object} metrics - Metrics object for profiling
   */
  _writeSynapseSession(agentId, quality, metrics) {
    const start = Date.now();
    try {
      const sessionsDir = path.join(this.projectRoot, '.synapse', 'sessions');
      if (!fsSync.existsSync(path.join(this.projectRoot, '.synapse'))) {
        // .synapse/ does not exist — project may not have SYNAPSE installed
        const duration = Date.now() - start;
        metrics.loaders.synapseSession = { duration, status: 'skipped', start, end: start + duration };
        return;
      }

      if (!fsSync.existsSync(sessionsDir)) {
        fsSync.mkdirSync(sessionsDir, { recursive: true });
      }

      const bridgeData = {
        id: agentId,
        activated_at: new Date().toISOString(),
        activation_quality: quality,
        source: 'uap',
      };

      const bridgePath = path.join(sessionsDir, '_active-agent.json');
      fsSync.writeFileSync(bridgePath, JSON.stringify(bridgeData, null, 2), 'utf8');

      const duration = Date.now() - start;
      metrics.loaders.synapseSession = { duration, status: 'ok', start, end: start + duration };
    } catch (error) {
      const duration = Date.now() - start;
      metrics.loaders.synapseSession = { duration, status: 'error', start, end: start + duration, error: error.message };
      console.warn(`[UnifiedActivationPipeline] SYNAPSE session write failed: ${error.message}`);
    }
  }

  /**
   * SYN-14: Persist UAP metrics to .synapse/metrics/uap-metrics.json.
   * Fire-and-forget — never blocks activation pipeline.
   *
   * @private
   * @param {string} agentId - Agent ID
   * @param {string} quality - Activation quality ('full'|'partial'|'fallback')
   * @param {Object} metrics - Metrics object with loader timings
   * @param {number} totalDuration - Total activation duration in ms
   */
  _persistUapMetrics(agentId, quality, metrics, totalDuration) {
    try {
      const synapsePath = path.join(this.projectRoot, '.synapse');
      if (!fsSync.existsSync(synapsePath)) return;
      const metricsDir = path.join(synapsePath, 'metrics');
      if (!fsSync.existsSync(metricsDir)) {
        fsSync.mkdirSync(metricsDir, { recursive: true });
      }
      const requireChainMs = typeof _BOOT_TIME !== 'undefined'
        ? Number(process.hrtime.bigint() - _BOOT_TIME) / 1e6
        : 0;
      const data = {
        agentId,
        quality,
        totalDuration,
        requireChainMs,
        loaders: {},
        timestamp: new Date().toISOString(),
      };
      for (const [name, info] of Object.entries(metrics.loaders || {})) {
        data.loaders[name] = {
          duration: info.duration || 0,
          status: info.status || 'unknown',
        };
      }
      fsSync.writeFileSync(
        path.join(metricsDir, 'uap-metrics.json'),
        JSON.stringify(data, null, 2), 'utf8',
      );
    } catch {
      // Fire-and-forget: never block the activation pipeline
    }
  }

  /**
   * Get list of all supported agent IDs.
   * @returns {string[]} Array of agent IDs
   */
  static getAllAgentIds() {
    return [...ALL_AGENT_IDS];
  }

  /**
   * Validate that an agent ID is supported.
   * @param {string} agentId - Agent ID to validate
   * @returns {boolean} True if valid
   */
  static isValidAgentId(agentId) {
    return ALL_AGENT_IDS.includes(agentId);
  }
}

module.exports = {
  UnifiedActivationPipeline,
  ALL_AGENT_IDS,
  // ACT-11: Export for testing
  LOADER_TIERS,
  DEFAULT_PIPELINE_TIMEOUT_MS,
  // ACT-12: Single English fallback (language delegated to Claude Code settings.json)
  FALLBACK_PHRASE,
};
