---
id: TK-RM-003
name: Run Q&A Session
version: 1.0.0
executor: kelly
purpose: >
  Executar sessao Q&A de baixa friccao usando Repertory Grid Technique (RepGrid)
  de George Kelly. Tres formatos disponiveis: mini (5min, 1 triad), standard
  (15-20min, 4-5 triads), deep (30min, full grid). Extrai construtos pessoais
  bipolares que revelam como o especialista categoriza, avalia e decide dentro
  de um dominio.

inputs:
  - name: domain
    type: string
    description: >
      Dominio de conhecimento para a sessao Q&A. Pode ser generico
      ("marketing digital") ou especifico ("precificacao de SaaS B2B").
    required: true

  - name: session_format
    type: enum
    description: >
      Formato da sessao. Determina duracao, numero de triads e profundidade.
    required: true
    options: ["mini", "standard", "deep"]
    defaults:
      mini:
        duration: "5 min"
        triads: 1
        elements: 3
        constructs_expected: "2-3"
      standard:
        duration: "15-20 min"
        triads: "4-5"
        elements: "6-9"
        constructs_expected: "8-12"
      deep:
        duration: "30 min"
        triads: "6-8"
        elements: "9-12"
        constructs_expected: "12-20"

  - name: elements_predefined
    type: list[string]
    description: >
      Elementos pre-definidos para usar na sessao. Elementos sao instancias
      concretas do dominio (ex: para "marketing digital", elementos podem ser
      campanhas especificas, ferramentas, canais). Se nao fornecido, Kelly
      elicita os elementos com o especialista.
    required: false

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001. Informa o tipo de conhecimento e nivel de expertise
      para calibrar a sessao.
    required: false
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: prior_extractions
    type: list[file]
    description: >
      Itens ja extraidos (TK-RM-002 ou sessoes Q&A anteriores).
      Usados para evitar redundancia e aprofundar em areas novas.
    required: false

  - name: prior_grids
    type: list[file]
    description: >
      Grids de sessoes anteriores do mesmo especialista no mesmo dominio.
      Usados para expandir o grid existente em vez de comecar do zero.
    required: false

preconditions:
  - "Dominio de conhecimento definido"
  - "Formato de sessao selecionado (mini, standard, deep)"
  - "Agente kelly acessivel e configurado"
  - "Especialista disponivel para interacao (sessao e interativa)"
  - "Diagnostico TK-RM-001 disponivel (recomendado para calibracao)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/sessions/{session-id}-grid.yaml"
    description: >
      Repertory Grid matrix da sessao em formato YAML. Contem elementos,
      construtos com polos, ratings e metadados da sessao.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/sessions/{session-id}-constructs.yaml"
    description: >
      Construtos extraidos com analise detalhada — polos, laddering,
      nivel de implicacao e dominio.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/sessions/{session-id}-session-log.md"
    description: >
      Log narrativo da sessao — fluxo, decisoes, observacoes de Kelly.
    format: markdown

validation:
  success_criteria:
    - "Numero minimo de construtos extraidos conforme formato (mini: 2, standard: 8, deep: 12)"
    - "Cada construto tem polo emergente e polo implicito (bipolar)"
    - "Cada construto tem rating para todos os elementos (sem cells vazias)"
    - "Laddering aplicado a pelo menos 50% dos construtos (up e/ou down)"
    - "Grid matrix completa e valida (sem inconsistencias)"
    - "Construtos nao sao tautologicos (polo A != inverso direto de polo B)"
    - "Sessao completada dentro do tempo-alvo do formato"
  quality_threshold: "5/7 criterios acima"
---

# Task: Run Q&A Session

**Task ID:** TK-RM-003
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

A sessao Q&A usando Repertory Grid Technique (RepGrid) e a tecnica de extracao de MENOR friccao do Repertoire Mapper. Em vez de perguntar diretamente "o que voce sabe sobre X?" (que produz respostas genericas e incompletas), Kelly apresenta TRIADS — tres elementos concretos do dominio — e pede ao especialista para comparar: "quais dois sao mais parecidos? como? como o terceiro e diferente?"

Essa abordagem funciona porque:
1. Comparar e mais facil que descrever (menor carga cognitiva)
2. A diferenciacao revela CRITERIOS implicitos (construtos pessoais)
3. Os construtos sao bipolares — revelam tanto o que o especialista valoriza quanto o que rejeita
4. A tecnica produz dados quantificaveis (ratings) alem de qualitativos (construtos)

