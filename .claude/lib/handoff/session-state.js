'use strict';

/**
 * Tier 2: Session State (In-Session Timeline)
 *
 * Append-only YAML timeline of session events.
 * File: .aiox/current-session/state.yaml
 *
 * LIMITATION (MNT-002): The YAML serializer/parser in this module is flat-only.
 * It handles the known session schema (session header + events array with scalar
 * fields). Nested objects or arrays within event payloads will NOT serialize or
 * parse correctly. If the schema evolves to require nested structures, replace
 * this with a proper YAML library (e.g., js-yaml).
 *
 * @module session-state
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-1
 */

const fs = require('fs');
const path = require('path');

/** Valid event types */
const EVENT_TYPES = [
  'agent_switch',
  'story_start',
  'story_complete',
  'qa_gate',
  'commit',
  'periodic',
];

/**
 * Resolve the path to the session state YAML file.
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to state.yaml
 */
function getStatePath(projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, '.aiox', 'current-session', 'state.yaml');
}

/**
 * Resolve the path to the session history archive directory.
 * @param {string} project - Project name
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to archive directory
 */
function getArchiveDir(project, projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, '.aiox', 'session-history', project);
}

/**
 * Serialize a YAML-like string from an object (simple serializer, no dependency).
 * Handles the session header and events array.
 * @param {object} state - Session state object
 * @returns {string} YAML string
 */
function serializeState(state) {
  const lines = [];

  // Session header
  lines.push('session:');
  lines.push(`  id: "${state.session.id || ''}"`);
  lines.push(`  started: "${state.session.started || ''}"`);
  lines.push(`  project: "${state.session.project || ''}"`);
  lines.push('');

  // Events array
  lines.push('events:');
  if (state.events && state.events.length > 0) {
    for (const evt of state.events) {
      lines.push(`  - timestamp: "${evt.timestamp || ''}"`);
      lines.push(`    type: "${evt.type || ''}"`);
      if (evt.agent) lines.push(`    agent: "${evt.agent}"`);
      if (evt.story) lines.push(`    story: "${evt.story}"`);
      if (evt.branch) lines.push(`    branch: "${evt.branch}"`);
      if (evt.files_modified !== undefined) lines.push(`    files_modified: ${evt.files_modified}`);
      if (evt.prompt_count !== undefined) lines.push(`    prompt_count: ${evt.prompt_count}`);
      if (evt.details) lines.push(`    details: "${evt.details.replace(/"/g, '\\"')}"`);
      if (evt.verdict) lines.push(`    verdict: "${evt.verdict}"`);
      if (evt.commit_hash) lines.push(`    commit_hash: "${evt.commit_hash}"`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Parse a simple YAML state file back into an object.
 * This is a minimal parser for our known schema -- not a general YAML parser.
 * @param {string} yamlStr - YAML string
 * @returns {object} Parsed state object
 */
function parseState(yamlStr) {
  const state = {
    session: { id: '', started: '', project: '' },
    events: [],
  };

  if (!yamlStr || !yamlStr.trim()) return state;

  const lines = yamlStr.split('\n');
  let currentEvent = null;
  let inSession = false;
  let inEvents = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === 'session:') {
      inSession = true;
      inEvents = false;
      continue;
    }

    if (trimmed === 'events:') {
      inEvents = true;
      inSession = false;
      continue;
    }

    if (inSession) {
      const match = trimmed.match(/^(\w+):\s*"?([^"]*)"?$/);
      if (match) {
        state.session[match[1]] = match[2];
      }
    }

    if (inEvents) {
      if (trimmed.startsWith('- timestamp:')) {
        if (currentEvent) state.events.push(currentEvent);
        currentEvent = {};
        const val = trimmed.replace('- timestamp:', '').trim().replace(/^"|"$/g, '');
        currentEvent.timestamp = val;
      } else if (currentEvent && trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim();
        let val = trimmed.substring(colonIdx + 1).trim().replace(/^"|"$/g, '');
        // Parse numbers
        if (/^\d+$/.test(val)) val = parseInt(val, 10);
        currentEvent[key] = val;
      }
    }
  }

  if (currentEvent) state.events.push(currentEvent);

  return state;
}

/**
 * Read the current session state.
 * @param {string} [projectRoot] - Project root directory
 * @returns {object} Session state object with session header and events array
 */
function getSessionState(projectRoot) {
  const filePath = getStatePath(projectRoot);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return parseState(raw);
  } catch (_) {
    return {
      session: { id: '', started: '', project: '' },
      events: [],
    };
  }
}

/**
 * Initialize session state if it does not exist.
 * @param {string} sessionId - Session identifier
 * @param {string} project - Project name
 * @param {string} [projectRoot] - Project root directory
 * @returns {object} The initialized state
 */
function initSessionState(sessionId, project, projectRoot) {
  const filePath = getStatePath(projectRoot);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const state = {
    session: {
      id: sessionId || `session-${Date.now()}`,
      started: new Date().toISOString(),
      project: project || 'unknown',
    },
    events: [],
  };

  fs.writeFileSync(filePath, serializeState(state), 'utf8');
  return state;
}

/**
 * Append a session event (append-only pattern).
 *
 * @param {string} eventType - One of EVENT_TYPES
 * @param {object} payload - Event payload
 * @param {string} [payload.agent] - Active agent ID
 * @param {string} [payload.story] - Active story ID
 * @param {string} [payload.branch] - Git branch name
 * @param {number} [payload.files_modified] - Count of modified files
 * @param {number} [payload.prompt_count] - Current prompt count
 * @param {string} [payload.details] - Additional details
 * @param {string} [payload.verdict] - QA verdict (for qa_gate events)
 * @param {string} [payload.commit_hash] - Git commit hash (for commit events)
 * @param {string} [projectRoot] - Project root directory
 * @returns {object} The appended event
 */
function updateSessionState(eventType, payload, projectRoot) {
  if (!EVENT_TYPES.includes(eventType)) {
    throw new Error(`Invalid event type: ${eventType}. Valid types: ${EVENT_TYPES.join(', ')}`);
  }

  const filePath = getStatePath(projectRoot);
  let state;

  // Read existing state or initialize
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    state = parseState(raw);
  } catch (_) {
    state = initSessionState(null, payload.project || 'unknown', projectRoot);
  }

  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    ...payload,
  };

  state.events.push(event);

  // Write back the full state (append-only semantically, rewrite physically)
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, serializeState(state), 'utf8');

  return event;
}

/**
 * Archive current state and reset for new session.
 * @param {string} project - Project name for archive directory
 * @param {string} [projectRoot] - Project root directory
 * @returns {string|null} Path to archived file, or null if nothing to archive
 */
function resetSessionState(project, projectRoot) {
  const filePath = getStatePath(projectRoot);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return null;
  }

  if (!raw.trim()) return null;

  // Archive to session-history
  const archiveDir = getArchiveDir(project, projectRoot);
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(archiveDir, `state-${timestamp}.yaml`);
  fs.writeFileSync(archivePath, raw, 'utf8');

  // Clear current state
  try {
    fs.unlinkSync(filePath);
  } catch (_) {
    // Ignore
  }

  return archivePath;
}

/**
 * Get event count for the current session.
 * @param {string} [projectRoot] - Project root directory
 * @returns {number} Number of events
 */
function getEventCount(projectRoot) {
  const state = getSessionState(projectRoot);
  return state.events.length;
}

module.exports = {
  updateSessionState,
  getSessionState,
  initSessionState,
  resetSessionState,
  getEventCount,
  getStatePath,
  getArchiveDir,
  serializeState,
  parseState,
  EVENT_TYPES,
};
