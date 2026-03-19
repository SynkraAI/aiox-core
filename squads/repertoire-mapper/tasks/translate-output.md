---
id: TK-RM-009
name: Translate Outputs to Practitioner Language
version: 1.0.0
executor: chin
purpose: >
  Traduzir outputs academicos e tecnicos do pipeline de mapeamento para
  linguagem pratica usando a abordagem de Cedric Chin (Commoncog).
  Converter jargao em linguagem acessivel, adicionar exemplos do mundo
  real, e criar resumos acionaveis que qualquer praticante pode
  entender sem background academico.
squad: repertoire-mapper
phase: PHASE_5_ORGANIZATION
tier: 3

inputs:
  - name: repertoire_items
    type: list
    description: "Itens de repertorio validados e organizados por PARA"
    required: true
    format: "YAML array com items completos"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis gerado por argyris (TK-RM-007)"
    required: true
    format: "Markdown report"
    location: "outputs/repertoire/{slug}/gap-analysis.md"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise gerado por collins (Tier 0)"
    required: true
    format: "Markdown"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: cdm_extractions
    type: document
    description: "Extracoes CDM de klein (Tier 1)"
    required: false
    format: "YAML com heuristicas"
    location: "outputs/repertoire/{slug}/cdm-extractions.yaml"

  - name: deep_smarts_inventory
    type: document
    description: "Inventario de deep smarts de leonard (Tier 1)"
    required: false
    format: "YAML com items priorizados"
    location: "outputs/repertoire/{slug}/deep-smarts-inventory.yaml"

  - name: repertory_grid
    type: document
    description: "Resultados do Repertory Grid de kelly (Tier 1)"
    required: false
    format: "YAML com construtos e analise"
    location: "outputs/repertoire/{slug}/repertory-grid.yaml"

  - name: seci_classification
    type: document
    description: "Classificacao SECI de nonaka (Tier 2)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/seci-classification.yaml"

preconditions:
  - "QG-005 passado (Final Validation por argyris)"
  - "Gap analysis completo e disponivel"
  - "Pelo menos 10 itens de repertorio validados"
  - "Agente chin carregado com framework de traducao Commoncog"

outputs:
  - name: practitioner_items
    path: "outputs/repertoire/{slug}/practitioner-items.yaml"
    format: yaml
    description: >
      Versao de cada item de repertorio traduzida para linguagem pratica,
      com jargao removido, exemplos adicionados, e formato if-then.

  - name: practitioner_gap_analysis
    path: "outputs/repertoire/{slug}/practitioner-gap-analysis.md"
    format: markdown
    description: >
      Versao do gap analysis em linguagem acessivel, sem jargao
      academico, com exemplos concretos do dominio do sujeito.

  - name: quick_reference
    path: "outputs/repertoire/{slug}/quick-reference.md"
    format: markdown
    description: >
      Guia rapido de 2-3 paginas com os repertorios mais importantes
      em formato de consulta rapida.

  - name: translation_log
    path: "outputs/repertoire/{slug}/translation-log.yaml"
    format: yaml
    description: >
      Log de todas as traducoes feitas: jargao original, versao
      traduzida, justificativa da traducao.

validation:
  success_criteria:
    - "100% dos itens traduzidos para linguagem pratica"
    - "Zero jargao academico remanescente sem explicacao"
    - "Cada item tem pelo menos 1 exemplo do mundo real"
    - "Formato if-then aplicado a heuristicas"
    - "Quick reference gerado com top items"
    - "Um praticante sem background academico pode entender cada item"
    - "Significado original preservado (fidelidade semantica)"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Translate Outputs to Practitioner Language

## Executive Summary

Esta task aplica a filosofia de Cedric Chin (Commoncog) de que conhecimento
tacito so tem valor quando e acessivel a praticantes. Os outputs do pipeline
de mapeamento -- gap analysis, decision frameworks, expertise profiles --
estao repletos de jargao academico (espoused theory, theory-in-use, RPD model,
SECI cycle, Dreyfus stages) que um praticante nao reconhece. Esta task traduz
TUDO para linguagem que o sujeito e seus pares entendem e podem aplicar.

