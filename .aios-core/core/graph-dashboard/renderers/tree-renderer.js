'use strict';

const MAX_ITEMS_PER_BRANCH = 20;

/**
 * Box-drawing characters for tree rendering.
 */
const UNICODE_CHARS = { branch: '\u251C\u2500', last: '\u2514\u2500', pipe: '\u2502', space: ' ' };
const ASCII_CHARS = { branch: '+-', last: '\\-', pipe: '|', space: ' ' };

/**
 * Render graph data as ASCII dependency tree.
 * @param {Object} graphData - Normalized graph data { nodes, edges, source, isFallback }
 * @param {Object} [options]
 * @param {boolean} [options.color=true] - Enable ANSI colors (ignored if not TTY)
 * @param {boolean} [options.unicode=true] - Use Unicode box-drawing characters
 * @returns {string} Multiline ASCII tree string
 */
function renderTree(graphData, options = {}) {
  const useUnicode = options.unicode !== false;
  const chars = useUnicode ? UNICODE_CHARS : ASCII_CHARS;

  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  if (nodes.length === 0) {
    const badge = graphData.isFallback ? ' [OFFLINE]' : '';
    return `Dependency Graph (0 entities)${badge}\n(empty)`;
  }

  // Build dependency lookup: entityId → [dep1, dep2, ...]
  const depsMap = _buildDepsMap(edges);

  // Group nodes by category
  const categories = _groupByCategory(nodes);
  const categoryNames = Object.keys(categories).sort();

  const lines = [];
  const badge = graphData.isFallback ? ' [OFFLINE]' : '';
  lines.push(`Dependency Graph (${nodes.length} entities)${badge}`);

  for (let ci = 0; ci < categoryNames.length; ci++) {
    const catName = categoryNames[ci];
    const catNodes = categories[catName];
    const isLastCategory = ci === categoryNames.length - 1;
    const catPrefix = isLastCategory ? chars.last : chars.branch;
    const catContinue = isLastCategory ? chars.space : chars.pipe;

    lines.push(`${catPrefix} ${catName}/ (${catNodes.length})`);

    const sortedNodes = catNodes.sort((a, b) => a.id.localeCompare(b.id));
    const displayCount = Math.min(sortedNodes.length, MAX_ITEMS_PER_BRANCH);
    const hasMore = sortedNodes.length > MAX_ITEMS_PER_BRANCH;

    for (let ni = 0; ni < displayCount; ni++) {
      const node = sortedNodes[ni];
      const isLastNode = ni === displayCount - 1 && !hasMore;
      const nodePrefix = isLastNode ? chars.last : chars.branch;

      const deps = depsMap.get(node.id) || [];
      const depSuffix = deps.length > 0 ? ` ${chars.last} depends: ${deps.join(', ')}` : '';

      lines.push(`${catContinue}  ${nodePrefix} ${node.id}${depSuffix}`);
    }

    if (hasMore) {
      const remaining = sortedNodes.length - MAX_ITEMS_PER_BRANCH;
      lines.push(`${catContinue}  ${chars.last} ... (${remaining} more)`);
    }
  }

  return lines.join('\n');
}

/**
 * Build map of entityId → array of dependency IDs from edges.
 * @param {Array} edges - Array of { from, to, type }
 * @returns {Map<string, string[]>}
 */
function _buildDepsMap(edges) {
  const map = new Map();

  for (const edge of edges) {
    if (edge.type !== 'depends') continue;

    if (!map.has(edge.from)) {
      map.set(edge.from, []);
    }
    map.get(edge.from).push(edge.to);
  }

  return map;
}

/**
 * Group nodes by their category field.
 * @param {Array} nodes - Array of { id, label, type, path, category }
 * @returns {Object} { categoryName: [nodes...] }
 */
function _groupByCategory(nodes) {
  const groups = {};

  for (const node of nodes) {
    const cat = node.category || 'other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(node);
  }

  return groups;
}

module.exports = {
  renderTree,
  MAX_ITEMS_PER_BRANCH,
  UNICODE_CHARS,
  ASCII_CHARS,
};
