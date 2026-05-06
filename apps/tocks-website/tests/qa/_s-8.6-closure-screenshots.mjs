/**
 * S-8.6 closure screenshots — 5 routes × desktop (1440) + mobile (375)
 * Run: node tests/qa/_s-8.6-closure-screenshots.mjs
 */

import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const OUT_DIR = path.join(ROOT, 'docs', 'qa', 's-8.6-closure-screens')
const BASE = 'http://localhost:3000'

const ROUTES = [
  { name: 'home', url: '/' },
  { name: 'colecao', url: '/colecao' },
  { name: 'product-tenro-luxo', url: '/colecao/tenro-luxo' },
  { name: 'atelier', url: '/atelier' },
  { name: 'contato', url: '/contato' },
]

const VIEWPORTS = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'mobile', w: 375, h: 812 },
]

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
    const page = await ctx.newPage()
    for (const route of ROUTES) {
      await page.goto(BASE + route.url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      const outPath = path.join(OUT_DIR, `${route.name}-${vp.name}.png`)
      await page.screenshot({ path: outPath, fullPage: false })
      console.log(`[shot] ${route.name}-${vp.name}: ${outPath}`)
    }
    await ctx.close()
  }
  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
