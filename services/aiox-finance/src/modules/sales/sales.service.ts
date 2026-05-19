import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateSaleDto, CreateSaleSchema } from './dto/create-sale.dto';
import { UpdateSaleDto, UpdateSaleSchema } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async create(dto: CreateSaleDto, userId: string): Promise<SaleResponseDto> {
    try {
      const validated = CreateSaleSchema.parse(dto);

      const user = await this.getUserWithRole(userId);
      if (!user) {
        throw new ForbiddenException('User not found or lacks required role');
      }

      if (validated.seller_id !== userId && user.role !== 'ADMIN') {
        throw new ForbiddenException('Cannot create sales for other sellers');
      }

      const customer = await this.getCustomerById(validated.customer_id);
      if (!customer) {
        throw new BadRequestException('Customer does not exist');
      }

      if (validated.financial_gateway_id) {
        const gateway = await this.getGatewayById(validated.financial_gateway_id);
        if (!gateway) {
          throw new BadRequestException('Financial gateway does not exist');
        }
      }

      const { data, error } = await this.supabase
        .from('sales')
        .insert({
          id: uuidv4(),
          customer_id: validated.customer_id,
          seller_id: validated.seller_id,
          gross_amount: validated.gross_amount,
          net_amount: validated.net_amount,
          tax_amount: validated.tax_amount,
          discount_amount: validated.discount_amount,
          payment_method: validated.payment_method,
          financial_gateway_id: validated.financial_gateway_id,
          installment_count: validated.installment_count,
          is_recurring: validated.is_recurring,
          notes: validated.notes || null,
          status: 'PENDING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException(`Failed to create sale: ${error.message}`);
      }

      return this.mapToResponseDto(data);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Error && error.name === 'ZodError') {
        const zodIssues = (error as any).issues ?? (error as any).errors ?? [];
        const fieldErrors = zodIssues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException(`Validation failed: ${fieldErrors.join('; ')}`);
      }
      throw error;
    }
  }

  async findAll(
    filters?: {
      status?: string;
      seller_id?: string;
      financial_gateway_id?: string;
      period?: string;
      page?: number;
      limit?: number;
    },
    userId?: string
  ): Promise<{ data: SaleResponseDto[]; total: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;

      let query = this.supabase.from('sales').select('*', { count: 'exact' });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }

      if (filters?.financial_gateway_id) {
        query = query.eq('financial_gateway_id', filters.financial_gateway_id);
      }

      const { data, count, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new InternalServerErrorException(
          `Failed to fetch sales: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return {
        data: (data || []).map((sale) => this.mapToResponseDto(sale)),
        total: count || 0,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch sales: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findOne(id: string, userId: string): Promise<SaleResponseDto> {
    try {
      const { data, error } = await this.supabase.from('sales').select('*').eq('id', id).single();

      if (error || !data) {
        throw new NotFoundException(`Sale with id ${id} not found`);
      }

      const user = await this.getUserWithRole(userId);
      if (!user) {
        throw new ForbiddenException('User not found or lacks required role');
      }

      const canView =
        user.role === 'ADMIN' ||
        user.role === 'FINANCEIRO' ||
        user.role === 'GESTOR' ||
        data.seller_id === userId;

      if (!canView) {
        throw new ForbiddenException('You do not have permission to view this sale');
      }

      return this.mapToResponseDto(data);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch sale: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(id: string, dto: UpdateSaleDto, userId: string): Promise<SaleResponseDto> {
    try {
      const validated = UpdateSaleSchema.parse(dto);

      const user = await this.getUserWithRole(userId);
      if (!user || !['ADMIN', 'FINANCEIRO'].includes(user.role)) {
        throw new ForbiddenException('Only ADMIN and FINANCEIRO can update sales');
      }

      const existing = await this.findOne(id, userId);
      if (!existing) {
        throw new NotFoundException(`Sale with id ${id} not found`);
      }

      const updateData: any = { ...validated };
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('sales')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException(`Failed to update sale: ${error.message}`);
      }

      return this.mapToResponseDto(data);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Error && error.name === 'ZodError') {
        const zodIssues = (error as any).issues ?? (error as any).errors ?? [];
        const fieldErrors = zodIssues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException(`Validation failed: ${fieldErrors.join('; ')}`);
      }
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    try {
      const user = await this.getUserWithRole(userId);
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN can delete sales');
      }

      const existing = await this.findOne(id, userId);
      if (!existing) {
        throw new NotFoundException(`Sale with id ${id} not found`);
      }

      const { error } = await this.supabase.from('sales').delete().eq('id', id);

      if (error) {
        throw new InternalServerErrorException(`Failed to delete sale: ${error.message}`);
      }

      return { message: 'Sale deleted successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete sale: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getUserWithRole(userId: string): Promise<{ id: string; role: string } | null> {
    const { data } = await this.supabase.from('users').select('id, role').eq('id', userId).single();

    return data;
  }

  private async getCustomerById(customerId: string): Promise<any> {
    const { data } = await this.supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .single();

    return data;
  }

  private async getGatewayById(gatewayId: string): Promise<any> {
    const { data } = await this.supabase
      .from('financial_gateways')
      .select('id')
      .eq('id', gatewayId)
      .single();

    return data;
  }

  private mapToResponseDto(data: any): SaleResponseDto {
    return {
      id: data.id,
      customer_id: data.customer_id,
      seller_id: data.seller_id,
      gross_amount: data.gross_amount,
      net_amount: data.net_amount,
      tax_amount: data.tax_amount,
      discount_amount: data.discount_amount,
      payment_method: data.payment_method,
      financial_gateway_id: data.financial_gateway_id,
      installment_count: data.installment_count,
      is_recurring: data.is_recurring,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}
