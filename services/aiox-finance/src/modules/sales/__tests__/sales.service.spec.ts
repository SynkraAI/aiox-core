import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SalesService } from '../sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';

describe('SalesService', () => {
  let service: SalesService;
  let mockSupabase: any;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    role: 'ADMIN',
  };

  const mockSeller = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    role: 'VENDEDOR',
  };

  const mockCustomer = {
    id: '550e8400-e29b-41d4-a716-446655440002',
  };

  const mockGateway = {
    id: '550e8400-e29b-41d4-a716-446655440003',
  };

  const validCreateSaleDto: CreateSaleDto = {
    customer_id: mockCustomer.id,
    seller_id: mockSeller.id,
    gross_amount: 1000,
    net_amount: 900,
    tax_amount: 50,
    discount_amount: 50,
    payment_method: 'CREDIT_CARD',
    financial_gateway_id: mockGateway.id,
    installment_count: 3,
    is_recurring: false,
  };

  const mockSale = {
    id: '550e8400-e29b-41d4-a716-446655440004',
    ...validCreateSaleDto,
    status: 'PENDING',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Map of table -> data row to be returned by select().eq().single()
  let tableData: Record<string, any> = {};

  const buildTableMock = (table: string) => {
    // Filterable query chain (used by findAll: select().eq().range().order())
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
          single: jest.fn().mockResolvedValue({ data: mockSale, error: null }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockSale, error: null }),
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
      users: mockUser,
      customers: mockCustomer,
      financial_gateways: mockGateway,
      sales: mockSale,
    };

    mockSupabase = {
      from: jest.fn().mockImplementation((table: string) => buildTableMock(table)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesService],
    }).compile();

    service = module.get<SalesService>(SalesService);
    // Override the internal supabase client created in the constructor
    (service as any).supabase = mockSupabase;
  });

  describe('create', () => {
    it('should create a valid sale successfully', async () => {
      const result = await service.create(validCreateSaleDto, mockUser.id);
      expect(result).toEqual(expect.objectContaining(validCreateSaleDto));
      expect(result.status).toBe('PENDING');
    });

    it('should throw BadRequestException when net_amount exceeds gross_amount', async () => {
      const invalidDto = {
        ...validCreateSaleDto,
        net_amount: 1100,
        gross_amount: 1000,
      };
      await expect(service.create(invalidDto, mockUser.id)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when net_amount calculation is invalid', async () => {
      // gross - tax - discount = 1000 - 50 - 50 = 900, but net_amount provided is 850 (mismatch)
      const invalidDto = {
        ...validCreateSaleDto,
        net_amount: 850,
        gross_amount: 1000,
        tax_amount: 50,
        discount_amount: 50,
      };
      await expect(service.create(invalidDto, mockUser.id)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const incompleteDto = { ...validCreateSaleDto, customer_id: undefined };
      await expect(service.create(incompleteDto as any, mockUser.id)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when customer does not exist', async () => {
      tableData.customers = null;
      await expect(service.create(validCreateSaleDto, mockUser.id)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when financial gateway does not exist', async () => {
      tableData.financial_gateways = null;
      await expect(service.create(validCreateSaleDto, mockUser.id)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw ForbiddenException when non-admin tries to create sale for another seller', async () => {
      // DTO seller_id is mockSeller.id; another VENDEDOR user tries to create sale for them
      const otherSellerId = '550e8400-e29b-41d4-a716-446655440099';
      tableData.users = { id: otherSellerId, role: 'VENDEDOR' };
      await expect(service.create(validCreateSaleDto, otherSellerId)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException for invalid payment method', async () => {
      const invalidDto = {
        ...validCreateSaleDto,
        payment_method: 'INVALID' as any,
      };
      await expect(service.create(invalidDto, mockUser.id)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid installment count', async () => {
      const invalidDto = {
        ...validCreateSaleDto,
        installment_count: 37,
      };
      await expect(service.create(invalidDto, mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all sales with pagination', async () => {
      const result = await service.findAll({ page: 1, limit: 50 }, mockUser.id);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      const result = await service.findAll({ status: 'PENDING', page: 1, limit: 50 }, mockUser.id);
      expect(result.data).toBeDefined();
    });

    it('should filter by seller_id', async () => {
      const result = await service.findAll(
        { seller_id: mockSeller.id, page: 1, limit: 50 },
        mockUser.id
      );
      expect(result.data).toBeDefined();
    });

    it('should handle pagination correctly', async () => {
      const result = await service.findAll({ page: 2, limit: 25 }, mockUser.id);
      expect(result.total).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a single sale when it exists', async () => {
      const result = await service.findOne(mockSale.id, mockUser.id);
      expect(result.id).toBe(mockSale.id);
    });

    it('should throw NotFoundException when sale does not exist', async () => {
      tableData.sales = null;
      await expect(service.findOne('nonexistent-id', mockUser.id)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should allow admin to view any sale', async () => {
      const result = await service.findOne(mockSale.id, mockUser.id);
      expect(result).toBeDefined();
    });

    it('should allow seller to view own sale', async () => {
      // The sale's seller_id is mockSeller.id, and the user IS the seller
      tableData.users = { ...mockSeller, role: 'VENDEDOR' };
      const result = await service.findOne(mockSale.id, mockSeller.id);
      expect(result.id).toBe(mockSale.id);
    });

    it('should throw ForbiddenException when non-owner tries to view sale', async () => {
      const otherUserId = '550e8400-e29b-41d4-a716-446655440099';
      tableData.users = { id: otherUserId, role: 'VENDEDOR' };
      await expect(service.findOne(mockSale.id, otherUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a sale with valid data', async () => {
      const updateDto: UpdateSaleDto = { gross_amount: 1200, net_amount: 1100 };
      const result = await service.update(mockSale.id, updateDto, mockUser.id);
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when non-admin tries to update', async () => {
      const updateDto: UpdateSaleDto = { gross_amount: 1200 };
      tableData.users = { ...mockSeller, role: 'VENDEDOR' };
      await expect(service.update(mockSale.id, updateDto, mockSeller.id)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException when updating non-existent sale', async () => {
      tableData.sales = null;
      await expect(service.update('nonexistent-id', {}, mockUser.id)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete', () => {
    it('should delete a sale successfully', async () => {
      const result = await service.delete(mockSale.id, mockUser.id);
      expect(result.message).toBe('Sale deleted successfully');
    });

    it('should throw ForbiddenException when non-admin tries to delete', async () => {
      tableData.users = { ...mockSeller, role: 'VENDEDOR' };
      await expect(service.delete(mockSale.id, mockSeller.id)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when deleting non-existent sale', async () => {
      tableData.sales = null;
      await expect(service.delete('nonexistent-id', mockUser.id)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
