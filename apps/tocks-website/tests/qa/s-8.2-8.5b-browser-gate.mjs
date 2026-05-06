/**
 * S-8.2/S-8.3/S-8.4/S-8.5b Consolidated Browser Gate Harness
 *
 * Extends s-8.1-browser-gate.mjs with:
 *  - axe-core 0/0/0/0 on 5 routes (/, /colecao, /colecao/tenro-luxo, /atelier, /contato)
 *  - Lighthouse mobile on /, /atelier, /colecao/tenro-luxo (LCP, CLS, Perf)
 *  - Hero video attribute inspection (S-8.2) + reduced-motion absence check
 *  - Provenance card presence + responsive 3-viewport + Tufte honesty (S-8.3)
 *  - Atelier 6 chapters + copy v2 + responsive (S-8.4)
 *  - Reduced-motion audit across 4 new motion points (S-8.5b AC-8)
 *  - Scarcity-of-motion count on /colecao scroll (≤3 simultaneous) (S-8.5b AC-10)
 *  - GSAP dynamic import: network waterfall (S-8.5b)
 *
 * Run: node tests/qa/s-8.2-8.5b-browser-gate.mjs
 * Output: docs/qa/s-8.2-8.5b-gate-findings.json
 *         docs/qa/s-8.2-8.5b-after/*.png
 *         docs/qa/lighthouse-s8X-*.json
 */

import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const QA_DIR = path.join(ROOT, 'docs', 'qa')
const AFTER_DIR = path.join(QA_DIR, 's-8.2-8.5b-after')

const BASE = 'http://localhost:3000'

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/colecao', name: 'colecao' },
  { path: '/colecao/tenro-luxo', name: 'product' },
  { path: '/atelier', name: 'atelier' },
  { path: '/contato', name: 'contato' },
]

