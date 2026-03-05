import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E configuration — Story E4.6 (AC-1, AC-9)
 *
 * Browsers: Chromium (desktop) + Mobile Chrome
 * Screenshots/video: on failure only
 * HTML reporter: playwright-report/
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,

  /* Reporter: HTML to playwright-report/ (AC-9) */
  reporter: [
    ['html', { outputFolder: '../../playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',

    /* Screenshots on failure (AC-9) */
    screenshot: 'only-on-failure',

    /* Video on failure (AC-9) */
    video: 'on-first-retry',
  },

  projects: [
    /* Desktop Chromium */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Mobile Chrome (AC-1) */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
