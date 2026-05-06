/**
 * S-8.6 / Epic 8 Closure Gate Harness (2026-04-17)
 *
 * Final closure sweep — axe 5 routes + Lighthouse mobile 5 routes + reduced-motion
 * audit 5 routes + view-transition reduced-motion probe. Outputs raw JSON artifacts
 * consumed by EPIC-8-CLOSURE.md, s-8.6-fwa-scorecard.md, s-8.6-lighthouse-final.json,
 * s-8.6-axe-final.json.
 *
 * Run: node tests/qa/s-8.6-closure-gate.mjs
 */

import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const QA_DIR = path.join(ROOT, 'docs', 'qa')
const BASE = 'http://localhost:3000'

const ROUTES = [
  { name: 'home', url: '/' },
  { name: 'colecao', url: '/colecao' },
  { name: 'product-tenro-luxo', url: '/colecao/tenro-luxo' },
  { name: 'atelier', url: '/atelier' },
  { name: 'contato', url: '/contato' },
]

const MOTION_ANIM_WHITELIST = new Set([
  'entrance-fade-up-tight',
  'entrance-fade-up-medium',
  'entrance-fade-up-relaxed',
  'entrance-fade-in',
  'product-reveal',
  'gold-separator-draw',
])

const results = {
  timestamp: new Date().toISOString(),
  kind: 's-8.6-closure-gate',
  stories: ['S-8.1', 'S-8.2', 'S-8.3', 'S-8.4', 'S-8.5a', 'S-8.5b', 'S-8.6'],
  axe: {},
  lighthouse: [],
  reducedMotion: {},
  viewTransitions: {},
  errors: [],
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function runAxeForRoute(browser, route) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + route.url, { waitUntil: 'networkidle' })
    // For /atelier with chapter-target transitions, scroll to settle all chapters
    // into .is-active state (since FIX-2b made default opacity=1, but we still want
    // to exercise GSAP ScrollTrigger path).
    if (route.name === 'atelier') {
      for (const y of [0, 600, 1200, 1800, 2400, 3000, 3600, 4200]) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y)
        await page.waitForTimeout(80)
      }
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(300)
    } else {
      // Small settle for motion-bearing routes
      await page.waitForTimeout(300)
    }

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const sev = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    for (const v of axe.violations) {
      if (sev[v.impact] !== undefined) sev[v.impact] += v.nodes.length
    }

    // Classify serious violations by category for backlog mapping
    const seriousViolations = axe.violations
      .filter((v) => v.impact === 'serious')
      .flatMap((v) =>
        v.nodes.map((n) => ({
          rule: v.id,
          target: n.target?.[0],
          html: n.html?.slice(0, 200),
          failureSummary: n.failureSummary?.slice(0, 300),
        })),
      )

    return {
      route: route.name,
      url: route.url,
      severity: sev,
      totalViolations: axe.violations.reduce((acc, v) => acc + v.nodes.length, 0),
      seriousViolations,
      passCount: axe.passes.length,
      incompleteCount: axe.incomplete.length,
    }
  } catch (err) {
    return { route: route.name, error: err.message }
  } finally {
    await ctx.close()
  }
}

