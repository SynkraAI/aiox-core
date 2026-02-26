'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  resolveHookRuntime,
  buildHookOutput,
} = require('../../.aios-core/core/synapse/runtime/hook-runtime');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hook-runtime-'));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

describe('hook-runtime', () => {
  it('returns null when cwd is missing', () => {
    expect(resolveHookRuntime({})).toBeNull();
    expect(resolveHookRuntime()).toBeNull();
  });

  it('returns null when .synapse folder does not exist', () => {
    const cwd = makeTempDir();
    try {
      expect(resolveHookRuntime({ cwd, sessionId: 'abc' })).toBeNull();
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('resolves runtime when required modules and .synapse exist', () => {
    const cwd = makeTempDir();
    try {
      fs.mkdirSync(path.join(cwd, '.synapse', 'sessions'), { recursive: true });

      writeFile(
        path.join(cwd, '.aios-core/core/synapse/session/session-manager.js'),
        "module.exports = { loadSession: () => ({ prompt_count: 7, id: 's-1' }), cleanStaleSessions: () => 0 };",
      );
      writeFile(
        path.join(cwd, '.aios-core/core/synapse/engine.js'),
        [
          'class SynapseEngine {',
          '  constructor(synapsePath) {',
          '    this.synapsePath = synapsePath;',
          '  }',
          '}',
          'module.exports = { SynapseEngine };',
        ].join('\n'),
      );

      const result = resolveHookRuntime({ cwd, sessionId: 's-1' });
      expect(result).toBeTruthy();
      expect(result.session).toEqual({ prompt_count: 7, id: 's-1' });
      expect(result.engine).toBeTruthy();
      expect(result.engine.synapsePath).toBe(path.join(cwd, '.synapse'));
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('calls cleanStaleSessions on first prompt (prompt_count === 0)', () => {
    const cwd = makeTempDir();
    try {
      fs.mkdirSync(path.join(cwd, '.synapse', 'sessions'), { recursive: true });

      // Mock session-manager with prompt_count: 0 and trackable cleanStaleSessions
      let cleanupCalled = false;
      writeFile(
        path.join(cwd, '.aios-core/core/synapse/session/session-manager.js'),
        [
          'let called = false;',
          'module.exports = {',
          "  loadSession: () => ({ prompt_count: 0, id: 'new-session' }),",
          '  cleanStaleSessions: (dir, ttl) => { called = true; return 0; },',
          '  _wasCalled: () => called,',
          '};',
        ].join('\n'),
      );
      writeFile(
        path.join(cwd, '.aios-core/core/synapse/engine.js'),
        [
          'class SynapseEngine { constructor(sp) { this.synapsePath = sp; } }',
          'module.exports = { SynapseEngine };',
        ].join('\n'),
      );

      // Clear require cache for the mock
      const smPath = path.join(cwd, '.aios-core', 'core', 'synapse', 'session', 'session-manager.js');
      const engPath = path.join(cwd, '.aios-core', 'core', 'synapse', 'engine.js');
      delete require.cache[require.resolve(smPath)];
      delete require.cache[require.resolve(engPath)];

      const result = resolveHookRuntime({ cwd, sessionId: 'new-session' });
      expect(result).toBeTruthy();

      // Verify cleanup was called
      const sm = require(smPath);
      expect(sm._wasCalled()).toBe(true);

      // Clean require cache
      delete require.cache[require.resolve(smPath)];
      delete require.cache[require.resolve(engPath)];
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('does NOT call cleanStaleSessions when prompt_count > 0', () => {
    const cwd = makeTempDir();
    try {
      fs.mkdirSync(path.join(cwd, '.synapse', 'sessions'), { recursive: true });

      writeFile(
        path.join(cwd, '.aios-core/core/synapse/session/session-manager.js'),
        [
          'let called = false;',
          'module.exports = {',
          "  loadSession: () => ({ prompt_count: 5, id: 'existing' }),",
          '  cleanStaleSessions: () => { called = true; return 0; },',
          '  _wasCalled: () => called,',
          '};',
        ].join('\n'),
      );
      writeFile(
        path.join(cwd, '.aios-core/core/synapse/engine.js'),
        [
          'class SynapseEngine { constructor(sp) { this.synapsePath = sp; } }',
          'module.exports = { SynapseEngine };',
        ].join('\n'),
      );

      const smPath = path.join(cwd, '.aios-core', 'core', 'synapse', 'session', 'session-manager.js');
      const engPath = path.join(cwd, '.aios-core', 'core', 'synapse', 'engine.js');
      delete require.cache[require.resolve(smPath)];
      delete require.cache[require.resolve(engPath)];

      const result = resolveHookRuntime({ cwd, sessionId: 'existing' });
      expect(result).toBeTruthy();

      const sm = require(smPath);
      expect(sm._wasCalled()).toBe(false);

      delete require.cache[require.resolve(smPath)];
      delete require.cache[require.resolve(engPath)];
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('builds normalized hook output for xml and falsy values', () => {
    expect(buildHookOutput('<xml/>')).toEqual({
      hookSpecificOutput: { additionalContext: '<xml/>' },
    });
    expect(buildHookOutput('')).toEqual({
      hookSpecificOutput: { additionalContext: '' },
    });
    expect(buildHookOutput(null)).toEqual({
      hookSpecificOutput: { additionalContext: '' },
    });
  });
});
