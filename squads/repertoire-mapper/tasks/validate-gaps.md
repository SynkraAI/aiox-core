---
id: TK-RM-007
name: Validate Gaps (Espoused vs Theory-in-Use)
version: 1.0.0
executor: argyris
purpose: >
  Detectar gaps entre conhecimento declarado (espoused theory) e praticado
  (theory-in-use) usando frameworks de Argyris & Schon. Identificar pontos
  cegos, contradicoes, expertise oculta e oportunidades de double-loop
  learning no repertorio mapeado.
squad: repertoire-mapper
phase: PHASE_4_VALIDATION
tier: 2

inputs:
  - name: repertoire_items
    type: list
    description: "Itens de repertorio extraidos pelos agentes de Tier 1 (klein, leonard, kelly)"
    required: true
    format: "YAML array de items com id, source, content, confidence, dreyfus_level"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise do sujeito gerado por collins (Tier 0)"
    required: true
    format: "Markdown com niveis de expertise por area"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: epistemological_map
    type: document
    description: "Mapa epistemologico gerado por polanyi (Tier 0)"
    required: true
    format: "YAML com classificacao tacito/explicito por area"
    location: "outputs/repertoire/{slug}/epistemological-map.yaml"

  - name: qa_session_transcripts
    type: list
    description: "Transcricoes de sessoes Q&A com kelly (Tier 1)"
    required: false
    format: "Markdown files"
    location: "outputs/repertoire/{slug}/sessions/"

  - name: cdm_extractions
    type: document
    description: "Extracoes CDM de klein (Tier 1)"
    required: false
    format: "YAML com cues, patterns, mental_models, rules_of_thumb"
    location: "outputs/repertoire/{slug}/cdm-extractions.yaml"

  - name: deep_smarts_inventory
    type: document
    description: "Inventario de deep smarts de leonard (Tier 1)"
    required: false
    format: "YAML com itens priorizados"
    location: "outputs/repertoire/{slug}/deep-smarts-inventory.yaml"

preconditions:
  - "Tier 0 completo (polanyi + collins)"
  - "Pelo menos 10 itens de repertorio extraidos (QG-003 passado)"
  - "Pelo menos 2 metodos de extracao utilizados"
  - "SECI conversion completa por nonaka (Tier 2)"
  - "Agente argyris carregado com frameworks de validacao"

outputs:
  - name: gap_analysis
    path: "outputs/repertoire/{slug}/gap-analysis.md"
    format: markdown
    description: >
      Relatorio completo de gap analysis com gaps classificados por severidade,
      pontos cegos, contradicoes, expertise oculta, oportunidades de double-loop,
      e assessment Model I/II.

  - name: gap_analysis_structured
    path: "outputs/repertoire/{slug}/gap-analysis.yaml"
    format: yaml
    description: >
      Versao estruturada do gap analysis para consumo programatico e
      integracao com knowledge-graph.json.

  - name: validation_verdict
    path: "outputs/repertoire/{slug}/validation-verdict.yaml"
    format: yaml
    description: >
      Veredicto de validacao (PASS/CONCERNS/FAIL) com score e detalhamento.

validation:
  success_criteria:
    - "Gap analysis cobre todas as areas de expertise mapeadas"
    - "Cada gap tem evidencia de pelo menos 2 fontes"
    - "Ladder of Inference auditada para frameworks de decisao criticos"
    - "Double-loop opportunities documentadas com exemplos concretos"
    - "Model I/II assessment completo com exemplos"
    - "Nenhuma contradicao critica sem resolucao documentada"
    - "Validation verdict emitido com score >= 7/10 para PASS"
  quality_threshold: "10/13 no checklist completo"
---

# Task: Validate Gaps (Espoused Theory vs Theory-in-Use)

## Executive Summary

Esta task aplica os frameworks de Chris Argyris e Donald Schon para detectar
discrepancias entre o que o sujeito DECLARA saber/fazer (espoused theory) e o
que as evidencias mostram que ele REALMENTE sabe/faz (theory-in-use). Gaps entre
esses dois niveis revelam pontos cegos, contradicoes nao percebidas, expertise
oculta (que a pessoa pratica mas nao articula), e oportunidades de double-loop
learning.

