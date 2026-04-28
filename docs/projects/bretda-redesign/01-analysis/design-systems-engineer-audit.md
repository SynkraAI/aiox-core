# Design Systems Engineer Audit — Bretda Redesign

## TL;DR (3 bullets)
- Token discipline is **partial-rigorous** at the color layer (11 named CSS vars, zero inline hex outside `globals.css`) but **chaotic** at typography/spacing — 24+ arbitrary `text-[Npx]` escape hatches and 7 distinct un-tokenized `tracking-[Nem]` values prove the scale never got formalized.
- Atomic-design folder structure exists (`atoms/molecules/organisms`) and is honored, but the system is missing the **semantic layer** entirely: tokens are all primitives (`--color-cream`), no `--bg-surface` / `--text-primary` / `--border-subtle` aliases. This will fracture under multi-page expansion.
- Bretda is two refactors away from a clean Google `DESIGN.md` spec: (a) collapse the typography zoo into a 6-step scale, (b) introduce a thin semantic-token layer over the existing primitives. The 3D configurator preserves cleanly because it already consumes the same vars.

## Current Site — Critical Issues (top 5, ranked by severity)

1. **Typography scale is leaking through arbitrary values.** Evidence: `text-[68px]` (hero), `text-[15px]` (hero body), `text-[12px]/text-[11px]/text-[10px]/text-[9px]` (overlines, configurador, footer headings) appear inline across 14 files (`src/components/organisms/hero.tsx:35,40,65`, `src/components/organisms/configurador-3d.tsx:187,205,231,260`, `src/components/organisms/footer.tsx:60,79,98`, `src/components/atoms/button.tsx:29-31`). Impact: H1, button label, and overline can drift independently across sections — exactly the "muito texto, muita informação" feeling the user complained about. **Fix:** define a 6-step `--text-*` scale in `@theme` and ban arbitrary `text-[*]` via a lint rule.

2. **Letter-spacing has no scale.** Evidence: `tracking-[0.08em]` (hero H1), `tracking-[0.1em]`, `tracking-[0.15em]`, `tracking-[0.18em]`, `tracking-[0.2em]`, `tracking-[0.25em]` (utility class `.overline`), `tracking-[0.35em]` (logo) — 7 unique values across `hero.tsx`, `navbar.tsx`, `footer.tsx`, `price-hint.tsx`, `logo.tsx`, `configurador-panel.tsx`. Impact: editorial typography (the lever 11ravens uses for restraint) becomes inconsistent. **Fix:** 4-step `--tracking-{tight, normal, wide, widest}` token set.

3. **No semantic-token layer.** Evidence: `globals.css:9-20` defines only primitives (`--color-cream`, `--color-charcoal`). Components reference primitives directly (`bg-cream`, `text-cream`, `border-border`). Impact: rebrand or dark/light flip requires touching every component. **Fix:** add semantic aliases — `--bg-canvas`, `--bg-surface-raised`, `--text-primary`, `--text-secondary`, `--border-subtle`, `--accent-action` — and rewrite components to consume those.

4. **Button component variants are a closed set, but other CTAs bypass it.** Evidence: `atoms/button.tsx` defines 4 variants × 3 sizes = 12 valid combos, but `molecules/configurador-panel.tsx:91,97` reimplements the primary/secondary button inline (`bg-cream text-charcoal text-[11px] tracking-[0.2em] uppercase px-4 py-3`). Two CTA implementations = system failing Brad Frost's "atom is the truth" rule. **Fix:** route configurator CTAs through `<Button>`.

5. **Tailwind v4 `@theme` block is shallow.** Evidence: `globals.css:26-44` registers colors and 2 spacing tokens (`--spacing-section`, `--spacing-section-mobile`) but no typography scale, no letter-spacing, no radius, no border-width, no shadow. Impact: every component re-invents these. The existing `@theme` is a foundation, not a system.

## Token Inventory (what exists)

| Layer | Status | Evidence |
|---|---|---|
| Color primitives | **Strong** | 11 named vars, WCAG AA verified per comment in `globals.css:6` |
| Color semantic | **Missing** | No aliases — components consume primitives directly |
| Type families | **Strong** | `--font-display` (Cormorant Garamond), `--font-body` (Raleway), wired via Next/font in `app/layout.tsx:7-19` |
| Type scale | **Missing** | No `--text-*` tokens; 24+ arbitrary `text-[*]` values |
| Letter-spacing scale | **Missing** | 7 ad-hoc tracking values |
| Spacing scale | **Partial** | Only `--spacing-section{,-mobile}`; padding/gap use raw Tailwind 4-step (`py-16`, `gap-8`) |
| Radius | **Missing** | Zero radius tokens, components use defaults |
| Shadow/elevation | **Missing** | One-off `box-shadow` in `whatsapp-pulse` keyframe only |
| Motion | **Strong** | `--ease-luxury`, `--ease-reveal`, 4 stagger classes |

## *lookup-design Results (NEW TOOLING TEST)

