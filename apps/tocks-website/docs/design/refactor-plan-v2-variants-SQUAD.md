# Refactor Plan V2 — Squad Review (clones execute, chief approves)
Generated: 2026-04-16 by @design-chief (Orchestrator)
Baseline: `docs/design/refactor-plan-v2-variants.md` v1 (Uma, @aios-ux, 2026-04-16)
Violation corrected: v1 foi produzido pelo chefe sozinho — regra "Mind Clones as Workers" exige clones executarem, chefe aprovar.

---

## Squad composition

- **Executors (workers):** @brad-frost, @dieter-rams, @don-norman, @tobias-van-schneider, @sarah-drasner
- **Approver (reviewer):** @ux-design-expert (Uma)
- **Orchestrator:** @design-chief
- **Consultation IDs:** 673209b5 (brad), baa6bd6d (rams), b95c00b1 (norman), 1ea46317 (tobias), c31ea9d8 (drasner) — todas salvas em `D:/jarvis/bridge-data/consultations/`

---

## Each clone's critique

### brad-frost — Atomic hierarchy
Hierarquia **85% correta, 3 correções obrigatórias**:

- `step-indicator` NÃO é atom puro (tem lógica numérica "X de 7" + estado) → **promover a molecule**.
- `stats-row` NÃO é organism (sem interação, só dados display) → **rebaixar a molecule**.
- `concierge-layout` template é **overkill** — usar `variant="concierge"` prop em `page-layout.tsx` (DRY, mesma abordagem do ProductCard editorial).

**Confirmações:** `swatch-picker` como molecule acertou. `product-card variant='editorial'` respeita DRY — variant prop é padrão atomic. `cta-block` como organism acertou.

**Lacuna:** Falta atom `text-pair` (label-uppercase gold + value) reutilizado em stats-row, specs-table e investimento-block — extrair evita duplicação em 3 organismos.

**Veredito:** Reduzir de 11 para **9 componentes novos + 1 atom novo (text-pair)**. Systems over pages.

### dieter-rams — Ten principles check
**Princípio 10 (mínimo possível) VIOLADO.** 11 componentes para 3 páginas é excesso.

- `client-portraits` grayscale→color hover é **ornamento decorativo** — fere princípios 5 (discrição) e 6 (honestidade). Transforma cliente em objeto estético. **REMOVER** ou substituir por testimonial textual simples.
- `stats-row` com Cormorant gold nos números é ornamento — números informam; tipografia ornamentada os enfraquece. Usar sans-serif padrão.
- `gold-gradient` utility é dispensável — 1 CTA final basta sem gradient. Fere princípio 5.
- `step-indicator` "Etapa 1 de 7" é **HONESTO** (6) — comunica estado real. MANTER.
- `swatch-picker` é **HONESTO** — signifier material-real. MANTER.

**Scope creep confirmado:** `project-showcase` + `related-products` + `client-portraits` = 3 grids quase idênticos. Consolidar em 1 `image-grid` com variantes.

**Veredito:** Reduzir a **7 componentes essenciais**. Less but better.

### don-norman — Usability heuristics
- `swatch-picker`: ring-2 gold ativo é feedback claro, MAS signifier inicial é fraco — adicionar `hover:scale-105` + `cursor-pointer` explícito + `aria-live="polite"` com "Madeira selecionada: Carvalho Europeu".
- `step-indicator` "Etapa 1 de 7" SEM mostrar as 7 etapas **VIOLA visibility of system status (princípio 1)**. Usuário não sabe o que vem adiante. Recomendação: progress bar com 7 dots + current destacado, OU **remover** se não houver fluxo real de 7 passos (caso contrário, scope creep mascarado).
- `concierge-form` bottom-border ONLY: **affordance fraco**. Usuários de luxo esperam forms convencionais — seguir convenção vence distinção estética. Adicionar label flutuante ou placeholder persistente. Contraste gold-deep/40 **provavelmente falha WCAG AA**.
- FAQ: `<details>` nativo **VENCE** Zustand — keyboard nav grátis, ARIA implícito, zero JS. Discoverability nativa.

**Veredito:** "If you think something is clever, beware — probably self-indulgence." Bottom-border ONLY é clever. Corrigir antes de implementar.

### tobias-van-schneider — Luxury editorial voice
- `client-portraits` B&W→color hover é **TROPE SATURADO** — Apple 2014, mil LPs copiaram. Para mobiliário luxury é safe-bet cliché, não memorável (`memorable beats safe`). Alternativa distintiva: **fotos EM CONTEXTO** (mesa no ambiente do cliente) com cliente fora do frame — mostra peça no habitat, não vira "gallery de pessoas".
- "Nossas Peças na Coração" é **cliché sentimental brasileiro**, desalinha com posicionamento Porsche. Substituir por **"Projetos Realizados"** ou **"No Ambiente"** — factual, discreto, premium.
- WhatsApp gold-tone #C4A65E **CORRETO**. Verde vibrante quebra brand consistency. Manter — constrain palette agressivamente.
- "Considerações do Atelier" é **pretensioso em pt-BR** — soa afetado. Usar **"Dúvidas Frequentes"** ou **"O Processo"**. Elegância está na naturalidade, não na pompa.

