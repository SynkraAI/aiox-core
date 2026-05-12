/**
 * @fileoverview ClickUp Project Management Adapter
 *
 * Wraps existing ClickUp integration in the PM adapter pattern.
 * Preserves all existing ClickUp functionality while providing
 * a standardized interface for PM tool operations.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.2)
 */

const fs = require('fs');
const _path = require('path');
const yaml = require('js-yaml');
const { PMAdapter } = require('../../scripts/pm-adapter');
const {
  updateStoryStatus,
  updateTaskDescription,
  addTaskComment,
  verifyEpicExists,
} = require('../../scripts/clickup-helpers');

/**
 * ClickUp adapter - integrates with ClickUp for story management
 *
 * Uses existing ClickUp helper functions to maintain backward compatibility.
 * Authenticates via CLICKUP_API_TOKEN environment variable.
 */
class ClickUpAdapter extends PMAdapter {
  /**
   * Create ClickUp adapter instance
   * @param {object} config - ClickUp configuration
   * @param {string} config.api_token - API token (usually "${CLICKUP_API_TOKEN}")
   * @param {string} config.team_id - Team ID
   * @param {string} config.space_id - Space ID
   * @param {string} config.list_id - List ID for stories
   */
  constructor(config) {
    super(config);

    // Validate required configuration
    if (!config) {
      throw new Error('ClickUp config required');
    }

    this.apiToken = process.env.CLICKUP_API_TOKEN || config.api_token;
    this.teamId = config.team_id;
    this.spaceId = config.space_id;
    this.listId = config.list_id;

    if (!this.apiToken) {
      console.warn('⚠️  CLICKUP_API_TOKEN not set - ClickUp operations will fail');
    }
  }

