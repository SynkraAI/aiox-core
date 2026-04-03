import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LockManager } from '../../src/scheduler/lock-manager.js';

describe('LockManager', () => {
  let tmpDir;
  let lockFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-lock-'));
    lockFile = path.join(tmpDir, 'test.lock');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('acquire succeeds when no lock exists', () => {
    const lm = new LockManager({ lockFile });
    expect(lm.acquire()).toBe(true);
    expect(fs.existsSync(lockFile)).toBe(true);
  });

  test('acquire fails when lock already held', () => {
    const lm = new LockManager({ lockFile });
    expect(lm.acquire()).toBe(true);
    expect(lm.acquire()).toBe(false);
  });

  test('release removes lock file', () => {
    const lm = new LockManager({ lockFile });
    lm.acquire();
    lm.release();
    expect(fs.existsSync(lockFile)).toBe(false);
  });

  test('isLocked returns correct state', () => {
    const lm = new LockManager({ lockFile });
    expect(lm.isLocked()).toBe(false);

    lm.acquire();
    expect(lm.isLocked()).toBe(true);

    lm.release();
    expect(lm.isLocked()).toBe(false);
  });

  test('getLockInfo returns lock data', () => {
    const lm = new LockManager({ lockFile });
    lm.acquire();

    const info = lm.getLockInfo();
    expect(info).not.toBeNull();
    expect(info.pid).toBe(process.pid);
    expect(info.acquiredAt).toBeDefined();
    expect(info.ttlMs).toBeDefined();
  });

  test('getLockInfo returns null when no lock', () => {
    const lm = new LockManager({ lockFile });
    expect(lm.getLockInfo()).toBeNull();
  });

  test('stale lock is auto-released', () => {
    const lm = new LockManager({ lockFile, ttlMs: 100 });
    lm.acquire();

    // Manually set acquiredAt to the past
    const data = JSON.parse(fs.readFileSync(lockFile, 'utf-8'));
    data.acquiredAt = new Date(Date.now() - 200).toISOString();
    data.ttlMs = 100;
    fs.writeFileSync(lockFile, JSON.stringify(data));

    // New acquire should succeed (stale lock removed)
    const lm2 = new LockManager({ lockFile, ttlMs: 100 });
    expect(lm2.acquire()).toBe(true);
  });

  test('corrupted lock file treated as stale', () => {
    const lm = new LockManager({ lockFile, ttlMs: 100 });
    fs.writeFileSync(lockFile, 'not json', { flag: 'wx' });

    expect(lm.isLocked()).toBe(false);
  });

  test('refresh updates timestamp', () => {
    const lm = new LockManager({ lockFile });
    lm.acquire();

    const before = JSON.parse(fs.readFileSync(lockFile, 'utf-8')).acquiredAt;

    // Small delay to ensure different timestamp
    const now = new Date(Date.now() + 1000).toISOString();
    lm.refresh();

    const after = JSON.parse(fs.readFileSync(lockFile, 'utf-8')).acquiredAt;
    expect(after).not.toBe(before);
  });
});
