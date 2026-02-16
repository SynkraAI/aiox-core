#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { spawnSync } = require('child_process');
const { validateClaudeIntegration } = require('./validate-claude-integration');
const { validateCodexIntegration } = require('./validate-codex-integration');
const { validateGeminiIntegration } = require('./validate-gemini-integration');
const { validateCodexSkills } = require('./codex-skills-sync/validate');
const { validatePaths } = require('./validate-paths');

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(
    argv.filter((arg) => !arg.startsWith('--contract=') && !arg.startsWith('--diff=')),
  );
  const contractArg = argv.find((arg) => arg.startsWith('--contract='));
  const diffArg = argv.find((arg) => arg.startsWith('--diff='));
  return {
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
    contractPath: contractArg ? contractArg.slice('--contract='.length) : null,
    diffPath: diffArg ? diffArg.slice('--diff='.length) : null,
  };
}

function runSyncValidate(ide, projectRoot) {
  const script = path.join('.aios-core', 'infrastructure', 'scripts', 'ide-sync', 'index.js');
  const result = spawnSync('node', [script, 'validate', '--ide', ide, '--strict'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    errors: result.status === 0 ? [] : [`Sync validation failed for ${ide}`],
    warnings: [],
    raw: result.stdout || result.stderr || '',
  };
}

function getDefaultContractPath(projectRoot = process.cwd()) {
  return path.join(
    projectRoot,
    '.aios-core',
    'infrastructure',
    'contracts',
    'compatibility',
    'aios-4.0.4.yaml',
  );
}

function loadCompatibilityContract(contractPath) {
  if (!contractPath || !fs.existsSync(contractPath)) {
    return null;
  }
  const raw = fs.readFileSync(contractPath, 'utf8');
  return yaml.load(raw);
}

function normalizeResult(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['Validator returned invalid result'], warnings: [] };
  }
  return {
    ok: Boolean(input.ok),
    errors: Array.isArray(input.errors) ? input.errors : [],
    warnings: Array.isArray(input.warnings) ? input.warnings : [],
    metrics: input.metrics || {},
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateCompatibilityContract(contract, resultById, options = {}) {
  const violations = [];

  if (!contract || typeof contract !== 'object') {
    return ['Compatibility contract is missing or invalid'];
  }

  const matrix = Array.isArray(contract.ide_matrix) ? contract.ide_matrix : [];
  if (matrix.length === 0) {
    return ['Compatibility contract ide_matrix is empty'];
  }

  const docsPath = options.docsPath;
  if (!docsPath || !fs.existsSync(docsPath)) {
    violations.push(`Compatibility matrix document not found: ${docsPath || 'undefined'}`);
    return violations;
  }
  const docsContent = fs.readFileSync(docsPath, 'utf8');

  for (const ide of matrix) {
    const ideName = ide.ide || 'unknown';
    const displayName = ide.display_name || ideName;
    const requiredChecks = Array.isArray(ide.required_checks) ? ide.required_checks : [];
    const expectedStatus = ide.expected_status;

    if (!expectedStatus) {
      violations.push(`Contract missing expected_status for IDE "${ideName}"`);
    }

    const rowRegex = new RegExp(
      `\\|\\s*${escapeRegex(displayName)}\\s*\\|\\s*${escapeRegex(expectedStatus || '')}\\s*\\|`,
      'i',
    );
    if (!rowRegex.test(docsContent)) {
      violations.push(
        `Docs matrix mismatch for "${displayName}": expected status "${expectedStatus}" in ${options.docsPathRelative}`,
      );
    }

    for (const checkId of requiredChecks) {
      const checkResult = resultById[checkId];
      if (!checkResult) {
        violations.push(`Contract requires unknown check "${checkId}" for IDE "${ideName}"`);
        continue;
      }
      if (!checkResult.ok) {
        violations.push(`Contract violation for "${ideName}": required check "${checkId}" failed`);
      }
    }
  }

  const globalRequiredChecks = Array.isArray(contract.global_required_checks)
    ? contract.global_required_checks
    : [];
  for (const checkId of globalRequiredChecks) {
    const checkResult = resultById[checkId];
    if (!checkResult) {
      violations.push(`Contract requires unknown global check "${checkId}"`);
      continue;
    }
    if (!checkResult.ok) {
      violations.push(`Contract violation: global required check "${checkId}" failed`);
    }
  }

  return violations;
}

function sortUnique(values = []) {
  return [...new Set(values)].sort();
}

function diffCompatibilityContracts(currentContract, previousContract) {
  if (!currentContract || !previousContract) {
    return null;
  }

  const currentRelease = currentContract.release || null;
  const previousRelease = previousContract.release || null;
  const releaseChanged = currentRelease !== previousRelease;

  const currentGlobalChecks = sortUnique(currentContract.global_required_checks || []);
  const previousGlobalChecks = sortUnique(previousContract.global_required_checks || []);
  const globalChecksAdded = currentGlobalChecks.filter((item) => !previousGlobalChecks.includes(item));
  const globalChecksRemoved = previousGlobalChecks.filter((item) => !currentGlobalChecks.includes(item));

  const currentByIde = Object.fromEntries((currentContract.ide_matrix || []).map((item) => [item.ide, item]));
  const previousByIde = Object.fromEntries((previousContract.ide_matrix || []).map((item) => [item.ide, item]));
  const ideKeys = sortUnique([...Object.keys(currentByIde), ...Object.keys(previousByIde)]);

  const ideChanges = [];
  for (const ide of ideKeys) {
    const current = currentByIde[ide];
    const previous = previousByIde[ide];

    if (!previous && current) {
      ideChanges.push({ ide, type: 'added', current });
      continue;
    }
    if (previous && !current) {
      ideChanges.push({ ide, type: 'removed', previous });
      continue;
    }

    const currentStatus = current.expected_status || null;
    const previousStatus = previous.expected_status || null;
    const statusChanged = currentStatus !== previousStatus;
    const currentChecks = sortUnique(current.required_checks || []);
    const previousChecks = sortUnique(previous.required_checks || []);
    const checksAdded = currentChecks.filter((item) => !previousChecks.includes(item));
    const checksRemoved = previousChecks.filter((item) => !currentChecks.includes(item));

    if (statusChanged || checksAdded.length > 0 || checksRemoved.length > 0) {
      ideChanges.push({
        ide,
        type: 'changed',
        status: { previous: previousStatus, current: currentStatus },
        required_checks: {
          added: checksAdded,
          removed: checksRemoved,
        },
      });
    }
  }

  return {
    from_release: previousRelease,
    to_release: currentRelease,
    release_changed: releaseChanged,
    global_required_checks: {
      added: globalChecksAdded,
      removed: globalChecksRemoved,
    },
    ide_changes: ideChanges,
    has_changes:
      releaseChanged
      || globalChecksAdded.length > 0
      || globalChecksRemoved.length > 0
      || ideChanges.length > 0,
  };
}

function runParityValidation(options = {}, deps = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const runSync = deps.runSyncValidate || runSyncValidate;
  const runClaudeIntegration = deps.validateClaudeIntegration || validateClaudeIntegration;
  const runCodexIntegration = deps.validateCodexIntegration || validateCodexIntegration;
  const runGeminiIntegration = deps.validateGeminiIntegration || validateGeminiIntegration;
  const runCodexSkills = deps.validateCodexSkills || validateCodexSkills;
  const runPaths = deps.validatePaths || validatePaths;
  const resolvedContractPath = options.contractPath
    ? path.resolve(projectRoot, options.contractPath)
    : getDefaultContractPath(projectRoot);
  const loadContract = deps.loadCompatibilityContract || loadCompatibilityContract;
  const contract = loadContract(resolvedContractPath);
  const resolvedDiffPath = options.diffPath ? path.resolve(projectRoot, options.diffPath) : null;
  const previousContract = resolvedDiffPath ? loadContract(resolvedDiffPath) : null;
  const docsPath = path.join(projectRoot, 'docs', 'ide-integration.md');
  const docsPathRelative = path.relative(projectRoot, docsPath);
  const checks = [
    { id: 'claude-sync', exec: () => runSync('claude-code', projectRoot) },
    { id: 'claude-integration', exec: () => runClaudeIntegration({ projectRoot }) },
    { id: 'codex-sync', exec: () => runSync('codex', projectRoot) },
    { id: 'codex-integration', exec: () => runCodexIntegration({ projectRoot }) },
    { id: 'gemini-sync', exec: () => runSync('gemini', projectRoot) },
    { id: 'gemini-integration', exec: () => runGeminiIntegration({ projectRoot }) },
    { id: 'cursor-sync', exec: () => runSync('cursor', projectRoot) },
    { id: 'github-copilot-sync', exec: () => runSync('github-copilot', projectRoot) },
    { id: 'antigravity-sync', exec: () => runSync('antigravity', projectRoot) },
    { id: 'codex-skills', exec: () => runCodexSkills({ projectRoot, strict: true, quiet: true }) },
    { id: 'paths', exec: () => runPaths({ projectRoot }) },
  ];

  const results = checks.map((check) => {
    const normalized = normalizeResult(check.exec());
    return { id: check.id, ...normalized };
  });
  const resultById = Object.fromEntries(results.map((r) => [r.id, r]));
  const contractViolations = validateCompatibilityContract(contract, resultById, {
    docsPath,
    docsPathRelative,
  });
  const contractSummary = contract
    ? {
        release: contract.release || null,
        path: path.relative(projectRoot, resolvedContractPath),
      }
    : {
        release: null,
        path: path.relative(projectRoot, resolvedContractPath),
      };

  return {
    ok: results.every((r) => r.ok) && contractViolations.length === 0,
    checks: results,
    contract: contractSummary,
    contractDiff: diffCompatibilityContracts(contract, previousContract),
    contractViolations,
  };
}

function formatHumanReport(result) {
  const lines = [];
  if (result.contract && result.contract.release) {
    lines.push(`Compatibility Contract: ${result.contract.release} (${result.contract.path})`);
    lines.push('');
  }
  if (result.contractDiff) {
    lines.push(
      `Contract Diff: ${result.contractDiff.from_release || 'unknown'} -> ${result.contractDiff.to_release || 'unknown'}`,
    );
    if (!result.contractDiff.has_changes) {
      lines.push('- no changes');
    } else {
      if (result.contractDiff.release_changed) {
        lines.push('- release changed');
      }
      const globalAdded = result.contractDiff.global_required_checks.added || [];
      const globalRemoved = result.contractDiff.global_required_checks.removed || [];
      if (globalAdded.length > 0) {
        lines.push(`- global checks added: ${globalAdded.join(', ')}`);
      }
      if (globalRemoved.length > 0) {
        lines.push(`- global checks removed: ${globalRemoved.join(', ')}`);
      }
      for (const ideChange of result.contractDiff.ide_changes || []) {
        lines.push(`- ${ideChange.ide}: ${ideChange.type}`);
      }
    }
    lines.push('');
  }
  for (const check of result.checks) {
    lines.push(`${check.ok ? '✅' : '❌'} ${check.id}`);
    if (check.errors.length > 0) {
      lines.push(...check.errors.map((e) => `- ${e}`));
    }
    if (check.warnings.length > 0) {
      lines.push(...check.warnings.map((w) => `⚠️ ${w}`));
    }
  }
  if (Array.isArray(result.contractViolations) && result.contractViolations.length > 0) {
    lines.push('');
    lines.push('❌ Compatibility Contract Violations');
    lines.push(...result.contractViolations.map((v) => `- ${v}`));
  }
  lines.push('');
  lines.push(result.ok ? '✅ Parity validation passed' : '❌ Parity validation failed');
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = runParityValidation(args);

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
  parseArgs,
  runSyncValidate,
  runParityValidation,
  normalizeResult,
  formatHumanReport,
  diffCompatibilityContracts,
};
