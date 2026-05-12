/**
 * Greeting Builder - Context-Aware Agent Greeting System (Core Logic)
 *
 * ARCHITECTURE NOTE:
 * This is the CORE CLASS that contains all greeting logic.
 * It can be used directly by agents OR via the CLI wrapper (generate-greeting.js).
 *
 * - This file: Core GreetingBuilder class
 * - generate-greeting.js: CLI wrapper that orchestrates context loading
 *
 * Builds intelligent greetings based on:
 * - Session type (new/existing/workflow)
 * - Git configuration status
 * - Project status (natural language narrative)
 * - Command visibility metadata
 * - Previous agent handoff context
 * - Current story and branch references
 *
 * Story ACT-7: Context-Aware Greeting Sections
 * - Section builders receive full enriched context from UnifiedActivationPipeline
 * - Presentation adapts: new=full intro, existing=brief, workflow=focused
 * - Role description references current story and branch
 * - Project status uses natural language narrative
 * - Context section references previous agent handoff intelligently
 * - Footer varies by session context
 * - Parallelizable sections executed with Promise.all()
 * - Fallback to static templates if context loading fails (150ms per section)
 *
 * Used by: Most agents (direct invocation in STEP 3)
 * Also used by: generate-greeting.js (CLI wrapper for @devops, @data-engineer, @ux-design-expert)
 *
 * @see docs/architecture/greeting-system.md for full architecture documentation
 * @see generate-greeting.js for CLI wrapper
 *
 * Performance: <200ms total (hard limit with timeout protection)
 * Fallback: Simple greeting on any error
 */

const ContextDetector = require('../../core/session/context-detector');
const GitConfigDetector = require('../../infrastructure/scripts/git-config-detector');
const WorkflowNavigator = require('./workflow-navigator');
const GreetingPreferenceManager = require('./greeting-preference-manager');
const { loadProjectStatus } = require('../../infrastructure/scripts/project-status-loader');
const { PermissionMode } = require('../../core/permissions');
const { resolveConfig } = require('../../core/config/config-resolver');
const { validateUserProfile } = require('../../infrastructure/scripts/validate-user-profile');
// Story ACT-5: SessionState integration for cross-terminal workflow continuity
const { SessionState } = require('../../core/orchestration/session-state');
// Story ACT-5: SurfaceChecker integration for proactive suggestions
const { SurfaceChecker } = require('../../core/orchestration/surface-checker');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const GREETING_TIMEOUT = 150; // 150ms hard limit per-section
const _TOTAL_GREETING_TIMEOUT = 200; // 200ms total pipeline budget (Story ACT-7, documented constant)
const SECTION_TIMEOUT = 150; // 150ms per section builder (Story ACT-7 AC8)

// Story ACT-2: Validation now delegated to validate-user-profile.js
const DEFAULT_USER_PROFILE = 'advanced';

const GIT_WARNING_TEMPLATE = `
⚠️  **Git Configuration Needed**
   Your project is not connected to a git repository.
   Run \`git init\` and \`git remote add origin <url>\` to enable version control.
`;

class GreetingBuilder {
  constructor() {
    this.contextDetector = new ContextDetector();
    this.gitConfigDetector = new GitConfigDetector();
    this.workflowNavigator = new WorkflowNavigator();
    this.preferenceManager = new GreetingPreferenceManager();
    this.config = this._loadConfig();
  }

  /**
   * Load resolved config once, shared across greeting build.
   * Story ACT-9 QA fix: Eliminates duplicate resolveConfig() calls per greeting build.
   * @returns {Object|null} Resolved config object, or null on failure
   */
  _loadResolvedConfig() {
    try {
      const result = resolveConfig(process.cwd(), { skipCache: true });
      return result?.config || null;
    } catch (error) {
      console.warn('[GreetingBuilder] Failed to load config:', error.message);
      return null;
    }
  }

  /**
   * Load user profile via config-resolver (L5 User layer has highest priority).
   * Story 12.1 - AC3: Uses resolveConfig() to read user_profile from layered hierarchy.
   * Story ACT-2 - AC3: Runs validate-user-profile during activation (not just installation).
   * Reads fresh each time (skipCache: true) to reflect toggle changes immediately.
   * @param {Object} [resolvedConfig] - Pre-loaded config to avoid duplicate resolveConfig() call
   * @returns {string} User profile ('bob' | 'advanced'), defaults to 'advanced'
   */
  loadUserProfile(resolvedConfig) {
    try {
      const config = resolvedConfig || this._loadResolvedConfig();
      const userProfile = config?.user_profile;

      if (!userProfile) {
        return DEFAULT_USER_PROFILE;
      }

      // Story ACT-2 - AC3: Run validation during activation pipeline (graceful)
      const validation = validateUserProfile(userProfile);
      if (!validation.valid) {
        console.warn(`[GreetingBuilder] user_profile validation failed: ${validation.error}`);
        return DEFAULT_USER_PROFILE;
      }
      if (validation.warning) {
        console.warn(`[GreetingBuilder] user_profile warning: ${validation.warning}`);
      }

      return validation.value;
    } catch (error) {
      console.warn('[GreetingBuilder] Failed to load user_profile:', error.message);
      return DEFAULT_USER_PROFILE;
    }
  }

