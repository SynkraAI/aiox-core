/**
 * Unit Tests: File Structure Validator
 * Story 1.8 - Task 1.8.1
 */

const fs = require('fs');
const {
  validateFiles,
} = require('../../../../src/wizard/validation/validators/file-structure-validator');

// Mock fs module
jest.mock('fs');

describe('File Structure Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFiles', () => {
    it('should validate all files successfully when all exist', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const fileContext = {
        ideConfigs: ['.cursor/settings.json', '.windsurf/settings.json'],
        env: '.env',
        coreConfig: '.aios-core/core-config.yaml',
        mcpConfig: '.mcp.json',
      };

      // When
      const result = await validateFiles(fileContext);

      // Then
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should return errors when .env file is missing', async () => {
      // Given
      fs.existsSync.mockImplementation((path) => path !== '.env');

      const fileContext = {
        env: '.env',
      };

      // When
      const result = await validateFiles(fileContext);

      // Then
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: 'critical',
            code: 'ENV_FILE_MISSING',
          }),
        ])
      );
    });

    it('should return errors when core-config.yaml is missing', async () => {
      // Given
      fs.existsSync.mockImplementation((path) => path !== '.aios-core/core-config.yaml');

      const fileContext = {
        coreConfig: '.aios-core/core-config.yaml',
      };

      // When
      const result = await validateFiles(fileContext);

      // Then
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: 'high',
            code: 'CORE_CONFIG_MISSING',
          }),
        ])
      );
    });

    it('should NOT return warnings when .mcp.json is missing (it is optional)', async () => {
      // Given - .mcp.json is optional, should not generate warnings
      fs.existsSync.mockImplementation((path) => path !== '.mcp.json');

      const fileContext = {
        mcpConfig: '.mcp.json',
      };

      // When
      const result = await validateFiles(fileContext);

      // Then - no MCP_CONFIG_MISSING warning should be generated
      const mcpWarning = result.warnings.find((w) => w.code === 'MCP_CONFIG_MISSING');
      expect(mcpWarning).toBeUndefined();
    });

    it('should validate IDE config files', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);

      const fileContext = {
        ideConfigs: ['.cursor/settings.json', '.windsurf/settings.json'],
      };

      // When
      const result = await validateFiles(fileContext);

      // Then
      const ideChecks = result.checks.filter((c) => c.component === 'IDE Config');
      expect(ideChecks).toHaveLength(2);
      expect(ideChecks.every((c) => c.status === 'success')).toBe(true);
    });

    it('should handle validation errors gracefully', async () => {
      // Given
      fs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const fileContext = { env: '.env' };

      // When
      const result = await validateFiles(fileContext);

      // Then
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: 'critical',
            code: 'VALIDATION_ERROR',
          }),
        ])
      );
    });

    it('should check .env file permissions on Unix systems', async () => {
      // Given
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({
        mode: parseInt('0644', 8) | (fs.constants?.S_IFREG || 0),
      });

      const fileContext = { env: '.env' };

      // When
      const result = await validateFiles(fileContext);

      // Then
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'ENV_PERMISSIONS_INSECURE',
          }),
        ])
      );

      // Cleanup
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });
});
