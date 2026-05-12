/**
 * @fileoverview Tests for WorktreeManager - ADE Epic 1
 * @description Unit tests for Git worktree management functionality
 */

const WorktreeManager = require('../../.aiox-core/infrastructure/scripts/worktree-manager');
const path = require('path');

// Mock execa
jest.mock('execa', () => {
  const mockExeca = jest.fn();
  return mockExeca;
});

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    access: jest.fn(),
    stat: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock chalk to avoid color issues in tests
jest.mock('chalk', () => ({
  green: (str) => str,
  red: (str) => str,
  yellow: (str) => str,
  gray: (str) => str,
  cyan: (str) => str,
  bold: (str) => str,
}));

const execa = require('execa');
const fs = require('fs').promises;

describe('WorktreeManager', () => {
  let manager;
  const projectRoot = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new WorktreeManager(projectRoot);
  });

  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const mgr = new WorktreeManager(projectRoot);
      expect(mgr.projectRoot).toBe(projectRoot);
      expect(mgr.maxWorktrees).toBe(10);
      expect(mgr.worktreeDir).toBe('.aiox/worktrees');
      expect(mgr.branchPrefix).toBe('auto-claude/');
      expect(mgr.staleDays).toBe(30);
    });

    it('should use custom options when provided', () => {
      const mgr = new WorktreeManager(projectRoot, {
        maxWorktrees: 5,
        worktreeDir: 'custom/dir',
        branchPrefix: 'story/',
        staleDays: 14,
      });
      expect(mgr.maxWorktrees).toBe(5);
      expect(mgr.worktreeDir).toBe('custom/dir');
      expect(mgr.branchPrefix).toBe('story/');
      expect(mgr.staleDays).toBe(14);
    });

    it('should use process.cwd() when no projectRoot provided', () => {
      const mgr = new WorktreeManager();
      expect(mgr.projectRoot).toBe(process.cwd());
    });
  });

  describe('getWorktreePath', () => {
    it('should return correct path for story ID', () => {
      const result = manager.getWorktreePath('STORY-42');
      expect(result).toBe(path.join(projectRoot, '.aiox/worktrees', 'STORY-42'));
    });
  });

  describe('getBranchName', () => {
    it('should return correct branch name with prefix', () => {
      const result = manager.getBranchName('STORY-42');
      expect(result).toBe('auto-claude/STORY-42');
    });
  });

  describe('exists', () => {
    it('should return true when worktree directory exists', async () => {
      fs.access.mockResolvedValue(undefined);

      const result = await manager.exists('STORY-42');

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(path.join(projectRoot, '.aiox/worktrees', 'STORY-42'));
    });

    it('should return false when worktree directory does not exist', async () => {
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await manager.exists('STORY-42');

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      execa.mockResolvedValue({ stdout: '', stderr: '' });
      fs.stat.mockResolvedValue({
        birthtime: new Date(),
        mtime: new Date(),
      });
    });

    it('should create worktree with correct git commands', async () => {
      // First access check (exists) returns false, second (get) returns true
      fs.access
        .mockRejectedValueOnce(new Error('ENOENT')) // exists check
        .mockResolvedValueOnce(undefined); // get check after creation

      const result = await manager.create('STORY-42');

      expect(fs.mkdir).toHaveBeenCalledWith(path.join(projectRoot, '.aiox/worktrees'), {
        recursive: true,
      });
      expect(execa).toHaveBeenCalledWith(
        'git',
        [
          'worktree',
          'add',
          path.join(projectRoot, '.aiox/worktrees', 'STORY-42'),
          '-b',
          'auto-claude/STORY-42',
        ],
        expect.objectContaining({ cwd: projectRoot }),
      );
      expect(result).toHaveProperty('storyId', 'STORY-42');
    });

    it('should throw error if worktree already exists', async () => {
      fs.access.mockResolvedValue(undefined); // worktree exists

      await expect(manager.create('STORY-42')).rejects.toThrow(
        "Worktree for story 'STORY-42' already exists",
      );
    });

    it('should throw error if max worktrees limit reached', async () => {
      // Mock list to return max worktrees
      execa.mockResolvedValue({
        stdout: Array(10)
          .fill(null)
          .map(
            (_, i) =>
              `worktree /test/project/.aiox/worktrees/STORY-${i}\nbranch refs/heads/auto-claude/STORY-${i}`,
          )
          .join('\n\n'),
        stderr: '',
      });

      // Mock fs.stat for all worktrees
      fs.stat.mockResolvedValue({
        birthtime: new Date(),
        mtime: new Date(),
      });

      // First access call for exists() returns false (new worktree doesn't exist)
      // But list() will show 10 existing worktrees
      fs.access
        .mockRejectedValueOnce(new Error('ENOENT')) // exists check for new worktree
        .mockResolvedValue(undefined); // access checks for listing

      await expect(manager.create('STORY-NEW')).rejects.toThrow(
        /Maximum worktrees limit \(10\) reached/,
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      fs.access.mockResolvedValue(undefined); // worktree exists
      execa.mockResolvedValue({ stdout: '', stderr: '' });
    });

    it('should remove worktree and branch', async () => {
      const result = await manager.remove('STORY-42');

      expect(execa).toHaveBeenCalledWith(
        'git',
        ['worktree', 'remove', path.join(projectRoot, '.aiox/worktrees', 'STORY-42')],
        expect.objectContaining({ cwd: projectRoot }),
      );
      expect(execa).toHaveBeenCalledWith(
        'git',
        ['branch', '-d', 'auto-claude/STORY-42'],
        expect.objectContaining({ cwd: projectRoot }),
      );
      expect(result).toBe(true);
    });

    it('should force remove when option is set', async () => {
      await manager.remove('STORY-42', { force: true });

      expect(execa).toHaveBeenCalledWith(
        'git',
        ['worktree', 'remove', path.join(projectRoot, '.aiox/worktrees', 'STORY-42'), '--force'],
        expect.objectContaining({ cwd: projectRoot }),
      );
      expect(execa).toHaveBeenCalledWith(
        'git',
        ['branch', '-D', 'auto-claude/STORY-42'],
        expect.objectContaining({ cwd: projectRoot }),
      );
    });

    it('should throw error if worktree does not exist', async () => {
      fs.access.mockRejectedValue(new Error('ENOENT'));

      await expect(manager.remove('STORY-42')).rejects.toThrow(
        "Worktree for story 'STORY-42' does not exist",
      );
    });
  });

  describe('list', () => {
    it('should return empty array when no worktrees', async () => {
      execa.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await manager.list();

      expect(result).toEqual([]);
    });

    it('should parse worktree list and filter by prefix', async () => {
      const porcelainOutput = `worktree /test/project
branch refs/heads/main

worktree /test/project/.aiox/worktrees/STORY-42
branch refs/heads/auto-claude/STORY-42

worktree /test/project/.aiox/worktrees/STORY-43
branch refs/heads/auto-claude/STORY-43`;

      execa.mockResolvedValue({ stdout: porcelainOutput, stderr: '' });
      fs.stat.mockResolvedValue({
        birthtime: new Date(),
        mtime: new Date(),
      });

      const result = await manager.list();

      // Should filter out main worktree and only return auto-claude prefixed ones
      expect(result.length).toBe(2);
      expect(result[0].storyId).toBe('STORY-42');
      expect(result[1].storyId).toBe('STORY-43');
    });
  });

  describe('getCount', () => {
    it('should return correct counts', async () => {
      const now = Date.now();
      const oldDate = new Date(now - 45 * 24 * 60 * 60 * 1000); // 45 days ago
      const recentDate = new Date(now - 5 * 24 * 60 * 60 * 1000); // 5 days ago

      const porcelainOutput = `worktree /test/project/.aiox/worktrees/STORY-OLD
branch refs/heads/auto-claude/STORY-OLD

worktree /test/project/.aiox/worktrees/STORY-NEW
branch refs/heads/auto-claude/STORY-NEW`;

      execa.mockResolvedValue({ stdout: porcelainOutput, stderr: '' });
      fs.stat
        .mockResolvedValueOnce({ birthtime: oldDate, mtime: oldDate })
        .mockResolvedValueOnce({ birthtime: recentDate, mtime: recentDate });

      const result = await manager.getCount();

      expect(result.total).toBe(2);
      expect(result.stale).toBe(1);
      expect(result.active).toBe(1);
    });
  });

  describe('formatAge', () => {
    it('should format recent time as "just now"', () => {
      const result = manager.formatAge(new Date());
      expect(result).toBe('just now');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = manager.formatAge(twoHoursAgo);
      expect(result).toBe('2h ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = manager.formatAge(threeDaysAgo);
      expect(result).toBe('3d ago');
    });
  });

  describe('formatList', () => {
    it('should return message when no worktrees', () => {
      const result = manager.formatList([]);
      expect(result).toContain('No active worktrees');
    });

    it('should format worktree list correctly', () => {
      const worktrees = [
        {
          storyId: 'STORY-42',
          branch: 'auto-claude/STORY-42',
          uncommittedChanges: 3,
          status: 'active',
          createdAt: new Date(),
        },
      ];

      const result = manager.formatList(worktrees);

      expect(result).toContain('Active Worktrees');
      expect(result).toContain('STORY-42');
      expect(result).toContain('3 uncommitted');
    });
  });

  describe('cleanupStale', () => {
    it('should remove stale worktrees', async () => {
      const oldDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

      const porcelainOutput = `worktree /test/project/.aiox/worktrees/STORY-OLD
branch refs/heads/auto-claude/STORY-OLD`;

      execa.mockResolvedValue({ stdout: porcelainOutput, stderr: '' });
      fs.stat.mockResolvedValue({ birthtime: oldDate, mtime: oldDate });
      fs.access.mockResolvedValue(undefined);

      const result = await manager.cleanupStale();

      expect(result).toContain('STORY-OLD');
    });

    it('should return empty array when no stale worktrees', async () => {
      execa.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await manager.cleanupStale();

      expect(result).toEqual([]);
    });
  });

  describe('getMergeHistory', () => {
    it('should return empty array when no logs exist', async () => {
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await manager.getMergeHistory('STORY-42');

      expect(result).toEqual([]);
    });

    it('should return merge history sorted by timestamp', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([
        'merge-STORY-42-2026-01-28T10-00-00-000Z.json',
        'merge-STORY-42-2026-01-29T10-00-00-000Z.json',
      ]);
      fs.readFile
        .mockResolvedValueOnce(
          JSON.stringify({
            storyId: 'STORY-42',
            success: true,
            timestamp: '2026-01-28T10:00:00.000Z',
          }),
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            storyId: 'STORY-42',
            success: true,
            timestamp: '2026-01-29T10:00:00.000Z',
          }),
        );

      const result = await manager.getMergeHistory('STORY-42');

      expect(result.length).toBe(2);
      // Should be sorted by timestamp descending
      expect(result[0].timestamp.getTime()).toBeGreaterThan(result[1].timestamp.getTime());
    });
  });
});
