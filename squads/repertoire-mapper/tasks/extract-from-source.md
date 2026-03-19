---
id: TK-RM-002
name: Extract From Source
version: 1.0.0
executor: klein
purpose: >
  Extrair itens de repertorio de uma fonte digital (livro, video, transcricao,
  post, artigo, podcast, live) usando Passive CDM — a variacao do Critical
  Decision Method adaptada para analise de artefatos quando o especialista nao
  esta presente para entrevista direta.

inputs:
  - name: source_content
    type: file
    description: >
      O conteudo da fonte a ser processada. Pode ser transcript de video,
      texto de livro/capitulo, post de blog, thread de rede social, ou
      qualquer artefato textual do especialista.
    required: true
    formats: ["markdown", "text", "yaml", "json"]

  - name: source_metadata
    type: object
    description: >
      Metadados da fonte para contextualizar a extracao.
    required: true
    schema:
      title: string
      type: enum[book, video, transcript, post, article, podcast, live, thread, course]
      author: string
      date: string
      duration_minutes: integer (if applicable)
      url: string (if applicable)
      domain: string
      language: string

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001 (diagnose-repertoire). Contem classificacao Polanyi
      e Collins por dominio. Usado para calibrar a extracao.
    required: false
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: prior_extractions
    type: list[file]
    description: >
      Extracoes anteriores do mesmo especialista. Usadas para evitar
      duplicatas e para cross-referencing.
    required: false

  - name: extraction_focus
    type: list[string]
    description: >
      Dominios ou temas especificos para focar. Se nao fornecido, extrai tudo.
    required: false

preconditions:
  - "Fonte de conteudo acessivel e legivel"
  - "Metadados da fonte preenchidos"
  - "Agente klein acessivel e configurado"
  - "Diagnostico TK-RM-001 completo (recomendado, nao obrigatorio)"
  - "Qualidade da fonte verificada (transcricao legivel, texto nao corrompido)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/extractions/{source-slug}-items.yaml"
    description: >
      Lista de itens de repertorio extraidos em formato YAML estruturado.
      Cada item inclui tipo CDM, evidencia, confianca e classificacao.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/extractions/{source-slug}-extraction-log.yaml"
    description: >
      Log detalhado do processo de extracao — decisoes, itens rejeitados,
      notas do agente.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/extractions/{source-slug}-summary.md"
    description: >
      Resumo narrativo da extracao — achados principais, padroes observados,
      qualidade da fonte.
    format: markdown

validation:
  success_criteria:
    - "Minimo 5 itens de repertorio extraidos por hora de conteudo (ou equivalente)"
    - "Cada item possui tipo CDM classificado (decision, pattern, mental_model, rule, cue, anomaly)"
    - "Cada item possui evidencia direta da fonte (citacao)"
    - "Cada item possui score de confianca (0.0-1.0)"
    - "Nenhum item duplica extracao anterior (se prior_extractions fornecidas)"
    - "Itens classificados por dominio do diagnostico (se diagnosis_data fornecida)"
    - "Summary gerado com estatisticas e observacoes"
  quality_threshold: "6/7 criterios acima"
---

# Task: Extract From Source

**Task ID:** TK-RM-002
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

Esta task aplica o Critical Decision Method (CDM) de Gary Klein em modo "passivo" — analisando artefatos textuais do especialista ao inves de entrevista-lo diretamente. A fonte (livro, video, transcricao, post) e escaneada para extrair seis tipos de itens de repertorio: decisoes, padroes, modelos mentais, regras, pistas (cues) e anomalias.

O CDM passivo e especialmente valioso quando:
- O especialista nao esta disponivel para entrevista direta
- Existe grande volume de conteudo ja produzido (livros, videos, posts)
- Queremos calibrar ANTES de uma sessao interativa (saber o que ja sabemos)
- A fonte e de um especialista externo (autor, palestrante) que nao participa do mapeamento

**Workflow Position:** Task 2 no pipeline — executa apos diagnostico (TK-RM-001) ou em paralelo para fontes iniciais
**Success Definition:** 5+ itens de repertorio de alta qualidade por hora de conteudo
**Output Quality Gate:** QG-003 (Minimo 10 itens extraidos com evidencia)

---

## Purpose

