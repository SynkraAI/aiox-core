/**
 * Inspect actual computed bg stack on an offending text element to understand
 * why axe reports bg as #72706e instead of #F5F0E6 (bone-paper).
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

await page.evaluate(() => {
  for (const el of document.querySelectorAll('.chapter-target')) {
    el.classList.add('is-active')
    el.style.opacity = '1'
    el.style.transform = 'none'
  }
})
await page.waitForTimeout(400)

const inspect = await page.evaluate(() => {
  // Look for the 'Peroba Rosa' text
  const target = Array.from(document.querySelectorAll('span')).find((s) => s.textContent?.includes('Peroba Rosa'))
  if (!target) return { found: false }
  const out = []
  let el = target
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el)
    out.push({
      tag: el.tagName,
      className: el.className?.toString().slice(0, 80),
      bg: cs.backgroundColor,
      color: cs.color,
      opacity: cs.opacity,
      position: cs.position,
    })
    el = el.parentElement
  }
  return { found: true, stack: out }
})
console.log(JSON.stringify(inspect, null, 2))

await ctx.close()
await browser.close()
