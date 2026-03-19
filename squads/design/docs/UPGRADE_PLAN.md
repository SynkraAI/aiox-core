# Design Squad Upgrade Plan - DS+AI Integration

## TL;DR

Upgrade do squad Design para **Agentic Design System** baseado na pesquisa de Brad Frost + Tailwind v4 + Shadcn.

**Foco:** Transformar o Design System em **machine-readable infrastructure** que AI agents podem consumir.

**Atualizado:** 2026-02-17 - Fases 0-9 COMPLETAS. Catálogo multi-brand com 2 DS: Lendário + Clickmax.

---

## Estado Atual vs Objetivo

| Aspecto | Status | Artefato | Gap |
|---------|--------|----------|-----|
| **Tier System** | ✅ DONE | `squads/design/config.yaml` | — |
| **Foundations** | ✅ DONE | `squads/design/data/design-tokens-spec.yaml` | — |
| **Prompt Injection** | ✅ DONE | `squads/design/templates/component-prompt-injection-tmpl.md` | — |
| **Sync Registry** | ✅ DONE | `squads/design/tasks/ds-sync-registry.md` | — |
| **Token System** | ✅ DONE | `tokens/primitives/` + `semantic/` + `component/` (7 CSS files, 3 tiers) | — |
| **WCAG Quality Gates** | ⚠️ PARCIAL | `ds-accessibility-wcag-checklist.md` | Contrast validation runtime |
| **Workspace Integration** | ✅ DONE | `workspace/system/` + `workspace/ui/` (6 categorias) | — |
| **Machine-Readable** | ✅ DONE | `metadata/` (6 components, 47 tokens, guidelines) | — |
| **MCP Server** | ✅ DONE | `mcp/server.ts` + 4 handlers + 8 tools | — |
| **Registry System** | ✅ DONE | `workspace/ui/registry.json` (5 items, Shadcn v4) | — |
| **Brad Frost Agent** | ✅ DONE | `brad-frost.md` v4.0.0 (42 commands, 6 DS+AI) | — |
| **IDE Rules** | ✅ DONE | `rules/.cursorrules` + `.claude-rules.md` + `.vscode-settings.json` | — |
| **Figma Extraction** | ✅ DONE | `extraction/figma-tokens-raw.json` → `workspace/ui/clickmax/` (11 files) | — |

---

## Fases de Implementação

### FASE 0: Governance & Foundations (P0) -- COMPLETO

**Objetivo:** Prompt injection template + sync registry task.

**Entregáveis:**
- [x] Template: `squads/design/templates/component-prompt-injection-tmpl.md`
- [x] Task: `squads/design/tasks/ds-sync-registry.md`
- [x] squad.yaml e config.yaml atualizados
- [x] Governance documentada no README do squad

**Checkpoint:** ✅ Gate 0 PASSED.

---

### FASE 1: Foundation Validation (P0) -- COMPLETO

**Objetivo:** Validar estrutura existente e mapear integração.

**Entregáveis:**
- [x] Audit de `workspace/domains/design-system/` e `workspace/system/`
- [x] Mapeamento de dependências entre structures
- [x] Identificação de componentes para migração

**Checkpoint:** ✅ Sem conflitos, OKLCH compatível.

---

### FASE 2: Token System OKLCH (P1) -- COMPLETO

**Objetivo:** Sistema de tokens 3-tier com OKLCH.

**Estrutura Implementada:**
```
workspace/domains/design-system/tokens/
├── primitives/          # Layer 1: Raw OKLCH values
│   ├── colors.css       # 21 OKLCH colors
│   ├── spacing.css      # 8 spacing tokens
│   └── typography.css   # 4 typography tokens
├── semantic/            # Layer 2: Purpose-based aliases
│   ├── colors.css       # 6 semantic color tokens
│   └── surfaces.css     # Surface tokens
├── component/           # Layer 3: Component-specific
│   ├── button.css       # 3 button tokens
│   └── card.css         # 2 card tokens
themes/
├── light.css            # Light theme overrides
└── dark.css             # Dark theme (default)
tailwind.theme.css       # @theme directive for Tailwind v4
```