Todo especialista produz artefatos que contem conhecimento tacito embutido — mesmo quando o objetivo do artefato e comunicar conhecimento explicito. Um livro de negocios transmite frameworks explicitos, mas as historias que o autor conta, as metaforas que escolhe, as comparacoes que faz e os exemplos que seleciona revelam seu conhecimento tacito.

Klein descobriu que a melhor forma de acessar conhecimento tacito nao e perguntar "o que voce sabe?" — e reconstruir incidentes onde o conhecimento foi USADO. No modo passivo, em vez de pedir ao especialista para narrar incidentes, procuramos por eles no conteudo ja produzido.

**Seis tipos de itens CDM que esta task extrai:**

1. **Decisions (Decisoes):** Momentos onde o especialista escolheu um caminho e explicou (ou implicou) por que
2. **Patterns (Padroes):** Regularidades que o especialista reconhece — "sempre que vejo X, acontece Y"
3. **Mental Models (Modelos Mentais):** Representacoes simplificadas de como algo funciona
4. **Rules (Regras):** Heuristicas explicitas ou implicitas — "nunca faca X sem antes Y"
5. **Cues (Pistas):** Sinais que o especialista monitora — o que ele presta atencao
6. **Anomalies (Anomalias):** Situacoes que violaram expectativas do especialista

---

## Executor Type

**Agent (100% klein)**

- **Agent Role:** CDM passivo — escanear, identificar, extrair, classificar, pontuar
- **Human Role:** Nenhum durante extracao (humano valida em etapa separada)
- **Estimated Runtime:** 15-60 min dependendo do tamanho da fonte

---

## Steps

### Step 1: Source Analysis e Contextualizacao (3-5 min)

**Executor:** klein

1.1. **Ler conteudo completo da fonte** (NUNCA leitura parcial):
- Processar integralmente o `source_content`
- Identificar o tipo de discurso (narrativo, prescritivo, analitico, tutorial, conversacional)
- Estimar densidade de conhecimento tacito (alto em narrativas, medio em analises, baixo em tutoriais)

1.2. **Processar metadados:**
- Quem e o autor/especialista?
- Qual o dominio?
- Qual o formato original? (formato influencia onde o tacito aparece)
- Quando foi produzido? (contexto temporal importa)

1.3. **Carregar diagnostico** (se `diagnosis_data` disponivel):
- Identificar niveis de expertise do especialista por dominio
- Calibrar expectativa de extracao (contributory = mais itens tacitos, interactional = mais itens explicitos)
- Mapear tipos de tacit knowledge esperados (somatic, relational, collective)

1.4. **Carregar extracoes anteriores** (se `prior_extractions` disponivel):
- Indexar itens ja extraidos para evitar duplicatas
- Identificar padroes recorrentes (reforco de confianca)
- Notar evolucao de pensamento (se fonte anterior vs mais recente)

1.5. **Definir extraction context:**

```yaml
extraction_context:
  source_title: "{titulo da fonte}"
  source_type: "{tipo}"
  specialist_name: "{nome do especialista}"
  specialist_domain: "{dominio primario}"
  discourse_type: "{narrativo | prescritivo | analitico | tutorial | conversacional}"
  estimated_density: "{high | medium | low}"
  focus_areas: "{extraction_focus ou 'all'}"
  prior_items_count: N
  calibrated_by_diagnosis: true/false
```

**Checkpoint:** Contexto de extracao construido. Pronto para CDM scan.

---

### Step 2: CDM Scanning — Primeira Passagem (8-15 min)

**Executor:** klein

Primeira leitura analitica da fonte, marcando TODOS os segmentos que contem potenciais itens de repertorio.

2.1. **Scan de Decisions (Decisoes):**

Procurar por passagens onde o especialista:
- Fez uma escolha e explica/implica o racional
- Comparou alternativas (mesmo implicitamente)
- Rejeitou uma opcao e explicou por que
- Tomou uma decisao rapida (indicador de RPD — reconhecimento, nao analise)

**Indicadores linguisticos:**
- "Eu decidi...", "Escolhi...", "Optei por..."
- "A razao de usar X em vez de Y..."
- "Nao faz sentido fazer X quando..."
- "O que funciona melhor e..."

2.2. **Scan de Patterns (Padroes):**

Procurar por regularidades que o especialista observou:
- Correlacoes mencionadas (X tende a causar Y)
- Sequencias tipicas (primeiro acontece X, depois Y)
- Tipologias (existem dois/tres tipos de...)
- Frequencias (em 80% dos casos...)

