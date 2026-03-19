---
id: TK-RM-001
name: Diagnose Repertoire
version: 1.0.0
executor: polanyi + collins
purpose: >
  Diagnostico inicial completo — classificar tipos de conhecimento (tacito/explicito
  via Polanyi) e nivel de expertise (Periodic Table via Collins) para cada area
  do repertorio do especialista. Este e o primeiro passo obrigatorio antes de
  qualquer extracao ou sistematizacao de conhecimento.

inputs:
  - name: subject_profile
    type: object
    description: >
      Informacoes basicas sobre o especialista a ser diagnosticado.
      Pode ser preenchido pelo usuario ou pelo repertoire-chief.
    required: true
    schema:
      name: string
      domain_primary: string
      domains_secondary: list[string]
      years_experience: integer
      self_description: string
      known_frameworks: list[string]
      sources_available: list[string]

  - name: context_sources
    type: list[file]
    description: >
      Fontes de contexto ja disponiveis sobre o especialista (transcritos,
      posts, artigos, curriculo, portfolio). Usadas para calibrar o
      diagnostico antes de qualquer interacao direta.
    required: false

  - name: diagnosis_scope
    type: enum
    description: >
      Escopo do diagnostico. 'full' avalia todas as areas identificadas.
      'focused' avalia apenas dominios especificos.
    required: false
    options: ["full", "focused"]
    default: "full"

  - name: target_domains
    type: list[string]
    description: >
      Lista de dominios especificos para diagnosticar quando scope = 'focused'.
      Ignorado quando scope = 'full'.
    required: false

preconditions:
  - "Perfil basico do especialista disponivel (nome, dominio, experiencia)"
  - "Pelo menos um dominio de conhecimento identificado para diagnostico"
  - "Agentes polanyi e collins acessiveis e configurados"
  - "Nenhum diagnostico ativo em andamento para o mesmo especialista (ou re-diagnostico explicitamente solicitado)"
  - "Quality Gate QG-001 passado (fontes identificadas, objetivo claro)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/diagnosis-report.md"
    description: >
      Relatorio completo de diagnostico com classificacao Polanyi + Collins
      por area do repertorio. Inclui mapa visual de tipos e niveis.
    format: markdown

  - path: "outputs/repertoire-mapper/{slug}/expertise-profile.md"
    description: >
      Perfil de expertise consolidado usando Periodic Table de Collins.
      Serve como input direto para agentes de extracao (Tier 1).
    format: markdown

  - path: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"
    description: >
      Dados estruturados do diagnostico em formato maquina.
      Consumido por agentes downstream (klein, leonard, kelly).
    format: yaml

validation:
  success_criteria:
    - "Todos os dominios identificados possuem classificacao Polanyi (tipo de conhecimento)"
    - "Todos os dominios identificados possuem classificacao Collins (nivel de expertise)"
    - "Pelo menos 3 dominios diagnosticados (ou total de dominios se < 3)"
    - "Cada classificacao possui justificativa com evidencia"
    - "Relatorio de diagnostico gerado e completo"
    - "Perfil de expertise gerado e consumivel por Tier 1"
    - "Nenhuma inconsistencia critica entre classificacao Polanyi e Collins"
  quality_threshold: "7/9 criterios acima"
---

# Task: Diagnose Repertoire

**Task ID:** TK-RM-001
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

Este e o primeiro passo obrigatorio no pipeline do Repertoire Mapper. Antes de extrair qualquer conhecimento, precisamos saber **que tipos de conhecimento estao em jogo** (Polanyi) e **quao profundo e o expertise em cada area** (Collins). Sem esse diagnostico, os agentes de extracao (Tier 1) trabalham as cegas — podem tentar extrair conhecimento tacito onde so ha explicito, ou aplicar tecnicas de novato em areas onde o especialista tem expertise contributiva.

O diagnostico combina dois frameworks complementares:
- **Polanyi** classifica a NATUREZA do conhecimento (tacito vs explicito, proximal vs distal)
- **Collins** classifica o NIVEL de expertise (Beer-mat → Interactional → Contributory)

