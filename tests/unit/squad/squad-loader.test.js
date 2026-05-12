/**
 * Unit Tests for SquadLoader
 *
 * Test Coverage:
 * - resolve() finds existing squad
 * - resolve() throws SQUAD_NOT_FOUND for missing squad
 * - loadManifest() parses squad.yaml correctly
 * - loadManifest() parses config.yaml with deprecation warning
 * - loadManifest() throws YAML_PARSE_ERROR for malformed YAML
 * - listLocal() returns squads from directory
 * - listLocal() returns empty array when squads dir doesn't exist
 * - Performance metrics within targets
 * - Error handling with proper error codes
 *
 * @see Story SQS-2: Squad Loader Utility
 */

const path = require('path');
const {
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,
} = require('../../../.aiox-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadLoader', () => {
  let loader;
  let consoleWarnSpy;
  let consoleLogSpy;

  beforeEach(() => {
    // Create loader with fixtures as squads path
    loader = new SquadLoader({
      squadsPath: FIXTURES_PATH,
      verbose: false,
    });

    // Spy on console methods
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should export MANIFEST_FILES with correct order', () => {
      expect(MANIFEST_FILES).toEqual(['squad.yaml', 'config.yaml']);
    });

    it('should export DEFAULT_SQUADS_PATH as ./squads', () => {
      expect(DEFAULT_SQUADS_PATH).toBe('./squads');
    });

    it('should export ErrorCodes enum', () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(ErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ErrorCodes.YAML_PARSE_ERROR).toBe('YAML_PARSE_ERROR');
      expect(ErrorCodes.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultLoader = new SquadLoader();
      expect(defaultLoader.squadsPath).toBe(DEFAULT_SQUADS_PATH);
    });

    it('should use custom squads path when specified', () => {
      const customLoader = new SquadLoader({ squadsPath: './custom/path' });
      expect(customLoader.squadsPath).toBe('./custom/path');
    });

    it('should disable verbose mode by default', () => {
      const defaultLoader = new SquadLoader();
      expect(defaultLoader.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      const verboseLoader = new SquadLoader({ verbose: true });
      expect(verboseLoader.verbose).toBe(true);
    });
  });

  describe('resolve()', () => {
    it('should resolve existing squad with squad.yaml (Test 4.1)', async () => {
      const result = await loader.resolve('valid-squad');

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('manifestPath');
      expect(result.path).toContain('valid-squad');
      expect(result.manifestPath).toContain('squad.yaml');
    });

    it('should resolve existing squad with config.yaml', async () => {
      const result = await loader.resolve('legacy-squad');

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('manifestPath');
      expect(result.path).toContain('legacy-squad');
      expect(result.manifestPath).toContain('config.yaml');
    });

    it('should throw SQUAD_NOT_FOUND for non-existent squad (Test 4.2)', async () => {
      await expect(loader.resolve('non-existent-squad')).rejects.toThrow(
        SquadLoaderError,
      );

      try {
        await loader.resolve('non-existent-squad');
      } catch (error) {
        expect(error).toBeInstanceOf(SquadLoaderError);
        expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
        expect(error.message).toContain('non-existent-squad');
        expect(error.suggestion).toContain('@squad-creator *create-squad');
      }
    });

    it('should throw MANIFEST_NOT_FOUND for squad without manifest', async () => {
      await expect(loader.resolve('invalid-squad')).rejects.toThrow(
        SquadLoaderError,
      );

      try {
        await loader.resolve('invalid-squad');
      } catch (error) {
        expect(error).toBeInstanceOf(SquadLoaderError);
        expect(error.code).toBe(ErrorCodes.MANIFEST_NOT_FOUND);
        expect(error.message).toContain('No manifest found');
        expect(error.suggestion).toContain('squad.yaml');
      }
    });

    it('should complete within 100ms (Test 4.7)', async () => {
      const start = Date.now();
      await loader.resolve('valid-squad');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('loadManifest()', () => {
    it('should parse squad.yaml correctly (Test 4.3)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const manifest = await loader.loadManifest(squadPath);

      expect(manifest).toBeDefined();
      expect(manifest.name).toBe('valid-squad');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.agents).toContain('test-agent');
    });

    it('should parse config.yaml with deprecation warning (Test 4.4)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const manifest = await loader.loadManifest(squadPath);

      expect(manifest).toBeDefined();
      expect(manifest.name).toBe('legacy-squad');
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('DEPRECATED');
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('config.yaml');
    });

    it('should throw MANIFEST_NOT_FOUND for directory without manifest', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');

      await expect(loader.loadManifest(squadPath)).rejects.toThrow(
        SquadLoaderError,
      );

      try {
        await loader.loadManifest(squadPath);
      } catch (error) {
        expect(error.code).toBe(ErrorCodes.MANIFEST_NOT_FOUND);
      }
    });

    it('should throw YAML_PARSE_ERROR for malformed YAML', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'malformed-squad');

      await expect(loader.loadManifest(squadPath)).rejects.toThrow(
        SquadLoaderError,
      );

      try {
        await loader.loadManifest(squadPath);
      } catch (error) {
        expect(error.code).toBe(ErrorCodes.YAML_PARSE_ERROR);
        expect(error.suggestion).toContain('YAML linter');
      }
    });

    it('should complete within 150ms', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const start = Date.now();
      await loader.loadManifest(squadPath);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(150);
    });
  });

  describe('listLocal()', () => {
    it('should return array of squad objects (Test 4.5)', async () => {
      const squads = await loader.listLocal();

      expect(Array.isArray(squads)).toBe(true);
      expect(squads.length).toBeGreaterThanOrEqual(2); // valid-squad and legacy-squad

      // Check structure
      const squad = squads.find((s) => s.name === 'valid-squad');
      expect(squad).toBeDefined();
      expect(squad).toHaveProperty('name');
      expect(squad).toHaveProperty('path');
      expect(squad).toHaveProperty('manifestPath');
    });

    it('should return empty array when squads directory does not exist (Test 4.6)', async () => {
      const nonExistentLoader = new SquadLoader({
        squadsPath: './non-existent-squads-dir',
      });

      const squads = await nonExistentLoader.listLocal();

      expect(Array.isArray(squads)).toBe(true);
      expect(squads.length).toBe(0);
    });

    it('should only return directories with valid manifests', async () => {
      const squads = await loader.listLocal();

      // invalid-squad should not be in the list (no manifest)
      const invalidSquad = squads.find((s) => s.name === 'invalid-squad');
      expect(invalidSquad).toBeUndefined();
    });

    it('should complete within 500ms with multiple squads (Test 4.8)', async () => {
      const start = Date.now();
      await loader.listLocal();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('SquadLoaderError', () => {
    it('should have correct name property', () => {
      const error = new SquadLoaderError(
        ErrorCodes.SQUAD_NOT_FOUND,
        'Test message',
        'Test suggestion',
        '/test/path',
      );

      expect(error.name).toBe('SquadLoaderError');
    });

    it('should extend Error', () => {
      const error = new SquadLoaderError(
        ErrorCodes.SQUAD_NOT_FOUND,
        'Test message',
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SquadLoaderError);
    });

    it('should have all required properties', () => {
      const error = new SquadLoaderError(
        ErrorCodes.SQUAD_NOT_FOUND,
        'Test message',
        'Test suggestion',
        '/test/path',
      );

      expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
      expect(error.filePath).toBe('/test/path');
    });

    it('should format toString() correctly', () => {
      const error = new SquadLoaderError(
        ErrorCodes.SQUAD_NOT_FOUND,
        'Squad not found',
        'Create the squad',
      );

      const str = error.toString();
      expect(str).toContain('[SQUAD_NOT_FOUND]');
      expect(str).toContain('Squad not found');
      expect(str).toContain('Suggestion: Create the squad');
    });

    describe('Static factory methods', () => {
      it('squadNotFound() creates correct error', () => {
        const error = SquadLoaderError.squadNotFound('test-squad', './squads');

        expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
        expect(error.message).toContain('test-squad');
        expect(error.suggestion).toContain('*create-squad test-squad');
      });

      it('manifestNotFound() creates correct error', () => {
        const error = SquadLoaderError.manifestNotFound('./squads/test');

        expect(error.code).toBe(ErrorCodes.MANIFEST_NOT_FOUND);
        expect(error.message).toContain('No manifest found');
        expect(error.suggestion).toContain('squad.yaml');
      });

      it('yamlParseError() creates correct error', () => {
        const originalError = new Error('bad indentation');
        const error = SquadLoaderError.yamlParseError('./test.yaml', originalError);

        expect(error.code).toBe(ErrorCodes.YAML_PARSE_ERROR);
        expect(error.message).toContain('bad indentation');
        expect(error.suggestion).toContain('YAML linter');
      });

      it('permissionDenied() creates correct error', () => {
        const originalError = new Error('EACCES');
        const error = SquadLoaderError.permissionDenied('./test', originalError);

        expect(error.code).toBe(ErrorCodes.PERMISSION_DENIED);
        expect(error.message).toContain('Permission denied');
        expect(error.suggestion).toContain('chmod 644');
      });
    });
  });

  describe('Verbose mode', () => {
    it('should log when verbose is enabled', async () => {
      const verboseLoader = new SquadLoader({
        squadsPath: FIXTURES_PATH,
        verbose: true,
      });

      await verboseLoader.resolve('valid-squad');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some((call) =>
        call[0].includes('[SquadLoader]'),
      )).toBe(true);
    });

    it('should not log when verbose is disabled', async () => {
      await loader.resolve('valid-squad');

      // Should not have SquadLoader logs (only possible warn from deprecation)
      const squadLoaderLogs = consoleLogSpy.mock.calls.filter((call) =>
        call[0].includes('[SquadLoader]'),
      );
      expect(squadLoaderLogs.length).toBe(0);
    });
  });

  describe('Cross-platform path handling', () => {
    it('should use path.join for all path operations', async () => {
      // This test ensures we don't have hardcoded slashes
      const result = await loader.resolve('valid-squad');

      // Path should be normalized by path.join
      expect(result.path).toBe(path.join(FIXTURES_PATH, 'valid-squad'));
      expect(result.manifestPath).toBe(
        path.join(FIXTURES_PATH, 'valid-squad', 'squad.yaml'),
      );
    });
  });
});
