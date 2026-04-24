/**
 * Google Ads Conversions Client — port + trimmed.
 */

import { describe, it, expect, vi } from 'vitest';

import { GoogleAdsOAuth } from '../../src/integrations/google-ads-oauth.js';
import {
  GoogleAdsConversionsClient,
  formatConversionDateTime,
} from '../../src/integrations/google-ads-conversions-client.js';

function fakeOAuth(token: string | null): GoogleAdsOAuth {
  return {
    getAccessToken: vi.fn().mockResolvedValue(token),
  } as unknown as GoogleAdsOAuth;
}

function mockFetch(response: {
  ok: boolean;
  status?: number;
  body?: unknown;
  text?: string;
}): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => response.body ?? {},
    text: async () => response.text ?? '',
  }) as unknown as typeof fetch;
}

describe('GoogleAdsConversionsClient.uploadClickConversion', () => {
  it('returns disabled when config.enabled=false', async () => {
    const client = new GoogleAdsConversionsClient(
      {
        enabled: false,
        customerId: '8146675397',
        developerToken: 'dev',
        apiVersion: 'v20',
        timeoutMs: 5000,
      },
      fakeOAuth('tok'),
    );
    const result = await client.uploadClickConversion({
      gclid: 'Cj0ABC12345',
      conversionActionResourceName: 'customers/8146675397/conversionActions/7161904202',
      conversionDateTime: '2026-04-23 12:00:00-03:00',
      conversionValue: 19900,
    });
    expect(result).toEqual({ uploaded: false, reason: 'disabled' });
  });

  it('returns invalid_gclid when gclid too short', async () => {
    const client = new GoogleAdsConversionsClient(
      {
        enabled: true,
        customerId: '8146675397',
        developerToken: 'dev',
        apiVersion: 'v20',
        timeoutMs: 5000,
      },
      fakeOAuth('tok'),
    );
    const result = await client.uploadClickConversion({
      gclid: 'abc',
      conversionActionResourceName: 'customers/x/conversionActions/y',
      conversionDateTime: 'x',
      conversionValue: 1,
    });
    expect(result.uploaded).toBe(false);
    expect(result.reason).toBe('invalid_gclid');
  });

  it('returns oauth_failed when token null', async () => {
    const client = new GoogleAdsConversionsClient(
      {
        enabled: true,
        customerId: '8146675397',
        developerToken: 'dev',
        apiVersion: 'v20',
        timeoutMs: 5000,
      },
      fakeOAuth(null),
    );
    const result = await client.uploadClickConversion({
      gclid: 'Cj0ABC12345',
      conversionActionResourceName: 'customers/8146675397/conversionActions/7161904202',
      conversionDateTime: '2026-04-23 12:00:00-03:00',
      conversionValue: 1,
    });
    expect(result.uploaded).toBe(false);
    expect(result.reason).toBe('oauth_failed');
  });

  it('returns uploaded=true on success', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      body: { results: [{ gclid: 'Cj0ABC12345', conversion_action: 'x' }] },
    });
    const client = new GoogleAdsConversionsClient(
      {
        enabled: true,
        customerId: '8146675397',
        loginCustomerId: '7943699417',
        developerToken: 'dev',
        apiVersion: 'v20',
        timeoutMs: 5000,
      },
      fakeOAuth('tok'),
    );
    const result = await client.uploadClickConversion(
      {
        gclid: 'Cj0ABC12345',
        conversionActionResourceName: 'customers/8146675397/conversionActions/7161904202',
        conversionDateTime: '2026-04-23 12:00:00-03:00',
        conversionValue: 19900,
        orderId: 'ORD-1',
        userIdentifiers: [{ hashedEmail: 'abc'.repeat(21) + 'x' }],
      },
      { fetchImpl },
    );
    expect(result.uploaded).toBe(true);
    expect(result.gclid).toBe('Cj0ABC12345');
  });

  it('returns http_XXX on non-ok response', async () => {
    const fetchImpl = mockFetch({ ok: false, status: 403, text: 'permission denied' });
    const client = new GoogleAdsConversionsClient(
      {
        enabled: true,
        customerId: 'x',
        developerToken: 'dev',
        apiVersion: 'v20',
        timeoutMs: 5000,
      },
      fakeOAuth('tok'),
    );
    const result = await client.uploadClickConversion(
      {
        gclid: 'Cj0ABC12345',
        conversionActionResourceName: 'customers/x/conversionActions/y',
        conversionDateTime: '2026-04-23 12:00:00-03:00',
        conversionValue: 1,
      },
      { fetchImpl },
    );
    expect(result.uploaded).toBe(false);
    expect(result.reason).toBe('http_403');
  });

  it('returns partial_failure reason', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      body: {
        results: [],
        partial_failure_error: { code: 3, message: 'invalid gclid window' },
      },
    });
    const client = new GoogleAdsConversionsClient(
      {
        enabled: true,
        customerId: 'x',
        developerToken: 'dev',
        apiVersion: 'v20',
        timeoutMs: 5000,
      },
      fakeOAuth('tok'),
    );
    const result = await client.uploadClickConversion(
      {
        gclid: 'Cj0ABC12345',
        conversionActionResourceName: 'customers/x/conversionActions/y',
        conversionDateTime: '2026-04-23 12:00:00-03:00',
        conversionValue: 1,
      },
      { fetchImpl },
    );
    expect(result.uploaded).toBe(false);
    expect(result.reason).toMatch(/partial_failure:invalid gclid window/);
  });
});

describe('formatConversionDateTime', () => {
  it('formats a UTC date in America/Sao_Paulo', () => {
    const d = new Date('2026-04-23T18:30:00Z');
    const s = formatConversionDateTime(d, 'America/Sao_Paulo');
    // São Paulo is UTC-3 (no DST since 2019)
    expect(s).toMatch(/^2026-04-23 15:30:00-03:00$/);
  });

  it('includes seconds + offset sign', () => {
    const d = new Date('2026-04-23T00:00:00Z');
    const s = formatConversionDateTime(d, 'America/Sao_Paulo');
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });
});
