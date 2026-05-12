#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    rulesFile: path.join(projectRoot, '.gemini', 'rules.md'),
    agentsDir: path.join(projectRoot, '.gemini', 'rules', 'AIOX', 'agents'),
    commandsDir: path.join(projectRoot, '.gemini', 'commands'),
    extensionDir: path.join(projectRoot, 'packages', 'gemini-aiox-extension'),
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

function validateGeminiIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const resolved = {
    ...getDefaultOptions(),
    ...options,
    projectRoot,
    rulesFile: options.rulesFile || path.join(projectRoot, '.gemini', 'rules.md'),
    agentsDir: options.agentsDir || path.join(projectRoot, '.gemini', 'rules', 'AIOX', 'agents'),
    commandsDir: options.commandsDir || path.join(projectRoot, '.gemini', 'commands'),
    extensionDir: options.extensionDir || path.join(projectRoot, 'packages', 'gemini-aiox-extension'),
    sourceAgentsDir: options.sourceAgentsDir || path.join(projectRoot, '.aiox-core', 'development', 'agents'),
  };
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(resolved.rulesFile)) {
    warnings.push(`Gemini rules file not found yet: ${path.relative(resolved.projectRoot, resolved.rulesFile)}`);
  }

  if (!fs.existsSync(resolved.agentsDir)) {
    errors.push(`Missing Gemini agents dir: ${path.relative(resolved.projectRoot, resolved.agentsDir)}`);
  }
  if (!fs.existsSync(resolved.commandsDir)) {
    errors.push(`Missing Gemini commands dir: ${path.relative(resolved.projectRoot, resolved.commandsDir)}`);
  }

  const sourceCount = countMarkdownFiles(resolved.sourceAgentsDir);
  const geminiCount = countMarkdownFiles(resolved.agentsDir);
  const commandFiles = fs.existsSync(resolved.commandsDir)
    ? fs.readdirSync(resolved.commandsDir).filter((f) => f.endsWith('.toml'))
    : [];
  const expectedCommandCount = sourceCount > 0 ? sourceCount + 1 : 0;

  if (sourceCount > 0 && commandFiles.length !== expectedCommandCount) {
    warnings.push(`Gemini command count differs from source (${commandFiles.length}/${expectedCommandCount})`);
  }
  if (!commandFiles.includes('aiox-menu.toml')) {
    errors.push(`Missing Gemini command file: ${path.relative(resolved.projectRoot, path.join(resolved.commandsDir, 'aiox-menu.toml'))}`);
  }
  if (sourceCount > 0 && geminiCount !== sourceCount) {
    warnings.push(`Gemini agent count differs from source (${geminiCount}/${sourceCount})`);
  }

  const requiredExtensionFiles = [
    'extension.json',
    'README.md',
    path.join('commands', 'aiox-status.js'),
    path.join('commands', 'aiox-agents.js'),
    path.join('commands', 'aiox-validate.js'),
    path.join('hooks', 'hooks.json'),
  ];

  for (const rel of requiredExtensionFiles) {
    const abs = path.join(resolved.extensionDir, rel);
    if (!fs.existsSync(abs)) {
      errors.push(`Missing Gemini extension file: ${path.relative(resolved.projectRoot, abs)}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceCount,
      geminiAgents: geminiCount,
      geminiCommands: commandFiles.length,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Gemini integration validation passed (agents: ${result.metrics.geminiAgents}, commands: ${result.metrics.geminiCommands})`,
    ];
    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
    }
    return lines.join('\n');
  }
  const lines = [
    `❌ Gemini integration validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((e) => `- ${e}`),
  ];
  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateGeminiIntegration(args);

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
  validateGeminiIntegration,
  parseArgs,
  getDefaultOptions,
  countMarkdownFiles,
};
