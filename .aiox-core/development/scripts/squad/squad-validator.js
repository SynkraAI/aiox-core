/**
 * Squad Validator Utility
 *
 * Validates squads against:
 * 1. JSON Schema (squad.yaml/config.yaml)
 * 2. Directory structure (task-first architecture)
 * 3. Task format (TASK-FORMAT-SPECIFICATION-V1)
 * 4. Agent definitions
 *
 * Used by: squad-creator agent (*validate-squad task)
 *
 * @module squad-validator
 * @version 1.0.0
 * @see Story SQS-3: Squad Validator + JSON Schema
 */

const Ajv = require('ajv');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Load schema - handle both require and dynamic loading
 * @returns {Object} JSON Schema
 */
function loadSchema() {
  try {
    return require('../../../schemas/squad-schema.json');
  } catch {
    // Fallback for test environments
    return null;
  }
}

/**
 * Supported manifest file names in order of preference
 * @constant {string[]}
 */
const MANIFEST_FILES = ['squad.yaml', 'config.yaml'];

/**
 * Required fields in tasks (TASK-FORMAT-SPECIFICATION-V1)
 * @constant {string[]}
 */
const TASK_REQUIRED_FIELDS = [
  'task',
  'responsavel',
  'responsavel_type',
  'atomic_layer',
  'Entrada',
  'Saida',
  'Checklist',
];

/**
 * Error codes for SquadValidatorError
 * @enum {string}
 */
const ValidationErrorCodes = {
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  YAML_PARSE_ERROR: 'YAML_PARSE_ERROR',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  DEPRECATED_MANIFEST: 'DEPRECATED_MANIFEST',
  MISSING_DIRECTORY: 'MISSING_DIRECTORY',
  NO_TASKS: 'NO_TASKS',
  TASK_MISSING_FIELD: 'TASK_MISSING_FIELD',
  TASK_READ_ERROR: 'TASK_READ_ERROR',
  AGENT_INVALID_FORMAT: 'AGENT_INVALID_FORMAT',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_NAMING: 'INVALID_NAMING',
};

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed (no errors)
 * @property {Array<ValidationError>} errors - Critical errors that fail validation
 * @property {Array<ValidationWarning>} warnings - Non-critical issues
 * @property {Array<string>} suggestions - Helpful suggestions
 */

/**
 * Validation error structure
 * @typedef {Object} ValidationError
 * @property {string} code - Error code from ValidationErrorCodes
 * @property {string} message - Human-readable error message
 * @property {string} [suggestion] - Suggested fix
 * @property {string} [path] - JSON path where error occurred
 * @property {string} [file] - File where error occurred
 */

/**
 * Squad Validator class for validating squad structure and content
 */
class SquadValidator {
  /**
   * Create a SquadValidator instance
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.strict=false] - Treat warnings as errors
   * @param {Object} [options.schema] - Custom schema (for testing)
   */
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.strict = options.strict || false;

