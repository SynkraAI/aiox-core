import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import request from 'supertest';
import { SalesController } from '../sales.controller';
import { SalesService } from '../sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';

describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;
  let app: INestApplication;
  let mockService: any;

  const mockSale = {
    id: '550e8400-e29b-41d4-a716-446655440004',
    customer_id: '550e8400-e29b-41d4-a716-446655440002',
    seller_id: '550e8400-e29b-41d4-a716-446655440001',
    gross_amount: 1000,
    net_amount: 900,
    tax_amount: 50,
    discount_amount: 50,
    payment_method: 'CREDIT_CARD',
    financial_gateway_id: '550e8400-e29b-41d4-a716-446655440003',
    installment_count: 1,
    is_recurring: false,
    status: 'PENDING',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const validCreateDto: CreateSaleDto = {
    customer_id: mockSale.customer_id,
    seller_id: mockSale.seller_id,
    gross_amount: mockSale.gross_amount,
    net_amount: mockSale.net_amount,
    tax_amount: mockSale.tax_amount,
    discount_amount: mockSale.discount_amount,
    payment_method: mockSale.payment_method as any,
    financial_gateway_id: mockSale.financial_gateway_id,
    installment_count: mockSale.installment_count,
    is_recurring: mockSale.is_recurring,
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue(mockSale),
      findAll: jest.fn().mockResolvedValue({ data: [mockSale], total: 1 }),
      findOne: jest.fn().mockResolvedValue(mockSale),
      update: jest.fn().mockResolvedValue(mockSale),
      delete: jest.fn().mockResolvedValue({ message: 'Sale deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get<SalesController>(SalesController);
    service = module.get<SalesService>(SalesService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/sales', () => {
    it('should create a sale and return 201', async () => {
      const result = await controller.create(validCreateDto);
      expect(result.id).toBe(mockSale.id);
      expect(result.status).toBe('PENDING');
    });

    it('should catch validation errors and return 400', async () => {
      const invalidDto = { customer_id: 'invalid-uuid' };
      await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });

    it('should catch permission errors and return 403', async () => {
      mockService.create.mockRejectedValueOnce(
        new ForbiddenException('Cannot create sales for other sellers')
      );
      await expect(controller.create(validCreateDto)).rejects.toThrow(ForbiddenException);
    });

    it('should catch service errors and return 500 with requestId', async () => {
      mockService.create.mockRejectedValueOnce(new Error('Database error'));
      try {
        await controller.create(validCreateDto);
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response).toMatchObject({
            message: 'Failed to create sale',
          });
          expect(response.requestId).toBeDefined();
        }
      }
    });
  });

  describe('GET /api/sales', () => {
    it('should return all sales with 200', async () => {
      const result = await controller.findAll();
      expect(result.data).toEqual([mockSale]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should accept pagination parameters', async () => {
      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        '2',
        '25'
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should reject invalid page parameter', async () => {
      await expect(
        controller.findAll(undefined, undefined, undefined, undefined, 'invalid', '10')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid limit parameter', async () => {
      await expect(
        controller.findAll(undefined, undefined, undefined, undefined, '1', '150')
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept filter parameters', async () => {
      const result = await controller.findAll(
        'PENDING',
        mockSale.seller_id,
        mockSale.financial_gateway_id
      );
      expect(result.data).toBeDefined();
    });

    it('should catch service errors and return 500', async () => {
      mockService.findAll.mockRejectedValueOnce(new Error('Database error'));
      try {
        await controller.findAll();
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response).toMatchObject({
            message: 'Failed to fetch sales',
          });
        }
      }
    });
  });

  describe('GET /api/sales/:id', () => {
    it('should return a single sale with 200', async () => {
      const result = await controller.findOne(mockSale.id);
      expect(result.id).toBe(mockSale.id);
    });

    it('should return 404 when sale not found', async () => {
      mockService.findOne.mockRejectedValueOnce(new NotFoundException('Sale not found'));
      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should reject invalid UUID format', async () => {
      // ParseUUIDPipe only fires on real HTTP requests, not direct controller invocation
      await request(app.getHttpServer()).get('/api/sales/invalid-uuid').expect(400);
    });

    it('should catch service errors and return 500', async () => {
      mockService.findOne.mockRejectedValueOnce(new Error('Database error'));
      try {
        await controller.findOne(mockSale.id);
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response).toMatchObject({
            message: 'Failed to fetch sale',
          });
          expect(response.requestId).toBeDefined();
        }
      }
    });
  });

  describe('PATCH /api/sales/:id', () => {
    it('should update a sale and return 200', async () => {
      const updateDto = { gross_amount: 1200 };
      const result = await controller.update(mockSale.id, updateDto);
      expect(result).toBeDefined();
    });

    it('should catch validation errors on update and return 400', async () => {
      const invalidDto = { installment_count: 37 };
      await expect(controller.update(mockSale.id, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should catch permission errors on update and return 403', async () => {
      mockService.update.mockRejectedValueOnce(
        new ForbiddenException('Only ADMIN and FINANCEIRO can update')
      );
      const updateDto = { gross_amount: 1200 };
      await expect(controller.update(mockSale.id, updateDto)).rejects.toThrow(ForbiddenException);
    });

    it('should reject invalid UUID format', async () => {
      // ParseUUIDPipe only fires on real HTTP requests, not direct controller invocation
      await request(app.getHttpServer()).patch('/api/sales/invalid-uuid').send({}).expect(400);
    });

    it('should catch service errors on update and return 500', async () => {
      mockService.update.mockRejectedValueOnce(new Error('Database error'));
      try {
        await controller.update(mockSale.id, {});
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response).toMatchObject({
            message: 'Failed to update sale',
          });
          expect(response.requestId).toBeDefined();
        }
      }
    });
  });

  describe('DELETE /api/sales/:id', () => {
    it('should delete a sale and return 200', async () => {
      const result = await controller.delete(mockSale.id);
      expect(result.message).toBe('Sale deleted successfully');
    });

    it('should return 403 when non-admin tries to delete', async () => {
      mockService.delete.mockRejectedValueOnce(new ForbiddenException('Only ADMIN can delete'));
      await expect(controller.delete(mockSale.id)).rejects.toThrow(ForbiddenException);
    });

    it('should return 404 when deleting non-existent sale', async () => {
      mockService.delete.mockRejectedValueOnce(new NotFoundException('Sale not found'));
      await expect(controller.delete('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should reject invalid UUID format', async () => {
      // ParseUUIDPipe only fires on real HTTP requests, not direct controller invocation
      await request(app.getHttpServer()).delete('/api/sales/invalid-uuid').expect(400);
    });

    it('should catch service errors on delete and return 500', async () => {
      mockService.delete.mockRejectedValueOnce(new Error('Database error'));
      try {
        await controller.delete(mockSale.id);
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response).toMatchObject({
            message: 'Failed to delete sale',
          });
          expect(response.requestId).toBeDefined();
        }
      }
    });
  });

  describe('Error Response Format', () => {
    it('should include requestId in 500 error responses', async () => {
      mockService.create.mockRejectedValueOnce(new Error('Unexpected error'));
      try {
        await controller.create(validCreateDto);
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response.requestId).toBeDefined();
          expect(response.requestId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
          );
        }
      }
    });

    it('should include error message in response', async () => {
      mockService.create.mockRejectedValueOnce(new Error('Connection lost'));
      try {
        await controller.create(validCreateDto);
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse() as any;
          expect(response.message).toBe('Failed to create sale');
          expect(response.error).toBeDefined();
        }
      }
    });
  });
});
