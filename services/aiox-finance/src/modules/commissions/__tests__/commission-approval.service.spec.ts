import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommissionApprovalService } from '../commission-approval.service';
import { AuditLoggerService } from '@/common/services';
import { CommissionMovementStatus, CommissionMovementType } from '../commission-approval.types';

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const FIN_ID = '22222222-2222-2222-2222-222222222222';
const COMERCIAL_ID = '33333333-3333-3333-3333-333333333333';
const COMMISSION_ID = '44444444-4444-4444-4444-444444444444';
const SELLER_ID = '55555555-5555-5555-5555-555555555555';
const SALE_ID = '66666666-6666-6666-6666-666666666666';
const MOVEMENT_ID = '77777777-7777-7777-7777-777777777777';

interface RpcQuery {
  select?: jest.Mock;
  insert?: jest.Mock;
  update?: jest.Mock;
  eq?: jest.Mock;
  range?: jest.Mock;
  order?: jest.Mock;
  single?: jest.Mock;
  gte?: jest.Mock;
  lte?: jest.Mock;
}

function makeBuilder(): RpcQuery {
  const builder: any = {};
  builder.select = jest.fn().mockReturnValue(builder);
  builder.insert = jest.fn().mockReturnValue(builder);
  builder.update = jest.fn().mockReturnValue(builder);
  builder.eq = jest.fn().mockReturnValue(builder);
  builder.order = jest.fn().mockReturnValue(builder);
  builder.range = jest.fn().mockReturnValue(builder);
  builder.gte = jest.fn().mockReturnValue(builder);
  builder.lte = jest.fn().mockReturnValue(builder);
  builder.single = jest.fn();
  return builder;
}

