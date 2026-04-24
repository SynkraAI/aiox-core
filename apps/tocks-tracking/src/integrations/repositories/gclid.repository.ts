/**
 * Repository for gclid_captures table.
 * Adapted from @tocks/sales-ai without the BaseRepository inheritance chain
 * (tocks-tracking doesn't need the shared CRUD abstraction).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { createModuleLogger } from '../../logger.js';
import type { GclidCapture, GclidCaptureInsert } from '../../types/gclid.js';

/** Google Ads offline conversion window = 90 days. We keep 10d buffer. */
export const GOOGLE_ADS_ATTRIBUTION_WINDOW_HOURS = 90 * 24;

export class GclidRepository {
  private readonly tableName = 'gclid_captures';
  protected readonly log = createModuleLogger(`repository:gclid_captures`);

  constructor(private readonly supabase: SupabaseClient) {}

  async capture(input: GclidCaptureInsert): Promise<GclidCapture> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(`Failed to insert gclid_capture: ${error.message}`);
    return data as GclidCapture;
  }

  async findLatestByEmailHash(
    emailHash: string,
    withinHours: number = GOOGLE_ADS_ATTRIBUTION_WINDOW_HOURS,
  ): Promise<GclidCapture | null> {
    const cutoff = new Date(Date.now() - withinHours * 3600 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email_hash', emailHash)
      .gte('captured_at', cutoff)
      .order('captured_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Failed to find gclid by email_hash: ${error.message}`);
    return data && data.length > 0 ? (data[0] as GclidCapture) : null;
  }

  async findLatestByPhoneHash(
    phoneHash: string,
    withinHours: number = GOOGLE_ADS_ATTRIBUTION_WINDOW_HOURS,
  ): Promise<GclidCapture | null> {
    const cutoff = new Date(Date.now() - withinHours * 3600 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('phone_hash', phoneHash)
      .gte('captured_at', cutoff)
      .order('captured_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Failed to find gclid by phone_hash: ${error.message}`);
    return data && data.length > 0 ? (data[0] as GclidCapture) : null;
  }

  async markUploaded(
    id: string,
    args: { conversionAction: string; orderId?: string | null },
  ): Promise<GclidCapture> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        uploaded_to_google: true,
        uploaded_at: new Date().toISOString(),
        upload_conversion_action: args.conversionAction,
        tied_to_order_id: args.orderId ?? null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to mark gclid uploaded: ${error.message}`);
    return data as GclidCapture;
  }
}