**Posicao no Pipeline:** Task 7 -- Phase 4 (Validation) do Full Mapping Pipeline
**Definicao de Sucesso:** Gap analysis completa com zero contradicoes criticas nao resolvidas
**Quality Gate:** QG-005 (Final Validation) -- BLOCKING

---

## Purpose

O mapeamento de repertorio ate este ponto extraiu o que o sujeito DISSE (via Q&A
com kelly, narrativas com klein) e o que ele DEMONSTROU (via analise de fontes
digitais, padroes de comportamento observados por leonard). Mas extrair nao e o
mesmo que validar.

Argyris demonstrou que profissionais competentes frequentemente operam com uma
teoria declarada ("eu valorizo feedback honesto") que difere radicalmente da
sua teoria-em-uso ("eu evito dar feedback negativo para nao gerar conflito").
Esse gap nao e hipocrisia -- e uma falha cognitiva sistematica que Argyris
chamou de "skilled incompetence": a pessoa e tao habil em evitar o desconforto
que nao percebe a contradicao.

Sem esta validacao, o repertoire-manifest contera uma mistura de conhecimento
real e aspiracional sem distincao -- tornando o output enganoso para quem o
consumir.

**O que esta task revela:**

1. **Gaps de Execucao** -- O sujeito sabe algo mas nao pratica consistentemente
2. **Pontos Cegos** -- Areas onde o sujeito nao sabe que nao sabe
3. **Contradicoes** -- Itens de repertorio que se contradizem mutuamente
4. **Expertise Oculta** -- Competencias praticadas mas nao articuladas
5. **Double-Loop Opportunities** -- Onde questionar premissas abriria novos caminhos

---

## Executor Type

**Agent: argyris (100% automatizado)**

- **Agent Role:** Analise critica, deteccao de gaps, auditoria de inferencia, assessment de modelos de acao
- **Human Role:** Nenhum durante a analise (humano valida no step de entrega)
- **Estimated Runtime:** 20-40 minutos dependendo do volume de itens

---

## Steps

### Step 1: Load Repertoire Items e Context (2-3 min)

**Agent Activity:**

- Carregar TODOS os itens de repertorio extraidos (`extracted-items.yaml`)
- Carregar o perfil de expertise (`expertise-profile.md`)
- Carregar o mapa epistemologico (`epistemological-map.yaml`)
- Se disponiveis, carregar:
  - Transcricoes de Q&A com kelly
  - Extracoes CDM de klein
  - Inventario de deep smarts de leonard
- Construir um indice por area de expertise para facilitar comparacao

**Context Building:**

```yaml
validation_context:
  subject: "{nome do sujeito}"
  total_items: N
  areas_covered:
    - area: "area_1"
      items_count: N
      dreyfus_range: "competent-expert"
      extraction_methods: ["cdm", "qa_session", "source_analysis"]
    - area: "area_2"
      items_count: N
      dreyfus_range: "advanced_beginner-proficient"
      extraction_methods: ["qa_session"]
  sources_available:
    qa_transcripts: true/false
    cdm_extractions: true/false
    deep_smarts: true/false
    digital_sources: true/false
```

**Pre-flight Check:**

```yaml
preflight:
  - check: "Minimo 10 itens de repertorio"
    status: PASS/FAIL
    actual: N
  - check: "Pelo menos 2 metodos de extracao"
    status: PASS/FAIL
    methods: ["..."]
  - check: "Expertise profile existe e esta completo"
    status: PASS/FAIL
  - check: "Epistemological map existe"
    status: PASS/FAIL
```

Se qualquer check critico falhar, INTERROMPER e reportar ao repertoire-chief.

**Checkpoint:** Contexto de validacao montado, itens indexados por area

---

### Step 2: Espoused Theory vs Theory-in-Use Comparison (8-12 min)

**Agent Activity:**

Para CADA area de expertise principal, comparar sistematicamente o que o sujeito
DECLAROU vs o que as evidencias MOSTRAM.

**Framework de Comparacao:**

