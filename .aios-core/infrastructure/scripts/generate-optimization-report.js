#!/usr/bin/env node
// =============================================================================
// generate-optimization-report.js — Optimization Report & Recommendations
// =============================================================================
// Story: TOK-5 (Tool Usage Analytics Pipeline)
// Layer: L2 (.aios-core/infrastructure/scripts/)
// Purpose:
//   - Compare post-optimization metrics against TOK-1.5 baseline (ACs 4-6)
//   - Generate promote/demote recommendations (ACs 7-9, 13-15)
//   - Produce summary optimization report (ACs 16-17)
//
// Usage:
//   node .aios-core/infrastructure/scripts/generate-optimization-report.js [options]
//
// Options:
//   --dry-run      Show results without writing files
//   --json         Output results as JSON to stdout
//   --verbose      Show detailed per-tool breakdown
// =============================================================================

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// --- Paths ---
const ROOT = process.cwd();
const ANALYTICS_DIR = path.resolve(ROOT, '.aios', 'analytics');
const BASELINE_FILE = path.join(ANALYTICS_DIR, 'token-baseline.json');
const USAGE_FILE = path.join(ANALYTICS_DIR, 'tool-usage.json');
const REPORT_FILE = path.join(ANALYTICS_DIR, 'optimization-report.json');
const RECOMMENDATIONS_FILE = path.join(ANALYTICS_DIR, 'recommendations.yaml');
const TOOL_REGISTRY_FILE = path.resolve(ROOT, '.aios-core', 'data', 'tool-registry.yaml');

// --- Default Thresholds (overridden by tool-registry.yaml) ---
const DEFAULT_THRESHOLDS = {
  promote: { minUsesPerSession: 10, minSessions: 5 },
  demote: { maxUsesPerNSessions: 1, sessionWindow: 5 }
};

// --- Load Thresholds from tool-registry.yaml (AC 15) ---
function loadThresholds() {
  try {
    const raw = fs.readFileSync(TOOL_REGISTRY_FILE, 'utf8');
    const registry = yaml.load(raw);
    if (registry && registry.analytics && registry.analytics.thresholds) {
      const t = registry.analytics.thresholds;
      return {
        promote: {
          minUsesPerSession: t.promote?.minUsesPerSession ?? DEFAULT_THRESHOLDS.promote.minUsesPerSession,
          minSessions: t.promote?.minSessions ?? DEFAULT_THRESHOLDS.promote.minSessions
        },
        demote: {
          maxUsesPerNSessions: t.demote?.maxUsesPerNSessions ?? DEFAULT_THRESHOLDS.demote.maxUsesPerNSessions,
          sessionWindow: t.demote?.sessionWindow ?? DEFAULT_THRESHOLDS.demote.sessionWindow
        }
      };
    }
  } catch {
    // Fall back to defaults
  }
  return DEFAULT_THRESHOLDS;
}

