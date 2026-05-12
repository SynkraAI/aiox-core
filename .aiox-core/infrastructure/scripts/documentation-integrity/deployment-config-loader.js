/**
 * Deployment Config Loader
 *
 * Shared utility for loading deployment configuration from core-config.yaml.
 * Implements the Configuration-Driven Architecture pattern.
 *
 * Usage:
 *   const { loadDeploymentConfig } = require('./deployment-config-loader');
 *   const config = loadDeploymentConfig(projectRoot);
 *
 * @module documentation-integrity/deployment-config-loader
 * @version 1.0.0
 * @story 6.9
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default deployment configuration
 * Used when core-config.yaml doesn't exist or deployment section is missing
 *
 * @type {Object}
 */
const DEFAULT_DEPLOYMENT_CONFIG = {
  workflow: 'staging-first',

  branches: {
    staging_targets: ['feature/*', 'fix/*', 'docs/*', 'chore/*', 'refactor/*', 'test/*'],
    production_targets: ['hotfix/*'],
    staging_branch: 'staging',
    production_branch: 'main',
    default_target: 'staging',
  },

  environments: {
    staging: {
      name: 'Staging',
      auto_deploy: true,
      platform: null,
      url: null,
      promotion_message: 'After validation, create PR to main for production',
    },
    production: {
      name: 'Production',
      auto_deploy: true,
      platform: null,
      url: null,
      promotion_message: 'This is the final production deployment',
    },
  },

  quality_gates: {
    lint: true,
    typecheck: true,
    tests: true,
    security_scan: false,
    min_coverage: 50,
  },

  pr_defaults: {
    auto_assign_reviewers: false,
    draft_by_default: false,
    include_deployment_info: true,
  },
};

/**
 * Loads deployment configuration from core-config.yaml
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Deployment configuration (merged with defaults)
 */
function loadDeploymentConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.aiox-core', 'core-config.yaml');

  if (!fs.existsSync(configPath)) {
    console.warn(`[deployment-config-loader] core-config.yaml not found at ${configPath}`);
    console.warn('[deployment-config-loader] Using default deployment configuration');
    return { ...DEFAULT_DEPLOYMENT_CONFIG };
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);

    if (!config || !config.deployment) {
      console.warn('[deployment-config-loader] No deployment section in core-config.yaml');
      console.warn('[deployment-config-loader] Using default deployment configuration');
      return { ...DEFAULT_DEPLOYMENT_CONFIG };
    }

    // Deep merge with defaults to ensure all required fields exist
    return deepMerge(DEFAULT_DEPLOYMENT_CONFIG, config.deployment);
  } catch (error) {
    console.error(`[deployment-config-loader] Error loading config: ${error.message}`);
    console.warn('[deployment-config-loader] Using default deployment configuration');
    return { ...DEFAULT_DEPLOYMENT_CONFIG };
  }
}

/**
 * Loads project configuration from core-config.yaml
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object|null} Project configuration or null if not found
 */
function loadProjectConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.aiox-core', 'core-config.yaml');

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);
    return config.project || null;
  } catch (error) {
    console.error(`[deployment-config-loader] Error loading project config: ${error.message}`);
    return null;
  }
}

/**
 * Gets the target branch for a given source branch
 *
 * @param {string} sourceBranch - Source branch name
 * @param {Object} deploymentConfig - Deployment configuration
 * @returns {string} Target branch name
 */
