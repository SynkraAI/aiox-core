# Architect Blueprint: Epic Token Optimization

**Author:** @architect (Aria)
**Date:** 2026-02-22
**Version:** 2.0 (pos-Codex Critical Analysis)
**Status:** Blueprint Ready for @pm
**Origin:** Video "Anthropic killed Tool calling" (AI Jason) + 5 tech-search reports + Codex critical review
**Handoff To:** @pm (Morgan) para criar EPIC formal + @sm (River) para draftar stories

---

## Changelog v1.0 -> v2.0

| Mudanca | Origem | Impacto |
|---------|--------|---------|
| Meta ajustada para 25-45% (conservadora) | Codex CRITICO: sem baseline empirico | Menos risco de overpromise |
| Nova story TOK-1.5 (Baseline Metrics) | Codex ALTO-2: medir antes de otimizar | +2-3 pontos, validacao real |
| TOK-2 reformulada: Capability-Aware | Codex CRITICO-1: Claude Code != API direta | De 3 para 5 pts, fallback incluso |
| TOK-3 scoped: apenas native/CLI | Codex CRITICO-2: PTC+MCP nao funciona | Escopo explicito, sem false promises |
| TOK-4 split em TOK-4A + TOK-4B | Codex ALTO-1: inconsistencia blueprint vs recs | Handoff e Examples sao stories distintas |
| TOK-6 reestimada | Codex: subestimada | De 2 para 3-5 pts |
| ADR-7 adicionado | Codex: capability gate | Runtime detection obrigatorio |
| 4 riscos adicionados | Codex secao 3.6 | Cobertura de risco ampliada |

---

## 1. Vision

Reduzir o overhead de tokens do AIOS em **25-45%** (de ~17K-34K para ~10K-25K tokens por sessao) combinando features avancadas do Anthropic numa arquitetura unificada alinhada ao modelo L1-L4 existente.

**Target ceiling (best case validado por telemetria):** 45-55%
**Meta conservadora (sem baseline):** 25-45%

### Problema Atual

| Componente | Tokens Estimados | % do Context (200K) |
|-----------|-----------------|---------------------|
| MCP tool schemas (EXA, Context7, Apify, Playwright) | ~15K-25K | 7.5-12.5% |
| Agent/Skill definitions | ~5K-8K | 2.5-4% |
| CLAUDE.md + rules | ~3K-5K | 1.5-2.5% |
| **Total overhead** | **~17K-34K** | **8.5-17%** |

### Alvo (Conservador)

| Componente | Tokens Apos | Reducao |
|-----------|------------|---------|
| MCP tools (deferred/disciplina) | ~3K-8K | -50-85% |
| Agent/Skills (deferred quando suportado) | ~3K-5K | -30-50% |
| CLAUDE.md + rules (ja otimizado) | ~3K-5K | 0% |
| **Total otimizado** | **~10K-25K** | **25-45%** |

> **Nota Codex:** Estimativas de 85% MCP vem de benchmarks Anthropic com 50+ tools. AIOS tem ~20-30 tools. Ganhos reais dependem de baseline (TOK-1.5). Escala nao e linear — ha overhead fixo e ganhos marginais decrescentes.

---

## 2. Research Foundation

5 pesquisas tech-search fundamentam este blueprint:

| # | Pesquisa | Key Insight | Impacto |
|---|---------|------------|---------|
| 1 | **Programmatic Tool Calling** | 1 code block = N tools; resultados nao entram no context | -37% tokens em workflows complexos |
| 2 | **Tool Search + Deferred Loading** | Tool search (~500 tokens) substitui carregar todos os schemas | -85% em MCP (77K -> 8.7K) |
| 3 | **Token Optimization Architecture** | Roadmap 6 stories/3 waves com L1-L4 alignment | 45-55% reducao total |
| 4 | **Tool Use Examples (input_examples)** | Exemplos concretos em tool schemas | +18pp accuracy (72% -> 90%) |
| 5 | **Dynamic Filtering** | Filtrar payloads antes de entrar no context | -24% em web fetch, ate 98%+ em structured data |

