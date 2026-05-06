/**
 * Run axe against atelier with chapters FULLY stabilized at opacity 1.
 * Uses CSS override via <style> injection to force !important and disable
 * transitions entirely. This isolates TRUE structural WCAG violations.
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

// Inject override stylesheet to force chapters visible, transitions disabled
await page.addStyleTag({
  content: `
    .chapter-target {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  `,
})
await page.waitForTimeout(600)

// Verify override took
const opacity = await page.evaluate(() => {
  const first = document.querySelector('.chapter-target')
  return first ? getComputedStyle(first).opacity : null
})
console.log('Chapter-target opacity after override:', opacity)

const r = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
const cc = r.violations.find((v) => v.id === 'color-contrast')
console.log('\n=== ATELIER axe WITH opacity override ===')
console.log('color-contrast nodes:', cc?.nodes?.length ?? 0)

if (cc) {
  const groups = new Map()
  for (const n of cc.nodes) {
    const key = (n.html?.match(/<(\w+)[^>]*class="([^"]*)"/)?.slice(1, 3).join('|') ?? n.html.slice(0, 60)).slice(0, 120)
    if (!groups.has(key)) groups.set(key, { count: 0, sample: n })
    groups.get(key).count++
  }
  for (const [key, g] of [...groups.entries()].sort((a, b) => b[1].count - a[1].count)) {
    const d = g.sample.any?.[0]?.data
    console.log(`\n× ${g.count} — ${g.sample.target?.[0] || key.slice(0, 80)}`)
    console.log('  html:', g.sample.html?.slice(0, 160))
    if (d) console.log('  fg:', d.fgColor, 'bg:', d.bgColor, 'ratio:', d.contrastRatio)
  }
}

console.log('\n=== Other violations ===')
for (const v of r.violations) {
  if (v.id === 'color-contrast') continue
  console.log(`- ${v.id} (${v.impact}): ${v.nodes.length}`)
}

await ctx.close()
await browser.close()
