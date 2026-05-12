/**
 * Config Migrator
 *
 * Handles migration of MCP configs from project-level to global.
 * Provides intelligent merging without duplicates.
 *
 * @module core/mcp/config-migrator
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const fs = require('fs');
const path = require('path');
const {
  readGlobalConfig,
  writeGlobalConfig,
  globalConfigExists,
  createGlobalStructure,
  createGlobalConfig,
} = require('./global-config-manager');
const { getProjectMcpPath, checkLinkStatus, LINK_STATUS, createLink } = require('./symlink-manager');

/**
 * Migration options
 * @enum {string}
 */
const MIGRATION_OPTION = {
  MIGRATE: 'migrate',
  KEEP_PROJECT: 'keep_project',
  MERGE: 'merge',
};

/**
 * Detect project-level MCP configuration
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Detection result
 */
function detectProjectConfig(projectRoot = process.cwd()) {
  const possiblePaths = [
    path.join(projectRoot, '.aiox-core', 'tools', 'mcp', 'global-config.json'),
    path.join(projectRoot, '.aiox-core', 'mcp.json'),
    path.join(projectRoot, '.claude', 'mcp.json'),
    path.join(projectRoot, 'mcp.json'),
  ];

  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(content);

        return {
          found: true,
          path: configPath,
          config,
          serverCount: config.servers ? Object.keys(config.servers).length : 0,
        };
      } catch (_error) {
        // Continue to next path
      }
    }
  }

  // Also check for legacy mcpServers format (from .claude.json style)
  const claudeConfigPath = path.join(projectRoot, '.claude.json');
  if (fs.existsSync(claudeConfigPath)) {
    try {
      const content = fs.readFileSync(claudeConfigPath, 'utf8');
      const config = JSON.parse(content);

      if (config.mcpServers && Object.keys(config.mcpServers).length > 0) {
        return {
          found: true,
          path: claudeConfigPath,
          config: { servers: config.mcpServers, version: '1.0' },
          serverCount: Object.keys(config.mcpServers).length,
          isLegacyFormat: true,
        };
      }
    } catch (_error) {
      // Continue
    }
  }

  return {
    found: false,
    path: null,
    config: null,
    serverCount: 0,
  };
}

/**
 * Analyze migration scenario
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Migration scenario analysis
 */
function analyzeMigration(projectRoot = process.cwd()) {
  const projectConfig = detectProjectConfig(projectRoot);
  const hasGlobalConfig = globalConfigExists();
  const linkStatus = checkLinkStatus(projectRoot);

  // Determine scenario
  let scenario;
  let recommendedOption;
  let message;

  if (linkStatus.status === LINK_STATUS.LINKED) {
    scenario = 'already_linked';
    recommendedOption = null;
    message = 'Project is already linked to global MCP config.';
  } else if (!projectConfig.found && !hasGlobalConfig) {
    scenario = 'fresh_install';
    recommendedOption = MIGRATION_OPTION.MIGRATE;
    message = 'No existing MCP config found. Will create fresh global config.';
  } else if (!projectConfig.found && hasGlobalConfig) {
    scenario = 'link_only';
    recommendedOption = MIGRATION_OPTION.MIGRATE;
    message = 'Global config exists. Will create link to it.';
  } else if (projectConfig.found && !hasGlobalConfig) {
    scenario = 'migrate_to_global';
    recommendedOption = MIGRATION_OPTION.MIGRATE;
    message = `Project config found with ${projectConfig.serverCount} servers. Will migrate to global.`;
  } else {
    // Both exist
    scenario = 'merge_required';
    recommendedOption = MIGRATION_OPTION.MERGE;
    message = `Both project (${projectConfig.serverCount} servers) and global configs exist. Merge recommended.`;
  }

  return {
    scenario,
    recommendedOption,
    message,
    projectConfig,
    hasGlobalConfig,
    linkStatus,
  };
}

/**
 * Merge two server configurations
 * @param {Object} existing - Existing servers
 * @param {Object} incoming - Incoming servers
 * @param {Object} options - Merge options
 * @returns {Object} Merged servers with stats
 */
function mergeServers(existing = {}, incoming = {}, options = {}) {
  const merged = { ...existing };
  const stats = {
    kept: Object.keys(existing).length,
    added: 0,
    skipped: 0,
    conflicts: [],
  };

  for (const [name, config] of Object.entries(incoming)) {
    if (!merged[name]) {
      // New server, add it
      merged[name] = config;
      stats.added++;
    } else if (options.overwrite) {
      // Overwrite existing
      merged[name] = config;
      stats.conflicts.push({ name, action: 'overwritten' });
    } else {
      // Skip duplicate
      stats.skipped++;
      stats.conflicts.push({ name, action: 'skipped' });
    }
  }

  return { servers: merged, stats };
}

