---
name: politica-simulation-mirofish
description: |
  Motor de predicao por inteligencia de enxame para simulacao de opiniao publica.
  Cria painel virtual de agentes AI com perfis cognitivos diversos e os faz deliberar
  sobre temas politicos em multiplas rodadas. Output: relatorio com distribuicao de
  sentimento, argumentos-chave, vulnerabilidades narrativas e recomendacoes estrategicas.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, WebSearch, WebFetch
argument-hint: "tema da simulacao" [--preset brasil-geral|sp-capital|nordeste-evangelico] [--agents 20] [--rounds 3] [--context path/to/doc.md] [--panel path/to/panel.yaml] [--compare "Tema 1" "Tema 2"]
version: 0.3.0
category: simulation
tags: [politica, simulacao, swarm-intelligence, opiniao-publica, predicao]
---

# politica-simulation-mirofish -- Motor de Predicao por Inteligencia de Enxame

> "Nao e o que as pessoas dizem que pensam. E como formariam opiniao diante de novos estimulos."

## Como Rodar

```
/politica-simulation-mirofish "Tema ou pergunta politica"
/politica-simulation-mirofish "Reforma tributaria" --preset sp-capital --agents 30 --rounds 3
/politica-simulation-mirofish "Reducao da maioridade penal" --context docs/pesquisa-recente.md

# Reutilizar painel de simulacao anterior (Story 4.1)
/politica-simulation-mirofish "Reforma tributaria" --panel output/20260324-1530-reducao-maioridade/panel.yaml

# Modo comparativo: mesmo painel, temas diferentes (Story 4.2)
/politica-simulation-mirofish --compare "Reforma tributaria" "Privatizacao dos Correios" --panel output/20260324-1530-reducao-maioridade/panel.yaml
```

## Pipeline de Fases

```
ENTRADA          INGESTAO (opt)     ASSEMBLY              DELIBERACAO             AGREGACAO              RELATORIO
                 +----------+       +---------+          +-----------+          +-----------+          +----------+
Tema + Preset >  | Ler docs |  >    | Gerar N |  ---->   | Rodada 1  |  ---->   | Calcular  |  ---->   | Gerar    |
+ Contexto (opt) | Sumarizar|       | perfis  |          | Rodada 2  |          | metricas  |          | report   |
                 | <=500 pal|       |         |          | Rodada 3  |          | + vulner. |          | + recs   |
                 +----------+       +---------+          +-----------+          +-----------+          +----------+
               context-metadata.yaml panel.yaml           rounds/*.yaml          aggregation.yaml       report.md
```

---

## Orchestration Pipeline (Complete)

Ao receber o comando `/politica-simulation-mirofish`, seguir TODOS os passos abaixo em ordem.
Cada passo tem inputs, outputs e condicoes de erro. NAO pular passos.

### Passo 0: Parse de Input e Validacao

1. Extrair do comando:
   - `topic` (obrigatorio, exceto em modo `--compare`): O tema/pergunta politica. Se ausente e nao for modo comparativo, PARAR com erro:
     `"ERRO: Tema obrigatorio. Use: /politica-simulation-mirofish \"Seu tema aqui\""`
   - `--preset` (default: `brasil-geral`): Preset demografico
   - `--agents` (default: valor do config.yaml `simulation.total_agents`): Numero de agentes
   - `--rounds` (default: valor do config.yaml `simulation.rounds`): Numero de rodadas
   - `--context` (opcional): Path(s) para documentos de contexto
   - `--panel` (opcional): Path para `panel.yaml` de simulacao anterior para reutilizacao (Story 4.1)
   - `--compare` (opcional): Modo comparativo — recebe 2-3 temas entre aspas, requer `--panel` (Story 4.2)

2. Validar ranges:
   - `agents`: 10-50. Se fora do range: `"ERRO: Numero de agentes deve ser entre 10 e 50."`
   - `rounds`: 1-5. Se fora do range: `"ERRO: Numero de rodadas deve ser entre 1 e 5."`
   - `preset`: Se `--panel` NAO for fornecido, verificar se `presets/{preset}.yaml` existe. Se nao: `"ERRO: Preset '{preset}' nao encontrado em presets/."`
   - `context`: Se fornecido, verificar se arquivo(s) existe(m). Se nao: `"ERRO: Arquivo de contexto nao encontrado: {path}"`
   - `--panel`: Se fornecido, verificar se arquivo existe. Se nao: `"ERRO: Painel nao encontrado: {path}"`
   - `--compare`: Deve ter 2 ou 3 temas. Requer `--panel`. Se sem `--panel`: `"ERRO: Modo --compare requer --panel com painel existente."`

3. Gerar identificador da simulacao:
   - `run_id`: `{YYYYMMDD-HHMM}-{slug do topic}` (ex: `20260324-1530-reducao-maioridade`)
   - Criar pasta: `output/{run_id}/`
   - Criar subpasta: `output/{run_id}/rounds/`

4. Salvar config snapshot:
   ```yaml
   # output/{run_id}/config-snapshot.yaml
   simulation_id: "{run_id}"
   topic: "{topic}"
   preset: "{preset}"        # Omitido se --panel fornecido (preset vem do painel reutilizado)
   total_agents: {agents}
   rounds: {rounds}
   batch_size: {valor de config.yaml simulation.batch_size}
   started_at: "{ISO timestamp}"
   config_source: "config.yaml + CLI overrides"
   # Campos adicionados quando --panel e fornecido (Story 4.1):
   panel_source: "{path do panel.yaml fornecido}"  # Ex: "output/20260324-1530-reducao-maioridade/panel.yaml"
   # Nota: se --panel NAO for fornecido, panel_source = "generated"
   ```
   **Regra:** Se `--panel` NAO for fornecido, registrar `panel_source: generated`.
   Se `--panel` for fornecido, registrar `panel_source: "{path fornecido}"`.

5. Mostrar ao usuario:
   ```
   === POLITICA-APP: SIMULACAO INICIADA ===
   Tema: "{topic}"
   Preset: {preset} | Agentes: {agents} | Rodadas: {rounds}
   Output: output/{run_id}/
   Config snapshot salvo.
   ```

### Passo 0.5: Ingestao de Contexto (opcional)

**Ativada quando:** `--context` e fornecido.

1. Para cada path em `--context`:
   a. Ler o conteudo do arquivo com Read tool
   b. Contar palavras originais
   c. Se `word_count > 500`: sumarizar para no maximo 500 palavras, mantendo fatos e dados concretos
   d. Se `word_count <= 500`: usar como esta
   e. Registrar metadados

2. Concatenar sumarios com separador:
   ```
   ---
   [Fonte: {source_path}]
   {summary}
   ---
   ```
   Resultado: `contexto_consolidado`

3. Salvar metadados em `output/{run_id}/context-metadata.yaml`

