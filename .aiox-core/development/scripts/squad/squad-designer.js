/**
 * Squad Designer
 *
 * Analyzes documentation and generates squad blueprints
 * with intelligent agent and task recommendations.
 *
 * @module squad-designer
 * @version 1.0.0
 * @see Story SQS-9: Squad Designer
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default output path for blueprints
 * @constant {string}
 */
const DEFAULT_DESIGNS_PATH = './squads/.designs';

/**
 * Minimum confidence threshold for recommendations
 * @constant {number}
 */
const MIN_CONFIDENCE_THRESHOLD = 0.5;

/**
 * Keywords that indicate workflow actions
 * @constant {string[]}
 */
const ACTION_KEYWORDS = [
  'create', 'add', 'new', 'generate', 'build',
  'update', 'edit', 'modify', 'change', 'patch',
  'delete', 'remove', 'cancel', 'archive',
  'get', 'fetch', 'retrieve', 'list', 'search', 'find', 'query',
  'process', 'handle', 'manage', 'execute', 'run',
  'validate', 'verify', 'check', 'approve', 'reject',
  'send', 'notify', 'alert', 'email', 'publish',
  'import', 'export', 'sync', 'migrate', 'transform',
  'login', 'logout', 'authenticate', 'authorize',
  'upload', 'download', 'save', 'load',
];

/**
 * Keywords that indicate integrations
 * @constant {string[]}
 */
const INTEGRATION_KEYWORDS = [
  'api', 'rest', 'graphql', 'webhook', 'endpoint',
  'database', 'db', 'sql', 'nosql', 'redis', 'postgres', 'mysql', 'mongodb',
  'aws', 'azure', 'gcp', 'cloud', 's3', 'lambda',
  'stripe', 'paypal', 'payment', 'gateway',
  'slack', 'discord', 'email', 'sms', 'twilio',
  'oauth', 'jwt', 'auth0', 'firebase',
  'github', 'gitlab', 'bitbucket',
  'docker', 'kubernetes', 'k8s',
];

/**
 * Keywords that indicate stakeholder roles
 * @constant {string[]}
 */
const ROLE_KEYWORDS = [
  'user', 'admin', 'administrator', 'manager', 'owner',
  'customer', 'client', 'buyer', 'seller', 'vendor',
  'developer', 'engineer', 'devops', 'qa', 'tester',
  'analyst', 'designer', 'architect',
  'operator', 'support', 'agent', 'representative',
];

/**
 * Error codes for SquadDesignerError
 * @enum {string}
 */
const DesignerErrorCodes = {
  NO_DOCUMENTATION: 'NO_DOCUMENTATION',
  PARSE_ERROR: 'PARSE_ERROR',
  EMPTY_ANALYSIS: 'EMPTY_ANALYSIS',
  BLUEPRINT_EXISTS: 'BLUEPRINT_EXISTS',
  INVALID_BLUEPRINT: 'INVALID_BLUEPRINT',
  SAVE_ERROR: 'SAVE_ERROR',
};

/**
 * Custom error class for Squad Designer operations
 * @extends Error
 */
class SquadDesignerError extends Error {
  /**
   * Create a SquadDesignerError
   * @param {string} code - Error code from DesignerErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadDesignerError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadDesignerError);
    }
  }

  /**
   * Create error for no documentation provided
   * @returns {SquadDesignerError}
   */
  static noDocumentation() {
    return new SquadDesignerError(
      DesignerErrorCodes.NO_DOCUMENTATION,
      'No documentation provided for analysis',
      'Provide documentation via --docs flag or paste text interactively',
    );
  }

  /**
   * Create error for parse failure
   * @param {string} filePath - Path that failed to parse
   * @param {string} reason - Parse failure reason
   * @returns {SquadDesignerError}
   */
  static parseError(filePath, reason) {
    return new SquadDesignerError(
      DesignerErrorCodes.PARSE_ERROR,
      `Failed to parse documentation: ${filePath} - ${reason}`,
      'Check file format (supported: .md, .yaml, .yml, .json, .txt)',
    );
  }

  /**
   * Create error for empty analysis result
   * @returns {SquadDesignerError}
   */
  static emptyAnalysis() {
    return new SquadDesignerError(
      DesignerErrorCodes.EMPTY_ANALYSIS,
      'No domain concepts could be extracted from documentation',
      'Provide more detailed documentation with clear entities and workflows',
    );
  }

