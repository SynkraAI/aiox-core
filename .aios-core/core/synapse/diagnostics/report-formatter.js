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

  // Sort by severity (HIGH first)
  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  gaps.sort((a, b) => {
    const orderA = severityOrder[a.severity] !== undefined ? severityOrder[a.severity] : 3;
    const orderB = severityOrder[b.severity] !== undefined ? severityOrder[b.severity] : 3;
    return orderA - orderB;
  });

  return gaps;
}

module.exports = { formatReport };
