# Template: Motor de Agregacao

> Executado pelo agente principal (NAO por sub-agente).
> Referencia: Arquitetura secao 6.1-6.3, Spec FR15-FR18, Spec secao 3.9

## Purpose

Ler TODOS os dados brutos das rodadas de deliberacao (`round-*.yaml`) e o painel de agentes (`panel.yaml`) para calcular metricas agregadas quantitativas. O output (`aggregation.yaml`) alimenta o relatorio final e o gerador de recomendacoes.

---

## Inputs

Antes de iniciar, carregar:

1. **`output/{run}/panel.yaml`** — perfis dos agentes (para segmentacao demografica)
2. **`output/{run}/rounds/round-1.yaml`** — dados da rodada 1
3. **`output/{run}/rounds/round-2.yaml`** — dados da rodada 2
4. **`output/{run}/rounds/round-N.yaml`** — dados de TODAS as rodadas existentes
5. **`output/{run}/config-snapshot.yaml`** — metadados da simulacao

---

## Processo de Agregacao (6 etapas)

### Etapa 1: Distribuicao de Sentimento

Calcular a distribuicao percentual das posicoes (a_favor, contra, neutro, indeciso) com base na **ultima rodada** (rodada final).

#### 1a. Distribuicao Geral

Para cada posicao, contar agentes com `status: success`:

```
percentage = (count_position / total_successful) * 100
```

Arredondar para 1 casa decimal. As 4 posicoes devem somar 100%.

#### 1b. Distribuicao por Segmento Demografico

Para cada segmento presente em `panel.yaml` (ex: classe-ab-urbano-sudeste, classe-c-urbano, etc.):

1. Filtrar agentes daquele segmento na rodada final
2. Calcular a mesma distribuicao percentual dentro do segmento
3. Incluir o tamanho do segmento (`segment_size`)

Output parcial:

```yaml
sentiment_distribution:
  overall:
    a_favor: {pct}
    contra: {pct}
    neutro: {pct}
    indeciso: {pct}
  by_segment:
    {segment_name}:
      segment_size: {n}
      a_favor: {pct}
      contra: {pct}
      neutro: {pct}
      indeciso: {pct}
    # ... para cada segmento
```

---

### Etapa 2: Intensidade Media por Posicao

Para cada posicao na rodada final:

1. Coletar o campo `intensity` (1-5) de cada agente com aquela posicao
2. Calcular media aritmetica
3. Arredondar para 1 casa decimal

Isto identifica se o lado "contra" e mais veemente que o "a favor", por exemplo.

Output parcial:

```yaml
intensity:
  overall_average: {media geral de todos os agentes}
  by_position:
    a_favor: {media}
    contra: {media}
    neutro: {media}
    indeciso: {media}
```

---

### Etapa 3: Ranking de Argumentos

Coletar TODOS os `main_arguments` de TODAS as rodadas (nao so a final). Para cada argumento:

#### 3a. Calculo de Frequencia

Contar quantas vezes o argumento (ou variantes semanticamente equivalentes) apareceu ao longo de todas as rodadas. Agrupar variantes:
- "vai aumentar imposto" e "imposto vai subir pra classe media" = mesmo argumento
- Usar julgamento semantico para agrupar, rotulando com a forma mais representativa

#### 3b. Calculo de Impact Score (FR16)

```
impact_score = count(agentes onde change_trigger contem este argumento)
```

Percorrer TODAS as rodadas 2+ e verificar o campo `change_trigger` de cada agente que mudou de opiniao (`opinion_changed: true`). Se o `change_trigger` menciona (semanticamente) este argumento, incrementar o score.

#### 3c. Ranking Final

Ordenar argumentos por `impact_score` (desempate por `frequency`). Separar por posicao (a_favor vs contra).

Output parcial:

```yaml
argument_ranking:
  a_favor:
    - argument: "{texto canonico do argumento}"
      frequency: {n}
      impact_score: {n}
      segments_resonating: ["{segment1}", "{segment2}"]
    # ... top 10 (ou todos se <10)
  contra:
    - argument: "{texto canonico do argumento}"
      frequency: {n}
      impact_score: {n}
      segments_resonating: ["{segment1}", "{segment2}"]
    # ... top 10 (ou todos se <10)
  neutro:
    - argument: "{texto canonico}"
      frequency: {n}
      impact_score: {n}
    # ... se houver
```

Para `segments_resonating`: identificar em quais segmentos o argumento apareceu com mais frequencia.

---

### Etapa 4: Identificacao de Vulnerabilidades (FR17)

