# Workflow: Landing Page

> Pattern Library → Copy → Design → Build → QA → Deploy

---

## When to Use

- User runs `/forge lp "descrição da LP"` or `/forge landing-page "..."`
- User wants a premium landing page (10/10 quality)
- Quest delegates an lp-agency pack mission to Forge
- Scope: 1 landing page, multi-section, production-ready

---

## Pipeline

```
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5
Discovery   Strategy   Copy      Build      QA+Polish  Deploy
```

ALL 6 phases execute. Phase 1 replaces standard Spec with LP Strategy.

---

## Key Asset

**Pattern Library:** `design-system/patterns/` — 34 sites premium extraídos (Stripe, Linear, Vercel, Figma, Webflow, etc.). INDEX em `design-system/patterns/INDEX.md` com insights de cores, tipografia e categorias de uso por tipo de LP.

---

## Execution

### Phase 0: Discovery

Read `{FORGE_HOME}/phases/phase-0-discovery.md` with LANDING_PAGE adjustments:

**Socratic Gate — 5 perguntas (formato opções numeradas):**

1. **Tipo de LP** — O que essa página vende?
   - `1. SaaS / App` | `2. Curso / Infoproduto` | `3. Serviço / Agência` | `4. E-commerce / Produto físico` | `5. Evento / Lançamento` | `6. Outro`

2. **Referências visuais** — Qual vibe visual?
   - `1. Dark premium (Linear, Webflow, GMX)` | `2. Light corporativo (Stripe, Figma)` | `3. Warm elegante (Anthropic, Pulso Hotel)` | `4. Agência criativa (Locomotive, Obys)` | `5. Tipografia como hero (Unseen, Reino)` | `6. Mandar referência`

3. **Público** — Quem vai ver essa LP?
   - `1. Dev / Tech` | `2. Empresário / C-level` | `3. Público geral` | `4. Criativo / Designer` | `5. Outro (descrever)`

4. **Copy base** — Já tem texto ou precisa criar?
   - `1. Tenho copy pronta` | `2. Tenho rascunho / bullets` | `3. Criar do zero (copywriting squad)`

5. **Stack e deploy** — Onde vai rodar?
   - `1. HTML/CSS puro (single file)` | `2. Next.js + Tailwind` | `3. Replit (gerar prompt)` | `4. Outro`

**Ecosystem scan:** Check pattern library, existing design-system/, copy squad availability.

**CHECKPOINT:** Confirmar escopo + referências visuais + stack.

### Phase 1: LP Strategy

**Agents:** @analyst, @ux-design-expert

Esta fase substitui o Spec Pipeline padrão. Em vez de PRD + Arquitetura, criamos a estratégia visual + estrutural da LP.

1. **@analyst** — Pesquisa rápida: competidores, padrões do nicho, benchmark de conversão
2. **@ux-design-expert** — Consultar pattern library (`design-system/patterns/INDEX.md`):
   - Selecionar 3-5 sites de referência baseado no tipo + vibe escolhidos
   - Ler `tokens.yaml` e `components.json` de cada referência
   - Extrair palette, tipografia, layout patterns
3. **@ux-design-expert** — Definir estrutura de seções:
   - Hero (tipo + layout baseado em patterns)
   - Social proof (logos, testimonials, números)
   - Features/benefícios (grid, cards, alternating)
   - CTA sections (posicionamento, estilo do botão)
   - FAQ / Objeções
   - Footer

**Output:** `lp-strategy.md` com:
- Referências selecionadas e por quê
- Palette definida (3-5 cores com hex)
- Font stack (heading + body + accent)
- Mapa de seções com layout de cada uma
- Wireframe textual (o que vai em cada seção)

**CHECKPOINT:** Mostrar estratégia ao usuário. "Essa é a estrutura. Ajustar algo?"

### Phase 2: Copy

**Agents:** /copywriting-squad (Copy Chief) ou @dev (se copy fornecida)

1. **Se copy fornecida (opção 1):** @dev apenas formata e organiza por seção
2. **Se rascunho (opção 2):** /copywriting-squad refina e expande
3. **Se do zero (opção 3):** /copywriting-squad cria copy completa:
   - Headline principal (3 variações → user escolhe)
   - Subheadline
   - Feature bullets
   - Social proof copy
   - CTA text (primário + secundário)
   - FAQ (5-8 perguntas)

**Output:** `lp-copy.md` com todo o texto organizado por seção.

**CHECKPOINT:** "Copy pronta. Revisar antes de montar?"

### Phase 3: Build

**Agents:** @dev, @ux-design-expert

1. **@dev** — Scaffold do projeto baseado na stack escolhida:
   - HTML puro: single `index.html` + `styles.css`
   - Next.js: `/app/page.tsx` + componentes
2. **@dev** — Implementar tokens visuais da strategy:
   - CSS custom properties (cores, fonts, spacing)
   - Tailwind config (se Next.js)
3. **@dev** — Montar seção por seção seguindo o mapa:
   - Hero section (com pattern da referência)
   - Cada seção seguinte
   - Responsivo mobile-first (390px, 768px, 1440px)
