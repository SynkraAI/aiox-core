'use strict';

const {
  getBlastRadius,
  getTestCoverage,
  getReferenceImpact,
  suggestGateInfluence,
  _calculateRiskLevel,
  _calculateCoverageStatus,
  RISK_THRESHOLDS,
  COVERAGE_THRESHOLDS,
} = require('../../.aios-core/core/code-intel/helpers/qa-helper');

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
    assessImpact: jest.fn().mockResolvedValue(null),
    findTests: jest.fn().mockResolvedValue(null),
    detectDuplicates: jest.fn().mockResolvedValue(null),
    getConventions: jest.fn().mockResolvedValue(null),
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

describe('QaHelper', () => {
  // === T1: getBlastRadius with provider (HIGH blast) ===
  describe('getBlastRadius', () => {
    it('should return HIGH risk for blast radius > 15 (T1)', async () => {
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

      const result = await getBlastRadius(['src/target.js']);

      expect(result).not.toBeNull();
      expect(result.blastRadius).toBe(20);
      expect(result.riskLevel).toBe('HIGH');
      expect(result.references).toHaveLength(20);
    });

    // === T2: getBlastRadius with provider (LOW blast) ===
    it('should return LOW risk for blast radius <= 4 (T2)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [{ file: 'a.js', line: 1 }, { file: 'b.js', line: 2 }],
          complexity: { average: 1, perFile: [] },
          blastRadius: 2,
        }),
      });

      const result = await getBlastRadius(['src/small.js']);

      expect(result).not.toBeNull();
      expect(result.blastRadius).toBe(2);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should return MEDIUM risk for blast radius 5-15', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: Array.from({ length: 10 }, () => ({ file: 'a.js', line: 1 })),
          complexity: { average: 3, perFile: [] },
          blastRadius: 10,
        }),
      });

      const result = await getBlastRadius(['src/mid.js']);

      expect(result.riskLevel).toBe('MEDIUM');
    });

    // === T3: getBlastRadius without provider ===
    it('should return null without throw when no provider (T3)', async () => {
      setupProviderUnavailable();

      const result = await getBlastRadius(['any.js']);

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null when assessImpact returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue(null),
      });

      const result = await getBlastRadius(['empty.js']);

      expect(result).toBeNull();
    });

    it('should return null for empty files array', async () => {
      setupProviderAvailable();

      const result = await getBlastRadius([]);

      expect(result).toBeNull();
    });

    it('should return null for null files', async () => {
      const result = await getBlastRadius(null);

      expect(result).toBeNull();
    });

    it('should return null if enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await getBlastRadius(['fail.js']);

      expect(result).toBeNull();
    });
  });

  // === T4: getTestCoverage with provider (function with tests) ===
  describe('getTestCoverage', () => {
    it('should return GOOD status for symbol with >5 test refs (T4)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        findTests: jest.fn().mockResolvedValue(
          Array.from({ length: 8 }, (_, i) => ({
            file: `tests/test${i}.test.js`,
            line: i * 10,
            context: `test case ${i}`,
          })),
        ),
      });

      const result = await getTestCoverage(['myFunction']);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('myFunction');
      expect(result[0].status).toBe('GOOD');
      expect(result[0].testCount).toBe(8);
    });

    // === T5: getTestCoverage with provider (function without tests) ===
    it('should return NO_TESTS status for symbol with 0 test refs (T5)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        findTests: jest.fn().mockResolvedValue([]),
      });

      const result = await getTestCoverage(['untested']);

      expect(result).not.toBeNull();
      expect(result[0].status).toBe('NO_TESTS');
      expect(result[0].testCount).toBe(0);
    });

    it('should return INDIRECT status for 1-2 test refs', async () => {
      setupProviderAvailable();
      createMockEnricher({
        findTests: jest.fn().mockResolvedValue([
          { file: 'tests/a.test.js', line: 1 },
        ]),
      });

      const result = await getTestCoverage(['indirectlyTested']);

      expect(result[0].status).toBe('INDIRECT');
      expect(result[0].testCount).toBe(1);
    });

    it('should return MINIMAL status for 3-5 test refs', async () => {
      setupProviderAvailable();
      createMockEnricher({
        findTests: jest.fn().mockResolvedValue(
          Array.from({ length: 4 }, (_, i) => ({
            file: `tests/t${i}.test.js`,
            line: i,
          })),
        ),
      });

      const result = await getTestCoverage(['partiallyTested']);

      expect(result[0].status).toBe('MINIMAL');
      expect(result[0].testCount).toBe(4);
    });

    it('should handle multiple symbols', async () => {
      setupProviderAvailable();
      const enricher = createMockEnricher();
      enricher.findTests
        .mockResolvedValueOnce(Array.from({ length: 6 }, () => ({ file: 'test.js', line: 1 })))
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ file: 'test.js', line: 1 }]);

      const result = await getTestCoverage(['funcA', 'funcB', 'funcC']);

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('GOOD');
      expect(result[1].status).toBe('NO_TESTS');
      expect(result[2].status).toBe('INDIRECT');
    });

    // === T6: getTestCoverage without provider ===
    it('should return null without throw when no provider (T6)', async () => {
      setupProviderUnavailable();

      const result = await getTestCoverage(['anything']);

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null for empty symbols array', async () => {
      setupProviderAvailable();

      const result = await getTestCoverage([]);

      expect(result).toBeNull();
    });

    it('should return null for null symbols', async () => {
      const result = await getTestCoverage(null);

      expect(result).toBeNull();
    });

    it('should handle findTests returning null for a symbol', async () => {
      setupProviderAvailable();
      createMockEnricher({
        findTests: jest.fn().mockResolvedValue(null),
      });

      const result = await getTestCoverage(['noData']);

      expect(result[0].status).toBe('NO_TESTS');
      expect(result[0].testCount).toBe(0);
    });
  });

  // === T7: getReferenceImpact with provider (consumers found) ===
  describe('getReferenceImpact', () => {
    it('should return consumers for each file (T7)', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/consumer1.js', line: 10, context: 'require(target)' },
          { file: 'src/consumer2.js', line: 20, context: 'import target' },
        ]),
      });

      const result = await getReferenceImpact(['src/target.js']);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].file).toBe('src/target.js');
      expect(result[0].consumers).toHaveLength(2);
    });

    it('should handle multiple files', async () => {
      setupProviderAvailable();
      const client = createMockClient();
      client.findReferences
        .mockResolvedValueOnce([{ file: 'a.js', line: 1 }])
        .mockResolvedValueOnce([{ file: 'b.js', line: 2 }, { file: 'c.js', line: 3 }]);

      const result = await getReferenceImpact(['file1.js', 'file2.js']);

      expect(result).toHaveLength(2);
      expect(result[0].consumers).toHaveLength(1);
      expect(result[1].consumers).toHaveLength(2);
    });

    it('should return empty consumers when no references found', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue(null),
      });

      const result = await getReferenceImpact(['isolated.js']);

      expect(result[0].consumers).toEqual([]);
    });

    // === T8: getReferenceImpact without provider ===
    it('should return null without throw when no provider (T8)', async () => {
      setupProviderUnavailable();

      const result = await getReferenceImpact(['any.js']);

      expect(result).toBeNull();
      expect(getClient).not.toHaveBeenCalled();
    });

    it('should return null for empty files array', async () => {
      setupProviderAvailable();

      const result = await getReferenceImpact([]);

      expect(result).toBeNull();
    });

    it('should return empty consumers if client throws for individual file', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockRejectedValue(new Error('client error')),
      });

      const result = await getReferenceImpact(['fail.js']);

      expect(result).not.toBeNull();
      expect(result[0].file).toBe('fail.js');
      expect(result[0].consumers).toEqual([]);
    });
  });

  // === T9: suggestGateInfluence with HIGH risk ===
  describe('suggestGateInfluence', () => {
    it('should return CONCERNS advisory for HIGH risk (T9)', () => {
      const result = suggestGateInfluence('HIGH');

      expect(result).not.toBeNull();
      expect(result.advisory).toContain('HIGH blast radius');
      expect(result.advisory).toContain('CONCERNS');
      expect(result.suggestedGate).toBe('CONCERNS');
    });

    // === T10: suggestGateInfluence with LOW risk ===
    it('should return null for LOW risk (T10)', () => {
      const result = suggestGateInfluence('LOW');

      expect(result).toBeNull();
    });

    it('should return null for MEDIUM risk', () => {
      const result = suggestGateInfluence('MEDIUM');

      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = suggestGateInfluence(null);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = suggestGateInfluence(undefined);

      expect(result).toBeNull();
    });
  });

  // === T11: All functions fallback (provider unavailable) ===
  describe('All functions fallback (T11)', () => {
    beforeEach(() => {
      setupProviderUnavailable();
    });

    it('all 4 functions return null when no provider', async () => {
      const results = await Promise.all([
        getBlastRadius(['file.js']),
        getTestCoverage(['symbol']),
        getReferenceImpact(['file.js']),
      ]);

      // suggestGateInfluence is sync and doesn't depend on provider
      const syncResult = suggestGateInfluence('LOW');

      expect(results).toEqual([null, null, null]);
      expect(syncResult).toBeNull();
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

  describe('_calculateCoverageStatus', () => {
    it('should return NO_TESTS for 0', () => {
      expect(_calculateCoverageStatus(0)).toBe('NO_TESTS');
    });

    it('should return INDIRECT for 1', () => {
      expect(_calculateCoverageStatus(1)).toBe('INDIRECT');
    });

    it('should return INDIRECT for INDIRECT_MAX boundary', () => {
      expect(_calculateCoverageStatus(COVERAGE_THRESHOLDS.INDIRECT_MAX)).toBe('INDIRECT');
    });

    it('should return MINIMAL for INDIRECT_MAX + 1', () => {
      expect(_calculateCoverageStatus(COVERAGE_THRESHOLDS.INDIRECT_MAX + 1)).toBe('MINIMAL');
    });

    it('should return MINIMAL for MINIMAL_MAX boundary', () => {
      expect(_calculateCoverageStatus(COVERAGE_THRESHOLDS.MINIMAL_MAX)).toBe('MINIMAL');
    });

    it('should return GOOD for MINIMAL_MAX + 1', () => {
      expect(_calculateCoverageStatus(COVERAGE_THRESHOLDS.MINIMAL_MAX + 1)).toBe('GOOD');
    });
  });
});
