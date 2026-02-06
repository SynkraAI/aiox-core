---
task-id: extract-voice-dna
name: Extract Voice DNA (Communication & Writing Style)
version: 1.1.0
estimated-time: 1-2 hours
complexity: medium

specialist: "@oalanicolas"
specialist_guidance: |
  Use DNA Mental 8-layer architecture.
  Apply curadoria ouro vs bronze para fontes.
  Extract: power_words, signature_phrases, storytelling, anti-patterns, immune_system.
  Follow Playbook + Framework + Swipe File trinity.

inputs:
  required:
    - mind_name: "Nome do expert/mind a clonar"
    - sources: "Minimo 5 fontes (livros, artigos, entrevistas, podcasts)"

outputs:
  primary:
    - voice_dna: "Bloco YAML com DNA de comunicacao/escrita"

elicit: true
related_tasks:
  - extract-thinking-dna.md  # Complementar: frameworks e decisoes
---

# Extract Voice DNA

> **Objetivo:** Extrair COMO um expert se comunica e escreve.
>
> **Complemento:** Use `extract-thinking-dna.md` para frameworks e decisoes.

---

## FASE 1: COLETA DE FONTES (10 min)

### 1.1 Fontes Prioritarias

```
OBRIGATORIO (minimo 5):
[ ] Livro principal / Obra mais conhecida
[ ] 2-3 Entrevistas longas (podcast, YouTube)
[ ] Artigos/posts escritos pelo proprio
[ ] Palestras/keynotes

BONUS:
[ ] Twitter/X threads
[ ] Newsletters
[ ] Debates/discussoes
```

### 1.2 Pesquisa Web

```
"{nome}" interview transcript
"{nome}" best quotes
"{nome}" writing style
"{nome}" stories anecdotes
```

**CHECKPOINT:** 5+ fontes? -> Continuar

---

## FASE 2: VOCABULARIO (15 min)

### 2.1 Power Words (10-15)

Palavras que usa REPETIDAMENTE com peso emocional:

```yaml
power_words:
  - word: ""
    context: "quando usa"
    emotional_weight: "alto|medio"
```

### 2.2 Frases Assinatura (5-10)

Expressoes que IDENTIFICAM a pessoa:

```yaml
signature_phrases:
  - phrase: ""
    meaning: ""
    use_when: ""
```

### 2.3 Metaforas Favoritas (3-5)

Como explica conceitos complexos:

```yaml
metaphors:
  - concept: "o que explica"
    metaphor: "como explica"
    example: ""
```

### 2.4 Vocabulary Rules

```yaml
vocabulary_rules:
  always_use: []    # termos que SEMPRE usa
  never_use: []     # termos que EVITA
  transforms:       # como "traduz" jargao
    - from: "jargao comum"
      to: "como ele diz"
```

---

## FASE 3: ANEDOTAS & HISTORIAS (15 min)

### 3.1 Historias Recorrentes

Historias que conta REPETIDAMENTE para ilustrar pontos:

```yaml
recurring_stories:
  - title: "Nome/descricao curta"
    summary: "O que acontece"
    lesson: "O ponto que ilustra"
    trigger: "Quando conta essa historia"
    source: "Onde aparece"
```

### 3.2 Anedotas Pessoais

Experiencias pessoais que usa como prova/exemplo:

```yaml
personal_anecdotes:
  - event: ""
    lesson_extracted: ""
    emotional_tone: ""
    use_for: "tipo de argumento que suporta"
```

### 3.3 Exemplos Favoritos

Cases/exemplos externos que referencia frequentemente:

```yaml
favorite_examples:
  - example: ""
    domain: ""
    point_it_makes: ""
    frequency: "sempre|frequente|ocasional"
```

### 3.4 Story Patterns

Como estrutura historias:

```yaml
story_structure:
  opening: "como comeca historias"
  build_up: "como desenvolve tensao"
  payoff: "como entrega o ponto"
  callback: "se/como referencia de volta"
```

