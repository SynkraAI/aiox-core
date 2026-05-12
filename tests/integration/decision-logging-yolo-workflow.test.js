// Integration test - requires external services
// Uses describeIntegration from setup.js
/**
 * Integration Tests for Decision Logging + Yolo Mode Workflow
 *
 * Tests the complete integration of decision logging with yolo mode development.
 * Validates end-to-end workflow from initialization to log generation.
 *
 * @see .aiox-core/scripts/decision-recorder.js
 * @see .aiox-core/scripts/decision-log-generator.js
 * @see .aiox-core/scripts/decision-log-indexer.js
 */

const fs = require('fs').promises;
const path = require('path');
const {
  initializeDecisionLogging,
  recordDecision,
  trackFile,
  trackTest,
  updateMetrics,
  completeDecisionLogging,
  getCurrentContext,
} = require('../../.aiox-core/development/scripts/decision-recorder');

describeIntegration('Decision Logging + Yolo Mode Integration', () => {
  const testStoryPath = 'docs/stories/test-integration-story.md';
  const testStoryId = 'test-integration';

  beforeEach(async () => {
    // Clean up any previous test logs
    try {
      await fs.unlink(`.ai/decision-log-${testStoryId}.md`);
    } catch (error) {
      // File doesn't exist, that's okay
    }

    try {
      await fs.unlink('.ai/decision-logs-index.md');
    } catch (error) {
      // File doesn't exist, that's okay
    }
  });

  afterEach(async () => {
    // Clean up test logs after each test
    try {
      await fs.unlink(`.ai/decision-log-${testStoryId}.md`);
    } catch (error) {
      // Ignore cleanup errors
    }

    try {
      await fs.unlink('.ai/decision-logs-index.md');
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describeIntegration('Full Yolo Mode Workflow', () => {
    it('should complete full workflow with decision logging', async () => {
      // Simulate yolo mode start
      const context = await initializeDecisionLogging('dev', testStoryPath, {
        agentLoadTime: 150,
      });

      expect(context).toBeDefined();
      expect(context.agentId).toBe('dev');
      expect(context.storyPath).toBe(testStoryPath);
      expect(context.metrics.agentLoadTime).toBe(150);

      // Simulate autonomous decisions
      const decision1 = recordDecision({
        description: 'Use Axios for HTTP client',
        reason: 'Better error handling and interceptor support',
        alternatives: ['Fetch API', 'Got library', 'node-fetch'],
        type: 'library-choice',
        priority: 'medium',
      });

      expect(decision1).toBeDefined();
      expect(decision1.description).toBe('Use Axios for HTTP client');
      expect(decision1.type).toBe('library-choice');
      expect(decision1.priority).toBe('medium');

      const decision2 = recordDecision({
        description: 'Use React Context for state management',
        reason: 'Simple state sharing without Redux overhead',
        alternatives: ['Redux', 'Zustand', 'Jotai'],
        type: 'architecture',
        priority: 'high',
      });

      expect(decision2).toBeDefined();
      expect(decision2.type).toBe('architecture');
      expect(decision2.priority).toBe('high');

      // Simulate file modifications
      trackFile('src/api/client.js', 'created');
      trackFile('src/context/AppContext.js', 'created');
      trackFile('package.json', 'modified');

      // Simulate test execution
      trackTest({
        name: 'api.test.js',
        passed: true,
        duration: 125,
      });

      trackTest({
        name: 'context.test.js',
        passed: true,
        duration: 85,
      });

      // Update metrics
      updateMetrics({
        taskExecutionTime: 300000, // 5 minutes
      });

      // Complete yolo mode - generate log
      const logPath = await completeDecisionLogging(testStoryId, 'completed');

      expect(logPath).toBeDefined();
      expect(logPath).toContain(`decision-log-${testStoryId}.md`);

      // Verify log file was created
      const logExists = await fs.access(logPath).then(() => true).catch(() => false);
      expect(logExists).toBe(true);

      // Verify log content
      const logContent = await fs.readFile(logPath, 'utf8');

      // Verify ADR format structure
      expect(logContent).toContain('# Decision Log');
      expect(logContent).toContain('## Context');
      expect(logContent).toContain('## Decisions Made');
      expect(logContent).toContain('## Implementation Changes');
      expect(logContent).toContain('## Consequences & Rollback');

      // Verify decisions are in log
      expect(logContent).toContain('Use Axios for HTTP client');
      expect(logContent).toContain('Use React Context for state management');
      expect(logContent).toContain('library-choice');
      expect(logContent).toContain('architecture');
      expect(logContent).toContain('medium');
      expect(logContent).toContain('high');

      // Verify files are tracked (OS-agnostic path matching)
      expect(logContent).toMatch(/src[/\\]api[/\\]client\.js/);
      expect(logContent).toMatch(/src[/\\]context[/\\]AppContext\.js/);
      expect(logContent).toContain('package.json');

      // Verify tests are tracked
      expect(logContent).toContain('api.test.js');
      expect(logContent).toContain('context.test.js');
      expect(logContent).toContain('125ms');
      expect(logContent).toContain('85ms');

      // Verify metrics (agent load time is explicitly set, task execution time is calculated)
      expect(logContent).toContain('Agent Load Time: 150ms');
      expect(logContent).toContain('Task Execution Time'); // Calculated automatically based on duration

      // Verify index was updated
      const indexExists = await fs.access('.ai/decision-logs-index.md').then(() => true).catch(() => false);
      expect(indexExists).toBe(true);

      const indexContent = await fs.readFile('.ai/decision-logs-index.md', 'utf8');
      expect(indexContent).toContain('# Decision Log Index');
      expect(indexContent).toContain(testStoryId);
      expect(indexContent).toContain('completed');
      expect(indexContent).toContain('Total logs: 1');
    });

    it('should handle decision logging disabled gracefully', async () => {
      const context = await initializeDecisionLogging('dev', testStoryPath, {
        enabled: false,
      });

      expect(context).toBeNull();

      const decision = recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
      });

      expect(decision).toBeNull();

      const logPath = await completeDecisionLogging(testStoryId);

      expect(logPath).toBeNull();
    });

    it('should track multiple decisions of different types', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const decisionTypes = [
        { type: 'library-choice', priority: 'medium', desc: 'Library decision' },
        { type: 'architecture', priority: 'high', desc: 'Architecture decision' },
        { type: 'algorithm', priority: 'medium', desc: 'Algorithm decision' },
        { type: 'error-handling', priority: 'low', desc: 'Error handling decision' },
        { type: 'testing-strategy', priority: 'medium', desc: 'Testing decision' },
      ];

      decisionTypes.forEach(({ type, priority, desc }) => {
        const decision = recordDecision({
          description: desc,
          reason: `Because ${type}`,
          alternatives: ['Alt 1', 'Alt 2'],
          type,
          priority,
        });

        expect(decision.type).toBe(type);
        expect(decision.priority).toBe(priority);
      });

      const logPath = await completeDecisionLogging(testStoryId, 'completed');
      const logContent = await fs.readFile(logPath, 'utf8');

      decisionTypes.forEach(({ type, desc }) => {
        expect(logContent).toContain(desc);
        expect(logContent).toContain(type);
      });
    });

    it('should track file operations correctly', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const fileOperations = [
        { path: 'src/new-file.js', action: 'created' },
        { path: 'src/existing-file.js', action: 'modified' },
        { path: 'src/old-file.js', action: 'deleted' },
      ];

      fileOperations.forEach(({ path: filePath, action }) => {
        trackFile(filePath, action);
      });

      const context = getCurrentContext();
      expect(context.filesModified).toHaveLength(3);

      const logPath = await completeDecisionLogging(testStoryId, 'completed');
      const logContent = await fs.readFile(logPath, 'utf8');

      fileOperations.forEach(({ path: filePath, action }) => {
        expect(logContent).toContain(path.basename(filePath));
        expect(logContent).toContain(action);
      });
    });

    it('should track test results with pass/fail status', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      trackTest({
        name: 'passing-test.js',
        passed: true,
        duration: 100,
      });

      trackTest({
        name: 'failing-test.js',
        passed: false,
        duration: 50,
        error: 'Assertion failed: expected true to be false',
      });

      const logPath = await completeDecisionLogging(testStoryId, 'completed');
      const logContent = await fs.readFile(logPath, 'utf8');

      expect(logContent).toContain('passing-test.js');
      expect(logContent).toContain('failing-test.js');
      expect(logContent).toContain('100ms');
      expect(logContent).toContain('50ms');
      expect(logContent).toContain('✅'); // Pass marker
      expect(logContent).toContain('❌'); // Fail marker
      expect(logContent).toContain('Assertion failed');
    });
  });

  describeIntegration('Rollback Metadata', () => {
    it('should capture git commit hash for rollback', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const context = getCurrentContext();
      expect(context.commitBefore).toBeDefined();
      expect(typeof context.commitBefore).toBe('string');

      const logPath = await completeDecisionLogging(testStoryId, 'completed');
      const logContent = await fs.readFile(logPath, 'utf8');

      expect(logContent).toContain('Rollback:');
      expect(logContent).toContain('git reset --hard');
      expect(logContent).toContain(context.commitBefore);
    });

    it('should include rollback instructions in log', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      const logPath = await completeDecisionLogging(testStoryId, 'completed');
      const logContent = await fs.readFile(logPath, 'utf8');

      expect(logContent).toContain('### Rollback Instructions');
      expect(logContent).toContain('# Full rollback');
      expect(logContent).toContain('# Selective file rollback');
      expect(logContent).toContain('git checkout');
    });
  });

  describeIntegration('Index File Updates', () => {
    it('should update index file when log is generated', async () => {
      await initializeDecisionLogging('dev', testStoryPath);
      recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        alternatives: [],
      });

      await completeDecisionLogging(testStoryId, 'completed');

      const indexExists = await fs.access('.ai/decision-logs-index.md').then(() => true).catch(() => false);
      expect(indexExists).toBe(true);

      const indexContent = await fs.readFile('.ai/decision-logs-index.md', 'utf8');

      expect(indexContent).toContain('# Decision Log Index');
      expect(indexContent).toContain(testStoryId);
      expect(indexContent).toContain('dev');
      expect(indexContent).toContain('completed');
    });

    it('should update index with correct decision count', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      // Record 5 decisions
      for (let i = 1; i <= 5; i++) {
        recordDecision({
          description: `Decision ${i}`,
          reason: `Reason ${i}`,
          alternatives: [],
        });
      }

      await completeDecisionLogging(testStoryId, 'completed');

      const indexContent = await fs.readFile('.ai/decision-logs-index.md', 'utf8');
      expect(indexContent).toContain('| 5 |'); // Decision count column
    });
  });

  describeIntegration('Performance Validation', () => {
    it('should complete workflow in reasonable time', async () => {
      const startTime = Date.now();

      await initializeDecisionLogging('dev', testStoryPath);

      // Record multiple decisions
      for (let i = 0; i < 10; i++) {
        recordDecision({
          description: `Decision ${i}`,
          reason: 'Performance test',
          alternatives: ['Alt 1', 'Alt 2'],
        });
      }

      // Track files
      for (let i = 0; i < 20; i++) {
        trackFile(`src/file-${i}.js`, 'created');
      }

      // Track tests
      for (let i = 0; i < 15; i++) {
        trackTest({
          name: `test-${i}.js`,
          passed: true,
          duration: 100,
        });
      }

      await completeDecisionLogging(testStoryId, 'completed');

      const totalTime = Date.now() - startTime;

      // Should complete in less than 2 seconds (conservative)
      expect(totalTime).toBeLessThan(2000);

      console.log(`Workflow completed in ${totalTime}ms`);
    });
  });

  describeIntegration('Error Scenarios', () => {
    it('should handle completion without initialization', async () => {
      const logPath = await completeDecisionLogging(testStoryId);
      expect(logPath).toBeNull();
    });

    it('should handle recording decision without initialization', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = recordDecision({
        description: 'Test',
        reason: 'Test',
      });

      expect(decision).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not initialized'));

      consoleSpy.mockRestore();
    });

    it('should handle failed status', async () => {
      await initializeDecisionLogging('dev', testStoryPath);

      recordDecision({
        description: 'Failed decision',
        reason: 'Something went wrong',
        alternatives: [],
      });

      const logPath = await completeDecisionLogging(testStoryId, 'failed');
      const logContent = await fs.readFile(logPath, 'utf8');

      expect(logContent).toContain('**Status:** failed');
    });
  });
});
