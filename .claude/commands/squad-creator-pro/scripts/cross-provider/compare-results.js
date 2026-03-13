#!/usr/bin/env node
/**
 * Cross-Provider Results Comparator
 *
 * Compara resultados de Opus (baseline) vs modelo candidato.
 * Gera relatório de qualificação automático.
 * Usa paths do squad-config.yaml (zero hardcoded paths).
 *
 * Usage:
 *   node compare-results.js --task extract-knowledge --baseline opus --candidate glm5
 */

const fs = require('fs');
const path = require('path');

// Load config (auto-detects project root)
const config = require('../lib/config-loader');

const PATHS = {
  outputDir: config.paths.llmTests,
};

// ============================================================================
// RESULT LOADER
// ============================================================================

function loadLatestResult(taskName, modelName) {
  const dir = path.join(PATHS.outputDir, taskName, modelName);

  if (!fs.existsSync(dir)) {
    return null;
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('run-') && f.endsWith('.yaml'))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  const content = fs.readFileSync(path.join(dir, files[0]), 'utf-8');
  return { file: files[0], content, parsed: parseYaml(content) };
}

function parseYaml(content) {
  const result = {};

  const taskMatch = content.match(/task: "([^"]+)"/);
  const modelMatch = content.match(/model: "([^"]+)"/);
  const hashMatch = content.match(/task_hash: "([^"]+)"/);

  result.task = taskMatch?.[1];
  result.model = modelMatch?.[1];
  result.task_hash = hashMatch?.[1];

  const latencyMatch = content.match(/latency_seconds: ([\d.]+)/);
  const costMatch = content.match(/cost_usd: ([\d.]+)/);
  const promptTokens = content.match(/prompt: (\d+)/);
  const completionTokens = content.match(/completion: (\d+)/);

  result.latency = latencyMatch ? parseFloat(latencyMatch[1]) : null;
  result.cost = costMatch ? parseFloat(costMatch[1]) : null;
  result.tokens = {
    prompt: promptTokens ? parseInt(promptTokens[1]) : null,
    completion: completionTokens ? parseInt(completionTokens[1]) : null,
  };

  const outputMatch = content.match(/output: \|\n([\s\S]+)$/);
  result.output = outputMatch ? outputMatch[1].replace(/^ {2}/gm, '').trim() : null;

  return result;
}

// ============================================================================
// COMPARISON METRICS
// ============================================================================

function compare(baseline, candidate) {
  const metrics = {
    latency: {
      baseline: baseline.latency,
      candidate: candidate.latency,
      ratio: candidate.latency / baseline.latency,
      improvement: `${((1 - candidate.latency / baseline.latency) * 100).toFixed(1)}% faster`,
    },
    cost: {
      baseline: baseline.cost,
      candidate: candidate.cost,
      ratio: candidate.cost / baseline.cost,
      savings: `${((1 - candidate.cost / baseline.cost) * 100).toFixed(1)}% cheaper`,
    },
    tokens: {
      baseline: baseline.tokens,
      candidate: candidate.tokens,
    },
  };

  const baselineLines = baseline.output?.split('\n').length || 0;
  const candidateLines = candidate.output?.split('\n').length || 0;

  metrics.content = {
    baseline_lines: baselineLines,
    candidate_lines: candidateLines,
    ratio: candidateLines / baselineLines,
  };

  return metrics;
}

// ============================================================================
// REPORT GENERATOR
// ============================================================================