---

## FASE 4: ESTILO DE ESCRITA (15 min)

### 4.1 Estrutura de Texto

```yaml
writing_structure:
  paragraph_length: "curto|medio|longo"
  sentence_length: "curta|media|longa"
  list_usage: "frequente|moderado|raro"
  headers_style: ""
  opening_pattern: "como abre textos/secoes"
  closing_pattern: "como fecha textos/secoes"
```

### 4.2 Recursos Retoricos

```yaml
rhetorical_devices:
  questions: "usa perguntas retoricas? como?"
  repetition: "usa repeticao? padrao?"
  contrast: "usa contraste? padrao?"
  direct_address: "fala direto com leitor? como?"
  humor: "usa humor? tipo?"
  provocation: "provoca? como?"
```

### 4.3 Formatacao Caracteristica

```yaml
formatting_habits:
  emphasis: "negrito|italico|CAPS|aspas"
  parentheses: "frequente|raro"
  dashes: "frequente|raro"
  ellipsis: "frequente|raro"
  special_chars: []  # ex: "->", ".", etc
```

---

## FASE 5: TOM & VOZ (10 min)

### 5.1 Dimensoes de Voz (1-10)

```yaml
voice_dimensions:
  warmth_distance: 5      # 1=caloroso, 10=distante
  direct_indirect: 5      # 1=direto, 10=indireto
  formal_casual: 5        # 1=formal, 10=casual
  complex_simple: 5       # 1=complexo, 10=simples
  emotional_rational: 5   # 1=emocional, 10=racional
  humble_confident: 5     # 1=humilde, 10=confiante
  serious_playful: 5      # 1=serio, 10=brincalhao
```

### 5.2 Tom por Contexto

```yaml
contextual_tone:
  teaching: ""        # quando ensina
  persuading: ""      # quando convence
  storytelling: ""    # quando conta historia
  criticizing: ""     # quando critica
  celebrating: ""     # quando elogia
```

### 5.3 Identidade em Uma Frase

> "[Nome] escreve/fala como ________________"

---

## FASE 6: ANTI-PATTERNS DE COMUNICACAO (10 min)

> O que o expert NUNCA faz/diz na comunicacao?

### 6.1 O Que Nunca Dizem

```yaml
communication_anti_patterns:
  never_say:
    - term: ""
      reason: "Por que evita"
      substitute: "O que usa no lugar"

  # Exemplo Gary Halbert:
  never_say:
    - term: "synergy"
      reason: "Corporate bullshit"
      substitute: "work together"
```

### 6.2 Comportamentos que Evitam

```yaml
never_do_communication:
  - behavior: ""
    context: ""
    reason: ""
    workaround: "como contorna"

  # Exemplo:
  - behavior: "Small talk prolongado"
    context: "Reunioes de negocio"
    reason: "Desperdica tempo"
    workaround: "Vai direto ao ponto apos 30s"
```

### 6.3 Estilos que Rejeitam

```yaml
rejected_styles:
  - style: ""
    reason: ""
    observed_discomfort: "como reage quando forcado"
```

---

## FASE 7: IMMUNE SYSTEM - REJEICOES AUTOMATICAS (10 min)

> O que o expert rejeita ANTES mesmo de pensar?

### 7.1 Rejeicoes Instantaneas

```yaml
automatic_rejections:
  - trigger: "Pedido para simplificar demais"
    response_speed: "imediato|rapido|apos reflexao"
    typical_response: ""
    tone_shift: "como o tom muda"
    exceptions: "quando aceita"

  - trigger: "Sugestao antietica"
    response_speed: "reflexivo"
    typical_response: ""
```

### 7.2 Boundaries Emocionais

```yaml
emotional_boundaries:
  - boundary: "Ser condescendido"
    auto_defense: "como reage"
    intensity: "1-10"
    recovery_time: "quanto tempo para voltar ao normal"

  - boundary: "Ter expertise questionada"
    auto_defense: ""
    intensity: ""
```

