#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const requiredFiles = [
  'workspace/domains/design-system/mcp/server.ts',
  'workspace/domains/design-system/mcp/types.ts',
  'workspace/domains/design-system/mcp/config.json',
  'workspace/domains/design-system/mcp/handlers/components.ts',
  'workspace/domains/design-system/mcp/handlers/registry.ts',
  'workspace/domains/design-system/mcp/handlers/tokens.ts',
  'workspace/domains/design-system/mcp/handlers/guidelines.ts',
];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function main() {
  for (const rel of requiredFiles) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) {
      fail(`Missing required MCP file: ${rel}`);
    }

    const content = fs.readFileSync(full, 'utf8');
    if (!content.trim()) {
      fail(`MCP file is empty: ${rel}`);
    }
  }

  console.log('PASS: MCP skeleton files are present');
}

main();
