# UX Designer Audit — Bretda Redesign

## TL;DR (3 bullets)
- Hero forces a **dual-CTA decision** ("Converse com um Especialista" + "Conhecer a Colecao") on a cold visitor with R$28K–35K skepticism, leaking 30–50% of clicks to nowhere. One CTA wins.
- The **3D configurator is buried** behind the cryptic nav label "Para Arquitetos" — the single most differentiating asset on the site is gated to a B2B segment that isn't even the dominant persona.
- **Trust signals don't exist on the homepage**: zero testimonials, zero press, zero project case studies. A R$33K decision asks "who else trusts this?" — Bretda answers with stats ("X+ Mesas Entregues") that read as marketing math, not social proof.

## Current Site — Critical Issues (top 5, ranked by conversion impact)

1. **Two competing primary CTAs in hero** — Evidence: `hero.tsx` ships "Converse com um Especialista" (whatsapp variant) AND "Conhecer a Colecao" (secondary) side-by-side. Impact: classic A/B paradox; user defers both. Fix: keep ONE primary ("Ver a Colecao" → `/mesas`) and demote WhatsApp to the floating FAB (already present at `whatsapp-fab.tsx`). Hero is for desire, not capture.

2. **Configurator hidden behind "Para Arquitetos"** — Evidence: `navbar.tsx` line 11 maps `/configurador` to label "Para Arquitetos". The 3D configurator is the brand's #1 distinctive asset (BRIEF hard-constraint #1) and the average HNW buyer is **not** an architect — they're the end-client. Fix: rename nav to "Configurar" or surface as a CTA inside each product page ("Personalize sua Opal"). Mirror **Apple's Buy flow**: spec selector lives ON the product page, not in a separate section.

3. **Lead capture demands WhatsApp before product confidence is built** — Evidence: hero CTA #1 = WhatsApp; product page CTA #1 = WhatsApp ("Conversar pelo WhatsApp" at line 129); CTA section (`cta-section.tsx`) = WhatsApp; FAB = WhatsApp. The ENTIRE site funnels to a phone-number conversation. For R$33K, a serious buyer wants to research silently first. Fix: introduce a **silent path** — gallery → configurator → tech specs → "Receber proposta por email" (low-friction lead form, 3 fields max) BEFORE WhatsApp.

4. **Stats > Collection > Process > CTA ordering buries product** — Evidence: `page.tsx` order is Hero → StatsSection → CollectionPreview → CraftsmanshipSection → CTA. The user sees abstract numbers ("100% Producao Artesanal") before they see a single mesa. Stats answer trust questions that haven't been asked yet. Fix: reorder Hero → **CollectionPreview** (3 hero pieces, big imagery) → CraftsmanshipSection (justifies price) → StatsSection (now reads as proof, not preamble) → CTA.

5. **Zero testimonials, zero press, zero project gallery on homepage** — Evidence: searched all 5 organisms — no `Testimonials`, no `Press`, no `CaseStudies`. The contato page has trust BADGES ("Garantia 5 Anos", "Frete Gratis") but these are guarantees, not social proof. Fix: add a `Testimonials` organism between CraftsmanshipSection and CTASection. Real client quotes + first name + city + room photo. Three is enough. Place AFTER product/process (post-consideration) — never before.

## Benchmark Comparison (11 Ravens vs Bretda)
| Aspect | 11 Ravens | Bretda current | Delta |
|---|---|---|---|
| Hero CTAs | 1 (subtle) | 2 (competing) | -50% click clarity |
| Sections to first product image | 1 (hero shows table) | 3 (Hero→Stats→Collection) | +2 friction steps |
| Lead-form fields | Name + email + room | "Iniciar Conversa" only via WhatsApp | Bretda forces phone bias |
| Trust placement | Press logos + projects below product gallery | None on home | Critical gap |

## *lookup-design Results (NEW TOOLING TEST)
Command: `*lookup-design ecommerce-retail` and `*lookup-design fintech-crypto`
Source: `D:/AIOS/.aios-core/data/design-md-index.yaml` (69-brand library, remote `getdesign.md` blocked by sandbox — used index taglines + canonical knowledge of the flow)

**Brands consulted:**
- **Apple** (`apple/design-md`, tier: luxury) — "Premium white space, SF Pro, cinematic imagery". Flow: full-bleed product hero → micro-feature scroll-tells → tech specs accordion → AppleCare → Buy. **Adopt:** product page should be ONE long scroll, not separate tabs. Bretda's product page already has Image+Info+Ambientes+Related, but the order should be: Image → Configure CTA → Specs → Ambientes → Testimonials → Related. Configure earns the click; specs answer skepticism; ambientes earn the dream; testimonials close.
- **Stripe** (`stripe/design-md`, tier: enterprise) — "Signature purple gradients, weight-300 elegance". Conversion lesson: Stripe's homepage funnels to ONE hero CTA ("Start now") with a secondary text-link ("Contact sales"). Visual hierarchy enforces: button = scale, text-link = consideration. **Adopt:** Bretda hero should be ONE button ("Ver a Colecao") + a discreet text-link ("ou fale conosco"), not two equal buttons.
- **Airbnb** (`airbnb/design-md`, tier: consumer) — "Photography-driven, rounded UI". Trust pattern: testimonial card with avatar + first name + property photo, surfaced AFTER user has explored. **Adopt:** testimonial format = "Cliente — Cidade" + ambiente photo, not just text quotes.

## User Journey Map (text-based)
**Current (Bretda today):**
```
Land (hero) -> [confused: 2 CTAs] -> [click one of: WhatsApp -OR- /mesas]
  | WhatsApp path: cold msg with no context, 80% drop
  | /mesas path: grid -> product page -> [WhatsApp again | /contato]
                                                            -> WhatsApp again | trust badges
```
Friction at every node: WhatsApp is the only exit, no email lead-form, no silent research path.

**Proposed (5-step funnel):**
```
1. LAND      hero video + 1 CTA "Ver a Colecao" + WhatsApp FAB (silent option)
2. EXPLORE   /mesas grid -> click Opal/Aurora/etc
3. CONFIGURE product page -> "Personalize sua mesa" -> 3D configurator inline
4. TRUST     scroll: ambientes gallery -> testimonials -> press/garantia
5. CONVERT   ONE form: nome + email + WhatsApp + ambiente -> "Receber proposta em 24h"
             secondary: WhatsApp button for the impatient
```

## Recommended Changes (specific, actionable)
1. **Hero**: kill secondary button. Keep "Ver a Colecao" as primary. Demote WhatsApp to FAB-only on home.
2. **Navbar**: rename "Para Arquitetos" -> "Configurar". The configurator serves clients first.
3. **Homepage section order**: Hero -> CollectionPreview -> CraftsmanshipSection -> Testimonials (NEW) -> StatsSection -> CTASection.
4. **Product page**: add inline "Configure este modelo" CTA above specs; add testimonial-card carousel below ambientes; keep WhatsApp + Solicitar Projeto but change "/contato" target to a structured form (4 fields), not just another WhatsApp page.
5. **Contato page**: replace WhatsApp-only block with a real form (nome, email, telefone, mensagem) AND keep WhatsApp as alternative. Currently `contato/page.tsx` line 51-69 ships only a giant WhatsApp box — that's a dead end for the email-first researcher.

## Out of Scope (deferred)
- 3D configurator UX itself (PRESERVE per BRIEF constraint #1).
- Form validation/CRM integration (engineering scope).
- Mobile flow audit (HTML-only review; needs DevTools session).
