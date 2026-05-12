// preflight/02-backup-verify.mjs — verifies *.backup.json byte-equals source.
// Exit 0 = backups valid OR source files don't exist yet (pre-migration state). Read-only.

import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HYDRA_DATA = path.resolve(__dirname, '../../hydra-data');
const TARGETS = [
  { src: path.join(HYDRA_DATA, 'vectors', 'vector-index.json'), backup: path.join(HYDRA_DATA, 'vectors', 'vector-index.backup.json') },
  { src: path.join(HYDRA_DATA, 'fingerprints', 'fingerprints.json'), backup: path.join(HYDRA_DATA, 'fingerprints', 'fingerprints.backup.json') },
];
const verbose = process.argv.includes('--verbose');

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function main() {
  let allBackupsAbsent = true;
  for (const { src, backup } of TARGETS) {
    const srcExists = await exists(src);
    const backupExists = await exists(backup);
    if (!srcExists) { if (verbose) console.log(`[preflight 02] skip (no source): ${src}`); continue; }
    if (!backupExists) {
      console.warn(`[preflight 02] WARN — no backup yet for ${path.basename(src)} (expected ${path.basename(backup)}). Migration will create it; safe to proceed pre-migration.`);
      continue;
    }
    allBackupsAbsent = false;
    const [srcBuf, bakBuf] = await Promise.all([readFile(src), readFile(backup)]);
    if (!srcBuf.equals(bakBuf)) {
      console.error(`[preflight 02] Checked: ${path.basename(backup)} byte-equals ${path.basename(src)}`);
      console.error(`  Expected: identical bytes. Actual: ${srcBuf.length} vs ${bakBuf.length} bytes (or content differs)`);
      console.error(`  Fix: re-create the backup before migration: cp ${src} ${backup}`);
      process.exit(1);
    }
    if (verbose) console.log(`[preflight 02] OK — ${path.basename(backup)} matches source (${srcBuf.length} bytes)`);
  }
  if (allBackupsAbsent && verbose) console.log('[preflight 02] No backups present — pre-migration state OK.');
  process.exit(0);
}

main().catch((err) => { console.error(`[preflight 02] Script error: ${err.message}`); process.exit(2); });
