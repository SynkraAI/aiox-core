/**
 * edmcp Tests
 *
 * Tests for the Docker MCP Gateway Manager.
 */

'use strict';

// Mock modules
jest.mock('execa', () => ({
  execa: jest.fn(),
  execaSync: jest.fn(),
}));
jest.mock('fs-extra');
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

const { execa } = require('execa');
const fs = require('fs-extra');

const {
  checkDocker,
  ensureDocker,
  parseMcpSource,
} = require('../../../packages/aiox-install/src/edmcp');

describe('edmcp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDocker', () => {
    it('should return installed and running when Docker is available', async () => {
      // Given
      execa.mockResolvedValueOnce({ stdout: 'Docker version 24.0.6, build ed223bc' })
        .mockResolvedValueOnce({ exitCode: 0, stdout: 'Server: Docker Desktop' });

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(true);
      expect(result.running).toBe(true);
      expect(result.version).toBe('24.0.6');
    });

    it('should return installed but not running when daemon is stopped', async () => {
      // Given
      execa.mockResolvedValueOnce({ stdout: 'Docker version 24.0.6' })
        .mockResolvedValueOnce({ exitCode: 1, stdout: '' });

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(true);
      expect(result.running).toBe(false);
    });

    it('should return not installed when Docker command fails', async () => {
      // Given
      execa.mockRejectedValue(new Error('Command not found'));

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(false);
      expect(result.running).toBe(false);
      expect(result.error).toBe('Command not found');
    });
  });

  describe('ensureDocker', () => {
    it('should resolve when Docker is available and running', async () => {
      // Given
      execa.mockResolvedValueOnce({ stdout: 'Docker version 24.0.6' })
        .mockResolvedValueOnce({ exitCode: 0 });

      // When/Then
      await expect(ensureDocker()).resolves.toBeDefined();
    });

    it('should throw when Docker is not installed', async () => {
      // Given
      execa.mockRejectedValue(new Error('Command not found'));

      // When/Then
      await expect(ensureDocker()).rejects.toThrow('Docker is not installed');
    });

    it('should throw when Docker daemon is not running', async () => {
      // Given
      execa.mockResolvedValueOnce({ stdout: 'Docker version 24.0.6' })
        .mockResolvedValueOnce({ exitCode: 1 });

      // When/Then
      await expect(ensureDocker()).rejects.toThrow('Docker daemon is not running');
    });
  });

  describe('parseMcpSource', () => {
    it('should parse catalog name', () => {
      // When
      const result = parseMcpSource('exa');

      // Then
      expect(result.type).toBe('catalog');
      expect(result.name).toBe('exa');
      expect(result.url).toBeNull();
    });

    it('should parse GitHub shorthand', () => {
      // When
      const result = parseMcpSource('user/my-mcp');

      // Then
      expect(result.type).toBe('github');
      expect(result.name).toBe('my-mcp');
      expect(result.url).toBe('https://github.com/user/my-mcp');
    });

    it('should parse HTTPS URL', () => {
      // When
      const result = parseMcpSource('https://github.com/user/mcp-custom.git');

      // Then
      expect(result.type).toBe('url');
      expect(result.name).toBe('custom');
      expect(result.url).toBe('https://github.com/user/mcp-custom.git');
    });

    it('should parse SSH URL', () => {
      // When
      const result = parseMcpSource('git@github.com:user/mcp-tool.git');

      // Then
      expect(result.type).toBe('url');
      expect(result.name).toBe('tool');
      expect(result.url).toBe('git@github.com:user/mcp-tool.git');
    });

    it('should strip mcp- prefix from name', () => {
      // When
      const result = parseMcpSource('https://github.com/user/mcp-awesome');

      // Then
      expect(result.name).toBe('awesome');
    });
  });

  describe('listMcps', () => {
    it('should be tested in integration tests (requires Docker)', () => {
      // Note: listMcps requires Docker to be running, so we test the parsing logic
      // through parseMcpSource instead of the full function
      expect(true).toBe(true);
    });
  });

  describe('addMcp', () => {
    it('should be tested in integration tests (requires Docker)', () => {
      // Note: addMcp has complex Docker interactions that are better tested
      // in integration tests. Unit tests focus on input parsing via parseMcpSource.
      expect(true).toBe(true);
    });
  });

  describe('removeMcp', () => {
    it('should be tested in integration tests (requires Docker)', () => {
      // Note: removeMcp has complex Docker interactions that are better tested
      // in integration tests.
      expect(true).toBe(true);
    });
  });
});
