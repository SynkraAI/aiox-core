# Core Heuristics for Squad Creation

> **Source:** AIOS Heuristics Standard
> **Version:** 1.0.0
> **Updated:** 2026-01-24
> **Prefix:** SC (Squad-Creator)

Este documento define as heuristicas basicas que todo squad deve implementar para garantir decisoes consistentes e auditaveis.

---

## Sumario

| ID | Nome | Tipo | Veto Power |
|----|------|------|------------|
| SC_BS_001 | Strategic Focus | Business Strategy | Yes (vision < 0.7) |
| SC_PA_001 | Coherence Check | Performance Assessment | Yes (truthfulness < 0.7) |
| SC_PM_001 | Automation Decision | Process Management | No (guidelines) |

---

## SC_BS_001 - Strategic Focus

**Baseado em:** PV_BS_001 (Business Strategy Focus)
**Objetivo:** Priorizar decisoes que constroem para o estado final desejado.

### Configuration

```yaml
heuristic:
  metadata:
    id: "SC_BS_001"
    name: "Strategic Focus Heuristic"
    type: "Decision Heuristic"
    category: "Business Strategy"
    agent: "@squad-creator:squad-architect"
    pattern: "SC-PP-001"

  configuration:
    weights:
      end_state_vision: 0.9    # Visao de longo prazo (alta prioridade)
      market_signals: 0.1      # Sinais de mercado (baixa prioridade)

    thresholds:
      high_priority: 0.8       # Acima disso = prioridade alta
      medium_priority: 0.5     # Entre 0.5-0.8 = media
      low_priority: 0.3        # Abaixo de 0.5 = baixa

    veto_conditions:
      - condition: "vision_clarity < 0.7"
        action: "VETO - Vision unclear, requires clarification"

  output:
    type: "decision"
    values: ["PRIORITIZE", "CONSIDER", "DEFER", "VETO"]
```

### Decision Tree

```
START
  |
  v
[1] Avaliar Vision Clarity
    |
    +-- vision_clarity < 0.7? --> VETO (parar, clarificar visao)
    |
    v
[2] Calcular Strategic Score
    score = (end_state_vision * 0.9) + (market_signals * 0.1)
    |
    v
[3] Classificar Prioridade
    |
    +-- score >= 0.8? --> PRIORITIZE (executar imediatamente)
    |
    +-- score >= 0.5? --> CONSIDER (avaliar recursos)
    |
    +-- score >= 0.3? --> DEFER (backlog)
    |
    +-- score < 0.3? --> SKIP (nao relevante)
    |
    v
END
```

### Evaluation Criteria

| Criterio | Peso | Threshold | Descricao |
|----------|------|-----------|-----------|
| End State Vision | 0.9 | 0.7 (veto) | Quao claramente a task contribui para o objetivo final |
| Market Signals | 0.1 | N/A | Urgencia baseada em sinais externos (competidores, mercado) |
| Vision Clarity | N/A | 0.7 (veto) | Clareza da visao do projeto/squad |

**Scoring Guide:**

| Score | Significado |
|-------|-------------|
| 0.0-0.3 | Nao alinhado com visao |
| 0.4-0.6 | Parcialmente alinhado |
| 0.7-0.8 | Bem alinhado |
| 0.9-1.0 | Diretamente contribui |

### Failure Modes

| Modo de Falha | Trigger | Deteccao | Recuperacao | Prevencao |
|---------------|---------|----------|-------------|-----------|
| Vision Drift | Execucao sem clareza de visao | Tasks desconectadas do objetivo | Parar, re-alinhar com stakeholder | Aplicar veto condition sempre |
| Market Over-reaction | Priorizar sinais sobre visao | Mudanca frequente de direcao | Reduzir peso de market_signals | Manter end_state_vision em 0.9 |
| False Urgency | Score inflado artificialmente | Tasks "urgentes" sem impacto | Revisar historico de priorizacao | Validar score com segundo avaliador |

### Application Examples

**Exemplo 1: Nova Feature de Squad**

```yaml
evaluation:
  task: "Adicionar suporte a multi-idioma no squad"

  assessment:
    end_state_vision: 0.6   # Util mas nao critico para MVP
    market_signals: 0.8     # Clientes internacionais pedindo
    vision_clarity: 0.9     # Visao clara do produto

  calculation:
    score: (0.6 * 0.9) + (0.8 * 0.1) = 0.54 + 0.08 = 0.62

  decision: "CONSIDER"
  rationale: "Feature util mas nao prioritaria para o estado final. Avaliar recursos antes de implementar."
```

