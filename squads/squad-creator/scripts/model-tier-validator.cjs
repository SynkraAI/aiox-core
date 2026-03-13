#!/usr/bin/env node
/**
 * Model Tier Validator for Squad Creator Token Economy
 *
 * Validates tasks against Opus/Sonnet/Haiku to determine optimal tier.
 *
 * Usage:
 *   node model-tier-validator.cjs validate <task-name>
 *   node model-tier-validator.cjs list
 *   node model-tier-validator.cjs report
 *   node model-tier-validator.cjs update-routing <task-name> <tier> [reason]
 *
 * Examples:
 *   node model-tier-validator.cjs validate pv-axioma-assessment
 *   node model-tier-validator.cjs list
 *   node model-tier-validator.cjs report
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Paths
const SQUAD_ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(SQUAD_ROOT, 'config/scoring-rubric.yaml');
const TEST_CASES_DIR = path.join(SQUAD_ROOT, 'test-cases');
const ROUTING_CONFIG = path.join(SQUAD_ROOT, 'config/model-routing.yaml');
// Note: Results are stored inside test-cases/{task-name}/ alongside test-case.yaml

// Ensure test-cases directory exists
if (!fs.existsSync(TEST_CASES_DIR)) {
  fs.mkdirSync(TEST_CASES_DIR, { recursive: true });
}

// Load scoring rubric
function loadRubric() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return yaml.load(content);
  } catch (e) {
    console.error(`Error loading rubric: ${e.message}`);
    return null;
  }
}

// Load test case
function loadTestCase(taskName) {
  // New structure: test-cases/{task-name}/test-case.yaml
  let testCasePath = path.join(TEST_CASES_DIR, taskName, 'test-case.yaml');

  // Fallback to old structure: test-cases/{task-name}.yaml
  if (!fs.existsSync(testCasePath)) {
    testCasePath = path.join(TEST_CASES_DIR, `${taskName}.yaml`);
  }

  try {
    const content = fs.readFileSync(testCasePath, 'utf8');
    return yaml.load(content);
  } catch (e) {
    console.error(`Error loading test case: ${e.message}`);
    return null;
  }
}

// Load routing config
function loadRouting() {
  try {
    const content = fs.readFileSync(ROUTING_CONFIG, 'utf8');
    return yaml.load(content);
  } catch (e) {
    console.error(`Error loading routing config: ${e.message}`);
    return null;
  }
}

// Calculate score for an output against baseline
function calculateScore(output, baseline, testCase, rubric) {
  const scores = {};
  let totalScore = 0;

  // For each dimension in rubric
  for (const [dimName, dimConfig] of Object.entries(rubric.dimensions)) {
    // This would need actual comparison logic
    // For now, placeholder scoring
    const dimScore = evaluateDimension(dimName, output, baseline, testCase);
    scores[dimName] = {
      score: dimScore,
      weight: dimConfig.weight,
      weighted: dimScore * dimConfig.weight,
    };
    totalScore += dimScore * dimConfig.weight;
  }

  return {
    total: totalScore,
    dimensions: scores,
    percentage: (totalScore / 10) * 100,
  };
}

// Evaluate a single dimension
// Uses pre-recorded scores from test case if available, otherwise returns null for manual scoring
function evaluateDimension(dimName, output, baseline, testCase) {
  // If test case has pre-recorded dimension scores, use them
  if (testCase.results) {
    for (const model of ['haiku', 'sonnet', 'opus']) {
      if (testCase.results[model] && testCase.results[model].dimensions) {
        const dimResult = testCase.results[model].dimensions[dimName];
        if (dimResult && typeof dimResult.score === 'number') {
          return dimResult.score;
        }
      }
    }
  }

  // If overall score exists, distribute proportionally across dimensions
  if (testCase.results && testCase.results.haiku && testCase.results.haiku.score) {
    // Use the overall score as approximation for each dimension
    return testCase.results.haiku.score;
  }

  // No pre-recorded data - return null to indicate manual scoring needed
  return null;
}

// Determine tier recommendation
function recommendTier(results, rubric) {
  const { haiku, sonnet, opus } = results;

  if (haiku && haiku.percentage >= rubric.thresholds.haiku * 100) {
    return {
      tier: 'haiku',
      reason: `Haiku score (${haiku.percentage.toFixed(1)}%) >= threshold (${rubric.thresholds.haiku * 100}%)`,
      savings: '93%',
    };
  }

  if (sonnet && sonnet.percentage >= rubric.thresholds.sonnet * 100) {
    return {
      tier: 'sonnet',
      reason: `Sonnet score (${sonnet.percentage.toFixed(1)}%) >= threshold (${rubric.thresholds.sonnet * 100}%)`,
      savings: '80%',
    };
  }

  return {
    tier: 'opus',
    reason: 'Neither Haiku nor Sonnet met quality threshold',
    savings: '0%',
  };
}

// Generate comparison report
function generateReport(taskName, results, recommendation) {
  const report = {
    task: taskName,
    timestamp: new Date().toISOString(),
    results: {
      haiku: results.haiku ? {
        score: results.haiku.total.toFixed(2),
        percentage: results.haiku.percentage.toFixed(1) + '%',
        qualified: results.haiku.percentage >= 90,
      } : null,
      sonnet: results.sonnet ? {
        score: results.sonnet.total.toFixed(2),
        percentage: results.sonnet.percentage.toFixed(1) + '%',
        qualified: results.sonnet.percentage >= 95,
      } : null,
      opus: {
        score: '10.00',
        percentage: '100%',
        qualified: true,
      },
    },
    recommendation: recommendation,
    compensation_needed: recommendation.tier !== 'haiku' && results.haiku && results.haiku.percentage < 90,
  };

  return report;
}

// Print comparison table
function printComparisonTable(reports) {
  console.log('\n' + '='.repeat(80));
  console.log('MODEL TIER QUALIFICATION REPORT');
  console.log('='.repeat(80));
  console.log('');
  console.log('| Task | Haiku | Sonnet | Opus | Recommended | Savings |');
  console.log('|------|-------|--------|------|-------------|---------|');

  for (const report of reports) {
    const haiku = report.results.haiku?.percentage != null ? `${report.results.haiku.percentage}%` : 'N/A';
    const sonnet = report.results.sonnet?.percentage != null ? `${report.results.sonnet.percentage}%` : 'N/A';
    const opus = report.results.opus?.percentage != null ? `${report.results.opus.percentage}%` : '100%';
    const rec = report.recommendation.tier.toUpperCase();
    const savings = report.recommendation.savings;

    console.log(`| ${report.task.padEnd(20)} | ${haiku.padEnd(5)} | ${sonnet.padEnd(6)} | ${opus.padEnd(4)} | ${rec.padEnd(11)} | ${savings.padEnd(7)} |`);
  }

  console.log('');
  console.log('='.repeat(80));
}

// List all test cases
function listTestCases() {
  const entries = fs.readdirSync(TEST_CASES_DIR, { withFileTypes: true });
  const cases = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      // New structure: test-cases/{task-name}/test-case.yaml
      const testCasePath = path.join(TEST_CASES_DIR, entry.name, 'test-case.yaml');
      if (fs.existsSync(testCasePath)) {
        cases.push(entry.name);
      }
    } else if (entry.isFile() && entry.name.endsWith('.yaml') && !entry.name.startsWith('_')) {
      // Old structure: test-cases/{task-name}.yaml
      cases.push(entry.name.replace('.yaml', ''));
    }
  }

  return cases;
}

// Update routing config with validated tier
function updateRoutingConfig(taskName, tier, reason) {
  const routing = loadRouting();
  if (!routing || !routing.tasks) return false;

  const taskKey = `${taskName}.md`;
  if (routing.tasks[taskKey]) {
    routing.tasks[taskKey].tier = tier;
    routing.tasks[taskKey].validated = true;
    routing.tasks[taskKey].validation_reason = reason;
    routing.tasks[taskKey].validated_date = new Date().toISOString().split('T')[0];

    fs.writeFileSync(ROUTING_CONFIG, yaml.dump(routing, { lineWidth: 120 }));
    return true;
  }

  return false;
}

// CLI handler
const [,, command, ...args] = process.argv;

switch (command) {
  case 'validate':
    const taskName = args[0];
    if (!taskName) {
      console.log('Usage: node model-tier-validator.cjs validate <task-name>');
      process.exit(1);
    }

    const rubric = loadRubric();
    const testCase = loadTestCase(taskName);

    if (!rubric || !testCase) {
      console.error('Failed to load required files');
      process.exit(1);
    }

    console.log(`\nValidating: ${taskName}`);
    console.log('Test case loaded:', testCase.test_case.name);
    console.log('');

    // Show test case info
    console.log('Input:', testCase.input.target);
    console.log('Expected sections:', testCase.expected_output.sections.join(', '));
    console.log('');

    // Show current results if available
    if (testCase.results) {
      console.log('--- Current Results ---');
      if (testCase.results.haiku && testCase.results.haiku.score) {
        console.log(`Haiku:  ${testCase.results.haiku.percentage}% - ${testCase.results.haiku.qualified ? '✅ Qualified' : '❌ Not qualified'}`);
      }
      if (testCase.results.sonnet && testCase.results.sonnet.score) {
        console.log(`Sonnet: ${testCase.results.sonnet.percentage}% - ${testCase.results.sonnet.qualified ? '✅ Qualified' : '❌ Not qualified'}`);
      }
      console.log(`Opus:   ${testCase.results.opus.percentage}% - ✅ Baseline`);
      console.log('');
      console.log(`Final tier: ${testCase.results.final_tier || 'Not determined'}`);
      console.log(`Recommendation: ${testCase.results.recommendation || 'None'}`);
    }
    break;

  case 'list':
    const tasks = listTestCases();
    console.log('\nAvailable test cases:');
    tasks.forEach(t => console.log(`  - ${t}`));
    console.log(`\nTotal: ${tasks.length} test cases`);
    break;

  case 'report':
    const allTasks = listTestCases();
    const reports = [];

    for (const task of allTasks) {
      const tc = loadTestCase(task);
      if (tc && tc.results && tc.results.final_tier) {
        reports.push({
          task,
          results: tc.results,
          recommendation: {
            tier: tc.results.final_tier,
            savings: tc.results.final_tier === 'haiku' ? '93%' :
              tc.results.final_tier === 'sonnet' ? '80%' : '0%',
          },
        });
      }
    }

    if (reports.length === 0) {
      console.log('\nNo validated test cases yet.');
      console.log('Run validation first: node model-tier-validator.cjs validate <task-name>');
    } else {
      printComparisonTable(reports);
    }
    break;

  case 'update-routing':
    const updateTask = args[0];
    const updateTier = args[1];
    const updateReason = args.slice(2).join(' ') || 'Validated via model-tier-validator';

    if (!updateTask || !updateTier) {
      console.log('Usage: node model-tier-validator.cjs update-routing <task-name> <tier> [reason]');
      process.exit(1);
    }

    if (updateRoutingConfig(updateTask, updateTier, updateReason)) {
      console.log(`✅ Updated ${updateTask}.md to tier: ${updateTier}`);
    } else {
      console.log(`❌ Failed to update routing config for ${updateTask}`);
    }
    break;

  default:
    console.log(`
Model Tier Validator - Squad Creator Token Economy

Commands:
  validate <task-name>
    Show validation status for a task

  list
    List all available test cases

  report
    Generate comparison report for all validated tasks

  update-routing <task-name> <tier> [reason]
    Update model-routing.yaml with validated tier

Examples:
  node model-tier-validator.cjs validate pv-axioma-assessment
  node model-tier-validator.cjs list
  node model-tier-validator.cjs report
  node model-tier-validator.cjs update-routing pv-axioma-assessment haiku "Scoring determinístico"

Note:
  Actual model comparison requires running tasks through Claude API.
  This tool manages test cases and tracks results.
  Use the Skill tool to run actual tests:
    /pv-axioma-assessment <input>
`);
}