4. Adicionar bloco `context_ingestion` ao `config-snapshot.yaml`

**Se nao fornecido:** Pular silenciosamente. Simulacao roda com conhecimento geral do LLM.

### Passo 1: Assembly (Geracao de Painel)

**DECISAO INICIAL:** Verificar se `--panel` foi fornecido.

---

#### 1A: Caminho de Reutilizacao de Painel (quando `--panel` e fornecido) — Story 4.1

1. Ler o arquivo `panel.yaml` do path fornecido com Read tool

2. **Validar integridade do painel:** Para cada agente na lista `agents`, verificar presenca dos campos obrigatorios:
   - `id` e `name` (identificacao)
   - `demographic` (deve ter subcampos: age, gender, region, class, education, religion, occupation)
   - `psychographic` (deve ter subcampos: values, priorities, information_sources, cognitive_biases, influence_susceptibility)
   - `deliberative` (deve ter subcampos: processing_style, opinion_flexibility, argument_weight, expression_style)

3. **Se validacao falhar:** PARAR com mensagem de erro clara indicando quais campos estao faltando:
   ```
   ERRO: Painel invalido — campos obrigatorios ausentes:
   - Agente agent-003: campo 'deliberative.opinion_flexibility' ausente
   - Agente agent-007: campo 'psychographic.cognitive_biases' ausente
   Corrija o arquivo de painel antes de prosseguir.
   ```

4. **Se validacao passar:** Usar os agentes carregados diretamente. NAO gerar novos perfis.
   - Registrar `total_agents` = numero de agentes no painel carregado
   - O `panel.yaml` carregado NAO e re-salvo — apenas referenciado

5. Mostrar progresso:
   ```
   === FASE 1: ASSEMBLY (PAINEL REUTILIZADO) ===
   Painel carregado de: {panel_path}
   Agentes carregados: {n} perfis
   Validacao de integridade: OK
   Painel reutilizado de simulacao anterior: {panel_path}
   ```

---

#### 1B: Caminho de Geracao de Painel (quando `--panel` NAO e fornecido)

Seguir `templates/agent-persona.md` secao "Assembly Instructions":

1. Ler preset de `presets/{preset}.yaml`
2. Calcular distribuicao proporcional se `--agents` difere do `total_agents` do preset:
   - Para cada segmento: `segment_count = ceil(segment.count / preset.total_agents * agents)`
   - Ajustar para que soma = `agents` (reduzir o maior segmento se necessario)
3. Para cada segmento:
   a. Ler archetype base de `data/demographic-archetypes.yaml`
   b. Aplicar `template_overrides` do segmento
   c. Aplicar `variation_rules` para diversidade intra-segmento
   d. Para cada agente: gerar perfil YAML completo + system prompt
4. Salvar `output/{run_id}/panel.yaml`
5. Validar diversidade (conforme regras em `agent-persona.md`)

**Mensagem de progresso:**
```
=== FASE 1: ASSEMBLY ===
Gerando {agents} perfis com preset "{preset}"...
Segmento classe-ab-urbano-sudeste: {n} agentes
Segmento classe-c-urbano: {n} agentes
...
Painel salvo: output/{run_id}/panel.yaml
Validacao de diversidade: OK
```

**Se validacao falhar:** Alertar usuario mas NAO abortar. Registrar warning no log.

### Passo 2: Deliberacao (Loop de Rodadas)

```
PARA R de 1 ate {rounds}:

  SE R == 1:
    2a. Executar Rodada 1 (Opiniao Individual)
  SE R > 1:
    2b. Sumarizar rodada R-1
    2c. Executar Rodada R (Deliberacao com Exposicao)

  2d. Checkpoint: verificar round-R.yaml salvo
  2e. Verificar failure_rate
      SE failure_rate > 0.30: ABORTAR simulacao
```

#### 2a. Rodada 1: Opiniao Individual

Seguir `templates/deliberation-round-1.md` COMPLETAMENTE:

1. Para cada agente no painel, preparar:
   - System prompt: o prompt gerado por `agent-persona.md` na Assembly
   - User prompt: template de `deliberation-round-1.md` com `{topic}`, `{context_block}`, `{agent_name}` substituidos

2. Dividir em batches de `batch_size`:
   ```
   total_batches = ceil(agents / batch_size)
   ```

3. Para cada batch B (de 1 a total_batches):
   a. Spawnar TODOS os agentes do batch em paralelo via Agent tool
   b. Coletar respostas
   c. Parsear YAML de cada resposta (conforme secao "Output Parsing" do template)
   d. Mostrar progresso: `"[Batch {B}/{total_batches}] Concluido: {ok} ok, {fail} falhas"`

4. Montar `round-1.yaml` com todas as respostas (conforme secao "Round Output Structure" do template)
5. Salvar em `output/{run_id}/rounds/round-1.yaml`

6. Calcular distribuicao preliminar e mostrar:
   ```
   Rodada 1 completa: {success}/{agents} responderam
   Distribuicao: A favor {x}% | Contra {y}% | Neutro {z}% | Indeciso {w}%
   ```

#### 2b. Sumarizacao Inter-Rodada

Seguir `templates/summarizer.md` COMPLETAMENTE:

1. Ler `output/{run_id}/rounds/round-{R-1}.yaml`
2. Filtrar respostas com `status: success`
3. Calcular distribuicao de sentimento (porcentagens)
4. Agrupar argumentos por posicao
5. Rankear por frequencia semantica (argumentos similares agrupados)
6. Manter top 5 por posicao
7. Reescrever em linguagem acessivel e neutra
8. Montar sumario formatado conforme template

O output e texto markdown que sera injetado no prompt da proxima rodada.
NAO salvar como arquivo separado -- e intermediario, usado inline.

#### 2c. Rodada N (2+): Deliberacao com Exposicao

Seguir `templates/deliberation-round-n.md` COMPLETAMENTE:

1. Para cada agente, preparar:
   - System prompt: mesmo da Assembly
   - User prompt: template de `deliberation-round-n.md` com:
     - `{topic}`, `{context_block}`, `{agent_name}` substituidos
     - `{summary}`: o sumario gerado no passo 2b
     - `{previous_position}`, `{previous_intensity}`, `{previous_arguments}`: extraidos de `round-{R-1}.yaml`
     - `{round_number}`: R
     - Instrucoes dinamicas (`flexibility_instruction`, `social_proof_instruction`, `authority_instruction`) geradas com base no perfil do agente

2. Mesmo batching e spawn da Rodada 1

3. Parsear respostas com validacao adicional de campos `opinion_changed`, `previous_position`, `change_trigger`

4. Aplicar verificacao de consistencia (conforme template)

5. Salvar `output/{run_id}/rounds/round-{R}.yaml`

