/**
 * SYNAPSE Hook Entry Point — Unit Tests
 *
 * Tests for stdin/stdout JSON protocol, silent exit, error handling,
 * output format validation, and engine delegation.
 *
 * @module tests/synapse/hook-entry
 * @story SYN-7 - Hook Entry Point + Registration
 * @coverage Target: >90% for synapse-engine.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

jest.setTimeout(15000);

const HOOK_PATH = path.resolve(__dirname, '../../.claude/hooks/synapse-engine.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run the hook as a child process with given stdin data.
 * @param {*} stdinData - Data to pipe to stdin (stringified if object)
 * @param {number} [timeout=5000] - Process timeout in ms
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
function runHook(stdinData, timeout = 5000) {
  return new Promise((resolve) => {
    const proc = spawn('node', [HOOK_PATH], {
      timeout,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { stderr += d; });
    proc.on('close', (code) => {
      resolve({ stdout, stderr, code: code || 0 });
    });
    proc.on('error', () => {
      resolve({ stdout, stderr, code: 1 });
    });
    if (stdinData !== undefined) {
      const str = typeof stdinData === 'string' ? stdinData : JSON.stringify(stdinData);
      proc.stdin.write(str);
    }
    proc.stdin.end();
  });
}

/**
 * Create a temporary project directory with mock SYNAPSE modules.
 * @param {object} [opts] - Options for mock behavior
 * @param {boolean} [opts.noSynapse=false] - Skip creating .synapse/
 * @param {string} [opts.engineCode] - Custom engine.js code
 * @param {string} [opts.sessionCode] - Custom session-manager.js code
 * @returns {string} Path to temp project directory
 */
function createMockProject(opts = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-hook-test-'));

  if (!opts.noSynapse) {
    fs.mkdirSync(path.join(tmpDir, '.synapse', 'sessions'), { recursive: true });
  }

  const engineDir = path.join(tmpDir, '.aios-core', 'core', 'synapse');
  fs.mkdirSync(engineDir, { recursive: true });

  const engineCode = opts.engineCode || `
    class SynapseEngine {
      constructor(synapsePath) { this.synapsePath = synapsePath; }
      process(prompt, session) {
        return {
          xml: '<synapse-rules>\\nmocked output for: ' + prompt + '\\n</synapse-rules>',
          metrics: { layers: 4, elapsed: 12 },
        };
      }
    }
    module.exports = { SynapseEngine };
  `;
  fs.writeFileSync(path.join(engineDir, 'engine.js'), engineCode);

  const sessionDir = path.join(engineDir, 'session');
  fs.mkdirSync(sessionDir, { recursive: true });

  const sessionCode = opts.sessionCode || `
    function loadSession(sessionId, sessionsDir) {
      return { prompt_count: 5 };
    }
    module.exports = { loadSession };
  `;
  fs.writeFileSync(path.join(sessionDir, 'session-manager.js'), sessionCode);

  return tmpDir;
}

/**
 * Build a valid hook input object.
 * @param {string} cwd - Project directory
 * @param {object} [overrides] - Fields to override
 * @returns {object}
 */
