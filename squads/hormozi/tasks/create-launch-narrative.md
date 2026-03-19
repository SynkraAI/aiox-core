# create-launch-narrative

## Metadata
```yaml
task_id: HZ_LAUNCH_007
agent: hormozi-launch
type: content-strategy
complexity: medium
estimated_time: 45-60min
source: "$100M Launch Playbook - Tensao Narrativa"
```

## Purpose

Create the complete narrative arc for your launch — the story that builds tension, creates anticipation, and drives action through emotional connection.

> "Ha [tempo] eu [problema doloroso]. Depois de [jornada], descobri [solucao]. Agora, pela primeira vez, vou [grande revelacao]." — Formula Narrativa Hormozi

---

## Input Required

```yaml
narrative_context:
  product_name: ""
  founder_name: ""
  target_avatar: ""
  launch_date: ""  # D-Day
  core_promise: ""  # O que o produto entrega
```

---

## The Narrative Formula

### Core Story Structure

```
ANTES: "Ha [tempo] eu [problema doloroso]..."
JORNADA: "Depois de [tentativas/fracassos], descobri [insight]..."
AGORA: "Pela primeira vez, vou [revelar/compartilhar]..."
```

### Gatilhos Psicologicos Ativados

| Gatilho | Como a Narrativa Ativa |
|---------|------------------------|
| Curiosidade | "O que sera revelado?" |
| Identificacao | "Eu tenho esse problema!" |
| Autoridade | "Ele resolveu, pode me ajudar" |
| Antecipacao | "Mal posso esperar para descobrir" |
| FOMO | "Nao posso perder isso" |

---

## Phase 1: Your Origin Story

### The Problem (Antes)

```yaml
origin_problem:
  tempo: ""  # Ex: "5 anos atras", "Quando comecei"
  problema_doloroso: ""  # O que voce enfrentava
  impacto_emocional: ""  # Como se sentia
  tentativas_fracassadas: []  # O que tentou e nao funcionou
```

**Template:**
```
"Ha [tempo], eu [situacao]. Eu [problema emocional].
Tentei [tentativa 1], mas [fracasso].
Tentei [tentativa 2], mas [fracasso].
Eu estava [estado emocional mais baixo]."
```

### The Journey (Jornada)

```yaml
origin_journey:
  ponto_virada: ""  # O que mudou tudo
  insight_descoberto: ""  # A grande realizacao
  processo_desenvolvimento: ""  # Como construiu a solucao
  resultados_proprios: ""  # O que conseguiu para si
```

**Template:**
```
"Entao [ponto de virada].
Percebi que [insight fundamental].
Passei [tempo] desenvolvendo [solucao].
O resultado? [transformacao pessoal]."
```

### The Revelation (Agora)

```yaml
origin_revelation:
  primeira_vez: ""  # O que esta compartilhando pela primeira vez
  por_que_agora: ""  # Por que este momento
  o_que_muda: ""  # Como isso muda as coisas para a audiencia
```

**Template:**
```
"Agora, pela primeira vez, vou [grande revelacao].
[Por que agora] e o momento certo.
Isso significa que voce pode [beneficio para audiencia]."
```

---

## Phase 2: 3-Week Content Strategy

### Semana 3 (S-3): PROBLEMA — Agitacao

**Objetivo:** Fazer a audiencia SENTIR a dor do problema

| Dia | Conteudo | Formato | Gatilho | Canal |
|-----|----------|---------|---------|-------|
| S-3 D1 | | | Identificacao | |
| S-3 D2 | | | Dor | |
| S-3 D3 | | | Urgencia | |
| S-3 D4 | | | Prova social | |
| S-3 D5 | | | Curiosidade | |
| S-3 D6 | | | Agitacao | |
| S-3 D7 | | | Transicao | |

**Temas S-3:**
- Dados e estatisticas sobre o problema
- Casos de fracasso (anonimos)
- Controversias do setor
- "Por que [solucoes comuns] nao funcionam"
- Historias de dor pessoal

```yaml
semana_3_problema:
  tema: "PROBLEMA - Agitacao"
  objetivo: "Fazer audiencia sentir a dor"
  conteudos:
    - dia: 1
      titulo: ""
      formato: ""  # video, post, email, podcast
      hook: ""
      gatilho: ""
      canal: ""
```

---

### Semana 2 (S-2): POSSIBILIDADE — Esperanca

**Objetivo:** Mostrar que existe solucao (sem revelar completamente)

| Dia | Conteudo | Formato | Gatilho | Canal |
|-----|----------|---------|---------|-------|
| S-2 D1 | | | Esperanca | |
| S-2 D2 | | | Prova | |
| S-2 D3 | | | Bastidores | |
| S-2 D4 | | | Teaser | |
| S-2 D5 | | | Autoridade | |
| S-2 D6 | | | Antecipacao | |
| S-2 D7 | | | Build-up | |

**Temas S-2:**
- Demonstracoes parciais
- Resultados de beta testers
- Bastidores da criacao
- Teasers do que vem
- Guest speakers anunciados

```yaml
semana_2_possibilidade:
  tema: "POSSIBILIDADE - Esperanca"
  objetivo: "Mostrar que existe solucao"
  conteudos:
    - dia: 1
      titulo: ""
      formato: ""
      hook: ""
      gatilho: ""
      canal: ""
```

