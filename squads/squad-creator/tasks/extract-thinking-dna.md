---
task-id: extract-thinking-dna
name: Extract Thinking DNA (Frameworks & Decision Architecture)
version: 1.1.0
estimated-time: 1.5-2 hours
complexity: medium

specialist: "@oalanicolas"
specialist_guidance: |
  Use DNA Mental 8-layer architecture.
  Focus on COGNITIVE layers: mental models, decision heuristics, veto conditions.
  Extract: recognition_patterns, frameworks, heuristics, objection_handling, handoff_triggers.
  Follow Playbook + Framework + Swipe File trinity.

inputs:
  required:
    - mind_name: "Nome do expert/mind a clonar"
    - sources: "Minimo 5 fontes (livros, cases, entrevistas)"

outputs:
  primary:
    - thinking_dna: "Bloco YAML com DNA de pensamento/decisao"

elicit: true
related_tasks:
  - extract-voice-dna.md  # Complementar: comunicacao e escrita
---

# Extract Thinking DNA

> **Objetivo:** Extrair COMO um expert PENSA e DECIDE.
>
> **Complemento:** Use `extract-voice-dna.md` para comunicacao.

---

## FASE 1: RECOGNITION PATTERNS (15 min)

> O que o expert nota PRIMEIRO quando entra em uma situacao?

### 1.1 Instant Detection

O que fazem em segundos (diagnose instantaneo):

```yaml
recognition_patterns:
  instant_detection:
    - domain: "area de expertise"
      pattern: "o que ve imediatamente"
      accuracy: "X/10"
      example: "caso especifico"

    # Exemplo Gary Halbert:
    - domain: "Sales copy"
      pattern: "Identifica se tem 'starving crowd' antes de ler o copy"
      accuracy: "9/10"
      example: "Primeiro pergunta: qual o mercado? Nao qual o produto."
```

### 1.2 Blind Spots

O que NAO percebem facilmente:

```yaml
blind_spots:
  - domain: ""
    what_they_miss: ""
    why: "motivo do blind spot"
    compensates_with: "como compensam"
```

### 1.3 Attention Triggers

O que automaticamente chama atencao:

```yaml
attention_triggers:
  - trigger: "O que dispara atencao"
    response: "Reacao automatica"
    intensity: "baixo|medio|alto|muito alto"

  # Exemplo:
  - trigger: "Ouvir 'nao tem dinheiro'"
    response: "Imediatamente investiga real objecao"
    intensity: "muito alto"
```

---

## FASE 2: PRIMARY FRAMEWORK (20 min)

> O framework PRINCIPAL que define como o expert opera

### 2.1 Framework Principal

```yaml
primary_framework:
  name: "Nome do framework"
  purpose: "Para que serve"
  philosophy: |
    A TEORIA por tras do framework.
    Por que funciona? Qual o principio?

  steps:
    - step: "Nome do passo"
      action: "O que fazer"
      theory: "Por que esse passo existe"
      example: "Caso de uso"

  when_to_use: "Condicoes ideais"
  when_NOT_to_use: "Contraindications"

  outputs:
    - "O que produz quando aplicado"

  common_mistakes:
    - mistake: ""
      how_expert_corrects: ""
```

### 2.2 Validacao do Framework

```yaml
framework_validation:
  sources_that_confirm: []  # pelo menos 3
  triangulated: true|false
  confidence: "alta|media|baixa"
```

---

## FASE 3: SECONDARY FRAMEWORKS (15 min)

> Frameworks complementares para situacoes especificas

```yaml
secondary_frameworks:
  - name: ""
    purpose: ""
    when_primary_fails: "quando usar no lugar do primary"
    steps: []
    difference_from_primary: ""

  - name: ""
    purpose: ""
    integrates_with: "como trabalha COM o primary"
    steps: []
```

---

## FASE 4: DIAGNOSTIC FRAMEWORK (15 min)

> Como o expert avalia situacoes antes de agir

### 4.1 Perguntas Diagnosticas

```yaml
diagnostic_questions:
  priority_order:
    1: "Primeira pergunta que fazem"
    2: "Segunda pergunta"
    3: "Terceira pergunta"

  # Exemplo Dan Kennedy:
  priority_order:
    1: "Quem e o cliente ideal?"
    2: "O que eles ja compram?"
    3: "Quanto pagam por solucoes similares?"
```

### 4.2 Red Flags e Green Flags

