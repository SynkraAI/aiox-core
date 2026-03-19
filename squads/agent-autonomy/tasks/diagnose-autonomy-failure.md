---
task: diagnoseAutonomyFailure()
responsavel: "AutonomyAuditor"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: agent_file_path
    tipo: string
    obrigatorio: true
  - nome: problem_description
    tipo: string
    obrigatorio: true
Saida:
  - nome: diagnosis_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Pelo menos 1 failure mode identificado
  - Root cause analysis completa (5 Whys)
  - Recomendacoes com agente responsavel
  - Handoff preparado
---

# Task: Diagnose Autonomy Failure

## Metadata

- **id**: AA-T003
- **name**: diagnose-autonomy-failure
- **primary_agent**: autonomy-auditor
- **trigger**: `*diagnose <agent-id>`
- **inputs**: agent file path + descrição do problema observado
- **outputs**: diagnosis report com root cause e fix recommendations

## Description

Diagnosticar por que um agente não está executando de forma autônoma. Identificar a causa raiz entre os 4 Failure Modes e os 3 Pilares, e recomendar ações corretivas específicas.

## Pre-conditions

- [ ] Agent file existe
- [ ] Problema observado descrito (ex: "agente fica pedindo confirmação", "agente perde contexto")

## Steps

### Step 1: Collect Symptoms

Perguntar ao usuário:

1. **O que o agente deveria fazer?** (objetivo esperado)
2. **O que o agente está fazendo?** (comportamento observado)
3. **Quando falha?** (em qual step/momento)
4. **Com que frequência?** (sempre, às vezes, em condições específicas)

### Step 2: Map Symptoms to Failure Modes

| Sintoma | Failure Mode Provável |
|---------|----------------------|
| Quality degrada ao longo da conversa | FM-1: Context Saturation |
| Agente usa tool errada ou retenta muito | FM-2: Tool Brittleness |
| Agente faz steps irrelevantes, perde foco | FM-3: Reasoning Drift |
| Agente pergunta "fiz certo?" ou entra em loop | FM-4: Evaluator Absence |
| Agente não consegue quebrar task complexa | Pilar: Planning (P1) |
| Agente esquece o que fez antes | Pilar: Memory (M1/M2) |
| Agente não tem tool para executar ação | Pilar: Tool Use (T1) |

### Step 3: Deep Diagnosis

Para cada failure mode identificado, investigar:

**FM-1 — Context Saturation**

- Quantos tokens o context window acumula por sessão?
- Há dados stale que não são limpos?
- O agente usa sub-agents para delegar?
- Há compaction ou just-in-time retrieval?

**FM-2 — Tool Brittleness**

- Quantas tools o agente tem?
- As tools são ACI-compliant? (rodar aci-checklist)
- Os retornos das tools são parseáveis?
- Há overlap entre tools (agente não sabe qual usar)?

**FM-3 — Reasoning Drift**

- O agente tem goal re-injection?
- Há max steps definido?
- O agente tem scope boundaries claros?
- O reasoning pattern é adequado para a complexidade?

**FM-4 — Evaluator Absence**

- O agente tem critérios de sucesso mensuráveis?
- Há self-evaluation no reasoning loop?
- Há quality gates definidos?
- O agente sabe quando escalar para humano?

### Step 4: Root Cause Analysis

Aplicar 5 Whys na causa raiz mais provável:

```text
1. Por que o agente falha? → [sintoma]
2. Por que [sintoma] acontece? → [causa imediata]
3. Por que [causa imediata]? → [causa intermediária]
4. Por que [causa intermediária]? → [causa estrutural]
5. Por que [causa estrutural]? → [root cause]
```

### Step 5: Generate Recommendations

Para cada root cause, gerar recomendação específica:

| Root Cause | Agent Responsável | Ação |
|-----------|-------------------|------|
| Context saturation | agent-architect | Redesenhar memory strategy |
| Tool brittleness | tool-smith | Criar/melhorar tools (ACI) |
| Reasoning drift | reasoning-engineer | Configurar reasoning pattern |
| Evaluator absence | agent-architect | Adicionar quality gates |
| Tool gaps | ecosystem-scout → tool-smith | Encontrar/criar tools |
| Prompt inadequado | reasoning-engineer | Reescrever com pattern correto |

### Step 6: Deliver Report

```text
## Diagnosis Report: {agent-id}

### Problema Reportado
{descrição do usuário}

### Failure Modes Detectados
- {FM-X}: {descrição} — Severidade: {alta/média/baixa}

### Root Cause (5 Whys)
{cadeia de 5 whys}

### Recomendações
| # | Ação | Responsável | Prioridade |
|---|------|-------------|------------|
| 1 | {ação} | {agent} | {P1/P2/P3} |

### Próximo Passo
Handoff para {agent} com contexto: {resumo}
```

## Post-conditions

- [ ] Ao menos 1 failure mode identificado
- [ ] Root cause analysis completa (5 Whys)
- [ ] Recomendações com agent responsável definido
- [ ] Handoff preparado

## Quality Gate

- **QG-002**: Diagnosis Complete
