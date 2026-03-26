'use strict';

/**
 * Productivity Metrics Module
 *
 * Computes per-session and cross-session productivity metrics from Tier 2 data.
 * All computation is on-demand (read-only, no continuous overhead).
 *
 * Metrics computed:
 * - Prompts per agent (periodic events * 5)
 * - Stories started vs completed
 * - QA pass rate
 * - Commits per session
 * - Average agent duration
 *
 * @module metrics
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-2.4
 */

const fs = require('fs');
const path = require('path');

/**
 * Resolve the path to the metrics cache file.
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to metrics.json
 */
function getMetricsPath(projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, '.aiox', 'current-session', 'metrics.json');
}

/**
 * Compute per-session metrics from a Tier 2 session state object.
 *
 * @param {object} sessionState - Session state object with session header and events array
 * @returns {object} Metrics object
 */
function computeSessionMetrics(sessionState) {
  const metrics = {
    session_id: '',
    project: '',
    date: new Date().toISOString().slice(0, 10),
    total_prompts: 0,
    prompts_per_agent: {},
    stories: {
      started: 0,
      completed: 0,
      completion_rate: 0,
    },
    qa: {
      total_gates: 0,
      passed: 0,
      failed: 0,
      pass_rate: 0,
    },
    commits: 0,
    avg_agent_duration_minutes: 0,
  };

  if (!sessionState || !sessionState.events || sessionState.events.length === 0) {
    return metrics;
  }

  metrics.session_id = (sessionState.session && sessionState.session.id) || '';
  metrics.project = (sessionState.session && sessionState.session.project) || '';

  // Extract session date from session header or first event
  if (sessionState.session && sessionState.session.started) {
    const dateMatch = sessionState.session.started.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) metrics.date = dateMatch[1];
  }

  // Track per-agent periodic event counts and timestamps
  const agentPeriodicCounts = {};
  const agentTimestamps = {};
  const storiesStarted = new Set();
  const storiesCompleted = new Set();

  for (const event of sessionState.events) {
    const agent = event.agent;

    // Track agent timestamps for duration calculation
    if (agent) {
      if (!agentTimestamps[agent]) {
        agentTimestamps[agent] = { first: null, last: null };
      }
      const ts = event.timestamp ? new Date(event.timestamp).getTime() : null;
      if (ts && !isNaN(ts)) {
        if (!agentTimestamps[agent].first || ts < agentTimestamps[agent].first) {
          agentTimestamps[agent].first = ts;
        }
        if (!agentTimestamps[agent].last || ts > agentTimestamps[agent].last) {
          agentTimestamps[agent].last = ts;
        }
      }
    }

    switch (event.type) {
      case 'periodic':
        if (agent) {
          agentPeriodicCounts[agent] = (agentPeriodicCounts[agent] || 0) + 1;
        }
        break;

      case 'story_start':
        if (event.story) storiesStarted.add(event.story);
        break;

      case 'story_complete':
        if (event.story) storiesCompleted.add(event.story);
        break;

      case 'qa_gate':
        metrics.qa.total_gates++;
        if (event.verdict === 'PASS') {
          metrics.qa.passed++;
        } else {
          metrics.qa.failed++;
        }
        break;

      case 'commit':
        metrics.commits++;
        break;

      default:
        break;
    }
  }

  // Compute prompts per agent (periodic events * 5)
  let totalPrompts = 0;
  for (const [agent, count] of Object.entries(agentPeriodicCounts)) {
    const prompts = count * 5;
    metrics.prompts_per_agent[agent] = prompts;
    totalPrompts += prompts;
  }
  metrics.total_prompts = totalPrompts;

  // Stories
  metrics.stories.started = storiesStarted.size;
  metrics.stories.completed = storiesCompleted.size;
  metrics.stories.completion_rate = storiesStarted.size > 0
    ? storiesCompleted.size / storiesStarted.size
    : 0;

  // QA pass rate
  metrics.qa.pass_rate = metrics.qa.total_gates > 0
    ? metrics.qa.passed / metrics.qa.total_gates
    : 0;

  // Average agent duration (minutes)
  const agentDurations = [];
  for (const [, ts] of Object.entries(agentTimestamps)) {
    if (ts.first && ts.last && ts.last > ts.first) {
      agentDurations.push(ts.last - ts.first);
    }
  }

  if (agentDurations.length > 0) {
    const avgMs = agentDurations.reduce((sum, d) => sum + d, 0) / agentDurations.length;
    metrics.avg_agent_duration_minutes = Math.round(avgMs / 60000);
  }

  return metrics;
}

