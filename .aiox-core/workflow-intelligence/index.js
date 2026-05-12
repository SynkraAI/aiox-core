/**
 * @module workflow-intelligence
 * @description Workflow Intelligence System (WIS) public API
 * @story WIS-2 - Workflow Registry Enhancement
 * @story WIS-4 - Wave Analysis Engine
 * @version 1.1.0
 *
 * @example
 * const wis = require('./.aiox-core/workflow-intelligence');
 *
 * // Get workflow suggestions
 * const suggestions = wis.getSuggestions({
 *   lastCommand: 'create-story',
 *   lastCommands: ['create-epic', 'create-story'],
 *   agentId: '@sm'
 * });
 *
 * // Find matching workflow
 * const workflow = wis.matchWorkflow(['create-epic', 'create-story']);
 *
 * // Get next steps for a state
 * const nextSteps = wis.getNextSteps('epic_creation', 'stories_created');
 *
 * // Analyze waves for parallel execution (WIS-4)
 * const waves = wis.analyzeWaves('story_development');
 * console.log(waves.waves); // Wave groupings
 * console.log(waves.criticalPath); // Critical path
 */

'use strict';

const {
  WorkflowRegistry,
  createWorkflowRegistry,
  DEFAULT_CACHE_TTL,
  DEFAULT_PATTERNS_PATH,
} = require('./registry/workflow-registry');

const {
  ConfidenceScorer,
  createConfidenceScorer,
  SCORING_WEIGHTS,
} = require('./engine/confidence-scorer');

const {
  SuggestionEngine,
  createSuggestionEngine,
  SUGGESTION_CACHE_TTL,
  LOW_CONFIDENCE_THRESHOLD,
} = require('./engine/suggestion-engine');

const {
  WaveAnalyzer,
  CircularDependencyError,
  createWaveAnalyzer,
  analyzeWaves,
  DEFAULT_TASK_DURATIONS,
} = require('./engine/wave-analyzer');

const outputFormatter = require('./engine/output-formatter');

// Learning module (WIS-5)
let learningModule = null;
try {
  learningModule = require('./learning');
} catch (_error) {
  // Learning module not yet available
  learningModule = null;
}

/**
 * Singleton instances for default usage
 */
let defaultRegistry = null;
let defaultScorer = null;

/**
 * Get or create the default registry instance
 * @returns {WorkflowRegistry} Default registry instance
 */
function getDefaultRegistry() {
  if (!defaultRegistry) {
    defaultRegistry = createWorkflowRegistry();
  }
  return defaultRegistry;
}

/**
 * Get or create the default scorer instance
 * @returns {ConfidenceScorer} Default scorer instance
 */
function getDefaultScorer() {
  if (!defaultScorer) {
    defaultScorer = createConfidenceScorer();
  }
  return defaultScorer;
}

/**
 * Get workflow suggestions with confidence scores
 * @param {Object} context - Current session context
 * @param {string} context.lastCommand - Last executed command
 * @param {string[]} context.lastCommands - Recent command history
 * @param {string} context.agentId - Current active agent
 * @param {Object} context.projectState - Current project state
 * @returns {Object[]} Ranked suggestions with scores
 */
function getSuggestions(context) {
  if (!context) {
    return [];
  }

  const registry = getDefaultRegistry();
  const scorer = getDefaultScorer();

  // Find matching workflow
  const commands = context.lastCommands || (context.lastCommand ? [context.lastCommand] : []);
  const match = registry.matchWorkflow(commands);

  if (!match) {
    return [];
  }

  // Find current state
  const currentState = registry.findCurrentState(match.name, context.lastCommand);

  if (!currentState) {
    // Return first state's suggestions if we can't determine current state
    const transitions = registry.getAllTransitions(match.name);
    const firstState = Object.keys(transitions)[0];

    if (!firstState) {
      return [];
    }

    return formatSuggestions(
      registry.getNextSteps(match.name, firstState),
      match,
      firstState,
      scorer,
      context,
    );
  }

  // Get next steps for current state
  const nextSteps = registry.getNextSteps(match.name, currentState);

  return formatSuggestions(nextSteps, match, currentState, scorer, context);
}

/**
 * Format and score suggestions
 * @param {Object[]} nextSteps - Raw next steps from registry
 * @param {Object} match - Workflow match info
 * @param {string} state - Current state
 * @param {ConfidenceScorer} scorer - Scorer instance
 * @param {Object} context - Session context
 * @returns {Object[]} Formatted and scored suggestions
 */
