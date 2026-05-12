/**
 * Dashboard Status Writer
 *
 * Writes the current AIOX agent status to .aiox/dashboard/status.json
 * This file is watched by the dashboard via SSE for real-time updates.
 *
 * Usage:
 *   const statusWriter = require('./dashboard-status-writer');
 *
 *   // Activate an agent
 *   await statusWriter.activateAgent('dev', 'story-123');
 *
 *   // Deactivate agent
 *   await statusWriter.deactivateAgent();
 *
 *   // Update session info
 *   await statusWriter.updateSession({ commandsExecuted: 5 });
 */

const fs = require('fs').promises;
const path = require('path');

// Status file location (relative to project root)
const STATUS_DIR = '.aiox/dashboard';
const STATUS_FILE = 'status.json';

/**
 * Ensures the status directory exists
 */
async function ensureStatusDir(projectRoot) {
  const dirPath = path.join(projectRoot, STATUS_DIR);
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  return dirPath;
}

/**
 * Gets the current project root
 * Uses AIOX_PROJECT_ROOT env var or cwd
 */
function getProjectRoot() {
  return process.env.AIOX_PROJECT_ROOT || process.cwd();
}

/**
 * Reads the current status file
 * Returns default status if file doesn't exist
 */
async function readStatus(projectRoot) {
  const filePath = path.join(projectRoot, STATUS_DIR, STATUS_FILE);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return default status
      return createDefaultStatus(projectRoot);
    }
    throw error;
  }
}

/**
 * Creates the default status object
 */
function createDefaultStatus(projectRoot) {
  const projectName = path.basename(projectRoot);

  return {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    project: {
      name: projectName,
      path: projectRoot,
    },
    activeAgent: null,
    session: null,
    stories: {
      inProgress: [],
      completed: [],
    },
    rateLimit: null,
  };
}

/**
 * Writes the status to file
 */
async function writeStatus(projectRoot, status) {
  await ensureStatusDir(projectRoot);
  const filePath = path.join(projectRoot, STATUS_DIR, STATUS_FILE);

  status.updatedAt = new Date().toISOString();

  await fs.writeFile(filePath, JSON.stringify(status, null, 2), 'utf-8');
  return status;
}

// ============ Public API ============

/**
 * Activates an agent with optional story context
 *
 * @param {string} agentId - Agent ID (dev, qa, architect, pm, po, analyst, devops)
 * @param {string} [storyId] - Optional story ID the agent is working on
 * @param {string} [projectRoot] - Optional project root path
 */
async function activateAgent(agentId, storyId, projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = await readStatus(projectRoot);

  const validAgents = ['dev', 'qa', 'architect', 'pm', 'po', 'analyst', 'devops'];
  if (!validAgents.includes(agentId)) {
    throw new Error(`Invalid agent ID: ${agentId}. Must be one of: ${validAgents.join(', ')}`);
  }

  const agentNames = {
    dev: 'Dev',
    qa: 'QA',
    architect: 'Architect',
    pm: 'PM',
    po: 'PO',
    analyst: 'Analyst',
    devops: 'DevOps',
  };

  status.activeAgent = {
    id: agentId,
    name: agentNames[agentId],
    activatedAt: new Date().toISOString(),
    currentStory: storyId || undefined,
  };

  // Update stories in progress
  if (storyId && !status.stories.inProgress.includes(storyId)) {
    status.stories.inProgress.push(storyId);
  }

  // Create or update session
  if (!status.session) {
    status.session = {
      startedAt: new Date().toISOString(),
      commandsExecuted: 0,
    };
  }

  return writeStatus(projectRoot, status);
}

/**
 * Deactivates the current agent
 *
 * @param {string} [projectRoot] - Optional project root path
 */
async function deactivateAgent(projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = await readStatus(projectRoot);

  status.activeAgent = null;

  return writeStatus(projectRoot, status);
}

/**
 * Updates session information
 *
 * @param {Object} sessionData - Session data to update
 * @param {number} [sessionData.commandsExecuted] - Number of commands executed
 * @param {string} [sessionData.lastCommand] - Last command executed
 * @param {string} [projectRoot] - Optional project root path
 */
async function updateSession(sessionData, projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = await readStatus(projectRoot);

  if (!status.session) {
    status.session = {
      startedAt: new Date().toISOString(),
      commandsExecuted: 0,
    };
  }

  if (typeof sessionData.commandsExecuted === 'number') {
    status.session.commandsExecuted = sessionData.commandsExecuted;
  }

  if (sessionData.lastCommand) {
    status.session.lastCommand = sessionData.lastCommand;
  }

  return writeStatus(projectRoot, status);
}

/**
 * Increments the command count
 *
 * @param {string} [lastCommand] - Optional last command name
 * @param {string} [projectRoot] - Optional project root path
 */
async function incrementCommands(lastCommand, projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = await readStatus(projectRoot);

  if (!status.session) {
    status.session = {
      startedAt: new Date().toISOString(),
      commandsExecuted: 0,
    };
  }

  status.session.commandsExecuted++;

  if (lastCommand) {
    status.session.lastCommand = lastCommand;
  }

  return writeStatus(projectRoot, status);
}

/**
 * Marks a story as completed
 *
 * @param {string} storyId - Story ID to mark as completed
 * @param {string} [projectRoot] - Optional project root path
 */
async function completeStory(storyId, projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = await readStatus(projectRoot);

  // Remove from in progress
  status.stories.inProgress = status.stories.inProgress.filter((id) => id !== storyId);

  // Add to completed
  if (!status.stories.completed.includes(storyId)) {
    status.stories.completed.push(storyId);
  }

  // Clear from active agent
  if (status.activeAgent && status.activeAgent.currentStory === storyId) {
    status.activeAgent.currentStory = undefined;
  }

  return writeStatus(projectRoot, status);
}

/**
 * Updates rate limit information
 *
 * @param {Object} rateLimit - Rate limit data
 * @param {number} rateLimit.used - Used requests
 * @param {number} rateLimit.limit - Total limit
 * @param {string} [rateLimit.resetsAt] - Reset timestamp
 * @param {string} [projectRoot] - Optional project root path
 */
async function updateRateLimit(rateLimit, projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = await readStatus(projectRoot);

  status.rateLimit = {
    used: rateLimit.used,
    limit: rateLimit.limit,
    resetsAt: rateLimit.resetsAt,
  };

  return writeStatus(projectRoot, status);
}

/**
 * Clears the status file (useful for tests or reset)
 *
 * @param {string} [projectRoot] - Optional project root path
 */
async function clearStatus(projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  const status = createDefaultStatus(projectRoot);
  return writeStatus(projectRoot, status);
}

/**
 * Gets the current status without modifying it
 *
 * @param {string} [projectRoot] - Optional project root path
 * @returns {Promise<Object>} Current status
 */
async function getStatus(projectRoot) {
  projectRoot = projectRoot || getProjectRoot();
  return readStatus(projectRoot);
}

module.exports = {
  activateAgent,
  deactivateAgent,
  updateSession,
  incrementCommands,
  completeStory,
  updateRateLimit,
  clearStatus,
  getStatus,
  // Internal exports for testing
  _ensureStatusDir: ensureStatusDir,
  _readStatus: readStatus,
  _writeStatus: writeStatus,
};
