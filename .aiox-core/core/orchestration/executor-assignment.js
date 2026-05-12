/**
 * Executor Assignment Module - Dynamic assignment of executors and quality gates
 *
 * DETERMINISTIC: Assignment is based on keyword matching against story content.
 * No AI involvement in executor selection.
 *
 * PRD Reference: AIOX v2.0 "Projeto Bob" - Section 5 (Dynamic Executor Assignment)
 *
 * Responsibilities:
 * - Detect story type from content using keyword matching
 * - Assign executor based on work type
 * - Assign quality gate (always different from executor)
 * - Provide quality gate tools for each assignment
 *
 * @module core/orchestration/executor-assignment
 * @version 1.0.0
 */

/**
 * @typedef {Object} ExecutorAssignment
 * @property {string} executor - The assigned executor agent (e.g., '@dev')
 * @property {string} quality_gate - The quality gate reviewer (always different from executor)
 * @property {string[]} quality_gate_tools - Tools available for quality gate review
 */

/**
 * @typedef {Object} StoryTypeConfig
 * @property {string[]} keywords - Keywords that identify this story type
 * @property {string} executor - Default executor for this type
 * @property {string} quality_gate - Default quality gate for this type
 * @property {string[]} quality_gate_tools - Tools for quality gate review
 */

/**
 * Executor assignment table mapping work types to executors and quality gates
 * @constant {Object.<string, StoryTypeConfig>}
 */
const EXECUTOR_ASSIGNMENT_TABLE = {
  // General code: features, logic, handlers, services
  code_general: {
    keywords: [
      'feature',
      'logic',
      'handler',
      'service',
      'controller',
      'function',
      'class',
      'module',
      'implement',
      'api',
      'endpoint',
      'crud',
      'business',
    ],
    executor: '@dev',
    quality_gate: '@architect',
    quality_gate_tools: ['architecture_review', 'code_review', 'pattern_validation'],
  },

  // Database: schemas, RLS, migrations, queries
  database: {
    keywords: [
      'schema',
      'table',
      'migration',
      'rls',
      'query',
      'index',
      'constraint',
      'foreign_key',
      'database',
      'sql',
      'supabase',
      'postgres',
      'column',
      'relation',
    ],
    executor: '@data-engineer',
    quality_gate: '@dev',
    quality_gate_tools: ['schema_validation', 'migration_review', 'rls_test'],
  },

  // Infrastructure: CI/CD, deploy, environments
  infrastructure: {
    keywords: [
      'ci/cd',
      'cicd',
      'deploy',
      'environment',
      'docker',
      'kubernetes',
      'terraform',
      'pipeline',
      'infrastructure',
      'aws',
      'gcp',
      'azure',
      'nginx',
      'devops',
    ],
    executor: '@devops',
    quality_gate: '@architect',
    quality_gate_tools: ['infrastructure_review', 'security_scan', 'config_validation'],
  },

  // UI/UX: components, design, interface
  ui_ux: {
    keywords: [
      'component',
      'ui',
      'ux',
      'design',
      'interface',
      'layout',
      'styling',
      'responsive',
      'accessibility',
      'a11y',
      'css',
      'tailwind',
      'figma',
      'wireframe',
    ],
    executor: '@ux-design-expert',
    quality_gate: '@dev',
    quality_gate_tools: ['accessibility_check', 'design_review', 'component_validation'],
  },

  // Research: investigation, analysis, POC
  research: {
    keywords: [
      'research',
      'investigate',
      'analyze',
      'study',
      'compare',
      'evaluate',
      'poc',
      'proof',
      'concept',
      'benchmark',
      'assessment',
      'exploration',
    ],
    executor: '@analyst',
    quality_gate: '@pm',
    quality_gate_tools: ['research_validation', 'findings_review'],
  },

  // Architecture: design decisions, patterns, scalability
  architecture: {
    keywords: [
      'architecture',
      'design_decision',
      'pattern',
      'scalability',
      'refactor_major',
      'system_design',
      'adr',
      'rfc',
      'technical_decision',
      'microservice',
      'monolith',
    ],
    executor: '@architect',
    quality_gate: '@pm',
    quality_gate_tools: ['architecture_review', 'impact_analysis'],
  },
};

/**
 * Default assignment when no specific type is detected
 * @constant {ExecutorAssignment}
 */
const DEFAULT_ASSIGNMENT = {
  executor: '@dev',
  quality_gate: '@architect',
  quality_gate_tools: ['code_review', 'pattern_validation'],
};

/**
 * Detects the story type based on content analysis using keyword matching
 *
 * @param {string} storyContent - The story content (title, description, acceptance criteria)
 * @returns {string} The detected story type key (e.g., 'code_general', 'database')
 *
 * @example
 * const storyType = detectStoryType('Implement user authentication handler');
 * // Returns: 'code_general'
 *
 * @example
 * const storyType = detectStoryType('Create RLS policies for user table');
 * // Returns: 'database'
 */
