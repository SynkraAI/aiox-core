// File: common/utils/clickup-helpers.js

/**
 * ClickUp Helper Functions - Provides abstraction over ClickUp MCP tool
 *
 * This module provides utilities for:
 * - Updating story-status custom field (for Stories)
 * - Updating native status field (for Epics)
 * - Updating task descriptions with markdown
 * - Adding changelog comments to tasks
 *
 * CRITICAL DISTINCTION:
 * - Stories: Use custom field "story-status"
 * - Epics: Use native ClickUp status field
 */

const { mapStatusToClickUp } = require('./status-mapper');

/**
 * Resolves the ClickUp MCP tool
 * Tries tool-resolver first (for tests), falls back to global references
 */
async function getClickUpTool() {
  try {
    // Try using tool-resolver (test environment or future production)
    const { resolveTool } = require('./tool-resolver');
    return await resolveTool('clickup');
  } catch (error) {
    // Fall back to global references (current production pattern)
    return {
      updateTask: global.mcp__clickup__update_task,
      createComment: global.mcp__clickup__create_task_comment,
      getTask: global.mcp__clickup__get_task,
    };
  }
}

/**
 * Updates story-status custom field in ClickUp
 *
 * CRITICAL: Stories use custom field "story-status", NOT native status
 *
 * @param {string} taskId - ClickUp task ID (can be regular or custom ID)
 * @param {string} newStatus - New AIOX status value (will be mapped to ClickUp)
 * @returns {Promise<void>}
 * @throws {Error} If ClickUp API call fails
 */
async function updateStoryStatus(taskId, newStatus) {
  try {
    // Map AIOX status to ClickUp story-status value
    const mappedStatus = mapStatusToClickUp(newStatus);

    console.log(`Updating story ${taskId} status to: ${mappedStatus}`);

    // Note: This assumes the ClickUp MCP tool is available
    // Refer to tools/mcp/clickup.yaml for update_task with custom_fields
    const tool = await getClickUpTool();

    await tool.updateTask({
      taskId: taskId,
      custom_fields: [
        {
          id: 'story-status',
          value: mappedStatus,
        },
      ],
    });

    console.log('✅ Story status updated successfully');
  } catch (error) {
    console.error(`Error updating story status for ${taskId}:`, error);
    throw new Error(`Failed to update story status: ${error.message}`);
  }
}

/**
 * Updates Epic status using native ClickUp status field
 *
 * CRITICAL: Epics use native status field, NOT custom field
 *
 * @param {string} epicTaskId - Epic task ID
 * @param {string} newStatus - One of: "Planning", "In Progress", "Done"
 * @returns {Promise<void>}
 * @throws {Error} If ClickUp API call fails
 */
async function updateEpicStatus(epicTaskId, newStatus) {
  try {
    // Validate Epic status (must be one of the three valid values)
    const validStatuses = ['Planning', 'In Progress', 'Done'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid Epic status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }

    console.log(`Updating Epic ${epicTaskId} status to: ${newStatus}`);

    // Use native status field (not custom_fields)
    const tool = await getClickUpTool();

    await tool.updateTask({
      taskId: epicTaskId,
      status: newStatus,  // Native field for Epics
    });

    console.log('✅ Epic status updated successfully');
  } catch (error) {
    console.error(`Error updating Epic status for ${epicTaskId}:`, error);
    throw new Error(`Failed to update Epic status: ${error.message}`);
  }
}

/**
 * Updates ClickUp task description with full story markdown
 *
 * @param {string} taskId - ClickUp task ID
 * @param {string} markdown - Full story markdown content
 * @returns {Promise<void>}
 * @throws {Error} If ClickUp API call fails
 */
async function updateTaskDescription(taskId, markdown) {
  try {
    console.log(`Updating task ${taskId} description (${markdown.length} chars)`);

    const tool = await getClickUpTool();

    await tool.updateTask({
      taskId: taskId,
      markdown_description: markdown,
    });

    console.log('✅ Task description updated successfully');
  } catch (error) {
    console.error(`Error updating task description for ${taskId}:`, error);
    throw new Error(`Failed to update task description: ${error.message}`);
  }
}

/**
 * Adds a changelog comment to a ClickUp task
 *
 * @param {string} taskId - ClickUp task ID
 * @param {string} comment - Changelog markdown content
 * @returns {Promise<void>}
 * @throws {Error} If ClickUp API call fails
 */
async function addTaskComment(taskId, comment) {
  try {
    console.log(`Adding changelog comment to task ${taskId}`);

    const tool = await getClickUpTool();

    await tool.createComment({
      taskId: taskId,
      commentText: comment,
    });

    console.log('✅ Changelog comment added successfully');
  } catch (error) {
    console.error(`Error adding comment to task ${taskId}:`, error);
    throw new Error(`Failed to add task comment: ${error.message}`);
  }
}

/**
 * Verifies that an Epic task exists in ClickUp Backlog list
 *
 * Implements AC1: Epic Verification
 * Searches for Epic by epic number using tags and validates status
 *
 * @param {number} epicNum - Epic number to verify
 * @returns {Promise<object>} Epic verification result: { found, epicTaskId, epic }
 * @throws {Error} If Epic doesn't exist or has invalid status
 */
async function verifyEpicExists(epicNum) {
  try {
    console.log(`Verifying Epic ${epicNum} exists...`);

    const tool = await getClickUpTool();

    // Search for Epic by tag in workspace
    // Using getWorkspaceTasks to find Epic with specific tag
    const result = await tool.getWorkspaceTasks({
      tags: [`epic-${epicNum}`],
    });

    if (!result || !result.tasks || result.tasks.length === 0) {
      throw new Error(`Epic ${epicNum} not found in ClickUp Backlog list. Please create Epic task with tags: ['epic', 'epic-${epicNum}'] and status: Planning or In Progress`);
    }

    // Filter for Epics (should have 'epic' tag and valid status)
    const epics = result.tasks.filter(task =>
      task.tags &&
      task.tags.includes('epic') &&
      task.tags.includes(`epic-${epicNum}`) &&
      ['Planning', 'In Progress'].includes(task.status),
    );

    if (epics.length === 0) {
      throw new Error(`Epic ${epicNum} found but has invalid status. Status must be 'Planning' or 'In Progress'.`);
    }

    if (epics.length > 1) {
      console.warn(`⚠️ Multiple Epics found with epic-${epicNum} tag. Using first one: ${epics[0].id}`);
    }

    const epic = epics[0];
    console.log(`✅ Epic verified: ${epic.name || epic.id}`);

    return {
      found: true,
      epicTaskId: epic.id,
      epic: epic,
    };

  } catch (error) {
    console.error(`Error verifying Epic ${epicNum}:`, error);
    throw error;
  }
}

module.exports = {
  updateStoryStatus,
  updateEpicStatus,
  updateTaskDescription,
  addTaskComment,
  verifyEpicExists,
};
