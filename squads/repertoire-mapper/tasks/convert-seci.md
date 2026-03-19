---
id: TK-RM-006
name: Convert SECI
version: 1.0.0
executor: nonaka
purpose: >
  Converter conhecimento via SECI Model de Nonaka & Takeuchi — Socialization,
  Externalization, Combination, Internalization. Classificar cada item de
  repertorio pelo estagio SECI atual, aplicar a conversao apropriada,
  classificar os knowledge assets resultantes, identificar o 'ba' (contexto
  compartilhado) necessario, e verificar a qualidade da conversao.

inputs:
  - name: repertoire_items
    type: list[file]
    description: >
      Itens de repertorio para conversao. Podem vir de CDM extractions
      (TK-RM-002), RepGrid constructs (TK-RM-003/004), ou Deep Smarts
      inventory (TK-RM-005). Cada item tem tipo, dominio, confianca e
      classificacao Polanyi/Collins.
    required: true
    location: "outputs/repertoire-mapper/{slug}/extractions/*-items.yaml"

  - name: deep_smarts_inventory
    type: file
    description: >
      Inventario de Deep Smarts (TK-RM-005). Itens priorizados como
      CRITICAL ou HIGH recebem conversao mais rigorosa.
    required: false
    location: "outputs/repertoire-mapper/{slug}/deep-smarts/inventory.yaml"

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001. Classificacao Polanyi (tacito/explicito) e
      Collins (tipo de tacit knowledge) informam qual conversao SECI aplicar.
    required: true
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: construct_map
    type: file
    description: >
      Mapa de construtos de TK-RM-004. Usado para enriquecer a
      Combination (combinar construtos em frameworks maiores).
    required: false
    location: "outputs/repertoire-mapper/{slug}/grid/construct-map.yaml"

  - name: conversion_priority
    type: enum
    description: >
      Qual conversao priorizar. 'externalization' foca em transformar
      tacito em explicito (mais comum). 'combination' foca em combinar
      explicitos em sistemas. 'internalization' foca em transformar
      explicito em pratica. 'full_cycle' executa todas as conversoes.
    required: false
    options: ["externalization", "combination", "internalization", "full_cycle"]
    default: "externalization"

preconditions:
  - "Itens de repertorio extraidos e classificados (Tier 1 outputs)"
  - "Diagnostico TK-RM-001 completo (Polanyi + Collins)"
  - "Agente nonaka acessivel e configurado"
  - "Pelo menos 5 itens para conversao"
  - "Para Combination: pelo menos 10 itens explicitos"
  - "Para full_cycle: todos os prerequisitos acima + construct_map"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/seci/converted-items.yaml"
    description: >
      Itens convertidos com classificacao SECI, tipo de knowledge asset,
      ba identificado, e status de conversao.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/seci/seci-map.yaml"
    description: >
      Mapa SECI completo — fluxo de conversao, knowledge assets por
      tipo, ba map, e ciclo de conversao projetado.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/seci/conversion-report.md"
    description: >
      Relatorio de conversao — o que foi convertido, como, qualidade
      da conversao, gaps e recomendacoes.
    format: markdown

validation:
  success_criteria:
    - "Todos os itens classificados pelo estagio SECI atual"
    - "Conversao aplicada conforme tipo (S→E, E→C, C→I, etc.)"
    - "Knowledge assets classificados (experiential, conceptual, systemic, routine)"
    - "Ba identificado para cada conversao (originating, dialoguing, systemizing, exercising)"
    - "Qualidade da conversao verificada (sem perda de significado)"
    - "Itens Deep Smarts CRITICAL receberam conversao rigorosa com validacao extra"
    - "SECI map gerado com ciclo de conversao completo"
  quality_threshold: "5/7 criterios acima"
---

# Task: Convert SECI

**Task ID:** TK-RM-006
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

O SECI Model de Ikujiro Nonaka e Hirotaka Takeuchi e o framework mais influente para entender como conhecimento organizacional e criado e transformado. SECI descreve um espiral de quatro conversoes entre conhecimento tacito e explicito:

