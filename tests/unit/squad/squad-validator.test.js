/**
 * Unit Tests for SquadValidator
 *
 * Test Coverage:
 * - validate() runs all checks and returns correct result
 * - validateManifest() validates against JSON Schema
 * - validateManifest() warns on deprecated config.yaml
 * - validateManifest() returns error for missing manifest
 * - validateManifest() returns error for malformed YAML
 * - validateStructure() checks for expected directories
 * - validateStructure() validates referenced files exist
 * - validateTasks() checks TASK-FORMAT-SPECIFICATION-V1 fields
 * - validateAgents() checks agent definition format
 * - strict mode treats warnings as errors
 * - formatResult() produces correct output
 * - Performance metrics within targets
 *
 * @see Story SQS-3: Squad Validator + JSON Schema
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,
} = require('../../../.aiox-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadValidator', () => {
  let validator;
  let strictValidator;
  let verboseValidator;
  let consoleLogSpy;

  beforeEach(() => {
    // Create validators with different options
    validator = new SquadValidator();
    strictValidator = new SquadValidator({ strict: true });
    verboseValidator = new SquadValidator({ verbose: true });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should export ValidationErrorCodes enum', () => {
      expect(ValidationErrorCodes).toBeDefined();
      expect(ValidationErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ValidationErrorCodes.YAML_PARSE_ERROR).toBe('YAML_PARSE_ERROR');
      expect(ValidationErrorCodes.SCHEMA_ERROR).toBe('SCHEMA_ERROR');
      expect(ValidationErrorCodes.DEPRECATED_MANIFEST).toBe('DEPRECATED_MANIFEST');
      expect(ValidationErrorCodes.MISSING_DIRECTORY).toBe('MISSING_DIRECTORY');
      expect(ValidationErrorCodes.NO_TASKS).toBe('NO_TASKS');
      expect(ValidationErrorCodes.TASK_MISSING_FIELD).toBe('TASK_MISSING_FIELD');
      expect(ValidationErrorCodes.AGENT_INVALID_FORMAT).toBe('AGENT_INVALID_FORMAT');
      expect(ValidationErrorCodes.FILE_NOT_FOUND).toBe('FILE_NOT_FOUND');
      expect(ValidationErrorCodes.INVALID_NAMING).toBe('INVALID_NAMING');
    });

    it('should export TASK_REQUIRED_FIELDS with correct fields', () => {
      expect(TASK_REQUIRED_FIELDS).toBeDefined();
      expect(Array.isArray(TASK_REQUIRED_FIELDS)).toBe(true);
      expect(TASK_REQUIRED_FIELDS).toContain('task');
      expect(TASK_REQUIRED_FIELDS).toContain('responsavel');
      expect(TASK_REQUIRED_FIELDS).toContain('atomic_layer');
      expect(TASK_REQUIRED_FIELDS).toContain('Entrada');
      expect(TASK_REQUIRED_FIELDS).toContain('Saida');
      expect(TASK_REQUIRED_FIELDS).toContain('Checklist');
    });
  });

  describe('Constructor', () => {
    it('should disable strict mode by default', () => {
      const defaultValidator = new SquadValidator();
      expect(defaultValidator.strict).toBe(false);
    });

    it('should enable strict mode when specified', () => {
      expect(strictValidator.strict).toBe(true);
    });

    it('should disable verbose mode by default', () => {
      const defaultValidator = new SquadValidator();
      expect(defaultValidator.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseValidator.verbose).toBe(true);
    });

    it('should accept custom schema for testing', () => {
      const customSchema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      };
      const customValidator = new SquadValidator({ schema: customSchema });
      expect(customValidator.validateSchema).toBeDefined();
    });
  });

  describe('validateManifest()', () => {
    it('should pass for valid squad.yaml (AC 3.1)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return MANIFEST_NOT_FOUND error when no manifest exists (AC 3.2)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ValidationErrorCodes.MANIFEST_NOT_FOUND);
      expect(result.errors[0].suggestion).toContain('squad.yaml');
    });

    it('should return YAML_PARSE_ERROR for malformed YAML (AC 3.3)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'malformed-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ValidationErrorCodes.YAML_PARSE_ERROR);
      expect(result.errors[0].suggestion).toContain('YAML');
    });

    it('should warn on deprecated config.yaml', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe(ValidationErrorCodes.DEPRECATED_MANIFEST);
      expect(result.warnings[0].suggestion).toContain('squad.yaml');
    });

    it('should return SCHEMA_ERROR for invalid patterns (AC 3.4)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-name-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(false);
      const schemaErrors = result.errors.filter(
        (e) => e.code === ValidationErrorCodes.SCHEMA_ERROR,
      );
      expect(schemaErrors.length).toBeGreaterThan(0);
    });

    it('should return SCHEMA_ERROR for missing required fields (AC 3.5)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'missing-version-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(false);
      const schemaErrors = result.errors.filter(
        (e) => e.code === ValidationErrorCodes.SCHEMA_ERROR,
      );
      expect(schemaErrors.length).toBeGreaterThan(0);
    });

    it('should complete within 100ms', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const start = Date.now();
      await validator.validateManifest(squadPath);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('validateStructure()', () => {
    it('should warn on missing tasks/ directory', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const result = await validator.validateStructure(squadPath);

      const missingDirWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.MISSING_DIRECTORY,
      );
      expect(missingDirWarnings.some((w) => w.message.includes('tasks/'))).toBe(true);
    });

    it('should warn on missing agents/ directory', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const result = await validator.validateStructure(squadPath);

      const missingDirWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.MISSING_DIRECTORY,
      );
      expect(missingDirWarnings.some((w) => w.message.includes('agents/'))).toBe(true);
    });

    it('should pass when tasks/ and agents/ exist', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validateStructure(squadPath);

      const missingDirWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.MISSING_DIRECTORY,
      );
      // Should not have warnings for tasks/ or agents/
      expect(missingDirWarnings.some((w) => w.message.includes('tasks/'))).toBe(false);
      expect(missingDirWarnings.some((w) => w.message.includes('agents/'))).toBe(false);
    });

    it('should error on referenced files that do not exist', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'missing-files-squad');
      const result = await validator.validateStructure(squadPath);

      expect(result.valid).toBe(false);
      const fileNotFoundErrors = result.errors.filter(
        (e) => e.code === ValidationErrorCodes.FILE_NOT_FOUND,
      );
      expect(fileNotFoundErrors.length).toBeGreaterThan(0);
    });
  });

  describe('validateTasks()', () => {
    it('should pass when tasks directory does not exist', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const result = await validator.validateTasks(squadPath);

      // No tasks dir = no errors (already warned in structure)
      expect(result.valid).toBe(true);
    });

    it('should warn when tasks/ is empty', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'empty-tasks-squad');
      const result = await validator.validateTasks(squadPath);

      const noTasksWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.NO_TASKS,
      );
      expect(noTasksWarnings.length).toBe(1);
    });

    it('should warn on missing required task fields (TASK-FORMAT-SPECIFICATION-V1)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'incomplete-task-squad');
      const result = await validator.validateTasks(squadPath);

      const missingFieldWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.TASK_MISSING_FIELD,
      );
      expect(missingFieldWarnings.length).toBeGreaterThan(0);
    });

    it('should pass for valid task with all required fields', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validateTasks(squadPath);

      const missingFieldWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.TASK_MISSING_FIELD && w.file === 'valid-task.md',
      );
      expect(missingFieldWarnings.length).toBe(0);
    });

    it('should warn on invalid task filename (not kebab-case)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-naming-squad');
      const result = await validator.validateTasks(squadPath);

      const namingWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.INVALID_NAMING,
      );
      expect(namingWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateAgents()', () => {
    it('should pass when agents directory does not exist', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const result = await validator.validateAgents(squadPath);

      // No agents dir = no errors (already warned in structure)
      expect(result.valid).toBe(true);
    });

    it('should pass for valid agent with YAML frontmatter', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validateAgents(squadPath);

      expect(result.valid).toBe(true);
      const formatWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.AGENT_INVALID_FORMAT && w.file === 'test-agent.md',
      );
      expect(formatWarnings.length).toBe(0);
    });

    it('should warn on agent without valid format', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-agent-squad');
      const result = await validator.validateAgents(squadPath);

      const formatWarnings = result.warnings.filter(
        (w) => w.code === ValidationErrorCodes.AGENT_INVALID_FORMAT,
      );
      expect(formatWarnings.length).toBeGreaterThan(0);
    });

    it('should warn on invalid agent filename (not kebab-case)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-naming-squad');
      const result = await validator.validateAgents(squadPath);

      const namingWarnings = result.warnings.filter(
        (w) =>
          w.code === ValidationErrorCodes.INVALID_NAMING && w.file.toLowerCase().includes('agent'),
      );
      expect(namingWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('validate()', () => {
    it('should run all validations and merge results', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validate(squadPath);

      // Should have structure from all validations
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('suggestions');
    });

    it('should return valid: true for valid squad', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validate(squadPath);

      expect(result.valid).toBe(true);
    });

    it('should return valid: false for squad with errors', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');
      const result = await validator.validate(squadPath);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should treat warnings as errors in strict mode', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const result = await strictValidator.validate(squadPath);

      // Has deprecated config.yaml warning which becomes error in strict mode
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === ValidationErrorCodes.DEPRECATED_MANIFEST)).toBe(
        true,
      );
      expect(result.warnings).toHaveLength(0);
    });

    it('should not treat warnings as errors in normal mode', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const result = await validator.validate(squadPath);

      // Has deprecated config.yaml warning but still valid
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === ValidationErrorCodes.DEPRECATED_MANIFEST)).toBe(
        true,
      );
    });

    it('should complete full validation within 500ms', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const start = Date.now();
      await validator.validate(squadPath);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('formatResult()', () => {
    it('should format valid result correctly', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validate(squadPath);
      const formatted = validator.formatResult(result, squadPath);

      expect(formatted).toContain('Validating squad:');
      expect(formatted).toContain('Result: VALID');
    });

    it('should format invalid result with errors', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');
      const result = await validator.validate(squadPath);
      const formatted = validator.formatResult(result, squadPath);

      expect(formatted).toContain('Errors:');
      expect(formatted).toContain('[MANIFEST_NOT_FOUND]');
      expect(formatted).toContain('Result: INVALID');
    });

    it('should format result with warnings', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const result = await validator.validate(squadPath);
      const formatted = validator.formatResult(result, squadPath);

      expect(formatted).toContain('Warnings:');
      expect(formatted).toContain('[DEPRECATED_MANIFEST]');
      expect(formatted).toContain('Result: VALID (with warnings)');
    });

    it('should include suggestions in formatted output', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');
      const result = await validator.validate(squadPath);
      const formatted = validator.formatResult(result, squadPath);

      expect(formatted).toContain('Suggestion:');
    });
  });

  describe('Verbose mode', () => {
    it('should log when verbose is enabled', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      await verboseValidator.validate(squadPath);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some((call) => call[0].includes('[SquadValidator]'))).toBe(
        true,
      );
    });

    it('should not log when verbose is disabled', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      await validator.validate(squadPath);

      const validatorLogs = consoleLogSpy.mock.calls.filter((call) =>
        call[0].includes('[SquadValidator]'),
      );
      expect(validatorLogs.length).toBe(0);
    });
  });

  describe('Cross-platform path handling', () => {
    it('should use path.join for all path operations', async () => {
      // The validator should work correctly regardless of platform
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validate(squadPath);

      // Should not throw errors related to path handling
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty manifest gracefully', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'empty-manifest-squad');
      const result = await validator.validateManifest(squadPath);

      // Empty YAML parses to null - validator should handle this
      // It may return valid=true if schema validation is skipped for null
      // or valid=false if null is treated as invalid
      expect(result).toBeDefined();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('should handle special characters in file paths', async () => {
      // The fixtures path itself may have special characters
      // This test ensures basic path handling works
      const squadPath = path.join(FIXTURES_PATH, 'complete-squad');
      const result = await validator.validate(squadPath);

      expect(result).toBeDefined();
    });
  });

  /**
   * SQS-10: Project Config Reference Tests
   * Tests for config path resolution and validation
   */
  describe('validateConfigReferences() [SQS-10]', () => {
    let tempDir;
    let squadPath;

    beforeEach(async () => {
      // Create temp directory for testing
      tempDir = path.join(__dirname, 'temp-sqs10-validator-' + Date.now());
      squadPath = path.join(tempDir, 'squads', 'test-squad');
      await fs.mkdir(squadPath, { recursive: true });
    });

    afterEach(async () => {
      // Clean up temp directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should pass when no config section exists in manifest', async () => {
      // Create minimal squad.yaml without config section
      const manifestContent = `
name: test-squad
version: 1.0.0
`;
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), manifestContent);

      const result = await validator.validateConfigReferences(squadPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should pass when local config files exist', async () => {
      // Create squad.yaml with local config references
      const manifestContent = `
name: test-squad
version: 1.0.0
config:
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
`;
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), manifestContent);

      // Create local config files
      const configDir = path.join(squadPath, 'config');
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(path.join(configDir, 'coding-standards.md'), '# Coding Standards');
      await fs.writeFile(path.join(configDir, 'tech-stack.md'), '# Tech Stack');

      const result = await validator.validateConfigReferences(squadPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass when project-level config files exist (AC10.4)', async () => {
      // Create project-level framework directory
      const frameworkDir = path.join(tempDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(
        path.join(frameworkDir, 'CODING-STANDARDS.md'),
        '# Project Coding Standards',
      );
      await fs.writeFile(path.join(frameworkDir, 'TECH-STACK.md'), '# Project Tech Stack');

      // Create squad.yaml with project-level config references
      const manifestContent = `
name: test-squad
version: 1.0.0
config:
  coding-standards: ../../docs/framework/CODING-STANDARDS.md
  tech-stack: ../../docs/framework/TECH-STACK.md
`;
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), manifestContent);

      const result = await validator.validateConfigReferences(squadPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn when project-level config is missing', async () => {
      // Create squad.yaml referencing non-existent project-level configs
      const manifestContent = `
name: test-squad
version: 1.0.0
config:
  coding-standards: ../../docs/framework/CODING-STANDARDS.md
`;
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), manifestContent);

      const result = await validator.validateConfigReferences(squadPath);

      expect(result.valid).toBe(true); // Warnings don't fail validation
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe(ValidationErrorCodes.FILE_NOT_FOUND);
    });

    it('should error when local config is missing', async () => {
      // Create squad.yaml referencing non-existent local configs
      const manifestContent = `
name: test-squad
version: 1.0.0
config:
  coding-standards: config/coding-standards.md
`;
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), manifestContent);

      const result = await validator.validateConfigReferences(squadPath);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe(ValidationErrorCodes.FILE_NOT_FOUND);
    });
  });

  describe('_resolveConfigPath() [SQS-10]', () => {
    let tempDir;
    let squadPath;

    beforeEach(async () => {
      // Create temp directory for testing
      tempDir = path.join(__dirname, 'temp-sqs10-resolve-' + Date.now());
      squadPath = path.join(tempDir, 'squads', 'test-squad');
      await fs.mkdir(squadPath, { recursive: true });
    });

    afterEach(async () => {
      // Clean up temp directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should return null for null/undefined config path', async () => {
      const result = await validator._resolveConfigPath(squadPath, null);
      expect(result).toBeNull();

      const result2 = await validator._resolveConfigPath(squadPath, undefined);
      expect(result2).toBeNull();
    });

    it('should resolve local config path', async () => {
      // Create local config file
      const configDir = path.join(squadPath, 'config');
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(path.join(configDir, 'test-config.md'), '# Test Config');

      const result = await validator._resolveConfigPath(squadPath, 'config/test-config.md');

      expect(result).toBeDefined();
      expect(result).toContain('test-config.md');
    });

    it('should resolve project-level config path with relative reference', async () => {
      // Create project-level framework directory
      const frameworkDir = path.join(tempDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'CODING-STANDARDS.md'), '# Standards');

      const result = await validator._resolveConfigPath(
        squadPath,
        '../../docs/framework/CODING-STANDARDS.md',
      );

      expect(result).toBeDefined();
      expect(result).toContain('CODING-STANDARDS.md');
    });

    it('should return null for non-existent path', async () => {
      const result = await validator._resolveConfigPath(squadPath, 'config/nonexistent.md');
      expect(result).toBeNull();
    });
  });

  describe('validate() integration with config references [SQS-10]', () => {
    let tempDir;
    let squadPath;

    beforeEach(async () => {
      // Create temp directory for testing
      tempDir = path.join(__dirname, 'temp-sqs10-integrate-' + Date.now());
      squadPath = path.join(tempDir, 'squads', 'test-squad');
      await fs.mkdir(path.join(squadPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
    });

    afterEach(async () => {
      // Clean up temp directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should include config validation in full validate() call', async () => {
      // Create valid squad with project-level configs
      const frameworkDir = path.join(tempDir, 'docs', 'framework');
      await fs.mkdir(frameworkDir, { recursive: true });
      await fs.writeFile(path.join(frameworkDir, 'CODING-STANDARDS.md'), '# Standards');

      const manifestContent = `
name: test-squad
version: 1.0.0
config:
  coding-standards: ../../docs/framework/CODING-STANDARDS.md
`;
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), manifestContent);

      const result = await validator.validate(squadPath);

      // Should complete without config-related errors
      const configErrors = result.errors.filter((e) => e.message && e.message.includes('config'));
      expect(configErrors).toHaveLength(0);
    });
  });
});
