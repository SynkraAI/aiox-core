import { Module } from '@nestjs/common';
import { CommissionCalculatorService } from './commission-calculator.service';
import { CommissionCreationService } from './commission-creation.service';
import { CommissionApprovalService } from './commission-approval.service';
import { CommissionApprovalController } from './commission-approval.controller';
import { AuditLoggerService } from '@/common/services';

@Module({
  controllers: [CommissionApprovalController],
  providers: [
    CommissionCalculatorService,
    CommissionCreationService,
    CommissionApprovalService,
    AuditLoggerService,
  ],
  exports: [CommissionCalculatorService, CommissionCreationService, CommissionApprovalService],
})
export class CommissionsModule {}
