#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FORBIDDEN_ABSOLUTE_PATTERNS = [
  /\/Users\/[^\s/'"]+/g,
  /\/home\/[^\s/'"]+/g,
  /[A-Za-z]:\\Users\\[^\s\\'"]+/g,
];

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    skillsDir: path.join(projectRoot, '.codex', 'skills'),
    requiredFiles: [
      path.join(projectRoot, 'AGENTS.md'),
      path.join(projectRoot, '.aiox-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'),
    ],
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

function listSkillFiles(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('aiox-'))
    .map(entry => path.join(skillsDir, entry.name, 'SKILL.md'))
    .filter(file => fs.existsSync(file));
}

function collectAbsolutePathViolations(content, filePath) {
  const errors = [];
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    for (const pattern of FORBIDDEN_ABSOLUTE_PATTERNS) {
      const matches = line.match(pattern) || [];
      for (const match of matches) {
        errors.push(`${filePath}:${index + 1} forbidden absolute path "${match}"`);
      }
    }
  });
  return errors;
}

function validateSkillPathConventions(content, filePath) {
  const errors = [];
  if (!content.includes('.aiox-core/development/agents/')) {
    errors.push(`${filePath} missing canonical source path ".aiox-core/development/agents/"`);
  }
  if (!content.includes('.aiox-core/development/scripts/generate-greeting.js')) {
    errors.push(`${filePath} missing canonical greeting script path`);
  }
  return errors;
}

function validatePaths(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  const errors = [];
  const checkedFiles = [];

  const skillFiles = listSkillFiles(resolved.skillsDir);
  const filesToCheck = [...resolved.requiredFiles, ...skillFiles];

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) {
      errors.push(`Missing required file: ${path.relative(resolved.projectRoot, file)}`);
      continue;
    }

    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (error) {
      errors.push(`Unable to read file: ${path.relative(resolved.projectRoot, file)} (${error.message})`);
      continue;
    }
    checkedFiles.push(file);
    errors.push(...collectAbsolutePathViolations(content, path.relative(resolved.projectRoot, file)));

    if (file.endsWith('SKILL.md')) {
      errors.push(...validateSkillPathConventions(content, path.relative(resolved.projectRoot, file)));
    }
  }

  return {
    ok: errors.length === 0,
    checked: checkedFiles.length,
    errors,
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    return `✅ Path validation passed (${result.checked} files checked)`;
  }
  return [
    `❌ Path validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map(error => `- ${error}`),
  ].join('\n');
}

function main() {
  const args = parseArgs();
  const result = validatePaths(args);

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
  validatePaths,
  parseArgs,
  getDefaultOptions,
  listSkillFiles,
  collectAbsolutePathViolations,
  validateSkillPathConventions,
};
