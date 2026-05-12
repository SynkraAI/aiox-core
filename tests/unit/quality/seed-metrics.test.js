/**
 * Seed Metrics Unit Tests
 *
 * Tests for the quality gate metrics seed data generator.
 *
 * @module tests/unit/quality/seed-metrics.test.js
 * @story 3.11a - Quality Gates Metrics Collector
 */

const {
  generateSeedData,
  generateLayer1Run,
  generateLayer2Run,
  generateLayer3Run,
} = require('../../../.aiox-core/quality/seed-metrics');

describe('Seed Metrics Generator', () => {
  describe('generateLayer1Run', () => {
    it('should generate valid Layer 1 run', () => {
      const timestamp = new Date();
      const run = generateLayer1Run(timestamp);

      expect(run.layer).toBe(1);
      expect(typeof run.passed).toBe('boolean');
      expect(run.durationMs).toBeGreaterThan(0);
      expect(run.findingsCount).toBeGreaterThanOrEqual(0);
      expect(run.timestamp).toBe(timestamp.toISOString());
    });

    it('should generate realistic duration range', () => {
      const runs = [];
      for (let i = 0; i < 100; i++) {
        runs.push(generateLayer1Run(new Date()));
      }

      const durations = runs.map((r) => r.durationMs);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      // Layer 1 should be 2-8 seconds
      expect(minDuration).toBeGreaterThanOrEqual(2000);
      expect(maxDuration).toBeLessThanOrEqual(8000);
    });

    it('should have high pass rate (~92%)', () => {
      const runs = [];
      for (let i = 0; i < 1000; i++) {
        runs.push(generateLayer1Run(new Date()));
      }

      const passRate = runs.filter((r) => r.passed).length / runs.length;
      // Allow for statistical variation
      expect(passRate).toBeGreaterThan(0.85);
      expect(passRate).toBeLessThan(0.98);
    });
  });

  describe('generateLayer2Run', () => {
    it('should generate valid Layer 2 run', () => {
      const timestamp = new Date();
      const run = generateLayer2Run(timestamp);

      expect(run.layer).toBe(2);
      expect(typeof run.passed).toBe('boolean');
      expect(run.durationMs).toBeGreaterThan(0);
      expect(run.metadata).toBeDefined();
    });

    it('should include CodeRabbit metadata', () => {
      const runs = [];
      for (let i = 0; i < 100; i++) {
        runs.push(generateLayer2Run(new Date()));
      }

      const withCoderabbit = runs.filter((r) => r.metadata?.coderabbit !== null);
      // CodeRabbit active 95% of time
      expect(withCoderabbit.length).toBeGreaterThan(85);
    });

    it('should include Quinn metadata', () => {
      const run = generateLayer2Run(new Date());

      expect(run.metadata.quinn).toBeDefined();
      expect(run.metadata.quinn.findingsCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(run.metadata.quinn.topCategories)).toBe(true);
    });

    it('should have realistic duration (2-10 minutes)', () => {
      const runs = [];
      for (let i = 0; i < 50; i++) {
        runs.push(generateLayer2Run(new Date()));
      }

      const durations = runs.map((r) => r.durationMs);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      expect(minDuration).toBeGreaterThanOrEqual(120000);
      expect(maxDuration).toBeLessThanOrEqual(600000);
    });
  });

  describe('generateLayer3Run', () => {
    it('should generate valid Layer 3 run', () => {
      const timestamp = new Date();
      const run = generateLayer3Run(timestamp);

      expect(run.layer).toBe(3);
      expect(typeof run.passed).toBe('boolean');
      expect(run.durationMs).toBeGreaterThan(0);
    });

    it('should have highest pass rate (~96%)', () => {
      const runs = [];
      for (let i = 0; i < 1000; i++) {
        runs.push(generateLayer3Run(new Date()));
      }

      const passRate = runs.filter((r) => r.passed).length / runs.length;
      expect(passRate).toBeGreaterThan(0.90);
      expect(passRate).toBeLessThan(0.99);
    });

    it('should have realistic duration (5-30 minutes)', () => {
      const runs = [];
      for (let i = 0; i < 50; i++) {
        runs.push(generateLayer3Run(new Date()));
      }

      const durations = runs.map((r) => r.durationMs);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      expect(minDuration).toBeGreaterThanOrEqual(300000);
      expect(maxDuration).toBeLessThanOrEqual(1800000);
    });
  });

  describe('generateSeedData', () => {
    it('should generate 30 days of history by default', () => {
      const metrics = generateSeedData();

      // Should have multiple runs
      expect(metrics.history.length).toBeGreaterThan(100);

      // Check date range
      const timestamps = metrics.history.map((r) => new Date(r.timestamp));
      const oldestDate = new Date(Math.min(...timestamps));
      const newestDate = new Date(Math.max(...timestamps));

      const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(25);
      expect(daysDiff).toBeLessThanOrEqual(31);
    });

    it('should generate specified number of days', () => {
      const metrics = generateSeedData({ days: 7 });

      const timestamps = metrics.history.map((r) => new Date(r.timestamp));
      const oldestDate = new Date(Math.min(...timestamps));
      const newestDate = new Date(Math.max(...timestamps));

      const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeLessThanOrEqual(8);
    });

    it('should respect runsPerDay option', () => {
      const lowRuns = generateSeedData({ days: 5, runsPerDay: 2 });
      const highRuns = generateSeedData({ days: 5, runsPerDay: 15 });

      // High runs should have significantly more history
      expect(highRuns.history.length).toBeGreaterThan(lowRuns.history.length);
    });

    it('should reduce weekend activity when enabled', () => {
      // Generate multiple seed data sets to average out randomness
      let weekdayTotal = 0;
      let weekendTotal = 0;

      for (let i = 0; i < 10; i++) {
        const metrics = generateSeedData({
          days: 14,
          weekendReduction: true,
        });

        metrics.history.forEach((r) => {
          const day = new Date(r.timestamp).getDay();
          if (day === 0 || day === 6) {
            weekendTotal++;
          } else {
            weekdayTotal++;
          }
        });
      }

      // Weekend days (2 per week) should have fewer runs than weekdays (5 per week)
      const weekdayAvg = weekdayTotal / 10;
      const weekendAvg = weekendTotal / 4;

      expect(weekendAvg).toBeLessThan(weekdayAvg);
    });

    it('should calculate layer aggregates correctly', () => {
      // Use more days to ensure Layer 3 (10% probability) gets runs
      const metrics = generateSeedData({ days: 30, runsPerDay: 10 });

      // All layers should have runs (with 30 days and ~300 runs, Layer 3 should have ~30)
      expect(metrics.layers.layer1.totalRuns).toBeGreaterThan(0);
      expect(metrics.layers.layer2.totalRuns).toBeGreaterThan(0);
      expect(metrics.layers.layer3.totalRuns).toBeGreaterThan(0); // With 300 runs at 10% probability, statistically guaranteed

      // Pass rates should be between 0 and 1
      expect(metrics.layers.layer1.passRate).toBeGreaterThan(0);
      expect(metrics.layers.layer1.passRate).toBeLessThanOrEqual(1);

      // Layer 1 should have more runs than Layer 3 (60% vs 10% probability)
      expect(metrics.layers.layer1.totalRuns).toBeGreaterThanOrEqual(metrics.layers.layer3.totalRuns);
    });

    it('should include CodeRabbit aggregates', () => {
      const metrics = generateSeedData({ days: 10 });

      expect(metrics.layers.layer2.coderabbit.active).toBe(true);
      expect(metrics.layers.layer2.coderabbit.findingsCount).toBeGreaterThan(0);
      expect(metrics.layers.layer2.coderabbit.severityBreakdown).toBeDefined();
    });

    it('should include Quinn aggregates', () => {
      const metrics = generateSeedData({ days: 10 });

      expect(metrics.layers.layer2.quinn.findingsCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(metrics.layers.layer2.quinn.topCategories)).toBe(true);
    });

    it('should generate trend data', () => {
      const metrics = generateSeedData({ days: 10 });

      expect(metrics.trends.passRates.length).toBeGreaterThan(0);
      expect(metrics.trends.autoCatchRate.length).toBeGreaterThan(0);

      // Each trend point should have date and value
      metrics.trends.passRates.forEach((t) => {
        expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof t.value).toBe('number');
        expect(t.value).toBeGreaterThanOrEqual(0);
        expect(t.value).toBeLessThanOrEqual(1);
      });
    });

    it('should sort history by timestamp', () => {
      const metrics = generateSeedData({ days: 10 });

      for (let i = 1; i < metrics.history.length; i++) {
        const prev = new Date(metrics.history[i - 1].timestamp);
        const curr = new Date(metrics.history[i].timestamp);
        expect(curr >= prev).toBe(true);
      }
    });

    it('should have valid schema version', () => {
      const metrics = generateSeedData();

      expect(metrics.version).toBe('1.0');
      expect(metrics.lastUpdated).toBeDefined();
      expect(metrics.retentionDays).toBe(30);
    });
  });
});
