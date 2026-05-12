/**
 * Unit Tests for Decision Log Indexer
 *
 * Tests the indexing system for decision logs.
 *
 * @see .aiox-core/scripts/decision-log-indexer.js
 */

const fs = require('fs').promises;
const path = require('path');
const {
  parseLogMetadata,
  generateIndexContent,
  addToIndex,
  rebuildIndex,
} = require('../../.aiox-core/development/scripts/decision-log-indexer');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

describe('decision-log-indexer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseLogMetadata', () => {
    it('should parse metadata from decision log file', async () => {
      const mockLogContent = `# Decision Log: Story 6.1.2.6.2

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Mode:** Yolo (Autonomous Development)
**Story:** docs/stories/story-6.1.2.6.2.md
**Rollback:** \`git reset --hard abc123\`

---

## Context

**Story Implementation:** 6.1.2.6.2
**Execution Time:** 15m 30s
**Status:** completed

**Files Modified:** 5 files
**Tests Run:** 8 tests
**Decisions Made:** 3 autonomous decisions
`;

      fs.readFile.mockResolvedValue(mockLogContent);

      const metadata = await parseLogMetadata('.ai/decision-log-6.1.2.6.2.md');

      expect(metadata).toBeDefined();
      expect(metadata.storyId).toBe('6.1.2.6.2');
      expect(metadata.agent).toBe('dev');
      expect(metadata.status).toBe('completed');
      expect(metadata.duration).toBe('15m 30s');
      expect(metadata.decisionCount).toBe(3);
      expect(metadata.timestamp).toBeInstanceOf(Date);
    });

    it('should handle missing metadata fields gracefully', async () => {
      const mockLogContent = `# Decision Log: Story test

Some content without proper metadata
`;

      fs.readFile.mockResolvedValue(mockLogContent);

      const metadata = await parseLogMetadata('.ai/decision-log-test.md');

      expect(metadata).toBeDefined();
      expect(metadata.storyId).toBe('test');
      expect(metadata.agent).toBe('unknown');
      expect(metadata.status).toBe('unknown');
      expect(metadata.duration).toBe('0s');
      expect(metadata.decisionCount).toBe(0);
    });

    it('should return null on read error', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const metadata = await parseLogMetadata('.ai/missing.md');

      expect(metadata).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('generateIndexContent', () => {
    it('should generate markdown index from metadata array', () => {
      const metadata = [
        {
          storyId: '6.1.2.6.2',
          timestamp: new Date('2025-11-16T14:30:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '15m 30s',
          decisionCount: 3,
          logPath: '.ai/decision-log-6.1.2.6.2.md',
        },
        {
          storyId: '6.1.2.6.1',
          timestamp: new Date('2025-11-15T10:00:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '5m 10s',
          decisionCount: 1,
          logPath: '.ai/decision-log-6.1.2.6.1.md',
        },
      ];

      const indexContent = generateIndexContent(metadata);

      expect(indexContent).toContain('# Decision Log Index');
      expect(indexContent).toContain('Total logs: 2');
      expect(indexContent).toContain('6.1.2.6.2');
      expect(indexContent).toContain('6.1.2.6.1');
      expect(indexContent).toContain('2025-11-16');
      expect(indexContent).toContain('2025-11-15');
      expect(indexContent).toContain('completed');
      expect(indexContent).toContain('15m 30s');
      expect(indexContent).toContain('5m 10s');
      expect(indexContent).toContain('[View](decision-log-6.1.2.6.2.md)');
    });

    it('should sort logs by timestamp (newest first)', () => {
      const metadata = [
        {
          storyId: 'old',
          timestamp: new Date('2025-11-10T10:00:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '5m',
          decisionCount: 1,
          logPath: '.ai/decision-log-old.md',
        },
        {
          storyId: 'new',
          timestamp: new Date('2025-11-16T10:00:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '3m',
          decisionCount: 2,
          logPath: '.ai/decision-log-new.md',
        },
      ];

      const indexContent = generateIndexContent(metadata);

      // 'new' should appear before 'old' in the table
      const newIndex = indexContent.indexOf('| new |');
      const oldIndex = indexContent.indexOf('| old |');

      expect(newIndex).toBeLessThan(oldIndex);
    });

    it('should handle empty metadata array', () => {
      const indexContent = generateIndexContent([]);

      expect(indexContent).toContain('# Decision Log Index');
      expect(indexContent).toContain('Total logs: 0');
    });
  });

  describe('addToIndex', () => {
    it('should create new index file if it does not exist', async () => {
      // Mock config
      const yaml = require('js-yaml');
      jest.spyOn(yaml, 'load').mockReturnValue({
        decisionLogging: {
          enabled: true,
          location: '.ai/',
          indexFile: 'decision-logs-index.md',
        },
      });

      // Mock log content
      const mockLogContent = `# Decision Log: Story 6.1.2.6.2

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Story:** docs/stories/story-6.1.2.6.2.md
**Status:** completed
**Execution Time:** 15m 30s
**Decisions Made:** 3 autonomous decisions
`;

      fs.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('core-config.yaml')) {
          return Promise.resolve('decisionLogging:\n  enabled: true\n  location: .ai/\n  indexFile: decision-logs-index.md');
        }
        if (filePath.includes('decision-log-6.1.2.6.2')) {
          return Promise.resolve(mockLogContent);
        }
        // Index doesn't exist yet
        return Promise.reject(new Error('ENOENT'));
      });

      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const indexPath = await addToIndex('.ai/decision-log-6.1.2.6.2.md');

      expect(indexPath).toBe(path.join('.ai', 'decision-logs-index.md'));
      expect(fs.mkdir).toHaveBeenCalledWith('.ai/', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalled();

      const writeCall = fs.writeFile.mock.calls[0];
      const indexContent = writeCall[1];

      expect(indexContent).toContain('# Decision Log Index');
      expect(indexContent).toContain('6.1.2.6.2');
      expect(indexContent).toContain('Total logs: 1');

      consoleSpy.mockRestore();
    });

    it('should update existing index file', async () => {
      const yaml = require('js-yaml');
      jest.spyOn(yaml, 'load').mockReturnValue({
        decisionLogging: {
          enabled: true,
          location: '.ai/',
          indexFile: 'decision-logs-index.md',
        },
      });

      const existingIndex = `# Decision Log Index

Total logs: 1

| Story ID | Date | Agent | Status | Duration | Decisions | Log File |
|----------|------|-------|--------|----------|-----------|----------|
| old-story | 2025-11-10 | dev | completed | 5m | 1 | [View](decision-log-old-story.md) |
`;

      const newLogContent = `# Decision Log: Story new-story

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Story:** docs/stories/new-story.md
**Status:** completed
**Execution Time:** 10m
**Decisions Made:** 2 autonomous decisions
`;

      fs.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('core-config.yaml')) {
          return Promise.resolve('decisionLogging:\n  enabled: true');
        }
        if (filePath.includes('new-story')) {
          return Promise.resolve(newLogContent);
        }
        if (filePath.includes('index')) {
          return Promise.resolve(existingIndex);
        }
        return Promise.reject(new Error('File not found'));
      });

      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await addToIndex('.ai/decision-log-new-story.md');

      const writeCall = fs.writeFile.mock.calls[0];
      const updatedIndexContent = writeCall[1];

      expect(updatedIndexContent).toContain('new-story');
      expect(updatedIndexContent).toContain('old-story');
      expect(updatedIndexContent).toContain('Total logs: 2');
    });

    it('should replace existing entry for same story ID', async () => {
      const yaml = require('js-yaml');
      jest.spyOn(yaml, 'load').mockReturnValue({
        decisionLogging: {
          enabled: true,
          location: '.ai/',
          indexFile: 'decision-logs-index.md',
        },
      });

      const existingIndex = `# Decision Log Index

Total logs: 1

| Story ID | Date | Agent | Status | Duration | Decisions | Log File |
|----------|------|-------|--------|----------|-----------|----------|
| 6.1.2.6.2 | 2025-11-15 | dev | completed | 5m | 1 | [View](decision-log-6.1.2.6.2.md) |
`;

      const updatedLogContent = `# Decision Log: Story 6.1.2.6.2

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Story:** docs/stories/story-6.1.2.6.2.md
**Status:** completed
**Execution Time:** 10m
**Decisions Made:** 3 autonomous decisions
`;

      fs.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('core-config.yaml')) {
          return Promise.resolve('decisionLogging:\n  enabled: true');
        }
        if (filePath.includes('6.1.2.6.2')) {
          return Promise.resolve(updatedLogContent);
        }
        if (filePath.includes('index')) {
          return Promise.resolve(existingIndex);
        }
        return Promise.reject(new Error('File not found'));
      });

      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await addToIndex('.ai/decision-log-6.1.2.6.2.md');

      const writeCall = fs.writeFile.mock.calls[0];
      const updatedIndexContent = writeCall[1];

      // Should still have only 1 log (old entry replaced)
      expect(updatedIndexContent).toContain('Total logs: 1');
      expect(updatedIndexContent).toContain('6.1.2.6.2');
      expect(updatedIndexContent).toContain('2025-11-16');
      expect(updatedIndexContent).toContain('10m');
      expect(updatedIndexContent).toContain('3');
    });

    it('should return null when decision logging is disabled', async () => {
      const yaml = require('js-yaml');
      jest.spyOn(yaml, 'load').mockReturnValue({
        decisionLogging: {
          enabled: false,
        },
      });

      fs.readFile.mockResolvedValue('decisionLogging:\n  enabled: false');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await addToIndex('.ai/decision-log-test.md');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('disabled'));

      consoleSpy.mockRestore();
    });
  });

  describe('rebuildIndex', () => {
    it('should rebuild index from all log files in directory', async () => {
      const yaml = require('js-yaml');
      jest.spyOn(yaml, 'load').mockReturnValue({
        decisionLogging: {
          enabled: true,
          location: '.ai/',
          indexFile: 'decision-logs-index.md',
        },
      });

      fs.readdir.mockResolvedValue([
        'decision-log-6.1.2.6.2.md',
        'decision-log-6.1.2.6.1.md',
        'other-file.md',
        'decision-logs-index.md',
      ]);

      const log1Content = `**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Story:** story1.md
**Status:** completed
**Execution Time:** 10m
**Decisions Made:** 3`;

      const log2Content = `**Generated:** 2025-11-15T10:00:00.000Z
**Agent:** dev
**Story:** story2.md
**Status:** completed
**Execution Time:** 5m
**Decisions Made:** 1`;

      fs.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('core-config.yaml')) {
          return Promise.resolve('decisionLogging:\n  enabled: true');
        }
        if (filePath.includes('6.1.2.6.2')) {
          return Promise.resolve(log1Content);
        }
        if (filePath.includes('6.1.2.6.1')) {
          return Promise.resolve(log2Content);
        }
        return Promise.reject(new Error('File not found'));
      });

      fs.writeFile.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await rebuildIndex();

      expect(fs.readdir).toHaveBeenCalledWith('.ai/');

      const writeCall = fs.writeFile.mock.calls[0];
      const indexContent = writeCall[1];

      expect(indexContent).toContain('Total logs: 2');
      expect(indexContent).toContain('6.1.2.6.2');
      expect(indexContent).toContain('6.1.2.6.1');

      consoleSpy.mockRestore();
    });
  });
});
