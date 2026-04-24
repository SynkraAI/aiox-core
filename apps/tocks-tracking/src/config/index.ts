/**
 * Tocks tracking — minimal Zod config schema.
 *
 * Extracted from @tocks/sales-ai with only the fields this service needs:
 *   - App (port, NODE_ENV, log level)
 *   - Supabase (for gclid_captures + tray_webhook_events tables)
 *   - Google Ads OAuth + API (offline conversion upload)
 *   - Tray webhook (HMAC secret)
 *   - CORS allowlist for /api/capture-gclid
 *
 * FIX B1: tray.webhookSecret REQUIRED in production (fail-closed at boot).
 * FIX B2: cors.origins REQUIRED in production (fail-closed at boot).
 */

import { z } from 'zod';

/**
 * Evaluated at validation time (not module load) so tests can flip NODE_ENV.
 */
function isProduction(): boolean {
  return (process.env['NODE_ENV'] ?? 'development') === 'production';
}

const configSchema = z.object({
  app: z.object({
    port: z.number().default(3100),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
    logLevel: z.string().default('info'),
  }),

  supabase: z.object({
    url: z.string().url(),
    serviceRoleKey: z.string().min(1),
  }),

  googleAds: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    developerToken: z.string().optional(),
    refreshToken: z.string().optional(),
    loginCustomerId: z.string().optional(),
    tocksCustomerId: z.string().default('8146675397'),
    conversionActionLeadId: z.string().default('7550396040'),
    conversionActionPurchaseId: z.string().default('7161904202'),
    apiVersion: z.string().default('v20'),
    timeoutMs: z.number().default(10000),
    timezone: z.string().default('America/Sao_Paulo'),
    defaultLeadValue: z.number().default(13_000),
    enabled: z.boolean().default(false),
  }),

  tray: z
    .object({
      webhookSecret: z.string().optional(),
      enabled: z.boolean().default(false),
    })
    .superRefine((val, ctx) => {
      if (isProduction() && (!val.webhookSecret || val.webhookSecret.trim().length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['webhookSecret'],
          message:
            'TRAY_WEBHOOK_SECRET is required in production (fail-closed: unsigned webhooks can inject fake Smart Bidding signal). Generate a 32-byte hex secret and share with the Tray dev via a secure channel.',
        });
      }
    }),

  cors: z
    .object({
      origins: z.array(z.string()).default([]),
    })
    .superRefine((val, ctx) => {
      if (isProduction() && val.origins.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['origins'],
          message:
            'CORS_ORIGINS is required in production (fail-closed: prevents spam/abuse of /api/capture-gclid). Example: CORS_ORIGINS=https://tockscustom.com.br,https://www.tockscustom.com.br',
        });
      }
    }),

  rateLimiting: z.object({
    windowMs: z.number().default(60_000),
    maxRequests: z.number().default(100),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Load and validate configuration from environment variables.
 * Throws on invalid configuration (fail-closed in production).
 */
export function loadConfig(): AppConfig {
  const raw = {
    app: {
      port: Number(process.env['PORT'] ?? '3100'),
      nodeEnv: process.env['NODE_ENV'],
      logLevel: process.env['LOG_LEVEL'],
    },
    supabase: {
      url: process.env['SUPABASE_URL'] ?? '',
      serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
    },
    googleAds: {
      clientId: process.env['GOOGLE_ADS_CLIENT_ID'] || undefined,
      clientSecret: process.env['GOOGLE_ADS_CLIENT_SECRET'] || undefined,
      developerToken: process.env['GOOGLE_ADS_DEVELOPER_TOKEN'] || undefined,
      refreshToken: process.env['GOOGLE_ADS_REFRESH_TOKEN'] || undefined,
      loginCustomerId: process.env['GOOGLE_ADS_LOGIN_CUSTOMER_ID'] || undefined,
      tocksCustomerId: process.env['GOOGLE_ADS_TOCKS_CUSTOMER_ID'] || '8146675397',
      conversionActionLeadId: process.env['GOOGLE_ADS_CONVERSION_ACTION_LEAD_ID'] || '7550396040',
      conversionActionPurchaseId:
        process.env['GOOGLE_ADS_CONVERSION_ACTION_PURCHASE_ID'] || '7161904202',
      apiVersion: process.env['GOOGLE_ADS_API_VERSION'] || 'v20',
      timeoutMs: Number(process.env['GOOGLE_ADS_TIMEOUT_MS'] ?? '10000'),
      timezone: process.env['GOOGLE_ADS_TIMEZONE'] || 'America/Sao_Paulo',
      defaultLeadValue: Number(process.env['GOOGLE_ADS_DEFAULT_LEAD_VALUE'] ?? '13000'),
      enabled: Boolean(
        process.env['GOOGLE_ADS_CLIENT_ID'] &&
          process.env['GOOGLE_ADS_CLIENT_SECRET'] &&
          process.env['GOOGLE_ADS_DEVELOPER_TOKEN'] &&
          process.env['GOOGLE_ADS_REFRESH_TOKEN'],
      ),
    },
    tray: {
      webhookSecret: process.env['TRAY_WEBHOOK_SECRET'] || undefined,
      enabled: Boolean(process.env['TRAY_WEBHOOK_SECRET']),
    },
    cors: {
      origins: parseCorsOrigins(process.env['CORS_ORIGINS']),
    },
    rateLimiting: {
      windowMs: Number(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000'),
      maxRequests: Number(process.env['RATE_LIMIT_MAX'] ?? '100'),
    },
  };

  return configSchema.parse(raw);
}

/**
 * Load config with relaxed validation for dev/test.
 * In production, hard-fails at boot if any critical field is missing.
 */
export function loadConfigSafe(): Partial<AppConfig> {
  try {
    return loadConfig();
  } catch (error) {
    if (isProduction()) {
      // In production, escalate — we MUST fail-closed.
      throw error;
    }
    const msg = error instanceof Error ? error.message : 'unknown';
    console.warn(
      `[config] loadConfig() failed (${process.env['NODE_ENV'] ?? 'unknown'}): ${msg}. Using minimal fallback.`,
    );
    return {
      app: {
        port: Number(process.env['PORT'] ?? '3100'),
        nodeEnv: (process.env['NODE_ENV'] ?? 'development') as 'development',
        logLevel: process.env['LOG_LEVEL'] ?? 'info',
      },
    };
  }
}
