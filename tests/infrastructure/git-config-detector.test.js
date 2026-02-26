/**
 * Tests for GitConfigDetector — direct .git/HEAD branch detection
 *
 * 4 mandatory scenarios per AC3 (Guardrail #1):
 * 1. Normal branch (ref: refs/heads/feat/my-branch)
 * 2. Detached HEAD (raw commit hash)
 * 3. Worktree/gitfile (.git is a file with gitdir: pointer)
 * 4. No .git directory (graceful null return)
 *
 * @module tests/infrastructure/git-config-detector
 * @story NOG-10 — QW-5
 */

const fs = require('fs');
const path = require('path');

// Import the class under test
const GitConfigDetector = require('../../.aios-core/infrastructure/scripts/git-config-detector');

describe('GitConfigDetector — _detectBranchDirect()', () => {
  let detector;
  const originalCwd = process.cwd;
  let tmpDir;

  beforeEach(() => {
    detector = new GitConfigDetector();
    // Create a unique temp dir for each test
    tmpDir = path.join(__dirname, '..', '..', '.tmp-test-git-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    process.cwd = () => tmpDir;
  });

  afterEach(() => {
    process.cwd = originalCwd;
    // Cleanup temp dir
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_e) { /* ignore */ }
  });

  test('1. Normal branch: returns branch name from ref: refs/heads/...', () => {
    const gitDir = path.join(tmpDir, '.git');
    fs.mkdirSync(gitDir, { recursive: true });
    fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/feat/my-branch\n', 'utf8');

    const result = detector._detectBranchDirect();
    expect(result).toBe('feat/my-branch');
  });

  test('2. Detached HEAD: returns short hash + "(detached)"', () => {
    const gitDir = path.join(tmpDir, '.git');
    fs.mkdirSync(gitDir, { recursive: true });
    fs.writeFileSync(
      path.join(gitDir, 'HEAD'),
      'dece053d1234567890abcdef1234567890abcdef\n',
      'utf8',
    );

    const result = detector._detectBranchDirect();
    expect(result).toBe('dece053 (detached)');
  });

  test('3. Worktree/gitfile: resolves gitdir pointer and reads HEAD', () => {
    // Simulate worktree: .git is a file pointing to actual git dir
    const actualGitDir = path.join(tmpDir, 'actual-git-dir');
    fs.mkdirSync(actualGitDir, { recursive: true });
    fs.writeFileSync(path.join(actualGitDir, 'HEAD'), 'ref: refs/heads/main\n', 'utf8');

    // .git is a file with gitdir: pointer
    fs.writeFileSync(path.join(tmpDir, '.git'), `gitdir: ${actualGitDir}\n`, 'utf8');

    const result = detector._detectBranchDirect();
    expect(result).toBe('main');
  });

  test('4. No .git directory: returns null gracefully', () => {
    // tmpDir has no .git at all
    const result = detector._detectBranchDirect();
    expect(result).toBeNull();
  });

  test('Nested branch name with slashes: handles correctly', () => {
    const gitDir = path.join(tmpDir, '.git');
    fs.mkdirSync(gitDir, { recursive: true });
    fs.writeFileSync(
      path.join(gitDir, 'HEAD'),
      'ref: refs/heads/feat/epic-nogic-code-intelligence\n',
      'utf8',
    );

    const result = detector._detectBranchDirect();
    expect(result).toBe('feat/epic-nogic-code-intelligence');
  });
});

describe('GitConfigDetector — _getCurrentBranch() fallback chain', () => {
  let detector;

  beforeEach(() => {
    detector = new GitConfigDetector();
  });

  test('returns branch from direct read (fast path)', () => {
    detector._detectBranchDirect = jest.fn(() => 'feat/test');
    detector._getCurrentBranchExec = jest.fn(() => 'feat/test');

    const result = detector._getCurrentBranch();
    expect(result).toBe('feat/test');
    // Should NOT call exec fallback
    expect(detector._getCurrentBranchExec).not.toHaveBeenCalled();
  });

  test('falls back to execSync when direct read returns undefined', () => {
    detector._detectBranchDirect = jest.fn(() => undefined);
    detector._getCurrentBranchExec = jest.fn(() => 'main');

    const result = detector._getCurrentBranch();
    expect(result).toBe('main');
    expect(detector._getCurrentBranchExec).toHaveBeenCalled();
  });

  test('returns null from direct read without fallback (no .git)', () => {
    detector._detectBranchDirect = jest.fn(() => null);
    detector._getCurrentBranchExec = jest.fn(() => null);

    const result = detector._getCurrentBranch();
    expect(result).toBeNull();
    // null is a valid result from direct (ENOENT) — no fallback needed
    expect(detector._getCurrentBranchExec).not.toHaveBeenCalled();
  });
});
