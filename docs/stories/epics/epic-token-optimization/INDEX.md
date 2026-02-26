# Epic: Token Optimization — Intelligent Tool Loading

## Overview

Reduzir o overhead de tokens do AIOS em **25-45%** (conservador) combinando features avancadas do Anthropic (Tool Search, Deferred Loading, Programmatic Tool Calling, Dynamic Filtering, Input Examples) numa arquitetura unificada de **3-Tier Tool Mesh** alinhada ao modelo L1-L4 existente.

**Principios:**
- `Measure First = Baseline antes de otimizar (TOK-1.5)`
- `Capability-Aware = Detectar runtime antes de ativar features (ADR-7)`
- `Task-First = Tool Mesh e enhancement layer, nao muda semantica das tasks`

## Architecture: 3-Tier Tool Mesh

| Tier | Layer | Loading | Conteudo | Tokens |
|------|-------|---------|----------|--------|
| **1** (Always) | L1/L2 | Always loaded | Read, Write, Edit, Bash, Grep, Glob, Task, Skill | ~3K |
| **2** (Deferred) | L3 | On activation | Agent commands, SYNAPSE domains, project skills | ~500 (search) |
| **3** (Deferred) | L4 | Via tool_search | EXA, Context7, Apify, Playwright (MCP Docker Gateway) | ~500 (search) |

**Cross-Cutting:** PTC (native tools only) + Dynamic Filtering (all payloads)

## Decisoes de Escopo

### TOK-7 (RegistryProvider) — FORA DO EPIC (Backlog)

**Decisao:** Manter RegistryProvider no backlog (Opcao A), reavaliar apos Wave 1 gate.

**Racional:**
- Code-intel retorna `null` em 15+ tasks (zero providers configurados), mas fallback graceful garante zero erros/blocking
- RegistryProvider cobriria 5/8 primitivas (~70% use cases) usando Entity Registry como fonte
- Nao bloqueia Wave 1-3 — zero urgencia operacional
- Construir sobre fatos medidos (TOK-1 + TOK-1.5) e mais seguro

**Trigger de reentrada:** Reavaliar apos TOK-1 (Tool Registry) + TOK-1.5 (Baseline) Done + validacao tecnica.

**Backlog item:** [1740200000001](../../backlog.md) — Status: BLOCKED by Epic TOK W1 gate.

**Referencia:** [Handoff Architect-to-PM](../../handoffs/handoff-architect-to-pm-codeintel-tok-integration.md)

## Documents

| Document | Purpose |
|----------|---------|
| [Architect Blueprint v2.0](ARCHITECT-BLUEPRINT.md) | Full architecture, ADRs, story roadmap, tool-task-squad integration |
| [Codex Critical Analysis](CODEX-CRITICAL-ANALYSIS.md) | Independent critical review with GO conditions |
| [Codex-to-Architect Handoff](CODEX-TO-ARCHITECT-HANDOFF.md) | Replanejamento sugerido e veredito |
| [Handoff: Code-Intel + TOK Integration](../../handoffs/handoff-architect-to-pm-codeintel-tok-integration.md) | RegistryProvider analysis, story adjustments, Definition of Ready |
| [Research: Programmatic Tool Calling](../../../research/2026-02-22-programmatic-tool-calling/) | PTC architecture, CodeAct paper, benchmarks |
| [Research: Tool Search + Deferred Loading](../../../research/2026-02-22-tool-search-deferred-loading/) | 85% token reduction, 3-tier hybrid model |
| [Research: Token Optimization Architecture](../../../research/2026-02-22-aios-token-optimization-architecture/) | Multi-framework comparison, unified roadmap |
| [Research: Tool Use Examples](../../../research/2026-02-22-tool-use-examples/) | input_examples, +18pp accuracy |
| [Research: Dynamic Filtering](../../../research/2026-02-22-dynamic-filtering-web-fetch/) | Filter-then-reason paradigm |

## Stories