/**
 * Aggregate metrics from multiple archived session states.
 *
 * @param {Array<object>} archivedStates - Array of parsed session state objects
 * @returns {object} Aggregated metrics
 */
function aggregateHistoricalMetrics(archivedStates) {
  const aggregated = {
    sessions_analyzed: 0,
    date_range: { start: '', end: '' },
    avg_prompts_per_session: 0,
    avg_prompts_per_agent: {},
    stories: {
      total_started: 0,
      total_completed: 0,
      avg_completion_rate: 0,
    },
    qa: {
      avg_pass_rate: 0,
    },
    avg_commits_per_session: 0,
    avg_agent_duration_minutes: 0,
  };

  if (!archivedStates || archivedStates.length === 0) {
    return aggregated;
  }

  const sessionMetrics = [];
  const allAgentPrompts = {};
  const dates = [];

  for (const state of archivedStates) {
    const m = computeSessionMetrics(state);
    sessionMetrics.push(m);

    if (m.date) dates.push(m.date);

    // Accumulate per-agent prompts
    for (const [agent, prompts] of Object.entries(m.prompts_per_agent)) {
      if (!allAgentPrompts[agent]) {
        allAgentPrompts[agent] = [];
      }
      allAgentPrompts[agent].push(prompts);
    }
  }

  aggregated.sessions_analyzed = sessionMetrics.length;

  // Date range
  const sortedDates = dates.filter(Boolean).sort();
  if (sortedDates.length > 0) {
    aggregated.date_range.start = sortedDates[0];
    aggregated.date_range.end = sortedDates[sortedDates.length - 1];
  }

  // Average prompts per session
  const totalPrompts = sessionMetrics.reduce((sum, m) => sum + m.total_prompts, 0);
  aggregated.avg_prompts_per_session = sessionMetrics.length > 0
    ? Math.round(totalPrompts / sessionMetrics.length)
    : 0;

  // Average prompts per agent
  for (const [agent, promptsList] of Object.entries(allAgentPrompts)) {
    aggregated.avg_prompts_per_agent[agent] = promptsList.length > 0
      ? Math.round(promptsList.reduce((sum, p) => sum + p, 0) / promptsList.length)
      : 0;
  }

  // Stories totals
  aggregated.stories.total_started = sessionMetrics.reduce((sum, m) => sum + m.stories.started, 0);
  aggregated.stories.total_completed = sessionMetrics.reduce((sum, m) => sum + m.stories.completed, 0);

  const completionRates = sessionMetrics
    .filter((m) => m.stories.started > 0)
    .map((m) => m.stories.completion_rate);
  aggregated.stories.avg_completion_rate = completionRates.length > 0
    ? completionRates.reduce((sum, r) => sum + r, 0) / completionRates.length
    : 0;

  // QA average pass rate
  const passRates = sessionMetrics
    .filter((m) => m.qa.total_gates > 0)
    .map((m) => m.qa.pass_rate);
  aggregated.qa.avg_pass_rate = passRates.length > 0
    ? passRates.reduce((sum, r) => sum + r, 0) / passRates.length
    : 0;

  // Average commits per session
  const totalCommits = sessionMetrics.reduce((sum, m) => sum + m.commits, 0);
  aggregated.avg_commits_per_session = sessionMetrics.length > 0
    ? Math.round((totalCommits / sessionMetrics.length) * 10) / 10
    : 0;

  // Average agent duration per session
  const durations = sessionMetrics
    .filter((m) => m.avg_agent_duration_minutes > 0)
    .map((m) => m.avg_agent_duration_minutes);
  aggregated.avg_agent_duration_minutes = durations.length > 0
    ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
    : 0;

  return aggregated;
}

