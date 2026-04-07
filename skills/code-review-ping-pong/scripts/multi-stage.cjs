#!/usr/bin/env node
'use strict';

/**
 * Code Review Ping-Pong — Multi-Stage Orchestration Script
 *
 * Operational commands for managing multi-stage code reviews.
 * Copy this to .code-review-ping-pong/multi-stage.cjs alongside validate.cjs.
 *
 * Usage:
 *   node multi-stage.cjs init              — Generate session.md from active stage
 *   node multi-stage.cjs activate <id>     — Set a stage to active (deactivate current)
 *   node multi-stage.cjs archive           — Archive the active stage (must be PERFECT)
 *   node multi-stage.cjs progress          — Regenerate progress.yml from current state
 *   node multi-stage.cjs status            — Print current multi-stage status
 */

const fs = require('fs');
const path = require('path');

// --- Resolve base directory ---

const BASE = (function findBase() {
  // If run from .code-review-ping-pong/, use cwd
  if (path.basename(process.cwd()) === '.code-review-ping-pong') return process.cwd();
  // Otherwise look for .code-review-ping-pong/ in cwd
  const sub = path.join(process.cwd(), '.code-review-ping-pong');
  if (fs.existsSync(sub)) return sub;
  // Fallback: assume script is inside .code-review-ping-pong/
  return path.dirname(__filename);
})();

const STAGES_PATH = path.join(BASE, 'stages.yml');
const PROGRESS_PATH = path.join(BASE, 'progress.yml');
const SESSION_PATH = path.join(BASE, 'session.md');
const NEXTSTEP_PATH = path.join(BASE, 'next-step.md');

// --- Minimal YAML parser (reused from validate.cjs subset) ---

