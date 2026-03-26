'use strict';

/**
 * Tier 1: Micro-Handoff (Agent Switch)
 *
 * Persists a compact handoff artifact when agents switch.
 * File: .aiox/current-session/micro-handoff.json
 *
 * @module micro-handoff
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-1
 */

const fs = require('fs');
const path = require('path');

/** Max entries for schema validation */
const MAX_DECISIONS = 5;
const MAX_FILES = 10;
const MAX_BLOCKERS = 3;
const MAX_UNCONSUMED = 3;
const MAX_MEMORY_HINTS = 3;

/**
 * Resolve the path to the micro-handoff JSON file.
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to micro-handoff.json
 */
function getHandoffPath(projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, '.aiox', 'current-session', 'micro-handoff.json');
}

/**
 * Validate and truncate handoff data to schema limits.
 * @param {object} data - Raw handoff data
 * @returns {object} Validated and truncated data
 */
function validateSchema(data) {
  const validated = { ...data };

  // Enforce array limits
  if (Array.isArray(validated.decisions)) {
    validated.decisions = validated.decisions.slice(0, MAX_DECISIONS);
  } else {
    validated.decisions = [];
  }

  if (Array.isArray(validated.files_modified)) {
    validated.files_modified = validated.files_modified.slice(0, MAX_FILES);
  } else {
    validated.files_modified = [];
  }

  if (Array.isArray(validated.blockers)) {
    validated.blockers = validated.blockers.slice(0, MAX_BLOCKERS);
  } else {
    validated.blockers = [];
  }

  // Memory hints (optional, max MAX_MEMORY_HINTS entries)
  if (Array.isArray(validated.memory_hints)) {
    validated.memory_hints = validated.memory_hints.slice(0, MAX_MEMORY_HINTS);
  } else {
    validated.memory_hints = [];
  }

  // Ensure required fields
  if (!validated.version) validated.version = '1.0';
  if (!validated.timestamp) validated.timestamp = new Date().toISOString();
  if (!validated.from_agent) validated.from_agent = 'unknown';
  if (!validated.to_agent) validated.to_agent = 'unknown';
  if (validated.consumed === undefined) validated.consumed = false;
  if (!validated.next_action) validated.next_action = '';

  // Ensure story_context object
  if (!validated.story_context || typeof validated.story_context !== 'object') {
    validated.story_context = {
      story_id: '',
      story_path: '',
      story_status: '',
      current_task: '',
      branch: '',
    };
  }

  // Generate ID if missing
  if (!validated.id) {
    const ts = validated.timestamp.replace(/[:.]/g, '-');
    validated.id = `handoff-${validated.from_agent}-to-${validated.to_agent}-${ts}`;
  }

  return validated;
}

/**
 * Read all handoffs from the JSON file.
 * The file stores an array of handoff objects.
 * @param {string} [projectRoot] - Project root directory
 * @returns {Array<object>} Array of handoff objects
 */
function readAllHandoffs(projectRoot) {
  const filePath = getHandoffPath(projectRoot);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (_) {
    return [];
  }
}

/**
 * Write handoffs array to the JSON file.
 * @param {Array<object>} handoffs - Array of handoff objects
 * @param {string} [projectRoot] - Project root directory
 */
function writeAllHandoffs(handoffs, projectRoot) {
  const filePath = getHandoffPath(projectRoot);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(handoffs, null, 2), 'utf8');
}

/**
 * Save a micro-handoff artifact.
 *
 * @param {string} fromAgent - Outgoing agent ID
 * @param {string} toAgent - Incoming agent ID
 * @param {object} context - Handoff context
 * @param {object} [context.story_context] - Story context object
 * @param {string[]} [context.decisions] - Key decisions (max 5)
 * @param {string[]} [context.files_modified] - Modified files (max 10)
 * @param {string[]} [context.blockers] - Active blockers (max 3)
 * @param {string} [context.next_action] - What incoming agent should do
 * @param {string} [projectRoot] - Project root directory
 * @returns {object} The saved handoff object
 */
function saveMicroHandoff(fromAgent, toAgent, context, projectRoot) {
  const handoff = validateSchema({
    from_agent: fromAgent,
    to_agent: toAgent,
    ...context,
  });

  // Read existing handoffs
  const existing = readAllHandoffs(projectRoot);

  // Add new handoff
  existing.push(handoff);

  // Rotate: keep only MAX_UNCONSUMED unconsumed handoffs
  const unconsumed = existing.filter((h) => !h.consumed);
  const consumed = existing.filter((h) => h.consumed);

  let kept;
  if (unconsumed.length > MAX_UNCONSUMED) {
    // Keep only the newest MAX_UNCONSUMED unconsumed
    const sorted = unconsumed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    kept = [...sorted.slice(0, MAX_UNCONSUMED), ...consumed];
  } else {
    kept = existing;
  }

  writeAllHandoffs(kept, projectRoot);
  return handoff;
}

/**
 * Read the latest unconsumed micro-handoff.
 * @param {string} [projectRoot] - Project root directory
 * @returns {object|null} Latest unconsumed handoff or null
 */
function readMicroHandoff(projectRoot) {
  const handoffs = readAllHandoffs(projectRoot);
  const unconsumed = handoffs.filter((h) => !h.consumed);
  // Return the last unconsumed (most recently appended) -- array order is the tiebreaker
  return unconsumed.length > 0 ? unconsumed[unconsumed.length - 1] : null;
}

/**
 * Mark a handoff as consumed by ID.
 * @param {string} handoffId - Handoff ID to mark consumed
 * @param {string} [projectRoot] - Project root directory
 * @returns {boolean} True if found and marked, false otherwise
 */
function markConsumed(handoffId, projectRoot) {
  const handoffs = readAllHandoffs(projectRoot);
  let found = false;
  for (const h of handoffs) {
    if (h.id === handoffId) {
      h.consumed = true;
      found = true;
      break;
    }
  }
  if (found) {
    writeAllHandoffs(handoffs, projectRoot);
  }
  return found;
}

/**
 * Get count of unconsumed handoffs.
 * @param {string} [projectRoot] - Project root directory
 * @returns {number} Count of unconsumed handoffs
 */
function getUnconsumedCount(projectRoot) {
  const handoffs = readAllHandoffs(projectRoot);
  return handoffs.filter((h) => !h.consumed).length;
}

/**
 * Clear all handoffs (used for testing/reset).
 * @param {string} [projectRoot] - Project root directory
 */
function clearHandoffs(projectRoot) {
  const filePath = getHandoffPath(projectRoot);
  try {
    fs.unlinkSync(filePath);
  } catch (_) {
    // File may not exist
  }
}

module.exports = {
  saveMicroHandoff,
  readMicroHandoff,
  markConsumed,
  getUnconsumedCount,
  clearHandoffs,
  readAllHandoffs,
  validateSchema,
  getHandoffPath,
  MAX_DECISIONS,
  MAX_FILES,
  MAX_BLOCKERS,
  MAX_UNCONSUMED,
  MAX_MEMORY_HINTS,
};
