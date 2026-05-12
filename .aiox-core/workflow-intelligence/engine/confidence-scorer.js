/**
 * @module ConfidenceScorer
 * @description Confidence scoring algorithm for workflow suggestions
 * @story WIS-2 - Workflow Registry Enhancement
 * @version 1.0.0
 */

'use strict';

/**
 * Scoring weights for confidence calculation
 * @type {Object}
 */
const SCORING_WEIGHTS = {
  COMMAND_MATCH: 0.4,
  AGENT_MATCH: 0.25,
  HISTORY_DEPTH: 0.2,
  PROJECT_STATE: 0.15,
};

/**
 * ConfidenceScorer class for calculating workflow suggestion confidence
 */
class ConfidenceScorer {
  /**
   * Create a ConfidenceScorer instance
   * @param {Object} options - Configuration options
   * @param {Object} options.weights - Custom scoring weights
   */
  constructor(options = {}) {
    this.weights = { ...SCORING_WEIGHTS, ...options.weights };
    this.validateWeights();
  }

  /**
   * Validate that weights sum to 1.0
   * @throws {Error} If weights don't sum to 1.0
   */
  validateWeights() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      throw new Error(`Scoring weights must sum to 1.0, got ${sum}`);
    }
  }

  /**
   * Calculate confidence score for a suggestion given context
   * @param {Object} suggestion - The workflow suggestion
   * @param {string} suggestion.trigger - Command or condition that triggers transition
   * @param {string[]} suggestion.agentSequence - Expected agent sequence
   * @param {string[]} suggestion.keyCommands - Key commands for this workflow
   * @param {Object} context - Current session context
   * @param {string} context.lastCommand - Last executed command
   * @param {string[]} context.lastCommands - Recent command history
   * @param {string} context.agentId - Current active agent
   * @param {Object} context.projectState - Current project state
   * @returns {number} Normalized score between 0.0 and 1.0
   */
  score(suggestion, context) {
    if (!suggestion || !context) {
      return 0;
    }

    const commandMatch = this.matchCommand(suggestion.trigger, context.lastCommand);
    const agentMatch = this.matchAgent(suggestion.agentSequence, context.agentId);
    const historyDepth = this.matchHistory(suggestion.keyCommands, context.lastCommands);
    const projectState = this.matchProjectState(suggestion, context.projectState);

    const rawScore =
      commandMatch * this.weights.COMMAND_MATCH +
      agentMatch * this.weights.AGENT_MATCH +
      historyDepth * this.weights.HISTORY_DEPTH +
      projectState * this.weights.PROJECT_STATE;

    return this.normalize(rawScore);
  }

  /**
   * Match command trigger against last executed command
   * @param {string} trigger - Expected trigger command
   * @param {string} lastCommand - Last executed command
   * @returns {number} Match score 0.0-1.0
   */
  matchCommand(trigger, lastCommand) {
    if (!trigger || !lastCommand) {
      return 0;
    }

    const normalizedTrigger = this.normalizeCommand(trigger);
    const normalizedLast = this.normalizeCommand(lastCommand);

    // Exact match
    if (normalizedTrigger === normalizedLast) {
      return 1.0;
    }

    // Trigger contains the command
    if (normalizedTrigger.includes(normalizedLast)) {
      return 0.9;
    }

    // Command contains trigger keyword
    if (normalizedLast.includes(normalizedTrigger.split(' ')[0])) {
      return 0.7;
    }

    // Partial word match
    const triggerWords = normalizedTrigger.split(/[\s-_]+/);
    const lastWords = normalizedLast.split(/[\s-_]+/);
    const commonWords = triggerWords.filter((w) => lastWords.includes(w));

    if (commonWords.length > 0) {
      return 0.5 * (commonWords.length / Math.max(triggerWords.length, 1));
    }

    return 0;
  }

  /**
   * Match agent sequence against current agent
   * @param {string[]} agentSequence - Expected agent sequence
   * @param {string} currentAgent - Current active agent
   * @returns {number} Match score 0.0-1.0
   */
  matchAgent(agentSequence, currentAgent) {
    if (!agentSequence || !currentAgent) {
      return 0;
    }

    const normalizedAgent = currentAgent.replace('@', '').toLowerCase();

    // Check if current agent is in the sequence
    const agentIndex = agentSequence.findIndex((agent) => agent.toLowerCase() === normalizedAgent);

    if (agentIndex === -1) {
      return 0;
    }

    // Higher score for agents later in sequence (workflow is progressing)
    const progressScore = (agentIndex + 1) / agentSequence.length;

    // Bonus for being the expected next agent
    if (agentIndex === 0) {
      return 0.6 + progressScore * 0.4;
    }

    return progressScore;
  }

  /**
   * Match command history against key workflow commands
   * @param {string[]} keyCommands - Key commands for the workflow
   * @param {string[]} lastCommands - Recent command history
   * @returns {number} Match score 0.0-1.0
   */
  matchHistory(keyCommands, lastCommands) {
    if (!keyCommands || !lastCommands || keyCommands.length === 0) {
      return 0;
    }

    const normalizedKeys = keyCommands.map((cmd) => this.normalizeCommand(cmd));
    const normalizedHistory = lastCommands.map((cmd) => this.normalizeCommand(cmd));

    let matchCount = 0;
    let recentBonus = 0;

    for (let i = 0; i < normalizedHistory.length; i++) {
      const historyCmd = normalizedHistory[i];

      for (const keyCmd of normalizedKeys) {
        if (historyCmd.includes(keyCmd) || keyCmd.includes(historyCmd)) {
          matchCount++;

          // Recent commands get higher weight (decay factor)
          const recency = 1 - i / normalizedHistory.length;
          recentBonus += recency * 0.1;
          break;
        }
      }
    }

    const baseScore = Math.min(matchCount / keyCommands.length, 1.0);
    return Math.min(baseScore + recentBonus, 1.0);
  }

  /**
   * Match suggestion against project state
   * @param {Object} suggestion - The workflow suggestion
   * @param {Object} projectState - Current project state
   * @returns {number} Match score 0.0-1.0
   */
  matchProjectState(suggestion, projectState) {
    if (!suggestion || !projectState) {
      return 0.5; // Neutral score when state unknown
    }

    const score = 0.5;
    const factors = [];

    // Check if story is in progress
    if (projectState.activeStory) {
      factors.push(0.2);
    }

    // Check if uncommitted changes exist
    if (projectState.hasUncommittedChanges) {
      // Git-related suggestions get higher score
      if (
        suggestion.trigger?.includes('git') ||
        suggestion.trigger?.includes('commit') ||
        suggestion.trigger?.includes('push')
      ) {
        factors.push(0.3);
      }
    }

    // Check if tests are failing
    if (projectState.failingTests) {
      // QA-related suggestions get higher score
      if (
        suggestion.trigger?.includes('test') ||
        suggestion.trigger?.includes('qa') ||
        suggestion.trigger?.includes('fix')
      ) {
        factors.push(0.3);
      }
    }

    // Check current workflow phase
    if (projectState.workflowPhase && suggestion.phase) {
      if (projectState.workflowPhase === suggestion.phase) {
        factors.push(0.2);
      }
    }

    return Math.min(score + factors.reduce((a, b) => a + b, 0), 1.0);
  }

  /**
   * Normalize a command string for comparison
   * @param {string} command - Command to normalize
   * @returns {string} Normalized command
   */
  normalizeCommand(command) {
    if (!command) return '';

    return command
      .toLowerCase()
      .replace(/\s+completed\s*$/i, '')
      .replace(/\s+successfully\s*$/i, '')
      .replace(/^\*/, '')
      .replace(/['"]/g, '')
      .trim();
  }

  /**
   * Normalize score to 0.0-1.0 range
   * @param {number} score - Raw score
   * @returns {number} Normalized score
   */
  normalize(score) {
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate scores for multiple suggestions and rank them
   * @param {Object[]} suggestions - Array of suggestions
   * @param {Object} context - Current session context
   * @returns {Object[]} Sorted suggestions with scores
   */
  rankSuggestions(suggestions, context) {
    if (!suggestions || suggestions.length === 0) {
      return [];
    }

    return suggestions
      .map((suggestion) => ({
        ...suggestion,
        score: this.score(suggestion, context),
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get scoring weights
   * @returns {Object} Current scoring weights
   */
  getWeights() {
    return { ...this.weights };
  }
}

/**
 * Create a new ConfidenceScorer instance
 * @param {Object} options - Configuration options
 * @returns {ConfidenceScorer} New scorer instance
 */
function createConfidenceScorer(options = {}) {
  return new ConfidenceScorer(options);
}

module.exports = {
  ConfidenceScorer,
  createConfidenceScorer,
  SCORING_WEIGHTS,
};