    // Initialize AJV with schema
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    const schema = options.schema || loadSchema();
    if (schema) {
      this.validateSchema = this.ajv.compile(schema);
    } else {
      this.validateSchema = null;
    }
  }

  /**
   * Log message if verbose mode is enabled
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadValidator] ${message}`);
    }
  }

  /**
   * Validate entire squad
   *
   * Runs all validation checks:
   * 1. Manifest validation (schema)
   * 2. Directory structure
   * 3. Task format
   * 4. Agent definitions
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result
   *
   * @example
   * const validator = new SquadValidator();
   * const result = await validator.validate('./squads/my-squad');
   * if (result.valid) {
   *   console.log('Squad is valid!');
   * } else {
   *   console.log('Errors:', result.errors);
   * }
   */
  async validate(squadPath) {
    this._log(`Validating squad: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // 1. Validate manifest
    const manifestResult = await this.validateManifest(squadPath);
    this._mergeResults(result, manifestResult);

    // 2. Validate directory structure
    const structureResult = await this.validateStructure(squadPath);
    this._mergeResults(result, structureResult);

    // 3. Validate tasks (task-first!)
    const tasksResult = await this.validateTasks(squadPath);
    this._mergeResults(result, tasksResult);

    // 4. Validate agents
    const agentsResult = await this.validateAgents(squadPath);
    this._mergeResults(result, agentsResult);

    // 5. Validate config references (SQS-10)
    const configResult = await this.validateConfigReferences(squadPath);
    this._mergeResults(result, configResult);

    // 6. Validate workflows (GAP-2)
    const workflowsResult = await this.validateWorkflows(squadPath);
    this._mergeResults(result, workflowsResult);

    // In strict mode, warnings become errors
    if (this.strict && result.warnings.length > 0) {
      result.errors.push(...result.warnings);
      result.warnings = [];
      result.valid = false;
    }

    this._log(`Validation complete: ${result.valid ? 'VALID' : 'INVALID'}`);
    return result;
  }

  /**
   * Validate manifest against JSON Schema
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result for manifest
   */
  async validateManifest(squadPath) {
    this._log(`Validating manifest in: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Find manifest file
    const manifestPath = await this._findManifest(squadPath);
    if (!manifestPath) {
      result.valid = false;
      result.errors.push({
        code: ValidationErrorCodes.MANIFEST_NOT_FOUND,
        message: `No manifest found in ${squadPath}/ (expected squad.yaml or config.yaml)`,
        suggestion: 'Create squad.yaml with required fields: name, version',
      });
      return result;
    }

    // Deprecation warning for config.yaml
    const manifestFilename = path.basename(manifestPath);
    if (manifestFilename === 'config.yaml') {
      result.warnings.push({
        code: ValidationErrorCodes.DEPRECATED_MANIFEST,
        message: 'config.yaml is deprecated, rename to squad.yaml',
        suggestion: 'mv config.yaml squad.yaml',
        file: manifestFilename,
      });
    }

    // Parse YAML
    let manifest;
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      manifest = yaml.load(content);
    } catch (error) {
      result.valid = false;
      result.errors.push({
        code: ValidationErrorCodes.YAML_PARSE_ERROR,
        message: `Failed to parse manifest: ${error.message}`,
        suggestion: 'Check YAML syntax - use a YAML linter',
        file: manifestFilename,
      });
      return result;
    }

    // Validate against schema
    if (this.validateSchema && manifest) {
      const schemaValid = this.validateSchema(manifest);
      if (!schemaValid) {
        result.valid = false;
        for (const err of this.validateSchema.errors) {
          result.errors.push({
            code: ValidationErrorCodes.SCHEMA_ERROR,
            path: err.instancePath || '/',
            message: err.message,
            suggestion: this._getSchemaSuggestion(err),
          });
        }
      }
    }

    this._log(`Manifest validation: ${result.valid ? 'PASS' : 'FAIL'}`);
    return result;
  }

  /**
   * Validate directory structure
   *
   * Checks for expected directories in task-first architecture.
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result for structure
   */
  async validateStructure(squadPath) {
    this._log(`Validating structure of: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Expected directories (task-first: tasks and agents are primary)
    const expectedDirs = ['tasks', 'agents'];
    const _optionalDirs = [
      'workflows',
      'checklists',
      'templates',
      'tools',
      'scripts',
      'data',
      'config',
    ];

    // Check expected directories (warn if missing)
    for (const dir of expectedDirs) {
      const dirPath = path.join(squadPath, dir);
      if (!(await this._pathExists(dirPath))) {
        result.warnings.push({
          code: ValidationErrorCodes.MISSING_DIRECTORY,
          message: `Expected directory not found: ${dir}/`,
          suggestion: `mkdir ${dir} (task-first architecture recommends tasks/ and agents/)`,
        });
      }
    }

    // Validate files referenced in manifest exist
    const manifestPath = await this._findManifest(squadPath);
    if (manifestPath) {
      try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        const manifest = yaml.load(content);

        if (manifest && manifest.components) {
          await this._validateReferencedFiles(
            squadPath,
            manifest.components,
            result,
          );
        }
      } catch {
        // Already handled in manifest validation
      }
    }

    this._log(`Structure validation: ${result.errors.length} errors, ${result.warnings.length} warnings`);
    return result;
  }

  /**
   * Validate task files against TASK-FORMAT-SPECIFICATION-V1
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result for tasks
   */
  async validateTasks(squadPath) {
    this._log(`Validating tasks in: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const tasksDir = path.join(squadPath, 'tasks');

    // Check if tasks directory exists
    if (!(await this._pathExists(tasksDir))) {
      return result; // Already warned in structure validation
    }

    // Get task files
    let files;
    try {
      files = await fs.readdir(tasksDir);
    } catch (error) {
      result.errors.push({
        code: ValidationErrorCodes.TASK_READ_ERROR,
        message: `Failed to read tasks directory: ${error.message}`,
      });
      result.valid = false;
      return result;
    }

    const taskFiles = files.filter((f) => f.endsWith('.md'));

    if (taskFiles.length === 0) {
      result.warnings.push({
        code: ValidationErrorCodes.NO_TASKS,
        message: 'No task files found in tasks/',
        suggestion: 'Task-first architecture: Create at least one task file',
      });
      return result;
    }

    // Validate each task file
    for (const taskFile of taskFiles) {
      const taskPath = path.join(tasksDir, taskFile);
      const taskResult = await this._validateTaskFile(taskPath);
      this._mergeResults(result, taskResult);
    }

    this._log(`Task validation: ${taskFiles.length} files checked`);
    return result;
  }

  /**
   * Validate config references in squad.yaml
   * Implements AC10.4: Validates that referenced config files actually exist
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result for config references
   * @see Story SQS-10: Project Config Reference for Squads
   */
  async validateConfigReferences(squadPath) {
    this._log(`Validating config references in: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Find and parse manifest
    const manifestPath = await this._findManifest(squadPath);
    if (!manifestPath) {
      return result; // Already handled in manifest validation
    }

    let manifest;
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      manifest = yaml.load(content);
    } catch {
      return result; // Already handled in manifest validation
    }

    // Check config section
    if (!manifest || !manifest.config) {
      return result; // No config section to validate
    }

    const configFields = ['coding-standards', 'tech-stack', 'source-tree'];

    for (const field of configFields) {
      const configPath = manifest.config[field];
      if (!configPath) continue;

      const resolvedPath = await this._resolveConfigPath(squadPath, configPath);
      if (!resolvedPath) {
        // Check if this is a project-level reference that doesn't exist
        if (configPath.includes('..') || configPath.includes('docs/framework')) {
          result.warnings.push({
            code: ValidationErrorCodes.FILE_NOT_FOUND,
            message: `Config reference not found: ${configPath}`,
            suggestion: `Create the file at ${configPath} or update squad.yaml to use local config (config/${field}.md)`,
          });
        } else {
          // Local config file missing - this is an error
          result.errors.push({
            code: ValidationErrorCodes.FILE_NOT_FOUND,
            message: `Local config file not found: ${configPath}`,
            suggestion: `Create ${path.join(squadPath, configPath)} or remove from config section`,
          });
          result.valid = false;
        }
      }
    }

    this._log(`Config validation: ${result.errors.length} errors, ${result.warnings.length} warnings`);
    return result;
  }

  /**
   * Validate agent definitions
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result for agents
   */
  async validateAgents(squadPath) {
    this._log(`Validating agents in: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const agentsDir = path.join(squadPath, 'agents');

    // Check if agents directory exists
    if (!(await this._pathExists(agentsDir))) {
      return result; // Already warned in structure validation
    }

    // Get agent files
    let files;
    try {
      files = await fs.readdir(agentsDir);
    } catch (_error) {
      return result;
    }

    const agentFiles = files.filter((f) => f.endsWith('.md'));

    // Validate each agent file
    for (const agentFile of agentFiles) {
      const agentPath = path.join(agentsDir, agentFile);
      try {
        const content = await fs.readFile(agentPath, 'utf-8');

        // Check for basic agent structure (YAML frontmatter or markdown structure)
        const hasYamlFrontmatter = content.includes('agent:');
        const hasMarkdownHeading = content.match(/^#\s+.+/m);

        if (!hasYamlFrontmatter && !hasMarkdownHeading) {
          result.warnings.push({
            code: ValidationErrorCodes.AGENT_INVALID_FORMAT,
            file: agentFile,
            message: 'Agent file may not follow AIOX agent definition format',
            suggestion:
              'Use agent: YAML frontmatter or markdown heading structure',
          });
        }

        // Check naming convention (kebab-case)
        if (!this._isKebabCase(path.basename(agentFile, '.md'))) {
          result.warnings.push({
            code: ValidationErrorCodes.INVALID_NAMING,
            file: agentFile,
            message: 'Agent filename should be kebab-case',
            suggestion: 'Rename to use lowercase letters and hyphens only',
          });
        }
      } catch (error) {
        result.errors.push({
          code: ValidationErrorCodes.TASK_READ_ERROR,
          file: agentFile,
          message: `Failed to read agent file: ${error.message}`,
        });
        result.valid = false;
      }
    }

    this._log(`Agent validation: ${agentFiles.length} files checked`);
    return result;
  }

  /**
   * Format validation result for display
   *
   * @param {ValidationResult} result - Validation result
   * @param {string} squadPath - Path to squad
   * @returns {string} Formatted output
   */
  formatResult(result, squadPath) {
    const lines = [];

    lines.push(`Validating squad: ${squadPath}/`);
    lines.push('');

    // Errors
    if (result.errors.length > 0) {
      lines.push(`Errors: ${result.errors.length}`);
      for (const err of result.errors) {
        const filePart = err.file ? ` (${err.file})` : '';
        const pathPart = err.path ? ` at ${err.path}` : '';
        lines.push(`  - [${err.code}]${pathPart}${filePart}: ${err.message}`);
        if (err.suggestion) {
          lines.push(`    Suggestion: ${err.suggestion}`);
        }
      }
      lines.push('');
    }

    // Warnings
    if (result.warnings.length > 0) {
      lines.push(`Warnings: ${result.warnings.length}`);
      for (const warn of result.warnings) {
        const filePart = warn.file ? ` (${warn.file})` : '';
        lines.push(`  - [${warn.code}]${filePart}: ${warn.message}`);
        if (warn.suggestion) {
          lines.push(`    Suggestion: ${warn.suggestion}`);
        }
      }
      lines.push('');
    }

    // Result
    if (result.valid) {
      if (result.warnings.length > 0) {
        lines.push('Result: VALID (with warnings)');
      } else {
        lines.push('Result: VALID');
      }
    } else {
      lines.push('Result: INVALID');
    }

    return lines.join('\n');
  }

  /**
   * Validate workflow files in squad using WorkflowValidator
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<ValidationResult>} Validation result for workflows
   */
  async validateWorkflows(squadPath) {
    this._log(`Validating workflows in: ${squadPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const workflowsDir = path.join(squadPath, 'workflows');

    if (!(await this._pathExists(workflowsDir))) {
      return result; // No workflows dir is fine
    }

    let files;
    try {
      files = await fs.readdir(workflowsDir);
    } catch {
      return result;
    }

    const yamlFiles = files.filter(
      (f) => f.endsWith('.yaml') || f.endsWith('.yml'),
    );

    if (yamlFiles.length === 0) {
      return result; // No workflow files to validate
    }

    // Import WorkflowValidator
    let WorkflowValidator;
    try {
      ({ WorkflowValidator } = require('../workflow-validator'));
    } catch {
      result.warnings.push({
        code: 'WORKFLOW_VALIDATOR_UNAVAILABLE',
        message: 'WorkflowValidator module not found, skipping workflow content validation',
        suggestion: 'Ensure workflow-validator.js exists in .aiox-core/development/scripts/',
      });
      return result;
    }

    const coreAgentsPath = path.join(process.cwd(), '.aiox-core', 'development', 'agents');
    const validator = new WorkflowValidator({
      verbose: this.verbose,
      strict: this.strict,
      agentsPath: coreAgentsPath,
      squadAgentsPath: path.join(squadPath, 'agents'),
    });

    for (const yamlFile of yamlFiles) {
      const workflowPath = path.join(workflowsDir, yamlFile);
      const workflowResult = await validator.validate(workflowPath);
      this._mergeResults(result, workflowResult);
    }

    this._log(`Workflow validation: ${yamlFiles.length} files checked`);
    return result;
  }

  // ============ Private Helper Methods ============

  /**
   * Find manifest file in squad directory
   * @private
   */
  async _findManifest(squadPath) {
    for (const filename of MANIFEST_FILES) {
      const manifestPath = path.join(squadPath, filename);
      if (await this._pathExists(manifestPath)) {
        return manifestPath;
      }
    }
    return null;
  }

  /**
   * Check if path exists
   * @private
   */
  async _pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolve config path - check both local and project-level paths
   * Implements AC10.4: Validator Path Resolution
   *
   * @param {string} squadPath - Squad directory
   * @param {string} configPath - Path from squad.yaml config section
   * @returns {Promise<string|null>} Resolved absolute path or null if not found
   * @see Story SQS-10: Project Config Reference for Squads
   * @private
   */
  async _resolveConfigPath(squadPath, configPath) {
    if (!configPath) return null;

    // Resolve path relative to squad directory
    // path.resolve handles both local paths (config/file.md) and relative paths (../../docs/framework/...)
    // Simplified from redundant path.resolve + path.join (CodeRabbit nitpick)
    const resolvedPath = path.resolve(squadPath, configPath);
    if (await this._pathExists(resolvedPath)) {
      this._log(`Resolved config path: ${configPath} -> ${resolvedPath}`);
      return resolvedPath;
    }

    this._log(`Config path not found: ${configPath}`);
    return null;
  }

  /**
   * Validate a single task file
   * @private
   */
  async _validateTaskFile(taskPath) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };
    const filename = path.basename(taskPath);

    try {
      const content = await fs.readFile(taskPath, 'utf-8');

      // Check for required fields (case-insensitive, handle accents)
      for (const field of TASK_REQUIRED_FIELDS) {
        // Create patterns that handle Portuguese accents
        const patterns = [
          new RegExp(`^[#*-]*\\s*${field}\\s*:`, 'im'),
          new RegExp(
            `^[#*-]*\\s*${field.replace(/a/g, '[aá]').replace(/i/g, '[ií]')}\\s*:`,
            'im',
          ),
          // Also check for markdown headers with the field
          new RegExp(`^#+\\s*${field}`, 'im'),
        ];

        const found = patterns.some((p) => p.test(content));
        if (!found) {
          result.warnings.push({
            code: ValidationErrorCodes.TASK_MISSING_FIELD,
            file: filename,
            message: `Task missing recommended field: ${field}`,
            suggestion: `Add "${field}:" to ${filename} (TASK-FORMAT-SPECIFICATION-V1)`,
          });
        }
      }

      // Check naming convention
      if (!this._isKebabCase(path.basename(filename, '.md'))) {
        result.warnings.push({
          code: ValidationErrorCodes.INVALID_NAMING,
          file: filename,
          message: 'Task filename should be kebab-case',
          suggestion: 'Rename to use lowercase letters and hyphens only',
        });
      }
    } catch (error) {
      result.errors.push({
        code: ValidationErrorCodes.TASK_READ_ERROR,
        file: filename,
        message: `Failed to read task: ${error.message}`,
      });
      result.valid = false;
    }

    return result;
  }

  /**
   * Validate files referenced in manifest components
   * @private
   */
  async _validateReferencedFiles(squadPath, components, result) {
    const componentDirs = {
      tasks: 'tasks',
      agents: 'agents',
      workflows: 'workflows',
      checklists: 'checklists',
      templates: 'templates',
      tools: 'tools',
      scripts: 'scripts',
    };

    for (const [component, dir] of Object.entries(componentDirs)) {
      if (components[component] && Array.isArray(components[component])) {
        for (const file of components[component]) {
          const filePath = path.join(squadPath, dir, file);
          if (!(await this._pathExists(filePath))) {
            result.errors.push({
              code: ValidationErrorCodes.FILE_NOT_FOUND,
              message: `Referenced file not found: ${dir}/${file}`,
              suggestion: `Create ${filePath} or remove from components.${component}`,
            });
            result.valid = false;
          }
        }
      }
    }
  }

  /**
   * Check if string is kebab-case
   * @private
   */
  _isKebabCase(str) {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }

  /**
   * Get suggestion for schema error
   * @private
   */
  _getSchemaSuggestion(error) {
    const suggestions = {
      'must match pattern':
        'Use correct format (kebab-case for names, semver for versions)',
      'must be string': 'Wrap value in quotes',
      'must be array': 'Use YAML array syntax: [item1, item2] or - item',
      'must have required property': 'Add the missing required property',
      'must be equal to one of the allowed values': 'Use one of the allowed values',
    };

    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (error.message && error.message.includes(key)) {
        return suggestion;
      }
    }
    return 'Check squad.yaml syntax against the schema';
  }

  /**
   * Merge validation results
   * @private
   */
  _mergeResults(target, source) {
    target.errors.push(...(source.errors || []));
    target.warnings.push(...(source.warnings || []));
    target.suggestions.push(...(source.suggestions || []));
    if (source.errors && source.errors.length > 0) {
      target.valid = false;
    }
  }
}

module.exports = {
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,
  MANIFEST_FILES,
};
