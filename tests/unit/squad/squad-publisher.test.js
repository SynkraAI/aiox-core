/**
 * Unit Tests for SquadPublisher
 *
 * Test Coverage:
 * - checkAuth() detects gh auth status
 * - publish() validates before publishing
 * - publish() fails without auth
 * - --dry-run doesn't create PR
 * - generatePRBody() includes metadata
 * - Error handling with proper error codes
 *
 * @see Story SQS-6: Download & Publish Tasks
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadPublisher,
  SquadPublisherError,
  PublisherErrorCodes,
  AIOX_SQUADS_REPO,
  SAFE_NAME_PATTERN,
  sanitizeForShell,
  isValidName,
} = require('../../../.aiox-core/development/scripts/squad');

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
}));

const { execSync } = require('child_process');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');
const TEMP_PATH = path.join(__dirname, 'temp-publish');

describe('SquadPublisher', () => {
  let publisher;
  let consoleLogSpy;

  beforeEach(async () => {
    // Create publisher
    publisher = new SquadPublisher({
      verbose: false,
      dryRun: false,
    });

    // Spy on console
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    await fs.mkdir(TEMP_PATH, { recursive: true });

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  describe('Constants', () => {
    it('should export AIOX_SQUADS_REPO', () => {
      expect(AIOX_SQUADS_REPO).toBe('SynkraAI/aiox-squads');
    });

    it('should export PublisherErrorCodes enum', () => {
      expect(PublisherErrorCodes).toBeDefined();
      expect(PublisherErrorCodes.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(PublisherErrorCodes.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
      expect(PublisherErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(PublisherErrorCodes.MANIFEST_ERROR).toBe('MANIFEST_ERROR');
      expect(PublisherErrorCodes.PR_ERROR).toBe('PR_ERROR');
      expect(PublisherErrorCodes.INVALID_SQUAD_NAME).toBe('INVALID_SQUAD_NAME');
    });

    it('should export SAFE_NAME_PATTERN', () => {
      expect(SAFE_NAME_PATTERN).toBeDefined();
      expect(SAFE_NAME_PATTERN).toBeInstanceOf(RegExp);
    });
  });

  describe('sanitizeForShell()', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeForShell(null)).toBe('');
      expect(sanitizeForShell(undefined)).toBe('');
      expect(sanitizeForShell('')).toBe('');
    });

    it('should keep safe characters unchanged', () => {
      expect(sanitizeForShell('my-squad')).toBe('my-squad');
      expect(sanitizeForShell('squad_v1.0')).toBe('squad_v1.0');
      expect(sanitizeForShell('test123')).toBe('test123');
    });

    it('should replace unsafe characters with hyphens', () => {
      expect(sanitizeForShell('my squad')).toBe('my-squad');
      expect(sanitizeForShell('test$squad')).toBe('test-squad');
      expect(sanitizeForShell('test;rm -rf /')).toBe('test-rm-rf');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeForShell('my---squad')).toBe('my-squad');
      expect(sanitizeForShell('test   squad')).toBe('test-squad');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(sanitizeForShell('-squad-')).toBe('squad');
      expect(sanitizeForShell('--test--')).toBe('test');
    });
  });

  describe('isValidName()', () => {
    it('should return true for valid names', () => {
      expect(isValidName('my-squad')).toBe(true);
      expect(isValidName('squad_v1.0')).toBe(true);
      expect(isValidName('test123')).toBe(true);
      expect(isValidName('Squad-Name_v2.1.0')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(isValidName('my squad')).toBe(false);
      expect(isValidName('test;rm')).toBe(false);
      expect(isValidName('test$var')).toBe(false);
      expect(isValidName('test\nline')).toBe(false);
    });

    it('should return false for null/undefined/empty', () => {
      expect(isValidName(null)).toBe(false);
      expect(isValidName(undefined)).toBe(false);
      expect(isValidName('')).toBe(false);
    });
  });

  describe('Constructor', () => {
    it('should disable verbose mode by default', () => {
      const defaultPublisher = new SquadPublisher();
      expect(defaultPublisher.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      const verbosePublisher = new SquadPublisher({ verbose: true });
      expect(verbosePublisher.verbose).toBe(true);
    });

    it('should disable dry run by default', () => {
      const defaultPublisher = new SquadPublisher();
      expect(defaultPublisher.dryRun).toBe(false);
    });

    it('should enable dry run when specified', () => {
      const dryRunPublisher = new SquadPublisher({ dryRun: true });
      expect(dryRunPublisher.dryRun).toBe(true);
    });

    it('should use default repo when not specified', () => {
      const defaultPublisher = new SquadPublisher();
      expect(defaultPublisher.repo).toBe(AIOX_SQUADS_REPO);
    });

    it('should use custom repo when specified', () => {
      const customPublisher = new SquadPublisher({ repo: 'custom/repo' });
      expect(customPublisher.repo).toBe('custom/repo');
    });
  });

  describe('SquadPublisherError', () => {
    it('should create error with code and message', () => {
      const error = new SquadPublisherError(
        PublisherErrorCodes.AUTH_REQUIRED,
        'Not authenticated',
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('AUTH_REQUIRED');
      expect(error.message).toBe('Not authenticated');
      expect(error.name).toBe('SquadPublisherError');
    });

    it('should include suggestion in error', () => {
      const error = new SquadPublisherError(
        PublisherErrorCodes.AUTH_REQUIRED,
        'Not authenticated',
        'Run: gh auth login',
      );

      expect(error.suggestion).toBe('Run: gh auth login');
    });

    it('should format toString() with suggestion', () => {
      const error = new SquadPublisherError(
        PublisherErrorCodes.AUTH_REQUIRED,
        'Not authenticated',
        'Run: gh auth login',
      );

      const str = error.toString();
      expect(str).toContain('[AUTH_REQUIRED]');
      expect(str).toContain('Not authenticated');
      expect(str).toContain('Suggestion: Run: gh auth login');
    });
  });

  describe('checkAuth()', () => {
    it('should return authenticated=true when gh auth succeeds (Test 3.7)', async () => {
      execSync.mockReturnValue('Logged in to github.com as testuser');

      const result = await publisher.checkAuth();

      expect(result.authenticated).toBe(true);
      expect(execSync).toHaveBeenCalledWith('gh auth status', expect.any(Object));
    });

    it('should extract username from gh auth output', async () => {
      execSync.mockReturnValue('Logged in to github.com as myusername');

      const result = await publisher.checkAuth();

      expect(result.username).toBe('myusername');
    });

    it('should return authenticated=false when gh auth fails', async () => {
      execSync.mockImplementation(() => {
        throw new Error('You are not logged in');
      });

      const result = await publisher.checkAuth();

      expect(result.authenticated).toBe(false);
      expect(result.username).toBeNull();
    });
  });

  describe('publish()', () => {
    it('should throw SQUAD_NOT_FOUND for non-existent path (Test 3.8)', async () => {
      await expect(publisher.publish('/non/existent/path')).rejects.toThrow(
        SquadPublisherError,
      );
      await expect(publisher.publish('/non/existent/path')).rejects.toMatchObject({
        code: 'SQUAD_NOT_FOUND',
      });
    });

    it('should validate squad before publishing (Test 3.8)', async () => {
      // Create invalid squad (missing manifest)
      const invalidSquadPath = path.join(TEMP_PATH, 'invalid-squad');
      await fs.mkdir(invalidSquadPath, { recursive: true });
      // No squad.yaml - validation will fail

      await expect(publisher.publish(invalidSquadPath)).rejects.toThrow(
        SquadPublisherError,
      );
      await expect(publisher.publish(invalidSquadPath)).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
      });
    });

    it('should fail without auth (Test 3.9)', async () => {
      // Create valid squad
      const validSquadPath = path.join(FIXTURES_PATH, 'valid-squad');

      // Mock auth to fail
      execSync.mockImplementation((cmd) => {
        if (cmd === 'gh auth status') {
          throw new Error('Not logged in');
        }
        return '';
      });

      await expect(publisher.publish(validSquadPath)).rejects.toThrow(
        SquadPublisherError,
      );
      await expect(publisher.publish(validSquadPath)).rejects.toMatchObject({
        code: 'AUTH_REQUIRED',
      });
    });

    it('should not create PR in dry run mode (Test 3.10)', async () => {
      // Create valid squad
      const validSquadPath = path.join(FIXTURES_PATH, 'valid-squad');

      // Create dry run publisher
      const dryRunPublisher = new SquadPublisher({ dryRun: true });

      // Mock auth success
      execSync.mockReturnValue('Logged in to github.com as testuser');

      const result = await dryRunPublisher.publish(validSquadPath);

      expect(result.prUrl).toBe('[dry-run] PR would be created');
      expect(result.branch).toContain('squad/');
      expect(result.manifest).toBeDefined();
      expect(result.preview).toBeDefined();
      expect(result.preview.title).toContain('Add squad:');
    });

    it('should return preview in dry run mode', async () => {
      const validSquadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const dryRunPublisher = new SquadPublisher({ dryRun: true });

      execSync.mockReturnValue('Logged in to github.com as testuser');

      const result = await dryRunPublisher.publish(validSquadPath);

      expect(result.preview.repo).toBe(AIOX_SQUADS_REPO);
      expect(result.preview.category).toBe('community');
      expect(result.preview.body).toBeDefined();
    });
  });

  describe('generatePRBody()', () => {
    it('should include squad name in PR body (Test 3.11)', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
        author: 'Test Author',
        description: 'A test squad',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('## New Squad: test-squad');
    });

    it('should include version in PR body', () => {
      const manifest = {
        name: 'test-squad',
        version: '2.1.0',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('**Version:** 2.1.0');
    });

    it('should include author in PR body', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
        author: 'Developer Name',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('**Author:** Developer Name');
    });

    it('should include description in PR body', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
        description: 'This squad does amazing things',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('This squad does amazing things');
    });

    it('should include components count in PR body', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
        components: {
          tasks: ['task1.md', 'task2.md', 'task3.md'],
          agents: ['agent1.md'],
          workflows: ['workflow1.md', 'workflow2.md'],
        },
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('| Tasks | 3 |');
      expect(body).toContain('| Agents | 1 |');
      expect(body).toContain('| Workflows | 2 |');
    });

    it('should handle missing components gracefully', () => {
      const manifest = {
        name: 'minimal-squad',
        version: '1.0.0',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('| Tasks | 0 |');
      expect(body).toContain('| Agents | 0 |');
    });

    it('should use default values for missing fields', () => {
      const manifest = {
        name: 'minimal-squad',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('**Version:** 1.0.0');
      expect(body).toContain('**Author:** Unknown');
      expect(body).toContain('No description provided');
    });

    it('should include category in PR body', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
      };

      const body = publisher.generatePRBody(manifest, 'community');

      expect(body).toContain('**Category:** community');
    });

    it('should include checklist in PR body', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('### Pre-submission Checklist');
      expect(body).toContain('[x] Squad follows AIOX task-first architecture');
      expect(body).toContain('[ ] No sensitive data included');
    });

    it('should include submit attribution', () => {
      const manifest = {
        name: 'test-squad',
        version: '1.0.0',
      };

      const body = publisher.generatePRBody(manifest);

      expect(body).toContain('*publish-squad');
      expect(body).toContain('AIOX-FullStack');
    });
  });

  describe('Verbose mode', () => {
    it('should log messages in verbose mode', async () => {
      const verbosePublisher = new SquadPublisher({
        verbose: true,
        dryRun: true,
      });

      execSync.mockReturnValue('Logged in to github.com as testuser');

      const validSquadPath = path.join(FIXTURES_PATH, 'valid-squad');
      await verbosePublisher.publish(validSquadPath);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some((call) => call[0].includes('[SquadPublisher]'))).toBe(
        true,
      );
    });

    it('should not log messages when verbose is false', async () => {
      const quietPublisher = new SquadPublisher({
        verbose: false,
        dryRun: true,
      });

      execSync.mockReturnValue('Logged in to github.com as testuser');

      const validSquadPath = path.join(FIXTURES_PATH, 'valid-squad');
      await quietPublisher.publish(validSquadPath);

      expect(
        consoleLogSpy.mock.calls.filter((call) => call[0].includes('[SquadPublisher]')).length,
      ).toBe(0);
    });
  });

  describe('_updateRegistry()', () => {
    it('should add new squad to registry', async () => {
      const registryPath = path.join(TEMP_PATH, 'registry.json');
      await fs.writeFile(
        registryPath,
        JSON.stringify({
          version: '1.0.0',
          squads: {
            official: [],
            community: [],
          },
        }),
      );

      const manifest = {
        name: 'new-squad',
        version: '1.0.0',
        description: 'A new squad',
        author: 'Test Author',
      };

      await publisher._updateRegistry(registryPath, manifest);

      const content = JSON.parse(await fs.readFile(registryPath, 'utf-8'));
      expect(content.squads.community).toHaveLength(1);
      expect(content.squads.community[0].name).toBe('new-squad');
    });

    it('should update existing squad in registry', async () => {
      const registryPath = path.join(TEMP_PATH, 'registry.json');
      await fs.writeFile(
        registryPath,
        JSON.stringify({
          version: '1.0.0',
          squads: {
            official: [],
            community: [
              {
                name: 'existing-squad',
                version: '1.0.0',
                description: 'Old description',
              },
            ],
          },
        }),
      );

      const manifest = {
        name: 'existing-squad',
        version: '2.0.0',
        description: 'Updated description',
        author: 'Test Author',
      };

      await publisher._updateRegistry(registryPath, manifest);

      const content = JSON.parse(await fs.readFile(registryPath, 'utf-8'));
      expect(content.squads.community).toHaveLength(1);
      expect(content.squads.community[0].version).toBe('2.0.0');
      expect(content.squads.community[0].description).toBe('Updated description');
    });

    it('should sort squads alphabetically', async () => {
      const registryPath = path.join(TEMP_PATH, 'registry.json');
      await fs.writeFile(
        registryPath,
        JSON.stringify({
          version: '1.0.0',
          squads: {
            official: [],
            community: [{ name: 'z-squad', version: '1.0.0' }],
          },
        }),
      );

      const manifest = {
        name: 'a-squad',
        version: '1.0.0',
      };

      await publisher._updateRegistry(registryPath, manifest);

      const content = JSON.parse(await fs.readFile(registryPath, 'utf-8'));
      expect(content.squads.community[0].name).toBe('a-squad');
      expect(content.squads.community[1].name).toBe('z-squad');
    });

    it('should create registry structure if missing', async () => {
      const registryPath = path.join(TEMP_PATH, 'new-registry.json');

      const manifest = {
        name: 'first-squad',
        version: '1.0.0',
      };

      await publisher._updateRegistry(registryPath, manifest);

      const content = JSON.parse(await fs.readFile(registryPath, 'utf-8'));
      expect(content.version).toBe('1.0.0');
      expect(content.squads.community).toHaveLength(1);
    });
  });

  describe('_pathExists()', () => {
    it('should return true for existing path', async () => {
      const result = await publisher._pathExists(TEMP_PATH);
      expect(result).toBe(true);
    });

    it('should return false for non-existing path', async () => {
      const result = await publisher._pathExists('/non/existent/path');
      expect(result).toBe(false);
    });
  });

  describe('_copyDir()', () => {
    it('should copy directory recursively', async () => {
      // Create source directory with files
      const srcDir = path.join(TEMP_PATH, 'src');
      const destDir = path.join(TEMP_PATH, 'dest');

      await fs.mkdir(srcDir, { recursive: true });
      await fs.mkdir(path.join(srcDir, 'subdir'), { recursive: true });
      await fs.writeFile(path.join(srcDir, 'file1.txt'), 'content1');
      await fs.writeFile(path.join(srcDir, 'subdir', 'file2.txt'), 'content2');

      await publisher._copyDir(srcDir, destDir);

      // Verify files were copied
      const file1 = await fs.readFile(path.join(destDir, 'file1.txt'), 'utf-8');
      const file2 = await fs.readFile(path.join(destDir, 'subdir', 'file2.txt'), 'utf-8');

      expect(file1).toBe('content1');
      expect(file2).toBe('content2');
    });
  });
});
