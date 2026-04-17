# Refactor Plan — V2 Variants → Implementation
Generated: 2026-04-16 by @ux-design-expert (Uma — aios-ux)
Source of truth: `docs/design/approved-variants/{home,produto-berlin,contato}.html + .png`

---

## Executive Summary

As três variantes aprovadas ("V2 Editorial" HOME, "V2 Process" PRODUTO BERLIN, "V2 Concierge" CONTATO) elevam o patamar editorial do site atual: hero left-aligned com CTAs empilhados, wood swatches circulares, seção "Nossas Peças na Coração" (retratos B&W), e form Concierge em surface card com gold-deep bottom borders. O codebase Next.js 16 tem 20 componentes sólidos mas o naming do catálogo diverge fundamentalmente (Tenro Luxo/Gabe/Ark vs Berlin/Vienna/Prague/Milan/London) — BLOCKER crítico. Estimativa: **6 novos componentes, 9 a modificar, 0 a deletar**, **34–42h total**. Tokens existentes cobrem 90%; faltam 3 semanticos (gold-tone WhatsApp, swatch states, stepper).

---

## Current State Inventory

### Componentes existentes (20)

**Atoms (6):** `button.tsx` · `heading.tsx` · `text.tsx` · `badge.tsx` · `logo.tsx` · `image-placeholder.tsx`

**Molecules (4):** `product-card.tsx` · `testimonial-card.tsx` · `nav-link.tsx` · `whatsapp-cta.tsx` (fab+inline)

**Organisms (5):** `header.tsx` · `footer.tsx` · `hero.tsx` · `product-grid.tsx` · `testimonial-carousel.tsx`

**Templates (3):** `page-layout.tsx` · `product-layout.tsx` · `blog-layout.tsx`

**Provider + libs:** `lenis-provider.tsx` · `fonts.ts` · `animations.ts` · `constants.ts` · `ui-store.ts` (zustand) · `products.ts` · `testimonials.ts`

### Páginas existentes (8)

`/` · `/colecao` · `/colecao/[slug]` · `/atelier` · `/projetos` · `/contato` · `/blog` · `/blog/[slug]`

### Design docs existentes (6)

`01-design-tokens.md` · `02-component-specs.md` · `03-page-wireframes.md` · `04-interaction-specs.md` · `05-responsive-specs.md` · `06-stitch-project.md`

---

## Diff per Page

### 1. HOME — `src/app/page.tsx` + `src/components/organisms/hero.tsx`