**Indicadores linguisticos:**
- "Sempre que...", "Na maioria dos casos..."
- "O padrao que vejo e..."
- "Existem basicamente dois tipos de..."
- "Geralmente isso acontece porque..."
- "Em X anos fazendo isso, aprendi que..."

2.3. **Scan de Mental Models (Modelos Mentais):**

Procurar por representacoes simplificadas:
- Analogias e metaforas (X e como Y)
- Frameworks conceituais (o modelo de 3 pilares, o funil de...)
- Mapas causais (A causa B que causa C)
- Hierarquias (mais importante que, antes de)

**Indicadores linguisticos:**
- "Pense em X como se fosse..."
- "Funciona como um..."
- "O modelo que uso e..."
- "Imagine que...", "A analogia e..."
- "Tem tres camadas nesse problema..."

2.4. **Scan de Rules (Regras):**

Procurar por heuristicas prescritivas:
- Regras de ouro
- Anti-patterns (o que NAO fazer)
- Pre-condicoes (antes de fazer X, sempre Y)
- Thresholds (quando X passa de Y, entao Z)

**Indicadores linguisticos:**
- "Nunca faca X sem..."
- "A regra e simples: ..."
- "Se X > Y, entao..."
- "O erro que todo mundo comete e..."
- "A primeira coisa a verificar e..."

2.5. **Scan de Cues (Pistas):**

Procurar por sinais que o especialista monitora:
- Metricas que observa
- Sinais de alerta
- Indicadores de qualidade
- Triggers de acao

**Indicadores linguisticos:**
- "O que eu olho primeiro e..."
- "O sinal de que algo esta errado e..."
- "Quando voce ve X, significa que..."
- "Preste atencao em..."
- "O indicador mais importante e..."

2.6. **Scan de Anomalies (Anomalias):**

Procurar por situacoes que surpreenderam o especialista:
- Expectativas violadas
- Resultados contra-intuitivos
- Excecoes a regras
- Momentos "eureka"

**Indicadores linguisticos:**
- "O que me surpreendeu foi..."
- "Contra toda logica..."
- "Eu esperava X, mas..."
- "A excecao a essa regra e..."
- "O que ninguem te conta e..."

2.7. **Registrar segmentos identificados:**

```yaml
raw_segments:
  - id: "SEG-001"
    text: "Texto exato do segmento..."
    location: "Capitulo 3, pagina 42" # ou timestamp, ou paragrafo
    cdm_type_candidates: ["decision", "rule"]
    signal_strength: "high"   # high | medium | low
    topic: "estrategia de precificacao"
```

**Checkpoint:** Todos os segmentos marcados. Expectativa: 15-50 segmentos por hora de conteudo.

---

### Step 3: CDM Deep Extraction — Item-a-Item (15-25 min)

**Executor:** klein

Para CADA segmento identificado, aplicar extracao profunda CDM:

3.1. **Classificacao CDM final:**

Determinar o tipo CDM primario do segmento. Um segmento pode conter multiplos tipos — extrair cada um como item separado.

3.2. **Template de extracao por tipo:**

#### Decision Item:
```yaml
item:
  id: "RI-{source-slug}-001"
  type: "decision"
  segment_id: "SEG-001"

  content:
    situation: "Contexto da decisao — o que estava acontecendo"
    decision: "O que o especialista decidiu fazer"
    alternatives_considered: ["Alternativa A", "Alternativa B"]
    rationale: "Por que escolheu essa opcao"
    rationale_explicit: true  # O racional foi declarado ou inferido?
    outcome: "Resultado da decisao (se mencionado)"

  rpd_analysis:
    cues_noticed: "Que sinais motivaram a decisao?"
    pattern_matched: "Que padrao o especialista reconheceu?"
    mental_simulation: "O especialista simulou mentalmente o resultado?"
    action_script: "Qual foi a sequencia de acoes?"

  evidence:
    primary_quote: "Citacao direta da fonte"
    location: "Capitulo/timestamp/paragrafo"
    supporting_quotes: []

  classification:
    domain: "precificacao"
    knowledge_type: "tacit"       # tacit | explicit | mixed
    collins_tacit_type: "somatic"  # relational | somatic | collective
    novelty: "high"               # high | medium | low
    actionability: "high"         # high | medium | low

  confidence: 0.85
```

