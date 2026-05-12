# ADE Architect Handoff

> **De:** Quinn (@qa) - QA Agent
> **Para:** Sage (@architect) - Solution Architect
> **Data:** 2026-01-28
> **Projeto:** AIOX Autonomous Development Engine (ADE)

---

## Resumo Executivo

O ADE é um projeto de **Prompt Engineering + Infraestrutura** para habilitar execução autônoma de desenvolvimento no AIOX. Aproximadamente **60% do trabalho é criação de tasks .md, workflows .yaml e templates** - não código tradicional.

**Você é o líder técnico deste projeto.** @dev será acionado apenas para scripts JS específicos.

---

## Análise de Dependências

### Caminho Crítico (Sequencial Obrigatório)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMINHO CRÍTICO                                   │
│                                                                              │
│  Epic 1 ──────► Epic 2 ──────► Epic 3 ──────► Epic 4                        │
│  Worktree       Migration      Spec Pipeline   Execution                    │
│  (P0)           (P0)           (P0)            (P0)                         │
│                                                                              │
│  BLOQUEANTE: Cada epic depende do anterior estar COMPLETO                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Oportunidades de Paralelismo (Após Epic 4)

```
                              Epic 4 (Execution)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             Epic 5 (Recovery)              Epic 6 (QA Evolution)
             P1 - 4 stories                 P1 - 5 stories
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              Epic 7 (Memory)
                              P2 - 4 stories
```

**Epic 5 e Epic 6 podem rodar em PARALELO** após Epic 4 completo.

---

## Matriz de Dependências

| Epic                 | Requer   | Bloqueia   | Paralelo Com  |
| -------------------- | -------- | ---------- | ------------- |
| **1. Worktree**      | -        | 2, 4       | -             |
| **2. Migration**     | 1        | 3, 4, 5, 6 | -             |
| **3. Spec Pipeline** | 2        | 4          | -             |
| **4. Execution**     | 3        | 5, 6       | -             |
| **5. Recovery**      | 4        | 7          | **6**         |
| **6. QA Evolution**  | 4        | 7          | **5**         |
| **7. Memory**        | 5, 6     | -          | -             |

---

## Paralelismo de Preparação

Embora os épicos tenham dependências de **implementação**, você pode **preparar** épicos futuros enquanto o atual está em desenvolvimento:

| Enquanto executa | Pode preparar (sem implementar)            |
| ---------------- | ------------------------------------------ |
| Epic 1           | Schemas V3 do Epic 2 (design)              |
| Epic 2           | Estrutura das tasks do Epic 3              |
| Epic 3           | Estrutura do implementation.yaml do Epic 4 |
| Epic 4           | Design do Epic 5 e 6 em paralelo           |

---

## Detalhamento dos Epics por Tipo de Trabalho

### Epic 1: Worktree Manager (P0) - 5 stories

**Tipo:** 70% Código, 30% Prompt Engineering

| Story | Entregável                            | Tipo        |
| ----- | ------------------------------------- | ----------- |
| 1.1   | worktree-manager.js                   | JS Script   |
| 1.2   | Merge operations                      | JS Script   |
| 1.3   | CLI commands (\*create-worktree, etc) | Task .md    |
| 1.4   | Auto-create trigger                   | Workflow    |
| 1.5   | status.json integration               | JS + Schema |

**@dev necessário:** Stories 1.1, 1.2, 1.5 (scripts)
**@architect lidera:** Stories 1.3, 1.4 (prompts/workflows)

---

### Epic 2: Migration V2→V3 (P0) - 6 stories

**Tipo:** 60% Código, 40% Prompt Engineering

| Story | Entregável                  | Tipo                |
| ----- | --------------------------- | ------------------- |
| 2.1   | asset-inventory.js          | JS Script           |
| 2.2   | path-analyzer.js            | JS Script           |
| 2.3   | V3 Schemas (agent, task)    | JSON Schema         |
| 2.4   | migrate-agent.js            | JS Script           |
| 2.5   | Pilot migration (@dev, @qa) | Manual + Validação  |
| 2.6   | Batch migration             | Orquestração        |

