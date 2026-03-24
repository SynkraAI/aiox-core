# Template: Relatorio Final

<!-- Refinado na Story 4.4: Disclaimer expandido, Metodologia expandida, PDF-friendly, footer -->
> Tom: consultor de campanha falando com o candidato. Direto, acionavel, sem floreios.
> NUNCA usar jargao de AI/ML (NFR12). NUNCA chamar de "pesquisa de opiniao".
> Referencia: Arquitetura secao 7.1-7.2, Spec FR19-FR22, Story 4.4

## Purpose

Gerar o relatorio final legivel por nao-tecnicos (consultores politicos, assessores de campanha, candidatos) a partir dos dados agregados. O leitor-alvo nao sabe o que e LLM, token ou prompt — e ele nao precisa saber.

---

## Inputs

Carregar antes de gerar:

1. **`output/{run}/aggregation.yaml`** — todas as metricas agregadas
2. **`output/{run}/panel.yaml`** — perfis dos agentes (para contexto demografico)
3. **`output/{run}/config-snapshot.yaml`** — metadados da simulacao (tema, preset, datas)
4. **`output/{run}/context-metadata.yaml`** (se existir) — documentos de contexto ingeridos

---

## Estrutura do Relatorio (7 Secoes — FR19)

Gerar o relatorio em `output/{run}/report.md` seguindo EXATAMENTE esta estrutura.

### Cabecalho

```markdown
# Simulacao de Opiniao Publica: {topic}

> **Data:** {data de geracao, formato DD/MM/YYYY}
> **Painel:** {preset_name} ({total_agents} perfis simulados) | **Rodadas:** {total_rounds}
> **Contexto ingerido:** {lista de documentos ou "Nenhum — simulacao baseada em conhecimento geral"}
> **Run ID:** {run_id}
```

---

### Secao 1: Sumario Executivo

**Instrucoes de geracao (Story 4.4 — refinado):**

Comecar com um bloco de bullet points das conclusoes-chave (maximo 5 bullets, cada um com
maximo 2 linhas) e depois 2-3 paragrafos de interpretacao. O leitor deve entender o essencial
nos primeiros 30 segundos antes de ler o relatorio completo.

**Conteudo obrigatorio:**

Bloco 1 — Bullets das conclusoes-chave (gerados primeiro):
- Posicionamento geral com numeros: "{x}% a favor, {y}% contra, {z}% indecisos/neutros"
- Achado principal com segmento: "Segmento {nome}: {achado mais relevante}"
- Vulnerabilidade principal: "Principal risco: {argumento ou tendencia}
- Dado de dinamica (se relevante): "Mudanca de opiniao: {n} agentes ({x}%) ao longo das rodadas"
- Recomendacao central: "Acao prioritaria: {acao}"

Bloco 2 — Paragrafos de contexto (2-3 paragrafos):
- Paragrafo 1: Posicionamento geral com interpretacao
- Paragrafo 2: Achado principal + vulnerabilidade
- Paragrafo 3 (opcional): Dinamica ou recomendacao urgente

**Tom:**
- Direto e acionavel. Cada bullet deve levar a uma decisao.
- NAO usar: "os dados sugerem", "observa-se que", "e interessante notar". USAR: "O painel mostrou", "A vulnerabilidade principal e", "Recomendamos priorizar".
- NAO mencionar: LLM, agentes de AI, simulacao computacional, tokens. USAR: "painel de perfis", "simulacao de cenario", "analise de opiniao".

**Formato markdown:**

```markdown
## Sumario Executivo

**Conclusoes principais:**
- {posicionamento geral com percentuais}
- {achado mais relevante com segmento}
- {vulnerabilidade principal}
- {dado de dinamica, se relevante}
- {recomendacao central}

{2-3 paragrafos de interpretacao e contexto}
```

---

### Secao 2: Dashboard de Sentimento

**Instrucoes de geracao:**

Apresentar a distribuicao de opiniao de forma visual e numerica. Duas tabelas: geral e por segmento.

**Tabela 1: Distribuicao Geral**

Usar dados de `aggregation.yaml → sentiment_distribution.overall` e `intensity.by_position`:

```markdown
## Dashboard de Sentimento

### Distribuicao Geral

| Posicao   | Participacao | Intensidade Media |
|-----------|-------------|-------------------|
| A favor   | {X}%        | {Y}/5             |
| Contra    | {X}%        | {Y}/5             |
| Neutro    | {X}%        | {Y}/5             |
| Indeciso  | {X}%        | {Y}/5             |

**Leitura rapida:** {Uma frase interpretando a tabela. Ex: "A maioria e contra (45%), e com alta convicção (4.1/5). Os indecisos (10%) sao o campo de batalha."}
```