**Checkpoint:** ✅ Gate 1 PASSED (3/4 — contrast runtime pendente).

---

### FASE 3: Workspace Structure (P1) -- COMPLETO

**Objetivo:** Arquitetura workspace/* com componentes Radix + CVA.

**Estrutura Implementada:**
```
workspace/
├── system/primitives/       # button/, input/, textarea/, badge/
│   └── patterns/            # form-field/
├── ui/
│   ├── components/          # 6 categorias (data-display, feedback, forms, layout, navigation, overlay)
│   ├── blocks/              # Seções compostas
│   └── registry.json        # Shadcn-style registry
└── domains/design-system/   # Tokens + Themes + Metadata + MCP
```

**Checkpoint:** ✅ Gate 2 PASSED (CVA, TypeScript, prompt injection).

---

### FASE 4: AI Metadata Layer (P1) -- COMPLETO

**Objetivo:** Metadata machine-readable para AI consumption.

**Estrutura Implementada:**
```
workspace/domains/design-system/metadata/
├── components.json          # 6 components aggregated
├── components/              # 6 individual JSONs (button, input, textarea, badge, card, form-field)
├── tokens/index.json        # 47 tokens, 3 tiers, 6 categorias
└── guidelines/usage.json    # 6 component guidelines (when_to_use, best_practices, common_mistakes)
```

**TypeScript Types:** `mcp/types.ts` — ComponentMetadata, TokenEntry, TokenRegistry, UsageGuideline, etc.

**Checkpoint:** ✅ All JSON valid, all required fields present.

---

### FASE 5: MCP Server (P2) -- COMPLETO

**Objetivo:** MCP server com 8 tools para AI agents consumirem o design system.

**Estrutura Implementada:**
```
workspace/domains/design-system/mcp/
├── server.ts               # Factory function, 8 tool definitions, handleToolCall
├── config.json             # Data sources + tool catalog
├── handlers/
│   ├── components.ts       # listComponents, getComponentById, searchComponents, getA11yRequirements
│   ├── tokens.ts           # listTokens, getTokensByCategory, getTokensByTier, searchTokens
│   ├── guidelines.ts       # getGuidelineForComponent, listGuidelines, suggestComponent
│   └── registry.ts         # listRegistryItems, getRegistryItem
└── types.ts                # TypeScript interfaces
```

**8 MCP Tools:**

| Tool | Input | Descrição |
|------|-------|-----------|
| `design_system.list_components` | — | Lista componentes com owner/status |
| `design_system.get_component` | `{ id }` | Metadata completo de um componente |
| `design_system.search_components` | `{ query }` | Busca por id, token, variant, WCAG |
| `design_system.get_a11y_requirements` | `{ id }` | Contrato a11y (role, keyboard, ARIA, WCAG) |
| `design_system.get_registry_entry` | `{ name }` | Entry do registry.json |
| `design_system.get_tokens` | `{ category?, tier? }` | Tokens filtrados |
| `design_system.get_guidelines` | `{ component }` | Guidelines de uso |
| `design_system.suggest_component` | `{ use_case }` | Sugere componente para caso de uso |

**Validação:** `squads/design/scripts/design-system/test_mcp_tools.cjs` — 8/8 tools PASS.

**Checkpoint:** ✅ Gate 3 PASSED.

---

### FASE 6: Registry System (P2) -- COMPLETO

**Objetivo:** Registry Shadcn v4 com validação.

**Implementado:**
- `workspace/ui/registry.json` — 5 items (button, input, textarea, badge, form-field)
- Campos Shadcn v4: `registryDependencies`, `cssVars`, `categories`
- File types: `registry:ui`, `registry:lib` (corrigido para Shadcn v4)
- form-field com `registryDependencies: ["input", "textarea"]`
- button com `cssVars: { theme: { "button-bg-primary", "button-text-primary", "button-radius" } }`

**Validação:** `squads/design/scripts/design-system/validate_registry.cjs` — schema check, type enums, dependency resolution.

**Checkpoint:** ✅ Gate validado.

---

### FASE 7: Brad Frost Agent Update (P2) -- COMPLETO

**Objetivo:** Adicionar comandos DS+AI ao agent Brad Frost.

**Agent:** `.claude/agents/AIOX/agents/brad-frost.md` v4.0.0

**6 Novos Comandos (Phase 11 — DS+AI Integration):**

| Comando | Task | Descrição |
|---------|------|-----------|
| `*ai-metadata` | `ds-generate-ai-metadata.md` | Gera metadata AI para componente |
| `*validate-ai-readiness` | `ds-validate-ai-readiness.md` | Valida se DS é AI-ready |
| `*mcp-status` | `ds-mcp-status.md` | Status do MCP server |
| `*generate-cursor-rules` | `ds-generate-cursor-rules.md` | Gera .cursorrules para IDE |
| `*registry-sync` | `ds-sync-registry.md` | Sincroniza registry.json |
| `*ds-query` | `ds-query.md` | Query interativo no DS via MCP |

**Atualizações:**
- voice_dna: +3 verbos, +4 substantivos, +3 adjetivos (vocabulário DS+AI)
- knowledge_areas: +7 áreas de DS+AI Integration
- workflow: `ai_integration_flow` (validate → query → maintain → enforce)
- output_examples: 3 novos (*mcp-status, *ds-query, *validate-ai-readiness)
- Total: 42 commands, 31 tasks

**Checkpoint:** ✅ Agent funcional, comandos mapeados.

---

### FASE 8: IDE Rules & Enforcement (P3) -- COMPLETO

**Objetivo:** Regras de IDE para enforcement do design system.

**Implementado:**
```
workspace/domains/design-system/rules/
├── .cursorrules          # 165 linhas — tokens, componentes, a11y, anti-patterns
├── .claude-rules.md      # 89 linhas — 8 MCP tools, token rules, validation scripts
└── .vscode-settings.json # 41 linhas — Tailwind CVA regex, CSS var files, formatter
```

**Conteúdo:**
- **`.cursorrules`**: 47 tokens listados por tier, 6 componentes com use/don't-use, best practices, a11y requirements, anti-patterns, consultation order
- **`.claude-rules.md`**: 8 MCP tool reference, token rules (3-tier), component rules com queries MCP, validation scripts
- **`.vscode-settings.json`**: CVA regex patterns, 7 CSS var file paths, TypeScript formatter

**Checkpoint:** ✅ Gate validado.

---

### FASE 9: Figma Extraction (P1) -- COMPLETO

**Objetivo:** Extrair design tokens reais do Figma Clickmax 2025 e reconciliar com o design system.

**Source:** Figma file `WoiEWBLoUikTtDcpCLmRUl` — Clickmax 2025 - Visão Geral

**Scripts de Extração:**
```
scripts/
├── figma-scan.cjs             # Scan de pages, components, styles, variables
├── figma-deep-scan.cjs        # Deep scan de node específico (fills, strokes, layout, typography)
└── figma-extract-tokens.cjs   # Extração completa de tokens — output JSON estruturado
```

**Progresso:**

| Scan | Status | Resultado |
|------|--------|-----------|
| Pages | ✅ DONE | 78 páginas mapeadas |
| Components | ✅ DONE | 0 published components (usa library externa) |
| Styles | ✅ DONE | 9 styles (3 text + 6 fill — Fuschia/Iris) |
| Variables | ✅ DONE | 0 variables (tokens não definidos no Figma) |
| Deep Scan (node 7081:22278) | ✅ DONE | 31.193 nodes, 43 frames extraídos |
| Token Extraction | ✅ DONE | JSON com 146 cores, 76 text styles, 52 shadows |

**Extração Salva:** `workspace/domains/design-system/extraction/figma-tokens-raw.json` (117 KB)

**Dados Extraídos da Página "0.0 Estrutura Base Geral":**

| Categoria | Quantidade | Destaques |
|-----------|-----------|-----------|
| **Cores** | 146 únicas | Accent: `#d4ff00` (neon lime), Grays: `#1f2123`→`#fafafa` |
| **Fonts** | 34 variações | Inter (body, 400-700), Plus Jakarta Sans (display, 700) |
| **Text Styles** | 76 | 10-24px, 5 weights, 6+ colors |
| **Spacings** | 113 | Gaps: 2-40px, Paddings: 2-100px |
| **Radii** | 25 | 999px (pills), 4px (default), 8-24px |
| **Shadows** | 52 | 4 elevações: ring, subtle, medium, heavy |
| **Components** | 164 instâncias | Icons, buttons, cards, menu items |

**Paleta Core Clickmax (DS real):**

| Aspecto | Valor | Notas |
|---------|-------|-------|
| **Accent** | `#d4ff00` (Neon Lime) | Cor primária da marca |
| **Backgrounds** | `#ffffff`, `#fafafa`, `#f4f5f5` | 3 níveis de superfície |
| **Dark BG** | `#131416`, `#1c2024`, `#1f2123` | Sidebar/header/overlays |
| **Text Primary** | `#131416`, `#1c2024` | Headlines e body |
| **Text Secondary** | `#697077`, `#989ea4` | Labels e muted |
| **Borders** | `#edeeef`, `#e8e8ec`, `#dee0e2` | 3 níveis de border |
| **Body Font** | Inter (400-700) | 10-14px |
| **Display Font** | Plus Jakarta Sans (700) | 16-24px |
| **Color Format** | Hex → converter para OKLCH | Manter fidelidade visual |

#### Sub-Fases:

**9.1 Scan Completo** ✅
- [x] Pages scan (78 páginas)
- [x] Components scan (0 published)
- [x] Styles scan (9 styles)
- [x] Variables scan (0 variables)
- [x] Deep scan node 7081:22278 (31K nodes)
- [x] Token extraction JSON gerado

**9.2 Análise & Normalização** ✅
- [x] Estratégia definida: catálogo multi-brand (Lendário + Clickmax side-by-side)
- [x] Mapear cores Figma → OKLCH tokens (24 primitives + 11 grays + 3 gradients)
- [x] Mapear tipografia Figma → typography tokens (Plus Jakarta Sans display, Inter body)
- [x] Normalizar spacing scale (16-step 4px-based, outliers removidos)

**9.3 Clickmax DS Creation** ✅
- [x] `workspace/ui/clickmax/brand.json` — manifesto de identidade
- [x] `workspace/ui/clickmax/tokens/primitives/colors.css` — 24 OKLCH colors + 11 grays + 3 gradients
- [x] `workspace/ui/clickmax/tokens/primitives/spacing.css` — 16 steps (0-96px)
- [x] `workspace/ui/clickmax/tokens/primitives/typography.css` — fonts, sizes, weights, radii, shadows, motion
- [x] `workspace/ui/clickmax/tokens/semantic/colors.css` — 38 semantic aliases
- [x] `workspace/ui/clickmax/tokens/semantic/surfaces.css` — 3 elevation levels
- [x] `workspace/ui/clickmax/tokens/component/button.css` — 6 variants + icon buttons
- [x] `workspace/ui/clickmax/tokens/component/card.css` — 3 padding sizes + shadows
- [x] `workspace/ui/clickmax/themes/light.css` — default theme (imports all)
- [x] `workspace/ui/clickmax/themes/dark.css` — dark overrides (inverted grays/text/borders)
- [x] `workspace/ui/clickmax/tailwind.theme.css` — @theme directive for Tailwind v4
- [x] `workspace/ui/catalog.json` atualizado: clickmax status → "complete"

**9.4 Metadata Sync** ⏳ FUTURO
- [ ] Gerar `metadata/tokens/clickmax-index.json` (quando metadata multi-brand necessário)
- [ ] Atualizar IDE rules para suportar multi-brand token lookup
- [ ] Regenerar `.cursorrules` com tokens Clickmax adicionados

**9.5 Multi-Page Extraction (opcional)** ⏳ FUTURO
- [ ] Scan de páginas específicas (login, dashboard, etc.)
- [ ] Extração de patterns de layout
- [ ] Identificação de componentes compostos (blocks)

**Checkpoint:** ✅ Clickmax DS completo com 11 files, 143 tokens, 3 tiers, light-first theme.

---

## Resumo de Entregas

| Fase | Entrega Principal | Prioridade | Status |
|------|-------------------|------------|--------|
| **0** | Governance (Prompt Injection + Sync) | P0 | ✅ DONE |
| **1** | Foundation Validation | P0 | ✅ DONE |
| **2** | Token System OKLCH (3 tiers, 7 CSS) | P1 | ✅ DONE |
| **3** | Workspace Structure (6 categorias, CVA) | P1 | ✅ DONE |
| **4** | AI Metadata Layer (6 components, 47 tokens) | P1 | ✅ DONE |
| **5** | MCP Server (8 tools, 4 handlers) | P2 | ✅ DONE |
| **6** | Registry System (5 items, Shadcn v4) | P2 | ✅ DONE |
| **7** | Brad Frost Agent (42 commands, DS+AI) | P2 | ✅ DONE |
| **8** | IDE Rules (3 files, enforcement) | P3 | ✅ DONE |
| **9** | Figma Extraction → Clickmax DS (11 files, 143 tokens) | P1 | ✅ DONE |

---

## Dependências entre Fases

```
FASE 0 (Governance) ✅
    ↓
FASE 1 (Foundation Validation) ✅
    ↓
FASE 2 (Tokens OKLCH) ✅ ──────────┐
    ↓                               │
FASE 3 (Workspace Structure) ✅ ────┤
    ↓                               │
FASE 4 (AI Metadata) ✅ ────────────┤
    ↓                               │
FASE 5 (MCP Server) ✅ ◀───────────┘
    ↓
FASE 6 (Registry System) ✅ ─┐
    ↓                         │
FASE 7 (Brad Frost) ✅ ◀─────┘
    ↓
FASE 8 (IDE Rules) ✅
    ↓
FASE 9 (Figma Extraction) ✅ ◀── DEPENDE DE: Fase 2 (tokens), Fase 4 (metadata)
    ↓
[FASE 10: Multi-Theme / Production Build] ⏳ FUTURO
```

---

## Quality Gates

### Gate 0: Governance (após Fase 0) ✅ COMPLETO
- [x] Foundations existem em `squads/design/data/design-tokens-spec.yaml`
- [x] Tier system existe em `squads/design/config.yaml`
- [x] Template de prompt injection criado
- [x] Task ds-sync-registry criada
- [x] squad.yaml e config.yaml atualizados

### Gate 1: Token Validation (após Fase 2) ✅ VALIDADO
- [x] Tokens exportam para CSS válido
- [x] OKLCH values são válidos
- [ ] Contrast ratios passam WCAG AA — pendente validação runtime
- [x] @theme funciona com Tailwind v4

### Gate 2: Structure Validation (após Fase 3) ✅ VALIDADO
- [x] Componentes importam corretamente
- [x] CVA variants funcionam (6 variants, 4 sizes)
- [x] TypeScript compila sem erros
- [x] Prompt injection presente em componentes

### Gate 3: AI-Readiness (após Fase 5) ✅ VALIDADO
- [x] MCP server responde queries — `test_mcp_tools.cjs` 8/8 PASS
- [x] Metadata cobre todos componentes — 6/6
- [x] Tools retornam dados corretos — validated per tool

### Gate 4: WCAG Compliance (contínuo) ⚠️ PARCIAL
- [ ] Contrast ratio ≥ 4.5:1 (AA) — pendente runtime
- [x] Keyboard navigation especificada em a11y contracts
- [x] Screen reader attributes definidos em metadata
- [x] Error recovery com next step em guidelines

### Gate 5: Integration (após Fase 8) ✅ VALIDADO
- [x] IDE rules criadas e aplicadas (3 files)
- [x] Registry valida contra Shadcn schema — `validate_registry.cjs` PASS
- [x] MCP skeleton válido — `validate_mcp_skeleton.cjs` PASS
- [ ] Sync task executa automaticamente — manual trigger

### Gate 6: Figma Fidelity (após Fase 9) ✅ VALIDADO
- [x] Tokens extraídos convertidos para OKLCH (24 colors + 11 grays + 3 gradients)
- [x] Paleta Clickmax mapeada 1:1 com design tokens (Neon Lime accent, neutral grays)
- [x] Typography extraída corresponde a font tokens (Plus Jakarta Sans + Inter)
- [x] Spacing scale normalizada (16 steps, 4px base, sem outliers)
- [x] Shadows mapeadas para elevation system (xs→xl + glow + glow-strong)

---

## Validation Scripts

| Script | Fase | Propósito | Status |
|--------|------|-----------|--------|
| `validate_mcp_skeleton.cjs` | 5 | Estrutura MCP (8 files) | ✅ PASS |
| `test_mcp_tools.cjs` | 5 | E2E test (8 tools) | ✅ 8/8 PASS |
| `validate_registry.cjs` | 6 | Registry Shadcn schema | ✅ PASS |
| `validate_components_metadata.cjs` | 4 | Metadata JSON | ✅ Available |
| `validate_design_manifest_drift.cjs` | 4 | Manifest/component drift | ✅ Available |
| `generate_components_metadata.cjs` | 4 | Metadata generation | ✅ Available |
| `design-system-metadata.test.js` | 4 | Unit test metadata | ✅ Available |
| `design_manifest_lib.cjs` | 4 | Manifest library | ✅ Available |
| `sync_design_manifest.cjs` | 4 | Manifest sync | ✅ Available |
| `figma-scan.cjs` | 9 | Figma pages/components/styles/variables | ✅ Available |
| `figma-deep-scan.cjs` | 9 | Figma node deep scan | ✅ Available |
| `figma-extract-tokens.cjs` | 9 | Figma token extraction → JSON | ✅ Available |

---

## Riscos e Mitigações

| Risco | Impacto | Status | Mitigação |
|-------|---------|--------|-----------|
| Tailwind v4 incompatível | HIGH | ✅ RESOLVIDO | @theme funciona |
| MCP complexity | MEDIUM | ✅ RESOLVIDO | 8 tools implementados |
| Token migration quebra UI | HIGH | ✅ RESOLVIDO | Brands side-by-side no catálogo (não sobrescreve) |
| Scope creep | MEDIUM | ✅ CONTROLADO | Fases seguidas estritamente |
| Hex → OKLCH color shift | MEDIUM | ✅ RESOLVIDO | Conversão manual verificada por frequência de uso |
| OKLCH conversion fidelity | MEDIUM | ✅ RESOLVIDO | Palette fiel ao Figma source |

---

## Próximos Passos (Fase 10+)

1. **Multi-brand metadata** — Gerar `tokens/clickmax-index.json` para MCP queries sobre Clickmax
2. **IDE rules multi-brand** — Atualizar `.cursorrules` / `.claude-rules.md` para suportar lookup em ambos DS
3. **Multi-page extraction** — Scan de páginas Figma adicionais (login, dashboard, onboarding)
4. **Component extraction** — Identificar componentes compostos do Figma e mapear para blocks
5. **Production build pipeline** — Build tool que gera CSS bundle por brand selecionado
6. **Contrast validation** — WCAG AA runtime check para ambos DS (Gate 4 pendente)

---

## Referências

- [Pesquisa: 02-research-report.md](../../../docs/research/2026-02-16-tailwind-shadcn-design-system-componentization/02-research-report.md)
- [Brad Frost DS+AI: 04-brad-frost-ai-design-systems.md](../../../docs/research/2026-02-16-tailwind-shadcn-design-system-componentization/04-brad-frost-ai-design-systems.md)
- [Recomendações: 03-recommendations.md](../../../docs/research/2026-02-16-tailwind-shadcn-design-system-componentization/03-recommendations.md)
- [Meeting Insights: meeting-insights-2026-02-16.md](../../../docs/research/2026-02-16-ux-writing-governance-ds-ai/meeting-insights-2026-02-16.md)

---

## Changelog

### 2026-02-17 - Fase 9 Completa: Clickmax DS Criado

**DS Clickmax 2025:** `workspace/ui/clickmax/` — 11 arquivos, 143 tokens
- [x] `brand.json` — Neon Lime (#D4FF00), Plus Jakarta Sans display, Inter body, light-first
- [x] `tokens/primitives/colors.css` — 24 OKLCH colors + 11 grays + 3 gradients (convertidos do Figma hex)
- [x] `tokens/primitives/spacing.css` — 16 steps (0-96px, base 4px)
- [x] `tokens/primitives/typography.css` — 10 font sizes, 5 weights, 8 radii, 8 shadows, 9 motion tokens
- [x] `tokens/semantic/colors.css` — 38 semantic aliases (bg, text, border, interactive, status, spacing, radius, shadow)
- [x] `tokens/semantic/surfaces.css` — 3 elevation levels + borders + shadows
- [x] `tokens/component/button.css` — 6 variants (primary/secondary/destructive/ghost/outline/link) + icon buttons
- [x] `tokens/component/card.css` — 3 padding sizes, 3 shadow levels
- [x] `themes/light.css` — default theme (imports all primitive/semantic/component)
- [x] `themes/dark.css` — dark overrides (inverted grays, text, borders)
- [x] `tailwind.theme.css` — @theme directive for Tailwind v4
- [x] `catalog.json` atualizado: clickmax status "extracting" → "complete"

**Key differences Clickmax vs Lendário:**

| Aspecto | Lendário | Clickmax |
|---------|----------|----------|
| Accent | Gold oklch(0.78 0.12 85) | Neon Lime oklch(0.93 0.22 118) |
| Theme | Dark-first | Light-first |
| Display font | Rajdhani | Plus Jakarta Sans |
| Body font | Inter | Inter |
| Backgrounds | Dark (#0A0A0F) | White (#FFFFFF) |
| Text primary | White | Dark (#1C2024) |
| Source | Manual (design-tokens-spec.yaml) | Figma extraction (31K nodes) |

**Validações:** Registry ✅ PASS, MCP skeleton ✅ PASS, MCP tools ✅ 8/8 PASS

### 2026-02-17 - Reorganização Multi-Brand + Fase 9

**Arquitetura Multi-Brand:**
- [x] Tokens Lendário movidos: `domains/design-system/tokens/` → `workspace/ui/lendario/tokens/`
- [x] Themes Lendário movidos: `domains/design-system/themes/` → `workspace/ui/lendario/themes/`
- [x] Tailwind theme movido: `domains/design-system/tailwind.theme.css` → `workspace/ui/lendario/`
- [x] Componentes movidos: `workspace/system/primitives/` → `workspace/ui/components/forms/` e `data-display/`
- [x] `workspace/ui/lendario/brand.json` criado (manifesto de identidade)
- [x] `workspace/ui/catalog.json` criado (índice de DS brands)
- [x] `workspace/business/comunidade-lendaria/` e `clickmax/` criados
- [x] Todas referências atualizadas: registry.json, metadata, IDE rules, MCP config, componentes
- [x] Pastas vazias removidas: `workspace/system/`, `workspace/ui/styles/`, `workspace/ui/tokens/`

**Nova estrutura:**
```
workspace/ui/              — Domínio visual (catálogo de DS)
├── lendario/              — DS Comunidade Lendária (tokens, themes, brand.json)
├── clickmax/              — DS Clickmax (a ser criado)
├── components/            — Componentes React brand-agnostic
├── catalog.json           — Índice de todos os DS brands
└── registry.json          — Shadcn registry

workspace/business/        — Domínio negócio (operacional)
├── comunidade-lendaria/   — Templates, configs
└── clickmax/              — Templates, configs
```

### 2026-02-17 - Fase 9 Iniciada: Figma Extraction

**Figma Source:** Clickmax 2025 (`WoiEWBLoUikTtDcpCLmRUl`)
- [x] Script `figma-extract-tokens.cjs` criado — extração completa com JSON output
- [x] Scan de pages (78), components (0), styles (9), variables (0)
- [x] Deep scan node 7081:22278 — 31.193 nodes, 43 frames
- [x] Token extraction: 146 cores, 76 text styles, 52 shadows, 164 component instances
- [x] JSON salvo em `extraction/figma-tokens-raw.json` (117 KB)

**Descoberta:** Paleta Clickmax é completamente diferente do Lendário:
- Accent: Neon Lime `#d4ff00` (não Gold)
- Display: Plus Jakarta Sans (não Rajdhani)
- Formato: Hex (precisa converter para OKLCH)

### 2026-02-17 - Fases 4-8 Completas (Wave 5)

**Fase 5: MCP Server**
- [x] `mcp/server.ts` v1.0.0 com 8 tools
- [x] 4 handlers: components.ts, tokens.ts, guidelines.ts, registry.ts
- [x] `mcp/config.json` com data sources e tool catalog
- [x] `test_mcp_tools.cjs` — 8/8 PASS

**Fase 6: Registry System**
- [x] `registry.json` enriquecido com `registryDependencies`, `cssVars`, `categories`
- [x] File types corrigidos para Shadcn v4 (`registry:lib`)
- [x] `validate_registry.cjs` — schema, types, dependencies, uniqueness

**Fase 7: Brad Frost Agent Update**
- [x] brad-frost.md v4.0.0 — 42 commands, 31 tasks
- [x] 6 novos comandos DS+AI (Phase 11): ai-metadata, validate-ai-readiness, mcp-status, generate-cursor-rules, registry-sync, ds-query
- [x] 4 novas tasks: ds-validate-ai-readiness.md, ds-mcp-status.md, ds-generate-cursor-rules.md, ds-query.md
- [x] voice_dna expandido, knowledge_areas +7, workflow ai_integration_flow

**Fase 8: IDE Rules & Enforcement**
- [x] `.cursorrules` — 47 tokens, 6 componentes, a11y, anti-patterns (165 linhas)
- [x] `.claude-rules.md` — 8 MCP tools, token rules, validation scripts (89 linhas)
- [x] `.vscode-settings.json` — CVA regex, CSS var paths, formatter (41 linhas)

**Gates Validados:**
- Gate 3 (AI-Readiness): ✅ 8/8 MCP tools PASS
- Gate 5 (Integration): ✅ Registry + MCP skeleton validated

### 2026-02-17 - Fases 0-3 Concluídas e Validadas (Wave 4)

**Fase 0: Governance & Foundations**
- [x] Governance documentada no README do squad
- [x] Prompt injection template + sync registry task criados

**Fase 2: Token System OKLCH**
- [x] 3-tier token hierarchy: primitives (21 OKLCH colors + spacing + typography) → semantic (colors + surfaces) → component (button + card)
- [x] Themes: dark (default) + light (overrides)
- [x] Tailwind v4 `@theme` directive em `tailwind.theme.css`

**Fase 3: Workspace Structure**
- [x] Button component com CVA (6 variants, 4 sizes) em `workspace/system/primitives/button/`
- [x] Registry.json com shadcn schema
- [x] Directory structure: ui/components/ com 6 categorias

**Fase 4: AI Metadata Layer**
- [x] 6 componentes em metadata (button, input, textarea, badge, card, form-field)
- [x] 6 individual metadata files com extended fields
- [x] Token registry com 47 tokens mapeados em 3 layers
- [x] Usage guidelines para todos 6 componentes
- [x] TypeScript types estendidos

**Cross-Validation:**
- Gate 0: COMPLETO
- Gate 1 (Token Validation): VALIDADO (3/4, contrast pendente runtime)
- Gate 2 (Structure Validation): VALIDADO (4/4)

### 2026-02-16 - Incorporação de Insights da Reunião

**Análise de 15 insights da reunião de arquitetura:**

| Insight | Status | Ação |
|---------|--------|------|
| #1 Governance vs Execution | ✅ JÁ EXISTE | Tier system em config.yaml |
| #2 Foundations invisíveis | ✅ JÁ EXISTE | design-tokens-spec.yaml |
| #3 Prompt injection | ✅ CRIADO | component-prompt-injection-tmpl.md |
| #5 Engenharia reversa | — | Metodologia, não artefato |
| #7 Sync obrigatório | ✅ CRIADO | ds-sync-registry.md |
| #9 WCAG quality gates | ✅ JÁ EXISTE | ds-accessibility-wcag-checklist.md |

---

*Criado: 2026-02-16*
*Atualizado: 2026-02-17 — Fases 0-9 completas. Catálogo: Lendário (dark/gold) + Clickmax (light/lime)*
*Squad: Design*
*Agents: Architect (The Architect), Brad Frost, integration-validator*
