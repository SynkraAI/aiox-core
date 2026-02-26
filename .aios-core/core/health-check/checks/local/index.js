/**
 * Local Environment Domain Checks
 *
 * Checks for local development environment health.
 * Domain: local
 *
 * @module aios-core/health-check/checks/local
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const EnvironmentVarsCheck = require('./environment-vars');
const GitInstallCheck = require('./git-install');
const NpmInstallCheck = require('./npm-install');
const IdeDetectionCheck = require('./ide-detection');
const ShellEnvironmentCheck = require('./shell-environment');
const DiskSpaceCheck = require('./disk-space');
const MemoryCheck = require('./memory');
const NetworkCheck = require('./network');

/**
 * All local environment domain checks
 */
module.exports = {
  EnvironmentVarsCheck,
  GitInstallCheck,
  NpmInstallCheck,
  IdeDetectionCheck,
  ShellEnvironmentCheck,
  DiskSpaceCheck,
  MemoryCheck,
  NetworkCheck,
};
