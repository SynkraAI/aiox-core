// Integration/Performance test - uses describeIntegration
/**
 * Performance Tests for Contextual Greeting System
 *
 * Validates:
 * - P50 latency <100ms
 * - P95 latency <130ms
 * - P99 latency <150ms (hard limit)
 * - No regression vs baseline
 */

const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');
const ContextDetector = require('../../.aiox-core/core/session/context-detector');
const GitConfigDetector = require('../../.aiox-core/infrastructure/scripts/git-config-detector');

// Mock dependencies for consistent testing
jest.mock('../../.aiox-core/core/session/context-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/git-config-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/project-status-loader');

const { loadProjectStatus } = require('../../.aiox-core/infrastructure/scripts/project-status-loader');

describeIntegration('Greeting Performance Tests', () => {
  let builder;
  let mockAgent;
  const ITERATIONS = 100;

  beforeEach(() => {
    builder = new GreetingBuilder();

    // Setup mock agent
    mockAgent = {
      name: 'TestAgent',
      icon: '🤖',
      persona_profile: {
        greeting_levels: {
          minimal: '🤖 TestAgent ready',
          named: '🤖 TestAgent (Tester) ready',
        },
      },
      commands: [
        { name: 'help', visibility: ['full', 'quick', 'key'] },
        { name: 'test', visibility: ['full'] },
      ],
    };

    // Setup fast mocks
    ContextDetector.prototype.detectSessionType = jest.fn().mockReturnValue('new');
    GitConfigDetector.prototype.get = jest.fn().mockReturnValue({
      configured: true,
      type: 'github',
      branch: 'main',
    });
    loadProjectStatus.mockResolvedValue({
      branch: 'main',
      modifiedFiles: [],
      isGitRepo: true,
    });
  });

  describeIntegration('Baseline Performance (Simple Greeting)', () => {
    test('baseline simple greeting should be fast', () => {
      const times = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        builder.buildSimpleGreeting(mockAgent);
        const end = performance.now();
        times.push(end - start);
      }

      const stats = calculateStats(times);

      console.log('Baseline Performance (Simple Greeting):');
      console.log(`  P50: ${stats.p50.toFixed(2)}ms`);
      console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`  P99: ${stats.p99.toFixed(2)}ms`);

      // Simple greeting should be very fast
      expect(stats.p99).toBeLessThan(50);
    });
  });

  describeIntegration('Contextual Greeting Performance', () => {
    test('P50 latency should be <100ms', async () => {
      const times = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        await builder.buildGreeting(mockAgent, {});
        const end = performance.now();
        times.push(end - start);
      }

      const stats = calculateStats(times);

      console.log('Contextual Greeting Performance:');
      console.log(`  P50: ${stats.p50.toFixed(2)}ms`);
      console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`  P99: ${stats.p99.toFixed(2)}ms`);

      expect(stats.p50).toBeLessThan(100);
    });

    test('P95 latency should be <130ms', async () => {
      const times = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        await builder.buildGreeting(mockAgent, {});
        const end = performance.now();
        times.push(end - start);
      }

      const stats = calculateStats(times);
      expect(stats.p95).toBeLessThan(130);
    });

    test('P99 latency should be <150ms (hard limit)', async () => {
      const times = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        await builder.buildGreeting(mockAgent, {});
        const end = performance.now();
        times.push(end - start);
      }

      const stats = calculateStats(times);
      expect(stats.p99).toBeLessThan(150);
    });

    test('fallback should not regress performance', async () => {
      const times = [];

      // Mock slow operation to trigger fallback
      loadProjectStatus.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 200)),
      );

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        await builder.buildGreeting(mockAgent, {});
        const end = performance.now();
        times.push(end - start);
      }

      const stats = calculateStats(times);

      // Fallback should trigger at 150ms timeout
      expect(stats.p99).toBeLessThanOrEqual(160); // Small margin for timeout handling
    });
  });

  describeIntegration('Cache Hit Performance', () => {
    test('cached git config should be fast', async () => {
      const detector = new GitConfigDetector();
      const times = [];

      // First call to populate cache
      detector.get();

      // Measure cache hits
      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        detector.get();
        const end = performance.now();
        times.push(end - start);
      }

      const stats = calculateStats(times);

      console.log('Git Config Cache Hit Performance:');
      console.log(`  P50: ${stats.p50.toFixed(2)}ms`);

      expect(stats.p50).toBeLessThan(5); // Should be <5ms
    });
  });
});

/**
 * Calculate percentile statistics
 * @param {number[]} times - Array of measurements
 * @returns {Object} Statistics
 */
function calculateStats(times) {
  const sorted = times.sort((a, b) => a - b);

  return {
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    mean: mean(sorted),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function percentile(sorted, p) {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
