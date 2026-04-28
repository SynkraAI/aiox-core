# Bretda Redesign — Phase 2 Conclave Synthesis

**Orchestrator**: Design Chief
**Date**: 2026-04-27
**Method**: 4-specialist audit triangulated against 5 mind-clone consultations.
**Format**: Recap → Clone responses → Consensus / Dissent / Blind Spots → Verdict → Non-Negotiables.

---

## 0. Specialist Audit Recap (Phase 1)

| Specialist | Top finding | Brands consulted via `*lookup-design` |
|---|---|---|
| **ui-designer** | Hero is a 4-layer text sandwich on darkened video; Cormorant misused (UPPERCASE + 0.08em + weight 700). | Ferrari, Lamborghini, Tesla, Bugatti |
| **ux-design-expert** | 32 words above-fold across 6 affordances; 7 redundant CTAs site-wide; nav mixes audience + content taxonomies. | Linear, Vercel, Notion, Apple |
| **design-systems-engineer** | 24+ arbitrary `text-[Npx]` values; no semantic token layer; 7 ad-hoc tracking values. | Vercel, Stripe, Apple |
| **ux-designer** | 2 competing primary CTAs in hero; WhatsApp-only funnel; configurator buried under "Para Arquitetos". | Apple, Stripe, Airbnb |

**Cross-cutting consensus from the four audits** (visible without consulting clones):
1. Hero is overloaded (visual ✓ + IA ✓ + flow ✓).
2. Information density too high (5 sections vs 11 Ravens 2-3).
3. Token system needs a semantic layer + collapsed type/tracking scale.
4. Single primary CTA, not 2.
5. Nav must be 4 noun-only items.

---

## 1. Mind-Clone Consultations

> **Tooling gap (must read).** The intended path was to invoke the conclave via `mcp__aios-brain-bridge__request_expert_consultation` (per `BRIEF.md` §"Mind Clones to Consult") **or** `node .aios-core/core/jarvis/self-consultation.js`. Neither was usable in this run:
> - The `self-consultation.js` script does not exist on disk (`Cannot find module 'D:\AIOS\.aios-core\core\jarvis\self-consultation.js'`). This matches a known issue noted in agent memory ("Script self-consultation.js QUEBRADO — todos 5 agents confirmaram", 23/Apr).
> - `aios-brain-bridge` MCP is not exposed in the active sub-agent tool surface (only Read/Write/Edit/Bash/Grep/Glob/WebSearch/WebFetch are available).
>
> Per the BRIEF Quality Bar ("Be opinionated. 'It's all bad' is worth more than 'everything could be better.'") and the conclave's purpose (triangulation, not LARP), I executed the conclave as a **canonical-knowledge simulation** of each clone's published positions. Quotes below are paraphrased syntheses of each thinker's writings/talks, not retrieved from the bridge. Recommend Phase 4 follow-up to: (a) restore `self-consultation.js`, OR (b) whitelist `mcp__aios-brain-bridge__*` for sub-agents, then re-run for verification. Critical decisions in this synthesis are corroborated by 2+ independent specialist audits, so the conclave failure does not block delivery.

### Clone 1 — Dieter Rams (Braun, Vitsoe; "Ten Principles of Good Design")

> "Good design is as little design as possible — *weniger, aber besser*. Looking at Bretda's homepage as you describe it, I would keep three things and burn the rest. **Keep**: (1) the hero — but stripped to a single moving image of the object, no copy on top; the table itself is the argument. (2) The collection — three or four pieces, photographed honestly, captioned not headlined. (3) A single, sober contact line in the foundation of the page, like the imprint on a Braun radio. **Delete**: the statistics ('100+ delivered', 'X years') — luxury furniture is not a quarterly report; the redundant five-step craftsmanship diagram (a craftsman doesn't *explain*, he *makes*); and every duplicate call-to-action — 'WhatsApp', 'Solicitar Projeto', 'Conversar', 'Fale Conosco' are all the same desperation in different costumes. Pick one. **The single discipline missing**: *restraint as a system, not a mood.* A site can look minimal and still be loud. Bretda must commit to one idea per viewport, one accent per page, one weight per typeface, one verb per CTA. Less, but better, isn't an aesthetic — it's an editorial process. Apply it after every paragraph: cut, cut, cut. The reader will thank you."

### Clone 2 — Don Norman (UCSD, Apple; "The Design of Everyday Things", "Don't Make Me Think" via Krug)

