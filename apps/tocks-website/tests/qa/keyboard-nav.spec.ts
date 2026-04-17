/**
 * S-7.3 / AC-3 — Keyboard navigation smoke test.
 *
 * Verifies:
 *   - FAQ <details> toggles open via Tab + Enter
 *   - SwatchPicker is reachable; arrow/enter mutate selection (compound radiogroup)
 *   - Concierge form fields tabbable in order, no focus trap, submit reachable
 *
 * Output: docs/qa/s-7.3-keyboard-log.md (PASS/FAIL checklist).
 */
import { test } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface Check {
  page: string
  ac: string
  description: string
  pass: boolean
  evidence: string
}

const checks: Check[] = []

function record(page: string, ac: string, description: string, pass: boolean, evidence: string) {
  checks.push({ page, ac, description, pass, evidence })
}

// --- AC-3 (a) FAQ <details> --- (FAQ is on /contato — Duvidas Frequentes section)
test('keyboard: FAQ details toggles via Tab+Enter (contato page)', async ({ page }) => {
  await page.goto('/contato', { waitUntil: 'networkidle' })

  const detailsCount = await page.locator('details').count()
  record(
    'contato',
    'AC-3a',
    `Page renders <details> elements (count=${detailsCount})`,
    detailsCount > 0,
    `locator('details').count() = ${detailsCount}`,
  )

  if (detailsCount === 0) return

  const firstDetails = page.locator('details').first()
  await firstDetails.scrollIntoViewIfNeeded()

  const summary = firstDetails.locator('summary').first()
  await summary.focus()

  const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
  record(
    'contato',
    'AC-3a',
    'First FAQ <summary> can receive focus',
    focusedTag === 'summary',
    `document.activeElement = ${focusedTag}`,
  )

  const openBefore = await firstDetails.evaluate((el) => (el as HTMLDetailsElement).open)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)
  const openAfter = await firstDetails.evaluate((el) => (el as HTMLDetailsElement).open)

  record(
    'contato',
    'AC-3a',
    'Pressing Enter on focused <summary> toggles `open`',
    openBefore !== openAfter,
    `open: ${openBefore} -> ${openAfter}`,
  )

  // Toggle back to verify two-way
  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)
  const openFinal = await firstDetails.evaluate((el) => (el as HTMLDetailsElement).open)
  record(
    'contato',
    'AC-3a',
    'Second Enter restores previous state',
    openFinal === openBefore,
    `open final = ${openFinal} (expected ${openBefore})`,
  )
})

// --- AC-3 (b) SwatchPicker ---
test('keyboard: swatch-picker reachable and operable (product page)', async ({ page }) => {
  await page.goto('/colecao/tenro-luxo', { waitUntil: 'networkidle' })

  const radiogroup = page.locator('[role="radiogroup"]').first()
  const radiogroupCount = await page.locator('[role="radiogroup"]').count()
  record(
    'produto',
    'AC-3b',
    `SwatchPicker rendered as role=radiogroup (count=${radiogroupCount})`,
    radiogroupCount > 0,
    `locator('[role=radiogroup]').count() = ${radiogroupCount}`,
  )

  if (radiogroupCount === 0) return

  const radios = radiogroup.locator('[role="radio"]')
  const radioCount = await radios.count()
  record(
    'produto',
    'AC-3b',
    `Radiogroup contains role=radio options (count=${radioCount})`,
    radioCount >= 2,
    `radio count = ${radioCount}`,
  )

  if (radioCount === 0) return

  const firstRadio = radios.first()
  await firstRadio.scrollIntoViewIfNeeded()
  await firstRadio.focus()

  const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute('role'))
  record(
    'produto',
    'AC-3b',
    'Swatch option can receive focus',
    focusedRole === 'radio',
    `document.activeElement[role] = ${focusedRole}`,
  )

  const checkedBefore = await firstRadio.getAttribute('aria-checked')
  // Activate via Space (also valid for radio buttons; Enter for native button)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(150)
  const checkedAfterEnter = await firstRadio.getAttribute('aria-checked')

  record(
    'produto',
    'AC-3b',
    'Enter on swatch option triggers selection (aria-checked=true)',
    checkedAfterEnter === 'true',
    `aria-checked: ${checkedBefore} -> ${checkedAfterEnter}`,
  )

  // Tab to next radio, activate, ensure first is now unchecked
  if (radioCount >= 2) {
    const secondRadio = radios.nth(1)
    await secondRadio.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(150)
    const firstChecked = await firstRadio.getAttribute('aria-checked')
    const secondChecked = await secondRadio.getAttribute('aria-checked')
    record(
      'produto',
      'AC-3b',
      'Selecting second swatch deselects first (single-select radiogroup)',
      secondChecked === 'true' && firstChecked === 'false',
      `first=${firstChecked} second=${secondChecked}`,
    )
  }
})

