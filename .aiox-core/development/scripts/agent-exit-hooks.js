/**
 * Agent Exit Hooks - Workflow Context Persistence
 *
 * INTEGRATION NOTE: This module defines the hook system.
 * Actual integration requires modifications to the agent activation framework
 * (not in scope for this story - see Story 6.1.6 for full agent framework integration)
 *
 * Hook Signature:
 *   onCommandComplete(agent, command, result, context)
 *
 * Purpose:
 * - Save workflow state when commands complete successfully
 * - Persist context (story_path, branch, epic) to session-state.json
 * - Enable workflow navigation on subsequent agent activation
 */

const _fs = require('fs');
const path = require('path');
const ContextDetector = require('../../core/session/context-detector');

const SESSION_STATE_PATH = path.join(process.cwd(), '.aiox', 'session-state.json');

/**
 * Agent exit hook - called when command completes
 * @param {string} agent - Agent ID (e.g., 'po', 'dev', 'qa')
 * @param {string} command - Command executed (e.g., 'validate-story-draft')
 * @param {Object} result - Command result { success: boolean, ... }
 * @param {Object} context - Execution context { story_path, branch, ... }
 */
function onCommandComplete(agent, command, result, context) {
  try {
    // Only save state for successful commands
    if (!result || result.success !== true) {
      return;
    }

    // Update session state
    const detector = new ContextDetector();
    const workflowState = detectWorkflowState(command, result);

    detector.updateSessionState({
      workflowActive: workflowState?.workflow || null,
      lastCommands: [command],
      agentSequence: [agent],
      context: {
        story_path: context.story_path || '',
        branch: context.branch || '',
        epic: context.epic || '',
        lastCommand: command,
        lastAgent: agent,
      },
    }, SESSION_STATE_PATH);
  } catch (error) {
    // Graceful degradation - hook failures must not break command execution
    console.warn('[AgentExitHooks] Hook failed:', error.message);
  }
}

/**
 * Detect workflow state from command completion
 * @param {string} command - Command that completed
 * @param {Object} result - Command result
 * @returns {Object|null} { workflow, state } or null
 */
function detectWorkflowState(command, _result) {
  // Map commands to workflow states
  const stateMap = {
    'validate-story-draft': { workflow: 'story_development', state: 'validated' },
    'develop': { workflow: 'story_development', state: 'in_development' },
    'review-qa': { workflow: 'story_development', state: 'qa_reviewed' },
    'create-epic': { workflow: 'epic_creation', state: 'epic_created' },
  };

  return stateMap[command] || null;
}

/**
 * Register hook in agent framework
 * INTEGRATION POINT: This needs to be called during agent initialization
 * @param {Object} agentFramework - Agent framework instance
 */
function registerHook(agentFramework) {
  if (!agentFramework || !agentFramework.registerCommandHook) {
    console.warn('[AgentExitHooks] Framework does not support hooks');
    return false;
  }

  agentFramework.registerCommandHook('onComplete', onCommandComplete);
  return true;
}

module.exports = {
  onCommandComplete,
  registerHook,
  detectWorkflowState,
};
