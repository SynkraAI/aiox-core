#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
  };
}

function countMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  return fs.readdirSync(dirPath).filter((f) => f.endsWith('.md')).length;
}

function validateClaudeIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const rulesFile = options.rulesFile || path.join(projectRoot, '.claude', 'CLAUDE.md');
  const agentsDir = options.agentsDir || path.join(projectRoot, '.claude', 'commands', 'AIOX', 'agents');
  const hooksDir = options.hooksDir || path.join(projectRoot, '.claude', 'hooks');
  const sourceAgentsDir =
    options.sourceAgentsDir || path.join(projectRoot, '.aiox-core', 'development', 'agents');

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(agentsDir)) {
    errors.push(`Missing Claude agents dir: ${path.relative(projectRoot, agentsDir)}`);
  }
  if (!fs.existsSync(rulesFile)) {
    warnings.push(`Claude rules file not found yet: ${path.relative(projectRoot, rulesFile)}`);
  }
  if (!fs.existsSync(hooksDir)) {
    warnings.push(`Claude hooks dir not found yet: ${path.relative(projectRoot, hooksDir)}`);
  }

  const sourceCount = countMarkdownFiles(sourceAgentsDir);
  const claudeCount = countMarkdownFiles(agentsDir);
  if (sourceCount > 0 && claudeCount !== sourceCount) {
    warnings.push(`Claude agent count differs from source (${claudeCount}/${sourceCount})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceCount,
      claudeAgents: claudeCount,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [`✅ Claude integration validation passed (agents: ${result.metrics.claudeAgents})`];
    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
    }
    return lines.join('\n');
  }
  const lines = [
    `❌ Claude integration validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((e) => `- ${e}`),
  ];
  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateClaudeIntegration(args);

  if (!args.quiet) {
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatHumanReport(result));
    }
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateClaudeIntegration,
  parseArgs,
  countMarkdownFiles,
};
