const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const DEFAULT_RUN_DIR = '.aiox/external-runs';
const SUPPORTED_SANDBOXES = new Set([
  'read-only',
  'workspace-write',
  'full-auto',
  'danger-full-access',
]);

const PROVIDERS = {
  codex: {
    id: 'codex',
    binary: 'codex',
    buildArgs(options) {
      const args = [];

      if (options.sandbox === 'danger-full-access') {
        args.push('--dangerously-bypass-approvals-and-sandbox');
      } else {
        const codexSandbox = options.sandbox === 'full-auto' ? 'workspace-write' : options.sandbox;
        args.push('-a', 'never', '-s', codexSandbox);
      }

      if (options.model) {
        args.push('-m', options.model);
      }

      if (options.profile) {
        args.push('-p', options.profile);
      }

      args.push('exec', '-C', options.workdir, '-o', options.outputPath);

      for (const image of options.images) {
        args.push('-i', image);
      }

      args.push('-');

      return args;
    },
  },
};

class DelegateCliError extends Error {
  constructor(message, exitCode = 1, cause = null) {
    super(message);
    this.name = 'DelegateCliError';
    this.exitCode = exitCode;
    this.cause = cause;
  }
}

function showHelp(output = process.stdout) {
  output.write(`AIOX External Executor Delegation

USAGE:
  aiox-delegate <provider> -t <slug> [-f prompt_file | -p prompt] [options]

PROVIDERS:
  codex

OPTIONS:
  -t, --task <slug>          Stable task/story slug for the run directory
  -f, --prompt-file <path>   Prompt file to send to the external executor
  -p, --prompt <text>        Inline prompt to send to the external executor
  -d, --workdir <path>       Working directory for the executor (default: cwd)
  -m, --model <model>        Provider model override
      --profile <name>       Provider profile/config override
      --sandbox <mode>       read-only | workspace-write | full-auto | danger-full-access
      --run-dir <path>       Base run directory (default: .aiox/external-runs)
      --image <path>         Image input for providers that support it (repeatable)
      --allow-dirty          Allow delegation with a dirty git worktree
      --skip-git-check       Skip git worktree detection and cleanliness check
      --foreground           Wait for the executor process and return its exit code
      --dry-run              Print the planned run without creating files or spawning
  -h, --help                 Show this help

OUTPUT:
  Prints machine-readable key=value lines: STATUS, RUN_DIR, PID, LOG, OUTPUT, PROMPT, COMMAND.
`);
}

function parseArgs(argv) {
  const options = {
    provider: null,
    slug: null,
    prompt: null,
    promptFile: null,
    workdir: process.cwd(),
    model: null,
    profile: null,
    sandbox: 'workspace-write',
    runDirBase: DEFAULT_RUN_DIR,
    images: [],
    allowDirty: false,
    skipGitCheck: false,
    foreground: false,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (!arg.startsWith('-') && !options.provider) {
      options.provider = arg;
      continue;
    }

    const readValue = (name) => {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new DelegateCliError(`${name} requires a value`, 2);
      }
      i += 1;
      return value;
    };

    switch (arg) {
      case '-t':
      case '--task':
        options.slug = readValue(arg);
        break;
      case '-f':
      case '--prompt-file':
        options.promptFile = readValue(arg);
        break;
      case '-p':
      case '--prompt':
        options.prompt = readValue(arg);
        break;
      case '-d':
      case '--workdir':
        options.workdir = readValue(arg);
        break;
      case '-m':
      case '--model':
        options.model = readValue(arg);
        break;
      case '--profile':
        options.profile = readValue(arg);
        break;
      case '--sandbox':
        options.sandbox = readValue(arg);
        break;
      case '--run-dir':
        options.runDirBase = readValue(arg);
        break;
      case '--image':
        options.images.push(readValue(arg));
        break;
      case '--allow-dirty':
        options.allowDirty = true;
        break;
      case '--skip-git-check':
        options.skipGitCheck = true;
        break;
      case '--foreground':
        options.foreground = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      default:
        throw new DelegateCliError(`Unknown option or extra argument: ${arg}`, 2);
    }
  }

  return options;
}

function validateOptions(options) {
  if (options.help) {
    return;
  }

  if (!options.provider) {
    throw new DelegateCliError('Provider is required. Use: aiox-delegate <provider> ...', 2);
  }

  if (!PROVIDERS[options.provider]) {
    throw new DelegateCliError(`Unsupported provider: ${options.provider}`, 2);
  }

  if (!options.slug) {
    throw new DelegateCliError('Task slug is required. Use -t <slug>.', 2);
  }

  if (options.prompt && options.promptFile) {
    throw new DelegateCliError('Use either --prompt or --prompt-file, not both.', 2);
  }

  if (!options.prompt && !options.promptFile) {
    throw new DelegateCliError('Prompt is required. Use --prompt or --prompt-file.', 2);
  }

  if (!SUPPORTED_SANDBOXES.has(options.sandbox)) {
    throw new DelegateCliError(
      `Unsupported sandbox: ${options.sandbox}. Expected one of: ${Array.from(SUPPORTED_SANDBOXES).join(', ')}`,
      2,
    );
  }
}

