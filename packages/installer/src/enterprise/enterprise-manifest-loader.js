'use strict';

const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const { EnterpriseUpgradeError } = require('./enterprise-errors');
const { toPortablePath } = require('./enterprise-detector');

const DEFAULT_MANIFEST_PATH = path.join(__dirname, 'enterprise-upgrade-manifest.yaml');
const MANIFEST_SCHEMA_PATH = path.join(__dirname, 'enterprise-upgrade-manifest.schema.json');

function normalizeMigrationPath(inputPath) {
  return toPortablePath(inputPath || '')
    .replace(/^\/+/, '')
    .replace(/^\.\//, '');
}

function escapeRegExp(input) {
  return input.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(pattern) {
  let regex = '^';
  const normalized = normalizeMigrationPath(pattern);

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === '*' && next === '*') {
      regex += '.*';
      index += 1;
    } else if (char === '*') {
      regex += '[^/]*';
    } else {
      regex += escapeRegExp(char);
    }
  }

  regex += '$';
  return new RegExp(regex);
}

function pathMatchesPattern(filePath, pattern) {
  const normalizedPath = normalizeMigrationPath(filePath);
  const normalizedPattern = normalizeMigrationPath(pattern);

  if (normalizedPattern.endsWith('/**')) {
    const prefix = normalizedPattern.slice(0, -3);
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  }

  if (normalizedPattern.startsWith('**/')) {
    const rootPattern = normalizedPattern.slice(3);
    return globToRegExp(normalizedPattern).test(normalizedPath)
      || globToRegExp(rootPattern).test(normalizedPath);
  }

  return globToRegExp(normalizedPattern).test(normalizedPath);
}

function createValidator(schemaPath = MANIFEST_SCHEMA_PATH) {
  const schema = fs.readJsonSync(schemaPath);
  const ajv = new Ajv({
    allErrors: true,
    allowUnionTypes: true,
    strict: false,
  });

  return ajv.compile(schema);
}

function formatValidationErrors(errors = []) {
  return errors.map(error => {
    const location = error.instancePath || '/';
    return `${location} ${error.message}`;
  }).join('; ');
}

function validateEnterpriseUpgradeManifest(manifest, options = {}) {
  const validate = createValidator(options.schemaPath || MANIFEST_SCHEMA_PATH);
  const valid = validate(manifest);

  if (!valid) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_MANIFEST_INVALID',
      `Enterprise upgrade manifest invalid: ${formatValidationErrors(validate.errors)}`,
      { errors: validate.errors },
    );
  }

  return true;
}

function loadEnterpriseUpgradeManifest(manifestPath = DEFAULT_MANIFEST_PATH, options = {}) {
  const absoluteManifestPath = path.resolve(manifestPath || DEFAULT_MANIFEST_PATH);

  if (!fs.existsSync(absoluteManifestPath)) {
    throw new EnterpriseUpgradeError(
      'AIOX_ENTERPRISE_MANIFEST_NOT_FOUND',
      `Enterprise upgrade manifest not found: ${absoluteManifestPath}`,
    );
  }

  const manifest = yaml.load(fs.readFileSync(absoluteManifestPath, 'utf8')) || {};
  validateEnterpriseUpgradeManifest(manifest, options);

  return {
    path: absoluteManifestPath,
    manifest,
  };
}

function findBlockedPathRule(filePath, manifest) {
  return manifest.blockedPaths.find(rule => pathMatchesPattern(filePath, rule.pattern)) || null;
}

function findAllowlistEntry(filePath, manifest) {
  return manifest.allowlist.find(entry => pathMatchesPattern(filePath, entry.path)) || null;
}

function resolveMigrationPolicy(filePath, manifest) {
  const normalizedPath = normalizeMigrationPath(filePath);
  const blocked = findBlockedPathRule(normalizedPath, manifest);

  if (blocked) {
    return {
      allowed: false,
      path: normalizedPath,
      action: blocked.action,
      policy: blocked.action,
      reason: blocked.reason,
      blockedBy: blocked.pattern,
      severity: blocked.severity || 'high',
      group: null,
    };
  }

  const allowed = findAllowlistEntry(normalizedPath, manifest);
  if (!allowed) {
    return {
      allowed: false,
      path: normalizedPath,
      action: 'deny',
      policy: 'deny',
      reason: 'Path is not declared in the Enterprise migration allowlist.',
      blockedBy: 'allowlist',
      severity: 'high',
      group: null,
    };
  }

  return {
    allowed: true,
    path: normalizedPath,
    action: allowed.policy,
    policy: allowed.policy,
    group: allowed.group,
    reason: allowed.reason,
    required: allowed.required === true,
    allowlistPath: allowed.path,
  };
}

function getPreservedPaths(manifest) {
  return manifest.blockedPaths
    .filter(rule => rule.action === 'preserve')
    .map(rule => rule.pattern);
}

function buildCandidateOpsFromManifest(manifest, enterpriseSourceDir = null) {
  return manifest.allowlist.map(entry => {
    const sourcePath = enterpriseSourceDir ? path.join(enterpriseSourceDir, entry.path.replace(/\/\*\*$/, '')) : null;
    const exists = sourcePath ? fs.existsSync(sourcePath) : null;

    return {
      action: entry.policy,
      path: entry.path,
      group: entry.group,
      source: 'enterprise-source',
      required: entry.required === true,
      exists,
      reason: entry.reason,
    };
  });
}

function buildBlockedOpsFromManifest(manifest) {
  return manifest.blockedPaths.map(rule => ({
    action: rule.action,
    path: rule.pattern,
    severity: rule.severity || 'high',
    reason: rule.reason,
  }));
}

module.exports = {
  DEFAULT_MANIFEST_PATH,
  MANIFEST_SCHEMA_PATH,
  buildBlockedOpsFromManifest,
  buildCandidateOpsFromManifest,
  findAllowlistEntry,
  findBlockedPathRule,
  getPreservedPaths,
  loadEnterpriseUpgradeManifest,
  normalizeMigrationPath,
  pathMatchesPattern,
  resolveMigrationPolicy,
  validateEnterpriseUpgradeManifest,
};
