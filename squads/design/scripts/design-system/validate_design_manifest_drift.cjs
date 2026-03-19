#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const process = require('process');
const {
  buildGeneratedConfig,
  getCanonicalProjection,
  getDesignPaths,
  readYaml,
  stableJson,
} = require('./design_manifest_lib.cjs');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function validateSquadReferences(rootDir, squad) {
  const base = path.join(rootDir, 'squads/design');
  const checks = [
    ['agents', '.md'],
    ['tasks', '.md'],
    ['checklists', '.md'],
    ['templates', null],
    ['workflows', null],
  ];

  for (const [section, extension] of checks) {
    const items = squad[section] || [];
    for (const item of items) {
      const file = item.file;
      if (!file) {
        fail(`Missing file field in squad.${section} item: ${item.id || 'unknown-id'}`);
      }

      const fullPath = path.join(base, file);
      if (!fs.existsSync(fullPath)) {
        fail(`Broken reference in squad.${section}: ${file}`);
      }

      if (extension && !file.endsWith(extension)) {
        fail(`Invalid extension in squad.${section}: ${file} (expected ${extension})`);
      }
    }
  }
}

function main() {
  const rootDir = process.cwd();
  const { squadPath, configPath } = getDesignPaths(rootDir);

  const squad = readYaml(squadPath);
  const config = readYaml(configPath);
  const expected = buildGeneratedConfig(squad, config);

  validateSquadReferences(rootDir, squad);

  const actualCanonical = getCanonicalProjection(config);
  const expectedCanonical = getCanonicalProjection(expected);

  const actualJson = stableJson(actualCanonical);
  const expectedJson = stableJson(expectedCanonical);

  if (actualJson !== expectedJson) {
    fail('Design manifest drift detected. Run: npm run design:manifest:sync');
  }

  console.log('PASS: design manifest is synchronized with squad.yaml');
}

main();