async function runReducedMotionForRoute(browser, route) {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + route.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)

    const audit = await page.evaluate(() => {
      const durToMs = (d) => {
        if (!d) return 0
        return d
          .split(',')
          .map((s) => s.trim())
          .map((t) => {
            if (t.endsWith('ms')) return parseFloat(t)
            if (t.endsWith('s')) return parseFloat(t) * 1000
            return 0
          })
          .reduce((a, b) => Math.max(a, b), 0)
      }

      const surfaces = [
        { name: 'hero-h1', selectors: ['.hero-h1'] },
        { name: 'hero-label', selectors: ['.hero-label'] },
        { name: 'hero-subtitle', selectors: ['.hero-subtitle'] },
        { name: 'hero-ctas', selectors: ['.hero-ctas'] },
        { name: 'hero-scroll-indicator', selectors: ['.hero-scroll-indicator'] },
        { name: 'product-reveal-target', selectors: ['.product-reveal-target'] },
        { name: 'chapter-target', selectors: ['.chapter-target'] },
        { name: 'product-card-image', selectors: ['.product-card-image'] },
      ]

      const sampled = []
      for (const s of surfaces) {
        const nodes = Array.from(document.querySelectorAll(s.selectors.join(',')))
        for (let i = 0; i < Math.min(nodes.length, 5); i++) {
          const el = nodes[i]
          const cs = getComputedStyle(el)
          sampled.push({
            surface: s.name,
            index: i,
            animationName: cs.animationName,
            animationDuration: cs.animationDuration,
            animationDurationMs: durToMs(cs.animationDuration),
            transitionDuration: cs.transitionDuration,
            transitionDurationMs: durToMs(cs.transitionDuration),
            opacity: cs.opacity,
            transform: cs.transform,
          })
        }
      }

      // View-transition probe — Next.js 16 may insert ::view-transition-* pseudos
      // We can't read pseudos directly, but we can read the <html> element's
      // view-transition-name + any ::view-transition-group/old/new supported query via
      // Playwright's built-in getAnimations subtree.
      const vtAnims = document.getAnimations({ subtree: true })
        .map((a) => ({
          name: a.animationName || null,
          playState: a.playState,
          duration: (a.effect?.getComputedTiming?.().duration) || null,
          target: a.effect?.target?.tagName || null,
        }))
        .filter((a) => a.name === null || (a.name && /view-transition|::view/.test(a.name)))

      return { sampled, viewTransitionAnims: vtAnims }
    })

    // Count offenders: any sampled element with animation >10ms, transition >10ms, transform !== none, or opacity < 0.99
    const offenders = audit.sampled.filter((s) => {
      if (s.animationName && s.animationName !== 'none' && s.animationDurationMs > 10) return true
      if (s.transitionDurationMs > 10) return true
      if (s.transform && s.transform !== 'none') return true
      if (s.opacity !== undefined && parseFloat(s.opacity) < 0.99) return true
      return false
    })

    return {
      route: route.name,
      sampledCount: audit.sampled.length,
      offenderCount: offenders.length,
      offenders,
      viewTransitionAnims: audit.viewTransitionAnims,
    }
  } catch (err) {
    return { route: route.name, error: err.message }
  } finally {
    await ctx.close()
  }
}

async function runScarcityForRoute(browser, route) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + route.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)

    const whitelist = Array.from(MOTION_ANIM_WHITELIST)
    const samples = []
    const scrollPositions = [0, 400, 800, 1200, 1600, 2000, 2400, 2800]
    for (const y of scrollPositions) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      await page.waitForTimeout(80)
      const counted = await page.evaluate((wl) => {
        const wlSet = new Set(wl)
        const all = document.getAnimations({ subtree: true })
        const running = all.filter((a) => a.playState === 'running')
        const filtered = running.filter((a) => {
          const name = a.animationName || ''
          return wlSet.has(name)
        })
        const chapterTransitioning = Array.from(document.querySelectorAll('.chapter-target'))
          .filter((el) => {
            const cs = getComputedStyle(el)
            const op = parseFloat(cs.opacity)
            return op > 0.3 && op < 0.99
          }).length
        return {
          total_getAnimations: all.length,
          running_motion_system: filtered.length,
          chapter_transitions_inflight: chapterTransitioning,
          simultaneous: filtered.length + chapterTransitioning,
        }
      }, whitelist)
      samples.push({ scrollY: y, ...counted })
    }

    const maxSimul = Math.max(...samples.map((s) => s.simultaneous))
    return {
      route: route.name,
      samples,
      maxSimultaneous: maxSimul,
      verdict: maxSimul <= 3 ? 'PASS' : `FAIL (max=${maxSimul})`,
    }
  } catch (err) {
    return { route: route.name, error: err.message }
  } finally {
    await ctx.close()
  }
}

