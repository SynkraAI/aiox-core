# Bretda Redesign — Context Brief

**Project**: Bretda website redesign (current site at https://bretda.com.br is too cluttered/text-heavy per user feedback; user wants 11ravens.com-quality minimalism)

**Date**: 2026-04-27
**Owner**: design-lead (orchestrator) + 4 design specialists (Phase 1) + 5 mind clones (Phase 2 conclave)

---

## Mission

Redesign Bretda's website to match the navigation-clarity and visual restraint of 11ravens.com, while preserving Bretda's luxury furniture identity (mesas de bilhar/sinuca/pebolim/tênis de mesa, ticket R$ 33K+).

---

## User's Pain Points (verbatim)

> "estou achando ele extremamente confuso, tem muita informação e muito texto, olha o site da 11ravens por exemplo a navegação e o design é bem melhor que o meu"

Translation: site has too much information density and text. 11 Ravens has cleaner nav + better design.

---

## Hard Constraints (NON-NEGOTIABLE)

1. **PRESERVE 3D Configurator**. The Three.js configurator at the existing site is the only feature to keep from current site. All other sections, components, copy, navigation must be redesigned.
2. **PRESERVE brand identity**: Bretda logo (D:/AIOS/docs/bretda/Bretda_CustomGPT_Knowledge/07_Identidade/), product line names (Opal, Aurora, Ambar, Citrino, Espinela, Berilo, Zurita, Cobal).
3. **PRESERVE all 13 GLB 3D models** (D:/AIOS/apps/bretda-lp/public/models/) — they feed the configurator.
4. **PRESERVE LGPD compliance + CNPJ Blumenau footer** (legal requirement).

---

## Reference: What "good" looks like

### 11ravens.com (the benchmark)
- **Hero**: Single 1080p autoplay video (mansion + tables, 63s), zero text overlay except logo. Then minimal CTA.
- **Navigation**: 5-7 items max, persistent top bar, no hamburger on desktop, generous letter-spacing.
- **Section density**: ~1 idea per scroll viewport. Lots of whitespace. Editorial typography.
- **Visual signature**: Gold leaf/champagne metal + walnut wood + black felt + sunset golden hour photography.
- **Copy**: Short. Editorial captions, not paragraphs.
- **Hero video URL** (for reference): https://dxt1dc7xo1tv8.cloudfront.net/11rbg26.mp4
- **Local downloaded**: C:\Users\kingp\Downloads\11ravens-hero\11ravens-hero-2025-variant.mp4 (1080p)

### Current Bretda (the problem)
- URL: https://bretda.com.br/
- Title: "Bretda — Mesas Artesanais de Luxo | Sinuca, Pebolim, Tenis de Mesa"
- H1: "Elevando o Entretenimento para um Patamar de Luxo"
- Per user: too much text, too much info density, navigation unclear.
- Source code: `D:/AIOS/apps/bretda-lp/` (Next.js 16)

---

## Key Assets (paths)

### Bretda product renders (use as visual content)
- Isolated PNG (transparent/black bg): `D:/AIOS/docs/bretda/Bretda_CustomGPT_Knowledge/04_Renders_Mesas/{Model}_{01,02,03}.png`
- Lifestyle JPG (with environment): `D:/AIOS/docs/bretda/Bretda_CustomGPT_Knowledge/04_Renders_Mesas/{Model}_Ambiente_{01,02,03}.jpg`
- Models available: Opal, Aurora, Ambar, Citrino, Espinela
- Hero candidate: **Opal** (Z-base architecture, walnut + champagne metal, most distinctive silhouette)

### Identity
- `D:/AIOS/docs/bretda/Bretda_CustomGPT_Knowledge/07_Identidade/`
  - BRETDA-Black.svg, BRETDA-White.svg (full logos)
  - BRETDA-Black-Single.svg, BRETDA-White-Single.svg (logomark only)
  - Simbolo-bretda-black.svg, Simbolo-bretda-white.svg (raven symbol)

### 3D Models (for configurator)
- `D:/AIOS/apps/bretda-lp/public/models/*.glb` (13 files, ~40MB total)
- Specs: ~30K triangles each, web-optimized PBR (base color only, no normal/roughness maps)

### Existing brand voice/copy
- `D:/AIOS/docs/bretda/Bretda_CustomGPT_Knowledge/03_MATERIAIS_Catalogo.md`
- `D:/AIOS/docs/bretda/Bretda_CustomGPT_Knowledge/02_PLAYBOOK_47_Prompts.docx`
- `D:/AIOS/outputs/copy/bretda/`

### Tech stack
- Next.js 16, React, Tailwind CSS, Three.js for configurator
- Hosted: Vercel (current canonical: https://bretda.com.br)

---

## Tooling for Specialists (TEST IN THIS RUN)

These commands are NEW (just integrated). Each specialist MUST exercise at least one as part of the audit:

- `*lookup-design {brand|vertical|tier}` — search 69-brand DESIGN.md library at `.aios-core/data/design-md-index.yaml`. Tiers available: `luxury` (Apple, Tesla, Ferrari, Lamborghini, BMW, Nike), `enterprise` (IBM, Stripe, MongoDB, Supabase, etc), `saas` (Linear, Notion, Cal.com, Vercel, Cursor, Raycast, Figma, Framer), `consumer` (Spotify, Airbnb, Shopify, Starbucks), `ai-platform` (Claude, Cohere, Mistral, ElevenLabs, Ollama).
- `*lint-design {file}` — validate any DESIGN.md
- `*export-design {file} --format tailwind|dtcg`
- `*diff-design {a} {b}`

Tier suggestion per agent:
- **ui-designer** → query `*lookup-design luxury` + `*lookup-design automotive` (Ferrari, Lamborghini for high-ticket visual restraint)
- **ux-design-expert** → query `*lookup-design saas` (Linear, Notion for clean IA)
- **design-systems-engineer** → query `*lookup-design ai-platform` (Claude, Vercel for token rigor)
- **ux-designer** → query `*lookup-design ecommerce` (Apple, Stripe for conversion patterns)

---

## Mind Clones to Consult (Phase 2 — design-lead orchestrates)

Via `mcp__aios-brain-bridge__request_expert_consultation` (auto-conclave or single):
- **dieter-rams** — "weniger aber besser" (less but better) — minimalism principles
- **don-norman** — cognitive load, affordances, signifiers, Norman doors of UI
- **brad-frost** — atomic design, system clarity (he wrote the bible)
- **tobias-van-schneider** — visual minimalism for luxury (DesignBetter podcast, MOOI/SVA)
- **erik-spiekermann** — typography for luxury/editorial (FF Meta, Berthold)

---

## Output Structure (each agent owns their file)

```
docs/projects/bretda-redesign/
├── 00-context/
│   └── BRIEF.md                          ← THIS FILE (read this first)
├── 01-analysis/                          ← Phase 1 outputs
│   ├── ui-designer-audit.md
│   ├── ux-design-expert-audit.md
│   ├── design-systems-engineer-audit.md
│   └── ux-designer-audit.md
├── 02-conclave/
│   └── CONCLAVE-SYNTHESIS.md             ← Phase 2 output
└── 03-redesign/
    ├── DESIGN.md                          ← Phase 3 canonical (validates via *lint-design)
    └── REDESIGN-PROPOSAL.md               ← Phase 3 section-by-section spec
```

---

## Per-Agent Audit Format (use this template)

```markdown
# {Role} Audit — Bretda Redesign

## TL;DR (3 bullets)
- ...
- ...
- ...

## Current Site — Critical Issues (top 5, ranked by severity)
1. **[issue]** — Evidence: [...]. Impact: [...]. Fix: [...].
2. ...

## Benchmark Comparison (11ravens.com vs Bretda)
| Aspect | 11 Ravens | Bretda current | Delta |
|---|---|---|---|

## *lookup-design Results (NEW TOOLING TEST)
Command run: `*lookup-design {tier}`
Top 3 brands consulted: ...
Insights stolen / patterns to adopt: ...

## Recommended Changes (specific, actionable)
1. ...
2. ...

## Out of Scope (deferred or 3D-configurator preserve)
- ...
```

---

## Phase 1 Time Budget

Each specialist: ~10-15 min focused audit, ~600-800 words output. Don't over-engineer. Rank ruthlessly. The user wants **clarity + decisions**, not exhaustive analysis.

---

## Quality Bar

- Be opinionated. "It's all bad" is worth more than "everything could be better."
- Quote evidence (URLs, sections, specific copy phrases).
- When you propose a change, propose the SPECIFIC replacement (not "make it cleaner" — say "remove sections X, Y, Z; replace hero with single autoplay video + 3-word headline + single CTA").
- When you reference a benchmark from *lookup-design, name the brand and what specifically to mimic (not just "like Linear" — "like Linear: persistent top nav with 5 items, no logo lockup with tagline, sentence-case nav labels, 16px base type").

---

End of brief. All Phase 1 specialists must read this file before starting their audit.