**Posicao no Pipeline:** Task 9 -- Phase 5 (Organization) do Full Mapping Pipeline
**Definicao de Sucesso:** Um praticante sem formacao academica entende 100% dos outputs
**Execucao Paralela:** Roda em paralelo com TK-RM-008 (organize-para por forte)

---

## Purpose

O pipeline de mapeamento usa frameworks de 9 pensadores diferentes: Polanyi,
Collins, Klein, Leonard, Kelly, Nonaka, Argyris, Chin, Forte. Cada um
tem sua propria terminologia:

- **Polanyi:** tacit/explicit, proximal/distal, indwelling, subsidiary awareness
- **Collins:** interactional/contributory expertise, relational/somatic/collective
- **Klein:** RPD, CDM, cues, patterns, mental simulation, mental models
- **Leonard:** deep smarts, knowledge transfer continuum, OPPTY process
- **Kelly:** personal constructs, elements, poles, laddering, repertory grid
- **Nonaka:** socialization, externalization, combination, internalization (SECI)
- **Argyris:** espoused theory, theory-in-use, Model I/II, double-loop, defensive routines

Essa terminologia e util para ANALISE, mas inutil para ACAO. O sujeito nao
precisa saber que tem "relational tacit knowledge at contributory expertise
level undergoing externalization in the SECI cycle." Ele precisa saber:
"Voce sabe fazer isso, mas nunca explicou como -- e hora de escrever."

Cedric Chin construiu o Commoncog exatamente sobre esta ponte: traduzir
ciencia cognitiva de expertise para linguagem que praticantes usam.
Esta task aplica essa filosofia sistematicamente a todos os outputs.

---

## Executor Type

**Agent: chin (100% automatizado)**

- **Agent Role:** Traducao de jargao, criacao de exemplos, formato if-then, quick reference
- **Human Role:** Nenhum durante a traducao (sujeito pode validar depois)
- **Estimated Runtime:** 15-25 minutos dependendo do volume

---

## Steps

### Step 1: Inventory All Jargon (3-5 min)

**Agent Activity:**

Escanear todos os outputs do pipeline e criar um inventario completo de
termos tecnicos/academicos que precisam ser traduzidos.

**Jargon Detection Rules:**

```yaml
jargon_categories:
  academic_terms:
    examples:
      - "espoused theory" → precisa traducao
      - "theory-in-use" → precisa traducao
      - "tacit knowledge" → precisa traducao
      - "double-loop learning" → precisa traducao
      - "proximal-distal" → precisa traducao
      - "indwelling" → precisa traducao
      - "socialization/externalization/combination/internalization" → precisa traducao
    detection: "Termos que nao existem no vocabulario cotidiano"

  framework_names:
    examples:
      - "RPD Model" → precisa traducao ou descricao
      - "CDM" → precisa traducao
      - "Repertory Grid" → precisa traducao
      - "SECI Cycle" → precisa traducao
      - "Ladder of Inference" → pode manter mas precisa explicacao
    detection: "Nomes de frameworks academicos"

  classification_labels:
    examples:
      - "Dreyfus Proficient" → precisa traducao
      - "Collins Contributory" → precisa traducao
      - "Somatic tacit knowledge" → precisa traducao
      - "Model I defensive reasoning" → precisa traducao
    detection: "Labels de taxonomias especificas"

  acceptable_terms:
    examples:
      - "mental model" → amplamente usado, manter
      - "framework" → amplamente usado, manter
      - "heuristica" → pode manter com breve explicacao
      - "feedback" → universal, manter
      - "expertise" → amplamente usado, manter
    detection: "Termos que ja entraram no vocabulario popular"
```

**Jargon Inventory Output:**

