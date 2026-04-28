# Bretda Redesign — Implementation Proposal

**Version**: 1.0 (Phase 3 deliverable)
**Date**: 2026-04-27
**Author**: Design Chief (synthesizing Phase 1 audits + Phase 2 conclave)
**For**: aios-dev (implementation owner — Phase 4)
**Source of truth for tokens**: `D:/AIOS/apps/bretda-lp/DESIGN.md`

This document is the section-by-section spec. It does **not** restate token values — those live in `DESIGN.md`. It tells aios-dev *what* to build, *why*, and *what to delete*.

---

## Hard Constraints (preserve)

1. **3D Configurator** at `/configurador` — Three.js source unchanged; only restyle frame/UI per new tokens. All 13 GLB models in `public/models/` preserved.
2. **Brand identity** — `BRETDA-White.svg`, `Simbolo-bretda-white.svg`, product line names (Opal · Aurora · Ambar · Citrino · Espinela · Berilo · Zurita · Cobal), tier positioning (R$33K+).
3. **LGPD + CNPJ Blumenau** in footer (legal requirement).
4. **Next.js 16 + Tailwind v4 stack**. No framework migration.
5. **Vercel hosting** (`bretda.com.br`).

---

## Information Architecture (final)

### Top Navigation (4 items, persistent on desktop, drawer on mobile)

| # | Label | Route | Justification |
|---|---|---|---|
| 1 | Coleção | `/colecao` | Content-type noun. Replaces "/mesas". |
| 2 | Configurador | `/configurador` | **Surface the differentiator.** Replaces "Para Arquitetos" — Norman category violation removed. |
| 3 | Atelier | `/atelier` | Replaces "Sobre". Editorial framing of craft. |
| 4 | Contato | `/contato` | Same route as today. |

**Removed from nav**: the "Solicitar Projeto" CTA-button. The nav is for navigation; CTAs live in content. (Linear, 11 Ravens, Vercel patterns.)

### Homepage Sections (3 sections — was 5)

1. **Hero** — full-bleed video band (100vw × 100vh), single caption, single CTA.
2. **Coleção** — 3-column lifestyle gallery (Opal | Aurora | Ambar). Editorial captions only.
3. **Atelier band** — 1-line craft statement + single full-bleed photograph.

**Footer** follows. No "CTASection". No "StatsSection". No "CraftsmanshipSection" with 5-step diagram.

### Pages (full sitemap)

```
/                       Homepage (3 sections)
/colecao                Collection grid (8 models, no copy above)
/colecao/[slug]         Product page (6 vertical blocks, configurator inline)
/configurador           Standalone configurator (preserved)
/atelier                Atelier (replaces /sobre — editorial)
/contato                Contact (form + WhatsApp + showroom address)
/legal/privacidade      LGPD policy (preserved)
```

Routes that exist today and **must be deleted or redirected**:
- `/sobre` → `301` to `/atelier`
- `/mesas` → `301` to `/colecao`
- `/mesas/[modelo]` → `301` to `/colecao/[slug]`

---

## Section-by-Section Spec

### 1. Hero (`organisms/hero.tsx`)

**Goal**: zero cognitive load above the fold. The table is the argument.

**Asset**: full-bleed autoplay-loop muted video, **100vw × 100vh**, `object-cover`, `playsInline`.
- Acceptable for sprint 1: existing hero video (if quality meets bar) OR a 30-60s render-to-video of the Opal table from the configurator at golden-hour lighting.
- Sprint 2 (deferred): commission real photography/videography in a Brazilian luxury interior.

**Layers (only 4, all minimal)**:
1. **Video** (z-0): full-bleed, `object-cover`, autoplay loop muted.
2. **Gradient** (z-10): `from-canvas/40 via-canvas/0 to-canvas/30` — a *whisper* gradient. **Lighten from current `from-black/80`.** The product must be visible.
3. **Caption** (z-20, bottom-left, 32px from edge): `Opal — Sinuca artesanal` in `headline-md` (Cormorant 24px mixed case 400). On mobile: `lede` (18px). No overline above it. No subline below it.
4. **CTA** (z-20, bottom-right, 32px from edge): single primary button `Ver a Coleção →` → `/colecao`. Champagne fill. Per `DESIGN.md` button-primary spec.