  /**
   * Sync local story to ClickUp
   *
   * Updates the ClickUp task with the current story content.
   * Creates task if it doesn't exist (based on story ID tag).
   *
   * @param {string} storyPath - Path to story YAML file
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async syncStory(storyPath) {
    try {
      // Read story file
      if (!fs.existsSync(storyPath)) {
        return {
          success: false,
          error: `Story file not found: ${storyPath}`,
        };
      }

      const storyContent = fs.readFileSync(storyPath, 'utf8');
      const story = yaml.load(storyContent);

      if (!story || !story.id) {
        return {
          success: false,
          error: 'Invalid story file: missing id field',
        };
      }

      console.log(`📤 Syncing story ${story.id} to ClickUp...`);

      // Find ClickUp task by story ID
      // For now, we assume the task exists and has the story ID in metadata
      // Future enhancement: Search by story-id tag
      const taskId = await this._findTaskByStoryId(story.id);

      if (taskId) {
        // Update existing task
        await updateTaskDescription(taskId, storyContent);
        await updateStoryStatus(taskId, story.status);

        // Add changelog comment if recent changes
        if (story.change_log && story.change_log.length > 0) {
          const latestChange = story.change_log[story.change_log.length - 1];
          const changeComment = `**Change Log Update**\n\nDate: ${latestChange.date}\nVersion: ${latestChange.version}\n\n${latestChange.description}`;
          await addTaskComment(taskId, changeComment);
        }

        console.log(`✅ Story ${story.id} synced to ClickUp`);

        return {
          success: true,
          url: `https://app.clickup.com/t/${taskId}`,
        };
      } else {
        // Task not found - would need to create it
        // For now, return error (creation handled separately)
        return {
          success: false,
          error: `ClickUp task not found for story ${story.id}. Use createStory() to create it first.`,
        };
      }

    } catch (error) {
      console.error('❌ Error syncing story to ClickUp:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull story updates from ClickUp
   *
   * NOTE: Currently returns no updates (local file is source of truth).
   * Future enhancement: Compare ClickUp task fields with local story.
   *
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
   */
  async pullStory(storyId) {
    try {
      console.log(`📥 Pulling story ${storyId} from ClickUp...`);

      const taskId = await this._findTaskByStoryId(storyId);

      if (!taskId) {
        return {
          success: false,
          error: `ClickUp task not found for story ${storyId}`,
        };
      }

      // Get task from ClickUp
      const tool = await this._getClickUpTool();
      const _task = await tool.getTask({ taskId });

      // For now, just confirm it exists
      // Future: Compare task fields with local story and return differences
      console.log(`✅ Story ${storyId} found in ClickUp (no updates)`);

      return {
        success: true,
        updates: null,  // No updates for now
      };

    } catch (error) {
      console.error('❌ Error pulling story from ClickUp:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create new story in ClickUp
   *
   * Creates a ClickUp task in the configured list with story metadata.
   *
   * @param {object} storyData - Story metadata
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createStory(storyData) {
    try {
      console.log(`📝 Creating story ${storyData.id} in ClickUp...`);

      // Verify epic exists
      if (storyData.epic) {
        const epicNum = parseInt(storyData.epic.split('-')[0]);
        await verifyEpicExists(epicNum);
      }

      const tool = await this._getClickUpTool();

      // Create task in ClickUp
      const result = await tool.createTask({
        listId: this.listId,
        name: `${storyData.id}: ${storyData.title}`,
        description: storyData.description || '',
        tags: [
          'story',
          `story-${storyData.id}`,
          ...(storyData.epic ? [`epic-${storyData.epic}`] : []),
        ],
        custom_fields: [
          {
            id: 'story-status',
            value: storyData.status || 'Draft',
          },
        ],
      });

      console.log(`✅ Story ${storyData.id} created in ClickUp`);

      return {
        success: true,
        url: `https://app.clickup.com/t/${result.id}`,
      };

    } catch (error) {
      console.error('❌ Error creating story in ClickUp:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update story status in ClickUp
   *
   * @param {string} storyId - Story ID
   * @param {string} status - New status
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateStatus(storyId, status) {
    try {
      console.log(`📊 Updating story ${storyId} status to ${status}...`);

      const taskId = await this._findTaskByStoryId(storyId);

      if (!taskId) {
        return {
          success: false,
          error: `ClickUp task not found for story ${storyId}`,
        };
      }

      await updateStoryStatus(taskId, status);

      console.log(`✅ Story ${storyId} status updated to ${status}`);

      return { success: true };

    } catch (error) {
      console.error('❌ Error updating story status:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test connection to ClickUp
   *
   * Validates API token by attempting to fetch workspace tasks.
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testConnection() {
    try {
      if (!this.apiToken) {
        return {
          success: false,
          error: 'CLICKUP_API_TOKEN not configured',
        };
      }

      console.log('🔌 Testing ClickUp connection...');

      const tool = await this._getClickUpTool();

      // Try to fetch a single task to validate connection
      await tool.getWorkspaceTasks({ limit: 1 });

      console.log('✅ ClickUp connection successful');

      return { success: true };

    } catch (error) {
      console.error('❌ ClickUp connection failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get ClickUp MCP tool
   * @private
   * @returns {Promise<object>} ClickUp tool functions
   */
  async _getClickUpTool() {
    try {
      const { resolveTool } = require('../../scripts/tool-resolver');
      return await resolveTool('clickup');
    } catch (_error) {
      // Fall back to global references
      return {
        updateTask: global.mcp__clickup__update_task,
        createComment: global.mcp__clickup__create_task_comment,
        getTask: global.mcp__clickup__get_task,
        createTask: global.mcp__clickup__create_task,
        getWorkspaceTasks: global.mcp__clickup__get_workspace_tasks,
      };
    }
  }

  /**
   * Find ClickUp task ID by story ID
   * @private
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<string|null>} Task ID or null if not found
   */
  async _findTaskByStoryId(storyId) {
    try {
      const tool = await this._getClickUpTool();

      // Search for task by story-{id} tag
      const result = await tool.getWorkspaceTasks({
        tags: [`story-${storyId}`],
      });

      if (result && result.tasks && result.tasks.length > 0) {
        // Return first matching task
        return result.tasks[0].id;
      }

      return null;
    } catch (error) {
      console.warn(`Warning: Could not search for story ${storyId}:`, error.message);
      return null;
    }
  }
}

module.exports = { ClickUpAdapter };
