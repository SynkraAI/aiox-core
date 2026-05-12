/**
 * LLM Routing Integration Tests
 *
 * Story 6.7: LLM Routing Migration
 *
 * Tests installation, command creation, and cross-platform compatibility.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Module under test
const {
  installLLMRouting,
  isLLMRoutingInstalled,
  getInstallDir,
  getInstallationSummary,
  LLM_ROUTING_VERSION,
} = require('../../../.aiox-core/infrastructure/scripts/llm-routing/install-llm-routing');

describe('LLM Routing Module', () => {
  const isWindows = os.platform() === 'win32';
  const testTemplatesDir = path.join(
    __dirname,
    '../../../.aiox-core/infrastructure/scripts/llm-routing/templates',
  );

  describe('Module Exports', () => {
    test('should export all required functions', () => {
      expect(typeof installLLMRouting).toBe('function');
      expect(typeof isLLMRoutingInstalled).toBe('function');
      expect(typeof getInstallDir).toBe('function');
      expect(typeof getInstallationSummary).toBe('function');
      expect(typeof LLM_ROUTING_VERSION).toBe('string');
    });

    test('should have valid version format', () => {
      expect(LLM_ROUTING_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('getInstallDir()', () => {
    test('should return a valid directory path', () => {
      const installDir = getInstallDir();
      expect(typeof installDir).toBe('string');
      expect(installDir.length).toBeGreaterThan(0);
    });

    test('should return platform-appropriate path', () => {
      const installDir = getInstallDir();

      if (isWindows) {
        // Windows: should be npm global or user profile
        expect(
          installDir.includes('npm') ||
            installDir.includes('Users') ||
            installDir.includes('USERPROFILE'),
        ).toBe(true);
      } else {
        // Unix: should be /usr/local/bin or ~/bin
        expect(installDir.includes('/usr/local/bin') || installDir.includes('/bin')).toBe(true);
      }
    });
  });

  describe('Template Files', () => {
    test('should have templates directory', () => {
      expect(fs.existsSync(testTemplatesDir)).toBe(true);
    });

    test('should have Windows templates', () => {
      const claudeFreeCmd = path.join(testTemplatesDir, 'claude-free.cmd');
      const claudeMaxCmd = path.join(testTemplatesDir, 'claude-max.cmd');

      expect(fs.existsSync(claudeFreeCmd)).toBe(true);
      expect(fs.existsSync(claudeMaxCmd)).toBe(true);
    });

    test('should have Unix templates', () => {
      const claudeFreeSh = path.join(testTemplatesDir, 'claude-free.sh');
      const claudeMaxSh = path.join(testTemplatesDir, 'claude-max.sh');

      expect(fs.existsSync(claudeFreeSh)).toBe(true);
      expect(fs.existsSync(claudeMaxSh)).toBe(true);
    });

    test('claude-free template should reference DeepSeek', () => {
      const templateExt = isWindows ? '.cmd' : '.sh';
      const templatePath = path.join(testTemplatesDir, `claude-free${templateExt}`);
      const content = fs.readFileSync(templatePath, 'utf8');

      expect(content).toContain('deepseek');
      expect(content).toContain('DEEPSEEK_API_KEY');
    });

    test('claude-max template should clear alternative providers', () => {
      const templateExt = isWindows ? '.cmd' : '.sh';
      const templatePath = path.join(testTemplatesDir, `claude-max${templateExt}`);
      const content = fs.readFileSync(templatePath, 'utf8');

      expect(content).toContain('ANTHROPIC_BASE_URL');
      // Should unset/clear the URL
      if (isWindows) {
        expect(content).toMatch(/set\s+["']?ANTHROPIC_BASE_URL=["']?\s*$/m);
      } else {
        expect(content).toContain('unset ANTHROPIC_BASE_URL');
      }
    });
  });

  describe('installLLMRouting()', () => {
    test('should fail gracefully with missing templates directory', () => {
      const mockProgress = jest.fn();
      const mockError = jest.fn();

      const result = installLLMRouting({
        templatesDir: '/nonexistent/templates',
        onProgress: mockProgress,
        onError: mockError,
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(mockError).toHaveBeenCalled();
    });

    test('should return proper result structure', () => {
      const mockProgress = jest.fn();
      const mockError = jest.fn();

      // Use actual templates dir
      const result = installLLMRouting({
        templatesDir: testTemplatesDir,
        onProgress: mockProgress,
        onError: mockError,
      });

      // Should have expected properties
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('installDir');
      expect(result).toHaveProperty('filesInstalled');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.filesInstalled)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('getInstallationSummary()', () => {
    test('should return array of strings', () => {
      const mockResult = {
        success: true,
        installDir: '/test/dir',
        filesInstalled: ['claude-free', 'claude-max'],
        envCreated: false,
        errors: [],
      };

      const summary = getInstallationSummary(mockResult);

      expect(Array.isArray(summary)).toBe(true);
      summary.forEach((line) => {
        expect(typeof line).toBe('string');
      });
    });

    test('should include success message for successful install', () => {
      const mockResult = {
        success: true,
        installDir: '/test/dir',
        filesInstalled: ['claude-free', 'claude-max'],
        envCreated: false,
        errors: [],
      };

      const summary = getInstallationSummary(mockResult);
      const joined = summary.join('\n');

      expect(joined).toContain('Complete');
      expect(joined).toContain('claude-max');
      expect(joined).toContain('claude-free');
    });

    test('should include error messages for failed install', () => {
      const mockResult = {
        success: false,
        installDir: '/test/dir',
        filesInstalled: [],
        envCreated: false,
        errors: ['Test error 1', 'Test error 2'],
      };

      const summary = getInstallationSummary(mockResult);
      const joined = summary.join('\n');

      expect(joined).toContain('error');
      expect(joined).toContain('Test error 1');
      expect(joined).toContain('Test error 2');
    });
  });

  describe('Cross-Platform Path Handling', () => {
    test('should use path.join for cross-platform compatibility', () => {
      // The install script should use path.join() not string concatenation
      const installScript = fs.readFileSync(
        path.join(
          __dirname,
          '../../../.aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js',
        ),
        'utf8',
      );

      expect(installScript).toContain('path.join');
      // Should use path.join for constructing file paths (not string concatenation)
      // Allow legitimate path constants like '/usr/local/bin'
      expect(installScript).not.toMatch(/path\s*\+\s*['"][\\/]/); // No path + '/...'
      expect(installScript).not.toMatch(/['"][\\/]\s*\+\s*path/); // No '/...' + path
    });
  });
});

describe('Environment Variable Handling', () => {
  const isWindows = os.platform() === 'win32';
  const testTemplatesDir = path.join(
    __dirname,
    '../../../.aiox-core/infrastructure/scripts/llm-routing/templates',
  );

  test('claude-free should look for .env file', () => {
    const templateExt = isWindows ? '.cmd' : '.sh';
    const templatePath = path.join(testTemplatesDir, `claude-free${templateExt}`);
    const content = fs.readFileSync(templatePath, 'utf8');

    expect(content).toContain('.env');
  });

  test('claude-free should set ANTHROPIC_BASE_URL to DeepSeek', () => {
    const templateExt = isWindows ? '.cmd' : '.sh';
    const templatePath = path.join(testTemplatesDir, `claude-free${templateExt}`);
    const content = fs.readFileSync(templatePath, 'utf8');

    expect(content).toContain('api.deepseek.com');
  });

  test('claude-free should set API_TIMEOUT_MS', () => {
    const templateExt = isWindows ? '.cmd' : '.sh';
    const templatePath = path.join(testTemplatesDir, `claude-free${templateExt}`);
    const content = fs.readFileSync(templatePath, 'utf8');

    expect(content).toContain('API_TIMEOUT_MS');
  });
});
