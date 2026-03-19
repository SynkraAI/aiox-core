---
id: TK-RM-011
name: Generate Operating Manual
version: 1.0.0
executor: chin + forte
purpose: >
  Gerar manual operacional pessoal -- documento pratico que resume como a
  pessoa opera. Combina a expertise de organizacao de forte (Tiago Forte)
  com a clareza pratica de chin (Cedric Chin) para produzir um documento
  em primeira pessoa que o sujeito pode usar como referencia diaria para
  suas decisoes, principios, frameworks e regras de ouro.
squad: repertoire-mapper
phase: PHASE_6_DELIVERY
tier: 3

inputs:
  - name: repertoire_manifest
    type: document
    description: "Manifest completo gerado por TK-RM-010"
    required: true
    format: "YAML"
    location: "outputs/repertoire/{slug}/repertoire-manifest.yaml"

  - name: practitioner_items
    type: list
    description: "Itens traduzidos por chin (TK-RM-009)"
    required: true
    format: "YAML com traducoes e if-then"
    location: "outputs/repertoire/{slug}/practitioner-items.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis traduzido (versao pratica)"
    required: true
    format: "Markdown"
    location: "outputs/repertoire/{slug}/practitioner-gap-analysis.md"

  - name: quick_reference
    type: document
    description: "Quick reference gerado por chin (TK-RM-009)"
    required: true
    format: "Markdown"
    location: "outputs/repertoire/{slug}/quick-reference.md"

  - name: para_structure
    type: directory
    description: "Estrutura PARA gerada por forte (TK-RM-008)"
    required: true
    format: "Directory com files organizados"
    location: "outputs/repertoire/{slug}/para/"

  - name: knowledge_graph
    type: document
    description: "Knowledge graph atualizado"
    required: false
    format: "JSON"
    location: "outputs/repertoire/{slug}/knowledge-graph.json"

  - name: subject_context
    type: document
    description: "Informacoes contextuais sobre o sujeito (nome, dominio, estilo)"
    required: false
    format: "YAML"
    location: "inputs/repertoire/{slug}/subject-context.yaml"

preconditions:
  - "TK-RM-010 (generate-manifest) completo"
  - "TK-RM-009 (translate-output) completo"
  - "TK-RM-008 (organize-para) completo"
  - "TK-RM-007 (validate-gaps) completo"
  - "Agentes chin e forte carregados"
  - "Manifest validado e disponivel"

outputs:
  - name: operating_manual
    path: "outputs/repertoire/{slug}/operating-manual.md"
    format: markdown
    description: >
      Manual operacional pessoal em primeira pessoa.
      Documento pratico de 15-30 paginas cobrindo:
      como o sujeito pensa, decide, opera, e o que evitar.

  - name: manual_metadata
    path: "outputs/repertoire/{slug}/manual-metadata.yaml"
    format: yaml
    description: >
      Metadata do manual: secoes, word count, itens incluidos,
      fontes referenciadas.

validation:
  success_criteria:
    - "Manual escrito 100% em primeira pessoa"
    - "Zero jargao academico (toda traducao de chin aplicada)"
    - "Todas as areas de expertise cobertas"
    - "Decision frameworks em formato acionavel"
    - "Rules of thumb listadas com contexto"
    - "Gaps documentados como 'pontos de atencao'"
    - "Double-loop opportunities como 'perguntas para me fazer'"
    - "Manual e auto-suficiente (nao requer outro documento)"
    - "Tamanho entre 3.000-10.000 palavras"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Generate Operating Manual

## Executive Summary

O operating-manual.md e o deliverable mais pessoal e pratico do pipeline.
Enquanto o manifest e tecnico e programatico, o manual e humano e acionavel.
Escrito em primeira pessoa ("Eu opero assim..."), ele funciona como um
espelho estruturado: resume como o sujeito pensa, decide, o que valoriza,
onde e forte, onde tem pontos cegos, e que perguntas deve se fazer antes
de decisoes importantes.

**Posicao no Pipeline:** Task 11 -- Phase 6 (Delivery) do Full Mapping Pipeline
**Definicao de Sucesso:** Manual que o sujeito reconhece como retrato fiel e util
**Execucao Dual:** chin (linguagem) + forte (estrutura) trabalham juntos

---

## Purpose

Todo profissional experiente tem um "sistema operacional pessoal" -- regras
implicitas, heuristicas testadas, valores que guiam decisoes, padroes que
reconhece automaticamente. Mas esse sistema e quase inteiramente tacito.
O profissional OPERA por esse sistema sem nunca te-lo documentado.

