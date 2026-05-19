import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuditLoggerService } from '@/common/services';
import {
  ApproveCommissionDto,
  RejectCommissionDto,
  BatchApproveCommissionsDto,
  RecordPaymentDto,
  Commission,
  CommissionMovement,
  CommissionMovementStatus,
  CommissionMovementType,
  CommissionStatus,
  ApprovalResult,
  BatchApprovalResult,
  ListCommissionMovementsFilters,
  ListCommissionMovementsResult,
  FinanceUserRole,
} from './commission-approval.types';

const APPROVAL_ROLES: ReadonlyArray<FinanceUserRole> = ['ADMIN', 'FINANCEIRO'];

@Injectable()
export class CommissionApprovalService {
  private supabase: SupabaseClient;

  constructor(private readonly auditLogger: AuditLoggerService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Approve a PENDING commission.
   * - Verifies actor role (ADMIN | FINANCEIRO).
   * - Validates current commission.status === 'PENDING'.
   * - Updates `commissions` (status=APPROVED, approved_by, approval_date).
   * - Inserts a `commission_movements` COMMISSION_CREDIT row (status=PENDING for payout).
   * - Logs audit entry: COMMISSION_APPROVED.
   *
   * AC1, AC3, AC5, AC6, AC7, AC8, AC9, AC10.
   */
  async approve(
    commissionId: string,
    actorUserId: string,
    dto?: ApproveCommissionDto
  ): Promise<ApprovalResult> {
    this.assertUuid(commissionId, 'commissionId');
    this.assertUuid(actorUserId, 'actorUserId');

    await this.assertActorCanApprove(actorUserId);

    const commission = await this.fetchCommissionOrThrow(commissionId);

    if (commission.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot approve commission '${commissionId}': current status is '${commission.status}', expected 'PENDING'`
      );
    }

    const approvedBy = dto?.approved_by || actorUserId;
    const approvalDate = dto?.approval_date || new Date().toISOString();

    try {
      const updatedCommission = await this.updateCommission(commissionId, {
        status: 'APPROVED',
        approved_by: approvedBy,
        approval_date: approvalDate,
      });

      const movement = await this.createCommissionMovement({
        commission_id: commissionId,
        user_id: commission.seller_id,
        amount: commission.amount,
        movement_type: CommissionMovementType.COMMISSION_CREDIT,
        status: CommissionMovementStatus.PENDING,
        description: `Commission approved for sale ${commission.sale_id}`,
        approved_by: approvedBy,
        approved_at: approvalDate,
      });

      await this.auditLogger.logAction({
        userId: actorUserId,
        action: 'COMMISSION_APPROVED',
        tableName: 'commissions',
        recordId: commissionId,
        oldValues: { status: 'PENDING' },
        newValues: {
          status: 'APPROVED',
          approved_by: approvedBy,
          approval_date: approvalDate,
          commission_movement_id: movement?.id ?? null,
        },
      });

      return { commission: updatedCommission, movement };
    } catch (error) {
      if (this.isHttpException(error)) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to approve commission '${commissionId}': ${this.errorMessage(error)}`
      );
    }
  }

