/**
 * Force all .chapter-target → .is-active. Re-run axe. This isolates TRUE WCAG
 * violations from the opacity-0.3-pre-active transient state.
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

// Force activate all chapters
await page.evaluate(() => {
  for (const el of document.querySelectorAll('.chapter-target')) {
    el.classList.add('is-active')
    el.style.opacity = '1'
    el.style.transform = 'none'
  }
})
await page.waitForTimeout(200)

const r = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
const cc = r.violations.find((v) => v.id === 'color-contrast')
console.log('\n=== ATELIER axe WITH all chapters FORCED is-active ===')
console.log('color-contrast nodes:', cc?.nodes?.length ?? 0)

if (cc) {
  const groups = new Map()
  for (const n of cc.nodes) {
    const key = (n.html?.match(/<(\w+)[^>]*class="([^"]*)"/)?.slice(1, 3).join('|') ?? n.html.slice(0, 60)).slice(0, 120)
    if (!groups.has(key)) groups.set(key, { count: 0, sample: n })
    groups.get(key).count++
  }
  for (const [key, g] of [...groups.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`\n× ${g.count} — ${key}`)
    console.log('  html:', g.sample.html?.slice(0, 160))
    if (g.sample.any?.[0]?.data) {
      const d = g.sample.any[0].data
      console.log('  fg:', d.fgColor, '  bg:', d.bgColor, '  ratio:', d.contrastRatio)
    }
  }
}

// Also check all other violation rules
console.log('\n=== All other violations ===')
for (const v of r.violations) {
  if (v.id === 'color-contrast') continue
  console.log(`- ${v.id} (${v.impact}): ${v.nodes.length} nodes — ${v.description}`)
}

await ctx.close()
await browser.close()