### 7.3 O Que Defendem Ferozmente

```yaml
fierce_defenses:
  - value: "Integridade intelectual"
    how_hard: "ate onde vai"
    cost_acceptable: "disposto a perder relacionamento?"
    observable_signs: "como perceber que ativou"
```

---

## FASE 8: CONTRADICOES DE VOZ - PARADOXOS AUTENTICOS (10 min)

> Contradicoes tornam humanos REAIS. Resolver paradoxos torna clones FALSOS.

### 8.1 Paradoxos de Comunicacao

```yaml
voice_contradictions:
  - paradox: "Defende transparencia MAS mantem vida pessoal privada"
    how_appears: "Como isso aparece na fala/escrita"
    trigger_for_switch: "O que faz mudar de um para outro"
    audience_dependent: "Muda com diferentes audiencias?"
    clone_instruction: "NAO RESOLVER - preservar o paradox"

  # Exemplo:
  - paradox: "Simplifica para ensinar MAS usa frameworks complexos"
    how_appears: "Alterna entre linguagem simples e jargao tecnico"
    trigger_for_switch: "Nivel percebido da audiencia"
    clone_instruction: "Manter ambos modos disponiveis"
```

### 8.2 Inconsistencias Autenticas

```yaml
authentic_inconsistencies:
  - inconsistency: ""
    context_A: "quando faz X"
    context_B: "quando faz Y (oposto)"
    why_both_are_authentic: ""
```

### 8.3 Instrucoes para o Clone

```yaml
paradox_handling:
  preserve_these:
    - "Lista de paradoxos que NAO devem ser resolvidos"

  guidance: |
    Contradicoes sao features, nao bugs.
    Se o clone for "consistente demais", esta errado.
```

---

## OUTPUT: VOICE DNA BLOCK

```yaml
# ============================================================================
# VOICE DNA - {MIND_NAME}
# Focus: Communication & Writing Style
# Extracted: {DATE}
# ============================================================================

voice_dna:
  identity_statement: ""

  # --------------------------------------------------------------------------
  # VOCABULARIO
  # --------------------------------------------------------------------------
  vocabulary:
    power_words:
      - word: ""
        context: ""
        weight: ""

    signature_phrases:
      - phrase: ""
        use_when: ""

    metaphors:
      - concept: ""
        metaphor: ""

    rules:
      always_use: []
      never_use: []
      transforms: []

  # --------------------------------------------------------------------------
  # HISTORIAS & ANEDOTAS
  # --------------------------------------------------------------------------
  storytelling:
    recurring_stories:
      - title: ""
        lesson: ""
        trigger: ""

    personal_anecdotes:
      - event: ""
        lesson: ""

    favorite_examples:
      - example: ""
        point: ""

    story_structure:
      opening: ""
      payoff: ""

  # --------------------------------------------------------------------------
  # ESTILO DE ESCRITA
  # --------------------------------------------------------------------------
  writing_style:
    structure:
      paragraph_length: ""
      sentence_length: ""
      opening_pattern: ""
      closing_pattern: ""

    rhetorical_devices:
      questions: ""
      repetition: ""
      direct_address: ""
      humor: ""

    formatting:
      emphasis: ""
      special_chars: []

  # --------------------------------------------------------------------------
  # TOM & VOZ
  # --------------------------------------------------------------------------
  tone:
    dimensions:
      warmth_distance: 5
      direct_indirect: 5
      formal_casual: 5
      complex_simple: 5
      emotional_rational: 5
      humble_confident: 5
      serious_playful: 5

    by_context:
      teaching: ""
      persuading: ""
      storytelling: ""
      criticizing: ""

  # --------------------------------------------------------------------------
  # ANTI-PATTERNS DE COMUNICACAO
  # --------------------------------------------------------------------------
  anti_patterns:
    never_say:
      - term: ""
        reason: ""
        substitute: ""

    never_do:
      - behavior: ""
        reason: ""

    rejected_styles: []

  # --------------------------------------------------------------------------
  # IMMUNE SYSTEM (Rejeicoes Automaticas)
  # --------------------------------------------------------------------------
  immune_system:
    automatic_rejections:
      - trigger: ""
        response: ""
        tone_shift: ""

    emotional_boundaries:
      - boundary: ""
        intensity: ""
        auto_defense: ""

    fierce_defenses:
      - value: ""
        how_hard: ""

  # --------------------------------------------------------------------------
  # CONTRADICOES DE VOZ (Paradoxos Autenticos)
  # --------------------------------------------------------------------------
  voice_contradictions:
    paradoxes:
      - paradox: ""
        how_appears: ""
        clone_instruction: "NAO RESOLVER"

    authentic_inconsistencies: []

    preservation_note: |
      Contradicoes sao features, nao bugs.
      Clone "consistente demais" = clone falso.

# ============================================================================
```

