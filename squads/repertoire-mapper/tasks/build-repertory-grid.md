---
id: TK-RM-004
name: Build Repertory Grid
version: 1.0.0
executor: kelly
purpose: >
  Construir Repertory Grid completo a partir de multiplas sessoes Q&A (TK-RM-003),
  com analise estatistica profunda: correlacao entre construtos, Principal Component
  Analysis (PCA), clustering hierarquico, identificacao de construtos core vs
  peripheral, e geracao de construct map visual. Este e o passo de consolidacao
  que transforma dados brutos de sessoes em um mapa estruturado do pensamento
  do especialista.

inputs:
  - name: session_grids
    type: list[file]
    description: >
      Lista de grids de sessoes Q&A (output de TK-RM-003). Minimo 2 sessoes
      recomendado para analise estatistica significativa. Podem ser do mesmo
      dominio ou de dominios diferentes.
    required: true
    location: "outputs/repertoire-mapper/{slug}/sessions/*-grid.yaml"
    minimum: 1

  - name: session_constructs
    type: list[file]
    description: >
      Lista de construtos extraidos nas sessoes (output de TK-RM-003).
      Complementa os grids com laddering e classificacoes detalhadas.
    required: true
    location: "outputs/repertoire-mapper/{slug}/sessions/*-constructs.yaml"

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001. Usado para alinhar dominios dos construtos
      com a classificacao Polanyi-Collins.
    required: false
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: extracted_items
    type: list[file]
    description: >
      Itens extraidos de fontes (TK-RM-002). Usados para cross-reference
      entre construtos da grid e itens do CDM.
    required: false
    location: "outputs/repertoire-mapper/{slug}/extractions/*-items.yaml"

  - name: analysis_depth
    type: enum
    description: >
      Profundidade da analise estatistica. 'basic' calcula correlacoes e
      clusters simples. 'full' adiciona PCA, dendrograma e analise de
      componentes. 'research' adiciona bootstrap e testes de significancia.
    required: false
    options: ["basic", "full", "research"]
    default: "full"

preconditions:
  - "Pelo menos 1 sessao Q&A completa (TK-RM-003) com grid valida"
  - "Grid(s) com minimo 4 construtos e 4 elementos para analise estatistica"
  - "Agente kelly acessivel e configurado"
  - "Para PCA: minimo 6 construtos e 6 elementos recomendado"
  - "Grids do mesmo especialista (nao misturar especialistas diferentes)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/grid/complete-grid.yaml"
    description: >
      Repertory Grid consolidada de todas as sessoes com analise
      estatistica completa. Output primario da task.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/grid/construct-map.yaml"
    description: >
      Mapa hierarquico de construtos — core, cluster, laddering chains,
      e relacoes. Representacao estruturada do pensamento do especialista.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/grid/analysis-report.md"
    description: >
      Relatorio de analise da grid — interpretacao dos resultados
      estatisticos, padroes encontrados, insights sobre o especialista.
    format: markdown

  - path: "outputs/repertoire-mapper/{slug}/grid/pca-results.yaml"
    description: >
      Resultados da Principal Component Analysis — componentes,
      variancia explicada, loadings dos construtos. Somente se
      analysis_depth = 'full' ou 'research'.
    format: yaml

validation:
  success_criteria:
    - "Grid consolidada contem todos os construtos e elementos de todas as sessoes"
    - "Construtos duplicados identificados e resolvidos (merge ou keep separate)"
    - "Correlacoes calculadas para todos os pares de construtos"
    - "Clusters de construtos identificados com nomes significativos"
    - "PCA executado e componentes principais identificados (se depth >= full)"
    - "Construtos classificados como core vs peripheral com justificativa"
    - "Construct map gerado com hierarquia clara"
    - "Analysis report interpreta resultados (nao apenas numeros)"
  quality_threshold: "6/8 criterios acima"
---

# Task: Build Repertory Grid

**Task ID:** TK-RM-004
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

