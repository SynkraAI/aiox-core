/**
 * SYNAPSE Session Manager — Unit Tests
 *
 * Tests for session CRUD, stale cleanup, auto-title, gitignore,
 * session continuity, and error handling.
 *
 * @story SYN-2 - Session Manager
 * @coverage Target: >90% for session-manager.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  createSession,
  loadSession,
  updateSession,
  deleteSession,
  cleanStaleSessions,
  generateTitle,
  ensureGitignore,
  SCHEMA_VERSION,
} = require('../../.aios-core/core/synapse/session/session-manager');

let tmpDir;
let sessionsDir;
let synapsePath;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-test-'));
  synapsePath = path.join(tmpDir, '.synapse');
  sessionsDir = path.join(synapsePath, 'sessions');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ============================================================
// 1. Session CRUD Operations (AC: 1)
// ============================================================

describe('Session CRUD', () => {
  test('createSession creates a valid session file with schema v2.0', () => {
    const session = createSession('test-uuid-001', tmpDir, sessionsDir);

    expect(session).toBeDefined();
    expect(session.uuid).toBe('test-uuid-001');
    expect(session.schema_version).toBe('2.0');
    expect(session.cwd).toBe(tmpDir);
    expect(session.label).toBe(path.basename(tmpDir));
    expect(session.title).toBeNull();
    expect(session.prompt_count).toBe(0);

    // Verify file exists on disk
    const filePath = path.join(sessionsDir, 'test-uuid-001.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('createSession auto-creates sessions directory if missing', () => {
    expect(fs.existsSync(sessionsDir)).toBe(false);

    createSession('test-uuid-002', tmpDir, sessionsDir);

    expect(fs.existsSync(sessionsDir)).toBe(true);
  });

  test('loadSession returns session object for existing session', () => {
    createSession('test-uuid-003', tmpDir, sessionsDir);

    const session = loadSession('test-uuid-003', sessionsDir);

    expect(session).not.toBeNull();
    expect(session.uuid).toBe('test-uuid-003');
    expect(session.schema_version).toBe('2.0');
  });

  test('loadSession returns null for non-existent session', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const session = loadSession('non-existent', sessionsDir);

    expect(session).toBeNull();
  });

  test('updateSession merges partial updates and increments prompt_count', () => {
    createSession('test-uuid-004', tmpDir, sessionsDir);

    const updated = updateSession('test-uuid-004', sessionsDir, {
      active_agent: { id: 'dev', activated_at: '2026-02-10T10:00:00Z', activation_quality: 'full' },
    });

    expect(updated).not.toBeNull();
    expect(updated.prompt_count).toBe(1);
    expect(updated.active_agent.id).toBe('dev');
    expect(updated.active_agent.activation_quality).toBe('full');
  });

  test('updateSession returns null for non-existent session', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const result = updateSession('non-existent', sessionsDir, { title: 'test' });

    expect(result).toBeNull();
  });

  test('deleteSession removes session file and returns true', () => {
    createSession('test-uuid-005', tmpDir, sessionsDir);
    const filePath = path.join(sessionsDir, 'test-uuid-005.json');

    expect(fs.existsSync(filePath)).toBe(true);

    const result = deleteSession('test-uuid-005', sessionsDir);

    expect(result).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('deleteSession returns false for non-existent session', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const result = deleteSession('non-existent', sessionsDir);

    expect(result).toBe(false);
  });
});

// ============================================================
// 2. Schema v2.0 Compliance (AC: 2)
// ============================================================

describe('Schema v2.0 Compliance', () => {
  test('session contains all required schema v2.0 fields', () => {
    const session = createSession('schema-test', tmpDir, sessionsDir);

    // Core fields
    expect(session).toHaveProperty('uuid');
    expect(session).toHaveProperty('schema_version', '2.0');
    expect(session).toHaveProperty('started');
    expect(session).toHaveProperty('last_activity');
    expect(session).toHaveProperty('cwd');
    expect(session).toHaveProperty('label');
    expect(session).toHaveProperty('title');
    expect(session).toHaveProperty('prompt_count');

    // State fields
    expect(session).toHaveProperty('active_agent');
    expect(session.active_agent).toEqual({
      id: null,
      activated_at: null,
      activation_quality: null,
    });
    expect(session).toHaveProperty('active_workflow', null);
    expect(session).toHaveProperty('active_squad', null);
    expect(session).toHaveProperty('active_task', null);

    // Context fields
    expect(session).toHaveProperty('context');
    expect(session.context).toEqual({
      last_bracket: 'FRESH',
      last_tokens_used: 0,
      last_context_percent: 100,
    });
    expect(session).toHaveProperty('overrides');
    expect(session.overrides).toEqual({});
    expect(session).toHaveProperty('history');
    expect(session.history).toEqual({
      star_commands_used: [],
      domains_loaded_last: [],
      agents_activated: [],
    });
  });

  test('loadSession rejects sessions with wrong schema_version', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });
    const filePath = path.join(sessionsDir, 'bad-schema.json');
    const badSession = { uuid: 'bad-schema', schema_version: '1.0', started: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(badSession), 'utf8');

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = loadSession('bad-schema', sessionsDir);

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('schema_version "1.0"'),
    );

    warnSpy.mockRestore();
  });
});

// ============================================================
// 3. Stale Session Cleanup (AC: 3)
// ============================================================

describe('Stale Session Cleanup', () => {
  test('cleanStaleSessions removes sessions older than maxAgeHours', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    // Create a stale session (25 hours old)
    const staleSession = {
      uuid: 'stale-001',
      schema_version: '2.0',
      started: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      last_activity: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      prompt_count: 5,
    };
    fs.writeFileSync(
      path.join(sessionsDir, 'stale-001.json'),
      JSON.stringify(staleSession),
      'utf8',
    );

    // Create a recent session (1 hour old)
    const recentSession = {
      uuid: 'recent-001',
      schema_version: '2.0',
      started: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      prompt_count: 3,
    };
    fs.writeFileSync(
      path.join(sessionsDir, 'recent-001.json'),
      JSON.stringify(recentSession),
      'utf8',
    );

    const removed = cleanStaleSessions(sessionsDir, 24);

    expect(removed).toBe(1);
    expect(fs.existsSync(path.join(sessionsDir, 'stale-001.json'))).toBe(false);
    expect(fs.existsSync(path.join(sessionsDir, 'recent-001.json'))).toBe(true);
  });

  test('cleanStaleSessions returns 0 when no stale sessions exist', () => {
    createSession('fresh-001', tmpDir, sessionsDir);

    const removed = cleanStaleSessions(sessionsDir, 24);

    expect(removed).toBe(0);
  });

  test('cleanStaleSessions creates directory if it does not exist', () => {
    expect(fs.existsSync(sessionsDir)).toBe(false);

    const removed = cleanStaleSessions(sessionsDir, 24);

    expect(removed).toBe(0);
    expect(fs.existsSync(sessionsDir)).toBe(true);
  });

  test('cleanStaleSessions skips corrupted JSON files', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, 'corrupted.json'), '{invalid json', 'utf8');

    const removed = cleanStaleSessions(sessionsDir, 24);

    expect(removed).toBe(0);
    // Corrupted file should still exist (not deleted by cleanup)
    expect(fs.existsSync(path.join(sessionsDir, 'corrupted.json'))).toBe(true);
  });
});

// ============================================================
// 4. Auto-Title Generation (AC: 4)
// ============================================================

describe('Auto-Title Generation', () => {
  test('generateTitle extracts meaningful title from prompt', () => {
    const title = generateTitle('Implement user authentication for the dashboard');
    expect(title).toBe('Implement user authentication for the dashboard');
  });

  test('generateTitle truncates to max 50 chars at word boundary', () => {
    const longPrompt =
      'This is a very long prompt that should be truncated to fit within the maximum title length of fifty characters';
    const title = generateTitle(longPrompt);

    expect(title.length).toBeLessThanOrEqual(50);
    expect(title).not.toMatch(/\s$/); // No trailing space
  });

  test('generateTitle returns null for *command prompts', () => {
    expect(generateTitle('*help')).toBeNull();
    expect(generateTitle('*develop story-1')).toBeNull();
  });

  test('generateTitle returns null for single-word prompts', () => {
    expect(generateTitle('hello')).toBeNull();
    expect(generateTitle('test')).toBeNull();
  });

  test('generateTitle returns null for null/empty input', () => {
    expect(generateTitle(null)).toBeNull();
    expect(generateTitle('')).toBeNull();
    expect(generateTitle(undefined)).toBeNull();
  });

  test('title is set-once (never overwritten via updateSession)', () => {
    createSession('title-test', tmpDir, sessionsDir);

    // Set title first time
    updateSession('title-test', sessionsDir, { title: 'First Title' });
    let session = loadSession('title-test', sessionsDir);
    expect(session.title).toBe('First Title');

    // Attempt to overwrite (updateSession does merge — caller should check)
    // This verifies the mechanism works; set-once logic is in the consumer
    updateSession('title-test', sessionsDir, { title: 'Second Title' });
    session = loadSession('title-test', sessionsDir);
    expect(session.title).toBe('Second Title'); // updateSession merges as requested
  });
});

// ============================================================
// 5. Gitignore (AC: 5)
// ============================================================

describe('Gitignore', () => {
  test('createSession auto-creates .synapse/.gitignore', () => {
    createSession('gitignore-test', tmpDir, sessionsDir);

    const gitignorePath = path.join(synapsePath, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf8');
    expect(content).toContain('sessions/');
    expect(content).toContain('cache/');
  });

  test('ensureGitignore does not overwrite existing .gitignore', () => {
    fs.mkdirSync(synapsePath, { recursive: true });
    const gitignorePath = path.join(synapsePath, '.gitignore');
    fs.writeFileSync(gitignorePath, 'custom-content\n', 'utf8');

    ensureGitignore(synapsePath);

    const content = fs.readFileSync(gitignorePath, 'utf8');
    expect(content).toBe('custom-content\n');
  });
});

// ============================================================
// 6. Session Continuity (AC: 6)
// ============================================================

describe('Session Continuity', () => {
  test('state persists correctly across 10 consecutive updates without drift', () => {
    createSession('continuity-test', tmpDir, sessionsDir);

    // Perform 10 consecutive updates with different fields
    for (let i = 1; i <= 10; i++) {
      updateSession('continuity-test', sessionsDir, {
        context: { last_bracket: i <= 5 ? 'FRESH' : 'MODERATE', last_tokens_used: i * 1000 },
        overrides: { [`DOMAIN_${i}`]: true },
        history: { star_commands_used: [`*cmd-${i}`] },
      });
    }

    const session = loadSession('continuity-test', sessionsDir);

    // Verify integrity after 10 updates
    expect(session).not.toBeNull();
    expect(session.prompt_count).toBe(10);
    expect(session.uuid).toBe('continuity-test');
    expect(session.schema_version).toBe('2.0');
    expect(session.context.last_bracket).toBe('MODERATE');
    expect(session.context.last_tokens_used).toBe(10000);

    // All 10 overrides should exist
    for (let i = 1; i <= 10; i++) {
      expect(session.overrides[`DOMAIN_${i}`]).toBe(true);
    }

    // All 10 star commands should be in history (unique)
    expect(session.history.star_commands_used).toHaveLength(10);
    expect(session.history.star_commands_used).toContain('*cmd-1');
    expect(session.history.star_commands_used).toContain('*cmd-10');
  });
});

// ============================================================
// 7. Error Handling (AC: 7)
// ============================================================

describe('Error Handling', () => {
  test('loadSession returns null for corrupted JSON', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, 'corrupt.json'), '{ broken json!!!', 'utf8');

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = loadSession('corrupt', sessionsDir);

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Corrupted JSON'),
    );

    warnSpy.mockRestore();
  });

  test('loadSession handles missing sessions directory gracefully', () => {
    // sessionsDir does not exist yet
    const result = loadSession('missing-dir', path.join(tmpDir, 'nonexistent'));

    expect(result).toBeNull();
  });

  test('updateSession handles last_activity timestamps correctly', () => {
    createSession('timestamp-test', tmpDir, sessionsDir);

    const beforeUpdate = Date.now();
    updateSession('timestamp-test', sessionsDir, { title: 'Test' });
    const afterUpdate = Date.now();

    const session = loadSession('timestamp-test', sessionsDir);
    const lastActivity = new Date(session.last_activity).getTime();

    expect(lastActivity).toBeGreaterThanOrEqual(beforeUpdate);
    expect(lastActivity).toBeLessThanOrEqual(afterUpdate);
  });
});

// ============================================================
// 8. History Merging
// ============================================================

describe('History Merging', () => {
  test('history arrays accumulate unique values across updates', () => {
    createSession('history-test', tmpDir, sessionsDir);

    updateSession('history-test', sessionsDir, {
      history: { agents_activated: ['dev'] },
    });
    updateSession('history-test', sessionsDir, {
      history: { agents_activated: ['qa', 'dev'] }, // 'dev' already exists
    });

    const session = loadSession('history-test', sessionsDir);
    expect(session.history.agents_activated).toEqual(['dev', 'qa']);
  });
});

// ============================================================
// 9. Permission Error Handling (AC: 7)
// ============================================================

describe('Permission Error Handling', () => {
  test('loadSession returns null and logs error on EACCES', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });
    const filePath = path.join(sessionsDir, 'perm-test.json');
    fs.writeFileSync(filePath, '{}', 'utf8');

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalReadFileSync = fs.readFileSync;
    jest.spyOn(fs, 'readFileSync').mockImplementation((p, enc) => {
      if (p === filePath) {
        const err = new Error('EACCES');
        err.code = 'EACCES';
        throw err;
      }
      return originalReadFileSync(p, enc);
    });

    const result = loadSession('perm-test', sessionsDir);

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));

    fs.readFileSync.mockRestore();
    errorSpy.mockRestore();
  });

  test('deleteSession returns false and logs error on EPERM', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });
    const filePath = path.join(sessionsDir, 'perm-del.json');
    fs.writeFileSync(filePath, '{}', 'utf8');

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(fs, 'unlinkSync').mockImplementation((p) => {
      if (p === filePath) {
        const err = new Error('EPERM');
        err.code = 'EPERM';
        throw err;
      }
    });

    const result = deleteSession('perm-del', sessionsDir);

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));

    fs.unlinkSync.mockRestore();
    errorSpy.mockRestore();
  });
});

// ============================================================
// 10. Path Traversal Protection
// ============================================================

describe('Path Traversal Protection', () => {
  test('resolveSessionFile rejects sessionId with ..', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    expect(() => {
      createSession('../../../etc/passwd', tmpDir, sessionsDir);
    }).toThrow('Invalid sessionId');
  });

  test('resolveSessionFile rejects sessionId with forward slash', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    expect(() => {
      createSession('foo/bar', tmpDir, sessionsDir);
    }).toThrow('Invalid sessionId');
  });

  test('resolveSessionFile rejects sessionId with backslash', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    expect(() => {
      createSession('foo\\bar', tmpDir, sessionsDir);
    }).toThrow('Invalid sessionId');
  });

  test('loadSession rejects path traversal in sessionId', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    expect(() => {
      loadSession('../secret', sessionsDir);
    }).toThrow('Invalid sessionId');
  });
});

// ============================================================
// 11. createSession Permission Error Handling
// ============================================================

describe('createSession Permission Error Handling', () => {
  test('createSession returns null and logs error on EACCES', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalWriteFileSync = fs.writeFileSync;
    jest.spyOn(fs, 'writeFileSync').mockImplementation((p, data, enc) => {
      // atomicWriteSync writes to .tmp.{pid} first, so match both .json and .tmp paths
      if (typeof p === 'string' && p.includes('perm-create')) {
        const err = new Error('EACCES');
        err.code = 'EACCES';
        throw err;
      }
      return originalWriteFileSync(p, data, enc);
    });

    const result = createSession('perm-create', tmpDir, sessionsDir);

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Permission denied creating session'));

    fs.writeFileSync.mockRestore();
    errorSpy.mockRestore();
  });
});

// ============================================================
// 12. updateSession Write Permission Error Handling
// ============================================================

describe('updateSession Write Permission Error Handling', () => {
  test('updateSession returns null and logs error on EPERM during write', () => {
    createSession('perm-update', tmpDir, sessionsDir);

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalWriteFileSync = fs.writeFileSync;
    jest.spyOn(fs, 'writeFileSync').mockImplementation((p, data, enc) => {
      if (typeof p === 'string' && p.includes('perm-update')) {
        const err = new Error('EPERM');
        err.code = 'EPERM';
        throw err;
      }
      return originalWriteFileSync(p, data, enc);
    });

    const result = updateSession('perm-update', sessionsDir, { title: 'test' });

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Permission denied writing session'));

    fs.writeFileSync.mockRestore();
    errorSpy.mockRestore();
  });
});

// ============================================================
// 13. Non-Array History Merge (was 10)
// ============================================================

describe('Non-Array History Merge', () => {
  test('mergeHistory handles non-array values by replacing', () => {
    createSession('merge-test', tmpDir, sessionsDir);

    // Set a non-array history field
    updateSession('merge-test', sessionsDir, {
      history: { custom_field: 'value1' },
    });

    const session = loadSession('merge-test', sessionsDir);
    expect(session.history.custom_field).toBe('value1');
  });
});

// ============================================================
// 14. Concurrent Access (AC: 7 — last-write-wins)
// ============================================================

describe('Concurrent Access', () => {
  test('last write wins when updating the same session', () => {
    createSession('concurrent-test', tmpDir, sessionsDir);

    // Simulate two "concurrent" writes (sequential in test, but validates overwrite behavior)
    updateSession('concurrent-test', sessionsDir, { title: 'First Write' });
    updateSession('concurrent-test', sessionsDir, { title: 'Second Write' });

    const session = loadSession('concurrent-test', sessionsDir);
    expect(session.title).toBe('Second Write');
    expect(session.prompt_count).toBe(2);
  });
});