- **Socialization (Tacito → Tacito):** Compartilhar experiencia direta
- **Externalization (Tacito → Explicito):** Articular o tacito em conceitos
- **Combination (Explicito → Explicito):** Combinar conceitos em sistemas
- **Internalization (Explicito → Tacito):** Aprender fazendo, incorporar

Esta task aplica o modelo SECI a cada item de repertorio extraido, executando a conversao apropriada para transformar conhecimento bruto em artefatos uteis e transferiveis. A conversao mais critica e a **Externalization** — transformar o que o especialista "sabe mas nao diz" em conceitos articulados, frameworks e heuristicas documentadas.

**Workflow Position:** Task 6 — executa apos extracao (Tier 1) e priorizacao (TK-RM-005)
**Success Definition:** Itens convertidos com classificacao SECI, knowledge assets e ba identificados
**Output Quality Gate:** QG-004 (SECI cycle completo, itens categorizados)

---

## Purpose

O pipeline do Repertoire Mapper ate aqui extraiu e priorizou itens de conhecimento. Mas itens brutos nao sao uteis — precisam ser CONVERTIDOS em formatos que permitam preservacao, transferencia e aplicacao.

Nonaka descobriu que a criacao de conhecimento nao e um processo linear (tacito → explicito) mas um **espiral** que passa por quatro modos de conversao. Cada modo produz um tipo diferente de knowledge asset:

| Conversao | De → Para | Knowledge Asset | Exemplo |
|-----------|-----------|----------------|---------|
| Socialization | Tacito → Tacito | Experiential | Mentor ensina aprendiz fazendo junto |
| Externalization | Tacito → Explicito | Conceptual | Heuristica articulada em words |
| Combination | Explicito → Explicito | Systemic | Frameworks combinados em sistema |
| Internalization | Explicito → Tacito | Routine | Checklist praticado ate virar habito |

Para o Repertoire Mapper, as conversoes mais criticas sao:
1. **Externalization:** O grosso do trabalho — transformar CDM extractions e RepGrid constructs em artefatos articulados
2. **Combination:** Conectar artefatos em sistemas maiores (frameworks de decisao, manuais operacionais)
3. **Internalization:** Projetar como o conhecimento articulado pode ser re-incorporado (em treinos, praticas, rotinas)

---

## Executor Type

**Agent (100% nonaka)**

- **Agent Role:** Classificar estagios SECI, aplicar conversoes, classificar knowledge assets, identificar ba, verificar qualidade
- **Human Role:** Validar externalizacoes criticas (o especialista confirma que a articulacao e fiel)
- **Estimated Runtime:** 30-60 min dependendo do numero de itens e profundidade

---

## Steps

### Step 1: Classificar Itens pelo Estagio SECI Atual (5-8 min)

**Executor:** nonaka

1.1. **Carregar todos os itens:**
- Ler `repertoire_items` (CDM extractions, RepGrid constructs)
- Ler `deep_smarts_inventory` (se disponivel — para priorizacao)
- Ler `diagnosis_data` (Polanyi/Collins para classificacao)
- Ler `construct_map` (se disponivel — para Combination)

1.2. **Classificar cada item pelo estagio SECI atual:**

O estagio SECI indica ONDE o conhecimento esta agora no espiral:

```yaml
seci_classification:
  - item_id: "KI-001"
    summary: "Priorizar retencao antes de aquisicao"
    current_stage: "between_S_and_E"
    stage_justification: >
      Este conhecimento foi parcialmente externalizado pela extracao CDM
      (temos a heuristica when/then/because). Mas a dimensao somatic
      (o 'feeling' de quando a retention curve esta caindo) ainda e tacita.
      Precisa de mais externalizacao para capturar o componente somatic.
    polanyi_type: "predominantly_tacit"
    collins_tacit_type: "somatic"
    target_conversion: "E"  # Externalization
    conversion_priority: "CRITICAL"  # Herda de Deep Smarts

  - item_id: "KI-005"
    summary: "Framework AIDA para copy"
    current_stage: "E"
    stage_justification: >
      Ja esta externalizado — AIDA e um framework explicito com passos
      documentados. O proximo passo e Combination (combinar com outros
      frameworks de copy do especialista em sistema integrado).
    polanyi_type: "predominantly_explicit"
    collins_tacit_type: "relational"
    target_conversion: "C"  # Combination
    conversion_priority: "MEDIUM"

  - item_id: "KI-008"
    summary: "Sistema de analise de metricas + processo de decisao + framework de otimizacao"
    current_stage: "C"
    stage_justification: >
      Varios conhecimentos explicitos ja foram combinados em um sistema.
      O proximo passo e Internalization — transformar esse sistema em
      pratica incorporada (checklists, rotinas, dashboards).
    polanyi_type: "explicit_system"
    target_conversion: "I"  # Internalization
    conversion_priority: "LOW"
```

