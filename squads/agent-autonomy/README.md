# Agent Autonomy Squad

Squad para auditar, criar, diagnosticar e otimizar agentes autônomos. Baseado em 14 elite minds da pesquisa e prática de agentes de IA.

## Quick Start

```text
/agent-autonomy:chief        Ativa o orchestrador (triage automático)
/agent-autonomy:audit         Auditar um agente existente
/agent-autonomy:create        Criar agente autônomo
/agent-autonomy:diagnose      Diagnosticar falhas de autonomia
/agent-autonomy:teach         Ensinar reasoning patterns
/agent-autonomy:find          Pesquisar libs/repos/benchmarks
```

## Arquitetura

```text
Orchestrator    autonomy-chief ──────── triage + routing
                     │
Tier 0          autonomy-auditor ────── diagnóstico + scoring (3 Pilares + L1-L5)
                     │
Tier 1          agent-architect ─────── design + otimização (ACI, Context Engineering)
                reasoning-engineer ──── patterns + teaching (ReAct, Reflexion, ToT, LATS)
                     │
Tier 2          tool-smith ──────────── build tools/scripts/docs (IMPACT, Lethal Trifecta)
                ecosystem-scout ─────── research open-source (Exa MCP, evaluation rubric)
```

## Use Cases

| ID | Use Case | Agente Primário |
|----|----------|-----------------|
| UC1 | Auditar agente existente | autonomy-auditor |
| UC2 | Criar agente autônomo | agent-architect |
| UC3 | Diagnosticar falhas de autonomia | autonomy-auditor |
| UC4 | Otimizar agente existente | agent-architect + reasoning-engineer |
| UC5 | Sugerir construção de tools | tool-smith |
| UC6 | Recomendar repos open-source | ecosystem-scout |
| UC7 | Ensinar COMO o agente deve atuar | reasoning-engineer |
| UC8 | Análise determinístico vs probabilístico | autonomy-auditor + agent-architect |
| UC9 | Construção de docs .md auxiliares | tool-smith |
| UC10 | Construção de scripts auxiliares | tool-smith |
| UC11 | Buscar bibliotecas Python para autonomia | ecosystem-scout |

## Frameworks Core

| Framework | Autor | Uso no Squad |
|-----------|-------|--------------|
| 3 Pilares (Planning, Memory, Tool Use) | Lilian Weng | Diagnóstico de autonomia |
| ACI (Agent-Computer Interface) | Erik Schluntz | Design de tools |
| Autonomy Levels L1-L5 | Knight Institute | Classificação de agentes |
| ReAct / Reflexion / ToT / LATS | Yao, Shinn, Zhou | Reasoning patterns |
| IMPACT | swyx | Agent engineering |
| Lethal Trifecta | swyx | Security check |
| Context Engineering | Harrison Chase | Otimização de context window |
| Rule Maker Pattern | Schluntz | Separação det vs prob |

## Estrutura de Arquivos

```text
squads/agent-autonomy/
├── agents/
│   ├── autonomy-chief.md          Orchestrador — triage e routing
│   ├── autonomy-auditor.md        Tier 0 — diagnóstico e scoring
│   ├── agent-architect.md         Tier 1 — design e otimização
│   ├── reasoning-engineer.md      Tier 1 — reasoning patterns
│   ├── tool-smith.md              Tier 2 — construção de tools
│   └── ecosystem-scout.md         Tier 2 — pesquisa open-source
├── tasks/
│   ├── audit-agent.md             Auditar agente (9 critérios + 4 FMs)
│   ├── create-autonomous-agent.md Criar agente L3+
│   ├── diagnose-autonomy-failure.md Diagnóstico com 5 Whys
│   ├── optimize-agent.md          Otimizar por impact score
│   ├── suggest-tools.md           Buscar/construir tools ACI
│   ├── search-ecosystem.md        Pesquisar libs com rubric
│   └── teach-reasoning.md         Ensinar patterns de reasoning
├── workflows/
│   ├── audit-optimize-cycle.md    Ciclo audit → optimize (max 3 iter)
│   └── create-agent-flow.md       Fluxo completo de criação
├── checklists/
│   └── autonomy-checklist.md      18 items — threshold L3/L4/L5
├── data/
│   └── agent-autonomy-kb.md       Knowledge base consolidada
├── config.yaml                    Configuração do squad
├── README.md
└── CHANGELOG.md
```

## Quality Gates

| ID | Nome | Owner | Tipo |
|----|------|-------|------|
| QG-001 | Request Classification | autonomy-chief | routing |
| QG-002 | Diagnosis Complete | autonomy-auditor | blocking |
| QG-003 | Architecture Review | agent-architect | blocking |
| QG-004 | Reasoning Validated | reasoning-engineer | blocking |
| QG-005 | Tool Quality | tool-smith | blocking |
| QG-006 | Final Validation | autonomy-chief | blocking |

## Autonomy Checklist (resumo)

18 items across 5 categorias:

- **Planning** (peso 0.35): Task Decomposition, Self-Reflection, Goal Persistence
- **Memory** (peso 0.30): Working Memory, Long-Term Memory, Cross-Agent Memory
- **Tool Use** (peso 0.35): Tool Coverage, Tool Quality (ACI), Error Recovery
- **Failure Modes**: Context Saturation, Tool Brittleness, Reasoning Drift, Evaluator Absence
- **Autonomia Geral**: 80%+ tasks sem intervenção, det vs prob separados, halt condition, escalation criteria, security check

Thresholds: >= 13/18 para L3+, >= 15/18 para L4+, >= 17/18 para L5.

## Elite Minds (14)

| Mente | Contribuição |
|-------|-------------|
| Lilian Weng | 3 Pilares (Planning, Memory, Tool Use) |
| Erik Schluntz | ACI — 5 princípios de tool design |
| Harrison Chase | Context Engineering |
| Shunyu Yao | ReAct, Tree of Thoughts |
| Noah Shinn | Reflexion |
| Andy Zhou | LATS (Language Agent Tree Search) |
| Andrew Ng | 4 Agentic Design Patterns, Eval-Driven Dev |
| João Moura | CrewAI, Multi-Agent Orchestration |
| Beth Barnes | METR — Agent Evaluation |
| Shawn Wang (swyx) | IMPACT Framework, Lethal Trifecta |
| Simon Willison | Agentic Engineering Patterns |
| Chi Wang | AutoGen, Multi-Agent Conversations |
| Yohei Nakajima | BabyAGI, Task-Driven Agents |
| Karthik Narasimhan | WebArena, Agent Benchmarks |

## Validação

```yaml
validated: true
score: 7.4/10
date: 2026-03-01
type: Expert Squad
result: PASS
```
