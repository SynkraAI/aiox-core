# Handoff para Codex — Análise Crítica do Epic Token Optimization v2.0

**Data:** 2026-02-22
**Origem:** @architect (Aria) + @pm (Morgan) + @sm (River)
**Destino:** Codex (análise crítica independente)
**Tipo:** Validação de stories contra codebase real
**Status:** EPIC + 8 stories prontas para validação

---

## 1. Objetivo desta Análise

O Codex deve fazer uma **análise crítica profunda** validando:

1. **Viabilidade técnica** de cada story contra o código real do AIOS
2. **Completude** dos acceptance criteria — cobrem todos os cenários reais?
3. **Dependências ocultas** — existem dependências no código que as stories não mapearam?
4. **Conflitos com framework existente** — as mudanças propostas conflitam com padrões existentes?
5. **Sizing** — os pontos estimados são realistas dado o código existente?
6. **Gaps** — existem aspectos técnicos críticos que nenhuma story cobre?
7. **Constitution compliance** — as stories respeitam os 6 artigos da Constitution?

---

## 2. Artefatos Primários (LEITURA OBRIGATÓRIA)

### 2.1 Epic e Stories (8 arquivos — TUDO em `docs/stories/epics/epic-token-optimization/`)

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 1 | `INDEX.md` | Epic overview, 8 stories em 3 waves, dependency graph, ADRs, risks, success metrics |
| 2 | `story-TOK-1-unified-tool-registry.md` | Criar tool-registry.yaml com tiers, profiles, task bindings |
| 3 | `story-TOK-1.5-baseline-metrics.md` | Medir tokens por workflow antes de otimizar |
| 4 | `story-TOK-2-deferred-search-capability-aware.md` | Capability detection + deferred/MCP discipline |
| 5 | `story-TOK-3-ptc-native-bulk-ops.md` | PTC para QA Gate, entity validation, research |
| 6 | `story-TOK-4A-agent-handoff-context-strategy.md` | Context compaction on agent switch |
| 7 | `story-TOK-4B-input-examples-registry.md` | input_examples para MCP tools |
| 8 | `story-TOK-5-tool-usage-analytics.md` | Analytics pipeline + promote/demote |
| 9 | `story-TOK-6-dynamic-filtering.md` | Filtrar payloads grandes de MCP responses |

### 2.2 Blueprint e Análise Anterior

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 10 | `ARCHITECT-BLUEPRINT.md` | Blueprint v2.0 completo — arquitetura, ADRs, Tool Mesh, roadmap |
| 11 | `CODEX-CRITICAL-ANALYSIS.md` | Análise crítica v1 do Codex (já incorporada no blueprint v2.0) |
| 12 | `CODEX-TO-ARCHITECT-HANDOFF.md` | Handoff v1 do Codex com replanejamento sugerido |

---

## 3. Artefatos do Framework (INVESTIGAÇÃO OBRIGATÓRIA)

O Codex DEVE investigar estes arquivos do framework para validar as stories:

### 3.1 Task System — Validar TOK-1 (task bindings), TOK-3 (PTC annotation)

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 13 | `.aios-core/development/tasks/qa-gate.md` | TOK-3 propõe `execution_mode: programmatic` — verificar se frontmatter atual suporta esse campo |
| 14 | `.aios-core/development/tasks/dev-develop-story.md` | TOK-1 propõe `task_bindings` — verificar tools declaradas |
| 15 | `.aios-core/development/tasks/create-next-story.md` | TOK-1 propõe binding — verificar frontmatter existente |
| 16 | `.aios-core/development/tasks/validate-next-story.md` | TOK-1 propõe binding — verificar frontmatter existente |
| 17 | `.aios-core/development/tasks/qa-run-tests.md` | ÚNICO task com `requires:` no frontmatter — padrão a seguir? |

