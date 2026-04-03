import {
  chunkText,
  needsChunking,
  estimateTokens,
  aggregateChunkResults,
  formatChunkedMarkdown,
} from '../../src/processor/chunker.js';

describe('chunker', () => {
  describe('estimateTokens', () => {
    test('estimates tokens from text length', () => {
      // ~4 chars per token
      expect(estimateTokens('abcd')).toBe(1);
      expect(estimateTokens('abcdefgh')).toBe(2);
      expect(estimateTokens('')).toBe(0);
    });

    test('handles null/undefined', () => {
      expect(estimateTokens(null)).toBe(0);
      expect(estimateTokens(undefined)).toBe(0);
    });

    test('rounds up for partial tokens', () => {
      expect(estimateTokens('abc')).toBe(1); // 3 chars -> ceil(0.75) = 1
    });
  });

  describe('needsChunking', () => {
    test('returns false for short text', () => {
      const shortText = 'Hello world.';
      expect(needsChunking(shortText)).toBe(false);
    });

    test('returns true for long text', () => {
      // 3000 tokens * 4 chars = 12000 chars
      const longText = 'a'.repeat(13000);
      expect(needsChunking(longText)).toBe(true);
    });

    test('respects custom maxTokens', () => {
      const text = 'a'.repeat(500);
      expect(needsChunking(text, 50)).toBe(true);
      expect(needsChunking(text, 5000)).toBe(false);
    });
  });

  describe('chunkText', () => {
    test('returns empty array for empty input', () => {
      expect(chunkText('')).toEqual([]);
      expect(chunkText(null)).toEqual([]);
      expect(chunkText(undefined)).toEqual([]);
    });

    test('returns single chunk for short text', () => {
      const text = 'Short text that fits in one chunk.';
      const chunks = chunkText(text);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].index).toBe(0);
      expect(chunks[0].text).toBe(text);
      expect(chunks[0].startToken).toBe(0);
    });

    test('splits long text into multiple chunks', () => {
      // Create text that is ~6000 tokens (24000 chars)
      const paragraphs = [];
      for (let i = 0; i < 100; i++) {
        paragraphs.push(`This is paragraph number ${i}. It contains some meaningful content about topic ${i % 10}. The purpose is to have enough text to require chunking across multiple segments.`);
      }
      const text = paragraphs.join('\n\n');

      const chunks = chunkText(text, { maxTokens: 3000 });
      expect(chunks.length).toBeGreaterThan(1);

      // Each chunk should be within maxTokens
      for (const chunk of chunks) {
        expect(estimateTokens(chunk.text)).toBeLessThanOrEqual(3200); // Allow small overshoot from semantic boundaries
      }
    });

    test('preserves chunk ordering via index', () => {
      const paragraphs = Array.from({ length: 50 }, (_, i) =>
        `Paragraph ${i}: ${'x'.repeat(200)}`
      );
      const text = paragraphs.join('\n\n');
      const chunks = chunkText(text, { maxTokens: 1000 });

      for (let i = 0; i < chunks.length; i++) {
        expect(chunks[i].index).toBe(i);
      }
    });

    test('respects maxChunks safety limit', () => {
      const text = 'a'.repeat(100000);
      const chunks = chunkText(text, { maxTokens: 100, maxChunks: 5, strategy: 'fixed' });
      expect(chunks.length).toBeLessThanOrEqual(5);
    });

    describe('fixed strategy', () => {
      test('splits at fixed character boundaries', () => {
        const text = 'word '.repeat(3000); // ~3000 words = ~15000 chars = ~3750 tokens
        const chunks = chunkText(text, { strategy: 'fixed', maxTokens: 2000 });
        expect(chunks.length).toBeGreaterThan(1);
      });

      test('creates overlap between chunks', () => {
        const text = 'word '.repeat(5000);
        const chunks = chunkText(text, {
          strategy: 'fixed',
          maxTokens: 2000,
          overlap: 200,
        });

        // With overlap, chunks should share some content
        if (chunks.length >= 2) {
          const end1 = chunks[0].text.slice(-100);
          const start2 = chunks[1].text.slice(0, 200);
          // The overlap region of chunk 0's end should appear in chunk 1's start
          expect(start2).toContain(end1.trim().slice(0, 20));
        }
      });
    });

    describe('semantic strategy', () => {
      test('splits at paragraph boundaries', () => {
        const paragraphs = [
          'First paragraph with some content about machine learning and neural networks.',
          'Second paragraph discussing transformer architectures and attention mechanisms.',
          'Third paragraph about training procedures and optimization techniques.',
          'Fourth paragraph covering deployment and inference optimization.',
          'Fifth paragraph about monitoring and observability in production systems.',
        ];
        // Make each paragraph big enough
        const bigParas = paragraphs.map((p) => p + ' ' + 'Additional context. '.repeat(50));
        const text = bigParas.join('\n\n');

        const chunks = chunkText(text, { strategy: 'semantic', maxTokens: 500 });
        expect(chunks.length).toBeGreaterThan(1);

        // Each chunk should contain complete paragraphs (not cut mid-sentence)
        for (const chunk of chunks) {
          // Should not start with lowercase (mid-sentence cut)
          const firstChar = chunk.text.trim()[0];
          expect(firstChar).toBe(firstChar.toUpperCase());
        }
      });

      test('handles text with only single newlines', () => {
        const lines = Array.from({ length: 100 }, (_, i) =>
          `Line ${i}: some content here about topic ${i}`
        );
        const text = lines.join('\n');
        // Single newline text gets treated as one big segment, then split by sentences
        const chunks = chunkText(text, { strategy: 'semantic', maxTokens: 200 });
        expect(chunks.length).toBeGreaterThanOrEqual(1);
      });

      test('merges tiny trailing chunks into previous', () => {
        // Create text where the last segment is tiny
        const paragraphs = Array.from({ length: 10 }, (_, i) =>
          `Paragraph ${i}: ${'content '.repeat(100)}`
        );
        paragraphs.push('Tiny ending.');
        const text = paragraphs.join('\n\n');

        const chunks = chunkText(text, { strategy: 'semantic', maxTokens: 1000, minChunkTokens: 50 });
        // The tiny ending should be merged, not standalone
        const lastChunk = chunks[chunks.length - 1];
        expect(estimateTokens(lastChunk.text)).toBeGreaterThanOrEqual(50);
      });
    });

    test('handles text with no paragraph breaks', () => {
      const text = 'This is a single long block of text without any paragraph breaks. '.repeat(200);
      const chunks = chunkText(text, { maxTokens: 1000 });
      expect(chunks.length).toBeGreaterThan(1);
    });
  });

  describe('aggregateChunkResults', () => {
    test('returns empty result for empty input', () => {
      const result = aggregateChunkResults([]);
      expect(result.insights).toEqual([]);
      expect(result.tier).toBe('D');
    });

    test('returns single chunk result directly', () => {
      const singleResult = {
        insights: [{ insight: 'Test insight', confidence: 4, type: 'fact' }],
        summary: ['Test summary'],
        tags: ['ai'],
        entities: ['OpenAI'],
        quotes: ['A quote'],
        tier: 'A',
        scores: { relevance: 4 },
      };

      const result = aggregateChunkResults([{ chunkIndex: 0, result: singleResult }]);
      expect(result).toEqual(singleResult);
    });

    test('deduplicates insights across chunks', () => {
      const chunk1 = {
        chunkIndex: 0,
        result: {
          insights: [
            { insight: 'Neural networks are powerful', confidence: 4, type: 'fact' },
            { insight: 'Transformers revolutionized NLP', confidence: 5, type: 'fact' },
          ],
          summary: ['AI is advancing'],
          tags: ['ai', 'ml'],
          entities: ['Google'],
          quotes: ['Quote 1'],
          tier: 'A',
          scores: { relevance: 4 },
        },
      };

      const chunk2 = {
        chunkIndex: 1,
        result: {
          insights: [
            { insight: 'Neural networks are powerful', confidence: 3, type: 'fact' }, // exact duplicate
            { insight: 'GPT models use self-attention', confidence: 4, type: 'fact' },
          ],
          summary: ['Models are growing'],
          tags: ['ai', 'gpt'],
          entities: ['Google', 'OpenAI'],
          quotes: ['Quote 2'],
          tier: 'S',
          scores: { relevance: 5 },
        },
      };

      const result = aggregateChunkResults([chunk1, chunk2], { totalChunks: 2 });

      // Should deduplicate the "neural networks" insight
      const neuralInsights = result.insights.filter((i) =>
        i.insight.toLowerCase().includes('neural network')
      );
      expect(neuralInsights.length).toBe(1);

      // Should keep unique insights
      expect(result.insights.length).toBeGreaterThanOrEqual(2);

      // Best tier wins
      expect(result.tier).toBe('S');

      // Entities deduplicated
      expect(result.entities.filter((e) => e === 'Google').length).toBe(1);

      // Tags deduplicated and limited
      expect(result.tags.length).toBeLessThanOrEqual(10);

      // Scores averaged
      expect(result.scores.relevance).toBe(4.5);

      // Chunked metadata
      expect(result.chunked).toBe(true);
      expect(result.chunksProcessed).toBe(2);
    });

    test('picks best tier across chunks', () => {
      const results = [
        { chunkIndex: 0, result: { insights: [], summary: [], tags: [], entities: [], quotes: [], tier: 'B', scores: {} } },
        { chunkIndex: 1, result: { insights: [], summary: [], tags: [], entities: [], quotes: [], tier: 'S', scores: {} } },
        { chunkIndex: 2, result: { insights: [], summary: [], tags: [], entities: [], quotes: [], tier: 'A', scores: {} } },
      ];

      const result = aggregateChunkResults(results);
      expect(result.tier).toBe('S');
    });

    test('averages scores correctly', () => {
      const results = [
        { chunkIndex: 0, result: { insights: [], summary: [], tags: [], entities: [], quotes: [], tier: 'A', scores: { relevance: 3, novelty: 4 } } },
        { chunkIndex: 1, result: { insights: [], summary: [], tags: [], entities: [], quotes: [], tier: 'A', scores: { relevance: 5, depth: 3 } } },
      ];

      const result = aggregateChunkResults(results);
      expect(result.scores.relevance).toBe(4);
      expect(result.scores.novelty).toBe(4);
      expect(result.scores.depth).toBe(3);
    });

    test('limits summary to 5 items', () => {
      const results = Array.from({ length: 10 }, (_, i) => ({
        chunkIndex: i,
        result: {
          insights: [],
          summary: [`Summary from chunk ${i}`],
          tags: [],
          entities: [],
          quotes: [],
          tier: 'A',
          scores: {},
        },
      }));

      const result = aggregateChunkResults(results);
      expect(result.summary.length).toBeLessThanOrEqual(5);
    });

    test('limits tags to 10 items', () => {
      const results = Array.from({ length: 5 }, (_, i) => ({
        chunkIndex: i,
        result: {
          insights: [],
          summary: [],
          tags: [`tag${i}a`, `tag${i}b`, `tag${i}c`],
          entities: [],
          quotes: [],
          tier: 'A',
          scores: {},
        },
      }));

      const result = aggregateChunkResults(results);
      expect(result.tags.length).toBeLessThanOrEqual(10);
    });
  });

  describe('formatChunkedMarkdown', () => {
    test('generates valid markdown with frontmatter', () => {
      const chunkResults = [
        {
          chunkIndex: 0,
          result: {
            insights: [{ insight: 'Insight 1', evidence: 'Evidence text here', confidence: 4, type: 'fact' }],
            summary: ['Summary 1'],
            tags: ['ai'],
            entities: ['OpenAI'],
            quotes: ['Notable quote'],
            tier: 'A',
            scores: { relevance: 4 },
          },
        },
        {
          chunkIndex: 1,
          result: {
            insights: [{ insight: 'Insight 2', confidence: 3, type: 'recommendation' }],
            summary: ['Summary 2'],
            tags: ['ml'],
            entities: ['Google'],
            quotes: [],
            tier: 'B',
            scores: { relevance: 3 },
          },
        },
      ];

      const md = formatChunkedMarkdown(chunkResults, {
        title: 'Test Video',
        url: 'https://youtube.com/watch?v=test',
        duration: 7860, // 131 min
        totalChunks: 2,
        totalTokens: 35000,
      });

      expect(md).toContain('---');
      expect(md).toContain('title: "Test Video"');
      expect(md).toContain('source: "https://youtube.com/watch?v=test"');
      expect(md).toContain('duration: "131min"');
      expect(md).toContain('chunks_processed: 2');
      expect(md).toContain('total_tokens: ~35000');
      expect(md).toContain('## Chunk 1/2');
      expect(md).toContain('## Chunk 2/2');
      expect(md).toContain('Insight 1');
      expect(md).toContain('Insight 2');
      expect(md).toContain('## Consolidated Summary');
      expect(md).toContain('### Top Insights (deduplicated)');
    });

    test('escapes quotes in title', () => {
      const md = formatChunkedMarkdown(
        [{ chunkIndex: 0, result: { insights: [], summary: [], tags: [], entities: [], quotes: [], tier: 'C', scores: {} } }],
        { title: 'Video with "quotes"' }
      );
      expect(md).toContain('title: "Video with \\"quotes\\""');
    });
  });

  describe('integration: realistic transcript chunking', () => {
    test('handles a 131-min video transcript simulation', () => {
      // Simulate ~35000 tokens (140000 chars) -- roughly what a 2h+ video produces
      const sentences = Array.from({ length: 1000 }, (_, i) =>
        `This is sentence number ${i} from the transcript of a very long lecture about artificial intelligence and machine learning concepts.`
      );
      // Group into paragraphs of ~5 sentences
      const paragraphs = [];
      for (let i = 0; i < sentences.length; i += 5) {
        paragraphs.push(sentences.slice(i, i + 5).join(' '));
      }
      const transcript = paragraphs.join('\n\n');

      const tokens = estimateTokens(transcript);
      expect(tokens).toBeGreaterThan(10000);

      const chunks = chunkText(transcript, { maxTokens: 3000, overlap: 200 });
      expect(chunks.length).toBeGreaterThan(3);
      expect(chunks.length).toBeLessThanOrEqual(50);

      // Verify no gaps: all content should be covered
      const allChunkText = chunks.map((c) => c.text).join(' ');
      // First and last sentences should be present
      expect(allChunkText).toContain('sentence number 0');
      expect(allChunkText).toContain('sentence number 999');

      // Verify ordering
      for (let i = 1; i < chunks.length; i++) {
        expect(chunks[i].startToken).toBeGreaterThanOrEqual(chunks[i - 1].startToken);
      }
    });
  });
});