**@dev necessário:** Stories 2.1, 2.2, 2.4 (scripts)
**@architect lidera:** Stories 2.3, 2.5, 2.6 (schemas/orquestração)

---

### Epic 3: Spec Pipeline (P0) - 6 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Entregável                    | Tipo           |
| ----- | ----------------------------- | -------------- |
| 3.1   | spec-gather-requirements.md   | Task .md       |
| 3.2   | spec-assess-complexity.md     | Task .md       |
| 3.3   | spec-research-dependencies.md | Task .md + MCP |
| 3.4   | spec-write-spec.md            | Task .md       |
| 3.5   | spec-critique.md              | Task .md       |
| 3.6   | spec-pipeline.yaml            | Workflow .yaml |

**@dev necessário:** Nenhum
**@architect lidera:** TODAS as stories (100% prompt engineering)

---

### Epic 4: Execution Engine (P0) - 6 stories

**Tipo:** 30% Código, 70% Prompt Engineering

| Story | Entregável                         | Tipo          |
| ----- | ---------------------------------- | ------------- |
| 4.1   | plan-create-implementation.md      | Task .md      |
| 4.2   | plan-create-context.md             | Task .md      |
| 4.3   | plan-execute-subtask.md (13 steps) | Task .md      |
| 4.4   | self-critique-checklist.md         | Checklist .md |
| 4.5   | subtask-verifier.js                | JS Script     |
| 4.6   | plan-tracker.js                    | JS Script     |

**@dev necessário:** Stories 4.5, 4.6 (scripts)
**@architect lidera:** Stories 4.1, 4.2, 4.3, 4.4 (prompts)

---

### Epic 5: Recovery System (P1) - 4 stories

**Tipo:** 40% Código, 60% Prompt Engineering

| Story | Entregável           | Tipo           |
| ----- | -------------------- | -------------- |
| 5.1   | attempt-tracker.js   | JS Script      |
| 5.2   | recovery-strategy.md | Task .md       |
| 5.3   | Escalation triggers  | Workflow       |
| 5.4   | Retry policies       | Config + Logic |

**@dev necessário:** Story 5.1 (script)
**@architect lidera:** Stories 5.2, 5.3, 5.4

---

### Epic 6: QA Evolution (P1) - 5 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Entregável                | Tipo                 |
| ----- | ------------------------- | -------------------- |
| 6.1   | review-subtask.md         | Task .md             |
| 6.2   | qa-gate-auto.md           | Task .md             |
| 6.3   | CodeRabbit integration    | Config + Workflow    |
| 6.4   | review-qa.md (Dev→QA→Dev) | Task .md             |
| 6.5   | Quality metrics           | Schema + Aggregation |

**@dev necessário:** Story 6.5 (metrics script, opcional)
**@architect lidera:** Stories 6.1, 6.2, 6.3, 6.4

---

### Epic 7: Memory Layer (P2) - 4 stories

**Tipo:** 50% Código, 50% Prompt Engineering

| Story | Entregável                       | Tipo         |
| ----- | -------------------------------- | ------------ |
| 7.1   | project-memory schema (Supabase) | SQL + Schema |
| 7.2   | Memory query utilities           | JS + SQL     |
| 7.3   | Pattern learning                 | Task .md     |
| 7.4   | Cross-project insights           | Task .md     |

**@dev necessário:** Stories 7.1, 7.2 (Supabase)
**@architect lidera:** Stories 7.3, 7.4

---

## Plano de Execução Recomendado

### Fase 1: Fundação (Semanas 1-3)

