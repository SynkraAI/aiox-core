/**
 * Types and DTOs for Commission Approval Workflow (Story 3.4).
 *
 * Schema reference: services/aiox-finance/supabase/migrations/013_commission_movements.sql
 *                   services/aiox-finance/supabase/migrations/014_commissions_alter_columns.sql
 */

/**
 * Commission status as persisted in `commissions.status`.
 * Aligns with migration 005 CHECK constraint.
 */
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

/**
 * Lifecycle status for a `commission_movements` row.
 * Aligns with migration 013 CHECK constraint.
 */
export enum CommissionMovementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

/**
 * Movement type for a `commission_movements` row.
 * Aligns with migration 013 CHECK constraint.
 */
export enum CommissionMovementType {
  COMMISSION_CREDIT = 'COMMISSION_CREDIT',
  COMMISSION_PAYOUT = 'COMMISSION_PAYOUT',
  COMMISSION_REVERSAL = 'COMMISSION_REVERSAL',
}

/**
 * Role enum (subset used by approval workflow).
 * Mirrors values stored in `public.users.role`.
 */
export type FinanceUserRole = 'ADMIN' | 'FINANCEIRO' | 'GESTOR' | 'COMERCIAL';

/**
 * Body for POST /commissions/:id/approve.
 * approval_date is optional; service falls back to now() when omitted.
 */
export interface ApproveCommissionDto {
  approved_by?: string;
  approval_date?: string; // ISO8601
}

/**
 * Body for POST /commissions/:id/reject.
 * rejection_reason is optional but recommended for audit.
 */
export interface RejectCommissionDto {
  rejected_by?: string;
  rejection_reason?: string;
}

/**
 * Body for POST /commissions/batch-approve.
 */
export interface BatchApproveCommissionsDto {
  commission_ids: string[];
}

/**
 * Body for POST /commissions/:id/record-payment.
 */
export interface RecordPaymentDto {
  paid_at?: string; // ISO8601
  payout_movement_id?: string;
}

/**
 * Persisted shape of `public.commissions` after migration 014.
 */
export interface Commission {
  id: string;
  sale_id: string;
  seller_id: string;
  amount: number;
  percentage: number;
  status: CommissionStatus;
  approved_by: string | null;
  approval_date: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Persisted shape of `public.commission_movements`.
 */
export interface CommissionMovement {
  id: string;
  commission_id: string;
  user_id: string;
  amount: number;
  movement_type: CommissionMovementType;
  status: CommissionMovementStatus;
  description: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  paid_at: string | null;
  payout_movement_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Response from approve()/reject()/recordPayment() service methods.
 */
export interface ApprovalResult {
  commission: Commission;
  movement: CommissionMovement | null;
}

/**
 * Result of a batch approval operation.
 */
export interface BatchApprovalResult {
  approved: ApprovalResult[];
  failed: Array<{ commission_id: string; error: string }>;
  total_processed: number;
  total_approved: number;
  total_failed: number;
}

/**
 * Filters accepted by listCommissionMovements().
 */
export interface ListCommissionMovementsFilters {
  status?: CommissionMovementStatus;
  user_id?: string;
  commission_id?: string;
  movement_type?: CommissionMovementType;
  date_from?: string; // ISO8601
  date_to?: string; // ISO8601
  page?: number;
  limit?: number;
}

export interface ListCommissionMovementsResult {
  data: CommissionMovement[];
  total: number;
  page: number;
  limit: number;
}
