#!/usr/bin/env node
'use strict';

const { runWizard } = require('./wizard');

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: aiox-installer [--help]');
    console.log('');
    console.log('Runs the AIOX interactive installer wizard.');
    return;
  }

  await runWizard();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`AIOX installer failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runWizard,
  proSetup: require('./wizard/pro-setup'),
  proScaffolder: require('./pro/pro-scaffolder'),
};