6. Mostrar progresso com dados de mudanca de opiniao:
   ```
   Rodada {R} completa: {success}/{agents} responderam
   Mudancas de opiniao: {changes} agentes ({change_rate}%)
   Nova distribuicao: A favor {x}% | Contra {y}% | Neutro {z}% | Indeciso {w}%
   ```

#### 2d. Checkpoint

Apos cada rodada, verificar:
- [ ] Arquivo `round-{R}.yaml` existe e e valido
- [ ] `failure_rate` calculada
- [ ] Se `aborted: false`, prosseguir para proxima rodada
- [ ] Se `aborted: true`, parar loop

#### 2e. Tratamento de Falhas

| Cenario | Acao |
|---------|------|
| Output malformado de 1 agente | Marcar `status: error`, continuar |
| Timeout de 1 agente | Marcar `status: timeout`, continuar |
| >30% de falhas na rodada | ABORTAR simulacao com mensagem clara |
| Falha entre rodadas | Dados parciais salvos, retomavel |
| Todos os agentes falharam | ABORTAR imediatamente |

**Mensagem de aborto:**
```
ERRO CRITICO: Simulacao abortada na Rodada {R}.
{failed}/{agents} agentes falharam ({failure_rate}%).
Threshold maximo: 30%.
Dados parciais salvos em: output/{run_id}/
Causa provavel: template de persona gerando outputs nao-YAML.
Acao recomendada: Revisar agent-persona.md e executar spike de validacao.
```

### Passo 2.5: Retomada de Simulacao (Recovery)

Se uma simulacao foi interrompida, e possivel retoma-la:

1. Verificar `output/{run_id}/rounds/` -- quais rounds ja existem?
2. Identificar ultimo round completo (round-N.yaml com dados validos)
3. Continuar do round N+1, usando os dados existentes
4. NAO re-executar rounds ja completos

**Como retomar:**
```
/politica-simulation-mirofish --resume {run_id}
```

### Passo 3: Agregacao

Seguir `templates/aggregator.md` COMPLETAMENTE. Executado pelo agente principal (NAO sub-agente).

**Inputs:**
- `output/{run_id}/panel.yaml` (perfis dos agentes para segmentacao)
- `output/{run_id}/rounds/round-*.yaml` (todas as rodadas)
- `output/{run_id}/config-snapshot.yaml` (metadados)

**6 Etapas de Agregacao (na ordem):**

1. **Distribuicao de sentimento** — % a_favor/contra/neutro/indeciso, geral + por segmento demografico (rodada final)
2. **Intensidade media** — media de intensidade (1-5) por posicao. Identifica se "contra" e mais veemente que "a favor"
3. **Ranking de argumentos** — por frequencia E por `impact_score`, onde:
   ```
   impact_score = count(agentes que citaram o argumento como change_trigger)
   ```
   Separado por posicao (a_favor vs contra). Inclui `segments_resonating`
4. **Vulnerabilidades** — argumentos com `impact_score >= ceil(0.2 x segment_size)`.
   Cada vulnerabilidade tem: argumento, segmento mais afetado, taxa de mudanca, severidade (critica/alta/media), recomendacao de contranarrativa
5. **Clusters semanticos** — agentes agrupados por similaridade de argumentos (analise semantica, nao algoritmica). Minimo 3 agentes por cluster. Rotulados por tema predominante + demographics
6. **Dinamica de opiniao** — mudancas entre rodadas consecutivas com: total_changes, direcoes, primary_trigger, segmentos mais volateis/estaveis

**Validacao:** Distribuicao soma 100%, >=10 argumentos unicos (NFR4), clusters >=3 agentes.

**Output:** `output/{run_id}/aggregation.yaml`

**Mensagem de progresso:**
```
=== FASE 3: AGREGACAO ===
Analisando {total_rounds} rodadas de {total_agents} agentes...
Distribuicao final: A favor {x}% | Contra {y}% | Neutro {z}% | Indeciso {w}%
Argumentos unicos identificados: {n}
Vulnerabilidades detectadas: {n}
Clusters identificados: {n}
Agregacao salva: output/{run_id}/aggregation.yaml
```

**Se validacao falhar:** Registrar warnings no aggregation.yaml mas NAO abortar.

### Passo 4: Recomendacoes e Relatorio

Executar em sequencia: primeiro recomendacoes, depois relatorio.

#### 4a. Gerar Recomendacoes

Seguir `templates/recommendations.md` COMPLETAMENTE.

1. Carregar `output/{run_id}/aggregation.yaml`
2. Identificar prioridades por urgencia:
   - Vulnerabilidades criticas → contranarrativa defensiva (urgencia critica)
   - Clusters hostis → segmentos a converter (urgencia alta)
   - Segmentos volateis → persuadiveis (urgencia media)
   - Argumentos fortes a favor → amplificar (urgencia media)
3. Gerar 3-5 recomendacoes, cada uma com: acao, justificativa (baseada em dados), segmento-alvo, urgencia
4. **Obrigatorio:** Pelo menos 1 recomendacao endereça a vulnerabilidade de maior impacto
5. Validar: especificidade, base em dados, contextualizacao ao tema, acionabilidade

#### 4b. Gerar Relatorio Final

Seguir `templates/report-template.md` COMPLETAMENTE.

1. Carregar aggregation.yaml + panel.yaml + config-snapshot.yaml + context-metadata.yaml (se existir)
2. Gerar as **7 secoes do relatorio** (FR19):
   1. **Sumario Executivo** — 3-5 paragrafos, tom de consultor de campanha, conclusoes acionaveis
   2. **Dashboard de Sentimento** — tabela geral (posicao, %, intensidade) + tabela por segmento
   3. **Mapa de Argumentos** — rankeado por impacto (NAO por frequencia), com segmentos que ressoam
   4. **Analise de Vulnerabilidades** — severidade, taxa de mudanca, contranarrativa sugerida
   5. **Dinamica de Opiniao** — evolucao entre rodadas, gatilhos, segmentos volateis
   6. **Recomendacoes Estrategicas** — inserir output do passo 4a
   7. **Metodologia e Disclaimer** — configuracao, composicao do painel, disclaimer etico obrigatorio
3. **Tom:** Consultor de campanha. Zero jargao de AI/ML (NFR12). Sem mencionar LLM, token, prompt, Claude
4. **Metadados:** Data, preset, agentes, rodadas, contexto ingerido (FR20)
5. **Se painel foi reutilizado (`panel_source` != "generated"):** Incluir na Metodologia:
   `"Painel reutilizado de simulacao anterior: {panel_source}"`
6. Salvar em `output/{run_id}/report.md` (FR21)

