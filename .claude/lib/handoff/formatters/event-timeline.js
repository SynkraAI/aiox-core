'use strict';

/**
 * Event Timeline Formatter
 *
 * Formats session events into a compact CLI-readable timeline.
 * Used by the `*task session-report` command to display recent events.
 *
 * Format: `[HH:MM] @agent type story`
 * Example: `[10:30] @dev story_start AIOX-HO-2.3`
 *
 * @module formatters/event-timeline
 * @see Story AIOX-HO-2.3
 */

/** Default number of events to show */
const DEFAULT_LIMIT = 10;

/**
 * Extract HH:MM from an ISO 8601 timestamp string.
 *
 * @param {string} timestamp - ISO 8601 timestamp (e.g., '2026-03-25T14:30:00Z')
 * @returns {string} Time in HH:MM format, or '??:??' if parsing fails
 */
function extractTime(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return '??:??';

  // Try to extract HH:MM from ISO format (e.g., 2026-03-25T14:30:00Z)
  const match = timestamp.match(/T(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  // Try Date parsing as fallback
  const d = new Date(timestamp);
  if (!isNaN(d.getTime())) {
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  return '??:??';
}

/**
 * Format a single event into a compact timeline entry.
 *
 * @param {object} event - Session event object
 * @param {string} [event.timestamp] - ISO 8601 timestamp
 * @param {string} [event.agent] - Agent ID
 * @param {string} [event.type] - Event type
 * @param {string} [event.story] - Story ID
 * @param {number} [event.prompt_count] - Prompt count (for periodic events)
 * @returns {string} Formatted timeline entry
 */
function formatEvent(event) {
  if (!event) return '';

  const time = extractTime(event.timestamp);
  const agent = event.agent ? `@${event.agent}` : '@?';
  const type = event.type || 'unknown';

  // For periodic events, show prompt count instead of story
  if (type === 'periodic' && event.prompt_count !== undefined) {
    return `[${time}] ${agent} ${type} (prompt ${event.prompt_count})`;
  }

  const story = event.story || '';
  return `[${time}] ${agent} ${type}${story ? ' ' + story : ''}`;
}

/**
 * Format an array of events into a compact CLI timeline.
 * Shows the last N events in reverse chronological order (newest first).
 *
 * @param {Array<object>} events - Array of session events
 * @param {number} [limit=10] - Maximum number of events to show
 * @returns {string} Formatted compact timeline string (multi-line)
 */
function formatCompactTimeline(events, limit) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return 'No events recorded.';
  }

  const effectiveLimit = (typeof limit === 'number' && limit > 0) ? limit : DEFAULT_LIMIT;

  // Take the last N events (most recent)
  const recent = events.slice(-effectiveLimit);

  // Reverse to show newest first
  const reversed = [...recent].reverse();

  // Format each event
  const lines = reversed.map(formatEvent).filter((line) => line.length > 0);

  if (lines.length === 0) {
    return 'No events recorded.';
  }

  return lines.join('\n');
}

module.exports = {
  formatCompactTimeline,
  formatEvent,
  extractTime,
  DEFAULT_LIMIT,
};
