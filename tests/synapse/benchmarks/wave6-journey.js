#!/usr/bin/env node

/**
 * Wave 6 — Performance Journey Log
 *
 * Captures UAP + SYNAPSE + code-intel metrics as tagged snapshots,
 * compares them across story boundaries, and generates a cumulative
 * markdown report.
 *
 * Usage:
 *   node tests/synapse/benchmarks/wave6-journey.js --tag="baseline"
 *   node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-10"
 *   node tests/synapse/benchmarks/wave6-journey.js --compare="baseline,NOG-10"
 *   node tests/synapse/benchmarks/wave6-journey.js --list
 *
 * Zero changes to core — reads existing metrics files only.
 *
 * @module tests/synapse/benchmarks/wave6-journey
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');
const JOURNEY_DIR = path.join(SYNAPSE_PATH, 'metrics', 'journey');
const REPORT_PATH = path.join(PROJECT_ROOT, 'docs', 'qa', 'wave6-journey-log.md');

const DEFAULT_AGENTS = ['dev', 'qa', 'architect', 'devops', 'sm', 'po'];

// ---------------------------------------------------------------------------
// Imports from existing codebase
// ---------------------------------------------------------------------------

const { UnifiedActivationPipeline } = require(
  path.join(PROJECT_ROOT, '.aios-core', 'development', 'scripts', 'unified-activation-pipeline.js'),
);
const { collectTimingMetrics } = require(
  path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'diagnostics', 'collectors', 'timing-collector.js'),
);
const { safeReadJson } = require(
  path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'diagnostics', 'collectors', 'safe-read-json.js'),
);
const { calcStats } = require(
  path.join(PROJECT_ROOT, 'tests', 'synapse', 'benchmarks', 'pipeline-benchmark.js'),
);

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { tag: null, compare: null, list: false, agents: DEFAULT_AGENTS };

  for (const arg of args) {
    if (arg.startsWith('--tag=')) {
      options.tag = arg.split('=')[1].replace(/"/g, '');
    } else if (arg.startsWith('--compare=')) {
      options.compare = arg.split('=')[1].replace(/"/g, '').split(',').map(s => s.trim());
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg.startsWith('--agents=')) {
      options.agents = arg.split('=')[1].replace(/"/g, '').split(',').map(s => s.trim());
    }
  }
  return options;
}

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

function getGitInfo() {
  try {
    const commit = execSync('git rev-parse --short HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    return { commit, branch };
  } catch {
    return { commit: 'unknown', branch: 'unknown' };
  }
}

// ---------------------------------------------------------------------------
// Code-intel check
// ---------------------------------------------------------------------------

function checkCodeIntel() {
  try {
    const codeIntel = require(path.join(PROJECT_ROOT, '.aios-core', 'core', 'code-intel', 'index.js'));
    // Initialize singleton so isCodeIntelAvailable works
    try { codeIntel.getClient(); } catch { /* provider may not be running */ }
    const available = codeIntel.isCodeIntelAvailable();
    return {
      available,
      providerStatus: available ? 'connected' : 'disconnected',
      capabilities: available ? Object.keys(codeIntel.CAPABILITIES || {}).length : 0,
    };
  } catch {
    return { available: false, providerStatus: 'disconnected', capabilities: 0 };
  }
}

// ---------------------------------------------------------------------------
// Collect snapshot for one agent
// ---------------------------------------------------------------------------

