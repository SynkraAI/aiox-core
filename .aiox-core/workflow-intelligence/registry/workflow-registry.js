/**
 * @module WorkflowRegistry
 * @description Registry for loading and managing workflow patterns
 * @story WIS-2 - Workflow Registry Enhancement
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default cache TTL in milliseconds (5 minutes)
 * @type {number}
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Default path to workflow patterns file
 * @type {string}
 */
const DEFAULT_PATTERNS_PATH = path.join(__dirname, '../../data/workflow-patterns.yaml');

/**
 * WorkflowRegistry class for managing workflow patterns
 */
class WorkflowRegistry {
  /**
   * Create a WorkflowRegistry instance
   * @param {Object} options - Configuration options
   * @param {string} options.patternsPath - Path to workflow-patterns.yaml
   * @param {number} options.cacheTTL - Cache time-to-live in milliseconds
   */
  constructor(options = {}) {
    this.patternsPath = options.patternsPath || DEFAULT_PATTERNS_PATH;
    this.cacheTTL = options.cacheTTL || DEFAULT_CACHE_TTL;
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Load workflows from YAML file with caching
   * @returns {Object} Loaded workflow patterns
   * @throws {Error} If file cannot be read or parsed
   */
  loadWorkflows() {
    // Check if cache is valid
    if (this.isCacheValid()) {
      return this.cache;
    }

    try {
      const content = fs.readFileSync(this.patternsPath, 'utf8');
      const parsed = yaml.load(content);

      if (!parsed || !parsed.workflows) {
        throw new Error('Invalid workflow patterns file: missing workflows key');
      }

      this.cache = parsed.workflows;
      this.cacheTimestamp = Date.now();

      return this.cache;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Workflow patterns file not found: ${this.patternsPath}`);
      }
      throw new Error(`Failed to load workflow patterns: ${error.message}`);
    }
  }

  /**
   * Check if cache is still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    if (!this.cache || !this.cacheTimestamp) {
      return false;
    }
    return Date.now() - this.cacheTimestamp < this.cacheTTL;
  }

  /**
   * Invalidate the cache
   */
  invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Get all workflow names
   * @returns {string[]} Array of workflow names
   */
  getWorkflowNames() {
    const workflows = this.loadWorkflows();
    return Object.keys(workflows);
  }

  /**
   * Get a specific workflow by name
   * @param {string} name - Workflow name
   * @returns {Object|null} Workflow object or null if not found
   */
  getWorkflow(name) {
    const workflows = this.loadWorkflows();
    return workflows[name] || null;
  }

  /**
   * Match command history to find the best matching workflow
   * @param {string[]} commands - Recent command history
   * @returns {Object|null} Best matching workflow with score, or null
   */
  matchWorkflow(commands) {
    if (!commands || commands.length === 0) {
      return null;
    }

    const workflows = this.loadWorkflows();
    const normalizedCommands = commands.map((cmd) => this.normalizeCommand(cmd));

    let bestMatch = null;
    let bestScore = 0;

    for (const [name, workflow] of Object.entries(workflows)) {
      const score = this.calculateWorkflowMatch(workflow, normalizedCommands);

      if (score > bestScore && score >= (workflow.trigger_threshold ?? 2)) {
        bestScore = score;
        bestMatch = {
          name,
          workflow,
          score,
          matchedCommands: this.getMatchedCommands(workflow, normalizedCommands),
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate match score between workflow and command history
   * @param {Object} workflow - Workflow definition
   * @param {string[]} commands - Normalized command history
   * @returns {number} Match score
   */
  calculateWorkflowMatch(workflow, commands) {
    if (!workflow.key_commands) {
      return 0;
    }

    const keyCommands = workflow.key_commands.map((cmd) => this.normalizeCommand(cmd));
    let matches = 0;

    for (const cmd of commands) {
      for (const keyCmd of keyCommands) {
        if (cmd.includes(keyCmd) || keyCmd.includes(cmd)) {
          matches++;
          break;
        }
      }
    }

    return matches;
  }

  /**
   * Get commands that matched from history
   * @param {Object} workflow - Workflow definition
   * @param {string[]} commands - Normalized command history
   * @returns {string[]} Matched commands
   */
  getMatchedCommands(workflow, commands) {
    if (!workflow.key_commands) {
      return [];
    }

    const keyCommands = workflow.key_commands.map((cmd) => this.normalizeCommand(cmd));
    const matched = [];

    for (const cmd of commands) {
      for (const keyCmd of keyCommands) {
        if (cmd.includes(keyCmd) || keyCmd.includes(cmd)) {
          matched.push(cmd);
          break;
        }
      }
    }

    return matched;
  }

  /**
   * Get transitions for a workflow state
   * @param {string} workflowName - Name of the workflow
   * @param {string} state - Current state in the workflow
   * @returns {Object|null} Transition object or null if not found
   */
  getTransitions(workflowName, state) {
    const workflow = this.getWorkflow(workflowName);

    if (!workflow || !workflow.transitions) {
      return null;
    }

    return workflow.transitions[state] || null;
  }

  /**
   * Get all available transitions for a workflow
   * @param {string} workflowName - Name of the workflow
   * @returns {Object} All transitions for the workflow
   */
  getAllTransitions(workflowName) {
    const workflow = this.getWorkflow(workflowName);

    if (!workflow || !workflow.transitions) {
      return {};
    }

    return workflow.transitions;
  }

  /**
   * Get next steps for a workflow state
   * @param {string} workflowName - Name of the workflow
   * @param {string} state - Current state
   * @returns {Object[]} Array of next step suggestions
   */
  getNextSteps(workflowName, state) {
    const transition = this.getTransitions(workflowName, state);

    if (!transition || !transition.next_steps) {
      return [];
    }

    return transition.next_steps.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  }

  /**
   * Find current state based on last command
   * @param {string} workflowName - Name of the workflow
   * @param {string} lastCommand - Last executed command
   * @returns {string|null} Current state or null if not found
   */
  findCurrentState(workflowName, lastCommand) {
    const workflow = this.getWorkflow(workflowName);

    if (!workflow || !workflow.transitions) {
      return null;
    }

    const normalizedCmd = this.normalizeCommand(lastCommand);

    for (const [state, transition] of Object.entries(workflow.transitions)) {
      if (transition.trigger) {
        const normalizedTrigger = this.normalizeCommand(transition.trigger);
        if (
          normalizedCmd.includes(normalizedTrigger) ||
          normalizedTrigger.includes(normalizedCmd)
        ) {
          return state;
        }
      }
    }

    return null;
  }

  /**
   * Get workflows by agent
   * @param {string} agentId - Agent identifier
   * @returns {Object[]} Workflows involving this agent
   */
  getWorkflowsByAgent(agentId) {
    const workflows = this.loadWorkflows();
    const normalizedAgent = agentId.replace('@', '').toLowerCase();
    const results = [];

    for (const [name, workflow] of Object.entries(workflows)) {
      if (workflow.agent_sequence) {
        const hasAgent = workflow.agent_sequence.some(
          (agent) => agent.toLowerCase() === normalizedAgent,
        );
        if (hasAgent) {
          results.push({ name, workflow });
        }
      }
    }

    return results;
  }

  /**
   * Normalize a command string for matching
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
   * Get registry statistics
   * @returns {Object} Statistics about the registry
   */
  getStats() {
    const workflows = this.loadWorkflows();
    const workflowNames = Object.keys(workflows);

    let totalTransitions = 0;
    let workflowsWithTransitions = 0;

    for (const workflow of Object.values(workflows)) {
      if (workflow.transitions) {
        workflowsWithTransitions++;
        totalTransitions += Object.keys(workflow.transitions).length;
      }
    }

    return {
      totalWorkflows: workflowNames.length,
      workflowsWithTransitions,
      totalTransitions,
      cacheValid: this.isCacheValid(),
      cacheAge: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null,
    };
  }
}

/**
 * Create a new WorkflowRegistry instance
 * @param {Object} options - Configuration options
 * @returns {WorkflowRegistry} New registry instance
 */
function createWorkflowRegistry(options = {}) {
  return new WorkflowRegistry(options);
}

module.exports = {
  WorkflowRegistry,
  createWorkflowRegistry,
  DEFAULT_CACHE_TTL,
  DEFAULT_PATTERNS_PATH,
};
