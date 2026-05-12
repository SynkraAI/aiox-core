/**
 * Config Generator Module
 *
 * Generates project-specific core-config.yaml from templates.
 * Supports greenfield and brownfield modes with deployment configuration.
 *
 * @module documentation-integrity/config-generator
 * @version 1.0.0
 * @story 6.9
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Template directory
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates', 'core-config');

/**
 * Template file names
 * @enum {string}
 */
const ConfigTemplates = {
  GREENFIELD: 'core-config-greenfield.tmpl.yaml',
  BROWNFIELD: 'core-config-brownfield.tmpl.yaml',
};

/**
 * Deployment workflow types
 * @enum {string}
 */
const DeploymentWorkflow = {
  STAGING_FIRST: 'staging-first',
  DIRECT_TO_MAIN: 'direct-to-main',
};

/**
 * Deployment platform options
 * @enum {string}
 */
const DeploymentPlatform = {
  RAILWAY: 'Railway',
  VERCEL: 'Vercel',
  AWS: 'AWS',
  DOCKER: 'Docker',
  NONE: 'None',
};

/**
 * Default deployment configuration
 * @type {Object}
 */
const DEFAULT_DEPLOYMENT_CONFIG = {
  workflow: DeploymentWorkflow.STAGING_FIRST,
  stagingBranch: 'staging',
  productionBranch: 'main',
  defaultTarget: 'staging',
  stagingEnvName: 'Staging',
  productionEnvName: 'Production',
  platform: DeploymentPlatform.NONE,
  qualityGates: {
    lint: true,
    typecheck: true,
    tests: true,
    securityScan: false,
    minCoverage: 50,
  },
};

/**
 * Escapes a string for use in YAML double-quoted strings
 *
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for YAML
 */
function escapeYamlString(str) {
  return String(str)
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t'); // Escape tabs
}

/**
 * Formats an array as YAML list string for template substitution
 *
 * @param {Array} arr - Array to format
 * @param {number} [indent=4] - Number of spaces for indentation
 * @returns {string} YAML-formatted array string
 */
function formatArrayAsYaml(arr, indent = 4) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return '[]';
  }
  const spaces = ' '.repeat(indent);
  const items = arr.map((item) => `\n${spaces}- "${escapeYamlString(item)}"`).join('');
  return items;
}

/**
 * Builds config context from project info and deployment settings
 *
 * @param {string} projectName - Project name
 * @param {string} mode - Installation mode (greenfield/brownfield)
 * @param {Object} deploymentConfig - Deployment configuration
 * @param {Object} [analysisResults] - Brownfield analysis results (if applicable)
 * @returns {Object} Config context for template rendering
 */
function buildConfigContext(projectName, mode, deploymentConfig = {}, analysisResults = {}) {
  const config = { ...DEFAULT_DEPLOYMENT_CONFIG, ...deploymentConfig };
  const isStaging = config.workflow === DeploymentWorkflow.STAGING_FIRST;

  const context = {
    // Basic info
    PROJECT_NAME: projectName,
    GENERATED_DATE: new Date().toISOString().split('T')[0],
    PROJECT_VERSION: analysisResults.version || '0.1.0',

    // Deployment workflow
    DEPLOYMENT_WORKFLOW: config.workflow,

    // Branch configuration
    STAGING_BRANCH: isStaging ? config.stagingBranch : 'null',
    PRODUCTION_BRANCH: config.productionBranch,
    // Use symbolic name ('staging'/'production') - deployment-config-loader resolves to actual branch
    DEFAULT_TARGET: isStaging ? 'staging' : 'production',

    // Environment names
    STAGING_ENV_NAME: config.stagingEnvName,
    PRODUCTION_ENV_NAME: config.productionEnvName,

    // Platform
    DEPLOYMENT_PLATFORM: config.platform,

    // Quality gates
    QUALITY_LINT: config.qualityGates.lint,
    QUALITY_TYPECHECK: config.qualityGates.typecheck,
    QUALITY_TESTS: config.qualityGates.tests,
    QUALITY_SECURITY: config.qualityGates.securityScan || false,
    MIN_COVERAGE: config.qualityGates.minCoverage || 50,

    // Brownfield specific (defaults for greenfield)
    HAS_EXISTING_STRUCTURE: analysisResults.hasExistingStructure || false,
    HAS_EXISTING_WORKFLOWS: analysisResults.hasExistingWorkflows || false,
    HAS_EXISTING_STANDARDS: analysisResults.hasExistingStandards || false,
    MERGE_STRATEGY: analysisResults.mergeStrategy || 'parallel',

    // Detected configs (brownfield)
    DETECTED_TECH_STACK: JSON.stringify(analysisResults.techStack || []),
    DETECTED_FRAMEWORKS: JSON.stringify(analysisResults.frameworks || []),
    DETECTED_LINTING: analysisResults.linting || 'none',
    DETECTED_FORMATTING: analysisResults.formatting || 'none',
    DETECTED_TESTING: analysisResults.testing || 'none',

    // Auto deploy settings
    STAGING_AUTO_DEPLOY: config.stagingAutoDeploy !== false,
    PRODUCTION_AUTO_DEPLOY: config.productionAutoDeploy !== false,

    // PR settings
    AUTO_ASSIGN_REVIEWERS: config.autoAssignReviewers || false,
    DRAFT_BY_DEFAULT: config.draftByDefault || false,

    // Existing config paths (brownfield)
    ESLINT_CONFIG_PATH: analysisResults.eslintPath || 'null',
    PRETTIER_CONFIG_PATH: analysisResults.prettierPath || 'null',
    TSCONFIG_PATH: analysisResults.tsconfigPath || 'null',
    FLAKE8_CONFIG_PATH: analysisResults.flake8Path || 'null',
    GITHUB_WORKFLOWS_PATH: analysisResults.githubWorkflowsPath || 'null',
    GITLAB_CI_PATH: analysisResults.gitlabCiPath || 'null',
    PACKAGE_JSON_PATH: analysisResults.packageJsonPath || 'null',
    REQUIREMENTS_PATH: analysisResults.requirementsPath || 'null',
    GO_MOD_PATH: analysisResults.goModPath || 'null',

    // Merge settings
    MERGE_WORKFLOWS: analysisResults.mergeWorkflows || false,

    // Migration notes (brownfield)
    MIGRATION_SUMMARY: analysisResults.summary || 'No analysis performed',
    MANUAL_REVIEW_ITEMS: analysisResults.manualReviewItems || [],
    CONFLICTS: analysisResults.conflicts || [],
    RECOMMENDATIONS: analysisResults.recommendations || [],

    // Pre-formatted YAML arrays for template substitution (avoids Handlebars #each)
    MANUAL_REVIEW_ITEMS_YAML: formatArrayAsYaml(analysisResults.manualReviewItems || []),
    CONFLICTS_YAML: formatArrayAsYaml(analysisResults.conflicts || []),
    RECOMMENDATIONS_YAML: formatArrayAsYaml(analysisResults.recommendations || []),
  };

  return context;
}

