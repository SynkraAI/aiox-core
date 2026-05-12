#!/usr/bin/env node

/**
 * Pipeline Benchmark Script
 *
 * Story ACT-11: Performance benchmarking for UnifiedActivationPipeline.
 * Measures activation time for all 12 agents across multiple iterations.
 * Reports p50/p95/p99 per loader and total pipeline.
 *
 * Usage:
 *   node tests/benchmarks/pipeline-benchmark.js [--warm] [--cold] [--agents=dev,qa] [--iterations=10]
 *
 * Flags:
 *   --warm       Warm-start benchmark (reuse Node process, default)
 *   --cold       Cold-start benchmark (clears require cache between runs)
 *   --agents=X   Comma-separated list of agents to test (default: all 12)
 *   --iterations=N  Number of iterations per agent (default: 10)
 *
 * Output:
 *   Console table with p50/p95/p99 per agent + per loader
 *
 * @module tests/benchmarks/pipeline-benchmark
 */

'use strict';

const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Pipeline module paths for cache clearing (cold-start)
const PIPELINE_MODULES = [
  '.aiox-core/development/scripts/unified-activation-pipeline',
  '.aiox-core/development/scripts/greeting-builder',
  '.aiox-core/development/scripts/agent-config-loader',
  '.aiox-core/development/scripts/greeting-preference-manager',
  '.aiox-core/development/scripts/workflow-navigator',
  '.aiox-core/core/session/context-loader',
  '.aiox-core/core/session/context-detector',
  '.aiox-core/core/permissions',
  '.aiox-core/infrastructure/scripts/project-status-loader',
  '.aiox-core/infrastructure/scripts/git-config-detector',
  '.aiox-core/core/config/config-resolver',
  '.aiox-core/core/config/config-cache',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    warm: true,
    cold: false,
    agents: null,
    iterations: 10,
  };

  for (const arg of args) {
    if (arg === '--cold') {
      options.cold = true;
      options.warm = false;
    } else if (arg === '--warm') {
      options.warm = true;
      options.cold = false;
    } else if (arg.startsWith('--agents=')) {
      options.agents = arg.split('=')[1].split(',').map(s => s.trim());
    } else if (arg.startsWith('--iterations=')) {
      options.iterations = parseInt(arg.split('=')[1], 10) || 10;
    }
  }

  return options;
}

