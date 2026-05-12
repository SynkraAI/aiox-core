// Tests for preflight/03-sqlite-health.mjs — copies script to tmp with synthetic hydra-data.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { createRequire } from 'node:module';

const SCRIPT = path.resolve(process.cwd(), 'scripts/preflight/03-sqlite-health.mjs');
const NODE_MODS = path.resolve(process.cwd(), 'node_modules');
const _require = createRequire(import.meta.url);

function harness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-pf-'));
  const sd = path.join(root, 'tools/hydra/scripts/preflight'); fs.mkdirSync(sd, { recursive: true });
  fs.mkdirSync(path.join(root, 'tools/hydra/hydra-data'), { recursive: true });
  const copy = path.join(sd, '03.mjs'); fs.copyFileSync(SCRIPT, copy);
  return { root, copy, db: path.join(root, 'tools/hydra/hydra-data/hydra.db') };
}
const run = (copy) => spawnSync(process.execPath, [copy], { encoding: 'utf8', env: { ...process.env, NODE_PATH: NODE_MODS } });

describe('preflight/03-sqlite-health', () => {
  test('exits 0 when hydra.db does not exist (pre-migration)', () => {
    const { root, copy } = harness();
    try { expect(run(copy).status).toBe(0); } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
  test('exits 0 on a healthy SQLite DB', () => {
    const { root, copy, db } = harness();
    const Database = _require('better-sqlite3');
    const c = new Database(db); c.exec('CREATE TABLE t (x INTEGER); INSERT INTO t VALUES (1);'); c.close();
    try { expect(run(copy).status).toBe(0); } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
});
