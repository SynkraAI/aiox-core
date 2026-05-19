import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface PermissionCheck {
  resource: string;
  action: string;
  hasPermission: boolean;
}

@Injectable()
export class PermissionsService {
  private supabase: SupabaseClient | null;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials missing for PermissionsService');
      this.supabase = null;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return false;
      }

      const { data: permission, error: permError } = await this.supabase
        .from('permissions')
        .select('*')
        .eq('role', user.role)
        .eq('resource', resource)
        .eq('action', action)
        .single();

      return !permError && !!permission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  async grantPermission(userId: string, resource: string, action: string): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      const { error } = await this.supabase.from('permissions').insert({
        role: user.role,
        resource,
        action,
      });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to grant permission: ${message}`);
    }
  }

  async revokePermission(userId: string, resource: string, action: string): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      const { error } = await this.supabase
        .from('permissions')
        .delete()
        .eq('role', user.role)
        .eq('resource', resource)
        .eq('action', action);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to revoke permission: ${message}`);
    }
  }

  async getPermissionsForRole(role: string): Promise<PermissionCheck[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      const { data: permissions, error } = await this.supabase
        .from('permissions')
        .select('resource, action')
        .eq('role', role);

      if (error || !permissions) {
        return [];
      }

      return permissions.map((p: any) => ({
        resource: p.resource,
        action: p.action,
        hasPermission: true,
      }));
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }
}