O operating-manual.md torna esse sistema explicito e acessivel. E como
se o sujeito escrevesse um "manual do usuario de si mesmo" -- util para:

1. **Auto-reflexao** -- "Eu sabia que fazia isso, mas nunca tinha articulado"
2. **Onboarding** -- Novos membros de equipe entendem como o lider pensa
3. **Mentoria** -- O sujeito pode transferir seu sistema para mentorados
4. **Clone cognitivo** -- Base para construir um clone IA do sujeito
5. **Evolucao** -- Baseline para medir crescimento e mudanca ao longo do tempo

**Inspiracao:** Buster Benson's Codex Vitae + Ray Dalio's Principles + Stripe's Operating Manual tradition

---

## Executor Type

**Agents: chin + forte (dual execution)**

- **forte's Role:** Estruturacao do manual, organizacao das secoes, progressive summarization, PARA alignment
- **chin's Role:** Linguagem pratica, remocao de jargao, exemplos concretos, formato if-then
- **Division of Work:** forte estrutura o esqueleto, chin escreve o conteudo
- **Human Role:** Nenhum durante geracao (sujeito valida e ajusta depois)
- **Estimated Runtime:** 20-40 minutos

---

## Steps

### Step 1: Extract Manual Content from Manifest (3-5 min)

**Agent Activity (forte):**

Extrair do manifest os itens que devem compor o manual, organizados por secao.

**Content Extraction Map:**

```yaml
manual_sections:
  identity:
    source: "manifest.domains + expertise_profile"
    content: "Quem eu sou profissionalmente, minhas areas de expertise"
    items_filter: "dreyfus_level >= proficient"

  principles:
    source: "manifest.domains[].items WHERE type = 'value'"
    content: "Valores e principios que guiam minhas decisoes"
    items_filter: "para_category IN ['A'] AND confidence >= 0.7"

  decision_frameworks:
    source: "manifest.domains[].items WHERE type IN ['decision_framework', 'mental_model']"
    content: "Como eu penso sobre problemas e tomo decisoes"
    items_filter: "confidence >= 0.6"

  rules_of_thumb:
    source: "manifest.domains[].items WHERE type = 'rule_of_thumb'"
    content: "Regras praticas que aprendi com experiencia"
    items_filter: "confidence >= 0.6"

  patterns_i_recognize:
    source: "manifest.domains[].items WHERE type = 'pattern'"
    content: "Padroes que reconheco automaticamente"
    items_filter: "dreyfus_level >= competent"

  skills_and_capabilities:
    source: "manifest.domains[].items WHERE type = 'skill'"
    content: "O que sei fazer e em que nivel"
    items_filter: "para_category IN ['A', 'P']"

  blindspots_and_traps:
    source: "gap_analysis WHERE type IN ['blind_spot', 'contradiction', 'execution_gap']"
    content: "Onde tenho pontos cegos e armadilhas que devo evitar"
    items_filter: "severity IN ['critical', 'significant']"

  growth_edges:
    source: "gap_analysis.double_loop_opportunities"
    content: "Onde posso evoluir questionando minhas premissas"
    items_filter: "estimated_impact IN ['critical', 'high']"

  metaphors_and_analogies:
    source: "manifest.domains[].items WHERE type = 'metaphor'"
    content: "Analogias que uso para pensar sobre problemas"
    items_filter: "confidence >= 0.5"

  deep_smarts:
    source: "manifest.domains[].items WHERE type = 'deep_smart'"
    content: "Conhecimento profundo que so tenho eu (ou poucos)"
    items_filter: "para_category = 'A'"
```

**Checkpoint:** Conteudo extraido e organizado por secao

---

### Step 2: Write Manual in First Person (8-15 min)

**Agent Activity (chin + forte):**

Escrever o manual em primeira pessoa, usando linguagem pratica (chin)
dentro da estrutura definida (forte).

**Manual Structure:**

