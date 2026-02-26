'use strict';

// Design tokens aligned with dashboard globals.css (Design Tokens v2.0)
// Source of truth: pro-design-migration/apps/dashboard/src/app/globals.css
const THEME = {
  bg: {
    base: '#000000',       // --bg-base
    surface: '#0A0A0A',    // --bg-surface
    overlay: 'rgba(10,10,10,0.9)', // --bg-surface + opacity
  },
  text: {
    primary: '#E8E8DF',    // --text-primary
    secondary: '#B8B8AC',  // --text-secondary
    tertiary: '#8A8A7F',   // --text-tertiary
    muted: '#6B6B63',      // --text-muted
  },
  status: {
    success: '#4ADE80',    // --status-success
    warning: '#FBBF24',    // --status-warning
    error: '#F87171',      // --status-error
    info: '#60A5FA',       // --status-info
  },
  border: {
    default: 'rgba(255,255,255,0.06)', // --border
    subtle: 'rgba(255,255,255,0.04)',  // --border-subtle (card-refined)
    highlight: 'rgba(201,178,152,0.25)', // --border-gold
    gold: 'rgba(201,178,152,0.25)',    // --border-gold (alias for highlight)
    goldStrong: 'rgba(201,178,152,0.5)', // --border-gold-strong (selection)
  },
  accent: {
    gold: '#C9B298',       // --accent-gold
  },
  agent: {
    dev: '#22c55e',        // --agent-dev
    sm: '#f472b6',         // --agent-sm
    po: '#f97316',         // --agent-po
    qa: '#eab308',         // --agent-qa
    architect: '#8b5cf6',  // --agent-architect
    devops: '#ec4899',     // --agent-devops
    analyst: '#06b6d4',    // --agent-analyst
  },
  tooltip: {
    bg: '#0A0A0A',         // = bg.surface (card-refined)
    border: 'rgba(255,255,255,0.04)', // = border.subtle
    shadow: '0 4px 12px rgba(0,0,0,0.5)', // --tooltip-shadow
  },
  radius: {
    md: '4px',             // --radius-md
  },
  controls: {
    sliderThumb: '#C9B298',                // = accent.gold
    sliderTrack: 'rgba(255,255,255,0.1)',  // slider track background
  },
};

const CATEGORY_COLORS = {
  agents: { color: THEME.agent.dev, shape: 'dot' },
  tasks: { color: THEME.status.info, shape: 'box' },
  templates: { color: THEME.status.warning, shape: 'diamond' },
  checklists: { color: THEME.agent.po, shape: 'triangle' },
  workflows: { color: THEME.agent.sm, shape: 'star' },
  'scripts/task': { color: THEME.status.success, shape: 'box' },
  'scripts/engine': { color: THEME.agent.devops, shape: 'box' },
  'scripts/infra': { color: THEME.agent.analyst, shape: 'box' },
  utils: { color: THEME.agent.analyst, shape: 'ellipse' },
  data: { color: THEME.agent.qa, shape: 'database' },
  tools: { color: THEME.agent.architect, shape: 'hexagon' },
};

const DEFAULT_COLOR = { color: THEME.text.tertiary, shape: 'box' };

const LIFECYCLE_STYLES = {
  production: { opacity: 1.0, borderDashes: false, colorOverride: null },
  experimental: { opacity: 0.8, borderDashes: [5, 5], colorOverride: null },
  deprecated: { opacity: 0.5, borderDashes: false, colorOverride: THEME.text.tertiary },
  orphan: { opacity: 0.3, borderDashes: [2, 4], colorOverride: THEME.text.muted },
};

/**
 * Sanitize a string for safe embedding inside HTML/JS.
 * Prevents XSS by escaping HTML entities and JS-breaking chars.
 * @param {string} str - Raw string
 * @returns {string} Sanitized string
 */
function _sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Build vis-network nodes array with category-based and lifecycle styling.
 * @param {Array} nodes - Raw graph nodes
 * @returns {Array} Styled nodes for vis-network
 */
function _buildVisNodes(nodes) {
  const seen = new Set();
  return (nodes || []).reduce((acc, node) => {
    if (seen.has(node.id)) return acc;
    seen.add(node.id);

    const category = (node.group || node.category || '').toLowerCase();
    const style = CATEGORY_COLORS[category]
      || (category === 'scripts' ? CATEGORY_COLORS['scripts/task'] : null)
      || DEFAULT_COLOR;
    const lifecycle = node.lifecycle || 'production';
    const lcStyle = LIFECYCLE_STYLES[lifecycle] || LIFECYCLE_STYLES.production;
    const nodeColor = lcStyle.colorOverride || style.color;

    acc.push({
      id: node.id,
      label: _sanitize(node.label || node.id),
      group: category,
      lifecycle: lifecycle,
      path: node.path || '',
      color: {
        background: nodeColor,
        border: THEME.border.subtle,
        highlight: { background: nodeColor, border: THEME.border.goldStrong },
        hover: { background: nodeColor, border: THEME.border.gold },
      },
      opacity: lcStyle.opacity,
      shapeProperties: { borderDashes: lcStyle.borderDashes },
      shape: style.shape,
    });
    return acc;
  }, []);
}

/**
 * Build vis-network edges array.
 * @param {Array} edges - Raw graph edges
 * @returns {Array} Edges for vis-network
 */
function _buildVisEdges(edges) {
  return (edges || []).map((edge) => ({
    from: edge.from,
    to: edge.to,
    arrows: 'to',
  }));
}

/**
 * Build the sidebar HTML for filters.
 * @returns {string} Sidebar HTML
 */
