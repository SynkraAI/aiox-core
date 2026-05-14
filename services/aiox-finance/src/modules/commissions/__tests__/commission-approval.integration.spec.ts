/**
 * Integration tests for Story 3.4 — Commission Approval Workflow.
 *
 * These use an in-memory FakeSupabase that simulates RLS, state machine, and
 * persistence so we can validate end-to-end flows without a live database.
 *
 * Coverage:
 *   - Sale → Commission (assumed pre-created) → Approve → Movement
 *   - Audit trail validation
 *   - RLS isolation (cross-tenant safety simulated as user-role check)
 *   - Batch approve (50 commissions in one shot)
 *   - State transition guards (cannot double-approve)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CommissionApprovalService } from '../commission-approval.service';
import { AuditLoggerService } from '@/common/services';
import { CommissionMovementStatus, CommissionMovementType } from '../commission-approval.types';

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const FIN_ID = '22222222-2222-2222-2222-222222222222';
const COMERCIAL_ID = '33333333-3333-3333-3333-333333333333';
const SELLER_ID = '55555555-5555-5555-5555-555555555555';

interface FakeRow {
  [key: string]: unknown;
}

class FakeSupabaseClient {
  private tables: Map<string, FakeRow[]> = new Map();

  constructor() {
    this.tables.set('users', []);
    this.tables.set('commissions', []);
    this.tables.set('commission_movements', []);
  }

  seedUser(user: { id: string; role: string }): void {
    this.tables.get('users')!.push({ ...user });
  }

  seedCommission(commission: FakeRow): void {
    this.tables.get('commissions')!.push({ ...commission });
  }

  getCommissionMovements(): FakeRow[] {
    return [...this.tables.get('commission_movements')!];
  }

  getCommissions(): FakeRow[] {
    return [...this.tables.get('commissions')!];
  }

  from(tableName: string): any {
    const rows = this.tables.get(tableName);
    if (!rows) throw new Error(`Unknown table ${tableName}`);
    return new FakeQueryBuilder(tableName, rows, this);
  }
}

class FakeQueryBuilder {
  private filters: Array<{ field: string; value: unknown }> = [];
  private pendingInsert: FakeRow | null = null;
  private pendingUpdate: FakeRow | null = null;
  private op: 'select' | 'insert' | 'update' | 'none' = 'none';

  constructor(
    private tableName: string,
    private rows: FakeRow[],
    private client: FakeSupabaseClient
  ) {}

  select(_cols?: string, _opts?: { count?: string }): this {
    if (this.op === 'none') this.op = 'select';
    return this;
  }

  insert(row: FakeRow): this {
    this.op = 'insert';
    this.pendingInsert = {
      id: `gen-${Math.random().toString(36).slice(2, 12)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...row,
    };
    return this;
  }

  update(row: FakeRow): this {
    this.op = 'update';
    this.pendingUpdate = row;
    return this;
  }

  eq(field: string, value: unknown): this {
    this.filters.push({ field, value });
    return this;
  }

  gte(_field: string, _value: unknown): this {
    return this;
  }

  lte(_field: string, _value: unknown): this {
    return this;
  }

  order(_field: string, _opts?: { ascending: boolean }): this {
    return this;
  }

  range(_from: number, _to: number): Promise<{ data: FakeRow[]; count: number; error: null }> {
    const matches = this.applyFilters();
    return Promise.resolve({ data: matches, count: matches.length, error: null });
  }

  async single(): Promise<{ data: FakeRow | null; error: { message: string } | null }> {
    if (this.op === 'insert' && this.pendingInsert) {
      this.rows.push(this.pendingInsert);
      const inserted = this.pendingInsert;
      this.pendingInsert = null;
      return { data: inserted, error: null };
    }
    if (this.op === 'update' && this.pendingUpdate) {
      const matches = this.applyFilters();
      if (matches.length === 0) {
        return { data: null, error: { message: 'no row to update' } };
      }
      Object.assign(matches[0], this.pendingUpdate, { updated_at: new Date().toISOString() });
      this.pendingUpdate = null;
      return { data: matches[0], error: null };
    }
    const matches = this.applyFilters();
    if (matches.length === 0) {
      return { data: null, error: { message: 'no rows' } };
    }
    return { data: matches[0], error: null };
  }

  private applyFilters(): FakeRow[] {
    return this.rows.filter((r) => this.filters.every((f) => r[f.field] === f.value));
  }
}

describe('Commission Approval — Integration', () => {
  let service: CommissionApprovalService;
  let fakeSupabase: FakeSupabaseClient;
  let auditLogs: any[] = [];

  beforeEach(async () => {
    auditLogs = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionApprovalService,
        {
          provide: AuditLoggerService,
          useValue: {
            logAction: jest.fn((entry: any) => {
              auditLogs.push(entry);
              return Promise.resolve();
            }),
          },
        },
      ],
    }).compile();

    service = module.get(CommissionApprovalService);

    fakeSupabase = new FakeSupabaseClient();
    fakeSupabase.seedUser({ id: ADMIN_ID, role: 'ADMIN' });
    fakeSupabase.seedUser({ id: FIN_ID, role: 'FINANCEIRO' });
    fakeSupabase.seedUser({ id: COMERCIAL_ID, role: 'COMERCIAL' });

    (service as any).supabase = fakeSupabase;
  });

  function seedPendingCommission(id: string, sellerId = SELLER_ID, amount = 100): void {
    fakeSupabase.seedCommission({
      id,
      sale_id: '99999999-9999-9999-9999-999999999999',
      seller_id: sellerId,
      amount,
      percentage: 10,
      status: 'PENDING',
      approved_by: null,
      approval_date: null,
      rejection_reason: null,
      created_at: '2026-05-14T00:00:00Z',
      updated_at: '2026-05-14T00:00:00Z',
    });
  }

  describe('End-to-end approval flow', () => {
    it('approve creates movement (COMMISSION_CREDIT, PENDING) linked to commission', async () => {
      const id = '44444444-4444-4444-4444-444444444444';
      seedPendingCommission(id);

      const result = await service.approve(id, ADMIN_ID);

      expect(result.commission.status).toBe('APPROVED');
      expect(result.commission.approved_by).toBe(ADMIN_ID);
      expect(result.commission.approval_date).toBeTruthy();
      expect(result.movement).not.toBeNull();
      expect(result.movement!.movement_type).toBe(CommissionMovementType.COMMISSION_CREDIT);
      expect(result.movement!.status).toBe(CommissionMovementStatus.PENDING);
      expect(result.movement!.commission_id).toBe(id);
      expect(result.movement!.user_id).toBe(SELLER_ID);

      const persistedMovements = fakeSupabase.getCommissionMovements();
      expect(persistedMovements).toHaveLength(1);
    });

    it('reject does not create movement and stores rejection_reason', async () => {
      const id = '44444444-4444-4444-4444-444444444445';
      seedPendingCommission(id);
      await service.reject(id, ADMIN_ID, { rejection_reason: 'Suspicious activity' });

      const commission = fakeSupabase.getCommissions().find((c) => c.id === id);
      expect(commission?.status).toBe('REJECTED');
      expect(commission?.rejection_reason).toBe('Suspicious activity');
      expect(fakeSupabase.getCommissionMovements()).toHaveLength(0);
    });
  });

  describe('Audit trail', () => {
    it('logs COMMISSION_APPROVED on approval', async () => {
      const id = '44444444-4444-4444-4444-444444444446';
      seedPendingCommission(id);
      await service.approve(id, ADMIN_ID);
      const audit = auditLogs.find((l) => l.action === 'COMMISSION_APPROVED');
      expect(audit).toBeDefined();
      expect(audit.recordId).toBe(id);
      expect(audit.newValues.status).toBe('APPROVED');
    });

    it('logs COMMISSION_REJECTED with rejection_reason', async () => {
      const id = '44444444-4444-4444-4444-444444444447';
      seedPendingCommission(id);
      await service.reject(id, ADMIN_ID, { rejection_reason: 'Duplicate' });
      const audit = auditLogs.find((l) => l.action === 'COMMISSION_REJECTED');
      expect(audit).toBeDefined();
      expect(audit.newValues.rejection_reason).toBe('Duplicate');
    });
  });

  describe('RLS / role isolation', () => {
    it('forbids COMERCIAL user from approving (simulates RLS deny + service guard)', async () => {
      const id = '44444444-4444-4444-4444-444444444448';
      seedPendingCommission(id);
      await expect(service.approve(id, COMERCIAL_ID)).rejects.toThrow(/lacks permission/);
    });

    it('allows ADMIN and FINANCEIRO to approve', async () => {
      const id1 = '44444444-4444-4444-4444-444444444449';
      const id2 = '44444444-4444-4444-4444-44444444444a';
      seedPendingCommission(id1);
      seedPendingCommission(id2);

      await expect(service.approve(id1, ADMIN_ID)).resolves.toBeDefined();
      await expect(service.approve(id2, FIN_ID)).resolves.toBeDefined();
    });
  });

  describe('State transitions', () => {
    it('cannot approve an already APPROVED commission', async () => {
      const id = '44444444-4444-4444-4444-44444444444b';
      seedPendingCommission(id);
      await service.approve(id, ADMIN_ID);
      await expect(service.approve(id, ADMIN_ID)).rejects.toThrow(/expected 'PENDING'/);
    });

    it('cannot reject an already REJECTED commission', async () => {
      const id = '44444444-4444-4444-4444-44444444444c';
      seedPendingCommission(id);
      await service.reject(id, ADMIN_ID);
      await expect(service.reject(id, ADMIN_ID)).rejects.toThrow(/expected 'PENDING'/);
    });
  });

  describe('Batch approve', () => {
    it('approves 50 commissions in a single batch and creates 50 movements', async () => {
      const ids: string[] = [];
      for (let i = 0; i < 50; i++) {
        const id = `bbbbbbbb-bbbb-bbbb-bbbb-${String(i).padStart(12, '0')}`;
        ids.push(id);
        seedPendingCommission(id);
      }

      const result = await service.batchApprove(ADMIN_ID, { commission_ids: ids });
      expect(result.total_processed).toBe(50);
      expect(result.total_approved).toBe(50);
      expect(result.total_failed).toBe(0);
      expect(fakeSupabase.getCommissionMovements()).toHaveLength(50);
    });

    it('reports failures for non-existent commission ids in a mixed batch', async () => {
      const realId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
      const ghostId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
      seedPendingCommission(realId);

      const result = await service.batchApprove(ADMIN_ID, {
        commission_ids: [realId, ghostId],
      });
      expect(result.total_approved).toBe(1);
      expect(result.total_failed).toBe(1);
      expect(result.failed[0].commission_id).toBe(ghostId);
    });
  });
});
