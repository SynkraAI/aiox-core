/**
 * STORY-2.11: Symlink Manager Unit Tests
 * Tests for MCP symlink/junction management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Mock modules
jest.mock('fs');
jest.mock('os');
jest.mock('child_process');

// Import os-detector first to mock it
jest.mock('../../../.aiox-core/core/mcp/os-detector', () => ({
  isWindows: jest.fn(),
  getGlobalMcpDir: jest.fn(),
  getLinkType: jest.fn(),
}));

const {
  LINK_STATUS,
  getProjectMcpPath,
  isLink,
  getLinkTarget,
  checkLinkStatus,
  createLink,
  removeLink,
} = require('../../../.aiox-core/core/mcp/symlink-manager');

const osDetector = require('../../../.aiox-core/core/mcp/os-detector');

describe('Symlink Manager', () => {
  const mockProjectRoot = '/mock/project';
  const mockGlobalMcpDir = '/mock/home/.aiox/mcp';
  const mockLinkPath = path.join(mockProjectRoot, '.aiox-core', 'tools', 'mcp');

  beforeEach(() => {
    jest.clearAllMocks();
    os.homedir.mockReturnValue('/mock/home');
    osDetector.getGlobalMcpDir.mockReturnValue(mockGlobalMcpDir);
  });

  describe('LINK_STATUS', () => {
    it('should have all required status values', () => {
      expect(LINK_STATUS.LINKED).toBe('linked');
      expect(LINK_STATUS.NOT_LINKED).toBe('not_linked');
      expect(LINK_STATUS.BROKEN).toBe('broken');
      expect(LINK_STATUS.DIRECTORY).toBe('directory');
      expect(LINK_STATUS.ERROR).toBe('error');
    });
  });

  describe('getProjectMcpPath', () => {
    it('should return correct path for project root', () => {
      const result = getProjectMcpPath(mockProjectRoot);
      expect(result).toBe(path.join(mockProjectRoot, '.aiox-core', 'tools', 'mcp'));
    });

    it('should use current directory when no root provided', () => {
      const cwd = process.cwd();
      const result = getProjectMcpPath();
      expect(result).toBe(path.join(cwd, '.aiox-core', 'tools', 'mcp'));
    });
  });

  describe('isLink', () => {
    it('should return true for symlink', () => {
      fs.lstatSync.mockReturnValue({
        isSymbolicLink: () => true,
      });

      expect(isLink('/some/path')).toBe(true);
    });

    it('should return false for regular directory', () => {
      fs.lstatSync.mockReturnValue({
        isSymbolicLink: () => false,
      });
      osDetector.isWindows.mockReturnValue(false);

      expect(isLink('/some/path')).toBe(false);
    });

    it('should handle errors gracefully', () => {
      fs.lstatSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      osDetector.isWindows.mockReturnValue(false);

      expect(isLink('/nonexistent')).toBe(false);
    });
  });

  describe('getLinkTarget', () => {
    it('should return target for symlink', () => {
      const targetPath = '/target/path';
      fs.readlinkSync.mockReturnValue(targetPath);

      expect(getLinkTarget('/link/path')).toBe(targetPath);
    });

    it('should return null on error', () => {
      fs.readlinkSync.mockImplementation(() => {
        throw new Error('Not a symlink');
      });
      osDetector.isWindows.mockReturnValue(false);

      expect(getLinkTarget('/not/a/link')).toBeNull();
    });
  });

  describe('checkLinkStatus', () => {
    beforeEach(() => {
      osDetector.getLinkType.mockReturnValue('symlink');
    });

    it('should return NOT_LINKED when tools directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = checkLinkStatus(mockProjectRoot);

      expect(result.status).toBe(LINK_STATUS.NOT_LINKED);
      expect(result.message).toContain('does not exist');
    });

    it('should return NOT_LINKED when link path does not exist', () => {
      fs.existsSync
        .mockReturnValueOnce(true)  // tools dir exists
        .mockReturnValueOnce(false); // link path does not exist

      const result = checkLinkStatus(mockProjectRoot);

      expect(result.status).toBe(LINK_STATUS.NOT_LINKED);
    });

    it('should return LINKED when properly linked', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({
        isSymbolicLink: () => true,
      });
      fs.readlinkSync.mockReturnValue(mockGlobalMcpDir);

      const result = checkLinkStatus(mockProjectRoot);

      expect(result.status).toBe(LINK_STATUS.LINKED);
      expect(result.target).toBe(mockGlobalMcpDir);
    });

    it('should return DIRECTORY for regular directory', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({
        isSymbolicLink: () => false,
      });
      osDetector.isWindows.mockReturnValue(false);

      const result = checkLinkStatus(mockProjectRoot);

      expect(result.status).toBe(LINK_STATUS.DIRECTORY);
    });
  });

  describe('createLink', () => {
    describe('on Unix', () => {
      beforeEach(() => {
        osDetector.isWindows.mockReturnValue(false);
        osDetector.getLinkType.mockReturnValue('symlink');
      });

      it('should call symlinkSync when creating link on Unix', () => {
        // Setup: global dir exists, link doesn't exist, verification succeeds
        fs.existsSync.mockImplementation((p) => {
          // Return false only for the exact link path to trigger creation
          if (p === mockLinkPath) return false;
          return true;
        });

        fs.mkdirSync.mockReturnValue(undefined);
        fs.symlinkSync.mockReturnValue(undefined);
        fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
        fs.readlinkSync.mockReturnValue(mockGlobalMcpDir);

        createLink(mockProjectRoot);

        // Verify symlinkSync was called (the key behavior for Unix)
        expect(fs.symlinkSync).toHaveBeenCalled();
      });

      it('should fail when global MCP does not exist', () => {
        // First call (global mcp dir) returns false
        fs.existsSync.mockReturnValue(false);

        const result = createLink(mockProjectRoot);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not exist');
      });

      it('should return success when already linked', () => {
        fs.existsSync.mockReturnValue(true);
        fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
        fs.readlinkSync.mockReturnValue(mockGlobalMcpDir);

        const result = createLink(mockProjectRoot);

        expect(result.success).toBe(true);
        expect(result.alreadyLinked).toBe(true);
      });
    });

    describe('on Windows', () => {
      beforeEach(() => {
        osDetector.isWindows.mockReturnValue(true);
        osDetector.getLinkType.mockReturnValue('junction');
      });

      it('should call mklink command when creating junction on Windows', () => {
        // Setup: global dir exists, link doesn't exist, verification succeeds
        fs.existsSync.mockImplementation((p) => {
          // Return false only for the exact link path to trigger creation
          if (p === mockLinkPath) return false;
          return true;
        });

        fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
        fs.readlinkSync.mockReturnValue(mockGlobalMcpDir);
        execSync.mockReturnValue('');

        createLink(mockProjectRoot);

        // Verify mklink /J was called (the key behavior for Windows)
        expect(execSync).toHaveBeenCalledWith(
          expect.stringContaining('mklink /J'),
          expect.any(Object),
        );
      });
    });
  });

  describe('removeLink', () => {
    describe('on Unix', () => {
      beforeEach(() => {
        osDetector.isWindows.mockReturnValue(false);
        osDetector.getLinkType.mockReturnValue('symlink');
      });

      it('should remove symlink on Unix', () => {
        fs.existsSync.mockReturnValue(true);
        fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
        fs.readlinkSync.mockReturnValue(mockGlobalMcpDir);
        fs.unlinkSync.mockReturnValue(undefined);

        const result = removeLink(mockProjectRoot);

        expect(result.success).toBe(true);
        expect(fs.unlinkSync).toHaveBeenCalled();
      });

      it('should succeed when link does not exist', () => {
        fs.existsSync
          .mockReturnValueOnce(true)  // tools dir
          .mockReturnValueOnce(false); // link path

        const result = removeLink(mockProjectRoot);

        expect(result.success).toBe(true);
        expect(result.alreadyRemoved).toBe(true);
      });

      it('should fail when path is directory', () => {
        fs.existsSync.mockReturnValue(true);
        fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });
        osDetector.isWindows.mockReturnValue(false);

        const result = removeLink(mockProjectRoot);

        expect(result.success).toBe(false);
        expect(result.error).toContain('directory');
      });
    });

    describe('on Windows', () => {
      beforeEach(() => {
        osDetector.isWindows.mockReturnValue(true);
        osDetector.getLinkType.mockReturnValue('junction');
      });

      it('should remove junction on Windows using rmdir', () => {
        fs.existsSync.mockReturnValue(true);
        fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
        fs.readlinkSync.mockReturnValue(mockGlobalMcpDir);
        execSync.mockReturnValue('');

        const result = removeLink(mockProjectRoot);

        expect(result.success).toBe(true);
        expect(execSync).toHaveBeenCalledWith(
          expect.stringContaining('rmdir'),
          expect.any(Object),
        );
      });
    });
  });
});
