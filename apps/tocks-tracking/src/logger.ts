/**
 * Tocks tracking — structured logger (pino).
 * Copied-down slim version of @tocks/sales-ai logger: same redact paths for PII,
 * no WhatsApp/Meta webhook-specific paths since tracking doesn't see them.
 */

import pino from 'pino';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LOG_LEVEL = (process.env['LOG_LEVEL'] ?? 'info') as LogLevel;
const IS_DEVELOPMENT = process.env['NODE_ENV'] !== 'production';

// Redact PII in any log output. Covers gclid payloads + Tray webhook shapes.
export const REDACT_PATHS = [
  // Phones
  'phone',
  '*.phone',
  '*.*.phone',
  'phoneNumber',
  '*.phoneNumber',
  'customer_phone',
  '*.customer_phone',

  // Emails
  'email',
  '*.email',
  '*.*.email',
  'customer_email',
  '*.customer_email',

  // Secrets / credentials
  'password',
  '*.password',
  'token',
  '*.token',
  'secret',
  '*.secret',
  'apiKey',
  '*.apiKey',
  'accessToken',
  '*.accessToken',
  'serviceRoleKey',
  '*.serviceRoleKey',
  'anonKey',
  '*.anonKey',

  // Authorization headers (various casings)
  'Authorization',
  'authorization',
  'headers.authorization',
  'headers.Authorization',
  'req.headers.authorization',
  'req.headers.Authorization',
  'x-tray-signature',
] as const;

export const logger = pino({
  name: 'tocks-tracking',
  level: LOG_LEVEL,
  transport: IS_DEVELOPMENT
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  redact: {
    paths: [...REDACT_PATHS],
    censor: '[REDACTED]',
    remove: false,
  },
  base: {
    service: 'tocks-tracking',
    env: process.env['NODE_ENV'] ?? 'development',
  },
});

/**
 * Create a child logger with a specific module context.
 */
export function createModuleLogger(module: string): pino.Logger {
  return logger.child({ module });
}

export default logger;
