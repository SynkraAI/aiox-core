/**
 * Types for gclid captures and Tray webhook events.
 * Mirror of @tocks/sales-ai src/types/gclid.ts.
 */

export interface GclidCapture {
  id: string;
  tenant_id: string;
  gclid: string;
  email_hash: string | null;
  phone_hash: string | null;
  session_id: string | null;
  source_url: string | null;
  user_agent: string | null;
  captured_at: string;
  uploaded_to_google: boolean;
  upload_conversion_action: string | null;
  uploaded_at: string | null;
  tied_to_order_id: string | null;
}

export interface GclidCaptureInsert {
  tenant_id?: string;
  gclid: string;
  email_hash?: string | null;
  phone_hash?: string | null;
  session_id?: string | null;
  source_url?: string | null;
  user_agent?: string | null;
}

export type TrayWebhookEventType = 'purchase' | 'lead' | 'capture';

export interface TrayWebhookEvent {
  event_id: string;
  event_type: TrayWebhookEventType;
  tenant_id: string;
  received_at: string;
  processed: boolean;
  processed_at: string | null;
  error: string | null;
  payload_excerpt: Record<string, unknown> | null;
}

export interface TrayWebhookEventInsert {
  event_id: string;
  event_type: TrayWebhookEventType;
  tenant_id?: string;
  payload_excerpt?: Record<string, unknown> | null;
}

/** Default Tocks tenant id (seeded in migration 004). */
export const TOCKS_TENANT_ID = '00000000-0000-0000-0000-000000000001';
