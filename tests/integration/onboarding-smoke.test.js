/**
 * Story AIOS-DIFF-4.0.5: Onboarding smoke tests in clean environment.
 *
 * Objective:
 * - Validate that "Comece Aqui" onboarding flow remains executable.
 * - Keep a deterministic timer for first-value smoke checks.
 */

'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

describe('Onboarding smoke flow (AIOS-DIFF-4.0.5)', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const cliBin = path.join(repoRoot, 'bin', 'aios.js');
  const greetingScript = path.join(
    repoRoot,
    '.aios-core',
    'development',
    'scripts',
    'generate-greeting.js',
  );
  const FIRST_VALUE_TARGET_SECONDS = 10 * 60;
  const CI_MARGIN_SECONDS = 12 * 60;

  let tempDir;

  const runNode = (entryPoint, args = [], cwd = repoRoot) => {
    return execFileSync('node', [entryPoint, ...args], {
      cwd,
      encoding: 'utf8',
      timeout: 20000,
      env: {
        ...process.env,
        CI: '1',
      },
    });
  };

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-onboarding-smoke-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('validates Start Here commands are discoverable and executable from clean env', async () => {
    expect(await fs.pathExists(path.join(tempDir, '.aios-core'))).toBe(false);
    expect(await fs.pathExists(path.join(tempDir, '.codex'))).toBe(false);
    expect(await fs.pathExists(path.join(tempDir, '.claude'))).toBe(false);

    const topHelp = runNode(cliBin, ['--help'], tempDir);
    expect(topHelp).toContain('init <name>');
    expect(topHelp).toContain('install');

    const initHelp = runNode(cliBin, ['init', '--help'], tempDir);
    expect(initHelp).toContain('--skip-install');
    expect(initHelp).toContain('--template');

    const versionOutput = runNode(cliBin, ['--version'], tempDir).trim();
    expect(versionOutput).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('validates onboarding docs keep an objective first-value path', async () => {
    const readme = await fs.readFile(path.join(repoRoot, 'README.md'), 'utf8');
    const gettingStarted = await fs.readFile(path.join(repoRoot, 'docs', 'getting-started.md'), 'utf8');

    expect(readme).toContain('Comece Aqui (10 Min)');
    expect(readme).toContain('npx aios-core init');
    expect(readme).toContain('npx aios-core install');

    expect(gettingStarted).toContain('10-Minute Quick Path');
    expect(gettingStarted).toContain('Step 1: Install AIOS');
    expect(gettingStarted).toContain('Step 2: Pick your IDE activation path');
    expect(gettingStarted).toContain('Step 3: Validate first value');
    expect(gettingStarted).toContain('*help');
    expect(gettingStarted).toContain('PASS rule');
  });

  it('validates first-value activation signal and timing budget', () => {
    const startedAt = Date.now();

    const greeting = runNode(greetingScript, ['dev'], repoRoot);

    const elapsedSeconds = (Date.now() - startedAt) / 1000;
    expect(greeting).toContain('Agent dev loaded');
    expect(greeting).toContain('Available Commands');
    expect(greeting).toContain('*help');

    // Target for real user path is <=10 min.
    expect(elapsedSeconds).toBeLessThanOrEqual(FIRST_VALUE_TARGET_SECONDS);
  });
});
