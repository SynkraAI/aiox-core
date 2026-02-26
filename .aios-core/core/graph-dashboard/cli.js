'use strict';

const { CodeIntelSource } = require('./data-sources/code-intel-source');
const { RegistrySource } = require('./data-sources/registry-source');
const { MetricsSource } = require('./data-sources/metrics-source');
const { renderTree } = require('./renderers/tree-renderer');
const { renderStats } = require('./renderers/stats-renderer');
const { renderStatus } = require('./renderers/status-renderer');
const { formatAsJson } = require('./formatters/json-formatter');
const { formatAsDot } = require('./formatters/dot-formatter');
const { formatAsMermaid } = require('./formatters/mermaid-formatter');
const { formatAsHtml } = require('./formatters/html-formatter');

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const MAX_SUMMARY_PER_CATEGORY = 5;
const DEFAULT_WATCH_INTERVAL_MS = 5000;
const DEBOUNCE_MS = 300;

const FORMAT_MAP = {
  json: formatAsJson,
  dot: formatAsDot,
  mermaid: formatAsMermaid,
  html: formatAsHtml,
};

const VALID_FORMATS = ['ascii', ...Object.keys(FORMAT_MAP)];

const WATCH_FORMAT_MAP = {
  dot: { formatter: formatAsDot, filename: 'graph.dot' },
  mermaid: { formatter: formatAsMermaid, filename: 'graph.mmd' },
  html: {
    formatter: (graphData) => formatAsHtml(graphData, { autoRefresh: true, refreshInterval: 5 }),
    filename: 'graph.html',
  },
};

const COMMANDS = {
  '--deps': handleDeps,
  '--stats': handleStats,
  '--help': handleHelp,
  '-h': handleHelp,
};

/**
 * Parse CLI arguments into structured args object.
 * @param {string[]} argv - Raw CLI arguments
 * @returns {Object} Parsed args
 */
function parseArgs(argv) {
  const args = {
    command: null,
    format: 'ascii',
    file: null,
    interval: 5,
    watch: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
      args.command = '--help';
    } else if (arg === '--deps') {
      args.command = '--deps';
    } else if (arg === '--stats') {
      args.command = '--stats';
    } else if (arg === '--watch') {
      args.watch = true;
    } else if (arg === '--format' && i + 1 < argv.length) {
      args.format = argv[++i];
    } else if (arg.startsWith('--format=')) {
      args.format = arg.split('=')[1];
    } else if (arg === '--interval' && i + 1 < argv.length) {
      args.interval = parseInt(argv[++i], 10);
    } else if (arg.startsWith('--interval=')) {
      args.interval = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--') && !args.command) {
      args.command = arg;
    }
  }

  return args;
}

/**
 * Handle --deps command: render dependency tree or formatted output.
 * If --watch is set, delegates to handleWatch.
 * @param {Object} args - Parsed CLI args
 */
async function handleDeps(args) {
  const format = args.format || 'ascii';

  if (format !== 'ascii' && !FORMAT_MAP[format]) {
    console.error(`Unknown format: ${format}. Valid formats: ${VALID_FORMATS.join(', ')}`);
    process.exit(1);
  }

  if (args.watch) {
    return handleWatch(args);
  }

  const source = new CodeIntelSource();
  const graphData = await source.getData();

  if (format === 'html') {
    return handleHtmlOutput(graphData);
  }

  if (format !== 'ascii') {
    const formatter = FORMAT_MAP[format];
    process.stdout.write(formatter(graphData) + '\n');
    return;
  }

  const isTTY = process.stdout.isTTY;
  const output = renderTree(graphData, { color: isTTY, unicode: isTTY });
  console.log(output);
}

/**
 * Write HTML graph to .aios/graph.html and open in default browser.
 * @param {Object} graphData - Normalized graph data
 * @param {Object} [options] - Options passed to formatAsHtml
 * @returns {string} Output file path
 */
function handleHtmlOutput(graphData, options = {}) {
  const outputDir = path.resolve(process.cwd(), '.aios');
  const outputPath = path.join(outputDir, 'graph.html');

  fs.mkdirSync(outputDir, { recursive: true });

  const html = formatAsHtml(graphData, options);
  fs.writeFileSync(outputPath, html, 'utf8');

  const nodeCount = (graphData.nodes || []).length;
  console.log(`HTML graph written to ${outputPath} (${nodeCount} entities)`);

  openInBrowser(outputPath);
  return outputPath;
}

/**
 * Open a file in the default browser (cross-platform).
 * @param {string} filePath - Absolute path to file
 */
function openInBrowser(filePath) {
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'start ""' : platform === 'darwin' ? 'open' : 'xdg-open';

  exec(`${cmd} "${filePath}"`, (err) => {
    if (err) {
      console.log(`Could not open browser automatically. Open manually: ${filePath}`);
    }
  });
}

/**
 * Handle --watch mode: regenerate graph file on interval and on file changes.
 * Writes to .aios/graph.dot, .aios/graph.mmd, or .aios/graph.html.
 * @param {Object} args - Parsed CLI args
 * @returns {Object} Watch state for cleanup (used by tests)
 */
