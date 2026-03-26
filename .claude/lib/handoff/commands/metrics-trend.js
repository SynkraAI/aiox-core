'use strict';

/**
 * Metrics Trend Command Handler
 *
 * Implements the `*task metrics-trend {project} [--last N]` command.
 * Scans archived sessions, computes per-session metrics, aggregates
 * historical data, and displays a trend table comparing current session
 * to historical averages.
 *
 * Reuses archive scanning from session-history.js (Story 2.3) and
 * metrics computation from metrics.js (Story 2.4).
 *
 * Uses the L4 `*task` pattern -- no L2 agent command registration needed.
 *
 * Performance target: <1s for 20 archived sessions.
 *
 * @module commands/metrics-trend
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-2.4
 */

const path = require('path');

/** Default number of sessions to analyze */
const DEFAULT_SESSIONS = 20;

/**
 * Safely require a module, returning null on failure.
 * @param {string} modulePath - Absolute path to the module
 * @returns {object|null}
 */
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (_) {
    return null;
  }
}

/**
 * Format a trend table row.
 * @param {string} metric - Metric name
 * @param {string} current - Current value
 * @param {string} avg - Historical average
 * @param {string} trend - Trend arrow
 * @param {Array<number>} widths - Column widths
 * @returns {string} Formatted row
 */
function formatRow(metric, current, avg, trend, widths) {
  return `| ${metric.padEnd(widths[0])} | ${current.padEnd(widths[1])} | ${avg.padEnd(widths[2])} | ${trend.padEnd(widths[3])} |`;
}

/**
 * Generate the metrics trend report.
 *
 * @param {string} project - Project name (e.g., 'aios-core')
 * @param {object} [options] - Options
 * @param {number} [options.last] - Number of sessions to analyze (default: 20)
 * @param {string} [options.projectRoot] - Project root directory
 * @returns {string} Formatted CLI report
 */
function generateMetricsTrend(project, options = {}) {
  if (!project || typeof project !== 'string') {
    return 'Usage: *task metrics-trend {project} [--last N]\nExample: *task metrics-trend aios-core --last 20';
  }

  const root = options.projectRoot || process.cwd();
  const lastN = (typeof options.last === 'number' && options.last > 0) ? options.last : DEFAULT_SESSIONS;

  // Load required modules
  const metricsModule = safeRequire(path.join(root, '.claude', 'lib', 'handoff', 'metrics'));
  if (!metricsModule) {
    return 'Metrics module not available at .claude/lib/handoff/metrics.js';
  }

  const sessionHistory = safeRequire(path.join(root, '.claude', 'lib', 'handoff', 'commands', 'session-history'));
  if (!sessionHistory) {
    return 'Session history module not available at .claude/lib/handoff/commands/session-history.js';
  }

  const sessionState = safeRequire(path.join(root, '.claude', 'lib', 'handoff', 'session-state'));
  if (!sessionState) {
    return 'Session state module not available at .claude/lib/handoff/session-state.js';
  }

  // Get current session metrics
  let currentState;
  try {
    currentState = sessionState.getSessionState(root);
  } catch (_) {
    currentState = { session: { id: '', started: '', project: '' }, events: [] };
  }
  const currentMetrics = metricsModule.computeSessionMetrics(currentState);

  // Scan archived sessions and parse full states
  const archivedStates = scanAndParseArchives(project, lastN, root, sessionHistory, sessionState);

  // Aggregate historical metrics
  const historical = metricsModule.aggregateHistoricalMetrics(archivedStates);

  // Build the trend table
  return formatTrendReport(project, lastN, currentMetrics, historical, metricsModule);
}

/**
 * Scan archived session files and parse them into full state objects.
 *
 * @param {string} project - Project name
 * @param {number} limit - Max sessions to scan
 * @param {string} root - Project root
 * @param {object} sessionHistory - session-history module
 * @param {object} sessionState - session-state module
 * @returns {Array<object>} Array of parsed session state objects
 */
function scanAndParseArchives(project, limit, root, sessionHistory, sessionState) {
  const fs = require('fs');
  const archiveDir = path.join(root, '.aiox', 'session-history', project);

  if (!fs.existsSync(archiveDir)) {
    return [];
  }

  let entries;
  try {
    entries = fs.readdirSync(archiveDir);
  } catch (_) {
    return [];
  }

  const stateFiles = entries
    .filter((name) => name.startsWith('state-') && name.endsWith('.yaml'))
    .sort()
    .reverse()
    .slice(0, limit);

  const states = [];
  for (const fileName of stateFiles) {
    const filePath = path.join(archiveDir, fileName);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size < 10) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = sessionState.parseState(content);
      if (parsed && parsed.events && parsed.events.length > 0) {
        states.push(parsed);
      }
    } catch (_) {
      continue;
    }
  }

  return states;
}