async function collectAgentMetrics(agentId) {
  const result = { uap: {}, synapse: {}, session: {} };

  // 1) Run UAP activation
  try {
    const activation = await UnifiedActivationPipeline.activate(agentId, { projectRoot: PROJECT_ROOT });
    result.uap = {
      totalDuration: activation.duration || 0,
      quality: activation.quality || 'unknown',
      loaders: {},
    };
    if (activation.metrics && activation.metrics.loaders) {
      result.uap.loaders = activation.metrics.loaders;
    }
  } catch (err) {
    result.uap = { totalDuration: -1, quality: 'error', error: err.message, loaders: {} };
  }

  // 2) Read persisted metrics (freshly written by activate())
  const timing = collectTimingMetrics(PROJECT_ROOT);

  if (timing.hook && timing.hook.available) {
    result.synapse = {
      totalDuration: timing.hook.totalDuration || 0,
      bracket: timing.hook.bracket || 'unknown',
      layersLoaded: 0,
      layersSkipped: 0,
      totalRules: 0,
      perLayer: {},
    };
    if (timing.hook.layers) {
      for (const layer of timing.hook.layers) {
        result.synapse.perLayer[layer.name] = {
          duration: layer.duration,
          status: layer.status,
          rules: layer.rules || 0,
        };
        if (layer.status === 'ok') result.synapse.layersLoaded++;
        else if (layer.status === 'skipped') result.synapse.layersSkipped++;
        result.synapse.totalRules += layer.rules || 0;
      }
    }
  }

  // 3) Read session state
  const sessionFile = path.join(SYNAPSE_PATH, 'sessions', '_active-agent.json');
  const sessionData = safeReadJson(sessionFile);
  if (sessionData) {
    result.session = {
      promptCount: sessionData.prompt_count || 0,
      lastBracket: (sessionData.context && sessionData.context.last_bracket) || 'unknown',
      activationQuality: result.uap.quality,
    };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Run SYNAPSE pipeline benchmark (reuse existing)
// ---------------------------------------------------------------------------

async function collectPipelineMetrics() {
  try {
    const { runBenchmark } = require(
      path.join(PROJECT_ROOT, 'tests', 'synapse', 'benchmarks', 'pipeline-benchmark.js'),
    );
    // Suppress benchmark's own console.log (json mode prints to stdout)
    const origLog = console.log;
    console.log = () => {};
    const benchResult = await runBenchmark({ warm: true, cold: false, iterations: 20, json: true });
    console.log = origLog;
    return {
      p50: benchResult.pipeline.p50,
      p95: benchResult.pipeline.p95,
      p99: benchResult.pipeline.p99,
      mean: benchResult.pipeline.mean,
      layerBreakdown: benchResult.layers || {},
    };
  } catch (err) {
    return { p50: -1, p95: -1, p99: -1, mean: -1, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Snapshot assembly
// ---------------------------------------------------------------------------

async function captureSnapshot(tag, agents) {
  console.log(`\nCapturing snapshot: ${tag}`);
  console.log(`Agents: ${agents.join(', ')}\n`);

  const git = getGitInfo();
  const snapshot = {
    tag,
    timestamp: new Date().toISOString(),
    gitCommit: git.commit,
    gitBranch: git.branch,
    agents: {},
    pipeline: {},
    codeIntel: {},
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  // Collect per-agent metrics
  for (const agentId of agents) {
    process.stdout.write(`  ${agentId}... `);
    snapshot.agents[agentId] = await collectAgentMetrics(agentId);
    const dur = snapshot.agents[agentId].uap.totalDuration;
    console.log(`${dur >= 0 ? dur + 'ms' : 'error'} (${snapshot.agents[agentId].uap.quality})`);
  }

  // Pipeline benchmark
  process.stdout.write('  pipeline benchmark (20 iter)... ');
  snapshot.pipeline = await collectPipelineMetrics();
  console.log(`p50=${fmt(snapshot.pipeline.p50)}ms p95=${fmt(snapshot.pipeline.p95)}ms`);

  // Code-intel
  process.stdout.write('  code-intel... ');
  snapshot.codeIntel = checkCodeIntel();
  console.log(snapshot.codeIntel.available ? 'connected' : 'disconnected');

  return snapshot;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function saveSnapshot(snapshot) {
  fs.mkdirSync(JOURNEY_DIR, { recursive: true });
  const filePath = path.join(JOURNEY_DIR, `${snapshot.tag}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`\nSnapshot saved: ${filePath}`);
}

function loadSnapshot(tag) {
  const filePath = path.join(JOURNEY_DIR, `${tag}.json`);
  return safeReadJson(filePath);
}

function listSnapshots() {
  if (!fs.existsSync(JOURNEY_DIR)) {
    console.log('No snapshots found.');
    return [];
  }
  const files = fs.readdirSync(JOURNEY_DIR).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) {
    console.log('No snapshots found.');
    return [];
  }
  console.log('\nAvailable snapshots:');
  for (const f of files) {
    const data = safeReadJson(path.join(JOURNEY_DIR, f));
    const tag = data ? data.tag : f.replace('.json', '');
    const ts = data ? data.timestamp : '?';
    const commit = data ? data.gitCommit : '?';
    console.log(`  ${tag.padEnd(20)} ${ts}  (${commit})`);
  }
  return files.map(f => f.replace('.json', ''));
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

function compareSnapshots(before, after) {
  const diffs = [];

  // Compare per-agent UAP
  for (const agentId of Object.keys(after.agents)) {
    const a = before.agents[agentId];
    const b = after.agents[agentId];
    if (!a || !b) continue;

    diffs.push({
      metric: `UAP total (${agentId})`,
      before: a.uap.totalDuration,
      after: b.uap.totalDuration,
      unit: 'ms',
    });

    // Individual slow loaders
    for (const loaderName of Object.keys(b.uap.loaders)) {
      const lb = b.uap.loaders[loaderName];
      const la = a.uap.loaders[loaderName];
      if (la && lb && typeof la.duration === 'number' && typeof lb.duration === 'number') {
        if (la.duration > 10 || lb.duration > 10) {
          diffs.push({
            metric: `  ${agentId}.${loaderName}`,
            before: la.duration,
            after: lb.duration,
            unit: 'ms',
          });
        }
      }
    }
  }

  // Pipeline
  if (before.pipeline && after.pipeline) {
    diffs.push({ metric: 'SYNAPSE p50', before: before.pipeline.p50, after: after.pipeline.p50, unit: 'ms' });
    diffs.push({ metric: 'SYNAPSE p95', before: before.pipeline.p95, after: after.pipeline.p95, unit: 'ms' });
  }

  // Session bracket
  const firstAgentBefore = Object.values(before.agents)[0];
  const firstAgentAfter = Object.values(after.agents)[0];
  if (firstAgentBefore && firstAgentAfter) {
    diffs.push({
      metric: 'Bracket',
      before: firstAgentBefore.synapse.bracket || 'unknown',
      after: firstAgentAfter.synapse.bracket || 'unknown',
      unit: '',
    });
  }

  return diffs;
}

function classifyDelta(before, after) {
  if (typeof before === 'string' || typeof after === 'string') {
    return before === after ? 'NEUTRAL' : 'CHANGED';
  }
  if (before < 0 || after < 0) return 'ERROR';
  const delta = after - before;
  const pct = before !== 0 ? Math.abs(delta / before) : 0;
  if (pct < 0.05) return 'NEUTRAL';
  return delta < 0 ? 'IMPROVED' : 'REGRESSED';
}

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

function fmt(v) {
  if (typeof v === 'number') return v.toFixed(2);
  return String(v);
}

function generateSnapshotMarkdown(snapshot) {
  const agents = Object.entries(snapshot.agents);
  let md = '';

  md += `## Snapshot: ${snapshot.tag} (${snapshot.timestamp.split('T')[0]})\n`;
  md += `Commit: ${snapshot.gitCommit} | Branch: ${snapshot.gitBranch}\n\n`;

  // UAP table
  md += `### UAP Activation (${agents.length} agents)\n`;
  md += '| Agent | Total (ms) | Quality | Slowest Loader | Code-Intel |\n';
  md += '|-------|-----------|---------|----------------|------------|\n';

  for (const [agentId, data] of agents) {
    const loaders = data.uap.loaders || {};
    let slowest = { name: '-', duration: 0 };
    for (const [name, info] of Object.entries(loaders)) {
      if (info.duration > slowest.duration) {
        slowest = { name, duration: info.duration, status: info.status };
      }
    }
    const slowestStr = slowest.duration > 0
      ? `${slowest.name} (${fmt(slowest.duration)}ms${slowest.status === 'timeout' ? ', timeout' : ''})`
      : '-';
    const codeIntelStr = snapshot.codeIntel.available ? 'available' : 'disconnected';
    md += `| ${agentId} | ${fmt(data.uap.totalDuration)} | ${data.uap.quality} | ${slowestStr} | ${codeIntelStr} |\n`;
  }
  md += '\n';

  // Pipeline table
  md += '### SYNAPSE Pipeline\n';
  md += '| Metric | Value |\n';
  md += '|--------|-------|\n';
  md += `| p50 | ${fmt(snapshot.pipeline.p50)}ms |\n`;
  md += `| p95 | ${fmt(snapshot.pipeline.p95)}ms |\n`;
  const firstAgent = agents[0] ? agents[0][1] : null;
  if (firstAgent && firstAgent.synapse) {
    const loaded = firstAgent.synapse.layersLoaded || 0;
    const total = loaded + (firstAgent.synapse.layersSkipped || 0);
    md += `| Layers loaded | ${loaded}/${total} |\n`;
    md += `| Total rules | ${firstAgent.synapse.totalRules || 0} |\n`;
  }
  md += '\n';

  // Session state
  md += '### Session State\n';
  md += '| Field | Value |\n';
  md += '|-------|-------|\n';
  if (firstAgent && firstAgent.synapse) {
    md += `| Bracket | ${firstAgent.synapse.bracket || 'unknown'} |\n`;
  }
  if (firstAgent && firstAgent.session) {
    md += `| Prompt count | ${firstAgent.session.promptCount} |\n`;
  }
  md += '\n';

  return md;
}

function generateDiffMarkdown(beforeTag, afterTag, diffs) {
  let md = `### Diff vs ${beforeTag}\n`;
  md += '| Metric | Before | After | Delta | Status |\n';
  md += '|--------|--------|-------|-------|--------|\n';

  for (const d of diffs) {
    const delta = typeof d.before === 'number' && typeof d.after === 'number'
      ? `${(d.after - d.before) >= 0 ? '+' : ''}${fmt(d.after - d.before)}${d.unit}`
      : (d.before === d.after ? 'same' : 'changed');
    const status = classifyDelta(d.before, d.after);
    md += `| ${d.metric} | ${fmt(d.before)}${d.unit} | ${fmt(d.after)}${d.unit} | ${delta} | ${status} |\n`;
  }
  md += '\n';
  return md;
}

function writeReport(content) {
  const header = `# Wave 6 — Performance Journey Log\n\n> Auto-generated by \`wave6-journey.js\`. Do not edit manually.\n\n---\n\n`;

  if (!fs.existsSync(REPORT_PATH)) {
    fs.writeFileSync(REPORT_PATH, header + content, 'utf8');
  } else {
    const existing = fs.readFileSync(REPORT_PATH, 'utf8');
    // Append new snapshot after last content
    fs.writeFileSync(REPORT_PATH, existing.trimEnd() + '\n\n---\n\n' + content, 'utf8');
  }
  console.log(`Report updated: ${REPORT_PATH}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const options = parseArgs();

  if (options.list) {
    listSnapshots();
    return;
  }

  if (options.compare) {
    if (options.compare.length < 2) {
      console.error('--compare requires two tags: --compare="before,after"');
      process.exit(1);
    }
    const [beforeTag, afterTag] = options.compare;
    const before = loadSnapshot(beforeTag);
    const after = loadSnapshot(afterTag);
    if (!before) { console.error(`Snapshot not found: ${beforeTag}`); process.exit(1); }
    if (!after) { console.error(`Snapshot not found: ${afterTag}`); process.exit(1); }

    const diffs = compareSnapshots(before, after);
    const md = generateDiffMarkdown(beforeTag, afterTag, diffs);
    console.log('\n' + md);

    const hasRegression = diffs.some(d => classifyDelta(d.before, d.after) === 'REGRESSED');
    if (hasRegression) {
      console.log('WARNING: Regressions detected! Review before pushing.');
      process.exit(2);
    }
    return;
  }

  if (!options.tag) {
    console.error('Usage: wave6-journey.js --tag="name" | --compare="a,b" | --list');
    process.exit(1);
  }

  // Capture + save + report
  const snapshot = await captureSnapshot(options.tag, options.agents);
  saveSnapshot(snapshot);

  // Generate markdown
  let md = generateSnapshotMarkdown(snapshot);

  // Auto-compare with previous snapshot
  const tags = listSnapshots();
  const currentIdx = tags.indexOf(options.tag);
  if (currentIdx > 0) {
    const prevTag = tags[currentIdx - 1];
    const prevSnapshot = loadSnapshot(prevTag);
    if (prevSnapshot) {
      const diffs = compareSnapshots(prevSnapshot, snapshot);
      md += generateDiffMarkdown(prevTag, options.tag, diffs);

      const hasRegression = diffs.some(d => classifyDelta(d.before, d.after) === 'REGRESSED');
      if (hasRegression) {
        console.log('\nWARNING: Regressions detected vs previous snapshot!');
      }
    }
  }

  writeReport(md);
  console.log('\nDone.');
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Journey capture failed:', err);
  process.exit(1);
});