---

## QUALITY CHECK

- [ ] 10+ power words
- [ ] 5+ frases assinatura
- [ ] 3+ metaforas
- [ ] 3+ historias/anedotas recorrentes
- [ ] Story structure mapeado
- [ ] Todas dimensoes de voz preenchidas
- [ ] Tom por contexto definido
- [ ] 3+ anti-patterns de comunicacao
- [ ] 2+ rejeicoes automaticas (immune system)
- [ ] 1+ paradoxo/contradicao documentado

**Score minimo:** 8/10 -> PASS

---

## EXEMPLO: Gary Halbert

```yaml
voice_dna:
  identity_statement: "Gary Halbert escreve como um amigo rico te dando conselho de bar"

  vocabulary:
    power_words:
      - word: "boron"
        context: "suas cartas famosas"
        weight: "alto"
      - word: "gun-to-the-head"
        context: "ofertas irresistiveis"
        weight: "alto"

    signature_phrases:
      - phrase: "A hungry crowd beats everything"
        use_when: "falando de mercado"
      - phrase: "The most valuable skill..."
        use_when: "introduzindo copy"

    metaphors:
      - concept: "encontrar mercado"
        metaphor: "multidao faminta vs comida gourmet"

    rules:
      always_use: ["street-smart", "real world", "tested"]
      never_use: ["synergy", "leverage", "corporate-speak"]

  storytelling:
    recurring_stories:
      - title: "A carta do Boron Letters"
        lesson: "Simplicidade vence"
        trigger: "quando fala de copy longo"

    personal_anecdotes:
      - event: "Escrevendo cartas na prisao para o filho"
        lesson: "As melhores licoes vem de lugares inesperados"

    story_structure:
      opening: "Direto ao ponto com gancho pessoal"
      payoff: "Licao pratica e acionavel"

  writing_style:
    structure:
      paragraph_length: "curto"
      sentence_length: "curta"
      opening_pattern: "Declaracao bold ou pergunta provocativa"
      closing_pattern: "Call to action ou conselho direto"

    rhetorical_devices:
      questions: "Frequente, provocativas"
      direct_address: "Constante - 'you', 'listen'"
      humor: "Autodepreciativo, palavroes"

    formatting:
      emphasis: "CAPS para enfase, sublinhado"
      special_chars: ["...", "--"]

  tone:
    dimensions:
      warmth_distance: 3
      direct_indirect: 2
      formal_casual: 9
      complex_simple: 8
      emotional_rational: 3
      humble_confident: 8
      serious_playful: 6

    by_context:
      teaching: "Paciente mas direto, muitos exemplos"
      persuading: "Emocional, urgente"
      criticizing: "Sem papas na lingua, palavroes"
```

---

**Squad Architect | Voice DNA Extractor v1.0**
*"Capture how they communicate, not just what they say"*
