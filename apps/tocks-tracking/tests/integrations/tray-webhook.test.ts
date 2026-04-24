/**
 * Tests for createTrayWebhookHandler (tocks-tracking).
 * Ported from @tocks/sales-ai with added coverage for secret-in-URL fallback.
 */

import crypto from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';

import express from 'express';
import { describe, it, expect, vi } from 'vitest';

import { createTrayWebhookHandler } from '../../src/integrations/tray-webhook.js';
import type { TrayWebhookHandlerDeps } from '../../src/integrations/tray-webhook.js';

function fakeGclidRepo() {
  const store = new Map<string, Record<string, unknown>>();
  return {
    __store: store,
    capture: vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
      const row = { id: `row-${store.size + 1}`, ...input };
      store.set(row.id as string, row);
      return row;
    }),
    findLatestByEmailHash: vi.fn().mockResolvedValue(null),
    findLatestByPhoneHash: vi.fn().mockResolvedValue(null),
    markUploaded: vi.fn().mockResolvedValue({ id: 'row-1', uploaded_to_google: true }),
  };
}

function fakeTrayEventRepo() {
  const seen = new Set<string>();
  return {
    __seen: seen,
    registerEvent: vi.fn().mockImplementation(async (input: { event_id: string }) => {
      if (seen.has(input.event_id)) return { alreadyExisted: true, event: null };
      seen.add(input.event_id);
      return { alreadyExisted: false, event: { event_id: input.event_id } };
    }),
    markProcessed: vi.fn().mockResolvedValue(undefined),
    findByEventId: vi.fn().mockResolvedValue(null),
    countByType: vi.fn().mockResolvedValue(0),
  };
}

function fakeConversionsClient(
  result: { uploaded: boolean; reason?: string } = { uploaded: true },
) {
  return {
    uploadClickConversion: vi.fn().mockResolvedValue(result),
  };
}

function buildDeps(overrides: Partial<TrayWebhookHandlerDeps> = {}): TrayWebhookHandlerDeps {
  return {
    gclidRepo: fakeGclidRepo() as never,
    trayEventRepo: fakeTrayEventRepo() as never,
    conversionsClient: fakeConversionsClient() as never,
    tocksCustomerId: '8146675397',
    conversionActionLeadId: '7550396040',
    conversionActionPurchaseId: '7161904202',
    timezone: 'America/Sao_Paulo',
    defaultLeadValue: 13_000,
    ...overrides,
  };
}

interface ServerCtx {
  url: string;
  close: () => Promise<void>;
}