**Exemplo 2: Task sem Visao Clara**

```yaml
evaluation:
  task: "Implementar sistema de notificacoes"

  assessment:
    end_state_vision: 0.4   # Pouco claro como contribui
    market_signals: 0.3     # Nenhuma demanda especifica
    vision_clarity: 0.5     # Visao do projeto confusa

  decision: "VETO"
  rationale: "vision_clarity (0.5) < 0.7. Parar e clarificar visao do projeto antes de prosseguir."
```

---

## SC_PA_001 - Coherence Check

**Baseado em:** PV_PA_001 (Systemic Coherence Scan)
**Objetivo:** Avaliar executores (humanos ou agentes) quanto a confiabilidade e coerencia.

### Configuration

```yaml
heuristic:
  metadata:
    id: "SC_PA_001"
    name: "Coherence Check Heuristic"
    type: "Assessment Heuristic"
    category: "Performance Assessment"
    agent: "@squad-creator:squad-architect"
    pattern: "SC-PP-002"

  configuration:
    weights:
      truthfulness: 1.0              # VETO power - nao negociavel
      system_adherence: 0.8          # Seguir padroes estabelecidos
      technical_skill: 0.3           # Habilidade tecnica (menor peso)

    thresholds:
      truthfulness: 0.7              # VETO threshold
      system_adherence: 0.6          # Warning threshold
      technical_skill: null          # Context-dependent
      overall_pass: 0.7              # Media ponderada minima

    veto_conditions:
      - condition: "truthfulness < 0.7"
        action: "VETO - REJECT immediately"
        severity: "critical"

  output:
    type: "assessment"
    values: ["APPROVE", "REVIEW", "VETO"]
```

### Decision Tree

```
START
  |
  v
[1] Avaliar Truthfulness (Honestidade/Veracidade)
    |
    +-- truthfulness < 0.7? --> VETO (rejeitar imediatamente)
    |
    v
[2] Avaliar System Adherence (Aderencia ao Sistema)
    |
    +-- system_adherence < 0.6? --> FLAG para REVIEW
    |
    v
[3] Calcular Coherence Score
    score = (truthfulness * 1.0) + (system_adherence * 0.8) + (technical_skill * 0.3)
    normalized_score = score / 2.1  # Soma dos pesos
    |
    v
[4] Decisao Final
    |
    +-- flagged_for_review? --> REVIEW (supervisao necessaria)
    |
    +-- normalized_score >= 0.7? --> APPROVE
    |
    +-- normalized_score < 0.7? --> REVIEW
    |
    v
END
```

### Evaluation Criteria

| Criterio | Peso | Threshold | Veto Power | Descricao |
|----------|------|-----------|------------|-----------|
| Truthfulness | 1.0 | 0.7 | YES | Honestidade, nao inventar dados, admitir erros |
| System Adherence | 0.8 | 0.6 | NO | Seguir padroes, processos, guidelines |
| Technical Skill | 0.3 | N/A | NO | Competencia tecnica para a tarefa |

**Truthfulness Scoring Guide:**

| Score | Comportamento |
|-------|---------------|
| 0.0-0.3 | Inventa dados, esconde erros, inconsistente |
| 0.4-0.6 | Ocasionalmente impreciso, minimiza problemas |
| 0.7-0.8 | Honesto, admite quando nao sabe |
| 0.9-1.0 | Proativamente corrige erros, transparente |

**System Adherence Scoring Guide:**

| Score | Comportamento |
|-------|---------------|
| 0.0-0.3 | Ignora padroes, cria solucoes ad-hoc |
| 0.4-0.6 | Segue parcialmente, atalhos frequentes |
| 0.7-0.8 | Segue padroes consistentemente |
| 0.9-1.0 | Melhora padroes, sugere melhorias |

### Failure Modes

