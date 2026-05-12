/**
 * Squad Generator
 *
 * Generates squad structure following task-first architecture.
 * Used by the *create-squad task of the squad-creator agent.
 *
 * @module squad-generator
 * @version 1.0.0
 * @see Story SQS-4: Squad Creator Agent + Tasks
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

/**
 * Default path for squads directory
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Default path for squad designs directory
 * @constant {string}
 */
const DEFAULT_DESIGNS_PATH = './squads/.designs';

/**
 * Path to squad design schema
 * @constant {string}
 */
const SQUAD_DESIGN_SCHEMA_PATH = path.join(__dirname, '../../schemas/squad-design-schema.json');

/**
 * Default AIOX minimum version
 * @constant {string}
 */
const DEFAULT_AIOX_MIN_VERSION = '2.1.0';

/**
 * Available templates
 * @constant {string[]}
 */
const AVAILABLE_TEMPLATES = ['basic', 'etl', 'agent-only'];

/**
 * Available config modes
 * @constant {string[]}
 */
const CONFIG_MODES = ['extend', 'override', 'none'];

/**
 * Available licenses
 * @constant {string[]}
 */
const AVAILABLE_LICENSES = ['MIT', 'Apache-2.0', 'ISC', 'UNLICENSED'];

/**
 * Directories to create in squad structure
 * @constant {string[]}
 */
const SQUAD_DIRECTORIES = [
  '',
  'config',
  'agents',
  'tasks',
  'workflows',
  'checklists',
  'templates',
  'tools',
  'scripts',
  'data',
];

/**
 * Error codes for SquadGeneratorError
 * @enum {string}
 */
const GeneratorErrorCodes = {
  INVALID_NAME: 'INVALID_NAME',
  SQUAD_EXISTS: 'SQUAD_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  INVALID_CONFIG_MODE: 'INVALID_CONFIG_MODE',
  BLUEPRINT_NOT_FOUND: 'BLUEPRINT_NOT_FOUND',
  BLUEPRINT_INVALID: 'BLUEPRINT_INVALID',
  BLUEPRINT_PARSE_ERROR: 'BLUEPRINT_PARSE_ERROR',
  SCHEMA_NOT_FOUND: 'SCHEMA_NOT_FOUND',
};

/**
 * Custom error class for Squad Generator operations
 * @extends Error
 */
class SquadGeneratorError extends Error {
  /**
   * Create a SquadGeneratorError
   * @param {string} code - Error code from GeneratorErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadGeneratorError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadGeneratorError);
    }
  }

  /**
   * Create error for invalid squad name
   * @param {string} name - Invalid name provided
   * @returns {SquadGeneratorError}
   */
  static invalidName(name) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.INVALID_NAME,
      `Invalid squad name "${name}": must be kebab-case (lowercase letters, numbers, hyphens)`,
      'Use format: my-squad-name (lowercase, hyphens only)',
    );
  }

  /**
   * Create error for existing squad
   * @param {string} name - Squad name that exists
   * @param {string} squadPath - Path where squad exists
   * @returns {SquadGeneratorError}
   */
  static squadExists(name, squadPath) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.SQUAD_EXISTS,
      `Squad "${name}" already exists at ${squadPath}`,
      `Choose a different name or delete existing squad: rm -rf ${squadPath}`,
    );
  }

  /**
   * Create error for invalid template
   * @param {string} template - Invalid template name
   * @returns {SquadGeneratorError}
   */
  static templateNotFound(template) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.TEMPLATE_NOT_FOUND,
      `Template "${template}" not found`,
      `Available templates: ${AVAILABLE_TEMPLATES.join(', ')}`,
    );
  }

  /**
   * Create error for invalid config mode
   * @param {string} mode - Invalid config mode
   * @returns {SquadGeneratorError}
   */
  static invalidConfigMode(mode) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.INVALID_CONFIG_MODE,
      `Invalid config mode "${mode}"`,
      `Available modes: ${CONFIG_MODES.join(', ')}`,
    );
  }

  /**
   * Create error for blueprint not found
   * @param {string} blueprintPath - Path that doesn't exist
   * @returns {SquadGeneratorError}
   */
  static blueprintNotFound(blueprintPath) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.BLUEPRINT_NOT_FOUND,
      `Blueprint not found at "${blueprintPath}"`,
      'Generate a blueprint first: *design-squad --docs ./your-docs.md',
    );
  }

  /**
   * Create error for blueprint parse error
   * @param {string} blueprintPath - Path to blueprint
   * @param {string} parseError - Parse error message
   * @returns {SquadGeneratorError}
   */
  static blueprintParseError(blueprintPath, parseError) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.BLUEPRINT_PARSE_ERROR,
      `Failed to parse blueprint at "${blueprintPath}": ${parseError}`,
      'Ensure blueprint is valid YAML format',
    );
  }

  /**
   * Create error for invalid blueprint
   * @param {string[]} validationErrors - List of validation errors
   * @returns {SquadGeneratorError}
   */
  static blueprintInvalid(validationErrors) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.BLUEPRINT_INVALID,
      `Blueprint validation failed:\n  - ${validationErrors.join('\n  - ')}`,
      'Fix the validation errors and try again',
    );
  }

  /**
   * Create error for schema not found
   * @param {string} schemaPath - Path to schema
   * @returns {SquadGeneratorError}
   */
  static schemaNotFound(schemaPath) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.SCHEMA_NOT_FOUND,
      `Schema not found at "${schemaPath}"`,
      'Ensure AIOX is properly installed',
    );
  }
}