```yaml
espoused_vs_actual:
  area: "nome_da_area"

  espoused_theory:
    source: "Q&A sessions, entrevistas, conteudo escrito"
    what_subject_says_they_know:
      - item: "Descricao do conhecimento declarado"
        source: "qa-session-03, timestamp 15:30"
        confidence: 0.9
    what_subject_says_they_do:
      - item: "Descricao da pratica declarada"
        source: "linkedin-post-2025-11"
        confidence: 0.7
    what_subject_values:
      - item: "Valor ou principio declarado"
        source: "mentoria-transcript-01"
        confidence: 0.8

  theory_in_use:
    source: "CDM analysis, deep smarts, behavioral evidence"
    what_evidence_shows_they_know:
      - item: "Conhecimento demonstrado em pratica"
        evidence: "CDM incident #3 -- tomou decisao baseada neste conhecimento"
        confidence: 0.85
    what_evidence_shows_they_do:
      - item: "Comportamento observado"
        evidence: "Pattern recorrente em 4 incidentes CDM"
        confidence: 0.9
    what_evidence_shows_they_value:
      - item: "Valor inferido do comportamento"
        evidence: "Priorizacao consistente de X sobre Y em decisoes"
        confidence: 0.75

  alignment_score: 0.0-1.0  # 1.0 = perfeito alinhamento
```

**Regras de Comparacao:**

1. **Nao assumir ma-fe** -- Gaps entre espoused e actual nao sao mentiras, sao pontos cegos
2. **Buscar evidencia em multiplas fontes** -- Um gap precisa de pelo menos 2 fontes para ser valido
3. **Considerar contexto** -- O mesmo sujeito pode operar diferente em contextos diferentes
4. **Marcar incerteza** -- Se a evidencia e ambigua, marcar confidence baixa e nao classificar como gap

**Gap Classification:**

```yaml
gap_types:
  execution_gap:
    definition: "Sujeito sabe mas nao faz consistentemente"
    example: "Diz que sempre valida hipoteses antes de agir, mas CDM mostra decisoes impulsivas em 3/5 incidentes"
    severity_impact: "Risco de decisoes sub-otimas em cenarios criticos"

  blind_spot:
    definition: "Sujeito nao sabe que nao sabe"
    example: "Nao mencionou habilidade de leitura emocional, mas CDM mostra uso consistente de cues emocionais"
    severity_impact: "Competencia subaproveitada e nao transferivel"

  aspiration_gap:
    definition: "Sujeito aspira mas ainda nao incorporou"
    example: "Fala de data-driven decision making, mas evidencias mostram que confia mais em intuicao"
    severity_impact: "Desalinhamento entre identidade aspiracional e competencia real"

  contradiction:
    definition: "Dois itens de repertorio se contradizem mutuamente"
    example: "Item 1: 'delegar e essencial'. Item 2: 'ninguem faz tao bem quanto eu'"
    severity_impact: "Paralisacao ou comportamento inconsistente"

  hidden_expertise:
    definition: "Sujeito pratica algo valioso mas nao articula"
    example: "Demonstra capacidade excepcional de rapport em CDM, mas nao lista como competencia"
    severity_impact: "Conhecimento nao transferivel, risco de perda"

  context_dependent:
    definition: "Sujeito opera diferente em contextos diferentes (nao e gap, e adaptacao)"
    example: "Lidera de forma diretiva em crise, mas participativa em projetos longos"
    severity_impact: "Nenhum -- e adaptacao legitima (documentar como tal)"
```

**Severity Classification:**

```yaml
severity_levels:
  critical:
    criteria: "Contradicao que afeta decisoes de alto impacto"
    action: "MUST resolve antes de publicar manifest"
    examples:
      - "Sujeito se posiciona como data-driven mas ignora dados em decisoes estrategicas"
      - "Declara valorizar diversidade de opiniao mas sistematicamente descarta visoes contrarias"

  significant:
    criteria: "Gap que afeta consistencia do repertorio"
    action: "SHOULD resolver, documentar se nao resolvido"
    examples:
      - "Expertise declarada em nivel Expert mas evidencias sugerem Proficient"
      - "Framework declarado mas nunca observado em uso"

  minor:
    criteria: "Pequena discrepancia sem impacto material"
    action: "Documentar, sem necessidade de resolucao"
    examples:
      - "Ligeira diferenca de enfase entre fala e pratica"
      - "Terminologia diferente para o mesmo conceito"
```

**Checkpoint:** Comparacao espoused vs actual completa para todas as areas

