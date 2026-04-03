/**
 * @module logger
 * @description Structured logging via pino with child loggers and redaction.
 * Provides a default console-compatible logger for backward compatibility.
 */

import pino from 'pino';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, '../../hydra-data/logs');

/**
 * Create a pino logger instance.
 * @param {Object} [options={}]
 * @param {string} [options.name='hydra'] - Logger name
 * @param {string} [options.level='info'] - Log level
 * @param {boolean} [options.pretty=false] - Enable pretty printing (dev only)
 * @param {string} [options.logFile] - Optional file path for JSON logs
 * @returns {import('pino').Logger}
 */
export function createLogger(options = {}) {
  const {
    name = 'hydra',
    level = 'info',
    pretty = false,
  } = options;

  const pinoOptions = {
    name,
    level,
    redact: ['apiKey', 'token', 'ANTHROPIC_API_KEY', 'GITHUB_TOKEN', 'password', 'secret'],
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  };

  if (pretty) {
    pinoOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    };
  }

  return pino(pinoOptions);
}

/**
 * Console-compatible logger that wraps console methods.
 * Used as fallback when pino is not desired (e.g., manual `hydra run`).
 */
export const consoleLogger = {
  info: (...args) => console.log('[HYDRA]', ...args),
  warn: (...args) => console.warn('[HYDRA]', ...args),
  error: (...args) => console.error('[HYDRA]', ...args),
  debug: (...args) => console.debug('[HYDRA]', ...args),
  fatal: (...args) => console.error('[HYDRA] FATAL:', ...args),
  child: () => consoleLogger,
};

/**
 * Default logger instance — used when no logger is injected.
 */
export const defaultLogger = consoleLogger;

export { LOG_DIR };
