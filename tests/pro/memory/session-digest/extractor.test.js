/**
 * Session Digest Extractor Tests
 * Story MIS-3: Session Digest (PreCompact Hook)
 *
 * Requires pro/ submodule. Tests skip gracefully in CI
 * where the submodule is not available.
 */

// Mock fs FIRST (before any requires)
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

let extractorModule;
try {
  extractorModule = require('../../../../pro/memory/session-digest/extractor');
} catch (e) {
  // pro/ submodule not available (CI environment)
}

const isProAvailable = !!extractorModule;
const extractSessionDigest = isProAvailable ? extractorModule.extractSessionDigest : undefined;
const _analyzeConversation = isProAvailable ? extractorModule._analyzeConversation : undefined;
const _generateDigestDocument = isProAvailable ? extractorModule._generateDigestDocument : undefined;
const _writeDigest = isProAvailable ? extractorModule._writeDigest : undefined;

(isProAvailable ? describe : describe.skip)('Session Digest Extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.promises.mkdir.mockClear();
    fs.promises.writeFile.mockClear();
    fs.promises.mkdir.mockResolvedValue(undefined);
    fs.promises.writeFile.mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('extractSessionDigest', () => {
    it('should extract and write digest successfully', async () => {
      const context = {
        sessionId: 'test-session-123',
        projectDir: '/test/project',
        conversation: {
          messages: [
            { role: 'user', content: 'Actually, the path should be /correct/path' },
            { role: 'assistant', content: 'I understand.' },
          ],
        },
        metadata: {
          sessionStart: Date.now() - 60000, // 1 minute ago
          compactTrigger: 'context_limit_90%',
        },
      };

      const digestPath = await extractSessionDigest(context);

      // Check path contains correct components (cross-platform)
      expect(digestPath).toContain('.aiox');
      expect(digestPath).toContain('session-digests');
      expect(digestPath).toContain('test-session-123');
      expect(digestPath).toMatch(/\.yaml$/);
      expect(fs.promises.mkdir).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should handle extraction errors and throw', async () => {
      const context = {
        sessionId: 'test-session-123',
        projectDir: '/test/project',
        conversation: { messages: [] },
      };

      fs.promises.writeFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(extractSessionDigest(context)).rejects.toThrow('Write failed');
    });

    it('should complete within performance budget (< 5s)', async () => {
      const context = {
        sessionId: 'test-session-123',
        projectDir: '/test/project',
        conversation: {
          messages: Array(100).fill({ role: 'user', content: 'Test message' }),
        },
        metadata: {},
      };

      const startTime = Date.now();
      await extractSessionDigest(context);
      const duration = Date.now() - startTime;

      // Should complete in < 5 seconds (story requirement)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('_analyzeConversation', () => {
    it('should extract user corrections', async () => {
      const context = {
        conversation: {
          messages: [
            { role: 'user', content: 'Actually, the correct way is to use async/await' },
            { role: 'user', content: 'No, that\'s wrong. Use promises instead' },
          ],
        },
        metadata: {},
      };

      const insights = await _analyzeConversation(context);

      expect(insights.corrections).toHaveLength(2);
      expect(insights.corrections[0]).toContain('Actually');
      expect(insights.corrections[1]).toContain('No');
    });

    it('should identify patterns in conversation', async () => {
      const context = {
        conversation: {
          messages: [
            { role: 'user', content: 'How do I create a file?' },
            { role: 'user', content: 'How do I delete a file?' },
            { role: 'user', content: 'How do I read a file?' },
          ],
        },
        metadata: {},
      };

      const insights = await _analyzeConversation(context);

      expect(insights.patterns.length).toBeGreaterThan(0);
      expect(insights.patterns[0]).toContain('how-to');
    });

    it('should extract axioms from conversation', async () => {
      const context = {
        conversation: {
          messages: [
            { role: 'assistant', content: 'Always use ESLint for code quality.' },
            { role: 'assistant', content: 'Never commit secrets to git.' },
          ],
        },
        metadata: {},
      };

      const insights = await _analyzeConversation(context);

      expect(insights.axioms).toHaveLength(2);
      expect(insights.axioms[0]).toContain('Always use ESLint');
      expect(insights.axioms[1]).toContain('Never commit secrets');
    });

    it('should capture context snapshot', async () => {
      const context = {
        conversation: { messages: [] },
        metadata: {
          activeAgent: '@dev',
          activeStory: 'MIS-3',
          filesModified: ['file1.js', 'file2.js'],
        },
      };

      const insights = await _analyzeConversation(context);

      expect(insights.contextSnapshot).toMatchObject({
        activeAgent: '@dev',
        activeStory: 'MIS-3',
        filesModified: ['file1.js', 'file2.js'],
      });
    });
  });

  describe('_generateDigestDocument', () => {
    it('should generate document with schema version', () => {
      const context = {
        sessionId: 'test-session-123',
        metadata: {},
      };

      const insights = {
        corrections: ['Correction 1'],
        patterns: ['Pattern 1'],
        axioms: ['Axiom 1'],
        contextSnapshot: { activeAgent: 'unknown' },
      };

      const digest = _generateDigestDocument(context, insights);

      expect(digest.schema_version).toBe('1.0');
      expect(digest.session_id).toBe('test-session-123');
      expect(digest.timestamp).toBeDefined();
      expect(digest.body).toMatchObject({
        user_corrections: ['Correction 1'],
        patterns_observed: ['Pattern 1'],
        axioms_learned: ['Axiom 1'],
      });
    });

    it('should calculate session duration', () => {
      const sessionStart = Date.now() - 120000; // 2 minutes ago

      const context = {
        sessionId: 'test-session-123',
        metadata: { sessionStart },
      };

      const insights = {
        corrections: [],
        patterns: [],
        axioms: [],
        contextSnapshot: {},
      };

      const digest = _generateDigestDocument(context, insights);

      expect(digest.duration_minutes).toBeGreaterThanOrEqual(1);
      expect(digest.duration_minutes).toBeLessThanOrEqual(3);
    });
  });

  describe('_writeDigest', () => {
    it('should create storage directory', async () => {
      const projectDir = '/test/project';
      const sessionId = 'test-session-123';
      const digest = {
        schema_version: '1.0',
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        duration_minutes: 10,
        agent_context: 'test',
        compact_trigger: 'test',
        body: {
          user_corrections: [],
          patterns_observed: [],
          axioms_learned: [],
          context_snapshot: {},
        },
      };

      await _writeDigest(projectDir, sessionId, digest);

      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.aiox'),
        { recursive: true },
      );
    });

    it('should write YAML file with correct naming', async () => {
      const projectDir = '/test/project';
      const sessionId = 'test-session-123';
      const digest = {
        schema_version: '1.0',
        session_id: sessionId,
        timestamp: '2026-02-09T18:00:00.000Z',
        duration_minutes: 10,
        agent_context: 'test',
        compact_trigger: 'test',
        body: {
          user_corrections: [],
          patterns_observed: [],
          axioms_learned: [],
          context_snapshot: {},
        },
      };

      const digestPath = await _writeDigest(projectDir, sessionId, digest);

      // Check path components (cross-platform)
      expect(digestPath).toContain('test-session-123');
      expect(digestPath).toMatch(/\.yaml$/);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test-session-123'),
        expect.stringContaining('schema_version: "1.0"'),
        'utf8',
      );
    });

    it('should generate valid YAML content', async () => {
      const projectDir = '/test/project';
      const sessionId = 'test-session-123';
      const digest = {
        schema_version: '1.0',
        session_id: sessionId,
        timestamp: '2026-02-09T18:00:00.000Z',
        duration_minutes: 10,
        agent_context: '@dev',
        compact_trigger: 'context_limit',
        body: {
          user_corrections: ['Correction 1'],
          patterns_observed: ['Pattern 1'],
          axioms_learned: ['Axiom 1'],
          context_snapshot: { activeAgent: '@dev' },
        },
      };

      await _writeDigest(projectDir, sessionId, digest);

      const [, yamlContent] = fs.promises.writeFile.mock.calls[0];

      // Should have frontmatter delimiter
      expect(yamlContent).toContain('---');

      // Should have body sections
      expect(yamlContent).toContain('## User Corrections');
      expect(yamlContent).toContain('## Patterns Observed');
      expect(yamlContent).toContain('## Axioms Learned');
      expect(yamlContent).toContain('## Context Snapshot');

      // Should be parseable YAML frontmatter
      const frontmatterMatch = yamlContent.match(/^---\n([\s\S]+?)\n---/);
      expect(frontmatterMatch).toBeTruthy();

      const frontmatter = yaml.parse(frontmatterMatch[1]);
      expect(frontmatter.schema_version).toBe('1.0');
    });
  });
});