Vulnerabilidades sao argumentos com impacto desproporcional — capazes de mudar opiniao de uma parcela significativa de um segmento.

#### Threshold

```
vulnerability_threshold = ceil(0.2 x segment_size)
```

Exemplos:
- Segmento com 5 agentes: threshold = ceil(1.0) = 1
- Segmento com 3 agentes: threshold = ceil(0.6) = 1
- Segmento com 10 agentes: threshold = ceil(2.0) = 2

#### Deteccao

Para cada argumento rankeado:

1. Verificar o `impact_score` DENTRO de cada segmento (nao geral)
2. Se `impact_score_segment >= vulnerability_threshold` para aquele segmento: marcar como vulnerabilidade

#### Classificacao de Severidade

| Condicao | Severidade |
|----------|------------|
| Impact score >= 50% do segmento | critica |
| Impact score >= 30% do segmento | alta |
| Impact score >= threshold (20%) | media |

#### Output

Para CADA vulnerabilidade identificada, gerar:

```yaml
vulnerabilities:
  - argument: "{argumento que causa a vulnerabilidade}"
    segment_most_affected: "{segmento com maior taxa de mudanca}"
    opinion_change_rate: {pct de agentes do segmento que mudaram por este argumento}
    severity: "{critica | alta | media}"
    counter_narrative_recommendation: >
      {Recomendacao especifica de como contranarrativar este argumento.
       Deve ser acionavel, nao generica. Ex: "Apresentar dados concretos de
       isenção para classe C com exemplos do dia-a-dia do trabalhador"}
```

---

### Etapa 5: Clusters Semanticos de Opiniao

Identificar grupos de agentes que pensam de forma similar, independente de segmento demografico.

#### Processo (4 passos — Arquitetura secao 6.3)

1. **Listar argumentos:** Coletar todos os `main_arguments` da rodada final de cada agente
2. **Agrupar por similaridade:** Identificar agentes que usaram argumentos tematicamente proximos. Agrupamento semantico (nao algoritmico) — usar analise do LLM
3. **Rotular clusters:** Dar nome descritivo ao cluster pelo tema predominante (ex: "Pragmaticos economicos", "Desconfiados do governo")
4. **Mapear demographics:** Identificar perfil demografico predominante do cluster

#### Regras

- **Minimo:** 3 agentes por cluster (config: `aggregation.min_cluster_size`)
- **Maximo:** Nao ha limite, mas se um cluster tem >60% dos agentes, provavelmente e generico demais — subdividir
- Um agente pode pertencer a mais de um cluster se seus argumentos cobrem temas distintos

Output parcial:

```yaml
clusters:
  - name: "{nome descritivo do cluster}"
    size: {n agentes}
    agent_ids: ["agent-001", "agent-005", "agent-012"]
    shared_arguments:
      - "{argumento compartilhado 1}"
      - "{argumento compartilhado 2}"
    predominant_position: "{a_favor | contra | misto}"
    demographics_summary: "{descricao do perfil predominante, ex: classe C/D urbano, 30-50 anos}"
  # ... demais clusters
```

---

### Etapa 6: Dinamica de Opiniao

Documentar como as opinioes evoluiram entre rodadas. Esta etapa olha para TODAS as transicoes, nao so a final.

#### Para cada transicao (round_1_to_2, round_2_to_3, etc.)

1. Comparar `position` de cada agente entre as duas rodadas
2. Contar mudancas por direcao (ex: contra→a_favor, neutro→contra)
3. Identificar o `change_trigger` mais frequente da transicao
4. Calcular taxa de mudanca: `total_changes / total_successful`

Output parcial:

```yaml
opinion_dynamics:
  round_1_to_2:
    total_changes: {n}
    change_rate: {pct}
    direction_breakdown:
      - from: contra
        to: a_favor
        count: {n}
      - from: neutro
        to: contra
        count: {n}
    primary_trigger: "{argumento ou evento que mais causou mudancas nesta transicao}"
    notable_shifts: "{descricao narrativa breve das mudancas mais relevantes}"
  round_2_to_3:
    total_changes: {n}
    change_rate: {pct}
    direction_breakdown:
      - from: a_favor
        to: neutro
        count: {n}
    primary_trigger: "{trigger principal}"
    notable_shifts: "{descricao}"
  # ... para cada transicao
  cumulative:
    total_changes_all_rounds: {n}
    overall_change_rate: {pct}
    most_volatile_segment: "{segmento com mais mudancas}"
    most_stable_segment: "{segmento com menos mudancas}"
```

