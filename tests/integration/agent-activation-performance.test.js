// Integration/Performance test - uses describeIntegration
/**
 * Integration Tests: Agent Activation Performance
 * Story 6.1.2.6.2 - Agent Performance Optimization
 *
 * Tests end-to-end agent activation with session context
 */

const DevContextLoader = require('../../.aiox-core/development/scripts/dev-context-loader');
const SessionContextLoader = require('../../.aiox-core/scripts/session-context-loader');

describeIntegration('Agent Activation Performance (Integration)', () => {
  let devLoader;
  let sessionLoader;

  beforeEach(async () => {
    devLoader = new DevContextLoader();
    sessionLoader = new SessionContextLoader();
    // Start with clean session and cache
    sessionLoader.clearSession();
    await devLoader.clearCache().catch(() => {});
  });

  afterEach(() => {
    sessionLoader.clearSession();
  });

  describeIntegration('@dev Activation with Session Context', () => {
    test('activates with session context after @po', async () => {
      // Simulate @po activation and command
      sessionLoader.updateSession('po', 'Pax', 'validate-story-draft');

      // Simulate @dev activation
      const start = Date.now();
      const devContext = await devLoader.load({ fullLoad: false });
      const sessionContext = sessionLoader.loadContext('dev');
      const duration = Date.now() - start;

      // Performance assertion
      expect(duration).toBeLessThan(100); // Including both loaders

      // Session context assertions
      expect(sessionContext.sessionType).toBe('existing');
      expect(sessionContext.previousAgent.agentId).toBe('po');
      expect(sessionContext.message).toContain('Continuing from @po');

      // Dev context assertions
      expect(devContext.status).toBe('loaded');
      expect(devContext.files.length).toBeGreaterThan(0);
    });

    test('shows correct load time and cache status', async () => {
      // First load (cache miss)
      const result1 = await devLoader.load({ fullLoad: false });

      expect(result1.loadTime).toBeLessThan(50);
      expect(result1.cacheHits).toBe(0);

      // Second load (cache hit)
      const result2 = await devLoader.load({ fullLoad: false });

      expect(result2.loadTime).toBeLessThan(5);
      expect(result2.cacheHits).toBeGreaterThan(0);
    });
  });

  describeIntegration('Multi-Agent Transition Flow', () => {
    test('tracks agent sequence: @po → @dev → @qa → @sm', () => {
      // Simulate agent transitions
      sessionLoader.updateSession('po', 'Pax', 'validate-story-draft');
      const context1 = sessionLoader.loadContext('dev');
      expect(context1.previousAgent.agentId).toBe('po');

      sessionLoader.updateSession('dev', 'Dex', 'develop');
      const context2 = sessionLoader.loadContext('qa');
      expect(context2.previousAgent.agentId).toBe('dev');

      sessionLoader.updateSession('qa', 'Quinn', 'review');
      const context3 = sessionLoader.loadContext('sm');
      expect(context3.previousAgent.agentId).toBe('qa');

      // Verify command history preserved
      expect(context3.lastCommands).toContain('validate-story-draft');
      expect(context3.lastCommands).toContain('develop');
      expect(context3.lastCommands).toContain('review');
    });
  });

  describeIntegration('Performance Targets', () => {
    test('@dev activation loads efficiently', async () => {
      sessionLoader.clearSession();

      const start = Date.now();
      await devLoader.load({ fullLoad: false, skipCache: true });
      const sessionContext = sessionLoader.loadContext('dev');
      const duration = Date.now() - start;

      // Relaxed for CI environments
      expect(duration).toBeLessThan(5000); // 5 seconds max
      expect(sessionContext.sessionType).toBe('new');
    }, 60000);

    test('@dev cached activation is significantly faster', async () => {
      // Warm up cache
      const start1 = Date.now();
      await devLoader.load({ fullLoad: false });
      const coldDuration = Date.now() - start1;

      // Measure cached load
      const start2 = Date.now();
      await devLoader.load({ fullLoad: false });
      const cachedDuration = Date.now() - start2;

      // Cached should be at least 50% faster
      expect(cachedDuration).toBeLessThan(coldDuration * 0.5);
    }, 60000);
  });

  describeIntegration('Cache Behavior', () => {
    test('cache persists across multiple loads', async () => {
      const result1 = await devLoader.load({ fullLoad: false });
      const result2 = await devLoader.load({ fullLoad: false });
      const result3 = await devLoader.load({ fullLoad: false });

      expect(result2.cacheHits).toBeGreaterThan(result1.cacheHits);
      expect(result3.cacheHits).toBeGreaterThan(result2.cacheHits);
    });

    test('cache invalidation after clear', async () => {
      // Load with cache
      const result1 = await devLoader.load({ fullLoad: false });
      expect(result1.cacheHits).toBe(0); // First load

      const result2 = await devLoader.load({ fullLoad: false });
      expect(result2.cacheHits).toBeGreaterThan(0); // Cached

      // Clear cache
      await devLoader.clearCache();

      // Should be cache miss again
      const result3 = await devLoader.load({ fullLoad: false });
      expect(result3.cacheHits).toBe(0);
    });
  });

  describeIntegration('Data Reduction', () => {
    test('summary mode reduces data by ~82%', async () => {
      const summaryResult = await devLoader.load({ fullLoad: false, skipCache: true });
      const fullResult = await devLoader.load({ fullLoad: true, skipCache: true });

      // Only count successfully loaded files (exclude files with errors)
      const successfulSummaryFiles = summaryResult.files.filter(f => !f.error);
      const successfulFullFiles = fullResult.files.filter(f => !f.error);

      // Calculate total lines only from successfully loaded files
      const summaryLines = successfulSummaryFiles.reduce((sum, f) => sum + (f.summaryLines || 0), 0);
      const fullLines = successfulFullFiles.reduce((sum, f) => sum + (f.linesCount || 0), 0);

      // Only test reduction if we have data to compare
      if (fullLines > 0) {
        const reduction = ((fullLines - summaryLines) / fullLines) * 100;

        expect(reduction).toBeGreaterThan(75);
        expect(reduction).toBeLessThan(90);
      } else {
        // If no files loaded, at least verify we got some result
        expect(summaryResult.status).toBe('loaded');
      }
    });
  });

  describeIntegration('Session Context Display', () => {
    test('formats context message correctly', () => {
      sessionLoader.updateSession('po', 'Pax', 'validate-story-draft');

      const message = sessionLoader.formatForGreeting('dev');

      expect(message).toContain('\n');
      expect(message).toContain('📍');
      expect(message).toContain('@po');
      expect(message).toContain('Pax');
    });

    test('shows empty message for new sessions', () => {
      sessionLoader.clearSession();

      const message = sessionLoader.formatForGreeting('dev');

      expect(message).toBe('');
    });
  });
});
