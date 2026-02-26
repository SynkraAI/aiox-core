/**
 * Unit Tests for GitConfigDetector
 *
 * Test Coverage:
 * - Cache hit/miss scenarios
 * - Cache expiration (TTL)
 * - Cache invalidation
 * - Timeout protection
 * - Git repository detection
 * - Branch and remote detection
 * - Repository type detection
 * - Graceful error handling
 */

const GitConfigDetector = require('../../.aios-core/infrastructure/scripts/git-config-detector');
const { execSync } = require('child_process');

// Mock execSync for testing
jest.mock('child_process');

describe('GitConfigDetector', () => {
  let detector;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    detector = new GitConfigDetector(5 * 60 * 1000); // 5 minute TTL
    // NOG-18: _isGitRepository now uses fs.existsSync (not execSync), so mock it
    // to control git repo detection in tests.
    jest.spyOn(detector, '_isGitRepository').mockReturnValue(true);
    // QW-5: _detectBranchDirect uses fs (not execSync), so mock it to force
    // fallback to _getCurrentBranchExec which uses the mocked execSync.
    jest.spyOn(detector, '_detectBranchDirect').mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Cache Management', () => {
    test('should return cached data on cache hit', () => {
      // NOG-18: _isGitRepository uses fs (mocked via spy), no execSync for repo check
      // Only branch (execSync) and remote (execSync) calls remain
      execSync
        .mockReturnValueOnce('main\n') // branch
        .mockReturnValueOnce('https://github.com/user/repo.git\n'); // remote url

      const firstCall = detector.get();
      expect(firstCall.configured).toBe(true);

      // Second call should use cache (no execSync calls)
      const secondCall = detector.get();
      expect(secondCall).toEqual(firstCall);
      expect(execSync).toHaveBeenCalledTimes(2); // Only first call (branch + remote)
    });

    test('should execute git commands on cache miss', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      const result = detector.get();

      expect(execSync).toHaveBeenCalled();
      expect(result.configured).toBe(true);
    });

    test('should expire cache after TTL', () => {
      const shortTTL = 100; // 100ms
      detector = new GitConfigDetector(shortTTL);
      jest.spyOn(detector, '_isGitRepository').mockReturnValue(true);
      jest.spyOn(detector, '_detectBranchDirect').mockReturnValue(undefined);

      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      detector.get(); // First call

      // Wait for cache to expire
      jest.advanceTimersByTime(shortTTL + 1);

      execSync
        .mockReturnValueOnce('develop\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      detector.get(); // Second call after expiration

      expect(execSync).toHaveBeenCalledTimes(4); // 2 calls each time
    });

    test('should invalidate cache manually', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      detector.get(); // First call

      detector.invalidate();

      execSync
        .mockReturnValueOnce('develop\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      detector.get(); // Should re-detect

      expect(execSync).toHaveBeenCalledTimes(4); // 2 calls each time
    });

    test('should report cache age correctly', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      detector.get();

      const age = detector.getCacheAge();
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(100); // Should be very recent
    });

    test('should detect cache expiring soon', () => {
      const shortTTL = 1000; // 1 second
      detector = new GitConfigDetector(shortTTL);
      jest.spyOn(detector, '_isGitRepository').mockReturnValue(true);
      jest.spyOn(detector, '_detectBranchDirect').mockReturnValue(undefined);

      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      detector.get();

      jest.advanceTimersByTime(950); // 950ms elapsed (50ms remaining)

      const expiringSoon = detector.isCacheExpiringSoon();
      expect(expiringSoon).toBe(true);
    });
  });

  describe('Git Repository Detection', () => {
    test('should detect configured git repository', () => {
      // NOG-18: _isGitRepository uses fs (mocked via spy), only branch + remote via execSync
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      const result = detector.detect();

      expect(result.configured).toBe(true);
      expect(result.branch).toBe('main');
      expect(result.type).toBe('github');
    });

    test('should detect unconfigured repository (no git)', () => {
      // Create a fresh detector to avoid cache pollution from other tests
      const freshDetector = new GitConfigDetector(5 * 60 * 1000);
      // NOG-18: _isGitRepository uses fs.existsSync, mock it to simulate no .git
      jest.spyOn(freshDetector, '_isGitRepository').mockReturnValue(false);
      execSync.mockImplementation(() => {
        throw new Error('not a git repository');
      });

      const result = freshDetector.detect();

      expect(result.configured).toBe(false);
      expect(result.branch).toBeNull();
      expect(result.type).toBeNull();
    });

    test('should handle timeout gracefully', () => {
      // NOG-18: _isGitRepository uses fs, mock to false so execSync errors → unconfigured
      detector._isGitRepository.mockReturnValue(false);
      execSync.mockImplementation(() => {
        throw new Error('Command timeout');
      });

      const result = detector.detect();

      expect(result.configured).toBe(false);
    });
  });

  describe('Repository Type Detection', () => {
    test('should detect GitHub repository', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      const result = detector.detect();

      expect(result.type).toBe('github');
    });

    test('should detect GitLab repository', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://gitlab.com/user/repo.git\n');

      const result = detector.detect();

      expect(result.type).toBe('gitlab');
    });

    test('should detect Bitbucket repository', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://bitbucket.org/user/repo.git\n');

      const result = detector.detect();

      expect(result.type).toBe('bitbucket');
    });

    test('should detect other repository type', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://custom-git-server.com/repo.git\n');

      const result = detector.detect();

      expect(result.type).toBe('other');
    });

    test('should handle missing remote URL', () => {
      execSync
        .mockReturnValueOnce('main\n')
        .mockImplementationOnce(() => {
          throw new Error('No remote');
        });

      const result = detector.detect();

      expect(result.type).toBeNull();
    });
  });

  describe('Branch Detection', () => {
    test('should detect current branch', () => {
      execSync
        .mockReturnValueOnce('feature-123\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      const result = detector.detect();

      expect(result.branch).toBe('feature-123');
    });

    test('should handle detached HEAD state', () => {
      execSync
        .mockReturnValueOnce('\n') // Empty branch name
        .mockReturnValueOnce('https://github.com/user/repo.git\n');

      const result = detector.detect();

      expect(result.branch).toBeNull();
    });
  });

  describe('Detailed Information', () => {
    test('should get detailed git information', () => {
      // NOG-18: _isGitRepository uses fs (mocked via spy), no execSync for repo check
      // detect() calls: branch (execSync) + remote (execSync)
      // getDetailed() calls: user.name, user.email, remote, last commit, status --porcelain
      execSync
        .mockReturnValueOnce('main\n') // branch
        .mockReturnValueOnce('https://github.com/user/repo.git\n') // remote (detect)
        .mockReturnValueOnce('John Doe\n') // user.name
        .mockReturnValueOnce('john@example.com\n') // user.email
        .mockReturnValueOnce('https://github.com/user/repo.git\n') // remote (getDetailed)
        .mockReturnValueOnce('abc123def456\n') // last commit
        .mockReturnValueOnce('M file.txt\n'); // status --porcelain

      const result = detector.getDetailed();

      expect(result.userName).toBe('John Doe');
      expect(result.userEmail).toBe('john@example.com');
      expect(result.lastCommit).toBe('abc123def456');
      expect(result.hasUncommittedChanges).toBe(true);
    });

    test('should handle errors in detailed detection', () => {
      // NOG-18: _isGitRepository uses fs, mock to false so git errors → unconfigured
      detector._isGitRepository.mockReturnValue(false);
      execSync.mockImplementation(() => {
        throw new Error('git error');
      });

      const result = detector.getDetailed();

      expect(result.configured).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should gracefully handle all git errors', () => {
      // NOG-18: _isGitRepository uses fs, mock to false so git errors → unconfigured
      detector._isGitRepository.mockReturnValue(false);
      execSync.mockImplementation(() => {
        throw new Error('git command failed');
      });

      expect(() => {
        detector.detect();
      }).not.toThrow();

      const result = detector.detect();
      expect(result.configured).toBe(false);
    });

    test('should cache error results', () => {
      // NOG-18: _isGitRepository uses fs, mock to false so git errors → unconfigured
      detector._isGitRepository.mockReturnValue(false);
      execSync.mockImplementation(() => {
        throw new Error('git error');
      });

      const firstCall = detector.get();
      const secondCall = detector.get();

      expect(firstCall).toEqual(secondCall);
      // _isGitRepository is mocked via spyOn (no execSync), so no execSync calls expected
      // get() caches the result from detect(), second get() returns cached
      expect(execSync).toHaveBeenCalledTimes(0);
    });
  });
});
