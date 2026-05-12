'use strict';

const { CodeIntelEnricher } = require('../../.aiox-core/core/code-intel/code-intel-enricher');

describe('CodeIntelEnricher', () => {
  let enricher;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      findDefinition: jest.fn(),
      findReferences: jest.fn(),
      findCallers: jest.fn(),
      findCallees: jest.fn(),
      analyzeDependencies: jest.fn(),
      analyzeComplexity: jest.fn(),
      analyzeCodebase: jest.fn(),
      getProjectStats: jest.fn(),
    };
    enricher = new CodeIntelEnricher(mockClient);
  });

  describe('assessImpact (AC7)', () => {
    it('should compose findReferences + analyzeComplexity', async () => {
      mockClient.findReferences.mockResolvedValue([
        { file: 'b.js', line: 10, context: 'uses foo' },
      ]);
      mockClient.analyzeComplexity.mockResolvedValue({ score: 8, details: {} });

      const result = await enricher.assessImpact(['src/foo.js']);

      expect(mockClient.findReferences).toHaveBeenCalledWith('src/foo.js');
      expect(mockClient.analyzeComplexity).toHaveBeenCalledWith('src/foo.js');
      expect(result.blastRadius).toBe(1);
      expect(result.complexity.average).toBe(8);
    });

    it('should return null for empty files array', async () => {
      expect(await enricher.assessImpact([])).toBeNull();
      expect(await enricher.assessImpact(null)).toBeNull();
    });

    it('should handle null results from primitives', async () => {
      mockClient.findReferences.mockResolvedValue(null);
      mockClient.analyzeComplexity.mockResolvedValue(null);

      const result = await enricher.assessImpact(['src/foo.js']);
      expect(result.blastRadius).toBe(0);
      expect(result.complexity.average).toBe(0);
    });
  });

  describe('detectDuplicates (AC7)', () => {
    it('should compose findReferences + analyzeCodebase', async () => {
      mockClient.findReferences.mockResolvedValue([
        { file: 'a.js', line: 5, context: 'similar code' },
      ]);
      mockClient.analyzeCodebase.mockResolvedValue({
        files: ['a.js'],
        structure: {},
        patterns: [],
      });

      const result = await enricher.detectDuplicates('config loader');

      expect(mockClient.findReferences).toHaveBeenCalledWith('config loader', {});
      expect(mockClient.analyzeCodebase).toHaveBeenCalledWith('.', {});
      expect(result.matches).toHaveLength(1);
    });

    it('should return null when both primitives return null', async () => {
      mockClient.findReferences.mockResolvedValue(null);
      mockClient.analyzeCodebase.mockResolvedValue(null);

      const result = await enricher.detectDuplicates('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getConventions (AC7)', () => {
    it('should compose analyzeCodebase + getProjectStats', async () => {
      mockClient.analyzeCodebase.mockResolvedValue({
        files: [],
        structure: {},
        patterns: ['singleton', 'factory'],
      });
      mockClient.getProjectStats.mockResolvedValue({
        files: 100,
        lines: 10000,
        languages: { javascript: 80 },
      });

      const result = await enricher.getConventions('src/');

      expect(result.patterns).toEqual(['singleton', 'factory']);
      expect(result.stats.files).toBe(100);
    });
  });

  describe('findTests (AC7)', () => {
    it('should filter references to test/spec files only', async () => {
      mockClient.findReferences.mockResolvedValue([
        { file: 'src/foo.js', line: 1, context: 'define' },
        { file: 'tests/foo.test.js', line: 5, context: 'import' },
        { file: '__tests__/foo.js', line: 3, context: 'require' },
        { file: 'src/foo.spec.js', line: 8, context: 'describe' },
        { file: 'src/bar.js', line: 2, context: 'usage' },
      ]);

      const result = await enricher.findTests('foo');
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.file)).toEqual([
        'tests/foo.test.js',
        '__tests__/foo.js',
        'src/foo.spec.js',
      ]);
    });

    it('should return null when findReferences returns null', async () => {
      mockClient.findReferences.mockResolvedValue(null);
      expect(await enricher.findTests('foo')).toBeNull();
    });
  });

  describe('describeProject (AC7)', () => {
    it('should compose analyzeCodebase + getProjectStats', async () => {
      mockClient.analyzeCodebase.mockResolvedValue({
        files: ['a.js', 'b.js'],
        structure: { type: 'modular' },
        patterns: [],
      });
      mockClient.getProjectStats.mockResolvedValue({
        files: 200,
        lines: 30000,
        languages: { javascript: 150, yaml: 50 },
      });

      const result = await enricher.describeProject('.');

      expect(result.codebase.files).toHaveLength(2);
      expect(result.stats.files).toBe(200);
    });

    it('should return null when both return null', async () => {
      mockClient.analyzeCodebase.mockResolvedValue(null);
      mockClient.getProjectStats.mockResolvedValue(null);
      expect(await enricher.describeProject()).toBeNull();
    });
  });
});
