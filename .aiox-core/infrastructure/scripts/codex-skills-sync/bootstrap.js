#!/usr/bin/env node
'use strict';

/*
 * Codex local skills bootstrap.
 *
 * Purpose:
 * - Generate `.codex/skills/aiox-*` for each core AIOX agent in
 *   `.aiox-core/development/agents/` (e.g. aiox-dev, aiox-pm, aiox-po).
 * - Generate `.codex/skills/aiox-*` for each squad entry chief discovered
 *   in `squads/*\/config.yaml` (e.g. aiox-mega-brain-chief, aiox-slides-chief).
 * - Heavy source files stay in `.aiox-core/development/agents/` and `squads/`.
 *   Generated SKILL.md files are activator stubs that load the source on demand.
 *
 * Why a separate script (vs `index.js`):
 * - `index.js` (npm run sync:skills:codex) is the incremental sync used in CI.
 *   It only covers core agents and is tightly coupled with the shared
 *   `agent-parser.js` from `ide-sync/`.
 * - `bootstrap.js` is a one-shot operator command that ALSO covers squad
 *   chiefs (the missing-skills bug fix). It is standalone with a vendored
 *   js-yaml fallback so it works on broken/partial installs.
 *
 * Usage:
 *   npm run setup:codex-skills          # generate / update
 *   npm run setup:codex-skills:dry      # preview without writes
 *   node .aiox-core/infrastructure/scripts/codex-skills-sync/bootstrap.js --help
 *
 * After running, restart Codex CLI from the project root if the `$` menu
 * does not refresh automatically.
 *
 * @see Story 123.9 — Codex Local Skills Bootstrap (squad chief coverage).
 */

const fs = require('fs');
const path = require('path');

const MARKER = '<!-- AIOX-CODEX-LOCAL-SKILLS: generated -->';