---

### Step 3: Ladder of Inference Audit (5-8 min)

**Agent Activity:**

Para cada FRAMEWORK DE DECISAO critico identificado nos itens de repertorio,
tracar a Ladder of Inference completa e auditar cada degrau.

**Ladder of Inference (Argyris, 1990):**

```
  7. ACTIONS -- Acoes tomadas com base nas crencas
     ↑
  6. BELIEFS -- Crencas adotadas sobre o mundo
     ↑
  5. CONCLUSIONS -- Conclusoes tiradas
     ↑
  4. ASSUMPTIONS -- Premissas adicionadas (muitas vezes inconscientes)
     ↑
  3. MEANINGS -- Significados atribuidos aos dados selecionados
     ↑
  2. SELECTED DATA -- Dados que o sujeito ESCOLHEU observar
     ↑
  1. OBSERVABLE DATA -- Todos os dados disponiveis na situacao
```

**Audit Template por Framework de Decisao:**

```yaml
ladder_audit:
  framework_id: "RM-ITEM-042"
  framework_name: "Regra de decisao X"
  domain: "area de expertise"

  ladder_steps:
    observable_data:
      description: "Que dados estao disponiveis na situacao?"
      evidence: "CDM incident descreve o cenario completo"
      completeness: "high/medium/low"

    selected_data:
      description: "Que dados o sujeito ESCOLHEU focar?"
      evidence: "CDM probe 'o que voce notou primeiro?'"
      selection_bias: "Tende a focar em X e ignorar Y"
      audit_flag: "NONE | SELECTIVE_ATTENTION | CONFIRMATION_BIAS"

    meanings:
      description: "Que significado o sujeito atribuiu?"
      evidence: "CDM probe 'o que isso significou para voce?'"
      cultural_influence: "Significado moldado por experiencia no setor X"
      audit_flag: "NONE | OVERINTERPRETATION | PROJECTION"

    assumptions:
      description: "Que premissas estao implicitas?"
      evidence: "Inferido do gap entre meaning e conclusion"
      tested: true/false
      audit_flag: "NONE | UNTESTED_ASSUMPTION | HIDDEN_PREMISE"

    conclusions:
      description: "Que conclusao o sujeito tirou?"
      evidence: "Declaracao explicita ou decisao observada"
      logical_validity: "high/medium/low"
      audit_flag: "NONE | LOGICAL_LEAP | NON_SEQUITUR"

    beliefs:
      description: "Que crenca essa conclusao reforçou?"
      evidence: "Padrao recorrente em multiplos incidentes"
      rigidity: "high/medium/low"
      audit_flag: "NONE | CONFIRMATION_LOOP | FIXED_MINDSET"

    actions:
      description: "Que acao resultou?"
      evidence: "Comportamento observado"
      effectiveness: "high/medium/low"
      audit_flag: "NONE | HABITUAL_RESPONSE | DEFENSIVE_ROUTINE"

  overall_assessment:
    inference_quality: "sound | mostly_sound | questionable | problematic"
    biggest_leap: "Step X to Step Y"
    recommendation: "Testar premissa Z com dados contrarios"
```

**Regras de Auditoria:**

1. **Auditar pelo menos 3 frameworks de decisao criticos** (Dreyfus Proficient ou Expert)
2. **Focar nos SALTOS** -- onde a cadeia de inferencia pula degraus
3. **Procurar PREMISSAS NAO TESTADAS** -- o degrau 4 e onde mais gaps se escondem
4. **Identificar LOOPS DE CONFIRMACAO** -- quando crencas influenciam selecao de dados
5. **Nao julgar moralmente** -- o objetivo e visibilidade, nao critica

**Checkpoint:** Ladder of Inference auditada para frameworks de decisao criticos

---

### Step 4: Left-Hand Column Analysis (3-5 min)

**Agent Activity:**

Aplicar a tecnica Left-Hand Column (Argyris) para identificar o que o sujeito
PENSA mas NAO DIZ -- e como isso influencia seu repertorio.

**Framework:**

