# run-launch-post-mortem

## Metadata
```yaml
task_id: HZ_LAUNCH_006
agent: hormozi-launch
type: analysis
complexity: medium
estimated_time: 60-90min (facilitacao)
source: "$100M Launch Playbook - Post-Mortem Framework"
```

## Purpose

Conduct a structured post-mortem analysis after launch — extracting learnings, documenting what worked, and creating SOPs for future launches.

> "Um lancamento sem post-mortem e uma oportunidade de aprendizado desperdicada." — Alex Hormozi

---

## When to Run

- **Timing:** D+7 a D+14 (1-2 semanas apos fechamento do cart)
- **Duracao Total:** 6 horas (4 sessoes)
- **Participantes:** Todos os lideres de area + representantes de cada time

---

## Input Required

```yaml
post_mortem_context:
  launch_name: ""
  d_day: ""
  revenue_achieved: ""
  revenue_target: ""
  registros_achieved: ""
  registros_target: ""
  conversion_rate: ""
  total_spend: ""
```

---

## The 4-Session Framework

### SESSAO 1: NUMEROS (2 horas)

**Objetivo:** Analisar todos os dados quantitativos do lancamento

#### Revenue Analysis

| Metrica | Target | Achieved | % | Status |
|---------|--------|----------|---|--------|
| Revenue Total | | | | |
| Ticket Medio | | | | |
| Unidades Vendidas | | | | |
| Upsell Revenue | | | | |
| Refund Rate | | | | |

#### Funnel Analysis

| Estagio | Volume | Conversao | Benchmark |
|---------|--------|-----------|-----------|
| Impressoes | | | |
| Cliques | | | |
| Registros | | | |
| Show-up | | | |
| Engajamento | | | |
| Vendas | | | |

#### Cost Analysis

| Categoria | Budget | Actual | Variacao |
|-----------|--------|--------|----------|
| Ads | | | |
| Equipe | | | |
| Tech | | | |
| Producao | | | |
| Afiliados | | | |
| **TOTAL** | | | |

#### Channel Performance

| Canal | Spend | Revenue | ROAS | CPL | CPA |
|-------|-------|---------|------|-----|-----|
| Facebook | | | | | |
| Google | | | | | |
| YouTube | | | | | |
| TikTok | | | | | |
| Afiliados | | | | | |
| Organico | | | | | |

#### Unit Economics

```yaml
unit_economics:
  cac: ""  # Custo de aquisicao
  ltv: ""  # Lifetime value (projetado)
  ltv_cac_ratio: ""  # Meta: >= 3:1
  payback_period: ""  # Em meses
  gross_margin: ""
```

```yaml
sessao_1_numeros:
  data: ""
  duracao: "2h"
  participantes: []

  revenue:
    target: ""
    achieved: ""
    variacao: ""

  funnel:
    registros: ""
    show_up: ""
    conversao: ""

  costs:
    budget: ""
    actual: ""
    variacao: ""

  channels: []

  unit_economics:
    cac: ""
    ltv: ""
    ratio: ""

  conclusoes: []
```

---

### SESSAO 2: QUALITATIVO (2 horas)

**Objetivo:** Capturar insights nao-quantificaveis

#### O Que Funcionou (Keep)

| Area | O que funcionou | Por que funcionou | Replicar? |
|------|-----------------|-------------------|-----------|
| Ads | | | |
| Copy | | | |
| Oferta | | | |
| Evento | | | |
| Vendas | | | |
| Tech | | | |
| Suporte | | | |

#### O Que NAO Funcionou (Stop)

| Area | O que nao funcionou | Por que nao funcionou | Alternativa |
|------|--------------------|-----------------------|-------------|
| | | | |

#### O Que Fariamos Diferente (Change)

| Area | Situacao Original | O que mudariamos | Impacto esperado |
|------|-------------------|------------------|------------------|
| | | | |

#### Surpresas (Learn)

| Tipo | Surpresa | Implicacao | Acao |
|------|----------|------------|------|
| Positiva | | | |
| Negativa | | | |

```yaml
sessao_2_qualitativo:
  data: ""
  duracao: "2h"
  participantes: []

  keep:
    - area: ""
      insight: ""
      razao: ""
      replicar: true

  stop:
    - area: ""
      problema: ""
      razao: ""
      alternativa: ""

  change:
    - area: ""
      original: ""
      mudanca: ""
      impacto: ""

  surpresas:
    positivas: []
    negativas: []
```

---

### SESSAO 3: PESSOAS (1 hora)

**Objetivo:** Avaliar performance do time e identificar gaps

#### MVPs do Lancamento

| Nome | Area | Contribuicao | Reconhecimento |
|------|------|--------------|----------------|
| | | | |

