# Quality Gate Validation Checklist

> **Pattern:** HO-PP-003 (Quality Gate Pattern)
> **Version:** 1.0.0
> **Source:** AIOS Quality Gate Standard
> **Updated:** 2026-01-24

Este checklist valida a estrutura e conformidade de Quality Gates conforme o padrao HO-PP-003.

---

## 1. Campos Obrigatorios

Todo Quality Gate DEVE conter os seguintes campos:

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `id` | string | Identificador unico no formato QG-X.Y | `QG-1.1B` |
| `name` | string | Nome descritivo do gate | `Briefing Completeness Gate` |
| `phase` | number | Numero da fase do workflow | `1` |
| `placement` | enum | Posicao do gate na fase | `transition` |
| `type` | enum | Tipo de execucao do gate | `hybrid` |
| `severity` | enum | Nivel de severidade | `blocking` |
| `criteria` | array | Lista de criterios de validacao | Ver secao 3 |
| `executor` | object | Quem executa a validacao | Ver secao 6 |
| `pass_action` | array | Acoes quando aprovado | `["Status -> Aprovado"]` |
| `fail_action` | array | Acoes quando reprovado | `["Status -> Bloqueado"]` |

### Checklist de Campos Obrigatorios

- [ ] `id` presente e no formato `QG-{phase}.{sequence}[suffix]`
- [ ] `name` presente e descritivo
- [ ] `phase` presente e numerico
- [ ] `placement` presente e com valor valido
- [ ] `type` presente e com valor valido
- [ ] `severity` presente e com valor valido
- [ ] `criteria` presente e array nao-vazio
- [ ] `executor` presente e objeto valido
- [ ] `pass_action` presente e array nao-vazio
- [ ] `fail_action` presente e array nao-vazio

---

## 2. Tipos Validos (type)

O campo `type` define COMO o gate e executado:

| Tipo | Descricao | Quando Usar |
|------|-----------|-------------|
| `manual` | Validacao humana completa | Decisoes criticas, aprovacoes finais |
| `automated` | Validacao 100% automatizada | Dados minimos, formatos, thresholds |
| `hybrid` | AI analisa + humano valida | Revisoes assistidas, aprovacoes complexas |
| `external` | Sistema externo valida | Webhooks, APIs terceiras |

### Checklist de Tipo

- [ ] `type` e um dos valores: `manual`, `automated`, `hybrid`, `external`
- [ ] Tipo escolhido e apropriado para o contexto:
  - [ ] `manual` -> Requer julgamento humano?
  - [ ] `automated` -> Pode ser validado por regras?
  - [ ] `hybrid` -> Beneficia de AI + supervisao?
  - [ ] `external` -> Depende de sistema externo?

---

## 3. Severidades Validas (severity)

O campo `severity` define O QUE ACONTECE se o gate falhar:

| Severidade | Descricao | Comportamento |
|------------|-----------|---------------|
| `blocking` | Gate bloqueante | Impede avanco; requer correcao |
| `warning` | Gate de alerta | Permite avanco; registra alerta |
| `info` | Gate informativo | Apenas registra; nao afeta fluxo |

### Checklist de Severidade

- [ ] `severity` e um dos valores: `blocking`, `warning`, `info`
- [ ] Severidade e apropriada para o impacto:
  - [ ] `blocking` -> Falha causa dano significativo?
  - [ ] `warning` -> Falha e relevante mas nao critica?
  - [ ] `info` -> Apenas para rastreamento/metricas?

---

## 4. Placements Validos (placement)

O campo `placement` define ONDE o gate e executado na fase:

| Placement | Descricao | Quando Usar |
|-----------|-----------|-------------|
| `entry` | Entrada da fase | Validar pre-condicoes antes de iniciar |
| `transition` | Transicao entre fases | Validar antes de passar para proxima fase |
| `exit` | Saida da fase | Validar resultado final da fase |

### Checklist de Placement

- [ ] `placement` e um dos valores: `entry`, `transition`, `exit`
- [ ] Placement e logico para o workflow:
  - [ ] `entry` -> Valida requisitos de entrada?
  - [ ] `transition` -> Valida criterios de passagem?
  - [ ] `exit` -> Valida entregaveis finais?

---

## 5. Estrutura de Criteria

O campo `criteria` e um array de objetos com a seguinte estrutura:

```yaml
criteria:
  - check: "Descricao do que esta sendo validado"
    type: "threshold | presence | enum | count"
    field: "nome_do_campo"
    value: valor_esperado
    operator: ">= | == | contains | > | < | != | in"
    weight: 0.0-1.0  # Opcional
```

### Campos do Criteria

| Campo | Obrigatorio | Descricao | Valores |
|-------|-------------|-----------|---------|
| `check` | Sim | Descricao legivel | String |
| `type` | Sim | Tipo de validacao | `threshold`, `presence`, `enum`, `count` |
| `field` | Condicional | Campo a validar | Nome do campo |
| `value` | Condicional | Valor esperado | Depende do tipo |
| `operator` | Condicional | Operador de comparacao | `>=`, `==`, `>`, `<`, `!=`, `contains`, `in` |
| `weight` | Nao | Peso na media ponderada | 0.0 a 1.0 |

### Tipos de Criteria

| Tipo | Descricao | Campos Requeridos |
|------|-----------|-------------------|
| `threshold` | Valor numerico minimo/maximo | `field`, `value`, `operator` |
| `presence` | Campo deve existir/ter valor | `field` |
| `enum` | Valor deve estar em lista | `field`, `value` (array) |
| `count` | Quantidade de itens | `field`, `value`, `operator` |

### Checklist de Criteria

- [ ] `criteria` e um array nao-vazio
- [ ] Cada item possui `check` descritivo
- [ ] Cada item possui `type` valido
- [ ] Para `threshold`:
  - [ ] `field` presente
  - [ ] `value` e numerico
  - [ ] `operator` e um de: `>=`, `>`, `<`, `<=`, `==`, `!=`
- [ ] Para `presence`:
  - [ ] `field` presente
- [ ] Para `enum`:
  - [ ] `field` presente
  - [ ] `value` e array de opcoes validas
- [ ] Para `count`:
  - [ ] `field` presente
  - [ ] `value` e numerico
  - [ ] `operator` presente

---

## 6. Estrutura de Thresholds

O campo `thresholds` define limites para decisao automatica:

```yaml
thresholds:
  pass: 0.60    # >= este valor = APROVADO
  review: 0.40  # >= este valor = REVISAO MANUAL
  fail: 0.40    # < este valor = REPROVADO
```

### Regras de Thresholds

| Threshold | Descricao | Regra |
|-----------|-----------|-------|
| `pass` | Limite para aprovacao automatica | Score >= pass = PASS |
| `review` | Limite para revisao humana | review <= Score < pass = REVIEW |
| `fail` | Limite para reprovacao | Score < fail = FAIL |

### Checklist de Thresholds

- [ ] `thresholds` presente quando `type` e `hybrid` ou `automated`
- [ ] `pass` >= `review` >= `fail`
- [ ] Valores sao numericos entre 0.0 e 1.0
- [ ] Logica de decisao e clara:
  - [ ] Score >= `pass` -> Aprovado automaticamente
  - [ ] Score >= `review` e < `pass` -> Requer revisao
  - [ ] Score < `fail` -> Reprovado automaticamente

---

## 7. Estrutura de Executor

O campo `executor` define QUEM executa o gate:

```yaml
executor:
  type: "hybrid | manual | automated | external"
  ai_agent: "nome-do-agente"    # Se hybrid/automated
  human_review: "Role/Pessoa"   # Se hybrid/manual
  external_system: "sistema"    # Se external
```

### Checklist de Executor

- [ ] `executor.type` corresponde ao `type` do gate
- [ ] Se `type: hybrid`:
  - [ ] `ai_agent` especificado
  - [ ] `human_review` especificado
- [ ] Se `type: manual`:
  - [ ] `human_review` especificado
- [ ] Se `type: automated`:
  - [ ] `ai_agent` ou sistema especificado
- [ ] Se `type: external`:
  - [ ] `external_system` especificado

---

## 8. Exemplo Completo Valido

