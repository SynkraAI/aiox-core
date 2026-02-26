'use strict';

const {
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
} = require('../../.aios-core/core/graph-dashboard/formatters/html-formatter');

const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'dev', label: 'dev', group: 'agents', path: '.aios-core/agents/dev.md', lifecycle: 'production' },
    { id: 'task-a', label: 'task-a', group: 'tasks', path: '.aios-core/tasks/task-a.md', lifecycle: 'production' },
    { id: 'tmpl-story', label: 'story-tmpl', group: 'templates', path: '.aios-core/templates/story-tmpl.yaml', lifecycle: 'experimental' },
    { id: 'script-1', label: 'build.js', group: 'scripts', path: '.aios-core/scripts/build.js', lifecycle: 'orphan' },
  ],
  edges: [
    { from: 'dev', to: 'task-a' },
    { from: 'dev', to: 'tmpl-story' },
  ],
  source: 'code-intel',
  isFallback: false,
};

describe('html-formatter', () => {
  describe('formatAsHtml', () => {
    it('should return a complete HTML string with vis-network CDN', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('https://unpkg.com/vis-network/standalone/umd/vis-network.min.js');
      expect(html).toContain('</html>');
    });

    it('should embed JSON data for DataView filtering', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('vis.DataSet');
      expect(html).toContain('vis.DataView');
    });

    it('should include meta charset utf-8', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('<meta charset="utf-8">');
    });

    it('should use dashboard token background', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain(THEME.bg.base);
    });

    it('should include physics stabilization config', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('stabilization');
      expect(html).toContain('iterations: 100');
    });

    it('should include sidebar with all 11 categories', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="sidebar"');
      const allCategories = [
        'agents', 'tasks', 'templates', 'checklists', 'workflows',
        'scripts/task', 'scripts/engine', 'scripts/infra',
        'utils', 'data', 'tools',
      ];
      for (const cat of allCategories) {
        expect(html).toContain(cat);
      }
    });

    it('should generate valid HTML for empty graph', () => {
      const html = formatAsHtml({ nodes: [], edges: [] });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('vis.DataSet');
      expect(html).toContain('</html>');
    });

    it('should add meta-refresh when autoRefresh option is set', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA, { autoRefresh: true, refreshInterval: 5 });
      expect(html).toContain('<meta http-equiv="refresh" content="5">');
    });

    it('should NOT add meta-refresh by default', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).not.toContain('http-equiv="refresh"');
    });

    it('should default refreshInterval to 5 when autoRefresh is true', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA, { autoRefresh: true });
      expect(html).toContain('content="5"');
    });

    it('should include search input', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="search-input"');
    });

    it('should include reset button', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="btn-reset"');
      expect(html).toContain('Reset / Show All');
    });

    it('should include focus mode exit button', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="btn-exit-focus"');
    });

    it('should include metrics display', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="metrics"');
    });

    it('should include hideEdgesOnDrag for performance', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('hideEdgesOnDrag: true');
    });

    it('should include lifecycle filter checkboxes', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('data-filter="lifecycle"');
      expect(html).toContain('value="production"');
      expect(html).toContain('value="experimental"');
      expect(html).toContain('value="deprecated"');
      expect(html).toContain('value="orphan"');
    });

    it('should include hide orphans toggle', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="hide-orphans"');
      expect(html).toContain('Hide Orphans');
    });
  });

  describe('_sanitize', () => {
    it('should escape HTML special characters', () => {
      expect(_sanitize('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(_sanitize('a & b')).toBe('a &amp; b');
    });

    it('should escape single quotes', () => {
      expect(_sanitize("it's")).toBe('it&#x27;s');
    });

    it('should handle non-string input', () => {
      expect(_sanitize(123)).toBe('123');
      expect(_sanitize(null)).toBe('null');
    });
  });

  describe('_buildVisNodes', () => {
    it('should apply correct colors per category', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);

      const agentNode = nodes.find((n) => n.id === 'dev');
      expect(agentNode.color.background).toBe(CATEGORY_COLORS.agents.color);
      expect(agentNode.shape).toBe(CATEGORY_COLORS.agents.shape);

      const taskNode = nodes.find((n) => n.id === 'task-a');
      expect(taskNode.color.background).toBe(CATEGORY_COLORS.tasks.color);

      const tmplNode = nodes.find((n) => n.id === 'tmpl-story');
      expect(tmplNode.color.background).toBe(CATEGORY_COLORS.templates.color);
      expect(tmplNode.shape).toBe(CATEGORY_COLORS.templates.shape);

      const scriptNode = nodes.find((n) => n.id === 'script-1');
      expect(scriptNode.color.background).toBe(LIFECYCLE_STYLES.orphan.colorOverride);
    });

    it('should NOT include title property (native tooltip disabled)', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);
      const devNode = nodes.find((n) => n.id === 'dev');
      expect(devNode.title).toBeUndefined();
    });

    it('should include path property on nodes', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);
      const devNode = nodes.find((n) => n.id === 'dev');
      expect(devNode.path).toBe('.aios-core/agents/dev.md');
    });

    it('should use default color for unknown category', () => {
      const nodes = _buildVisNodes([{ id: 'x', label: 'x', group: 'unknown' }]);
      expect(nodes[0].color.background).toBe(THEME.text.tertiary);
    });

    it('should handle null/undefined nodes', () => {
      expect(_buildVisNodes(null)).toEqual([]);
      expect(_buildVisNodes(undefined)).toEqual([]);
    });

    it('should include group and lifecycle properties on nodes', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);
      const devNode = nodes.find((n) => n.id === 'dev');
      expect(devNode.group).toBe('agents');
      expect(devNode.lifecycle).toBe('production');
    });

    it('should default lifecycle to production when missing', () => {
      const nodes = _buildVisNodes([{ id: 'x', label: 'x', group: 'tasks' }]);
      expect(nodes[0].lifecycle).toBe('production');
    });

    it('should apply lifecycle visual styles', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);

      const productionNode = nodes.find((n) => n.id === 'dev');
      expect(productionNode.opacity).toBe(1.0);

      const experimentalNode = nodes.find((n) => n.id === 'tmpl-story');
      expect(experimentalNode.opacity).toBe(0.8);

      const orphanNode = nodes.find((n) => n.id === 'script-1');
      expect(orphanNode.opacity).toBe(0.3);
      expect(orphanNode.color.background).toBe(THEME.text.muted);
    });

    it('should apply deprecated lifecycle styling', () => {
      const nodes = _buildVisNodes([{
        id: 'old', label: 'old', group: 'tasks', lifecycle: 'deprecated',
      }]);
      expect(nodes[0].opacity).toBe(0.5);
      expect(nodes[0].color.background).toBe(THEME.text.tertiary);
    });

    it('should set borderDashes for experimental lifecycle', () => {
      const nodes = _buildVisNodes([{
        id: 'exp', label: 'exp', group: 'tasks', lifecycle: 'experimental',
      }]);
      expect(nodes[0].shapeProperties.borderDashes).toEqual([5, 5]);
    });

    it('should set borderDashes for orphan lifecycle', () => {
      const nodes = _buildVisNodes([{
        id: 'orph', label: 'orph', group: 'tasks', lifecycle: 'orphan',
      }]);
      expect(nodes[0].shapeProperties.borderDashes).toEqual([2, 4]);
    });

    it('should deduplicate nodes by id', () => {
      const nodes = _buildVisNodes([
        { id: 'dup', label: 'dup', group: 'tasks' },
        { id: 'dup', label: 'dup-2', group: 'agents' },
      ]);
      expect(nodes).toHaveLength(1);
    });
  });

  describe('_buildVisNodes - all 11 categories', () => {
    it('should apply correct styles for all 11 categories', () => {
      const allCatNodes = [
        { id: 'a1', label: 'a1', group: 'agents' },
        { id: 't1', label: 't1', group: 'tasks' },
        { id: 'tp1', label: 'tp1', group: 'templates' },
        { id: 'cl1', label: 'cl1', group: 'checklists' },
        { id: 'wf1', label: 'wf1', group: 'workflows' },
        { id: 'st1', label: 'st1', group: 'scripts/task' },
        { id: 'se1', label: 'se1', group: 'scripts/engine' },
        { id: 'si1', label: 'si1', group: 'scripts/infra' },
        { id: 'u1', label: 'u1', group: 'utils' },
        { id: 'd1', label: 'd1', group: 'data' },
        { id: 'to1', label: 'to1', group: 'tools' },
      ];
      const nodes = _buildVisNodes(allCatNodes);
      expect(nodes).toHaveLength(11);

      for (const node of nodes) {
        const cat = allCatNodes.find((n) => n.id === node.id).group;
        const expected = CATEGORY_COLORS[cat];
        expect(node.color.background).toBe(expected.color);
        expect(node.shape).toBe(expected.shape);
      }
    });

    it('should map legacy "scripts" group to scripts/task fallback', () => {
      const nodes = _buildVisNodes([{ id: 's', label: 's', group: 'scripts' }]);
      expect(nodes[0].color.background).toBe(CATEGORY_COLORS['scripts/task'].color);
      expect(nodes[0].shape).toBe(CATEGORY_COLORS['scripts/task'].shape);
    });
  });

  describe('_buildVisEdges', () => {
    it('should map edges with arrows', () => {
      const edges = _buildVisEdges(MOCK_GRAPH_DATA.edges);
      expect(edges).toHaveLength(2);
      expect(edges[0]).toEqual({ from: 'dev', to: 'task-a', arrows: 'to' });
    });

    it('should handle null/undefined edges', () => {
      expect(_buildVisEdges(null)).toEqual([]);
      expect(_buildVisEdges(undefined)).toEqual([]);
    });
  });

  describe('_buildLegend (backward compat)', () => {
    it('should return empty string (legend is now in sidebar)', () => {
      const legend = _buildLegend();
      expect(legend).toBe('');
    });
  });

  describe('_buildSidebar', () => {
    it('should contain all 11 category names', () => {
      const sidebar = _buildSidebar();
      const allCategories = [
        'agents', 'tasks', 'templates', 'checklists', 'workflows',
        'scripts/task', 'scripts/engine', 'scripts/infra',
        'utils', 'data', 'tools',
      ];
      for (const cat of allCategories) {
        expect(sidebar).toContain(cat);
      }
    });

    it('should contain all category colors', () => {
      const sidebar = _buildSidebar();
      for (const [, style] of Object.entries(CATEGORY_COLORS)) {
        expect(sidebar).toContain(style.color);
      }
    });

    it('should contain status-dot spans instead of shape icons', () => {
      const sidebar = _buildSidebar();
      expect(sidebar).toContain('class="status-dot"');
      expect(sidebar).not.toContain('&#9632;');
    });

    it('should contain lifecycle filter checkboxes', () => {
      const sidebar = _buildSidebar();
      expect(sidebar).toContain('data-filter="lifecycle"');
      expect(sidebar).toContain('production');
      expect(sidebar).toContain('experimental');
      expect(sidebar).toContain('deprecated');
      expect(sidebar).toContain('orphan');
    });

    it('should contain search input', () => {
      const sidebar = _buildSidebar();
      expect(sidebar).toContain('id="search-input"');
    });

    it('should contain hide orphans toggle', () => {
      const sidebar = _buildSidebar();
      expect(sidebar).toContain('id="hide-orphans"');
    });

    it('should contain reset button', () => {
      const sidebar = _buildSidebar();
      expect(sidebar).toContain('id="btn-reset"');
    });

    it('should contain exit focus button', () => {
      const sidebar = _buildSidebar();
      expect(sidebar).toContain('id="btn-exit-focus"');
    });
  });

  describe('LIFECYCLE_STYLES', () => {
    it('should define all 4 lifecycle states', () => {
      expect(LIFECYCLE_STYLES.production).toBeDefined();
      expect(LIFECYCLE_STYLES.experimental).toBeDefined();
      expect(LIFECYCLE_STYLES.deprecated).toBeDefined();
      expect(LIFECYCLE_STYLES.orphan).toBeDefined();
    });

    it('should have correct opacity values', () => {
      expect(LIFECYCLE_STYLES.production.opacity).toBe(1.0);
      expect(LIFECYCLE_STYLES.experimental.opacity).toBe(0.8);
      expect(LIFECYCLE_STYLES.deprecated.opacity).toBe(0.5);
      expect(LIFECYCLE_STYLES.orphan.opacity).toBe(0.3);
    });

    it('should have correct color overrides using THEME tokens', () => {
      expect(LIFECYCLE_STYLES.production.colorOverride).toBeNull();
      expect(LIFECYCLE_STYLES.experimental.colorOverride).toBeNull();
      expect(LIFECYCLE_STYLES.deprecated.colorOverride).toBe(THEME.text.tertiary);
      expect(LIFECYCLE_STYLES.orphan.colorOverride).toBe(THEME.text.muted);
    });

    it('should have correct borderDashes', () => {
      expect(LIFECYCLE_STYLES.production.borderDashes).toBe(false);
      expect(LIFECYCLE_STYLES.experimental.borderDashes).toEqual([5, 5]);
      expect(LIFECYCLE_STYLES.deprecated.borderDashes).toBe(false);
      expect(LIFECYCLE_STYLES.orphan.borderDashes).toEqual([2, 4]);
    });
  });

  describe('THEME token governance', () => {
    it('should export THEME constant with all token categories', () => {
      expect(THEME.bg).toBeDefined();
      expect(THEME.text).toBeDefined();
      expect(THEME.status).toBeDefined();
      expect(THEME.border).toBeDefined();
      expect(THEME.accent).toBeDefined();
      expect(THEME.agent).toBeDefined();
      expect(THEME.radius).toBeDefined();
    });

    it('should source CATEGORY_COLORS from THEME tokens', () => {
      const themeValues = new Set();
      const collectValues = (obj) => {
        for (const val of Object.values(obj)) {
          if (typeof val === 'string') themeValues.add(val);
          else if (typeof val === 'object' && val !== null) collectValues(val);
        }
      };
      collectValues(THEME);

      for (const [, style] of Object.entries(CATEGORY_COLORS)) {
        expect(themeValues.has(style.color)).toBe(true);
      }
    });

    it('should source DEFAULT_COLOR from THEME tokens', () => {
      expect(DEFAULT_COLOR.color).toBe(THEME.text.tertiary);
    });

    it('should source LIFECYCLE_STYLES colorOverrides from THEME tokens', () => {
      for (const [, style] of Object.entries(LIFECYCLE_STYLES)) {
        if (style.colorOverride !== null) {
          expect(
            style.colorOverride === THEME.text.tertiary ||
            style.colorOverride === THEME.text.muted
          ).toBe(true);
        }
      }
    });

    it('should use goldStrong for node highlight border', () => {
      const nodes = _buildVisNodes([{ id: 'n', label: 'n', group: 'agents' }]);
      expect(nodes[0].color.highlight.border).toBe(THEME.border.goldStrong);
    });

    it('should use gold for node hover border', () => {
      const nodes = _buildVisNodes([{ id: 'n', label: 'n', group: 'agents' }]);
      expect(nodes[0].color.hover.border).toBe(THEME.border.gold);
    });

    it('should use border.subtle for default node border', () => {
      const nodes = _buildVisNodes([{ id: 'n', label: 'n', group: 'agents' }]);
      expect(nodes[0].color.border).toBe(THEME.border.subtle);
    });
  });

  describe('GD-10: Tooltip & Interaction', () => {
    it('should include tooltip container with role="tooltip"', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="node-tooltip"');
      expect(html).toContain('role="tooltip"');
    });

    it('should include tooltip CSS with card-refined values', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain(THEME.tooltip.bg);
      expect(html).toContain(THEME.tooltip.shadow);
      expect(html).toContain(THEME.tooltip.border);
    });

    it('should include Escape key handler for tooltip dismiss', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain("e.key === 'Escape'");
      expect(html).toContain('hideTooltip');
    });

    it('should include click handler for tooltip display', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('showTooltip');
      expect(html).toContain('canvasToDOM');
    });

    it('should include status-dot CSS', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('.status-dot');
      expect(html).toContain('border-radius: 50%');
      expect(html).toContain('box-shadow: 0 0 8px currentColor');
    });

    it('should include ENTITY TYPES header in sidebar', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('ENTITY TYPES');
    });

    it('should include gold-line separator', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('class="gold-line"');
    });

    it('should include node count per category in sidebar', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      // MOCK_GRAPH_DATA has 1 agent, 1 task, 1 template, 1 script
      expect(html).toContain('margin-left:auto');
    });

    it('should have new THEME tokens for border interaction', () => {
      expect(THEME.border.subtle).toBe('rgba(255,255,255,0.04)');
      expect(THEME.border.gold).toBe('rgba(201,178,152,0.25)');
      expect(THEME.border.goldStrong).toBe('rgba(201,178,152,0.5)');
    });

    it('should have new THEME tokens for tooltip', () => {
      expect(THEME.tooltip).toBeDefined();
      expect(THEME.tooltip.bg).toBe(THEME.bg.surface);
      expect(THEME.tooltip.border).toBe(THEME.border.subtle);
      expect(THEME.tooltip.shadow).toBe('0 4px 12px rgba(0,0,0,0.5)');
    });

    it('should not have title property on nodes (native tooltip disabled)', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);
      for (const node of nodes) {
        expect(node.title).toBeUndefined();
      }
    });
  });

  describe('GD-11: Physics Control Panel', () => {
    it('should include PHYSICS section header in sidebar', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('PHYSICS');
      expect(html).toContain('physics-toggle');
    });

    it('should include 4 range inputs with correct attributes', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      // Center Force
      expect(html).toContain('id="slider-center"');
      expect(html).toContain('min="0" max="1" step="0.05" value="0.3"');
      // Repel Force
      expect(html).toContain('id="slider-repel"');
      expect(html).toContain('min="-30000" max="0" step="500" value="-2000"');
      // Link Force
      expect(html).toContain('id="slider-link"');
      expect(html).toContain('min="0" max="1" step="0.01" value="0.04"');
      // Link Distance
      expect(html).toContain('id="slider-distance"');
      expect(html).toContain('min="10" max="500" step="5" value="95"');
    });

    it('should include Reset button in physics section', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="btn-physics-reset"');
      expect(html).toContain('>Reset<');
    });

    it('should include Pause/Resume toggle button', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="btn-physics-pause"');
      expect(html).toContain('>Pause<');
    });

    it('should have THEME.controls tokens (sliderThumb, sliderTrack)', () => {
      expect(THEME.controls).toBeDefined();
      expect(THEME.controls.sliderThumb).toBe('#C9B298');
      expect(THEME.controls.sliderTrack).toBe('rgba(255,255,255,0.1)');
    });

    it('should have ARIA labels on all sliders', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('aria-label="Center Force"');
      expect(html).toContain('aria-label="Repel Force"');
      expect(html).toContain('aria-label="Link Force"');
      expect(html).toContain('aria-label="Link Distance"');
    });

    it('should include debounce function in JS output', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('_debounce');
    });

    it('should call network.setOptions in slider handler', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('network.setOptions');
      expect(html).toContain('barnesHut');
      expect(html).toContain('centralGravity');
      expect(html).toContain('gravitationalConstant');
      expect(html).toContain('springConstant');
      expect(html).toContain('springLength');
    });

    it('should have physics section collapsed by default', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('physics-content');
      expect(sidebar).toContain('display:none');
    });
  });

  describe('GD-12: Multi-Level Depth Expansion', () => {
    it('should include depth selector with 4 buttons [1][2][3][All]', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="depth-selector"');
      expect(html).toContain('data-depth="1"');
      expect(html).toContain('data-depth="2"');
      expect(html).toContain('data-depth="3"');
      expect(html).toContain('data-depth="all"');
    });

    it('should include depth node count display element', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="depth-node-count"');
    });

    it('should include getNeighborsAtDepth BFS function in script', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function getNeighborsAtDepth');
      expect(html).toContain('visited');
      expect(html).toContain('levels');
    });

    it('should include BFS visited Set and levels Map pattern', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('new Set([nodeId])');
      expect(html).toContain('new Map()');
      expect(html).toContain('getConnectedNodes');
    });

    it('should include depth button click handler calling getNeighborsAtDepth', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('depth-btn');
      expect(html).toContain('setDepth');
      expect(html).toContain('getNeighborsAtDepth');
    });

    it('should include edge visibility via node-based filtering', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      // vis-network auto-hides edges when nodes are hidden
      // AC 11: edge visible when BOTH nodes visible — handled by focusNeighbors filter
      expect(html).toContain('visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)');
    });

    it('should include keyboard shortcut listeners for 1/2/3/A', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain("e.key === '1'");
      expect(html).toContain("e.key === '2'");
      expect(html).toContain("e.key === '3'");
      expect(html).toContain("e.key === 'a'");
      expect(html).toContain("e.key === 'A'");
    });

    it('should have depth selector hidden by default (display: none)', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('id="depth-selector"');
      expect(sidebar).toContain('style="display:none"');
    });

    it('should use THEME tokens for depth button styling (no hardcoded hex)', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      // Depth buttons use THEME.border.goldStrong, THEME.border.gold, THEME.border.subtle
      expect(html).toContain(THEME.border.goldStrong);
      expect(html).toContain(THEME.border.gold);
      expect(html).toContain(THEME.border.subtle);
      expect(html).toContain(THEME.accent.gold);
    });
  });

  describe('GD-13: Graph Metrics & Layout Switching', () => {
    it('should include NODE SIZE section with section-label header', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('NODE SIZE');
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('NODE SIZE');
      expect(sidebar).toContain('gold-line');
    });

    it('should include 4 sizing toggle buttons (Uniform, By Degree, By In-Degree, By Out-Degree)', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('data-sizing="uniform"');
      expect(html).toContain('data-sizing="degree"');
      expect(html).toContain('data-sizing="in-degree"');
      expect(html).toContain('data-sizing="out-degree"');
      expect(html).toContain('Uniform');
      expect(html).toContain('By Degree');
      expect(html).toContain('By In-Degree');
      expect(html).toContain('By Out-Degree');
    });

    it('should have Uniform as default active sizing mode', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('size-btn active" data-sizing="uniform"');
    });

    it('should include LAYOUT section with section-label header', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('LAYOUT');
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('LAYOUT');
    });

    it('should include 3 layout toggle buttons (Force, Hierarchical, Circular)', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('data-layout="force"');
      expect(html).toContain('data-layout="hierarchical"');
      expect(html).toContain('data-layout="circular"');
      expect(html).toContain('>Force<');
      expect(html).toContain('>Hierarchical<');
      expect(html).toContain('>Circular<');
    });

    it('should have Force as default active layout', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('layout-btn active" data-layout="force"');
    });

    it('should include computeDegrees function in script output', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function computeDegrees');
      expect(html).toContain('.out++');
      expect(html).toContain('.in++');
      expect(html).toContain('.total++');
    });

    it('should include switchLayout function with rebuildNetwork for force/hierarchical', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function switchLayout');
      expect(html).toContain('function rebuildNetwork');
      expect(html).toContain('network.destroy()');
      expect(html).toContain("direction: 'UD'");
      expect(html).toContain("sortMethod: 'directed'");
      expect(html).toContain('levelSeparation: 150');
      expect(html).toContain('nodeSpacing: 100');
    });

    it('should include circular layout with Math.cos and Math.sin', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('Math.cos');
      expect(html).toContain('Math.sin');
      expect(html).toContain('2 * Math.PI');
    });

    it('should include applySizing function with min/max normalization', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function applySizing');
      expect(html).toContain('minSize');
      expect(html).toContain('maxSize');
      expect(html).toContain('nodesDataset.update');
    });

    it('should use section-label pattern (uppercase, gold, letter-spacing) for both headers', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('.section-title');
      expect(html).toContain('text-transform: uppercase');
      expect(html).toContain(THEME.accent.gold);
      expect(html).toContain('letter-spacing: 0.2em');
    });

    it('should dim physics controls when layout is not force', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('physics-section');
      expect(html).toContain("physicsSection.style.opacity = layout === 'force'");
    });
  });

  describe('GD-14: Export & Minimap', () => {
    it('should include EXPORT section with PNG and JSON buttons', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('EXPORT');
      expect(sidebar).toContain('btn-export-png');
      expect(sidebar).toContain('btn-export-json');
      expect(sidebar).toContain('>PNG<');
      expect(sidebar).toContain('>JSON<');
    });

    it('should have ARIA labels on export buttons', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('aria-label="Export graph as PNG image"');
      expect(sidebar).toContain('aria-label="Export graph data as JSON file"');
    });

    it('should include PNG export handler using toDataURL', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('btn-export-png');
      expect(html).toContain("toDataURL('image/png')");
      expect(html).toContain('getTimestampFilename');
    });

    it('should include JSON export handler serializing nodes and edges', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('btn-export-json');
      expect(html).toContain('JSON.stringify');
      expect(html).toContain('metadata');
      expect(html).toContain('timestamp');
    });

    it('should include minimap container with canvas element', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('minimap-container');
      expect(html).toContain('minimap-canvas');
      expect(html).toContain('<canvas id="minimap-canvas"');
    });

    it('should include minimap toggle button', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('minimap-toggle');
      expect(html).toContain('aria-label="Toggle minimap"');
    });

    it('should use THEME tokens for minimap styling', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('#minimap-container');
      expect(html).toContain(THEME.bg.surface);
      expect(html).toContain(THEME.border.subtle);
    });

    it('should include drawMinimap function with viewport rectangle', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function drawMinimap');
      expect(html).toContain('getViewPosition');
      expect(html).toContain('getScale');
      expect(html).toContain('strokeRect');
    });

    it('should include minimap click-to-pan using network.moveTo', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('network.moveTo');
      expect(html).toContain('easeInOutQuad');
    });

    it('should throttle minimap updates with requestAnimationFrame', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('scheduleMinimapUpdate');
      expect(html).toContain('requestAnimationFrame');
    });
  });

  describe('GD-15: Clustering & Statistics', () => {
    it('should include CLUSTERING section with toggle button', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('CLUSTERING');
      expect(sidebar).toContain('btn-cluster-category');
      expect(sidebar).toContain('Cluster by Category');
    });

    it('should include cluster function using network.cluster() in script', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function clusterByCategory');
      expect(html).toContain('network.cluster(');
      expect(html).toContain('joinCondition');
      expect(html).toContain('clusterNodeProperties');
    });

    it('should include cluster handler with openCluster on double-click', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('network.isCluster(nodeId)');
      expect(html).toContain('network.openCluster(nodeId)');
    });

    it('should include STATISTICS section with 4 metric elements', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('STATISTICS');
      expect(sidebar).toContain('stat-nodes');
      expect(sidebar).toContain('stat-edges');
      expect(sidebar).toContain('stat-density');
      expect(sidebar).toContain('stat-avg-degree');
    });

    it('should include computeGraphStats function in script', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('function computeGraphStats');
      expect(html).toContain('density');
      expect(html).toContain('avgDegree');
    });

    it('should include top-5 connected list element', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain('stat-top5');
      expect(sidebar).toContain('Top 5 Connected');
    });

    it('should use THEME tokens for statistics styling', () => {
      const sidebar = _buildSidebar(MOCK_GRAPH_DATA.nodes);
      expect(sidebar).toContain(THEME.text.secondary);
      expect(sidebar).toContain(THEME.text.primary);
    });

    it('should include updateStatistics in refreshFilters for dynamic updates', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('updateStatistics');
      expect(html).toContain('function updateStatistics');
    });
  });

  describe('CLI integration (FORMAT_MAP)', () => {
    it('should have html in FORMAT_MAP', () => {
      const { FORMAT_MAP } = require('../../.aios-core/core/graph-dashboard/cli');
      expect(FORMAT_MAP.html).toBe(formatAsHtml);
    });

    it('should have html in VALID_FORMATS', () => {
      const { VALID_FORMATS } = require('../../.aios-core/core/graph-dashboard/cli');
      expect(VALID_FORMATS).toContain('html');
    });

    it('should have html in WATCH_FORMAT_MAP', () => {
      const { WATCH_FORMAT_MAP } = require('../../.aios-core/core/graph-dashboard/cli');
      expect(WATCH_FORMAT_MAP.html).toBeDefined();
      expect(WATCH_FORMAT_MAP.html.filename).toBe('graph.html');
    });

    it('should parse --format=html correctly', () => {
      const { parseArgs } = require('../../.aios-core/core/graph-dashboard/cli');
      const args = parseArgs(['--deps', '--format=html']);
      expect(args.format).toBe('html');
      expect(args.command).toBe('--deps');
    });

    it('should parse --format html correctly', () => {
      const { parseArgs } = require('../../.aios-core/core/graph-dashboard/cli');
      const args = parseArgs(['--deps', '--format', 'html']);
      expect(args.format).toBe('html');
    });
  });

  describe('XSS prevention', () => {
    it('should sanitize node labels with script tags', () => {
      const maliciousData = {
        nodes: [{ id: 'xss', label: '<img src=x onerror=alert(1)>', group: 'tasks' }],
        edges: [],
      };
      const html = formatAsHtml(maliciousData);
      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&lt;img src=x');
    });

    it('should sanitize node labels with embedded quotes', () => {
      const maliciousData = {
        nodes: [{ id: 'q', label: '"); alert("xss', group: 'tasks' }],
        edges: [],
      };
      const html = formatAsHtml(maliciousData);
      expect(html).not.toContain('"); alert("xss');
    });
  });
});
