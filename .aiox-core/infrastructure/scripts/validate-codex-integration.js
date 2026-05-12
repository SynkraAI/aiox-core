#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    instructionsFile: path.join(projectRoot, 'AGENTS.md'),
    agentsDir: path.join(projectRoot, '.codex', 'agents'),
    skillsDir: path.join(projectRoot, '.codex', 'skills'),
    sourceAgentsDir: path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    quiet: false,
    json: false,
  };
}

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

function countSkillFiles(skillsDir) {
  if (!fs.existsSync(skillsDir)) return 0;
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('aiox-'))
    .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .length;
}

function validateCodexIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const resolved = {
    ...getDefaultOptions(),
    ...options,
    projectRoot,
    instructionsFile: options.instructionsFile || path.join(projectRoot, 'AGENTS.md'),
    agentsDir: options.agentsDir || path.join(projectRoot, '.codex', 'agents'),
    skillsDir: options.skillsDir || path.join(projectRoot, '.codex', 'skills'),
    sourceAgentsDir: options.sourceAgentsDir || path.join(projectRoot, '.aiox-core', 'development', 'agents'),
  };
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(resolved.instructionsFile)) {
    warnings.push(
      `Codex instructions file not found yet: ${path.relative(resolved.projectRoot, resolved.instructionsFile)}`,
    );
  }

  if (!fs.existsSync(resolved.agentsDir)) {
    errors.push(`Missing Codex agents dir: ${path.relative(resolved.projectRoot, resolved.agentsDir)}`);
  }

  if (!fs.existsSync(resolved.skillsDir)) {
    errors.push(`Missing Codex skills dir: ${path.relative(resolved.projectRoot, resolved.skillsDir)}`);
  }

  const sourceCount = countMarkdownFiles(resolved.sourceAgentsDir);
  const codexAgentsCount = countMarkdownFiles(resolved.agentsDir);
  const codexSkillsCount = countSkillFiles(resolved.skillsDir);

  if (sourceCount > 0 && codexAgentsCount !== sourceCount) {
    warnings.push(`Codex agent count differs from source (${codexAgentsCount}/${sourceCount})`);
  }

  if (sourceCount > 0 && codexSkillsCount !== sourceCount) {
    warnings.push(`Codex skill count differs from source (${codexSkillsCount}/${sourceCount})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceCount,
      codexAgents: codexAgentsCount,
      codexSkills: codexSkillsCount,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Codex integration validation passed (agents: ${result.metrics.codexAgents}, skills: ${result.metrics.codexSkills})`,
    ];
    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
    }
    return lines.join('\n');
  }
  const lines = [
    `❌ Codex integration validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((e) => `- ${e}`),
  ];
  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateCodexIntegration(args);

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
  validateCodexIntegration,
  parseArgs,
  getDefaultOptions,
  countMarkdownFiles,
  countSkillFiles,
};
