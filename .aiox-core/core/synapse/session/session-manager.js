/**
 * SYNAPSE Session Manager
 *
 * Manages session state (active agent, workflow, task, squad) persisted as JSON.
 * Sessions are stored in `.synapse/sessions/{uuid}.json` using schema v2.0.
 *
 * Features:
 * - CRUD operations for sessions
 * - Stale session cleanup (>24h inactive)
 * - Auto-title generation from first meaningful prompt
 * - Gitignore creation for sessions/ and cache/
 *
 * @module core/synapse/session/session-manager
 * @version 1.0.0
 * @created Story SYN-2 - Session Manager
 */

const fs = require('fs');
const path = require('path');
const { atomicWriteSync } = require('../utils/atomic-write');

const SCHEMA_VERSION = '2.0';
const DEFAULT_MAX_AGE_HOURS = 24;
const MAX_TITLE_LENGTH = 50;

/**
 * Build the default session object conforming to schema v2.0
 *
 * @param {string} sessionId - UUID from Claude Code
 * @param {string} cwd - Working directory
 * @returns {object} Session object with schema v2.0 defaults
 */
function buildDefaultSession(sessionId, cwd) {
  const now = new Date().toISOString();
  const label = path.basename(cwd);

  return {
    uuid: sessionId,
    schema_version: SCHEMA_VERSION,
    started: now,
    last_activity: now,
    cwd,
    label,
    title: null,
    prompt_count: 0,
    active_agent: { id: null, activated_at: null, activation_quality: null },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: { last_bracket: 'FRESH', last_tokens_used: 0, last_context_percent: 100 },
    overrides: {},
    history: { star_commands_used: [], domains_loaded_last: [], agents_activated: [] },
  };
}

/**
 * Resolve sessions directory path from a base .synapse/ path
 *
 * @param {string} sessionsDir - Path to sessions directory
 * @returns {string} Resolved sessions directory path
 */
function resolveSessionFile(sessionId, sessionsDir) {
  // Sanitize sessionId to prevent path traversal
  if (typeof sessionId !== 'string' || sessionId.includes('..') || sessionId.includes('/') || sessionId.includes('\\')) {
    throw new Error('[synapse:session] Invalid sessionId: contains path separators or traversal');
  }

  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(sessionsDir);

  if (!resolved.startsWith(resolvedDir + path.sep) && resolved !== resolvedDir) {
    throw new Error('[synapse:session] Invalid sessionId: resolved path escapes sessions directory');
  }

  return filePath;
}

/**
 * Ensure a directory exists, creating it recursively if needed
 *
 * @param {string} dirPath - Directory path to ensure
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Ensure .synapse/.gitignore exists with required entries
 *
 * @param {string} synapsePath - Path to .synapse/ directory
 */
function ensureGitignore(synapsePath) {
  const gitignorePath = path.join(synapsePath, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    return;
  }

  const content = [
    '# SYNAPSE runtime data (auto-generated)',
    'sessions/',
    'cache/',
    '',
  ].join('\n');

  ensureDir(synapsePath);
  fs.writeFileSync(gitignorePath, content, 'utf8');
}

/**
 * Create a new session
 *
 * Creates the session JSON file with schema v2.0 defaults.
 * Auto-creates the sessions/ directory and .gitignore if they don't exist.
 *
 * @param {string} sessionId - UUID from Claude Code
 * @param {string} cwd - Working directory
 * @param {string} [sessionsDir] - Sessions directory (default: cwd/.synapse/sessions)
 * @returns {object} Created session object
 */
function createSession(sessionId, cwd, sessionsDir) {
  const dir = sessionsDir || path.join(cwd, '.synapse', 'sessions');
  ensureDir(dir);

  // Ensure .gitignore exists in .synapse/
  const synapsePath = path.dirname(dir);
  ensureGitignore(synapsePath);

  const session = buildDefaultSession(sessionId, cwd);
  const filePath = resolveSessionFile(sessionId, dir);

  try {
    atomicWriteSync(filePath, JSON.stringify(session, null, 2));
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error(`[synapse:session] Error: Permission denied creating session ${sessionId}`);
      return null;
    }
    throw error;
  }

  return session;
}

/**
 * Load an existing session
 *
 * @param {string} sessionId - Session UUID
 * @param {string} sessionsDir - Path to sessions directory
 * @returns {object|null} Session object, or null if not found or corrupted
 */
function loadSession(sessionId, sessionsDir) {
  const filePath = resolveSessionFile(sessionId, sessionsDir);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const session = JSON.parse(raw);

    if (session.schema_version !== SCHEMA_VERSION) {
      console.warn(
        `[synapse:session] Warning: Session ${sessionId} has schema_version "${session.schema_version}", expected "${SCHEMA_VERSION}"`,
      );
      return null;
    }

    return session;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`[synapse:session] Warning: Corrupted JSON for session ${sessionId}`);
      return null;
    }
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error(`[synapse:session] Error: Permission denied reading session ${sessionId}`);
      return null;
    }
    throw error;
  }
}

