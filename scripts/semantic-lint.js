#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_TARGETS = [
  'README.md',
  'docs/getting-started.md',
  'docs/roadmap.md',
  'docs/strategy',
];

const SEMANTIC_RULESET_VERSION = '1.0.0';

const RULES = [
  {
    id: 'deprecated-expansion-pack',
    severity: 'error',
    pattern: /\bexpansion pack(s)?\b/gi,
    replacement: 'squad',
    reason: 'Use AIOS-first taxonomy for domain agent sets.',
  },
  {
    id: 'deprecated-permission-mode',
    severity: 'error',
    pattern: /\bpermission mode(s)?\b/gi,
    replacement: 'execution profile',
    reason: 'Use risk-oriented autonomy terminology.',
  },
  {
    id: 'legacy-workflow-state-term',
    severity: 'warn',
    pattern: /\bworkflow state\b/gi,
    replacement: 'flow-state',
    reason: 'Prefer flow-state in product-facing differentiation messaging.',
  },
];

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv.filter((arg) => arg.startsWith('--')));
  const files = argv.filter((arg) => !arg.startsWith('--'));
  return {
    staged: args.has('--staged'),
    json: args.has('--json'),
    files,
  };
}

function collectFiles(inputPaths, projectRoot = process.cwd()) {
  const selected = inputPaths && inputPaths.length > 0 ? inputPaths : DEFAULT_TARGETS;
  const files = [];

  for (const input of selected) {
    const resolved = path.resolve(projectRoot, input);
    if (!fs.existsSync(resolved)) {
      continue;
    }

    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
      files.push(resolved);
      continue;
    }

    if (stat.isDirectory()) {
      walkDirectory(resolved, files);
    }
  }

  return files;
}

function walkDirectory(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(full, files);
      continue;
    }
    if (/\.(md|js|yaml|yml)$/i.test(entry.name)) {
      files.push(full);
    }
  }
}

function lintContent(content, relativePath) {
  const findings = [];

  for (const rule of RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const line = 1 + content.slice(0, match.index).split('\n').length - 1;
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        term: match[0],
        replacement: rule.replacement,
        file: relativePath,
        line,
        reason: rule.reason,
      });
    }
  }

  return findings;
}

function runSemanticLint(options = {}, deps = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const targets = options.targets || [];
  const fileCollector = deps.collectFiles || collectFiles;
  const fileReader = deps.readFile || ((filePath) => fs.readFileSync(filePath, 'utf8'));
  const files = fileCollector(targets, projectRoot);

  const findings = [];
  for (const filePath of files) {
    const content = fileReader(filePath);
    const relativePath = path.relative(projectRoot, filePath);
    findings.push(...lintContent(content, relativePath));
  }

  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warn');
  return {
    ok: errors.length === 0,
    version: SEMANTIC_RULESET_VERSION,
    filesScanned: files.length,
    findings,
    errors,
    warnings,
  };
}

function formatHuman(result) {
  const lines = [];
  lines.push(`Semantic Lint v${result.version}`);
  lines.push(`Files scanned: ${result.filesScanned}`);

  if (result.findings.length === 0) {
    lines.push('✅ No semantic term regressions found');
    return lines.join('\n');
  }

  for (const finding of result.findings) {
    lines.push(
      `${finding.severity === 'error' ? '❌' : '⚠️'} ${finding.file}:${finding.line} ${finding.ruleId} -> "${finding.term}" (use "${finding.replacement}")`,
    );
  }

  lines.push('');
  lines.push(
    result.ok
      ? `✅ Completed with ${result.warnings.length} warning(s)`
      : `❌ Failed with ${result.errors.length} error(s) and ${result.warnings.length} warning(s)`,
  );
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const targets = args.files.length > 0
    ? args.files
    : (args.staged ? [] : DEFAULT_TARGETS);
  const result = runSemanticLint({ targets });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatHuman(result));
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  collectFiles,
  lintContent,
  runSemanticLint,
  RULES,
};
