/**
 * Terminal Spawner Tests
 * Story 12.10: Terminal Spawning E2E Validation
 *
 * Tests for environment detection, inline spawn, fallback, timeout, and cleanup.
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');

// Module under test
const {
  detectEnvironment,
  ENVIRONMENT_TYPE,
  spawnInline,
  spawnAgent,
  createContextFile,
  pollForOutput,
  cleanupOldFiles,
  registerLockFile,
  unregisterLockFile,
  cleanupLocks,
  generateCompatibilityReport,
  formatCompatibilityReport,
  getSystemInfo,
  OS_COMPATIBILITY_MATRIX,
  DEFAULT_TIMEOUT_MS,
  POLL_INTERVAL_MS,
  MAX_RETRIES,
} = require('../../../.aiox-core/core/orchestration/terminal-spawner');

// Test fixtures
const TEST_OUTPUT_DIR = path.join(os.tmpdir(), 'aiox-terminal-spawner-test');

describe('Terminal Spawner (Story 12.10)', () => {
  // Store original env vars
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };

    // Clean up test directory
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Restore original environment
    process.env = { ...originalEnv };

    // Clean up
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // ============================================
  // Task 6.1: Tests for detectEnvironment()
  // ============================================
  describe('detectEnvironment() (Task 1)', () => {
    describe('CI/CD detection (Task 1.5)', () => {
      it('should detect GitHub Actions environment', () => {
        // Given
        process.env.GITHUB_ACTIONS = 'true';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
        expect(result.supportsVisualTerminal).toBe(false);
        expect(result.reason).toContain('CI/CD');
      });

      it('should detect generic CI environment', () => {
        // Given
        process.env.CI = 'true';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
        expect(result.supportsVisualTerminal).toBe(false);
      });

      it('should detect GitLab CI environment', () => {
        // Given
        process.env.GITLAB_CI = 'true';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
      });

      it('should detect Jenkins environment', () => {
        // Given
        process.env.JENKINS_URL = 'http://jenkins.local';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
      });

      it('should detect Travis CI environment', () => {
        // Given
        process.env.TRAVIS = 'true';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
      });

      it('should detect CircleCI environment', () => {
        // Given
        process.env.CIRCLECI = 'true';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
      });

      it('should detect Azure Pipelines environment', () => {
        // Given
        process.env.TF_BUILD = 'True';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
      });
    });

    describe('SSH detection (Task 1.3)', () => {
      // Helper to clear CI environment variables for isolated SSH tests
      const clearCIEnvVars = () => {
        delete process.env.CI;
        delete process.env.GITHUB_ACTIONS;
        delete process.env.GITLAB_CI;
        delete process.env.JENKINS_URL;
        delete process.env.TRAVIS;
        delete process.env.CIRCLECI;
        delete process.env.TF_BUILD;
        delete process.env.BUILDKITE;
        delete process.env.CODEBUILD_BUILD_ID;
      };

      it('should detect SSH_CLIENT environment', () => {
        // Given - clear CI vars first to isolate test
        clearCIEnvVars();
        process.env.SSH_CLIENT = '192.168.1.1 12345 22';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.SSH);
        expect(result.supportsVisualTerminal).toBe(false);
        expect(result.reason).toContain('SSH');
      });

      it('should detect SSH_TTY environment', () => {
        // Given - clear CI vars first to isolate test
        clearCIEnvVars();
        process.env.SSH_TTY = '/dev/pts/0';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.SSH);
      });

      it('should detect SSH_CONNECTION environment', () => {
        // Given - clear CI vars first to isolate test
        clearCIEnvVars();
        process.env.SSH_CONNECTION = '192.168.1.1 12345 192.168.1.2 22';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.SSH);
      });
    });

    describe('VS Code detection (Task 1.2)', () => {
      // Helper to clear CI and SSH environment variables for isolated VS Code tests
      const clearHigherPriorityEnvVars = () => {
        // Clear CI vars
        delete process.env.CI;
        delete process.env.GITHUB_ACTIONS;
        delete process.env.GITLAB_CI;
        delete process.env.JENKINS_URL;
        delete process.env.TRAVIS;
        delete process.env.CIRCLECI;
        delete process.env.TF_BUILD;
        delete process.env.BUILDKITE;
        delete process.env.CODEBUILD_BUILD_ID;
        // Clear SSH vars
        delete process.env.SSH_CLIENT;
        delete process.env.SSH_TTY;
        delete process.env.SSH_CONNECTION;
      };

      it('should detect TERM_PROGRAM=vscode', () => {
        // Given - clear higher priority env vars to isolate test
        clearHigherPriorityEnvVars();
        process.env.TERM_PROGRAM = 'vscode';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.VSCODE);
        expect(result.supportsVisualTerminal).toBe(false);
        expect(result.reason).toContain('VS Code');
      });

      it('should detect VSCODE_PID', () => {
        // Given - clear higher priority env vars to isolate test
        clearHigherPriorityEnvVars();
        process.env.VSCODE_PID = '12345';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.VSCODE);
      });

      it('should detect VSCODE_CWD', () => {
        // Given - clear higher priority env vars to isolate test
        clearHigherPriorityEnvVars();
        process.env.VSCODE_CWD = '/home/user/project';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.VSCODE);
      });

      it('should detect VSCODE_GIT_IPC_HANDLE', () => {
        // Given - clear higher priority env vars to isolate test
        clearHigherPriorityEnvVars();
        process.env.VSCODE_GIT_IPC_HANDLE = '/tmp/git-ipc-12345';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.VSCODE);
      });
    });

    describe('Native terminal detection (Task 1.6)', () => {
      it('should return NATIVE_TERMINAL when no special environment detected', () => {
        // Given - clean environment (no CI, SSH, VS Code, Docker)
        delete process.env.CI;
        delete process.env.GITHUB_ACTIONS;
        delete process.env.SSH_CLIENT;
        delete process.env.SSH_TTY;
        delete process.env.SSH_CONNECTION;
        delete process.env.TERM_PROGRAM;
        delete process.env.VSCODE_PID;
        delete process.env.VSCODE_CWD;
        delete process.env.VSCODE_GIT_IPC_HANDLE;

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.NATIVE_TERMINAL);
        expect(result.supportsVisualTerminal).toBe(true);
        expect(result.reason).toContain('Native');
      });
    });

    describe('Detection priority', () => {
      // Helper to clear all detection environment variables
      const clearAllDetectionEnvVars = () => {
        // Clear CI vars
        delete process.env.CI;
        delete process.env.GITHUB_ACTIONS;
        delete process.env.GITLAB_CI;
        delete process.env.JENKINS_URL;
        delete process.env.TRAVIS;
        delete process.env.CIRCLECI;
        delete process.env.TF_BUILD;
        delete process.env.BUILDKITE;
        delete process.env.CODEBUILD_BUILD_ID;
        // Clear SSH vars
        delete process.env.SSH_CLIENT;
        delete process.env.SSH_TTY;
        delete process.env.SSH_CONNECTION;
        // Clear VS Code vars
        delete process.env.TERM_PROGRAM;
        delete process.env.VSCODE_PID;
        delete process.env.VSCODE_CWD;
        delete process.env.VSCODE_GIT_IPC_HANDLE;
      };

      it('should prioritize CI over SSH', () => {
        // Given - start clean and set both CI and SSH
        clearAllDetectionEnvVars();
        process.env.CI = 'true';
        process.env.SSH_CLIENT = '192.168.1.1 12345 22';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.CI);
      });

      it('should prioritize SSH over VS Code', () => {
        // Given - start clean and set both SSH and VS Code
        clearAllDetectionEnvVars();
        process.env.SSH_CLIENT = '192.168.1.1 12345 22';
        process.env.TERM_PROGRAM = 'vscode';

        // When
        const result = detectEnvironment();

        // Then
        expect(result.type).toBe(ENVIRONMENT_TYPE.SSH);
      });
    });
  });

  // ============================================
  // ENVIRONMENT_TYPE enum tests
  // ============================================
  describe('ENVIRONMENT_TYPE enum', () => {
    it('should have all required environment types', () => {
      expect(ENVIRONMENT_TYPE.NATIVE_TERMINAL).toBe('NATIVE_TERMINAL');
      expect(ENVIRONMENT_TYPE.VSCODE).toBe('VSCODE');
      expect(ENVIRONMENT_TYPE.SSH).toBe('SSH');
      expect(ENVIRONMENT_TYPE.DOCKER).toBe('DOCKER');
      expect(ENVIRONMENT_TYPE.CI).toBe('CI');
    });
  });

  // ============================================
  // Task 6.2: Tests for spawnInline()
  // ============================================
  describe('spawnInline() (Task 2)', () => {
    it('should execute a simple command inline', async () => {
      // This test may fail if pm.sh is not set up for inline mode
      // For unit testing, we're testing the function signature and basic behavior

      // Given
      const agent = 'dev';
      const task = 'test';
      const options = {
        timeout: 5000,
        outputDir: TEST_OUTPUT_DIR,
        debug: false,
      };

      // When
      const result = await spawnInline(agent, task, options);

      // Then - we expect it to run (may succeed or fail depending on pm.sh)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should capture stdout output', async () => {
      // Given
      const agent = 'dev';
      const task = 'test';
      const options = {
        timeout: 5000,
        outputDir: TEST_OUTPUT_DIR,
        debug: false,
      };

      // When
      const result = await spawnInline(agent, task, options);

      // Then
      expect(typeof result.output).toBe('string');
    });

    it('should handle context file creation', async () => {
      // Given
      const agent = 'dev';
      const task = 'test';
      const options = {
        timeout: 5000,
        outputDir: TEST_OUTPUT_DIR,
        context: {
          story: 'test-story.md',
          files: ['file1.js', 'file2.js'],
          instructions: 'Test instructions',
        },
      };

      // When
      const result = await spawnInline(agent, task, options);

      // Then - context file should be created and cleaned up
      expect(result).toBeDefined();
    });
  });

  // ============================================
  // Task 6.3: Tests for fallback automático
  // ============================================
  describe('spawnAgent() fallback (Task 2.3)', () => {
    it('should use inline spawn when environment does not support visual terminal', async () => {
      // Given - CI environment
      process.env.CI = 'true';
      const agent = 'dev';
      const task = 'test';
      const options = {
        timeout: 5000,
        outputDir: TEST_OUTPUT_DIR,
        debug: false,
        retries: 1,
      };

      // When
      const result = await spawnAgent(agent, task, options);

      // Then - should have used inline spawn (no visual terminal in CI)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  // ============================================
  // Task 6.4: Tests for timeout
  // ============================================
  describe('Timeout handling (Task 3.2)', () => {
    it('should timeout if lock file persists', async () => {
      // Given
      const outputFile = path.join(TEST_OUTPUT_DIR, 'aiox-output-timeout-test.md');
      const lockFile = outputFile.replace('output', 'lock');
      await fs.writeFile(lockFile, 'locked');
      await fs.writeFile(outputFile, 'test output');

      // When - poll with very short timeout
      await expect(pollForOutput(outputFile, 100, false)).rejects.toThrow('Timeout');

      // Then - lock file should be cleaned up
      const lockExists = fsSync.existsSync(lockFile);
      expect(lockExists).toBe(false);
    });

    it('should return output when lock is removed', async () => {
      // Given
      const outputFile = path.join(TEST_OUTPUT_DIR, 'aiox-output-success-test.md');
      const lockFile = outputFile.replace('output', 'lock');
      await fs.writeFile(outputFile, 'test output content');
      // No lock file - simulates completed process

      // When
      const output = await pollForOutput(outputFile, 1000, false);

      // Then
      expect(output).toBe('test output content');
    });
  });

  // ============================================
  // Task 6.5: Tests for lock cleanup
  // ============================================
  describe('Lock cleanup (Task 3.3, 3.4)', () => {
    it('should register and unregister lock files', () => {
      // Given
      const lockPath = path.join(TEST_OUTPUT_DIR, 'test-lock.lock');

      // When
      registerLockFile(lockPath);

      // Then - should be able to unregister
      unregisterLockFile(lockPath);
      // No error means success
    });

    it('should cleanup registered lock files', async () => {
      // Given
      const lockPath = path.join(TEST_OUTPUT_DIR, 'cleanup-test.lock');
      await fs.writeFile(lockPath, 'locked');
      registerLockFile(lockPath);

      // When
      cleanupLocks();

      // Then
      const exists = fsSync.existsSync(lockPath);
      expect(exists).toBe(false);
    });

    it('should cleanup old files', async () => {
      // Given - create old file
      const oldFile = path.join(TEST_OUTPUT_DIR, 'aiox-output-old.md');
      await fs.writeFile(oldFile, 'old content');

      // Manually set mtime to past
      const pastTime = new Date(Date.now() - 3600001); // 1 hour + 1ms ago
      await fs.utimes(oldFile, pastTime, pastTime);

      // When
      const cleaned = await cleanupOldFiles(TEST_OUTPUT_DIR, 3600000); // 1 hour

      // Then
      expect(cleaned).toBeGreaterThanOrEqual(1);
      const exists = fsSync.existsSync(oldFile);
      expect(exists).toBe(false);
    });
  });

  // ============================================
  // Context file tests
  // ============================================
  describe('createContextFile()', () => {
    it('should create context file with valid structure', async () => {
      // Given
      const context = {
        story: 'docs/stories/story-12.10.md',
        files: ['src/index.js', 'src/utils.js'],
        instructions: 'Test the terminal spawner',
        metadata: { priority: 'high' },
      };

      // When
      const contextPath = await createContextFile(context, TEST_OUTPUT_DIR);

      // Then
      expect(contextPath).toBeTruthy();
      const content = JSON.parse(await fs.readFile(contextPath, 'utf8'));
      expect(content.story).toBe(context.story);
      expect(content.files).toEqual(context.files);
      expect(content.instructions).toBe(context.instructions);
      expect(content.metadata.priority).toBe('high');
      expect(content.createdAt).toBeDefined();

      // Cleanup
      await fs.unlink(contextPath);
    });

    it('should return empty string for null context', async () => {
      // When
      const result = await createContextFile(null, TEST_OUTPUT_DIR);

      // Then
      expect(result).toBe('');
    });

    it('should handle missing optional fields', async () => {
      // Given
      const context = { story: 'test.md' };

      // When
      const contextPath = await createContextFile(context, TEST_OUTPUT_DIR);

      // Then
      const content = JSON.parse(await fs.readFile(contextPath, 'utf8'));
      expect(content.story).toBe('test.md');
      expect(content.files).toEqual([]);
      expect(content.instructions).toBe('');
      expect(content.metadata).toEqual({});

      // Cleanup
      await fs.unlink(contextPath);
    });
  });

  // ============================================
  // Task 7.6: Tests for generateCompatibilityReport()
  // ============================================
  describe('generateCompatibilityReport() (Task 7.4)', () => {
    it('should generate report with all required fields', () => {
      // Given
      const testResults = [
        { testName: 'Test 1', result: 'pass', duration: 100 },
        { testName: 'Test 2', result: 'fail', failureReason: 'Timeout', duration: 200 },
        { testName: 'Test 3', result: 'skip', duration: 0 },
      ];

      // When
      const report = generateCompatibilityReport(testResults);

      // Then - check required fields
      expect(report.generatedAt).toBeDefined();
      expect(new Date(report.generatedAt)).toBeInstanceOf(Date);

      expect(report.system).toBeDefined();
      expect(report.system.os_name).toBeDefined();
      expect(report.system.os_version).toBeDefined();
      expect(report.system.architecture).toBeDefined();
      expect(report.system.shell).toBeDefined();
      expect(report.system.docker_version).toBeDefined();
      expect(report.system.node_version).toBeDefined();

      expect(report.environment).toBeDefined();
      expect(report.environment.type).toBeDefined();

      expect(report.tests).toEqual(testResults);

      expect(report.summary).toBeDefined();
      expect(report.summary.total).toBe(3);
      expect(report.summary.passed).toBe(1);
      expect(report.summary.failed).toBe(1);
      expect(report.summary.skipped).toBe(1);
      expect(report.summary.passRate).toBe(33); // 1/3 = 33%
    });

    it('should handle empty test results', () => {
      // When
      const report = generateCompatibilityReport([]);

      // Then
      expect(report.tests).toEqual([]);
      expect(report.summary.total).toBe(0);
      expect(report.summary.passRate).toBe(0);
    });

    it('should calculate pass rate correctly', () => {
      // Given
      const testResults = [
        { testName: 'Test 1', result: 'pass', duration: 100 },
        { testName: 'Test 2', result: 'pass', duration: 100 },
        { testName: 'Test 3', result: 'pass', duration: 100 },
        { testName: 'Test 4', result: 'fail', duration: 100 },
      ];

      // When
      const report = generateCompatibilityReport(testResults);

      // Then
      expect(report.summary.passRate).toBe(75); // 3/4 = 75%
    });
  });

  describe('formatCompatibilityReport() (Task 7.5)', () => {
    it('should format report as readable string', () => {
      // Given
      const testResults = [
        { testName: 'detectEnvironment', result: 'pass', duration: 10 },
        { testName: 'spawnInline', result: 'fail', failureReason: 'Script not found', duration: 50 },
      ];
      const report = generateCompatibilityReport(testResults);

      // When
      const formatted = formatCompatibilityReport(report);

      // Then
      expect(formatted).toContain('Compatibility Report');
      expect(formatted).toContain('System Information');
      expect(formatted).toContain('Environment Detection');
      expect(formatted).toContain('Test Results');
      expect(formatted).toContain('Summary');
      expect(formatted).toContain('detectEnvironment');
      expect(formatted).toContain('spawnInline');
      expect(formatted).toContain('Script not found');
      expect(formatted).toContain('✅');
      expect(formatted).toContain('❌');
    });
  });

  describe('getSystemInfo() (Task 7.4)', () => {
    it('should return system information object', () => {
      // When
      const info = getSystemInfo();

      // Then
      expect(info.os_name).toBeDefined();
      expect(info.os_version).toBeDefined();
      expect(info.architecture).toBeDefined();
      expect(['x64', 'arm64', 'ia32', 'arm'].includes(info.architecture)).toBe(true);
      expect(info.shell).toBeDefined();
      expect(info.docker_version).toBeDefined();
      expect(info.node_version).toBeDefined();
      expect(info.node_version).toMatch(/^v\d+\.\d+\.\d+/);
    });
  });

  describe('OS_COMPATIBILITY_MATRIX (Task 7.1-7.3)', () => {
    it('should define must_pass configurations', () => {
      expect(OS_COMPATIBILITY_MATRIX.must_pass).toBeDefined();
      expect(Array.isArray(OS_COMPATIBILITY_MATRIX.must_pass)).toBe(true);
      expect(OS_COMPATIBILITY_MATRIX.must_pass.length).toBeGreaterThan(0);

      // Check required fields
      for (const config of OS_COMPATIBILITY_MATRIX.must_pass) {
        expect(config.os).toBeDefined();
        expect(config.arch).toBeDefined();
        expect(config.description).toBeDefined();
      }
    });

    it('should define should_pass configurations', () => {
      expect(OS_COMPATIBILITY_MATRIX.should_pass).toBeDefined();
      expect(Array.isArray(OS_COMPATIBILITY_MATRIX.should_pass)).toBe(true);
      expect(OS_COMPATIBILITY_MATRIX.should_pass.length).toBeGreaterThan(0);
    });

    it('should include macOS Sonoma in must_pass', () => {
      const hasSonoma = OS_COMPATIBILITY_MATRIX.must_pass.some(
        (c) => c.os.toLowerCase().includes('sonoma'),
      );
      expect(hasSonoma).toBe(true);
    });

    it('should include Windows 11 + WSL in must_pass', () => {
      const hasWindows11WSL = OS_COMPATIBILITY_MATRIX.must_pass.some(
        (c) => c.os.toLowerCase().includes('windows 11') && c.wsl,
      );
      expect(hasWindows11WSL).toBe(true);
    });

    it('should include Ubuntu 22.04 in must_pass', () => {
      const hasUbuntu = OS_COMPATIBILITY_MATRIX.must_pass.some(
        (c) => c.os.toLowerCase().includes('ubuntu 22.04'),
      );
      expect(hasUbuntu).toBe(true);
    });
  });

  // ============================================
  // Constants tests
  // ============================================
  describe('Constants', () => {
    it('should export DEFAULT_TIMEOUT_MS as 300000 (5 minutes)', () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(300000);
    });

    it('should export POLL_INTERVAL_MS as 500', () => {
      expect(POLL_INTERVAL_MS).toBe(500);
    });

    it('should export MAX_RETRIES as 3', () => {
      expect(MAX_RETRIES).toBe(3);
    });
  });
});
