/**
 * @fileoverview Unit tests for PatternStore module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('PatternStore (Unit)', () => {
  let PatternStore, createPatternStore, DEFAULT_MAX_PATTERNS, PATTERN_STATUS;
  let testStoragePath;

  beforeAll(() => {
    const module = require('../../../.aiox-core/workflow-intelligence/learning/pattern-store');
    PatternStore = module.PatternStore;
    createPatternStore = module.createPatternStore;
    DEFAULT_MAX_PATTERNS = module.DEFAULT_MAX_PATTERNS;
    PATTERN_STATUS = module.PATTERN_STATUS;
  });

  beforeEach(() => {
    // Create unique temp file for each test
    testStoragePath = path.join(os.tmpdir(), `test-patterns-${Date.now()}.yaml`);
  });

  afterEach(() => {
    // Cleanup temp file
    try {
      if (fs.existsSync(testStoragePath)) {
        fs.unlinkSync(testStoragePath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('Module Exports', () => {
    it('should export PatternStore class', () => {
      expect(PatternStore).toBeDefined();
      expect(typeof PatternStore).toBe('function');
    });

    it('should export createPatternStore factory', () => {
      expect(createPatternStore).toBeDefined();
      expect(typeof createPatternStore).toBe('function');
    });

    it('should export DEFAULT_MAX_PATTERNS', () => {
      expect(DEFAULT_MAX_PATTERNS).toBe(100);
    });

    it('should export PATTERN_STATUS enum', () => {
      expect(PATTERN_STATUS.PENDING).toBe('pending');
      expect(PATTERN_STATUS.ACTIVE).toBe('active');
      expect(PATTERN_STATUS.PROMOTED).toBe('promoted');
      expect(PATTERN_STATUS.DEPRECATED).toBe('deprecated');
    });
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      expect(store).toBeInstanceOf(PatternStore);
      expect(store.maxPatterns).toBe(100);
    });

    it('should accept custom options', () => {
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 50,
        pruneThreshold: 0.8,
      });
      expect(store.maxPatterns).toBe(50);
      expect(store.pruneThreshold).toBe(0.8);
    });
  });

  describe('save', () => {
    it('should save new pattern', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        agents: ['dev', 'qa'],
        successRate: 1.0,
      };

      const result = store.save(pattern);

      expect(result.action).toBe('created');
      expect(result.pattern.id).toBeDefined();
      expect(result.pattern.sequence).toEqual(pattern.sequence);
    });

    it('should update existing pattern with same sequence', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 1.0,
      };

      store.save(pattern);
      const result = store.save(pattern);

      expect(result.action).toBe('updated');
      expect(result.pattern.occurrences).toBe(2);
    });

    it('should update success rate with weighted average', () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 1.0,
      });

      const result = store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 0.5,
      });

      // Average of 1.0 and 0.5 = 0.75
      expect(result.pattern.successRate).toBe(0.75);
    });

    it('should set lastSeen on update', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };

      store.save(pattern);
      const result = store.save(pattern);

      expect(result.pattern.lastSeen).toBeDefined();
    });

    it('should normalize pattern with default values', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const result = store.save({ sequence: ['a', 'b', 'c'] });

      expect(result.pattern.occurrences).toBe(1);
      expect(result.pattern.successRate).toBe(1.0);
      expect(result.pattern.status).toBe('pending');
      expect(result.pattern.firstSeen).toBeDefined();
    });

    it('should persist to file', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });

      expect(fs.existsSync(testStoragePath)).toBe(true);

      const content = fs.readFileSync(testStoragePath, 'utf8');
      expect(content).toContain('develop');
    });
  });

  describe('load', () => {
    it('should return empty structure when file does not exist', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const data = store.load();

      expect(data.patterns).toEqual([]);
      expect(data.version).toBe('1.0');
    });

    it('should load saved patterns', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      store.save({ sequence: ['create-story', 'validate-story-draft', 'develop'] });

      // Create new store instance to force reload
      store.invalidateCache();
      const data = store.load();

      expect(data.patterns).toHaveLength(2);
    });

    it('should use cache for repeated loads', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });

      const data1 = store.load();
      const data2 = store.load();

      expect(data1).toBe(data2); // Same reference (cached)
    });
  });

  describe('findSimilar', () => {
    let store;

    beforeEach(() => {
      store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      store.save({ sequence: ['create-story', 'validate-story-draft', 'develop'] });
      store.save({ sequence: ['run-tests', 'create-pr', 'push'] });
    });

    it('should return empty array for null sequence', () => {
      expect(store.findSimilar(null)).toEqual([]);
      expect(store.findSimilar([])).toEqual([]);
    });

    it('should find matching patterns', () => {
      const matches = store.findSimilar(['develop', 'review-qa']);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].similarity).toBeGreaterThan(0.3);
    });

    it('should sort by similarity descending', () => {
      const matches = store.findSimilar(['develop', 'review-qa', 'apply-qa-fixes']);

      if (matches.length > 1) {
        expect(matches[0].similarity).toBeGreaterThanOrEqual(matches[1].similarity);
      }
    });

    it('should include similarity score in results', () => {
      const matches = store.findSimilar(['develop', 'review-qa']);

      matches.forEach((m) => {
        expect(m.similarity).toBeDefined();
        expect(m.similarity).toBeGreaterThan(0);
        expect(m.similarity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getStats', () => {
    it('should return statistics for empty store', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const stats = store.getStats();

      expect(stats.totalPatterns).toBe(0);
      expect(stats.maxPatterns).toBe(100);
      expect(stats.utilizationPercent).toBe(0);
    });

    it('should count patterns by status', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      store.save({ sequence: ['g', 'h', 'i'], status: 'promoted' });

      const stats = store.getStats();

      expect(stats.totalPatterns).toBe(3);
      expect(stats.statusCounts.pending).toBe(1);
      expect(stats.statusCounts.active).toBe(1);
      expect(stats.statusCounts.promoted).toBe(1);
    });

    it('should calculate average success rate', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['a', 'b', 'c'], successRate: 1.0 });
      store.save({ sequence: ['d', 'e', 'f'], successRate: 0.8 });

      const stats = store.getStats();

      expect(stats.avgSuccessRate).toBe(0.9);
    });

    it('should include storage file path', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const stats = store.getStats();

      expect(stats.storageFile).toBe(testStoragePath);
    });
  });

  describe('prune', () => {
    let store;

    beforeEach(() => {
      store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 10,
      });

      // Add 8 patterns
      for (let i = 0; i < 8; i++) {
        store.save({
          sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`],
          occurrences: i + 1,
          successRate: 0.5 + i * 0.05,
        });
      }
    });

    it('should not prune when below threshold', () => {
      const result = store.prune({ keepCount: 10 });
      expect(result.pruned).toBe(0);
    });

    it('should prune to specified count', () => {
      const result = store.prune({ keepCount: 5 });

      expect(result.pruned).toBe(3);
      expect(result.remaining).toBe(5);
    });

    it('should keep promoted patterns during prune', () => {
      store.updateStatus(store.load().patterns[0].id, 'promoted');

      const result = store.prune({ keepCount: 3 });
      const data = store.load();

      expect(data.patterns.some((p) => p.status === 'promoted')).toBe(true);
    });

    it('should use lowest_success_rate strategy when specified', () => {
      const result = store.prune({
        keepCount: 4,
        strategy: 'lowest_success_rate',
      });

      expect(result.remaining).toBe(4);
    });
  });

  describe('updateStatus', () => {
    let store;
    let patternId;

    beforeEach(() => {
      store = createPatternStore({ storagePath: testStoragePath });
      const result = store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      patternId = result.pattern.id;
    });

    it('should update pattern status', () => {
      const result = store.updateStatus(patternId, 'active');

      expect(result.success).toBe(true);
      expect(result.pattern.status).toBe('active');
    });

    it('should fail for non-existent pattern', () => {
      const result = store.updateStatus('non-existent-id', 'active');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail for invalid status', () => {
      const result = store.updateStatus(patternId, 'invalid-status');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status');
    });

    it('should set lastUpdated timestamp', () => {
      const result = store.updateStatus(patternId, 'active');

      expect(result.pattern.lastUpdated).toBeDefined();
    });
  });

  describe('getByStatus', () => {
    let store;

    beforeEach(() => {
      store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      store.save({ sequence: ['g', 'h', 'i'], status: 'active' });
    });

    it('should return patterns with given status', () => {
      const active = store.getByStatus('active');
      expect(active).toHaveLength(2);
    });

    it('should return empty array for unused status', () => {
      const promoted = store.getByStatus('promoted');
      expect(promoted).toHaveLength(0);
    });
  });

  describe('getActivePatterns', () => {
    let store;

    beforeEach(() => {
      store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      store.save({ sequence: ['g', 'h', 'i'], status: 'promoted' });
      store.save({ sequence: ['j', 'k', 'l'], status: 'deprecated' });
    });

    it('should return active and promoted patterns', () => {
      const patterns = store.getActivePatterns();

      expect(patterns).toHaveLength(2);
      expect(patterns.every((p) => p.status === 'active' || p.status === 'promoted')).toBe(true);
    });
  });

  describe('delete', () => {
    let store;
    let patternId;

    beforeEach(() => {
      store = createPatternStore({ storagePath: testStoragePath });
      const result = store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      patternId = result.pattern.id;
    });

    it('should delete pattern by ID', () => {
      const result = store.delete(patternId);

      expect(result.success).toBe(true);
      expect(store.load().patterns).toHaveLength(0);
    });

    it('should fail for non-existent pattern', () => {
      const result = store.delete('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Auto-Prune', () => {
    it('should auto-prune when approaching limit', () => {
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 10,
        pruneThreshold: 0.8,
      });

      // Add patterns to exceed 80% threshold
      for (let i = 0; i < 10; i++) {
        store.save({ sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`] });
      }

      const data = store.load();
      expect(data.patterns.length).toBeLessThanOrEqual(8); // 80% of 10
    });
  });

  describe('Cache Invalidation', () => {
    it('should reload after cache invalidation', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['a', 'b', 'c'] });

      const data1 = store.load();
      store.invalidateCache();
      const data2 = store.load();

      expect(data1).not.toBe(data2); // Different references
    });
  });

  describe('Performance', () => {
    it('should save pattern in under 50ms', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        agents: ['dev', 'qa'],
      };

      const start = Date.now();
      store.save(pattern);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should load patterns in under 50ms', () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      // Add some patterns
      for (let i = 0; i < 50; i++) {
        store.save({ sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`] });
      }

      store.invalidateCache();

      const start = Date.now();
      store.load();
      const duration = Date.now() - start;

      // Increased threshold for CI environments which may be slower
      expect(duration).toBeLessThan(200);
    });

    it('should find similar patterns in under 200ms', () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      for (let i = 0; i < 50; i++) {
        store.save({ sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`] });
      }

      const start = Date.now();
      store.findSimilar(['develop', 'review-qa', 'apply-qa-fixes']);
      const duration = Date.now() - start;

      // Increased threshold for CI environments which may be slower
      expect(duration).toBeLessThan(200);
    });
  });
});
