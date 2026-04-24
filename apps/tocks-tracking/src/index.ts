/**
 * Tocks Tracking — entry point.
 *
 * Starts the HTTP server and handles graceful shutdown on SIGTERM/SIGINT.
 */

import { createModuleLogger } from './logger.js';
import { startServer } from './server.js';

const log = createModuleLogger('bootstrap');

async function main(): Promise<void> {
  try {
    const { close } = await startServer();

    const shutdown = async (signal: string): Promise<void> => {
      log.info({ signal }, 'Graceful shutdown initiated');
      try {
        await close();
      } catch (err) {
        log.error(
          { error: err instanceof Error ? err.message : 'unknown' },
          'Error during shutdown',
        );
        process.exit(1);
      }
      process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err) {
    log.fatal(
      { error: err instanceof Error ? err.message : 'unknown' },
      'Failed to start server — exiting',
    );
    process.exit(1);
  }
}

void main();