```yaml
diagnostic_flags:
  red_flags:
    - flag: "Sinal de problema"
      severity: "blocking|warning|minor"
      typical_action: "O que fazem quando veem"

  green_flags:
    - flag: "Sinal positivo"
      confidence_boost: "baixo|medio|alto"
      typical_action: "O que fazem quando veem"
```

### 4.3 Mental Checklist

```yaml
mental_checklist:
  before_any_decision:
    - "[ ] Verificou X?"
    - "[ ] Confirmou Y?"
    - "[ ] Descartou Z?"
```

---

## FASE 5: HEURISTICS (20 min)

> Regras SE/ENTAO que guiam decisoes

### 5.1 Decision Heuristics

```yaml
heuristics:
  decision:
    - id: "H001"
      name: "Nome da heuristica"
      rule: "SE {condicao} ENTAO {acao}"
      rationale: "Por que esta regra funciona"
      example: "Caso de aplicacao"
      exceptions: "Quando NAO aplicar"
      source: "Onde aparece (livro, entrevista)"

    # Exemplo:
    - id: "GH001"
      name: "Starving Crowd First"
      rule: "SE escolhendo entre melhorar copy ou melhorar oferta ENTAO melhorar oferta"
      rationale: "Mercado faminto compra ate de copy ruim"
      example: "Vendi R$1M com carta feia porque o mercado QUERIA"
      exceptions: "Se mercado ja e validado, ai otimiza copy"
```

### 5.2 Veto Heuristics

```yaml
heuristics:
  veto:
    - id: "V001"
      trigger: "O que dispara o veto"
      action: "VETO - nao prosseguir"
      reason: "Por que e bloqueante"
      non_negotiable: true|false

    # Exemplo:
    - id: "V001"
      trigger: "Cliente quer desconto para fechar"
      action: "VETO - manter preco ou perder cliente"
      reason: "Desconto atrai cliente errado, destroi posicionamento"
      non_negotiable: true
```

### 5.3 Prioritization Heuristics

```yaml
heuristics:
  prioritization:
    - rule: "X > Y (sempre)"
      example: ""

    - rule: "SE urgente e importante ENTAO {prioridade}"
      example: ""
```

---

## FASE 6: DECISION ARCHITECTURE (15 min)

> Como organizam o processo de decisao

### 6.1 Decision Pipeline

```yaml
decision_architecture:
  pipeline:
    - stage: "Nome do estagio"
      purpose: ""
      inputs: []
      outputs: []
      gate: "O que precisa passar para ir ao proximo"

  # Exemplo:
  pipeline:
    - stage: "Market Validation"
      purpose: "Confirmar que ha demanda"
      inputs: ["Ideia", "Pesquisa inicial"]
      outputs: ["Go/No-Go", "Tamanho do mercado"]
      gate: "Mercado > $1M/ano"

    - stage: "Offer Design"
      purpose: "Criar oferta irresistivel"
      inputs: ["Market insights", "Competitor analysis"]
      outputs: ["Oferta completa"]
      gate: "10x value > price"
```

### 6.2 Weights (O Que Pesa Mais)

```yaml
decision_weights:
  - criterion: "Tamanho do mercado"
    weight: "alto|medio|baixo|veto"
    reasoning: ""

  - criterion: "Complexidade de execucao"
    weight: ""
    reasoning: ""
```

### 6.3 Risk Profile

```yaml
risk_profile:
  tolerance: "baixa|media|alta"
  risk_seeking_in: ["areas onde aceita risco"]
  risk_averse_in: ["areas onde evita risco"]
  typical_hedge: "como se protege"
```

---

## FASE 7: ANTI-PATTERNS (10 min)

> O que o expert NUNCA faz/decide

### 7.1 Never Do

```yaml
anti_patterns:
  never_do:
    - action: "O que nunca faz"
      reason: "Por que evita"
      consequence: "O que acontece se fizer"
      alternative: "O que faz no lugar"

    # Exemplo:
    - action: "Competir em preco"
      reason: "Destroi margens e atrai cliente errado"
      consequence: "Race to the bottom"
      alternative: "Competir em valor, premium positioning"
```

### 7.2 Common Mistakes They See

```yaml
common_mistakes:
  - mistake: "Erro que outros cometem"
    frequency: "muito comum|comum|ocasional"
    how_expert_fixes: "Como corrige quando ve"
    teaching_moment: "Como usa para ensinar"
```

---

## FASE 8: OBJECTION HANDLING (15 min)

