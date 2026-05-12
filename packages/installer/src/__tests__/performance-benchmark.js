#!/usr/bin/env node

/**
 * AIOX Installer Performance Benchmark
 * Story INS-2: Installer Performance Optimization
 *
 * Measures baseline performance metrics for the installer to track optimization progress.
 *
 * Usage:
 *   node performance-benchmark.js [--output <file>] [--runs <n>]
 *
 * Output:
 *   JSON report with phase timings and statistics
 */

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  runs: 3, // Number of runs for averaging
  outputFile: null, // Output file path (null = stdout)
  testProjectSize: 1000, // Number of files for test project
  verbose: false,
};

// Parse CLI arguments
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg === '--output' && arr[i + 1]) CONFIG.outputFile = arr[i + 1];
  if (arg === '--runs' && arr[i + 1]) CONFIG.runs = parseInt(arr[i + 1], 10);
  if (arg === '--verbose' || arg === '-v') CONFIG.verbose = true;
  if (arg === '--help' || arg === '-h') {
    console.log(`
AIOX Installer Performance Benchmark

Usage: node performance-benchmark.js [options]

Options:
  --output <file>   Save JSON report to file (default: stdout)
  --runs <n>        Number of benchmark runs (default: 3)
  --verbose, -v     Show detailed progress
  --help, -h        Show this help

Example:
  node performance-benchmark.js --output baseline.json --runs 5
`);
    process.exit(0);
  }
});

// Benchmark results structure
const results = {
  timestamp: new Date().toISOString(),
  system: {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cpus: require('os').cpus().length,
    totalMemory: Math.round(require('os').totalmem() / 1024 / 1024) + ' MB',
  },
  config: { ...CONFIG },
  phases: {},
  summary: {},
};

/**
 * Timer utility for measuring phase durations
 */
class Timer {
  constructor(name) {
    this.name = name;
    this.start = null;
    this.end = null;
    this.runs = [];
  }

  begin() {
    this.start = performance.now();
  }

  stop() {
    this.end = performance.now();
    const duration = this.end - this.start;
    this.runs.push(duration);
    return duration;
  }

  getStats() {
    if (this.runs.length === 0) return null;
    const sorted = [...this.runs].sort((a, b) => a - b);
    return {
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1]),
      avg: Math.round(this.runs.reduce((a, b) => a + b, 0) / this.runs.length),
      median: Math.round(sorted[Math.floor(sorted.length / 2)]),
      runs: this.runs.map((r) => Math.round(r)),
      unit: 'ms',
    };
  }
}

// Phase timers
const timers = {
  directoryRead: new Timer('Directory Read (readdirSync)'),
  directoryReadWithTypes: new Timer('Directory Read (withFileTypes)'),
  statLoop: new Timer('Stat Loop (statSync per file)'),
  realpathSingle: new Timer('Realpath (single call)'),
  realpathDouble: new Timer('Realpath (double call - current)'),
  hashSequential: new Timer('Hash Files (sequential)'),
  hashParallelBatch: new Timer('Hash Files (parallel batch)'),
  fileCopySequential: new Timer('File Copy (sequential)'),
  fileCopyParallel: new Timer('File Copy (parallel)'),
  totalInstallSimulation: new Timer('Total Install Simulation'),
};

/**
 * Log if verbose mode is enabled
 */
function log(msg) {
  if (CONFIG.verbose) console.log(`[benchmark] ${msg}`);
}

/**
 * Get the .aiox-core directory for benchmarking
 */
function getAioxCoreDir() {
  const projectRoot = path.resolve(__dirname, '../../../../');
  return path.join(projectRoot, '.aiox-core');
}

/**
 * Benchmark: Directory read comparison
 */
async function benchmarkDirectoryRead(dir) {
  const files = fs.readdirSync(dir);

  // Method 1: readdirSync + statSync for each
  timers.statLoop.begin();
  for (const file of files) {
    const fullPath = path.join(dir, file);
    fs.statSync(fullPath).isDirectory();
  }
  timers.statLoop.stop();

  // Method 2: readdirSync with withFileTypes
  timers.directoryReadWithTypes.begin();
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    entry.isDirectory();
  }
  timers.directoryReadWithTypes.stop();

  return files.length;
}

/**
 * Benchmark: Realpath comparison
 */
async function benchmarkRealpath(files) {
  const sampleFiles = files.slice(0, 100); // Sample 100 files

  // Method 1: Single realpath call
  timers.realpathSingle.begin();
  for (const file of sampleFiles) {
    fs.realpathSync(file);
  }
  timers.realpathSingle.stop();

  // Method 2: Double realpath call (current behavior)
  timers.realpathDouble.begin();
  for (const file of sampleFiles) {
    fs.realpathSync(file);
    fs.realpathSync(path.dirname(file)); // Simulates the duplicate call
  }
  timers.realpathDouble.stop();
}

/**
 * Benchmark: File hashing comparison
 */
async function benchmarkHashing(files) {
  const sampleFiles = files.slice(0, 200); // Sample 200 files for hashing

  // Method 1: Sequential hashing
  timers.hashSequential.begin();
  for (const file of sampleFiles) {
    try {
      const content = fs.readFileSync(file);
      crypto.createHash('sha256').update(content).digest('hex');
    } catch {
      // Skip files that can't be read
    }
  }
  timers.hashSequential.stop();

  // Method 2: Parallel batch hashing
  timers.hashParallelBatch.begin();
  const batchSize = 50;
  for (let i = 0; i < sampleFiles.length; i += batchSize) {
    const batch = sampleFiles.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const content = await fse.readFile(file);
          crypto.createHash('sha256').update(content).digest('hex');
        } catch {
          // Skip files that can't be read
        }
      }),
    );
  }
  timers.hashParallelBatch.stop();
}