function sanitizeSlug(slug) {
  const sanitized = String(slug)
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (!sanitized) {
    throw new DelegateCliError('Task slug must contain at least one safe character.', 2);
  }

  return sanitized;
}

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    '-',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join('');
}

function resolvePathFrom(baseDir, value) {
  return path.resolve(baseDir, value);
}

function loadPrompt(options) {
  if (options.promptFile) {
    const promptFile = path.resolve(options.promptFile);
    let text;

    try {
      text = fs.readFileSync(promptFile, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new DelegateCliError(
          `Prompt file not found: ${promptFile}. Use --prompt for inline text or --prompt-file <path> for an existing file.`,
          2,
          error,
        );
      }

      throw new DelegateCliError(
        `Could not read prompt file ${promptFile}: ${error.message}`,
        2,
        error,
      );
    }

    return {
      text,
      source: promptFile,
    };
  }

  return {
    text: options.prompt,
    source: 'inline',
  };
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@%+-]+$/.test(text)) {
    return text;
  }
  const singleQuote = String.fromCharCode(39);
  const escapedQuote = singleQuote + '\\' + singleQuote + singleQuote;
  return singleQuote + text.replace(/'/g, escapedQuote) + singleQuote;
}

function formatCommand(command, args) {
  return [command, ...args].map(shellQuote).join(' ');
}

function commandExists(command) {
  if (process.platform === 'win32') {
    return spawnSync('where', [command], { stdio: 'ignore' }).status === 0;
  }

  return spawnSync('sh', ['-c', `command -v ${shellQuote(command)} >/dev/null 2>&1`], {
    stdio: 'ignore',
  }).status === 0;
}

function assertExecutorAvailable(provider) {
  if (!commandExists(provider.binary)) {
    throw new DelegateCliError(
      `Executor binary not found on PATH: ${provider.binary}`,
      3,
    );
  }
}