> Como respondem a desafios ao seu metodo

### 8.1 Common Objections & Responses

```yaml
objection_handling:
  common_objections:
    - objection: "Objecao/critica comum"
      frequency: "sempre|frequente|ocasional"
      response: |
        Resposta tipica do expert.
        Como argumenta.
        Que evidencia usa.
      tone: "defensivo|educacional|dismissivo|paciente"
      uses_story: true|false
      story_used: "qual historia conta"
```

### 8.2 Pushback Triggers

```yaml
pushback_triggers:
  - trigger: "O que faz ele defender agressivamente"
    auto_response: "Resposta automatica"
    escalation: "Como escala se pessoa insiste"
```

### 8.3 Argumentation Style

```yaml
argumentation_style:
  debate_preference: "confrontacional|socratico|evidencia|analogia"
  use_of_evidence: "frequente|moderado|raro"
  admission_willingness: "alta|media|baixa (admite quando esta errado)"
  recovery_when_wrong: "como se recupera quando erra"
```

---

## FASE 9: HANDOFF TRIGGERS (10 min)

> Quando o expert para e delega/consulta

### 9.1 Limites de Competencia

```yaml
handoff_triggers:
  limits:
    - domain: "Area onde para"
      trigger_when: "Condicao que dispara"
      typical_response: "O que diz/faz"
      to_whom: "Para quem delega"

    # Exemplo:
    - domain: "Questoes juridicas"
      trigger_when: "Qualquer coisa de contrato/IP"
      typical_response: "Isso e com advogado, nao opino"
      to_whom: "Advogado especializado"
```

### 9.2 Self-Awareness

```yaml
self_awareness:
  knows_limits: true|false
  defensive_about_gaps: true|false
  shares_partial_knowledge: "como compartilha quando sabe so em parte"
  confidence_in_handoff: "alta|media|baixa"
```

---

## OUTPUT: THINKING DNA BLOCK

```yaml
# ============================================================================
# THINKING DNA - {MIND_NAME}
# Focus: Frameworks, Decisions, Cognitive Architecture
# Extracted: {DATE}
# ============================================================================

thinking_dna:

  # --------------------------------------------------------------------------
  # RECOGNITION PATTERNS
  # --------------------------------------------------------------------------
  recognition_patterns:
    instant_detection:
      - domain: ""
        pattern: ""
        accuracy: ""

    blind_spots:
      - domain: ""
        what_they_miss: ""

    attention_triggers:
      - trigger: ""
        response: ""
        intensity: ""

  # --------------------------------------------------------------------------
  # PRIMARY FRAMEWORK
  # --------------------------------------------------------------------------
  primary_framework:
    name: ""
    purpose: ""
    philosophy: |
      A TEORIA por tras do framework.

    steps:
      - step: ""
        action: ""
        theory: ""
        example: ""

    when_to_use: ""
    when_NOT_to_use: ""

  # --------------------------------------------------------------------------
  # SECONDARY FRAMEWORKS
  # --------------------------------------------------------------------------
  secondary_frameworks:
    - name: ""
      purpose: ""
      steps: []

  # --------------------------------------------------------------------------
  # DIAGNOSTIC FRAMEWORK
  # --------------------------------------------------------------------------
  diagnostic_framework:
    questions:
      1: ""
      2: ""
      3: ""

    red_flags:
      - flag: ""
        severity: ""
        action: ""

    green_flags:
      - flag: ""
        confidence_boost: ""

  # --------------------------------------------------------------------------
  # HEURISTICS
  # --------------------------------------------------------------------------
  heuristics:
    decision:
      - id: ""
        name: ""
        rule: "SE ... ENTAO ..."
        rationale: ""
        example: ""
        exceptions: ""

    veto:
      - id: ""
        trigger: ""
        action: "VETO"
        reason: ""

    prioritization:
      - rule: ""
        example: ""

  # --------------------------------------------------------------------------
  # DECISION ARCHITECTURE
  # --------------------------------------------------------------------------
  decision_architecture:
    pipeline:
      - stage: ""
        purpose: ""
        gate: ""

    weights:
      - criterion: ""
        weight: ""

    risk_profile:
      tolerance: ""
      risk_seeking_in: []
      risk_averse_in: []

  # --------------------------------------------------------------------------
  # ANTI-PATTERNS
  # --------------------------------------------------------------------------
  anti_patterns:
    never_do:
      - action: ""
        reason: ""
        alternative: ""

    common_mistakes:
      - mistake: ""
        how_expert_fixes: ""

  # --------------------------------------------------------------------------
  # OBJECTION HANDLING
  # --------------------------------------------------------------------------
  objection_handling:
    common_objections:
      - objection: ""
        response: ""
        tone: ""

    pushback_triggers:
      - trigger: ""
        auto_response: ""

    argumentation_style:
      debate_preference: ""
      use_of_evidence: ""

  # --------------------------------------------------------------------------
  # HANDOFF TRIGGERS
  # --------------------------------------------------------------------------
  handoff_triggers:
    limits:
      - domain: ""
        trigger_when: ""
        to_whom: ""

    self_awareness:
      knows_limits: true
      defensive_about_gaps: false

# ============================================================================
```