**Mensagem de progresso:**
```
=== FASE 4: RELATORIO ===
Gerando recomendacoes estrategicas...
Recomendacoes: {n} geradas (prioridade: {urgencia mais alta})
Montando relatorio final...
Secoes: Sumario | Dashboard | Argumentos | Vulnerabilidades | Dinamica | Recomendacoes | Metodologia
Relatorio salvo: output/{run_id}/report.md
```

### Passo 4.5: Modo Comparativo (quando `--compare` e fornecido) — Story 4.2

**Ativado quando:** `--compare "Tema 1" "Tema 2" [--compare "Tema 3"]` e fornecido junto com `--panel`.

Este modo executa N simulacoes independentes com o MESMO painel, um tema por vez, e ao final gera um relatorio comparativo.

#### Pipeline do Modo Comparativo

1. **Preparacao:** Ler e validar o painel fornecido via `--panel` (mesmo processo da secao 1A)

2. **Para cada tema em `--compare`:**
   a. Criar subpasta: `output/{timestamp}-comparativo/{slug-do-tema}/`
   b. Executar o pipeline completo (Passos 0 a 4) para este tema, reutilizando o painel
   c. O `panel_source` de cada simulacao aponta para o painel original
   d. Salvar todos os artefatos em `output/{timestamp}-comparativo/{slug-do-tema}/`
   e. Mostrar progresso: `"[Cenario {i}/{n}] '{tema}' concluido"`

3. **Geracao do relatorio comparativo:**
   a. Ler os `aggregation.yaml` de cada cenario
   b. Usar `templates/comparison-report.md` para estruturar o relatorio
   c. Calcular deltas entre cenarios:
      - Diferenca de distribuicao de sentimento por tema
      - Argumentos transversais (aparecem em todos os cenarios)
      - Argumentos exclusivos de cada tema
      - Segmentos que mudam de posicao entre cenarios
      - Em qual tema o painel e mais dividido (maior variancia)
   d. Salvar em `output/{timestamp}-comparativo/comparison-report.md`

4. **Estrutura de output do modo comparativo:**
   ```
   output/{timestamp}-comparativo/
   +-- comparison-report.md       # Relatorio comparativo (documento principal)
   +-- {slug-tema-1}/             # Subpasta do cenario 1
   |   +-- config-snapshot.yaml
   |   +-- panel.yaml             # Referencia ao painel original
   |   +-- rounds/
   |   +-- aggregation.yaml
   |   +-- report.md
   +-- {slug-tema-2}/             # Subpasta do cenario 2
   |   +-- ...
   +-- {slug-tema-3}/             # Subpasta do cenario 3 (se houver)
       +-- ...
   ```

5. Mostrar ao usuario:
   ```
   === MODO COMPARATIVO CONCLUIDO ===
   Painel: {panel_path} ({n} agentes)
   Cenarios executados: {lista de temas}
   Relatorio comparativo: output/{timestamp}-comparativo/comparison-report.md
   Dados individuais: output/{timestamp}-comparativo/{slug}/
   ```

---

### Passo Final: Resumo da Simulacao

Apos completar todas as rodadas (ou abortar), mostrar resumo:

```
=== SIMULACAO CONCLUIDA ===
Tema: "{topic}"
Agentes: {agents} | Rodadas completadas: {rounds_completed}/{rounds}
Duracao total: {wall_clock}

Distribuicao final:
  A favor:  {x}% ({n} agentes)
  Contra:   {y}% ({n} agentes)
  Neutro:   {z}% ({n} agentes)
  Indeciso: {w}% ({n} agentes)

Mudancas de opiniao total: {total_changes} ({total_change_rate}%)
Vulnerabilidades detectadas: {n_vulnerabilities}
Recomendacoes geradas: {n_recommendations}

Output salvo em: output/{run_id}/
Arquivos:
  - config-snapshot.yaml (configuracao)
  - panel.yaml (perfis dos agentes)
  - rounds/round-1.yaml ... round-{R}.yaml (dados brutos)
  - aggregation.yaml (metricas agregadas)
  - report.md (relatorio final)
```

---

---

## Como Criar um Preset Customizado — Story 4.3

Use esta seção quando nenhum dos presets prontos (`brasil-geral`, `sp-capital`, `nordeste-evangelico`)
representar o recorte demográfico que você precisa simular.

Pense assim: os presets prontos são como "personas" pré-montadas. Criar um preset customizado
é como montar seu próprio elenco — você escolhe quem está na sala de deliberação.

### Passo a Passo

**1. Copie o template base**

```bash
cp skills/politica-simulation-mirofish/presets/custom-template.yaml skills/politica-simulation-mirofish/presets/meu-preset.yaml
```

**2. Defina o recorte demográfico**

Edite `name`, `description` e `total_agents` para refletir quem você quer simular.

**3. Defina os segmentos**

Cada segmento representa um grupo homogêneo dentro do recorte. Para cada segmento:
- `count`: quantos agentes representam este grupo
- `archetype_base`: ponto de partida cognitivo (ver lista de archetypes abaixo)
- `template_overrides`: campos que diferem do archetype base
- `variation_rules`: como diversificar DENTRO do segmento (em linguagem natural)

**4. Valide a soma dos counts**

A soma de todos os `count` DEVE ser igual ao `total_agents`.
Se não bater, o pipeline vai rejeitar o preset com erro.

**5. Use o preset**

```bash
/politica-simulation-mirofish "Seu tema" --preset meu-preset
```

O arquivo deve estar em `skills/politica-simulation-mirofish/presets/meu-preset.yaml`.

---

### Archetypes Disponíveis

| Archetype ID | Perfil resumido |
|---|---|
| `executivo-sp` | Classe A, analítico, urbano sudeste |
| `professora-universitaria` | Classe B, analítica, progressista |
| `comerciante-bairro` | Classe C, pragmático, conservador moderado |
| `enfermeira-publica` | Classe C, emocional, saúde pública |
| `motorista-app` | Classe C, pragmático, evangélico |
| `dona-maria` | Classe D, emocional, evangélica, periferia |
| `pedreiro-periferia` | Classe D, emocional, informal |
| `jovem-universitario` | Classe B, analítico, progressista, digital |
| `jovem-periferia-digital` | Classe D, pragmático, digital, evangélico |
| `agricultor-familiar` | Classe D, emocional, rural, tradicional |
| `pastor-periferia` | Classe C, moral-religioso, conservador |
| `empresario-sul` | Classe B, pragmático, conservador |

---

### Validação no Pipeline

Quando um preset customizado é fornecido, o pipeline executa automaticamente:

1. **Schema check:** Verificar que todos os campos obrigatórios estão presentes
2. **Count check:** Verificar que a soma dos `count` = `total_agents`
   - Se não bater: `"ERRO: Preset '{name}' inválido — soma dos counts ({soma}) != total_agents ({total})."`