/**
 * Update an existing session with partial merge
 *
 * Deep-merges the updates into the existing session.
 * Increments prompt_count and updates last_activity on every call.
 *
 * @param {string} sessionId - Session UUID
 * @param {string} sessionsDir - Path to sessions directory
 * @param {object} updates - Partial updates to merge
 * @returns {object|null} Updated session, or null if session not found
 */
function updateSession(sessionId, sessionsDir, updates) {
  const session = loadSession(sessionId, sessionsDir);

  if (!session) {
    return null;
  }

  // Shallow merge top-level fields
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'history' && typeof value === 'object' && value !== null) {
      // Merge history arrays by appending unique values
      session.history = mergeHistory(session.history, value);
    } else if (key === 'overrides' && typeof value === 'object' && value !== null) {
      // Merge overrides
      Object.assign(session.overrides, value);
    } else if (key === 'context' && typeof value === 'object' && value !== null) {
      // Merge context
      Object.assign(session.context, value);
    } else if (key === 'active_agent' && typeof value === 'object' && value !== null) {
      // Replace active_agent entirely
      session.active_agent = value;
    } else {
      session[key] = value;
    }
  }

  // Always increment prompt_count and update last_activity
  session.prompt_count += 1;
  session.last_activity = new Date().toISOString();

  const filePath = resolveSessionFile(sessionId, sessionsDir);

  try {
    atomicWriteSync(filePath, JSON.stringify(session, null, 2));
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error(`[synapse:session] Error: Permission denied writing session ${sessionId}`);
      return null;
    }
    throw error;
  }

  return session;
}

/**
 * Merge history objects by appending unique values to arrays
 *
 * @param {object} existing - Existing history
 * @param {object} incoming - Incoming history updates
 * @returns {object} Merged history
 */
function mergeHistory(existing, incoming) {
  const merged = { ...existing };

  for (const [key, value] of Object.entries(incoming)) {
    if (Array.isArray(value) && Array.isArray(merged[key])) {
      const combined = [...merged[key]];
      for (const item of value) {
        if (!combined.includes(item)) {
          combined.push(item);
        }
      }
      merged[key] = combined;
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * Delete a session
 *
 * @param {string} sessionId - Session UUID
 * @param {string} sessionsDir - Path to sessions directory
 * @returns {boolean} True if deleted, false if not found
 */
function deleteSession(sessionId, sessionsDir) {
  const filePath = resolveSessionFile(sessionId, sessionsDir);

  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error(`[synapse:session] Error: Permission denied deleting session ${sessionId}`);
      return false;
    }
    throw error;
  }
}

/**
 * Clean stale sessions (inactive for more than maxAgeHours)
 *
 * Reads each session file individually to avoid loading all into memory.
 * Does not fail if sessions directory doesn't exist.
 *
 * @param {string} sessionsDir - Path to sessions directory
 * @param {number} [maxAgeHours=24] - Maximum inactivity threshold in hours
 * @returns {number} Count of removed sessions
 */
function cleanStaleSessions(sessionsDir, maxAgeHours = DEFAULT_MAX_AGE_HOURS) {
  ensureDir(sessionsDir);

  let removedCount = 0;
  const cutoffMs = maxAgeHours * 60 * 60 * 1000;
  const now = Date.now();

  let files;
  try {
    files = fs.readdirSync(sessionsDir);
  } catch (_error) {
    return 0;
  }

  for (const file of files) {
    if (!file.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(sessionsDir, file);

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const session = JSON.parse(raw);

      if (session.last_activity) {
        const lastActivity = new Date(session.last_activity).getTime();
        const age = now - lastActivity;

        if (age > cutoffMs) {
          fs.unlinkSync(filePath);
          removedCount++;
        }
      }
    } catch (_error) {
      // Skip corrupted files during cleanup
      continue;
    }
  }

  return removedCount;
}

/**
 * Generate a title from a user prompt
 *
 * Extracts a meaningful title (max 50 chars) from the first significant prompt.
 * Ignores *commands and single-word prompts.
 *
 * @param {string} prompt - User prompt text
 * @returns {string|null} Generated title, or null if prompt is not title-worthy
 */
function generateTitle(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return null;
  }

  const trimmed = prompt.trim();

  // Ignore *commands
  if (trimmed.startsWith('*')) {
    return null;
  }

  // Ignore single words
  if (!trimmed.includes(' ')) {
    return null;
  }

  // Ignore very short prompts (less than 3 chars)
  if (trimmed.length < 3) {
    return null;
  }

  // Truncate to max length, respecting word boundaries
  if (trimmed.length <= MAX_TITLE_LENGTH) {
    return trimmed;
  }

  const truncated = trimmed.substring(0, MAX_TITLE_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace);
  }

  return truncated;
}

module.exports = {
  createSession,
  loadSession,
  updateSession,
  deleteSession,
  cleanStaleSessions,
  generateTitle,
  ensureGitignore,
  SCHEMA_VERSION,
};
