/**
 * Task Complexity Classifier Tests
 * Story GEMINI-INT.16
 */

const {
  TaskComplexityClassifier,
  COMPLEXITY_INDICATORS,
} = require('../../../.aiox-core/core/orchestration/task-complexity-classifier');

describe('TaskComplexityClassifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = new TaskComplexityClassifier();
  });

  describe('COMPLEXITY_INDICATORS', () => {
    it('should have indicators for all complexity levels', () => {
      expect(COMPLEXITY_INDICATORS.simple).toBeDefined();
      expect(COMPLEXITY_INDICATORS.medium).toBeDefined();
      expect(COMPLEXITY_INDICATORS.complex).toBeDefined();
    });

    it('should have keywords for each level', () => {
      expect(COMPLEXITY_INDICATORS.simple.keywords).toContain('format');
      expect(COMPLEXITY_INDICATORS.medium.keywords).toContain('implement');
      expect(COMPLEXITY_INDICATORS.complex.keywords).toContain('architecture');
    });
  });

  describe('classify', () => {
    it('should classify simple tasks', () => {
      const task = {
        description: 'Fix typo in readme file',
        files: ['README.md'],
        acceptanceCriteria: ['Fix spelling'],
      };

      const result = classifier.classify(task);

      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('confidence');
    });

    it('should classify complex tasks', () => {
      const task = {
        description: 'Design new architecture for security system with performance optimization',
        files: ['src/a.js', 'src/b.js', 'src/c.js', 'src/d.js', 'src/e.js', 'src/f.js'],
        acceptanceCriteria: ['AC1', 'AC2', 'AC3', 'AC4', 'AC5', 'AC6', 'AC7', 'AC8'],
      };

      const result = classifier.classify(task);

      expect(result.level).toBe('complex');
      expect(result.score).toBeGreaterThan(0.5);
    });

    it('should handle empty task description', () => {
      const task = { description: '' };

      const result = classifier.classify(task);

      expect(result).toHaveProperty('level');
      expect(['simple', 'medium', 'complex']).toContain(result.level);
    });

    it('should return confidence score', () => {
      const task = {
        description: 'Implement new feature for user authentication',
        files: ['auth.js'],
      };

      const result = classifier.classify(task);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('thresholds', () => {
    it('should use default thresholds', () => {
      expect(classifier.thresholds.simple).toBe(0.3);
      expect(classifier.thresholds.complex).toBe(0.7);
    });

    it('should accept custom thresholds', () => {
      const custom = new TaskComplexityClassifier({
        simpleThreshold: 0.2,
        complexThreshold: 0.8,
      });

      expect(custom.thresholds.simple).toBe(0.2);
      expect(custom.thresholds.complex).toBe(0.8);
    });
  });
});
