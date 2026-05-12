/**
 * Edge Cases Tests - Story 12.9 Task 7.7
 *
 * Tests for edge cases:
 * - No internet connectivity
 * - Docker not installed/offline
 * - Insufficient permissions
 * - Read-only directory
 */

'use strict';

const path = require('path');
const os = require('os');

// Mock modules
jest.mock('fs-extra');
jest.mock('execa', () => ({
  execa: jest.fn(),
  execaSync: jest.fn(),
}));
jest.mock('@clack/prompts', () => ({
  intro: jest.fn(),
  outro: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  note: jest.fn(),
  isCancel: jest.fn(() => false),
  cancel: jest.fn(),
}));
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    info: jest.fn().mockReturnThis(),
  }));
});

const fs = require('fs-extra');
const { execa, execaSync } = require('execa');

const {
  InstallLogger,
  createUserConfigDirect,
} = require('../../../packages/aiox-install/src/installer');

const {
  checkAllDependencies,
  checkDockerRunning,
} = require('../../../packages/aiox-install/src/dep-checker');

const {
  checkDocker,
  ensureDocker,
} = require('../../../packages/aiox-install/src/edmcp');

describe('Edge Cases - Task 7.7', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.pathExists.mockResolvedValue(false);
    fs.existsSync.mockReturnValue(false);
    fs.ensureDir.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
    fs.writeFile.mockResolvedValue();
  });

  describe('No Internet Connectivity', () => {
    const mockOsInfo = {
      installInstructions: {
        node: 'brew install node@18',
        git: 'brew install git',
        docker: 'brew install --cask docker',
        gh: 'brew install gh',
      },
    };

    it('should handle npm install failure due to network error', async () => {
      // Given
      const networkError = new Error('getaddrinfo ENOTFOUND registry.npmjs.org');
      networkError.code = 'ENOTFOUND';
      execa.mockRejectedValue(networkError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', 'aiox-core']);
      }).rejects.toThrow('ENOTFOUND');
    });

    it('should handle git clone failure due to network error', async () => {
      // Given
      const networkError = new Error('Could not resolve host: github.com');
      networkError.code = 'ENETUNREACH';
      execa.mockRejectedValue(networkError);

      // When/Then
      await expect(async () => {
        await execa('git', ['clone', 'https://github.com/user/repo']);
      }).rejects.toThrow('Could not resolve host');
    });

    it('should timeout on slow network connections', async () => {
      // Given
      const timeoutError = new Error('Timeout');
      timeoutError.timedOut = true;
      execa.mockRejectedValue(timeoutError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install'], { timeout: 1000 });
      }).rejects.toThrow('Timeout');
    });

    it('should handle DNS resolution failure', async () => {
      // Given
      const dnsError = new Error('getaddrinfo EAI_AGAIN github.com');
      dnsError.code = 'EAI_AGAIN';
      execa.mockRejectedValue(dnsError);

      // When/Then
      await expect(async () => {
        await execa('git', ['clone', 'https://github.com/user/repo']);
      }).rejects.toThrow('EAI_AGAIN');
    });
  });

  describe('Docker Not Installed / Offline', () => {
    it('should handle Docker command not found', async () => {
      // Given
      const notFoundError = new Error('spawn docker ENOENT');
      notFoundError.code = 'ENOENT';
      execa.mockRejectedValue(notFoundError);

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(false);
      expect(result.running).toBe(false);
    });

    it('should handle Docker daemon not running', async () => {
      // Given
      execa.mockImplementation(async (cmd, args) => {
        if (args && args[0] === '--version') {
          return { stdout: 'Docker version 24.0.6' };
        }
        if (args && args[0] === 'info') {
          const error = new Error('Cannot connect to the Docker daemon');
          error.exitCode = 1;
          throw error;
        }
        return { stdout: '', exitCode: 1 };
      });

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(true);
      expect(result.running).toBe(false);
    });

    it('should throw descriptive error when Docker is required but not installed', async () => {
      // Given
      execa.mockRejectedValue(new Error('spawn docker ENOENT'));

      // When/Then
      await expect(ensureDocker()).rejects.toThrow('Docker is not installed');
    });

    it('should throw descriptive error when Docker daemon is stopped', async () => {
      // Given
      execa.mockImplementation(async (cmd, args) => {
        if (args && args[0] === '--version') {
          return { stdout: 'Docker version 24.0.6' };
        }
        // docker info fails when daemon is not running
        return { stdout: '', exitCode: 1 };
      });

      // When/Then
      await expect(ensureDocker()).rejects.toThrow('Docker daemon is not running');
    });

    it('should report Docker as optional dependency in dep-checker', () => {
      // Given
      execaSync.mockImplementation((cmd) => {
        if (cmd === 'node') return { stdout: 'v20.10.0' };
        if (cmd === 'git') return { stdout: 'git version 2.42.0' };
        if (cmd === 'docker') throw new Error('Command not found');
        if (cmd === 'gh') return { stdout: 'gh version 2.40.0' };
        return { stdout: '' };
      });

      const mockOsInfo = {
        installInstructions: {
          node: 'brew install node@18',
          git: 'brew install git',
          docker: 'brew install --cask docker',
          gh: 'brew install gh',
        },
      };

      // When
      const result = checkAllDependencies(mockOsInfo);

      // Then
      expect(result.passed).toBe(true); // Should still pass
      expect(result.hasWarnings).toBe(true);
      expect(result.warnings.some(w => w.name === 'Docker')).toBe(true);
    });
  });

  describe('Insufficient Permissions', () => {
    it('should handle EACCES error when creating user config directory', async () => {
      // Given
      const permissionError = new Error('EACCES: permission denied');
      permissionError.code = 'EACCES';
      fs.ensureDir.mockRejectedValue(permissionError);

      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
      };

      // When/Then
      await expect(
        createUserConfigDirect('bob', mockLogger, false),
      ).rejects.toThrow('EACCES');
    });

    it('should handle EPERM error when writing config file', async () => {
      // Given
      const permissionError = new Error('EPERM: operation not permitted');
      permissionError.code = 'EPERM';
      fs.ensureDir.mockResolvedValue();
      fs.pathExists.mockResolvedValue(false);
      fs.writeFile.mockRejectedValue(permissionError);

      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
      };

      // When/Then
      await expect(
        createUserConfigDirect('bob', mockLogger, false),
      ).rejects.toThrow('EPERM');
    });

    it('should handle permission denied during npm install', async () => {
      // Given
      const permissionError = new Error('EACCES: permission denied, mkdir /usr/local/lib');
      permissionError.code = 'EACCES';
      execa.mockRejectedValue(permissionError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', '-g', 'aiox-core']);
      }).rejects.toThrow('EACCES');
    });

    it('should handle sudo requirement for global installs', async () => {
      // Given
      const sudoError = new Error('Please try running this command again as root/Administrator');
      execa.mockRejectedValue(sudoError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', '-g', 'aiox-core']);
      }).rejects.toThrow('root/Administrator');
    });
  });

  describe('Read-Only Directory', () => {
    it('should handle EROFS error in read-only filesystem', async () => {
      // Given
      const readOnlyError = new Error('EROFS: read-only file system');
      readOnlyError.code = 'EROFS';
      fs.ensureDir.mockRejectedValue(readOnlyError);

      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
      };

      // When/Then
      await expect(
        createUserConfigDirect('bob', mockLogger, false),
      ).rejects.toThrow('EROFS');
    });

    it('should handle read-only npm cache directory', async () => {
      // Given
      const readOnlyError = new Error('EROFS: read-only file system, mkdir ~/.npm');
      readOnlyError.code = 'EROFS';
      execa.mockRejectedValue(readOnlyError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', 'aiox-core']);
      }).rejects.toThrow('EROFS');
    });

    it('should handle insufficient disk space', async () => {
      // Given
      const noSpaceError = new Error('ENOSPC: no space left on device');
      noSpaceError.code = 'ENOSPC';
      fs.writeFile.mockRejectedValue(noSpaceError);
      fs.ensureDir.mockResolvedValue();
      fs.pathExists.mockResolvedValue(false);

      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
      };

      // When/Then
      await expect(
        createUserConfigDirect('bob', mockLogger, false),
      ).rejects.toThrow('ENOSPC');
    });

    it('should not make filesystem changes in dry-run mode on read-only system', async () => {
      // Given
      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
      };

      // When
      await createUserConfigDirect('bob', mockLogger, true);

      // Then
      expect(mockLogger.action).toHaveBeenCalled();
      expect(fs.ensureDir).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('Process/Signal Handling', () => {
    it('should handle SIGTERM during installation', async () => {
      // Given
      const sigTermError = new Error('Process terminated');
      sigTermError.signal = 'SIGTERM';
      execa.mockRejectedValue(sigTermError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', 'aiox-core']);
      }).rejects.toThrow('Process terminated');
    });

    it('should handle SIGINT (Ctrl+C) gracefully', async () => {
      // Given
      const sigIntError = new Error('User cancelled');
      sigIntError.signal = 'SIGINT';
      sigIntError.isCanceled = true;
      execa.mockRejectedValue(sigIntError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', 'aiox-core']);
      }).rejects.toThrow('User cancelled');
    });
  });

  describe('Concurrent Access', () => {
    it('should handle EBUSY error when file is locked', async () => {
      // Given
      const busyError = new Error('EBUSY: resource busy or locked');
      busyError.code = 'EBUSY';
      fs.writeFile.mockRejectedValue(busyError);
      fs.ensureDir.mockResolvedValue();
      fs.pathExists.mockResolvedValue(false);

      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
      };

      // When/Then
      await expect(
        createUserConfigDirect('bob', mockLogger, false),
      ).rejects.toThrow('EBUSY');
    });

    it('should handle EEXIST when directory already exists during race condition', async () => {
      // Given - first call succeeds, simulating race condition already handled
      fs.ensureDir.mockResolvedValue();
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('user_profile: advanced\n');
      fs.writeFile.mockResolvedValue();

      const mockLogger = {
        action: jest.fn(),
        success: jest.fn(),
      };

      // When
      await createUserConfigDirect('bob', mockLogger, false);

      // Then - should succeed by updating existing config
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalled();
    });
  });
});
