/**
 * Report Formatter — Generates structured markdown diagnostic report.
 *
 * Takes collector results and produces a human-readable report
 * with sections for each diagnostic area.
 *
 * @module core/synapse/diagnostics/report-formatter
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

/**
 * Format a complete diagnostic report from collector results.
 *
 * @param {object} data - Collected diagnostic data
 * @param {object} data.hook - Hook collector results
 * @param {object} data.session - Session collector results
 * @param {object} data.manifest - Manifest collector results
 * @param {object} data.pipeline - Pipeline collector results
 * @param {object} data.uap - UAP collector results
 * @returns {string} Formatted markdown report
 */
function formatReport(data) {
  if (!data || typeof data !== 'object') {
    return '# SYNAPSE Diagnostic Report\n**Error:** No diagnostic data provided.\n';
  }

  const lines = [];
  const timestamp = new Date().toISOString();

  // Header
  lines.push('# SYNAPSE Diagnostic Report');
  lines.push(`**Timestamp:** ${timestamp}`);

  if (data.pipeline) {
    const bracket = data.pipeline.bracket || 'UNKNOWN';
    const contextPercent = typeof data.pipeline.contextPercent === 'number'
      ? data.pipeline.contextPercent.toFixed(1)
      : '?';
    lines.push(`**Bracket:** ${bracket} (${contextPercent}% context remaining)`);
  }

  const agentId = _extractAgentId(data);
  if (agentId) {
    const quality = data.session?.raw?.bridgeData?.activation_quality || 'unknown';
    lines.push(`**Agent:** @${agentId} (activation_quality: ${quality})`);
  }

  lines.push('');

  // Section 1: Hook Status
  lines.push('## 1. Hook Status');
  if (data.hook && data.hook.checks) {
    lines.push('| Check | Status | Detail |');
    lines.push('|-------|--------|--------|');
    for (const check of data.hook.checks) {
      lines.push(`| ${check.name} | ${check.status} | ${check.detail} |`);
    }
  } else {
    lines.push('*No hook data collected*');
  }
  lines.push('');

  // Section 2: Session Status
  lines.push('## 2. Session Status');
  if (data.session && data.session.fields) {
    lines.push('| Field | Expected | Actual | Status |');
    lines.push('|-------|----------|--------|--------|');
    for (const field of data.session.fields) {
      lines.push(`| ${field.field} | ${field.expected} | ${field.actual} | ${field.status} |`);
    }
  } else {
    lines.push('*No session data collected*');
  }
  lines.push('');

  // Section 3: Manifest Integrity
  lines.push('## 3. Manifest Integrity');
  if (data.manifest && data.manifest.entries) {
    lines.push('| Domain | In Manifest | File Exists | Status |');
    lines.push('|--------|-------------|-------------|--------|');
    for (const entry of data.manifest.entries) {
      lines.push(`| ${entry.domain} | ${entry.inManifest} | ${entry.fileExists ? 'yes' : 'no'} | ${entry.status} |`);
    }

    if (data.manifest.orphanedFiles && data.manifest.orphanedFiles.length > 0) {
      lines.push('');
      lines.push(`**Orphaned files** (in .synapse/ but not in manifest): ${data.manifest.orphanedFiles.join(', ')}`);
    }
  } else {
    lines.push('*No manifest data collected*');
  }
  lines.push('');

  // Section 4: Pipeline Simulation
  lines.push(`## 4. Pipeline Simulation (${data.pipeline?.bracket || 'UNKNOWN'} bracket)`);
  if (data.pipeline && data.pipeline.layers) {
    lines.push('| Layer | Expected | Status |');
    lines.push('|-------|----------|--------|');
    for (const layer of data.pipeline.layers) {
      lines.push(`| ${layer.layer} | ${layer.expected} | ${layer.status} |`);
    }
  } else {
    lines.push('*No pipeline data collected*');
  }
  lines.push('');

  // Section 5: UAP Bridge
  lines.push('## 5. UAP Bridge');
  if (data.uap && data.uap.checks) {
    lines.push('| Check | Status | Detail |');
    lines.push('|-------|--------|--------|');
    for (const check of data.uap.checks) {
      lines.push(`| ${check.name} | ${check.status} | ${check.detail} |`);
    }
  } else {
    lines.push('*No UAP bridge data collected*');
  }
  lines.push('');

  // Section 6: Memory Bridge
  lines.push('## 6. Memory Bridge');
  lines.push('| Check | Status | Detail |');
  lines.push('|-------|--------|--------|');

  // Memory bridge is Pro-only, so always report current state
  lines.push('| Pro available | INFO | Check `pro/` submodule |');
  lines.push(`| Bracket requires hints | ${_bracketNeedsMemory(data.pipeline?.bracket) ? 'YES' : 'NO'} | ${data.pipeline?.bracket || 'UNKNOWN'} bracket |`);
  lines.push('');

  // Section 7: Gaps & Recommendations
  lines.push('## 7. Gaps & Recommendations');
  const gaps = _collectGaps(data);

  if (gaps.length === 0) {
    lines.push('| # | Severity | Gap | Recommendation |');
    lines.push('|---|----------|-----|----------------|');
    lines.push('| - | - | None found | Pipeline operating correctly |');
  } else {
    lines.push('| # | Severity | Gap | Recommendation |');
    lines.push('|---|----------|-----|----------------|');
    for (let i = 0; i < gaps.length; i++) {
      lines.push(`| ${i + 1} | ${gaps[i].severity} | ${gaps[i].gap} | ${gaps[i].recommendation} |`);
    }
  }
  lines.push('');

  // Section 8: Timing Analysis (SYN-14)
  _formatTimingSection(lines, data.timing);

  // Section 9: Context Quality Analysis (SYN-14)
  _formatQualitySection(lines, data.quality);

  // Section 10: Consistency Checks (SYN-14)
  _formatConsistencySection(lines, data.consistency);

  // Section 11: Output Quality (SYN-14)
  _formatOutputSection(lines, data.outputAnalysis);

  // Section 12: Relevance Matrix (SYN-14)
  _formatRelevanceSection(lines, data.relevance);

  return lines.join('\n');
}

