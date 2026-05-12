/**
 * @fileoverview Unit tests for PatternValidator module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

describe('PatternValidator (Unit)', () => {
  let PatternValidator, createPatternValidator, DEFAULT_VALIDATION_RULES, KNOWN_COMMANDS;

  beforeAll(() => {
    const module = require('../../../.aiox-core/workflow-intelligence/learning/pattern-validator');
    PatternValidator = module.PatternValidator;
    createPatternValidator = module.createPatternValidator;
    DEFAULT_VALIDATION_RULES = module.DEFAULT_VALIDATION_RULES;
    KNOWN_COMMANDS = module.KNOWN_COMMANDS;
  });

  describe('Module Exports', () => {
    it('should export PatternValidator class', () => {
      expect(PatternValidator).toBeDefined();
      expect(typeof PatternValidator).toBe('function');
    });

    it('should export createPatternValidator factory', () => {
      expect(createPatternValidator).toBeDefined();
      expect(typeof createPatternValidator).toBe('function');
    });

    it('should export DEFAULT_VALIDATION_RULES', () => {
      expect(DEFAULT_VALIDATION_RULES).toBeDefined();
      expect(DEFAULT_VALIDATION_RULES.minSequenceLength).toBe(3);
      expect(DEFAULT_VALIDATION_RULES.maxSequenceLength).toBe(10);
      expect(DEFAULT_VALIDATION_RULES.minOccurrences).toBe(2);
      expect(DEFAULT_VALIDATION_RULES.minSuccessRate).toBe(0.8);
    });

    it('should export KNOWN_COMMANDS set', () => {
      expect(KNOWN_COMMANDS).toBeInstanceOf(Set);
      expect(KNOWN_COMMANDS.has('develop')).toBe(true);
      expect(KNOWN_COMMANDS.has('review-qa')).toBe(true);
    });
  });

  describe('Constructor', () => {
    it('should create instance with default rules', () => {
      const validator = createPatternValidator();
      expect(validator).toBeInstanceOf(PatternValidator);
      expect(validator.rules.minSequenceLength).toBe(3);
    });

    it('should accept custom rules', () => {
      const validator = createPatternValidator({
        rules: { minSequenceLength: 5, minSuccessRate: 0.9 },
      });
      expect(validator.rules.minSequenceLength).toBe(5);
      expect(validator.rules.minSuccessRate).toBe(0.9);
    });

    it('should merge custom rules with defaults', () => {
      const validator = createPatternValidator({
        rules: { minSequenceLength: 5 },
      });
      expect(validator.rules.minSequenceLength).toBe(5);
      expect(validator.rules.maxSequenceLength).toBe(10); // Default preserved
    });
  });

  describe('validate', () => {
    let validator;

    beforeEach(() => {
      validator = createPatternValidator();
    });

    describe('Required Fields', () => {
      it('should reject null pattern', () => {
        const result = validator.validate(null);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Pattern is null or undefined');
      });

      it('should reject pattern without sequence', () => {
        const result = validator.validate({});
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing or invalid sequence');
      });

      it('should reject pattern with non-array sequence', () => {
        const result = validator.validate({ sequence: 'not-an-array' });
        expect(result.valid).toBe(false);
      });
    });

    describe('Sequence Length Rules', () => {
      it('should reject sequences shorter than minimum', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa'],
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('too short'))).toBe(true);
      });

      it('should accept sequences at minimum length', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        });
        expect(result.valid).toBe(true);
      });

      it('should warn for unusually long sequences', () => {
        const result = validator.validate({
          sequence: Array(12).fill('develop'),
        });
        expect(result.warnings.some((w) => w.includes('unusually long'))).toBe(true);
      });
    });

    describe('Occurrence Rules', () => {
      it('should warn for low occurrences', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          occurrences: 1,
        });
        expect(result.warnings.some((w) => w.includes('Low occurrences'))).toBe(true);
      });

      it('should not warn when occurrences meet minimum', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          occurrences: 2,
        });
        expect(result.warnings.some((w) => w.includes('occurrences'))).toBe(false);
      });
    });

    describe('Success Rate Rules', () => {
      it('should reject patterns with low success rate', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          successRate: 0.5,
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Success rate too low'))).toBe(true);
      });

      it('should accept patterns with high success rate', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          successRate: 0.9,
        });
        expect(result.valid).toBe(true);
      });
    });

    describe('Key Command Rules', () => {
      it('should reject patterns without key workflow commands', () => {
        const result = validator.validate({
          sequence: ['unknown1', 'unknown2', 'unknown3'],
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('key workflow command'))).toBe(true);
      });

      it('should accept patterns with at least one key command', () => {
        const result = validator.validate({
          sequence: ['develop', 'unknown1', 'unknown2'],
        });
        // May have warnings but should be valid
        expect(result.errors.some((e) => e.includes('key workflow command'))).toBe(false);
      });
    });

    describe('Unknown Commands Warning', () => {
      it('should warn about unknown commands', () => {
        const result = validator.validate({
          sequence: ['develop', 'totally-unknown-cmd', 'review-qa'],
        });
        expect(result.warnings.some((w) => w.includes('Unknown commands'))).toBe(true);
      });

      it('should not warn for known commands', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'run-tests'],
        });
        expect(result.warnings.some((w) => w.includes('Unknown commands'))).toBe(false);
      });
    });

    describe('Duplicate Consecutive Commands', () => {
      it('should warn about duplicate consecutive commands', () => {
        const result = validator.validate({
          sequence: ['develop', 'develop', 'review-qa'],
        });
        expect(result.warnings.some((w) => w.includes('duplicate consecutive'))).toBe(true);
      });

      it('should not warn for non-consecutive duplicates', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'develop'],
        });
        expect(result.warnings.some((w) => w.includes('duplicate consecutive'))).toBe(false);
      });
    });

    describe('Valid Pattern', () => {
      it('should validate complete valid pattern', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          occurrences: 5,
          successRate: 0.95,
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.reason).toBeNull();
      });
    });
  });

  describe('isDuplicate', () => {
    let validator;

    beforeEach(() => {
      validator = createPatternValidator();
    });

    it('should return false for empty existing patterns', () => {
      const result = validator.isDuplicate({ sequence: ['a', 'b', 'c'] }, []);
      expect(result.isDuplicate).toBe(false);
    });

    it('should detect exact duplicates', () => {
      const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };
      const existing = [{ id: 'p1', sequence: ['develop', 'review-qa', 'apply-qa-fixes'] }];

      const result = validator.isDuplicate(pattern, existing);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOf).toBe('p1');
      expect(result.exact).toBe(true);
    });

    it('should detect similar patterns above threshold', () => {
      const pattern = { sequence: ['develop', 'review-qa', 'run-tests'] };
      const existing = [{ id: 'p1', sequence: ['develop', 'review-qa', 'apply-qa-fixes'] }];

      const result = validator.isDuplicate(pattern, existing);

      // 2 out of 3 commands match in same order positions
      // Jaccard: 2/4 = 0.5, Order: 2/3 = 0.67, Combined: 0.5*0.4 + 0.67*0.6 = 0.60
      // With default 0.85 threshold, this should NOT be a duplicate
      expect(result.isDuplicate).toBe(false);
      expect(result.similarity).toBeUndefined(); // No similarity when not duplicate
    });

    it('should not flag different patterns as duplicates', () => {
      const pattern = { sequence: ['create-story', 'validate-story-draft', 'develop'] };
      const existing = [{ id: 'p1', sequence: ['develop', 'review-qa', 'apply-qa-fixes'] }];

      const result = validator.isDuplicate(pattern, existing);

      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('meetsMinimumThreshold', () => {
    let validator;

    beforeEach(() => {
      validator = createPatternValidator();
    });

    it('should pass pattern meeting all thresholds', () => {
      const result = validator.meetsMinimumThreshold({
        occurrences: 5,
        successRate: 0.95,
      });

      expect(result.meetsThreshold).toBe(true);
      expect(result.meetsOccurrences).toBe(true);
      expect(result.meetsSuccessRate).toBe(true);
    });

    it('should fail pattern not meeting occurrence threshold', () => {
      const result = validator.meetsMinimumThreshold({
        occurrences: 1,
        successRate: 0.95,
      });

      expect(result.meetsThreshold).toBe(false);
      expect(result.meetsOccurrences).toBe(false);
      expect(result.meetsSuccessRate).toBe(true);
    });

    it('should fail pattern not meeting success rate threshold', () => {
      const result = validator.meetsMinimumThreshold({
        occurrences: 5,
        successRate: 0.5,
      });

      expect(result.meetsThreshold).toBe(false);
      expect(result.meetsOccurrences).toBe(true);
      expect(result.meetsSuccessRate).toBe(false);
    });

    it('should return current and required values', () => {
      const result = validator.meetsMinimumThreshold({
        occurrences: 3,
        successRate: 0.85,
      });

      expect(result.currentOccurrences).toBe(3);
      expect(result.requiredOccurrences).toBe(2);
      expect(result.currentSuccessRate).toBe(0.85);
      expect(result.requiredSuccessRate).toBe(0.8);
    });
  });

  describe('getValidationRules', () => {
    it('should return copy of rules', () => {
      const validator = createPatternValidator();
      const rules = validator.getValidationRules();

      rules.minSequenceLength = 100;

      expect(validator.rules.minSequenceLength).toBe(3);
    });
  });

  describe('updateRules', () => {
    it('should update specific rules', () => {
      const validator = createPatternValidator();
      validator.updateRules({ minSequenceLength: 5 });

      expect(validator.rules.minSequenceLength).toBe(5);
      expect(validator.rules.maxSequenceLength).toBe(10);
    });
  });

  describe('Performance', () => {
    it('should validate pattern in under 10ms', () => {
      const validator = createPatternValidator();
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes', 'run-tests'],
        occurrences: 5,
        successRate: 0.95,
      };

      const start = Date.now();
      validator.validate(pattern);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it('should check duplicates in under 50ms for 100 patterns', () => {
      const validator = createPatternValidator();
      const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };
      const existing = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: `p${i}`,
          sequence: [`cmd${i}`, `cmd${i + 1}`, `cmd${i + 2}`],
        }));

      const start = Date.now();
      validator.isDuplicate(pattern, existing);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