**Workflow Position:** Task 1 no pipeline — prerequisito para todas as demais tasks
**Success Definition:** Mapa completo tipo+nivel para cada area do repertorio
**Output Quality Gate:** QG-002 (Diagnostico completo — blocking gate para Tier 1)

---

## Purpose

O diagnostico responde tres perguntas fundamentais:

1. **"Que tipo de conhecimento este especialista possui em cada area?"** — Polanyi distingue conhecimento tacito (nao articulavel diretamente), explicito (ja formulado), e as estruturas proximal-distal que conectam os dois. Um chef de cozinha pode ter conhecimento explicito sobre receitas (ingredientes, temperaturas) mas conhecimento profundamente tacito sobre "o ponto certo" de uma massa.

2. **"Quao profundo e o expertise em cada area?"** — Collins classifica desde Beer-mat Knowledge (leu a contra-capa do livro) ate Contributory Expertise (contribui ativamente para avancar o campo). Um programador pode ter expertise contributiva em Python mas apenas interactional em machine learning.

3. **"Onde devemos concentrar os esforcos de extracao?"** — O cruzamento tipo x nivel gera uma matriz de prioridade. Conhecimento tacito + expertise contributiva = high priority para extracao via Klein/Leonard. Conhecimento explicito + beer-mat = pode ser documentado com metodos simples.

Sem este diagnostico, o pipeline desperica recursos aplicando CDM (Klein) em areas onde uma simples documentacao bastaria, ou tentando Repertory Grid (Kelly) em dominios onde o especialista nao tem profundidade suficiente para gerar construtos significativos.

---

## Executor Type

**Multi-Agent Sequential: polanyi → collins**

- **Agent 1 (polanyi):** Classificacao epistemologica — tipos de conhecimento por dominio
- **Agent 2 (collins):** Diagnostico de expertise — nivel e tipo de tacit knowledge por dominio
- **Sequencia:** Polanyi SEMPRE executa primeiro. Collins recebe o output de Polanyi como input.
- **Human Role:** Responde perguntas de calibracao (3-5 perguntas por dominio)
- **Estimated Runtime:** 20-45 minutos (depende do numero de dominios)

---

## Steps

### Step 1: Intake e Contextualizacao (3-5 min)

**Executor:** polanyi

**Atividades:**

1.1. **Ler perfil do especialista** (`subject_profile`):
- Nome, dominio primario, dominios secundarios
- Anos de experiencia declarados
- Auto-descricao (como a pessoa se apresenta)
- Frameworks conhecidos
- Fontes disponiveis para analise

1.2. **Processar fontes de contexto** (se `context_sources` fornecido):
- Escanear cada fonte disponivel (transcritos, posts, curriculo)
- Identificar dominios mencionados vs dominios declarados
- Notar discrepancias (dominio declarado mas sem evidencia, ou dominio nao declarado mas com evidencia forte)
- Extrair vocabulario tecnico usado (indicador de profundidade)

1.3. **Construir mapa inicial de dominios:**

```yaml
domain_map:
  - id: DOM-001
    name: "Marketing Digital"
    source: "declared"          # declared | inferred | both
    evidence_strength: "strong" # strong | moderate | weak
    initial_notes: "Mencionado como dominio primario, 12 anos experiencia"

  - id: DOM-002
    name: "Copywriting"
    source: "inferred"
    evidence_strength: "moderate"
    initial_notes: "Nao declarado explicitamente mas evidenciado em 3 posts analisados"
```

1.4. **Definir escopo final:**
- Se `diagnosis_scope = full`: todos os dominios do mapa
- Se `diagnosis_scope = focused`: apenas `target_domains`
- Validar que dominios-alvo existem no mapa

**Checkpoint:** Mapa de dominios construido, escopo definido, fontes processadas

---

### Step 2: Classificacao Polanyi — Tipos de Conhecimento (10-15 min)

**Executor:** polanyi

Para CADA dominio no mapa:

2.1. **Classificacao Tacito vs Explicito:**

Polanyi aplica sua distincao fundamental. Todo conhecimento possui uma dimensao tacita, mas a PROPORCAO varia drasticamente por dominio e por sub-competencia dentro do dominio.

