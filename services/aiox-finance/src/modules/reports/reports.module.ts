import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { FinancialService } from './financial.service';

@Module({
  controllers: [ExportController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class ReportsModule {}
