/**
 * S-7.3 / AC-2 — Focus state contrast audit.
 *
 * For each page, tabs through interactive elements and captures the focus indicator
 * color via getComputedStyle, then computes contrast ratio against the element's
 * background. Required: focus-border vs background >= 3:1 (WCAG 2.2 AA — Focus Appearance).
 *
 * Output: docs/qa/s-7.3-wcag-log.md (markdown table per page).
 */
import { test } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'produto', url: '/colecao/tenro-luxo' },
  { name: 'contato', url: '/contato' },
] as const

const MAX_TABS = 20

interface FocusSample {
  page: string
  tabIndex: number
  tag: string
  selector: string
  outlineColor: string
  outlineWidth: string
  outlineStyle: string
  boxShadow: string
  ringColor: string | null
  bgColor: string
  parentBgColor: string
  contrastRatio: number
  pass: boolean
  notes: string
}

const allSamples: FocusSample[] = []

// --- Color math helpers (run in browser context) ---
function browserHelpersScript() {
  return `
    function parseRgba(str) {
      if (!str) return null;
      const m = str.match(/rgba?\\(([^)]+)\\)/);
      if (!m) return null;
      const parts = m[1].split(',').map(s => parseFloat(s.trim()));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
    }
    function relLum(c) {
      const ch = [c.r, c.g, c.b].map(v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    }
    function contrast(a, b) {
      if (!a || !b) return 0;
      const la = relLum(a), lb = relLum(b);
      const [hi, lo] = la > lb ? [la, lb] : [lb, la];
      return (hi + 0.05) / (lo + 0.05);
    }
    function effectiveBg(el) {
      let cur = el;
      while (cur) {
        const cs = getComputedStyle(cur);
        const bg = parseRgba(cs.backgroundColor);
        if (bg && bg.a > 0) return cs.backgroundColor;
        cur = cur.parentElement;
      }
      return 'rgb(255,255,255)';
    }
    function describe(el) {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? '#' + el.id : '';
      const cls = el.className && typeof el.className === 'string'
        ? '.' + el.className.split(/\\s+/).slice(0, 2).join('.')
        : '';
      return tag + id + cls;
    }
    function extractRingColor(boxShadow) {
      // Tailwind ring is typically: 'rgb(...) 0px 0px 0px Npx'
      // Take the first rgb/rgba color encountered.
      const m = boxShadow && boxShadow.match(/rgba?\\([^)]+\\)/);
      return m ? m[0] : null;
    }
    window.__qaFocusProbe = function() {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const bg = effectiveBg(el);
      const outline = cs.outlineColor;
      const ring = extractRingColor(cs.boxShadow);
      // Indicator color: prefer ring (Tailwind v4 uses box-shadow rings), fall back to outline.
      const indicator = ring || outline;
      const indicatorRgb = parseRgba(indicator);
      const bgRgb = parseRgba(bg);
      const ratio = contrast(indicatorRgb, bgRgb);
      return {
        tag: el.tagName.toLowerCase(),
        selector: describe(el),
        outlineColor: cs.outlineColor,
        outlineWidth: cs.outlineWidth,
        outlineStyle: cs.outlineStyle,
        boxShadow: cs.boxShadow,
        ringColor: ring,
        bgColor: bg,
        parentBgColor: bg,
        contrastRatio: Math.round(ratio * 100) / 100,
      };
    };
  `
}

for (const p of PAGES) {
  test(`focus-contrast: ${p.name}`, async ({ page }) => {
    await page.goto(p.url, { waitUntil: 'networkidle' })
    await page.addScriptTag({ content: browserHelpersScript() })

    // Reset focus to body
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

    const seen = new Set<string>()

    for (let i = 1; i <= MAX_TABS; i++) {
      await page.keyboard.press('Tab')
      // small settle for any focus-visible transitions
      await page.waitForTimeout(50)

      const sample = await page.evaluate(() => (window as unknown as { __qaFocusProbe: () => unknown }).__qaFocusProbe())
      if (!sample) continue

      const s = sample as Omit<FocusSample, 'page' | 'tabIndex' | 'pass' | 'notes'>
      const key = s.selector
      if (seen.has(key)) continue
      seen.add(key)

      const pass = s.contrastRatio >= 3.0
      const notes = pass
        ? 'OK'
        : s.outlineStyle !== 'none' && s.outlineWidth !== '0px'
          ? 'Indicator below 3:1 — check focus token'
          : 'No visible indicator detected (no outline + no ring)'

      allSamples.push({
        page: p.name,
        tabIndex: i,
        ...s,
        pass,
        notes,
      })
    }
  })
}

test.afterAll(async () => {
  const outDir = path.join(process.cwd(), 'docs', 'qa')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 's-7.3-wcag-log.md')

  const lines: string[] = []
  lines.push('# S-7.3 — WCAG AA Focus Contrast Log (AC-2)')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('Standard: WCAG 2.2 AA — Focus Appearance (focus indicator vs adjacent background >= 3:1).')
  lines.push('')
  lines.push('Indicator detection: Tailwind v4 ring (box-shadow) preferred, outline as fallback.')
  lines.push('')

  const byPage = new Map<string, FocusSample[]>()
  for (const s of allSamples) {
    if (!byPage.has(s.page)) byPage.set(s.page, [])
    byPage.get(s.page)!.push(s)
  }

  let totalPass = 0
  let totalFail = 0

  for (const [pageName, samples] of byPage) {
    lines.push(`## Page: \`${pageName}\``)
    lines.push('')
    lines.push('| # | Element | Outline | Ring (box-shadow) | Background | Contrast | Pass | Notes |')
    lines.push('|---|---------|---------|-------------------|------------|----------|------|-------|')
    for (const s of samples) {
      const ringSummary = s.ringColor ?? '—'
      const outlineSummary = s.outlineStyle === 'none' ? 'none' : `${s.outlineColor} ${s.outlineWidth} ${s.outlineStyle}`
      lines.push(
        `| ${s.tabIndex} | \`${s.selector}\` | ${outlineSummary} | ${ringSummary} | ${s.bgColor} | ${s.contrastRatio.toFixed(2)}:1 | ${s.pass ? 'YES' : 'NO'} | ${s.notes} |`,
      )
      if (s.pass) totalPass++
      else totalFail++
    }
    lines.push('')
  }

  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total elements sampled: **${allSamples.length}**`)
  lines.push(`- PASS (>= 3:1): **${totalPass}**`)
  lines.push(`- FAIL (< 3:1 or no visible indicator): **${totalFail}**`)
  lines.push('')
  if (totalFail === 0) {
    lines.push('**AC-2 verdict: PASS** — all focusable elements expose an indicator with >= 3:1 contrast.')
  } else {
    lines.push('**AC-2 verdict: NEEDS_WORK** — see FAIL rows above. Findings flagged for @dev (QA does not patch product code).')
  }
  lines.push('')

  fs.writeFileSync(outFile, lines.join('\n'), 'utf8')
})