function parseArgs(argv) {
  const args = {
    projectRoot: '',
    skillsDir: '.codex/skills',
    dryRun: false,
    force: false,
    quiet: false,
    help: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--dry-run' || arg === '-n') {
      args.dryRun = true;
    } else if (arg === '--force' || arg === '-f') {
      args.force = true;
    } else if (arg === '--quiet' || arg === '-q') {
      args.quiet = true;
    } else if (arg === '--project-root' && argv[index + 1]) {
      args.projectRoot = argv[index + 1];
      index += 1;
    } else if (arg === '--skills-dir' && argv[index + 1]) {
      args.skillsDir = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Codex local skills bootstrap

Usage:
  node .aiox-core/infrastructure/scripts/codex-skills-sync/bootstrap.js [options]
  npm run setup:codex-skills [-- options]

Options:
  --project-root <path>  Project root. Defaults to current directory or nearest parent with .aiox-core/squads.
  --skills-dir <path>    Skills output directory. Defaults to .codex/skills.
  --dry-run, -n          Preview without writing files.
  --force, -f            Overwrite non-generated skill files after creating a .bak copy.
  --quiet, -q            Reduce output.
  --help, -h             Show this help.
`);
}

function findProjectRoot(start) {
  let current = path.resolve(start || process.cwd());

  for (let depth = 0; depth < 10; depth += 1) {
    const hasAioxCore = fs.existsSync(path.join(current, '.aiox-core'));
    const hasSquads = fs.existsSync(path.join(current, 'squads'));
    if (hasAioxCore || hasSquads) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return path.resolve(start || process.cwd());
}

function tryRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (_error) {
    return null;
  }
}

function loadYaml(projectRoot) {
  const candidates = [
    'js-yaml',
    path.join(projectRoot, 'node_modules', 'js-yaml'),
    path.join(projectRoot, '.aiox-core', 'node_modules', 'js-yaml'),
    path.join(__dirname, 'node_modules', 'js-yaml'),
    path.join(__dirname, '.aiox-core', 'node_modules', 'js-yaml'),
  ];

  for (const candidate of candidates) {
    const mod = tryRequire(candidate);
    if (mod && typeof mod.load === 'function') {
      return mod;
    }
  }

  return null;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listFiles(dirPath, predicate) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .map((name) => path.join(dirPath, name))
    .filter((filePath) => {
      try {
        return fs.statSync(filePath).isFile() && (!predicate || predicate(filePath));
      } catch (_error) {
        return false;
      }
    })
    .sort();
}

function listDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .map((name) => path.join(dirPath, name))
    .filter((filePath) => {
      try {
        return fs.statSync(filePath).isDirectory();
      } catch (_error) {
        return false;
      }
    })
    .sort();
}

function extractYamlBlock(markdown) {
  const match = markdown.match(/```yaml\s*([\s\S]*?)```/i);
  return match ? match[1] : '';
}

function parseYamlText(text, yaml) {
  if (!text || !yaml) return null;
  try {
    const parsed = yaml.load(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function getNested(object, pathParts) {
  let current = object;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object') return '';
    current = current[part];
  }
  return typeof current === 'string' ? current.trim() : '';
}

function findScalar(text, keys) {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`^[ \\t]*${escaped}[ \\t]*:[ \\t]*['"]?([^'"\\n#]+)`, 'm'));
    if (match && match[1]) return match[1].trim();
  }
  return '';
}

function findBlockScalar(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^\\s*${escaped}\\s*:\\s*[|>]\\s*\\n([\\s\\S]*?)(?=\\n\\S|\\n\\s{0,2}[A-Za-z0-9_-]+\\s*:|$)`, 'm'));
  if (!match || !match[1]) return '';

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^\s{2,}/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value) {
  return String(value || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^A-Za-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function yamlString(value) {
  return JSON.stringify(String(value || '').replace(/\s+/g, ' ').trim());
}

function truncate(value, maxLength) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function basenameNoExt(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function relative(projectRoot, filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

function parseAgentFile(filePath, yaml) {
  const raw = readText(filePath);
  const yamlBlock = extractYamlBlock(raw);
  const parsed = parseYamlText(yamlBlock, yaml) || {};
  const agent = parsed.agent && typeof parsed.agent === 'object' ? parsed.agent : {};
  const id = slug(agent.id || basenameNoExt(filePath));
  const title =
    String(agent.title || '').trim() ||
    findScalar(yamlBlock, ['title']) ||
    basenameNoExt(filePath);
  const name = String(agent.name || '').trim() || findScalar(yamlBlock, ['name']) || title;
  const whenToUse =
    String(agent.whenToUse || '').trim() ||
    String(agent.when_to_use || '').trim() ||
    findBlockScalar(yamlBlock, 'whenToUse') ||
    findScalar(yamlBlock, ['whenToUse', 'when_to_use']) ||
    `Use this skill to activate ${title}.`;
  const commands = collectCommands(parsed.commands).concat(collectCommandsFromText(yamlBlock));

  return {
    id,
    name,
    title,
    whenToUse,
    commands: uniqueCommands(commands),
  };
}

function collectCommands(node, acc = []) {
  if (!node) return acc;

  if (Array.isArray(node)) {
    node.forEach((item) => collectCommands(item, acc));
    return acc;
  }

  if (typeof node === 'string') {
    const parsed = parseCommandLine(node);
    if (parsed) acc.push(parsed);
    return acc;
  }

  if (typeof node !== 'object') return acc;

  if (typeof node.command === 'string') {
    const parsed = parseCommandLine(node.command);
    if (parsed) {
      parsed.description =
        typeof node.description === 'string' && node.description.trim()
          ? node.description.trim()
          : parsed.description;
      acc.push(parsed);
    }
  }

  Object.keys(node).forEach((key) => collectCommands(node[key], acc));
  return acc;
}

function collectCommandsFromText(text) {
  const commands = [];
  const patterns = [
    /command\s*:\s*['"]?(\*[A-Za-z0-9:_-]+)['"]?(?:\s*\n\s*description\s*:\s*['"]?([^'"\n]+))?/g,
    /-\s+`?(\*[A-Za-z0-9:_-]+)`?\s+-\s+([^\n]+)/g,
    /-\s+['"]?(\*[A-Za-z0-9:_-]+)['"]?\s+-\s+([^\n]+)/g,
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(text);
    while (match) {
      commands.push({
        name: match[1].trim(),
        description: (match[2] || 'Execute command').trim(),
      });
      match = pattern.exec(text);
    }
  }

  return commands;
}

function parseCommandLine(value) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  if (!clean.startsWith('*')) return null;

  const separator = clean.indexOf(' - ');
  if (separator === -1) {
    return { name: clean.split(/\s+/)[0], description: 'Execute command' };
  }

  return {
    name: clean.slice(0, separator).trim(),
    description: clean.slice(separator + 3).trim() || 'Execute command',
  };
}

function uniqueCommands(commands) {
  const seen = new Set();
  const result = [];

  for (const item of commands) {
    if (!item || !item.name || seen.has(item.name)) continue;
    seen.add(item.name);
    result.push(item);
  }

  return result;
}

function starterCommands(commands) {
  const unique = uniqueCommands(commands);
  const help = unique.find((item) => item.name === '*help');
  const rest = unique.filter((item) => item.name !== '*help');
  const selected = help ? [help].concat(rest.slice(0, 7)) : rest.slice(0, 8);
  return selected.length ? selected : [{ name: '*help', description: 'List available commands' }];
}

function parseConfig(filePath, yaml) {
  const raw = readText(filePath);
  const parsed = parseYamlText(raw, yaml) || {};
  return { raw, parsed };
}

function resolveEntryAgent(configData, squadDir) {
  const parsed = configData.parsed || {};
  const raw = configData.raw || '';

  const direct =
    getNested(parsed, ['entry_agent']) ||
    getNested(parsed, ['squad', 'entry_agent']) ||
    getNested(parsed, ['pack', 'entry_agent']) ||
    getNested(parsed, ['orchestrator', 'agent']) ||
    getNested(parsed, ['tier_system', 'orchestrator']) ||
    findScalar(raw, ['entry_agent', 'orchestrator']);
  if (direct) return slug(direct);

  if (Array.isArray(parsed.agents)) {
    const chief = parsed.agents.find((agent) => {
      if (!agent || typeof agent !== 'object') return false;
      const id = String(agent.id || '').trim();
      const tier = String(agent.tier || '').trim().toLowerCase();
      return tier === 'orchestrator' || /chief$/i.test(id);
    });
    if (chief && chief.id) return slug(chief.id);
  }

  const agentsDir = path.join(squadDir, 'agents');
  const agentFiles = listFiles(agentsDir, (filePath) => path.extname(filePath) === '.md');
  const preferred = agentFiles.find((filePath) => /(^|-)chief$/i.test(basenameNoExt(filePath)));
  if (preferred) return slug(basenameNoExt(preferred));

  const anyChief = agentFiles.find((filePath) => /chief/i.test(basenameNoExt(filePath)));
  if (anyChief) return slug(basenameNoExt(anyChief));

  return agentFiles[0] ? slug(basenameNoExt(agentFiles[0])) : '';
}

function resolveAgentFile(squadDir, configData, entryAgent) {
  const parsed = configData.parsed || {};

  if (Array.isArray(parsed.agents)) {
    const match = parsed.agents.find((agent) => agent && slug(agent.id) === entryAgent);
    if (match && typeof match.file === 'string' && match.file.trim()) {
      const candidate = path.join(squadDir, match.file.trim());
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  const direct = path.join(squadDir, 'agents', `${entryAgent}.md`);
  if (fs.existsSync(direct)) return direct;

  const agentFiles = listFiles(path.join(squadDir, 'agents'), (filePath) => path.extname(filePath) === '.md');
  return agentFiles.find((filePath) => slug(basenameNoExt(filePath)) === entryAgent) || '';
}

function resolveSquadAlias(configData, squadName) {
  const parsed = configData.parsed || {};
  const raw = configData.raw || '';
  const alias =
    getNested(parsed, ['slashPrefix']) ||
    getNested(parsed, ['slash_prefix']) ||
    getNested(parsed, ['squad', 'slashPrefix']) ||
    getNested(parsed, ['squad', 'slash_prefix']) ||
    getNested(parsed, ['pack', 'slashPrefix']) ||
    getNested(parsed, ['pack', 'slash_prefix']) ||
    findScalar(raw, ['slashPrefix', 'slash_prefix']);

  return slug(alias || squadName);
}

function coreSkillId(agentId) {
  const clean = slug(agentId);
  return clean.startsWith('aiox-') ? clean : `aiox-${clean}`;
}

function squadSkillId(squadName, entryAgent, squadAlias) {
  const alias = slug(squadAlias || '').replace(/^aiox-/, '');
  const squadBase = slug(squadName).replace(/^aiox-/, '');
  const entry = slug(entryAgent).replace(/^aiox-/, '');
  const entryRoot = entry.replace(/-(chief|master|orchestrator)$/i, '');
  const genericEntryRoots = new Set(['agent', 'chief', 'master', 'orchestrator', 'squad']);

  if (!entry) return coreSkillId(squadBase || alias);
  if (entry === squadBase || entry.startsWith(`${squadBase}-`)) return `aiox-${entry}`;
  if (alias && (entry === alias || entry.startsWith(`${alias}-`))) return `aiox-${entry}`;
  if (entryRoot && !genericEntryRoots.has(entryRoot) && squadBase.startsWith(`${entryRoot}-`)) {
    return `aiox-${entry}`;
  }
  if (entryRoot && !genericEntryRoots.has(entryRoot) && entry.includes('-chief')) {
    return `aiox-${entry}`;
  }
  return `aiox-${squadBase || alias}-${entry}`;
}

function buildSkillContent({ skillId, title, whenToUse, sourcePath, scopePath, commands }) {
  const starters = starterCommands(commands)
    .map((command) => `- \`${command.name}\` - ${command.description}`)
    .join('\n');

  const description = truncate(`${title}. ${whenToUse}`, 180);

  return `---
name: ${skillId}
description: ${yamlString(description)}
---

# ${title} Activator

${MARKER}

## Source Of Truth
Load \`${sourcePath}\` before adopting this skill.

## When To Use
${whenToUse}

## Activation Protocol
1. Read \`${sourcePath}\` as the source of truth.
2. Adopt the persona, command system, dependencies, and activation instructions from that file.
3. Resolve dependencies relative to \`${scopePath}\` unless the source file declares a more specific path.
4. Stay in this persona until the user asks to switch or exit.

## Starter Commands
${starters}

## Non-Negotiables
- Follow \`.aiox-core/constitution.md\` when it exists.
- Do not copy squad internals into this skill; load them on demand from the source paths.
- Keep writes scoped to the active project unless the user explicitly asks otherwise.
`;
}

