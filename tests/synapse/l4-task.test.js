/**
 * L4 Task Processor Tests
 *
 * Tests for task detection, context formatting, no-task handling,
 * graceful degradation, and metadata correctness.
 *
 * @story SYN-5 - Layer Processors L4-L7
 */

const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');
const L4TaskProcessor = require('../../.aiox-core/core/synapse/layers/l4-task');

jest.setTimeout(30000);

describe('L4TaskProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new L4TaskProcessor();
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to task', () => {
      expect(processor.name).toBe('task');
    });

    test('should set layer to 4', () => {
      expect(processor.layer).toBe(4);
    });

    test('should set timeout to 20ms', () => {
      expect(processor.timeout).toBe(20);
    });
  });

  describe('process()', () => {
    test('should return task context when task is active', () => {
      const context = {
        prompt: 'implement the feature',
        session: {
          active_task: {
            id: 'task-42',
            story: 'SYN-5',
            executor_type: 'dev',
            started_at: '2026-02-11',
          },
        },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toContain('Active Task: task-42');
      expect(result.rules).toContain('Story: SYN-5');
      expect(result.rules).toContain('Executor: dev');
      expect(result.metadata.layer).toBe(4);
      expect(result.metadata.taskId).toBe('task-42');
      expect(result.metadata.story).toBe('SYN-5');
      expect(result.metadata.executorType).toBe('dev');
    });

    test('should return null when no active task', () => {
      const context = {
        prompt: '',
        session: { active_task: null },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when session has no active_task', () => {
      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when active_task has no id', () => {
      const context = {
        prompt: '',
        session: { active_task: { story: 'SYN-5' } },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when active_task id is null', () => {
      const context = {
        prompt: '',
        session: { active_task: { id: null } },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should handle task with only id (no story or executor_type)', () => {
      const context = {
        prompt: '',
        session: {
          active_task: { id: 'task-99' },
        },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0]).toBe('Active Task: task-99');
      expect(result.metadata.taskId).toBe('task-99');
      expect(result.metadata.story).toBeNull();
      expect(result.metadata.executorType).toBeNull();
    });

    test('should include story but omit executor when executor_type is missing', () => {
      const context = {
        prompt: '',
        session: {
          active_task: { id: 'task-10', story: 'MIS-3' },
        },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toBe('Active Task: task-10');
      expect(result.rules[1]).toBe('Story: MIS-3');
    });

    test('should include executor but omit story when story is missing', () => {
      const context = {
        prompt: '',
        session: {
          active_task: { id: 'task-77', executor_type: 'qa' },
        },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toBe('Active Task: task-77');
      expect(result.rules[1]).toBe('Executor: qa');
    });

    test('should work with _safeProcess wrapper', () => {
      const context = {
        prompt: '',
        session: {
          active_task: { id: 'task-1', story: 'SYN-1', executor_type: 'dev' },
        },
        config: {
          synapsePath: '/tmp/synapse',
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor._safeProcess(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
    });
  });
});
