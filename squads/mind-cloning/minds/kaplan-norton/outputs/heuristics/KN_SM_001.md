# KN_SM_001 — Strategy Map Alignment

**Type:** Decision Heuristic
**Phase:** 2 (Alinhamento Estratégico)
**Agent:** @kaizen:kaplan-norton
**Pattern:** KN-ALIGN-001 (Verificação de Alinhamento do Mapa Estratégico)

## Purpose

Verifica se os indicadores e objetivos de um mapa estratégico estão devidamente conectados em relações causa-efeito entre as 4 perspectivas. Identifica objetivos "órfãos" (sem conexão), cadeias quebradas e narrativas estratégicas incoerentes. Um mapa sem alinhamento é um organograma disfarçado.

## Configuration

```yaml
KN_SM_001:
  name: "Strategy Map Alignment"
  phase: 2

  weights:
    vertical_alignment: 0.95
    horizontal_alignment: 0.85
    theme_coherence: 0.9
    indicator_linkage: 0.9
    initiative_coverage: 0.85

  thresholds:
    minimum_themes: 2
    maximum_themes: 5
    orphan_objectives_allowed: 0
    minimum_links_per_objective: 1
    cascade_levels: "minimum 2"

  veto_conditions:
    - condition: "Objetivo estratégico sem nenhuma conexão causa-efeito"
      action: "VETO — Objetivo órfão. Se não causa nada e nada o causa, por que está no mapa?"
    - condition: "Cadeia causa-efeito não chega até perspectiva financeira"
      action: "REVIEW — Toda cadeia deve terminar em impacto financeiro. Onde está o valor?"
    - condition: "Tema estratégico com objetivos em apenas 1 perspectiva"
      action: "VETO — Um tema deve atravessar pelo menos 3 perspectivas para contar uma história."
    - condition: "Mapa sem perspectiva de aprendizado e crescimento"
      action: "VETO — A base foi eliminada. A estratégia não tem fundação."
    - condition: "Indicadores desconectados dos objetivos do mapa"
      action: "REVIEW — Indicadores que não medem objetivos do mapa são ruído."

  decision_tree: |
    IF todos os objetivos têm pelo menos 1 link causa-efeito → AVALIAR qualidade
    IF existem objetivos órfãos → VETO — remover ou conectar
    IF cadeia não alcança perspectiva financeira → REVIEW — completar narrativa
    IF temas não atravessam 3+ perspectivas → REVIEW — temas superficiais
    IF indicadores não mapeiam para objetivos → REVIEW — desconexão medição-estratégia
    TERMINATION: Mapa estratégico é apenas lista de objetivos sem conexões
```

## Application

**Input:** Mapa estratégico da organização com objetivos, temas e conexões
**Process:** Verificar conectividade vertical (entre perspectivas), horizontal (entre temas) e coerência narrativa. Identificar rupturas.
**Output:** Diagnóstico de alinhamento com rupturas identificadas e recomendações de correção

## Decision Tree

```text
STEP 1: VERIFICAR conectividade vertical

IF (Cada perspectiva tem objetivos conectados à perspectiva acima)
  THEN APPROVE — "Cadeia causa-efeito vertical íntegra."
ELSE IF (Rupturas entre perspectivas)
  THEN IDENTIFICAR — "Ruptura entre [perspectiva A] e [perspectiva B].
  Como [objetivo A] leva a [objetivo B]?"

STEP 2: VERIFICAR objetivos órfãos

IF (Zero objetivos órfãos — todos têm pelo menos 1 conexão)
  THEN APPROVE — "Nenhum objetivo isolado."
ELSE IF (Objetivos sem conexão)
  THEN VETO — "Objetivo '[nome]' está isolado. Se não causa nada e nada o causa,
  ele não é estratégico — é operacional. Remova do mapa ou conecte."

STEP 3: VERIFICAR coerência dos temas

IF (Cada tema atravessa 3-4 perspectivas com narrativa coerente)
  THEN APPROVE — "Temas contam histórias completas de criação de valor."
ELSE IF (Temas superficiais — apenas 1-2 perspectivas)
  THEN REVIEW — "O tema '[nome]' não conta uma história completa.
  Onde está a fundação (aprendizado) e o resultado (financeiro)?"

STEP 4: VERIFICAR cobertura de indicadores e iniciativas

IF (Todo objetivo tem indicador + meta + iniciativa)
  THEN APPROVE — "Objetivos são gerenciáveis."
ELSE IF (Objetivos sem indicadores)
  THEN REVIEW — "Objetivo sem indicador é declaração de intenção, não gestão."
ELSE IF (Objetivos sem iniciativas)
  THEN REVIEW — "Quem vai agir? Um objetivo sem iniciativa é um desejo."

TERMINATION: Organização apresenta lista de objetivos sem relações
FALLBACK: Se mapa não existe, construir a partir de temas estratégicos
```

## Matriz de Verificação de Alinhamento

```text
PERSPECTIVA FINANCEIRA    [Obj F1] ← [Obj F2] ← [Obj F3]
                              ↑           ↑
PERSPECTIVA CLIENTES      [Obj C1] ← [Obj C2] ← [Obj C3]
                              ↑           ↑           ↑
PERSPECTIVA PROCESSOS     [Obj P1] ← [Obj P2] ← [Obj P3]
                              ↑           ↑           ↑
PERSPECTIVA APRENDIZADO   [Obj A1] ← [Obj A2] ← [Obj A3]

Verificações:
✓ Vertical: Todo Obj tem seta para cima (causa-efeito)
✓ Horizontal: Objetivos na mesma perspectiva estão conectados quando relevante
✓ Temas: Colunas representam temas estratégicos coerentes
✓ Cobertura: Todo Obj tem indicador, meta e iniciativa
```

## Examples

### APPROVE: Mapa Bem Alinhado

- **Tema:** "Excelência no atendimento ao cliente"
- **Aprendizado:** Treinamento de empatia → Sistema CRM integrado
- **Processos:** Tempo de resolução < 24h → First call resolution > 80%
- **Clientes:** NPS > 75 → Retenção > 90%
- **Financeiro:** Lifetime value +15% → Receita recorrente +20%
- **Kaplan & Norton dizem:** "Este tema conta uma história completa — do investimento em pessoas ao resultado financeiro."

### VETO: Objetivo Órfão

- **Objetivo:** "Implementar sistema ERP" (Processos Internos)
- **Conexões:** Nenhuma — nem causa nem é causado por outro objetivo
- **Kaplan & Norton dizem:** "Um ERP é um meio, não um fim estratégico. Que resultado de cliente ou financeiro ele causa? Se não consegue responder, não é estratégico."

### REVIEW: Tema Incompleto

- **Tema:** "Inovação"
- **Presente em:** Processos (3 objetivos) + Financeiro (1 objetivo)
- **Ausente em:** Aprendizado (0) + Clientes (0)
- **Kaplan & Norton dizem:** "Inovação sem investimento em capital humano é fantasia. E inovação sem impacto no cliente é desperdício. Complete a cadeia."

## Core Quotes

- "A estratégia é uma hipótese de causa-efeito — o mapa é onde essa hipótese se torna visível."
- "Objetivo sem conexão não é estratégico — é operacional. Tire do mapa."
- "O mapa estratégico é tão importante quanto o scorecard."
- "Se não consegue desenhar a cadeia causa-efeito, a estratégia não está clara."

---

**Pattern Compliance:** KN-ALIGN-001 (Verificação de Alinhamento)
**Source:** KN Mind DNA — Strategy Maps Framework
