/**
 * @fileoverview Local PM Adapter (Standalone Mode)
 *
 * No-op adapter for standalone AIOX operation without external PM tool.
 * All story management happens via local YAML files and git.
 *
 * This adapter enables 100% AIOX functionality without requiring
 * ClickUp, Jira, GitHub Projects, or any other PM tool.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.5)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { PMAdapter } = require('../../scripts/pm-adapter');

/**
 * Local adapter - standalone mode with no external PM tool
 *
 * All operations return success without making external API calls.
 * Story management happens entirely via local YAML files and git versioning.
 */
class LocalAdapter extends PMAdapter {
  /**
   * Create Local adapter instance
   * @param {object} [config={}] - Config (not required for local adapter)
   */
  constructor(config = {}) {
    super(config);
  }

  /**
   * Sync local story (no-op - story already local)
   *
   * In local mode, the YAML file IS the source of truth.
   * No external sync needed.
   *
   * @param {string} storyPath - Path to story YAML file
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async syncStory(storyPath) {
    try {
      // Verify file exists
      if (!fs.existsSync(storyPath)) {
        return {
          success: false,
          error: `Story file not found: ${storyPath}`,
        };
      }

      // Read story and extract frontmatter (YAML between first --- and second ---)
      const storyContent = fs.readFileSync(storyPath, 'utf8');
      const frontmatterMatch = storyContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);

      if (!frontmatterMatch) {
        return {
          success: false,
          error: 'Invalid story file: missing YAML frontmatter',
        };
      }

      const story = yaml.load(frontmatterMatch[1]);

      if (!story || !story.id) {
        return {
          success: false,
          error: 'Invalid story file: missing id field in frontmatter',
        };
      }

      console.log(`✅ Story ${story.id} managed locally (no PM tool configured)`);

      // Return success - file path is the "URL"
      return {
        success: true,
        url: `file://${path.resolve(storyPath)}`,
      };

    } catch (error) {
      console.error('❌ Error validating local story:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull story updates (no-op - local file is source of truth)
   *
   * In local mode, there's no external source to pull from.
   * The local YAML file is always the most current version.
   *
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
   */
  async pullStory(storyId) {
    console.log(`ℹ️  Local-only mode: Story ${storyId} file is source of truth`);

    return {
      success: true,
      updates: null,  // No updates from external source
    };
  }

  /**
   * Create new story (local YAML file creation)
   *
   * In local mode, "creating" a story means the YAML file was created.
   * This method just validates that the file exists.
   *
   * @param {object} storyData - Story metadata
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createStory(storyData) {
    if (!storyData || !storyData.id) {
      return {
        success: false,
        error: 'Story data missing required field: id',
      };
    }

    console.log(`✅ Story ${storyData.id} created locally`);

    return {
      success: true,
      url: null,  // No external URL in local mode
    };
  }

  /**
   * Update story status (local YAML update)
   *
   * In local mode, status is updated directly in the YAML file.
   * This method just acknowledges the update.
   *
   * @param {string} storyId - Story ID
   * @param {string} status - New status
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateStatus(storyId, status) {
    console.log(`✅ Story ${storyId} status updated to ${status} (local)`);

    return {
      success: true,
    };
  }

  /**
   * Test connection (always succeeds - no connection needed)
   *
   * Local adapter doesn't require any external connections.
   * Always returns success.
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testConnection() {
    console.log('✅ Local-only mode: No PM tool connection needed');

    return {
      success: true,
    };
  }

  /**
   * Get adapter name
   * @returns {string} "Local" (overrides base class to return cleaner name)
   */
  getName() {
    return 'Local';
  }
}

module.exports = { LocalAdapter };
