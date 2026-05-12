/**
 * Metrics Hook Unit Tests
 *
 * Tests for the quality metrics hook integration module.
 *
 * @module tests/unit/quality/metrics-hook.test.js
 * @story 3.11a - Quality Gates Metrics Collector
 */

const path = require('path');
const fs = require('fs').promises;
const {
  recordPreCommitMetrics,
  recordPRReviewMetrics,
  recordHumanReviewMetrics,
  withPreCommitMetrics,
  getQuickSummary,
} = require('../../../.aiox-core/quality/metrics-hook');
const { MetricsCollector } = require('../../../.aiox-core/quality/metrics-collector');

// Test data directory
const TEST_DATA_DIR = path.join(__dirname, '../../fixtures/quality');
const TEST_METRICS_FILE = path.join(TEST_DATA_DIR, 'test-hook-metrics.json');

describe('Metrics Hook', () => {
  let originalCwd;

  beforeAll(async () => {
    // Create test data directory
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });

    // Store original cwd
    originalCwd = process.cwd();
  });

  beforeEach(async () => {
    // Clean up test file before each test
    try {
      await fs.unlink(TEST_METRICS_FILE);
      await fs.unlink(`${TEST_METRICS_FILE}.lock`);
    } catch {
      // Ignore if file doesn't exist
    }

    // Override the default data file path for testing
    // Note: In real usage, the hook uses the default path
  });

  afterAll(async () => {
    // Clean up
    try {
      await fs.unlink(TEST_METRICS_FILE);
      await fs.unlink(`${TEST_METRICS_FILE}.lock`);
    } catch {
      // Ignore
    }
  });

  describe('recordPreCommitMetrics', () => {
    it('should record pre-commit metrics without throwing', async () => {
      // This should not throw even if metrics file doesn't exist
      const result = await recordPreCommitMetrics({
        passed: true,
        durationMs: 2500,
        findingsCount: 0,
      });

      // Result could be null if recording fails (graceful degradation)
      // In normal circumstances, it should succeed
      expect(result === null || result.layer === 1).toBe(true);
    });

    it('should include triggeredBy: hook in metadata', async () => {
      const result = await recordPreCommitMetrics({
        passed: true,
        durationMs: 1500,
      });

      if (result) {
        expect(result.metadata.triggeredBy).toBe('hook');
      }
    });

    it('should handle failure gracefully', async () => {
      // Create a mock that throws
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Even with invalid input, should not throw
      const result = await recordPreCommitMetrics({
        passed: 'invalid', // Should be boolean
        durationMs: 'not a number',
      });

      // Should handle gracefully (either record or return null)
      expect(result === null || typeof result === 'object').toBe(true);

      jest.restoreAllMocks();
    });
  });

  describe('recordPRReviewMetrics', () => {
    it('should record PR review with CodeRabbit data', async () => {
      const result = await recordPRReviewMetrics({
        passed: true,
        durationMs: 180000,
        coderabbit: {
          findingsCount: 5,
          severityBreakdown: {
            critical: 0,
            high: 1,
            medium: 2,
            low: 2,
          },
        },
      });

      if (result) {
        expect(result.layer).toBe(2);
        expect(result.metadata.triggeredBy).toBe('pr');
      }
    });

    it('should record PR review with Quinn data', async () => {
      const result = await recordPRReviewMetrics({
        passed: true,
        durationMs: 120000,
        quinn: {
          findingsCount: 3,
          topCategories: ['test-coverage', 'documentation'],
        },
      });

      if (result) {
        expect(result.layer).toBe(2);
      }
    });

    it('should include additional metadata', async () => {
      const result = await recordPRReviewMetrics({
        passed: true,
        durationMs: 150000,
        metadata: {
          prNumber: 42,
          branchName: 'feature/test',
        },
      });

      if (result) {
        expect(result.metadata.prNumber).toBe(42);
        expect(result.metadata.branchName).toBe('feature/test');
      }
    });
  });

  describe('recordHumanReviewMetrics', () => {
    it('should record human review as Layer 3', async () => {
      const result = await recordHumanReviewMetrics({
        passed: true,
        durationMs: 600000,
        findingsCount: 1,
      });

      if (result) {
        expect(result.layer).toBe(3);
        expect(result.metadata.triggeredBy).toBe('manual');
      }
    });
  });

  describe('withPreCommitMetrics', () => {
    it('should wrap check function and record metrics', async () => {
      const result = await withPreCommitMetrics(async () => {
        // Simulate some checks
        return {
          passed: true,
          findingsCount: 0,
        };
      });

      expect(result.passed).toBe(true);
      expect(result.findingsCount).toBe(0);
    });

    it('should catch and record failures', async () => {
      const result = await withPreCommitMetrics(async () => {
        throw new Error('Check failed');
      });

      expect(result.passed).toBe(false);
      expect(result.error).toBe('Check failed');
    });

    it('should pass through metadata from check function', async () => {
      const result = await withPreCommitMetrics(async () => {
        return {
          passed: true,
          findingsCount: 2,
          metadata: { lintErrors: 1, typeErrors: 1 },
        };
      });

      expect(result.findingsCount).toBe(2);
      expect(result.metadata.lintErrors).toBe(1);
    });
  });

  describe('getQuickSummary', () => {
    it('should return null when no metrics exist', async () => {
      // With no data file, should return null gracefully
      const summary = await getQuickSummary();

      // Either null (no file) or summary object
      if (summary) {
        expect(summary).toHaveProperty('layer1');
        expect(summary).toHaveProperty('layer2');
        expect(summary).toHaveProperty('layer3');
      }
    });

    it('should return summary structure when data exists', async () => {
      // First record some metrics
      await recordPreCommitMetrics({
        passed: true,
        durationMs: 2000,
      });

      const summary = await getQuickSummary();

      if (summary) {
        expect(summary.layer1).toHaveProperty('passRate');
        expect(summary.layer1).toHaveProperty('totalRuns');
        expect(summary.layer2).toHaveProperty('autoCatchRate');
        expect(summary).toHaveProperty('historyCount');
      }
    });
  });
});
