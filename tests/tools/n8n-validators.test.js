// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * n8n Tool Validators Test Suite
 *
 * Tests all 3 validators defined in n8n.yaml:
 * 1. validate-execute-workflow
 * 2. validate-create-workflow
 * 3. validate-credential-operations
 */
describeIntegration('n8n Tool Validators', () => {
  let validator;
  let n8nTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve n8n tool
    n8nTool = await toolResolver.resolveTool('n8n');

    // Create validator instance
    validator = new ToolValidationHelper(n8nTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve n8n tool from aiox-core/tools/mcp', async () => {
      expect(n8nTool).toBeDefined();
      expect(n8nTool.id).toBe('n8n');
      expect(n8nTool.type).toBe('mcp');
      expect(n8nTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(n8nTool.executable_knowledge).toBeDefined();
      expect(n8nTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(n8nTool.executable_knowledge.validators)).toBe(true);
      expect(n8nTool.executable_knowledge.validators.length).toBe(5);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = n8nTool.executable_knowledge.validators.map(v => v.id);
      expect(validatorIds).toContain('validate-execute-workflow');
      expect(validatorIds).toContain('validate-create-workflow');
      expect(validatorIds).toContain('validate-create-credential');
      expect(validatorIds).toContain('validate-update-credential');
      expect(validatorIds).toContain('validate-delete-credential');
    });
  });

  describeIntegration('validate-execute-workflow', () => {
    test('should pass with valid workflow_id', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should pass with workflowId (alternative field name)', async () => {
      const result = await validator.validate('execute_workflow', {
        workflowId: 'wf_abc123',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with data object', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        data: { key: 'value' },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with wait_for_completion boolean', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        wait_for_completion: true,
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without workflow_id', async () => {
      const result = await validator.validate('execute_workflow', {
        data: { key: 'value' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('workflow_id is required');
    });

    test('should fail with non-object data', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        data: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data must be an object');
    });

    test('should fail with non-boolean wait_for_completion', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        wait_for_completion: 'yes',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('wait_for_completion must be boolean');
    });
  });

  describeIntegration('validate-create-workflow', () => {
    test('should pass with valid workflow name', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with nodes array', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: [
          { type: 'n8n-nodes-base.start', name: 'Start' },
          { type: 'n8n-nodes-base.httpRequest', name: 'HTTP Request' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with connections object', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        connections: {
          'Start': {
            main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]],
          },
        },
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without name', async () => {
      const result = await validator.validate('create_workflow', {
        nodes: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    test('should fail with non-array nodes', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes must be an array');
    });

    test('should fail with node missing type', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: [
          { name: 'Start' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing required 'type' field");
    });

    test('should fail with node missing name', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: [
          { type: 'n8n-nodes-base.start' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing required 'name' field");
    });

    test('should fail with non-object connections', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        connections: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('connections must be an object');
    });
  });

  describeIntegration('validate-credential-operations (create_credential)', () => {
    test('should pass with valid create_credential parameters', async () => {
      const result = await validator.validate('create_credential', {
        name: 'My API Credential',
        type: 'httpBasicAuth',
        data: { username: 'user', password: 'pass' },
      });

      expect(result.valid).toBe(true);
    });

    test('should fail create_credential without name', async () => {
      const result = await validator.validate('create_credential', {
        type: 'httpBasicAuth',
        data: { username: 'user' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required for create_credential');
    });

    test('should fail create_credential without type', async () => {
      const result = await validator.validate('create_credential', {
        name: 'My Credential',
        data: { username: 'user' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('type is required for create_credential');
    });

    test('should fail create_credential without data', async () => {
      const result = await validator.validate('create_credential', {
        name: 'My Credential',
        type: 'httpBasicAuth',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data is required for create_credential');
    });

    test('should fail create_credential with non-object data', async () => {
      const result = await validator.validate('create_credential', {
        name: 'My Credential',
        type: 'httpBasicAuth',
        data: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data must be an object');
    });
  });

  describeIntegration('validate-credential-operations (update_credential)', () => {
    test('should pass with valid update_credential parameters', async () => {
      const result = await validator.validate('update_credential', {
        credential_id: 'cred_123',
        data: { username: 'newuser' },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with credentialId (alternative field name)', async () => {
      const result = await validator.validate('update_credential', {
        credentialId: 'cred_123',
        name: 'Updated Name',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail update_credential without credential_id', async () => {
      const result = await validator.validate('update_credential', {
        name: 'Updated Name',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('credential_id is required for update_credential');
    });
  });

  describeIntegration('validate-credential-operations (delete_credential)', () => {
    test('should pass with valid delete_credential parameters', async () => {
      const result = await validator.validate('delete_credential', {
        credential_id: 'cred_123',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail delete_credential without credential_id', async () => {
      const result = await validator.validate('delete_credential', {});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('credential_id is required for delete_credential');
    });
  });

  describeIntegration('Validator Performance', () => {
    test('validation should complete in <50ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await validator.validate('execute_workflow', {
          workflow_id: 'wf_test123',
          data: { key: 'value' },
          wait_for_completion: true,
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nn8n Validator Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(50);
    });
  });
});