#### Pattern Item:
```yaml
item:
  id: "RI-{source-slug}-002"
  type: "pattern"
  segment_id: "SEG-003"

  content:
    pattern_name: "Nome descritivo do padrao"
    description: "Descricao do padrao observado"
    conditions: "Em que condicoes o padrao se manifesta"
    frequency: "Com que frequencia o especialista observa"
    exceptions: "Excecoes conhecidas ao padrao"

  evidence:
    primary_quote: "Citacao direta"
    location: "Localizacao na fonte"
    supporting_quotes: []

  classification:
    domain: "marketing digital"
    knowledge_type: "tacit"
    novelty: "medium"
    actionability: "high"

  confidence: 0.75
```

#### Mental Model Item:
```yaml
item:
  id: "RI-{source-slug}-003"
  type: "mental_model"
  segment_id: "SEG-005"

  content:
    model_name: "Nome do modelo mental"
    description: "Como o modelo funciona"
    components: ["Componente A", "Componente B", "Componente C"]
    relationships: "Como os componentes se relacionam"
    metaphor_used: "Metafora original se usada"
    scope: "Em que dominios o modelo se aplica"
    limitations: "Quando o modelo falha"

  evidence:
    primary_quote: "Citacao direta"
    location: "Localizacao na fonte"

  classification:
    domain: "gestao de equipes"
    knowledge_type: "mixed"
    novelty: "high"
    actionability: "medium"

  confidence: 0.80
```

#### Rule Item:
```yaml
item:
  id: "RI-{source-slug}-004"
  type: "rule"
  segment_id: "SEG-007"

  content:
    rule_statement: "Formulacao da regra (when X, do/avoid Y)"
    condition: "Quando a regra se aplica"
    action: "O que fazer (ou nao fazer)"
    rationale: "Por que a regra existe"
    exceptions: "Excecoes conhecidas"
    strength: "absolute | strong | moderate | weak"

  evidence:
    primary_quote: "Citacao direta"
    location: "Localizacao na fonte"

  classification:
    domain: "vendas"
    knowledge_type: "explicit"
    novelty: "medium"
    actionability: "high"

  confidence: 0.90
```

#### Cue Item:
```yaml
item:
  id: "RI-{source-slug}-005"
  type: "cue"
  segment_id: "SEG-009"

  content:
    cue_description: "O que o especialista monitora"
    what_it_indicates: "O que esse sinal significa"
    action_triggered: "Que acao esse sinal dispara"
    threshold: "Quando o sinal se torna relevante (se quantificavel)"
    reliability: "Quao confiavel e o sinal"

  evidence:
    primary_quote: "Citacao direta"
    location: "Localizacao na fonte"

  classification:
    domain: "analytics"
    knowledge_type: "tacit"
    novelty: "high"
    actionability: "high"

  confidence: 0.70
```

#### Anomaly Item:
```yaml
item:
  id: "RI-{source-slug}-006"
  type: "anomaly"
  segment_id: "SEG-011"

  content:
    expectation: "O que o especialista esperava"
    reality: "O que realmente aconteceu"
    explanation: "Como o especialista explica a discrepancia"
    lesson: "Licao aprendida com a anomalia"
    updated_model: "Como isso mudou o modelo mental do especialista"

  evidence:
    primary_quote: "Citacao direta"
    location: "Localizacao na fonte"

  classification:
    domain: "growth hacking"
    knowledge_type: "tacit"
    novelty: "high"
    actionability: "medium"

  confidence: 0.75
```

3.3. **Regras de extracao:**

- Cada item DEVE ter citacao direta da fonte (nao inferencia pura)
- Se o racional nao e explicito, marcar `rationale_explicit: false`
- Se um segmento gera multiplos itens, criar IDs separados
- Cross-reference com itens anteriores: se pattern + cue estao relacionados, documentar
- Confidence >= 0.5 para inclusao. Abaixo de 0.5, registrar no log mas nao incluir no output

**Checkpoint:** Todos os itens extraidos e classificados.

---

### Step 4: Classificacao e Cross-Reference (5-8 min)

**Executor:** klein

4.1. **Classificacao por dominio:**

Agrupar itens extraidos por dominio do diagnostico (se `diagnosis_data` disponivel) ou por topico inferido.

4.2. **Cross-reference com extracoes anteriores:**

