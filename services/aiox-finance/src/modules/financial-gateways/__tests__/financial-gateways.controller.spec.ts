import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FinancialGatewaysController } from '../financial-gateways.controller';
import { FinancialGatewaysService } from '../financial-gateways.service';

describe('FinancialGatewaysController', () => {
  let controller: FinancialGatewaysController;
  let service: FinancialGatewaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialGatewaysController],
      providers: [
        {
          provide: FinancialGatewaysService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FinancialGatewaysController>(FinancialGatewaysController);
    service = module.get<FinancialGatewaysService>(FinancialGatewaysService);
  });

  describe('POST /api/financial-gateways', () => {
    it('should create a gateway and return 201', async () => {
      const dto = { name: 'Stripe', active: true };
      const user = { id: 'admin-id', role: 'ADMIN' };
      const gateway = {
        id: 'gateway-id',
        ...dto,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      };

      jest.spyOn(service, 'create').mockResolvedValue(gateway);

      const result = await controller.create(dto, user);
      expect(result.statusCode).toBe(201);
      expect(result.data).toEqual(gateway);
    });

    it('should return 400 for invalid data', async () => {
      const dto = { name: 'X', active: true };
      const user = { id: 'admin-id', role: 'ADMIN' };

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('Invalid name'));

      await expect(controller.create(dto, user)).rejects.toThrow(BadRequestException);
    });

    it('should return 409 for duplicate name', async () => {
      const dto = { name: 'Stripe', active: true };
      const user = { id: 'admin-id', role: 'ADMIN' };

      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException('Name already exists'));

      await expect(controller.create(dto, user)).rejects.toThrow(ConflictException);
    });

    it('should return 403 for non-admin user', async () => {
      const dto = { name: 'Stripe', active: true };
      const user = { id: 'user-id', role: 'VENDEDOR' };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can create gateways'));

      await expect(controller.create(dto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /api/financial-gateways', () => {
    it('should return all gateways with 200', async () => {
      const gateways = [
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
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue({ data: gateways, total: 2 });

      const result = await controller.findAll();
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(gateways);
      expect(result.total).toBe(2);
    });
  });

  describe('GET /api/financial-gateways/:id', () => {
    it('should return gateway with 200', async () => {
      const id = 'gateway-id';
      const gateway = {
        id,
        name: 'Stripe',
        active: true,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(gateway);

      const result = await controller.findById(id);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(gateway);
    });

    it('should return 404 for non-existent gateway', async () => {
      const id = 'non-existent-id';

      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('Gateway not found'));

      await expect(controller.findById(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /api/financial-gateways/:id', () => {
    it('should update gateway and return 200', async () => {
      const id = 'gateway-id';
      const dto = { name: 'Stripe Updated', active: false };
      const user = { id: 'admin-id', role: 'ADMIN' };
      const gateway = {
        id,
        ...dto,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      };

      jest.spyOn(service, 'update').mockResolvedValue(gateway);

      const result = await controller.update(id, dto, user);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(gateway);
    });

    it('should return 409 for duplicate name', async () => {
      const id = 'gateway-id';
      const dto = { name: 'ExistingName' };
      const user = { id: 'admin-id', role: 'ADMIN' };

      jest.spyOn(service, 'update').mockRejectedValue(new ConflictException('Name already exists'));

      await expect(controller.update(id, dto, user)).rejects.toThrow(ConflictException);
    });

    it('should return 403 for non-admin user', async () => {
      const id = 'gateway-id';
      const dto = { name: 'Updated' };
      const user = { id: 'user-id', role: 'VENDEDOR' };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can update gateways'));

      await expect(controller.update(id, dto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /api/financial-gateways/:id', () => {
    it('should delete gateway and return 200', async () => {
      const id = 'gateway-id';
      const user = { id: 'admin-id', role: 'ADMIN' };

      jest.spyOn(service, 'delete').mockResolvedValue({ message: 'Gateway deleted successfully' });

      const result = await controller.delete(id, user);
      expect(result.statusCode).toBe(200);
      expect(result.message).toContain('deleted');
    });

    it('should return 409 if gateway is referenced in sales', async () => {
      const id = 'gateway-id';
      const user = { id: 'admin-id', role: 'ADMIN' };

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new ConflictException('Cannot delete gateway with active sales'));

      await expect(controller.delete(id, user)).rejects.toThrow(ConflictException);
    });

    it('should return 403 for non-admin user', async () => {
      const id = 'gateway-id';
      const user = { id: 'user-id', role: 'VENDEDOR' };

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can delete gateways'));

      await expect(controller.delete(id, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /api/financial-gateways/active', () => {
    it('should return only active gateways', async () => {
      const gateways = [
        {
          id: '1',
          name: 'Stripe',
          active: true,
          created_at: '2026-05-13T00:00:00Z',
          updated_at: '2026-05-13T00:00:00Z',
        },
      ];

      jest.spyOn(service, 'findActive').mockResolvedValue(gateways);

      const result = await controller.findActive();
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(gateways);
      expect(result.data[0].active).toBe(true);
    });
  });
});