async function main() {
  await ensureDir(QA_DIR)
  const browser = await chromium.launch({ headless: true })

  // ==========================================================
  // PART A — axe-core sweep on 5 routes
  // ==========================================================
  console.log('[closure] PART A — axe-core 5 routes…')
  for (const route of ROUTES) {
    const r = await runAxeForRoute(browser, route)
    results.axe[route.name] = r
    if (r.severity) {
      console.log(`[closure]   ${route.name}: C=${r.severity.critical} S=${r.severity.serious} M=${r.severity.moderate} N=${r.severity.minor}`)
    } else {
      console.log(`[closure]   ${route.name}: ERROR ${r.error}`)
    }
  }

  // ==========================================================
  // PART B — reduced-motion sweep on 5 routes
  // ==========================================================
  console.log('[closure] PART B — reduced-motion 5 routes…')
  for (const route of ROUTES) {
    const r = await runReducedMotionForRoute(browser, route)
    results.reducedMotion[route.name] = r
    if (r.offenderCount !== undefined) {
      console.log(`[closure]   ${route.name}: offenders=${r.offenderCount}/${r.sampledCount} vtAnims=${r.viewTransitionAnims.length}`)
    } else {
      console.log(`[closure]   ${route.name}: ERROR ${r.error}`)
    }
  }

  // ==========================================================
  // PART C — scarcity-of-motion on the 3 routes with motion
  // ==========================================================
  console.log('[closure] PART C — scarcity-of-motion…')
  const scarcityRoutes = ROUTES.filter((r) => ['home', 'colecao', 'atelier'].includes(r.name))
  results.scarcity = {}
  for (const route of scarcityRoutes) {
    const r = await runScarcityForRoute(browser, route)
    results.scarcity[route.name] = r
    console.log(`[closure]   ${route.name}: max=${r.maxSimultaneous} ${r.verdict}`)
  }

  await browser.close()

  // ==========================================================
  // PART D — Lighthouse mobile on 5 routes
  // ==========================================================
  console.log('[closure] PART D — Lighthouse mobile 5 routes…')
  let lighthouse, launchChrome
  try {
    const lh = await import('lighthouse')
    lighthouse = lh.default || lh
    const cl = await import('chrome-launcher')
    launchChrome = cl.launch
  } catch (err) {
    console.error('[closure] Lighthouse import failed:', err.message)
    results.errors.push({ part: 'lighthouse-import', error: err.message })
  }

  if (lighthouse && launchChrome) {
    const chrome = await launchChrome({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] })
    const lhConfig = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2, disabled: false },
      throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
    }
    for (const route of ROUTES) {
      try {
        const runnerResult = await lighthouse(BASE + route.url, lhConfig)
        const cats = runnerResult.lhr.categories
        const scores = {
          name: route.name,
          url: route.url,
          performance: Math.round((cats.performance?.score ?? 0) * 100),
          accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
          'best-practices': Math.round((cats['best-practices']?.score ?? 0) * 100),
          seo: Math.round((cats.seo?.score ?? 0) * 100),
          LCP_ms: runnerResult.lhr.audits['largest-contentful-paint']?.numericValue,
          LCP_display: runnerResult.lhr.audits['largest-contentful-paint']?.displayValue,
          CLS: runnerResult.lhr.audits['cumulative-layout-shift']?.numericValue,
          CLS_display: runnerResult.lhr.audits['cumulative-layout-shift']?.displayValue,
          TBT_ms: runnerResult.lhr.audits['total-blocking-time']?.numericValue,
          TBT_display: runnerResult.lhr.audits['total-blocking-time']?.displayValue,
        }
        results.lighthouse.push(scores)
        console.log(`[closure]   LH ${route.name}: P=${scores.performance} A=${scores.accessibility} BP=${scores['best-practices']} SEO=${scores.seo} LCP=${scores.LCP_display} CLS=${scores.CLS_display}`)
      } catch (err) {
        results.errors.push({ part: 'lighthouse-run', url: route.url, error: err.message })
      }
    }
    try { await chrome.kill() } catch (e) { /* ignore */ }
  }

  // ==========================================================
  // Write artifacts
  // ==========================================================
  const mainOut = path.join(QA_DIR, 's-8.6-closure-findings.json')
  await fs.writeFile(mainOut, JSON.stringify(results, null, 2))
  console.log(`\n[closure] Wrote ${mainOut}`)

  // Dedicated sub-artifacts per deliverable spec
  const axeOut = path.join(QA_DIR, 's-8.6-axe-final.json')
  await fs.writeFile(axeOut, JSON.stringify({ timestamp: results.timestamp, axe: results.axe }, null, 2))

  const lhOut = path.join(QA_DIR, 's-8.6-lighthouse-final.json')
  await fs.writeFile(lhOut, JSON.stringify({ timestamp: results.timestamp, lighthouse: results.lighthouse }, null, 2))

  console.log(`[closure] Wrote ${axeOut}`)
  console.log(`[closure] Wrote ${lhOut}`)

  console.log('\n===== CLOSURE GATE SUMMARY =====')
  console.log('Axe per-route serious:')
  for (const [name, r] of Object.entries(results.axe)) {
    console.log(`  ${name}: ${r.severity?.serious ?? 'ERR'} serious, ${r.severity?.critical ?? 'ERR'} critical`)
  }
  console.log('Lighthouse per-route (P/A/BP/SEO):')
  for (const s of results.lighthouse) {
    console.log(`  ${s.name}: ${s.performance}/${s.accessibility}/${s['best-practices']}/${s.seo} LCP=${s.LCP_display} CLS=${s.CLS_display}`)
  }
  console.log('Reduced-motion offenders per-route:')
  for (const [name, r] of Object.entries(results.reducedMotion)) {
    console.log(`  ${name}: ${r.offenderCount ?? 'ERR'} offenders, ${r.viewTransitionAnims?.length ?? 0} vt-anims`)
  }
  if (results.errors.length) console.log('Errors:', results.errors)
}

main().catch((e) => {
  console.error('[closure] FATAL', e)
  process.exit(1)
})