4. **@dev** — Implementar efeitos premium:
   - Scroll animations (fade-in, slide-up)
   - Hover states nos CTAs e cards
   - Gradientes e sombras conforme referências
5. **@ux-design-expert** — Review visual: contraste, hierarquia, espaçamento

**Regras de qualidade visual (NON-NEGOTIABLE):**
- Espaçamento generoso — nunca "apertado" (min 80px entre seções)
- Tipografia com hierarquia clara (hero > h2 > body com saltos proporcionais)
- Cores fiéis às referências — nunca genéricas (#007bff é proibido)
- Max-width em texto: 65ch para body, 20ch para headlines
- Imagens: usar placeholders com aspect ratio correto (não quadrados genéricos)

**Output:** LP funcional, responsiva, com todos os efeitos.

**Auto-checkpoint:** Se `npm run build` falhar → fix antes de prosseguir.

### Phase 4: QA + Polish

**Agents:** @qa, @ux-design-expert

1. **@qa** — Playwright screenshots em 3 breakpoints (390px, 768px, 1440px)
2. **@qa** — Lighthouse audit (performance, accessibility, SEO, best practices)
3. **@ux-design-expert** — Visual review das screenshots:
   - Espaçamento consistente?
   - Cores fiéis à palette definida?
   - CTAs visualmente destacados?
   - Mobile funciona bem?
4. **@dev** — Corrigir issues encontrados
5. **@qa** — Acessibilidade: alt texts, aria-labels, focus-visible, contraste WCAG AA
6. Optional: comparar screenshots com sites de referência (visual diff)

**Quality gate:**
- Lighthouse Performance > 90
- Lighthouse Accessibility > 90
- Responsivo sem quebras em 3 breakpoints
- Todas as seções do mapa implementadas
- CTAs funcionais e visualmente destacados

**CHECKPOINT:** Mostrar screenshots + Lighthouse scores. "LP pronta para deploy?"

### Phase 5: Deploy

Read `{FORGE_HOME}/phases/phase-5-deploy.md`:
1. **@dev** — Production build
2. CHECKPOINT: confirmar push
3. **@devops** — Commit + push + PR
4. Optional: deploy preview (Vercel/Netlify)
5. Completion banner

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0 - Discovery | (Forge core) | — |
| 1 - Strategy | @ux-design-expert | @analyst |
| 2 - Copy | /copywriting-squad | @dev |
| 3 - Build | @dev | @ux-design-expert |
| 4 - QA + Polish | @qa | @ux-design-expert, @dev |
| 5 - Deploy | @devops | @qa, @dev |

---

## Progress Display

```
  ✅ Discovery  ->  🔄 Strategy  ->  ○ Copy  ->  ○ Build  ->  ○ QA  ->  ○ Deploy
```

---

## Pattern Library Quick Reference

Seleção rápida baseada no tipo de LP (detalhes completos em `design-system/patterns/INDEX.md`):

| Tipo de LP | Referências recomendadas |
|------------|--------------------------|
| Dark premium | Linear, Vercel, Webflow, makemepulse, GMX |
| Light corporativo | Stripe, Figma, OpenAI, Scout |
| Warm elegante | Anthropic, Pulso Hotel, Unseen |
| Produto/SaaS | Apple, Notion, Nothing, Rive |
| Agência/portfólio | Locomotive, Lusion, Obys, Duck Design, Reino |
| E-commerce | Simply Chocolate, FARM Rio, Nubank |
| Design tool | Figma, Spline, Webflow, Rive |
| Tipografia como hero | Obys, Unseen, Locomotive, Reino |
| Serif elegante | Dogstudio, Obys, Unseen |
| Fintech | Nubank, Stripe |

---

## Quest Integration

When invoked by Quest (via forge-bridge), Forge receives the specific mission context:

| Quest World | Forge Phase | Notes |
|---|---|---|
| W0: Briefing | Phase 0 (Discovery) | Setup + scope |
| W1: Estratégia | Phase 1 (Strategy) | References + structure |
| W2: Copy | Phase 2 (Copy) | Text content |
| W3: Build | Phase 3 (Build) | Implementation |
| W4: QA | Phase 4 (QA + Polish) | Testing + fixes |
| W5: Deploy | Phase 5 (Deploy) | Ship it |

---

## Error Recovery

Inherits from `{FORGE_HOME}/runner.md` Section 4, with LP-specific additions:

```
Pattern library not found
  → STOP — run pattern extraction first
  → "Pattern library não encontrada em design-system/patterns/. Precisa extrair primeiro."

Copy squad unavailable
  → Fallback: @dev creates basic copy from user bullets
  → Warn: "Copy squad indisponível. Copy básica criada — recomendo refinar depois."

Visual quality below threshold (Lighthouse < 80)
  → @dev fix performance issues (image optimization, lazy loading, code splitting)
  → Re-run Lighthouse
  → If still < 80 → CHECKPOINT: ask user if acceptable

Responsive breakage detected
  → @dev fix with Playwright screenshots as guide
  → @qa re-test specific breakpoint
```