```yaml
polanyi_classification:
  domain: "Marketing Digital"
  overall_tacit_ratio: 0.65  # 0.0 = puramente explicito, 1.0 = puramente tacito

  knowledge_components:
    - component: "Estrategia de campanhas"
      type: "predominantly_tacit"
      tacit_ratio: 0.75
      evidence: "Especialista usa termos como 'sentir o mercado', 'timing certo'"
      proximal_elements:
        - "Padrao de engagement em diferentes horarios"
        - "Sinais de fadiga de audiencia"
        - "Correlacao entre tom e conversao"
      distal_elements:
        - "Metricas de performance de campanha"
        - "ROI calculado"
        - "Relatorios de resultados"

    - component: "Configuracao de ferramentas (ads, analytics)"
      type: "predominantly_explicit"
      tacit_ratio: 0.25
      evidence: "Procedimentos documentaveis, tutoriais existem"
      proximal_elements:
        - "Intuicao sobre qual configuracao testar primeiro"
      distal_elements:
        - "Parametros de configuracao"
        - "Checklists de setup"
        - "Documentacao oficial"
```

2.2. **Analise Proximal-Distal:**

A distincao proximal-distal e central em Polanyi. O conhecimento proximal e aquilo que o especialista usa SUBSIDIARIAMENTE (sem atencao focal) para executar uma tarefa. O distal e aquilo em que ele foca conscientemente.

**Analogia de Polanyi:** Quando um carpinteiro usa um martelo, ele nao presta atencao no martelo (proximal) — presta atencao no prego (distal). Se comeca a prestar atencao no martelo, perde a habilidade.

Para cada dominio, identificar:
- O que funciona como "martelo" (proximal — subsidiario, tacito, incorporado)
- O que funciona como "prego" (distal — focal, consciente, articulavel)
- Evidencias de indwelling (ferramentas que se tornaram extensoes do corpo/mente)

2.3. **Classificacao de Indwelling:**

Polanyi chama de "indwelling" o processo pelo qual ferramentas e frameworks se tornam extensoes do especialista. Um programador que "pensa em Python" tem indwelling com a linguagem. Um marketeiro que "sente" a audiencia tem indwelling com suas metricas.

```yaml
indwelling_map:
  - tool: "Google Analytics"
    indwelling_level: "high"  # high | medium | low | none
    evidence: "Nao precisa consultar; interpreta dashboards instantaneamente"
    implication: "Extracao requer abordagem CDM — nao adianta perguntar diretamente"

  - tool: "Framework AIDA"
    indwelling_level: "medium"
    evidence: "Usa naturalmente mas ainda consegue articular os passos"
    implication: "Combinacao de documentacao + Q&A pode capturar"
```

2.4. **Perguntas de calibracao para o especialista (se interativo):**

Polanyi faz 2-3 perguntas por dominio para calibrar a classificacao:

- "Se eu pedisse para voce explicar [competencia X] para alguem que nunca viu, voce conseguiria escrever um guia completo? Ou teria partes que 'voce so sabe fazendo'?"
- "Quando voce toma decisoes em [dominio Y], voce segue um processo consciente ou 'sente' a resposta certa?"
- "Quais ferramentas ou frameworks voce usa sem pensar, como se fossem parte de voce?"

**Checkpoint:** Classificacao Polanyi completa para todos os dominios. Output pronto para Collins.

---

### Step 3: Diagnostico Collins — Periodic Table of Expertises (10-15 min)

**Executor:** collins

Collins recebe o output de Polanyi e adiciona a dimensao de PROFUNDIDADE.

3.1. **Classificacao no Periodic Table:**

Para CADA dominio, Collins determina o nivel de expertise usando sua taxonomia:

```yaml
collins_periodic_table:
  ubiquitous_expertises:
    # Expertises que (quase) todos possuem
    beer_mat_knowledge:
      definition: "Sabe o basico, o que diria no verso de um cartao de visita"
      indicators:
        - "Consegue descrever o dominio em termos gerais"
        - "Nao consegue distinguir bom de ruim dentro do dominio"
        - "Usa vocabulario popular, nao tecnico"
      assessment_questions:
        - "Voce consegue explicar isso para alguem leigo? (se sim facilmente, pode ser beer-mat)"

    popular_understanding:
      definition: "Entendimento popular, nivel de quem leu artigos/assiste videos"
      indicators:
        - "Tem opiniao formada mas baseada em fontes populares"
        - "Consegue participar de conversas sobre o tema"
        - "Nao distingue nuances tecnicas"

    primary_source_knowledge:
      definition: "Leu fontes primarias (papers, livros tecnicos)"
      indicators:
        - "Cita fontes originais"
        - "Distingue interpretacoes populares de originais"
        - "Pode ter opiniao tecnica mas sem pratica"

  specialist_expertises:
    interactional_expertise:
      definition: >
        Pode conversar fluentemente com praticantes do dominio sem ser um praticante.
        Entende o vocabulario, os debates, as nuances — mas nao FAZ.
      indicators:
        - "Consegue fazer perguntas inteligentes a especialistas"
        - "Entende papers tecnicos do campo"
        - "Pode avaliar qualidade de trabalho (com limitacoes)"
        - "NAO consegue fazer o trabalho sozinho em situacoes novas"
      key_distinction: >
        Collins mesmo adquiriu interactional expertise em fisica de ondas
        gravitacionais. Podia conversar com fisicos, avaliar papers, mas
        nunca operou o interferometro.
      assessment_method: >
        Teste de Turing de especialistas: outros especialistas no dominio
        aceitariam esta pessoa como par em conversas tecnicas? Se sim,
        provavelmente tem interactional expertise.

    contributory_expertise:
      definition: >
        Praticante ativo que contribui para avancar o dominio. Faz o trabalho,
        resolve problemas ineditos, treina outros.
      indicators:
        - "Resolve problemas que outros no dominio nao conseguem"
        - "E consultado por outros praticantes como referencia"
        - "Cria novos metodos, frameworks ou abordagens"
        - "Treina outros praticantes (nao apenas novatos)"
      assessment_method: >
        Evidencia de contribuicao ativa: projetos completados, problemas
        resolvidos, pessoas treinadas, inovacoes introduzidas.
```

3.2. **Classificacao de Tacit Knowledge por tipo Collins:**

Collins refina a classificacao de Polanyi, distinguindo TRES tipos de conhecimento tacito:

```yaml
collins_tacit_types:
  relational_tacit:
    definition: >
      Conhecimento tacito que PODERIA ser tornado explicito mas nao foi —
      por conveniencia, tradicao ou falta de oportunidade.
    examples:
      - "Receita de familia nunca escrita"
      - "Processo interno que 'todo mundo sabe' mas ninguem documentou"
    extraction_difficulty: "LOW — perguntas diretas funcionam"
    extraction_agent: "Qualquer agente pode extrair"

  somatic_tacit:
    definition: >
      Conhecimento tacito do corpo — habilidades motoras, timing, 'feeling'.
      Nao pode ser tornado plenamente explicito.
    examples:
      - "O 'toque' do cirurgiao"
      - "O timing de um comediante"
      - "O 'olho' de um designer para proporcao"
    extraction_difficulty: "HIGH — requer CDM com simulacao de cenarios"
    extraction_agent: "klein (CDM) ou kelly (Repertory Grid com exemplos visuais)"

  collective_tacit:
    definition: >
      Conhecimento tacito embutido em praticas sociais e culturais de um grupo.
      So pode ser adquirido por imersao na comunidade.
    examples:
      - "Cultura de uma equipe de engenharia"
      - "Normas implicitas de um mercado"
      - "O 'jeito' de fazer as coisas em uma organizacao"
    extraction_difficulty: "VERY HIGH — requer observacao participante ou narrativas longas"
    extraction_agent: "klein (CDM com incidentes culturais) + leonard (Deep Smarts)"
```

3.3. **Avaliacao por dominio:**

Para cada dominio, Collins gera uma avaliacao completa:

```yaml
domain_expertise_assessment:
  domain: "Marketing Digital"
  overall_level: "contributory"

  sub_assessments:
    - sub_domain: "Estrategia de campanhas"
      level: "contributory"
      tacit_type_dominant: "somatic"
      evidence: "Cria estrategias originais, treina outros profissionais, resolve problemas ineditos"
      confidence: 0.85

    - sub_domain: "SEO Tecnico"
      level: "interactional"
      tacit_type_dominant: "relational"
      evidence: "Conversa fluentemente com especialistas SEO, avalia resultados, mas delega execucao"
      confidence: 0.75

    - sub_domain: "Data Science aplicado a marketing"
      level: "primary_source"
      tacit_type_dominant: "relational"
      evidence: "Leu livros sobre o tema, entende conceitos, mas nao aplica modelos"
      confidence: 0.80
```

3.4. **Perguntas de calibracao Collins (se interativo):**

Collins faz perguntas especificas para distinguir niveis:

- "Se um especialista em [dominio X] fizesse uma apresentacao tecnica, voce conseguiria acompanhar e fazer perguntas pertinentes?" (interactional test)
- "Voce ja resolveu um problema em [dominio X] que nao tinha solucao pronta? Me conte sobre ele." (contributory test)
- "Se tivesse que treinar alguem em [dominio X], quais partes voce conseguiria ensinar e quais partes voce precisaria de outra pessoa?" (scope test)
- "Ha partes de [dominio X] que voce sabe 'de corpo' — que voce nao conseguiria escrever num manual?" (somatic test)

**Checkpoint:** Diagnostico Collins completo para todos os dominios. Output pronto para consolidacao.

---

### Step 4: Geracao do Expertise Profile (5-8 min)

**Executor:** collins (consolida com dados de polanyi)

4.1. **Construcao da matriz cruzada Polanyi x Collins:**

Para cada dominio, cruzar tipo de conhecimento (Polanyi) com nivel de expertise (Collins):

```yaml
expertise_matrix:
  - domain: "Marketing Digital"
    polanyi_type: "predominantly_tacit"
    polanyi_tacit_ratio: 0.65
    collins_level: "contributory"
    collins_tacit_type: "somatic"
    extraction_priority: "CRITICAL"
    recommended_agents:
      primary: "klein"
      secondary: "kelly"
    recommended_technique: "CDM com incidentes reais de campanha"
    extraction_difficulty: "HIGH"
    estimated_sessions: 3

  - domain: "Copywriting"
    polanyi_type: "mixed"
    polanyi_tacit_ratio: 0.55
    collins_level: "contributory"
    collins_tacit_type: "relational + somatic"
    extraction_priority: "HIGH"
    recommended_agents:
      primary: "kelly"
      secondary: "klein"
    recommended_technique: "Repertory Grid com exemplos de copys + CDM"
    extraction_difficulty: "MEDIUM"
    estimated_sessions: 2
```

4.2. **Priorizacao de extracao:**

A matriz gera uma priorizacao automatica:

| Tacit Ratio | Collins Level | Priority | Rationale |
|-------------|--------------|----------|-----------|
| >= 0.7 | Contributory | CRITICAL | Conhecimento profundo tacito em risco — extrair primeiro |
| >= 0.7 | Interactional | HIGH | Tacito alto mas nao praticante — validar com praticantes |
| 0.4-0.7 | Contributory | HIGH | Mistura tacito/explicito — extracao multi-tecnica |
| 0.4-0.7 | Interactional | MEDIUM | Intermediario — Kelly (Q&A) e suficiente |
| < 0.4 | Qualquer | LOW | Predominantemente explicito — documentacao direta |
| Qualquer | Beer-mat/Popular | SKIP | Sem profundidade para extracao significativa |

4.3. **Identificacao de areas cegas:**

Polanyi e Collins frequentemente revelam areas que o especialista NAO mencionou mas que provavelmente existem:

- Dominios adjacentes (se tem expertise em X, provavelmente tem em Y)
- Meta-expertises (como o especialista APRENDE, como ENSINA, como DECIDE)
- Conhecimento contextual/organizacional (Collins collective tacit)

Documentar como `blind_spots` no perfil.

4.4. **Recomendacoes para Tier 1:**

