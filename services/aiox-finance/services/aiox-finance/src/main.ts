import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@src/filters/http-exception.filter';
import { LoggingMiddleware } from '@src/middleware/logging.middleware';

function validateEnvVars() {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  try {
    validateEnvVars();
  } catch (error) {
    console.error(`❌ Startup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 3000;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

  // Enable CORS for frontend
  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Apply global error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply logging middleware
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));

  await app.listen(PORT);
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for ${FRONTEND_URL}`);
  console.log(`✅ Graceful shutdown configured (10s timeout)`);

  // Graceful shutdown
  const SHUTDOWN_TIMEOUT = 10000;
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    const shutdownTimer = setTimeout(() => {
      console.error('❌ Force shutdown after 10s timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    await app.close();
    clearTimeout(shutdownTimer);
    console.log('✅ Shutdown complete');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    await app.close();
    console.log('✅ Shutdown complete');
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error instanceof Error ? error.message : error);
  process.exit(1);
});