  /**
   * Create error for existing blueprint
   * @param {string} blueprintPath - Path where blueprint exists
   * @returns {SquadDesignerError}
   */
  static blueprintExists(blueprintPath) {
    return new SquadDesignerError(
      DesignerErrorCodes.BLUEPRINT_EXISTS,
      `Blueprint already exists at ${blueprintPath}`,
      'Use --force to overwrite or choose a different output path',
    );
  }
}

/**
 * Squad Designer class
 * Analyzes documentation and generates squad blueprints
 */
class SquadDesigner {
  /**
   * Create a SquadDesigner
   * @param {Object} options - Designer options
   * @param {string} [options.designsPath] - Path to designs directory
   */
  constructor(options = {}) {
    this.designsPath = options.designsPath || DEFAULT_DESIGNS_PATH;
  }

  // ===========================================================================
  // DOCUMENTATION COLLECTION
  // ===========================================================================

  /**
   * Collect and normalize documentation from various sources
   * @param {Object} options - Collection options
   * @param {string|string[]} [options.docs] - File paths or text content
   * @param {string} [options.text] - Direct text input
   * @param {string} [options.domain] - Domain hint
   * @returns {Promise<Object>} Normalized documentation
   */
  async collectDocumentation(options) {
    const sources = [];

    // Handle file paths
    if (options.docs) {
      const paths = Array.isArray(options.docs)
        ? options.docs
        : options.docs.split(',').map(p => p.trim());

      for (const filePath of paths) {
        try {
          const content = await this.readDocumentationFile(filePath);
          sources.push({
            type: 'file',
            path: filePath,
            content,
          });
        } catch (error) {
          throw SquadDesignerError.parseError(filePath, error.message);
        }
      }
    }

    // Handle direct text input
    if (options.text) {
      sources.push({
        type: 'text',
        path: null,
        content: options.text,
      });
    }

    if (sources.length === 0) {
      throw SquadDesignerError.noDocumentation();
    }

    return {
      sources,
      domainHint: options.domain || null,
      mergedContent: sources.map(s => s.content).join('\n\n---\n\n'),
    };
  }

  /**
   * Read and parse a documentation file
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File content as text
   */
  async readDocumentationFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.yaml':
      case '.yml':
        // Convert YAML to readable text
        try {
          const parsed = yaml.load(content);
          return this.yamlToText(parsed);
        } catch {
          return content; // Return raw if parse fails
        }

      case '.json':
        // Convert JSON to readable text
        try {
          const parsed = JSON.parse(content);
          return this.jsonToText(parsed);
        } catch {
          return content;
        }

