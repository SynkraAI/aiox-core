# create-launch-timeline

## Metadata
```yaml
task_id: HZ_LAUNCH_002
agent: hormozi-launch
type: planning
complexity: high
estimated_time: 45-60min
source: "$100M Launch Playbook - 8 Fases Cronologicas"
```

## Purpose

Create a complete launch timeline using the 8 Chronological Phases framework — from 6 weeks before to post-launch maximization.

> "50-60% de todas as vendas acontecem nas ultimas 4 horas de qualquer campanha." — Alex Hormozi

---

## Pre-Conditions

- [ ] E.V.E.N.T.O plan completed (plan-launch-evento.md)
- [ ] D-Day date defined
- [ ] Budget allocated
- [ ] Team size determined

---

## Input Required

```yaml
timeline_context:
  d_day: ""  # Data do evento principal
  launch_size: ""  # micro, small, medium, large, mega
  total_budget: ""
  registration_target: ""
  revenue_target: ""
```

---

## The 8 Chronological Phases

### FASE I - PREPARACAO (S-6 a S-4)

**Duracao:** 2-3 semanas
**Objetivo:** Construir toda infraestrutura e ativos

**Acoes Criticas:**

| Entregavel | Responsavel | Deadline | Status |
|------------|-------------|----------|--------|
| 1000+ variacoes de ads | | | [ ] |
| 2 hero ads produzidos | | | [ ] |
| 7 paginas de funil | | | [ ] |
| 30+ sequencias de email | | | [ ] |
| LED Wall/estudio configurado | | | [ ] |
| Load testing 1M+ acessos | | | [ ] |
| 10+ pessoas core contratadas | | | [ ] |

**Gatilhos Psicologicos:** Antecipacao, Curiosidade
**Recursos:** 10+ pessoas, $500K setup

```yaml
fase_1_preparacao:
  start_date: ""  # S-6
  end_date: ""  # S-4
  entregaveis:
    - item: ""
      responsavel: ""
      deadline: ""
      status: "pending"
```

---

### FASE II - KICKOFF AFILIADOS (S-6 continuo)

**Duracao:** Continua ate o lancamento
**Objetivo:** Ativar exercito de promotores com gamificacao

**Acoes Criticas:**

| Entregavel | Responsavel | Deadline | Status |
|------------|-------------|----------|--------|
| Email para lista de afiliados | | | [ ] |
| Plataforma tracking configurada | | | [ ] |
| Swipes para afiliados | | | [ ] |
| Ads templates para afiliados | | | [ ] |
| Videos para afiliados | | | [ ] |
| Sistema de incentivos comunicado | | | [ ] |

**Gatilhos:** Competicao, Exclusividade, Recompensa

```yaml
fase_2_afiliados:
  start_date: ""  # S-6
  ongoing: true
  entregaveis:
    - item: ""
      responsavel: ""
      deadline: ""
```

---

### FASE III - ANUNCIO PUBLICO (S-4)

**Duracao:** 1 semana
**Objetivo:** Criar buzz e iniciar registros

**Acoes Criticas:**

| Entregavel | Responsavel | Deadline | Status |
|------------|-------------|----------|--------|
| Video announcement YouTube | | | [ ] |
| Ads iniciados ($10K/dia) | | | [ ] |
| 5 videos organicos | | | [ ] |
| 4-5 podcasts estrategicos | | | [ ] |

**Gatilhos:** Prova Social, Autoridade, FOMO

```yaml
fase_3_anuncio:
  start_date: ""  # S-4
  end_date: ""
  entregaveis:
    - item: ""
      responsavel: ""
      deadline: ""
```

---

### FASE IV - AQUECIMENTO (S-3 a S-1)

**Duracao:** 3 semanas
**Objetivo:** Escalar registros para 1M+ pessoas

**Escalonamento de Ads:**

| Semana | Budget/Dia | Target Registros | CPL Target | Canais |
|--------|-----------|------------------|------------|--------|
| S-4 | $10K | 50K | <$20 | FB/IG |
| S-3 | $50K | 200K | <$15 | +Google, +TikTok |
| S-2 | $150K | 500K | <$12 | +YouTube, +Native |
| S-1 | $250K | 1M+ | <$10 | All channels |

