/**
 * Tray webhook handlers + /api/capture-gclid endpoint.
 *
 * Endpoints:
 *   POST /api/capture-gclid          — client-side gclid capture from tockscustom.com.br
 *   POST /api/tray-webhook-purchase  — Tray `pedido-pago` -> Google Ads purchase upload
 *   POST /api/tray-webhook-lead      — Tray `carrinho-abandonado` -> Lead upload
 *
 * Auth modes (fail-closed in prod — loadConfig() already gated the secret):
 *   1. HMAC header `X-Tray-Signature: sha256=<hex>` (preferred)
 *   2. Secret-na-URL query `?k=<SECRET>` (fallback when Tray lacks HMAC support)
 *
 * Design principles:
 *   - Idempotent receiver (Fowler EIP): dedup by `X-Webhook-Id` header.
 *   - Fire-and-forget to Google Ads: respond 202 immediately, upload async.
 *   - Never 5xx on upload failure (Tray would retry forever); only auth/schema
 *     errors return 4xx.
 *   - Logs only hash previews; no raw PII.
 */

import crypto from 'node:crypto';

import type { Request, Response, Router, RequestHandler } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';

import { createModuleLogger } from '../logger.js';
import type { GclidRepository } from './repositories/gclid.repository.js';
import type { TrayEventRepository } from './repositories/tray-event.repository.js';
import { hashEmail, hashPhone, hashPreview } from './hashing.js';
import type { GoogleAdsConversionsClient } from './google-ads-conversions-client.js';
import { formatConversionDateTime } from './google-ads-conversions-client.js';
import type { GoogleAdsUserIdentifier } from './google-ads-conversions-types.js';

const log = createModuleLogger('webhook:tray');

// ============================================
// Schemas
// ============================================

const captureGclidSchema = z.object({
  gclid: z.string().min(5).max(300),
  email: z.string().optional(),
  phone: z.string().optional(),
  session_id: z.string().max(200).optional(),
  source_url: z.string().max(2048).optional(),
});

const trayPurchaseSchema = z.object({
  order_id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  customer_email: z.string().optional(),
  customer_phone: z.string().optional(),
  total_value: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  currency: z.string().default('BRL'),
  paid_at: z.string().optional(),
  items: z.array(z.unknown()).optional(),
});

const trayLeadSchema = z.object({
  cart_id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  customer_email: z.string().optional(),
  customer_phone: z.string().optional(),
  abandoned_at: z.string().optional(),
  estimated_value: z.union([z.string(), z.number()]).optional(),
});

// ============================================
// Public factory
// ============================================

export interface TrayWebhookHandlerDeps {
  gclidRepo: GclidRepository;
  trayEventRepo: TrayEventRepository;
  conversionsClient: GoogleAdsConversionsClient;
  /** Shared secret — required in production (loadConfig fail-closes). */
  webhookSecret?: string;
  tocksCustomerId: string;
  conversionActionLeadId: string;
  conversionActionPurchaseId: string;
  timezone?: string;
  defaultLeadValue?: number;
}

export interface TrayWebhookHandler {
  router: Router;
  verifySignature(rawBody: Buffer | string, signatureHeader: string | undefined): boolean;
  verifyQuerySecret(queryValue: string | undefined): boolean;
}

