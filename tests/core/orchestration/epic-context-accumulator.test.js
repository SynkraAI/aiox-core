/**
 * Epic Context Accumulator Tests
 * Story 12.4: Progressive summarization with token control
 */

const {
  EpicContextAccumulator,
  createEpicContextAccumulator,
  CompressionLevel,
  COMPRESSION_FIELDS,
  estimateTokens,
  getCompressionLevel,
  buildFileIndex,
  hasFileOverlap,
  truncateToTokens,
  formatStoryEntry,
  TOKEN_LIMIT,
  HARD_CAP_PER_STORY,
  CHARS_PER_TOKEN,
} = require('../../../.aiox-core/core/orchestration/epic-context-accumulator');

// Helper: create a mock SessionState with stories_done
function createMockSessionState(storiesDone = [], extraContext = {}) {
  return {
    state: {
      session_state: {
        progress: {
          current_story: 'story-next',
          stories_done: storiesDone,
          stories_pending: [],
        },
        context_snapshot: {
          files_modified: 0,
          executor_distribution: extraContext.executor_distribution || {},
          last_executor: extraContext.last_executor || null,
          branch: 'main',
        },
        epic: {
          id: extraContext.epicId || '12',
          title: extraContext.epicTitle || 'Test Epic',
          total_stories: extraContext.totalStories || storiesDone.length + 1,
        },
      },
    },
  };
}

// Helper: create a story object
function createStory(overrides = {}) {
  return {
    id: 'story-1',
    title: 'Test Story',
    executor: '@dev',
    quality_gate: '@qa',
    status: 'completed',
    acceptance_criteria: 'AC1: Do something',
    files_modified: ['src/index.js'],
    dev_notes: 'Implementation notes',
    ...overrides,
  };
}