function _buildSidebar(nodes) {
  // Compute node counts per category
  const categoryCounts = {};
  (nodes || []).forEach((n) => {
    const cat = (n.group || n.category || '').toLowerCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryItems = Object.entries(CATEGORY_COLORS).map(([name, style]) => {
    const count = categoryCounts[name] || 0;
    return `<label class="filter-item">
      <input type="checkbox" data-filter="category" value="${name}" checked>
      <span class="status-dot" style="color:${style.color}"></span>
      <span style="color:${THEME.text.secondary};font-size:11px">${name}</span>
      <span style="color:${THEME.text.tertiary};font-size:11px;margin-left:auto">${count}</span>
    </label>`;
  }).join('\n');

  const lifecycleItems = Object.entries(LIFECYCLE_STYLES).map(([name, style]) => {
    const opacity = style.opacity;
    return `<label class="filter-item">
      <input type="checkbox" data-filter="lifecycle" value="${name}" checked>
      <span style="opacity:${opacity}">&#9679;</span> ${name}
    </label>`;
  }).join('\n');

  return `<div id="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">Filters</span>
      <button id="btn-toggle-sidebar" title="Toggle sidebar">&#9776;</button>
    </div>
    <div id="sidebar-content">
      <div class="filter-section">
        <input type="text" id="search-input" placeholder="Search entities..." autocomplete="off">
      </div>
      <div class="filter-section">
        <div class="section-title">ENTITY TYPES</div>
        <div class="gold-line"></div>
        ${categoryItems}
      </div>
      <div class="filter-section">
        <div class="section-title">Lifecycle</div>
        ${lifecycleItems}
        <label class="filter-item hide-orphans">
          <input type="checkbox" id="hide-orphans"> Hide Orphans
        </label>
      </div>
      <div class="filter-section physics-section">
        <div class="section-title physics-toggle" style="cursor:pointer">PHYSICS</div>
        <div class="gold-line"></div>
        <div class="physics-content" style="display:none">
          <div class="slider-row">
            <label class="slider-label">Center Force <span id="val-center" style="color:${THEME.text.tertiary}">0.3</span></label>
            <input type="range" id="slider-center" min="0" max="1" step="0.05" value="0.3" aria-label="Center Force">
          </div>
          <div class="slider-row">
            <label class="slider-label">Repel Force <span id="val-repel" style="color:${THEME.text.tertiary}">-2000</span></label>
            <input type="range" id="slider-repel" min="-30000" max="0" step="500" value="-2000" aria-label="Repel Force">
          </div>
          <div class="slider-row">
            <label class="slider-label">Link Force <span id="val-link" style="color:${THEME.text.tertiary}">0.04</span></label>
            <input type="range" id="slider-link" min="0" max="1" step="0.01" value="0.04" aria-label="Link Force">
          </div>
          <div class="slider-row">
            <label class="slider-label">Link Distance <span id="val-distance" style="color:${THEME.text.tertiary}">95</span></label>
            <input type="range" id="slider-distance" min="10" max="500" step="5" value="95" aria-label="Link Distance">
          </div>
          <div class="physics-buttons">
            <button id="btn-physics-reset" class="action-btn">Reset</button>
            <button id="btn-physics-pause" class="action-btn">Pause</button>
          </div>
        </div>
      </div>
      <div id="depth-selector" class="filter-section" style="display:none">
        <div class="section-title">DEPTH</div>
        <div class="gold-line"></div>
        <div class="depth-buttons">
          <button class="depth-btn active" data-depth="1">1</button>
          <button class="depth-btn" data-depth="2">2</button>
          <button class="depth-btn" data-depth="3">3</button>
          <button class="depth-btn" data-depth="all">All</button>
        </div>
        <div id="depth-node-count" style="color:${THEME.text.tertiary};font-size:11px;margin-top:6px"></div>
      </div>
      <div class="filter-section">
        <div class="section-title">NODE SIZE</div>
        <div class="gold-line"></div>
        <div class="size-buttons">
          <button class="size-btn active" data-sizing="uniform">Uniform</button>
          <button class="size-btn" data-sizing="degree">By Degree</button>
          <button class="size-btn" data-sizing="in-degree">By In-Degree</button>
          <button class="size-btn" data-sizing="out-degree">By Out-Degree</button>
        </div>
      </div>
      <div class="filter-section">
        <div class="section-title">LAYOUT</div>
        <div class="gold-line"></div>
        <div class="layout-buttons">
          <button class="layout-btn active" data-layout="force">Force</button>
          <button class="layout-btn" data-layout="hierarchical">Hierarchical</button>
          <button class="layout-btn" data-layout="circular">Circular</button>
        </div>
      </div>
      <div class="filter-section">
        <div class="section-title">EXPORT</div>
        <div class="gold-line"></div>
        <div class="export-buttons">
          <button class="export-btn" id="btn-export-png" aria-label="Export graph as PNG image">PNG</button>
          <button class="export-btn" id="btn-export-json" aria-label="Export graph data as JSON file">JSON</button>
        </div>
      </div>
      <div class="filter-section">
        <div class="section-title">CLUSTERING</div>
        <div class="gold-line"></div>
        <button id="btn-cluster-category" class="action-btn">Cluster by Category</button>
      </div>
      <div class="filter-section">
        <div class="section-title">STATISTICS</div>
        <div class="gold-line"></div>
        <div id="stats-panel">
          <div class="stat-row"><span class="stat-label" style="color:${THEME.text.secondary}">Total Nodes</span> <span class="stat-value" id="stat-nodes" style="color:${THEME.text.primary}">0</span></div>
          <div class="stat-row"><span class="stat-label" style="color:${THEME.text.secondary}">Total Edges</span> <span class="stat-value" id="stat-edges" style="color:${THEME.text.primary}">0</span></div>
          <div class="stat-row"><span class="stat-label" style="color:${THEME.text.secondary}">Graph Density</span> <span class="stat-value" id="stat-density" style="color:${THEME.text.primary}">0</span></div>
          <div class="stat-row"><span class="stat-label" style="color:${THEME.text.secondary}">Avg Degree</span> <span class="stat-value" id="stat-avg-degree" style="color:${THEME.text.primary}">0</span></div>
          <div class="gold-line"></div>
          <div class="stat-label" style="color:${THEME.text.secondary};margin-bottom:4px">Top 5 Connected</div>
          <div id="stat-top5"></div>
        </div>
      </div>
      <div class="filter-section actions">
        <button id="btn-reset" class="action-btn">Reset / Show All</button>
        <button id="btn-exit-focus" class="action-btn" style="display:none">Exit Focus Mode</button>
      </div>
      <div id="metrics" class="filter-section metrics"></div>
    </div>
  </div>`;
}

/**
 * Build the legend HTML for the graph (kept for backward compat, now in sidebar).
 * @returns {string} Legend HTML (empty — legend is now part of sidebar)
 */
function _buildLegend() {
  return '';
}

/**
 * Format graph data as a self-contained HTML page with vis-network,
 * DataView filtering, lifecycle styling, focus mode, search, and metrics.
 * @param {Object} graphData - Normalized graph data { nodes, edges, source, isFallback }
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.autoRefresh] - Add meta-refresh for watch mode
 * @param {number} [options.refreshInterval] - Refresh interval in seconds (default: 5)
 * @returns {string} Complete HTML string
 */
function formatAsHtml(graphData, options = {}) {
  const visNodes = _buildVisNodes(graphData.nodes);
  const visEdges = _buildVisEdges(graphData.edges);
  const sidebar = _buildSidebar(graphData.nodes);

  const nodesJson = JSON.stringify(visNodes);
  const edgesJson = JSON.stringify(visEdges);

  const metaRefresh = options.autoRefresh
    ? `<meta http-equiv="refresh" content="${options.refreshInterval || 5}">`
    : '';

  const nodeCount = visNodes.length;
  const isLargeGraph = nodeCount > 200;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AIOS Graph Dashboard</title>
  ${metaRefresh}
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: ${THEME.bg.base}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace; }
    #graph { position: absolute; top: 0; left: 260px; right: 0; bottom: 0; }
    #status { position: fixed; top: 10px; left: 270px; color: ${THEME.accent.gold}; font-family: monospace; font-size: 13px; z-index: 100; background: ${THEME.bg.overlay}; padding: 6px 12px; border-radius: ${THEME.radius.md}; }
    #sidebar {
      position: fixed; top: 0; left: 0; width: 260px; height: 100vh;
      background: ${THEME.bg.surface}; border-right: 1px solid ${THEME.border.default};
      overflow-y: auto; z-index: 200; color: ${THEME.text.secondary}; font-size: 12px;
    }
    #sidebar.collapsed { width: 40px; }
    #sidebar.collapsed #sidebar-content { display: none; }
    #sidebar.collapsed .sidebar-title { display: none; }
    #sidebar.collapsed ~ #graph { left: 40px; }
    #sidebar.collapsed ~ #status { left: 50px; }
    .sidebar-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 12px; border-bottom: 1px solid ${THEME.border.default};
    }
    .sidebar-title { font-size: 14px; font-weight: 600; color: ${THEME.text.primary}; }
    #btn-toggle-sidebar {
      background: none; border: none; color: ${THEME.text.secondary}; font-size: 16px;
      cursor: pointer; padding: 2px 6px;
    }
    #btn-toggle-sidebar:hover { color: ${THEME.text.primary}; }
    .filter-section { padding: 8px 12px; border-bottom: 1px solid ${THEME.border.default}; }
    .section-title { font-size: 10px; text-transform: uppercase; color: ${THEME.accent.gold}; margin-bottom: 6px; letter-spacing: 0.2em; }
    .filter-item { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; }
    .filter-item input[type="checkbox"] { margin: 0; cursor: pointer; }
    .filter-item.hide-orphans { margin-top: 6px; padding-top: 6px; border-top: 1px solid ${THEME.border.default}; }
    #search-input {
      width: 100%; padding: 6px 8px; background: ${THEME.bg.base}; border: 1px solid ${THEME.border.default};
      color: ${THEME.text.secondary}; border-radius: ${THEME.radius.md}; font-size: 12px; outline: none;
    }
    #search-input:focus { border-color: ${THEME.accent.gold}; }
    .action-btn {
      width: 100%; padding: 6px; margin-top: 4px; background: ${THEME.border.default}; border: none;
      color: ${THEME.text.secondary}; border-radius: ${THEME.radius.md}; cursor: pointer; font-size: 12px;
    }
    .action-btn:hover { background: ${THEME.accent.gold}; color: ${THEME.bg.base}; }
    .metrics { color: ${THEME.text.tertiary}; font-size: 11px; line-height: 1.6; }
    .metrics b { color: ${THEME.text.secondary}; }
    .status-dot {
      display: inline-block; width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; box-shadow: 0 0 8px currentColor; flex-shrink: 0;
    }
    .gold-line {
      height: 1px; margin: 6px 0;
      background: linear-gradient(90deg, ${THEME.accent.gold}, transparent);
    }
    .slider-row { margin-bottom: 8px; }
    .slider-label { display: flex; justify-content: space-between; font-size: 11px; color: ${THEME.text.secondary}; margin-bottom: 2px; }
    .physics-buttons { display: flex; gap: 6px; margin-top: 6px; }
    .physics-buttons .action-btn { flex: 1; }
    input[type="range"] {
      -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px;
      background: ${THEME.controls.sliderTrack}; outline: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
      background: ${THEME.controls.sliderThumb}; cursor: pointer;
    }
    input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%; border: none;
      background: ${THEME.controls.sliderThumb}; cursor: pointer;
    }
    input[type="range"]::-moz-range-track {
      height: 4px; border-radius: 2px; background: ${THEME.controls.sliderTrack};
    }
    .depth-buttons { display: flex; gap: 6px; }
    .depth-btn {
      flex: 1; padding: 4px 0; background: ${THEME.border.default}; border: 1px solid ${THEME.border.subtle};
      color: ${THEME.text.secondary}; border-radius: ${THEME.radius.md}; cursor: pointer;
      font-size: 12px; font-family: inherit; text-align: center;
    }
    .depth-btn:hover { border-color: ${THEME.border.gold}; }
    .depth-btn.active { background: ${THEME.accent.gold}; color: ${THEME.bg.base}; border-color: ${THEME.accent.gold}; }
    .size-buttons, .layout-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
    .size-btn, .layout-btn {
      flex: 1; min-width: 45%; padding: 4px 0; background: ${THEME.border.default}; border: 1px solid ${THEME.border.subtle};
      color: ${THEME.text.secondary}; border-radius: ${THEME.radius.md}; cursor: pointer;
      font-size: 11px; font-family: inherit; text-align: center;
    }
    .size-btn:hover, .layout-btn:hover { border-color: ${THEME.border.gold}; }
    .size-btn.active, .layout-btn.active { background: ${THEME.accent.gold}; color: ${THEME.bg.base}; border-color: ${THEME.accent.gold}; }
    .export-buttons { display: flex; gap: 6px; }
    .export-btn {
      flex: 1; padding: 6px 0; background: ${THEME.bg.surface}; border: 1px solid ${THEME.border.subtle};
      color: ${THEME.text.secondary}; border-radius: ${THEME.radius.md}; cursor: pointer;
      font-size: 11px; font-family: inherit; text-align: center;
    }
    .export-btn:hover { border-color: ${THEME.border.gold}; color: ${THEME.text.primary}; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 2px 0; font-size: 11px; }
    .stat-label { font-size: 11px; }
    .stat-value { font-size: 11px; font-weight: 600; }
    .top5-item { display: flex; justify-content: space-between; font-size: 11px; padding: 1px 0; }
    .top5-name { color: ${THEME.text.secondary}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
    .top5-degree { color: ${THEME.text.primary}; font-weight: 600; margin-left: 8px; flex-shrink: 0; }
    #minimap-container {
      position: fixed; bottom: 16px; right: 16px; width: 200px; z-index: 400;
      background: ${THEME.bg.surface}; border: 1px solid ${THEME.border.subtle};
      border-radius: ${THEME.radius.md}; overflow: hidden;
    }
    #minimap-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 4px 8px; font-size: 10px; color: ${THEME.text.tertiary};
    }
    #minimap-toggle {
      background: none; border: none; color: ${THEME.text.tertiary}; cursor: pointer;
      font-size: 12px; padding: 0 2px;
    }
    #minimap-toggle:hover { color: ${THEME.text.primary}; }
    #minimap-canvas { display: block; width: 200px; height: 150px; }
    #minimap-container.collapsed #minimap-canvas { display: none; }
    #minimap-container.collapsed { width: auto; }
    #node-tooltip {
      display: none; position: fixed; z-index: 500;
      background: ${THEME.tooltip.bg}; border: 1px solid ${THEME.tooltip.border};
      border-radius: ${THEME.radius.md}; padding: 12px;
      box-shadow: ${THEME.tooltip.shadow}; max-width: 320px; pointer-events: auto;
    }
    #node-tooltip .tt-name { color: ${THEME.text.primary}; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    #node-tooltip .tt-type { display: flex; align-items: center; gap: 6px; color: ${THEME.text.secondary}; font-size: 11px; margin-bottom: 4px; }
    #node-tooltip .tt-path { color: ${THEME.text.tertiary}; font-size: 10px; font-family: monospace; margin-bottom: 4px; word-break: break-all; }
    #node-tooltip .tt-deps { color: ${THEME.text.secondary}; font-size: 11px; }
  </style>
