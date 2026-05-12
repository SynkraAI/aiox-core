/**
 * @fileoverview Base interface for Project Management tool adapters
 *
 * This file defines the PMAdapter base class that all PM tool adapters must extend.
 * Supports ClickUp, GitHub Projects, Jira, and local-only modes.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration
 */

/**
 * Base class for Project Management tool adapters
 *
 * All PM tool adapters (ClickUp, GitHub, Jira, Local) must extend this class
 * and implement all abstract methods.
 *
 * @abstract
 */
class PMAdapter {
  /**
   * Create a PM adapter instance
   * @param {object} config - Adapter-specific configuration
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Sync local story to PM tool
   *
   * Pushes the current state of a story YAML file to the configured PM tool.
   * Creates or updates the corresponding item in the PM tool.
   *
   * @param {string} storyPath - Absolute path to story YAML file
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   * @throws {Error} If not implemented by subclass
   *
   * @example
   * const result = await adapter.syncStory('/path/to/story/3.20.yaml');
   * if (result.success) {
   *   console.log('Story synced:', result.url);
   * }
   */
  async syncStory(_storyPath) {
    throw new Error('syncStory must be implemented by adapter');
  }

  /**
   * Pull story updates from PM tool
   *
   * Retrieves the current state of a story from the PM tool and returns
   * any updates that differ from the local YAML file.
   *
   * @param {string} storyId - Story ID (e.g., "3.14")
   * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
   * @throws {Error} If not implemented by subclass
   *
   * @example
   * const result = await adapter.pullStory('3.20');
   * if (result.success && result.updates) {
   *   console.log('Story has updates:', result.updates);
   * }
   */
  async pullStory(_storyId) {
    throw new Error('pullStory must be implemented by adapter');
  }

  /**
   * Create new story in PM tool
   *
   * Creates a new item in the PM tool based on story metadata.
   * Does not modify the local YAML file.
   *
   * @param {object} storyData - Story metadata (id, title, description, etc.)
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   * @throws {Error} If not implemented by subclass
   *
   * @example
   * const result = await adapter.createStory({
   *   id: '3.20',
   *   title: 'PM Tool-Agnostic Integration',
   *   description: 'Remove hard-coded ClickUp dependency'
   * });
   */
  async createStory(_storyData) {
    throw new Error('createStory must be implemented by adapter');
  }

  /**
   * Update story status in PM tool
   *
   * Updates only the status field of a story in the PM tool.
   * Useful for workflow state transitions (Draft → InProgress → Done).
   *
   * @param {string} storyId - Story ID (e.g., "3.14")
   * @param {string} status - New status (Draft, InProgress, Review, Done)
   * @returns {Promise<{success: boolean, error?: string}>}
   * @throws {Error} If not implemented by subclass
   *
   * @example
   * await adapter.updateStatus('3.20', 'InProgress');
   */
  async updateStatus(_storyId, _status) {
    throw new Error('updateStatus must be implemented by adapter');
  }

  /**
   * Test connection to PM tool
   *
   * Validates that the adapter can connect to the PM tool with the
   * provided configuration. Used during initial setup.
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   * @throws {Error} If not implemented by subclass
   *
   * @example
   * const result = await adapter.testConnection();
   * if (!result.success) {
   *   console.error('Connection failed:', result.error);
   * }
   */
  async testConnection() {
    throw new Error('testConnection must be implemented by adapter');
  }

  /**
   * Get adapter name
   * @returns {string} Adapter name (e.g., 'ClickUp', 'GitHub Projects')
   */
  getName() {
    return this.constructor.name.replace('Adapter', '');
  }
}

module.exports = { PMAdapter };