**ACHADO PRÉVIO:** O campo `execution_mode` NÃO EXISTE em nenhum task file hoje. O campo `requires:` existe APENAS em `qa-run-tests.md`. O campo `tools:` existe em ~35+ tasks com schema: `tools: [nome1, nome2]`. Stories TOK-1 e TOK-3 propõem campos novos — validar impacto.

### 3.2 Data Layer — Validar TOK-1 (registry), TOK-4B (entity extension)

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 18 | `.aios-core/data/entity-registry.yaml` | 502KB, 714+ entities — TOK-4B propõe adicionar `invocationExamples`. Verificar schema atual e impacto |
| 19 | `.aios-core/data/agent-config-requirements.yaml` | Agent config — verificar se conflita com tool profiles propostos |
| 20 | `.aios-core/data/workflow-patterns.yaml` | Workflow patterns — verificar se Tool Mesh conflita |
| 21 | `.aios-core/data/workflow-state-schema.yaml` | Schema de workflow state — afetado por PTC? |

### 3.3 Core Modules — Validar TOK-2 (capability), TOK-4A (handoff), TOK-6 (filtering)

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 22 | `.aios-core/core/synapse/engine.js` | TOK-4A integra com SYNAPSE — verificar API de handoff |
| 23 | `.aios-core/core/synapse/context/context-tracker.js` | TOK-4A usa context tracking — verificar capabilities |
| 24 | `.aios-core/core/synapse/layers/` (l0-l7) | 8 layers do SYNAPSE — TOK-4A precisa integrar sem quebrar |
| 25 | `.aios-core/core/synapse/session/session-manager.js` | TOK-4A handoff storage — verificar se `.aios/handoffs/` conflita |
| 26 | `.aios-core/core/orchestration/executor-assignment.js` | TOK-4A agent switch — verificar como agents são atribuídos |
| 27 | `.aios-core/core/orchestration/context-manager.js` | TOK-4A context compaction — verificar API existente |
| 28 | `.aios-core/core/orchestration/subagent-prompt-builder.js` | TOK-4A handoff artifact — verificar como prompts são construídos |
| 29 | `.aios-core/core/code-intel/` (client, enricher, helpers/) | TOK-1.5 baseline pode usar code-intel data — verificar |
| 30 | `.aios-core/core/registry/registry-schema.json` | TOK-1 propõe novo registry — verificar compatibilidade com schema existente |
| 31 | `.aios-core/core/registry/registry-loader.js` | TOK-1 — como registries são carregados hoje? |

### 3.4 Config e Boundaries — Validar TOK-2 (capability detection), BM alignment

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 32 | `.aios-core/core-config.yaml` | TOK-2 pode precisar de config keys novas — verificar schema |
| 33 | `.claude/settings.json` | 80 deny + 6 allow rules — TOK-6 propõe criar módulos em `.aios-core/core/filters/` (L1 protegido!) |
| 34 | `.mcp.json` | TOK-2 propõe modificar MCP config — verificar estrutura atual (2 MCPs: nogic, code-graph) |
| 35 | `.aios-core/constitution.md` | Artigos I-VI — todas as stories devem respeitar |

### 3.5 Agent System — Validar TOK-1 (profiles), TOK-4A (handoff)

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 36 | `.claude/agents/aios-dev.md` | TOK-1 propõe dev profile — verificar tools reais do agent |
| 37 | `.claude/agents/aios-qa.md` | TOK-1 propõe qa profile — verificar tools reais |
| 38 | `.claude/agents/aios-architect.md` | TOK-1 propõe architect profile — verificar tools reais |
| 39 | `.claude/agents/aios-devops.md` | TOK-1 propõe devops profile — verificar tools reais |
| 40 | `.claude/agents/aios-pm.md` | TOK-1 propõe pm profile — verificar tools reais |
| 41 | `.claude/agents/aios-sm.md` | TOK-1 propõe sm profile — verificar tools reais |
| 42 | `.claude/agents/aios-analyst.md` | TOK-1 propõe analyst profile — verificar tools reais |