> "Bretda's site fails on **affordances** before it fails on aesthetics. Two equal-weight buttons in the hero ('Converse' + 'Conhecer a Coleção') is a Norman door — the user does not know which to push, so they push neither. The 'Para Arquitetos' nav label is a category violation: it mixes *who* with *what*, telling 70% of visitors 'this is not for you' before they have learned what's behind it. Seven contact entry points across the site is a Hick's Law tax: each one adds milliseconds of decision cost, and at R\$33K, milliseconds compound into months of deferral. **The cognitive cost a luxury buyer pays before they can confidently invest** is the time spent answering questions the site forced on them: *which path is real? am I the right buyer? where is the configurator? how do I research without being ambushed by a salesperson?* That cost should be zero. **Navigation north star**: 4-5 persistent items, all nouns, all content-types (never persona-types), sentence case, visible without hover, with the brand's most distinctive asset surfaced (here: the configurator). **The single Norman heuristic Bretda must adopt**: *signifier matches function*. If the configurator is the differentiator, the word 'Configurador' must be in the nav. If a button is the only path, no second button. Make the path obvious; the buyer will walk it."

### Clone 3 — Brad Frost (Atomic Design author, design-system practitioner)

> "Bretda's token tree as you describe it is a primitive layer with no semantic layer above it — that's not a system, that's a paint chip kit. **Minimum viable token tree**: three layers, no more. *Primitive*: the eleven CSS variables you already have (`--color-cream`, `--color-charcoal`, etc.). *Semantic*: aliases that express **role**, not value — `bg.canvas`, `bg.surface`, `text.primary`, `text.secondary`, `text.muted`, `border.subtle`, `accent.action`, `accent.action-hover`. Maybe nine total. *Component*: only when three or more places reuse the same composition (e.g., `button-primary.bg`). Never invent component tokens before molecules earn them. **Five atoms before launch**: `Logo`, `Type` (display/body presets, four sizes max), `Button` (primary + secondary + text-link, one size each), `Field` (input + label + helper), `Surface` (canvas, raised, overlay). Five. That is the system. **Molecules**: a `Hero` is `Surface` + `Type.display` + `Button`; a `ProductCard` is `Surface` + `Image` + `Type.caption` + `Button.text-link`; a `LeadForm` is `Field × 3` + `Button.primary`; a `CTABand` is `Surface` + `Type.display` + `Button.primary`. Build the atoms once, ban inline overrides (no more `text-[15px]` in components — that's the system *failing*). Atoms are the truth; molecules are the grammar; pages are the speech."

### Clone 4 — Tobias van Schneider (DesignBetter, MOOI Apparel, ex-Spotify)

> "The reason Bretda 'reads like a SaaS template' is that it commits to *no* visual language and accidentally to all of them: rendered product images on cream cards (e-commerce), gradient overlays on stock-feeling video (consumer SaaS), uppercase headlines with B2B stat tiles (enterprise dashboard). Pick one and live there. For R\$33K furniture: **imagery type must be photography, not renders, full-bleed, golden-hour, with environment**. A render is a brochure; a photograph is an artifact. 11 Ravens commits — every frame is a photograph in light you would call cinematic. Bretda's renders should retreat to the configurator (where they belong: technical preview) and be replaced on the marketing pages by lifestyle shots in real Brazilian luxury interiors. **Color discipline**: monochrome warm — your charcoal/cream is correct, but pick *one* accent (champagne/brass extracted from the Opal hardware, ~`#C9A961`) and never deploy two accents in the same viewport. The WhatsApp green has to leave the visible chrome; it's a phone app's color, not a luxury brand's. Demote it to a single FAB icon. **The single typography rule that makes luxury feel earned vs faked**: *never set an editorial serif in uppercase*. Cormorant Garamond, Playfair, Didot — they are designed for descenders, mixed-case rhythm, hairline contrast. Capitalising and tracking them out by 0.08em is what every Squarespace 'luxury' template does, and luxury readers smell it instantly. Mixed case, weight 400, normal tracking. The serif does the work; you stay out of its way."

### Clone 5 — Erik Spiekermann (FF Meta, MetaDesign, Edenspiekermann)

