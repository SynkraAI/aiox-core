/**
 * Squad Extender Utility
 *
 * Extends existing squads with new components (agents, tasks, workflows, etc.)
 * with automatic manifest updates and validation.
 *
 * Used by: squad-creator agent (*extend-squad task)
 *
 * @module squad-extender
 * @version 1.0.0
 * @see Story SQS-11: Squad Analyze & Extend
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default path for squads directory
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Default templates directory path
 * @constant {string}
 */
const DEFAULT_TEMPLATES_PATH = './.aiox-core/development/templates/squad';

/**
 * Component types and their configurations
 * @constant {Object}
 */
const COMPONENT_CONFIG = {
  agent: {
    directory: 'agents',
    extension: '.md',
    template: 'agent-template.md',
    manifestKey: 'agents',
  },
  task: {
    directory: 'tasks',
    extension: '.md',
    template: 'task-template.md',
    manifestKey: 'tasks',
  },
  workflow: {
    directory: 'workflows',
    extension: '.yaml',
    template: 'workflow-template.yaml',
    manifestKey: 'workflows',
  },
  checklist: {
    directory: 'checklists',
    extension: '.md',
    template: 'checklist-template.md',
    manifestKey: 'checklists',
  },
  template: {
    directory: 'templates',
    extension: '.md',
    template: 'template-template.md',
    manifestKey: 'templates',
  },
  tool: {
    directory: 'tools',
    extension: '.js',
    template: 'tool-template.js',
    manifestKey: 'tools',
  },
  script: {
    directory: 'scripts',
    extension: '.js',
    template: 'script-template.js',
    manifestKey: 'scripts',
  },
  data: {
    directory: 'data',
    extension: '.yaml',
    template: 'data-template.yaml',
    manifestKey: 'data',
  },
};

/**
 * Manifest file names in order of preference
 * @constant {string[]}
 */
const MANIFEST_FILES = ['squad.yaml', 'config.yaml'];

/**
 * Error codes for SquadExtenderError
 * @enum {string}
 */
const ErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  MANIFEST_UPDATE_FAILED: 'MANIFEST_UPDATE_FAILED',
  COMPONENT_EXISTS: 'COMPONENT_EXISTS',
  INVALID_COMPONENT_NAME: 'INVALID_COMPONENT_NAME',
  INVALID_COMPONENT_TYPE: 'INVALID_COMPONENT_TYPE',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  CREATION_FAILED: 'CREATION_FAILED',
};

/**
 * Custom error class for Squad Extender operations
 * @extends Error
 */
class SquadExtenderError extends Error {
  /**
   * Create a SquadExtenderError
   * @param {string} code - Error code from ErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadExtenderError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadExtenderError);
    }
  }

  /**
   * Create error for squad not found
   * @param {string} squadName - Name of the squad
   * @returns {SquadExtenderError}
   */
  static squadNotFound(squadName) {
    return new SquadExtenderError(
      ErrorCodes.SQUAD_NOT_FOUND,
      `Squad "${squadName}" not found`,
      `Use *list-squads to see available squads, or *create-squad ${squadName} to create it`,
    );
  }

  /**
   * Create error for manifest not found
   * @param {string} squadPath - Path to squad directory
   * @returns {SquadExtenderError}
   */
  static manifestNotFound(squadPath) {
    return new SquadExtenderError(
      ErrorCodes.MANIFEST_NOT_FOUND,
      `No squad.yaml or config.yaml found in ${squadPath}`,
      'Create squad.yaml with squad metadata',
    );
  }

  /**
   * Create error for component already exists
   * @param {string} filePath - Path to existing component
   * @returns {SquadExtenderError}
   */
  static componentExists(filePath) {
    return new SquadExtenderError(
      ErrorCodes.COMPONENT_EXISTS,
      `Component already exists at ${filePath}`,
      'Use --force to overwrite, or choose a different name',
    );
  }

  /**
   * Create error for invalid component name
   * @param {string} name - Invalid component name
   * @returns {SquadExtenderError}
   */
  static invalidComponentName(name) {
    return new SquadExtenderError(
      ErrorCodes.INVALID_COMPONENT_NAME,
      `Invalid component name: "${name}"`,
      'Use kebab-case (lowercase letters, numbers, and hyphens only)',
    );
  }

  /**
   * Create error for invalid component type
   * @param {string} type - Invalid component type
   * @returns {SquadExtenderError}
   */
  static invalidComponentType(type) {
    const validTypes = Object.keys(COMPONENT_CONFIG).join(', ');
    return new SquadExtenderError(
      ErrorCodes.INVALID_COMPONENT_TYPE,
      `Invalid component type: "${type}"`,
      `Valid types are: ${validTypes}`,
    );
  }