export function createTrayWebhookHandler(deps: TrayWebhookHandlerDeps): TrayWebhookHandler {
  const router = createRouter();

  const verifySignature = (raw: Buffer | string, signatureHeader: string | undefined): boolean => {
    if (!deps.webhookSecret) return true;
    if (!signatureHeader) return false;
    const expected = crypto
      .createHmac('sha256', deps.webhookSecret)
      .update(raw)
      .digest('hex');
    const received = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice(7)
      : signatureHeader;
    if (expected.length !== received.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
    } catch {
      return false;
    }
  };

  /**
   * Secret-na-URL fallback (when Tray doesn't support HMAC natively).
   * Uses `crypto.timingSafeEqual` for constant-time comparison.
   */
  const verifyQuerySecret = (queryValue: string | undefined): boolean => {
    if (!deps.webhookSecret) return true;
    if (!queryValue || queryValue.length === 0) return false;
    const a = Buffer.from(deps.webhookSecret, 'utf8');
    const b = Buffer.from(queryValue, 'utf8');
    if (a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  };

  /**
   * Webhook auth: accept either valid HMAC header OR valid query secret.
   * Returns true if at least one matches.
   */
  const isAuthorizedWebhook = (
    rawBody: Buffer | string,
    signatureHeader: string | undefined,
    queryK: string | undefined,
  ): boolean => {
    if (!deps.webhookSecret) return true;
    if (signatureHeader && verifySignature(rawBody, signatureHeader)) return true;
    if (queryK && verifyQuerySecret(queryK)) return true;
    return false;
  };

  router.post('/api/capture-gclid', handleCaptureGclid(deps));
  router.post('/api/tray-webhook-purchase', handleTrayPurchase(deps, isAuthorizedWebhook));
  router.post('/api/tray-webhook-lead', handleTrayLead(deps, isAuthorizedWebhook));

  return { router, verifySignature, verifyQuerySecret };
}

// ============================================
// /api/capture-gclid
// ============================================

function handleCaptureGclid(deps: TrayWebhookHandlerDeps): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = captureGclidSchema.safeParse(req.body);
    if (!parsed.success) {
      log.warn({ errors: parsed.error.flatten().fieldErrors }, 'capture_gclid.validation_failed');
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }

    const { gclid, email, phone, session_id, source_url } = parsed.data;
    const emailHash = hashEmail(email);
    const phoneHash = hashPhone(phone);

    // FIX E2: enforce at-app level that at least one identifier is present
    // (DB CHECK constraint also enforces, but failing fast at API layer avoids
    // noisy Postgres errors and gives a clear response).
    if (!emailHash && !phoneHash) {
      log.warn({ gclid_preview: gclid.slice(0, 8) }, 'capture_gclid.missing_identifier');
      res.status(400).json({ ok: false, error: 'missing_identifier' });
      return;
    }

    const userAgent = req.get('user-agent') ?? null;

    try {
      const row = await deps.gclidRepo.capture({
        gclid,
        email_hash: emailHash,
        phone_hash: phoneHash,
        session_id: session_id ?? null,
        source_url: source_url ?? null,
        user_agent: userAgent,
      });

      log.info(
        {
          id: row.id,
          gclid_preview: gclid.slice(0, 8),
          has_email: Boolean(emailHash),
          has_phone: Boolean(phoneHash),
          email_hash_preview: hashPreview(emailHash),
        },
        'capture_gclid.ok',
      );

      res.status(202).json({ ok: true, id: row.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      log.error({ error: message }, 'capture_gclid.failed');
      res.status(500).json({ ok: false, error: 'internal_error' });
    }
  };
}

// ============================================
// /api/tray-webhook-purchase
// ============================================

type AuthChecker = (raw: Buffer | string, sig: string | undefined, k: string | undefined) => boolean;

function handleTrayPurchase(deps: TrayWebhookHandlerDeps, isAuthorized: AuthChecker): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    const rawBody = getRawBody(req);
    const signatureHeader = req.get('x-tray-signature') ?? undefined;
    const queryK = typeof req.query['k'] === 'string' ? req.query['k'] : undefined;

    if (deps.webhookSecret && !isAuthorized(rawBody, signatureHeader, queryK)) {
      log.warn(
        { ip: req.ip, has_sig: Boolean(signatureHeader), has_query_k: Boolean(queryK) },
        'tray.purchase.auth_invalid',
      );
      res.status(401).json({ ok: false, error: 'auth_invalid' });
      return;
    }
    if (!deps.webhookSecret) {
      log.warn('tray.webhook.unsigned');
    }

    const parsed = trayPurchaseSchema.safeParse(req.body);
    if (!parsed.success) {
      log.warn(
        { errors: parsed.error.flatten().fieldErrors },
        'tray.purchase.validation_failed',
      );
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }

    const payload = parsed.data;
    const eventId = computeEventId(req, rawBody);

    const excerpt: Record<string, unknown> = {
      order_id: payload.order_id,
      total_value: payload.total_value,
      currency: payload.currency,
      email_hash_preview: hashPreview(hashEmail(payload.customer_email)),
      phone_hash_preview: hashPreview(hashPhone(payload.customer_phone)),
    };

    const registered = await deps.trayEventRepo.registerEvent({
      event_id: eventId,
      event_type: 'purchase',
      payload_excerpt: excerpt,
    });

    if (registered.alreadyExisted) {
      log.info({ event_id: eventId, order_id: payload.order_id }, 'tray.purchase.duplicate');
      res.status(200).json({ ok: true, duplicated: true });
      return;
    }

    res.status(202).json({ ok: true, event_id: eventId });

    void processPurchaseUpload(deps, payload, eventId).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'unknown';
      log.error({ event_id: eventId, error: message }, 'tray.purchase.async_threw');
    });
  };
}

