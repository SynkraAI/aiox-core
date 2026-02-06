/**
 * Project Adapter Unit Tests
 *
 * Tests for the ProjectAdapter class that wraps ClickUp service.
 *
 * @story STORY-10.6
 */

// Mock ClickUp service before requiring adapter
jest.mock('../../../../.aios-core/infrastructure/services/clickup', () => ({
  getTask: jest.fn().mockResolvedValue({ id: 'task-123', name: 'Test Task' }),
  createTask: jest.fn().mockResolvedValue({ id: 'new-task-id', name: 'New Task' }),
  updateTask: jest.fn().mockResolvedValue({ id: 'task-123', status: 'updated' }),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  updateStatus: jest.fn().mockResolvedValue({ id: 'task-123', status: 'in_progress' }),
  getStatuses: jest.fn().mockResolvedValue([
    { id: 'status-1', name: 'To Do' },
    { id: 'status-2', name: 'In Progress' },
    { id: 'status-3', name: 'Done' },
  ]),
  addComment: jest.fn().mockResolvedValue({ id: 'comment-123' }),
  getComments: jest.fn().mockResolvedValue([
    { id: 'comment-1', text: 'First comment' },
    { id: 'comment-2', text: 'Second comment' },
  ]),
  updateCustomField: jest.fn().mockResolvedValue({ id: 'task-123' }),
  getCustomFields: jest.fn().mockResolvedValue([
    { id: 'field-1', name: 'subject_name', type: 'text' },
    { id: 'field-2', name: 'sources_count', type: 'number' },
  ]),
}));

const { ProjectAdapter, createProjectAdapter } = require('../../adapters/project-adapter');

