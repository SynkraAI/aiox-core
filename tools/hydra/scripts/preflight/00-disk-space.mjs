// preflight/00-disk-space.mjs — checks ≥500MB free in hydra-data/
// Exit 0 = OK, 1 = check failed, 2 = script error. Read-only.

import { statfs } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HYDRA_DATA = path.resolve(__dirname, '../../hydra-data');
const MIN_FREE_BYTES = 500 * 1024 * 1024; // 500MB
const verbose = process.argv.includes('--verbose');

async function main() {
  let stats;
  try {
    stats = await statfs(HYDRA_DATA);
  } catch (err) {
    console.error(`[preflight 00] Checked: free disk at ${HYDRA_DATA}`);
    console.error(`  Expected: directory accessible. Actual: ${err.code || err.message}`);
    console.error(`  Fix: ensure hydra-data/ exists and is readable.`);
    process.exit(1);
  }
  const free = stats.bsize * stats.bfree;
  if (free < MIN_FREE_BYTES) {
    console.error(`[preflight 00] Checked: free disk at ${HYDRA_DATA}`);
    console.error(`  Expected: ≥${(MIN_FREE_BYTES / 1024 / 1024).toFixed(0)}MB free. Actual: ${(free / 1024 / 1024).toFixed(1)}MB`);
    console.error(`  Fix: free disk space on the volume hosting hydra-data/ before migrating.`);
    process.exit(1);
  }
  if (verbose) console.log(`[preflight 00] OK — ${(free / 1024 / 1024).toFixed(1)}MB free`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`[preflight 00] Script error: ${err.message}`);
  process.exit(2);
});
