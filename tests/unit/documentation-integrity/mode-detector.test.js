/**
 * Mode Detector Unit Tests
 *
 * @module tests/unit/documentation-integrity/mode-detector
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  detectInstallationMode,
  collectMarkers,
  isAioxCoreRepository,
  mapLegacyTypeToMode,
  validateModeSelection,
  getModeOptions,
  InstallationMode,
  LegacyProjectType,
} = require('../../../.aiox-core/infrastructure/scripts/documentation-integrity/mode-detector');

describe('Mode Detector', () => {
  let tempDir;

  beforeEach(() => {
    // Create unique temp directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('detectInstallationMode', () => {
    it('should detect GREENFIELD mode for empty directory', () => {
      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.GREENFIELD);
      expect(result.legacyType).toBe(LegacyProjectType.GREENFIELD);
      expect(result.confidence).toBe(100);
      expect(result.markers.isEmpty).toBe(true);
    });

    it('should detect BROWNFIELD mode for directory with package.json', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name":"test"}');

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.BROWNFIELD);
      expect(result.legacyType).toBe(LegacyProjectType.BROWNFIELD);
      expect(result.confidence).toBe(90);
      expect(result.markers.hasPackageJson).toBe(true);
    });

    it('should detect BROWNFIELD mode for directory with .git', () => {
      fs.mkdirSync(path.join(tempDir, '.git'));

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.BROWNFIELD);
      expect(result.markers.hasGit).toBe(true);
    });

    it('should detect BROWNFIELD mode for Python project', () => {
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'flask==2.0.0');

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.BROWNFIELD);
      expect(result.markers.hasPythonProject).toBe(true);
    });

    it('should detect BROWNFIELD mode for Go project', () => {
      fs.writeFileSync(path.join(tempDir, 'go.mod'), 'module test');

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.BROWNFIELD);
      expect(result.markers.hasGoMod).toBe(true);
    });

    it('should detect BROWNFIELD mode for Rust project', () => {
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]\nname = "test"');

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.BROWNFIELD);
      expect(result.markers.hasCargoToml).toBe(true);
    });

    it('should detect FRAMEWORK_DEV mode for aiox-core repository', () => {
      // Create .aiox-core directory
      fs.mkdirSync(path.join(tempDir, '.aiox-core'));

      // Create package.json with aiox-core name
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: '@aiox/core',
          workspaces: ['packages/*'],
        }),
      );

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.FRAMEWORK_DEV);
      expect(result.legacyType).toBe(LegacyProjectType.EXISTING_AIOX);
      expect(result.confidence).toBe(100);
      expect(result.markers.isAioxCoreRepo).toBe(true);
    });

    it('should detect BROWNFIELD mode for user project with existing AIOX', () => {
      // Create .aiox-core directory
      fs.mkdirSync(path.join(tempDir, '.aiox-core'));

      // Create package.json with different name (user project)
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'my-user-project' }),
      );

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.BROWNFIELD);
      expect(result.legacyType).toBe(LegacyProjectType.EXISTING_AIOX);
      expect(result.confidence).toBe(95);
    });

    it('should detect UNKNOWN mode for directory with unrecognized files', () => {
      fs.writeFileSync(path.join(tempDir, 'random.txt'), 'some content');

      const result = detectInstallationMode(tempDir);

      expect(result.mode).toBe(InstallationMode.UNKNOWN);
      expect(result.legacyType).toBe(LegacyProjectType.UNKNOWN);
      expect(result.confidence).toBe(0);
    });

    it('should throw error for invalid targetDir', () => {
      expect(() => detectInstallationMode(null)).toThrow('Invalid targetDir parameter');
      expect(() => detectInstallationMode('')).toThrow('Invalid targetDir parameter');
      expect(() => detectInstallationMode(123)).toThrow('Invalid targetDir parameter');
    });

    it('should throw error for non-existent directory', () => {
      const nonExistent = path.join(tempDir, 'does-not-exist');
      expect(() => detectInstallationMode(nonExistent)).toThrow('Directory does not exist');
    });
  });

  describe('collectMarkers', () => {
    it('should collect all project markers', () => {
      // Create various files
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');
      fs.mkdirSync(path.join(tempDir, '.git'));
      fs.writeFileSync(path.join(tempDir, '.eslintrc.js'), '');
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      const markers = collectMarkers(tempDir);

      expect(markers.hasPackageJson).toBe(true);
      expect(markers.hasGit).toBe(true);
      expect(markers.hasEslintrc).toBe(true);
      expect(markers.hasTsconfig).toBe(true);
      expect(markers.isEmpty).toBe(false);
      expect(markers.fileCount).toBeGreaterThan(0);
    });

    it('should detect GitHub workflows', () => {
      fs.mkdirSync(path.join(tempDir, '.github', 'workflows'), { recursive: true });

      const markers = collectMarkers(tempDir);

      expect(markers.hasGithubWorkflows).toBe(true);
    });

    it('should detect GitLab CI', () => {
      fs.writeFileSync(path.join(tempDir, '.gitlab-ci.yml'), '');

      const markers = collectMarkers(tempDir);

      expect(markers.hasGitlabCi).toBe(true);
    });
  });

  describe('isAioxCoreRepository', () => {
    it('should return true for @aiox/core package', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: '@aiox/core' }),
      );

      expect(isAioxCoreRepository(tempDir)).toBe(true);
    });

    it('should return true for aiox-core package', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'aiox-core' }),
      );

      expect(isAioxCoreRepository(tempDir)).toBe(true);
    });

    it('should return false for generic monorepo with workspaces pattern only', () => {
      // Generic monorepos should NOT be detected as aiox-core
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'something', workspaces: ['packages/*'] }),
      );

      expect(isAioxCoreRepository(tempDir)).toBe(false);
    });

    it('should return true for workspaces pattern with aiox marker', () => {
      // Workspaces + .aiox-core/infrastructure marker = aiox-core repo
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'something', workspaces: ['packages/*'] }),
      );
      fs.mkdirSync(path.join(tempDir, '.aiox-core', 'infrastructure'), { recursive: true });

      expect(isAioxCoreRepository(tempDir)).toBe(true);
    });

    it('should return false for regular package', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'my-app' }),
      );

      expect(isAioxCoreRepository(tempDir)).toBe(false);
    });

    it('should return false when no package.json', () => {
      expect(isAioxCoreRepository(tempDir)).toBe(false);
    });

    it('should return false for invalid JSON', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), 'invalid json');

      expect(isAioxCoreRepository(tempDir)).toBe(false);
    });
  });

  describe('mapLegacyTypeToMode', () => {
    it('should map EXISTING_AIOX to BROWNFIELD by default (safer)', () => {
      // Without context, EXISTING_AIOX defaults to BROWNFIELD (won't skip project setup)
      expect(mapLegacyTypeToMode(LegacyProjectType.EXISTING_AIOX)).toBe(
        InstallationMode.BROWNFIELD,
      );
    });

    it('should map EXISTING_AIOX to FRAMEWORK_DEV with isAioxCoreRepo context', () => {
      expect(mapLegacyTypeToMode(LegacyProjectType.EXISTING_AIOX, { isAioxCoreRepo: true })).toBe(
        InstallationMode.FRAMEWORK_DEV,
      );
    });

    it('should map EXISTING_AIOX to BROWNFIELD with non-aiox-core context', () => {
      expect(mapLegacyTypeToMode(LegacyProjectType.EXISTING_AIOX, { isAioxCoreRepo: false })).toBe(
        InstallationMode.BROWNFIELD,
      );
    });

    it('should map GREENFIELD to GREENFIELD', () => {
      expect(mapLegacyTypeToMode(LegacyProjectType.GREENFIELD)).toBe(InstallationMode.GREENFIELD);
    });

    it('should map BROWNFIELD to BROWNFIELD', () => {
      expect(mapLegacyTypeToMode(LegacyProjectType.BROWNFIELD)).toBe(InstallationMode.BROWNFIELD);
    });

    it('should map UNKNOWN to UNKNOWN', () => {
      expect(mapLegacyTypeToMode(LegacyProjectType.UNKNOWN)).toBe(InstallationMode.UNKNOWN);
    });

    it('should return UNKNOWN for invalid type', () => {
      expect(mapLegacyTypeToMode('INVALID')).toBe(InstallationMode.UNKNOWN);
    });
  });

  describe('validateModeSelection', () => {
    it('should return valid for matching selection', () => {
      const detected = {
        mode: InstallationMode.GREENFIELD,
        markers: { isEmpty: true },
      };

      const result = validateModeSelection(InstallationMode.GREENFIELD, detected);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn when selecting greenfield for non-empty directory', () => {
      const detected = {
        mode: InstallationMode.BROWNFIELD,
        markers: { isEmpty: false },
      };

      const result = validateModeSelection(InstallationMode.GREENFIELD, detected);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('directory is not empty');
    });

    it('should warn when selecting framework-dev for non-aiox-core repo', () => {
      const detected = {
        mode: InstallationMode.BROWNFIELD,
        markers: { isAioxCoreRepo: false },
      };

      const result = validateModeSelection(InstallationMode.FRAMEWORK_DEV, detected);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('aiox-core repository');
    });

    it('should suggest greenfield when selecting brownfield for empty directory', () => {
      const detected = {
        mode: InstallationMode.GREENFIELD,
        markers: { isEmpty: true },
      };

      const result = validateModeSelection(InstallationMode.BROWNFIELD, detected);

      expect(result.warnings).toHaveLength(1);
      expect(result.suggestions).toContain(InstallationMode.GREENFIELD);
    });

    it('should allow any selection for UNKNOWN detection', () => {
      const detected = {
        mode: InstallationMode.UNKNOWN,
        markers: {},
      };

      const result = validateModeSelection(InstallationMode.GREENFIELD, detected);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('getModeOptions', () => {
    it('should return three mode options', () => {
      const options = getModeOptions();

      expect(options).toHaveLength(3);
      expect(options.map((o) => o.value)).toContain(InstallationMode.GREENFIELD);
      expect(options.map((o) => o.value)).toContain(InstallationMode.BROWNFIELD);
      expect(options.map((o) => o.value)).toContain(InstallationMode.FRAMEWORK_DEV);
    });

    it('should mark detected mode as recommended', () => {
      const detected = {
        mode: InstallationMode.BROWNFIELD,
        markers: {},
      };

      const options = getModeOptions(detected);

      // Recommended should be first
      expect(options[0].value).toBe(InstallationMode.BROWNFIELD);
      expect(options[0].hint).toContain('Recommended');
    });

    it('should not mark recommended when mode is UNKNOWN', () => {
      const detected = {
        mode: InstallationMode.UNKNOWN,
        markers: {},
      };

      const options = getModeOptions(detected);

      // No option should have Recommended
      options.forEach((opt) => {
        expect(opt.hint).not.toContain('Recommended');
      });
    });

    it('should include labels and hints for all options', () => {
      const options = getModeOptions();

      options.forEach((opt) => {
        expect(opt.label).toBeDefined();
        expect(opt.hint).toBeDefined();
        expect(opt.value).toBeDefined();
      });
    });
  });

  describe('InstallationMode enum', () => {
    it('should have all required modes', () => {
      expect(InstallationMode.FRAMEWORK_DEV).toBe('framework-dev');
      expect(InstallationMode.GREENFIELD).toBe('greenfield');
      expect(InstallationMode.BROWNFIELD).toBe('brownfield');
      expect(InstallationMode.UNKNOWN).toBe('unknown');
    });
  });

  describe('LegacyProjectType enum', () => {
    it('should have all legacy types', () => {
      expect(LegacyProjectType.EXISTING_AIOX).toBe('EXISTING_AIOX');
      expect(LegacyProjectType.GREENFIELD).toBe('GREENFIELD');
      expect(LegacyProjectType.BROWNFIELD).toBe('BROWNFIELD');
      expect(LegacyProjectType.UNKNOWN).toBe('UNKNOWN');
    });
  });
});
