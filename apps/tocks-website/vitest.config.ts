import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vitest config — S-7.3 Chunk C unit coverage.
 *
 * Scope is intentionally narrow: 6 critical components from S-7.1/S-7.2.
 * Coverage is gathered ONLY for those files to keep the report tractable
 * and avoid memory bloat (Chunk C runs after Lighthouse / Playwright sweeps).
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'src/components/atoms/text-pair.tsx',
        'src/components/molecules/step-indicator.tsx',
        'src/components/molecules/swatch-picker.tsx',
        'src/components/molecules/form-field.tsx',
        'src/components/molecules/faq-item.tsx',
        'src/components/organisms/concierge-form.tsx',
      ],
      thresholds: {
        // Soft target — known waivers for concierge-form (Server Action coupled, jsdom limitation)
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
