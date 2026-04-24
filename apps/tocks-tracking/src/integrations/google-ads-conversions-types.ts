/**
 * Google Ads API v20 REST types for Offline Conversion Upload.
 * Mirror of @tocks/sales-ai — keeps deps minimal (no protobuf SDK).
 *
 * Docs: https://developers.google.com/google-ads/api/rest/reference/rest/v20/customers/uploadClickConversions
 */

export interface GoogleAdsUserIdentifier {
  /** SHA-256 hex (lowercase, no salt) of normalized email. */
  hashedEmail?: string;
  /** SHA-256 hex (lowercase, no salt) of E.164 phone. */
  hashedPhoneNumber?: string;
  userIdentifierSource?: 'UNSPECIFIED' | 'UNKNOWN' | 'FIRST_PARTY' | 'THIRD_PARTY';
}

export interface GoogleAdsClickConversionInput {
  gclid: string;
  /** Full resource name: `customers/{cid}/conversionActions/{actionId}`. */
  conversionActionResourceName: string;
  /** Google Ads format: `YYYY-MM-DD HH:MM:SS+TZ`. */
  conversionDateTime: string;
  conversionValue: number;
  currencyCode?: string;
  orderId?: string;
  userIdentifiers?: GoogleAdsUserIdentifier[];
}

export interface GoogleAdsUploadResult {
  uploaded: boolean;
  reason?: string;
  gclid?: string;
  conversionAction?: string;
  rawResponse?: unknown;
}

export interface GoogleAdsConversionsClientConfig {
  enabled: boolean;
  customerId: string;
  loginCustomerId?: string | undefined;
  developerToken: string;
  apiVersion: string;
  timeoutMs: number;
}
