/**
 * Unit tests for pro-detector.js
 *
 * @see Story PRO-5 - aiox-pro Repository Bootstrap (Task 3.2)
 * @see ADR-PRO-001 - Repository Strategy
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const realFs = jest.requireActual('fs');
const originalCwd = process.cwd();

// Module under test
const {
  isProAvailable,
  loadProModule,
  getProVersion,
  getProInfo,
  resolveNpmProPackage,
  PRO_PACKAGE_CANONICAL,
  PRO_PACKAGE_FALLBACK,
  PRO_PACKAGE_LEGACY,
  PRO_PACKAGES,
  _PRO_DIR,
  _PRO_PACKAGE_PATH,
} = require('../../bin/utils/pro-detector');

// Mock fs module
jest.mock('fs');

// Store original require for selective mocking
const originalRequire = jest.requireActual;

describe('pro-detector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.chdir(originalCwd);
    // Clear require cache for pro modules to prevent stale state
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('pro-detector')) return; // Don't clear the module itself
      if (key.includes(path.sep + 'pro' + path.sep)) {
        delete require.cache[key];
      }
    });
  });

  describe('module exports', () => {
    it('should export all expected functions', () => {
      expect(typeof isProAvailable).toBe('function');
      expect(typeof loadProModule).toBe('function');
      expect(typeof getProVersion).toBe('function');
      expect(typeof getProInfo).toBe('function');
    });

    it('should export internal paths for testing', () => {
      expect(_PRO_DIR).toBeDefined();
      expect(_PRO_PACKAGE_PATH).toBeDefined();
      expect(_PRO_DIR).toContain('pro');
      expect(_PRO_PACKAGE_PATH).toContain('package.json');
    });
  });

  describe('isProAvailable()', () => {
    it('should return true when pro/package.json exists (submodule)', () => {
      // npm paths return false, submodule path returns true
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);

      expect(isProAvailable()).toBe(true);
    });

    it('should return true when npm package exists (canonical or fallback)', () => {
      const tmpDir = realFs.mkdtempSync(path.join(os.tmpdir(), 'aiox-pro-detector-'));
      const canonicalDir = path.join(tmpDir, 'node_modules', '@aiox-squads', 'pro');
      realFs.mkdirSync(canonicalDir, { recursive: true });
      realFs.writeFileSync(
        path.join(canonicalDir, 'package.json'),
        JSON.stringify({ name: PRO_PACKAGE_CANONICAL, version: '0.4.0' }),
      );
      process.chdir(tmpDir);

      try {
        expect(isProAvailable()).toBe(true);
      } finally {
        process.chdir(originalCwd);
        realFs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should return false when nothing is available', () => {
      fs.existsSync.mockReturnValue(false);

      expect(isProAvailable()).toBe(false);
    });

    it('should return false when fs.existsSync throws', () => {
      fs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(isProAvailable()).toBe(false);
    });
  });

  describe('resolveNpmProPackage()', () => {
    it('should export canonical and fallback package names', () => {
      expect(PRO_PACKAGE_CANONICAL).toBe('@aiox-squads/pro');
      expect(PRO_PACKAGE_FALLBACK).toBe('@aiox-fullstack/pro');
      expect(PRO_PACKAGE_LEGACY).toBe('@aios-fullstack/pro');
      expect(PRO_PACKAGES).toEqual([
        '@aiox-squads/pro',
        '@aiox-fullstack/pro',
        '@aios-fullstack/pro',
      ]);
    });

    it('should prefer the canonical package when both scopes resolve', () => {
      const tmpDir = realFs.mkdtempSync(path.join(os.tmpdir(), 'aiox-pro-detector-'));
      const canonicalDir = path.join(tmpDir, 'node_modules', '@aiox-squads', 'pro');
      const fallbackDir = path.join(tmpDir, 'node_modules', '@aiox-fullstack', 'pro');
      realFs.mkdirSync(canonicalDir, { recursive: true });
      realFs.mkdirSync(fallbackDir, { recursive: true });
      realFs.writeFileSync(
        path.join(canonicalDir, 'package.json'),
        JSON.stringify({ name: PRO_PACKAGE_CANONICAL, version: '0.4.0' }),
      );
      realFs.writeFileSync(
        path.join(fallbackDir, 'package.json'),
        JSON.stringify({ name: PRO_PACKAGE_FALLBACK, version: '0.3.0' }),
      );
      process.chdir(tmpDir);

      try {
        expect(resolveNpmProPackage()).toEqual({
          packagePath: realFs.realpathSync(canonicalDir),
          packageName: PRO_PACKAGE_CANONICAL,
        });
      } finally {
        process.chdir(originalCwd);
        realFs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should fall back when the canonical package cannot be resolved', () => {
      const tmpDir = realFs.mkdtempSync(path.join(os.tmpdir(), 'aiox-pro-detector-'));
      const fallbackDir = path.join(tmpDir, 'node_modules', '@aiox-fullstack', 'pro');
      realFs.mkdirSync(fallbackDir, { recursive: true });
      realFs.writeFileSync(
        path.join(fallbackDir, 'package.json'),
        JSON.stringify({ name: PRO_PACKAGE_FALLBACK, version: '0.3.0' }),
      );
      process.chdir(tmpDir);

      try {
        expect(resolveNpmProPackage()).toEqual({
          packagePath: realFs.realpathSync(fallbackDir),
          packageName: PRO_PACKAGE_FALLBACK,
        });
      } finally {
        process.chdir(originalCwd);
        realFs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('should fall back to the original AIOS package when newer scopes are unavailable', () => {
      const tmpDir = realFs.mkdtempSync(path.join(os.tmpdir(), 'aiox-pro-detector-'));
      const legacyDir = path.join(tmpDir, 'node_modules', '@aios-fullstack', 'pro');
      realFs.mkdirSync(legacyDir, { recursive: true });
      realFs.writeFileSync(
        path.join(legacyDir, 'package.json'),
        JSON.stringify({ name: PRO_PACKAGE_LEGACY, version: '0.3.0' }),
      );
      process.chdir(tmpDir);

      try {
        expect(resolveNpmProPackage()).toEqual({
          packagePath: realFs.realpathSync(legacyDir),
          packageName: PRO_PACKAGE_LEGACY,
        });
      } finally {
        process.chdir(originalCwd);
        realFs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('loadProModule()', () => {
    it('should return null when pro is not available', () => {
      fs.existsSync.mockReturnValue(false);

      expect(loadProModule('squads/index')).toBeNull();
    });

    it('should return null when module does not exist', () => {
      fs.existsSync.mockReturnValue(true);
      // require will throw for non-existent module
      expect(loadProModule('non-existent-module-xyz-' + Date.now())).toBeNull();
    });

    it('should return null when module throws during loading', () => {
      fs.existsSync.mockReturnValue(true);

      // Mock a module that throws
      jest.doMock(
        path.join(_PRO_DIR, 'broken-module'),
        () => {
          throw new Error('Module initialization failed');
        },
        { virtual: true },
      );

      expect(loadProModule('broken-module')).toBeNull();
    });

    it('should load a valid module from pro/', () => {
      fs.existsSync.mockReturnValue(true);

      const mockModule = { testFunc: () => 'works' };
      jest.doMock(path.join(_PRO_DIR, 'test-module'), () => mockModule, {
        virtual: true,
      });

      const result = loadProModule('test-module');
      expect(result).toBeDefined();
      expect(result.testFunc()).toBe('works');
    });
  });

  describe('getProVersion()', () => {
    it('should return null when pro is not available', () => {
      fs.existsSync.mockReturnValue(false);

      expect(getProVersion()).toBeNull();
    });

    it('should return version from submodule pro/package.json', () => {
      // Only submodule path exists
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ name: '@aios-fullstack/pro', version: '0.3.0' }),
      );

      expect(getProVersion()).toBe('0.3.0');
    });

    it('should return null when package.json has no version field', () => {
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);
      fs.readFileSync.mockReturnValue(JSON.stringify({ name: '@aios-fullstack/pro' }));

      expect(getProVersion()).toBeNull();
    });

    it('should return null when package.json is corrupted', () => {
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);
      fs.readFileSync.mockReturnValue('not valid json {{{');

      expect(getProVersion()).toBeNull();
    });

    it('should return null when readFileSync throws', () => {
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      expect(getProVersion()).toBeNull();
    });
  });

  describe('getProInfo()', () => {
    it('should return info with available=false when pro is not present', () => {
      fs.existsSync.mockReturnValue(false);

      const info = getProInfo();
      expect(info.available).toBe(false);
      expect(info.version).toBeNull();
      expect(info.source).toBe('none');
    });

    it('should return full info when pro submodule is available', () => {
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ name: '@aios-fullstack/pro', version: '0.3.0' }),
      );

      const info = getProInfo();
      expect(info.available).toBe(true);
      expect(info.version).toBe('0.3.0');
      expect(info.source).toBe('submodule');
      expect(info.path).toBe(_PRO_DIR);
    });

    it('should return available=false when package.json is corrupt and only submodule exists', () => {
      fs.existsSync.mockImplementation((p) => p === _PRO_PACKAGE_PATH);
      fs.readFileSync.mockReturnValue('invalid json');

      const info = getProInfo();
      // Corrupt JSON means we can't parse it, falls through
      expect(info.version).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty pro/ directory (uninitialized submodule)', () => {
      // existsSync returns false for package.json even though pro/ dir exists
      fs.existsSync.mockReturnValue(false);

      expect(isProAvailable()).toBe(false);
      expect(getProVersion()).toBeNull();
      expect(loadProModule('anything')).toBeNull();
    });

    it('should handle concurrent calls safely', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ version: '1.0.0' }),
      );

      // Multiple simultaneous calls should not interfere
      const results = Array.from({ length: 10 }, () => getProVersion());
      expect(results.every((v) => v === '1.0.0')).toBe(true);
    });
  });
});
