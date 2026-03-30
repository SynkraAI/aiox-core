/**
 * CLI Command: aiox corp log
 *
 * Query and display corporation activity logs.
 *
 * @module cli/commands/corp/log
 * @version 1.0.0
 * @story CORP-3 - ActivityLogger + JSONL Storage
 *
 * Usage:
 *   aiox corp log                      # Last 50 events
 *   aiox corp log --agent dev          # Filter by agent
 *   aiox corp log --dept engineering   # Filter by department
 *   aiox corp log --action escalation  # Filter by action
 *   aiox corp log --since 2026-03-13   # Filter by date
 *   aiox corp log --last 24h           # Last N hours/days
 *   aiox corp log --json               # JSON output
 *   aiox corp log --summary            # Show statistics
 */

'use strict';

const path = require('path');
const fs = require('fs');

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_LIMIT = 50;

// ANSI colors (no chalk dependency)
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const RESULT_COLORS = {
  success: C.green,
  failure: C.red,
  denied: C.red,
  pending: C.yellow,
  escalated: C.cyan,
  queued: C.blue,
};

// =====================================================
// MAIN
// =====================================================

/**
 * Execute the `corp log` command.
 *
 * @param {string[]} args - CLI arguments after `corp log`
 */
function execute(args = []) {
  const flags = parseFlags(args);

  if (flags.help) {
    showHelp();
    return;
  }

  // Resolve logger
  const loggerPath = path.resolve(__dirname, '../../..', 'core', 'corporation', 'activity-logger.js');
  if (!fs.existsSync(loggerPath)) {
    console.error(`${C.red}Error:${C.reset} ActivityLogger not found at ${loggerPath}`);
    process.exit(1);
  }

  const { ActivityLogger } = require(loggerPath);
  const logDir = path.join(process.cwd(), '.aios', 'corporation', 'activity');

  const logger = new ActivityLogger({
    logDir,
    autoStart: false, // CLI mode -- no timer needed
  });

  try {
    if (flags.summary) {
      runSummary(logger, flags);
    } else {
      runQuery(logger, flags);
    }
  } finally {
    logger.close();
  }
}

// =====================================================
// QUERY
// =====================================================

function runQuery(logger, flags) {
  const query = buildQuery(flags);
  const events = logger.query(query);

  if (events.length === 0) {
    console.log(`${C.dim}No events found matching filters.${C.reset}`);
    return;
  }

  if (flags.json) {
    console.log(JSON.stringify(events, null, 2));
    return;
  }

  printTable(events);
}

function runSummary(logger, flags) {
  const options = {};
  if (flags.since) options.since = flags.since;
  if (flags.until) options.until = flags.until;

  const summary = logger.summarize(options);

  if (flags.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  printSummary(summary);
}

// =====================================================
// QUERY BUILDER
// =====================================================

function buildQuery(flags) {
  const query = {
    limit: flags.limit || DEFAULT_LIMIT,
  };

  if (flags.agent) query.agent_id = flags.agent;
  if (flags.dept) query.department = flags.dept;
  if (flags.action) query.action = flags.action;
  if (flags.result) query.result = flags.result;
  if (flags.since) query.since = flags.since;
  if (flags.until) query.until = flags.until;

  // --last Nh or --last Nd
  if (flags.last) {
    const match = flags.last.match(/^(\d+)(h|d)$/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const now = new Date();

      if (unit === 'h') {
        now.setHours(now.getHours() - value);
      } else {
        now.setDate(now.getDate() - value);
      }

      query.since = now.toISOString();
    } else {
      console.error(`${C.red}Invalid --last format.${C.reset} Use: 24h, 7d, etc.`);
      process.exit(1);
    }
  }

  return query;
}

// =====================================================
// TABLE FORMATTER
// =====================================================

function printTable(events) {
  // Header
  const header = [
    pad('TIMESTAMP', 20),
    pad('AGENT', 14),
    pad('DEPT', 14),
    pad('ACTION', 20),
    pad('TARGET', 24),
    pad('RESULT', 10),
    pad('MS', 6),
  ].join(' ');

  console.log(`${C.bold}${header}${C.reset}`);
  console.log(C.dim + '-'.repeat(header.length) + C.reset);

  for (const e of events) {
    const ts = e.timestamp ? e.timestamp.replace('T', ' ').substring(0, 19) : '';
    const resultColor = RESULT_COLORS[e.result] || C.white;

    const row = [
      pad(ts, 20),
      pad(e.agent_id || '', 14),
      pad(e.department || '', 14),
      pad(e.action || '', 20),
      pad(truncate(e.target || '', 24), 24),
      resultColor + pad(e.result || '', 10) + C.reset,
      pad(e.duration_ms != null ? String(e.duration_ms) : '-', 6),
    ].join(' ');

    console.log(row);
  }

  console.log(`${C.dim}\n${events.length} event(s) displayed.${C.reset}`);
}

function printSummary(summary) {
  console.log(`${C.bold}Activity Summary${C.reset}`);
  console.log(`${C.dim}${'='.repeat(40)}${C.reset}`);
  console.log(`Total events: ${C.bold}${summary.total_events}${C.reset}\n`);

  printGroup('By Department', summary.by_department);
  printGroup('By Action', summary.by_action);
  printGroup('By Agent', summary.by_agent);
  printGroup('By Result', summary.by_result);
}

function printGroup(title, data) {
  console.log(`${C.cyan}${title}:${C.reset}`);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  for (const [key, count] of entries) {
    console.log(`  ${pad(key, 24)} ${C.bold}${count}${C.reset}`);
  }
  console.log('');
}

// =====================================================
// HELPERS
// =====================================================

function pad(str, len) {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.substring(0, len - 3) + '...';
}

function parseFlags(args) {
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--agent': flags.agent = next; i++; break;
      case '--dept': flags.dept = next; i++; break;
      case '--action': flags.action = next; i++; break;
      case '--result': flags.result = next; i++; break;
      case '--since': flags.since = next; i++; break;
      case '--until': flags.until = next; i++; break;
      case '--last': flags.last = next; i++; break;
      case '--limit': flags.limit = parseInt(next, 10); i++; break;
      case '--json': flags.json = true; break;
      case '--summary': flags.summary = true; break;
      case '--help': case '-h': flags.help = true; break;
    }
  }

  return flags;
}

function showHelp() {
  console.log(`
${C.bold}aiox corp log${C.reset} -- Query corporation activity logs

${C.bold}USAGE:${C.reset}
  aiox corp log [flags]

${C.bold}FLAGS:${C.reset}
  --agent <id>      Filter by agent (dev, qa, architect, etc.)
  --dept <name>     Filter by department (engineering, product, etc.)
  --action <type>   Filter by action (execute_task, escalation, etc.)
  --result <type>   Filter by result (success, failure, pending, etc.)
  --since <date>    Events after this date (ISO 8601 or YYYY-MM-DD)
  --until <date>    Events before this date
  --last <duration> Shorthand: 24h, 7d, etc.
  --limit <n>       Max events (default: 50)
  --summary         Show grouped statistics instead of event list
  --json            Output as JSON
  -h, --help        Show this help

${C.bold}EXAMPLES:${C.reset}
  aiox corp log --agent dev --last 24h
  aiox corp log --dept engineering --since 2026-03-13
  aiox corp log --action escalation --json
  aiox corp log --summary --last 7d
`);
}

// =====================================================
// CLI INDEX (for corp command registration)
// =====================================================

module.exports = { execute };

// Direct execution
if (require.main === module) {
  execute(process.argv.slice(2));
}