| Seção/Componente | Estado atual (existe? path?) | Mudança necessária | Gravidade | Esforço |
|------------------|------------------------------|--------------------|-----------|---------|
| Hero layout | `organisms/hero.tsx` — **centered + headline "Cada mesa, uma obra..."** | Reescrever para **left-aligned**, headline "Mesas de Bilhar Sob Medida", CTAs **empilhados** (primary "Agende uma visita ao Atelier" gold + ghost "Ver a Coleção" com gold-deep border). Pre-label "Desde 2008 · Itajaí, SC" removido | critical | M (3h) |
| Hero background | Padrão radial estático | Adicionar suporte a `<img>` cover com overlay `rgba(11,11,15,0.5)` + scroll hint material-symbols | high | S (1h) |
| Copy `BRAND_COPY.hero` | `constants.ts` — headline/subtitle genéricos | Atualizar: headline="Mesas de Bilhar Sob Medida", subtitle="Cada peça é uma expressão de arte singular…", cta="Agende uma visita ao Atelier" | high | XS (15min) |
| "Peças que transformam ambientes" (4-card grid) | `<ProductGrid columns=3>` em `page.tsx` → `product-card.tsx` mostra **apenas 3** produtos + price+tagline | (a) Mudar homepage para **4 cards featured**; (b) `ProductCard` ganha variante `variant="editorial"` com chevron gold top-right (hover reveal), border-transparent→gold-deep hover, botão "CONHECER" gold-outline no rodapé, sem tagline, sem Badge "Nova" (editorial limpo) | critical | M (3h) |
| "Tradição Naval / Arte em Madeira" | Seção existe (`page.tsx` linhas 36-54) como 2-col image+copy+CTA | **Reestruturar**: image à esquerda (grayscale → color on hover, `transition-1000`), lista numerada **01/02/03** (Consulta/Design/Seleção) em place do texto genérico, CTA "CONHEÇA O ATELIER" como link underline gold (não botão) | high | M (3h) |
| Stats row (200+ mesas, 6 modelos…) | **Não existe** | **Criar** novo `organisms/stats-row.tsx` + data em `src/data/stats.ts` — 4 métricas com Cormorant gold | med | S (1h) |
| "Ambientes transformados" (3 project cards) | `page.tsx` linhas 57-89 — hardcoded `[1,2,3].map` com labels inline | Extrair para `organisms/project-showcase.tsx` + data `src/data/projects.ts`; cada card: aspect 4/5, overlay hover com nome+cidade, legenda italic "— Nome, Cidade" | high | M (3h) |
| Testimonials | `organisms/testimonial-carousel.tsx` + `molecule/testimonial-card.tsx` existem | Ajuste visual em `testimonial-card`: padding 10 (não 8), border gold-deep/20, middle card com border gold/40+shadow-xl (destaque), estrelas como material-symbols (não `★` unicode) | med | S (1h) |
| Final CTA gold-gradient block | Seção centered de texto simples | Adicionar utility `.gold-gradient` (tokens.css) + reescrever seção como card com `bg: linear-gradient(135deg, #D4AF37 0%, #8A6F3A 100%)`, h2 sobre bg gold, CTA "FALE COM NOSSO ATELIER" bg-background text-gold | high | S (1.5h) |
| Header hover state | `organisms/header.tsx` OK estruturalmente | Font nav: migrar `NavLink` de `font-body` para `font-headline` uppercase tracking-widest (editorial) | low | XS (20min) |

**Sub-total HOME: ~14h**

---

### 2. PRODUTO BERLIN — `src/app/colecao/[slug]/page.tsx` + `src/components/templates/product-layout.tsx`

