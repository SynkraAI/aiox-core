// preflight/all.mjs — runs all 6 preflight checks sequentially, halts on first failure.
// Exit 0 = all checks passed (or warned safely). Read-only.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const verbose = process.argv.includes('--verbose');
const SCRIPTS = [
  '00-disk-space.mjs',
  '01-validate-heap.mjs',
  '02-backup-verify.mjs',
  '03-sqlite-health.mjs',
  '04-no-active-lock.mjs',
  '05-env-validate.mjs',
];

let failed = null;
for (const name of SCRIPTS) {
  const scriptPath = path.join(__dirname, name);
  const args = [scriptPath, ...(verbose ? ['--verbose'] : [])];
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(`[preflight all] Script error spawning ${name}: ${result.error.message}`);
    process.exit(2);
  }
  if (result.status !== 0) {
    failed = { name, code: result.status };
    break;
  }
  if (verbose) console.log(`[preflight all] ✓ ${name}`);
}

if (failed) {
  console.error(`\n[preflight all] Checked: all 6 preflight scripts pass`);
  console.error(`  Expected: every script exits 0. Actual: ${failed.name} exited ${failed.code}`);
  console.error(`  Fix: see error from ${failed.name} above and address it before migration.`);
  process.exit(1);
}

console.log('[preflight all] OK — all 6 checks passed. Safe to migrate.');
process.exit(0);
