/**
 * OS Detector Tests
 *
 * Tests for cross-platform OS detection including macOS, Linux, Windows, and WSL.
 */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

// Mock modules before requiring the module under test
jest.mock('os');
jest.mock('fs');

const {
  OS_TYPE,
  detectOS,
  isWSL,
  getWSLDistro,
  detectLinuxPackageManager,
  getOSDisplayName,
} = require('../../../packages/aiox-install/src/os-detector');

describe('os-detector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.WSL_DISTRO_NAME;
    delete process.env.SHELL;
    delete process.env.COMSPEC;
  });

  describe('detectOS', () => {
    describe('macOS detection', () => {
      it('should detect macOS correctly', () => {
        // Given
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
        os.release.mockReturnValue('23.1.0');
        os.homedir.mockReturnValue('/Users/testuser');

        // When
        const result = detectOS();

        // Then
        expect(result.type).toBe(OS_TYPE.MACOS);
        expect(result.platform).toBe('darwin');
        expect(result.packageManager).toBe('brew');
        expect(result.installInstructions.node).toContain('brew');

        // Cleanup
        Object.defineProperty(process, 'platform', originalPlatform);
      });
    });

    describe('Linux detection', () => {
      it('should detect native Linux', () => {
        // Given
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
        os.release.mockReturnValue('5.15.0-generic');
        os.homedir.mockReturnValue('/home/testuser');
        fs.existsSync.mockImplementation((p) => {
          if (p === '/usr/bin/apt') return true;
          return false;
        });
        fs.readFileSync.mockImplementation((p) => {
          if (p === '/proc/version') return 'Linux version 5.15.0-generic';
          return '';
        });

        // When
        const result = detectOS();

        // Then
        expect(result.type).toBe(OS_TYPE.LINUX);
        expect(result.isWSL).toBe(false);
        expect(result.packageManager).toBe('apt');

        // Cleanup
        Object.defineProperty(process, 'platform', originalPlatform);
      });

      it('should detect WSL via environment variable', () => {
        // Given
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
        process.env.WSL_DISTRO_NAME = 'Ubuntu';
        os.release.mockReturnValue('5.15.0-microsoft-standard-WSL2');
        os.homedir.mockReturnValue('/home/testuser');
        fs.existsSync.mockImplementation((p) => {
          if (p === '/usr/bin/apt') return true;
          return false;
        });
        fs.readFileSync.mockImplementation(() => '');

        // When
        const result = detectOS();

        // Then
        expect(result.type).toBe(OS_TYPE.WSL);
        expect(result.isWSL).toBe(true);
        expect(result.wslDistro).toBe('Ubuntu');
        expect(result.notes).toBeDefined();
        expect(result.notes.some(n => n.includes('WSL'))).toBe(true);

        // Cleanup
        Object.defineProperty(process, 'platform', originalPlatform);
      });

      it('should detect WSL via /proc/version', () => {
        // Given
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
        os.release.mockReturnValue('5.15.0-microsoft-standard-WSL2');
        os.homedir.mockReturnValue('/home/testuser');
        fs.existsSync.mockImplementation((p) => {
          if (p === '/usr/bin/apt') return true;
          return false;
        });
        fs.readFileSync.mockImplementation((p) => {
          if (p === '/proc/version') return 'Linux version 5.15.0-microsoft-standard-WSL2';
          if (p === '/etc/os-release') return 'NAME="Ubuntu"\nVERSION="22.04"';
          return '';
        });

        // When
        const result = detectOS();

        // Then
        expect(result.type).toBe(OS_TYPE.WSL);
        expect(result.isWSL).toBe(true);

        // Cleanup
        Object.defineProperty(process, 'platform', originalPlatform);
      });
    });

    describe('Windows detection', () => {
      it('should detect Windows correctly', () => {
        // Given
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
        process.env.COMSPEC = 'C:\\Windows\\System32\\cmd.exe';
        os.release.mockReturnValue('10.0.22621');
        os.homedir.mockReturnValue('C:\\Users\\testuser');

        // When
        const result = detectOS();

        // Then
        expect(result.type).toBe(OS_TYPE.WINDOWS);
        expect(result.packageManager).toBe('winget');
        expect(result.pathSeparator).toBe('\\');
        expect(result.installInstructions.node).toContain('winget');
        expect(result.notes).toBeDefined();

        // Cleanup
        Object.defineProperty(process, 'platform', originalPlatform);
      });
    });
  });

  describe('isWSL', () => {
    beforeEach(() => {
      const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
    });

    it('should return true when WSL_DISTRO_NAME is set', () => {
      process.env.WSL_DISTRO_NAME = 'Ubuntu';
      expect(isWSL()).toBe(true);
    });

    it('should return true when /proc/version contains microsoft', () => {
      fs.readFileSync.mockReturnValue('Linux version 5.15.0-microsoft-standard-WSL2');
      expect(isWSL()).toBe(true);
    });

    it('should return false on native Linux', () => {
      fs.readFileSync.mockReturnValue('Linux version 5.15.0-generic');
      fs.existsSync.mockReturnValue(false);
      expect(isWSL()).toBe(false);
    });
  });

  describe('getWSLDistro', () => {
    it('should return distro from environment variable', () => {
      process.env.WSL_DISTRO_NAME = 'Debian';
      expect(getWSLDistro()).toBe('Debian');
    });

    it('should return distro from /etc/os-release', () => {
      fs.readFileSync.mockReturnValue('NAME="Ubuntu"\nVERSION="22.04"');
      expect(getWSLDistro()).toBe('Ubuntu');
    });

    it('should return null when distro cannot be determined', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      expect(getWSLDistro()).toBeNull();
    });
  });

  describe('detectLinuxPackageManager', () => {
    it('should detect apt', () => {
      fs.existsSync.mockImplementation((p) => p === '/usr/bin/apt');
      expect(detectLinuxPackageManager()).toBe('apt');
    });

    it('should detect dnf', () => {
      fs.existsSync.mockImplementation((p) => p === '/usr/bin/dnf');
      expect(detectLinuxPackageManager()).toBe('dnf');
    });

    it('should detect pacman', () => {
      fs.existsSync.mockImplementation((p) => p === '/usr/bin/pacman');
      expect(detectLinuxPackageManager()).toBe('pacman');
    });

    it('should return unknown when no package manager found', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detectLinuxPackageManager()).toBe('unknown');
    });
  });

  describe('getOSDisplayName', () => {
    it('should format macOS name', () => {
      const osInfo = { type: OS_TYPE.MACOS, release: '23.1.0' };
      expect(getOSDisplayName(osInfo)).toBe('macOS (23.1.0)');
    });

    it('should format WSL name with distro', () => {
      const osInfo = { type: OS_TYPE.WSL, wslDistro: 'Ubuntu', release: '5.15.0' };
      expect(getOSDisplayName(osInfo)).toBe('WSL (Ubuntu)');
    });

    it('should format Linux name', () => {
      const osInfo = { type: OS_TYPE.LINUX, release: '5.15.0' };
      expect(getOSDisplayName(osInfo)).toBe('Linux (5.15.0)');
    });

    it('should format Windows name', () => {
      const osInfo = { type: OS_TYPE.WINDOWS, release: '10.0.22621' };
      expect(getOSDisplayName(osInfo)).toBe('Windows (10.0.22621)');
    });

    it('should handle unknown OS', () => {
      const osInfo = { type: OS_TYPE.UNKNOWN, platform: 'freebsd' };
      expect(getOSDisplayName(osInfo)).toBe('Unknown (freebsd)');
    });
  });
});