function buildCorePlans(projectRoot, yaml) {
  const agentsDir = path.join(projectRoot, '.aiox-core', 'development', 'agents');
  const files = listFiles(agentsDir, (filePath) => path.extname(filePath) === '.md');

  return files.map((filePath) => {
    const agent = parseAgentFile(filePath, yaml);
    const sourcePath = relative(projectRoot, filePath);
    const skillId = coreSkillId(agent.id);
    return {
      kind: 'core',
      skillId,
      sourcePath,
      content: buildSkillContent({
        skillId,
        title: `AIOX ${agent.title}`,
        whenToUse: agent.whenToUse,
        sourcePath,
        scopePath: '.aiox-core/development',
        commands: agent.commands,
      }),
    };
  });
}

function buildSquadPlans(projectRoot, yaml) {
  const squadsDir = path.join(projectRoot, 'squads');
  const squadDirs = listDirs(squadsDir);
  const plans = [];
  const warnings = [];

  for (const squadDir of squadDirs) {
    const squadName = path.basename(squadDir);
    const configPath = path.join(squadDir, 'config.yaml');
    if (!fs.existsSync(configPath)) {
      warnings.push(`Skipped ${squadName}: missing config.yaml`);
      continue;
    }

    const configData = parseConfig(configPath, yaml);
    const entryAgent = resolveEntryAgent(configData, squadDir);
    if (!entryAgent) {
      warnings.push(`Skipped ${squadName}: no entry/chief agent found`);
      continue;
    }

    const sourceFile = resolveAgentFile(squadDir, configData, entryAgent);
    if (!sourceFile) {
      warnings.push(`Skipped ${squadName}: entry/chief file not found for ${entryAgent}`);
      continue;
    }

    const agent = parseAgentFile(sourceFile, yaml);
    const alias = resolveSquadAlias(configData, squadName);
    const skillId = squadSkillId(squadName, entryAgent, alias);
    const sourcePath = relative(projectRoot, sourceFile);

    plans.push({
      kind: 'squad',
      skillId,
      sourcePath,
      content: buildSkillContent({
        skillId,
        title: `${agent.title} (${squadName})`,
        whenToUse: agent.whenToUse,
        sourcePath,
        scopePath: relative(projectRoot, squadDir),
        commands: agent.commands,
      }),
    });
  }

  return { plans, warnings };
}