**Validacao externa (Codex):** Docs oficiais Anthropic/Claude Code confirmam features. Constraint principal: Claude Code abstrai tool loading — controle fino nao e equivalente a API direta.

---

## 3. Architecture: 3-Tier Tool Mesh

```
                    ┌─────────────────────────────────────┐
                    │         AIOS Tool Mesh               │
                    ├─────────────────────────────────────┤
                    │                                      │
  TIER 1 (Always)   │  Read, Write, Edit, Bash, Grep,     │  ~3K tokens
  L1/L2 Framework   │  Glob, Task, Skill                   │  Always loaded
                    │                                      │
                    ├──────────────────────────────────────┤
                    │                                      │
  TIER 2 (Deferred) │  Agent commands (@dev, @qa, etc.)   │  ~500 tokens (search tool)
  L3 Project        │  SYNAPSE domains                     │  Load on activation
                    │  Project-specific skills             │  Future (Issue #19445)
                    │                                      │
                    ├──────────────────────────────────────┤
                    │                                      │
  TIER 3 (Deferred) │  EXA, Context7, Apify, Playwright   │  ~500 tokens (search tool)
  L4 External       │  MCP servers via Docker Gateway      │  Load via tool_search
                    │  + input_examples injection          │  Available NOW (auto mode)
                    │                                      │
                    └──────────────────────────────────────┘

  Cross-Cutting:
  ┌──────────────────────────────────────────────────────────┐
  │  Programmatic Tool Calling (PTC)                          │
  │  - Batch multi-tool workflows em single code execution    │
  │  - Resultados intermediarios ficam no sandbox             │
  │  - SCOPED: Native/CLI tools only (QA Gate, validation)    │
  │  - RESTRICTION: MCP tools NOT supported via PTC           │
  └──────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────┐
  │  Dynamic Filtering                                        │
  │  - Filtrar payloads grandes antes de entrar no context    │
  │  - Applies to: web fetch, MCP responses, API results      │
  │  - Client-side + server-side (complementares)             │
  └──────────────────────────────────────────────────────────┘
```

### Tool Mesh x Task System (AIOS-Specific)

O Tool Mesh se integra ao task system existente do AIOS em 3 niveis:

```
┌─────────────────────────────────────────────────────────────┐
│  NIVEL 1: Task Frontmatter (declarativo)                     │
│                                                              │
│  ---                                                         │
│  name: qa-gate                                               │
│  agent: qa                                                   │
│  requires: [jest, coderabbit]         # runtime deps         │
│  tools: [playwright]                  # MCP tools needed     │
│  execution_mode: programmatic         # NEW: PTC hint        │
│  tool_profile: qa-review              # NEW: registry ref    │
│  ---                                                         │
│                                                              │
│  Task frontmatter declara O QUE precisa.                     │
│  Tool Registry resolve COMO carregar.                        │
├─────────────────────────────────────────────────────────────┤
│  NIVEL 2: Agent Tool Profile (registry-driven)               │
│                                                              │
│  Cada agent tem um tool_profile no registry que define:      │
│  - always_loaded: tools que o agent sempre precisa           │
│  - frequently_used: tools promovidos de deferred             │
│  - deferred: tools que o agent pode precisar (via search)    │
│  - programmatic: tools que rodam em batch via PTC            │
│                                                              │
│  Agent activation = load profile from registry               │
├─────────────────────────────────────────────────────────────┤
│  NIVEL 3: Squad Extension (L4 overlay)                       │
│                                                              │
│  squads/{name}/tool-overrides.yaml                           │
│  - Squads podem adicionar MCP servers proprios               │
│  - Squads podem override defer policy para seus workflows    │
│  - Squads herdam o registry base + overlay customizations    │
│  - Squads podem ter tasks com tool requirements proprios     │
│                                                              │
│  Squad = Project overlay on top of framework registry        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Tool Registry (ADR-1)

### Decision: Unified Tool Registry em L3

**Localizacao:** `.aios-core/data/tool-registry.yaml`

**Justificativa:**
1. Projetos diferentes tem MCPs e tools diferentes
2. Consistente com `entity-registry.yaml` (mesmo layer, mesmo pattern)
3. Framework tools (L1-L2) sao estaticos; project tools (L3-L4) variam
4. Registry serve como single source of truth para defer policy, keywords e token cost
5. Squads podem overlay via `squads/{name}/tool-overrides.yaml`

### Schema Proposto (v2.0)

```yaml
# .aios-core/data/tool-registry.yaml
version: "1.0"
metadata:
  lastUpdated: "2026-02-22"
  runtimeDetection: true  # ADR-7: capability gate

