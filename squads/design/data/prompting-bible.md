---
title: "Page Composer Prompting Bible"
purpose: "Master reference for synthesizing all 9 KBs into effective page composition prompts"
version: "1.0.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/ + squad KBs cross-reference"
created: "2026-03-08"
---

# Page Composer Prompting Bible

> How to write prompts that produce production-grade pages on the first try.

---

## Why This Exists

The Page Composer loads **9 knowledge bases**. Each KB solves a different problem. Used individually, they produce decent output. Combined correctly, they produce pages indistinguishable from hand-crafted design. This guide teaches the combination.

---

## The 9 Knowledge Bases — What Each Solves

| # | KB | File | Solves |
|---|-----|------|--------|
| 1 | Layout Framework | `page-layout-framework.md` | Grid, columns, breakpoints, responsive techniques |
| 2 | Page Type Patterns | `page-type-patterns.md` | Section structure, wireframes, component maps per page type |
| 3 | Typography Hierarchy | `typography-hierarchy-rules.md` | Type scale, vertical rhythm, heading hierarchy |
| 4 | Spacing Rhythm | `spacing-rhythm-system.md` | 4px grid, proximity rules, whitespace strategies |
| 5 | Copy-to-Layout Bridge | `copy-to-layout-bridge.md` | AIDA/PAS/StoryBrand → layout decisions, eye-tracking patterns |
| 6 | Component Index | `component-index.json` | 46 shadcn/ui components — deterministic selection |
| 7 | SEO Rules | `seo-rules.md` | Meta, JSON-LD, semantic HTML, canonical tags |
| 8 | Anti-AI Patterns | `anti-ai-look-patterns.md` | 10 patterns that make pages look generic |
| 9 | Prompt Templates | `prompt-templates-library.md` | 12 copy-paste templates following 3-Input Framework |

---

## The 4 Levels of Prompting

Inspired by Lovable's "Prompting Bible", adapted for AIOX Page Composer.

### Level 1 — Skeleton (minimum viable prompt)

```
Build a landing page for AIOX Squad targeted at tech founders.
Main CTA: "Start Free Trial."
```

**What you get:** Generic layout, default colors, placeholder-quality sections. Functional but forgettable.

**KBs activated:** KB2 (page type), KB6 (components). That's it.

### Level 2 — Contextual (add WHO and WHY)

```
Build a landing page for AIOX Squad targeted at tech founders
who are evaluating AI development tools for their startup.
They need to decide within a free trial whether AIOX replaces
their current dev workflow. Main CTA: "Start Free Trial."
```

**What you get:** Sections start making sense — features address evaluation criteria, testimonials target founders, pricing shows comparison value.

**KBs activated:** KB2, KB5 (copy framework), KB6.

### Level 3 — Constrained (add HOW it should look and feel)

```
Build a landing page for AIOX Squad targeted at tech founders
who are evaluating AI development tools for their startup.
They need to decide within a free trial whether AIOX replaces
their current dev workflow. Main CTA: "Start Free Trial."

Tone: premium + developer-focused.
Mobile-first. Dark mode.
Color palette: use brand tokens (zinc-950 base, emerald accents).
Font: Inter for body, JetBrains Mono for code snippets.
```

**What you get:** Visually distinctive. Spacing, typography, colors all aligned to a coherent aesthetic. No longer looks "AI-generated."

**KBs activated:** KB1 (layout), KB2, KB3 (typography), KB4 (spacing), KB5, KB6, KB8 (anti-AI).

### Level 4 — Surgical (full specification)