/**
 * Collect all files recursively
 */
function collectFiles(dir, maxFiles = 1000) {
  const files = [];

  function walk(currentDir) {
    if (files.length >= maxFiles) return;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (files.length >= maxFiles) break;

        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  walk(dir);
  return files;
}

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
  const aioxCoreDir = getAioxCoreDir();

  if (!fs.existsSync(aioxCoreDir)) {
    console.error(`Error: .aiox-core directory not found at ${aioxCoreDir}`);
    process.exit(1);
  }

  log(`Starting benchmark with ${CONFIG.runs} runs`);
  log(`Using .aiox-core at: ${aioxCoreDir}`);

  // Collect files for benchmarking
  log('Collecting files...');
  const allFiles = collectFiles(aioxCoreDir, CONFIG.testProjectSize);
  log(`Collected ${allFiles.length} files`);

  results.fileCount = allFiles.length;

  // Run benchmarks multiple times
  for (let run = 1; run <= CONFIG.runs; run++) {
    log(`\n--- Run ${run}/${CONFIG.runs} ---`);

    // Directory read benchmarks
    const agentsDir = path.join(aioxCoreDir, 'development', 'agents');
    if (fs.existsSync(agentsDir)) {
      log('Benchmarking directory read...');
      await benchmarkDirectoryRead(agentsDir);
    }

    // Realpath benchmarks
    log('Benchmarking realpath...');
    await benchmarkRealpath(allFiles);

    // Hashing benchmarks
    log('Benchmarking file hashing...');
    await benchmarkHashing(allFiles);

    // Total simulation
    log('Running total install simulation...');
    timers.totalInstallSimulation.begin();

    // Simulate full install: read dirs + hash files
    const devDir = path.join(aioxCoreDir, 'development');
    if (fs.existsSync(devDir)) {
      const subdirs = fs.readdirSync(devDir, { withFileTypes: true });
      for (const subdir of subdirs) {
        if (subdir.isDirectory()) {
          const fullSubdir = path.join(devDir, subdir.name);
          fs.readdirSync(fullSubdir);
        }
      }
    }

    // Simulate sequential file processing
    for (const file of allFiles.slice(0, 500)) {
      try {
        fs.statSync(file);
        fs.readFileSync(file);
      } catch {
        // Skip
      }
    }

    timers.totalInstallSimulation.stop();
  }

  // Compile results
  log('\nCompiling results...');

  for (const [name, timer] of Object.entries(timers)) {
    const stats = timer.getStats();
    if (stats) {
      results.phases[name] = {
        description: timer.name,
        ...stats,
      };
    }
  }

  // Calculate summary
  const hashSeq = results.phases.hashSequential?.avg || 0;
  const hashPar = results.phases.hashParallelBatch?.avg || 0;
  const realpathSingle = results.phases.realpathSingle?.avg || 0;
  const realpathDouble = results.phases.realpathDouble?.avg || 0;
  const statLoop = results.phases.statLoop?.avg || 0;
  const withTypes = results.phases.directoryReadWithTypes?.avg || 0;

  results.summary = {
    totalFiles: results.fileCount,
    hashingSpeedup: hashSeq > 0 ? `${(hashSeq / hashPar).toFixed(2)}x` : 'N/A',
    realpathSavings: realpathDouble > 0 ? `${Math.round(((realpathDouble - realpathSingle) / realpathDouble) * 100)}%` : 'N/A',
    statLoopSavings: statLoop > 0 ? `${Math.round(((statLoop - withTypes) / statLoop) * 100)}%` : 'N/A',
    estimatedTotalTime: results.phases.totalInstallSimulation?.avg || 0,
    target: '<30000ms for 1000 files',
    baseline: `${results.phases.totalInstallSimulation?.avg || 'TBD'}ms`,
  };

  // Output results
  const output = JSON.stringify(results, null, 2);

  if (CONFIG.outputFile) {
    fs.writeFileSync(CONFIG.outputFile, output);
    console.log(`Benchmark results saved to: ${CONFIG.outputFile}`);
  } else {
    console.log(output);
  }

  // Print summary to stderr for visibility
  console.error('\n' + '='.repeat(60));
  console.error('AIOX Installer Performance Baseline');
  console.error('='.repeat(60));
  console.error(`Files analyzed: ${results.fileCount}`);
  console.error(`Runs: ${CONFIG.runs}`);
  console.error('');
  console.error('Phase Results (avg ms):');
  console.error(`  Directory stat loop:     ${statLoop}ms`);
  console.error(`  Directory withFileTypes: ${withTypes}ms (${results.summary.statLoopSavings} faster)`);
  console.error(`  Realpath single:         ${realpathSingle}ms`);
  console.error(`  Realpath double:         ${realpathDouble}ms (${results.summary.realpathSavings} overhead)`);
  console.error(`  Hash sequential:         ${hashSeq}ms`);
  console.error(`  Hash parallel:           ${hashPar}ms (${results.summary.hashingSpeedup} faster)`);
  console.error('');
  console.error(`Total Install Simulation:  ${results.summary.baseline}`);
  console.error(`Target:                    ${results.summary.target}`);
  console.error('='.repeat(60));
}

// Run benchmarks
runBenchmarks().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