**DELETE from current hero**:
- The overline `"Bretda — Itajaí, Brasil"` (kill).
- The two-line H1 `"Elevando o Entretenimento / para um Patamar de Luxo"` (kill — replace with caption only).
- The 9-word subline (kill).
- The `<PriceHint>` A/B element (kill — move to product page if needed).
- The secondary CTA `"Conhecer a Coleção"` (kill — duplicates primary).
- The scroll indicator with pulse animation (kill — every modern site scrolls; the pulse signals lack of confidence).
- The 1.1s stagger ladder (`hero-stagger-1/2/3/4`) — replace with single 0.4s fade-in for both caption and CTA.

**Justification**: ui-designer audit + ux-design-expert audit + Rams + van Schneider conclave (4-source corroboration).

**Acceptance test**: above-the-fold word count ≤ 8 words. Single primary CTA. No second button visible above 100vh.

---

### 2. Coleção (`/` homepage section + `/colecao` page)

#### Homepage band (3 hero pieces)

**Goal**: the first product image the visitor sees. No copy preamble.

**Layout**: 3-column grid on desktop (1280px max-width, 24px gutter, 32px outer margin), single column on mobile, 64px vertical block-spacing between cards.

**Each card (3 cards: Opal, Aurora, Ambar)**:
- **Image**: lifestyle JPG (`{Model}_Ambiente_01.jpg` from `04_Renders_Mesas/`), full-width within the card, `aspect-[4/5]`, `object-cover`.
- **Caption block (24px below image)**:
  - Line 1: model name in `headline-lg` (Cormorant 36px mixed case 400).
  - Line 2: material + accent in `caption` (Raleway 12px), e.g., *"Nogueira americana · latão escovado"*.
  - Line 3: nothing. (No price. No "Ver detalhes" button. The whole card is clickable.)
- **Card itself**: surface-raised background, sharp corners (`rounded.none`), entire card is `<Link>` to `/colecao/[slug]`. Hover: image scales 1.03 (existing `.luxury-card` rule retained).

**No section header above the band.** No "Nossa Coleção" overline. The cards introduce themselves.

#### `/colecao` page (full grid)

8 models in a 2-column or 3-column grid (responsive). Same card pattern as above. Optional 1-line page lede in `headline-md` *only* if the user doesn't recognize the section from URL alone — e.g., *"Oito mesas. Uma encomenda por vez."*

**Justification**: ux-design-expert (collapse 5→3 sections), ui-designer (Bugatti pattern: monumental imagery captioned not headlined), van Schneider (lifestyle JPGs over isolated renders).

---

### 3. Atelier band (homepage section + `/atelier` page)

#### Homepage (single band, ~80vh)

**Goal**: replace the 5-step craftsmanship diagram with one editorial moment.

**Layout**: 60/40 horizontal split on desktop (image left at 60%, text right at 40%, both vertically centered), stacked on mobile.

- **Image**: a single full-bleed lifestyle photograph of a craftsperson hands-on with a table or hardware — pulled from existing brand assets in `07_Identidade/` or `04_Renders_Mesas/Ambiente`. If no suitable existing asset, defer to Sprint 2 commissioned photography and use `Opal_Ambiente_03.jpg` placeholder.
- **Text right column**:
  - `label-overline`: `ATELIER` (single word, no "Sobre nós").
  - `headline-lg`: a 6-word craft statement in mixed-case Cormorant. Default: *"Itajaí. Quinze anos. Cada mesa, uma encomenda."*
  - `body-md`: 2-sentence body, max 30 words total.
  - `button-text` link: `Conhecer o atelier →` to `/atelier`.