**Workflow Position:** Task 3 no pipeline — pode executar apos diagnostico (TK-RM-001) ou independentemente
**Success Definition:** Construtos pessoais extraidos com qualidade suficiente para analise estatistica
**Output Quality Gate:** Contribui para QG-003 (10+ itens de repertorio extraidos)

---

## Purpose

George Kelly descobriu em 1955 que as pessoas entendem o mundo atraves de **construtos pessoais bipolares** — dimensoes de significado criadas pela experiencia. "Estrategico vs Tatico", "Escalavel vs Artesanal", "Data-driven vs Intuicao-based" — esses construtos sao a INFRAESTRUTURA do pensamento de um especialista. Quando voce extrai os construtos, voce tem o MAPA de como a pessoa pensa, decide e avalia.

A Repertory Grid e o metodo mais sistematico e validado cientificamente para extrair construtos pessoais. Com 60+ anos de pesquisa em psicologia, management, educacao e inteligencia artificial, a RepGrid e considerada a tecnica gold-standard para externalizar modelos mentais implicitos.

Esta task oferece tres formatos para diferentes situacoes:

| Formato | Duracao | Triads | Uso Ideal |
|---------|---------|--------|-----------|
| **Mini** | 5 min | 1 | Quick check, warm-up, primeira interacao |
| **Standard** | 15-20 min | 4-5 | Sessao regular de mapeamento |
| **Deep** | 30 min | 6-8+ | Mapeamento profundo de um dominio |

---

## Executor Type

**Agent (100% kelly) — Sessao INTERATIVA**

- **Agent Role:** Facilitador da sessao — seleciona elementos, apresenta triads, coleta construtos, guia laddering, monta grid
- **Human Role:** Especialista responde comparacoes e ratings (participacao ativa obrigatoria)
- **Estimated Runtime:** 5-30 min conforme formato selecionado

---

## Steps

### Step 0: Pre-Session Setup (2-3 min)

**Executor:** kelly

0.1. **Carregar contexto:**
- Ler `diagnosis_data` se disponivel (tipos de conhecimento, nivel de expertise)
- Ler `prior_extractions` se disponivel (o que ja sabemos)
- Ler `prior_grids` se disponivel (expandir vs criar novo)

0.2. **Definir parametros da sessao:**

```yaml
session_config:
  id: "QA-{slug}-{timestamp}"
  domain: "{dominio}"
  format: "{mini | standard | deep}"
  target_triads: N
  target_constructs: N
  element_source: "{predefined | elicited | mixed}"
  laddering_mode: "{up_only | down_only | both | adaptive}"
  rating_scale: "1-5"  # Padrao: 1 = polo esquerdo, 5 = polo direito
```

0.3. **Calibrar linguagem:**
- Se diagnosis indica expertise contributiva: usar vocabulario tecnico do dominio
- Se diagnosis indica expertise interacional: usar vocabulario acessivel
- Se sem diagnostico: comecar acessivel, adaptar conforme respostas

**Checkpoint:** Sessao configurada, contexto carregado.

---

### Step 1: Element Selection (2-5 min)

**Executor:** kelly (com participacao do especialista)

Os **elementos** sao instancias concretas do dominio que serao comparadas. A qualidade dos construtos depende diretamente da qualidade dos elementos.

1.1. **Se `elements_predefined` fornecido:**
- Validar que elementos sao do mesmo dominio
- Validar diversidade (elementos muito similares geram construtos triviais)
- Validar que especialista reconhece e tem experiencia com todos

1.2. **Se elementos precisam ser elicitados:**

Kelly pede ao especialista para listar instancias concretas do dominio:

**Para dominio "Marketing Digital":**
- "Me liste 6-9 campanhas de marketing que voce ja fez ou acompanhou de perto. Podem ser suas ou de outros."
- "Inclua pelo menos uma que voce considera excelente, uma mediocre e uma ruim."
- "Inclua campanhas de tipos diferentes se possivel."

**Para dominio "Lideranca de Equipes":**
- "Me liste 6-9 lideres que voce conhece pessoalmente ou admira. Inclua variedade."
- "Inclua pelo menos um que voce considera excepcional e um que voce nao admira."

**Para dominio generico:**
- "Me de 6-9 exemplos concretos de [dominio] que voce conhece bem."
- "Quanto mais variados, melhor — inclua bons, medios e ruins."

