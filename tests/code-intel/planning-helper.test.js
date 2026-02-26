'use strict';

const {
  getCodebaseOverview,
  getDependencyGraph,
  getComplexityAnalysis,
  getImplementationContext,
  getImplementationImpact,
  _buildDependencySummary,
  _calculateRiskLevel,
  RISK_THRESHOLDS,
} = require('../../.aios-core/core/code-intel/helpers/planning-helper');

// Mock the code-intel module
jest.mock('../../.aios-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(),
  getEnricher: jest.fn(),
  getClient: jest.fn(),
}));

const {
  isCodeIntelAvailable,
  getEnricher,
  getClient,
} = require('../../.aios-core/core/code-intel/index');

// --- Helper to setup mocks ---

function setupProviderAvailable() {
  isCodeIntelAvailable.mockReturnValue(true);
}

function setupProviderUnavailable() {
  isCodeIntelAvailable.mockReturnValue(false);
}

function createMockEnricher(overrides = {}) {
  const enricher = {
    detectDuplicates: jest.fn().mockResolvedValue(null),
    assessImpact: jest.fn().mockResolvedValue(null),
    getConventions: jest.fn().mockResolvedValue(null),
    findTests: jest.fn().mockResolvedValue(null),
    describeProject: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getEnricher.mockReturnValue(enricher);
  return enricher;
}

function createMockClient(overrides = {}) {
  const client = {
    findReferences: jest.fn().mockResolvedValue(null),
    findDefinition: jest.fn().mockResolvedValue(null),
    analyzeDependencies: jest.fn().mockResolvedValue(null),
    analyzeComplexity: jest.fn().mockResolvedValue(null),
    analyzeCodebase: jest.fn().mockResolvedValue(null),
    getProjectStats: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getClient.mockReturnValue(client);
  return client;
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PlanningHelper', () => {
  // === T1: getCodebaseOverview with provider ===
  describe('getCodebaseOverview', () => {
    it('should return codebase and stats when provider available (T1)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        describeProject: jest.fn().mockResolvedValue({
          codebase: { patterns: ['CommonJS'], fileGroups: { core: 12, tests: 8 } },
          stats: { files: 120, lines: 8500, languages: ['javascript'] },
        }),
      });

      const result = await getCodebaseOverview('.');

      expect(result).not.toBeNull();
      expect(result.codebase).toBeDefined();
      expect(result.codebase.patterns).toContain('CommonJS');
      expect(result.stats).toBeDefined();
      expect(result.stats.files).toBe(120);
    });

    // === T2: getCodebaseOverview without provider ===
    it('should return null without throw when no provider (T2)', async () => {
      setupProviderUnavailable();

      const result = await getCodebaseOverview('.');

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null when describeProject returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        describeProject: jest.fn().mockResolvedValue(null),
      });

      const result = await getCodebaseOverview('.');

      expect(result).toBeNull();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        describeProject: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await getCodebaseOverview('.');

      expect(result).toBeNull();
    });

    // === T15 (partial): Input validation null path ===
    it('should return null for null path (T15)', async () => {
      const result = await getCodebaseOverview(null);

      expect(result).toBeNull();
    });

    it('should return null for empty string path', async () => {
      const result = await getCodebaseOverview('');

      expect(result).toBeNull();
    });
  });

  // === T3: getDependencyGraph with provider ===
  describe('getDependencyGraph', () => {
    it('should return dependencies and summary when provider available (T3)', async () => {
      setupProviderAvailable();
      createMockClient({
        analyzeDependencies: jest.fn().mockResolvedValue({
          dependencies: [
            { from: 'src/a.js', to: 'src/b.js' },
            { from: 'src/b.js', to: 'src/c.js' },
          ],
        }),
      });

      const result = await getDependencyGraph('src/');

      expect(result).not.toBeNull();
      expect(result.dependencies).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalDeps).toBeGreaterThan(0);
      expect(result.summary.depth).toBeDefined();
    });

    // === T4: getDependencyGraph without provider ===
    it('should return null without throw when no provider (T4)', async () => {
      setupProviderUnavailable();

      const result = await getDependencyGraph('src/');

      expect(result).toBeNull();
    });

    it('should return null for null path', async () => {
      const result = await getDependencyGraph(null);

      expect(result).toBeNull();
    });

    it('should return null when analyzeDependencies returns null', async () => {
      setupProviderAvailable();
      createMockClient({
        analyzeDependencies: jest.fn().mockResolvedValue(null),
      });

      const result = await getDependencyGraph('src/');

      expect(result).toBeNull();
    });
  });

  // === T5: getComplexityAnalysis with provider (multi-file) ===
  describe('getComplexityAnalysis', () => {
    it('should return perFile and average when provider available (T5)', async () => {
      setupProviderAvailable();
      createMockClient({
        analyzeComplexity: jest.fn()
          .mockResolvedValueOnce({ score: 8, details: {} })
          .mockResolvedValueOnce({ score: 12, details: {} }),
      });

      const result = await getComplexityAnalysis(['src/a.js', 'src/b.js']);

      expect(result).not.toBeNull();
      expect(result.perFile).toHaveLength(2);
      expect(result.perFile[0].file).toBe('src/a.js');
      expect(result.perFile[0].complexity.score).toBe(8);
      expect(result.perFile[1].complexity.score).toBe(12);
      expect(result.average).toBe(10); // (8+12)/2
    });

    // === T6: getComplexityAnalysis without provider ===
    it('should return null without throw when no provider (T6)', async () => {
      setupProviderUnavailable();

      const result = await getComplexityAnalysis(['src/a.js']);

      expect(result).toBeNull();
    });

    // === T7: getComplexityAnalysis with partial failure ===
    it('should return partial results when one file fails (T7)', async () => {
      setupProviderAvailable();
      createMockClient({
        analyzeComplexity: jest.fn()
          .mockResolvedValueOnce({ score: 6, details: {} })
          .mockRejectedValueOnce(new Error('analysis failed')),
      });

      const result = await getComplexityAnalysis(['src/ok.js', 'src/fail.js']);

      expect(result).not.toBeNull();
      expect(result.perFile).toHaveLength(2);
      expect(result.perFile[0].complexity).not.toBeNull();
      expect(result.perFile[1].complexity).toBeNull();
      expect(result.average).toBe(6); // only 1 valid score
    });

    it('should return null for empty array', async () => {
      const result = await getComplexityAnalysis([]);

      expect(result).toBeNull();
    });

    it('should return null for null input', async () => {
      const result = await getComplexityAnalysis(null);

      expect(result).toBeNull();
    });
  });

  // === T8: getImplementationContext with provider ===
  describe('getImplementationContext', () => {
    it('should return definitions, dependencies, and relatedTests (T8)', async () => {
      setupProviderAvailable();
      createMockClient({
        findDefinition: jest.fn().mockResolvedValue({
          file: 'src/core/parser.js',
          line: 42,
          context: 'function parseConfig()',
        }),
        analyzeDependencies: jest.fn().mockResolvedValue({
          dependencies: [{ from: 'parser.js', to: 'config.js' }],
        }),
      });
      createMockEnricher({
        findTests: jest.fn().mockResolvedValue([
          { file: 'tests/parser.test.js', line: 10, context: 'describe("parseConfig")' },
        ]),
      });

      const result = await getImplementationContext(['parseConfig']);

      expect(result).not.toBeNull();
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].symbol).toBe('parseConfig');
      expect(result.definitions[0].file).toBe('src/core/parser.js');
      expect(result.dependencies).toHaveLength(1);
      expect(result.relatedTests).toHaveLength(1);
      expect(result.relatedTests[0].tests).toHaveLength(1);
    });

    // === T9: getImplementationContext with partial results ===
    it('should return partial results when some capabilities fail (T9)', async () => {
      setupProviderAvailable();
      createMockClient({
        findDefinition: jest.fn().mockResolvedValue({
          file: 'src/module.js',
          line: 5,
        }),
        analyzeDependencies: jest.fn().mockRejectedValue(new Error('deps failed')),
      });
      createMockEnricher({
        findTests: jest.fn().mockRejectedValue(new Error('tests failed')),
      });

      const result = await getImplementationContext(['mySymbol']);

      expect(result).not.toBeNull();
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].symbol).toBe('mySymbol');
      expect(result.dependencies).toHaveLength(0); // failed
      expect(result.relatedTests).toHaveLength(0); // failed
    });

    // === T10: getImplementationContext without provider ===
    it('should return null without throw when no provider (T10)', async () => {
      setupProviderUnavailable();

      const result = await getImplementationContext(['anything']);

      expect(result).toBeNull();
    });

    it('should return null for null input', async () => {
      const result = await getImplementationContext(null);

      expect(result).toBeNull();
    });

    it('should return null for empty array', async () => {
      const result = await getImplementationContext([]);

      expect(result).toBeNull();
    });
  });

  // === T11: getImplementationImpact with provider (HIGH blast) ===
  describe('getImplementationImpact', () => {
    it('should return HIGH risk for large blast radius (T11)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: Array.from({ length: 20 }, (_, i) => ({
            file: `src/file${i}.js`,
            line: i,
          })),
          complexity: { average: 7, perFile: [] },
          blastRadius: 20,
        }),
      });

      const result = await getImplementationImpact(['src/core.js']);

      expect(result).not.toBeNull();
      expect(result.blastRadius).toBe(20);
      expect(result.riskLevel).toBe('HIGH');
      expect(result.references).toHaveLength(20);
    });

    // === T12: getImplementationImpact with provider (LOW blast) ===
    it('should return LOW risk for small blast radius (T12)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [{ file: 'src/a.js', line: 1 }, { file: 'src/b.js', line: 2 }],
          complexity: { average: 2, perFile: [] },
          blastRadius: 2,
        }),
      });

      const result = await getImplementationImpact(['src/small.js']);

      expect(result).not.toBeNull();
      expect(result.blastRadius).toBe(2);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should return MEDIUM risk for moderate blast radius', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: Array.from({ length: 10 }, () => ({ file: 'a.js', line: 1 })),
          complexity: { average: 4, perFile: [] },
          blastRadius: 10,
        }),
      });

      const result = await getImplementationImpact(['src/mid.js']);

      expect(result).not.toBeNull();
      expect(result.riskLevel).toBe('MEDIUM');
    });

    // === T13: getImplementationImpact without provider ===
    it('should return null without throw when no provider (T13)', async () => {
      setupProviderUnavailable();

      const result = await getImplementationImpact(['any.js']);

      expect(result).toBeNull();
    });

    it('should return null when assessImpact returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue(null),
      });

      const result = await getImplementationImpact(['empty.js']);

      expect(result).toBeNull();
    });

    it('should return null for null input', async () => {
      const result = await getImplementationImpact(null);

      expect(result).toBeNull();
    });

    it('should return null for empty array', async () => {
      const result = await getImplementationImpact([]);

      expect(result).toBeNull();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await getImplementationImpact(['err.js']);

      expect(result).toBeNull();
    });
  });

  // === T14: All functions fallback (provider unavailable) ===
  describe('All functions fallback (T14)', () => {
    beforeEach(() => {
      setupProviderUnavailable();
    });

    it('all 5 functions return null when no provider', async () => {
      const results = await Promise.all([
        getCodebaseOverview('.'),
        getDependencyGraph('src/'),
        getComplexityAnalysis(['file.js']),
        getImplementationContext(['symbol']),
        getImplementationImpact(['file.js']),
      ]);

      expect(results).toEqual([null, null, null, null, null]);
    });
  });

  // === T15: Input validation ===
  describe('Input validation (T15)', () => {
    it('all functions return null for null/empty input', async () => {
      const results = await Promise.all([
        getCodebaseOverview(null),
        getCodebaseOverview(''),
        getDependencyGraph(null),
        getDependencyGraph(''),
        getComplexityAnalysis(null),
        getComplexityAnalysis([]),
        getImplementationContext(null),
        getImplementationContext([]),
        getImplementationImpact(null),
        getImplementationImpact([]),
      ]);

      results.forEach((result) => {
        expect(result).toBeNull();
      });
    });
  });

  // === Private helpers ===
  describe('_calculateRiskLevel', () => {
    it('should return LOW for 0 refs', () => {
      expect(_calculateRiskLevel(0)).toBe('LOW');
    });

    it('should return LOW for LOW_MAX boundary', () => {
      expect(_calculateRiskLevel(RISK_THRESHOLDS.LOW_MAX)).toBe('LOW');
    });

    it('should return MEDIUM for LOW_MAX + 1', () => {
      expect(_calculateRiskLevel(RISK_THRESHOLDS.LOW_MAX + 1)).toBe('MEDIUM');
    });

    it('should return MEDIUM for MEDIUM_MAX boundary', () => {
      expect(_calculateRiskLevel(RISK_THRESHOLDS.MEDIUM_MAX)).toBe('MEDIUM');
    });

    it('should return HIGH for MEDIUM_MAX + 1', () => {
      expect(_calculateRiskLevel(RISK_THRESHOLDS.MEDIUM_MAX + 1)).toBe('HIGH');
    });
  });

  describe('_buildDependencySummary', () => {
    it('should handle array dependencies', () => {
      const summary = _buildDependencySummary([1, 2, 3]);

      expect(summary.totalDeps).toBe(3);
      expect(summary.depth).toBe('shallow');
    });

    it('should handle object with dependencies array', () => {
      const summary = _buildDependencySummary({
        dependencies: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }],
      });

      expect(summary.totalDeps).toBe(2);
      expect(summary.depth).toBe('shallow');
    });

    it('should handle plain object', () => {
      const deps = { moduleA: {}, moduleB: {}, moduleC: {}, moduleD: {}, moduleE: {} };
      const summary = _buildDependencySummary(deps);

      expect(summary.totalDeps).toBe(5);
      expect(summary.depth).toBe('moderate');
    });

    it('should return deep for many dependencies', () => {
      const deps = Array.from({ length: 20 }, (_, i) => i);
      const summary = _buildDependencySummary(deps);

      expect(summary.totalDeps).toBe(20);
      expect(summary.depth).toBe('deep');
    });

    it('should handle null', () => {
      const summary = _buildDependencySummary(null);

      expect(summary.totalDeps).toBe(0);
      expect(summary.depth).toBe('none');
    });
  });

  // === RISK_THRESHOLDS exported ===
  describe('RISK_THRESHOLDS', () => {
    it('should export consistent thresholds with dev-helper and qa-helper', () => {
      expect(RISK_THRESHOLDS.LOW_MAX).toBe(4);
      expect(RISK_THRESHOLDS.MEDIUM_MAX).toBe(15);
    });
  });
});