function targetFileFor(skillsDir, skillId) {
  return path.join(skillsDir, skillId, 'SKILL.md');
}

function backupFile(filePath) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
  const backup = `${filePath}.bak-${stamp}`;
  fs.copyFileSync(filePath, backup);
  return backup;
}

function writePlanItem(item, skillsDir, options) {
  const filePath = targetFileFor(skillsDir, item.skillId);
  const dirPath = path.dirname(filePath);
  const rel = relative(options.projectRoot, filePath);

  if (options.dryRun) {
    return { status: fs.existsSync(filePath) ? 'would_update' : 'would_create', path: rel };
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    const current = readText(filePath);
    if (current === item.content) {
      return { status: 'unchanged', path: rel };
    }

    if (!current.includes(MARKER) && !options.force) {
      return { status: 'skipped_existing', path: rel };
    }

    let backup = '';
    if (!current.includes(MARKER) && options.force) {
      backup = relative(options.projectRoot, backupFile(filePath));
    }

    fs.writeFileSync(filePath, item.content, 'utf8');
    return { status: backup ? 'updated_with_backup' : 'updated', path: rel, backup };
  }

  fs.writeFileSync(filePath, item.content, 'utf8');
  return { status: 'created', path: rel };
}

function dedupePlans(plans) {
  const seen = new Map();
  const result = [];
  const warnings = [];

  for (const item of plans) {
    if (!seen.has(item.skillId)) {
      seen.set(item.skillId, item);
      result.push(item);
      continue;
    }

    const replacement = {
      ...item,
      skillId: `${item.skillId}-${slug(path.dirname(item.sourcePath).split('/')[1] || 'duplicate')}`,
    };
    warnings.push(`Renamed duplicate skill ${item.skillId} to ${replacement.skillId}`);
    result.push(replacement);
  }

  return { plans: result, warnings };
}

