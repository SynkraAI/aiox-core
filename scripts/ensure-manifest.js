#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const { validateManifest } = require('./validate-manifest');
const { generateManifest, writeManifest } = require('./generate-install-manifest');

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    if (!output) return [];
    return output.split('\n').map((line) => line.trim()).filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function shouldCheckManifest(stagedFiles) {
  if (stagedFiles.length === 0) return false;

  return stagedFiles.some((file) => {
    if (file === '.aiox-core/install-manifest.yaml') return false;
    return file.startsWith('.aiox-core/');
  });
}

async function main() {
  const stagedFiles = getStagedFiles();
  if (!shouldCheckManifest(stagedFiles)) {
    console.log('ℹ️ manifest: no .aiox-core changes staged, skipping check');
    return;
  }

  const result = validateManifest();
  if (result.valid) {
    console.log('✅ manifest: already up-to-date');
    return;
  }

  console.log('🔄 manifest: outdated, regenerating...');
  const manifest = await generateManifest();
  await writeManifest(manifest);
  execSync('git add .aiox-core/install-manifest.yaml', { stdio: 'inherit' });
  console.log('✅ manifest: regenerated and staged');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`❌ manifest: ensure failed - ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  getStagedFiles,
  shouldCheckManifest,
  main,
};
