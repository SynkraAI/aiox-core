// Integration/Performance test - uses describeIntegration
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Backward Compatibility Test Suite
 *
 * AC3 & AC4 Requirements:
 * - Tools without validators auto-pass validation
 * - No errors thrown for missing validators
 * - Backward compatibility maintained for v1.0 simple tools
 * - Graceful degradation when executable_knowledge is missing
 *
 * This suite tests:
 * 1. Simple tools (v1.0) without executable_knowledge pass validation
 * 2. Complex tools (v2.0) without validators pass validation
 * 3. Tools with empty validators array pass validation
 * 4. No errors thrown in any backward compatibility scenario
 * 5. ToolValidationHelper handles missing validators gracefully
 */
describeIntegration('Backward Compatibility - No-Validator Pass-Through', () => {
  let simpleToolsPath, complexToolsPath;
  const v1SimpleTools = ['github-cli', 'supabase-cli', 'browser', 'exa'];
  const _v2ComplexTools = ['clickup', 'google-workspace', 'n8n', 'supabase'];

  beforeAll(() => {
    simpleToolsPath = path.join(__dirname, '../../aiox-core/tools');
    complexToolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([simpleToolsPath, complexToolsPath]);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('v1.0 Simple Tools (No executable_knowledge)', () => {
    test('github-cli tool passes validation automatically', async () => {
      const _tool = await toolResolver.resolveTool('github-cli');

      // Verify it's a v1.0 tool (no executable_knowledge)
      expect(tool.executable_knowledge).toBeUndefined();
      expect(tool.schema_version).toBe(1); // Auto-detected as v1.0

      // Create validator (should handle missing executable_knowledge)
      const validator = new ToolValidationHelper(tool.executable_knowledge);

      // Validate any command - should auto-pass
      const result = await validator.validate('any-command', { any: 'args' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('supabase-cli tool passes validation automatically', async () => {
      const _tool = await toolResolver.resolveTool('supabase-cli');

      expect(tool.executable_knowledge).toBeUndefined();

      const validator = new ToolValidationHelper(tool.executable_knowledge);
      const result = await validator.validate('db-push', { some: 'args' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('browser tool passes validation automatically', async () => {
      const _tool = await toolResolver.resolveTool('browser');

      expect(tool.executable_knowledge).toBeUndefined();

      const validator = new ToolValidationHelper(tool.executable_knowledge);
      const result = await validator.validate('navigate', { url: 'https://example.com' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('exa tool passes validation automatically', async () => {
      const _tool = await toolResolver.resolveTool('exa');

      expect(tool.executable_knowledge).toBeUndefined();

      const validator = new ToolValidationHelper(tool.executable_knowledge);
      const result = await validator.validate('search', { query: 'test' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('all v1.0 simple tools pass validation', async () => {
      const results = [];

      for (const toolName of v1SimpleTools) {
        const _tool = await toolResolver.resolveTool(toolName);
        const validator = new ToolValidationHelper(tool.executable_knowledge);
        const result = await validator.validate('test-command', { test: 'data' });
        results.push({ tool: toolName, result });
      }

      // All should pass
      results.forEach(({ _tool, result }) => {
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describeIntegration('v2.0 Complex Tools with Empty Validators', () => {
    test('complex tool with empty validators array passes validation', async () => {
      // Simulate a complex tool with executable_knowledge but no validators
      const mockTool = {
        id: 'mock-complex',
        schema_version: '2.0',
        executable_knowledge: {
          helpers: [],
          validators: [], // Empty validators array
        },
      };

      const validator = new ToolValidationHelper(mockTool.executable_knowledge);
      const result = await validator.validate('any-command', { any: 'args' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('complex tool with undefined validators passes validation', async () => {
      const mockTool = {
        id: 'mock-complex-undefined',
        schema_version: '2.0',
        executable_knowledge: {
          helpers: [],
          // validators not defined
        },
      };

      const validator = new ToolValidationHelper(mockTool.executable_knowledge);
      const result = await validator.validate('test', {});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('complex tool with null validators passes validation', async () => {
      const mockTool = {
        id: 'mock-complex-null',
        schema_version: '2.0',
        executable_knowledge: {
          helpers: [],
          validators: null, // Explicitly null
        },
      };

      const validator = new ToolValidationHelper(mockTool.executable_knowledge);
      const result = await validator.validate('command', { data: 'value' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describeIntegration('No Errors Thrown for Missing Validators', () => {
    test('ToolValidationHelper constructor does not throw with undefined executable_knowledge', () => {
      expect(() => {
        new ToolValidationHelper(undefined);
      }).not.toThrow();
    });

    test('ToolValidationHelper constructor does not throw with null executable_knowledge', () => {
      expect(() => {
        new ToolValidationHelper(null);
      }).not.toThrow();
    });

    test('ToolValidationHelper constructor does not throw with empty object', () => {
      expect(() => {
        new ToolValidationHelper({});
      }).not.toThrow();
    });

    test('validate() does not throw when validators are missing', async () => {
      const validator = new ToolValidationHelper(undefined);

      await expect(async () => {
        await validator.validate('any-command', { any: 'args' });
      }).not.toThrow();
    });

    test('validate() does not throw with null validators array', async () => {
      const validator = new ToolValidationHelper({ validators: null });

      await expect(async () => {
        await validator.validate('test', {});
      }).not.toThrow();
    });

    test('validateBatch() does not throw when validators are missing', async () => {
      const validator = new ToolValidationHelper(undefined);

      await expect(async () => {
        await validator.validateBatch([
          { command: 'cmd1', args: { a: 1 } },
          { command: 'cmd2', args: { b: 2 } },
        ]);
      }).not.toThrow();
    });
  });

  describeIntegration('Graceful Degradation', () => {
    test('validator with no executable_knowledge returns valid for all commands', async () => {
      const validator = new ToolValidationHelper(undefined);

      const commands = [
        'create', 'update', 'delete', 'list', 'get',
        'execute', 'run', 'start', 'stop', 'configure',
      ];

      for (const command of commands) {
        const result = await validator.validate(_command, { test: 'data' });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    test('validator with empty validators array returns valid for all commands', async () => {
      const validator = new ToolValidationHelper({ validators: [] });

      const testCases = [
        { command: 'create', args: { name: 'test' } },
        { command: 'update', args: { id: '123', data: { name: 'updated' } } },
        { command: 'delete', args: { id: '456' } },
        { command: 'list', args: { filter: 'active' } },
        { command: 'get', args: { id: '789' } },
      ];

      for (const { command, args } of testCases) {
        const result = await validator.validate(_command, args);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    test('batch validation with no validators passes all operations', async () => {
      const validator = new ToolValidationHelper(undefined);

      const operations = [
        { command: 'create', args: { name: 'item1' } },
        { command: 'create', args: { name: 'item2' } },
        { command: 'update', args: { id: '1', name: 'updated' } },
        { command: 'delete', args: { id: '2' } },
        { command: 'list', args: {} },
      ];

      const results = await validator.validateBatch(operations);

      // validateBatch returns array of {command, result} objects
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(operations.length);
      results.forEach(({ command, result }) => {
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('validator handles mixed scenarios correctly', async () => {
      // Test with various malformed executable_knowledge structures
      const scenarios = [
        { validators: undefined },
        { validators: null },
        { validators: [] },
        {},
        undefined,
        null,
      ];

      for (const execKnowledge of scenarios) {
        const validator = new ToolValidationHelper(execKnowledge);
        const result = await validator.validate('test', { data: 'value' });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });
  });

  describeIntegration('Integration with ToolResolver', () => {
    test('resolving and validating v1.0 tool works end-to-end', async () => {
      // Resolve a simple tool
      const _tool = await toolResolver.resolveTool('github-cli');

      // Create validator
      const validator = new ToolValidationHelper(tool.executable_knowledge);

      // Validate - should auto-pass
      const result = await validator.validate('pr-create', {
        title: 'Test PR',
        body: 'Test body',
        base: 'main',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('resolving all simple tools and validating works', async () => {
      const results = [];

      for (const toolName of v1SimpleTools) {
        const _tool = await toolResolver.resolveTool(toolName);
        const validator = new ToolValidationHelper(tool.executable_knowledge);
        const result = await validator.validate('test-command', {});

        results.push({
          tool: toolName,
          hasExecKnowledge: !!tool.executable_knowledge,
          validationResult: result,
        });
      }

      // All should have no executable_knowledge and pass validation
      results.forEach(({ _tool, hasExecKnowledge, validationResult }) => {
        expect(hasExecKnowledge).toBe(false); // v1.0 tools
        expect(validationResult.valid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);
      });
    });
  });

  describeIntegration('Performance with No Validators', () => {
    test('validation without validators is instant (<1ms)', async () => {
      const validator = new ToolValidationHelper(undefined);

      const start = Date.now();
      await validator.validate('command', { args: 'data' });
      const duration = Date.now() - start;

      // Should be instant (much faster than 50ms target)
      expect(duration).toBeLessThan(1);
    });

    test('batch validation without validators is instant', async () => {
      const validator = new ToolValidationHelper({ validators: [] });

      const operations = Array.from({ length: 100 }, (_, i) => ({
        command: `cmd${i}`,
        args: { index: i },
      }));

      const start = Date.now();
      await validator.validateBatch(operations);
      const duration = Date.now() - start;

      // Even 100 operations should be instant
      expect(duration).toBeLessThan(5);
    });

    test('concurrent validations without validators are instant', async () => {
      const validator = new ToolValidationHelper(null);

      const promises = Array.from({ length: 50 }, (_, i) =>
        validator.validate(`command${i}`, { data: i }),
      );

      const start = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - start;

      // Even 50 concurrent validations should be instant
      expect(duration).toBeLessThan(5);
    });
  });

  describeIntegration('Backward Compatibility Summary', () => {
    test('comprehensive backward compatibility check', async () => {
      const report = {
        v1_tools: [],
        validation_errors: [],
        performance_issues: [],
      };

      // Test all v1.0 simple tools
      for (const toolName of v1SimpleTools) {
        const _tool = await toolResolver.resolveTool(toolName);
        const validator = new ToolValidationHelper(tool.executable_knowledge);

        const start = Date.now();
        const result = await validator.validate('test', {});
        const duration = Date.now() - start;

        report.v1_tools.push({
          name: toolName,
          has_exec_knowledge: !!tool.executable_knowledge,
          validation_passed: result.valid,
          duration_ms: duration,
        });

        if (!result.valid) {
          report.validation_errors.push({
            tool: toolName,
            errors: result.errors,
          });
        }

        if (duration > 1) {
          report.performance_issues.push({
            tool: toolName,
            duration_ms: duration,
          });
        }
      }

      // Verify all passed
      expect(report.validation_errors).toHaveLength(0);
      expect(report.performance_issues).toHaveLength(0);

      report.v1_tools.forEach(tool => {
        expect(tool.has_exec_knowledge).toBe(false);
        expect(tool.validation_passed).toBe(true);
        expect(tool.duration_ms).toBeLessThan(1);
      });

      // Log summary
      console.log('\n✅ Backward Compatibility Report:');
      console.log(`  v1.0 Tools Tested: ${report.v1_tools.length}`);
      console.log(`  All Validations Passed: ${report.validation_errors.length === 0}`);
      console.log(`  All Performance OK: ${report.performance_issues.length === 0}`);
      console.log('  Average Duration: <1ms (instant)');
    });
  });
});