```markdown
# Manual Operacional: {Nome do Sujeito}

> Este manual descreve como eu penso, decido e opero.
> Nao e um curriculo nem um portfolio -- e um espelho estruturado
> das minhas regras de operacao, testadas por experiencia.
>
> Gerado em: {YYYY-MM-DD}
> Baseado em: mapeamento completo de repertorio

---

## 1. Quem Eu Sou (Profissionalmente)

Sou {descricao de identidade profissional em 2-3 paragrafos}.

Minhas areas de maior expertise:
- **{Area 1}** -- {Dreyfus traduzido}: {descricao pratica}
- **{Area 2}** -- {Dreyfus traduzido}: {descricao pratica}
- **{Area 3}** -- {Dreyfus traduzido}: {descricao pratica}

Onde tenho conhecimento mas nao sou especialista:
- **{Area N}** -- {descricao honesta do nivel}

---

## 2. Meus Principios

Estas sao as crencas que guiam como eu opero. Nao sao slogans --
sao regras testadas por experiencia.

### Principio 1: {Titulo curto}

{Descricao em 2-3 frases, escrita em primeira pessoa}

**Na pratica:** {Exemplo concreto de como aplico}
**Excecao:** {Quando este principio NAO se aplica}
**Origem:** {Como aprendi este principio}

### Principio 2: {Titulo curto}
...

---

## 3. Como Eu Tomo Decisoes

### 3.1 Meus Frameworks de Decisao

#### Framework: {Nome pratico}

**Quando usar:** {Situacao}
**Como funciona:**
1. {Passo 1}
2. {Passo 2}
3. {Passo 3}

**Exemplo real:** {Exemplo do dominio do sujeito}

#### Framework: {Nome pratico}
...

### 3.2 Minhas Regras de Ouro

Estas sao heuristicas que uso automaticamente. Nao sao 100% certas,
mas acertam na maioria das vezes.

| # | Regra | Quando Usar | Confianca |
|---|-------|------------|-----------|
| 1 | {Regra em 1 frase} | {Contexto} | {Alta/Media} |
| 2 | {Regra em 1 frase} | {Contexto} | {Alta/Media} |
| ... | ... | ... | ... |

### 3.3 Padroes Que Reconheco

Com experiencia, aprendi a reconhecer estes padroes rapidamente:

1. **{Nome do padrao}**
   - O que vejo: {sinais}
   - O que geralmente significa: {interpretacao}
   - O que faco: {acao}

2. **{Nome do padrao}**
   ...

---

## 4. Minhas Habilidades

### O que faco excepcionalmente bem

{Lista de skills Expert/Proficient com descricao pratica}

### O que faco bem

{Lista de skills Competent com descricao pratica}

### O que estou desenvolvendo

{Lista de skills em desenvolvimento}

### O que NAO faco bem (e sei disso)

{Lista honesta de limitacoes conhecidas}

---

## 5. Meus Pontos Cegos

> Esta secao e a mais valiosa do manual. Sao coisas que eu
> nao percebia sobre mim mesmo ate o mapeamento revelar.

### 5.1 Coisas que digo que faco mas nem sempre faco

{Execution gaps traduzidos em linguagem direta}

### 5.2 Habilidades que tenho mas nao reconhecia

{Hidden expertise em linguagem positiva}

### 5.3 Crencas que se contradizem

{Contradicoes sem julgamento, com caminho de resolucao}

---

## 6. Perguntas Para Me Fazer

Antes de decisoes importantes, devo me perguntar:

1. {Pergunta derivada de double-loop opportunity 1}
   - **Por que:** {Explica que premissa esta sendo questionada}

2. {Pergunta derivada de double-loop opportunity 2}
   - **Por que:** {Explica que premissa esta sendo questionada}

3. {Pergunta derivada de gap critico}
   - **Por que:** {Explica o risco}

---

## 7. Como Trabalhar Comigo

> Esta secao e util para quem trabalha diretamente comigo.

### O que esperar de mim

{Padroes consistentes de comportamento}

### O que me energiza

{Atividades e contextos onde performo melhor}

### O que me drena

{Atividades e contextos que evito ou performo pior}

### Como me dar feedback

{Baseado no Model I/II assessment -- o modo que funciona}

### Meus modos de operacao

| Modo | Quando Ativo | Como Me Comporto |
|------|-------------|-----------------|
| {Modo 1} | {Contexto} | {Descricao} |
| {Modo 2} | {Contexto} | {Descricao} |

---

## 8. Minhas Analogias Favoritas

Eu penso por analogias. Estas sao as que mais uso:

1. **"{Analogia}"** -- Uso para pensar sobre {dominio}.
   Significa: {interpretacao pratica}

2. **"{Analogia}"** -- Uso para pensar sobre {dominio}.
   Significa: {interpretacao pratica}

---

## 9. Conhecimento Que So Eu Tenho

> Estas sao competencias raras ou unicas que desenvolvi.
> Se eu sair de cena, esse conhecimento se perde.

1. **{Deep smart 1}**
   - O que e: {descricao pratica}
   - Como adquiri: {origem}
   - Por que e raro: {contexto}
   - Como transferir: {sugestao}

2. **{Deep smart 2}**
   ...

---

## 10. Meu Mapa de Conhecimento

```
{Representacao visual simplificada do knowledge graph}
{Clusters principais com conexoes entre eles}
```

Detalhes completos: ver knowledge-graph.json

---

## Apendice A: Glossario

| Termo | O Que Significa |
|-------|----------------|
| {Termo do dominio} | {Definicao pratica} |

## Apendice B: Fontes do Mapeamento

| Fonte | Tipo | Contribuicao |
|-------|------|-------------|
| {Fonte 1} | {digital/qa_session} | {O que foi extraido} |

---

> Este manual e um retrato de {data}. Eu mudo, e ele deve mudar comigo.
> Proximo remapeamento recomendado: {data + 6 meses}
```

