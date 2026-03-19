# Workflow: Audit-Optimize Cycle

## Metadata

- **id**: AA-WF001
- **name**: audit-optimize-cycle
- **description**: Ciclo completo de auditoria → diagnóstico → otimização de um agente
- **trigger**: `*audit-cycle <agent-id>`

## Overview

Workflow end-to-end que audita um agente, identifica gaps, e aplica otimizações até atingir o nível de autonomia alvo.

```text
autonomy-auditor → [diagnose] → agent-architect/reasoning-engineer/tool-smith → [re-audit]
     ↑                                                                              |
     └──────────────────── loop até nível alvo atingido ───────────────────────────┘
```

## Phases

### Phase 1: Audit (autonomy-auditor)

- **Task**: `tasks/audit-agent.md`
- **Input**: agent file path
- **Output**: audit report com scores + nível L1-L5
- **Gate**: QG-002 (Diagnosis Complete)

### Phase 2: Triage (autonomy-chief)

Analisa o audit report e decide routing:

| Área com gaps | Route para |
|--------------|------------|
| Planning (P1-P3) | reasoning-engineer |
| Memory (M1-M3) | agent-architect |
| Tool Use (T1-T3) | tool-smith (+ ecosystem-scout) |
| Failure Modes | autonomy-auditor (diagnóstico detalhado) |
| Múltiplas áreas | agent-architect (redesign) |

### Phase 3: Optimize (varia por routing)

**Se Planning gaps:**

- **Agent**: reasoning-engineer
- **Task**: `tasks/teach-reasoning.md`
- **Ação**: selecionar/configurar reasoning pattern adequado

**Se Memory gaps:**

- **Agent**: agent-architect
- **Task**: `tasks/optimize-agent.md`
- **Ação**: redesenhar memory strategy (compaction, persistence, handoff)

**Se Tool Use gaps:**

- **Agent**: ecosystem-scout → tool-smith
- **Tasks**: `tasks/search-ecosystem.md` → `tasks/suggest-tools.md`
- **Ação**: encontrar libs existentes ou construir tools

**Se Failure Modes detectados:**

- **Agent**: autonomy-auditor
- **Task**: `tasks/diagnose-autonomy-failure.md`
- **Ação**: deep diagnosis com 5 Whys → recommendations

### Phase 4: Re-audit (autonomy-auditor)

- **Task**: `tasks/audit-agent.md` (novamente)
- **Input**: agent file atualizado
- **Output**: novo audit report
- **Comparação**: antes vs depois

### Phase 5: Decision

| Resultado | Ação |
|-----------|------|
| Nível alvo atingido | FIM — entregar report final |
| Melhora significativa (> +5 pontos) | Mais 1 iteração (max 3) |
| Sem melhora | Escalar para humano com diagnóstico |
| Max iterações (3) atingidas | Entregar com recomendações pendentes |

## Constraints

- **Max iterações**: 3
- **Nível alvo default**: L3 (>= 13/18 na checklist)
- **Timeout por fase**: 30m (aborta fase e marca como falha ao expirar)

## Output Final

```text
## Audit-Optimize Report: {agent-id}

### Resumo
- Iterações: {N}
- Nível inicial: {L_antes}
- Nível final: {L_depois}
- Score: {antes}/90 → {depois}/90

### Histórico de Iterações
| # | Foco | Score Antes | Score Depois | Delta |
|---|------|-------------|--------------|-------|
| 1 | {área} | {score} | {score} | {+N} |

### Otimizações Aplicadas
{lista de mudanças feitas}

### Recomendações Pendentes
{se nível alvo não atingido}
```
