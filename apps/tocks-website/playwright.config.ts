import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for S-7.3 Chunk A QA scripts.
 * Dev server is started manually (not via webServer) to avoid OOM in main process.
 */
export default defineConfig({
  testDir: './tests/qa',
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
