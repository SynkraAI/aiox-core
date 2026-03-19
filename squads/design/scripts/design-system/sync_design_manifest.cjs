#!/usr/bin/env node

const process = require('process');
const {
  buildGeneratedConfig,
  getDesignPaths,
  readYaml,
  writeYaml,
} = require('./design_manifest_lib.cjs');

function main() {
  const { squadPath, configPath } = getDesignPaths(process.cwd());
  const squad = readYaml(squadPath);
  const config = readYaml(configPath);

  const generated = buildGeneratedConfig(squad, config);
  writeYaml(configPath, generated);

  console.log('PASS: synced squads/design/config.yaml from squads/design/squad.yaml');
  console.log(`  agents=${generated.agents.length}`);
  console.log(`  tasks=${generated.tasks.length}`);
  console.log(`  templates=${generated.templates.length}`);
  console.log(`  checklists=${generated.checklists.length}`);
  console.log(`  workflows=${generated.workflows.length}`);
}

main();