### Wave 1: Foundation (P0)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [TOK-1](story-TOK-1-unified-tool-registry.md) | Unified Tool Registry Creation | @dev + @architect | 3-5 | ✅ Done | - |
| [TOK-1.5](story-TOK-1.5-baseline-metrics.md) | Baseline Metrics per Workflow | @dev + @analyst | 2-3 | ✅ Done | - |
| [TOK-2](story-TOK-2-deferred-search-capability-aware.md) | Deferred/Search Capability-Aware | @dev + @devops | 5 | ✅ Done | TOK-1 (Done) |

### Wave 2: Optimization (P1)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [TOK-3](story-TOK-3-ptc-native-bulk-ops.md) | PTC for Native/CLI Bulk Operations | @dev | 5 | ✅ Done | TOK-1.5 (Done) |
| [TOK-4A](story-TOK-4A-agent-handoff-context-strategy.md) | Agent Handoff Context Strategy | @dev + @architect | 3-5 | ✅ Done (Phase 1) | TOK-1 (Done) |
| [TOK-4B](story-TOK-4B-input-examples-registry.md) | Input Examples Registry + Injection | @dev | 3-5 | ✅ Done | TOK-1 (Done) |

### Wave 3: Intelligence (P2)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [TOK-6](story-TOK-6-dynamic-filtering.md) | Dynamic Filtering Generalizado | @dev | 3-5 | ✅ Done | TOK-2 (Done) |
| [TOK-5](story-TOK-5-tool-usage-analytics.md) | Tool Usage Analytics Pipeline | @dev + @analyst | 3 | ✅ Done | TOK-1.5 (Done) |

## Totals

| Metric | Value |
|--------|-------|
| **Total Stories** | 8 |
| **Total Points** | ~28-38 |
| **Waves** | 3 |
| **Target (Conservador)** | 25-45% token reduction |
| **Target (Ceiling)** | 45-55% (pending telemetry validation) |
| **Origin** | AI Jason video + 5 tech-search reports + Codex critical review |

## Executor Assignment

| Story | Executor | Quality Gate | Quality Gate Tools |
|-------|----------|-------------|-------------------|
| TOK-1 | @dev | @architect | [schema_validation, registry_consistency] |
| TOK-1.5 | @dev + @analyst | @architect | [data_validation, baseline_completeness] |
| TOK-2 | @dev | @architect | [capability_detection, fallback_validation] |
| TOK-3 | @dev | @qa | [ptc_validation, token_comparison] |
| TOK-4A | @architect | @qa | [context_measurement, handoff_integrity] |
| TOK-4B | @dev | @architect | [example_accuracy, injection_validation] |
| TOK-5 | @dev | @architect | [analytics_accuracy, baseline_comparison] |
| TOK-6 | @dev | @qa | [filter_accuracy, payload_reduction] |

## Dependency Graph

```
TOK-1 (Registry) ─────┬──→ TOK-2 (Deferred/Search)
                       ├──→ TOK-4A (Agent Handoff)
                       └──→ TOK-4B (Input Examples)
                                                     ↘
TOK-1.5 (Baseline) ───┬──→ TOK-3 (PTC Bulk Ops)     TOK-6 (Dynamic Filtering)
                       └──→ TOK-5 (Analytics) ←───── TOK-6
```

## Wave Gates

| Wave | Gate Criteria | GO Threshold | NO-GO Threshold |
|------|--------------|-------------|-----------------|
| W1 | Registry criado + baseline medido + capability detection funcional | Todas as 3 stories Done + testes passam + baseline JSON valido | Qualquer story com FAIL no QA gate OU baseline impossivel de medir |
| W2 | PTC funcional para 3+ workflows + handoff testado em SDC + top-10 examples | Pelo menos 20% reducao medida vs baseline em 1+ workflow | PTC nao reduz tokens OU handoff perde dados criticos |
| W3 | Telemetria valida reducao real + meta 25-45% confirmada ou ajustada | 25%+ reducao confirmada OU meta ajustada com justificativa | Nenhuma reducao mensuravel apos todas as otimizacoes |

**Reavaliar TOK-7 (RegistryProvider):** Apos W1 gate PASS, avaliar se RegistryProvider entra em W2 ou permanece no backlog.

## Compatibility Constraints (Critical)

