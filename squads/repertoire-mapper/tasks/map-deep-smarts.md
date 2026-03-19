---
id: TK-RM-005
name: Map Deep Smarts
version: 1.0.0
executor: leonard
purpose: >
  Identificar conhecimento critico usando o Deep Smarts framework de Dorothy
  Leonard. Avaliar cada item de repertorio nas 6 caracteristicas de Deep Smarts,
  construir priority matrix (uniqueness x urgency x impact), identificar
  conhecimento em risco de perda, e criar plano de transferencia com metodos
  adequados ao tipo de conhecimento.

inputs:
  - name: extracted_items
    type: list[file]
    description: >
      Itens de repertorio extraidos por TK-RM-002 (CDM passivo) e/ou
      construtos de TK-RM-003/TK-RM-004 (Repertory Grid). Sao os
      candidatos a avaliacao Deep Smarts.
    required: true
    location: "outputs/repertoire-mapper/{slug}/extractions/*-items.yaml"

  - name: construct_map
    type: file
    description: >
      Mapa de construtos de TK-RM-004. Construtos core sao candidatos
      prioritarios a Deep Smarts.
    required: false
    location: "outputs/repertoire-mapper/{slug}/grid/construct-map.yaml"

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001. Tipo de conhecimento (Polanyi) e nivel de
      expertise (Collins) informam a avaliacao de criticidade.
    required: true
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: organizational_context
    type: object
    description: >
      Contexto organizacional ou pessoal para calibrar urgencia
      e impacto. Para mapeamento pessoal, e o contexto de vida
      e carreira do especialista.
    required: false
    schema:
      role: string
      team_size: integer
      succession_plan: boolean
      critical_projects: list[string]
      knowledge_dependencies: list[string]
      timeline_pressure: enum[none, low, medium, high, critical]

  - name: assessment_scope
    type: enum
    description: >
      Escopo da avaliacao. 'all' avalia todos os itens. 'top_n' avalia
      os N itens com maior indicador de criticidade. 'domain' avalia
      itens de um dominio especifico.
    required: false
    options: ["all", "top_n", "domain"]
    default: "all"

  - name: top_n
    type: integer
    description: >
      Numero de itens a avaliar quando scope = 'top_n'. Os itens sao
      pre-ranqueados por indicadores de tacit ratio e expertise level.
    required: false
    default: 20

preconditions:
  - "Itens de repertorio extraidos (TK-RM-002 e/ou TK-RM-003 outputs)"
  - "Diagnostico TK-RM-001 completo (classificacao Polanyi + Collins)"
  - "Agente leonard acessivel e configurado"
  - "Pelo menos 10 itens de repertorio disponiveis para avaliacao"
  - "Contexto organizacional/pessoal informado (para calibrar urgencia)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/inventory.yaml"
    description: >
      Inventario completo de Deep Smarts — cada item avaliado nas 6
      caracteristicas com scores e justificativas.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/priority-matrix.yaml"
    description: >
      Matriz de prioridade Uniqueness x Urgency x Impact para
      todos os itens avaliados como Deep Smarts.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/risk-assessment.md"
    description: >
      Avaliacao de risco — conhecimentos em perigo de perda,
      vulnerabilidades, single points of failure.
    format: markdown

  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/transfer-plan.md"
    description: >
      Plano de transferencia — metodos recomendados para cada tipo
      de conhecimento critico, seguindo o Knowledge Transfer Continuum.
    format: markdown

validation:
  success_criteria:
    - "Todos os itens avaliados nas 6 caracteristicas de Deep Smarts"
    - "Cada avaliacao tem score (1-5) E justificativa narrativa"
    - "Priority matrix construida com 3 dimensoes (uniqueness, urgency, impact)"
    - "Top 5 Deep Smarts identificados e descritos em detalhe"
    - "Riscos de perda de conhecimento identificados com probabilidade e impacto"
    - "Plano de transferencia com metodos adequados ao tipo de conhecimento"
    - "Recomendacoes acionaveis e especificas (nao genericas)"
  quality_threshold: "5/7 criterios acima"
---

# Task: Map Deep Smarts

**Task ID:** TK-RM-005
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

