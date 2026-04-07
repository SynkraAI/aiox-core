# Workflow: Clone Site (Premium Redesign)

> Extract DNA → Analyze Structure → Select Premium Patterns → Rebuild 10/10 → QA → Deploy

---

## When to Use

- User runs `/forge clone {url}` or `/forge redesign {url}`
- User sends a URL and asks to "refazer", "redesenhar", "melhorar", "clonar"
- User sends a screenshot and asks to "fazer igual", "criar nesse nível"
- Scope: take any existing site and rebuild it at premium agency quality

---

## Philosophy (NON-NEGOTIABLE)

**O resultado NUNCA pode parecer "feito por IA".** Deve parecer que uma agência de design cobrou R$ 50k.

Sinais de "feito por IA" que são PROIBIDOS:
- Cores genéricas (#007bff, #28a745, Bootstrap defaults)
- Espaçamento apertado ou inconsistente
- Tipografia sem hierarquia clara (tudo mesmo tamanho)
- Gradientes lineares básicos (azul→roxo genérico)
- Sombras default do framework
- Cards todos iguais sem variação
- CTAs sem hover state premium
- Falta de efeitos de scroll (fade-in, parallax)
- Imagens quadradas genéricas sem aspect ratio pensado
- Footer genérico com 3 colunas iguais

Sinais de "agência premium" que são OBRIGATÓRIOS:
- Palette extraída de referências reais (pattern library)
- Tipografia com saltos dramáticos (hero 56-64px, body 16px)
- Espaçamento generoso (min 80px entre seções, 120px+ no hero)
- Efeitos de scroll (IntersectionObserver fade-in com stagger)
- Hover states premium nos CTAs (glow, translateY, shadow expand)
- Glass morphism ou gradient mesh onde aplicável
- Max-width em texto (65ch body, 20ch headlines)
- Animações suaves (cubic-bezier custom, não ease-in-out genérico)
- Dark/light sections alternadas com transição visual
- Detalhes micro: dot patterns, shimmer lines, gradient borders

---

## Pipeline

```
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5
Discovery   Extract    Strategy   Build      QA+Polish  Deploy
```

---

## Execution

### Phase 0: Discovery

**Inputs necessários:**
1. URL do site original (ou screenshot)
2. Contexto: "Manter conteúdo e melhorar visual" vs "Recriar do zero com novo conteúdo"

**Socratic Gate — 3 perguntas:**

1. **Objetivo** — O que quer do redesign?
   - `1. Manter conteúdo, melhorar visual` | `2. Recriar visual + copy` | `3. Clonar visual de outro site para o meu conteúdo`

2. **Referência visual** — Qual vibe?
   - `1. Escolher da pattern library (mostro opções)` | `2. Já tenho referência (mandar URL)` | `3. Deixar o Forge decidir baseado no nicho`

3. **Stack** — Onde vai rodar?
   - `1. HTML/CSS puro` | `2. Next.js + Tailwind` | `3. Mesmo stack do original`

**CHECKPOINT:** Confirmar escopo antes de prosseguir.

### Phase 1: DNA Extraction (Dupla)

**Agents:** @dev, @ux-design-expert

Extrair DNA do site ORIGINAL (para entender o que tem) E das referências premium (para saber aonde chegar).

**1.1 — Extrair site original:**
```bash
bash design-system/scripts/full-extract.sh "{url}" "{name}-original"
```
- Ler `tokens.yaml` → palette atual, fonts, spacing
- Ler `components.json` → quais componentes existem
- Ler `screenshot-desktop.png` + `screenshot-mobile.png` → layout atual
- Ler `extracted-css.json` → efeitos atuais (ou falta deles)

**1.2 — Analisar screenshot com Vision:**

@ux-design-expert analisa o screenshot e cataloga:
- Quais seções existem (hero, about, services, testimonials, CTA, footer)
- Layout de cada seção (grid, alternating, full-width, etc.)
- Problemas visuais (espaçamento, cores, tipografia, falta de efeitos)
- Conteúdo textual (headlines, body, CTAs) — para preservar se o user quiser

**1.3 — Selecionar referências premium:**

Baseado no tipo de site, consultar `design-system/patterns/INDEX.md`:

| Tipo de site | Referências recomendadas |
|---|---|
| SaaS / App | Linear, Vercel, Figma, Webflow |
| Agência / Serviço | Locomotive, Obys, Duck Design, GMX |
| Curso / Mentoria | Gui Ávila ClickUp 8x, Gui Ávila Automações |
| E-commerce | Simply Chocolate, FARM Rio, Nubank |
| Corporativo | Stripe, Anthropic, Figma |
| Portfólio | Lusion, Unseen, Obys, Reino |
| Hardware / Produto | Nothing, Apple, Rive |

Ler `tokens.yaml` e `extracted-css.json` das 2-3 referências selecionadas.

**Output:** `clone-strategy.md` com:
- Mapa de seções do original
- Referências selecionadas com justificativa
- Palette final (extraída das referências)
- Font stack final
- Efeitos a implementar (listados da `effects/README.md`)

### Phase 2: Design Strategy

**Agents:** @ux-design-expert, @architect

**2.1 — Definir tokens visuais:**
```css
:root {
  /* Cores — extraídas das referências, NÃO inventadas */
  --color-primary: {da referência};
  --color-bg: {da referência};
  /* ... */
}
```

**2.2 — Mapear seção por seção:**

Para CADA seção do original, definir:
- Qual pattern premium usar (de qual referência)
- Layout (grid? alternating? full-width?)
- Efeito de entrada (fade-up? slide? parallax?)
- Efeito de hover (se aplicável)

**2.3 — Definir efeitos premium (OBRIGATÓRIOS):**

Todo site DEVE ter no mínimo:
- [ ] Hero com glow ou gradient mesh (PE-01 ou PE-02)
- [ ] Scroll-triggered fade-in em todas as seções (PE-04)
- [ ] Hover premium nos CTAs (glow, translateY, shadow)
- [ ] Header sticky com shrink + blur (PE-10)
- [ ] Pelo menos 1 efeito "wow" (parallax, cursor glow, gradient border, infinite scroll)

Consultar `design-system/patterns/effects/README.md` para receitas prontas.

**CHECKPOINT:** Mostrar strategy ao user. "Essa é a direção visual. Ajustar?"

### Phase 3: Build (Premium)

**Agents:** @dev, @ux-design-expert

**Regras de build (NON-NEGOTIABLE):**

1. **NUNCA usar cores genéricas** — toda cor vem do token system extraído
2. **NUNCA usar sombras default** — sombras vêm do catálogo de efeitos
3. **NUNCA espaçamento < 80px entre seções** — premium = respiro visual
4. **NUNCA body text > 65ch** — linhas longas matam leitura
5. **NUNCA headline sem letter-spacing negativo** — headlines premium têm -0.02em a -0.03em
6. **SEMPRE fade-in no scroll** — IntersectionObserver em TODA seção
7. **SEMPRE hover premium** — CTAs devem ter glow + translateY(-2px) + shadow expand
8. **SEMPRE cubic-bezier custom** — nunca `ease` ou `ease-in-out` genérico
9. **SEMPRE mobile-first** — 3 breakpoints (390px, 768px, 1440px)
10. **SEMPRE testar em 1440px** — é o viewport de decisão

**Ordem de build:**
1. Scaffold (HTML structure + CSS tokens)
2. Header + Hero (a primeira impressão é tudo)
3. Seções do corpo (uma por vez)
4. Footer
5. Efeitos premium (scroll, hover, parallax)
6. Responsivo
7. Polish (micro-ajustes de spacing, cores, transitions)

**Após cada seção:** @ux-design-expert faz review visual rápido.

### Phase 4: QA + Polish

**Agents:** @qa, @ux-design-expert

**4.1 — Screenshot comparison:**
- Tirar screenshots do redesign em 3 breakpoints
- Comparar lado a lado com original (mostrar evolução)

**4.2 — Premium checklist (MANDATORY):**

- [ ] Nenhuma cor genérica (#007bff, Bootstrap defaults)
- [ ] Tipografia com hierarquia clara (hero vs h2 vs body)
- [ ] Espaçamento generoso entre seções (≥80px)
- [ ] Fade-in no scroll em TODAS as seções
- [ ] Hover premium em TODOS os CTAs
- [ ] Header sticky com blur
- [ ] Pelo menos 1 efeito "wow"
- [ ] Mobile funciona sem quebras
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 90
- [ ] Nenhum texto sem contraste WCAG AA
- [ ] Max-width em body text (≤65ch)
- [ ] Letter-spacing negativo em headlines

**4.3 — Lighthouse audit**

**4.4 — Fix issues**

**CHECKPOINT:** Mostrar screenshots + checklist. "Redesign pronto?"

### Phase 5: Deploy

Standard deploy via `{FORGE_HOME}/phases/phase-5-deploy.md`.

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0 - Discovery | (Forge core) | — |
| 1 - Extraction | @dev | @ux-design-expert |
| 2 - Strategy | @ux-design-expert | @architect |
| 3 - Build | @dev | @ux-design-expert |
| 4 - QA + Polish | @qa | @ux-design-expert, @dev |
| 5 - Deploy | @devops | — |

---

## Progress Display

```
  ✅ Discovery  ->  🔄 Extract  ->  ○ Strategy  ->  ○ Build  ->  ○ QA  ->  ○ Deploy
```

---

## Premium Pattern Quick Reference

### Efeitos obrigatórios (de effects/README.md)
| Efeito | Receita | Quando |
|--------|---------|--------|
| Hero Glow | PE-01 | Sempre no hero |
| Gradient Mesh | PE-02 | Heroes dark premium |
| Scroll Fade-in | PE-04 | TODA seção |
| Glass Card | PE-05 | Cards em dark mode |
| Gradient Border | PE-06 | CTAs premium |
| Parallax | PE-07 | Imagens de background |
| Cursor Glow | PE-09 | Sites criativos |
| Header Shrink | PE-10 | Sempre |

### Easing curves premium (nunca usar ease genérico)
```css
--ease-smooth: cubic-bezier(0.25, 1, 0.5, 1);       /* Stripe */
--ease-card: cubic-bezier(0.165, 0.84, 0.44, 1);     /* Stripe cards */
--ease-apple: cubic-bezier(0.4, 0, 0.6, 1);          /* Apple */
--ease-dramatic: cubic-bezier(0.77, 0, 0.175, 1);    /* Linear */
```

### Sombras premium (nunca usar box-shadow genérico)
```css
/* Light theme */
--shadow-card: rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 2px 8px;
/* Dark theme */
--shadow-glow: rgba(17,0,255,0.5) 0px 8px 40px, rgba(0,85,255,0.12) 0px 0px 0px 1px;
/* Glass */
--shadow-glass: rgba(255,255,255,0.05) 0px 1px 0px inset, rgba(0,0,0,0.3) 0px 20px 40px;
```

---

## Error Recovery

```
Original site blocks Playwright
  → Use screenshot only (user sends screenshot)
  → Ask user to save page as HTML (Cmd+S)

Site too complex (>5000 DOM nodes)
  → Focus on above-the-fold first
  → Build incrementally, checkpoint after each section

User not happy with direction
  → STOP building, go back to Phase 2
  → Ask: "Qual site da library mais se aproxima do que você quer?"
  → Show screenshots of 3-4 references for user to pick

Lighthouse score too low
  → Optimize images (lazy loading, WebP)
  → Remove unused CSS
  → Minimize JS animations on mobile
```
