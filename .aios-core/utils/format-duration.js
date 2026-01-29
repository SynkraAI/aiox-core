/**
 * Format Duration Utility - Story TEST-1
 *
 * Converts milliseconds to human-readable format.
 *
 * @module utils/format-duration
 * @version 1.0.0
 */

/**
 * Format milliseconds to human-readable duration
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Human-readable duration (e.g., "2h 30m 45s")
 *
 * @example
 * formatDuration(3661000) // "1h 1m 1s"
 * formatDuration(45000)   // "45s"
 * formatDuration(0)       // "0s"
 */
function formatDuration(ms) {
  // Handle edge cases
  if (typeof ms !== 'number' || isNaN(ms)) {
    return '0s';
  }

  // Handle negative numbers
  if (ms < 0) {
    return '-' + formatDuration(Math.abs(ms));
  }

  // Handle zero
  if (ms === 0) {
    return '0s';
  }

  // Handle very large numbers (cap at 999 days)
  const maxMs = 999 * 24 * 60 * 60 * 1000;
  if (ms > maxMs) {
    return '999d+';
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours % 24 > 0) {
    parts.push(`${hours % 24}h`);
  }

  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60}m`);
  }

  if (seconds % 60 > 0 || parts.length === 0) {
    parts.push(`${seconds % 60}s`);
  }

  return parts.join(' ');
}

/**
 * Format milliseconds to short format
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Short format (e.g., "2:30:45")
 */
function formatDurationShort(ms) {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {
  formatDuration,
  formatDurationShort,
};