```
Build a landing page for AIOX Squad targeted at tech founders
who are evaluating AI development tools for their startup.
They need to decide within a free trial whether AIOX replaces
their current dev workflow. Main CTA: "Start Free Trial."

Tone: premium + developer-focused.
Mobile-first. Dark mode.
Color palette: use brand tokens (zinc-950 base, emerald accents).
Font: Inter for body, JetBrains Mono for code snippets.

Sections:
1. Hero — headline: "Ship 10x faster with AI agents that actually understand your codebase",
   subtext: "AIOX orchestrates specialized AI agents...", CTA: "Start Free Trial"
2. Social proof — 4 company logos + "Trusted by 200+ teams"
3. Features — 3 asymmetric cards (one featured/larger):
   - Agent orchestration
   - Story-driven development
   - Automated QA loops
4. Demo — tabbed code snippets showing 3 workflows
5. Testimonials — 2 quotes with avatar, name, role, company
6. Pricing — 2 tiers (Starter / Pro) with feature comparison toggle
7. FAQ — 5 questions addressing: security, vendor lock-in, learning curve, team size, integrations
8. Final CTA — "Start building. Free for 14 days."

States: loading skeletons for testimonials and pricing.
Do NOT use gradient text. Do NOT use generic shield/rocket icons.
```

**What you get:** Production-ready page. Every section has real content, correct hierarchy, proper states, and brand-consistent design.

**KBs activated:** All 9.

---

## The Synthesis Formula

Every great prompt follows this structure:

```
[WHAT] Build a [page type] for [product/brand].
[WHO]  Used by [persona], in [moment], to [decision/outcome].
[HOW]  Tone: [buzzwords]. [Device]. [Color]. [Font].

[SECTIONS] (ordered, with real content per section)
1. [Section] — [components, data, interactions]
2. [Section] — ...

[CONSTRAINTS] (what NOT to do)
- Do NOT [anti-pattern]
- Do NOT modify [protected files]
- States: [loading/empty/error for dynamic sections]
```

### Mapping to KBs

| Prompt Section | KBs Used | Why |
|---|---|---|
| `[WHAT]` page type | KB2 → selects section template + wireframe | Structure |
| `[WHO]` persona + moment | KB5 → selects copy framework (AIDA/PAS/SB) | Content strategy |
| `[HOW]` buzzwords | KB4 → spacing strategy, KB3 → type scale | Visual coherence |
| `[HOW]` device | KB1 → layout + responsive techniques | Responsiveness |
| `[HOW]` color/font | KB3 + design tokens | Brand alignment |
| `[SECTIONS]` ordered list | KB6 → component selection per section | Component accuracy |
| `[CONSTRAINTS]` anti-patterns | KB8 → specific patterns to avoid | Quality |
| `[CONSTRAINTS]` states | KB9 template #9 (Component States) | Completeness |
| Implicit (always) | KB7 → SEO meta, semantic HTML | SEO |

---

## 5 Worked Examples

### Example 1: Bad → Good (Landing Page)

**Bad prompt:**
```
Make a landing page for our AI tool. Make it look modern and professional.
```

**Why it fails:** No persona, no sections, no constraints, "modern" means nothing concrete. Activates 0 KBs effectively.

**Good prompt:**
```
Build a landing page for AIOX Squad (AI development orchestration platform).
Used by CTOs and tech leads evaluating dev tools for teams of 5-50 engineers.
They compare us against Cursor, Copilot, and manual workflows.

Tone: premium + developer-focused.
Mobile-first. Dark mode default.
Color: zinc-950 base, emerald-500 accents. Font: Inter + JetBrains Mono.

Sections:
1. Hero — "Ship 10x faster with AI agents", CTA: "Start Free Trial"
2. Social proof — 4 company logos row
3. Features — 3 cards (asymmetric, one featured): agents, stories, QA
4. Code demo — tabbed snippets showing 3 real workflows
5. Testimonials — 2 cards with photo, quote, name, role
6. Pricing — 2 tiers toggle (monthly/annual)
7. FAQ — 5 questions (security, lock-in, learning curve, team size, integrations)
8. Final CTA — "Start building. 14 days free."

Constraints:
- No gradient text, no generic icons (shield/rocket/globe)
- Loading skeletons for testimonials and pricing sections
- Do NOT use default shadcn blue/indigo palette
```

