/**
 * @module WaveAnalyzer
 * @description Wave Analysis Engine for parallel task execution detection
 * @story WIS-4 - Wave Analysis Engine
 * @version 1.0.0
 *
 * @example
 * const { WaveAnalyzer } = require('./wave-analyzer');
 * const analyzer = new WaveAnalyzer();
 *
 * const result = analyzer.analyzeWaves('story_development');
 * console.log(result.waves); // [{ waveNumber: 1, tasks: [...], parallel: true }, ...]
 */

'use strict';

/**
 * Custom error class for circular dependency detection
 */
class CircularDependencyError extends Error {
  /**
   * Create a CircularDependencyError
   * @param {string[]} cycle - Array of task names forming the cycle
   */
  constructor(cycle) {
    super(`Circular dependency detected: ${cycle.join(' → ')}`);
    this.name = 'CircularDependencyError';
    this.cycle = cycle;
  }

  /**
   * Get a suggested resolution for the circular dependency
   * @returns {string} Resolution suggestion
   */
  getSuggestion() {
    if (this.cycle.length < 2) {
      return 'Remove the self-referencing dependency';
    }
    const _lastEdge = `${this.cycle[this.cycle.length - 2]} → ${this.cycle[this.cycle.length - 1]}`;
    return `Consider removing the dependency from ${this.cycle[this.cycle.length - 1]} to ${this.cycle[0]}`;
  }
}

/**
 * Default task duration estimates (in minutes)
 * @type {Object}
 */
const DEFAULT_TASK_DURATIONS = {
  'read-story': 5,
  'setup-branch': 2,
  implement: 30,
  'write-tests': 10,
  'update-docs': 5,
  'run-tests': 5,
  'review-qa': 15,
  'apply-qa-fixes': 10,
  default: 10,
};

/**
 * WaveAnalyzer class for detecting parallel execution opportunities
 */
class WaveAnalyzer {
  /**
   * Create a WaveAnalyzer instance
   * @param {Object} options - Configuration options
   * @param {Object} options.registry - WorkflowRegistry instance (optional)
   * @param {Object} options.taskDurations - Custom task duration estimates
   */
  constructor(options = {}) {
    this.registry = options.registry || null;
    this.taskDurations = { ...DEFAULT_TASK_DURATIONS, ...options.taskDurations };

    // Lazy-loaded registry
    this._registryModule = null;
  }

  /**
   * Get the workflow registry (lazy-loaded)
   * @returns {Object} WorkflowRegistry instance
   * @private
   */
  _getRegistry() {
    if (this.registry) {
      return this.registry;
    }

    if (!this._registryModule) {
      try {
        const { createWorkflowRegistry } = require('../registry/workflow-registry');
        this._registryModule = createWorkflowRegistry();
      } catch (error) {
        throw new Error(`Failed to load WorkflowRegistry: ${error.message}`);
      }
    }

    return this._registryModule;
  }