# Agent tool profiles
profiles:
  dev:
    always_loaded: [Read, Write, Edit, Bash, Grep, Glob]
    frequently_used: [get-library-docs]
    deferred: [web_search_exa, playwright_*]
    programmatic: [run_lint, run_typecheck, run_tests]

  qa:
    always_loaded: [Read, Bash, Grep, Glob]
    frequently_used: [playwright_navigate, playwright_screenshot]
    deferred: [web_search_exa, get-library-docs]
    programmatic: [run_test_suite, coverage_analysis]

  architect:
    always_loaded: [Read, Grep, Glob, WebSearch]
    frequently_used: [web_search_exa]
    deferred: [get-library-docs, playwright_*]

  analyst:
    always_loaded: [Read, Grep, Glob, WebSearch]
    frequently_used: [web_search_exa]
    deferred: [get-library-docs, apify_*]

  devops:
    always_loaded: [Bash, Read, Write, Grep]
    deferred: [web_search_exa, playwright_*]

# Tool catalog
tools:
  # Tier 1 - Always Loaded (L1/L2)
  - name: Read
    tier: 1
    layer: L1
    defer: false
    tokenCost: ~200
    category: file-operations

  # Tier 3 - Deferred MCP (L4)
  - name: exa_web_search
    tier: 3
    layer: L4
    defer: true
    tokenCost: ~3000
    keywords: ["search", "web", "research", "find online"]
    mcp_server: docker-gateway
    input_examples:
      - query: "React server components best practices 2026"
        type: "keyword"

# Task tool bindings (NEW - links tasks to tools)
task_bindings:
  qa-gate:
    required: [jest]
    optional: [coderabbit, playwright]
    execution_mode: programmatic
  dev-develop-story:
    required: [Read, Write, Edit, Bash]
    optional: [get-library-docs, code-intel]
    execution_mode: direct
  research:
    required: [WebSearch]
    optional: [web_search_exa, apify_*]
    execution_mode: programmatic
```

### Squad Override Pattern

```yaml
# squads/my-squad/tool-overrides.yaml
extends: .aios-core/data/tool-registry.yaml
overrides:
  profiles:
    dev:
      frequently_used: [custom-mcp-tool]
  tools:
    - name: custom-mcp-tool
      tier: 3
      layer: L4
      defer: true
      mcp_server: custom-server
  task_bindings:
    squad-specific-task:
      required: [custom-mcp-tool]
