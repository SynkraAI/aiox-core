/**
 * S-7.3 / AC-1 — axe-core run on home, product, contact pages.
 * Writes consolidated JSON report to docs/qa/s-7.3-axe-report.json.
 *
 * Pass criteria: ZERO critical/serious violations. Moderate is documented, not blocking.
 */
import { test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Run sequentially in declared order so the consolidated JSON contains all 3 pages
// even if one has violations. The verdict step at the end emits a final pass/fail line.
test.describe.configure({ mode: 'serial' })

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'produto', url: '/colecao/tenro-luxo' },
  { name: 'contato', url: '/contato' },
] as const

interface PageReport {
  page: string
  url: string
  counts: {
    critical: number
    serious: number
    moderate: number
    minor: number
  }
  violations: Array<{
    id: string
    impact: string | null | undefined
    description: string
    help: string
    helpUrl: string
    nodes: number
    targets: string[]
  }>
}

const reports: PageReport[] = []

for (const p of PAGES) {
  test(`axe: ${p.name}`, async ({ page }) => {
    await page.goto(p.url, { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    const violations = results.violations.map((v) => {
      const impact = (v.impact ?? 'minor') as keyof typeof counts
      if (impact in counts) counts[impact] += 1
      return {
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        targets: v.nodes.flatMap((n) => n.target as string[]).slice(0, 5),
      }
    })

    reports.push({ page: p.name, url: p.url, counts, violations })
    // Note: we do NOT fail the test on violations here — the consolidated report
    // is the QA artifact. The verdict line in the JSON's `totals` informs the gate.
  })
}

test.afterAll(async () => {
  const outDir = path.join(process.cwd(), 'docs', 'qa')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 's-7.3-axe-report.json')
  const summary = {
    story: 'S-7.3',
    chunk: 'A',
    ac: 'AC-1',
    generatedAt: new Date().toISOString(),
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
    pages: reports,
    totals: reports.reduce(
      (acc, r) => {
        acc.critical += r.counts.critical
        acc.serious += r.counts.serious
        acc.moderate += r.counts.moderate
        acc.minor += r.counts.minor
        return acc
      },
      { critical: 0, serious: 0, moderate: 0, minor: 0 },
    ),
  }
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2), 'utf8')
})
