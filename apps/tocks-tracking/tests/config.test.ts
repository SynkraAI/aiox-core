/**
 * Config validation tests — focused on FIX B1 (Tray secret) + FIX B2 (CORS) gates.
 */

import { describe, it, expect, afterEach } from 'vitest';

import { loadConfig } from '../src/config/index.js';

describe('Config (tocks-tracking) — production fail-closed gates', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value;
    }
  });

  function setProdBaseline(): void {
    process.env['NODE_ENV'] = 'production';
    process.env['SUPABASE_URL'] = 'https://example.supabase.co';
    process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'x';
  }

  it('FIX B1: throws when TRAY_WEBHOOK_SECRET missing in production', () => {
    setProdBaseline();
    process.env['CORS_ORIGINS'] = 'https://tockscustom.com.br';
    delete process.env['TRAY_WEBHOOK_SECRET'];

    expect(() => loadConfig()).toThrow(/TRAY_WEBHOOK_SECRET/);
  });

  it('FIX B2: throws when CORS_ORIGINS missing in production', () => {
    setProdBaseline();
    process.env['TRAY_WEBHOOK_SECRET'] = 'x';
    delete process.env['CORS_ORIGINS'];

    expect(() => loadConfig()).toThrow(/CORS_ORIGINS/);
  });

  it('passes when all required prod gates set', () => {
    setProdBaseline();
    process.env['TRAY_WEBHOOK_SECRET'] = 'secret-32-hex';
    process.env['CORS_ORIGINS'] = 'https://tockscustom.com.br,https://www.tockscustom.com.br';

    const cfg = loadConfig();
    expect(cfg.tray.webhookSecret).toBe('secret-32-hex');
    expect(cfg.cors.origins).toEqual([
      'https://tockscustom.com.br',
      'https://www.tockscustom.com.br',
    ]);
  });

  it('dev env: permissive (no throw when both missing)', () => {
    process.env['NODE_ENV'] = 'development';
    process.env['SUPABASE_URL'] = 'https://example.supabase.co';
    process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'x';
    delete process.env['TRAY_WEBHOOK_SECRET'];
    delete process.env['CORS_ORIGINS'];

    const cfg = loadConfig();
    expect(cfg.tray.webhookSecret).toBeUndefined();
    expect(cfg.cors.origins).toEqual([]);
  });
});