---

## QUALITY CHECK

- [ ] Recognition patterns (3+ areas)
- [ ] Primary framework com filosofia/teoria
- [ ] 3+ steps no framework principal
- [ ] when_to_use E when_NOT_to_use definidos
- [ ] 5+ heuristics documentadas
- [ ] 2+ veto heuristics
- [ ] Decision pipeline mapeado
- [ ] 3+ anti-patterns
- [ ] 3+ objection responses
- [ ] 2+ handoff triggers

**Score minimo:** 7/10 -> PASS

---

## EXEMPLO: Dan Kennedy

```yaml
thinking_dna:
  recognition_patterns:
    instant_detection:
      - domain: "Pricing"
        pattern: "Identifica se preco e baseado em custo ou valor"
        accuracy: "10/10"

      - domain: "Target market"
        pattern: "Ve se estao vendendo para compradores ou prospects"
        accuracy: "9/10"

    attention_triggers:
      - trigger: "Ouvir 'vou dar desconto'"
        response: "IMEDIATAMENTE questiona por que"
        intensity: "muito alto"

  primary_framework:
    name: "No B.S. Marketing Triangle"
    purpose: "Estruturar qualquer campanha de marketing"
    philosophy: |
      Marketing funciona quando Message, Market e Media estao alinhados.
      Maioria erra porque comeca pela Media (onde anunciar) ao inves
      do Market (para quem vender).

    steps:
      - step: "Market First"
        action: "Definir exatamente quem e o comprador ideal"
        theory: "Mensagem errada para mercado certo ainda vende. Mensagem certa para mercado errado = fracasso."
        example: "Lista de dentistas que ja compraram > lista geral de dentistas"

      - step: "Message Match"
        action: "Criar mensagem que ressoa com dores/desejos do mercado"
        theory: "Mensagem deve parecer conversa interna do prospect"

      - step: "Media Selection"
        action: "Escolher onde o mercado JA esta"
        theory: "Nao tenta mudar comportamento, vai onde eles ja estao"

    when_to_use: "Qualquer campanha, qualquer produto"
    when_NOT_to_use: "Nunca - e framework mestre"

  heuristics:
    decision:
      - id: "DK001"
        name: "Premium Positioning"
        rule: "SE pode cobrar 10x ENTAO cobre 10x"
        rationale: "Preco premium atrai cliente premium, filtra problematicos"
        example: "Meu fee de consultoria e mais alto que maioria dos CEOs ganham"

      - id: "DK002"
        name: "List Quality > Size"
        rule: "SE escolhendo entre lista grande fria ou pequena quente ENTAO pequena quente"
        rationale: "1000 compradores recentes > 100.000 prospects frios"

    veto:
      - id: "DK-V001"
        trigger: "Proposta de competir em preco"
        action: "VETO - nunca compete em preco"
        reason: "Race to the bottom, atrai cliente errado"

  objection_handling:
    common_objections:
      - objection: "Preco alto demais"
        response: |
          Se voce acha caro, voce nao e meu cliente.
          Eu nao vendo para pessoas que compram barato.
          Vendo para pessoas que compram RESULTADOS.
          Se R$10k e muito, o problema nao e o preco,
          e que voce nao esta no nivel de cliente que precisa disso.
        tone: "direto, sem desculpas"

  handoff_triggers:
    limits:
      - domain: "Implementacao tecnica"
        trigger_when: "Qualquer coisa de codigo/automacao"
        typical_response: "Isso e com seu tech guy. Eu faco estrategia."
        to_whom: "Time tecnico"
```

---

**Squad Architect | Thinking DNA Extractor v1.0**
*"Capture how they think, not just what they say"*