Esta task consolida multiplas sessoes Q&A (TK-RM-003) em uma Repertory Grid unificada e aplica analise estatistica para revelar a ESTRUTURA do pensamento do especialista. Enquanto sessoes individuais capturam construtos isolados, a grid consolidada revela como esses construtos se CONECTAM — quais sao fundamentais (core), quais sao perifericos, quais se agrupam (clusters), e quais dimensoes latentes (componentes principais) organizam todo o pensamento.

A analise estatistica transforma dados qualitativos (construtos bipolares) em insights quantitativos sobre a arquitetura cognitiva do especialista:
- **Correlacoes** revelam quais construtos "andam juntos"
- **Clusters** revelam temas centrais de pensamento
- **PCA** revela dimensoes latentes que o especialista usa sem consciencia
- **Core vs Peripheral** revela o que e fundamental vs acessorio

**Workflow Position:** Task 4 — consolida output de multiplas TK-RM-003 sessions
**Success Definition:** Grid completa com analise estatistica e construct map interpretado
**Output Quality Gate:** Contribui para QG-003 e alimenta QG-004

---

## Purpose

Uma unica sessao Q&A (TK-RM-003) captura 8-20 construtos sobre um dominio. Mas construtos isolados sao como pecas de quebra-cabeca — uteis individualmente, mas o valor real emerge quando voce ve o quadro completo.

A grid consolidada responde perguntas que sessoes individuais nao conseguem:

1. **"Qual e a estrutura profunda do pensamento deste especialista?"** — PCA revela dimensoes latentes. Um especialista em marketing pode ter duas dimensoes fundamentais: "controle vs exploração" e "dados vs intuição". Todos os seus construtos se organizam ao redor desses dois eixos.

2. **"Quais construtos sao realmente importantes vs superficiais?"** — Construtos core correlacionam com muitos outros (sao nos centrais na rede de significado). Construtos peripheral correlacionam com poucos (sao folhas, nao troncos).

3. **"Como este especialista categoriza internamente as coisas?"** — Clusters revelam categorias mentais. Se "budget alto", "equipe grande" e "resultado previsível" formam um cluster, isso revela que para este especialista, investimento = escala = previsibilidade — uma equacao mental que um novato nao faria.

4. **"Onde ha contradições ou tensões no pensamento?"** — Construtos com correlacao zero podem indicar dimensoes ortogonais (independentes) ou tensoes nao resolvidas.

---

## Executor Type

**Agent (100% kelly)**

- **Agent Role:** Consolidar grids, executar analises estatisticas, interpretar resultados, gerar construct map
- **Human Role:** Nenhum durante analise (humano valida interpretacoes em etapa separada)
- **Estimated Runtime:** 20-45 min dependendo do numero de sessoes e profundidade de analise

---

## Steps

### Step 1: Compilar Todas as Sessoes (3-5 min)

**Executor:** kelly

1.1. **Carregar todas as session grids:**
- Ler cada `*-grid.yaml` de `session_grids`
- Extrair elementos, construtos e ratings de cada sessao
- Registrar metadados (dominio, data, formato da sessao)

1.2. **Carregar todos os construtos detalhados:**
- Ler cada `*-constructs.yaml` de `session_constructs`
- Extrair laddering chains, importancia, classificacao
- Mapear construtos aos seus grids de origem

1.3. **Inventario inicial:**

```yaml
compilation_inventory:
  total_sessions: 4
  sessions:
    - id: "QA-001"
      domain: "marketing digital"
      format: "standard"
      elements: 6
      constructs: 10
      date: "2026-02-15"

    - id: "QA-002"
      domain: "marketing digital"
      format: "deep"
      elements: 9
      constructs: 16
      date: "2026-02-17"

    - id: "QA-003"
      domain: "copywriting"
      format: "standard"
      elements: 6
      constructs: 8
      date: "2026-02-18"

    - id: "QA-004"
      domain: "gestao de equipes"
      format: "mini"
      elements: 3
      constructs: 3
      date: "2026-02-18"

  totals:
    unique_elements: 18    # Antes de deduplicacao
    total_constructs: 37   # Antes de deduplicacao
    domains_covered: 3
```

