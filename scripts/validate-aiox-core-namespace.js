#!/usr/bin/env node
/**
 * .aiox-core/package.json namespace + version sync validator
 *
 * Story #739 (Bug 2 follow-up): the internal `.aiox-core/package.json`
 * manifest drifted to the legacy `@aiox-fullstack/core@4.31.1` namespace
 * while the surface package moved to `@aiox-squads/core@5.x`. Several
 * releases shipped stale internal metadata that confused tooling and
 * misled operators investigating upgrade issues.
 *
 * This validator runs in the pre-publish surface to catch the drift
 * before it ships again.
 *
 * Validation rules:
 *   1. `.aiox-core/package.json` MUST exist.
 *   2. `name` MUST end with `-internal` (it is NOT a published package on
 *      its own — `private: true` + suffix avoids npm registry confusion
 *      with the parent surface).
 *   3. `private` MUST be true.
 *   4. `version` MUST equal the root `package.json` version (single source
 *      of truth: the parent surface drives the framework version).
 *   5. No `peerDependencies` referencing the legacy `@aiox-fullstack/*`
 *      namespace.
 *
 * Exit codes: 0 = PASS, 1 = FAIL
 * Usage: node scripts/validate-aiox-core-namespace.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INTERNAL_PKG = path.join(ROOT, '.aiox-core', 'package.json');
const ROOT_PKG = path.join(ROOT, 'package.json');

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(INTERNAL_PKG)) {
    fail('.aiox-core/package.json not found');
  }
  if (!fs.existsSync(ROOT_PKG)) {
    fail('root package.json not found');
  }

  const internal = JSON.parse(fs.readFileSync(INTERNAL_PKG, 'utf8'));
  const root = JSON.parse(fs.readFileSync(ROOT_PKG, 'utf8'));

  if (!internal.name) {
    fail('.aiox-core/package.json missing `name` field');
  }
  const EXPECTED_SCOPE = '@aiox-squads/';
  if (!internal.name.startsWith(EXPECTED_SCOPE)) {
    fail(
      `.aiox-core/package.json name "${internal.name}" must start with "${EXPECTED_SCOPE}" ` +
        '(current org scope — names like `@aiox-fullstack/*` are legacy, see Story #739)',
    );
  }
  if (!internal.name.endsWith('-internal')) {
    fail(
      `.aiox-core/package.json name "${internal.name}" must end with "-internal" ` +
        '(internal manifest, not a separately-published package — see Story #739)',
    );
  }
  if (internal.private !== true) {
    fail('.aiox-core/package.json must declare `"private": true` (internal-only)');
  }
  if (internal.version !== root.version) {
    fail(
      `version drift: .aiox-core/package.json version "${internal.version}" ` +
        `does not match root package.json version "${root.version}". ` +
        'They must move in lockstep — root is SOT.',
    );
  }

  const peerDeps = internal.peerDependencies || {};
  const legacyPeers = Object.keys(peerDeps).filter((d) => d.startsWith('@aiox-fullstack/'));
  if (legacyPeers.length > 0) {
    fail(
      `legacy @aiox-fullstack/* peerDependencies in .aiox-core/package.json: ${legacyPeers.join(', ')}. ` +
        'These packages do not exist; drop the peerDependencies block or rename to the current namespace.',
    );
  }

  console.log(
    `PASS: .aiox-core/package.json is in sync with root (name=${internal.name}, version=${internal.version})`,
  );
  process.exit(0);
}

main();
