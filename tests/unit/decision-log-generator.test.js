/**
 * Unit Tests for Decision Log Generator
 *
 * Test Coverage:
 * - Decision log file generation
 * - Duration calculation and formatting
 * - Decision list formatting
 * - File list formatting
 * - Test result formatting
 * - Rollback information generation
 * - Error handling and edge cases
 *
 * @see .aiox-core/scripts/decision-log-generator.js
 */

const {
  generateDecisionLog,
  calculateDuration,
  generateDecisionsList,
  generateFilesList,
  generateTestsList,
  generateRollbackFilesList,
} = require('../../.aiox-core/development/scripts/decision-log-generator');

const fs = require('fs').promises;
const path = require('path');

describe('decision-log-generator', () => {
  const testAiDir = '.ai-test';
  const originalDateNow = Date.now;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testAiDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }

    // Mock Date.now for consistent timestamps
    Date.now = jest.fn(() => 1705406400000); // 2024-01-16 12:00:00 UTC
  });

  afterEach(async () => {
    // Restore Date.now
    Date.now = originalDateNow;

    // Clean up test directory
    try {
      await fs.rm(testAiDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('calculateDuration', () => {
    test('should format duration in hours and minutes when > 1 hour', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000 + (3600000 * 2.5), // 2.5 hours later
      };

      const result = calculateDuration(context);

      expect(result).toBe('2h 30m');
    });

    test('should format duration in minutes and seconds when < 1 hour', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000 + (60000 * 5.5), // 5.5 minutes later
      };

      const result = calculateDuration(context);

      expect(result).toBe('5m 30s');
    });

    test('should format duration in seconds when < 1 minute', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000 + 45000, // 45 seconds later
      };

      const result = calculateDuration(context);

      expect(result).toBe('45s');
    });

    test('should show "in progress" when endTime is missing', () => {
      const context = {
        startTime: 1705406400000,
        // No endTime
      };

      const result = calculateDuration(context);

      expect(result).toContain('in progress');
    });

    test('should handle zero duration', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000, // Same time
      };

      const result = calculateDuration(context);

      expect(result).toBe('0s');
    });
  });

  describe('generateDecisionsList', () => {
    test('should generate markdown for decisions with all fields', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Use Axios for HTTP client',
          reason: 'Better error handling',
          alternatives: ['Fetch API', 'Got library'],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('### Decision 1: Use Axios for HTTP client');
      expect(result).toContain('**Timestamp:**');
      expect(result).toContain('**Reason:** Better error handling');
      expect(result).toContain('**Alternatives Considered:**');
      expect(result).toContain('- Fetch API');
      expect(result).toContain('- Got library');
    });

    test('should generate markdown for multiple decisions', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Decision 1',
          reason: 'Reason 1',
          alternatives: [],
        },
        {
          timestamp: 1705406400000,
          description: 'Decision 2',
          reason: 'Reason 2',
          alternatives: ['Alt 1'],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('### Decision 1: Decision 1');
      expect(result).toContain('### Decision 2: Decision 2');
      expect(result).toContain('**Reason:** Reason 1');
      expect(result).toContain('**Reason:** Reason 2');
    });

    test('should handle decisions without alternatives', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Simple decision',
          reason: 'Only one option',
          alternatives: [],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('### Decision 1: Simple decision');
      expect(result).not.toContain('**Alternatives Considered:**');
    });

    test('should return message when no decisions provided', () => {
      const result = generateDecisionsList([]);

      expect(result).toBe('*No autonomous decisions recorded.*');
    });

    test('should handle null/undefined decisions array', () => {
      expect(generateDecisionsList(null)).toBe('*No autonomous decisions recorded.*');
      expect(generateDecisionsList(undefined)).toBe('*No autonomous decisions recorded.*');
    });

    test('should include type and priority fields when present (AC7)', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Architecture decision',
          type: 'architecture',
          priority: 'high',
          reason: 'Better scalability',
          alternatives: ['Monolith'],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('**Type:** architecture');
      expect(result).toContain('**Priority:** high');
    });
  });

  describe('generateFilesList', () => {
    test('should generate markdown for files with action metadata', () => {
      const files = [
        { path: 'src/api.js', action: 'created' },
        { path: 'src/utils.js', action: 'modified' },
      ];

      const result = generateFilesList(files);

      expect(result).toContain('- `src/api.js` (created)');
      expect(result).toContain('- `src/utils.js` (modified)');
    });

    test('should handle files as simple strings', () => {
      const files = ['file1.js', 'file2.js'];

      const result = generateFilesList(files);

      expect(result).toContain('- `file1.js` (modified)');
      expect(result).toContain('- `file2.js` (modified)');
    });

    test('should use "modified" as default action', () => {
      const files = [{ path: 'test.js' }];

      const result = generateFilesList(files);

      expect(result).toContain('(modified)');
    });

    test('should return message when no files provided', () => {
      const result = generateFilesList([]);

      expect(result).toBe('*No files modified.*');
    });

    test('should handle null/undefined files array', () => {
      expect(generateFilesList(null)).toBe('*No files modified.*');
      expect(generateFilesList(undefined)).toBe('*No files modified.*');
    });
  });

  describe('generateTestsList', () => {
    test('should generate markdown for passed tests', () => {
      const tests = [
        { name: 'api.test.js', passed: true, duration: 125 },
      ];

      const result = generateTestsList(tests);

      expect(result).toContain('- ✅ PASS: `api.test.js` (125ms)');
    });

    test('should generate markdown for failed tests with error', () => {
      const tests = [
        { name: 'broken.test.js', passed: false, duration: 50, error: 'Assertion failed' },
      ];

      const result = generateTestsList(tests);

      expect(result).toContain('- ❌ FAIL: `broken.test.js` (50ms)');
      expect(result).toContain('- Error: Assertion failed');
    });

    test('should handle tests without duration', () => {
      const tests = [
        { name: 'test.js', passed: true },
      ];

      const result = generateTestsList(tests);

      expect(result).toContain('- ✅ PASS: `test.js`');
      expect(result).not.toContain('ms)');
    });

    test('should return message when no tests provided', () => {
      const result = generateTestsList([]);

      expect(result).toBe('*No tests recorded.*');
    });

    test('should handle null/undefined tests array', () => {
      expect(generateTestsList(null)).toBe('*No tests recorded.*');
      expect(generateTestsList(undefined)).toBe('*No tests recorded.*');
    });
  });

  describe('generateRollbackFilesList', () => {
    test('should generate file list for rollback', () => {
      const files = [
        { path: 'src/api.js', action: 'created' },
        { path: 'src/utils.js', action: 'modified' },
      ];

      const result = generateRollbackFilesList(files);

      expect(result).toContain('- src/api.js');
      expect(result).toContain('- src/utils.js');
    });

    test('should handle string file paths', () => {
      const files = ['file1.js', 'file2.js'];

      const result = generateRollbackFilesList(files);

      expect(result).toContain('- file1.js');
      expect(result).toContain('- file2.js');
    });

    test('should return message when no files provided', () => {
      const result = generateRollbackFilesList([]);

      expect(result).toBe('*No files to rollback.*');
    });

    test('should handle null/undefined files array', () => {
      expect(generateRollbackFilesList(null)).toBe('*No files to rollback.*');
      expect(generateRollbackFilesList(undefined)).toBe('*No files to rollback.*');
    });
  });

  describe('generateDecisionLog', () => {
    test('should create decision log file with complete context', async () => {
      const storyId = 'story-6.1.2.6';
      const context = {
        agentId: 'dev',
        storyPath: 'docs/stories/story-6.1.2.6.md',
        startTime: 1705406400000,
        endTime: 1705410000000, // 1 hour later
        status: 'completed',
        decisions: [
          {
            timestamp: 1705408000000,
            description: 'Use Axios for HTTP',
            reason: 'Better error handling',
            alternatives: ['Fetch API', 'Got library'],
          },
        ],
        filesModified: [
          { path: 'src/api.js', action: 'created' },
        ],
        testsRun: [
          { name: 'api.test.js', passed: true, duration: 125 },
        ],
        metrics: {
          agentLoadTime: 150,
          taskExecutionTime: 60000,
        },
        commitBefore: 'abc123def456',
      };

      const logPath = await generateDecisionLog(storyId, context);

      // Verify file was created (normalize path for cross-platform compatibility)
      expect(logPath).toBe(path.join('.ai', 'decision-log-story-6.1.2.6.md'));

      // Read and verify file contents
      const content = await fs.readFile(logPath, 'utf8');

      expect(content).toContain('# Decision Log: Story story-6.1.2.6');
      expect(content).toContain('**Agent:** dev');
      expect(content).toContain('**Story:** docs/stories/story-6.1.2.6.md');
      expect(content).toContain('**Status:** completed');
      expect(content).toContain('## Decisions Made');
      expect(content).toContain('Use Axios for HTTP');
      expect(content).toContain('### Files Modified');
      expect(content).toContain('src/api.js');
      expect(content).toContain('### Test Results');
      expect(content).toContain('api.test.js');
      expect(content).toContain('### Rollback Instructions');
      expect(content).toContain('git reset --hard abc123def456');
      expect(content).toContain('### Performance Impact');
      expect(content).toContain('Agent Load Time: 150ms');
    });

    test('should create decision log with minimal context', async () => {
      const storyId = 'story-6.1.2.6';
      const context = {
        agentId: 'dev',
        storyPath: 'docs/stories/story-6.1.2.6.md',
        startTime: 1705406400000,
        status: 'in-progress',
      };

      const logPath = await generateDecisionLog(storyId, context);

      // Normalize path for cross-platform compatibility
      expect(logPath).toBe(path.join('.ai', 'decision-log-story-6.1.2.6.md'));

      const content = await fs.readFile(logPath, 'utf8');

      expect(content).toContain('**Status:** in-progress');
      expect(content).toContain('**Completed:** In Progress');
      expect(content).toContain('*No autonomous decisions recorded.*');
      expect(content).toContain('*No files modified.*');
      expect(content).toContain('*No tests recorded.*');
    });

    test('should create .ai directory if it does not exist', async () => {
      // .ai directory is cleaned up in beforeEach
      const storyId = 'test-story';
      const context = {
        agentId: 'dev',
        storyPath: 'test.md',
        startTime: Date.now(),
        status: 'completed',
      };

      await generateDecisionLog(storyId, context);

      // Verify .ai directory was created
      const stats = await fs.stat('.ai');
      expect(stats.isDirectory()).toBe(true);
    });

    test('should handle missing endTime gracefully', async () => {
      const context = {
        agentId: 'dev',
        storyPath: 'test.md',
        startTime: 1705406400000,
        status: 'running',
      };

      const logPath = await generateDecisionLog('test', context);
      const content = await fs.readFile(logPath, 'utf8');

      expect(content).toContain('**Completed:** In Progress');
      expect(content).toContain('in progress');
    });

    test('should handle missing commitBefore with default', async () => {
      const context = {
        agentId: 'dev',
        storyPath: 'test.md',
        startTime: 1705406400000,
        status: 'completed',
      };

      const logPath = await generateDecisionLog('test', context);
      const content = await fs.readFile(logPath, 'utf8');

      expect(content).toContain('git reset --hard HEAD');
    });

    test('should handle missing metrics gracefully', async () => {
      const context = {
        agentId: 'dev',
        storyPath: 'test.md',
        startTime: 1705406400000,
        status: 'completed',
        // No metrics provided
      };

      const logPath = await generateDecisionLog('test', context);
      const content = await fs.readFile(logPath, 'utf8');

      expect(content).toContain('*No performance metrics recorded.*');
    });
  });
});
