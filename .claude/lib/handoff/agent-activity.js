'use strict';

/**
 * Agent Activity Summary Module
 *
 * Aggregates Tier 2 session state events into per-agent summaries.
 * Provides formatted output for CLI (`*session-report`) and
 * Tier 3 cross-session handoff files.
 *
 * Time metrics are labeled "approximate active span" to reflect that
 * timestamp deltas between events do NOT map 1:1 to agent active time.
 * Users may be idle between prompts, and periodic events fire only
 * every 5 prompts (coarse resolution).
 *
 * @module agent-activity
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-2.1
 */

/** Max lines for the Agent Activity section in Tier 3 handoff */
const MAX_HANDOFF_LINES = 30;

/**
 * Format a millisecond duration into a human-readable approximate span.
 * Returns "~Xh Ym" or "~Ym" or "~Xs" or "<1m".
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted span string
 */
function formatSpan(ms) {
  if (!ms || ms <= 0) return '<1m';

  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`;
  }
  if (totalMinutes > 0) {
    return `~${totalMinutes}m`;
  }
  return '<1m';
}

/**
 * Generate per-agent summaries from session state events.
 *
 * Groups events by the `agent` field, computes:
 * - Stories worked (deduplicated story IDs from story_start events)
 * - Files modified count (sum of files_modified fields)
 * - Decisions (extracted from agent_switch details)
 * - Approximate active span (time between first and last event per agent)
 * - Total event count per agent
 *
 * @param {object} sessionState - Session state object from session-state.js
 * @param {object} sessionState.session - Session header
 * @param {Array<object>} sessionState.events - Array of events
 * @returns {Array<object>} Array of agent summary objects
 */
function generateAgentSummary(sessionState) {
  if (!sessionState || !sessionState.events || sessionState.events.length === 0) {
    return [];
  }

  const agentMap = new Map();

  for (const event of sessionState.events) {
    const agent = event.agent;
    if (!agent) continue;

    if (!agentMap.has(agent)) {
      agentMap.set(agent, {
        agent,
        stories: new Set(),
        filesModified: 0,
        decisions: [],
        firstTimestamp: null,
        lastTimestamp: null,
        events: 0,
      });
    }

    const entry = agentMap.get(agent);
    entry.events++;

    // Track timestamps for active span
    const ts = event.timestamp ? new Date(event.timestamp).getTime() : null;
    if (ts && !isNaN(ts)) {
      if (!entry.firstTimestamp || ts < entry.firstTimestamp) {
        entry.firstTimestamp = ts;
      }
      if (!entry.lastTimestamp || ts > entry.lastTimestamp) {
        entry.lastTimestamp = ts;
      }
    }

    // Count stories from story_start events
    if (event.type === 'story_start' && event.story) {
      entry.stories.add(event.story);
    }

    // Also track stories from any event that has a story field
    if (event.story) {
      entry.stories.add(event.story);
    }

    // Sum files modified
    if (typeof event.files_modified === 'number') {
      entry.filesModified += event.files_modified;
    }

    // Extract decisions from agent_switch details
    if (event.type === 'agent_switch' && event.details) {
      const detail = String(event.details);
      // Only add non-trivial details as decisions
      if (detail.length > 5 && !detail.startsWith('Switched from')) {
        entry.decisions.push(detail);
      }
    }
  }

  // Convert to output format
  const summaries = [];
  for (const entry of agentMap.values()) {
    const spanMs = (entry.firstTimestamp && entry.lastTimestamp)
      ? entry.lastTimestamp - entry.firstTimestamp
      : 0;

    summaries.push({
      agent: entry.agent,
      stories: [...entry.stories],
      filesModified: entry.filesModified,
      decisions: entry.decisions.slice(0, 5), // max 5 decisions
      activeSpan: formatSpan(spanMs),
      events: entry.events,
    });
  }

  // Sort by events descending (most active agent first)
  summaries.sort((a, b) => b.events - a.events);

  return summaries;
}

/**
 * Format agent summaries as a CLI-readable table.
 *
 * Output format:
 * ```
 * Session Report -- {project}
 *
 * Total Prompts: 42
 * Agents Activated: 3 (@sm, @dev, @qa)
 * Stories Touched: 2 (AIOX-HO-2.1, AIOX-HO-2.2)
 * Files Modified: 18
 *
 * Agent Activity:
 * | Agent    | Stories | Files | Decisions | Approx. Active Span |
 * |----------|---------|-------|-----------|---------------------|
 * | @dev     | 1       | 12    | 5         | ~2h 15m             |
 * ```
 *
 * @param {Array<object>} summaries - Agent summaries from generateAgentSummary()
 * @param {object} [options] - Formatting options
 * @param {string} [options.project] - Project name
 * @param {number} [options.totalPrompts] - Total prompt count
 * @returns {string} Formatted CLI output
 */
function formatSummaryForCLI(summaries, options = {}) {
  if (!summaries || summaries.length === 0) {
    return 'No agent activity recorded in this session.';
  }

  const project = options.project || 'unknown';
  const totalPrompts = options.totalPrompts || 0;
  const lines = [];

  lines.push(`Session Report -- ${project}`);
  lines.push('');

  // Overview stats
  if (totalPrompts > 0) {
    lines.push(`Total Prompts: ${totalPrompts}`);
  }

  const agentNames = summaries.map((s) => `@${s.agent}`);
  lines.push(`Agents Activated: ${summaries.length} (${agentNames.join(', ')})`);

  const allStories = [...new Set(summaries.flatMap((s) => s.stories))];
  if (allStories.length > 0) {
    lines.push(`Stories Touched: ${allStories.length} (${allStories.join(', ')})`);
  }

  const totalFiles = summaries.reduce((sum, s) => sum + s.filesModified, 0);
  lines.push(`Files Modified: ${totalFiles}`);
  lines.push('');

  // Agent table
  lines.push('Agent Activity:');

  // Calculate column widths
  const headers = ['Agent', 'Stories', 'Files', 'Decisions', 'Approx. Active Span'];
  const rows = summaries.map((s) => [
    `@${s.agent}`,
    String(s.stories.length),
    String(s.filesModified),
    String(s.decisions.length),
    s.activeSpan,
  ]);

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

  return lines.join('\n');
}

/**
 * Format agent summaries as a compact markdown section for Tier 3 handoff files.
 * Respects the MAX_HANDOFF_LINES limit (30 lines).
 *
 * Output format:
 * ```markdown
 * ## Agent Activity
 *
 * Last session (2026-03-25):
 * - **@dev**: 1 story, 12 files, ~2h 15m -- Implemented AIOX-HO-2.1
 * - **@qa**: 1 story, 3 files, ~45m -- QA review
 * ```
 *
 * @param {Array<object>} summaries - Agent summaries from generateAgentSummary()
 * @param {object} [options] - Formatting options
 * @param {string} [options.date] - Date string
 * @returns {string} Markdown section string
 */
function formatSummaryForHandoff(summaries, options = {}) {
  if (!summaries || summaries.length === 0) {
    return '';
  }

  const date = options.date || new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push('## Agent Activity');
  lines.push('');
  lines.push(`Last session (${date}):`);

  for (const s of summaries) {
    const storyCount = s.stories.length;
    const storyLabel = storyCount === 1 ? '1 story' : `${storyCount} stories`;
    const fileLabel = s.filesModified === 1 ? '1 file' : `${s.filesModified} files`;

    let detail = '';
    if (s.stories.length > 0) {
      detail = ` -- ${s.stories.slice(0, 2).join(', ')}`;
    }
    if (s.decisions.length > 0) {
      detail = ` -- ${s.decisions[0].slice(0, 60)}`;
    }

    lines.push(`- **@${s.agent}**: ${storyLabel}, ${fileLabel}, ${s.activeSpan}${detail}`);

    // Stop if we approach the limit
    if (lines.length >= MAX_HANDOFF_LINES - 2) break;
  }

  lines.push('');

  // Trim if over limit
  if (lines.length > MAX_HANDOFF_LINES) {
    return lines.slice(0, MAX_HANDOFF_LINES).join('\n');
  }

  return lines.join('\n');
}

module.exports = {
  generateAgentSummary,
  formatSummaryForCLI,
  formatSummaryForHandoff,
  formatSpan,
  MAX_HANDOFF_LINES,
};