1.3. **Estadisticas de classificacao:**

```yaml
seci_distribution:
  socialization_stage: 3   # Conhecimento puramente tacito, nao extraido ainda
  pre_externalization: 12  # Parcialmente extraido, precisa mais articulacao
  externalization: 18      # Pronto para externalizar
  combination: 8           # Ja explicito, pronto para combinar
  internalization: 4       # Ja combinado, pronto para incorporar
  total: 45
```

**Checkpoint:** Todos os itens classificados. Conversoes necessarias identificadas.

---

### Step 2: Aplicar Externalization (Tacito → Explicito) (10-15 min)

**Executor:** nonaka
**Condicao:** Para itens classificados como S ou pre-E, e quando `conversion_priority` inclui externalization

A Externalization e a conversao mais critica e mais dificil. Nonaka identificou 5 tecnicas de externalizacao:

2.1. **Tecnica 1: Metafora (metaphor)**

Transformar conhecimento tacito em metaforas articulaveis:

```yaml
externalization_metaphor:
  item_id: "KI-001"
  tacit_input: "O especialista 'sente' quando a retention curve vai cair"

  metaphor_generated:
    metaphor: >
      "Analisar retencao e como ouvir o motor de um carro. Um mecanico
      experiente ouve uma vibracao sutil e sabe que o rolamento vai
      falhar em 3 meses. O som nao e alto — e a TEXTURA do som que
      mudou. Da mesma forma, nao e o numero de retencao que importa —
      e a FORMA da curva que mudou."
    source_domain: "mecanica automotiva"
    target_domain: "analytics de retencao"
    mapping:
      "vibração sutil": "micro-variação na curva de retenção"
      "textura do som": "forma/slope da curva"
      "rolamento vai falhar": "churn vai acelerar"
      "3 meses de antecedência": "3-6 meses antes de impacto no revenue"

  quality_check:
    preserves_original_meaning: true
    adds_new_understanding: true
    is_memorable: true
    accessibility: "high"
```

2.2. **Tecnica 2: Analogia (analogy)**

Encontrar estruturas paralelas em dominios conhecidos:

```yaml
externalization_analogy:
  item_id: "KI-003"
  tacit_input: "Detectar fadiga de audiencia por engagement sutil"

  analogy_generated:
    analogy: >
      "Fadiga de audiencia funciona como resistencia a antibioticos. No
      inicio, a mesma dose (conteudo) tem efeito forte (engagement). Com
      o tempo, a audiencia desenvolve 'resistencia' — precisa de dose
      maior (conteudo mais intenso) para o mesmo efeito. E se voce
      continua com a mesma dose, o efeito cai a zero."
    structural_mapping:
      "antibiótico": "conteúdo/mensagem"
      "bactéria": "audiência"
      "resistência": "fadiga de engajamento"
      "dose maior": "conteúdo mais provocativo/novel"
      "efeito zero": "shadow ban algorítmico por baixo engagement"
```

2.3. **Tecnica 3: Modelo (model)**

Criar representacao simplificada e manipulavel:

