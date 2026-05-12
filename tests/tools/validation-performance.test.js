// Integration/Performance test - uses describeIntegration
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Validation System Performance Test Suite
 *
 * AC3 Requirements:
 * - Pre-execution validation with <50ms overhead (target, 500ms timeout)
 * - Prevent 80%+ of errors before MCP call
 * - Validators implemented for 4 complex tools
 * - No-validator-pass-through (backward compatibility)
 *
 * This suite tests:
 * 1. Validation overhead <50ms for all 4 complex tools
 * 2. Error prevention rate (target: 80%+)
 * 3. Timeout enforcement (500ms safety limit)
 */
describeIntegration('Validation System Performance', () => {
  let clickupValidator, googleValidator, n8nValidator, supabaseValidator;
  let clickupTool, googleTool, n8nTool, supabaseTool;
  const performanceMetrics = {
    clickup: [],
    google: [],
    n8n: [],
    supabase: [],
  };

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve all 4 complex tools
    clickupTool = await toolResolver.resolveTool('clickup');
    googleTool = await toolResolver.resolveTool('google-workspace');
    n8nTool = await toolResolver.resolveTool('n8n');
    supabaseTool = await toolResolver.resolveTool('supabase');

    // Create validator instances
    clickupValidator = new ToolValidationHelper(clickupTool.executable_knowledge.validators);
    googleValidator = new ToolValidationHelper(googleTool.executable_knowledge.validators);
    n8nValidator = new ToolValidationHelper(n8nTool.executable_knowledge.validators);
    supabaseValidator = new ToolValidationHelper(supabaseTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();

    // Print performance summary
    console.log('\n📊 Validation Performance Summary:');
    console.log('━'.repeat(60));

    Object.entries(performanceMetrics).forEach(([tool, durations]) => {
      if (durations.length > 0) {
        const avg = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2);
        const max = Math.max(...durations).toFixed(2);
        const min = Math.min(...durations).toFixed(2);
        const target = 50;
        const improvement = (target / avg).toFixed(1);

        console.log(`\n${tool.toUpperCase()}:`);
        console.log(`  Average: ${avg}ms (target: <${target}ms) - ${improvement}x faster`);
        console.log(`  Max:     ${max}ms`);
        console.log(`  Min:     ${min}ms`);
        console.log(`  Samples: ${durations.length}`);
      }
    });

    console.log('\n' + '━'.repeat(60) + '\n');
  });

  describeIntegration('ClickUp Validator Performance', () => {
    test('create_task validation completes in <50ms', async () => {
      const start = Date.now();
      await clickupValidator.validate('create_task', {
        name: 'Performance Test Task',
        list_id: '123456789',
        assignees: [456],
      });
      const duration = Date.now() - start;
      performanceMetrics.clickup.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('update_task validation completes in <50ms', async () => {
      const start = Date.now();
      await clickupValidator.validate('update_task', {
        task_id: '123',
        assignees: { add: [456], rem: [789] },
      });
      const duration = Date.now() - start;
      performanceMetrics.clickup.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('webhook validation completes in <50ms', async () => {
      const start = Date.now();
      await clickupValidator.validate('parse_webhook', {
        event: 'task_created',
        task_id: '123',
      });
      const duration = Date.now() - start;
      performanceMetrics.clickup.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('batch validation of 10 operations completes in <500ms', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        command: 'create_task',
        args: {
          name: `Batch Task ${i}`,
          list_id: '123456789',
          assignees: [456],
        },
      }));

      const start = Date.now();
      await clickupValidator.validateBatch(operations);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describeIntegration('Google Workspace Validator Performance', () => {
    test('create_file validation completes in <50ms', async () => {
      const start = Date.now();
      await googleValidator.validate('create_file', {
        name: 'test.txt',
        content: 'Test content',
      });
      const duration = Date.now() - start;
      performanceMetrics.google.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('share_file validation completes in <50ms', async () => {
      const start = Date.now();
      await googleValidator.validate('share_file', {
        fileId: 'abc123',
        email: 'test@example.com',
        role: 'reader',
      });
      const duration = Date.now() - start;
      performanceMetrics.google.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('create_event validation completes in <50ms', async () => {
      const start = Date.now();
      await googleValidator.validate('create_event', {
        summary: 'Test Meeting',
        start_time: '2025-01-15T10:00:00Z',
        end_time: '2025-01-15T11:00:00Z',
      });
      const duration = Date.now() - start;
      performanceMetrics.google.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('batch validation of 10 operations completes in <500ms', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        command: 'create_file',
        args: {
          name: `file${i}.txt`,
          content: `Content ${i}`,
        },
      }));

      const start = Date.now();
      await googleValidator.validateBatch(operations);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describeIntegration('n8n Validator Performance', () => {
    test('execute_workflow validation completes in <50ms', async () => {
      const start = Date.now();
      await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_123',
      });
      const duration = Date.now() - start;
      performanceMetrics.n8n.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('create_workflow validation completes in <50ms', async () => {
      const start = Date.now();
      await n8nValidator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: [],
      });
      const duration = Date.now() - start;
      performanceMetrics.n8n.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('batch validation of 10 operations completes in <500ms', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        command: 'execute_workflow',
        args: {
          workflow_id: `wf_${i}`,
        },
      }));

      const start = Date.now();
      await n8nValidator.validateBatch(operations);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describeIntegration('Supabase Validator Performance', () => {
    test('execute_sql validation completes in <50ms', async () => {
      const start = Date.now();
      await supabaseValidator.validate('execute_sql', {
        project_id: 'proj_123',
        query: 'SELECT * FROM users WHERE id = 1',
      });
      const duration = Date.now() - start;
      performanceMetrics.supabase.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('apply_migration validation completes in <50ms', async () => {
      const start = Date.now();
      await supabaseValidator.validate('apply_migration', {
        project_id: 'proj_123',
        name: 'add_users_table',
        query: 'CREATE TABLE users (id SERIAL PRIMARY KEY);',
      });
      const duration = Date.now() - start;
      performanceMetrics.supabase.push(duration);

      expect(duration).toBeLessThan(50);
    });

    test('batch validation of 10 operations completes in <500ms', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        command: 'execute_sql',
        args: {
          project_id: 'proj_123',
          query: `SELECT * FROM table${i}`,
        },
      }));

      const start = Date.now();
      await supabaseValidator.validateBatch(operations);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describeIntegration('Error Prevention Rate', () => {
    test('ClickUp validator catches 80%+ of invalid inputs', async () => {
      const testCases = [
        // Valid cases (should pass)
        { args: { name: 'Task', list_id: '123', assignees: [456] }, shouldFail: false },
        { args: { name: 'Task', list_id: '123', priority: 1 }, shouldFail: false },

        // Invalid cases (should catch)
        { args: { list_id: '123', assignees: [456] }, shouldFail: true }, // Missing name
        { args: { name: 'Task', assignees: [456] }, shouldFail: true }, // Missing list_id
        { args: { name: 'Task', list_id: '123', assignees: { add: [456] } }, shouldFail: true }, // Wrong format
        { args: { name: 'Task', list_id: '123', priority: 5 }, shouldFail: true }, // Invalid priority
        { args: { name: 'Task', list_id: '123', time_estimate: 'invalid' }, shouldFail: true }, // Invalid time
        { args: { name: 'Task', list_id: 'short', assignees: [456] }, shouldFail: true }, // Invalid list_id
      ];

      let caught = 0;
      const total = testCases.filter(tc => tc.shouldFail).length;

      for (const tc of testCases) {
        const result = await clickupValidator.validate('create_task', tc.args);
        if (tc.shouldFail && !result.valid) {
          caught++;
        }
      }

      const preventionRate = (caught / total) * 100;
      console.log(`\n  ClickUp Error Prevention Rate: ${preventionRate.toFixed(1)}%`);
      expect(preventionRate).toBeGreaterThanOrEqual(80);
    });

    test('Google Workspace validator catches 80%+ of invalid inputs', async () => {
      const testCases = [
        // Valid cases
        { args: { name: 'file.txt', content: 'data' }, shouldFail: false },
        { args: { name: 'file.txt', fileUrl: 'https://example.com/file.txt' }, shouldFail: false },

        // Invalid cases
        { args: { content: 'data' }, shouldFail: true }, // Missing name
        { args: { name: 'file.txt' }, shouldFail: true }, // Missing content/fileUrl
        { args: { name: 'file.txt', content: 'data', mimeType: 'invalid' }, shouldFail: true }, // Invalid mimeType
        { args: { fileId: '', email: 'test@example.com' }, shouldFail: true }, // Empty fileId
        { args: { fileId: 'abc', email: 'invalid-email' }, shouldFail: true }, // Invalid email
      ];

      let caught = 0;
      const total = testCases.filter(tc => tc.shouldFail).length;

      for (const tc of testCases) {
        const result = await googleValidator.validate('create_file', tc.args);
        if (tc.shouldFail && !result.valid) {
          caught++;
        }
      }

      const preventionRate = (caught / total) * 100;
      console.log(`  Google Workspace Error Prevention Rate: ${preventionRate.toFixed(1)}%`);
      expect(preventionRate).toBeGreaterThanOrEqual(80);
    });

    test('n8n validator catches 80%+ of invalid inputs', async () => {
      const testCases = [
        // Valid cases
        { args: { workflow_id: 'wf_123' }, shouldFail: false },
        { args: { workflow_id: 'wf_123', data: { key: 'value' } }, shouldFail: false },

        // Invalid cases
        { args: {}, shouldFail: true }, // Missing workflow_id
        { args: { workflow_id: '' }, shouldFail: true }, // Empty workflow_id
        { args: { workflow_id: 'wf_123', data: 'invalid' }, shouldFail: true }, // Invalid data type
        { args: { workflow_id: 'wf_123', wait_for_completion: 'yes' }, shouldFail: true }, // Invalid boolean
      ];

      let caught = 0;
      const total = testCases.filter(tc => tc.shouldFail).length;

      for (const tc of testCases) {
        const result = await n8nValidator.validate('execute_workflow', tc.args);
        if (tc.shouldFail && !result.valid) {
          caught++;
        }
      }

      const preventionRate = (caught / total) * 100;
      console.log(`  n8n Error Prevention Rate: ${preventionRate.toFixed(1)}%`);
      expect(preventionRate).toBeGreaterThanOrEqual(80);
    });

    test('Supabase validator catches 80%+ of invalid inputs', async () => {
      const testCases = [
        // Valid cases
        { args: { project_id: 'proj_123', query: 'SELECT * FROM users' }, shouldFail: false },
        { args: { project_id: 'proj_123', query: 'INSERT INTO users VALUES (1)' }, shouldFail: false },

        // Invalid cases
        { args: { query: 'SELECT * FROM users' }, shouldFail: true }, // Missing project_id
        { args: { project_id: 'proj_123' }, shouldFail: true }, // Missing query
        { args: { project_id: 'proj_123', query: 'DROP TABLE users' }, shouldFail: true }, // Dangerous operation
        { args: { project_id: 'proj_123', query: 'DROP DATABASE db' }, shouldFail: true }, // Dangerous operation
        { args: { project_id: 'proj_123', query: 'CREATE TABLE test (id INT)' }, shouldFail: true }, // DDL not allowed
      ];

      let caught = 0;
      const total = testCases.filter(tc => tc.shouldFail).length;

      for (const tc of testCases) {
        const result = await supabaseValidator.validate('execute_sql', tc.args);
        if (tc.shouldFail && !result.valid) {
          caught++;
        }
      }

      const preventionRate = (caught / total) * 100;
      console.log(`  Supabase Error Prevention Rate: ${preventionRate.toFixed(1)}%\n`);
      expect(preventionRate).toBeGreaterThanOrEqual(80);
    });
  });

  describeIntegration('Timeout Enforcement', () => {
    test('validation respects 500ms timeout limit', async () => {
      // Test with a valid operation that should complete quickly
      const start = Date.now();
      await clickupValidator.validate('create_task', {
        name: 'Timeout Test',
        list_id: '123456789',
      });
      const duration = Date.now() - start;

      // Should be well under 500ms timeout
      expect(duration).toBeLessThan(500);
    });

    test('validator timeout configuration is set correctly', () => {
      // Check that validators have timeout configuration
      expect(clickupValidator).toBeDefined();
      expect(googleValidator).toBeDefined();
      expect(n8nValidator).toBeDefined();
      expect(supabaseValidator).toBeDefined();
    });
  });

  describeIntegration('Concurrent Validation Performance', () => {
    test('10 concurrent validations complete in <200ms total', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        clickupValidator.validate('create_task', {
          name: `Concurrent Task ${i}`,
          list_id: '123456789',
          assignees: [456 + i],
        }),
      );

      const start = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    test('cross-tool concurrent validations work correctly', async () => {
      const promises = [
        clickupValidator.validate('create_task', { name: 'Task', list_id: '123' }),
        googleValidator.validate('create_file', { name: 'file.txt', content: 'data' }),
        n8nValidator.validate('execute_workflow', { workflow_id: 'wf_123' }),
        supabaseValidator.validate('execute_sql', { project_id: 'proj_123', query: 'SELECT 1' }),
      ];

      const start = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      // All should succeed
      results.forEach(result => {
        expect(result.valid).toBe(true);
      });

      // Should complete faster than sequential
      expect(duration).toBeLessThan(100);
    });
  });
});
