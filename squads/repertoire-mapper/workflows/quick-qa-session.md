---
id: WF-RM-002
name: Quick Q&A Session
version: 1.0.0
description: >
  Sessão de Q&A de baixa fricção usando Repertory Grid de George Kelly.
  Projetada para extrair construtos pessoais em 15-30 minutos via
  comparações simples — sem entrevistas longas ou perguntas abertas.
trigger: manual
phases:
  - SETUP
  - ELEMENT_SELECTION
  - TRIAD_ELICITATION
  - RATING
  - ANALYSIS
  - INTEGRATION
agents_involved:
  - kelly
  - forte
quality_gates:
  - QG-QA-001: Elements Validated
  - QG-QA-002: Minimum Constructs Elicited
estimated_duration: 15-30 minutes
input: >
  Área de domínio para explorar + acesso interativo ao sujeito
output: >
  Repertory grid matrix, core constructs, construct map,
  novos itens para repertoire-manifest.yaml
---

# Quick Q&A Session — Repertory Grid

## Overview

Esta é a **feature diferenciadora** do squad. Enquanto entrevistas CDM (Klein)
exigem 1-2 horas de entrevista profunda, a sessão Q&A com Repertory Grid
extrai construtos pessoais em **15-30 minutos** através de um mecanismo simples:

> **Comparação por tríades:** "Destes 3, quais 2 são mais parecidos? Em quê?
> Como o 3º é diferente?"

Este formato funciona porque:
1. **Não exige introspecção** — a pessoa compara, não explica
2. **Usa a própria linguagem** — construtos emergem naturalmente
3. **É rápido** — cada tríade leva 1-2 minutos
4. **Revela o implícito** — construtos que a pessoa não sabia que tinha

---

## Formats Disponíveis

### Mini-Session (5 minutos)
- 6 elementos, 4 tríades
- Output: 4-6 construtos iniciais
- Uso: exploração rápida, warm-up

### Standard Session (15-20 minutos)
- 8-10 elementos, 8-12 tríades
- Output: 8-15 construtos + grid matrix
- Uso: mapeamento de uma área específica

### Deep Session (30 minutos)
- 12 elementos, 15+ tríades + laddering
- Output: 15-25 construtos + hierarchy + cluster analysis
- Uso: mapeamento profundo com análise de hierarquia

---

## Pipeline Flow

```
SETUP (2 min)
    │ Definir domínio + formato
    ▼
ELEMENT SELECTION (3-5 min)
    │ Sujeito lista 8-12 elementos
    ▼  gate: QG-QA-001
TRIAD ELICITATION (8-15 min)
    │ Apresentar tríades → extrair construtos
    ▼  gate: QG-QA-002
RATING (3-5 min)
    │ Avaliar elementos em cada construto (1-5)
    ▼
ANALYSIS (2-3 min, automática)
    │ Cluster + PCA + core constructs
    ▼
INTEGRATION (2 min)
    │ Adicionar ao repertoire-manifest
    ▼
OUTPUT: Grid + Constructs + Insights
```

---

## PHASE: SETUP

**Agent:** `kelly`
**Duration:** 2 minutos

### Definir Domínio

```yaml
setup:
  domain_question: "Qual área você quer explorar hoje?"
  examples:
    - "Como tomo decisões de negócio"
    - "Meu estilo de liderança"
    - "Como avalio oportunidades"
    - "Minha abordagem de ensino"
    - "Como resolvo problemas técnicos"

  format_selection:
    based_on:
      - time_available
      - depth_needed
      - previous_sessions

  context_load:
    if_previous_sessions_exist:
      - load_existing_constructs
      - identify_gaps_to_explore
      - suggest_complementary_domains
```

---

## PHASE: ELEMENT SELECTION

**Agent:** `kelly`
**Duration:** 3-5 minutos

### Solicitar Elementos

```yaml
element_types_by_domain:
  decision_making:
    prompt: "Liste 10 decisões importantes que você tomou nos últimos 2 anos"
    examples: ["Contratação do João", "Pivô do produto", "Parceria com X"]

  leadership:
    prompt: "Liste 10 pessoas que você liderou ou influenciou"
    examples: ["Membro A da equipe", "Cliente B", "Sócio C"]

  problem_solving:
    prompt: "Liste 10 problemas significativos que você resolveu"
    examples: ["Bug crítico em produção", "Conflito de equipe", "Queda de receita"]

  teaching:
    prompt: "Liste 10 conceitos ou habilidades que você ensina"
    examples: ["Gestão de tempo", "Programação", "Negociação"]

  generic:
    prompt: "Liste 10 [situações/projetos/pessoas] marcantes na área de {domain}"
```

