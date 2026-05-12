// Tests for preflight/00-disk-space.mjs — runs the real script against the real volume.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const SCRIPT = path.resolve(process.cwd(), 'scripts/preflight/00-disk-space.mjs');

describe('preflight/00-disk-space', () => {
  test('exits 0 on healthy volume', () => {
    const r = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    expect(r.status).toBe(0);
  });

  test('--verbose prints OK line on success', () => {
    const r = spawnSync(process.execPath, [SCRIPT, '--verbose'], { encoding: 'utf8' });
    expect(r.stdout).toMatch(/\[preflight 00\] OK/);
  });

  test('exits 1 with actionable Fix: line when hydra-data is missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-pf-'));
    const copy = path.join(tmp, 'check.mjs');
    fs.copyFileSync(SCRIPT, copy); // __dirname → tmp, so ../../hydra-data does not exist
    try {
      const r = spawnSync(process.execPath, [copy], { encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/Fix:/);
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  });
});
