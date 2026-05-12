# ADE Epic 3 Handoff - Spec Pipeline

> **De:** Quinn (@qa) - QA Agent
> **Para:** Aria (@architect) - Solution Architect
> **Data:** 2026-01-28
> **Status:** Epic 1+2 COMPLETOS → Epic 3 DESBLOQUEADO

---

## Resumo Executivo

Epic 1 (Worktree) e Epic 2 (Migration V3) estão **100% completos** e aprovados pelo QA Gate. O Epic 3 (Spec Pipeline) está **desbloqueado** para início imediato.

**Epic 3 é 100% Prompt Engineering** - @architect lidera todas as 6 stories.

---

## Pré-requisitos Validados ✅

| Dependência       | Status            | Evidência                                     |
| ----------------- | ----------------- | --------------------------------------------- |
| WorktreeManager   | ✅ Funcional      | `manager.list()` executa sem erros            |
| V3 Schemas        | ✅ Completo       | `agent-v3-schema.json`, `task-v3-schema.json` |
| Todos Agents V3   | ✅ 12/12 migrados | Seção `autoClaude:` em todos                  |
| Scripts Migração  | ✅ Prontos        | `asset-inventory.js`, `path-analyzer.js`      |

---

## Epic 3: Visão Geral do Spec Pipeline

**Tipo:** 10% Código, **90% Prompt Engineering**

O Spec Pipeline transforma requisitos vagos em especificações executáveis através de 5 fases sequenciais:

```
Solicitação Usuário → Gather → Assess → Research → Write → Critique → Spec Pronta
```

---

## Detalhamento das Stories

| Story | Entregável                      | Tipo           | Agent      |
| ----- | ------------------------------- | -------------- | ---------- |
| 3.1   | `spec-gather-requirements.md`   | Task .md       | @architect |
| 3.2   | `spec-assess-complexity.md`     | Task .md       | @architect |
| 3.3   | `spec-research-dependencies.md` | Task .md + MCP | @architect |
| 3.4   | `spec-write-spec.md`            | Task .md       | @architect |
| 3.5   | `spec-critique.md`              | Task .md       | @architect |
| 3.6   | `spec-pipeline.yaml`            | Workflow .yaml | @architect |

**@dev necessário:** Nenhum
**@architect lidera:** TODAS as stories

---

## Story 3.1: Coletar Requisitos (Gather Requirements)

**Objetivo:** Coletar e estruturar requisitos do usuário

**Task:** `spec-gather-requirements.md`

**Entradas:**

- Solicitação do usuário (texto ou voz)
- Contexto do projeto (de status.json)
- Specs existentes (se iterando)

**Saídas:**

- Documento de requisitos estruturado
- Perguntas de esclarecimento (se ambíguo)
- Definição inicial de escopo

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-gather
  elicit: true
  deterministic: false # Criatividade do LLM necessária
```

---

## Story 3.2: Avaliar Complexidade (Assess Complexity)

**Objetivo:** Avaliar complexidade e estimar esforço

**Task:** `spec-assess-complexity.md`

**Entradas:**

- Requisitos coletados (de 3.1)
- Análise do codebase
- Restrições técnicas

**Saídas:**

- Score de complexidade (simple/standard/complex)
- Estimativa de esforço
- Fatores de risco
- Sugestão de divisão (se complexo)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-assess
  complexity: standard
  verification:
    type: none # Assessment é consultivo
```

---

## Story 3.3: Pesquisar Dependências (Research Dependencies)

**Objetivo:** Pesquisar bibliotecas, APIs e padrões necessários

**Task:** `spec-research-dependencies.md`

**Ferramentas Necessárias:**

- EXA (busca web)
- Context7 (docs de bibliotecas)
- Busca no codebase

**Entradas:**

- Requisitos + Avaliação
- Preferências de tech stack (de technical-preferences.md)

**Saídas:**