```
┌──────────────────────────┬──────────────────────────┐
│    LEFT-HAND COLUMN      │    RIGHT-HAND COLUMN     │
│    (Pensamentos ocultos) │    (O que foi dito/feito) │
├──────────────────────────┼──────────────────────────┤
│ "Sera que ele esta       │ "Boa observacao, vamos   │
│  certo? Se estiver,      │  considerar isso..."     │
│  meu framework esta      │                          │
│  errado..."              │                          │
├──────────────────────────┼──────────────────────────┤
│ "Isso ja tentei e nao   │ "Interessante abordagem, │
│  funciona, mas nao       │  o que mais voce         │
│  posso dizer isso        │  pensou?"                │
│  diretamente..."         │                          │
└──────────────────────────┴──────────────────────────┘
```

**Fontes para Inferir Left-Hand Column:**

1. **Hesitacoes em Q&A** -- Momentos onde kelly registrou pausa ou mudanca de assunto
2. **Qualificadores excessivos** -- "Talvez", "depende", "em teoria" indicam reservas
3. **Contradicoes entre sessoes** -- Dizer algo diferente em momentos diferentes
4. **Topicos evitados** -- Areas que o sujeito nao menciona apesar de relevantes
5. **Discrepancia tom/conteudo** -- Falar com entusiasmo sobre algo que nao pratica

**Output Format:**

```yaml
left_hand_column_findings:
  - id: "LHC-001"
    topic: "delegacao"
    right_hand: "O que o sujeito disse: 'Acredito muito em delegar'"
    left_hand_inferred: "Evidencias sugerem dificuldade em soltar controle"
    evidence:
      - "CDM #4: Assumiu tarefa do subordinado em momento de pressao"
      - "Q&A Session 2: Pausa longa quando perguntado sobre delegar decisoes financeiras"
    confidence: 0.7
    impact: "Gap entre espoused delegacao e teoria-em-uso de controle"
    recommendation: "Explorar em sessao futura: 'O que te impede de delegar X?'"

  - id: "LHC-002"
    topic: "inovacao vs seguranca"
    right_hand: "Se apresenta como inovador e aberto a experimentacao"
    left_hand_inferred: "Padrao consistente de escolher opcoes seguras quando ha risco real"
    evidence:
      - "3 de 4 decisoes CDM optaram pela alternativa conservadora"
      - "Deep smarts: Pattern recognition favorece solucoes comprovadas"
    confidence: 0.8
    impact: "Repertorio declarado de inovacao nao reflete pratica real"
    recommendation: "Reclassificar: expertise em 'inovacao incremental' vs 'inovacao disruptiva'"
```

**Checkpoint:** Left-Hand Column analysis completa

---

### Step 5: Double-Loop Learning Opportunity Scan (5-7 min)

**Agent Activity:**

Identificar onde o sujeito esta preso em single-loop learning (corrigindo erros
sem questionar premissas) e onde double-loop learning abriria novos repertorios.

**Single-Loop vs Double-Loop:**

```
SINGLE-LOOP:
  Resultado insatisfatorio → Ajustar ACAO → Tentar de novo
  (Premissas nao questionadas)

DOUBLE-LOOP:
  Resultado insatisfatorio → Questionar PREMISSAS → Reframe problema → Nova acao
  (Premissas examinadas e possivelmente revisadas)
```

**Scan Framework:**

```yaml
double_loop_scan:
  - id: "DL-001"
    area: "gestao de equipes"
    current_loop:
      type: "single_loop"
      pattern: >
        Sujeito identifica baixa performance → Da feedback mais detalhado
        → Performance nao melhora → Da feedback ainda mais detalhado
      governing_variable: "Crenca de que mais informacao = melhor performance"
      evidence:
        - "CDM #2: Mesmo padrao em 3 ciclos consecutivos"
        - "Q&A: 'Sempre explico com mais detalhes quando nao funciona'"

    double_loop_opportunity:
      question_to_ask: "E se o problema nao for falta de informacao?"
      alternative_frames:
        - "Performance pode ser questao de motivacao, nao de instrucao"
        - "O estilo de feedback pode estar gerando dependencia"
        - "A pessoa pode nao ter fit para o papel"
      potential_new_repertoire: >
        Frameworks de motivacao intrinseca, coaching vs directing,
        avaliacao de fit cultural e competencia
      estimated_impact: "high"
      difficulty_to_shift: "medium"

  - id: "DL-002"
    area: "precificacao"
    current_loop:
      type: "single_loop"
      pattern: >
        Cliente reclama de preco → Oferece desconto → Margem cai
        → Trabalha mais para compensar → Burnout
      governing_variable: "Crenca de que preco justo = preco que o cliente aceita sem reclamar"
      evidence:
        - "Historico de pricing: reducao de 30% em 2 anos"
        - "Q&A: 'Prefiro perder margem do que perder cliente'"

    double_loop_opportunity:
      question_to_ask: "E se reclamacao de preco nao significar que o preco esta errado?"
      alternative_frames:
        - "Preco e comunicacao de valor, nao custo"
        - "Clientes que reclamam de preco podem nao ser o publico certo"
        - "Ancoragem de preco pode estar mal posicionada"
      potential_new_repertoire: >
        Value-based pricing, client qualification,
        price anchoring, decoupling
      estimated_impact: "critical"
      difficulty_to_shift: "high"
```

