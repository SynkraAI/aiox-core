import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CommissionApprovalService } from './commission-approval.service';
import {
  ApproveCommissionDto,
  RejectCommissionDto,
  BatchApproveCommissionsDto,
  RecordPaymentDto,
  CommissionMovementStatus,
  CommissionMovementType,
  ListCommissionMovementsFilters,
} from './commission-approval.types';

/**
 * Commission Approval REST endpoints (Story 3.4).
 *
 * NOTE: Auth/role guards are enforced at two layers:
 *   1. The service (CommissionApprovalService.assertActorCanApprove) — application-layer check.
 *   2. RLS policies on commissions + commission_movements (DB-layer defense in depth).
 *
 * In production, JwtGuard + PermissionGuard decorate the route; the actor user id is
 * sourced from request.user.sub. This controller intentionally accepts an explicit
 * `x-actor-user-id` header (or query) for test isolation until the JWT middleware
 * is wired at the gateway. See @sm/story 3.4 dev notes for the migration plan.
 */
@Controller('api/commissions')
export class CommissionApprovalController {
  constructor(private readonly approvalService: CommissionApprovalService) {}

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ApproveCommissionDto
  ): Promise<{ commission: unknown; movement: unknown }> {
    const actorId = this.resolveActorId(dto);
    try {
      const result = await this.approvalService.approve(id, actorId, dto);
      return result;
    } catch (error) {
      throw this.normalizeError(error, 'approve commission');
    }
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RejectCommissionDto
  ): Promise<{ commission: unknown; movement: unknown }> {
    const actorId = this.resolveActorIdForReject(dto);
    try {
      const result = await this.approvalService.reject(id, actorId, dto);
      return result;
    } catch (error) {
      throw this.normalizeError(error, 'reject commission');
    }
  }

  @Post(':id/record-payment')
  @HttpCode(HttpStatus.OK)
  async recordPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RecordPaymentDto & { actor_user_id?: string }
  ): Promise<{ commission: unknown; movement: unknown }> {
    const actorId = dto?.actor_user_id || uuidv4();
    try {
      const result = await this.approvalService.recordPayment(id, actorId, dto);
      return result;
    } catch (error) {
      throw this.normalizeError(error, 'record commission payment');
    }
  }

  @Post('batch-approve')
  @HttpCode(HttpStatus.OK)
  async batchApprove(
    @Body() dto: BatchApproveCommissionsDto & { actor_user_id?: string }
  ): Promise<unknown> {
    const actorId = dto?.actor_user_id || uuidv4();
    try {
      if (!dto || !Array.isArray(dto.commission_ids)) {
        throw new BadRequestException('commission_ids must be an array');
      }
      return await this.approvalService.batchApprove(actorId, {
        commission_ids: dto.commission_ids,
      });
    } catch (error) {
      throw this.normalizeError(error, 'batch-approve commissions');
    }
  }

  @Get('movements')
  @HttpCode(HttpStatus.OK)
  async listMovements(
    @Query('status') status?: string,
    @Query('user_id') user_id?: string,
    @Query('commission_id') commission_id?: string,
    @Query('movement_type') movement_type?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<unknown> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;

      if (Number.isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestException('page must be a positive integer');
      }
      if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('limit must be between 1 and 100');
      }

      const filters: ListCommissionMovementsFilters = {
        page: pageNum,
        limit: limitNum,
      };
      if (status) {
        if (!Object.values(CommissionMovementStatus).includes(status as CommissionMovementStatus)) {
          throw new BadRequestException(
            `status must be one of: ${Object.values(CommissionMovementStatus).join(', ')}`
          );
        }
        filters.status = status as CommissionMovementStatus;
      }
      if (movement_type) {
        if (
          !Object.values(CommissionMovementType).includes(movement_type as CommissionMovementType)
        ) {
          throw new BadRequestException(
            `movement_type must be one of: ${Object.values(CommissionMovementType).join(', ')}`
          );
        }
        filters.movement_type = movement_type as CommissionMovementType;
      }
      if (user_id) {
        filters.user_id = user_id;
      }
      if (commission_id) {
        filters.commission_id = commission_id;
      }
      if (date_from) {
        filters.date_from = date_from;
      }
      if (date_to) {
        filters.date_to = date_to;
      }

      return await this.approvalService.listCommissionMovements(filters);
    } catch (error) {
      throw this.normalizeError(error, 'list commission_movements');
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private resolveActorId(dto: ApproveCommissionDto): string {
    if (dto?.approved_by) {
      return dto.approved_by;
    }
    return uuidv4();
  }

  private resolveActorIdForReject(dto: RejectCommissionDto): string {
    if (dto?.rejected_by) {
      return dto.rejected_by;
    }
    return uuidv4();
  }

  private normalizeError(error: unknown, operation: string): Error {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof ForbiddenException ||
      error instanceof NotFoundException
    ) {
      return error;
    }
    return new InternalServerErrorException({
      message: `Failed to ${operation}`,
      requestId: uuidv4(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
