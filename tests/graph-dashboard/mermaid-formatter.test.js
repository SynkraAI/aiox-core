'use strict';

const {
  formatAsMermaid,
  _safeId,
  _escapeMermaid,
} = require('../../.aios-core/core/graph-dashboard/formatters/mermaid-formatter');

const SAMPLE_GRAPH = {
  nodes: [
    { id: 'dev', label: 'dev', type: 'agent', path: 'dev.md', category: 'agents' },
    { id: 'task-a', label: 'task-a', type: 'task', path: 'a.md', category: 'tasks' },
    { id: 'isolated', label: 'isolated', type: 'tool', path: 'iso.md', category: 'tools' },
  ],
  edges: [{ from: 'dev', to: 'task-a', type: 'depends' }],
  source: 'registry',
  isFallback: false,
};

const EMPTY_GRAPH = {
  nodes: [],
  edges: [],
  source: 'registry',
  isFallback: true,
};

describe('mermaid-formatter', () => {
  describe('formatAsMermaid', () => {
    it('should start with graph TD', () => {
      const output = formatAsMermaid(SAMPLE_GRAPH);

      expect(output.startsWith('graph TD')).toBe(true);
    });

    it('should include edge declarations', () => {
      const output = formatAsMermaid(SAMPLE_GRAPH);

      expect(output).toContain('dev["dev"] --> task-a["task-a"]');
    });

    it('should include isolated nodes', () => {
      const output = formatAsMermaid(SAMPLE_GRAPH);

      expect(output).toContain('isolated["isolated"]');
    });

    it('should not include connected nodes as isolated', () => {
      const output = formatAsMermaid(SAMPLE_GRAPH);
      const lines = output.split('\n');
      const isolatedLines = lines.filter((l) => l.trim().startsWith('dev[') && !l.includes('-->'));

      expect(isolatedLines).toHaveLength(0);
    });

    it('should handle empty graph', () => {
      const output = formatAsMermaid(EMPTY_GRAPH);

      expect(output).toBe('graph TD');
    });

    it('should not contain ANSI escape sequences', () => {
      const output = formatAsMermaid(SAMPLE_GRAPH);

      expect(output).not.toContain('\x1b[');
    });

    it('should escape special characters in labels', () => {
      const graph = {
        nodes: [{ id: 'node-1', label: 'has [brackets]' }],
        edges: [],
      };
      const output = formatAsMermaid(graph);

      expect(output).toContain('&#91;');
      expect(output).toContain('&#93;');
    });
  });

  describe('_safeId', () => {
    it('should keep alphanumeric and hyphens', () => {
      expect(_safeId('my-node-1')).toBe('my-node-1');
    });

    it('should replace special characters with underscore', () => {
      expect(_safeId('node.with.dots')).toBe('node_with_dots');
    });
  });

  describe('_escapeMermaid', () => {
    it('should escape double quotes', () => {
      expect(_escapeMermaid('say "hi"')).toBe('say &quot;hi&quot;');
    });

    it('should escape brackets', () => {
      expect(_escapeMermaid('[test]')).toBe('&#91;test&#93;');
    });

    it('should leave safe strings unchanged', () => {
      expect(_escapeMermaid('simple')).toBe('simple');
    });
  });
});
