import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCreationService } from '../commission-creation.service';
import { CommissionCalculatorService } from '../commission-calculator.service';
import { AuditLoggerService } from '@/common/services';
import { Decimal } from 'decimal.js';

describe('CommissionCreation - Integration Tests', () => {
  let service: CommissionCreationService;
  let calculator: CommissionCalculatorService;
  let auditLogger: AuditLoggerService;

  const mockSale = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    net_amount: 1000,
    seller_id: '660e8400-e29b-41d4-a716-446655440001',
    status: 'APPROVED',
  };

  const mockSeller = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    commission_percentage: 10,
  };

  const mockCommission = {
    id: '770e8400-e29b-41d4-a716-446655440002',
    sale_id: mockSale.id,
    seller_id: mockSeller.id,
    amount: 100,
    percentage: 10,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionCreationService,
        CommissionCalculatorService,
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
    calculator = module.get<CommissionCalculatorService>(CommissionCalculatorService);
    auditLogger = module.get<AuditLoggerService>(AuditLoggerService);

    // Default: no existing commission found (sale is fresh)
    jest.spyOn(service as any, 'findCommissionBySaleId').mockResolvedValue(null);

    // Default: supabase insert returns a commission echoing the input
    (service as any).supabase = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockImplementation((payload: Record<string, unknown>) => ({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '770e8400-e29b-41d4-a716-446655440002',
                ...payload,
              },
              error: null,
            }),
          }),
        })),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    };
  });

  describe('End-to-End: Sale to Commission Creation', () => {
    it('should create commission when sale is approved', async () => {
      const result = await service.createCommissionFromSale(mockSale, mockSeller);

      expect(result).toBeDefined();
      expect(result.sale_id).toBe(mockSale.id);
      expect(result.seller_id).toBe(mockSeller.id);
      expect(result.status).toBe('PENDING');
    });

    it('should reject commission creation for non-approved sales', async () => {
      const pendingSale = { ...mockSale, status: 'PENDING' };

      await expect(service.createCommissionFromSale(pendingSale, mockSeller)).rejects.toThrow(
        "Cannot create commission for sale with status 'PENDING'"
      );
    });

    it('should reject commission creation when seller has no commission percentage', async () => {
      const sellerWithoutPercentage = {
        ...mockSeller,
        commission_percentage: null as unknown as number,
      };

      await expect(
        service.createCommissionFromSale(mockSale, sellerWithoutPercentage)
      ).rejects.toThrow('does not have a commission percentage set');
    });
  });

  describe('Audit Trail Validation', () => {
    it('should log commission creation to audit trail', async () => {
      await service.createCommissionFromSale(mockSale, mockSeller);

      expect(auditLogger.logCommissionCreation).toHaveBeenCalledWith(
        'system',
        expect.any(String),
        mockSale.id,
        mockSeller.id,
        100,
        10
      );
    });

    it('should include all required audit fields', async () => {
      await service.createCommissionFromSale(mockSale, mockSeller);

      const logCall = (auditLogger.logCommissionCreation as jest.Mock).mock.calls[0];
      expect(logCall).toHaveLength(6); // userId, commissionId, saleId, sellerId, amount, percentage
    });
  });

  describe('Idempotency & Duplicate Prevention', () => {
    it('should reject duplicate commission for same sale', async () => {
      // Simulate service behavior: first call succeeds, second call fails
      let callCount = 0;

      jest.spyOn(service as any, 'findCommissionBySaleId').mockImplementation(async () => {
        callCount++;
        return callCount > 1 ? mockCommission : null;
      });

      // First call should succeed
      await service.createCommissionFromSale(mockSale, mockSeller);

      // Second call should fail with duplicate error
      await expect(service.createCommissionFromSale(mockSale, mockSeller)).rejects.toThrow(
        `Commission already exists for sale '${mockSale.id}'`
      );
    });

    it('should maintain one commission per sale constraint', async () => {
      const sales = [
        { ...mockSale, id: 'sale-1' },
        { ...mockSale, id: 'sale-2' },
        { ...mockSale, id: 'sale-3' },
      ];

      // Track created sale IDs; second attempt on same sale returns existing commission
      const createdSaleIds = new Set<string>();
      jest
        .spyOn(service as any, 'findCommissionBySaleId')
        .mockImplementation(async (...args: unknown[]) => {
          const saleId = args[0] as string;
          if (createdSaleIds.has(saleId)) {
            return { ...mockCommission, sale_id: saleId };
          }
          createdSaleIds.add(saleId);
          return null;
        });

      for (const sale of sales) {
        await service.createCommissionFromSale(sale, mockSeller);
      }

      // Attempting duplicate should fail
      await expect(service.createCommissionFromSale(sales[0], mockSeller)).rejects.toThrow(
        'Commission already exists'
      );
    });
  });

  describe('Calculation Accuracy', () => {
    it('should match calculator output for commission amount', async () => {
      const result = await service.createCommissionFromSale(mockSale, mockSeller);
      const expected = calculator.calculateCommission(
        mockSale.net_amount,
        mockSeller.commission_percentage
      );

      expect(result.amount).toBe(expected.toNumber());
    });

    it('should handle decimal calculations correctly', async () => {
      const decimalSale = {
        ...mockSale,
        net_amount: 1234.56,
      };
      const decimalSeller = {
        ...mockSeller,
        commission_percentage: 5.5,
      };

      const result = await service.createCommissionFromSale(decimalSale, decimalSeller);
      // 1234.56 * 5.5 / 100 = 67.9008 → 67.90
      expect(result.amount).toBe(67.9);
    });

    it('should enforce DECIMAL(15,2) precision', async () => {
      const result = await service.createCommissionFromSale(mockSale, mockSeller);

      // Amount should have at most 2 decimal places
      const decimalPlaces = (result.amount.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe('Bulk Creation', () => {
    it('should handle multiple approved sales', async () => {
      const saleIds = ['sale-1', 'sale-2', 'sale-3'];

      jest.spyOn(service as any, 'getSaleById').mockImplementation(async (id) => ({
        ...mockSale,
        id,
      }));

      jest.spyOn(service as any, 'getSellerById').mockResolvedValue(mockSeller);

      const results = await service.bulkCreateForApprovedSales(saleIds);

      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle partial failures gracefully', async () => {
      const saleIds = ['sale-1', 'sale-2', 'invalid-sale'];

      jest.spyOn(service as any, 'getSaleById').mockImplementation(async (id) => {
        return id === 'invalid-sale' ? null : { ...mockSale, id };
      });

      jest.spyOn(service as any, 'getSellerById').mockResolvedValue(mockSeller);

      const results = await service.bulkCreateForApprovedSales(saleIds);

      // Should create commissions for valid sales, skip invalid ones
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing sale data', async () => {
      const incompleteSale = { id: 'sale-1', seller_id: 'seller-1' } as any;

      await expect(service.createCommissionFromSale(incompleteSale, mockSeller)).rejects.toThrow();
    });

    it('should handle Supabase errors gracefully', async () => {
      const mockSupabaseError = new Error('Supabase connection failed');

      jest.spyOn(service as any, 'findCommissionBySaleId').mockRejectedValue(mockSupabaseError);

      await expect(service.createCommissionFromSale(mockSale, mockSeller)).rejects.toThrow();
    });
  });
});