1.3. **Validacao de elementos:**

| Criterio | Minimo | Ideal |
|----------|--------|-------|
| Quantidade | 3 (mini) / 6 (standard) / 9 (deep) | 9-12 |
| Diversidade | Pelo menos 2 visivelmente diferentes | Alto spread |
| Familiaridade | Especialista conhece todos | Experiencia direta com todos |
| Concretude | Instancias especificas, nao categorias | Nomeados e datados |

1.4. **Registrar elementos:**

```yaml
elements:
  - id: E1
    name: "Campanha Black Friday 2024"
    description: "Campanha de performance para e-commerce de moda"
    source: "elicited"

  - id: E2
    name: "Lancamento do curso online"
    description: "Campanha organica + paga para lancamento de infoproduto"
    source: "elicited"

  # ... ate E9/E12
```

**Checkpoint:** Elementos selecionados e validados. Pronto para triads.

---

### Step 2: Triad Elicitation — Extrair Construtos (Nucleo da Sessao)

**Executor:** kelly

Este e o CORACAO da sessao. Kelly apresenta triads (3 elementos) e guia a comparacao.

2.1. **Selecao de triads:**

Kelly seleciona triads para maximizar diversidade de construtos:

**Estrategia de selecao:**
- Triad 1: Elementos visivelmente diversos (maximiza construtos iniciais)
- Triads 2-3: Mistura de similar + diferente (refina construtos)
- Triads 4+: Elementos que compartilham construtos com outros (teste de consistencia)
- Nunca repetir a mesma triad
- Cada elemento deve aparecer em pelo menos 2 triads

```yaml
triad_plan:
  - triad_id: T1
    elements: [E1, E4, E7]
    strategy: "maximum_spread"

  - triad_id: T2
    elements: [E2, E3, E5]
    strategy: "similarity_test"

  # ...
```

2.2. **Apresentacao da triad (Kelly facilita):**

Kelly apresenta a triad ao especialista com voz calorosa e acessivel:

> "Agora vou te mostrar tres coisas. Olha so:
>
> 1. **Campanha Black Friday 2024** (E1)
> 2. **Lancamento do curso online** (E2)
> 3. **Campanha de rebranding** (E5)
>
> Me diz: **quais duas sao mais parecidas entre si?** Pode ser por qualquer criterio — nao tem resposta certa."

2.3. **Extracao do construto:**

Quando o especialista identifica os dois similares, Kelly extrai o construto:

> **Especialista:** "E1 e E5 sao mais parecidas — as duas sao focadas em conversao."
>
> **Kelly:** "Entendi! Entao E1 e E5 compartilham algo: foco em conversao. E como E2 e diferente nesse aspecto?"
>
> **Especialista:** "E2 era mais sobre awareness, construcao de marca."
>
> **Kelly:** "Perfeito! Entao temos uma dimensao: **Foco em conversao** vs **Foco em awareness**. E se eu te pedisse para dar uma nota de 1 a 5 para cada uma, onde 1 = totalmente focada em conversao e 5 = totalmente focada em awareness, como ficaria?"

2.4. **Registro do construto:**

```yaml
construct:
  id: C1
  triad: T1
  pole_emergent: "Foco em conversao"
  pole_implicit: "Foco em awareness"
  similar_elements: [E1, E5]
  contrast_element: E2
  elicitation_method: "triad_comparison"

  ratings:
    E1: 1
    E2: 5
    E3: 3  # Preenchido apos rating
    E4: 2
    E5: 1
    E6: 4

  notes: "Especialista usou 'conversao' sem hesitar — conceito central no vocabulario"
```

2.5. **Repetir para cada triad:**

Para formato **mini**: 1 triad → 2-3 construtos
Para formato **standard**: 4-5 triads → 8-12 construtos
Para formato **deep**: 6-8 triads → 12-20 construtos

**Tecnicas adicionais de elicitacao (se necessario):**

- **Full context form:** "Em que aspecto dois desses tres sao parecidos que os diferencia do terceiro?"
- **Opposite pole:** "Voce disse 'estrategico'. Qual seria o oposto nesse contexto? (pode nao ser 'tatico')"
- **Difference method:** "Como E3 e diferente de E1?" (sem necessidade de triad completa)
- **Self-identification:** "Se voce fosse um desses elementos, qual seria e por que?"

