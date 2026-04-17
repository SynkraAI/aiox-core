/**
 * S-7.3 / AC-5 — Visual regression screenshot capture (Chunk B).
 *
 * Captures fullPage screenshots at 1440x900 for each of the 3 pages and writes them to
 * docs/qa/visual/{home,produto,contato}-current.png.
 *
 * Pixel diff against approved-variants/*.png is computed by a separate Node script
 * (`scripts/qa/visual-diff.mjs`) to keep the Playwright session free of pngjs/pixelmatch
 * buffers — Chunk B previously OOM'd when bundled.
 */
import { test } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

test.describe.configure({ mode: 'serial' })

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'produto', url: '/colecao/tenro-luxo' },
  { name: 'contato', url: '/contato' },
] as const

const VIEWPORT = { width: 1440, height: 900 }
const OUT_DIR = path.join(process.cwd(), 'docs', 'qa', 'visual')

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true })
})

for (const p of PAGES) {
  test(`screenshot: ${p.name}`, async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto(p.url, { waitUntil: 'networkidle' })
    // Disable animations / motion to stabilize the capture.
    await page.addStyleTag({
      content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
    })
    // Allow any deferred fonts/images to settle.
    await page.waitForTimeout(800)

    const outPath = path.join(OUT_DIR, `${p.name}-current.png`)
    await page.screenshot({ path: outPath, fullPage: true })
  })
}