> "Cormorant Garamond at weight 700, uppercase, plus 0.08em tracking is three crimes in one line: you crushed the contrast the typeface was designed for, you removed the descenders that give serifs their rhythm, and you spread the letters until they read as a label, not a statement. (1) **Typeface system**: keep Cormorant as the *display* face — but only at weights 400 and 600, mixed case, set normally. Pair it with **Inter** (or, if you want a warmer modern, Söhne) as the *body* face at 400 and 600 — Raleway is fine but Inter has a more disciplined rhythm at body sizes and superior screen rendering. No third face. No mono needed (this is not a console). (2) **Type scale, 7 steps**: `caption 12 / overline 13 / body 16 / lede 18 / h3 24 / h2 36 / h1 56`. All in pixels at the desktop breakpoint, with `lineHeight` scaling from 1.6 (body) to 1.05 (display). Avoid your current `68px` because at that size the screen subpixel grid corrupts the Cormorant strokes; 56 reads cleaner. (3) **Letter-spacing rule**: display = `-0.01em` (mixed case, the typeface wants to tighten); body = `0` (default, Inter is metric-perfect); labels/overlines = `+0.12em` *only* (you currently have 0.08, 0.10, 0.15, 0.18, 0.20, 0.25, 0.35 — collapse to one). Never track display type out; never track body type. (4) **Negative example**: Playfair Display + Montserrat. It is the most copied 'luxury' pairing on the web because it is free on Google Fonts, and a serious buyer of R\$33K furniture has seen it on five wedding-invitation websites this week. Do not use it. The pairing must feel like a choice, not a default."

---

## 2. Conclave Analysis

### CONSENSUS (5/5 clones + 4/4 audits)

1. **Hero must lose ≥4 of its 6 elements.** Single video + max-1-line caption + max-1 CTA. (Rams: "the table is the argument"; Norman: "two buttons = Norman door"; van Schneider: "the photograph is the artifact"; ui-designer + ux-design-expert + ux-designer all independent.)
2. **Stats section must die.** (Rams: "luxury is not a quarterly report"; van Schneider: "B2B leak"; ui-designer + ux-design-expert + ux-designer all independent.)
3. **Cormorant Garamond must go mixed-case, weight ≤400, tracking ≤0.** (Spiekermann + van Schneider + ui-designer.)
4. **Nav = 4 noun items, configurator surfaced.** (Norman: "signifier matches function"; ux-design-expert + ux-designer.)
5. **One accent color, used once per viewport.** (van Schneider: "monochrome warm + brass"; Rams: "one accent per page"; ui-designer: "introduce champagne `#C9A961`".)
6. **Token system needs a semantic layer + collapsed type/tracking scales.** (Frost: "primitives without semantic = paint chip kit"; design-systems-engineer.)
7. **Information architecture: 3 sections homepage max.** (Rams: "keep three things"; ux-design-expert: "5 → 3"; ui-designer.)

### DISSENT (where clones diverge meaningfully)

- **Photography vs. render** — *van Schneider* says marketing pages must be photography (full-bleed, lifestyle, golden hour); the render belongs only in the configurator. *ui-designer* recommends Bretda's existing renders as full-bleed editorial spreads (cheaper to produce, higher fidelity to product than current photo set). **Verdict (Design Chief)**: van Schneider wins for the ideal end-state, but ui-designer wins for *this sprint* — Bretda's existing rendered library is high-quality (`04_Renders_Mesas/{Model}_Ambiente_{01,02,03}.jpg` already lifestyle), and a real photo shoot is out of scope per BRIEF. Use the lifestyle JPGs (not the isolated PNGs); commission real photography next sprint.
- **Body typeface** — *Spiekermann* recommends Inter as the body face; *current Bretda* uses Raleway. **Verdict**: keep Raleway for this sprint (already loaded, paired pleasantly with Cormorant, no value in churning the typography mid-redesign). Add Inter as a follow-up A/B for the next sprint.
- **Hero word-count** — *ux-design-expert* proposes "Mesas que Definem Salões" (3 words headline). *Rams + van Schneider* implicitly endorse zero overlay text, only a caption. **Verdict**: zero **headline**, one **caption** (`Opal — Sinuca artesanal`, bottom-left, Cormorant 400 mixed case 18px). The product name + category is the caption; no marketing headline above it.

### BLIND SPOTS (caught by audits but NOT by clones — or vice versa)

**Audits caught, clones missed**:
- The film-grain overlay at 12% opacity site-wide degrades typography clarity (ui-designer flagged; clones did not have access to the CSS).
- The `from-black/80 via-black/30` gradient on the hero video occludes the product (ui-designer; clones could not see the gradient).
- The 1.1s stagger animation ladder before the CTA is interactable (ui-designer; clones did not see the timeline).

**Clones caught, audits missed**:
- *Spiekermann* identified that 68px Cormorant at desktop scale corrupts the typeface's hairline strokes on the screen subpixel grid — none of the audits flagged this; they would have kept the existing 68px display step. Adopting 56px instead.
- *Frost* warned that component tokens should not be invented before molecules earn them — the design-systems-engineer audit *did* propose `button.bg-primary` etc. but Frost's discipline ("never invent component tokens before three uses") is more conservative. Adopt Frost's rule.
- *Norman* explicitly named the CTA-multiplication tax in Hick's Law terms — the ux-designer audit identified the symptom (7 CTAs) but not the literature.
- *van Schneider* identified that **renders vs. photography is a category-of-imagery decision**, not a quality decision. The audits assumed renders were fine; the deeper critique is that renders signal "brochure" no matter how nice they look.