**Checkpoint:** Construtos extraidos conforme formato.

---

### Step 3: Rating Collection — Preencher a Grid (3-8 min)

**Executor:** kelly

Apos extrair os construtos, Kelly pede ao especialista para avaliar TODOS os elementos em CADA construto.

3.1. **Apresentacao para rating:**

> "Agora vou pedir para voce dar notas. Para o construto 'Foco em conversao (1) vs Foco em awareness (5)', onde voce colocaria cada elemento?
>
> - E1: Campanha Black Friday 2024?
> - E2: Lancamento do curso online?
> - E3: Campanha Google Ads sempre-verde?
> - ..."

3.2. **Escala de rating:**

```yaml
rating_scale:
  range: [1, 5]
  pole_1: "polo_emergente"  # O que os dois similares compartilham
  pole_5: "polo_implicito"  # O que o terceiro representa
  midpoint: 3               # Neutro / nao se aplica
```

3.3. **Validacao de ratings:**

- Nenhuma celula vazia (todos elementos avaliados em todos construtos)
- Ratings consistentes com a elicitacao (elemento similar com rating perto do polo emergente)
- Variacao suficiente (construto com todos os ratings iguais = construto ruim)
- Se rating parece inconsistente, Kelly verifica gentilmente:
  > "Voce disse que E3 e um 4 em 'Foco em awareness', mas antes tinha mencionado que E3 era bem focado em conversao. Pode me ajudar a entender?"

3.4. **Construcao da grid matrix:**

```yaml
grid_matrix:
  elements: [E1, E2, E3, E4, E5, E6]
  constructs:
    - id: C1
      pole_left: "Foco em conversao"
      pole_right: "Foco em awareness"
      ratings: [1, 5, 3, 2, 1, 4]

    - id: C2
      pole_left: "Budget alto"
      pole_right: "Budget baixo"
      ratings: [5, 3, 2, 4, 1, 2]

    - id: C3
      pole_left: "Resultado previsivel"
      pole_right: "Resultado incerto"
      ratings: [2, 4, 1, 3, 5, 4]

    # ...
```

**Checkpoint:** Grid matrix completa — todas as celulas preenchidas.

---

### Step 4: Analise da Grid (5-10 min)

**Executor:** kelly

4.1. **Calculo de correlacoes entre construtos:**

Construtos altamente correlacionados (positiva ou negativamente) revelam estruturas de pensamento conectadas:

```yaml
construct_correlations:
  - pair: [C1, C3]
    correlation: -0.82
    interpretation: >
      'Foco em conversao' tende a co-ocorrer com 'Resultado previsivel'.
      O especialista associa conversao direta com previsibilidade.

  - pair: [C2, C4]
    correlation: 0.91
    interpretation: >
      'Budget alto' e 'Escala grande' sao quase o mesmo construto para
      este especialista. Possivel construto redundante.
```

4.2. **Clustering de construtos:**

Agrupar construtos em clusters baseados em correlacao:

```yaml
construct_clusters:
  - cluster_id: CL1
    name: "Performance & Control"
    constructs: [C1, C3, C5]
    core_theme: "O especialista agrupa mentalmente campanhas pelo grau de controle sobre resultados"
    interpretation: >
      Este cluster revela uma dimensao fundamental de como o especialista
      pensa: controle vs. incerteza. Campanhas de conversao sao 'controlaveis'
      na mente dele, campanhas de awareness sao 'incertas'.

  - cluster_id: CL2
    name: "Investment & Scale"
    constructs: [C2, C4]
    core_theme: "Budget e escala sao praticamente sinonimos"
```

4.3. **Identificacao de construtos CORE vs PERIPHERAL:**

- **Core constructs:** Alta correlacao com muitos outros, aparecem em multiplos clusters. Estes sao os FUNDAMENTOS do pensamento do especialista.
- **Peripheral constructs:** Baixa correlacao, unicos. Podem ser insights valiosos ou construtos superficiais.

```yaml
construct_hierarchy:
  core:
    - id: C1
      importance: "CORE"
      reason: "Correlaciona com 4 outros construtos. Dimensao fundamental."
      correlations_count: 4
      average_correlation: 0.72

  peripheral:
    - id: C6
      importance: "PERIPHERAL"
      reason: "Baixa correlacao com outros. Pode ser insight unico ou superficial."
      correlations_count: 1
      average_correlation: 0.31
```

