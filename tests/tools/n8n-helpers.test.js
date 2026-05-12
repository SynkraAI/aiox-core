// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * n8n Tool Helpers Test Suite
 *
 * Tests all 7 helpers defined in n8n.yaml:
 * 1. extract-workflow-state
 * 2. validate-node-connections
 * 3. format-workflow-data
 * 4. parse-execution-error
 * 5. validate-credential-type
 * 6. build-workflow-structure
 * 7. calculate-workflow-complexity
 */
describeIntegration('n8n Tool Helpers', () => {
  let executor;
  let n8nTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve n8n tool
    n8nTool = await toolResolver.resolveTool('n8n');

    // Create helper executor instance
    executor = new ToolHelperExecutor(n8nTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve n8n tool with helpers', async () => {
      expect(n8nTool).toBeDefined();
      expect(n8nTool.executable_knowledge).toBeDefined();
      expect(n8nTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(n8nTool.executable_knowledge.helpers)).toBe(true);
      expect(n8nTool.executable_knowledge.helpers.length).toBe(7);
    });

    test('should have all required helper IDs', () => {
      const helperIds = n8nTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('extract-workflow-state');
      expect(helperIds).toContain('validate-node-connections');
      expect(helperIds).toContain('format-workflow-data');
      expect(helperIds).toContain('parse-execution-error');
      expect(helperIds).toContain('validate-credential-type');
      expect(helperIds).toContain('build-workflow-structure');
      expect(helperIds).toContain('calculate-workflow-complexity');
    });
  });

  describeIntegration('extract-workflow-state', () => {
    test('should extract finished workflow state', async () => {
      const result = await executor.execute('extract-workflow-state', {
        execution: {
          id: 'exec_123',
          finished: true,
          startedAt: '2024-01-15T10:00:00Z',
          finishedAt: '2024-01-15T10:05:00Z',
          mode: 'manual',
        },
      });

      expect(result).toEqual({
        id: 'exec_123',
        status: 'finished',
        startedAt: '2024-01-15T10:00:00Z',
        finishedAt: '2024-01-15T10:05:00Z',
        mode: 'manual',
      });
    });

    test('should extract stopped workflow state', async () => {
      const result = await executor.execute('extract-workflow-state', {
        execution: {
          id: 'exec_456',
          finished: false,
          stoppedAt: '2024-01-15T10:03:00Z',
          startedAt: '2024-01-15T10:00:00Z',
          mode: 'manual',
        },
      });

      expect(result).toEqual({
        id: 'exec_456',
        status: 'stopped',
        startedAt: '2024-01-15T10:00:00Z',
        finishedAt: undefined,
        mode: 'manual',
      });
    });

    test('should extract running workflow state', async () => {
      const result = await executor.execute('extract-workflow-state', {
        execution: {
          id: 'exec_789',
          finished: false,
          startedAt: '2024-01-15T10:00:00Z',
          mode: 'trigger',
        },
      });

      expect(result).toEqual({
        id: 'exec_789',
        status: 'running',
        startedAt: '2024-01-15T10:00:00Z',
        finishedAt: undefined,
        mode: 'trigger',
      });
    });

    test('should return null for missing execution', async () => {
      const result = await executor.execute('extract-workflow-state', {});

      expect(result).toBeNull();
    });
  });

  describeIntegration('validate-node-connections', () => {
    test('should validate correct connections', async () => {
      const result = await executor.execute('validate-node-connections', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
          { name: 'HTTP Request', type: 'n8n-nodes-base.httpRequest' },
        ],
        connections: {
          'Start': {
            main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]],
          },
        },
      });

      expect(result).toEqual({
        valid: true,
        errors: [],
      });
    });

    test('should detect missing source node', async () => {
      const result = await executor.execute('validate-node-connections', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
        ],
        connections: {
          'NonExistent': {
            main: [[{ node: 'Start', type: 'main', index: 0 }]],
          },
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Connection source 'NonExistent' not found in nodes");
    });

    test('should detect missing target node', async () => {
      const result = await executor.execute('validate-node-connections', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
        ],
        connections: {
          'Start': {
            main: [[{ node: 'MissingTarget', type: 'main', index: 0 }]],
          },
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Connection target 'MissingTarget' not found in nodes");
    });

    test('should fail with missing nodes', async () => {
      const result = await executor.execute('validate-node-connections', {
        connections: {},
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing nodes or connections');
    });

    test('should fail with missing connections', async () => {
      const result = await executor.execute('validate-node-connections', {
        nodes: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing nodes or connections');
    });
  });

  describeIntegration('format-workflow-data', () => {
    test('should format data with trigger node', async () => {
      const result = await executor.execute('format-workflow-data', {
        data: { input: 'test' },
        workflowData: {
          nodes: [
            {
              name: 'Webhook',
              type: 'n8n-nodes-base.webhook',
              parameters: { path: '/test' },
            },
          ],
        },
      });

      expect(result).toEqual({
        formatted: true,
        data: { input: 'test' },
        triggerNode: 'Webhook',
      });
    });

    test('should format data with start node', async () => {
      const result = await executor.execute('format-workflow-data', {
        data: { key: 'value' },
        workflowData: {
          nodes: [
            {
              name: 'Start',
              type: 'n8n-nodes-base.start',
              parameters: {},
            },
          ],
        },
      });

      expect(result).toEqual({
        formatted: true,
        data: { key: 'value' },
        triggerNode: 'Start',
      });
    });

    test('should handle workflow without trigger node', async () => {
      const result = await executor.execute('format-workflow-data', {
        data: { test: true },
        workflowData: {
          nodes: [
            {
              name: 'HTTP Request',
              type: 'n8n-nodes-base.httpRequest',
              parameters: {},
            },
          ],
        },
      });

      expect(result).toEqual({
        formatted: false,
        data: { test: true },
      });
    });

    test('should handle missing workflow data', async () => {
      const result = await executor.execute('format-workflow-data', {
        data: { sample: 'data' },
      });

      expect(result).toEqual({
        formatted: false,
        data: { sample: 'data' },
      });
    });

    test('should default to empty object for missing data', async () => {
      const result = await executor.execute('format-workflow-data', {});

      expect(result).toEqual({
        formatted: false,
        data: {},
      });
    });
  });

  describeIntegration('parse-execution-error', () => {
    test('should parse error with full details', async () => {
      const result = await executor.execute('parse-execution-error', {
        error: {
          message: 'HTTP request failed',
          node: 'HTTP Request',
          timestamp: '2024-01-15T10:05:00Z',
          stack: 'Error: HTTP request failed\n  at Node.execute',
        },
      });

      expect(result).toEqual({
        message: 'HTTP request failed',
        node: 'HTTP Request',
        timestamp: '2024-01-15T10:05:00Z',
        stack: 'Error: HTTP request failed\n  at Node.execute',
      });
    });

    test('should parse error with defaults', async () => {
      const result = await executor.execute('parse-execution-error', {
        error: {},
        execution: { stoppedAt: '2024-01-15T10:05:00Z' },
      });

      expect(result).toEqual({
        message: 'Unknown error',
        node: 'unknown',
        timestamp: '2024-01-15T10:05:00Z',
        stack: null,
      });
    });

    test('should return null for missing error', async () => {
      const result = await executor.execute('parse-execution-error', {
        execution: {},
      });

      expect(result).toBeNull();
    });
  });

  describeIntegration('validate-credential-type', () => {
    test('should validate httpBasicAuth', async () => {
      const result = await executor.execute('validate-credential-type', {
        type: 'httpBasicAuth',
      });

      expect(result).toBe(true);
    });

    test('should validate oAuth2Api', async () => {
      const result = await executor.execute('validate-credential-type', {
        type: 'oAuth2Api',
      });

      expect(result).toBe(true);
    });

    test('should validate apiKey', async () => {
      const result = await executor.execute('validate-credential-type', {
        type: 'apiKey',
      });

      expect(result).toBe(true);
    });

    test('should validate database credentials', async () => {
      const types = ['postgres', 'mysql', 'mongodb', 'redis'];
      for (const type of types) {
        const result = await executor.execute('validate-credential-type', { type });
        expect(result).toBe(true);
      }
    });

    test('should validate cloud provider credentials', async () => {
      const types = ['aws', 'googleApi'];
      for (const type of types) {
        const result = await executor.execute('validate-credential-type', { type });
        expect(result).toBe(true);
      }
    });

    test('should reject invalid credential type', async () => {
      const result = await executor.execute('validate-credential-type', {
        type: 'invalidType',
      });

      expect(result).toBe(false);
    });
  });

  describeIntegration('build-workflow-structure', () => {
    test('should build workflow with nodes and connections', async () => {
      const result = await executor.execute('build-workflow-structure', {
        name: 'Test Workflow',
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
        ],
        connections: {
          'Start': { main: [[{ node: 'End' }]] },
        },
      });

      expect(result).toEqual({
        name: 'Test Workflow',
        nodes: [{ name: 'Start', type: 'n8n-nodes-base.start' }],
        connections: { 'Start': { main: [[{ node: 'End' }]] } },
        active: false,
        settings: {},
        staticData: null,
      });
    });

    test('should build workflow with defaults', async () => {
      const result = await executor.execute('build-workflow-structure', {
        name: 'Simple Workflow',
      });

      expect(result).toEqual({
        name: 'Simple Workflow',
        nodes: [],
        connections: {},
        active: false,
        settings: {},
        staticData: null,
      });
    });

    test('should return error for missing name', async () => {
      const result = await executor.execute('build-workflow-structure', {
        nodes: [],
      });

      expect(result).toEqual({
        error: 'Workflow name is required',
      });
    });
  });

  describeIntegration('calculate-workflow-complexity', () => {
    test('should calculate complexity for simple workflow', async () => {
      const result = await executor.execute('calculate-workflow-complexity', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
          { name: 'HTTP', type: 'n8n-nodes-base.httpRequest' },
        ],
        connections: {
          'Start': { main: [[{ node: 'HTTP' }]] },
        },
      });

      expect(result.complexity).toBe(3); // 2 nodes + 0.5 connection (rounded)
      expect(result.nodeCount).toBe(2);
      expect(result.connectionCount).toBe(1);
      expect(result.hasComplexLogic).toBe(false);
    });

    test('should calculate complexity with conditional nodes', async () => {
      const result = await executor.execute('calculate-workflow-complexity', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
          { name: 'IF', type: 'n8n-nodes-base.if' },
          { name: 'Action1', type: 'n8n-nodes-base.httpRequest' },
          { name: 'Action2', type: 'n8n-nodes-base.httpRequest' },
        ],
        connections: {
          'Start': { main: [[{ node: 'IF' }]] },
          'IF': {
            main: [
              [{ node: 'Action1' }],
              [{ node: 'Action2' }],
            ],
          },
        },
      });

      expect(result.complexity).toBe(8); // 4 nodes + 1.5 connections + 2 for IF node = 7.5, rounded to 8
      expect(result.nodeCount).toBe(4);
      expect(result.hasComplexLogic).toBe(true);
    });

    test('should calculate complexity with switch node', async () => {
      const result = await executor.execute('calculate-workflow-complexity', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
          { name: 'Switch', type: 'n8n-nodes-base.switch' },
        ],
        connections: {
          'Start': { main: [[{ node: 'Switch' }]] },
        },
      });

      expect(result.complexity).toBe(5); // 2 nodes + 0.5 connection + 2 for switch
      expect(result.hasComplexLogic).toBe(true);
    });

    test('should calculate complexity with function node', async () => {
      const result = await executor.execute('calculate-workflow-complexity', {
        nodes: [
          { name: 'Function', type: 'n8n-nodes-base.function' },
        ],
        connections: {},
      });

      expect(result.complexity).toBe(3); // 1 node + 2 for function
      expect(result.hasComplexLogic).toBe(true);
    });

    test('should return zero complexity for missing nodes', async () => {
      const result = await executor.execute('calculate-workflow-complexity', {
        connections: {},
      });

      expect(result).toEqual({ complexity: 0 });
    });
  });

  describeIntegration('Helper Performance', () => {
    test('helper execution should complete in <100ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('validate-node-connections', {
          nodes: [
            { name: 'Start', type: 'n8n-nodes-base.start' },
            { name: 'End', type: 'n8n-nodes-base.httpRequest' },
          ],
          connections: {
            'Start': { main: [[{ node: 'End' }]] },
          },
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nn8n Helper Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
    });
  });
});
