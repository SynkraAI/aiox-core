/**
 * Unit Tests for Decision Recorder API
 *
 * Tests the convenience API for recording decisions during yolo mode.
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
  getCurrentContext,
} = require('../../.aiox-core/development/scripts/decision-recorder');

// Mock decision-log-generator
jest.mock('../../.aiox-core/development/scripts/decision-log-generator', () => ({
  generateDecisionLog: jest.fn().mockResolvedValue('.ai/decision-log-test.md'),
}));

describe('decision-recorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializeDecisionLogging', () => {
    it('should initialize decision logging context', async () => {
      const context = await initializeDecisionLogging('dev', 'docs/stories/test.md');

      expect(context).toBeDefined();
      expect(context.agentId).toBe('dev');
      expect(context.storyPath).toBe('docs/stories/test.md');
      expect(context.enabled).toBe(true);
    });

    it('should respect enabled option', async () => {
      const context = await initializeDecisionLogging('dev', 'test.md', { enabled: false });

      expect(context).toBeNull();
    });

    it('should pass agent load time to context', async () => {
      const context = await initializeDecisionLogging('dev', 'test.md', { agentLoadTime: 150 });

      expect(context.metrics.agentLoadTime).toBe(150);
    });
  });

  describe('recordDecision', () => {
    beforeEach(async () => {
      // Reset global context before each test in this suite
      if (getCurrentContext()) {
        await completeDecisionLogging('cleanup');
      }
    });

    it('should record decision after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      const decision = recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        alternatives: ['Alt 1', 'Alt 2'],
        type: 'library-choice',
        priority: 'high',
      });

      expect(decision).toBeDefined();
      expect(decision.description).toBe('Test decision');
      expect(decision.type).toBe('library-choice');
      expect(decision.priority).toBe('high');
    });

    it('should warn if not initialized', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = recordDecision({
        description: 'Test',
        reason: 'Test',
      });

      expect(decision).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not initialized'));

      consoleSpy.mockRestore();
    });
  });

  describe('trackFile', () => {
    it('should track file after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      trackFile('src/api.js', 'created');

      const context = getCurrentContext();
      expect(context.filesModified).toHaveLength(1);
      expect(context.filesModified[0].path).toContain('api.js'); // Path may have OS-specific separators
      expect(context.filesModified[0].action).toBe('created');
    });

    it('should handle not initialized gracefully', async () => {
      trackFile('test.js', 'created'); // Should not throw
    });
  });

  describe('trackTest', () => {
    it('should track test after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      trackTest({
        name: 'api.test.js',
        passed: true,
        duration: 125,
      });

      const context = getCurrentContext();
      expect(context.testsRun).toHaveLength(1);
      expect(context.testsRun[0].name).toBe('api.test.js');
      expect(context.testsRun[0].passed).toBe(true);
    });

    it('should handle not initialized gracefully', async () => {
      trackTest({ name: 'test.js', passed: true }); // Should not throw
    });
  });

  describe('updateMetrics', () => {
    it('should update metrics after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      updateMetrics({
        agentLoadTime: 200,
        taskExecutionTime: 5000,
      });

      const context = getCurrentContext();
      expect(context.metrics.agentLoadTime).toBe(200);
      expect(context.metrics.taskExecutionTime).toBe(5000);
    });

    it('should handle not initialized gracefully', async () => {
      updateMetrics({ test: 123 }); // Should not throw
    });
  });

  describe('completeDecisionLogging', () => {
    it('should complete logging and generate log file', async () => {
      const { generateDecisionLog } = require('../../.aiox-core/development/scripts/decision-log-generator');

      await initializeDecisionLogging('dev', 'test.md');

      recordDecision({ description: 'D1', reason: 'R1' });
      trackFile('file1.js', 'created');
      trackTest({ name: 'test.js', passed: true, duration: 100 });

      jest.spyOn(Date, 'now').mockReturnValue(1700000060000); // 1 minute later

      const logPath = await completeDecisionLogging('6.1.2.6.2', 'completed');

      expect(logPath).toBe('.ai/decision-log-test.md');
      expect(generateDecisionLog).toHaveBeenCalledWith('6.1.2.6.2', expect.objectContaining({
        agentId: 'dev',
        status: 'completed',
        decisions: expect.any(Array),
        filesModified: expect.any(Array),
        testsRun: expect.any(Array),
      }));
    });

    it('should reset global context after completion', async () => {
      await initializeDecisionLogging('dev', 'test.md');
      await completeDecisionLogging('test', 'completed');

      const context = getCurrentContext();
      expect(context).toBeNull();
    });

    it('should handle not initialized gracefully', async () => {
      const logPath = await completeDecisionLogging('test');

      expect(logPath).toBeNull();
    });

    it('should handle errors during log generation', async () => {
      const { generateDecisionLog } = require('../../.aiox-core/development/scripts/decision-log-generator');
      generateDecisionLog.mockRejectedValueOnce(new Error('File system error'));

      await initializeDecisionLogging('dev', 'test.md');

      await expect(completeDecisionLogging('test')).rejects.toThrow('File system error');
    });

    it('should use default status "completed"', async () => {
      const { generateDecisionLog } = require('../../.aiox-core/development/scripts/decision-log-generator');

      await initializeDecisionLogging('dev', 'test.md');
      await completeDecisionLogging('test');

      const callArgs = generateDecisionLog.mock.calls[0][1];
      expect(callArgs.status).toBe('completed');
    });

    it('should display summary after logging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await initializeDecisionLogging('dev', 'test.md');
      recordDecision({ description: 'D1', reason: 'R1' });
      recordDecision({ description: 'D2', reason: 'R2' });
      trackFile('file1.js', 'created');
      trackTest({ name: 'test1.js', passed: true, duration: 100 });
      trackTest({ name: 'test2.js', passed: false, duration: 50 });

      await completeDecisionLogging('test');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Decision Log Summary'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Decisions: 2'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Files Modified: 1'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Tests Run: 2'));

      consoleSpy.mockRestore();
    });
  });

  describe('getCurrentContext', () => {
    it('should return null when not initialized', () => {
      const context = getCurrentContext();
      expect(context).toBeNull();
    });

    it('should return current context when initialized', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      const context = getCurrentContext();
      expect(context).toBeDefined();
      expect(context.agentId).toBe('dev');
    });
  });

  describe('integration workflow', () => {
    it('should support full yolo mode workflow', async () => {
      const { generateDecisionLog } = require('../../.aiox-core/development/scripts/decision-log-generator');

      // Initialize
      await initializeDecisionLogging('dev', 'docs/stories/story-6.1.2.6.2.md', {
        agentLoadTime: 150,
      });

      // Record decisions during execution
      recordDecision({
        description: 'Use Axios for HTTP client',
        reason: 'Better error handling and interceptors',
        alternatives: ['Fetch API', 'Got library'],
        type: 'library-choice',
        priority: 'medium',
      });

      recordDecision({
        description: 'Use React Context for state',
        reason: 'Simple state sharing without Redux',
        alternatives: ['Redux', 'Zustand'],
        type: 'architecture',
        priority: 'high',
      });

      // Track files
      trackFile('src/api/client.js', 'created');
      trackFile('package.json', 'modified');

      // Track tests
      trackTest({ name: 'api.test.js', passed: true, duration: 125 });
      trackTest({ name: 'context.test.js', passed: true, duration: 85 });

      // Update metrics
      updateMetrics({ taskExecutionTime: 300000 });

      // Complete
      jest.spyOn(Date, 'now').mockReturnValue(1700000300000); // 5 minutes later
      const logPath = await completeDecisionLogging('6.1.2.6.2', 'completed');

      // Verify log was generated with correct data
      expect(logPath).toBe('.ai/decision-log-test.md');

      const callArgs = generateDecisionLog.mock.calls[0][1];
      expect(callArgs.agentId).toBe('dev');
      expect(callArgs.status).toBe('completed');
      expect(callArgs.decisions).toHaveLength(2);
      expect(callArgs.decisions[0].description).toBe('Use Axios for HTTP client');
      expect(callArgs.decisions[1].description).toBe('Use React Context for state');
      expect(callArgs.filesModified).toHaveLength(2);
      expect(callArgs.filesModified[0].path).toContain('client.js'); // OS-agnostic path check
      expect(callArgs.filesModified[1].path).toContain('package.json');
      expect(callArgs.testsRun).toHaveLength(2);
      expect(callArgs.testsRun[0].name).toBe('api.test.js');
      expect(callArgs.testsRun[0].passed).toBe(true);
      expect(callArgs.testsRun[1].name).toBe('context.test.js');
      expect(callArgs.testsRun[1].passed).toBe(true);
    });
  });
});