  /**
   * Reject a PENDING commission.
   * - Verifies actor role (ADMIN | FINANCEIRO).
   * - Validates current commission.status === 'PENDING'.
   * - Updates `commissions` (status=REJECTED, approved_by=actor, approval_date=now, rejection_reason).
   * - No commission_movements row is created on rejection (only approved commissions credit movements).
   * - Logs audit entry: COMMISSION_REJECTED.
   *
   * AC2, AC4, AC7, AC8, AC9, AC10, AC12.
   */
  async reject(
    commissionId: string,
    actorUserId: string,
    dto?: RejectCommissionDto
  ): Promise<ApprovalResult> {
    this.assertUuid(commissionId, 'commissionId');
    this.assertUuid(actorUserId, 'actorUserId');

    await this.assertActorCanApprove(actorUserId);

    const commission = await this.fetchCommissionOrThrow(commissionId);

    if (commission.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot reject commission '${commissionId}': current status is '${commission.status}', expected 'PENDING'`
      );
    }

    const rejectedBy = dto?.rejected_by || actorUserId;
    const decisionAt = new Date().toISOString();
    const reason = dto?.rejection_reason ?? null;

    if (reason !== null && reason.length > 500) {
      throw new BadRequestException('rejection_reason must be 500 characters or fewer');
    }

    try {
      const updatedCommission = await this.updateCommission(commissionId, {
        status: 'REJECTED',
        approved_by: rejectedBy,
        approval_date: decisionAt,
        rejection_reason: reason,
      });

      await this.auditLogger.logAction({
        userId: actorUserId,
        action: 'COMMISSION_REJECTED',
        tableName: 'commissions',
        recordId: commissionId,
        oldValues: { status: 'PENDING' },
        newValues: {
          status: 'REJECTED',
          approved_by: rejectedBy,
          approval_date: decisionAt,
          rejection_reason: reason,
        },
      });

      return { commission: updatedCommission, movement: null };
    } catch (error) {
      if (this.isHttpException(error)) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to reject commission '${commissionId}': ${this.errorMessage(error)}`
      );
    }
  }

  /**
   * Record payment of an approved commission (transitions movement PENDING -> PAID).
   * - Verifies actor role (ADMIN | FINANCEIRO).
   * - Validates commission.status === 'APPROVED'.
   * - Updates commission_movements (status=PAID, paid_at).
   * - Updates commissions.status -> 'PAID'.
   * - Audit log: COMMISSION_PAID.
   */
  async recordPayment(
    commissionId: string,
    actorUserId: string,
    dto?: RecordPaymentDto
  ): Promise<ApprovalResult> {
    this.assertUuid(commissionId, 'commissionId');
    this.assertUuid(actorUserId, 'actorUserId');

    await this.assertActorCanApprove(actorUserId);

    const commission = await this.fetchCommissionOrThrow(commissionId);
    if (commission.status !== 'APPROVED') {
      throw new ConflictException(
        `Cannot record payment for commission '${commissionId}': current status is '${commission.status}', expected 'APPROVED'`
      );
    }

    const movement = await this.fetchCreditMovementOrThrow(commissionId);
    if (movement.status !== CommissionMovementStatus.PENDING) {
      throw new ConflictException(
        `Cannot record payment for movement '${movement.id}': current status is '${movement.status}', expected 'PENDING'`
      );
    }

    const paidAt = dto?.paid_at || new Date().toISOString();

    try {
      const updatedMovement = await this.updateCommissionMovement(movement.id, {
        status: CommissionMovementStatus.PAID,
        paid_at: paidAt,
        payout_movement_id: dto?.payout_movement_id ?? null,
      });

      const updatedCommission = await this.updateCommission(commissionId, { status: 'PAID' });

      await this.auditLogger.logAction({
        userId: actorUserId,
        action: 'COMMISSION_PAID',
        tableName: 'commission_movements',
        recordId: movement.id,
        oldValues: { status: 'PENDING' },
        newValues: { status: 'PAID', paid_at: paidAt },
      });

      return { commission: updatedCommission, movement: updatedMovement };
    } catch (error) {
      if (this.isHttpException(error)) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to record payment for commission '${commissionId}': ${this.errorMessage(error)}`
      );
    }
  }

  /**
   * Batch-approve multiple commissions (month-end finance flow).
   * Each commission is approved independently; failures do not abort the batch.
   */
  async batchApprove(
    actorUserId: string,
    dto: BatchApproveCommissionsDto
  ): Promise<BatchApprovalResult> {
    this.assertUuid(actorUserId, 'actorUserId');

    if (!dto || !Array.isArray(dto.commission_ids) || dto.commission_ids.length === 0) {
      throw new BadRequestException('commission_ids must be a non-empty array');
    }
    if (dto.commission_ids.length > 500) {
      throw new BadRequestException('commission_ids may contain at most 500 items per batch');
    }

    await this.assertActorCanApprove(actorUserId);

    const approved: ApprovalResult[] = [];
    const failed: Array<{ commission_id: string; error: string }> = [];

    for (const id of dto.commission_ids) {
      try {
        const result = await this.approve(id, actorUserId);
        approved.push(result);
      } catch (error) {
        failed.push({ commission_id: id, error: this.errorMessage(error) });
      }
    }

    return {
      approved,
      failed,
      total_processed: dto.commission_ids.length,
      total_approved: approved.length,
      total_failed: failed.length,
    };
  }

  /**
   * List commission_movements with filters and pagination.
   * Respects RLS (configured client; ADMIN/FINANCEIRO/GESTOR see all, sellers see own).
   */
  async listCommissionMovements(
    filters: ListCommissionMovementsFilters = {}
  ): Promise<ListCommissionMovementsResult> {
    const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
    const limit =
      filters.limit && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 100) : 50;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('commission_movements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
      this.assertUuid(filters.user_id, 'user_id');
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.commission_id) {
      this.assertUuid(filters.commission_id, 'commission_id');
      query = query.eq('commission_id', filters.commission_id);
    }
    if (filters.movement_type) {
      query = query.eq('movement_type', filters.movement_type);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list commission_movements: ${error.message}`
      );
    }

    return {
      data: (data || []).map((row) => this.mapMovementRow(row as Record<string, unknown>)),
      total: count ?? (data?.length || 0),
      page,
      limit,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async assertActorCanApprove(actorUserId: string): Promise<void> {
    const role = await this.getUserRole(actorUserId);
    if (!role) {
      throw new ForbiddenException(`User '${actorUserId}' not found or has no role assigned`);
    }
    if (!APPROVAL_ROLES.includes(role)) {
      throw new ForbiddenException(
        `User '${actorUserId}' lacks permission to approve/reject commissions (role: ${role})`
      );
    }
  }

  private async getUserRole(userId: string): Promise<FinanceUserRole | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (error || !data) {
      return null;
    }
    return data.role as FinanceUserRole;
  }

  private async fetchCommissionOrThrow(commissionId: string): Promise<Commission> {
    const { data, error } = await this.supabase
      .from('commissions')
      .select('*')
      .eq('id', commissionId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Commission '${commissionId}' not found`);
    }
    return this.mapCommissionRow(data as Record<string, unknown>);
  }

  private async fetchCreditMovementOrThrow(commissionId: string): Promise<CommissionMovement> {
    const { data, error } = await this.supabase
      .from('commission_movements')
      .select('*')
      .eq('commission_id', commissionId)
      .eq('movement_type', CommissionMovementType.COMMISSION_CREDIT)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `No COMMISSION_CREDIT movement found for commission '${commissionId}'`
      );
    }
    return this.mapMovementRow(data as Record<string, unknown>);
  }

  private async updateCommission(
    commissionId: string,
    patch: Partial<{
      status: CommissionStatus;
      approved_by: string | null;
      approval_date: string | null;
      rejection_reason: string | null;
    }>
  ): Promise<Commission> {
    const payload = { ...patch, updated_at: new Date().toISOString() };
    const { data, error } = await this.supabase
      .from('commissions')
      .update(payload)
      .eq('id', commissionId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to update commission '${commissionId}': ${error?.message || 'no row returned'}`
      );
    }
    return this.mapCommissionRow(data as Record<string, unknown>);
  }

  private async createCommissionMovement(
    input: Omit<
      CommissionMovement,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'rejected_by'
      | 'rejected_at'
      | 'rejection_reason'
      | 'paid_at'
      | 'payout_movement_id'
    > &
      Partial<Pick<CommissionMovement, 'approved_by' | 'approved_at' | 'description'>>
  ): Promise<CommissionMovement> {
    const { data, error } = await this.supabase
      .from('commission_movements')
      .insert({
        commission_id: input.commission_id,
        user_id: input.user_id,
        amount: input.amount,
        movement_type: input.movement_type,
        status: input.status,
        description: input.description ?? null,
        approved_by: input.approved_by ?? null,
        approved_at: input.approved_at ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to create commission_movement: ${error?.message || 'no row returned'}`
      );
    }
    return this.mapMovementRow(data as Record<string, unknown>);
  }

  private async updateCommissionMovement(
    movementId: string,
    patch: Partial<{
      status: CommissionMovementStatus;
      paid_at: string | null;
      payout_movement_id: string | null;
    }>
  ): Promise<CommissionMovement> {
    const payload = { ...patch, updated_at: new Date().toISOString() };
    const { data, error } = await this.supabase
      .from('commission_movements')
      .update(payload)
      .eq('id', movementId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to update commission_movement '${movementId}': ${error?.message || 'no row returned'}`
      );
    }
    return this.mapMovementRow(data as Record<string, unknown>);
  }

  private mapCommissionRow(row: Record<string, unknown>): Commission {
    return {
      id: String(row.id),
      sale_id: String(row.sale_id),
      seller_id: String(row.seller_id),
      amount: Number(row.amount),
      percentage: Number(row.percentage),
      status: String(row.status) as CommissionStatus,
      approved_by: row.approved_by ? String(row.approved_by) : null,
      approval_date: row.approval_date ? String(row.approval_date) : null,
      rejection_reason: row.rejection_reason ? String(row.rejection_reason) : null,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  }

  private mapMovementRow(row: Record<string, unknown>): CommissionMovement {
    return {
      id: String(row.id),
      commission_id: String(row.commission_id),
      user_id: String(row.user_id),
      amount: Number(row.amount),
      movement_type: String(row.movement_type) as CommissionMovementType,
      status: String(row.status) as CommissionMovementStatus,
      description: row.description ? String(row.description) : null,
      approved_by: row.approved_by ? String(row.approved_by) : null,
      approved_at: row.approved_at ? String(row.approved_at) : null,
      rejected_by: row.rejected_by ? String(row.rejected_by) : null,
      rejected_at: row.rejected_at ? String(row.rejected_at) : null,
      rejection_reason: row.rejection_reason ? String(row.rejection_reason) : null,
      paid_at: row.paid_at ? String(row.paid_at) : null,
      payout_movement_id: row.payout_movement_id ? String(row.payout_movement_id) : null,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  }

  private assertUuid(value: unknown, field: string): void {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof value !== 'string' || !re.test(value)) {
      throw new BadRequestException(`${field} must be a valid UUID`);
    }
  }

  private isHttpException(error: unknown): boolean {
    return (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof InternalServerErrorException
    );
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }
}