4.4. **Analise de elementos (como o especialista vê cada elemento):**

```yaml
element_profiles:
  - element: E1
    construct_profile: "Alta conversao, alto budget, resultado previsivel"
    cluster_alignment: "CL1 + CL2 (Performance & Control + Investment)"
    interpretation: "O especialista ve Black Friday como o arquetipo de campanha controlavel e cara"

  - element: E2
    construct_profile: "Awareness, budget medio, resultado incerto"
    cluster_alignment: "Oposto de CL1"
    interpretation: "Lancamento de curso e visto como aposta — alto potencial mas incerto"
```

**Checkpoint:** Analise estatistica basica completa. Correlacoes, clusters e hierarquia calculados.

---

### Step 5: Laddering — Aprofundar Construtos (5-10 min, se formato standard ou deep)

**Executor:** kelly

Laddering e a tecnica de Kelly para subir ou descer na hierarquia de significado de um construto.

5.1. **Laddering UP (Why questions — subir para valores):**

> "Voce disse 'Foco em conversao vs Foco em awareness'. Por que 'foco em conversao' e importante para voce? O que acontece quando uma campanha e focada em conversao?"
>
> **Especialista:** "Porque assim eu tenho controle sobre o ROI."
>
> **Kelly:** "E por que ter controle sobre o ROI e importante?"
>
> **Especialista:** "Porque consigo provar o valor do que faco para o cliente."
>
> **Kelly:** "Entao no fundo, 'foco em conversao' se conecta com 'prova de valor'. Interessante!"

```yaml
ladder:
  construct_id: C1
  direction: "up"
  chain:
    - level: 0
      construct: "Foco em conversao vs Foco em awareness"
    - level: 1
      construct: "Controle sobre ROI vs Incerteza de retorno"
      trigger_question: "Por que foco em conversao e importante?"
    - level: 2
      construct: "Prova de valor vs Dependencia de fe"
      trigger_question: "Por que controle sobre ROI importa?"
    - level: 3
      construct: "Seguranca profissional vs Vulnerabilidade"
      trigger_question: "Por que provar valor e essencial?"
      notes: "Nivel de valor pessoal atingido — parar laddering up"
```

5.2. **Laddering DOWN (How questions — descer para comportamentos):**

> "Quando voce diz 'foco em conversao', como EXATAMENTE voce implementa isso? O que voce faz diferente em uma campanha focada em conversao?"
>
> **Especialista:** "Começo pelo pixel de conversao antes de qualquer criativo."
>
> **Kelly:** "E o que mais?"
>
> **Especialista:** "Defino o CPA maximo aceitavel antes de gastar um centavo."

```yaml
ladder:
  construct_id: C1
  direction: "down"
  chain:
    - level: 0
      construct: "Foco em conversao vs Foco em awareness"
    - level: -1
      behavior: "Comecar pelo pixel de conversao"
      trigger_question: "Como voce implementa foco em conversao?"
    - level: -2
      behavior: "Definir CPA maximo antes de comecar"
      trigger_question: "Que mais faz antes de gastar?"
    - level: -3
      behavior: "Testar 3 criativos minimos com budget de validacao"
      trigger_question: "E depois do CPA?"
```

5.3. **Selecao de construtos para laddering:**

- **Sempre ladder construtos core:** Sao os mais importantes
- **Ladder up para valores:** Revela motivacoes profundas
- **Ladder down para acoes:** Revela procedimentos tacitos
- **Mini format:** 0-1 laddering
- **Standard format:** 2-3 ladderings (up + down nos cores)
- **Deep format:** 4-6 ladderings (up + down em todos os cores + peripherals interessantes)

**Checkpoint:** Laddering completo para construtos selecionados.

---

### Step 6: Wrap-Up e Output Generation (3-5 min)

**Executor:** kelly

6.1. **Compilar {session-id}-grid.yaml:**