```yaml
jargon_inventory:
  total_unique_terms: N
  terms:
    - term: "espoused theory"
      frequency: N
      contexts: ["gap-analysis.md", "expertise-profile.md"]
      translation_needed: true
      suggested_translation: "o que voce diz que faz"
      fidelity_check: "Preserva o significado de 'teoria declarada publicamente'"

    - term: "theory-in-use"
      frequency: N
      contexts: ["gap-analysis.md"]
      translation_needed: true
      suggested_translation: "o que voce realmente faz na pratica"
      fidelity_check: "Preserva o contraste com espoused theory"

    - term: "RPD Model"
      frequency: N
      contexts: ["cdm-extractions.yaml"]
      translation_needed: true
      suggested_translation: "processo de decisao por reconhecimento de padroes"
      fidelity_check: "Descreve o mecanismo sem o acronimo"

    - term: "double-loop learning"
      frequency: N
      contexts: ["gap-analysis.md"]
      translation_needed: true
      suggested_translation: "questionar as premissas, nao so corrigir o erro"
      fidelity_check: "Captura a essencia de mudar governing variables"
```

**Checkpoint:** Inventario de jargao completo

---

### Step 2: Create Translation Dictionary (3-5 min)

**Agent Activity:**

Construir um dicionario de traducoes padronizadas para garantir consistencia
em todos os outputs.

**Translation Principles (Cedric Chin):**

```yaml
translation_principles:
  principle_1_no_dumbing_down:
    description: "Traduzir nao e simplificar. E trocar de idioma, nao de profundidade."
    example:
      bad: "Conhecimento tacito = coisas que voce sabe"
      good: "Conhecimento tacito = o que voce sabe fazer mas nao consegue explicar em palavras"

  principle_2_use_their_domain:
    description: "Usar exemplos do dominio do sujeito, nao exemplos genericos."
    example:
      bad: "Como andar de bicicleta -- voce sabe mas nao consegue explicar"
      good: "Como voce sabe que um cliente vai fechar -- voce 'sente', mas tenta explicar e nao consegue"

  principle_3_if_then_format:
    description: "Converter principios abstratos em regras SE-ENTAO."
    example:
      bad: "Pattern recognition is enhanced through deliberate practice"
      good: "SE voce praticar identificar padroes de X conscientemente, ENTAO vai reconhecer mais rapido"

  principle_4_show_dont_tell:
    description: "Usar exemplos concretos ao inves de definicoes abstratas."
    example:
      bad: "Indwelling e a integracao subsidiaria de um instrumento na percepcao"
      good: "Quando voce usa uma planilha, nao pensa nos menus -- pensa no problema. A planilha virou extensao do seu pensamento."

  principle_5_preserve_meaning:
    description: "A traducao DEVE preservar 100% do significado original."
    fidelity_check: "Se eu traduzir de volta para o original, o significado se mantem?"
```

**Translation Dictionary:**