| Feature A | Feature B | Compatible? |
|-----------|-----------|-------------|
| Tool Search | Input Examples | **NO** (use one per tool) |
| PTC | MCP Tools | **NOT YET** (native only) |
| PTC | Structured Outputs | **NO** |
| Dynamic Filtering | PTC | **YES** |
| Tool Search | Deferred Loading | **YES** |

## ADRs

| # | Decision | Rationale |
|---|---------|-----------|
| ADR-1 | Tool Registry em L3 | Consistente com entity-registry |
| ADR-2 | 3-Tier Tool Mesh | Alinha com L1-L4 boundary model |
| ADR-3 | PTC native ONLY | PTC+MCP incompativel |
| ADR-4 | input_examples client-layer | MCP spec nao suporta |
| ADR-5 | Search para discovery, Examples para accuracy | Features incompativeis |
| ADR-6 | Dynamic Filtering generalizado | Alem de web fetch |
| ADR-7 | Capability gate por runtime | Claude Code != API direta |

## Boundary Impact (L1-L4)

| Story | Paths Afetados | Layer | Deny/Allow Status | Acao Necessaria |
|-------|---------------|-------|-------------------|----------------|
| TOK-1 | `.aios-core/data/tool-registry.yaml` | L3 | ALLOW (`data/**`) | Nenhuma — path permitido |
| TOK-1.5 | `.aios/analytics/token-baseline.json` | L4 | N/A (gitignored) | Nenhuma |
| TOK-2 | `.mcp.json` (project), `~/.claude.json` (global) | L3/Global | Project: permitido. Global: fora do repo | Definir scope: project vs global |
| TOK-3 | `.aios-core/development/tasks/*.md` | L2 | DENY (tasks/**) | **REQUER** `frameworkProtection: false` ou allow exception |
| TOK-4A | `.aios-core/development/templates/agent-handoff-tmpl.yaml` | L2 | DENY (templates/**) | **REQUER** allow exception ou path alternativo |
| TOK-4B | `.aios-core/data/mcp-tool-examples.yaml`, `.aios-core/data/entity-registry.yaml` | L3 | ALLOW (`data/**`) | Nenhuma — paths permitidos |
| TOK-5 | `.aios/analytics/tool-usage.json` | L4 | N/A (gitignored) | Nenhuma |
| TOK-6 | `.aios-core/core/filters/` **(PROPOSTO)** | L1 | **DENY** (`core/**`) | **VIOLACAO** — mover para path permitido |

**Nota importante:** `.aios-core/core/**` tem deny rules MAS com allow exceptions para `core/config/schemas/**` e `core/config/template-overrides.js`. TOK-6 precisa de path alternativo (ex: `.aios-core/utils/filters/`) ou nova allow exception aprovada pelo @architect.

## Scope Source of Truth

| Story | Scope | Justificativa |
|-------|-------|---------------|
| TOK-1 | Project (`.aios-core/data/`) | Registry varia por projeto |
| TOK-2 | **Project + Global** | `.mcp.json` (projeto) + `~/.claude.json` (global Docker MCPs) |
| TOK-3 | Project (tasks L2) | Tasks sao framework — requer contributor mode |
| TOK-4A | Project (templates L2 + runtime L4) | Template framework + handoffs runtime |
| TOK-4B | Project (data L3) | Examples e registry sao projeto-level |
| TOK-5 | Runtime (`.aios/` L4) | Analytics sao runtime, gitignored |
| TOK-6 | **TBD** — path de implementacao depende de boundary resolution | Mover de `core/` para path permitido |

## Definition of Ready (obrigatorio para cada story)

Uma story TOK so pode ir para `Ready` se:

1. Todos os paths referenciados existem no repo OU estao claramente marcados como "a criar"
2. ACs sao testaveis e possuem comando/metodo de validacao explicito
3. Dependencias e bloqueios estao explicitados com story IDs
4. Boundary impact esta classificado e aprovado (L1-L4, deny/allow)
5. Scope source of truth definido (project vs global)
6. Sizing foi revisado com justificativa tecnica
7. Nenhum path de criacao/edicao conflita com deny rules sem excecao aprovada

## Risk Matrix

| Risk | Prob | Impact | Mitigation |
|------|------|--------|------------|
| Claude Code defer control limitado | Media-Alta | Alto | Capability detection + MCP discipline |
| PTC+MCP bloqueado | Alta | Medio | TOK-3 exclui MCP |
| Baseline difere de benchmarks | Media | Alto | TOK-1.5 mede antes; metas ajustaveis |
| Tool search latencia | Media | Medio | Max 2 searches/turn, < 500ms |
| Registry drift | Media | Baixo | CI validation |
| Beta features mudam | Media | Medio | Capability gate, versionamento |
| TOK-3/TOK-4A modificam paths L2 protegidos | Alta | Alto | Contributor mode OU allow exception antes de implementar |
| TOK-6 propoe path L1 bloqueado (`core/filters/`) | Alta | Alto | Mover para `.aios-core/utils/filters/` ou similar |
| Ambiguidade project/global MCP scope em TOK-2 | Media | Medio | ACs separados por scope com regra de precedencia |

## Success Metrics

| Metric | Baseline | Target (Conservative) | Target (Ceiling) |
|--------|----------|----------------------|------------------|
| Token overhead/session | Medir (TOK-1.5) | -25% | -45% |
| MCP schema tokens | Medir | -50% | -85% |
| QA Gate token cost | Medir | -30% | -60% |
| Tool selection accuracy | Medir | +10pp | +18pp |

## Definition of Done

- [x] All 8 stories completed with acceptance criteria met
- [ ] Tool registry created at `.aios-core/data/tool-registry.yaml`
- [ ] Baseline measured for SDC, QA Loop, Spec Pipeline, Interactive workflows
- [ ] Deferred loading or MCP discipline active (capability-dependent)
- [ ] PTC functional for QA Gate, entity validation, research aggregation
- [ ] Agent handoff does not accumulate 3+ agent personas
- [ ] input_examples for top-10 MCP tools
- [ ] Analytics pipeline comparing post-optimization vs baseline
- [ ] Empirical validation of 25-45% reduction target
- [ ] Zero regression in existing functionality

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Epic criado a partir do Architect Blueprint v2.0 |
| 1.1 | 2026-02-22 | @sm (River) | 8 stories detalhadas criadas, links adicionados |
| 2.0 | 2026-02-22 | @architect (Aria) | Incorpora handoff Code-Intel + TOK Integration: decisao TOK-7 (backlog), boundary impact matrix, scope source of truth, definition of ready, wave gate thresholds, 3 novos riscos, ajustes obrigatorios em 8 stories |
| 2.1 | 2026-02-23 | @pm (Morgan) | Decisao formal: TOK-7 (RegistryProvider) confirmado como Opcao A — backlog pos-W1 gate. Racional: zero urgencia, foundation primeiro, sem scope creep. Backlog item 1740200000001 atualizado. Delegar ajustes de stories ao @po (secao 12 do handoff). |
| 3.0 | 2026-02-23 | @po (Pax) | **Epic Complete.** TOK-6 closed (last story). 8/8 stories Done. All waves delivered. Payload reduction targets exceeded: content -46% (target -24%), schema -81% (target -50%), field -86% (target -50%). |

## Handoff to Story Manager

"@sm, por favor crie stories detalhadas para este epic. Key considerations:

- Enhancement ao framework AIOS (Node.js CLI, multi-agent orchestration)
- Integration points: `.aios-core/data/tool-registry.yaml` (novo), `.aios-core/data/entity-registry.yaml` (existente), `.mcp.json`, task frontmatter, SYNAPSE context tracking
- Existing patterns: entity-registry YAML schema, agent frontmatter, task `requires:` field, L1-L4 boundary model
- 7 ADRs guiam decisoes tecnicas — consultar blueprint v2.0
- Compatibility constraints sao criticas — tool_search vs input_examples sao incompativeis
- Cada story deve incluir comparacao com baseline (TOK-1.5)
- Codex Critical Analysis fornece riscos adicionais e sizing ajustado
- Blueprint v2.0 tem schema proposto do registry, agent profiles, task bindings e squad override pattern"
