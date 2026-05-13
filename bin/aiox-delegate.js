#!/usr/bin/env node

const path = require('path');
const { main } = require(path.join(
  __dirname,
  '..',
  '.aiox-core',
  'core',
  'external-executors',
  'delegate-cli',
));

main().catch((error) => {
  process.stderr.write(`ERROR=${error.message || error}\n`);
  process.exit(error.exitCode || 1);
});
