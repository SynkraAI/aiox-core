/**
 * Workflow Dependencies Check
 *
 * Verifies workflow files have valid dependencies.
 *
 * @module aios-core/health-check/checks/project/workflow-dependencies
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Workflow dependencies validation check
 *
 * @class WorkflowDependenciesCheck
 * @extends BaseCheck
 */
class WorkflowDependenciesCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.workflow-dependencies',
      name: 'Workflow Dependencies',
      description: 'Verifies workflow dependencies are satisfied',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.LOW,
      timeout: 5000,
      cacheable: true,
      healingTier: 0,
      tags: ['aios', 'workflows', 'dependencies'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const workflowPaths = [
      path.join(projectRoot, '.aios-core', 'development', 'workflows'),
      path.join(projectRoot, '.aios-core', 'infrastructure', 'workflows'),
    ];

    const workflows = [];
    const issues = [];

    // Collect all available tasks and workflows
    const availableTasks = new Set();
    const availableWorkflows = new Set();

    // Scan task directories
    const taskPaths = [
      path.join(projectRoot, '.aios-core', 'development', 'tasks'),
      path.join(projectRoot, '.aios-core', 'infrastructure', 'tasks'),
    ];

    for (const taskPath of taskPaths) {
      try {
        const files = await this.findYamlFiles(taskPath);
        for (const file of files) {
          const taskId = path.basename(file, path.extname(file));
          availableTasks.add(taskId);
        }
      } catch {
        // Directory doesn't exist
      }
    }

    // Scan workflow directories
    for (const workflowPath of workflowPaths) {
      try {
        const files = await this.findYamlFiles(workflowPath);

        for (const file of files) {
          const workflowId = path.basename(file, path.extname(file));
          availableWorkflows.add(workflowId);

          try {
            const content = await fs.readFile(file, 'utf8');
            const deps = this.extractDependencies(content);

            if (deps.tasks.length > 0 || deps.workflows.length > 0) {
              workflows.push({
                id: workflowId,
                path: file,
                dependencies: deps,
              });
            }
          } catch {
            // Skip files that can't be read
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    if (workflows.length === 0) {
      return this.pass('No workflows with dependencies found', {
        details: {
          availableTasks: availableTasks.size,
          availableWorkflows: availableWorkflows.size,
        },
      });
    }

    // Check dependencies
    for (const workflow of workflows) {
      for (const taskDep of workflow.dependencies.tasks) {
        if (!availableTasks.has(taskDep)) {
          issues.push({
            workflow: workflow.id,
            type: 'task',
            missing: taskDep,
          });
        }
      }

      for (const workflowDep of workflow.dependencies.workflows) {
        if (!availableWorkflows.has(workflowDep)) {
          issues.push({
            workflow: workflow.id,
            type: 'workflow',
            missing: workflowDep,
          });
        }
      }
    }

    if (issues.length > 0) {
      const summary = issues
        .map((i) => `${i.workflow} -> missing ${i.type}: ${i.missing}`)
        .join(', ');

      return this.warning(`${issues.length} workflow dependency issue(s) found`, {
        recommendation: 'Create missing tasks/workflows or update workflow definitions',
        details: {
          issues,
          summary,
        },
      });
    }

    return this.pass(`All ${workflows.length} workflow dependencies satisfied`, {
      details: {
        workflows: workflows.map((w) => w.id),
        availableTasks: availableTasks.size,
      },
    });
  }

  /**
   * Find YAML files in directory
   * @private
   */
  async findYamlFiles(dir) {
    const files = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...(await this.findYamlFiles(fullPath)));
        } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist
    }
    return files;
  }

  /**
   * Extract dependencies from workflow content
   * @private
   */
  extractDependencies(content) {
    const deps = { tasks: [], workflows: [] };

    try {
      const yaml = require('js-yaml');
      const parsed = yaml.load(content);

      if (parsed?.steps) {
        for (const step of parsed.steps) {
          if (step.task) deps.tasks.push(step.task);
          if (step.workflow) deps.workflows.push(step.workflow);
        }
      }

      if (parsed?.dependencies) {
        if (Array.isArray(parsed.dependencies.tasks)) {
          deps.tasks.push(...parsed.dependencies.tasks);
        }
        if (Array.isArray(parsed.dependencies.workflows)) {
          deps.workflows.push(...parsed.dependencies.workflows);
        }
      }
    } catch {
      // Parse error, skip
    }

    return deps;
  }
}

module.exports = WorkflowDependenciesCheck;