/**
 * Format the full metrics trend report.
 *
 * @param {string} project - Project name
 * @param {number} lastN - Number of sessions analyzed
 * @param {object} current - Current session metrics
 * @param {object} historical - Aggregated historical metrics
 * @param {object} metricsModule - The metrics module (for calculateTrend, formatDurationMinutes)
 * @returns {string} Formatted CLI output
 */
function formatTrendReport(project, lastN, current, historical, metricsModule) {
  const lines = [];
  const sessionsAnalyzed = historical.sessions_analyzed;

  lines.push(`Productivity Metrics Trend -- ${project} (Last ${lastN} sessions)`);
  lines.push('');

  if (historical.date_range.start && historical.date_range.end) {
    lines.push(`Date Range: ${historical.date_range.start} to ${historical.date_range.end}`);
  }
  lines.push(`Sessions Analyzed: ${sessionsAnalyzed}`);
  lines.push('');

  if (sessionsAnalyzed === 0) {
    lines.push('No archived sessions found for trend analysis.');
    lines.push(`Archive directory: .aiox/session-history/${project}/`);
    return lines.join('\n');
  }

  // Build trend rows
  const rows = [];

  // Prompts per session
  rows.push({
    metric: 'Prompts per Session',
    current: String(current.total_prompts),
    avg: String(historical.avg_prompts_per_session),
    trend: metricsModule.calculateTrend(current.total_prompts, historical.avg_prompts_per_session),
  });

  // Stories completed
  rows.push({
    metric: 'Stories Completed',
    current: String(current.stories.completed),
    avg: sessionsAnalyzed > 0
      ? String(Math.round((historical.stories.total_completed / sessionsAnalyzed) * 10) / 10)
      : '0',
    trend: metricsModule.calculateTrend(
      current.stories.completed,
      sessionsAnalyzed > 0 ? historical.stories.total_completed / sessionsAnalyzed : 0,
    ),
  });

  // Completion rate
  const currentCompRate = Math.round(current.stories.completion_rate * 100);
  const avgCompRate = Math.round(historical.stories.avg_completion_rate * 100);
  rows.push({
    metric: 'Completion Rate',
    current: `${currentCompRate}%`,
    avg: `${avgCompRate}%`,
    trend: metricsModule.calculateTrend(currentCompRate, avgCompRate),
  });

  // QA pass rate
  const currentQaRate = Math.round(current.qa.pass_rate * 100);
  const avgQaRate = Math.round(historical.qa.avg_pass_rate * 100);
  rows.push({
    metric: 'QA Pass Rate',
    current: `${currentQaRate}%`,
    avg: `${avgQaRate}%`,
    trend: metricsModule.calculateTrend(currentQaRate, avgQaRate),
  });

  // Commits per session
  rows.push({
    metric: 'Commits per Session',
    current: String(current.commits),
    avg: String(historical.avg_commits_per_session),
    trend: metricsModule.calculateTrend(current.commits, historical.avg_commits_per_session),
  });

  // Avg agent duration
  rows.push({
    metric: 'Avg Agent Duration',
    current: metricsModule.formatDurationMinutes(current.avg_agent_duration_minutes),
    avg: metricsModule.formatDurationMinutes(historical.avg_agent_duration_minutes),
    trend: metricsModule.calculateTrend(
      current.avg_agent_duration_minutes,
      historical.avg_agent_duration_minutes,
    ),
  });

  // Calculate column widths
  const headers = ['Metric', 'Current', `Avg (Last ${lastN})`, 'Trend'];
  const widths = headers.map((h, i) => {
    const key = ['metric', 'current', 'avg', 'trend'][i];
    const maxRow = rows.reduce((max, r) => Math.max(max, r[key].length), 0);
    return Math.max(h.length, maxRow);
  });

  // Header row
  lines.push(formatRow(headers[0], headers[1], headers[2], headers[3], widths));

  // Separator
  const sep = widths.map((w) => '-'.repeat(w)).join(' | ');
  lines.push(`| ${sep} |`);

  // Data rows
  for (const row of rows) {
    lines.push(formatRow(row.metric, row.current, row.avg, row.trend, widths));
  }

  // Legend
  lines.push('');
  lines.push('Trend Indicators:');
  lines.push('\u2191 Improving  \u2193 Declining  \u2192 Stable (within \u00b110%)');

  return lines.join('\n');
}

module.exports = {
  generateMetricsTrend,
  scanAndParseArchives,
  formatTrendReport,
  DEFAULT_SESSIONS,
};