async function processPurchaseUpload(
  deps: TrayWebhookHandlerDeps,
  payload: z.infer<typeof trayPurchaseSchema>,
  eventId: string,
): Promise<void> {
  const emailHash = hashEmail(payload.customer_email);
  const phoneHash = hashPhone(payload.customer_phone);

  let capture = null;
  if (emailHash) {
    capture = await deps.gclidRepo.findLatestByEmailHash(emailHash);
  }
  if (!capture && phoneHash) {
    capture = await deps.gclidRepo.findLatestByPhoneHash(phoneHash);
  }

  if (!capture) {
    log.warn(
      {
        event_id: eventId,
        order_id: payload.order_id,
        has_email_hash: Boolean(emailHash),
        has_phone_hash: Boolean(phoneHash),
      },
      'tray.purchase.no_gclid_match',
    );
    await deps.trayEventRepo.markProcessed(eventId, { error: 'no_gclid_match' });
    return;
  }

  const conversionActionResourceName = `customers/${deps.tocksCustomerId}/conversionActions/${deps.conversionActionPurchaseId}`;
  const paidAt = payload.paid_at ? new Date(payload.paid_at) : new Date();
  const conversionDateTime = formatConversionDateTime(paidAt, deps.timezone ?? 'America/Sao_Paulo');

  const userIdentifiers: GoogleAdsUserIdentifier[] = [];
  if (emailHash) userIdentifiers.push({ hashedEmail: emailHash });
  if (phoneHash) userIdentifiers.push({ hashedPhoneNumber: phoneHash });

  const upload = await deps.conversionsClient.uploadClickConversion({
    gclid: capture.gclid,
    conversionActionResourceName,
    conversionDateTime,
    conversionValue: payload.total_value,
    currencyCode: payload.currency || 'BRL',
    orderId: payload.order_id,
    userIdentifiers: userIdentifiers.length > 0 ? userIdentifiers : undefined,
  });

  if (upload.uploaded) {
    await deps.gclidRepo.markUploaded(capture.id, {
      conversionAction: conversionActionResourceName,
      orderId: payload.order_id,
    });
    await deps.trayEventRepo.markProcessed(eventId);
  } else {
    await deps.trayEventRepo.markProcessed(eventId, {
      error: `upload_failed:${upload.reason ?? 'unknown'}`,
    });
  }
}

// ============================================
// /api/tray-webhook-lead
// ============================================