Se `prior_extractions` fornecidas:
- Identificar duplicatas (mesmo item, mesma formulacao)
- Identificar reforcos (mesmo conceito, formulacao diferente — aumenta confianca)
- Identificar contradicoes (regras ou padroes conflitantes — documentar ambos)
- Identificar evolucao (mesma ideia mas atualizada)

```yaml
cross_references:
  - item_id: "RI-livro-001"
    related_to: "RI-video-003"
    relationship: "reinforces"  # reinforces | contradicts | evolves | duplicates
    notes: "Mesmo padrao descrito em dois contextos diferentes — confianca aumentada"
```

4.3. **Calculo de estatisticas:**

```yaml
extraction_stats:
  source: "{titulo da fonte}"
  source_type: "{tipo}"
  total_segments_identified: 35
  total_items_extracted: 22
  items_by_type:
    decisions: 5
    patterns: 6
    mental_models: 3
    rules: 4
    cues: 3
    anomalies: 1
  items_by_domain:
    marketing_digital: 12
    copywriting: 7
    gestao: 3
  confidence_distribution:
    high (>= 0.8): 8
    medium (0.6-0.79): 10
    low (0.5-0.59): 4
  knowledge_type_distribution:
    tacit: 14
    explicit: 5
    mixed: 3
  novelty_distribution:
    high: 6
    medium: 10
    low: 6
  cross_references:
    reinforces: 3
    contradicts: 1
    evolves: 2
    duplicates_removed: 1
```

4.4. **Identificacao de gaps:**

Notar o que a fonte NAO cobriu que seria esperado dado o dominio:
- Dominios declarados sem nenhum item extraido
- Tipos CDM ausentes (ex: zero anomalias pode significar fonte muito polida/editada)
- Profundidade limitada (muitas regras explicitas, poucos padroes tacitos)

**Checkpoint:** Classificacao completa, cross-references mapeadas, estatisticas calculadas.

---

### Step 5: Geracao de Outputs (5-8 min)

**Executor:** klein

5.1. **Compilar {source-slug}-items.yaml:**

```yaml
extraction:
  metadata:
    task_id: "TK-RM-002"
    source_title: "{titulo}"
    source_slug: "{slug}"
    source_type: "{tipo}"
    specialist_name: "{nome}"
    extraction_date: "2026-02-18T14:00:00Z"
    extractor_agent: "klein"
    extractor_method: "Passive CDM"

  stats:
    total_items: 22
    # ... (estatisticas completas)

  items:
    - id: "RI-{source-slug}-001"
      type: "decision"
      # ... (item completo)

    - id: "RI-{source-slug}-002"
      type: "pattern"
      # ... (item completo)

    # ... todos os itens

  cross_references:
    # ... (se aplicavel)

  gaps:
    # ... (gaps identificados)
```

5.2. **Compilar {source-slug}-extraction-log.yaml:**

```yaml
extraction_log:
  start_time: "2026-02-18T14:00:00Z"
  end_time: "2026-02-18T14:45:00Z"
  duration_minutes: 45

  context:
    source_type: "book_chapter"
    discourse_type: "prescritivo + narrativo"
    estimated_density: "high"
    calibrated_by_diagnosis: true

  decisions:
    - decision: "Classificar SEG-005 como mental_model em vez de pattern"
      reason: "Contem componentes estruturais, nao apenas regularidade observada"

    - decision: "Rejeitar SEG-012"
      reason: "Confianca abaixo de 0.5 — afirmacao muito generica sem evidencia especifica"

  rejected_segments:
    - id: "SEG-012"
      text: "Texto do segmento rejeitado"
      reason: "Generalidade excessiva"
      confidence: 0.35

    - id: "SEG-020"
      text: "Texto do segmento rejeitado"
      reason: "Duplicata de item ja extraido de fonte anterior"

  notes:
    - "Fonte tem densidade alta de patterns (6 de 22 itens)"
    - "Autor usa muitas analogias — boa fonte para mental models"
    - "Poucas anomalias — conteudo muito polido, narrativa editada"
```

5.3. **Compilar {source-slug}-summary.md:**