**Criterios para Identificar Double-Loop Opportunities:**

1. **Padrao repetitivo sem melhoria** -- Mesma solucao aplicada repetidamente
2. **Premissa nunca questionada** -- Uma crenca "obvia" que ninguem testa
3. **Frustacao recorrente** -- Resultados consistentemente abaixo do esperado
4. **Receita de bolo** -- "Eu sempre faco assim" sem considerar alternativas
5. **Defensividade quando questionado** -- Reacao emocional a perguntas sobre o metodo

**Checkpoint:** Double-loop opportunities identificadas e documentadas

---

### Step 6: Model I / Model II Assessment (3-5 min)

**Agent Activity:**

Classificar os padroes de acao do sujeito usando o framework Model I / Model II
de Argyris para entender o estilo dominante de reasoning em cada area.

**Model I (Defensive Reasoning):**

```yaml
model_I_characteristics:
  governing_variables:
    - "Manter controle unilateral da situacao"
    - "Maximizar ganho, minimizar perda"
    - "Suprimir sentimentos negativos"
    - "Ser racional (segundo sua definicao)"
  action_strategies:
    - "Advocate sua posicao sem convidar teste"
    - "Avaliar outros sem criar oportunidade de avaliacao mutua"
    - "Atribuir causas sem verificar"
    - "Usar reasoning privado, nao publico"
  consequences:
    - "Defensive routines"
    - "Self-sealing logic"
    - "Escalating error"
    - "Undiscussable topics"
```

**Model II (Productive Reasoning):**

```yaml
model_II_characteristics:
  governing_variables:
    - "Escolha livre e informada"
    - "Compromisso interno com a decisao"
    - "Transparencia sobre reasoning"
    - "Teste publico de premissas"
  action_strategies:
    - "Advocate posicao E convidar teste"
    - "Combinar advocacy com inquiry"
    - "Tornar reasoning publico e testavel"
    - "Criar condicoes para aprendizado mutuo"
  consequences:
    - "Reduced defensiveness"
    - "Double-loop learning"
    - "Testable hypotheses"
    - "Producao de valid information"
```

**Assessment Template por Area:**

```yaml
model_assessment:
  area: "lideranca"
  dominant_model: "Model I" | "Model II" | "Mixed"
  model_I_score: 0.0-1.0
  model_II_score: 0.0-1.0

  model_I_evidence:
    - behavior: "Em reunioes, apresenta decisao ja tomada como 'discussao aberta'"
      evidence: "CDM #1, Q&A Session 3"
      governing_variable: "Controle unilateral"
    - behavior: "Evita confrontar resultados ruins de subordinados diretos"
      evidence: "CDM #5, Deep Smarts observation"
      governing_variable: "Suprimir sentimentos negativos"

  model_II_evidence:
    - behavior: "Em mentorias, usa perguntas abertas e espera respostas genuinas"
      evidence: "Q&A Session 1, mentoria-transcript-02"
      governing_variable: "Escolha livre e informada"

  interpretation: >
    Sujeito opera predominantemente em Model I para decisoes
    organizacionais, mas demonstra comportamentos Model II
    em contextos de mentoria 1-on-1. A transicao parece ser
    gatilhada pela presenca/ausencia de hierarquia.

  recommendation: >
    Explorar como transportar competencias Model II do contexto
    de mentoria para o contexto de gestao de equipes.
```

