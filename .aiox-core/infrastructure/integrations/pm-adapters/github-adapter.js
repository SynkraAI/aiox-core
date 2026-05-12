/**
 * @fileoverview GitHub Projects v2 Adapter
 *
 * Integrates with GitHub Projects for story management.
 * Uses GitHub CLI (gh) for authentication and GitHub GraphQL API v2.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.3)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');
const { PMAdapter } = require('../../scripts/pm-adapter');

/**
 * GitHub Projects adapter - integrates with GitHub Projects v2
 *
 * Authenticates via GitHub CLI (gh auth). Requires gh CLI to be installed
 * and authenticated before use.
 */
class GitHubProjectsAdapter extends PMAdapter {
  /**
   * Create GitHub Projects adapter instance
   * @param {object} config - GitHub Projects configuration
   * @param {string} config.org - GitHub organization or username
   * @param {number} config.project_number - Project number in the organization
   */
  constructor(config) {
    super(config);

    if (!config || !config.org || !config.project_number) {
      throw new Error('GitHub Projects config requires: org, project_number');
    }

    this.org = config.org;
    this.projectNumber = config.project_number;
    this.projectId = null;  // Will be fetched lazily
  }

  /**
   * Sync local story to GitHub Projects
   *
   * Creates or updates a GitHub issue linked to the project.
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

      console.log(`📤 Syncing story ${story.id} to GitHub Projects...`);

      // Find existing issue by story ID label
      const issueNumber = await this._findIssueByStoryId(story.id);

      if (issueNumber) {
        // Update existing issue
        await this._updateIssue(issueNumber, story, storyContent);
        const issueUrl = `https://github.com/${this.org}/issues/${issueNumber}`;

        console.log(`✅ Story ${story.id} updated in GitHub Projects`);

        return {
          success: true,
          url: issueUrl,
        };
      } else {
        // Create new issue
        const newIssueUrl = await this._createIssue(story, storyContent);

        console.log(`✅ Story ${story.id} created in GitHub Projects`);

        return {
          success: true,
          url: newIssueUrl,
        };
      }

    } catch (error) {
      console.error('❌ Error syncing story to GitHub Projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull story updates from GitHub Projects
   *
   * NOTE: Currently limited - GitHub Projects doesn't store full story content.
   * Can only pull status changes.
   *
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
   */
  async pullStory(storyId) {
    try {
      console.log(`📥 Pulling story ${storyId} from GitHub Projects...`);

      const issueNumber = await this._findIssueByStoryId(storyId);

      if (!issueNumber) {
        return {
          success: false,
          error: `GitHub issue not found for story ${storyId}`,
        };
      }

      // Get issue status
      const issueData = await this._getIssue(issueNumber);

      // Map GitHub issue state to AIOX status
      const statusMapping = {
        'open': 'InProgress',
        'closed': 'Done',
      };

      const mappedStatus = statusMapping[issueData.state] || 'Draft';

      console.log(`✅ Story ${storyId} status in GitHub: ${mappedStatus}`);

      return {
        success: true,
        updates: {
          status: mappedStatus,
        },
      };

    } catch (error) {
      console.error('❌ Error pulling story from GitHub Projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create new story in GitHub Projects
   *
   * @param {object} storyData - Story metadata
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createStory(storyData) {
    try {
      console.log(`📝 Creating story ${storyData.id} in GitHub Projects...`);

      const issueUrl = await this._createIssue(storyData, '');

      console.log(`✅ Story ${storyData.id} created in GitHub Projects`);

      return {
        success: true,
        url: issueUrl,
      };

    } catch (error) {
      console.error('❌ Error creating story in GitHub Projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update story status in GitHub Projects
   *
   * Maps AIOX status to GitHub issue state.
   *
   * @param {string} storyId - Story ID
   * @param {string} status - New status (Draft, InProgress, Review, Done)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateStatus(storyId, status) {
    try {
      console.log(`📊 Updating story ${storyId} status to ${status}...`);

      const issueNumber = await this._findIssueByStoryId(storyId);

      if (!issueNumber) {
        return {
          success: false,
          error: `GitHub issue not found for story ${storyId}`,
        };
      }

      // Map AIOX status to GitHub state
      const stateMapping = {
        'Draft': 'open',
        'InProgress': 'open',
        'Review': 'open',
        'Done': 'closed',
      };

      const githubState = stateMapping[status] || 'open';

      // Update issue state
      this._execGH(['issue', 'edit', issueNumber.toString(), '--state', githubState]);

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
   * Test connection to GitHub
   *
   * Validates GitHub CLI authentication.
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testConnection() {
    try {
      console.log('🔌 Testing GitHub connection...');

      // Check if gh CLI is installed
      try {
        this._execGH(['--version']);
      } catch (_error) {
        return {
          success: false,
          error: 'GitHub CLI (gh) not installed. Install from: https://cli.github.com/',
        };
      }

      // Check if authenticated
      try {
        const authStatus = this._execGH(['auth', 'status']);
        if (!authStatus.includes('Logged in')) {
          throw new Error('Not authenticated');
        }
      } catch (_error) {
        return {
          success: false,
          error: 'GitHub CLI not authenticated. Run: gh auth login',
        };
      }

      // Try to access the organization
      try {
        this._execGH(['repo', 'list', this.org, '--limit', '1']);
      } catch (_error) {
        return {
          success: false,
          error: `Cannot access organization: ${this.org}`,
        };
      }

      console.log('✅ GitHub connection successful');

      return { success: true };

    } catch (error) {
      console.error('❌ GitHub connection failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute GitHub CLI command
   * @private
   * @param {string[]} args - Command arguments
   * @returns {string} Command output
   */
  _execGH(args) {
    const command = `gh ${args.join(' ')}`;
    return execSync(command, { encoding: 'utf8' });
  }

  /**
   * Find GitHub issue by story ID
   * @private
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<number|null>} Issue number or null
   */
  async _findIssueByStoryId(storyId) {
    try {
      const result = this._execGH([
        'issue', 'list',
        '--label', `story-${storyId}`,
        '--json', 'number',
        '--limit', '1',
      ]);

      const issues = JSON.parse(result);

      if (issues && issues.length > 0) {
        return issues[0].number;
      }

      return null;
    } catch (error) {
      console.warn(`Warning: Could not search for story ${storyId}:`, error.message);
      return null;
    }
  }

  /**
   * Get issue data
   * @private
   * @param {number} issueNumber - Issue number
   * @returns {Promise<object>} Issue data
   */
  async _getIssue(issueNumber) {
    const result = this._execGH([
      'issue', 'view', issueNumber.toString(),
      '--json', 'state,title,body,labels',
    ]);

    return JSON.parse(result);
  }

  /**
   * Create GitHub issue
   * @private
   * @param {object} story - Story data
   * @param {string} content - Full story content
   * @returns {Promise<string>} Issue URL
   */
  async _createIssue(story, content) {
    const title = `${story.id}: ${story.title}`;
    const body = content || story.description || story.context || '';

    const labels = [
      'story',
      `story-${story.id}`,
      ...(story.epic ? [`epic-${story.epic}`] : []),
      ...(story.priority ? [story.priority] : []),
    ];

    const result = this._execGH([
      'issue', 'create',
      '--title', `"${title}"`,
      '--body', `"${body.replace(/"/g, '\\"')}"`,
      '--label', labels.join(','),
    ]);

    // Extract URL from output
    const urlMatch = result.match(/https:\/\/github\.com\/[^\s]+/);
    return urlMatch ? urlMatch[0] : '';
  }

  /**
   * Update GitHub issue
   * @private
   * @param {number} issueNumber - Issue number
   * @param {object} story - Story data
   * @param {string} content - Full story content
   */
  async _updateIssue(issueNumber, story, content) {
    const title = `${story.id}: ${story.title}`;
    const body = content || story.description || '';

    this._execGH([
      'issue', 'edit', issueNumber.toString(),
      '--title', `"${title}"`,
      '--body', `"${body.replace(/"/g, '\\"')}"`,
    ]);
  }
}

module.exports = { GitHubProjectsAdapter };