Para cada dominio priorizado, especificar:
- Qual agente de extracao usar (klein, leonard, kelly)
- Qual tecnica aplicar (CDM, Deep Smarts audit, Repertory Grid)
- Quantas sessoes estimar
- Que tipo de output esperar

**Checkpoint:** Expertise Profile completo e formatado.

---

### Step 5: Geracao do Relatorio de Diagnostico (5-8 min)

**Executor:** polanyi + collins (colaborativo)

5.1. **Compilar diagnosis-report.md:**

O relatorio inclui:

```markdown
# Diagnosis Report: {nome_especialista}

## Resumo Executivo
- Total de dominios identificados: N
- Dominios com expertise contributiva: X
- Dominios com expertise interacional: Y
- Dominios com conhecimento predominantemente tacito: Z
- Prioridade geral de extracao: ALTA / MEDIA / BAIXA

## Mapa de Dominios
[Tabela visual com todos os dominios, tipo Polanyi, nivel Collins]

## Classificacao Detalhada por Dominio
[Para cada dominio: analise Polanyi + analise Collins + matriz cruzada]

## Perfil de Indwelling
[Ferramentas e frameworks incorporados pelo especialista]

## Recomendacoes de Extracao
[Agentes recomendados, tecnicas, estimativa de sessoes por dominio]

## Areas Cegas Identificadas
[Dominios provavelmente existentes mas nao declarados]

## Proximos Passos
[Sequencia recomendada de tasks no pipeline]
```

5.2. **Compilar diagnosis-data.yaml:**

Dados estruturados para consumo por agentes downstream:

```yaml
diagnosis:
  metadata:
    specialist_name: "{nome}"
    specialist_slug: "{slug}"
    diagnosis_date: "2026-02-18T10:30:00Z"
    diagnosis_scope: "full"
    polanyi_version: "1.0.0"
    collins_version: "1.0.0"

  summary:
    total_domains: 8
    contributory_count: 3
    interactional_count: 3
    lower_count: 2
    high_tacit_count: 4
    critical_priority_count: 2
    estimated_total_sessions: 12

  domains:
    - id: DOM-001
      name: "Marketing Digital"
      polanyi:
        type: "predominantly_tacit"
        tacit_ratio: 0.65
        indwelling_items: ["Google Analytics", "Meta Ads Manager"]
        proximal_elements: [...]
        distal_elements: [...]
      collins:
        level: "contributory"
        tacit_type: "somatic"
        confidence: 0.85
      extraction:
        priority: "CRITICAL"
        agents: ["klein", "kelly"]
        technique: "CDM + Repertory Grid"
        estimated_sessions: 3
      blind_spots: ["Neuromarketing", "Behavioral Economics aplicado"]

  extraction_sequence:
    - order: 1
      domain: "Marketing Digital"
      agent: "klein"
      technique: "CDM"
      estimated_duration: "90 min"
    - order: 2
      domain: "Copywriting"
      agent: "kelly"
      technique: "Repertory Grid"
      estimated_duration: "45 min"
    # ...
```

5.3. **Compilar expertise-profile.md:**

Perfil visual e narrativo para referencia rapida:

```markdown
# Expertise Profile: {nome_especialista}

## Periodic Table Summary

| Dominio | Nivel Collins | Tipo Polanyi | Tacit Type | Priority |
|---------|--------------|-------------|------------|----------|
| Marketing Digital | Contributory | Tacito (0.65) | Somatic | CRITICAL |
| Copywriting | Contributory | Misto (0.55) | Relational+Somatic | HIGH |
| SEO Tecnico | Interactional | Misto (0.45) | Relational | MEDIUM |
| Data Science | Primary Source | Explicito (0.30) | Relational | LOW |

## Indwelling Map
[Ferramentas incorporadas e seu nivel de integracao]

## Extraction Roadmap
[Sequencia recomendada com agentes e duracao estimada]
```

**Checkpoint:** Todos os arquivos de output gerados e validados.

---

### Step 6: Validacao e Quality Gate QG-002 (3-5 min)

**Executor:** polanyi + collins (auto-validacao)

6.1. **Checklist de validacao interna:**

