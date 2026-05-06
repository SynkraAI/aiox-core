# Fase 6 — Motion System v2 (executable spec)

**Consumer:** `@dev` em Story S-8.5 (+ Patch #2c urgente)
**Status:** SPEC PRONTO — `@design-lead` ratifica
**Mind Clone inputs absorvidos:** val-head (motion design), dieter-rams (restraint), tobias-van-schneider (scarcity of motion)
**WCAG Blocker:** **Patch #2c** (`prefers-reduced-motion`) **PENDENTE desde Sessão 19** — aplicar **PRIMEIRO**, antes de qualquer motion nova.

---

## 6.1 Princípios não-negociáveis (Rams + Val-head contract)

1. **Scarcity of motion** — máximo **3 elementos** animam simultaneamente no viewport.
2. **Purposeful delay** — delays em sequência são **crescentes**, nunca uniformes.
3. **Settling, not flicking** — `ease-out-expo` para luxury, `quartic` para produtividade.
4. **Compositor only** — apenas `transform` + `opacity`. Zero `left/top/width/height` animados.
5. **No scroll-jacking** — GSAP pin para holds editoriais OK; scroll-speed override NÃO.
6. **`prefers-reduced-motion`** — **OBRIGATÓRIO em toda animação CSS/JS** sem exceção.

---

## 6.2 Patch #2c — Global reduced-motion (APLICAR IMEDIATAMENTE)

**Local:** append ao final de `globals.css`.

```css
/* ========================================
   WCAG 2.2 AA — Prefers Reduced Motion
   Patch #2c (Sessão 19 Val-head blocker resolution)
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Hero entrance: skip fade-up, materialize immediately */
  .hero-h1, .hero-label, .hero-subtitle, .hero-ctas, .hero-scroll-indicator {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

**Validação:** abrir DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → verificar zero animação visível em todas as páginas.

---

## 6.3 Cinco classes de motion (Val-head differentiated)

### Classe 1 — Hero entrance (LCP-safe)

**Uso:** Elementos above-the-fold que são first-paint.
**Regra:** H1 **zero delay** (LCP protegido). Subtitle 250ms. CTAs 550ms. Scroll indicator 1500ms (below fold).

```css
@keyframes entrance-fade-up-tight {
  from { opacity: 0; transform: translate3d(0, 16px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes entrance-fade-up-medium {
  from { opacity: 0; transform: translate3d(0, 32px, 0) scale(0.99); }
  to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes entrance-fade-up-relaxed {
  from { opacity: 0; transform: translate3d(0, 20px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes entrance-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.hero-h1, .hero-label {
  animation: entrance-fade-up-tight 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: opacity, transform;
}
.hero-subtitle {
  animation: entrance-fade-up-medium 800ms cubic-bezier(0.16, 1, 0.3, 1) 250ms both;
  will-change: opacity, transform;
}
.hero-ctas {
  animation: entrance-fade-up-relaxed 700ms cubic-bezier(0.16, 1, 0.3, 1) 550ms both;
  will-change: opacity, transform;
}
.hero-scroll-indicator {
  animation: entrance-fade-in 1800ms ease-out 1500ms both;
  will-change: opacity;
}
```

> **Substitui** o bloco atual `.hero-h1/.hero-label/.hero-subtitle/.hero-ctas` (linhas 151-179 do `globals.css` atual). Este é **Patch #1b-v2** (corrigido per Sessão 19 mind clones: distances diferenciadas + scale subtle no subtitle + easing expo em vez de quartic).

### Classe 2 — Product reveal (scroll-triggered)

**Uso:** Product cards entrando em viewport durante scroll.
**Stack:** IntersectionObserver puro (sem lib) + CSS class toggle.

```css
@keyframes product-reveal {
  from { opacity: 0; transform: translate3d(0, 24px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.product-reveal-target {
  opacity: 0;
  transform: translate3d(0, 24px, 0);
  will-change: opacity, transform;
}
.product-reveal-target.is-revealed {
  animation: product-reveal 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
/* Stagger delay per card (usar inline style ou class modifier) */
.product-reveal-target.delay-1 { animation-delay: 80ms; }
.product-reveal-target.delay-2 { animation-delay: 160ms; }
.product-reveal-target.delay-3 { animation-delay: 240ms; }
```

**IntersectionObserver hook (client component):**

```tsx
'use client'
import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed')
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
```

### Classe 3 — Scroll storytelling (Atelier longform chapters)

**Uso:** Atelier longform — `/atelier` com 5 chapters em sequência vertical com hold editorial.
**Stack:** GSAP ScrollTrigger (já em `package.json`).

```css
.chapter-target {
  opacity: 0.3;              /* dim até entrar em foco */
  transform: translate3d(0, 48px, 0);
  transition:
    opacity 900ms cubic-bezier(0.65, 0, 0.35, 1),
    transform 900ms cubic-bezier(0.65, 0, 0.35, 1);
}
.chapter-target.is-active {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
```

**GSAP ScrollTrigger (client component `atelier-longform-chapter.tsx`):**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useChapterScroll() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => el.classList.add('is-active'),
      onEnterBack: () => el.classList.add('is-active'),
      onLeave: () => el.classList.remove('is-active'),
      onLeaveBack: () => el.classList.remove('is-active'),
    })
    return () => st.kill()
  }, [])
  return ref
}
```

> **Regra:** **sem pin** em viewports mobile (<768px) — GSAP pin degrada UX mobile, deixa scroll nativo.

### Classe 4 — Micro-interaction (hover/focus/click)

**Uso:** CTAs, links, swatches, form fields.

```css
/* Base transition helper */
.micro-interact {
  transition:
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
    color 200ms cubic-bezier(0.4, 0, 0.2, 1),
    background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* CTA button hover: micro-settle (not scale 1.05 flat) */
.btn-primary:hover:not(:disabled) {
  transform: translate3d(0, -1px, 0);
  background-color: var(--gold-300);
}
.btn-primary:active:not(:disabled) {
  transform: translate3d(0, 0, 0);
  transition-duration: 80ms;
}

/* Product card hover: masked reveal (substituir scale 1.05 flat atual) */
.product-card-image {
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
.product-card:hover .product-card-image {
  transform: scale(1.03);      /* menos que 1.05, mais luxury */
}
.product-card-chevron {
  transition: opacity 500ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Classe 5 — Page transition (Next 16 view transitions API)

**Uso:** navegação entre rotas (home → colecao → produto → atelier).
**Stack:** Next 16 View Transitions API — ver `node_modules/next/dist/docs/01-app/01-getting-started/17-view-transitions.md`.

```css
/* View transitions CSS (global) */
::view-transition-old(root) {
  animation: 300ms cubic-bezier(0.83, 0, 0.17, 1) both fade-out-slight;
}
::view-transition-new(root) {
  animation: 400ms cubic-bezier(0.83, 0, 0.17, 1) both fade-in-up-slight;
}
@keyframes fade-out-slight {
  to { opacity: 0; transform: translate3d(0, -8px, 0); }
}
@keyframes fade-in-up-slight {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
```

**Consulta obrigatória antes de implementar:** `node_modules/next/dist/docs/01-app/01-getting-started/17-view-transitions.md` (Next 16 breaking changes).

---

## 6.4 Tabela de referência rápida (para @dev consumir)

| Classe | Token easing | Duration | Distance | Delay | Trigger | Stack |
|---|---|---|---|---|---|---|
| Hero entrance (H1) | ease-out-expo `(0.16,1,0.3,1)` | 700ms | 16px | 0 | Page load | CSS |
| Hero entrance (subtitle) | ease-out-expo | 800ms | 32px + scale 0.99→1 | 250ms | Page load | CSS |
| Hero entrance (CTAs) | ease-out-expo | 700ms | 20px | 550ms | Page load | CSS |
| Hero scroll indicator | ease-out | 1800ms | opacity | 1500ms | Page load | CSS |
| Product reveal | quartic `(0.22,1,0.36,1)` | 600ms | 24px | 0 + 80ms stagger | IntersectionObserver 15% | CSS + JS |
| Scroll storytelling | ease-in-out-cubic `(0.65,0,0.35,1)` | 900ms | 48px + opacity 0.3→1 | — | GSAP ScrollTrigger 70%-30% | GSAP |
| Micro-interaction hover | standard `(0.4,0,0.2,1)` | 200ms | 1-4px | — | :hover/:focus | CSS |
| Page transition (out) | expo `(0.83,0,0.17,1)` | 300ms | 8px + opacity | — | Route change | View Transitions API |
| Page transition (in) | expo | 400ms | 8px + opacity | — | Route change | View Transitions API |

---

## 6.5 Luxury guardrails (tobias-van-schneider contract)

- **Máximo 3 elementos em movimento simultâneo.** Se hero + product card stagger + scroll indicator rodam juntos, stagger é **contado** (cada card é 1 elemento). Solução: stagger 80ms garante que cards não coincidem.
- **Micro-settle em CTAs:** hover termina com `scale(1)`, não `scale(1.05)`. Ilusão de "pousa". Spring overshoot opcional de 0.01 via CSS custom properties interpolation (Chrome 120+).
- **Texture animada:** proibido. Paper-grain é static, não animate.
- **Cursor custom:** proibido. Cursor customizado em luxury digital vira gimmick (vide Awwwards trend dropou 2024).
- **Pariação com atelier real:** motion deve sugerir **tempo artesanal** (slow dolly, settling). Nada de velocidade SaaS.

---

## 6.6 Sub-tasks de S-8.5

1. Aplicar **Patch #2c** (prefers-reduced-motion global block) — **URGENTE, pode preceder todo o resto**.
2. Substituir bloco `.hero-*` atual pelo `Classe 1` deste spec.
3. Criar hook `use-reveal.ts` + classe `.product-reveal-target` + aplicar em `product-card.tsx` variant editorial.
4. Criar hook `use-chapter-scroll.ts` + classe `.chapter-target` + aplicar em `atelier-longform-chapter.tsx` (Fase 4b).
5. Substituir hover flat scale 1.05 por micro-settle 1.03 + translate -1px em `product-card.tsx` e `button.tsx`.
6. Implementar view transitions em `layout.tsx` + `globals.css` (consultar Next 16 docs antes).
7. Validar: Lighthouse mobile prod Perf **não regride** vs baseline v4 (89/94/93). Motion zero-cost bundle.
8. Validar: `prefers-reduced-motion: reduce` emulado — zero animação em qualquer página.
9. Validar: `axe-core` 0/0/0/0 pós-mudanças.

---

## 6.7 Critério de aceite (DoD para S-8.5)

- [ ] Patch #2c aplicado e validado em todas as páginas
- [ ] 5 classes implementadas, nenhuma anima `left/top/width/height`
- [ ] `scarcity-of-motion` respeitado (regra: máximo 3 elementos simultâneos em viewport)
- [ ] Lighthouse mobile Perf ≥ 89 home · ≥ 93 contato · ≥ 90 produto · ≥ 90 atelier
- [ ] axe 0/0/0/0
- [ ] Teste manual: emulate reduced-motion → zero animação
- [ ] GSAP ScrollTrigger só em atelier longform (outras páginas não carregam)
- [ ] View Transitions funciona em Chrome, fallback silencioso em Safari/Firefox

---

*Nova — motion spec v2 ratificado*
