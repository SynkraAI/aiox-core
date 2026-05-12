// preflight/03-sqlite-health.mjs — runs PRAGMA integrity_check on hydra.db.
// Exit 0 = DB consistent or absent (pre-migration). Read-only (opens readonly).

import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../hydra-data/hydra.db');
const verbose = process.argv.includes('--verbose');
const _require = createRequire(import.meta.url);

async function main() {
  try { await stat(DB_PATH); } catch {
    if (verbose) console.log(`[preflight 03] hydra.db not present yet — pre-migration state OK.`);
    process.exit(0);
  }
  let Database;
  try { Database = _require('better-sqlite3'); }
  catch (err) {
    console.error('[preflight 03] Checked: better-sqlite3 module available');
    console.error(`  Expected: loadable. Actual: ${err.message}`);
    console.error('  Fix: run `npm install` in tools/hydra/ to install better-sqlite3.');
    process.exit(1);
  }
  let db;
  try {
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    const result = db.pragma('integrity_check', { simple: true });
    if (result !== 'ok') {
      console.error(`[preflight 03] Checked: PRAGMA integrity_check on ${DB_PATH}`);
      console.error(`  Expected: 'ok'. Actual: '${result}'`);
      console.error('  Fix: restore hydra.db from backup or run `sqlite3 hydra.db ".recover"`.');
      process.exit(1);
    }
    if (verbose) console.log(`[preflight 03] OK — integrity_check = ok`);
    process.exit(0);
  } finally { if (db) try { db.close(); } catch { /* ignore */ } }
}

main().catch((err) => { console.error(`[preflight 03] Script error: ${err.message}`); process.exit(2); });
