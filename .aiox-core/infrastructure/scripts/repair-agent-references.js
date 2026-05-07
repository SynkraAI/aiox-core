#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const path = require('path');

const { parseAllAgents } = require('./ide-sync/agent-parser');
const { commandSync } = require('./ide-sync/index');
const {
  syncSkills,
  getCodexHome,
  getSkillId,
  getLegacySkillId,
} = require('./codex-skills-sync/index');
const { validateCodexSkills } = require('./codex-skills-sync/validate');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    localSkillsDir: path.join(projectRoot, '.codex', 'skills'),
    globalSkillsDir: path.join(getCodexHome(), 'skills'),
    geminiCommandsDir: path.join(projectRoot, '.gemini', 'commands'),
    includeGlobal: true,
    dryRun: false,
    quiet: false,
    json: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    includeGlobal: !args.has('--no-global'),
    dryRun: args.has('--dry-run'),
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
  };
}

function isParsableAgent(agent) {
  return !agent.error || agent.error === 'YAML parse failed, using fallback extraction';
}

function buildLegacyArtifacts(agents, options) {
  const artifacts = [];

  for (const agent of agents) {
    const canonicalSkillId = getSkillId(agent.id);
    const legacySkillId = getLegacySkillId(agent.id);

    artifacts.push({
      kind: 'skill-dir',
      scope: 'local',
      canonicalId: canonicalSkillId,
      legacyId: legacySkillId,
      path: path.join(options.localSkillsDir, legacySkillId),
    });

    if (options.includeGlobal) {
      artifacts.push({
        kind: 'skill-dir',
        scope: 'global',
        canonicalId: canonicalSkillId,
        legacyId: legacySkillId,
        path: path.join(options.globalSkillsDir, legacySkillId),
      });
    }

    artifacts.push({
      kind: 'gemini-command',
      scope: 'project',
      canonicalId: canonicalSkillId,
      legacyId: legacySkillId,
      path: path.join(options.geminiCommandsDir, `${legacySkillId}.toml`),
    });
  }

  artifacts.push({
    kind: 'gemini-menu',
    scope: 'project',
    canonicalId: 'aiox-menu',
    legacyId: 'aios-menu',
    path: path.join(options.geminiCommandsDir, 'aios-menu.toml'),
  });

  return artifacts;
}

function removeLegacyArtifacts(artifacts, options) {
  const removed = [];
  const skipped = [];

  for (const artifact of artifacts) {
    if (!fs.existsSync(artifact.path)) {
      skipped.push({ ...artifact, reason: 'not-found' });
      continue;
    }

    if (!options.dryRun) {
      fs.removeSync(artifact.path);
    }

    removed.push(artifact);
  }

  return { removed, skipped };
}

function validateGeminiCommands(agents, commandsDir) {
  const errors = [];
  const checked = [];

  const menuPath = path.join(commandsDir, 'aiox-menu.toml');
  checked.push(menuPath);
  if (!fs.existsSync(menuPath)) {
    errors.push(`Missing Gemini launcher: ${menuPath}`);
  }

  const legacyMenuPath = path.join(commandsDir, 'aios-menu.toml');
  if (fs.existsSync(legacyMenuPath)) {
    errors.push(`Legacy Gemini launcher still present: ${legacyMenuPath}`);
  }

  for (const agent of agents) {
    const canonicalId = getSkillId(agent.id);
    const legacyId = getLegacySkillId(agent.id);
    const canonicalPath = path.join(commandsDir, `${canonicalId}.toml`);
    const legacyPath = path.join(commandsDir, `${legacyId}.toml`);

    checked.push(canonicalPath);
    if (!fs.existsSync(canonicalPath)) {
      errors.push(`Missing Gemini command: ${canonicalPath}`);
    }
    if (fs.existsSync(legacyPath)) {
      errors.push(`Legacy Gemini command still present: ${legacyPath}`);
    }
  }

  return {
    ok: errors.length === 0,
    checked: checked.length,
    errors,
  };
}

async function repairAgentReferences(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  const agents = parseAllAgents(resolved.sourceDir).filter(isParsableAgent);
  const legacyArtifacts = buildLegacyArtifacts(agents, resolved);
  const cleanup = removeLegacyArtifacts(legacyArtifacts, resolved);

  const skillSync = syncSkills({
    sourceDir: resolved.sourceDir,
    localSkillsDir: resolved.localSkillsDir,
    globalSkillsDir: resolved.globalSkillsDir,
    global: resolved.includeGlobal,
    dryRun: resolved.dryRun,
    quiet: true,
  });

  await commandSync({
    projectRoot: resolved.projectRoot,
    ide: null,
    dryRun: resolved.dryRun,
    verbose: false,
    quiet: true,
  });

  const localValidation = validateCodexSkills({
    projectRoot: resolved.projectRoot,
    sourceDir: resolved.sourceDir,
    skillsDir: resolved.localSkillsDir,
    strict: true,
    quiet: true,
  });

  const globalValidation = resolved.includeGlobal
    ? validateCodexSkills({
      projectRoot: resolved.projectRoot,
      sourceDir: resolved.sourceDir,
      skillsDir: resolved.globalSkillsDir,
      strict: true,
      allowOrphaned: true,
      quiet: true,
    })
    : null;

  const geminiValidation = validateGeminiCommands(agents, resolved.geminiCommandsDir);

  return {
    ok: localValidation.ok && (globalValidation ? globalValidation.ok : true) && geminiValidation.ok,
    agentsChecked: agents.length,
    removed: cleanup.removed,
    skipped: cleanup.skipped,
    skillSync,
    validations: {
      localCodex: localValidation,
      globalCodex: globalValidation,
      gemini: geminiValidation,
    },
  };
}

function formatHumanReport(result) {
  const lines = [
    result.ok
      ? `✅ Agent/skill reference repair completed (${result.agentsChecked} core agents checked)`
      : `❌ Agent/skill reference repair found issues (${result.agentsChecked} core agents checked)`,
    `- Removed legacy artifacts: ${result.removed.length}`,
    `- Skipped missing legacy artifacts: ${result.skipped.length}`,
    `- Local Codex validation: ${result.validations.localCodex.ok ? 'pass' : 'fail'}`,
    `- Global Codex validation: ${result.validations.globalCodex ? (result.validations.globalCodex.ok ? 'pass' : 'fail') : 'skipped'}`,
    `- Gemini validation: ${result.validations.gemini.ok ? 'pass' : 'fail'}`,
  ];

  const detailErrors = [
    ...result.validations.localCodex.errors,
    ...(result.validations.globalCodex ? result.validations.globalCodex.errors : []),
    ...result.validations.gemini.errors,
  ];

  if (detailErrors.length > 0) {
    lines.push(...detailErrors.map(error => `  • ${error}`));
  }

  return lines.join('\n');
}

async function main() {
  const options = parseArgs();
  const result = await repairAgentReferences(options);

  if (!options.quiet) {
    if (options.json) {
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
  main().catch((error) => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  buildLegacyArtifacts,
  removeLegacyArtifacts,
  validateGeminiCommands,
  repairAgentReferences,
  parseArgs,
  getDefaultOptions,
  formatHumanReport,
};
