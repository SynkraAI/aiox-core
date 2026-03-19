#!/usr/bin/env node

/**
 * Registry Schema Validator
 *
 * Validates workspace/ui/registry.json against the Shadcn registry schema rules.
 * Run from repo root: node squads/design/scripts/design-system/validate_registry.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, 'workspace/ui/registry.json');

const VALID_ITEM_TYPES = [
  'registry:lib',
  'registry:block',
  'registry:component',
  'registry:ui',
  'registry:hook',
  'registry:theme',
  'registry:page',
  'registry:file',
  'registry:style',
  'registry:base',
  'registry:font',
  'registry:item',
];

const VALID_FILE_TYPES = VALID_ITEM_TYPES;

const errors = [];
const warnings = [];

function error(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function main() {
  // 1. File exists and parses
  if (!fs.existsSync(REGISTRY_PATH)) {
    error('registry.json not found at workspace/ui/registry.json');
    return report();
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (e) {
    error('registry.json is not valid JSON: ' + e.message);
    return report();
  }

  // 2. Root fields
  if (typeof registry.name !== 'string' || !registry.name) {
    error('Root "name" is required (string)');
  }
  if (typeof registry.homepage !== 'string' || !registry.homepage) {
    error('Root "homepage" is required (string)');
  }
  if (!Array.isArray(registry.items) || registry.items.length === 0) {
    error('Root "items" must be a non-empty array');
    return report();
  }

  // 3. $schema reference
  if (!registry.$schema) {
    warn('Missing $schema reference (recommended: https://ui.shadcn.com/schema/registry.json)');
  }

  // Collect all item names for registryDependencies validation
  const allNames = new Set(registry.items.map((i) => i.name));

  // 4. Validate each item
  for (let idx = 0; idx < registry.items.length; idx++) {
    const item = registry.items[idx];
    const prefix = `items[${idx}] (${item.name || 'unnamed'})`;

    // Required: name
    if (typeof item.name !== 'string' || !item.name) {
      error(`${prefix}: "name" is required (string)`);
    }

    // Required: type
    if (typeof item.type !== 'string' || !item.type) {
      error(`${prefix}: "type" is required (string)`);
    } else if (!VALID_ITEM_TYPES.includes(item.type)) {
      error(`${prefix}: invalid type "${item.type}". Must be one of: ${VALID_ITEM_TYPES.join(', ')}`);
    }

    // Files array
    if (item.files !== undefined) {
      if (!Array.isArray(item.files)) {
        error(`${prefix}: "files" must be an array`);
      } else {
        for (let fi = 0; fi < item.files.length; fi++) {
          const file = item.files[fi];
          const fp = `${prefix}.files[${fi}]`;
          if (typeof file.path !== 'string' || !file.path) {
            error(`${fp}: "path" is required`);
          }
          if (typeof file.type !== 'string' || !file.type) {
            error(`${fp}: "type" is required`);
          } else if (!VALID_FILE_TYPES.includes(file.type)) {
            error(`${fp}: invalid file type "${file.type}"`);
          }
        }
      }
    }

    // Dependencies arrays
    if (item.dependencies !== undefined && !Array.isArray(item.dependencies)) {
      error(`${prefix}: "dependencies" must be an array`);
    }
    if (item.devDependencies !== undefined && !Array.isArray(item.devDependencies)) {
      error(`${prefix}: "devDependencies" must be an array`);
    }

    // registryDependencies — must reference existing items or external URLs
    if (item.registryDependencies !== undefined) {
      if (!Array.isArray(item.registryDependencies)) {
        error(`${prefix}: "registryDependencies" must be an array`);
      } else {
        for (const dep of item.registryDependencies) {
          // Skip external URLs and namespaced deps
          if (dep.startsWith('http') || dep.startsWith('@')) continue;
          if (!allNames.has(dep)) {
            error(`${prefix}: registryDependency "${dep}" not found in registry`);
          }
        }
      }
    }

    // cssVars — must be object if present
    if (item.cssVars !== undefined && (typeof item.cssVars !== 'object' || Array.isArray(item.cssVars))) {
      error(`${prefix}: "cssVars" must be an object`);
    }

    // Warnings for recommended fields
    if (!item.title) {
      warn(`${prefix}: missing "title" (recommended)`);
    }
    if (!item.description) {
      warn(`${prefix}: missing "description" (recommended)`);
    }
  }

  // 5. Uniqueness
  const names = registry.items.map((i) => i.name);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length > 0) {
    error('Duplicate item names: ' + [...new Set(dupes)].join(', '));
  }

  return report();
}

function report() {
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log('  WARN: ' + w);
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const e of errors) console.error('  ERROR: ' + e);
    console.log(`\nFAIL: ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  }

  const itemCount = (() => {
    try {
      return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')).items.length;
    } catch {
      return '?';
    }
  })();

  console.log(`\nPASS: registry.json is valid (${itemCount} items, ${warnings.length} warning(s))`);
}

main();