3. **Archetype check:** Verificar que todos os `archetype_base` existem em `data/demographic-archetypes.yaml`
   - Se não existir: `"ERRO: Archetype '{id}' não encontrado em demographic-archetypes.yaml"`

---

### Exemplos de Presets Customizados

#### Exemplo 1: "Só jovens de 18-25 — Primeiro Voto"

Caso de uso: Simular reação de eleitores de primeira viagem a propostas de políticas sociais.

```yaml
name: jovens-primeiro-voto
description: >
  Recorte de jovens eleitores entre 18-25 anos em seu primeiro ou segundo ciclo eleitoral.
  Perfil digital-nativo, com forte presença em redes sociais, formação de opinião via TikTok
  e Instagram. Útil para temas de educação, emprego, moradia e direitos digitais.
total_agents: 20

composition:
  - segment: jovem-universitario-sudeste
    count: 6
    archetype_base: jovem-universitario
    description: "Universitários do sudeste, classe B, progressistas"
    template_overrides:
      demographic:
        age_range: "18-24"
        class: [B]
        region: [sp-capital, rj-capital, mg-bh]
      deliberative:
        opinion_flexibility: alta
    variation_rules:
      - "3 mulheres e 3 homens"
      - "Variar curso: humanas, exatas, saúde"
      - "Incluir 2 com trabalho part-time além da faculdade"

  - segment: jovem-periferia-nordeste
    count: 7
    archetype_base: jovem-periferia-digital
    description: "Jovens digitais da periferia nordestina, classe D"
    template_overrides:
      demographic:
        age_range: "18-24"
        class: [D]
        region: [nordeste-capital, nordeste-interior]
    variation_rules:
      - "Misturar: 3 que trabalham, 2 em busca de emprego, 2 fazendo cursos técnicos"
      - "Incluir pelo menos 3 evangélicos"

  - segment: jovem-interior-sul
    count: 4
    archetype_base: empresario-sul
    description: "Jovens do interior do Sul, filhos de comerciantes ou agricultores"
    template_overrides:
      demographic:
        age_range: "18-25"
        class: [C]
        region: [sul-interior]
    variation_rules:
      - "Misturar rural e pequenas cidades"

  - segment: jovem-evangelico-urbano
    count: 3
    archetype_base: motorista-app
    description: "Jovens evangélicos em centros urbanos médios"
    template_overrides:
      demographic:
        age_range: "18-24"
        religion: evangelica
        class: [C, D]
    variation_rules:
      - "Incluir pelo menos 2 frequentadores ativos de igreja"
```

---

#### Exemplo 2: "Região Norte — Amazônia e Fronteira"

Caso de uso: Simular opinião de eleitores do Norte, especialmente em temas ambientais e infraestrutura.

```yaml
name: regiao-norte
description: >
  Recorte geográfico do eleitorado da região Norte do Brasil: Pará, Amazonas,
  Rondônia e Acre. Presença forte de extrativismo, agropecuária, povos tradicionais
  e centros urbanos de médio porte. Útil para temas ambientais, infraestrutura e
  desenvolvimento regional.
total_agents: 20

composition:
  - segment: agricultor-para-amazonas
    count: 6
    archetype_base: agricultor-familiar
    description: "Agricultores familiares e extrativistas do Pará e Amazonas"
    template_overrides:
      demographic:
        region: [norte-rural, norte-interior]
        class: [D, C]
        religion: [evangelica, catolica]
      deliberative:
        argument_weight: experiencia-pessoal
    variation_rules:
      - "Incluir 2 com alguma relação com cooperativa ou associação rural"
      - "Variar: pequeno produtor, extrativista, pescador artesanal"

  - segment: comerciante-cidade-media-norte
    count: 5
    archetype_base: comerciante-bairro
    description: "Comerciantes e trabalhadores de cidades médias do Norte"
    template_overrides:
      demographic:
        region: [norte-capital, norte-cidade-media]
        class: [C]
    variation_rules:
      - "Variar tamanho do negócio: autônomo, microempresário, empregado no comércio"

  - segment: funcionario-publico-belem-manaus
    count: 5
    archetype_base: professora-universitaria
    description: "Funcionários públicos e profissionais liberais de Belém e Manaus"
    template_overrides:
      demographic:
        region: [norte-capital]
        class: [B, C]
    variation_rules:
      - "Incluir professores, técnicos de saúde, servidores municipais"
      - "Misturar visões: 2 ambientalistas, 3 desenvolvimentistas"

  - segment: jovem-rondonia-acre
    count: 4
    archetype_base: jovem-periferia-digital
    description: "Jovens de Rondônia e Acre, filhos de migrantes do sul"
    template_overrides:
      demographic:
        region: [norte-fronteira]
        class: [C, D]
        age_range: "18-30"
    variation_rules:
      - "Incluir 2 descendentes de migrantes sulistas (valores conservadores)"
      - "Misturar área rural e pequenas cidades"
```

---

#### Exemplo 3: "Classe Empresarial — Decisores Econômicos"

Caso de uso: Simular reação de empresários e tomadores de decisão econômica a reformas tributárias,
trabalhistas ou regulatórias.

```yaml
name: classe-empresarial
description: >
  Recorte do eleitorado empresarial e de alta renda: pequenos empresários,
  executivos, profissionais liberais de alto padrão e investidores. Útil para
  temas de economia, tributação, regulação e ambiente de negócios.
total_agents: 20

composition:
  - segment: executivos-grandes-empresas
    count: 4
    archetype_base: executivo-sp
    description: "Executivos C-level e gerentes sênior de grandes empresas"
    template_overrides:
      demographic:
        class: [A]
        region: [sp-capital, rj-capital, mg-bh]
        education: [pos-graduacao, mba]
        occupation: [executivo-tech, executivo-financeiro, executivo-industria]
    variation_rules:
      - "Incluir 2 de tecnologia, 1 de financeiro, 1 de indústria"
      - "Todos com renda > 30k/mês"

  - segment: pequenos-medios-empresarios
    count: 7
    archetype_base: empresario-sul
    description: "Donos de pequenas e médias empresas em diferentes setores"
    template_overrides:
      demographic:
        class: [B, A]
        region: [sp-capital, sp-interior, sul-capital, sul-interior, centro-oeste]
    variation_rules:
      - "Variar setor: comércio varejista, serviços, agronegócio, indústria leve"
      - "Incluir 3 com até 10 funcionários (MEI/ME), 4 com 10-50 funcionários"
      - "Pelo menos 2 mulheres empresárias"

  - segment: profissionais-liberais-alta-renda
    count: 5
    archetype_base: professora-universitaria
    description: "Médicos, advogados, engenheiros e outros profissionais liberais de alta renda"
    template_overrides:
      demographic:
        class: [A, B]
        education: [pos-graduacao]
        occupation: [medico, advogado, engenheiro, arquiteto, contador]
      deliberative:
        processing_style: analitico
    variation_rules:
      - "Misturar: 2 médicos, 2 advogados/contadores, 1 engenheiro"
      - "Incluir pelo menos 1 que atua como investidor ou anjo"

  - segment: investidores-e-financeiros
    count: 4
    archetype_base: executivo-sp
    description: "Investidores, gestores de patrimônio e profissionais do mercado financeiro"
    template_overrides:
      demographic:
        class: [A]
        region: [sp-capital]
        occupation: [gestor-financeiro, investidor, analista-mercado]
      psychographic:
        priorities: [estabilidade-economica, previsibilidade-fiscal, seguranca-juridica]
    variation_rules:
      - "Todos com portfolio de investimentos relevante"
      - "Incluir 1 com visão mais keynesiana e 3 com visão liberal"
```

