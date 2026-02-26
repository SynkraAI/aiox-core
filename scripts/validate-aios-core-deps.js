#!/usr/bin/env node
'use strict';

/**
 * Dependency Graph Validator — .aios-core/package.json completeness
 * Story INS-4.12 (AC1, AC4, AC6)
 *
 * Scans all .js files in .aios-core/development/scripts/ for require() calls,
 * then verifies each non-builtin, non-relative package is declared in
 * .aios-core/package.json dependencies.
 *
 * Exit codes: 0 = PASS, 1 = FAIL (missing deps found)
 * Usage: node scripts/validate-aios-core-deps.js
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');

const PROJECT_ROOT = path.join(__dirname, '..');
const AIOS_CORE_DIR = path.join(PROJECT_ROOT, '.aios-core');
const SCRIPTS_DIR = path.join(AIOS_CORE_DIR, 'development', 'scripts');
const PACKAGE_JSON = path.join(AIOS_CORE_DIR, 'package.json');

// Node.js builtin modules
const BUILTINS = new Set(Module.builtinModules.concat(
  Module.builtinModules.map(m => `node:${m}`),
));

// Optional dev-time packages that should be wrapped in try-catch, not declared as deps
const ALLOWLIST = new Set([
  'eslint',
  'prettier',
  'jscodeshift',
  '@babel/parser',
  '@babel/traverse',
  '@babel/generator',
  '@babel/types',
  '@jest/globals',
  'jest',
]);

/**
 * Extract require() calls from a JS file using regex.
 * Handles: require('pkg'), require("pkg"), require(`pkg`)
 * Skips: require('./relative'), require('fs'), dynamic require(variable)
 */
function extractRequires(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const requires = new Set();

  // Match require('...') and require("...")
  const pattern = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const dep = match[1];
    // Skip relative paths
    if (dep.startsWith('.') || dep.startsWith('/')) continue;
    // Skip template literal expressions (e.g., require('${dep.name}') in code generators)
    if (dep.includes('${') || dep.includes('$')) continue;
    // Skip builtins
    if (BUILTINS.has(dep)) continue;

    // Extract package name (handle scoped packages like @babel/parser)
    const parts = dep.split('/');
    const pkgName = dep.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
    requires.add(pkgName);
  }

  return requires;
}

/**
 * Recursively find all .js files in a directory
 */
function findJsFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...findJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  console.log('--- .aios-core Dependency Validation (INS-4.12) ---\n');

  // Read .aios-core/package.json
  if (!fs.existsSync(PACKAGE_JSON)) {
    console.error('FAIL: .aios-core/package.json not found');
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const declared = new Set(Object.keys(pkg.dependencies || {}));

  // Find all JS scripts
  const scripts = findJsFiles(SCRIPTS_DIR);
  if (scripts.length === 0) {
    console.log('WARN: No .js files found in .aios-core/development/scripts/');
    process.exit(0);
  }

  console.log(`Scanning ${scripts.length} scripts in .aios-core/development/scripts/\n`);

  const errors = [];
  const allRequires = new Map(); // pkg -> [files that use it]

  for (const script of scripts) {
    const requires = extractRequires(script);
    const relPath = path.relative(PROJECT_ROOT, script);

    for (const pkg of requires) {
      if (!allRequires.has(pkg)) allRequires.set(pkg, []);
      allRequires.get(pkg).push(relPath);

      if (!declared.has(pkg) && !ALLOWLIST.has(pkg)) {
        errors.push({ script: relPath, package: pkg });
      }
    }
  }

  // Report
  console.log(`Found ${allRequires.size} unique external packages across ${scripts.length} scripts`);
  console.log(`Declared in .aios-core/package.json: ${declared.size}`);
  console.log(`Allowlisted (optional/dev-time): ${ALLOWLIST.size}\n`);

  if (errors.length > 0) {
    console.error(`FAIL: ${errors.length} undeclared dependencies found:\n`);

    // Group by package
    const byPkg = new Map();
    for (const err of errors) {
      if (!byPkg.has(err.package)) byPkg.set(err.package, []);
      byPkg.get(err.package).push(err.script);
    }

    for (const [pkg, files] of byPkg) {
      console.error(`  Missing: "${pkg}"`);
      for (const f of files) {
        console.error(`    Used in: ${f}`);
      }
    }

    console.error('\nFix: Add missing packages to .aios-core/package.json dependencies');
    console.error('Or add to ALLOWLIST if they are optional dev-time tools (wrap in try-catch)\n');
    process.exit(1);
  }

  console.log('PASS: All script dependencies are declared in .aios-core/package.json\n');
  process.exit(0);
}

main();