// --- Load Baseline (TOK-1.5) ---
function loadBaseline() {
  try {
    const raw = fs.readFileSync(BASELINE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --- Load Usage Data ---
function loadUsageData() {
  try {
    const raw = fs.readFileSync(USAGE_FILE, 'utf8');
    const data = JSON.parse(raw);
    return data && Array.isArray(data.sessions) ? data : null;
  } catch {
    return null;
  }
}

// --- Load Tool Registry ---
function loadToolRegistry() {
  try {
    const raw = fs.readFileSync(TOOL_REGISTRY_FILE, 'utf8');
    return yaml.load(raw);
  } catch {
    return null;
  }
}

// --- Get tool tier from registry ---
function getToolTier(registry, toolName) {
  if (!registry || !registry.tools) return 'unknown';
  const tool = registry.tools[toolName];
  return tool ? `tier_${tool.tier}` : 'unknown';
}

// --- Aggregate tool usage across sessions ---
function aggregateUsage(sessions) {
  const toolStats = {};
  const sessionCount = sessions.length;

  for (const session of sessions) {
    if (!session.events) continue;
    for (const event of session.events) {
      if (!toolStats[event.tool_name]) {
        toolStats[event.tool_name] = {
          tool_name: event.tool_name,
          total_invocations: 0,
          total_token_cost_input: 0,
          total_token_cost_output: 0,
          sessions_used: 0,
          invocations_per_session: []
        };
      }
      const stat = toolStats[event.tool_name];
      stat.total_invocations += event.invocation_count;
      stat.total_token_cost_input += event.token_cost_input;
      stat.total_token_cost_output += event.token_cost_output;
      stat.sessions_used += 1;
      stat.invocations_per_session.push(event.invocation_count);
    }
  }

  // Calculate averages
  for (const stat of Object.values(toolStats)) {
    stat.avg_invocations_per_session = stat.invocations_per_session.length > 0
      ? stat.invocations_per_session.reduce((a, b) => a + b, 0) / stat.invocations_per_session.length
      : 0;
    stat.avg_tokens_per_session = sessionCount > 0
      ? (stat.total_token_cost_input + stat.total_token_cost_output) / sessionCount
      : 0;
  }

  return { toolStats, sessionCount };
}

// --- Baseline Comparison (ACs 4-6) ---
// Compares two dimensions:
//   1. Static overhead: framework tokens loaded at session start (schemas, rules, agents)
//      Baseline source: frameworkOverhead.totalEstimatedTokens
//      Post-opt source: sum of tool schema tokenCost for tools actually used (from registry)
//   2. Dynamic usage: total invocation token costs per session
//      Baseline source: workflow median totalTokens
//      Post-opt source: actual usage data from collect-tool-usage.js
function compareBaseline(baseline, usageData, registry) {
  if (!baseline || !usageData) {
    return { available: false, reason: 'Baseline or usage data not found' };
  }

  const sessions = usageData.sessions;
  if (sessions.length === 0) {
    return { available: false, reason: 'No sessions to compare' };
  }

  const { toolStats, sessionCount } = aggregateUsage(sessions);

  // --- Static overhead comparison (C1 fix: apples-to-apples) ---
  // Baseline: total framework overhead loaded at session start
  const baselineOverhead = baseline.frameworkOverhead?.totalEstimatedTokens || 0;

  // Post-opt: estimate schema overhead for tools actually used in sessions
  // Uses tokenCost from tool-registry.yaml for tools that appeared in usage data
  let postOptSchemaOverhead = 0;
  if (registry && registry.tools) {
    for (const toolName of Object.keys(toolStats)) {
      const toolDef = registry.tools[toolName];
      if (toolDef && toolDef.tokenCost) {
        postOptSchemaOverhead += toolDef.tokenCost;
      }
    }
  } else {
    // Fallback: estimate from usage data (avg tokens / avg invocations = per-invocation cost)
    postOptSchemaOverhead = Object.values(toolStats).reduce((sum, t) => {
      return sum + (t.avg_invocations_per_session > 0
        ? Math.round((t.total_token_cost_input + t.total_token_cost_output) / t.total_invocations)
        : 0);
    }, 0);
  }

  // --- Dynamic usage comparison ---
  const postOptTokensInput = Object.values(toolStats).reduce((s, t) => s + t.total_token_cost_input, 0);
  const postOptTokensOutput = Object.values(toolStats).reduce((s, t) => s + t.total_token_cost_output, 0);
  const postOptTotal = postOptTokensInput + postOptTokensOutput;
  const avgPostOptPerSession = sessionCount > 0 ? postOptTotal / sessionCount : 0;

  const baselineWorkflows = baseline.workflows || {};

  // Per-workflow comparison (AC 5)
  const workflowComparison = {};
  for (const [wfName, wfData] of Object.entries(baselineWorkflows)) {
    const baselineMedian = wfData.median?.totalTokens || 0;
    const baselineOverheadPct = baseline.comparison?.aiosActual?.overheadPercentOfTypicalSession?.[wfName] || 0;
    const baselineOverheadTokens = Math.round(baselineMedian * baselineOverheadPct / 100);

    workflowComparison[wfName] = {
      baseline_median_total: baselineMedian,
      baseline_overhead_tokens: baselineOverheadTokens,
      baseline_overhead_pct: baselineOverheadPct,
      post_optimization_schema_overhead: postOptSchemaOverhead,
      post_optimization_avg_usage_per_session: Math.round(avgPostOptPerSession),
      sessions_analyzed: sessionCount
    };
  }

  // Total reduction: compares static overhead (schema tokens loaded)
  const absoluteReduction = baselineOverhead - postOptSchemaOverhead;
  const percentageReduction = baselineOverhead > 0
    ? Math.round((absoluteReduction / baselineOverhead) * 1000) / 10
    : 0;

  // Target assessment (AC 6)
  let targetStatus;
  if (percentageReduction >= 25) {
    targetStatus = 'ACHIEVED';
  } else if (percentageReduction >= 15) {
    targetStatus = 'PARTIALLY_ACHIEVED';
  } else {
    targetStatus = 'NOT_ACHIEVED';
  }

  return {
    available: true,
    comparison_methodology: 'Static schema overhead: baseline frameworkOverhead vs post-opt tool schema costs from registry. Dynamic usage tracked separately.',
    baseline_overhead_tokens: baselineOverhead,
    post_optimization_overhead_tokens: postOptSchemaOverhead,
    absolute_reduction_tokens: absoluteReduction,
    percentage_reduction: percentageReduction,
    target_25_45_pct: targetStatus,
    target_description: `25-45% reduction target is ${targetStatus}. Measured: ${percentageReduction}%`,
    dynamic_usage: {
      avg_invocation_tokens_per_session: Math.round(avgPostOptPerSession),
      total_invocation_tokens: postOptTotal,
      sessions_analyzed: sessionCount
    },
    workflow_comparison: workflowComparison,
    per_tool_breakdown: Object.values(toolStats).map(t => ({
      tool_name: t.tool_name,
      total_invocations: t.total_invocations,
      avg_invocations_per_session: Math.round(t.avg_invocations_per_session * 10) / 10,
      total_tokens: t.total_token_cost_input + t.total_token_cost_output,
      avg_tokens_per_session: Math.round(t.avg_tokens_per_session)
    })).sort((a, b) => b.total_tokens - a.total_tokens)
  };
}

// --- Promote/Demote Recommendations (ACs 7-9, 13-14) ---
function generateRecommendations(usageData, registry, thresholds) {
  if (!usageData || usageData.sessions.length === 0) {
    return [];
  }

  const { toolStats, sessionCount } = aggregateUsage(usageData.sessions);
  const recommendations = [];

  for (const [toolName, stat] of Object.entries(toolStats)) {
    const currentTier = getToolTier(registry, toolName);

    // Promote: tool used >10 times per session average across 5+ sessions (AC 7, 13)
    if (
      stat.avg_invocations_per_session > thresholds.promote.minUsesPerSession &&
      stat.sessions_used >= thresholds.promote.minSessions &&
      currentTier !== 'tier_1' // Don't promote if already Tier 1
    ) {
      recommendations.push({
        tool_name: toolName,
        action: 'promote',
        current_tier: currentTier,
        recommended_tier: currentTier === 'tier_3' ? 'tier_2' : 'tier_1',
        evidence: {
          avg_invocations_per_session: Math.round(stat.avg_invocations_per_session * 10) / 10,
          sessions_used: stat.sessions_used,
          total_sessions: sessionCount,
          threshold_invocations: thresholds.promote.minUsesPerSession,
          threshold_sessions: thresholds.promote.minSessions
        },
        rationale: `Tool used ${Math.round(stat.avg_invocations_per_session * 10) / 10} times/session across ${stat.sessions_used} sessions (threshold: >${thresholds.promote.minUsesPerSession}/session, ${thresholds.promote.minSessions}+ sessions)`
      });
    }

    // Demote: tool used <1 time per N sessions (AC 8, 14)
    // C2 fix: precise calculation — sessions_used/sessionCount gives the fraction
    // of sessions where tool appeared. Compare against maxUsesPerNSessions/sessionWindow
    // meaning "less than 1 use per 5 sessions" = usage rate < 1/5 = 0.2
    const usageRate = sessionCount > 0 ? stat.sessions_used / sessionCount : 0;
    const demoteThresholdRate = thresholds.demote.maxUsesPerNSessions / thresholds.demote.sessionWindow;

    if (
      usageRate < demoteThresholdRate &&
      sessionCount >= thresholds.demote.sessionWindow &&
      currentTier !== 'tier_3' // Don't demote if already Tier 3
    ) {
      recommendations.push({
        tool_name: toolName,
        action: 'demote',
        current_tier: currentTier,
        recommended_tier: currentTier === 'tier_1' ? 'tier_2' : 'tier_3',
        evidence: {
          usage_rate: Math.round(usageRate * 1000) / 1000,
          demote_threshold_rate: demoteThresholdRate,
          sessions_used: stat.sessions_used,
          total_sessions: sessionCount,
          threshold_max_uses: thresholds.demote.maxUsesPerNSessions,
          threshold_session_window: thresholds.demote.sessionWindow
        },
        rationale: `Tool used in ${stat.sessions_used}/${sessionCount} sessions (rate: ${Math.round(usageRate * 100)}%). Threshold: <${thresholds.demote.maxUsesPerNSessions} per ${thresholds.demote.sessionWindow} sessions (${Math.round(demoteThresholdRate * 100)}%)`
      });
    }
  }

  // Check for tools in registry that are never used
  if (registry && registry.tools && sessionCount >= thresholds.demote.sessionWindow) {
    for (const [toolName, toolDef] of Object.entries(registry.tools)) {
      if (!toolStats[toolName] && toolDef.tier < 3) {
        recommendations.push({
          tool_name: toolName,
          action: 'demote',
          current_tier: `tier_${toolDef.tier}`,
          recommended_tier: 'tier_3',
          evidence: {
            usage_rate: 0,
            sessions_used: 0,
            total_sessions: sessionCount
          },
          rationale: `Tool never used in ${sessionCount} analyzed sessions. Consider demotion to Tier 3 (deferred).`
        });
      }
    }
  }

  return recommendations;
}

// --- Generate Summary Report (ACs 16-17) ---
function generateReport(comparison, recommendations, usageData, thresholds) {
  const sessions = usageData ? usageData.sessions : [];
  const sessionCount = sessions.length;

  // Measurement period
  let periodStart = null;
  let periodEnd = null;
  if (sessionCount > 0) {
    const timestamps = sessions.map(s => s.timestamp).filter(Boolean).sort();
    periodStart = timestamps[0];
    periodEnd = timestamps[timestamps.length - 1];
  }

  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    story: 'TOK-5',
    epic: 'Token Optimization — Intelligent Tool Loading',
    measurement_period: {
      start: periodStart,
      end: periodEnd,
      sessions_analyzed: sessionCount
    },
    baseline_comparison: comparison,
    total_tokens_saved: comparison.available ? comparison.absolute_reduction_tokens : 0,
    percentage_reduction: comparison.available ? comparison.percentage_reduction : 0,
    target_status: comparison.available ? comparison.target_25_45_pct : 'NO_DATA',
    recommendations_count: recommendations.length,
    promote_count: recommendations.filter(r => r.action === 'promote').length,
    demote_count: recommendations.filter(r => r.action === 'demote').length,
    thresholds_used: thresholds
  };
}

// --- Save Recommendations as YAML (AC 9) ---
function saveRecommendations(recommendations, dryRun) {
  const yamlContent = yaml.dump({
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    story: 'TOK-5',
    recommendations_count: recommendations.length,
    recommendations: recommendations
  }, { lineWidth: 120, noRefs: true });

  if (!dryRun) {
    if (!fs.existsSync(ANALYTICS_DIR)) {
      fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
    }
    fs.writeFileSync(RECOMMENDATIONS_FILE, yamlContent, 'utf8');
  }
  return yamlContent;
}

// --- Save Report as JSON (AC 16) ---
function saveReport(report, dryRun) {
  const content = JSON.stringify(report, null, 2);
  if (!dryRun) {
    if (!fs.existsSync(ANALYTICS_DIR)) {
      fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
    }
    fs.writeFileSync(REPORT_FILE, content, 'utf8');
  }
  return content;
}

// --- Main ---
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose');

  // Load data
  const baseline = loadBaseline();
  const usageData = loadUsageData();
  const registry = loadToolRegistry();
  const thresholds = loadThresholds();

  if (!baseline) {
    console.error('[TOK-5] Error: Baseline not found at', BASELINE_FILE);
    console.error('[TOK-5] Run TOK-1.5 baseline collection first.');
    process.exit(1);
  }

  if (!usageData || usageData.sessions.length === 0) {
    console.error('[TOK-5] Error: No usage data found at', USAGE_FILE);
    console.error('[TOK-5] Run collect-tool-usage.js to collect session data first.');
    process.exit(1);
  }

  // Baseline comparison (ACs 4-6)
  const comparison = compareBaseline(baseline, usageData, registry);

  // Promote/demote recommendations (ACs 7-9, 13-14)
  const recommendations = generateRecommendations(usageData, registry, thresholds);

  // Summary report (ACs 16-17)
  const report = generateReport(comparison, recommendations, usageData, thresholds);

  // Save outputs
  saveReport(report, dryRun);
  saveRecommendations(recommendations, dryRun);

  // Console output
  if (jsonOutput) {
    console.log(JSON.stringify({ report, recommendations }, null, 2));
  } else {
    console.log('=== TOK-5 Optimization Report ===');
    console.log(`Sessions analyzed: ${report.measurement_period.sessions_analyzed}`);
    console.log(`Period: ${report.measurement_period.start || 'N/A'} → ${report.measurement_period.end || 'N/A'}`);
    console.log('');

    if (comparison.available) {
      console.log('--- Baseline Comparison ---');
      console.log(`Baseline overhead: ${comparison.baseline_overhead_tokens} tokens`);
      console.log(`Post-optimization: ${comparison.post_optimization_overhead_tokens} tokens`);
      console.log(`Reduction: ${comparison.absolute_reduction_tokens} tokens (${comparison.percentage_reduction}%)`);
      console.log(`Target (25-45%): ${comparison.target_25_45_pct}`);
    } else {
      console.log(`Baseline comparison: ${comparison.reason}`);
    }

    console.log('');
    console.log('--- Recommendations ---');
    console.log(`Total: ${recommendations.length} (${report.promote_count} promote, ${report.demote_count} demote)`);

    if (verbose && recommendations.length > 0) {
      for (const rec of recommendations) {
        console.log(`  ${rec.action.toUpperCase()}: ${rec.tool_name} (${rec.current_tier} → ${rec.recommended_tier})`);
        console.log(`    Rationale: ${rec.rationale}`);
      }
    }

    console.log('');
    if (dryRun) {
      console.log('[TOK-5] Dry run — no files written.');
    } else {
      console.log(`[TOK-5] Report: ${REPORT_FILE}`);
      console.log(`[TOK-5] Recommendations: ${RECOMMENDATIONS_FILE}`);
    }
  }
}

// Run main only when executed directly (not when required as module)
if (require.main === module) {
  main();
}

// --- Exports for testing ---
module.exports = {
  loadThresholds,
  compareBaseline,
  generateRecommendations,
  generateReport,
  aggregateUsage,
  DEFAULT_THRESHOLDS
};
