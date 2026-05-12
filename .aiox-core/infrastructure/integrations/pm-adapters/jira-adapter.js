/**
 * @fileoverview Jira REST API Adapter (Basic Support)
 *
 * Basic integration with Jira for story management using REST API v3.
 * Supports create issue, update status, and simple field mapping.
 *
 * Limitations (v1.0):
 * - No custom field support beyond basic mapping
 * - No complex workflow handling
 * - No Jira automation rules
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.4)
 */

const https = require('https');
const fs = require('fs');
const yaml = require('js-yaml');
const { PMAdapter } = require('../../scripts/pm-adapter');

/**
 * Jira adapter - basic integration with Jira
 *
 * Authenticates via API token (environment variable JIRA_API_TOKEN).
 * Uses Jira REST API v3.
 */
class JiraAdapter extends PMAdapter {
  /**
   * Create Jira adapter instance
   * @param {object} config - Jira configuration
   * @param {string} config.base_url - Jira instance URL (e.g., https://company.atlassian.net)
   * @param {string} config.api_token - API token (usually "${JIRA_API_TOKEN}")
   * @param {string} config.email - Jira account email for authentication
   * @param {string} config.project_key - Project key (e.g., "AIOX")
   */
  constructor(config) {
    super(config);

    if (!config || !config.base_url || !config.project_key) {
      throw new Error('Jira config requires: base_url, project_key');
    }

    this.baseUrl = config.base_url.replace(/\/$/, '');  // Remove trailing slash
    this.projectKey = config.project_key;
    this.email = config.email || process.env.JIRA_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN || config.api_token;

    if (!this.apiToken) {
      console.warn('⚠️  JIRA_API_TOKEN not set - Jira operations will fail');
    }

    if (!this.email) {
      console.warn('⚠️  JIRA_EMAIL not set - authentication may fail');
    }
  }