- [ ] Todos os dominios possuem classificacao Polanyi completa
- [ ] Todos os dominios possuem classificacao Collins completa
- [ ] Nenhuma inconsistencia critica (ex: tacit ratio 0.9 + beer-mat knowledge)
- [ ] Evidencias documentadas para cada classificacao
- [ ] Perguntas de calibracao respondidas (se modo interativo)
- [ ] Matriz cruzada gera priorizacao logica
- [ ] Recomendacoes de extracao sao especificas e acionaveis
- [ ] Todos os arquivos de output existem e sao validos (YAML parseavel, Markdown formatado)
- [ ] Expertise Profile e consumivel por agentes Tier 1

6.2. **Verificacao de consistencia:**

- Tacit ratio alto (>0.7) + Collins contributory = ESPERADO (consistente)
- Tacit ratio alto (>0.7) + Collins beer-mat = INCONSISTENTE (flag para revisao)
- Tacit ratio baixo (<0.3) + Collins contributory = INCOMUM (possivel — verificar se expertise e muito sistematizado)
- Somatic tacit + area puramente digital = VERIFICAR (somatic e mais comum em habilidades fisicas)

6.3. **Gate Decision:**

| Score | Decision | Action |
|-------|----------|--------|
| 9/9 | PASS | Proceder para Tier 1 |
| 7-8/9 | PASS com observacoes | Documentar gaps, proceder |
| 5-6/9 | CONDITIONAL | Corrigir itens faltantes antes de proceder |
| < 5/9 | FAIL | Re-executar diagnostico |

**Checkpoint:** Quality Gate QG-002 decidido. Se PASS, pipeline liberado para Tier 1.

---

## Outputs

### Primary Output 1: Diagnosis Report