**Checkpoint:** Todas as sessoes carregadas e inventariadas.

---

### Step 2: Resolucao de Duplicatas e Merge (5-8 min)

**Executor:** kelly

2.1. **Identificar elementos duplicados:**

Elementos que aparecem em multiplas sessoes (mesmo nome ou muito similar):

```yaml
element_deduplication:
  duplicates_found:
    - canonical: "E1-Campanha Black Friday 2024"
      instances:
        - session: "QA-001"
          id: "E1"
          name: "Campanha BF24"
        - session: "QA-002"
          id: "E3"
          name: "Black Friday 2024"
      resolution: "merge"
      merged_id: "E-MERGED-001"
      ratings_resolution: "average"  # average | latest | max_confidence
```

2.2. **Identificar construtos duplicados ou sobrepostos:**

Construtos com significado muito similar mas formulacao diferente:

```yaml
construct_deduplication:
  potential_duplicates:
    - construct_a:
        id: "C3-QA001"
        poles: ["Budget alto", "Budget baixo"]
      construct_b:
        id: "C2-QA002"
        poles: ["Investimento pesado", "Investimento leve"]
      similarity: 0.88
      resolution: "merge"
      merged:
        id: "C-MERGED-001"
        poles: ["Budget/Investimento alto", "Budget/Investimento baixo"]
        ratings: "averaged from both sessions"
      justification: "Mesmo conceito com vocabulario levemente diferente"

    - construct_a:
        id: "C5-QA001"
        poles: ["Estrategico", "Tatico"]
      construct_b:
        id: "C7-QA002"
        poles: ["Longo prazo", "Curto prazo"]
      similarity: 0.65
      resolution: "keep_separate"
      justification: >
        Parecem similares mas o especialista distingue: estrategico vs tatico
        e sobre nivel de decisao, longo vs curto prazo e sobre horizonte temporal.
        Sao dimensoes correlacionadas mas distintas.
```

2.3. **Regras de merge:**

- **similarity >= 0.85:** Merge automatico (mesmos polos com sinonimos)
- **similarity 0.65-0.84:** Revisao manual — Kelly decide baseado em laddering
- **similarity < 0.65:** Manter separados
- Se merge: ratings sao AVERAGED entre sessoes
- Se merge: laddering chains de ambos sao preservados

2.4. **Construir grid unificada:**

```yaml
unified_grid:
  elements: [E1, E2, ..., E-MERGED-001, ...]  # Lista deduplicada
  constructs: [C1, C2, ..., C-MERGED-001, ...] # Lista deduplicada
  matrix:
    # Matrix N construtos x M elementos
    # Celulas com ratings (1-5)
    # Celulas sem rating (elemento nao apareceu na sessao do construto) = null
```

**Nota:** Celulas `null` (elemento nao avaliado em construto de sessao diferente) sao tratadas como missing data na analise estatistica. Para PCA, podem ser imputadas com media do construto ou excluidas pairwise.

**Checkpoint:** Grid unificada construida. Duplicatas resolvidas.

---

### Step 3: Calculo de Correlacoes (5-8 min)

**Executor:** kelly

3.1. **Correlacao de Pearson entre todos os pares de construtos:**

Para cada par de construtos (Ci, Cj), calcular correlacao usando os ratings dos elementos em comum:

```yaml
correlation_matrix:
  method: "pearson"
  missing_data_handling: "pairwise_deletion"  # Usa apenas elementos com rating em AMBOS construtos
  significance_level: 0.05

  matrix:
    #       C1     C2     C3     C4     C5     C6     C7
    C1:  [ 1.00,  0.23, -0.82,  0.15,  0.78, -0.12,  0.45]
    C2:  [ 0.23,  1.00,  0.05,  0.91,  0.31,  0.67, -0.08]
    C3:  [-0.82,  0.05,  1.00, -0.10, -0.75,  0.18, -0.55]
    C4:  [ 0.15,  0.91, -0.10,  1.00,  0.22,  0.72,  0.03]
    C5:  [ 0.78,  0.31, -0.75,  0.22,  1.00, -0.05,  0.60]
    C6:  [-0.12,  0.67,  0.18,  0.72, -0.05,  1.00,  0.11]
    C7:  [ 0.45, -0.08, -0.55,  0.03,  0.60,  0.11,  1.00]

  significant_correlations:
    strong_positive:  # |r| >= 0.7
      - pair: [C2, C4]
        r: 0.91
        interpretation: "Budget alto e escala grande sao quase intercambiaveis para este especialista"
      - pair: [C1, C5]
        r: 0.78
        interpretation: "Foco em conversao e resultado previsivel andam juntos na mente do especialista"

    strong_negative:  # r <= -0.7
      - pair: [C1, C3]
        r: -0.82
        interpretation: "Foco em conversao e awareness sao polos opostos — nao coexistem"
      - pair: [C3, C5]
        r: -0.75
        interpretation: "Awareness esta associado a incerteza de resultado"

    near_zero:  # |r| <= 0.15
      - pair: [C2, C3]
        r: 0.05
        interpretation: "Budget e tipo de foco sao independentes na mente do especialista"
```

3.2. **Calculo de distancia entre elementos:**

Usar ratings para calcular quao "proximos" ou "distantes" os elementos sao na mente do especialista:

```yaml
element_distances:
  method: "euclidean"
  closest_pairs:
    - elements: [E1, E5]
      distance: 2.3
      interpretation: "O especialista ve E1 e E5 como muito similares"
  farthest_pairs:
    - elements: [E1, E2]
      distance: 8.7
      interpretation: "E1 e E2 sao opostos na maioria dos construtos"
```

3.3. **Calculo de variabilidade por construto:**

Construtos com alta variabilidade discriminam bem os elementos (sao mais informativos):

```yaml
construct_variability:
  - construct: C1
    std_dev: 1.8
    range: [1, 5]
    discriminative_power: "HIGH"
    notes: "Este construto diferencia bem os elementos"

  - construct: C6
    std_dev: 0.5
    range: [3, 4]
    discriminative_power: "LOW"
    notes: "Todos os elementos sao avaliados similarmente — construto pouco util"
```

**Checkpoint:** Correlacoes calculadas. Padroes iniciais identificados.

---

### Step 4: Clustering Hierarquico (5-8 min)

**Executor:** kelly

4.1. **Cluster analysis de construtos:**

Agrupar construtos que tendem a co-variar (sao usados de forma similar):

```yaml
construct_clustering:
  method: "ward"  # Ward's minimum variance method
  distance_metric: "1 - abs(correlation)"

  dendrogram:
    # Representacao textual do dendrograma
    level_1:
      cluster_A: [C1, C3, C5, C7]
      cluster_B: [C2, C4, C6]

    level_2:
      cluster_A1: [C1, C5]       # Fortemente correlacionados
      cluster_A2: [C3, C7]       # Inversamente correlacionados com A1
      cluster_B1: [C2, C4]       # Fortemente correlacionados
      cluster_B2: [C6]           # Peripheral neste cluster

  named_clusters:
    - id: CL-A
      name: "Performance & Previsibilidade"
      constructs: [C1, C3, C5, C7]
      core_theme: >
        O especialista agrupa mentalmente tudo que envolve resultados
        mensuráveis, controle e previsibilidade em um unico eixo.
      representative_construct: C1  # O mais central no cluster
      internal_coherence: 0.78  # Media das correlacoes dentro do cluster

    - id: CL-B
      name: "Investimento & Estrutura"
      constructs: [C2, C4, C6]
      core_theme: >
        Budget, equipe e infraestrutura sao um unico conceito mental
        para este especialista — investimento e escala sao indissociaveis.
      representative_construct: C2
      internal_coherence: 0.82
```

4.2. **Cluster analysis de elementos:**

Agrupar elementos que sao avaliados de forma similar pelo especialista:

