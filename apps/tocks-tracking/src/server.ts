/**
 * Tocks Tracking — minimal Express HTTP server.
 *
 * Routes:
 *   POST /api/capture-gclid          - gclid capture from tockscustom.com.br
 *   POST /api/tray-webhook-purchase  - Tray order-paid webhook
 *   POST /api/tray-webhook-lead      - Tray cart-abandoned webhook
 *   GET  /health                     - simple liveness probe
 *
 * Deploy target: Railway / any Node runtime. Stateless except for in-memory
 * OAuth token cache; all durable state lives in Supabase.
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { createModuleLogger } from './logger.js';
import { createTrayWebhookHandler } from './integrations/tray-webhook.js';
import { GclidRepository } from './integrations/repositories/gclid.repository.js';
import { TrayEventRepository } from './integrations/repositories/tray-event.repository.js';
import { GoogleAdsOAuth } from './integrations/google-ads-oauth.js';
import { GoogleAdsConversionsClient } from './integrations/google-ads-conversions-client.js';
import { getSupabaseClient } from './integrations/supabase-client.js';
import { loadConfig, type AppConfig } from './config/index.js';

const log = createModuleLogger('server');

export async function createApp(configOverride?: AppConfig): Promise<express.Application> {
  // loadConfig() fail-closes in production if TRAY_WEBHOOK_SECRET or CORS_ORIGINS
  // are missing (FIX B1 + B2).
  const config = configOverride ?? loadConfig();
  const app = express();

  app.set('trust proxy', 1);

  // HTTPS enforcement in production
  if (config.app.nodeEnv === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.hostname}${req.url}`);
      }
      next();
    });
  }

  app.use(helmet());

  // CORS — production MUST set CORS_ORIGINS (fail-closed via config validation).
  const allowedOrigins = config.cors.origins;
  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // rawBody capture for HMAC validation
  app.use(
    express.json({
      limit: '128kb',
      verify: (req: Request, _res: Response, buf: Buffer) => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    log.debug({ method: req.method, path: req.path, ip: req.ip }, 'Incoming request');
    next();
  });

  // Basic memory rate limiter (no Redis dep — single-instance deployment)
  app.use(memoryRateLimiter(config.rateLimiting.windowMs, config.rateLimiting.maxRequests));

  // ---------- Tray webhooks + capture-gclid ----------
  const supabase = getSupabaseClient();
  const gclidRepo = new GclidRepository(supabase);
  const trayEventRepo = new TrayEventRepository(supabase);

  const ga = config.googleAds;
  const oauth = new GoogleAdsOAuth({
    clientId: ga.clientId ?? '',
    clientSecret: ga.clientSecret ?? '',
    refreshToken: ga.refreshToken ?? '',
  });

  const conversionsClient = new GoogleAdsConversionsClient(
    {
      enabled: ga.enabled,
      customerId: ga.tocksCustomerId,
      loginCustomerId: ga.loginCustomerId,
      developerToken: ga.developerToken ?? '',
      apiVersion: ga.apiVersion,
      timeoutMs: ga.timeoutMs,
    },
    oauth,
  );

  const trayHandler = createTrayWebhookHandler({
    gclidRepo,
    trayEventRepo,
    conversionsClient,
    webhookSecret: config.tray.webhookSecret,
    tocksCustomerId: ga.tocksCustomerId,
    conversionActionLeadId: ga.conversionActionLeadId,
    conversionActionPurchaseId: ga.conversionActionPurchaseId,
    timezone: ga.timezone,
    defaultLeadValue: ga.defaultLeadValue,
  });

  app.use(trayHandler.router);

  log.info(
    {
      google_ads_enabled: ga.enabled,
      tray_signed: Boolean(config.tray.webhookSecret),
      cors_origins: allowedOrigins.length,
    },
    'Tracking endpoints registered',
  );

  // ---------- Health ----------
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'tocks-tracking',
      uptime_s: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use(
    (
      err: Error & { type?: string; status?: number },
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      if (err.type === 'entity.too.large') {
        log.warn({ type: err.type }, 'Request body exceeds limit');
        res.status(413).json({ error: 'Payload too large' });
        return;
      }
      log.error({ error: err.message }, 'Unhandled server error');
      res.status(500).json({ error: 'Internal server error' });
    },
  );

  return app;
}

/**
 * Simple in-memory sliding window rate limiter.
 * Single-instance deployment (no Redis dep). Production scale needs a proxy
 * (Cloudflare/NGINX) in front or swap to Redis-backed limiter.
 */
function memoryRateLimiter(
  windowMs: number,
  maxRequests: number,
): (req: Request, res: Response, next: NextFunction) => void {
  const store = new Map<string, { count: number; resetAt: number }>();

  // Periodic cleanup to avoid unbounded memory growth
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, 5 * 60_000);
  cleanupTimer.unref?.();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    let entry = store.get(ip);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(ip, entry);
    }
    entry.count++;

    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({ error: 'Too Many Requests', retryAfter });
      return;
    }
    next();
  };
}

export async function startServer(): Promise<{ close: () => Promise<void> }> {
  const config = loadConfig();
  const app = await createApp(config);

  const server = app.listen(config.app.port, () => {
    log.info(
      {
        port: config.app.port,
        env: config.app.nodeEnv,
      },
      'tocks-tracking server started',
    );
  });

  const close = (): Promise<void> =>
    new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else {
          log.info('Server closed');
          resolve();
        }
      });
    });

  return { close };
}