function generateReport(taskName, baseline, candidate, comparison) {
  const timestamp = new Date().toISOString();

  let report = `# Cross-Provider Qualification Report

**Task:** ${taskName}
**Baseline:** ${baseline.model} (hash: ${baseline.task_hash})
**Candidate:** ${candidate.model}
**Date:** ${timestamp.split('T')[0]}

---

## Performance Comparison

| Metric | ${baseline.model} | ${candidate.model} | Delta |
|--------|----------|-----------|-------|
| Latency | ${baseline.latency?.toFixed(1)}s | ${candidate.latency?.toFixed(1)}s | ${comparison.latency.improvement} |
| Cost | $${baseline.cost?.toFixed(4)} | $${candidate.cost?.toFixed(4)} | ${comparison.cost.savings} |
| Output Lines | ${comparison.content.baseline_lines} | ${comparison.content.candidate_lines} | ${(comparison.content.ratio * 100).toFixed(0)}% |

---

## Qualification Metrics

### Speed
- **${comparison.latency.ratio < 1 ? '✅' : '❌'} Latency:** ${comparison.latency.improvement}

### Cost
- **${comparison.cost.ratio < 0.5 ? '✅' : '⚠️'} Savings:** ${comparison.cost.savings}

### Content Completeness
- **${comparison.content.ratio > 0.8 ? '✅' : '❌'} Output Volume:** ${(comparison.content.ratio * 100).toFixed(0)}% of baseline

---

## Manual Review Required

- [ ] **Anti-Invention:** Zero unsourced claims?
- [ ] **Accuracy:** Citations correct?
- [ ] **Completeness:** All key items extracted?
- [ ] **Format:** Valid YAML/MD structure?
- [ ] **PT-BR Quality:** Natural Portuguese?

---

## Recommendation

`;

  const speedOK = comparison.latency.ratio < 1;
  const costOK = comparison.cost.ratio < 0.5;
  const sizeOK = comparison.content.ratio > 0.7;

  if (speedOK && costOK && sizeOK) {
    report += `**LIKELY QUALIFIED** ✅

Candidate shows:
- ${comparison.latency.improvement}
- ${comparison.cost.savings}
- ${(comparison.content.ratio * 100).toFixed(0)}% output completeness

Proceed with manual quality review.`;
  } else {
    report += `**NEEDS REVIEW** ⚠️

Potential issues:
${!speedOK ? '- Slower than baseline\n' : ''}${!costOK ? '- Limited cost savings\n' : ''}${!sizeOK ? '- Significantly less output\n' : ''}
Review output quality before qualifying.`;
  }

  report += `

---

## Raw Outputs

### ${baseline.model} Output

\`\`\`yaml
${baseline.output?.slice(0, 2000) || 'N/A'}${baseline.output?.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

### ${candidate.model} Output

\`\`\`yaml
${candidate.output?.slice(0, 2000) || 'N/A'}${candidate.output?.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`
`;

  return report;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Cross-Provider Results Comparator

Usage:
  node compare-results.js --task <name> --baseline <model> --candidate <model>

Options:
  --task       Task name
  --baseline   Baseline model (default: opus)
  --candidate  Candidate model (e.g., glm5)

Paths (from squad-config.yaml):
  Output: ${PATHS.outputDir}

Example:
  node compare-results.js --task extract-knowledge --candidate glm5
    `);
    process.exit(0);
  }

  const getArg = (name, defaultValue = null) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : defaultValue;
  };

  const taskName = getArg('task');
  const baselineModel = getArg('baseline', 'opus');
  const candidateModel = getArg('candidate');

  if (!taskName || !candidateModel) {
    console.error('❌ Missing required arguments. Use --help for usage.');
    process.exit(1);
  }

  console.log(`\n📊 Comparing ${taskName}: ${baselineModel} vs ${candidateModel}\n`);

  const baseline = loadLatestResult(taskName, baselineModel);
  const candidate = loadLatestResult(taskName, candidateModel);

  if (!baseline) {
    console.error(`❌ No baseline results found for ${taskName}/${baselineModel}`);
    process.exit(1);
  }

  if (!candidate) {
    console.error(`❌ No candidate results found for ${taskName}/${candidateModel}`);
    process.exit(1);
  }

  console.log(`✓ Loaded baseline: ${baseline.file}`);
  console.log(`✓ Loaded candidate: ${candidate.file}`);

  const comparison = compare(baseline.parsed, candidate.parsed);
  const report = generateReport(taskName, baseline.parsed, candidate.parsed, comparison);

  const reportPath = path.join(PATHS.outputDir, taskName, candidateModel, 'qualification-report.md');
  fs.writeFileSync(reportPath, report);

  console.log(`\n📄 Report saved: ${reportPath}`);
  console.log(`\n${'='.repeat(50)}`);
  console.log('Quick Summary:');
  console.log(`${'='.repeat(50)}`);
  console.log(`Latency: ${comparison.latency.improvement}`);
  console.log(`Cost:    ${comparison.cost.savings}`);
  console.log(`Output:  ${(comparison.content.ratio * 100).toFixed(0)}% of baseline`);
}

main();
