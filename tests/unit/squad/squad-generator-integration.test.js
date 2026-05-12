/**
 * Integration Tests for SquadGenerator
 *
 * Tests the complete workflow:
 * - Create squad → Validate → List
 * - All templates work correctly
 * - Config inheritance modes work
 * - Generated squads integrate with aiox-core
 *
 * @see Story SQS-4: Squad Creator Agent + Tasks
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadGenerator,
  SquadValidator,
  SquadLoader,
} = require('../../../.aiox-core/development/scripts/squad');

describe('SquadGenerator Integration Tests', () => {
  let tempDir;
  let generator;
  let validator;
  let loader;

  beforeAll(async () => {
    // Create temp directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-integration-test-'));
  });

  afterAll(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    generator = new SquadGenerator({ squadsPath: tempDir });
    validator = new SquadValidator();
    loader = new SquadLoader({ squadsPath: tempDir });
  });

  afterEach(async () => {
    // Clean up generated squads after each test
    try {
      const entries = await fs.readdir(tempDir);
      for (const entry of entries) {
        await fs.rm(path.join(tempDir, entry), { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Create → Validate Flow', () => {
    it('should create and validate basic template', async () => {
      // Create
      const result = await generator.generate({
        name: 'basic-flow-test',
        template: 'basic',
        description: 'Test basic flow',
      });

      // Validate
      const validation = await validator.validate(result.path);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should create and validate etl template', async () => {
      // Create
      const result = await generator.generate({
        name: 'etl-flow-test',
        template: 'etl',
        description: 'Test ETL flow',
      });

      // Validate
      const validation = await validator.validate(result.path);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Verify ETL-specific components
      const manifest = await loader.loadManifest(result.path);
      expect(manifest.components.agents).toContain('data-extractor.md');
      expect(manifest.components.agents).toContain('data-transformer.md');
      expect(manifest.components.tasks).toContain('extract-data.md');
    });

    it('should create and validate agent-only template', async () => {
      // Create
      const result = await generator.generate({
        name: 'agent-only-flow-test',
        template: 'agent-only',
        description: 'Test agent-only flow',
      });

      // Validate
      const validation = await validator.validate(result.path);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Verify agent-only structure
      const manifest = await loader.loadManifest(result.path);
      expect(manifest.components.agents).toContain('primary-agent.md');
      expect(manifest.components.agents).toContain('helper-agent.md');
      expect(manifest.components.tasks).toEqual([]);
    });
  });

  describe('Create → List Flow', () => {
    it('should create multiple squads and list all', async () => {
      // Create multiple squads
      await generator.generate({ name: 'list-test-a', description: 'Squad A' });
      await generator.generate({ name: 'list-test-b', description: 'Squad B' });
      await generator.generate({ name: 'list-test-c', description: 'Squad C' });

      // List
      const squads = await generator.listLocal();

      expect(squads.length).toBe(3);
      expect(squads.map((s) => s.name)).toContain('list-test-a');
      expect(squads.map((s) => s.name)).toContain('list-test-b');
      expect(squads.map((s) => s.name)).toContain('list-test-c');
    });

    it('should list squads with correct metadata', async () => {
      await generator.generate({
        name: 'metadata-test',
        description: 'Metadata test squad',
        author: 'Test Author',
        license: 'Apache-2.0',
      });

      const squads = await generator.listLocal();
      const squad = squads.find((s) => s.name === 'metadata-test');

      expect(squad).toBeDefined();
      expect(squad.version).toBe('1.0.0');
      expect(squad.description).toBe('Metadata test squad');
    });
  });

  describe('Config Inheritance Integration', () => {
    it('should generate valid extend mode configuration', async () => {
      const result = await generator.generate({
        name: 'extend-config-test',
        configMode: 'extend',
        // Use tempDir as projectRoot to ensure local config files are created
        // (prevents detection of aiox-core's docs/framework/ configs)
        projectRoot: tempDir,
      });

      const manifest = await loader.loadManifest(result.path);
      expect(manifest.config.extends).toBe('extend');

      // Config files should exist (created locally since no project configs in tempDir)
      const codingStandards = await fs.readFile(
        path.join(result.path, 'config', 'coding-standards.md'),
        'utf-8',
      );
      expect(codingStandards).toContain('extends');
    });

    it('should generate valid override mode configuration', async () => {
      const result = await generator.generate({
        name: 'override-config-test',
        configMode: 'override',
        projectRoot: tempDir,
      });

      const manifest = await loader.loadManifest(result.path);
      expect(manifest.config.extends).toBe('override');
    });

    it('should generate valid none mode configuration', async () => {
      const result = await generator.generate({
        name: 'none-config-test',
        configMode: 'none',
      });

      const manifest = await loader.loadManifest(result.path);
      expect(manifest.config).toEqual({});
    });
  });

  describe('Loader Integration', () => {
    it('should resolve generated squad with loader', async () => {
      await generator.generate({
        name: 'loader-test',
        description: 'Loader integration test',
      });

      const resolved = await loader.resolve('loader-test');

      // loader.resolve returns { path, manifestPath }
      expect(resolved.path).toContain('loader-test');
      expect(resolved.manifestPath).toContain('squad.yaml');
    });

    it('should load manifest of generated squad', async () => {
      const result = await generator.generate({
        name: 'manifest-load-test',
        description: 'Manifest loading test',
        author: 'Integration Test',
      });

      const manifest = await loader.loadManifest(result.path);

      expect(manifest.name).toBe('manifest-load-test');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.description).toBe('Manifest loading test');
      expect(manifest.author).toBe('Integration Test');
      expect(manifest.aiox.type).toBe('squad');
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full workflow: create → load → validate → list', async () => {
      // 1. Create squad
      const createResult = await generator.generate({
        name: 'e2e-test-squad',
        description: 'End-to-end test',
        template: 'basic',
        configMode: 'extend',
      });

      expect(createResult.path).toBeDefined();
      expect(createResult.files.length).toBeGreaterThan(0);

      // 2. Load manifest
      const manifest = await loader.loadManifest(createResult.path);

      expect(manifest.name).toBe('e2e-test-squad');
      expect(manifest.aiox.minVersion).toBeDefined();

      // 3. Validate
      const validation = await validator.validate(createResult.path);

      expect(validation.valid).toBe(true);

      // 4. List
      const squads = await generator.listLocal();

      expect(squads.some((s) => s.name === 'e2e-test-squad')).toBe(true);
    });

    it('should support multiple squads in project', async () => {
      // Create different types of squads
      await generator.generate({
        name: 'project-squad-a',
        template: 'basic',
      });

      await generator.generate({
        name: 'project-squad-b',
        template: 'etl',
      });

      await generator.generate({
        name: 'project-squad-c',
        template: 'agent-only',
      });

      // Validate all
      const squads = await generator.listLocal();

      for (const squad of squads) {
        const validation = await validator.validate(squad.path);
        expect(validation.valid).toBe(true);
      }

      expect(squads.length).toBe(3);
    });
  });

  describe('File Structure Validation', () => {
    it('should create all expected files for basic template', async () => {
      const result = await generator.generate({
        name: 'structure-test',
        template: 'basic',
        // Use tempDir as projectRoot to ensure local config files are created
        projectRoot: tempDir,
      });

      const expectedFiles = [
        'squad.yaml',
        'README.md',
        'config/coding-standards.md',
        'config/tech-stack.md',
        'config/source-tree.md',
        'agents/example-agent.md',
        'tasks/example-agent-task.md',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(result.path, file);
        const exists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it('should create .gitkeep in empty directories', async () => {
      const result = await generator.generate({
        name: 'gitkeep-structure-test',
        template: 'basic',
        projectRoot: tempDir,
      });

      const emptyDirs = ['workflows', 'checklists', 'templates', 'tools', 'data'];

      for (const dir of emptyDirs) {
        const gitkeepPath = path.join(result.path, dir, '.gitkeep');
        const exists = await fs
          .access(gitkeepPath)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });
});