describe('ProjectAdapter', () => {
  let adapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = createProjectAdapter({
      silent: true,
      listId: 'test-list-id',
      workspaceId: 'test-workspace-id',
    });
  });

  describe('Factory Function', () => {
    it('should create adapter instance via factory', () => {
      const instance = createProjectAdapter();
      expect(instance).toBeInstanceOf(ProjectAdapter);
    });

    it('should accept options', () => {
      const instance = createProjectAdapter({
        silent: true,
        listId: 'my-list',
        workspaceId: 'my-workspace',
      });
      expect(instance.options.silent).toBe(true);
      expect(instance.options.listId).toBe('my-list');
      expect(instance.options.workspaceId).toBe('my-workspace');
    });

    it('should use environment variables as defaults', () => {
      const originalListId = process.env.CLICKUP_LIST_ID;
      const originalWorkspaceId = process.env.CLICKUP_WORKSPACE_ID;

      process.env.CLICKUP_LIST_ID = 'env-list-id';
      process.env.CLICKUP_WORKSPACE_ID = 'env-workspace-id';

      const instance = createProjectAdapter({});

      expect(instance.options.listId).toBe('env-list-id');
      expect(instance.options.workspaceId).toBe('env-workspace-id');

      // Restore
      process.env.CLICKUP_LIST_ID = originalListId;
      process.env.CLICKUP_WORKSPACE_ID = originalWorkspaceId;
    });
  });

  describe('Lazy Initialization', () => {
    it('should not initialize ClickUp service until accessed', () => {
      const freshAdapter = new ProjectAdapter({ silent: true });
      expect(freshAdapter._clickup).toBeNull();
    });

    it('should initialize service on first access', () => {
      const freshAdapter = new ProjectAdapter({ silent: true, listId: 'test' });
      expect(freshAdapter._clickup).toBeNull();

      // Access the service
      const service = freshAdapter.clickup;

      expect(freshAdapter._clickup).not.toBeNull();
      expect(service).toBeDefined();
    });

    it('should cache service instance', () => {
      const freshAdapter = new ProjectAdapter({ silent: true, listId: 'test' });
      const service1 = freshAdapter.clickup;
      const service2 = freshAdapter.clickup;

      expect(service1).toBe(service2);
    });
  });

  describe('Task Operations', () => {
    describe('getTask', () => {
      it('should get task by ID', async () => {
        const result = await adapter.getTask('task-123');

        expect(result).toHaveProperty('id', 'task-123');
        expect(result).toHaveProperty('name', 'Test Task');
        expect(adapter.clickup.getTask).toHaveBeenCalledWith('task-123');
      });
    });

    describe('createTask', () => {
      it('should create task with required fields', async () => {
        const taskData = { name: 'New Task', description: 'Task description' };
        const result = await adapter.createTask(taskData);

        expect(result).toHaveProperty('id', 'new-task-id');
        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'test-list-id',
          taskData,
        );
      });

      it('should throw without listId', async () => {
        // Clear environment variable to ensure no default listId
        const originalListId = process.env.CLICKUP_LIST_ID;
        delete process.env.CLICKUP_LIST_ID;

        const noListAdapter = createProjectAdapter({ silent: true });

        await expect(noListAdapter.createTask({ name: 'Test' }, {}))
          .rejects.toThrow('List ID required');

        // Restore
        if (originalListId) process.env.CLICKUP_LIST_ID = originalListId;
      });

      it('should use listId from options', async () => {
        const taskData = { name: 'Test Task' };
        await adapter.createTask(taskData, { listId: 'custom-list' });

        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'custom-list',
          taskData,
        );
      });

      it('should accept all task properties', async () => {
        const taskData = {
          name: 'Full Task',
          description: 'Description',
          status: 'In Progress',
          tags: ['tag1', 'tag2'],
        };

        await adapter.createTask(taskData);

        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'test-list-id',
          taskData,
        );
      });
    });

    describe('updateTask', () => {
      it('should update task', async () => {
        const updates = { name: 'Updated Name', status: 'Done' };
        const result = await adapter.updateTask('task-123', updates);

        expect(result).toHaveProperty('id', 'task-123');
        expect(adapter.clickup.updateTask).toHaveBeenCalledWith('task-123', updates);
      });
    });

    describe('deleteTask', () => {
      it('should delete task', async () => {
        await adapter.deleteTask('task-123');

        expect(adapter.clickup.deleteTask).toHaveBeenCalledWith('task-123');
      });
    });
  });

  describe('Status Management', () => {
    describe('updateStatus', () => {
      it('should update task status', async () => {
        const result = await adapter.updateStatus('task-123', 'In Progress');

        expect(result).toHaveProperty('status', 'in_progress');
        expect(adapter.clickup.updateStatus).toHaveBeenCalledWith(
          'task-123',
          'In Progress',
        );
      });
    });

    describe('getStatuses', () => {
      it('should get available statuses for list', async () => {
        const result = await adapter.getStatuses();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(3);
        expect(adapter.clickup.getStatuses).toHaveBeenCalledWith('test-list-id');
      });

      it('should accept custom listId', async () => {
        await adapter.getStatuses('custom-list');

        expect(adapter.clickup.getStatuses).toHaveBeenCalledWith('custom-list');
      });
    });
  });

  describe('Comments Management', () => {
    describe('addComment', () => {
      it('should add comment to task', async () => {
        const result = await adapter.addComment('task-123', 'New comment');

        expect(result).toHaveProperty('id', 'comment-123');
        expect(adapter.clickup.addComment).toHaveBeenCalledWith(
          'task-123',
          'New comment',
        );
      });
    });

    describe('getComments', () => {
      it('should get comments for task', async () => {
        const result = await adapter.getComments('task-123');

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(adapter.clickup.getComments).toHaveBeenCalledWith('task-123');
      });
    });
  });

  describe('Custom Fields', () => {
    describe('updateCustomField', () => {
      it('should update custom field', async () => {
        const result = await adapter.updateCustomField('task-123', 'field-1', 'value');

        expect(result).toHaveProperty('id', 'task-123');
        expect(adapter.clickup.updateCustomField).toHaveBeenCalledWith(
          'task-123',
          'field-1',
          'value',
        );
      });
    });

    describe('getCustomFields', () => {
      it('should get custom fields for list', async () => {
        const result = await adapter.getCustomFields();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(adapter.clickup.getCustomFields).toHaveBeenCalledWith('test-list-id');
      });

      it('should accept custom listId', async () => {
        await adapter.getCustomFields('custom-list');

        expect(adapter.clickup.getCustomFields).toHaveBeenCalledWith('custom-list');
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('batchCreateTasks', () => {
      it('should create multiple tasks', async () => {
        const tasks = [
          { name: 'Task 1' },
          { name: 'Task 2' },
          { name: 'Task 3' },
        ];

        const results = await adapter.batchCreateTasks(tasks);

        expect(results).toHaveLength(3);
        expect(adapter.clickup.createTask).toHaveBeenCalledTimes(3);
      });

      it('should continue on error when configured', async () => {
        adapter.clickup.createTask
          .mockResolvedValueOnce({ id: 'task-1' })
          .mockRejectedValueOnce(new Error('API Error'))
          .mockResolvedValueOnce({ id: 'task-3' });

        const tasks = [
          { name: 'Task 1' },
          { name: 'Task 2' },
          { name: 'Task 3' },
        ];

        const results = await adapter.batchCreateTasks(tasks, {
          continueOnError: true,
        });

        expect(results).toHaveLength(3);
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(false);
        expect(results[1].error).toBe('API Error');
        expect(results[2].success).toBe(true);
      });

      it('should throw on error when continueOnError is false', async () => {
        adapter.clickup.createTask.mockRejectedValue(new Error('API Error'));

        const tasks = [{ name: 'Task 1' }];

        await expect(adapter.batchCreateTasks(tasks, { continueOnError: false }))
          .rejects.toThrow('API Error');
      });

      it('should use custom listId', async () => {
        const tasks = [{ name: 'Task 1' }];

        await adapter.batchCreateTasks(tasks, { listId: 'custom-list' });

        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'custom-list',
          expect.any(Object),
        );
      });
    });

    describe('batchUpdateTasks', () => {
      it('should update multiple tasks', async () => {
        const updates = [
          { taskId: 'task-1', updates: { name: 'Updated 1' } },
          { taskId: 'task-2', updates: { name: 'Updated 2' } },
        ];

        const results = await adapter.batchUpdateTasks(updates);

        expect(results).toHaveLength(2);
        expect(adapter.clickup.updateTask).toHaveBeenCalledTimes(2);
      });

      it('should continue on error when configured', async () => {
        adapter.clickup.updateTask
          .mockResolvedValueOnce({ id: 'task-1' })
          .mockRejectedValueOnce(new Error('Update Error'));

        const updates = [
          { taskId: 'task-1', updates: { name: 'Updated 1' } },
          { taskId: 'task-2', updates: { name: 'Updated 2' } },
        ];

        const results = await adapter.batchUpdateTasks(updates, {
          continueOnError: true,
        });

        expect(results).toHaveLength(2);
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(false);
      });
    });
  });

  describe('MMOS-Specific Operations', () => {
    beforeEach(() => {
      // Reset mock to default success behavior after bulk operation tests
      adapter.clickup.createTask.mockReset();
      adapter.clickup.createTask.mockResolvedValue({ id: 'new-task-id', name: 'New Task' });
    });

    describe('createMindProject', () => {
      it('should create mind mapping project', async () => {
        const mindData = {
          subjectName: 'Test Subject',
          description: 'Test description',
          sources: ['source1', 'source2'],
        };

        const result = await adapter.createMindProject(mindData);

        expect(result).toHaveProperty('id');
        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'test-list-id',
          expect.objectContaining({
            name: 'Mind Mapping: Test Subject',
            description: 'Test description',
            tags: ['mmos', 'mind-mapping'],
          }),
        );
      });

      it('should handle missing sources', async () => {
        const mindData = {
          subjectName: 'Test Subject',
          description: 'Test description',
        };

        await adapter.createMindProject(mindData);

        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'test-list-id',
          expect.objectContaining({
            custom_fields: expect.arrayContaining([
              expect.objectContaining({ name: 'sources_count', value: 0 }),
            ]),
          }),
        );
      });

      it('should set sources count in custom fields', async () => {
        const mindData = {
          subjectName: 'Test Subject',
          description: 'Test description',
          sources: ['s1', 's2', 's3'],
        };

        await adapter.createMindProject(mindData);

        expect(adapter.clickup.createTask).toHaveBeenCalledWith(
          'test-list-id',
          expect.objectContaining({
            custom_fields: expect.arrayContaining([
              expect.objectContaining({ name: 'sources_count', value: 3 }),
            ]),
          }),
        );
      });
    });

    describe('updateMindProjectProgress', () => {
      it('should update project progress', async () => {
        const progress = {
          sourcesProcessed: 5,
          totalSources: 10,
          currentPhase: 'analysis',
        };

        const result = await adapter.updateMindProjectProgress('task-123', progress);

        expect(result).toBeDefined();
        expect(adapter.clickup.addComment).toHaveBeenCalledWith(
          'task-123',
          expect.stringContaining('Progress Update'),
        );
        expect(adapter.clickup.updateTask).toHaveBeenCalled();
      });

      it('should format progress comment correctly', async () => {
        const progress = {
          sourcesProcessed: 5,
          totalSources: 10,
          currentPhase: 'analysis',
        };

        await adapter.updateMindProjectProgress('task-123', progress);

        expect(adapter.clickup.addComment).toHaveBeenCalledWith(
          'task-123',
          expect.stringContaining('Sources: 5/10'),
        );
        expect(adapter.clickup.addComment).toHaveBeenCalledWith(
          'task-123',
          expect.stringContaining('Phase: analysis'),
        );
      });

      it('should handle missing progress fields', async () => {
        const progress = {};

        await adapter.updateMindProjectProgress('task-123', progress);

        expect(adapter.clickup.addComment).toHaveBeenCalledWith(
          'task-123',
          expect.stringContaining('Sources: 0/0'),
        );
        expect(adapter.clickup.addComment).toHaveBeenCalledWith(
          'task-123',
          expect.stringContaining('Phase: processing'),
        );
      });
    });
  });
});