async function handleWatch(args) {
  const watchFormat = WATCH_FORMAT_MAP[args.format] ? args.format : 'dot';
  const { formatter, filename } = WATCH_FORMAT_MAP[watchFormat];
  const intervalMs = (args.interval || 5) * 1000;
  const outputDir = path.resolve(process.cwd(), '.aios');
  const outputPath = path.join(outputDir, filename);

  fs.mkdirSync(outputDir, { recursive: true });

  const source = new CodeIntelSource();

  async function regenerate() {
    try {
      const graphData = await source.getData();
      const content = formatter(graphData);
      fs.writeFileSync(outputPath, content, 'utf8');
      const nodeCount = (graphData.nodes || []).length;
      console.log(`[watch] ${filename} updated (${nodeCount} entities)`);
    } catch (err) {
      console.error(`[watch] regeneration failed: ${err.message}`);
    }
  }

  await regenerate();

  const intervalId = setInterval(regenerate, intervalMs);

  let fileWatcher = null;
  let debounceTimer = null;
  const registryPath = path.resolve(process.cwd(), '.aios-core/data/entity-registry.yaml');

  try {
    if (fs.existsSync(registryPath)) {
      fileWatcher = fs.watch(registryPath, () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(regenerate, DEBOUNCE_MS);
      });
    }
  } catch (_err) {
    // fs.watch not available or path inaccessible; interval-only mode
  }

  function cleanup() {
    clearInterval(intervalId);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    if (fileWatcher) {
      fileWatcher.close();
    }
    console.log('[watch] stopped');
  }

  process.once('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  return { intervalId, fileWatcher, cleanup, outputPath };
}

/**
 * Handle --stats command: render entity statistics and cache metrics.
 * @param {Object} args - Parsed CLI args
 */
async function handleStats(_args) {
  const registrySource = new RegistrySource();
  const metricsSource = new MetricsSource();
  const [registryData, metricsData] = await Promise.all([
    registrySource.getData(),
    metricsSource.getData(),
  ]);
  const isTTY = process.stdout.isTTY;
  const output = renderStats(registryData, metricsData, { isTTY: !!isTTY });

  process.stdout.write(output + '\n');
}

/**
 * Handle --help command: show usage text.
 */
function handleHelp() {
  const usage = `
Usage: aios graph [command] [options]

Commands:
  --deps          Show dependency tree as ASCII text
  --stats         Show entity statistics and cache metrics
  --help, -h      Show this help message

Options:
  --format=FORMAT Output format: ascii (default), json, dot, mermaid, html
  --watch         Live mode: regenerate graph file on interval
  --interval=N    Seconds between regeneration in watch mode (default: 5)

Examples:
  aios graph --deps                        Show dependency tree
  aios graph --deps --format=json          Output as JSON
  aios graph --deps --format=html          Interactive HTML graph (opens browser)
  aios graph --deps --watch                Live DOT file for VS Code preview
  aios graph --deps --watch --format=html  Live HTML with auto-refresh
  aios graph --deps --watch --format=mermaid  Live Mermaid file
  aios graph --deps --watch --interval=10  Refresh every 10 seconds
  aios graph --stats                       Show entity stats and cache metrics
`.trim();

  console.log(usage);
}

/**
 * Handle default summary view: dependency tree (compact) + stats + provider status.
 * @param {Object} args - Parsed CLI args
 */
async function handleSummary(args) {
  const codeIntelSource = new CodeIntelSource();
  const registrySource = new RegistrySource();
  const metricsSource = new MetricsSource();

  const [graphData, registryData, metricsData] = await Promise.all([
    codeIntelSource.getData(),
    registrySource.getData(),
    metricsSource.getData(),
  ]);

  const isTTY = !!process.stdout.isTTY;
  const sections = [];

  sections.push('AIOS Graph Dashboard');
  sections.push(isTTY ? '\u2550'.repeat(35) : '='.repeat(35));
  sections.push('');

  const treeOutput = renderTree(graphData, {
    color: isTTY,
    unicode: isTTY,
    maxPerCategory: MAX_SUMMARY_PER_CATEGORY,
  });
  sections.push(treeOutput);
  sections.push('');

  const statsOutput = renderStats(registryData, metricsData, { isTTY });
  sections.push(statsOutput);
  sections.push('');

  const statusOutput = renderStatus(metricsData, { isTTY });
  sections.push(statusOutput);

  process.stdout.write(sections.join('\n') + '\n');
}

/**
 * Main CLI entry point.
 * @param {string[]} argv - Raw CLI arguments
 */
async function run(argv) {
  const args = parseArgs(argv);

  if (args.help) {
    handleHelp();
    return;
  }

  if (args.command === null) {
    return handleSummary(args);
  }

  const handler = COMMANDS[args.command];
  if (!handler) {
    console.error(`Unknown command: ${args.command}`);
    handleHelp();
    process.exit(1);
  }

  return handler(args);
}

module.exports = {
  run,
  parseArgs,
  handleDeps,
  handleStats,
  handleHelp,
  handleWatch,
  handleSummary,
  handleHtmlOutput,
  openInBrowser,
  MAX_SUMMARY_PER_CATEGORY,
  DEFAULT_WATCH_INTERVAL_MS,
  DEBOUNCE_MS,
  FORMAT_MAP,
  VALID_FORMATS,
  WATCH_FORMAT_MAP,
};
