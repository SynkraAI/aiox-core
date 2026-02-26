'use strict';

/**
 * Format graph data as Graphviz DOT string.
 * Output is valid DOT that can be rendered with `dot -Tpng`.
 * @param {Object} graphData - Normalized graph data { nodes, edges, source, isFallback }
 * @returns {string} DOT format string
 */
function formatAsDot(graphData) {
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];
  const lines = [];

  lines.push('digraph G {');
  lines.push('  rankdir=TB;');
  lines.push('  node [shape=box, style=rounded];');

  for (const node of nodes) {
    const label = _escapeDot(node.label || node.id);
    const id = _escapeDot(node.id);
    lines.push(`  "${id}" [label="${label}"];`);
  }

  for (const edge of edges) {
    const from = _escapeDot(edge.from);
    const to = _escapeDot(edge.to);
    lines.push(`  "${from}" -> "${to}";`);
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Escape special characters for DOT strings.
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 * @private
 */
function _escapeDot(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

module.exports = { formatAsDot, _escapeDot };
