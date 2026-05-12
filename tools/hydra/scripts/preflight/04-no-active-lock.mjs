// preflight/04-no-active-lock.mjs — confirms no scheduler/pipeline holding scheduler.lock.
// Exit 0 = no lock or lock stale. Read-only — never deletes.

import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCK_PATH = path.resolve(__dirname, '../../hydra-data/state/scheduler.lock');
const STALE_MS = 60 * 60 * 1000; // 1h TTL per PRD R12
const verbose = process.argv.includes('--verbose');

async function main() {
  let st;
  try { st = await stat(LOCK_PATH); }
  catch (err) {
    if (err.code === 'ENOENT') {
      if (verbose) console.log('[preflight 04] OK — no lock file present');
      process.exit(0);
    }
    console.error(`[preflight 04] Script error reading lock: ${err.message}`);
    process.exit(2);
  }
  const age = Date.now() - st.mtimeMs;
  if (age > STALE_MS) {
    if (verbose) console.log(`[preflight 04] OK — lock is stale (age ${(age / 1000).toFixed(0)}s > ${STALE_MS / 1000}s TTL)`);
    process.exit(0);
  }
  let contents = '';
  try { contents = (await readFile(LOCK_PATH, 'utf8')).trim().slice(0, 120); } catch { /* ignore */ }
  console.error(`[preflight 04] Checked: scheduler.lock at ${LOCK_PATH}`);
  console.error(`  Expected: absent or stale (>${STALE_MS / 1000}s old). Actual: ${(age / 1000).toFixed(0)}s old (active)`);
  if (contents) console.error(`  Lock contents: ${contents}`);
  console.error('  Fix: wait for active scheduler/pipeline run to finish, or stop it before migrating.');
  process.exit(1);
}

main().catch((err) => { console.error(`[preflight 04] Script error: ${err.message}`); process.exit(2); });
