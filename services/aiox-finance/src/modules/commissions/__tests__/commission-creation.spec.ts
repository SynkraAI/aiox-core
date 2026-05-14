import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CommissionCreationService } from '../commission-creation.service';
import { CommissionCalculatorService } from '../commission-calculator.service';
import { AuditLoggerService } from '@/common/services';

interface MockSale {
  id: string;
  net_amount: number;
  seller_id: string;
  status: string;
}

interface MockSeller {
  id: string;
  commission_percentage: number;
}

interface MockCommission {
  id: string;
  sale_id: string;
  seller_id: string;
  amount: number;
  percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

describe('CommissionCreationService', () => {
  let service: CommissionCreationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionCalculatorService,
        CommissionCreationService,
        {
          provide: AuditLoggerService,
          useValue: {
            logCommissionCreation: jest.fn().mockResolvedValue(undefined),
            logAction: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<CommissionCreationService>(CommissionCreationService);
  });

  describe('createCommissionFromSale', () => {
    it('should create commission for approved sale with valid seller', async () => {
      const sale: MockSale = {
        id: 'sale-1',
        net_amount: 1000,
        seller_id: 'seller-1',
        status: 'APPROVED',
      };
      const seller: MockSeller = {
        id: 'seller-1',
        commission_percentage: 10,
      };

      jest.spyOn(service as any, 'findCommissionBySaleId').mockResolvedValue(null);
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'commission-1',
                  sale_id: 'sale-1',
                  seller_id: 'seller-1',
                  amount: 100,
                  percentage: 10,
                  status: 'PENDING',
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await service.createCommissionFromSale(sale, seller);
      expect(result.amount).toBe(100);
      expect(result.status).toBe('PENDING');
    });

    it('should throw error for non-approved sale', async () => {
      const sale: MockSale = {
        id: 'sale-1',
        net_amount: 1000,
        seller_id: 'seller-1',
        status: 'PENDING',
      };
      const seller: MockSeller = {
        id: 'seller-1',
        commission_percentage: 10,
      };

      await expect(service.createCommissionFromSale(sale, seller)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if seller has no commission percentage', async () => {
      const sale: MockSale = {
        id: 'sale-1',
        net_amount: 1000,
        seller_id: 'seller-1',
        status: 'APPROVED',
      };
      const seller = {
        id: 'seller-1',
        commission_percentage: null as unknown as number,
      };

      await expect(service.createCommissionFromSale(sale, seller)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw ConflictException if commission already exists', async () => {
      const sale: MockSale = {
        id: 'sale-1',
        net_amount: 1000,
        seller_id: 'seller-1',
        status: 'APPROVED',
      };
      const seller: MockSeller = {
        id: 'seller-1',
        commission_percentage: 10,
      };

      jest.spyOn(service as any, 'findCommissionBySaleId').mockResolvedValue({
        id: 'existing-commission',
        sale_id: 'sale-1',
        seller_id: 'seller-1',
        amount: 100,
        percentage: 10,
        status: 'PENDING',
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });

      await expect(service.createCommissionFromSale(sale, seller)).rejects.toThrow(
        ConflictException
      );
    });

    it('should calculate commission amount correctly', async () => {
      const sale: MockSale = {
        id: 'sale-2',
        net_amount: 5555.55,
        seller_id: 'seller-2',
        status: 'APPROVED',
      };
      const seller: MockSeller = {
        id: 'seller-2',
        commission_percentage: 8.5,
      };

      jest.spyOn(service as any, 'findCommissionBySaleId').mockResolvedValue(null);
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'commission-2',
                  sale_id: 'sale-2',
                  seller_id: 'seller-2',
                  amount: 472.22,
                  percentage: 8.5,
                  status: 'PENDING',
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await service.createCommissionFromSale(sale, seller);
      expect(result.amount).toBeCloseTo(472.22, 2);
    });

    it('should log audit entry when creating commission', async () => {
      const sale: MockSale = {
        id: 'sale-3',
        net_amount: 1000,
        seller_id: 'seller-1',
        status: 'APPROVED',
      };
      const seller: MockSeller = {
        id: 'seller-1',
        commission_percentage: 10,
      };

      jest.spyOn(service as any, 'findCommissionBySaleId').mockResolvedValue(null);
      const auditLogger = (service as any).auditLogger as {
        logCommissionCreation: jest.Mock;
      };
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'commission-3',
                  sale_id: 'sale-3',
                  seller_id: 'seller-1',
                  amount: 100,
                  percentage: 10,
                  status: 'PENDING',
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      await service.createCommissionFromSale(sale, seller);
      expect(auditLogger.logCommissionCreation).toHaveBeenCalled();
    });

    it('should handle commission for zero percentage seller', async () => {
      const sale: MockSale = {
        id: 'sale-4',
        net_amount: 1000,
        seller_id: 'seller-zero',
        status: 'APPROVED',
      };
      const seller: MockSeller = {
        id: 'seller-zero',
        commission_percentage: 0,
      };

      jest.spyOn(service as any, 'findCommissionBySaleId').mockResolvedValue(null);
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'commission-4',
                  sale_id: 'sale-4',
                  seller_id: 'seller-zero',
                  amount: 0,
                  percentage: 0,
                  status: 'PENDING',
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await service.createCommissionFromSale(sale, seller);
      expect(result.amount).toBe(0);
    });
  });

  describe('bulkCreateForApprovedSales', () => {
    it('should create commissions for multiple approved sales', async () => {
      jest.spyOn(service as any, 'getSaleById').mockImplementation((...args: unknown[]) => {
        const id = args[0] as string;
        const sales: Record<string, MockSale> = {
          'sale-1': { id: 'sale-1', net_amount: 1000, seller_id: 'seller-1', status: 'APPROVED' },
          'sale-2': { id: 'sale-2', net_amount: 2000, seller_id: 'seller-1', status: 'APPROVED' },
        };
        return Promise.resolve(sales[id] || null);
      });

      jest.spyOn(service as any, 'getSellerById').mockResolvedValue({
        id: 'seller-1',
        commission_percentage: 10,
      });

      jest
        .spyOn(service, 'createCommissionFromSale')
        .mockImplementation(async (sale, seller): Promise<MockCommission> => {
          return {
            id: `commission-${sale.id}`,
            sale_id: sale.id,
            seller_id: seller.id,
            amount: (sale.net_amount * seller.commission_percentage) / 100,
            percentage: seller.commission_percentage,
            status: 'PENDING',
            created_at: '2026-05-13T00:00:00Z',
            updated_at: '2026-05-13T00:00:00Z',
          };
        });

      const result = await service.bulkCreateForApprovedSales(['sale-1', 'sale-2']);
      expect(result).toHaveLength(2);
      expect(result[0].sale_id).toBe('sale-1');
      expect(result[1].sale_id).toBe('sale-2');
    });

    it('should handle partial failures gracefully', async () => {
      jest.spyOn(service as any, 'getSaleById').mockImplementation((...args: unknown[]) => {
        const id = args[0] as string;
        if (id === 'sale-1') {
          return Promise.resolve({
            id: 'sale-1',
            net_amount: 1000,
            seller_id: 'seller-1',
            status: 'APPROVED',
          });
        }
        return Promise.resolve(null);
      });

      jest.spyOn(service as any, 'getSellerById').mockResolvedValue({
        id: 'seller-1',
        commission_percentage: 10,
      });

      jest.spyOn(service, 'createCommissionFromSale').mockResolvedValue({
        id: 'commission-1',
        sale_id: 'sale-1',
        seller_id: 'seller-1',
        amount: 100,
        percentage: 10,
        status: 'PENDING',
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });

      const result = await service.bulkCreateForApprovedSales(['sale-1', 'sale-invalid']);
      expect(result).toHaveLength(1);
      expect(result[0].sale_id).toBe('sale-1');
    });
  });
});
