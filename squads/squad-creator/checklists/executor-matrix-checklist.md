# Executor Matrix Validation Checklist

> **Pattern Reference:** HO-EP-xxx (Executor Patterns)
> **Source:** AIOS Executor Matrix Standard
> **Version:** 1.0.0
> **Updated:** 2026-01-24

Este checklist valida a correta atribuicao de executores em tasks de squads.

---

## 1. Validacao dos 4 Tipos de Executor

### 1.1 Human (HO-EP-001)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Human` | |
| [ ] Task requer julgamento critico ou decisao estrategica | |
| [ ] Task envolve criatividade nao-padronizada | |
| [ ] Task requer relacionamentos interpessoais | |
| [ ] Task envolve negociacao ou persuasao | |
| [ ] Custo alto ($$) justificado pelo valor | |
| [ ] Velocidade lenta e aceitavel para o contexto | |

**Caracteristicas Human:**
- **Custo:** $$$ (Alto - tempo humano e valioso)
- **Velocidade:** Lenta (horas a dias)
- **Forca:** Julgamento, criatividade, empatia, intuicao
- **Fraqueza:** Inconsistencia, fadiga, escalabilidade limitada

---

### 1.2 Agent (AI) (HO-EP-002)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Agent` | |
| [ ] Task requer analise de grande volume de dados | |
| [ ] Task requer geracao de conteudo estruturado | |
| [ ] Task requer reconhecimento de padroes | |
| [ ] Task requer velocidade de execucao | |
| [ ] Output e auditavel e validavel | |
| [ ] Fallback para Hybrid definido | |

**Caracteristicas Agent:**
- **Custo:** $$$$ (Alto - tokens AI)
- **Velocidade:** Rapida (segundos a minutos)
- **Forca:** Analise, geracao, padroes, escala
- **Fraqueza:** Alucinacao, falta de contexto real-world

---

### 1.3 Hybrid (HO-EP-003)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Hybrid` | |
| [ ] AI assiste na execucao | |
| [ ] Humano valida o resultado | |
| [ ] Handoff entre AI e humano definido | |
| [ ] Criterios de validacao claros | |
| [ ] Tempo de resposta humana considerado | |

**Caracteristicas Hybrid:**
- **Custo:** $$ (Moderado - AI + supervisao)
- **Velocidade:** Moderada (minutos a horas)
- **Forca:** Combina escala AI com julgamento humano
- **Fraqueza:** Complexidade de coordenacao

---

### 1.4 Worker (HO-EP-004)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Worker` | |
| [ ] Task e 100% deterministica | |
| [ ] Task nao requer julgamento | |
| [ ] Task e baseada em APIs ou file operations | |
| [ ] Idempotencia garantida | |
| [ ] Retry logic implementado | |
| [ ] Logs e auditoria habilitados | |

**Caracteristicas Worker:**
- **Custo:** $ (Baixo - computacao pura)
- **Velocidade:** Muito rapida (milissegundos a segundos)
- **Forca:** Consistencia, velocidade, custo, escala infinita
- **Fraqueza:** Zero adaptabilidade, requer especificacao perfeita

---

## 2. Matriz de Decisao Rapida

Use esta matriz para determinar o tipo de executor correto:

| Requisito da Task | Executor Correto | Justificativa |
|-------------------|------------------|---------------|
| `requires_creativity` | **Human** | Criatividade genuina requer mente humana |
| `requires_judgment` | **Human** ou **Hybrid** | Julgamento critico nao deve ser delegado |
| `requires_speed` | **Agent** ou **Worker** | Automacao e mais rapida que humanos |
| `requires_consistency` | **Worker** | Determinismo garante consistencia |
| `requires_validation` | **Hybrid** | AI produz, humano valida |
| `requires_learning` | **Agent** | AI pode adaptar com novos dados |
| `requires_negotiation` | **Human** | Relacionamentos sao humanos |
| `requires_empathy` | **Human** | Empatia genuina requer humano |
| `requires_scale` | **Agent** ou **Worker** | Humanos nao escalam |
| `requires_cost_efficiency` | **Worker** | Menor custo por operacao |

---

## 3. Checklist de Atribuicao Correta

### 3.1 Pre-Atribuicao

| Criterio | Status |
|----------|--------|
| [ ] Task anatomy completa (8 campos obrigatorios) | |
| [ ] Inputs e outputs claramente definidos | |
| [ ] Acceptance criteria especificados | |
| [ ] Estimativa de tempo realista | |
| [ ] Dependencias mapeadas | |

### 3.2 Analise de Requisitos