### 3.6 Infrastructure e Scripts — Validar build/test/CI impact

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 43 | `.aios-core/infrastructure/scripts/unified-activation-pipeline.js` | 30KB — agent activation flow. TOK-4A handoff deve integrar aqui? |
| 44 | `.aios-core/infrastructure/scripts/greeting-builder.js` | 50KB — greeting system. Afetado por tool profile loading? |
| 45 | `.aios-core/infrastructure/scripts/populate-entity-registry.js` | 21KB — TOK-4B propõe modificar entity-registry schema |
| 46 | `.aios-core/infrastructure/schemas/task-v3-schema.json` | TOK-3 propõe `execution_mode` field — verificar task schema |
| 47 | `.aios-core/infrastructure/schemas/agent-v3-schema.json` | TOK-1 propõe agent profiles — verificar agent schema |

### 3.7 Tests — Validar cobertura existente e impacto

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 48 | `tests/synapse/` (26 test files) | TOK-4A integra SYNAPSE — testes existentes cobrem handoff? |
| 49 | `tests/code-intel/` (11 test files) | TOK-1.5 pode usar code-intel — testes cobrem? |
| 50 | `tests/config/` (7 test files) | TOK-2 modifica config — testes cobrem? |

### 3.8 Research Reports — Contexto técnico

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 51 | `docs/research/2026-02-22-programmatic-tool-calling/README.md` | PTC completo — CodeAct, benchmarks, limitações |
| 52 | `docs/research/2026-02-22-tool-search-deferred-loading/README.md` | Tool Search + Deferred — 85% reduction |
| 53 | `docs/research/2026-02-22-aios-token-optimization-architecture/` | Arquitetura completa — 3 docs |
| 54 | `docs/research/2026-02-22-tool-use-examples/INDEX.md` | input_examples — +18pp accuracy |
| 55 | `docs/research/2026-02-22-dynamic-filtering-web-fetch/README.md` | Dynamic filtering — -24% tokens |

### 3.9 Related Epics — Verificar conflitos e dependências

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 56 | `docs/stories/epics/epic-nogic-code-intelligence/INDEX.md` | NOG-11 (token source), NOG-18 (SYNAPSE), NOG-22 (skill discovery) são pre-reqs |
| 57 | `docs/stories/epics/epic-boundary-mapping/INDEX.md` | BM-1 (deny rules), BM-5 (entity layer classification) são dependências |
| 58 | `docs/stories/epics/epic-synapse-context-engine/` | SYNAPSE epic — TOK-4A integra |

### 3.10 Rules — Verificar compliance

| # | Arquivo | Por que validar |
|---|---------|----------------|
| 59 | `.claude/rules/agent-authority.md` | Delegation matrix — stories respeitam? |
| 60 | `.claude/rules/workflow-execution.md` | 4 workflows — Tool Mesh não pode quebrá-los |
| 61 | `.claude/rules/story-lifecycle.md` | Story lifecycle — stories seguem o padrão? |
| 62 | `.claude/rules/mcp-usage.md` | MCP governance — TOK-2/TOK-6 respeitam? |

---

## 4. Achados Prévios (da exploração de framework)

Estes achados foram descobertos durante a preparação deste handoff. O Codex deve validá-los e encontrar mais:

### ACHADO-1: Campo `execution_mode` não existe (ALTO)
- **Story afetada:** TOK-3 propõe `execution_mode: programmatic` nos task frontmatter
- **Realidade:** Nenhum task file usa esse campo. O campo mais próximo é `requires:` (apenas em `qa-run-tests.md`)
- **Pergunta:** TOK-3 deve definir o schema formal desse campo? Precisa de migration dos 180+ tasks existentes?

### ACHADO-2: `tool-registry` não é referenciado em nenhum lugar (ALTO)
- **Story afetada:** TOK-1 cria `tool-registry.yaml`
- **Realidade:** Zero referências a "tool-registry" em todo o codebase. É um conceito 100% novo
- **Pergunta:** Quem consome o registry? Quais módulos precisam ser modificados para ler/usar esse arquivo?

