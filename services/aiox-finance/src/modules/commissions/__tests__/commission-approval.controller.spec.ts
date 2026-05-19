import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommissionApprovalController } from '../commission-approval.controller';
import { CommissionApprovalService } from '../commission-approval.service';
import { CommissionMovementStatus, CommissionMovementType } from '../commission-approval.types';

const COMMISSION_ID = '44444444-4444-4444-4444-444444444444';
const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const SELLER_ID = '55555555-5555-5555-5555-555555555555';

describe('CommissionApprovalController', () => {
  let controller: CommissionApprovalController;
  let service: jest.Mocked<CommissionApprovalService>;

  const sampleApprovalResult = {
    commission: {
      id: COMMISSION_ID,
      sale_id: 's',
      seller_id: SELLER_ID,
      amount: 100,
      percentage: 10,
      status: 'APPROVED' as const,
      approved_by: ADMIN_ID,
      approval_date: '2026-05-14T00:00:00Z',
      rejection_reason: null,
      created_at: 'x',
      updated_at: 'x',
    },
    movement: {
      id: 'm',
      commission_id: COMMISSION_ID,
      user_id: SELLER_ID,
      amount: 100,
      movement_type: CommissionMovementType.COMMISSION_CREDIT,
      status: CommissionMovementStatus.PENDING,
      description: null,
      approved_by: ADMIN_ID,
      approved_at: '2026-05-14T00:00:00Z',
      rejected_by: null,
      rejected_at: null,
      rejection_reason: null,
      paid_at: null,
      payout_movement_id: null,
      created_at: 'x',
      updated_at: 'x',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionApprovalController],
      providers: [
        {
          provide: CommissionApprovalService,
          useValue: {
            approve: jest.fn(),
            reject: jest.fn(),
            recordPayment: jest.fn(),
            batchApprove: jest.fn(),
            listCommissionMovements: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CommissionApprovalController);
    service = module.get(CommissionApprovalService) as jest.Mocked<CommissionApprovalService>;
  });

  describe('POST /api/commissions/:id/approve (AC1)', () => {
    it('returns 200 with commission+movement when service succeeds', async () => {
      service.approve.mockResolvedValue(sampleApprovalResult);
      const result = await controller.approve(COMMISSION_ID, { approved_by: ADMIN_ID });
      expect(result.commission).toBeDefined();
      expect(result.movement).toBeDefined();
    });

    it('propagates ForbiddenException as 403 (AC7)', async () => {
      service.approve.mockRejectedValue(new ForbiddenException('not allowed'));
      await expect(controller.approve(COMMISSION_ID, {})).rejects.toThrow(ForbiddenException);
    });

    it('propagates NotFoundException as 404 (AC11)', async () => {
      service.approve.mockRejectedValue(new NotFoundException('missing'));
      await expect(controller.approve(COMMISSION_ID, {})).rejects.toThrow(NotFoundException);
    });

    it('propagates ConflictException as 409 (AC8)', async () => {
      service.approve.mockRejectedValue(new ConflictException('not pending'));
      await expect(controller.approve(COMMISSION_ID, {})).rejects.toThrow(ConflictException);
    });

    it('wraps unknown errors in 500 with requestId (AC11)', async () => {
      service.approve.mockRejectedValue(new Error('boom'));
      await expect(controller.approve(COMMISSION_ID, {})).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('POST /api/commissions/:id/reject (AC2)', () => {
    it('returns 200 on success', async () => {
      service.reject.mockResolvedValue({
        ...sampleApprovalResult,
        commission: {
          ...sampleApprovalResult.commission,
          status: 'REJECTED' as const,
          rejection_reason: 'dup',
        },
        movement: null,
      });
      const result = await controller.reject(COMMISSION_ID, {
        rejected_by: ADMIN_ID,
        rejection_reason: 'dup',
      });
      expect((result.commission as any).status).toBe('REJECTED');
    });

    it('propagates 403 ForbiddenException (AC7)', async () => {
      service.reject.mockRejectedValue(new ForbiddenException('nope'));
      await expect(controller.reject(COMMISSION_ID, {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('POST /api/commissions/batch-approve', () => {
    it('returns batch result on success', async () => {
      service.batchApprove.mockResolvedValue({
        approved: [],
        failed: [],
        total_processed: 0,
        total_approved: 0,
        total_failed: 0,
      });
      const ids = ['11111111-1111-1111-1111-111111111111'];
      const result = (await controller.batchApprove({
        commission_ids: ids,
        actor_user_id: ADMIN_ID,
      })) as { total_processed: number };
      expect(result.total_processed).toBe(0);
    });

    it('rejects malformed body with 400', async () => {
      await expect(controller.batchApprove({} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /api/commissions/movements', () => {
    it('returns paginated movements with default page/limit', async () => {
      service.listCommissionMovements.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      });
      const result = (await controller.listMovements()) as { page: number; limit: number };
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('validates invalid page parameter', async () => {
      await expect(
        controller.listMovements(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          '0'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('validates invalid limit parameter', async () => {
      await expect(
        controller.listMovements(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          '1',
          '999'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('validates unknown status value', async () => {
      await expect(controller.listMovements('NOT_A_STATUS')).rejects.toThrow(BadRequestException);
    });

    it('validates unknown movement_type value', async () => {
      await expect(
        controller.listMovements(undefined, undefined, undefined, 'NOT_A_TYPE')
      ).rejects.toThrow(BadRequestException);
    });

    it('forwards filters to service', async () => {
      service.listCommissionMovements.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 25,
      });
      await controller.listMovements(
        'PENDING',
        SELLER_ID,
        COMMISSION_ID,
        'COMMISSION_CREDIT',
        '2026-01-01',
        '2026-12-31',
        '2',
        '25'
      );
      expect(service.listCommissionMovements).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING',
          user_id: SELLER_ID,
          commission_id: COMMISSION_ID,
          movement_type: 'COMMISSION_CREDIT',
          date_from: '2026-01-01',
          date_to: '2026-12-31',
          page: 2,
          limit: 25,
        })
      );
    });
  });

  describe('POST /api/commissions/:id/record-payment', () => {
    it('returns 200 on success', async () => {
      service.recordPayment.mockResolvedValue({
        ...sampleApprovalResult,
        commission: { ...sampleApprovalResult.commission, status: 'PAID' as const },
        movement: { ...sampleApprovalResult.movement, status: CommissionMovementStatus.PAID },
      });
      const result = await controller.recordPayment(COMMISSION_ID, {
        actor_user_id: ADMIN_ID,
      });
      expect((result.commission as any).status).toBe('PAID');
    });

    it('propagates 409 for non-APPROVED commissions', async () => {
      service.recordPayment.mockRejectedValue(new ConflictException('not approved'));
      await expect(
        controller.recordPayment(COMMISSION_ID, { actor_user_id: ADMIN_ID })
      ).rejects.toThrow(ConflictException);
    });
  });
});
