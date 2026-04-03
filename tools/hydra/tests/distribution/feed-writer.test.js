import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  writeKnowledgeFeed,
  cleanupOldFeeds,
  validatePath,
  sanitizeName,
  generateFrontmatter,
  generateItemSection,
  parseFeedFile,
  updateFrontmatter,
} from '../../src/distribution/feed-writer.js';

describe('feed-writer (Story 5.2)', () => {
  let tmpDir;

  const mockRouting = {
    contentId: 'hydra-abc123',
    targetClones: [
      { id: 'chip-huyen', department: 'ai-science', source: 'mega-brain', relevanceScore: 0.85, matchedKeywords: ['embedding', 'rag'] },
      { id: 'martin-fowler', department: 'expert-council', source: 'mega-brain', relevanceScore: 0.72, matchedKeywords: ['architecture'] },
    ],
    targetProjects: ['aios'],
    priority: 'urgent',
  };

  const mockContent = {
    title: 'ColBERT Reranking for RAG 2026',
    url: 'https://example.com/colbert',
    author: 'Test Author',
    tier: 'S',
    score: 4.7,
    contentId: 'hydra-abc123',
    domains: ['ai-ml'],
    insights: ['ColBERT improves recall by 15%', 'Lower latency than cross-encoders'],
    quotes: ['This is a revolution in retrieval'],
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-feed-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('validatePath', () => {
    test('allows safe paths', () => {
      expect(() => validatePath('/some/safe/path')).not.toThrow();
    });

    test('blocks agents/minds path', () => {
      expect(() => validatePath('D:/jarvis/mega brain/agents/minds/ai-science')).toThrow('SECURITY');
    });

    test('blocks development/agents path', () => {
      expect(() => validatePath('.aios-core/development/agents/dev.md')).toThrow('SECURITY');
    });
  });

  describe('sanitizeName', () => {
    test('converts to lowercase kebab-case', () => {
      expect(sanitizeName('Chip Huyen')).toBe('chip-huyen');
    });

    test('removes special characters', () => {
      expect(sanitizeName('test@clone#1')).toBe('test-clone-1');
    });

    test('truncates to 80 chars', () => {
      const long = 'a'.repeat(100);
      expect(sanitizeName(long).length).toBeLessThanOrEqual(80);
    });

    test('handles null/undefined', () => {
      expect(sanitizeName(null)).toBe('unknown');
    });
  });

  describe('generateFrontmatter', () => {
    test('generates valid frontmatter', () => {
      const fm = generateFrontmatter('chip-huyen', '2026-04-01', ['ai-ml']);
      expect(fm).toContain('hydra_feed: true');
      expect(fm).toContain('clone_id: "chip-huyen"');
      expect(fm).toContain('date: 2026-04-01');
      expect(fm).toContain('"ai-ml"');
    });
  });

  describe('generateItemSection', () => {
    test('generates markdown section with insights and quotes', () => {
      const section = generateItemSection(1, {
        title: 'Test Article',
        url: 'https://example.com',
        author: 'Author',
        tier: 'S',
        score: 4.5,
        relevance: 0.85,
        matchedKeywords: ['ai', 'rag'],
        insights: ['Insight 1', 'Insight 2'],
        quotes: ['Notable quote'],
        contentId: 'hydra-test123',
      });

      expect(section).toContain('## 1. Test Article');
      expect(section).toContain('Tier: S, Score: 4.5');
      expect(section).toContain('Insight 1');
      expect(section).toContain('Notable quote');
      expect(section).toContain('hydra-test123');
    });
  });

  describe('writeKnowledgeFeed', () => {
    test('creates feed files for each clone', async () => {
      const result = await writeKnowledgeFeed(mockRouting, mockContent, {
        feedRoot: tmpDir,
        date: '2026-04-01',
      });

      expect(result.written).toContain('chip-huyen');
      expect(result.written).toContain('martin-fowler');
      expect(result.errors).toHaveLength(0);

      // Verify file exists
      const chipFile = path.join(tmpDir, 'chip-huyen', '2026-04-01-hydra-feed.md');
      expect(fs.existsSync(chipFile)).toBe(true);

      const content = fs.readFileSync(chipFile, 'utf-8');
      expect(content).toContain('ColBERT Reranking');
      expect(content).toContain('hydra-abc123');
    });

    test('aggregates multiple items in same day file', async () => {
      // First write
      await writeKnowledgeFeed(mockRouting, mockContent, {
        feedRoot: tmpDir,
        date: '2026-04-01',
      });

      // Second write with different content
      const secondContent = { ...mockContent, contentId: 'hydra-def456', title: 'Second Article' };
      const secondRouting = { ...mockRouting, contentId: 'hydra-def456' };

      const result = await writeKnowledgeFeed(secondRouting, secondContent, {
        feedRoot: tmpDir,
        date: '2026-04-01',
      });

      expect(result.written).toContain('chip-huyen');

      const chipFile = path.join(tmpDir, 'chip-huyen', '2026-04-01-hydra-feed.md');
      const content = fs.readFileSync(chipFile, 'utf-8');
      expect(content).toContain('ColBERT Reranking');
      expect(content).toContain('Second Article');
      expect(content).toContain('items_count: 2');
    });

    test('idempotent: same contentId does not duplicate', async () => {
      await writeKnowledgeFeed(mockRouting, mockContent, {
        feedRoot: tmpDir,
        date: '2026-04-01',
      });

      const result = await writeKnowledgeFeed(mockRouting, mockContent, {
        feedRoot: tmpDir,
        date: '2026-04-01',
      });

      expect(result.skipped).toContain('chip-huyen');

      const chipFile = path.join(tmpDir, 'chip-huyen', '2026-04-01-hydra-feed.md');
      const content = fs.readFileSync(chipFile, 'utf-8');
      // Should only have 1 instance of the content ID
      const matches = content.match(/hydra-abc123/g);
      expect(matches.length).toBe(1); // Only in Content ID line
    });

    test('returns empty result for no clones', async () => {
      const result = await writeKnowledgeFeed(
        { contentId: 'hydra-xxx', targetClones: [], targetProjects: [], priority: 'low' },
        mockContent,
        { feedRoot: tmpDir }
      );

      expect(result.written).toHaveLength(0);
      expect(result.skipped).toHaveLength(0);
    });

    test('creates clone directory if not exists', async () => {
      await writeKnowledgeFeed(mockRouting, mockContent, {
        feedRoot: tmpDir,
        date: '2026-04-01',
      });

      expect(fs.existsSync(path.join(tmpDir, 'chip-huyen'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'martin-fowler'))).toBe(true);
    });
  });

  describe('cleanupOldFeeds', () => {
    test('removes files older than retention period', async () => {
      const cloneDir = path.join(tmpDir, 'test-clone');
      fs.mkdirSync(cloneDir, { recursive: true });

      // Create old file
      fs.writeFileSync(path.join(cloneDir, '2025-01-01-hydra-feed.md'), 'old', 'utf-8');
      // Create recent file
      const today = new Date().toISOString().split('T')[0];
      fs.writeFileSync(path.join(cloneDir, `${today}-hydra-feed.md`), 'new', 'utf-8');

      const result = await cleanupOldFeeds({ feedRoot: tmpDir, retentionDays: 30 });

      expect(result.cleaned).toBe(1);
      expect(fs.existsSync(path.join(cloneDir, '2025-01-01-hydra-feed.md'))).toBe(false);
      expect(fs.existsSync(path.join(cloneDir, `${today}-hydra-feed.md`))).toBe(true);
    });

    test('handles non-existent feed root', async () => {
      const result = await cleanupOldFeeds({ feedRoot: '/nonexistent/path', retentionDays: 30 });
      expect(result.cleaned).toBe(0);
    });
  });

  describe('parseFeedFile', () => {
    test('extracts content IDs from feed file', () => {
      const tmpFile = path.join(tmpDir, 'test-feed.md');
      fs.writeFileSync(tmpFile, `---
items_count: 2
---
**Content ID:** hydra-abc123
**Content ID:** hydra-def456
`, 'utf-8');

      const result = parseFeedFile(tmpFile);
      expect(result.contentIds.size).toBe(2);
      expect(result.contentIds.has('hydra-abc123')).toBe(true);
      expect(result.contentIds.has('hydra-def456')).toBe(true);
      expect(result.itemCount).toBe(2);
    });
  });

  describe('updateFrontmatter', () => {
    test('updates items_count and relevance_avg', () => {
      const fm = 'items_count: 1\nrelevance_avg: 0.50\ndomains: ["ai-ml"]';
      const updated = updateFrontmatter(fm, 3, ['engenharia'], 0.75);
      expect(updated).toContain('items_count: 3');
      expect(updated).toContain('relevance_avg: 0.75');
      expect(updated).toContain('"engenharia"');
    });
  });
});