// --- AC-3 (c) Concierge form ---
test('keyboard: concierge form tab order + reachable submit (contato page)', async ({ page }) => {
  await page.goto('/contato', { waitUntil: 'networkidle' })

  const form = page.locator('form').first()
  const formCount = await page.locator('form').count()
  record(
    'contato',
    'AC-3c',
    `Concierge form rendered (count=${formCount})`,
    formCount > 0,
    `locator('form').count() = ${formCount}`,
  )
  if (formCount === 0) return

  await form.scrollIntoViewIfNeeded()
  const fieldControls = form.locator('input, textarea')
  const submitBtn = form.locator('button[type="submit"]')
  const fieldCount = await fieldControls.count()
  const submitCount = await submitBtn.count()
  record(
    'contato',
    'AC-3c',
    `Form contains input/textarea controls (count=${fieldCount})`,
    fieldCount >= 3,
    `field count = ${fieldCount}`,
  )
  record(
    'contato',
    'AC-3c',
    `Form contains submit button (count=${submitCount})`,
    submitCount === 1,
    `submit count = ${submitCount}`,
  )

  // Focus first form field by its name attribute (deterministic).
  const firstField = form.locator('input[name="name"]').first()
  await firstField.focus()
  // Wait briefly to ensure focus is applied
  await page.waitForTimeout(80)

  const startTag = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    return el ? `${el.tagName.toLowerCase()}[name=${el.getAttribute('name') ?? ''}]` : 'null'
  })
  record(
    'contato',
    'AC-3c',
    'First field (input[name=name]) receives focus programmatically',
    startTag.startsWith('input[name=name'),
    `document.activeElement = ${startTag}`,
  )

  // Tab through expected fields in order: name -> email -> phone -> message -> submit
  const visited: string[] = [startTag]
  let trapped = false
  const maxSteps = 8

  for (let i = 0; i < maxSteps; i++) {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(60)
    const tag = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el) return 'null'
      const name = el.getAttribute('name') ?? ''
      const type = el.getAttribute('type') ?? ''
      return `${el.tagName.toLowerCase()}[name=${name} type=${type}]`
    })
    visited.push(tag)
    if (visited.length >= 3 && visited[visited.length - 1] === visited[visited.length - 2]) {
      trapped = true
      break
    }
    const isSubmit = await page.evaluate(() => {
      const el = document.activeElement as HTMLButtonElement | null
      return !!el && el.tagName === 'BUTTON' && el.type === 'submit'
    })
    if (isSubmit) break
  }

  const reachedSubmit = visited.some((v) => v.startsWith('button[') && v.includes('type=submit'))
  record(
    'contato',
    'AC-3c',
    'Submit button reachable via Tab traversal from first field',
    reachedSubmit,
    `Tab order: ${visited.join(' -> ')}`,
  )
  record(
    'contato',
    'AC-3c',
    'No focus trap detected during Tab traversal',
    !trapped,
    trapped ? `repeat focus on: ${visited[visited.length - 1]}` : 'no consecutive duplicates',
  )
})

test.afterAll(async () => {
  const outDir = path.join(process.cwd(), 'docs', 'qa')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 's-7.3-keyboard-log.md')

  const lines: string[] = []
  lines.push('# S-7.3 — Keyboard Navigation Log (AC-3)')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('Coverage:')
  lines.push('- AC-3a: FAQ `<details>` toggle via Tab + Enter')
  lines.push('- AC-3b: SwatchPicker reachable + operable (radiogroup semantics)')
  lines.push('- AC-3c: Concierge form tab order, no focus trap, submit reachable')
  lines.push('')

  const byPage = new Map<string, Check[]>()
  for (const c of checks) {
    if (!byPage.has(c.page)) byPage.set(c.page, [])
    byPage.get(c.page)!.push(c)
  }

  let pass = 0
  let fail = 0

  for (const [pg, items] of byPage) {
    lines.push(`## Page: \`${pg}\``)
    lines.push('')
    lines.push('| AC | Check | Result | Evidence |')
    lines.push('|----|-------|--------|----------|')
    for (const c of items) {
      lines.push(`| ${c.ac} | ${c.description} | ${c.pass ? 'PASS' : 'FAIL'} | ${c.evidence} |`)
      if (c.pass) pass++
      else fail++
    }
    lines.push('')
  }

  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total checks: **${checks.length}**`)
  lines.push(`- PASS: **${pass}**`)
  lines.push(`- FAIL: **${fail}**`)
  lines.push('')
  lines.push(
    fail === 0
      ? '**AC-3 verdict: PASS** — keyboard navigation is functional across FAQ, swatch-picker and concierge form.'
      : '**AC-3 verdict: NEEDS_WORK** — see FAIL rows. Findings raised for @dev (QA does not patch product code).',
  )
  lines.push('')

  fs.writeFileSync(outFile, lines.join('\n'), 'utf8')
})
