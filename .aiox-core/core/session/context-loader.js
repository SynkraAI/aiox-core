/**
 * Session Context Loader - Multi-Agent Session Continuity
 *
 * Provides session context when transitioning between agents.
 * Solves the problem: "@po approved story, @dev doesn't know about it"
 *
 * Features:
 * - Detects previous agent in session
 * - Tracks last N commands
 * - Identifies active workflow
 * - Provides natural language summary for new agent
 *
 * @module core/session/context-loader
 * @migrated Story 2.2 - Core Module Creation
 * Part of Story 6.1.2.5 UX Improvements
 */

const fs = require('fs');
const path = require('path');
const ContextDetector = require('./context-detector');

const SESSION_STATE_PATH = path.join(process.cwd(), '.aiox', 'session-state.json');
const MAX_COMMANDS_HISTORY = 10;

class SessionContextLoader {
  constructor() {
    this.detector = new ContextDetector();
    this.sessionStatePath = SESSION_STATE_PATH;
  }

  /**
   * Load session context for current agent activation
   *
   * @param {string} currentAgentId - ID of agent being activated
   * @returns {Object} Session context
   */
  loadContext(currentAgentId) {
    // Pass sessionStatePath to detector so it uses the correct file (important for testing)
    const sessionType = this.detector.detectSessionType([], this.sessionStatePath);
    const sessionState = this.loadSessionState();

    if (sessionType === 'new') {
      // Fresh session - no context
      return {
        sessionType: 'new',
        message: null,
        previousAgent: null,
        lastCommands: [],
        workflowActive: null,
      };
    }

    // Extract context information
    const previousAgent = this.getPreviousAgent(sessionState, currentAgentId);
    const lastCommands = sessionState.lastCommands || [];
    const workflowActive = sessionState.workflowActive || null;

    // Generate natural language summary
    const message = this.generateContextMessage({
      sessionType,
      previousAgent,
      lastCommands,
      workflowActive,
      currentAgentId,
    });

    return {
      sessionType,
      message,
      previousAgent,
      lastCommands,
      workflowActive,
      currentStory: sessionState.currentStory || null,
      sessionId: sessionState.sessionId,
      sessionStartTime: sessionState.startTime,
    };
  }

