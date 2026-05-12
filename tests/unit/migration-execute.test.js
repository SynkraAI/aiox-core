/**
 * Migration Execute Module Tests
 *
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  createModuleDirectories,
  migrateModule,
  executeMigration,
  saveMigrationState,
  loadMigrationState,
  clearMigrationState,
} = require('../../.aiox-core/cli/commands/migrate/execute');
const { analyzeMigrationPlan } = require('../../.aiox-core/cli/commands/migrate/analyze');

describe('Migration Execute Module', () => {
  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `aiox-execute-test-${Date.now()}`);
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (testDir && fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('createModuleDirectories', () => {
    it('should create all four module directories', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(aioxCoreDir, { recursive: true });

      const result = await createModuleDirectories(aioxCoreDir);

      expect(fs.existsSync(path.join(aioxCoreDir, 'core'))).toBe(true);
      expect(fs.existsSync(path.join(aioxCoreDir, 'development'))).toBe(true);
      expect(fs.existsSync(path.join(aioxCoreDir, 'product'))).toBe(true);
      expect(fs.existsSync(path.join(aioxCoreDir, 'infrastructure'))).toBe(true);
      expect(result.modules).toContain('core');
    });

    it('should not fail if directories already exist', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(path.join(aioxCoreDir, 'core'), { recursive: true });

      const result = await createModuleDirectories(aioxCoreDir);

      expect(result.created).not.toContain(path.join(aioxCoreDir, 'core'));
    });
  });

  describe('migrateModule', () => {
    it('should migrate files to module directory', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(path.join(aioxCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aioxCoreDir, 'development'), { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'agents', 'dev.md'), 'Agent');

      const moduleData = {
        files: [{
          sourcePath: path.join(aioxCoreDir, 'agents', 'dev.md'),
          relativePath: path.join('agents', 'dev.md'),
          size: 5,
        }],
      };

      const result = await migrateModule(moduleData, 'development', aioxCoreDir);

      expect(result.migratedFiles).toHaveLength(1);
      expect(fs.existsSync(path.join(aioxCoreDir, 'development', 'agents', 'dev.md'))).toBe(true);
    });

    it('should support dry run mode', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(path.join(aioxCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aioxCoreDir, 'development'), { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'agents', 'dev.md'), 'Agent');

      const moduleData = {
        files: [{
          sourcePath: path.join(aioxCoreDir, 'agents', 'dev.md'),
          relativePath: path.join('agents', 'dev.md'),
          size: 5,
        }],
      };

      const result = await migrateModule(moduleData, 'development', aioxCoreDir, { dryRun: true });

      expect(result.migratedFiles).toHaveLength(1);
      expect(result.migratedFiles[0].dryRun).toBe(true);
      // File should NOT be copied in dry run
      expect(fs.existsSync(path.join(aioxCoreDir, 'development', 'agents', 'dev.md'))).toBe(false);
    });
  });

  describe('executeMigration', () => {
    it('should execute full migration', async () => {
      // Create v2.0 structure
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(path.join(aioxCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aioxCoreDir, 'registry'), { recursive: true });
      await fs.promises.mkdir(path.join(aioxCoreDir, 'cli'), { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'agents', 'dev.md'), 'Agent');
      await fs.promises.writeFile(path.join(aioxCoreDir, 'registry', 'index.js'), 'Registry');
      await fs.promises.writeFile(path.join(aioxCoreDir, 'cli', 'index.js'), 'CLI');

      const plan = await analyzeMigrationPlan(testDir);
      const result = await executeMigration(plan, { cleanupOriginals: false });

      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(3);
      expect(fs.existsSync(path.join(aioxCoreDir, 'development', 'agents', 'dev.md'))).toBe(true);
      expect(fs.existsSync(path.join(aioxCoreDir, 'core', 'registry', 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(aioxCoreDir, 'product', 'cli', 'index.js'))).toBe(true);
    });

    it('should return error for non-migratable plan', async () => {
      const plan = { canMigrate: false, error: 'Test error' };
      const result = await executeMigration(plan);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should support dry run', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(path.join(aioxCoreDir, 'agents'), { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'agents', 'dev.md'), 'Agent');

      const plan = await analyzeMigrationPlan(testDir);
      const result = await executeMigration(plan, { dryRun: true });

      expect(result.dryRun).toBe(true);
      // Directories should not be created in dry run
      expect(fs.existsSync(path.join(aioxCoreDir, 'development'))).toBe(false);
    });
  });

  describe('Migration State', () => {
    it('should save and load migration state', async () => {
      await saveMigrationState(testDir, { phase: 'test', value: 123 });

      const state = await loadMigrationState(testDir);

      expect(state.phase).toBe('test');
      expect(state.value).toBe(123);
      expect(state.timestamp).toBeTruthy();
    });

    it('should return null if no state exists', async () => {
      const state = await loadMigrationState(testDir);
      expect(state).toBeNull();
    });

    it('should clear migration state', async () => {
      await saveMigrationState(testDir, { phase: 'test' });
      await clearMigrationState(testDir);

      const state = await loadMigrationState(testDir);
      expect(state).toBeNull();
    });
  });
});
