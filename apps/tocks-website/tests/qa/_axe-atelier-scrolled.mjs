/**
 * Verify hypothesis: axe sees chapter-target pre-active (opacity:0.3). After scroll
 * triggers .is-active, ratios should return to 15.2:1 and violations disappear.
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

// Initial counts (pre-scroll)
let r = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
let cc = r.violations.find((v) => v.id === 'color-contrast')
console.log('Pre-scroll color-contrast nodes:', cc?.nodes?.length ?? 0)

// Scroll so all chapters enter viewport and gain .is-active (GSAP toggles on enter)
const scrollPositions = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]
for (const y of scrollPositions) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(600)
}
// Scroll back to make chapter-target 1 (lead) also reach is-active if onEnterBack fires
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(400)
// Then scroll back down mid-page
await page.evaluate(() => window.scrollTo(0, 1500))
await page.waitForTimeout(600)

// Check is-active count
const isActiveCount = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('.chapter-target'))
  return all.map((el, i) => ({
    index: i,
    hasIsActive: el.classList.contains('is-active'),
    opacity: getComputedStyle(el).opacity,
  }))
})
console.log('is-active per chapter:', isActiveCount)

// Re-run axe (stay scrolled where most chapters active)
r = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
cc = r.violations.find((v) => v.id === 'color-contrast')
console.log('Post-scroll color-contrast nodes:', cc?.nodes?.length ?? 0)
if (cc && cc.nodes.length > 0 && cc.nodes.length < 20) {
  for (const n of cc.nodes) {
    console.log('  html:', n.html?.slice(0, 120))
    if (n.any?.[0]?.data) {
      const d = n.any[0].data
      console.log('    fg:', d.fgColor, 'bg:', d.bgColor, 'ratio:', d.contrastRatio)
    }
  }
}

await ctx.close()
await browser.close()
