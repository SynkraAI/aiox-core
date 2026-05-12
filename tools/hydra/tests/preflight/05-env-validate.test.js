// Tests for preflight/05-env-validate.mjs — pure env-var check, no fs.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const SCRIPT = path.resolve(process.cwd(), 'scripts/preflight/05-env-validate.mjs');

function run(env) {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', env: { ...process.env, ...env } });
}

describe('preflight/05-env-validate', () => {
  test('exits 0 when all required env vars are set', () => {
    const r = run({ DEEPSEEK_API_KEY: 'k', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: 'c' });
    expect(r.status).toBe(0);
  });

  test('exits 1 listing missing vars when one is absent', () => {
    const r = run({ DEEPSEEK_API_KEY: '', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: 'c' });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/DEEPSEEK_API_KEY/);
    expect(r.stderr).toMatch(/Fix:/);
  });

  test('treats whitespace-only value as missing', () => {
    const r = run({ DEEPSEEK_API_KEY: '   ', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: 'c' });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/DEEPSEEK_API_KEY/);
  });
});