Deep Smarts sao o conhecimento profundo baseado em experiencia que permite julgamento superior em situacoes complexas e ambiguas. Dorothy Leonard identificou que esse tipo de conhecimento e simultaneamente o mais valioso e o mais vulneravel — valioso porque e o que diferencia especialistas de praticantes competentes, vulneravel porque e tacito, pessoal e frequentemente nao-documentado.

Esta task avalia cada item de repertorio nas 6 caracteristicas de Deep Smarts, constroi uma matriz de prioridade tridimensional (uniqueness x urgency x impact), identifica riscos de perda, e gera um plano de transferencia com metodos calibrados ao tipo de conhecimento.

A pergunta central que Leonard responde: **"Se esta pessoa parasse de existir amanha, que conhecimento seria IRRECUPERAVEL?"**

**Workflow Position:** Task 5 — executa apos extracao (TK-RM-002) e/ou grid (TK-RM-004)
**Success Definition:** Inventario priorizado de Deep Smarts com plano de transferencia acionavel
**Output Quality Gate:** Alimenta QG-004 (Tier 2 → Validation)

---

## Purpose

Nem todo conhecimento vale o esforco de extracao e preservacao. Um especialista com 20 anos de experiencia possui milhares de itens de conhecimento — mas apenas uma fracao deles sao verdadeiros Deep Smarts. A maioria do conhecimento e:
- Disponivel em livros/cursos (replicavel)
- Compartilhado por muitos profissionais (nao-unico)
- De baixo impacto se perdido (substituivel)

Deep Smarts sao os itens que passam TODOS os filtros:
- Sao construidos por experiencia prolongada (nao ensinavel em sala de aula)
- Sao unicos ou raros (poucos possuem)
- Tem alto impacto quando aplicados (mudam resultados)
- Sao dificeis de articular (tacitos)
- Sao contextuais (funcionam em situacoes especificas)
- Estao em risco de perda (nao transferidos sistematicamente)

Esta task separa o ouro da terra — identifica os 10-20% de itens que contem 80% do valor do repertorio do especialista.

---

## Executor Type

**Agent (100% leonard)**

- **Agent Role:** Avaliar itens nas 6 caracteristicas, construir matrices, analisar riscos, projetar transferencia
- **Human Role:** Validar top 5 Deep Smarts (confirmar que a priorizacao faz sentido)
- **Estimated Runtime:** 30-60 min dependendo do numero de itens

---

## Steps

### Step 1: Knowledge Inventory — Compilar Itens Candidatos (5-8 min)

**Executor:** leonard

1.1. **Carregar todos os itens extraidos:**
- Ler `extracted_items` (TK-RM-002 outputs)
- Ler `construct_map` (TK-RM-004 output, se disponivel)
- Ler `diagnosis_data` (TK-RM-001 output)

1.2. **Construir inventario unificado:**

```yaml
knowledge_inventory:
  metadata:
    specialist_name: "{nome}"
    total_items_loaded: 45
    sources:
      - type: "CDM extractions"
        count: 28
        files: ["livro-items.yaml", "video-items.yaml"]
      - type: "RepGrid constructs"
        count: 12
        files: ["construct-map.yaml"]
      - type: "Diagnosis domains"
        count: 5
        files: ["diagnosis-data.yaml"]

  items:
    - id: "KI-001"
      original_id: "RI-livro-001"
      source: "CDM extraction"
      type: "decision"
      domain: "marketing digital"
      summary: "Sempre priorizar retencao antes de aquisicao quando retention curve esta caindo"
      polanyi_type: "predominantly_tacit"
      collins_level: "contributory"
      collins_tacit_type: "somatic"
      confidence: 0.85

    # ... todos os itens
```

1.3. **Pre-ranquear candidatos** (se `assessment_scope = top_n`):

Pre-ranking baseado em indicadores rapidos:
- tacit_ratio >= 0.6 → +2 pontos
- collins_level = contributory → +3 pontos
- collins_tacit_type = somatic → +2 pontos
- confidence >= 0.8 → +1 ponto
- novelty = high → +2 pontos
- RepGrid core construct → +3 pontos

Selecionar top N para avaliacao detalhada.

**Checkpoint:** Inventario completo compilado. Candidatos selecionados.

