'use strict';

const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const {
  detectEnterpriseUpgradeContext,
  toPortablePath,
} = require('./enterprise-detector');
const { EnterpriseUpgradeError } = require('./enterprise-errors');
const {
  buildBlockedOpsFromManifest,
  buildCandidateOpsFromManifest,
  getPreservedPaths,
  loadEnterpriseUpgradeManifest,
} = require('./enterprise-manifest-loader');

const PLAN_SCHEMA_VERSION = '1.0';

function normalizeOptions(options = {}) {
  return {
    targetDir: path.resolve(options.targetDir || process.cwd()),
    enterpriseSource: options.enterpriseSource ? path.resolve(options.enterpriseSource) : null,
    manifestPath: options.manifestPath || null,
    mode: options.mode || 'dry-run',
  };
}

function buildWarnings(context, options = {}) {
  const warnings = [];

  if (context.activeIdes.length === 0) {
    warnings.push('No IDE surfaces detected in target project.');
  }

  if (!context.core.version) {
    warnings.push('AIOX Core version could not be resolved from detected markers.');
  }

  if (!context.pro.version) {
    warnings.push('AIOX Pro version could not be resolved from detected markers.');
  }

  if (options.mode === 'dry-run' || options.dryRun) {
    warnings.push('Dry-run mode: no files will be modified.');
  }

  return warnings;
}

function validateContext(context) {
  if (!context.core.detected) {
    throw new EnterpriseUpgradeError(
      'AIOX_CORE_NOT_DETECTED',
      'AIOX Core installation not detected',
      { targetDir: context.targetDir },
    );
  }

  if (!context.pro.detected) {
    throw new EnterpriseUpgradeError(
      'AIOX_PRO_NOT_DETECTED',
      'AIOX Pro activation not detected',
      { targetDir: context.targetDir },
    );
  }

  if (!context.enterprise.valid) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_SOURCE_NOT_DETECTED',
      'AIOX Enterprise source not detected',
      {
        enterpriseSource: context.enterpriseSourceDir,
        missingMarkers: context.enterprise.missingMarkers,
      },
    );
  }
}

function buildEnterpriseUpgradePlan(options = {}) {
  const normalized = normalizeOptions(options);
  const context = detectEnterpriseUpgradeContext(normalized);
  const manifestBundle = loadEnterpriseUpgradeManifest(normalized.manifestPath || undefined);
  const migrationManifest = manifestBundle.manifest;

  validateContext(context);

  const targetPath = toPortablePath(context.targetDir);
  const enterprisePath = toPortablePath(context.enterprise.path);
  const pro = {
    detected: context.pro.detected,
    source: context.pro.source,
    version: context.pro.version,
    manifestPath: context.pro.manifestPath,
    packagePath: context.pro.packagePath,
    submodulePath: context.pro.submodulePath,
    markers: context.pro.markers,
  };
  const enterprise = {
    detected: context.enterprise.detected,
    valid: context.enterprise.valid,
    path: enterprisePath,
    source: context.enterprise.source,
    product: context.enterprise.product,
    version: context.enterprise.version,
    missingMarkers: context.enterprise.missingMarkers,
    markers: context.enterprise.markers,
  };

  return {
    schemaVersion: PLAN_SCHEMA_VERSION,
    kind: 'aiox.enterprise.upgrade-plan',
    mode: normalized.mode,
    generatedAt: new Date().toISOString(),
    target: {
      path: targetPath,
    },
    enterpriseSource: enterprise,
    enterprise,
    installedCore: context.core,
    core: context.core,
    installedPro: pro,
    pro,
    activeIdes: context.activeIdes,
    entitlement: {
      status: migrationManifest.entitlement.status || 'not-checked',
      required: migrationManifest.entitlement.required,
      envVar: migrationManifest.entitlement.envVar,
      testFixtureEnvVar: migrationManifest.entitlement.testFixtureEnvVar,
    },
    migrationManifest: {
      schemaVersion: migrationManifest.schemaVersion,
      path: toPortablePath(manifestBundle.path),
      groups: migrationManifest.groups.map(group => group.id),
      allowlistCount: migrationManifest.allowlist.length,
      blockedPathCount: migrationManifest.blockedPaths.length,
    },
    preservedPaths: getPreservedPaths(migrationManifest),
    candidateOps: buildCandidateOpsFromManifest(migrationManifest, context.enterprise.path),
    blockedOps: buildBlockedOpsFromManifest(migrationManifest),
    warnings: buildWarnings(context, { mode: normalized.mode }),
  };
}

function serializePlan(plan, format = 'yaml') {
  if (format === 'json') {
    return `${JSON.stringify(plan, null, 2)}\n`;
  }

  return yaml.dump(plan, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
}

function inferPlanFormat(planPath, explicitFormat) {
  if (explicitFormat) {
    return explicitFormat;
  }

  const ext = path.extname(planPath || '').toLowerCase();
  return ext === '.json' ? 'json' : 'yaml';
}

function writeEnterpriseUpgradePlan(plan, planPath, options = {}) {
  if (!planPath) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_PLAN_PATH_REQUIRED',
      '--plan is required to write an Enterprise upgrade plan',
    );
  }

  const absolutePlanPath = path.resolve(planPath);
  const format = inferPlanFormat(absolutePlanPath, options.format);
  fs.ensureDirSync(path.dirname(absolutePlanPath));
  fs.writeFileSync(absolutePlanPath, serializePlan(plan, format), 'utf8');

  return {
    path: absolutePlanPath,
    format,
  };
}

