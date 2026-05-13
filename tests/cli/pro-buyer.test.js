/**
 * Unit tests for `aiox pro buyer` subcommand module (Story 123.8 — Wave 1).
 *
 * Covers:
 *   - Internal helpers (email validation, error classification, batch concurrency,
 *     email-file parsing)
 *   - End-to-end subprocess integration against a local mock HTTP server
 *
 * Wave 2 will add coverage for `register` subcommand and admin-key no-leak.
 *
 * @see docs/stories/epic-123/STORY-123.8-cohort-buyer-cli-migration.md
 * @see AC1, AC2, AC3, AC7, AC10, AC11
 */

'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Run a subprocess asynchronously and capture stdout/stderr + exit code.
 * Must be async — spawnSync blocks the event loop which would hang in-process
 * mock HTTP servers.
 */
function runAsync(args, env, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    const killTimer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Subprocess timeout after ${timeoutMs}ms. stdout=${stdout} stderr=${stderr}`));
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(killTimer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(killTimer);
      resolve({ status: code, stdout, stderr });
    });
  });
}

const BUYER_MODULE = require('../../.aiox-core/cli/commands/pro/buyer');
const {
  isValidEmail,
  classifyError,
  parseEmailsFile,
  mapWithConcurrency,
} = BUYER_MODULE._internal;

const AIOX_BIN = path.resolve(__dirname, '..', '..', 'bin', 'aiox.js');

describe('Story 123.8 — buyer CLI internals', () => {
  describe('isValidEmail', () => {
    it.each([
      ['user@example.com', true],
      ['a@b.co', true],
      ['name.tag+x@host.io', true],
      ['no-at-sign', false],
      ['two@@at.com', false],
      ['missing@domain', false],
      ['', false],
      [null, false],
      [undefined, false],
      [{}, false],
      ['a'.repeat(260) + '@x.io', false],
    ])('isValidEmail(%j) === %j', (input, expected) => {
      expect(isValidEmail(input)).toBe(expected);
    });
  });

  describe('classifyError', () => {
    it('maps NETWORK_ERROR to exit 2', () => {
      const result = classifyError({ code: 'NETWORK_ERROR', message: 'boom' });
      expect(result.exitCode).toBe(2);
      expect(result.message).toMatch(/rede/i);
    });

    it('maps RATE_LIMITED with retryAfter to exit 2 with hint', () => {
      const result = classifyError({
        code: 'RATE_LIMITED',
        message: 'too fast',
        details: { retryAfter: 120 },
      });
      expect(result.exitCode).toBe(2);
      expect(result.message).toMatch(/120s/);
    });

    it('falls back to default for unknown code', () => {
      const result = classifyError({ code: 'XYZ_UNKNOWN', message: 'weird' });
      expect(result.exitCode).toBe(2);
    });

    it('handles null / undefined gracefully', () => {
      expect(classifyError(null).exitCode).toBe(2);
      expect(classifyError(undefined).exitCode).toBe(2);
    });
  });

  describe('parseEmailsFile', () => {
    let tmpFile;
    beforeEach(() => {
      tmpFile = path.join(os.tmpdir(), `emails-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
    });
    afterEach(() => {
      if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    });

    it('parses one email per line, trimming whitespace', () => {
      fs.writeFileSync(tmpFile, 'a@x.com\n  b@y.com  \n\nc@z.com\n');
      expect(parseEmailsFile(tmpFile)).toEqual(['a@x.com', 'b@y.com', 'c@z.com']);
    });

    it('skips comment lines and blank lines', () => {
      fs.writeFileSync(tmpFile, '# header\na@x.com\n\n# inline comment\nb@y.com\n');
      expect(parseEmailsFile(tmpFile)).toEqual(['a@x.com', 'b@y.com']);
    });

    it('returns empty array for empty file', () => {
      fs.writeFileSync(tmpFile, '');
      expect(parseEmailsFile(tmpFile)).toEqual([]);
    });
  });

  describe('mapWithConcurrency', () => {
    it('processes all items and preserves input order', async () => {
      const items = [1, 2, 3, 4, 5];
      const results = await mapWithConcurrency(items, 2, async (n) => n * 10);
      expect(results).toEqual([10, 20, 30, 40, 50]);
    });

    it('respects concurrency limit (never more than N in-flight)', async () => {
      const items = new Array(20).fill(0).map((_, i) => i);
      let active = 0;
      let peak = 0;

      await mapWithConcurrency(items, 3, async (n) => {
        active += 1;
        if (active > peak) peak = active;
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
        return n;
      });

      expect(peak).toBeLessThanOrEqual(3);
      expect(peak).toBeGreaterThan(0);
    });

    it('handles empty input without launching workers', async () => {
      const results = await mapWithConcurrency([], 5, async () => {
        throw new Error('should not be called');
      });
      expect(results).toEqual([]);
    });

    it('caps concurrency at items.length', async () => {
      const items = [1];
      const results = await mapWithConcurrency(items, 100, async (n) => n + 1);
      expect(results).toEqual([2]);
    });
  });
});

