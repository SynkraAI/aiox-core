---
task: auditAgent()
responsavel: "AutonomyAuditor"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: agent_file_path
    tipo: string
    obrigatorio: true
  - nome: agent_id
    tipo: string
    obrigatorio: true
Saida:
  - nome: audit_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Agent file existe e e legivel
  - Report gerado com todos os scores
  - Autonomy level L1-L5 classificado
  - Recomendacoes listadas com agente responsavel
---

# Task: Audit Agent

## Metadata

- **id**: AA-T001
- **name**: audit-agent
- **primary_agent**: autonomy-auditor
- **trigger**: `*audit <agent-id>`
- **inputs**: agent file path (.md)
- **outputs**: audit report (.md)

## Description

Auditar um agente existente para avaliar seu nível de autonomia usando o framework dos 3 Pilares (Weng) + 4 Failure Modes + Níveis L1-L5.

## Pre-conditions

- [ ] Agent file existe e é legível
- [ ] Agent file contém definição completa (persona, commands, dependencies)

## Steps

### Step 1: Collect Agent Definition

```text
Ler o arquivo do agente completo.
Extrair: persona, commands, tools, dependencies, handoffs.
```

### Step 2: Evaluate 3 Pillars

Para cada pilar, avaliar 3 critérios (0-10):

**Planning (peso 0.35)**

| Critério | Pergunta | Score |
|----------|----------|-------|
| P1 — Task Decomposition | Agente consegue quebrar tarefas complexas em sub-tarefas? | /10 |
| P2 — Self-Reflection | Agente avalia sua própria performance e corrige erros? | /10 |
| P3 — Goal Persistence | Agente mantém foco no objetivo ao longo de múltiplos steps? | /10 |

**Memory (peso 0.30)**

| Critério | Pergunta | Score |
|----------|----------|-------|
| M1 — Working Memory | Agente gerencia eficientemente o context window? | /10 |
| M2 — Long-Term Memory | Agente persiste aprendizados entre sessões? | /10 |
| M3 — Cross-Agent Memory | Agente preserva contexto em handoffs? | /10 |

**Tool Use (peso 0.35)**

| Critério | Pergunta | Score |
|----------|----------|-------|
| T1 — Tool Coverage | Agente tem tools suficientes para suas tarefas? | /10 |
| T2 — Tool Quality (ACI) | Tools seguem os 5 princípios ACI? | /10 |
| T3 — Error Recovery | Agente lida com falhas de tools graciosamente? | /10 |

### Step 3: Detect Failure Modes

Para cada failure mode, verificar presença:

| FM | Nome | Sintoma a verificar |
|----|------|---------------------|
| FM-1 | Context Saturation | Quality degrada ao longo da conversa? |
| FM-2 | Tool Brittleness | Retry rate alto? Tool selection imprecisa? |
| FM-3 | Reasoning Drift | Steps irrelevantes? Tangentes? |
| FM-4 | Evaluator Absence | Agente sabe quando completou? |

### Step 4: Classify Autonomy Level

Com base nos scores, classificar L1-L5:

| Score Médio | Nível | Descrição |
|-------------|-------|-----------|
| 0-3 | L1 — Operator | Humano aprova cada ação |
| 4-5 | L2 — Collaborator | Humano edita outputs |
| 6-7 | L3 — Consultant | Agente executa por períodos |
| 8-9 | L4 — Approver | Humano só resolve blockers |
| 10 | L5 — Observer | Humano só monitora |

### Step 5: Generate Report

Usar template de report com:

- Executive Summary (1 parágrafo)
- Scores por pilar (tabela)
- Failure modes detectados
- Nível de autonomia classificado
- Top 3 recomendações prioritárias
- Agent para handoff (qual agente do squad deve atuar)

## Post-conditions

- [ ] Report gerado com todos os scores preenchidos
- [ ] Nível L1-L5 classificado
- [ ] Recomendações listadas com agent responsável
- [ ] Handoff definido (se necessário)

## Quality Gate

- **QG-002**: Diagnosis Complete
- Critério: todos os 9 critérios avaliados, 4 FMs verificados, nível classificado

## Handoff

| Resultado | Próximo Agent |
|-----------|---------------|
| Falhas em P1-P3 | → reasoning-engineer |
| Falhas em M1-M3 | → agent-architect |
| Falhas em T1-T3 | → tool-smith |
| FM-1 a FM-4 detectados | → tasks/diagnose-autonomy-failure.md (AA-T003) |
| Redesign necessário | → agent-architect |