```yaml
externalization_model:
  item_id: "KI-007"
  tacit_input: "Processo mental de avaliar um negocio em 5 minutos"

  model_generated:
    name: "5-Minute Business Scan"
    components:
      - step: 1
        name: "Retention Shape"
        description: "Olhar a forma da curva de retencao, nao o numero"
        decision: "Se forma descendente → FLAG"
        time: "30 sec"

      - step: 2
        name: "Revenue per Employee"
        description: "Dividir revenue por headcount"
        decision: "Se < X → eficiencia operacional baixa"
        time: "30 sec"

      - step: 3
        name: "Customer Concentration"
        description: "Top 3 clientes = que % do revenue?"
        decision: "Se > 40% → risco de concentracao"
        time: "60 sec"

      - step: 4
        name: "Growth Source"
        description: "Revenue novo vem de onde? Organico vs pago?"
        decision: "Se > 80% pago → dependencia de CAC"
        time: "60 sec"

      - step: 5
        name: "Gut Check"
        description: "Se eu tivesse que apostar meu dinheiro neste negocio, apostaria?"
        decision: "Integra todos os sinais anteriores"
        time: "60 sec"

    total_time: "5 minutos"
    accuracy: "80% alignment com analise profunda posterior"
    limitation: "Nao substitui due diligence; e triagem rapida"
```

2.4. **Tecnica 4: Hipotese (hypothesis)**

Transformar intuicao em proposicao testavel:

```yaml
externalization_hypothesis:
  item_id: "KI-010"
  tacit_input: "Times com muita rotacao nunca alcancam performance de elite"

  hypothesis_generated:
    statement: >
      "Em equipes de desenvolvimento de software, existe um threshold de
      rotacao anual acima do qual a performance coletiva NUNCA atinge
      nivel de elite, independente da qualidade individual dos membros."
    testable_prediction: >
      "Equipes com rotacao > 30% ao ano nao atingem top-quartile em
      velocity E quality simultaneamente por pelo menos 12 meses."
    evidence_from_expert: "Baseado em observacao de 20+ equipes ao longo de 10 anos"
    falsifiable: true
    test_method: "Comparar metricas de equipes agrupadas por taxa de rotacao"
```

2.5. **Tecnica 5: Narrativa Estruturada (structured narrative)**

Transformar historias em casos documentados:

```yaml
externalization_narrative:
  item_id: "KI-015"
  tacit_input: "Historia de como descobriu que retencao importa mais que aquisicao"

  narrative_generated:
    title: "O Dia que Parei de Olhar para Revenue"
    structure:
      setting: "2019, SaaS B2B, revenue crescendo 15% MoM"
      trigger: "Percebi que MRR aumentava mas churn rate tambem"
      realization: "Revenue growth estava mascarando hemorragia de clientes"
      action: "Cortei budget de aquisicao em 80%, redirecionei para customer success"
      outcome: "3 meses depois: revenue caiu 10%, mas retention subiu de 85% para 94%"
      lesson: "6 meses depois: revenue superou projecao original em 22% com base mais saudavel"
    tacit_encoded:
      - "O sinal de perigo nao e revenue caindo — e retention caindo ENQUANTO revenue sobe"
      - "A coragem de cortar aquisicao quando revenue esta subindo e contra-intuitiva"
      - "Customer success nao e departamento — e estrategia de crescimento"
```

2.6. **Registro de externalizacao:**

Para cada item externalizado, registrar:

```yaml
externalization_record:
  item_id: "KI-001"
  technique_used: "model + metaphor"
  output_type: "conceptual_asset"

  original_tacit_content:
    summary: "Priorizar retencao antes de aquisicao"
    tacit_ratio_before: 0.65

  externalized_content:
    metaphor: "{metafora gerada}"
    model: "{modelo gerado}"
    heuristic: "When retention curve slope is negative for 3+ months AND revenue is growing, THEN pause acquisition budget, BECAUSE growth is masking churn and compounding the problem"

  conversion_quality:
    meaning_preserved: 0.85      # 0.0-1.0 — quanto do significado original foi capturado
    nuance_captured: 0.70        # Nuances sutis foram articuladas?
    actionability_gain: 0.90     # O item ficou mais acionavel apos conversao?
    accessibility_gain: 0.95     # Ficou mais acessivel a nao-especialistas?
    tacit_ratio_after: 0.30      # Quanto de tacito resta apos externalizacao

  ba_required: "dialoguing"      # Tipo de ba necessario para esta conversao
  ba_description: >
    Dialogo profundo entre especialista e facilitador (Klein ou Kelly)
    para validar que a articulacao captura o significado tacito original.

  knowledge_asset_type: "conceptual"
```

**Checkpoint:** Externalizacao completa para todos os itens S e pre-E.

---

### Step 3: Aplicar Combination (Explicito → Explicito) (8-12 min)