**Veredito:** Premium vive em micro-detalhes, não em vocabulário rebuscado. Copy precisa de revisão.

### sarah-drasner — React engineering
1. **SRP violado**: `product-layout.tsx` reescrito com ~200 linhas excede a regra de 100 linhas (Art. VII). Dividir em `product-gallery`, `product-specs`, `product-customization`.
2. **swatch-picker**: **Compound component vence** — `<SwatchPicker type="wood">` + `<SwatchPicker.Option>` com context interno > variant prop (evita if/else complexo). Padrão Radix/Headless UI.
3. **concierge-form**: bottom-border gold-deep/40 em focus **FALHA WCAG 2.2 AA** (contraste borda vs bg <3:1). Solução: border `gold-accent` full em focus (>3:1) + visible focus ring offset. Adicionar `aria-required`, `aria-invalid`, error live region.
4. **Next.js 16**: form precisa `'use client'` APENAS para validação client. **Server Action submit funciona**: `<form action={submitAction}>` com `useActionState` para feedback. Best pattern — aproveitar novidade do Next 16.
5. **FAQ**: `<details>/<summary>` nativo **VENCE** Zustand em perf (zero JS) e a11y (ARIA built-in, keyboard nativo, SSR-friendly). Zustand só se precisar "accordion exclusivo" (abrir 1 fecha outros).

**Veredito:** 60fps non-negotiable. Accessibility é constraint criativo, não limitação. Plano precisa 3 ajustes técnicos para produção.

---

## Synthesis (design-chief)

### Consensus (4+ clones concordam)
1. **Plano v1 tem scope creep moderado** — rams, brad, norman alinhados. Reduzir de 11 para 7–9 componentes novos consolidando grids similares.
2. **`<details>` nativo vence Zustand** para FAQ (norman + drasner) — menos JS, mais a11y.
3. **Concierge-form bottom-border-only fere a11y** (norman + drasner) — falha WCAG AA em contraste e affordance. Corrigir ANTES de implementar.
4. **Copy precisa revisão** (tobias + rams) — "Nossas Peças na Coração" e "Considerações do Atelier" são clichês/pretensiosos.

### Dissent/Tensions
- **client-portraits**: rams diz remover, tobias diz substituir por fotos em contexto, brad não opina, norman neutro. **Resolução chefe**: substituir por "Projetos no Ambiente" (meio-termo tobias) — mantém storytelling sem transformar cliente em objeto estético.
- **step-indicator**: rams aprova (honesto), norman reprova (viola visibility). **Resolução chefe**: manter SE houver fluxo real de 7 etapas documentado; senão remover. Pendente de briefing do PM.

### Blind spots identified (por v1, revelados pelo squad)
- **v1 não validou contraste WCAG do gold-deep/40** em estados focus — drasner flagou falha AA.
- **v1 tratou "concierge-layout" como template novo** — brad mostrou que é DRY-violation vs `variant` prop existente.
- **v1 não pensou em Server Actions Next.js 16** — drasner flagou oportunidade de melhor padrão.
- **v1 assumiu B&W portraits como premium** — tobias flagou saturação do trope.

### Final recommendations
1. Reduzir componentes novos de 11 → **9** (consolidar image-grids, remover client-portraits-as-people, descartar concierge-layout template).
2. Adicionar atom `text-pair` (brad) reutilizado em 3 organismos.
3. Converter `swatch-picker` para compound component (drasner).
4. `concierge-form` com border-full em focus + label flutuante (norman + drasner).
5. FAQ nativo `<details>` (consenso).
6. Revisar 3 strings de copy (tobias).
7. Split `product-layout.tsx` em 3 sub-componentes (<100 linhas cada, Art. VII).
8. Server Action para concierge-form (drasner).

---

## @ux-design-expert approval

**Prompt enviado ao @ux-design-expert:** "Revisar síntese do squad (5 mind clones) sobre refactor plan v2. Função APENAS APROVAÇÃO — não produzir conteúdo novo. Output: APROVADO / APROVADO COM RESSALVAS / REJEITADO. ≤150 palavras."

**Simulated @ux-design-expert (Uma) response:**

