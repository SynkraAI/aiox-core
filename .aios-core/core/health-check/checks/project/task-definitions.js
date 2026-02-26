/**
 * Task Definitions Check
 *
 * Verifies task definition files are valid.
 *
 * @module aios-core/health-check/checks/project/task-definitions
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Task definitions validation check
 *
 * @class TaskDefinitionsCheck
 * @extends BaseCheck
 */
class TaskDefinitionsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.task-definitions',
      name: 'Task Definitions',
      description: 'Verifies task definition files are valid',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.MEDIUM,
      timeout: 5000,
      cacheable: true,
      healingTier: 0, // Cannot auto-fix task definitions
      tags: ['aios', 'tasks', 'config'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const taskPaths = [
      path.join(projectRoot, '.aios-core', 'development', 'tasks'),
      path.join(projectRoot, '.aios-core', 'infrastructure', 'tasks'),
    ];

    const validTasks = [];
    const invalidTasks = [];
    let totalTasks = 0;

    for (const taskPath of taskPaths) {
      try {
        const files = await this.findYamlFiles(taskPath);

        for (const file of files) {
          totalTasks++;

          try {
            const content = await fs.readFile(file, 'utf8');
            const validation = this.validateTaskDefinition(content, file);

            if (validation.valid) {
              validTasks.push(path.basename(file));
            } else {
              invalidTasks.push({
                file: path.basename(file),
                reasons: validation.errors,
              });
            }
          } catch (readError) {
            invalidTasks.push({
              file: path.basename(file),
              reasons: [`Cannot read: ${readError.message}`],
            });
          }
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    if (totalTasks === 0) {
      return this.pass('No task definitions found (framework may not be fully set up)', {
        details: { searchPaths: taskPaths },
      });
    }

    if (invalidTasks.length > 0) {
      const issues = invalidTasks.map((t) => `${t.file}: ${t.reasons.join(', ')}`);
      return this.warning(`${invalidTasks.length} task definition(s) have issues`, {
        recommendation: 'Review and fix invalid task definition files',
        details: {
          valid: validTasks.length,
          invalid: invalidTasks,
          issues,
        },
      });
    }

    return this.pass(`All ${validTasks.length} task definitions are valid`, {
      details: {
        tasks: validTasks,
        total: totalTasks,
      },
    });
  }

  /**
   * Find YAML files recursively
   * @private
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>} Array of file paths
   */
  async findYamlFiles(dir) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.findYamlFiles(fullPath);
          files.push(...subFiles);
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
   * Validate task definition content
   * @private
   * @param {string} content - YAML content
   * @param {string} filePath - File path for context
   * @returns {Object} Validation result
   */
  validateTaskDefinition(content, _filePath) {
    const errors = [];

    try {
      // Try to load js-yaml if available
      let yaml;
      try {
        yaml = require('js-yaml');
      } catch {
        // If js-yaml not available, do basic validation
        if (content.includes('\t')) {
          errors.push('Contains tabs (use spaces)');
        }
        return { valid: errors.length === 0, errors };
      }

      const parsed = yaml.load(content);

      if (!parsed) {
        errors.push('Empty or invalid YAML');
        return { valid: false, errors };
      }

      // Check for required task fields
      if (!parsed.name && !parsed.id) {
        errors.push('Missing name or id field');
      }

      // Check for v2 task format
      if (parsed.version === '2.0' || parsed.version === 2) {
        if (!parsed.steps && !parsed.tasks) {
          errors.push('V2 task missing steps or tasks');
        }
      }
    } catch (parseError) {
      errors.push(`YAML parse error: ${parseError.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = TaskDefinitionsCheck;