**Executor:** nonaka
**Condicao:** Para itens ja no estagio E, e quando `conversion_priority` inclui combination

3.1. **Identificar itens combinaveis:**

Agrupar itens explicitos que pertencem ao mesmo dominio ou tema:

```yaml
combination_groups:
  - group_id: "CG-001"
    theme: "Framework de Avaliacao de Negocios"
    items: ["KI-001-ext", "KI-003-ext", "KI-007-ext", "KI-010-ext"]
    combination_type: "integration"  # integration | categorization | synthesis

  - group_id: "CG-002"
    theme: "Sistema de Copywriting"
    items: ["KI-005-ext", "KI-012-ext", "KI-018-ext"]
    combination_type: "categorization"
```

3.2. **Executar combinacao:**

```yaml
combination_result:
  group_id: "CG-001"
  combined_asset:
    name: "Business Health Assessment Framework v1.0"
    type: "systemic_asset"
    components:
      - name: "5-Minute Scan" (from KI-007)
      - name: "Retention Priority Rule" (from KI-001)
      - name: "Audience Fatigue Detector" (from KI-003)
      - name: "Team Stability Threshold" (from KI-010)

    integration_logic: >
      Os 4 componentes formam um sistema de avaliacao em camadas:
      Layer 1 (5-min scan) faz triagem rapida.
      Se FLAG encontrado, Layer 2 (retention analysis) aprofunda.
      Layer 3 (audience/team) avalia sustentabilidade.
      Output: GO / CAUTION / NO-GO com evidencias.

    new_insights_from_combination:
      - "Retencao de clientes e retencao de equipe sao espelhos — quando uma cai, a outra tende a seguir"
      - "O 5-min scan funciona como pre-diagnostico; os outros frameworks sao o diagnostico completo"

  ba_required: "systemizing"
  ba_description: >
    Espaco de sistematizacao — documentos, frameworks, bases de dados.
    Nao requer interacao direta com o especialista.

  knowledge_asset_type: "systemic"
```

3.3. **Tipos de Combination:**

| Tipo | Descricao | Exemplo |
|------|-----------|---------|
| **Integration** | Conectar frameworks em sistema coerente | 4 modelos → sistema de avaliacao |
| **Categorization** | Organizar itens em taxonomia | 15 heuristicas → 4 categorias |
| **Synthesis** | Criar insight novo pela juncao | A + B revela C (nao-obvio) |
| **Formalization** | Estruturar em formato padrao | Heuristicas → decision tree |

**Checkpoint:** Combination completa. Knowledge assets sistemicos gerados.

---

### Step 4: Projetar Internalization (Explicito → Tacito) (5-8 min)

**Executor:** nonaka
**Condicao:** Para itens no estagio C, e quando `conversion_priority` inclui internalization

Internalization e a conversao de conhecimento explicito em pratica incorporada. Nonaka nao "executa" a internalizacao — ele PROJETA como ela deve acontecer.

4.1. **Para cada item combinado, projetar caminho de internalizacao:**

```yaml
internalization_plan:
  - item_id: "CG-001-combined"
    name: "Business Health Assessment Framework v1.0"
    current_stage: "C" (systemic asset)
    target: "Incorporar como pratica habitual de avaliacao"

    internalization_methods:
      - method: "learning_by_doing"
        description: >
          Aplicar o framework a 10 negocios reais nas proximas 4 semanas.
          Documentar cada aplicacao, comparar com avaliacao intuitiva.
        duration: "4 semanas"
        repetitions: 10
        success_metric: >
          Apos 10 aplicacoes, o usuario aplica o framework sem consultar
          a documentacao (internalizacao completa).
        ba_required: "exercising"

      - method: "simulation"
        description: >
          Criar 5 cenarios ficticios com dados reais anonimizados.
          Praticar avaliacao rapida e comparar com avaliacao completa.
        duration: "1 semana"
        repetitions: 5
        ba_required: "exercising"

      - method: "checklist_to_habit"
        description: >
          Usar checklist explicitamente nas primeiras 5 vezes.
          Depois, tentar sem checklist. Se funcionar, internalizacao ok.
        stages:
          - "Checklist em mao (5 vezes)"
          - "Checklist de memoria (5 vezes)"
          - "Sem checklist (5 vezes)"
          - "Validar contra checklist apos fazer de memoria"
        ba_required: "exercising"

    internalization_indicators:
      - "Aplica framework automaticamente sem consultar documentacao"
      - "Adapta framework a situacoes novas sem instrucao"
      - "Ensina framework a outros usando exemplos proprios (nao os originais)"
      - "Detecta limitacoes do framework baseado em experiencia propria"
```