describe('EpicContextAccumulator', () => {
  describe('Constants', () => {
    it('should export TOKEN_LIMIT as 8000', () => {
      expect(TOKEN_LIMIT).toBe(8000);
    });

    it('should export HARD_CAP_PER_STORY as 600', () => {
      expect(HARD_CAP_PER_STORY).toBe(600);
    });

    it('should export CHARS_PER_TOKEN as 3.5', () => {
      expect(CHARS_PER_TOKEN).toBe(3.5);
    });

    it('should define three compression levels', () => {
      expect(CompressionLevel.FULL_DETAIL).toBe('full_detail');
      expect(CompressionLevel.METADATA_PLUS_FILES).toBe('metadata_plus_files');
      expect(CompressionLevel.METADATA_ONLY).toBe('metadata_only');
    });
  });

  describe('estimateTokens()', () => {
    it('should estimate tokens as ceil(length / 3.5)', () => {
      // 7 chars / 3.5 = 2 tokens
      expect(estimateTokens('1234567')).toBe(2);
    });

    it('should round up fractional tokens', () => {
      // 8 chars / 3.5 = 2.28... → 3 tokens
      expect(estimateTokens('12345678')).toBe(3);
    });

    it('should return 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(estimateTokens(null)).toBe(0);
      expect(estimateTokens(undefined)).toBe(0);
    });

    it('should handle long text correctly', () => {
      const text = 'a'.repeat(3500);
      expect(estimateTokens(text)).toBe(1000);
    });
  });

  describe('getCompressionLevel()', () => {
    it('should return full_detail for N-1 (distance 1)', () => {
      expect(getCompressionLevel(9, 10)).toBe(CompressionLevel.FULL_DETAIL);
    });

    it('should return full_detail for N-2 (distance 2)', () => {
      expect(getCompressionLevel(8, 10)).toBe(CompressionLevel.FULL_DETAIL);
    });

    it('should return full_detail for N-3 (distance 3)', () => {
      expect(getCompressionLevel(7, 10)).toBe(CompressionLevel.FULL_DETAIL);
    });

    it('should return metadata_plus_files for N-4 (distance 4)', () => {
      expect(getCompressionLevel(6, 10)).toBe(CompressionLevel.METADATA_PLUS_FILES);
    });

    it('should return metadata_plus_files for N-6 (distance 6)', () => {
      expect(getCompressionLevel(4, 10)).toBe(CompressionLevel.METADATA_PLUS_FILES);
    });

    it('should return metadata_only for N-7 (distance 7)', () => {
      expect(getCompressionLevel(3, 10)).toBe(CompressionLevel.METADATA_ONLY);
    });

    it('should return metadata_only for very old stories (distance 20)', () => {
      expect(getCompressionLevel(0, 20)).toBe(CompressionLevel.METADATA_ONLY);
    });

    it('should return metadata_only for distance 0 (current story)', () => {
      expect(getCompressionLevel(10, 10)).toBe(CompressionLevel.METADATA_ONLY);
    });
  });

  describe('COMPRESSION_FIELDS', () => {
    it('should include all fields for full_detail', () => {
      const fields = COMPRESSION_FIELDS[CompressionLevel.FULL_DETAIL];
      expect(fields).toContain('id');
      expect(fields).toContain('title');
      expect(fields).toContain('executor');
      expect(fields).toContain('quality_gate');
      expect(fields).toContain('status');
      expect(fields).toContain('acceptance_criteria');
      expect(fields).toContain('files_modified');
      expect(fields).toContain('dev_notes');
    });

    it('should include essential + files for metadata_plus_files', () => {
      const fields = COMPRESSION_FIELDS[CompressionLevel.METADATA_PLUS_FILES];
      expect(fields).toEqual(['id', 'title', 'executor', 'status', 'files_modified']);
    });

    it('should include only identifiers for metadata_only', () => {
      const fields = COMPRESSION_FIELDS[CompressionLevel.METADATA_ONLY];
      expect(fields).toEqual(['id', 'executor', 'status']);
    });
  });

  describe('buildFileIndex()', () => {
    it('should build Map from stories with files_modified', () => {
      const stories = [
        { id: 's1', files_modified: ['src/a.js', 'src/b.js'] },
        { id: 's2', files_modified: ['src/b.js', 'src/c.js'] },
      ];

      const index = buildFileIndex(stories);

      expect(index).toBeInstanceOf(Map);
      expect(index.get('src/a.js')).toEqual(new Set(['s1']));
      expect(index.get('src/b.js')).toEqual(new Set(['s1', 's2']));
      expect(index.get('src/c.js')).toEqual(new Set(['s2']));
    });

    it('should handle stories without files_modified', () => {
      const stories = [
        { id: 's1' },
        { id: 's2', files_modified: null },
        { id: 's3', files_modified: ['src/a.js'] },
      ];

      const index = buildFileIndex(stories);
      expect(index.size).toBe(1);
      expect(index.get('src/a.js')).toEqual(new Set(['s3']));
    });

    it('should return empty Map for empty stories array', () => {
      const index = buildFileIndex([]);
      expect(index.size).toBe(0);
    });

    it('should provide O(1) lookup', () => {
      const stories = [{ id: 's1', files_modified: ['src/x.js'] }];
      const index = buildFileIndex(stories);
      // Map.has() is O(1)
      expect(index.has('src/x.js')).toBe(true);
      expect(index.has('src/y.js')).toBe(false);
    });
  });

  describe('hasFileOverlap()', () => {
    it('should detect overlap with Set target', () => {
      const storyFiles = ['src/a.js', 'src/b.js'];
      const targetFiles = new Set(['src/b.js', 'src/c.js']);
      expect(hasFileOverlap(storyFiles, targetFiles)).toBe(true);
    });

    it('should detect no overlap', () => {
      const storyFiles = ['src/a.js'];
      const targetFiles = new Set(['src/c.js']);
      expect(hasFileOverlap(storyFiles, targetFiles)).toBe(false);
    });

    it('should handle Map target (file index)', () => {
      const index = new Map([['src/a.js', new Set(['s1'])]]);
      expect(hasFileOverlap(['src/a.js'], index)).toBe(true);
      expect(hasFileOverlap(['src/z.js'], index)).toBe(false);
    });

    it('should handle array target', () => {
      expect(hasFileOverlap(['src/a.js'], ['src/a.js', 'src/b.js'])).toBe(true);
      expect(hasFileOverlap(['src/a.js'], ['src/c.js'])).toBe(false);
    });

    it('should return false for null/empty storyFiles', () => {
      expect(hasFileOverlap(null, new Set(['a']))).toBe(false);
      expect(hasFileOverlap([], new Set(['a']))).toBe(false);
      expect(hasFileOverlap(undefined, new Set(['a']))).toBe(false);
    });
  });

  describe('truncateToTokens()', () => {
    it('should not truncate if within limit', () => {
      const text = 'short text';
      expect(truncateToTokens(text, 100)).toBe(text);
    });

    it('should truncate and add ellipsis when over limit', () => {
      const text = 'a'.repeat(100);
      // 10 tokens * 3.5 = 35 chars max
      const result = truncateToTokens(text, 10);
      expect(result).toBe('a'.repeat(35) + '...');
    });

    it('should return empty string for null/undefined', () => {
      expect(truncateToTokens(null, 10)).toBe('');
      expect(truncateToTokens(undefined, 10)).toBe('');
    });
  });

  describe('formatStoryEntry()', () => {
    const story = createStory();

    it('should format full_detail with all fields', () => {
      const entry = formatStoryEntry(story, CompressionLevel.FULL_DETAIL);
      expect(entry).toContain('id: story-1');
      expect(entry).toContain('title: Test Story');
      expect(entry).toContain('executor: @dev');
      expect(entry).toContain('quality_gate: @qa');
      expect(entry).toContain('status: completed');
      expect(entry).toContain('acceptance_criteria: AC1: Do something');
      expect(entry).toContain('files_modified: [src/index.js]');
      expect(entry).toContain('dev_notes: Implementation notes');
    });

    it('should format metadata_plus_files with 5 fields', () => {
      const entry = formatStoryEntry(story, CompressionLevel.METADATA_PLUS_FILES);
      expect(entry).toContain('id: story-1');
      expect(entry).toContain('title: Test Story');
      expect(entry).toContain('executor: @dev');
      expect(entry).toContain('status: completed');
      expect(entry).toContain('files_modified: [src/index.js]');
      expect(entry).not.toContain('quality_gate');
      expect(entry).not.toContain('dev_notes');
    });

    it('should format metadata_only with 3 fields', () => {
      const entry = formatStoryEntry(story, CompressionLevel.METADATA_ONLY);
      expect(entry).toContain('id: story-1');
      expect(entry).toContain('executor: @dev');
      expect(entry).toContain('status: completed');
      expect(entry).not.toContain('title');
      expect(entry).not.toContain('files_modified');
    });

    it('should enforce hard cap of 600 tokens per story', () => {
      const bigStory = createStory({
        dev_notes: 'x'.repeat(5000),
        acceptance_criteria: 'y'.repeat(5000),
      });
      const entry = formatStoryEntry(bigStory, CompressionLevel.FULL_DETAIL);
      const tokens = estimateTokens(entry);
      expect(tokens).toBeLessThanOrEqual(HARD_CAP_PER_STORY + 1); // +1 for rounding
    });

    it('should skip undefined/null fields', () => {
      const minimal = { id: 's1', executor: '@dev', status: 'done' };
      const entry = formatStoryEntry(minimal, CompressionLevel.FULL_DETAIL);
      expect(entry).toBe('id: s1 | executor: @dev | status: done');
    });
  });

  describe('EpicContextAccumulator class', () => {
    describe('constructor', () => {
      it('should accept a sessionState and store it', () => {
        const mockState = createMockSessionState();
        const acc = new EpicContextAccumulator(mockState);
        expect(acc.sessionState).toBe(mockState);
        expect(acc.fileIndex).toBeNull();
      });
    });

    describe('createEpicContextAccumulator()', () => {
      it('should create instance via factory', () => {
        const mockState = createMockSessionState();
        const acc = createEpicContextAccumulator(mockState);
        expect(acc).toBeInstanceOf(EpicContextAccumulator);
      });
    });

    describe('buildAccumulatedContext()', () => {
      it('should return empty string when no state', () => {
        const acc = new EpicContextAccumulator({ state: null });
        expect(acc.buildAccumulatedContext('12', 5)).toBe('');
      });

      it('should return empty string when no stories done', () => {
        const mockState = createMockSessionState([]);
        const acc = new EpicContextAccumulator(mockState);
        expect(acc.buildAccumulatedContext('12', 0)).toBe('');
      });

      it('should build context with single story', () => {
        const stories = [createStory({ id: 'story-12.1' })];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 1);

        expect(result).toContain('Epic 12 Context');
        expect(result).toContain('1 stories completed');
        expect(result).toContain('story-12.1');
      });

      it('should include executor distribution in context', () => {
        const stories = [createStory()];
        const mockState = createMockSessionState(stories, {
          executor_distribution: { '@dev': 3, '@qa': 1 },
        });
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 1);
        expect(result).toContain('@dev: 3');
        expect(result).toContain('@qa: 1');
      });

      it('should apply correct compression levels based on distance', () => {
        // Create 10 stories
        const stories = Array.from({ length: 10 }, (_, i) =>
          createStory({
            id: `story-${i}`,
            title: `Story ${i}`,
            files_modified: [`src/file${i}.js`],
          }),
        );
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10);

        // Recent (N-1, N-2, N-3) = stories 9, 8, 7 → full_detail (has quality_gate)
        expect(result).toContain('story-9');
        expect(result).toContain('story-8');
        expect(result).toContain('story-7');

        // Old stories (N-7+) = stories 0, 1, 2, 3 → metadata_only (no title)
        // These should NOT contain 'title: Story 0' etc.
        const lines = result.split('\n');
        const story0Line = lines.find(l => l.includes('story-0'));
        if (story0Line) {
          expect(story0Line).not.toContain('title:');
        }
      });
    });

    describe('Exception: file overlap', () => {
      it('should upgrade metadata_only to metadata_plus_files on file overlap', () => {
        // Story at index 0, storyN = 10 → distance 10 → metadata_only
        const stories = [
          createStory({ id: 'old-story', files_modified: ['src/shared.js'] }),
          ...Array.from({ length: 9 }, (_, i) =>
            createStory({ id: `story-${i + 1}`, files_modified: [`src/file${i}.js`] }),
          ),
        ];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10, {
          filesToModify: ['src/shared.js'],
        });

        // old-story should have been upgraded to metadata_plus_files (has title)
        const lines = result.split('\n');
        const oldStoryLine = lines.find(l => l.includes('old-story'));
        expect(oldStoryLine).toContain('title:');
        expect(oldStoryLine).toContain('files_modified:');
      });

      it('should NOT upgrade to full_detail on file overlap', () => {
        const stories = [
          createStory({ id: 'old-story', files_modified: ['src/shared.js'] }),
        ];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10, {
          filesToModify: ['src/shared.js'],
        });

        // Should be metadata_plus_files, NOT full_detail (no quality_gate)
        const lines = result.split('\n');
        const storyLine = lines.find(l => l.includes('old-story'));
        expect(storyLine).not.toContain('quality_gate:');
      });
    });

    describe('Exception: executor match', () => {
      it('should upgrade metadata_only to metadata_plus_files on executor match', () => {
        const stories = [
          createStory({ id: 'old-story', executor: '@dev' }),
        ];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10, {
          executor: '@dev',
        });

        const lines = result.split('\n');
        const storyLine = lines.find(l => l.includes('old-story'));
        expect(storyLine).toContain('title:');
      });

      it('should NOT upgrade if executor does not match', () => {
        const stories = [
          createStory({ id: 'old-story', executor: '@qa' }),
        ];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10, {
          executor: '@dev',
        });

        const lines = result.split('\n');
        const storyLine = lines.find(l => l.includes('old-story'));
        // metadata_only → no title
        expect(storyLine).not.toContain('title:');
      });

      it('should NOT upgrade full_detail stories (no downgrade from exceptions)', () => {
        // Story at index 9, storyN = 10 → distance 1 → full_detail
        const stories = Array.from({ length: 10 }, (_, i) =>
          createStory({ id: `story-${i}`, executor: '@dev' }),
        );
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10, { executor: '@dev' });

        // Recent story should still be full_detail
        const lines = result.split('\n');
        const recentLine = lines.find(l => l.includes('story-9'));
        expect(recentLine).toContain('quality_gate:');
      });
    });

    describe('Compression cascade', () => {
      it('should fit within 8000 token limit', () => {
        // Create many stories with large content to trigger cascade
        const stories = Array.from({ length: 20 }, (_, i) =>
          createStory({
            id: `story-${i}`,
            title: `Story ${i} with long title padding ${'x'.repeat(50)}`,
            dev_notes: `Notes for story ${i} ${'detail '.repeat(200)}`,
            acceptance_criteria: `AC for story ${i} ${'criteria '.repeat(200)}`,
            files_modified: Array.from({ length: 10 }, (_, j) => `src/module${i}/file${j}.js`),
          }),
        );
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 20);
        const tokens = estimateTokens(result);

        expect(tokens).toBeLessThanOrEqual(TOKEN_LIMIT);
      });

      it('should preserve recent stories even when cascading', () => {
        const stories = Array.from({ length: 20 }, (_, i) =>
          createStory({
            id: `story-${i}`,
            dev_notes: 'x'.repeat(500),
            acceptance_criteria: 'y'.repeat(500),
            files_modified: Array.from({ length: 5 }, (_, j) => `src/f${i}_${j}.js`),
          }),
        );
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 20);

        // Most recent stories should still be present
        expect(result).toContain('story-19');
        expect(result).toContain('story-18');
        expect(result).toContain('story-17');
      });
    });

    describe('getFileIndex()', () => {
      it('should return null before buildAccumulatedContext', () => {
        const mockState = createMockSessionState([]);
        const acc = new EpicContextAccumulator(mockState);
        expect(acc.getFileIndex()).toBeNull();
      });

      it('should return built index after buildAccumulatedContext', () => {
        const stories = [createStory({ files_modified: ['src/a.js'] })];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        acc.buildAccumulatedContext('12', 1);

        const index = acc.getFileIndex();
        expect(index).toBeInstanceOf(Map);
        expect(index.has('src/a.js')).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('should handle story N = 0 (first story, no prior context)', () => {
        const mockState = createMockSessionState([]);
        const acc = new EpicContextAccumulator(mockState);
        const result = acc.buildAccumulatedContext('12', 0);
        expect(result).toBe('');
      });

      it('should handle story N = 1 (only one prior story)', () => {
        const stories = [createStory({ id: 'story-0' })];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 1);
        expect(result).toContain('story-0');
      });

      it('should handle stories as string IDs (not objects)', () => {
        const stories = ['story-1', 'story-2', 'story-3'];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 3);
        expect(result).toContain('story-1');
      });

      it('should handle conflicting exceptions (both file overlap and executor)', () => {
        const stories = [
          createStory({
            id: 'old-story',
            executor: '@dev',
            files_modified: ['src/shared.js'],
          }),
        ];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 10, {
          filesToModify: ['src/shared.js'],
          executor: '@dev',
        });

        // Should be metadata_plus_files (upgraded), not full_detail
        const lines = result.split('\n');
        const storyLine = lines.find(l => l.includes('old-story'));
        expect(storyLine).toContain('title:');
        expect(storyLine).not.toContain('quality_gate:');
      });

      it('should handle stories with empty files_modified', () => {
        const stories = [createStory({ files_modified: [] })];
        const mockState = createMockSessionState(stories);
        const acc = new EpicContextAccumulator(mockState);

        const result = acc.buildAccumulatedContext('12', 1, {
          filesToModify: ['src/something.js'],
        });

        expect(result).toContain('story-1');
      });
    });
  });
});
