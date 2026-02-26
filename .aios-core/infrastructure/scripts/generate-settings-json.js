#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CORE_CONFIG_FILE = '.aios-core/core-config.yaml';
const SETTINGS_FILE = '.claude/settings.json';
const TOOLS = ['Edit', 'Write'];

/**
 * Validate that a boundary path does not escape the project root via traversal.
 * Rejects paths containing '..' segments or absolute paths.
 */
function validateBoundaryPath(p) {
  const segments = p.replace(/\\/g, '/').split('/');
  if (segments.some(function(s) { return s === '..'; })) {
    throw new Error('Path traversal detected in boundary config: ' + p);
  }
  if (path.isAbsolute(p)) {
    throw new Error('Absolute path not allowed in boundary config: ' + p);
  }
}

/**
 * Read boundary configuration from core-config.yaml.
 */
function readBoundaryConfig(projectRoot) {
  const configPath = path.join(projectRoot, CORE_CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    throw new Error(`core-config.yaml not found at ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(content);

  if (!config || !config.boundary) {
    throw new Error('core-config.yaml missing "boundary" section');
  }

  const { boundary } = config;

  const result = {
    frameworkProtection: boundary.frameworkProtection !== false,
    protected: Array.isArray(boundary.protected) ? boundary.protected : [],
    exceptions: Array.isArray(boundary.exceptions) ? boundary.exceptions : [],
  };

  for (const p of result.protected) { validateBoundaryPath(p); }
  for (const p of result.exceptions) { validateBoundaryPath(p); }

  return result;
}

/**
 * Check if an exception path falls within a given directory.
 */
function isChildOf(exceptionPath, parentDir) {
  const clean = exceptionPath.replace(/\/\*\*$/, '');
  const parts = clean.split('/');
  const parentParts = parentDir.split('/');

  if (parts.length <= parentParts.length) {
    return false;
  }

  for (let i = 0; i < parentParts.length; i++) {
    if (parts[i] !== parentParts[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Expand a directory one level deep into subdirectory/** and file entries.
 * Returns { dirs: [...], files: [...] } sorted separately.
 */
function expandOneLevel(dirRelative, projectRoot) {
  const dirAbsolute = path.join(projectRoot, dirRelative);

  if (!fs.existsSync(dirAbsolute)) {
    return { dirs: [dirRelative + '/**'], files: [] };
  }

  const entries = fs.readdirSync(dirAbsolute, { withFileTypes: true });
  const dirs = [];
  const files = [];

  for (const entry of entries) {
    const entryRelative = dirRelative + '/' + entry.name;
    if (entry.isDirectory()) {
      dirs.push(entryRelative);
    } else {
      files.push(entryRelative);
    }
  }

  dirs.sort();
  files.sort();

  return { dirs, files };
}

/**
 * For a subdirectory that has exceptions inside it, expand to individual
 * file-level deny rules excluding files/dirs covered by exceptions.
 */
function expandSubdirWithExceptions(subdirPath, exceptions, projectRoot) {
  const dirAbsolute = path.join(projectRoot, subdirPath);

  if (!fs.existsSync(dirAbsolute)) {
    return [subdirPath + '/**'];
  }

  const entries = fs.readdirSync(dirAbsolute, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const entryRelative = subdirPath + '/' + entry.name;
    const entryGlob = entry.isDirectory() ? entryRelative + '/**' : entryRelative;

    const isCoveredByException = exceptions.some(function(exc) {
      return exc === entryGlob || exc === entryRelative;
    });

    if (!isCoveredByException) {
      result.push(entryGlob);
    }
  }

  result.sort();
  return result;
}

/**
 * Expand protected paths according to the specific rules:
 * - .aios-core/core/** gets expanded one level deep
 *   - Subdirs with exceptions inside get expanded further (file-level)
 *   - Order: regular subdirs first (sorted), then root files (sorted),
 *     then exception-expanded subdirs (sorted) at the end
 * - All other paths stay as-is (no expansion)
 */
function expandProtectedPaths(protectedPaths, exceptions, projectRoot) {
  const allPaths = [];

  for (const globPath of protectedPaths) {
    if (globPath === '.aios-core/core/**') {
      const { dirs, files } = expandOneLevel('.aios-core/core', projectRoot);

      // Separate dirs into regular (no exceptions inside) and special (has exceptions)
      const regularDirs = [];
      const specialDirEntries = [];

      for (const dir of dirs) {
        const relevantExceptions = exceptions.filter(function(exc) {
          return isChildOf(exc, dir);
        });

        if (relevantExceptions.length > 0) {
          // Expand this dir further, excluding exceptions
          const expanded = expandSubdirWithExceptions(dir, relevantExceptions, projectRoot);
          specialDirEntries.push(...expanded);
        } else {
          regularDirs.push(dir + '/**');
        }
      }

      // Order: regular subdirs, then root files, then special-expanded entries
      allPaths.push(...regularDirs);
      allPaths.push(...files);
      allPaths.push(...specialDirEntries);
    } else {
      allPaths.push(globPath);
    }
  }

  return allPaths;
}

/**
 * Keep exception paths as-is (no expansion needed).
 */
function expandExceptionPaths(exceptionPaths) {
  return [...exceptionPaths].sort();
}

/**
 * Generate permissions object from boundary config.
 */
function generatePermissions(boundary, projectRoot) {
  if (!boundary.frameworkProtection) {
    return { deny: [], allow: [] };
  }

  const denyPaths = expandProtectedPaths(boundary.protected, boundary.exceptions, projectRoot);

  const deny = [];
  for (const denyPath of denyPaths) {
    for (const tool of TOOLS) {
      deny.push(tool + '(' + denyPath + ')');
    }
  }

  const allowPaths = expandExceptionPaths(boundary.exceptions);

  const allow = [];
  for (const allowPath of allowPaths) {
    for (const tool of TOOLS) {
      allow.push(tool + '(' + allowPath + ')');
    }
  }

  allow.push('Read(.aios-core/**)');

  return { deny, allow };
}

/**
 * Write settings.json preserving user sections outside permissions.
 */
function writeSettingsJson(projectRoot, permissions) {
  const claudeDir = path.join(projectRoot, '.claude');
  const fullSettingsPath = path.join(projectRoot, SETTINGS_FILE);

  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  let existing = {};
  if (fs.existsSync(fullSettingsPath)) {
    try {
      const content = fs.readFileSync(fullSettingsPath, 'utf8');
      existing = JSON.parse(content);
    } catch {
      console.warn('WARNING: Existing settings.json is invalid JSON, starting fresh.');
      existing = {};
    }
  }

  const updated = { ...existing };

  if (permissions.deny.length > 0 || permissions.allow.length > 0) {
    updated.permissions = permissions;
  } else {
    delete updated.permissions;
  }

  const newContent = JSON.stringify(updated, null, 2) + '\n';

  if (fs.existsSync(fullSettingsPath)) {
    const currentContent = fs.readFileSync(fullSettingsPath, 'utf8');
    if (currentContent === newContent) {
      console.log('PASS: settings.json already up to date, no changes needed.');
      return;
    }
  }

  fs.writeFileSync(fullSettingsPath, newContent, 'utf8');
  console.log('PASS: settings.json updated with ' + permissions.deny.length + ' deny rules and ' + permissions.allow.length + ' allow rules.');
}

/**
 * Main generator entry point.
 */
function generate(projectRoot, configOverride) {
  const root = projectRoot || process.cwd();
  const resolvedRoot = path.resolve(root);

  const boundary = configOverride || readBoundaryConfig(resolvedRoot);
  const permissions = generatePermissions(boundary, resolvedRoot);

  writeSettingsJson(resolvedRoot, permissions);
}

if (require.main === module) {
  const projectRoot = process.argv[2] || process.cwd();
  try {
    generate(projectRoot);
  } catch (error) {
    console.error('ERROR: ' + error.message);
    process.exit(1);
  }
}

module.exports = {
  generate,
  validateBoundaryPath,
  readBoundaryConfig,
  expandProtectedPaths,
  expandExceptionPaths,
  expandOneLevel,
  expandSubdirWithExceptions,
  generatePermissions,
  writeSettingsJson,
};