function cleanVal(v) {
  return (v || '').replace(/^["']|["']$/g, '').trim();
}

function parseYaml(raw) {
  const result = {};
  const lines = raw.replace(/^#[^\n]*\n/gm, '').split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObj = null;
  let subArrayKey = null;
  let subArray = null;

  function flushSubArray() {
    if (subArray !== null && currentObj && subArrayKey) {
      currentObj[subArrayKey] = subArray;
    }
    subArray = null;
    subArrayKey = null;
  }

  function flushObj() {
    flushSubArray();
    if (currentObj) {
      if (currentArray !== null) currentArray.push(currentObj);
      currentObj = null;
    }
  }

  function flushArray() {
    flushObj();
    if (currentArray !== null) {
      result[currentKey] = currentArray;
      currentArray = null;
    }
  }

  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const indent = line.search(/\S/);
    const topLevel = line.match(/^(\w[\w_]*):\s*(.*)$/);

    if (topLevel && indent === 0) {
      flushArray();
      currentKey = topLevel[1];
      const val = cleanVal(topLevel[2]);
      if (val === '' || val === '[]') {
        currentArray = [];
        if (val === '[]') { result[currentKey] = []; currentArray = null; }
      } else {
        result[currentKey] = val;
      }
      continue;
    }

    if (currentArray !== null) {
      const arrayItemKV = line.match(/^\s{2,3}-\s+(\w[\w_]*):\s*(.*)$/);
      const arrayItemSimple = line.match(/^\s{2,3}-\s+["']?(.+?)["']?\s*$/);
      const nestedNoDash = line.match(/^\s{2,3}(\w[\w_]*):\s*["']?(.+?)["']?\s*$/);

      if (!arrayItemKV && !arrayItemSimple && nestedNoDash && currentArray.length === 0 && !currentObj) {
        result[currentKey] = {};
        result[currentKey][nestedNoDash[1]] = cleanVal(nestedNoDash[2]);
        currentArray = null;
        continue;
      }

      if (arrayItemKV) {
        flushObj();
        currentObj = {};
        currentObj[arrayItemKV[1]] = cleanVal(arrayItemKV[2]);
        continue;
      }

      if (arrayItemSimple && !arrayItemKV && !currentObj) {
        currentArray.push(cleanVal(arrayItemSimple[1]));
        continue;
      }

      if (currentObj) {
        const subArrayItem = line.match(/^\s{6,}-\s+["']?(.+?)["']?\s*$/);
        const objField = line.match(/^\s{4,5}(\w[\w_]*):\s*(.*)$/);

        if (subArray !== null && subArrayItem) {
          subArray.push(cleanVal(subArrayItem[1]));
          continue;
        }

        if (objField) {
          flushSubArray();
          const fieldVal = cleanVal(objField[2]);
          if (fieldVal === '' || fieldVal === '[]') {
            if (fieldVal === '[]') { currentObj[objField[1]] = []; }
            else { subArrayKey = objField[1]; subArray = []; }
          } else {
            currentObj[objField[1]] = fieldVal;
          }
          continue;
        }
      }
    }

    if (currentArray === null && currentKey) {
      const nestedScalar = line.match(/^\s{2,3}(\w[\w_]*):\s*["']?(.+?)["']?\s*$/);
      if (nestedScalar) {
        if (typeof result[currentKey] !== 'object' || Array.isArray(result[currentKey])) {
          result[currentKey] = {};
        }
        result[currentKey][nestedScalar[1]] = cleanVal(nestedScalar[2]);
        continue;
      }
    }
  }

  flushArray();
  return result;
}

// --- Helpers ---

function today() {
  return new Date().toISOString().slice(0, 10);
}

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function loadStages() {
  if (!fs.existsSync(STAGES_PATH)) die('stages.yml not found. Multi-stage mode is not configured.');
  return parseYaml(fs.readFileSync(STAGES_PATH, 'utf-8'));
}

function findActive(stages) {
  return (stages.stages || []).find(s => s.status === 'active');
}

function findById(stages, id) {
  return (stages.stages || []).find(s => String(s.id) === String(id));
}

function globRounds() {
  return fs.readdirSync(BASE).filter(f => /^round-\d+.*\.md$/.test(f)).sort();
}

function parseRoundFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  return parseYaml(fmMatch[1]);
}

// --- Write stages.yml back ---

function writeStagesYml(config) {
  const lines = [];
  lines.push('protocol: code-review-ping-pong');
  lines.push(`version: ${config.version || 1}`);
  if (config.project) lines.push(`project: "${config.project}"`);
  if (config.created) lines.push(`created: "${config.created}"`);
  lines.push('');
  lines.push('stages:');
  for (const s of (config.stages || [])) {
    lines.push(`  - id: ${s.id}`);
    lines.push(`    slug: "${s.slug}"`);
    lines.push(`    name: "${s.name}"`);
    if (s.description) lines.push(`    description: "${s.description}"`);
    lines.push(`    status: ${s.status}`);
    lines.push('    files:');
    for (const f of (s.files || [])) lines.push(`      - "${f}"`);
    if (s.goals && s.goals.length > 0) {
      lines.push('    goals:');
      for (const g of s.goals) lines.push(`      - "${g}"`);
    }
    if (s.constraints && s.constraints.length > 0) {
      lines.push('    constraints:');
      for (const c of s.constraints) lines.push(`      - "${c}"`);
    } else if (s.constraints) {
      lines.push('    constraints: []');
    }
  }
  lines.push('');
  fs.writeFileSync(STAGES_PATH, lines.join('\n'));
}

// --- Commands ---

function cmdInit() {
  const config = loadStages();
  const active = findActive(config);
  if (!active) die('No active stage found. Use "activate <id>" to set one.');

  const lines = [];
  lines.push(`# Ping-Pong Session — Stage ${active.id}: ${active.name}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('- files:');
  for (const f of (active.files || [])) lines.push(`  - ${f}`);
  lines.push('');
  lines.push('## Goals');
  for (const g of (active.goals || [])) lines.push(`- ${g}`);
  lines.push('');
  lines.push('## Constraints');
  if (active.constraints && active.constraints.length > 0) {
    for (const c of active.constraints) lines.push(`- ${c}`);
  } else {
    lines.push('- (none)');
  }
  lines.push('');

  fs.writeFileSync(SESSION_PATH, lines.join('\n'));
  console.log(`OK: session.md generated for Stage ${active.id}: ${active.name}`);
  console.log(`    ${(active.files || []).length} files in scope`);
}

function cmdActivate(targetId) {
  if (!targetId) die('Usage: node multi-stage.cjs activate <stage-id>');

  const config = loadStages();
  const target = findById(config, targetId);
  if (!target) die(`Stage ${targetId} not found.`);
  if (target.status === 'complete') die(`Stage ${targetId} is already complete. Cannot reactivate.`);

  // Check for stale round files
  const rounds = globRounds();
  if (rounds.length > 0) {
    die(`Cannot activate stage ${targetId}: ${rounds.length} round file(s) still in root directory. Archive the current stage first, or delete them manually.`);
  }

  // Deactivate current active
  const current = findActive(config);
  if (current) {
    if (current.id === target.id) {
      console.log(`Stage ${targetId} is already active.`);
      return;
    }
    current.status = 'pending';
  }

  target.status = 'active';
  writeStagesYml(config);

  // Auto-generate session.md and update progress
  cmdInit();
  cmdProgress();
  console.log(`OK: Stage ${target.id} (${target.name}) is now active.`);
}

function cmdArchive() {
  const config = loadStages();
  const active = findActive(config);
  if (!active) die('No active stage to archive.');

  // Find the latest round and check it's PERFECT
  const rounds = globRounds();
  const reviewRounds = rounds.filter(f => /^round-\d+\.md$/.test(f));
  if (reviewRounds.length === 0) die('No round files found. Nothing to archive.');

  const lastReview = reviewRounds[reviewRounds.length - 1];
  const lastYaml = parseRoundFile(path.join(BASE, lastReview));
  if (!lastYaml || lastYaml.verdict !== 'PERFECT') {
    die(`Latest review (${lastReview}) verdict is "${lastYaml ? lastYaml.verdict : 'unknown'}", not PERFECT. Stage must reach 10/10 before archiving.`);
  }

  // Create archive directory
  const archiveDir = path.join(BASE, 'archive', `stage-${active.id}-${active.slug}`);
  fs.mkdirSync(archiveDir, { recursive: true });

  // Move round files
  for (const f of rounds) {
    fs.renameSync(path.join(BASE, f), path.join(archiveDir, f));
  }

  // Move session.md
  if (fs.existsSync(SESSION_PATH)) {
    fs.renameSync(SESSION_PATH, path.join(archiveDir, 'session.md'));
  }

  // Compute stats from archived rounds
  // Count unique issues: round 1 has the original set. Subsequent rounds may have
  // new issues (id not seen before) or repeated issues (same id = still open).
  // Only count each unique issue ID once toward total_issues_found.
  const seenIssueIds = new Set();
  let totalIssuesFixed = 0;
  let totalIssuesSkipped = 0;
  const roundsSummary = [];

  for (const f of rounds) {
    const yaml = parseRoundFile(path.join(archiveDir, f));
    if (!yaml) continue;

    if (yaml.type === 'review') {
      const issues = Array.isArray(yaml.issues) ? yaml.issues : [];
      for (const issue of issues) {
        if (issue && issue.id) seenIssueIds.add(issue.id);
      }
      roundsSummary.push({ file: f, type: 'review', score: yaml.score || '?', issues: issues.length });
    } else if (yaml.type === 'fix') {
      const fixed = Number(yaml.issues_fixed) || 0;
      const skipped = Number(yaml.issues_skipped) || 0;
      totalIssuesFixed += fixed;
      totalIssuesSkipped += skipped;
      roundsSummary.push({ file: f, type: 'fix', fixed, skipped });
    } else if (yaml.type === 'audit') {
      // Audit new_issues also count as unique
      const newIssues = Array.isArray(yaml.new_issues) ? yaml.new_issues : [];
      for (const issue of newIssues) {
        if (issue && issue.id) seenIssueIds.add(issue.id);
      }
      roundsSummary.push({ file: f, type: 'audit', process_health: yaml.process_health || '?' });
    }
  }

  const totalIssuesFound = seenIssueIds.size;

  // Generate summary.yml
  const summaryLines = [];
  summaryLines.push('protocol: code-review-ping-pong');
  summaryLines.push('type: stage-summary');
  summaryLines.push(`stage_id: ${active.id}`);
  summaryLines.push(`stage_slug: "${active.slug}"`);
  summaryLines.push(`stage_name: "${active.name}"`);
  summaryLines.push(`completed_at: "${today()}"`);
  summaryLines.push(`total_rounds: ${rounds.length}`);
  summaryLines.push('final_score: 10');
  summaryLines.push(`total_issues_found: ${totalIssuesFound}`);
  summaryLines.push(`total_issues_fixed: ${totalIssuesFixed}`);
  summaryLines.push(`total_issues_skipped: ${totalIssuesSkipped}`);
  summaryLines.push('files_in_scope:');
  for (const f of (active.files || [])) summaryLines.push(`  - "${f}"`);
  summaryLines.push('rounds:');
  for (const r of roundsSummary) {
    summaryLines.push(`  - file: ${r.file}`);
    summaryLines.push(`    type: ${r.type}`);
    if (r.type === 'review') {
      summaryLines.push(`    score: ${r.score}`);
      summaryLines.push(`    issues: ${r.issues}`);
    } else if (r.type === 'fix') {
      summaryLines.push(`    fixed: ${r.fixed}`);
      summaryLines.push(`    skipped: ${r.skipped}`);
    } else if (r.type === 'audit') {
      summaryLines.push(`    process_health: ${r.process_health}`);
    }
  }
  summaryLines.push('');
  fs.writeFileSync(path.join(archiveDir, 'summary.yml'), summaryLines.join('\n'));

  // Update stages.yml
  active.status = 'complete';
  writeStagesYml(config);

  // Write next-step.md in the protocol's mandatory format
  const nextPending = (config.stages || []).find(s => s.status === 'pending');
  const lastRound = reviewRounds.length > 0
    ? Number(reviewRounds[reviewRounds.length - 1].match(/round-(\d+)/)[1])
    : 0;

  const nextStepLines = [];
  nextStepLines.push('# Next Step');
  nextStepLines.push('');
  nextStepLines.push(`- current_round: ${lastRound}`);
  nextStepLines.push('- current_mode: REVIEW');
  nextStepLines.push('- cycle_state: COMPLETE');
  nextStepLines.push('- next_agent: NONE');
  nextStepLines.push('- next_mode: none');
  nextStepLines.push('- expected_artifact: none');
  nextStepLines.push(`- blocking_reason: Stage ${active.id} (${active.name}) complete and archived`);
  nextStepLines.push('');
  nextStepLines.push('## Operator Prompt');
  nextStepLines.push('');
  if (nextPending) {
    nextStepLines.push(`Stage ${active.id} finalizado. Próximo stage pendente: ${nextPending.id} — ${nextPending.name}.`);
    nextStepLines.push('');
    nextStepLines.push(`Rode: \`node multi-stage.cjs activate ${nextPending.id}\``);
  } else {
    nextStepLines.push('Todos os stages completos! Nada mais a fazer.');
  }
  nextStepLines.push('');
  fs.writeFileSync(NEXTSTEP_PATH, nextStepLines.join('\n'));

  // Regenerate progress
  cmdProgress();

  console.log(`OK: Stage ${active.id} (${active.name}) archived to archive/stage-${active.id}-${active.slug}/`);
  console.log(`    ${rounds.length} round files moved, summary.yml generated`);
  console.log(`    ${totalIssuesFound} issues found, ${totalIssuesFixed} fixed, ${totalIssuesSkipped} skipped`);
  if (nextPending) {
    console.log(`\nNext: node multi-stage.cjs activate ${nextPending.id}`);
  } else {
    console.log('\nAll stages complete!');
  }
}

function cmdProgress() {
  const config = loadStages();
  const allStages = config.stages || [];

  let totalCompleted = 0;
  let totalActive = 0;
  let totalPending = 0;
  let totalIssuesFound = 0;
  let totalIssuesFixed = 0;
  let totalRounds = 0;

  const stageEntries = [];

  for (const s of allStages) {
    const entry = {
      id: s.id,
      slug: s.slug,
      status: s.status,
    };

    if (s.status === 'complete') {
      totalCompleted++;
      const archiveDir = path.join(BASE, 'archive', `stage-${s.id}-${s.slug}`);
      const summaryPath = path.join(archiveDir, 'summary.yml');
      if (fs.existsSync(summaryPath)) {
        const summary = parseYaml(fs.readFileSync(summaryPath, 'utf-8'));
        entry.final_score = 10;
        entry.rounds = Number(summary.total_rounds) || 0;
        entry.issues_found = Number(summary.total_issues_found) || 0;
        entry.issues_fixed = Number(summary.total_issues_fixed) || 0;
        entry.archived_at = summary.completed_at || today();
        entry.archive_path = `archive/stage-${s.id}-${s.slug}/`;
        totalIssuesFound += entry.issues_found;
        totalIssuesFixed += entry.issues_fixed;
        totalRounds += entry.rounds;
      }
    } else if (s.status === 'active') {
      totalActive++;
      // Scan round files in root — count unique issue IDs
      const rounds = globRounds();
      const reviewRounds = rounds.filter(f => /^round-\d+\.md$/.test(f));
      const stageIssueIds = new Set();
      let stageIssuesFixed = 0;
      let latestScore = null;

      for (const f of rounds) {
        const yaml = parseRoundFile(path.join(BASE, f));
        if (!yaml) continue;
        if (yaml.type === 'review') {
          const issues = Array.isArray(yaml.issues) ? yaml.issues : [];
          for (const issue of issues) {
            if (issue && issue.id) stageIssueIds.add(issue.id);
          }
          latestScore = yaml.score;
        } else if (yaml.type === 'fix') {
          stageIssuesFixed += Number(yaml.issues_fixed) || 0;
        }
      }

      entry.current_round = reviewRounds.length;
      entry.latest_score = latestScore;
      entry.issues_found = stageIssueIds.size;
      entry.issues_fixed = stageIssuesFixed;
      totalIssuesFound += stageIssueIds.size;
      totalIssuesFixed += stageIssuesFixed;
      totalRounds += rounds.length;
    } else {
      totalPending++;
      entry.current_round = 0;
      entry.latest_score = null;
      entry.issues_found = 0;
      entry.issues_fixed = 0;
    }

    stageEntries.push(entry);
  }

  const total = allStages.length;
  const pct = total > 0 ? Math.floor((totalCompleted / total) * 100) : 0;

  // Write progress.yml
  const lines = [];
  lines.push('# Auto-generated by multi-stage.cjs — do not edit manually');
  lines.push('protocol: code-review-ping-pong');
  lines.push(`updated: "${today()}"`);
  lines.push('');
  lines.push('summary:');
  lines.push(`  total_stages: ${total}`);
  lines.push(`  completed: ${totalCompleted}`);
  lines.push(`  active: ${totalActive}`);
  lines.push(`  pending: ${totalPending}`);
  lines.push(`  completion_pct: ${pct}`);
  lines.push(`  total_issues_found: ${totalIssuesFound}`);
  lines.push(`  total_issues_fixed: ${totalIssuesFixed}`);
  lines.push(`  total_rounds: ${totalRounds}`);
  lines.push('');
  lines.push('stages:');

  for (const e of stageEntries) {
    lines.push(`  - id: ${e.id}`);
    lines.push(`    slug: "${e.slug}"`);
    lines.push(`    status: ${e.status}`);
    if (e.status === 'complete') {
      lines.push(`    final_score: ${e.final_score}`);
      lines.push(`    rounds: ${e.rounds}`);
      lines.push(`    issues_found: ${e.issues_found}`);
      lines.push(`    issues_fixed: ${e.issues_fixed}`);
      lines.push(`    archived_at: "${e.archived_at}"`);
      lines.push(`    archive_path: ${e.archive_path}`);
    } else if (e.status === 'active') {
      lines.push(`    current_round: ${e.current_round}`);
      lines.push(`    latest_score: ${e.latest_score || 'null'}`);
      lines.push(`    issues_found: ${e.issues_found}`);
      lines.push(`    issues_fixed: ${e.issues_fixed}`);
    } else {
      lines.push('    current_round: 0');
      lines.push('    latest_score: null');
      lines.push('    issues_found: 0');
      lines.push('    issues_fixed: 0');
    }
  }
  lines.push('');

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'));
  console.log(`OK: progress.yml updated — ${totalCompleted}/${total} stages complete (${pct}%)`);
  console.log(`    ${totalIssuesFound} issues found, ${totalIssuesFixed} fixed, ${totalRounds} rounds total`);
}

function cmdStatus() {
  const config = loadStages();
  const allStages = config.stages || [];
  const active = findActive(config);
  const rounds = globRounds();

  console.log(`\nProject: ${config.project || '(unnamed)'}`);
  console.log(`Stages: ${allStages.length}`);
  console.log('');

  for (const s of allStages) {
    const icon = s.status === 'complete' ? '✅' : s.status === 'active' ? '▶️ ' : '⏸️ ';
    const suffix = s.status === 'active' ? ` (${rounds.length} round files)` : '';
    console.log(`  ${icon} ${s.id}. ${s.name} [${s.status}]${suffix}`);
  }

  console.log('');
  if (active) {
    console.log(`Active: Stage ${active.id} — ${active.name}`);
    console.log(`Files in scope: ${(active.files || []).length}`);
  } else {
    console.log('No active stage.');
  }
  console.log('');
}

// --- Main ---

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case 'init':
    cmdInit();
    break;
  case 'activate':
    cmdActivate(arg);
    break;
  case 'archive':
    cmdArchive();
    break;
  case 'progress':
    cmdProgress();
    break;
  case 'status':
    cmdStatus();
    break;
  default:
    console.log('Code Review Ping-Pong — Multi-Stage Orchestration');
    console.log('');
    console.log('Usage: node multi-stage.cjs <command> [args]');
    console.log('');
    console.log('Commands:');
    console.log('  init              Generate session.md from active stage');
    console.log('  activate <id>     Set a stage to active');
    console.log('  archive           Archive active stage (must be 10/10)');
    console.log('  progress          Regenerate progress.yml');
    console.log('  status            Print current multi-stage status');
    console.log('');
    process.exit(cmd ? 1 : 0);
}