**Writing Rules:**

```yaml
writing_rules:
  voice:
    person: "Primeira pessoa (eu, meu, minha)"
    tone: "Direto, honesto, sem auto-promocao"
    register: "Profissional mas acessivel"

  format:
    max_sentence_length: 25  # palavras por frase
    paragraphs: "Curtos (3-5 frases max)"
    lists: "Preferir listas sobre paragrafos quando possivel"
    examples: "Obrigatoriamente do dominio do sujeito"

  content:
    no_jargon: true  # Usar traducoes de chin
    no_hedging: "Evitar 'talvez', 'possivelmente' -- ser direto"
    no_self_promotion: "Nao e CV -- e manual operacional"
    include_limitations: true  # Pontos cegos fazem parte
    include_contradictions: true  # Com honestidade

  source_attribution:
    style: "Nao citar frameworks academicos no corpo"
    location: "Referenciar em notas de rodape se necessario"
    exception: "Se o sujeito usa o termo naturalmente (ex: 'mental model')"
```

**Checkpoint:** Manual escrito em rascunho

---

### Step 3: Review and Polish (3-5 min)

**Agent Activity (chin):**

Revisar o manual para garantir que:
- Linguagem e 100% pratica (zero jargao)
- Tom e consistente (primeira pessoa, direto)
- Nao ha auto-promocao excessiva
- Pontos cegos estao documentados sem julgamento
- Exemplos sao concretos e do dominio do sujeito
- O manual faz sentido lido de cima a baixo

**Review Checklist:**

```yaml
review_checklist:
  language:
    - check: "100% primeira pessoa"
      scan: "Presenca de 'eu', 'meu', 'minha' em todas as secoes"
    - check: "Zero jargao academico"
      scan: "Contra jargon_inventory de TK-RM-009"
    - check: "Frases curtas"
      scan: "Media <= 25 palavras por frase"

  content:
    - check: "Todas as secoes preenchidas"
      count: 10  # secoes obrigatorias
    - check: "Principios tem exemplos"
      coverage: "100%"
    - check: "Decision frameworks tem passos claros"
      coverage: "100%"
    - check: "Rules of thumb tem contexto"
      coverage: "100%"
    - check: "Pontos cegos documentados sem julgamento"
      tone: "Neutro, factual"

  coherence:
    - check: "Consistencia interna"
      verify: "Principios nao contradizem rules of thumb"
    - check: "Alinhamento com manifest"
      verify: "Dados batem com repertoire-manifest.yaml"
    - check: "Leitura fluida"
      verify: "Faz sentido lido de cima a baixo sem consultar outros docs"
```

**Checkpoint:** Manual revisado e polido

---

### Step 4: Generate Manual Metadata (2-3 min)

**Agent Activity (forte):**

Compilar metadata do manual para rastreabilidade.

**manual-metadata.yaml:**

```yaml
manual_metadata:
  subject: "{nome}"
  generated: "2026-02-18"
  executors: ["chin", "forte"]
  version: "1.0.0"

  structure:
    total_sections: 10
    total_subsections: N
    total_word_count: N
    estimated_read_time: "{N} minutos"

  content_sources:
    items_from_manifest: N
    gaps_from_analysis: N
    double_loop_from_analysis: N
    deep_smarts_included: N

  coverage:
    domains_covered: N
    domains_total: N
    percentage: X%
    missing_domains: ["..."]

  quality:
    jargon_count: 0
    first_person_percentage: X%
    average_sentence_length: N
    examples_count: N
    review_checklist_score: "N/N"

  related_files:
    manifest: "repertoire-manifest.yaml"
    quick_reference: "quick-reference.md"
    knowledge_graph: "knowledge-graph.json"
    gap_analysis: "gap-analysis.md"
```

