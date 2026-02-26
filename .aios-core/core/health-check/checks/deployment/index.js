/**
 * Deployment Environment Domain Checks
 *
 * Checks for deployment configuration and environment.
 * Domain: deployment
 *
 * @module aios-core/health-check/checks/deployment
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const EnvFileCheck = require('./env-file');
const BuildConfigCheck = require('./build-config');
const CiConfigCheck = require('./ci-config');
const DockerConfigCheck = require('./docker-config');
const DeploymentReadinessCheck = require('./deployment-readiness');

/**
 * All deployment domain checks
 */
module.exports = {
  EnvFileCheck,
  BuildConfigCheck,
  CiConfigCheck,
  DockerConfigCheck,
  DeploymentReadinessCheck,
};