**Conteudo Estrategico:**

| Semana | Tema | Gatilho |
|--------|------|---------|
| S-3 | PROBLEMA | Agitacao |
| S-2 | POSSIBILIDADE | Esperanca |
| S-1 | PROMESSA | FOMO |

```yaml
fase_4_aquecimento:
  semanas:
    - semana: "S-3"
      budget_dia: ""
      target_registros: ""
      cpl_target: ""
      tema_conteudo: "PROBLEMA"
    - semana: "S-2"
      budget_dia: ""
      target_registros: ""
      cpl_target: ""
      tema_conteudo: "POSSIBILIDADE"
    - semana: "S-1"
      budget_dia: ""
      target_registros: ""
      cpl_target: ""
      tema_conteudo: "PROMESSA"
```

---

### FASE V - EVENTO AO VIVO (Dia D)

**Duracao:** 4+ horas
**Objetivo:** Converter massa em compradores

**Estrutura do Evento:**

| Bloco | Duracao | Conteudo | Gatilho |
|-------|---------|----------|---------|
| Bloco 1 | 90 min | Webinar principal | Educacao |
| Bloco 2 | 60-90 min | Guest speakers | Autoridade |
| Bloco 3 | 30+ min | Giveaways e FAQ | Reciprocidade |

**Timeline do Dia D:**

| Horario | Atividade |
|---------|-----------|
| 05:00 | Chegada e setup inicial |
| 06:00 | Checagem de sistemas |
| 07:00 | Briefing geral |
| 08:00 | Ensaio final |
| 09:00 | INICIO DO EVENTO |
| 09:00-21:00 | Comando da sala de guerra |
| 21:00 | Wrap up |

**Setup de Streaming:**
- YouTube Principal (publico geral)
- YouTube VIP (acesso exclusivo)
- Zoom Backup (contingencia)
- Gravacao 4K

```yaml
fase_5_evento:
  data: ""  # D-Day
  duracao: ""
  estrutura:
    bloco_1:
      duracao: "90min"
      conteudo: ""
      gatilho: "Educacao"
    bloco_2:
      duracao: "60-90min"
      conteudo: ""
      gatilho: "Autoridade"
    bloco_3:
      duracao: "30min"
      conteudo: ""
      gatilho: "Reciprocidade"

  timeline_dia:
    - horario: "05:00"
      atividade: ""
```

---

### FASE VI - FACILITACAO DE VENDAS (Durante evento)

**Duracao:** 24 horas
**Objetivo:** Maximizar conversao com suporte

**Estrutura do Time:**

| Nivel | Quantidade | Foco | Comissao |
|-------|------------|------|----------|
| Closers Senior | 10 | High-ticket ($5K+) | 10% |
| Closers Mid | 40 | Mid-ticket ($450) | 7% |
| SDRs/Chat | 250 | Core ($30) + qualificacao | 5% |

**Turnos:**

| Turno | Horario | Pessoas |
|-------|---------|---------|
| Manha | 06:00-14:00 | 125 |
| Pico | 12:00-20:00 | 300 |
| Noite | 18:00-02:00 | 125 |

**Metricas em Tempo Real:**

| Metrica | Target | Alerta |
|---------|--------|--------|
| Fila de espera | <30 | >50 |
| Taxa conversao | >15% | <10% |
| Tempo medio ligacao | 7 min | >12 min |
| Faturamento/hora | $250K+ | <$150K |

```yaml
fase_6_vendas:
  team_structure:
    senior_closers: ""
    mid_closers: ""
    sdrs_chat: ""

  turnos:
    - nome: "Manha"
      horario: "06:00-14:00"
      pessoas: ""

  metricas_target:
    fila_espera: "<30"
    conversao: ">15%"
    tempo_ligacao: "7min"
    faturamento_hora: ""
```

---

### FASE VII - CART CLOSE (D+1 a D+3)

**Duracao:** 72 horas
**Objetivo:** Urgencia final e recuperacao

**Sequencia de Recuperacao:**