  /**
   * Build contextual greeting for agent
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context
   * @returns {Promise<string>} Formatted greeting
   */
  async buildGreeting(agent, context = {}) {
    const fallbackGreeting = this.buildSimpleGreeting(agent);

    try {
      // ACT-11: Use pre-loaded config from pipeline context to avoid duplicate resolveConfig()
      const resolvedConfig = context._coreConfig || this._loadResolvedConfig();
      // Story ACT-2: Load user profile early so preference manager can account for it
      const userProfile = this.loadUserProfile(resolvedConfig);

      // Check user preference (Story 6.1.4), now profile-aware (Story ACT-2)
      // Story ACT-2: PM agent bypasses bob mode preference restriction because
      // PM is the primary interface in bob mode and needs the full contextual greeting.
      const preference = (userProfile === 'bob' && agent.id === 'pm')
        ? this.preferenceManager.getPreference('advanced')
        : this.preferenceManager.getPreference(userProfile);

      if (preference !== 'auto') {
        // Override with fixed level
        return this.buildFixedLevelGreeting(agent, preference);
      }

      // Use session-aware logic (Story 6.1.2.5)
      // Story ACT-2: Pass pre-loaded userProfile to avoid double loadUserProfile() call
      const greetingPromise = this._buildContextualGreeting(agent, context, userProfile);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Greeting timeout')), GREETING_TIMEOUT),
      );

      return await Promise.race([greetingPromise, timeoutPromise]);
    } catch (error) {
      console.warn('[GreetingBuilder] Fallback to simple greeting:', error.message);
      return fallbackGreeting;
    }
  }

  /**
   * Build contextual greeting (internal implementation)
   * Story 10.3: Profile-aware greeting with conditional agent visibility
   * Story ACT-2: Accepts pre-loaded userProfile to avoid redundant loadUserProfile() calls
   * Story ACT-7: Context-aware sections with parallelization and enriched context
   * Story ACT-12: Language removed — delegated to Claude Code native settings.json
   * @private
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context (may contain pre-loaded values from pipeline)
   * @param {string} [preloadedUserProfile] - Pre-loaded user profile (avoids double call)
   * @returns {Promise<string>} Contextual greeting
   */
  async _buildContextualGreeting(agent, context, preloadedUserProfile) {
    // Use pre-loaded values if available, otherwise load
    const sessionType = context.sessionType || (await this._safeDetectSessionType(context));

    const projectStatus = context.projectStatus || (await this._safeLoadProjectStatus());

    // gitConfig: use from enriched context if available, otherwise load
    const gitConfig = context.gitConfig || (await this._safeCheckGitConfig());

    // Story 10.3 - AC7, AC8: Load user profile fresh each time
    // Story ACT-2: Use pre-loaded value if available to avoid double resolveConfig() call
    const userProfile = preloadedUserProfile || this.loadUserProfile();

    // Story ACT-7 AC1: Build enriched section context for all builders
    const sectionContext = {
      sessionType,
      projectStatus,
      gitConfig,
      userProfile,
      previousAgent: context.previousAgent || null,
      sessionStory: context.sessionStory || null,
      lastCommands: context.lastCommands || [],
      sessionMessage: context.sessionMessage || null,
      workflowState: context.workflowState || null,
      workflowActive: context.workflowActive || null,
      permissions: context.permissions || null,
    };

    // Permission badge: use from enriched context if available, otherwise load
    const permissionBadge = context.permissions?.badge || (await this._safeGetPermissionBadge());

    // Build greeting sections based on session type
    const sections = [];

    // 1. Presentation with permission mode badge (always)
    // Story ACT-7 AC2: Adapts based on session type (new=full, existing=brief, workflow=focused)
    sections.push(this.buildPresentation(agent, sessionType, permissionBadge, sectionContext));

    // 2. Role description (new session only, but skip in bob mode for non-PM)
    // Story ACT-7 AC3: References current story and branch when available
    if (sessionType === 'new' && !(userProfile === 'bob' && agent.id !== 'pm')) {
      sections.push(this.buildRoleDescription(agent, sectionContext));
    }

    // 3. Project status (if git configured, but skip in bob mode for non-PM)
    // Story ACT-7 AC4: Natural language narrative format
    if (gitConfig.configured && projectStatus && !(userProfile === 'bob' && agent.id !== 'pm')) {
      sections.push(this.buildProjectStatus(projectStatus, sessionType, sectionContext));
    }

    // Story 10.3 - AC1, AC4: Bob mode redirect for non-PM agents
    if (userProfile === 'bob' && agent.id !== 'pm') {
      // Show redirect message instead of normal content
      sections.push(this.buildBobModeRedirect(agent));
      return sections.filter(Boolean).join('\n\n');
    }

    // Story ACT-7 AC7: Parallel execution of independent sections
    // Context section and workflow suggestions use different data sources
    const [contextSection, workflowSection] = await Promise.all([
      // 4. Context section (intelligent contextualization + recommendations)
      // Story ACT-7 AC5: References previous agent handoff intelligently
      this._safeBuildSection(() =>
        this.buildContextSection(agent, context, sessionType, projectStatus, sectionContext),
      ),
      // 5. Workflow suggestions (Story ACT-5: relaxed trigger + fixed method call)
      this._safeBuildSection(() => {
        if (sessionType !== 'new') {
          return this.buildWorkflowSuggestions(context);
        }
        return null;
      }),
    ]);

    if (contextSection) {
      sections.push(contextSection);
    }
    if (workflowSection) {
      sections.push(workflowSection);
    }

    // 7. Commands (filtered by visibility and user profile)
    // Story 10.3 - AC2, AC5: Pass userProfile for profile-aware filtering
    const commands = this.filterCommandsByVisibility(agent, sessionType, userProfile);
    sections.push(this.buildCommands(commands, sessionType));

    // 8. Footer with signature
    // Story ACT-7 AC6: Footer varies by session context
    sections.push(this.buildFooter(agent, sectionContext));

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Execute a section builder with timeout protection.
   * Story ACT-7 AC8: Fallback to null if section builder exceeds SECTION_TIMEOUT.
   * @private
   * @param {Function} builderFn - Section builder function (sync or async)
   * @returns {Promise<string|null>} Section result or null on timeout/error
   */
  async _safeBuildSection(builderFn) {
    try {
      const result = builderFn();
      // If the builder returns a promise, race it against the timeout
      if (result && typeof result.then === 'function') {
        return await Promise.race([
          result,
          new Promise((resolve) => setTimeout(() => resolve(null), SECTION_TIMEOUT)),
        ]);
      }
      return result;
    } catch (error) {
      console.warn('[GreetingBuilder] Section builder failed:', error.message);
      return null;
    }
  }

  /**
   * Build fixed-level greeting (Story 6.1.4)
   * ACT-12: Language removed — Claude Code handles translation natively via settings.json
   * @param {Object} agent - Agent definition
   * @param {string} level - Preference level (minimal|named|archetypal)
   * @returns {string} Fixed-level greeting
   */
  buildFixedLevelGreeting(agent, level) {
    const profile = agent.persona_profile;

    if (!profile || !profile.greeting_levels) {
      return this.buildSimpleGreeting(agent);
    }

    // Select greeting based on preference
    let greetingText;
    switch (level) {
      case 'minimal':
        greetingText = profile.greeting_levels.minimal || `${agent.icon} ${agent.id} Agent ready`;
        break;
      case 'named':
        greetingText = profile.greeting_levels.named || `${agent.icon} ${agent.name} ready`;
        break;
      case 'archetypal':
        greetingText =
          profile.greeting_levels.archetypal ||
          `${agent.icon} ${agent.name} the ${profile.archetype} ready`;
        break;
      default:
        greetingText = profile.greeting_levels.named || `${agent.icon} ${agent.name} ready`;
    }

    return `${greetingText}\n\nType \`*help\` to see available commands.`;
  }

  /**
   * Build simple greeting (fallback)
   * ACT-12: Language removed — Claude Code handles translation natively via settings.json
   * @param {Object} agent - Agent definition
   * @returns {string} Simple greeting
   */
  buildSimpleGreeting(agent) {
    const greetingLevels =
      agent.persona_profile?.communication?.greeting_levels ||
      agent.persona_profile?.greeting_levels;
    const greeting = greetingLevels?.named || `${agent.icon} ${agent.name} ready`;
    return `${greeting}\n\nType \`*help\` to see available commands.`;
  }

  /**
   * Build presentation section
   * Story ACT-7 AC2: Adapts based on session type
   *   - new session: full archetypal intro
   *   - existing session: brief "Welcome back" with current focus
   *   - workflow session: focused on workflow state
   * @param {Object} agent - Agent definition
   * @param {string} sessionType - Session type
   * @param {string} permissionBadge - Permission mode badge (optional)
   * @param {Object} [sectionContext] - Enriched section context (Story ACT-7)
   * @returns {string} Presentation text
   */
  buildPresentation(agent, sessionType, permissionBadge = '', sectionContext = null) {
    const profile = agent.persona_profile;

    // Try greeting_levels from communication first, then fall back to top level
    const greetingLevels = profile?.communication?.greeting_levels || profile?.greeting_levels;

    if (!greetingLevels) {
      const base = `${agent.icon} ${agent.name} ready`;
      return permissionBadge ? `${base} ${permissionBadge}` : base;
    }

    // Story ACT-7 AC2: Presentation adapts based on session type
    // ACT-12: Language delegated to Claude Code settings.json — hardcoded English phrases
    let greeting;

    if (sessionType === 'existing' && sectionContext) {
      // Existing session: brief welcome back
      const namedGreeting = greetingLevels.named || `${agent.icon} ${agent.name} ready`;
      const storyRef = sectionContext.sessionStory || sectionContext.projectStatus?.currentStory;
      if (storyRef) {
        greeting = `${namedGreeting} -- continuing ${storyRef}`;
      } else {
        greeting = `${namedGreeting} -- welcome back`;
      }
    } else if (sessionType === 'workflow' && sectionContext) {
      // Workflow session: focused on current workflow
      const namedGreeting = greetingLevels.named || `${agent.icon} ${agent.name} ready`;
      const workflowPhase = sectionContext.workflowState?.currentPhase || sectionContext.workflowActive;
      if (workflowPhase) {
        greeting = `${namedGreeting} -- workflow active`;
      } else {
        greeting = namedGreeting;
      }
    } else {
      // New session or no context: full archetypal greeting
      greeting =
        greetingLevels.archetypal || greetingLevels.named || `${agent.icon} ${agent.name} ready`;
    }

    // Append permission badge if available
    return permissionBadge ? `${greeting} ${permissionBadge}` : greeting;
  }

  /**
   * Build role description section
   * Story ACT-7 AC3: References current story and branch when available.
   * Skipped entirely for returning sessions (too verbose).
   * @param {Object} agent - Agent definition
   * @param {Object} [sectionContext] - Enriched section context (Story ACT-7)
   * @returns {string} Role description
   */
  buildRoleDescription(agent, sectionContext = null) {
    if (!agent.persona || !agent.persona.role) {
      return '';
    }

    let roleText = `**Role:** ${agent.persona.role}`;

    // Story ACT-7 AC3: Append story/branch references when available
    if (sectionContext) {
      const storyRef = sectionContext.sessionStory || sectionContext.projectStatus?.currentStory;
      const branchRef = sectionContext.projectStatus?.branch || sectionContext.gitConfig?.branch;

      const refs = [];
      if (storyRef) {
        refs.push(`Story: ${storyRef}`);
      }
      if (branchRef && branchRef !== 'main' && branchRef !== 'master') {
        refs.push(`Branch: \`${branchRef}\``);
      }

      if (refs.length > 0) {
        roleText += `\n   ${refs.join(' | ')}`;
      }
    }

    return roleText;
  }

  /**
   * Build project status section
   * Story ACT-7 AC4: Natural language narrative format alongside bullet points.
   * @param {Object} projectStatus - Project status data
   * @param {string} sessionType - Session type
   * @param {Object} [sectionContext] - Enriched section context (Story ACT-7)
   * @returns {string} Formatted project status
   */
  buildProjectStatus(projectStatus, sessionType = 'full', sectionContext = null) {
    if (!projectStatus) {
      return '';
    }

    // Story ACT-7 AC4: Use narrative format when enriched context is available
    if (sectionContext) {
      return this._formatProjectStatusNarrative(projectStatus, sessionType);
    }

    // Legacy: bullet-point format (backward compatible)
    const format = sessionType === 'workflow' ? 'condensed' : 'full';
    return this._formatProjectStatus(projectStatus, format);
  }

  /**
   * Format project status as natural language narrative.
   * Story ACT-7 AC4: Instead of bullet points, produce human-readable sentences.
   * Example: "You're on branch `feat/act-7` with 3 modified files. Story ACT-7 is in progress."
   * @private
   * @param {Object} status - Project status
   * @param {string} sessionType - Session type
   * @returns {string} Narrative status
   */
  _formatProjectStatusNarrative(status, sessionType) {
    // Workflow sessions get condensed inline format
    if (sessionType === 'workflow') {
      return this._formatProjectStatus(status, 'condensed');
    }

    const sentences = [];

    // Branch + modified files as natural sentence
    if (status.branch) {
      let branchSentence = `You're on branch \`${status.branch}\``;
      const fileCount = status.modifiedFilesTotalCount || 0;
      if (fileCount > 0) {
        branchSentence += ` with ${fileCount} modified file${fileCount !== 1 ? 's' : ''}`;
      }
      branchSentence += '.';
      sentences.push(branchSentence);
    }

    // Current story as narrative
    if (status.currentStory) {
      sentences.push(`Story **${status.currentStory}** is in progress.`);
    }

    // Recent commits as brief reference
    if (status.recentCommits && status.recentCommits.length > 0) {
      const lastCommit = status.recentCommits[0];
      const commitMsg = typeof lastCommit === 'string' ? lastCommit : lastCommit.message || lastCommit;
      const shortMsg = String(commitMsg).length > 60
        ? String(commitMsg).substring(0, 57) + '...'
        : String(commitMsg);
      sentences.push(`Last commit: "${shortMsg}"`);
    }

    if (sentences.length === 0) {
      return '';
    }

    return `📊 **Project Status:** ${sentences.join(' ')}`;
  }

  /**
   * Format project status (legacy bullet-point format)
   * @private
   * @param {Object} status - Project status
   * @param {string} format - 'full' | 'condensed'
   * @returns {string} Formatted status
   */
  _formatProjectStatus(status, format) {
    if (format === 'condensed') {
      const parts = [];

      if (status.branch) {
        parts.push(`🌿 ${status.branch}`);
      }

      if (status.modifiedFilesTotalCount > 0) {
        parts.push(`📝 ${status.modifiedFilesTotalCount} modified`);
      }

      if (status.currentStory) {
        parts.push(`📖 ${status.currentStory}`);
      }

      return parts.length > 0 ? `📊 ${parts.join(' | ')}` : '';
    }

    // Full format with emojis
    const lines = [];

    if (status.branch) {
      lines.push(`🌿 **Branch:** ${status.branch}`);
    }

    if (status.modifiedFiles && status.modifiedFiles.length > 0) {
      let filesDisplay = status.modifiedFiles.join(', ');
      const totalCount = status.modifiedFilesTotalCount || status.modifiedFiles.length;
      if (totalCount > status.modifiedFiles.length) {
        const remaining = totalCount - status.modifiedFiles.length;
        filesDisplay += ` ...and ${remaining} more`;
      }
      lines.push(`📝 **Modified:** ${filesDisplay}`);
    }

    if (status.recentCommits && status.recentCommits.length > 0) {
      lines.push(`📖 **Recent:** ${status.recentCommits.join(', ')}`);
    }

    if (status.currentStory) {
      lines.push(`📌 **Story:** ${status.currentStory}`);
    }

    if (lines.length === 0) {
      return '';
    }

    return `📊 **Project Status:**\n  - ${lines.join('\n  - ')}`;
  }

  /**
   * Build intelligent context section with recommendations
   * Story ACT-7 AC5: References previous agent handoff intelligently.
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context
   * @param {string} sessionType - Session type
   * @param {Object} projectStatus - Project status
   * @param {Object} [sectionContext] - Enriched section context (Story ACT-7)
   * @returns {string|null} Context section with recommendations
   */
  buildContextSection(agent, context, sessionType, projectStatus, sectionContext = null) {
    // Skip for new sessions
    if (sessionType === 'new') {
      return null;
    }

    const parts = [];

    // Build intelligent context narrative
    const contextNarrative = this._buildContextNarrative(agent, context, projectStatus);

    if (contextNarrative.description) {
      parts.push(`💡 **Context:** ${contextNarrative.description}`);
    }

    // Story ACT-7 AC5: Add handoff context when previous agent is detected
    if (sectionContext && sectionContext.previousAgent && !contextNarrative.description) {
      const prevName = this._getPreviousAgentName(context);
      if (prevName) {
        parts.push(`💡 **Context:** Picked up from @${prevName}'s session`);
      }
    }

    if (contextNarrative.recommendedCommand) {
      parts.push(`   **Recommended:** Use \`${contextNarrative.recommendedCommand}\` to continue`);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  /**
   * Build intelligent context narrative based on previous work
   * Analyzes files, story, and previous agent to create rich context
   * @private
   */
  _buildContextNarrative(agent, context, projectStatus) {
    const prevAgentId = this._getPreviousAgentId(context);
    const prevAgentName = this._getPreviousAgentName(context);

    // Priority 1: Agent transition + Story + Modified files (richest context)
    if (prevAgentId && projectStatus?.modifiedFiles) {
      // Use session story if available (more accurate), otherwise use git story
      const sessionStory = context.sessionStory || projectStatus.currentStory;
      const storyContext = this._analyzeStoryContext({
        ...projectStatus,
        currentStory: sessionStory,
      });
      const fileContext = this._analyzeModifiedFiles(projectStatus.modifiedFiles, sessionStory);

      let description = `Vejo que @${prevAgentName} finalizou os ajustes`;

      if (fileContext.keyFiles.length > 0) {
        description += ` ${fileContext.summary}`;
      }

      if (storyContext.storyFile) {
        description += ` no **\`${storyContext.storyFile}\`**`;
      }

      description += `. Agora podemos ${this._getAgentAction(agent.id, storyContext)}`;

      const recommendedCommand = this._suggestCommand(agent.id, prevAgentId, storyContext);

      return { description, recommendedCommand };
    }

    // Priority 2: Agent transition + Story (no file details)
    if (
      prevAgentId &&
      projectStatus?.currentStory &&
      projectStatus.currentStory !== 'EPIC-SPLIT-IMPLEMENTATION-COMPLETE'
    ) {
      const storyContext = this._analyzeStoryContext(projectStatus);
      const description = `Continuando do trabalho de @${prevAgentName} em ${projectStatus.currentStory}. ${this._getAgentAction(agent.id, storyContext)}`;
      const recommendedCommand = this._suggestCommand(agent.id, prevAgentId, storyContext);

      return { description, recommendedCommand };
    }

    // Priority 3: Just agent transition
    if (prevAgentId) {
      const description = `Continuing from @${prevAgentName}`;
      const recommendedCommand = this._suggestCommand(agent.id, prevAgentId, {});

      return { description, recommendedCommand };
    }

    // Priority 4: Story-based context
    if (
      projectStatus?.currentStory &&
      projectStatus.currentStory !== 'EPIC-SPLIT-IMPLEMENTATION-COMPLETE'
    ) {
      const storyContext = this._analyzeStoryContext(projectStatus);
      const description = `Working on ${projectStatus.currentStory}`;
      const recommendedCommand = this._suggestCommand(agent.id, null, storyContext);

      return { description, recommendedCommand };
    }

    // Priority 5: Last command context
    if (context.lastCommands && context.lastCommands.length > 0) {
      const lastCmd = context.lastCommands[context.lastCommands.length - 1];
      const cmdName = typeof lastCmd === 'object' ? lastCmd.command : lastCmd;
      const description = `Last action: *${cmdName}`;

      return { description, recommendedCommand: null };
    }

    // Priority 6: Session message
    if (context.sessionMessage) {
      return { description: context.sessionMessage, recommendedCommand: null };
    }

    return { description: null, recommendedCommand: null };
  }

  _getPreviousAgentId(context) {
    if (!context.previousAgent) return null;
    return typeof context.previousAgent === 'string'
      ? context.previousAgent
      : context.previousAgent.agentId;
  }

  _getPreviousAgentName(context) {
    if (!context.previousAgent) return null;
    return typeof context.previousAgent === 'string'
      ? context.previousAgent
      : context.previousAgent.agentName || context.previousAgent.agentId;
  }

  _analyzeStoryContext(projectStatus) {
    const currentStory = projectStatus.currentStory || '';
    const storyFile = currentStory ? `${currentStory}.md` : null;

    return {
      storyId: currentStory,
      storyFile: storyFile,
      hasStory: !!currentStory && currentStory !== 'EPIC-SPLIT-IMPLEMENTATION-COMPLETE',
    };
  }

  _analyzeModifiedFiles(modifiedFiles, _currentStory) {
    if (!modifiedFiles || modifiedFiles.length === 0) {
      return { keyFiles: [], summary: '' };
    }

    const keyFiles = [];
    const patterns = [
      {
        regex: /greeting-builder\.js/,
        priority: 1,
        desc: 'do **`.aiox-core/scripts/greeting-builder.js`**',
        category: 'script',
      },
      {
        regex: /agent-config-loader\.js/,
        priority: 1,
        desc: 'do **`agent-config-loader.js`**',
        category: 'script',
      },
      {
        regex: /generate-greeting\.js/,
        priority: 1,
        desc: 'do **`generate-greeting.js`**',
        category: 'script',
      },
      {
        regex: /session-context-loader\.js/,
        priority: 1,
        desc: 'do **`session-context-loader.js`**',
        category: 'script',
      },
      {
        regex: /agents\/.*\.md/,
        priority: 1,
        desc: 'das definições de agentes',
        category: 'agent',
      },
      { regex: /\.md$/, priority: 2, desc: 'dos arquivos de documentação', category: 'doc' },
    ];

    // Find matching key files (avoid duplicates)
    const seenCategories = new Set();
    for (const file of modifiedFiles.slice(0, 5)) {
      // Check first 5 files
      for (const pattern of patterns) {
        if (pattern.regex.test(file) && !seenCategories.has(pattern.category)) {
          keyFiles.push({
            file,
            desc: pattern.desc,
            priority: pattern.priority,
            category: pattern.category,
          });
          seenCategories.add(pattern.category);
          break;
        }
      }
    }

    // Sort by priority and take top 2
    keyFiles.sort((a, b) => a.priority - b.priority);
    const topFiles = keyFiles.slice(0, 2);

    if (topFiles.length === 0) {
      return { keyFiles: [], summary: 'dos arquivos do projeto' };
    }

    if (topFiles.length === 1) {
      return { keyFiles: topFiles, summary: topFiles[0].desc };
    }

    return {
      keyFiles: topFiles,
      summary: `${topFiles[0].desc} e ${topFiles[1].desc}`,
    };
  }

  _getAgentAction(agentId, _storyContext) {
    const actions = {
      qa: 'revisar a qualidade dessa implementação',
      dev: 'implementar as funcionalidades',
      pm: 'sincronizar o progresso',
      po: 'validar os requisitos',
      sm: 'coordenar o desenvolvimento',
    };

    return actions[agentId] || 'continuar o trabalho';
  }

  _suggestCommand(agentId, prevAgentId, storyContext) {
    // Agent transition commands
    if (prevAgentId === 'dev' && agentId === 'qa') {
      return storyContext.storyFile ? `*review ${storyContext.storyFile}` : '*review';
    }

    if (prevAgentId === 'qa' && agentId === 'dev') {
      return '*apply-qa-fixes';
    }

    if (prevAgentId === 'po' && agentId === 'dev') {
      return '*develop-yolo';
    }

    // Role-based commands when no previous agent
    if (agentId === 'qa' && storyContext.storyFile) {
      return `*review ${storyContext.storyFile}`;
    }

    if (agentId === 'dev' && storyContext.hasStory) {
      return '*develop-yolo docs/stories/[story-path].md';
    }

    if (agentId === 'pm' && storyContext.storyId) {
      return `*sync-story ${storyContext.storyId}`;
    }

    return null;
  }

  /**
   * Build current context section (legacy - kept for compatibility)
   * @param {Object} context - Session context
   * @param {string} sessionType - Session type
   * @param {Object} projectStatus - Project status
   * @returns {string} Context description
   */
  buildCurrentContext(context, sessionType, projectStatus) {
    if (sessionType === 'workflow' && projectStatus?.currentStory) {
      return `📌 **Context:** Working on ${projectStatus.currentStory}`;
    }

    if (context.lastCommand) {
      return `📌 **Last Action:** ${context.lastCommand}`;
    }

    return '';
  }

  /**
   * Build workflow suggestions section
   * Story ACT-5: Enhanced with SessionState integration for cross-terminal
   * workflow continuity and SurfaceChecker for proactive suggestions.
   *
   * Detection priority:
   *   1. SessionState (cross-terminal persistence from Epic 11 Story 11.5)
   *   2. Command history (pattern-based detection from workflow-patterns.yaml)
   *
   * @param {Object} context - Session context
   * @returns {string|null} Workflow suggestions or null
   */
  buildWorkflowSuggestions(context) {
    try {
      // Story ACT-5 (AC: 3, 6): Check SessionState first for cross-terminal continuity
      const sessionStateResult = this._detectWorkflowFromSessionState();
      if (sessionStateResult) {
        return sessionStateResult;
      }

      // Fallback: Pattern-based detection from command history
      const commandHistory = context.commandHistory || context.lastCommands || [];
      const workflowState = this.workflowNavigator.detectWorkflowState(commandHistory, context);

      if (!workflowState) {
        return null;
      }

      const suggestions = this.workflowNavigator.suggestNextCommands(workflowState);
      if (!suggestions || suggestions.length === 0) {
        return null;
      }

      // Story ACT-5 (AC: 4): Enhance suggestions with SurfaceChecker proactive triggers
      const enhancedSuggestions = this._enhanceSuggestionsWithSurface(suggestions, context);

      const greetingMessage = this.workflowNavigator.getGreetingMessage(workflowState);
      const header = greetingMessage || 'Next steps:';

      return this.workflowNavigator.formatSuggestions(enhancedSuggestions, header);
    } catch (error) {
      console.warn('[GreetingBuilder] Workflow suggestions failed:', error.message);
      return null;
    }
  }

  /**
   * Detect workflow state from SessionState for cross-terminal continuity.
   * Story ACT-5 (AC: 3, 6): Reads persisted session state to detect
   * active workflows that span terminal sessions.
   * @private
   * @returns {string|null} Formatted workflow section or null
   */
  _detectWorkflowFromSessionState() {
    try {
      const projectRoot = process.cwd();
      const sessionState = new SessionState(projectRoot);

      // Use synchronous existence check to stay within perf budget
      const stateFilePath = sessionState.getStateFilePath();
      if (!fs.existsSync(stateFilePath)) {
        return null;
      }

      // Read and parse state file synchronously (fast, local file)
      const content = fs.readFileSync(stateFilePath, 'utf8');
      const stateData = yaml.load(content);

      if (!stateData?.session_state) {
        return null;
      }

      const ss = stateData.session_state;

      // Only show if there is an active workflow with a current story
      if (!ss.progress?.current_story || !ss.workflow?.current_phase) {
        return null;
      }

      // Build suggestions from session state
      const suggestions = [];
      const currentStory = ss.progress.current_story;
      const currentPhase = ss.workflow.current_phase;
      const storiesDone = ss.progress.stories_done?.length || 0;
      const totalStories = ss.epic?.total_stories || 0;

      suggestions.push({
        command: `*develop-yolo ${currentStory}`,
        description: `Continue ${currentStory} (phase: ${currentPhase})`,
        raw_command: 'develop-yolo',
        args: currentStory,
      });

      if (storiesDone > 0 && totalStories > 0) {
        suggestions.push({
          command: `*build-status ${currentStory}`,
          description: `Check build status (${storiesDone}/${totalStories} stories done)`,
          raw_command: 'build-status',
          args: currentStory,
        });
      }

      const header = `Workflow in progress: ${ss.epic?.title || 'Active Epic'} (${storiesDone}/${totalStories})`;
      return this.workflowNavigator.formatSuggestions(suggestions, header);
    } catch (error) {
      // Graceful degradation: if SessionState is unavailable, return null
      console.warn('[GreetingBuilder] SessionState workflow detection failed:', error.message);
      return null;
    }
  }

  /**
   * Enhance workflow suggestions with SurfaceChecker proactive triggers.
   * Story ACT-5 (AC: 4): Uses surface conditions to add relevant
   * proactive suggestions (e.g., cost warnings, risk alerts).
   * @private
   * @param {Array} suggestions - Base suggestions from WorkflowNavigator
   * @param {Object} context - Session context
   * @returns {Array} Enhanced suggestions array
   */
  _enhanceSuggestionsWithSurface(suggestions, context) {
    try {
      const checker = new SurfaceChecker();
      if (!checker.load()) {
        return suggestions; // Graceful: criteria file not found
      }

      // Build surface context from session data
      const surfaceContext = {
        risk_level: context.riskLevel || 'LOW',
        errors_in_task: context.errorsInTask || 0,
        action_type: context.actionType || null,
      };

      const result = checker.shouldSurface(surfaceContext);

      if (result.should_surface && result.message) {
        // Prepend a proactive warning suggestion
        return [
          {
            command: '*help',
            description: `[${result.severity}] ${result.message}`,
            raw_command: 'help',
            args: '',
          },
          ...suggestions,
        ];
      }

      return suggestions;
    } catch (error) {
      // Graceful degradation: SurfaceChecker unavailable, return original suggestions
      console.warn('[GreetingBuilder] SurfaceChecker enhancement failed:', error.message);
      return suggestions;
    }
  }

  /**
   * Build contextual suggestions based on project state
   * Analyzes current context and suggests relevant next commands
   * @param {Object} agent - Agent definition
   * @param {Object} projectStatus - Project status data
   * @param {string} sessionType - Session type
   * @returns {string|null} Contextual suggestions or null
   */
  buildContextualSuggestions(agent, projectStatus, _sessionType) {
    try {
      const suggestions = [];
      const agentId = agent.id;

      // Analyze current story status
      if (projectStatus.currentStory) {
        const storyMatch = projectStatus.currentStory.match(/(\d+\.\d+\.\d+(\.\d+)?)/);
        const storyId = storyMatch ? storyMatch[1] : null;

        // QA agent: suggest validation if story is ready
        if (
          agentId === 'qa' &&
          projectStatus.recentCommits &&
          projectStatus.recentCommits.length > 0
        ) {
          const recentCommit = projectStatus.recentCommits[0].message;
          if (recentCommit.includes('complete') || recentCommit.includes('implement')) {
            if (storyId) {
              suggestions.push(`*review ${storyId}`);
            } else {
              suggestions.push('*code-review committed');
            }
          }
        }

        // Dev agent: suggest development tasks
        if (agentId === 'dev' && storyId) {
          if (projectStatus.modifiedFilesTotalCount > 0) {
            suggestions.push('*run-tests');
          }
          suggestions.push(`*develop-story ${storyId}`);
        }

        // PM/PO: suggest story/epic management
        if ((agentId === 'pm' || agentId === 'po') && storyId) {
          suggestions.push(`*validate-story-draft ${storyId}`);
        }
      }

      // Analyze modified files
      if (projectStatus.modifiedFilesTotalCount > 0) {
        if (agentId === 'qa') {
          suggestions.push('*code-review uncommitted');
        }
        if (agentId === 'dev' && projectStatus.modifiedFilesTotalCount > 5) {
          suggestions.push('*commit-changes');
        }
      }

      // Analyze recent work
      if (projectStatus.recentCommits && projectStatus.recentCommits.length > 0) {
        const lastCommit = projectStatus.recentCommits[0].message;

        // If last commit was a test, suggest review
        if (lastCommit.includes('test') && agentId === 'qa') {
          suggestions.push('*run-tests');
        }

        // If last commit was a feature, suggest QA
        if ((lastCommit.includes('feat:') || lastCommit.includes('feature')) && agentId === 'qa') {
          suggestions.push('*code-review committed');
        }
      }

      // No suggestions found
      if (suggestions.length === 0) {
        return null;
      }

      // Build suggestion message
      const contextSummary = this._buildContextSummary(projectStatus);
      const commandsList = suggestions
        .slice(0, 2) // Limit to 2 suggestions
        .map((cmd) => `   - \`${cmd}\``)
        .join('\n');

      return `💡 **Context:** ${contextSummary}\n\n**Suggested Next Steps:**\n${commandsList}`;
    } catch (error) {
      console.warn('[GreetingBuilder] Contextual suggestions failed:', error.message);
      return null;
    }
  }

  /**
   * Build context summary based on project status
   * @private
   * @param {Object} projectStatus - Project status data
   * @returns {string} Context summary
   */
  _buildContextSummary(projectStatus) {
    const parts = [];

    if (projectStatus.currentStory) {
      parts.push(`Working on ${projectStatus.currentStory}`);
    }

    if (projectStatus.modifiedFilesTotalCount > 0) {
      parts.push(`${projectStatus.modifiedFilesTotalCount} files modified`);
    }

    if (projectStatus.recentCommits && projectStatus.recentCommits.length > 0) {
      const lastCommit = projectStatus.recentCommits[0].message;
      const shortMsg = lastCommit.length > 50 ? lastCommit.substring(0, 47) + '...' : lastCommit;
      parts.push(`Last: "${shortMsg}"`);
    }

    return parts.join(', ') || 'Ready to start';
  }

  /**
   * Build commands section
   * @param {Array} commands - Filtered commands
   * @param {string} sessionType - Session type
   * @returns {string} Commands list
   */
  buildCommands(commands, sessionType) {
    if (!commands || commands.length === 0) {
      return '**Commands:** Type `*help` for available commands';
    }

    const header = this._getCommandsHeader(sessionType);
    const commandList = commands
      .slice(0, 12) // Max 12 commands
      .map((cmd) => {
        // Handle both object format and string format
        if (typeof cmd === 'string') {
          return `   - \`*${cmd}\``;
        }
        if (typeof cmd === 'object' && cmd !== null) {
          const name = cmd.name || cmd.command || String(cmd);
          const description = cmd.description || '';
          return description ? `   - \`*${name}\`: ${description}` : `   - \`*${name}\``;
        }
        // Fallback for unexpected formats
        return `   - \`*${String(cmd)}\``;
      })
      .filter((cmd) => !cmd.includes('[object Object]')) // Filter out malformed commands
      .join('\n');

    return `**${header}:**\n${commandList}`;
  }

  /**
   * Get commands header based on session type
   * @private
   * @param {string} sessionType - Session type
   * @returns {string} Header text
   */
  _getCommandsHeader(sessionType) {
    switch (sessionType) {
      case 'new':
        return 'Available Commands';
      case 'existing':
        return 'Quick Commands';
      case 'workflow':
        return 'Key Commands';
      default:
        return 'Commands';
    }
  }

  /**
   * Build bob mode redirect message for non-PM agents
   * Story 10.3 - AC4: Show informative message redirecting to Bob
   * @param {Object} agent - Agent definition (used for personalization)
   * @returns {string} Redirect message
   */
  buildBobModeRedirect(agent) {
    const agentName = agent?.name || 'Este agente';
    return `💡 **Você está no Modo Assistido.**

${agentName} não está disponível diretamente no Modo Assistido.
Use \`@pm\` (Bob) para todas as interações. Bob vai orquestrar os outros agentes internamente para você.

**Para interagir com Bob:**
   - Digite \`@pm\` ou \`/AIOX:agents:pm\`
   - Use \`*help\` após ativar Bob para ver comandos disponíveis`;
  }

  /**
   * Build footer section
   * Story ACT-7 AC6: Footer varies by session context.
   *   - new session: full guide prompt + signature
   *   - existing session: brief tip + signature
   *   - workflow session: progress note + signature
   * @param {Object} agent - Agent definition
   * @param {Object} [sectionContext] - Enriched section context (Story ACT-7)
   * @returns {string} Footer text with signature
   */
  buildFooter(agent, sectionContext = null) {
    const parts = [];

    // Story ACT-7 AC6: Vary footer content by session context
    // ACT-12: Language delegated to Claude Code settings.json — hardcoded English phrases
    const sessionType = sectionContext?.sessionType || 'new';

    if (sessionType === 'workflow') {
      // Workflow: progress note
      const storyRef = sectionContext?.sessionStory || sectionContext?.projectStatus?.currentStory;
      if (storyRef) {
        parts.push(`Focused on **${storyRef}**. Type \`*help\` to see available commands.`);
      } else {
        parts.push('Workflow active. Type `*help` to see available commands.');
      }
    } else if (sessionType === 'existing') {
      // Existing session: brief tip with session-info reference
      parts.push('Type `*help` for commands or `*session-info` for session details.');
    } else {
      // New session: full guide prompt
      parts.push('Type `*guide` for comprehensive usage instructions.');
    }

    // Add agent signature if available
    if (
      agent &&
      agent.persona_profile &&
      agent.persona_profile.communication &&
      agent.persona_profile.communication.signature_closing
    ) {
      parts.push('');
      parts.push(agent.persona_profile.communication.signature_closing);
    }

    return parts.join('\n');
  }

  /**
   * Build git warning section
   * @returns {string} Git warning message
   */
  buildGitWarning() {
    return GIT_WARNING_TEMPLATE.trim();
  }

  /**
   * Filter commands by visibility metadata and user profile
   * Story 10.3 - AC1, AC2, AC3: Profile-aware command filtering
   * @param {Object} agent - Agent definition
   * @param {string} sessionType - Session type
   * @param {string} userProfile - User profile ('bob' | 'advanced')
   * @returns {Array} Filtered commands
   */
  filterCommandsByVisibility(agent, sessionType, userProfile = DEFAULT_USER_PROFILE) {
    if (!agent.commands || agent.commands.length === 0) {
      return [];
    }

    // Story 10.3 - AC1, AC2: Profile-based filtering
    // If bob mode AND not PM agent: return empty (will show redirect message instead)
    if (userProfile === 'bob' && agent.id !== 'pm') {
      return [];
    }

    // Story 10.3 - AC5: PM agent shows all commands in bob mode
    // Story 10.3 - AC2: Advanced mode shows commands normally (current behavior)
    const visibilityFilter = this._getVisibilityFilter(sessionType);

    // Filter commands with visibility metadata
    const commandsWithMetadata = agent.commands.filter((cmd) => {
      if (!cmd.visibility || !Array.isArray(cmd.visibility)) {
        return false; // No metadata, exclude from filtered list
      }

      return cmd.visibility.includes(visibilityFilter);
    });

    // If we have metadata-based commands, use them
    if (commandsWithMetadata.length > 0) {
      return commandsWithMetadata;
    }

    // Backwards compatibility: No metadata found, show first 12 commands
    return agent.commands.slice(0, 12);
  }

  /**
   * Get visibility filter for session type
   * @private
   * @param {string} sessionType - Session type
   * @returns {string} Visibility level ('full', 'quick', 'key')
   */
  _getVisibilityFilter(sessionType) {
    switch (sessionType) {
      case 'new':
        return 'full';
      case 'existing':
        return 'quick';
      case 'workflow':
        return 'key';
      default:
        return 'full';
    }
  }

  /**
   * Safe session type detection with fallback
   * @private
   * @param {Object} context - Session context
   * @returns {Promise<string>} Session type
   */
  async _safeDetectSessionType(context) {
    try {
      const conversationHistory = context.conversationHistory || [];
      return this.contextDetector.detectSessionType(conversationHistory);
    } catch (error) {
      console.warn('[GreetingBuilder] Session detection failed:', error.message);
      return 'new'; // Conservative default
    }
  }

  /**
   * Safe git config check with fallback
   * @private
   * @returns {Promise<Object>} Git config result
   */
  async _safeCheckGitConfig() {
    try {
      return this.gitConfigDetector.get();
    } catch (error) {
      console.warn('[GreetingBuilder] Git config check failed:', error.message);
      return { configured: false, type: null, branch: null };
    }
  }

  /**
   * Safe project status load with fallback
   * @private
   * @returns {Promise<Object|null>} Project status or null
   */
  async _safeLoadProjectStatus() {
    try {
      return await loadProjectStatus();
    } catch (error) {
      console.warn('[GreetingBuilder] Project status load failed:', error.message);
      return null;
    }
  }

  /**
   * Safe permission badge retrieval with fallback
   * @private
   * @returns {Promise<string>} Permission mode badge or empty string
   */
  async _safeGetPermissionBadge() {
    try {
      const mode = new PermissionMode();
      await mode.load();
      return mode.getBadge();
    } catch (error) {
      console.warn('[GreetingBuilder] Permission mode load failed:', error.message);
      return '';
    }
  }

  /**
   * Check if git warning should be shown
   * @private
   * @returns {boolean} True if should show warning
   */
  _shouldShowGitWarning() {
    if (!this.config || !this.config.git) {
      return true; // Default: show warning
    }

    return this.config.git.showConfigWarning !== false;
  }

  /**
   * Load core configuration
   * @private
   * @returns {Object|null} Configuration or null
   */
  _loadConfig() {
    try {
      const configPath = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
      const content = fs.readFileSync(configPath, 'utf8');
      return yaml.load(content);
    } catch (_error) {
      return null;
    }
  }
}

module.exports = GreetingBuilder;