function buildInput(cwd, overrides = {}) {
  return {
    sessionId: 'test-session-001',
    cwd,
    prompt: 'test prompt',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test Suites
// ---------------------------------------------------------------------------

describe('SYNAPSE Hook Entry Point (synapse-engine.js)', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // ==========================================================================
  // 1. stdin/stdout Protocol (AC: 1)
  // ==========================================================================

  describe('stdin/stdout JSON protocol', () => {
    test('valid input produces valid JSON output on stdout', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir);
      const { stdout, code } = await runHook(input);

      expect(code).toBe(0);
      expect(stdout).toBeTruthy();

      const output = JSON.parse(stdout);
      expect(output).toHaveProperty('hookSpecificOutput');
      expect(output.hookSpecificOutput).toHaveProperty('additionalContext');
    });

    test('additionalContext contains engine XML output', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir, { prompt: 'hello world' });
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      expect(output.hookSpecificOutput.additionalContext).toContain('<synapse-rules>');
      expect(output.hookSpecificOutput.additionalContext).toContain('hello world');
    });

    test('output is a single JSON object (no trailing data)', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir);
      const { stdout } = await runHook(input);

      // Should parse without error and be the complete output
      const output = JSON.parse(stdout);
      expect(typeof output).toBe('object');
    });
  });

  // ==========================================================================
  // 2. Silent Exit on Missing .synapse/ (AC: 2)
  // ==========================================================================

  describe('silent exit when .synapse/ missing', () => {
    test('exits with code 0 when .synapse/ does not exist', async () => {
      tmpDir = createMockProject({ noSynapse: true });
      const input = buildInput(tmpDir);
      const { stdout, stderr, code } = await runHook(input);

      expect(code).toBe(0);
      expect(stdout).toBe('');
      expect(stderr).toBe('');
    });

    test('produces zero stdout when .synapse/ does not exist', async () => {
      tmpDir = createMockProject({ noSynapse: true });
      const input = buildInput(tmpDir);
      const { stdout } = await runHook(input);

      expect(stdout).toBe('');
    });

    test('produces zero stderr when .synapse/ does not exist', async () => {
      tmpDir = createMockProject({ noSynapse: true });
      const input = buildInput(tmpDir);
      const { stderr } = await runHook(input);

      expect(stderr).toBe('');
    });
  });

  // ==========================================================================
  // 3. Error Handling (AC: 3)
  // ==========================================================================

  describe('global error handling', () => {
    test('exits silently with code 0 on invalid JSON input', async () => {
      const { stdout, code } = await runHook('not valid json {{{');

      expect(code).toBe(0);
      expect(stdout).toBe('');
    });

    test('logs error to stderr with [synapse-hook] prefix on invalid JSON', async () => {
      const { stderr } = await runHook('not valid json');

      expect(stderr).toContain('[synapse-hook]');
    });

    test('exits silently when engine.process() throws', async () => {
      tmpDir = createMockProject({
        engineCode: `
          class SynapseEngine {
            constructor() {}
            process() { throw new Error('Engine exploded'); }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const input = buildInput(tmpDir);
      const { stdout, stderr, code } = await runHook(input);

      expect(code).toBe(0);
      expect(stdout).toBe('');
      expect(stderr).toContain('[synapse-hook]');
    });

    test('exits silently when SynapseEngine constructor throws', async () => {
      tmpDir = createMockProject({
        engineCode: `
          class SynapseEngine {
            constructor() { throw new Error('Constructor failed'); }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const input = buildInput(tmpDir);
      const { stdout, code } = await runHook(input);

      expect(code).toBe(0);
      expect(stdout).toBe('');
    });

    test('exits silently when session-manager module is missing', async () => {
      tmpDir = createMockProject({
        sessionCode: 'throw new Error(\'module broken\');',
      });
      const input = buildInput(tmpDir);
      const { stdout, code } = await runHook(input);

      expect(code).toBe(0);
      expect(stdout).toBe('');
    });

    test('exits silently on empty stdin', async () => {
      const { stdout, code } = await runHook('');

      expect(code).toBe(0);
      expect(stdout).toBe('');
    });
  });

  // ==========================================================================
  // 4. Output Format Validation (AC: 1)
  // ==========================================================================

  describe('output format', () => {
    test('output matches { hookSpecificOutput: { additionalContext: string } }', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir);
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      expect(typeof output.hookSpecificOutput.additionalContext).toBe('string');
      expect(Object.keys(output)).toEqual(['hookSpecificOutput']);
      expect(Object.keys(output.hookSpecificOutput)).toEqual(['additionalContext']);
    });

    test('additionalContext is empty string when engine returns no xml', async () => {
      tmpDir = createMockProject({
        engineCode: `
          class SynapseEngine {
            constructor() {}
            process() { return { metrics: {} }; }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const input = buildInput(tmpDir);
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      expect(output.hookSpecificOutput.additionalContext).toBe('');
    });
  });

  // ==========================================================================
  // 5. Engine Delegation (AC: 1)
  // ==========================================================================

  describe('engine delegation', () => {
    test('engine.process() receives prompt and session arguments', async () => {
      tmpDir = createMockProject({
        engineCode: `
          class SynapseEngine {
            constructor() {}
            process(prompt, session) {
              return {
                xml: JSON.stringify({ receivedPrompt: prompt, receivedSession: session }),
                metrics: {},
              };
            }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const input = buildInput(tmpDir, { prompt: 'my test prompt' });
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      const delegated = JSON.parse(output.hookSpecificOutput.additionalContext);
      expect(delegated.receivedPrompt).toBe('my test prompt');
      expect(delegated.receivedSession).toEqual({ prompt_count: 5 });
    });

    test('uses fallback session { prompt_count: 0 } when loadSession returns null', async () => {
      tmpDir = createMockProject({
        sessionCode: `
          function loadSession() { return null; }
          module.exports = { loadSession };
        `,
        engineCode: `
          class SynapseEngine {
            constructor() {}
            process(prompt, session) {
              return { xml: JSON.stringify({ session }), metrics: {} };
            }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const input = buildInput(tmpDir);
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      const delegated = JSON.parse(output.hookSpecificOutput.additionalContext);
      expect(delegated.session).toEqual({ prompt_count: 0 });
    });

    test('SynapseEngine receives .synapse path as constructor argument', async () => {
      tmpDir = createMockProject({
        engineCode: `
          class SynapseEngine {
            constructor(synapsePath) {
              this.synapsePath = synapsePath;
            }
            process() {
              return { xml: this.synapsePath, metrics: {} };
            }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const input = buildInput(tmpDir);
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      const expectedPath = path.join(tmpDir, '.synapse');
      expect(output.hookSpecificOutput.additionalContext).toBe(expectedPath);
    });
  });

  // ==========================================================================
  // 6. Performance (AC: 7)
  // ==========================================================================

  describe('performance', () => {
    test('hook completes within 2000ms (including spawn overhead)', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir);
      const start = Date.now();
      const { code } = await runHook(input);
      const elapsed = Date.now() - start;

      expect(code).toBe(0);
      // Node.js spawn overhead ~50-500ms on Windows; hook logic itself <100ms
      expect(elapsed).toBeLessThan(2000);
    });

    test('startup check (.synapse/ missing) completes within 1500ms', async () => {
      tmpDir = createMockProject({ noSynapse: true });
      const input = buildInput(tmpDir);
      const start = Date.now();
      await runHook(input);
      const elapsed = Date.now() - start;

      // Fast-exit path: no dynamic requires loaded
      expect(elapsed).toBeLessThan(1500);
    });
  });

  // ==========================================================================
  // 7. Hook Registration Verification (AC: 4)
  // ==========================================================================

  describe('hook registration', () => {
    test('hook file exists at expected path', () => {
      expect(fs.existsSync(HOOK_PATH)).toBe(true);
    });

    test('hook file is less than 120 lines', () => {
      const content = fs.readFileSync(HOOK_PATH, 'utf8');
      const lines = content.split('\n').length;
      expect(lines).toBeLessThanOrEqual(120);
    });

    test('hook file uses CommonJS (no import/export)', () => {
      const content = fs.readFileSync(HOOK_PATH, 'utf8');
      expect(content).not.toMatch(/^import\s/m);
      expect(content).not.toMatch(/^export\s/m);
      expect(content).toContain('require(');
    });

    test('settings.local.json has SYNAPSE hook registered', () => {
      const settingsPath = path.resolve(__dirname, '../../.claude/settings.local.json');
      if (!fs.existsSync(settingsPath)) {
        // Settings may not exist in CI — skip gracefully
        return;
      }
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      // Skip if hooks are not configured (optional user configuration)
      if (!settings.hooks || !settings.hooks.UserPromptSubmit) {
        // SYNAPSE hook is optional user configuration — skip gracefully
        return;
      }

      const hookEntries = settings.hooks.UserPromptSubmit;
      const synapseHook = hookEntries.find((entry) =>
        entry.hooks && entry.hooks.some((h) => h.command && h.command.includes('synapse-engine.js')),
      );
      expect(synapseHook).toBeDefined();
    });
  });

  // ==========================================================================
  // 8. Direct Module Tests (Jest coverage — via require)
  // ==========================================================================

  describe('direct module exports (Jest coverage)', () => {
    const hookModule = require('../../.claude/hooks/synapse-engine.js');

    test('exports readStdin function', () => {
      expect(typeof hookModule.readStdin).toBe('function');
    });

    test('exports main function', () => {
      expect(typeof hookModule.main).toBe('function');
    });

    test('exports HOOK_TIMEOUT_MS constant set to 5000', () => {
      expect(hookModule.HOOK_TIMEOUT_MS).toBe(5000);
    });

    test('readStdin rejects on invalid JSON from stream', async () => {
      const { Readable } = require('stream');
      const originalStdin = process.stdin;

      const mockStdin = new Readable({ read() {} });
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

      try {
        const promise = hookModule.readStdin();
        mockStdin.push('not json');
        mockStdin.push(null);

        await expect(promise).rejects.toThrow();
      } finally {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
      }
    });

    test('readStdin resolves valid JSON from stream', async () => {
      const { Readable } = require('stream');
      const originalStdin = process.stdin;

      const mockStdin = new Readable({ read() {} });
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

      try {
        const promise = hookModule.readStdin();
        mockStdin.push('{"hello":"world"}');
        mockStdin.push(null);

        const result = await promise;
        expect(result).toEqual({ hello: 'world' });
      } finally {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
      }
    });

    test('main() processes input and writes to stdout in-process', async () => {
      const { Readable } = require('stream');
      tmpDir = createMockProject();
      const originalStdin = process.stdin;
      const originalWrite = process.stdout.write;

      const mockStdin = new Readable({ read() {} });
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

      let captured = '';
      process.stdout.write = (data) => { captured += data; return true; };

      try {
        const mainPromise = hookModule.main();
        mockStdin.push(JSON.stringify(buildInput(tmpDir)));
        mockStdin.push(null);
        await mainPromise;

        const output = JSON.parse(captured);
        expect(output.hookSpecificOutput.additionalContext).toContain('<synapse-rules>');
      } finally {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
        process.stdout.write = originalWrite;
      }
    });

    test('main() returns silently when .synapse/ is missing', async () => {
      const { Readable } = require('stream');
      tmpDir = createMockProject({ noSynapse: true });
      const originalStdin = process.stdin;
      const originalWrite = process.stdout.write;

      const mockStdin = new Readable({ read() {} });
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

      let captured = '';
      process.stdout.write = (data) => { captured += data; return true; };

      try {
        const mainPromise = hookModule.main();
        mockStdin.push(JSON.stringify(buildInput(tmpDir)));
        mockStdin.push(null);
        await mainPromise;

        expect(captured).toBe('');
      } finally {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
        process.stdout.write = originalWrite;
      }
    });

    test('main() uses fallback session when loadSession returns null in-process', async () => {
      const { Readable } = require('stream');
      tmpDir = createMockProject({
        sessionCode: `
          function loadSession() { return null; }
          module.exports = { loadSession };
        `,
        engineCode: `
          class SynapseEngine {
            constructor() {}
            process(prompt, session) {
              return { xml: JSON.stringify({ pc: session.prompt_count }), metrics: {} };
            }
          }
          module.exports = { SynapseEngine };
        `,
      });
      const originalStdin = process.stdin;
      const originalWrite = process.stdout.write;

      const mockStdin = new Readable({ read() {} });
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

      let captured = '';
      process.stdout.write = (data) => { captured += data; return true; };

      try {
        const mainPromise = hookModule.main();
        mockStdin.push(JSON.stringify(buildInput(tmpDir)));
        mockStdin.push(null);
        await mainPromise;

        const output = JSON.parse(captured);
        const inner = JSON.parse(output.hookSpecificOutput.additionalContext);
        expect(inner.pc).toBe(0);
      } finally {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
        process.stdout.write = originalWrite;
      }
    });
  });

  // ==========================================================================
  // 9. run() Entry Point (defense-in-depth timeout)
  // ==========================================================================

  describe('run() entry point', () => {
    const hookModule = require('../../.claude/hooks/synapse-engine.js');

    test('run() sets safety timeout, catches errors, and exits with 0', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { Readable } = require('stream');
      const originalStdin = process.stdin;

      // Temporarily clear JEST_WORKER_ID so safeExit() calls process.exit()
      const savedWorkerId = process.env.JEST_WORKER_ID;
      delete process.env.JEST_WORKER_ID;

      const mockStdin = new Readable({ read() {} });
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

      try {
        hookModule.run();
        mockStdin.push(null); // empty stdin → JSON parse error → catch

        // Wait for async catch handler to complete
        await new Promise((r) => setTimeout(r, 50));

        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[synapse-hook]'),
        );
      } finally {
        // Restore JEST_WORKER_ID before restoring other mocks
        if (savedWorkerId !== undefined) {
          process.env.JEST_WORKER_ID = savedWorkerId;
        }
        exitSpy.mockRestore();
        errorSpy.mockRestore();
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
      }
    });

    test('HOOK_TIMEOUT_MS is 5000 (defense-in-depth)', () => {
      expect(hookModule.HOOK_TIMEOUT_MS).toBe(5000);
    });
  });

  // ==========================================================================
  // 10. .gitignore Verification (AC: 6)
  // ==========================================================================

  describe('gitignore entries', () => {
    test('.gitignore contains .synapse/sessions/', () => {
      const gitignorePath = path.resolve(__dirname, '../../.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf8');
      expect(content).toContain('.synapse/sessions/');
    });

    test('.gitignore contains .synapse/cache/', () => {
      const gitignorePath = path.resolve(__dirname, '../../.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf8');
      expect(content).toContain('.synapse/cache/');
    });

    test('.gitignore has exception for synapse-engine.js hook', () => {
      const gitignorePath = path.resolve(__dirname, '../../.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf8');
      expect(content).toContain('!.claude/hooks/synapse-engine.js');
    });
  });
});