```markdown
# Extraction Summary: {titulo da fonte}

## Visao Geral
- **Fonte:** {titulo} ({tipo})
- **Especialista:** {nome}
- **Data de extracao:** 2026-02-18
- **Metodo:** Passive CDM (Gary Klein)
- **Total de itens extraidos:** 22

## Distribuicao por Tipo CDM
[Tabela com contagem por tipo]

## Achados Principais
1. [Insight mais significativo encontrado]
2. [Segundo insight mais significativo]
3. [Terceiro insight mais significativo]

## Padroes Observados
- [Padrao 1 na forma de comunicacao do especialista]
- [Padrao 2]

## Qualidade da Fonte
- **Densidade:** Alta/Media/Baixa
- **Tipo de discurso:** Narrativo/Prescritivo/Analitico
- **Riqueza tacita:** [Avaliacao]

## Gaps Identificados
- [Dominios ou tipos CDM sub-representados]

## Recomendacoes
- [Sugestoes para proximas extracoes ou sessoes interativas]
```

**Checkpoint:** Todos os arquivos de output gerados.

---

### Step 6: Validacao e Quality Check (3-5 min)

**Executor:** klein

6.1. **Checklist de auto-validacao:**

- [ ] Fonte lida integralmente (sem leitura parcial)
- [ ] Todos os 6 tipos CDM foram escaneados
- [ ] Minimo 5 itens por hora de conteudo extraidos
- [ ] Cada item tem citacao direta da fonte
- [ ] Cada item tem score de confianca >= 0.5
- [ ] Cada item classificado por tipo CDM e dominio
- [ ] Cross-references com extracoes anteriores verificadas (se aplicavel)
- [ ] Duplicatas removidas
- [ ] Gaps identificados e documentados
- [ ] Todos os 3 arquivos de output gerados
- [ ] YAML valido e parseavel

6.2. **Quality checks especificos:**

| Check | Expectativa | Se Falhar |
|-------|-----------|-----------|
| Diversidade de tipos | >= 3 tipos CDM diferentes | Revisar scan — possivel vies do extrator |
| Confianca media | >= 0.65 | Revisar evidencias — fonte pode ser pobre |
| Ratio tacit/explicit | >= 0.4 para fontes narrativas | Normal para tutoriais, flag para narrativas |
| Anomalies presentes | >= 1 para fontes > 30min | Fontes editadas frequentemente eliminam anomalias |

**Checkpoint:** Validacao completa. Output pronto para consumo por agentes downstream.

---

## Outputs

### Primary Output: Extracted Items

**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/extractions/{source-slug}-items.yaml`
**Content:** Lista completa de itens de repertorio extraidos com tipo CDM, evidencia, classificacao e score de confianca. Consumido por nonaka (sistematizacao), leonard (priorizacao), kelly (referencia para Q&A).

### Secondary Output 1: Extraction Log

**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/extractions/{source-slug}-extraction-log.yaml`
**Content:** Log detalhado de decisoes do extrator, segmentos rejeitados, notas tecnicas. Usado para auditoria e melhoria do processo.

### Secondary Output 2: Extraction Summary

