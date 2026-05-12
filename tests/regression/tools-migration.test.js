// Integration/Performance test - uses describeIntegration
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Tools Migration Regression Test Suite
 *
 * Task 5.3 Requirements:
 * - All existing agent workflows pass unchanged
 * - All existing task workflows pass unchanged
 * - Zero breaking changes in API surface
 * - Verify end-to-end system integrity post-migration
 *
 * This suite tests:
 * 1. Tool resolution API remains stable
 * 2. Validation API remains stable
 * 3. All 12 tools work correctly
 * 4. Agent-tool integration works
 * 5. No regressions in existing functionality
 */
describeIntegration('Tools Migration Regression Suite', () => {
  const toolsPath = path.join(__dirname, '../../.aiox-core/tools');

  // All 12 tools (8 v1.0 + 4 v2.0)
  const allTools = [
    'github-cli',
    'railway-cli',
    'supabase-cli',
    'ffmpeg',
    '21st-dev-magic',
    'browser',
    'context7',
    'exa',
    'clickup',
    'google-workspace',
    'n8n',
    'supabase',
  ];

  const v1Tools = [
    'github-cli',
    'railway-cli',
    'supabase-cli',
    'ffmpeg',
    '21st-dev-magic',
    'browser',
    'context7',
    'exa',
  ];

  const v2Tools = [
    'clickup',
    'google-workspace',
    'n8n',
    'supabase',
  ];

  beforeAll(() => {
    toolResolver.setSearchPaths([toolsPath]);
  });

  afterEach(() => {
    toolResolver.clearCache();
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution API Stability', () => {
    test('resolveTool() API unchanged for all 12 tools', async () => {
      const results = [];

      for (const toolName of allTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          hasId: !!tool.id,
          hasType: !!tool.type,
          hasName: !!tool.name,
          hasDescription: !!tool.description,
        });
      }

      // All should have core fields
      results.forEach(result => {
        expect(result.hasId).toBe(true);
        expect(result.hasType).toBe(true);
        expect(result.hasName).toBe(true);
        expect(result.hasDescription).toBe(true);
      });
    });

    test('tool resolution returns same structure as before', async () => {
      const tool = await toolResolver.resolveTool('github-cli');

      // Pre-migration structure still intact
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('type');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('knowledge_strategy');

      // New field added but doesn't break anything
      expect(tool).toHaveProperty('schema_version');
      expect(typeof tool.schema_version).toBe('number');
    });

    test('setSearchPaths() API works as before', () => {
      expect(() => {
        toolResolver.setSearchPaths([toolsPath]);
      }).not.toThrow();
    });

    test('clearCache() API works as before', () => {
      expect(() => {
        toolResolver.clearCache();
      }).not.toThrow();
    });

    test('resetSearchPaths() API works as before', () => {
      expect(() => {
        toolResolver.resetSearchPaths();
      }).not.toThrow();
    });
  });

  describeIntegration('Validation API Stability', () => {
    test('ToolValidationHelper constructor accepts executable_knowledge', () => {
      expect(() => {
        new ToolValidationHelper({ validators: [], helpers: [] });
      }).not.toThrow();
    });

    test('ToolValidationHelper constructor accepts undefined (backward compat)', () => {
      expect(() => {
        new ToolValidationHelper(undefined);
      }).not.toThrow();
    });

    test('validate() method signature unchanged', async () => {
      const validator = new ToolValidationHelper(undefined);

      // Old signature: validate(command, args)
      await expect(async () => {
        await validator.validate('test-command', { arg1: 'value1' });
      }).not.toThrow();
    });

    test('validateBatch() method signature unchanged', async () => {
      const validator = new ToolValidationHelper(undefined);

      // Old signature: validateBatch(operations)
      await expect(async () => {
        await validator.validateBatch([
          { command: 'cmd1', args: {} },
          { command: 'cmd2', args: {} },
        ]);
      }).not.toThrow();
    });

    test('validation returns same result structure', async () => {
      const validator = new ToolValidationHelper(undefined);
      const result = await validator.validate('test', {});

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describeIntegration('End-to-End Tool Workflows', () => {
    test('v1.0 tools complete workflow unchanged', async () => {
      for (const toolName of v1Tools) {
        // Step 1: Resolve tool
        const tool = await toolResolver.resolveTool(toolName);
        expect(tool.id).toBe(toolName);

        // Step 2: Create validator
        const validator = new ToolValidationHelper(tool.executable_knowledge);
        expect(validator).toBeDefined();

        // Step 3: Validate command
        const result = await validator.validate('test-cmd', { test: 'data' });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    test('v2.0 tools complete workflow working', async () => {
      for (const toolName of v2Tools) {
        // Step 1: Resolve tool
        const tool = await toolResolver.resolveTool(toolName);
        expect(tool.id).toBe(toolName);
        expect(tool.schema_version).toBe(2);

        // Step 2: Create validator
        const validator = new ToolValidationHelper(tool.executable_knowledge);
        expect(validator).toBeDefined();

        // Step 3: Validators should exist
        expect(tool.executable_knowledge).toBeDefined();
        expect(tool.executable_knowledge.validators).toBeDefined();
      }
    });

    test('mixed v1 and v2 tools work together', async () => {
      const v1Tool = await toolResolver.resolveTool('github-cli');
      const v2Tool = await toolResolver.resolveTool('clickup');

      const v1Validator = new ToolValidationHelper(v1Tool.executable_knowledge);
      const v2Validator = new ToolValidationHelper(v2Tool.executable_knowledge);

      // Both should work without interference
      const v1Result = await v1Validator.validate('test', {});
      const v2Result = await v2Validator.validate('create_task', {
        list_id: '12345678',
        name: 'test',
      });

      expect(v1Result.valid).toBe(true);
      expect(v2Result.valid).toBe(true);
    });
  });

  describeIntegration('Agent-Tool Integration', () => {
    test('agents can reference v1.0 tools', async () => {
      // Simulate agent with v1.0 tool dependencies
      const agentTools = ['github-cli', 'browser', 'ffmpeg'];

      for (const toolName of agentTools) {
        const tool = await toolResolver.resolveTool(toolName);
        expect(tool).toBeDefined();
        expect(tool.schema_version).toBe(1);
      }
    });

    test('agents can reference v2.0 tools', async () => {
      // Simulate agent with v2.0 tool dependencies
      const agentTools = ['clickup', 'supabase', 'n8n'];

      for (const toolName of agentTools) {
        const tool = await toolResolver.resolveTool(toolName);
        expect(tool).toBeDefined();
        expect(tool.schema_version).toBe(2);
      }
    });

    test('agents can reference mixed v1/v2 tools', async () => {
      // Simulate agent with mixed tool dependencies (like dev agent)
      const agentTools = [
        'github-cli',    // v1.0
        'context7',      // v1.0
        'supabase',      // v2.0
        'n8n',           // v2.0
        'browser',       // v1.0
        'ffmpeg',         // v1.0
      ];

      const results = [];

      for (const toolName of agentTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          version: tool.schema_version,
          hasValidators: !!tool.executable_knowledge?.validators,
        });
      }

      // All should resolve
      expect(results).toHaveLength(6);

      // Check version distribution
      const v1Count = results.filter(r => r.version === 1).length;
      const v2Count = results.filter(r => r.version === 2).length;

      expect(v1Count).toBe(4);
      expect(v2Count).toBe(2);
    });
  });

  describeIntegration('Performance Regression Check', () => {
    test('tool resolution performance not degraded', async () => {
      toolResolver.clearCache();

      const start = Date.now();
      await toolResolver.resolveTool('clickup');
      const uncachedDuration = Date.now() - start;

      // Should be fast (<50ms as per AC3)
      expect(uncachedDuration).toBeLessThan(50);

      const cachedStart = Date.now();
      await toolResolver.resolveTool('clickup');
      const cachedDuration = Date.now() - cachedStart;

      // Cached should be instant (<5ms)
      expect(cachedDuration).toBeLessThan(5);
    });

    test('validation performance not degraded', async () => {
      const tool = await toolResolver.resolveTool('google-workspace');
      const validator = new ToolValidationHelper(tool.executable_knowledge);

      const start = Date.now();
      await validator.validate('list_spreadsheets', {
        user_google_email: 'test@example.com',
      });
      const duration = Date.now() - start;

      // Should be fast (<50ms as per AC3)
      expect(duration).toBeLessThan(50);
    });

    test('concurrent operations performance maintained', async () => {
      const promises = allTools.map(toolName =>
        toolResolver.resolveTool(toolName),
      );

      const start = Date.now();
      const tools = await Promise.all(promises);
      const duration = Date.now() - start;

      // All 12 tools should resolve quickly
      expect(tools).toHaveLength(12);
      expect(duration).toBeLessThan(200);
    });
  });

  describeIntegration('Error Handling Regression', () => {
    test('invalid tool name throws same error as before', async () => {
      await expect(
        toolResolver.resolveTool('non-existent-tool'),
      ).rejects.toThrow();
    });

    test('validation errors format unchanged', async () => {
      const tool = await toolResolver.resolveTool('google-workspace');
      const validator = new ToolValidationHelper(tool.executable_knowledge);

      const result = await validator.validate('create_event', {
        // Missing required user_google_email field
        summary: 'test',
        start_time: '2024-01-01T10:00:00',
        end_time: '2024-01-01T11:00:00',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);

      if (result.errors.length > 0) {
        expect(result.errors[0]).toHaveProperty('field');
        expect(result.errors[0]).toHaveProperty('message');
      }
    });

    test('validator handles malformed data gracefully', async () => {
      const validator = new ToolValidationHelper(undefined);

      await expect(async () => {
        await validator.validate(null, null);
      }).not.toThrow();

      await expect(async () => {
        await validator.validate('', {});
      }).not.toThrow();
    });
  });

  describeIntegration('Comprehensive Regression Report', () => {
    test('full system regression check', async () => {
      const report = {
        tools_tested: 0,
        tools_passed: 0,
        resolution_failures: [],
        validation_failures: [],
        performance_issues: [],
        api_breaking_changes: [],
      };

      // Test all 12 tools
      for (const toolName of allTools) {
        report.tools_tested++;

        try {
          // 1. Resolution
          const tool = await toolResolver.resolveTool(toolName);
          if (!tool || !tool.id) {
            report.resolution_failures.push(toolName);
            continue;
          }

          // 2. Validation
          const validator = new ToolValidationHelper(tool.executable_knowledge);
          const result = await validator.validate('test', {});

          if (!result || typeof result.valid !== 'boolean') {
            report.validation_failures.push(toolName);
            continue;
          }

          // 3. Performance
          const start = Date.now();
          await toolResolver.resolveTool(toolName);
          const duration = Date.now() - start;

          if (duration > 5) { // Cached should be <5ms
            report.performance_issues.push({
              tool: toolName,
              duration,
            });
          }

          // 4. API stability
          const hasRequiredFields = tool.id && tool.type && tool.name && tool.description;
          if (!hasRequiredFields) {
            report.api_breaking_changes.push({
              tool: toolName,
              issue: 'Missing required fields',
            });
            continue;
          }

          report.tools_passed++;

        } catch (error) {
          report.resolution_failures.push({
            tool: toolName,
            error: error.message,
          });
        }
      }

      // Verify no regressions
      expect(report.resolution_failures).toHaveLength(0);
      expect(report.validation_failures).toHaveLength(0);
      expect(report.api_breaking_changes).toHaveLength(0);
      expect(report.tools_passed).toBe(12);

      // Log comprehensive report
      console.log('\n✅ Tools Migration Regression Report:');
      console.log(`  Tools Tested: ${report.tools_tested}`);
      console.log(`  Tools Passed: ${report.tools_passed}`);
      console.log(`  Resolution Failures: ${report.resolution_failures.length}`);
      console.log(`  Validation Failures: ${report.validation_failures.length}`);
      console.log(`  Performance Issues: ${report.performance_issues.length}`);
      console.log(`  API Breaking Changes: ${report.api_breaking_changes.length}`);
      console.log(`  Status: ${report.tools_passed === 12 ? 'PASS ✅' : 'FAIL ❌'}`);
    });
  });
});
