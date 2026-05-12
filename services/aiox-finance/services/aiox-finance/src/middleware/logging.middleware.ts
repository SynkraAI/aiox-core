import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      const logMessage = `[${method}] ${originalUrl} ${statusCode} ${duration}ms ${ip}`;

      if (level === 'error') {
        console.error(`❌ ${logMessage}`);
      } else if (level === 'warn') {
        console.warn(`⚠️  ${logMessage}`);
      } else {
        console.log(`✅ ${logMessage}`);
      }
    });

    next();
  }
}
