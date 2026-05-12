// File: common/utils/story-manager.js

/**
 * Story Manager - Handles story file operations and ClickUp synchronization
 *
 * This module provides utilities for:
 * - Reading and parsing story .md files
 * - Saving story files with automatic ClickUp sync
 * - Managing story frontmatter and metadata
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { syncStoryToClickUp, detectChanges } = require('./story-update-hook');

/**
 * Resolves the ClickUp MCP tool
 * Tries tool-resolver first (for tests), falls back to global references
 */
async function getClickUpTool() {
  try {
    // Try using tool-resolver (test environment or future production)
    const { resolveTool } = require('../../infrastructure/scripts/tool-resolver');
    return await resolveTool('clickup');
  } catch (_error) {
    // Fall back to global references (current production pattern)
    return {
      createTask: global.mcp__clickup__create_task,
      updateTask: global.mcp__clickup__update_task,
      getTask: global.mcp__clickup__get_task,
    };
  }
}

/**
 * Parses a story markdown file into structured data
 *
 * @param {string} storyFilePath - Absolute path to story .md file
 * @returns {Promise<object>} Parsed story content
 */
async function parseStoryFile(storyFilePath) {
  const fileContent = await fs.readFile(storyFilePath, 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? yaml.load(frontmatterMatch[1]) : {};

  // Extract full markdown (without frontmatter)
  const fullMarkdown = frontmatterMatch
    ? fileContent.substring(frontmatterMatch[0].length).trim()
    : fileContent.trim();

  // Parse story sections
  const statusMatch = fileContent.match(/\*\*Status:\*\* (.+)/);
  const status = statusMatch ? statusMatch[1] : 'Draft';

  // Parse tasks (checkbox items)
  const taskMatches = fileContent.matchAll(/^- \[([ x])\] (.+)$/gm);
  const tasks = Array.from(taskMatches).map(match => ({
    completed: match[1] === 'x',
    text: match[2],
  }));

  // Extract File List section
  const fileListMatch = fileContent.match(/### File List\n\n([\s\S]*?)(?=\n##|$)/);
  const fileList = fileListMatch ? fileListMatch[1].trim().split('\n') : [];

  // Extract Dev Notes section
  const devNotesMatch = fileContent.match(/## Dev Notes\n\n([\s\S]*?)(?=\n##|$)/);
  const devNotes = devNotesMatch ? devNotesMatch[1].trim() : '';

  // Extract Acceptance Criteria section
  const acMatch = fileContent.match(/## Acceptance Criteria\n\n([\s\S]*?)(?=\n##|$)/);
  const acceptanceCriteria = acMatch ? acMatch[1].trim() : '';

  return {
    frontmatter,
    fullMarkdown,
    status,
    tasks,
    fileList,
    devNotes,
    acceptanceCriteria,
  };
}

/**
 * Saves a story file and triggers ClickUp synchronization
 *
 * @param {string} storyFilePath - Absolute path to story .md file
 * @param {string} content - New story content
 * @param {boolean} skipSync - Skip ClickUp sync (default: false)
 * @returns {Promise<object>} Save and sync result
 */
async function saveStoryFile(storyFilePath, content, skipSync = false) {
  try {
    // Read previous version for change detection
    let previousContentString = '';
    try {
      previousContentString = await fs.readFile(storyFilePath, 'utf-8');
    } catch (_error) {
      // File might not exist yet (new story)
      console.log('No previous version found - creating new story file');
    }

    // Write new content
    await fs.writeFile(storyFilePath, content, 'utf-8');
    console.log(`✅ Story file saved: ${path.basename(storyFilePath)}`);

    // Skip sync if requested or no previous version
    if (skipSync || !previousContentString) {
      return { saved: true, synced: false, reason: skipSync ? 'skip_requested' : 'new_file' };
    }

    // Detect changes between previous and current content
    const changes = detectChanges(previousContentString, content);

    // Extract metadata from current content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? yaml.load(frontmatterMatch[1]) : {};

    // Create storyFile object for sync
    const storyFile = {
      metadata: {
        clickup_task_id: frontmatter?.clickup?.task_id,
      },
      content: content,
    };

    // Sync to ClickUp if there are changes
    await syncStoryToClickUp(storyFile, changes);

    const hasChanges = changes.status.changed ||
                      changes.tasksCompleted.length > 0 ||
                      changes.filesAdded.length > 0 ||
                      changes.devNotesAdded ||
                      changes.acceptanceCriteriaChanged;

    if (hasChanges) {
      console.log('✅ Story synced to ClickUp');
      return { saved: true, synced: true, changes: Object.keys(changes).filter(k => changes[k] && changes[k] !== false).length };
    } else {
      console.log('ℹ️ No sync needed: no changes detected');
      return { saved: true, synced: false, reason: 'no_changes' };
    }

  } catch (error) {
    console.error(`Error saving story file: ${error.message}`);
    throw error;
  }
}

/**
 * Updates frontmatter in a story file
 *
 * @param {string} storyFilePath - Absolute path to story .md file
 * @param {object} updates - Frontmatter fields to update
 * @returns {Promise<object>} Updated frontmatter object
 */
async function updateFrontmatter(storyFilePath, updates) {
  const fileContent = await fs.readFile(storyFilePath, 'utf-8');

  // Extract existing frontmatter
  const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
  const existingFrontmatter = frontmatterMatch ? yaml.load(frontmatterMatch[1]) : {};

  // Merge updates
  const updatedFrontmatter = { ...existingFrontmatter, ...updates };

  // Serialize back to YAML
  const newFrontmatterYaml = yaml.dump(updatedFrontmatter);

  // Replace frontmatter in file content
  const contentWithoutFrontmatter = frontmatterMatch
    ? fileContent.substring(frontmatterMatch[0].length)
    : fileContent;

  const newContent = `---\n${newFrontmatterYaml}---${contentWithoutFrontmatter}`;

  // Save without triggering sync (to avoid recursion)
  await saveStoryFile(storyFilePath, newContent, true);

  // Return the updated frontmatter
  return updatedFrontmatter;
}

/**
 * Updates the last_sync timestamp in story frontmatter
 *
 * @param {string} storyFilePath - Absolute path to story .md file
 * @returns {Promise<void>}
 */
async function updateFrontmatterTimestamp(storyFilePath) {
  const timestamp = new Date().toISOString();
  await updateFrontmatter(storyFilePath, {
    clickup: {
      last_sync: timestamp,
    },
  });
}

/**
 * Creates a story task in ClickUp as a subtask of an Epic
 *
 * Implements AC2: Story Creation as ClickUp Subtask
 * Creates story with correct parent relationship, tags, and custom fields
 *
 * @param {object} options - Story creation options
 * @param {number} options.epicNum - Epic number
 * @param {number} options.storyNum - Story number
 * @param {number} [options.subStoryNum] - Optional substory number for nested stories
 * @param {string} options.title - Story title
 * @param {string} options.epicTaskId - Parent Epic task ID
 * @param {string} options.listName - ClickUp list name (typically "Backlog")
 * @param {string} options.storyContent - Full story markdown content
 * @param {string} [options.storyFilePath] - Path to story file (auto-generated if not provided)
 * @returns {Promise<object>} Created task info: { taskId, url }
 * @throws {Error} If ClickUp task creation fails or validation fails
 */
async function createStoryInClickUp({
  epicNum,
  storyNum,
  subStoryNum = null,
  title,
  epicTaskId,
  listName,
  storyContent,
  storyFilePath,
}) {
  // Validation
  if (typeof epicNum !== 'number') {
    throw new Error('epic_number must be a number');
  }
  if (typeof storyNum !== 'number' && isNaN(Number(storyNum))) {
    throw new Error('story_number must be numeric');
  }

  // Format story identifier
  const storyId = subStoryNum
    ? `${epicNum}.${subStoryNum}.${storyNum}`
    : `${epicNum}.${storyNum}`;

  const storyName = `Story ${storyId}: ${title}`;

  // Generate tags: ["story", "epic-{epicNum}", "story-{storyId}"]
  const tags = ['story', `epic-${epicNum}`, `story-${storyId}`];

  // Auto-generate file path if not provided
  const filePath = storyFilePath || `docs/stories/${storyId}.${title.toLowerCase().replace(/\s+/g, '-')}.md`;

  // Prepare custom fields
  const customFields = [
    { id: 'epic_number', value: epicNum },
    { id: 'story_number', value: storyId },
    { id: 'story_file_path', value: filePath },
    { id: 'story-status', value: 'Draft' },
  ];

  try {
    console.log(`Creating story ${storyName} in ClickUp...`);

    // Get ClickUp tool
    const clickUpTool = await getClickUpTool();

    // Create task with parent relationship
    const result = await clickUpTool.createTask({
      listName: listName,
      name: storyName,
      parent: epicTaskId,  // Creates as subtask
      markdown_description: storyContent,
      tags: tags,
      custom_fields: customFields,
    });

    console.log(`✅ Story created in ClickUp: ${result.id}`);

    return {
      taskId: result.id,
      url: result.url || `https://app.clickup.com/t/${result.id}`,
    };

  } catch (error) {
    console.error('Error creating story in ClickUp:', error);
    throw new Error(`Failed to create story in ClickUp: ${error.message}`);
  }
}

/**
 * Sync story to configured PM tool (adapter-aware)
 * @param {string} storyPath - Path to story YAML file
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
async function syncStoryToPM(storyPath) {
  try {
    const { getPMAdapter } = require('../../infrastructure/scripts/pm-adapter-factory');
    const adapter = getPMAdapter();

    console.log(`📤 Syncing to ${adapter.getName()}...`);

    const result = await adapter.syncStory(storyPath);

    if (result.success) {
      console.log('✅ Story synced successfully');
      if (result.url) {
        console.log(`   URL: ${result.url}`);
      }
    } else {
      console.error(`❌ Sync failed: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('Error syncing story:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Pull story updates from configured PM tool (adapter-aware)
 * @param {string} storyId - Story ID (e.g., "3.20")
 * @returns {Promise<{success: boolean, updates?: object, error?: string}>}
 */
async function pullStoryFromPM(storyId) {
  try {
    const { getPMAdapter, isPMToolConfigured } = require('../../infrastructure/scripts/pm-adapter-factory');

    if (!isPMToolConfigured()) {
      console.log('ℹ️  Local-only mode: No PM tool configured');
      return {
        success: true,
        updates: null,
      };
    }

    const adapter = getPMAdapter();

    console.log(`📥 Pulling from ${adapter.getName()}...`);

    const result = await adapter.pullStory(storyId);

    if (result.success) {
      if (result.updates) {
        console.log('📥 Updates found:', result.updates);
      } else {
        console.log('✅ Story is up to date');
      }
    } else {
      console.error(`❌ Pull failed: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('Error pulling story:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  parseStoryFile,
  saveStoryFile,
  updateFrontmatter,
  updateStoryFrontmatter: updateFrontmatter,  // Alias for test compatibility
  updateFrontmatterTimestamp,
  createStoryInClickUp,
  // PM adapter-aware functions (Story 3.20)
  syncStoryToPM,
  pullStoryFromPM,
};
