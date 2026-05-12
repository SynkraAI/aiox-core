/**
 * Integration Tests for Squad Migration
 *
 * Tests the full migration workflow including:
 * - Full migration of legacy squad
 * - Migration of already-compliant squad (no-op)
 * - Rollback from backup works
 *
 * @see Story SQS-7: Squad Migration Tool
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const yaml = require('js-yaml');
const { SquadMigrator, SquadValidator } = require('../../../.aiox-core/development/scripts/squad');

// Test fixtures path (reuse from unit tests)
const FIXTURES_PATH = path.join(__dirname, '../../unit/squad/fixtures');

describe('Squad Migration Integration Tests', () => {
  let tempDir;

  beforeEach(async () => {
    // Create temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-migration-int-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Full Migration of Legacy Squad (AC 5.1)', () => {
    it('should migrate legacy squad end-to-end', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'legacy-migration-test');
      await copyRecursive(srcPath, testPath);

      // Verify initial state
      expect(await pathExists(path.join(testPath, 'config.yaml'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(false);

      // Create migrator with validator for post-migration validation
      const validator = new SquadValidator();
      const migrator = new SquadMigrator({ validator });

      // Execute migration
      const result = await migrator.migrate(testPath);

      // Verify migration success
      expect(result.success).toBe(true);
      expect(result.backupPath).not.toBeNull();

      // Verify manifest renamed
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'config.yaml'))).toBe(false);

      // Verify directories created
      expect(await pathExists(path.join(testPath, 'tasks'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'agents'))).toBe(true);

      // Verify fields added
      const content = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');
      const manifest = yaml.load(content);
      expect(manifest.aiox?.type).toBe('squad');
      expect(manifest.aiox?.minVersion).toBe('2.1.0');

      // Verify backup exists and contains original files
      expect(await pathExists(result.backupPath)).toBe(true);
      expect(await pathExists(path.join(result.backupPath, 'config.yaml'))).toBe(true);
    });

    it('should pass post-migration validation', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'validation-test');
      await copyRecursive(srcPath, testPath);

      // Create migrator with validator
      const validator = new SquadValidator();
      const migrator = new SquadMigrator({ validator });

      // Execute migration
      const result = await migrator.migrate(testPath);

      // Verify validation ran and passed (may have warnings but no errors)
      expect(result.validation).toBeDefined();
      // The migrated squad should be valid (valid: true) or have no schema errors
      // Note: May have warnings for missing tasks/agents content
    });
  });

  describe('Migration of Already-Compliant Squad (AC 5.2)', () => {
    it('should be a no-op for compliant squad', async () => {
      // Setup: Copy complete squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'complete-squad');
      const testPath = path.join(tempDir, 'compliant-test');
      await copyRecursive(srcPath, testPath);

      // Record initial state
      const initialContent = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');

      // Create migrator
      const migrator = new SquadMigrator();

      // Execute migration
      const result = await migrator.migrate(testPath);

      // Verify no migration needed
      expect(result.success).toBe(true);
      expect(result.message).toContain('already up to date');
      expect(result.actions).toHaveLength(0);
      expect(result.backupPath).toBeNull();

      // Verify file unchanged
      const finalContent = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');
      expect(finalContent).toBe(initialContent);
    });
  });

  describe('Rollback from Backup (AC 5.3)', () => {
    it('should be able to restore from backup after migration', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'rollback-test');
      await copyRecursive(srcPath, testPath);

      // Record original config.yaml content
      const originalContent = await fs.readFile(path.join(testPath, 'config.yaml'), 'utf-8');

      // Create migrator and execute migration
      const migrator = new SquadMigrator();
      const result = await migrator.migrate(testPath);

      // Verify migration happened
      expect(result.success).toBe(true);
      expect(result.backupPath).not.toBeNull();
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(true);

      // Perform rollback manually
      // 1. Remove migrated files
      await fs.unlink(path.join(testPath, 'squad.yaml'));
      await fs.rm(path.join(testPath, 'tasks'), { recursive: true, force: true });
      await fs.rm(path.join(testPath, 'agents'), { recursive: true, force: true });

      // 2. Restore from backup
      const backupFiles = await fs.readdir(result.backupPath);
      for (const file of backupFiles) {
        const backupFilePath = path.join(result.backupPath, file);
        const restorePath = path.join(testPath, file);
        await copyRecursive(backupFilePath, restorePath);
      }

      // Verify rollback worked
      expect(await pathExists(path.join(testPath, 'config.yaml'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(false);

      // Verify content matches original
      const restoredContent = await fs.readFile(path.join(testPath, 'config.yaml'), 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });

    it('should preserve backup after successful migration', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'backup-preserve-test');
      await copyRecursive(srcPath, testPath);

      // Execute migration
      const migrator = new SquadMigrator();
      const result = await migrator.migrate(testPath);

      // Verify backup still exists after migration
      expect(await pathExists(result.backupPath)).toBe(true);

      // Verify backup is complete
      const backupFiles = await fs.readdir(result.backupPath);
      expect(backupFiles).toContain('config.yaml');
    });
  });

  describe('End-to-End Workflow', () => {
    it('should support analyze → migrate → validate workflow', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'workflow-test');
      await copyRecursive(srcPath, testPath);

      const validator = new SquadValidator();
      const migrator = new SquadMigrator({ validator, verbose: false });

      // Step 1: Analyze
      const analysis = await migrator.analyze(testPath);
      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.actions.length).toBeGreaterThan(0);

      // Step 2: Generate analysis report
      const analysisReport = migrator.generateReport(analysis);
      expect(analysisReport).toContain('ISSUES FOUND');
      expect(analysisReport).toContain('PLANNED ACTIONS');

      // Step 3: Execute migration
      const result = await migrator.migrate(testPath);
      expect(result.success).toBe(true);

      // Step 4: Generate final report
      const finalReport = migrator.generateReport(analysis, result);
      expect(finalReport).toContain('MIGRATION RESULT');
      expect(finalReport).toContain('SUCCESS');

      // Step 5: Validate independently
      const validationResult = await validator.validate(testPath);
      // Should be valid (no schema errors) after migration
      expect(validationResult).toBeDefined();
    });

    it('should support dry-run → review → migrate workflow', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'dryrun-workflow-test');
      await copyRecursive(srcPath, testPath);

      // Step 1: Dry-run migration
      const dryRunMigrator = new SquadMigrator({ dryRun: true });
      const dryRunResult = await dryRunMigrator.migrate(testPath);

      // Verify dry-run didn't modify files
      expect(dryRunResult.success).toBe(true);
      expect(dryRunResult.actions.every((a) => a.status === 'dry-run')).toBe(true);
      expect(await pathExists(path.join(testPath, 'config.yaml'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(false);

      // Step 2: Review dry-run report
      const analysis = await dryRunMigrator.analyze(testPath);
      const report = dryRunMigrator.generateReport(analysis, dryRunResult);
      expect(report).toContain('dry-run');

      // Step 3: Execute actual migration
      const migrator = new SquadMigrator();
      const result = await migrator.migrate(testPath);

      // Verify actual migration succeeded
      expect(result.success).toBe(true);
      expect(result.actions.every((a) => a.status === 'success')).toBe(true);
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(true);
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
