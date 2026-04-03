import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { DigestReporter } from '../../src/distribution/digest-reporter.js';

describe('digest-reporter (Story 5.5)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-digest-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('record', () => {
    test('records routing decisions', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });

      reporter.record(
        {
          contentId: 'hydra-1',
          targetClones: [
            { id: 'chip-huyen', relevanceScore: 0.85 },
            { id: 'andrej-karpathy', relevanceScore: 0.72 },
          ],
          targetProjects: ['aios'],
        },
        { title: 'RAG Article', tier: 'S' }
      );

      expect(reporter.records).toHaveLength(1);
      expect(reporter.records[0].cloneIds).toContain('chip-huyen');
    });

    test('handles null routing gracefully', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });
      reporter.record(null, { title: 'Test' });
      expect(reporter.records).toHaveLength(0);
    });
  });

  describe('generateDigest', () => {
    test('generates markdown with summary and recipients', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });

      reporter.record(
        {
          contentId: 'hydra-1',
          targetClones: [
            { id: 'chip-huyen', relevanceScore: 0.85 },
          ],
          targetProjects: ['aios'],
        },
        { title: 'Article 1', tier: 'S' }
      );

      reporter.record(
        {
          contentId: 'hydra-2',
          targetClones: [
            { id: 'chip-huyen', relevanceScore: 0.70 },
            { id: 'martin-fowler', relevanceScore: 0.60 },
          ],
          targetProjects: ['aios', 'tocks'],
        },
        { title: 'Article 2', tier: 'A' }
      );

      const digest = reporter.generateDigest({ date: '2026-04-01' });

      expect(digest).toContain('Distribution Digest -- 2026-04-01');
      expect(digest).toContain('Items distributed: 2');
      expect(digest).toContain('chip-huyen');
      expect(digest).toContain('Article 1');
      expect(digest).toContain('aios');
    });

    test('handles empty records', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });
      const digest = reporter.generateDigest({ date: '2026-04-01' });
      expect(digest).toContain('Items distributed: 0');
    });
  });

  describe('save', () => {
    test('saves digest to file', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });

      reporter.record(
        {
          contentId: 'hydra-1',
          targetClones: [{ id: 'chip-huyen', relevanceScore: 0.85 }],
          targetProjects: ['aios'],
        },
        { title: 'Test', tier: 'S' }
      );

      const result = reporter.save({ date: '2026-04-01' });
      expect(result.saved).toBe(true);
      expect(fs.existsSync(result.path)).toBe(true);

      const content = fs.readFileSync(result.path, 'utf-8');
      expect(content).toContain('Distribution Digest');
    });

    test('creates directory structure if needed', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });
      reporter.save({ date: '2026-04-01' });
      expect(fs.existsSync(path.join(tmpDir, 'digests', 'distribution'))).toBe(true);
    });
  });

  describe('load', () => {
    test('loads saved digest', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });

      reporter.record(
        {
          contentId: 'hydra-1',
          targetClones: [{ id: 'chip-huyen', relevanceScore: 0.85 }],
          targetProjects: ['aios'],
        },
        { title: 'Test', tier: 'S' }
      );

      reporter.save({ date: '2026-04-01' });

      const loaded = reporter.load({ date: '2026-04-01' });
      expect(loaded).toContain('Distribution Digest');
    });

    test('returns null for non-existent digest', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });
      const loaded = reporter.load({ date: '1999-01-01' });
      expect(loaded).toBeNull();
    });
  });

  describe('getSummary', () => {
    test('returns summary line', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });

      reporter.record(
        {
          contentId: 'hydra-1',
          targetClones: [
            { id: 'chip-huyen', relevanceScore: 0.85 },
            { id: 'martin-fowler', relevanceScore: 0.72 },
          ],
          targetProjects: ['aios'],
        },
        { title: 'Test', tier: 'S' }
      );

      const summary = reporter.getSummary();
      expect(summary).toContain('1 items');
      expect(summary).toContain('2 clones');
    });
  });

  describe('setEntityStats', () => {
    test('includes entity stats in digest', () => {
      const reporter = new DigestReporter({ dataDir: tmpDir });
      reporter.setEntityStats(47, 12);

      const digest = reporter.generateDigest({ date: '2026-04-01' });
      expect(digest).toContain('Entities indexed: 47 (12 new)');
    });
  });
});
