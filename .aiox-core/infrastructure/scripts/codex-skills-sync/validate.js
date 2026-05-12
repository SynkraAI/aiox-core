#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const { parseAllAgents } = require('../ide-sync/agent-parser');
const { getSkillId } = require('./index');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    skillsDir: path.join(projectRoot, '.codex', 'skills'),
    strict: false,
    quiet: false,
    json: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    strict: args.has('--strict'),
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
  };
}

function isParsableAgent(agent) {
  return !agent.error || agent.error === 'YAML parse failed, using fallback extraction';
}

function validateSkillContent(content, expected) {
  const issues = [];
  const requiredChecks = [
    { ok: content.includes(`name: ${expected.skillId}`), reason: `missing frontmatter name "${expected.skillId}"` },
    {
      ok: content.includes(`.aiox-core/development/agents/${expected.filename}`),
      reason: `missing canonical agent path "${expected.filename}"`,
    },
    {
      ok: content.includes(`generate-greeting.js ${expected.agentId}`),
      reason: `missing canonical greeting command for "${expected.agentId}"`,
    },
    {
      ok: content.includes('source of truth'),
      reason: 'missing source-of-truth activation note',
    },
  ];

  for (const check of requiredChecks) {
    if (!check.ok) {
      issues.push(check.reason);
    }
  }

  return issues;
}

function validateCodexSkills(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(resolved.skillsDir)) {
    errors.push(`Skills directory not found: ${resolved.skillsDir}`);
    return { ok: false, checked: 0, expected: 0, errors, warnings, missing: [], orphaned: [] };
  }

  const agents = parseAllAgents(resolved.sourceDir).filter(isParsableAgent);
  const expected = agents.map(agent => ({
    agentId: agent.id,
    filename: agent.filename,
    skillId: getSkillId(agent.id),
  }));

  const missing = [];
  for (const item of expected) {
    const skillPath = path.join(resolved.skillsDir, item.skillId, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      missing.push(item.skillId);
      errors.push(`Missing skill file: ${path.relative(resolved.projectRoot, skillPath)}`);
      continue;
    }

    let content;
    try {
      content = fs.readFileSync(skillPath, 'utf8');
    } catch (error) {
      errors.push(`${item.skillId}: unable to read skill file (${error.message})`);
      continue;
    }
    const issues = validateSkillContent(content, item);
    for (const issue of issues) {
      errors.push(`${item.skillId}: ${issue}`);
    }
  }

  const expectedIds = new Set(expected.map(item => item.skillId));
  const orphaned = [];
  if (resolved.strict) {
    const dirs = fs.readdirSync(resolved.skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('aiox-'))
      .map(entry => entry.name);
    for (const dir of dirs) {
      if (!expectedIds.has(dir)) {
        orphaned.push(dir);
        errors.push(`Orphaned skill directory: ${path.join(path.relative(resolved.projectRoot, resolved.skillsDir), dir)}`);
      }
    }
  }

  if (expected.length === 0) {
    warnings.push('No parseable agents found in sourceDir');
  }

  return {
    ok: errors.length === 0,
    checked: expected.length,
    expected: expected.length,
    errors,
    warnings,
    missing,
    orphaned,
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    return `✅ Codex skills validation passed (${result.checked} skills checked)`;
  }

  const lines = [
    `❌ Codex skills validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map(error => `- ${error}`),
  ];

  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map(warning => `⚠️ ${warning}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateCodexSkills(args);

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
  validateCodexSkills,
  validateSkillContent,
  parseArgs,
  getDefaultOptions,
};