function gitStatus(workdir) {
  const inside = spawnSync('git', ['-C', workdir, 'rev-parse', '--is-inside-work-tree'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (inside.status !== 0 || inside.stdout.trim() !== 'true') {
    return { inside: false, dirty: false, status: '' };
  }

  const status = spawnSync('git', ['-C', workdir, 'status', '--porcelain'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (status.status !== 0) {
    throw new DelegateCliError(`Could not read git status: ${status.stderr.trim()}`, 4);
  }

  const output = status.stdout.trim();
  return { inside: true, dirty: output.length > 0, status: output };
}

function assertGitReady(options) {
  if (options.skipGitCheck) {
    return;
  }

  const status = gitStatus(options.workdir);
  if (!status.inside) {
    throw new DelegateCliError(
      'Workdir is not inside a git repository. Use --skip-git-check only for intentional non-git runs.',
      4,
    );
  }

  if (status.dirty && !options.allowDirty) {
    throw new DelegateCliError(
      'Git worktree is dirty. Commit/stash first or pass --allow-dirty for intentional changes.',
      4,
    );
  }
}

function createDelegatePlan(rawOptions, date = new Date()) {
  const options = {
    ...rawOptions,
    workdir: path.resolve(rawOptions.workdir || process.cwd()),
    images: rawOptions.images || [],
  };
  validateOptions(options);

  const provider = PROVIDERS[options.provider];
  const slug = sanitizeSlug(options.slug);
  const timestamp = formatTimestamp(date);
  const runDirBase = path.isAbsolute(options.runDirBase)
    ? options.runDirBase
    : resolvePathFrom(options.workdir, options.runDirBase);
  const runDir = path.join(runDirBase, `${timestamp}-${slug}`);
  const promptPath = path.join(runDir, 'prompt.md');
  const outputPath = path.join(runDir, 'output.md');
  const logPath = path.join(runDir, `${provider.id}.log`);
  const metadataPath = path.join(runDir, 'metadata.json');
  const commandPath = path.join(runDir, 'command.txt');
  const prompt = loadPrompt(options);
  const providerOptions = {
    ...options,
    outputPath,
    images: options.images.map((image) => path.resolve(options.workdir, image)),
  };
  const args = provider.buildArgs(providerOptions);

  return {
    provider,
    options,
    slug,
    timestamp,
    runDir,
    promptPath,
    outputPath,
    logPath,
    metadataPath,
    commandPath,
    prompt,
    command: provider.binary,
    args,
    displayCommand: formatCommand(provider.binary, args),
  };
}

function writeRunFiles(plan, pid = null) {
  fs.mkdirSync(plan.runDir, { recursive: true });
  fs.writeFileSync(plan.promptPath, plan.prompt.text, 'utf8');
  fs.writeFileSync(plan.commandPath, `${plan.displayCommand}\n`, 'utf8');

  const metadata = {
    provider: plan.provider.id,
    slug: plan.slug,
    created_at: new Date().toISOString(),
    workdir: plan.options.workdir,
    sandbox: plan.options.sandbox,
    model: plan.options.model || null,
    profile: plan.options.profile || null,
    foreground: plan.options.foreground,
    allow_dirty: plan.options.allowDirty,
    skip_git_check: plan.options.skipGitCheck,
    prompt_source: plan.prompt.source,
    run_dir: plan.runDir,
    prompt: plan.promptPath,
    output: plan.outputPath,
    log: plan.logPath,
    command: plan.command,
    args: plan.args,
    pid,
  };

  fs.writeFileSync(plan.metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
}

async function spawnExecutor(plan) {
  fs.mkdirSync(path.dirname(plan.logPath), { recursive: true });
  const logFd = fs.openSync(plan.logPath, 'a');
  let logClosed = false;
  let child;

  const closeLog = () => {
    if (!logClosed) {
      fs.closeSync(logFd);
      logClosed = true;
    }
  };

  const recordSpawnError = (error) => {
    if (!logClosed) {
      fs.writeSync(logFd, `\n[aiox-delegate] executor error: ${error.message}\n`);
    }
  };

  try {
    child = spawn(plan.command, plan.args, {
      cwd: plan.options.workdir,
      detached: !plan.options.foreground,
      stdio: ['pipe', logFd, logFd],
      env: process.env,
    });
  } catch (error) {
    recordSpawnError(error);
    writeRunFiles(plan, null);
    closeLog();
    return { status: 'failed', pid: null, exitCode: 1, error: error.message };
  }

  writeRunFiles(plan, child.pid || null);

  const errorResult = new Promise((resolve) => {
    child.once('error', (error) => {
      recordSpawnError(error);
      closeLog();
      resolve({
        status: 'failed',
        pid: child.pid || null,
        exitCode: 1,
        error: error.message,
      });
    });
  });

  if (child.stdin) {
    child.stdin.end(plan.prompt.text);
  }

  if (!plan.options.foreground) {
    const immediateError = await Promise.race([
      errorResult,
      new Promise((resolve) => setImmediate(() => resolve(null))),
    ]);

    if (immediateError) {
      return immediateError;
    }

    child.unref();
    closeLog();
    return { status: 'started', pid: child.pid, exitCode: 0 };
  }

  const result = await Promise.race([
    errorResult,
    new Promise((resolve) => {
      child.once('close', (code) => {
        closeLog();
        const exitCode = code !== null ? code : 1;
        resolve({
          status: exitCode === 0 ? 'completed' : 'failed',
          pid: child.pid,
          exitCode,
        });
      });
    }),
  ]);

  return result;
}

function sanitizeResultValue(value) {
  return String(value).replace(/\r?\n/g, ' ');
}

function printResult(plan, result, output = process.stdout) {
  const lines = [
    `STATUS=${result.status}`,
    `RUN_DIR=${plan.runDir}`,
    result.pid ? `PID=${result.pid}` : null,
    `LOG=${plan.logPath}`,
    `OUTPUT=${plan.outputPath}`,
    `PROMPT=${plan.promptPath}`,
    `COMMAND=${plan.displayCommand}`,
    result.error ? `ERROR=${sanitizeResultValue(result.error)}` : null,
  ].filter(Boolean);

  output.write(`${lines.join('\n')}\n`);
}

async function runCli(argv, output = process.stdout, _errorOutput = process.stderr) {
  const options = parseArgs(argv);

  if (options.help) {
    showHelp(output);
    return 0;
  }

  const plan = createDelegatePlan(options);

  if (options.dryRun) {
    printResult(plan, { status: 'dry-run', pid: null }, output);
    return 0;
  }

  assertExecutorAvailable(plan.provider);
  assertGitReady(plan.options);

  const result = await spawnExecutor(plan);
  printResult(plan, result, output);
  return result.exitCode;
}

async function main() {
  try {
    const exitCode = await runCli(process.argv.slice(2));
    process.exit(exitCode);
  } catch (error) {
    const exitCode = error.exitCode || 1;
    process.stderr.write(`ERROR=${error.message}\n`);
    process.exit(exitCode);
  }
}

module.exports = {
  DEFAULT_RUN_DIR,
  PROVIDERS,
  SUPPORTED_SANDBOXES,
  DelegateCliError,
  parseArgs,
  validateOptions,
  sanitizeSlug,
  formatTimestamp,
  createDelegatePlan,
  formatCommand,
  gitStatus,
  runCli,
  showHelp,
  main,
};
