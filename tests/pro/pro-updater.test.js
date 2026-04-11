'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

jest.mock('fs');
jest.mock('https');
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

const {
  updatePro,
  fetchLatestFromNpm,
  getCoreVersion,
  detectCorePackageName,
  satisfiesPeer,
} = require('../../.aiox-core/core/pro/pro-updater');

function mockRegistryResponse(payload, statusCode = 200) {
  https.get.mockImplementation((url, options, callback) => {
    const response = new EventEmitter();
    response.statusCode = statusCode;
    response.resume = jest.fn();
    const request = {
      on: jest.fn().mockReturnThis(),
      destroy: jest.fn(),
    };

    process.nextTick(() => {
      callback(response);
      if (statusCode >= 200 && statusCode < 300) {
        response.emit('data', JSON.stringify(payload));
        response.emit('end');
      }
    });

    return request;
  });
}

describe('pro-updater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCoreVersion()', () => {
    it('should prefer .aiox-core/version.json when available', () => {
      const projectRoot = '/tmp/aiox-project';
      const versionJsonPath = path.join(projectRoot, '.aiox-core', 'version.json');

      fs.existsSync.mockImplementation((targetPath) => targetPath === versionJsonPath);
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === versionJsonPath) {
          return JSON.stringify({ version: '5.1.2' });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      expect(getCoreVersion(projectRoot)).toBe('5.1.2');
    });

    it('should read declared aiox-core dependency from the project manifest', () => {
      const projectRoot = '/tmp/aiox-project';
      const packageJsonPath = path.join(projectRoot, 'package.json');

      fs.existsSync.mockImplementation((targetPath) => targetPath === packageJsonPath);
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === packageJsonPath) {
          return JSON.stringify({
            name: 'my-app',
            dependencies: {
              'aiox-core': '^5.4.0',
            },
          });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      expect(getCoreVersion(projectRoot)).toBe('5.4.0');
    });

    it('should read declared scoped aiox-core dependency from the project manifest', () => {
      const projectRoot = '/tmp/aiox-project';
      const packageJsonPath = path.join(projectRoot, 'package.json');

      fs.existsSync.mockImplementation((targetPath) => targetPath === packageJsonPath);
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === packageJsonPath) {
          return JSON.stringify({
            name: 'my-app',
            devDependencies: {
              '@synkra/aiox-core': '^5.5.0',
            },
          });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      expect(getCoreVersion(projectRoot)).toBe('5.5.0');
    });
  });

  describe('detectCorePackageName()', () => {
    it('should detect the scoped core package from project dependencies', () => {
      const projectRoot = '/tmp/aiox-project';
      const packageJsonPath = path.join(projectRoot, 'package.json');

      fs.existsSync.mockImplementation((targetPath) => targetPath === packageJsonPath);
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === packageJsonPath) {
          return JSON.stringify({
            name: 'workspace-app',
            dependencies: {
              '@synkra/aiox-core': '^5.5.0',
            },
          });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      expect(detectCorePackageName(projectRoot)).toBe('@synkra/aiox-core');
    });
  });

  describe('satisfiesPeer()', () => {
    it('should evaluate real semver ranges instead of a numeric minimum', () => {
      expect(satisfiesPeer('5.4.0', '>=5 <7')).toBe(true);
      expect(satisfiesPeer('6.1.0', '^5 || ^6')).toBe(true);
      expect(satisfiesPeer('5.9.1', '5.x')).toBe(true);
      expect(satisfiesPeer('7.0.0', '5.x')).toBe(false);
    });
  });

  describe('fetchLatestFromNpm()', () => {
    it('should return null when the registry responds with a non-2xx status', async () => {
      mockRegistryResponse({ error: 'not found' }, 404);

      await expect(fetchLatestFromNpm('@aiox-fullstack/pro')).resolves.toBeNull();
    });
  });

  describe('updatePro()', () => {
    it('should reject an invalid projectRoot before doing any update work', async () => {
      fs.statSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      await expect(updatePro('/tmp/missing-project', {}))
        .rejects
        .toThrow('updatePro(projectRoot): projectRoot does not exist or is not a directory');

      expect(https.get).not.toHaveBeenCalled();
      expect(execSync).not.toHaveBeenCalled();
    });

    it('should use the detected scoped core package when includeCoreUpdate is requested in dry-run mode', async () => {
      const projectRoot = '/tmp/aiox-project';
      const installedPackageJson = path.join(projectRoot, 'node_modules', '@aiox-fullstack', 'pro', 'package.json');
      const packageJsonPath = path.join(projectRoot, 'package.json');

      fs.statSync.mockReturnValue({ isDirectory: () => true });
      fs.existsSync.mockImplementation((targetPath) => (
        targetPath === installedPackageJson
        || targetPath === packageJsonPath
      ));
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === installedPackageJson) {
          return JSON.stringify({ version: '0.3.0' });
        }
        if (targetPath === packageJsonPath) {
          return JSON.stringify({
            name: 'workspace-app',
            dependencies: {
              '@synkra/aiox-core': '^5.5.0',
            },
          });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      mockRegistryResponse({
        version: '0.4.0',
        peerDependencies: {
          'aiox-core': '>=5.0.0',
        },
      });

      const result = await updatePro(projectRoot, { dryRun: true, includeCoreUpdate: true });

      expect(result.success).toBe(true);
      expect(result.actions).toEqual(expect.arrayContaining([
        expect.objectContaining({
          action: 'core_update',
          status: 'dry_run',
          command: 'npm install @synkra/aiox-core@latest',
        }),
      ]));
    });

    it('should honor scoped aiox-core peer dependencies when checking compatibility', async () => {
      const projectRoot = '/tmp/aiox-project';
      const installedPackageJson = path.join(projectRoot, 'node_modules', '@aiox-fullstack', 'pro', 'package.json');
      const versionJsonPath = path.join(projectRoot, '.aiox-core', 'version.json');

      fs.statSync.mockReturnValue({ isDirectory: () => true });
      fs.existsSync.mockImplementation((targetPath) => (
        targetPath === installedPackageJson
        || targetPath === versionJsonPath
      ));
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === installedPackageJson) {
          return JSON.stringify({ version: '0.3.0' });
        }
        if (targetPath === versionJsonPath) {
          return JSON.stringify({ version: '5.0.4' });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      mockRegistryResponse({
        version: '0.4.0',
        peerDependencies: {
          '@synkra/aiox-core': '>=6.0.0',
        },
      });

      const result = await updatePro(projectRoot, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires aiox-core >=6.0.0');
      expect(result.actions).toEqual(expect.arrayContaining([
        expect.objectContaining({
          action: 'compat',
          status: 'incompatible',
          required: '>=6.0.0',
          installed: '5.0.4',
        }),
      ]));
    });

    it('should fail when the package update succeeds but re-scaffolding fails', async () => {
      const projectRoot = '/tmp/aiox-project';
      const installedPackageJson = path.join(projectRoot, 'node_modules', '@aiox-fullstack', 'pro', 'package.json');
      const versionJsonPath = path.join(projectRoot, '.aiox-core', 'version.json');
      const scaffolderPath = 'aiox-core/installer/pro-scaffolder';

      fs.statSync.mockReturnValue({ isDirectory: () => true });
      fs.existsSync.mockImplementation((targetPath) => (
        targetPath === installedPackageJson
        || targetPath === versionJsonPath
      ));
      fs.readFileSync.mockImplementation((targetPath) => {
        if (targetPath === installedPackageJson) {
          return JSON.stringify({ version: '0.3.0' });
        }
        if (targetPath === versionJsonPath) {
          return JSON.stringify({ version: '5.0.4' });
        }
        throw new Error(`Unexpected read: ${targetPath}`);
      });

      mockRegistryResponse({
        version: '0.4.0',
        peerDependencies: {
          'aiox-core': '>=5.0.0',
        },
      });
      execSync.mockReturnValue(Buffer.from('ok'));

      jest.doMock(scaffolderPath, () => ({
        scaffoldProContent: jest.fn().mockResolvedValue({
          success: false,
          errors: ['sync failed'],
          copiedFiles: [],
          skippedFiles: [],
          warnings: [],
        }),
      }));

      const result = await updatePro(projectRoot, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('re-scaffolding failed');
      expect(result.actions).toEqual(expect.arrayContaining([
        expect.objectContaining({ action: 'update', status: 'done' }),
        expect.objectContaining({ action: 'scaffold', status: 'failed' }),
      ]));

      jest.dontMock(scaffolderPath);
    });
  });
});
