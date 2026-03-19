# DS Curation Pipeline — Proposta Completa

## Sistema Inteligente de Selecao e Padronizacao de Design Systems

**Autor:** Claude (Sintetizado de pesquisas Alan Nicolas, Brad Frost DNA, Workshop 2026-02-16, W3C DTCG, enterprise DS references)
**Data:** 2026-02-17
**Status:** PROPOSTA — Aguardando aprovacao

---

## 1. PROBLEMA

O AIOX precisa transformar dados BRUTOS de Figma (31K+ nodes, 146+ cores, 76 text styles, 52 shadows, 164 componentes — e isso de UMA UNICA pagina de 78) em um Design System padronizado, curado, com nivel de qualidade enterprise.

**Hoje:** Toda curadoria e manual. O humano (ou o AI sem restricoes) olha os dados brutos e decide o que manter. Nao ha scoring, nao ha thresholds, nao ha rejeicao automatica.

**Objetivo:** Pipeline executavel que recebe dados brutos massivos e produz tokens/componentes curados com decisoes rastreáveis e justificadas.

---

## 2. FONTES DE AUTORIDADE (Ranking de Confianca)

As decisoes de padronizacao sao fundamentadas nestas fontes, nesta ordem de prioridade:

| Tier | Fonte | Tipo | Arquivo Local |
|------|-------|------|---------------|
| S | W3C DTCG Spec v1.0 (Oct 2025) | Standard | `squads/design/data/w3c-dtcg-spec-reference.md` |
| S | WCAG 2.2 / APCA | Standard | `squads/design/data/wcag-compliance-guide.md` |
| A | Brad Frost — Atomic Design + DS+AI | Authority | `squads/design/data/brad-frost-dna.yaml` (714 lines) |
| A | Workshop Alan/Ruan/Pedro 2026-02-16 | Internal | `docs/research/2026-02-16-ux-writing-governance-ds-ai/meeting-insights-2026-02-16.md` |
| A | Tailwind v4 + Shadcn v4 Conventions | Technology | `docs/research/2026-02-16-tailwind-shadcn-design-system-componentization/02-research-report.md` |
| B | Material Design 3 (Google) | Enterprise | `squads/design/data/ds-reference-architectures.md` |
| B | Fluent 2 (Microsoft) | Enterprise | `squads/design/data/fluent2-design-principles.md` |
| B | Carbon (IBM) / Spectrum (Adobe) | Enterprise | `squads/design/data/ds-reference-architectures.md` |
| B | Nathan Curtis / EightShapes | Authority | Web research (token naming patterns) |
| C | Vignelli Design Philosophy | Aesthetic | `docs/research/2026-02-13-vignelli-design-philosophy/02-report.md` |

**Regra:** Decisoes de padronizacao DEVEM citar pelo menos 1 fonte Tier S ou A. Fontes B/C sao complementares.

---

## 3. ARQUITETURA DO PIPELINE

