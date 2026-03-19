# Clone Stages Guide

Guia para clones com comportamento context-dependent (estagios). Clones complexos precisam mudar de comportamento dependendo do contexto - um unico prompt gigante faz a IA se perder.

---

## Quando Usar Estagios vs Single-Stage

### Use Single-Stage quando:
- Expert tem comportamento consistente em todos os contextos
- Clone serve para um unico proposito (ex: responder perguntas tecnicas)
- Interacao e sempre do mesmo tipo (ex: consultoria)

### Use Estagios quando:
- Comportamento do expert muda por contexto (ex: educado com clientes, duro com haters)
- Clone precisa navegar um funil (ex: boas-vindas → qualificacao → oferta)
- Expert tem "modos" diferentes dependendo da situacao
- Clone atende multiplos tipos de interacao

**Heuristica AN004:** SE comportamento muda por contexto → ENTAO criar estagios. Nunca prompt gigante unico.

---

## Patterns Comuns de Estagios

### 1. Funil de Vendas

```yaml
stages:
  - id: welcome
    trigger: "first_contact"
    behavior: "Acolhedor, faz perguntas, identifica dor"
    transitions:
      - to: qualification
        when: "dor identificada"

  - id: qualification
    trigger: "pain_identified"
    behavior: "Explorador, deepens pain, mostra autoridade"
    transitions:
      - to: offer
        when: "lead qualificado"

  - id: offer
    trigger: "qualified_lead"
    behavior: "Direto, apresenta solucao, usa scarcity"
    transitions:
      - to: objection_handling
        when: "objecao detectada"

  - id: objection_handling
    trigger: "objection_detected"
    behavior: "Empatico mas firme, usa social proof, reframe"
```

### 2. Atendimento ao Cliente

```yaml
stages:
  - id: triage
    trigger: "new_ticket"
    behavior: "Diagnostico rapido, perguntas objetivas"
    transitions:
      - to: support
        when: "problema identificado"
      - to: escalation
        when: "fora do escopo"

  - id: support
    trigger: "problem_identified"
    behavior: "Solucao passo a passo, tom didatico"

  - id: escalation
    trigger: "out_of_scope"
    behavior: "Transparente, explica limitacao, redireciona"
```

### 3. Educacional

```yaml
stages:
  - id: assessment
    trigger: "new_student"
    behavior: "Avalia nivel, identifica gaps, sem julgamento"
    transitions:
      - to: teaching
        when: "nivel avaliado"

  - id: teaching
    trigger: "level_assessed"
    behavior: "Adaptado ao nivel, usa analogias, desafia gradualmente"
    transitions:
      - to: practice
        when: "conceito explicado"

  - id: practice
    trigger: "concept_taught"
    behavior: "Propoe exercicios, feedback imediato, celebra acertos"
```

### 4. Expert with Moods (ex: Hormozi)

```yaml
stages:
  - id: default
    trigger: "normal_interaction"
    behavior: "Educado, metodologico, ensina frameworks"
    transitions:
      - to: anti_troll
        when: "hater_detected OR sarcasm_detected"

  - id: anti_troll
    trigger: "provocation"
    behavior: "Direto, confrontacional, usa dados como arma"
    transitions:
      - to: default
        when: "conversation_normalized"
```

---

## Template YAML para Stage Architecture

```yaml
stage_architecture:
  has_stages: true
  default_stage: "welcome"
  stages:
    - id: "{stage_id}"
      name: "{stage_name}"
      trigger: "{what_activates_this_stage}"
      behavior: "{how_clone_acts_in_this_stage}"
      voice_overrides: {}   # Optional: override tone, vocabulary for this stage
      transitions:
        - to: "{next_stage_id}"
          when: "{condition}"
          confidence_threshold: 0.7  # Min confidence to trigger transition
```

---

## Regras de Design de Estagios

1. **Maximo 5 estagios** - Mais que isso, a IA se confunde
2. **Cada estagio tem trigger claro** - Sem ambiguidade no que ativa cada estagio
3. **Transitions devem ser bidirecionais quando possivel** - Expert real volta atras
4. **Default stage e o safe mode** - Se nada matcheia, cai no default
5. **Voice overrides sao opcionais** - Use apenas quando tom muda drasticamente entre estagios

---

*Referencia: Clone Stages Architecture*
*Heuristica: AN004 - Regra dos Estagios*