| Seção/Componente | Estado atual | Mudança necessária | Gravidade | Esforço |
|------------------|--------------|--------------------|-----------|---------|
| **Catálogo de produtos** | `data/products.ts` com 8 produtos (Tenro Luxo, Gabe, Ark, Vertice, Curve, Elipse, Nobus, Rustic) | **BLOCKER DE DADOS:** Variantes usam Berlin, Vienna, Prague, Milan, London. Decisão usuário necessária: (A) renomear catálogo, (B) manter nomes atuais e adaptar HTML, (C) mix. Recomendação Uma: **renomear** — nomes de capitais reforçam arco "elegância europeia" + herança naval | critical | L (1 dia) |
| Breadcrumb | `product-layout.tsx` — "Início / Coleção / Berlin" com `/` plain | Atualizar para "Coleção / Mesas de Bilhar / Mesa Berlin", separador `/` em gold-deep text-lg, hover gold | low | XS (20min) |
| Product hero (image + info) | Grid 2-col OK (images à esquerda, info à direita) | Mudar aspect ratio gallery para `[55%_45%]`; adicionar 3 thumbnails 16×16 clicáveis com border gold em ativo (opacity 0.6 hover 1.0 nos inativos) | high | M (2h) |
| Badge "SOB MEDIDA" | Badge variant gold existe | Reutilizar `Badge variant="gold"` com texto "SOB MEDIDA" em ivory bg — **novo variant `ivory`** no Badge | med | S (45min) |
| Tagline + description | OK | **Remover** `<Badge>Nova</Badge>` inline (não existe nas variantes); adicionar row de **trust icons** (Processo Atelier + Selo de Qualidade) com `material-symbols-outlined` | med | S (1h) |
| Specs table | Card surface com `<dl>` | Reescrever como **centered table** full-width bg-surface py-20 border-y primary-deep/20, grid-cols-2 rows, dt=label gold bold uppercase, dd=text-primary. Nome da seção "Especificações da Peça" | high | M (2h) |
| **Personalização — wood swatches** | `<Badge variant="subtle">` com strings tipo "Cor da madeira" | **CRIAR** `molecules/swatch-picker.tsx` (reutilizável): circular swatches 56×56 (wood) ou 32×32 (felt), border ativo gold ring-2 + ring-offset, label uppercase Montserrat 9px centered. 3 grupos: madeira (4 opções), feltro Simonis 860 (12 cores), dimensões (3 tamanhos buttons). Requer novo schema em `products.ts` | critical | L (1 dia) |
| Stepper "Etapa 1 de 7" | Não existe | **CRIAR** `atoms/step-indicator.tsx` — pill rounded-full border primary/30 text primary uppercase | med | XS (30min) |
| Preço + CTAs | `<Button>Solicitar orcamento</Button>` full-width | Reestruturar: seção separada centered, label "Investimento Estimado" uppercase + preço "A partir de R$ 18.900" em Cormorant 5xl gold, 2 CTAs side-by-side ("SOLICITAR ORÇAMENTO" primary + "WHATSAPP ATELIER" ghost gold com ícone chat) | high | M (2h) |
| **"Nossas Peças na Coração"** (retratos B&W) | **NÃO EXISTE** | **CRIAR** `organisms/client-portraits.tsx` — grid 4-col, aspect 1/1, grayscale com scale hover color transition 700ms. Na variante Berlin o header é "Processo Atelier: A Anatomia da Peça" mas no briefing é "Nossas Peças na Coração" (storytelling clientes). Clarificar com PM | critical | M (3h) |
| "Outras Peças da Coleção" (3 cards) | Não existe no ProductLayout | **CRIAR** `organisms/related-products.tsx` — usa `ProductCard variant="editorial"` (reutiliza), border-l-2 gold no h3, 3 produtos excluindo o atual | high | S (1h) |
| Final CTA "Inicie seu projeto" | Não existe | Reutilizar componente final CTA criado para HOME (gold-gradient) — promover a `organisms/cta-block.tsx` compartilhado | med | S (1h) |

**Sub-total PRODUTO: ~16h**

---

### 3. CONTATO — `src/app/contato/page.tsx`

