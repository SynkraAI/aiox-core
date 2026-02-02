/**
 * Greeting Builder - Contextual Agent Greeting System
 *
 * Builds intelligent greetings based on:
 * - Session type (new/existing/workflow)
 * - Git configuration status
 * - Project status
 * - Command visibility metadata
 *
 * Performance: <150ms (hard limit with timeout protection)
 * Fallback: Simple greeting on any error
 */

const ContextDetector = require('../../core/session/context-detector');
const GitConfigDetector = require('../../infrastructure/scripts/git-config-detector');
const WorkflowNavigator = require('./workflow-navigator');
const GreetingPreferenceManager = require('./greeting-preference-manager');
const {
  loadProjectStatus,
  formatStatusDisplay,
} = require('../../infrastructure/scripts/project-status-loader');
const { PermissionMode } = require('../../core/permissions');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const GREETING_TIMEOUT = 150; // 150ms hard limit
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
   * Build contextual greeting for agent
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context
   * @returns {Promise<string>} Formatted greeting
   */
  async buildGreeting(agent, context = {}) {
    const fallbackGreeting = this.buildSimpleGreeting(agent);

    try {
      // Check user preference (Story 6.1.4)
      const preference = this.preferenceManager.getPreference();

      if (preference !== 'auto') {
        // Override with fixed level
        return this.buildFixedLevelGreeting(agent, preference);
      }

      // Use session-aware logic (Story 6.1.2.5)
      const greetingPromise = this._buildContextualGreeting(agent, context);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Greeting timeout')), GREETING_TIMEOUT)
      );

      return await Promise.race([greetingPromise, timeoutPromise]);
    } catch (error) {
      console.warn('[GreetingBuilder] Fallback to simple greeting:', error.message);
      return fallbackGreeting;
    }
  }

  /**
   * Build contextual greeting (internal implementation)
   * @private
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context (may contain pre-loaded values)
   * @returns {Promise<string>} Contextual greeting
   */
  async _buildContextualGreeting(agent, context) {
    // Use pre-loaded values if available, otherwise load
    const sessionType = context.sessionType || (await this._safeDetectSessionType(context));

    const projectStatus = context.projectStatus || (await this._safeLoadProjectStatus());

    // gitConfig always loads (fast, cached)
    const gitConfig = await this._safeCheckGitConfig();

    // Build greeting sections based on session type
    const sections = [];

    // 1. Presentation with permission mode badge (always)
    const permissionBadge = await this._safeGetPermissionBadge();
    sections.push(this.buildPresentation(agent, sessionType, permissionBadge));

    // 2. Role description (new session only)
    if (sessionType === 'new') {
      sections.push(this.buildRoleDescription(agent));
    }

    // 3. Project status (if git configured)
    if (gitConfig.configured && projectStatus) {
      sections.push(this.buildProjectStatus(projectStatus, sessionType));
    }

    // 4. Context section (intelligent contextualization + recommendations)
    const contextSection = this.buildContextSection(agent, context, sessionType, projectStatus);
    if (contextSection) {
      sections.push(contextSection);
    }

    // 5. Workflow suggestions (if workflow session and no context section)
    if (sessionType === 'workflow' && context.lastCommands && !contextSection) {
      const suggestions = this.workflowNavigator.getNextSteps(context.lastCommands, {
        agentId: agent.id,
      });
      if (suggestions && suggestions.length > 0) {
        sections.push(this.buildWorkflowSuggestions(suggestions));
      }
    }

    // 7. Commands (filtered by visibility)
    const commands = this.filterCommandsByVisibility(agent, sessionType);
    sections.push(this.buildCommands(commands, sessionType));

    // 8. Footer with signature
    sections.push(this.buildFooter(agent));

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Build fixed-level greeting (Story 6.1.4)
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
   * @param {Object} agent - Agent definition
   * @param {string} sessionType - Session type
   * @param {string} permissionBadge - Permission mode badge (optional)
   * @returns {string} Presentation text
   */
  buildPresentation(agent, sessionType, permissionBadge = '') {
    const profile = agent.persona_profile;

    // Try greeting_levels from communication first, then fall back to top level
    const greetingLevels = profile?.communication?.greeting_levels || profile?.greeting_levels;

    if (!greetingLevels) {
      const base = `${agent.icon} ${agent.name} ready`;
      return permissionBadge ? `${base} ${permissionBadge}` : base;
    }

    // Always use archetypal greeting for richer presentation
    const archetypeGreeting =
      greetingLevels.archetypal || greetingLevels.named || `${agent.icon} ${agent.name} ready`;

    // Append permission badge if available
    return permissionBadge ? `${archetypeGreeting} ${permissionBadge}` : archetypeGreeting;
  }

  /**
   * Build role description section
   * @param {Object} agent - Agent definition
   * @returns {string} Role description
   */
  buildRoleDescription(agent) {
    if (!agent.persona || !agent.persona.role) {
      return '';
    }

    return `**Role:** ${agent.persona.role}`;
  }

  /**
   * Build project status section
   * @param {Object} projectStatus - Project status data
   * @param {string} sessionType - Session type
   * @returns {string} Formatted project status
   */
  buildProjectStatus(projectStatus, sessionType = 'full') {
    if (!projectStatus) {
      return '';
    }

    const format = sessionType === 'workflow' ? 'condensed' : 'full';
    return this._formatProjectStatus(projectStatus, format);
  }

  /**
   * Format project status
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
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context
   * @param {string} sessionType - Session type
   * @param {Object} projectStatus - Project status
   * @returns {string|null} Context section with recommendations
   */
  buildContextSection(agent, context, sessionType, projectStatus) {
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

  _analyzeModifiedFiles(modifiedFiles, currentStory) {
    if (!modifiedFiles || modifiedFiles.length === 0) {
      return { keyFiles: [], summary: '' };
    }

    const keyFiles = [];
    const patterns = [
      {
        regex: /greeting-builder\.js/,
        priority: 1,
        desc: 'do **`.aios-core/scripts/greeting-builder.js`**',
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

  _getAgentAction(agentId, storyContext) {
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
   * @param {Object} context - Session context
   * @returns {string|null} Workflow suggestions or null
   */
  buildWorkflowSuggestions(context) {
    try {
      const commandHistory = context.commandHistory || context.lastCommands || [];
      const workflowState = this.workflowNavigator.detectWorkflowState(commandHistory, context);

      if (!workflowState) {
        return null;
      }

      const suggestions = this.workflowNavigator.suggestNextCommands(workflowState);
      if (!suggestions || suggestions.length === 0) {
        return null;
      }

      const greetingMessage = this.workflowNavigator.getGreetingMessage(workflowState);
      const header = greetingMessage || 'Next steps:';

      return this.workflowNavigator.formatSuggestions(suggestions, header);
    } catch (error) {
      console.warn('[GreetingBuilder] Workflow suggestions failed:', error.message);
      return null;
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
  buildContextualSuggestions(agent, projectStatus, sessionType) {
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
   * Build footer section
   * @param {Object} agent - Agent definition
   * @returns {string} Footer text with signature
   */
  buildFooter(agent) {
    const parts = ['Type `*guide` for comprehensive usage instructions.'];

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
   * Filter commands by visibility metadata
   * @param {Object} agent - Agent definition
   * @param {string} sessionType - Session type
   * @returns {Array} Filtered commands
   */
  filterCommandsByVisibility(agent, sessionType) {
    if (!agent.commands || agent.commands.length === 0) {
      return [];
    }

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
      const configPath = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
      const content = fs.readFileSync(configPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      return null;
    }
  }
}

module.exports = GreetingBuilder;