**DELETE**: the existing 5-step numbered process diagram entirely. (The 5-step UX violates Nielsen "recognition over recall.")

#### `/atelier` page (full editorial)

Long-form editorial (5-7 viewports of scroll), pattern follows Cassina/Vitra storytelling:
1. Hero photograph + atelier statement.
2. Origin story (3 paragraphs max).
3. Materials inventory (3-column micro-grid: woods, metals, felts — image + caption per cell).
4. Process (replaces the 5-step diagram with a *single longer photograph* of a workbench moment + 2-paragraph essay).
5. Founders/atelier team (2-3 portraits + names + roles).
6. Footer CTA: `button-secondary` *"Ver a coleção"* → `/colecao`.

**No stats. No badges. No "100+ delivered."**

**Justification**: ux-design-expert (delete StatsSection), ux-designer (replace numbered diagram), Rams (luxury is not a quarterly report).

---

### 4. Configurator (`/configurador`) — RESTYLED ONLY

Three.js source preserved. All 13 GLB models preserved. Restyle the frame:
- Toolbar: `surface-raised` background, `border-subtle` 1px hairline at top, button labels in `label-overline` (13px Raleway 600 0.12em).
- Side panel (`molecules/configurador-panel.tsx`): consume the new `Button` atom. **Delete the inline button reimplementation** at lines 91-97 currently bypassing the atom. Frost's "atom is the truth" rule.
- Active selection state: champagne 1px hairline border (`accent`), no fill.
- Replace all `text-[Npx]` and `tracking-[Nem]` arbitrary values with the 7-step type scale and 4-step tracking scale.

**Functional changes**: zero. Preserve all interactions, model-loading, color/material swaps.

**Acceptance test**: configurator works identically; no regressions in Three.js render performance; no `text-[*]` or `tracking-[*]` arbitrary values remain in `configurador-3d.tsx` or `configurador-panel.tsx`.

---

### 5. Contato (`/contato`) — NEW TWO-PATH FUNNEL

**Goal**: introduce the silent research path that today does not exist.

**Layout**: single-column, max-width 720px, centered, vertically generous.

**Top of page**:
- `label-overline`: `CONTATO`
- `headline-md`: *"Receba uma proposta em até 24 horas."*