</head>
<body>
  <div id="status">Loading vis-network...</div>
  ${sidebar}
  <div id="node-tooltip" role="tooltip"></div>
  <div id="graph"></div>
  <div id="minimap-container">
    <div id="minimap-header">
      <span>Map</span>
      <button id="minimap-toggle" aria-label="Toggle minimap">&#x2715;</button>
    </div>
    <canvas id="minimap-canvas" width="200" height="150"></canvas>
  </div>
  <script>
    (function() {
      var statusEl = document.getElementById('status');
      if (typeof vis === 'undefined') {
        statusEl.textContent = 'ERROR: vis-network failed to load from CDN';
        statusEl.style.color = '${THEME.status.error}';
        return;
      }

      statusEl.textContent = 'Creating graph (${nodeCount} nodes)...';

      // --- Data Setup ---
      var allNodesData = ${nodesJson};
      var allEdgesData = ${edgesJson};
      var nodesDataset = new vis.DataSet(allNodesData);
      var edgesDataset = new vis.DataSet(allEdgesData);
      var totalEntities = allNodesData.length;

      // --- Filter State ---
      var activeCategories = new Set(${JSON.stringify(Object.keys(CATEGORY_COLORS))});
      var activeLifecycles = new Set(['production', 'experimental', 'deprecated', 'orphan']);
      var hideOrphans = false;
      var searchTerm = '';
      var focusNodeId = null;
      var focusNeighbors = null;

      // --- DataView Filtering ---
      var nodesView = new vis.DataView(nodesDataset, {
        filter: function(node) {
          if (focusNodeId) {
            return focusNeighbors && focusNeighbors.has(node.id);
          }
          if (!activeCategories.has(node.group)) return false;
          if (!activeLifecycles.has(node.lifecycle)) return false;
          if (hideOrphans && node.lifecycle === 'orphan') return false;
          if (searchTerm) {
            var term = searchTerm.toLowerCase();
            return node.label.toLowerCase().indexOf(term) !== -1 || node.id.toLowerCase().indexOf(term) !== -1;
          }
          return true;
        }
      });

      var visibleNodeIds = new Set(nodesView.getIds());
      var edgesView = new vis.DataView(edgesDataset, {
        filter: function(edge) {
          return visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
        }
      });

      function refreshFilters() {
        nodesView.refresh();
        visibleNodeIds = new Set(nodesView.getIds());
        edgesView.refresh();
        updateMetrics();
        if (typeof updateStatistics === 'function') updateStatistics();
        if (typeof scheduleMinimapUpdate === 'function') scheduleMinimapUpdate();
      }

      // --- Network ---
      var container = document.getElementById('graph');
      var network = new vis.Network(container, { nodes: nodesView, edges: edgesView }, {
        physics: {
          stabilization: { iterations: ${isLargeGraph ? 200 : 100}, updateInterval: 25 },
          barnesHut: {
            gravitationalConstant: ${isLargeGraph ? -2000 : -3000},
            springLength: ${isLargeGraph ? 200 : 150},
            springConstant: 0.01,
            damping: 0.3
          }
        },
        nodes: {
          font: { color: '${THEME.text.secondary}', size: ${isLargeGraph ? 10 : 12} },
          borderWidth: 2,
          scaling: { min: 5, max: 20 }
        },
        edges: {
          color: { color: '${THEME.border.default}', highlight: '${THEME.border.highlight}' },
          smooth: ${isLargeGraph ? 'false' : '{ type: "cubicBezier" }'}
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          hideEdgesOnDrag: true,
          hideEdgesOnZoom: ${isLargeGraph ? 'true' : 'false'}
        }
      });

      // --- Tooltip ---
      var tooltipEl = document.getElementById('node-tooltip');

      function showTooltip(nodeId, domPos) {
        var nodeData = nodesDataset.get(nodeId);
        if (!nodeData) return;

        // Compute dependency count from edges
        var depCount = 0;
        allEdgesData.forEach(function(e) {
          if (e.from === nodeId || e.to === nodeId) depCount++;
        });

        var catColor = nodeData.color && nodeData.color.background ? nodeData.color.background : '${THEME.text.tertiary}';

        tooltipEl.innerHTML =
          '<div class="tt-name">' + nodeData.label + '</div>' +
          '<div class="tt-type"><span class="status-dot" style="color:' + catColor + '"></span> ' + (nodeData.group || 'unknown') + '</div>' +
          (nodeData.path ? '<div class="tt-path">' + nodeData.path + '</div>' : '') +
          '<div class="tt-deps">' + depCount + ' dependenc' + (depCount === 1 ? 'y' : 'ies') + '</div>';

        // Position tooltip clamped to viewport
        var x = domPos.x + 15;
        var y = domPos.y + 15;
        tooltipEl.style.display = 'block';
        var rect = tooltipEl.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) x = domPos.x - rect.width - 15;
        if (y + rect.height > window.innerHeight) y = domPos.y - rect.height - 15;
        if (x < 0) x = 10;
        if (y < 0) y = 10;
        tooltipEl.style.left = x + 'px';
        tooltipEl.style.top = y + 'px';

        // Accessibility: link node to tooltip
        container.setAttribute('aria-describedby', 'node-tooltip');
      }

      function hideTooltip() {
        tooltipEl.style.display = 'none';
        container.removeAttribute('aria-describedby');
      }

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideTooltip();
      });

      function bindNetworkEvents() {
        network.on('stabilizationProgress', function(params) {
          var pct = Math.round(params.iterations / params.total * 100);
          statusEl.textContent = 'Stabilizing... ' + pct + '%';
        });

        network.on('stabilizationIterationsDone', function() {
          statusEl.textContent = 'Graph ready — ${nodeCount} nodes';
          statusEl.style.color = '${THEME.status.success}';
          network.fit({ animation: { duration: 500 } });
          setTimeout(function() { statusEl.style.display = 'none'; }, 4000);
        });

        network.on('click', function(params) {
          if (params.nodes.length === 1) {
            var nodeId = params.nodes[0];
            var canvasPos = network.getPosition(nodeId);
            var domPos = network.canvasToDOM(canvasPos);
            showTooltip(nodeId, domPos);
          } else {
            hideTooltip();
          }
        });

        // --- Focus Mode ---
        network.on('doubleClick', function(params) {
          if (params.nodes.length === 1) {
            enterFocusMode(params.nodes[0]);
          }
        });

        // --- Minimap sync on network events ---
        network.on('zoom', function() { if (typeof scheduleMinimapUpdate === 'function') scheduleMinimapUpdate(); });
        network.on('dragEnd', function() { if (typeof scheduleMinimapUpdate === 'function') scheduleMinimapUpdate(); });
      }
      bindNetworkEvents();

      // --- BFS Algorithm (GD-12) ---
      function getNeighborsAtDepth(net, nodeId, maxDepth) {
        var visited = new Set([nodeId]);
        var levels = new Map();
        levels.set(nodeId, 0);
        var currentLevel = [nodeId];
        for (var depth = 1; depth <= maxDepth; depth++) {
          var nextLevel = [];
          for (var i = 0; i < currentLevel.length; i++) {
            var neighbors = net.getConnectedNodes(currentLevel[i]);
            for (var j = 0; j < neighbors.length; j++) {
              if (!visited.has(neighbors[j])) {
                visited.add(neighbors[j]);
                levels.set(neighbors[j], depth);
                nextLevel.push(neighbors[j]);
              }
            }
          }
          currentLevel = nextLevel;
        }
        return { visited: visited, levels: levels };
      }

      var currentDepth = 1;
      var depthLevels = null;

      function applyDepthVisuals(levels) {
        var updates = [];
        var baseSizes = {};
        allNodesData.forEach(function(n) {
          baseSizes[n.id] = 25; // vis-network default node size
        });

        nodesDataset.forEach(function(node) {
          var depth = levels ? levels.get(node.id) : undefined;
          var update = { id: node.id };
          if (depth === undefined) {
            update.hidden = true;
          } else if (depth === 0) {
            update.hidden = false;
            update.opacity = 1.0;
            update.size = baseSizes[node.id] * 1.2;
            update.color = {
              background: node.color.background,
              border: '${THEME.border.goldStrong}',
              highlight: { background: node.color.background, border: '${THEME.border.goldStrong}' },
              hover: { background: node.color.background, border: '${THEME.border.goldStrong}' }
            };
          } else if (depth === 1) {
            update.hidden = false;
            update.opacity = 1.0;
            update.size = baseSizes[node.id];
            update.color = {
              background: node.color.background,
              border: '${THEME.border.gold}',
              highlight: { background: node.color.background, border: '${THEME.border.goldStrong}' },
              hover: { background: node.color.background, border: '${THEME.border.gold}' }
            };
          } else if (depth === 2) {
            update.hidden = false;
            update.opacity = 0.7;
            update.size = baseSizes[node.id] * 0.9;
            update.color = {
              background: node.color.background,
              border: '${THEME.border.subtle}',
              highlight: { background: node.color.background, border: '${THEME.border.goldStrong}' },
              hover: { background: node.color.background, border: '${THEME.border.gold}' }
            };
          } else {
            update.hidden = false;
            update.opacity = 0.4;
            update.size = baseSizes[node.id] * 0.8;
            update.color = {
              background: node.color.background,
              border: '${THEME.border.subtle}',
              highlight: { background: node.color.background, border: '${THEME.border.goldStrong}' },
              hover: { background: node.color.background, border: '${THEME.border.gold}' }
            };
          }
          updates.push(update);
        });
        nodesDataset.update(updates);
      }

      function updateDepthCount() {
        var countEl = document.getElementById('depth-node-count');
        if (!countEl) return;
        var visible = 0;
        nodesDataset.forEach(function(n) { if (!n.hidden) visible++; });
        countEl.textContent = 'Nodes: ' + visible + ' / ' + totalEntities;
      }

      function setDepth(depth) {
        currentDepth = depth;
        var depthSelector = document.getElementById('depth-selector');
        if (!depthSelector) return;
        var btns = depthSelector.querySelectorAll('.depth-btn');
        for (var i = 0; i < btns.length; i++) {
          btns[i].classList.toggle('active', btns[i].getAttribute('data-depth') === String(depth));
        }

        if (depth === 'all') {
          // Reset all nodes to visible, remove depth styling
          var resetUpdates = [];
          allNodesData.forEach(function(n) {
            resetUpdates.push({ id: n.id, hidden: false, opacity: n.opacity || 1.0, size: undefined });
          });
          nodesDataset.update(resetUpdates);
          focusNeighbors = null;
          depthLevels = null;
        } else {
          var result = getNeighborsAtDepth(network, focusNodeId, depth);
          depthLevels = result.levels;
          focusNeighbors = result.visited;
          applyDepthVisuals(result.levels);
        }
        refreshFilters();
        updateDepthCount();
        network.fit({ animation: { duration: 300 } });
      }

      function enterFocusMode(nodeId) {
        focusNodeId = nodeId;
        currentDepth = 1;
        var result = getNeighborsAtDepth(network, nodeId, 1);
        depthLevels = result.levels;
        focusNeighbors = result.visited;
        applyDepthVisuals(result.levels);
        refreshFilters();
        document.getElementById('btn-exit-focus').style.display = 'block';
        // Show depth selector
        var depthSelector = document.getElementById('depth-selector');
        if (depthSelector) {
          depthSelector.style.display = 'block';
          var btns = depthSelector.querySelectorAll('.depth-btn');
          for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].getAttribute('data-depth') === '1');
          }
        }
        updateDepthCount();
        network.fit({ animation: { duration: 300 } });
      }

      function exitFocusMode() {
        focusNodeId = null;
        focusNeighbors = null;
        depthLevels = null;
        // Restore original node properties
        var resetUpdates = [];
        allNodesData.forEach(function(n) {
          resetUpdates.push({ id: n.id, hidden: false, opacity: n.opacity || 1.0, size: undefined });
        });
        nodesDataset.update(resetUpdates);
        refreshFilters();
        document.getElementById('btn-exit-focus').style.display = 'none';
        // Hide depth selector
        var depthSelector = document.getElementById('depth-selector');
        if (depthSelector) depthSelector.style.display = 'none';
      }

      // Depth button click handlers
      var depthBtns = document.querySelectorAll('.depth-btn');
      for (var di = 0; di < depthBtns.length; di++) {
        depthBtns[di].addEventListener('click', function() {
          if (!focusNodeId) return;
          var d = this.getAttribute('data-depth');
          setDepth(d === 'all' ? 'all' : parseInt(d, 10));
        });
      }

      // Keyboard shortcuts for depth (GD-12 AC 19)
      document.addEventListener('keydown', function(e) {
        if (!focusNodeId) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === '1') setDepth(1);
        else if (e.key === '2') setDepth(2);
        else if (e.key === '3') setDepth(3);
        else if (e.key === 'a' || e.key === 'A') setDepth('all');
      });

      // --- Sidebar Events ---
      document.getElementById('btn-toggle-sidebar').addEventListener('click', function() {
        var sb = document.getElementById('sidebar');
        sb.classList.toggle('collapsed');
        var graphEl = document.getElementById('graph');
        graphEl.style.left = sb.classList.contains('collapsed') ? '40px' : '260px';
        statusEl.style.left = sb.classList.contains('collapsed') ? '50px' : '270px';
      });

      // Category checkboxes
      var catBoxes = document.querySelectorAll('input[data-filter="category"]');
      for (var i = 0; i < catBoxes.length; i++) {
        catBoxes[i].addEventListener('change', function() {
          if (this.checked) {
            activeCategories.add(this.value);
          } else {
            activeCategories.delete(this.value);
          }
          refreshFilters();
        });
      }

      // Lifecycle checkboxes
      var lcBoxes = document.querySelectorAll('input[data-filter="lifecycle"]');
      for (var i = 0; i < lcBoxes.length; i++) {
        lcBoxes[i].addEventListener('change', function() {
          if (this.checked) {
            activeLifecycles.add(this.value);
          } else {
            activeLifecycles.delete(this.value);
          }
          refreshFilters();
        });
      }

      // Hide orphans toggle
      document.getElementById('hide-orphans').addEventListener('change', function() {
        hideOrphans = this.checked;
        refreshFilters();
      });

      // Search input
      var searchTimer = null;
      document.getElementById('search-input').addEventListener('input', function() {
        var val = this.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function() {
          searchTerm = val;
          refreshFilters();
        }, 200);
      });

      // Reset button
      document.getElementById('btn-reset').addEventListener('click', function() {
        searchTerm = '';
        focusNodeId = null;
        focusNeighbors = null;
        hideOrphans = false;
        activeCategories = new Set(${JSON.stringify(Object.keys(CATEGORY_COLORS))});
        activeLifecycles = new Set(['production', 'experimental', 'deprecated', 'orphan']);

        document.getElementById('search-input').value = '';
        document.getElementById('hide-orphans').checked = false;
        document.getElementById('btn-exit-focus').style.display = 'none';

        // Reset depth state (GD-12 O-3 fix)
        depthLevels = null;
        currentDepth = 1;
        var depthSel = document.getElementById('depth-selector');
        if (depthSel) depthSel.style.display = 'none';

        // Restore original node properties (clear depth visuals)
        var resetNodeUpdates = [];
        allNodesData.forEach(function(n) {
          resetNodeUpdates.push({ id: n.id, hidden: false, opacity: n.opacity || 1.0, size: undefined });
        });
        nodesDataset.update(resetNodeUpdates);

        var allBoxes = document.querySelectorAll('#sidebar input[type="checkbox"][data-filter]');
        for (var i = 0; i < allBoxes.length; i++) { allBoxes[i].checked = true; }

        refreshFilters();
        network.fit({ animation: { duration: 300 } });
      });

      // Exit focus button
      document.getElementById('btn-exit-focus').addEventListener('click', exitFocusMode);

      // --- Physics Controls ---
      function _debounce(fn, ms) {
        var timer;
        return function() {
          var args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function() { fn.apply(null, args); }, ms);
        };
      }

      var physicsDefaults = { center: 0.3, repel: -2000, link: 0.04, distance: 95 };
      var physicsPaused = false;

      var sliderCenter = document.getElementById('slider-center');
      var sliderRepel = document.getElementById('slider-repel');
      var sliderLink = document.getElementById('slider-link');
      var sliderDistance = document.getElementById('slider-distance');
      var valCenter = document.getElementById('val-center');
      var valRepel = document.getElementById('val-repel');
      var valLink = document.getElementById('val-link');
      var valDistance = document.getElementById('val-distance');

      function applyPhysics() {
        network.setOptions({
          physics: {
            barnesHut: {
              centralGravity: parseFloat(sliderCenter.value),
              gravitationalConstant: parseFloat(sliderRepel.value),
              springConstant: parseFloat(sliderLink.value),
              springLength: parseFloat(sliderDistance.value)
            }
          }
        });
      }

      var debouncedApply = _debounce(applyPhysics, 50);

      function setupSlider(slider, valEl) {
        slider.addEventListener('input', function() {
          valEl.textContent = this.value;
          debouncedApply();
        });
      }

      setupSlider(sliderCenter, valCenter);
      setupSlider(sliderRepel, valRepel);
      setupSlider(sliderLink, valLink);
      setupSlider(sliderDistance, valDistance);

      // Physics toggle (collapse/expand)
      var physicsToggle = document.querySelector('.physics-toggle');
      var physicsContent = document.querySelector('.physics-content');
      if (physicsToggle) {
        physicsToggle.addEventListener('click', function() {
          physicsContent.style.display = physicsContent.style.display === 'none' ? 'block' : 'none';
        });
      }

      // Reset physics
      document.getElementById('btn-physics-reset').addEventListener('click', function() {
        sliderCenter.value = physicsDefaults.center;
        sliderRepel.value = physicsDefaults.repel;
        sliderLink.value = physicsDefaults.link;
        sliderDistance.value = physicsDefaults.distance;
        valCenter.textContent = physicsDefaults.center;
        valRepel.textContent = physicsDefaults.repel;
        valLink.textContent = physicsDefaults.link;
        valDistance.textContent = physicsDefaults.distance;
        applyPhysics();
      });

      // Pause/Resume physics
      document.getElementById('btn-physics-pause').addEventListener('click', function() {
        physicsPaused = !physicsPaused;
        network.setOptions({ physics: { enabled: !physicsPaused } });
        this.textContent = physicsPaused ? 'Resume' : 'Pause';
        this.style.color = physicsPaused ? '${THEME.text.secondary}' : '';
      });

      // --- Degree Computation (GD-13) ---
      function computeDegrees(edgesArr) {
        var degrees = {};
        for (var i = 0; i < edgesArr.length; i++) {
          var e = edgesArr[i];
          if (!degrees[e.from]) degrees[e.from] = { total: 0, in: 0, out: 0 };
          if (!degrees[e.to]) degrees[e.to] = { total: 0, in: 0, out: 0 };
          degrees[e.from].out++;
          degrees[e.from].total++;
          degrees[e.to].in++;
          degrees[e.to].total++;
        }
        return degrees;
      }

      var nodeDegrees = computeDegrees(allEdgesData);
      var currentSizingMode = 'uniform';

      function applySizing(mode) {
        currentSizingMode = mode;
        var sizeBtns = document.querySelectorAll('.size-btn');
        for (var i = 0; i < sizeBtns.length; i++) {
          sizeBtns[i].classList.toggle('active', sizeBtns[i].getAttribute('data-sizing') === mode);
        }
        if (mode === 'uniform') {
          var resetUpdates = [];
          allNodesData.forEach(function(n) { resetUpdates.push({ id: n.id, size: undefined }); });
          nodesDataset.update(resetUpdates);
          return;
        }
        var field = mode === 'degree' ? 'total' : (mode === 'in-degree' ? 'in' : 'out');
        var maxDeg = 0;
        allNodesData.forEach(function(n) {
          var d = nodeDegrees[n.id] ? nodeDegrees[n.id][field] : 0;
          if (d > maxDeg) maxDeg = d;
        });
        var minSize = 10, maxSize = 40;
        var updates = [];
        allNodesData.forEach(function(n) {
          var d = nodeDegrees[n.id] ? nodeDegrees[n.id][field] : 0;
          var size = maxDeg > 0 ? minSize + (d / maxDeg) * (maxSize - minSize) : minSize;
          updates.push({ id: n.id, size: size });
        });
        nodesDataset.update(updates);
      }

      var sizeBtns = document.querySelectorAll('.size-btn');
      for (var si = 0; si < sizeBtns.length; si++) {
        sizeBtns[si].addEventListener('click', function() {
          applySizing(this.getAttribute('data-sizing'));
        });
      }

      // --- Layout Switching (GD-13) ---
      var currentLayout = 'force';

      var baseNetworkOptions = {
        physics: {
          stabilization: { iterations: ${isLargeGraph ? 200 : 100}, updateInterval: 25 },
          barnesHut: {
            gravitationalConstant: ${isLargeGraph ? -2000 : -3000},
            springLength: ${isLargeGraph ? 200 : 150},
            springConstant: 0.01,
            damping: 0.3
          }
        },
        nodes: {
          font: { color: '${THEME.text.secondary}', size: ${isLargeGraph ? 10 : 12} },
          borderWidth: 2,
          scaling: { min: 5, max: 20 }
        },
        edges: {
          color: { color: '${THEME.border.default}', highlight: '${THEME.border.highlight}' },
          smooth: ${isLargeGraph ? 'false' : '{ type: "cubicBezier" }'}
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          hideEdgesOnDrag: true,
          hideEdgesOnZoom: ${isLargeGraph ? 'true' : 'false'}
        }
      };

      function rebuildNetwork(opts) {
        network.destroy();
        network = new vis.Network(container, { nodes: nodesView, edges: edgesView }, opts);
        network.on('stabilizationIterationsDone', function() {
          network.fit({ animation: { duration: 500 } });
        });
        bindNetworkEvents();
      }

      function switchLayout(layout) {
        currentLayout = layout;
        var layoutBtns = document.querySelectorAll('.layout-btn');
        for (var i = 0; i < layoutBtns.length; i++) {
          layoutBtns[i].classList.toggle('active', layoutBtns[i].getAttribute('data-layout') === layout);
        }
        // Dim/enable physics controls based on layout
        var physicsSection = document.querySelector('.physics-section');
        if (physicsSection) {
          physicsSection.style.opacity = layout === 'force' ? '1' : '0.4';
          physicsSection.style.pointerEvents = layout === 'force' ? 'auto' : 'none';
        }
        if (layout === 'force') {
          var forceOpts = JSON.parse(JSON.stringify(baseNetworkOptions));
          forceOpts.layout = { hierarchical: { enabled: false } };
          rebuildNetwork(forceOpts);
        } else if (layout === 'hierarchical') {
          var hierOpts = JSON.parse(JSON.stringify(baseNetworkOptions));
          hierOpts.physics = { enabled: false };
          hierOpts.layout = { hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed', levelSeparation: 150, nodeSpacing: 100, treeSpacing: 200 } };
          rebuildNetwork(hierOpts);
        } else if (layout === 'circular') {
          network.setOptions({
            physics: { enabled: false },
            layout: { hierarchical: { enabled: false } }
          });
          var ids = nodesView.getIds();
          var count = ids.length;
          var radius = Math.max(200, count * 3);
          var posUpdates = [];
          for (var ci = 0; ci < count; ci++) {
            var angle = (2 * Math.PI * ci) / count;
            posUpdates.push({ id: ids[ci], x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
          }
          nodesDataset.update(posUpdates);
          network.fit({ animation: { duration: 500 } });
        }
      }

      var layoutBtns = document.querySelectorAll('.layout-btn');
      for (var li = 0; li < layoutBtns.length; li++) {
        layoutBtns[li].addEventListener('click', function() {
          switchLayout(this.getAttribute('data-layout'));
        });
      }

      // --- Metrics ---
      function updateMetrics() {
        var visible = nodesView.getIds().length;
        var visibleEdges = edgesView.getIds().length;
        var metricsEl = document.getElementById('metrics');
        metricsEl.innerHTML =
          '<b>Visible:</b> ' + visible + ' / ' + totalEntities + ' entities<br>' +
          '<b>Edges:</b> ' + visibleEdges + '<br>' +
          (focusNodeId ? '<b>Focus:</b> ' + focusNodeId + '<br>' : '');
      }

      // --- Export (GD-14) ---
      function getTimestampFilename(ext) {
        var d = new Date();
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        return 'aios-graph-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.' + ext;
      }

      document.getElementById('btn-export-png').addEventListener('click', function() {
        try {
          var dataURL = network.canvas.canvas.toDataURL('image/png');
          var a = document.createElement('a');
          a.href = dataURL;
          a.download = getTimestampFilename('png');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {
          alert('PNG export failed: ' + e.message);
        }
      });

      document.getElementById('btn-export-json').addEventListener('click', function() {
        var exportNodes = [];
        nodesDataset.forEach(function(n) {
          exportNodes.push({ id: n.id, label: n.label, category: n.group, lifecycle: n.lifecycle, path: n.path });
        });
        var exportEdges = [];
        edgesDataset.forEach(function(e) {
          exportEdges.push({ from: e.from, to: e.to });
        });
        var exportData = {
          nodes: exportNodes,
          edges: exportEdges,
          metadata: { total: exportNodes.length, timestamp: new Date().toISOString() }
        };
        var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = getTimestampFilename('json');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });

      // --- Minimap (GD-14) ---
      var minimapCanvas = document.getElementById('minimap-canvas');
      var minimapCtx = minimapCanvas.getContext('2d');
      var minimapContainer = document.getElementById('minimap-container');
      var minimapVisible = true;

      document.getElementById('minimap-toggle').addEventListener('click', function() {
        minimapVisible = !minimapVisible;
        minimapContainer.classList.toggle('collapsed', !minimapVisible);
        this.innerHTML = minimapVisible ? '&#x2715;' : '&#x25A1;';
        if (minimapVisible) drawMinimap();
      });

      function drawMinimap() {
        if (!minimapVisible) return;
        var cw = minimapCanvas.width;
        var ch = minimapCanvas.height;
        minimapCtx.clearRect(0, 0, cw, ch);
        minimapCtx.fillStyle = '${THEME.bg.surface}';
        minimapCtx.fillRect(0, 0, cw, ch);

        var positions = network.getPositions();
        var ids = Object.keys(positions);
        if (ids.length === 0) return;

        // Compute bounding box
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (var i = 0; i < ids.length; i++) {
          var p = positions[ids[i]];
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        var pad = 50;
        minX -= pad; maxX += pad; minY -= pad; maxY += pad;
        var rangeX = maxX - minX || 1;
        var rangeY = maxY - minY || 1;
        var scaleX = cw / rangeX;
        var scaleY = ch / rangeY;

        // Draw edges
        minimapCtx.strokeStyle = '${THEME.border.subtle}';
        minimapCtx.lineWidth = 0.5;
        var visibleIds = new Set(nodesView.getIds());
        allEdgesData.forEach(function(e) {
          if (!visibleIds.has(e.from) || !visibleIds.has(e.to)) return;
          var pf = positions[e.from];
          var pt = positions[e.to];
          if (!pf || !pt) return;
          minimapCtx.beginPath();
          minimapCtx.moveTo((pf.x - minX) * scaleX, (pf.y - minY) * scaleY);
          minimapCtx.lineTo((pt.x - minX) * scaleX, (pt.y - minY) * scaleY);
          minimapCtx.stroke();
        });

        // Draw nodes as 2px dots
        minimapCtx.fillStyle = '${THEME.text.secondary}';
        for (var ni = 0; ni < ids.length; ni++) {
          if (!visibleIds.has(ids[ni])) continue;
          var np = positions[ids[ni]];
          minimapCtx.beginPath();
          minimapCtx.arc((np.x - minX) * scaleX, (np.y - minY) * scaleY, 2, 0, 2 * Math.PI);
          minimapCtx.fill();
        }

        // Draw viewport rectangle
        var viewPos = network.getViewPosition();
        var scale = network.getScale();
        var graphEl = document.getElementById('graph');
        var vw = graphEl.clientWidth / scale;
        var vh = graphEl.clientHeight / scale;
        var vx = (viewPos.x - vw / 2 - minX) * scaleX;
        var vy = (viewPos.y - vh / 2 - minY) * scaleY;
        var vrw = vw * scaleX;
        var vrh = vh * scaleY;
        minimapCtx.strokeStyle = '${THEME.accent.gold}';
        minimapCtx.lineWidth = 1.5;
        minimapCtx.globalAlpha = 0.6;
        minimapCtx.strokeRect(vx, vy, vrw, vrh);
        minimapCtx.fillStyle = '${THEME.accent.gold}';
        minimapCtx.globalAlpha = 0.08;
        minimapCtx.fillRect(vx, vy, vrw, vrh);
        minimapCtx.globalAlpha = 1.0;

        // Store transform for click handler
        minimapCanvas._transform = { minX: minX, minY: minY, scaleX: scaleX, scaleY: scaleY };
      }

      minimapCanvas.addEventListener('click', function(evt) {
        var rect = minimapCanvas.getBoundingClientRect();
        var cx = evt.clientX - rect.left;
        var cy = evt.clientY - rect.top;
        var t = minimapCanvas._transform;
        if (!t) return;
        var gx = cx / t.scaleX + t.minX;
        var gy = cy / t.scaleY + t.minY;
        network.moveTo({ position: { x: gx, y: gy }, animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
      });

      var minimapUpdatePending = false;
      function scheduleMinimapUpdate() {
        if (minimapUpdatePending) return;
        minimapUpdatePending = true;
        requestAnimationFrame(function() {
          minimapUpdatePending = false;
          drawMinimap();
        });
      }

      network.on('zoom', scheduleMinimapUpdate);
      network.on('dragEnd', scheduleMinimapUpdate);
      network.on('stabilizationIterationsDone', function() { setTimeout(drawMinimap, 200); });

      // --- Clustering (GD-15) ---
      var isClustered = false;
      var categoryColors = ${JSON.stringify(Object.fromEntries(Object.entries(CATEGORY_COLORS).map(([k, v]) => [k, v.color])))};

      function clusterByCategory() {
        var categories = new Set();
        nodesView.forEach(function(node) { categories.add(node.group); });
        categories.forEach(function(cat) {
          var catNodes = [];
          nodesView.forEach(function(node) {
            if (node.group === cat) catNodes.push(node.id);
          });
          if (catNodes.length === 0) return;
          var clusterSize = Math.max(20, Math.min(50, 20 + (catNodes.length / allNodesData.length) * 30));
          network.cluster({
            joinCondition: function(nodeOptions) {
              return nodeOptions.group === cat && visibleNodeIds.has(nodeOptions.id);
            },
            clusterNodeProperties: {
              label: cat + ' (' + catNodes.length + ')',
              shape: 'dot',
              size: clusterSize,
              color: { background: categoryColors[cat] || '${THEME.text.tertiary}', border: '${THEME.border.gold}' },
              font: { color: '${THEME.text.primary}', size: 12 }
            }
          });
        });
        isClustered = true;
        network.setOptions({ physics: { stabilization: { iterations: 50 } } });
      }

      function unclusterAll() {
        var clusterIds = [];
        nodesDataset.forEach(function(node) {
          if (network.isCluster(node.id)) clusterIds.push(node.id);
        });
        // Also check generated cluster node IDs
        network.body.data.nodes.forEach(function(node) {
          if (network.isCluster(node.id) && clusterIds.indexOf(node.id) === -1) clusterIds.push(node.id);
        });
        for (var i = 0; i < clusterIds.length; i++) {
          try { network.openCluster(clusterIds[i]); } catch(e) { /* already opened */ }
        }
        isClustered = false;
      }

      document.getElementById('btn-cluster-category').addEventListener('click', function() {
        if (isClustered) {
          unclusterAll();
          this.textContent = 'Cluster by Category';
        } else {
          clusterByCategory();
          this.textContent = 'Uncluster All';
        }
        updateStatistics();
      });

      // Double-click: cluster check before focus mode (Risk #3 mitigation)
      // Override the doubleClick handler from bindNetworkEvents
      network.off('doubleClick');
      network.on('doubleClick', function(params) {
        if (params.nodes.length === 1) {
          var nodeId = params.nodes[0];
          if (network.isCluster(nodeId)) {
            network.openCluster(nodeId);
            updateStatistics();
          } else {
            enterFocusMode(nodeId);
          }
        }
      });

      // --- Statistics (GD-15) ---
      function computeGraphStats(nodeIds, edgesArr) {
        var V = nodeIds.length;
        var visibleSet = new Set(nodeIds);
        var visibleEdges = [];
        for (var i = 0; i < edgesArr.length; i++) {
          if (visibleSet.has(edgesArr[i].from) && visibleSet.has(edgesArr[i].to)) {
            visibleEdges.push(edgesArr[i]);
          }
        }
        var E = visibleEdges.length;
        var density = V > 1 ? (2 * E / (V * (V - 1))) : 0;
        var avgDegree = V > 0 ? (2 * E / V) : 0;

        // Top 5 by degree
        var degMap = {};
        for (var j = 0; j < visibleEdges.length; j++) {
          degMap[visibleEdges[j].from] = (degMap[visibleEdges[j].from] || 0) + 1;
          degMap[visibleEdges[j].to] = (degMap[visibleEdges[j].to] || 0) + 1;
        }
        var sorted = Object.keys(degMap).map(function(id) { return { id: id, degree: degMap[id] }; });
        sorted.sort(function(a, b) { return b.degree - a.degree; });
        var top5 = sorted.slice(0, 5);
        // Resolve labels
        for (var k = 0; k < top5.length; k++) {
          var nd = nodesDataset.get(top5[k].id);
          top5[k].label = nd ? nd.label : top5[k].id;
        }

        return { nodeCount: V, edgeCount: E, density: density, avgDegree: avgDegree, top5: top5 };
      }

      function updateStatistics() {
        var visIds = nodesView.getIds();
        var stats = computeGraphStats(visIds, allEdgesData);
        var elNodes = document.getElementById('stat-nodes');
        var elEdges = document.getElementById('stat-edges');
        var elDensity = document.getElementById('stat-density');
        var elAvgDeg = document.getElementById('stat-avg-degree');
        var elTop5 = document.getElementById('stat-top5');
        if (elNodes) elNodes.textContent = stats.nodeCount;
        if (elEdges) elEdges.textContent = stats.edgeCount;
        if (elDensity) elDensity.textContent = stats.density.toFixed(2);
        if (elAvgDeg) elAvgDeg.textContent = stats.avgDegree.toFixed(1);
        if (elTop5) {
          var html = '';
          for (var i = 0; i < stats.top5.length; i++) {
            html += '<div class="top5-item"><span class="top5-name">' + stats.top5[i].label + '</span><span class="top5-degree">' + stats.top5[i].degree + '</span></div>';
          }
          elTop5.innerHTML = html;
        }
      }

      updateMetrics();
      updateStatistics();
      setTimeout(drawMinimap, 1000);
    })();
  </script>
</body>
</html>`;
}

module.exports = {
  formatAsHtml,
  _sanitize,
  _buildVisNodes,
  _buildVisEdges,
  _buildLegend,
  _buildSidebar,
  THEME,
  CATEGORY_COLORS,
  DEFAULT_COLOR,
  LIFECYCLE_STYLES,
};