/**
 * Extract agent ID from collected data.
 * @param {object} data
 * @returns {string|null}
 */
function _extractAgentId(data) {
  if (data.session?.raw?.bridgeData?.id) return data.session.raw.bridgeData.id;
  if (data.session?.raw?.session?.active_agent?.id) return data.session.raw.session.active_agent.id;
  return null;
}

/**
 * Check if a bracket requires memory hints.
 * @param {string} bracket
 * @returns {boolean}
 */
function _bracketNeedsMemory(bracket) {
  return bracket === 'DEPLETED' || bracket === 'CRITICAL';
}

/**
 * Collect gaps from all collector results.
 * @param {object} data
 * @returns {Array<{ severity: string, gap: string, recommendation: string }>}
 */
function _collectGaps(data) {
  const gaps = [];

  // Check hook failures
  const hookChecks = data.hook?.checks || [];
  for (const check of hookChecks) {
    if (check.status === 'FAIL') {
      gaps.push({
        severity: 'HIGH',
        gap: `Hook: ${check.name} — ${check.detail}`,
        recommendation: 'Run `npx aios-core install` to reinstall hooks',
      });
    }
  }

  // Check session issues
  const sessionFields = data.session?.fields || [];
  for (const field of sessionFields) {
    if (field.status === 'FAIL') {
      gaps.push({
        severity: 'HIGH',
        gap: `Session: ${field.field} — ${field.actual}`,
        recommendation: 'Activate an agent with @agent to create session',
      });
    }
  }

  // Check manifest failures
  const manifestEntries = data.manifest?.entries || [];
  for (const entry of manifestEntries) {
    if (entry.status === 'FAIL') {
      gaps.push({
        severity: 'MEDIUM',
        gap: `Manifest: domain "${entry.domain}" file missing`,
        recommendation: `Create .synapse/${entry.domain} domain file`,
      });
    }
  }

  // Check UAP bridge failures
  const uapChecks = data.uap?.checks || [];
  for (const check of uapChecks) {
    if (check.status === 'FAIL') {
      gaps.push({
        severity: 'HIGH',
        gap: `UAP Bridge: ${check.name} — ${check.detail}`,
        recommendation: 'Activate an agent to trigger UAP bridge write',
      });
    }
  }

  // SYN-14 fix: Include gaps from new collectors (consistency, quality, relevance)

  // Consistency check failures
  const consistencyChecks = data.consistency?.checks || [];
  for (const check of consistencyChecks) {
    if (check.status === 'FAIL') {
      gaps.push({
        severity: 'MEDIUM',
        gap: `Consistency: ${check.name} — ${check.detail}`,
        recommendation: 'Re-activate agent to refresh metrics alignment',
      });
    }
  }

  // Quality grade below threshold
  if (data.quality?.overall?.grade === 'F') {
    gaps.push({
      severity: 'HIGH',
      gap: `Context quality: ${data.quality.overall.score}/100 (${data.quality.overall.grade})`,
      recommendation: 'Re-activate agent to refresh UAP metrics',
    });
  }

  // Relevance critical gaps
  const relevanceGaps = data.relevance?.gaps || [];
  for (const g of relevanceGaps) {
    if (g.importance === 'critical') {
      gaps.push({
        severity: 'HIGH',
        gap: `Relevance: ${g.component} (${g.importance}) missing`,
        recommendation: 'Ensure critical context component is available for active agent',
      });
    }
  }

  // Sort by severity (HIGH first)
  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  gaps.sort((a, b) => {
    const orderA = severityOrder[a.severity] !== undefined ? severityOrder[a.severity] : 3;
    const orderB = severityOrder[b.severity] !== undefined ? severityOrder[b.severity] : 3;
    return orderA - orderB;
  });

  return gaps;
}