### ACHADO-3: `.aios-core/core/filters/` seria L1 protegido (CRÍTICO)
- **Story afetada:** TOK-6 propõe criar `.aios-core/core/filters/` com módulos de filter
- **Realidade:** `.aios-core/core/**` tem deny rules em `.claude/settings.json` — TUDO em core é L1 bloqueado
- **Pergunta:** TOK-6 precisa de allow exception para `core/filters/`? Ou os filtros devem ficar em outro lugar (L3/L4)?

### ACHADO-4: MCP config real difere do blueprint (MÉDIO)
- **Story afetada:** TOK-2 assume MCP Docker Gateway com EXA, Context7, Apify, Playwright
- **Realidade:** `.mcp.json` atual tem apenas `nogic` e `code-graph`. Docker Gateway MCPs estão em `~/.claude.json` (global, não projeto)
- **Pergunta:** TOK-2 deve operar no `.mcp.json` (projeto) ou `~/.claude.json` (global)? MCP discipline para qual scope?

### ACHADO-5: Task frontmatter tem 2 schemas (MÉDIO)
- **Story afetada:** TOK-1 propõe `task_bindings`, TOK-3 propõe `execution_mode`
- **Realidade:** Tasks usam 2 schemas diferentes:
  - **Novo:** `tools:`, `checklists:` (ativo, ~35+ tasks)
  - **Legacy:** `task:`, `responsavel:`, `token_usage:` (dentro de HTML comments, não parseado)
  - **Único:** `requires:`, `name:`, `agent:` (apenas `qa-run-tests.md`)
- **Pergunta:** Qual schema é o canônico? TOK-1/TOK-3 devem seguir qual padrão?

### ACHADO-6: SYNAPSE tem 8 layers (l0-l7) — integração com TOK-4A é complexa (MÉDIO)
- **Story afetada:** TOK-4A propõe integrar handoff com SYNAPSE
- **Realidade:** SYNAPSE tem 8 layers com pipeline de processamento. Handoff precisaria integrar como um layer adicional ou hook
- **Pergunta:** TOK-4A deve ser um layer (l8?) ou um hook no pipeline existente?

---

## 5. Perguntas-Chave para o Codex

### Validação Técnica

1. **TOK-1 (Registry):** O schema proposto do tool-registry.yaml é consumível pelo código existente? Quais módulos em `.aios-core/core/` precisariam de changes para ler esse arquivo? O `registry-loader.js` existente serve?

2. **TOK-2 (Capability Detection):** Claude Code expõe algum mecanismo de runtime detection? Os 2 MCPs atuais (nogic, code-graph) são deferred-loading candidates ou always-loaded? O ENABLE_TOOL_SEARCH env var funciona no contexto atual?

3. **TOK-3 (PTC):** O task schema (`task-v3-schema.json`) suporta extensão com `execution_mode`? Quantos tasks precisam de migration? PTC como proposto (bash scripts com multi-tool) é realmente PTC ou é apenas Bash scripting normal?

4. **TOK-4A (Handoff):** O SYNAPSE engine suporta handoff nativo? O `context-manager.js` em orchestration tem API de compaction? O `subagent-prompt-builder.js` pode ser reutilizado para handoff artifacts?

5. **TOK-4B (Examples):** O `entity-registry.yaml` (502KB) suportaria campo `invocationExamples` sem degradar performance de parsing? O `populate-entity-registry.js` precisaria de mudanças?

6. **TOK-6 (Filtering):** Onde devem ficar os módulos de filter dado que `core/` é L1 protegido? A alternativa seria `.aios-core/utils/` ou um novo path em L3?

### Validação de Sizing

7. **TOK-1 (3-5 pts):** Com 180+ tasks, 10+ agents, e 714+ entities para catalogar, 3-5 pontos é suficiente?
8. **TOK-2 (5 pts):** Capability detection + 3 fallback strategies + MCP config changes + validation — 5 pontos é realista?
9. **TOK-4A (3-5 pts):** Integração com SYNAPSE (8 layers) + orchestration + handoff template — subestimado?

