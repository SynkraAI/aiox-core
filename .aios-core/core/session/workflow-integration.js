/**
 * Workflow Integration Helper
 *
 * Provides reusable helper functions for updating session context
 * during workflow execution. Can be used by any workflow runner.
 *
 * Story CLI-DX-1: Visual Context System integration
 *
 * @module session/workflow-integration
 */

const { SessionStateManager } = require('./state-manager');

/**
 * Update session context for workflow start.
 *
 * @param {Object} workflow - Workflow definition
 * @param {string} workflow.name - Workflow name
 * @param {string} workflow.emoji - Workflow emoji (optional)
 * @param {Array} workflow.steps - Workflow steps
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<void>}
 */
async function workflowStart(workflow, projectRoot = process.cwd()) {
  const stateManager = new SessionStateManager(projectRoot);
  const totalSteps = workflow.steps?.length || 0;

  await stateManager.update({
    status: {
      phase: 'workflow',
      progress: `0/${totalSteps}`,
      currentTask: workflow.name || 'Workflow',
      emoji: workflow.emoji || '⚙️',
    },
    metadata: {
      workflowActive: workflow.name,
      workflowStartedAt: new Date().toISOString(),
    },
  });
}

/**
 * Update session context for workflow step.
 *
 * @param {Object} step - Current step definition
 * @param {number} stepIndex - Current step index (0-based)
 * @param {number} totalSteps - Total number of steps
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<void>}
 */
async function workflowStep(step, stepIndex, totalSteps, projectRoot = process.cwd()) {
  const stateManager = new SessionStateManager(projectRoot);

  await stateManager.update({
    status: {
      phase: step.phase || 'workflow',
      progress: `${stepIndex + 1}/${totalSteps}`,
      currentTask: step.name || step.task || `Step ${stepIndex + 1}`,
      emoji: step.emoji || '⚙️',
    },
  });
}

/**
 * Update session context for workflow completion.
 *
 * @param {Object} workflow - Workflow definition
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<void>}
 */
async function workflowComplete(workflow, projectRoot = process.cwd()) {
  const stateManager = new SessionStateManager(projectRoot);
  const totalSteps = workflow.steps?.length || 0;

  await stateManager.update({
    status: {
      phase: 'completed',
      progress: `${totalSteps}/${totalSteps}`,
      currentTask: 'Workflow complete',
      emoji: '✅',
    },
    metadata: {
      workflowActive: null,
      workflowCompletedAt: new Date().toISOString(),
    },
  });
}

/**
 * Update session context for workflow error.
 *
 * @param {Error} error - Error object
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<void>}
 */
async function workflowError(error, projectRoot = process.cwd()) {
  const stateManager = new SessionStateManager(projectRoot);

  await stateManager.update({
    status: {
      phase: 'error',
      currentTask: `Error: ${error.message}`,
      emoji: '❌',
    },
    metadata: {
      workflowActive: null,
      lastError: error.message,
    },
  });
}

/**
 * Execute workflow with automatic context updates.
 * Wraps workflow execution with start/step/complete updates.
 *
 * @param {Object} workflow - Workflow definition with steps array
 * @param {Function} stepExecutor - Function to execute each step (async)
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object>} Execution result {success, stepsCompleted, error}
 */
async function executeWorkflowWithContext(workflow, stepExecutor, projectRoot = process.cwd()) {
  try {
    await workflowStart(workflow, projectRoot);

    const totalSteps = workflow.steps?.length || 0;
    let stepsCompleted = 0;

    for (let i = 0; i < totalSteps; i++) {
      const step = workflow.steps[i];
      await workflowStep(step, i, totalSteps, projectRoot);

      // Execute step
      await stepExecutor(step, i);
      stepsCompleted++;
    }

    await workflowComplete(workflow, projectRoot);

    return {
      success: true,
      stepsCompleted,
      totalSteps,
    };

  } catch (error) {
    await workflowError(error, projectRoot);

    return {
      success: false,
      error: error.message,
      stepsCompleted: 0,
    };
  }
}

module.exports = {
  workflowStart,
  workflowStep,
  workflowComplete,
  workflowError,
  executeWorkflowWithContext,
};
