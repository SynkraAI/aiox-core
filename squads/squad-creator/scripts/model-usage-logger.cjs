#!/usr/bin/env node
/**
 * Model Usage Logger for Squad Creator Token Economy
 *
 * Tracks which model tier is used for each task to prove/disprove
 * the token optimization system is working.
 *
 * Usage:
 *   node model-usage-logger.cjs log <task> <model> [tokens_in] [tokens_out] [latency_ms]
 *   node model-usage-logger.cjs report [--days N]
 *   node model-usage-logger.cjs validate <task>
 *
 * Examples:
 *   node model-usage-logger.cjs log validate-squad.md haiku 1500 800 2300
 *   node model-usage-logger.cjs report
 *   node model-usage-logger.cjs validate validate-squad.md
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Paths
const SQUAD_ROOT = path.join(__dirname, '..');
const METRICS_DIR = path.join(SQUAD_ROOT, '../../outputs/metrics');
const CONFIG_PATH = path.join(SQUAD_ROOT, 'config/model-routing.yaml');
const LOG_PATH = path.join(METRICS_DIR, 'model-usage.jsonl');

// Ensure metrics dir exists
if (!fs.existsSync(METRICS_DIR)) {
  fs.mkdirSync(METRICS_DIR, { recursive: true });
}

// Load routing config
function loadConfig() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return yaml.load(content);
  } catch (e) {
    console.error(`Error loading config: ${e.message}`);
    return null;
  }
}

// Get expected tier for a task
function getExpectedTier(taskName, config) {
  if (!config || !config.tasks) return 'opus'; // default
  const task = config.tasks[taskName];
  return task ? task.tier : 'opus';
}

// Log a model usage event
function logUsage(task, model, tokensIn = 0, tokensOut = 0, latencyMs = 0) {
  const config = loadConfig();
  const expectedTier = getExpectedTier(task, config);
  const isCorrect = model === expectedTier;

  const entry = {
    timestamp: new Date().toISOString(),
    task,
    model_used: model,
    model_expected: expectedTier,
    correct: isCorrect,
    tokens_in: parseInt(tokensIn) || 0,
    tokens_out: parseInt(tokensOut) || 0,
    latency_ms: parseInt(latencyMs) || 0,
    cost_actual: calculateCost(model, tokensIn, tokensOut),
    cost_if_opus: calculateCost('opus', tokensIn, tokensOut),
    savings: calculateCost('opus', tokensIn, tokensOut) - calculateCost(model, tokensIn, tokensOut),
  };

  // Append to JSONL log
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');

  // Print result
  const status = isCorrect ? '✅' : '❌';
  console.log(`${status} Logged: ${task} → ${model} (expected: ${expectedTier})`);
  if (entry.savings > 0) {
    console.log(`   Savings: $${entry.savings.toFixed(4)} (${((entry.savings / entry.cost_if_opus) * 100).toFixed(1)}%)`);
  }

  return entry;
}

// Calculate cost based on model and tokens
// Prices per 1M tokens - Opus 4.5/4.6 (Feb 2026)
function calculateCost(model, tokensIn, tokensOut) {
  const rates = {
    haiku: { input: 1.00, output: 5.00 },
    sonnet: { input: 3.00, output: 15.00 },
    opus: { input: 5.00, output: 25.00 },
  };
  const rate = rates[model] || rates.opus;
  return (tokensIn * rate.input + tokensOut * rate.output) / 1000000;
}

// Generate usage report
function generateReport(days = 7) {
  if (!fs.existsSync(LOG_PATH)) {
    console.log('No usage data yet. Run some tasks first.');
    return;
  }

  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n');
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const entries = lines
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(e => e && new Date(e.timestamp) > cutoff);

  if (entries.length === 0) {
    console.log(`No data in the last ${days} days.`);
    return;
  }

  // Aggregate stats
  const stats = {
    total: entries.length,
    correct: entries.filter(e => e.correct).length,
    by_model: {},
    by_task: {},
    total_savings: 0,
    total_cost_actual: 0,
    total_cost_if_opus: 0,
  };

  entries.forEach(e => {
    // By model
    stats.by_model[e.model_used] = (stats.by_model[e.model_used] || 0) + 1;

    // By task
    if (!stats.by_task[e.task]) {
      stats.by_task[e.task] = { count: 0, correct: 0, savings: 0 };
    }
    stats.by_task[e.task].count++;
    if (e.correct) stats.by_task[e.task].correct++;
    stats.by_task[e.task].savings += e.savings || 0;

    // Totals
    stats.total_savings += e.savings || 0;
    stats.total_cost_actual += e.cost_actual || 0;
    stats.total_cost_if_opus += e.cost_if_opus || 0;
  });

  // Print report
  console.log('\n' + '='.repeat(60));
  console.log('MODEL ROUTING USAGE REPORT');
  console.log('='.repeat(60));
  console.log(`Period: Last ${days} days`);
  console.log(`Total executions: ${stats.total}`);
  console.log(`Correct routing: ${stats.correct}/${stats.total} (${((stats.correct/stats.total)*100).toFixed(1)}%)`);

  console.log('\n--- By Model ---');
  Object.entries(stats.by_model).forEach(([model, count]) => {
    const pct = ((count / stats.total) * 100).toFixed(1);
    console.log(`  ${model}: ${count} (${pct}%)`);
  });

  console.log('\n--- Cost Analysis ---');
  console.log(`  Actual cost:    $${stats.total_cost_actual.toFixed(4)}`);
  console.log(`  If all Opus:    $${stats.total_cost_if_opus.toFixed(4)}`);
  console.log(`  Total savings:  $${stats.total_savings.toFixed(4)}`);
  if (stats.total_cost_if_opus > 0) {
    const savingsPct = ((stats.total_savings / stats.total_cost_if_opus) * 100).toFixed(1);
    console.log(`  Savings rate:   ${savingsPct}%`);
  }

  console.log('\n--- Top Tasks (by execution count) ---');
  const sortedTasks = Object.entries(stats.by_task)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  sortedTasks.forEach(([task, data]) => {
    const correctPct = ((data.correct / data.count) * 100).toFixed(0);
    console.log(`  ${task}: ${data.count}x (${correctPct}% correct, $${data.savings.toFixed(4)} saved)`);
  });

  console.log('\n' + '='.repeat(60));
}

// Validate expected tier for a task
function validateTask(taskName) {
  const config = loadConfig();
  const expected = getExpectedTier(taskName, config);
  const taskConfig = config?.tasks?.[taskName];

  console.log('\n--- Task Validation ---');
  console.log(`Task: ${taskName}`);
  console.log(`Expected tier: ${expected}`);

  if (taskConfig) {
    console.log(`Confidence: ${taskConfig.confidence || 'unknown'}`);
    console.log(`Reason: ${taskConfig.reason || 'not specified'}`);
  } else {
    console.log('⚠️  Task not found in config - will use opus (default)');
  }

  return expected;
}

// CLI handler
const [,, command, ...args] = process.argv;

switch (command) {
  case 'log':
    if (args.length < 2) {
      console.log('Usage: node model-usage-logger.cjs log <task> <model> [tokens_in] [tokens_out] [latency_ms]');
      process.exit(1);
    }
    logUsage(...args);
    break;

  case 'report':
    const days = args[0] === '--days' ? parseInt(args[1]) || 7 : 7;
    generateReport(days);
    break;

  case 'validate':
    if (!args[0]) {
      console.log('Usage: node model-usage-logger.cjs validate <task>');
      process.exit(1);
    }
    validateTask(args[0]);
    break;

  default:
    console.log(`
Model Usage Logger - Squad Creator Token Economy

Commands:
  log <task> <model> [tokens_in] [tokens_out] [latency_ms]
    Log a model usage event

  report [--days N]
    Generate usage report (default: last 7 days)

  validate <task>
    Check expected tier for a task

Examples:
  node model-usage-logger.cjs log validate-squad.md haiku 1500 800 2300
  node model-usage-logger.cjs report --days 30
  node model-usage-logger.cjs validate qa-after-creation.md
`);
}
