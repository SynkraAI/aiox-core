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

function listMarkdownBasenames(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.basename(f, '.md'))
    .sort();
}

function listClaudeAgentSkillIds(skillsAgentsDir) {
  if (!fs.existsSync(skillsAgentsDir)) return [];
  return fs.readdirSync(skillsAgentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsAgentsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

function validateClaudeIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const rulesFile = options.rulesFile || path.join(projectRoot, '.claude', 'CLAUDE.md');
  const agentsDir = options.agentsDir || path.join(projectRoot, '.claude', 'commands', 'AIOX', 'agents');
  const skillsAgentsDir =
    options.skillsAgentsDir || path.join(projectRoot, '.claude', 'skills', 'AIOX', 'agents');
  const hooksDir = options.hooksDir || path.join(projectRoot, '.claude', 'hooks');
  const sourceAgentsDir =
    options.sourceAgentsDir || path.join(projectRoot, '.aiox-core', 'development', 'agents');

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(agentsDir)) {
    warnings.push(`Missing legacy Claude commands dir: ${path.relative(projectRoot, agentsDir)}`);
  }
  if (!fs.existsSync(skillsAgentsDir)) {
    errors.push(`Missing Claude agent skills dir: ${path.relative(projectRoot, skillsAgentsDir)}`);
  }
  if (!fs.existsSync(rulesFile)) {
    warnings.push(`Claude rules file not found yet: ${path.relative(projectRoot, rulesFile)}`);
  }
  if (!fs.existsSync(hooksDir)) {
    warnings.push(`Claude hooks dir not found yet: ${path.relative(projectRoot, hooksDir)}`);
  }

  const sourceAgents = listMarkdownBasenames(sourceAgentsDir);
  const commandAgents = listMarkdownBasenames(agentsDir);
  const skillAgents = listClaudeAgentSkillIds(skillsAgentsDir);

  if (sourceAgents.length > 0 && skillAgents.length !== sourceAgents.length) {
    errors.push(`Claude agent skill count differs from source (${skillAgents.length}/${sourceAgents.length})`);
  }

  for (const sourceAgent of sourceAgents) {
    if (!skillAgents.includes(sourceAgent)) {
      errors.push(`Missing Claude agent skill: ${sourceAgent}`);
      continue;
    }

    const skillPath = path.join(skillsAgentsDir, sourceAgent, 'SKILL.md');
    let skillContent = '';
    try {
      skillContent = fs.readFileSync(skillPath, 'utf8');
    } catch (_error) {
      errors.push(`Cannot read Claude agent skill: ${sourceAgent}`);
      continue;
    }

    if (!skillContent.includes('activation_type: pipeline')) {
      errors.push(`Claude agent skill missing activation_type: pipeline: ${sourceAgent}`);
    }
  }

  if (sourceAgents.length > 0 && commandAgents.length !== sourceAgents.length) {
    warnings.push(`Legacy Claude command count differs from source (${commandAgents.length}/${sourceAgents.length})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceAgents.length,
      claudeCommands: commandAgents.length,
      claudeSkills: skillAgents.length,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Claude integration validation passed (skills: ${result.metrics.claudeSkills}, legacy commands: ${result.metrics.claudeCommands})`,
    ];
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
  listMarkdownBasenames,
  listClaudeAgentSkillIds,
};
