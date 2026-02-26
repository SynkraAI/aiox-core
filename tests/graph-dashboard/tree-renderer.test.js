'use strict';

const {
  renderTree,
  MAX_ITEMS_PER_BRANCH,
  UNICODE_CHARS,
  ASCII_CHARS,
} = require('../../.aios-core/core/graph-dashboard/renderers/tree-renderer');

describe('tree-renderer', () => {
  const makeGraphData = (nodes = [], edges = [], opts = {}) => ({
    nodes,
    edges,
    source: opts.source || 'registry',
    isFallback: opts.isFallback !== undefined ? opts.isFallback : true,
    timestamp: Date.now(),
  });

  describe('renderTree - basic output', () => {
    it('should render header with entity count', () => {
      const data = makeGraphData([
        { id: 'a', label: 'a', type: 'task', path: 'a.md', category: 'tasks' },
      ]);

      const output = renderTree(data);

      expect(output).toContain('Dependency Graph (1 entities)');
    });

    it('should group nodes by category', () => {
      const data = makeGraphData([
        { id: 'a', label: 'a', type: 'task', path: 'a.md', category: 'tasks' },
        { id: 'b', label: 'b', type: 'agent', path: 'b.md', category: 'agents' },
      ]);

      const output = renderTree(data);

      expect(output).toContain('agents/ (1)');
      expect(output).toContain('tasks/ (1)');
    });

    it('should show dependencies for nodes with depends edges', () => {
      const data = makeGraphData(
        [
          { id: 'task-a', label: 'task-a', type: 'task', path: 'a.md', category: 'tasks' },
          { id: 'task-b', label: 'task-b', type: 'task', path: 'b.md', category: 'tasks' },
        ],
        [{ from: 'task-a', to: 'task-b', type: 'depends' }]
      );

      const output = renderTree(data);

      expect(output).toContain('task-a');
      expect(output).toContain('depends: task-b');
    });

    it('should sort categories alphabetically', () => {
      const data = makeGraphData([
        { id: 'z', label: 'z', type: 'task', path: 'z.md', category: 'tasks' },
        { id: 'a', label: 'a', type: 'agent', path: 'a.md', category: 'agents' },
      ]);

      const output = renderTree(data);
      const agentsIdx = output.indexOf('agents/');
      const tasksIdx = output.indexOf('tasks/');

      expect(agentsIdx).toBeLessThan(tasksIdx);
    });
  });

  describe('renderTree - box-drawing characters', () => {
    it('should use Unicode chars by default', () => {
      const data = makeGraphData([
        { id: 'a', label: 'a', type: 'task', path: 'a.md', category: 'tasks' },
      ]);

      const output = renderTree(data, { unicode: true });

      expect(output).toContain(UNICODE_CHARS.last);
    });

    it('should use ASCII chars when unicode=false', () => {
      const data = makeGraphData([
        { id: 'a', label: 'a', type: 'task', path: 'a.md', category: 'tasks' },
      ]);

      const output = renderTree(data, { unicode: false });

      expect(output).toContain(ASCII_CHARS.last);
      expect(output).not.toContain(UNICODE_CHARS.branch);
    });
  });

  describe('renderTree - empty graph', () => {
    it('should render empty message for zero nodes', () => {
      const data = makeGraphData([]);
      const output = renderTree(data);

      expect(output).toContain('0 entities');
      expect(output).toContain('(empty)');
    });

    it('should show [OFFLINE] badge when fallback', () => {
      const data = makeGraphData([], [], { isFallback: true });
      const output = renderTree(data);

      expect(output).toContain('[OFFLINE]');
    });

    it('should not show [OFFLINE] badge when live data', () => {
      const data = makeGraphData(
        [{ id: 'x', label: 'x', type: 'task', path: 'x.md', category: 'tasks' }],
        [],
        { isFallback: false }
      );
      const output = renderTree(data);

      expect(output).not.toContain('[OFFLINE]');
    });
  });

  describe('renderTree - truncation', () => {
    it('should truncate branches exceeding MAX_ITEMS_PER_BRANCH', () => {
      const nodes = [];
      for (let i = 0; i < MAX_ITEMS_PER_BRANCH + 5; i++) {
        nodes.push({ id: `task-${String(i).padStart(3, '0')}`, label: `task-${i}`, type: 'task', path: `t${i}.md`, category: 'tasks' });
      }

      const data = makeGraphData(nodes);
      const output = renderTree(data);

      expect(output).toContain(`... (5 more)`);
    });

    it('should not truncate branches within limit', () => {
      const nodes = [];
      for (let i = 0; i < 3; i++) {
        nodes.push({ id: `task-${i}`, label: `task-${i}`, type: 'task', path: `t${i}.md`, category: 'tasks' });
      }

      const data = makeGraphData(nodes);
      const output = renderTree(data);

      expect(output).not.toContain('more)');
    });
  });

  describe('renderTree - pipe mode (non-TTY)', () => {
    it('should render clean output without ANSI escapes when unicode=false', () => {
      const data = makeGraphData([
        { id: 'a', label: 'a', type: 'task', path: 'a.md', category: 'tasks' },
      ]);

      const output = renderTree(data, { color: false, unicode: false });

      // Should not contain ANSI escape sequences
      // eslint-disable-next-line no-control-regex
      expect(output).not.toMatch(/\x1b\[/);
    });
  });
});
