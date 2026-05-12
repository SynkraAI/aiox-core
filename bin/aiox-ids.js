#!/usr/bin/env node

/**
 * AIOX IDS CLI — Incremental Development System
 * Standalone (no external dependencies for npx compatibility)
 *
 * Commands:
 *   aiox ids:query {intent}     — Query registry for matching artifacts
 *   aiox ids:create-review      — Review CREATE decisions for promotion/deprecation
 *   aiox ids:health             — Run registry health check (self-healing)
 *   aiox ids:check {intent}     — Pre-check registry (FrameworkGovernor advisory)
 *   aiox ids:impact {entity-id} — Impact analysis for modifications
 *   aiox ids:stats              — Registry statistics
 *   aiox ids:register {path}    — Register entity after creation
 *
 * Flags:
 *   --json                      — Machine-readable JSON output
 *   --type {type}               — Filter by entity type
 *   --category {category}       — Filter by category
 *   --fix                       — Auto-heal fixable issues (ids:health)
 *
 * Stories: IDS-2 (Decision Engine), IDS-4a (Self-Healing), IDS-7 (Framework Governor)
 */

'use strict';

const path = require('path');
const { RegistryLoader } = require(path.resolve(__dirname, '..', '.aiox-core', 'core', 'ids', 'registry-loader'));
const { IncrementalDecisionEngine } = require(path.resolve(__dirname, '..', '.aiox-core', 'core', 'ids', 'incremental-decision-engine'));
const { RegistryUpdater } = require(path.resolve(__dirname, '..', '.aiox-core', 'core', 'ids', 'registry-updater'));
const { FrameworkGovernor } = require(path.resolve(__dirname, '..', '.aiox-core', 'core', 'ids', 'framework-governor'));