      case '.md':
      case '.txt':
      default:
        return content;
    }
  }

  /**
   * Convert YAML object to readable text
   * @param {Object} obj - Parsed YAML object
   * @param {number} [depth=0] - Current depth for indentation
   * @returns {string} Text representation
   */
  yamlToText(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    const indent = '  '.repeat(depth);
    const lines = [];

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        lines.push(`${indent}${key}:`);
        for (const item of value) {
          if (typeof item === 'object') {
            lines.push(`${indent}  - ${this.yamlToText(item, depth + 2)}`);
          } else {
            lines.push(`${indent}  - ${item}`);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`${indent}${key}:`);
        lines.push(this.yamlToText(value, depth + 1));
      } else {
        lines.push(`${indent}${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Convert JSON object to readable text
   * @param {Object} obj - Parsed JSON object
   * @returns {string} Text representation
   */
  jsonToText(obj) {
    return this.yamlToText(obj); // Reuse YAML converter
  }

  // ===========================================================================
  // DOMAIN ANALYSIS
  // ===========================================================================

  /**
   * Analyze documentation and extract domain concepts
   * @param {Object} documentation - Normalized documentation from collectDocumentation
   * @returns {Object} Analysis result with entities, workflows, integrations, stakeholders
   */
  analyzeDomain(documentation) {
    const content = documentation.mergedContent.toLowerCase();
    const originalContent = documentation.mergedContent;

    const analysis = {
      domain: this.extractDomain(originalContent, documentation.domainHint),
      entities: this.extractEntities(originalContent),
      workflows: this.extractWorkflows(content, originalContent),
      integrations: this.extractIntegrations(content),
      stakeholders: this.extractStakeholders(content),
    };

    // Validate we extracted something useful
    if (
      analysis.entities.length === 0 &&
      analysis.workflows.length === 0
    ) {
      throw SquadDesignerError.emptyAnalysis();
    }

    return analysis;
  }

  /**
   * Extract domain name from content
   * @param {string} content - Original content
   * @param {string|null} hint - Domain hint if provided
   * @returns {string} Domain name
   */
  extractDomain(content, hint) {
    if (hint) {
      return this.toDomainName(hint);
    }

    // Try to extract from title/heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return this.toDomainName(titleMatch[1]);
    }

    // Try to extract from "name:" in YAML
    const nameMatch = content.match(/name:\s*(.+)/i);
    if (nameMatch) {
      return this.toDomainName(nameMatch[1]);
    }

    return 'custom-domain';
  }

  /**
   * Convert text to domain name format
   * @param {string} text - Input text
   * @returns {string} Kebab-case domain name
   */
  toDomainName(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Extract entities (nouns, concepts) from content
   * @param {string} content - Original content (preserves case)
   * @returns {string[]} List of entities
   */
  extractEntities(content) {
    const entities = new Set();

    // Find capitalized words (likely entities)
    const capitalizedPattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\b/g;
    let match;
    while ((match = capitalizedPattern.exec(content)) !== null) {
      const word = match[1];
      // Filter out common non-entity words
      if (!this.isCommonWord(word) && word.length > 2) {
        entities.add(word);
      }
    }

    // Find words in backticks or quotes (often entities in docs)
    const quotedPattern = /[`"']([A-Za-z][A-Za-z0-9_]+)[`"']/g;
    while ((match = quotedPattern.exec(content)) !== null) {
      const word = match[1];
      if (!this.isCommonWord(word) && word.length > 2) {
        entities.add(this.toTitleCase(word));
      }
    }

    return Array.from(entities).slice(0, 20); // Limit to top 20
  }

  /**
   * Check if word is a common non-entity word
   * @param {string} word - Word to check
   * @returns {boolean} True if common word
   */
  isCommonWord(word) {
    const commonWords = new Set([
      'The', 'This', 'That', 'These', 'Those', 'What', 'When', 'Where', 'Which',
      'How', 'Why', 'Who', 'All', 'Any', 'Some', 'Each', 'Every', 'Both',
      'Few', 'More', 'Most', 'Other', 'Such', 'No', 'Not', 'Only', 'Same',
      'Than', 'Too', 'Very', 'Just', 'But', 'And', 'For', 'With', 'From',
      'About', 'Into', 'Through', 'During', 'Before', 'After', 'Above', 'Below',
      'Between', 'Under', 'Again', 'Further', 'Then', 'Once', 'Here', 'There',
      'True', 'False', 'Null', 'None', 'Yes', 'No', 'Example', 'Note', 'Warning',
      'Error', 'Success', 'Failure', 'Status', 'Type', 'Name', 'Value', 'Data',
      'File', 'Path', 'String', 'Number', 'Boolean', 'Array', 'Object', 'Function',
      'Class', 'Method', 'Property', 'Parameter', 'Return', 'Input', 'Output',
      'Request', 'Response', 'Result', 'Config', 'Options', 'Settings',
    ]);
    return commonWords.has(word);
  }

  /**
   * Convert string to title case
   * @param {string} str - Input string
   * @returns {string} Title case string
   */
  toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Extract workflows from content
   * @param {string} lowerContent - Lowercase content
   * @param {string} originalContent - Original content
   * @returns {string[]} List of workflow names
   */
  extractWorkflows(lowerContent, originalContent) {
    const workflows = new Set();

    // Find action + noun patterns
    for (const action of ACTION_KEYWORDS) {
      const pattern = new RegExp(`\\b${action}[\\s-]+([a-z]+)`, 'gi');
      let match;
      while ((match = pattern.exec(lowerContent)) !== null) {
        const noun = match[1];
        if (noun.length > 2 && !this.isStopWord(noun)) {
          workflows.add(`${action}-${noun}`);
        }
      }
    }

    // Find numbered steps or bullet points with actions
    const stepPattern = /(?:^|\n)\s*(?:\d+\.|[-*])\s*([A-Za-z]+)\s+(?:the\s+)?([a-z]+)/gi;
    let match;
    while ((match = stepPattern.exec(originalContent)) !== null) {
      const verb = match[1].toLowerCase();
      const noun = match[2].toLowerCase();
      if (ACTION_KEYWORDS.includes(verb) && !this.isStopWord(noun)) {
        workflows.add(`${verb}-${noun}`);
      }
    }

    return Array.from(workflows).slice(0, 15); // Limit to top 15
  }

  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} True if stop word
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
      'it', 'its', 'this', 'that', 'these', 'those', 'all', 'each', 'every',
    ]);
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Extract integrations from content
   * @param {string} content - Lowercase content
   * @returns {string[]} List of integrations
   */
  extractIntegrations(content) {
    const integrations = new Set();

    for (const keyword of INTEGRATION_KEYWORDS) {
      if (content.includes(keyword)) {
        integrations.add(this.toTitleCase(keyword));
      }
    }

    // Find API endpoints mentioned
    const apiPattern = /(?:api|endpoint)[:\s]+([a-z/_-]+)/gi;
    let match;
    while ((match = apiPattern.exec(content)) !== null) {
      integrations.add(`API: ${match[1]}`);
    }

    return Array.from(integrations).slice(0, 10);
  }

  /**
   * Extract stakeholders from content
   * @param {string} content - Lowercase content
   * @returns {string[]} List of stakeholders
   */
  extractStakeholders(content) {
    const stakeholders = new Set();

    for (const role of ROLE_KEYWORDS) {
      const pattern = new RegExp(`\\b${role}s?\\b`, 'gi');
      if (pattern.test(content)) {
        stakeholders.add(this.toTitleCase(role));
      }
    }

    return Array.from(stakeholders).slice(0, 10);
  }

  // ===========================================================================
  // RECOMMENDATION GENERATION
  // ===========================================================================

  /**
   * Generate agent recommendations based on analysis
   * @param {Object} analysis - Domain analysis result
   * @returns {Array} Recommended agents with confidence scores
   */
  generateAgentRecommendations(analysis) {
    const agents = [];
    const usedWorkflows = new Set();

    // Group workflows by main action category
    const workflowGroups = this.groupWorkflowsByCategory(analysis.workflows);

    for (const [category, workflows] of Object.entries(workflowGroups)) {
      if (workflows.length === 0) continue;

      const agentId = `${analysis.domain}-${category}`;
      const commands = workflows.map(w => w.replace(/-/g, '-'));

      // Calculate confidence based on workflow clarity
      const confidence = Math.min(
        0.95,
        0.6 + (workflows.length * 0.05) + (commands.length > 3 ? 0.1 : 0),
      );

      agents.push({
        id: this.toKebabCase(agentId),
        role: this.generateAgentRole(category, workflows, analysis.domain),
        commands: commands.slice(0, 6), // Max 6 commands per agent
        confidence: Math.round(confidence * 100) / 100,
        user_added: false,
        user_modified: false,
      });

      workflows.forEach(w => usedWorkflows.add(w));
    }

    // If we have entities but no clear workflows, create a generic manager
    if (agents.length === 0 && analysis.entities.length > 0) {
      const mainEntity = analysis.entities[0].toLowerCase();
      agents.push({
        id: `${mainEntity}-manager`,
        role: `Manages ${mainEntity} lifecycle and operations`,
        commands: [`create-${mainEntity}`, `update-${mainEntity}`, `delete-${mainEntity}`, `list-${mainEntity}s`],
        confidence: 0.65,
        user_added: false,
        user_modified: false,
      });
    }

    return agents;
  }

  /**
   * Group workflows by category
   * @param {string[]} workflows - List of workflows
   * @returns {Object} Grouped workflows
   */
  groupWorkflowsByCategory(workflows) {
    const groups = {
      manager: [],
      processor: [],
      handler: [],
    };

    for (const workflow of workflows) {
      const [action] = workflow.split('-');

      if (['create', 'update', 'delete', 'add', 'remove', 'edit'].includes(action)) {
        groups.manager.push(workflow);
      } else if (['process', 'transform', 'migrate', 'sync', 'import', 'export'].includes(action)) {
        groups.processor.push(workflow);
      } else {
        groups.handler.push(workflow);
      }
    }

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([, v]) => v.length > 0),
    );
  }

  /**
   * Generate agent role description
   * @param {string} category - Agent category
   * @param {string[]} workflows - Agent workflows
   * @param {string} domain - Domain name
   * @returns {string} Role description
   */
  generateAgentRole(category, workflows, domain) {
    const domainTitle = domain.split('-').map(w => this.toTitleCase(w)).join(' ');

    switch (category) {
      case 'manager':
        return `Manages ${domainTitle} resources and lifecycle operations`;
      case 'processor':
        return `Processes and transforms ${domainTitle} data`;
      case 'handler':
        return `Handles ${domainTitle} events and operations`;
      default:
        return `Manages ${domainTitle} ${category} operations`;
    }
  }

  /**
   * Convert string to kebab-case
   * @param {string} str - Input string
   * @returns {string} Kebab-case string
   */
  toKebabCase(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate task recommendations based on analysis and agents
   * @param {Object} analysis - Domain analysis result
   * @param {Array} agents - Recommended agents
   * @returns {Array} Recommended tasks with confidence scores
   */
  generateTaskRecommendations(analysis, agents) {
    const tasks = [];

    for (const agent of agents) {
      for (const command of agent.commands) {
        const taskName = `${command}.md`;
        const entrada = this.generateTaskEntrada(command, analysis);
        const saida = this.generateTaskSaida(command, analysis);

        // Calculate confidence based on entrada/saida clarity
        const confidence = Math.min(
          0.95,
          0.5 + (entrada.length * 0.1) + (saida.length * 0.1),
        );

        tasks.push({
          name: taskName.replace('.md', ''),
          agent: agent.id,
          entrada,
          saida,
          confidence: Math.round(confidence * 100) / 100,
        });
      }
    }

    return tasks;
  }

  /**
   * Generate task entrada (inputs)
   * @param {string} command - Command name
   * @param {Object} analysis - Domain analysis
   * @returns {string[]} Input parameters
   */
  generateTaskEntrada(command, analysis) {
    const inputs = [];
    const [action, ...rest] = command.split('-');
    const subject = rest.join('_');

    switch (action) {
      case 'create':
      case 'add':
        inputs.push(`${subject}_data`);
        if (analysis.stakeholders.length > 0) {
          inputs.push('created_by');
        }
        break;

      case 'update':
      case 'edit':
      case 'modify':
        inputs.push(`${subject}_id`);
        inputs.push('updates');
        break;

      case 'delete':
      case 'remove':
        inputs.push(`${subject}_id`);
        break;

      case 'get':
      case 'fetch':
      case 'retrieve':
        inputs.push(`${subject}_id`);
        break;

      case 'list':
      case 'search':
      case 'find':
        inputs.push('filters');
        inputs.push('pagination');
        break;

      case 'process':
      case 'transform':
        inputs.push('source_data');
        inputs.push('options');
        break;

      default:
        inputs.push(`${subject}_id`);
        inputs.push('options');
    }

    return inputs;
  }

  /**
   * Generate task saida (outputs)
   * @param {string} command - Command name
   * @param {Object} _analysis - Domain analysis (reserved for future use)
   * @returns {string[]} Output parameters
   */
  generateTaskSaida(command, _analysis) {
    const outputs = [];
    const [action, ...rest] = command.split('-');
    const subject = rest.join('_');

    switch (action) {
      case 'create':
      case 'add':
        outputs.push(`${subject}_id`);
        outputs.push('status');
        break;

      case 'update':
      case 'edit':
      case 'modify':
        outputs.push(`updated_${subject}`);
        outputs.push('changelog');
        break;

      case 'delete':
      case 'remove':
        outputs.push('success');
        outputs.push('deleted_at');
        break;

      case 'get':
      case 'fetch':
      case 'retrieve':
        outputs.push(subject);
        break;

      case 'list':
      case 'search':
      case 'find':
        outputs.push(`${subject}_list`);
        outputs.push('total_count');
        break;

      case 'process':
      case 'transform':
        outputs.push('result_data');
        outputs.push('metrics');
        break;

      default:
        outputs.push('result');
        outputs.push('status');
    }

    return outputs;
  }

  // ===========================================================================
  // BLUEPRINT GENERATION
  // ===========================================================================

  /**
   * Generate complete blueprint
   * @param {Object} options - Blueprint options
   * @param {Object} options.analysis - Domain analysis
   * @param {Object} options.recommendations - Agent and task recommendations
   * @param {Object} options.metadata - Blueprint metadata
   * @param {Object} [options.userAdjustments] - User modifications
   * @returns {Object} Complete squad blueprint
   */
  generateBlueprint(options) {
    const { analysis, recommendations, metadata, userAdjustments } = options;

    // Calculate overall confidence
    const agentConfidences = recommendations.agents.map(a => a.confidence);
    const taskConfidences = recommendations.tasks.map(t => t.confidence);
    const allConfidences = [...agentConfidences, ...taskConfidences];
    const overallConfidence = allConfidences.length > 0
      ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length
      : 0.5;

    // Determine template based on recommendations
    const template = this.determineTemplate(recommendations);

    return {
      squad: {
        name: `${analysis.domain}-squad`,
        description: `Squad for ${analysis.domain.replace(/-/g, ' ')} management`,
        domain: analysis.domain,
      },
      analysis: {
        entities: analysis.entities,
        workflows: analysis.workflows,
        integrations: analysis.integrations,
        stakeholders: analysis.stakeholders,
      },
      recommendations: {
        agents: recommendations.agents,
        tasks: recommendations.tasks,
        template,
        config_mode: 'extend',
      },
      metadata: {
        created_at: metadata.created_at || new Date().toISOString(),
        source_docs: metadata.source_docs || [],
        user_adjustments: userAdjustments?.count || 0,
        overall_confidence: Math.round(overallConfidence * 100) / 100,
      },
    };
  }

  /**
   * Determine best template based on recommendations
   * @param {Object} recommendations - Recommendations
   * @returns {string} Template name
   */
  determineTemplate(recommendations) {
    const hasDataProcessing = recommendations.tasks.some(t =>
      t.name.includes('process') || t.name.includes('transform') ||
      t.name.includes('import') || t.name.includes('export'),
    );

    if (hasDataProcessing) {
      return 'etl';
    }

    if (recommendations.tasks.length === 0) {
      return 'agent-only';
    }

    return 'basic';
  }

  // ===========================================================================
  // BLUEPRINT PERSISTENCE
  // ===========================================================================

  /**
   * Save blueprint to file
   * @param {Object} blueprint - Squad blueprint
   * @param {string} [outputPath] - Output path (optional)
   * @param {Object} [options] - Save options
   * @param {boolean} [options.force] - Overwrite existing
   * @returns {Promise<string>} Path to saved file
   */
  async saveBlueprint(blueprint, outputPath, options = {}) {
    const designsDir = outputPath || this.designsPath;

    // Ensure designs directory exists
    await fs.mkdir(designsDir, { recursive: true });

    const filename = `${blueprint.squad.name}-design.yaml`;
    const filePath = path.join(designsDir, filename);

    // Check if file exists
    if (!options.force) {
      try {
        await fs.access(filePath);
        throw SquadDesignerError.blueprintExists(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    // Generate YAML content
    const yamlContent = this.blueprintToYaml(blueprint);

    // Write file
    await fs.writeFile(filePath, yamlContent, 'utf-8');

    return filePath;
  }

  /**
   * Convert blueprint to YAML string
   * @param {Object} blueprint - Blueprint object
   * @returns {string} YAML content
   */
  blueprintToYaml(blueprint) {
    const header = `# Squad Design Blueprint
# Generated by *design-squad
# Source: ${blueprint.metadata.source_docs.join(', ') || 'Interactive input'}
# Created: ${blueprint.metadata.created_at}

`;
    return header + yaml.dump(blueprint, {
      indent: 2,
      lineWidth: 100,
      noRefs: true,
      sortKeys: false,
    });
  }

  /**
   * Load blueprint from file
   * @param {string} blueprintPath - Path to blueprint file
   * @returns {Promise<Object>} Loaded blueprint
   */
  async loadBlueprint(blueprintPath) {
    try {
      const content = await fs.readFile(blueprintPath, 'utf-8');
      return yaml.load(content);
    } catch (error) {
      throw new SquadDesignerError(
        DesignerErrorCodes.INVALID_BLUEPRINT,
        `Failed to load blueprint: ${error.message}`,
        'Check that the blueprint file exists and is valid YAML',
      );
    }
  }

  /**
   * Validate blueprint structure
   * @param {Object} blueprint - Blueprint to validate
   * @returns {Object} Validation result { valid, errors }
   */
  validateBlueprint(blueprint) {
    const errors = [];

    // Check required top-level keys
    if (!blueprint.squad) {
      errors.push('Missing required key: squad');
    } else {
      if (!blueprint.squad.name) errors.push('Missing squad.name');
      if (!blueprint.squad.domain) errors.push('Missing squad.domain');
    }

    if (!blueprint.recommendations) {
      errors.push('Missing required key: recommendations');
    } else {
      if (!Array.isArray(blueprint.recommendations.agents)) {
        errors.push('recommendations.agents must be an array');
      }
      if (!Array.isArray(blueprint.recommendations.tasks)) {
        errors.push('recommendations.tasks must be an array');
      }
    }

    if (!blueprint.metadata) {
      errors.push('Missing required key: metadata');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = {
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,
  DEFAULT_DESIGNS_PATH,
  MIN_CONFIDENCE_THRESHOLD,
  ACTION_KEYWORDS,
  INTEGRATION_KEYWORDS,
  ROLE_KEYWORDS,
};
