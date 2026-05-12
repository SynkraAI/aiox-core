/**
 * Squad Migrator Utility
 *
 * Migrates legacy squad formats to AIOX 2.1 standard.
 * Handles manifest, structure, and task format migrations.
 *
 * Used by: squad-creator agent (*migrate-squad task)
 *
 * @module squad-migrator
 * @version 1.0.0
 * @see Story SQS-7: Squad Migration Tool
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Error codes for SquadMigratorError
 * @enum {string}
 */
const MigratorErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  NO_MANIFEST: 'NO_MANIFEST',
  BACKUP_FAILED: 'BACKUP_FAILED',
  MIGRATION_FAILED: 'MIGRATION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PATH: 'INVALID_PATH',
};

/**
 * Custom error class for migration errors
 */
class SquadMigratorError extends Error {
  /**
   * @param {string} code - Error code from MigratorErrorCodes
   * @param {string} message - Human-readable error message
   * @param {Object} [details={}] - Additional error details
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'SquadMigratorError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Migration analysis result structure
 * @typedef {Object} MigrationAnalysis
 * @property {boolean} needsMigration - Whether migration is required
 * @property {Array<MigrationIssue>} issues - Issues found during analysis
 * @property {Array<MigrationAction>} actions - Actions to perform
 * @property {string} squadPath - Analyzed squad path
 */

/**
 * Migration issue structure
 * @typedef {Object} MigrationIssue
 * @property {string} type - Issue type
 * @property {string} message - Human-readable message
 * @property {string} severity - 'error' | 'warning' | 'info'
 */

/**
 * Migration action structure
 * @typedef {Object} MigrationAction
 * @property {string} type - Action type
 * @property {Object} [params] - Action parameters
 */

/**
 * Migration result structure
 * @typedef {Object} MigrationResult
 * @property {boolean} success - Whether migration succeeded
 * @property {string} message - Result message
 * @property {Array<ExecutedAction>} actions - Actions executed
 * @property {Object|null} validation - Post-migration validation result
 * @property {string|null} backupPath - Path to backup directory
 */

/**
 * Squad Migrator class for migrating legacy squad formats
 */
class SquadMigrator {
  /**
   * Create a SquadMigrator instance
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.dryRun=false] - Simulate without modifying files
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {Object} [options.validator=null] - Custom SquadValidator instance
   */
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.validator = options.validator || null;
  }

  /**
   * Log message if verbose mode is enabled
   * @param {string} message - Message to log
   * @private
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadMigrator] ${message}`);
    }
  }

  /**
   * Check if a path exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   * @private
   */
  async _pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recursively copy a file or directory
   * @param {string} src - Source path
   * @param {string} dest - Destination path
   * @private
   */
  async _copyRecursive(src, dest) {
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src);
      for (const entry of entries) {
        await this._copyRecursive(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      await fs.copyFile(src, dest);
    }
  }

  /**
   * Analyze squad for migration needs
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<MigrationAnalysis>}
   */
  async analyze(squadPath) {
    this._log(`Analyzing squad at: ${squadPath}`);

    // Verify squad directory exists
    if (!(await this._pathExists(squadPath))) {
      throw new SquadMigratorError(
        MigratorErrorCodes.SQUAD_NOT_FOUND,
        `Squad directory not found: ${squadPath}`,
        { squadPath },
      );
    }

    const analysis = {
      needsMigration: false,
      issues: [],
      actions: [],
      squadPath,
    };

    // Check for legacy manifest (config.yaml)
    const hasConfigYaml = await this._pathExists(path.join(squadPath, 'config.yaml'));
    const hasSquadYaml = await this._pathExists(path.join(squadPath, 'squad.yaml'));

    if (!hasConfigYaml && !hasSquadYaml) {
      throw new SquadMigratorError(
        MigratorErrorCodes.NO_MANIFEST,
        'No manifest found (config.yaml or squad.yaml)',
        { squadPath },
      );
    }

    // Check for legacy manifest name
    if (hasConfigYaml && !hasSquadYaml) {
      analysis.needsMigration = true;
      analysis.issues.push({
        type: 'LEGACY_MANIFEST',
        message: 'Uses deprecated config.yaml manifest',
        severity: 'warning',
      });
      analysis.actions.push({
        type: 'RENAME_MANIFEST',
        from: 'config.yaml',
        to: 'squad.yaml',
      });
    }

    // Check for flat structure (missing required directories)
    // Note: Only 'tasks' and 'agents' are required for task-first architecture
    // 'config' directory is optional and not checked
    const hasTasksDir = await this._pathExists(path.join(squadPath, 'tasks'));
    const hasAgentsDir = await this._pathExists(path.join(squadPath, 'agents'));

    const missingDirs = [];
    if (!hasTasksDir) {
      missingDirs.push('tasks');
    }
    if (!hasAgentsDir) {
      missingDirs.push('agents');
    }

    if (missingDirs.length > 0) {
      analysis.needsMigration = true;
      analysis.issues.push({
        type: 'FLAT_STRUCTURE',
        message: `Missing task-first directories: ${missingDirs.join(', ')}`,
        severity: 'warning',
      });
      analysis.actions.push({
        type: 'CREATE_DIRECTORIES',
        dirs: missingDirs,
      });
    }

    // Check manifest schema compliance
    const manifestPath = hasSquadYaml
      ? path.join(squadPath, 'squad.yaml')
      : path.join(squadPath, 'config.yaml');

    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const manifest = yaml.load(content);

      // Check for missing aiox.type
      if (!manifest.aiox?.type) {
        analysis.needsMigration = true;
        analysis.issues.push({
          type: 'MISSING_AIOX_TYPE',
          message: 'Missing required field: aiox.type',
          severity: 'error',
        });
        analysis.actions.push({
          type: 'ADD_FIELD',
          path: 'aiox.type',
          value: 'squad',
        });
      }

      // Check for missing aiox.minVersion
      if (!manifest.aiox?.minVersion) {
        analysis.needsMigration = true;
        analysis.issues.push({
          type: 'MISSING_MIN_VERSION',
          message: 'Missing required field: aiox.minVersion',
          severity: 'error',
        });
        analysis.actions.push({
          type: 'ADD_FIELD',
          path: 'aiox.minVersion',
          value: '2.1.0',
        });
      }

      // Check for missing name field
      if (!manifest.name) {
        analysis.needsMigration = true;
        analysis.issues.push({
          type: 'MISSING_NAME',
          message: 'Missing required field: name',
          severity: 'error',
        });
        // Try to infer name from directory
        const inferredName = path.basename(squadPath);
        analysis.actions.push({
          type: 'ADD_FIELD',
          path: 'name',
          value: inferredName,
        });
      }

      // Check for missing version field
      if (!manifest.version) {
        analysis.needsMigration = true;
        analysis.issues.push({
          type: 'MISSING_VERSION',
          message: 'Missing required field: version',
          severity: 'error',
        });
        analysis.actions.push({
          type: 'ADD_FIELD',
          path: 'version',
          value: '1.0.0',
        });
      }
    } catch (error) {
      if (error.name === 'YAMLException') {
        throw new SquadMigratorError(
          MigratorErrorCodes.MIGRATION_FAILED,
          `Invalid YAML in manifest: ${error.message}`,
          { squadPath, error: error.message },
        );
      }
      throw error;
    }