---

## Configuracao

Valores default em `config.yaml`. Override via argumentos CLI.

| Parametro | Default | Range | Descricao |
|-----------|---------|-------|-----------|
| `total_agents` | 20 | 10-50 | Numero de agentes no painel |
| `rounds` | 3 | 1-5 | Rodadas de deliberacao |
| `batch_size` | 10 | 5-15 | Agentes por batch paralelo |
| `preset` | brasil-geral | -- | Preset demografico |
| `failure_threshold` | 0.3 | -- | Porcentagem maxima de falhas por rodada |
| `timeout_per_agent` | 120 | -- | Timeout por agente em segundos |
| `summarize_top_n` | 5 | -- | Top N argumentos por posicao no sumario |
| `--context` | -- | multiplos | Path(s) para documentos de contexto externo |
| `context_max_words` | 500 | -- | Limite de palavras por documento apos sumarizacao |

## Estrutura de Output

Cada simulacao gera uma pasta timestamped:

```
output/{YYYYMMDD-HHMM}-{slug}/
+-- config-snapshot.yaml   # Configuracao usada nesta simulacao
+-- panel.yaml             # Perfis dos agentes (reutilizavel)
+-- context-metadata.yaml  # Metadados de contexto (se --context fornecido)
+-- rounds/                # Dados brutos por rodada
|   +-- round-1.yaml
|   +-- round-2.yaml
|   +-- round-3.yaml
+-- aggregation.yaml       # Metricas agregadas (Epic 3)
+-- report.md              # Relatorio final (Epic 4)
```

---

## Assembly Isolada (Dry-Run de Painel)

Para validar que o sistema de personas esta gerando perfis diversos e bem formados
**antes** de rodar a simulacao completa, execute apenas a Fase 1 (Assembly) isoladamente.

### Como rodar o dry-run de painel

```
/politica-simulation-mirofish --dry-run --preset brasil-geral --agents 10
```

Ou manualmente, seguindo os passos abaixo:

#### Passo 1: Escolher preset e numero de agentes

Ler o preset desejado de `presets/{preset}.yaml`. Para dry-run, usar metade do
painel (10 agentes em vez de 20) para economia de tokens.

Ao usar 10 agentes, reduzir proporcionalmente cada segmento (arredondar para cima):
- classe-ab-urbano-sudeste: 2
- classe-c-urbano: 3
- classe-de-periferia: 2
- rural-interior: 1
- jovem-digital: 1
- evangelico-conservador: 1

#### Passo 2: Gerar perfis

Para cada segmento no preset:
1. Ler o archetype base de `data/demographic-archetypes.yaml`
2. Aplicar os `template_overrides` do segmento
3. Seguir as `variation_rules` para criar diversidade dentro do segmento
4. Para cada agente, gerar o perfil completo seguindo `templates/agent-persona.md`

**Gerar apenas os perfis YAML, sem montar o system prompt completo.**
O dry-run valida a diversidade dos perfis, nao a qualidade do prompt.

#### Passo 3: Salvar panel.yaml

Salvar o painel gerado em:
```
output/{YYYYMMDD-HHMM}-dry-run-painel/panel.yaml
```

Formato do panel.yaml:
```yaml
simulation_id: "{timestamp}-dry-run-painel"
preset: brasil-geral
total_agents: 10
generated_at: "{ISO timestamp}"

agents:
  - id: agent-001
    name: "Nome Brasileiro"
    segment: classe-ab-urbano-sudeste
    demographic:
      age: 42
      gender: masculino
      region: sp-capital
      class: A
      education: pos-graduacao
      religion: sem-religiao
      occupation: executivo-tech
    psychographic:
      values: [meritocracia, eficiencia, inovacao]
      priorities: [economia, competitividade, seguranca-juridica]
      information_sources: [economist, linkedin, podcasts]
      cognitive_biases: [contrast_misreaction, inconsistency_avoidance]
      influence_susceptibility:
        reciprocidade: baixo
        compromisso: alto
        prova_social: baixo
        autoridade: medio
        escassez: baixo
        afinidade: medio
    deliberative:
      processing_style: analitico
      opinion_flexibility: media
      argument_weight: dados-e-evidencias
      expression_style: tecnico
  # ... (demais agentes)
```

#### Passo 4: Validar diversidade

Apos gerar, verificar manualmente:

- [ ] Nenhum par de agentes tem perfil identico (comparar region + class + age + religion)
- [ ] Todos os 10 perfis contem todos os campos obrigatorios:
  - `id`, `name`
  - `demographic`: age, gender, region, class, education, religion, occupation (7 subcampos)
  - `psychographic`: values, priorities, information_sources, cognitive_biases, influence_susceptibility (4 subcampos + sub-objeto)
  - `deliberative`: processing_style, opinion_flexibility, argument_weight, expression_style (4 subcampos)
- [ ] Pelo menos 3 regioes distintas representadas
- [ ] Pelo menos 2 processing_styles diferentes (emocional e analitico no minimo)
- [ ] Pelo menos 2 generos representados
- [ ] Pelo menos 2 faixas etarias diferentes

#### Passo 5: Diagnostico

Se a validacao falhar:
- **Perfis muito similares** -> Ajustar `variation_rules` no preset ou diversificar archetypes
- **Campos faltando** -> Verificar se o archetype base tem todos os campos obrigatorios
- **Pouca diversidade regional** -> Aumentar a variedade nos `template_overrides.demographic.region`
- **Todos analiticos/emocionais** -> Verificar se os archetypes cobrem ambos os processing_styles

O dry-run serve como gate de qualidade: se os perfis nao forem diversos aqui,
a simulacao completa vai produzir resultados convergentes e inuteis.

---

## Spike: Validacao de Diversidade e Paralelismo

**Pre-requisito obrigatorio antes da primeira simulacao completa.**
Este protocolo valida que os agentes produzem opiniao genuinamente diversa
e que o paralelismo funciona de forma estavel.

### Como rodar o spike

```
/politica-simulation-mirofish --spike-validation
```