### Validar Elementos

```yaml
validation:
  minimum: 6
  ideal: 8-12
  maximum: 15

  checks:
    - variety: "Elementos devem ser diversos (não todos positivos ou negativos)"
    - concreteness: "Elementos devem ser específicos, não abstratos"
    - familiarity: "Sujeito deve conhecer bem cada elemento"
    - relevance: "Todos no mesmo domínio"

  if_insufficient:
    prompt: "Pode pensar em mais exemplos? Especificamente de [tipo que falta]"

  if_too_similar:
    prompt: "Alguns parecem muito parecidos. Pode substituir X por algo mais diferente?"
```

**QG-QA-001 Check:**
- [ ] Mínimo 6 elementos listados
- [ ] Elementos são diversos
- [ ] Elementos são concretos e específicos

---

## PHASE: TRIAD ELICITATION

**Agent:** `kelly`
**Duration:** 8-15 minutos

### Apresentar Tríades

```yaml
triad_selection_strategy:
  method: "balanced_incomplete_block"
  goal: "Cada elemento aparece em pelo menos 3 tríades"
  avoid: "Repetir a mesma combinação"

per_triad:
  present:
    prompt: |
      Considere estes 3:
        A) {elemento_1}
        B) {elemento_2}
        C) {elemento_3}

      Quais 2 são mais parecidos entre si?
      Em que sentido são parecidos?
      Como o 3º é diferente?

  extract:
    similarity_pole: "O que os 2 parecidos têm em comum"
    contrast_pole: "Como o diferente se distingue"
    construct: "{similarity_pole} ←→ {contrast_pole}"

  example:
    elements: ["Contratação do João", "Pivô do produto", "Parceria com X"]
    response: "Contratação e Parceria são parecidos — ambos envolvem avaliar pessoas"
    construct: "Decisão sobre pessoas ←→ Decisão sobre estratégia"
```

### Técnica de Laddering (se Deep Session)

```yaml
laddering_up:
  trigger: "Construto parece superficial"
  prompt: "Por que isso é importante para você?"
  goal: "Chegar a valores mais profundos"

  example:
    initial: "Rápido ←→ Lento"
    ladder_1: "Por que rapidez importa?"
    response: "Porque mostra competência"
    ladder_2: "E por que competência importa?"
    response: "Porque gera confiança"
    deep_construct: "Inspira confiança ←→ Gera dúvida"

laddering_down:
  trigger: "Construto muito abstrato"
  prompt: "Pode dar um exemplo concreto disso?"
  goal: "Chegar a comportamentos observáveis"

  example:
    initial: "Eficaz ←→ Ineficaz"
    ladder_1: "O que torna algo eficaz na prática?"
    response: "Quando resolve o problema de primeira"
    concrete_construct: "Resolve de primeira ←→ Precisa de iterações"
```

### Probe Library (perguntas de follow-up)

```yaml
probes:
  clarification:
    - "Pode elaborar o que quer dizer com '{termo}'?"
    - "Como você reconhece isso na prática?"

  contrast_deepening:
    - "E o oposto disso seria...?"
    - "Alguém que NÃO tem isso, como se comporta?"

  application:
    - "Quando esse critério é mais importante para você?"
    - "Em que situação isso mudaria?"

  connection:
    - "Isso se relaciona com [construto anterior]?"
    - "Isso é sempre verdade ou depende do contexto?"
```

**QG-QA-002 Check:**
- [ ] Mínimo 6 construtos elicitados (standard), 12 (deep)
- [ ] Cada construto tem polo de similaridade E contraste
- [ ] Construtos são diferenciados (não redundantes)

---

## PHASE: RATING

**Agent:** `kelly`
**Duration:** 3-5 minutos

### Construir Grid Matrix

```yaml
rating_protocol:
  scale: 1-5
  anchors:
    1: "Totalmente alinhado com polo esquerdo"
    3: "Neutro / não se aplica"
    5: "Totalmente alinhado com polo direito"

  process:
    for_each_construct:
      prompt: |
        Para o critério: {polo_esquerdo} ←→ {polo_direito}
        Avalie cada elemento de 1 a 5:

        1) {elemento_1}: ?
        2) {elemento_2}: ?
        ...

  output_format: |
    | Elemento    | C1 | C2 | C3 | C4 | C5 | ... |
    |-------------|----|----|----|----|----| --- |
    | Elemento A  | 4  | 2  | 5  | 1  | 3  | ... |
    | Elemento B  | 2  | 4  | 1  | 5  | 2  | ... |
    | ...         | .. | .. | .. | .. | .. | ... |
```

