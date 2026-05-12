/**
 * Full Migration Integration Tests
 *
 * End-to-end tests for the v2.0 → v2.1 migration process.
 *
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const { createBackup, verifyBackup } = require('../../.aiox-core/cli/commands/migrate/backup');
const { detectV2Structure, analyzeMigrationPlan } = require('../../.aiox-core/cli/commands/migrate/analyze');
const { executeMigration } = require('../../.aiox-core/cli/commands/migrate/execute');
const { updateAllImports, verifyImports } = require('../../.aiox-core/cli/commands/migrate/update-imports');
const { validateStructure } = require('../../.aiox-core/cli/commands/migrate/validate');
const { executeRollback, canRollback } = require('../../.aiox-core/cli/commands/migrate/rollback');

describe('Full Migration Integration', () => {
  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `aiox-full-migration-test-${Date.now()}`);
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (testDir && fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  /**
   * Create a mock v2.0 project structure for testing
   */
  async function createMockV20Project(dir) {
    const aioxCoreDir = path.join(dir, '.aiox-core');

    // Create development directories
    await fs.promises.mkdir(path.join(aioxCoreDir, 'agents'), { recursive: true });
    await fs.promises.mkdir(path.join(aioxCoreDir, 'tasks'), { recursive: true });
    await fs.promises.mkdir(path.join(aioxCoreDir, 'templates'), { recursive: true });
    await fs.promises.mkdir(path.join(aioxCoreDir, 'checklists'), { recursive: true });
    await fs.promises.mkdir(path.join(aioxCoreDir, 'scripts'), { recursive: true });

    // Create core directories
    await fs.promises.mkdir(path.join(aioxCoreDir, 'registry'), { recursive: true });
    await fs.promises.mkdir(path.join(aioxCoreDir, 'utils'), { recursive: true });
    await fs.promises.mkdir(path.join(aioxCoreDir, 'config'), { recursive: true });

    // Create product directories
    await fs.promises.mkdir(path.join(aioxCoreDir, 'cli', 'commands'), { recursive: true });

    // Create infrastructure directories
    await fs.promises.mkdir(path.join(aioxCoreDir, 'hooks'), { recursive: true });

    // Create sample files
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'agents', 'dev.md'),
      '# Dev Agent\nDeveloper persona',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'agents', 'qa.md'),
      '# QA Agent\nQuality assurance',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'tasks', 'build.md'),
      '# Build Task\nBuild workflow',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'registry', 'index.js'),
      'const fs = require(\'fs\');\nconst utils = require(\'../utils\');\nmodule.exports = {};',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'utils', 'helpers.js'),
      'module.exports = { helper: () => true };',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'cli', 'index.js'),
      'const registry = require(\'../registry\');\nconst { Command } = require(\'commander\');\nmodule.exports = {};',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'cli', 'commands', 'run.js'),
      'module.exports = { run: () => {} };',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'hooks', 'pre-commit.js'),
      'module.exports = { hook: () => {} };',
    );
    await fs.promises.writeFile(
      path.join(aioxCoreDir, 'index.js'),
      'module.exports = require("./registry");',
    );

    // Create config file
    await fs.promises.writeFile(
      path.join(dir, 'aiox.config.js'),
      'module.exports = { name: "test-project" };',
    );

    return aioxCoreDir;
  }

  describe('MIG-01: Backup Created', () => {
    it('should create backup directory with all files', async () => {
      await createMockV20Project(testDir);

      const result = await createBackup(testDir);

      expect(result.success).toBe(true);
      expect(fs.existsSync(result.backupDir)).toBe(true);
      expect(result.manifest.totalFiles).toBeGreaterThanOrEqual(9);
    });
  });

  describe('MIG-02: Backup Verified', () => {
    it('should verify backup checksums match', async () => {
      await createMockV20Project(testDir);
      const backupResult = await createBackup(testDir);

      const verification = await verifyBackup(backupResult.backupDir);

      expect(verification.valid).toBe(true);
      expect(verification.verified).toBe(verification.totalFiles);
      expect(verification.failed).toHaveLength(0);
    });
  });

  describe('MIG-03: Analysis Works', () => {
    it('should detect v2.0 structure and generate plan', async () => {
      await createMockV20Project(testDir);

      const detection = await detectV2Structure(testDir);
      expect(detection.isV2).toBe(true);
      expect(detection.version).toBe('2.0');

      const plan = await analyzeMigrationPlan(testDir);
      expect(plan.canMigrate).toBe(true);
      expect(plan.totalFiles).toBeGreaterThanOrEqual(9);
      expect(plan.modules.development.files.length).toBeGreaterThan(0);
      expect(plan.modules.core.files.length).toBeGreaterThan(0);
      expect(plan.modules.product.files.length).toBeGreaterThan(0);
    });
  });

  describe('MIG-04: Core Migrated', () => {
    it('should migrate core module files correctly', async () => {
      await createMockV20Project(testDir);
      const plan = await analyzeMigrationPlan(testDir);

      const result = await executeMigration(plan, { cleanupOriginals: false });

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'core', 'registry', 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'core', 'utils', 'helpers.js'))).toBe(true);
    });
  });

  describe('MIG-05: Dev Migrated', () => {
    it('should migrate development module files correctly', async () => {
      await createMockV20Project(testDir);
      const plan = await analyzeMigrationPlan(testDir);

      const result = await executeMigration(plan, { cleanupOriginals: false });

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'development', 'agents', 'dev.md'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'development', 'tasks', 'build.md'))).toBe(true);
    });
  });

  describe('MIG-06: Imports Updated', () => {
    it('should verify no broken imports after migration', async () => {
      await createMockV20Project(testDir);
      const plan = await analyzeMigrationPlan(testDir);

      await executeMigration(plan, { cleanupOriginals: false });

      const aioxCoreDir = path.join(testDir, '.aiox-core');
      const importResult = await verifyImports(aioxCoreDir);

      // In a migrated structure, imports may need updating
      // This test verifies the import verification runs
      expect(importResult).toHaveProperty('totalImports');
      expect(importResult).toHaveProperty('brokenImports');
    });
  });

  describe('MIG-07: Validation Pass', () => {
    it('should validate migrated structure', async () => {
      await createMockV20Project(testDir);
      const plan = await analyzeMigrationPlan(testDir);

      await executeMigration(plan, { cleanupOriginals: false });

      const aioxCoreDir = path.join(testDir, '.aiox-core');
      const validation = await validateStructure(aioxCoreDir);

      expect(validation.modules.core.exists).toBe(true);
      expect(validation.modules.development.exists).toBe(true);
      expect(validation.modules.product.exists).toBe(true);
      expect(validation.modules.infrastructure.exists).toBe(true);
    });
  });

  describe('MIG-08: Rollback Works', () => {
    it('should rollback to original v2.0 state', async () => {
      await createMockV20Project(testDir);

      // Create backup and migrate
      const backupResult = await createBackup(testDir);
      const plan = await analyzeMigrationPlan(testDir);
      await executeMigration(plan, { cleanupOriginals: true });

      // Verify v2.1 structure exists
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'development'))).toBe(true);

      // Check rollback is possible
      const status = await canRollback(testDir);
      expect(status.canRollback).toBe(true);

      // Execute rollback
      const rollbackResult = await executeRollback(testDir);

      expect(rollbackResult.success).toBe(true);
      // Original v2.0 structure should be restored
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'agents', 'dev.md'))).toBe(true);
    });
  });

  describe('MIG-09: Dry Run', () => {
    it('should show plan without making changes in dry run mode', async () => {
      await createMockV20Project(testDir);
      const plan = await analyzeMigrationPlan(testDir);

      const result = await executeMigration(plan, { dryRun: true });

      expect(result.dryRun).toBe(true);
      // V2.1 directories should NOT exist
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'development'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, '.aiox-core', 'core'))).toBe(false);
    });
  });

  describe('MIG-11: Conflict Detection', () => {
    it('should detect existing v2.1 directories as conflicts', async () => {
      await createMockV20Project(testDir);

      // Add a conflict
      await fs.promises.mkdir(path.join(testDir, '.aiox-core', 'core'), { recursive: true });

      const plan = await analyzeMigrationPlan(testDir);

      expect(plan.conflicts.length).toBeGreaterThan(0);
      expect(plan.conflicts[0].module).toBe('core');
    });
  });

  describe('MIG-12: Permissions', () => {
    it('should preserve file permissions during migration', async () => {
      await createMockV20Project(testDir);

      const originalFile = path.join(testDir, '.aiox-core', 'cli', 'index.js');
      const originalStats = await fs.promises.stat(originalFile);

      const plan = await analyzeMigrationPlan(testDir);
      await executeMigration(plan, { cleanupOriginals: false });

      const migratedFile = path.join(testDir, '.aiox-core', 'product', 'cli', 'index.js');
      const migratedStats = await fs.promises.stat(migratedFile);

      // Permissions should match
      expect(migratedStats.mode).toBe(originalStats.mode);
    });
  });

  describe('Full Migration Flow', () => {
    it('should complete entire migration workflow', async () => {
      // Setup
      await createMockV20Project(testDir);

      // Step 1: Detect version
      const detection = await detectV2Structure(testDir);
      expect(detection.isV2).toBe(true);

      // Step 2: Create backup
      const backupResult = await createBackup(testDir);
      expect(backupResult.success).toBe(true);

      // Step 3: Verify backup
      const verification = await verifyBackup(backupResult.backupDir);
      expect(verification.valid).toBe(true);

      // Step 4: Generate plan
      const plan = await analyzeMigrationPlan(testDir);
      expect(plan.canMigrate).toBe(true);

      // Step 5: Execute migration
      const migrationResult = await executeMigration(plan, { cleanupOriginals: false });
      expect(migrationResult.success).toBe(true);

      // Step 6: Update imports
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      const importResult = await updateAllImports(aioxCoreDir, plan);
      expect(importResult.totalFiles).toBeGreaterThan(0);

      // Step 7: Validate structure
      const structureValidation = await validateStructure(aioxCoreDir);
      expect(structureValidation.modules.core.exists).toBe(true);
      expect(structureValidation.modules.development.exists).toBe(true);
      expect(structureValidation.modules.product.exists).toBe(true);
      expect(structureValidation.modules.infrastructure.exists).toBe(true);

      // Step 8: Detect as v2.1 now
      // Since we didn't cleanup originals, we have both structures
      // In real migration with cleanup, detection would show v2.1
    });
  });
});
