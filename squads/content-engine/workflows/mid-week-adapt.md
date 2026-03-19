# Workflow: Mid-Week Adapt

## Metadata
- id: mid-week-adapt
- version: 1.0.0
- type: multi-agent
- estimated_time: 1h-1h45min (3 fases)
- agents_involved: [@caleb-ralston, @vanessa-lau, @devil-advocate, + 2 agentes relevantes ao contexto]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 3 fases sequenciais. Cada fase tem um GATE de saída. Se o GATE falhar, PARE. NÃO pule fases. NÃO avance sem completar TODOS os items do GATE.**

**Se você está lendo este workflow, siga estas regras:**
1. Execute as fases na ORDEM (1 → 2 → 3)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NÃO, PARE e corrija — GATE-PASS requer 100% (Score = N/N)
4. Escreva "GATE-PASS: mid-week-adapt [fase] [data]" antes de avançar

**Nota sobre Score**: O campo Score é para auditoria/rastreamento. O Status é binário — GATE-PASS exige todos os items marcados. Qualquer Score < N/N = GATE-FAIL.

---

## Proposito
Adaptar o sprint semanal quando acontece algo inesperado que justifica mudanca — sem reescrever tudo. O principio fundamental: **adaptacao != reescrita total**. Mudar o minimo necessario para capturar a oportunidade ou responder ao evento.

## Principio Core

> Adaptacao eh cirurgia, nao transplante. Mude o minimo necessario para capturar a oportunidade.

## Gatilhos (Triggers)

| Gatilho | Descricao | Exemplo |
|---------|-----------|---------|
| Evento real na vida do Tiago | Historia pessoal, encontro, insight que aconteceu | "Tive uma conversa com um mentorado que mudou minha perspectiva sobre X" |
| Engajamento explosivo | Post/story com muito mais engajamento que o esperado | Enquete com 500+ respostas, DMs em massa sobre um tema |
| Post que flopou | Performance muito abaixo do esperado, precisa de compensacao | Post principal da semana com 30% do reach medio |
| Feedback inesperado da audiencia | Audiencia pedindo algo ou reagindo a algo nao planejado | "Varios seguidores perguntando sobre Y nos comentarios" |
| Mudanca de contexto | Produto atualizado, noticia relevante, trend do momento | "Saiu uma pesquisa nova sobre obesidade mental que eh perfeita pro nosso tema" |

## Inputs

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| sprint_file | path | sim | Caminho para `sprint-semana-N.md` do sprint atual |
| tracker_file | path | sim | Caminho para `tracker-semana-N.md` do sprint atual |
| trigger_type | string | sim | Tipo de gatilho (evento_real, engajamento, flop, feedback, contexto) |
| trigger_description | string | sim | Descricao detalhada do que aconteceu |
| trigger_data | object | nao | Dados de suporte (metricas, prints, links) |

## Fases

### Fase 1: ANALISE (15 min)
- **Agentes**: @caleb-ralston + @vanessa-lau
- **Inputs**: sprint_file, tracker_file, trigger_type, trigger_description, trigger_data
- **Acoes**:
  1. @caleb-ralston: Analisar o que aconteceu e como impacta o posicionamento da semana
  2. @caleb-ralston: Mapear quais pecas do sprint sao afetadas (diretas e indiretas)
  3. @vanessa-lau: Analisar impacto nas metricas e engajamento projetado
  4. @vanessa-lau: Identificar oportunidade de engajamento imediato (stories, enquetes)
  5. Ambos: Decidir escopo da adaptacao — quantas pecas mudam?
- **Output**: analise_impacto (pecas afetadas, escopo de mudanca, oportunidade identificada)
- **Regra**: A analise deve responder: "Quantas pecas REALMENTE precisam mudar?" Tendencia natural eh mudar tudo — resistir a isso.

---

### GATE-1: Análise de Impacto Completa

**OBRIGATÓRIO antes de avançar para Fase 2**

- [ ] Impacto do gatilho analisado no posicionamento da semana
- [ ] Peças afetadas mapeadas (diretas e indiretas)
- [ ] Escopo de adaptação definido (mínimo necessário)
- [ ] Resposta clara: "Quantas peças REALMENTE precisam mudar?"

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete a análise. NÃO inicie debate sem escopo definido.
Se GATE-PASS: escreva "GATE-PASS: mid-week-adapt analise [data]"

---

### Fase 2: DEBATE RAPIDO (20 min)
- **Agentes**: 2 agentes relevantes ao tipo de conteudo + @devil-advocate
- **Inputs**: analise_impacto, sprint_file, trigger_description
- **Acoes**:
  1. Agente 1: Propor adaptacao para as pecas afetadas
  2. Agente 2: Propor adaptacao alternativa
  3. @devil-advocate: Atacar ambas propostas com pergunta-chave: **"Por que NAO mudar?"**
     - Isso previne reacao exagerada — as vezes o melhor eh nao mudar nada
     - Devil's Advocate questiona se a mudanca eh realmente necessaria
     - Se a resposta para "por que nao mudar?" eh fraca, a adaptacao segue
     - Se a resposta eh forte, talvez o sprint original esteja melhor
  4. Decidir: adaptar, manter original, ou adaptar parcialmente
- **Output**: proposta_adaptacao (o que muda, o que mantem, justificativa)
- **Regra**: O Devil's Advocate aqui tem papel INVERSO ao debate normal — ele defende o status quo para prevenir overreaction.

---

### GATE-2: Debate Rápido Completo

**OBRIGATÓRIO antes de avançar para Fase 3**