    this._log(`Analysis complete. Needs migration: ${analysis.needsMigration}`);
    this._log(`Issues found: ${analysis.issues.length}`);
    this._log(`Actions planned: ${analysis.actions.length}`);

    return analysis;
  }

  /**
   * Create backup of squad before migration
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<string>} Path to backup directory
   */
  async createBackup(squadPath) {
    const timestamp = Date.now();
    const backupDir = path.join(squadPath, '.backup');
    const backupPath = path.join(backupDir, `pre-migration-${timestamp}`);

    this._log(`Creating backup at: ${backupPath}`);

    try {
      await fs.mkdir(backupPath, { recursive: true });

      // Copy all files except .backup directory
      const files = await fs.readdir(squadPath);
      for (const file of files) {
        if (file === '.backup') {
          continue;
        }
        const src = path.join(squadPath, file);
        const dest = path.join(backupPath, file);
        await this._copyRecursive(src, dest);
      }

      this._log('Backup created successfully');
      return backupPath;
    } catch (error) {
      throw new SquadMigratorError(
        MigratorErrorCodes.BACKUP_FAILED,
        `Failed to create backup: ${error.message}`,
        { squadPath, error: error.message },
      );
    }
  }

  /**
   * Execute a single migration action
   * @param {string} squadPath - Path to squad directory
   * @param {MigrationAction} action - Action to execute
   * @private
   */
  async _executeAction(squadPath, action) {
    this._log(`Executing action: ${action.type}`);

    switch (action.type) {
      case 'RENAME_MANIFEST':
        await fs.rename(path.join(squadPath, action.from), path.join(squadPath, action.to));
        break;

      case 'CREATE_DIRECTORIES':
        for (const dir of action.dirs) {
          await fs.mkdir(path.join(squadPath, dir), { recursive: true });
        }
        break;

      case 'ADD_FIELD':
        await this._addManifestField(squadPath, action.path, action.value);
        break;

      case 'MOVE_FILE':
        await fs.rename(path.join(squadPath, action.from), path.join(squadPath, action.to));
        break;

      default:
        throw new SquadMigratorError(
          MigratorErrorCodes.MIGRATION_FAILED,
          `Unknown action type: ${action.type}`,
          { action },
        );
    }
  }

  /**
   * Add or update a field in the manifest YAML
   * @param {string} squadPath - Path to squad directory
   * @param {string} fieldPath - Dot-separated path to field
   * @param {any} value - Value to set
   * @private
   */
  async _addManifestField(squadPath, fieldPath, value) {
    const manifestPath = path.join(squadPath, 'squad.yaml');

    let content;
    let manifest;

    try {
      content = await fs.readFile(manifestPath, 'utf-8');
      manifest = yaml.load(content) || {};
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If squad.yaml doesn't exist yet, try config.yaml
        const configPath = path.join(squadPath, 'config.yaml');
        content = await fs.readFile(configPath, 'utf-8');
        manifest = yaml.load(content) || {};
      } else {
        throw error;
      }
    }

    // Navigate to nested path and set value
    const parts = fieldPath.split('.');
    let current = manifest;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;

    // Write back to manifest
    await fs.writeFile(manifestPath, yaml.dump(manifest, { lineWidth: -1 }), 'utf-8');

    this._log(`Added field ${fieldPath} = ${value}`);
  }

  /**
   * Migrate squad to current format
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<MigrationResult>}
   */
  async migrate(squadPath) {
    this._log(`Starting migration for: ${squadPath}`);

    // Analyze squad first
    const analysis = await this.analyze(squadPath);

    // If no migration needed, return early
    if (!analysis.needsMigration) {
      return {
        success: true,
        message: 'Squad is already up to date',
        actions: [],
        validation: null,
        backupPath: null,
      };
    }

    // Create backup (unless dry-run)
    let backupPath = null;
    if (!this.dryRun) {
      backupPath = await this.createBackup(squadPath);
    }

    // Execute actions
    const executedActions = [];

    for (const action of analysis.actions) {
      if (this.dryRun) {
        executedActions.push({
          ...action,
          status: 'dry-run',
        });
        continue;
      }

      try {
        await this._executeAction(squadPath, action);
        executedActions.push({
          ...action,
          status: 'success',
        });
      } catch (error) {
        executedActions.push({
          ...action,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Check if any actions failed
    const hasFailures = executedActions.some((a) => a.status === 'failed');

    // Validate after migration (unless dry-run)
    let validation = null;
    if (!this.dryRun && this.validator) {
      try {
        validation = await this.validator.validate(squadPath);
      } catch (error) {
        this._log(`Validation error: ${error.message}`);
        validation = { valid: false, error: error.message };
      }
    }

    const result = {
      success: !hasFailures,
      message: hasFailures
        ? 'Migration completed with errors'
        : this.dryRun
          ? 'Dry-run completed successfully'
          : 'Migration completed successfully',
      actions: executedActions,
      validation,
      backupPath,
    };

    this._log(`Migration complete. Success: ${result.success}`);

    return result;
  }

  /**
   * Generate migration report
   * @param {MigrationAnalysis} analysis - Analysis result
   * @param {MigrationResult} [result] - Migration result (if executed)
   * @returns {string} Formatted report
   */
  generateReport(analysis, result = null) {
    const lines = [];

    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('              SQUAD MIGRATION REPORT');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Squad Path: ${analysis.squadPath}`);
    lines.push(`Needs Migration: ${analysis.needsMigration ? 'Yes' : 'No'}`);
    lines.push('');

    // Issues section
    if (analysis.issues.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('ISSUES FOUND:');
      lines.push('───────────────────────────────────────────────────────────');
      for (const issue of analysis.issues) {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        lines.push(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
      }
      lines.push('');
    }

    // Actions section
    if (analysis.actions.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('PLANNED ACTIONS:');
      lines.push('───────────────────────────────────────────────────────────');
      for (let i = 0; i < analysis.actions.length; i++) {
        const action = analysis.actions[i];
        lines.push(`  ${i + 1}. ${this._formatAction(action)}`);
      }
      lines.push('');
    }

    // Result section (if migration was executed)
    if (result) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('MIGRATION RESULT:');
      lines.push('───────────────────────────────────────────────────────────');
      lines.push(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      lines.push(`  Message: ${result.message}`);

      if (result.backupPath) {
        lines.push(`  Backup: ${result.backupPath}`);
      }

      if (result.actions.length > 0) {
        lines.push('');
        lines.push('  Executed Actions:');
        for (const action of result.actions) {
          const icon =
            action.status === 'success' ? '✅' : action.status === 'dry-run' ? '🔍' : '❌';
          lines.push(`    ${icon} ${this._formatAction(action)} [${action.status}]`);
          if (action.error) {
            lines.push(`       Error: ${action.error}`);
          }
        }
      }

      if (result.validation) {
        lines.push('');
        lines.push('  Post-Migration Validation:');
        lines.push(`    Valid: ${result.validation.valid ? 'Yes' : 'No'}`);
        if (result.validation.errors?.length > 0) {
          lines.push(`    Errors: ${result.validation.errors.length}`);
        }
        if (result.validation.warnings?.length > 0) {
          lines.push(`    Warnings: ${result.validation.warnings.length}`);
        }
      }
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Format an action for display
   * @param {MigrationAction} action - Action to format
   * @returns {string}
   * @private
   */
  _formatAction(action) {
    switch (action.type) {
      case 'RENAME_MANIFEST':
        return `Rename ${action.from} → ${action.to}`;
      case 'CREATE_DIRECTORIES':
        return `Create directories: ${action.dirs.join(', ')}`;
      case 'ADD_FIELD':
        return `Add field: ${action.path} = "${action.value}"`;
      case 'MOVE_FILE':
        return `Move ${action.from} → ${action.to}`;
      default:
        return `${action.type}`;
    }
  }
}

module.exports = {
  SquadMigrator,
  SquadMigratorError,
  MigratorErrorCodes,
};
