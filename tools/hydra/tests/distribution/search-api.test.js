import { jest } from '@jest/globals';

import {
  searchContent,
  formatForCLI,
  formatEntityForCLI,
} from '../../src/distribution/search-api.js';

describe('search-api (Story 5.4)', () => {
  describe('searchContent', () => {
    test('returns results from vector store', async () => {
      const mockVectorStore = {
        search: jest.fn().mockResolvedValue([
          { id: 'hydra-1', title: 'RAG Article', url: 'https://example.com/rag', tier: 'S', score: 4.5, similarity: 0.85, domains: ['ai-ml'] },
          { id: 'hydra-2', title: 'ML Guide', url: 'https://example.com/ml', tier: 'A', score: 3.8, similarity: 0.72, domains: ['ai-ml'] },
        ]),
      };

      const results = await searchContent('RAG techniques', {}, { vectorStore: mockVectorStore });

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('hydra-1');
      expect(results[0].similarity).toBe(0.85);
    });

    test('applies limit', async () => {
      const mockVectorStore = {
        search: jest.fn().mockResolvedValue([
          { id: 'h1', title: 'A', url: 'u', tier: 'S', score: 5, similarity: 0.9, domains: [] },
          { id: 'h2', title: 'B', url: 'u', tier: 'A', score: 4, similarity: 0.8, domains: [] },
          { id: 'h3', title: 'C', url: 'u', tier: 'B', score: 3, similarity: 0.7, domains: [] },
        ]),
      };

      const results = await searchContent('test', { limit: 2 }, { vectorStore: mockVectorStore });
      expect(results).toHaveLength(2);
    });

    test('passes domain filter to vector store', async () => {
      const mockVectorStore = {
        search: jest.fn().mockResolvedValue([]),
      };

      await searchContent('test', { domains: ['ai-ml'], tiers: ['S'] }, { vectorStore: mockVectorStore });

      expect(mockVectorStore.search).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({
          filterDomains: ['ai-ml'],
          filterTiers: ['S'],
        })
      );
    });

    test('returns empty for no matches', async () => {
      const mockVectorStore = {
        search: jest.fn().mockResolvedValue([]),
      };

      const results = await searchContent('nonexistent query', {}, { vectorStore: mockVectorStore });
      expect(results).toHaveLength(0);
    });
  });

  describe('formatForCLI', () => {
    test('formats results as table', () => {
      const results = [
        { id: 'h1', title: 'RAG Techniques 2026', url: 'u', tier: 'S', score: 4.7, similarity: 0.87, domains: ['ai-ml'] },
        { id: 'h2', title: 'Growth Hacking Guide', url: 'u', tier: 'A', score: 3.9, similarity: 0.72, domains: ['marketing'] },
      ];

      const output = formatForCLI(results);
      expect(output).toContain('RAG Techniques 2026');
      expect(output).toContain('Growth Hacking Guide');
      expect(output).toContain('Tier');
      expect(output).toContain('Score');
    });

    test('handles empty results', () => {
      const output = formatForCLI([]);
      expect(output).toContain('No results found');
    });

    test('truncates long titles', () => {
      const results = [
        { id: 'h1', title: 'A'.repeat(100), url: 'u', tier: 'S', score: 4.7, similarity: 0.87, domains: [] },
      ];

      const output = formatForCLI(results);
      expect(output.length).toBeLessThan(300);
    });
  });

  describe('formatEntityForCLI', () => {
    test('formats entity with related content and entities', () => {
      const result = {
        entity: {
          id: 1,
          name: 'React',
          type: 'technology',
          mentionCount: 15,
          firstSeen: '2026-01-01',
          lastSeen: '2026-04-01',
        },
        contentIds: ['hydra-1', 'hydra-2'],
        relatedEntities: [
          { name: 'Next.js', type: 'technology', strength: 0.85, coOccurrences: 10 },
        ],
      };

      const output = formatEntityForCLI(result, 'React');
      expect(output).toContain('React');
      expect(output).toContain('technology');
      expect(output).toContain('hydra-1');
      expect(output).toContain('Next.js');
    });

    test('handles entity not found', () => {
      const result = { entity: null, contentIds: [], relatedEntities: [] };
      const output = formatEntityForCLI(result, 'Unknown');
      expect(output).toContain('not found');
    });
  });
});
