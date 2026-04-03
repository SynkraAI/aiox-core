#!/usr/bin/env node

/**
 * Cross-platform Jest wrapper that sets --experimental-vm-modules
 * so `npx jest` and `node bin/jest.js` work without manual flags.
 *
 * Usage:
 *   node bin/jest.js [jest-args...]
 *   npx jest (via package.json bin)
 */

import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jestBin = resolve(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js');

const args = ['--experimental-vm-modules', jestBin, '--config', 'jest.config.cjs', ...process.argv.slice(2)];

try {
  execFileSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
    env: process.env,
  });
} catch (error) {
  process.exit(error.status || 1);
}
