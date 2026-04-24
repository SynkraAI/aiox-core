/**
 * Google Ads OAuth — port of @tocks/sales-ai test.
 */

import { describe, it, expect, vi } from 'vitest';

import { GoogleAdsOAuth } from '../../src/integrations/google-ads-oauth.js';

function mockFetch(
  response: { ok: boolean; status?: number; body?: unknown; text?: string },
): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => response.body ?? {},
    text: async () => response.text ?? JSON.stringify(response.body ?? {}),
  }) as unknown as typeof fetch;
}

describe('GoogleAdsOAuth.getAccessToken', () => {
  it('returns access_token on happy path', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      body: { access_token: 'ya29.abc', expires_in: 3600, token_type: 'Bearer' },
    });
    const oauth = new GoogleAdsOAuth({
      clientId: 'cid',
      clientSecret: 'sec',
      refreshToken: 'ref',
      fetchImpl,
    });
    const token = await oauth.getAccessToken();
    expect(token).toBe('ya29.abc');
  });

  it('caches the token until expiry minus margin', async () => {
    let callCount = 0;
    const fetchImpl = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ access_token: `tok-${callCount}`, expires_in: 3600 }),
        text: async () => '',
      };
    });
    const oauth = new GoogleAdsOAuth({
      clientId: 'cid',
      clientSecret: 'sec',
      refreshToken: 'ref',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const a = await oauth.getAccessToken();
    const b = await oauth.getAccessToken();
    expect(a).toBe('tok-1');
    expect(b).toBe('tok-1');
    expect(callCount).toBe(1);
  });

  it('refreshes after expiry', async () => {
    let callCount = 0;
    const fetchImpl = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ access_token: `tok-${callCount}`, expires_in: 60 }),
        text: async () => '',
      };
    });
    const oauth = new GoogleAdsOAuth({
      clientId: 'cid',
      clientSecret: 'sec',
      refreshToken: 'ref',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const t0 = Date.now();
    await oauth.getAccessToken(t0);
    // Jump past expiry (60s + margin)
    const b = await oauth.getAccessToken(t0 + 120_000);
    expect(b).toBe('tok-2');
    expect(callCount).toBe(2);
  });

  it('returns null on 401', async () => {
    const fetchImpl = mockFetch({ ok: false, status: 401, text: 'invalid_grant' });
    const oauth = new GoogleAdsOAuth({
      clientId: 'cid',
      clientSecret: 'sec',
      refreshToken: 'ref',
      fetchImpl,
    });
    const token = await oauth.getAccessToken();
    expect(token).toBeNull();
  });

  it('returns null on malformed response', async () => {
    const fetchImpl = mockFetch({ ok: true, body: { access_token: null } });
    const oauth = new GoogleAdsOAuth({
      clientId: 'cid',
      clientSecret: 'sec',
      refreshToken: 'ref',
      fetchImpl,
    });
    const token = await oauth.getAccessToken();
    expect(token).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
    const oauth = new GoogleAdsOAuth({
      clientId: 'cid',
      clientSecret: 'sec',
      refreshToken: 'ref',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const token = await oauth.getAccessToken();
    expect(token).toBeNull();
  });
});