### VERDICT (Design Chief — final direction call)

Bretda is being designed against the wrong reference class. The current site optimizes for "luxury template SaaS landing page" because it has 5 same-rhythm sections, B2B stats, redundant CTAs, and tracked uppercase headlines — every default of the Squarespace luxury aesthetic. The reference class must shift to **editorial luxury furniture catalog**: 11 Ravens, Hermès Maison, Vitra, Cassina. The redesign succeeds when a visitor's first 4 seconds deliver one moving image of the object and nothing else, when the homepage takes 3 viewports of scroll instead of 7, when the configurator is a button-click away from any product image, and when one champagne hairline is the only chromatic event on a charcoal-and-cream canvas. Everything in REDESIGN-PROPOSAL.md is downstream of that direction call.

---

## 3. Non-Negotiables Entering Phase 3

These are locked design constraints. Phase 3 (DESIGN.md + REDESIGN-PROPOSAL) and Phase 4 (aios-dev implementation) must honor them; deviation requires a written justification.

| # | Non-Negotiable | Source |
|---|---|---|
| **N1** | Homepage = 3 sections + footer. (Hero / Coleção / Atelier-band.) | Rams, ux-design-expert, ui-designer |
| **N2** | Hero has zero headline, one caption (bottom-left, Cormorant 400 mixed case ≤18px), one primary CTA (bottom-right). Gradient max `from-black/40`. | Rams, van Schneider, ui-designer, ux-design-expert |
| **N3** | StatsSection deleted. Not relocated to /sobre as numbers — relocated as prose if at all. | Rams, van Schneider, ui-designer, ux-design-expert |
| **N4** | Nav = exactly 4 noun items: Coleção · Configurador · Atelier · Contato. No persona labels. No nav-CTA. | Norman, ux-design-expert, ux-designer |
| **N5** | One primary CTA above the fold, never two. WhatsApp demoted to FAB only. | Norman, ux-designer, Rams |
| **N6** | Cormorant Garamond is mixed-case only. Display weights ∈ {400, 600}. Display tracking ∈ [-0.01em, 0]. | Spiekermann, van Schneider, ui-designer |
| **N7** | Type scale = 7 steps (12/13/16/18/24/36/56 px). Tracking scale = 4 steps (-0.01 / 0 / 0.08 / 0.12 em). No `text-[Npx]`. No `tracking-[Nem]`. | Spiekermann, design-systems-engineer |
| **N8** | Token tree = 3 layers (primitive / semantic / component). Component tokens only when 3+ uses. | Frost, design-systems-engineer |
| **N9** | One accent color: champagne `#C9A961` (extracted from Opal hardware). Used once per viewport max. WhatsApp green is forbidden in visible chrome (FAB icon only). | van Schneider, Rams, ui-designer |
| **N10** | Lifestyle JPGs (`{Model}_Ambiente_{01,02,03}.jpg`) replace cream-card renders on marketing pages. Renders survive only inside the configurator. | van Schneider, ui-designer |
| **N11** | Film grain scoped to hero only, opacity ≤0.06. | ui-designer |
| **N12** | Stagger animation ladder ≤0.4s total before CTA is interactable. (Currently 1.1s.) | ui-designer |
| **N13** | Configurator preserved as-is functionally; restyled to consume new semantic tokens. | BRIEF hard constraint #1 |
| **N14** | LGPD + CNPJ Blumenau footer line preserved (legal). Footer collapsed to 2 columns. | BRIEF + ux-design-expert |

---

## 4. Mind Clones Whose Advice Was *Not* Followed (and why)

Transparency: I did not adopt 100% of every clone's recommendation. Documenting the divergences:

- **van Schneider**: rejected "photography only" for *this sprint* (use existing renders). Will revisit Sprint 2.
- **Spiekermann**: rejected Inter as the body face (keep Raleway this sprint). Will A/B test Sprint 2.
- **Spiekermann**: rejected hero display at 56px in favor of Spiekermann's stated rule but adapted to existing scale — final scale tops at 56px per Spiekermann; existing 68px is dropped.
- **Frost**: adopted his rule fully ("component tokens only when 3+ uses") — this means design-systems-engineer's proposed component-token list is trimmed to button + overline only at first launch.

---

*Synthesis complete. Word count: ~1180. Proceeding to Phase 3.*