```
                        ┌─────────────────────────────────────────┐
                        │           ENTRADA (Raw Data)             │
                        │  Figma API → figma-tokens-raw.json       │
                        │  (N paginas, M nodes, cores, typo, etc) │
                        └────────────────┬────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
          ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
          │  FASE 1: INGEST │  │  FASE 1: INGEST │  │  FASE 1: INGEST │
          │  Color Extractor│  │  Typo Extractor  │  │  Component      │
          │  (hex→OKLCH)    │  │  (fonts, sizes)  │  │  Extractor      │
          └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
                   │                    │                     │
                   ▼                    ▼                     ▼
          ┌─────────────────────────────────────────────────────────┐
          │                 FASE 2: CONSOLIDATION                    │
          │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐│
          │  │ OKLCH Cluster│ │ GCD Spacing  │ │ Semantic Button  ││
          │  │ @10% deltaE  │ │ Scale Builder│ │ Keyword Analysis ││
          │  │ Target: -85% │ │ Target: -60% │ │ Target: -90%     ││
          │  └──────────────┘ └──────────────┘ └──────────────────┘│
          └────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────────────┐
          │                  FASE 3: TOKENIZATION                    │
          │  Primitives (OKLCH raw) → Semantic (purpose) → Component│
          │  Naming: namespace-category-variant-scale                │
          │  Format: W3C DTCG JSON + CSS Custom Properties           │
          └────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────────────┐
          │                  FASE 4: QUALITY GATES                   │
          │  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐│
          │  │ Contrast │ │ Coverage  │ │ Reduction │ │ Naming   ││
          │  │ WCAG AA  │ │ >= 95%    │ │ >= 80%    │ │ Semantic ││
          │  │ >= 4.5:1 │ │ mapping   │ │ overall   │ │ valid    ││
          │  └──────────┘ └───────────┘ └───────────┘ └──────────┘│
          └────────────────────────┬────────────────────────────────┘
                                   │
                           PASS ───┤──── FAIL → Loop de correcao
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────────────┐
          │                  FASE 5: OUTPUT                          │
          │  workspace/ui/{brand}/                                   │
          │  ├── brand.json                                          │
          │  ├── tokens/primitives/ (colors, spacing, typography)    │
          │  ├── tokens/semantic/ (colors, surfaces)                 │
          │  ├── tokens/component/ (button, card, ...)               │
          │  ├── themes/ (light.css, dark.css)                       │
          │  └── tailwind.theme.css                                  │
          │                                                          │
          │  + metadata/tokens/{brand}-index.json (MCP queryable)    │
          │  + curation-report.json (decisoes rastreáveis)           │
          └─────────────────────────────────────────────────────────┘
```

---

## 4. ALGORITMOS DE SELECAO POR CATEGORIA

### 4.1 CORES — OKLCH Perceptual Clustering

**Upgrade do algoritmo atual:** HSL clustering → OKLCH deltaE clustering.

**Por que OKLCH e nao HSL:**
- HSL nao e perceptualmente uniforme (fonte: W3C DTCG, Tailwind v4, Shadcn v4)
- OKLCH garante que `deltaE = 5%` realmente PARECE 5% diferente pro olho humano
- Material Design 3 ja usa paletas tonais OKLCH-like (0-100 scale)

**Algoritmo:**
```
Input: Array de cores hex/rgb do Figma raw
  ↓
1. Converter tudo pra OKLCH (L, C, H)
  ↓
2. Clustering por deltaE com threshold = 10% (mais permissivo que HSL 5%)
   - deltaE(cor1, cor2) = sqrt((L1-L2)^2 + (C1-C2)^2 + (H1-H2)^2)
   - Se deltaE < 0.10 → mesmo cluster
  ↓
3. Para cada cluster:
   - Selecionar cor com MAIOR frequencia de uso como primária
   - Se empate → selecionar cor com MELHOR contraste contra bg default
  ↓
4. Gerar escala tonal automatica (50-950) para cores accent:
   - L varia de 0.97 (50) ate 0.15 (950) em 11 steps
   - C e H preservados do cluster primario
  ↓
5. Validar contraste WCAG AA:
   - Cada cor sematica vs bg-default: >= 4.5:1 (texto normal)
   - Cada cor sematica vs bg-default: >= 3.0:1 (texto grande / UI)
   - Se FAIL → ajustar L (lightness) ate passar
  ↓
Output: Paleta consolidada (tipicamente 8-15 cores primarias)
```

**Thresholds:**
| Metrica | Target | PASS | CONDITIONAL | FAIL |
|---------|--------|------|-------------|------|
| Reducao de cores | >= 85% | >= 85% | 70-84% | < 70% |
| Contraste WCAG AA | 100% | 100% | >= 90% | < 90% |
| Coverage de uso | >= 95% | >= 95% | >= 85% | < 85% |

---

### 4.2 SPACING — GCD Base Unit + Harmonic Scale

