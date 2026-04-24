/**
 * Google Ads API v20 REST client — Offline Conversion Upload.
 * Mirror of @tocks/sales-ai/src/integrations/google-ads-conversions-client.ts.
 *
 * Principles:
 *   - Fire-and-forget: never throws, returns `{ uploaded, reason }`.
 *   - Idempotent at caller level via `orderId` (Google Ads dedups on orderId).
 *   - Minimal deps — pure fetch + node:crypto.
 *   - Timeout via AbortController (default 10s).
 */

import { createModuleLogger } from '../logger.js';
import { GoogleAdsOAuth } from './google-ads-oauth.js';
import type {
  GoogleAdsClickConversionInput,
  GoogleAdsConversionsClientConfig,
  GoogleAdsUploadResult,
} from './google-ads-conversions-types.js';

const log = createModuleLogger('integrations:google-ads-conversions');

export interface UploadClickConversionOptions {
  fetchImpl?: typeof fetch;
}

export class GoogleAdsConversionsClient {
  constructor(
    private readonly config: GoogleAdsConversionsClientConfig,
    private readonly oauth: GoogleAdsOAuth,
  ) {}

  async uploadClickConversion(
    input: GoogleAdsClickConversionInput,
    options: UploadClickConversionOptions = {},
  ): Promise<GoogleAdsUploadResult> {
    if (!this.config.enabled) return { uploaded: false, reason: 'disabled' };
    if (!input.gclid || input.gclid.length < 5) return { uploaded: false, reason: 'invalid_gclid' };
    if (!input.conversionActionResourceName) {
      return { uploaded: false, reason: 'missing_conversion_action' };
    }

    const accessToken = await this.oauth.getAccessToken();
    if (!accessToken) return { uploaded: false, reason: 'oauth_failed' };

    const fetchImpl = options.fetchImpl ?? fetch;
    const url = `https://googleads.googleapis.com/${this.config.apiVersion}/customers/${this.config.customerId}:uploadClickConversions`;

    const conversion: Record<string, unknown> = {
      gclid: input.gclid,
      conversion_action: input.conversionActionResourceName,
      conversion_date_time: input.conversionDateTime,
      conversion_value: input.conversionValue,
      currency_code: input.currencyCode ?? 'BRL',
    };

    if (input.orderId) conversion.order_id = input.orderId;

    if (input.userIdentifiers && input.userIdentifiers.length > 0) {
      conversion.user_identifiers = input.userIdentifiers.map((u) => {
        const out: Record<string, unknown> = {};
        if (u.hashedEmail) out.hashed_email = u.hashedEmail;
        if (u.hashedPhoneNumber) out.hashed_phone_number = u.hashedPhoneNumber;
        if (u.userIdentifierSource) out.user_identifier_source = u.userIdentifierSource;
        return out;
      });
    }

    const body = JSON.stringify({
      conversions: [conversion],
      partial_failure: true,
      validate_only: false,
    });

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': this.config.developerToken,
      'Content-Type': 'application/json',
    };
    if (this.config.loginCustomerId) {
      headers['login-customer-id'] = this.config.loginCustomerId;
    }

    const gclidPreview = input.gclid.slice(0, 8);
    const actionPreview = input.conversionActionResourceName.split('/').pop();

    try {
      const res = await fetchImpl(url, { method: 'POST', headers, body, signal: controller.signal });

      if (!res.ok) {
        const text = await safeText(res);
        log.error(
          {
            status: res.status,
            gclid_preview: gclidPreview,
            action: actionPreview,
            error_preview: text.slice(0, 400),
          },
          'google_ads.conversions.http_error',
        );
        return { uploaded: false, reason: `http_${res.status}` };
      }

      const json = (await res.json()) as {
        results?: Array<{
          gclid?: string;
          conversion_action?: string;
          conversion_date_time?: string;
        }>;
        partial_failure_error?: { code?: number; message?: string };
      };

      if (json.partial_failure_error && json.partial_failure_error.message) {
        log.error(
          {
            gclid_preview: gclidPreview,
            action: actionPreview,
            error: json.partial_failure_error.message.slice(0, 400),
          },
          'google_ads.conversions.partial_failure',
        );
        return {
          uploaded: false,
          reason: `partial_failure:${json.partial_failure_error.message.slice(0, 120)}`,
        };
      }

      if (!json.results || json.results.length === 0) {
        log.warn(
          { gclid_preview: gclidPreview, action: actionPreview },
          'google_ads.conversions.no_results',
        );
        return { uploaded: false, reason: 'no_results' };
      }

      log.info(
        {
          gclid_preview: gclidPreview,
          action: actionPreview,
          results_count: json.results.length,
          value: input.conversionValue,
          currency: input.currencyCode ?? 'BRL',
        },
        'google_ads.conversions.uploaded',
      );

      return {
        uploaded: true,
        gclid: input.gclid,
        conversionAction: input.conversionActionResourceName,
        rawResponse: json,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      const isAbort = err instanceof Error && err.name === 'AbortError';
      log.error(
        {
          gclid_preview: gclidPreview,
          action: actionPreview,
          error: message,
          aborted: isAbort,
        },
        'google_ads.conversions.threw',
      );
      return { uploaded: false, reason: isAbort ? 'timeout' : message };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

/**
 * Format a Date as Google Ads conversion_date_time string:
 * `YYYY-MM-DD HH:MM:SS±HH:MM`.
 */
export function formatConversionDateTime(d: Date, timezone = 'America/Sao_Paulo'): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const byType: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') byType[p.type] = p.value;
  }

  const datePart = `${byType.year}-${byType.month}-${byType.day}`;
  const hour = byType.hour === '24' ? '00' : byType.hour;
  const timePart = `${hour}:${byType.minute}:${byType.second}`;

  const offsetMinutes = getTimezoneOffsetMinutes(d, timezone);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const oh = String(Math.floor(abs / 60)).padStart(2, '0');
  const om = String(abs % 60).padStart(2, '0');

  return `${datePart} ${timePart}${sign}${oh}:${om}`;
}

function getTimezoneOffsetMinutes(d: Date, timezone: string): number {
  const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tz = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
  return Math.round((tz.getTime() - utc.getTime()) / 60000);
}