```
Semana 1: Epic 1 (Worktree Manager)
        └── @dev: 1.1, 1.2, 1.5
        └── @architect: 1.3, 1.4
        └── PREP: Design V3 schemas (Epic 2)

Semanas 2-3: Epic 2 (Migration V2→V3)
        └── @dev: 2.1, 2.2, 2.4
        └── @architect: 2.3, 2.5, 2.6
        └── PREP: Rascunho da estrutura de tasks de spec (Epic 3)
```

### Fase 2: Pipeline Principal (Semanas 4-6)

```
Semanas 4-5: Epic 3 (Spec Pipeline) - 100% @architect
        └── Todas as 6 stories são prompt engineering
        └── PREP: Rascunho das tasks de execution (Epic 4)

Semana 6: Epic 4 (Execution Engine)
        └── @dev: 4.5, 4.6
        └── @architect: 4.1, 4.2, 4.3, 4.4
```

### Fase 3: Resiliência (Semanas 7-8) - PARALELO

```
Semanas 7-8: Epic 5 (Recovery) + Epic 6 (QA Evolution) EM PARALELO

        Track 1 - Recovery:
        └── @dev: 5.1
        └── @architect: 5.2, 5.3, 5.4

        Track 2 - QA Evolution:
        └── @architect: 6.1, 6.2, 6.3, 6.4
        └── @dev: 6.5 (opcional)
```

### Fase 4: Inteligência (Semanas 9-10)

```
Semanas 9-10: Epic 7 (Memory Layer)
        └── @dev: 7.1, 7.2 (Supabase)
        └── @architect: 7.3, 7.4
```

---

## Documentos Chave

### PRD

- `docs/prd/aiox-autonomous-development-engine.md`

### Stories

- `docs/stories/aiox-core-ade/` (7 arquivos de epic + README)

### Quality Gates

- `docs/qa/gates/aiox-core-ade/` (7 arquivos de gate + README)

### Referência

- `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md` (patterns do Auto-Claude)
- `.aiox-core/core-config.yaml` (configuração central)

---

## Protocolo de Quality Gate

Após completar cada epic, acione @qa para executar o quality gate:

```
@qa *gate epic-{N}-{name}
```

**Decisões possíveis:**

- **PASS:** Próximo epic liberado
- **CONCERNS:** Aprovado com itens de follow-up
- **FAIL:** Retorna para correções
- **WAIVED:** Bypass autorizado por @po

---

## Notas Importantes

### Sobre Prompt Engineering

As tasks .md são **instruções executáveis para o LLM**. Elas precisam ser:

1. **Determinísticas** - Mesma entrada = mesma saída
2. **Completas** - Todos os passos explícitos
3. **Verificáveis** - Output validável
4. **Composáveis** - Podem ser chamadas por outras tasks

### Sobre Self-Critique (Epic 4)

Os steps 5.5 e 6.5 do execute-subtask são **críticos**. Eles forçam o LLM a revisar seu próprio trabalho antes de continuar. Não podem ser bypassados sem flag explícito.

### Sobre Integração com Dashboard

O Dashboard (projeto separado) vai **consumir** o que o ADE produz:

- formato status.json
- Worktree API
- Agents V3

Não há dependência do Dashboard para o ADE funcionar.

---

## Primeiros Passos Recomendados

1. **Ler o PRD completo** - `docs/prd/aiox-autonomous-development-engine.md`
2. **Ler o Auto-Claude Analysis** - `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
3. **Iniciar Epic 1.1** - worktree-manager.js (delegar para @dev)
4. **Em paralelo, desenhar os schemas V3** (Epic 2.3)

---

## Perguntas para @architect Antes de Começar

1. Prefere começar pelo código (Epic 1.1 com @dev) ou pelo design (V3 schemas)?
2. Quer criar um agente @prompt-engineer especializado ou assumir esse papel?
3. Alguma dúvida sobre o escopo ou dependências?

---

_Handoff preparado por Quinn (@qa) - Guardian of Quality_
_Data: 2026-01-28_