  /**
   * Create error for agent not found
   * @param {string} agentId - Agent ID not found
   * @param {string[]} availableAgents - List of available agents
   * @returns {SquadExtenderError}
   */
  static agentNotFound(agentId, availableAgents) {
    return new SquadExtenderError(
      ErrorCodes.AGENT_NOT_FOUND,
      `Agent "${agentId}" not found in squad`,
      `Available agents: ${availableAgents.join(', ')}`,
    );
  }

  /**
   * Create error for path traversal attempt
   * @param {string} name - Component name with path characters
   * @returns {SquadExtenderError}
   */
  static pathTraversal(name) {
    return new SquadExtenderError(
      ErrorCodes.PATH_TRAVERSAL,
      `Invalid component name - path traversal not allowed: "${name}"`,
      'Component names cannot contain path separators or ".."',
    );
  }
}

/**
 * Squad Extender class for adding new components to squads
 */
class SquadExtender {
  /**
   * Create a SquadExtender instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.squadsPath] - Custom squads directory path
   * @param {string} [options.templatesPath] - Custom templates directory path
   * @param {boolean} [options.verbose=false] - Enable verbose output
   */
  constructor(options = {}) {
    this.squadsPath = options.squadsPath || DEFAULT_SQUADS_PATH;
    this.templatesPath = options.templatesPath || DEFAULT_TEMPLATES_PATH;
    this.verbose = options.verbose || false;
  }

  /**
   * Add a new component to a squad
   * @param {string} squadName - Name of the squad
   * @param {Object} componentInfo - Component configuration
   * @param {string} componentInfo.type - Component type (agent, task, workflow, etc.)
   * @param {string} componentInfo.name - Component name (kebab-case)
   * @param {string} [componentInfo.agentId] - Agent ID (required for tasks)
   * @param {string} [componentInfo.description] - Component description
   * @param {string} [componentInfo.storyId] - Related story ID for traceability
   * @param {Object} [options={}] - Add options
   * @param {boolean} [options.force=false] - Overwrite existing component
   * @returns {Promise<Object>} Result object with file path and status
   */
  async addComponent(squadName, componentInfo, options = {}) {
    const { type, name, agentId, description, storyId } = componentInfo;
    const { force = false } = options;

    // Validate inputs
    this._validateComponentType(type);
    this._validateComponentName(name);

    const squadPath = path.join(this.squadsPath, squadName);

    // Check squad exists
    const exists = await this._directoryExists(squadPath);
    if (!exists) {
      throw SquadExtenderError.squadNotFound(squadName);
    }

    // For tasks, validate agent exists
    if (type === 'task' && agentId) {
      await this._validateAgentExists(squadPath, agentId);
    }

    // Get component config
    const config = COMPONENT_CONFIG[type];

    // Build file name
    const fileName = this._buildFileName(type, name, agentId, config.extension);

    // Build target path
    const targetDir = path.join(squadPath, config.directory);
    const targetPath = path.join(targetDir, fileName);
    const relativePath = path.join(config.directory, fileName);

    // Check if file already exists
    if (await this._fileExists(targetPath)) {
      if (!force) {
        throw SquadExtenderError.componentExists(relativePath);
      }
      // Create backup before overwriting
      await this._createBackup(targetPath);
    }

    // Ensure target directory exists
    await this._ensureDirectory(targetDir);

    // Load and render template
    const content = await this._renderTemplate(type, {
      componentName: name,
      agentId,
      description: description || `${type} component: ${name}`,
      storyId: storyId || '',
      squadName,
      createdAt: new Date().toISOString().split('T')[0],
    });

    // Write component file
    await fs.writeFile(targetPath, content, 'utf8');

    // Update manifest
    const manifestUpdated = await this.updateManifest(squadPath, {
      type,
      file: fileName,
    });

    return {
      success: true,
      filePath: targetPath,
      relativePath,
      fileName,
      type,
      templateUsed: config.template,
      manifestUpdated,
    };
  }

