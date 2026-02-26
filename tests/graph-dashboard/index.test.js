'use strict';

jest.mock('../../.aios-core/core/graph-dashboard/data-sources/code-intel-source', () => ({
  CodeIntelSource: jest.fn().mockImplementation(() => ({
    getData: jest.fn().mockResolvedValue({
      nodes: [{ id: 'a', label: 'a', type: 'task', path: 'a.md', category: 'tasks' }],
      edges: [],
      source: 'registry',
      isFallback: true,
      timestamp: Date.now(),
    }),
  })),
}));

const { getGraphData, renderTree, run, CodeIntelSource } = require('../../.aios-core/core/graph-dashboard');

describe('graph-dashboard index', () => {
  it('should export getGraphData as a function', () => {
    expect(typeof getGraphData).toBe('function');
  });

  it('should export renderTree as a function', () => {
    expect(typeof renderTree).toBe('function');
  });

  it('should export run as a function', () => {
    expect(typeof run).toBe('function');
  });

  it('should export CodeIntelSource as a constructor', () => {
    expect(typeof CodeIntelSource).toBe('function');
  });

  it('should return graph data from getGraphData', async () => {
    const result = await getGraphData();

    expect(result.nodes).toHaveLength(1);
    expect(result.source).toBe('registry');
    expect(result.isFallback).toBe(true);
    expect(result.timestamp).toBeDefined();
  });
});
