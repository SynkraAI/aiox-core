/**
 * Lock Manager Tests
 * Story 12.3: Bob Orchestration Logic - File Locking (AC14-17)
 */

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const yaml = require('js-yaml');

const LockManager = require('../../../.aiox-core/core/orchestration/lock-manager');

// Test fixtures
const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-locks');
const LOCKS_DIR = path.join(TEST_PROJECT_ROOT, '.aiox/locks');

describe('LockManager', () => {
  let lockManager;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(LOCKS_DIR, { recursive: true });

    lockManager = new LockManager(TEST_PROJECT_ROOT, { debug: false });
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('acquireLock', () => {
    it('should acquire a lock for an available resource', async () => {
      // When
      const result = await lockManager.acquireLock('test-resource');

      // Then
      expect(result).toBe(true);

      // Verify lock file exists with correct schema (AC14)
      const lockPath = path.join(LOCKS_DIR, 'test-resource.lock');
      const content = await fs.readFile(lockPath, 'utf8');
      const lockData = yaml.load(content);

      expect(lockData.pid).toBe(process.pid);
      expect(lockData.owner).toBe('bob-orchestrator');
      expect(lockData.resource).toBe('test-resource');
      expect(lockData.ttl_seconds).toBe(300);
      expect(lockData.created_at).toBeDefined();
    });

    it('should fail to acquire a lock held by another active process', async () => {
      // Given — create a lock with current PID (simulating active lock)
      const lockPath = path.join(LOCKS_DIR, 'busy-resource.lock');
      const lockData = {
        pid: process.pid,
        owner: 'other-module',
        created_at: new Date().toISOString(),
        ttl_seconds: 300,
        resource: 'busy-resource',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When — try to acquire with exclusive write flag
      // The lock is owned by same PID but different owner check isn't done in acquire
      // We need a lock from a different context — simulate by making a fresh manager
      const otherManager = new LockManager(TEST_PROJECT_ROOT, {
        debug: false,
        owner: 'another-orchestrator',
      });
      const result = await otherManager.acquireLock('busy-resource');

      // Then — should fail because file already exists (active PID)
      expect(result).toBe(false);
    });

    it('should acquire a lock after removing a stale TTL-expired lock (AC16)', async () => {
      // Given — create a lock with expired TTL
      const lockPath = path.join(LOCKS_DIR, 'expired-resource.lock');
      const expiredDate = new Date(Date.now() - 400 * 1000); // 400 seconds ago
      const lockData = {
        pid: process.pid,
        owner: 'old-module',
        created_at: expiredDate.toISOString(),
        ttl_seconds: 300, // 300s TTL, but 400s elapsed
        resource: 'expired-resource',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When
      const result = await lockManager.acquireLock('expired-resource');

      // Then
      expect(result).toBe(true);
    });

    it('should acquire a lock after removing a lock from dead PID (AC17)', async () => {
      // Given — create a lock with a PID that doesn't exist
      const lockPath = path.join(LOCKS_DIR, 'dead-pid-resource.lock');
      const lockData = {
        pid: 999999, // Very unlikely to be a real PID
        owner: 'dead-module',
        created_at: new Date().toISOString(),
        ttl_seconds: 300,
        resource: 'dead-pid-resource',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When
      const result = await lockManager.acquireLock('dead-pid-resource');

      // Then
      expect(result).toBe(true);
    });

    it('should accept custom TTL and owner options', async () => {
      // When
      await lockManager.acquireLock('custom-resource', {
        ttlSeconds: 60,
        owner: 'custom-owner',
      });

      // Then
      const lockPath = path.join(LOCKS_DIR, 'custom-resource.lock');
      const content = await fs.readFile(lockPath, 'utf8');
      const lockData = yaml.load(content);

      expect(lockData.ttl_seconds).toBe(60);
      expect(lockData.owner).toBe('custom-owner');
    });
  });

  describe('releaseLock', () => {
    it('should release a lock owned by current process', async () => {
      // Given
      await lockManager.acquireLock('release-test');

      // When
      const result = await lockManager.releaseLock('release-test');

      // Then
      expect(result).toBe(true);
      const lockPath = path.join(LOCKS_DIR, 'release-test.lock');
      expect(fsSync.existsSync(lockPath)).toBe(false);
    });

    it('should return false when no lock exists', async () => {
      // When
      const result = await lockManager.releaseLock('nonexistent');

      // Then
      expect(result).toBe(false);
    });

    it('should refuse to release a lock owned by another PID', async () => {
      // Given — create a lock from another PID
      const lockPath = path.join(LOCKS_DIR, 'other-pid.lock');
      const lockData = {
        pid: 999999,
        owner: 'other',
        created_at: new Date().toISOString(),
        ttl_seconds: 300,
        resource: 'other-pid',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When
      const result = await lockManager.releaseLock('other-pid');

      // Then
      expect(result).toBe(false);
      // Lock file should still exist
      expect(fsSync.existsSync(lockPath)).toBe(true);
    });
  });

  describe('isLocked', () => {
    it('should return true for an active lock', async () => {
      // Given
      await lockManager.acquireLock('active-resource');

      // When
      const result = await lockManager.isLocked('active-resource');

      // Then
      expect(result).toBe(true);
    });

    it('should return false for no lock', async () => {
      // When
      const result = await lockManager.isLocked('no-lock');

      // Then
      expect(result).toBe(false);
    });

    it('should return false for a stale lock', async () => {
      // Given — expired TTL lock
      const lockPath = path.join(LOCKS_DIR, 'stale-resource.lock');
      const lockData = {
        pid: 999999,
        owner: 'dead',
        created_at: new Date(Date.now() - 400 * 1000).toISOString(),
        ttl_seconds: 300,
        resource: 'stale-resource',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When
      const result = await lockManager.isLocked('stale-resource');

      // Then
      expect(result).toBe(false);
    });
  });

  describe('cleanupStaleLocks', () => {
    it('should remove locks with expired TTL (AC16)', async () => {
      // Given
      const lockPath = path.join(LOCKS_DIR, 'expired.lock');
      const lockData = {
        pid: process.pid,
        owner: 'old',
        created_at: new Date(Date.now() - 600 * 1000).toISOString(), // 10 min ago
        ttl_seconds: 300, // 5 min TTL
        resource: 'expired',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When
      const cleaned = await lockManager.cleanupStaleLocks();

      // Then
      expect(cleaned).toBe(1);
      expect(fsSync.existsSync(lockPath)).toBe(false);
    });

    it('should remove locks with dead PIDs (AC17)', async () => {
      // Given
      const lockPath = path.join(LOCKS_DIR, 'dead-pid.lock');
      const lockData = {
        pid: 999999,
        owner: 'dead',
        created_at: new Date().toISOString(),
        ttl_seconds: 300,
        resource: 'dead-pid',
      };
      await fs.writeFile(lockPath, yaml.dump(lockData));

      // When
      const cleaned = await lockManager.cleanupStaleLocks();

      // Then
      expect(cleaned).toBe(1);
      expect(fsSync.existsSync(lockPath)).toBe(false);
    });

    it('should not remove active locks', async () => {
      // Given
      await lockManager.acquireLock('active');

      // When
      const cleaned = await lockManager.cleanupStaleLocks();

      // Then
      expect(cleaned).toBe(0);
      const lockPath = path.join(LOCKS_DIR, 'active.lock');
      expect(fsSync.existsSync(lockPath)).toBe(true);

      // Cleanup
      await lockManager.releaseLock('active');
    });

    it('should handle empty locks directory', async () => {
      // When
      const cleaned = await lockManager.cleanupStaleLocks();

      // Then
      expect(cleaned).toBe(0);
    });
  });

  describe('lock file schema (AC14)', () => {
    it('should write lock files with formal YAML schema', async () => {
      // When
      await lockManager.acquireLock('schema-test');

      // Then
      const lockPath = path.join(LOCKS_DIR, 'schema-test.lock');
      const content = await fs.readFile(lockPath, 'utf8');
      const lockData = yaml.load(content);

      // Validate all required schema fields
      expect(lockData).toHaveProperty('pid');
      expect(lockData).toHaveProperty('owner');
      expect(lockData).toHaveProperty('created_at');
      expect(lockData).toHaveProperty('ttl_seconds');
      expect(lockData).toHaveProperty('resource');

      // Validate types
      expect(typeof lockData.pid).toBe('number');
      expect(typeof lockData.owner).toBe('string');
      expect(typeof lockData.created_at).toBe('string');
      expect(typeof lockData.ttl_seconds).toBe('number');
      expect(typeof lockData.resource).toBe('string');

      // Validate ISO date format
      expect(() => new Date(lockData.created_at)).not.toThrow();
      expect(new Date(lockData.created_at).toISOString()).toBe(lockData.created_at);

      // Cleanup
      await lockManager.releaseLock('schema-test');
    });
  });

  describe('resource name sanitization', () => {
    it('should sanitize resource names with special characters', async () => {
      // When
      const result = await lockManager.acquireLock('my/weird resource.name');

      // Then
      expect(result).toBe(true);
      const sanitizedPath = path.join(LOCKS_DIR, 'my_weird_resource_name.lock');
      expect(fsSync.existsSync(sanitizedPath)).toBe(true);

      // Cleanup
      await lockManager.releaseLock('my/weird resource.name');
    });
  });
});