---

### Step 2: Avaliacao nas 6 Caracteristicas de Deep Smarts (15-25 min)

**Executor:** leonard

Para CADA item candidato, avaliar nas 6 caracteristicas do framework de Dorothy Leonard:

2.1. **Caracteristica 1: Domain Knowledge (Conhecimento de Dominio)**

| Score | Descricao |
|-------|-----------|
| 1 | Conhecimento basico, disponivel em qualquer curso |
| 2 | Conhecimento intermediario, requer alguma experiencia |
| 3 | Conhecimento avancado, requer anos de pratica |
| 4 | Conhecimento profundo, poucos possuem neste nivel |
| 5 | Conhecimento raro, construido por decadas de experiencia unica |

```yaml
assessment:
  item_id: "KI-001"
  characteristic: "domain_knowledge"
  score: 4
  justification: >
    Esse conhecimento sobre priorizar retencao antes de aquisicao
    nao e encontrado em livros de marketing basico. Requer ter
    visto o padrao em multiplos negocios ao longo de anos.
  evidence: "Especialista mencionou ter visto isso em '80+ negocios'"
```

2.2. **Caracteristica 2: Pattern Recognition (Reconhecimento de Padroes)**

| Score | Descricao |
|-------|-----------|
| 1 | Padrao obvio, qualquer profissional reconhece |
| 2 | Padrao requer atencao treinada |
| 3 | Padrao sutil, maioria dos profissionais perde |
| 4 | Padrao complexo, requer experiencia extensa para reconhecer |
| 5 | Padrao extremamente sutil, apenas especialistas de elite reconhecem |

2.3. **Caracteristica 3: Systems Perspective (Perspectiva Sistemica)**

| Score | Descricao |
|-------|-----------|
| 1 | Visao isolada, sem consideracao de sistema |
| 2 | Entende interacoes basicas |
| 3 | Ve efeitos de segunda ordem |
| 4 | Modela dinamicas complexas do sistema |
| 5 | Preve efeitos cascata nao-obvios em sistemas complexos |

2.4. **Caracteristica 4: Context Awareness (Consciencia Contextual)**

| Score | Descricao |
|-------|-----------|
| 1 | Descontextualizado, regra generica |
| 2 | Alguma sensibilidade ao contexto |
| 3 | Adapta ao contexto de forma consciente |
| 4 | Profunda integracao do contexto na decisao |
| 5 | Contexto e parte inseparavel do conhecimento — so funciona "la dentro" |

2.5. **Caracteristica 5: Diagnostic Acuity (Acuidade Diagnostica)**

| Score | Descricao |
|-------|-----------|
| 1 | Diagnostico sequencial, tentativa-e-erro |
| 2 | Elimina opcoes mais comuns primeiro |
| 3 | Vai direto a causa provavel |
| 4 | Diagnostica por pattern matching instantaneo |
| 5 | Detecta problemas antes de se manifestarem (pre-diagnostico) |

2.6. **Caracteristica 6: Skilled Networking (Rede de Expertise)**

| Score | Descricao |
|-------|-----------|
| 1 | Conhecimento isolado, sem componente relacional |
| 2 | Sabe quem consultar para duvidas basicas |
| 3 | Rede ativa de especialistas em areas complementares |
| 4 | Conector entre comunidades, mobiliza expertise quando necessario |
| 5 | Rede unica e insubstituivel que amplifica todos os outros Deep Smarts |

2.7. **Calculo do Deep Smarts Score:**

```yaml
deep_smarts_assessment:
  item_id: "KI-001"
  summary: "Priorizar retencao antes de aquisicao"

  scores:
    domain_knowledge: 4
    pattern_recognition: 4
    systems_perspective: 5
    context_awareness: 3
    diagnostic_acuity: 4
    skilled_networking: 2

  total_score: 22  # Soma (max 30)
  average_score: 3.67  # Media (max 5.0)
  deep_smarts_level: "HIGH"  # HIGH (avg >= 3.5), MEDIUM (2.5-3.49), LOW (< 2.5)

  strongest_characteristic: "systems_perspective"
  weakest_characteristic: "skilled_networking"

  narrative: >
    Este item e um Deep Smart de nivel ALTO. O especialista demonstra
    perspectiva sistemica excepcional — entende como retencao afeta
    todas as outras metricas do negocio em cascata. O reconhecimento
    de padrao e forte (identificou o padrao em 80+ negocios). A
    consciencia contextual e moderada — funciona para SaaS B2B mas
    o especialista reconhece limitacoes em marketplaces. A rede de
    expertise e o ponto mais fraco — este conhecimento esta
    concentrado nele, sem rede de suporte.
```

