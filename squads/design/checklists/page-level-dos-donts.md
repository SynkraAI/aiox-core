---
title: "Page-Level Do's and Don'ts"
purpose: "Pre-flight checklist for page composition — consolidated from research and squad KBs"
version: "1.0.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/ Section 5 + squad KBs cross-reference"
created: "2026-03-08"
agent: "page-composer"
command: "*preflight"
---

# Page-Level Do's and Don'ts

> Quick-reference pre-flight. Check before composing, review after generating.

---

## DO's

### Prompting

- [ ] **Specify components, data fields, and actions** — not vague descriptions
- [ ] **Use real copy** (headlines, CTAs, metric names) — never lorem ipsum
- [ ] **Define persona and context** — who, when, what decision
- [ ] **Put design buzzwords early** in the prompt — "premium", "minimal", "developer-focused"
- [ ] **Set constraints before features** — device, color system, accessibility, protected files
- [ ] **Explain WHY**, not just what — "used by CTOs to compare tools" > "add a comparison section"
- [ ] **Use screenshots or Figma** when available — visual reference > verbal description
- [ ] **Ask "Ask me any questions you need"** — delegate clarification to the AI
- [ ] **One page type per prompt** — landing OR dashboard, never both
- [ ] **Append states directive** — "generate loading, empty, and error states for dynamic sections"

### Layout & Structure

- [ ] **Follow page type pattern** from KB2 — don't invent section order
- [ ] **Use the correct eye-tracking pattern** — Z for landing, F for content, Gutenberg for forms
- [ ] **Apply spacing strategy from buzzword** — generous (editorial), balanced (product), compact (dashboard)
- [ ] **Break visual monotony** — vary card sizes, alternate section backgrounds, stagger content
- [ ] **Use asymmetric layouts** alongside grids — one featured card larger than the rest
- [ ] **Semantic HTML first** — `<header>`, `<main>`, `<section>`, `<footer>`, `<article>`

### Typography

- [ ] **Follow the modular scale** (1.25 ratio) — don't pick arbitrary font sizes
- [ ] **One H1 per page** — clear hierarchy H1 > H2 > H3, no skipping
- [ ] **Generous line-height for body** — 1.5-1.75 for readability
- [ ] **Max 2 font families** — one for headings, one for body (or one for everything)

### Components

- [ ] **Select icons that specifically match the feature** — not generic shield/rocket/globe
- [ ] **Build component-by-component** — not the entire page in one shot
- [ ] **Use component variants** instead of overrides — extend, don't patch
- [ ] **Include interactive states** — hover, focus, active, disabled per component

### Color & Brand

- [ ] **Use design tokens** (CSS variables) — never hardcode hex values
- [ ] **HSL color format** — consistent with shadcn/ui system
- [ ] **Define status color system explicitly** — green/yellow/red for data UIs
- [ ] **Test contrast ratios** — WCAG AA minimum (4.5:1 text, 3:1 large text)

### Accessibility

- [ ] **Keyboard navigable** — all interactive elements reachable via Tab
- [ ] **Focus-visible styles** — visible focus ring on all focusable elements
- [ ] **ARIA labels** on icons-only buttons and non-text controls
- [ ] **Touch targets 44x44px minimum** on mobile

### SEO (when applicable)

- [ ] **Title < 60 chars** with primary keyword
- [ ] **Meta description < 160 chars** with CTA
- [ ] **Single H1** with keyword
- [ ] **JSON-LD schema** for product/organization pages
- [ ] **Lazy loading** on below-fold images

---

## DON'Ts

### Prompting

- [ ] **DON'T combine 3+ unrelated objectives** in one prompt — competing constraints = incoherent output
- [ ] **DON'T use placeholder text** — it hides spacing and hierarchy problems
- [ ] **DON'T skip the planning phase** — answer the 4 questions first (what, who, feel, constraints)
- [ ] **DON'T rewrite the entire prompt for small edits** — use the "Precision Edit" template
- [ ] **DON'T say "make it look nice"** — use specific buzzwords from Design Tone Vocabulary
- [ ] **DON'T expect perfection on first generation** — plan for 1-2 refinement passes
- [ ] **DON'T forget edge cases** — happy path AND empty/error/loading states

### Visual Anti-Patterns (from KB8)

- [ ] **DON'T use gradient text** — unless explicitly in brand guidelines
- [ ] **DON'T create 3 identical cards in a row** — vary size, content length, or visual weight
- [ ] **DON'T use default shadcn blue/indigo palette** — always apply brand tokens
- [ ] **DON'T use Shield, Zap, Rocket, Globe icons** for generic features — pick specific ones
- [ ] **DON'T apply card shadows on dark backgrounds** — use border or subtle glow instead
- [ ] **DON'T overuse rounded-full corners** — mix border-radius values per component type
- [ ] **DON'T center-align all text** — left-align body text, center only headlines (if at all)
- [ ] **DON'T use more than 1 gradient per page** — and only if part of brand identity
- [ ] **DON'T make all sections the same height** — visual rhythm needs variation
- [ ] **DON'T use generic stock-photo style illustrations** — prefer abstract, brand-aligned visuals

### Technical

- [ ] **DON'T use inline styles** — define in CSS/Tailwind classes
- [ ] **DON'T hardcode colors** — use CSS variables from design tokens
- [ ] **DON'T skip responsive testing** — verify at sm, md, lg, xl breakpoints
- [ ] **DON'T create horizontal overflow** at any breakpoint
- [ ] **DON'T ignore empty/error states** — every data-dependent section needs all 3 states
- [ ] **DON'T use explicit color classes** (`text-white`, `bg-black`) — use semantic tokens (`text-foreground`, `bg-background`)

### Process

- [ ] **DON'T modify files outside the brief scope** — use guardrails ("Do NOT edit X")
- [ ] **DON'T regenerate a good section** to fix a bad one — isolate the change
- [ ] **DON'T ignore the page-composition-checklist** — run it after generation

---

## Scoring

Count checked items after generation:

| Score | Verdict | Action |
|-------|---------|--------|
| **40+** Do's checked | Excellent | Ship it |
| **30-39** Do's checked | Good | One refinement pass |
| **< 30** Do's checked | Needs work | Re-prompt with Level 3+ |
| **Any** Don't violated | Review required | Fix specific violations before shipping |

---

## Related

- **Prompting Bible:** `squads/design/docs/prompting-bible.md` — full guide with worked examples
- **Page Composition Checklist:** `squads/design/checklists/page-composition-checklist.md` — post-generation QA
- **Anti-AI Patterns:** `squads/design/data/anti-ai-look-patterns.md` — detailed fixes per pattern
- **Prompt Templates:** `squads/design/data/prompt-templates-library.md` — 12 copy-paste templates
