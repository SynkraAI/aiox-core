import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { FeedbackManager } from '../../src/distribution/feedback-manager.js';

describe('feedback-manager (Story 5.6)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-feedback-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('addFeedback', () => {
    test('records useful feedback', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const result = manager.addFeedback('chip-huyen', 'hydra-abc123', 'useful');

      expect(result.success).toBe(true);

      const data = manager.loadFeedback('chip-huyen');
      expect(data.feedback).toHaveLength(1);
      expect(data.feedback[0].rating).toBe('useful');
    });

    test('records irrelevant feedback with comment', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const result = manager.addFeedback('chip-huyen', 'hydra-def456', 'irrelevant', 'Too basic');

      expect(result.success).toBe(true);

      const data = manager.loadFeedback('chip-huyen');
      expect(data.feedback[0].comment).toBe('Too basic');
    });

    test('rejects invalid rating', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const result = manager.addFeedback('chip-huyen', 'hydra-abc', 'invalid');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid rating');
    });

    test('rejects empty clone/content ID', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });

      expect(manager.addFeedback('', 'hydra-abc', 'useful').success).toBe(false);
      expect(manager.addFeedback('clone', '', 'useful').success).toBe(false);
    });

    test('updates existing feedback for same content', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      manager.addFeedback('chip-huyen', 'hydra-abc123', 'useful');
      manager.addFeedback('chip-huyen', 'hydra-abc123', 'irrelevant');

      const data = manager.loadFeedback('chip-huyen');
      expect(data.feedback).toHaveLength(1);
      expect(data.feedback[0].rating).toBe('irrelevant');
    });

    test('stores multiple feedback entries per clone', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      manager.addFeedback('chip-huyen', 'hydra-1', 'useful');
      manager.addFeedback('chip-huyen', 'hydra-2', 'irrelevant');
      manager.addFeedback('chip-huyen', 'hydra-3', 'partially-relevant');

      const data = manager.loadFeedback('chip-huyen');
      expect(data.feedback).toHaveLength(3);
    });
  });

  describe('computeAdjustments', () => {
    test('generates adjustments from feedback', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      manager.addFeedback('chip-huyen', 'hydra-1', 'useful');
      manager.addFeedback('chip-huyen', 'hydra-2', 'useful');
      manager.addFeedback('chip-huyen', 'hydra-3', 'irrelevant');

      const adjustments = manager.computeAdjustments();
      expect(adjustments['chip-huyen']).toBeDefined();
      expect(adjustments['chip-huyen'].general_boost).toBeGreaterThan(0);
      expect(adjustments['chip-huyen'].general_penalty).toBeLessThan(0);
    });

    test('raises min_relevance when too many irrelevant', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir, irrelevantThreshold: 0.5 });

      // 3 irrelevant out of 4 = 75% > threshold
      manager.addFeedback('chip-huyen', 'hydra-1', 'irrelevant');
      manager.addFeedback('chip-huyen', 'hydra-2', 'irrelevant');
      manager.addFeedback('chip-huyen', 'hydra-3', 'irrelevant');
      manager.addFeedback('chip-huyen', 'hydra-4', 'useful');

      const adjustments = manager.computeAdjustments();
      expect(adjustments['chip-huyen'].min_relevance_override).toBe(0.35);
    });

    test('returns empty for no feedback', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const adjustments = manager.computeAdjustments();
      expect(Object.keys(adjustments)).toHaveLength(0);
    });

    test('filters out old feedback beyond reset interval', async () => {
      const manager = new FeedbackManager({ dataDir: tmpDir, resetIntervalDays: 1 });

      // Write old feedback directly
      const feedbackDir = path.join(tmpDir, 'feedback');
      fs.mkdirSync(feedbackDir, { recursive: true });

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);

      const data = {
        clone_id: 'old-clone',
        feedback: [
          { content_id: 'hydra-old', rating: 'useful', timestamp: oldDate.toISOString() },
        ],
      };

      const yamlMod = await import('js-yaml');
      fs.writeFileSync(path.join(feedbackDir, 'old-clone.yaml'), yamlMod.default.dump(data), 'utf-8');

      const adjustments = manager.computeAdjustments();
      expect(adjustments['old-clone']).toBeUndefined();
    });
  });

  describe('saveAdjustments', () => {
    test('saves routing-adjustments.yaml', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      manager.addFeedback('chip-huyen', 'hydra-1', 'useful');

      const result = manager.saveAdjustments();
      expect(result.saved).toBe(true);
      expect(fs.existsSync(result.path)).toBe(true);
    });
  });

  describe('resetAdjustments', () => {
    test('removes routing-adjustments.yaml', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      manager.addFeedback('chip-huyen', 'hydra-1', 'useful');
      manager.saveAdjustments();

      const result = manager.resetAdjustments();
      expect(result.reset).toBe(true);

      const adjPath = path.join(tmpDir, 'feedback', 'routing-adjustments.yaml');
      expect(fs.existsSync(adjPath)).toBe(false);
    });

    test('succeeds even when no adjustments exist', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const result = manager.resetAdjustments();
      expect(result.reset).toBe(true);
    });
  });

  describe('getStats', () => {
    test('returns feedback statistics', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      manager.addFeedback('clone-1', 'hydra-1', 'useful');
      manager.addFeedback('clone-1', 'hydra-2', 'irrelevant');
      manager.addFeedback('clone-2', 'hydra-3', 'useful');

      const stats = manager.getStats();
      expect(stats.totalClones).toBe(2);
      expect(stats.totalFeedback).toBe(3);
      expect(stats.usefulCount).toBe(2);
      expect(stats.irrelevantCount).toBe(1);
    });

    test('returns zeros for empty feedback', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const stats = manager.getStats();
      expect(stats.totalFeedback).toBe(0);
    });
  });

  describe('loadFeedback', () => {
    test('returns empty for non-existent clone', () => {
      const manager = new FeedbackManager({ dataDir: tmpDir });
      const data = manager.loadFeedback('nonexistent');
      expect(data.clone_id).toBe('nonexistent');
      expect(data.feedback).toEqual([]);
    });
  });
});