function detectStoryType(storyContent) {
  if (!storyContent || typeof storyContent !== 'string') {
    return 'code_general'; // Default type
  }

  const normalizedContent = storyContent.toLowerCase();
  const scores = {};

  // Calculate scores for each type based on keyword matches
  for (const [typeKey, config] of Object.entries(EXECUTOR_ASSIGNMENT_TABLE)) {
    let score = 0;

    for (const keyword of config.keywords) {
      const keywordLower = keyword.toLowerCase();
      // Count occurrences of keyword
      const regex = new RegExp(`\\b${keywordLower.replace(/[/\\-]/g, '[/\\\\-]?')}\\b`, 'gi');
      const matches = normalizedContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    scores[typeKey] = score;
  }

  // Find the type with highest score
  let maxScore = 0;
  let detectedType = 'code_general';

  for (const [typeKey, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = typeKey;
    }
  }

  return detectedType;
}

/**
 * Assigns executor and quality gate based on story type
 *
 * @param {string} storyType - The story type key from detectStoryType()
 * @returns {ExecutorAssignment} The executor assignment with executor, quality_gate, and tools
 * @throws {Error} If executor would be the same as quality gate (should never happen with valid table)
 *
 * @example
 * const assignment = assignExecutor('database');
 * // Returns: {
 * //   executor: '@data-engineer',
 * //   quality_gate: '@dev',
 * //   quality_gate_tools: ['schema_validation', 'migration_review', 'rls_test']
 * // }
 */
function assignExecutor(storyType) {
  const config = EXECUTOR_ASSIGNMENT_TABLE[storyType];

  if (!config) {
    console.warn(`[ExecutorAssignment] Unknown story type: ${storyType}, using default`);
    return { ...DEFAULT_ASSIGNMENT };
  }

  const assignment = {
    executor: config.executor,
    quality_gate: config.quality_gate,
    quality_gate_tools: [...config.quality_gate_tools],
  };

  // Validation: executor must be different from quality gate
  if (assignment.executor === assignment.quality_gate) {
    throw new Error(
      `[ExecutorAssignment] Invalid configuration: executor (${assignment.executor}) ` +
        `cannot be the same as quality_gate (${assignment.quality_gate}) for type "${storyType}"`,
    );
  }

  return assignment;
}

/**
 * Assigns executor and quality gate based on story content (combines detect + assign)
 *
 * @param {string} storyContent - The story content to analyze
 * @returns {ExecutorAssignment} The executor assignment
 *
 * @example
 * const assignment = assignExecutorFromContent(`
 *   # Story: Create user authentication
 *   Implement JWT-based authentication handler with refresh tokens
 * `);
 * // Returns: { executor: '@dev', quality_gate: '@architect', quality_gate_tools: [...] }
 */
function assignExecutorFromContent(storyContent) {
  const storyType = detectStoryType(storyContent);
  return assignExecutor(storyType);
}

/**
 * Validates that a story has valid executor assignment
 *
 * @param {Object} story - Story object with executor fields
 * @param {string} story.executor - The assigned executor
 * @param {string} story.quality_gate - The quality gate reviewer
 * @param {string[]} [story.quality_gate_tools] - Quality gate tools
 * @returns {Object} Validation result with isValid flag and errors array
 *
 * @example
 * const result = validateExecutorAssignment({
 *   executor: '@dev',
 *   quality_gate: '@architect',
 *   quality_gate_tools: ['code_review']
 * });
 * // Returns: { isValid: true, errors: [] }
 */
function validateExecutorAssignment(story) {
  const errors = [];

  // Check required fields
  if (!story.executor) {
    errors.push('Missing required field: executor');
  }

  if (!story.quality_gate) {
    errors.push('Missing required field: quality_gate');
  }

  if (!story.quality_gate_tools || !Array.isArray(story.quality_gate_tools)) {
    errors.push('Missing or invalid field: quality_gate_tools (must be array)');
  } else if (story.quality_gate_tools.length === 0) {
    errors.push('quality_gate_tools cannot be empty');
  }

  // Check executor != quality_gate
  if (story.executor && story.quality_gate && story.executor === story.quality_gate) {
    errors.push(`Executor (${story.executor}) cannot be the same as quality_gate (${story.quality_gate})`);
  }

  // Validate executor is known
  const knownExecutors = new Set(
    Object.values(EXECUTOR_ASSIGNMENT_TABLE).map((c) => c.executor),
  );
  if (story.executor && !knownExecutors.has(story.executor)) {
    errors.push(`Unknown executor: ${story.executor}. Known executors: ${[...knownExecutors].join(', ')}`);
  }

  // Validate quality gate is known
  const knownQualityGates = new Set(
    Object.values(EXECUTOR_ASSIGNMENT_TABLE).map((c) => c.quality_gate),
  );
  // Add @pm as it can be a quality gate
  knownQualityGates.add('@pm');

  if (story.quality_gate && !knownQualityGates.has(story.quality_gate)) {
    errors.push(
      `Unknown quality_gate: ${story.quality_gate}. Known quality gates: ${[...knownQualityGates].join(', ')}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets all known story types
 *
 * @returns {string[]} Array of story type keys
 */
function getStoryTypes() {
  return Object.keys(EXECUTOR_ASSIGNMENT_TABLE);
}

/**
 * Gets the configuration for a specific story type
 *
 * @param {string} storyType - The story type key
 * @returns {StoryTypeConfig|null} The configuration or null if not found
 */
function getStoryTypeConfig(storyType) {
  return EXECUTOR_ASSIGNMENT_TABLE[storyType] || null;
}

/**
 * Gets all executors and their assigned work types
 *
 * @returns {Object.<string, string[]>} Map of executor to array of work types
 */
function getExecutorWorkTypes() {
  const executorMap = {};

  for (const [typeKey, config] of Object.entries(EXECUTOR_ASSIGNMENT_TABLE)) {
    if (!executorMap[config.executor]) {
      executorMap[config.executor] = [];
    }
    executorMap[config.executor].push(typeKey);
  }

  return executorMap;
}

module.exports = {
  // Main functions
  detectStoryType,
  assignExecutor,
  assignExecutorFromContent,
  validateExecutorAssignment,

  // Utility functions
  getStoryTypes,
  getStoryTypeConfig,
  getExecutorWorkTypes,

  // Constants (exported for external validation/testing)
  EXECUTOR_ASSIGNMENT_TABLE,
  DEFAULT_ASSIGNMENT,
};