/**
 * Renders a YAML template with context
 *
 * @param {string} template - Template content
 * @param {Object} context - Context object
 * @returns {string} Rendered YAML content
 */
function renderConfigTemplate(template, context) {
  let result = template;

  // Process {{#each}} blocks
  result = processEachBlocks(result, context);

  // Replace simple variables {{variable}}
  result = result.replace(/\{\{([^#/}][^}]*)\}\}/g, (match, key) => {
    const value = context[key.trim()];
    if (value === undefined) return match;
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return String(value);
  });

  return result;
}

/**
 * Process {{#each array}}...{{/each}} blocks
 *
 * @param {string} template - Template string
 * @param {Object} context - Context object
 * @returns {string} Processed template
 */
function processEachBlocks(template, context) {
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachRegex, (match, arrayName, content) => {
    const array = context[arrayName];
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }

    return array
      .map((item) => {
        return content.replace(/\{\{this\}\}/g, String(item));
      })
      .join('');
  });
}

/**
 * Loads a config template
 *
 * @param {string} templateName - Template file name
 * @returns {string} Template content
 * @throws {Error} If template not found
 */
function loadConfigTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Config template not found: ${templatePath}`);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Generates core-config.yaml for a project
 *
 * @param {string} targetDir - Target directory
 * @param {string} mode - Installation mode (greenfield/brownfield)
 * @param {Object} context - Config context
 * @param {Object} [options] - Generation options
 * @param {boolean} [options.dryRun] - Don't write file, just return content
 * @returns {Object} Generation result
 */
function generateConfig(targetDir, mode, context, options = {}) {
  const templateName =
    mode === 'brownfield' ? ConfigTemplates.BROWNFIELD : ConfigTemplates.GREENFIELD;

  try {
    const template = loadConfigTemplate(templateName);
    const rendered = renderConfigTemplate(template, context);

    // Validate YAML syntax
    try {
      yaml.load(rendered);
    } catch (yamlError) {
      return {
        success: false,
        error: `Generated YAML is invalid: ${yamlError.message}`,
        content: rendered,
      };
    }

    const configDir = path.join(targetDir, '.aiox-core');
    const configPath = path.join(configDir, 'core-config.yaml');

    if (!options.dryRun) {
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(configPath, rendered, 'utf8');
    }

    return {
      success: true,
      path: configPath,
      content: rendered,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      content: null,
    };
  }
}

/**
 * Generates deployment config context from user inputs
 *
 * @param {Object} inputs - User inputs from wizard
 * @returns {Object} Deployment configuration
 */
function buildDeploymentConfig(inputs = {}) {
  return {
    workflow: inputs.workflow || DeploymentWorkflow.STAGING_FIRST,
    stagingBranch: inputs.stagingBranch || 'staging',
    productionBranch: inputs.productionBranch || 'main',
    stagingEnvName: inputs.stagingEnvName || 'Staging',
    productionEnvName: inputs.productionEnvName || 'Production',
    platform: inputs.platform || DeploymentPlatform.NONE,
    qualityGates: {
      lint: inputs.lint !== false,
      typecheck: inputs.typecheck !== false,
      tests: inputs.tests !== false,
      securityScan: inputs.securityScan || false,
      minCoverage: inputs.minCoverage || 50,
    },
    autoAssignReviewers: inputs.autoAssignReviewers || false,
    draftByDefault: inputs.draftByDefault || false,
  };
}

/**
 * Gets default deployment config for a mode
 *
 * @param {string} mode - Installation mode
 * @returns {Object} Default deployment config
 */
function getDefaultDeploymentConfig(mode) {
  if (mode === 'brownfield') {
    // Brownfield might use direct-to-main if solo project
    return {
      ...DEFAULT_DEPLOYMENT_CONFIG,
      // Keep staging-first as default, but brownfield analyzer may change this
    };
  }

  return { ...DEFAULT_DEPLOYMENT_CONFIG };
}

module.exports = {
  buildConfigContext,
  renderConfigTemplate,
  loadConfigTemplate,
  generateConfig,
  buildDeploymentConfig,
  getDefaultDeploymentConfig,
  formatArrayAsYaml,
  escapeYamlString,
  ConfigTemplates,
  DeploymentWorkflow,
  DeploymentPlatform,
  DEFAULT_DEPLOYMENT_CONFIG,
  TEMPLATES_DIR,
};
