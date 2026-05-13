'use strict';

const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const fastGlob = require('fast-glob');
const { spawnSync } = require('child_process');
const { buildEnterpriseUpgradePlan } = require('./enterprise-upgrade-plan');
const { EnterpriseUpgradeError } = require('./enterprise-errors');
const {
  resolveMigrationPolicy,
} = require('./enterprise-manifest-loader');
const { toPortablePath } = require('./enterprise-detector');
const { sha256File } = require('./enterprise-utils');

function nowStamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
}

function hasGlob(pattern) {
  return /[*?[\]{}]/.test(pattern);
}

function readYamlIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
}

function writeYaml(filePath, data) {
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false }), 'utf8');
}

function arrayItemKey(item) {
  return typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);
}

function mergeArrays(source, target) {
  const merged = [...target];
  const seen = new Set(target.map(item => arrayItemKey(item)));

  for (const item of source) {
    const key = arrayItemKey(item);
    if (!seen.has(key)) {
      merged.push(item);
      seen.add(key);
    }
  }

  return merged;
}

function mergeDeep(source, target) {
  if (Array.isArray(source) && Array.isArray(target)) {
    return mergeArrays(source, target);
  }

  if (Array.isArray(source) || Array.isArray(target)) {
    return target === undefined ? source : target;
  }

  if (!source || typeof source !== 'object') {
    return target === undefined ? source : target;
  }

  const result = { ...source };
  if (!target || typeof target !== 'object') {
    return result;
  }

  for (const [key, value] of Object.entries(target)) {
    result[key] = mergeDeep(result[key], value);
  }

  return result;
}

function expandEntryPaths(enterpriseSourceDir, pattern) {
  const normalized = toPortablePath(pattern);

  if (hasGlob(normalized)) {
    return fastGlob.sync(normalized, {
      cwd: enterpriseSourceDir,
      dot: true,
      onlyFiles: true,
      unique: true,
    }).sort();
  }

  const absolutePath = path.join(enterpriseSourceDir, normalized);
  if (!fs.existsSync(absolutePath)) {
    return [];
  }

  if (fs.statSync(absolutePath).isDirectory()) {
    return fastGlob.sync('**/*', {
      cwd: absolutePath,
      dot: true,
      onlyFiles: true,
      unique: true,
    }).map(filePath => toPortablePath(path.join(normalized, filePath))).sort();
  }

  return [normalized];
}

function ensureEnterpriseEntitlement(entitlement, env = process.env) {
  const keyName = entitlement.envVar || 'AIOX_ENTERPRISE_KEY';
  const fixtureName = entitlement.testFixtureEnvVar || 'AIOX_ENTERPRISE_TEST_FIXTURE';

  if (!entitlement.required) {
    return {
      status: 'not-required',
      envVar: keyName,
      testFixtureEnvVar: fixtureName,
    };
  }

  if (env[keyName]) {
    return {
      status: 'present',
      envVar: keyName,
      testFixtureEnvVar: fixtureName,
    };
  }

  if (env[fixtureName]) {
    return {
      status: 'test-fixture',
      envVar: keyName,
      testFixtureEnvVar: fixtureName,
    };
  }

  throw new EnterpriseUpgradeError(
    'AIOX_ENTERPRISE_ENTITLEMENT_REQUIRED',
    `Enterprise entitlement required: set ${keyName} or ${fixtureName}`,
  );
}

function createEmptyExecutionManifest(options) {
  return {
    schemaVersion: '1.0',
    kind: 'aiox.enterprise.upgrade-execution-manifest',
    mode: 'apply',
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'running',
    target: {
      path: toPortablePath(options.targetDir),
    },
    enterpriseSource: {
      path: toPortablePath(options.enterpriseSource),
      product: options.plan.enterprise.product,
      version: options.plan.enterprise.version,
      source: options.plan.enterprise.source,
    },
    migrationManifest: options.plan.migrationManifest,
    entitlement: options.entitlement,
    backupPath: toPortablePath(options.backupDir),
    copied: [],
    merged: [],
    preserved: [],
    denied: [],
    backedUp: [],
    validated: [],
    errors: [],
    doctor: null,
  };
}

