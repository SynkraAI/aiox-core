'use strict';

/**
 * Session Report Command Handler
 *
 * Implements the `*task session-report` command.
 * Reads Tier 2 session state, generates per-agent summaries,
 * event timeline, and story details — outputs a formatted CLI report.
 *
 * Uses the L4 `*task` pattern -- no L2 agent command registration needed.
 *
 * @module commands/session-report
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-2.1 (agent activity), AIOX-HO-2.3 (timeline + story details), AIOX-HO-2.4 (metrics)
 */

const path = require('path');

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
 * Generate and return the session report as a formatted string.
 *
 * Sections:
 * 1. Overview stats (prompts, agents, stories, files)
 * 2. Agent Activity table (from Story 2.1)
 * 3. Story Details table (from Story 2.3)
 * 4. Recent Events timeline (from Story 2.3)
 *
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Formatted session report
 */
function generateReport(projectRoot) {
  const root = projectRoot || process.cwd();

  // Load Tier 2 session state
  const ssModule = safeRequire(path.join(root, '.claude', 'lib', 'handoff', 'session-state'));
  if (!ssModule) {
    return 'No session state available. Session state is recorded in .aiox/current-session/state.yaml.';
  }

  let sessionState;
  try {
    sessionState = ssModule.getSessionState(root);
  } catch (_) {
    return 'No session state available. Session state is recorded in .aiox/current-session/state.yaml.';
  }

  if (!sessionState || !sessionState.events || sessionState.events.length === 0) {
    return 'No events recorded in current session. Agent activity is tracked automatically via hooks.';
  }

  // Load agent activity module (Story 2.1)
  const agentActivity = safeRequire(path.join(root, '.claude', 'lib', 'handoff', 'agent-activity'));
  if (!agentActivity) {
    return 'Agent activity module not available.';
  }

  // Load metrics module (Story 2.4)
  const metricsModule = safeRequire(path.join(root, '.claude', 'lib', 'handoff', 'metrics'));

  // Load event timeline formatter (Story 2.3)
  const eventTimeline = safeRequire(
    path.join(root, '.claude', 'lib', 'handoff', 'formatters', 'event-timeline'),
  );

  // Load story details aggregator (Story 2.3)
  const storyDetails = safeRequire(
    path.join(root, '.claude', 'lib', 'handoff', 'aggregators', 'story-details'),
  );

  // Generate agent summaries
  const summaries = agentActivity.generateAgentSummary(sessionState);

  // Get total prompt count from last periodic event
  const periodicEvents = sessionState.events.filter((e) => e.type === 'periodic');
  const lastPeriodic = periodicEvents.length > 0
    ? periodicEvents[periodicEvents.length - 1]
    : null;
  const totalPrompts = lastPeriodic ? (lastPeriodic.prompt_count || 0) : 0;

  // Format the base CLI output (Story 2.1: overview + agent table)
  const project = sessionState.session.project || 'unknown';
  const baseReport = agentActivity.formatSummaryForCLI(summaries, {
    project,
    totalPrompts,
  });

  const sections = [baseReport];

  // Story Details section (Story 2.3)
  if (storyDetails) {
    const stories = storyDetails.aggregateStoryDetails(sessionState.events);
    if (stories.length > 0) {
      sections.push('');
      sections.push('Story Details:');
      sections.push(storyDetails.formatStoryDetailsTable(stories));
    }
  }

  // Metrics section (Story 2.4)
  if (metricsModule) {
    try {
      const metrics = metricsModule.computeSessionMetrics(sessionState);
      sections.push('');
      sections.push(metricsModule.formatMetricsForCLI(metrics));

      // Cache metrics for later use
      try {
        const savedPath = metricsModule.saveMetrics(metrics, root);
        sections.push('');
        sections.push(`Metrics cached at ${savedPath.replace(root + path.sep, '')}`);
      } catch (_) {
        // Cache save is best-effort, do not fail report
      }
    } catch (_) {
      // Metrics computation failure is non-blocking
    }
  }

  // Event Timeline section (Story 2.3)
  if (eventTimeline) {
    const timeline = eventTimeline.formatCompactTimeline(sessionState.events, 10);
    if (timeline !== 'No events recorded.') {
      sections.push('');
      sections.push('Recent Events (Last 10):');
      sections.push(timeline);
    }
  }

  return sections.join('\n');
}

module.exports = { generateReport };
