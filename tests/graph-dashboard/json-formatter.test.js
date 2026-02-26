'use strict';

const { formatAsJson } = require('../../.aios-core/core/graph-dashboard/formatters/json-formatter');

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

describe('json-formatter', () => {
  describe('formatAsJson', () => {
    it('should return valid JSON string', () => {
      const output = formatAsJson(SAMPLE_GRAPH);
      const parsed = JSON.parse(output);

      expect(parsed).toEqual(SAMPLE_GRAPH);
    });

    it('should be indented with 2 spaces', () => {
      const output = formatAsJson(SAMPLE_GRAPH);

      expect(output).toContain('  "nodes"');
    });

    it('should handle empty graph', () => {
      const output = formatAsJson(EMPTY_GRAPH);
      const parsed = JSON.parse(output);

      expect(parsed.nodes).toEqual([]);
      expect(parsed.edges).toEqual([]);
    });

    it('should be parseable by JSON.parse without errors', () => {
      expect(() => JSON.parse(formatAsJson(SAMPLE_GRAPH))).not.toThrow();
    });

    it('should not contain ANSI escape sequences', () => {
      const output = formatAsJson(SAMPLE_GRAPH);

      expect(output).not.toContain('\x1b[');
    });
  });
});