function percentile(sorted, p) {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function clearPipelineCache() {
  for (const modulePath of PIPELINE_MODULES) {
    try {
      const fullPath = path.resolve(PROJECT_ROOT, modulePath);
      const resolved = require.resolve(fullPath);
      if (require.cache[resolved]) {
        delete require.cache[resolved];
      }
    } catch {
      // Module not found — skip silently
    }
  }
}

async function runBenchmark(options) {
  const pipelinePath = path.resolve(
    PROJECT_ROOT, '.aiox-core/development/scripts/unified-activation-pipeline',
  );
  const { ALL_AGENT_IDS } = require(pipelinePath);
  let { UnifiedActivationPipeline } = require(pipelinePath);

  const agents = options.agents || [...ALL_AGENT_IDS];
  const iterations = options.iterations;
  const mode = options.cold ? 'cold' : 'warm';

  console.log(`\nPipeline Benchmark — ${mode} start, ${iterations} iterations per agent`);
  console.log(`Agents: ${agents.join(', ')}\n`);

  const results = {};

  for (const agentId of agents) {
    results[agentId] = {
      durations: [],
      qualities: { full: 0, partial: 0, fallback: 0 },
      loaderTimings: {},
    };

    for (let i = 0; i < iterations; i++) {
      if (options.cold) {
        clearPipelineCache();
        // Re-require for true cold-start: fresh module bindings
        const freshModule = require(pipelinePath);
        UnifiedActivationPipeline = freshModule.UnifiedActivationPipeline;
      }

      const pipeline = new UnifiedActivationPipeline({ projectRoot: PROJECT_ROOT });

      try {
        const result = await pipeline.activate(agentId);
        results[agentId].durations.push(result.duration);
        results[agentId].qualities[result.quality]++;

        // Collect per-loader timings
        if (result.metrics && result.metrics.loaders) {
          for (const [loaderName, data] of Object.entries(result.metrics.loaders)) {
            if (!results[agentId].loaderTimings[loaderName]) {
              results[agentId].loaderTimings[loaderName] = [];
            }
            results[agentId].loaderTimings[loaderName].push(data.duration);
          }
        }
      } catch (error) {
        console.error(`  Error activating ${agentId} (iteration ${i + 1}):`, error.message);
        results[agentId].durations.push(-1);
        results[agentId].qualities.fallback++;
      }
    }
  }

  // --- Report ---
  console.log('='.repeat(90));
  console.log('PIPELINE RESULTS (ms)');
  console.log('='.repeat(90));
  console.log(
    'Agent'.padEnd(20),
    'p50'.padStart(8),
    'p95'.padStart(8),
    'p99'.padStart(8),
    'Quality'.padStart(20),
  );
  console.log('-'.repeat(90));

  const allDurations = [];

  for (const agentId of agents) {
    const sorted = results[agentId].durations.filter(d => d >= 0).sort((a, b) => a - b);
    if (sorted.length === 0) continue;

    allDurations.push(...sorted);

    const p50 = percentile(sorted, 50);
    const p95 = percentile(sorted, 95);
    const p99 = percentile(sorted, 99);
    const q = results[agentId].qualities;
    const qualityStr = `F:${q.full} P:${q.partial} FB:${q.fallback}`;

    console.log(
      agentId.padEnd(20),
      String(p50).padStart(8),
      String(p95).padStart(8),
      String(p99).padStart(8),
      qualityStr.padStart(20),
    );
  }

  // Aggregate
  const sortedAll = allDurations.sort((a, b) => a - b);
  if (sortedAll.length > 0) {
    console.log('-'.repeat(90));
    console.log(
      'AGGREGATE'.padEnd(20),
      String(percentile(sortedAll, 50)).padStart(8),
      String(percentile(sortedAll, 95)).padStart(8),
      String(percentile(sortedAll, 99)).padStart(8),
    );
  }

  // Loader breakdown
  console.log('\n' + '='.repeat(90));
  console.log('PER-LOADER TIMINGS (ms) — aggregated across all agents');
  console.log('='.repeat(90));
  console.log(
    'Loader'.padEnd(20),
    'p50'.padStart(8),
    'p95'.padStart(8),
    'p99'.padStart(8),
    'max'.padStart(8),
  );
  console.log('-'.repeat(90));

  const loaderAgg = {};
  for (const agentId of agents) {
    for (const [loaderName, timings] of Object.entries(results[agentId].loaderTimings)) {
      if (!loaderAgg[loaderName]) {
        loaderAgg[loaderName] = [];
      }
      loaderAgg[loaderName].push(...timings);
    }
  }

  for (const [loaderName, timings] of Object.entries(loaderAgg)) {
    const sorted = timings.sort((a, b) => a - b);
    console.log(
      loaderName.padEnd(20),
      String(percentile(sorted, 50)).padStart(8),
      String(percentile(sorted, 95)).padStart(8),
      String(percentile(sorted, 99)).padStart(8),
      String(sorted[sorted.length - 1]).padStart(8),
    );
  }

  console.log('\n' + '='.repeat(90));

  // Summary
  const totalFallbacks = agents.reduce((acc, id) => acc + results[id].qualities.fallback, 0);
  const totalRuns = agents.length * iterations;
  const fallbackRate = ((totalFallbacks / totalRuns) * 100).toFixed(1);

  console.log(`Total runs: ${totalRuns}`);
  console.log(`Fallback rate: ${fallbackRate}%`);
  console.log(`Mode: ${mode}`);
  console.log('='.repeat(90));
}

runBenchmark(parseArgs()).catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
