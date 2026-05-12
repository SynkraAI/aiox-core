/**
 * @module PatternCapture
 * @description Captures workflow patterns from user sessions
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 */

'use strict';

const crypto = require('crypto');

/**
 * Default minimum sequence length for pattern capture
 * @type {number}
 */
const DEFAULT_MIN_SEQUENCE_LENGTH = 3;

/**
 * Key workflow commands that trigger pattern capture
 * @type {string[]}
 */
const KEY_WORKFLOW_COMMANDS = [
  'develop',
  'review-qa',
  'apply-qa-fixes',
  'validate-story-draft',
  'create-story',
  'create-next-story',
  'run-tests',
  'create-pr',
];

/**
 * PatternCapture class for capturing workflow patterns from sessions
 */
class PatternCapture {
  /**
   * Create a PatternCapture instance
   * @param {Object} options - Configuration options
   * @param {number} options.minSequenceLength - Minimum sequence length (default: 3)
   * @param {string[]} options.keyCommands - Commands that trigger capture
   * @param {boolean} options.enabled - Whether capture is enabled
   */
  constructor(options = {}) {
    this.minSequenceLength = options.minSequenceLength || DEFAULT_MIN_SEQUENCE_LENGTH;
    this.keyCommands = options.keyCommands || KEY_WORKFLOW_COMMANDS;
    this.enabled = options.enabled !== false && process.env.AIOX_PATTERN_CAPTURE !== 'false';
    this.sessionBuffer = new Map(); // Track ongoing sessions
  }

  /**
   * Capture a completed session as a pattern
   * @param {Object} sessionData - Session data to capture
   * @param {string[]} sessionData.agentSequence - Sequence of agents used
   * @param {string[]} sessionData.commands - Sequence of commands executed
   * @param {boolean} sessionData.success - Whether workflow completed successfully
   * @param {number} sessionData.timestamp - Session timestamp
   * @param {string} sessionData.sessionId - Unique session identifier
   * @returns {Object} Captured pattern with validity info
   */
  captureSession(sessionData) {
    if (!this.enabled) {
      return { valid: false, reason: 'Pattern capture disabled' };
    }

    if (!sessionData || !sessionData.commands) {
      return { valid: false, reason: 'Invalid session data' };
    }

    // Only capture successful workflows
    if (!sessionData.success) {
      return { valid: false, reason: 'Workflow not successful' };
    }

    // Check minimum sequence length
    if (sessionData.commands.length < this.minSequenceLength) {
      return {
        valid: false,
        reason: `Sequence too short (${sessionData.commands.length} < ${this.minSequenceLength})`,
      };
    }

    // Extract normalized command sequence
    const sequence = this._normalizeCommands(sessionData.commands);
    const agents = this._normalizeAgents(sessionData.agentSequence || []);

    // Build pattern object
    const pattern = {
      id: crypto.randomUUID(),
      sequence: sequence,
      agents: agents,
      occurrences: 1,
      successRate: 1.0,
      firstSeen: new Date(sessionData.timestamp || Date.now()).toISOString(),
      lastSeen: new Date(sessionData.timestamp || Date.now()).toISOString(),
      sessionId: sessionData.sessionId || crypto.randomUUID(),
      workflow: this._detectWorkflow(sequence),
      status: 'pending',
    };

    return {
      valid: true,
      pattern: pattern,
      sequence: sequence,
    };
  }