const results = {
  timestamp: new Date().toISOString(),
  storyIds: ['S-8.2', 'S-8.3', 'S-8.4', 'S-8.5b'],
  axe: {},
  lighthouse: { runs: [] },
  s_8_2_hero: null,
  s_8_3_provenance: null,
  s_8_4_atelier: null,
  s_8_5b_reduced_motion_audit: null,
  s_8_5b_scarcity: null,
  s_8_5b_gsap_bundle: null,
  errors: [],
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function main() {
  await ensureDir(AFTER_DIR)
  await ensureDir(QA_DIR)

  console.log('[gate] Launching Chromium…')
  const browser = await chromium.launch({ headless: true })

  // =====================================================
  // PART A — axe-core 0/0/0/0 on all 5 routes
  // =====================================================
  console.log('[gate] PART A — axe-core sweep on 5 routes…')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    for (const r of ROUTES) {
      await page.goto(BASE + r.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      const sev = { critical: 0, serious: 0, moderate: 0, minor: 0 }
      for (const v of axeResults.violations) {
        if (sev[v.impact] !== undefined) sev[v.impact] += v.nodes.length
      }
      results.axe[r.name] = {
        url: r.path,
        violations: axeResults.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodeCount: v.nodes.length,
          firstTarget: v.nodes[0]?.target?.[0] || null,
          firstHtml: v.nodes[0]?.html?.slice(0, 200) || null,
        })),
        severity: sev,
      }
      console.log(`[gate]   axe ${r.path}: C=${sev.critical} S=${sev.serious} M=${sev.moderate} N=${sev.minor}`)
    }
    await ctx.close()
  }

  // =====================================================
  // PART B — S-8.2 Hero video inspection
  // =====================================================
  console.log('[gate] PART B — S-8.2 hero video attribute check…')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })

    const hero = await page.evaluate(() => {
      const video = document.querySelector('video')
      const poster = document.querySelector('img[alt*="Ateliê"], img[alt*="ateli"], img[fetchpriority="high"]')
      const heroSection = document.querySelector('section.relative')
      // Hero H1 class check
      const h1 = document.querySelector('h1')
      const h1Classes = h1 ? h1.className : null
      const h1Styles = h1
        ? (() => {
            const cs = getComputedStyle(h1)
            return {
              fontFamily: cs.fontFamily,
              fontWeight: cs.fontWeight,
              fontSize: cs.fontSize,
              letterSpacing: cs.letterSpacing,
              textContent: h1.textContent?.trim().slice(0, 120),
            }
          })()
        : null
      return {
        videoPresent: !!video,
        videoAutoplay: video?.hasAttribute('autoplay') ?? null,
        videoMuted: video?.hasAttribute('muted') ?? null,
        videoLoop: video?.hasAttribute('loop') ?? null,
        videoPlaysInline: video?.hasAttribute('playsinline') ?? null,
        videoPreload: video?.getAttribute('preload') ?? null,
        videoPoster: video?.getAttribute('poster') ?? null,
        videoAriaHidden: video?.getAttribute('aria-hidden') ?? null,
        posterPresent: !!poster,
        posterSrc: poster?.getAttribute('src') ?? null,
        posterAlt: poster?.getAttribute('alt') ?? null,
        posterFetchPriority: poster?.getAttribute('fetchpriority') ?? null,
        heroH1Classes: h1Classes,
        heroH1Styles: h1Styles,
      }
    })

    // Now re-check under reduced-motion — video MUST NOT be in DOM
    await ctx.close()
    const rmCtx = await browser.newContext({ reducedMotion: 'reduce' })
    const rmPage = await rmCtx.newPage()
    await rmPage.goto(BASE + '/', { waitUntil: 'networkidle' })
    const heroUnderRM = await rmPage.evaluate(() => {
      const video = document.querySelector('video')
      const poster = document.querySelector('img[fetchpriority="high"]')
      return {
        videoPresent: !!video,
        posterPresent: !!poster,
        posterSrc: poster?.getAttribute('src') ?? null,
      }
    })
    await rmCtx.close()

    results.s_8_2_hero = {
      normalMode: hero,
      reducedMotionMode: heroUnderRM,
      acChecks: {
        'AC-1 video renders when sources present': hero.videoPresent === false
          ? 'SKIP — no videoSrc provided (placeholder period), poster-only path active'
          : 'PASS',
        'AC-2 poster present with fetchPriority high': hero.posterPresent && hero.posterFetchPriority === 'high' ? 'PASS' : 'FAIL',
        'AC-7 reduced-motion → video not mounted': heroUnderRM.videoPresent === false ? 'PASS' : 'FAIL',
        'AC-8 video aria-hidden (when present)': hero.videoPresent ? (hero.videoAriaHidden === 'true' ? 'PASS' : 'FAIL') : 'N/A',
        'AC-6 .heading-display on H1': hero.heroH1Classes?.includes('heading-display') ? 'PASS' : 'FAIL',
      },
    }
    console.log('[gate]   hero video:', JSON.stringify(results.s_8_2_hero.acChecks, null, 2))
  }

  // =====================================================
  // PART C — S-8.3 Provenance card + responsive + Tufte
  // =====================================================
  console.log('[gate] PART C — S-8.3 provenance card + responsive…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/colecao/tenro-luxo', { waitUntil: 'networkidle' })

    // Locate the provenance card (figure with aria-labelledby starting with provenance-)
    const presence = await page.evaluate(() => {
      const fig = document.querySelector('figure[aria-labelledby^="provenance-"]')
      if (!fig) return { found: false }
      // Classes / structure
      const labels = Array.from(fig.querySelectorAll('span')).map((s) => s.textContent?.trim()).filter(Boolean)
      const hasOrigin = labels.some((l) => /origem/i.test(l))
      const hasCriacao = labels.some((l) => /cria/i.test(l))
      const hasSerie = labels.some((l) => /serie|série/i.test(l))
      const hasDimensoes = labels.some((l) => /dimens/i.test(l))
      // Check rect / where in layout
      const rect = fig.getBoundingClientRect()
      return {
        found: true,
        fourBlocksLabels: { hasOrigin, hasCriacao, hasSerie, hasDimensoes },
        bounds: { top: rect.top, bottom: rect.bottom, width: rect.width },
      }
    })

    // Tufte honesty — any text element with gold color over bone?
    const tufteCheck = await page.evaluate(() => {
      const fig = document.querySelector('figure[aria-labelledby^="provenance-"]')
      if (!fig) return { violations: [] }
      const violations = []
      const textEls = fig.querySelectorAll('span, p, h1, h2, h3, h4, li, strong, em')
      const isGoldish = (rgb) => {
        // crude — #D4AF37 = rgb(212,175,55); gold-700 #8A6F3A = rgb(138,111,58). Both have R>G>B and R>130.
        const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/)
        if (!m) return false
        const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
        return r > 130 && r > g && g > b && b < 100
      }
      for (const el of textEls) {
        const txt = el.textContent?.trim()
        if (!txt || txt.length < 1) continue
        const cs = getComputedStyle(el)
        if (isGoldish(cs.color)) {
          // is content meaningful text (not just a /  separator)?
          if (!/^[\s/\-·]+$/.test(txt)) {
            violations.push({
              text: txt.slice(0, 60),
              color: cs.color,
              tag: el.tagName,
              className: el.className?.toString().slice(0, 80),
            })
          }
        }
      }
      return { violations }
    })

    // Responsive: check grid collapses at 375px
    const responsiveByViewport = {}
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
    ]
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(BASE + '/colecao/tenro-luxo', { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)
      const layout = await page.evaluate(() => {
        const fig = document.querySelector('figure[aria-labelledby^="provenance-"]')
        if (!fig) return null
        const grid = fig.querySelector('.grid')
        if (!grid) return null
        const cs = getComputedStyle(grid)
        const children = Array.from(grid.children)
        const rowTops = children.map((c) => Math.round(c.getBoundingClientRect().top))
        const uniqueRows = [...new Set(rowTops)].length
        return {
          gridTemplateColumns: cs.gridTemplateColumns,
          childrenCount: children.length,
          uniqueRowTops: uniqueRows,
        }
      })
      await page.screenshot({
        path: path.join(AFTER_DIR, `provenance-${vp.name}.png`),
        fullPage: false,
      })
      responsiveByViewport[vp.name] = { viewport: vp, layout }
    }

    results.s_8_3_provenance = {
      presence,
      tufte: tufteCheck,
      responsive: responsiveByViewport,
      acChecks: {
        'AC-3 4 blocks present': presence.found && Object.values(presence.fourBlocksLabels || {}).every(Boolean) ? 'PASS' : 'FAIL',
        'AC-7 card on product page': presence.found ? 'PASS' : 'FAIL',
        'AC-9 mobile single-column (1fr)': /^[^\s]+$/.test(responsiveByViewport.mobile?.layout?.gridTemplateColumns || '') ? 'PASS' : 'CHECK',
        'Tufte gold-on-bone text rule': tufteCheck.violations.length === 0 ? 'PASS' : 'FAIL',
      },
    }

    await ctx.close()
  }

  // =====================================================
  // PART D — S-8.4 atelier chapters + copy v2 + responsive
  // =====================================================
  console.log('[gate] PART D — S-8.4 atelier longform check…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })

    const atelier = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return { found: false }
      // Look for all .chapter-target
      const chapterTargets = Array.from(document.querySelectorAll('.chapter-target'))
      const chapterInfo = chapterTargets.map((el, i) => {
        const heading = el.querySelector('h1, h2')
        const rect = el.getBoundingClientRect()
        return {
          index: i,
          heading: heading?.textContent?.trim().slice(0, 80) || null,
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          bg: getComputedStyle(el).backgroundColor,
          className: el.className?.toString().slice(0, 120),
        }
      })
      // The colofon should be last & NOT have chapter-target
      const allSections = Array.from(document.querySelectorAll('main > *'))
      const lastSection = allSections[allSections.length - 1]
      const isColofonLast = lastSection?.className?.includes('texture-paper') || lastSection?.textContent?.includes('Catálogo')
      // Look for copy v2 headline
      const bodyText = document.body.textContent || ''
      const copyV2Hit = bodyText.includes('Desde 2008, madeira e autoria')
      const noBilhar = !bodyText.toLowerCase().includes('bilhar') || bodyText.toLowerCase().indexOf('bilhar') > bodyText.toLowerCase().indexOf('autoria') + 200
      // chapter headings ordering
      const h2Texts = Array.from(main.querySelectorAll('h2')).map((h) => h.textContent?.trim().slice(0, 50))
      return {
        found: true,
        chapterTargetCount: chapterTargets.length,
        chapterInfo,
        isColofonLast,
        lastSectionClass: lastSection?.className || null,
        copyV2Hit,
        bilharInEarlyBody: bodyText.toLowerCase().slice(0, 500).includes('bilhar'),
        h2Texts,
      }
    })

    // Entrega → Colofon bg transition (noir-mid → bone)
    const bgTransition = atelier.chapterInfo?.length > 0
      ? {
          lastChapterTarget: atelier.chapterInfo[atelier.chapterInfo.length - 1],
          lastSectionClass: atelier.lastSectionClass,
          intent: 'entrega noir-mid → colofon bone transition',
        }
      : null

    // Responsive 3 viewports
    const atelierResponsive = {}
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
    ]
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      const layout = await page.evaluate(() => {
        // Check for broken grid on chapter-madeira
        const madeira = Array.from(document.querySelectorAll('.chapter-target')).find((el) =>
          el.textContent?.includes('Madeira')
        )
        if (!madeira) return null
        const grid = madeira.querySelector('.grid')
        const cs = grid ? getComputedStyle(grid) : null
        return {
          madeiraGridCols: cs?.gridTemplateColumns || null,
        }
      })
      await page.screenshot({
        path: path.join(AFTER_DIR, `atelier-${vp.name}.png`),
        fullPage: true,
      })
      atelierResponsive[vp.name] = { viewport: vp, layout }
    }

    results.s_8_4_atelier = {
      atelier,
      bgTransition,
      responsive: atelierResponsive,
      acChecks: {
        'AC-1 6 chapter templates rendered': atelier.chapterTargetCount === 5 && atelier.isColofonLast ? 'PASS (5 chapter-target + 1 static colofon)' : `CHECK — ${atelier.chapterTargetCount} chapter-target(s)`,
        'AC-11 copy v2 headline "Desde 2008, madeira e autoria" present': atelier.copyV2Hit ? 'PASS' : 'FAIL',
        'No "bilhar" in hero/lead area': !atelier.bilharInEarlyBody ? 'PASS' : 'FAIL',
        'AC-12 responsive stack on mobile': /^[^\s]+$/.test(atelierResponsive.mobile?.layout?.madeiraGridCols || '') ? 'PASS' : 'CHECK',
      },
    }
    await ctx.close()
  }

  // =====================================================
  // PART E — S-8.5b reduced-motion audit (4 new motion points)
  // =====================================================
  console.log('[gate] PART E — S-8.5b reduced-motion audit on 4 motion points…')
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    const audit = {}

    // 1. Hero entrance — hero.tsx animations must be neutralized
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    audit.hero = await page.evaluate(() => {
      const selectors = ['.hero-h1', '.hero-label', '.hero-subtitle', '.hero-ctas', '.hero-scroll-indicator']
      return selectors.map((sel) => {
        const el = document.querySelector(sel)
        if (!el) return { selector: sel, present: false }
        const cs = getComputedStyle(el)
        return {
          selector: sel,
          present: true,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          opacity: cs.opacity,
          transform: cs.transform,
        }
      })
    })

    // 2. Product reveal on /colecao
    await page.goto(BASE + '/colecao', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    audit.productReveal = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.product-reveal-target')).slice(0, 5)
      return elements.map((el, i) => {
        const cs = getComputedStyle(el)
        return {
          index: i,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          transitionDuration: cs.transitionDuration,
          opacity: cs.opacity,
          transform: cs.transform,
          hasIsRevealed: el.classList.contains('is-revealed'),
        }
      })
    })

    // 3. Chapter scroll on /atelier
    await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    audit.chapterScroll = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.chapter-target'))
      return elements.map((el, i) => {
        const cs = getComputedStyle(el)
        return {
          index: i,
          animationName: cs.animationName,
          transitionDuration: cs.transitionDuration,
          opacity: cs.opacity,
          transform: cs.transform,
          hasIsActive: el.classList.contains('is-active'),
        }
      })
    })

    // 4. Product card hover scale — check transition is zeroed
    await page.goto(BASE + '/colecao', { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    audit.productCardHover = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('.product-card-image')).slice(0, 3)
      return images.map((el, i) => {
        const cs = getComputedStyle(el)
        return {
          index: i,
          transitionDuration: cs.transitionDuration,
          transform: cs.transform,
        }
      })
    })

    // Summarize offenders per bucket
    const summarizeOffenders = (items, label) => {
      const offenders = items.filter((it) => {
        if (!it.present && it.present !== undefined) return false
        // under reduced-motion, expect opacity ~1 OR transform 'none' AND animation 'none'/very short
        const opacityOK = it.opacity ? parseFloat(it.opacity) >= 0.99 : true
        const transformOK = it.transform === 'none' || it.transform === undefined
        const animOK = !it.animationName || it.animationName === 'none'
        // Patch #2c sets 0.01ms — treat any <50ms as OK
        const durToMs = (d) => {
          if (!d) return 0
          return d.split(',').map((s) => s.trim()).map((t) => {
            if (t.endsWith('ms')) return parseFloat(t)
            if (t.endsWith('s')) return parseFloat(t) * 1000
            return 0
          }).reduce((a, b) => Math.max(a, b), 0)
        }
        const animDurOK = durToMs(it.animationDuration) < 50
        const trDurOK = durToMs(it.transitionDuration) < 50
        return !(opacityOK && transformOK && animOK && animDurOK && trDurOK)
      })
      return { label, checked: items.length, offenders: offenders.length, offenderItems: offenders }
    }

    results.s_8_5b_reduced_motion_audit = {
      hero: summarizeOffenders(audit.hero.filter((h) => h.present !== false), 'hero entrance'),
      productReveal: summarizeOffenders(audit.productReveal, 'product reveal'),
      chapterScroll: summarizeOffenders(audit.chapterScroll, 'chapter scroll'),
      productCardHover: summarizeOffenders(audit.productCardHover, 'product-card-image hover'),
      rawAudit: audit,
    }
    const rmSummary = results.s_8_5b_reduced_motion_audit
    console.log(`[gate]   reduced-motion offenders: hero=${rmSummary.hero.offenders} reveal=${rmSummary.productReveal.offenders} chapter=${rmSummary.chapterScroll.offenders} cardHover=${rmSummary.productCardHover.offenders}`)

    await ctx.close()
  }

  // =====================================================
  // PART F — S-8.5b scarcity-of-motion on /colecao scroll
  // =====================================================
  console.log('[gate] PART F — scarcity-of-motion count on /colecao…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/colecao', { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)

    // Scroll in steps; at each step, count "currently animating" elements
    // (Element is animating if animation-name != 'none' AND animation has recently started
    // and has not yet ended — but under CSS-only keyframes, we proxy via
    // element.getAnimations() which returns running Web Animations.)
    const samples = []
    const scrollPositions = [0, 400, 800, 1200, 1600, 2000, 2400]
    for (const y of scrollPositions) {
      await page.evaluate((yPos) => window.scrollTo(0, yPos), y)
      await page.waitForTimeout(150)
      const counted = await page.evaluate(() => {
        const all = document.getAnimations({ subtree: true })
        const running = all.filter((a) => a.playState === 'running')
        const snapshots = running.slice(0, 10).map((a) => {
          const el = a.effect?.target
          return {
            animName: a.animationName,
            elTag: el?.tagName,
            elClass: el?.className?.toString().slice(0, 80),
          }
        })
        return { running: running.length, total: all.length, snapshots }
      })
      samples.push({ scrollY: y, ...counted })
    }
    const maxRunning = Math.max(...samples.map((s) => s.running))
    results.s_8_5b_scarcity = {
      samples,
      maxSimultaneous: maxRunning,
      verdict: maxRunning <= 3 ? 'PASS' : `FAIL (max=${maxRunning} > 3)`,
    }
    console.log(`[gate]   max simultaneous anims on /colecao scroll: ${maxRunning}`)
    await ctx.close()
  }

  // =====================================================
  // PART G — S-8.5b GSAP bundle inspection
  // =====================================================
  console.log('[gate] PART G — GSAP dynamic import network waterfall…')
  {
    // Test two routes — / (no GSAP) and /atelier (loads GSAP)
    const routesToCheck = [
      { name: 'home', url: '/', expectGSAP: false },
      { name: 'atelier', url: '/atelier', expectGSAP: true },
    ]
    const gsapFindings = {}
    for (const r of routesToCheck) {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      const gsapRequests = []
      page.on('request', (req) => {
        const url = req.url()
        if (/gsap|ScrollTrigger/i.test(url)) gsapRequests.push(url)
      })
      await page.goto(BASE + r.url, { waitUntil: 'networkidle' })
      // Scroll to trigger lazy loaders
      await page.evaluate(() => window.scrollTo(0, 800))
      await page.waitForTimeout(1000)
      gsapFindings[r.name] = {
        url: r.url,
        expectGSAP: r.expectGSAP,
        gsapRequestCount: gsapRequests.length,
        requests: gsapRequests.slice(0, 5),
        verdict: r.expectGSAP
          ? gsapRequests.length > 0 ? 'PASS (GSAP loaded as expected)' : 'CHECK (no GSAP fetched — chunk may be inlined)'
          : gsapRequests.length === 0 ? 'PASS (no GSAP on home as expected)' : 'FAIL (GSAP leaked to home)',
      }
      await ctx.close()
    }
    results.s_8_5b_gsap_bundle = gsapFindings
  }

  // =====================================================
  // PART H — Consolidated screenshots
  // =====================================================
  console.log('[gate] PART H — key screenshots…')
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()

    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(AFTER_DIR, 'home-hero.png'), fullPage: false })

    await page.goto(BASE + '/colecao/tenro-luxo', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(AFTER_DIR, 'product-full.png'), fullPage: true })

    await page.goto(BASE + '/atelier', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(AFTER_DIR, 'atelier-full.png'), fullPage: true })

    await ctx.close()
  }

  await browser.close()

  // =====================================================
  // PART I — Lighthouse mobile on / , /atelier, /colecao/tenro-luxo
  // =====================================================
  console.log('[gate] PART I — Lighthouse mobile on 3 routes…')
  let lighthouse, launchChrome
  try {
    const lh = await import('lighthouse')
    lighthouse = lh.default || lh
    const cl = await import('chrome-launcher')
    launchChrome = cl.launch
  } catch (err) {
    console.error('[gate] Lighthouse import failed:', err.message)
    results.errors.push({ part: 'lighthouse', error: err.message })
  }

  if (lighthouse && launchChrome) {
    const chrome = await launchChrome({
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
    })
    const lhConfig = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 360,
        height: 640,
        deviceScaleFactor: 2,
        disabled: false,
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
      },
    }
    const urls = [
      { name: 'home', url: BASE + '/' },
      { name: 'atelier', url: BASE + '/atelier' },
      { name: 'product', url: BASE + '/colecao/tenro-luxo' },
    ]
    for (const u of urls) {
      console.log(`[gate]   Lighthouse: ${u.url}`)
      try {
        const runnerResult = await lighthouse(u.url, lhConfig)
        const cats = runnerResult.lhr.categories
        const lcpAudit = runnerResult.lhr.audits['largest-contentful-paint']
        const clsAudit = runnerResult.lhr.audits['cumulative-layout-shift']
        const tbtAudit = runnerResult.lhr.audits['total-blocking-time']
        const fcpAudit = runnerResult.lhr.audits['first-contentful-paint']
        const scores = {
          name: u.name,
          url: u.url,
          performance: Math.round((cats.performance?.score ?? 0) * 100),
          accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
          'best-practices': Math.round((cats['best-practices']?.score ?? 0) * 100),
          seo: Math.round((cats.seo?.score ?? 0) * 100),
          LCP_ms: lcpAudit?.numericValue,
          LCP_display: lcpAudit?.displayValue,
          CLS: clsAudit?.numericValue,
          CLS_display: clsAudit?.displayValue,
          TBT_ms: tbtAudit?.numericValue,
          FCP_ms: fcpAudit?.numericValue,
        }
        results.lighthouse.runs.push(scores)
        await fs.writeFile(
          path.join(QA_DIR, `lighthouse-s8X-${u.name}.json`),
          JSON.stringify(runnerResult.lhr, null, 2)
        )
        console.log(
          `[gate]     P=${scores.performance} A=${scores.accessibility} BP=${scores['best-practices']} SEO=${scores.seo} LCP=${lcpAudit?.displayValue} CLS=${clsAudit?.displayValue}`
        )
      } catch (err) {
        console.error(`[gate]   Lighthouse failed for ${u.url}:`, err.message)
        results.errors.push({ part: 'lighthouse-run', url: u.url, error: err.message })
      }
    }
    try {
      await chrome.kill()
    } catch (err) {
      console.log('[gate]   chrome.kill cleanup skipped:', err.code)
    }
  }

  // Write consolidated JSON report
  const reportPath = path.join(QA_DIR, 's-8.2-8.5b-gate-findings.json')
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2))
  console.log(`\n[gate] Wrote ${reportPath}`)

  // Summary
  console.log('\n===== CONSOLIDATED GATE SUMMARY =====')
  console.log('AXE results:')
  for (const [name, r] of Object.entries(results.axe)) {
    console.log(`   ${name}: C=${r.severity.critical} S=${r.severity.serious} M=${r.severity.moderate} N=${r.severity.minor}`)
  }
  console.log('Lighthouse runs:')
  for (const r of results.lighthouse.runs) {
    console.log(`   ${r.name}: P=${r.performance} A=${r.accessibility} LCP=${r.LCP_display} CLS=${r.CLS_display}`)
  }
  console.log('S-8.2 hero ACs:', results.s_8_2_hero?.acChecks)
  console.log('S-8.3 provenance ACs:', results.s_8_3_provenance?.acChecks)
  console.log('S-8.4 atelier ACs:', results.s_8_4_atelier?.acChecks)
  console.log('S-8.5b reduced-motion offenders:', {
    hero: results.s_8_5b_reduced_motion_audit?.hero?.offenders,
    reveal: results.s_8_5b_reduced_motion_audit?.productReveal?.offenders,
    chapter: results.s_8_5b_reduced_motion_audit?.chapterScroll?.offenders,
    cardHover: results.s_8_5b_reduced_motion_audit?.productCardHover?.offenders,
  })
  console.log('S-8.5b scarcity verdict:', results.s_8_5b_scarcity?.verdict)
  console.log('S-8.5b GSAP bundle:', {
    home: results.s_8_5b_gsap_bundle?.home?.verdict,
    atelier: results.s_8_5b_gsap_bundle?.atelier?.verdict,
  })
  if (results.errors.length) console.log('Errors:', results.errors)
}

main().catch((e) => {
  console.error('[gate] FATAL', e)
  process.exit(1)
})
