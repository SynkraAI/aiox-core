#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllAgents } = require('../ide-sync/agent-parser');
const { getSkillId, getLegacySkillId } = require('./index');

const GENERATED_MARKER = '<!-- AIOX-CODEX-LOCAL-SKILLS: generated -->';

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    skillsDir: path.join(projectRoot, '.codex', 'skills'),
    strict: false,
    allowOrphaned: false,
    selfTest: false,
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
    selfTest: args.has('--self-test'),
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

/**
 * Parses a generated Codex skill frontmatter block without reading external files.
 */
function parseSkillFrontmatter(content) {
  const match = String(content || '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { data: null, error: 'missing YAML frontmatter' };
  }

  try {
    const data = yaml.load(match[1]) || {};
    return { data, error: null };
  } catch (error) {
    return { data: null, error: `invalid YAML frontmatter (${error.message})` };
  }
}

/**
 * Builds the deterministic Skill tool payload used by validator self-tests.
 */
function createSkillToolSelfTestPayload(skillId, prompt = 'AIOX skill self-test') {
  return {
    type: 'tool_use',
    name: 'Skill',
    input: {
      skill: skillId,
      prompt,
    },
  };
}

/**
 * Extracts a skill id from the payload shapes used by Skill tool invocations.
 */
function normalizeSkillToolTarget(payload) {
  if (typeof payload === 'string') {
    return payload.trim().replace(/^\$/, '');
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const input = payload.input && typeof payload.input === 'object' ? payload.input : {};
  const candidates = [
    input.skill,
    input.skillId,
    input.skill_id,
    input.name,
    input.id,
    payload.skill,
    payload.skillId,
    payload.skill_id,
    payload.id,
    payload.name && payload.name !== 'Skill' ? payload.name : '',
  ];

  const target = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return target ? target.trim().replace(/^\$/, '') : '';
}

/**
 * Finds the canonical AIOX agent path declared in a generated skill stub.
 */
function extractCanonicalAgentPath(content) {
  const match = String(content || '').match(/`(\.aiox-core\/development\/agents\/[^`]+\.md)`/);
  return match ? match[1] : '';
}

/**
 * Runs structural self-tests for generated Codex skills without invoking live tools.
 */
function runSkillSelfTests(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const resolved = {
    projectRoot,
    skillsDir: options.skillsDir || path.join(projectRoot, '.codex', 'skills'),
    expected: options.expected || [],
  };
  const expectedIds = new Set(resolved.expected.map(item => item.skillId));
  const results = [];

  for (const item of resolved.expected) {
    const skillPath = path.join(resolved.skillsDir, item.skillId, 'SKILL.md');
    const relativeSkillPath = path.relative(resolved.projectRoot, skillPath);
    const errors = [];

    let content = '';
    try {
      content = fs.readFileSync(skillPath, 'utf8');
    } catch (error) {
      results.push({
        skillId: item.skillId,
        ok: false,
        errors: [`self-test unable to read ${relativeSkillPath} (${error.message})`],
      });
      continue;
    }

    const frontmatter = parseSkillFrontmatter(content);
    let declaredSkillId = '';
    let canRoundtripSkillPayload = false;
    if (frontmatter.error) {
      errors.push(`self-test ${frontmatter.error}`);
    } else {
      declaredSkillId = String(frontmatter.data.name || '').trim();
      if (declaredSkillId !== item.skillId) {
        errors.push(`self-test frontmatter name mismatch: expected "${item.skillId}"`);
      } else {
        canRoundtripSkillPayload = true;
      }
      if (!String(frontmatter.data.description || '').trim()) {
        errors.push('self-test missing frontmatter description');
      }
    }

    const canonicalAgentPath = extractCanonicalAgentPath(content);
    if (!canonicalAgentPath) {
      errors.push('self-test missing canonical source path');
    } else {
      const expectedCanonicalPath = `.aiox-core/development/agents/${item.filename}`;
      if (canonicalAgentPath !== expectedCanonicalPath) {
        errors.push(
          `self-test canonical source path mismatch: expected "${expectedCanonicalPath}", got "${canonicalAgentPath}"`,
        );
      }
      const absoluteAgentPath = path.join(resolved.projectRoot, canonicalAgentPath);
      if (!fs.existsSync(absoluteAgentPath)) {
        errors.push(`self-test source file not found: ${canonicalAgentPath}`);
      }
    }

    if (canRoundtripSkillPayload) {
      const payload = createSkillToolSelfTestPayload(declaredSkillId);
      const target = normalizeSkillToolTarget(payload);
      if (!expectedIds.has(target)) {
        errors.push(`self-test Skill payload target is not a generated skill: ${target || '<empty>'}`);
      } else if (target !== item.skillId) {
        errors.push(`self-test Skill payload target mismatch: expected "${item.skillId}", got "${target}"`);
      }
    }

    results.push({
      skillId: item.skillId,
      ok: errors.length === 0,
      errors,
    });
  }

  return results;
}

function extractGeneratedSquadSource(content) {
  const value = String(content || '');
  const patterns = [
    /`(squads\/[^`]+\/agents\/[^`]+\.md)`/,
    /<!--\s*Source:\s*(squads\/[^>\s]+\/agents\/[^>\s]+\.md)\s*-->/,
    /<!--\s*(squads\/[^>\s]+\/agents\/[^>\s]+\.md)\s*-->/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return '';
}

function isGeneratedSquadSkill(content, projectRoot) {
  if (!String(content || '').includes(GENERATED_MARKER)) {
    return false;
  }

  const sourcePath = extractGeneratedSquadSource(content);
  if (!sourcePath) {
    return false;
  }

  return fs.existsSync(path.join(projectRoot, sourcePath));
}

function validateCodexSkills(options = {}) {
  const defaults = getDefaultOptions();
  const projectRoot = options.projectRoot || defaults.projectRoot;
  const resolved = {
    ...defaults,
    ...options,
    projectRoot,
    sourceDir: options.sourceDir || path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    skillsDir: options.skillsDir || path.join(projectRoot, '.codex', 'skills'),
  };
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(resolved.skillsDir)) {
    errors.push(`Skills directory not found: ${resolved.skillsDir}`);
    return {
      ok: false,
      checked: 0,
      expected: 0,
      errors,
      warnings,
      missing: [],
      orphaned: [],
      legacy: [],
      ignored: [],
      selfTests: [],
    };
  }

  const agents = parseAllAgents(resolved.sourceDir).filter(isParsableAgent);
  const expected = agents.map(agent => ({
    agentId: agent.id,
    filename: agent.filename,
    skillId: getSkillId(agent.id),
    legacySkillId: getLegacySkillId(agent.id),
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
  const legacyIds = new Set(expected.map(item => item.legacySkillId));
  const orphaned = [];
  const legacy = [];
  const ignored = [];
  if (resolved.strict) {
    const dirs = fs.readdirSync(resolved.skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && (entry.name.startsWith('aiox-') || entry.name.startsWith('aios-')))
      .map(entry => entry.name);
    for (const dir of dirs) {
      if (legacyIds.has(dir)) {
        legacy.push(dir);
        errors.push(`Legacy skill alias directory: ${path.join(path.relative(resolved.projectRoot, resolved.skillsDir), dir)}`);
        continue;
      }
      if (dir.startsWith('aiox-') && !expectedIds.has(dir)) {
        if (resolved.allowOrphaned) {
          continue;
        }
        const skillPath = path.join(resolved.skillsDir, dir, 'SKILL.md');
        let content = '';
        try {
          content = fs.readFileSync(skillPath, 'utf8');
        } catch (_error) {
          content = '';
        }

        if (isGeneratedSquadSkill(content, resolved.projectRoot)) {
          ignored.push(dir);
          continue;
        }

        orphaned.push(dir);
        errors.push(`Orphaned skill directory: ${path.join(path.relative(resolved.projectRoot, resolved.skillsDir), dir)}`);
      }
    }
  }

  if (expected.length === 0) {
    warnings.push('No parseable agents found in sourceDir');
  }

  const selfTests = resolved.selfTest
    ? runSkillSelfTests({
      projectRoot: resolved.projectRoot,
      skillsDir: resolved.skillsDir,
      expected,
    })
    : [];

  for (const test of selfTests) {
    for (const error of test.errors) {
      errors.push(`${test.skillId}: ${error}`);
    }
  }

  return {
    ok: errors.length === 0,
    checked: expected.length,
    expected: expected.length,
    errors,
    warnings,
    missing,
    orphaned,
    legacy,
    ignored,
    selfTests,
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const suffix = result.selfTests && result.selfTests.length > 0
      ? `, ${result.selfTests.length} self-test(s) passed`
      : '';
    return `✅ Codex skills validation passed (${result.checked} skills checked${suffix})`;
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
  parseSkillFrontmatter,
  createSkillToolSelfTestPayload,
  normalizeSkillToolTarget,
  runSkillSelfTests,
  extractGeneratedSquadSource,
  isGeneratedSquadSkill,
  parseArgs,
  getDefaultOptions,
};
