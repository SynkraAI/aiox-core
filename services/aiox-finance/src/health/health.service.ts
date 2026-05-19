import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface DbStatus {
  connected: boolean;
  message?: string;
}

@Injectable()
export class HealthService {
  private supabase: SupabaseClient | null;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️  Supabase credentials missing in .env');
      this.supabase = null;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async checkDb(): Promise<DbStatus> {
    if (!this.supabase) {
      return {
        connected: false,
        message: 'Supabase not configured (missing SUPABASE_URL or SUPABASE_ANON_KEY)',
      };
    }

    try {
      const { error } = await this.supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (error) {
        return {
          connected: false,
          message: `Database error: ${error.message}`,
        };
      }

      return { connected: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        connected: false,
        message: `Connection failed: ${message}`,
      };
    }
  }
}
