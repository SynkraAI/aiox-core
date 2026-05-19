import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  userId: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLoggerService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const { data, error } = await this.supabase.from('audit_log').insert({
        user_id: entry.userId,
        action: entry.action,
        table_name: entry.tableName,
        record_id: entry.recordId || null,
        old_values: entry.oldValues || null,
        new_values: entry.newValues || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Audit log insertion failed:', error);
        throw new Error(`Failed to log action: ${error.message}`);
      }

      console.log(`Audit log recorded: ${entry.action} on ${entry.tableName}`);
    } catch (error) {
      console.error(
        'Audit logger error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  async logCommissionCreation(
    userId: string,
    commissionId: string,
    saleId: string,
    sellerId: string,
    amount: number,
    percentage: number
  ): Promise<void> {
    await this.logAction({
      userId,
      action: 'CREATE',
      tableName: 'commissions',
      recordId: commissionId,
      newValues: {
        commission_id: commissionId,
        sale_id: saleId,
        seller_id: sellerId,
        amount,
        percentage,
        status: 'PENDING',
      },
    });
  }
}