**Checkpoint:** Model I/II assessment completo para todas as areas principais

---

### Step 7: Generate Gap Analysis Report (5-8 min)

**Agent Activity:**

Compilar todos os achados dos steps anteriores em um relatorio coeso e
acionavel.

**Report Structure (gap-analysis.md):**

```markdown
# Gap Analysis: [Nome do Sujeito]

## 1. Executive Summary

- Total de gaps identificados: N
- Distribuicao por severidade: N critical, N significant, N minor
- Areas mais afetadas: [lista]
- Principal achado: [1-2 frases]

## 2. Espoused vs Theory-in-Use

### 2.1 Gaps de Execucao
[Lista com evidencias]

### 2.2 Pontos Cegos (Blind Spots)
[Lista com evidencias]

### 2.3 Contradicoes
[Lista com evidencias e recomendacao de resolucao]

### 2.4 Expertise Oculta (Hidden Expertise)
[Lista com evidencias e recomendacao de articulacao]

### 2.5 Gaps Contextuais (Context-Dependent)
[Lista -- documentar como adaptacao, nao como gap]

## 3. Ladder of Inference Audit

### Framework 1: [Nome]
[Audit completa]

### Framework 2: [Nome]
[Audit completa]

### Framework 3: [Nome]
[Audit completa]

## 4. Left-Hand Column Findings
[Achados principais com evidencias]

## 5. Double-Loop Learning Opportunities
[Oportunidades priorizadas por impacto]

## 6. Model I/II Assessment
[Assessment por area com interpretacao]

## 7. Recommendations
[Recomendacoes priorizadas e acionaveis]

## 8. Metadata
- Data da analise: YYYY-MM-DD
- Fontes utilizadas: [lista]
- Agente executor: argyris
- Confidence geral: high/medium/low
```

**Structured Output (gap-analysis.yaml):**

```yaml
gap_analysis:
  metadata:
    subject: "{nome}"
    date: "2026-02-18"
    executor: "argyris"
    version: "1.0.0"
    total_gaps: N
    severity_distribution:
      critical: N
      significant: N
      minor: N
    overall_confidence: 0.0-1.0

  gaps:
    - id: "GAP-001"
      type: "execution_gap | blind_spot | contradiction | hidden_expertise | aspiration_gap"
      area: "area de expertise"
      severity: "critical | significant | minor"
      espoused: "O que o sujeito declara"
      actual: "O que as evidencias mostram"
      evidence:
        - source: "CDM #3"
          quote: "Citacao ou descricao"
        - source: "Q&A Session 2"
          quote: "Citacao ou descricao"
      confidence: 0.0-1.0
      recommendation: "Acao sugerida"
      resolution_status: "open | resolved | documented"

  ladder_audits:
    - framework_id: "RM-ITEM-042"
      inference_quality: "sound | mostly_sound | questionable"
      biggest_leap: "Step X → Step Y"
      untested_assumptions: ["..."]

  double_loop_opportunities:
    - id: "DL-001"
      area: "area"
      current_pattern: "descricao do single-loop"
      opportunity: "descricao do double-loop"
      estimated_impact: "critical | high | medium | low"
      difficulty: "high | medium | low"

  model_assessment:
    overall_dominant: "Model I | Model II | Mixed"
    by_area:
      - area: "area"
        model_I_score: 0.0-1.0
        model_II_score: 0.0-1.0
        dominant: "Model I | Model II"
```

**Validation Verdict:**

```yaml
validation_verdict:
  score: N/10
  verdict: "PASS | CONCERNS | FAIL"
  critical_gaps_resolved: N/N
  message: "Descricao do veredicto"
  conditions:
    - "Condicao 1 para proximo step"
  blockers:
    - "Blocker 1 que impede avancar"
```

**Checkpoint:** Relatorio completo gerado e salvo

---

## Validation

### Checklist