  /**
   * Update squad manifest with new component
   * @param {string} squadPath - Path to squad directory
   * @param {Object} componentInfo - Component information
   * @param {string} componentInfo.type - Component type
   * @param {string} componentInfo.file - Component file name
   * @returns {Promise<boolean>} True if manifest was updated
   */
  async updateManifest(squadPath, componentInfo) {
    const { type, file } = componentInfo;
    const config = COMPONENT_CONFIG[type];
    const manifestKey = config.manifestKey;

    // Find manifest file
    const { manifestPath, manifest } = await this._loadManifest(squadPath);

    // Create backup
    await this._createBackup(manifestPath);

    // Ensure components section exists
    if (!manifest.components) {
      manifest.components = {};
    }

    // Ensure component type array exists
    if (!manifest.components[manifestKey]) {
      manifest.components[manifestKey] = [];
    }

    // Add file if not already present
    if (!manifest.components[manifestKey].includes(file)) {
      manifest.components[manifestKey].push(file);
    }

    // Write updated manifest
    const yamlContent = yaml.dump(manifest, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    await fs.writeFile(manifestPath, yamlContent, 'utf8');

    return true;
  }

  /**
   * List agents in a squad
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<string[]>} List of agent IDs
   */
  async listAgents(squadPath) {
    const agentsDir = path.join(squadPath, 'agents');
    try {
      const entries = await fs.readdir(agentsDir, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => entry.name.replace('.md', ''));
    } catch {
      return [];
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Validate component type
   * @private
   */
  _validateComponentType(type) {
    if (!COMPONENT_CONFIG[type]) {
      throw SquadExtenderError.invalidComponentType(type);
    }
  }

  /**
   * Validate component name (kebab-case)
   * @private
   */
  _validateComponentName(name) {
    // Check for path traversal
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
      throw SquadExtenderError.pathTraversal(name);
    }

    // Check kebab-case format
    const kebabCasePattern = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;
    if (!kebabCasePattern.test(name)) {
      throw SquadExtenderError.invalidComponentName(name);
    }
  }

  /**
   * Validate agent exists in squad
   * @private
   */
  async _validateAgentExists(squadPath, agentId) {
    const agents = await this.listAgents(squadPath);
    if (!agents.includes(agentId)) {
      throw SquadExtenderError.agentNotFound(agentId, agents);
    }
  }

  /**
   * Build file name for component
   * @private
   */
  _buildFileName(type, name, agentId, extension) {
    // For tasks, prepend agent ID
    if (type === 'task' && agentId) {
      return `${agentId}-${name}${extension}`;
    }
    return `${name}${extension}`;
  }

  /**
   * Check if directory exists
   * @private
   */
  async _directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if file exists
   * @private
   */
  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure directory exists, create if not
   * @private
   */
  async _ensureDirectory(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Create backup of file
   * @private
   */
  async _createBackup(filePath) {
    try {
      const backupPath = `${filePath}.bak`;
      await fs.copyFile(filePath, backupPath);
      if (this.verbose) {
        console.log(`Backup created: ${backupPath}`);
      }
    } catch {
      // File might not exist yet, that's ok
    }
  }

  /**
   * Load squad manifest
   * @private
   */
  async _loadManifest(squadPath) {
    for (const manifestFile of MANIFEST_FILES) {
      const manifestPath = path.join(squadPath, manifestFile);
      try {
        const content = await fs.readFile(manifestPath, 'utf8');
        const manifest = yaml.load(content);
        return { manifestPath, manifest };
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw new SquadExtenderError(
            ErrorCodes.MANIFEST_UPDATE_FAILED,
            `Failed to parse ${manifestFile}: ${error.message}`,
            'Check YAML syntax - use a YAML linter',
          );
        }
      }
    }

    throw SquadExtenderError.manifestNotFound(squadPath);
  }

  /**
   * Load and render template
   * @private
   */
  async _renderTemplate(type, context) {
    const config = COMPONENT_CONFIG[type];
    const templatePath = path.join(this.templatesPath, config.template);

    try {
      // Try to load template from templates path
      const template = await fs.readFile(templatePath, 'utf8');
      return this._interpolateTemplate(template, context);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Template not found, use default template
        return this._getDefaultTemplate(type, context);
      }
      throw error;
    }
  }

  /**
   * Interpolate template variables
   * @private
   */
  _interpolateTemplate(template, context) {
    let result = template;
    for (const [key, value] of Object.entries(context)) {
      const placeholder = new RegExp(`\\{\\{${key.toUpperCase()}\\}\\}`, 'g');
      result = result.replace(placeholder, value || '');
    }
    return result;
  }

  /**
   * Get default template for component type
   * @private
   */
  _getDefaultTemplate(type, context) {
    const templates = {
      agent: `# ${context.componentName}

> Agent definition for ${context.squadName}
> Created: ${context.createdAt}
${context.storyId ? `> Story: ${context.storyId}` : ''}

## Description

${context.description}

## Configuration

\`\`\`yaml
agent:
  name: ${context.componentName}
  id: ${context.componentName}
  title: "Agent Title"
  icon: "🤖"

persona:
  role: "Describe the agent's role"
  style: "Communication style"

commands:
  - help: "Show available commands"
  - exit: "Exit agent mode"

dependencies:
  tasks: []
  templates: []
\`\`\`
`,

      task: `---
task: ${context.componentName}
responsavel: "@${context.agentId || 'agent'}"
responsavel_type: Agent
atomic_layer: Task
elicit: false

Entrada:
  - campo: input_param
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: "Description of validation"

Saida:
  - campo: output_result
    tipo: object
    destino: Return value
    persistido: false

Checklist:
  - "[ ] Step 1"
  - "[ ] Step 2"
  - "[ ] Step 3"
---

# ${context.componentName}

## Description

${context.description}

${context.storyId ? `## Story Reference\n\n- **Story:** ${context.storyId}\n` : ''}

## Execution Steps

### Step 1: Initialize

\`\`\`javascript
// Implementation here
\`\`\`

### Step 2: Process

\`\`\`javascript
// Implementation here
\`\`\`

### Step 3: Complete

\`\`\`javascript
// Implementation here
\`\`\`

## Error Handling

\`\`\`yaml
error: ERROR_CODE
cause: Description of cause
resolution: How to resolve
\`\`\`

## Metadata

\`\`\`yaml
${context.storyId ? `story: ${context.storyId}` : 'story: N/A'}
version: 1.0.0
created: ${context.createdAt}
author: squad-creator
\`\`\`
`,

      workflow: `# ${context.componentName} Workflow

name: ${context.componentName}
description: ${context.description}
version: 1.0.0
${context.storyId ? `story: ${context.storyId}` : ''}
created: ${context.createdAt}

# Trigger conditions
triggers:
  - manual

# Workflow steps
steps:
  - id: step-1
    name: "Step 1"
    description: "Description of step 1"
    action: task
    task: task-name

  - id: step-2
    name: "Step 2"
    description: "Description of step 2"
    action: task
    task: task-name
    depends_on:
      - step-1

# Completion criteria
completion:
  success_message: "Workflow completed successfully"
  failure_message: "Workflow failed"
`,

      checklist: `# ${context.componentName} Checklist

> ${context.description}
> Created: ${context.createdAt}
${context.storyId ? `> Story: ${context.storyId}` : ''}

## Pre-Conditions

- [ ] Pre-condition 1
- [ ] Pre-condition 2

## Validation Items

### Category 1

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

### Category 2

- [ ] Item 4
- [ ] Item 5

## Post-Conditions

- [ ] Post-condition 1
- [ ] Post-condition 2
`,

      template: `# ${context.componentName} Template

> ${context.description}
> Created: ${context.createdAt}
${context.storyId ? `> Story: ${context.storyId}` : ''}

## Template Content

Replace placeholders with actual values:

- {{PLACEHOLDER_1}}: Description
- {{PLACEHOLDER_2}}: Description

---

## Content

{{PLACEHOLDER_1}}

### Section 1

{{PLACEHOLDER_2}}

---

*Template generated by squad-creator*
`,

      tool: `/**
 * ${context.componentName} Tool
 *
 * ${context.description}
 *
 * @module ${context.componentName}
 * @version 1.0.0
 ${context.storyId ? `* @see ${context.storyId}` : ''}
 */

/**
 * Main function for ${context.componentName}
 * @param {Object} input - Input parameters
 * @returns {Object} Result
 */
function ${this._toCamelCase(context.componentName)}(input) {
  // Implementation here
  return {
    success: true,
    data: {},
  };
}

module.exports = {
  ${this._toCamelCase(context.componentName)},
};
`,

      script: `#!/usr/bin/env node

/**
 * ${context.componentName} Script
 *
 * ${context.description}
 *
 * @module ${context.componentName}
 * @version 1.0.0
 ${context.storyId ? `* @see ${context.storyId}` : ''}
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Main entry point
 * @param {string[]} args - Command line arguments
 */
async function main(args) {
  console.log('${context.componentName} script started');

  // Implementation here

  console.log('${context.componentName} script completed');
}

// Run if called directly
if (require.main === module) {
  main(process.argv.slice(2))
    .catch((error) => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = { main };
`,

      data: `# ${context.componentName} Data

name: ${context.componentName}
description: ${context.description}
version: 1.0.0
${context.storyId ? `story: ${context.storyId}` : ''}
created: ${context.createdAt}

# Data schema
schema:
  type: object
  properties:
    field1:
      type: string
      description: "Field description"
    field2:
      type: number
      description: "Field description"

# Default values
defaults:
  field1: "default value"
  field2: 0

# Data entries
entries: []
`,
    };

    return templates[type] || `# ${context.componentName}\n\n${context.description}`;
  }

  /**
   * Convert kebab-case to camelCase
   * @private
   */
  _toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
}

module.exports = {
  SquadExtender,
  SquadExtenderError,
  ErrorCodes,
  COMPONENT_CONFIG,
};
