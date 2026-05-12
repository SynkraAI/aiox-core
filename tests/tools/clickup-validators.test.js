// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * ClickUp Tool Validators Test Suite
 *
 * Tests all 7 validators defined in clickup.yaml:
 * 1. validate-assignee-format (create_task)
 * 2. validate-custom-field-structure (create_task)
 * 3. validate-task-update-assignees (update_task)
 * 4. validate-webhook-payload (parse_webhook)
 * 5. validate-list-id-format (create_task)
 * 6. validate-priority-range (create_task)
 * 7. validate-time-estimate (create_task)
 */
describeIntegration('ClickUp Tool Validators', () => {
  let validator;
  let clickupTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve ClickUp tool
    clickupTool = await toolResolver.resolveTool('clickup');

    // Create validator instance
    validator = new ToolValidationHelper(clickupTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve clickup tool from aiox-core/tools/mcp', async () => {
      expect(clickupTool).toBeDefined();
      expect(clickupTool.id).toBe('clickup');
      expect(clickupTool.type).toBe('mcp');
      expect(clickupTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(clickupTool.executable_knowledge).toBeDefined();
      expect(clickupTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(clickupTool.executable_knowledge.validators)).toBe(true);
      expect(clickupTool.executable_knowledge.validators.length).toBe(3);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = clickupTool.executable_knowledge.validators.map(v => v.id);
      expect(validatorIds).toContain('validate-create-task');
      expect(validatorIds).toContain('validate-update-task');
      expect(validatorIds).toContain('validate-webhook-payload');
    });
  });

  describeIntegration('validate-assignee-format (create_task)', () => {
    test('should pass with valid array format', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: [456, 789],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail with object format (wrong for create)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: { add: [456] },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('assignees must be array for create_task, got object');
    });

    test('should fail without required name field', async () => {
      const result = await validator.validate('create_task', {
        list_id: '123456789',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    test('should fail without required list_id field', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('list_id is required');
    });

    test('should pass without assignees (optional field)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-custom-field-structure (create_task)', () => {
    test('should pass with valid custom fields array', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { id: 'field-uuid-1', value: 'High' },
          { id: 'field-uuid-2', value: 1000 },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('should fail if custom_fields is not an array', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: 'field-value',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('custom_fields must be an array');
    });

    test('should fail if custom field missing id', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { value: 'High' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing required 'id' field");
    });

    test('should fail if custom field missing value', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { id: 'field-uuid-1' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing required 'value' field");
    });

    test('should pass without custom_fields (optional)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-task-update-assignees (update_task)', () => {
    test('should pass with valid object format {add, rem}', async () => {
      const result = await validator.validate('update_task', {
        assignees: {
          add: [999],
          rem: [456],
        },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with only add array', async () => {
      const result = await validator.validate('update_task', {
        assignees: {
          add: [111, 222],
        },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with only rem array', async () => {
      const result = await validator.validate('update_task', {
        assignees: {
          rem: [333],
        },
      });

      expect(result.valid).toBe(true);
    });

    test('should fail with array format (wrong for update)', async () => {
      const result = await validator.validate('update_task', {
        assignees: [999],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('assignees must be object {add: [], rem: []} for update_task, got array');
    });

    test('should fail if add is not an array', async () => {
      const result = await validator.validate('update_task', {
        assignees: {
          add: 999,
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('assignees.add must be an array');
    });

    test('should fail if rem is not an array', async () => {
      const result = await validator.validate('update_task', {
        assignees: {
          rem: 456,
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('assignees.rem must be an array');
    });

    test('should pass without assignees (optional)', async () => {
      const result = await validator.validate('update_task', {
        name: 'Updated Task',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-webhook-payload (parse_webhook)', () => {
    test('should pass with standard webhook format (event field)', async () => {
      const result = await validator.validate('parse_webhook', {
        event: 'taskCreated',
        payload: { task: {} },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with webhook_variant format (webhook_id field)', async () => {
      const result = await validator.validate('parse_webhook', {
        webhook_id: 'abc123',
        data: { webhook: { payload: {} } },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with history_items format', async () => {
      const result = await validator.validate('parse_webhook', {
        history_items: [
          { field: 'status', before: 'todo', after: 'in progress' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without payload parameter', async () => {
      const result = await validator.validate('parse_webhook', {});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid webhook payload: missing event, webhook_id, or history_items');
    });

    test('should fail with invalid webhook payload (missing all identification fields)', async () => {
      const result = await validator.validate('parse_webhook', {
        random_field: 'value',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid webhook payload: missing event, webhook_id, or history_items');
    });
  });

  describeIntegration('validate-list-id-format (create_task)', () => {
    test('should pass with numeric string list_id', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with numeric string listId (alternative field name)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        listId: '987654321',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail with non-numeric list_id', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: 'invalid-id',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('list_id must be a numeric string');
    });

    test('should fail with alphanumeric list_id', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: 'abc123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('list_id must be a numeric string');
    });

    test('should pass without list_id if not provided (validated elsewhere)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
      });

      // This specific validator only checks format IF list_id exists
      // The validate-assignee-format validator checks for required fields
      expect(result.valid).toBe(false); // Will fail from assignee validator's required check
    });
  });

  describeIntegration('validate-priority-range (create_task)', () => {
    test('should pass with valid priority 1 (urgent)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 1,
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with valid priority 4 (low)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 4,
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with priority 2', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 2,
      });

      expect(result.valid).toBe(true);
    });

    test('should fail with priority 0 (below range)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('priority must be between 1 (urgent) and 4 (low)');
    });

    test('should fail with priority 5 (above range)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 5,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('priority must be between 1 (urgent) and 4 (low)');
    });

    test('should fail with non-numeric priority', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 'high',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('priority must be between 1 (urgent) and 4 (low)');
    });

    test('should pass without priority (optional)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-time-estimate (create_task)', () => {
    test('should pass with valid time estimate (positive number)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        time_estimate: 3600000,
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with zero time estimate', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        time_estimate: 0,
      });

      expect(result.valid).toBe(true);
    });

    test('should fail with negative time estimate', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        time_estimate: -1000,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('time_estimate must be a positive number (milliseconds)');
    });

    test('should fail with non-numeric time estimate', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        time_estimate: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('time_estimate must be a positive number (milliseconds)');
    });

    test('should pass without time_estimate (optional)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('Validator Performance', () => {
    test('validation should complete in <50ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await validator.validate('create_task', {
          name: 'Performance Test',
          list_id: '123456789',
          assignees: [456],
          priority: 2,
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nClickUp Validator Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(50);
    });
  });
});