// ---------------------------------------------------------------------------
// End-to-end subprocess integration (AC1, AC2, AC10)
//
// These tests spawn the CLI which calls into pro/license/license-api.js.
// pro/ submodule is intentionally NOT checked out in ci.yml (see ADR-PRO-001,
// Story PRO-5 AC-7); real integration runs in pro-integration.yml. We detect
// pro availability and skip when absent so ci.yml stays green.
// ---------------------------------------------------------------------------

const isProSubmoduleAvailable = (() => {
  try {
    require.resolve(path.resolve(__dirname, '..', '..', 'pro', 'license', 'license-api.js'));
    return true;
  } catch {
    return false;
  }
})();

(isProSubmoduleAvailable ? describe : describe.skip)('Story 123.8 — buyer CLI subprocess E2E', () => {
  let server;
  let serverUrl;

  function createMockServer(handler) {
    return new Promise((resolve) => {
      server = http.createServer(handler);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        serverUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }

  function closeMockServer() {
    return new Promise((resolve) => {
      if (server) {
        server.close(() => resolve());
        server = null;
      } else {
        resolve();
      }
    });
  }

  afterEach(async () => {
    await closeMockServer();
  });

  it('validate --email <buyer> --json prints stable JSON and exits 0', async () => {
    await createMockServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        isBuyer: true,
        hasAccount: true,
        email: 'buyer@example.com',
      }));
    });

    const result = await runAsync(
      [AIOX_BIN, 'pro', 'buyer', 'validate', '--email', 'buyer@example.com', '--json'],
      { ...process.env, AIOX_LICENSE_API_URL: serverUrl },
    );

    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout.trim());
    expect(parsed).toEqual({
      email: 'buyer@example.com',
      isBuyer: true,
      hasAccount: true,
    });
  });

  it('validate --email <non-buyer> --json exits 1 with isBuyer=false', async () => {
    await createMockServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        isBuyer: false,
        hasAccount: false,
        email: 'stranger@example.com',
      }));
    });

    const result = await runAsync(
      [AIOX_BIN, 'pro', 'buyer', 'validate', '--email', 'stranger@example.com', '--json'],
      { ...process.env, AIOX_LICENSE_API_URL: serverUrl },
    );

    expect(result.status).toBe(1);
    const parsed = JSON.parse(result.stdout.trim());
    expect(parsed.isBuyer).toBe(false);
  });

  it('validate with invalid email format exits 2 before hitting server', async () => {
    const result = await runAsync(
      [AIOX_BIN, 'pro', 'buyer', 'validate', '--email', 'not-an-email', '--json'],
      process.env,
      10000,
    );

    expect(result.status).toBe(2);
    const parsed = JSON.parse(result.stdout.trim());
    expect(parsed.error).toBe('INVALID_EMAIL');
  });

  it('register shows pending-Wave-2 message and exits 2', async () => {
    const result = await runAsync(
      [AIOX_BIN, 'pro', 'buyer', 'register', '--email', 'new@example.com', '--name', 'Novo Comprador', '--yes'],
      process.env,
      10000,
    );

    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/pendente.*Wave 2/i);
  });
});