- Bibliotecas recomendadas com justificativa
- Links de documentação de API
- Exemplos de código
- Notas de compatibilidade

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-research
  tools:
    - exa
    - context7
```

---

## Story 3.4: Escrever Especificação (Write Specification)

**Objetivo:** Produzir especificação executável

**Task:** `spec-write-spec.md`

**Entradas:**

- Todas as saídas anteriores (requisitos, avaliação, pesquisa)
- Template de spec

**Saídas:**

- Documento de especificação completo
- Checklist de implementação
- Cenários de teste (Given-When-Then)
- Critérios de aceitação

**Template:** Usar `spec-tmpl.yaml` existente ou criar novo

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-write
  deterministic: true # Mesmas entradas = mesma spec
  composable: true
```

---

## Story 3.5: Criticar Especificação (Critique Specification)

**Objetivo:** Validar e melhorar a spec antes da execução

**Task:** `spec-critique.md`

**Entradas:**

- Especificação escrita (de 3.4)
- Checklist de qualidade

**Saídas:**

- Relatório de crítica
- Sugestões de melhoria
- Decisão PASS/NEEDS_REVISION
- Spec revisada (se auto-corrigida)

**Agent:** Capacidades do @qa (canCritique: true)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-critique
  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md
```

---

## Story 3.6: Orquestração do Pipeline (Pipeline Orchestration)

**Objetivo:** Orquestrar as 5 fases em workflow único

**Workflow:** `spec-pipeline.yaml`

**Estrutura:**

```yaml
workflow:
  id: spec-pipeline
  sequence:
    - step: gather
      task: spec-gather-requirements.md
      agent: pm
    - step: assess
      task: spec-assess-complexity.md
      agent: architect
    - step: research
      task: spec-research-dependencies.md
      agent: analyst
    - step: write
      task: spec-write-spec.md
      agent: pm
    - step: critique
      task: spec-critique.md
      agent: qa
      gate: true # Deve passar para continuar
```

---

## Padrões Técnicos

### Template Task V3

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-{phase}
  deterministic: boolean
  elicit: boolean
  composable: true

  verification:
    type: none|command|manual

  contextRequirements:
    projectContext: true
    filesContext: false
    implementationPlan: false
    spec: false
```

### Enum de Fases do Pipeline

```
spec-gather    # @pm - coletar requisitos
spec-assess    # @architect - avaliar complexidade
spec-research  # @analyst - pesquisar dependências
spec-write     # @pm - escrever especificação
spec-critique  # @qa - validar qualidade
```

---

## Critérios de Sucesso

- [ ] Todas as 5 tasks de spec criadas com seção autoClaude V3
- [ ] Workflow do pipeline orquestra todas as fases
- [ ] Cada task tem entradas/saídas claras
- [ ] Task de critique inclui quality gate
- [ ] Teste end-to-end: solicitação vaga → spec completa

---

## Ordem de Execução Recomendada

1. **3.1 + 3.2 + 3.3** - Criar as 3 tasks de análise (podem ser paralelas)
2. **3.4** - Task de escrever spec (depende de entender o fluxo)
3. **3.5** - Task de critique (precisa da spec para criticar)
4. **3.6** - Workflow do pipeline (integra todas)

---

## Documentos Relacionados

- PRD: `docs/prd/aiox-autonomous-development-engine.md`
- Análise Auto-Claude: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Stories do Epic: `docs/stories/aiox-core-ade/epic-3-spec-pipeline.md`

---

## QA Gate para Epic 3

Após completar o Epic 3, execute:

```
@qa *gate epic-3-spec-pipeline
```

**Validação:**

- Todas as 5 tasks validam contra task-v3-schema.json
- Workflow do pipeline executa sem erros
- Teste E2E: "Adicionar funcionalidade de login" → spec completa

---

_Handoff preparado por Quinn (@qa) - Guardião da Qualidade_
_Commit: 3fea6ca - feat(ade): complete Epic 1+2_
_Data: 2026-01-28_
