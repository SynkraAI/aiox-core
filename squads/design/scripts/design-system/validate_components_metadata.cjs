#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const metadataPath = path.join(ROOT, 'workspace/domains/design-system/metadata/components.json');
const squadRoot = path.join(ROOT, 'squads/design');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Unable to parse JSON at ${filePath}: ${error.message}`);
  }
}

function validateRefs(component, field, folder) {
  const refs = component[field] || [];
  if (!Array.isArray(refs)) {
    fail(`Component ${component.id}: ${field} must be an array`);
  }

  for (const ref of refs) {
    const full = path.join(squadRoot, folder, `${ref}.md`);
    const yaml = path.join(squadRoot, folder, `${ref}.yaml`);
    const yml = path.join(squadRoot, folder, `${ref}.yml`);

    if (!fs.existsSync(full) && !fs.existsSync(yaml) && !fs.existsSync(yml)) {
      fail(`Component ${component.id}: invalid ${field} reference "${ref}"`);
    }
  }
}

function validateComponent(component) {
  const required = ['id', 'name', 'agent_owner', 'registryKey', 'files', 'variants', 'tokens', 'a11y'];
  for (const key of required) {
    if (!(key in component)) {
      fail(`Component missing required field: ${key}`);
    }
  }

  if (!Array.isArray(component.files) || component.files.length === 0) {
    fail(`Component ${component.id}: files must be a non-empty array`);
  }

  for (const file of component.files) {
    if (!file.path) {
      fail(`Component ${component.id}: every file needs a path`);
    }
  }

  const a11yRequired = ['role', 'keyboard', 'aria', 'wcag'];
  for (const key of a11yRequired) {
    if (!(key in component.a11y)) {
      fail(`Component ${component.id}: a11y.${key} is required`);
    }
  }

  validateRefs(component, 'task_refs', 'tasks');
  validateRefs(component, 'template_refs', 'templates');
  validateRefs(component, 'workflow_refs', 'workflows');
}

function main() {
  if (!fs.existsSync(metadataPath)) {
    fail(`Missing metadata file: ${metadataPath}`);
  }

  const payload = readJson(metadataPath);
  if (!payload.version) {
    fail('Missing top-level version');
  }

  if (!Array.isArray(payload.components)) {
    fail('components must be an array');
  }

  for (const component of payload.components) {
    validateComponent(component);
  }

  const declaredCount = payload.integrity && payload.integrity.componentCount;
  if (typeof declaredCount === 'number' && declaredCount !== payload.components.length) {
    fail(`integrity.componentCount (${declaredCount}) does not match components.length (${payload.components.length})`);
  }

  console.log(`PASS: validated ${payload.components.length} components in ${path.relative(ROOT, metadataPath)}`);
}

main();
