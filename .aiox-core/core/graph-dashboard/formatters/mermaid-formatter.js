'use strict';

/**
 * Format graph data as Mermaid diagram string.
 * Output is valid Mermaid syntax for documentation.
 * @param {Object} graphData - Normalized graph data { nodes, edges, source, isFallback }
 * @returns {string} Mermaid format string
 */
function formatAsMermaid(graphData) {
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];
  const lines = [];

  lines.push('graph TD');

  const connectedNodes = new Set();

  for (const edge of edges) {
    const fromLabel = _escapeMermaid(edge.from);
    const toLabel = _escapeMermaid(edge.to);
    lines.push(`  ${_safeId(edge.from)}["${fromLabel}"] --> ${_safeId(edge.to)}["${toLabel}"]`);
    connectedNodes.add(edge.from);
    connectedNodes.add(edge.to);
  }

  for (const node of nodes) {
    if (!connectedNodes.has(node.id)) {
      const label = _escapeMermaid(node.label || node.id);
      lines.push(`  ${_safeId(node.id)}["${label}"]`);
    }
  }

  return lines.join('\n');
}

/**
 * Create a safe Mermaid node ID (alphanumeric + hyphens + underscores).
 * @param {string} id - Raw node ID
 * @returns {string} Safe ID
 * @private
 */
function _safeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Escape special characters for Mermaid label strings.
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 * @private
 */
function _escapeMermaid(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;');
}

module.exports = { formatAsMermaid, _safeId, _escapeMermaid };
