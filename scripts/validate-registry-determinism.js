#!/usr/bin/env node
/**
 * Validate Entity Registry Determinism
 *
 * Re-runs the IDS registry populator against the current source tree and
 * compares the output against the committed `.aiox-core/data/entity-registry.yaml`.
 * Mutations of `dependencies` and `usedBy` arrays — not just timestamp drift —
 * fail the check. Catches the category of drift that produced #754 (false
 * alarm): a partially-edited working tree silently producing a registry that
 * doesn't match what the algorithm would produce on the same source.
 *
 * @script scripts/validate-registry-determinism.js
 * @issue #758
 *
 * Usage:
 *   node scripts/validate-registry-determinism.js
 *   npm run validate:registry-determinism
 *
 * Exit codes:
 *   0 - Committed registry matches a clean regen
 *   1 - Drift detected — run populate-entity-registry.js locally and commit
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(REPO_ROOT, '.aiox-core', 'data', 'entity-registry.yaml');
const POPULATOR_PATH = path.join(REPO_ROOT, '.aiox-core', 'development', 'scripts', 'populate-entity-registry.js');

// Fields that legitimately differ between runs (clock-driven or
// content-hash-driven and re-computed on every regen). We compare structure
// minus these.
const VOLATILE_FIELDS = new Set(['lastUpdated', 'lastVerified', 'checksum']);

/**
 * Recursively strip volatile fields from a parsed YAML structure.
 */
function stripVolatile(node) {
  if (Array.isArray(node)) {
    return node.map(stripVolatile);
  }
  if (node && typeof node === 'object') {
    const out = {};
    for (const key of Object.keys(node)) {
      if (VOLATILE_FIELDS.has(key)) continue;
      out[key] = stripVolatile(node[key]);
    }
    return out;
  }
  return node;
}

function fail(message, details) {
  console.error('\n❌ Registry determinism check FAILED');
  console.error('   ' + message);
  if (details) {
    console.error('');
    console.error(details);
  }
  console.error('');
  console.error('   Remediate locally:');
  console.error('     node .aiox-core/development/scripts/populate-entity-registry.js');
  console.error('     git add .aiox-core/data/entity-registry.yaml');
  console.error('     git commit -m "chore(ids): regen entity-registry"');
  console.error('');
  process.exit(1);
}

function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fail(`Registry not found at ${REGISTRY_PATH}`);
  }
  if (!fs.existsSync(POPULATOR_PATH)) {
    fail(`Populator script not found at ${POPULATOR_PATH}`);
  }

  // 1. Snapshot the committed registry so we can restore it regardless of outcome.
  const committedYaml = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const committedParsed = yaml.load(committedYaml);

  let regennedYaml;
  let regennedParsed;
  try {
    // 2. Run the populator. It mutates `REGISTRY_PATH` in place.
    execFileSync('node', [POPULATOR_PATH], {
      cwd: REPO_ROOT,
      stdio: 'pipe',
    });
    regennedYaml = fs.readFileSync(REGISTRY_PATH, 'utf8');
    regennedParsed = yaml.load(regennedYaml);
  } finally {
    // 3. Restore the committed registry no matter what — the populator
    //    mutated the working tree and CI/local should not carry that drift
    //    forward in subsequent steps. Tests + lint may also rely on the
    //    committed state.
    fs.writeFileSync(REGISTRY_PATH, committedYaml);
  }

  // 4. Compare structures with volatile fields stripped.
  const committedStripped = stripVolatile(committedParsed);
  const regennedStripped = stripVolatile(regennedParsed);

  // Sort keys recursively before stringifying so map ordering doesn't trigger
  // false positives. (JSON.stringify's second arg is a replacer, not a key
  // sorter — passing an array there would FILTER keys instead.)
  const sortedStringify = (value) =>
    JSON.stringify(value, (_key, v) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const sorted = {};
        for (const k of Object.keys(v).sort()) {
          sorted[k] = v[k];
        }
        return sorted;
      }
      return v;
    });

  const committedJson = sortedStringify(committedStripped);
  const regennedJson = sortedStringify(regennedStripped);

  if (committedJson === regennedJson) {
    console.log('✅ Registry determinism check PASSED');
    console.log(`   ${committedParsed.metadata.entityCount} entities, structure matches regen output.`);
    return;
  }

  // 5. Diff failed — emit an actionable summary of what drifted.
  const drifts = [];
  const committedEntities = committedStripped.entities || {};
  const regennedEntities = regennedStripped.entities || {};

  const allCategories = new Set([
    ...Object.keys(committedEntities),
    ...Object.keys(regennedEntities),
  ]);

  for (const category of allCategories) {
    const committedCat = committedEntities[category] || {};
    const regennedCat = regennedEntities[category] || {};
    const allNames = new Set([...Object.keys(committedCat), ...Object.keys(regennedCat)]);
    for (const name of allNames) {
      const c = committedCat[name];
      const r = regennedCat[name];
      if (!c || !r) {
        drifts.push(`  [${category}] ${name}: ${!c ? 'added by regen' : 'removed by regen'}`);
        continue;
      }
      const cDeps = JSON.stringify((c.dependencies || []).slice().sort());
      const rDeps = JSON.stringify((r.dependencies || []).slice().sort());
      if (cDeps !== rDeps) {
        drifts.push(`  [${category}] ${name}: dependencies differ`);
      }
      const cUsed = JSON.stringify((c.usedBy || []).slice().sort());
      const rUsed = JSON.stringify((r.usedBy || []).slice().sort());
      if (cUsed !== rUsed) {
        drifts.push(`  [${category}] ${name}: usedBy differs`);
      }
    }
  }

  const detail = drifts.length
    ? drifts.slice(0, 30).join('\n') + (drifts.length > 30 ? `\n  ... and ${drifts.length - 30} more` : '')
    : `(structural delta beyond dependency/usedBy — diff committed vs regenned ${REGISTRY_PATH})`;

  fail(`${drifts.length} entries diverged between committed registry and clean regen output.`, detail);
}

main();
