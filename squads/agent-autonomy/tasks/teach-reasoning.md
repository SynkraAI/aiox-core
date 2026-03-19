---
task: teachReasoning()
responsavel: "ReasoningEngineer"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: concept_or_pattern
    tipo: string
    obrigatorio: true
  - nome: agent_id
    tipo: string
    obrigatorio: false
Saida:
  - nome: reasoning_section
    tipo: markdown
    obrigatorio: true
Checklist:
  - Pattern explicado com clareza
  - Exemplos concretos fornecidos
  - Anti-patterns documentados
---

# Task: Teach Reasoning

## Metadata

- **id**: AA-T007
- **name**: teach-reasoning
- **primary_agent**: reasoning-engineer
- **trigger**: `*teach <agent-id> <pattern>` ou `*teach <concept>`
- **inputs**: agent-id (opcional) + conceito/pattern a ensinar
- **outputs**: instruções aplicadas ao agente ou explicação educativa

## Description

Ensinar COMO um agente deve raciocinar e atuar — não O QUE fazer. Foco em patterns de reasoning, self-evaluation, error recovery e halt conditions. Baseado na pedagogia de Shunyu Yao (ReAct/ToT) e Noah Shinn (Reflexion).

## Pre-conditions

- [ ] Conceito ou pattern identificado
- [ ] Agente alvo identificado (se aplicável)

## Steps

### Step 1: Identify What to Teach

| Request | Teaching Path |
|---------|--------------|
| "Como o agente deve pensar?" | Reasoning pattern selection |
| "O agente não sabe quando parar" | Halt conditions + evaluator design |
| "O agente fica em loop" | Loop detection + escalation |
| "O agente não corrige erros" | Self-reflection + Reflexion pattern |
| "O agente perde o foco" | Goal persistence + scope boundaries |
| "Qual pattern usar?" | Pattern selection decision tree |

### Step 2: Explain the Pattern

Para cada pattern, ensinar com a estrutura:

```text
## Pattern: {nome}

### O que é
{definição em 1-2 frases}

### Quando usar
{critérios claros de quando este pattern é adequado}

### Quando NÃO usar
{anti-patterns, situações onde outro pattern é melhor}

### Como implementar no prompt
{instruções concretas para embutir no prompt do agente}

### Exemplo
{exemplo concreto de uso}

### Failure modes
{o que pode dar errado e como prevenir}
```

### Step 3: Apply to Agent (se aplicável)

Se um agent-id foi fornecido:

1. Ler o agent file atual
2. Identificar onde o pattern deve ser inserido
3. Gerar a seção de reasoning para o agent file
4. Sugerir edição (não editar diretamente sem aprovação)

### Step 4: Teach Self-Evaluation

Independente do pattern, SEMPRE ensinar:

**5 Princípios de Autonomia:**

1. **Ensinar patterns, não respostas** — o agente aprende a pensar, não a copiar
2. **Ensinar self-evaluation** — critérios mensuráveis de "completei corretamente"
3. **Ensinar error taxonomy** — classificar erros em recuperáveis vs fatais
4. **Ensinar quando parar** — halt conditions explícitas (max steps + progress check)
5. **Ensinar quando escalar** — critérios claros de "preciso de ajuda humana"

### Step 5: Deliver

**Se aplicado a agente**: seção de reasoning pronta para inserir no agent file
**Se educativo**: explicação completa do conceito com exemplos

## Teaching Library (Quick Reference)

### ReAct (90% dos casos)

```text
Para CADA step, siga este ciclo:
1. THOUGHT: O que preciso fazer agora? Por quê?
2. ACTION: Qual tool/ação executo?
3. OBSERVATION: O que o resultado me diz?
4. Repita até atingir o objetivo ou max steps.
```

**Custo**: baixo (1 call/step)
**Quando**: qualquer task com tool use

### Reflexion (8% dos casos)

```text
1. EXECUTE: Tente completar a task
2. EVALUATE: O resultado atende os critérios?
3. REFLECT: Se não, o que deu errado? O que fazer diferente?
4. RETRY: Execute novamente com a reflexão em mente
(max N tentativas)
```

**Custo**: médio (N tentativas)
**Quando**: critério claro de sucesso/falha + budget de retry

### Tree of Thoughts (1.5% dos casos)

```text
1. GENERATE: Proponha K abordagens diferentes
2. EVALUATE: Qual tem maior probabilidade de sucesso?
3. EXPLORE: Siga a melhor, mantenha as outras como backup
4. BACKTRACK: Se a melhor falhar, tente a próxima
```

**Custo**: alto (K × depth calls)
**Quando**: planejamento complexo com risco de dead ends

### LATS (0.5% dos casos)

```text
MCTS: Select → Expand → Simulate → Backpropagate → Reflect
```

**Custo**: muito alto
**Quando**: tasks de altíssimo valor com espaço de busca grande

## Post-conditions

- [ ] Pattern explicado com clareza
- [ ] Exemplos concretos fornecidos
- [ ] Se aplicado a agente: seção pronta para inserção
- [ ] Anti-patterns documentados

## Quality Gate

- **QG-004**: Reasoning Validated