| Modo de Falha | Trigger | Deteccao | Recuperacao | Prevencao |
|---------------|---------|----------|-------------|-----------|
| False Trust | Executor passa mas nao e confiavel | Erros downstream, dados incorretos | Reverter decisoes, re-avaliar | Validar output com segunda fonte |
| Over-rejection | VETO em casos validos | Executores bons rejeitados | Revisar threshold, calibrar | Documentar razoes de veto |
| Skill Bias | Privilegiar skill sobre truthfulness | Erros de executores "tecnicos" | Reforcar peso de truthfulness | Manter truthfulness em 1.0 |

### Application Examples

**Exemplo 1: Novo Agente de Squad**

```yaml
evaluation:
  executor: "content-analyzer-agent"
  type: "Agent"

  assessment:
    truthfulness: 0.9       # Admite quando nao tem certeza
    system_adherence: 0.8   # Segue templates corretamente
    technical_skill: 0.7    # Boa analise mas nao excepcional

  calculation:
    raw_score: (0.9 * 1.0) + (0.8 * 0.8) + (0.7 * 0.3) = 0.9 + 0.64 + 0.21 = 1.75
    normalized: 1.75 / 2.1 = 0.83

  decision: "APPROVE"
  rationale: "Executor confiavel (truthfulness 0.9) e aderente ao sistema (0.8). Aprovado para uso."
```

**Exemplo 2: Executor Problematico**

```yaml
evaluation:
  executor: "fast-generator-agent"
  type: "Agent"

  assessment:
    truthfulness: 0.5       # Inventa dados quando nao sabe
    system_adherence: 0.9   # Segue templates perfeitamente
    technical_skill: 0.9    # Muito rapido e tecnico

  decision: "VETO"
  rationale: "truthfulness (0.5) < 0.7. VETO imediato - executor nao confiavel mesmo com alta skill tecnica."
```

---

## SC_PM_001 - Automation Decision

**Baseado em:** PV_PM_001 (Automation Tipping Point)
**Objetivo:** Decidir quando automatizar uma tarefa versus manter manual.

### Configuration

```yaml
heuristic:
  metadata:
    id: "SC_PM_001"
    name: "Automation Decision Heuristic"
    type: "Process Heuristic"
    category: "Process Management"
    agent: "@squad-creator:squad-architect"
    pattern: "SC-PP-003"

  configuration:
    rules:
      documentation_trigger:
        repetitions: 2
        action: "Document the process"

      automation_trigger:
        repetitions: 3
        action: "Automate immediately"
        assessment_if_not: "Grave design failure"

      guardrails_requirement:
        trigger: "Any automation"
        mandatory: true

    guardrails:
      required:
        - loop_prevention      # Evitar loops infinitos
        - idempotency          # Mesma entrada = mesma saida
        - audit_trail          # Log de todas as execucoes
        - manual_escape        # Sempre ter bypass manual
        - retry_logic          # Tratamento de falhas

      optional:
        - rate_limiting        # Limitar execucoes por tempo
        - rollback_capability  # Desfazer automacao
        - notification_hooks   # Alertas em eventos

  output:
    type: "recommendation"
    values: ["KEEP_MANUAL", "DOCUMENT", "AUTOMATE", "REDESIGN"]
```

### Decision Tree

```
START
  |
  v
[1] Contar Repeticoes da Tarefa
    |
    +-- repeticoes == 1? --> KEEP_MANUAL (continuar manual)
    |
    +-- repeticoes == 2? --> DOCUMENT (documentar processo)
    |
    +-- repeticoes >= 3? --> Verificar automacao existente
    |
    v
[2] Automacao Existe?
    |
    +-- NAO --> FLAG: "Design Failure" + AUTOMATE
    |
    +-- SIM --> Verificar guardrails
    |
    v
[3] Guardrails Implementados?
    |
    +-- Todos 5 obrigatorios? --> APPROVE automacao
    |
    +-- Faltando guardrails? --> REDESIGN (adicionar guardrails)
    |
    v
END
```

### Evaluation Criteria

| Criterio | Trigger | Acao Requerida |
|----------|---------|----------------|
| 1 repeticao | Primeira execucao | Executar manualmente, observar |
| 2 repeticoes | Segunda execucao | Documentar processo detalhadamente |
| 3+ repeticoes | Terceira+ execucao | Automatizar ou justificar porque nao |
| Automacao sem guardrails | Qualquer automacao | BLOQUEAR ate implementar guardrails |

**Guardrails Obrigatorios:**

