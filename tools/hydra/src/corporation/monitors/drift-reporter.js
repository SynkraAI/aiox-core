/**
 * DriftReporter -- Agent Drift Report Generator
 *
 * Generates health reports from DriftDetector data:
 *   - Per-agent health status (healthy/degraded/critical)
 *   - Top drifters ranking
 *   - Trend analysis (improving/stable/worsening)
 *   - Summary statistics for the entire corporation
 *
 * CLI-first design: all output is structured data suitable for
 * both programmatic consumption and CLI rendering.
 *
 * @module corporation/monitors/drift-reporter
 * @version 1.0.0
 */

import { HEALTH_STATUS } from './drift-detector.js';

// =====================================================
// DriftReporter
// =====================================================

export class DriftReporter {
  /**
   * @param {Object} options
   * @param {import('./drift-detector.js').DriftDetector} options.detector - DriftDetector instance
   */
  constructor(options = {}) {
    if (!options.detector) {
      throw new Error('DriftReporter requires a DriftDetector instance');
    }
    this.detector = options.detector;
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Generate a full drift report for all agents.
   *
   * @returns {Object} Report with summary, agents, top_drifters, alerts
   */
  generateReport() {
    const allScores = this.detector.getAllScores();
    const agentIds = Object.keys(allScores);

    const agents = agentIds.map(agentId => {
      const score = allScores[agentId];
      const trend = this.detector.getTrend(agentId);
      const baseline = this.detector.baseline.getBaseline(agentId);

      return {
        agent_id: agentId,
        score: score.score,
        status: score.status,
        alert: score.alert,
        dimensions: score.dimensions,
        trend: trend.trend,
        trend_direction: trend.direction,
        sample_size: score.sample_size,
        baseline_summary: baseline ? {
          avg_duration_ms: Math.round(baseline.avg_duration_ms),
          avg_output_length: Math.round(baseline.avg_output_length),
          error_rate: Math.round(baseline.error_rate * 100) / 100,
        } : null,
      };
    });

    // Sort by score descending
    agents.sort((a, b) => b.score - a.score);

    const summary = this._computeSummary(agents);

    return {
      generated_at: new Date().toISOString(),
      summary,
      agents,
      top_drifters: agents.filter(a => a.alert).slice(0, 10),
      alerts: agents.filter(a => a.alert).map(a => ({
        agent_id: a.agent_id,
        score: a.score,
        status: a.status,
        trend: a.trend,
      })),
    };
  }

  /**
   * Generate a report for a single agent.
   *
   * @param {string} agentId
   * @returns {Object|null} Agent report or null if no data
   */
  generateAgentReport(agentId) {
    const score = this.detector.getLatestScore(agentId);
    if (!score) return null;

    const trend = this.detector.getTrend(agentId);
    const baseline = this.detector.baseline.getBaseline(agentId);
    const recentInteractions = this.detector.baseline.getRecentInteractions(agentId, 10);

    return {
      agent_id: agentId,
      generated_at: new Date().toISOString(),
      score: score.score,
      status: score.status,
      alert: score.alert,
      dimensions: score.dimensions,
      trend: {
        direction: trend.trend,
        slope: trend.direction,
        recent_scores: trend.recent_scores,
      },
      baseline: baseline ? {
        avg_duration_ms: Math.round(baseline.avg_duration_ms),
        std_duration_ms: Math.round(baseline.std_duration_ms),
        median_duration_ms: Math.round(baseline.median_duration_ms),
        p95_duration_ms: Math.round(baseline.p95_duration_ms),
        avg_output_length: Math.round(baseline.avg_output_length),
        error_rate: Math.round(baseline.error_rate * 1000) / 1000,
        total_interactions: baseline.total_interactions,
        sample_size: baseline.sample_size,
        tool_frequency: baseline.tool_frequency,
        task_distribution: baseline.task_distribution,
      } : null,
      recent_interactions: recentInteractions.map(i => ({
        timestamp: i.timestamp,
        duration_ms: i.duration_ms,
        output_length: i.output_length,
        error: i.error,
        tools_used: i.tools_used,
        task_type: i.task_type,
      })),
    };
  }

  /**
   * Format report as human-readable text (CLI output).
   *
   * @param {Object} [report] - Report object (generates new if not provided)
   * @returns {string} Formatted text
   */
  formatText(report) {
    const r = report || this.generateReport();
    const lines = [];

    lines.push('=== AGENT DRIFT REPORT ===');
    lines.push(`Generated: ${r.generated_at}`);
    lines.push('');

    // Summary
    lines.push('--- Summary ---');
    lines.push(`Total agents tracked: ${r.summary.total_agents}`);
    lines.push(`Healthy: ${r.summary.healthy} | Warning: ${r.summary.warning} | Degraded: ${r.summary.degraded} | Critical: ${r.summary.critical}`);
    lines.push(`Average drift score: ${r.summary.avg_score}`);
    lines.push(`Agents in alert: ${r.summary.alerting}`);
    lines.push('');

    // Alerts
    if (r.alerts.length > 0) {
      lines.push('--- ALERTS ---');
      for (const alert of r.alerts) {
        const icon = alert.status === 'critical' ? '[!!!]' : '[!]';
        lines.push(`${icon} ${alert.agent_id}: score=${alert.score} status=${alert.status} trend=${alert.trend}`);
      }
      lines.push('');
    }

    // Agent details
    if (r.agents.length > 0) {
      lines.push('--- Agent Details ---');
      for (const agent of r.agents) {
        const statusTag = `[${agent.status.toUpperCase()}]`;
        const trendArrow = agent.trend === 'worsening' ? '^' : agent.trend === 'improving' ? 'v' : '=';
        lines.push(`${statusTag} ${agent.agent_id}: score=${agent.score} trend=${trendArrow} samples=${agent.sample_size}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format a single agent report as text.
   *
   * @param {string} agentId
   * @returns {string}
   */
  formatAgentText(agentId) {
    const r = this.generateAgentReport(agentId);
    if (!r) return `No drift data for agent "${agentId}"`;

    const lines = [];
    lines.push(`=== DRIFT REPORT: ${r.agent_id} ===`);
    lines.push(`Status: ${r.status.toUpperCase()} | Score: ${r.score} | Alert: ${r.alert ? 'YES' : 'no'}`);
    lines.push(`Trend: ${r.trend.direction} (slope: ${r.trend.slope})`);
    lines.push('');

    lines.push('Dimensions:');
    for (const [dim, val] of Object.entries(r.dimensions)) {
      const bar = '#'.repeat(Math.round(val * 20)).padEnd(20, '.');
      lines.push(`  ${dim.padEnd(15)} [${bar}] ${(val * 100).toFixed(1)}%`);
    }
    lines.push('');

    if (r.baseline) {
      lines.push('Baseline:');
      lines.push(`  Avg duration: ${r.baseline.avg_duration_ms}ms (std: ${r.baseline.std_duration_ms}ms)`);
      lines.push(`  Avg output:   ${r.baseline.avg_output_length} chars`);
      lines.push(`  Error rate:   ${(r.baseline.error_rate * 100).toFixed(1)}%`);
      lines.push(`  Samples:      ${r.baseline.sample_size}`);
    }

    return lines.join('\n');
  }

  // =====================================================
  // PRIVATE
  // =====================================================

  /**
   * Compute summary statistics across all agents.
   * @private
   * @param {Object[]} agents
   * @returns {Object}
   */
  _computeSummary(agents) {
    const statusCounts = {
      [HEALTH_STATUS.HEALTHY]: 0,
      [HEALTH_STATUS.WARNING]: 0,
      [HEALTH_STATUS.DEGRADED]: 0,
      [HEALTH_STATUS.CRITICAL]: 0,
    };

    let totalScore = 0;

    for (const agent of agents) {
      statusCounts[agent.status] = (statusCounts[agent.status] || 0) + 1;
      totalScore += agent.score;
    }

    return {
      total_agents: agents.length,
      healthy: statusCounts[HEALTH_STATUS.HEALTHY] || 0,
      warning: statusCounts[HEALTH_STATUS.WARNING] || 0,
      degraded: statusCounts[HEALTH_STATUS.DEGRADED] || 0,
      critical: statusCounts[HEALTH_STATUS.CRITICAL] || 0,
      avg_score: agents.length > 0 ? Math.round((totalScore / agents.length) * 1000) / 1000 : 0,
      alerting: agents.filter(a => a.alert).length,
    };
  }
}