/**
 * Execute migration
 * @param {string} projectRoot - Project root directory
 * @param {string} option - Migration option (MIGRATION_OPTION)
 * @param {Object} options - Additional options
 * @returns {Object} Migration result
 */
function executeMigration(projectRoot = process.cwd(), option = MIGRATION_OPTION.MIGRATE, options = {}) {
  const analysis = analyzeMigration(projectRoot);

  // Handle already linked
  if (analysis.scenario === 'already_linked') {
    return {
      success: true,
      message: 'Already linked to global config.',
      action: 'none',
    };
  }

  // Handle keep project option
  if (option === MIGRATION_OPTION.KEEP_PROJECT) {
    return {
      success: true,
      message: 'Keeping project-level config. No changes made.',
      action: 'none',
    };
  }

  const results = {
    structureCreated: false,
    configCreated: false,
    serversMigrated: 0,
    linkCreated: false,
    backupPath: null,
    errors: [],
  };

  try {
    // Step 1: Create global structure if needed
    if (!analysis.hasGlobalConfig) {
      const structureResult = createGlobalStructure();
      if (!structureResult.success) {
        results.errors.push(`Structure creation failed: ${structureResult.errors.join(', ')}`);
      } else {
        results.structureCreated = true;
      }
    }

    // Step 2: Handle config based on option
    if (option === MIGRATION_OPTION.MIGRATE) {
      if (!analysis.hasGlobalConfig) {
        // Create new global config with project servers
        const initialServers = analysis.projectConfig.found
          ? analysis.projectConfig.config.servers || {}
          : {};

        const configResult = createGlobalConfig(initialServers);
        if (!configResult.success) {
          results.errors.push(`Config creation failed: ${configResult.error}`);
          return { success: false, results, errors: results.errors };
        }
        results.configCreated = true;
        results.serversMigrated = Object.keys(initialServers).length;
      }
    } else if (option === MIGRATION_OPTION.MERGE) {
      const globalConfig = readGlobalConfig() || { version: '1.0', servers: {} };
      const projectServers = analysis.projectConfig.found
        ? analysis.projectConfig.config.servers || {}
        : {};

      const mergeResult = mergeServers(
        globalConfig.servers,
        projectServers,
        { overwrite: options.overwrite },
      );

      globalConfig.servers = mergeResult.servers;

      const writeResult = writeGlobalConfig(globalConfig);
      if (!writeResult.success) {
        results.errors.push(`Config write failed: ${writeResult.error}`);
        return { success: false, results, errors: results.errors };
      }

      results.serversMigrated = mergeResult.stats.added;
      results.mergeStats = mergeResult.stats;
    }

    // Step 3: Backup and remove project config if it exists as directory
    if (analysis.linkStatus.status === LINK_STATUS.DIRECTORY && analysis.projectConfig.found) {
      const projectMcpPath = getProjectMcpPath(projectRoot);
      const backupPath = projectMcpPath + '.backup.' + Date.now();

      try {
        fs.renameSync(projectMcpPath, backupPath);
        results.backupPath = backupPath;
      } catch (error) {
        results.errors.push(`Backup failed: ${error.message}`);
      }
    }

    // Step 4: Create link
    const linkResult = createLink(projectRoot, { force: true });
    if (!linkResult.success) {
      results.errors.push(`Link creation failed: ${linkResult.error}`);
    } else {
      results.linkCreated = true;
    }

    return {
      success: results.errors.length === 0,
      results,
      errors: results.errors,
    };
  } catch (error) {
    results.errors.push(`Migration failed: ${error.message}`);
    return {
      success: false,
      results,
      errors: results.errors,
    };
  }
}

/**
 * Restore from backup
 * @param {string} backupPath - Path to backup
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Restore result
 */
function restoreFromBackup(backupPath, projectRoot = process.cwd()) {
  const projectMcpPath = getProjectMcpPath(projectRoot);

  if (!fs.existsSync(backupPath)) {
    return { success: false, error: 'Backup not found' };
  }

  try {
    // Remove current link/directory
    if (fs.existsSync(projectMcpPath)) {
      const stats = fs.lstatSync(projectMcpPath);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(projectMcpPath);
      } else {
        fs.rmSync(projectMcpPath, { recursive: true });
      }
    }

    // Restore backup
    fs.renameSync(backupPath, projectMcpPath);

    return { success: true, restored: projectMcpPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  MIGRATION_OPTION,
  detectProjectConfig,
  analyzeMigration,
  mergeServers,
  executeMigration,
  restoreFromBackup,
};
