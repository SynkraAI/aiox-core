#!/usr/bin/env node

const yaml = require('js-yaml');

const { buildOutput } = require('./load-context.cjs');

function buildContext() {
  return buildOutput({
    business: null,
    app: null,
    codebase: null,
    task: 'design-chief',
    format: 'json',
  });
}

function main() {
  const output = buildContext();
  process.stdout.write(
    yaml.dump(output, {
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    }),
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildContext,
};
