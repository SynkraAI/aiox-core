import { Module } from '@nestjs/common';
import { HealthModule } from '@src/health/health.module';
import { AuthModule } from '@src/modules/auth/auth.module';
import { PermissionsModule } from '@src/modules/permissions/permissions.module';
import { ReportsModule } from '@src/modules/reports/reports.module';

@Module({
  imports: [HealthModule, AuthModule, PermissionsModule, ReportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
