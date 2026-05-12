// Integration test - requires tool YAML files
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Integration Test Suite for Complex Tool Validators
 *
 * AC3 Requirements:
 * - Test ClickUp assignee format validation
 * - Test Google Workspace permission validation
 * - Test n8n workflow validation
 * - Test Supabase RLS policy validation
 *
 * This suite provides integration-level validation testing across all 4 complex tools,
 * ensuring validators work correctly in real-world scenarios.
 */
describeIntegration('Complex Tool Validators - Integration Tests', () => {
  let clickupValidator, googleValidator, n8nValidator, supabaseValidator;

  beforeAll(async () => {
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    const clickupTool = await toolResolver.resolveTool('clickup');
    const googleTool = await toolResolver.resolveTool('google-workspace');
    const n8nTool = await toolResolver.resolveTool('n8n');
    const supabaseTool = await toolResolver.resolveTool('supabase');

    clickupValidator = new ToolValidationHelper(clickupTool.executable_knowledge.validators);
    googleValidator = new ToolValidationHelper(googleTool.executable_knowledge.validators);
    n8nValidator = new ToolValidationHelper(n8nTool.executable_knowledge.validators);
    supabaseValidator = new ToolValidationHelper(supabaseTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('ClickUp Assignee Format Validation', () => {
    test('validates correct assignee format for create_task', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: [456, 789, 101112],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects object format for create_task (expects array)', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: { add: [456], rem: [789] },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.join(' ')).toContain('array');
    });

    test('validates correct assignee format for update_task', async () => {
      const result = await clickupValidator.validate('update_task', {
        task_id: '123',
        assignees: { add: [456], rem: [789] },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects array format for update_task (expects object)', async () => {
      const result = await clickupValidator.validate('update_task', {
        task_id: '123',
        assignees: [456, 789],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates required fields for create_task', async () => {
      const result = await clickupValidator.validate('create_task', {
        list_id: '123456789',
        // Missing: name
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/name.*required/i);
    });

    test('validates list_id format', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: 'short', // Too short
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates priority range (1-4)', async () => {
      const invalidPriority = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 5, // Out of range
      });

      expect(invalidPriority.valid).toBe(false);
      expect(invalidPriority.errors.join(' ')).toMatch(/priority/i);

      const validPriority = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 2,
      });

      expect(validPriority.valid).toBe(true);
    });

    test('validates custom field structure', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { id: 'field_123', value: 'test value' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('validates webhook payload structure', async () => {
      const result = await clickupValidator.validate('parse_webhook', {
        event: 'task_created',
        task_id: '123456789',
        webhook_id: 'wh_abc123',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('Google Workspace Permission Validation', () => {
    test('validates file creation with required fields', async () => {
      const result = await googleValidator.validate('create_file', {
        name: 'test-document.txt',
        content: 'Test content here',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('requires either content or fileUrl for file creation', async () => {
      const result = await googleValidator.validate('create_file', {
        name: 'test-document.txt',
        // Missing both content and fileUrl
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/content.*fileUrl/i);
    });

    test('validates mimeType format', async () => {
      const invalidMime = await googleValidator.validate('create_file', {
        name: 'test.txt',
        content: 'data',
        mimeType: 'invalid-type',
      });

      expect(invalidMime.valid).toBe(false);
      expect(invalidMime.errors.join(' ')).toMatch(/mimeType/i);

      const validMime = await googleValidator.validate('create_file', {
        name: 'test.txt',
        content: 'data',
        mimeType: 'text/plain',
      });

      expect(validMime.valid).toBe(true);
    });

    test('validates file sharing permissions', async () => {
      const result = await googleValidator.validate('share_file', {
        fileId: 'abc123def456',
        emailAddress: 'user@example.com',
        role: 'reader',
      });

      expect(result.valid).toBe(true);
    });

    test('requires fileId for share_file', async () => {
      const result = await googleValidator.validate('share_file', {
        emailAddress: 'user@example.com',
        role: 'reader',
        // Missing fileId
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/fileId.*required/i);
    });

    test('validates email format for sharing', async () => {
      const result = await googleValidator.validate('share_file', {
        fileId: 'abc123',
        emailAddress: 'not-an-email',
        role: 'reader',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/email/i);
    });

    test('validates role values for file sharing', async () => {
      const invalidRole = await googleValidator.validate('share_file', {
        fileId: 'abc123',
        emailAddress: 'user@example.com',
        role: 'invalid-role',
      });

      expect(invalidRole.valid).toBe(false);

      const validRoles = ['reader', 'writer', 'commenter', 'owner'];
      for (const role of validRoles) {
        const result = await googleValidator.validate('share_file', {
          fileId: 'abc123',
          emailAddress: 'user@example.com',
          role,
        });
        expect(result.valid).toBe(true);
      }
    });

    test('validates calendar event creation', async () => {
      const result = await googleValidator.validate('create_event', {
        summary: 'Team Meeting',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T11:00:00Z',
      });

      expect(result.valid).toBe(true);
    });

    test('validates event time format', async () => {
      const result = await googleValidator.validate('create_event', {
        summary: 'Team Meeting',
        startTime: 'invalid-date',
        endTime: '2025-01-15T11:00:00Z',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/time|date/i);
    });

    test('validates attendee email format for events', async () => {
      const result = await googleValidator.validate('create_event', {
        summary: 'Team Meeting',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T11:00:00Z',
        attendees: ['user@example.com', 'invalid-email'],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/email/i);
    });
  });

  describeIntegration('n8n Workflow Validation', () => {
    test('validates workflow execution with required fields', async () => {
      const result = await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_abc123def456',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('requires workflow_id for execution', async () => {
      const result = await n8nValidator.validate('execute_workflow', {
        data: { key: 'value' },
        // Missing workflow_id
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/workflow_id.*required/i);
    });

    test('validates data parameter structure', async () => {
      const invalidData = await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_123',
        data: 'not-an-object',
      });

      expect(invalidData.valid).toBe(false);
      expect(invalidData.errors.join(' ')).toMatch(/data.*object/i);

      const validData = await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_123',
        data: { input: 'value', count: 42 },
      });

      expect(validData.valid).toBe(true);
    });

    test('validates wait_for_completion as boolean', async () => {
      const invalid = await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_123',
        wait_for_completion: 'yes',
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.join(' ')).toMatch(/boolean/i);

      const valid = await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_123',
        wait_for_completion: true,
      });

      expect(valid.valid).toBe(true);
    });

    test('validates workflow creation with name', async () => {
      const result = await n8nValidator.validate('create_workflow', {
        name: 'Data Processing Workflow',
        nodes: [],
      });

      expect(result.valid).toBe(true);
    });

    test('requires workflow name for creation', async () => {
      const result = await n8nValidator.validate('create_workflow', {
        nodes: [],
        // Missing name
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/name.*required/i);
    });

    test('validates node structure in workflow', async () => {
      const result = await n8nValidator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: [
          { id: 'node1', type: 'trigger', name: 'Webhook Trigger' },
          { id: 'node2', type: 'action', name: 'Send Email' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('validates credential requirements', async () => {
      const result = await n8nValidator.validate('execute_workflow', {
        workflow_id: 'wf_123',
        credentials: {
          http: 'cred_abc123',
        },
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('Supabase RLS Policy Validation', () => {
    test('validates SQL execution with required fields', async () => {
      const result = await supabaseValidator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'SELECT * FROM users WHERE id = $1',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('requires project_id for SQL execution', async () => {
      const result = await supabaseValidator.validate('execute_sql', {
        query: 'SELECT * FROM users',
        // Missing project_id
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/project_id.*required/i);
    });

    test('requires query for SQL execution', async () => {
      const result = await supabaseValidator.validate('execute_sql', {
        project_id: 'proj_abc123',
        // Missing query
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/query.*required/i);
    });

    test('blocks dangerous DROP operations in execute_sql', async () => {
      const dropTable = await supabaseValidator.validate('execute_sql', {
        project_id: 'proj_123',
        query: 'DROP TABLE users',
      });

      expect(dropTable.valid).toBe(false);
      expect(dropTable.errors.join(' ')).toMatch(/drop.*not allowed/i);

      const dropDatabase = await supabaseValidator.validate('execute_sql', {
        project_id: 'proj_123',
        query: 'DROP DATABASE mydb',
      });

      expect(dropDatabase.valid).toBe(false);
    });

    test('blocks DDL operations in execute_sql', async () => {
      const ddlOperations = [
        'CREATE TABLE test (id INT)',
        'ALTER TABLE users ADD COLUMN email TEXT',
        'CREATE INDEX idx_email ON users(email)',
        'DROP INDEX idx_email',
      ];

      for (const query of ddlOperations) {
        const result = await supabaseValidator.validate('execute_sql', {
          project_id: 'proj_123',
          query,
        });

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toMatch(/ddl.*migration/i);
      }
    });

    test('allows DML operations in execute_sql', async () => {
      const dmlOperations = [
        'SELECT * FROM users',
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        'UPDATE users SET email = $1 WHERE id = $2',
        'DELETE FROM users WHERE id = $1',
      ];

      for (const query of dmlOperations) {
        const result = await supabaseValidator.validate('execute_sql', {
          project_id: 'proj_123',
          query,
        });

        expect(result.valid).toBe(true);
      }
    });

    test('validates migration creation with required fields', async () => {
      const result = await supabaseValidator.validate('apply_migration', {
        project_id: 'proj_123',
        name: 'add_users_table',
        query: 'CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);',
      });

      expect(result.valid).toBe(true);
    });

    test('requires migration name in snake_case format', async () => {
      const invalid = await supabaseValidator.validate('apply_migration', {
        project_id: 'proj_123',
        name: 'Add Users Table',
        query: 'CREATE TABLE users (id INT);',
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.join(' ')).toMatch(/snake_case/i);

      const valid = await supabaseValidator.validate('apply_migration', {
        project_id: 'proj_123',
        name: 'add_users_table',
        query: 'CREATE TABLE users (id INT);',
      });

      expect(valid.valid).toBe(true);
    });

    test('validates RLS policy syntax', async () => {
      const result = await supabaseValidator.validate('apply_migration', {
        project_id: 'proj_123',
        name: 'add_rls_policy',
        query: `
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          CREATE POLICY user_select_own ON users FOR SELECT USING (auth.uid() = user_id);
        `,
      });

      expect(result.valid).toBe(true);
    });

    test('validates project reference format', async () => {
      const result = await supabaseValidator.validate('execute_sql', {
        project_id: 'invalid_format',
        query: 'SELECT 1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/project_id.*format/i);
    });
  });

  describeIntegration('Cross-Tool Validation Consistency', () => {
    test('all validators return consistent error format', async () => {
      const results = await Promise.all([
        clickupValidator.validate('create_task', {}),
        googleValidator.validate('create_file', {}),
        n8nValidator.validate('execute_workflow', {}),
        supabaseValidator.validate('execute_sql', {}),
      ]);

      results.forEach(result => {
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
        expect(typeof result.valid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
      });
    });

    test('all validators handle empty args gracefully', async () => {
      const results = await Promise.all([
        clickupValidator.validate('create_task', {}),
        googleValidator.validate('create_file', {}),
        n8nValidator.validate('execute_workflow', {}),
        supabaseValidator.validate('execute_sql', {}),
      ]);

      results.forEach(result => {
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('all validators handle null/undefined args gracefully', async () => {
      const operations = [
        clickupValidator.validate('create_task', null),
        googleValidator.validate('create_file', undefined),
        n8nValidator.validate('execute_workflow', null),
        supabaseValidator.validate('execute_sql', undefined),
      ];

      for (const operation of operations) {
        await expect(operation).resolves.toBeDefined();
      }
    });
  });
});