---

## Output Final: aggregation.yaml

Juntar TODAS as etapas em um unico arquivo `output/{run}/aggregation.yaml`:

```yaml
# aggregation.yaml
# Gerado automaticamente pelo Motor de Agregacao (templates/aggregator.md)

simulation_id: "{run_id}"
generated_at: "{ISO timestamp}"
total_agents: {n}
total_rounds: {n}
successful_agents_final_round: {n}
preset: "{preset name}"

# Etapa 1: Distribuicao de sentimento
sentiment_distribution:
  overall:
    a_favor: {pct}
    contra: {pct}
    neutro: {pct}
    indeciso: {pct}
  by_segment:
    {segment_name}:
      segment_size: {n}
      a_favor: {pct}
      contra: {pct}
      neutro: {pct}
      indeciso: {pct}

# Etapa 2: Intensidade
intensity:
  overall_average: {media}
  by_position:
    a_favor: {media}
    contra: {media}
    neutro: {media}
    indeciso: {media}

# Etapa 3: Ranking de argumentos
argument_ranking:
  a_favor:
    - argument: "{texto}"
      frequency: {n}
      impact_score: {n}
      segments_resonating: ["{seg1}", "{seg2}"]
  contra:
    - argument: "{texto}"
      frequency: {n}
      impact_score: {n}
      segments_resonating: ["{seg1}", "{seg2}"]

# Etapa 4: Vulnerabilidades
vulnerabilities:
  - argument: "{argumento}"
    segment_most_affected: "{segmento}"
    opinion_change_rate: {pct}
    severity: "{critica | alta | media}"
    counter_narrative_recommendation: "{recomendacao especifica}"

# Etapa 5: Clusters
clusters:
  - name: "{nome do cluster}"
    size: {n}
    agent_ids: ["{ids}"]
    shared_arguments: ["{args}"]
    predominant_position: "{posicao}"
    demographics_summary: "{perfil}"

# Etapa 6: Dinamica de opiniao
opinion_dynamics:
  round_1_to_2:
    total_changes: {n}
    change_rate: {pct}
    direction_breakdown:
      - from: "{pos}"
        to: "{pos}"
        count: {n}
    primary_trigger: "{trigger}"
    notable_shifts: "{descricao}"
  cumulative:
    total_changes_all_rounds: {n}
    overall_change_rate: {pct}
    most_volatile_segment: "{segmento}"
    most_stable_segment: "{segmento}"
```

---

## Validacao do Output

Apos gerar `aggregation.yaml`, verificar:

- [ ] `sentiment_distribution.overall` soma 100% (tolerancia: +-0.5%)
- [ ] Cada `by_segment` soma 100% (tolerancia: +-0.5%)
- [ ] Pelo menos 10 argumentos unicos no total (NFR4)
- [ ] `impact_score` e >= 0 para todos os argumentos
- [ ] Todas as vulnerabilidades tem `severity` e `counter_narrative_recommendation` preenchidos
- [ ] Todos os clusters tem >= 3 agentes (config: `min_cluster_size`)
- [ ] `opinion_dynamics` cobre todas as transicoes entre rodadas consecutivas
- [ ] `simulation_id` e `generated_at` estao preenchidos

Se alguma validacao falhar, corrigir e re-gerar. Se nao for possivel corrigir (ex: <10 argumentos unicos porque os agentes foram pouco diversos), registrar warning no output:

```yaml
warnings:
  - "Apenas {n} argumentos unicos identificados (minimo recomendado: 10). Considerar aumentar diversidade do painel."
```

---

## Notas de Implementacao

- **Esta template e executada pelo agente principal**, nao por sub-agente. E uma tarefa de analise de dados ja coletados.
- **Agrupamento semantico** de argumentos e feito por julgamento do LLM, nao por algoritmo. Argumentos como "vai aumentar imposto" e "imposto vai subir" sao o mesmo argumento.
- **Impact score** so conta mudancas explicitas (onde `opinion_changed: true` e `change_trigger` menciona o argumento). Nao inferir mudancas nao declaradas.
- **Vulnerabilidades** sao definidas pelo threshold `ceil(0.2 x segment_size)`. Em paineis pequenos (3 agentes no segmento), threshold = 1, entao qualquer mudanca ja e vulnerabilidade.
- **Clusters** sao transversais a segmentos. Um cluster "Pragmaticos economicos" pode ter agentes de classe AB e classe C juntos.
- **Performance:** Para 20 agentes e 3 rodadas, a agregacao nao deve exceder 2 minutos de processamento.