---

## PHASE: ANALYSIS

**Agent:** `kelly` (automática, sem input do sujeito)
**Duration:** 2-3 minutos

### Análises

```yaml
analyses:
  construct_correlation:
    method: "Correlação entre construtos"
    insight: "Quais construtos estão ligados (mesma dimensão subjacente)"

  element_clustering:
    method: "Cluster analysis de elementos"
    insight: "Quais elementos são tratados de forma similar"

  principal_components:
    method: "PCA simplificada"
    insight: "2-3 dimensões principais que organizam o pensamento"

  core_constructs:
    method: "Variância explicada"
    insight: "Quais construtos são mais discriminativos"

  construct_map:
    method: "Biplot 2D"
    insight: "Mapa visual de elementos × construtos"
```

### Output

```yaml
qa_session_output:
  grid_matrix: "Tabela completa elemento × construto"
  core_constructs:
    - construct: "{polo_A} ←→ {polo_B}"
      discriminative_power: 0.85
      related_constructs: ["..."]

  principal_dimensions:
    - dimension_1: "Nome descritivo"
      explains: "42% da variância"
      key_constructs: ["..."]
    - dimension_2: "Nome descritivo"
      explains: "28% da variância"
      key_constructs: ["..."]

  element_clusters:
    - cluster_1: ["elem_A", "elem_B"]
      theme: "Decisões de alta pressão"
    - cluster_2: ["elem_C", "elem_D"]
      theme: "Decisões estratégicas de longo prazo"

  insights:
    - "Você tende a avaliar situações primariamente em termos de {dimensão_1}"
    - "Há uma forte correlação entre {construto_A} e {construto_B}"
    - "O cluster {X} sugere que você trata {tipo} de forma consistente"
```

---

## PHASE: INTEGRATION

**Agent:** `forte`
**Duration:** 2 minutos

```yaml
integration:
  add_to_manifest:
    for_each_core_construct:
      - type: "personal_construct"
        source: "kelly_qa_session"
        session_date: "YYYY-MM-DD"
        domain: "{domain}"
        construct: "{polo_A} ←→ {polo_B}"
        evidence: ["elementos que evidenciam"]

  update_knowledge_graph:
    new_nodes: "Core constructs como nós"
    new_edges: "Correlações entre construtos como arestas"

  suggest_next:
    if_gaps_found:
      - "Explorar área X com outra sessão Q&A"
      - "Aprofundar construto Y com laddering"
    if_contradictions:
      - "Validar com argyris (gap detection)"
    if_complete:
      - "Área mapeada. Próxima sugestão: {area}"
```

---

## Exemplo de Sessão Completa

```
SETUP:
  "Quero explorar como tomo decisões de investimento de tempo"

ELEMENTOS:
  1. Escrever meu livro
  2. Gravar vídeos para YouTube
  3. Mentorias 1:1
  4. Estudar machine learning
  5. Networking em eventos
  6. Criar frameworks no MMOS
  7. Exercício físico
  8. Ler livros de negócios

TRÍADE 1: [Livro, YouTube, Mentorias]
  "Livro e YouTube são parecidos — criam assets que escalam"
  "Mentorias são diferentes — impacto é 1:1"
  CONSTRUTO: "Escala (1:N) ←→ Profundidade (1:1)"

TRÍADE 2: [ML, Networking, MMOS]
  "ML e MMOS são parecidos — são investimentos em capacidade futura"
  "Networking é diferente — é sobre conexões, não capacidade"
  CONSTRUTO: "Capability building ←→ Relationship building"

TRÍADE 3: [Exercício, Livros, YouTube]
  "Livros e YouTube são parecidos — são sobre output"
  "Exercício é diferente — é sobre manutenção pessoal"
  CONSTRUTO: "Output/Produção ←→ Manutenção/Input"

... (continua por 8-12 tríades)

INSIGHT PRINCIPAL:
  "Você organiza decisões de tempo primariamente em duas dimensões:
   (1) Escala vs Profundidade
   (2) Output/Produção vs Input/Manutenção
   Há uma tendência forte para priorizar Escala + Output."
```

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-18_
