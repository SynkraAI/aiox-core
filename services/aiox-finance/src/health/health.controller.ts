import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

interface HealthResponse {
  status: string;
  timestamp: string;
  db?: {
    connected: boolean;
    message?: string;
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const dbStatus = await this.healthService.checkDb();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: dbStatus,
    };
  }
}