| Guardrail | Descricao | Implementacao |
|-----------|-----------|---------------|
| loop_prevention | Evitar loops infinitos | Max iterations, timeout, circuit breaker |
| idempotency | Mesma entrada = mesma saida | Check before execute, unique IDs |
| audit_trail | Log de todas execucoes | Structured logging, timestamps |
| manual_escape | Bypass manual sempre | Kill switch, manual override flag |
| retry_logic | Tratamento de falhas | Exponential backoff, max retries |

### Failure Modes

| Modo de Falha | Trigger | Deteccao | Recuperacao | Prevencao |
|---------------|---------|----------|-------------|-----------|
| Premature Automation | Automatizar antes de entender | Automacao quebra frequentemente | Reverter para manual, re-documentar | Seguir regra de 2 repeticoes |
| Missing Guardrails | Automacao sem protecao | Loop infinito, dados corrompidos | Desativar automacao, implementar guardrails | Checklist obrigatorio antes de deploy |
| Design Failure | 3+ repeticoes sem automacao | Time gasto em tarefas repetitivas | Sprint de automacao | Review mensal de tarefas repetidas |
| Over-automation | Automatizar tudo | Perda de contexto, erros em edge cases | Identificar o que deve ser manual | Manter humano em decisoes criticas |

### Application Examples

**Exemplo 1: Tarefa Repetida 2x**

```yaml
evaluation:
  task: "Criar estrutura de pastas para novo squad"
  repetitions: 2
  current_state: "manual"

  decision: "DOCUMENT"
  action_items:
    - Criar checklist de pastas necessarias
    - Documentar ordem de criacao
    - Listar templates a serem copiados
    - Registrar em squads/squad-creator/data/

  rationale: "Segunda execucao - documentar processo para proxima repeticao."
```

**Exemplo 2: Tarefa Repetida 3x sem Automacao**

```yaml
evaluation:
  task: "Sincronizar squads/ para .claude/commands/"
  repetitions: 5
  current_state: "manual"

  decision: "AUTOMATE"
  severity: "Design Failure - 5 repeticoes manuais"

  automation_spec:
    type: "Worker"
    trigger: "pre-commit hook"
    guardrails:
      loop_prevention: "Max 1 sync per commit"
      idempotency: "Hash check before copy"
      audit_trail: "Log to .aios/logs/sync.log"
      manual_escape: "--no-sync flag"
      retry_logic: "3 retries, 1s backoff"

  rationale: "Grave design failure - tarefa repetida 5x. Automatizar imediatamente com guardrails."
```

**Exemplo 3: Automacao sem Guardrails**

```yaml
evaluation:
  task: "Auto-deploy de agents modificados"
  repetitions: 10
  current_state: "automated"

  guardrails_check:
    loop_prevention: true
    idempotency: false       # MISSING
    audit_trail: true
    manual_escape: false     # MISSING
    retry_logic: true

  decision: "REDESIGN"
  action_items:
    - Implementar idempotency check (hash de arquivo)
    - Adicionar flag --no-auto-deploy
    - Nao aprovar deploy ate guardrails completos

  rationale: "Automacao existente mas faltando 2 guardrails obrigatorios. Bloquear ate implementar."
```

---

## Checklist de Implementacao

### Para aplicar estas heuristicas em um novo squad:

- [ ] Copiar este arquivo para `squads/{nome}/data/core-heuristics.md`
- [ ] Ajustar prefix de SC para o prefix do squad (ex: MM, CR, HO)
- [ ] Calibrar thresholds baseado no contexto do squad
- [ ] Adicionar heuristicas especificas do dominio
- [ ] Integrar na pipeline de decisao do squad

### Validacao de Conformidade

Toda decisao importante no squad deve referenciar uma heuristica:

```yaml
decision_log:
  timestamp: "2026-01-24T10:30:00Z"
  decision: "Priorizar feature X sobre Y"
  heuristic_applied: "SC_BS_001"
  scores:
    end_state_vision: 0.85
    market_signals: 0.3
  result: "PRIORITIZE"
  rationale: "Feature X contribui diretamente para MVP"
```

---

## Referencias

- `squads/squad-creator/data/best-practices.md` (Part 3)

---

*Squad-Creator Core Heuristics v1.0.0*
*AIOS Heuristics Standard for squad creation*
