# Tocks Elevation — Master Plan Fases 3-7

**Direção aprovada:** **B** (Gilded Noir Cinemático) **+ cherry-pick E** (Provenance card) **+ cherry-pick C** (Atelier longform)
**Aprovação:** usuário via `*approve` — 2026-04-17
**Orquestrador:** `@design-lead` (Nova)
**Path:** `apps/tocks-website/docs/design/elevation-awwwards/`
**Pré-requisito bloqueante:** `prefers-reduced-motion` (Patch #2c Sessão 19) **antes** de qualquer motion novo.

---

## Plano paralelo (5 streams — executados em paralelo onde possível)

| Fase | Stream | Executor (persona AIOS) | Mind Clones | Output | Dep |
|---|---|---|---|---|---|
| **3** | Hero video spec | `@ui-designer` + `@motion-designer` | tobias-van-schneider, val-head | `02-hero-video-storyboard.md` — 8-12s shot list + ambient + fallback still + prompt Runway/Veo | — |
| **4** | Provenance card + Atelier longform | `@ux-designer` + `@ui-designer` | edward-tufte, tobias-van-schneider | `03-provenance-card-spec.md` + `04-atelier-longform-spec.md` — wireframes + data model + broken grid | — |
| **5** | Token refinement Gilded Noir v2 | `@design-systems-engineer` | dieter-rams, erik-spiekermann | `05-tokens-v2.md` — noir 3-shade, bone layer, gold 5-step, paper-grain, cinematic-shadow + type stack v2 | — |
| **6** | Motion system | `@motion-designer` | val-head, dieter-rams | `06-motion-system.md` — 5 classes (hero entrance, product reveal, scroll storytelling, micro-interaction, page transition) + **prefers-reduced-motion MANDATORY** | Bloqueia Patch #2c |
| **7** | Component elevation + copy reposicionamento | `@ui-designer` + `@ux-writer` | brad-frost, tobias-van-schneider | `07-component-elevation.md` + `08-copy-repositioning.md` — spec per component + BRAND_COPY novo "móveis de autor" | 5 (tokens), 6 (motion) |
| **8** | Handoff `@dev` | `@design-lead` consolida → `@pm` cria Epic 8 stories | — | `09-epic-8-stories.md` — S-8.1/8.2/8.3 bottom-up | 3, 4, 5, 6, 7 |

---

## Fase 3 — Hero Video Spec (brief para execução)

**Tese B:** ritual de abertura cinematográfico. Showroom privado, câmera slow-dolly, chiaroscuro.

**Deliverable:** storyboard + shot list + Runway/Veo 3 prompt + fallback still.

**Constraints técnicos:**
- Formato: 1920x1080, H.264 + WebM VP9 + HEVC fallback. Max 2MB (prioridade LCP).
- Duração: 8-12s loopable. Sem áudio (autoplay muted).
- Poster frame: primeiro frame estático em JPG/AVIF <80kb.
- Mobile: versão 720x1280 vertical + pôster mobile.

**Shot list (draft Nova — refinável pelo executor):**
1. 0-2s — **Penumbra**: ambiente escuro, zoom lento de 35mm em detalhe textural madeira (grain close-up).
2. 2-5s — **Revelação**: dolly-out mostra mesa emergindo de chiaroscuro. Apenas 30% visível, luz quente (3200K) pincela borda.
3. 5-8s — **Hold**: mesa em composição 1/3, gold accent em ferragem (ink-well moment).
4. 8-12s — **Loop seamless**: fade crossdissolve para loop.

**Ambient layer stills** (fallback quando video falha):
- Still A: close-up grain madeira (noir key-light gold rim)
- Still B: mesa 3/4 em penumbra

**Prompt template Runway Gen-3 / Veo 3:**
```
Interior luxury furniture atelier at night. Single solid wood billiard/lounge table emerges from deep chiaroscuro shadows. Slow dolly-out camera movement, cinematic anamorphic lens. Warm 3200K rim light grazes the wood grain. Single gold metallic accent visible on hardware. Deep noir background, no text, no people. 24fps, shallow depth of field. Reference: Roche Bobois editorial, B&B Italia product film.
```

**Critério de sucesso:** video + poster compostos reduzem LCP <= 2.5s mobile (Lighthouse prod).

---

## Fase 4 — Provenance card + Atelier longform

### 4a — Provenance Card (cherry-pick E — Tufteano)

**Posicionamento:** cada product page ganha card de dossier arquivístico (abaixo do specs).

**Campos:**
- **Origem madeira:** nome + região Brasil (mapa small multiple)
- **Ano de criação:** timeline horizontal com marcos (desenho → corte → acabamento → entrega)
- **Peças criadas:** contador honesto ("03 de 08 da série")
- **Dimensões:** desenho técnico isométrico SVG (small, monoline, gold stroke)
- **Acabamento:** swatch com código (já existe em swatch-picker)

**Regra Tufte:** data-ink ratio máximo. Sem grade. Sem fundo. Tipografia carrega hierarquia.

### 4b — Atelier Longform (cherry-pick C — editorial)

**Posicionamento:** página `/atelier` reescrita como reportagem long-form.

**Estrutura:**
- **Lead** (1 parágrafo): quem, onde, desde quando
- **Ato 1 — Madeira**: foto full-bleed B&W + 3 parágrafos + sidebar small multiple origens
- **Ato 2 — Corte**: broken grid 2 fotos + pull-quote marcenaria
- **Ato 3 — Acabamento**: 4-up grid textural + legenda técnica
- **Ato 4 — Entrega**: testimonial + CTA concierge
- **Cólofon editorial**: ano, tiragem, catálogo anterior

**Constraint Art. VII:** splittar em 5 templates ≤100 linhas.

---

## Fase 5 — Tokens Gilded Noir v2

### 5a — Paleta expandida

```css
/* Noir 3-shade */
--noir-deep: #050508;      /* hero, loading */
--noir-mid:  #0B0B0F;      /* background atual */
--noir-surface: #1A1A1E;   /* surfaces */

/* Bone layer (novo — respiro humano) */
--bone-paper: #F5F0E6;     /* Atelier longform bg */
--bone-warm:  #EDE6D2;     /* surfaces editorial */
--bone-ink:   #1A1812;     /* text sobre bone */

/* Gold 5-step */
--gold-100: #F4E8B8;
--gold-300: #E5C65C;       /* hover atual */
--gold-500: #D4AF37;       /* accent atual */
--gold-700: #8A6F3A;       /* deep atual */
--gold-900: #4A3A1E;       /* shadow-gold */

/* Texture layer */
--texture-paper-grain: url('/textures/paper-grain-12.webp') repeat;
--cinematic-shadow: 0 32px 64px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.08);
```

### 5b — Type stack v2 (Spiekermann target)

**Veredito Cormorant:** overused 2019-2024 luxury. Substituir.
**Proposta:**
- **Headlines:** **GT Alpina** (Adobe) ou **Tiempos Headline** (Klim) — serif editorial com ligaduras; fallback Google **Fraunces**.
- **Body:** **Inter** MANTIDO (trabalho bem; neutro bom para body longo).
- **Display CTA:** substituir Montserrat por **Söhne** (Klim) ou fallback **ABC Diatype** — grotesk editorial menos Shopify; Google free fallback **Space Grotesk**.

**Escala modular:** ratio 1.333 (fourth). Base 18px. Display 57px. Leading 1.4 body, 1.1 display.

### 5c — Migration plan

- Novo `globals.css` v2 com tokens novos **adicionados** (não removidos) → alias tokens antigos → smoke test.
- Migração componente-a-componente em order: atoms → molecules → organisms.
- `--gradient-gold` deprecado em favor de `.text-gradient-gold` utility (já é realidade, só documentar).

---

## Fase 6 — Motion System

### 6a — 5 Classes de motion (Val Head contract)

| Classe | Uso | Easing | Duration | Distance | Notas |
|---|---|---|---|---|---|
| **Hero entrance** | Above-fold LCP elements | `cubic-bezier(0.16,1,0.3,1)` (ease-out-expo) | 700ms | 16px H1 / 32px subtitle / 20px CTA | **H1 zero delay** (LCP); subtitle 250ms; CTA 550ms |
| **Product reveal** | Cards scroll-into-view | `cubic-bezier(0.22,1,0.36,1)` (quartic) | 600ms | 24px | IntersectionObserver 15% threshold; stagger 80ms entre cards |
| **Scroll storytelling** | Atelier longform chapters | `cubic-bezier(0.65,0,0.35,1)` (ease-in-out-cubic) | 900ms | 48px + opacity | GSAP ScrollTrigger pin; 3-chapter hold |
| **Micro-interaction** | Hover/focus/click | `cubic-bezier(0.4,0,0.2,1)` (standard) | 200ms | 1-4px | Compositor only (transform/opacity/color) |
| **Page transition** | Route change | `cubic-bezier(0.83,0,0.17,1)` (expo) | 400ms in / 300ms out | opacity + 8px | Next 16 view transitions API |

### 6b — Reduced Motion (MANDATORY)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Aplicar IMEDIATAMENTE** via Patch #2c Sessão 19 — desbloqueia WCAG AA 2.2.

### 6c — Luxury vs Gimmick rules

- **Scarcity of motion:** máximo 3 elementos animam simultaneamente no viewport (Hermès rule).
- **Purposeful delay:** delays crescentes em sequência, não uniformes.
- **Settling, not flicking:** ease-out-expo > quartic para luxury.
- **No scroll-jacking:** scroll é do usuário, não do designer. GSAP pin OK, scroll-jack NÃO.
- **Micro-settle:** hover CTA termina com scale 1.0 spring (overshoot 0.01), não scale 1.05 flat.

---

## Fase 7 — Component Elevation + Copy Repositioning

### 7a — Componentes-assinatura (elevation priority)

| Componente | Estado | Elevação | Fase motion |
|---|---|---|---|
| `hero.tsx` | CSS-only, placeholder radial | + hero video layer + ambient still fallback + gold ink-line signature | 6a Hero entrance |
| `product-card.tsx` variant editorial | Hover scale 1.05 | Masked reveal madeira grain + editorial number tag (01/08) + provenance teaser | 6a Product reveal |
| **[NOVO]** `provenance-card.tsx` | — | Organism Fase 4a | 6c Micro |
| **[NOVO]** `atelier-longform-chapter.tsx` | — | Template Fase 4b | 6c Scroll |
| `image-grid.tsx` | Uniform grid | Broken grid editorial (assymmetric rows + caption off-axis) | 6c Micro |
| `concierge-form.tsx` | Já ótimo | MANTER zero-change | — |
| `faq-item.tsx` | `<details>` nativo | MANTER | — |

### 7b — Copy reposicionamento (resolve feedback_tocks_moveis_luxo.md)

**`constants.ts` — BRAND_COPY v2:**

```ts
SITE_DESCRIPTION: 'Móveis de autor em madeira maciça. Ateliê em Itajaí, entregas para todo o Brasil.'

hero: {
  headline: 'Peças que atravessam gerações.',
  subtitle: 'Móveis de autor em madeira maciça. Cada peça é um projeto. Cada projeto, uma assinatura.',
}

atelier: {
  headline: 'Desde 2008, madeira e autoria.',
  subtitle: 'Um ateliê onde marcenaria tradicional encontra desenho contemporâneo.',
}

collection: {
  headline: 'Acervo',
  subtitle: 'Mesas, console, aparadores, pebolins — todas sob medida, todas únicas.',
}

projects: {
  headline: 'Casas que receberam Tocks',
  subtitle: 'Interiores de autor merecem móveis de autor.',
}
```

**Regras copy (executor `@ux-writer`):**
- Vocabulário: "peça", "acervo", "projeto", "assinatura", "autoria", "ateliê"
- Banidos: "bilhar" (exceto em contexto técnico de produto), "produto" (→ "peça"), "fábrica" (→ "ateliê"), exclamação
- Tom: verbos fortes, frases curtas, zero adjetivo decorativo
- CTA: "Agende uma consulta" (mantém) · "Converse com o ateliê" (secundário)

---

## Fase 8 — Handoff `@dev` (Epic 8)

**`@pm` cria Epic 8** baseado nos specs consolidados das Fases 3-7:

| Story | Escopo | Horas est. | Dep |
|---|---|---|---|
| **S-8.1** Foundation v2 | Tokens v2 + type stack + `prefers-reduced-motion` + copy BRAND_COPY v2 | 4-5h | — |
| **S-8.2** Hero cinematográfico | Video layer + poster fallback + hero-video organism | 3-4h | S-8.1 |
| **S-8.3** Provenance card | Novo organism + data model `ProductProvenance` + product page integration | 5-6h | S-8.1 |
| **S-8.4** Atelier longform | Reescrita `/atelier` em 5 chapter templates + broken grid image-grid variant | 6-8h | S-8.1 |
| **S-8.5** Motion system | 5 classes CSS + GSAP ScrollTrigger scroll-storytelling + Next 16 view transitions | 5-6h | S-8.1 |
| **S-8.6** QA + A11y + Lighthouse | axe 0/0/0/0 + Lighthouse ≥90 mobile + 5-second test logging | 4-5h | S-8.2,3,4,5 |

**Total estimado:** 27-34h (~4-5 dias dev).

**Quality gates obrigatórios (Karpathy critério verificável):**
- [ ] Scorecard FWA ≥ 8/10 em 7/8 critérios (`*brand-check`)
- [ ] Lighthouse Perf ≥ 90 mobile prod Home + Produto + Atelier + Contato
- [ ] axe-core 0/0/0/0 + `prefers-reduced-motion` em 100% animações
- [ ] 5-second test Krug passa (3 de 5 arquitetos)

---

## Ordem de execução recomendada (Nova)

1. **Paralelo A (imediato):** Fase 5 (tokens v2) + Fase 6 (motion + reduced-motion) — bases compartilhadas.
2. **Paralelo B (após A):** Fase 3 (hero video) + Fase 4 (provenance + atelier) + Fase 7 copy.
3. **Sequencial C:** Fase 8 handoff → `@pm` cria Epic 8 → `@dev` executa.

**Bloqueador externo persistente:** Nano Banana 2 quota — afeta Fase 3 (se video via AI-gen, inicialmente alternativo é captação real) e Fase 4 (fotos atelier).

---

## Handoff pending (consumir ao retomar)

Este doc é fonte de verdade operacional. `@pm` pode criar Epic 8 diretamente a partir daqui. `@dev` não começa nada até Epic 8 criada e tokens v2 (S-8.1) aprovados.

— Nova, Design Lead