```yaml
repertory_grid:
  metadata:
    session_id: "QA-{slug}-{timestamp}"
    task_id: "TK-RM-003"
    domain: "{dominio}"
    format: "{mini | standard | deep}"
    specialist_name: "{nome}"
    date: "2026-02-18T15:00:00Z"
    duration_minutes: 18
    facilitator_agent: "kelly"
    rating_scale: [1, 5]

  elements:
    - {id: E1, name: "...", description: "..."}
    # ...

  constructs:
    - id: C1
      pole_emergent: "Foco em conversao"
      pole_implicit: "Foco em awareness"
      ratings: [1, 5, 3, 2, 1, 4]
      elicitation_triad: T1
      laddering:
        up: ["Controle sobre ROI", "Prova de valor", "Seguranca profissional"]
        down: ["Pixel primeiro", "CPA maximo", "Budget de validacao"]
    # ...

  analysis:
    correlations:
      - pair: [C1, C3]
        value: -0.82
    clusters:
      - id: CL1
        name: "Performance & Control"
        constructs: [C1, C3, C5]
    construct_hierarchy:
      core: [C1, C3]
      peripheral: [C6]

  stats:
    total_elements: 6
    total_constructs: 10
    total_triads: 5
    total_ladderings: 3
    grid_completion: 1.0  # Percentual de celulas preenchidas
    average_construct_correlation: 0.45
```

6.2. **Compilar {session-id}-constructs.yaml:**

```yaml
constructs:
  - id: C1
    pole_emergent: "Foco em conversao"
    pole_implicit: "Foco em awareness"
    domain: "marketing digital"
    importance: "CORE"
    correlations:
      positive: [C5]
      negative: [C3]
    laddering_up: ["Controle ROI", "Prova de valor", "Seguranca profissional"]
    laddering_down: ["Pixel primeiro", "CPA maximo", "Budget validacao"]
    implication_level: "superordinate"  # superordinate | mid-level | subordinate
    knowledge_type: "tacit"   # Polanyi classification if available
    novelty: "medium"
    notes: "Construto central no pensamento do especialista sobre campanhas"

  # ... todos os construtos com analise detalhada
```

6.3. **Compilar {session-id}-session-log.md:**

```markdown
# Session Log: {session-id}

## Parametros
- **Dominio:** {dominio}
- **Formato:** {formato}
- **Duracao real:** {minutos} min
- **Construtos extraidos:** N

## Fluxo da Sessao
[Narrativa cronologica: quais triads foram apresentadas, como o especialista
reagiu, momentos de insight, dificuldades]

## Observacoes de Kelly
- [Padrao 1 observado no comportamento do especialista]
- [Padrao 2]
- [Dificuldades encontradas]

## Construtos Mais Reveladores
1. [Construto X — por que e interessante]
2. [Construto Y — por que e interessante]

## Recomendacoes para Proxima Sessao
- [Expandir dominio Z]
- [Aprofundar construto W via laddering]
```

**Checkpoint:** Todos os outputs gerados.

---

### Step 7: Validacao (2-3 min)

**Executor:** kelly

7.1. **Checklist de auto-validacao:**

- [ ] Numero minimo de construtos atingido (mini: 2, standard: 8, deep: 12)
- [ ] Cada construto tem dois polos (emergente e implicito)
- [ ] Nenhum construto tautologico ("bom vs ruim" sem especificidade)
- [ ] Todos os ratings preenchidos (grid completa)
- [ ] Construtos nao sao meras inversoes ("caro vs barato" = ok se contextualizados)
- [ ] Laddering aplicado aos construtos core
- [ ] Correlacoes calculadas
- [ ] Clusters identificados
- [ ] Core vs peripheral constructs classificados
- [ ] Grid YAML valido e parseavel
- [ ] Session log reflete o fluxo real

7.2. **Quality checks:**

| Check | Expectativa | Se Falhar |
|-------|-----------|-----------|
| Diversidade de construtos | >= 3 temas diferentes | Triads muito similares — diversificar |
| Laddering depth | >= 2 niveis up OU down | Especialista resistindo — mudar approach |
| Grid sparsity | 0% celulas vazias | Pedir ratings faltantes |
| Tautologia | 0 construtos tautologicos | Reformular com especialista |

**Checkpoint:** Sessao validada. Output pronto para TK-RM-004 (build-repertory-grid).

---

## Outputs

### Primary Output 1: Repertory Grid

**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/sessions/{session-id}-grid.yaml`
**Content:** Grid matrix completa com elementos, construtos, ratings, correlacoes e clusters. Consumida por TK-RM-004 (build-repertory-grid) para analise estatistica aprofundada.

### Primary Output 2: Extracted Constructs

**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/sessions/{session-id}-constructs.yaml`
**Content:** Lista de construtos com polos, laddering, importancia e classificacao. Consumida por nonaka (SECI), leonard (Deep Smarts), e forte (organizacao PARA).

