/**
 * @fileoverview Unit tests for WaveAnalyzer
 * @story WIS-4 - Wave Analysis Engine
 */

'use strict';

const {
  WaveAnalyzer,
  CircularDependencyError,
  createWaveAnalyzer,
  analyzeWaves,
  DEFAULT_TASK_DURATIONS,
} = require('../engine/wave-analyzer');

describe('WaveAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new WaveAnalyzer();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const instance = new WaveAnalyzer();
      expect(instance.taskDurations).toEqual(DEFAULT_TASK_DURATIONS);
    });

    it('should accept custom task durations', () => {
      const customDurations = { 'custom-task': 25 };
      const instance = new WaveAnalyzer({ taskDurations: customDurations });
      expect(instance.taskDurations['custom-task']).toBe(25);
      expect(instance.taskDurations['default']).toBe(DEFAULT_TASK_DURATIONS.default);
    });

    it('should accept custom registry', () => {
      const mockRegistry = { getWorkflow: jest.fn() };
      const instance = new WaveAnalyzer({ registry: mockRegistry });
      expect(instance.registry).toBe(mockRegistry);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build graph from tasks with dependencies', () => {
      const tasks = [
        { id: 'task-a', dependsOn: [] },
        { id: 'task-b', dependsOn: [] },
        { id: 'task-c', dependsOn: ['task-a', 'task-b'] },
        { id: 'task-d', dependsOn: ['task-c'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.size).toBe(4);
      expect(graph.nodes.has('task-a')).toBe(true);
      expect(graph.nodes.has('task-b')).toBe(true);
      expect(graph.nodes.has('task-c')).toBe(true);
      expect(graph.nodes.has('task-d')).toBe(true);

      // Check edges (a -> c, b -> c, c -> d)
      expect(graph.edges.get('task-a').has('task-c')).toBe(true);
      expect(graph.edges.get('task-b').has('task-c')).toBe(true);
      expect(graph.edges.get('task-c').has('task-d')).toBe(true);

      // Check in-edges
      expect(graph.inEdges.get('task-a').size).toBe(0);
      expect(graph.inEdges.get('task-b').size).toBe(0);
      expect(graph.inEdges.get('task-c').size).toBe(2);
      expect(graph.inEdges.get('task-d').size).toBe(1);
    });

    it('should handle tasks without dependencies', () => {
      const tasks = [{ id: 'task-a' }, { id: 'task-b' }, { id: 'task-c' }];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.size).toBe(3);
      expect(graph.edges.get('task-a').size).toBe(0);
      expect(graph.edges.get('task-b').size).toBe(0);
      expect(graph.edges.get('task-c').size).toBe(0);
    });

    it('should use task name if id is missing', () => {
      const tasks = [{ name: 'task-a' }, { name: 'task-b', dependsOn: ['task-a'] }];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.has('task-a')).toBe(true);
      expect(graph.nodes.has('task-b')).toBe(true);
      expect(graph.edges.get('task-a').has('task-b')).toBe(true);
    });

    it('should ignore dependencies to non-existent nodes', () => {
      const tasks = [{ id: 'task-a', dependsOn: ['non-existent'] }];

      const graph = analyzer.buildDependencyGraph(tasks);

      expect(graph.nodes.size).toBe(1);
      expect(graph.inEdges.get('task-a').size).toBe(0);
    });
  });

  describe('findCycle', () => {
    it('should return null for acyclic graph', () => {
      const tasks = [
        { id: 'a', dependsOn: [] },
        { id: 'b', dependsOn: ['a'] },
        { id: 'c', dependsOn: ['b'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).toBeNull();
    });

    it('should detect simple cycle', () => {
      const tasks = [
        { id: 'a', dependsOn: ['c'] },
        { id: 'b', dependsOn: ['a'] },
        { id: 'c', dependsOn: ['b'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).not.toBeNull();
      expect(cycle.length).toBeGreaterThan(1);
    });

    it('should detect self-loop', () => {
      const tasks = [{ id: 'a', dependsOn: ['a'] }];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).not.toBeNull();
      expect(cycle).toContain('a');
    });

    it('should detect cycle in diamond pattern with back-edge', () => {
      const tasks = [
        { id: 'a', dependsOn: ['d'] }, // Creates cycle: a -> b -> d -> a
        { id: 'b', dependsOn: ['a'] },
        { id: 'c', dependsOn: ['a'] },
        { id: 'd', dependsOn: ['b', 'c'] },
      ];

      const graph = analyzer.buildDependencyGraph(tasks);
      const cycle = analyzer.findCycle(graph);

      expect(cycle).not.toBeNull();
    });
  });

  describe('analyzeWaves with customTasks', () => {
    it('should group independent tasks into same wave', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: [], duration: 3 },
        { id: 'c', dependsOn: [], duration: 4 },
      ];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      expect(result.waves.length).toBe(1);
      expect(result.waves[0].tasks).toEqual(expect.arrayContaining(['a', 'b', 'c']));
      expect(result.waves[0].parallel).toBe(true);
    });

    it('should create sequential waves for linear dependencies', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: ['a'], duration: 10 },
        { id: 'c', dependsOn: ['b'], duration: 3 },
        { id: 'd', dependsOn: ['c'], duration: 7 },
      ];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      expect(result.waves.length).toBe(4);
      expect(result.waves[0].tasks).toEqual(['a']);
      expect(result.waves[1].tasks).toEqual(['b']);
      expect(result.waves[2].tasks).toEqual(['c']);
      expect(result.waves[3].tasks).toEqual(['d']);
    });

    it('should handle diamond dependency pattern', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: ['a'], duration: 10 },
        { id: 'c', dependsOn: ['a'], duration: 8 },
        { id: 'd', dependsOn: ['b', 'c'], duration: 5 },
      ];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      expect(result.waves.length).toBe(3);
      expect(result.waves[0].tasks).toEqual(['a']);
      expect(result.waves[1].tasks).toEqual(expect.arrayContaining(['b', 'c']));
      expect(result.waves[1].parallel).toBe(true);
      expect(result.waves[2].tasks).toEqual(['d']);
    });

    it('should handle mixed parallel and sequential', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: [], duration: 3 },
        { id: 'c', dependsOn: ['a'], duration: 10 },
        { id: 'd', dependsOn: ['b'], duration: 8 },
        { id: 'e', dependsOn: ['c', 'd'], duration: 5 },
      ];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      expect(result.waves.length).toBe(3);
      expect(result.waves[0].tasks).toEqual(expect.arrayContaining(['a', 'b']));
      expect(result.waves[1].tasks).toEqual(expect.arrayContaining(['c', 'd']));
      expect(result.waves[2].tasks).toEqual(['e']);
    });

    it('should calculate optimization gain', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 10 },
        { id: 'b', dependsOn: [], duration: 10 },
        { id: 'c', dependsOn: ['a', 'b'], duration: 10 },
      ];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      // Sequential: 10 + 10 + 10 = 30min
      // Parallel: 10 (wave 1: a,b parallel) + 10 (wave 2: c) = 20min
      // Gain: (30 - 20) / 30 = 33%
      expect(result.optimizationGain).toBe('33%');
    });

    it('should return empty result for empty tasks', () => {
      const result = analyzer.analyzeWaves('test-workflow', { customTasks: [] });

      expect(result.totalTasks).toBe(0);
      expect(result.waves).toEqual([]);
      expect(result.criticalPath).toEqual([]);
    });

    it('should handle single task workflow', () => {
      const tasks = [{ id: 'a', dependsOn: [], duration: 5 }];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      expect(result.totalTasks).toBe(1);
      expect(result.waves.length).toBe(1);
      expect(result.waves[0].parallel).toBe(false);
    });

    it('should throw CircularDependencyError for cycles', () => {
      const tasks = [
        { id: 'a', dependsOn: ['c'], duration: 5 },
        { id: 'b', dependsOn: ['a'], duration: 5 },
        { id: 'c', dependsOn: ['b'], duration: 5 },
      ];

      expect(() => {
        analyzer.analyzeWaves('test-workflow', { customTasks: tasks });
      }).toThrow(CircularDependencyError);
    });
  });

  describe('CircularDependencyError', () => {
    it('should contain cycle information', () => {
      const cycle = ['a', 'b', 'c', 'a'];
      const error = new CircularDependencyError(cycle);

      expect(error.name).toBe('CircularDependencyError');
      expect(error.cycle).toEqual(cycle);
      expect(error.message).toContain('a → b → c → a');
    });

    it('should provide resolution suggestion', () => {
      const cycle = ['a', 'b', 'c', 'a'];
      const error = new CircularDependencyError(cycle);

      const suggestion = error.getSuggestion();
      expect(suggestion).toBeTruthy();
      expect(typeof suggestion).toBe('string');
    });
  });

  describe('critical path calculation', () => {
    it('should find longest path in graph', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: ['a'], duration: 20 },
        { id: 'c', dependsOn: ['a'], duration: 3 },
        { id: 'd', dependsOn: ['b', 'c'], duration: 5 },
      ];

      const result = analyzer.analyzeWaves('test-workflow', { customTasks: tasks });

      // Critical path should be a -> b -> d (5 + 20 + 5 = 30)
      // Not a -> c -> d (5 + 3 + 5 = 13)
      expect(result.criticalPath).toEqual(expect.arrayContaining(['a', 'b', 'd']));
    });

    it('should return empty for empty workflow', () => {
      const result = analyzer.analyzeWaves('test-workflow', { customTasks: [] });
      expect(result.criticalPath).toEqual([]);
    });
  });

  describe('getCurrentWave', () => {
    it('should return current wave context for task', () => {
      // Mock the analyzeWaves to return predictable result
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: ['a'], duration: 10 },
        { id: 'c', dependsOn: ['b'], duration: 5 },
      ];

      const context = analyzer.getCurrentWave('test-workflow', 'b');

      // Since we can't easily mock, this tests the error handling path
      expect(context.workflowId).toBe('test-workflow');
      expect(context.currentTask).toBe('b');
    });
  });

  describe('formatOutput', () => {
    const mockAnalysis = {
      workflowId: 'test',
      totalTasks: 3,
      waves: [
        { waveNumber: 1, tasks: ['a', 'b'], parallel: true, estimatedDuration: '5min' },
        { waveNumber: 2, tasks: ['c'], parallel: false, estimatedDuration: '10min' },
      ],
      optimizationGain: '25%',
      criticalPath: ['a', 'c'],
      metrics: {
        sequentialTime: '20min',
        parallelTime: '15min',
      },
    };

    it('should format as JSON when json option is true', () => {
      const output = analyzer.formatOutput(mockAnalysis, { json: true });

      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed.workflowId).toBe('test');
    });

    it('should include visual representation when visual option is true', () => {
      const output = analyzer.formatOutput(mockAnalysis, { visual: true });

      expect(output).toContain('Wave 1');
      expect(output).toContain('──');
    });

    it('should include optimization metrics', () => {
      const output = analyzer.formatOutput(mockAnalysis);

      expect(output).toContain('25%');
      expect(output).toContain('Critical Path');
    });
  });

  describe('performance', () => {
    it('should analyze small workflow in <10ms', () => {
      const tasks = Array.from({ length: 5 }, (_, i) => ({
        id: `task-${i}`,
        dependsOn: i > 0 ? [`task-${i - 1}`] : [],
        duration: 5,
      }));

      const start = Date.now();
      const result = analyzer.analyzeWaves('perf-test', { customTasks: tasks });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(10);
      expect(result.metrics.analysisTime).toBeLessThan(10);
    });

    it('should analyze medium workflow in <30ms', () => {
      const tasks = Array.from({ length: 20 }, (_, i) => ({
        id: `task-${i}`,
        dependsOn: i > 0 ? [`task-${Math.floor(i / 2)}`] : [],
        duration: 5,
      }));

      const start = Date.now();
      const result = analyzer.analyzeWaves('perf-test', { customTasks: tasks });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(30);
    });

    it('should analyze large workflow in <50ms', () => {
      const tasks = Array.from({ length: 50 }, (_, i) => ({
        id: `task-${i}`,
        dependsOn: i > 0 ? [`task-${Math.max(0, i - 3)}`] : [],
        duration: 5,
      }));

      const start = Date.now();
      const result = analyzer.analyzeWaves('perf-test', { customTasks: tasks });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(50);
    });
  });
});

describe('Factory functions', () => {
  describe('createWaveAnalyzer', () => {
    it('should create WaveAnalyzer instance', () => {
      const instance = createWaveAnalyzer();
      expect(instance).toBeInstanceOf(WaveAnalyzer);
    });

    it('should pass options to constructor', () => {
      const customDurations = { custom: 15 };
      const instance = createWaveAnalyzer({ taskDurations: customDurations });
      expect(instance.taskDurations.custom).toBe(15);
    });
  });

  describe('analyzeWaves convenience function', () => {
    it('should analyze waves without creating instance manually', () => {
      const tasks = [
        { id: 'a', dependsOn: [], duration: 5 },
        { id: 'b', dependsOn: ['a'], duration: 10 },
      ];

      const result = analyzeWaves('test', { customTasks: tasks });

      expect(result.workflowId).toBe('test');
      expect(result.waves.length).toBe(2);
    });
  });
});

describe('DEFAULT_TASK_DURATIONS', () => {
  it('should have expected default durations', () => {
    expect(DEFAULT_TASK_DURATIONS.implement).toBe(30);
    expect(DEFAULT_TASK_DURATIONS['write-tests']).toBe(10);
    expect(DEFAULT_TASK_DURATIONS.default).toBe(10);
  });
});