### Validação de Compliance

10. **Constitution Article IV (No Invention):** Todas as stories traçam a pesquisas documentadas? Alguma AC inventa funcionalidade sem evidência?
11. **Constitution Article II (Agent Authority):** Agent assignments nas stories respeitam a delegation matrix?
12. **Boundary Model (L1-L4):** Todas as stories respeitam as deny rules existentes? TOK-6 `core/filters/` viola L1?

---

## 6. Ordem de Leitura Recomendada

### Fase 1: Contexto (comece aqui)
1. `INDEX.md` (epic overview)
2. `ARCHITECT-BLUEPRINT.md` (blueprint v2.0)
3. `CODEX-CRITICAL-ANALYSIS.md` (análise v1 do Codex — já incorporada)
4. `.aios-core/constitution.md` (primeiros 50 linhas — artigos I-V)

### Fase 2: Stories (leia todas)
5-12. Todas as 8 stories na ordem: TOK-1, TOK-1.5, TOK-2, TOK-3, TOK-4A, TOK-4B, TOK-5, TOK-6

### Fase 3: Framework Investigation (valide contra código real)
13-17. Task files (qa-gate, dev-develop-story, create-next-story, validate-next-story, qa-run-tests)
18-21. Data layer (entity-registry, agent-config, workflow-patterns, workflow-state-schema)
22-31. Core modules (synapse, orchestration, code-intel, registry)
32-35. Config files (core-config, settings.json, .mcp.json, constitution)
36-42. Agent definitions (dev, qa, architect, devops, pm, sm, analyst)
43-47. Infrastructure (activation pipeline, greeting builder, populate-registry, schemas)

### Fase 4: Cross-validation
48-50. Tests (synapse, code-intel, config)
51-55. Research reports (PTC, Tool Search, Architecture, Examples, Filtering)
56-58. Related epics (NOGIC, Boundary Mapping, SYNAPSE)
59-62. Rules (agent authority, workflow execution, story lifecycle, MCP usage)

---

## 7. Entregável Esperado

O Codex deve produzir:

1. **Análise crítica por story** (PASS/CONCERNS/FAIL com evidência do codebase)
2. **Achados técnicos** (classificados por severidade: CRÍTICO/ALTO/MÉDIO/BAIXO)
3. **Sizing validation** (cada story: adequado/subestimado/superestimado com justificativa)
4. **Dependency gaps** (dependências não mapeadas descobertas no código)
5. **Boundary violations** (stories que conflitam com L1-L4 deny rules)
6. **Constitution compliance** (por artigo, por story)
7. **Recomendações de ajuste** (mudanças específicas em ACs, tasks, ou scope)
8. **GO/NO-GO** por wave com condições

Salvar em: `docs/stories/epics/epic-token-optimization/CODEX-STORY-VALIDATION.md`

---

## 8. Resumo de Arquivos (62 total)

| Categoria | Qtd | Prioridade |
|-----------|-----|------------|
| Epic + Stories | 9 | OBRIGATÓRIO |
| Blueprint + Análise anterior | 3 | OBRIGATÓRIO |
| Task system | 5 | OBRIGATÓRIO |
| Data layer | 4 | OBRIGATÓRIO |
| Core modules | 10 | OBRIGATÓRIO |
| Config + Boundaries | 4 | OBRIGATÓRIO |
| Agent definitions | 7 | OBRIGATÓRIO |
| Infrastructure + Schemas | 5 | ALTO |
| Tests | 3 | ALTO |
| Research reports | 5 | REFERÊNCIA |
| Related epics | 3 | REFERÊNCIA |
| Rules | 4 | REFERÊNCIA |
| **Total** | **62** | — |

---

*Handoff v2.0 — @architect (Aria) para Codex*
*Foco: validação de stories contra codebase real do AIOS*
*CLI First | Task-First | Constitution*