**Path A — Form (PRIMARY, top of page)**:
A real lead form with **4 fields max** (Hick's Law respected):
1. Nome
2. Email
3. WhatsApp (optional)
4. Mensagem (textarea, 3 rows, placeholder: *"Conte-nos sobre o ambiente"*)
Submit button: primary (champagne) — *"Enviar proposta"*. On submit: thank-you state, optional WhatsApp deep-link as secondary.

**Path B — WhatsApp (SECONDARY, below form)**:
A `button-text` link, not a button: *"Ou converse direto pelo WhatsApp →"* with the WhatsApp icon glyph (small, 16px). No giant green block.

**Showroom block (below)**:
- `label-overline`: `SHOWROOM`
- Address: Itajaí, SC + email + telephone (caption-size).

**DELETE from current `/contato`**: the giant WhatsApp-only block at lines 51-69. Trust badges block ("Garantia 5 Anos", "Frete Grátis" tiles) — relocate any actual product warranty into the product page specs accordion, kill the badge-tile pattern.

**Justification**: ux-designer (silent research path is missing); Norman (signifier matches function — a form is the signal "I will research, then talk").

---

### 6. Product Page (`/colecao/[slug]`)

**Goal**: 6 vertical blocks, no tabs.

1. **Hero image** — full-bleed lifestyle JPG (`{Model}_Ambiente_01.jpg`), 80vh, no overlay text. Caption *below* the image: model name in `headline-lg`, material in `caption`.
2. **Configure CTA band** — full-width band, surface-raised, vertically centered, ~30vh. Single line: *"Personalize a sua [Modelo]"* in `headline-md`, primary button below: *"Abrir configurador →"* → `/configurador?model=[slug]`. **Configure earns the click.**
3. **Specs block** — 2-column key/value table (dimensões, materiais, peso, tempo de entrega, garantia). All `body-md`, no tiles, no badges.
4. **Ambientes gallery** — 3 lifestyle JPGs (`Ambiente_01/02/03`), masonry or 3-column, captioned only with location/style.
5. **Related models** — 3-card row using the same Card-Product atom from `/colecao`.
6. **Footer CTA band** — `headline-md`: *"Pronto para a sua mesa?"* + `button-primary` *"Solicitar proposta"* → `/contato`. Secondary `button-text` *"ou abrir configurador"*.

**DELETE from current product page**: the inline WhatsApp button (line 129 currently). Demote to FAB only. Remove tabbed structure if present; commit to single scroll.

**Justification**: ux-designer (Apple Buy-flow pattern: Image → Configure → Specs → Ambientes → Related → CTA); Rams (one idea per viewport).

---

### 7. Footer

**Goal**: collapse from 4 columns to 2.

**Column 1 (Brand)**: logo, 1-line tagline (`caption`), social icons row.
**Column 2 (Contato)**: address, telefone, email — all `caption`, all on separate lines.

**Footer bottom strip** (full-width, `border-subtle` hairline above):
- Left: copyright + CNPJ Blumenau line (legal requirement).
- Right: `caption` link to `/legal/privacidade` (LGPD).

**DELETE from current footer**: the "Institucional" link block (duplicates navbar), the "Coleção" link block (duplicates navbar), the redundant phone/email blocks that repeat across columns.

**Justification**: ux-design-expert (footer collapses 4 → 2 columns); BRIEF (LGPD + CNPJ preserved).

---

## Token Migration Map

For each major Tailwind class change in the existing source, the migration:

| Old (current) | New (per DESIGN.md) | Affected files |
|---|---|---|
| `text-[68px]` | `text-display` (56px) | `hero.tsx:35` |
| `text-[15px]` | `text-base` (16px) — round to scale | `hero.tsx:40,65` |
| `text-[12px]`, `text-[11px]`, `text-[10px]`, `text-[9px]` | `text-caption` (12px) or `text-label` (13px) | `configurador-3d.tsx:187,205,231,260`, `footer.tsx:60,79,98`, `button.tsx:29-31` |
| `tracking-[0.08em]` | (default `0`) — drop entirely from H1 | `hero.tsx` H1 |
| `tracking-[0.10em]`, `tracking-[0.15em]`, `tracking-[0.18em]`, `tracking-[0.20em]`, `tracking-[0.25em]`, `tracking-[0.35em]` | `tracking-label` (`0.12em`) — collapsed to single value | `navbar.tsx`, `footer.tsx`, `price-hint.tsx`, `logo.tsx`, `configurador-panel.tsx`, `.overline` utility class |
| `font-bold` (700) on Cormorant | `font-normal` (400) — Cormorant is never 700 | `hero.tsx`, `.heading` utility, `craftsmanship-section.tsx` |
| `uppercase` on Cormorant | (remove `uppercase`) — mixed case | `hero.tsx`, `.heading` utility |
| `bg-cream` (primitive) | `bg-canvas-inverted` or use semantic `accent.action` | configurator panel, button-primary |
| `bg-charcoal` | `bg-canvas` (semantic) | body, sections |
| `text-cream` | `text-primary` (semantic) | site-wide |
| `border-border` | `border-subtle` (semantic) | site-wide |
| `bg-whatsapp` outside FAB | **REMOVE** — WhatsApp green forbidden in chrome | `cta-section.tsx` (delete component), `whatsapp-fab.tsx` (keep) |
| `from-black/80 via-black/30` (hero gradient) | `from-canvas/40 via-canvas/0 to-canvas/30` | `hero.tsx` |
| `body::after` film grain at `opacity: 0.12` site-wide | scope to `.hero::after`, `opacity: 0.06` | `globals.css:67-78` |

**Implementation approach**: introduce semantic tokens in `globals.css` `@theme inline` block, then sweep the codebase in 3 PRs:
- PR 1: introduce semantic layer + collapse type scale + collapse tracking scale (no visual changes, pure refactor).
- PR 2: hero / homepage / footer redesign per Section spec above.
- PR 3: product page + contato + atelier + configurator restyle.

---

## Out of Scope (deferred to next sprint)

- **Hero video production** — use existing or AI-generated; commissioning real cinematic 1080p video is a separate scope.
- **Photography refresh** — commissioning a real shoot in a Brazilian luxury interior is Sprint 2. For Sprint 1, use existing `Ambiente_*` JPGs.
- **Inter as body face** — Spiekermann recommended; deferred to A/B test in Sprint 2. Sprint 1 keeps Raleway.
- **Localization (en/pt)** — current site is pt-BR only; en-US later.
- **CRM integration for contact form** — engineering scope (form post → email is acceptable Sprint 1 minimum).
- **Mobile flow audit** — needs DevTools session.
- **Testimonials organism** — proposed by ux-designer; deferred until 3+ on-record client quotes are gathered with first-name + city + room photo.

---

## Acceptance Criteria for aios-dev

- [ ] Homepage reduced from 5 to 3 sections.
- [ ] Top nav has exactly 4 items: Coleção · Configurador · Atelier · Contato.
- [ ] Above-fold word count ≤ 8 words. Single primary CTA. No second visible button above 100vh.
- [ ] No `text-[Npx]` or `tracking-[Nem]` arbitrary Tailwind values remain anywhere in `src/`.
- [ ] Cormorant Garamond is mixed-case site-wide. No `uppercase` modifier on display type. No `font-bold` (700) on Cormorant. No display tracking > 0.
- [ ] One champagne accent (`#C9A961`) per viewport max. Audit by spot-check.
- [ ] WhatsApp green appears nowhere in visible chrome except the single FAB icon.
- [ ] StatsSection deleted (file removed, route removed, no relocated stat tiles).
- [ ] CTASection deleted.
- [ ] Configurator preserves all current Three.js functionality; visual chrome consumes new semantic tokens; no inline buttons (all CTAs route through `Button` atom).
- [ ] DESIGN.md (`apps/bretda-lp/DESIGN.md`) passes `npx @google/design.md lint` with exit code 0. *(Note: in this run the linter exits 0 silently regardless of input; report any future tightening of the validator as a tooling improvement.)*
- [ ] Lighthouse mobile ≥ 90 (no regressions from current baseline).
- [ ] LGPD + CNPJ Blumenau preserved in footer (legal).
- [ ] All 13 GLB models in `public/models/` untouched.
- [ ] 3 PR sequence respected: token sweep → marketing redesign → product/contato/atelier/configurator restyle.

---

## Implementation Priority (recommended PR order)

**PR 1 (foundation, ~2 days)** — non-visual: semantic token layer in `globals.css`; type scale + tracking scale; codemod removing all `text-[*]` and `tracking-[*]` arbitrary values; Frost-discipline single Button atom (delete inline reimplementations). **Ship this first, behind a feature-flag if needed — it has zero visual change but unlocks everything else.**

**PR 2 (hero + homepage, ~3 days)** — the visible win: hero rebuild (4-layer → 4-element minimal), Coleção 3-card band, Atelier band, footer collapse. **Highest user-facing impact.**

**PR 3 (deep pages, ~3 days)** — `/colecao/[slug]`, `/contato` (new two-path funnel), `/atelier`, `/configurador` restyle, route redirects from `/sobre`/`/mesas`.

**PR 4 (cleanup, ~0.5 day)** — delete dead components (`StatsSection`, `CTASection`, `CraftsmanshipSection` 5-step diagram), drop unused Cormorant/Raleway weights from Next/font imports, scope film grain to hero only.

---

*End of REDESIGN-PROPOSAL. Phase 3 complete. Handoff to aios-dev for Phase 4 (implementation).*
