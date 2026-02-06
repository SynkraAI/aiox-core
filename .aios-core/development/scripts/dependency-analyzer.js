/**
 * Dependency Analyzer for AIOS-FULLSTACK
 * Analyzes and resolves dependencies between components
 * @module dependency-analyzer
 */

const fs = require('fs-extra');
const path = require('path');
const _yaml = require('js-yaml');
const chalk = require('chalk');

class DependencyAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.manifestPath = path.join(this.rootPath, 'aios-core', 'team-manifest.yaml');
    
    // Component paths
    this.paths = {
      agents: path.join(this.rootPath, 'aios-core', 'agents'),
      tasks: path.join(this.rootPath, 'aios-core', 'tasks'),
      workflows: path.join(this.rootPath, 'aios-core', 'workflows')
    };
    
    // Dependency cache
    this.dependencyCache = new Map();
  }

  /**
   * Analyze dependencies for a component
   * @param {string} componentType - Type of component (agent/task/workflow)
   * @param {Object} componentData - Component configuration data
   * @returns {Promise<Object>} Dependency analysis result
   */
  async analyzeDependencies(componentType, componentData) {
    const dependencies = {
      required: [],
      optional: [],
      missing: [],
      circular: false,
      graph: new Map()
    };
    
    switch (componentType) {
      case 'agent':
        await this.analyzeAgentDependencies(componentData, dependencies);
        break;
      case 'task':
        await this.analyzeTaskDependencies(componentData, dependencies);
        break;
      case 'workflow':
        await this.analyzeWorkflowDependencies(componentData, dependencies);
        break;
    }
    
    // Check for circular dependencies
    dependencies.circular = this.detectCircularDependencies(dependencies.graph);
    
    return dependencies;
  }

  /**
   * Analyze agent dependencies
   * @private
   */
  async analyzeAgentDependencies(agentData, dependencies) {
    // Check for task dependencies from commands
    if (agentData.commands && Array.isArray(agentData.commands)) {
      for (const command of agentData.commands) {
        const taskId = this.commandToTaskId(command);
        const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
        
        if (await fs.pathExists(taskPath)) {
          dependencies.required.push({
            type: 'task',
            id: taskId,
            path: taskPath,
            reason: `Command '${command}' requires task`
          });
        } else {
          dependencies.missing.push({
            type: 'task',
            id: taskId,
            reason: `Command '${command}' requires task file`
          });
        }
      }
    }
    
    // Check for workflow dependencies
    if (agentData.workflows && Array.isArray(agentData.workflows)) {
      for (const workflowId of agentData.workflows) {
        const workflowPath = path.join(this.paths.workflows, `${workflowId}.yaml`);
        
        if (await fs.pathExists(workflowPath)) {
          dependencies.optional.push({
            type: 'workflow',
            id: workflowId,
            path: workflowPath,
            reason: 'Agent workflow reference'
          });
        }
      }
    }
    
    // Check for agent dependencies
    if (agentData.dependencies?.agents) {
      for (const agentId of agentData.dependencies.agents) {
        const agentPath = path.join(this.paths.agents, `${agentId}.md`);
        
        if (await fs.pathExists(agentPath)) {
          dependencies.required.push({
            type: 'agent',
            id: agentId,
            path: agentPath,
            reason: 'Explicit agent dependency'
          });
        } else {
          dependencies.missing.push({
            type: 'agent',
            id: agentId,
            reason: 'Required agent not found'
          });
        }
      }
    }
  }

  /**
   * Analyze task dependencies
   * @private
   */
  async analyzeTaskDependencies(taskData, dependencies) {
    // Check for agent dependency
    if (taskData.agentName) {
      const agentPath = path.join(this.paths.agents, `${taskData.agentName}.md`);
      
      if (await fs.pathExists(agentPath)) {
        dependencies.required.push({
          type: 'agent',
          id: taskData.agentName,
          path: agentPath,
          reason: 'Task belongs to agent'
        });
      } else {
        dependencies.missing.push({
          type: 'agent',
          id: taskData.agentName,
          reason: 'Agent not found for task'
        });
      }
    }
    
    // Check for other task dependencies
    if (taskData.dependencies?.tasks) {
      for (const taskId of taskData.dependencies.tasks) {
        const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
        
        if (await fs.pathExists(taskPath)) {
          dependencies.required.push({
            type: 'task',
            id: taskId,
            path: taskPath,
            reason: 'Task dependency'
          });
        } else {
          dependencies.missing.push({
            type: 'task',
            id: taskId,
            reason: 'Required task not found'
          });
        }
      }
    }
  }

  /**
   * Analyze workflow dependencies
   * @private
   */
  async analyzeWorkflowDependencies(workflowData, dependencies) {
    // Extract task references from workflow steps
    const taskIds = new Set();
    
    if (workflowData.steps && Array.isArray(workflowData.steps)) {
      for (const step of workflowData.steps) {
        if (step.type === 'task' && step.taskId) {
          taskIds.add(step.taskId);
        } else if (step.action?.includes('task:')) {
          const taskMatch = step.action.match(/task:([a-z0-9-]+)/);
          if (taskMatch) {
            taskIds.add(taskMatch[1]);
          }
        }
      }
    }
    
    // Check each task dependency
    for (const taskId of taskIds) {
      const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
      
      if (await fs.pathExists(taskPath)) {
        dependencies.required.push({
          type: 'task',
          id: taskId,
          path: taskPath,
          reason: 'Workflow step requires task'
        });
        
        // Also check the task's agent dependency
        const taskContent = await fs.readFile(taskPath, 'utf8');
        const agentMatch = taskContent.match(/\*\*Agent:\*\*\s*([a-z0-9-]+)/);
        if (agentMatch) {
          const agentId = agentMatch[1];
          const agentPath = path.join(this.paths.agents, `${agentId}.md`);
          
          if (await fs.pathExists(agentPath)) {
            dependencies.required.push({
              type: 'agent',
              id: agentId,
              path: agentPath,
              reason: 'Task requires agent'
            });
          }
        }
      } else {
        dependencies.missing.push({
          type: 'task',
          id: taskId,
          reason: 'Workflow step requires task'
        });
      }
    }
    
    // Check for sub-workflow dependencies
    if (workflowData.dependencies?.workflows) {
      for (const workflowId of workflowData.dependencies.workflows) {
        const workflowPath = path.join(this.paths.workflows, `${workflowId}.yaml`);
        
        if (await fs.pathExists(workflowPath)) {
          dependencies.required.push({
            type: 'workflow',
            id: workflowId,
            path: workflowPath,
            reason: 'Sub-workflow dependency'
          });
        } else {
          dependencies.missing.push({
            type: 'workflow',
            id: workflowId,
            reason: 'Required workflow not found'
          });
        }
      }
    }
  }

  /**
   * Convert command name to task ID
   * @private
   */
  commandToTaskId(command) {
    // Remove asterisk if present
    const cleanCommand = command.replace(/^\*/, '');
    
    // Handle common patterns
    if (cleanCommand.startsWith('create-')) {
      return cleanCommand;
    }
    
    // Convert to task ID format
    return cleanCommand.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * Detect circular dependencies
   * @private
   */
  detectCircularDependencies(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (node, path = []) => {
      if (recursionStack.has(node)) {
        console.log(chalk.red(`\n⚠️  Circular dependency detected: ${[...path, node].join(' → ')}`));
        return true;
      }
      
      if (visited.has(node)) {
        return false;
      }
      
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor, [...path, node])) {
          return true;
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const node of graph.keys()) {
      if (hasCycle(node)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validate all dependencies exist
   * @param {Array} components - Components to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateDependencies(components) {
    const results = {
      valid: true,
      issues: [],
      resolutions: []
    };
    
    for (const component of components) {
      const deps = await this.analyzeDependencies(component.type, component.config);
      
      if (deps.missing.length > 0) {
        results.valid = false;
        results.issues.push({
          component: component.config.name || component.config.id,
          missing: deps.missing
        });
        
        // Suggest resolutions
        for (const missing of deps.missing) {
          results.resolutions.push({
            action: 'create',
            type: missing.type,
            id: missing.id,
            reason: missing.reason
          });
        }
      }
      
      if (deps.circular) {
        results.valid = false;
        results.issues.push({
          component: component.config.name || component.config.id,
          issue: 'Circular dependency detected'
        });
      }
    }
    
    return results;
  }

  /**
   * Get creation order for components based on dependencies
   * @param {Array} components - Components to order
   * @returns {Promise<Array>} Ordered components
   */
  async getCreationOrder(components) {
    const graph = new Map();
    const inDegree = new Map();
    
    // Initialize graph
    for (const component of components) {
      const id = this.getComponentId(component);
      graph.set(id, []);
      inDegree.set(id, 0);
    }
    
    // Build dependency graph
    for (const component of components) {
      const id = this.getComponentId(component);
      const deps = await this.analyzeDependencies(component.type, component.config);
      
      for (const dep of deps.required) {
        const depId = `${dep.type}:${dep.id}`;
        
        // Only add edge if dependency is in our component list
        if (graph.has(depId)) {
          graph.get(depId).push(id);
          inDegree.set(id, inDegree.get(id) + 1);
        }
      }
    }
    
    // Topological sort using Kahn's algorithm
    const queue = [];
    const ordered = [];
    
    // Find nodes with no dependencies
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }
    
    while (queue.length > 0) {
      const current = queue.shift();
      ordered.push(current);
      
      // Process neighbors
      for (const neighbor of graph.get(current) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    // Check for cycles
    if (ordered.length !== components.length) {
      throw new Error('Circular dependency detected - cannot determine creation order');
    }
    
    // Map back to components
    const componentMap = new Map();
    for (const component of components) {
      const id = this.getComponentId(component);
      componentMap.set(id, component);
    }
    
    return ordered.map(id => componentMap.get(id));
  }

  /**
   * Get component ID for graph
   * @private
   */
  getComponentId(component) {
    const name = component.config.agentName || 
                 component.config.taskId || 
                 component.config.workflowId ||
                 component.config.name ||
                 component.config.id;
    return `${component.type}:${name}`;
  }

  /**
   * Create missing dependencies interactively
   * @param {Array} missing - Missing dependencies
   * @returns {Promise<Array>} Components to create
   */
  async promptForMissingDependencies(missing) {
    const inquirer = require('inquirer');
    const componentsToCreate = [];
    
    console.log(chalk.yellow('\n⚠️  Missing dependencies detected:'));
    
    for (const dep of missing) {
      console.log(chalk.gray(`  - ${dep.type}: ${dep.id} (${dep.reason})`));
    }
    
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'How would you like to handle missing dependencies?',
      choices: [
        { name: 'Create all missing dependencies', value: 'create-all' },
        { name: 'Select which to create', value: 'select' },
        { name: 'Skip dependency creation', value: 'skip' }
      ]
    }]);
    
    if (action === 'skip') {
      return [];
    }
    
    if (action === 'create-all') {
      for (const dep of missing) {
        componentsToCreate.push({
          type: dep.type,
          config: await this.getMinimalConfig(dep.type, dep.id)
        });
      }
    } else {
      // Select which to create
      const { selected } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selected',
        message: 'Select dependencies to create:',
        choices: missing.map(dep => ({
          name: `${dep.type}: ${dep.id}`,
          value: dep,
          checked: true
        }))
      }]);
      
      for (const dep of selected) {
        componentsToCreate.push({
          type: dep.type,
          config: await this.getMinimalConfig(dep.type, dep.id)
        });
      }
    }
    
    return componentsToCreate;
  }

  /**
   * Validate workflow dependencies
   * @param {Object} workflowData - Workflow configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateWorkflowDependencies(workflowData) {
    const result = {
      valid: true,
      issues: [],
      taskDependencies: [],
      missingTasks: []
    };
    
    // Extract all task references
    const taskRefs = new Set();
    
    if (workflowData.steps && Array.isArray(workflowData.steps)) {
      for (const step of workflowData.steps) {
        if (step.type === 'task' && step.taskId) {
          taskRefs.add(step.taskId);
        } else if (step.action && typeof step.action === 'string') {
          // Extract task references from action strings
          const taskMatches = step.action.match(/task:([a-z0-9-]+)/g);
          if (taskMatches) {
            taskMatches.forEach(match => {
              const taskId = match.replace('task:', '');
              taskRefs.add(taskId);
            });
          }
        }
        
        // Check step dependencies
        if (step.dependencies && Array.isArray(step.dependencies)) {
          for (const depId of step.dependencies) {
            if (!workflowData.steps.find(s => s.id === depId)) {
              result.valid = false;
              result.issues.push({
                step: step.id || step.name,
                issue: `References non-existent step: ${depId}`
              });
            }
          }
        }
      }
    }
    
    // Validate each task reference
    for (const taskId of taskRefs) {
      const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
      
      if (await fs.pathExists(taskPath)) {
        result.taskDependencies.push({
          taskId,
          path: taskPath,
          exists: true
        });
      } else {
        result.valid = false;
        result.missingTasks.push(taskId);
      }
    }
    
    // Check for circular step dependencies
    if (workflowData.steps) {
      const stepGraph = new Map();
      
      for (const step of workflowData.steps) {
        const stepId = step.id || step.name;
        const deps = step.dependencies || [];
        stepGraph.set(stepId, deps);
      }
      
      if (this.detectCircularDependencies(stepGraph)) {
        result.valid = false;
        result.issues.push({
          issue: 'Circular dependency detected in workflow steps'
        });
      }
    }
    
    return result;
  }

  /**
   * Get minimal config for dependency creation
   * @private
   */
  async getMinimalConfig(type, id) {
    const inquirer = require('inquirer');
    
    switch (type) {
      case 'agent':
        const { agentTitle } = await inquirer.prompt([{
          type: 'input',
          name: 'agentTitle',
          message: `Title for agent '${id}':`,
          default: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }]);
        
        return {
          agentName: id,
          agentTitle,
          whenToUse: `Dependency for ${id}`,
          commands: []
        };
        
      case 'task':
        const { taskTitle } = await inquirer.prompt([{
          type: 'input',
          name: 'taskTitle',
          message: `Title for task '${id}':`,
          default: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }]);
        
        return {
          taskId: id,
          taskTitle,
          taskDescription: `Dependency task for ${id}`,
          agentName: 'aios-developer'
        };
        
      case 'workflow':
        return {
          workflowId: id,
          workflowName: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          workflowType: 'standard',
          steps: []
        };
    }
  }
}

module.exports = DependencyAnalyzer;