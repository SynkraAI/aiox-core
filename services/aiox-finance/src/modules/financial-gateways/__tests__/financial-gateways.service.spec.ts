import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FinancialGatewaysService } from '../financial-gateways.service';

describe('FinancialGatewaysService', () => {
  let service: FinancialGatewaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialGatewaysService],
    }).compile();

    service = module.get<FinancialGatewaysService>(FinancialGatewaysService);
  });

  describe('create', () => {
    it('should create a gateway with valid data', async () => {
      const dto = { name: 'Stripe', active: true };
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'gateway-id',
                  name: 'Stripe',
                  active: true,
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await service.create(dto, userId);
      expect(result.name).toBe('Stripe');
    });

    it('should throw ForbiddenException if user is not ADMIN', async () => {
      const dto = { name: 'Stripe', active: true };
      const userId = 'non-admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'VENDEDOR' });

      await expect(service.create(dto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException for duplicate name', async () => {
      const dto = { name: 'Stripe', active: true };
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'unique constraint violation', code: '23505' },
              }),
            }),
          }),
        }),
      };

      await expect(service.create(dto, userId)).rejects.toThrow(ConflictException);
    });

    it('should reject invalid name length', async () => {
      const dto = { name: 'X', active: true };
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });

      await expect(service.create(dto, userId)).rejects.toThrow();
    });

    it('should reject missing name', async () => {
      const dto = { name: '', active: true } as any;
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });

      await expect(service.create(dto, userId)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all gateways', async () => {
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: '1',
                  name: 'Stripe',
                  active: true,
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                {
                  id: '2',
                  name: 'Mercado Pago',
                  active: true,
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
              ],
              error: null,
              count: 2,
            }),
          }),
        }),
      };

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('findActive', () => {
    it('should return only active gateways', async () => {
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: '1',
                    name: 'Stripe',
                    active: true,
                    created_at: '2026-05-13T00:00:00Z',
                    updated_at: '2026-05-13T00:00:00Z',
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await service.findActive();
      expect(result).toHaveLength(1);
      expect(result[0].active).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return gateway if found', async () => {
      const id = 'gateway-id';

      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id,
                  name: 'Stripe',
                  active: true,
                  created_at: '2026-05-13T00:00:00Z',
                  updated_at: '2026-05-13T00:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await service.findById(id);
      expect(result.id).toBe(id);
      expect(result.name).toBe('Stripe');
    });

    it('should throw NotFoundException if not found', async () => {
      const id = 'non-existent-id';

      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'not found' },
              }),
            }),
          }),
        }),
      };

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update gateway with valid data', async () => {
      const id = 'gateway-id';
      const dto = { name: 'Stripe Updated', active: false };
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });
      jest.spyOn(service as any, 'findById').mockResolvedValue({
        id,
        name: 'Stripe',
        active: true,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id,
                    name: 'Stripe Updated',
                    active: false,
                    created_at: '2026-05-13T00:00:00Z',
                    updated_at: '2026-05-13T00:00:00Z',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      const result = await service.update(id, dto, userId);
      expect(result.name).toBe('Stripe Updated');
      expect(result.active).toBe(false);
    });

    it('should throw ForbiddenException if user is not ADMIN', async () => {
      const id = 'gateway-id';
      const dto = { name: 'Updated' };
      const userId = 'non-admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'VENDEDOR' });

      await expect(service.update(id, dto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete gateway if no references exist', async () => {
      const id = 'gateway-id';
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });
      jest.spyOn(service as any, 'findById').mockResolvedValue({
        id,
        name: 'Stripe',
        active: true,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });
      // Service calls supabase.from('sales').select().eq() then supabase.from('financial_gateways').delete().eq()
      (service as any).supabase = {
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'sales') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
              }),
            };
          }
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }),
      };

      const result = await service.delete(id, userId);
      expect(result.message).toContain('deleted successfully');
    });

    it('should throw ConflictException if gateway is referenced in sales', async () => {
      const id = 'gateway-id';
      const userId = 'admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'ADMIN' });
      jest.spyOn(service as any, 'findById').mockResolvedValue({
        id,
        name: 'Stripe',
        active: true,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });
      (service as any).supabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [{ id: 'sale-1' }], error: null, count: 1 }),
          }),
        }),
      };

      await expect(service.delete(id, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if user is not ADMIN', async () => {
      const id = 'gateway-id';
      const userId = 'non-admin-user-id';

      jest.spyOn(service as any, 'getUserWithRole').mockResolvedValue({ role: 'VENDEDOR' });

      await expect(service.delete(id, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
