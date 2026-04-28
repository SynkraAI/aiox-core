# Bretda Redesign — FINAL DECISIONS (locked by Design Chief)

**Status**: TERMINAL. User delegated all checkboxes to the squad ("eu não tenho conhecimento de design, acho melhor os especialistas decidirem"). This document is the verdict.

**Authority**: Design Chief, speaking for 4 specialist audits (ui-designer, ux-design-expert, design-systems-engineer, ux-designer) + 5 mind clones (Rams, Norman, Frost, van Schneider, Spiekermann) — Phases 1+2 evidence.

**Source of truth**: `D:/AIOS/apps/bretda-lp/DESIGN.md`. **Conclave verdict**: Path A — execute now (5/5 unanimous). **PR scope**: this doc locks decisions for PR 1 (foundation tokens) AND defines decisions for PR 2/3/4 so dev has the full map up-front.

---

## Hero (homepage)

- ✅ **Lifestyle JPG background (Opal_Ambiente_01)** — KEEP. Conclave Non-Negotiable N10. Lifestyle JPG > isolated render on marketing surfaces (van Schneider + ui-designer triangulated). Brazilian luxury context > museum framing for first impression.
- 🔧 **Gradient /40 light overlay (sussurro)** — ADJUST to `linear-gradient(180deg, rgba(42,43,38,0.15) 0%, rgba(42,43,38,0) 35%, rgba(42,43,38,0) 60%, rgba(42,43,38,0.65) 100%)`. Reason: a flat `/40` veil dulls the photograph (van Schneider: "the photograph is the artifact"); a directional bottom-weighted gradient keeps caption/CTA legibility (WCAG AA on `#FEF7F2` over a bright JPG bottom) without flattening the upper 60% of the image. Use canvas color (#2A2B26) not black to keep the warm tonal continuity.
- ✅ **Cormorant mixed-case caption "Opal — Sinuca artesanal"** — KEEP. Spiekermann + van Schneider non-negotiable. Conclave N6.
- 🔧 **Single champagne CTA "Configurar a sua →"** — ADJUST copy to `Ver a Coleção →` per REDESIGN-PROPOSAL §1 (route → `/colecao`). Reason: hero CTA must lead to the broadest funnel (collection grid) since 8 models compete for attention; configurator is *one* product's deeper path. The preview's "Configurar a sua →" assumes the visitor has already chosen Opal — wrong order. Champagne fill stays. Position: bottom-right, 32px from edge.
- ✅ **No headline, no subline, no PriceHint** — KEEP. Conclave N2 (zero headline). ux-design-expert + ux-designer + Rams unanimous. Above-fold word count drops from 32 → 4 (caption only).
- 🔧 **Hero variant preference (A · B · C)** — **PICK VARIANT A (Lifestyle JPG)** for production. Reason: (1) Variant B (Spotlight Museum / isolated PNG) violates N10 — renders on marketing pages signal "brochure" (van Schneider). (2) Variant C (Video) is correct *strategically* but requires real cinematic 1080p shoot, scoped to Sprint 2 in REDESIGN-PROPOSAL §"Out of Scope". (3) Variant A is the only ship-now option that honors all 14 non-negotiables. **AI-V1 (Mansion Sunset)** and **AI-V4 (Isolated Dramatic)** are NOT production assets — they are mood references for the Sprint 2 photo shoot brief. Do not ship AI-generated imagery as the production hero (legal/IP + "feels AI" is a luxury-brand kill signal).

**Production hero asset**: `apps/bretda-lp/public/images/Opal_Ambiente_01.jpg` (existing, copy from preview `04-preview/assets/Opal_Ambiente_01.jpg` if not yet in the lp public folder). Aspect: full-bleed `100vw × 100vh`, `object-cover`, focal point center-bottom (table). When real photography lands in Sprint 2, swap the asset path; markup stays identical.

---

## Navegação

- ✅ **4 items: Coleção · Configurador · Atelier · Contato** — KEEP. Conclave N4. Norman + ux-design-expert + ux-designer triangulated. No persona labels, no nav-CTA.
- ✅ **Sticky transparent sobre hero, sólido on scroll** — KEEP. Standard editorial pattern (11 Ravens, Hermès Maison). Use `border-bottom: 1px solid var(--color-border-subtle)` on scrolled state, no shadow (system is shadow-less per DESIGN.md §Elevation).
- ✅ **Sem "Para Arquitetos"** — KEEP (deletion). Norman category-violation. Conclave N4.
- ✅ **Sem CTA-button no nav (apenas links)** — KEEP. Conclave N4. Linear/Vercel/11 Ravens pattern.
- ✅ **Logo SVG cream à esquerda** — KEEP. Use `BRETDA-White.svg` (full wordmark) at desktop ≥768px, `Simbolo-bretda-white.svg` (mark only) at mobile <768px to preserve nav rhythm. Height: 24px desktop / 20px mobile.

---

## Coleção (homepage band)

- ✅ **3-card homepage band (Opal · Aurora · Ambar)** — KEEP. REDESIGN-PROPOSAL §2 explicit. Three flagship models is the editorial restraint move (Rams "keep three things"). Order rationale: Opal (hero/anchor) → Aurora (contrast: lighter wood) → Ambar (warmth/range demonstration).
- ✅ **Lifestyle JPGs (não isolated PNGs) na home** — KEEP. Conclave N10 explicit. Use `{Model}_Ambiente_01.jpg` per card.
- 🔧 **Hover: image scale 1.04 + caption champagne** — ADJUST: image scale `1.03` (matches existing `.luxury-card` rule per REDESIGN-PROPOSAL §2 — no need to invent a second scale value), caption color shifts to champagne accent on hover. Transition: 600ms `var(--ease-luxury)`. Reason: scale 1.04 is arbitrary; scale 1.03 is the existing system value — Frost discipline ("don't invent before you reuse").
- ✅ **Sem CTA por card; card inteiro clicável** — KEEP. Card is `<Link>` to `/colecao/[slug]`. Removes 3 redundant buttons from the viewport.
- ✅ **Sem section header "Nossa Coleção"** — KEEP. REDESIGN-PROPOSAL §2: "the cards introduce themselves." Editorial restraint.

---

## Coleção (página /colecao)

- ✅ **8-model full grid** — KEEP. Models: Opal · Aurora · Ambar · Citrino · Espinela · Berilo · Zurita · Cobal (per REDESIGN-PROPOSAL §"Hard Constraints" #2).
- ✅ **3 colunas desktop / 2 tablet / 1 mobile** — KEEP. Standard editorial grid.
- 🔧 **Filter pills: Sinuca · Pebolim · Tênis · Shuffleboard** — ADJUST: **DEFER to PR 3** (not PR 1 or PR 2). Reason: with 8 SKUs, filter pills add cognitive load before they add value; only 4 of 8 models are sinuca, the rest split among 3 categories — pills become a 1-or-2-card filter result for most clicks, which is worse than no filter. Ship `/colecao` page in PR 3 *without* pills first; add pills only if analytics show >30% of users scroll past the 4th product looking for something specific. **For production launch: NO pills.**
- 🔧 **Page lede "Oito mesas. Uma encomenda por vez."** — ADJUST: KEEP this exact copy as written. The preview marked it "optional" — promote to required. Reason: van Schneider editorial discipline, anchors the "encomenda" (made-to-order) positioning above the fold of the collection page. Place: `headline-md` (24px Cormorant 400 mixed case), centered, 80px above grid, no overline.
- 🔧 **2 placeholders (Berilo, Cobal) substituem por renders quando disponíveis** — ADJUST: use `Citrino_Ambiente_01.jpg` and `Espinela_Ambiente_01.jpg` (both EXIST per `assets/` listing) as placeholder lifestyle reference for Berilo + Cobal cards UNTIL real Berilo/Cobal Ambiente JPGs are commissioned. Caption text on those two cards must say "Em produção · Disponível Q2 2026" in `caption` style — never present a fake image with no disclosure (luxury trust violation). Track Berilo/Cobal photo commission in Sprint 2.

---

## Atelier (homepage band)

- ✅ **Single statement "Cada peça nasce em Blumenau, esculpida sob medida."** — KEEP. **Note**: this statement says "Blumenau" but REDESIGN-PROPOSAL §3 + entity-registry consistently reference "Itajaí" as atelier location. Decision: `Blumenau` is correct per legal CNPJ (per BRIEF Hard Constraint #3 — CNPJ Blumenau). The Itajaí references in REDESIGN-PROPOSAL are wrong; this homepage band overrides. Final copy: **"Cada peça nasce em Blumenau, esculpida sob medida."**
- ✅ **Layout 60/40 (imagem esq · texto dir)** — KEEP. REDESIGN-PROPOSAL §3 explicit.
- ✅ **Single text-link CTA "Conheça o atelier →"** — KEEP. `button-text` style (champagne, no underline, underline on hover). Routes → `/atelier`.
- ✅ **Surface raised (#353630) com hairlines top/bottom** — KEEP. DESIGN.md elevation system: tonal step + hairline = no shadow needed. 1px `border-subtle` (#4A4B44).

---

## Atelier (página /atelier)

- ✅ **Hero photograph full-bleed** — KEEP. REDESIGN-PROPOSAL §3 page spec. Use existing brand asset; if none meets bar, use `Opal_Ambiente_03.jpg` placeholder (most atelier-feeling Ambiente).
- 🔧 **Statement "Itajaí. Quinze anos. Cada mesa, uma encomenda."** — ADJUST to **"Blumenau. Quinze anos. Cada mesa, uma encomenda."** Reason: same Blumenau/Itajaí discrepancy as above; CNPJ wins. Format: `headline-lg` (Cormorant 36px mixed case 400), one line.
- ✅ **3 parágrafos editoriais (madeira · estrutura · acabamento)** — KEEP. Conclave: editorial pattern (Cassina/Vitra). 3 × max 60 words = ~180 words total page weight. **Copy proposal (lock these unless a copywriter overrides)**:
  1. *Madeira*: "Trabalhamos só três espécies — freijó, nogueira americana e pau-de-ferro. Cada tora é selecionada manualmente por veio e densidade; descartamos mais do que aprovamos. A escolha é silenciosa, e dura cinquenta anos."
  2. *Estrutura*: "A base é torneada e encaixada como móvel de geração — sem parafusos visíveis, sem colas estruturais. O chassi de aço inox interno é o segredo que ninguém vê: nivelamento permanente, mesmo em pisos centenários."
  3. *Acabamento*: "O tampo é envernizado em quinze demãos, cada uma lixada à mão. O feltro vem de Hainsworth, Inglaterra, costurado sob medida ao perímetro. A peça leva o nome do cliente gravado discretamente no aro inferior."
- ✅ **3-step process (Design · Marcenaria · Acabamento) com numeração Cormorant 72px** — KEEP CONCEPT, but **note**: 72px is outside the 7-step type scale (max 56px). ADJUST numerals to use `text-display` (56px). Reason: N7 — type scale is the system; 72px violates it even as a "decorative numeral". Spiekermann explicit on 56px ceiling.
- ✅ **Final CTA "Agendar visita"** — KEEP. `button-primary` (champagne fill). Routes to `/contato?subject=visita` (preserves silent path; Path B WhatsApp deep-link offered after form-submit).
- ✅ **SEM stats. SEM "100+ entregues". SEM "15 anos"** — KEEP (deletion). Conclave N3. Rams + van Schneider non-negotiable.

---

## Contato (página /contato)

- ✅ **Headline "Receba uma proposta em até 24 horas."** — KEEP. ux-designer audit explicit on the 24h commitment as the silent-research signal. `headline-md` (24px).
- ✅ **Form 4 fields (Nome · Email · WhatsApp · Mensagem)** — KEEP. Hick's Law respected (Norman + ux-designer). WhatsApp field is **optional**, marked as such in label (`label-overline`: "WhatsApp · opcional").
- ✅ **CTA "Receber proposta em 24h" (champagne)** — KEEP. Single primary button.
- ✅ **WhatsApp como text-link secundário (NÃO botão verde)** — KEEP. Conclave N9. WhatsApp green is forbidden in chrome (FAB only).
- ✅ **Sidebar: showroom Blumenau + email + telefone + Instagram** — KEEP. All `caption` size, `text-secondary` color. **Add note for dev**: actual showroom address, email, telefone, Instagram handle must be pulled from `D:/AIOS/.aios-core/data/entity-registry.yaml` Bretda entry — do not hardcode placeholders. If those fields are not in the registry yet, **flag to user** as "OPEN: provide real contact data before launch".
- ✅ **Sem trust-tile blocks ("Garantia 5 Anos", "Frete Grátis")** — KEEP (deletion). Conclave: B2B trust signals forbidden above the product. The actual 5-year warranty information lives in the `/colecao/[slug]` specs accordion, not in chrome tiles.

---

## Produto (página /colecao/opal)

- ✅ **Hero gallery full-bleed (Opal_Ambiente_01)** — KEEP. REDESIGN-PROPOSAL §6 block 1.
- ✅ **3 thumbnails dots para navegação (visual only neste preview)** — KEEP. PR 3 implements actual gallery cycle through `Opal_Ambiente_01/02/03.jpg`. Dots in `text-muted` color, active in `accent`. No carousel arrows (sharper editorial pattern).
- ✅ **Title "Opal" Cormorant mixed-case** — KEEP. `headline-lg` (36px), positioned **below** the hero image (REDESIGN-PROPOSAL §6: "Caption *below* the image"), not overlay. No subtitle, no overline above.
- ✅ **Price hint "Sob consulta · A partir de R$ 33.000" caption** — KEEP. `caption` size (12px), `text-secondary` color, single line. "Sob consulta" first establishes the negotiation frame; "A partir de R$ 33.000" anchors expectation. No bold, no champagne.
- ✅ **2 parágrafos editoriais (não bullet list)** — KEEP. Conclave editorial pattern. **Copy proposal (Opal-specific, dev may use these as ship-ready)**:
  1. "A Opal nasce de uma única tora de freijó assentada por dezesseis meses no nosso depósito em Blumenau. O tampo de duas peças é casado por veio, não por máquina — quando a luz cruza o salão, a costura desaparece."
  2. "Os encaixes são feitos como nos móveis daquele tio que ninguém esqueceu: rabo-de-andorinha, cavilhas de pau-ferro, sem um único parafuso visível. A base de inox escovado é o nosso segredo — nivelamento permanente, mesmo em casas que respiram com a maré."
- ✅ **Configurador 3D slot 16:9 (preserva Three.js existente)** — KEEP. REDESIGN-PROPOSAL §"Hard Constraints" #1. The `/configurador` route stays standalone; this slot on `/colecao/[slug]` **embeds** it via iframe or shared component (whichever is lighter — dev judgment, but the existing Three.js code path is the source of truth, no port).
- ✅ **Acabamentos: madeiras (4) + metais (3) + feltros (3) como swatches** — KEEP. Swatches are 64x64px, sharp corners (`rounded.none`), 1px `border-subtle`. Active state: champagne 1px hairline (no fill — N9). Captions in `caption` size.
- 🔧 **Trust band: "Feito sob medida · 60 dias · 5 anos garantia"** — ADJUST: KEEP the band but tonal-flat treatment. Reason: this is a *line of prose*, not three trust tiles (Conclave: tile pattern killed). Format: single horizontal line, `caption` size, `text-secondary`, separators are `·` (mid-dot, not pipe). Position: between specs and ambientes blocks.
- ✅ **CTA único "Solicitar proposta personalizada"** — KEEP. `button-primary` champagne. Routes to `/contato?subject=proposta&model=opal`.
- ✅ **Sem inline WhatsApp button (relegado a FAB)** — KEEP (deletion). Conclave N9. Existing inline WhatsApp at line 129 of current product page → DELETE.

---

## Sistema Visual

- ✅ **Single champagne accent #C9A961 — uma vez por viewport** — KEEP. Conclave N9. Audit method: spot-check each viewport in the preview build for any second champagne element; collapse to one.
- ✅ **Cormorant mixed-case only, weights ≤600** — KEEP. Conclave N6. **Critical for PR 1 codemod**: `font-bold` or `font-weight: 700` on Cormorant must be reduced to `font-normal` (400) sitewide. The `.heading` utility class in `globals.css:81-86` (which sets `text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700`) → **DELETE entire class** in PR 1 (it's a system-violation utility); replace usages with explicit Cormorant 400 mixed-case style.
- ✅ **Tracking 4 steps: -0.01 · 0 · 0.08 · 0.12 em** — KEEP. Conclave N7. **PR 1 codemod target**: every `tracking-[Nem]` arbitrary value collapses to nearest of these 4. (Mapping table below in DEV-BRIEF.)
- ✅ **Type scale 7 steps: 12/13/16/18/24/36/56 px** — KEEP. Conclave N7. **PR 1 codemod target**: every `text-[Npx]` arbitrary value collapses to nearest of these 7. (Mapping table below.)
- ✅ **Stats section deletada inteiramente** — KEEP (deletion). Conclave N3. Component file `stats-section.tsx` → DELETE in **PR 4** (cleanup), but **remove from homepage render** in PR 2. Replacement on homepage: nothing — N1 says 3 sections + footer. Atelier band already provides the only humanizing/craft moment needed.
- ✅ **Sem B2B social proof ("100+ entregues", logos clientes)** — KEEP (deletion). Conclave N3. Rams + van Schneider non-negotiable.
- ✅ **Surfaces flat tonal (canvas → raised → overlay) — sem shadows** — KEEP. DESIGN.md §Elevation. The configurator's existing single shadow on its floating panel is the **only** sanctioned shadow site-wide.
- ✅ **Sharp corners em cards e imagens (rounded.none)** — KEEP. DESIGN.md §Shapes. Only `button-primary` and `input-text` use `rounded.sm` (2px); `whatsapp-fab` uses `rounded.full`. Everything else: zero radius.

---

## Footer

- ✅ **3 colunas: Brand · Navegação · Contato** — KEEP. **Note**: REDESIGN-PROPOSAL §7 says "collapse from 4 columns to 2"; the preview shows 3. Decision: **3 columns** (Brand / Navegação / Contato) is the lock — 2 columns produces an awkward wide footer; 3 is the editorial-furniture pattern (Cassina, Vitra). Conclave N14 says "collapsed" without specifying the count; 4→3 honors the spirit (collapse) and the preview design.
- ✅ **Sem coluna "Institucional" duplicando navbar** — KEEP (deletion). REDESIGN-PROPOSAL §7 explicit.
- 🔧 **CNPJ Blumenau preservado** — ADJUST: KEEP the line, but **CNPJ value placeholder `00.000.000/0001-00` is unacceptable in production**. **OPEN ITEM FOR USER**: provide real CNPJ string. Until provided, dev should pull from `entity-registry.yaml` (Bretda entry); if not present there, **block production deploy** until populated. PR 1 does not touch the footer; PR 2 must surface this block as a launch-gate.
- ✅ **Link LGPD/Privacidade no bottom strip** — KEEP. Conclave N14 (legal). Routes → `/legal/privacidade` (existing route preserved).
- ✅ **Sem gradient no footer** — KEEP (deletion). Flat `surface-raised` background, 1px `border-subtle` hairline at top.

---

## Configurator Slot (página /colecao/opal)

- ✅ **Three.js configurador preservado intacto** — KEEP. Conclave N13 + BRIEF Hard Constraint #1. Functional changes: zero. Frame restyle only.
- ✅ **Slot 16:9 com aspect-ratio definido** — KEEP. `aspect-ratio: 16/9` CSS property, `max-width: 1280px`, centered. PR 3 work.
- ✅ **Toolbar surface-raised + label-overline** — KEEP. DESIGN.md §Components — toolbar inherits `Surface.raised` + button labels in `label-overline`.
- ✅ **Active selection: champagne 1px hairline (sem fill)** — KEEP. DESIGN.md explicit. No filled active state — hairline-only selection is the editorial restraint signature.

---

## Style Guide (página /style-guide)

- ✅ **10 swatches de cor (incluindo WhatsApp green com aviso)** — KEEP. Style guide is internal documentation; showing the WhatsApp green with a "FORBIDDEN IN CHROME — FAB ICON ONLY" warning is the discipline-as-system pattern (Frost). Confirms the rule visually.
- ✅ **7 specimens tipográficos (display → caption)** — KEEP. Maps 1:1 to N7 type scale.
- ✅ **8 spacing tokens visualizados** — KEEP. Maps to DESIGN.md spacing block.
- ✅ **5 radius tokens** — KEEP. (none, sm, md, lg, full per DESIGN.md.)
- ✅ **Components catalog: buttons + form + pills + card + nav** — KEEP. Note: "pills" here refers to filter-pill style for /colecao — even though we're not shipping pills in production initially (see Coleção decision above), the style is documented for future use.

---

## Comparison (página /comparison)

- ✅ **Linha 1 — Hero (32 words → 8 words)** — KEEP. Documents the win.
- ✅ **Linha 2 — Nav (5+ → 4 items)** — KEEP. Conclave N4 documented.
- ✅ **Linha 3 — Stats (deletar inteiro)** — KEEP. Conclave N3 documented.
- ✅ **Linha 4 — CTAs (7 → 1 por viewport)** — KEEP. Conclave N5 documented.
- ✅ **Linha 5 — Tipografia (Cormorant 700 uppercase → mixed 400)** — KEEP. Conclave N6 documented.

---

## Outros / Notas (Design Chief additions)

- 🔧 **WhatsApp FAB in production: YES** — ADD. The preview omitted the FAB. Production must include it: 40×40px circle, `#25D366` fill, white WhatsApp glyph, fixed bottom-right, 24px from edges. **No pulse animation** (REDESIGN-PROPOSAL Hero spec: "the pulse animation is removed — cognitive-load tax"). This is the only WhatsApp-green chrome element on the entire site.
- 🔧 **Configurador integration on /colecao/[slug]** — LOCK: embed via shared component (`ConfiguradorEmbed`) that wraps the existing Three.js code; pass `model={slug}` prop. Standalone `/configurador` route remains. The product page's configurador slot is **on the page**, not on the homepage. Homepage hero CTA → `/colecao` (not `/configurador`). This avoids loading Three.js on every homepage visit (perf win).
- 🔧 **Hero overline + subline DELETION scope** — LOCK: applies to **homepage hero only** in PR 2. Other pages' page-headers (Atelier, Contato, etc.) keep their `label-overline` (e.g., "ATELIER", "CONTATO") because those serve a wayfinding function in non-hero contexts (Norman: "signifier matches function"). Don't over-correct.
- 🔧 **Stats section replacement on homepage** — LOCK: nothing replaces it. Homepage = Hero + Coleção (3 cards) + Atelier band + Footer. Period. Resist any "but the page feels short" instinct — that's the editorial restraint working.
- 🔧 **Berilo + Cobal photo commission** — OPEN: Sprint 2 deliverable. Track in story `bretda-redesign-implementation.md` as deferred task. Until then, /colecao page renders 8 cards with disclosure on the 2 missing.

---

# DEV-BRIEF FOR @aios-dev (PR 1 — FOUNDATION TOKENS)

**Scope**: zero-visual-change refactor that introduces semantic token layer + collapsed type/tracking scales + Button atom + codemod. **No section deletes, no copy changes, no hero rebuild — those are PR 2/3/4.**

**Source of truth**: `D:/AIOS/apps/bretda-lp/DESIGN.md` (token tree, locked).
**Spec**: `D:/AIOS/docs/projects/bretda-redesign/03-redesign/REDESIGN-PROPOSAL.md` §"Token Migration Map" + §"Implementation Priority PR 1".
**Conclave verdict**: `D:/AIOS/docs/projects/bretda-redesign/02-conclave/DECISION.md` (Path A, 5/5 unanimous).

## Branch

```
feat/redesign-foundation-tokens
```

## Files to Modify

### Tokens (CSS)
- `D:/AIOS/apps/bretda-lp/src/app/globals.css` — add semantic layer in `@theme inline` block; **delete** `.heading` utility class (system-violation: forces uppercase + 0.08em + 700 weight on Cormorant); narrow film-grain scope from `body::after` (sitewide) to `.hero::after` only at opacity ≤ 0.06; rename primitive vars to semantic aliases (see migration map below).

### Codemod targets (every file with arbitrary text-[*] / tracking-[*])
Run `grep -rE "text-\[|tracking-\[" apps/bretda-lp/src/` — confirmed 11 files at audit time:

1. `D:/AIOS/apps/bretda-lp/src/components/organisms/configurador-3d.tsx`
2. `D:/AIOS/apps/bretda-lp/src/components/organisms/hero.tsx`
3. `D:/AIOS/apps/bretda-lp/src/components/organisms/footer.tsx`
4. `D:/AIOS/apps/bretda-lp/src/components/organisms/stats-section.tsx` (will be deleted in PR 4 — DO NOT DELETE in PR 1; just clean its tokens)
5. `D:/AIOS/apps/bretda-lp/src/components/molecules/configurador-panel.tsx` — also: replace inline button reimplementation at lines 91-97 with the Button atom.
6. `D:/AIOS/apps/bretda-lp/src/components/molecules/navbar.tsx`
7. `D:/AIOS/apps/bretda-lp/src/components/molecules/product-card.tsx`
8. `D:/AIOS/apps/bretda-lp/src/components/atoms/price-hint.tsx`
9. `D:/AIOS/apps/bretda-lp/src/components/atoms/logo.tsx`
10. `D:/AIOS/apps/bretda-lp/src/components/atoms/button.tsx` — this becomes the canonical atom
11. `D:/AIOS/apps/bretda-lp/src/app/mesas/[modelo]/page.tsx`

## Codemod Approach

**Recommended path**: hand-tuned regex sweep, not blind replacement. Open each file in turn, apply the mapping below, manually verify each substitution preserves intent. The arbitrary values were *decisions encoded as tech debt* (van Schneider's diagnosis) — treat each as a deliberate review.

**Tooling**:
```bash
# Find all violations (must return zero after PR 1)
grep -rE "text-\[|tracking-\[|font-bold.*Cormorant|uppercase.*Cormorant" apps/bretda-lp/src/

# Per-file reference: the existing arbitrary values (audit baseline)
grep -rEn "text-\[[0-9]+px\]" apps/bretda-lp/src/   # type scale violations
grep -rEn "tracking-\[[0-9.]+em\]" apps/bretda-lp/src/  # tracking scale violations
```

## Type Scale Mapping (collapse arbitrary → 7 steps)

| Found in source | Maps to | Tailwind class to use |
|---|---|---|
| `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]` | 12px caption | `text-caption` (define in `@theme`) |
| `text-[13px]` | 13px label | `text-label` |
| `text-[14px]`, `text-[15px]`, `text-[16px]` | 16px body | `text-base` |
| `text-[17px]`, `text-[18px]`, `text-[19px]` | 18px lede | `text-lede` |
| `text-[20px]` ... `text-[26px]` | 24px headline-md | `text-headline-md` |
| `text-[27px]` ... `text-[40px]` | 36px headline-lg | `text-headline-lg` |
| `text-[41px]` ... `text-[68px]` | 56px display | `text-display` |

## Tracking Scale Mapping (collapse arbitrary → 4 steps)

| Found in source | Maps to | Tailwind class to use |
|---|---|---|
| `tracking-[-0.01em]`, `tracking-tight` | -0.01em display | `tracking-display` |
| `tracking-[0em]`, `tracking-normal`, no tracking | 0 | (none — default) |
| `tracking-[0.05em]` ... `tracking-[0.10em]` | 0.08em loose | `tracking-loose` |
| `tracking-[0.10em]` ... `tracking-[0.35em]` (when used on labels/overlines) | 0.12em label | `tracking-label` |
| **All `tracking-[*]` on Cormorant display headings** | drop entirely (= 0 default) | (none) |

## Semantic Token Layer (additions to globals.css `@theme inline`)

```css
@theme inline {
  /* ===== existing primitive vars stay ===== */

  /* ===== NEW: semantic color aliases ===== */
  --color-canvas: var(--color-charcoal);          /* #2A2B26 */
  --color-surface-raised: var(--color-charcoal-secondary); /* #353630 */
  --color-surface-overlay: var(--color-charcoal-tertiary); /* #3E3F38 */
  --color-text-primary: var(--color-cream);       /* #FEF7F2 */
  --color-text-secondary: var(--color-gray-medium); /* #B4B5AC */
  --color-text-muted: var(--color-gray-muted);    /* #B0B1AA */
  --color-border-subtle: var(--color-border);     /* #4A4B44 */
  --color-accent: #C9A961;
  --color-accent-hover: #B8985A;
  --color-channel-whatsapp: var(--color-whatsapp); /* #25D366 — FAB icon ONLY */

  /* ===== NEW: 7-step type scale ===== */
  --text-caption: 12px;
  --text-label: 13px;
  --text-base: 16px;
  --text-lede: 18px;
  --text-headline-md: 24px;
  --text-headline-lg: 36px;
  --text-display: 56px;

  /* ===== NEW: 4-step tracking scale ===== */
  --tracking-display: -0.01em;
  --tracking-normal: 0em;
  --tracking-loose: 0.08em;
  --tracking-label: 0.12em;

  /* ===== NEW: component tokens (only 2 — Frost rule "3+ uses earns it") ===== */
  --color-button-primary-bg: var(--color-accent);
  --color-button-primary-text: var(--color-canvas);
  --color-button-primary-hover-bg: var(--color-accent-hover);
}
```

## Acceptance Criteria (PR 1 only — copy from REDESIGN-PROPOSAL §"Acceptance Criteria for aios-dev" + decisions specifics)

- [ ] `grep -rE "text-\[|tracking-\[" apps/bretda-lp/src/` returns **zero hits**.
- [ ] `grep -rE "font-bold.*Cormorant|uppercase.*Cormorant|font-weight:\s*700.*Cormorant" apps/bretda-lp/src/` returns **zero hits**.
- [ ] `.heading` utility class deleted from `globals.css`. Any component that referenced it is migrated to explicit Cormorant 400 mixed-case classes.
- [ ] `npm run build` succeeds.
- [ ] `npm run typecheck` succeeds (no new TS errors introduced).
- [ ] `npm run lint` succeeds.
- [ ] Visual diff between `main` and `feat/redesign-foundation-tokens` on Vercel preview = **zero perceptible change** for end users. Spot-check Hero / Configurador panel / Footer / Product page.
- [ ] Lighthouse mobile score ≥ 90 (no regression from current baseline).
- [ ] Inline `<button>` in `configurador-panel.tsx:91-97` replaced with canonical `<Button>` atom from `components/atoms/button.tsx`.
- [ ] Film grain overlay scope narrowed: removed from `body::after`, added scoped to `.hero::after` (or hero component class) at `opacity: 0.06` max.
- [ ] DESIGN.md untouched (it's the source of truth — never modified by implementation PRs; only updated by Design Chief).
- [ ] LGPD + CNPJ Blumenau footer line untouched (PR 1 doesn't touch footer copy).
- [ ] All 13 GLB models in `public/models/` untouched.

## Explicit DO NOT List (scope guards — Larson "snowball discipline")

- **DO NOT** touch hero copy. The "Elevando o Entretenimento" H1, the subline, the PriceHint stay in PR 1. They die in PR 2.
- **DO NOT** delete `StatsSection`, `CTASection`, or `CraftsmanshipSection` files. Those are PR 4 cleanup.
- **DO NOT** rebuild the hero. PR 2.
- **DO NOT** change the navbar items. PR 2 ("Para Arquitetos" stays in PR 1).
- **DO NOT** change copy anywhere. PR 1 is tokens-only.
- **DO NOT** change route structure. `/sobre`, `/mesas/[modelo]` redirects are PR 3.
- **DO NOT** swap product images. PR 2 swaps render PNGs to lifestyle JPGs on homepage.
- **DO NOT** add new components. Only modify existing.
- **DO NOT** introduce Inter as body font. Stays Raleway per Conclave dissent verdict.
- **DO NOT** delete the WhatsApp button code paths. They live until PR 3 demotes them to FAB.
- **DO NOT** modify any file under `public/models/`. Three.js source preserved.
- **DO NOT** invent token names not in this brief. If you need a value DESIGN.md doesn't define, escalate to Design Chief.

## Visual Regression Note

PR 1 must produce **zero pixel change** to the user. The Vercel preview compared against `main` should look identical on:
- Homepage above-fold
- Homepage Coleção section
- Homepage Stats section (still present in PR 1)
- /configurador page
- /contato page
- /mesas/[modelo] page
- Footer

If a pixel changes, you've leaked PR 2 scope into PR 1. Halt and report.

## Timebox

**2 working days**. If sliding past 2 days, halt and report — per van Schneider's "abort signal" in the conclave. Larger-than-expected codemod is a signal of scope creep, not implementation difficulty.

## Hand-back

When PR 1 merges:
1. @qa runs `lint + typecheck + test` quality gate.
2. Return to Design Chief to greenlight PR 2 dispatch (hero rebuild + 3-section homepage + footer collapse).

---

## Open Items Requiring Human (NOT design decisions — business inputs)

These are the *only* items the squad cannot decide without business context. All are **post-PR-1**, none block PR 1 dispatch:

1. **Real CNPJ string for footer** — placeholder `00.000.000/0001-00` is unacceptable in production. Must be populated before PR 2 ships footer redesign. Source: legal docs.
2. **Real showroom address, phone, email, Instagram handle for /contato** — pull from `entity-registry.yaml` if present; if missing, populate before PR 3 ships /contato redesign.
3. **Berilo + Cobal lifestyle photography** — Sprint 2 commission. Until delivered, /colecao page shows the disclosure pattern locked above.
4. **Hero video production (Sprint 2)** — currently locked to Variant A (Lifestyle JPG) for ship-now; if/when real cinematic video lands, swap asset path with no markup change.

---

*FINAL DECISIONS LOCKED — 2026-04-27. Design Chief verdict. No further escalation.*