**Checkpoint:** Todos os itens avaliados nas 6 caracteristicas.

---

### Step 3: Construir Priority Matrix (5-8 min)

**Executor:** leonard

3.1. **Definir as 3 dimensoes da matrix:**

#### Uniqueness (Unicidade) — Quao raro e este conhecimento?

| Score | Descricao |
|-------|-----------|
| 1 | Comum — disponivel em livros, cursos, 100+ pessoas possuem |
| 2 | Pouco comum — requer experiencia, 20-50 pessoas possuem |
| 3 | Raro — poucos possuem neste nivel, 5-20 pessoas |
| 4 | Muito raro — 2-5 pessoas possuem no mesmo nivel |
| 5 | Unico — apenas esta pessoa possui esta combinacao especifica |

#### Urgency (Urgencia) — Quao urgente e preservar/transferir?

| Score | Descricao |
|-------|-----------|
| 1 | Sem urgencia — conhecimento estavel, sem risco proximo |
| 2 | Baixa urgencia — risco em 2+ anos |
| 3 | Media urgencia — risco em 6-24 meses |
| 4 | Alta urgencia — risco em 1-6 meses (transicao, burnout, mudanca) |
| 5 | Critica — risco imediato (saida iminente, unico detentor) |

#### Impact (Impacto) — Qual o impacto se este conhecimento for perdido?

| Score | Descricao |
|-------|-----------|
| 1 | Minimo — operacoes continuam normalmente |
| 2 | Baixo — alguma perda de eficiencia, recuperavel |
| 3 | Medio — impacto significativo em resultados ou qualidade |
| 4 | Alto — perdas significativas, dificil recuperar |
| 5 | Critico — operacoes comprometidas, danos potencialmente irreversiveis |

3.2. **Calcular priority score:**

```yaml
priority_matrix:
  items:
    - item_id: "KI-001"
      summary: "Priorizar retencao antes de aquisicao"
      deep_smarts_score: 22
      uniqueness: 3
      urgency: 4
      impact: 5
      priority_score: 60  # uniqueness * urgency * impact
      priority_level: "CRITICAL"  # CRITICAL (>= 50), HIGH (25-49), MEDIUM (10-24), LOW (< 10)

    - item_id: "KI-003"
      summary: "Detectar fadiga de audiencia por metricas de engajamento"
      deep_smarts_score: 18
      uniqueness: 4
      urgency: 3
      impact: 3
      priority_score: 36
      priority_level: "HIGH"

    # ... todos os itens ranqueados
```

3.3. **Classificacao de prioridade:**

| Priority Score | Level | Action |
|---------------|-------|--------|
| >= 50 | CRITICAL | Transferencia imediata obrigatoria |
| 25-49 | HIGH | Planejar transferencia em 30 dias |
| 10-24 | MEDIUM | Incluir em programa regular de transferencia |
| < 10 | LOW | Documentar quando conveniente |

3.4. **Visualizacao da matrix:**

```yaml
priority_visualization:
  # Quadrantes da matrix (usando uniqueness x impact, colorido por urgency)
  quadrant_high_unique_high_impact:
    label: "Crown Jewels"
    items: ["KI-001", "KI-007"]
    action: "Proteger e transferir IMEDIATAMENTE"

  quadrant_high_unique_low_impact:
    label: "Hidden Gems"
    items: ["KI-012"]
    action: "Preservar para oportunidades futuras"

  quadrant_low_unique_high_impact:
    label: "Critical Infrastructure"
    items: ["KI-003", "KI-005"]
    action: "Nao e raro mas e vital — garantir redundancia"

  quadrant_low_unique_low_impact:
    label: "Commodity Knowledge"
    items: ["KI-015", "KI-020"]
    action: "Documentacao basica suficiente"
```

