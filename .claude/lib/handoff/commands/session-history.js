'use strict';

/**
 * Session History Command Handler
 *
 * Implements the `*task session-history {project}` command.
 * Scans `.aiox/session-history/{project}/` for archived state YAML files,
 * parses session metadata, and displays a formatted CLI table.
 *
 * Uses the L4 `*task` pattern -- no L2 agent command registration needed.
 *
 * Performance target: <2s for 50 archived sessions (batch processing).
 *
 * @module commands/session-history
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-2.3
 */

const fs = require('fs');
const path = require('path');

/** Default number of sessions to show */
const DEFAULT_LIMIT = 20;

/** Minimum file size to consider (bytes) -- skip empty/corrupt files */
const MIN_FILE_SIZE = 10;

/**
 * Format a millisecond duration into a human-readable string.
 * Replicates the pattern from agent-activity.formatSpan but without requiring the dependency.
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (!ms || ms <= 0) return '<1m';

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (totalMinutes > 0) {
    return `${totalMinutes}m`;
  }
  return '<1m';
}

/**
 * Parse a minimal subset of an archived state YAML file.
 * Extracts session header and event metadata without full event parsing.
 * Optimized for speed -- only reads what is needed for the history table.
 *
 * @param {string} content - YAML file content
 * @returns {{ sessionId: string, started: string, project: string, eventCount: number, agents: string[], durationMs: number }|null}
 *   Parsed session metadata, or null if unparseable
 */
function parseSessionMetadata(content) {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return null;
  }

  const result = {
    sessionId: '',
    started: '',
    project: '',
    eventCount: 0,
    agents: [],
    durationMs: 0,
  };

  const lines = content.split('\n');
  const agentSet = new Set();
  let firstTimestamp = null;
  let lastTimestamp = null;
  let inSession = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === 'session:') {
      inSession = true;
      continue;
    }

    if (trimmed === 'events:') {
      inSession = false;
      continue;
    }

    // Parse session header fields
    if (inSession) {
      const match = trimmed.match(/^(\w+):\s*"?([^"]*)"?$/);
      if (match) {
        const key = match[1];
        const val = match[2];
        if (key === 'id') result.sessionId = val;
        if (key === 'started') result.started = val;
        if (key === 'project') result.project = val;
      }
      continue;
    }

    // Parse event entries (minimal -- just count events, extract agents and timestamps)
    if (trimmed.startsWith('- timestamp:')) {
      result.eventCount++;
      const ts = trimmed.replace('- timestamp:', '').trim().replace(/^"|"$/g, '');
      const tsMs = new Date(ts).getTime();
      if (!isNaN(tsMs)) {
        if (!firstTimestamp || tsMs < firstTimestamp) firstTimestamp = tsMs;
        if (!lastTimestamp || tsMs > lastTimestamp) lastTimestamp = tsMs;
      }
    }

    if (trimmed.startsWith('agent:')) {
      const agent = trimmed.replace('agent:', '').trim().replace(/^"|"$/g, '');
      if (agent) agentSet.add(agent);
    }
  }

  if (result.eventCount === 0 && !result.sessionId) {
    return null;
  }

  result.agents = [...agentSet].map((a) => `@${a}`);
  result.durationMs = (firstTimestamp && lastTimestamp) ? lastTimestamp - firstTimestamp : 0;

  return result;
}

/**
 * Extract a date string from an ISO timestamp for display.
 *
 * @param {string} started - ISO 8601 timestamp
 * @returns {string} Date in YYYY-MM-DD format
 */
function extractDate(started) {
  if (!started || typeof started !== 'string') return 'unknown';

  // Try to match YYYY-MM-DD
  const match = started.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  const d = new Date(started);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return 'unknown';
}

/**
 * Scan archived sessions for a project and return metadata.
 *
 * @param {string} project - Project name
 * @param {object} [options] - Options
 * @param {number} [options.limit] - Max sessions to return (default: DEFAULT_LIMIT)
 * @param {string} [options.projectRoot] - Project root directory
 * @returns {{ sessions: Array, totalCount: number }}
 */