**Checkpoint:** Planos de internalizacao projetados.

---

### Step 5: Classificar Knowledge Assets e Identificar Ba (5-8 min)

**Executor:** nonaka

5.1. **Classificacao de Knowledge Assets (Nonaka & Konno):**

```yaml
knowledge_assets:
  experiential_assets:
    description: "Conhecimento tacito compartilhado por experiencia comum"
    items: ["KI-social-001", "KI-social-003"]
    characteristics: "Dificil de capturar em documentos, requer presenca"
    ba: "originating"

  conceptual_assets:
    description: "Conhecimento articulado em conceitos, metaforas, modelos"
    items: ["KI-001-ext", "KI-003-ext", "KI-007-ext"]
    characteristics: "Capturado em palavras e imagens, transferivel por midia"
    ba: "dialoguing"

  systemic_assets:
    description: "Conhecimento combinado em sistemas, frameworks, bancos de dados"
    items: ["CG-001-combined", "CG-002-combined"]
    characteristics: "Estruturado, sistematizado, replicavel"
    ba: "systemizing"

  routine_assets:
    description: "Conhecimento incorporado em praticas, habitos, rotinas"
    items: ["INT-001", "INT-002"]
    characteristics: "Operacional, procedural, executavel sem pensar"
    ba: "exercising"
```

5.2. **Ba Map (Mapa de Contextos de Conversao):**

```yaml
ba_map:
  originating_ba:
    description: >
      Espaco de socializacao — compartilhamento face-a-face de experiencias,
      emocoes, modelos mentais. Requer confianca e proximidade.
    required_for: ["Socialization (S→S)"]
    implementation: >
      Sessoes presenciais ou video-call de alta qualidade onde especialista
      e aprendiz trabalham juntos em problemas reais.
    items_needing: ["KI-social-001"]

  dialoguing_ba:
    description: >
      Espaco de dialogo — articulacao coletiva de conhecimento tacito
      em conceitos. Requer reflexao e questionamento mutuo.
    required_for: ["Externalization (S→E)"]
    implementation: >
      Sessoes CDM (Klein), Repertory Grid (Kelly), ou entrevistas
      estruturadas onde o facilitador guia a articulacao.
    items_needing: ["KI-001", "KI-003", "KI-007"]

  systemizing_ba:
    description: >
      Espaco de sistematizacao — combinacao de conhecimentos explicitos
      em sistemas. Requer ferramentas de organizacao e integracao.
    required_for: ["Combination (E→E)"]
    implementation: >
      Documentacao, bancos de dados, wikis, decision trees,
      frameworks integrados. Nao requer interacao direta.
    items_needing: ["CG-001", "CG-002"]

  exercising_ba:
    description: >
      Espaco de exercicio — pratica deliberada para internalizar
      conhecimento. Requer repeticao e feedback.
    required_for: ["Internalization (E→S)"]
    implementation: >
      Simulacoes, pratica com casos reais, checklists progressivos,
      mentoria durante aplicacao.
    items_needing: ["INT-001", "INT-002"]
```

**Checkpoint:** Knowledge assets classificados. Ba map construido.

---

### Step 6: Verificar Qualidade da Conversao (5-8 min)

**Executor:** nonaka

6.1. **Verificacao de fidelidade para Externalization:**

Para cada item externalizado, verificar:

```yaml
conversion_quality_check:
  - item_id: "KI-001"
    checks:
      meaning_preserved:
        score: 0.85
        test: "A heuristica articulada captura o mesmo significado que o CDM extraction original?"
        notes: "Componente somatic (o 'feeling') parcialmente capturado pela metafora"

      nuance_retained:
        score: 0.70
        test: "As excecoes e condicoes de contorno estao documentadas?"
        notes: "Falta documentar quando a regra NAO se aplica (marketplaces)"

      actionability:
        score: 0.90
        test: "Alguem sem o conhecimento tacito consegue aplicar o item externalizado?"
        notes: "Modelo 5-minute scan e altamente acionavel"

      loss_assessment:
        what_was_lost: >
          O 'timing sense' — saber QUANDO exatamente pausar aquisicao
          (nao so que retencao importa, mas o momento exato de agir).
          Isso requer experiencia e nao foi totalmente capturado.
        severity: "MEDIUM"
        mitigation: "Adicionar regras quantitativas de threshold como proxy"

    overall_quality: 0.82
    recommendation: "ACCEPT com nota sobre timing sense nao-capturado"
```

6.2. **Verificacao de coerencia para Combination:**

```yaml
combination_quality_check:
  - group_id: "CG-001"
    checks:
      internal_consistency:
        score: 0.90
        test: "Os componentes combinados sao consistentes entre si?"
        notes: "Nenhuma contradicao encontrada"

      emergent_value:
        score: 0.85
        test: "A combinacao gera valor que os componentes individuais nao tinham?"
        notes: "A integracao em sistema de camadas adiciona valor significativo"

      completeness:
        score: 0.75
        test: "O sistema resultante cobre o dominio adequadamente?"
        notes: "Falta componente de analise competitiva (nenhum item CDM cobriu)"

    overall_quality: 0.83
    recommendation: "ACCEPT — completar com futura extracao focada em analise competitiva"
```

6.3. **Compilar metricas de conversao:**

```yaml
conversion_metrics:
  total_items_processed: 45
  externalized: 18
  combined: 8
  internalization_planned: 4
  skipped_already_external: 12
  skipped_socialization_only: 3

  quality_summary:
    average_meaning_preserved: 0.82
    average_actionability_gain: 0.88
    items_with_significant_loss: 3
    items_needing_revision: 2

  knowledge_creation_spiral:
    cycle_completion: 0.75  # 75% do ciclo SECI percorrido
    strongest_conversion: "Externalization (18 itens, quality 0.84)"
    weakest_conversion: "Internalization (apenas planejado, nao executado)"
    recommendation: "Executar planos de internalizacao para fechar o ciclo"
```

**Checkpoint:** Qualidade verificada. Metricas calculadas.

---

### Step 7: Geracao de Outputs (5-8 min)

**Executor:** nonaka

7.1. **Compilar converted-items.yaml:**

Todos os itens com classificacao SECI, conversao aplicada, knowledge asset type e ba.

7.2. **Compilar seci-map.yaml:**

Mapa completo do ciclo SECI para este especialista — fluxos de conversao, knowledge assets por tipo, ba map, e ciclo de conversao com metricas.

7.3. **Compilar conversion-report.md:**

```markdown
# SECI Conversion Report: {nome_especialista}

## Resumo Executivo
- Itens processados: N
- Externalizacoes realizadas: X (qualidade media: Y)
- Combinacoes realizadas: Z
- Internalizacoes planejadas: W

## Conversoes Realizadas

### Externalization (Tacito → Explicito)
[Itens convertidos, tecnicas usadas, qualidade, perdas documentadas]

### Combination (Explicito → Explicito)
[Grupos combinados, sistemas criados, insights emergentes]

### Internalization (Planejado)
[Planos de internalizacao com metodos e metricas]

## Knowledge Assets Criados
[Classificacao por tipo com inventario]

## Ba Map
[Contextos de conversao necessarios e implementacao]

## Qualidade e Gaps
[Itens com perda significativa, areas nao cobertas]

## Recomendacoes
[Proximos passos para completar o ciclo SECI]
```

**Checkpoint:** Todos os outputs gerados. Task completa.

---

## Outputs

### Primary Output 1: Converted Items
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/seci/converted-items.yaml`

### Primary Output 2: SECI Map
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/seci/seci-map.yaml`

