import { Module } from '@nestjs/common';
import { HealthModule } from '@src/health/health.module';
import { AuthModule } from '@src/modules/auth/auth.module';
import { PermissionsModule } from '@src/modules/permissions/permissions.module';

@Module({
  imports: [HealthModule, AuthModule, PermissionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
