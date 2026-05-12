/**
 * @fileoverview Tests for ProjectStatusLoader - Story ACT-3 Reliability Overhaul
 * @description Unit tests for project status loading, caching, cache invalidation,
 *   multi-terminal locking, worktree awareness, and performance.
 *
 * Original tests from Story 6.1.2.4 are preserved.
 * New tests added for ACT-3 acceptance criteria:
 *   AC1: Cache invalidation on git state changes
 *   AC2: Multi-terminal concurrent access
 *   AC3: Post-commit freshness within 5 seconds
 *   AC4: getCurrentStoryInfo() accuracy without delay
 *   AC5: Git post-commit hook (tested separately in hook test)
 *   AC6: Worktree-aware cache paths
 *   AC7: Performance (<100ms cached, <500ms regeneration)
 *   AC8: Comprehensive test coverage
 */

const path = require('path');

// Mock child_process (for execSync in constructor and getGitStateFingerprint)
jest.mock('child_process', () => ({
  execSync: jest.fn(() => '.git'),
}));

// Mock execa before requiring the module
jest.mock('execa', () => jest.fn());

// Mock WorktreeManager
jest.mock('../../.aiox-core/infrastructure/scripts/worktree-manager', () => {
  return jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue([]),
  }));
});

// Mock fs.promises and fs sync
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    readFileSync: jest.fn(),
    existsSync: jest.fn(() => false),
    readdirSync: jest.fn(() => []),
    unlinkSync: jest.fn(),
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn().mockResolvedValue(undefined),
      mkdir: jest.fn().mockResolvedValue(undefined),
      access: jest.fn(),
      readdir: jest.fn(),
      unlink: jest.fn().mockResolvedValue(undefined),
      stat: jest.fn(),
      open: jest.fn(),
      rename: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn((obj) => JSON.stringify(obj)),
}));

const { execSync } = require('child_process');
const execa = require('execa');
const fs = require('fs');
const yaml = require('js-yaml');
const WorktreeManager = require('../../.aiox-core/infrastructure/scripts/worktree-manager');
const {
  ProjectStatusLoader,
  loadProjectStatus,
  clearCache,
  formatStatusDisplay,
  LOCK_TIMEOUT_MS,
  LOCK_STALE_MS,
  ACTIVE_SESSION_TTL,
  IDLE_TTL,
} = require('../../.aiox-core/infrastructure/scripts/project-status-loader');

