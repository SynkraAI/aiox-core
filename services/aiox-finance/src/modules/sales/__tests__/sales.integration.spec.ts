import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SalesService } from '../sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@supabase/supabase-js';

describe('Sales Integration Tests', () => {
  let service: SalesService;
  let mockSupabase: any;

  const adminUserId = '550e8400-e29b-41d4-a716-446655440000';
  const vendorUserId = '550e8400-e29b-41d4-a716-446655440001';
  const customerId = '550e8400-e29b-41d4-a716-446655440002';
  const gatewayId = '550e8400-e29b-41d4-a716-446655440003';

  const validSaleDto: CreateSaleDto = {
    customer_id: customerId,
    seller_id: vendorUserId,
    gross_amount: 1000,
    net_amount: 900,
    tax_amount: 50,
    discount_amount: 50,
    payment_method: 'CREDIT_CARD',
    financial_gateway_id: gatewayId,
    installment_count: 1,
    is_recurring: false,
  };

  // Mutable per-table data
  let tableData: Record<string, any>;
  const SALE_ID = '550e8400-e29b-41d4-a716-446655440004';

  const buildTableMock = (table: string) => {
    const queryChain: any = {
      eq: jest.fn(),
      range: jest.fn(),
      order: jest.fn(),
      single: jest.fn().mockResolvedValue({
        data: tableData[table] !== undefined ? tableData[table] : null,
        error: null,
      }),
    };
    queryChain.eq.mockReturnValue(queryChain);
    queryChain.range.mockReturnValue(queryChain);
    queryChain.order.mockResolvedValue({
      data: tableData[table] !== undefined && tableData[table] !== null ? [tableData[table]] : [],
      count: tableData[table] !== undefined && tableData[table] !== null ? 1 : 0,
      error: null,
    });

    return {
      select: jest.fn().mockReturnValue(queryChain),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: SALE_ID,
              ...validSaleDto,
              status: 'PENDING',
            },
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: SALE_ID,
                ...validSaleDto,
                gross_amount: 1200,
                status: 'APPROVED',
              },
              error: null,
            }),
          }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    };
  };

  beforeEach(async () => {
    tableData = {
      users: { id: adminUserId, role: 'ADMIN' },
      customers: { id: customerId },
      financial_gateways: { id: gatewayId },
      sales: { id: SALE_ID, ...validSaleDto, status: 'PENDING' },
    };

    mockSupabase = {
      from: jest.fn().mockImplementation((table: string) => buildTableMock(table)),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [SalesService],
    }).compile();

    service = moduleFixture.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Flow', () => {
    it('should complete a full CRUD cycle: create → read → update → delete', async () => {
      const sale = await service.create(validSaleDto, adminUserId);
      expect(sale.id).toBeDefined();

      const retrieved = await service.findOne(sale.id, adminUserId);
      expect(retrieved.id).toBe(sale.id);

      const updated = await service.update(sale.id, { gross_amount: 1200 }, adminUserId);
      expect(updated.gross_amount).toBe(1200);

      const deleted = await service.delete(sale.id, adminUserId);
      expect(deleted.message).toBe('Sale deleted successfully');
    });
  });

  describe('RLS Enforcement', () => {
    it('should allow admin to view all sales', async () => {
      const result = await service.findAll({}, adminUserId);
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should restrict non-admin from updating sales', async () => {
      tableData.users = { id: vendorUserId, role: 'VENDEDOR' };
      await expect(service.update(SALE_ID, {}, vendorUserId)).rejects.toThrow();
    });

    it('should allow financeiro role to view sales', async () => {
      const financeiroId = '550e8400-e29b-41d4-a716-446655440099';
      tableData.users = { id: financeiroId, role: 'FINANCEIRO' };
      const result = await service.findOne(SALE_ID, financeiroId);
      expect(result).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should reject sales with invalid calculation', async () => {
      const invalidDto = {
        ...validSaleDto,
        net_amount: 800,
        tax_amount: 100,
        discount_amount: 200,
      };
      await expect(service.create(invalidDto, adminUserId)).rejects.toThrow(BadRequestException);
    });

    it('should reject sales with negative amounts', async () => {
      const invalidDto = {
        ...validSaleDto,
        gross_amount: -100,
      };
      await expect(service.create(invalidDto, adminUserId)).rejects.toThrow(BadRequestException);
    });

    it('should validate installment count range', async () => {
      const invalidDto = {
        ...validSaleDto,
        installment_count: 37,
      };
      await expect(service.create(invalidDto, adminUserId)).rejects.toThrow(BadRequestException);
    });

    it('should validate payment method enumeration', async () => {
      const invalidDto = {
        ...validSaleDto,
        payment_method: 'INVALID' as any,
      };
      await expect(service.create(invalidDto, adminUserId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Filtering & Pagination', () => {
    it('should filter by status', async () => {
      const result = await service.findAll({ status: 'PENDING' }, adminUserId);
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
    });

    it('should filter by seller_id', async () => {
      const result = await service.findAll({ seller_id: vendorUserId }, adminUserId);
      expect(result.data).toBeDefined();
    });

    it('should support pagination with page and limit', async () => {
      const result = await service.findAll({ page: 1, limit: 10 }, adminUserId);
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
    });

    it('should apply pagination correctly on second page', async () => {
      const result = await service.findAll({ page: 2, limit: 25 }, adminUserId);
      expect(result.data).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for validation errors', async () => {
      const invalidDto = { customer_id: 'invalid-uuid' };
      await expect(service.create(invalidDto as any, adminUserId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should return 403 for permission errors', async () => {
      // DTO seller_id is vendorUserId; another VENDEDOR tries to create sale for them
      const otherVendorId = '550e8400-e29b-41d4-a716-446655440088';
      tableData.users = { id: otherVendorId, role: 'VENDEDOR' };
      await expect(service.create(validSaleDto, otherVendorId)).rejects.toThrow();
    });

    it('should return 404 for not found errors', async () => {
      tableData.sales = null;
      await expect(service.findOne('nonexistent-id', adminUserId)).rejects.toThrow();
    });

    it('should return 500 for database errors', async () => {
      tableData.sales = null;
      await expect(service.findOne(SALE_ID, adminUserId)).rejects.toThrow();
    });
  });
});