// Optional: RegistryHealer (IDS-4a — may not exist yet)
let RegistryHealer = null;
try {
  RegistryHealer = require(path.resolve(__dirname, '..', '.aiox-core', 'core', 'ids', 'registry-healer')).RegistryHealer;
} catch (_err) {
  // RegistryHealer not available — health commands degrade gracefully
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const flags = args.filter((a) => a.startsWith('--'));
const jsonOutput = flags.includes('--json');
const fixFlag = flags.includes('--fix');

function showHelp() {
  console.log(`
AIOX IDS — Incremental Development System

Commands:
  ids:query {intent}       Query registry for matching artifacts
  ids:create-review        Review CREATE decisions (30-day review)
  ids:health               Run registry health check (self-healing)
  ids:check {intent}       Pre-check registry (advisory REUSE/ADAPT/CREATE)
  ids:impact {entity-id}   Impact analysis for entity modifications
  ids:stats                Registry statistics (entity counts, health score)
  ids:register {path}      Register entity after creation

Flags:
  --json                   Output as JSON
  --type {type}            Filter by entity type (task, script, agent, etc.)
  --category {category}    Filter by category
  --fix                    Auto-heal fixable issues (ids:health only)

Examples:
  aiox ids:query "validate story drafts"
  aiox ids:query "template rendering engine" --json
  aiox ids:query "database migration" --type script
  aiox ids:create-review
  aiox ids:create-review --json
  aiox ids:health
  aiox ids:health --fix
  aiox ids:check "validate yaml schema" --type task
  aiox ids:impact create-doc
  aiox ids:stats
  aiox ids:stats --json
  aiox ids:register .aiox-core/development/tasks/my-new-task.md
`);
}

function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

/**
 * Collect positional args (skipping flags and their values).
 */
function collectPositionalArgs(startIdx) {
  const flagNames = new Set(['--json', '--type', '--category', '--fix']);
  const parts = [];
  let skipNext = false;
  for (let i = startIdx; i < args.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (args[i] === '--type' || args[i] === '--category') {
      skipNext = true;
      continue;
    }
    if (flagNames.has(args[i])) {
      continue;
    }
    parts.push(args[i]);
  }
  return parts.join(' ').trim();
}

function formatRecommendation(rec, index) {
  const lines = [];
  const icon = rec.decision === 'REUSE' ? '\u2705' : rec.decision === 'ADAPT' ? '\u{1F504}' : '\u2728';
  lines.push(`  ${index + 1}. ${icon} ${rec.decision} (${rec.confidence}) — ${rec.entityId}`);
  lines.push(`     Path: ${rec.entityPath}`);
  lines.push(`     Type: ${rec.entityType} | Relevance: ${(rec.relevanceScore * 100).toFixed(1)}%`);
  lines.push(`     ${rec.rationale}`);
  if (rec.adaptationImpact) {
    lines.push(`     Impact: ${rec.adaptationImpact.directCount} direct, ${rec.adaptationImpact.indirectCount} indirect consumers`);
  }
  return lines.join('\n');
}

function formatCreateReviewEntry(entry) {
  const statusIcon = {
    'promotion-candidate': '\u{1F31F}',
    'monitoring': '\u{1F50D}',
    'deprecation-review': '\u26A0\uFE0F',
  };
  const icon = statusIcon[entry.status] || '\u2753';
  return `  ${icon} ${entry.entityId} — reused ${entry.reusageCount}x — status: ${entry.status}`;
}

// ─── Helper: create a FrameworkGovernor instance ─────────────────────────────

function createGovernor() {
  const loader = new RegistryLoader();
  try {
    loader.load();
  } catch (err) {
    console.error(`Error: Failed to load registry — ${err.message}`);
    process.exit(1);
  }

  const engine = new IncrementalDecisionEngine(loader);
  const updater = new RegistryUpdater();
  const healer = RegistryHealer ? new RegistryHealer() : null;
  return new FrameworkGovernor(loader, engine, updater, healer);
}

// ─── Command: ids:query ──────────────────────────────────────────────────────

function runQuery() {
  const intent = collectPositionalArgs(1);

  if (!intent) {
    console.error('Error: Intent is required. Usage: aiox ids:query "your intent here"');
    process.exit(1);
  }

  const loader = new RegistryLoader();
  try {
    loader.load();
  } catch (err) {
    console.error(`Error: Failed to load registry — ${err.message}`);
    process.exit(1);
  }

  const engine = new IncrementalDecisionEngine(loader);
  const context = {};
  const typeFilter = getFlag('type');
  const categoryFilter = getFlag('category');
  if (typeFilter) context.type = typeFilter;
  if (categoryFilter) context.category = categoryFilter;

  const result = engine.analyze(intent, context);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Formatted output
  console.log(`\nIDS Analysis: "${intent}"`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Registry: ${result.summary.totalEntities} entities | Matches: ${result.summary.matchesFound}`);
  console.log(`Decision: ${result.summary.decision} (${result.summary.confidence} confidence)`);

  if (result.warnings && result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.log(`\u26A0\uFE0F  ${w}`);
    }
  }

  console.log(`\nRationale: ${result.rationale}`);

  if (result.recommendations.length > 0) {
    console.log('\nRecommendations:');
    for (let i = 0; i < result.recommendations.length; i++) {
      console.log(formatRecommendation(result.recommendations[i], i));
    }
  }

  if (result.justification) {
    console.log('\nCREATE Justification:');
    console.log(`  Evaluated: ${result.justification.evaluated_patterns.join(', ') || 'none'}`);
    if (Object.keys(result.justification.rejection_reasons).length > 0) {
      console.log('  Rejections:');
      for (const [id, reason] of Object.entries(result.justification.rejection_reasons)) {
        console.log(`    - ${id}: ${reason}`);
      }
    }
    console.log(`  New capability: ${result.justification.new_capability}`);
    console.log(`  Review scheduled: ${result.justification.review_scheduled}`);
  }

  console.log('');
}

// ─── Command: ids:create-review ──────────────────────────────────────────────

function runCreateReview() {
  const loader = new RegistryLoader();
  try {
    loader.load();
  } catch (err) {
    console.error(`Error: Failed to load registry — ${err.message}`);
    process.exit(1);
  }

  const engine = new IncrementalDecisionEngine(loader);
  const report = engine.reviewCreateDecisions();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('\nIDS CREATE Decision Review');
  console.log(`${'─'.repeat(60)}`);
  console.log(`Total entities with CREATE justification: ${report.totalReviewed}`);

  if (report.totalReviewed === 0) {
    console.log('\nNo entities with CREATE justification metadata found.');
    console.log('CREATE justifications are stored when new entities are registered via IDS.');
    console.log('');
    return;
  }

  if (report.pendingReview.length > 0) {
    console.log(`\nPending Review (${report.pendingReview.length}):`);
    for (const entry of report.pendingReview) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  if (report.promotionCandidates.length > 0) {
    console.log(`\nPromotion Candidates (${report.promotionCandidates.length}):`);
    for (const entry of report.promotionCandidates) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  if (report.deprecationReview.length > 0) {
    console.log(`\nDeprecation Review (${report.deprecationReview.length}):`);
    for (const entry of report.deprecationReview) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  if (report.monitoring.length > 0) {
    console.log(`\nMonitoring (${report.monitoring.length}):`);
    for (const entry of report.monitoring) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  console.log('');
}

// ─── Command: ids:health ─────────────────────────────────────────────────────

function runHealth() {
  if (!RegistryHealer) {
    // Degrade gracefully — use FrameworkGovernor.healthCheck() instead
    const governor = createGovernor();
    governor.healthCheck().then((result) => {
      if (jsonOutput) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('\nIDS Registry Health Check');
        console.log(`${'─'.repeat(60)}`);
        console.log(`Healer Status: ${result.healerStatus}`);
        console.log(`Message: ${result.message}`);
        if (result.basicStats) {
          console.log(`Entity Count: ${result.basicStats.entityCount}`);
        }
      }
    });
    return;
  }

  const healer = new RegistryHealer();
  const healthResult = healer.runHealthCheck();

  if (fixFlag && healthResult.issues.length > 0) {
    const healResult = healer.heal(healthResult.issues, { autoOnly: true });

    if (jsonOutput) {
      console.log(JSON.stringify({ health: healthResult, healing: healResult }, null, 2));
    } else {
      formatHealthReport(healthResult);
      console.log('');
      formatHealingReport(healResult);
    }

    // Emit warnings for non-auto-healable issues
    const manualIssues = healthResult.issues.filter((i) => !i.autoHealable);
    if (manualIssues.length > 0) {
      healer.emitWarnings(manualIssues).catch(() => {});
    }

    // Exit code 1 if critical issues remain unhealed
    const unresolvedCritical = healResult.skipped.filter((i) => i.severity === 'critical');
    if (unresolvedCritical.length > 0) {
      process.exit(1);
    }
    return;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(healthResult, null, 2));
  } else {
    formatHealthReport(healthResult);
  }

  // Exit code 1 if critical issues found
  if (healthResult.summary.bySeverity.critical > 0) {
    process.exit(1);
  }
}

function formatHealthReport(result) {
  const { summary } = result;
  console.log('\nIDS Registry Health Check');
  console.log(`${'─'.repeat(60)}`);
  console.log(`Timestamp: ${result.timestamp}`);
  console.log(`Total Issues: ${summary.total}`);
  console.log(`  Critical: ${summary.bySeverity.critical}`);
  console.log(`  High:     ${summary.bySeverity.high}`);
  console.log(`  Medium:   ${summary.bySeverity.medium}`);
  console.log(`  Low:      ${summary.bySeverity.low}`);
  console.log(`Auto-healable: ${summary.autoHealable} (${summary.autoHealableRate}%)`);
  console.log(`Needs manual:  ${summary.needsManual}`);

  if (result.issues.length === 0) {
    console.log('\nRegistry is healthy. No issues detected.');
    return;
  }

  console.log('\nIssues:');
  for (const issue of result.issues) {
    const severityIcon = {
      critical: '\u274C',
      high: '\u26A0\uFE0F',
      medium: '\u{1F7E1}',
      low: '\u{1F535}',
    };
    const icon = severityIcon[issue.severity] || '\u2753';
    const healable = issue.autoHealable ? ' [auto-fixable]' : ' [manual]';
    console.log(`  ${icon} ${issue.severity.toUpperCase()} ${issue.ruleId}: ${issue.entityId}${healable}`);
    console.log(`     ${issue.description}`);
  }

  if (summary.autoHealable > 0) {
    console.log(`\nRun with --fix to auto-heal ${summary.autoHealable} fixable issue(s).`);
  }
}

function formatHealingReport(result) {
  console.log('IDS Self-Healing Report');
  console.log(`${'─'.repeat(60)}`);
  console.log(`Batch ID: ${result.batchId}`);
  console.log(`Healed: ${result.healed.length}`);
  console.log(`Skipped: ${result.skipped.length}`);
  console.log(`Errors: ${result.errors.length}`);

  if (result.backupPath) {
    console.log(`Backup: ${result.backupPath}`);
  }

  if (result.healed.length > 0) {
    console.log('\nHealed:');
    for (const item of result.healed) {
      console.log(`  \u2705 ${item.ruleId}: ${item.entityId}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log('\nSkipped (manual intervention required):');
    for (const item of result.skipped) {
      console.log(`  \u23ED ${item.ruleId}: ${item.entityId} — ${item.reason}`);
    }
  }

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const item of result.errors) {
      console.log(`  \u274C ${item.ruleId || 'unknown'}: ${item.entityId || 'batch'} — ${item.error}`);
    }
  }
}

