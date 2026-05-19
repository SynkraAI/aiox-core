import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateGatewayDto, CreateGatewaySchema } from './dto/create-gateway.dto';
import { UpdateGatewayDto, UpdateGatewaySchema } from './dto/update-gateway.dto';
import { GatewayResponseDto } from './dto/gateway-response.dto';

@Injectable()
export class FinancialGatewaysService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async create(dto: CreateGatewayDto, userId: string): Promise<GatewayResponseDto> {
    try {
      const validated = CreateGatewaySchema.parse(dto);

      const user = await this.getUserWithRole(userId);
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN can create gateways');
      }

      const { data, error } = await this.supabase
        .from('financial_gateways')
        .insert({
          name: validated.name,
          active: validated.active ?? true,
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('unique') || error.code === '23505') {
          throw new ConflictException(`Gateway name '${validated.name}' already exists`);
        }
        throw new InternalServerErrorException(`Failed to create gateway: ${error.message}`);
      }

      return this.mapToResponseDto(data);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create gateway: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(): Promise<{ data: GatewayResponseDto[]; total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('financial_gateways')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true });

      if (error) {
        throw new InternalServerErrorException(`Failed to fetch gateways: ${error.message}`);
      }

      return {
        data: (data || []).map((g) => this.mapToResponseDto(g)),
        total: count || 0,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch gateways: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findActive(): Promise<GatewayResponseDto[]> {
    try {
      const { data, error } = await this.supabase
        .from('financial_gateways')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        throw new InternalServerErrorException(`Failed to fetch active gateways: ${error.message}`);
      }

      return (data || []).map((g) => this.mapToResponseDto(g));
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch active gateways: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<GatewayResponseDto> {
    try {
      const { data, error } = await this.supabase
        .from('financial_gateways')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Gateway with ID '${id}' not found`);
      }

      return this.mapToResponseDto(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch gateway: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(id: string, dto: UpdateGatewayDto, userId: string): Promise<GatewayResponseDto> {
    try {
      const validated = UpdateGatewaySchema.parse(dto);

      const user = await this.getUserWithRole(userId);
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN can update gateways');
      }

      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundException(`Gateway with ID '${id}' not found`);
      }

      const updateData: Record<string, unknown> = {};
      if (validated.name !== undefined) {
        updateData.name = validated.name;
      }
      if (validated.active !== undefined) {
        updateData.active = validated.active;
      }
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('financial_gateways')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.message.includes('unique') || error.code === '23505') {
          throw new ConflictException(`Gateway name '${validated.name}' already exists`);
        }
        throw new InternalServerErrorException(`Failed to update gateway: ${error.message}`);
      }

      return this.mapToResponseDto(data);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update gateway: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    try {
      const user = await this.getUserWithRole(userId);
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN can delete gateways');
      }

      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundException(`Gateway with ID '${id}' not found`);
      }

      const { count, error: countError } = await this.supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('financial_gateway_id', id);

      if (countError) {
        throw new InternalServerErrorException(`Failed to check references: ${countError.message}`);
      }

      if (count && count > 0) {
        throw new ConflictException(
          `Cannot delete gateway with ${count} active sales. Please update or delete sales first.`
        );
      }

      const { error } = await this.supabase.from('financial_gateways').delete().eq('id', id);

      if (error) {
        throw new InternalServerErrorException(`Failed to delete gateway: ${error.message}`);
      }

      return { message: 'Gateway deleted successfully' };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete gateway: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getUserWithRole(userId: string): Promise<{ role: string } | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return { role: data.role };
    } catch {
      return null;
    }
  }

  private mapToResponseDto(data: Record<string, unknown>): GatewayResponseDto {
    return {
      id: String(data.id),
      name: String(data.name),
      active: Boolean(data.active),
      created_at: String(data.created_at),
      updated_at: String(data.updated_at),
    };
  }
}
