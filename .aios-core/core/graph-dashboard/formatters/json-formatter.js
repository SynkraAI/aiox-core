'use strict';

/**
 * Format graph data as JSON string.
 * Output is pipe-friendly and parseable by jq.
 * @param {Object} graphData - Normalized graph data { nodes, edges, source, isFallback }
 * @returns {string} JSON string (indented, no trailing newline)
 */
function formatAsJson(graphData) {
  return JSON.stringify(graphData, null, 2);
}

module.exports = { formatAsJson };