| Criterio | Status |
|----------|--------|
| [ ] Requisitos da task listados | |
| [ ] Matriz de decisao consultada | |
| [ ] Tipo de executor selecionado | |
| [ ] Justificativa documentada (`rationale` field) | |

### 3.3 Validacao da Atribuicao

| Criterio | Status |
|----------|--------|
| [ ] Executor tem capacidade para a task | |
| [ ] Custo e aceitavel para o valor gerado | |
| [ ] Velocidade atende SLA do workflow | |
| [ ] Fallback definido (se aplicavel) | |
| [ ] Pattern ID referenciado (HO-EP-xxx) | |

### 3.4 Exemplo de Atribuicao Correta

```yaml
- id: "analyze-briefing"
  task_name: "Analisar Completude do Briefing"
  execution_type: Agent
  responsible_executor: "@briefing-analyzer"
  executor:
    type: Agent
    pattern: HO-EP-002
    rationale: "Analise de padroes em documento estruturado"
    fallback: Hybrid
    fallback_trigger: "confidence < 0.7"
```

---

## 4. Validacao de Fallbacks

### 4.1 Quando Fallback e Obrigatorio

| Tipo Principal | Fallback Requerido? | Fallback Recomendado |
|----------------|---------------------|----------------------|
| Human | Nao | - |
| Agent | **Sim** | Hybrid |
| Hybrid | Opcional | Human |
| Worker | **Sim** | Hybrid ou Human |

### 4.2 Checklist de Fallback

| Criterio | Status |
|----------|--------|
| [ ] Executor principal definido | |
| [ ] Fallback definido (se requerido) | |
| [ ] Trigger de fallback especificado | |
| [ ] Fallback tem capacidade para assumir | |
| [ ] Transicao de handoff documentada | |
| [ ] Alertas configurados para fallback activation | |

### 4.3 Exemplos de Fallback Triggers

```yaml
# Agent -> Hybrid fallback
fallback:
  to: Hybrid
  triggers:
    - condition: "confidence < 0.7"
      action: "Escalar para revisao humana"
    - condition: "error_rate > 0.1"
      action: "Pausar e notificar"
    - condition: "timeout > 30s"
      action: "Fallback imediato"

# Worker -> Human fallback
fallback:
  to: Human
  triggers:
    - condition: "api_failure"
      action: "Notificar para execucao manual"
    - condition: "validation_failed"
      action: "Revisao humana obrigatoria"
```

---

## 5. Anti-Patterns a Evitar

### 5.1 Atribuicoes Incorretas

| Anti-Pattern | Problema | Correcao |
|--------------|----------|----------|
| Agent para decisao estrategica | AI nao tem contexto de negocio | Usar Human |
| Human para data entry | Desperdicio de tempo humano | Usar Worker |
| Worker para analise de texto | Worker nao "entende" | Usar Agent |
| Hybrid sem criterios de validacao | Humano nao sabe o que validar | Definir criterios |
| Agent sem fallback | Falha silenciosa possivel | Adicionar Hybrid fallback |

### 5.2 Checklist Anti-Patterns

| Criterio | Status |
|----------|--------|
| [ ] Nenhum Human atribuido a task repetitiva | |
| [ ] Nenhum Agent atribuido a decisao critica | |
| [ ] Nenhum Worker atribuido a task que requer julgamento | |
| [ ] Todo Agent tem fallback definido | |
| [ ] Todo Worker tem fallback definido | |
| [ ] Todo Hybrid tem criterios de validacao | |

---

## 6. Resumo de Validacao Final

### Checklist Consolidado

| # | Item | Status |
|---|------|--------|
| 1 | Todos os 4 tipos documentados no squad | [ ] |
| 2 | Cada task tem `execution_type` definido | [ ] |
| 3 | Cada task tem `responsible_executor` definido | [ ] |
| 4 | Pattern ID referenciado (HO-EP-xxx) | [ ] |
| 5 | Rationale documentado para cada atribuicao | [ ] |
| 6 | Matriz de decisao utilizada | [ ] |
| 7 | Fallbacks definidos onde requerido | [ ] |
| 8 | Fallback triggers especificados | [ ] |
| 9 | Anti-patterns verificados e ausentes | [ ] |
| 10 | Custos e velocidades compatíveis com SLAs | [ ] |

---

## Referencias

- `squads/squad-creator/data/best-practices.md` Section 1.2
- Pattern Library: HO-EP-001 a HO-EP-004

---

*Squad-Creator Checklist v1.0.0*
*Based on AIOS reference implementation*
