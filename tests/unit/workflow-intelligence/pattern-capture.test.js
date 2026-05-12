/**
 * @fileoverview Unit tests for PatternCapture module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

describe('PatternCapture (Unit)', () => {
  let PatternCapture, createPatternCapture, DEFAULT_MIN_SEQUENCE_LENGTH, KEY_WORKFLOW_COMMANDS;

  beforeAll(() => {
    const module = require('../../../.aiox-core/workflow-intelligence/learning/pattern-capture');
    PatternCapture = module.PatternCapture;
    createPatternCapture = module.createPatternCapture;
    DEFAULT_MIN_SEQUENCE_LENGTH = module.DEFAULT_MIN_SEQUENCE_LENGTH;
    KEY_WORKFLOW_COMMANDS = module.KEY_WORKFLOW_COMMANDS;
  });

  describe('Module Exports', () => {
    it('should export PatternCapture class', () => {
      expect(PatternCapture).toBeDefined();
      expect(typeof PatternCapture).toBe('function');
    });

    it('should export createPatternCapture factory', () => {
      expect(createPatternCapture).toBeDefined();
      expect(typeof createPatternCapture).toBe('function');
    });

    it('should export DEFAULT_MIN_SEQUENCE_LENGTH', () => {
      expect(DEFAULT_MIN_SEQUENCE_LENGTH).toBe(3);
    });

    it('should export KEY_WORKFLOW_COMMANDS', () => {
      expect(KEY_WORKFLOW_COMMANDS).toContain('develop');
      expect(KEY_WORKFLOW_COMMANDS).toContain('review-qa');
    });
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const capture = createPatternCapture();
      expect(capture).toBeInstanceOf(PatternCapture);
      expect(capture.minSequenceLength).toBe(3);
    });

    it('should accept custom minSequenceLength', () => {
      const capture = createPatternCapture({ minSequenceLength: 5 });
      expect(capture.minSequenceLength).toBe(5);
    });

    it('should accept custom keyCommands', () => {
      const customCommands = ['custom-task', 'another-task'];
      const capture = createPatternCapture({ keyCommands: customCommands });
      expect(capture.keyCommands).toEqual(customCommands);
    });

    it('should respect enabled option', () => {
      const capture = createPatternCapture({ enabled: false });
      expect(capture.enabled).toBe(false);
    });
  });

  describe('captureSession', () => {
    let capture;

    beforeEach(() => {
      capture = createPatternCapture({ enabled: true });
    });

    it('should capture valid session data', () => {
      const sessionData = {
        commands: ['validate-story-draft', 'develop', 'review-qa', 'create-pr'],
        agentSequence: ['sm', 'dev', 'qa'],
        success: true,
        timestamp: Date.now(),
        sessionId: 'test-session-1',
      };

      const result = capture.captureSession(sessionData);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBeDefined();
      expect(result.pattern.sequence).toHaveLength(4);
      expect(result.pattern.agents).toEqual(['sm', 'dev', 'qa']);
      expect(result.pattern.occurrences).toBe(1);
      expect(result.pattern.successRate).toBe(1.0);
      expect(result.pattern.status).toBe('pending');
    });

    it('should reject session when capture is disabled', () => {
      const disabledCapture = createPatternCapture({ enabled: false });
      const result = disabledCapture.captureSession({
        commands: ['a', 'b', 'c'],
        success: true,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should reject null or invalid session data', () => {
      expect(capture.captureSession(null).valid).toBe(false);
      expect(capture.captureSession({}).valid).toBe(false);
      expect(capture.captureSession({ commands: null }).valid).toBe(false);
    });

    it('should reject unsuccessful workflows', () => {
      const result = capture.captureSession({
        commands: ['develop', 'review-qa', 'apply-qa-fixes'],
        success: false,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not successful');
    });

    it('should reject sequences shorter than minimum length', () => {
      const result = capture.captureSession({
        commands: ['develop', 'review-qa'],
        success: true,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('too short');
    });

    it('should normalize command names (remove * prefix)', () => {
      const result = capture.captureSession({
        commands: ['*develop', '*review-qa', '*apply-qa-fixes'],
        success: true,
      });

      expect(result.valid).toBe(true);
      expect(result.pattern.sequence).toEqual(['develop', 'review-qa', 'apply-qa-fixes']);
    });

    it('should detect story_development workflow', () => {
      const result = capture.captureSession({
        commands: ['develop', 'review-qa', 'apply-qa-fixes'],
        success: true,
      });

      expect(result.pattern.workflow).toBe('story_development');
    });

    it('should detect story_creation workflow', () => {
      const result = capture.captureSession({
        commands: ['create-story', 'validate-story-draft', 'develop'],
        success: true,
      });

      expect(result.pattern.workflow).toBe('story_creation');
    });

    it('should generate unique pattern IDs', () => {
      const result1 = capture.captureSession({
        commands: ['a', 'b', 'c'],
        success: true,
      });
      const result2 = capture.captureSession({
        commands: ['x', 'y', 'z'],
        success: true,
      });

      expect(result1.pattern.id).not.toBe(result2.pattern.id);
    });
  });

  describe('extractPatterns', () => {
    let capture;

    beforeEach(() => {
      capture = createPatternCapture();
    });

    it('should extract patterns from command history', () => {
      const history = ['develop', 'review-qa', 'apply-qa-fixes', 'create-pr'];
      const patterns = capture.extractPatterns(history);

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return empty array for null or short history', () => {
      expect(capture.extractPatterns(null)).toEqual([]);
      expect(capture.extractPatterns([])).toEqual([]);
      expect(capture.extractPatterns(['a', 'b'])).toEqual([]);
    });

    it('should use sliding window for pattern extraction', () => {
      const history = ['develop', 'review-qa', 'apply-qa-fixes', 'run-tests'];
      const patterns = capture.extractPatterns(history);

      // Should find patterns of length 3 and 4
      const lengths = patterns.map((p) => p.length);
      expect(lengths).toContain(3);
      expect(lengths).toContain(4);
    });

    it('should only include patterns with key commands', () => {
      const history = ['unknown1', 'unknown2', 'unknown3'];
      const patterns = capture.extractPatterns(history);

      expect(patterns).toHaveLength(0);
    });
  });

  describe('getMinimumSequenceLength', () => {
    it('should return the configured minimum sequence length', () => {
      const capture = createPatternCapture({ minSequenceLength: 7 });
      expect(capture.getMinimumSequenceLength()).toBe(7);
    });
  });

  describe('onTaskComplete', () => {
    let capture;

    beforeEach(() => {
      capture = createPatternCapture({ enabled: true });
      capture.clearSession();
    });

    it('should buffer commands in session', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test' });
      await capture.onTaskComplete('review-qa', { sessionId: 'test' });

      const session = capture.sessionBuffer.get('test');
      expect(session.commands).toContain('develop');
      expect(session.commands).toContain('review-qa');
    });

    it('should track agents in session', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test', agentId: '@dev' });
      await capture.onTaskComplete('review-qa', { sessionId: 'test', agentId: '@qa' });

      const session = capture.sessionBuffer.get('test');
      expect(session.agents).toContain('dev');
      expect(session.agents).toContain('qa');
    });

    it('should capture pattern on workflow-ending command', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test' });
      await capture.onTaskComplete('review-qa', { sessionId: 'test' });
      const result = await capture.onTaskComplete('create-pr', { sessionId: 'test' });

      expect(result.captured).toBe(true);
      expect(result.pattern).toBeDefined();
    });

    it('should return workflow_in_progress for non-ending commands', async () => {
      const result = await capture.onTaskComplete('develop', { sessionId: 'test' });

      expect(result.captured).toBe(false);
      expect(result.reason).toBe('workflow_in_progress');
    });

    it('should clear session after capturing', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test' });
      await capture.onTaskComplete('review-qa', { sessionId: 'test' });
      await capture.onTaskComplete('create-pr', { sessionId: 'test' });

      expect(capture.sessionBuffer.has('test')).toBe(false);
    });

    it('should handle disabled capture', async () => {
      const disabledCapture = createPatternCapture({ enabled: false });
      const result = await disabledCapture.onTaskComplete('develop', {});

      expect(result.captured).toBe(false);
      expect(result.reason).toBe('disabled');
    });
  });

  describe('markSessionFailed', () => {
    let capture;

    beforeEach(() => {
      capture = createPatternCapture({ enabled: true });
      capture.clearSession();
    });

    it('should mark session as failed', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test' });
      capture.markSessionFailed('test');

      const session = capture.sessionBuffer.get('test');
      expect(session.success).toBe(false);
    });

    it('should prevent pattern capture after marking failed', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test' });
      capture.markSessionFailed('test');
      await capture.onTaskComplete('review-qa', { sessionId: 'test' });
      const result = await capture.onTaskComplete('create-pr', { sessionId: 'test' });

      expect(result.captured).toBe(false);
    });
  });

  describe('clearSession', () => {
    let capture;

    beforeEach(() => {
      capture = createPatternCapture({ enabled: true });
    });

    it('should clear specific session', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test1' });
      await capture.onTaskComplete('develop', { sessionId: 'test2' });

      capture.clearSession('test1');

      expect(capture.sessionBuffer.has('test1')).toBe(false);
      expect(capture.sessionBuffer.has('test2')).toBe(true);
    });

    it('should clear all sessions when no ID provided', async () => {
      await capture.onTaskComplete('develop', { sessionId: 'test1' });
      await capture.onTaskComplete('develop', { sessionId: 'test2' });

      capture.clearSession();

      expect(capture.sessionBuffer.size).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should capture session in under 50ms', () => {
      const capture = createPatternCapture({ enabled: true });
      const sessionData = {
        commands: ['develop', 'review-qa', 'apply-qa-fixes', 'run-tests', 'create-pr'],
        agentSequence: ['dev', 'qa'],
        success: true,
        timestamp: Date.now(),
      };

      const start = Date.now();
      capture.captureSession(sessionData);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should extract patterns in under 50ms', () => {
      const capture = createPatternCapture();
      const history = Array(20)
        .fill(null)
        .map((_, i) => (i % 3 === 0 ? 'develop' : i % 3 === 1 ? 'review-qa' : 'run-tests'));

      const start = Date.now();
      capture.extractPatterns(history);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