/**
 * Get git user name
 * @returns {string} Git user name or 'Unknown'
 */
function getGitUserName() {
  try {
    const name = execSync('git config user.name', { encoding: 'utf-8' }).trim();
    return name || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Validate squad name (kebab-case)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
function isValidSquadName(name) {
  // Must be kebab-case: lowercase letters, numbers, and hyphens
  // Must start with letter, end with letter or number
  // Minimum 2 characters
  return /^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) && name.length >= 2;
}

/**
 * Extract slash prefix from squad name
 * @param {string} name - Squad name
 * @returns {string} Slash prefix
 */
function extractSlashPrefix(name) {
  // Remove -squad suffix if present
  return name.replace(/-squad$/, '');
}

/**
 * Safely quote YAML values that may contain special characters
 * @param {string} val - Value to quote
 * @returns {string} Safely quoted value
 */
function safeYamlValue(val) {
  if (!val) return '""';
  // Quote if contains special YAML characters or leading/trailing spaces
  if (/[:\n\r"']/.test(val) || val.startsWith(' ') || val.endsWith(' ')) {
    return `"${val.replace(/"/g, '\\"')}"`;
  }
  return val;
}

// =============================================================================
// TEMPLATES
// =============================================================================

/**
 * Generate squad.yaml content
 * @param {Object} config - Squad configuration
 * @returns {string} YAML content
 */
function generateSquadYaml(config) {
  const components = {
    tasks: config.includeTask ? ['example-agent-task.md'] : [],
    agents: config.includeAgent ? ['example-agent.md'] : [],
    workflows: [],
    checklists: [],
    templates: [],
    tools: [],
    scripts: [],
  };

  // For etl template, add more components
  if (config.template === 'etl') {
    components.agents = ['data-extractor.md', 'data-transformer.md'];
    components.tasks = [
      'extract-data.md',
      'transform-data.md',
      'load-data.md',
    ];
    components.scripts = ['utils.js'];
  }

  // For agent-only template
  if (config.template === 'agent-only') {
    components.agents = ['primary-agent.md', 'helper-agent.md'];
    components.tasks = [];
  }

  // SQS-10: Use project configs if available, otherwise use local paths
  let configSection;
  if (config.configMode === 'none') {
    configSection = {};
  } else if (config._useProjectConfigs && config._projectConfigs) {
    // Reference project-level config files
    configSection = {
      extends: config.configMode,
      'coding-standards': config._projectConfigs['coding-standards'] || 'config/coding-standards.md',
      'tech-stack': config._projectConfigs['tech-stack'] || 'config/tech-stack.md',
      'source-tree': config._projectConfigs['source-tree'] || 'config/source-tree.md',
    };
  } else {
    // Fallback to local config files
    configSection = {
      extends: config.configMode,
      'coding-standards': 'config/coding-standards.md',
      'tech-stack': 'config/tech-stack.md',
      'source-tree': 'config/source-tree.md',
    };
  }

  const yaml = `name: ${config.name}
version: 1.0.0
description: ${safeYamlValue(config.description || 'Custom squad')}
author: ${safeYamlValue(config.author || 'Unknown')}
license: ${config.license || 'MIT'}
slashPrefix: ${extractSlashPrefix(config.name)}

aiox:
  minVersion: "${config.aioxMinVersion || DEFAULT_AIOX_MIN_VERSION}"
  type: squad

components:
  tasks:${components.tasks.length ? '\n    - ' + components.tasks.join('\n    - ') : ' []'}
  agents:${components.agents.length ? '\n    - ' + components.agents.join('\n    - ') : ' []'}
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts:${components.scripts.length ? '\n    - ' + components.scripts.join('\n    - ') : ' []'}

config:${
  config.configMode === 'none'
    ? ' {}'
    : `
  extends: ${configSection.extends}
  coding-standards: ${configSection['coding-standards']}
  tech-stack: ${configSection['tech-stack']}
  source-tree: ${configSection['source-tree']}`
}

dependencies:
  node: []
  python: []
  squads: []

tags:
  - custom
`;

  return yaml;
}

/**
 * Generate README.md content
 * @param {Object} config - Squad configuration
 * @returns {string} Markdown content
 */
function generateReadme(config) {
  return `# ${config.name}

${config.description || 'Custom AIOX squad.'}

## Installation

This squad is installed locally in your project:

\`\`\`
./squads/${config.name}/
\`\`\`

## Usage

Activate agents from this squad and use their commands.

### Available Agents

${config.includeAgent || config.template !== 'basic' ? '- **example-agent** - Example agent (customize or remove)' : '_No agents defined yet_'}

### Available Tasks

${config.includeTask || config.template === 'etl' ? '- **example-agent-task** - Example task (customize or remove)' : '_No tasks defined yet_'}

## Configuration

This squad ${config.configMode === 'extend' ? 'extends' : config.configMode === 'override' ? 'overrides' : 'does not inherit'} the core AIOX configuration.

## Development

1. Add agents in \`agents/\` directory
2. Add tasks in \`tasks/\` directory (task-first architecture!)
3. Update \`squad.yaml\` components section
4. Validate: \`@squad-creator *validate-squad ${config.name}\`

## License

${config.license || 'MIT'}
`;
}

/**
 * Generate coding-standards.md content
 * @param {Object} config - Squad configuration
 * @returns {string} Markdown content
 */
function generateCodingStandards(config) {
  return `# Coding Standards - ${config.name}

> This file ${config.configMode === 'extend' ? 'extends' : config.configMode === 'override' ? 'overrides' : 'is independent of'} the core AIOX coding standards.

## Code Style

- Follow consistent naming conventions
- Use meaningful variable and function names
- Keep functions small and focused
- Document complex logic with comments

## File Organization

- Place agents in \`agents/\` directory
- Place tasks in \`tasks/\` directory
- Place utilities in \`scripts/\` directory

## Testing

- Write tests for all new functionality
- Maintain test coverage above 80%
- Use descriptive test names

## Documentation

- Document all public APIs
- Include examples in documentation
- Keep README.md up to date
`;
}

/**
 * Generate tech-stack.md content
 * @param {Object} config - Squad configuration
 * @returns {string} Markdown content
 */
function generateTechStack(config) {
  return `# Tech Stack - ${config.name}

## Runtime

- Node.js >= 18.x
- AIOX >= ${config.aioxMinVersion || DEFAULT_AIOX_MIN_VERSION}

## Dependencies

_Add your squad's dependencies here_

## Development Tools

- ESLint for code quality
- Jest for testing
- Prettier for formatting
`;
}

/**
 * Generate source-tree.md content
 * @param {Object} config - Squad configuration
 * @returns {string} Markdown content
 */
function generateSourceTree(config) {
  return `# Source Tree - ${config.name}

\`\`\`
${config.name}/
├── squad.yaml              # Squad manifest
├── README.md               # Documentation
├── config/                 # Configuration files
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
├── agents/                 # Agent definitions
├── tasks/                  # Task definitions
├── workflows/              # Multi-step workflows
├── checklists/             # Validation checklists
├── templates/              # Document templates
├── tools/                  # Custom tools
├── scripts/                # Utility scripts
└── data/                   # Static data
\`\`\`

## Directory Purpose

| Directory | Purpose |
|-----------|---------|
| \`agents/\` | Agent persona definitions (.md) |
| \`tasks/\` | Executable task workflows (.md) |
| \`workflows/\` | Multi-step workflow definitions |
| \`checklists/\` | Validation and review checklists |
| \`templates/\` | Document and code templates |
| \`tools/\` | Custom tool definitions |
| \`scripts/\` | JavaScript/Python utilities |
| \`data/\` | Static data files |
`;
}

/**
 * Generate example agent content
 * @param {Object} config - Squad configuration
 * @returns {string} Markdown content
 */
function generateExampleAgent(config) {
  const agentName = config.template === 'etl' ? 'data-extractor' : 'example-agent';
  const title = config.template === 'etl' ? 'Data Extractor' : 'Example Agent';

  return `# ${agentName}

## Agent Definition

\`\`\`yaml
agent:
  name: ${title.replace(/ /g, '')}
  id: ${agentName}
  title: ${title}
  icon: "🤖"
  whenToUse: "Use for ${config.template === 'etl' ? 'extracting data from sources' : 'example purposes - customize this'}"

persona:
  role: ${config.template === 'etl' ? 'Data Extraction Specialist' : 'Example Specialist'}
  style: Systematic, thorough
  focus: ${config.template === 'etl' ? 'Extracting data efficiently' : 'Demonstrating squad structure'}

commands:
  - name: help
    description: "Show available commands"
  - name: run
    description: "${config.template === 'etl' ? 'Extract data from source' : 'Run example task'}"
    task: ${config.template === 'etl' ? 'extract-data.md' : 'example-agent-task.md'}
\`\`\`

## Usage

\`\`\`
@${agentName}
*help
*run
\`\`\`
`;
}

/**
 * Generate example task content
 * @param {Object} config - Squad configuration
 * @returns {string} Markdown content
 */
function generateExampleTask(config) {
  const taskName = config.template === 'etl' ? 'extract-data' : 'example-agent-task';
  const title = config.template === 'etl' ? 'Extract Data' : 'Example Task';

  return `---
task: ${title}
responsavel: "@${config.template === 'etl' ? 'data-extractor' : 'example-agent'}"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - source: Data source path or URL
  - format: Output format (json, csv, yaml)
Saida: |
  - data: Extracted data
  - status: Success or error message
Checklist:
  - "[ ] Validate input parameters"
  - "[ ] Connect to source"
  - "[ ] Extract data"
  - "[ ] Format output"
  - "[ ] Return result"
---

# *${taskName.replace(/-/g, '-')}

${config.template === 'etl' ? 'Extracts data from the specified source.' : 'Example task demonstrating task-first architecture.'}

## Usage

\`\`\`
@${config.template === 'etl' ? 'data-extractor' : 'example-agent'}
*${taskName.replace('example-agent-', '')} --source ./data/input.json --format json
\`\`\`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`--source\` | string | Yes | Data source path or URL |
| \`--format\` | string | No | Output format (default: json) |

## Example

\`\`\`javascript
// This is a placeholder - implement your logic here
async function execute(options) {
  const { source, format } = options;

  // TODO: Implement extraction logic
  console.log(\`Extracting from \${source} as \${format}\`);

  return { status: 'success', data: {} };
}
\`\`\`
`;
}

// =============================================================================
// SQUAD GENERATOR CLASS
// =============================================================================

/**
 * Squad Generator class
 * Generates complete squad structure with all necessary files
 */
class SquadGenerator {
  /**
   * Create a SquadGenerator
   * @param {Object} options - Generator options
   * @param {string} [options.squadsPath] - Path to squads directory
   */
  constructor(options = {}) {
    this.squadsPath = options.squadsPath || DEFAULT_SQUADS_PATH;
  }

  /**
   * Check if a path exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if exists
   */
  async pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect project-level configuration files in docs/framework/
   * Implements AC10.1: Project Config Detection
   *
   * @param {string} projectRoot - Project root directory
   * @param {string} squadPath - Path to squad being created (for relative paths)
   * @returns {Promise<Object|null>} Detected config paths (relative to squadPath) or null if not found
   * @see Story SQS-10: Project Config Reference for Squads
   */
  async detectProjectConfigs(projectRoot, squadPath) {
    const frameworkDir = path.join(projectRoot, 'docs', 'framework');

    // Check if docs/framework/ exists
    if (!(await this.pathExists(frameworkDir))) {
      return null;
    }

    // Config files to detect (case-insensitive variants)
    const configFiles = {
      'coding-standards': ['CODING-STANDARDS.md', 'coding-standards.md', 'Coding-Standards.md'],
      'tech-stack': ['TECH-STACK.md', 'tech-stack.md', 'Tech-Stack.md'],
      'source-tree': ['SOURCE-TREE.md', 'source-tree.md', 'Source-Tree.md'],
    };

    const detected = {};

    for (const [key, variants] of Object.entries(configFiles)) {
      for (const filename of variants) {
        const fullPath = path.join(frameworkDir, filename);
        if (await this.pathExists(fullPath)) {
          // Calculate relative path from squad to project config
          detected[key] = path.relative(squadPath, fullPath).replace(/\\/g, '/');
          break;
        }
      }
    }

    // Only return if at least one config file was found
    const foundCount = Object.keys(detected).length;
    if (foundCount > 0) {
      console.log(`[squad-generator] Detected ${foundCount} project config(s) in docs/framework/`);
      return detected;
    }

    return null;
  }

  /**
   * Validate generation configuration
   * @param {Object} config - Configuration to validate
   * @throws {SquadGeneratorError} If validation fails
   */
  validateConfig(config) {
    // Validate name
    if (!config.name) {
      throw new SquadGeneratorError(
        GeneratorErrorCodes.INVALID_NAME,
        'Squad name is required',
        'Provide a name: *create-squad my-squad-name',
      );
    }

    if (!isValidSquadName(config.name)) {
      throw SquadGeneratorError.invalidName(config.name);
    }

    // Validate template
    if (config.template && !AVAILABLE_TEMPLATES.includes(config.template)) {
      throw SquadGeneratorError.templateNotFound(config.template);
    }

    // Validate config mode
    if (config.configMode && !CONFIG_MODES.includes(config.configMode)) {
      throw SquadGeneratorError.invalidConfigMode(config.configMode);
    }
  }

  /**
   * Generate a new squad
   * @param {Object} config - Squad configuration
   * @param {string} config.name - Squad name (kebab-case)
   * @param {string} [config.description] - Squad description
   * @param {string} [config.author] - Author name
   * @param {string} [config.license] - License type
   * @param {string} [config.template='basic'] - Template type
   * @param {string} [config.configMode='extend'] - Config inheritance mode
   * @param {boolean} [config.includeAgent=true] - Include example agent
   * @param {boolean} [config.includeTask=true] - Include example task
   * @param {string} [config.aioxMinVersion] - Minimum AIOX version
   * @param {string} [config.projectRoot] - Project root directory (for detecting project configs)
   * @returns {Promise<Object>} Generation result with path and files
   * @throws {SquadGeneratorError} If generation fails
   */
  async generate(config) {
    // Set defaults
    const fullConfig = {
      name: config.name,
      description: config.description || 'Custom squad',
      author: config.author || getGitUserName(),
      license: config.license || 'MIT',
      template: config.template || 'basic',
      configMode: config.configMode || 'extend',
      includeAgent: config.includeAgent !== false,
      includeTask: config.includeTask !== false,
      aioxMinVersion: config.aioxMinVersion || DEFAULT_AIOX_MIN_VERSION,
      projectRoot: config.projectRoot || process.cwd(),
    };

    // Validate configuration
    this.validateConfig(fullConfig);

    const squadPath = path.join(this.squadsPath, fullConfig.name);

    // SQS-10: Detect project-level configs when configMode is 'extend'
    let projectConfigs = null;
    let useProjectConfigs = false;

    if (fullConfig.configMode === 'extend') {
      projectConfigs = await this.detectProjectConfigs(fullConfig.projectRoot, squadPath);
      useProjectConfigs = projectConfigs !== null;

      if (useProjectConfigs) {
        console.log('[squad-generator] Using project-level configuration from docs/framework/');
      }
    }

    // Store for use in squad.yaml generation
    fullConfig._projectConfigs = projectConfigs;
    fullConfig._useProjectConfigs = useProjectConfigs;

    // Check if squad already exists
    if (await this.pathExists(squadPath)) {
      throw SquadGeneratorError.squadExists(fullConfig.name, squadPath);
    }

    // Create directories
    for (const dir of SQUAD_DIRECTORIES) {
      const dirPath = path.join(squadPath, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }

    // Track generated files
    const files = [];

    // Generate main files
    const mainFiles = {
      'squad.yaml': generateSquadYaml(fullConfig),
      'README.md': generateReadme(fullConfig),
    };

    for (const [filename, content] of Object.entries(mainFiles)) {
      const filePath = path.join(squadPath, filename);
      await fs.writeFile(filePath, content, 'utf-8');
      files.push(filePath);
    }

    // Generate config files (SQS-10: skip if using project configs)
    if (useProjectConfigs) {
      // Don't create local config files, just add .gitkeep to config directory
      console.log('[squad-generator] Skipping local config file creation (using project-level configs)');
      const gitkeepPath = path.join(squadPath, 'config', '.gitkeep');
      await fs.writeFile(gitkeepPath, '# Config files are referenced from project docs/framework/\n', 'utf-8');
      files.push(gitkeepPath);
    } else {
      // Fallback: Create local config files (AC10.3)
      console.log('[squad-generator] Creating local configuration files');
      const configFiles = {
        'config/coding-standards.md': generateCodingStandards(fullConfig),
        'config/tech-stack.md': generateTechStack(fullConfig),
        'config/source-tree.md': generateSourceTree(fullConfig),
      };

      for (const [filename, content] of Object.entries(configFiles)) {
        const filePath = path.join(squadPath, filename);
        await fs.writeFile(filePath, content, 'utf-8');
        files.push(filePath);
      }
    }

    // Generate example agent if requested
    if (fullConfig.includeAgent) {
      const agentContent = generateExampleAgent(fullConfig);
      const agentName =
        fullConfig.template === 'etl' ? 'data-extractor.md' : 'example-agent.md';
      const agentPath = path.join(squadPath, 'agents', agentName);
      await fs.writeFile(agentPath, agentContent, 'utf-8');
      files.push(agentPath);

      // For ETL template, add second agent
      if (fullConfig.template === 'etl') {
        const transformerConfig = { ...fullConfig, template: 'basic' };
        const transformerContent = generateExampleAgent(transformerConfig)
          .replace(/data-extractor/g, 'data-transformer')
          .replace(/Data Extractor/g, 'Data Transformer')
          .replace(/extracting data/g, 'transforming data')
          .replace(/extract-data/g, 'transform-data');
        const transformerPath = path.join(squadPath, 'agents', 'data-transformer.md');
        await fs.writeFile(transformerPath, transformerContent, 'utf-8');
        files.push(transformerPath);
      }

      // For agent-only template, add agents
      if (fullConfig.template === 'agent-only') {
        const primaryContent = generateExampleAgent({ ...fullConfig, template: 'basic' })
          .replace(/example-agent/g, 'primary-agent')
          .replace(/Example Agent/g, 'Primary Agent');
        const primaryPath = path.join(squadPath, 'agents', 'primary-agent.md');
        await fs.writeFile(primaryPath, primaryContent, 'utf-8');
        files.push(primaryPath);

        const helperContent = generateExampleAgent({ ...fullConfig, template: 'basic' })
          .replace(/example-agent/g, 'helper-agent')
          .replace(/Example Agent/g, 'Helper Agent');
        const helperPath = path.join(squadPath, 'agents', 'helper-agent.md');
        await fs.writeFile(helperPath, helperContent, 'utf-8');
        files.push(helperPath);
      }
    }

    // Generate example task if requested
    if (fullConfig.includeTask && fullConfig.template !== 'agent-only') {
      const taskContent = generateExampleTask(fullConfig);
      const taskName =
        fullConfig.template === 'etl' ? 'extract-data.md' : 'example-agent-task.md';
      const taskPath = path.join(squadPath, 'tasks', taskName);
      await fs.writeFile(taskPath, taskContent, 'utf-8');
      files.push(taskPath);

      // For ETL template, add more tasks
      if (fullConfig.template === 'etl') {
        const transformTask = generateExampleTask(fullConfig)
          .replace(/extract-data/g, 'transform-data')
          .replace(/Extract Data/g, 'Transform Data')
          .replace(/data-extractor/g, 'data-transformer')
          .replace(/Extracts data/g, 'Transforms data');
        const transformPath = path.join(squadPath, 'tasks', 'transform-data.md');
        await fs.writeFile(transformPath, transformTask, 'utf-8');
        files.push(transformPath);

        const loadTask = generateExampleTask(fullConfig)
          .replace(/extract-data/g, 'load-data')
          .replace(/Extract Data/g, 'Load Data')
          .replace(/data-extractor/g, 'data-loader')
          .replace(/Extracts data/g, 'Loads data');
        const loadPath = path.join(squadPath, 'tasks', 'load-data.md');
        await fs.writeFile(loadPath, loadTask, 'utf-8');
        files.push(loadPath);
      }
    }

    // For ETL template, create utils.js script
    if (fullConfig.template === 'etl') {
      const utilsContent = `/**
 * ETL Utilities
 *
 * Utility functions for ETL operations.
 */

/**
 * Format data for output
 * @param {Object} data - Data to format
 * @param {string} format - Output format (json, csv, yaml)
 * @returns {string} Formatted data
 */
function formatData(data, format = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv':
      // Simple CSV conversion
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => row[h]).join(','));
        return [headers.join(','), ...rows].join('\\n');
      }
      return '';
    case 'yaml':
      // Simple YAML conversion
      return Object.entries(data)
        .map(([k, v]) => \`\${k}: \${JSON.stringify(v)}\`)
        .join('\\n');
    default:
      return JSON.stringify(data);
  }
}

module.exports = { formatData };
`;
      const utilsPath = path.join(squadPath, 'scripts', 'utils.js');
      await fs.writeFile(utilsPath, utilsContent, 'utf-8');
      files.push(utilsPath);
    }

    // Add .gitkeep to empty directories
    const emptyDirs = ['workflows', 'checklists', 'templates', 'tools', 'data'];
    if (!fullConfig.includeAgent) {
      emptyDirs.push('agents');
    }
    if (!fullConfig.includeTask || fullConfig.template === 'agent-only') {
      emptyDirs.push('tasks');
    }
    if (fullConfig.template !== 'etl') {
      emptyDirs.push('scripts');
    }

    for (const dir of emptyDirs) {
      const gitkeepPath = path.join(squadPath, dir, '.gitkeep');
      // Only create .gitkeep if directory is empty
      try {
        const dirContents = await fs.readdir(path.join(squadPath, dir));
        if (dirContents.length === 0) {
          await fs.writeFile(gitkeepPath, '', 'utf-8');
          files.push(gitkeepPath);
        }
      } catch {
        // Directory might not exist, create .gitkeep anyway
        await fs.writeFile(gitkeepPath, '', 'utf-8');
        files.push(gitkeepPath);
      }
    }

    return {
      path: squadPath,
      files,
      config: fullConfig,
    };
  }

  /**
   * List local squads
   * @returns {Promise<Array>} List of squad info objects
   */
  async listLocal() {
    const squads = [];

    try {
      const entries = await fs.readdir(this.squadsPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const squadPath = path.join(this.squadsPath, entry.name);

        // Try to load manifest
        try {
          const manifestPath = path.join(squadPath, 'squad.yaml');
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');

          // Basic YAML parsing for key fields
          const nameMatch = manifestContent.match(/^name:\s*(.+)$/m);
          const versionMatch = manifestContent.match(/^version:\s*(.+)$/m);
          const descriptionMatch = manifestContent.match(/^description:\s*(.+)$/m);

          squads.push({
            name: nameMatch ? nameMatch[1].trim() : entry.name,
            version: versionMatch ? versionMatch[1].trim() : 'unknown',
            description: descriptionMatch ? descriptionMatch[1].trim() : '',
            path: squadPath,
          });
        } catch {
          // Try config.yaml fallback
          try {
            const configPath = path.join(squadPath, 'config.yaml');
            const configContent = await fs.readFile(configPath, 'utf-8');

            const nameMatch = configContent.match(/^name:\s*(.+)$/m);
            const versionMatch = configContent.match(/^version:\s*(.+)$/m);
            const descriptionMatch = configContent.match(/^description:\s*(.+)$/m);

            squads.push({
              name: nameMatch ? nameMatch[1].trim() : entry.name,
              version: versionMatch ? versionMatch[1].trim() : 'unknown',
              description: descriptionMatch ? descriptionMatch[1].trim() : '',
              path: squadPath,
              deprecated: true, // Using config.yaml
            });
          } catch {
            // No manifest found, still list but mark as invalid
            squads.push({
              name: entry.name,
              version: 'unknown',
              description: 'No manifest found',
              path: squadPath,
              invalid: true,
            });
          }
        }
      }
    } catch (err) {
      // Squads directory doesn't exist
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    return squads;
  }

  // ===========================================================================
  // BLUEPRINT METHODS (--from-design support)
  // ===========================================================================

  /**
   * Load a blueprint file from disk
   * @param {string} blueprintPath - Path to blueprint YAML file
   * @returns {Promise<Object>} Parsed blueprint object
   * @throws {SquadGeneratorError} If file not found or parse error
   */
  async loadBlueprint(blueprintPath) {
    // Check if blueprint exists
    if (!(await this.pathExists(blueprintPath))) {
      throw SquadGeneratorError.blueprintNotFound(blueprintPath);
    }

    try {
      const content = await fs.readFile(blueprintPath, 'utf-8');
      const blueprint = yaml.load(content);
      return blueprint;
    } catch (err) {
      if (err.name === 'YAMLException') {
        throw SquadGeneratorError.blueprintParseError(blueprintPath, err.message);
      }
      throw err;
    }
  }

  /**
   * Validate a blueprint against the schema
   * @param {Object} blueprint - Blueprint object to validate
   * @returns {Object} Validation result with isValid and errors
   */
  async validateBlueprint(blueprint) {
    const errors = [];

    // Required top-level fields
    if (!blueprint.squad) {
      errors.push('Missing required field: squad');
    } else {
      if (!blueprint.squad.name) {
        errors.push('Missing required field: squad.name');
      } else if (!isValidSquadName(blueprint.squad.name)) {
        errors.push(`Invalid squad name "${blueprint.squad.name}": must be kebab-case`);
      }
      if (!blueprint.squad.domain) {
        errors.push('Missing required field: squad.domain');
      }
    }

    if (!blueprint.recommendations) {
      errors.push('Missing required field: recommendations');
    } else {
      if (!Array.isArray(blueprint.recommendations.agents)) {
        errors.push('recommendations.agents must be an array');
      } else {
        // Validate each agent
        blueprint.recommendations.agents.forEach((agent, idx) => {
          if (!agent.id) {
            errors.push(`recommendations.agents[${idx}]: missing required field "id"`);
          } else if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(agent.id)) {
            errors.push(`recommendations.agents[${idx}]: id "${agent.id}" must be kebab-case`);
          }
          if (!agent.role) {
            errors.push(`recommendations.agents[${idx}]: missing required field "role"`);
          }
          if (typeof agent.confidence !== 'number' || agent.confidence < 0 || agent.confidence > 1) {
            errors.push(`recommendations.agents[${idx}]: confidence must be a number between 0 and 1`);
          }
        });
      }

      if (!Array.isArray(blueprint.recommendations.tasks)) {
        errors.push('recommendations.tasks must be an array');
      } else {
        // Validate each task
        blueprint.recommendations.tasks.forEach((task, idx) => {
          if (!task.name) {
            errors.push(`recommendations.tasks[${idx}]: missing required field "name"`);
          } else if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(task.name)) {
            errors.push(`recommendations.tasks[${idx}]: name "${task.name}" must be kebab-case`);
          }
          if (!task.agent) {
            errors.push(`recommendations.tasks[${idx}]: missing required field "agent"`);
          }
          if (typeof task.confidence !== 'number' || task.confidence < 0 || task.confidence > 1) {
            errors.push(`recommendations.tasks[${idx}]: confidence must be a number between 0 and 1`);
          }
        });
      }
    }

    if (!blueprint.metadata) {
      errors.push('Missing required field: metadata');
    } else {
      if (!blueprint.metadata.created_at) {
        errors.push('Missing required field: metadata.created_at');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert blueprint to SquadGenerator config format
   * @param {Object} blueprint - Validated blueprint object
   * @returns {Object} Config object for generate()
   */
  blueprintToConfig(blueprint) {
    const config = {
      name: blueprint.squad.name,
      description: blueprint.squad.description || `Squad for ${blueprint.squad.domain}`,
      template: blueprint.recommendations.template || 'custom',
      configMode: blueprint.recommendations.config_mode || 'extend',
      includeAgent: false, // We'll add custom agents, not example ones
      includeTask: false, // We'll add custom tasks, not example ones
      // Store blueprint data for custom generation
      _blueprint: blueprint,
    };

    return config;
  }

  /**
   * Generate agent markdown content from blueprint recommendation
   * @param {Object} agent - Agent recommendation from blueprint
   * @param {string} squadName - Name of the squad
   * @returns {string} Markdown content for agent file
   */
  generateAgentFromBlueprint(agent, squadName) {
    const commandsList = (agent.commands || [])
      .map(cmd => `  - name: ${cmd}\n    description: "${cmd.replace(/-/g, ' ')} operation"`)
      .join('\n');

    return `# ${agent.id}

## Agent Definition

\`\`\`yaml
agent:
  name: ${agent.id.replace(/-/g, '')}
  id: ${agent.id}
  title: "${agent.role}"
  icon: "🤖"
  whenToUse: "${agent.role}"

persona:
  role: ${agent.role}
  style: Systematic, thorough
  focus: Executing ${agent.id} responsibilities

commands:
  - name: help
    description: "Show available commands"
${commandsList}
\`\`\`

## Usage

\`\`\`
@${agent.id}
*help
\`\`\`

## Origin

Generated from squad design blueprint for ${squadName}.
Confidence: ${Math.round(agent.confidence * 100)}%
${agent.user_added ? 'Added by user during design refinement.' : ''}
${agent.user_modified ? 'Modified by user during design refinement.' : ''}
`;
  }

  /**
   * Generate task markdown content from blueprint recommendation
   * @param {Object} task - Task recommendation from blueprint
   * @param {string} squadName - Name of the squad
   * @returns {string} Markdown content for task file
   */
  generateTaskFromBlueprint(task, squadName) {
    const entradaList = (task.entrada || []).map(e => `  - ${e}`).join('\n');
    const saidaList = (task.saida || []).map(s => `  - ${s}`).join('\n');
    const checklistItems = (task.checklist || [
      '[ ] Validate input parameters',
      '[ ] Execute main logic',
      '[ ] Format output',
      '[ ] Return result',
    ]).map(item => `  - "${item.startsWith('[') ? item : '[ ] ' + item}"`).join('\n');

    return `---
task: "${task.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"
responsavel: "@${task.agent}"
responsavel_type: agent
atomic_layer: task
Entrada: |
${entradaList || '  - (no inputs defined)'}
Saida: |
${saidaList || '  - (no outputs defined)'}
Checklist:
${checklistItems}
---

# *${task.name}

Task generated from squad design blueprint for ${squadName}.

## Usage

\`\`\`
@${task.agent}
*${task.name}
\`\`\`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
${(task.entrada || []).map(e => `| \`${e}\` | string | Yes | ${e.replace(/_/g, ' ')} |`).join('\n') || '| - | - | - | No parameters defined |'}

## Output

${(task.saida || []).map(s => `- **${s}**: ${s.replace(/_/g, ' ')}`).join('\n') || '- No outputs defined'}

## Origin

Confidence: ${Math.round(task.confidence * 100)}%
`;
  }

  /**
   * Generate a squad from a blueprint file
   * @param {string} blueprintPath - Path to blueprint YAML file
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.force=false] - Force overwrite if squad exists
   * @returns {Promise<Object>} Generation result with path, files, and blueprint info
   * @throws {SquadGeneratorError} If blueprint is invalid or generation fails
   */
  async generateFromBlueprint(blueprintPath, options = {}) {
    // 1. Load blueprint
    const blueprint = await this.loadBlueprint(blueprintPath);

    // 2. Validate blueprint
    const validation = await this.validateBlueprint(blueprint);
    if (!validation.isValid) {
      throw SquadGeneratorError.blueprintInvalid(validation.errors);
    }

    // 3. Convert to config
    const config = this.blueprintToConfig(blueprint);

    // Check for existing squad
    const squadPath = path.join(this.squadsPath, config.name);
    if (await this.pathExists(squadPath)) {
      if (!options.force) {
        throw SquadGeneratorError.squadExists(config.name, squadPath);
      }
      // If force, remove existing squad directory before regenerating
      await fs.rm(squadPath, { recursive: true, force: true });
    }

    // 4. Generate base structure (without example agents/tasks)
    const result = await this.generate(config);

    // 5. Generate custom agents from blueprint
    const agentFiles = [];
    for (const agent of blueprint.recommendations.agents || []) {
      const agentContent = this.generateAgentFromBlueprint(agent, config.name);
      const agentPath = path.join(squadPath, 'agents', `${agent.id}.md`);
      await fs.writeFile(agentPath, agentContent, 'utf-8');
      agentFiles.push(agentPath);
    }

    // 6. Generate custom tasks from blueprint
    const taskFiles = [];
    for (const task of blueprint.recommendations.tasks || []) {
      const taskContent = this.generateTaskFromBlueprint(task, config.name);
      const taskPath = path.join(squadPath, 'tasks', `${task.name}.md`);
      await fs.writeFile(taskPath, taskContent, 'utf-8');
      taskFiles.push(taskPath);
    }

    // 7. Update squad.yaml with actual components
    const squadYamlPath = path.join(squadPath, 'squad.yaml');
    await this.updateSquadYamlComponents(squadYamlPath, blueprint);

    // 8. Return result with blueprint info
    return {
      ...result,
      files: [...result.files, ...agentFiles, ...taskFiles],
      blueprint: {
        path: blueprintPath,
        agents: blueprint.recommendations.agents?.length || 0,
        tasks: blueprint.recommendations.tasks?.length || 0,
        confidence: blueprint.metadata.overall_confidence || 0,
        source_docs: blueprint.metadata.source_docs || [],
      },
    };
  }

  /**
   * Update squad.yaml with actual components from blueprint
   * @param {string} squadYamlPath - Path to squad.yaml
   * @param {Object} blueprint - Blueprint object
   */
  async updateSquadYamlComponents(squadYamlPath, blueprint) {
    const content = await fs.readFile(squadYamlPath, 'utf-8');
    const squadManifest = yaml.load(content);

    // Update components
    squadManifest.components = squadManifest.components || {};
    squadManifest.components.agents = (blueprint.recommendations.agents || [])
      .map(a => `${a.id}.md`);
    squadManifest.components.tasks = (blueprint.recommendations.tasks || [])
      .map(t => `${t.name}.md`);

    // Add blueprint reference
    squadManifest.blueprint = {
      source: blueprint.metadata.source_docs || [],
      created_at: blueprint.metadata.created_at,
      confidence: blueprint.metadata.overall_confidence || 0,
    };

    // Write updated manifest
    const updatedContent = yaml.dump(squadManifest, {
      indent: 2,
      lineWidth: 120,
      quotingType: '"',
    });
    await fs.writeFile(squadYamlPath, updatedContent, 'utf-8');
  }
}

module.exports = {
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  DEFAULT_SQUADS_PATH,
  DEFAULT_DESIGNS_PATH,
  DEFAULT_AIOX_MIN_VERSION,
  SQUAD_DESIGN_SCHEMA_PATH,
  isValidSquadName,
  getGitUserName,
};