function summarize(results) {
  return results.reduce((summary, item) => {
    summary[item.status] = (summary[item.status] || 0) + 1;
    return summary;
  }, {});
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const projectRoot = findProjectRoot(args.projectRoot || process.cwd());
  const skillsDir = path.isAbsolute(args.skillsDir)
    ? args.skillsDir
    : path.join(projectRoot, args.skillsDir);
  const yaml = loadYaml(projectRoot);

  const corePlans = buildCorePlans(projectRoot, yaml);
  const squadResult = buildSquadPlans(projectRoot, yaml);
  const deduped = dedupePlans(corePlans.concat(squadResult.plans));
  const plans = deduped.plans;
  const warnings = squadResult.warnings.concat(deduped.warnings);

  if (!plans.length) {
    throw new Error('No skills were discovered. Run this from the project root that contains .aiox-core/ and squads/.');
  }

  const options = {
    ...args,
    projectRoot,
  };
  const results = plans.map((item) => writePlanItem(item, skillsDir, options));
  const summary = summarize(results);

  if (!args.quiet) {
    console.log(`Project root: ${projectRoot}`);
    console.log(`Skills dir:   ${relative(projectRoot, skillsDir)}`);
    console.log(`Mode:         ${args.dryRun ? 'dry-run' : 'write'}`);
    console.log('');
    console.log(`Discovered:   ${corePlans.length} core skills, ${squadResult.plans.length} squad entry skills`);
    console.log(`Results:      ${Object.keys(summary).map((key) => `${key}=${summary[key]}`).join(', ')}`);

    if (warnings.length) {
      console.log('');
      console.log('Warnings:');
      warnings.forEach((warning) => console.log(`- ${warning}`));
    }

    if (results.some((item) => item.status === 'skipped_existing')) {
      console.log('');
      console.log('Some existing non-generated skills were skipped. Re-run with --force only if you want backups and overwrite.');
    }

    console.log('');
    console.log('Next steps:');
    console.log('- Open or restart Codex CLI from this project root if the $ menu does not refresh immediately.');
    console.log('- Use the aiox-* skill names to avoid matching unrelated global aios-* skills.');
    console.log('- This script does not delete or modify global skills in ~/.codex/skills.');
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  MARKER,
  parseArgs,
  findProjectRoot,
  loadYaml,
  buildCorePlans,
  buildSquadPlans,
  buildSkillContent,
  coreSkillId,
  squadSkillId,
  resolveEntryAgent,
  resolveSquadAlias,
  parseAgentFile,
};