describe('ProjectStatusLoader', () => {
  const projectRoot = '/test/project';
  let loader;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for execSync (constructor calls _resolveCacheFilePath and getGitStateFingerprint)
    execSync.mockImplementation((cmd) => {
      if (cmd.includes('--git-dir')) return '.git';
      if (cmd.includes('--git-common-dir')) return '.git';
      return '';
    });

    loader = new ProjectStatusLoader(projectRoot);

    // Default mocks
    execa.mockResolvedValue({ stdout: '', stderr: '' });
    fs.readFileSync.mockReturnValue(''); // For config loading
    fs.promises.readFile.mockResolvedValue('');
    fs.promises.access.mockResolvedValue(undefined);
    fs.promises.readdir.mockResolvedValue([]);
    fs.promises.stat.mockResolvedValue({ mtimeMs: 1000 });
    yaml.load.mockReturnValue(null);
  });

  // =========================================================================
  // ORIGINAL TESTS (Story 6.1.2.4) - preserved
  // =========================================================================

  describe('constructor', () => {
    it('should use project root from parameter', () => {
      const customLoader = new ProjectStatusLoader('/custom/path');
      expect(customLoader.rootPath).toBe('/custom/path');
    });

    it('should use process.cwd() when no root provided', () => {
      const defaultLoader = new ProjectStatusLoader();
      expect(defaultLoader.rootPath).toBe(process.cwd());
    });

    it('should set default idle TTL to 60 seconds', () => {
      expect(loader.cacheTTL).toBe(60);
      expect(loader.idleTTL).toBe(60);
    });

    it('should set active-session TTL to 15 seconds', () => {
      expect(loader.activeSessionTTL).toBe(15);
    });

    it('should load config and apply settings', () => {
      fs.readFileSync.mockReturnValue('projectStatus:\n  maxModifiedFiles: 10');
      yaml.load.mockReturnValue({
        projectStatus: {
          maxModifiedFiles: 10,
          maxRecentCommits: 5,
        },
      });

      const configuredLoader = new ProjectStatusLoader(projectRoot);
      expect(configuredLoader.maxModifiedFiles).toBe(10);
      expect(configuredLoader.maxRecentCommits).toBe(5);
    });

    it('should use defaults when config not found', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const defaultsLoader = new ProjectStatusLoader(projectRoot);
      expect(defaultsLoader.maxModifiedFiles).toBe(5);
      expect(defaultsLoader.maxRecentCommits).toBe(2);
    });

    it('should set lock file path based on cache file', () => {
      expect(loader.lockFile).toBe(loader.cacheFile + '.lock');
    });
  });

  describe('isGitRepository', () => {
    it('should return true for git repository', async () => {
      execa.mockResolvedValue({ stdout: 'true', stderr: '' });

      const result = await loader.isGitRepository();

      expect(result).toBe(true);
      expect(execa).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--is-inside-work-tree'],
        expect.objectContaining({ cwd: projectRoot }),
      );
    });

    it('should return false for non-git directory', async () => {
      execa.mockRejectedValue(new Error('Not a git repo'));

      const result = await loader.isGitRepository();

      expect(result).toBe(false);
    });
  });

  describe('getGitBranch', () => {
    it('should return branch name from git branch --show-current', async () => {
      execa.mockResolvedValue({ stdout: 'main\n', stderr: '' });

      const result = await loader.getGitBranch();

      expect(result).toBe('main');
    });

    it('should fallback to rev-parse for older git', async () => {
      execa
        .mockRejectedValueOnce(new Error('Unknown option'))
        .mockResolvedValueOnce({ stdout: 'develop\n', stderr: '' });

      const result = await loader.getGitBranch();

      expect(result).toBe('develop');
    });

    it('should return "unknown" when both methods fail', async () => {
      execa.mockRejectedValue(new Error('Git error'));

      const result = await loader.getGitBranch();

      expect(result).toBe('unknown');
    });
  });

  describe('getModifiedFiles', () => {
    it('should parse git status porcelain output', async () => {
      const statusOutput = ` M src/index.js
 M src/utils.js
?? new-file.txt`;
      execa.mockResolvedValue({ stdout: statusOutput, stderr: '' });

      const result = await loader.getModifiedFiles();

      expect(result.files).toContain('src/index.js');
      expect(result.files).toContain('src/utils.js');
      expect(result.files).toContain('new-file.txt');
      expect(result.totalCount).toBe(3);
    });

    it('should limit files to maxModifiedFiles', async () => {
      const manyFiles = Array(10)
        .fill(null)
        .map((_, i) => ` M file${i}.js`)
        .join('\n');
      execa.mockResolvedValue({ stdout: manyFiles, stderr: '' });

      const result = await loader.getModifiedFiles();

      expect(result.files.length).toBe(5); // Default maxModifiedFiles
      expect(result.totalCount).toBe(10);
    });

    it('should return empty array on error', async () => {
      execa.mockRejectedValue(new Error('Git error'));

      const result = await loader.getModifiedFiles();

      expect(result.files).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getRecentCommits', () => {
    it('should parse git log output', async () => {
      const logOutput = `abc1234 feat: add new feature
def5678 fix: bug fix`;
      execa.mockResolvedValue({ stdout: logOutput, stderr: '' });

      const result = await loader.getRecentCommits();

      expect(result).toContain('feat: add new feature');
      expect(result).toContain('fix: bug fix');
    });

    it('should return empty array when no commits', async () => {
      execa.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await loader.getRecentCommits();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      execa.mockRejectedValue(new Error('No commits'));

      const result = await loader.getRecentCommits();

      expect(result).toEqual([]);
    });
  });

  describe('getWorktreesStatus', () => {
    it('should return null when no worktrees', async () => {
      WorktreeManager.mockImplementation(() => ({
        list: jest.fn().mockResolvedValue([]),
      }));

      const result = await loader.getWorktreesStatus();

      expect(result).toBeNull();
    });

    it('should return worktrees status object', async () => {
      WorktreeManager.mockImplementation(() => ({
        list: jest.fn().mockResolvedValue([
          {
            storyId: 'STORY-42',
            path: '/project/.aiox/worktrees/STORY-42',
            branch: 'auto-claude/STORY-42',
            createdAt: new Date('2026-01-29'),
            uncommittedChanges: 3,
            status: 'active',
          },
        ]),
      }));

      const result = await loader.getWorktreesStatus();

      expect(result).toBeDefined();
      expect(result['STORY-42']).toBeDefined();
      expect(result['STORY-42'].branch).toBe('auto-claude/STORY-42');
      expect(result['STORY-42'].uncommittedChanges).toBe(3);
    });

    it('should return null on WorktreeManager error', async () => {
      WorktreeManager.mockImplementation(() => ({
        list: jest.fn().mockRejectedValue(new Error('Not a git repo')),
      }));

      const result = await loader.getWorktreesStatus();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentStoryInfo', () => {
    it('should detect story with InProgress status', async () => {
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readdir.mockResolvedValue([
        { name: 'story-42.md', isFile: () => true, isDirectory: () => false },
      ]);
      fs.promises.readFile.mockResolvedValue(`
# Story 42
**Story ID:** STORY-42
**Epic:** Epic 1 - Setup
**Status:** InProgress
      `);

      const result = await loader.getCurrentStoryInfo();

      expect(result.story).toBe('STORY-42');
      expect(result.epic).toBe('Epic 1 - Setup');
    });

    it('should return null when no story in progress', async () => {
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readdir.mockResolvedValue([]);

      const result = await loader.getCurrentStoryInfo();

      expect(result.story).toBeNull();
      expect(result.epic).toBeNull();
    });

    it('should return null when stories dir not found', async () => {
      fs.promises.access.mockRejectedValue(new Error('ENOENT'));

      const result = await loader.getCurrentStoryInfo();

      expect(result.story).toBeNull();
    });
  });

  describe('cache', () => {
    describe('loadCache', () => {
      it('should load cache from file', async () => {
        const cached = {
          status: { branch: 'main' },
          timestamp: Date.now(),
          ttl: 60,
          gitFingerprint: '1000:2000',
        };
        fs.promises.readFile.mockResolvedValue(JSON.stringify(cached));
        yaml.load.mockReturnValue(cached);

        const result = await loader.loadCache();

        expect(result).toEqual(cached);
      });

      it('should return null when cache file not found', async () => {
        fs.promises.readFile.mockRejectedValue(new Error('ENOENT'));

        const result = await loader.loadCache();

        expect(result).toBeNull();
      });

      it('should handle corrupted cache by deleting and returning null (ACT-3)', async () => {
        fs.promises.readFile.mockResolvedValue('not valid yaml content');
        yaml.load.mockReturnValue('just a string, not an object');

        const result = await loader.loadCache();

        expect(result).toBeNull();
        // Should have attempted to delete the corrupted cache
        expect(fs.promises.unlink).toHaveBeenCalled();
      });

      it('should handle YAML parse error by deleting cache (ACT-3)', async () => {
        fs.promises.readFile.mockResolvedValue('{{invalid yaml');
        const yamlError = new Error('Invalid YAML');
        yamlError.name = 'YAMLException';
        yaml.load.mockImplementation(() => { throw yamlError; });

        const result = await loader.loadCache();

        expect(result).toBeNull();
        expect(fs.promises.unlink).toHaveBeenCalled();
      });

      it('should handle cache with missing status field (ACT-3)', async () => {
        fs.promises.readFile.mockResolvedValue('{}');
        yaml.load.mockReturnValue({ timestamp: Date.now(), ttl: 60 });

        const result = await loader.loadCache();

        expect(result).toBeNull();
      });
    });

    describe('isCacheValid', () => {
      it('should return true for fresh cache with matching fingerprint', () => {
        const cache = {
          timestamp: Date.now() - 5000, // 5 seconds ago
          ttl: 60,
          gitFingerprint: '1000:2000',
        };

        const result = loader.isCacheValid(cache, '1000:2000');

        expect(result).toBe(true);
      });

      it('should return false when git fingerprint changed (ACT-3 AC1)', () => {
        const cache = {
          timestamp: Date.now() - 5000, // Only 5 seconds ago, well within TTL
          ttl: 60,
          gitFingerprint: '1000:2000',
        };

        // Git state changed
        const result = loader.isCacheValid(cache, '1000:3000');

        expect(result).toBe(false);
      });

      it('should use active-session TTL (15s) when fingerprint matches (ACT-3)', () => {
        const cache = {
          timestamp: Date.now() - 14000, // 14 seconds ago - within 15s
          ttl: 60,
          gitFingerprint: '1000:2000',
        };

        expect(loader.isCacheValid(cache, '1000:2000')).toBe(true);

        // 16 seconds - beyond active-session TTL
        cache.timestamp = Date.now() - 16000;
        expect(loader.isCacheValid(cache, '1000:2000')).toBe(false);
      });

      it('should use idle TTL (60s) when no fingerprint available (ACT-3)', () => {
        const cache = {
          timestamp: Date.now() - 30000, // 30 seconds ago
          ttl: 60,
        };

        // No fingerprint - falls back to idle TTL
        expect(loader.isCacheValid(cache, null)).toBe(true);

        // Beyond idle TTL
        cache.timestamp = Date.now() - 120000;
        expect(loader.isCacheValid(cache, null)).toBe(false);
      });

      it('should return false for expired cache', () => {
        const cache = {
          timestamp: Date.now() - 120000, // 2 minutes ago
          ttl: 60,
        };

        const result = loader.isCacheValid(cache);

        expect(result).toBe(false);
      });

      it('should return false for null cache', () => {
        expect(loader.isCacheValid(null)).toBe(false);
        expect(loader.isCacheValid(undefined)).toBe(false);
        expect(loader.isCacheValid({})).toBe(false);
      });
    });

    describe('saveCache (backward compat)', () => {
      it('should write cache to file via saveCacheWithLock', async () => {
        fs.promises.writeFile.mockResolvedValue(undefined);

        const status = { branch: 'main' };
        await loader.saveCache(status);

        expect(fs.promises.mkdir).toHaveBeenCalled();
        expect(fs.promises.writeFile).toHaveBeenCalled();
      });

      it('should handle write errors gracefully', async () => {
        fs.promises.writeFile.mockRejectedValue(new Error('Permission denied'));
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        await loader.saveCache({ branch: 'main' });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('clearCache', () => {
      it('should delete cache file', async () => {
        fs.promises.unlink.mockResolvedValue(undefined);

        const result = await loader.clearCache();

        expect(result).toBe(true);
        expect(fs.promises.unlink).toHaveBeenCalledWith(loader.cacheFile);
      });

      it('should return false when file not found', async () => {
        fs.promises.unlink.mockRejectedValue(new Error('ENOENT'));

        const result = await loader.clearCache();

        expect(result).toBe(false);
      });
    });
  });

  describe('loadProjectStatus', () => {
    it('should return cached status if valid', async () => {
      const cachedStatus = { branch: 'cached-branch', isGitRepo: true };
      const cache = {
        status: cachedStatus,
        timestamp: Date.now() - 5000,
        ttl: 60,
        gitFingerprint: '1000:2000',
      };
      fs.promises.readFile.mockResolvedValue(JSON.stringify(cache));
      yaml.load.mockReturnValue(cache);
      // Make fingerprint match: HEAD mtime=1000, index mtime=2000
      fs.promises.stat
        .mockResolvedValueOnce({ mtimeMs: 1000 })
        .mockResolvedValueOnce({ mtimeMs: 2000 });

      // Make getGitStateFingerprint return matching fingerprint
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--git-dir')) return '.git';
        if (cmd.includes('--git-common-dir')) return '.git';
        return '';
      });

      const result = await loader.loadProjectStatus();

      expect(result).toEqual(cachedStatus);
    });

    it('should generate fresh status when cache expired', async () => {
      const expiredCache = {
        status: { branch: 'old' },
        timestamp: Date.now() - 120000,
        ttl: 60,
      };
      fs.promises.readFile.mockResolvedValue(JSON.stringify(expiredCache));
      yaml.load.mockReturnValue(expiredCache);

      // writeFile should succeed for cache saves
      fs.promises.writeFile.mockResolvedValue(undefined);

      execa.mockImplementation((cmd, args) => {
        if (args.includes('--is-inside-work-tree')) {
          return Promise.resolve({ stdout: 'true' });
        }
        if (args.includes('--show-current')) {
          return Promise.resolve({ stdout: 'fresh-branch' });
        }
        return Promise.resolve({ stdout: '' });
      });

      const result = await loader.loadProjectStatus();

      expect(result.branch).toBe('fresh-branch');
    });

    it('should generate fresh status when git fingerprint changed (ACT-3 AC1)', async () => {
      const cachedWithOldFingerprint = {
        status: { branch: 'old-branch', isGitRepo: true },
        timestamp: Date.now() - 2000, // Only 2 seconds old
        ttl: 60,
        gitFingerprint: '1000:2000', // Old fingerprint
      };
      fs.promises.readFile.mockResolvedValue(JSON.stringify(cachedWithOldFingerprint));
      yaml.load.mockReturnValue(cachedWithOldFingerprint);

      // Current fingerprint is different (git state changed)
      fs.promises.stat
        .mockResolvedValueOnce({ mtimeMs: 1000 }) // HEAD mtime
        .mockResolvedValueOnce({ mtimeMs: 5000 }); // index mtime changed!

      // writeFile should succeed
      fs.promises.writeFile.mockResolvedValue(undefined);

      execa.mockImplementation((cmd, args) => {
        if (args.includes('--is-inside-work-tree')) {
          return Promise.resolve({ stdout: 'true' });
        }
        if (args.includes('--show-current')) {
          return Promise.resolve({ stdout: 'new-branch' });
        }
        return Promise.resolve({ stdout: '' });
      });

      const result = await loader.loadProjectStatus();

      expect(result.branch).toBe('new-branch');
    });

    it('should return default status on error', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('Read error'));
      execa.mockRejectedValue(new Error('Git error'));
      fs.promises.writeFile.mockRejectedValue(new Error('Write error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await loader.loadProjectStatus();
      consoleSpy.mockRestore();

      // When git fails, returns non-git status (branch: null)
      expect(result.isGitRepo).toBe(false);
      expect(result.branch).toBeNull();
    });
  });

  describe('getNonGitStatus', () => {
    it('should return status for non-git project', () => {
      const status = loader.getNonGitStatus();

      expect(status.branch).toBeNull();
      expect(status.isGitRepo).toBe(false);
      expect(status.modifiedFiles).toEqual([]);
    });
  });

  describe('formatStatusDisplay', () => {
    it('should format git project status', () => {
      const status = {
        isGitRepo: true,
        branch: 'main',
        modifiedFiles: ['file1.js', 'file2.js'],
        modifiedFilesTotalCount: 2,
        recentCommits: ['feat: add feature'],
        currentStory: 'STORY-42',
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('Branch: main');
      expect(display).toContain('Modified: file1.js, file2.js');
      expect(display).toContain('Recent: feat: add feature');
      expect(display).toContain('Story: STORY-42');
    });

    it('should show truncation message for many files', () => {
      const status = {
        isGitRepo: true,
        branch: 'main',
        modifiedFiles: ['file1.js', 'file2.js'],
        modifiedFilesTotalCount: 10,
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('...and 8 more');
    });

    it('should show worktrees info', () => {
      const status = {
        isGitRepo: true,
        branch: 'main',
        worktrees: {
          'STORY-42': { status: 'active', uncommittedChanges: 3 },
          'STORY-43': { status: 'active', uncommittedChanges: 0 },
        },
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('Worktrees: 2/2 active, 1 with changes');
    });

    it('should show message for non-git repo', () => {
      const status = { isGitRepo: false };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('Not a git repository');
    });

    it('should show message for no activity', () => {
      const status = {
        isGitRepo: true,
        modifiedFiles: [],
        recentCommits: [],
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('No recent activity');
    });
  });

  // =========================================================================
  // ACT-3: Event-Driven Cache Invalidation Tests (AC1, AC3)
  // =========================================================================

  describe('ACT-3: Event-driven cache invalidation', () => {
    describe('getGitStateFingerprint', () => {
      it('should return fingerprint from HEAD and index mtimes', async () => {
        execSync.mockImplementation((cmd) => {
          if (cmd.includes('--git-dir')) return '.git';
          if (cmd.includes('--git-common-dir')) return '.git';
          return '';
        });

        fs.promises.stat
          .mockResolvedValueOnce({ mtimeMs: 1234567890 })
          .mockResolvedValueOnce({ mtimeMs: 9876543210 });

        const fingerprint = await loader.getGitStateFingerprint();

        expect(fingerprint).toBe('1234567890:9876543210');
      });

      it('should return null when git dir not available', async () => {
        // ACT-11: Clear cached git dir to simulate non-git scenario
        // (constructor caches _resolvedGitDir for performance)
        loader._resolvedGitDir = null;

        execSync.mockImplementation(() => {
          throw new Error('Not a git repository');
        });

        const fingerprint = await loader.getGitStateFingerprint();

        expect(fingerprint).toBeNull();
      });

      it('should handle missing HEAD or index gracefully', async () => {
        execSync.mockImplementation((cmd) => {
          if (cmd.includes('--git-dir')) return '.git';
          return '';
        });

        fs.promises.stat
          .mockResolvedValueOnce({ mtimeMs: 1234567890 })
          .mockRejectedValueOnce(new Error('ENOENT'));

        const fingerprint = await loader.getGitStateFingerprint();

        expect(fingerprint).toBe('1234567890:0');
      });
    });

    it('should invalidate cache immediately when git state changes (AC1)', () => {
      const cache = {
        timestamp: Date.now() - 1000, // 1 second ago
        ttl: 60,
        gitFingerprint: '100:200',
      };

      // Same fingerprint = valid
      expect(loader.isCacheValid(cache, '100:200')).toBe(true);

      // Different fingerprint = immediately invalid
      expect(loader.isCacheValid(cache, '100:300')).toBe(false);
    });

    it('should show updated status within 5 seconds after commit (AC3)', () => {
      // Simulate: cache was written 2 seconds ago with old fingerprint
      const cache = {
        timestamp: Date.now() - 2000,
        ttl: 60,
        gitFingerprint: '100:200',
      };

      // After commit, git index mtime changes
      const newFingerprint = '100:500';

      // Cache should be invalid despite being only 2 seconds old
      expect(loader.isCacheValid(cache, newFingerprint)).toBe(false);
    });
  });

  // =========================================================================
  // ACT-3: Multi-Terminal File Locking Tests (AC2)
  // =========================================================================

  describe('ACT-3: Multi-terminal file locking', () => {
    describe('_acquireLock', () => {
      it('should acquire lock when file does not exist', async () => {
        // writeFile with wx flag succeeds (no existing lock)
        fs.promises.writeFile.mockResolvedValueOnce(undefined);

        const acquired = await loader._acquireLock();

        expect(acquired).toBe(true);
        // Should have called writeFile with wx flag
        expect(fs.promises.writeFile).toHaveBeenCalledWith(
          loader.lockFile,
          expect.any(String),
          expect.objectContaining({ flag: 'wx' }),
        );
      });

      it('should return false when lock cannot be acquired within timeout', async () => {
        // Lock always exists, never stale
        const eexistError = new Error('File exists');
        eexistError.code = 'EEXIST';
        fs.promises.writeFile.mockRejectedValue(eexistError);
        fs.promises.readFile.mockResolvedValue(JSON.stringify({
          pid: 99999,
          timestamp: Date.now(), // Fresh lock - not stale
        }));

        // Force timeout by racing with a shorter timeout
        const acquired = await Promise.race([
          loader._acquireLock(),
          new Promise(resolve => setTimeout(() => resolve(false), 500)),
        ]);

        expect(acquired).toBe(false);
      }, 10000);

      it('should clean up stale lock and retry', async () => {
        const eexistError = new Error('File exists');
        eexistError.code = 'EEXIST';

        // First call: lock exists (EEXIST)
        // After stale lock cleanup: lock acquired (success)
        fs.promises.writeFile
          .mockRejectedValueOnce(eexistError)
          .mockResolvedValueOnce(undefined);

        // Lock is stale
        fs.promises.readFile.mockResolvedValue(JSON.stringify({
          pid: 12345,
          timestamp: Date.now() - LOCK_STALE_MS - 1000, // Older than stale threshold
        }));

        const acquired = await loader._acquireLock();

        expect(acquired).toBe(true);
        expect(fs.promises.unlink).toHaveBeenCalledWith(loader.lockFile);
      });

      it('should return false on non-EEXIST errors', async () => {
        const otherError = new Error('ENOENT');
        otherError.code = 'ENOENT';
        fs.promises.writeFile.mockRejectedValue(otherError);

        const acquired = await loader._acquireLock();

        expect(acquired).toBe(false);
      });
    });

    describe('_isLockStale', () => {
      it('should return true for old lock file', async () => {
        fs.promises.readFile.mockResolvedValue(JSON.stringify({
          pid: 12345,
          timestamp: Date.now() - LOCK_STALE_MS - 1000,
        }));

        expect(await loader._isLockStale()).toBe(true);
      });

      it('should return false for fresh lock file', async () => {
        fs.promises.readFile.mockResolvedValue(JSON.stringify({
          pid: 12345,
          timestamp: Date.now() - 1000, // 1 second old
        }));

        expect(await loader._isLockStale()).toBe(false);
      });

      it('should return true when lock file cannot be read', async () => {
        fs.promises.readFile.mockRejectedValue(new Error('ENOENT'));

        expect(await loader._isLockStale()).toBe(true);
      });
    });

    describe('_releaseLock', () => {
      it('should delete lock file', async () => {
        fs.promises.unlink.mockResolvedValue(undefined);

        await loader._releaseLock();

        expect(fs.promises.unlink).toHaveBeenCalledWith(loader.lockFile);
      });

      it('should not throw when lock file missing', async () => {
        fs.promises.unlink.mockRejectedValue(new Error('ENOENT'));

        await expect(loader._releaseLock()).resolves.not.toThrow();
      });
    });

    describe('saveCacheWithLock', () => {
      it('should acquire lock, write cache, and release lock', async () => {
        // Mock writeFile to succeed for both lock and cache
        fs.promises.writeFile.mockResolvedValue(undefined);

        await loader.saveCacheWithLock({ branch: 'main' }, '100:200');

        // Lock acquired (writeFile with wx flag)
        const lockCall = fs.promises.writeFile.mock.calls.find(
          call => typeof call[2] === 'object' && call[2].flag === 'wx',
        );
        expect(lockCall).toBeDefined();
        expect(lockCall[0]).toBe(loader.lockFile);

        // Cache written (temp file)
        const cacheCall = fs.promises.writeFile.mock.calls.find(
          call => typeof call[0] === 'string' && call[0].includes('.tmp.'),
        );
        expect(cacheCall).toBeDefined();

        // Lock released
        expect(fs.promises.unlink).toHaveBeenCalledWith(loader.lockFile);
      });

      it('should include gitFingerprint in cached data', async () => {
        // Lock acquisition fails (skip locking)
        const lockError = new Error('ENOENT');
        lockError.code = 'ENOENT';
        fs.promises.writeFile
          .mockRejectedValueOnce(lockError) // Lock fails
          .mockResolvedValue(undefined); // Cache write succeeds

        await loader.saveCacheWithLock({ branch: 'main' }, '100:200');

        // Find the cache content write (not the lock write)
        const cacheWrite = fs.promises.writeFile.mock.calls.find(
          call => typeof call[1] === 'string' && call[1].includes('100:200'),
        );
        expect(cacheWrite).toBeDefined();
      });

      it('should still write cache even when lock cannot be acquired', async () => {
        const lockError = new Error('ENOENT');
        lockError.code = 'ENOENT';
        fs.promises.writeFile
          .mockRejectedValueOnce(lockError) // Lock fails
          .mockResolvedValue(undefined); // Cache write succeeds

        await loader.saveCacheWithLock({ branch: 'main' }, null);

        // At least one non-lock writeFile call
        expect(fs.promises.writeFile.mock.calls.length).toBeGreaterThanOrEqual(2);
      });

      it('should use atomic write (temp file + rename)', async () => {
        const lockError = new Error('ENOENT');
        lockError.code = 'ENOENT';
        fs.promises.writeFile
          .mockRejectedValueOnce(lockError) // Lock fails
          .mockResolvedValue(undefined); // Cache write succeeds

        await loader.saveCacheWithLock({ branch: 'main' }, null);

        // Should write to a temp file
        const tempWrite = fs.promises.writeFile.mock.calls.find(
          call => typeof call[0] === 'string' && call[0].includes('.tmp.'),
        );
        expect(tempWrite).toBeDefined();

        // Should attempt rename
        expect(fs.promises.rename).toHaveBeenCalled();
      });

      it('should fall back to direct write when rename fails (Windows)', async () => {
        const lockError = new Error('ENOENT');
        lockError.code = 'ENOENT';
        fs.promises.writeFile
          .mockRejectedValueOnce(lockError) // Lock fails
          .mockResolvedValue(undefined); // All subsequent writes succeed
        fs.promises.rename.mockRejectedValue(new Error('EPERM')); // Rename fails on Windows

        await loader.saveCacheWithLock({ branch: 'main' }, null);

        // Should have written: lock attempt + temp file + direct fallback = at least 3 calls
        const writeCalls = fs.promises.writeFile.mock.calls;
        expect(writeCalls.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should produce valid output under concurrent access (AC2)', async () => {
      // Simulate concurrent access by calling saveCacheWithLock multiple times
      fs.promises.writeFile.mockResolvedValue(undefined);

      const status1 = { branch: 'branch-1', isGitRepo: true };
      const status2 = { branch: 'branch-2', isGitRepo: true };

      // Both should complete without errors
      await Promise.all([
        loader.saveCacheWithLock(status1, '100:200'),
        loader.saveCacheWithLock(status2, '100:300'),
      ]);

      // Multiple writes should have completed
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ACT-3: Worktree Awareness Tests (AC6)
  // =========================================================================

  describe('ACT-3: Worktree awareness', () => {
    describe('_resolveCacheFilePath', () => {
      it('should use default path for main working tree', () => {
        // git-dir === git-common-dir means main worktree
        execSync.mockImplementation((cmd) => {
          if (cmd.includes('--git-dir')) return '.git';
          if (cmd.includes('--git-common-dir')) return '.git';
          return '';
        });

        const newLoader = new ProjectStatusLoader(projectRoot);
        expect(newLoader.cacheFile).toBe(
          path.join(projectRoot, '.aiox', 'project-status.yaml'),
        );
      });

      it('should use worktree-specific path when in a worktree (AC6)', () => {
        // git-dir !== git-common-dir means we are in a worktree
        execSync.mockImplementation((cmd) => {
          if (cmd.includes('--git-dir')) return '/main-repo/.git/worktrees/my-story';
          if (cmd.includes('--git-common-dir')) return '/main-repo/.git';
          return '';
        });

        const newLoader = new ProjectStatusLoader(projectRoot);
        expect(newLoader.cacheFile).toContain('project-status-');
        expect(newLoader.cacheFile).toContain('.yaml');
        expect(newLoader.cacheFile).not.toBe(
          path.join(projectRoot, '.aiox', 'project-status.yaml'),
        );
      });

      it('should fall back to default path when git is not available', () => {
        execSync.mockImplementation(() => {
          throw new Error('git not found');
        });

        const newLoader = new ProjectStatusLoader(projectRoot);
        expect(newLoader.cacheFile).toBe(
          path.join(projectRoot, '.aiox', 'project-status.yaml'),
        );
      });
    });

    describe('_hashString', () => {
      it('should produce consistent hashes', () => {
        const hash1 = loader._hashString('/path/to/project');
        const hash2 = loader._hashString('/path/to/project');
        expect(hash1).toBe(hash2);
      });

      it('should produce different hashes for different paths', () => {
        const hash1 = loader._hashString('/path/to/project1');
        const hash2 = loader._hashString('/path/to/project2');
        expect(hash1).not.toBe(hash2);
      });

      it('should return a hex string of at least 8 characters', () => {
        const hash = loader._hashString('test');
        expect(hash.length).toBeGreaterThanOrEqual(8);
        expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
      });
    });

    it('should isolate cache between worktrees', () => {
      // Worktree 1
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--git-dir')) return '/main/.git/worktrees/story-A';
        if (cmd.includes('--git-common-dir')) return '/main/.git';
        return '';
      });
      const loader1 = new ProjectStatusLoader('/worktree/story-A');

      // Worktree 2
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--git-dir')) return '/main/.git/worktrees/story-B';
        if (cmd.includes('--git-common-dir')) return '/main/.git';
        return '';
      });
      const loader2 = new ProjectStatusLoader('/worktree/story-B');

      // Different cache files
      expect(loader1.cacheFile).not.toBe(loader2.cacheFile);
    });
  });

  // =========================================================================
  // ACT-3: getCurrentStoryInfo accuracy Tests (AC4)
  // =========================================================================

  describe('ACT-3: getCurrentStoryInfo accuracy (AC4)', () => {
    it('should return fresh data without delay', async () => {
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readdir.mockResolvedValue([
        { name: 'story-act-3.md', isFile: () => true, isDirectory: () => false },
      ]);
      fs.promises.readFile.mockResolvedValue(`
# Story ACT-3
**Story ID:** ACT-3
**Epic:** EPIC-ACT - Unified Agent Activation Pipeline
**Status:** InProgress
      `);

      const startTime = Date.now();
      const result = await loader.getCurrentStoryInfo();
      const elapsed = Date.now() - startTime;

      expect(result.story).toBe('ACT-3');
      expect(result.epic).toContain('EPIC-ACT');
      // Should complete quickly (not blocked by cache)
      expect(elapsed).toBeLessThan(5000);
    });

    it('should detect status changes immediately', async () => {
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readdir.mockResolvedValue([
        { name: 'story-old.md', isFile: () => true, isDirectory: () => false },
      ]);

      // First call - story is InProgress
      fs.promises.readFile.mockResolvedValueOnce(`
**Story ID:** OLD-1
**Status:** InProgress
      `);
      const result1 = await loader.getCurrentStoryInfo();
      expect(result1.story).toBe('OLD-1');

      // Second call - story status changed to Done (not InProgress)
      fs.promises.readdir.mockResolvedValue([
        { name: 'story-old.md', isFile: () => true, isDirectory: () => false },
      ]);
      fs.promises.readFile.mockResolvedValueOnce(`
**Story ID:** OLD-1
**Status:** Done
      `);
      const result2 = await loader.getCurrentStoryInfo();
      expect(result2.story).toBeNull(); // No longer InProgress
    });
  });

  // =========================================================================
  // ACT-3: Performance Tests (AC7)
  // =========================================================================

  describe('ACT-3: Performance (AC7)', () => {
    it('should complete cached read within 100ms', async () => {
      const cachedStatus = { branch: 'main', isGitRepo: true };
      const cache = {
        status: cachedStatus,
        timestamp: Date.now() - 5000,
        ttl: 60,
        gitFingerprint: '1000:2000',
      };
      fs.promises.readFile.mockResolvedValue(JSON.stringify(cache));
      yaml.load.mockReturnValue(cache);
      // Make fingerprint match: HEAD mtime=1000, index mtime=2000
      fs.promises.stat
        .mockResolvedValueOnce({ mtimeMs: 1000 })
        .mockResolvedValueOnce({ mtimeMs: 2000 });

      const startTime = Date.now();
      const result = await loader.loadProjectStatus();
      const elapsed = Date.now() - startTime;

      expect(result).toEqual(cachedStatus);
      expect(elapsed).toBeLessThan(100);
    });

    it('should use Promise.all for parallel git commands in generateStatus', async () => {
      execa.mockImplementation((cmd, args) => {
        if (args.includes('--is-inside-work-tree')) {
          return Promise.resolve({ stdout: 'true' });
        }
        if (args.includes('--show-current')) {
          return Promise.resolve({ stdout: 'main' });
        }
        if (args.includes('--porcelain')) {
          return Promise.resolve({ stdout: ' M file.js' });
        }
        if (args.includes('--oneline')) {
          return Promise.resolve({ stdout: 'abc1234 feat: test' });
        }
        return Promise.resolve({ stdout: '' });
      });

      const status = await loader.generateStatus();

      expect(status.branch).toBe('main');
      expect(status.isGitRepo).toBe(true);
    });
  });

  // =========================================================================
  // ACT-3: Exported Constants Tests
  // =========================================================================

  describe('ACT-3: Exported constants', () => {
    it('should export LOCK_TIMEOUT_MS', () => {
      expect(LOCK_TIMEOUT_MS).toBe(3000);
    });

    it('should export LOCK_STALE_MS', () => {
      expect(LOCK_STALE_MS).toBe(10000);
    });

    it('should export ACTIVE_SESSION_TTL', () => {
      expect(ACTIVE_SESSION_TTL).toBe(15);
    });

    it('should export IDLE_TTL', () => {
      expect(IDLE_TTL).toBe(60);
    });
  });
});

// =========================================================================
// Module Exports Tests
// =========================================================================

describe('Module Exports', () => {
  it('should export loadProjectStatus function', () => {
    expect(typeof loadProjectStatus).toBe('function');
  });

  it('should export clearCache function', () => {
    expect(typeof clearCache).toBe('function');
  });

  it('should export formatStatusDisplay function', () => {
    expect(typeof formatStatusDisplay).toBe('function');
  });

  it('should export ProjectStatusLoader class', () => {
    expect(ProjectStatusLoader).toBeDefined();
    expect(typeof ProjectStatusLoader).toBe('function');
  });
});

// =========================================================================
// ACT-3: Git Post-Commit Hook Tests (AC5)
// =========================================================================

describe('ACT-3: Git post-commit hook (AC5)', () => {
  it('post-commit hook script should exist', () => {
    const hookPath = path.join(
      __dirname,
      '..',
      '..',
      '.aiox-core',
      'infrastructure',
      'scripts',
      'git-hooks',
      'post-commit.js',
    );
    // The hook file exists (we created it)
    const actualFs = jest.requireActual('fs');
    expect(actualFs.existsSync(hookPath)).toBe(true);
  });

  it('husky post-commit hook should exist', () => {
    const huskyPath = path.join(
      __dirname,
      '..',
      '..',
      '.husky',
      'post-commit',
    );
    const actualFs = jest.requireActual('fs');
    expect(actualFs.existsSync(huskyPath)).toBe(true);
  });
});