**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/extractions/{source-slug}-summary.md`
**Content:** Resumo narrativo legivel por humanos. Achados principais, padroes, qualidade da fonte, gaps e recomendacoes.

---

## Validation

### Checklist

- [ ] Fonte de conteudo lida integralmente
- [ ] Contexto de extracao construido (metadata + diagnostico)
- [ ] Todos os 6 tipos CDM escaneados (decisions, patterns, mental_models, rules, cues, anomalies)
- [ ] Segmentos identificados com signal strength
- [ ] Extracao profunda aplicada a cada segmento (template por tipo)
- [ ] Cada item tem citacao direta e localizacao na fonte
- [ ] Cada item tem score de confianca (0.0-1.0) com >= 0.5
- [ ] Itens classificados por dominio
- [ ] Cross-references com extracoes anteriores verificadas
- [ ] Duplicatas removidas
- [ ] Gaps identificados e documentados
- [ ] Items YAML gerado e valido
- [ ] Extraction log gerado
- [ ] Summary gerado com estatisticas e recomendacoes
- [ ] Diversidade de tipos CDM verificada (>= 3 tipos)

### Success Criteria

**Threshold: 12/15 no checklist acima**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Item density** | 8+ itens/hora com 70%+ confianca alta/media | 5-7 itens/hora | < 5 itens/hora |
| **CDM completeness** | Todos 6 tipos representados | 4-5 tipos | < 4 tipos |
| **Evidence quality** | Cada item com citacao exata + localizacao | 80% com citacao | < 70% com evidencia |
| **Classification accuracy** | Tipo CDM intuitivamente correto para cada item | Erros menores de classificacao | Classificacoes incorretas frequentes |
| **Cross-reference** | Duplicatas removidas, reforcos identificados | Duplicatas removidas | Sem verificacao |
| **Insight depth** | Itens revelam conhecimento que leitor casual perderia | Mix de obvio e profundo | Maioria dos itens e obvio da leitura |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Source analysis** | 3-5 min | Ler + contextualizar |
| **CDM scan (1st pass)** | 8-15 min | Marcar todos os segmentos |
| **Deep extraction** | 15-25 min | Item-a-item com templates |
| **Classification + cross-ref** | 5-8 min | Agrupar, cruzar, calcular |
| **Output generation** | 5-8 min | 3 arquivos de output |
| **Validation** | 3-5 min | Checklist + quality checks |
| **Total (1-hour content)** | 39-66 min | Escala com tamanho da fonte |
| **Total (book chapter ~30 pgs)** | 30-50 min | Texto denso = mais segmentos |
| **Total (blog post ~2000 words)** | 15-25 min | Menor volume |

---

## Integration

### Feeds To

**Workflow:** Full Mapping Pipeline / Source Ingestion

**Next Tasks in Sequence:**
- **TK-RM-005:** map-deep-smarts — Usa: items extraidos para Deep Smarts audit
- **TK-RM-006:** convert-seci — Usa: items para conversao SECI
- **TK-RM-003:** run-qa-session — Usa: items como referencia para Q&A (o que ja sabemos)
- **TK-RM-004:** build-repertory-grid — Usa: items como elementos candidatos para grid

### Depends On

- **TK-RM-001:** diagnose-repertoire (recomendado) — Fornece: calibracao de niveis e tipos
- **Input:** source_content (obrigatorio) — Fornecido pelo usuario ou ETL Data Collector

### Agent Routing

**Primary Agent:** klein (CDM passivo)
**Quality Review:** repertoire-chief (valida qualidade de extracao)

---

## Quality Threshold

**Pass/Fail Gate:** Checklist score >= 12/15

Se < 12/15:
1. Se item density baixa: re-escanear com thresholds mais baixos
2. Se diversidade CDM baixa: re-ler focando nos tipos ausentes
3. Se evidencia fraca: voltar a fonte para citacoes de suporte
4. Se classificacao imprecisa: revisar templates CDM
5. Re-validar

**Common Failure Reasons:**
- Fonte e muito editorial/polida (conhecimento tacito editado para fora)
- Fonte e tutorial passo-a-passo (predominantemente explicito, pouco tacito)
- Fonte de autor que nao e praticante (interactional expertise — fala sobre, nao faz)
- Transcricao de baixa qualidade (erros que corrompem significado)
- Fonte muito curta (< 10 min / < 1000 palavras — pouco material)

---

## Notes for Executor

### Passive CDM vs Active CDM

No CDM ativo (entrevista), Klein pode fazer probes: "O que voce notou naquele momento?", "O que um novato teria perdido?". No CDM passivo, essas probes sao substituidas por INFERENCIA a partir do texto. A inferencia deve ser marcada com `rationale_explicit: false` e confianca reduzida em 0.1-0.2 pontos.

### Fontes Ricas vs Fontes Pobres

**Fontes ricas para CDM passivo:**
- Podcasts longos com entrevistas (especialista fala sem script)
- Livros de negocios com case studies detalhados
- Lives interativas com perguntas da audiencia
- Threads de Twitter/LinkedIn onde especialista responde challenges

**Fontes pobres para CDM passivo:**
- Tutoriais passo-a-passo (explicito demais)
- Artigos academicos formais (tacito removido pela formatacao)
- Slide decks (muito condensado, sem narrativa)
- Press releases (linguagem institucional, sem voz do especialista)

### Quando o Especialista Conta Historias

Historias sao OURO para CDM passivo. Uma historia de "quando eu comecei minha primeira empresa" pode conter 5+ itens em um unico paragrafo: decisions (o que escolheu fazer), cues (o que notou), patterns (o que reconheceu), anomalies (o que surpreendeu) e rules (o que aprendeu).

### A Arte da Inferencia Controlada

Klein permite inferir — mas com limites. Se o especialista diz "optei por precificar premium", podemos inferir que ele considerou (e rejeitou) precificacao por custo. Mas NAO podemos inferir o racional sem evidencia. Inferencias devem ser marcadas e penalizadas em confianca.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
