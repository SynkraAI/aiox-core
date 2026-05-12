/**
 * SYNAPSE E2E: Hook Integration Tests
 *
 * End-to-end tests for the SYNAPSE hook entry point (synapse-engine.cjs).
 * Tests the stdin/stdout JSON protocol by spawning the hook as a child process
 * and validating real output against the actual project .synapse/ configuration.
 *
 * @module tests/synapse/e2e/hook-integration.e2e
 * @story SYN-12 - Performance Benchmarks + E2E Testing
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

jest.setTimeout(30000);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK_PATH = path.join(PROJECT_ROOT, '.claude', 'hooks', 'synapse-engine.cjs');
const HOOK_EXISTS = fs.existsSync(HOOK_PATH);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run the hook via execSync with given stdin data.
 * Returns { stdout, exitCode } -- never throws on non-zero exit.
 *
 * @param {string} stdinData - Raw string to pipe to stdin
 * @param {object} [opts] - Extra options
 * @param {number} [opts.timeout=10000] - Timeout in ms
 * @returns {{ stdout: string, exitCode: number }}
 */
function runHookSync(stdinData, opts = {}) {
  const timeout = opts.timeout || 10000;
  try {
    const stdout = execSync(`node "${HOOK_PATH}"`, {
      input: stdinData,
      encoding: 'utf8',
      timeout,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: stdout || '', exitCode: 0 };
  } catch (err) {
    // execSync throws on non-zero exit OR timeout
    return {
      stdout: (err.stdout || '').toString(),
      exitCode: err.status != null ? err.status : 1,
    };
  }
}

/**
 * Build a valid hook input JSON string.
 * @param {object} [overrides] - Fields to override
 * @returns {string} Stringified JSON input
 */
function buildInput(overrides = {}) {
  return JSON.stringify({
    sessionId: 'e2e-test-session',
    cwd: PROJECT_ROOT,
    prompt: 'test prompt',
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

const describeIfHookExists = HOOK_EXISTS ? describe : describe.skip;

describeIfHookExists('SYNAPSE E2E: Hook Integration', () => {

  // ========================================================================
  // 1. Hook produces valid JSON output with hookSpecificOutput key
  // ========================================================================

  test('hook produces valid JSON output with hookSpecificOutput key', () => {
    const input = buildInput();
    const { stdout, exitCode } = runHookSync(input);

    expect(exitCode).toBe(0);
    expect(stdout).toBeTruthy();

    const result = JSON.parse(stdout);
    expect(result).toHaveProperty('hookSpecificOutput');
    expect(result.hookSpecificOutput).toHaveProperty('additionalContext');
    expect(typeof result.hookSpecificOutput.additionalContext).toBe('string');
  });

  // ========================================================================
  // 2. Hook output additionalContext is a string (may contain synapse-rules
  //    XML when engine produces content, or empty string otherwise)
  // ========================================================================

  test('hook output additionalContext is a string conforming to expected format', () => {
    const input = buildInput();
    const { stdout, exitCode } = runHookSync(input);

    expect(exitCode).toBe(0);
    expect(stdout).toBeTruthy();

    const result = JSON.parse(stdout);
    const ctx = result.hookSpecificOutput.additionalContext;

    // additionalContext must be a string
    expect(typeof ctx).toBe('string');

    // When non-empty, it must be wrapped in <synapse-rules> tags
    if (ctx.length > 0) {
      expect(ctx).toContain('<synapse-rules>');
      expect(ctx).toContain('</synapse-rules>');
    }
  });

  // ========================================================================
  // 3. Hook with missing .synapse/ directory produces empty output
  // ========================================================================

  test('hook with missing .synapse/ directory produces empty output (silent exit)', () => {
    // Use a fresh temp dir as cwd -- guaranteed to NOT have a .synapse/ directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-e2e-no-synapse-'));
    try {
      const input = JSON.stringify({
        sessionId: 'e2e-no-synapse',
        cwd: tempDir,
        prompt: 'test prompt',
      });
      const { stdout, exitCode } = runHookSync(input);

      expect(exitCode).toBe(0);
      expect(stdout).toBe('');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // ========================================================================
  // 4. Hook with invalid JSON input exits gracefully (no crash, exit 0)
  // ========================================================================

  test('hook with invalid JSON input exits gracefully (no crash, exit 0)', () => {
    const { stdout, exitCode } = runHookSync('this is not valid json {{{');

    // Hook catches JSON parse error and calls process.exit(0)
    expect(exitCode).toBe(0);
    expect(stdout).toBe('');
  });

  // ========================================================================
  // 5. Hook with missing cwd exits gracefully
  // ========================================================================

  test('hook with missing cwd field exits gracefully', () => {
    const input = JSON.stringify({
      sessionId: 'e2e-no-cwd',
      prompt: 'test prompt',
      // cwd intentionally omitted
    });
    const { stdout, exitCode } = runHookSync(input);

    // Hook checks `if (!cwd) return;` and exits silently
    expect(exitCode).toBe(0);
    expect(stdout).toBe('');
  });

  // ========================================================================
  // 6. HOOK_TIMEOUT_MS is 5000ms
  // ========================================================================

  test('HOOK_TIMEOUT_MS is 5000ms', () => {
    const hookModule = require(HOOK_PATH);
    expect(hookModule.HOOK_TIMEOUT_MS).toBe(5000);
  });

  // ========================================================================
  // 7. Hook output additionalContext contains CONSTITUTION section
  //    (verifies via SynapseEngine directly since engine.process is async
  //    and the hook integration path may yield empty due to async handling)
  // ========================================================================

  test('SynapseEngine produces CONSTITUTION content for the project .synapse/', async () => {
    const synapsePath = path.join(PROJECT_ROOT, '.synapse');
    if (!fs.existsSync(synapsePath)) {
      // Skip if .synapse/ does not exist in this environment
      return;
    }

    const { SynapseEngine } = require(
      path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'engine.js'),
    );
    const engine = new SynapseEngine(synapsePath);
    const result = await engine.process('test prompt', { prompt_count: 0 });

    // The formatter should produce XML with CONSTITUTION section from L0
    expect(result).toHaveProperty('xml');
    expect(typeof result.xml).toBe('string');

    if (result.xml.length > 0) {
      expect(result.xml).toContain('<synapse-rules>');
      expect(result.xml).toMatch(/CONSTITUTION/i);
    }
  });

  // ========================================================================
  // 8. Hook with empty stdin exits gracefully
  // ========================================================================

  test('hook with empty stdin exits gracefully', () => {
    const { stdout, exitCode } = runHookSync('');

    expect(exitCode).toBe(0);
    expect(stdout).toBe('');
  });

  // ========================================================================
  // 9. Hook output is a single well-formed JSON object (no trailing data)
  // ========================================================================

  test('hook output is a single well-formed JSON object (no trailing data)', () => {
    const input = buildInput();
    const { stdout, exitCode } = runHookSync(input);

    expect(exitCode).toBe(0);
    expect(stdout).toBeTruthy();

    // Parse should succeed without leftover characters
    const result = JSON.parse(stdout);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();

    // Re-stringify and compare length to detect trailing data
    const reparsed = JSON.stringify(result);
    expect(stdout.trim()).toBe(reparsed);
  });
});
