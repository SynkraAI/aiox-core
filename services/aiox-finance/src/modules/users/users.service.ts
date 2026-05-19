import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Decimal } from 'decimal.js';
import { AuditLoggerService } from '@/common/services';

interface User {
  id: string;
  commission_percentage: Decimal | null;
}

@Injectable()
export class UsersService {
  private supabase: SupabaseClient;

  constructor(private auditLogger: AuditLoggerService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async setCommissionPercentage(userId: string, percentage: Decimal): Promise<User> {
    try {
      // Validate percentage is between 0 and 100
      if (percentage.lessThan(0) || percentage.greaterThan(100)) {
        throw new BadRequestException(
          `Commission percentage must be between 0 and 100. Received: ${percentage}`
        );
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ commission_percentage: percentage.toNumber() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException(
          `Failed to update commission percentage: ${error.message}`
        );
      }

      // Log to audit trail
      await this.auditLogger.logAction({
        userId: 'system',
        action: 'UPDATE',
        tableName: 'users',
        recordId: userId,
        newValues: {
          commission_percentage: percentage.toNumber(),
        },
      });

      return this.mapToUserDto(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to set commission percentage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getCommissionPercentage(userId: string): Promise<Decimal> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('commission_percentage')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn(`User not found: ${userId}`);
        return new Decimal(0);
      }

      if (
        !data ||
        data.commission_percentage === null ||
        data.commission_percentage === undefined
      ) {
        return new Decimal(0);
      }

      return new Decimal(data.commission_percentage);
    } catch (error) {
      console.error('Failed to get commission percentage:', error);
      return new Decimal(0);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, commission_percentage')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToUserDto(data);
    } catch {
      return null;
    }
  }

  private mapToUserDto(data: Record<string, unknown>): User {
    return {
      id: String(data.id),
      commission_percentage: data.commission_percentage
        ? new Decimal(String(data.commission_percentage))
        : null,
    };
  }
}
