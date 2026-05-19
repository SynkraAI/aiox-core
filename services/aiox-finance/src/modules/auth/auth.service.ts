import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

interface SignUpDto {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'FINANCEIRO' | 'GESTOR' | 'COMERCIAL' | 'AUDITOR';
}

interface SignInDto {
  email: string;
  password: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SignUpResponse {
  user: UserData;
  token: string;
}

export interface SignInResponse {
  user: UserData;
  token: string;
}

@Injectable()
export class AuthService {
  private supabase: SupabaseClient | null;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials missing in .env');
      this.supabase = null;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signup(dto: SignUpDto): Promise<SignUpResponse> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        throw new Error(`Auth creation failed: ${authError?.message || 'Unknown error'}`);
      }

      const userId = authData.user.id;

      // Insert user profile
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: dto.email,
            name: dto.name,
            role: dto.role,
            active: true,
          },
        ])
        .select()
        .single();

      if (userError || !userData) {
        throw new Error(`User profile creation failed: ${userError?.message || 'Unknown error'}`);
      }

      const token = this.generateToken(userId, dto.role);

      return {
        user: {
          id: userId,
          email: dto.email,
          name: dto.name,
          role: dto.role,
        },
        token,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Signup failed: ${message}`);
    }
  }

  async signin(dto: SignInDto): Promise<SignInResponse> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // Authenticate user using regular auth API (not admin)
      const { data: authData, error: authError } = await (
        this.supabase.auth as any
      ).signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

      if (authError || !authData.user) {
        throw new Error(`Authentication failed: ${authError?.message || 'Invalid credentials'}`);
      }

      const userId = authData.user.id;

      // Get user profile
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        throw new Error(`User profile not found: ${userError?.message || 'Unknown error'}`);
      }

      const token = this.generateToken(userId, userData.role);

      return {
        user: {
          id: userId,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        token,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Signin failed: ${message}`);
    }
  }

  async logout(userId: string): Promise<void> {
    if (!this.supabase) {
      return;
    }

    try {
      await this.supabase.auth.admin.signOut(userId);
    } catch (error) {
      console.warn('Logout error:', error);
    }
  }

  private generateToken(userId: string, role: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: userId,
      role,
      iat: now,
      exp: now + 3600,
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as JwtPayload;

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        throw new Error('Token expired');
      }

      return decoded;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token format';
      throw new Error(message);
    }
  }
}