---

### Semana 1 (S-1): PROMESSA — FOMO

**Objetivo:** Criar urgencia maxima e FOMO

| Dia | Conteudo | Formato | Gatilho | Canal |
|-----|----------|---------|---------|-------|
| S-1 D1 | | | Countdown | |
| S-1 D2 | | | Social proof | |
| S-1 D3 | | | Escassez | |
| S-1 D4 | | | Urgencia | |
| S-1 D5 | | | FOMO | |
| S-1 D6 | | | Final push | |
| S-1 D7 | | | D-Day | |

**Temas S-1:**
- Countdown diario
- Numeros de registros
- Depoimentos de antecipacao
- "Ultimas vagas"
- "Amanha fazemos historia"

```yaml
semana_1_promessa:
  tema: "PROMESSA - FOMO"
  objetivo: "Criar urgencia maxima"
  conteudos:
    - dia: 1
      titulo: ""
      formato: ""
      hook: ""
      gatilho: ""
      canal: ""
```

---

## Phase 3: The 7-7-7 Rule (Omnipresence)

### Framework

```
7 pontos de contato x 7 dias x 7 plataformas
```

### Plataformas

| # | Plataforma | Formato Principal | Frequencia |
|---|------------|-------------------|------------|
| 1 | Email | Texto + CTA | Diario |
| 2 | SMS | Curto + Link | 3x semana |
| 3 | WhatsApp | Pessoal + Audio | 2x semana |
| 4 | Instagram | Stories + Reels | Diario |
| 5 | YouTube | Videos | 2x semana |
| 6 | Paid Ads | Retargeting | Continuo |
| 7 | Influencers | Collabs | Strategic |

### Content Repurposing Matrix

| Conteudo Original | Email | Social | Video | Ad |
|-------------------|-------|--------|-------|-----|
| Historia pessoal | ✓ | ✓ | ✓ | ✓ |
| Teaser | ✓ | ✓ | ✓ | ✓ |
| Countdown | ✓ | ✓ | | ✓ |

```yaml
omnipresence_7_7_7:
  plataformas:
    - nome: "Email"
      formato: ""
      frequencia: ""
      responsavel: ""
    - nome: "SMS"
      formato: ""
      frequencia: ""
      responsavel: ""

  repurposing:
    - conteudo_original: ""
      email: true
      social: true
      video: false
      ad: true
```

---

## Phase 4: Email Sequences

### Pre-Event Sequence

| Timing | Subject Line | Conteudo | CTA |
|--------|--------------|----------|-----|
| D-7 | "1 semana para o maior lancamento" | | |
| D-5 | | | |
| D-3 | "Revelando os guest speakers" | | |
| D-2 | | | |
| D-1 | "Amanha fazemos historia" | | |
| D-Day AM | "Comecamos em 2 horas" | | |

### During Event

| Timing | Subject Line | Conteudo | CTA |
|--------|--------------|----------|-----|
| H+1 | "30K pessoas assistindo agora" | | |
| H+2 | "Oferta revelada - link aqui" | | |
| H+3 | "Ultima hora para bonus" | | |

### Post-Event (Cart Close)

| Timing | Subject Line | Conteudo | CTA |
|--------|--------------|----------|-----|
| D+1 | "Replay disponivel por 48h" | | |
| D+2 | "Cart fecha amanha meia-noite" | | |
| D+3 AM | "Ultimas 12 horas" | | |
| D+3 PM | "FECHANDO EM 1 HORA" | | |

```yaml
email_sequences:
  pre_event:
    - timing: "D-7"
      subject: ""
      conteudo_resumo: ""
      cta: ""

  during_event:
    - timing: "H+1"
      subject: ""
      cta: ""

  post_event:
    - timing: "D+1"
      subject: ""
      cta: ""
```

---

## Output: Complete Narrative Plan

```yaml
narrative_plan:
  overview:
    product: ""
    launch_date: ""
    narrative_theme: ""

  origin_story:
    problema: ""
    jornada: ""
    revelacao: ""

  content_calendar:
    s3_problema: []
    s2_possibilidade: []
    s1_promessa: []

  omnipresence:
    plataformas: []
    repurposing_matrix: {}

  email_sequences:
    pre_event: []
    during: []
    post_event: []

  assets_needed:
    videos: []
    graphics: []
    copy: []
```

---

## Quality Gate

```yaml
narrative_quality:
  - [ ] Origin story completa (problema, jornada, revelacao)
  - [ ] 3 semanas de conteudo mapeadas (21 pecas)
  - [ ] 7 plataformas cobertas
  - [ ] Email sequences escritas (pre, durante, pos)
  - [ ] Gatilhos psicologicos identificados por peca
  - [ ] Repurposing matrix definida
  - [ ] Assets necessarios listados
```

## Handoff

After completion:
- → `hormozi-hooks` para criar hooks de cada peca
- → `hormozi-copy` para escrever emails
- → Content team para producao
- → `create-launch-timeline.md` para integrar datas

---
*Task: HZ_LAUNCH_007 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - Tensao Narrativa*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
