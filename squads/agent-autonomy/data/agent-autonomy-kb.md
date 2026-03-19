# Agent Autonomy Knowledge Base

## Overview

Base de conhecimento do Agent Autonomy Squad. Consolida os conceitos, frameworks e referências essenciais para auditar, criar e otimizar agentes autônomos.

## 1. Definição de Agente Autônomo

> "An LLM agent runs tools in a loop to achieve a goal." — Simon Willison

Um agente autônomo é um sistema que:

1. **Recebe um objetivo** (não instruções step-by-step)
2. **Planeja** como atingir o objetivo (decompõe em sub-tarefas)
3. **Executa** ações via tools (APIs, código, filesystem)
4. **Observa** resultados e adapta
5. **Auto-avalia** se completou corretamente
6. **Escala** para humano apenas quando necessário

## 2. Os 3 Pilares (Lilian Weng)

Fonte: [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)

### Planning

- **Task Decomposition**: quebrar objetivo em sub-tarefas executáveis
- **Self-Reflection**: avaliar próprio progresso e corrigir curso
- **Goal Persistence**: manter foco ao longo de múltiplos steps

### Memory

- **Working Memory**: context window atual (in-context)
- **Long-Term Memory**: persistente entre sessões (files, vector DB, episodic)
- **Cross-Agent Memory**: preservação de contexto em handoffs

### Tool Use

- **Tool Coverage**: ter ferramentas suficientes para as tarefas
- **Tool Quality (ACI)**: tools bem desenhadas (single responsibility, idempotent, documented)
- **Error Recovery**: lidar com falhas de tools graciosamente

## 3. Níveis de Autonomia (Knight Institute)

Fonte: [Levels of Autonomy for AI Agents](https://knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1)

| Nível | Role Humano | Descrição |
|-------|-------------|-----------|
| L1 | Operator | Humano aprova cada ação |
| L2 | Collaborator | Humano edita outputs, delega chunks |
| L3 | Consultant | Agente executa por períodos, pede guidance |
| L4 | Approver | Humano só resolve blockers e ações irreversíveis |
| L5 | Observer | Humano só monitora logs |

**Key insight**: Autonomia é decisão de DESIGN, não threshold de capability.

## 4. Os 4 Failure Modes

### FM-1: Context Saturation

- **Causa**: context window enche com dados stale
- **Sintoma**: qualidade degrada ao longo da conversa
- **Fix**: compaction, just-in-time retrieval, sub-agents

### FM-2: Tool Brittleness

- **Causa**: tools mal documentadas ou com retornos ambíguos
- **Sintoma**: retry rate alto, agente não sabe qual tool usar
- **Fix**: ACI redesign (5 princípios)

### FM-3: Reasoning Drift

- **Causa**: agente segue sub-problemas irrelevantes
- **Sintoma**: muitos steps sem progresso, perguntas tangenciais
- **Fix**: goal re-injection, scope boundaries, max steps

### FM-4: Evaluator Absence

- **Causa**: agente não sabe se completou corretamente
- **Sintoma**: pergunta "fiz certo?" ou loop infinito
- **Fix**: critérios de sucesso mensuráveis, self-evaluation, quality gates

## 5. Reasoning Patterns

### ReAct (90% dos casos)

```
Thought → Action → Observation → repeat
```

- Custo: baixo (1 call/step)
- Quando: qualquer task com tool use

### Reflexion (8% dos casos)

```
Execute → Evaluate → Self-Reflect → Retry (com memória da reflexão)
```

- Custo: médio (N tentativas)
- Quando: tasks com critério claro de sucesso/falha e budget de retry

### Tree of Thoughts (1.5% dos casos)

```
Generate k candidates → Evaluate each → Explore best → Backtrack if needed
```

- Custo: alto (k × d calls)
- Quando: planejamento complexo com risco de dead ends

### LATS (0.5% dos casos)

```
MCTS: Select → Expand → Simulate → Backpropagate → Reflect
```

- Custo: muito alto
- Quando: tasks de altíssimo valor com espaço de busca grande

**Regra**: usar o pattern MAIS SIMPLES que resolve.

## 6. Determinístico vs Probabilístico

**Regra de ouro**: "LLM decide, código executa."

| Operação | Determinístico | Probabilístico |
|----------|---------------|----------------|
| Routing | Regras estáveis | Categorias fuzzy |
| Data transform | SEMPRE | NUNCA |
| Execução de ações | SEMPRE | NUNCA |
| Planejamento | NUNCA | SEMPRE |
| Avaliação | Métricas | Semântica |

### Rule Maker Pattern

```
User request → LLM gera regra/comando → Código executa regra → Resultado
```

Separa failure modes: erros de LLM pegos na geração, erros de execução surfaced para retry.

## 7. ACI — Agent-Computer Interface

Fonte: [Building Effective Agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)

5 princípios para tools de agentes:

1. **Single Responsibility**: cada tool faz 1 coisa
2. **Descriptive Parameters**: nomes e docs auto-evidentes
3. **Token-Efficient Returns**: retornar só o necessário
4. **Idempotency**: safe to call twice
5. **Comprehensive Docs**: o quê, quando, exemplos, edge cases

### Poka-yoke

Modificar interfaces para prevenir erros comuns:

- Aceitar paths absolutos E relativos
- Normalizar inputs (trim, lowercase)
- Retornar sugestões em erros ("did_you_mean")
- Defaults sensatos

## 8. Context Engineering

Fonte: [Effective Context Engineering (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

> "Intelligence is not the bottleneck, context is." — Harrison Chase

### Prioridade no Context Window

1. System instructions
2. Tool definitions
3. Current task state
4. Few-shot examples
5. Just-in-time data
6. Message history (pruned)

### Context Rot

200K tokens ≠ 10x melhor que 20K. Tokens stale degradam ATIVAMENTE a qualidade. Compaction melhora output quality, não só eficiência.

## 9. Security — Lethal Trifecta

Fonte: swyx (Latent.Space)

Se uma tool combina TODOS os 3 fatores, é vulnerável por design:

1. Acesso a dados privados
2. Exposição a conteúdo não-confiável
3. Comunicação externa

**3/3**: BLOCK e redesenhar. **2/3**: WARN e adicionar guardrails.

## 10. Referências Essenciais

| Recurso | Autor | URL |
|---------|-------|-----|
| LLM Powered Autonomous Agents | Lilian Weng | lilianweng.github.io/posts/2023-06-23-agent/ |
| Building Effective Agents | Anthropic (Schluntz, Zhang) | anthropic.com/research/building-effective-agents |
| Context Engineering | Anthropic | anthropic.com/engineering/effective-context-engineering |
| Levels of Autonomy | Knight Institute | knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1 |
| ReAct Paper | Yao et al. | arxiv.org/abs/2210.03629 |
| Reflexion Paper | Shinn et al. | arxiv.org/abs/2303.11366 |
| LATS Paper | Zhou et al. | arxiv.org/abs/2310.04406 |
| IMPACT Framework | swyx | latent.space/p/agent |
| Agentic Engineering Patterns | Simon Willison | simonwillison.net/2026/Feb/23/agentic-engineering-patterns/ |
| METR Evaluation | Beth Barnes | metr.org |