/**
 * Section 8: Timing Analysis.
 * @param {string[]} lines
 * @param {object} timing
 */
function _formatTimingSection(lines, timing) {
  lines.push('## 8. Timing Analysis');
  if (!timing || timing.error) {
    lines.push('*No timing data available*');
    lines.push('');
    return;
  }

  // UAP Timing
  if (timing.uap && timing.uap.available) {
    const staleTag = timing.uap.stale ? ' **[STALE]**' : '';
    lines.push(`### UAP Activation Pipeline (${timing.uap.totalDuration}ms total, quality: ${timing.uap.quality})${staleTag}`);
    lines.push('| Loader | Duration | Status | Tier |');
    lines.push('|--------|----------|--------|------|');
    for (const loader of timing.uap.loaders) {
      lines.push(`| ${loader.name} | ${loader.duration}ms | ${loader.status} | ${loader.tier} |`);
    }
    lines.push(`| **Total** | **${timing.uap.totalDuration}ms** | | |`);
  } else {
    lines.push('### UAP Activation Pipeline');
    lines.push('*No UAP timing data — activate an agent first*');
  }
  lines.push('');

  // Hook Timing
  if (timing.hook && timing.hook.available) {
    const staleTag = timing.hook.stale ? ' **[STALE]**' : '';
    const bootInfo = timing.hook.hookBootMs ? ` boot: ${Math.round(timing.hook.hookBootMs)}ms,` : '';
    lines.push(`### SYNAPSE Hook Pipeline (${timing.hook.totalDuration}ms total,${bootInfo} ${timing.hook.bracket} bracket)${staleTag}`);
    lines.push('| Layer | Duration | Status | Rules |');
    lines.push('|-------|----------|--------|-------|');
    for (const layer of timing.hook.layers) {
      lines.push(`| ${layer.name} | ${layer.duration}ms | ${layer.status} | ${layer.rules} |`);
    }
    const totalRules = timing.hook.layers.reduce((sum, l) => sum + (l.rules || 0), 0);
    lines.push(`| **Total** | **${timing.hook.totalDuration}ms** | | **${totalRules}** |`);
  } else {
    lines.push('### SYNAPSE Hook Pipeline');
    lines.push('*No Hook timing data — send a prompt first*');
  }
  lines.push('');

  // Combined
  lines.push(`**Combined pipeline time:** ${timing.combined ? timing.combined.totalMs : 0}ms`);
  lines.push('');
}

/**
 * Section 9: Context Quality Analysis.
 * @param {string[]} lines
 * @param {object} quality
 */