  /**
   * Analyze waves for a workflow
   * @param {string} workflowId - Workflow identifier
   * @param {Object} options - Analysis options
   * @param {Object} options.customTasks - Custom task definitions with dependencies
   * @returns {Object} Wave analysis result
   */
  analyzeWaves(workflowId, options = {}) {
    const startTime = Date.now();

    // Get workflow definition
    const workflow = this._getWorkflowTasks(workflowId, options);

    if (!workflow || !workflow.tasks || workflow.tasks.length === 0) {
      return {
        workflowId,
        totalTasks: 0,
        waves: [],
        optimizationGain: '0%',
        criticalPath: [],
        analysisTime: Date.now() - startTime,
      };
    }

    // Build dependency graph
    const graph = this.buildDependencyGraph(workflow.tasks);

    // Check for cycles
    const cycle = this.findCycle(graph);
    if (cycle) {
      throw new CircularDependencyError(cycle);
    }

    // Perform wave analysis using Kahn's algorithm
    const waves = this._kahnWaveAnalysis(graph);

    // Calculate metrics
    const criticalPath = this._findCriticalPath(graph, waves);
    const sequentialTime = this._calculateSequentialTime(workflow.tasks);
    const parallelTime = this._calculateParallelTime(waves);
    const optimizationGain = this._calculateOptimizationGain(sequentialTime, parallelTime);

    return {
      workflowId,
      totalTasks: workflow.tasks.length,
      waves: waves.map((wave, index) => ({
        waveNumber: index + 1,
        tasks: wave.tasks,
        parallel: wave.tasks.length > 1,
        dependsOn: wave.dependsOn || [],
        estimatedDuration: this._formatDuration(wave.duration),
      })),
      optimizationGain: `${optimizationGain}%`,
      criticalPath,
      metrics: {
        sequentialTime: this._formatDuration(sequentialTime),
        parallelTime: this._formatDuration(parallelTime),
        analysisTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Get workflow tasks with dependencies
   * @param {string} workflowId - Workflow identifier
   * @param {Object} options - Options including custom tasks
   * @returns {Object} Workflow with tasks array
   * @private
   */
  _getWorkflowTasks(workflowId, options = {}) {
    // Use custom tasks if provided
    if (options.customTasks && options.customTasks.length > 0) {
      return { id: workflowId, tasks: options.customTasks };
    }

    // Get from registry
    const registry = this._getRegistry();
    const workflowDef = registry.getWorkflow(workflowId);

    if (!workflowDef) {
      return null;
    }

    // Extract tasks from workflow definition
    return {
      id: workflowId,
      tasks: this._extractTasksFromWorkflow(workflowDef),
    };
  }

  /**
   * Extract tasks from workflow definition
   * @param {Object} workflowDef - Workflow definition from registry
   * @returns {Object[]} Array of task objects with dependencies
   * @private
   */
  _extractTasksFromWorkflow(workflowDef) {
    const tasks = [];

    // If workflow has explicit tasks defined
    if (workflowDef.tasks) {
      return workflowDef.tasks;
    }

    // Extract from transitions (implicit task order)
    if (workflowDef.transitions) {
      const stateOrder = Object.keys(workflowDef.transitions);

      for (let i = 0; i < stateOrder.length; i++) {
        const state = stateOrder[i];
        const transition = workflowDef.transitions[state];

        // Create task from transition
        const task = {
          id: state,
          name: state,
          dependsOn: i > 0 ? [stateOrder[i - 1]] : [],
        };

        // Add next_steps as parallel tasks within this state
        if (transition.next_steps) {
          for (const step of transition.next_steps) {
            const stepTask = {
              id: step.command,
              name: step.command,
              description: step.description,
              duration:
                step.duration || this.taskDurations[step.command] || this.taskDurations.default,
              dependsOn: [state], // Depends on the parent state
            };
            tasks.push(stepTask);
          }
        }

        tasks.push(task);
      }
    }

    // Extract from key_commands if no transitions
    if (tasks.length === 0 && workflowDef.key_commands) {
      for (let i = 0; i < workflowDef.key_commands.length; i++) {
        const cmd = workflowDef.key_commands[i];
        tasks.push({
          id: cmd,
          name: cmd,
          dependsOn: i > 0 ? [workflowDef.key_commands[i - 1]] : [],
          duration: this.taskDurations[cmd] || this.taskDurations.default,
        });
      }
    }

    return tasks;
  }

  /**
   * Build directed acyclic graph from tasks
   * @param {Object[]} tasks - Array of task objects
   * @returns {Object} Graph object with nodes and adjacency list
   */
  buildDependencyGraph(tasks) {
    const graph = {
      nodes: new Set(),
      edges: new Map(), // node -> Set of nodes it points to
      inEdges: new Map(), // node -> Set of nodes pointing to it
      taskMap: new Map(), // node -> task object
    };

    // Add all nodes
    for (const task of tasks) {
      const nodeId = task.id || task.name;
      graph.nodes.add(nodeId);
      graph.edges.set(nodeId, new Set());
      graph.inEdges.set(nodeId, new Set());
      graph.taskMap.set(nodeId, task);
    }

    // Add edges based on dependencies
    for (const task of tasks) {
      const nodeId = task.id || task.name;
      const dependencies = task.dependsOn || [];

      for (const dep of dependencies) {
        if (graph.nodes.has(dep)) {
          // Edge from dependency to this task
          graph.edges.get(dep).add(nodeId);
          graph.inEdges.get(nodeId).add(dep);
        }
      }
    }

    return graph;
  }

  /**
   * Find cycle in graph using DFS
   * @param {Object} graph - Dependency graph
   * @returns {string[]|null} Cycle path or null if no cycle
   */
  findCycle(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    const parent = new Map();

    for (const node of graph.nodes) {
      if (!visited.has(node)) {
        const cycle = this._dfsForCycle(graph, node, visited, recursionStack, parent);
        if (cycle) {
          return cycle;
        }
      }
    }

    return null;
  }

  /**
   * DFS helper for cycle detection
   * @param {Object} graph - Dependency graph
   * @param {string} node - Current node
   * @param {Set} visited - Visited nodes
   * @param {Set} recursionStack - Current recursion stack
   * @param {Map} parent - Parent map for path reconstruction
   * @returns {string[]|null} Cycle path or null
   * @private
   */
  _dfsForCycle(graph, node, visited, recursionStack, parent) {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.edges.get(node) || new Set();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        parent.set(neighbor, node);
        const cycle = this._dfsForCycle(graph, neighbor, visited, recursionStack, parent);
        if (cycle) {
          return cycle;
        }
      } else if (recursionStack.has(neighbor)) {
        // Found cycle - reconstruct path
        const cyclePath = [neighbor];
        let current = node;
        while (current !== neighbor) {
          cyclePath.unshift(current);
          current = parent.get(current);
        }
        cyclePath.unshift(neighbor);
        return cyclePath;
      }
    }

    recursionStack.delete(node);
    return null;
  }

  /**
   * Perform Kahn's algorithm for topological sort with wave grouping
   * @param {Object} graph - Dependency graph
   * @returns {Object[]} Array of wave objects
   * @private
   */
  _kahnWaveAnalysis(graph) {
    const waves = [];
    const inDegree = new Map();
    const remaining = new Set(graph.nodes);

    // Calculate initial in-degrees
    for (const node of graph.nodes) {
      inDegree.set(node, graph.inEdges.get(node)?.size || 0);
    }

    while (remaining.size > 0) {
      // Find all nodes with no incoming edges
      const waveTasks = [];
      const completedInWave = [];

      for (const node of remaining) {
        if (inDegree.get(node) === 0) {
          waveTasks.push(node);
          completedInWave.push(node);
        }
      }

      if (waveTasks.length === 0) {
        // Should not happen if we checked for cycles
        throw new Error('Unexpected cycle detected during wave analysis');
      }

      // Calculate wave duration (max of parallel tasks)
      let waveDuration = 0;
      const dependencies = new Set();

      for (const task of waveTasks) {
        const taskObj = graph.taskMap.get(task);
        const duration =
          taskObj?.duration || this.taskDurations[task] || this.taskDurations.default;
        waveDuration = Math.max(waveDuration, duration);

        // Collect dependencies from previous waves
        const deps = graph.inEdges.get(task) || new Set();
        for (const dep of deps) {
          if (!waveTasks.includes(dep)) {
            dependencies.add(dep);
          }
        }
      }

      waves.push({
        tasks: waveTasks,
        duration: waveDuration,
        dependsOn: Array.from(dependencies),
      });

      // Remove wave nodes and update in-degrees
      for (const node of completedInWave) {
        remaining.delete(node);

        const neighbors = graph.edges.get(node) || new Set();
        for (const neighbor of neighbors) {
          inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        }
      }
    }

    return waves;
  }

  /**
   * Find the critical path through the graph
   * @param {Object} graph - Dependency graph
   * @param {Object[]} waves - Wave analysis result
   * @returns {string[]} Critical path tasks
   * @private
   */
  _findCriticalPath(graph, waves) {
    if (waves.length === 0) {
      return [];
    }

    // Build longest path using dynamic programming
    const distance = new Map();
    const predecessor = new Map();

    // Initialize distances
    for (const node of graph.nodes) {
      distance.set(node, 0);
      predecessor.set(node, null);
    }

    // Process nodes in topological order (wave order)
    for (const wave of waves) {
      for (const node of wave.tasks) {
        const taskObj = graph.taskMap.get(node);
        const duration =
          taskObj?.duration || this.taskDurations[node] || this.taskDurations.default;

        const neighbors = graph.edges.get(node) || new Set();
        for (const neighbor of neighbors) {
          const newDist = distance.get(node) + duration;
          if (newDist > distance.get(neighbor)) {
            distance.set(neighbor, newDist);
            predecessor.set(neighbor, node);
          }
        }
      }
    }

    // Find the end node with maximum distance
    let maxDist = -1;
    let endNode = null;

    for (const [node, dist] of distance) {
      const taskObj = graph.taskMap.get(node);
      const duration = taskObj?.duration || this.taskDurations[node] || this.taskDurations.default;
      const totalDist = dist + duration;

      if (totalDist > maxDist) {
        maxDist = totalDist;
        endNode = node;
      }
    }

    // Reconstruct critical path
    const criticalPath = [];
    let current = endNode;

    while (current !== null) {
      criticalPath.unshift(current);
      current = predecessor.get(current);
    }

    return criticalPath;
  }

  /**
   * Calculate total sequential execution time
   * @param {Object[]} tasks - Array of tasks
   * @returns {number} Total time in minutes
   * @private
   */
  _calculateSequentialTime(tasks) {
    return tasks.reduce((sum, task) => {
      const duration =
        task.duration ||
        this.taskDurations[task.id] ||
        this.taskDurations[task.name] ||
        this.taskDurations.default;
      return sum + duration;
    }, 0);
  }

  /**
   * Calculate total parallel execution time
   * @param {Object[]} waves - Wave analysis result
   * @returns {number} Total time in minutes
   * @private
   */
  _calculateParallelTime(waves) {
    return waves.reduce((sum, wave) => sum + wave.duration, 0);
  }

  /**
   * Calculate optimization gain percentage
   * @param {number} sequentialTime - Sequential execution time
   * @param {number} parallelTime - Parallel execution time
   * @returns {number} Percentage improvement
   * @private
   */
  _calculateOptimizationGain(sequentialTime, parallelTime) {
    if (sequentialTime === 0) return 0;
    const gain = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    return Math.round(gain);
  }

  /**
   * Format duration in minutes to human-readable string
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration
   * @private
   */
  _formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  /**
   * Get wave context for current workflow state
   * @param {string} workflowId - Workflow identifier
   * @param {string} currentTask - Currently executing task
   * @returns {Object} Wave context including current position
   */
  getCurrentWave(workflowId, currentTask) {
    try {
      const analysis = this.analyzeWaves(workflowId);

      let currentWaveNumber = null;
      const totalWaves = analysis.waves.length;
      let currentWaveInfo = null;
      let nextWaveInfo = null;

      for (let i = 0; i < analysis.waves.length; i++) {
        const wave = analysis.waves[i];
        if (wave.tasks.includes(currentTask)) {
          currentWaveNumber = i + 1;
          currentWaveInfo = wave;

          if (i + 1 < analysis.waves.length) {
            nextWaveInfo = analysis.waves[i + 1];
          }
          break;
        }
      }

      return {
        workflowId,
        currentTask,
        currentWaveNumber,
        totalWaves,
        currentWave: currentWaveInfo,
        nextWave: nextWaveInfo,
        parallelTasks: currentWaveInfo?.tasks.filter((t) => t !== currentTask) || [],
        canParallelize: currentWaveInfo?.parallel || false,
      };
    } catch (error) {
      return {
        workflowId,
        currentTask,
        currentWaveNumber: null,
        totalWaves: 0,
        error: error.message,
      };
    }
  }

  /**
   * Format wave analysis for CLI output
   * @param {Object} analysis - Wave analysis result
   * @param {Object} options - Formatting options
   * @param {boolean} options.visual - Include ASCII visualization
   * @param {boolean} options.json - Return as JSON string
   * @returns {string} Formatted output
   */
  formatOutput(analysis, options = {}) {
    if (options.json) {
      return JSON.stringify(analysis, null, 2);
    }

    const lines = [];

    lines.push(`Wave Analysis: ${analysis.workflowId}`);
    lines.push('═'.repeat(40));
    lines.push('');

    if (options.visual) {
      for (const wave of analysis.waves) {
        const prefix = `Wave ${wave.waveNumber} `;

        if (wave.tasks.length === 1) {
          lines.push(`${prefix}──────── ${wave.tasks[0]} (${wave.estimatedDuration})`);
        } else {
          lines.push(`${prefix}──┬── ${wave.tasks[0]} (${wave.estimatedDuration})`);
          for (let i = 1; i < wave.tasks.length; i++) {
            const connector = i === wave.tasks.length - 1 ? '└' : '├';
            lines.push(`         ${connector}── ${wave.tasks[i]}`);
          }
        }

        if (wave.waveNumber < analysis.waves.length) {
          lines.push('              │');
        }
      }
    } else {
      for (const wave of analysis.waves) {
        const parallelIndicator = wave.parallel ? '(parallel)' : '';
        lines.push(`Wave ${wave.waveNumber} ${parallelIndicator}:`);
        for (const task of wave.tasks) {
          lines.push(`  └─ ${task}`);
        }
        lines.push('');
      }
    }

    lines.push('');
    lines.push(`Total Sequential: ${analysis.metrics?.sequentialTime || 'N/A'}`);
    lines.push(`Total Parallel:   ${analysis.metrics?.parallelTime || 'N/A'}`);
    lines.push(`Optimization:     ${analysis.optimizationGain} faster`);
    lines.push('');
    lines.push(`Critical Path: ${analysis.criticalPath.join(' → ')}`);

    return lines.join('\n');
  }
}

/**
 * Create a new WaveAnalyzer instance
 * @param {Object} options - Configuration options
 * @returns {WaveAnalyzer} New analyzer instance
 */
function createWaveAnalyzer(options = {}) {
  return new WaveAnalyzer(options);
}

/**
 * Analyze waves for a workflow (convenience function)
 * @param {string} workflowId - Workflow identifier
 * @param {Object} options - Analysis options
 * @returns {Object} Wave analysis result
 */
function analyzeWaves(workflowId, options = {}) {
  const analyzer = createWaveAnalyzer(options);
  return analyzer.analyzeWaves(workflowId, options);
}

module.exports = {
  WaveAnalyzer,
  CircularDependencyError,
  createWaveAnalyzer,
  analyzeWaves,
  DEFAULT_TASK_DURATIONS,
};