  /**
   * Extract pattern candidates from command history
   * @param {string[]} commandHistory - Full command history
   * @returns {Object[]} Array of pattern candidates
   */
  extractPatterns(commandHistory) {
    if (!commandHistory || commandHistory.length < this.minSequenceLength) {
      return [];
    }

    const patterns = [];
    const normalized = this._normalizeCommands(commandHistory);

    // Use sliding window to find subsequences
    for (let length = this.minSequenceLength; length <= Math.min(normalized.length, 7); length++) {
      for (let i = 0; i <= normalized.length - length; i++) {
        const subsequence = normalized.slice(i, i + length);

        // Only include if it contains at least one key command
        if (this._containsKeyCommand(subsequence)) {
          patterns.push({
            sequence: subsequence,
            startIndex: i,
            length: length,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Get the minimum sequence length setting
   * @returns {number} Minimum sequence length
   */
  getMinimumSequenceLength() {
    return this.minSequenceLength;
  }

  /**
   * Handle task completion event
   * @param {string} taskName - Name of completed task
   * @param {Object} context - Task context
   * @returns {Promise<Object>} Capture result
   */
  async onTaskComplete(taskName, context) {
    if (!this.enabled) {
      return { captured: false, reason: 'disabled' };
    }

    const sessionId = context.sessionId || 'default';

    // Get or create session buffer
    if (!this.sessionBuffer.has(sessionId)) {
      this.sessionBuffer.set(sessionId, {
        commands: [],
        agents: [],
        startTime: Date.now(),
        success: true,
      });
    }

    const session = this.sessionBuffer.get(sessionId);

    // Add command to buffer
    const normalizedTask = this._normalizeCommand(taskName);
    session.commands.push(normalizedTask);

    // Track agent if provided
    if (context.agentId) {
      const normalizedAgent = context.agentId.replace('@', '');
      if (!session.agents.includes(normalizedAgent)) {
        session.agents.push(normalizedAgent);
      }
    }

    // Check if this is a workflow-ending command
    if (this._isWorkflowEnd(normalizedTask)) {
      const result = this.captureSession({
        commands: session.commands,
        agentSequence: session.agents,
        success: session.success,
        timestamp: Date.now(),
        sessionId: sessionId,
      });

      // Clear session buffer
      this.sessionBuffer.delete(sessionId);

      return {
        captured: result.valid,
        pattern: result.pattern,
        reason: result.reason,
      };
    }

    return { captured: false, reason: 'workflow_in_progress' };
  }

  /**
   * Mark current session as failed
   * @param {string} sessionId - Session identifier
   */
  markSessionFailed(sessionId) {
    const session = this.sessionBuffer.get(sessionId || 'default');
    if (session) {
      session.success = false;
    }
  }

  /**
   * Clear session buffer
   * @param {string} sessionId - Session identifier (optional, clears all if not provided)
   */
  clearSession(sessionId) {
    if (sessionId) {
      this.sessionBuffer.delete(sessionId);
    } else {
      this.sessionBuffer.clear();
    }
  }

  /**
   * Normalize command name
   * @param {string} command - Command to normalize
   * @returns {string} Normalized command
   * @private
   */
  _normalizeCommand(command) {
    if (!command) return '';
    return command
      .replace(/^\*/, '') // Remove * prefix
      .replace(/-/g, '-') // Keep hyphens
      .toLowerCase()
      .trim();
  }

  /**
   * Normalize array of commands
   * @param {string[]} commands - Commands to normalize
   * @returns {string[]} Normalized commands
   * @private
   */
  _normalizeCommands(commands) {
    return commands.map((cmd) => this._normalizeCommand(cmd)).filter((cmd) => cmd.length > 0);
  }

  /**
   * Normalize array of agent IDs
   * @param {string[]} agents - Agent IDs to normalize
   * @returns {string[]} Normalized agent IDs
   * @private
   */
  _normalizeAgents(agents) {
    return agents
      .map((agent) => agent.replace('@', '').toLowerCase().trim())
      .filter((agent) => agent.length > 0);
  }

  /**
   * Check if sequence contains at least one key workflow command
   * @param {string[]} sequence - Command sequence
   * @returns {boolean} True if contains key command
   * @private
   */
  _containsKeyCommand(sequence) {
    return sequence.some((cmd) => this.keyCommands.some((key) => cmd.includes(key)));
  }

  /**
   * Detect workflow type from command sequence
   * @param {string[]} sequence - Command sequence
   * @returns {string|null} Detected workflow name or null
   * @private
   */
  _detectWorkflow(sequence) {
    const joined = sequence.join(' ');

    if (joined.includes('develop') && (joined.includes('review-qa') || joined.includes('qa'))) {
      return 'story_development';
    }
    if (joined.includes('create-story') || joined.includes('validate-story')) {
      return 'story_creation';
    }
    if (joined.includes('create-epic')) {
      return 'epic_creation';
    }
    if (joined.includes('create-pr') || joined.includes('push')) {
      return 'deployment';
    }

    return null;
  }

  /**
   * Check if command indicates end of workflow
   * @param {string} command - Command to check
   * @returns {boolean} True if workflow-ending command
   * @private
   */
  _isWorkflowEnd(command) {
    const endCommands = ['create-pr', 'push', 'deploy', 'complete', 'done', 'finish'];
    return endCommands.some((end) => command.includes(end));
  }
}

/**
 * Create a new PatternCapture instance
 * @param {Object} options - Configuration options
 * @returns {PatternCapture} New instance
 */
function createPatternCapture(options = {}) {
  return new PatternCapture(options);
}

module.exports = {
  PatternCapture,
  createPatternCapture,
  DEFAULT_MIN_SEQUENCE_LENGTH,
  KEY_WORKFLOW_COMMANDS,
};