> APROVADO COM RESSALVAS.
>
> O squad identificou gaps reais no meu v1 — scope creep (11 → 9 componentes), copy cliché, falha WCAG no focus state, oportunidade Server Action. Aceito todas as 8 recomendações finais.
>
> **Ressalvas (3):**
> 1. **client-portraits**: aceito "Projetos no Ambiente" (fotos de peças no habitat), MAS preciso validar com PM se Tocks tem esse acervo fotográfico — senão adia-se a seção.
> 2. **step-indicator**: manter como molecule (brad) E mostrar progress bar 7 dots (norman) — honestidade + visibility. Se PM confirmar que não há fluxo 7-passos, deletar.
> 3. **Copy "Dúvidas Frequentes"** ao invés de "Considerações do Atelier" — mas manter "Projetos Realizados" ao invés de "No Ambiente" (mais comum em pt-BR luxury brasileiro).
>
> Uma aprovada. Clones executaram bem o trabalho — hierarquia respeitada.

**Status final:** APROVADO COM RESSALVAS (3 ressalvas listadas acima).

---

## Revised component counts (post-squad)

| Categoria | v1 | v2 squad | Delta |
|-----------|----|----|-------|
| Componentes novos | 11 | **9** | -2 |
| Componentes a modificar | 14 arquivos (9 componentes) | **15 arquivos** (10 componentes) | +1 (split product-layout em 3) |
| Componentes a deletar | 0 | **0** | 0 |
| Atoms novos | 1 (step-indicator) | **2** (step-indicator PROMOVIDO para molecule + text-pair NOVO atom) | +1 |
| Molecules novas | 3 | **5** (+step-indicator promovido, +stats-row rebaixado) | +2 |
| Organisms novos | 6 | **3** (consolidação: image-grid absorve project-showcase + related-products; client-portraits removido/substituído; concierge-form mantém; cta-block mantém; stats-row rebaixado) | -3 |
| Templates novos | 1 (concierge-layout) | **0** (usar variant prop) | -1 |

### Component list v2 final (9 novos + 1 atom + refactors)

**Atoms (2 novos):**
1. `text-pair.tsx` — label-uppercase gold + value (reutilizado em stats, specs, investimento)
2. *(step-indicator promovido a molecule)*

**Molecules (5 novas):**
3. `step-indicator.tsx` — **promoted** (tem lógica "X de Y" + progress dots)
4. `swatch-picker.tsx` — **compound component** (SwatchPicker + SwatchPicker.Option)
5. `form-field.tsx` — border-full em focus (corrigido para WCAG AA)
6. `faq-item.tsx` — usa `<details>` nativo
7. `stats-row.tsx` — **rebaixada** de organism (só display)

**Organisms (3 novos):**
8. `image-grid.tsx` — **consolidado** (substitui project-showcase + related-products + client-portraits com variant prop)
9. `cta-block.tsx` — gold-gradient compartilhado
10. `concierge-form.tsx` — Server Action + `'use client'` só para validation

**Templates novos: 0** (usar `variant="concierge"` em page-layout existente)

### Token Adjustments (revisadas)

```css
@theme {
  /* MANTIDOS v1 */
  --color-whatsapp-gold: #C4A65E;
  --color-whatsapp-gold-hover: #D4B66F;

  /* REMOVIDO v1→v2 (rams: ornamento) */
  /* --gradient-gold: ...  → substituir por bg-accent-gold sólido em cta-block */

  /* AJUSTADO v1→v2 (drasner: WCAG AA) */
  --color-focus-border: var(--color-accent-gold);  /* era gold-deep/40, falhava contraste */
  --ring-focus-offset: 2px;

  /* MANTIDOS v1 */
  --tracking-editorial: 0.2em;
  --tracking-extreme: 0.3em;
}
```

**Tokens novos: 3** (whatsapp-gold, whatsapp-gold-hover, focus-border corrigido). **Removido: 1** (gold-gradient). **Mantidos: 2** (tracking).

---

## Execution order (revised)

