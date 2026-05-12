'use strict';

const { CodeGraphProvider, TOOL_MAP } = require('../../.aiox-core/core/code-intel/providers/code-graph-provider');

describe('CodeGraphProvider', () => {
  let provider;
  let mockMcpCallFn;

  beforeEach(() => {
    mockMcpCallFn = jest.fn();
    provider = new CodeGraphProvider({ mcpCallFn: mockMcpCallFn });
  });

  describe('TOOL_MAP', () => {
    it('should map all 8 capabilities to Code Graph MCP tool names', () => {
      expect(TOOL_MAP).toEqual({
        findDefinition: 'find_definition',
        findReferences: 'find_references',
        findCallers: 'find_callers',
        findCallees: 'find_callees',
        analyzeDependencies: 'dependency_analysis',
        analyzeComplexity: 'complexity_analysis',
        analyzeCodebase: 'analyze_codebase',
        getProjectStats: 'project_statistics',
      });
    });

    it('should have exactly 8 entries', () => {
      expect(Object.keys(TOOL_MAP)).toHaveLength(8);
    });
  });

  describe('findDefinition', () => {
    it('should call MCP with find_definition and normalize result', async () => {
      mockMcpCallFn.mockResolvedValue({
        file: 'src/index.js',
        line: 42,
        column: 5,
        context: 'function foo() {',
      });

      const result = await provider.findDefinition('foo');
      expect(mockMcpCallFn).toHaveBeenCalledWith('code-graph', 'find_definition', { symbol: 'foo' });
      expect(result).toEqual({
        file: 'src/index.js',
        line: 42,
        column: 5,
        context: 'function foo() {',
      });
    });

    it('should return null when MCP returns null', async () => {
      mockMcpCallFn.mockResolvedValue(null);
      const result = await provider.findDefinition('missing');
      expect(result).toBeNull();
    });
  });

  describe('findReferences', () => {
    it('should normalize array response', async () => {
      mockMcpCallFn.mockResolvedValue([
        { file: 'a.js', line: 1, context: 'use foo' },
        { file: 'b.js', line: 5, context: 'call foo' },
      ]);

      const result = await provider.findReferences('foo');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ file: 'a.js', line: 1, context: 'use foo' });
    });

    it('should normalize object with references key', async () => {
      mockMcpCallFn.mockResolvedValue({
        references: [{ path: 'c.js', row: 10, snippet: 'ref foo' }],
      });

      const result = await provider.findReferences('foo');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ file: 'c.js', line: 10, context: 'ref foo' });
    });
  });

  describe('findCallers', () => {
    it('should normalize callers result', async () => {
      mockMcpCallFn.mockResolvedValue({
        callers: [{ caller: 'bar', file: 'bar.js', line: 3 }],
      });

      const result = await provider.findCallers('foo');
      expect(result).toEqual([{ caller: 'bar', file: 'bar.js', line: 3 }]);
    });
  });

  describe('findCallees', () => {
    it('should normalize callees result', async () => {
      mockMcpCallFn.mockResolvedValue({
        callees: [{ callee: 'baz', file: 'baz.js', line: 7 }],
      });

      const result = await provider.findCallees('foo');
      expect(result).toEqual([{ callee: 'baz', file: 'baz.js', line: 7 }]);
    });
  });

  describe('analyzeDependencies', () => {
    it('should normalize dependency graph', async () => {
      mockMcpCallFn.mockResolvedValue({
        nodes: ['a.js', 'b.js'],
        edges: [{ from: 'a.js', to: 'b.js' }],
      });

      const result = await provider.analyzeDependencies('src/');
      expect(result).toEqual({
        nodes: ['a.js', 'b.js'],
        edges: [{ from: 'a.js', to: 'b.js' }],
      });
    });
  });

  describe('analyzeComplexity', () => {
    it('should normalize complexity metrics', async () => {
      mockMcpCallFn.mockResolvedValue({
        score: 15,
        details: { cyclomatic: 15, halstead: 200 },
      });

      const result = await provider.analyzeComplexity('src/index.js');
      expect(result).toEqual({
        score: 15,
        details: { cyclomatic: 15, halstead: 200 },
      });
    });

    it('should preserve score=0 without falling through to alternatives', async () => {
      mockMcpCallFn.mockResolvedValue({
        score: 0,
        details: {},
      });

      const result = await provider.analyzeComplexity('src/simple.js');
      expect(result.score).toBe(0);
    });
  });

  describe('analyzeCodebase', () => {
    it('should normalize codebase analysis', async () => {
      mockMcpCallFn.mockResolvedValue({
        files: ['a.js', 'b.js'],
        structure: { type: 'flat' },
        patterns: ['singleton'],
      });

      const result = await provider.analyzeCodebase('.');
      expect(result).toEqual({
        files: ['a.js', 'b.js'],
        structure: { type: 'flat' },
        patterns: ['singleton'],
      });
    });
  });

  describe('getProjectStats', () => {
    it('should normalize project statistics', async () => {
      mockMcpCallFn.mockResolvedValue({
        files: 150,
        lines: 25000,
        languages: { javascript: 120, yaml: 30 },
      });

      const result = await provider.getProjectStats();
      expect(result).toEqual({
        files: 150,
        lines: 25000,
        languages: { javascript: 120, yaml: 30 },
      });
    });

    it('should preserve files=0 and lines=0 without falling through', async () => {
      mockMcpCallFn.mockResolvedValue({
        files: 0,
        lines: 0,
        languages: {},
      });

      const result = await provider.getProjectStats();
      expect(result.files).toBe(0);
      expect(result.lines).toBe(0);
    });
  });

  describe('no mcpCallFn configured', () => {
    it('should return null for all capabilities', async () => {
      const bareProvider = new CodeGraphProvider();
      expect(await bareProvider.findDefinition('foo')).toBeNull();
      expect(await bareProvider.findReferences('foo')).toBeNull();
      expect(await bareProvider.getProjectStats()).toBeNull();
    });
  });
});
