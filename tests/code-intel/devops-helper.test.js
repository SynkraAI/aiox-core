'use strict';

const {
  assessPrePushImpact,
  generateImpactSummary,
  classifyRiskLevel,
  _formatImpactReport,
} = require('../../.aios-core/core/code-intel/helpers/devops-helper');

// Mock the code-intel module
jest.mock('../../.aios-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(),
  getEnricher: jest.fn(),
}));

const {
  isCodeIntelAvailable,
  getEnricher,
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
    ...overrides,
  };
  getEnricher.mockReturnValue(enricher);
  return enricher;
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DevOpsHelper', () => {
  // === T1: assessPrePushImpact with provider — impact found ===
  describe('assessPrePushImpact', () => {
    it('should return impact, riskLevel, and report when impact found (T1)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [
            { file: 'src/auth/login.js', line: 10, context: 'login' },
            { file: 'src/auth/session.js', line: 5, context: 'session' },
            { file: 'src/utils/helper.js', line: 1, context: 'helper' },
          ],
          complexity: { average: 4.5, perFile: [] },
          blastRadius: 3,
        }),
      });

      const result = await assessPrePushImpact(['src/auth/login.js', 'src/auth/session.js']);

      expect(result).not.toBeNull();
      expect(result.impact).not.toBeNull();
      expect(result.impact.blastRadius).toBe(3);
      expect(result.riskLevel).toBe('LOW');
      expect(result.report).toContain('Impact Analysis');
      expect(result.report).toContain('3 files affected');
      expect(result.report).toContain('LOW');
    });

    // === T2: assessPrePushImpact with provider — no impact ===
    it('should return LOW risk with null impact when assessImpact returns null (T2)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue(null),
      });

      const result = await assessPrePushImpact(['src/unknown.js']);

      expect(result).not.toBeNull();
      expect(result.impact).toBeNull();
      expect(result.riskLevel).toBe('LOW');
      expect(result.report).toContain('No impact data available');
    });

    // === T3: assessPrePushImpact without provider ===
    it('should return null without provider (T3)', async () => {
      setupProviderUnavailable();

      const result = await assessPrePushImpact(['src/auth/login.js']);

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await assessPrePushImpact(['src/auth/login.js']);

      expect(result).toBeNull();
    });

    it('should include HIGH risk warning in report when blastRadius > 15', async () => {
      setupProviderAvailable();
      const refs = Array.from({ length: 20 }, (_, i) => ({
        file: `src/file${i}.js`,
        line: i,
        context: `file ${i}`,
      }));
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: refs,
          complexity: { average: 7.2, perFile: [] },
          blastRadius: 20,
        }),
      });

      const result = await assessPrePushImpact(['src/main.js']);

      expect(result.riskLevel).toBe('HIGH');
      expect(result.report).toContain('HIGH RISK');
      expect(result.report).toContain('20 files affected');
      expect(result.report).toContain('Confirm push?');
    });
  });

  // === T4: generateImpactSummary with provider — with test coverage ===
  describe('generateImpactSummary', () => {
    it('should return summary and testCoverage when both available (T4)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [
            { file: 'src/auth/login.js', line: 10, context: 'login' },
          ],
          complexity: { average: 3.0, perFile: [] },
          blastRadius: 1,
        }),
        findTests: jest.fn().mockResolvedValue([
          { file: 'tests/auth/login.test.js', line: 1, context: 'login test' },
        ]),
      });

      const result = await generateImpactSummary(['src/auth/login.js']);

      expect(result).not.toBeNull();
      expect(result.summary).toContain('Blast Radius');
      expect(result.summary).toContain('1 files affected');
      expect(result.summary).toContain('LOW');
      expect(result.summary).toContain('1 test file(s) found');
      expect(result.testCoverage).toHaveLength(1);
    });

    // === T5: generateImpactSummary with provider — no test coverage ===
    it('should return partial result when findTests returns null (T5)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [
            { file: 'src/utils/helper.js', line: 1, context: 'helper' },
          ],
          complexity: { average: 2.0, perFile: [] },
          blastRadius: 1,
        }),
        findTests: jest.fn().mockResolvedValue(null),
      });

      const result = await generateImpactSummary(['src/utils/helper.js']);

      expect(result).not.toBeNull();
      expect(result.summary).toContain('No related tests found');
      expect(result.testCoverage).toBeNull();
    });

    // === T6: generateImpactSummary without provider ===
    it('should return null without provider (T6)', async () => {
      setupProviderUnavailable();

      const result = await generateImpactSummary(['src/auth/login.js']);

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null when assessImpact returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue(null),
      });

      const result = await generateImpactSummary(['src/unknown.js']);

      expect(result).toBeNull();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await generateImpactSummary(['src/auth/login.js']);

      expect(result).toBeNull();
    });

    it('should handle findTests throwing gracefully (partial result)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        assessImpact: jest.fn().mockResolvedValue({
          references: [{ file: 'src/a.js', line: 1, context: 'a' }],
          complexity: { average: 1.0, perFile: [] },
          blastRadius: 1,
        }),
        findTests: jest.fn().mockRejectedValue(new Error('findTests failed')),
      });

      const result = await generateImpactSummary(['src/a.js']);

      expect(result).not.toBeNull();
      expect(result.testCoverage).toBeNull();
      expect(result.summary).toContain('No related tests found');
    });
  });

  // === T7, T8, T9: classifyRiskLevel ===
  describe('classifyRiskLevel', () => {
    it('should return LOW for blastRadius <= 5 (T7)', () => {
      expect(classifyRiskLevel(0)).toBe('LOW');
      expect(classifyRiskLevel(1)).toBe('LOW');
      expect(classifyRiskLevel(5)).toBe('LOW');
    });

    it('should return MEDIUM for blastRadius 6-15 (T8)', () => {
      expect(classifyRiskLevel(6)).toBe('MEDIUM');
      expect(classifyRiskLevel(10)).toBe('MEDIUM');
      expect(classifyRiskLevel(15)).toBe('MEDIUM');
    });

    it('should return HIGH for blastRadius > 15 (T9)', () => {
      expect(classifyRiskLevel(16)).toBe('HIGH');
      expect(classifyRiskLevel(50)).toBe('HIGH');
      expect(classifyRiskLevel(100)).toBe('HIGH');
    });

    it('should return LOW for null/undefined/NaN', () => {
      expect(classifyRiskLevel(null)).toBe('LOW');
      expect(classifyRiskLevel(undefined)).toBe('LOW');
      expect(classifyRiskLevel(NaN)).toBe('LOW');
    });
  });

  // === T10: All functions fallback simultaneously ===
  describe('fallback behavior (all functions)', () => {
    it('should return null for async functions when provider unavailable (T10)', async () => {
      setupProviderUnavailable();

      const [prePush, summary] = await Promise.all([
        assessPrePushImpact(['src/test.js']),
        generateImpactSummary(['src/test.js']),
      ]);

      expect(prePush).toBeNull();
      expect(summary).toBeNull();

      // Verify no enricher calls were made
      expect(getEnricher).not.toHaveBeenCalled();
    });
  });

  // === T11: Input validation — null/empty ===
  describe('input validation', () => {
    it('should return null for null input on async functions (T11)', async () => {
      setupProviderAvailable();

      const [prePush, summary] = await Promise.all([
        assessPrePushImpact(null),
        generateImpactSummary(null),
      ]);

      expect(prePush).toBeNull();
      expect(summary).toBeNull();
    });

    it('should return null for empty array input on async functions (T11)', async () => {
      setupProviderAvailable();

      const [prePush, summary] = await Promise.all([
        assessPrePushImpact([]),
        generateImpactSummary([]),
      ]);

      expect(prePush).toBeNull();
      expect(summary).toBeNull();
    });

    it('should return null for undefined input on async functions', async () => {
      setupProviderAvailable();

      const [prePush, summary] = await Promise.all([
        assessPrePushImpact(undefined),
        generateImpactSummary(undefined),
      ]);

      expect(prePush).toBeNull();
      expect(summary).toBeNull();
    });
  });

  // === _formatImpactReport ===
  describe('_formatImpactReport', () => {
    it('should format report with impact data', () => {
      const impact = {
        references: [
          { file: 'src/auth/login.js' },
          { file: 'src/auth/session.js' },
        ],
        complexity: { average: 4.5 },
        blastRadius: 2,
      };

      const report = _formatImpactReport(impact, 'LOW');

      expect(report).toContain('Impact Analysis');
      expect(report).toContain('2 files affected');
      expect(report).toContain('LOW');
      expect(report).toContain('4.5');
      expect(report).toContain('src/auth/login.js');
      expect(report).toContain('src/auth/session.js');
      expect(report).not.toContain('HIGH RISK');
    });

    it('should include HIGH RISK warning for HIGH risk level', () => {
      const impact = {
        references: Array.from({ length: 20 }, (_, i) => ({ file: `file${i}.js` })),
        complexity: { average: 8.0 },
        blastRadius: 20,
      };

      const report = _formatImpactReport(impact, 'HIGH');

      expect(report).toContain('HIGH RISK');
      expect(report).toContain('20 files affected');
      expect(report).toContain('Confirm push?');
    });

    it('should limit to 10 files in report', () => {
      const impact = {
        references: Array.from({ length: 15 }, (_, i) => ({ file: `file${i}.js` })),
        complexity: { average: 5.0 },
        blastRadius: 15,
      };

      const report = _formatImpactReport(impact, 'MEDIUM');

      expect(report).toContain('file0.js');
      expect(report).toContain('file9.js');
      expect(report).not.toContain('file10.js');
    });

    it('should handle null impact gracefully', () => {
      const report = _formatImpactReport(null, 'LOW');

      expect(report).toContain('No impact data available');
    });

    it('should handle impact without complexity', () => {
      const impact = {
        references: [{ file: 'src/a.js' }],
        complexity: null,
        blastRadius: 1,
      };

      const report = _formatImpactReport(impact, 'LOW');

      expect(report).toContain('N/A');
    });

    it('should handle references with path instead of file', () => {
      const impact = {
        references: [{ path: 'src/utils/helper.js' }],
        complexity: { average: 1.0 },
        blastRadius: 1,
      };

      const report = _formatImpactReport(impact, 'LOW');

      expect(report).toContain('src/utils/helper.js');
    });
  });
});
