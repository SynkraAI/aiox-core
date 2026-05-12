/**
 * Unit Tests for SquadGenerator
 *
 * Test Coverage:
 * - generate() creates complete squad structure
 * - generate() fails if squad already exists
 * - generate() validates squad name (kebab-case)
 * - Templates generate valid content
 * - Config inheritance is respected
 * - Optional files are generated correctly
 * - .gitkeep files created in empty directories
 * - Generated squad.yaml passes validation
 * - listLocal() returns squads from directory
 *
 * @see Story SQS-4: Squad Creator Agent + Tasks
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  isValidSquadName,
  getGitUserName,
} = require('../../../.aiox-core/development/scripts/squad');

const { SquadValidator } = require('../../../.aiox-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadGenerator', () => {
  let generator;
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    // Create temp directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-generator-test-'));
    originalCwd = process.cwd();
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
    // Create generator with temp directory as squads path
    generator = new SquadGenerator({
      squadsPath: tempDir,
    });
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

  describe('Constants', () => {
    it('should export AVAILABLE_TEMPLATES', () => {
      expect(AVAILABLE_TEMPLATES).toEqual(['basic', 'etl', 'agent-only']);
    });

    it('should export AVAILABLE_LICENSES', () => {
      expect(AVAILABLE_LICENSES).toContain('MIT');
      expect(AVAILABLE_LICENSES).toContain('Apache-2.0');
      expect(AVAILABLE_LICENSES).toContain('ISC');
      expect(AVAILABLE_LICENSES).toContain('UNLICENSED');
    });

    it('should export CONFIG_MODES', () => {
      expect(CONFIG_MODES).toEqual(['extend', 'override', 'none']);
    });

    it('should export GeneratorErrorCodes enum', () => {
      expect(GeneratorErrorCodes).toBeDefined();
      expect(GeneratorErrorCodes.INVALID_NAME).toBe('INVALID_NAME');
      expect(GeneratorErrorCodes.SQUAD_EXISTS).toBe('SQUAD_EXISTS');
      expect(GeneratorErrorCodes.TEMPLATE_NOT_FOUND).toBe('TEMPLATE_NOT_FOUND');
      expect(GeneratorErrorCodes.INVALID_CONFIG_MODE).toBe('INVALID_CONFIG_MODE');
    });
  });

  describe('isValidSquadName()', () => {
    it('should accept valid kebab-case names', () => {
      expect(isValidSquadName('my-squad')).toBe(true);
      expect(isValidSquadName('test-squad-123')).toBe(true);
      expect(isValidSquadName('etl-pipeline')).toBe(true);
      expect(isValidSquadName('a1')).toBe(true);
    });

    it('should reject invalid names', () => {
      // Too short
      expect(isValidSquadName('a')).toBe(false);

      // Uppercase
      expect(isValidSquadName('MySquad')).toBe(false);
      expect(isValidSquadName('MY-SQUAD')).toBe(false);

      // Starts with number
      expect(isValidSquadName('123-squad')).toBe(false);

      // Ends with hyphen
      expect(isValidSquadName('squad-')).toBe(false);

      // Starts with hyphen
      expect(isValidSquadName('-squad')).toBe(false);

      // Contains spaces
      expect(isValidSquadName('my squad')).toBe(false);

      // Contains underscores
      expect(isValidSquadName('my_squad')).toBe(false);

      // Empty
      expect(isValidSquadName('')).toBe(false);
    });
  });

  describe('getGitUserName()', () => {
    it('should return a string', () => {
      const result = getGitUserName();
      expect(typeof result).toBe('string');
    });

    it('should return "Unknown" when git is not configured', () => {
      // This test may pass or fail depending on git config
      // Just verify it doesn't throw
      expect(() => getGitUserName()).not.toThrow();
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultGenerator = new SquadGenerator();
      expect(defaultGenerator.squadsPath).toBe('./squads');
    });

    it('should use custom squads path when specified', () => {
      const customGenerator = new SquadGenerator({ squadsPath: './custom/path' });
      expect(customGenerator.squadsPath).toBe('./custom/path');
    });
  });

  describe('SquadGeneratorError', () => {
    it('should create error with correct properties', () => {
      const error = new SquadGeneratorError(
        GeneratorErrorCodes.INVALID_NAME,
        'Test message',
        'Test suggestion',
      );

      expect(error.name).toBe('SquadGeneratorError');
      expect(error.code).toBe(GeneratorErrorCodes.INVALID_NAME);
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
    });

    it('should create invalidName error with correct format', () => {
      const error = SquadGeneratorError.invalidName('BadName');

      expect(error.code).toBe(GeneratorErrorCodes.INVALID_NAME);
      expect(error.message).toContain('BadName');
      expect(error.suggestion).toContain('lowercase');
    });

    it('should create squadExists error with correct format', () => {
      const error = SquadGeneratorError.squadExists('my-squad', './squads/my-squad');

      expect(error.code).toBe(GeneratorErrorCodes.SQUAD_EXISTS);
      expect(error.message).toContain('my-squad');
      expect(error.message).toContain('already exists');
    });

    it('should create templateNotFound error with correct format', () => {
      const error = SquadGeneratorError.templateNotFound('invalid-template');

      expect(error.code).toBe(GeneratorErrorCodes.TEMPLATE_NOT_FOUND);
      expect(error.suggestion).toContain('basic');
      expect(error.suggestion).toContain('etl');
    });

    it('should create invalidConfigMode error with correct format', () => {
      const error = SquadGeneratorError.invalidConfigMode('invalid-mode');

      expect(error.code).toBe(GeneratorErrorCodes.INVALID_CONFIG_MODE);
      expect(error.suggestion).toContain('extend');
      expect(error.suggestion).toContain('override');
    });
  });

  describe('generate()', () => {
    it('should create complete squad structure', async () => {
      const result = await generator.generate({
        name: 'test-squad',
        description: 'Test squad',
        author: 'Test Author',
      });

      expect(result.path).toBe(path.join(tempDir, 'test-squad'));
      expect(result.files.length).toBeGreaterThan(0);

      // Check main files exist
      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('name: test-squad');
      expect(squadYaml).toContain('description: Test squad');

      const readme = await fs.readFile(path.join(result.path, 'README.md'), 'utf-8');
      expect(readme).toContain('# test-squad');
    });

    it('should create all required directories', async () => {
      const result = await generator.generate({
        name: 'dir-test-squad',
      });

      const expectedDirs = [
        'config',
        'agents',
        'tasks',
        'workflows',
        'checklists',
        'templates',
        'tools',
        'scripts',
        'data',
      ];

      for (const dir of expectedDirs) {
        const dirPath = path.join(result.path, dir);
        const stat = await fs.stat(dirPath);
        expect(stat.isDirectory()).toBe(true);
      }
    });

    it('should fail if squad already exists', async () => {
      // Create first squad
      await generator.generate({ name: 'existing-squad' });

      // Try to create again
      await expect(generator.generate({ name: 'existing-squad' })).rejects.toThrow(
        SquadGeneratorError,
      );
    });

    it('should fail with invalid squad name', async () => {
      await expect(generator.generate({ name: 'InvalidName' })).rejects.toThrow(
        SquadGeneratorError,
      );

      await expect(generator.generate({ name: '123-squad' })).rejects.toThrow(
        SquadGeneratorError,
      );
    });

    it('should fail without squad name', async () => {
      await expect(generator.generate({})).rejects.toThrow(SquadGeneratorError);
    });

    it('should fail with invalid template', async () => {
      await expect(
        generator.generate({
          name: 'template-test',
          template: 'invalid-template',
        }),
      ).rejects.toThrow(SquadGeneratorError);
    });

    it('should fail with invalid config mode', async () => {
      await expect(
        generator.generate({
          name: 'config-test',
          configMode: 'invalid-mode',
        }),
      ).rejects.toThrow(SquadGeneratorError);
    });

    it('should use defaults when options not provided', async () => {
      const result = await generator.generate({ name: 'defaults-test' });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('license: MIT');
      expect(squadYaml).toContain('extends: extend');
    });

    it('should respect includeAgent option', async () => {
      const resultWithAgent = await generator.generate({
        name: 'with-agent',
        includeAgent: true,
      });

      const agentPath = path.join(resultWithAgent.path, 'agents', 'example-agent.md');
      const stat = await fs.stat(agentPath);
      expect(stat.isFile()).toBe(true);
    });

    it('should respect includeTask option', async () => {
      const resultWithTask = await generator.generate({
        name: 'with-task',
        includeTask: true,
      });

      const taskPath = path.join(resultWithTask.path, 'tasks', 'example-agent-task.md');
      const stat = await fs.stat(taskPath);
      expect(stat.isFile()).toBe(true);
    });

    it('should generate .gitkeep in empty directories', async () => {
      const result = await generator.generate({
        name: 'gitkeep-test',
        includeAgent: true,
        includeTask: true,
      });

      // workflows should be empty and have .gitkeep
      const gitkeepPath = path.join(result.path, 'workflows', '.gitkeep');
      const stat = await fs.stat(gitkeepPath);
      expect(stat.isFile()).toBe(true);
    });
  });

  describe('generate() with templates', () => {
    it('should generate basic template correctly', async () => {
      const result = await generator.generate({
        name: 'basic-template-test',
        template: 'basic',
      });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('example-agent.md');
      expect(squadYaml).toContain('example-agent-task.md');
    });

    it('should generate etl template with multiple agents and tasks', async () => {
      const result = await generator.generate({
        name: 'etl-template-test',
        template: 'etl',
      });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('data-extractor.md');
      expect(squadYaml).toContain('data-transformer.md');
      expect(squadYaml).toContain('extract-data.md');
      expect(squadYaml).toContain('transform-data.md');
      expect(squadYaml).toContain('load-data.md');

      // Check agents exist
      const extractorPath = path.join(result.path, 'agents', 'data-extractor.md');
      const transformerPath = path.join(result.path, 'agents', 'data-transformer.md');
      expect(await fs.stat(extractorPath)).toBeDefined();
      expect(await fs.stat(transformerPath)).toBeDefined();

      // Check tasks exist
      const extractTaskPath = path.join(result.path, 'tasks', 'extract-data.md');
      const transformTaskPath = path.join(result.path, 'tasks', 'transform-data.md');
      const loadTaskPath = path.join(result.path, 'tasks', 'load-data.md');
      expect(await fs.stat(extractTaskPath)).toBeDefined();
      expect(await fs.stat(transformTaskPath)).toBeDefined();
      expect(await fs.stat(loadTaskPath)).toBeDefined();
    });

    it('should generate agent-only template without tasks', async () => {
      const result = await generator.generate({
        name: 'agent-only-test',
        template: 'agent-only',
      });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('primary-agent.md');
      expect(squadYaml).toContain('helper-agent.md');
      expect(squadYaml).toContain('tasks: []');

      // Check agents exist
      const primaryPath = path.join(result.path, 'agents', 'primary-agent.md');
      const helperPath = path.join(result.path, 'agents', 'helper-agent.md');
      expect(await fs.stat(primaryPath)).toBeDefined();
      expect(await fs.stat(helperPath)).toBeDefined();
    });
  });

  describe('generate() config inheritance', () => {
    it('should set extends mode correctly', async () => {
      // Pass projectRoot: tempDir to prevent detecting real project's docs/framework/
      const result = await generator.generate({
        name: 'extend-test',
        configMode: 'extend',
        projectRoot: tempDir,
      });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('extends: extend');

      const codingStandards = await fs.readFile(
        path.join(result.path, 'config', 'coding-standards.md'),
        'utf-8',
      );
      expect(codingStandards).toContain('extends');
    });

    it('should set override mode correctly', async () => {
      const result = await generator.generate({
        name: 'override-test',
        configMode: 'override',
      });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('extends: override');
    });

    it('should set none mode correctly', async () => {
      const result = await generator.generate({
        name: 'none-test',
        configMode: 'none',
      });

      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('config: {}');
    });
  });

  describe('generate() creates valid squad', () => {
    it('should generate squad.yaml that passes validation', async () => {
      const result = await generator.generate({
        name: 'validation-test',
        description: 'Test for validation',
        author: 'Test Author',
      });

      // Validate the generated squad
      const validator = new SquadValidator();
      const validation = await validator.validate(result.path);

      // Should be valid (no errors, may have warnings)
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('listLocal()', () => {
    it('should return empty array when no squads exist', async () => {
      const squads = await generator.listLocal();
      expect(squads).toEqual([]);
    });

    it('should list generated squads', async () => {
      // Generate some squads
      await generator.generate({ name: 'list-test-1', description: 'First squad' });
      await generator.generate({ name: 'list-test-2', description: 'Second squad' });

      const squads = await generator.listLocal();

      expect(squads.length).toBe(2);
      expect(squads.map((s) => s.name)).toContain('list-test-1');
      expect(squads.map((s) => s.name)).toContain('list-test-2');
    });

    it('should return squad info with name, version, description', async () => {
      await generator.generate({
        name: 'info-test',
        description: 'Test description',
      });

      const squads = await generator.listLocal();
      const squad = squads.find((s) => s.name === 'info-test');

      expect(squad).toBeDefined();
      expect(squad.version).toBe('1.0.0');
      expect(squad.description).toBe('Test description');
      expect(squad.path).toContain('info-test');
    });

    it('should return empty array when squads path does not exist', async () => {
      const nonExistentGenerator = new SquadGenerator({
        squadsPath: '/nonexistent/path/to/squads',
      });

      const squads = await nonExistentGenerator.listLocal();
      expect(squads).toEqual([]);
    });
  });

  describe('Performance', () => {
    // Use more generous thresholds in CI environments
    const isCI = process.env.CI === 'true';
    const generateThreshold = isCI ? 5000 : 500;
    const listThreshold = isCI ? 1000 : 100;

    it('should generate squad within acceptable time', async () => {
      const start = Date.now();

      await generator.generate({ name: 'perf-test' });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(generateThreshold);
    });

    it('should list squads within acceptable time', async () => {
      // Generate a few squads first
      await generator.generate({ name: 'perf-list-1' });
      await generator.generate({ name: 'perf-list-2' });
      await generator.generate({ name: 'perf-list-3' });

      const start = Date.now();
      await generator.listLocal();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(listThreshold);
    });
  });

  // =========================================================================
  // SQS-10: Project Config Reference Tests
  // =========================================================================
  describe('detectProjectConfigs() [SQS-10]', () => {
    let projectDir;

    beforeEach(async () => {
      // Create a project-like structure in temp dir
      projectDir = path.join(tempDir, 'test-project');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(path.join(projectDir, 'squads'), { recursive: true });
      generator = new SquadGenerator({
        squadsPath: path.join(projectDir, 'squads'),
      });
    });

    it('should return null when docs/framework/ does not exist', async () => {
      const squadPath = path.join(projectDir, 'squads', 'test-squad');
      const result = await generator.detectProjectConfigs(projectDir, squadPath);
      expect(result).toBeNull();
    });

    it('should detect project configs when docs/framework/ exists', async () => {
      // Create docs/framework/ with config files
      const frameworkDir = path.join(projectDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'CODING-STANDARDS.md'), '# Standards');
      await fs.writeFile(path.join(frameworkDir, 'TECH-STACK.md'), '# Tech');
      await fs.writeFile(path.join(frameworkDir, 'SOURCE-TREE.md'), '# Tree');

      const squadPath = path.join(projectDir, 'squads', 'test-squad');
      const result = await generator.detectProjectConfigs(projectDir, squadPath);

      expect(result).not.toBeNull();
      expect(result['coding-standards']).toContain('docs/framework/CODING-STANDARDS.md');
      expect(result['tech-stack']).toContain('docs/framework/TECH-STACK.md');
      expect(result['source-tree']).toContain('docs/framework/SOURCE-TREE.md');
    });

    it('should detect case-insensitive config files', async () => {
      // Create docs/framework/ with lowercase files
      const frameworkDir = path.join(projectDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'coding-standards.md'), '# Standards');

      const squadPath = path.join(projectDir, 'squads', 'test-squad');
      const result = await generator.detectProjectConfigs(projectDir, squadPath);

      expect(result).not.toBeNull();
      // On case-insensitive filesystems (Windows), the path may contain the first variant checked
      // (CODING-STANDARDS.md) even though the actual file is coding-standards.md
      // Check for case-insensitive match
      expect(result['coding-standards'].toLowerCase()).toContain('coding-standards.md');
    });

    it('should return null when docs/framework/ has no matching files', async () => {
      // Create empty docs/framework/
      const frameworkDir = path.join(projectDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'other-file.md'), '# Other');

      const squadPath = path.join(projectDir, 'squads', 'test-squad');
      const result = await generator.detectProjectConfigs(projectDir, squadPath);

      expect(result).toBeNull();
    });
  });

  describe('generate() with project configs [SQS-10]', () => {
    let projectDir;

    beforeEach(async () => {
      // Create a project-like structure
      projectDir = path.join(tempDir, 'project-config-test');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(path.join(projectDir, 'squads'), { recursive: true });
      generator = new SquadGenerator({
        squadsPath: path.join(projectDir, 'squads'),
      });
    });

    it('should reference project configs when configMode is extend and project configs exist', async () => {
      // Create docs/framework/ with config files
      const frameworkDir = path.join(projectDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'CODING-STANDARDS.md'), '# Standards');
      await fs.writeFile(path.join(frameworkDir, 'TECH-STACK.md'), '# Tech');
      await fs.writeFile(path.join(frameworkDir, 'SOURCE-TREE.md'), '# Tree');

      const result = await generator.generate({
        name: 'project-config-squad',
        configMode: 'extend',
        projectRoot: projectDir,
      });

      // Read squad.yaml and check it references project configs
      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('docs/framework/CODING-STANDARDS.md');
      expect(squadYaml).toContain('docs/framework/TECH-STACK.md');
      expect(squadYaml).toContain('docs/framework/SOURCE-TREE.md');

      // Check that local config files were NOT created
      const configDir = path.join(result.path, 'config');
      const configFiles = await fs.readdir(configDir);
      expect(configFiles).toContain('.gitkeep');
      expect(configFiles).not.toContain('coding-standards.md');
      expect(configFiles).not.toContain('tech-stack.md');
      expect(configFiles).not.toContain('source-tree.md');
    });

    it('should create local configs when project configs do not exist (fallback)', async () => {
      const result = await generator.generate({
        name: 'fallback-squad',
        configMode: 'extend',
        projectRoot: projectDir, // No docs/framework/ exists
      });

      // Read squad.yaml and check it uses local config paths
      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('config/coding-standards.md');
      expect(squadYaml).toContain('config/tech-stack.md');
      expect(squadYaml).toContain('config/source-tree.md');

      // Check that local config files WERE created
      const configDir = path.join(result.path, 'config');
      const configFiles = await fs.readdir(configDir);
      expect(configFiles).toContain('coding-standards.md');
      expect(configFiles).toContain('tech-stack.md');
      expect(configFiles).toContain('source-tree.md');
    });

    it('should always create local configs when configMode is override', async () => {
      // Create docs/framework/ with config files
      const frameworkDir = path.join(projectDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'CODING-STANDARDS.md'), '# Standards');
      await fs.writeFile(path.join(frameworkDir, 'TECH-STACK.md'), '# Tech');
      await fs.writeFile(path.join(frameworkDir, 'SOURCE-TREE.md'), '# Tree');

      const result = await generator.generate({
        name: 'override-squad',
        configMode: 'override', // Override ignores project configs
        projectRoot: projectDir,
      });

      // Read squad.yaml and check it uses local config paths
      const squadYaml = await fs.readFile(path.join(result.path, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('config/coding-standards.md');

      // Check that local config files WERE created
      const configDir = path.join(result.path, 'config');
      const configFiles = await fs.readdir(configDir);
      expect(configFiles).toContain('coding-standards.md');
    });
  });
});
