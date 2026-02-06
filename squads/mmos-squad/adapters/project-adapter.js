/**
 * Project Adapter - MMOS Squad
 *
 * Thin wrapper that delegates to ClickUp service for project/task management.
 * Uses: clickup
 *
 * @module mmos-squad/adapters/project-adapter
 * @version 1.0.0
 * @story STORY-10.3
 */

// Infrastructure service path
const SERVICES_PATH = '../../../.aios-core/infrastructure/services';

/**
 * ProjectAdapter - Unified interface for project and task management
 *
 * Supported operations:
 * - Task CRUD operations
 * - Status updates
 * - Comments management
 * - Custom field updates
 */
class ProjectAdapter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} [options.workspaceId] - Default workspace ID
   * @param {string} [options.listId] - Default list ID
   * @param {boolean} [options.silent=false] - Suppress logs
   */
  constructor(options = {}) {
    this.options = {
      workspaceId: options.workspaceId ?? process.env.CLICKUP_WORKSPACE_ID,
      listId: options.listId ?? process.env.CLICKUP_LIST_ID,
      silent: options.silent ?? false,
    };

    // Lazy-load clickup service
    this._clickup = null;
  }

  /**
   * Get ClickUp service module (lazy initialization)
   * @private
   */
  get clickup() {
    if (!this._clickup) {
      this._clickup = require(`${SERVICES_PATH}/clickup`);
    }
    return this._clickup;
  }

  // ============================================
  // Task Operations
  // ============================================

  /**
   * Get a task by ID
   *
   * @param {string} taskId - ClickUp task ID
   * @returns {Promise<Object>} Task data
   */
  async getTask(taskId) {
    return this.clickup.getTask(taskId);
  }

  /**
   * Create a new task
   *
   * @param {Object} taskData - Task data
   * @param {string} taskData.name - Task name
   * @param {string} [taskData.description] - Task description
   * @param {string} [taskData.status] - Initial status
   * @param {Array<string>} [taskData.tags] - Task tags
   * @param {Object} [options] - Creation options
   * @param {string} [options.listId] - List ID (uses default if not provided)
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData, options = {}) {
    const listId = options.listId ?? this.options.listId;
    if (!listId) {
      throw new Error('List ID required for task creation');
    }
    return this.clickup.createTask(listId, taskData);
  }

  /**
   * Update an existing task
   *
   * @param {string} taskId - Task ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, updates) {
    return this.clickup.updateTask(taskId, updates);
  }

  /**
   * Delete a task
   *
   * @param {string} taskId - Task ID to delete
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    return this.clickup.deleteTask(taskId);
  }

  // ============================================
  // Status Management
  // ============================================

  /**
   * Update task status
   *
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated task
   */
  async updateStatus(taskId, status) {
    return this.clickup.updateStatus(taskId, status);
  }

  /**
   * Get available statuses for a list
   *
   * @param {string} [listId] - List ID (uses default if not provided)
   * @returns {Promise<Array<Object>>} Available statuses
   */
  async getStatuses(listId) {
    const targetListId = listId ?? this.options.listId;
    return this.clickup.getStatuses(targetListId);
  }

  // ============================================
  // Comments Management
  // ============================================

  /**
   * Add comment to a task
   *
   * @param {string} taskId - Task ID
   * @param {string} comment - Comment text
   * @returns {Promise<Object>} Created comment
   */
  async addComment(taskId, comment) {
    return this.clickup.addComment(taskId, comment);
  }

  /**
   * Get comments for a task
   *
   * @param {string} taskId - Task ID
   * @returns {Promise<Array<Object>>} Task comments
   */
  async getComments(taskId) {
    return this.clickup.getComments(taskId);
  }

  // ============================================
  // Custom Fields
  // ============================================

  /**
   * Update custom field value
   *
   * @param {string} taskId - Task ID
   * @param {string} fieldId - Custom field ID
   * @param {*} value - Field value
   * @returns {Promise<Object>} Updated task
   */
  async updateCustomField(taskId, fieldId, value) {
    return this.clickup.updateCustomField(taskId, fieldId, value);
  }

  /**
   * Get custom fields for a list
   *
   * @param {string} [listId] - List ID (uses default if not provided)
   * @returns {Promise<Array<Object>>} Custom fields
   */
  async getCustomFields(listId) {
    const targetListId = listId ?? this.options.listId;
    return this.clickup.getCustomFields(targetListId);
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Create multiple tasks in batch
   *
   * @param {Array<Object>} tasks - Array of task data
   * @param {Object} [options] - Batch options
   * @param {string} [options.listId] - List ID for all tasks
   * @param {boolean} [options.continueOnError=true] - Continue on individual errors
   * @returns {Promise<Array<Object>>} Creation results
   */
  async batchCreateTasks(tasks, options = {}) {
    const listId = options.listId ?? this.options.listId;
    const continueOnError = options.continueOnError ?? true;
    const results = [];

    for (const taskData of tasks) {
      try {
        const result = await this.createTask(taskData, { listId });
        results.push({ taskData, success: true, result });
      } catch (error) {
        if (!continueOnError) throw error;
        results.push({ taskData, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Update multiple tasks in batch
   *
   * @param {Array<Object>} updates - Array of { taskId, updates }
   * @param {Object} [options] - Batch options
   * @param {boolean} [options.continueOnError=true] - Continue on individual errors
   * @returns {Promise<Array<Object>>} Update results
   */
  async batchUpdateTasks(updates, options = {}) {
    const continueOnError = options.continueOnError ?? true;
    const results = [];

    for (const { taskId, updates: taskUpdates } of updates) {
      try {
        const result = await this.updateTask(taskId, taskUpdates);
        results.push({ taskId, success: true, result });
      } catch (error) {
        if (!continueOnError) throw error;
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  // ============================================
  // MMOS-Specific Operations
  // ============================================

  /**
   * Create a mind mapping project task
   *
   * @param {Object} mindData - Mind mapping project data
   * @param {string} mindData.subjectName - Subject/persona name
   * @param {string} mindData.description - Project description
   * @param {Array<string>} [mindData.sources] - Initial sources
   * @returns {Promise<Object>} Created project task
   */
  async createMindProject(mindData) {
    return this.createTask({
      name: `Mind Mapping: ${mindData.subjectName}`,
      description: mindData.description,
      tags: ['mmos', 'mind-mapping'],
      custom_fields: [
        { name: 'subject_name', value: mindData.subjectName },
        { name: 'sources_count', value: mindData.sources?.length ?? 0 },
      ],
    });
  }

  /**
   * Update mind project progress
   *
   * @param {string} taskId - Project task ID
   * @param {Object} progress - Progress data
   * @param {number} [progress.sourcesProcessed] - Number of sources processed
   * @param {number} [progress.totalSources] - Total sources
   * @param {string} [progress.currentPhase] - Current phase
   * @returns {Promise<Object>} Updated task
   */
  async updateMindProjectProgress(taskId, progress) {
    const comment = 'Progress Update:\n' +
      `- Sources: ${progress.sourcesProcessed ?? 0}/${progress.totalSources ?? 0}\n` +
      `- Phase: ${progress.currentPhase ?? 'processing'}`;

    await this.addComment(taskId, comment);

    return this.updateTask(taskId, {
      custom_fields: [
        { name: 'sources_processed', value: progress.sourcesProcessed },
        { name: 'current_phase', value: progress.currentPhase },
      ],
    });
  }
}

/**
 * Factory function to create ProjectAdapter instance
 *
 * @param {Object} [options] - Configuration options
 * @returns {ProjectAdapter} Adapter instance
 */
function createProjectAdapter(options = {}) {
  return new ProjectAdapter(options);
}

module.exports = {
  ProjectAdapter,
  createProjectAdapter,
};