### Secondary Output: Session Log

**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/sessions/{session-id}-session-log.md`
**Content:** Narrativa da sessao para referencia e auditoria. Inclui observacoes de Kelly sobre o especialista.

---

## Validation

### Checklist

- [ ] Dominio definido e validado
- [ ] Formato selecionado e parametros configurados
- [ ] Elementos selecionados com diversidade adequada
- [ ] Triads apresentadas conforme estrategia de selecao
- [ ] Construtos extraidos com polos bipolares
- [ ] Ratings coletados para todos os elementos em todos os construtos
- [ ] Laddering aplicado (up e/ou down) nos construtos core
- [ ] Correlacoes entre construtos calculadas
- [ ] Clusters identificados e nomeados
- [ ] Core vs peripheral constructs classificados
- [ ] Grid YAML gerado e valido
- [ ] Constructs YAML gerado e valido
- [ ] Session log gerado com observacoes
- [ ] Nenhum construto tautologico
- [ ] Sessao dentro do tempo-alvo

### Success Criteria

**Threshold: 12/15 no checklist acima**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Construct yield** | 150%+ do target | 100% do target | < 100% do target |
| **Construct depth** | Laddering 3+ niveis | Laddering 2 niveis | Sem laddering |
| **Grid completeness** | 100% celulas + correlacoes | 100% celulas | Celulas vazias |
| **Construct quality** | Todos bipolares, nenhum tautologico | 90% bipolares | Tautologicos presentes |
| **Session flow** | Natural, baixa friccao | Alguma resistencia | Especialista desconfortavel |
| **Insight depth** | Revela como o especialista pensa | Mix de trivial e profundo | Maioria trivial |

---

## Estimated Effort

| Component | Mini | Standard | Deep |
|-----------|------|----------|------|
| **Pre-session setup** | 1 min | 2-3 min | 3-5 min |
| **Element selection** | 1 min | 2-4 min | 4-6 min |
| **Triad elicitation** | 2 min | 6-10 min | 12-18 min |
| **Rating collection** | 1 min | 3-5 min | 5-8 min |
| **Analysis** | 1 min | 3-5 min | 5-10 min |
| **Laddering** | 0 min | 3-5 min | 5-10 min |
| **Output generation** | 1 min | 2-3 min | 3-5 min |
| **Validation** | 1 min | 2-3 min | 2-3 min |
| **Total** | ~7 min | ~23-38 min | ~39-65 min |

---

## Integration

### Feeds To

- **TK-RM-004:** build-repertory-grid — Compila multiplas sessoes em grid completo
- **TK-RM-006:** convert-seci — Construtos como input para conversao SECI
- **TK-RM-005:** map-deep-smarts — Construtos core sao candidatos a Deep Smarts

### Depends On

- **TK-RM-001:** diagnose-repertoire (recomendado) — Calibra sessao
- **Input:** Especialista disponivel (sessao interativa obrigatoria)

### Agent Routing

**Primary Agent:** kelly (facilitador RepGrid)
**Quality Review:** repertoire-chief (valida qualidade dos construtos)

---

## Notes for Executor

### Quando o Especialista diz "nao sei comparar"

Normal — acontece quando os elementos sao de categorias muito diferentes na mente dele. Kelly reformula: "Tudo bem! Pode ser qualquer aspecto — tamanho, complexidade, o que voce sentiu ao fazer, o resultado... O que vier a mente primeiro e valido."

### Quando os construtos sao todos "bom vs ruim"

Isso indica que o especialista esta avaliando em vez de descrevendo. Kelly redireciona: "Em vez de pensar em melhor ou pior, pense em como sao DIFERENTES. Tipo diferentes sabores, nao melhor ou pior."

### A Magia do "Qual e o oposto?"

Perguntar pelo polo oposto frequentemente revela mais que o polo emergente. Se alguem diz "esse e mais escalavel", perguntar "qual seria o oposto de escalavel aqui?" pode gerar "artesanal" ou "dependente de mim" — cada resposta revela algo diferente sobre o pensamento do especialista.

### Construtos Superordenados

Os construtos que emergem no topo do laddering-up sao os VALORES do especialista. "Seguranca profissional", "autonomia", "impacto" — esses construtos superordenados explicam TODOS os outros. Sao o mapa dos valores.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