function handleTrayLead(deps: TrayWebhookHandlerDeps, isAuthorized: AuthChecker): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    const rawBody = getRawBody(req);
    const signatureHeader = req.get('x-tray-signature') ?? undefined;
    const queryK = typeof req.query['k'] === 'string' ? req.query['k'] : undefined;

    if (deps.webhookSecret && !isAuthorized(rawBody, signatureHeader, queryK)) {
      log.warn(
        { ip: req.ip, has_sig: Boolean(signatureHeader), has_query_k: Boolean(queryK) },
        'tray.lead.auth_invalid',
      );
      res.status(401).json({ ok: false, error: 'auth_invalid' });
      return;
    }
    if (!deps.webhookSecret) {
      log.warn('tray.webhook.unsigned');
    }

    const parsed = trayLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      log.warn({ errors: parsed.error.flatten().fieldErrors }, 'tray.lead.validation_failed');
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }

    const payload = parsed.data;
    const eventId = computeEventId(req, rawBody);

    const excerpt: Record<string, unknown> = {
      cart_id: payload.cart_id,
      estimated_value: payload.estimated_value ?? null,
      email_hash_preview: hashPreview(hashEmail(payload.customer_email)),
      phone_hash_preview: hashPreview(hashPhone(payload.customer_phone)),
    };

    const registered = await deps.trayEventRepo.registerEvent({
      event_id: eventId,
      event_type: 'lead',
      payload_excerpt: excerpt,
    });

    if (registered.alreadyExisted) {
      log.info({ event_id: eventId, cart_id: payload.cart_id }, 'tray.lead.duplicate');
      res.status(200).json({ ok: true, duplicated: true });
      return;
    }

    res.status(202).json({ ok: true, event_id: eventId });

    void processLeadUpload(deps, payload, eventId).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'unknown';
      log.error({ event_id: eventId, error: message }, 'tray.lead.async_threw');
    });
  };
}

async function processLeadUpload(
  deps: TrayWebhookHandlerDeps,
  payload: z.infer<typeof trayLeadSchema>,
  eventId: string,
): Promise<void> {
  const emailHash = hashEmail(payload.customer_email);
  const phoneHash = hashPhone(payload.customer_phone);

  let capture = null;
  if (emailHash) {
    capture = await deps.gclidRepo.findLatestByEmailHash(emailHash);
  }
  if (!capture && phoneHash) {
    capture = await deps.gclidRepo.findLatestByPhoneHash(phoneHash);
  }

  if (!capture) {
    log.warn(
      {
        event_id: eventId,
        cart_id: payload.cart_id,
        has_email_hash: Boolean(emailHash),
        has_phone_hash: Boolean(phoneHash),
      },
      'tray.lead.no_gclid_match',
    );
    await deps.trayEventRepo.markProcessed(eventId, { error: 'no_gclid_match' });
    return;
  }

  const conversionActionResourceName = `customers/${deps.tocksCustomerId}/conversionActions/${deps.conversionActionLeadId}`;
  const abandonedAt = payload.abandoned_at ? new Date(payload.abandoned_at) : new Date();
  const conversionDateTime = formatConversionDateTime(
    abandonedAt,
    deps.timezone ?? 'America/Sao_Paulo',
  );

  const leadValue =
    payload.estimated_value !== undefined
      ? Number(payload.estimated_value)
      : deps.defaultLeadValue ?? 13_000;

  const userIdentifiers: GoogleAdsUserIdentifier[] = [];
  if (emailHash) userIdentifiers.push({ hashedEmail: emailHash });
  if (phoneHash) userIdentifiers.push({ hashedPhoneNumber: phoneHash });

  const upload = await deps.conversionsClient.uploadClickConversion({
    gclid: capture.gclid,
    conversionActionResourceName,
    conversionDateTime,
    conversionValue: leadValue,
    currencyCode: 'BRL',
    orderId: `cart_${payload.cart_id}`,
    userIdentifiers: userIdentifiers.length > 0 ? userIdentifiers : undefined,
  });

  if (upload.uploaded) {
    await deps.gclidRepo.markUploaded(capture.id, {
      conversionAction: conversionActionResourceName,
      orderId: `cart_${payload.cart_id}`,
    });
    await deps.trayEventRepo.markProcessed(eventId);
  } else {
    await deps.trayEventRepo.markProcessed(eventId, {
      error: `upload_failed:${upload.reason ?? 'unknown'}`,
    });
  }
}

// ============================================
// Helpers
// ============================================

function computeEventId(req: Request, rawBody: Buffer | string): string {
  const hdr = req.get('x-webhook-id') || req.get('x-tray-webhook-id') || req.get('x-event-id');
  if (hdr) return hdr;
  const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 32);
}

function getRawBody(req: Request): Buffer | string {
  const withRaw = req as Request & { rawBody?: Buffer };
  if (withRaw.rawBody) return withRaw.rawBody;
  return JSON.stringify(req.body ?? {});
}
