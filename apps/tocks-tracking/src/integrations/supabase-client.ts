import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { createModuleLogger } from '../logger.js';
import { loadConfigSafe } from '../config/index.js';

const log = createModuleLogger('integrations:supabase');

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, serviceRoleKey?: string): SupabaseClient {
  if (clientInstance !== null) return clientInstance;

  const config = loadConfigSafe();
  const resolvedUrl = url ?? config.supabase?.url ?? '';
  const resolvedKey = serviceRoleKey ?? config.supabase?.serviceRoleKey ?? '';

  if (!resolvedUrl || !resolvedKey) {
    throw new Error(
      'Supabase credentials missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
    );
  }

  log.info('Initializing Supabase client');
  clientInstance = createClient(resolvedUrl, resolvedKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  });

  return clientInstance;
}

export function resetSupabaseClient(): void {
  clientInstance = null;
}

export type { SupabaseClient };