Ou manualmente, seguindo os 5 testes abaixo.

### Teste 1: Diversidade de Opiniao

**Objetivo:** Validar que perfis contrastantes produzem posicoes diferentes.

1. Gerar 5 agentes com perfis MAXIMAMENTE contrastantes:
   - Agente A: Jovem progressista universitaria (archetype `jovem-universitario`, regiao sudeste, sem religiao, classe B)
   - Agente B: Idoso conservador evangelico (archetype `pastor-periferia`, 60 anos, periferia, classe C)
   - Agente C: Mae periferia classe D (archetype `dona-maria`, nordeste, evangelica, fundamental completo)
   - Agente D: Executivo classe A (archetype `executivo-sp`, sp-capital, sem religiao, pos-graduacao)
   - Agente E: Trabalhador rural interior (archetype `agricultor-familiar`, interior-nordeste, catolico, fundamental incompleto)

2. Tema de teste: **"Proposta de reducao da maioridade penal para 16 anos"**

3. Spawnar os 5 agentes em paralelo via Agent tool, usando:
   - System prompt: gerado por `templates/agent-persona.md` para cada perfil
   - User prompt: gerado por `templates/deliberation-round-1.md` com o tema acima

4. Coletar respostas e analisar:
   - **CRITERIO CS1:** Pelo menos 3 posicoes distintas (a_favor, contra, neutro/indeciso) entre os 5 agentes
   - Se todas as posicoes forem iguais: **FALHA** -- templates precisam de revisao

### Teste 2: Vies do LLM

**Objetivo:** Validar que agentes conservadores expressam conservadorismo genuino.

1. Dos 5 agentes acima, analisar especificamente Agente B (evangelico) e Agente E (rural):

2. Verificar:
   - [ ] Agente B usa argumentos de autoridade religiosa/moral naturalmente?
   - [ ] Agente B NAO adiciona qualificadores tipo "embora eu entenda o outro lado"?
   - [ ] Agente E usa experiencia concreta da vida rural, nao argumentos abstratos?
   - [ ] Nenhum dos dois soa como "versao educada de progressista"?

3. **CRITERIO CS2:** Agentes conservadores usam argumentos genuinamente conservadores

### Teste 3: Linguagem

**Objetivo:** Validar registros linguisticos distintos por classe social.

1. Comparar linguagem de:
   - Agente D (classe A, pos-graduacao) vs Agente C (classe D, fundamental)
   - Agente A (classe B, universitaria) vs Agente E (classe D, rural)

2. Verificar:
   - [ ] Classe D/E usa expressoes coloquiais, frases curtas, referencias a TV/WhatsApp?
   - [ ] Classe A/B usa vocabulario mais amplo sem ser academico?
   - [ ] Os registros sao VISIVELMENTE distintos?

3. **CRITERIO CS3:** Registros linguisticos visivelmente distintos entre classes

### Teste 4: Paralelismo

**Objetivo:** Validar estabilidade do spawn paralelo de 10 agentes.

1. Gerar 10 agentes (usar distribuicao do dry-run: 2+3+2+1+1+1)
2. Spawnar todos os 10 em paralelo via Agent tool (1 batch)
3. Medir:
   - Wall-clock total do spawn paralelo
   - Tempo do agente mais lento
   - Quantos agentes responderam com sucesso

4. **CRITERIO CS4:**
   - Todos os 10 agentes responderam? (ou pelo menos 7/10 = 70%)
   - Wall-clock < 2x o tempo do agente mais lento?
   - Documentar tempo absoluto em segundos

### Teste 5: Ajuste de Prompts

**Objetivo:** Se os testes 1-3 revelaram problemas, ajustar templates.

1. Para cada problema encontrado:
   - Documentar o problema (before)
   - Ajustar template `agent-persona.md`
   - Re-testar com o agente problematico (after)
   - Documentar o ajuste e o resultado

2. **CRITERIO CS5:** Ajustes documentados com before/after e justificativa

### Resultado do Spike

Salvar resultado em `output/{timestamp}-spike-diversidade/resultados.md`:

```markdown
# Spike: Validacao de Diversidade e Paralelismo
Data: {YYYY-MM-DD}

## Resultados

| Criterio | Status | Notas |
|----------|--------|-------|
| CS1: 3+ posicoes distintas | PASS/FAIL | {detalhes} |
| CS2: Conservadorismo genuino | PASS/FAIL | {detalhes} |
| CS3: Linguagem por classe | PASS/FAIL | {detalhes} |
| CS4: Paralelismo 10 agentes | PASS/FAIL | wall-clock: Xs, mais lento: Ys |
| CS5: Ajustes documentados | PASS/FAIL | {lista de ajustes} |

## Gate de Decisao

**Decisao: GO / NO-GO**

{Se GO: "Todos os criterios atendidos. Prosseguir para simulacao completa."}
{Se NO-GO: "Criterios {lista} falharam. Acoes necessarias: {lista de acoes}"}

## Respostas dos Agentes

### Agente A: {nome} ({perfil resumido})
{resposta YAML completa}

### Agente B: {nome} ({perfil resumido})
{resposta YAML completa}

... (demais agentes)

## Ajustes Realizados

### Ajuste 1: {descricao}
- **Problema:** {o que estava errado}
- **Before:** {trecho do template antes}
- **After:** {trecho do template depois}
- **Resultado:** {melhoria observada}
```

### Gate de Decisao

**Se CS1-CS3 falharem:** PARAR. Revisar templates de persona antes de prosseguir.
Sem diversidade validada, o motor de deliberacao nao tem valor.

**Se CS4 falhar:** Considerar fallback para execucao sequencial com batching menor.
Documentar limitacao e ajustar `batch_size` no `config.yaml`.

---

## Dry-Run End-to-End (Simulacao Completa Reduzida)

Executa o pipeline COMPLETO com parametros reduzidos para validar que
assembly + deliberacao + sumarizacao + checkpoints funcionam corretamente.

### Como rodar o dry-run E2E

```
/politica-simulation-mirofish --dry-run-e2e
```

Ou manualmente:

```
/politica-simulation-mirofish "Proposta de reducao da maioridade penal para 16 anos" --preset brasil-geral --agents 10 --rounds 2
```

### Parametros do Dry-Run

| Parametro | Valor | Justificativa |
|-----------|-------|---------------|
| Agentes | 10 | Metade do padrao, cobre todos os segmentos |
| Rodadas | 2 | Minimo para testar sumarizacao + mudanca de opiniao |
| Preset | brasil-geral | Preset padrao, maximo de diversidade |
| Tema | "Reducao da maioridade penal para 16 anos" | Tema canonico do projeto |

### Checklist de Validacao

Apos a execucao, verificar TODOS os itens:

