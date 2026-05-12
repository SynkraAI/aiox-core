/**
 * Tests for config-resolver.js
 * Story PRO-4 — Config Hierarchy
 * Story 12.1 — L5 User layer, toggle-profile, user config write
 *
 * Covers: unit tests (Task 5.1), integration tests (Task 5.2), performance (Task 5.4),
 *         L5 User layer (Story 12.1 Task 6)
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const yaml = require('js-yaml');
const {
  resolveConfig,
  isLegacyMode,
  loadLayeredConfig,
  loadLegacyConfig,
  getConfigAtLevel,
  setUserConfigValue,
  toggleUserProfile,
  ensureUserConfigDir,
  CONFIG_FILES,
  LEVELS,
  VALID_USER_PROFILES,
} = require('../../.aiox-core/core/config/config-resolver');
const { globalConfigCache } = require('../../.aiox-core/core/config/config-cache');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/**
 * Create a temporary project directory with specific config files.
 */
function createTempProject(files = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-config-test-'));
  const aioxCoreDir = path.join(tmpDir, '.aiox-core');
  fs.mkdirSync(aioxCoreDir, { recursive: true });

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    if (typeof content === 'string') {
      fs.writeFileSync(fullPath, content, 'utf8');
    } else {
      // Copy from fixtures
      const fixturePath = path.join(FIXTURES_DIR, content.fixture);
      fs.copyFileSync(fixturePath, fullPath);
    }
  }

  return tmpDir;
}