**Tabela 2: Por Segmento Demografico**

Usar dados de `aggregation.yaml → sentiment_distribution.by_segment`:

```markdown
### Sentimento por Segmento

| Segmento | Tamanho | A favor | Contra | Neutro | Indeciso | Posicao Dominante |
|----------|---------|---------|--------|--------|----------|-------------------|
| {nome}   | {n}     | {X}%    | {X}%   | {X}%   | {X}%     | {posicao com maior %} |
| ...      | ...     | ...     | ...    | ...    | ...      | ...               |

**Destaques:**
- {Segmento com posicao mais extrema e por que importa}
- {Segmento mais dividido e o que isso significa}
- {Maior divergencia entre segmentos — diferenca >= 20pp}
```

---

### Secao 3: Mapa de Argumentos

**Instrucoes de geracao:**

Apresentar os argumentos mais relevantes rankeados por impacto, nao por frequencia. O consultor quer saber: "Quais argumentos realmente mudam opiniao?"

Usar dados de `aggregation.yaml → argument_ranking`:

```markdown
## Mapa de Argumentos

### Argumentos A Favor (por impacto)

1. **"{argumento}"** — Impacto: {impact_score} | Frequencia: {n} vezes
   > Ressoa mais com: {segments_resonating}

2. **"{argumento}"** — Impacto: {impact_score} | Frequencia: {n} vezes
   > Ressoa mais com: {segments_resonating}

{... ate 5-7 argumentos mais relevantes}

### Argumentos Contra (por impacto)

1. **"{argumento}"** — Impacto: {impact_score} | Frequencia: {n} vezes
   > Ressoa mais com: {segments_resonating}

{... ate 5-7 argumentos mais relevantes}
```

**Apos as listas, adicionar interpretacao:**

```markdown
### Analise

{2-3 paragrafos interpretando o mapa. Perguntas a responder:}
- Quais argumentos sao "ponte" (ressoam com AMBOS os lados)?
- Ha argumentos que so funcionam em segmentos especificos?
- Qual argumento e o mais perigoso para o candidato?
```

---

### Secao 4: Analise de Vulnerabilidades

**Instrucoes de geracao:**

Esta e a secao mais estrategica do relatorio. Cada vulnerabilidade e um flanco aberto na narrativa que precisa de protecao.

Usar dados de `aggregation.yaml → vulnerabilities`:

```markdown
## Vulnerabilidades Narrativas

> Vulnerabilidades sao argumentos com capacidade comprovada de mudar opiniao em segmentos-chave.
> Threshold de deteccao: um argumento e vulnerabilidade quando impacta >= 20% de um segmento.

### Vulnerabilidade #{n}: "{argumento}"

- **Segmento mais afetado:** {segment_most_affected}
- **Taxa de mudanca:** {opinion_change_rate}% dos perfis deste segmento mudaram de opiniao por causa deste argumento
- **Severidade:** {severity} {emoji: critica=🔴, alta=🟠, media=🟡}
- **Por que importa:** {1-2 frases explicando o risco pratico para a campanha}
- **Contranarrativa sugerida:** {counter_narrative_recommendation — reescrita em tom consultivo}

{... repetir para cada vulnerabilidade, ordenadas por severidade}
```

**Apos listar todas, adicionar:**

```markdown
### Mapa de Risco

| Vulnerabilidade | Severidade | Segmento | Acao Recomendada |
|----------------|------------|----------|------------------|
| {resumo}       | {sev}      | {seg}    | {acao curta}     |
```

---

### Secao 5: Dinamica de Opiniao

**Instrucoes de geracao:**

Mostrar como as opinioes evoluiram entre rodadas. O consultor quer saber: "A situacao esta piorando ou melhorando? O que causou as mudancas?"

Usar dados de `aggregation.yaml → opinion_dynamics`:

```markdown
## Dinamica de Opiniao

### Evolucao entre Rodadas

{Para cada transicao (round_1_to_2, round_2_to_3, etc.):}

**Rodada {N-1} → Rodada {N}:**
- {total_changes} perfis mudaram de posicao ({change_rate}%)
- Direcao predominante: {descricao das mudancas mais significativas}
- Gatilho principal: "{primary_trigger}"
- {notable_shifts}

### Panorama Cumulativo

- **Total de mudancas:** {total_changes_all_rounds} ao longo de {total_rounds} rodadas
- **Taxa geral de mudanca:** {overall_change_rate}%
- **Segmento mais volatil:** {most_volatile_segment} — {interpretacao}
- **Segmento mais estavel:** {most_stable_segment} — {interpretacao}

### O Que Isso Significa

{1-2 paragrafos interpretando a dinamica. Perguntas:}
- As opinioes estao se consolidando ou fragmentando?
- Quem sao os "persuadiveis"? Quais segmentos ainda estao em jogo?
- A exposicao a argumentos contrarios fortaleceu ou enfraqueceu as posicoes?
```

---

### Secao 6: Recomendacoes Estrategicas

**Instrucoes de geracao:**

Esta secao e preenchida pelo output de `templates/recommendations.md`. Executar o gerador de recomendacoes ANTES de montar esta secao, e inserir o resultado aqui.

```markdown
## Recomendacoes Estrategicas

{Inserir output de templates/recommendations.md aqui}
```

Se o gerador de recomendacoes nao foi executado, usar placeholder:

```markdown
## Recomendacoes Estrategicas

> Secao gerada automaticamente pelo gerador de recomendacoes.
> Execute `templates/recommendations.md` com os dados de agregacao para popular esta secao.
```

---

### Secao 7: Metodologia e Disclaimer Etico

**Instrucoes de geracao (Story 4.4 — expandido):**

Transparencia total sobre o metodo em linguagem acessivel — sem jargao tecnico de AI.
O disclaimer etico e OBRIGATORIO (spec secao 10) e deve ter os 4 elementos abaixo.
Tom: um profissional honesto explicando as limitacoes do proprio trabalho para um cliente exigente.

```markdown
## Metodologia

### Como esta simulacao funciona

Pense nesta analise como uma sala de reuniao virtual com {total_agents} pessoas
de perfis muito diferentes — representando uma composicao aproximada do eleitorado
do preset "{preset_name}".

O processo acontece em tres etapas:

**1. Formacao do painel**
Cada participante foi criado com caracteristicas demograficas (idade, regiao, classe
social, escolaridade, religiao) e psicograficas (valores, prioridades, forma de
processar informacao). Esses perfis determinam COMO cada pessoa raciocina sobre o
tema — nao apenas O QUE ela pensa, mas POR QUE.

**2. Deliberacao em {total_rounds} rodadas**
- Rodada 1: Cada participante forma sua opiniao de forma independente, sem influencias externas
- Rodadas seguintes: Cada participante e exposto aos argumentos dos demais e pode manter
  ou revisar sua posicao — simulando o processo de formacao de opiniao que ocorre na
  sociedade quando informacoes circulam via midia, conversas e redes sociais

**3. Agregacao dos resultados**
As posicoes finais sao consolidadas para identificar padroes de distribuicao, argumentos
dominantes e pontos de vulnerabilidade narrativa.

### Configuracao desta simulacao

| Parametro | Valor |
|-----------|-------|
| Painel demografico | {preset_name} |
| Perfis simulados | {total_agents} |
| Segmentos representados | {n_segments} |
| Rodadas de deliberacao | {total_rounds} |
| Contexto externo ingerido | {lista de documentos ou "Nenhum — conhecimento geral"} |
| Origem do painel | {panel_source — "gerado nesta simulacao" ou "reutilizado de: {path}"} |
| Data da simulacao | {data} |
| Run ID | {run_id} |

### Composicao do Painel

| Segmento | Perfis | Descricao |
|----------|--------|-----------|
| {nome}   | {n}    | {descricao curta do segmento} |

---

## Aviso Legal e Disclaimer Etico

> **1. Nao substitui pesquisa de opiniao**
> Esta e uma simulacao exploratoria, NAO uma pesquisa de opiniao publica. Os resultados
> representam cenarios plausiveis baseados em perfis virtuais — nao em entrevistas com
> cidadaos reais. Nao utilize como unica base para decisoes estrategicas ou
> comunicacionais de alto impacto sem validacao por pesquisa quantitativa ou qualitativa.
>
> **2. Limitacoes do metodo**
> Modelos de linguagem tem vies demografico: tendem a sobre-representar perfis urbanos,
> escolarizados e com acesso a informacao digital. Grupos de baixa escolaridade, areas
> rurais e perfis muito especificos podem ser reproduzidos com menor precisao. Os resultados
> tambem variam naturalmente entre execucoes — diferenca de ate 5-10pp e considerada
> dentro da margem de variacao normal.
>
> **3. Uso etico e responsavel**
> Esta ferramenta e destinada a analise exploratoria, planejamento estrategico e geracao
> de hipoteses de comunicacao. Nao deve ser utilizada para campanhas de desinformacao,
> manipulacao psicologica, ataque a grupos demograficos especificos, ou qualquer uso que
> prejudique o processo democratico ou viole direitos fundamentais.
>
> **4. Valide antes de agir**
> Padroes identificados nesta simulacao devem ser confirmados com pesquisa quantitativa
> (survey com amostra representativa) ou qualitativa (focus group, entrevistas em
> profundidade) antes de decisoes de alto impacto. Use esta analise como ponto de partida
> para hipoteses — nao como conclusao definitiva.

---

*Gerado por politica-simulation-mirofish | Simulacao exploratoria — nao substitui pesquisa de opiniao profissional*
*Run ID: {run_id} | Data: {timestamp} | Painel: {preset_name} | Agentes: {total_agents}*
```