  /**
   * Sync local story to Jira
   *
   * Creates or updates a Jira issue with story content.
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

      console.log(`📤 Syncing story ${story.id} to Jira...`);

      // Find existing issue by story ID label
      const issueKey = await this._findIssueByStoryId(story.id);

      if (issueKey) {
        // Update existing issue
        await this._updateIssue(issueKey, story);
        const issueUrl = `${this.baseUrl}/browse/${issueKey}`;

        console.log(`✅ Story ${story.id} updated in Jira`);

        return {
          success: true,
          url: issueUrl,
        };
      } else {
        // Create new issue
        const newIssueKey = await this._createIssue(story);
        const issueUrl = `${this.baseUrl}/browse/${newIssueKey}`;

        console.log(`✅ Story ${story.id} created in Jira`);

        return {
          success: true,
          url: issueUrl,
        };
      }

    } catch (error) {
      console.error('❌ Error syncing story to Jira:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull story updates from Jira
   *
   * NOTE: Limited - can only pull status changes, not full content.
   *
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
   */
  async pullStory(storyId) {
    try {
      console.log(`📥 Pulling story ${storyId} from Jira...`);

      const issueKey = await this._findIssueByStoryId(storyId);

      if (!issueKey) {
        return {
          success: false,
          error: `Jira issue not found for story ${storyId}`,
        };
      }

      // Get issue data
      const issue = await this._getIssue(issueKey);

      // Map Jira status to AIOX status
      const statusMapping = {
        'To Do': 'Draft',
        'In Progress': 'InProgress',
        'In Review': 'Review',
        'Done': 'Done',
      };

      const jiraStatus = issue.fields.status.name;
      const mappedStatus = statusMapping[jiraStatus] || 'Draft';

      console.log(`✅ Story ${storyId} status in Jira: ${mappedStatus}`);

      return {
        success: true,
        updates: {
          status: mappedStatus,
        },
      };

    } catch (error) {
      console.error('❌ Error pulling story from Jira:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create new story in Jira
   *
   * @param {object} storyData - Story metadata
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createStory(storyData) {
    try {
      console.log(`📝 Creating story ${storyData.id} in Jira...`);

      const issueKey = await this._createIssue(storyData);
      const issueUrl = `${this.baseUrl}/browse/${issueKey}`;

      console.log(`✅ Story ${storyData.id} created in Jira`);

      return {
        success: true,
        url: issueUrl,
      };

    } catch (error) {
      console.error('❌ Error creating story in Jira:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update story status in Jira
   *
   * @param {string} storyId - Story ID
   * @param {string} status - New status (Draft, InProgress, Review, Done)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateStatus(storyId, status) {
    try {
      console.log(`📊 Updating story ${storyId} status to ${status}...`);

      const issueKey = await this._findIssueByStoryId(storyId);

      if (!issueKey) {
        return {
          success: false,
          error: `Jira issue not found for story ${storyId}`,
        };
      }

      // Map AIOX status to Jira transition
      const transitionMapping = {
        'Draft': 'To Do',
        'InProgress': 'In Progress',
        'Review': 'In Review',
        'Done': 'Done',
      };

      const jiraStatus = transitionMapping[status] || 'To Do';

      // Execute transition (simplified - may need transition IDs in real implementation)
      await this._transitionIssue(issueKey, jiraStatus);

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
   * Test connection to Jira
   *
   * Validates API token and project access.
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testConnection() {
    try {
      if (!this.apiToken) {
        return {
          success: false,
          error: 'JIRA_API_TOKEN not configured',
        };
      }

      if (!this.email) {
        return {
          success: false,
          error: 'JIRA_EMAIL not configured',
        };
      }

      console.log('🔌 Testing Jira connection...');

      // Try to fetch project info
      await this._apiRequest('GET', `/rest/api/3/project/${this.projectKey}`);

      console.log('✅ Jira connection successful');

      return { success: true };

    } catch (error) {
      console.error('❌ Jira connection failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Make Jira REST API request
   * @private
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {object} [data] - Request body
   * @returns {Promise<object>} Response data
   */
  async _apiRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
      const url = new URL(`${this.baseUrl}${path}`);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (error) {
              reject(new Error(`Failed to parse JSON: ${error.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Find Jira issue by story ID
   * @private
   * @param {string} storyId - Story ID (e.g., "3.20")
   * @returns {Promise<string|null>} Issue key or null
   */
  async _findIssueByStoryId(storyId) {
    try {
      const jql = `project = ${this.projectKey} AND labels = story-${storyId}`;
      const result = await this._apiRequest('GET', `/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=1`);

      if (result.issues && result.issues.length > 0) {
        return result.issues[0].key;
      }

      return null;
    } catch (error) {
      console.warn(`Warning: Could not search for story ${storyId}:`, error.message);
      return null;
    }
  }

  /**
   * Get Jira issue
   * @private
   * @param {string} issueKey - Issue key (e.g., "AIOX-123")
   * @returns {Promise<object>} Issue data
   */
  async _getIssue(issueKey) {
    return await this._apiRequest('GET', `/rest/api/3/issue/${issueKey}`);
  }

  /**
   * Create Jira issue
   * @private
   * @param {object} story - Story data
   * @returns {Promise<string>} Issue key
   */
  async _createIssue(story) {
    const issueData = {
      fields: {
        project: {
          key: this.projectKey,
        },
        summary: `${story.id}: ${story.title}`,
        description: story.description || story.context || '',
        issuetype: {
          name: 'Story',
        },
        labels: [
          'story',
          `story-${story.id}`,
          ...(story.epic ? [`epic-${story.epic}`] : []),
        ],
      },
    };

    const result = await this._apiRequest('POST', '/rest/api/3/issue', issueData);
    return result.key;
  }

  /**
   * Update Jira issue
   * @private
   * @param {string} issueKey - Issue key
   * @param {object} story - Story data
   */
  async _updateIssue(issueKey, story) {
    const updateData = {
      fields: {
        summary: `${story.id}: ${story.title}`,
        description: story.description || story.context || '',
      },
    };

    await this._apiRequest('PUT', `/rest/api/3/issue/${issueKey}`, updateData);
  }

  /**
   * Transition Jira issue to new status
   * @private
   * @param {string} issueKey - Issue key
   * @param {string} statusName - Status name
   */
  async _transitionIssue(issueKey, statusName) {
    // Get available transitions
    const transitions = await this._apiRequest('GET', `/rest/api/3/issue/${issueKey}/transitions`);

    // Find transition to target status
    const transition = transitions.transitions.find(t => t.to.name === statusName);

    if (!transition) {
      throw new Error(`No transition available to status: ${statusName}`);
    }

    // Execute transition
    await this._apiRequest('POST', `/rest/api/3/issue/${issueKey}/transitions`, {
      transition: { id: transition.id },
    });
  }
}

module.exports = { JiraAdapter };