function cleanupTempDir(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('config-resolver', () => {
  beforeEach(() => {
    globalConfigCache.clear();
  });

  // ------------------------------------------------------------------
  // Unit Tests
  // ------------------------------------------------------------------

  describe('constants', () => {
    test('CONFIG_FILES has all expected keys', () => {
      expect(CONFIG_FILES).toHaveProperty('framework');
      expect(CONFIG_FILES).toHaveProperty('project');
      expect(CONFIG_FILES).toHaveProperty('pro');
      expect(CONFIG_FILES).toHaveProperty('local');
      expect(CONFIG_FILES).toHaveProperty('legacy');
      expect(CONFIG_FILES).toHaveProperty('user');
    });

    test('CONFIG_FILES.user points to ~/.aiox/user-config.yaml', () => {
      const expected = path.join(os.homedir(), '.aiox', 'user-config.yaml');
      expect(CONFIG_FILES.user).toBe(expected);
    });

    test('LEVELS has all expected keys', () => {
      expect(LEVELS.framework).toBe('L1');
      expect(LEVELS.project).toBe('L2');
      expect(LEVELS.pro).toBe('Pro');
      expect(LEVELS.app).toBe('L3');
      expect(LEVELS.local).toBe('L4');
      expect(LEVELS.user).toBe('L5');
      expect(LEVELS.legacy).toBe('Legacy');
    });

    test('VALID_USER_PROFILES contains bob and advanced', () => {
      expect(VALID_USER_PROFILES).toContain('bob');
      expect(VALID_USER_PROFILES).toContain('advanced');
      expect(VALID_USER_PROFILES).toHaveLength(2);
    });
  });

  describe('isLegacyMode', () => {
    test('returns true when core-config.yaml exists but framework-config.yaml does not', () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': 'project:\n  name: legacy\n',
      });

      try {
        expect(isLegacyMode(tmpDir)).toBe(true);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns false when framework-config.yaml exists', () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': 'project:\n  name: legacy\n',
        '.aiox-core/framework-config.yaml': 'metadata:\n  version: "1.0"\n',
      });

      try {
        expect(isLegacyMode(tmpDir)).toBe(false);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns false when neither file exists', () => {
      const tmpDir = createTempProject({});

      try {
        expect(isLegacyMode(tmpDir)).toBe(false);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  describe('getConfigAtLevel', () => {
    test('loads framework config at L1', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        const config = getConfigAtLevel(tmpDir, 'L1');
        expect(config).toBeTruthy();
        expect(config.metadata.framework_name).toBe('AIOX-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('loads project config at L2', () => {
      const tmpDir = createTempProject({
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const config = getConfigAtLevel(tmpDir, 'L2');
        expect(config.project.name).toBe('test-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns null when file does not exist', () => {
      const tmpDir = createTempProject({});

      try {
        const config = getConfigAtLevel(tmpDir, 'L1');
        expect(config).toBeNull();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns null for app level without appDir', () => {
      const tmpDir = createTempProject({});

      try {
        expect(getConfigAtLevel(tmpDir, 'L3')).toBeNull();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('throws on unknown level', () => {
      expect(() => getConfigAtLevel('/tmp', 'unknown')).toThrow('Unknown config level');
    });

    test('supports string aliases (1, 2, L1, L2, etc.)', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        expect(getConfigAtLevel(tmpDir, '1')).toBeTruthy();
        expect(getConfigAtLevel(tmpDir, 'framework')).toBeTruthy();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // ------------------------------------------------------------------
  // Integration Tests
  // ------------------------------------------------------------------

  describe('loadLegacyConfig', () => {
    test('loads monolithic core-config.yaml', () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });

      try {
        const result = loadLegacyConfig(tmpDir);
        expect(result.config.project.name).toBe('legacy-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('includes deprecation warning', () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });
      const origEnv = process.env.AIOX_SUPPRESS_DEPRECATION;

      try {
        delete process.env.AIOX_SUPPRESS_DEPRECATION;

        const result = loadLegacyConfig(tmpDir);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('DEPRECATION');
      } finally {
        if (origEnv === undefined) {
          delete process.env.AIOX_SUPPRESS_DEPRECATION;
        } else {
          process.env.AIOX_SUPPRESS_DEPRECATION = origEnv;
        }
        cleanupTempDir(tmpDir);
      }
    });

    test('suppresses deprecation when AIOX_SUPPRESS_DEPRECATION=true', () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });
      const origEnv = process.env.AIOX_SUPPRESS_DEPRECATION;

      try {
        process.env.AIOX_SUPPRESS_DEPRECATION = 'true';

        const result = loadLegacyConfig(tmpDir);
        expect(result.warnings).toHaveLength(0);
      } finally {
        if (origEnv === undefined) {
          delete process.env.AIOX_SUPPRESS_DEPRECATION;
        } else {
          process.env.AIOX_SUPPRESS_DEPRECATION = origEnv;
        }
        cleanupTempDir(tmpDir);
      }
    });

    test('throws when legacy file is missing', () => {
      const tmpDir = createTempProject({});

      try {
        expect(() => loadLegacyConfig(tmpDir)).toThrow('Legacy config file not found');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  describe('loadLayeredConfig — 4-level resolution', () => {
    test('merges L1 and L2 correctly', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // L1 values present
        expect(result.config.metadata.framework_name).toBe('AIOX-FullStack');
        // L2 overrides L1
        expect(result.config.performance_defaults.max_concurrent_operations).toBe(8);
        // L2 additions
        expect(result.config.project.name).toBe('test-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('merges L1 + L2 + L4 correctly', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
        '.aiox-core/local-config.yaml': { fixture: 'local-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // L4 overrides L2 scalar
        expect(result.config.performance_defaults.max_concurrent_operations).toBe(16);
        // L4 additions
        expect(result.config.ide.selected).toEqual(['vscode', 'claude-code']);
        // L1 values preserved
        expect(result.config.metadata.framework_name).toBe('AIOX-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('includes Pro extension when present', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
        'pro/pro-config.yaml': { fixture: 'pro-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // Pro overrides L2 squad settings
        expect(result.config.squads.max_squads).toBe(10);
        expect(result.config.squads.premium_templates).toBe(true);
        // Pro addition
        expect(result.config.pro_features.advanced_analytics).toBe(true);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('silently skips missing Pro extension', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // No error, and pro_features not present
        expect(result.config.pro_features).toBeUndefined();
        expect(result.config.squads.max_squads).toBe(3);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('debug mode tracks sources', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir, { debug: true });
        expect(result.sources).toBeTruthy();
        // Framework values tracked as L1
        expect(result.sources['metadata']).toEqual(
          expect.objectContaining({ level: 'L1' }),
        );
        // Project values tracked as L2
        expect(result.sources['project']).toEqual(
          expect.objectContaining({ level: 'L2' }),
        );
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('lints L1 and L2 for env patterns', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': 'url: "${API_URL}"\n',
        '.aiox-core/project-config.yaml': 'name: "clean"\n',
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        const lintWarnings = result.warnings.filter(w => w.startsWith('[LINT]'));
        expect(lintWarnings.length).toBeGreaterThan(0);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  describe('resolveConfig — main entry point', () => {
    test('auto-detects legacy mode', () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });

      try {
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.legacy).toBe(true);
        expect(result.config.project.name).toBe('legacy-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('auto-detects layered mode', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.legacy).toBe(false);
        expect(result.config.metadata.framework_name).toBe('AIOX-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('interpolates env vars after merge', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': 'metadata:\n  name: "test"\n',
        '.aiox-core/local-config.yaml': 'api_url: "${TEST_API_URL:-http://localhost}"\n',
      });
      const origTestApiUrl = process.env.TEST_API_URL;

      try {
        delete process.env.TEST_API_URL;
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.config.api_url).toBe('http://localhost');
      } finally {
        if (origTestApiUrl === undefined) {
          delete process.env.TEST_API_URL;
        } else {
          process.env.TEST_API_URL = origTestApiUrl;
        }
        cleanupTempDir(tmpDir);
      }
    });

    test('caches resolved config', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        const result1 = resolveConfig(tmpDir);
        const result2 = resolveConfig(tmpDir);
        // Same reference from cache
        expect(result1).toBe(result2);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('skipCache bypasses cache', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        const result1 = resolveConfig(tmpDir);
        const result2 = resolveConfig(tmpDir, { skipCache: true });
        // Different references
        expect(result1).not.toBe(result2);
        // But same content
        expect(result1.config).toEqual(result2.config);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // ------------------------------------------------------------------
  // Performance Tests (Task 5.4)
  // ------------------------------------------------------------------

  describe('performance benchmarks', () => {
    const isCI = !!process.env.CI;
    const COLD_START_LIMIT = isCI ? 300 : 100;
    const CACHED_READ_LIMIT = isCI ? 50 : 5;

    test(`cold start resolution < ${COLD_START_LIMIT}ms`, () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
        '.aiox-core/local-config.yaml': { fixture: 'local-config.yaml' },
      });

      try {
        globalConfigCache.clear();

        const start = process.hrtime.bigint();
        resolveConfig(tmpDir, { skipCache: true });
        const end = process.hrtime.bigint();

        const durationMs = Number(end - start) / 1_000_000;
        expect(durationMs).toBeLessThan(COLD_START_LIMIT);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test(`cached read < ${CACHED_READ_LIMIT}ms`, () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
        '.aiox-core/local-config.yaml': { fixture: 'local-config.yaml' },
      });

      try {
        // Warm up cache
        resolveConfig(tmpDir);

        const start = process.hrtime.bigint();
        resolveConfig(tmpDir);
        const end = process.hrtime.bigint();

        const durationMs = Number(end - start) / 1_000_000;
        expect(durationMs).toBeLessThan(CACHED_READ_LIMIT);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // ------------------------------------------------------------------
  // Story 12.1 — L5 User layer tests
  // ------------------------------------------------------------------

  describe('L5 User layer', () => {
    let originalUserConfigPath;
    let tempUserDir;

    beforeEach(() => {
      // Save original CONFIG_FILES.user and redirect to temp directory
      originalUserConfigPath = CONFIG_FILES.user;
      tempUserDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-user-config-test-'));
      CONFIG_FILES.user = path.join(tempUserDir, 'user-config.yaml');
      globalConfigCache.clear();
    });

    afterEach(() => {
      // Restore original CONFIG_FILES.user
      CONFIG_FILES.user = originalUserConfigPath;
      fs.rmSync(tempUserDir, { recursive: true, force: true });
      globalConfigCache.clear();
    });

    test('loadLayeredConfig merges L5 user config after L4', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      // Create user config
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\ncustom_setting: 42\n', 'utf8');

      try {
        const result = loadLayeredConfig(tmpDir);
        expect(result.config.user_profile).toBe('bob');
        expect(result.config.custom_setting).toBe(42);
        // L2 values still present
        expect(result.config.project.name).toBe('test-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('L5 overrides L4 values', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/local-config.yaml': 'user_profile: "advanced"\n',
      });

      // L5 overrides L4
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      try {
        const result = loadLayeredConfig(tmpDir);
        expect(result.config.user_profile).toBe('bob');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('graceful when user config file does not exist', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        // CONFIG_FILES.user points to non-existent file — should not throw
        const result = loadLayeredConfig(tmpDir);
        expect(result.config).toBeTruthy();
        expect(result.config.user_profile).toBeUndefined();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('graceful when user config file is malformed YAML', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      // Write invalid YAML
      fs.writeFileSync(CONFIG_FILES.user, '  invalid:\n  yaml: [}\n', 'utf8');

      try {
        // Should not throw — loadYamlAbsolute catches parse errors
        const result = loadLayeredConfig(tmpDir);
        expect(result.config).toBeTruthy();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('debug mode tracks L5 sources', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      try {
        const result = loadLayeredConfig(tmpDir, { debug: true });
        expect(result.sources).toBeTruthy();
        expect(result.sources['user_profile']).toEqual(
          expect.objectContaining({ level: 'L5' }),
        );
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('resolveConfig includes L5 in final config', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      try {
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.config.user_profile).toBe('bob');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('getConfigAtLevel returns L5 user config', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "advanced"\ndefault_language: "pt-BR"\n', 'utf8');

      const config = getConfigAtLevel('/tmp', 'L5');
      expect(config).toBeTruthy();
      expect(config.user_profile).toBe('advanced');
      expect(config.default_language).toBe('pt-BR');
    });

    test('getConfigAtLevel returns null when L5 file missing', () => {
      // CONFIG_FILES.user points to non-existent file
      const config = getConfigAtLevel('/tmp', 'user');
      expect(config).toBeNull();
    });

    test('getConfigAtLevel supports aliases 5 and L5', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      expect(getConfigAtLevel('/tmp', '5')).toBeTruthy();
      expect(getConfigAtLevel('/tmp', 'L5')).toBeTruthy();
      expect(getConfigAtLevel('/tmp', 'user')).toBeTruthy();
    });
  });

  // ------------------------------------------------------------------
  // Story 12.1 — setUserConfigValue tests
  // ------------------------------------------------------------------

  describe('setUserConfigValue', () => {
    let originalUserConfigPath;
    let tempUserDir;

    beforeEach(() => {
      originalUserConfigPath = CONFIG_FILES.user;
      tempUserDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-user-write-test-'));
      CONFIG_FILES.user = path.join(tempUserDir, 'user-config.yaml');
      globalConfigCache.clear();
    });

    afterEach(() => {
      CONFIG_FILES.user = originalUserConfigPath;
      fs.rmSync(tempUserDir, { recursive: true, force: true });
      globalConfigCache.clear();
    });

    test('creates user config file when it does not exist', () => {
      // Delete the file if it exists (temp dir is clean)
      expect(fs.existsSync(CONFIG_FILES.user)).toBe(false);

      setUserConfigValue('user_profile', 'bob');

      expect(fs.existsSync(CONFIG_FILES.user)).toBe(true);
      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      const config = yaml.load(content);
      expect(config.user_profile).toBe('bob');
    });

    test('preserves existing values when setting new key', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'default_language: "pt-BR"\n', 'utf8');

      setUserConfigValue('user_profile', 'advanced');

      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      const config = yaml.load(content);
      expect(config.user_profile).toBe('advanced');
      expect(config.default_language).toBe('pt-BR');
    });

    test('overwrites existing key value', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      setUserConfigValue('user_profile', 'advanced');

      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      const config = yaml.load(content);
      expect(config.user_profile).toBe('advanced');
    });

    test('invalidates config cache after write', () => {
      globalConfigCache.set('test-key', { data: 'cached' });
      expect(globalConfigCache.size).toBeGreaterThan(0);

      setUserConfigValue('user_profile', 'bob');

      expect(globalConfigCache.size).toBe(0);
    });

    test('returns updated config', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'existing: true\n', 'utf8');

      const result = setUserConfigValue('user_profile', 'bob');
      expect(result.user_profile).toBe('bob');
      expect(result.existing).toBe(true);
    });
  });

  // ------------------------------------------------------------------
  // Story 12.1 — toggleUserProfile tests
  // ------------------------------------------------------------------

  describe('toggleUserProfile', () => {
    let originalUserConfigPath;
    let tempUserDir;

    beforeEach(() => {
      originalUserConfigPath = CONFIG_FILES.user;
      tempUserDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-toggle-test-'));
      CONFIG_FILES.user = path.join(tempUserDir, 'user-config.yaml');
      globalConfigCache.clear();
    });

    afterEach(() => {
      CONFIG_FILES.user = originalUserConfigPath;
      fs.rmSync(tempUserDir, { recursive: true, force: true });
      globalConfigCache.clear();
    });

    test('toggles from advanced to bob', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "advanced"\n', 'utf8');

      const result = toggleUserProfile();
      expect(result.previous).toBe('advanced');
      expect(result.current).toBe('bob');

      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      const config = yaml.load(content);
      expect(config.user_profile).toBe('bob');
    });

    test('toggles from bob to advanced', () => {
      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      const result = toggleUserProfile();
      expect(result.previous).toBe('bob');
      expect(result.current).toBe('advanced');
    });

    test('defaults to advanced and toggles to bob when no config exists', () => {
      const result = toggleUserProfile();
      expect(result.previous).toBe('advanced');
      expect(result.current).toBe('bob');
    });

    test('invalidates cache after toggle', () => {
      globalConfigCache.set('test-key', { data: 'cached' });

      toggleUserProfile();

      expect(globalConfigCache.size).toBe(0);
    });

    test('persists toggle result to file', () => {
      toggleUserProfile(); // advanced → bob

      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      const config = yaml.load(content);
      expect(config.user_profile).toBe('bob');

      toggleUserProfile(); // bob → advanced

      const content2 = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      const config2 = yaml.load(content2);
      expect(config2.user_profile).toBe('advanced');
    });
  });

  // ------------------------------------------------------------------
  // Story 12.1 — Integration: resolveConfig returns L5 user_profile
  // ------------------------------------------------------------------

  describe('integration — L5 with full hierarchy', () => {
    let originalUserConfigPath;
    let tempUserDir;

    beforeEach(() => {
      originalUserConfigPath = CONFIG_FILES.user;
      tempUserDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-l5-integration-test-'));
      CONFIG_FILES.user = path.join(tempUserDir, 'user-config.yaml');
      globalConfigCache.clear();
    });

    afterEach(() => {
      CONFIG_FILES.user = originalUserConfigPath;
      fs.rmSync(tempUserDir, { recursive: true, force: true });
      globalConfigCache.clear();
    });

    test('resolveConfig returns user_profile from L5 overriding lower levels', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': 'user_profile: "advanced"\nproject:\n  name: test\n',
      });

      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "bob"\n', 'utf8');

      try {
        const result = resolveConfig(tmpDir, { skipCache: true });
        // L5 bob overrides L2 advanced
        expect(result.config.user_profile).toBe('bob');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('toggle reflects in next resolveConfig call', () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      fs.writeFileSync(CONFIG_FILES.user, 'user_profile: "advanced"\n', 'utf8');

      try {
        let result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.config.user_profile).toBe('advanced');

        toggleUserProfile(); // advanced → bob

        result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.config.user_profile).toBe('bob');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });
});
