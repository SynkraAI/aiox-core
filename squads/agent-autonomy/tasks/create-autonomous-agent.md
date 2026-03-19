---
task: createAutonomousAgent()
responsavel: "AgentArchitect"
responsavel_type: Agente
atomic_layer: Organism
Entrada:
  - nome: agent_name
    tipo: string
    obrigatorio: true
  - nome: domain
    tipo: string
    obrigatorio: true
  - nome: objective
    tipo: string
    obrigatorio: true
  - nome: available_tools
    tipo: list
    obrigatorio: true
  - nome: target_level
    tipo: string
    obrigatorio: false
Saida:
  - nome: agent_file
    tipo: markdown
    obrigatorio: true
  - nome: validation_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Agent file criado no path correto
  - Autonomy checklist >= 13/18
  - Reasoning pattern documentado
  - Det vs prob separados
  - Halt condition definida
  - Security check lethal trifecta < 3
---

# Task: Create Autonomous Agent

## Metadata

- **id**: AA-T002
- **name**: create-autonomous-agent
- **primary_agent**: agent-architect
- **secondary**: reasoning-engineer, tool-smith
- **trigger**: `*create <agent-name>`
- **inputs**: agent requirements (nome, domínio, objetivo, tools disponíveis)
- **outputs**: agent file (.md) + validation report

## Description

Criar um novo agente autônomo do zero, aplicando os frameworks de autonomia do squad. O agente resultante deve atingir no mínimo L3 na classificação de autonomia.

## Pre-conditions

- [ ] Nome do agente definido
- [ ] Domínio de atuação claro
- [ ] Objetivo principal especificado
- [ ] Tools disponíveis inventariados

## Steps

### Step 1: Define Agent Requirements

Coletar do usuário:

- **Nome**: identificador único do agente
- **Domínio**: área de atuação (ex: "code review", "content generation")
- **Objetivo**: o que o agente deve atingir autonomamente
- **Tools**: quais ferramentas o agente terá acesso
- **Nível alvo**: L3 (mínimo), L4 ou L5

### Step 2: Select Reasoning Pattern

Consultar reasoning-engineer para decidir:

| Complexidade da task | Pattern recomendado |
|---------------------|---------------------|
| Simples, com tool use | ReAct |
| Iterativa, com critério de sucesso | Reflexion |
| Planejamento com dead ends | Tree of Thoughts |
| Alto valor + espaço de busca grande | LATS |

**Regra**: usar o pattern MAIS SIMPLES que resolve.

### Step 3: Design Architecture

Aplicar os 4 frameworks do agent-architect:

1. **Workflow vs Agent**: a task precisa de agente ou um workflow resolve?
2. **ACI Design**: tools seguem os 5 princípios?
3. **Context Engineering**: o que entra no context window e em que ordem?
4. **Det vs Prob split**: quais partes são LLM, quais são código?

### Step 4: Build Agent File

Gerar o `.md` do agente com as 10 seções obrigatórias:

```text
1. activation-instructions
2. agent (id, name, role, tier, version, squad, description, primary_minds)
3. persona (voice_dna)
4. methodology / frameworks
5. commands (com aliases pt-br)
6. quality_gate
7. dependencies (tasks, data, receives_from, hands_off_to)
8. security (lethal trifecta check)
9. error_handling
10. halt_conditions
```

### Step 5: Validate Autonomy

Rodar a autonomy-checklist (18 items) no agente criado:

- **>= 13/18**: L3+ — OK para uso
- **>= 15/18**: L4+ — Bom
- **>= 17/18**: L5 — Excelente
- **< 13/18**: Requer fixes antes de usar

### Step 6: Identify Missing Tools

Se T1 (Tool Coverage) falhou:

1. Consultar ecosystem-scout para libs existentes
2. Se nada encontrado → spec para tool-smith construir

### Step 7: Deliver

Entregar:

- Agent file (.md) pronto para uso
- Validation report com scores
- Lista de tools necessárias (se houver gaps)

## Post-conditions

- [ ] Agent file criado no path correto
- [ ] Autonomy checklist >= 13/18
- [ ] Reasoning pattern documentado
- [ ] Det vs Prob claramente separados
- [ ] Halt condition definida
- [ ] Security check: lethal trifecta < 3

## Quality Gate

- **QG-003**: Architecture Review
- Critério: agent file completo, autonomy >= 13/18, security check passed

## Handoff

| Situação | Próximo Agent |
|----------|---------------|
| Tool gaps identificados | → ecosystem-scout → tool-smith |
| Reasoning pattern complexo | → reasoning-engineer |
| Validação final | → autonomy-auditor (*audit) |
