#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const squadFlag = args.indexOf('--squad');
  const skillsDirFlag = args.indexOf('--skills-dir');
  const skillsDir =
    skillsDirFlag !== -1 && args[skillsDirFlag + 1]
      ? args[skillsDirFlag + 1]
      : '.codex/skills';
  if (squadFlag !== -1 && args[squadFlag + 1]) {
    return { squadName: args[squadFlag + 1], skillsDir };
  }
  if (args[0] && !args[0].startsWith('-')) {
    return { squadName: args[0], skillsDir };
  }
  return { squadName: '', skillsDir };
}

function loadYaml(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return yaml.load(raw);
  } catch (error) {
    fail(`failed to parse YAML file ${filePath}: ${error.message}`);
  }
}

function extractYamlBlock(markdown) {
  const match = markdown.match(/```yaml\s*([\s\S]*?)```/i);
  return match ? match[1] : null;
}

function parseCommandString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('*')) return null;
  const sep = trimmed.indexOf(' - ');
  if (sep === -1) return { name: trimmed, description: 'Execute command' };
  return {
    name: trimmed.slice(0, sep).trim(),
    description: trimmed.slice(sep + 3).trim() || 'Execute command',
  };
}

function collectCommands(node, acc) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) collectCommands(item, acc);
    return;
  }
  if (typeof node === 'string') {
    const parsed = parseCommandString(node);
    if (parsed) acc.push(parsed);
    return;
  }
  if (typeof node !== 'object') return;

  if (typeof node.command === 'string' && node.command.trim().startsWith('*')) {
    acc.push({
      name: node.command.trim(),
      description:
        typeof node.description === 'string' && node.description.trim()
          ? node.description.trim()
          : 'Execute command',
    });
  }

  for (const value of Object.values(node)) {
    collectCommands(value, acc);
  }
}

function uniqueCommands(commands) {
  const seen = new Set();
  const result = [];
  for (const item of commands) {
    if (!item || !item.name) continue;
    if (seen.has(item.name)) continue;
    seen.add(item.name);
    result.push(item);
  }
  return result;
}

function pickStarterCommands(commands) {
  const items = uniqueCommands(commands);
  const help = items.find((c) => c.name === '*help');
  const rest = items.filter((c) => c.name !== '*help');
  const selected = help ? [help, ...rest.slice(0, 5)] : rest.slice(0, 6);
  if (selected.length === 0) {
    return [
      { name: '*help', description: 'Show available commands' },
      { name: '*exit', description: 'Exit agent persona' },
    ];
  }
  return selected;
}

function oneLine(text, fallback) {
  if (typeof text !== 'string') return fallback;
  const value = text.replace(/\s+/g, ' ').trim();
  return value || fallback;
}

function resolveChiefId(config) {
  if (!config || typeof config !== 'object') return '';
  if (typeof config.entry_agent === 'string' && config.entry_agent.trim()) return config.entry_agent.trim();
  if (config.squad && typeof config.squad.entry_agent === 'string' && config.squad.entry_agent.trim()) {
    return config.squad.entry_agent.trim();
  }
  if (config.tier_system && typeof config.tier_system.orchestrator === 'string' && config.tier_system.orchestrator.trim()) {
    return config.tier_system.orchestrator.trim();
  }
  if (Array.isArray(config.agents)) {
    const orchestrator = config.agents.find((a) => a && (a.tier === 'orchestrator' || /chief$/i.test(String(a.id || ''))));
    if (orchestrator && orchestrator.id) return String(orchestrator.id).trim();
  }
  return '';
}

function resolveChiefPath(squadDir, config, chiefId) {
  if (Array.isArray(config?.agents)) {
    const chief = config.agents.find((a) => a && String(a.id || '').trim() === chiefId);
    if (chief && chief.file) {
      return path.join(squadDir, String(chief.file));
    }
  }
  return path.join(squadDir, 'agents', `${chiefId}.md`);
}

function buildSkillContent({ skillId, squadName, chiefPathRelative, title, whenToUse, starterCommands }) {
  const starter = starterCommands
    .map((c) => `- \`${c.name}\` - ${c.description}`)
    .join('\n');

  return `---
name: ${skillId}
description: ${title} do squad ${squadName}. Use para orquestrar o fluxo principal deste squad no Codex.
---

# ${title} Activator

## When To Use
${whenToUse}

## Activation Protocol
1. Load \`${chiefPathRelative}\` as source of truth.
2. Adopt this agent persona and command system.
3. Display the greeting defined in \`activation-instructions\`.
4. Stay in this persona until the user asks to switch or exit.

## Starter Commands
${starter}

## Non-Negotiables
- Follow \`.aiox-core/constitution.md\`.
- Execute only workflows/tasks declared by the squad artifacts.
- Keep artifacts scoped to \`squads/${squadName}/\` unless explicitly required.
`;
}

function main() {
  const { squadName, skillsDir } = parseArgs(process.argv);
  if (!squadName) {
    fail(
      'usage: node squads/squad-creator-pro/scripts/sync-chief-codex-skill.js --squad <squad-name> [--skills-dir <path>]',
    );
  }

  const projectRoot = process.cwd();
  const squadDir = path.join(projectRoot, 'squads', squadName);
  const configPath = path.join(squadDir, 'config.yaml');

  if (!fs.existsSync(configPath)) {
    fail(`config not found: ${configPath}`);
  }

  const config = loadYaml(configPath);
  const chiefId = resolveChiefId(config);
  if (!chiefId) {
    fail(`unable to resolve chief id from ${configPath}`);
  }

  const chiefPath = resolveChiefPath(squadDir, config, chiefId);
  if (!fs.existsSync(chiefPath)) {
    fail(`chief agent file not found: ${chiefPath}`);
  }

  const chiefRaw = fs.readFileSync(chiefPath, 'utf8');
  const chiefYamlBlock = extractYamlBlock(chiefRaw);
  if (!chiefYamlBlock) {
    fail(`no YAML block found in chief agent: ${chiefPath}`);
  }

  let chiefYaml;
  try {
    chiefYaml = yaml.load(chiefYamlBlock) || {};
  } catch (error) {
    fail(`failed to parse YAML block in ${chiefPath}: ${error.message}`);
  }

  const commands = [];
  collectCommands(chiefYaml.commands, commands);
  const starterCommands = pickStarterCommands(commands);

  const title = oneLine(chiefYaml?.agent?.title, `${chiefId} Chief`);
  const whenToUse = oneLine(
    chiefYaml?.agent?.whenToUse,
    `Use para ativar o chief ${chiefId} do squad ${squadName}.`,
  );

  const chiefPathRelative = path.relative(projectRoot, chiefPath).replace(/\\/g, '/');
  const skillsRoot = path.isAbsolute(skillsDir) ? skillsDir : path.join(projectRoot, skillsDir);
  const skillDir = path.join(skillsRoot, chiefId);
  const skillPath = path.join(skillDir, 'SKILL.md');
  const content = buildSkillContent({
    skillId: chiefId,
    squadName,
    chiefPathRelative,
    title,
    whenToUse,
    starterCommands,
  });

  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(skillPath, content, 'utf8');

  console.log(`OK: generated ${path.relative(projectRoot, skillPath)}`);
}

main();