function backupFile(targetDir, backupDir, relativePath, executionManifest) {
  const sourcePath = path.join(targetDir, relativePath);
  const backupPath = path.join(backupDir, relativePath);

  fs.ensureDirSync(path.dirname(backupPath));
  fs.copyFileSync(sourcePath, backupPath);

  const record = {
    path: relativePath,
    backupPath: toPortablePath(path.relative(targetDir, backupPath)),
    sha256: sha256File(backupPath),
  };
  executionManifest.backedUp.push(record);

  return record;
}

function validateCopiedFile(relativePath, sourcePath, destPath, executionManifest) {
  const sourceHash = sha256File(sourcePath);
  const destHash = sha256File(destPath);

  if (sourceHash !== destHash) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_CHECKSUM_MISMATCH',
      `Checksum mismatch after copy: ${relativePath}`,
      { relativePath, sourceHash, destHash },
    );
  }

  executionManifest.validated.push({
    path: relativePath,
    type: 'checksum',
    sha256: destHash,
  });

  return destHash;
}

function recordPreserved(executionManifest, relativePath, reason) {
  executionManifest.preserved.push({
    path: relativePath,
    reason,
  });
}

function applyCopyIfMissing(operation) {
  const {
    relativePath,
    sourcePath,
    destPath,
    executionManifest,
  } = operation;

  if (fs.existsSync(destPath)) {
    recordPreserved(executionManifest, relativePath, 'Destination already exists; copy-if-missing preserved it.');
    return;
  }

  fs.ensureDirSync(path.dirname(destPath));
  fs.copyFileSync(sourcePath, destPath);
  const sha256 = validateCopiedFile(relativePath, sourcePath, destPath, executionManifest);

  executionManifest.copied.push({
    path: relativePath,
    policy: 'copy-if-missing',
    sha256,
  });
}

function applyHashOverwriteWithBackup(operation) {
  const {
    relativePath,
    sourcePath,
    destPath,
    targetDir,
    backupDir,
    executionManifest,
  } = operation;

  if (fs.existsSync(destPath)) {
    const sourceHash = sha256File(sourcePath);
    const destHash = sha256File(destPath);

    if (sourceHash === destHash) {
      executionManifest.validated.push({
        path: relativePath,
        type: 'unchanged',
        sha256: destHash,
      });
      return;
    }

    backupFile(targetDir, backupDir, relativePath, executionManifest);
  }

  fs.ensureDirSync(path.dirname(destPath));
  fs.copyFileSync(sourcePath, destPath);
  const sha256 = validateCopiedFile(relativePath, sourcePath, destPath, executionManifest);

  executionManifest.copied.push({
    path: relativePath,
    policy: 'hash-overwrite-with-backup',
    sha256,
  });
}

function applyMergeYaml(operation) {
  const {
    relativePath,
    sourcePath,
    destPath,
    targetDir,
    backupDir,
    executionManifest,
  } = operation;

  const sourceYaml = readYamlIfExists(sourcePath);
  const targetYaml = readYamlIfExists(destPath);
  const existed = fs.existsSync(destPath);

  if (existed) {
    backupFile(targetDir, backupDir, relativePath, executionManifest);
  }

  const merged = mergeDeep(sourceYaml, targetYaml);
  writeYaml(destPath, merged);
  const mergedHash = sha256File(destPath);

  executionManifest.merged.push({
    path: relativePath,
    policy: 'merge-yaml',
    sha256: mergedHash,
    backedUp: existed,
  });
  executionManifest.validated.push({
    path: relativePath,
    type: 'exists',
    sha256: mergedHash,
  });
}

function runDoctorIfAvailable(targetDir) {
  const localBin = path.join(targetDir, 'bin', 'aiox.js');

  if (!fs.existsSync(localBin)) {
    return {
      skipped: true,
      reason: 'aiox doctor --json not available in target',
    };
  }

  const result = spawnSync(process.execPath, [localBin, 'doctor', '--json'], {
    cwd: targetDir,
    encoding: 'utf8',
    timeout: 30000,
  });

  return {
    skipped: false,
    status: result.status,
    stdout: result.stdout ? result.stdout.slice(0, 4000) : '',
    stderr: result.stderr ? result.stderr.slice(0, 4000) : '',
  };
}

function assertProMarkersPreserved(targetDir) {
  const markers = ['pro', 'pro-installed-manifest.yaml', 'pro-version.json'];
  return markers.map(marker => ({
    path: marker,
    exists: fs.existsSync(path.join(targetDir, marker)),
  }));
}

