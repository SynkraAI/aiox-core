// Tests for preflight/02-backup-verify.mjs — script copied to tmp so it sees synthetic hydra-data.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const SCRIPT = path.resolve(process.cwd(), 'scripts/preflight/02-backup-verify.mjs');

function harness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-pf-'));
  const scripts = path.join(root, 'tools/hydra/scripts/preflight');
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(path.join(root, 'tools/hydra/hydra-data/vectors'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tools/hydra/hydra-data/fingerprints'), { recursive: true });
  const copy = path.join(scripts, '02.mjs'); fs.copyFileSync(SCRIPT, copy);
  return { root, copy };
}
const run = (copy) => spawnSync(process.execPath, [copy], { encoding: 'utf8' });

describe('preflight/02-backup-verify', () => {
  test('exits 0 when no source files exist (pre-migration warning)', () => {
    const { root, copy } = harness();
    try { expect(run(copy).status).toBe(0); } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
  test('exits 1 when backup bytes differ from source', () => {
    const { root, copy } = harness();
    const src = path.join(root, 'tools/hydra/hydra-data/vectors/vector-index.json');
    fs.writeFileSync(src, '{"a":1}'); fs.writeFileSync(src.replace('.json', '.backup.json'), '{"a":2}');
    try { const r = run(copy); expect(r.status).toBe(1); expect(r.stderr).toMatch(/Fix:/); }
    finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
});