| Seção/Componente | Estado atual | Mudança necessária | Gravidade | Esforço |
|------------------|--------------|--------------------|-----------|---------|
| Page layout | `<PageLayout>` com `title={BRAND_COPY.contact.headline}` + grid 2-col | Mudar para **single-column max-w-[720px] centered** (mais editorial/concierge). Manter `<PageLayout>` mas com `variant="concierge"` (nova prop) ou criar `templates/concierge-layout.tsx` | high | S (1h) |
| Copy headline | "Vamos criar sua mesa" / "Cada projeto começa…" | Mudar para "Comece sua Criação" / "Uma conversa sob medida com nosso Atelier" em `BRAND_COPY.contact` | high | XS (10min) |
| WhatsApp CTA | Card surface com `<Button size=lg>Abrir WhatsApp</Button>` | Reestruturar: **ghost gold-outline** full-width (não card, não botão primary), icon SVG WhatsApp à esquerda, label "Conversar via WhatsApp" uppercase tracking-[0.3em] | critical | S (1h) |
| **Form** | **NÃO EXISTE** na página atual (só info + FAQ) | **CRIAR** `organisms/concierge-form.tsx` — surface card p-16 border gold-deep/10 shadow-2xl. 4 campos (Nome, Email, Telefone opcional, Mensagem textarea) com `molecules/form-field.tsx` novo: label gold-deep uppercase 10px, input transparent com border-b gold-deep/40, focus border gold-accent, sem padding-x. Submit ghost gold full-width com hover fill animation | critical | L (6h) |
| Info de contato | 3 cards separados: Email, Endereço, Horário | Reduzir para **2 linhas editorial centered**: "Atelier: Rua {ENDERECO} • Itajaí, SC" + "E-mail: contato@tockscustom.com.br" (link gold hover white). **Remover horário e telefone** (tom concierge = sem exposição) | high | XS (30min) |
| Map placeholder | Existe placeholder aspect 16/9 | **Remover** (não consta nas variantes) | low | XS (5min) |
| FAQ | 5 itens como `<div>` com `border-b` plain | Renomear h3 para "Considerações do Atelier" · reescrever as 5 perguntas (Processo de Criação, Prazos de Execução, Garantia e Autenticidade, Entrega e Montagem, Investimento e Valores) · accordion real com `<details>` ou Zustand state + animated height · separadores gold-deep/30 top+bottom de cada item | high | M (3h) |
| FAQ item (novo atom/molecule) | Atualmente inline `<span><Text>` | Extrair para `molecules/faq-item.tsx` — props `{question, answer, isOpen?, onToggle?}`; reutilizar em outras páginas (Atelier, Produto) | med | S (1h) |
| Footer na page contato | Usa `organisms/footer.tsx` global | O variant Concierge tem footer **minimalista centered** (só logo cursiva + 3 links + copyright). **Criar** prop `variant="editorial"|"minimal"` em Footer, aplicar `minimal` apenas em /contato | med | S (1h) |

**Sub-total CONTATO: ~12h**

---

## Consolidated Refactor Plan

### New Components to Create (6)

| # | Componente | Tipo | Path | Razão |
|---|------------|------|------|-------|
| 1 | `step-indicator.tsx` | atom | `src/components/atoms/` | Pill "Etapa X de 7" reutilizável (produto wizard futuro) |
| 2 | `swatch-picker.tsx` | molecule | `src/components/molecules/` | Wood/felt swatches circulares com estados ring active. 3 variantes: `wood` (lg+label), `felt` (sm+title), `size` (button) |
| 3 | `form-field.tsx` | molecule | `src/components/molecules/` | Campo editorial concierge (label+input+helper+error) com bottom-border gold |
| 4 | `faq-item.tsx` | molecule | `src/components/molecules/` | Item accordion "Considerações do Atelier" — reutilizável em 3+ páginas |
| 5 | `stats-row.tsx` | organism | `src/components/organisms/` | 4 métricas numéricas (200+ mesas, 6 modelos…) bg-surface border-y |
| 6 | `project-showcase.tsx` | organism | `src/components/organisms/` | 3-card grid "Ambientes transformados" com overlay hover nome/cidade |
| 7 | `client-portraits.tsx` | organism | `src/components/organisms/` | "Nossas Peças na Coração" grayscale→color, 4 retratos B&W clientes |
| 8 | `related-products.tsx` | organism | `src/components/organisms/` | "Outras Peças da Coleção" (3-card) — reusa ProductCard editorial |
| 9 | `cta-block.tsx` | organism | `src/components/organisms/` | Bloco gold-gradient compartilhado HOME + PRODUTO (final CTA) |
| 10 | `concierge-form.tsx` | organism | `src/components/organisms/` | Form contato — encapsula FormFields + submit animado |
| 11 | `concierge-layout.tsx` | template | `src/components/templates/` | Layout single-column max-w-720px centered (contato) |

> Nota: contei 11 acima. **6 obrigatórios para as 3 páginas** = swatch-picker, form-field, faq-item, stats-row, project-showcase, concierge-form. Os outros 5 são refactors de código já existente extraído para componente (low risk, high DRY).

### Components to Modify (9)

