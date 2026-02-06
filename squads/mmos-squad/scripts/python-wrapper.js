/**
 * Python Wrapper for MMOS Squad
 * Handles subprocess calls to Python scripts from Claude Code agents
 *
 * Usage:
 *   node python-wrapper.js emulator activate <mind_name>
 *   node python-wrapper.js emulator debate <mind1> <mind2> --topic "topic"
 *   node python-wrapper.js emulator list-minds
 *   node python-wrapper.js debate <mind1> <mind2> "topic" [--framework] [--rounds]
 *   node python-wrapper.js import <mind_slug>
 *
 * @version 1.0.0
 * @squad mmos-squad
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Resolve paths relative to squad root
const SQUAD_ROOT = path.resolve(__dirname, '..');
const LIB_DIR = path.join(SQUAD_ROOT, 'lib');
const SCRIPTS_DIR = path.join(SQUAD_ROOT, 'scripts');

// Python executable (try python3 first, fallback to python)
const PYTHON = process.platform === 'win32' ? 'python' : 'python3';

/**
 * Execute a Python script with arguments
 * @param {string} script - Script name (relative to lib or scripts)
 * @param {string[]} args - Arguments to pass
 * @param {object} options - Execution options
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
async function executePython(script, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    // Determine script path
    let scriptPath;
    if (fs.existsSync(path.join(SCRIPTS_DIR, script))) {
      scriptPath = path.join(SCRIPTS_DIR, script);
    } else if (fs.existsSync(path.join(LIB_DIR, script))) {
      scriptPath = path.join(LIB_DIR, script);
    } else {
      reject(new Error(`Script not found: ${script}`));
      return;
    }

    // Set up environment
    const env = {
      ...process.env,
      PYTHONPATH: LIB_DIR,
      SQUAD_ROOT: SQUAD_ROOT,
      ...options.env,
    };

    // Spawn process
    const proc = spawn(PYTHON, [scriptPath, ...args], {
      env,
      cwd: options.cwd || process.cwd(),
      stdio: options.inherit ? 'inherit' : ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    if (!options.inherit) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        if (options.stream) {
          process.stdout.write(data);
        }
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        if (options.stream) {
          process.stderr.write(data);
        }
      });
    }

    proc.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Run the emulator script
 * @param {string[]} args - Command and arguments
 */
async function runEmulator(args) {
  console.log(`Running emulator with args: ${args.join(' ')}`);
  const result = await executePython('emulator.py', args, { stream: true });
  return result;
}

/**
 * Run the debate engine directly
 * @param {string} clone1 - First clone name
 * @param {string} clone2 - Second clone name
 * @param {string} topic - Debate topic
 * @param {object} options - Debate options
 */
async function runDebate(clone1, clone2, topic, options = {}) {
  const args = [
    'debate',
    clone1,
    clone2,
    '--topic', topic,
  ];

  if (options.framework) {
    args.push('--framework', options.framework);
  }
  if (options.rounds) {
    args.push('--rounds', options.rounds.toString());
  }

  console.log(`Starting debate: ${clone1} vs ${clone2}`);
  console.log(`Topic: ${topic}`);
  console.log(`Framework: ${options.framework || 'oxford'}`);
  console.log(`Rounds: ${options.rounds || 5}`);
  console.log('');

  return await runEmulator(args);
}

/**
 * Run the data import script
 * @param {string} mindSlug - Mind slug to import
 * @param {object} options - Import options
 */
async function runImport(mindSlug, options = {}) {
  const args = [mindSlug];

  if (options.preview) {
    args.unshift('--preview');
  }
  if (options.validate) {
    args.unshift('--validate');
  }

  console.log(`Importing sources for: ${mindSlug}`);
  const result = await executePython('import_sources_cli.py', args, { stream: true });
  return result;
}

/**
 * List available minds
 */
async function listMinds() {
  return await runEmulator(['list-minds']);
}

/**
 * Get mind info
 * @param {string} mindName - Mind name
 */
async function getMindInfo(mindName) {
  return await runEmulator(['info', mindName]);
}

/**
 * Activate a clone
 * @param {string} mindName - Mind name to activate
 */
async function activateClone(mindName) {
  return await runEmulator(['activate', mindName]);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
MMOS Python Wrapper v1.0.0
==========================

Commands:
  emulator <command> [args]  - Run emulator commands
  debate <m1> <m2> <topic>   - Run debate between clones
  import <mind_slug>         - Import mind sources
  list                       - List available minds
  info <mind_name>           - Show mind info

Examples:
  node python-wrapper.js emulator activate sam_altman
  node python-wrapper.js debate sam_altman elon_musk "Should AI be open source?"
  node python-wrapper.js import nassim_taleb
  node python-wrapper.js list
`);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'emulator':
        await runEmulator(args.slice(1));
        break;

      case 'debate': {
        const [clone1, clone2, topic, ...rest] = args.slice(1);
        if (!clone1 || !clone2 || !topic) {
          console.error('Usage: debate <clone1> <clone2> <topic> [--framework X] [--rounds N]');
          process.exit(1);
        }

        const options = {};
        for (let i = 0; i < rest.length; i++) {
          if (rest[i] === '--framework' && rest[i + 1]) {
            options.framework = rest[++i];
          } else if (rest[i] === '--rounds' && rest[i + 1]) {
            options.rounds = parseInt(rest[++i]);
          }
        }

        await runDebate(clone1, clone2, topic, options);
        break;
      }

      case 'import': {
        const [mindSlug, ...rest] = args.slice(1);
        if (!mindSlug) {
          console.error('Usage: import <mind_slug> [--preview] [--validate]');
          process.exit(1);
        }

        const options = {
          preview: rest.includes('--preview'),
          validate: rest.includes('--validate'),
        };

        await runImport(mindSlug, options);
        break;
      }

      case 'list':
        await listMinds();
        break;

      case 'info': {
        const mindName = args[1];
        if (!mindName) {
          console.error('Usage: info <mind_name>');
          process.exit(1);
        }
        await getMindInfo(mindName);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run without arguments to see usage.');
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export functions for use as module
module.exports = {
  executePython,
  runEmulator,
  runDebate,
  runImport,
  listMinds,
  getMindInfo,
  activateClone,
};

// Run CLI if executed directly
if (require.main === module) {
  main().catch(console.error);
}
