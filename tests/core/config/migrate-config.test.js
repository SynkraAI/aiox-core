/**
 * Tests for migrate-config.js — Legacy → L2 + L5 Migration
 *
 * Covers:
 * - Legacy detection and backup creation (AC5, AC6)
 * - Field extraction: user → L5, project → L2 (AC5)
 * - Backup creation before migration (AC6)
 * - Idempotent re-execution (Task 3.8)
 * - Dry run mode
 * - Edge cases: missing legacy, malformed YAML
 *
 * @story 12.2
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

jest.mock('fs');
jest.mock('os');

const {
  migrateConfig,
  isLegacyMode,
  createBackup,
  extractUserFields,
  extractProjectFields,
  ensureUserConfigDir,
  writeUserConfig,
  writeProjectConfig,
  USER_FIELDS,
  PROJECT_FIELDS,
} = require('../../../.aiox-core/core/config/migrate-config');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FAKE_PROJECT = '/fake/project';
const FAKE_HOME = '/fake/home';

const LEGACY_CONFIG_YAML = `
project:
  type: EXISTING_AIOX
  installedAt: "2025-01-14"
  version: "2.1.0"
user_profile: advanced
default_model: claude-sonnet
default_language: pt-BR
coderabbit_integration: true
educational_mode: false
project_name: my-project
project_type: fullstack
environments:
  development:
    database_url: postgres://localhost/dev
deploy_target: vercel
qa:
  qaLocation: docs/qa
`;

function setupFileSystem(files = {}) {
  fs.existsSync.mockImplementation((filePath) => {
    return Object.keys(files).some((key) => filePath.endsWith(key) || filePath === key);
  });

  fs.readFileSync.mockImplementation((filePath) => {
    for (const [key, content] of Object.entries(files)) {
      if (filePath.endsWith(key) || filePath === key) {
        return content;
      }
    }
    throw new Error(`ENOENT: no such file or directory: ${filePath}`);
  });

  fs.copyFileSync.mockImplementation(() => {});
  fs.writeFileSync.mockImplementation(() => {});
  fs.mkdirSync.mockImplementation(() => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  os.homedir.mockReturnValue(FAKE_HOME);
  fs.existsSync.mockReturnValue(false);
  fs.readFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
  fs.copyFileSync.mockImplementation(() => {});
  fs.writeFileSync.mockImplementation(() => {});
  fs.mkdirSync.mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// Field Extraction Tests
// ---------------------------------------------------------------------------

describe('extractUserFields', () => {
  it('should extract user-level fields from legacy config', () => {
    // Given
    const legacyConfig = {
      user_profile: 'advanced',
      default_model: 'claude-sonnet',
      default_language: 'pt-BR',
      coderabbit_integration: true,
      educational_mode: false,
      project_name: 'should-not-be-here',
    };

    // When
    const userFields = extractUserFields(legacyConfig);

    // Then
    expect(userFields.user_profile).toBe('advanced');
    expect(userFields.default_model).toBe('claude-sonnet');
    expect(userFields.default_language).toBe('pt-BR');
    expect(userFields.coderabbit_integration).toBe(true);
    expect(userFields.educational_mode).toBe(false);
    expect(userFields.project_name).toBeUndefined();
  });

  it('should default user_profile to advanced when not present', () => {
    // Given
    const legacyConfig = { default_model: 'claude-sonnet' };

    // When
    const userFields = extractUserFields(legacyConfig);

    // Then
    expect(userFields.user_profile).toBe('advanced');
  });
});

describe('extractProjectFields', () => {
  it('should extract project-level fields from legacy config', () => {
    // Given
    const legacyConfig = {
      project_name: 'my-project',
      project_type: 'fullstack',
      environments: { development: { database_url: 'postgres://localhost/dev' } },
      deploy_target: 'vercel',
      user_profile: 'should-not-be-here',
    };

    // When
    const projectFields = extractProjectFields(legacyConfig);

    // Then
    expect(projectFields.project_name).toBe('my-project');
    expect(projectFields.project_type).toBe('fullstack');
    expect(projectFields.environments).toBeDefined();
    expect(projectFields.deploy_target).toBe('vercel');
    expect(projectFields.user_profile).toBeUndefined();
  });

  it('should extract project.type from nested project object', () => {
    // Given
    const legacyConfig = {
      project: { type: 'EXISTING_AIOX', version: '2.1.0' },
    };

    // When
    const projectFields = extractProjectFields(legacyConfig);

    // Then
    expect(projectFields.project_type).toBe('EXISTING_AIOX');
  });

  it('should not override explicit project_type with nested project.type', () => {
    // Given
    const legacyConfig = {
      project_type: 'fullstack',
      project: { type: 'EXISTING_AIOX' },
    };

    // When
    const projectFields = extractProjectFields(legacyConfig);

    // Then
    expect(projectFields.project_type).toBe('fullstack');
  });
});

// ---------------------------------------------------------------------------
// Backup Tests (AC6)
// ---------------------------------------------------------------------------

describe('createBackup', () => {
  it('should create backup of legacy config', () => {
    // Given
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('core-config.yaml') && !filePath.includes('backup')) return true;
      return false;
    });

    // When
    const backupPath = createBackup(FAKE_PROJECT);

    // Then
    expect(backupPath).toContain('core-config.backup.yaml');
    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
  });

  it('should skip backup if already exists (idempotent)', () => {
    // Given
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('core-config.yaml')) return true;
      if (filePath.includes('core-config.backup.yaml')) return true;
      return false;
    });

    // When
    const backupPath = createBackup(FAKE_PROJECT);

    // Then
    expect(backupPath).toContain('core-config.backup.yaml');
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('should return null if legacy config does not exist', () => {
    // Given — no files exist

    // When
    const backupPath = createBackup(FAKE_PROJECT);

    // Then
    expect(backupPath).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Full Migration Tests (AC5)
// ---------------------------------------------------------------------------

describe('migrateConfig', () => {
  it('should perform full migration: legacy → L2 + L5', () => {
    // Given
    setupFileSystem({
      'core-config.yaml': LEGACY_CONFIG_YAML,
    });

    // When
    const result = migrateConfig(FAKE_PROJECT);

    // Then
    expect(result.migrated).toBe(true);
    expect(result.backupPath).toContain('core-config.backup.yaml');
    expect(result.userFields.user_profile).toBe('advanced');
    expect(result.userFields.default_model).toBe('claude-sonnet');
    expect(result.projectFields.project_name).toBe('my-project');
    expect(result.projectFields.deploy_target).toBe('vercel');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should return warning when no legacy config exists', () => {
    // Given — no files

    // When
    const result = migrateConfig(FAKE_PROJECT);

    // Then
    expect(result.migrated).toBe(false);
    expect(result.warnings).toContain('No legacy core-config.yaml found. Nothing to migrate.');
  });

  it('should support dry run mode (no files written)', () => {
    // Given
    setupFileSystem({
      'core-config.yaml': LEGACY_CONFIG_YAML,
    });

    // When
    const result = migrateConfig(FAKE_PROJECT, { dryRun: true });

    // Then
    expect(result.migrated).toBe(false);
    expect(result.userFields).toBeDefined();
    expect(result.projectFields).toBeDefined();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('should be idempotent: re-running does not duplicate', () => {
    // Given — legacy exists, and user/project config already exist
    const userConfigPath = path.join(FAKE_HOME, '.aiox', 'user-config.yaml');
    setupFileSystem({
      'core-config.yaml': LEGACY_CONFIG_YAML,
      'core-config.backup.yaml': LEGACY_CONFIG_YAML,
      [userConfigPath]: 'user_profile: bob\ndefault_model: claude-opus',
      'project-config.yaml': 'project_name: existing-project',
    });

    // When
    const result = migrateConfig(FAKE_PROJECT);

    // Then
    expect(result.migrated).toBe(true);
    // Backup should NOT be created again (already exists)
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('should handle malformed YAML gracefully', () => {
    // Given
    setupFileSystem({
      'core-config.yaml': '{ invalid yaml: [',
    });

    // When
    const result = migrateConfig(FAKE_PROJECT);

    // Then
    expect(result.migrated).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Failed to parse');
  });
});

// ---------------------------------------------------------------------------
// ensureUserConfigDir Tests
// ---------------------------------------------------------------------------

describe('ensureUserConfigDir', () => {
  it('should create ~/.aiox/ directory if it does not exist', () => {
    // Given
    fs.existsSync.mockReturnValue(false);

    // When
    ensureUserConfigDir();

    // Then
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('.aiox'),
      expect.objectContaining({ recursive: true }),
    );
  });

  it('should not create directory if it already exists', () => {
    // Given
    fs.existsSync.mockReturnValue(true);

    // When
    ensureUserConfigDir();

    // Then
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Constants Tests
// ---------------------------------------------------------------------------

describe('field constants', () => {
  it('should define USER_FIELDS', () => {
    expect(USER_FIELDS).toContain('user_profile');
    expect(USER_FIELDS).toContain('default_model');
    expect(USER_FIELDS).toContain('educational_mode');
  });

  it('should define PROJECT_FIELDS', () => {
    expect(PROJECT_FIELDS).toContain('project_name');
    expect(PROJECT_FIELDS).toContain('environments');
    expect(PROJECT_FIELDS).toContain('deploy_target');
  });
});
