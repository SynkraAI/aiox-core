/**
 * Unit Tests for Decision Context
 *
 * Tests the DecisionContext class for tracking decisions, files, and tests.
 *
 * @see .aiox-core/scripts/decision-context.js
 */

const {
  DecisionContext,
  DECISION_TYPES,
  PRIORITY_LEVELS,
} = require('../../.aiox-core/development/scripts/decision-context');

describe('DecisionContext', () => {
  let context;

  beforeEach(() => {
    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    // Create fresh context for each test
    context = new DecisionContext('dev', 'docs/stories/test-story.md');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required fields', () => {
      expect(context.agentId).toBe('dev');
      expect(context.storyPath).toBe('docs/stories/test-story.md');
      expect(context.startTime).toBe(1700000000000);
      expect(context.status).toBe('running');
      expect(context.enabled).toBe(true);
    });

    it('should initialize empty tracking arrays', () => {
      expect(context.decisions).toEqual([]);
      expect(context.filesModified).toEqual([]);
      expect(context.testsRun).toEqual([]);
    });

    it('should capture git commit hash', () => {
      expect(context.commitBefore).toBeDefined();
      expect(typeof context.commitBefore).toBe('string');
    });

    it('should handle disabled state', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      expect(disabledContext.enabled).toBe(false);
    });
  });

  describe('recordDecision', () => {
    it('should record decision with all fields', () => {
      const decision = context.recordDecision({
        description: 'Use Axios for HTTP',
        reason: 'Better error handling',
        alternatives: ['Fetch API', 'Got library'],
        type: 'library-choice',
        priority: 'medium',
      });

      expect(decision).toMatchObject({
        timestamp: 1700000000000,
        description: 'Use Axios for HTTP',
        reason: 'Better error handling',
        alternatives: ['Fetch API', 'Got library'],
        type: 'library-choice',
        priority: 'medium',
      });

      expect(context.decisions).toHaveLength(1);
      expect(context.decisions[0]).toBe(decision);
    });

    it('should handle empty alternatives array', () => {
      const decision = context.recordDecision({
        description: 'Simple decision',
        reason: 'Only one option',
        alternatives: [],
      });

      expect(decision.alternatives).toEqual([]);
    });

    it('should use default type and priority if not provided', () => {
      const decision = context.recordDecision({
        description: 'Decision without classification',
        reason: 'Some reason',
      });

      expect(decision.type).toBe('architecture');
      expect(decision.priority).toBe('medium');
    });

    it('should validate decision type', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = context.recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        type: 'invalid-type',
      });

      expect(decision.type).toBe('architecture'); // Fallback to default
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown decision type'));

      consoleSpy.mockRestore();
    });

    it('should validate priority level', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = context.recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        priority: 'invalid-priority',
      });

      expect(decision.priority).toBe('medium'); // Fallback to default
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown priority level'));

      consoleSpy.mockRestore();
    });

    it('should handle non-array alternatives', () => {
      const decision = context.recordDecision({
        description: 'Test',
        reason: 'Test',
        alternatives: 'not an array',
      });

      expect(decision.alternatives).toEqual([]);
    });

    it('should return null when disabled', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      const decision = disabledContext.recordDecision({
        description: 'Test',
        reason: 'Test',
      });

      expect(decision).toBeNull();
      expect(disabledContext.decisions).toHaveLength(0);
    });
  });

  describe('trackFile', () => {
    it('should track file with action', () => {
      context.trackFile('src/api.js', 'created');

      expect(context.filesModified).toHaveLength(1);
      expect(context.filesModified[0].path).toContain('api.js'); // OS-agnostic path check
      expect(context.filesModified[0].action).toBe('created');
    });

    it('should use default action "modified"', () => {
      context.trackFile('src/utils.js');

      expect(context.filesModified[0].action).toBe('modified');
    });

    it('should normalize file paths', () => {
      context.trackFile('src\\windows\\path.js', 'created');

      const tracked = context.filesModified[0];
      expect(tracked.path).toContain('path.js'); // Path normalized by OS
      expect(typeof tracked.path).toBe('string');
    });

    it('should update existing file instead of duplicating', () => {
      context.trackFile('src/api.js', 'created');
      context.trackFile('src/api.js', 'modified');

      expect(context.filesModified).toHaveLength(1);
      expect(context.filesModified[0].action).toBe('modified');
    });

    it('should not track when disabled', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      disabledContext.trackFile('test.js', 'created');

      expect(disabledContext.filesModified).toHaveLength(0);
    });
  });

  describe('trackTest', () => {
    it('should track passing test', () => {
      context.trackTest({
        name: 'api.test.js',
        passed: true,
        duration: 125,
      });

      expect(context.testsRun).toHaveLength(1);
      expect(context.testsRun[0]).toMatchObject({
        name: 'api.test.js',
        passed: true,
        duration: 125,
        error: null,
        timestamp: 1700000000000,
      });
    });

    it('should track failing test with error', () => {
      context.trackTest({
        name: 'broken.test.js',
        passed: false,
        duration: 50,
        error: 'Assertion failed',
      });

      const test = context.testsRun[0];
      expect(test.passed).toBe(false);
      expect(test.error).toBe('Assertion failed');
    });

    it('should handle missing duration', () => {
      context.trackTest({
        name: 'test.js',
        passed: true,
      });

      expect(context.testsRun[0].duration).toBe(0);
    });

    it('should not track when disabled', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      disabledContext.trackTest({ name: 'test.js', passed: true });

      expect(disabledContext.testsRun).toHaveLength(0);
    });
  });

  describe('updateMetrics', () => {
    it('should update metrics', () => {
      context.updateMetrics({
        agentLoadTime: 150,
        taskExecutionTime: 60000,
      });

      expect(context.metrics.agentLoadTime).toBe(150);
      expect(context.metrics.taskExecutionTime).toBe(60000);
    });

    it('should merge new metrics with existing', () => {
      context.metrics.agentLoadTime = 100;
      context.updateMetrics({
        taskExecutionTime: 5000,
      });

      expect(context.metrics.agentLoadTime).toBe(100);
      expect(context.metrics.taskExecutionTime).toBe(5000);
    });

    it('should not update when disabled', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      const initialMetrics = { ...disabledContext.metrics };

      disabledContext.updateMetrics({ newMetric: 123 });

      expect(disabledContext.metrics).toEqual(initialMetrics);
    });
  });

  describe('complete', () => {
    it('should mark execution as complete', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1700000060000); // 1 minute later

      context.complete('completed');

      expect(context.status).toBe('completed');
      expect(context.endTime).toBe(1700000060000);
      expect(context.metrics.taskExecutionTime).toBe(60000); // 1 minute
    });

    it('should use default status "completed"', () => {
      context.complete();

      expect(context.status).toBe('completed');
    });

    it('should handle failed status', () => {
      context.complete('failed');

      expect(context.status).toBe('failed');
    });
  });

  describe('toObject', () => {
    it('should return context as plain object', () => {
      context.recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
      });
      context.trackFile('src/test.js', 'created');
      context.trackTest({ name: 'test.js', passed: true, duration: 100 });
      context.complete();

      const obj = context.toObject();

      expect(obj).toMatchObject({
        agentId: 'dev',
        storyPath: 'docs/stories/test-story.md',
        startTime: 1700000000000,
        status: 'completed',
        decisions: expect.any(Array),
        filesModified: expect.any(Array),
        testsRun: expect.any(Array),
        metrics: expect.any(Object),
        commitBefore: expect.any(String),
      });

      expect(obj.decisions).toHaveLength(1);
      expect(obj.filesModified).toHaveLength(1);
      expect(obj.testsRun).toHaveLength(1);
    });
  });

  describe('getSummary', () => {
    it('should return summary statistics', () => {
      context.recordDecision({ description: 'D1', reason: 'R1' });
      context.recordDecision({ description: 'D2', reason: 'R2' });
      context.trackFile('file1.js', 'created');
      context.trackTest({ name: 'test1.js', passed: true, duration: 100 });
      context.trackTest({ name: 'test2.js', passed: false, duration: 50 });

      jest.spyOn(Date, 'now').mockReturnValue(1700000060000); // 1 minute later
      context.complete();

      const summary = context.getSummary();

      expect(summary).toMatchObject({
        decisionsCount: 2,
        filesModifiedCount: 1,
        testsRunCount: 2,
        testsPassed: 1,
        testsFailed: 1,
        duration: 60000,
        status: 'completed',
      });
    });

    it('should calculate duration for running context', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1700000030000); // 30 seconds later

      const summary = context.getSummary();

      expect(summary.duration).toBe(30000);
      expect(summary.status).toBe('running');
    });
  });

  describe('DECISION_TYPES constant', () => {
    it('should have all required decision types', () => {
      expect(DECISION_TYPES).toHaveProperty('library-choice');
      expect(DECISION_TYPES).toHaveProperty('architecture');
      expect(DECISION_TYPES).toHaveProperty('algorithm');
      expect(DECISION_TYPES).toHaveProperty('error-handling');
      expect(DECISION_TYPES).toHaveProperty('testing-strategy');
      expect(DECISION_TYPES).toHaveProperty('performance');
      expect(DECISION_TYPES).toHaveProperty('security');
      expect(DECISION_TYPES).toHaveProperty('database');
    });
  });

  describe('PRIORITY_LEVELS constant', () => {
    it('should have all required priority levels', () => {
      expect(PRIORITY_LEVELS).toHaveProperty('critical');
      expect(PRIORITY_LEVELS).toHaveProperty('high');
      expect(PRIORITY_LEVELS).toHaveProperty('medium');
      expect(PRIORITY_LEVELS).toHaveProperty('low');
    });
  });
});
