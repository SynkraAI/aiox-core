/**
 * Context Detector - Hybrid Session Type Detection
 *
 * Detects session type using conversation history (preferred)
 * with fallback to file-based session tracking.
 *
 * Session Types:
 * - 'new': Fresh session, no prior context
 * - 'existing': Ongoing session with some history
 * - 'workflow': Active workflow detected (e.g., story development)
 *
 * @module core/session/context-detector
 * @migrated Story 2.2 - Core Module Creation
 */

const fs = require('fs');
const path = require('path');
const { atomicWriteSync } = require('../synapse/utils/atomic-write');

const SESSION_STATE_PATH = path.join(process.cwd(), '.aios', 'session-state.json');
const SESSION_TTL = 60 * 60 * 1000; // 1 hour

class ContextDetector {
  /**
   * Detect session type using hybrid approach
   * @param {Array} conversationHistory - Recent conversation messages
   * @param {string} sessionFilePath - Optional custom session file path
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  detectSessionType(conversationHistory = [], sessionFilePath = SESSION_STATE_PATH) {
    // Hybrid approach: Prefer conversation history
    // FIX: Check for null/undefined explicitly to avoid empty array bypassing file detection
    if (conversationHistory != null && conversationHistory.length > 0) {
      return this._detectFromConversation(conversationHistory);
    }

    // Fallback to file-based detection
    return this._detectFromFile(sessionFilePath);
  }

  /**
   * Detect session type from conversation history
   * @private
   * @param {Array} conversationHistory - Recent conversation messages
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  _detectFromConversation(conversationHistory) {
    if (conversationHistory.length === 0) {
      return 'new';
    }

    // Extract last 10 commands from conversation
    const recentCommands = this._extractCommands(conversationHistory);

    // Check for workflow patterns
    if (this._detectWorkflowPattern(recentCommands)) {
      return 'workflow';
    }

    // Has history but no workflow
    return 'existing';
  }

  /**
   * Detect session type from file
   * @private
   * @param {string} sessionFilePath - Path to session state file
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  _detectFromFile(sessionFilePath) {
    try {
      if (!fs.existsSync(sessionFilePath)) {
        return 'new';
      }

      const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));

      // Check if session expired (TTL)
      const now = Date.now();
      const lastActivity = sessionData.lastActivity || 0;

      if (now - lastActivity > SESSION_TTL) {
        return 'new';
      }

      // Check for active workflow
      if (sessionData.workflowActive && sessionData.lastCommands && sessionData.lastCommands.length > 0) {
        return 'workflow';
      }

      // Valid session with some history
      if (sessionData.lastCommands && sessionData.lastCommands.length > 0) {
        return 'existing';
      }

      return 'new';
    } catch (error) {
      // File read error or invalid JSON - assume new session
      console.warn('[ContextDetector] File read error, defaulting to new session:', error.message);
      return 'new';
    }
  }

  /**
   * Extract command names from conversation history
   * @private
   * @param {Array} conversationHistory - Recent conversation messages
   * @returns {Array<string>} Command names
   */
  _extractCommands(conversationHistory) {
    const commands = [];
    const commandPattern = /\*([a-z0-9-]+)/g;

    // Take last 10 messages for analysis
    const recentMessages = conversationHistory.slice(-10);

    for (const message of recentMessages) {
      const text = message.content || message.text || '';
      const matches = text.matchAll(commandPattern);

      for (const match of matches) {
        commands.push(match[1]);
      }
    }

    return commands.slice(-10); // Last 10 commands
  }

  /**
   * Detect if commands match a known workflow pattern
   * @private
   * @param {Array<string>} commands - Recent command history
   * @returns {boolean} True if workflow pattern detected
   */
  _detectWorkflowPattern(commands) {
    if (commands.length < 2) {
      return false;
    }

    // Common workflow patterns (simplified detection)
    const workflows = {
      story_development: ['validate-story-draft', 'develop', 'review-qa'],
      epic_creation: ['create-epic', 'create-story', 'validate-story-draft'],
      backlog_management: ['backlog-review', 'backlog-prioritize', 'backlog-schedule'],
    };

    // Check if recent commands match any workflow sequence
    for (const [_workflowName, pattern] of Object.entries(workflows)) {
      if (this._matchesPattern(commands, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if commands contain workflow pattern
   * @private
   * @param {Array<string>} commands - Recent command history
   * @param {Array<string>} pattern - Workflow pattern to match
   * @returns {boolean} True if pattern found
   */
  _matchesPattern(commands, pattern) {
    // Simple containment check - commands contain at least 2 from pattern
    const matchCount = pattern.filter(p => commands.includes(p)).length;
    return matchCount >= 2;
  }

  /**
   * Update session state file
   * @param {Object} state - Session state data
   * @param {string} sessionFilePath - Optional custom session file path
   */
  updateSessionState(state, sessionFilePath = SESSION_STATE_PATH) {
    try {
      const sessionData = {
        sessionId: state.sessionId || this._generateSessionId(),
        startTime: state.startTime || Date.now(),
        lastActivity: Date.now(),
        workflowActive: state.workflowActive || null,
        workflowState: state.workflowState || null,
        lastCommands: state.lastCommands || [],
        agentSequence: state.agentSequence || [],
        taskHistory: state.taskHistory || [],
        currentStory: state.currentStory || null,
      };

      atomicWriteSync(sessionFilePath, JSON.stringify(sessionData, null, 2));
    } catch (error) {
      console.warn('[ContextDetector] Failed to update session state:', error.message);
    }
  }

  /**
   * Generate unique session ID
   * @private
   * @returns {string} UUID-like session ID
   */
  _generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear expired sessions
   * @param {string} sessionFilePath - Optional custom session file path
   */
  clearExpiredSession(sessionFilePath = SESSION_STATE_PATH) {
    try {
      if (!fs.existsSync(sessionFilePath)) {
        return;
      }

      const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
      const now = Date.now();
      const lastActivity = sessionData.lastActivity || 0;

      if (now - lastActivity > SESSION_TTL) {
        fs.unlinkSync(sessionFilePath);
      }
    } catch (error) {
      console.warn('[ContextDetector] Failed to clear expired session:', error.message);
    }
  }
}

module.exports = ContextDetector;
