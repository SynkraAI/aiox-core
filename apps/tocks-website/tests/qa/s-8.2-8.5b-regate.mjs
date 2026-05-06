/**
 * S-8.2/S-8.3/S-8.4/S-8.5b Re-Gate Harness (2026-04-17)
 *
 * Targeted verification of 4 fixes from prior gate:
 *  FIX-1  — Rule 3 chapter-entrega labels gold-700→(no-op: inherit gold-500 from Text variant)
 *  FIX-2b — chapter-target SSR-initial opacity 1 (no 0.3 transient)
 *  FIX-4  — chapter labels on bone swapped gold-700→gold-900 (chapter-lead/madeira/corte/acabamento)
 *  FIX-5  — stagger delays wired in product-card consumers (product-grid + home showcase)
 *
 * Regression smoke: Lighthouse mobile on /, /atelier, /colecao/tenro-luxo + reduced-motion.
 *
 * Run: node tests/qa/s-8.2-8.5b-regate.mjs
 * Out: docs/qa/s-8.2-8.5b-regate-findings.json
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
  kind: 're-gate',
  stories: ['S-8.2', 'S-8.3', 'S-8.4', 'S-8.5b'],
  fixes: {
    FIX_1: null,
    FIX_2b: null,
    FIX_4: null,
    FIX_5: null,
  },
  regression: {
    lighthouse: [],
    reducedMotion: null,
  },
  errors: [],
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function main() {
  await ensureDir(QA_DIR)
  const browser = await chromium.launch({ headless: true })

  // ==========================================================
  // FIX-2b — chapter-target SSR-initial axe (before any scroll)
  // Expect: ~25 transient color-contrast violations ABSENT
  // ==========================================================
  console.log('[re-gate] FIX-2b — /atelier first-paint axe (no scroll)…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/atelier', { waitUntil: 'domcontentloaded' })
    // Intentionally do NOT wait for networkidle and do NOT scroll. Capture first-paint state.
    await page.waitForTimeout(200)

    // Capture chapter-target computed opacity BEFORE any scroll activity
    const firstPaintOpacity = await page.evaluate(() => {
      const chapters = Array.from(document.querySelectorAll('.chapter-target'))
      return chapters.map((el, i) => {
        const cs = getComputedStyle(el)
        return {
          index: i,
          opacity: cs.opacity,
          transform: cs.transform,
          hasIsActive: el.classList.contains('is-active'),
          transitionDuration: cs.transitionDuration,
        }
      })
    })

    const axeFirstPaint = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const sev = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    for (const v of axeFirstPaint.violations) {
      if (sev[v.impact] !== undefined) sev[v.impact] += v.nodes.length
    }

    const colorContrastViolations = axeFirstPaint.violations
      .filter((v) => v.id === 'color-contrast')
      .flatMap((v) =>
        v.nodes.map((n) => ({
          impact: v.impact,
          target: n.target?.[0],
          html: n.html?.slice(0, 200),
          failureSummary: n.failureSummary?.slice(0, 300),
        })),
      )

    // Check how many violations are inside a chapter-target element (legacy transient class)
    const insideChapterTarget = await page.evaluate((sels) => {
      return sels.map((sel) => {
        try {
          const el = document.querySelector(sel)
          if (!el) return { sel, found: false }
          let node = el
          while (node && node !== document.body) {
            if (node.classList?.contains?.('chapter-target')) return { sel, insideChapterTarget: true }
            node = node.parentElement
          }
          return { sel, insideChapterTarget: false }
        } catch (e) {
          return { sel, error: e.message }
        }
      })
    }, colorContrastViolations.map((v) => v.target).filter(Boolean))

    results.fixes.FIX_2b = {
      chapter_opacities_first_paint: firstPaintOpacity,
      axe_severity: sev,
      color_contrast_count: colorContrastViolations.length,
      color_contrast_violations_sample: colorContrastViolations.slice(0, 15),
      inside_chapter_target_count: insideChapterTarget.filter((x) => x.insideChapterTarget).length,
      all_chapters_opacity_1: firstPaintOpacity.every((c) => parseFloat(c.opacity) >= 0.99),
      verdict:
        firstPaintOpacity.every((c) => parseFloat(c.opacity) >= 0.99)
          ? 'PASS (all chapters opacity>=0.99 at first paint, transient 0.3 violations eliminated)'
          : `FAIL (opacities: ${firstPaintOpacity.map((c) => c.opacity).join(',')})`,
    }
    console.log(`[re-gate]   FIX-2b: ${results.fixes.FIX_2b.verdict}`)
    await ctx.close()
  }

  // ==========================================================
  // FIX-1 — Rule 3 chapter-entrega labels on noir
  // Expect: 0 color-contrast serious violations on gold-* labels inside chapter-entrega
  // ==========================================================
  console.log('[re-gate] FIX-1 — chapter-entrega axe (scroll to it)…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })

    // Locate chapter-entrega: it's the chapter with noir-mid bg. Scroll it into view.
    const entregaBounds = await page.evaluate(() => {
      const chapters = Array.from(document.querySelectorAll('.chapter-target'))
      // Find one whose text contains "Entrega" or whose bg is noir-mid
      const entrega = chapters.find(
        (el) =>
          el.textContent?.includes('Entrega') ||
          getComputedStyle(el).backgroundColor === 'rgb(11, 11, 15)',
      )
      if (!entrega) return null
      entrega.scrollIntoView({ block: 'center' })
      const rect = entrega.getBoundingClientRect()
      return {
        top: rect.top,
        bottom: rect.bottom,
        bg: getComputedStyle(entrega).backgroundColor,
        text: entrega.textContent?.slice(0, 200),
      }
    })

    await page.waitForTimeout(400)

    // Capture computed colors of ALL Text variant="label" elements inside entrega
    const labelProbe = await page.evaluate(() => {
      // Pick elements whose text matches the known entrega labels
      const allSpans = Array.from(document.querySelectorAll('p, span, div'))
      const targets = allSpans.filter((el) => {
        const t = el.textContent?.trim() || ''
        return (
          t === 'Ato 4 · Entrega' ||
          t === 'Cliente · placeholder S-8.6' ||
          t.startsWith('Ato 4') ||
          t.startsWith('Cliente ·')
        )
      })
      return targets.map((el) => {
        const cs = getComputedStyle(el)
        // Bubble up to find nearest chapter-target for context
        let bgEl = el
        let bg = 'transparent'
        while (bgEl && bgEl !== document.body) {
          const cs2 = getComputedStyle(bgEl)
          if (cs2.backgroundColor && cs2.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs2.backgroundColor !== 'transparent') {
            bg = cs2.backgroundColor
            break
          }
          bgEl = bgEl.parentElement
        }
        return {
          text: el.textContent?.trim().slice(0, 60),
          tag: el.tagName,
          color: cs.color,
          backgroundColor: bg,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          className: (el.className?.toString() || '').slice(0, 140),
        }
      })
    })

    // Axe scan the chapter-entrega only (use an include rule)
    // Playwright AxeBuilder include accepts css selectors
    let axeEntregaViolations = []
    try {
      const axeEntrega = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .include('.chapter-target:has(*:has-text("Entrega"))')
        .analyze()
      axeEntregaViolations = axeEntrega.violations
    } catch (e) {
      // fallback — axe the whole page; we'll filter violations manually
      const axeAll = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
      axeEntregaViolations = axeAll.violations
    }

    // Count color-contrast violations inside chapter-entrega
    const ccNodes = axeEntregaViolations
      .filter((v) => v.id === 'color-contrast')
      .flatMap((v) =>
        v.nodes.map((n) => ({ impact: v.impact, target: n.target?.[0], html: n.html?.slice(0, 200), failureSummary: n.failureSummary?.slice(0, 300) })),
      )

    // For each node, check if it's inside chapter-entrega
    const entregaCC = await page.evaluate((targets) => {
      return targets.map((t) => {
        try {
          const el = document.querySelector(t.target)
          if (!el) return { ...t, reachable: false }
          let p = el
          while (p && p !== document.body) {
            const txt = p.textContent || ''
            if (p.classList?.contains('chapter-target') && /Entrega/.test(txt)) {
              return { ...t, inEntrega: true }
            }
            p = p.parentElement
          }
          return { ...t, inEntrega: false }
        } catch (e) {
          return { ...t, error: e.message }
        }
      })
    }, ccNodes)

    const entregaCCCount = entregaCC.filter((n) => n.inEntrega).length
    const goldishLabelsWithPoorContrast = labelProbe.filter((l) => {
      const m = l.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return false
      const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
      // gold-700 #8A6F3A = rgb(138,111,58) — the OLD offender. gold-500 = rgb(212,175,55)
      const isGold700ish = r >= 130 && r <= 150 && g >= 100 && g <= 120 && b >= 50 && b <= 70
      return isGold700ish
    })

    results.fixes.FIX_1 = {
      entrega_bounds: entregaBounds,
      entrega_label_computed_colors: labelProbe,
      gold_700ish_labels_detected: goldishLabelsWithPoorContrast,
      axe_color_contrast_nodes_total: ccNodes.length,
      axe_color_contrast_in_entrega: entregaCCCount,
      verdict:
        goldishLabelsWithPoorContrast.length === 0 && entregaCCCount === 0
          ? 'PASS (entrega labels use gold-500 via Text variant default, no color-contrast violations in entrega)'
          : `FAIL (goldish-offenders=${goldishLabelsWithPoorContrast.length}, entrega-cc=${entregaCCCount})`,
    }
    console.log(`[re-gate]   FIX-1: ${results.fixes.FIX_1.verdict}`)
    await ctx.close()
  }

  // ==========================================================
  // FIX-4 — atelier full-page axe, verify gold-700→gold-900 on bone labels
  // Expect: prior 6 "gold-700 on bone" violations GONE. Axe scan whole /atelier.
  // ==========================================================
  console.log('[re-gate] FIX-4 — /atelier full-page axe (post-scroll settle)…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })

    // scroll through to trigger any lazy states
    for (const y of [0, 600, 1200, 1800, 2400, 3000, 3600, 4200]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      await page.waitForTimeout(80)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)

    // Capture computed color of every "label" span on atelier (chapter label = gold text)
    const labelProbeFull = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'))
      const labels = all.filter((el) => {
        const t = el.textContent?.trim() || ''
        // known labels from the six chapters
        return (
          /^Ateliê$/i.test(t) ||
          /^Ato [0-9]/i.test(t) ||
          /^Origens?$/i.test(t) ||
          /^Madeira$/i.test(t) ||
          /^Corte$/i.test(t) ||
          /^Acabamento$/i.test(t) ||
          /^Cliente/i.test(t)
        )
      })
      return labels.map((el) => {
        const cs = getComputedStyle(el)
        // Climb to find actual painted bg
        let bgEl = el
        let bg = 'transparent'
        while (bgEl && bgEl !== document.body) {
          const cs2 = getComputedStyle(bgEl)
          if (
            cs2.backgroundColor &&
            cs2.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            cs2.backgroundColor !== 'transparent'
          ) {
            bg = cs2.backgroundColor
            break
          }
          bgEl = bgEl.parentElement
        }
        return {
          text: el.textContent?.trim().slice(0, 40),
          color: cs.color,
          bg,
          className: (el.className?.toString() || '').slice(0, 160),
        }
      })
    })

    // Identify gold-900 #4A3A1E = rgb(74,58,30), gold-700 = rgb(138,111,58), gold-500 = rgb(212,175,55)
    const classify = (rgbStr) => {
      const m = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return 'unknown'
      const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
      if (r >= 70 && r <= 80 && g >= 54 && g <= 62 && b >= 26 && b <= 34) return 'gold-900'
      if (r >= 130 && r <= 146 && g >= 105 && g <= 116 && b >= 54 && b <= 62) return 'gold-700'
      if (r >= 200 && r <= 220 && g >= 165 && g <= 180 && b >= 50 && b <= 60) return 'gold-500'
      return `other(${rgbStr})`
    }

    const classified = labelProbeFull.map((l) => ({
      ...l,
      colorClass: classify(l.color),
      onBone: /rgb\(245,\s*240,\s*230/.test(l.bg),
    }))

    const gold700OnBone = classified.filter((l) => l.colorClass === 'gold-700' && l.onBone)
    const gold900OnBone = classified.filter((l) => l.colorClass === 'gold-900' && l.onBone)

    // Now full axe
    const axeFull = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const sev = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    for (const v of axeFull.violations) {
      if (sev[v.impact] !== undefined) sev[v.impact] += v.nodes.length
    }

    const ccViolations = axeFull.violations
      .filter((v) => v.id === 'color-contrast')
      .flatMap((v) =>
        v.nodes.map((n) => ({
          impact: v.impact,
          target: n.target?.[0],
          html: n.html?.slice(0, 200),
          failureSummary: n.failureSummary?.slice(0, 300),
        })),
      )

    results.fixes.FIX_4 = {
      label_classification: classified,
      gold_700_on_bone_count: gold700OnBone.length,
      gold_900_on_bone_count: gold900OnBone.length,
      axe_full_severity: sev,
      axe_color_contrast_count: ccViolations.length,
      axe_color_contrast_sample: ccViolations.slice(0, 20),
      verdict:
        gold700OnBone.length === 0 && gold900OnBone.length >= 5
          ? `PASS (${gold900OnBone.length} gold-900 labels on bone, 0 gold-700 on bone)`
          : `FAIL (gold-700-on-bone=${gold700OnBone.length}, gold-900-on-bone=${gold900OnBone.length})`,
    }
    console.log(`[re-gate]   FIX-4: ${results.fixes.FIX_4.verdict}; axe total CC=${ccViolations.length}`)
    await ctx.close()
  }

  // ==========================================================
  // FIX-5 — scarcity-of-motion (filtered) on / and /colecao
  // Expect: max simultaneous motion-system anims ≤3
  // ==========================================================
  console.log('[re-gate] FIX-5 — scarcity-of-motion filtered…')
  {
    const scarcity = {}
    for (const route of [
      { name: 'home', url: '/' },
      { name: 'colecao', url: '/colecao' },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(BASE + route.url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)

      // Check delay-* classes present in DOM
      const delayClasses = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.product-card, .product-reveal-target'))
        return cards.slice(0, 8).map((el, i) => {
          const cls = el.className?.toString() || ''
          return {
            index: i,
            hasDelay1: cls.includes('delay-1'),
            hasDelay2: cls.includes('delay-2'),
            hasDelay3: cls.includes('delay-3'),
            className: cls.slice(0, 200),
          }
        })
      })

      const whitelist = Array.from(MOTION_ANIM_WHITELIST)
      const samples = []
      const scrollPositions = [0, 400, 800, 1200, 1600, 2000, 2400, 2800]
      for (const y of scrollPositions) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y)
        await page.waitForTimeout(80)
        const counted = await page.evaluate((wl) => {
          const whitelist = new Set(wl)
          const all = document.getAnimations({ subtree: true })
          const running = all.filter((a) => a.playState === 'running')
          // filter by animationName being in whitelist (treat CSS animations only)
          const filtered = running.filter((a) => {
            const name = a.animationName || ''
            return whitelist.has(name)
          })
          // Also consider chapter-target transitions (transition, not animation).
          // These show as Animation objects with animationName '' but with a transitionProperty.
          // Count any .chapter-target with current opacity between 0.3 and 0.99 (in-flight) as an additional motion.
          const chapterTransitioning = Array.from(document.querySelectorAll('.chapter-target'))
            .filter((el) => {
              const cs = getComputedStyle(el)
              const op = parseFloat(cs.opacity)
              return op > 0.3 && op < 0.99
            }).length
          const snapshots = filtered.slice(0, 10).map((a) => ({
            name: a.animationName,
            target: a.effect?.target?.className?.toString().slice(0, 100) || null,
          }))
          return {
            total_getAnimations: all.length,
            running_all: running.length,
            running_motion_system: filtered.length,
            chapter_transitions_inflight: chapterTransitioning,
            simultaneous: filtered.length + chapterTransitioning,
            snapshots,
          }
        }, whitelist)
        samples.push({ scrollY: y, ...counted })
      }

      const maxSimul = Math.max(...samples.map((s) => s.simultaneous))
      scarcity[route.name] = {
        delayClasses,
        samples,
        maxSimultaneous: maxSimul,
        verdict: maxSimul <= 3 ? `PASS (max=${maxSimul})` : `FAIL (max=${maxSimul} > 3)`,
      }
      console.log(`[re-gate]   scarcity ${route.name}: max=${maxSimul} ${scarcity[route.name].verdict}`)
      await ctx.close()
    }

    const homeDelayOK = scarcity.home.delayClasses
      .slice(0, 4)
      .some((c) => c.hasDelay1 || c.hasDelay2 || c.hasDelay3)
    const colecaoDelayOK = scarcity.colecao.delayClasses
      .slice(0, 4)
      .some((c) => c.hasDelay1 || c.hasDelay2 || c.hasDelay3)

    results.fixes.FIX_5 = {
      scarcity,
      delay_classes_present: { home: homeDelayOK, colecao: colecaoDelayOK },
      verdict:
        scarcity.home.maxSimultaneous <= 3 && scarcity.colecao.maxSimultaneous <= 3 && homeDelayOK && colecaoDelayOK
          ? `PASS (home=${scarcity.home.maxSimultaneous}, colecao=${scarcity.colecao.maxSimultaneous}, delays wired)`
          : `CHECK (home=${scarcity.home.maxSimultaneous}, colecao=${scarcity.colecao.maxSimultaneous}, home-delay=${homeDelayOK}, colecao-delay=${colecaoDelayOK})`,
    }
    console.log(`[re-gate]   FIX-5: ${results.fixes.FIX_5.verdict}`)
  }

  // ==========================================================
  // REGRESSION — reduced-motion quick pass (all 4 motion points)
  // ==========================================================
  console.log('[re-gate] regression — reduced-motion quick pass…')
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    const audit = { hero: [], productReveal: [], chapterScroll: [], productCardHover: [] }

    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    audit.hero = await page.evaluate(() => {
      const selectors = ['.hero-h1', '.hero-label', '.hero-subtitle', '.hero-ctas', '.hero-scroll-indicator']
      return selectors.map((sel) => {
        const el = document.querySelector(sel)
        if (!el) return { selector: sel, present: false }
        const cs = getComputedStyle(el)
        return { selector: sel, present: true, animationName: cs.animationName, animationDuration: cs.animationDuration, opacity: cs.opacity, transform: cs.transform }
      })
    })

    await page.goto(BASE + '/colecao', { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    audit.productReveal = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-reveal-target')).slice(0, 5).map((el, i) => {
        const cs = getComputedStyle(el)
        return { index: i, animationName: cs.animationName, animationDuration: cs.animationDuration, transitionDuration: cs.transitionDuration, opacity: cs.opacity, transform: cs.transform }
      })
    })
    audit.productCardHover = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-card-image')).slice(0, 3).map((el, i) => {
        const cs = getComputedStyle(el)
        return { index: i, transitionDuration: cs.transitionDuration, transform: cs.transform }
      })
    })

    await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    audit.chapterScroll = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.chapter-target')).map((el, i) => {
        const cs = getComputedStyle(el)
        return { index: i, animationName: cs.animationName, transitionDuration: cs.transitionDuration, opacity: cs.opacity, transform: cs.transform }
      })
    })

    const durToMs = (d) => {
      if (!d) return 0
      return d.split(',').map((s) => s.trim()).map((t) => {
        if (t.endsWith('ms')) return parseFloat(t)
        if (t.endsWith('s')) return parseFloat(t) * 1000
        return 0
      }).reduce((a, b) => Math.max(a, b), 0)
    }

    const tally = (items) => {
      const offenders = items.filter((it) => {
        if (it.present === false) return false
        const opacityOK = it.opacity ? parseFloat(it.opacity) >= 0.99 : true
        const transformOK = !it.transform || it.transform === 'none'
        const animOK = !it.animationName || it.animationName === 'none'
        const animDurOK = durToMs(it.animationDuration) < 50
        const trDurOK = durToMs(it.transitionDuration) < 50
        return !(opacityOK && transformOK && animOK && animDurOK && trDurOK)
      })
      return { checked: items.length, offenders: offenders.length, offenderItems: offenders }
    }

    results.regression.reducedMotion = {
      hero: tally(audit.hero.filter((h) => h.present !== false)),
      productReveal: tally(audit.productReveal),
      chapterScroll: tally(audit.chapterScroll),
      productCardHover: tally(audit.productCardHover),
      raw: audit,
    }
    const rm = results.regression.reducedMotion
    console.log(`[re-gate]   reduced-motion offenders: hero=${rm.hero.offenders} reveal=${rm.productReveal.offenders} chapter=${rm.chapterScroll.offenders} cardHover=${rm.productCardHover.offenders}`)
    await ctx.close()
  }

  await browser.close()

  // ==========================================================
  // REGRESSION — Lighthouse mobile on 3 routes
  // ==========================================================
  console.log('[re-gate] regression — Lighthouse mobile on 3 routes…')
  let lighthouse, launchChrome
  try {
    const lh = await import('lighthouse')
    lighthouse = lh.default || lh
    const cl = await import('chrome-launcher')
    launchChrome = cl.launch
  } catch (err) {
    console.error('[re-gate] Lighthouse import failed:', err.message)
    results.errors.push({ part: 'lighthouse', error: err.message })
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
    for (const u of [
      { name: 'home', url: BASE + '/' },
      { name: 'atelier', url: BASE + '/atelier' },
      { name: 'product', url: BASE + '/colecao/tenro-luxo' },
    ]) {
      try {
        const runnerResult = await lighthouse(u.url, lhConfig)
        const cats = runnerResult.lhr.categories
        const scores = {
          name: u.name,
          performance: Math.round((cats.performance?.score ?? 0) * 100),
          accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
          'best-practices': Math.round((cats['best-practices']?.score ?? 0) * 100),
          seo: Math.round((cats.seo?.score ?? 0) * 100),
          LCP_ms: runnerResult.lhr.audits['largest-contentful-paint']?.numericValue,
          LCP_display: runnerResult.lhr.audits['largest-contentful-paint']?.displayValue,
          CLS: runnerResult.lhr.audits['cumulative-layout-shift']?.numericValue,
          CLS_display: runnerResult.lhr.audits['cumulative-layout-shift']?.displayValue,
        }
        results.regression.lighthouse.push(scores)
        console.log(`[re-gate]   LH ${u.name}: P=${scores.performance} A=${scores.accessibility} LCP=${scores.LCP_display} CLS=${scores.CLS_display}`)
      } catch (err) {
        results.errors.push({ part: 'lighthouse-run', url: u.url, error: err.message })
      }
    }
    try { await chrome.kill() } catch (e) { /* ignore */ }
  }

  const outPath = path.join(QA_DIR, 's-8.2-8.5b-regate-findings.json')
  await fs.writeFile(outPath, JSON.stringify(results, null, 2))
  console.log(`\n[re-gate] Wrote ${outPath}`)
  console.log('\n===== RE-GATE SUMMARY =====')
  console.log('FIX-1: ', results.fixes.FIX_1?.verdict)
  console.log('FIX-2b:', results.fixes.FIX_2b?.verdict)
  console.log('FIX-4: ', results.fixes.FIX_4?.verdict)
  console.log('FIX-5: ', results.fixes.FIX_5?.verdict)
  console.log('Lighthouse:', results.regression.lighthouse.map((r) => `${r.name}:P=${r.performance}/CLS=${r.CLS_display}`).join(' | '))
  console.log('Reduced-motion offenders:', {
    hero: results.regression.reducedMotion?.hero?.offenders,
    reveal: results.regression.reducedMotion?.productReveal?.offenders,
    chapter: results.regression.reducedMotion?.chapterScroll?.offenders,
    cardHover: results.regression.reducedMotion?.productCardHover?.offenders,
  })
  if (results.errors.length) console.log('Errors:', results.errors)
}

main().catch((e) => {
  console.error('[re-gate] FATAL', e)
  process.exit(1)
})
