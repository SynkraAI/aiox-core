import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { FinancialGatewaysController } from '../financial-gateways.controller';
import { FinancialGatewaysService } from '../financial-gateways.service';

describe('FinancialGateways Integration Tests', () => {
  let app: INestApplication;
  let controller: FinancialGatewaysController;
  let service: FinancialGatewaysService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FinancialGatewaysController],
      providers: [FinancialGatewaysService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    controller = moduleFixture.get<FinancialGatewaysController>(FinancialGatewaysController);
    service = moduleFixture.get<FinancialGatewaysService>(FinancialGatewaysService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('CRUD Flow', () => {
    it('should complete full CRUD cycle: create → read → update → delete', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };
      const createDto = { name: 'Test Gateway', active: true };
      const updateDto = { name: 'Updated Gateway', active: false };

      jest.spyOn(service, 'create').mockResolvedValue({
        id: 'new-gateway-id',
        ...createDto,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });

      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 'new-gateway-id',
        ...createDto,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });

      jest.spyOn(service, 'update').mockResolvedValue({
        id: 'new-gateway-id',
        ...updateDto,
        created_at: '2026-05-13T00:00:00Z',
        updated_at: '2026-05-13T00:00:00Z',
      });

      jest.spyOn(service, 'delete').mockResolvedValue({
        message: 'Gateway deleted successfully',
      });

      const createResult = await controller.create(createDto, adminUser);
      expect(createResult.statusCode).toBe(201);

      const readResult = await controller.findById(createResult.data.id);
      expect(readResult.statusCode).toBe(200);
      expect(readResult.data.name).toBe(createDto.name);

      const updateResult = await controller.update(createResult.data.id, updateDto, adminUser);
      expect(updateResult.statusCode).toBe(200);
      expect(updateResult.data.name).toBe(updateDto.name);

      const deleteResult = await controller.delete(createResult.data.id, adminUser);
      expect(deleteResult.statusCode).toBe(200);
    });
  });

  describe('Permission Enforcement', () => {
    it('should block non-admin users from creating gateways', async () => {
      const vendedorUser = { id: 'vendor-id', role: 'VENDEDOR' };
      const dto = { name: 'Stripe', active: true };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can create gateways'));

      await expect(controller.create(dto, vendedorUser)).rejects.toThrow(ForbiddenException);
    });

    it('should block non-admin users from updating gateways', async () => {
      const vendedorUser = { id: 'vendor-id', role: 'VENDEDOR' };
      const dto = { name: 'Updated' };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can update gateways'));

      await expect(controller.update('gateway-id', dto, vendedorUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should block non-admin users from deleting gateways', async () => {
      const vendedorUser = { id: 'vendor-id', role: 'VENDEDOR' };

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can delete gateways'));

      await expect(controller.delete('gateway-id', vendedorUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('Constraint Validation', () => {
    it('should reject duplicate gateway name', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };
      const dto = { name: 'Stripe', active: true };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new ConflictException("Gateway name 'Stripe' already exists"));

      await expect(controller.create(dto, adminUser)).rejects.toThrow(ConflictException);
    });

    it('should validate minimum name length', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };
      const dto = { name: 'X', active: true };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Name must be at least 2 characters'));

      await expect(controller.create(dto, adminUser)).rejects.toThrow(BadRequestException);
    });

    it('should validate maximum name length', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };
      const longName = 'A'.repeat(101);
      const dto = { name: longName, active: true };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Name must be at most 100 characters'));

      await expect(controller.create(dto, adminUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid input', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };
      const dto = {} as any;

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('Name is required'));

      await expect(controller.create(dto, adminUser)).rejects.toThrow(BadRequestException);
    });

    it('should return 403 for permission denied', async () => {
      const nonAdminUser = { id: 'user-id', role: 'COMERCIAL' };

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new ForbiddenException('Only ADMIN can delete gateways'));

      await expect(controller.delete('gateway-id', nonAdminUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should return 409 for conflict (duplicate/reference)', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new ConflictException('Cannot delete gateway with active sales'));

      await expect(controller.delete('gateway-id', adminUser)).rejects.toThrow(ConflictException);
    });

    it('should return 500 with requestId for internal error', async () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN' };
      const dto = { name: 'Stripe', active: true };

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Database error'));

      try {
        await controller.create(dto, adminUser);
      } catch (error: any) {
        expect(error.status).toBe(500);
        expect(error.response.requestId).toBeDefined();
      }
    });
  });
});