**Algoritmo:**
```
Input: Todos os valores de padding, margin, gap do Figma raw
  ↓
1. Normalizar unidades (rem → px: 1rem = 16px)
  ↓
2. Calcular GCD (Greatest Common Divisor) de todos os valores
  ↓
3. Se GCD != 4 e GCD != 8 → Default para 4px
   (Fonte: Workshop Alan/Ruan — "4px grid is market standard")
  ↓
4. Gerar escala harmonica:
   0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px),
   8(32px), 10(40px), 12(48px), 16(64px), 20(80px), 24(96px)
  ↓
5. Mapear cada valor existente ao step mais proximo da escala
  ↓
6. Valores que nao mapeiam (distancia > 2px) → documentar como override manual
  ↓
Output: 13-16 spacing tokens (escala consistente)
```

**Thresholds:**
| Metrica | Target | PASS | CONDITIONAL | FAIL |
|---------|--------|------|-------------|------|
| Reducao de spacing | >= 60% | >= 60% | 40-59% | < 40% |
| Base unit detectada | 4px ou 8px | Automatica | Manual confirm | Anomala |
| Coverage | >= 95% | >= 95% | >= 85% | < 85% |

---

### 4.3 TYPOGRAPHY — Modular Scale + Font Consolidation

**Algoritmo:**
```
Input: Todas as font families, sizes, weights, line-heights do Figma raw
  ↓
1. FONT FAMILIES:
   - Contar frequencia de cada font family
   - Selecionar TOP 2 (display + body) + 1 mono
   - Se > 3 families → REJEITAR as menos usadas (< 5% uso)
  ↓
2. FONT SIZES:
   - Detectar multiplicador (1.2x minor third ou 1.25x major second)
   - Gerar escala: base(16px), sm(14px), xs(12px), lg(18px), xl(20px),
     2xl(24px), 3xl(30px), 4xl(36px), 5xl(48px)
   - Mapear cada size existente ao step mais proximo
  ↓
3. FONT WEIGHTS:
   - Consolidar: 300(light), 400(normal), 500(medium), 600(semibold), 700(bold)
   - Merge weights com distancia < 50: ex. 450→400, 550→500
   - Maximo 5 weights distintos
  ↓
4. LINE HEIGHTS:
   - Calcular ratio ideal: heading(1.2), body(1.5), tight(1.25), relaxed(1.75)
   - Mapear cada line-height existente ao ratio mais proximo
  ↓
5. LETTER SPACING:
   - Consolidar: tight(-0.025em), normal(0), wide(0.025em), wider(0.05em)
  ↓
Output: 3 families, 9-10 sizes, 5 weights, 4 line-heights, 4 letter-spacings
```

**Thresholds:**
| Metrica | Target | PASS | CONDITIONAL | FAIL |
|---------|--------|------|-------------|------|
| Reducao typography | >= 50% | >= 50% | 35-49% | < 35% |
| Font families | <= 3 | <= 3 | 4 | > 4 |
| Weight count | <= 5 | <= 5 | 6 | > 6 |

---

### 4.4 SHADOWS — Depth Level Consolidation

**Algoritmo:**
```
Input: Todos os box-shadow/drop-shadow do Figma raw
  ↓
1. Calcular "depth score": abs(offset-x) + abs(offset-y) + blur
  ↓
2. Bucket por depth:
   xs: depth 1-3 (hover states)
   sm: depth 4-8 (cards resting)
   md: depth 9-15 (cards elevated)
   lg: depth 16-25 (dropdowns)
   xl: depth 26+ (modals, overlays)
  ↓
3. Para cada bucket → selecionar shadow com MAIOR frequencia
  ↓
4. Substituir cores hardcoded por tokens:
   rgba(0,0,0,0.1) → var(--color-shadow-default)
  ↓
5. Adicionar shadows especiais se brand exigir:
   glow: 0 0 Npx var(--color-primary) (accent glow — ex: Clickmax neon)
  ↓
Output: 5-7 shadow tokens + 0-2 brand-specific
```

