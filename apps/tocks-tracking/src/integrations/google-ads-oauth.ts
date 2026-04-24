/**
 * Google Ads OAuth 2.0 refresh-token exchange.
 * Mirror of @tocks/sales-ai/src/integrations/google-ads-oauth.ts.
 *
 * Principles:
 *   - Zero SDK deps — just POST to oauth2.googleapis.com/token.
 *   - In-memory cache, refresh 60s before expiry.
 *   - Fire-and-degrade: on failure returns `null`, caller treats as disabled.
 *   - Never throws for auth errors — logs and returns null.
 *
 * Docs: https://developers.google.com/identity/protocols/oauth2/web-server#offline
 */

import { createModuleLogger } from '../logger.js';

const log = createModuleLogger('integrations:google-ads-oauth');

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleAdsOAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  fetchImpl?: typeof fetch;
  /** Safety margin before expiry (ms). Default 60s. */
  refreshMarginMs?: number;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

export class GoogleAdsOAuth {
  private cache: CachedToken | null = null;
  private inflight: Promise<string | null> | null = null;

  constructor(private readonly config: GoogleAdsOAuthConfig) {}

  async getAccessToken(now: number = Date.now()): Promise<string | null> {
    const marginMs = this.config.refreshMarginMs ?? 60_000;
    if (this.cache && this.cache.expiresAt - marginMs > now) {
      return this.cache.accessToken;
    }
    if (this.inflight) return this.inflight;

    this.inflight = this.doRefresh(now).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  reset(): void {
    this.cache = null;
  }

  private async doRefresh(now: number): Promise<string | null> {
    const fetchImpl = this.config.fetchImpl ?? fetch;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
    });

    try {
      const res = await fetchImpl(OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!res.ok) {
        const text = await safeText(res);
        log.error(
          { status: res.status, error_preview: text.slice(0, 200) },
          'google_ads.oauth.refresh_failed',
        );
        this.cache = null;
        return null;
      }

      const json = (await res.json()) as {
        access_token?: string;
        expires_in?: number;
        token_type?: string;
      };

      if (!json.access_token || !json.expires_in) {
        log.error({ json_preview: summarize(json) }, 'google_ads.oauth.malformed_response');
        return null;
      }

      this.cache = {
        accessToken: json.access_token,
        expiresAt: now + json.expires_in * 1000,
      };

      log.info(
        { expires_in_s: json.expires_in, token_type: json.token_type ?? 'Bearer' },
        'google_ads.oauth.refreshed',
      );

      return json.access_token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      log.error({ error: message }, 'google_ads.oauth.refresh_threw');
      return null;
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

function summarize(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (key === 'access_token' || key === 'refresh_token' || key === 'id_token') {
      out[key] = '[redacted]';
    } else {
      out[key] = obj[key];
    }
  }
  return out;
}