- [ ] Todas as areas de expertise do profile foram avaliadas
- [ ] Comparacao espoused vs theory-in-use para cada area
- [ ] Gaps classificados por tipo (6 tipos)
- [ ] Gaps classificados por severidade (critical/significant/minor)
- [ ] Cada gap tem evidencia de pelo menos 2 fontes
- [ ] Ladder of Inference auditada para 3+ frameworks de decisao criticos
- [ ] Saltos de inferencia identificados e documentados
- [ ] Premissas nao testadas listadas
- [ ] Left-Hand Column analysis com pelo menos 3 achados
- [ ] Double-loop opportunities documentadas com exemplos concretos
- [ ] Model I/II assessment completo para areas principais
- [ ] Nenhuma contradicao critica sem resolucao documentada
- [ ] Gap analysis report gerado em formato markdown e YAML

### Success Criteria

**Threshold: 10/13 no checklist acima**

| Criteria | Excelente (3) | Aceitavel (2) | Insuficiente (1) |
|----------|--------------|----------------|-------------------|
| **Coverage** | Todas as areas analisadas | 80%+ areas | < 80% areas |
| **Evidence Quality** | 2+ fontes por gap | 1 fonte por gap | Gaps sem evidencia |
| **Ladder Depth** | 3+ frameworks auditados | 2 frameworks | 1 ou menos |
| **Double-Loop** | 3+ opportunities com exemplos | 2 opportunities | 1 ou menos |
| **Model Assessment** | I/II por area com evidencia | I/II geral | Sem assessment |
| **Actionability** | Recomendacoes especificas e acionaveis | Recomendacoes gerais | Sem recomendacoes |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Context Loading** | 2-3 min | Load all inputs |
| **Espoused vs Actual** | 8-12 min | Core comparison, most intensive step |
| **Ladder of Inference** | 5-8 min | Per-framework audit |
| **Left-Hand Column** | 3-5 min | Inference-heavy, requires multiple sources |
| **Double-Loop Scan** | 5-7 min | Pattern identification |
| **Model I/II Assessment** | 3-5 min | Classification with evidence |
| **Report Generation** | 5-8 min | Compilation and structuring |
| **Total** | 31-48 min | Depends on item count and complexity |

---

## Integration

### Feeds To

- **TK-RM-008 (organize-para):** Gap analysis informa classificacao PARA (gaps sao Areas, nao Projects)
- **TK-RM-010 (generate-manifest):** Gaps sao incluidos como metadata no manifest
- **TK-RM-011 (generate-operating-manual):** Double-loop opportunities viram secao do manual
- **TK-RM-012 (update-knowledge-graph):** Gaps criam edges tipo "contradicts" no grafo

### Depends On

- **TK-RM-001 to TK-RM-006:** Todas as tasks de extracao de Tier 0 e Tier 1
- **QG-003:** Extraction Quality gate deve ter sido passado
- **QG-004:** Systematization Review deve ter sido passado

### Agent Routing

**Primary Agent:** argyris (Tier 2 -- Validation)
**Quality Review:** repertoire-chief (valida completude do gap analysis)

---

## Notes for Executor

### Cuidado com False Positives

Nem toda discrepancia e um gap. O sujeito pode operar de forma diferente em
diferentes contextos sem que isso constitua uma contradicao. Um mentor que e
diretivo com iniciantes e facilitador com avancados nao esta sendo
inconsistente -- esta adaptando.

**Regra:** Antes de classificar como gap, pergunte: "Existe um contexto
onde ambos os comportamentos fazem sentido?" Se sim, classifique como
`context_dependent`, nao como `contradiction`.

### Cuidado com Severity Inflation

A tendencia natural e classificar tudo como "critical". Resista. Gaps
criticos sao aqueles que, se nao resolvidos, tornam o repertoire-manifest
enganoso ou perigoso. A maioria dos gaps sera "significant" ou "minor".

### Expertise Oculta e Valiosissima

Hidden expertise e talvez o achado mais valioso desta task. Quando o
sujeito FAZ algo excepcional mas NAO ARTICULA, isso significa que esse
conhecimento esta em risco de perda. Priorize a documentacao de hidden
expertise -- ela enriquece o manifest mais do que qualquer outro achado.

### Quando o Sujeito Resiste

Se o sujeito estiver disponivel para validacao e resistir aos achados,
isso em si e um data point valioso. Resistencia a gaps e tipicamente
um comportamento Model I (suprimir sentimentos negativos, manter controle).
Documente a resistencia como evidencia adicional, nao como refutacao.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
