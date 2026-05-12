'use strict';

const {
  checkBeforeWriting,
  suggestReuse,
  getConventionsForPath,
  assessRefactoringImpact,
  _formatSuggestion,
  _calculateRiskLevel,
  RISK_THRESHOLDS,
} = require('../../.aiox-core/core/code-intel/helpers/dev-helper');

// Mock the code-intel module
jest.mock('../../.aiox-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(),
  getEnricher: jest.fn(),
  getClient: jest.fn(),
}));

const {
  isCodeIntelAvailable,
  getEnricher,
  getClient,
} = require('../../.aiox-core/core/code-intel/index');

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
    findCallers: jest.fn().mockResolvedValue(null),
    findCallees: jest.fn().mockResolvedValue(null),
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

describe('DevHelper', () => {
  // === T1: checkBeforeWriting with provider (match found) ===
  describe('checkBeforeWriting', () => {
    it('should return duplicates and suggestion when matches found (T1)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [{ file: 'src/utils/helper.js', line: 10, context: 'function helper()' }],
          codebaseOverview: {},
        }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/index.js', line: 5, context: 'require(helper)' },
        ]),
      });

      const result = await checkBeforeWriting('helper.js', 'utility helper function');

      expect(result).not.toBeNull();
      expect(result.duplicates.matches).toHaveLength(1);
      expect(result.references).toHaveLength(1);
      expect(result.suggestion).toContain('REUSE');
      expect(result.suggestion).toContain('IDS Article IV-A');
    });

    // === T2: checkBeforeWriting with provider (no match) ===
    it('should return null when no matches found (T2)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({ matches: [], codebaseOverview: {} }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([]),
      });

      const result = await checkBeforeWriting('brand-new-module.js', 'completely new thing');

      expect(result).toBeNull();
    });

    // === T3: checkBeforeWriting without provider ===
    it('should return null without throw when no provider (T3)', async () => {
      setupProviderUnavailable();

      const result = await checkBeforeWriting('test.js', 'some description');

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null if enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockRejectedValue(new Error('provider error')),
      });
      createMockClient();

      const result = await checkBeforeWriting('test.js', 'desc');

      expect(result).toBeNull();
    });
  });

  // === T4: suggestReuse finds existing definition ===
  describe('suggestReuse', () => {
    it('should return REUSE suggestion when symbol has many references (T4)', async () => {
      setupProviderAvailable();
      createMockClient({
        findDefinition: jest.fn().mockResolvedValue({
          file: 'src/core/parser.js',
          line: 42,
          column: 0,
          context: 'function parseConfig()',
        }),
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/a.js', line: 1 },
          { file: 'src/b.js', line: 2 },
          { file: 'src/c.js', line: 3 },
          { file: 'src/d.js', line: 4 },
        ]),
      });

      const result = await suggestReuse('parseConfig');

      expect(result).not.toBeNull();
      expect(result.file).toBe('src/core/parser.js');
      expect(result.line).toBe(42);
      expect(result.references).toBe(4);
      expect(result.suggestion).toBe('REUSE');
    });

    it('should return ADAPT suggestion when symbol has few references', async () => {
      setupProviderAvailable();
      createMockClient({
        findDefinition: jest.fn().mockResolvedValue({
          file: 'src/old.js',
          line: 10,
        }),
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/old.js', line: 10 },
        ]),
      });

      const result = await suggestReuse('oldHelper');

      expect(result).not.toBeNull();
      expect(result.suggestion).toBe('ADAPT');
    });

    // === T5: suggestReuse no match ===
    it('should return null when symbol not found (T5)', async () => {
      setupProviderAvailable();
      createMockClient({
        findDefinition: jest.fn().mockResolvedValue(null),
        findReferences: jest.fn().mockResolvedValue([]),
      });

      const result = await suggestReuse('nonExistentSymbol');

      expect(result).toBeNull();
    });

    it('should return null without throw when no provider', async () => {
      setupProviderUnavailable();

      const result = await suggestReuse('anything');

      expect(result).toBeNull();
    });
  });

  // === T6: assessRefactoringImpact with blast radius ===
  describe('assessRefactoringImpact', () => {
    it('should return blast radius and risk level (T6)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: Array.from({ length: 20 }, (_, i) => ({
            file: `src/file${i}.js`,
            line: i,
          })),
          complexity: { average: 5.2, perFile: [] },
          blastRadius: 20,
        }),
      });

      const result = await assessRefactoringImpact(['src/target.js']);

      expect(result).not.toBeNull();
      expect(result.blastRadius).toBe(20);
      expect(result.riskLevel).toBe('HIGH');
      expect(result.references).toHaveLength(20);
      expect(result.complexity).toBeDefined();
    });

    it('should return LOW risk for small blast radius', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [{ file: 'a.js', line: 1 }],
          complexity: { average: 1, perFile: [] },
          blastRadius: 1,
        }),
      });

      const result = await assessRefactoringImpact(['src/small.js']);

      expect(result.riskLevel).toBe('LOW');
    });

    it('should return MEDIUM risk for moderate blast radius', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: Array.from({ length: 10 }, () => ({ file: 'a.js', line: 1 })),
          complexity: { average: 3, perFile: [] },
          blastRadius: 10,
        }),
      });

      const result = await assessRefactoringImpact(['src/mid.js']);

      expect(result.riskLevel).toBe('MEDIUM');
    });

    // === T7: assessRefactoringImpact without provider ===
    it('should return null without throw when no provider (T7)', async () => {
      setupProviderUnavailable();

      const result = await assessRefactoringImpact(['any.js']);

      expect(result).toBeNull();
    });

    it('should return null when assessImpact returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue(null),
      });

      const result = await assessRefactoringImpact(['empty.js']);

      expect(result).toBeNull();
    });
  });

  // === T8: getConventionsForPath returns patterns ===
  describe('getConventionsForPath', () => {
    it('should return patterns and stats (T8)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        getConventions: jest.fn().mockResolvedValue({
          patterns: ['kebab-case files', 'CommonJS modules', 'JSDoc comments'],
          stats: { files: 120, languages: ['javascript'] },
        }),
      });

      const result = await getConventionsForPath('src/');

      expect(result).not.toBeNull();
      expect(result.patterns).toHaveLength(3);
      expect(result.stats.files).toBe(120);
    });

    it('should return null without throw when no provider', async () => {
      setupProviderUnavailable();

      const result = await getConventionsForPath('src/');

      expect(result).toBeNull();
    });
  });

  // === T9: All functions fallback (provider unavailable) ===
  describe('All functions fallback (T9)', () => {
    beforeEach(() => {
      setupProviderUnavailable();
    });

    it('all 4 functions return null when no provider', async () => {
      const results = await Promise.all([
        checkBeforeWriting('file.js', 'desc'),
        suggestReuse('symbol'),
        getConventionsForPath('src/'),
        assessRefactoringImpact(['file.js']),
      ]);

      expect(results).toEqual([null, null, null, null]);
    });
  });

  // === Private helpers ===
  describe('_calculateRiskLevel', () => {
    it('should return LOW for 0 refs', () => {
      expect(_calculateRiskLevel(0)).toBe('LOW');
    });

    it('should return LOW for threshold boundary', () => {
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

  describe('_formatSuggestion', () => {
    it('should format with both duplicates and refs', () => {
      const msg = _formatSuggestion(
        { matches: [{ file: 'a.js', line: 1 }] },
        [{ file: 'b.js', line: 2 }]
      );

      expect(msg).toContain('1 similar match');
      expect(msg).toContain('a.js:1');
      expect(msg).toContain('1 location');
      expect(msg).toContain('IDS Article IV-A');
    });

    it('should format with only duplicates', () => {
      const msg = _formatSuggestion(
        { matches: [{ file: 'a.js' }] },
        null
      );

      expect(msg).toContain('1 similar match');
      expect(msg).toContain('IDS Article IV-A');
    });

    it('should format with only refs', () => {
      const msg = _formatSuggestion(null, [{ file: 'b.js', line: 5 }]);

      expect(msg).toContain('1 location');
      expect(msg).toContain('b.js:5');
    });
  });
});
