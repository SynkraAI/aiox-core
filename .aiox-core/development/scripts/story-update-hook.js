// File: common/utils/story-update-hook.js

const { updateTaskDescription, updateStoryStatus, addTaskComment } = require('../../infrastructure/scripts/clickup-helpers');
const yaml = require('js-yaml');

/**
 * Detects changes between two versions of story markdown content
 *
 * @param {string} oldContent - Previous markdown content
 * @param {string} newContent - Current markdown content
 * @returns {object} Changes detected
 */
function detectChanges(oldContent, newContent) {
  // Handle null/undefined content
  if (!oldContent) oldContent = '';
  if (!newContent) newContent = '';

  const changes = {
    status: { changed: false },
    tasksCompleted: [],
    filesAdded: [],
    devNotesAdded: false,
    acceptanceCriteriaChanged: false,
  };

  // Parse frontmatter to get status
  const oldStatus = extractStatus(oldContent);
  const newStatus = extractStatus(newContent);

  if (oldStatus !== newStatus) {
    changes.status = {
      changed: true,
      from: oldStatus,
      to: newStatus,
    };
  } else {
    changes.status = {
      changed: false,
      from: oldStatus,
      to: newStatus,
    };
  }

  // Detect completed tasks
  const oldTasks = extractTasks(oldContent);
  const newTasks = extractTasks(newContent);

  newTasks.forEach(task => {
    if (task.completed) {
      const wasCompleted = oldTasks.some(
        oldTask => oldTask.text === task.text && oldTask.completed,
      );
      if (!wasCompleted) {
        changes.tasksCompleted.push(task.text);
      }
    }
  });

  // Detect added files
  const oldFiles = extractFileList(oldContent);
  const newFiles = extractFileList(newContent);

  changes.filesAdded = newFiles.filter(file => !oldFiles.includes(file));

  // Detect dev notes changes
  const oldDevNotes = extractSection(oldContent, '## Dev Notes');
  const newDevNotes = extractSection(newContent, '## Dev Notes');

  if (oldDevNotes !== newDevNotes && newDevNotes.length > oldDevNotes.length) {
    changes.devNotesAdded = true;
    changes.devNotesContent = newDevNotes.substring(oldDevNotes.length).trim();
  }

  // Detect acceptance criteria changes
  const oldAC = extractSection(oldContent, '## Acceptance Criteria');
  const newAC = extractSection(newContent, '## Acceptance Criteria');

  if (oldAC !== newAC) {
    changes.acceptanceCriteriaChanged = true;
  }

  return changes;
}

/**
 * Extract status from frontmatter
 */
function extractStatus(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return undefined;

  try {
    const frontmatter = yaml.load(frontmatterMatch[1]);
    return frontmatter.status;
  } catch (_error) {
    return undefined;
  }
}

/**
 * Extract tasks from markdown
 */
function extractTasks(content) {
  const taskMatches = content.matchAll(/^- \[([ x])\] (.+)$/gm);
  return Array.from(taskMatches).map(match => ({
    completed: match[1] === 'x',
    text: match[2],
  }));
}

/**
 * Extract file list from File List section
 */
function extractFileList(content) {
  const fileListSection = extractSection(content, '## File List');
  if (!fileListSection) return [];

  const fileMatches = fileListSection.matchAll(/^- (.+\.(?:js|ts|jsx|tsx|json|yaml|md|test\.js))$/gm);
  return Array.from(fileMatches).map(match => match[1]);
}

/**
 * Extract a markdown section by heading
 */
function extractSection(content, heading) {
  // Try with double newline first (standard format)
  let regex = new RegExp(`${heading}\\n\\n([\\s\\S]*?)(?=\\n##|$)`);
  let match = content.match(regex);

  // If no match, try with single newline
  if (!match) {
    regex = new RegExp(`${heading}\\n([\\s\\S]*?)(?=\\n##|$)`);
    match = content.match(regex);
  }

  return match ? match[1].trim() : '';
}

/**
 * Generate changelog markdown from changes
 */
function generateChangelog(changes) {
  if (!hasChanges(changes)) {
    return '';
  }

  const timestamp = new Date().toISOString();
  let markdown = `**Story Updated: ${timestamp}**\n\n**Changes:**\n`;

  if (changes.status.changed) {
    markdown += `- Status: ${changes.status.from} → ${changes.status.to}\n`;
  }

  if (changes.tasksCompleted.length > 0) {
    markdown += '- Completed tasks:\n';
    changes.tasksCompleted.forEach(task => {
      markdown += `  • ${task}\n`;
    });
  }

  if (changes.filesAdded.length > 0) {
    markdown += '- Files added:\n';
    changes.filesAdded.forEach(file => {
      markdown += `  • ${file}\n`;
    });
  }

  if (changes.devNotesAdded) {
    markdown += '- Dev notes updated\n';
  }

  if (changes.acceptanceCriteriaChanged) {
    markdown += '- Acceptance criteria modified\n';
  }

  return markdown;
}

/**
 * Check if there are any changes
 */
function hasChanges(changes) {
  return changes.status.changed ||
         changes.tasksCompleted.length > 0 ||
         changes.filesAdded.length > 0 ||
         changes.devNotesAdded ||
         changes.acceptanceCriteriaChanged;
}

/**
 * Sync story changes to ClickUp
 */
async function syncStoryToClickUp(storyFile, changes) {
  // Extract ClickUp metadata
  const taskId = storyFile?.metadata?.clickup_task_id;
  if (!taskId) {
    console.warn('Story has no ClickUp metadata, skipping sync');
    return;
  }

  // Only sync if there are actual changes
  if (!hasChanges(changes)) {
    return;
  }

  // Update status if changed
  if (changes.status.changed) {
    await updateStoryStatus(taskId, changes.status.to);
  }

  // Update task description if acceptance criteria changed
  if (changes.acceptanceCriteriaChanged) {
    await updateTaskDescription(taskId, storyFile.content);
  }

  // Add changelog comment
  const changelog = generateChangelog(changes);
  if (changelog) {
    await addTaskComment(taskId, changelog);
  }
}

/**
 * Update frontmatter timestamp
 */
function updateFrontmatterTimestamp(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return content; // No frontmatter, return unchanged
  }

  try {
    const frontmatter = yaml.load(frontmatterMatch[1]);

    // Format timestamp without milliseconds to match expected format
    const now = new Date();
    const timestamp = now.toISOString().split('.')[0]; // Remove milliseconds and 'Z'
    frontmatter.last_updated = timestamp;

    // Dump YAML
    let newFrontmatterYaml = yaml.dump(frontmatter);

    // Remove quotes from timestamp value (YAML adds them to ISO date strings)
    newFrontmatterYaml = newFrontmatterYaml.replace(/last_updated: ["']([^"']+)["']/, 'last_updated: $1');

    const contentAfterFrontmatter = content.substring(frontmatterMatch[0].length);

    return `---\n${newFrontmatterYaml}---${contentAfterFrontmatter}`;
  } catch (_error) {
    return content; // Failed to parse, return unchanged
  }
}

module.exports = {
  detectChanges,
  generateChangelog,
  syncStoryToClickUp,
  updateFrontmatterTimestamp,
};
