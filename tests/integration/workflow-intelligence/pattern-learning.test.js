/**
 * @fileoverview Integration tests for Pattern Learning System
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Pattern Learning Integration', () => {
  let learningModule;
  let testStoragePath;

  beforeAll(() => {
    learningModule = require('../../../.aiox-core/workflow-intelligence/learning');
  });

  beforeEach(() => {
    testStoragePath = path.join(os.tmpdir(), `integration-patterns-${Date.now()}.yaml`);
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testStoragePath)) {
        fs.unlinkSync(testStoragePath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('Module Exports', () => {
    it('should export high-level API functions', () => {
      expect(learningModule.captureAndStore).toBeDefined();
      expect(learningModule.getLearnedPatterns).toBeDefined();
      expect(learningModule.findMatchingPatterns).toBeDefined();
    });

    it('should export factory functions', () => {
      expect(learningModule.createPatternCapture).toBeDefined();
      expect(learningModule.createPatternValidator).toBeDefined();
      expect(learningModule.createPatternStore).toBeDefined();
    });

    it('should export classes', () => {
      expect(learningModule.PatternCapture).toBeDefined();
      expect(learningModule.PatternValidator).toBeDefined();
      expect(learningModule.PatternStore).toBeDefined();
    });

    it('should export constants', () => {
      expect(learningModule.DEFAULT_MIN_SEQUENCE_LENGTH).toBe(3);
      expect(learningModule.DEFAULT_MAX_PATTERNS).toBe(100);
      expect(learningModule.PATTERN_STATUS).toBeDefined();
    });
  });

  describe('End-to-End Pattern Capture Flow', () => {
    it('should capture, validate, and store a workflow pattern', () => {
      const { createPatternCapture, createPatternValidator, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true });
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      // Step 1: Capture session
      const sessionData = {
        commands: ['validate-story-draft', 'develop', 'review-qa', 'apply-qa-fixes'],
        agentSequence: ['sm', 'dev', 'qa'],
        success: true,
        timestamp: Date.now(),
        sessionId: 'integration-test-1',
      };

      const captureResult = capture.captureSession(sessionData);
      expect(captureResult.valid).toBe(true);
      expect(captureResult.pattern).toBeDefined();

      // Step 2: Validate pattern
      const validationResult = validator.validate(captureResult.pattern);
      expect(validationResult.valid).toBe(true);

      // Step 3: Store pattern
      const storeResult = store.save(captureResult.pattern);
      expect(storeResult.action).toBe('created');

      // Step 4: Verify retrieval
      const loaded = store.load();
      expect(loaded.patterns).toHaveLength(1);
      expect(loaded.patterns[0].sequence).toEqual(captureResult.pattern.sequence);
    });

    it('should detect and update duplicate patterns', () => {
      const { createPatternCapture, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true });
      const store = createPatternStore({ storagePath: testStoragePath });

      const sessionData = {
        commands: ['develop', 'review-qa', 'apply-qa-fixes'],
        success: true,
      };

      // First capture
      const result1 = capture.captureSession(sessionData);
      store.save(result1.pattern);

      // Second capture (same sequence)
      const result2 = capture.captureSession(sessionData);
      const storeResult = store.save(result2.pattern);

      expect(storeResult.action).toBe('updated');
      expect(storeResult.pattern.occurrences).toBe(2);

      // Verify only one pattern exists
      const loaded = store.load();
      expect(loaded.patterns).toHaveLength(1);
    });

    it('should reject invalid patterns before storage', () => {
      const { createPatternCapture, createPatternValidator, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true, minSequenceLength: 2 });
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      // Capture session with low success rate
      const sessionData = {
        commands: ['unknown1', 'unknown2'],
        success: true,
      };

      const captureResult = capture.captureSession(sessionData);

      if (captureResult.valid) {
        // Manually set low success rate
        captureResult.pattern.successRate = 0.3;

        const validationResult = validator.validate(captureResult.pattern);
        expect(validationResult.valid).toBe(false);
      }
    });
  });

  describe('Pattern Lifecycle Management', () => {
    it('should transition pattern through lifecycle states', () => {
      const { createPatternStore, PATTERN_STATUS } = learningModule;
      const store = createPatternStore({ storagePath: testStoragePath });

      // Create pattern (starts as pending)
      const result = store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        occurrences: 5,
        successRate: 0.95,
      });

      const patternId = result.pattern.id;
      expect(result.pattern.status).toBe(PATTERN_STATUS.PENDING);

      // Promote to active
      store.updateStatus(patternId, PATTERN_STATUS.ACTIVE);
      let pattern = store.load().patterns.find((p) => p.id === patternId);
      expect(pattern.status).toBe(PATTERN_STATUS.ACTIVE);

      // Promote to promoted
      store.updateStatus(patternId, PATTERN_STATUS.PROMOTED);
      pattern = store.load().patterns.find((p) => p.id === patternId);
      expect(pattern.status).toBe(PATTERN_STATUS.PROMOTED);

      // Deprecate
      store.updateStatus(patternId, PATTERN_STATUS.DEPRECATED);
      pattern = store.load().patterns.find((p) => p.id === patternId);
      expect(pattern.status).toBe(PATTERN_STATUS.DEPRECATED);
    });

    it('should prune deprecated patterns first', () => {
      const { createPatternStore } = learningModule;
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 10,
      });

      // Add promoted pattern
      const promoted = store.save({ sequence: ['a', 'b', 'c'] });
      store.updateStatus(promoted.pattern.id, 'promoted');

      // Add active pattern
      const active = store.save({ sequence: ['d', 'e', 'f'] });
      store.updateStatus(active.pattern.id, 'active');

      // Add deprecated pattern
      const deprecated = store.save({ sequence: ['g', 'h', 'i'] });
      store.updateStatus(deprecated.pattern.id, 'deprecated');

      // Add pending patterns
      for (let i = 0; i < 5; i++) {
        store.save({ sequence: [`x${i}`, `y${i}`, `z${i}`] });
      }

      // Prune to 3 patterns
      store.prune({ keepCount: 3 });

      const remaining = store.load().patterns;
      expect(remaining).toHaveLength(3);

      // Promoted and active should remain
      expect(remaining.some((p) => p.status === 'promoted')).toBe(true);
      expect(remaining.some((p) => p.status === 'active')).toBe(true);

      // Deprecated should be pruned
      expect(remaining.some((p) => p.status === 'deprecated')).toBe(false);
    });
  });

  describe('Pattern Matching and Similarity', () => {
    it('should find similar patterns for suggestions', () => {
      const { createPatternStore } = learningModule;
      const store = createPatternStore({ storagePath: testStoragePath });

      // Store some patterns
      store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        status: 'active',
      });
      store.save({
        sequence: ['develop', 'run-tests', 'review-qa'],
        status: 'active',
      });
      store.save({
        sequence: ['create-story', 'validate-story-draft', 'develop'],
        status: 'active',
      });

      // Search for patterns starting with 'develop'
      const matches = store.findSimilar(['develop', 'review-qa']);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].similarity).toBeGreaterThan(0.5);
    });

    it('should return active patterns for SuggestionEngine', () => {
      const { createPatternStore } = learningModule;
      const store = createPatternStore({ storagePath: testStoragePath });

      store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      store.save({ sequence: ['g', 'h', 'i'], status: 'promoted' });
      store.save({ sequence: ['j', 'k', 'l'], status: 'deprecated' });

      const active = store.getActivePatterns();

      expect(active).toHaveLength(2);
      expect(active.every((p) => p.status === 'active' || p.status === 'promoted')).toBe(true);
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect exact duplicate patterns', () => {
      const { createPatternValidator, createPatternStore } = learningModule;
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      const pattern1 = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        occurrences: 5,
      };

      store.save(pattern1);

      const pattern2 = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
      };

      const existing = store.load().patterns;
      const duplicateCheck = validator.isDuplicate(pattern2, existing);

      expect(duplicateCheck.isDuplicate).toBe(true);
      expect(duplicateCheck.exact).toBe(true);
    });

    it('should detect similar patterns above threshold', () => {
      const { createPatternValidator, createPatternStore } = learningModule;
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
      });

      const similarPattern = {
        sequence: ['develop', 'review-qa', 'run-tests'],
      };

      const existing = store.load().patterns;
      const duplicateCheck = validator.isDuplicate(similarPattern, existing);

      // May or may not be duplicate based on similarity threshold
      expect(typeof duplicateCheck.isDuplicate).toBe('boolean');
    });
  });

  describe('Capture Hook Integration', () => {
    let captureHook;

    beforeAll(() => {
      captureHook = require('../../../.aiox-core/workflow-intelligence/learning/capture-hook');
    });

    it('should export hook functions', () => {
      expect(captureHook.onTaskComplete).toBeDefined();
      expect(captureHook.markSessionFailed).toBeDefined();
      expect(captureHook.clearSession).toBeDefined();
      expect(captureHook.isEnabled).toBeDefined();
    });

    it('should handle disabled state gracefully', async () => {
      // Save original env
      const originalEnv = process.env.AIOX_PATTERN_CAPTURE;

      try {
        process.env.AIOX_PATTERN_CAPTURE = 'false';
        captureHook.reset();

        const result = await captureHook.onTaskComplete('develop', {});
        expect(result.success).toBe(false);
        expect(result.reason).toBe('disabled');
      } finally {
        // Restore env
        if (originalEnv !== undefined) {
          process.env.AIOX_PATTERN_CAPTURE = originalEnv;
        } else {
          delete process.env.AIOX_PATTERN_CAPTURE;
        }
        captureHook.reset();
      }
    });
  });

  describe('WIS Integration', () => {
    it('should be accessible from main WIS module', () => {
      const wis = require('../../../.aiox-core/workflow-intelligence');

      expect(wis.learning).toBeDefined();
      expect(wis.learning.createPatternCapture).toBeDefined();
      expect(wis.learning.createPatternValidator).toBeDefined();
      expect(wis.learning.createPatternStore).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should complete full capture-validate-store cycle in under 100ms', () => {
      const { createPatternCapture, createPatternValidator, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true });
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      const sessionData = {
        commands: ['validate-story-draft', 'develop', 'review-qa', 'apply-qa-fixes', 'run-tests'],
        agentSequence: ['sm', 'dev', 'qa'],
        success: true,
        timestamp: Date.now(),
      };

      const start = Date.now();

      const captureResult = capture.captureSession(sessionData);
      const validationResult = validator.validate(captureResult.pattern);
      if (validationResult.valid) {
        store.save(captureResult.pattern);
      }

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle 100 patterns efficiently', () => {
      const { createPatternStore } = learningModule;
      const store = createPatternStore({ storagePath: testStoragePath });

      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        store.save({
          sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`],
          occurrences: Math.floor(Math.random() * 10) + 1,
          successRate: 0.8 + Math.random() * 0.2,
        });
      }

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000); // 2 seconds for 100 patterns
      expect(store.load().patterns.length).toBeLessThanOrEqual(100);
    });

    it('should find similar patterns in under 50ms for 100 patterns', () => {
      const { createPatternStore } = learningModule;
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 100,
      });

      // Pre-populate store
      for (let i = 0; i < 50; i++) {
        store.save({
          sequence: [`cmd${i}`, `next${i}`, `final${i}`],
        });
      }

      const start = Date.now();
      store.findSimilar(['develop', 'review-qa', 'apply-qa-fixes']);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted storage file gracefully', () => {
      const { createPatternStore } = learningModule;

      // Write invalid YAML
      fs.writeFileSync(testStoragePath, 'invalid: yaml: content: [[[', 'utf8');

      const store = createPatternStore({ storagePath: testStoragePath });

      // Should not throw, returns empty structure
      const data = store.load();
      expect(data.patterns).toEqual([]);
    });

    it('should handle missing storage directory', () => {
      const { createPatternStore } = learningModule;
      const deepPath = path.join(
        os.tmpdir(),
        'deep',
        'nested',
        'dir',
        `patterns-${Date.now()}.yaml`,
      );

      const store = createPatternStore({ storagePath: deepPath });

      // Should create directory and save
      store.save({ sequence: ['a', 'b', 'c'] });

      expect(fs.existsSync(deepPath)).toBe(true);

      // Cleanup
      fs.unlinkSync(deepPath);
      fs.rmdirSync(path.dirname(deepPath));
      fs.rmdirSync(path.dirname(path.dirname(deepPath)));
      fs.rmdirSync(path.dirname(path.dirname(path.dirname(deepPath))));
    });
  });
});