---

### 4.5 BORDER RADIUS — Harmonic Scale

**Algoritmo:**
```
Input: Todos os border-radius do Figma raw
  ↓
1. Normalizar para px
  ↓
2. Bucket por tamanho:
   none: 0
   sm: 1-4px → 0.125-0.25rem
   md: 5-8px → 0.375rem
   lg: 9-12px → 0.5-0.75rem
   xl: 13-16px → 1rem
   2xl: 17-20px → 1.25rem
   3xl: 21-28px → 1.5rem
   full: 9999px (pills, avatars)
  ↓
3. Selecionar valor mais frequente de cada bucket como canonico
  ↓
4. Se brand tem radius signature (ex: Clickmax usa lg/3xl mais que md)
   → preservar como preferencia de brand no brand.json
  ↓
Output: 7-8 radius tokens
```

---

### 4.6 COMPONENTES — Quality Gate Multi-Dimensional

**Criterios de selecao para cada componente extraido:**

```
Score = (
  TypeScript_compile  × 0.15 +    # 0 ou 1 (compila sem erros)
  Token_coverage      × 0.15 +    # % de valores usando tokens (target: 100%)
  Test_coverage       × 0.15 +    # % coverage (target: >= 80%)
  Accessibility_pass  × 0.20 +    # WCAG AA (ARIA, contrast, keyboard, focus)
  Props_typed         × 0.15 +    # % de props com tipos especificos (no `any`)
  Documentation       × 0.10 +    # Completa (props, examples, guidelines)
  Semantic_HTML       × 0.10      # Elementos corretos (<button> nao <div onClick>)
) × 100

PASS:        >= 80%
CONDITIONAL: 60-79%
FAIL:        < 60%
```

**Regra de selecao ao receber componentes brutos do Figma:**

```
Input: Lista de componentes detectados no Figma
  ↓
1. FILTRAR por frequencia de uso (>= 3 instancias no Figma)
  ↓
2. CLASSIFICAR por nivel atomico:
   Atom: Button, Input, Label, Badge, Avatar, Icon
   Molecule: FormField, Card, Alert, Tooltip
   Organism: Form, Modal, Sidebar, DataTable
  ↓
3. PRIORIZAR por impacto:
   P0: Button, Input, Card (usados em >50% das telas)
   P1: Badge, Avatar, Form, Modal (usados em 20-50%)
   P2: Sidebar, DataTable, Toast (usados em <20%)
  ↓
4. Para cada componente selecionado:
   - Extrair props do Figma (variants, states, sizes)
   - Mapear tokens (bg, fg, border, radius, shadow)
   - Definir variantes CVA (variant × size matrix)
   - Validar contra quality gate (score >= 80%)
  ↓
Output: Componente registrado em registry.json + metadata
```

---

## 5. SCORING GLOBAL — Consolidation Report

Apos executar todos os algoritmos, o pipeline gera um `curation-report.json`:

```json
{
  "brand": "clickmax",
  "source": "figma-tokens-raw.json",
  "timestamp": "2026-02-17T08:00:00Z",
  "scores": {
    "colors": {
      "before": 146,
      "after": 24,
      "reduction": "83.6%",
      "target": "85%",
      "status": "CONDITIONAL",
      "wcag_aa_pass": "100%",
      "coverage": "97.2%"
    },
    "spacing": {
      "before": 32,
      "after": 13,
      "reduction": "59.4%",
      "target": "60%",
      "status": "CONDITIONAL",
      "base_unit": "4px",
      "coverage": "96.1%"
    },
    "typography": {
      "before": { "families": 34, "sizes": 20, "weights": 8 },
      "after": { "families": 3, "sizes": 10, "weights": 5 },
      "reduction": "71.0%",
      "target": "50%",
      "status": "PASS"
    },
    "shadows": {
      "before": 52,
      "after": 7,
      "reduction": "86.5%",
      "target": "70%",
      "status": "PASS"
    },
    "radius": {
      "before": 15,
      "after": 8,
      "reduction": "46.7%",
      "target": "60%",
      "status": "CONDITIONAL"
    },
    "overall": {
      "reduction": "81.3%",
      "target": "80%",
      "status": "PASS"
    }
  },
  "decisions": [
    {
      "category": "color",
      "action": "MERGE",
      "items": ["#d4ff00", "#d5ff01", "#d3fe00"],
      "result": "#d4ff00",
      "reason": "deltaE < 0.02, kept most-used (2886 instances)",
      "authority": "Brad Frost consolidation-algorithms + OKLCH clustering"
    }
  ]
}
```

