/**
 * L4 Task Layer Processor
 *
 * Injects task-specific context based on the currently active task.
 * Detects the active task from session.active_task and formats
 * task ID, story, and executor type as injectable rules.
 *
 * Returns null if no task is active (graceful skip).
 *
 * @module core/synapse/layers/l4-task
 * @version 1.0.0
 * @created Story SYN-5 - Layer Processors L4-L7
 */

const LayerProcessor = require('./layer-processor');

/**
 * L4 Task Processor
 *
 * Loads task context when a task is active in the session.
 * Returns null if no active task or task has no ID.
 *
 * @extends LayerProcessor
 */
class L4TaskProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'task', layer: 4, timeout: 20 });
  }

  /**
   * Load task-specific context as injectable rules.
   *
   * Detection flow:
   * 1. Get active task from session.active_task
   * 2. Validate task has an ID
   * 3. Extract id, story, executor_type
   * 4. Format as injectable rules
   *
   * @param {object} context
   * @param {string} context.prompt - Current prompt text
   * @param {object} context.session - Session state (SYN-2 schema)
   * @param {object} context.config - Config with synapsePath and manifest
   * @param {object[]} context.previousLayers - Results from previous layers
   * @returns {{ rules: string[], metadata: object } | null}
   */
  process(context) {
    const { session } = context;

    // 1. Get active task
    const task = session.active_task;
    if (!task || !task.id) {
      return null;
    }

    // 2. Extract task fields
    const taskId = task.id;
    const story = task.story || null;
    const executorType = task.executor_type || null;

    // 3. Format as injectable rules
    const rules = [];
    rules.push(`Active Task: ${taskId}`);
    if (story) {
      rules.push(`Story: ${story}`);
    }
    if (executorType) {
      rules.push(`Executor: ${executorType}`);
    }

    // 4. Return rules with metadata
    return {
      rules,
      metadata: {
        layer: 4,
        taskId,
        story,
        executorType,
      },
    };
  }
}

module.exports = L4TaskProcessor;
