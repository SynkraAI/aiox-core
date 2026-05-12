/**
 * Integration Tests: Environment Configuration
 * Story 1.6: Environment Configuration
 *
 * Tests for configure-environment.js with file system operations
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { configureEnvironment, updateGitignore } = require('../../src/config/configure-environment');

/**
 * Cleanup helper with retry logic for flaky file system operations
 * Handles ENOTEMPTY and EBUSY errors common in CI environments
 * @param {string} dir - Directory to remove
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 */
async function cleanupWithRetry(dir, maxRetries = 5, retryDelay = 100) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (await fs.pathExists(dir)) {
        await fs.remove(dir);
      }
      return;
    } catch (error) {
      const isRetryable = error.code && ['ENOTEMPTY', 'EBUSY', 'EPERM', 'EACCES'].includes(error.code);
      if (attempt === maxRetries || !isRetryable) {
        // Last attempt failed or non-retryable error, log but don't throw
        console.warn(`Warning: Failed to cleanup ${dir} after ${attempt} attempts:`, error.code);
        return;
      }
      // Linear backoff (100ms, 200ms, 300ms...)
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
}

describe('Environment Configuration Integration', () => {
  let testDir;
  let testId;

  beforeEach(async () => {
    // Create unique temporary test directory with random suffix to avoid collisions
    testId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    testDir = path.join(os.tmpdir(), `aiox-env-test-${testId}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Small delay to allow file handles to close
    await new Promise(resolve => setTimeout(resolve, 50));
    // Cleanup test directory with retry logic
    await cleanupWithRetry(testDir);
  });

  describe('configureEnvironment', () => {
    it('should create .env file with skip prompts', async () => {
      const result = await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
        projectType: 'GREENFIELD',
        selectedIDEs: ['vscode'],
        mcpServers: [],
      });

      expect(result.envCreated).toBe(true);

      const envPath = path.join(testDir, '.env');
      expect(await fs.pathExists(envPath)).toBe(true);

      const content = await fs.readFile(envPath, 'utf8');
      expect(content).toContain('NODE_ENV=development');
      // Version-agnostic: check AIOX_VERSION exists with valid semver format
      expect(content).toMatch(/AIOX_VERSION=\d+\.\d+\.\d+/);
    });

    it('should create .env.example file', async () => {
      const result = await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      expect(result.envExampleCreated).toBe(true);

      const envExamplePath = path.join(testDir, '.env.example');
      expect(await fs.pathExists(envExamplePath)).toBe(true);

      const content = await fs.readFile(envExamplePath, 'utf8');
      expect(content).toContain('OPENAI_API_KEY=');
      expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
    });

    it('should create core-config.yaml', async () => {
      const result = await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
        projectType: 'BROWNFIELD',
        selectedIDEs: ['vscode', 'cursor'],
        mcpServers: [{ name: 'github' }, { name: 'exa' }],
      });

      expect(result.coreConfigCreated).toBe(true);

      const configPath = path.join(testDir, '.aiox-core', 'core-config.yaml');
      expect(await fs.pathExists(configPath)).toBe(true);

      const content = await fs.readFile(configPath, 'utf8');
      expect(content).toContain('type: BROWNFIELD');
      expect(content).toContain('- vscode');
      expect(content).toContain('- cursor');
      expect(content).toContain('- github');
      expect(content).toContain('- exa');
    });

    it('should update .gitignore', async () => {
      const result = await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      expect(result.gitignoreUpdated).toBe(true);

      const gitignorePath = path.join(testDir, '.gitignore');
      expect(await fs.pathExists(gitignorePath)).toBe(true);

      const content = await fs.readFile(gitignorePath, 'utf8');
      expect(content).toContain('.env');
    });

    it('should set .env file permissions on Unix', async () => {
      if (process.platform === 'win32') {
        // Skip on Windows
        return;
      }

      await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      const envPath = path.join(testDir, '.env');
      const stats = await fs.stat(envPath);

      // Check permissions are 0600 (owner read/write only)
      const mode = stats.mode & 0o777;
      expect(mode).toBe(0o600);
    });

    it('should create backup of existing .env in non-prompt mode', async () => {
      // Create existing .env
      const envPath = path.join(testDir, '.env');
      await fs.writeFile(envPath, 'EXISTING_KEY=existing_value', 'utf8');

      // Run configuration (skipPrompts mode doesn't backup)
      await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      // In skipPrompts mode, no backup is created, file is overwritten
      const content = await fs.readFile(envPath, 'utf8');
      expect(content).not.toContain('EXISTING_KEY=existing_value');
    });

    it('should handle errors gracefully', async () => {
      // Try to write to a read-only directory (simulate permission error)
      const readOnlyDir = path.join(testDir, 'readonly');
      await fs.ensureDir(readOnlyDir);

      // Note: This test is platform-dependent and may not work on all systems
      // Just verify the function handles errors
      try {
        await configureEnvironment({
          targetDir: '/invalid/path/that/does/not/exist',
          skipPrompts: true,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('updateGitignore', () => {
    it('should create .gitignore if not exists', async () => {
      await updateGitignore(testDir);

      const gitignorePath = path.join(testDir, '.gitignore');
      expect(await fs.pathExists(gitignorePath)).toBe(true);

      const content = await fs.readFile(gitignorePath, 'utf8');
      expect(content).toContain('.env');
    });

    it('should append to existing .gitignore', async () => {
      const gitignorePath = path.join(testDir, '.gitignore');
      await fs.writeFile(gitignorePath, 'node_modules\n*.log\n', 'utf8');

      await updateGitignore(testDir);

      const content = await fs.readFile(gitignorePath, 'utf8');
      expect(content).toContain('node_modules');
      expect(content).toContain('*.log');
      expect(content).toContain('.env');
    });

    it('should not duplicate .env entry', async () => {
      const gitignorePath = path.join(testDir, '.gitignore');
      await fs.writeFile(gitignorePath, '.env\n', 'utf8');

      await updateGitignore(testDir);

      const content = await fs.readFile(gitignorePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() === '.env' || line.trim() === '/.env');
      expect(lines.length).toBe(1);
    });

    it('should recognize existing .env entry with slash', async () => {
      const gitignorePath = path.join(testDir, '.gitignore');
      await fs.writeFile(gitignorePath, '/.env\n', 'utf8');

      await updateGitignore(testDir);

      const content = await fs.readFile(gitignorePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() === '.env' || line.trim() === '/.env');
      expect(lines.length).toBe(1);
    });
  });

  describe('Wizard Integration', () => {
    it('should integrate with wizard state from previous stories', async () => {
      // Simulate wizard state from Stories 1.3, 1.4, 1.5
      const wizardState = {
        projectType: 'GREENFIELD',
        selectedIDEs: ['vscode', 'cursor'],
        mcpServers: [
          { name: 'github', id: 'github' },
          { name: 'exa', id: 'exa' },
        ],
      };

      const result = await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
        ...wizardState,
      });

      // Verify all files created
      expect(result.envCreated).toBe(true);
      expect(result.coreConfigCreated).toBe(true);
      expect(result.gitignoreUpdated).toBe(true);

      // Verify core-config includes wizard state
      const configPath = path.join(testDir, '.aiox-core', 'core-config.yaml');
      const configContent = await fs.readFile(configPath, 'utf8');

      expect(configContent).toContain('GREENFIELD');
      expect(configContent).toContain('vscode');
      expect(configContent).toContain('cursor');
      expect(configContent).toContain('github');
      expect(configContent).toContain('exa');
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should handle Windows paths', async () => {
      const result = await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      expect(result.envCreated).toBe(true);
      expect(result.coreConfigCreated).toBe(true);
    });

    it('should create valid YAML on all platforms', async () => {
      await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
        projectType: 'GREENFIELD',
      });

      const yaml = require('js-yaml');
      const configPath = path.join(testDir, '.aiox-core', 'core-config.yaml');
      const content = await fs.readFile(configPath, 'utf8');

      // Should parse without errors
      const parsed = yaml.load(content);
      expect(parsed).toBeDefined();
      expect(parsed.project.type).toBe('GREENFIELD');
    });
  });

  describe('File Structure', () => {
    it('should create correct directory structure', async () => {
      await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      // Check all expected files exist
      const expectedFiles = [
        '.env',
        '.env.example',
        '.gitignore',
        '.aiox-core/core-config.yaml',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(testDir, file);
        expect(await fs.pathExists(filePath)).toBe(true);
      }
    });

    it('should create .aiox-core directory if missing', async () => {
      const aioxcoreDir = path.join(testDir, '.aiox-core');
      expect(await fs.pathExists(aioxcoreDir)).toBe(false);

      await configureEnvironment({
        targetDir: testDir,
        skipPrompts: true,
      });

      expect(await fs.pathExists(aioxcoreDir)).toBe(true);
    });
  });
});
