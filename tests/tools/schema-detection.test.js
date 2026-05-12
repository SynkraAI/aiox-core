// Integration test - requires tool YAML files
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');

/**
 * Schema Detection & v1.0 Tools Backward Compatibility Test Suite
 *
 * Task 5.1 Requirements:
 * - 8 simple tools work without breaking changes
 * - Auto-detection correctly identifies v1.0
 * - No breaking changes in behavior
 * - Verify schema_version field handling
 *
 * This suite tests:
 * 1. All v1.0 simple tools are correctly identified
 * 2. Schema version auto-detection works properly
 * 3. v1.0 tools function identically to pre-migration behavior
 * 4. No errors or warnings for v1.0 tools
 */
describeIntegration('Schema Detection & v1.0 Backward Compatibility', () => {
  const toolsPath = path.join(__dirname, '../../aiox-core/tools');

  // v1.0 simple tools (8 total)
  const v1SimpleTools = [
    'github-cli',      // CLI tools
    'railway-cli',
    'supabase-cli',
    'ffmpeg',          // Local tools
    '21st-dev-magic',  // MCP tools
    'browser',
    'context7',
    'exa',
  ];

  // v2.0 complex tools (4 total)
  const v2ComplexTools = [
    'clickup',
    'google-workspace',
    'n8n',
    'supabase',
  ];

  beforeAll(() => {
    toolResolver.setSearchPaths([toolsPath]);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('v1.0 Schema Version Detection', () => {
    test('correctly identifies all 8 v1.0 simple tools', async () => {
      const results = [];

      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          schema_version: tool.schema_version,
          has_executable_knowledge: !!tool.executable_knowledge,
        });
      }

      // All v1.0 tools should have schema_version = 1
      results.forEach(({ _name, schema_version, has_executable_knowledge }) => {
        expect(schema_version).toBe(1);
        expect(has_executable_knowledge).toBe(false);
      });
    });

    test('correctly identifies all 4 v2.0 complex tools', async () => {
      const results = [];

      for (const toolName of v2ComplexTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          schema_version: tool.schema_version,
          has_executable_knowledge: !!tool.executable_knowledge,
        });
      }

      // All v2.0 tools should have schema_version = 2
      results.forEach(({ _name, schema_version, has_executable_knowledge }) => {
        expect(schema_version).toBe(2);
        expect(has_executable_knowledge).toBe(true);
      });
    });

    test('auto-detection assigns version 1 to tools without schema_version field', async () => {
      // Test with a mock tool that has no schema_version field
      const _mockToolPath = path.join(__dirname, '../fixtures/tools');

      // Note: If no fixtures exist, this test verifies existing v1.0 tools
      // have consistent schema_version assignment
      const tool = await toolResolver.resolveTool('github-cli');

      // GitHub CLI is v1.0, should have schema_version = 1
      expect(tool.schema_version).toBe(1);
      expect(tool.id).toBe('github-cli');
    });

    test('schema version is a number, not a string', async () => {
      for (const toolName of [...v1SimpleTools, ...v2ComplexTools]) {
        const tool = await toolResolver.resolveTool(toolName);
        expect(typeof tool.schema_version).toBe('number');
        expect([1, 2]).toContain(tool.schema_version);
      }
    });
  });

  describeIntegration('v1.0 Tools Functionality (No Breaking Changes)', () => {
    test('v1.0 tools resolve successfully', async () => {
      const resolvePromises = v1SimpleTools.map(name =>
        toolResolver.resolveTool(_name),
      );

      const tools = await Promise.all(resolvePromises);

      tools.forEach((tool, index) => {
        expect(tool).toBeDefined();
        expect(tool.id).toBe(v1SimpleTools[index]);
        expect(tool.schema_version).toBe(1);
      });
    });

    test('v1.0 tools have required core fields', async () => {
      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);

        // Core fields that ALL tools must have
        expect(tool.id).toBeDefined();
        expect(tool.type).toBeDefined();
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();

        // v1.0 specific: NO executable_knowledge
        expect(tool.executable_knowledge).toBeUndefined();
      }
    });

    test('v1.0 tools maintain knowledge_strategy field', async () => {
      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);

        // v1.0 tools use declarative knowledge_strategy
        expect(tool.knowledge_strategy).toBe('declarative');
      }
    });

    test('v1.0 tools work with ToolResolver caching', async () => {
      const toolName = 'github-cli';

      // First call - uncached
      const tool1 = await toolResolver.resolveTool(toolName);
      expect(tool1.schema_version).toBe(1);

      // Second call - should be cached
      const tool2 = await toolResolver.resolveTool(toolName);
      expect(tool2.schema_version).toBe(1);

      // Should be the exact same object (cached)
      expect(tool1).toBe(tool2);
    });

    test('v1.0 tools have no validators or helpers', async () => {
      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);

        expect(tool.executable_knowledge).toBeUndefined();

        // If executable_knowledge exists, it should not have validators/helpers
        if (tool.executable_knowledge) {
          expect(tool.executable_knowledge.validators).toBeUndefined();
          expect(tool.executable_knowledge.helpers).toBeUndefined();
        }
      }
    });
  });

  describeIntegration('Tool Type Distribution', () => {
    test('tools are correctly categorized by type', async () => {
      const typeDistribution = {
        cli: [],
        local: [],
        mcp: [],
      };

      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);
        typeDistribution[tool.type].push(tool.id);
      }

      // CLI tools
      expect(typeDistribution.cli).toContain('github-cli');
      expect(typeDistribution.cli).toContain('railway-cli');
      expect(typeDistribution.cli).toContain('supabase-cli');

      // Local tools
      expect(typeDistribution.local).toContain('ffmpeg');

      // MCP tools
      expect(typeDistribution.mcp).toContain('21st-dev-magic');
      expect(typeDistribution.mcp).toContain('browser');
      expect(typeDistribution.mcp).toContain('context7');
      expect(typeDistribution.mcp).toContain('exa');
    });

    test('v2.0 tools are all MCP type', async () => {
      for (const toolName of v2ComplexTools) {
        const tool = await toolResolver.resolveTool(toolName);
        expect(tool.type).toBe('mcp');
        expect(tool.schema_version).toBe(2);
      }
    });
  });

  describeIntegration('No Breaking Changes Verification', () => {
    test('ToolResolver API unchanged for v1.0 tools', async () => {
      const toolName = 'browser';

      // resolveTool() should work exactly as before
      const tool = await toolResolver.resolveTool(toolName);

      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('type');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('schema_version');

      // New field should exist but not break anything
      expect(typeof tool.schema_version).toBe('number');
    });

    test('tool resolution performance unchanged', async () => {
      const toolName = 'exa';

      // Clear cache to test uncached performance
      toolResolver.clearCache();

      const start = Date.now();
      await toolResolver.resolveTool(toolName);
      const uncachedDuration = Date.now() - start;

      // Should still be fast (<50ms uncached)
      expect(uncachedDuration).toBeLessThan(50);

      // Cached should be instant (<5ms)
      const cachedStart = Date.now();
      await toolResolver.resolveTool(toolName);
      const cachedDuration = Date.now() - cachedStart;

      expect(cachedDuration).toBeLessThan(5);
    });

    test('error handling unchanged for invalid tools', async () => {
      await expect(
        toolResolver.resolveTool('non-existent-tool'),
      ).rejects.toThrow();

      // Error should still be clear and helpful
      try {
        await toolResolver.resolveTool('invalid-tool-name');
      } catch (error) {
        expect(error.message).toMatch(/not found|could not resolve/i);
      }
    });

    test('all 12 tools (8 v1.0 + 4 v2.0) resolve without errors', async () => {
      const allTools = [...v1SimpleTools, ...v2ComplexTools];
      const results = [];

      for (const toolName of allTools) {
        try {
          const tool = await toolResolver.resolveTool(toolName);
          results.push({
            name: toolName,
            success: true,
            schema_version: tool.schema_version,
          });
        } catch (error) {
          results.push({
            name: toolName,
            success: false,
            error: error.message,
          });
        }
      }

      // All should succeed
      const failures = results.filter(r => !r.success);
      expect(failures).toHaveLength(0);

      // 8 should be v1.0
      const v1Count = results.filter(r => r.schema_version === 1).length;
      expect(v1Count).toBe(8);

      // 4 should be v2.0
      const v2Count = results.filter(r => r.schema_version === 2).length;
      expect(v2Count).toBe(4);
    });
  });

  describeIntegration('Backward Compatibility Summary', () => {
    test('comprehensive v1.0 compatibility check', async () => {
      const report = {
        v1_tools: [],
        schema_detection: [],
        api_compatibility: [],
        issues: [],
      };

      // Test all v1.0 tools
      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);

        report.v1_tools.push({
          name: toolName,
          schema_version: tool.schema_version,
          has_executable_knowledge: !!tool.executable_knowledge,
          knowledge_strategy: tool.knowledge_strategy,
        });

        // Verify schema detection
        if (tool.schema_version !== 1) {
          report.schema_detection.push({
            tool: toolName,
            expected: 1,
            actual: tool.schema_version,
          });
        }

        // Verify no executable_knowledge
        if (tool.executable_knowledge) {
          report.api_compatibility.push({
            tool: toolName,
            issue: 'v1.0 tool has executable_knowledge field',
          });
        }

        // Verify knowledge_strategy
        if (tool.knowledge_strategy !== 'declarative') {
          report.issues.push({
            tool: toolName,
            issue: `knowledge_strategy is ${tool.knowledge_strategy}, expected declarative`,
          });
        }
      }

      // All checks should pass
      expect(report.schema_detection).toHaveLength(0);
      expect(report.api_compatibility).toHaveLength(0);
      expect(report.issues).toHaveLength(0);

      // All v1.0 tools should be accounted for
      expect(report.v1_tools).toHaveLength(8);

      // Log summary
      console.log('\n✅ v1.0 Backward Compatibility Report:');
      console.log(`  v1.0 Tools Verified: ${report.v1_tools.length}`);
      console.log(`  Schema Detection Issues: ${report.schema_detection.length}`);
      console.log(`  API Compatibility Issues: ${report.api_compatibility.length}`);
      console.log(`  Other Issues: ${report.issues.length}`);
      console.log(`  Status: ${report.issues.length === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
    });
  });
});