```yaml
translation_dictionary:
  # Polanyi Framework
  tacit_knowledge:
    academic: "Tacit knowledge"
    practitioner: "O que voce sabe fazer mas nao consegue explicar em palavras"
    short: "Saber pratico nao-verbal"

  explicit_knowledge:
    academic: "Explicit knowledge"
    practitioner: "O que voce consegue explicar, escrever, ou ensinar passo-a-passo"
    short: "Saber que da pra explicar"

  proximal_distal:
    academic: "Proximal-distal relationship"
    practitioner: "A relacao entre o que voce foca (o problema) e o que voce usa sem pensar (a ferramenta)"
    short: "Foco vs ferramenta"

  indwelling:
    academic: "Indwelling"
    practitioner: "Quando uma ferramenta ou conceito se torna extensao do seu pensamento -- voce nao pensa NELA, pensa COM ela"
    short: "Pensar com a ferramenta"

  # Collins Framework
  interactional_expertise:
    academic: "Interactional expertise"
    practitioner: "Voce consegue conversar com especialistas e entende-los, mas nao consegue FAZER o trabalho deles"
    short: "Entende mas nao faz"

  contributory_expertise:
    academic: "Contributory expertise"
    practitioner: "Voce consegue FAZER o trabalho, nao so falar sobre ele"
    short: "Sabe e faz"

  relational_tacit:
    academic: "Relational tacit knowledge"
    practitioner: "Conhecimento que PODERIA ser explicado, mas ninguem nunca pediu -- esta implicito por habito"
    short: "Saber implicito por habito"

  somatic_tacit:
    academic: "Somatic tacit knowledge"
    practitioner: "Conhecimento no corpo -- voce sente, intui, percebe sem pensar conscientemente"
    short: "Intuicao corporea"

  collective_tacit:
    academic: "Collective tacit knowledge"
    practitioner: "O que so funciona quando o grupo esta junto -- nao pertence a nenhum individuo"
    short: "Saber do grupo"

  # Argyris Framework
  espoused_theory:
    academic: "Espoused theory"
    practitioner: "O que voce DIZ que faz (como voce se apresenta)"
    short: "O que voce diz"

  theory_in_use:
    academic: "Theory-in-use"
    practitioner: "O que voce REALMENTE faz (o que as evidencias mostram)"
    short: "O que voce faz de verdade"

  single_loop:
    academic: "Single-loop learning"
    practitioner: "Corrigir o erro sem questionar se a abordagem inteira faz sentido"
    short: "Corrigir sem questionar"

  double_loop:
    academic: "Double-loop learning"
    practitioner: "Parar e perguntar: sera que estou atacando o problema certo? Sera que minhas premissas estao certas?"
    short: "Questionar as premissas"

  model_I:
    academic: "Model I (defensive reasoning)"
    practitioner: "Modo defensivo: manter controle, evitar vulnerabilidade, proteger posicao"
    short: "Modo defensivo"

  model_II:
    academic: "Model II (productive reasoning)"
    practitioner: "Modo aberto: expor raciocinio, convidar questionamento, buscar verdade mesmo que desconfortavel"
    short: "Modo aberto"

  ladder_of_inference:
    academic: "Ladder of Inference"
    practitioner: "A sequencia de saltos mentais entre 'o que aconteceu' e 'o que voce concluiu' -- cada degrau adiciona interpretacao"
    short: "Cadeia de conclusoes"

  # Klein Framework
  rpd:
    academic: "Recognition-Primed Decision Making"
    practitioner: "Tomar decisoes reconhecendo padroes de situacoes passadas -- ao inves de analisar todas as opcoes"
    short: "Decisao por reconhecimento"

  cdm:
    academic: "Critical Decision Method"
    practitioner: "Metodo de repassar uma decisao dificil passo a passo para extrair o que voce realmente percebeu e pensou"
    short: "Entrevista de decisao"

  # Dreyfus
  dreyfus_novice:
    academic: "Dreyfus Novice"
    practitioner: "Iniciante: segue regras, precisa de instrucoes"
    short: "Iniciante"

  dreyfus_advanced_beginner:
    academic: "Dreyfus Advanced Beginner"
    practitioner: "Ja passou do basico: reconhece situacoes mas precisa de guia"
    short: "Iniciante avancado"

  dreyfus_competent:
    academic: "Dreyfus Competent"
    practitioner: "Competente: faz o trabalho, planeja, prioriza"
    short: "Competente"

  dreyfus_proficient:
    academic: "Dreyfus Proficient"
    practitioner: "Proficiente: ve o quadro todo, sabe o que e importante, decide rapido"
    short: "Proficiente"

  dreyfus_expert:
    academic: "Dreyfus Expert"
    practitioner: "Expert: age por intuicao, nao precisa pensar sobre o basico -- flui"
    short: "Expert"

  # Nonaka SECI
  seci_socialization:
    academic: "SECI Socialization"
    practitioner: "Aprender praticando junto -- absorver pela convivencia"
    short: "Aprender junto"

  seci_externalization:
    academic: "SECI Externalization"
    practitioner: "Transformar o que voce sabe fazer em algo que da pra explicar ou escrever"
    short: "Colocar em palavras"

  seci_combination:
    academic: "SECI Combination"
    practitioner: "Combinar conhecimentos explicitos diferentes para criar algo novo"
    short: "Combinar saberes"

  seci_internalization:
    academic: "SECI Internalization"
    practitioner: "Praticar ate o conhecimento virar automatico -- sai da teoria e entra no corpo"
    short: "Praticar ate virar natural"
```

