// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * ClickUp Tool Helpers Test Suite
 *
 * Tests all 7 helpers defined in clickup.yaml:
 * 1. extract-custom-field
 * 2. format-assignee-for-create
 * 3. format-assignee-for-update
 * 4. parse-webhook-type
 * 5. extract-webhook-payload
 * 6. calculate-time-tracking-total
 * 7. format-custom-field-update
 */
describeIntegration('ClickUp Tool Helpers', () => {
  let executor;
  let clickupTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve ClickUp tool
    clickupTool = await toolResolver.resolveTool('clickup');

    // Create executor instance
    executor = new ToolHelperExecutor(clickupTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should have executable_knowledge with helpers', () => {
      expect(clickupTool.executable_knowledge).toBeDefined();
      expect(clickupTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(clickupTool.executable_knowledge.helpers)).toBe(true);
      expect(clickupTool.executable_knowledge.helpers.length).toBe(7);
    });

    test('should have all required helper IDs', () => {
      const helperIds = clickupTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('extract-custom-field');
      expect(helperIds).toContain('format-assignee-for-create');
      expect(helperIds).toContain('format-assignee-for-update');
      expect(helperIds).toContain('parse-webhook-type');
      expect(helperIds).toContain('extract-webhook-payload');
      expect(helperIds).toContain('calculate-time-tracking-total');
      expect(helperIds).toContain('format-custom-field-update');
    });
  });

  describeIntegration('extract-custom-field', () => {
    test('should extract existing custom field by name', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {
          custom_fields: [
            { name: 'Priority', value: 'High' },
            { name: 'Estimate', value: 1000 },
          ],
        },
        fieldName: 'Priority',
      });

      expect(result).toEqual({ name: 'Priority', value: 'High' });
    });

    test('should return null for non-existent field', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {
          custom_fields: [
            { name: 'Priority', value: 'High' },
          ],
        },
        fieldName: 'NonExistent',
      });

      expect(result).toBeNull();
    });

    test('should return null if response missing custom_fields', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {},
        fieldName: 'Priority',
      });

      expect(result).toBeNull();
    });

    test('should return null if response is null', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: null,
        fieldName: 'Priority',
      });

      expect(result).toBeNull();
    });

    test('should handle multiple fields with same type', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {
          custom_fields: [
            { name: 'Field1', value: 'A' },
            { name: 'Field2', value: 'B' },
            { name: 'Field3', value: 'C' },
          ],
        },
        fieldName: 'Field2',
      });

      expect(result).toEqual({ name: 'Field2', value: 'B' });
    });
  });

  describeIntegration('format-assignee-for-create', () => {
    test('should return array as-is', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: [456, 789],
      });

      expect(result).toEqual([456, 789]);
    });

    test('should convert single number to array', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: 456,
      });

      expect(result).toEqual([456]);
    });

    test('should return empty array if assignees is null', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: null,
      });

      expect(result).toEqual([]);
    });

    test('should return empty array if assignees is undefined', async () => {
      const result = await executor.execute('format-assignee-for-create', {});

      expect(result).toEqual([]);
    });

    test('should return empty array for invalid types', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: 'invalid',
      });

      expect(result).toEqual([]);
    });
  });

  describeIntegration('format-assignee-for-update', () => {
    test('should format with both add and remove arrays', async () => {
      const result = await executor.execute('format-assignee-for-update', {
        add: [999, 888],
        remove: [456],
      });

      expect(result).toEqual({
        add: [999, 888],
        rem: [456],
      });
    });

    test('should format with only add', async () => {
      const result = await executor.execute('format-assignee-for-update', {
        add: [111, 222],
      });

      expect(result).toEqual({
        add: [111, 222],
      });
    });

    test('should format with only remove', async () => {
      const result = await executor.execute('format-assignee-for-update', {
        remove: [333],
      });

      expect(result).toEqual({
        rem: [333],
      });
    });

    test('should convert single number add to array', async () => {
      const result = await executor.execute('format-assignee-for-update', {
        add: 999,
      });

      expect(result).toEqual({
        add: [999],
      });
    });

    test('should convert single number remove to array', async () => {
      const result = await executor.execute('format-assignee-for-update', {
        remove: 456,
      });

      expect(result).toEqual({
        rem: [456],
      });
    });

    test('should return empty object if no add or remove', async () => {
      const result = await executor.execute('format-assignee-for-update', {});

      expect(result).toEqual({});
    });
  });

  describeIntegration('parse-webhook-type', () => {
    test('should detect standard webhook (event field)', async () => {
      const result = await executor.execute('parse-webhook-type', {
        payload: {
          event: 'taskCreated',
          payload: {},
        },
      });

      expect(result).toBe('standard');
    });

    test('should detect webhook_variant (webhook_id field)', async () => {
      const result = await executor.execute('parse-webhook-type', {
        payload: {
          webhook_id: 'abc123',
          data: {},
        },
      });

      expect(result).toBe('webhook_variant');
    });

    test('should detect history_items format', async () => {
      const result = await executor.execute('parse-webhook-type', {
        payload: {
          history_items: [
            { field: 'status', before: 'todo', after: 'done' },
          ],
        },
      });

      expect(result).toBe('history_items');
    });

    test('should return unknown for invalid payload', async () => {
      const result = await executor.execute('parse-webhook-type', {
        payload: {
          random_field: 'value',
        },
      });

      expect(result).toBe('unknown');
    });

    test('should return unknown for null payload', async () => {
      const result = await executor.execute('parse-webhook-type', {
        payload: null,
      });

      expect(result).toBe('unknown');
    });

    test('should prioritize event field if multiple exist', async () => {
      const result = await executor.execute('parse-webhook-type', {
        payload: {
          event: 'taskCreated',
          webhook_id: 'abc123',
        },
      });

      expect(result).toBe('standard');
    });
  });

  describeIntegration('extract-webhook-payload', () => {
    test('should extract from standard format', async () => {
      const result = await executor.execute('extract-webhook-payload', {
        webhook: {
          event: 'taskCreated',
          payload: { task: { id: '123' } },
        },
      });

      expect(result).toEqual({ task: { id: '123' } });
    });

    test('should extract from webhook_variant format', async () => {
      const result = await executor.execute('extract-webhook-payload', {
        webhook: {
          webhook_id: 'abc123',
          data: {
            webhook: {
              payload: { task: { id: '456' } },
            },
          },
        },
      });

      expect(result).toEqual({ task: { id: '456' } });
    });

    test('should extract from history_items format', async () => {
      const historyItems = {
        history_items: [
          { field: 'status', before: 'todo', after: 'done' },
        ],
      };

      const result = await executor.execute('extract-webhook-payload', {
        webhook: historyItems,
      });

      expect(result).toEqual(historyItems);
    });

    test('should return null for unrecognized format', async () => {
      const result = await executor.execute('extract-webhook-payload', {
        webhook: {
          random_field: 'value',
        },
      });

      expect(result).toBeNull();
    });

    test('should return null if webhook is null', async () => {
      const result = await executor.execute('extract-webhook-payload', {
        webhook: null,
      });

      expect(result).toBeNull();
    });

    test('should handle nested webhook data correctly', async () => {
      const result = await executor.execute('extract-webhook-payload', {
        webhook: {
          webhook_id: 'xyz789',
          data: {
            webhook: {
              payload: {
                task: {
                  id: '789',
                  name: 'Test Task',
                  status: { status: 'in progress' },
                },
              },
            },
          },
        },
      });

      expect(result.task.id).toBe('789');
      expect(result.task.name).toBe('Test Task');
    });
  });

  describeIntegration('calculate-time-tracking-total', () => {
    test('should sum time entries', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: [
          { duration: 3600000 },
          { duration: 1800000 },
          { duration: 900000 },
        ],
      });

      expect(result).toBe(6300000);
    });

    test('should handle single entry', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: [
          { duration: 5000 },
        ],
      });

      expect(result).toBe(5000);
    });

    test('should handle empty array', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: [],
      });

      expect(result).toBe(0);
    });

    test('should ignore entries without duration', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: [
          { duration: 1000 },
          { id: 'entry2' },
          { duration: 2000 },
        ],
      });

      expect(result).toBe(3000);
    });

    test('should return 0 for null timeEntries', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: null,
      });

      expect(result).toBe(0);
    });

    test('should return 0 for non-array timeEntries', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: 'invalid',
      });

      expect(result).toBe(0);
    });

    test('should handle large duration values', async () => {
      const result = await executor.execute('calculate-time-tracking-total', {
        timeEntries: [
          { duration: 36000000 },
          { duration: 72000000 },
        ],
      });

      expect(result).toBe(108000000);
    });
  });

  describeIntegration('format-custom-field-update', () => {
    test('should format with id and value', async () => {
      const result = await executor.execute('format-custom-field-update', {
        fieldId: 'field-uuid-123',
        value: 'High Priority',
      });

      expect(result).toEqual({
        id: 'field-uuid-123',
        value: 'High Priority',
      });
    });

    test('should handle numeric value', async () => {
      const result = await executor.execute('format-custom-field-update', {
        fieldId: 'field-uuid-456',
        value: 1000,
      });

      expect(result).toEqual({
        id: 'field-uuid-456',
        value: 1000,
      });
    });

    test('should handle boolean value', async () => {
      const result = await executor.execute('format-custom-field-update', {
        fieldId: 'field-uuid-789',
        value: true,
      });

      expect(result).toEqual({
        id: 'field-uuid-789',
        value: true,
      });
    });

    test('should handle null value', async () => {
      const result = await executor.execute('format-custom-field-update', {
        fieldId: 'field-uuid-abc',
        value: null,
      });

      expect(result).toEqual({
        id: 'field-uuid-abc',
        value: null,
      });
    });

    test('should handle array value', async () => {
      const result = await executor.execute('format-custom-field-update', {
        fieldId: 'field-uuid-def',
        value: ['option1', 'option2'],
      });

      expect(result).toEqual({
        id: 'field-uuid-def',
        value: ['option1', 'option2'],
      });
    });

    test('should handle object value', async () => {
      const result = await executor.execute('format-custom-field-update', {
        fieldId: 'field-uuid-ghi',
        value: { nested: 'object' },
      });

      expect(result).toEqual({
        id: 'field-uuid-ghi',
        value: { nested: 'object' },
      });
    });
  });

  describeIntegration('Helper Performance', () => {
    test('helper execution should complete in <100ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('format-assignee-for-create', {
          assignees: [456, 789],
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nClickUp Helper Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
    });

    test('complex helper should maintain performance', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('calculate-time-tracking-total', {
          timeEntries: [
            { duration: 3600000 },
            { duration: 1800000 },
            { duration: 900000 },
            { duration: 600000 },
          ],
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      expect(avgDuration).toBeLessThan(100);
    });
  });
});
