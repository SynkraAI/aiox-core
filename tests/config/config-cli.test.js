/**
 * CLI tests for `aiox config` subcommands
 * Story PRO-4 — Config Hierarchy (Task 5.3)
 *
 * Tests the Commander.js config command in-process using Jest mocks
 * for process.cwd, console.log/error, and process.exit.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const { Command } = require('commander');
const { createConfigCommand } = require('../../.aiox-core/cli/commands/config');
const { globalConfigCache } = require('../../.aiox-core/core/config/config-cache');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/**
 * Create a temp project with config fixtures.
 */
function createTempProject(files = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-cli-test-'));
  const aioxCoreDir = path.join(tmpDir, '.aiox-core');
  fs.mkdirSync(aioxCoreDir, { recursive: true });

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    if (typeof content === 'string') {
      fs.writeFileSync(fullPath, content, 'utf8');
    } else {
      const fixturePath = path.join(FIXTURES_DIR, content.fixture);
      fs.copyFileSync(fixturePath, fullPath);
    }
  }

  return tmpDir;
}

function cleanupTempDir(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

/**
 * Sentinel error thrown by mocked process.exit to halt execution
 * without actually exiting the test runner.
 */
class ProcessExitError extends Error {
  constructor(code) {
    super(`process.exit(${code})`);
    this.exitCode = code;
  }
}

describe('config CLI commands', () => {
  let logOutput, errorOutput;
  let logSpy, errorSpy, exitSpy, cwdSpy;

  beforeEach(() => {
    globalConfigCache.clear();
    logOutput = [];
    errorOutput = [];

    logSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
      logOutput.push(args.join(' '));
    });
    errorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      errorOutput.push(args.join(' '));
    });
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new ProcessExitError(code);
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
    if (cwdSpy) {
      cwdSpy.mockRestore();
      cwdSpy = null;
    }
  });

  /**
   * Run `aiox config <subArgs>` in-process via Commander.
   * Returns captured stdout/stderr as strings and whether process.exit was called.
   */
  async function runConfigCmd(subArgs) {
    const program = new Command();
    program.exitOverride(); // Prevent Commander itself from calling process.exit
    program.addCommand(createConfigCommand());

    let exitCode = 0;
    try {
      await program.parseAsync(['node', 'aiox', ...subArgs]);
    } catch (err) {
      if (err instanceof ProcessExitError) {
        exitCode = err.exitCode;
      } else if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
        // Commander exit override throws for --help / --version
        exitCode = 0;
      } else {
        exitCode = 1;
      }
    }

    return {
      exitCode,
      stdout: logOutput.join('\n'),
      stderr: errorOutput.join('\n'),
    };
  }

  function setCwd(dir) {
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(dir);
  }

  // -----------------------------------------------------------------------
  // aiox config show
  // -----------------------------------------------------------------------

  describe('aiox config show', () => {
    test('shows resolved config as YAML', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'show']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('metadata');
        expect(stdout).toContain('AIOX-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('shows specific level with --level', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'show', '--level', 'L1']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('framework_name');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('shows debug annotations with --debug', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'show', '--debug']);
        expect(exitCode).toBe(0);
        expect(stdout).toMatch(/L[12]/);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // -----------------------------------------------------------------------
  // aiox config validate
  // -----------------------------------------------------------------------

  describe('aiox config validate', () => {
    test('validates existing config files', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'validate']);
        expect(exitCode).toBe(0);
        // "Config validation: PASS" contains "valid" as substring of "validation"
        expect(stdout).toContain('valid');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('validates specific level with --level', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode } = await runConfigCmd(['config', 'validate', '--level', 'L1']);
        expect(exitCode).toBe(0);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // -----------------------------------------------------------------------
  // aiox config diff
  // -----------------------------------------------------------------------

  describe('aiox config diff', () => {
    test('shows diff between two levels', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'diff', '--levels', 'L1,L2']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('performance_defaults');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // -----------------------------------------------------------------------
  // aiox config migrate
  // -----------------------------------------------------------------------

  describe('aiox config migrate', () => {
    const LEGACY_CONFIG = [
      'project:',
      '  name: "test-project"',
      '  version: "1.0.0"',
      'ide:',
      '  selected:',
      '    - vscode',
      'mcp:',
      '  enabled: false',
      'toolsLocation: .aiox-core/tools',
      'lazyLoading:',
      '  enabled: true',
      '',
    ].join('\n');

    test('--dry-run shows preview without writing files', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': LEGACY_CONFIG,
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'migrate', '--dry-run']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('DRY RUN');
        expect(stdout).toContain('framework-config.yaml');
        // No split files should have been created
        expect(fs.existsSync(path.join(tmpDir, '.aiox-core', 'framework-config.yaml'))).toBe(false);
        expect(fs.existsSync(path.join(tmpDir, '.aiox-core', 'project-config.yaml'))).toBe(false);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('full migration creates split files and backup', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/core-config.yaml': LEGACY_CONFIG,
        '.gitignore': '# existing\nnode_modules\n',
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'migrate']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('Migration complete');

        // Split files created
        expect(fs.existsSync(path.join(tmpDir, '.aiox-core', 'framework-config.yaml'))).toBe(true);
        expect(fs.existsSync(path.join(tmpDir, '.aiox-core', 'project-config.yaml'))).toBe(true);
        expect(fs.existsSync(path.join(tmpDir, '.aiox-core', 'local-config.yaml'))).toBe(true);

        // Backup created
        expect(fs.existsSync(path.join(tmpDir, '.aiox-core', 'core-config.yaml.backup'))).toBe(true);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('reports nothing to migrate when already layered', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aiox-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout } = await runConfigCmd(['config', 'migrate']);
        expect(exitCode).toBe(0);
        expect(stdout).toContain('Nothing to migrate');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // -----------------------------------------------------------------------
  // aiox config validate — error paths
  // -----------------------------------------------------------------------

  describe('aiox config validate — error paths', () => {
    test('reports malformed YAML syntax error', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/framework-config.yaml': 'metadata:\n  name: "test\n  bad_indent: [unmatched',
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stdout, stderr } = await runConfigCmd(['config', 'validate']);
        // Should fail with YAML error
        const combined = stdout + ' ' + stderr;
        expect(combined).toMatch(/YAML ERROR|error/i);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // -----------------------------------------------------------------------
  // aiox config init-local
  // -----------------------------------------------------------------------

  describe('aiox config init-local', () => {
    test('creates local-config.yaml from template', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/local-config.yaml.template': 'ide:\n  selected:\n    - vscode\n',
      });

      try {
        setCwd(tmpDir);
        const { exitCode } = await runConfigCmd(['config', 'init-local']);
        expect(exitCode).toBe(0);

        const localConfig = path.join(tmpDir, '.aiox-core', 'local-config.yaml');
        expect(fs.existsSync(localConfig)).toBe(true);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('warns if local-config.yaml already exists', async () => {
      const tmpDir = createTempProject({
        '.aiox-core/local-config.yaml.template': 'ide:\n  selected:\n    - vscode\n',
        '.aiox-core/local-config.yaml': 'existing: true\n',
      });

      try {
        setCwd(tmpDir);
        const { exitCode, stderr } = await runConfigCmd(['config', 'init-local']);
        // initLocalAction writes to console.error and calls process.exit(1)
        expect(exitCode).toBe(1);
        expect(stderr).toContain('already exists');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });
});