  /**
   * Load session state from file
   *
   * @returns {Object} Session state
   */
  loadSessionState() {
    try {
      if (!fs.existsSync(this.sessionStatePath)) {
        return {};
      }

      const content = fs.readFileSync(this.sessionStatePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('[SessionContext] Failed to load session state:', error.message);
      return {};
    }
  }

  /**
   * Get previous agent from session
   *
   * @param {Object} sessionState - Session state
   * @param {string} currentAgentId - Current agent ID
   * @returns {Object|null} Previous agent info
   */
  getPreviousAgent(sessionState, currentAgentId) {
    const agentSequence = sessionState.agentSequence || [];

    if (agentSequence.length === 0) {
      return null;
    }

    // Get last agent that's different from current
    for (let i = agentSequence.length - 1; i >= 0; i--) {
      const agent = agentSequence[i];
      if (agent.agentId !== currentAgentId) {
        return {
          agentId: agent.agentId,
          agentName: agent.agentName,
          activatedAt: agent.activatedAt,
          lastCommand: agent.lastCommand,
        };
      }
    }

    return null;
  }

  /**
   * Generate natural language context message
   *
   * @param {Object} context - Context data
   * @returns {string|null} Context message
   */
  generateContextMessage(context) {
    const { sessionType, previousAgent, lastCommands, workflowActive } = context;

    if (sessionType === 'new') {
      return null;
    }

    const parts = [];

    // Previous agent context
    if (previousAgent) {
      const agentName = previousAgent.agentName || previousAgent.agentId;
      const minutesAgo = Math.floor((Date.now() - previousAgent.activatedAt) / 60000);
      const timeAgo = minutesAgo < 1 ? 'just now' : minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;

      parts.push(`📍 **Session Context**: Continuing from @${previousAgent.agentId} (${agentName}) activated ${timeAgo}`);

      if (previousAgent.lastCommand) {
        parts.push(`   Last action: *${previousAgent.lastCommand}`);
      }
    }

    // Recent commands
    if (lastCommands.length > 0) {
      const recentCmds = lastCommands.slice(-5).join(', *');
      parts.push(`   Recent commands: *${recentCmds}`);
    }

    // Active workflow
    if (workflowActive) {
      parts.push(`   ⚡ Active Workflow: ${workflowActive}`);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  /**
   * Update session state with current agent
   *
   * @param {string} agentId - Agent ID
   * @param {string} agentName - Agent name
   * @param {string} lastCommand - Last command executed
   * @param {Object} options - Update options
   */
  updateSession(agentId, agentName, lastCommand = null, options = {}) {
    try {
      const sessionState = this.loadSessionState();

      // Initialize if new session
      if (!sessionState.sessionId) {
        sessionState.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionState.startTime = Date.now();
      }

      // Update activity timestamp
      sessionState.lastActivity = Date.now();

      // Update agent sequence
      if (!sessionState.agentSequence) {
        sessionState.agentSequence = [];
      }

      sessionState.agentSequence.push({
        agentId,
        agentName,
        activatedAt: Date.now(),
        lastCommand,
      });

      // Keep last 20 agent activations
      if (sessionState.agentSequence.length > 20) {
        sessionState.agentSequence = sessionState.agentSequence.slice(-20);
      }

      // Update command history
      if (lastCommand) {
        if (!sessionState.lastCommands) {
          sessionState.lastCommands = [];
        }

        sessionState.lastCommands.push(lastCommand);

        // Keep last N commands
        if (sessionState.lastCommands.length > MAX_COMMANDS_HISTORY) {
          sessionState.lastCommands = sessionState.lastCommands.slice(-MAX_COMMANDS_HISTORY);
        }
      }

      // Update workflow status
      if (options.workflowActive !== undefined) {
        sessionState.workflowActive = options.workflowActive;
      }

      // Save to file
      this.detector.updateSessionState(sessionState, this.sessionStatePath);
    } catch (error) {
      console.warn('[SessionContext] Failed to update session:', error.message);
    }
  }

  /**
   * Clear session (start fresh)
   */
  clearSession() {
    try {
      if (fs.existsSync(this.sessionStatePath)) {
        fs.unlinkSync(this.sessionStatePath);
      }
    } catch (error) {
      console.warn('[SessionContext] Failed to clear session:', error.message);
    }
  }

  /**
   * Format context for display in agent greeting
   *
   * @param {string} currentAgentId - Current agent ID
   * @returns {string} Formatted context message
   */
  formatForGreeting(currentAgentId) {
    const context = this.loadContext(currentAgentId);

    if (!context.message) {
      return '';
    }

    return `\n${context.message}\n`;
  }

  /**
   * Hook called when a task completes
   * Updates session state with task result and workflow transition
   *
   * @param {string} taskName - Name of the completed task
   * @param {Object} result - Task execution result
   * @param {boolean} result.success - Whether task succeeded
   * @param {string} result.agentId - Agent that executed the task
   * @param {string} result.storyPath - Associated story path (optional)
   * @param {Object} result.metadata - Additional metadata (optional)
   * @story WIS-3 - Task Completion Hook
   */
  onTaskComplete(taskName, result = {}) {
    try {
      const sessionState = this.loadSessionState();

      // Initialize if new session
      if (!sessionState.sessionId) {
        sessionState.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionState.startTime = Date.now();
      }

      // Update timestamp
      sessionState.lastActivity = Date.now();

      // Add command to history
      if (!sessionState.lastCommands) {
        sessionState.lastCommands = [];
      }

      const commandEntry = taskName.startsWith('*') ? taskName : `*${taskName}`;
      sessionState.lastCommands.push(commandEntry);

      // Keep last N commands
      if (sessionState.lastCommands.length > MAX_COMMANDS_HISTORY) {
        sessionState.lastCommands = sessionState.lastCommands.slice(-MAX_COMMANDS_HISTORY);
      }

      // Update task completion history
      if (!sessionState.taskHistory) {
        sessionState.taskHistory = [];
      }

      sessionState.taskHistory.push({
        task: taskName,
        completedAt: Date.now(),
        success: result.success !== false,
        agentId: result.agentId || null,
        storyPath: result.storyPath || null,
      });

      // Keep last 20 task completions
      if (sessionState.taskHistory.length > 20) {
        sessionState.taskHistory = sessionState.taskHistory.slice(-20);
      }

      // Update current story if provided
      if (result.storyPath) {
        sessionState.currentStory = result.storyPath;
      }

      // Infer workflow state transition
      const workflowState = this._inferWorkflowState(taskName, result);
      if (workflowState) {
        sessionState.workflowActive = workflowState.workflow;
        sessionState.workflowState = workflowState.state;
      }

      // Save updated state
      this.detector.updateSessionState(sessionState, this.sessionStatePath);

      return {
        success: true,
        sessionId: sessionState.sessionId,
        workflowState: sessionState.workflowState,
      };
    } catch (error) {
      console.warn('[SessionContext] Failed to record task completion:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Infer workflow state from completed task
   *
   * @param {string} taskName - Completed task name
   * @param {Object} _result - Task result (unused, reserved for future use)
   * @returns {Object|null} Workflow state info
   * @private
   */
  _inferWorkflowState(taskName, _result) {
    const normalizedTask = taskName.toLowerCase().replace(/^\*/, '');

    // Map task completions to workflow states
    const stateMap = {
      'validate-story-draft': { workflow: 'story_development', state: 'validated' },
      'validate-next-story': { workflow: 'story_development', state: 'validated' },
      'develop': { workflow: 'story_development', state: 'in_development' },
      'develop-yolo': { workflow: 'story_development', state: 'in_development' },
      'develop-interactive': { workflow: 'story_development', state: 'in_development' },
      'review-qa': { workflow: 'story_development', state: 'qa_reviewed' },
      'apply-qa-fixes': { workflow: 'story_development', state: 'qa_reviewed' },
      'pre-push-quality-gate': { workflow: 'git_workflow', state: 'staged' },
      'create-epic': { workflow: 'epic_creation', state: 'epic_drafted' },
      'create-story': { workflow: 'epic_creation', state: 'stories_created' },
      'create-next-story': { workflow: 'epic_creation', state: 'stories_created' },
      'backlog-review': { workflow: 'backlog_management', state: 'reviewed' },
      'backlog-prioritize': { workflow: 'backlog_management', state: 'prioritized' },
      'analyze-impact': { workflow: 'architecture_review', state: 'analyzed' },
      'create-doc': { workflow: 'documentation_workflow', state: 'drafted' },
      'db-domain-modeling': { workflow: 'database_workflow', state: 'designed' },
      'db-apply-migration': { workflow: 'database_workflow', state: 'migrated' },
    };

    return stateMap[normalizedTask] || null;
  }

  /**
   * Get current workflow state from session
   *
   * @returns {Object|null} Current workflow state
   */
  getWorkflowState() {
    try {
      const sessionState = this.loadSessionState();
      if (sessionState.workflowActive) {
        return {
          workflow: sessionState.workflowActive,
          state: sessionState.workflowState || null,
          lastActivity: sessionState.lastActivity,
        };
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Get task completion history
   *
   * @param {number} limit - Maximum number of entries to return
   * @returns {Object[]} Task history entries
   */
  getTaskHistory(limit = 10) {
    try {
      const sessionState = this.loadSessionState();
      const history = sessionState.taskHistory || [];
      return history.slice(-limit);
    } catch {
      return [];
    }
  }
}

// CLI Interface
if (require.main === module) {
  const loader = new SessionContextLoader();
  const command = process.argv[2];
  const agentId = process.argv[3] || 'dev';

  if (command === 'load') {
    const context = loader.loadContext(agentId);
    console.log(JSON.stringify(context, null, 2));
  } else if (command === 'clear') {
    loader.clearSession();
    console.log('✅ Session cleared');
  } else if (command === 'update') {
    const agentName = process.argv[4] || agentId.toUpperCase();
    const lastCommand = process.argv[5] || null;
    loader.updateSession(agentId, agentName, lastCommand);
    console.log('✅ Session updated');
  } else {
    // Default: show greeting format
    const message = loader.formatForGreeting(agentId);
    console.log(message || '(No session context)');
  }
}

module.exports = SessionContextLoader;