```

---

## 5. Compatibility Matrix (Critical)

| Feature A | Feature B | Compatible? | Workaround |
|-----------|-----------|-------------|------------|
| Tool Search | Input Examples | **NO** | Use um por tool, nao ambos |
| PTC | MCP Tools | **NOT YET** | Direct call para MCP, PTC para native |
| PTC | Structured Outputs | **NO** | Sem strict:true quando PTC ativo |
| PTC | tool_choice forced | **NO** | Nao forcar tool selection com PTC |
| Dynamic Filtering | PTC | **YES** | Complementares |
| Tool Search | Deferred Loading | **YES** | Designed to work together |

### Constraints Praticas (Codex additions)

| Constraint | Impacto | Mitigacao |
|-----------|---------|-----------|
| Claude Code != API direta (defer control limitado) | TOK-2 precisa fallback | Capability detection + MCP discipline |
| Latencia do tool_search (hop extra) | UX pode degradar | Max 2 searches per turn, latencia < 500ms |
| Metadata quality afeta search accuracy | Tools mal descritos nao sao encontrados | CI validation do registry (names, keywords) |
| Beta features mudam entre releases | Lock-in risk | Capability gate (ADR-7), feature flags |

---

## 6. Story Roadmap (v2.0 — pos-Codex)

### Wave 1: Foundation (P0) — ~12-13 pontos

| Story | Titulo | Pontos | Descricao |
|-------|--------|--------|-----------|
| **TOK-1** | Unified Tool Registry Creation | 3-5 | Criar `.aios-core/data/tool-registry.yaml` com schema de 3 tiers, profiles por agent, task bindings, squad override pattern, mapeamento L1-L4, keywords e token cost estimado. CI validation para nome/keywords quality. |
| **TOK-1.5** | Baseline Metrics per Workflow | 2-3 | **NOVO.** Medir tokens reais por workflow (SDC, QA Loop, Spec Pipeline, conversacao interativa) usando NOG-11 token source data. Documentar baseline em `.aios/analytics/token-baseline.json`. Sem otimizacao — apenas medicao. |
| **TOK-2** | Deferred/Search Capability-Aware | 5 | **REFORMULADO.** Detectar capabilities do runtime (Claude Code auto-mode tool search vs API direta). Se defer disponivel: configurar `defer_loading: true` para MCP. Se nao: aplicar MCP discipline (desabilitar servers nao necessarios) + CLAUDE.md guidance. AC: latencia < 500ms, max 2 searches/turn, fallback funcional. |

**Entregaveis Wave 1:**
- Tool registry YAML com todos os tools catalogados + profiles + task bindings
- Baseline de tokens por workflow ANTES de otimizar
- Deferred loading ou MCP discipline ativo (capability-dependent)

**Wave Gate:** Baseline medido, registry criado, capability detection funcional.

### Wave 2: Optimization (P1) — ~11-15 pontos

| Story | Titulo | Pontos | Descricao |
|-------|--------|--------|-----------|
| **TOK-3** | PTC for Native/CLI Bulk Operations | 5 | **SCOPED.** Anotar tasks com `execution_mode: programmatic` para fluxos NATIVOS: QA Gate (7 checks), entity validation (batch scan), research aggregation. **Explicito: NAO inclui MCP tools.** Criar task template PTC-enabled. |
| **TOK-4A** | Agent Handoff Context Strategy | 3-5 | **NOVO (split).** Implementar pattern Swarm-like: on agent switch, compact previous agent context + load new agent profile from registry. Handoff artifact template. Integration com SYNAPSE context tracking. AC: context nao acumula 3+ agent personas. |
| **TOK-4B** | Input Examples Registry + Injection | 3-5 | **NOVO (split).** Criar `.aios-core/data/mcp-tool-examples.yaml` com input_examples para MCP tools complexos. Client-layer injection (MCP spec nao suporta nativo). Extender entity-registry com invocationExamples. AC: top-10 tools mais usados com examples. |

**Entregaveis Wave 2:**
- QA Gate e entity validation rodando via PTC (native tools)
- Agent switches produzem context limpo (nao acumulativo)
- input_examples para top-10 MCP tools

**Wave Gate:** PTC funcional para 3+ workflows, handoff testado em SDC completo.

### Wave 3: Intelligence (P2) — ~6-8 pontos

| Story | Titulo | Pontos | Descricao |
|-------|--------|--------|-----------|
| **TOK-6** | Dynamic Filtering Generalizado | 3-5 | **REESTIMADO.** Aplicar pattern de dynamic filtering para MCP responses grandes (Apify scrapers, database queries). Client-side schema-aware filtering + server-side code execution filtering. Configurar filtros por tipo de response no tool registry. |
| **TOK-5** | Tool Usage Analytics Pipeline | 3 | Coletar metricas de uso de tools por sessao (quais tools, frequencia, token cost real vs baseline). Comparar com TOK-1.5 baseline. Output em `.aios/analytics/tool-usage.json`. Recomendacoes automaticas de promote/demote. |

**Entregaveis Wave 3:**
- Payloads grandes filtrados antes de entrar no context
- Dashboard de uso com comparacao baseline vs otimizado
- Validacao empirica da meta 25-45%

**Wave Gate:** Telemetria valida reducao real. Meta 25-45% confirmada ou ajustada.

---

## 7. Dependencies

### Pre-requisitos (ja completos)

| Dependency | Status | Relevancia |
|-----------|--------|-----------|
| NOG-22 (Agent Skill Discovery) | Done | Mapa tool-agent que alimenta registry profiles |
| NOG-18 (SYNAPSE Native-First) | Done | Foundation para context integration e handoff |
| NOG-11 (Token Source Discovery) | Done | Habilita baseline (TOK-1.5) e analytics (TOK-5) |
| BM-1 (Permission Deny Rules) | Done | L1-L4 model enforcement |
| BM-3 (Pre-Commit Framework Guard) | Done | Protection de framework files |

### Dependencias Internas (novas)

| Dependency | Story | Relevancia |
|-----------|-------|-----------|
| TOK-1 (Registry) | Blocks TOK-2, TOK-4A, TOK-4B | Registry e pre-requisito |
| TOK-1.5 (Baseline) | Informs TOK-3, TOK-5 | Sem baseline, sem validacao |
| BM-5 (Entity Layer Classification) | Enriches TOK-1 | L1-L4 no entity registry |

### Dependencias Externas (riscos)

| Risk | Probabilidade | Impacto | Mitigacao |
|------|--------------|---------|-----------|
| Claude Code nao expoe `defer_loading` control | Media-Alta | Alto | Capability detection + MCP discipline fallback |
| Skills deferred loading nao ship (Issue #19445) | Media | Medio | Preparar metadata agora; ativar quando disponivel |
| PTC + MCP incompatibility persiste | Alta | Medio | Escopo TOK-3 ja exclui MCP |
| Beta feature behavior muda entre releases | Media | Medio | Capability gate (ADR-7), feature flags |

---

## 8. Success Metrics (v2.0 — conservador)

| Metrica | Baseline (TOK-1.5) | Target Conservador | Target Ceiling | Medicao |
|---------|--------------------|--------------------|----------------|---------|
| Token overhead por sessao | Medir | -25% | -45% | TOK-5 vs TOK-1.5 |
| MCP schema tokens | Medir | -50% | -85% | Antes/depois defer |
| QA Gate token cost | Medir | -30% | -60% | PTC vs direct |
| Tool selection accuracy | Medir | +10pp | +18pp | With input_examples |
| Context utilization | Medir | -2pp overhead | -5pp overhead | % of 200K |

> **Nota Codex:** Todos os targets dependem de baseline real (TOK-1.5). Numeros acima sao hipoteses informadas por benchmarks externos, nao promises.

---

## 9. Architectural Decisions Summary

| # | Decision | Rationale | Status |
|---|---------|-----------|--------|
| ADR-1 | Tool Registry em L3 (`data/tool-registry.yaml`) | Consistente com entity-registry; projetos variam | Confirmado |
| ADR-2 | 3-Tier Tool Mesh (Always/Deferred/External) | Alinha com L1-L4 boundary model existente | Confirmado |
| ADR-3 | PTC para native tools ONLY, Direct para MCP | PTC+MCP incompativel; escopo explicito | **Reforçado (Codex)** |
| ADR-4 | input_examples no client layer (nao no MCP server) | MCP spec nao suporta nativo; AIOS injeta | Confirmado |
| ADR-5 | Tool Search para MCP discovery, Examples para accuracy | Features sao incompativeis entre si | Confirmado |
| ADR-6 | Dynamic Filtering como pattern geral | Generaliza alem de web fetch | Confirmado |
| ADR-7 | **Capability gate por runtime** | **NOVO (Codex).** Claude Code != API direta. Detectar capabilities antes de ativar features. Fallback obrigatorio. | **Novo** |

---

## 10. Risk Matrix (v2.0 — expandida)

| Risk | Prob | Impacto | Mitigacao | Origem |
|------|------|---------|-----------|--------|
| Claude Code nao expoe defer control | Media-Alta | Alto | MCP discipline + CLAUDE.md guidance | Codex CRITICO-1 |
| PTC+MCP persiste bloqueado | Alta | Medio | TOK-3 ja exclui MCP | Codex CRITICO-2 |
| Baseline real difere dos benchmarks | Media | Alto | TOK-1.5 mede antes; metas ajustaveis | Codex ALTO-2 |
| Regressao de UX por tool search latencia | Media | Medio | Max 2 searches/turn, < 500ms | Codex MEDIO-1 |
| Registry drift (catalogo diverge do real) | Media | Baixo | CI validation (entity-registry pattern) | Codex 3.6 |
| Falsa economia sem medir output tokens | Baixa | Medio | TOK-1.5 mede input E output | Codex 3.6 |
| Feature flag/beta behavior muda | Media | Medio | Capability gate, versionamento | Codex 3.6 |
| Skills deferred nao ship | Media | Medio | Metadata ready; ativar quando suportado | Blueprint v1.0 |

---

## 11. Tool Mesh x Task System x Squads

### Como o Tool Mesh se conecta ao AIOS

O AIOS e **Task-First**: tasks definem O QUE fazer, agents executam. O Tool Mesh adiciona a camada de COMO carregar tools para cada task/agent/squad:

```
Task File (.aios-core/development/tasks/*.md)
  │
  ├── frontmatter: requires, tools, execution_mode, tool_profile
  │     └── "Quais tools essa task precisa?"
  │
  ├── Tool Registry (.aios-core/data/tool-registry.yaml)
  │     ├── profiles: tool set por agent
  │     ├── task_bindings: tools por task
  │     └── catalog: metadata de cada tool (tier, layer, defer, keywords)
  │           └── "Como carregar cada tool?"
  │
  └── Squad Override (squads/{name}/tool-overrides.yaml)
        ├── extends: registry base
        ├── adiciona: MCP servers custom do squad
        └── override: defer policy para workflows do squad
              └── "Customizacoes do squad"
```

### Fluxo de Resolucao

```
1. Agent ativado (@dev)
   → Load agent profile from registry (always + frequently + deferred lists)

2. Task executada (*develop story-123)
   → Read task frontmatter (requires, tools, execution_mode)
   → Merge task tools com agent profile
   → Se squad ativo: overlay squad overrides

3. Tool loading decision
   → Tier 1 (always): ja carregado
   → Tier 2/3 (deferred): tool_search se necessario
   → PTC eligible: batch execution para tasks marcadas programmatic

4. Runtime capability check (ADR-7)
   → Claude Code auto-mode? → Use tool_search nativo
   → API direta? → Use defer_loading API
   → Nenhum? → Fallback para MCP discipline
```

---

## 12. Handoff Notes para @pm (v2.0)

1. **Epic name:** `epic-token-optimization` (prefix TOK-)
2. **Total estimado:** ~28-38 pontos, **8 stories**, 3 waves
3. **Mudanca principal vs v1.0:** +2 stories (TOK-1.5 baseline + TOK-4A/4B split), metas conservadoras
4. **Wave 1 e imediata** — Registry + Baseline + Deferred/Discipline
5. **Wave 2 depende de Wave 1** (registry + baseline necessarios)
6. **Wave 3 fecha o loop** — Filtering + Analytics validam as metas
7. **Pesquisas de referencia:** `docs/research/2026-02-22-*` (5 primarias + 6 secundarias)
8. **Codex Critical Analysis:** `docs/stories/epics/epic-token-optimization/CODEX-CRITICAL-ANALYSIS.md`
9. **Video original:** `.etl-output/youtube/3wglqgskzjQ/` (AI Jason)

### Condicoes de GO (validadas por Codex + Architect)

| # | Condicao | Status |
|---|---------|--------|
| 1 | Meta ajustada para 25-45% (conservadora) | Incorporado |
| 2 | Split TOK-4 em 4A + 4B | Incorporado |
| 3 | PTC+MCP como restricao explicita | Incorporado (ADR-3 reforçado) |
| 4 | Capability gate por runtime | Incorporado (ADR-7 novo) |
| 5 | Baseline antes de otimizar | Incorporado (TOK-1.5 novo) |

**Decisao arquitetural: GO**

---

*Blueprint v2.0 — Aria, arquitetando o futuro*
*Revisado apos Codex Critical Analysis*
*CLI First | Task-First | Constitution*
