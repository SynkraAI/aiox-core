/**
 * Unit Tests for SquadMigrator
 *
 * Test Coverage:
 * - analyze() detects legacy manifest (config.yaml)
 * - analyze() detects flat structure (missing tasks/, agents/)
 * - analyze() detects missing required fields
 * - migrate() creates backup before migration
 * - migrate() renames manifest (config.yaml → squad.yaml)
 * - migrate() creates directories
 * - migrate() adds missing fields
 * - migrate() validates after migration
 * - --dry-run mode doesn't modify files
 * - Error handling for edge cases
 * - generateReport() produces correct output
 * - Coverage >= 80%
 *
 * @see Story SQS-7: Squad Migration Tool
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadMigrator,
  SquadMigratorError,
  MigratorErrorCodes,
} = require('../../../.aiox-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadMigrator', () => {
  let migrator;
  let dryRunMigrator;
  let verboseMigrator;
  let consoleLogSpy;
  let tempDir;

  beforeEach(async () => {
    // Create migrators with different options
    migrator = new SquadMigrator();
    dryRunMigrator = new SquadMigrator({ dryRun: true });
    verboseMigrator = new SquadMigrator({ verbose: true });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Create temp directory for migration tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-migrator-test-'));
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    // Clean up temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Constants', () => {
    it('should export MigratorErrorCodes enum', () => {
      expect(MigratorErrorCodes).toBeDefined();
      expect(MigratorErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(MigratorErrorCodes.NO_MANIFEST).toBe('NO_MANIFEST');
      expect(MigratorErrorCodes.BACKUP_FAILED).toBe('BACKUP_FAILED');
      expect(MigratorErrorCodes.MIGRATION_FAILED).toBe('MIGRATION_FAILED');
      expect(MigratorErrorCodes.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
      expect(MigratorErrorCodes.INVALID_PATH).toBe('INVALID_PATH');
    });

    it('should export SquadMigratorError class', () => {
      expect(SquadMigratorError).toBeDefined();
      const error = new SquadMigratorError(MigratorErrorCodes.SQUAD_NOT_FOUND, 'Test error', {
        path: '/test',
      });
      expect(error.name).toBe('SquadMigratorError');
      expect(error.code).toBe(MigratorErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toBe('Test error');
      expect(error.details).toEqual({ path: '/test' });
    });
  });

  describe('Constructor', () => {
    it('should disable dryRun mode by default', () => {
      const defaultMigrator = new SquadMigrator();
      expect(defaultMigrator.dryRun).toBe(false);
    });

    it('should enable dryRun mode when specified', () => {
      expect(dryRunMigrator.dryRun).toBe(true);
    });

    it('should disable verbose mode by default', () => {
      const defaultMigrator = new SquadMigrator();
      expect(defaultMigrator.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseMigrator.verbose).toBe(true);
    });

    it('should accept custom validator', () => {
      const mockValidator = { validate: jest.fn() };
      const customMigrator = new SquadMigrator({ validator: mockValidator });
      expect(customMigrator.validator).toBe(mockValidator);
    });
  });

  describe('analyze()', () => {
    it('should throw SQUAD_NOT_FOUND for non-existent directory (AC 3.1)', async () => {
      const fakePath = path.join(FIXTURES_PATH, 'non-existent-squad');

      await expect(migrator.analyze(fakePath)).rejects.toThrow(SquadMigratorError);
      try {
        await migrator.analyze(fakePath);
      } catch (error) {
        expect(error.code).toBe(MigratorErrorCodes.SQUAD_NOT_FOUND);
      }
    });

    it('should throw NO_MANIFEST when no manifest exists (AC 3.2)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');

      await expect(migrator.analyze(squadPath)).rejects.toThrow(SquadMigratorError);
      try {
        await migrator.analyze(squadPath);
      } catch (error) {
        expect(error.code).toBe(MigratorErrorCodes.NO_MANIFEST);
      }
    });

    it('should detect legacy manifest (config.yaml) (AC 2)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'LEGACY_MANIFEST')).toBe(true);
      expect(analysis.actions.some((a) => a.type === 'RENAME_MANIFEST')).toBe(true);
    });

    it('should detect flat structure (missing directories) (AC 6)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'FLAT_STRUCTURE')).toBe(true);
      expect(analysis.actions.some((a) => a.type === 'CREATE_DIRECTORIES')).toBe(true);
    });

    it('should detect missing aiox.type field (AC 5)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'MISSING_AIOX_TYPE')).toBe(true);
      expect(analysis.actions.some((a) => a.type === 'ADD_FIELD' && a.path === 'aiox.type')).toBe(
        true,
      );
    });

    it('should detect missing aiox.minVersion field (AC 5)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'MISSING_MIN_VERSION')).toBe(true);
      expect(
        analysis.actions.some((a) => a.type === 'ADD_FIELD' && a.path === 'aiox.minVersion'),
      ).toBe(true);
    });

    it('should return needsMigration: false for up-to-date squad', async () => {
      // Create a fresh up-to-date squad in temp dir
      const testPath = path.join(tempDir, 'up-to-date-squad');
      await fs.mkdir(testPath, { recursive: true });
      await fs.mkdir(path.join(testPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'config'), { recursive: true });

      // Create compliant manifest
      const yaml = require('js-yaml');
      const manifest = {
        aiox: { type: 'squad', minVersion: '2.1.0' },
        name: 'up-to-date-squad',
        version: '1.0.0',
        description: 'A fully compliant squad',
      };
      await fs.writeFile(path.join(testPath, 'squad.yaml'), yaml.dump(manifest), 'utf-8');

      const analysis = await migrator.analyze(testPath);

      expect(analysis.needsMigration).toBe(false);
      expect(analysis.issues).toHaveLength(0);
      expect(analysis.actions).toHaveLength(0);
    });

    it('should complete analysis within 100ms', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const start = Date.now();
      await migrator.analyze(squadPath);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('createBackup()', () => {
    it('should create backup directory with timestamp (AC 3)', async () => {
      // Copy legacy squad to temp dir for testing
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'backup-test-squad');
      await copyRecursive(srcPath, testPath);

      const backupPath = await migrator.createBackup(testPath);

      expect(backupPath).toContain('.backup');
      expect(backupPath).toContain('pre-migration-');

      // Verify backup was created
      const backupExists = await pathExists(backupPath);
      expect(backupExists).toBe(true);
    });

    it('should copy all files to backup (AC 3)', async () => {
      // Copy legacy squad to temp dir for testing
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'backup-files-test');
      await copyRecursive(srcPath, testPath);

      const backupPath = await migrator.createBackup(testPath);

      // Verify config.yaml was backed up
      const configBackup = path.join(backupPath, 'config.yaml');
      const configExists = await pathExists(configBackup);
      expect(configExists).toBe(true);
    });

    it('should handle backup of directory that does not have files', async () => {
      // Create empty directory
      const emptyPath = path.join(tempDir, 'empty-squad');
      await fs.mkdir(emptyPath, { recursive: true });

      // Should succeed even with empty directory
      const backupPath = await migrator.createBackup(emptyPath);
      expect(backupPath).toContain('.backup');
      expect(await pathExists(backupPath)).toBe(true);
    });
  });

  describe('migrate()', () => {
    it('should return success for already up-to-date squad', async () => {
      // Create a fresh up-to-date squad in temp dir
      const testPath = path.join(tempDir, 'migrate-uptodate-squad');
      await fs.mkdir(testPath, { recursive: true });
      await fs.mkdir(path.join(testPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'config'), { recursive: true });

      // Create compliant manifest
      const yaml = require('js-yaml');
      const manifest = {
        aiox: { type: 'squad', minVersion: '2.1.0' },
        name: 'migrate-uptodate-squad',
        version: '1.0.0',
        description: 'A fully compliant squad',
      };
      await fs.writeFile(path.join(testPath, 'squad.yaml'), yaml.dump(manifest), 'utf-8');

      const result = await migrator.migrate(testPath);

      expect(result.success).toBe(true);
      expect(result.message).toContain('already up to date');
      expect(result.actions).toHaveLength(0);
      expect(result.backupPath).toBeNull();
    });

    it('should create backup before migration (AC 3)', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'migrate-backup-test');
      await copyRecursive(srcPath, testPath);

      const result = await migrator.migrate(testPath);

      expect(result.backupPath).not.toBeNull();
      const backupExists = await pathExists(result.backupPath);
      expect(backupExists).toBe(true);
    });

    it('should rename config.yaml to squad.yaml (AC 4)', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'migrate-rename-test');
      await copyRecursive(srcPath, testPath);

      await migrator.migrate(testPath);

      const squadYamlExists = await pathExists(path.join(testPath, 'squad.yaml'));
      const configYamlExists = await pathExists(path.join(testPath, 'config.yaml'));
      expect(squadYamlExists).toBe(true);
      expect(configYamlExists).toBe(false);
    });

    it('should create missing directories (AC 6)', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'migrate-dirs-test');
      await copyRecursive(srcPath, testPath);

      await migrator.migrate(testPath);

      const tasksExists = await pathExists(path.join(testPath, 'tasks'));
      const agentsExists = await pathExists(path.join(testPath, 'agents'));
      expect(tasksExists).toBe(true);
      expect(agentsExists).toBe(true);
    });

    it('should add missing aiox.type and aiox.minVersion fields (AC 5)', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'migrate-fields-test');
      await copyRecursive(srcPath, testPath);

      await migrator.migrate(testPath);

      // Read the migrated manifest
      const yaml = require('js-yaml');
      const content = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');
      const manifest = yaml.load(content);

      expect(manifest.aiox?.type).toBe('squad');
      expect(manifest.aiox?.minVersion).toBe('2.1.0');
    });

    it('should return success with executed actions', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'migrate-success-test');
      await copyRecursive(srcPath, testPath);

      const result = await migrator.migrate(testPath);

      expect(result.success).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
      expect(result.actions.every((a) => a.status === 'success')).toBe(true);
    });
  });

  describe('migrate() with --dry-run (AC 9)', () => {
    it('should not modify files in dry-run mode', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');

      const result = await dryRunMigrator.migrate(squadPath);

      // config.yaml should still exist (not renamed)
      const configExists = await pathExists(path.join(squadPath, 'config.yaml'));
      expect(configExists).toBe(true);

      // No backup should be created
      expect(result.backupPath).toBeNull();
    });

    it('should return dry-run status for all actions', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');

      const result = await dryRunMigrator.migrate(squadPath);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Dry-run');
      expect(result.actions.every((a) => a.status === 'dry-run')).toBe(true);
    });
  });

  describe('generateReport() (AC 10)', () => {
    it('should generate report with squad path', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);
      const report = migrator.generateReport(analysis);

      expect(report).toContain('Squad Path:');
      expect(report).toContain(squadPath);
    });

    it('should include issues in report', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);
      const report = migrator.generateReport(analysis);

      expect(report).toContain('ISSUES FOUND');
      expect(report).toContain('deprecated config.yaml');
    });

    it('should include planned actions in report', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);
      const report = migrator.generateReport(analysis);

      expect(report).toContain('PLANNED ACTIONS:');
      expect(report).toContain('Rename');
    });

    it('should include migration result when provided', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'report-result-test');
      await copyRecursive(srcPath, testPath);

      const analysis = await migrator.analyze(testPath);
      const result = await migrator.migrate(testPath);
      const report = migrator.generateReport(analysis, result);

      expect(report).toContain('MIGRATION RESULT:');
      expect(report).toContain('SUCCESS');
      expect(report).toContain('Backup:');
    });

    it('should show dry-run indicator in report', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await dryRunMigrator.analyze(squadPath);
      const result = await dryRunMigrator.migrate(squadPath);
      const report = dryRunMigrator.generateReport(analysis, result);

      expect(report).toContain('dry-run');
    });
  });

  describe('Verbose mode', () => {
    it('should log when verbose is enabled', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      await verboseMigrator.analyze(squadPath);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some((call) => call[0].includes('[SquadMigrator]'))).toBe(
        true,
      );
    });

    it('should not log when verbose is disabled', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      await migrator.analyze(squadPath);

      const migratorLogs = consoleLogSpy.mock.calls.filter((call) =>
        call[0].includes('[SquadMigrator]'),
      );
      expect(migratorLogs.length).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle YAML parse errors gracefully', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'malformed-squad');

      await expect(migrator.analyze(squadPath)).rejects.toThrow(SquadMigratorError);
      try {
        await migrator.analyze(squadPath);
      } catch (error) {
        expect(error.code).toBe(MigratorErrorCodes.MIGRATION_FAILED);
        expect(error.message).toContain('Invalid YAML');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle squad with only config.yaml but valid schema', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'edge-case-test');
      await copyRecursive(srcPath, testPath);

      const result = await migrator.migrate(testPath);

      expect(result.success).toBe(true);
    });

    it('should handle sequential backup calls with different timestamps', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'sequential-backup-test');
      await copyRecursive(srcPath, testPath);

      // Run two backups sequentially (with small delay to ensure different timestamps)
      const backup1 = await migrator.createBackup(testPath);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const backup2 = await migrator.createBackup(testPath);

      // Both should succeed with different paths (different timestamps)
      expect(backup1).not.toBe(backup2);
      expect(await pathExists(backup1)).toBe(true);
      expect(await pathExists(backup2)).toBe(true);
    });

    it('should detect missing name field in manifest', async () => {
      // Create squad without name field
      const testPath = path.join(tempDir, 'missing-name-squad');
      await fs.mkdir(testPath, { recursive: true });
      await fs.mkdir(path.join(testPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'config'), { recursive: true });

      const yaml = require('js-yaml');
      const manifest = {
        aiox: { type: 'squad', minVersion: '2.1.0' },
        version: '1.0.0',
        // name is missing
      };
      await fs.writeFile(path.join(testPath, 'squad.yaml'), yaml.dump(manifest), 'utf-8');

      const analysis = await migrator.analyze(testPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'MISSING_NAME')).toBe(true);
      expect(analysis.actions.some((a) => a.path === 'name')).toBe(true);
    });

    it('should detect missing version field in manifest', async () => {
      // Create squad without version field
      const testPath = path.join(tempDir, 'missing-version-squad');
      await fs.mkdir(testPath, { recursive: true });
      await fs.mkdir(path.join(testPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'config'), { recursive: true });

      const yaml = require('js-yaml');
      const manifest = {
        aiox: { type: 'squad', minVersion: '2.1.0' },
        name: 'test-squad',
        // version is missing
      };
      await fs.writeFile(path.join(testPath, 'squad.yaml'), yaml.dump(manifest), 'utf-8');

      const analysis = await migrator.analyze(testPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'MISSING_VERSION')).toBe(true);
      expect(analysis.actions.some((a) => a.path === 'version')).toBe(true);
    });
  });

  describe('MOVE_FILE action', () => {
    it('should execute MOVE_FILE action successfully', async () => {
      // Create test squad with a file to move
      const testPath = path.join(tempDir, 'move-file-test');
      await fs.mkdir(testPath, { recursive: true });
      await fs.mkdir(path.join(testPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(testPath, 'config'), { recursive: true });

      // Create file to move
      await fs.writeFile(path.join(testPath, 'old-file.txt'), 'test content', 'utf-8');

      // Create compliant manifest
      const yaml = require('js-yaml');
      const manifest = {
        aiox: { type: 'squad', minVersion: '2.1.0' },
        name: 'move-test-squad',
        version: '1.0.0',
      };
      await fs.writeFile(path.join(testPath, 'squad.yaml'), yaml.dump(manifest), 'utf-8');

      // Manually execute MOVE_FILE action via _executeAction
      await migrator._executeAction(testPath, {
        type: 'MOVE_FILE',
        from: 'old-file.txt',
        to: 'tasks/new-file.txt',
      });

      // Verify file was moved
      expect(await pathExists(path.join(testPath, 'old-file.txt'))).toBe(false);
      expect(await pathExists(path.join(testPath, 'tasks/new-file.txt'))).toBe(true);
    });

    it('should throw error for unknown action type', async () => {
      const testPath = path.join(tempDir, 'unknown-action-test');
      await fs.mkdir(testPath, { recursive: true });

      await expect(migrator._executeAction(testPath, { type: 'UNKNOWN_ACTION' })).rejects.toThrow(
        SquadMigratorError,
      );
    });
  });

  describe('Action execution failure handling', () => {
    it('should record failed actions in result', async () => {
      // Create squad with read-only situation that will fail
      const testPath = path.join(tempDir, 'action-fail-test');
      await fs.mkdir(testPath, { recursive: true });

      // Create config.yaml (legacy)
      const yaml = require('js-yaml');
      await fs.writeFile(
        path.join(testPath, 'config.yaml'),
        yaml.dump({ name: 'test', version: '1.0.0' }),
        'utf-8',
      );

      // Create a custom migrator that will fail on ADD_FIELD
      const failingMigrator = new SquadMigrator();
      const originalExecute = failingMigrator._executeAction.bind(failingMigrator);
      failingMigrator._executeAction = async (squadPath, action) => {
        if (action.type === 'ADD_FIELD') {
          throw new Error('Simulated failure');
        }
        return originalExecute(squadPath, action);
      };

      const result = await failingMigrator.migrate(testPath);

      // Should have some failed actions
      expect(result.actions.some((a) => a.status === 'failed')).toBe(true);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation integration', () => {
    it('should handle validator errors gracefully', async () => {
      // Create a mock validator that throws
      const mockValidator = {
        validate: jest.fn().mockRejectedValue(new Error('Validation failed')),
      };

      const validatorMigrator = new SquadMigrator({ validator: mockValidator });

      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'validator-error-test');
      await copyRecursive(srcPath, testPath);

      const result = await validatorMigrator.migrate(testPath);

      expect(result.validation).toEqual({ valid: false, error: 'Validation failed' });
    });

    it('should include validation results in report', async () => {
      const mockValidator = {
        validate: jest.fn().mockResolvedValue({
          valid: true,
          errors: [],
          warnings: [{ message: 'test warning' }],
        }),
      };

      const validatorMigrator = new SquadMigrator({ validator: mockValidator });

      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'validation-report-test');
      await copyRecursive(srcPath, testPath);

      const analysis = await validatorMigrator.analyze(testPath);
      const result = await validatorMigrator.migrate(testPath);
      const report = validatorMigrator.generateReport(analysis, result);

      expect(report).toContain('Post-Migration Validation');
      expect(report).toContain('Valid: Yes');
      expect(report).toContain('Warnings: 1');
    });

    it('should show validation errors count in report', async () => {
      const mockValidator = {
        validate: jest.fn().mockResolvedValue({
          valid: false,
          errors: [{ message: 'error 1' }, { message: 'error 2' }],
          warnings: [],
        }),
      };

      const validatorMigrator = new SquadMigrator({ validator: mockValidator });

      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'validation-errors-test');
      await copyRecursive(srcPath, testPath);

      const analysis = await validatorMigrator.analyze(testPath);
      const result = await validatorMigrator.migrate(testPath);
      const report = validatorMigrator.generateReport(analysis, result);

      expect(report).toContain('Valid: No');
      expect(report).toContain('Errors: 2');
    });
  });

  describe('Performance', () => {
    it('should complete full migration within 500ms', async () => {
      // Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'perf-test');
      await copyRecursive(srcPath, testPath);

      const start = Date.now();
      await migrator.migrate(testPath);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});

// Helper functions
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(src, dest) {
  const stats = await fs.stat(src);
  if (stats.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    await fs.copyFile(src, dest);
  }
}
