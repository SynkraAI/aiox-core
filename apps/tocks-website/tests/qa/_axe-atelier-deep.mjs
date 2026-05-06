/**
 * Deep drill-down on atelier axe color-contrast — enumerate ALL 48 nodes
 * to identify root cause beyond Logo "Custom" span.
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'

const BASE = 'http://localhost:3000'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

const r = await new AxeBuilder({ page }).withTags(['wcag2aa', 'wcag22aa']).analyze()
const v = r.violations.find((x) => x.id === 'color-contrast')
if (!v) {
  console.log('No color-contrast violations (!)')
  process.exit(0)
}
console.log(`color-contrast nodes: ${v.nodes.length}`)

// Group by html pattern
const groups = new Map()
for (const n of v.nodes) {
  const html = n.html?.slice(0, 120) || ''
  // extract the element tag + first class
  const key = html.match(/<(\w+)[^>]*class="([^"]*)"/)?.slice(1, 3).join('|') ?? html.slice(0, 60)
  if (!groups.has(key)) groups.set(key, { count: 0, sample: n, html })
  groups.get(key).count++
}
const sorted = [...groups.entries()].sort((a, b) => b[1].count - a[1].count)
for (const [key, g] of sorted) {
  console.log(`\n× ${g.count} nodes — ${key}`)
  console.log('  target:', g.sample.target?.[0])
  console.log('  html:  ', g.sample.html?.slice(0, 200))
  if (g.sample.any?.[0]?.data) {
    const d = g.sample.any[0].data
    console.log('  fg:', d.fgColor, ' bg:', d.bgColor, ' ratio:', d.contrastRatio, ' fontSize:', d.fontSize, ' fontWeight:', d.fontWeight)
  }
}

await fs.writeFile('docs/qa/s-8.4-axe-deep.json', JSON.stringify(v.nodes, null, 2))
console.log('\nWrote docs/qa/s-8.4-axe-deep.json')

await ctx.close()
await browser.close()