**Checkpoint:** Metadata gerada

---

### Step 5: Final Write (1-2 min)

**Agent Activity:**

- Escrever operating-manual.md no path final
- Escrever manual-metadata.yaml
- Verificar integridade dos arquivos

**Checkpoint:** Arquivos finais escritos e verificados

---

## Validation

### Checklist

- [ ] Manual escrito 100% em primeira pessoa
- [ ] Zero jargao academico
- [ ] 10 secoes obrigatorias preenchidas
- [ ] Principios com exemplos concretos do dominio
- [ ] Decision frameworks com passos claros
- [ ] Rules of thumb com contexto (quando usar/nao usar)
- [ ] Pontos cegos documentados sem julgamento
- [ ] Double-loop opportunities como perguntas auto-reflexivas
- [ ] Deep smarts documentados com urgencia de transferencia
- [ ] Manual e auto-suficiente (nao requer consulta a outros docs)
- [ ] Tamanho entre 3.000-10.000 palavras
- [ ] Manual metadata gerada

### Success Criteria

**Threshold: 8/10 no checklist acima**

| Criteria | Excelente (3) | Aceitavel (2) | Insuficiente (1) |
|----------|--------------|----------------|-------------------|
| **Voice** | 100% primeira pessoa, natural | 95%+ primeira pessoa | Misto ou terceira pessoa |
| **Clarity** | Praticante entende sem ajuda | Pequenas partes confusas | Secoes incompreensiveis |
| **Completeness** | 10/10 secoes, rich content | 8/10 secoes | < 8 secoes |
| **Honesty** | Pontos cegos e gaps incluidos | Parcialmente incluidos | Omitidos |
| **Actionability** | Cada secao gera acao concreta | Maioria acionavel | Descritivo sem acao |
| **Length** | 5.000-8.000 palavras | 3.000-10.000 palavras | Fora do range |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Extract Content** | 3-5 min | From manifest and translations |
| **Write Manual** | 8-15 min | Core writing, most intensive |
| **Review & Polish** | 3-5 min | Language and coherence check |
| **Generate Metadata** | 2-3 min | Compile metadata |
| **Final Write** | 1-2 min | Write files |
| **Total** | 17-30 min | Depends on repertoire size |

---

## Integration

### Feeds To

- **Phase 6 Delivery:** Manual e entregavel direto ao sujeito
- **Clone Deploy squad:** Manual e fonte para system prompt de clones cognitivos
- **Content Distillery squad:** Manual fornece voice e frameworks para conteudo

### Depends On

- **TK-RM-010 (generate-manifest):** Manifest e a fonte de dados
- **TK-RM-009 (translate-output):** Traducoes e linguagem pratica
- **TK-RM-008 (organize-para):** Estrutura PARA para organizacao
- **TK-RM-007 (validate-gaps):** Gaps para secao de pontos cegos

### Agent Routing

**Primary Agents:** chin (language) + forte (structure)
**Quality Review:** repertoire-chief (valida manual final)

---

## Notes for Executor

### Dual Agent Coordination

Esta task requer coordenacao entre dois agentes. O protocolo e:
1. **forte** extrai e estrutura o esqueleto (Step 1)
2. **chin** escreve o conteudo com linguagem pratica (Step 2)
3. **chin** revisa (Step 3)
4. **forte** gera metadata (Step 4)

Se houver conflito entre estrutura e linguagem, linguagem vence --
o manual precisa ser legivel acima de tudo.

### O Manual Nao E Um CV

A tentacao de transformar o manual em auto-promocao e real. Resista.
O manual deve ser honesto: inclui pontos cegos, contradicoes, e
limitacoes. Um manual que so tem qualidades nao e util -- e marketing.

### Primeira Pessoa E Inegociavel

O manual DEVE ser escrito em primeira pessoa. "Eu opero assim" e
fundamentalmente diferente de "O sujeito opera assim." A primeira pessoa
cria ownership e identificacao. Se o sujeito ler e nao se reconhecer,
a linguagem falhou.

### Tamanho Importa

Muito curto (< 3.000 palavras) e superficial. Muito longo (> 10.000 palavras)
e ilegivel. O sweet spot e 5.000-8.000 palavras: profundo o suficiente para
ser util, curto o suficiente para ser consultado.

### Remapeamento Incremental

O manual tem validade limitada. Pessoas mudam. O manual deve incluir uma
nota de "proximo remapeamento recomendado" (tipicamente 6-12 meses).

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
