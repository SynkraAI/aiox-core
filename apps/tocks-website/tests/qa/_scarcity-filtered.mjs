/**
 * Re-measure scarcity-of-motion, filtering OUT infinite skeleton loaders
 * (shimmer, spinner-style). True scarcity metric: count SIMULTANEOUS
 * motion-system animations only.
 *
 * Val-head / Tobias rule: ≤3 motion-system events animating at once.
 * Skeleton/shimmer are indicator animations — separate class (always-on).
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const MOTION_SYSTEM_NAMES = new Set([
  'entrance-fade-up-tight',
  'entrance-fade-up-medium',
  'entrance-fade-up-relaxed',
  'entrance-fade-in',
  'product-reveal',
  'gold-separator-draw',
  'fade-out-slight',
  'fade-in-up-slight',
])

const browser = await chromium.launch({ headless: true })

// Test on multiple routes
for (const route of ['/', '/colecao', '/atelier']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  const samples = []
  const positions = [0, 400, 800, 1200, 1600, 2000, 2400, 3000]
  for (const y of positions) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(200)
    const counted = await page.evaluate((motionNames) => {
      const all = document.getAnimations({ subtree: true })
      const running = all.filter((a) => a.playState === 'running')
      // Motion-system animations
      const motionSystem = running.filter((a) => motionNames.includes(a.animationName))
      // Chapter-target transitions (different from animations — detect via element class + ongoing transition)
      const chapterTransitioning = Array.from(document.querySelectorAll('.chapter-target')).filter((el) => {
        const cs = getComputedStyle(el)
        return cs.transitionDuration !== '0s' && parseFloat(cs.opacity) > 0.3 && parseFloat(cs.opacity) < 1
      }).length
      return {
        totalRunning: running.length,
        motionSystemCount: motionSystem.length,
        chapterTransitioning,
        motionSnapshots: motionSystem.slice(0, 5).map((a) => a.animationName),
      }
    }, [...MOTION_SYSTEM_NAMES])
    samples.push({ scrollY: y, ...counted })
  }
  const maxMotion = Math.max(...samples.map((s) => s.motionSystemCount + s.chapterTransitioning))
  console.log(`\n=== ${route} — max simultaneous motion-system anims = ${maxMotion} ===`)
  for (const s of samples) {
    console.log(`  y=${String(s.scrollY).padStart(4)} motionSys=${s.motionSystemCount} chapterTrans=${s.chapterTransitioning} totalRunning=${s.totalRunning} snaps=${s.motionSnapshots.join(',')}`)
  }
  await ctx.close()
}

await browser.close()
