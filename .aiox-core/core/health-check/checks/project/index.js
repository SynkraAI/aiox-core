/**
 * Project Domain Checks
 *
 * Checks for project configuration coherence and structure.
 * Domain: project
 *
 * @module aiox-core/health-check/checks/project
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const PackageJsonCheck = require('./package-json');
const DependenciesCheck = require('./dependencies');
const FrameworkConfigCheck = require('./framework-config');
const NodeVersionCheck = require('./node-version');
const AioxDirectoryCheck = require('./aiox-directory');
const AgentConfigCheck = require('./agent-config');
const TaskDefinitionsCheck = require('./task-definitions');
const WorkflowDependenciesCheck = require('./workflow-dependencies');

/**
 * All project domain checks
 */
module.exports = {
  PackageJsonCheck,
  DependenciesCheck,
  FrameworkConfigCheck,
  NodeVersionCheck,
  AioxDirectoryCheck,
  AgentConfigCheck,
  TaskDefinitionsCheck,
  WorkflowDependenciesCheck,
};
