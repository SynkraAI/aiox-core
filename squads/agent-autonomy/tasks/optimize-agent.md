---
task: optimizeAgent()
responsavel: "AgentArchitect"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: agent_file
    tipo: string
    obrigatorio: true
  - nome: audit_report
    tipo: string
    obrigatorio: false
Saida:
  - nome: agent_file_updated
    tipo: markdown
    obrigatorio: true
  - nome: optimization_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Audit report disponivel ou executar audit primeiro
  - Agent file atualizado com otimizacoes
  - Autonomy score melhorou
  - Changelog atualizado
  - Re-validacao executada
---

# Task: Optimize Agent

## Metadata

- **id**: AA-T004
- **name**: optimize-agent
- **primary_agent**: agent-architect
- **secondary**: reasoning-engineer
- **trigger**: `*optimize <agent-id>`
- **inputs**: agent file + audit report (opcional)
- **outputs**: agent file atualizado + optimization report

## Description

Otimizar um agente existente para aumentar seu nível de autonomia. Parte de um audit report (se disponível) ou executa audit primeiro. Foca nas áreas com maior impacto no score de autonomia.

## Pre-conditions

- [ ] Agent file existe
- [ ] Audit report disponível OU executar `*audit` primeiro

## Steps

### Step 1: Assess Current State

Se não há audit report:

- Executar task `audit-agent` primeiro
- Coletar scores dos 3 pilares + failure modes

Se há audit report:

- Ler report e extrair scores e recomendações

### Step 2: Identify Optimization Targets

Priorizar por impacto (peso × gap):

```text
Impact Score = (peso do pilar) × (10 - score atual)
```

| Critério | Peso | Score Atual | Gap | Impact |
|----------|------|-------------|-----|--------|
| P1 | 0.35 | ? | ? | ? |
| P2 | 0.35 | ? | ? | ? |
| P3 | 0.35 | ? | ? | ? |
| M1 | 0.30 | ? | ? | ? |
| M2 | 0.30 | ? | ? | ? |
| M3 | 0.30 | ? | ? | ? |
| T1 | 0.35 | ? | ? | ? |
| T2 | 0.35 | ? | ? | ? |
| T3 | 0.35 | ? | ? | ? |

Focar nos **top 3 por impact score**.

### Step 3: Apply Optimizations

Para cada target, aplicar a técnica correspondente:

**Planning Optimizations**

| Critério | Técnica |
|----------|---------|
| P1 — Task Decomposition | Adicionar instruções de decomposição no prompt |
| P2 — Self-Reflection | Adicionar checkpoint de auto-avaliação |
| P3 — Goal Persistence | Adicionar goal re-injection a cada N steps |

**Memory Optimizations**

| Critério | Técnica |
|----------|---------|
| M1 — Working Memory | Implementar compaction + just-in-time retrieval |
| M2 — Long-Term Memory | Adicionar persistência (files, memory dir) |
| M3 — Cross-Agent Memory | Implementar handoff protocol com artifact |

**Tool Use Optimizations**

| Critério | Técnica |
|----------|---------|
| T1 — Tool Coverage | Adicionar tools faltantes (scout → smith) |
| T2 — Tool Quality | Refatorar tools para ACI compliance |
| T3 — Error Recovery | Adicionar retry logic + fallback tools |

### Step 4: Update Agent File

Editar o `.md` do agente incorporando as otimizações.

Manter histórico de versão no agent file:

```yaml
version: "{{next_version}}"  # incrementar minor para otimizações
changelog:
  - "{{next_version}}: {{optimization_summary}}"
```

### Step 5: Re-validate

Rodar autonomy-checklist novamente no agente otimizado.

Comparar scores antes/depois:

```text
## Optimization Results

| Critério | Antes | Depois | Delta |
|----------|-------|--------|-------|
| P1 | 5 | 8 | +3 |
| Overall | 45/90 | 62/90 | +17 |
| Level | L2 | L3 | +1 |
```

### Step 6: Deliver

- Agent file atualizado
- Optimization report com antes/depois
- Recomendações para próxima iteração (se nível alvo não atingido)

## Post-conditions

- [ ] Agent file atualizado com otimizações
- [ ] Score de autonomia melhorou
- [ ] Changelog atualizado no agent file
- [ ] Re-validação executada

## Quality Gate

- **QG-003**: Architecture Review