async function startApp(deps: TrayWebhookHandlerDeps): Promise<ServerCtx> {
  const app = express();
  app.use(
    express.json({
      limit: '256kb',
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  const handler = createTrayWebhookHandler(deps);
  app.use(handler.router);

  const server: Server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    parsed = { raw: text };
  }
  return { status: res.status, body: parsed };
}

// ---------- Tests ----------

describe('POST /api/capture-gclid', () => {
  it('accepts a minimal gclid payload with email', async () => {
    const gclidRepo = fakeGclidRepo();
    const deps = buildDeps({ gclidRepo: gclidRepo as never });
    const ctx = await startApp(deps);

    const res = await postJson(`${ctx.url}/api/capture-gclid`, {
      gclid: 'Cj0KCQjwg9e4BhDXARIsA',
      email: 'a@b.com',
    });
    expect(res.status).toBe(202);
    expect(res.body.ok).toBe(true);
    expect(gclidRepo.capture).toHaveBeenCalledTimes(1);
    await ctx.close();
  });

  it('FIX E2: rejects capture without email or phone', async () => {
    const gclidRepo = fakeGclidRepo();
    const deps = buildDeps({ gclidRepo: gclidRepo as never });
    const ctx = await startApp(deps);

    const res = await postJson(`${ctx.url}/api/capture-gclid`, {
      gclid: 'Cj0KCQjwg9e4BhDXARIsA',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missing_identifier');
    expect(gclidRepo.capture).not.toHaveBeenCalled();
    await ctx.close();
  });

  it('hashes email and phone before storing', async () => {
    const gclidRepo = fakeGclidRepo();
    const deps = buildDeps({ gclidRepo: gclidRepo as never });
    const ctx = await startApp(deps);

    const res = await postJson(`${ctx.url}/api/capture-gclid`, {
      gclid: 'Cj0KCQjwg9e4BhDXARIsA',
      email: 'Breno@Tocks.COM',
      phone: '(47) 99999-1234',
    });
    expect(res.status).toBe(202);
    const call = gclidRepo.capture.mock.calls[0][0] as Record<string, string>;
    expect(call.email_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(call.phone_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(call)).not.toMatch(/Breno@Tocks/);
    expect(JSON.stringify(call)).not.toMatch(/99999/);
    await ctx.close();
  });

  it('rejects missing gclid', async () => {
    const deps = buildDeps();
    const ctx = await startApp(deps);
    const res = await postJson(`${ctx.url}/api/capture-gclid`, { email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
    await ctx.close();
  });
});

describe('POST /api/tray-webhook-purchase', () => {
  it('rejects invalid HMAC when webhookSecret is set', async () => {
    const deps = buildDeps({ webhookSecret: 'shared-secret' });
    const ctx = await startApp(deps);

    const res = await postJson(
      `${ctx.url}/api/tray-webhook-purchase`,
      {
        order_id: 'ORD-1',
        total_value: 19900,
        customer_email: 'a@b.com',
        paid_at: '2026-04-23T12:00:00Z',
      },
      { 'x-tray-signature': 'sha256=deadbeef' },
    );

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('auth_invalid');
    await ctx.close();
  });

  it('accepts valid HMAC signature', async () => {
    const webhookSecret = 'shared-secret';
    const gclidRepo = fakeGclidRepo();
    gclidRepo.findLatestByEmailHash.mockResolvedValue({
      id: 'captureid-1',
      gclid: 'Cj0KCQjwg9e4BhDXARIsA',
    } as never);
    const trayRepo = fakeTrayEventRepo();
    const conv = fakeConversionsClient({ uploaded: true });
    const deps = buildDeps({
      webhookSecret,
      gclidRepo: gclidRepo as never,
      trayEventRepo: trayRepo as never,
      conversionsClient: conv as never,
    });
    const ctx = await startApp(deps);

    const bodyObj = {
      order_id: 'ORD-1',
      total_value: 19900,
      customer_email: 'a@b.com',
      paid_at: '2026-04-23T12:00:00Z',
    };
    const raw = JSON.stringify(bodyObj);
    const signature = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');

    const res = await fetch(`${ctx.url}/api/tray-webhook-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tray-signature': `sha256=${signature}`,
        'x-webhook-id': 'tray-evt-1',
      },
      body: raw,
    });
    expect(res.status).toBe(202);
    const parsed = await res.json();
    expect(parsed.ok).toBe(true);

    await new Promise((r) => setTimeout(r, 50));
    expect(conv.uploadClickConversion).toHaveBeenCalled();
    const uploadArg = conv.uploadClickConversion.mock.calls[0][0];
    expect(uploadArg.gclid).toBe('Cj0KCQjwg9e4BhDXARIsA');
    expect(uploadArg.orderId).toBe('ORD-1');
    await ctx.close();
  });

  it('FIX fallback: accepts secret-in-URL when HMAC unavailable', async () => {
    const webhookSecret = 'shared-secret';
    const gclidRepo = fakeGclidRepo();
    gclidRepo.findLatestByEmailHash.mockResolvedValue({
      id: 'captureid-2',
      gclid: 'Cj0KCQjwg9e4BhDXARIsA',
    } as never);
    const conv = fakeConversionsClient({ uploaded: true });
    const deps = buildDeps({
      webhookSecret,
      gclidRepo: gclidRepo as never,
      conversionsClient: conv as never,
    });
    const ctx = await startApp(deps);

    const res = await postJson(
      `${ctx.url}/api/tray-webhook-purchase?k=${webhookSecret}`,
      {
        order_id: 'ORD-URL-SECRET',
        total_value: 19900,
        customer_email: 'a@b.com',
        paid_at: '2026-04-23T12:00:00Z',
      },
      // Note: NO X-Tray-Signature header
    );
    expect(res.status).toBe(202);
    await new Promise((r) => setTimeout(r, 50));
    expect(conv.uploadClickConversion).toHaveBeenCalled();
    await ctx.close();
  });

  it('FIX fallback: rejects wrong secret-in-URL', async () => {
    const deps = buildDeps({ webhookSecret: 'the-real-secret' });
    const ctx = await startApp(deps);
    const res = await postJson(`${ctx.url}/api/tray-webhook-purchase?k=wrong-secret`, {
      order_id: 'ORD-1',
      total_value: 1,
      customer_email: 'a@b.com',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('auth_invalid');
    await ctx.close();
  });

  it('short-circuits duplicate event_id (idempotency)', async () => {
    const trayRepo = fakeTrayEventRepo();
    const conv = fakeConversionsClient();
    const deps = buildDeps({
      trayEventRepo: trayRepo as never,
      conversionsClient: conv as never,
    });
    const ctx = await startApp(deps);

    const body = {
      order_id: 'ORD-DUP',
      total_value: 100,
      customer_email: 'a@b.com',
      paid_at: '2026-04-23T12:00:00Z',
    };
    const hdr = { 'x-webhook-id': 'dup-id' };
    const r1 = await postJson(`${ctx.url}/api/tray-webhook-purchase`, body, hdr);
    const r2 = await postJson(`${ctx.url}/api/tray-webhook-purchase`, body, hdr);

    expect(r1.status).toBe(202);
    expect(r2.status).toBe(200);
    expect(r2.body.duplicated).toBe(true);
    await ctx.close();
  });

  it('does not call uploadClickConversion when no gclid match', async () => {
    const gclidRepo = fakeGclidRepo();
    const conv = fakeConversionsClient();
    const trayRepo = fakeTrayEventRepo();
    const deps = buildDeps({
      gclidRepo: gclidRepo as never,
      conversionsClient: conv as never,
      trayEventRepo: trayRepo as never,
    });
    const ctx = await startApp(deps);

    const res = await postJson(`${ctx.url}/api/tray-webhook-purchase`, {
      order_id: 'ORD-NOGCLID',
      total_value: 500,
      customer_email: 'missing@example.com',
      paid_at: '2026-04-23T12:00:00Z',
    });
    expect(res.status).toBe(202);
    await new Promise((r) => setTimeout(r, 50));
    expect(conv.uploadClickConversion).not.toHaveBeenCalled();
    expect(trayRepo.markProcessed).toHaveBeenCalled();
    const markArgs = trayRepo.markProcessed.mock.calls[0];
    expect(markArgs[1].error).toBe('no_gclid_match');
    await ctx.close();
  });
});

describe('POST /api/tray-webhook-lead', () => {
  it('uses lead conversion action + default value when estimated_value absent', async () => {
    const gclidRepo = fakeGclidRepo();
    gclidRepo.findLatestByPhoneHash.mockResolvedValue({
      id: 'capid',
      gclid: 'Cj0ABC123456',
    } as never);
    const conv = fakeConversionsClient({ uploaded: true });
    const deps = buildDeps({
      gclidRepo: gclidRepo as never,
      conversionsClient: conv as never,
      defaultLeadValue: 13_000,
    });
    const ctx = await startApp(deps);

    const res = await postJson(`${ctx.url}/api/tray-webhook-lead`, {
      cart_id: 'CART-1',
      customer_phone: '+5547999991234',
      abandoned_at: '2026-04-23T12:00:00Z',
    });
    expect(res.status).toBe(202);
    await new Promise((r) => setTimeout(r, 50));
    expect(conv.uploadClickConversion).toHaveBeenCalled();
    const arg = conv.uploadClickConversion.mock.calls[0][0];
    expect(arg.conversionActionResourceName).toBe(
      'customers/8146675397/conversionActions/7550396040',
    );
    expect(arg.conversionValue).toBe(13000);
    expect(arg.orderId).toBe('cart_CART-1');
    await ctx.close();
  });
});

describe('verifySignature helper', () => {
  it('returns true when no secret configured', () => {
    const deps = buildDeps({ webhookSecret: undefined });
    const { verifySignature } = createTrayWebhookHandler(deps);
    expect(verifySignature('body', undefined)).toBe(true);
    expect(verifySignature('body', 'sha256=anything')).toBe(true);
  });

  it('rejects when signature header missing and secret set', () => {
    const deps = buildDeps({ webhookSecret: 'x' });
    const { verifySignature } = createTrayWebhookHandler(deps);
    expect(verifySignature('body', undefined)).toBe(false);
  });

  it('accepts matching signature in both sha256= prefix and bare hex formats', () => {
    const secret = 'xyz';
    const body = 'hello';
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const deps = buildDeps({ webhookSecret: secret });
    const { verifySignature } = createTrayWebhookHandler(deps);
    expect(verifySignature(body, `sha256=${expected}`)).toBe(true);
    expect(verifySignature(body, expected)).toBe(true);
    expect(verifySignature(body, 'sha256=deadbeef')).toBe(false);
  });
});

describe('verifyQuerySecret helper', () => {
  it('returns true when no secret configured', () => {
    const deps = buildDeps({ webhookSecret: undefined });
    const { verifyQuerySecret } = createTrayWebhookHandler(deps);
    expect(verifyQuerySecret('anything')).toBe(true);
    expect(verifyQuerySecret(undefined)).toBe(true);
  });

  it('rejects empty or missing query when secret is set', () => {
    const deps = buildDeps({ webhookSecret: 'secret' });
    const { verifyQuerySecret } = createTrayWebhookHandler(deps);
    expect(verifyQuerySecret(undefined)).toBe(false);
    expect(verifyQuerySecret('')).toBe(false);
  });

  it('accepts matching secret (constant-time compare)', () => {
    const deps = buildDeps({ webhookSecret: 'abcdef-32-hex' });
    const { verifyQuerySecret } = createTrayWebhookHandler(deps);
    expect(verifyQuerySecret('abcdef-32-hex')).toBe(true);
    expect(verifyQuerySecret('wrong')).toBe(false);
    // Different length must not throw
    expect(verifyQuerySecret('abcdef-32-hex-extra')).toBe(false);
  });
});