| Timing | Acao | Gatilho |
|--------|------|---------|
| Durante evento (+1h) | "Voce saiu antes da melhor parte" | Urgencia |
| D+1 | Oferta degradada (menos bonus) | Prova Social |
| D+2 | Preco aumenta + remove bonus | Escassez |
| D+3 AM | "Ultimas 12 horas" | FOMO |
| D+3 PM | "FECHANDO EM 1 HORA" | Urgencia maxima |

**Intensificacao Ultimas 4 Horas:**
```
48h antes: "Algumas pessoas vao perder isso..."
24h antes: "Amanha voce vai desejar ter agido hoje"
4h antes: "As proximas 4 horas definem os proximos 4 anos"
1h antes: "Enquanto voce esta lendo isso, 37 pessoas acabaram de comprar"
```

```yaml
fase_7_cart_close:
  duracao: "72h"
  sequencia:
    - timing: "Durante evento +1h"
      acao: ""
      canal: ""
    - timing: "D+1"
      acao: ""
      degradacao: ""
    - timing: "D+2"
      acao: ""
      preco_novo: ""
    - timing: "D+3 AM"
      acao: ""
    - timing: "D+3 PM (4h antes)"
      acao: ""
```

---

### FASE VIII - PR E MAXIMIZACAO (D+4 em diante)

**Duracao:** 2-4 semanas
**Objetivo:** Capitalizar em autoridade e recordes

**Acoes Pos-Lancamento:**

| Timing | Acao |
|--------|------|
| 0-24h | Onboarding memoravel, Surprise & delight, Pedido de depoimento |
| Semana 1 | Caso de sucesso rapido, Comunidade exclusiva, Upsell |
| Mes 1 | Evento exclusivo, Preview proximo lancamento, Programa embaixadores |

**Post-Mortem (4 Sessoes):**

| Sessao | Duracao | Foco |
|--------|---------|------|
| 1 | 2h | NUMEROS: Revenue, custos, conversoes, LTV:CAC |
| 2 | 2h | QUALITATIVO: O que funcionou/nao funcionou |
| 3 | 1h | PESSOAS: MVPs, gaps, treinamento |
| 4 | 1h | PROXIMOS PASSOS: Quick wins, SOPs, roadmap |

```yaml
fase_8_maximizacao:
  acoes_imediatas:
    - timing: "0-24h"
      acoes: []
  primeira_semana:
    - acao: ""
  primeiro_mes:
    - acao: ""

  post_mortem:
    sessao_1_numeros:
      data: ""
      participantes: []
    sessao_2_qualitativo:
      data: ""
    sessao_3_pessoas:
      data: ""
    sessao_4_proximos_passos:
      data: ""
```

---

## Output: Complete Launch Timeline

```yaml
launch_timeline:
  d_day: ""
  total_duration: "10 semanas"

  fase_1_preparacao:
    dates: "S-6 a S-4"
    entregaveis: []
    status: ""

  fase_2_afiliados:
    dates: "S-6 ongoing"
    status: ""

  fase_3_anuncio:
    dates: "S-4"
    status: ""

  fase_4_aquecimento:
    dates: "S-3 a S-1"
    budget_total: ""
    registros_target: ""
    status: ""

  fase_5_evento:
    date: ""
    duracao: ""
    status: ""

  fase_6_vendas:
    team_size: ""
    status: ""

  fase_7_cart_close:
    dates: "D+1 a D+3"
    status: ""

  fase_8_maximizacao:
    dates: "D+4 em diante"
    status: ""

  milestones:
    - date: ""
      milestone: ""
```

---

## Quality Gate

```yaml
timeline_quality:
  - [ ] Todas 8 fases mapeadas com datas
  - [ ] Responsaveis atribuidos por entregavel
  - [ ] Budget alocado por fase
  - [ ] Metricas de sucesso definidas por fase
  - [ ] Sequencia de cart close detalhada
  - [ ] Post-mortem agendado
  - [ ] Timeline exportavel para Gantt/project tool
```

## Handoff

After completion:
- → `setup-war-room.md` para operacoes Dia D
- → `create-contingency-plan.md` para matriz de riscos
- → `hormozi-copy` para sequencias de email por fase

---
*Task: HZ_LAUNCH_002 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - 8 Fases Cronologicas*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