```yaml
element_clustering:
  method: "ward"
  distance_metric: "euclidean"

  named_clusters:
    - id: EL-A
      name: "Campanhas de Performance"
      elements: [E1, E5, E8]
      profile: "Alto budget, foco em conversao, resultado previsivel"
      archetype: E1  # Elemento mais representativo

    - id: EL-B
      name: "Acoes de Branding"
      elements: [E2, E6]
      profile: "Budget variado, foco em awareness, resultado incerto"
      archetype: E2
```

**Checkpoint:** Clusters identificados e nomeados.

---

### Step 5: Principal Component Analysis (5-10 min)

**Executor:** kelly
**Condicao:** Somente se `analysis_depth` = "full" ou "research"

5.1. **Execucao do PCA:**

PCA revela as DIMENSOES LATENTES que organizam o pensamento do especialista — eixos que ele usa sem consciencia explicita:

```yaml
pca_results:
  method: "singular_value_decomposition"
  scaling: "standardized"
  missing_data: "mean_imputation"

  components:
    - id: PC1
      variance_explained: 0.52  # 52% da variancia total
      variance_cumulative: 0.52
      label: "Controle vs Exploração"  # Interpretacao de Kelly
      top_loadings:
        positive:
          - construct: C1
            loading: 0.89
            pole: "Foco em conversao"
          - construct: C5
            loading: 0.82
            pole: "Resultado previsivel"
        negative:
          - construct: C3
            loading: -0.85
            pole: "Foco em awareness"
          - construct: C7
            loading: -0.71
            pole: "Resultado incerto"
      interpretation: >
        O eixo principal do pensamento deste especialista e Controle vs Exploracao.
        De um lado: conversao, previsibilidade, metricas claras.
        Do outro: awareness, incerteza, apostas criativas.
        52% de toda a variacao nos construtos se explica por esta unica dimensao.

    - id: PC2
      variance_explained: 0.28  # 28% da variancia
      variance_cumulative: 0.80  # 80% acumulado
      label: "Escala vs Artesanato"
      top_loadings:
        positive:
          - construct: C2
            loading: 0.91
            pole: "Budget alto"
          - construct: C4
            loading: 0.85
            pole: "Escala grande"
        negative:
          - construct: C6
            loading: -0.68
            pole: "Personalizado"
      interpretation: >
        O segundo eixo e Escala vs Artesanato. Independente de ser
        performance ou branding, o especialista diferencia entre
        acoes de escala (budget, equipe, volume) e acoes artesanais
        (personalizadas, hands-on, sob medida).

  scree_plot:
    components_to_retain: 2  # Usando criterio de Kaiser (eigenvalue > 1)
    total_variance_explained: 0.80  # 2 componentes explicam 80%
    interpretation: >
      Duas dimensoes latentes explicam 80% de como este especialista
      pensa sobre marketing. Todas as decisoes dele podem ser mapeadas
      em um plano 2D: Controle-Exploracao x Escala-Artesanato.
```

5.2. **Projecao dos elementos no espaco PCA:**

Plotar cada elemento nas coordenadas dos componentes principais:

```yaml
element_projections:
  - element: E1
    pc1: 1.85    # Alta conversao/controle
    pc2: 1.20    # Alto budget/escala
    quadrant: "Performance at Scale"

  - element: E2
    pc1: -1.50   # Awareness/exploracao
    pc2: 0.30    # Budget medio
    quadrant: "Creative Exploration"

  - element: E5
    pc1: 1.70    # Alta conversao/controle
    pc2: -1.10   # Artesanal
    quadrant: "Boutique Performance"

  quadrant_labels:
    Q1: "Performance at Scale"       # (+PC1, +PC2)
    Q2: "Mass Brand Building"        # (-PC1, +PC2)
    Q3: "Creative Exploration"       # (-PC1, -PC2)
    Q4: "Boutique Performance"       # (+PC1, -PC2)
```

5.3. **Se `analysis_depth` = "research":**

