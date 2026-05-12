// preflight/01-validate-heap.mjs — wraps existing validate-heap.mjs.
// Exit 0 = JSON stores load + parse without OOM. Read-only.

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VALIDATE_HEAP = path.resolve(__dirname, '../../validate-heap.mjs');
const verbose = process.argv.includes('--verbose');

const child = spawn(process.execPath, ['--max-old-space-size=2048', VALIDATE_HEAP], {
  stdio: verbose ? 'inherit' : ['ignore', 'pipe', 'pipe'],
});

let stderr = '';
if (!verbose) child.stderr.on('data', (d) => (stderr += d.toString()));

child.on('error', (err) => {
  console.error(`[preflight 01] Script error: ${err.message}`);
  process.exit(2);
});

child.on('exit', (code) => {
  if (code === 0) {
    if (verbose) console.log('[preflight 01] OK — JSON stores load + parse');
    process.exit(0);
  }
  console.error('[preflight 01] Checked: validate-heap.mjs (vector-index.json + fingerprints.json)');
  console.error(`  Expected: exit 0. Actual: exit ${code}`);
  if (stderr) console.error(`  Stderr: ${stderr.trim().split('\n').slice(-3).join(' | ')}`);
  console.error('  Fix: run `node tools/hydra/validate-heap.mjs` directly to diagnose OOM or parse error.');
  process.exit(1);
});
