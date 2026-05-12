/**
 * Dependency Checker Tests
 *
 * Tests for system dependency verification including Node.js, Git, Docker, and GitHub CLI.
 */

'use strict';

const { execaSync } = require('execa');

// Mock execa
jest.mock('execa', () => ({
  execaSync: jest.fn(),
}));

const {
  REQUIREMENT,
  DEPENDENCIES,
  checkDependency,
  checkDockerRunning,
  checkAllDependencies,
  formatDependencyStatus,
} = require('../../../packages/aiox-install/src/dep-checker');

describe('dep-checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDependency', () => {
    const mockOsInfo = {
      installInstructions: {
        node: 'brew install node@18',
        git: 'brew install git',
        docker: 'brew install --cask docker',
        gh: 'brew install gh',
      },
    };

    describe('Node.js dependency', () => {
      it('should detect Node.js when installed and meets version requirement', () => {
        // Given
        execaSync.mockReturnValue({ stdout: 'v20.10.0' });

        // When
        const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

        // Then
        expect(result.installed).toBe(true);
        expect(result.version).toBe('20.10.0');
        expect(result.meetsMinVersion).toBe(true);
        expect(result.requirement).toBe(REQUIREMENT.REQUIRED);
      });

      it('should fail when Node.js version is below minimum', () => {
        // Given
        execaSync.mockReturnValue({ stdout: 'v16.20.0' });

        // When
        const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

        // Then
        expect(result.installed).toBe(true);
        expect(result.version).toBe('16.20.0');
        expect(result.meetsMinVersion).toBe(false);
      });

      it('should report not installed when command fails', () => {
        // Given
        execaSync.mockImplementation(() => {
          throw new Error('Command not found');
        });

        // When
        const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

        // Then
        expect(result.installed).toBe(false);
        expect(result.error).toBe('Command not found');
        expect(result.instruction).toBe('brew install node@18');
      });
    });

    describe('Git dependency', () => {
      it('should detect Git when installed', () => {
        // Given
        execaSync.mockReturnValue({ stdout: 'git version 2.42.0' });

        // When
        const result = checkDependency(DEPENDENCIES.git, mockOsInfo);

        // Then
        expect(result.installed).toBe(true);
        expect(result.version).toBe('2.42.0');
        expect(result.meetsMinVersion).toBe(true);
      });

      it('should parse Git version correctly', () => {
        // Given
        execaSync.mockReturnValue({ stdout: 'git version 2.30.1 (Apple Git-130)' });

        // When
        const result = checkDependency(DEPENDENCIES.git, mockOsInfo);

        // Then
        expect(result.version).toBe('2.30.1');
      });
    });

    describe('Docker dependency (optional)', () => {
      it('should detect Docker when installed', () => {
        // Given
        execaSync.mockReturnValue({ stdout: 'Docker version 24.0.6, build ed223bc' });

        // When
        const result = checkDependency(DEPENDENCIES.docker, mockOsInfo);

        // Then
        expect(result.installed).toBe(true);
        expect(result.version).toBe('24.0.6');
        expect(result.requirement).toBe(REQUIREMENT.OPTIONAL);
      });

      it('should not fail when Docker is not installed (optional)', () => {
        // Given
        execaSync.mockImplementation(() => {
          throw new Error('Command not found');
        });

        // When
        const result = checkDependency(DEPENDENCIES.docker, mockOsInfo);

        // Then
        expect(result.installed).toBe(false);
        expect(result.requirement).toBe(REQUIREMENT.OPTIONAL);
      });
    });

    describe('GitHub CLI dependency (optional)', () => {
      it('should detect gh when installed', () => {
        // Given
        execaSync.mockReturnValue({ stdout: 'gh version 2.40.0 (2023-12-01)' });

        // When
        const result = checkDependency(DEPENDENCIES.gh, mockOsInfo);

        // Then
        expect(result.installed).toBe(true);
        expect(result.version).toBe('2.40.0');
        expect(result.requirement).toBe(REQUIREMENT.OPTIONAL);
      });
    });
  });

  describe('checkDockerRunning', () => {
    it('should return running=true when Docker daemon is active', () => {
      // Given
      execaSync.mockReturnValue({ stdout: 'Server: Docker Desktop', exitCode: 0 });

      // When
      const result = checkDockerRunning();

      // Then
      expect(result.running).toBe(true);
    });

    it('should return running=false when Docker daemon is not active', () => {
      // Given
      execaSync.mockReturnValue({ stdout: '', exitCode: 1 });

      // When
      const result = checkDockerRunning();

      // Then
      expect(result.running).toBe(false);
    });

    it('should return running=false when Docker check throws', () => {
      // Given
      execaSync.mockImplementation(() => {
        throw new Error('Cannot connect to Docker daemon');
      });

      // When
      const result = checkDockerRunning();

      // Then
      expect(result.running).toBe(false);
    });
  });

  describe('checkAllDependencies', () => {
    const mockOsInfo = {
      installInstructions: {
        node: 'brew install node@18',
        git: 'brew install git',
        docker: 'brew install --cask docker',
        gh: 'brew install gh',
      },
    };

    it('should pass when all required dependencies are installed', () => {
      // Given
      execaSync.mockImplementation((cmd) => {
        if (cmd === 'node') return { stdout: 'v20.10.0' };
        if (cmd === 'git') return { stdout: 'git version 2.42.0' };
        if (cmd === 'docker') return { stdout: 'Docker version 24.0.6', exitCode: 0 };
        if (cmd === 'gh') return { stdout: 'gh version 2.40.0' };
        return { stdout: '' };
      });

      // When
      const result = checkAllDependencies(mockOsInfo);

      // Then
      expect(result.passed).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.required.every(d => d.installed)).toBe(true);
    });

    it('should fail when Node.js is not installed', () => {
      // Given
      execaSync.mockImplementation((cmd) => {
        if (cmd === 'node') throw new Error('Command not found');
        if (cmd === 'git') return { stdout: 'git version 2.42.0' };
        if (cmd === 'docker') return { stdout: 'Docker version 24.0.6', exitCode: 0 };
        if (cmd === 'gh') return { stdout: 'gh version 2.40.0' };
        return { stdout: '' };
      });

      // When
      const result = checkAllDependencies(mockOsInfo);

      // Then
      expect(result.passed).toBe(false);
      expect(result.missing.some(m => m.command === 'node')).toBe(true);
    });

    it('should fail when Node.js version is below minimum', () => {
      // Given
      execaSync.mockImplementation((cmd) => {
        if (cmd === 'node') return { stdout: 'v16.0.0' };
        if (cmd === 'git') return { stdout: 'git version 2.42.0' };
        if (cmd === 'docker') return { stdout: 'Docker version 24.0.6', exitCode: 0 };
        if (cmd === 'gh') return { stdout: 'gh version 2.40.0' };
        return { stdout: '' };
      });

      // When
      const result = checkAllDependencies(mockOsInfo);

      // Then
      expect(result.passed).toBe(false);
      expect(result.missing.some(m => m.command === 'node' && m.reason.includes('below minimum'))).toBe(true);
    });

    it('should warn but pass when optional dependencies are missing', () => {
      // Given
      execaSync.mockImplementation((cmd) => {
        if (cmd === 'node') return { stdout: 'v20.10.0' };
        if (cmd === 'git') return { stdout: 'git version 2.42.0' };
        if (cmd === 'docker') throw new Error('Command not found');
        if (cmd === 'gh') throw new Error('Command not found');
        return { stdout: '' };
      });

      // When
      const result = checkAllDependencies(mockOsInfo);

      // Then
      expect(result.passed).toBe(true);
      expect(result.hasWarnings).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('formatDependencyStatus', () => {
    it('should format installed dependency with green checkmark', () => {
      // Given
      const check = { name: 'Node.js', installed: true, version: '20.10.0', meetsMinVersion: true };

      // When
      const result = formatDependencyStatus(check);

      // Then
      expect(result).toContain('Node.js');
      expect(result).toContain('v20.10.0');
    });

    it('should format not installed dependency with red X', () => {
      // Given
      const check = { name: 'Docker', installed: false };

      // When
      const result = formatDependencyStatus(check);

      // Then
      expect(result).toContain('Docker');
      expect(result).toContain('Not installed');
    });

    it('should format dependency below minimum version with warning', () => {
      // Given
      const check = { name: 'Node.js', installed: true, version: '16.0.0', meetsMinVersion: false, minVersion: '18.0.0' };

      // When
      const result = formatDependencyStatus(check);

      // Then
      expect(result).toContain('Node.js');
      expect(result).toContain('v16.0.0');
      expect(result).toContain('18.0.0');
    });
  });
});