describe('CommissionApprovalService', () => {
  let service: CommissionApprovalService;
  let auditLogger: { logAction: jest.Mock };
  let from: jest.Mock;

  /**
   * tableMap controls per-table query behavior. Each entry returns a fresh builder.
   * The state of `commissions` and `commission_movements` rows is persisted at the
   * test scope (via `commissionState` and `movementState`) so updates between calls
   * are visible. Reassign these states in individual `it()` blocks to test variants.
   */
  let tableMap: Record<string, () => RpcQuery>;
  let commissionState: any;
  let movementState: any;
  let userRoleResolver: (id: string) => { role: string } | null;

  beforeEach(async () => {
    auditLogger = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionApprovalService,
        { provide: AuditLoggerService, useValue: auditLogger },
      ],
    }).compile();

    service = module.get(CommissionApprovalService);

    commissionState = {
      id: COMMISSION_ID,
      sale_id: SALE_ID,
      seller_id: SELLER_ID,
      amount: 100,
      percentage: 10,
      status: 'PENDING',
      approved_by: null,
      approval_date: null,
      rejection_reason: null,
      created_at: '2026-05-14T00:00:00Z',
      updated_at: '2026-05-14T00:00:00Z',
    };

    movementState = {
      id: MOVEMENT_ID,
      commission_id: COMMISSION_ID,
      user_id: SELLER_ID,
      amount: 100,
      movement_type: 'COMMISSION_CREDIT',
      status: 'PENDING',
      description: 'Commission credit',
      approved_by: ADMIN_ID,
      approved_at: '2026-05-14T00:00:00Z',
      rejected_by: null,
      rejected_at: null,
      rejection_reason: null,
      paid_at: null,
      payout_movement_id: null,
      created_at: '2026-05-14T00:00:00Z',
      updated_at: '2026-05-14T00:00:00Z',
    };

    userRoleResolver = (_id: string) => ({ role: 'ADMIN' });

    tableMap = {
      users: () => {
        const b = makeBuilder();
        // capture the eq() value to support per-user role resolution
        let queriedId = '';
        b.eq = jest.fn().mockImplementation((field: string, value: string) => {
          if (field === 'id') queriedId = value;
          return b;
        });
        (b.single as jest.Mock).mockImplementation(() => {
          const role = userRoleResolver(queriedId);
          if (!role) return Promise.resolve({ data: null, error: { message: 'no rows' } });
          return Promise.resolve({ data: role, error: null });
        });
        return b;
      },
      commissions: () => {
        const b: any = makeBuilder();
        b.insert = jest.fn().mockImplementation((row: any) => {
          commissionState = { ...commissionState, ...row };
          return b;
        });
        b.update = jest.fn().mockImplementation((patch: any) => {
          commissionState = { ...commissionState, ...patch };
          return b;
        });
        (b.single as jest.Mock).mockImplementation(() =>
          Promise.resolve({ data: { ...commissionState }, error: null })
        );
        return b;
      },
      commission_movements: () => {
        const b: any = makeBuilder();
        b.insert = jest.fn().mockImplementation((row: any) => {
          movementState = { ...movementState, ...row, id: MOVEMENT_ID };
          return b;
        });
        b.update = jest.fn().mockImplementation((patch: any) => {
          movementState = { ...movementState, ...patch };
          return b;
        });
        (b.single as jest.Mock).mockImplementation(() =>
          Promise.resolve({ data: { ...movementState }, error: null })
        );
        return b;
      },
    };

    from = jest.fn().mockImplementation((tableName: string) => {
      const fn = tableMap[tableName];
      if (!fn) throw new Error(`Unmocked table: ${tableName}`);
      return fn();
    });

    (service as any).supabase = { from };
  });

  describe('approve()', () => {
    // AC1, AC3, AC5, AC6, AC10
    it('approves a PENDING commission and creates a COMMISSION_CREDIT movement', async () => {
      const result = await service.approve(COMMISSION_ID, ADMIN_ID);

      expect(result.commission.status).toBe('APPROVED');
      expect(result.commission.approved_by).toBeTruthy();
      expect(result.commission.approval_date).toBeTruthy();
      expect(result.movement).not.toBeNull();
      expect(result.movement?.movement_type).toBe(CommissionMovementType.COMMISSION_CREDIT);
      expect(result.movement?.status).toBe(CommissionMovementStatus.PENDING);
    });

    // AC10 (audit trail)
    it('logs COMMISSION_APPROVED audit entry', async () => {
      await service.approve(COMMISSION_ID, ADMIN_ID);
      expect(auditLogger.logAction).toHaveBeenCalledTimes(1);
      expect(auditLogger.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'COMMISSION_APPROVED',
          tableName: 'commissions',
          recordId: COMMISSION_ID,
        })
      );
    });

    // AC7 (RLS/permission)
    it('throws ForbiddenException when actor role is not ADMIN or FINANCEIRO', async () => {
      userRoleResolver = () => ({ role: 'COMERCIAL' });
      await expect(service.approve(COMMISSION_ID, COMERCIAL_ID)).rejects.toThrow(
        ForbiddenException
      );
    });

    // AC7 (RLS/permission)
    it('throws ForbiddenException when actor user is not found', async () => {
      userRoleResolver = () => null;
      await expect(service.approve(COMMISSION_ID, ADMIN_ID)).rejects.toThrow(ForbiddenException);
    });

    // AC8 (state transition)
    it('throws ConflictException when commission is already APPROVED', async () => {
      commissionState.status = 'APPROVED';
      await expect(service.approve(COMMISSION_ID, ADMIN_ID)).rejects.toThrow(ConflictException);
    });

    // AC9 (commission must exist)
    it('throws NotFoundException when commission does not exist', async () => {
      tableMap.commissions = () => {
        const b: any = makeBuilder();
        (b.single as jest.Mock).mockResolvedValue({ data: null, error: { message: 'no rows' } });
        return b;
      };
      await expect(service.approve(COMMISSION_ID, ADMIN_ID)).rejects.toThrow(NotFoundException);
    });

    // AC11 (validation)
    it('throws BadRequestException when commissionId is not a UUID', async () => {
      await expect(service.approve('not-a-uuid', ADMIN_ID)).rejects.toThrow(BadRequestException);
    });

    // AC11 (validation)
    it('throws BadRequestException when actorUserId is not a UUID', async () => {
      await expect(service.approve(COMMISSION_ID, 'not-a-uuid')).rejects.toThrow(
        BadRequestException
      );
    });

    it('respects approval_date and approved_by from DTO when supplied', async () => {
      const date = '2026-06-01T12:00:00Z';
      const result = await service.approve(COMMISSION_ID, ADMIN_ID, {
        approved_by: FIN_ID,
        approval_date: date,
      });
      const auditCall = (auditLogger.logAction as jest.Mock).mock.calls[0][0];
      expect(auditCall.newValues.approved_by).toBe(FIN_ID);
      expect(auditCall.newValues.approval_date).toBe(date);
      expect(result.commission.status).toBe('APPROVED');
    });
  });

  describe('reject()', () => {
    // AC2, AC4
    it('rejects a PENDING commission and stores rejection_reason', async () => {
      const result = await service.reject(COMMISSION_ID, ADMIN_ID, {
        rejection_reason: 'Duplicate sale',
      });
      expect(result.commission.status).toBe('REJECTED');
      expect(result.movement).toBeNull();
    });

    // AC10 (audit)
    it('logs COMMISSION_REJECTED audit entry', async () => {
      await service.reject(COMMISSION_ID, ADMIN_ID, { rejection_reason: 'Test' });
      expect(auditLogger.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'COMMISSION_REJECTED', tableName: 'commissions' })
      );
    });

    // AC8 (state transition)
    it('cannot reject an already APPROVED commission', async () => {
      commissionState.status = 'APPROVED';
      await expect(service.reject(COMMISSION_ID, ADMIN_ID)).rejects.toThrow(ConflictException);
    });

    // AC12 (optional reason)
    it('allows null rejection_reason', async () => {
      const result = await service.reject(COMMISSION_ID, ADMIN_ID);
      expect(result.commission.status).toBe('REJECTED');
    });

    // AC11 / sanity
    it('rejects reason exceeding 500 characters', async () => {
      const longReason = 'x'.repeat(501);
      await expect(
        service.reject(COMMISSION_ID, ADMIN_ID, { rejection_reason: longReason })
      ).rejects.toThrow(BadRequestException);
    });

    // AC7 (permission)
    it('forbids non-FINANCEIRO/ADMIN users from rejecting', async () => {
      userRoleResolver = () => ({ role: 'COMERCIAL' });
      await expect(service.reject(COMMISSION_ID, COMERCIAL_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('recordPayment()', () => {
    it('transitions APPROVED commission + PENDING movement to PAID', async () => {
      // Commission must be APPROVED for recordPayment
      commissionState.status = 'APPROVED';
      commissionState.approved_by = ADMIN_ID;
      commissionState.approval_date = '2026-05-14T00:00:00Z';

      const result = await service.recordPayment(COMMISSION_ID, ADMIN_ID, {
        paid_at: '2026-05-15T00:00:00Z',
      });
      expect(result.commission.status).toBe('PAID');
      expect(result.movement?.status).toBe(CommissionMovementStatus.PAID);
      expect(auditLogger.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'COMMISSION_PAID' })
      );
    });

    it('rejects payment recording when commission is not APPROVED', async () => {
      // Default commission mock = PENDING
      await expect(service.recordPayment(COMMISSION_ID, ADMIN_ID)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('batchApprove()', () => {
    it('approves multiple commissions and returns per-id outcomes', async () => {
      const ids = [
        '99999999-9999-9999-9999-999999999991',
        '99999999-9999-9999-9999-999999999992',
        '99999999-9999-9999-9999-999999999993',
      ];

      // Each request gets a fresh PENDING commission row (multi-row simulation)
      tableMap.commissions = () => {
        const b: any = makeBuilder();
        b.insert = jest.fn().mockImplementation(() => b);
        b.update = jest.fn().mockImplementation((patch: any) => {
          // simulate the row being mutated post-update for the second .single() call
          (b.single as jest.Mock).mockResolvedValueOnce({
            data: {
              id: ids[0],
              sale_id: SALE_ID,
              seller_id: SELLER_ID,
              amount: 50,
              percentage: 5,
              status: 'APPROVED',
              ...patch,
              created_at: 'x',
              updated_at: 'x',
            },
            error: null,
          });
          return b;
        });
        (b.single as jest.Mock).mockResolvedValue({
          data: {
            id: ids[0],
            sale_id: SALE_ID,
            seller_id: SELLER_ID,
            amount: 50,
            percentage: 5,
            status: 'PENDING',
            approved_by: null,
            approval_date: null,
            rejection_reason: null,
            created_at: 'x',
            updated_at: 'x',
          },
          error: null,
        });
        return b;
      };

      const result = await service.batchApprove(ADMIN_ID, { commission_ids: ids });
      expect(result.total_processed).toBe(3);
      expect(result.total_approved).toBe(3);
      expect(result.total_failed).toBe(0);
    });

    it('rejects empty commission_ids array', async () => {
      await expect(service.batchApprove(ADMIN_ID, { commission_ids: [] })).rejects.toThrow(
        BadRequestException
      );
    });

    it('rejects batches larger than 500 entries', async () => {
      const ids = Array.from(
        { length: 501 },
        (_, i) => `aaaaaaaa-aaaa-aaaa-aaaa-${String(i).padStart(12, '0')}`
      );
      await expect(service.batchApprove(ADMIN_ID, { commission_ids: ids })).rejects.toThrow(
        BadRequestException
      );
    });

    it('continues on individual failures and records error per id', async () => {
      const ids = ['99999999-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999992'];
      let callCount = 0;
      tableMap.commissions = () => {
        const b: any = makeBuilder();
        b.update = jest.fn().mockImplementation(() => b);
        (b.single as jest.Mock).mockImplementation(() => {
          callCount++;
          // 1st call: fetchCommission for id[0] -> PENDING
          // 2nd call: updateCommission (after approve) -> APPROVED
          // 3rd call: fetchCommission for id[1] -> NotFound
          if (callCount === 3) {
            return Promise.resolve({ data: null, error: { message: 'no rows' } });
          }
          if (callCount === 2) {
            return Promise.resolve({
              data: {
                id: ids[0],
                sale_id: SALE_ID,
                seller_id: SELLER_ID,
                amount: 50,
                percentage: 5,
                status: 'APPROVED',
                approved_by: ADMIN_ID,
                approval_date: 'x',
                rejection_reason: null,
                created_at: 'x',
                updated_at: 'x',
              },
              error: null,
            });
          }
          return Promise.resolve({
            data: {
              id: ids[0],
              sale_id: SALE_ID,
              seller_id: SELLER_ID,
              amount: 50,
              percentage: 5,
              status: 'PENDING',
              approved_by: null,
              approval_date: null,
              rejection_reason: null,
              created_at: 'x',
              updated_at: 'x',
            },
            error: null,
          });
        });
        return b;
      };

      const result = await service.batchApprove(ADMIN_ID, { commission_ids: ids });
      expect(result.total_processed).toBe(2);
      expect(result.total_failed).toBeGreaterThanOrEqual(1);
    });
  });

  describe('listCommissionMovements()', () => {
    it('returns paginated movements with default page=1, limit=50', async () => {
      tableMap.commission_movements = () => {
        const b = makeBuilder();
        // For listing, range() is the terminal call, not single()
        (b.range as jest.Mock).mockResolvedValue({
          data: [
            {
              id: MOVEMENT_ID,
              commission_id: COMMISSION_ID,
              user_id: SELLER_ID,
              amount: 100,
              movement_type: 'COMMISSION_CREDIT',
              status: 'PENDING',
              description: null,
              approved_by: null,
              approved_at: null,
              rejected_by: null,
              rejected_at: null,
              rejection_reason: null,
              paid_at: null,
              payout_movement_id: null,
              created_at: 'x',
              updated_at: 'x',
            },
          ],
          count: 1,
          error: null,
        });
        return b;
      };

      const result = await service.listCommissionMovements();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('applies status and user_id filters when provided', async () => {
      const b = makeBuilder();
      (b.range as jest.Mock).mockResolvedValue({ data: [], count: 0, error: null });
      tableMap.commission_movements = () => b;

      await service.listCommissionMovements({
        status: CommissionMovementStatus.PAID,
        user_id: SELLER_ID,
      });

      expect(b.eq).toHaveBeenCalledWith('status', 'PAID');
      expect(b.eq).toHaveBeenCalledWith('user_id', SELLER_ID);
    });

    it('caps limit at 100', async () => {
      const b = makeBuilder();
      (b.range as jest.Mock).mockResolvedValue({ data: [], count: 0, error: null });
      tableMap.commission_movements = () => b;
      const result = await service.listCommissionMovements({ limit: 999 });
      expect(result.limit).toBe(100);
    });
  });
});