**Checkpoint:** Priority matrix construida. Top 5 identificados.

---

### Step 4: Risk Assessment — Identificar Conhecimento em Risco (5-8 min)

**Executor:** leonard

4.1. **Para cada item CRITICAL e HIGH, avaliar risco de perda:**

```yaml
risk_assessment:
  - item_id: "KI-001"
    priority_level: "CRITICAL"

    risk_factors:
      single_point_of_failure:
        score: 5
        description: "Apenas esta pessoa possui este conhecimento neste nivel"

      documentation_status:
        score: 1
        description: "Nao documentado formalmente"

      transfer_history:
        score: 1
        description: "Nunca transferido sistematicamente"

      tacit_depth:
        score: 4
        description: "Polanyi classifica como predominantly_tacit (0.65)"

      context_dependency:
        score: 3
        description: "Funciona em SaaS B2B, precisa adaptacao para outros contextos"

      retention_risk:
        score: 4
        description: >
          Especialista em fase de transicao de carreira. Urgencia alta.
          Se nao for capturado nos proximos 6 meses, pode ser perdido.

    overall_risk_score: 18  # Soma (max 30)
    risk_level: "CRITICAL"  # CRITICAL (>= 20), HIGH (15-19), MEDIUM (10-14), LOW (< 10)

    mitigation_recommendations:
      - "Sessao CDM ativa (Klein) focada neste item — 90 min"
      - "Repertory Grid (Kelly) com cenarios de retencao — 30 min"
      - "Documentar heuristicas em decision-frameworks.yaml"
      - "Criar caso de estudo detalhado como artefato de transferencia"
```

4.2. **Mapa de vulnerabilidade:**

```yaml
vulnerability_map:
  critical_risks:
    - "3 dos top 5 Deep Smarts estao em risco CRITICAL de perda"
    - "Nenhum dos top 10 itens foi documentado formalmente"
    - "0 programas de transferencia ativos"

  systemic_risks:
    - "Concentracao: 80% dos Deep Smarts estao em um unico dominio (marketing digital)"
    - "Dependencia: 5 itens dependem de rede de contatos do especialista (intransferivel por documentacao)"

  timeline_risks:
    - "Se transicao de carreira em 6 meses: 12 itens em risco"
    - "Se nenhuma acao tomada: 60% do valor de repertorio em risco em 12 meses"
```

**Checkpoint:** Riscos mapeados. Vulnerabilidades identificadas.

---

### Step 5: Criar Plano de Transferencia (8-12 min)

**Executor:** leonard

5.1. **Selecionar metodo de transferencia por item:**

Leonard usa o Knowledge Transfer Continuum para selecionar o metodo mais adequado ao tipo de conhecimento:

```yaml
transfer_plan:
  items:
    - item_id: "KI-001"
      summary: "Priorizar retencao antes de aquisicao"
      priority_level: "CRITICAL"
      knowledge_type: "predominantly_tacit + somatic"

      transfer_methods:
        primary:
          method: "guided_experience"
          description: >
            OPPTY process — o aprendiz observa o especialista analisando
            dados de retencao de negocios reais, depois pratica sob
            supervisao, recebe feedback progressivo.
          effectiveness_for_this_type: "VERY HIGH"
          estimated_effort: "4 sessoes de 2h"
          prerequisites: "Acesso a dados reais de negocios"

        secondary:
          method: "case_study_with_think_aloud"
          description: >
            Especialista analisa 5 casos reais narrando seu processo
            de pensamento em tempo real. Gravado e transcrito.
          effectiveness_for_this_type: "HIGH"
          estimated_effort: "2 sessoes de 1h"
          prerequisites: "5 casos anonimizados"

        complementary:
          method: "decision_heuristic_documentation"
          description: >
            Documentar a heuristica em formato when/then/because
            com exemplos e contra-exemplos.
          effectiveness_for_this_type: "MEDIUM"
          estimated_effort: "1 sessao de 30min"
          prerequisites: "CDM extraction ja realizado"

      transfer_sequence:
        - step: 1
          action: "Documentar heuristica (TK-RM-006 SECI Externalization)"
          timeline: "Semana 1"
        - step: 2
          action: "Case study com think-aloud (gravar + transcrever)"
          timeline: "Semana 2-3"
        - step: 3
          action: "Guided experience se aprendiz identificado"
          timeline: "Semana 4-8"

    # ... para cada item CRITICAL e HIGH
```