Command: `*lookup-design ai-platform` and `*lookup-design enterprise` (queried `.aios-core/data/design-md-index.yaml` directly; remote WebFetch was blocked by sandbox so I used the index frontmatter — `tier`, `tagline`, `keywords`, `primary_color`, `primary_font`).

**Brands consulted:**
- **Vercel** (`tier: saas`, primary_color `#000000`, primary_font `Geist`) — *"Black and white precision, Geist font"*. Pattern to steal: **two-color discipline + one proprietary type family**. Bretda's analog: charcoal/cream + Cormorant Garamond display. Vercel proves a luxury system can ship with ~3 colors and one type pair if the scale is tight.
- **Stripe** (`tier: enterprise`, primary_color `#7C3AED`, *"weight-300 elegance"*) — Pattern to steal: **single-weight typography rule** as a system invariant. Stripe codifies "marketing display = weight-300, body = weight-400" — no decorative weights. Bretda currently uses 4 weights for Cormorant + 5 for Raleway loaded from Google (`layout.tsx:9,15`); audit shows only 2-3 are actually used. Drop unused weights to cut FOIT and force the scale.
- **Apple** (luxury tier, *"Premium white space, SF Pro"*) — Pattern: **the spacing token is the brand**. Apple's design system has 7-tier spacing; Bretda has 2.

**Insights to adopt for Bretda's DESIGN.md:**
1. Vercel-style **2 surface tokens, 2 text tokens, 1 accent** as the entire color semantic layer.
2. Stripe-style **declared weights as invariant** — `display: 300/700`, `body: 400/600`, drop the rest.
3. Apple-style **7-step spacing scale** with section/component/inline buckets.

## Recommended Token System (canonical tree)

```
Primitive (already exists, keep)
  color.cream, color.cream-dark, color.gray-{light,medium,muted}
  color.charcoal, color.charcoal-{secondary,tertiary}, color.border, color.whatsapp{,-hover}

Semantic (NEW — add this layer)
  bg.canvas              → charcoal
  bg.surface-raised      → charcoal-secondary
  bg.surface-overlay     → charcoal-tertiary
  text.primary           → cream
  text.secondary         → gray-medium
  text.muted             → gray-muted
  border.subtle          → border
  accent.action          → cream (inverted on dark)
  accent.action-hover    → cream-dark
  channel.whatsapp       → whatsapp

Component (NEW — minimal, only when 3+ uses justify)
  button.bg-primary      → accent.action
  button.text-primary    → bg.canvas
  button.tracking        → tracking.widest
  overline.size          → text.xs
  overline.tracking      → tracking.widest
```

**Type scale (NEW — replaces all `text-[*]`):**
`text.2xs (10px) · text.xs (11px) · text.sm (13px) · text.base (15px) · text.lg (18px) · text.2xl (24px) · text.3xl (32px) · text.5xl (48px) · text.display (68px)`

**Tracking scale (NEW):** `tracking.tight (0.08em) · tracking.normal (0.15em) · tracking.wide (0.2em) · tracking.widest (0.25em)` — collapses the current 7 values to 4.

## DESIGN.md Draft Sketch (YAML frontmatter)

```yaml
brand: bretda
voice: editorial-luxury
tokens:
  color:
    semantic:
      bg.canvas:             "{color.charcoal}"            # #2A2B26
      bg.surface-raised:     "{color.charcoal-secondary}"  # #353630
      text.primary:          "{color.cream}"               # #FEF7F2
      text.secondary:        "{color.gray-medium}"         # #B4B5AC
      border.subtle:         "{color.border}"              # #4A4B44
      accent.action:         "{color.cream}"
      channel.whatsapp:      "{color.whatsapp}"            # #25D366
  type:
    family:
      display: "Cormorant Garamond, Georgia, serif"
      body:    "Raleway, Century Gothic, sans-serif"
    weight:
      display: [400, 700]    # drop 500, 600
      body:    [400, 600]    # drop 300, 500, 700
    scale:
      2xs: 10px ; xs: 11px ; sm: 13px ; base: 15px
      lg: 18px ; 2xl: 24px ; 3xl: 32px ; 5xl: 48px ; display: 68px
    tracking:
      tight: 0.08em ; normal: 0.15em ; wide: 0.2em ; widest: 0.25em
  spacing:
    section: 120px ; section-mobile: 80px
    block: 64px ; component: 24px ; inline: 8px ; hairline: 1px
  motion:
    ease.luxury: "cubic-bezier(0.25,0.46,0.45,0.94)"
    ease.reveal: "cubic-bezier(0.16,1,0.3,1)"
    duration.fast: 200ms ; duration.base: 400ms ; duration.slow: 800ms
```

## Out of Scope (deferred)

- 3D configurator (`organisms/configurador-3d.tsx`) — already consumes the same CSS vars, will inherit semantic layer for free.
- Film grain overlay (`globals.css:67-78`) — keep as-is, it's a brand signature, not a token.
- Animation system — already strong, no changes recommended.