---

## Regras de Tom e Linguagem

| Regra | Exemplo ERRADO | Exemplo CORRETO |
|-------|---------------|-----------------|
| Sem jargao de AI | "Os agentes LLM geraram..." | "O painel mostrou..." |
| Sem passividade | "Observa-se que..." | "O dado principal e..." |
| Sem academicismo | "Conforme a analise dos dados coletados..." | "Em resumo:" |
| Acionavel | "Pode-se considerar..." | "Recomendamos priorizar..." |
| Concreto | "Existe uma tendencia..." | "45% do painel e contra, com intensidade 4.1/5" |
| Tom consultivo | "E interessante notar que..." | "Atencao: este e o ponto mais fragil da sua narrativa." |

---

## Regras de Formatacao PDF (Story 4.4 — AC3)

O relatorio deve ser gerado em markdown puro, otimizado para conversao PDF via Pandoc ou similar.

**Usar:**
- Headings H1, H2, H3 apenas (sem H4 ou H5 — quebram hierarquia em PDF)
- Tabelas com no maximo 6 colunas em pagina A4 (mais de 6 truncam)
- Listas com hifens simples (- item) ou numeradas (1. item)
- Negrito (**texto**) e italico (*texto*) para enfase
- Blocos de citacao (> texto) para disclaimers e alertas importantes
- Separadores horizontais (---) entre secoes principais

**Nao usar:**
- HTML inline (`<div>`, `<span>`, `<br>`, `<table>`) — nao renderiza em PDF
- Emojis ou caracteres especiais Unicode fora do ASCII basico — podem nao renderizar
- Imagens ou graficos (nao suportados neste contexto de geracao por LLM)
- Nested listas com mais de 2 niveis de profundidade
- Tabelas com texto muito longo em celulas — preferir texto curto e notas abaixo

---

## Validacao do Output

Apos gerar `report.md`, verificar:

- [ ] Todas as 7 secoes presentes (Sumario, Dashboard, Mapa, Vulnerabilidades, Dinamica, Recomendacoes, Metodologia)
- [ ] Sumario Executivo comeca com bloco de bullets das conclusoes-chave (Story 4.4 — AC4)
- [ ] Dashboard contem tabela geral E tabela por segmento
- [ ] Mapa de Argumentos rankeado por impacto (nao por frequencia)
- [ ] Vulnerabilidades com todos os campos: segmento, taxa, severidade, contranarrativa
- [ ] Disclaimer etico expandido presente com os 4 elementos obrigatorios (Story 4.4 — AC1):
  - [ ] Nao substitui pesquisa de opiniao
  - [ ] Limitacoes do metodo
  - [ ] Uso etico e responsavel
  - [ ] Valide antes de agir
- [ ] Secao de Metodologia expandida com explicacao acessivel do pipeline (Story 4.4 — AC2)
- [ ] Footer com metadados de geracao presente: Run ID, data, preset, agentes (Story 4.4 — AC5)
- [ ] Se painel reutilizado: mencao a origem do painel (Story 4.1 — AC6)
- [ ] Metadados incluidos: data, preset, agentes, rodadas, contexto (FR20)
- [ ] Nenhuma mencao a: LLM, token, prompt, Claude, AI, agente de AI, machine learning
- [ ] Tom consultivo verificado — sem passividade, sem academicismo
- [ ] Formatacao PDF-friendly: apenas H1-H3, tabelas com max 6 colunas, sem HTML, sem emojis (Story 4.4 — AC3)
- [ ] Relatorio salvo em `output/{run}/report.md` (FR21)
