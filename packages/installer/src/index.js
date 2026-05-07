#!/usr/bin/env node
'use strict';

const pkg = require('../package.json');

function printHelp() {
  console.log('Usage: aiox-installer [--help] [--version]');
  console.log('');
  console.log('Runs the AIOX interactive installer wizard.');
}

function loadWizard() {
  return require('./wizard');
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(pkg.version);
    return;
  }

  const { runWizard } = loadWizard();
  await runWizard();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`AIOX installer failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  get runWizard() {
    return loadWizard().runWizard;
  },
  get proSetup() {
    return require('./wizard/pro-setup');
  },
  get proScaffolder() {
    return require('./pro/pro-scaffolder');
  },
};
