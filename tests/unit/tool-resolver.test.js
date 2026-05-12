// Mock dependencies before requiring
jest.mock('fs-extra');
jest.mock('fast-glob', () => ({
  sync: jest.fn().mockReturnValue([]),
}));

describe('ToolResolver', () => {
  let resolver;
  let fs;
  let fg;
  let path;

  beforeAll(() => {
    // Require modules inside beforeAll to avoid module-level issues
    fs = require('fs-extra');
    fg = require('fast-glob');
    path = require('path');

    // Require ToolResolver after all other modules are loaded
    resolver = require('../../common/utils/tool-resolver');
  });

  const _fixturesPath = () => path.join(__dirname, '../fixtures');

  // Sample tool definitions (with 'tool:' wrapper - matches spec format)
  const simpleToolYaml = `
tool:
  id: test-simple
  type: mcp
  name: Test Simple Tool
  version: 1.0.0
  description: Simple v1.0 tool for testing
  commands:
    - search
    - fetch
  mcp_specific:
    server_command: npx -y test-simple-server
    transport: stdio
`;

  const complexToolYaml = `
tool:
  schema_version: 2.0
  id: test-complex
  type: mcp
  name: Test Complex Tool
  version: 1.0.0
  description: Complex v2.0 tool with executable knowledge
  knowledge_strategy: executable
  commands:
    - create_item
  executable_knowledge:
    validators:
      - id: validate-create-item
        validates: create_item
        language: javascript
        function: |
          function validateCommand(args) {
            return { valid: true, errors: [] };
          }
  mcp_specific:
    server_command: npx -y test-complex-server
    transport: stdio
`;

  const invalidToolYaml = `
tool:
  type: mcp
  name: Invalid Tool
  version: 1.0.0
`;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset fg.sync to return empty array by default
    fg.sync.mockReturnValue([]);

    // Clear cache before each test
    if (resolver.cache) {
      resolver.cache.clear();
    }
  });

  describe('Cache Mechanism', () => {
    test('should cache tool after first resolution', async () => {
      // Mock file system
      fg.sync.mockReturnValue(['aiox-core/tools/test-simple.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      // First call - should read from file
      const tool1 = await resolver.resolveTool('test-simple');
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(tool1.id).toBe('test-simple');

      // Second call - should use cache
      const tool2 = await resolver.resolveTool('test-simple');
      expect(fs.readFile).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(tool2.id).toBe('test-simple');

      // Should be exact same object from cache
      expect(tool1).toBe(tool2);
    });

    test('should use different cache keys for different squads', async () => {
      fg.sync.mockReturnValue(['squads/pack1/tools/test-tool.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool1 = await resolver.resolveTool('test-simple', { expansionPack: 'pack1' });
      const tool2 = await resolver.resolveTool('test-simple', { expansionPack: 'pack2' });

      // Should have called readFile twice (different cache keys)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    test('should provide cache clear method', () => {
      // Add items to cache
      resolver.cache.set('test1', { id: 'test1' });
      resolver.cache.set('test2', { id: 'test2' });
      expect(resolver.cache.size).toBe(2);

      // Clear cache
      resolver.clearCache();
      expect(resolver.cache.size).toBe(0);
    });

    test('should provide cache stats', async () => {
      fg.sync.mockReturnValue(['aiox-core/tools/test-simple.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      await resolver.resolveTool('test-simple');
      await resolver.resolveTool('test-simple'); // Cache hit

      const stats = resolver.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('core:test-simple');
    });
  });

  describe('Search Path Priority', () => {
    test('should prioritize squad tools over core tools', async () => {
      // Mock squad tool found first
      fg.sync.mockImplementation((pattern) => {
        if (pattern.includes('squads/my-pack')) {
          return ['squads/my-pack/tools/test-simple.yaml'];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool = await resolver.resolveTool('test-simple', { expansionPack: 'my-pack' });

      // Should have searched squad first
      expect(fg.sync).toHaveBeenCalledWith(
        expect.stringContaining('squads/my-pack/tools'),
      );

      expect(tool.id).toBe('test-simple');
    });

    test('should fall back to core when squad tool not found', async () => {
      // Mock: squad returns empty, core returns tool
      fg.sync.mockImplementation((pattern) => {
        if (pattern.includes('squads')) {
          return [];
        }
        if (pattern.includes('aiox-core/tools')) {
          return ['aiox-core/tools/test-simple.yaml'];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool = await resolver.resolveTool('test-simple', { expansionPack: 'my-pack' });

      // Should have tried both paths
      expect(fg.sync).toHaveBeenCalledTimes(2);
      expect(tool.id).toBe('test-simple');
    });

    test('should search common/tools directory', async () => {
      fg.sync.mockImplementation((pattern) => {
        if (pattern.includes('common/tools')) {
          return ['common/tools/test-tool.yaml'];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(simpleToolYaml);

      await resolver.resolveTool('test-simple');

      // Should have searched common directory
      expect(fg.sync).toHaveBeenCalledWith(
        expect.stringContaining('common/tools'),
      );
    });
  });

  describe('Tool Not Found Error', () => {
    test('should throw error when tool not found', async () => {
      fg.sync.mockReturnValue([]);

      await expect(resolver.resolveTool('nonexistent-tool')).rejects.toThrow(
        /Tool 'nonexistent-tool' not found/,
      );
    });

    test('should provide helpful error message with search paths', async () => {
      fg.sync.mockReturnValue([]);

      try {
        await resolver.resolveTool('missing-tool');
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('missing-tool');
        // Error should mention where it looked
        expect(error.message.toLowerCase()).toMatch(/search|path|found/);
      }
    });
  });

  describe('Schema Validation', () => {
    test('should validate required fields', async () => {
      fg.sync.mockReturnValue(['aiox-core/tools/invalid.yaml']);
      fs.readFile.mockResolvedValue(invalidToolYaml);

      await expect(resolver.resolveTool('invalid-tool')).rejects.toThrow(
        /required field/i,
      );
    });

    test('should validate v1.0 tool schema', async () => {
      fg.sync.mockReturnValue(['aiox-core/tools/simple.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool = await resolver.resolveTool('test-simple');

      // Should have all required v1.0 fields
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('type');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('version');
      expect(tool).toHaveProperty('description');
    });

    test('should validate v2.0 tool schema with executable knowledge', async () => {
      fg.sync.mockReturnValue(['aiox-core/tools/complex.yaml']);
      fs.readFile.mockResolvedValue(complexToolYaml);

      const tool = await resolver.resolveTool('test-complex');

      // Should have v2.0 fields
      expect(tool.schema_version).toBe(2.0);
      expect(tool).toHaveProperty('executable_knowledge');
      expect(tool.executable_knowledge).toHaveProperty('validators');
    });

    test('should reject invalid YAML syntax', async () => {
      fg.sync.mockReturnValue(['aiox-core/tools/broken.yaml']);
      fs.readFile.mockResolvedValue('invalid: yaml: syntax: [');

      await expect(resolver.resolveTool('broken-tool')).rejects.toThrow();
    });
  });

  describe('Auto-Detection Logic', () => {
    test('should detect v1.0 for simple tools', async () => {
      fg.sync.mockReturnValue(['aiox-core/tools/simple.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool = await resolver.resolveTool('test-simple');

      // Should auto-detect as v1.0
      expect(tool.schema_version).toBe(1.0);
    });

    test('should detect v2.0 when executable_knowledge present', async () => {
      // Tool without explicit schema_version but has v2.0 features
      const autoDetectToolYaml = `
tool:
  id: auto-detect
  type: mcp
  name: Auto Detect Tool
  version: 1.0.0
  description: Tool with v2.0 features
  executable_knowledge:
    validators:
      - id: test-validator
        validates: command
        function: "function() { return true; }"
  mcp_specific:
    server_command: npx -y test
`;

      fg.sync.mockReturnValue(['aiox-core/tools/auto.yaml']);
      fs.readFile.mockResolvedValue(autoDetectToolYaml);

      const tool = await resolver.resolveTool('auto-detect');

      // Should auto-detect as v2.0
      expect(tool.schema_version).toBe(2.0);
    });

    test('should detect v2.0 when api_complexity present', async () => {
      const apiComplexToolYaml = `
tool:
  id: api-complex
  type: mcp
  name: API Complex Tool
  version: 1.0.0
  description: Tool with API complexity
  api_complexity:
    api_quirks:
      - quirk: test
        description: test quirk
`;

      fg.sync.mockReturnValue(['aiox-core/tools/api.yaml']);
      fs.readFile.mockResolvedValue(apiComplexToolYaml);

      const tool = await resolver.resolveTool('api-complex');
      expect(tool.schema_version).toBe(2.0);
    });

    test('should detect v2.0 when anti_patterns present', async () => {
      const antiPatternsToolYaml = `
tool:
  id: anti-patterns
  type: mcp
  name: Anti Patterns Tool
  version: 1.0.0
  description: Tool with anti patterns
  anti_patterns:
    - pattern: wrong_usage
      description: Incorrect usage
`;

      fg.sync.mockReturnValue(['aiox-core/tools/anti.yaml']);
      fs.readFile.mockResolvedValue(antiPatternsToolYaml);

      const tool = await resolver.resolveTool('anti-patterns');
      expect(tool.schema_version).toBe(2.0);
    });
  });

  describe('Health Check Methods', () => {
    test('should support command-based health check', async () => {
      const healthCheckToolYaml = `
tool:
  id: health-tool
  type: mcp
  name: Health Tool
  version: 1.0.0
  description: Tool with health check
  health_check:
    method: command
    command: echo "healthy"
    expected_output: healthy
    timeout: 5000
`;

      fg.sync.mockReturnValue(['aiox-core/tools/health.yaml']);
      fs.readFile.mockResolvedValue(healthCheckToolYaml);

      const tool = await resolver.resolveTool('health-tool');

      expect(tool.health_check).toBeDefined();
      expect(tool.health_check.method).toBe('command');
    });

    test('should support HTTP endpoint health check', async () => {
      const httpHealthToolYaml = `
tool:
  id: http-health-tool
  type: mcp
  name: HTTP Health Tool
  version: 1.0.0
  description: Tool with HTTP health check
  health_check:
    method: http
    endpoint: http://localhost:3000/health
    expected_status: 200
`;

      fg.sync.mockReturnValue(['aiox-core/tools/http-health.yaml']);
      fs.readFile.mockResolvedValue(httpHealthToolYaml);

      const tool = await resolver.resolveTool('http-health-tool');

      expect(tool.health_check).toBeDefined();
      expect(tool.health_check.method).toBe('http');
      expect(tool.health_check.endpoint).toBe('http://localhost:3000/health');
    });

    test('should support custom function health check', async () => {
      const functionHealthToolYaml = `
tool:
  id: function-health-tool
  type: mcp
  name: Function Health Tool
  version: 1.0.0
  description: Tool with function health check
  health_check:
    method: function
    function: |
      async function checkHealth() {
        return { healthy: true };
      }
`;

      fg.sync.mockReturnValue(['aiox-core/tools/function-health.yaml']);
      fs.readFile.mockResolvedValue(functionHealthToolYaml);

      const tool = await resolver.resolveTool('function-health-tool');

      expect(tool.health_check).toBeDefined();
      expect(tool.health_check.method).toBe('function');
      expect(tool.health_check.function).toContain('checkHealth');
    });
  });

  describe('Additional Methods', () => {
    test('should list all available tools', async () => {
      fg.sync.mockReturnValue([
        'aiox-core/tools/tool1.yaml',
        'aiox-core/tools/tool2.yaml',
        'common/tools/tool3.yaml',
      ]);

      const tools = resolver.listAvailableTools();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should check if tool exists without loading', async () => {
      // Mock implementation that returns results only for 'exists' tool (not 'not-exists')
      fg.sync.mockImplementation((pattern) => {
        if (pattern.includes('/exists.yaml')) {
          return ['aiox-core/tools/exists.yaml'];
        }
        return [];
      });

      const exists = await resolver.toolExists('exists');
      expect(exists).toBe(true);

      const notExists = await resolver.toolExists('not-exists');
      expect(notExists).toBe(false);
    });
  });
});