---

## 6. IMPLEMENTACAO PROPOSTA

### 6.1 Scripts a Criar

| Script | Funcao | Input | Output |
|--------|--------|-------|--------|
| `squads/design/scripts/design-system/curate_colors.cjs` | OKLCH clustering + contrast validation | figma-tokens-raw.json | curated-colors.json |
| `squads/design/scripts/design-system/curate_spacing.cjs` | GCD detection + scale generation | figma-tokens-raw.json | curated-spacing.json |
| `squads/design/scripts/design-system/curate_typography.cjs` | Font consolidation + modular scale | figma-tokens-raw.json | curated-typography.json |
| `squads/design/scripts/design-system/curate_shadows.cjs` | Depth bucketing + token replacement | figma-tokens-raw.json | curated-shadows.json |
| `squads/design/scripts/design-system/curate_radius.cjs` | Harmonic scale mapping | figma-tokens-raw.json | curated-radius.json |
| `squads/design/scripts/design-system/curate_components.cjs` | Frequency filter + atomic classification | figma-tokens-raw.json | curated-components.json |
| `squads/design/scripts/design-system/generate_tokens.cjs` | Combina curated-*.json → CSS tokens | curated-*.json | tokens/*.css |
| `squads/design/scripts/design-system/generate_curation_report.cjs` | Scoring + decision trail | curated-*.json | curation-report.json |
| `squads/design/scripts/design-system/validate_curation.cjs` | Quality gates (thresholds check) | curation-report.json | PASS/FAIL |

### 6.2 Integracao com MCP

Novas tools para o MCP server:

| Tool | Descricao |
|------|-----------|
| `design_system.curate_brand` | Executa pipeline completo para uma brand |
| `design_system.get_curation_report` | Retorna ultimo curation-report.json |
| `design_system.compare_brands` | Compara tokens entre 2 brands |

### 6.3 Integracao com Workflow Existente

O pipeline se encaixa no workflow `brownfield-complete.yaml`:

```
Fase existente:  audit → consolidate → tokenize → migrate → build
Pipeline novo:   ingest → curate → tokenize → validate → output
                    ↑         ↑         ↑          ↑
                 Fase 1    Fase 2    Fase 3     Fase 4
```

---

## 7. LIMITACOES — O QUE NAO PODE SER AUTOMATIZADO

### 7.1 Decisoes que EXIGEM julgamento humano

| Decisao | Por que nao automatiza | Mitigacao |
|---------|----------------------|-----------|
| **Identidade de marca** | A cor accent (#D4AF37 gold vs #D4FF00 lime) e uma decisao de negocio, nao tecnica | Pipeline PRESERVA accent, so consolida variantes |
| **Hierarquia visual** | Qual componente e "hero" vs "secondary" depende do contexto da pagina | Pipeline classifica por frequencia, humano valida prioridade |
| **Tom emocional** | Sombras suaves vs dramaticas, radius arredondado vs angular = decisao estetica | Pipeline oferece opcoes ranked, humano escolhe |
| **Excepcoes de marca** | Um botao com radius especial para campanha, uma cor fora do padrao | Pipeline flagga como "override manual" com justificativa obrigatoria |
| **Contexto de uso** | O mesmo componente pode precisar de variantes diferentes em checkout vs landing page | Pipeline cria variantes semanticas, humano valida mapeamento |

### 7.2 Limitacoes tecnicas

| Limitacao | Impacto | Workaround |
|-----------|---------|------------|
| **Figma API retorna nodes sem semantica** | Nao sabemos se um retangulo e "card" ou "container" sem nomear | Depende de naming conventions no Figma (componentes nomeados) |
| **OKLCH conversion nao e 100% reversivel** | Arredondamentos minimos ao converter hex → OKLCH → hex | Aceitavel (< 0.5% deltaE de erro) |
| **Componentes complexos** | DataTable, Calendar, RichTextEditor nao sao extraiveis do Figma automaticamente | Construir manualmente seguindo tokens curados |
| **Animacoes** | Figma nao exporta motion/transition data | Capturar via Playwright + Gemini 3.0 (futuro) |
| **Responsividade** | Figma mostra layouts fixos, nao breakpoints reais | Definir breakpoints manualmente (mobile/tablet/desktop) |
| **Multi-pagina Figma** | Hoje so 1 de 78 paginas foi extraida | Precisa script de batch extraction (figma-scan.cjs existe, precisa ampliar) |
| **Acessibilidade visual** | Contraste pode ser validado, mas UX de leitor de tela nao | Testes manuais com NVDA/VoiceOver necessarios |

### 7.3 O que o pipeline FAZ bem (automacao confiavel)

| Capacidade | Confianca | Fonte |
|------------|-----------|-------|
| Clustering perceptual de cores | 95%+ | Algoritmo matematico (deltaE) |
| Deteccao de base unit (4px/8px) | 99%+ | GCD matematico |
| Geracao de escala tipografica | 90%+ | Modular scale matematico |
| Validacao de contraste WCAG | 100% | Formula WCAG computable |
| Consolidacao de shadows por depth | 85%+ | Bucketing numerico |
| Mapping de radius para escala | 90%+ | Bucketing numerico |
| Deteccao de variantes de botao | 80%+ | Keyword analysis (heuristica) |
| Geracao de curation-report | 100% | Scoring formula definida |
| Validacao de quality gates | 100% | Thresholds numericos |

---

## 8. DECISOES ARQUITETURAIS (Workshop 2026-02-16)

Estas decisoes foram extraidas diretamente do workshop e sao **lei**:

1. **"Governance Squad Creates, Execution Squad Uses"** — Os scripts de curadoria pertencem ao governance squad. O execution squad consume os tokens curados.

2. **"Foundations Invisible, Not Customizable"** — Grid 4px, breakpoints, spacing scale sao padrao de mercado. Nao customizaveis por brand.

3. **"Prompt Injection in Components"** — Todo componente gerado DEVE conter regras non-negotiable no header CSS (max words, CTA rules, error next-step).

4. **"Reverse-Engineer > Infinite Research"** — Extrair padroes de sistemas validados (ClickMax tem milhoes investidos em UX) e mais rapido que pesquisar infinitamente.

5. **"Synchronization Mandatory"** — Cada token curado deve triggerar atualizacao de: registry, metadata, MCP, tailwind.theme.css.

6. **"Zero Hardcoded Values"** (Brad Frost) — Token ou nada. Scripts de validacao rejeitam qualquer #hex ou Npx hardcoded.

---

## 9. ROADMAP DE EXECUCAO

| Fase | Descricao | Dependencia | Esforco |
|------|-----------|-------------|---------|
| **10.1** | `curate_colors.cjs` — OKLCH clustering + contrast | figma-tokens-raw.json | 1 sessao |
| **10.2** | `curate_spacing.cjs` — GCD + harmonic scale | figma-tokens-raw.json | 0.5 sessao |
| **10.3** | `curate_typography.cjs` — Font consolidation | figma-tokens-raw.json | 0.5 sessao |
| **10.4** | `curate_shadows.cjs` — Depth bucketing | figma-tokens-raw.json | 0.5 sessao |
| **10.5** | `curate_radius.cjs` — Harmonic scale | figma-tokens-raw.json | 0.5 sessao |
| **10.6** | `generate_tokens.cjs` — Curated → CSS | 10.1-10.5 | 1 sessao |
| **10.7** | `generate_curation_report.cjs` — Scoring | 10.1-10.5 | 0.5 sessao |
| **10.8** | `validate_curation.cjs` — Quality gates | 10.7 | 0.5 sessao |
| **10.9** | Batch Figma extraction (78 paginas) | figma-scan.cjs | 1 sessao |
| **10.10** | Re-curate com dados completos | 10.9 | 1 sessao |

**Total estimado:** ~7 sessoes de trabalho

---

## 10. COMO VALIDAR O PIPELINE

### Teste 1: Idempotencia
```
Rodar pipeline 2x com mesmo input → output identico
```

### Teste 2: Regressao contra Lendario
```
Rodar pipeline com dados Lendario → comparar com tokens manuais ja criados
Diferenca aceitavel: < 5% nos valores finais
```

### Teste 3: Novo brand (cold start)
```
Extrair Figma de um 3o brand → pipeline produz DS valido sem intervencao manual?
Expectativa: 80-90% automatico, 10-20% revisao humana
```

### Teste 4: Quality gates bloqueiam corretamente
```
Injetar dados com contraste invalido → pipeline DEVE rejeitar com FAIL
Injetar dados com < 85% reducao cores → pipeline DEVE retornar CONDITIONAL
```

---

## 11. COMPARACAO COM EQUIPES SILICON VALLEY

| Aspecto | Enterprise (Material/Fluent/Carbon) | AIOX Pipeline |
|---------|-------------------------------------|---------------|
| **Token naming** | namespace-category-variant-scale | Mesmo padrao (W3C DTCG) |
| **Color space** | OKLCH / tonal palettes | OKLCH com deltaE clustering |
| **3-tier hierarchy** | Primitive → Semantic → Component | Identico |
| **Quality gates** | CI/CD automated | Scripts com thresholds numericos |
| **Accessibility** | WCAG AA built-in | Contraste automatico, ARIA manual |
| **Governance** | Federated (IBM) / Centralized (Google) | Governance Squad + validation scripts |
| **Machine-readable** | JSON APIs, Storybook | MCP server + metadata JSON |
| **Multi-brand** | Material Dynamic Color | Catalog multi-brand com brand.json |
| **Consolidation** | Manual by DS team | Algoritmos automaticos (85%+ reducao) |
| **Gap** | Equipes de 10-50 pessoas full-time | AI + scripts + revisao humana |

**Veredito:** O pipeline cobre ~85% do que uma equipe enterprise faz. Os 15% restantes sao: testes com usuarios reais, iteracao com stakeholders, edge cases de layout responsivo, e componentes complexos (calendar, rich text, etc.) que exigem construcao manual.

---

## RESUMO EXECUTIVO

**O que estamos propondo:**
9 scripts Node.js que transformam dados brutos de Figma em tokens curados usando algoritmos matematicos (OKLCH deltaE, GCD, modular scale, depth bucketing) com quality gates numericos (>= 85% reducao cores, >= 4.5:1 contraste, >= 95% coverage).

**O que muda:**
- Hoje: curadoria 100% manual, sem rastreabilidade
- Depois: curadoria 80-90% automatica, com curation-report.json documentando cada decisao

**O que NAO muda:**
- Decisoes de identidade de marca continuam humanas
- Componentes complexos continuam sendo construidos manualmente
- Review humano continua obrigatorio antes de commit

**Proximo passo:** Aprovar proposta → Implementar Fase 10.1 (curate_colors.cjs) como prova de conceito.