| # | Path | Mudança | Linhas aprox |
|---|------|---------|-------------|
| 1 | `organisms/hero.tsx` | Reescrita completa: centered→left-aligned, CTAs empilhados, suporte image bg, scroll hint | ~70 linhas |
| 2 | `molecules/product-card.tsx` | Add prop `variant: 'detail' \| 'editorial'` — editorial remove tagline, adiciona chevron gold hover, botão "CONHECER" | +30 linhas |
| 3 | `molecules/whatsapp-cta.tsx` | Dessaturar fab: trocar `bg-[var(--accent-gold)]` por nova token `--color-whatsapp-gold` (gold-tone dessaturado ~#C4A65E). Fab usa esse token, NÃO o vibrante #25D366 | ~5 linhas |
| 4 | `molecules/nav-link.tsx` + `organisms/header.tsx` | Font nav: migrar para Cormorant uppercase tracking-widest | ~10 linhas |
| 5 | `molecules/testimonial-card.tsx` | Padding 10, border gold-deep/20, estrelas material-symbols, variant `featured` (middle card com border gold/40) | +20 linhas |
| 6 | `templates/product-layout.tsx` | Reescrita grande: gallery 55/45, specs centered full-width, swatch-picker integrado, investimento block com 2 CTAs, sections related-products + cta-block | ~200 linhas |
| 7 | `templates/page-layout.tsx` | Add prop `variant: 'default' \| 'concierge'` (concierge=max-w-720, mb-20 header centered, sem gold-separator fixo) | +15 linhas |
| 8 | `organisms/footer.tsx` | Add prop `variant: 'editorial' \| 'minimal'` — minimal usa só logo italic + 3 links + copyright centered | +30 linhas |
| 9 | `app/page.tsx` | Substituir 6 seções inline por organisms novos (hero, stats-row, project-showcase, cta-block) | -40 linhas / +15 |
| 10 | `app/contato/page.tsx` | Reescrita: concierge-layout wrapper, remover 3 info-cards/map, adicionar concierge-form, FAQ com faq-item | ~80 linhas |
| 11 | `app/colecao/[slug]/page.tsx` | Quase intacta — apenas adaptar ao novo ProductLayout e garantir que `params.slug` funciona com nomes novos (Berlin, Vienna…) | ~5 linhas |
| 12 | `data/products.ts` | **BLOCKER dependente**: renomear ou expandir catálogo (ver Blockers #1). Adicionar schema para swatches: `woodOptions`, `feltOptions`, `sizeOptions`, `processSteps` | dependente |
| 13 | `lib/constants.ts` | Atualizar `BRAND_COPY.hero`, `BRAND_COPY.contact`, adicionar `BRAND_COPY.atelier.steps[]` (01/02/03) | ~20 linhas |
| 14 | `app/globals.css` (tokens) | Ver "Token Adjustments" abaixo | ~15 linhas |

> Contagem final: **14 arquivos modificados**, dos quais **9 são componentes**. (data/products.ts, constants.ts, globals.css, e as 2 pages não contam como "componente" na métrica do briefing mas são arquivos alterados.)

### Components to Delete (0)

Nenhum componente existente fica obsoleto. Todo o sistema atual é reaproveitado — as variantes são **refinamentos editoriais** do mesmo atomic model, não ruptura.

### Token Adjustments (3 novos + 2 ajustes)

Adicionar em `app/globals.css`:

```css
@theme {
  /* NEW: WhatsApp gold-tone dessaturado (ordem Uma do squad) */
  --color-whatsapp-gold: #C4A65E;        /* #25D366 verde → gold-tone */
  --color-whatsapp-gold-hover: #D4B66F;

  /* NEW: Swatch picker states */
  --ring-swatch-active: 2px solid var(--color-accent-gold);
  --ring-swatch-offset: 2px;
  --ring-swatch-offset-color: var(--color-bg-primary);

  /* NEW: Gold gradient utility (CTA final blocks) */
  --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #8A6F3A 100%);

  /* ADJUST: tracking-widest usado em nav editorial */
  --tracking-editorial: 0.2em;  /* usado em CTAs grandes e nav */
  --tracking-extreme: 0.3em;    /* usado em labels WhatsApp/form */
}

.gold-gradient { background: var(--gradient-gold); }
.swatch-active { box-shadow: 0 0 0 var(--ring-swatch-offset) var(--ring-swatch-offset-color), 0 0 0 calc(var(--ring-swatch-offset) + 2px) var(--color-accent-gold); }
```

### Execution Order (respeita dependências)

```
FASE 1 — Fundação (3h)
  1. app/globals.css → adicionar 3 tokens novos
  2. lib/constants.ts → atualizar BRAND_COPY + criar stats/projects data
  3. data/products.ts → decisão usuário + expansão schema swatches (BLOCKER #1)

FASE 2 — Atoms/Molecules (10h)
  4. atoms/step-indicator.tsx
  5. molecules/swatch-picker.tsx
  6. molecules/form-field.tsx
  7. molecules/faq-item.tsx
  8. Modificar molecules/product-card.tsx (variant editorial)
  9. Modificar molecules/whatsapp-cta.tsx (gold-tone)
  10. Modificar molecules/testimonial-card.tsx (featured variant)
  11. Modificar molecules/nav-link.tsx (Cormorant uppercase)

FASE 3 — Organisms (12h)
  12. organisms/stats-row.tsx
  13. organisms/project-showcase.tsx
  14. organisms/client-portraits.tsx
  15. organisms/related-products.tsx
  16. organisms/cta-block.tsx
  17. organisms/concierge-form.tsx
  18. Reescrever organisms/hero.tsx (left-aligned + image bg)
  19. Modificar organisms/footer.tsx (variant minimal)

FASE 4 — Templates (4h)
  20. templates/concierge-layout.tsx (ou prop variant em page-layout)
  21. Reescrever templates/product-layout.tsx

FASE 5 — Pages (5h)
  22. app/page.tsx → substituir 6 seções inline por organisms
  23. app/contato/page.tsx → reescrita concierge
  24. app/colecao/[slug]/page.tsx → validação smoke

FASE 6 — QA (2–4h)
  25. *a11y-check (WCAG AA em form, swatches, hover states)
  26. Visual regression vs PNGs aprovados
  27. Testes manuais mobile breakpoints
```

### Time Estimate

| Fase | Horas |
|------|-------|
| 1. Fundação (tokens, data, copy) | 3h (+ BLOCKER data: 4–8h) |
| 2. Atoms/Molecules | 10h |
| 3. Organisms | 12h |
| 4. Templates | 4h |
| 5. Pages | 5h |
| 6. QA | 2–4h |
| **TOTAL** | **34–42h** (4,5–5,5 dias dev) |

---

## Blockers & Open Questions

### BLOCKER #1 — Catálogo de produtos divergente (CRÍTICO)

Variantes aprovadas mostram **Berlin, Vienna, Prague, Milan, London** como nomes das mesas. `data/products.ts` tem **Tenro Luxo, Gabe, Ark, Vertice, Curve, Elipse, Nobus, Rustic**.

**Decisão necessária:**
- (A) Renomear catálogo para capitais europeias (reforça arco "elegância europeia/herança naval") — **recomendação Uma**
- (B) Manter nomes atuais, adaptar HTML aprovado com esses nomes
- (C) Mix: manter Tenro Luxo, Gabe, Ark e adicionar Berlin, Vienna, Milan como novas linhas premium

**Custo:** (A) ~4h (renomear+slugs+rotas/redirects+copy), (B) 1h (só adaptar HTML), (C) ~8h (extensão catálogo + strategy narrativa).

### BLOCKER #2 — Assets reais ausentes

As variantes usam URLs `lh3.googleusercontent.com/aida-public/...` (Google Stitch outputs temporários). Para produção precisamos:

| Asset | Qt | Fonte sugerida |
|-------|----|--------------  |
| Hero bg cinematic (mesa dark+gold) | 1 | Nano Banana 2 OU foto profissional atelier |
| 4 cards collection (Berlin/Vienna/Prague/Milan) | 4 | Foto profissional das mesas reais (produção) |
| Craftsman image (atelier tradição naval) | 1 | Foto documental Itajaí atelier |
| 3 project showcase (Residência Laguna, Corporate Club, Yacht) | 3 | Foto casos reais (com autorização cliente) |
| 4 client portraits B&W | 4 | Foto cliente real (storytelling) — **LGPD: precisa consentimento** |
| 3 thumbnails detalhe produto (macro madeira, ardósia, acabamento) | 3 | Macro fotos profissionais |
| 4 process atelier (scale hover) | 4 | Fotos documentais produção |

**Nano Banana 2 candidato para:** hero bg, scale atelier overall. **Foto profissional obrigatória para:** produtos reais, clientes, atelier interior.

### BLOCKER #3 — Dados concretos ausentes

1. **Endereço real Itajaí** — variante mostra `Rua {ENDERECO}` placeholder
2. **Telefone real WhatsApp** — `constants.ts` tem `5547999999999` placeholder
3. **Nomes dos clientes B&W** para "Nossas Peças na Coração" (consentimento LGPD)
4. **Opções reais de madeira** — variante mostra Carvalho Europeu, Nogueira Americana, Freijó, Ébano. Confirmar com atelier
5. **Preços reais** — variante mostra Berlin R$18.900, Vienna R$22.400, Prague R$25.600, Milan R$31.200

### Next.js 16 breaking changes relevantes

Ao implementar (fase @dev), verificar:
- **Server Components por default** — `concierge-form.tsx` PRECISA `'use client'` (usa state)
- **`use cache` directive** nova — avaliar se páginas estáticas (colecao, atelier) podem usar
- **`params` Promise** — já aplicado em `colecao/[slug]/page.tsx` OK
- **Form Actions** — concierge-form pode usar Server Actions nativas em vez de onSubmit client
- **Leitura obrigatória antes de codar:** `node_modules/next/dist/docs/` (AGENTS.md orienta)

### Perguntas bloqueadoras para o usuário (Brendo)

1. **Naming catálogo:** A, B ou C do BLOCKER #1? (Uma recomenda A — coerência narrativa)
2. **Client portraits:** usamos clientes reais com autorização (LGPD) ou imagens genéricas estilo B&W?
3. **Endereço físico Itajaí** do atelier — exibir ou manter só cidade/estado?
4. **Telefone WhatsApp real** — atualizar constants.ts agora?
5. **Wood swatches:** confirmar as 4 opções (Carvalho Europeu, Nogueira, Freijó, Ébano) batem com oferta real do atelier?

---

## Next Action for Orion

**Sequência recomendada (não implementar código agora):**

1. **Orion responde as 5 perguntas bloqueadoras** (ou delega ao cliente Tocks)
2. **@pm cria story** `S-7.1-refactor-v2-variants-fundacao` cobrindo Fase 1+2 (tokens/atoms/molecules)
3. **@pm cria story** `S-7.2-refactor-v2-variants-organisms-pages` cobrindo Fases 3–5
4. **@ui-designer (Nano Banana 2)** gera hero bg + 4 card mesas (mockup) enquanto fotografia profissional é agendada
5. **@dev Dex** implementa seguindo Execution Order acima (respeitar dependências bottom-up)
6. **@qa** roda `*a11y-check` na Fase 6 antes do @devops push

**Critério de sucesso verificável:**
- Visual regression: screenshot `/`, `/colecao/berlin`, `/contato` vs PNGs aprovados (≤5% diff pixels)
- `npm run lint && npm run typecheck && npm test` → 0 errors
- Lighthouse a11y ≥95, performance ≥85 (Next.js 16 + next/image)
- WCAG AA contraste validado (todos golds sobre surface estão OK por `01-design-tokens.md`)

— Uma, desenhando com empatia