Adicionar:
- Bootstrap de confianca para loadings (N=1000 resamples)
- Teste de significancia para cada loading
- Analise de sensibilidade (remover um elemento, ver como PCA muda)
- Comparacao com rotacao varimax vs promax

**Checkpoint:** PCA completo. Dimensoes latentes identificadas e interpretadas.

---

### Step 6: Identificacao Core vs Peripheral (3-5 min)

**Executor:** kelly

6.1. **Calculo de centralidade por construto:**

Centralidade = quao "conectado" o construto e com o resto da rede:

```yaml
construct_centrality:
  method: "eigenvector_centrality"

  rankings:
    - construct: C1
      centrality: 0.92
      classification: "CORE"
      correlations_significant: 5
      average_abs_correlation: 0.68
      cluster_membership: "CL-A"
      pca_loading_max: 0.89
      justification: >
        Construto mais central: correlaciona significativamente com 5
        outros construtos, tem o maior loading em PC1. 'Foco em conversao
        vs awareness' e a dimensao FUNDAMENTAL do pensamento deste
        especialista sobre marketing.

    - construct: C2
      centrality: 0.85
      classification: "CORE"
      correlations_significant: 4
      average_abs_correlation: 0.61
      cluster_membership: "CL-B"
      pca_loading_max: 0.91
      justification: >
        Segundo mais central. 'Budget alto vs baixo' define o eixo de
        investimento que organiza como o especialista planeja acoes.

    - construct: C6
      centrality: 0.31
      classification: "PERIPHERAL"
      correlations_significant: 1
      average_abs_correlation: 0.28
      cluster_membership: "CL-B (marginal)"
      pca_loading_max: 0.42
      justification: >
        Pouca conexao com outros construtos. Pode ser insight unico
        ou construto superficial que nao reflete pensamento profundo.
```

6.2. **Criterios de classificacao:**

| Centralidade | Classificacao | Interpretacao |
|-------------|--------------|---------------|
| >= 0.70 | CORE | Construto fundamental — define o pensamento |
| 0.40-0.69 | SUPPORTING | Construto importante mas nao central |
| < 0.40 | PERIPHERAL | Construto marginal — pode ser descartado |

6.3. **Validacao cruzada com laddering:**

Construtos que apareceram no topo de laddering-up (valores) devem ser core. Se um construto e core por centralidade mas nao aparece em laddering, verificar. Se aparece em laddering mas nao e core por centralidade, pode ser um valor pessoal que ainda nao esta bem representado nos elementos.

**Checkpoint:** Todos os construtos classificados. Hierarquia definida.

---

### Step 7: Geracao do Construct Map (5-8 min)

**Executor:** kelly

7.1. **Compilar construct-map.yaml:**

O construct map e a representacao estruturada e hierarquica de como o especialista pensa:

```yaml
construct_map:
  metadata:
    specialist_name: "{nome}"
    specialist_slug: "{slug}"
    build_date: "2026-02-18T16:00:00Z"
    sessions_compiled: 4
    total_constructs: 28
    total_elements: 15
    domains: ["marketing digital", "copywriting", "gestao de equipes"]

  dimensions:
    primary:
      label: "Controle vs Exploracao"
      variance_explained: 0.52
      core_constructs: [C1, C5, C3, C7]
      description: >
        Eixo principal: o especialista organiza todo seu pensamento
        ao redor da tensao entre controlar resultados (metricas,
        previsibilidade, ROI direto) e explorar novas possibilidades
        (branding, criatividade, apostas de longo prazo).

    secondary:
      label: "Escala vs Artesanato"
      variance_explained: 0.28
      core_constructs: [C2, C4, C6]
      description: >
        Eixo secundario: independente de controle/exploracao, o
        especialista diferencia entre acoes de escala industrial
        e acoes artesanais/personalizadas.

  clusters:
    - id: CL-A
      name: "Performance & Previsibilidade"
      constructs: [C1, C5, C7]
      archetype_element: E1
      summary: "Mundo das metricas, ROI direto, campanhas otimizaveis"

    - id: CL-B
      name: "Investimento & Estrutura"
      constructs: [C2, C4, C6]
      archetype_element: E8
      summary: "Mundo dos recursos — budget, equipe, infraestrutura"

  hierarchy:
    superordinate:  # Valores — topo do laddering
      - construct: "Seguranca profissional vs Vulnerabilidade"
        source_laddering: [C1]
        level: "value"

      - construct: "Autonomia vs Dependencia"
        source_laddering: [C4]
        level: "value"

    core:  # Construtos centrais
      - C1: "Foco em conversao vs Foco em awareness"
      - C2: "Budget alto vs Budget baixo"
      - C5: "Resultado previsivel vs Resultado incerto"

    supporting:  # Construtos de suporte
      - C3: "Curto prazo vs Longo prazo"
      - C4: "Escala grande vs Escala pequena"

    peripheral:  # Construtos marginais
      - C6: "Personalizado vs Generico"
      - C8: "Visual vs Textual"

    subordinate:  # Comportamentos — base do laddering
      - behavior: "Configurar pixel de conversao primeiro"
        source_laddering: [C1]
        level: "action"

  cross_domain_patterns:
    - pattern: "O construto 'Controle vs Exploracao' aparece em marketing E gestao"
      domains: ["marketing digital", "gestao de equipes"]
      implication: "Dimensao transversal no pensamento do especialista"
```

7.2. **Compilar complete-grid.yaml** (grid consolidada com analise):

Arquivo completo com todos os dados: elementos, construtos, matrix, correlacoes, clusters, PCA, centralidade.

7.3. **Compilar analysis-report.md:**

```markdown
# Grid Analysis Report: {nome_especialista}

## Resumo Executivo
- Total de sessoes compiladas: N
- Total de construtos (apos deduplicacao): M
- Total de elementos: K
- Componentes principais: 2 (explicam X% da variancia)

## Dimensoes Latentes do Pensamento
### Dimensao 1: {nome} (X% da variancia)
[Descricao narrativa, construtos associados, implicacoes]

### Dimensao 2: {nome} (Y% da variancia)
[Descricao narrativa, construtos associados, implicacoes]

## Clusters de Construtos
[Cada cluster com nome, construtos, tema central]

## Hierarquia de Construtos
### Core (fundamentais)
[Lista com justificativa]
### Supporting (de suporte)
[Lista]
### Peripheral (marginais)
[Lista]

## Insights Principais
1. [Insight 1 — o que este mapa revela sobre como o especialista pensa]
2. [Insight 2]
3. [Insight 3]

## Padroes Cross-Domain
[Construtos que aparecem em multiplos dominios]

## Recomendacoes
- [Para extracao futura]
- [Para sessoes Q&A adicionais]
- [Para Deep Smarts assessment]
```

**Checkpoint:** Todos os outputs gerados.

---

### Step 8: Validacao Final (3-5 min)

**Executor:** kelly

8.1. **Checklist de auto-validacao:**

- [ ] Todas as sessoes compiladas sem perda de dados
- [ ] Duplicatas de elementos resolvidas (merge ou keep)
- [ ] Duplicatas de construtos resolvidas com justificativa
- [ ] Grid unificada completa e consistente
- [ ] Correlacoes calculadas para todos os pares
- [ ] Clusters identificados com nomes significativos e interpretacao
- [ ] PCA executado com componentes interpretados (se depth >= full)
- [ ] Construtos classificados como core/supporting/peripheral
- [ ] Construct map gerado com hierarquia clara
- [ ] Analysis report interpreta resultados qualitativamente
- [ ] Todos os YAMLs validos e parseaveis
- [ ] Insights sao nao-triviais (revelam algo que nao era obvio)

**Checkpoint:** Validacao completa.

---

## Outputs

### Primary Output 1: Complete Grid
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/grid/complete-grid.yaml`

### Primary Output 2: Construct Map
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/grid/construct-map.yaml`

### Secondary Output 1: Analysis Report
**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/grid/analysis-report.md`

### Secondary Output 2: PCA Results
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/grid/pca-results.yaml`

