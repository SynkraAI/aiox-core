// Tests for preflight/04-no-active-lock.mjs — copies script to tmp with synthetic state dir.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const SCRIPT = path.resolve(process.cwd(), 'scripts/preflight/04-no-active-lock.mjs');

function harness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-pf-'));
  const sd = path.join(root, 'tools/hydra/scripts/preflight'); fs.mkdirSync(sd, { recursive: true });
  const state = path.join(root, 'tools/hydra/hydra-data/state'); fs.mkdirSync(state, { recursive: true });
  const copy = path.join(sd, '04.mjs'); fs.copyFileSync(SCRIPT, copy);
  return { root, copy, lock: path.join(state, 'scheduler.lock') };
}
const run = (copy) => spawnSync(process.execPath, [copy], { encoding: 'utf8' });

describe('preflight/04-no-active-lock', () => {
  test('exits 0 with no lock', () => {
    const { root, copy } = harness();
    try { expect(run(copy).status).toBe(0); } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
  test('exits 1 with fresh lock', () => {
    const { root, copy, lock } = harness(); fs.writeFileSync(lock, 'pid=12345');
    try { const r = run(copy); expect(r.status).toBe(1); expect(r.stderr).toMatch(/Fix:/); }
    finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
  test('exits 0 with stale lock (>1h old)', () => {
    const { root, copy, lock } = harness(); fs.writeFileSync(lock, 'pid=9');
    const past = new Date(Date.now() - 2 * 3600 * 1000); fs.utimesSync(lock, past, past);
    try { expect(run(copy).status).toBe(0); } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
});