function formatSuggestions(nextSteps, match, state, scorer, context) {
  if (!nextSteps || nextSteps.length === 0) {
    return [];
  }

  const transition = getDefaultRegistry().getTransitions(match.name, state);
  const baseConfidence = transition?.confidence || 0.5;

  return nextSteps
    .map((step) => {
      const suggestion = {
        command: step.command,
        args_template: step.args_template,
        description: step.description,
        priority: step.priority,
        workflow: match.name,
        state: state,
        trigger: transition?.trigger,
        agentSequence: match.workflow.agent_sequence,
        keyCommands: match.workflow.key_commands,
      };

      // Calculate confidence score
      const score = scorer.score(suggestion, context);

      // Blend base confidence with calculated score
      const finalScore = baseConfidence * 0.4 + score * 0.6;

      return {
        ...suggestion,
        confidence: Math.round(finalScore * 100) / 100,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Match command history to a workflow
 * @param {string[]} commands - Command history
 * @returns {Object|null} Matching workflow or null
 */
function matchWorkflow(commands) {
  return getDefaultRegistry().matchWorkflow(commands);
}

/**
 * Get next steps for a workflow state
 * @param {string} workflowName - Workflow name
 * @param {string} state - Current state
 * @returns {Object[]} Next step suggestions
 */
function getNextSteps(workflowName, state) {
  return getDefaultRegistry().getNextSteps(workflowName, state);
}

/**
 * Get transitions for a workflow state
 * @param {string} workflowName - Workflow name
 * @param {string} state - Current state
 * @returns {Object|null} Transition or null
 */
function getTransitions(workflowName, state) {
  return getDefaultRegistry().getTransitions(workflowName, state);
}

/**
 * Get a workflow by name
 * @param {string} name - Workflow name
 * @returns {Object|null} Workflow or null
 */
function getWorkflow(name) {
  return getDefaultRegistry().getWorkflow(name);
}

/**
 * Get all workflow names
 * @returns {string[]} Workflow names
 */
function getWorkflowNames() {
  return getDefaultRegistry().getWorkflowNames();
}

/**
 * Get workflows by agent
 * @param {string} agentId - Agent identifier
 * @returns {Object[]} Workflows involving this agent
 */
function getWorkflowsByAgent(agentId) {
  return getDefaultRegistry().getWorkflowsByAgent(agentId);
}

/**
 * Find current state based on last command
 * @param {string} workflowName - Workflow name
 * @param {string} lastCommand - Last command
 * @returns {string|null} Current state or null
 */
function findCurrentState(workflowName, lastCommand) {
  return getDefaultRegistry().findCurrentState(workflowName, lastCommand);
}

/**
 * Get registry statistics
 * @returns {Object} Statistics
 */
function getStats() {
  return getDefaultRegistry().getStats();
}

/**
 * Invalidate registry cache
 */
function invalidateCache() {
  if (defaultRegistry) {
    defaultRegistry.invalidateCache();
  }
}

/**
 * Reset singleton instances (for testing)
 */
function reset() {
  defaultRegistry = null;
  defaultScorer = null;
}

module.exports = {
  // High-level API
  getSuggestions,
  matchWorkflow,
  getNextSteps,
  getTransitions,
  getWorkflow,
  getWorkflowNames,
  getWorkflowsByAgent,
  findCurrentState,
  getStats,
  invalidateCache,
  reset,

  // Wave Analysis API (WIS-4)
  analyzeWaves,
  createWaveAnalyzer,

  // Pattern Learning API (WIS-5)
  learning: learningModule,

  // Factory functions
  createWorkflowRegistry,
  createConfidenceScorer,
  createSuggestionEngine,

  // Classes (for advanced usage)
  WorkflowRegistry,
  ConfidenceScorer,
  SuggestionEngine,
  WaveAnalyzer,
  CircularDependencyError,

  // Output formatting (for *next task)
  outputFormatter,

  // Constants
  SCORING_WEIGHTS,
  DEFAULT_CACHE_TTL,
  DEFAULT_PATTERNS_PATH,
  SUGGESTION_CACHE_TTL,
  LOW_CONFIDENCE_THRESHOLD,
  DEFAULT_TASK_DURATIONS,
};