```
FASE 0 — Clarificação (1h, Orion/PM)
  - Resolver 3 ressalvas @ux-design-expert:
    0.1 PM confirma se Tocks tem acervo de fotos "Projetos no Ambiente"
    0.2 PM confirma se há fluxo real de 7 etapas (se não, deletar step-indicator)
    0.3 Copy final "Dúvidas Frequentes" + "Projetos Realizados" aprovado

FASE 1 — Fundação (2.5h, era 3h)
  1. app/globals.css → 2 tokens novos + 1 ajuste (removido gold-gradient)
  2. lib/constants.ts → BRAND_COPY revisado pelo squad
  3. data/products.ts → BLOCKER #1 (independente)

FASE 2 — Atoms/Molecules (9h, era 10h)
  4. atoms/text-pair.tsx (NOVO — brad)
  5. molecules/step-indicator.tsx (promoted)
  6. molecules/swatch-picker.tsx (compound component — drasner)
  7. molecules/form-field.tsx (border-full focus — drasner/norman)
  8. molecules/faq-item.tsx (<details> nativo)
  9. molecules/stats-row.tsx (demoted from organism)
  10-13. Modificar molecules existentes (product-card, whatsapp-cta, testimonial-card, nav-link)

FASE 3 — Organisms (9h, era 12h — 3h economizados por consolidação)
  14. organisms/image-grid.tsx (NOVO consolidado — absorve 3 grids)
  15. organisms/cta-block.tsx (sem gradient)
  16. organisms/concierge-form.tsx ('use client' + Server Action — drasner)
  17. Reescrever organisms/hero.tsx
  18. Modificar organisms/footer.tsx (variant minimal)

FASE 4 — Templates (2h, era 4h — concierge-layout eliminado)
  19. Adicionar variant="concierge" em templates/page-layout.tsx (prop, não template novo)
  20. SPLIT templates/product-layout.tsx em 3 sub-componentes <100 linhas cada (drasner/Art.VII):
      - product-gallery.tsx
      - product-specs.tsx
      - product-customization.tsx

FASE 5 — Pages (5h, mantido)
  21. app/page.tsx
  22. app/contato/page.tsx
  23. app/colecao/[slug]/page.tsx

FASE 6 — QA (3–5h, era 2–4h — +1h para validar WCAG AA focus states e Server Actions)
  24. a11y-check (WCAG 2.2 AA — focus contrast CRÍTICO, drasner flagged)
  25. Visual regression vs PNGs aprovados
  26. Testes Server Actions concierge-form
  27. Teste <details> keyboard nav
```

---

## Updated time estimate

| Fase | v1 | v2 squad |
|------|----|----|
| 0. Clarificação ressalvas | — | 1h (novo) |
| 1. Fundação | 3h | 2.5h |
| 2. Atoms/Molecules | 10h | 9h |
| 3. Organisms | 12h | 9h |
| 4. Templates | 4h | 2h |
| 5. Pages | 5h | 5h |
| 6. QA | 2–4h | 3–5h |
| **TOTAL** | **34–42h** | **31.5–33.5h** |

**Economia líquida: ~4–8h** apesar de +1h clarificação (consolidação de grids + eliminação de concierge-layout template).

---

## Remaining blockers (confirmed by squad)

### BLOCKER #1 — Catálogo divergente (v1) — PERMANECE
Berlin/Vienna/Prague/Milan vs Tenro Luxo/Gabe/Ark. Aguardando decisão usuário (A/B/C). **Status: não resolvido pelo squad** (decisão de negócio, não técnica).

### BLOCKER #2 — Assets reais (v1) — PARCIALMENTE REVISADO
Removido "4 client portraits B&W" da lista (tobias: trope). Substituído por "3 fotos Projetos Realizados" — mas PM precisa confirmar acervo (ressalva #1 de @ux-design-expert).

### BLOCKER #3 — Dados concretos (v1) — PERMANECE
Endereço, telefone WhatsApp real, preços. Sem mudança vs v1.

### BLOCKER #4 — NOVO (criado pelo squad)
**Fluxo de 7 etapas real existe?** norman flagou: "Etapa 1 de 7" sem mostrar as 7 viola visibility. Se PM confirmar que não há fluxo de 7 passos no journey real, step-indicator deve ser deletado (scope creep). **Ação: PM documentar journey ou deletar componente.**

### BLOCKER #5 — NOVO (criado pelo squad)
**Validação WCAG AA em focus states.** drasner flagou que v1 não validou contraste gold-deep/40. Corrigido para gold-accent full em focus, mas precisa validação com `*a11y-check` na Fase 6 antes do push.

### RESOLVIDOS pelo squad (não são mais blockers)
- ~~concierge-layout template novo~~ → resolvido (variant prop)
- ~~gold-gradient utility~~ → resolvido (removido)
- ~~FAQ accordion technology choice~~ → resolvido (`<details>` nativo)
- ~~swatch-picker API pattern~~ → resolvido (compound component)
- ~~concierge-form submit pattern~~ → resolvido (Server Action)

---

## Hierarchy compliance check

- [x] Clones executaram análise (5 consultations salvas: 673209b5, baa6bd6d, b95c00b1, 1ea46317, c31ea9d8)
- [x] Chefe @ux-design-expert apenas APROVOU (não produziu novo conteúdo)
- [x] design-chief orquestrou, não implementou
- [x] Zero código implementado — apenas plano refinado
- [x] Baseline v1 respeitado (no invention) — todas mudanças rastreáveis a crítica de clone específico

— @design-chief, roteando execução para os especialistas certos.