function scanArchives(project, options = {}) {
  const root = options.projectRoot || process.cwd();
  const limit = (typeof options.limit === 'number' && options.limit > 0)
    ? options.limit
    : DEFAULT_LIMIT;

  const archiveDir = path.join(root, '.aiox', 'session-history', project);

  // Check if archive directory exists
  if (!fs.existsSync(archiveDir)) {
    return { sessions: [], totalCount: 0 };
  }

  // Read directory entries -- batch processing for performance
  let entries;
  try {
    entries = fs.readdirSync(archiveDir);
  } catch (_) {
    return { sessions: [], totalCount: 0 };
  }

  // Filter for state-*.yaml files (archived session state files)
  const stateFiles = entries
    .filter((name) => name.startsWith('state-') && name.endsWith('.yaml'))
    .sort()
    .reverse(); // Most recent first (filenames contain ISO timestamps)

  const totalCount = stateFiles.length;

  // Only parse the first `limit` files for performance
  const sessions = [];
  const filesToParse = stateFiles.slice(0, limit);

  for (const fileName of filesToParse) {
    const filePath = path.join(archiveDir, fileName);

    // Skip tiny/empty files
    try {
      const stat = fs.statSync(filePath);
      if (stat.size < MIN_FILE_SIZE) continue;
    } catch (_) {
      continue;
    }

    // Read and parse
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (_) {
      continue;
    }

    const metadata = parseSessionMetadata(content);
    if (!metadata) continue;

    sessions.push(metadata);
  }

  return { sessions, totalCount };
}

/**
 * Format archived sessions as a CLI table.
 *
 * @param {string} project - Project name
 * @param {Array} sessions - Array of session metadata
 * @param {number} totalCount - Total number of archived sessions
 * @param {number} limit - Requested limit
 * @returns {string} Formatted CLI output
 */
function formatHistoryTable(project, sessions, totalCount, limit) {
  const lines = [];

  lines.push(`Session History -- ${project} (Last ${Math.min(limit, totalCount)} sessions)`);
  lines.push('');

  if (sessions.length === 0) {
    lines.push('No archived sessions found.');
    lines.push(`Archive directory: .aiox/session-history/${project}/`);
    return lines.join('\n');
  }

  const headers = ['Date', 'Events', 'Agents', 'Duration', 'Session ID'];
  const rows = sessions.map((s) => [
    extractDate(s.started),
    String(s.eventCount),
    s.agents.join(', ') || '-',
    formatDuration(s.durationMs),
    s.sessionId ? s.sessionId.slice(0, 12) : '-',
  ]);

  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRow = rows.reduce((max, r) => Math.max(max, r[i].length), 0);
    return Math.max(h.length, maxRow);
  });

  // Header row
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');
  lines.push(`| ${headerRow} |`);

  // Separator
  const sep = widths.map((w) => '-'.repeat(w)).join(' | ');
  lines.push(`| ${sep} |`);

  // Data rows
  for (const row of rows) {
    const formatted = row.map((r, i) => r.padEnd(widths[i])).join(' | ');
    lines.push(`| ${formatted} |`);
  }

  // Footer
  lines.push('');
  if (totalCount > limit) {
    lines.push(`Showing last ${sessions.length} of ${totalCount} sessions. Use --last N to override.`);
  } else {
    lines.push(`Showing all ${totalCount} sessions.`);
  }

  return lines.join('\n');
}

/**
 * Generate the session history report.
 *
 * @param {string} project - Project name (e.g., 'aios-core')
 * @param {object} [options] - Options
 * @param {number} [options.limit] - Max sessions to show
 * @param {string} [options.projectRoot] - Project root directory
 * @returns {string} Formatted CLI report
 */
function generateHistory(project, options = {}) {
  if (!project || typeof project !== 'string') {
    return 'Usage: *task session-history {project}\nExample: *task session-history aios-core';
  }

  const limit = options.limit || DEFAULT_LIMIT;
  const { sessions, totalCount } = scanArchives(project, {
    limit,
    projectRoot: options.projectRoot,
  });

  return formatHistoryTable(project, sessions, totalCount, limit);
}

module.exports = {
  generateHistory,
  scanArchives,
  formatHistoryTable,
  parseSessionMetadata,
  formatDuration,
  extractDate,
  DEFAULT_LIMIT,
  MIN_FILE_SIZE,
};