---

### Example 2: Dashboard

```
Build a campaign performance dashboard for AIOX Traffic Squad.
Used by media buyers to decide which campaigns to scale vs kill, reviewed daily at 9am.

Tone: developer-focused + corporate.
Desktop-first with responsive collapse.
Color: dark mode, status system (green=scale, yellow=watch, red=kill).

Layout:
- Sidebar: Campaigns, Analytics, Budget, Settings
- Top bar: date range picker, search, notifications, avatar
- KPI row: 4 cards (Spend, ROAS, CPA, Conversions) with sparklines
- Primary view: sortable table with columns: Campaign, Status, Spend, ROAS, CPA, Conv, Trend
- Filters: platform, status, date range, min spend

States: skeleton loaders for KPIs and table. Empty state for no campaigns.
Do NOT use pie charts. Do NOT use card shadows on dark backgrounds.
```

---

### Example 3: Auth Flow

```
Build a signup page for AIOX Platform.
Used by new users arriving from the landing page to create their first workspace.

Layout: split-screen — left: brand panel, right: form.
Brand panel: AIOX logo + "Agora o controle é seu" + abstract geometric illustration.

Form:
- Full name, email, password (strength indicator)
- Google OAuth button
- "Already have an account? Sign in" link

Tone: minimal + premium.
States: submitting spinner, inline validation errors, success redirect animation.
Do NOT use default form styling. Match brand tokens.
```

---

### Example 4: Iterating on Existing Page (Precision Edit)

```
This update requires utmost precision.

Current state: the Features section on /landing has 3 uniform cards (same size, same icon style).
Change requested: make the first card 2x wider (featured), add a code snippet inside it, keep the other 2 as-is.

Do NOT modify: Hero section, Footer, any other page.
Do NOT change the card component API — extend via variant prop.

Verify: responsive behavior at md and sm breakpoints after change.
```

---

### Example 5: Component Individual

```
Create a PricingToggle component for the AIOX landing page.
Used by visitors to switch between monthly and annual pricing (showing savings).

Core elements:
- Toggle switch with "Monthly" / "Annual" labels
- "Save 20%" badge on annual (animated entrance)
- Controlled component: onChange callback with period value

Variants:
- Size: sm (inline) / md (standalone)
- Theme: light / dark

Constraints:
- Keyboard navigable (arrow keys toggle)
- ARIA: role="radiogroup" with aria-checked
- Animation: 200ms ease-out transition
- Follow design system tokens — no hardcoded colors
```

---

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| "Make it look nice" | Zero KBs activated — output is random | Use buzzwords from Design Tone Vocabulary |
| 3+ objectives in one prompt | Competing constraints produce incoherent output | One page type, one persona, one aesthetic |
| Lorem ipsum in brief | Hides spacing/hierarchy problems until too late | Always use real copy, even draft copy |
| Skipping states | Only happy-path generated — page breaks with real data | Always specify loading + empty + error |
| No anti-pattern constraints | AI defaults to gradient text, uniform grids, generic icons | Add 2-3 explicit "Do NOT" lines |
| Editing prompt entirely for small fix | Regenerates everything, losing good parts | Use "Precision Edit" template (#11) |
| "Add a dashboard" | No persona, no metrics, no decisions defined | Specify WHO sees WHAT to decide WHAT |

---

## Quick Reference Card

Before writing any prompt, answer these 4 questions:

1. **What is the product?** → Selects page type (KB2) and component map (KB6)
2. **Who uses it and for what decision?** → Selects copy framework (KB5)
3. **What should it feel like?** → Selects spacing (KB4), typography (KB3), and anti-patterns (KB8)
4. **What are the hard constraints?** → Device (KB1), colors, protected files, states

If you can't answer all 4, your prompt isn't ready.