### Secondary Output: Conversion Report
**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/seci/conversion-report.md`

---

## Validation

### Checklist

- [ ] Todos os itens classificados pelo estagio SECI atual
- [ ] Externalization aplicada com pelo menos 2 tecnicas (metafora, modelo, analogia, hipotese, narrativa)
- [ ] Cada externalizacao tem output articulado E verificacao de qualidade
- [ ] Combination aplicada a itens agrupados por tema
- [ ] Combination gera insights emergentes (nao apenas concatenacao)
- [ ] Internalization projetada com metodos e metricas
- [ ] Knowledge assets classificados (experiential, conceptual, systemic, routine)
- [ ] Ba identificado para cada conversao (originating, dialoguing, systemizing, exercising)
- [ ] Qualidade de conversao verificada (meaning_preserved >= 0.7)
- [ ] Perdas de conversao documentadas com severity e mitigation
- [ ] Converted-items YAML valido
- [ ] SECI map completo com ciclo e metricas
- [ ] Conversion report com insights e recomendacoes

### Success Criteria

**Threshold: 10/13 no checklist acima**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Externalization quality** | meaning_preserved >= 0.85 | >= 0.70 | < 0.70 |
| **Technique diversity** | 4+ tecnicas usadas | 2-3 tecnicas | 1 tecnica |
| **Combination depth** | Insights emergentes documentados | Agrupamento logico | Mera concatenacao |
| **Loss documentation** | Todas as perdas com mitigation | Perdas documentadas | Sem documentacao |
| **SECI completeness** | 3/4 conversoes executadas/planejadas | 2/4 | 1/4 |
| **Ba identification** | Todos os ba com implementacao pratica | Ba identificados | Ba nao mencionados |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Classificacao SECI** | 5-8 min | Categorizar todos os itens |
| **Externalization** | 10-15 min | Mais demorado — multiplas tecnicas |
| **Combination** | 8-12 min | Requer pensamento integrativo |
| **Internalization (projeto)** | 5-8 min | Apenas planejamento |
| **Knowledge assets + Ba** | 5-8 min | Classificacao e mapeamento |
| **Quality verification** | 5-8 min | Checar cada conversao |
| **Output generation** | 5-8 min | 3 arquivos |
| **Total** | 43-67 min | Escala com numero de itens |

---

## Integration

### Feeds To

- **generate-manifest:** Usa: converted-items e seci-map para repertoire manifest
- **generate-operating-manual:** Usa: systemic assets como base do manual
- **update-knowledge-graph:** Usa: knowledge assets como nos do grafo
- **validate-gaps (argyris):** Usa: converted items para gap analysis

### Depends On

- **TK-RM-002:** extract-from-source (itens brutos)
- **TK-RM-003/004:** run-qa-session / build-repertory-grid (construtos)
- **TK-RM-005:** map-deep-smarts (priorizacao)
- **TK-RM-001:** diagnose-repertoire (Polanyi/Collins)

### Agent Routing

**Primary Agent:** nonaka (SECI specialist)
**Quality Review:** repertoire-chief + especialista (para validar externalizacoes criticas)

---

## Notes for Executor

### A Externalization NUNCA e Perfeita

Polanyi provou que conhecimento tacito tem uma dimensao irredutivel — "we can know more than we can tell." Nonaka nao contradiz Polanyi; ele aceita que a externalizacao sempre perde algo. O objetivo nao e 100% de captura — e capturar o SUFICIENTE para que o conhecimento seja util e transferivel. Documentar o que foi perdido e tao importante quanto documentar o que foi capturado.

### Combination nao e Concatenacao

Combinar nao e colocar dois documentos lado a lado. Combination verdadeira GERA insights novos pela integracao. Se A + B = apenas A e B juntos, nao houve Combination. Se A + B revela C (um insight que nem A nem B tinham sozinhos), houve Combination genuina.

### O Ciclo Nunca Termina

SECI e um ESPIRAL, nao um pipeline linear. Apos Internalization, o conhecimento re-incorporado gera novo conhecimento tacito que precisa de nova Socialization → Externalization → Combination → Internalization. O Repertoire Mapper captura uma VOLTA do espiral — futuras sessoes capturarao voltas subsequentes.

### Ba como Pre-Requisito, nao Opcional

Sem o ba apropriado, a conversao falha. Nao adianta tentar Externalization (dialoguing ba) por email. Nao adianta tentar Internalization (exercising ba) sem pratica real. O ba e a CONDICAO para a conversao, nao um detalhe de implementacao.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
