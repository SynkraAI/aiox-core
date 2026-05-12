/**
 * MCP Module Index
 *
 * Exports all MCP-related functionality for global configuration management.
 *
 * @module core/mcp
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const osDetector = require('./os-detector');
const globalConfigManager = require('./global-config-manager');
const symlinkManager = require('./symlink-manager');
const configMigrator = require('./config-migrator');

module.exports = {
  // OS Detection
  ...osDetector,

  // Global Config Management
  ...globalConfigManager,

  // Symlink Management
  ...symlinkManager,

  // Config Migration
  ...configMigrator,

  // Namespaced exports for clarity
  osDetector,
  globalConfigManager,
  symlinkManager,
  configMigrator,
};