/**
 * Calculate a trend indicator comparing current value to historical average.
 *
 * @param {number} currentValue - Current session value
 * @param {number} historicalAvg - Historical average value
 * @param {boolean} [inverted=false] - If true, lower is better (e.g., fail rate)
 * @returns {string} Trend arrow: up-arrow (improving), down-arrow (declining), right-arrow (stable)
 */
function calculateTrend(currentValue, historicalAvg, inverted) {
  // Edge case: no historical data
  if (historicalAvg === 0 && currentValue === 0) return '\u2192';
  if (historicalAvg === 0) return inverted ? '\u2193' : '\u2191';

  const threshold = historicalAvg * 0.10;
  const diff = currentValue - historicalAvg;

  if (diff > threshold) {
    return inverted ? '\u2193' : '\u2191'; // up-arrow or down-arrow based on inversion
  }
  if (diff < -threshold) {
    return inverted ? '\u2191' : '\u2193'; // inverted: lower is better
  }
  return '\u2192'; // stable (right-arrow)
}

/**
 * Format a duration in minutes to a human-readable string.
 *
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
function formatDurationMinutes(minutes) {
  if (!minutes || minutes <= 0) return '<1m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format per-session metrics for CLI output.
 *
 * @param {object} metrics - Metrics object from computeSessionMetrics()
 * @returns {string} Formatted CLI string
 */
function formatMetricsForCLI(metrics) {
  if (!metrics) return 'No metrics available.';

  const lines = [];
  lines.push('Metrics:');

  const rows = [];

  // Prompts per agent
  const agents = Object.entries(metrics.prompts_per_agent || {});
  if (agents.length > 0) {
    for (const [agent, prompts] of agents) {
      rows.push([`Prompts per Agent (@${agent})`, String(prompts)]);
    }
  } else {
    rows.push(['Total Prompts', String(metrics.total_prompts || 0)]);
  }

  // Stories
  rows.push(['Stories Started', String(metrics.stories.started)]);
  rows.push(['Stories Completed', String(metrics.stories.completed)]);
  const ratePercent = Math.round(metrics.stories.completion_rate * 100);
  rows.push(['Completion Rate', `${ratePercent}%`]);

  // QA
  if (metrics.qa.total_gates > 0) {
    const qaPercent = Math.round(metrics.qa.pass_rate * 100);
    rows.push(['QA Pass Rate', `${metrics.qa.passed}/${metrics.qa.total_gates} (${qaPercent}%)`]);
  } else {
    rows.push(['QA Pass Rate', 'N/A']);
  }

  // Commits
  rows.push(['Commits', String(metrics.commits)]);

  // Average agent duration
  rows.push(['Avg Agent Duration', formatDurationMinutes(metrics.avg_agent_duration_minutes)]);

  // Build table
  const col0Width = Math.max(...rows.map((r) => r[0].length));
  const col1Width = Math.max(...rows.map((r) => r[1].length));

  const headerRow = `| ${'Metric'.padEnd(col0Width)} | ${'Value'.padEnd(col1Width)} |`;
  const sepRow = `| ${'-'.repeat(col0Width)} | ${'-'.repeat(col1Width)} |`;

  lines.push(headerRow);
  lines.push(sepRow);

  for (const [label, value] of rows) {
    lines.push(`| ${label.padEnd(col0Width)} | ${value.padEnd(col1Width)} |`);
  }

  return lines.join('\n');
}

/**
 * Save computed metrics to the cache file.
 *
 * @param {object} metrics - Metrics object
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Path to the saved file
 */
function saveMetrics(metrics, projectRoot) {
  const filePath = getMetricsPath(projectRoot);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2), 'utf8');
  return filePath;
}

/**
 * Read cached metrics from the cache file.
 * Returns null gracefully if file does not exist.
 *
 * @param {string} [projectRoot] - Project root directory
 * @returns {object|null} Cached metrics or null
 */
function readMetrics(projectRoot) {
  const filePath = getMetricsPath(projectRoot);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

module.exports = {
  computeSessionMetrics,
  aggregateHistoricalMetrics,
  calculateTrend,
  formatMetricsForCLI,
  formatDurationMinutes,
  saveMetrics,
  readMetrics,
  getMetricsPath,
};