**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/diagnosis-report.md`
**Content:** Relatorio narrativo completo com todas as classificacoes, evidencias, e recomendacoes. Legivel por humanos. Inclui resumo executivo, mapa de dominios, classificacoes detalhadas por dominio, perfil de indwelling, recomendacoes de extracao, areas cegas e proximos passos.

### Primary Output 2: Expertise Profile

**Format:** Markdown
**Location:** `outputs/repertoire-mapper/{slug}/expertise-profile.md`
**Content:** Perfil sintetico e visual de expertise. Tabela Periodic Table, mapa de indwelling, roadmap de extracao. Referencia rapida para agentes e para o usuario.

### Secondary Output: Diagnosis Data

**Format:** YAML
**Location:** `outputs/repertoire-mapper/{slug}/diagnosis-data.yaml`
**Content:** Dados estruturados completos do diagnostico. Consumido por agentes downstream (klein, leonard, kelly, nonaka). Inclui metadados, summary, classificacao por dominio e sequencia de extracao recomendada.

---

## Validation

### Checklist

- [ ] Perfil do especialista lido e processado
- [ ] Fontes de contexto analisadas (se fornecidas)
- [ ] Mapa de dominios construido com pelo menos 3 dominios
- [ ] Classificacao Polanyi completa para todos os dominios (tipo + tacit ratio + proximal/distal)
- [ ] Analise de indwelling realizada para ferramentas e frameworks
- [ ] Classificacao Collins completa para todos os dominios (nivel + tacit type)
- [ ] Perguntas de calibracao documentadas (se modo interativo)
- [ ] Matriz cruzada Polanyi x Collins construida
- [ ] Priorizacao de extracao gerada com agentes e tecnicas recomendadas
- [ ] Areas cegas identificadas e documentadas
- [ ] diagnosis-report.md gerado e completo
- [ ] expertise-profile.md gerado e completo
- [ ] diagnosis-data.yaml gerado e valido (YAML parseavel)
- [ ] Nenhuma inconsistencia critica entre Polanyi e Collins
- [ ] Quality Gate QG-002 avaliado

### Success Criteria

**Threshold: 12/15 no checklist acima**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Domain coverage** | Todos os dominios + areas cegas | Todos os dominios declarados | Dominios faltando |
| **Polanyi depth** | Tacit ratio + proximal/distal + indwelling | Tacit ratio + tipo geral | Apenas tipo geral |
| **Collins precision** | Sub-dominios avaliados individualmente | Dominio avaliado como um todo | Classificacao vaga |
| **Evidence quality** | Cada classificacao com citacao direta | Maioria com evidencia | Classificacoes sem evidencia |
| **Extraction roadmap** | Agentes + tecnicas + sessoes + sequencia | Agentes + tecnicas | Apenas prioridade generica |
| **Consistency** | Zero inconsistencias | Inconsistencias menores documentadas | Inconsistencias criticas nao resolvidas |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Intake e contextualizacao** | 3-5 min | Ler perfil + processar fontes |
| **Classificacao Polanyi** | 10-15 min | 2-3 min por dominio |
| **Diagnostico Collins** | 10-15 min | 2-3 min por dominio |
| **Geracao expertise profile** | 5-8 min | Matriz cruzada + priorizacao |
| **Geracao relatorio** | 5-8 min | Compilacao + formatacao |
| **Validacao** | 3-5 min | Checklist + consistency check |
| **Total** | 36-56 min | Escala com numero de dominios |

---

## Integration

### Feeds To

**Workflow:** Full Mapping Pipeline (`full-mapping-pipeline`)

**Next Tasks in Sequence:**
- **TK-RM-002:** extract-from-source — Usa: diagnosis-data.yaml (prioridade de dominios, tipo de extracao)
- **TK-RM-003:** run-qa-session — Usa: expertise-profile.md (dominios para Q&A, nivel esperado)
- **TK-RM-005:** map-deep-smarts — Usa: diagnosis-data.yaml (dominios contributory para Deep Smarts audit)

### Depends On

- **Input:** subject_profile (do usuario ou repertoire-chief)
- **Input:** context_sources (opcional, do usuario ou ETL Data Collector)

### Agent Routing

**Primary Agents:** polanyi (classificacao epistemologica) → collins (diagnostico de expertise)
**Quality Gate:** QG-002 (blocking — Tier 1 nao inicia sem diagnostico completo)

---

## Quality Threshold

**Pass/Fail Gate:** Checklist score >= 12/15

Se < 12/15:
1. Identificar criterios faltantes
2. Se coverage baixa: revisitar fontes de contexto, adicionar dominios
3. Se Polanyi incompleto: rodar perguntas de calibracao adicionais
4. Se Collins impreciso: buscar evidencias complementares em fontes
5. Se evidence fraca: solicitar exemplos concretos ao especialista
6. Re-validar

**Common Failure Reasons:**
- Perfil do especialista muito generico (faltam dominios especificos)
- Fontes de contexto insuficientes para calibrar sem interacao
- Especialista com auto-percepcao distorcida (Dunning-Kruger ou sindrome do impostor)
- Dominio muito nicho sem vocabulario padronizado

---

## Notes for Executor

### Polanyi — Quando o especialista diz "eu so sei fazer"

Esse e o SINAL mais forte de conhecimento tacito profundo. Quando alguem diz "nao sei explicar, eu so sei fazer", Polanyi classifica como tacit ratio muito alto (>0.8) com forte componente somatic. A analogia classica: "sabemos mais do que podemos dizer." Documente essa declaracao como evidencia primaria.

### Collins — A armadilha do "interactional"

Muitas pessoas confundem interactional expertise (sabe falar sobre) com contributory expertise (sabe fazer). O teste decisivo de Collins: "Se todos os outros praticantes desaparecessem, essa pessoa conseguiria fazer o trabalho sozinha em situacoes novas?" Se nao, e interactional.

### Quando Polanyi e Collins Discordam

Nao discordam — complementam. Polanyi diz "que tipo de conhecimento e este" e Collins diz "quao profundo e." Se aparentam discordar (ex: Polanyi diz altamente tacito, Collins diz beer-mat), a resolucao e: o dominio existe mas o especialista tem apenas exposicao superficial — sabe que e tacito mas nao possue o tacito.

### Calibracao com Humildade vs Arrogancia

Alguns especialistas subestimam suas competencias (sindrome do impostor). Outros superestimam (Dunning-Kruger). Polanyi e Collins devem cruzar declaracoes com evidencias das fontes de contexto. Se o especialista diz "sou basico em X" mas os posts mostram analises sofisticadas, a evidencia prevalece.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
