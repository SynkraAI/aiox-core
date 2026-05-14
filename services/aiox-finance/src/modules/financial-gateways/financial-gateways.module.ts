import { Module } from '@nestjs/common';
import { FinancialGatewaysService } from './financial-gateways.service';
import { FinancialGatewaysController } from './financial-gateways.controller';

@Module({
  controllers: [FinancialGatewaysController],
  providers: [FinancialGatewaysService],
  exports: [FinancialGatewaysService],
})
export class FinancialGatewaysModule {}
