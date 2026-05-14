import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommissionCalculatorService } from './commission-calculator.service';
import { AuditLoggerService } from '@/common/services';
import { Decimal } from 'decimal.js';

interface Sale {
  id: string;
  net_amount: number;
  seller_id: string;
  status: string;
}

interface User {
  id: string;
  commission_percentage: number;
}

interface Commission {
  id: string;
  sale_id: string;
  seller_id: string;
  amount: number;
  percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class CommissionCreationService {
  private supabase: SupabaseClient;

  constructor(
    private calculator: CommissionCalculatorService,
    private auditLogger: AuditLoggerService
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async createCommissionFromSale(sale: Sale, seller: User): Promise<Commission> {
    try {
      if (sale.status !== 'APPROVED') {
        throw new BadRequestException(
          `Cannot create commission for sale with status '${sale.status}'. Only APPROVED sales generate commissions.`
        );
      }

      if (seller.commission_percentage === null || seller.commission_percentage === undefined) {
        throw new BadRequestException(
          `Seller '${seller.id}' does not have a commission percentage set`
        );
      }

      const calculatedAmount = this.calculator.calculateCommission(
        sale.net_amount,
        seller.commission_percentage
      );

      const existing = await this.findCommissionBySaleId(sale.id);
      if (existing) {
        throw new ConflictException(`Commission already exists for sale '${sale.id}'`);
      }

      const { data, error } = await this.supabase
        .from('commissions')
        .insert({
          sale_id: sale.id,
          seller_id: seller.id,
          amount: calculatedAmount.toNumber(),
          percentage: seller.commission_percentage,
          status: 'PENDING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException(`Failed to create commission: ${error.message}`);
      }

      await this.auditLogger.logCommissionCreation(
        'system',
        data.id,
        sale.id,
        seller.id,
        calculatedAmount.toNumber(),
        seller.commission_percentage
      );

      return this.mapToCommissionDto(data);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create commission: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async bulkCreateForApprovedSales(approvedSaleIds: string[]): Promise<Commission[]> {
    const results: Commission[] = [];
    const errors: Array<{ saleId: string; error: string }> = [];

    for (const saleId of approvedSaleIds) {
      try {
        const sale = await this.getSaleById(saleId);
        if (!sale) {
          errors.push({ saleId, error: 'Sale not found' });
          continue;
        }

        const seller = await this.getSellerById(sale.seller_id);
        if (!seller) {
          errors.push({ saleId, error: 'Seller not found' });
          continue;
        }

        const commission = await this.createCommissionFromSale(sale, seller);
        results.push(commission);
      } catch (error) {
        errors.push({
          saleId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`Bulk creation completed with ${errors.length} errors`, errors);
    }

    return results;
  }

  private async findCommissionBySaleId(saleId: string): Promise<Commission | null> {
    try {
      const { data, error } = await this.supabase
        .from('commissions')
        .select('*')
        .eq('sale_id', saleId)
        .single();

      if (error) {
        return null;
      }

      return this.mapToCommissionDto(data);
    } catch {
      return null;
    }
  }

  private async getSaleById(saleId: string): Promise<Sale | null> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select('id, net_amount, seller_id, status')
        .eq('id', saleId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private async getSellerById(sellerId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, commission_percentage')
        .eq('id', sellerId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private mapToCommissionDto(data: Record<string, unknown>): Commission {
    return {
      id: String(data.id),
      sale_id: String(data.sale_id),
      seller_id: String(data.seller_id),
      amount: Number(data.amount),
      percentage: Number(data.percentage),
      status: String(data.status),
      created_at: String(data.created_at),
      updated_at: String(data.updated_at),
    };
  }
}
