#!/usr/bin/env node

/**
 * SYNAPSE Pipeline Benchmark
 *
 * Story SYN-12: Performance Benchmarks + E2E Testing.
 * Measures execution time for SynapseEngine.process() across multiple iterations.
 * Reports p50/p95/p99 per layer and total pipeline.
 *
 * Usage:
 *   node tests/synapse/benchmarks/pipeline-benchmark.js [--warm] [--cold] [--iterations=100]
 *
 * Flags:
 *   --warm         Warm-start benchmark (reuse engine instance, default)
 *   --cold         Cold-start benchmark (new engine per iteration)
 *   --iterations=N Number of measured iterations (default: 100)
 *   --json         Output results as JSON only
 *
 * Performance Targets (from EPIC-SYN-INDEX):
 *   Total pipeline: <70ms (target), <100ms (hard limit)
 *   Layer individual: <15ms (<20ms hard, L0/L7: <5ms)
 *   Startup (.synapse/ discovery): <5ms (<10ms hard)
 *   Session I/O: <10ms (<15ms hard)
 *
 * @module tests/synapse/benchmarks/pipeline-benchmark
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');

const WARMUP_ITERATIONS = 5;
const DEFAULT_ITERATIONS = 100;

const TARGETS = {
  pipeline: { target: 70, hardLimit: 100 },
  layer: { target: 15, hardLimit: 20 },
  layerL0: { target: 5, hardLimit: 10 },
  layerL7: { target: 5, hardLimit: 10 },
  startup: { target: 5, hardLimit: 10 },
  sessionIO: { target: 10, hardLimit: 15 },
};

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { warm: true, cold: false, iterations: DEFAULT_ITERATIONS, json: false };

  for (const arg of args) {
    if (arg === '--cold') { options.cold = true; options.warm = false; }
    else if (arg === '--warm') { options.warm = true; options.cold = false; }
    else if (arg === '--json') { options.json = true; }
    else if (arg.startsWith('--iterations=')) {
      options.iterations = parseInt(arg.split('=')[1], 10) || DEFAULT_ITERATIONS;
    }
  }
  return options;
}

// ---------------------------------------------------------------------------
// Percentile
// ---------------------------------------------------------------------------

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function calcStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    mean: sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
    count: sorted.length,
  };
}

// ---------------------------------------------------------------------------
// Benchmark
// ---------------------------------------------------------------------------

async function runBenchmark(options) {
  const { SynapseEngine } = require(
    path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'engine.js'),
  );
  const { loadSession } = require(
    path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'session', 'session-manager.js'),
  );
  const { parseManifest } = require(
    path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'domain', 'domain-loader.js'),
  );

  const manifestPath = path.join(SYNAPSE_PATH, 'manifest');
  const mode = options.cold ? 'cold' : 'warm';
  const iterations = options.iterations;

  if (!options.json) {
    console.log(`\nSYNAPSE Pipeline Benchmark — ${mode} start, ${iterations} iterations`);
    console.log(`Synapse path: ${SYNAPSE_PATH}\n`);
  }

  // Verify .synapse/ exists
  if (!fs.existsSync(SYNAPSE_PATH)) {
    console.error('ERROR: .synapse/ directory not found. Run SYN-8 first.');
    process.exit(1);
  }

  const { formatSynapseRules } = require(
    path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'output', 'formatter.js'),
  );

  // Measure startup (manifest parse + engine construction)
  const startupDurations = [];
  const sessionIODurations = [];
  const pipelineDurations = [];
  const formatterDurations = [];
  const layerDurations = {}; // { layerName: number[] }

  const manifest = parseManifest(manifestPath);
  const prompt = 'Implement the user authentication feature';
  const session = {
    prompt_count: 5,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: { last_bracket: 'MODERATE', last_tokens_used: 0, last_context_percent: 55 },
  };

  // Warm-up phase
  if (!options.json) {
    console.log(`Warm-up phase (${WARMUP_ITERATIONS} iterations)...`);
  }

  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    const engine = new SynapseEngine(SYNAPSE_PATH, { manifest, devmode: false });
    await engine.process(prompt, session);
  }

  // Measured phase
  if (!options.json) {
    console.log(`Measured phase (${iterations} iterations)...\n`);
  }

  let cachedEngine = null;

  for (let i = 0; i < iterations; i++) {
    // Startup measurement
    const startupStart = performance.now();
    const engine = options.cold
      ? new SynapseEngine(SYNAPSE_PATH, { manifest, devmode: false })
      : (i === 0 ? new SynapseEngine(SYNAPSE_PATH, { manifest, devmode: false }) : null);
    const startupEnd = performance.now();

    if (options.cold || i === 0) {
      startupDurations.push(startupEnd - startupStart);
    }

    const engineToUse = options.cold ? engine : (engine || cachedEngine);
    if (i === 0 && !options.cold) {
      cachedEngine = engine;
    }

    // Session I/O measurement
    const sessionStart = performance.now();
    const sessionsDir = path.join(SYNAPSE_PATH, 'sessions');
    const sessionData = loadSession('benchmark-session', sessionsDir) || session;
    const sessionEnd = performance.now();
    sessionIODurations.push(sessionEnd - sessionStart);

    // Pipeline measurement
    const pipelineStart = performance.now();
    const result = await (engineToUse || engine).process(prompt, sessionData);
    const pipelineEnd = performance.now();
    pipelineDurations.push(pipelineEnd - pipelineStart);

    // Collect per-layer timings from metrics
    if (result && result.metrics && result.metrics.per_layer) {
      for (const [name, info] of Object.entries(result.metrics.per_layer)) {
        if (info.duration != null) {
          if (!layerDurations[name]) layerDurations[name] = [];
          layerDurations[name].push(info.duration);
        }
      }
    }

    // Isolated formatter measurement
    const fmtStart = performance.now();
    formatSynapseRules(
      [], // empty results (measures formatter overhead, not layer content)
      'MODERATE',
      55,
      sessionData,
      false,
      result && result.metrics ? result.metrics : {},
      1500,
      false,
    );
    const fmtEnd = performance.now();
    formatterDurations.push(fmtEnd - fmtStart);
  }

  // ---------------------------------------------------------------------------
  // Build results
  // ---------------------------------------------------------------------------

  const results = {
    mode,
    iterations,
    warmup: WARMUP_ITERATIONS,
    timestamp: new Date().toISOString(),
    targets: TARGETS,
    pipeline: calcStats(pipelineDurations),
    formatter: calcStats(formatterDurations),
    startup: calcStats(startupDurations),
    sessionIO: calcStats(sessionIODurations),
    layers: {},
  };

  for (const [name, durations] of Object.entries(layerDurations)) {
    results.layers[name] = calcStats(durations);
  }

  // ---------------------------------------------------------------------------
  // Output
  // ---------------------------------------------------------------------------

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }

  // Human-readable report
  console.log('='.repeat(80));
  console.log('SYNAPSE PIPELINE BENCHMARK RESULTS');
  console.log('='.repeat(80));

  const fmt = (v) => typeof v === 'number' ? v.toFixed(2) : '?';

  console.log('\nPipeline (total):');
  console.log(`  p50: ${fmt(results.pipeline.p50)}ms  p95: ${fmt(results.pipeline.p95)}ms  p99: ${fmt(results.pipeline.p99)}ms`);
  console.log(`  Target: <${TARGETS.pipeline.target}ms  Hard limit: <${TARGETS.pipeline.hardLimit}ms`);
  console.log(`  Status: ${results.pipeline.p95 < TARGETS.pipeline.target ? 'PASS' : results.pipeline.p95 < TARGETS.pipeline.hardLimit ? 'WARN' : 'FAIL'}`);

  console.log('\nFormatter (isolated):');
  console.log(`  p50: ${fmt(results.formatter.p50)}ms  p95: ${fmt(results.formatter.p95)}ms  p99: ${fmt(results.formatter.p99)}ms`);
  console.log(`  Target: <${TARGETS.layerL0.target}ms  Hard limit: <${TARGETS.layerL0.hardLimit}ms`);
  console.log(`  Status: ${results.formatter.p95 < TARGETS.layerL0.target ? 'PASS' : results.formatter.p95 < TARGETS.layerL0.hardLimit ? 'WARN' : 'FAIL'}`);

  console.log('\nStartup (.synapse/ discovery):');
  console.log(`  p50: ${fmt(results.startup.p50)}ms  p95: ${fmt(results.startup.p95)}ms  p99: ${fmt(results.startup.p99)}ms`);
  console.log(`  Target: <${TARGETS.startup.target}ms  Hard limit: <${TARGETS.startup.hardLimit}ms`);

  console.log('\nSession I/O:');
  console.log(`  p50: ${fmt(results.sessionIO.p50)}ms  p95: ${fmt(results.sessionIO.p95)}ms  p99: ${fmt(results.sessionIO.p99)}ms`);
  console.log(`  Target: <${TARGETS.sessionIO.target}ms  Hard limit: <${TARGETS.sessionIO.hardLimit}ms`);

  console.log('\nPer-Layer Timings:');
  console.log('-'.repeat(80));
  console.log(
    'Layer'.padEnd(20),
    'p50'.padStart(8),
    'p95'.padStart(8),
    'p99'.padStart(8),
    'Target'.padStart(10),
    'Status'.padStart(10),
  );
  console.log('-'.repeat(80));

  for (const [name, stats] of Object.entries(results.layers)) {
    const isEdge = name === 'constitution' || name === 'star-command';
    const target = isEdge ? TARGETS.layerL0 : TARGETS.layer;
    const status = stats.p95 < target.target ? 'PASS' : stats.p95 < target.hardLimit ? 'WARN' : 'FAIL';

    console.log(
      name.padEnd(20),
      fmt(stats.p50).padStart(8),
      fmt(stats.p95).padStart(8),
      fmt(stats.p99).padStart(8),
      `<${target.target}ms`.padStart(10),
      status.padStart(10),
    );
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Mode: ${mode} | Iterations: ${iterations} | Warmup: ${WARMUP_ITERATIONS}`);
  console.log('='.repeat(80));

  return results;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  runBenchmark(parseArgs()).catch((err) => {
    console.error('Benchmark failed:', err);
    process.exit(1);
  });
}

module.exports = { runBenchmark, calcStats, percentile, TARGETS };