5.2. **Selecao de metodo baseada em tipo de conhecimento:**

| Collins Tacit Type | Metodo Primario | Metodo Secundario |
|-------------------|----------------|-------------------|
| Relational | Documentacao estruturada + Q&A | Case studies |
| Somatic | Guided experience (OPPTY) | Think-aloud + video |
| Collective | Imersao em comunidade | Storytelling sessions |

| Polanyi Tacit Ratio | Engajamento Necessario |
|---------------------|----------------------|
| < 0.3 | Low-touch: documentacao escrita |
| 0.3-0.6 | Mid-touch: mentoria + case studies |
| 0.6-0.8 | High-touch: guided experience |
| > 0.8 | Very high-touch: OPPTY completo + job shadowing |

5.3. **Compilar transfer-plan.md:**

```markdown
# Transfer Plan: {nome_especialista}

## Visao Geral
- **Total de Deep Smarts identificados:** N
- **Itens CRITICAL:** X (transferencia imediata)
- **Itens HIGH:** Y (transferencia em 30 dias)
- **Esforco total estimado:** Z horas

## Priority Items

### 1. {Item mais critico}
**Priority:** CRITICAL | **Risk:** CRITICAL
**Knowledge Type:** {tipo}
**Transfer Method:** {metodo}
**Timeline:** {prazo}
**Prerequisites:** {pre-requisitos}

### 2. {Segundo mais critico}
...

## Cronograma Consolidado
[Timeline com marcos e dependencias]

## Recursos Necessarios
[O que precisa estar disponivel para executar o plano]

## Metricas de Sucesso
[Como medir se a transferencia funcionou]
```

**Checkpoint:** Plano de transferencia completo e acionavel.

---

### Step 6: Geracao de Outputs e Validacao (5-8 min)

**Executor:** leonard

6.1. **Compilar inventory.yaml:**

```yaml
deep_smarts_inventory:
  metadata:
    specialist_name: "{nome}"
    assessment_date: "2026-02-18T17:00:00Z"
    total_items_assessed: 45
    deep_smarts_identified: 12
    critical_count: 3
    high_count: 5
    medium_count: 4

  items:
    - id: "KI-001"
      assessment: {6 caracteristicas com scores e justificativas}
      priority: {uniqueness, urgency, impact, score, level}
      risk: {fatores, score, level}
      transfer: {metodos, timeline, prerequisites}

    # ... todos os itens
```

6.2. **Validacao final:**

- [ ] Todos os itens candidatos avaliados nas 6 caracteristicas
- [ ] Cada avaliacao tem score E justificativa narrativa
- [ ] Priority matrix calculada com 3 dimensoes
- [ ] Top 5 Deep Smarts detalhados com narrativa rica
- [ ] Risk assessment completo para itens CRITICAL e HIGH
- [ ] Vulnerability map com riscos sistemicos identificados
- [ ] Transfer plan com metodos adequados ao tipo de conhecimento
- [ ] Timeline e prerequisites especificados
- [ ] Metricas de sucesso definidas
- [ ] Recomendacoes acionaveis (nao genericas)
- [ ] Todos os arquivos de output validos

**Checkpoint:** Todos os outputs gerados. Task completa.

---

## Outputs

### Primary Output 1: Deep Smarts Inventory
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/deep-smarts/inventory.yaml`

### Primary Output 2: Priority Matrix
**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/deep-smarts/priority-matrix.yaml`

### Secondary Output 1: Risk Assessment
**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/deep-smarts/risk-assessment.md`

### Secondary Output 2: Transfer Plan
**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/deep-smarts/transfer-plan.md`

---

## Validation

### Checklist

