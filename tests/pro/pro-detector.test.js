/**
 * Unit tests for pro-detector.js
 *
 * @see Story PRO-5 - aiox-pro Repository Bootstrap (Task 3.2)
 * @see ADR-PRO-001 - Repository Strategy
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Module under test
const {
  isProAvailable,
  loadProModule,
  getProVersion,
  getProInfo,
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
    it('should return true when pro/package.json exists', () => {
      fs.existsSync.mockReturnValue(true);

      expect(isProAvailable()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(_PRO_PACKAGE_PATH);
    });

    it('should return false when pro/package.json does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(isProAvailable()).toBe(false);
    });

    it('should return false when fs.existsSync throws', () => {
      fs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(isProAvailable()).toBe(false);
    });

    it('should check the correct path', () => {
      fs.existsSync.mockReturnValue(false);
      isProAvailable();

      const calledPath = fs.existsSync.mock.calls[0][0];
      expect(calledPath).toMatch(/pro[/\\]package\.json$/);
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

    it('should return version from pro/package.json', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ name: '@aiox-fullstack/pro', version: '0.1.0' }),
      );

      expect(getProVersion()).toBe('0.1.0');
      expect(fs.readFileSync).toHaveBeenCalledWith(_PRO_PACKAGE_PATH, 'utf8');
    });

    it('should return null when package.json has no version field', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ name: '@aiox-fullstack/pro' }));

      expect(getProVersion()).toBeNull();
    });

    it('should return null when package.json is corrupted', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('not valid json {{{');

      expect(getProVersion()).toBeNull();
    });

    it('should return null when readFileSync throws', () => {
      fs.existsSync.mockReturnValue(true);
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
      expect(info).toEqual({
        available: false,
        version: null,
        path: _PRO_DIR,
      });
    });

    it('should return full info when pro is available', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ name: '@aiox-fullstack/pro', version: '0.1.0' }),
      );

      const info = getProInfo();
      expect(info).toEqual({
        available: true,
        version: '0.1.0',
        path: _PRO_DIR,
      });
    });

    it('should return available=true but version=null when package.json is corrupt', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const info = getProInfo();
      expect(info.available).toBe(true);
      expect(info.version).toBeNull();
      expect(info.path).toBe(_PRO_DIR);
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