function getTargetBranch(sourceBranch, deploymentConfig) {
  const { branches, workflow } = deploymentConfig;

  // Check if it's a staging branch (used for promotion)
  if (sourceBranch === branches.staging_branch) {
    return branches.production_branch;
  }

  // Check production targets (hotfix/* etc.)
  for (const pattern of branches.production_targets || []) {
    if (matchesBranchPattern(sourceBranch, pattern)) {
      return branches.production_branch;
    }
  }

  // Check staging targets
  for (const pattern of branches.staging_targets || []) {
    if (matchesBranchPattern(sourceBranch, pattern)) {
      // If direct-to-main workflow, target production
      if (workflow === 'direct-to-main') {
        return branches.production_branch;
      }
      return branches.staging_branch || branches.production_branch;
    }
  }

  // Default target - resolve symbolic name to actual branch
  const defaultTarget = (branches.default_target || 'production').toLowerCase();
  const stagingBranch = branches.staging_branch;
  const productionBranch = branches.production_branch;

  // Handle symbolic names
  if (defaultTarget === 'staging') {
    return stagingBranch || productionBranch;
  }
  if (defaultTarget === 'production') {
    return productionBranch;
  }

  // Handle explicit branch names as fallback (for manually-edited configs)
  if (stagingBranch && defaultTarget === stagingBranch.toLowerCase()) {
    return stagingBranch;
  }
  if (productionBranch && defaultTarget === productionBranch.toLowerCase()) {
    return productionBranch;
  }

  // Conservative fallback with warning
  console.warn(
    `[deployment-config-loader] Unknown default_target "${branches.default_target}", falling back to production`,
  );
  return productionBranch;
}

/**
 * Checks if a branch name matches a pattern
 *
 * @param {string} branchName - Branch name to check
 * @param {string} pattern - Pattern to match (e.g., "feature/*")
 * @returns {boolean} True if matches
 */
function matchesBranchPattern(branchName, pattern) {
  // Escape regex metacharacters first, then convert glob wildcards
  // Order matters: escape special chars, then convert * and ?
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex metacharacters (except * and ?)
    .replace(/\*/g, '.*') // Convert glob * to regex .*
    .replace(/\?/g, '.'); // Convert glob ? to regex .

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(branchName);
}

/**
 * Gets environment configuration by name
 *
 * @param {string} envName - Environment name (staging/production)
 * @param {Object} deploymentConfig - Deployment configuration
 * @returns {Object|null} Environment configuration
 */
function getEnvironmentConfig(envName, deploymentConfig) {
  const normalized = envName.toLowerCase();
  return deploymentConfig.environments?.[normalized] || null;
}

/**
 * Checks if quality gate is enabled
 *
 * @param {string} gateName - Gate name (lint, typecheck, tests, security_scan)
 * @param {Object} deploymentConfig - Deployment configuration
 * @returns {boolean} True if gate is enabled
 */
function isQualityGateEnabled(gateName, deploymentConfig) {
  return deploymentConfig.quality_gates?.[gateName] === true;
}

/**
 * Gets all enabled quality gates
 *
 * @param {Object} deploymentConfig - Deployment configuration
 * @returns {string[]} List of enabled gate names
 */
function getEnabledQualityGates(deploymentConfig) {
  const gates = deploymentConfig.quality_gates || {};
  return Object.entries(gates)
    .filter(([key, value]) => value === true && key !== 'min_coverage')
    .map(([key]) => key);
}

/**
 * Deep merge two objects
 *
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Validates deployment configuration
 *
 * @param {Object} config - Deployment configuration to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateDeploymentConfig(config) {
  const errors = [];

  // Check workflow
  if (!['staging-first', 'direct-to-main'].includes(config.workflow)) {
    errors.push(`Invalid workflow: ${config.workflow}`);
  }

  // Check branches
  if (!config.branches?.production_branch) {
    errors.push('Missing production_branch');
  }

  if (config.workflow === 'staging-first' && !config.branches?.staging_branch) {
    errors.push('staging-first workflow requires staging_branch');
  }

  // Check environments
  if (!config.environments?.production) {
    errors.push('Missing production environment configuration');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  loadDeploymentConfig,
  loadProjectConfig,
  getTargetBranch,
  matchesBranchPattern,
  getEnvironmentConfig,
  isQualityGateEnabled,
  getEnabledQualityGates,
  validateDeploymentConfig,
  deepMerge,
  DEFAULT_DEPLOYMENT_CONFIG,
};