#### Gaps de Competencia

| Area | Gap Identificado | Impacto | Solucao |
|------|------------------|---------|---------|
| | | | |

#### Necessidades de Treinamento

| Area | Treinamento Necessario | Prioridade | Responsavel |
|------|------------------------|------------|-------------|
| | | | |

#### Mudancas Organizacionais

| Tipo | Descricao | Justificativa | Timeline |
|------|-----------|---------------|----------|
| Contratacao | | | |
| Promocao | | | |
| Reestruturacao | | | |

```yaml
sessao_3_pessoas:
  data: ""
  duracao: "1h"
  participantes: []

  mvps:
    - nome: ""
      area: ""
      contribuicao: ""
      reconhecimento: ""

  gaps:
    - area: ""
      gap: ""
      solucao: ""

  treinamentos:
    - area: ""
      necessidade: ""
      prioridade: ""

  mudancas_org:
    contratacoes: []
    promocoes: []
    outras: []
```

---

### SESSAO 4: PROXIMOS PASSOS (1 hora)

**Objetivo:** Definir acoes concretas e preparar proximo lancamento

#### Quick Wins (Implementar em <7 dias)

| Acao | Owner | Deadline | Status |
|------|-------|----------|--------|
| | | | |

#### Mudancas Estruturais (Implementar em <30 dias)

| Mudanca | Owner | Recursos | Deadline |
|---------|-------|----------|----------|
| | | | |

#### SOPs a Criar/Atualizar

| SOP | Descricao | Owner | Deadline |
|-----|-----------|-------|----------|
| | | | |

#### Roadmap Proximo Lancamento

| Fase | Descricao | Data Estimada |
|------|-----------|---------------|
| Ideacao | | |
| Preparacao | | |
| Execucao | | |
| D-Day | | |

```yaml
sessao_4_proximos_passos:
  data: ""
  duracao: "1h"
  participantes: []

  quick_wins:
    - acao: ""
      owner: ""
      deadline: ""

  mudancas_estruturais:
    - mudanca: ""
      owner: ""
      recursos: ""
      deadline: ""

  sops:
    - sop: ""
      descricao: ""
      owner: ""

  proximo_lancamento:
    data_estimada: ""
    fases: []
```

---

## Post-Mortem Report Template

```markdown
# Post-Mortem Report: [Nome do Lancamento]

**Data do Lancamento:** [D-Day]
**Data do Post-Mortem:** [Data]
**Facilitador:** [Nome]

## Executive Summary
[2-3 paragrafos resumindo resultados e principais learnings]

## Resultados vs Targets

| Metrica | Target | Achieved | Status |
|---------|--------|----------|--------|
| Revenue | | | |
| Registros | | | |
| Conversao | | | |
| ROAS | | | |

## Top 5 Wins
1. [Win]
2. [Win]
3. [Win]
4. [Win]
5. [Win]

## Top 5 Learnings
1. [Learning]
2. [Learning]
3. [Learning]
4. [Learning]
5. [Learning]

## Acoes Imediatas
- [ ] [Acao 1] - Owner: [Nome] - Deadline: [Data]
- [ ] [Acao 2] - Owner: [Nome] - Deadline: [Data]

## Proximo Lancamento
- Data estimada: [Data]
- Foco: [Descricao]
```

---

## Output: Complete Post-Mortem

```yaml
post_mortem_complete:
  launch:
    nome: ""
    d_day: ""
    post_mortem_date: ""

  resultados:
    revenue_target: ""
    revenue_achieved: ""
    roi: ""

  sessoes:
    numeros:
      status: ""
      conclusoes: []
    qualitativo:
      status: ""
      keep: []
      stop: []
      change: []
    pessoas:
      status: ""
      mvps: []
      gaps: []
    proximos_passos:
      status: ""
      quick_wins: []
      mudancas: []

  artifacts:
    report_url: ""
    sops_criados: []

  proximo_lancamento:
    data: ""
    foco: ""
```

---

## Quality Gate

```yaml
post_mortem_quality:
  - [ ] 4 sessoes completadas
  - [ ] Todos numeros documentados
  - [ ] Top 5 wins identificados
  - [ ] Top 5 learnings documentados
  - [ ] Quick wins com owners e deadlines
  - [ ] SOPs a criar listados
  - [ ] Report final gerado
  - [ ] Proximo lancamento escocado
```

## Handoff

After completion:
- → Leadership team para aprovar mudancas
- → Training team para gaps de competencia
- → Documentation team para criar SOPs
- → Planning team para proximo lancamento

---
*Task: HZ_LAUNCH_006 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - Post-Mortem Framework*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