```yaml
quality_gate:
  id: "QG-1.1B"
  name: "Briefing Completeness Gate"
  phase: 1
  placement: "transition"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Overall completude score"
      type: "threshold"
      field: "completude_percentual"
      value: 60
      operator: ">="
      weight: 0.4

    - check: "Critical sections completude"
      type: "threshold"
      field: "critical_sections_score"
      value: 50
      operator: ">="
      weight: 0.3

    - check: "Client name present"
      type: "presence"
      field: "client_name"
      weight: 0.15

    - check: "Status is valid"
      type: "enum"
      field: "status"
      value: ["draft", "submitted", "approved"]
      weight: 0.15

  thresholds:
    pass: 0.60
    review: 0.40
    fail: 0.40

  executor:
    type: "hybrid"
    ai_agent: "briefing-analyzer"
    human_review: "Account Manager"

  pass_action:
    - "Status -> Kick-off Agendado"
    - "Notify AM to schedule kick-off"

  fail_action:
    - "Status -> Bloqueado"
    - "Generate client questions email"
    - "Create follow-up task"
```

---

## 9. Validacao Automatizada

### Script de Validacao (Pseudo-codigo)

```javascript
function validateQualityGate(gate) {
  const errors = [];

  // 1. Campos obrigatorios
  const required = ['id', 'name', 'phase', 'placement', 'type', 'severity',
                    'criteria', 'executor', 'pass_action', 'fail_action'];
  required.forEach(field => {
    if (!gate[field]) errors.push(`Missing required field: ${field}`);
  });

  // 2. Tipo valido
  const validTypes = ['manual', 'automated', 'hybrid', 'external'];
  if (!validTypes.includes(gate.type)) {
    errors.push(`Invalid type: ${gate.type}. Must be one of: ${validTypes.join(', ')}`);
  }

  // 3. Severidade valida
  const validSeverities = ['blocking', 'warning', 'info'];
  if (!validSeverities.includes(gate.severity)) {
    errors.push(`Invalid severity: ${gate.severity}. Must be one of: ${validSeverities.join(', ')}`);
  }

  // 4. Placement valido
  const validPlacements = ['entry', 'transition', 'exit'];
  if (!validPlacements.includes(gate.placement)) {
    errors.push(`Invalid placement: ${gate.placement}. Must be one of: ${validPlacements.join(', ')}`);
  }

  // 5. Criteria structure
  if (Array.isArray(gate.criteria)) {
    gate.criteria.forEach((c, i) => {
      if (!c.check) errors.push(`Criteria ${i}: missing 'check'`);
      if (!c.type) errors.push(`Criteria ${i}: missing 'type'`);

      const validCriteriaTypes = ['threshold', 'presence', 'enum', 'count'];
      if (!validCriteriaTypes.includes(c.type)) {
        errors.push(`Criteria ${i}: invalid type '${c.type}'`);
      }
    });
  }

  // 6. Thresholds (if hybrid/automated)
  if (['hybrid', 'automated'].includes(gate.type) && gate.thresholds) {
    if (gate.thresholds.pass < gate.thresholds.review) {
      errors.push('Thresholds: pass must be >= review');
    }
    if (gate.thresholds.review < gate.thresholds.fail) {
      errors.push('Thresholds: review must be >= fail');
    }
  }

  return { valid: errors.length === 0, errors };
}
```

---

## 10. Resumo de Validacao

Use este checklist rapido para validar Quality Gates:

### Quick Validation

```
[ ] 1. Todos os 10 campos obrigatorios presentes?
[ ] 2. type e: manual | automated | hybrid | external?
[ ] 3. severity e: blocking | warning | info?
[ ] 4. placement e: entry | transition | exit?
[ ] 5. criteria tem check + type para cada item?
[ ] 6. thresholds tem pass >= review >= fail?
[ ] 7. executor corresponde ao type?
[ ] 8. pass_action e fail_action sao arrays?
```

### Severity Guide

| Se o Gate | Use Severity |
|-----------|--------------|
| Impede producao se falhar | `blocking` |
| Relevante mas nao critico | `warning` |
| Apenas para metricas | `info` |

### Type Guide

| Se a Validacao | Use Type |
|----------------|----------|
| Requer julgamento humano | `manual` |
| Pode ser 100% automatizada | `automated` |
| AI analisa + humano valida | `hybrid` |
| Sistema externo decide | `external` |

---

## Referencias

- AIOS Quality Gate Standard Section 2.1
- [HO-TP-001] Task Anatomy Standard
- Quality Gates Reference: AIOS Standard Quality Gates

---

*Quality Gate Validation Checklist v1.0.0*
*Squad-Creator Checklists*