**Checkpoint:** Dicionario de traducao completo e revisado

---

### Step 3: Translate Each Repertoire Item (5-8 min)

**Agent Activity:**

Aplicar o dicionario de traducao a cada item de repertorio, adicionando
exemplos do dominio do sujeito e convertendo para formato if-then.

**Translation Template per Item:**

```yaml
practitioner_item:
  id: "RM-ITEM-042"
  original_title: "Retention-Acquisition Priority Heuristic (RPD-based)"
  practitioner_title: "Regra: Primeiro corrigir retencao, depois investir em aquisicao"

  original_description: |
    Heuristica baseada em RPD que prioriza retention metrics
    sobre acquisition metrics quando o sujeito identifica um
    leaky bucket pattern via somatic tacit knowledge.

  practitioner_description: |
    Quando voce percebe (por intuicao ou pelos numeros) que clientes
    estao saindo mais rapido do que entrando, a primeira coisa a
    fazer e parar de gastar em atrair novos clientes e resolver por
    que os atuais estao saindo. Parece contra-intuitivo, mas funciona
    porque dinheiro gasto em aquisicao enquanto a retencao ta quebrada
    e dinheiro jogado fora.

  if_then_format:
    situation: "Receita esta crescendo mas retenção (% de clientes que ficam) esta caindo"
    action: "Pausar investimento em aquisicao de novos clientes"
    then_do: "Investigar e corrigir a causa da saida de clientes"
    because: "Cada real gasto em aquisicao com retencao baixa e 70% desperdicado"

  real_world_example: |
    Imagine que voce tem uma loja e todo mes entram 100 clientes novos.
    Mas todo mes 80 nunca voltam. Voce pode gastar mais em marketing
    pra trazer 150, 200... mas se 80% nao volta, voce nunca sai do
    lugar. Melhor: descobrir por que 80 nao voltam e consertar isso
    primeiro.

  jargon_replaced:
    - original: "RPD-based heuristic"
      replaced_with: "Regra pratica baseada em reconhecimento de padroes"
    - original: "somatic tacit knowledge"
      replaced_with: "intuicao / 'gut feeling'"
    - original: "leaky bucket pattern"
      replaced_with: "clientes saindo mais rapido do que entrando"

  dreyfus_translation:
    original: "Proficient"
    practitioner: "Voce faz isso automaticamente na maioria dos casos -- nao precisa pensar muito"

  confidence: 0.85
  fidelity_score: 0.95  # 1.0 = traducao perfeita sem perda de significado
```

**Translation Quality Checks per Item:**

```yaml
quality_checks:
  - check: "Sem jargao remanescente"
    method: "Scan contra jargon_inventory"
    result: PASS/FAIL

  - check: "Exemplo do mundo real presente"
    method: "Campo real_world_example preenchido"
    result: PASS/FAIL

  - check: "Formato if-then aplicado"
    method: "Campos situation/action/then_do/because preenchidos"
    result: PASS/FAIL

  - check: "Fidelidade semantica preservada"
    method: "Reverse-translate test: a versao pratica perde significado?"
    result: PASS/FAIL
    fidelity_score: 0.0-1.0

  - check: "Praticante entenderia sem contexto"
    method: "Ler versao pratica isolada -- faz sentido sozinha?"
    result: PASS/FAIL
```

**Checkpoint:** Todos os itens traduzidos e quality-checked

---

### Step 4: Translate Gap Analysis (3-5 min)

**Agent Activity:**

Converter o gap-analysis.md de linguagem academica para linguagem pratica.

**Translation Approach:**

