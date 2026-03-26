'use strict';

/**
 * Story Details Aggregator
 *
 * Aggregates session events by story, providing per-story breakdowns
 * including event counts, agents involved, and status determination.
 * Used by the `*task session-report` command.
 *
 * @module aggregators/story-details
 * @see Story AIOX-HO-2.3
 */

/**
 * Aggregate events by story.
 *
 * Groups events by the `story` field and computes:
 * - Event count per story
 * - Unique agents per story
 * - Status: "Done" if a story_complete event exists, else "InProgress"
 *
 * @param {Array<object>} events - Array of session events
 * @returns {Array<{storyId: string, status: string, events: number, agents: string[]}>}
 *   Array of story summaries sorted by event count descending
 */
function aggregateStoryDetails(events) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return [];
  }

  const storyMap = new Map();

  for (const event of events) {
    const storyId = event.story;
    if (!storyId) continue;

    if (!storyMap.has(storyId)) {
      storyMap.set(storyId, {
        storyId,
        events: 0,
        agents: new Set(),
        hasComplete: false,
      });
    }

    const entry = storyMap.get(storyId);
    entry.events++;

    if (event.agent) {
      entry.agents.add(event.agent);
    }

    if (event.type === 'story_complete') {
      entry.hasComplete = true;
    }
  }

  // Convert to output format
  const results = [];
  for (const entry of storyMap.values()) {
    results.push({
      storyId: entry.storyId,
      status: entry.hasComplete ? 'Done' : 'InProgress',
      events: entry.events,
      agents: [...entry.agents].map((a) => `@${a}`),
    });
  }

  // Sort by event count descending
  results.sort((a, b) => b.events - a.events);

  return results;
}

/**
 * Format story details as a CLI table string.
 *
 * @param {Array<{storyId: string, status: string, events: number, agents: string[]}>} stories
 *   Story details from aggregateStoryDetails()
 * @returns {string} Formatted CLI table
 */
function formatStoryDetailsTable(stories) {
  if (!stories || stories.length === 0) {
    return 'No stories tracked in this session.';
  }

  const headers = ['Story', 'Status', 'Events', 'Agents'];
  const rows = stories.map((s) => [
    s.storyId,
    s.status,
    String(s.events),
    s.agents.join(', '),
  ]);

  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRow = rows.reduce((max, r) => Math.max(max, r[i].length), 0);
    return Math.max(h.length, maxRow);
  });

  const lines = [];

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

module.exports = {
  aggregateStoryDetails,
  formatStoryDetailsTable,
};