---

## Validation

### Checklist

- [ ] Todas as sessoes Q&A carregadas e inventariadas
- [ ] Elementos duplicados identificados e resolvidos
- [ ] Construtos duplicados identificados e resolvidos com justificativa
- [ ] Grid unificada construida (matrix completa)
- [ ] Correlacoes de Pearson calculadas para todos os pares de construtos
- [ ] Correlacoes significativas interpretadas narrativamente
- [ ] Distancias entre elementos calculadas
- [ ] Variabilidade por construto calculada
- [ ] Clustering hierarquico executado para construtos
- [ ] Clustering hierarquico executado para elementos
- [ ] Clusters nomeados com temas significativos
- [ ] PCA executado (se depth >= full) com componentes interpretados
- [ ] Elementos projetados no espaco PCA
- [ ] Centralidade calculada para cada construto
- [ ] Core/Supporting/Peripheral classificados
- [ ] Construct map gerado com hierarquia e cross-domain patterns
- [ ] Analysis report gerado com insights nao-triviais

### Success Criteria

**Threshold: 13/17 no checklist acima**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Compilation** | Zero perda de dados, merge justificado | Perda < 5%, merge razoavel | Dados perdidos |
| **Statistical rigor** | Correlacoes + PCA + clustering | Correlacoes + clustering | Apenas correlacoes |
| **Interpretation** | Insights nao-obvios, narrativa rica | Interpretacao adequada | Apenas numeros |
| **Hierarchy** | Core/peripheral com justificativa | Classificacao sem justificativa | Sem classificacao |
| **Actionability** | Recomendacoes especificas para proximos passos | Recomendacoes genericas | Sem recomendacoes |

---

## Estimated Effort

| Component | Basic | Full | Research |
|-----------|-------|------|----------|
| **Compile sessions** | 3-5 min | 3-5 min | 3-5 min |
| **Resolve duplicates** | 5-8 min | 5-8 min | 5-8 min |
| **Correlations** | 5-8 min | 5-8 min | 5-8 min |
| **Clustering** | 5-8 min | 5-8 min | 5-8 min |
| **PCA** | — | 5-10 min | 10-15 min |
| **Core vs Peripheral** | 3-5 min | 3-5 min | 5-8 min |
| **Construct map** | 5-8 min | 5-8 min | 8-12 min |
| **Validation** | 3-5 min | 3-5 min | 5-8 min |
| **Total** | 29-47 min | 34-57 min | 46-72 min |

---

## Integration

### Feeds To

- **TK-RM-005:** map-deep-smarts — Usa: core constructs como candidatos a Deep Smarts
- **TK-RM-006:** convert-seci — Usa: construct map para conversao SECI
- **generate-manifest:** Usa: complete-grid e construct-map para repertoire manifest

### Depends On

- **TK-RM-003:** run-qa-session (1+ sessoes completas)

### Agent Routing

**Primary Agent:** kelly (especialista em RepGrid analysis)
**Quality Review:** repertoire-chief

---

## Notes for Executor

### O Poder dos Dois Componentes

Na maioria dos casos, 2-3 componentes principais explicam 70-85% da variancia. Isso significa que o pensamento complexo do especialista pode ser SIMPLIFICADO em 2-3 dimensoes fundamentais. Essa simplificacao nao e reducao — e revelacao da estrutura subjacente.

### Quando Clusters nao Fazem Sentido

Se os clusters gerados nao tem interpretacao clara, pode significar: (a) os elementos sao muito homogeneos, (b) os construtos sao muito superficiais, ou (c) o especialista pensa de forma genuinamente multidimensional sem clusters claros. Neste caso, documentar e recomendar sessoes adicionais com elementos mais diversos.

### Cross-Domain Constructs

Construtos que aparecem em dominios diferentes (marketing E gestao, por exemplo) sao EXTREMAMENTE valiosos — revelam "meta-construtos" que o especialista aplica transversalmente. Esses sao candidatos fortes a Deep Smarts.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
