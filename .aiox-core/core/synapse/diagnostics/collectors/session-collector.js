/**
 * Session Collector — Reads current SYNAPSE session state.
 *
 * Validates session fields: active_agent, prompt_count, bracket, schema.
 *
 * @module core/synapse/diagnostics/collectors/session-collector
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Collect session status data.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {string} [sessionId] - Optional session UUID to load
 * @returns {{ fields: Array<{ field: string, expected: string, actual: string, status: string }>, raw: object|null }}
 */
function collectSessionStatus(projectRoot, sessionId) {
  const sessionsDir = path.join(projectRoot, '.synapse', 'sessions');
  const fields = [];
  let raw = null;

  // Try to load session by ID, or find the most recent one
  let session = null;

  if (sessionId) {
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    session = _readJsonSafe(sessionPath);
  }

  // Fallback: read _active-agent.json bridge file
  const bridgePath = path.join(sessionsDir, '_active-agent.json');
  const bridgeData = _readJsonSafe(bridgePath);

  // Check active_agent
  const agentId = session?.active_agent?.id || bridgeData?.id || null;
  fields.push({
    field: 'active_agent.id',
    expected: '(any agent)',
    actual: agentId || '(none)',
    status: agentId ? 'PASS' : 'WARN',
  });

  // Check activation_quality
  const quality = session?.active_agent?.activation_quality || bridgeData?.activation_quality || null;
  fields.push({
    field: 'activation_quality',
    expected: 'full|partial|fallback',
    actual: quality || '(none)',
    status: quality ? 'PASS' : 'WARN',
  });

  // Check prompt_count
  const promptCount = session?.prompt_count ?? null;
  fields.push({
    field: 'prompt_count',
    expected: '>= 0',
    actual: promptCount !== null ? String(promptCount) : '(no session)',
    status: promptCount !== null ? 'PASS' : 'INFO',
  });

  // Check bracket
  const bracket = session?.context?.last_bracket || null;
  fields.push({
    field: 'bracket',
    expected: 'FRESH|MODERATE|DEPLETED|CRITICAL',
    actual: bracket || '(no session)',
    status: bracket ? 'PASS' : 'INFO',
  });

  // Check bridge file exists
  fields.push({
    field: '_active-agent.json',
    expected: 'exists',
    actual: bridgeData ? 'exists' : 'missing',
    status: bridgeData ? 'PASS' : 'WARN',
  });

  raw = { session, bridgeData };
  return { fields, raw };
}

/**
 * Safely read and parse a JSON file.
 * @param {string} filePath
 * @returns {object|null}
 */
function _readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

module.exports = { collectSessionStatus };
