'use strict';

const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { EnterpriseUpgradeError } = require('./enterprise-errors');
const { sha256File } = require('./enterprise-utils');

function readExecutionManifest(manifestPath) {
  const absoluteManifestPath = path.resolve(manifestPath);

  if (!fs.existsSync(absoluteManifestPath)) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_ROLLBACK_MANIFEST_NOT_FOUND',
      `Rollback manifest not found: ${absoluteManifestPath}`,
    );
  }

  const manifest = yaml.load(fs.readFileSync(absoluteManifestPath, 'utf8')) || {};

  if (manifest.kind !== 'aiox.enterprise.upgrade-execution-manifest') {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_ROLLBACK_MANIFEST_INVALID',
      'Rollback requires an Enterprise upgrade execution manifest',
    );
  }

  return {
    path: absoluteManifestPath,
    manifest,
  };
}

function rollbackEnterpriseUpgrade(manifestPath) {
  const bundle = readExecutionManifest(manifestPath);
  const manifest = bundle.manifest;
  const targetDir = path.resolve(manifest.target.path);
  const restored = [];
  const errors = [];

  for (const backup of manifest.backedUp || []) {
    const backupPath = path.join(targetDir, backup.backupPath);
    const destPath = path.join(targetDir, backup.path);

    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file missing: ${backup.backupPath}`);
      }

      fs.ensureDirSync(path.dirname(destPath));
      fs.copyFileSync(backupPath, destPath);
      restored.push({
        path: backup.path,
        sha256: sha256File(destPath),
      });
    } catch (error) {
      errors.push({
        path: backup.path,
        message: error.message,
      });
    }
  }

  const rollbackManifest = {
    schemaVersion: '1.0',
    kind: 'aiox.enterprise.rollback-manifest',
    rolledBackAt: new Date().toISOString(),
    sourceManifest: bundle.path,
    target: manifest.target,
    restored,
    errors,
  };
  const rollbackPath = path.join(targetDir, '.aiox', 'enterprise-upgrade-rollback.yaml');
  fs.ensureDirSync(path.dirname(rollbackPath));
  fs.writeFileSync(rollbackPath, yaml.dump(rollbackManifest, { lineWidth: 120, noRefs: true, sortKeys: false }), 'utf8');

  if (errors.length > 0) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_ROLLBACK_INCOMPLETE',
      'Enterprise rollback completed with errors',
      { errors, rollbackPath },
    );
  }

  return {
    success: true,
    rollbackPath,
    restored,
  };
}

module.exports = {
  readExecutionManifest,
  rollbackEnterpriseUpgrade,
};
