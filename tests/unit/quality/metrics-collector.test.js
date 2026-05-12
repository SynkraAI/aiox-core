/**
 * MetricsCollector Unit Tests
 *
 * Tests for the quality gate metrics collector module.
 *
 * @module tests/unit/quality/metrics-collector.test.js
 * @story 3.11a - Quality Gates Metrics Collector
 */

const path = require('path');
const fs = require('fs').promises;
const {
  MetricsCollector,
  createEmptyMetrics,
  DEFAULT_RETENTION_DAYS,
} = require('../../../.aiox-core/quality/metrics-collector');

// Test data directory
const TEST_DATA_DIR = path.join(__dirname, '../../fixtures/quality');
const TEST_METRICS_FILE = path.join(TEST_DATA_DIR, 'test-metrics.json');

describe('MetricsCollector', () => {
  let collector;

  beforeAll(async () => {
    // Create test data directory
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  beforeEach(async () => {
    // Clean up test file before each test
    try {
      await fs.unlink(TEST_METRICS_FILE);
      await fs.unlink(`${TEST_METRICS_FILE}.lock`);
    } catch {
      // Ignore if file doesn't exist
    }

    collector = new MetricsCollector({
      dataFile: TEST_METRICS_FILE,
      retentionDays: 30,
    });
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.unlink(TEST_METRICS_FILE);
      await fs.unlink(`${TEST_METRICS_FILE}.lock`);
    } catch {
      // Ignore
    }
  });

  describe('createEmptyMetrics', () => {
    it('should create valid empty metrics structure', () => {
      const metrics = createEmptyMetrics();

      expect(metrics).toHaveProperty('version', '1.0');
      expect(metrics).toHaveProperty('lastUpdated');
      expect(metrics).toHaveProperty('retentionDays', DEFAULT_RETENTION_DAYS);
      expect(metrics).toHaveProperty('layers');
      expect(metrics).toHaveProperty('trends');
      expect(metrics).toHaveProperty('history');

      // Check layer structure
      expect(metrics.layers).toHaveProperty('layer1');
      expect(metrics.layers).toHaveProperty('layer2');
      expect(metrics.layers).toHaveProperty('layer3');

      // Check layer1 structure
      expect(metrics.layers.layer1).toHaveProperty('passRate', 0);
      expect(metrics.layers.layer1).toHaveProperty('avgTimeMs', 0);
      expect(metrics.layers.layer1).toHaveProperty('totalRuns', 0);

      // Check layer2 specific fields
      expect(metrics.layers.layer2).toHaveProperty('autoCatchRate', 0);
      expect(metrics.layers.layer2).toHaveProperty('coderabbit');
      expect(metrics.layers.layer2).toHaveProperty('quinn');
    });
  });

  describe('load/save', () => {
    it('should create empty metrics on first load', async () => {
      const metrics = await collector.load();

      expect(metrics.version).toBe('1.0');
      expect(metrics.history).toEqual([]);
    });

    it('should save and load metrics correctly', async () => {
      await collector.load();
      await collector.recordRun(1, { passed: true, durationMs: 1000 });

      // Create new collector instance
      const newCollector = new MetricsCollector({
        dataFile: TEST_METRICS_FILE,
      });
      const loadedMetrics = await newCollector.load();

      expect(loadedMetrics.history.length).toBe(1);
      expect(loadedMetrics.history[0].passed).toBe(true);
    });
  });

  describe('recordRun', () => {
    it('should record Layer 1 pre-commit run', async () => {
      const run = await collector.recordRun(1, {
        passed: true,
        durationMs: 3200,
        findingsCount: 0,
      });

      expect(run.layer).toBe(1);
      expect(run.passed).toBe(true);
      expect(run.durationMs).toBe(3200);
      expect(run.findingsCount).toBe(0);
      expect(run.timestamp).toBeDefined();
    });

    it('should record Layer 2 PR review run', async () => {
      const run = await collector.recordRun(2, {
        passed: false,
        durationMs: 120000,
        findingsCount: 5,
      });

      expect(run.layer).toBe(2);
      expect(run.passed).toBe(false);
      expect(run.findingsCount).toBe(5);
    });

    it('should record Layer 3 human review run', async () => {
      const run = await collector.recordRun(3, {
        passed: true,
        durationMs: 600000,
        findingsCount: 1,
      });

      expect(run.layer).toBe(3);
      expect(run.passed).toBe(true);
    });

    it('should reject invalid layer numbers', async () => {
      await expect(collector.recordRun(0, { passed: true }))
        .rejects.toThrow('Layer must be 1, 2, or 3');

      await expect(collector.recordRun(4, { passed: true }))
        .rejects.toThrow('Layer must be 1, 2, or 3');
    });

    it('should include metadata in run record', async () => {
      const run = await collector.recordRun(1, {
        passed: true,
        durationMs: 1000,
        metadata: {
          storyId: '3.11a',
          branchName: 'feature/test',
        },
      });

      expect(run.metadata.storyId).toBe('3.11a');
      expect(run.metadata.branchName).toBe('feature/test');
    });
  });

  describe('recordPreCommit', () => {
    it('should record pre-commit as Layer 1', async () => {
      const run = await collector.recordPreCommit({
        passed: true,
        durationMs: 2500,
      });

      expect(run.layer).toBe(1);
      expect(run.passed).toBe(true);
    });
  });

  describe('recordPRReview', () => {
    it('should record PR review with CodeRabbit metrics', async () => {
      await collector.recordPRReview({
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

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer2.coderabbit.active).toBe(true);
      expect(metrics.layers.layer2.coderabbit.findingsCount).toBe(5);
    });

    it('should accumulate CodeRabbit severity breakdown', async () => {
      await collector.recordPRReview({
        passed: true,
        durationMs: 100000,
        coderabbit: {
          findingsCount: 3,
          severityBreakdown: { critical: 1, high: 1, medium: 1, low: 0 },
        },
      });

      await collector.recordPRReview({
        passed: true,
        durationMs: 100000,
        coderabbit: {
          findingsCount: 2,
          severityBreakdown: { critical: 0, high: 0, medium: 1, low: 1 },
        },
      });

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer2.coderabbit.severityBreakdown.critical).toBe(1);
      expect(metrics.layers.layer2.coderabbit.severityBreakdown.high).toBe(1);
      expect(metrics.layers.layer2.coderabbit.severityBreakdown.medium).toBe(2);
      expect(metrics.layers.layer2.coderabbit.severityBreakdown.low).toBe(1);
    });

    it('should track Quinn categories', async () => {
      await collector.recordPRReview({
        passed: true,
        durationMs: 120000,
        quinn: {
          findingsCount: 3,
          topCategories: ['test-coverage', 'documentation'],
        },
      });

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer2.quinn.topCategories).toContain('test-coverage');
      expect(metrics.layers.layer2.quinn.topCategories).toContain('documentation');
    });
  });

  describe('recordHumanReview', () => {
    it('should record human review as Layer 3', async () => {
      const run = await collector.recordHumanReview({
        passed: true,
        durationMs: 300000,
      });

      expect(run.layer).toBe(3);
    });
  });

  describe('aggregate calculations', () => {
    it('should calculate pass rate correctly', async () => {
      // Record 4 runs: 3 passed, 1 failed
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(1, { passed: false, durationMs: 1000 });

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer1.passRate).toBe(0.75);
    });

    it('should calculate average time correctly', async () => {
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(1, { passed: true, durationMs: 2000 });
      await collector.recordRun(1, { passed: true, durationMs: 3000 });

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer1.avgTimeMs).toBe(2000);
    });

    it('should update total runs count', async () => {
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(2, { passed: true, durationMs: 1000 });

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer1.totalRuns).toBe(2);
      expect(metrics.layers.layer2.totalRuns).toBe(1);
    });

    it('should update lastRun timestamp', async () => {
      const before = new Date().toISOString();
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      const after = new Date().toISOString();

      const metrics = await collector.getMetrics();
      expect(metrics.layers.layer1.lastRun >= before).toBe(true);
      expect(metrics.layers.layer1.lastRun <= after).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should remove records older than retention period', async () => {
      // Create collector with 1 day retention
      const shortRetentionCollector = new MetricsCollector({
        dataFile: TEST_METRICS_FILE,
        retentionDays: 1,
      });

      // Add a record and manually backdate it
      await shortRetentionCollector.load();
      const metrics = await shortRetentionCollector.getMetrics();

      // Add old record (2 days ago)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2);
      metrics.history.push({
        timestamp: oldDate.toISOString(),
        layer: 1,
        passed: true,
        durationMs: 1000,
        findingsCount: 0,
      });

      // Add recent record
      metrics.history.push({
        timestamp: new Date().toISOString(),
        layer: 1,
        passed: true,
        durationMs: 1000,
        findingsCount: 0,
      });

      await shortRetentionCollector.save(metrics);

      // Run cleanup
      const removed = await shortRetentionCollector.cleanup();

      expect(removed).toBe(1);

      const cleaned = await shortRetentionCollector.getMetrics();
      expect(cleaned.history.length).toBe(1);
    });
  });

  describe('export', () => {
    it('should export metrics as JSON', async () => {
      await collector.recordRun(1, { passed: true, durationMs: 1000 });

      const exported = await collector.export('json');
      const parsed = JSON.parse(exported);

      expect(parsed.history.length).toBe(1);
      expect(parsed.version).toBe('1.0');
    });

    it('should export history as CSV', async () => {
      await collector.recordRun(1, { passed: true, durationMs: 1000, findingsCount: 2 });
      await collector.recordRun(2, { passed: false, durationMs: 2000, findingsCount: 5 });

      const csv = await collector.export('csv');
      const lines = csv.split('\n');

      expect(lines[0]).toBe('timestamp,layer,passed,durationMs,findingsCount');
      expect(lines.length).toBe(3); // Header + 2 rows
    });
  });

  describe('getLayerHistory', () => {
    it('should return history for specific layer', async () => {
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(2, { passed: true, durationMs: 2000 });
      await collector.recordRun(1, { passed: false, durationMs: 1500 });

      const layer1History = await collector.getLayerHistory(1);

      expect(layer1History.length).toBe(2);
      expect(layer1History.every((r) => r.layer === 1)).toBe(true);
    });

    it('should limit results when specified', async () => {
      for (let i = 0; i < 10; i++) {
        await collector.recordRun(1, { passed: true, durationMs: 1000 });
      }

      const limited = await collector.getLayerHistory(1, 5);
      expect(limited.length).toBe(5);
    });
  });

  describe('reset', () => {
    it('should reset all metrics to empty state', async () => {
      await collector.recordRun(1, { passed: true, durationMs: 1000 });
      await collector.recordRun(2, { passed: true, durationMs: 2000 });

      await collector.reset();

      const metrics = await collector.getMetrics();
      expect(metrics.history.length).toBe(0);
      expect(metrics.layers.layer1.totalRuns).toBe(0);
      expect(metrics.layers.layer2.totalRuns).toBe(0);
    });
  });

  describe('validation', () => {
    it('should validate metrics against schema', async () => {
      const metrics = createEmptyMetrics();
      const { valid, errors } = await collector.validate(metrics);

      expect(valid).toBe(true);
      expect(errors).toBeNull();
    });

    it('should detect invalid metrics', async () => {
      const invalidMetrics = {
        version: '2.0', // Wrong version
        lastUpdated: new Date().toISOString(),
        layers: {},
        trends: {},
        history: [],
      };

      const { valid } = await collector.validate(invalidMetrics);
      expect(valid).toBe(false);
    });
  });
});
