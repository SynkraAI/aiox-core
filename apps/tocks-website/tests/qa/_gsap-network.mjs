/**
 * Verify GSAP dynamic import: confirm it IS loaded on /atelier and NOT on /.
 * My first harness used URL regex /gsap|ScrollTrigger/ which matches module names
 * in Webpack chunks. But bundled Next builds may name chunks with hashes only.
 * Cross-check via window.gsap presence after page load.
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })

for (const route of ['/', '/atelier']) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const allRequests = []
  page.on('request', (req) => {
    const url = req.url()
    if (url.includes('/_next/static/chunks/')) allRequests.push(url)
  })
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, 500))
  await page.waitForTimeout(1500)

  // Check if gsap module ended up anywhere by inspecting runtime
  const gsapPresence = await page.evaluate(() => {
    // gsap modules (v3) don't attach to window by default — they're ESM-imported.
    // Instead check if any chapter-target has been through ScrollTrigger.
    const hasActiveChapter = document.querySelector('.chapter-target.is-active') !== null
    return { hasActiveChapter }
  })

  console.log(`\n=== ${route} ===`)
  console.log(`  chunks loaded: ${allRequests.length}`)
  console.log(`  is-active observed: ${gsapPresence.hasActiveChapter}`)
  // Print unique chunk URLs; GSAP chunk name varies but check sizes or identifiers
  const chunkNames = allRequests.map((u) => u.split('/').pop()).filter((n, i, a) => a.indexOf(n) === i)
  console.log(`  unique chunks: ${chunkNames.length}`)
  await ctx.close()
}

await browser.close()
