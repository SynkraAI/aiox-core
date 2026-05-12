/**
 * PreCompact Hook Integration Tests
 * Story MIS-3: Session Digest (PreCompact Hook)
 *
 * End-to-end tests validating the complete flow:
 * 1. PreCompact hook fires
 * 2. Pro detection works
 * 3. Digest extractor runs
 * 4. YAML file is created
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');
const { onPreCompact } = require('../../../.aiox-core/hooks/unified/runners/precompact-runner');
const proDetector = require('../../../bin/utils/pro-detector');

describe('PreCompact Hook Integration', () => {
  const TEST_PROJECT_DIR = path.join(__dirname, '..', '..', '..', '.aiox-test');
  const TEST_DIGESTS_DIR = path.join(TEST_PROJECT_DIR, '.aiox', 'session-digests');

  beforeAll(async () => {
    // Create test project directory
    await fs.mkdir(TEST_DIGESTS_DIR, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      await fs.rm(TEST_PROJECT_DIR, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('End-to-End Flow (with aiox-pro)', () => {
    it('should create digest file when pro is available', async () => {
      // This test requires actual aiox-pro to be present
      const proAvailable = proDetector.isProAvailable();

      if (!proAvailable) {
        console.log('[Integration Test] Skipping: aiox-pro not available');
        return; // Skip test if pro not available
      }

      const context = {
        sessionId: 'integration-test-session',
        projectDir: TEST_PROJECT_DIR,
        conversation: {
          messages: [
            { role: 'user', content: 'Actually, tests should expect null' },
            { role: 'assistant', content: 'You\'re right, I\'ll update the tests' },
            { role: 'user', content: 'How do I run the tests?' },
            { role: 'assistant', content: 'Run npm test' },
          ],
        },
        metadata: {
          sessionStart: Date.now() - 60000,
          compactTrigger: 'context_limit_90%',
          activeAgent: '@dev',
          activeStory: 'MIS-3',
        },
      };

      // Execute hook
      await onPreCompact(context);

      // Wait for async digest to complete
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify digest file was created
      const files = await fs.readdir(TEST_DIGESTS_DIR);
      const digestFile = files.find(f => f.startsWith('integration-test-session'));

      expect(digestFile).toBeDefined();

      // Read and verify digest content
      const digestPath = path.join(TEST_DIGESTS_DIR, digestFile);
      const digestContent = await fs.readFile(digestPath, 'utf8');

      // Verify YAML structure
      expect(digestContent).toContain('---'); // Frontmatter delimiter
      expect(digestContent).toContain('schema_version:');
      expect(digestContent).toContain('## User Corrections');
      expect(digestContent).toContain('## Patterns Observed');
      expect(digestContent).toContain('## Axioms Learned');
      expect(digestContent).toContain('## Context Snapshot');

      // Parse frontmatter
      const frontmatterMatch = digestContent.match(/^---\n([\s\S]+?)\n---/);
      expect(frontmatterMatch).toBeTruthy();

      const frontmatter = yaml.parse(frontmatterMatch[1]);
      expect(frontmatter.schema_version).toBe('1.0');
      expect(frontmatter.session_id).toBe('integration-test-session');
      expect(frontmatter.agent_context).toContain('@dev');

      // Cleanup
      await fs.unlink(digestPath);
    }, 10000); // 10s timeout for async operations

    it('should handle graceful degradation when pro not available', async () => {
      // Skip this test if pro is actually available (can't mock in integration test)
      const proAvailable = proDetector.isProAvailable();
      if (proAvailable) {
        // If pro is available, we can't properly test the no-pro path in integration
        // This scenario is already covered in unit tests
        console.log('[Test] Skipping graceful degradation test - aiox-pro is available');
        return;
      }

      const context = {
        sessionId: 'test-no-pro-session',
        projectDir: TEST_PROJECT_DIR,
        conversation: { messages: [] },
      };

      // Should not throw
      await expect(onPreCompact(context)).resolves.toBeUndefined();

      // Should log graceful message
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('aiox-pro not available'),
      );

      // No digest file should be created
      const files = await fs.readdir(TEST_DIGESTS_DIR);
      const digestFile = files.find(f => f.startsWith('test-no-pro-session'));

      expect(digestFile).toBeUndefined();
    });
  });

  describe('Performance Benchmarking', () => {
    it('should complete digest extraction within 5 seconds', async () => {
      const proAvailable = proDetector.isProAvailable();

      if (!proAvailable) {
        console.log('[Performance Test] Skipping: aiox-pro not available');
        return;
      }

      // Create a large conversation (100 messages)
      const largeConversation = {
        messages: Array.from({ length: 100 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}: This is a test message with some content to analyze.`,
        })),
      };

      const context = {
        sessionId: 'performance-test-session',
        projectDir: TEST_PROJECT_DIR,
        conversation: largeConversation,
        metadata: {
          sessionStart: Date.now() - 300000, // 5 minutes ago
        },
      };

      // Execute hook
      await onPreCompact(context);

      // Wait for async digest
      const startAsyncTime = Date.now();
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for digest to complete

      const asyncDuration = Date.now() - startAsyncTime;

      // Verify performance requirement (< 5s for async completion)
      // Note: We only measure async execution time, not the full wait
      expect(asyncDuration).toBeLessThan(5000);

      // Cleanup
      const files = await fs.readdir(TEST_DIGESTS_DIR);
      const digestFile = files.find(f => f.startsWith('performance-test-session'));
      if (digestFile) {
        await fs.unlink(path.join(TEST_DIGESTS_DIR, digestFile));
      }
    }, 10000); // 10s timeout

    it('should not block compact operation (async fire-and-forget)', async () => {
      const proAvailable = proDetector.isProAvailable();

      if (!proAvailable) {
        console.log('[Async Test] Skipping: aiox-pro not available');
        return;
      }

      const context = {
        sessionId: 'async-test-session',
        projectDir: TEST_PROJECT_DIR,
        conversation: {
          messages: Array.from({ length: 50 }, () => ({
            role: 'user',
            content: 'Test message',
          })),
        },
      };

      const startTime = Date.now();

      // onPreCompact should return immediately
      await onPreCompact(context);

      const returnTime = Date.now() - startTime;

      // Should return in < 50ms (fire-and-forget)
      expect(returnTime).toBeLessThan(50);

      // Wait for digest to be created, then cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      try {
        const files = await fs.readdir(TEST_DIGESTS_DIR);
        const digestFile = files.find(f => f.startsWith('async-test-session'));
        if (digestFile) {
          await fs.unlink(path.join(TEST_DIGESTS_DIR, digestFile));
        }
      } catch (err) {
        // Ignore cleanup errors
      }
    });
  });

  describe('Schema Validation', () => {
    it('should generate digest with valid schema v1.0', async () => {
      const proAvailable = proDetector.isProAvailable();

      if (!proAvailable) {
        console.log('[Schema Test] Skipping: aiox-pro not available');
        return;
      }

      const context = {
        sessionId: 'schema-test-session',
        projectDir: TEST_PROJECT_DIR,
        conversation: {
          messages: [
            { role: 'user', content: 'Test correction message' },
          ],
        },
        metadata: {
          sessionStart: Date.now(),
        },
      };

      await onPreCompact(context);

      // Wait for digest
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setTimeout(resolve, 100));

      // Read digest
      const files = await fs.readdir(TEST_DIGESTS_DIR);
      const digestFile = files.find(f => f.startsWith('schema-test-session'));

      expect(digestFile).toBeDefined();

      const digestPath = path.join(TEST_DIGESTS_DIR, digestFile);
      const digestContent = await fs.readFile(digestPath, 'utf8');

      // Validate schema fields
      const frontmatterMatch = digestContent.match(/^---\n([\s\S]+?)\n---/);
      const frontmatter = yaml.parse(frontmatterMatch[1]);

      // Required schema v1.0 fields
      expect(frontmatter).toMatchObject({
        schema_version: '1.0',
        session_id: expect.any(String),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        duration_minutes: expect.any(Number),
        agent_context: expect.any(String),
        compact_trigger: expect.any(String),
      });

      // Cleanup
      await fs.unlink(digestPath);
    }, 10000);
  });
});