function applyEnterpriseUpgrade(options = {}) {
  const targetDir = path.resolve(options.targetDir || process.cwd());
  const enterpriseSource = options.enterpriseSource ? path.resolve(options.enterpriseSource) : null;

  if (!enterpriseSource) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_SOURCE_REQUIRED',
      '--enterprise-source is required',
    );
  }

  const plan = options.plan || buildEnterpriseUpgradePlan({
    targetDir,
    enterpriseSource,
    manifestPath: options.manifestPath,
    mode: 'dry-run',
  });
  const entitlement = ensureEnterpriseEntitlement(plan.entitlement, options.env || process.env);
  const backupDir = path.join(targetDir, '.aiox', 'enterprise-upgrade-backups', options.timestamp || nowStamp());
  const manifestPath = options.manifestPathOut
    ? path.resolve(options.manifestPathOut)
    : path.join(targetDir, '.aiox', 'enterprise-upgrade-manifest.yaml');
  const executionManifest = createEmptyExecutionManifest({
    targetDir,
    enterpriseSource,
    plan,
    entitlement,
    backupDir,
  });

  try {
    for (const blockedOp of plan.blockedOps) {
      executionManifest.denied.push({
        path: blockedOp.path,
        action: blockedOp.action,
        reason: blockedOp.reason,
      });
    }

    for (const candidate of plan.candidateOps) {
      const files = expandEntryPaths(enterpriseSource, candidate.path);

      if (candidate.required && files.length === 0) {
        throw new EnterpriseUpgradeError(
          'AIOX_ENTERPRISE_REQUIRED_SOURCE_MISSING',
          `Required Enterprise source path missing: ${candidate.path}`,
          { path: candidate.path },
        );
      }

      for (const relativePath of files) {
        const policy = resolveMigrationPolicy(relativePath, {
          allowlist: plan.candidateOps.map(op => ({
            path: op.path,
            group: op.group,
            policy: op.action,
            reason: op.reason,
            required: op.required,
          })),
          blockedPaths: plan.blockedOps.map(op => ({
            pattern: op.path,
            action: op.action,
            reason: op.reason,
            severity: op.severity,
          })),
        });

        if (!policy.allowed) {
          executionManifest.denied.push({
            path: relativePath,
            action: policy.action,
            reason: policy.reason,
          });
          continue;
        }

        const sourcePath = path.join(enterpriseSource, relativePath);
        const destPath = path.join(targetDir, relativePath);
        const operation = {
          relativePath,
          sourcePath,
          destPath,
          targetDir,
          backupDir,
          executionManifest,
        };

        if (policy.policy === 'copy-if-missing') {
          applyCopyIfMissing(operation);
        } else if (policy.policy === 'merge-yaml') {
          applyMergeYaml(operation);
        } else if (policy.policy === 'hash-overwrite-with-backup') {
          applyHashOverwriteWithBackup(operation);
        } else if (policy.policy === 'preserve') {
          recordPreserved(executionManifest, relativePath, policy.reason);
        } else {
          executionManifest.denied.push({
            path: relativePath,
            action: policy.policy,
            reason: policy.reason,
          });
        }
      }
    }

    executionManifest.validated.push(...assertProMarkersPreserved(targetDir).map(marker => ({
      path: marker.path,
      type: 'pro-marker-preserved',
      exists: marker.exists,
    })));
    executionManifest.doctor = runDoctorIfAvailable(targetDir);
    executionManifest.status = 'success';
  } catch (error) {
    executionManifest.status = 'failed';
    executionManifest.errors.push({
      code: error.code || 'AIOX_ENTERPRISE_APPLY_FAILED',
      message: error.message,
      details: error.details || {},
    });
    throw error;
  } finally {
    executionManifest.completedAt = new Date().toISOString();
    writeYaml(manifestPath, executionManifest);
  }

  return {
    success: executionManifest.status === 'success',
    manifestPath,
    backupDir,
    manifest: executionManifest,
  };
}

module.exports = {
  applyEnterpriseUpgrade,
  assertProMarkersPreserved,
  createEmptyExecutionManifest,
  ensureEnterpriseEntitlement,
  expandEntryPaths,
  mergeDeep,
  sha256File,
};