// ─── Command: ids:check (IDS-7) ─────────────────────────────────────────────

async function runCheck() {
  const intent = collectPositionalArgs(1);

  if (!intent) {
    console.error('Error: Intent is required. Usage: aiox ids:check "your intent here"');
    process.exit(1);
  }

  const typeFilter = getFlag('type');
  const governor = createGovernor();
  const result = await governor.preCheck(intent, typeFilter);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(FrameworkGovernor.formatPreCheckOutput(result));
}

// ─── Command: ids:impact (IDS-7) ────────────────────────────────────────────

async function runImpact() {
  const entityId = collectPositionalArgs(1);

  if (!entityId) {
    console.error('Error: Entity ID is required. Usage: aiox ids:impact {entity-id}');
    process.exit(1);
  }

  const governor = createGovernor();
  const result = await governor.impactAnalysis(entityId);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(FrameworkGovernor.formatImpactOutput(result));
}

// ─── Command: ids:stats (IDS-7) ─────────────────────────────────────────────

async function runStats() {
  const governor = createGovernor();
  const result = await governor.getStats();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(FrameworkGovernor.formatStatsOutput(result));
}

// ─── Command: ids:register (IDS-7) ──────────────────────────────────────────

async function runRegister() {
  const filePath = collectPositionalArgs(1);

  if (!filePath) {
    console.error('Error: File path is required. Usage: aiox ids:register {file-path}');
    process.exit(1);
  }

  const typeFilter = getFlag('type');
  const governor = createGovernor();
  const result = await governor.postRegister(filePath, {
    type: typeFilter || 'unknown',
    agent: 'cli',
  });

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.registered) {
    console.log(`\nRegistered: ${filePath}`);
    console.log(`Updated: ${result.updated} entities`);
  } else {
    console.log(`\nRegistration failed for: ${filePath}`);
    if (result.errors.length > 0) {
      for (const err of result.errors) {
        console.log(`  Error: ${err}`);
      }
    }
  }
  console.log('');
}

// ─── Main dispatch ──────────────────────────────────────────────────────────

switch (command) {
  case 'ids:query':
  case 'query':
    runQuery();
    break;

  case 'ids:create-review':
  case 'create-review':
    runCreateReview();
    break;

  case 'ids:health':
  case 'health':
    runHealth();
    break;

  case 'ids:check':
  case 'check':
    runCheck();
    break;

  case 'ids:impact':
  case 'impact':
    runImpact();
    break;

  case 'ids:stats':
  case 'stats':
    runStats();
    break;

  case 'ids:register':
  case 'register':
    runRegister();
    break;

  case '--help':
  case '-h':
  case 'help':
  case undefined:
    showHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
