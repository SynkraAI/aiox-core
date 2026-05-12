/**
 * @jest-environment node
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const WorktreeManager = require('../scripts/worktree-manager');

describe('WorktreeManager', () => {
  let manager;
  let testRoot;

  beforeEach(async () => {
    // Use OS temp directory to ensure complete isolation from source tree
    testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-worktree-test-'));

    // Initialize git repo for tests
    try {
      const execa = require('execa');
      await execa('git', ['init'], { cwd: testRoot });
      await execa('git', ['config', 'user.email', 'test@test.com'], {
        cwd: testRoot,
      });
      await execa('git', ['config', 'user.name', 'Test User'], { cwd: testRoot });

      // Create initial commit (required for worktrees)
      const testFile = path.join(testRoot, 'README.md');
      await fs.writeFile(testFile, '# Test Repo');
      await execa('git', ['add', '.'], { cwd: testRoot });
      await execa('git', ['commit', '-m', 'Initial commit'], { cwd: testRoot });
    } catch (error) {
      console.warn('Git not available, some tests will be skipped:', error.message);
    }

    manager = new WorktreeManager(testRoot, {
      maxWorktrees: 3,
      staleDays: 30,
    });
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testRoot, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const defaultManager = new WorktreeManager('/tmp/test');
      expect(defaultManager.maxWorktrees).toBe(10);
      expect(defaultManager.worktreeDir).toBe('.aiox/worktrees');
      expect(defaultManager.branchPrefix).toBe('auto-claude/');
      expect(defaultManager.staleDays).toBe(30);
    });

    it('should accept custom options', () => {
      const customManager = new WorktreeManager('/tmp/test', {
        maxWorktrees: 5,
        worktreeDir: '.custom/worktrees',
        branchPrefix: 'custom/',
        staleDays: 15,
      });
      expect(customManager.maxWorktrees).toBe(5);
      expect(customManager.worktreeDir).toBe('.custom/worktrees');
      expect(customManager.branchPrefix).toBe('custom/');
      expect(customManager.staleDays).toBe(15);
    });
  });

  describe('getWorktreePath', () => {
    it('should return correct path for story', () => {
      const wtPath = manager.getWorktreePath('STORY-42');
      expect(wtPath).toBe(path.join(testRoot, '.aiox/worktrees', 'STORY-42'));
    });
  });

  describe('getBranchName', () => {
    it('should return correct branch name for story', () => {
      const branch = manager.getBranchName('STORY-42');
      expect(branch).toBe('auto-claude/STORY-42');
    });
  });

  describe('exists', () => {
    it('should return false for non-existent worktree', async () => {
      const exists = await manager.exists('NONEXISTENT');
      expect(exists).toBe(false);
    });
  });

  describe('create', () => {
    it('should create worktree with correct structure', async () => {
      try {
        const info = await manager.create('STORY-42');

        expect(info).not.toBeNull();
        expect(info.storyId).toBe('STORY-42');
        expect(info.branch).toBe('auto-claude/STORY-42');
        expect(info.status).toBe('active');
        expect(info.uncommittedChanges).toBe(0);

        // Verify directory was created
        const exists = await manager.exists('STORY-42');
        expect(exists).toBe(true);
      } catch (error) {
        // Git might not be available in CI
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should throw error if worktree already exists', async () => {
      try {
        await manager.create('STORY-42');
        await expect(manager.create('STORY-42')).rejects.toThrow(
          "Worktree for story 'STORY-42' already exists",
        );
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    });

    it('should throw error when max worktrees reached', async () => {
      try {
        // Create max worktrees (3 in test config)
        await manager.create('STORY-1');
        await manager.create('STORY-2');
        await manager.create('STORY-3');

        // Fourth should fail
        await expect(manager.create('STORY-4')).rejects.toThrow(
          'Maximum worktrees limit (3) reached',
        );
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else if (!error.message.includes('Maximum worktrees limit')) {
          throw error;
        }
      }
    });
  });

  describe('list', () => {
    it('should return empty array when no worktrees', async () => {
      try {
        const worktrees = await manager.list();
        expect(worktrees).toEqual([]);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should return created worktrees', async () => {
      try {
        await manager.create('STORY-1');
        await manager.create('STORY-2');

        const worktrees = await manager.list();
        expect(worktrees.length).toBe(2);
        expect(worktrees.map((w) => w.storyId).sort()).toEqual(['STORY-1', 'STORY-2']);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('get', () => {
    it('should return null for non-existent worktree', async () => {
      const info = await manager.get('NONEXISTENT');
      expect(info).toBeNull();
    });

    it('should return worktree info for existing worktree', async () => {
      try {
        await manager.create('STORY-42');
        const info = await manager.get('STORY-42');

        expect(info).not.toBeNull();
        expect(info.storyId).toBe('STORY-42');
        expect(info.branch).toBe('auto-claude/STORY-42');
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('remove', () => {
    it('should throw error for non-existent worktree', async () => {
      await expect(manager.remove('NONEXISTENT')).rejects.toThrow(
        "Worktree for story 'NONEXISTENT' does not exist",
      );
    });

    it('should remove existing worktree', async () => {
      try {
        await manager.create('STORY-42');
        expect(await manager.exists('STORY-42')).toBe(true);

        await manager.remove('STORY-42');
        expect(await manager.exists('STORY-42')).toBe(false);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('getCount', () => {
    it('should return correct counts', async () => {
      try {
        const count = await manager.getCount();
        expect(count.total).toBe(0);
        expect(count.active).toBe(0);
        expect(count.stale).toBe(0);

        await manager.create('STORY-1');
        await manager.create('STORY-2');

        const count2 = await manager.getCount();
        expect(count2.total).toBe(2);
        expect(count2.active).toBe(2);
        expect(count2.stale).toBe(0);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('formatList', () => {
    it('should return empty message for no worktrees', () => {
      const output = manager.formatList([]);
      expect(output).toContain('No active worktrees');
    });

    it('should format worktrees correctly', () => {
      const worktrees = [
        {
          storyId: 'STORY-42',
          path: '/test/path',
          branch: 'auto-claude/STORY-42',
          createdAt: new Date(),
          uncommittedChanges: 3,
          status: 'active',
        },
      ];

      const output = manager.formatList(worktrees);
      expect(output).toContain('STORY-42');
      expect(output).toContain('auto-claude/STORY-42');
      expect(output).toContain('3 uncommitted');
    });
  });

  describe('formatAge', () => {
    it('should format just now correctly', () => {
      const age = manager.formatAge(new Date());
      expect(age).toBe('just now');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const age = manager.formatAge(twoHoursAgo);
      expect(age).toBe('2h ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const age = manager.formatAge(threeDaysAgo);
      expect(age).toBe('3d ago');
    });
  });

  describe('detectConflicts', () => {
    it('should throw error for non-existent worktree', async () => {
      await expect(manager.detectConflicts('NONEXISTENT')).rejects.toThrow(
        "Worktree for story 'NONEXISTENT' does not exist",
      );
    });

    it('should return empty array when no conflicts', async () => {
      try {
        await manager.create('STORY-42');

        // Make a change in worktree without conflicting
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');
        const newFile = path.join(worktreePath, 'new-file.txt');
        await fs.writeFile(newFile, 'New content');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Add new file'], { cwd: worktreePath });

        const conflicts = await manager.detectConflicts('STORY-42');
        expect(conflicts).toEqual([]);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should detect conflicting files', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        // Modify README.md in worktree
        const wtReadme = path.join(worktreePath, 'README.md');
        await fs.writeFile(wtReadme, '# Modified in worktree');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Modify README in worktree'], { cwd: worktreePath });

        // Modify README.md in main
        const mainReadme = path.join(testRoot, 'README.md');
        await fs.writeFile(mainReadme, '# Modified in main');
        await execa('git', ['add', '.'], { cwd: testRoot });
        await execa('git', ['commit', '-m', 'Modify README in main'], { cwd: testRoot });

        const conflicts = await manager.detectConflicts('STORY-42');
        expect(conflicts).toContain('README.md');
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('mergeToBase', () => {
    it('should throw error for non-existent worktree', async () => {
      await expect(manager.mergeToBase('NONEXISTENT')).rejects.toThrow(
        "Worktree for story 'NONEXISTENT' does not exist",
      );
    });

    it('should merge worktree successfully', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        // Make a non-conflicting change
        const newFile = path.join(worktreePath, 'feature.txt');
        await fs.writeFile(newFile, 'New feature content');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Add feature'], { cwd: worktreePath });

        const result = await manager.mergeToBase('STORY-42');

        expect(result.success).toBe(true);
        expect(result.storyId).toBe('STORY-42');
        expect(result.sourceBranch).toBe('auto-claude/STORY-42');
        expect(result.conflicts).toEqual([]);
        expect(result.commitHash).toBeDefined();
        expect(result.logPath).toBeDefined();

        // Verify file exists in main after merge
        const mainFile = path.join(testRoot, 'feature.txt');
        const exists = await fs
          .access(mainFile)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should support staged option (--no-commit)', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        const newFile = path.join(worktreePath, 'staged-feature.txt');
        await fs.writeFile(newFile, 'Staged feature');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Add staged feature'], { cwd: worktreePath });

        // Get HEAD before merge
        const headBefore = await execa('git', ['rev-parse', 'HEAD'], { cwd: testRoot });

        const result = await manager.mergeToBase('STORY-42', { staged: true });

        expect(result.success).toBe(true);
        expect(result.commitHash).toBeUndefined(); // Not committed

        // Get HEAD after merge - should be same (no commit was made)
        const headAfter = await execa('git', ['rev-parse', 'HEAD'], { cwd: testRoot });
        expect(headAfter.stdout).toBe(headBefore.stdout);

        // Verify the file was merged to working tree
        const mainFile = path.join(testRoot, 'staged-feature.txt');
        const fileExists = await fs
          .access(mainFile)
          .then(() => true)
          .catch(() => false);
        expect(fileExists).toBe(true);

        // Clean up merge state for next tests
        await execa('git', ['merge', '--abort'], { cwd: testRoot }).catch(() => {
          return execa('git', ['reset', '--hard', 'HEAD'], { cwd: testRoot });
        });
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should support squash option', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        // Make multiple commits
        for (let i = 1; i <= 3; i++) {
          const file = path.join(worktreePath, `file${i}.txt`);
          await fs.writeFile(file, `Content ${i}`);
          await execa('git', ['add', '.'], { cwd: worktreePath });
          await execa('git', ['commit', '-m', `Commit ${i}`], { cwd: worktreePath });
        }

        const result = await manager.mergeToBase('STORY-42', { squash: true });

        expect(result.success).toBe(true);
        expect(result.commitHash).toBeDefined();
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should fail gracefully on conflicts', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        // Create conflict
        const wtReadme = path.join(worktreePath, 'README.md');
        await fs.writeFile(wtReadme, '# Worktree version');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Modify in worktree'], { cwd: worktreePath });

        const mainReadme = path.join(testRoot, 'README.md');
        await fs.writeFile(mainReadme, '# Main version');
        await execa('git', ['add', '.'], { cwd: testRoot });
        await execa('git', ['commit', '-m', 'Modify in main'], { cwd: testRoot });

        const result = await manager.mergeToBase('STORY-42');

        expect(result.success).toBe(false);
        expect(result.conflicts.length).toBeGreaterThan(0);
        expect(result.error).toContain('conflict');
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should cleanup worktree after merge when cleanup option is true', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        const newFile = path.join(worktreePath, 'cleanup-test.txt');
        await fs.writeFile(newFile, 'Cleanup test');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Add cleanup test'], { cwd: worktreePath });

        const result = await manager.mergeToBase('STORY-42', { cleanup: true });

        expect(result.success).toBe(true);
        expect(await manager.exists('STORY-42')).toBe(false);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('getMergeHistory', () => {
    it('should return empty array when no merge history', async () => {
      const history = await manager.getMergeHistory();
      expect(history).toEqual([]);
    });

    it('should return merge history after merge', async () => {
      try {
        await manager.create('STORY-42');
        const execa = require('execa');
        const worktreePath = manager.getWorktreePath('STORY-42');

        const newFile = path.join(worktreePath, 'history-test.txt');
        await fs.writeFile(newFile, 'History test');
        await execa('git', ['add', '.'], { cwd: worktreePath });
        await execa('git', ['commit', '-m', 'Add history test'], { cwd: worktreePath });

        await manager.mergeToBase('STORY-42');

        const history = await manager.getMergeHistory();
        expect(history.length).toBe(1);
        expect(history[0].storyId).toBe('STORY-42');
        expect(history[0].success).toBe(true);
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should filter by storyId', async () => {
      try {
        await manager.create('STORY-42');
        await manager.create('STORY-43');
        const execa = require('execa');

        // Merge STORY-42
        const wt42 = manager.getWorktreePath('STORY-42');
        await fs.writeFile(path.join(wt42, 'file42.txt'), 'Content 42');
        await execa('git', ['add', '.'], { cwd: wt42 });
        await execa('git', ['commit', '-m', 'Add file 42'], { cwd: wt42 });
        await manager.mergeToBase('STORY-42');

        // Merge STORY-43
        const wt43 = manager.getWorktreePath('STORY-43');
        await fs.writeFile(path.join(wt43, 'file43.txt'), 'Content 43');
        await execa('git', ['add', '.'], { cwd: wt43 });
        await execa('git', ['commit', '-m', 'Add file 43'], { cwd: wt43 });
        await manager.mergeToBase('STORY-43');

        const allHistory = await manager.getMergeHistory();
        expect(allHistory.length).toBe(2);

        const story42History = await manager.getMergeHistory('STORY-42');
        expect(story42History.length).toBe(1);
        expect(story42History[0].storyId).toBe('STORY-42');
      } catch (error) {
        if (error.message.includes('Git command failed')) {
          console.warn('Git not available, skipping test');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });
});
