/**
 * Health Check - Check Index
 *
 * Aggregates all domain checks for the health check system.
 *
 * @module aios-core/health-check/checks
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const projectChecks = require('./project');
const localChecks = require('./local');
const repositoryChecks = require('./repository');
const deploymentChecks = require('./deployment');
const servicesChecks = require('./services');

/**
 * All available checks organized by domain
 */
module.exports = {
  project: projectChecks,
  local: localChecks,
  repository: repositoryChecks,
  deployment: deploymentChecks,
  services: servicesChecks,

  /**
   * Get all checks as a flat array
   * @returns {BaseCheck[]} All checks
   */
  getAllChecks() {
    return [
      ...Object.values(projectChecks),
      ...Object.values(localChecks),
      ...Object.values(repositoryChecks),
      ...Object.values(deploymentChecks),
      ...Object.values(servicesChecks),
    ];
  },

  /**
   * Get check count by domain
   * @returns {Object} Domain -> count mapping
   */
  getCheckCounts() {
    return {
      project: Object.keys(projectChecks).length,
      local: Object.keys(localChecks).length,
      repository: Object.keys(repositoryChecks).length,
      deployment: Object.keys(deploymentChecks).length,
      services: Object.keys(servicesChecks).length,
    };
  },
};