- [ ] Inventario de conhecimento compilado de todas as fontes
- [ ] Pre-ranking executado (se scope = top_n)
- [ ] Cada item avaliado na Caracteristica 1: Domain Knowledge (1-5 + justificativa)
- [ ] Cada item avaliado na Caracteristica 2: Pattern Recognition (1-5 + justificativa)
- [ ] Cada item avaliado na Caracteristica 3: Systems Perspective (1-5 + justificativa)
- [ ] Cada item avaliado na Caracteristica 4: Context Awareness (1-5 + justificativa)
- [ ] Cada item avaliado na Caracteristica 5: Diagnostic Acuity (1-5 + justificativa)
- [ ] Cada item avaliado na Caracteristica 6: Skilled Networking (1-5 + justificativa)
- [ ] Deep Smarts Score calculado (soma e media)
- [ ] Priority matrix com uniqueness, urgency, impact
- [ ] Items classificados como CRITICAL/HIGH/MEDIUM/LOW
- [ ] Risk assessment para itens CRITICAL e HIGH
- [ ] Vulnerability map com riscos sistemicos
- [ ] Transfer plan com metodos calibrados ao tipo de conhecimento
- [ ] Timeline e prerequisites definidos
- [ ] Metricas de sucesso da transferencia

### Success Criteria

**Threshold: 13/17 no checklist acima**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Assessment rigor** | 6/6 caracteristicas com justificativa detalhada | 6/6 com justificativa breve | Caracteristicas faltando |
| **Priority accuracy** | Top 5 sao intuitivamente os mais criticos | Top 5 razoaveis | Priorizacao nao faz sentido |
| **Risk analysis** | Riscos sistemicos + timeline | Riscos individuais | Sem analise de risco |
| **Transfer plan** | Metodos calibrados + OPPTY quando necessario | Metodos adequados | Metodos genericos |
| **Actionability** | Plano executavel com timeline e prerequisites | Recomendacoes claras | Muito abstrato |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Knowledge inventory** | 5-8 min | Compilar e pre-ranquear |
| **6-characteristic assessment** | 15-25 min | 2-3 min por item, top 10-20 |
| **Priority matrix** | 5-8 min | Calcular scores e classificar |
| **Risk assessment** | 5-8 min | Avaliar itens CRITICAL/HIGH |
| **Transfer plan** | 8-12 min | Selecionar metodos, definir timeline |
| **Output generation** | 5-8 min | Compilar 4 arquivos |
| **Total** | 43-69 min | Escala com numero de itens |

---

## Integration

### Feeds To

- **TK-RM-006:** convert-seci — Usa: Deep Smarts priorizados para conversao SECI
- **generate-operating-manual:** Usa: transfer plan como base para manual operacional
- **generate-manifest:** Usa: inventory para repertoire manifest

### Depends On

- **TK-RM-002:** extract-from-source (itens extraidos)
- **TK-RM-003/004:** run-qa-session / build-repertory-grid (construtos)
- **TK-RM-001:** diagnose-repertoire (classificacao Polanyi + Collins)

### Agent Routing

**Primary Agent:** leonard (Deep Smarts specialist)
**Quality Review:** repertoire-chief

---

## Notes for Executor

### O Erro mais Comum

O erro mais comum e classificar TUDO como Deep Smart. Leonard e rigoroso: se o conhecimento pode ser aprendido em um curso de 40 horas, NAO e Deep Smart. Se 50 profissionais possuem o mesmo conhecimento, NAO e Deep Smart. Deep Smarts sao RAROS e DIFICEIS de adquirir — essa e a definicao.

### Quando Uniqueness e Subjetivo

Para mapeamento pessoal (vs organizacional), uniqueness e relativo ao contexto do especialista. Um conhecimento pode ser "comum" no mercado mas "unico" na empresa/equipe/vida daquela pessoa. Calibrar conforme contexto.

### Transfer Plan vs Extracao

Esta task NAO extrai o conhecimento — ela identifica QUAL conhecimento extrair e COMO transferi-lo. A extracao acontece em TK-RM-002 (CDM) e TK-RM-003 (RepGrid). A conversao acontece em TK-RM-006 (SECI). Leonard PRIORIZA e PLANEJA.

### A Armadilha do "Tudo e Urgente"

Se tudo e urgente, nada e urgente. Leonard deve ser disciplinado: no maximo 20% dos itens podem ser CRITICAL. Se mais de 20% sao critical, os criterios estao frouxos demais.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