- [ ] Devil's Advocate respondeu "por que NÃO mudar?" com argumentos
- [ ] Decisão tomada: adaptar, manter original, ou adaptar parcialmente
- [ ] Justificativa documentada para a decisão
- [ ] Se decisão = "manter", workflow ENCERRA aqui (sem Fase 3)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete o debate. NÃO reescreva sem decisão clara.
Se GATE-PASS: escreva "GATE-PASS: mid-week-adapt debate [data]"

---

### Fase 3: REESCRITA (30 min - 1h)
- **Agentes**: Agentes de criacao relevantes (conforme tabela de pares do debate-session)
- **Inputs**: proposta_adaptacao, sprint_file, tracker_file
- **Acoes**:
  1. Reescrever apenas as pecas afetadas (copy completa + art direction)
  2. Atualizar sprint-semana-N.md:
     - Marcar peca original como substituida: `[SUBSTITUIDA] ❌ Titulo Original`
     - Adicionar nova peca no mesmo slot ou novo slot
     - Manter estrutura do sprint (horario, plataforma, formato)
  3. Atualizar tracker-semana-N.md:
     - Adicionar entrada na secao "Decisoes de Ajuste"
     - Registrar: data, gatilho, o que mudou, por que, quem decidiu
  4. Gerar nova copy e art direction para pecas adaptadas
  5. Se necessario, ajustar cronograma da semana
- **Output**: sprint atualizado, tracker atualizado, novas pecas prontas

---

### GATE-3: Reescrita Completa

**GATE FINAL — determina se adaptação está pronta**

- [ ] Sprint atualizado in-place com marcação clara de substituição
- [ ] Tracker com registro completo na seção "Decisões de Ajuste"
- [ ] Novas peças seguem estrutura original (horário, formato, ANC, copy, art)
- [ ] Tempo total respeitado (máximo 1h45min)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete a reescrita ou registre no tracker. NÃO publique peças incompletas.
Se GATE-PASS: escreva "GATE-PASS: mid-week-adapt reescrita [data]"

---

## Integracao com Sprint e Tracker

### Leitura (Inputs)
O workflow le como entrada:
- `sprint-semana-N.md` — plano semanal com todas as pecas programadas
- `tracker-semana-N.md` — historico de performance e decisoes da semana

### Atualizacao do Sprint
Quando uma peca eh adaptada, o sprint eh atualizado in-place:

```markdown
## Quarta-feira
### Post Feed — 12:00
- [SUBSTITUIDA] ❌ "5 sinais de que voce esta com obesidade mental"
- ✅ "A conversa que mudou minha visao sobre clareza" (adaptado: evento real)
- Formato: Carrossel
- ANC: Attract
- Copy: [nova copy completa]
- Art: [nova direcao de arte]
```

### Atualizacao do Tracker
Toda adaptacao eh registrada na secao "Decisoes de Ajuste":

```markdown
## Decisoes de Ajuste

### Ajuste #1 — 2026-02-12
- **Gatilho**: Evento real (conversa com mentorado)
- **Tipo**: evento_real
- **Pecas afetadas**: Post feed de quarta + story de quarta
- **O que mudou**: Tema do post trocado para historia real; story adicionado como complemento
- **O que manteve**: Copy de quinta e sexta mantidas (nao afetadas)
- **Justificativa**: Historia real > conteudo planejado quando ha autenticidade e relevancia
- **Decisao por**: @caleb-ralston + @devil-advocate (confirmou necessidade)
- **Score robustez**: 8/10 (devil's advocate)
```

### Estrutura das Novas Pecas
Pecas adaptadas seguem a mesma estrutura do sprint original:
- Horario e plataforma
- Formato (post, carrossel, reel, story)
- Tag ANC (Attract / Nurture / Convert)
- Copy completa (hook + corpo + CTA)
- Direcao de arte
- Nota de adaptacao (referencia ao gatilho)

## Outputs

| Entregavel | Formato | Descricao |
|------------|---------|-----------|
| analise_impacto | markdown | Analise do que aconteceu e pecas afetadas |
| proposta_adaptacao | markdown | Proposta de mudanca com justificativa |
| sprint_atualizado | markdown | Sprint-semana-N.md atualizado in-place |
| tracker_atualizado | markdown | Tracker-semana-N.md com registro de ajuste |
| novas_pecas | markdown[] | Copy + art direction das pecas adaptadas |
| decision_log | markdown | Registro para historico do content engine |

## Resumo dos Gates

> Os critérios abaixo são um resumo consolidado dos GATE blocks inline acima. Use os GATE blocks durante a execução; esta seção é referência rápida.

| Gate | Corresponde a | Critério Principal |
|------|---------------|-------------------|
| GATE-1 | Análise | Impacto analisado, escopo definido |
| GATE-2 | Debate | Devil's Advocate respondeu, decisão tomada |
| GATE-3 | Reescrita | Sprint e tracker atualizados, peças completas |

## Anti-Patterns

| Anti-Pattern | Por que eh problema | O que fazer |
|-------------|-------------------|------------|
| Reescrever o sprint inteiro | Overreaction — a maioria das pecas nao eh afetada | Mudar so o necessario |
| Adaptar sem dados | "Acho que deveria mudar" sem evidencia | Exigir gatilho claro com dados |
| Ignorar o tracker | Mudancas nao registradas se perdem | Sempre atualizar a secao de ajustes |
| Mudar por ansiedade | Post nao performou? Talvez seja cedo demais pra reagir | Esperar 24-48h antes de classificar como flop |
| Nao questionar a mudanca | Aceitar adaptacao automaticamente | Devil's Advocate pergunta "por que NAO mudar?" |