**Assembly:**
- [ ] `output/{run}/panel.yaml` existe e contem 10 perfis completos
- [ ] Perfis sao diversos (verificar checklist de diversidade da Assembly Isolada)

**Rodada 1:**
- [ ] `output/{run}/rounds/round-1.yaml` existe
- [ ] Contem respostas estruturadas de todos os agentes (ou com status error/timeout documentado)
- [ ] Cada resposta tem: position, intensity, main_arguments, reasoning
- [ ] Pelo menos 7/10 agentes com status: success

**Sumarizacao:**
- [ ] Sumario gerado com argumentos agrupados por posicao
- [ ] Distribuicao percentual calculada corretamente
- [ ] Linguagem acessivel (nao academica)
- [ ] Neutro (sem favorecer um lado)

**Rodada 2:**
- [ ] `output/{run}/rounds/round-2.yaml` existe
- [ ] Contem campos adicionais: opinion_changed, change_trigger, previous_position
- [ ] Pelo menos 1 agente mudou de opiniao (demonstra que o mecanismo funciona)
- [ ] previous_position corresponde a posicao real da rodada 1

**Checkpoints:**
- [ ] `config-snapshot.yaml` existe e e valido
- [ ] `panel.yaml` existe como arquivo independente
- [ ] `round-1.yaml` existe como arquivo independente
- [ ] `round-2.yaml` existe como arquivo independente

**Performance:**
- [ ] Wall-clock total documentado
- [ ] Meta: < 10 minutos para 10 agentes, 2 rodadas

### Interpretacao dos Resultados

O dry-run E2E valida o **pipeline**, nao a qualidade dos argumentos
(isso foi validado no Spike). Se todos os checkpoints passarem:

- **Pipeline funcional:** Assembly + Deliberacao + Sumarizacao + Checkpoints OK
- **Pronto para:** Simulacao completa com 20 agentes e 3 rodadas
- **Proximo:** Rodar simulacao de validacao (secao abaixo)

Se algum checkpoint falhar, diagnosticar antes de prosseguir.

---

## Simulacao de Validacao (Cenario Canonico)

**Pre-requisito:** Todas as fases do pipeline (Assembly, Deliberacao, Agregacao, Relatorio) implementadas e testadas individualmente (dry-run E2E acima).

Este cenario canonico serve como **benchmark qualitativo** — se esta simulacao produz output util, o politica-simulation-mirofish esta pronto para uso real.

### Cenario

| Parametro | Valor |
|-----------|-------|
| **Tema** | "Proposta de reducao da maioridade penal para 16 anos" |
| **Preset** | brasil-geral |
| **Agentes** | 20 |
| **Rodadas** | 3 |
| **Contexto** | 2 noticias recentes sobre o tema (max 300 palavras cada) |

### Como rodar

```
/politica-simulation-mirofish "Proposta de reducao da maioridade penal para 16 anos" --preset brasil-geral --agents 20 --rounds 3 --context docs/contexto-maioridade-1.md docs/contexto-maioridade-2.md
```

### Criterios de Aceite (Mensuraveis)

Apos a execucao completa, verificar TODOS os itens:

#### CR1: Relatorio completo (FR19)

- [ ] `output/{run}/report.md` existe
- [ ] Contem TODAS as 7 secoes: Sumario Executivo, Dashboard de Sentimento, Mapa de Argumentos, Vulnerabilidades, Dinamica de Opiniao, Recomendacoes, Metodologia
- [ ] Sumario Executivo tem 3-5 paragrafos
- [ ] Disclaimer etico presente na secao Metodologia

#### CR2: Diversidade de argumentos (NFR4)

- [ ] `output/{run}/aggregation.yaml` contem pelo menos **10 argumentos unicos** no total
- [ ] Argumentos cobrem AMBOS os lados (a_favor e contra)

#### CR3: Divergencia entre segmentos

- [ ] Pelo menos **2 segmentos demograficos** com distribuicao de sentimento distinta
- [ ] Diferenca de **>= 20 pontos percentuais** entre segmentos em alguma posicao
- [ ] Exemplo esperado: classe-ab-urbano tem 60% a favor vs classe-de-periferia tem 30% a favor (diferenca: 30pp)

#### CR4: Diversidade de posicoes

- [ ] Nenhum agente tem **posicao final identica** ao agente imediatamente anterior na ordem de processamento
- [ ] Verificar no round final: para cada par consecutivo (agent-N, agent-N+1), pelo menos 1 campo difere (position, intensity ou main_arguments)

#### CR5: Performance (NFR1)

- [ ] Wall-clock total <= **15 minutos** para 20 agentes, 3 rodadas

#### CR6: Qualidade das recomendacoes (review qualitativo)

- [ ] Recomendacoes sao **acionaveis** — um assessor conseguiria executar amanha
- [ ] Argumentos sao **plausiveis** dentro do perfil demografico de cada agente
- [ ] Tom do relatorio e legivel por **nao-tecnico** (sem jargao de AI)
- [ ] Pelo menos 1 recomendacao endereça a vulnerabilidade de maior impacto

### Estrutura de Output Esperada

```
output/{YYYYMMDD-HHMM}-reducao-maioridade/
+-- config-snapshot.yaml     # Configuracao usada
+-- panel.yaml               # 20 perfis do brasil-geral
+-- context-metadata.yaml    # Metadados das 2 noticias
+-- rounds/
|   +-- round-1.yaml         # Opiniao individual (20 agentes)
|   +-- round-2.yaml         # Deliberacao com exposicao
|   +-- round-3.yaml         # Deliberacao final
+-- aggregation.yaml         # Metricas agregadas (6 etapas)
+-- report.md                # Relatorio final (7 secoes)
```

### Interpretacao

Se **TODOS os criterios CR1-CR6 passarem:**
- O politica-simulation-mirofish esta funcional e pronto para uso com temas reais
- O output pode ser apresentado a consultores politicos como demonstracao

Se algum criterio falhar:
- **CR1 falha:** Templates de relatorio precisam de revisao
- **CR2 falha:** Personas nao estao gerando diversidade suficiente — revisar agent-persona.md
- **CR3 falha:** Preset brasil-geral precisa de mais variacao nos segmentos
- **CR4 falha:** Templates de deliberacao estao convergindo — aumentar peso do perfil no prompt
- **CR5 falha:** Considerar reduzir batch_size ou otimizar sumarizacao
- **CR6 falha:** Templates de recomendacoes/relatorio precisam de ajuste de tom

---

## Referencias

- Spec completa: `.aios/forge-runs/forge-politica-simulation-mirofish-20260323-2242/spec/spec-final.md`
- Arquitetura: `.aios/forge-runs/forge-politica-simulation-mirofish-20260323-2242/spec/architecture.md`
- Research: `.aios/forge-runs/forge-politica-simulation-mirofish-20260323-2242/spec/research.md`
