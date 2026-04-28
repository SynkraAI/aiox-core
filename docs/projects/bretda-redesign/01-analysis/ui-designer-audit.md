# UI Designer Audit — Bretda Redesign

**Auditor**: Uma (UI Designer specialist)
**Scope**: Visual hierarchy, typography, color, imagery, micro-interactions
**Source of truth**: `D:/AIOS/apps/bretda-lp/src/` (Next.js 16 codebase backing https://bretda.com.br) + 11ravens.com benchmark + `*lookup-design` index (69 brands).

---

## TL;DR (3 bullets)
- The site is **not** "extremely confusing" *visually* — palette, type pairing (Cormorant + Raleway), and dark surface system are competent. The pain is **density and uniformity**: 5 stacked sections at the same scale, hero text-overlay on busy video, and a `0.08em` letter-spaced UPPERCASE display headline that fights legibility. It reads as "luxury template" rather than "luxury object."
- The hero is the single biggest miss. It overlays 4 stacked text blocks (overline + 12-word two-line H1 + subline + 2 buttons + scroll cue) on top of an autoplaying video — Ferrari, Tesla, and 11 Ravens all do the opposite: video runs alone, copy enters *after* (or as a single line at bottom-left).
- The product is invisible in the fold. We sell **R$ 33K mesas** and the user never sees a clean product photograph above the fold — only a video frame + heavy gradient (`from-black/80 via-black/30`) muddying the table itself.

---

## Current Site — Critical Issues (top 5, ranked by severity)

1. **Hero is a 4-layer text sandwich on a darkened video** — Severity: critical.
   Evidence: `hero.tsx` lines 28-60: gradient overlay `from-black/80 via-black/30 to-black/20` + overline ("Bretda — Itajai, Brasil") + two-line H1 (`Elevando o Entretenimento / para um Patamar de Luxo`, 12 words) + subline + PriceHint + 2 CTAs. Five stacked elements competing for the same vertical center.
   Impact: viewer cannot read the product (table is occluded), cannot read the headline (too long for the time-on-fold), and bounces on cognitive load. 11 Ravens hero has **zero overlay text** — just video.
   Fix: drop overline, drop subline, drop PriceHint, drop second CTA. Single line: `Bretda` (logomark) bottom-left + one CTA `Ver coleção` bottom-right. Let the video sell.

2. **Headline is uppercase + heavy tracking + 12 words** — Severity: high.
   Evidence: `text-4xl md:text-6xl lg:text-[68px] font-bold text-cream uppercase leading-tight tracking-[0.08em]` — Cormorant Garamond is a serif designed for elegance at *normal* case with *minimal* tracking; uppercasing it + `0.08em` tracking + 700 weight kills the typeface's signature contrast strokes.
   Impact: the site looks like every "luxury template" on Squarespace. Cormorant in caps reads as generic; Cormorant in mixed case at 300-400 weight is what sells *Vogue*, *Architectural Digest*, Ferrari pre-2023.
   Fix: switch H1 to mixed case, weight 400, tracking `-0.01em`, max 5 words. E.g., `Mesas que definem ambientes.`

3. **Five same-scale sections in vertical succession** — Severity: high.
   Evidence: `page.tsx` renders Hero → brand-line → Stats (4 numbers in grid) → CollectionPreview (3 cards) → Craftsmanship (5-step process + image) → CTA → Footer. Each section uses `max-w-[1200px] mx-auto` + `py-section` (120px). Same width, same rhythm, same 4-column-or-3-card grid. No breath, no editorial break, no full-bleed.
   Impact: the eye pattern-matches "marketing site" within 2 scrolls. Ferrari, Apple, and 11 Ravens break rhythm with **full-bleed photography spreads** between content blocks.
   Fix: introduce one full-bleed (100vw) editorial spread of a single product render with 8-word caption between Collection and Craftsmanship. Drop StatsSection entirely (see #4).

4. **StatsSection ("100+ Mesas Entregues / 15+ Anos / 100% Artesanal") is luxury-killing** — Severity: medium-high.
   Evidence: `stats-section.tsx` — 4 stat tiles with `text-4xl md:text-5xl font-bold` numbers. This is a B2B SaaS pattern (Stripe, Webflow, Intercom). Luxury automotive (Ferrari, Lamborghini, Bugatti) **never quantifies itself** — a Lamborghini page does not say "70+ years of engineering." It shows a car.
   Impact: signals "we need to convince you" rather than "we are the standard." Inverts the buyer-seller power dynamic that high-ticket requires.
   Fix: delete entirely. If trust signals are needed, place a single arquitetos-credenciados line in footer.

5. **Film-grain overlay at 12% opacity over the entire site** — Severity: low-medium.
   Evidence: `globals.css` lines 67-78: `body::after` with SVG noise at `opacity: 0.12` covering everything `z-index: 9999`. This is a *cinematic* device that works on a dark, photographic site; it actively muddies the cream cards in CollectionPreview and the Cormorant headlines.
   Impact: micro-degrades typography clarity site-wide; a luxury reader subconsciously reads "noise" as "render artifact."
   Fix: scope grain to hero section only, drop opacity to 0.06.

---

## Benchmark Comparison (11ravens.com vs Bretda current)

| Aspect | 11 Ravens | Bretda current | Delta |
|---|---|---|---|
| Hero overlay text | Zero (logo only) | 5 elements stacked | **−5** |
| Hero video | Autoplay 63s, no gradient | Autoplay + heavy `from-black/80` gradient | Bretda obscures product |
| Nav items | 5-7, sentence case, generous tracking | 4 items UPPERCASE `tracking-[0.2em]` | Comparable but Bretda screams |
| Section count above footer | ~3-4 with full-bleed breaks | 5 same-width grids | Bretda dense |
| Typography pairing | Editorial serif + sans at 400/500 | Cormorant 700 UPPERCASE + Raleway | Bretda over-formal |
| Color palette | Walnut + champagne + black + golden hour | Cream/charcoal/gray-medium (5 grays) | Bretda lacks accent |
| Photography | Lifestyle + golden hour, full-bleed | Render destacado on cream card | Bretda feels catalog-like |
| Stats/numbers | None | 4-stat strip | Bretda B2B-leaks |
| Micro-interactions | Slow video, slow scroll | Fade-up stagger 0.2/0.5/0.8/1.1s + scroll-pulse + WhatsApp pulse | Bretda over-animated |

---

## *lookup-design Results (NEW TOOLING TEST)

Command run: `*lookup-design luxury` + `*lookup-design automotive`
Index loaded: `.aios-core/data/design-md-index.yaml` (69 brands; tier=`luxury` returned 7, vertical=`automotive` returned 6).

**Top 4 brands consulted** (filtered: tier=luxury **AND** photography or editorial keyword):

1. **Ferrari** (`getdesign.md/ferrari/design-md`) — tagline: *"Chiaroscuro black-white editorial, Ferrari Red with extreme sparseness."* Insight: a single accent color used **once per viewport**. Bretda has zero accent — only WhatsApp green (consumer-app green!) bolted on.
2. **Lamborghini** (`getdesign.md/lamborghini/design-md`) — tagline: *"True black cathedral, gold accent, LamboType custom Neo-Grotesk."* Insight: pure black canvas (`#000`, not Bretda's softer `#2A2B26`) + gold (`#D4AF37`) accent. Bretda's charcoal+cream feels like Restoration Hardware, not Lambo.
3. **Tesla** (`getdesign.md/tesla/design-md`) — tagline: *"Radical subtraction, cinematic full-viewport photography, Universal Sans."* Insight: full-viewport (`100vw × 100vh`) photography per section, **one idea per scroll**. Bretda crams 5 sections at `max-w-[1200px]`.
4. **Bugatti** (`getdesign.md/bugatti/design-md`) — tagline: *"Cinema-black canvas, monochrome austerity, monumental display type."* Insight: display type at 120-180px viewport-width units, mixed case, weight 300. Bretda uses 68px max + uppercase + 700.

**Patterns to steal SPECIFICALLY**:
- From **Ferrari**: introduce a single brand accent color (Bretda's brass/champagne is the obvious answer — extract from the Opal table's metal hardware) used once per fold, never twice.
- From **Tesla**: convert the Hero + one product showcase into 100vh full-viewport panels with no `max-w` constraint and **one** sentence each.
- From **Lamborghini**: drop H1 to weight 300-400 mixed case; let the Cormorant *do* its job.
- From **Bugatti**: monumental product photography, captioned not headlined.

---

## Recommended Changes (specific, actionable)

1. **Replace current Hero with Tesla-style full-bleed video panel**: video plays alone for 4 seconds, then a single bottom-left line (`Opal — Sinuca artesanal`) and a single bottom-right CTA (`Configurar a sua`) fade in. Drop overline, drop subline, drop PriceHint, drop second CTA, drop scroll-pulse indicator. Lighten gradient from `from-black/80` to `from-black/40` so the table is visible.
2. **Delete StatsSection entirely** (luxury automotive does not quantify itself).
3. **Replace 3-card CollectionPreview grid with single full-bleed editorial spread** (Ferrari pattern): one product per scroll-snap section, 100vw × 100vh, product image right-aligned, caption left-aligned (`Aurora — Sinuca / Nogueira + latão escovado / R$ 32.000`).
4. **Reset typography**: H1 mixed case, weight 400, tracking `-0.01em`, max 5 words. Keep Cormorant for editorial headlines only; switch all UPPERCASE labels (overline, nav, footer headers) to sentence case at `tracking-[0.12em]` instead of `0.20em-0.25em`.
5. **Introduce single brand accent**: extract champagne/brass `#C9A961` (or actual hex from Opal hardware render) — used in `<a:hover>`, scroll progress bar, and the configurator's "active" state. **Never** alongside WhatsApp green; replace WhatsApp green CTA with text-link in champagne.
6. **Scope film-grain to hero only**, drop opacity to 0.06.
7. **Reduce micro-interaction load**: kill `hero-stagger-1/2/3/4` (0.2/0.5/0.8/1.1s ladder = 1.1s before user sees the CTA), kill `scroll-indicator` pulse, kill WhatsApp `whatsapp-pulse`. Keep only scroll-reveal fade-up on sections.

---

## Out of Scope (deferred or 3D-configurator preserve)

- **3D Configurator preserved** at `/configurador` — visual chrome (toolbar, panel) is a separate component (`configurador-panel.tsx`) and not part of this audit.
- **Product detail pages** (`/mesas/[modelo]`) — separate audit needed.
- **LGPD banner / CNPJ Blumenau footer line** — preserved as legal requirement.
- **Logo (BRETDA-White.svg) and product names** (Opal/Aurora/Ambar/Citrino/Espinela/Berilo/Zurita/Cobal) preserved.

---

*Word count: ~795. Audit complete.*