```yaml
gap_translation_approach:
  section_by_section:
    espoused_vs_theory_in_use:
      academic_heading: "Espoused Theory vs Theory-in-Use Analysis"
      practitioner_heading: "O que voce diz que faz vs o que voce realmente faz"

    execution_gap:
      academic: "Execution gap identified in leadership domain"
      practitioner: "Em lideranca, voce sabe o que deveria fazer mas nem sempre faz"

    blind_spot:
      academic: "Blind spot detected: somatic tacit knowledge not articulated"
      practitioner: "Voce tem uma habilidade que usa sem perceber -- e nao sabe explicar"

    contradiction:
      academic: "Contradiction between RM-ITEM-015 and RM-ITEM-067"
      practitioner: "Duas coisas que voce acredita nao combinam entre si"

    hidden_expertise:
      academic: "Hidden expertise in relational tacit domain"
      practitioner: "Voce e muito bom em algo que nao reconhece como habilidade"

    double_loop_opportunity:
      academic: "Double-loop learning opportunity in pricing domain"
      practitioner: "Em precificacao, voce esta tentando resolver o problema errado -- precisa questionar a premissa, nao so ajustar o numero"

    model_I_II:
      academic: "Subject exhibits predominantly Model I reasoning in organizational contexts"
      practitioner: "Em situacoes de equipe, voce tende a operar no 'modo defensivo' -- protegendo sua posicao ao inves de abrir o raciocinio pra teste"
```

**Practitioner Gap Analysis Output (practitioner-gap-analysis.md):**

```markdown
# Analise de Gaps: O que voce diz vs o que voce faz

## Resumo

Encontramos {N} pontos onde o que voce diz que faz difere do que as
evidencias mostram. Isso e NORMAL -- nao e mentira, e ponto cego.
{N} sao criticos (precisam atencao), {N} sao significativos, {N} sao menores.

## Principais Achados

### 1. Habilidades que voce tem mas nao reconhece

{Traducao de hidden expertise com exemplos concretos}

### 2. O que voce diz que faz mas nem sempre faz

{Traducao de execution gaps com exemplos concretos}

### 3. Crencas que se contradizem

{Traducao de contradictions com exemplos e caminho de resolucao}

### 4. Onde voce esta atacando o problema errado

{Traducao de double-loop opportunities em linguagem pratica}

### 5. Quando voce opera no 'modo defensivo'

{Traducao de Model I patterns sem julgamento}

## O que fazer com isso

{Recomendacoes praticas, em linguagem direta}
```

**Checkpoint:** Gap analysis traduzido

---

### Step 5: Generate Quick Reference Guide (3-5 min)

**Agent Activity:**

Criar um guia de consulta rapida de 2-3 paginas com os repertorios mais
importantes em formato ultra-pratico.

**Quick Reference Structure:**

```markdown
# Guia Rapido: Seus Repertorios Essenciais

> {Nome do Sujeito} -- Gerado em {YYYY-MM-DD}
> Use este guia como referencia rapida antes de decisoes importantes.

---

## Suas Top 10 Regras Praticas

1. **{Titulo curto}**
   - Quando: {situacao}
   - Faca: {acao}
   - Por que: {razao em 1 frase}
   - Confianca: {alta/media/baixa}

2. **{Titulo curto}**
   ...

---

## Seus Pontos Fortes (Que Voce Talvez Nao Saiba)

1. **{Hidden expertise 1}** -- {Descricao em 1-2 frases}
2. **{Hidden expertise 2}** -- {Descricao em 1-2 frases}

---

## Armadilhas a Evitar

1. **{Gap/Contradicao 1}** -- {O que acontece e como evitar}
2. **{Gap/Contradicao 2}** -- {O que acontece e como evitar}

---

## Perguntas Para Se Fazer Antes de Decidir

1. {Pergunta derivada de double-loop opportunity 1}
2. {Pergunta derivada de double-loop opportunity 2}
3. {Pergunta derivada de double-loop opportunity 3}

---

## Onde Voce E Melhor (e Onde Precisa de Ajuda)

| Area | Seu Nivel | Traduzindo |
|------|-----------|------------|
| {area 1} | Expert | Flui naturalmente, confia na intuicao |
| {area 2} | Proficiente | Ve o quadro todo, decide rapido |
| {area 3} | Competente | Faz bem, mas precisa planejar |
| {area 4} | Iniciante avancado | Reconhece situacoes, precisa de guia |
```

