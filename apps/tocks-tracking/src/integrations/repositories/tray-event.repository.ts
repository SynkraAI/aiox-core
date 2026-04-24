/**
 * Repository for tray_webhook_events — idempotency log for Tray webhooks.
 * Mirror of @tocks/sales-ai.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { createModuleLogger } from '../../logger.js';
import type {
  TrayWebhookEvent,
  TrayWebhookEventInsert,
  TrayWebhookEventType,
} from '../../types/gclid.js';

interface TrayEventUpdate {
  processed?: boolean;
  processed_at?: string;
  error?: string | null;
  payload_excerpt?: Record<string, unknown> | null;
}

export class TrayEventRepository {
  protected readonly log = createModuleLogger('repository:tray_webhook_events');
  protected readonly tableName = 'tray_webhook_events';

  constructor(protected readonly supabase: SupabaseClient) {}

  async registerEvent(input: TrayWebhookEventInsert): Promise<{
    alreadyExisted: boolean;
    event: TrayWebhookEvent | null;
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(input)
      .select()
      .single();

    if (!error && data) {
      return { alreadyExisted: false, event: data as TrayWebhookEvent };
    }

    if (error && (error.code === '23505' || error.message?.includes('duplicate'))) {
      const existing = await this.findByEventId(input.event_id);
      return { alreadyExisted: true, event: existing };
    }

    if (error) {
      throw new Error(`Failed to register tray webhook event: ${error.message}`);
    }

    return { alreadyExisted: false, event: null };
  }

  async findByEventId(eventId: string): Promise<TrayWebhookEvent | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find tray webhook event: ${error.message}`);
    return (data as TrayWebhookEvent | null) ?? null;
  }

  async markProcessed(
    eventId: string,
    args: { error?: string | null; payloadExcerpt?: Record<string, unknown> | null } = {},
  ): Promise<void> {
    const update: TrayEventUpdate = {
      processed: true,
      processed_at: new Date().toISOString(),
      error: args.error ?? null,
    };
    if (args.payloadExcerpt !== undefined) {
      update.payload_excerpt = args.payloadExcerpt;
    }

    const { error } = await this.supabase
      .from(this.tableName)
      .update(update)
      .eq('event_id', eventId);

    if (error) throw new Error(`Failed to mark tray event processed: ${error.message}`);
  }

  async countByType(type: TrayWebhookEventType, sinceHours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - sinceHours * 3600 * 1000).toISOString();
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('event_type', type)
      .gte('received_at', cutoff);

    if (error) throw new Error(`Failed to count tray events: ${error.message}`);
    return count ?? 0;
  }
}