function _formatQualitySection(lines, quality) {
  lines.push('## 9. Context Quality Analysis');
  if (!quality || quality.error) {
    lines.push('*No quality data available*');
    lines.push('');
    return;
  }

  const overall = quality.overall || { score: 0, grade: 'F', label: 'UNKNOWN' };
  lines.push(`**Overall: ${overall.score}/100 (${overall.grade} — ${overall.label})**`);

  const uapScore = quality.uap ? quality.uap.score : 0;
  const hookScore = quality.hook ? quality.hook.score : 0;
  const uapStale = quality.uap && quality.uap.stale ? ' [STALE]' : '';
  const hookStale = quality.hook && quality.hook.stale ? ' [STALE]' : '';
  lines.push(`UAP: ${uapScore}/100${uapStale} | Hook: ${hookScore}/100${hookStale}`);
  lines.push('');

  // UAP Loaders
  if (quality.uap && quality.uap.loaders && quality.uap.loaders.length > 0) {
    lines.push('### UAP Loaders');
    lines.push('| Loader | Score | Criticality | Impact |');
    lines.push('|--------|-------|-------------|--------|');
    for (const loader of quality.uap.loaders) {
      lines.push(`| ${loader.name} | ${loader.score}/${loader.maxScore} | ${loader.criticality} | ${loader.impact} |`);
    }
    lines.push('');
  }

  // Hook Layers
  if (quality.hook && quality.hook.layers && quality.hook.layers.length > 0) {
    lines.push('### Hook Layers');
    lines.push('| Layer | Score | Criticality | Rules | Impact |');
    lines.push('|-------|-------|-------------|-------|--------|');
    for (const layer of quality.hook.layers) {
      lines.push(`| ${layer.name} | ${layer.score}/${layer.maxScore} | ${layer.criticality} | ${layer.rules || '-'} | ${layer.impact} |`);
    }
    lines.push('');
  }
}

/**
 * Section 10: Consistency Checks.
 * @param {string[]} lines
 * @param {object} consistency
 */
function _formatConsistencySection(lines, consistency) {
  lines.push('## 10. Consistency Checks');
  if (!consistency || consistency.error || !consistency.available) {
    lines.push('*No consistency data available*');
    lines.push('');
    return;
  }

  lines.push(`**Score:** ${consistency.score}/${consistency.maxScore}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('|-------|--------|--------|');
  for (const check of consistency.checks) {
    lines.push(`| ${check.name} | ${check.status} | ${check.detail} |`);
  }
  lines.push('');
}

/**
 * Section 11: Output Quality.
 * @param {string[]} lines
 * @param {object} outputAnalysis
 */
function _formatOutputSection(lines, outputAnalysis) {
  lines.push('## 11. Output Quality');
  if (!outputAnalysis || outputAnalysis.error || !outputAnalysis.available) {
    lines.push('*No output analysis data available*');
    lines.push('');
    return;
  }

  const s = outputAnalysis.summary;
  lines.push(`**UAP:** ${s.uapHealthy}/${s.uapTotal} healthy | **Hook:** ${s.hookHealthy}/${s.hookTotal} healthy`);
  lines.push('');

  if (outputAnalysis.uapAnalysis && outputAnalysis.uapAnalysis.length > 0) {
    lines.push('### UAP Loaders');
    lines.push('| Loader | Status | Quality | Detail |');
    lines.push('|--------|--------|---------|--------|');
    for (const a of outputAnalysis.uapAnalysis) {
      lines.push(`| ${a.name} | ${a.status} | ${a.quality} | ${a.detail} |`);
    }
    lines.push('');
  }

  if (outputAnalysis.hookAnalysis && outputAnalysis.hookAnalysis.length > 0) {
    lines.push('### Hook Layers');
    lines.push('| Layer | Status | Rules | Quality | Detail |');
    lines.push('|-------|--------|-------|---------|--------|');
    for (const a of outputAnalysis.hookAnalysis) {
      lines.push(`| ${a.name} | ${a.status} | ${a.rules} | ${a.quality} | ${a.detail} |`);
    }
    lines.push('');
  }
}

/**
 * Section 12: Relevance Matrix.
 * @param {string[]} lines
 * @param {object} relevance
 */
function _formatRelevanceSection(lines, relevance) {
  lines.push('## 12. Relevance Matrix');
  if (!relevance || relevance.error || !relevance.available) {
    lines.push('*No relevance data available*');
    lines.push('');
    return;
  }

  lines.push(`**Agent:** @${relevance.agentId} | **Relevance Score:** ${relevance.score}/100`);
  lines.push('');

  if (relevance.matrix && relevance.matrix.length > 0) {
    lines.push('| Component | Importance | Status | Gap |');
    lines.push('|-----------|------------|--------|-----|');
    for (const item of relevance.matrix) {
      const gapFlag = item.gap ? 'YES' : '-';
      lines.push(`| ${item.component} | ${item.importance} | ${item.status} | ${gapFlag} |`);
    }
    lines.push('');
  }

  if (relevance.gaps && relevance.gaps.length > 0) {
    lines.push('### Critical Gaps');
    for (const gap of relevance.gaps) {
      lines.push(`- **${gap.component}** (${gap.importance}): missing or failed`);
    }
    lines.push('');
  }
}

module.exports = { formatReport };
