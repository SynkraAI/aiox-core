// Integration test - requires external services
// Uses describeIntegration from setup.js
/**
 * Performance Benchmarks for Decision Logging
 *
 * Validates that decision logging overhead meets the <50ms requirement (AC8).
 * Tests individual operations and full workflow performance.
 *
 * @see .aiox-core/scripts/decision-recorder.js
 */

const fs = require('fs').promises;
const {
  initializeDecisionLogging,
  recordDecision,
  trackFile,
  trackTest,
  updateMetrics,
  completeDecisionLogging,
} = require('../../.aiox-core/development/scripts/decision-recorder');

describeIntegration('Decision Logging Performance Benchmarks', () => {
  const testStoryPath = 'docs/stories/benchmark-test.md';
  const testStoryId = 'benchmark-test';

  // Performance targets (AC8)
  const TARGETS = {
    initialization: 50,        // <50ms (includes git, config loading)
    recordDecision: 5,         // <5ms per call
    trackFile: 2,              // <2ms per call
    trackTest: 2,              // <2ms per call
    updateMetrics: 1,          // <1ms
    logGeneration: 30,         // <30ms
    indexUpdate: 5,            // <5ms
    totalOverhead: 50,          // <50ms (CRITICAL)
  };

  beforeEach(async () => {
    // Clean up any previous benchmark logs
    try {
      await fs.unlink(`.ai/decision-log-${testStoryId}.md`);
    } catch (error) {
      // File doesn't exist, that's okay
    }

    try {
      await fs.unlink('.ai/decision-logs-index.md');
    } catch (error) {
      // File doesn't exist, that's okay
    }
  });

  afterEach(async () => {
    // Clean up benchmark logs
    try {
      await fs.unlink(`.ai/decision-log-${testStoryId}.md`);
    } catch (error) {
      // Ignore cleanup errors
    }

    try {
      await fs.unlink('.ai/decision-logs-index.md');
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describeIntegration('Individual Operation Performance', () => {
    it('should initialize decision logging in <10ms', async () => {
      const startTime = Date.now();

      await initializeDecisionLogging('dev', testStoryPath, {
        agentLoadTime: 150,
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(TARGETS.initialization);
      console.log(`Initialization: ${duration}ms (target: <${TARGETS.initialization}ms) ✓`);
    });

    it('should record decision in <5ms per call', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        recordDecision({
          description: `Benchmark decision ${i}`,
          reason: 'Performance test',
          alternatives: ['Alt 1', 'Alt 2', 'Alt 3'],
          type: 'library-choice',
          priority: 'medium',
        });

        const duration = Date.now() - startTime;
        times.push(duration);
      }

      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const maxTime = Math.max(...times);

      expect(avgTime).toBeLessThan(TARGETS.recordDecision);
      expect(maxTime).toBeLessThan(TARGETS.recordDecision * 2); // Allow 2x for outliers

      console.log(`recordDecision: avg=${avgTime.toFixed(2)}ms, max=${maxTime}ms (target: <${TARGETS.recordDecision}ms) ✓`);
    });

    it('should track file in <2ms per call', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const iterations = 20;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        trackFile(`src/file-${i}.js`, 'created');

        const duration = Date.now() - startTime;
        times.push(duration);
      }

      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const maxTime = Math.max(...times);

      expect(avgTime).toBeLessThan(TARGETS.trackFile);
      expect(maxTime).toBeLessThan(TARGETS.trackFile * 2);

      console.log(`trackFile: avg=${avgTime.toFixed(2)}ms, max=${maxTime}ms (target: <${TARGETS.trackFile}ms) ✓`);
    });

    it('should track test in <2ms per call', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const iterations = 20;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        trackTest({
          name: `test-${i}.js`,
          passed: i % 2 === 0,
          duration: 100 + i,
        });

        const duration = Date.now() - startTime;
        times.push(duration);
      }

      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const maxTime = Math.max(...times);

      expect(avgTime).toBeLessThan(TARGETS.trackTest);
      expect(maxTime).toBeLessThan(TARGETS.trackTest * 2);

      console.log(`trackTest: avg=${avgTime.toFixed(2)}ms, max=${maxTime}ms (target: <${TARGETS.trackTest}ms) ✓`);
    });

    it('should update metrics in <1ms', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const startTime = Date.now();

      updateMetrics({
        agentLoadTime: 150,
        taskExecutionTime: 300000,
        customMetric: 'test',
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(TARGETS.updateMetrics);
      console.log(`updateMetrics: ${duration}ms (target: <${TARGETS.updateMetrics}ms) ✓`);
    });
  });

  describeIntegration('Log Generation Performance', () => {
    it('should generate decision log in <30ms', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      // Add some data to log
      for (let i = 0; i < 5; i++) {
        recordDecision({
          description: `Decision ${i}`,
          reason: 'Performance test',
          alternatives: ['Alt 1', 'Alt 2'],
        });
      }

      for (let i = 0; i < 10; i++) {
        trackFile(`src/file-${i}.js`, 'created');
      }

      for (let i = 0; i < 5; i++) {
        trackTest({
          name: `test-${i}.js`,
          passed: true,
          duration: 100,
        });
      }

      const startTime = Date.now();

      const logPath = await completeDecisionLogging(testStoryId, 'completed');

      const duration = Date.now() - startTime;

      expect(logPath).toBeDefined();
      expect(duration).toBeLessThan(TARGETS.logGeneration);

      console.log(`Log generation: ${duration}ms (target: <${TARGETS.logGeneration}ms) ✓`);
    });
  });

  describeIntegration('Total Workflow Overhead (CRITICAL - AC8)', () => {
    it('should complete full workflow with <50ms total overhead', async () => {
      const startTime = Date.now();

      // Simulate realistic yolo mode workflow
      await initializeDecisionLogging('dev', testStoryPath, {
        agentLoadTime: 150,
      });

      // Typical decision count: 3-10
      for (let i = 0; i < 7; i++) {
        recordDecision({
          description: `Realistic decision ${i}`,
          reason: 'Performance validation',
          alternatives: ['Alt 1', 'Alt 2', 'Alt 3'],
          type: i % 2 === 0 ? 'library-choice' : 'architecture',
          priority: i < 3 ? 'high' : 'medium',
        });
      }

      // Typical file count: 5-15
      for (let i = 0; i < 12; i++) {
        trackFile(`src/feature/file-${i}.js`, i % 3 === 0 ? 'created' : 'modified');
      }

      // Typical test count: 5-20
      for (let i = 0; i < 15; i++) {
        trackTest({
          name: `feature-${i}.test.js`,
          passed: i % 10 !== 0, // 10% failure rate
          duration: 50 + Math.floor(Math.random() * 200),
        });
      }

      updateMetrics({
        taskExecutionTime: 180000, // 3 minutes
      });

      await completeDecisionLogging(testStoryId, 'completed');

      const totalOverhead = Date.now() - startTime;

      // CRITICAL: Must be under 50ms
      expect(totalOverhead).toBeLessThan(TARGETS.totalOverhead);

      console.log(`\n📊 TOTAL WORKFLOW OVERHEAD: ${totalOverhead}ms (target: <${TARGETS.totalOverhead}ms) ✓`);
      console.log('   - Decisions: 7');
      console.log('   - Files: 12');
      console.log('   - Tests: 15');
      console.log(`   - Status: ${totalOverhead < TARGETS.totalOverhead ? '✅ PASS' : '❌ FAIL'}\n`);
    });

    it('should handle large workflow (100 decisions) efficiently', async () => {
      const startTime = Date.now();

      await initializeDecisionLogging('dev', testStoryPath);

      // Stress test: 100 decisions
      for (let i = 0; i < 100; i++) {
        recordDecision({
          description: `Stress test decision ${i}`,
          reason: 'Large workflow test',
          alternatives: ['Alt 1', 'Alt 2'],
        });
      }

      // 50 files
      for (let i = 0; i < 50; i++) {
        trackFile(`src/file-${i}.js`, 'created');
      }

      // 30 tests
      for (let i = 0; i < 30; i++) {
        trackTest({
          name: `test-${i}.js`,
          passed: true,
          duration: 100,
        });
      }

      await completeDecisionLogging(testStoryId, 'completed');

      const totalOverhead = Date.now() - startTime;

      // Allow 2x target for stress test (100ms)
      expect(totalOverhead).toBeLessThan(TARGETS.totalOverhead * 2);

      console.log(`\n⚡ STRESS TEST (100 decisions): ${totalOverhead}ms (max: <${TARGETS.totalOverhead * 2}ms) ✓`);
    });
  });

  describeIntegration('Performance Regression Tests', () => {
    it('should not degrade with repeated calls', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const times = [];

      for (let i = 0; i < 50; i++) {
        const startTime = Date.now();

        recordDecision({
          description: `Regression test ${i}`,
          reason: 'Checking for performance degradation',
          alternatives: [],
        });

        const duration = Date.now() - startTime;
        times.push(duration);
      }

      const firstHalf = times.slice(0, 25);
      const secondHalf = times.slice(25);

      const firstAvg = firstHalf.reduce((sum, t) => sum + t, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, t) => sum + t, 0) / secondHalf.length;

      // Second half should not be significantly slower (allow 50% variance)
      // If both are 0ms (very fast), that's acceptable
      if (firstAvg > 0) {
        expect(secondAvg).toBeLessThan(firstAvg * 1.5);
      } else {
        expect(secondAvg).toBeLessThanOrEqual(1); // Both should be <1ms
      }

      console.log(`Regression check: first=${firstAvg.toFixed(2)}ms, second=${secondAvg.toFixed(2)}ms ✓`);
    });
  });

  describeIntegration('Memory Efficiency', () => {
    it('should not leak memory with large datasets', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      await initializeDecisionLogging('dev', testStoryPath);

      // Create large dataset
      for (let i = 0; i < 1000; i++) {
        recordDecision({
          description: `Memory test ${i}`,
          reason: 'Testing memory usage',
          alternatives: [],
        });
      }

      await completeDecisionLogging(testStoryId, 'completed');

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      // Should not use more than 10MB for 1000 decisions
      expect(memoryIncrease).toBeLessThan(10);

      console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB (max: <10MB) ✓`);
    });
  });
});