**Selection Criteria for Quick Reference:**

```yaml
selection_criteria:
  top_10_rules:
    source: "cdm_extractions + deep_smarts + repertory_grid"
    filter: "confidence >= 0.7 AND dreyfus_level >= competent"
    sort: "actionability_score DESC"
    limit: 10

  hidden_expertise:
    source: "gap_analysis.gaps WHERE type = 'hidden_expertise'"
    filter: "confidence >= 0.6"
    sort: "confidence DESC"
    limit: 5

  traps:
    source: "gap_analysis.gaps WHERE type IN ('contradiction', 'execution_gap')"
    filter: "severity IN ('critical', 'significant')"
    sort: "severity DESC"
    limit: 5

  questions:
    source: "gap_analysis.double_loop_opportunities"
    transform: "Convert opportunity to self-check question"
    limit: 5
```

**Checkpoint:** Quick reference guide gerado

---

### Step 6: Verify Practitioner Readability (2-3 min)

**Agent Activity:**

Executar verificacao final de que todos os outputs traduzidos sao
compreensiveis por um praticante sem background academico.

**Readability Checklist:**

```yaml
readability_checks:
  - check: "Nenhum termo academico sem explicacao"
    method: "Scan contra jargon_inventory"
    threshold: "0 termos nao traduzidos"

  - check: "Frases com menos de 30 palavras em media"
    method: "Word count por frase"
    threshold: "Media <= 30 palavras"

  - check: "Exemplos presentes para conceitos abstratos"
    method: "Cada item com real_world_example"
    threshold: "100% dos itens"

  - check: "Formato SE-ENTAO para heuristicas"
    method: "if_then_format preenchido"
    threshold: "100% das heuristicas"

  - check: "Voz ativa predominante"
    method: "Scan por construcoes passivas"
    threshold: "< 20% de frases passivas"

  - check: "Linguagem em primeira/segunda pessoa"
    method: "Scan por 'voce', 'seu', 'sua'"
    threshold: "Outputs direcionados ao sujeito"

  - check: "Fidelidade semantica preservada"
    method: "Reverse-translate sample de 5 itens"
    threshold: "fidelity_score >= 0.85 para todos"
```

**Checkpoint:** Readability verificada

---

### Step 7: Generate Translation Log (2-3 min)

**Agent Activity:**

Compilar log completo de todas as traducoes feitas para rastreabilidade
e para que outros agentes possam referenciar o dicionario.

**translation-log.yaml:**

```yaml
translation_log:
  metadata:
    subject: "{nome}"
    date: "2026-02-18"
    executor: "chin"
    total_terms_translated: N
    total_items_translated: N
    average_fidelity_score: 0.0-1.0

  dictionary_used:
    version: "1.0.0"
    total_entries: N
    custom_entries: N  # Entradas especificas para este sujeito

  translations:
    - item_id: "RM-ITEM-042"
      terms_translated: ["RPD-based", "somatic tacit knowledge", "leaky bucket pattern"]
      fidelity_score: 0.95
      notes: "Traducao direta, sem perda de significado"

    - item_id: "RM-ITEM-067"
      terms_translated: ["double-loop learning", "governing variables"]
      fidelity_score: 0.88
      notes: "Conceito de governing variables simplificado para 'premissas'"

  quality_summary:
    items_above_90_fidelity: N
    items_between_80_90: N
    items_below_80: N
    flagged_for_review: ["RM-ITEM-XXX"]
```

**Checkpoint:** Translation log completo

---

## Validation

### Checklist

