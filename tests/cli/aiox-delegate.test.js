const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const {
  createDelegatePlan,
  parseArgs,
  sanitizeSlug,
  DelegateCliError,
} = require('@aiox-core/core/external-executors/delegate-cli');

describe('aiox-delegate external executor CLI', () => {
  const fixedDate = new Date(Date.UTC(2026, 4, 8, 2, 30, 45));
  const workdir = path.resolve('/tmp/work');

  test('parses codex delegation arguments', () => {
    const options = parseArgs([
      'codex',
      '-t',
      'story-4.3',
      '-p',
      'Implement AC1',
      '-d',
      '/tmp/work',
      '--model',
      'gpt-5.4',
      '--dry-run',
    ]);

    expect(options.provider).toBe('codex');
    expect(options.slug).toBe('story-4.3');
    expect(options.prompt).toBe('Implement AC1');
    expect(options.workdir).toBe('/tmp/work');
    expect(options.model).toBe('gpt-5.4');
    expect(options.dryRun).toBe(true);
  });

  test('creates a codex plan with workspace-write sandbox by default', () => {
    const plan = createDelegatePlan(
      parseArgs(['codex', '-t', 'story 4.3', '-p', 'Implement AC1', '-d', '/tmp/work']),
      fixedDate,
    );

    expect(plan.slug).toBe('story-4.3');
    expect(plan.runDir).toBe(path.join(workdir, '.aiox', 'external-runs', '20260508-023045-story-4.3'));
    expect(plan.command).toBe('codex');
    expect(plan.args).toEqual(
      expect.arrayContaining(['-a', 'never', '-s', 'workspace-write', 'exec', '-C', workdir]),
    );
    expect(plan.args.at(-1)).toBe('-');
    expect(plan.outputPath).toBe(path.join(plan.runDir, 'output.md'));
  });

  test('maps full-auto abstraction to Codex workspace-write sandbox', () => {
    const plan = createDelegatePlan(
      parseArgs([
        'codex',
        '-t',
        'story-4.3',
        '-p',
        'Implement AC1',
        '-d',
        '/tmp/work',
        '--sandbox',
        'full-auto',
      ]),
      fixedDate,
    );

    expect(plan.args).toEqual(
      expect.arrayContaining(['-a', 'never', '-s', 'workspace-write', 'exec', '-C', workdir]),
    );
  });

  test('maps danger-full-access to the explicit Codex bypass flag', () => {
    const plan = createDelegatePlan(
      parseArgs([
        'codex',
        '-t',
        'story-4.3',
        '-p',
        'Implement AC1',
        '-d',
        '/tmp/work',
        '--sandbox',
        'danger-full-access',
      ]),
      fixedDate,
    );

    expect(plan.args).toContain('--dangerously-bypass-approvals-and-sandbox');
    expect(plan.args).not.toContain('-s');
  });

  test('rejects mutually exclusive prompt inputs', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-delegate-'));
    const promptFile = path.join(tmpDir, 'prompt.md');

    try {
      fs.writeFileSync(promptFile, 'prompt', 'utf8');

      expect(() =>
        createDelegatePlan(
          parseArgs(['codex', '-t', 'story-4.3', '-p', 'inline', '-f', promptFile]),
          fixedDate,
        ),
      ).toThrow(DelegateCliError);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('wraps missing prompt files in a CLI input error', () => {
    const missingPath = path.join(os.tmpdir(), `aiox-missing-prompt-${process.pid}-${Date.now()}.md`);

    expect(() =>
      createDelegatePlan(
        parseArgs(['codex', '-t', 'story-4.3', '-f', missingPath]),
        fixedDate,
      ),
    ).toThrow(/Prompt file not found/);
  });

  test('sanitizes unsafe slugs', () => {
    expect(sanitizeSlug(' Story 4.3 / AC1 ')).toBe('Story-4.3-AC1');
  });

  test('dry-run prints machine-readable run metadata without creating run directory', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-delegate-'));
    const binPath = path.join(__dirname, '../../bin/aiox-delegate.js');

    try {
      await new Promise((resolve, reject) => {
        const child = spawn('node', [
          binPath,
          'codex',
          '-t',
          'story-4.3',
          '-p',
          'Implement AC1',
          '-d',
          tmpDir,
          '--dry-run',
        ]);

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('error', reject);
        child.on('close', (code) => {
          try {
            expect(code).toBe(0);
            expect(stderr).toBe('');
            expect(stdout).toContain('STATUS=dry-run');
            expect(stdout).toContain(`RUN_DIR=${path.join(tmpDir, '.aiox/external-runs')}`);
            expect(stdout).toContain('COMMAND=codex -a never -s workspace-write exec');
            expect(fs.existsSync(path.join(tmpDir, '.aiox'))).toBe(false);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
