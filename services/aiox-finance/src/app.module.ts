import { Module } from '@nestjs/common';
import { HealthModule } from '@src/health/health.module';
import { AuthModule } from '@src/modules/auth/auth.module';
import { PermissionsModule } from '@src/modules/permissions/permissions.module';
import { ReportsModule } from '@src/modules/reports/reports.module';
import { SalesModule } from '@src/modules/sales/sales.module';
import { FinancialGatewaysModule } from '@src/modules/financial-gateways/financial-gateways.module';
import { CommissionsModule } from '@src/modules/commissions/commissions.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    PermissionsModule,
    ReportsModule,
    SalesModule,
    FinancialGatewaysModule,
    CommissionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