- [ ] Inventario de jargao completo (100% dos termos identificados)
- [ ] Dicionario de traducao construido
- [ ] 100% dos itens traduzidos para linguagem pratica
- [ ] Zero jargao academico remanescente sem explicacao
- [ ] Cada item tem pelo menos 1 exemplo do mundo real
- [ ] Formato if-then aplicado a 100% das heuristicas
- [ ] Gap analysis traduzido para linguagem pratica
- [ ] Quick reference guide gerado (2-3 paginas)
- [ ] Readability checklist passado (todas as verificacoes)
- [ ] Fidelidade semantica >= 0.85 para todos os itens
- [ ] Translation log gerado
- [ ] Nenhuma perda critica de significado nas traducoes

### Success Criteria

**Threshold: 8/10 no checklist acima**

| Criteria | Excelente (3) | Aceitavel (2) | Insuficiente (1) |
|----------|--------------|----------------|-------------------|
| **Jargon Removal** | 0% jargao remanescente | < 5% com explicacao | > 5% sem explicacao |
| **Examples** | 100% com exemplos do dominio | 80% com exemplos | < 80% |
| **If-Then** | 100% heuristicas em if-then | 80% em if-then | < 80% |
| **Fidelity** | >= 0.90 media | >= 0.85 media | < 0.85 media |
| **Quick Ref** | Completo, < 3 pags, acionavel | Completo mas > 3 pags | Incompleto |
| **Readability** | Praticante entende 100% | Praticante entende 90% | < 90% |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Jargon Inventory** | 3-5 min | Scan all outputs |
| **Translation Dictionary** | 3-5 min | Build standardized translations |
| **Translate Items** | 5-8 min | Per-item translation with examples |
| **Translate Gap Analysis** | 3-5 min | Section-by-section |
| **Quick Reference** | 3-5 min | Curate and format |
| **Readability Check** | 2-3 min | Final verification |
| **Translation Log** | 2-3 min | Compile log |
| **Total** | 21-34 min | Scales with item/term count |

---

## Integration

### Feeds To

- **TK-RM-011 (generate-operating-manual):** Translated items sao a base do manual
- **TK-RM-010 (generate-manifest):** Practitioner descriptions sao incluidas no manifest
- **Phase 6 (Delivery):** Quick reference e entregavel direto

### Depends On

- **TK-RM-007 (validate-gaps):** Gap analysis e input principal
- **TK-RM-001 to TK-RM-006:** Itens extraidos por Tier 0 e Tier 1
- **QG-005:** Final Validation deve ter sido passado

### Agent Routing

**Primary Agent:** chin (Tier 3 -- Translation)
**Quality Review:** repertoire-chief (valida que traducao preserva significado)
**Parallel Execution:** Roda em paralelo com TK-RM-008 (forte) na Phase 5

---

## Notes for Executor

### Traducao Nao E Simplificacao

O maior risco desta task e "dumbing down" -- perder nuance ao simplificar.
A diferenca entre "somatic tacit knowledge" e "intuicao" nao e so de
terminologia -- "somatic tacit" inclui conhecimento CORPORAL que "intuicao"
nao captura. A traducao deve preservar essa nuance:
"Intuicao -- especificamente o tipo que voce sente no corpo, nao no raciocinio."

### Use o Dominio do Sujeito

Exemplos genericos ("como andar de bicicleta") sao piores que exemplos do
dominio do sujeito. Se o sujeito e mentor de negocios, use exemplos de
negocio. Se e medico, use exemplos de medicina. O exemplo deve ressoar.

### O Dicionario E Vivo

Este dicionario deve ser persistido e atualizado conforme novos mapeamentos
sao feitos. Termos que o sujeito ja entende nao precisam de traducao em
sessoes futuras.

### Quick Reference E O Deliverable Mais Lido

Na pratica, o quick-reference.md sera o documento mais consultado pelo
sujeito. Ele precisa ser PERFEITO em clareza e acionabilidade. Se tiver
que escolher entre mais detalhes e mais clareza, escolha clareza.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
