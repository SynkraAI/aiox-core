'use strict';

const { formatAsDot, _escapeDot } = require('../../.aios-core/core/graph-dashboard/formatters/dot-formatter');

const SAMPLE_GRAPH = {
  nodes: [
    { id: 'dev', label: 'dev', type: 'agent', path: 'dev.md', category: 'agents' },
    { id: 'task-a', label: 'task-a', type: 'task', path: 'a.md', category: 'tasks' },
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

describe('dot-formatter', () => {
  describe('formatAsDot', () => {
    it('should start with digraph G {', () => {
      const output = formatAsDot(SAMPLE_GRAPH);

      expect(output.startsWith('digraph G {')).toBe(true);
    });

    it('should end with closing brace', () => {
      const output = formatAsDot(SAMPLE_GRAPH);

      expect(output.trim().endsWith('}')).toBe(true);
    });

    it('should include rankdir and node style', () => {
      const output = formatAsDot(SAMPLE_GRAPH);

      expect(output).toContain('rankdir=TB;');
      expect(output).toContain('node [shape=box, style=rounded];');
    });

    it('should include node declarations', () => {
      const output = formatAsDot(SAMPLE_GRAPH);

      expect(output).toContain('"dev" [label="dev"];');
      expect(output).toContain('"task-a" [label="task-a"];');
    });

    it('should include edge declarations', () => {
      const output = formatAsDot(SAMPLE_GRAPH);

      expect(output).toContain('"dev" -> "task-a";');
    });

    it('should handle empty graph', () => {
      const output = formatAsDot(EMPTY_GRAPH);

      expect(output).toContain('digraph G {');
      expect(output).toContain('}');
    });

    it('should not contain ANSI escape sequences', () => {
      const output = formatAsDot(SAMPLE_GRAPH);

      expect(output).not.toContain('\x1b[');
    });

    it('should escape quotes in labels', () => {
      const graph = {
        nodes: [{ id: 'node-1', label: 'has "quotes"' }],
        edges: [],
      };
      const output = formatAsDot(graph);

      expect(output).toContain('has \\"quotes\\"');
    });
  });

  describe('_escapeDot', () => {
    it('should escape double quotes', () => {
      expect(_escapeDot('say "hello"')).toBe('say \\"hello\\"');
    });

    it('should escape backslashes', () => {
      expect(_escapeDot('path\\to')).toBe('path\\\\to');
    });

    it('should leave safe strings unchanged', () => {
      expect(_escapeDot('simple-id')).toBe('simple-id');
    });
  });
});