function readRequiredOptionValue(argv, index, optionName) {
  const value = argv[index + 1];

  if (!value || value.startsWith('-')) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_OPTION_VALUE_REQUIRED',
      `Missing value for ${optionName}`,
      { option: optionName },
    );
  }

  return value;
}

function parseEnterpriseUpgradeArgs(argv = []) {
  const options = {
    command: argv[0],
    subcommand: null,
    dryRun: false,
    apply: false,
    targetDir: process.cwd(),
    enterpriseSource: null,
    manifestPath: null,
    planPath: null,
    format: null,
    help: false,
  };

  let startIndex = 1;
  if (options.command === 'upgrade' && argv[1] === 'rollback') {
    options.subcommand = 'rollback';
    startIndex = 2;
  }

  for (let index = startIndex; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--target') {
      options.targetDir = readRequiredOptionValue(argv, index, arg);
      index += 1;
    } else if (arg === '--enterprise-source') {
      options.enterpriseSource = readRequiredOptionValue(argv, index, arg);
      index += 1;
    } else if (arg === '--manifest') {
      options.manifestPath = readRequiredOptionValue(argv, index, arg);
      index += 1;
    } else if (arg === '--plan') {
      options.planPath = readRequiredOptionValue(argv, index, arg);
      index += 1;
    } else if (arg === '--format') {
      options.format = readRequiredOptionValue(argv, index, arg);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new EnterpriseUpgradeError(
        'AIOX_ENTERPRISE_UNKNOWN_OPTION',
        `Unknown enterprise upgrade option: ${arg}`,
      );
    }
  }

  return options;
}

function enterpriseUpgradeHelp() {
  return `
Usage:
  aiox enterprise upgrade --target <project> --enterprise-source <path> --dry-run [--plan <file>]
  aiox enterprise upgrade --target <project> --enterprise-source <path> --apply
  aiox enterprise upgrade rollback --manifest <file>

Plan, apply, or rollback an Enterprise upgrade for an existing AIOX Core + Pro project.

Options:
  --target <project>             Target project to inspect (default: current directory)
  --enterprise-source <path>     Local AIOX Enterprise source checkout
  --manifest <file>              Enterprise migration manifest override
  --dry-run                      Generate plan; do not modify the target project
  --apply                        Apply migration transactionally with backup and manifest
  --plan <file>                  Write the plan to YAML or JSON
  --format <yaml|json>           Override plan format
  -h, --help                     Show this help message
`;
}

async function runEnterpriseUpgradeCli(argv = [], io = {}) {
  const stdout = io.stdout || process.stdout;
  const stderr = io.stderr || process.stderr;

  try {
    const options = parseEnterpriseUpgradeArgs(argv);

    if (options.help || options.command !== 'upgrade') {
      stdout.write(enterpriseUpgradeHelp());
      return options.command === 'upgrade' || options.help ? 0 : 1;
    }

    if (options.subcommand === 'rollback') {
      if (!options.manifestPath) {
        throw new EnterpriseUpgradeError(
          'AIOX_ENTERPRISE_ROLLBACK_MANIFEST_REQUIRED',
          '--manifest is required for rollback',
        );
      }

      const { rollbackEnterpriseUpgrade } = require('./enterprise-rollback');
      const result = rollbackEnterpriseUpgrade(options.manifestPath);
      stdout.write(`Enterprise upgrade rollback written: ${result.rollbackPath}\n`);
      return 0;
    }

    if (options.dryRun && options.apply) {
      throw new EnterpriseUpgradeError(
        'AIOX_ENTERPRISE_MODE_CONFLICT',
        'Use either --dry-run or --apply, not both',
      );
    }

    if (!options.dryRun && !options.apply) {
      throw new EnterpriseUpgradeError(
        'AIOX_ENTERPRISE_MODE_REQUIRED',
        'Use --dry-run to plan or --apply to apply the Enterprise upgrade',
      );
    }

    if (!options.enterpriseSource) {
      throw new EnterpriseUpgradeError(
        'AIOX_ENTERPRISE_SOURCE_REQUIRED',
        '--enterprise-source is required',
      );
    }

    if (options.format && !['yaml', 'json'].includes(options.format)) {
      throw new EnterpriseUpgradeError(
        'AIOX_ENTERPRISE_UNSUPPORTED_FORMAT',
        `Unsupported --format value: ${options.format}`,
      );
    }

    if (options.apply) {
      const { applyEnterpriseUpgrade } = require('./enterprise-upgrader');
      const result = applyEnterpriseUpgrade({
        targetDir: options.targetDir,
        enterpriseSource: options.enterpriseSource,
        manifestPath: options.manifestPath,
      });
      stdout.write(`Enterprise upgrade applied: ${result.manifestPath}\n`);
      return 0;
    }

    const plan = buildEnterpriseUpgradePlan({
      targetDir: options.targetDir,
      enterpriseSource: options.enterpriseSource,
      manifestPath: options.manifestPath,
      mode: 'dry-run',
    });

    if (options.planPath) {
      const written = writeEnterpriseUpgradePlan(plan, options.planPath, { format: options.format });
      stdout.write(`Enterprise upgrade plan written: ${written.path}\n`);
    } else {
      stdout.write(serializePlan(plan, options.format || 'yaml'));
    }

    return 0;
  } catch (error) {
    stderr.write(`${error.message}\n`);
    return 1;
  }
}

module.exports = {
  EnterpriseUpgradeError,
  PLAN_SCHEMA_VERSION,
  buildEnterpriseUpgradePlan,
  enterpriseUpgradeHelp,
  parseEnterpriseUpgradeArgs,
  readRequiredOptionValue,
  runEnterpriseUpgradeCli,
  serializePlan,
  writeEnterpriseUpgradePlan,
};
