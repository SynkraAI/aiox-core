# create-contingency-plan

## Metadata
```yaml
task_id: HZ_LAUNCH_005
agent: hormozi-launch
type: risk-management
complexity: medium
estimated_time: 30-45min
source: "$100M Launch Playbook - Contingency Matrix"
```

## Purpose

Create a complete contingency matrix for launch day — every possible problem mapped to immediate actions, responsible parties, and escalation paths.

> "Tudo pode dar errado. A diferenca e se voce tem um plano de resposta pronto em 30 segundos ou entra em panico por 30 minutos." — Alex Hormozi

---

## Input Required

```yaml
contingency_context:
  launch_type: ""  # digital, fisico, hibrido
  revenue_target: ""
  critical_systems: []  # Site, pagamento, streaming, etc
  team_leads: []  # Nomes e contatos
```

---

## Contingency Matrix

### Critical Problems (Impacto ALTO)

| Problema | Probabilidade | Impacto | Acao Imediata | Responsavel | Escalacao |
|----------|--------------|---------|---------------|-------------|-----------|
| Site down | Baixa | CRITICO | Failover para backup | Tech Lead | CEO em 5min |
| Payment fail | Media | ALTO | Ativar gateway backup | Tech + Finance | CFO em 15min |
| Ad account ban | Media | ALTO | Switch para backup account | Marketing | CMO imediato |
| Streaming fail | Baixa | CRITICO | Switch para Zoom backup | Tech | CEO em 2min |
| PR crisis | Baixa | ALTO | Holding statement | PR + Legal | CEO imediato |

### Operational Problems (Impacto MEDIO)

| Problema | Probabilidade | Impacto | Acao Imediata | Responsavel | Escalacao |
|----------|--------------|---------|---------------|-------------|-----------|
| Low conversion | Alta | MEDIO | Ajustar copy/oferta | Revenue + Product | CMO em 30min |
| Supply shortage | Baixa | MEDIO | Comunicar + compensar | Ops + CS | COO em 1h |
| High support volume | Alta | MEDIO | Ativar overflow team | Support Lead | COO em 30min |
| Speaker no-show | Baixa | MEDIO | Backup speaker ready | Event Lead | Project Owner |
| Email deliverability | Media | MEDIO | Switch to backup domain | Marketing | CMO em 1h |

```yaml
contingency_matrix:
  critical:
    - problema: "Site down"
      probabilidade: "Baixa"
      impacto: "CRITICO"
      acao_imediata: "Failover para servidor backup"
      responsavel: ""
      escalacao: "CEO em 5min"
      plano_b: ""
      plano_c: ""

    - problema: "Payment gateway fail"
      probabilidade: "Media"
      impacto: "ALTO"
      acao_imediata: "Ativar gateway backup"
      responsavel: ""
      escalacao: "CFO em 15min"

  operational:
    - problema: "Low conversion"
      probabilidade: "Alta"
      impacto: "MEDIO"
      acao_imediata: ""
      responsavel: ""
      escalacao: ""
```

---

## Escalation Protocol

### 4 Niveis de Escalacao

```
NIVEL 1 (Operacional):
Problema → Team Lead → Solucao em 15min
Exemplos: Bug menor, duvida de cliente, delay pequeno

NIVEL 2 (Tatico):
Team Lead → Lider de Area → Solucao em 30min
Exemplos: Sistema lento, fila grande, reclamacao recorrente

NIVEL 3 (Estrategico):
Lider de Area → Project Owner → Solucao em 1h
Exemplos: Conversao abaixo do esperado, problema de inventory

NIVEL 4 (Critico):
Project Owner → CEO/Board → Decisao imediata
Exemplos: Site fora, pagamento offline, crise de PR
```

```yaml
escalation_protocol:
  nivel_1:
    nome: "Operacional"
    tempo_resolucao: "15min"
    quem_resolve: "Team Lead"
    exemplos: []

  nivel_2:
    nome: "Tatico"
    tempo_resolucao: "30min"
    quem_resolve: "Lider de Area"
    exemplos: []

  nivel_3:
    nome: "Estrategico"
    tempo_resolucao: "1h"
    quem_resolve: "Project Owner"
    exemplos: []

  nivel_4:
    nome: "Critico"
    tempo_resolucao: "Imediato"
    quem_resolve: "CEO"
    exemplos: []
```

---

## Tech Disaster Recovery

### Niveis de Resposta

| Nivel | Situacao | Acao | Tempo |
|-------|----------|------|-------|
| 1 | CDN lento | Ativar CDN alternativo | 30 seg |
| 2 | Servidor instavel | Migrar para backup | 2 min |
| 3 | Regiao down | Failover para outra regiao | 5 min |
| 4 | Processamento impossivel | Ativar fila manual | 10 min |
| 5 | Tudo offline | Pagina estatica emergencial | 1 min |

```yaml
tech_disaster_recovery:
  nivel_1:
    situacao: "CDN lento"
    acao: "Ativar CDN alternativo"
    tempo: "30 seg"
    comando: ""
    responsavel: ""

  nivel_2:
    situacao: "Servidor instavel"
    acao: "Migrar para servidor backup"
    tempo: "2 min"
    comando: ""
    responsavel: ""

  nivel_3:
    situacao: "Regiao down"
    acao: "Failover para outra regiao"
    tempo: "5 min"
    comando: ""
    responsavel: ""

  nivel_4:
    situacao: "Processamento impossivel"
    acao: "Ativar sistema de fila + processamento manual"
    tempo: "10 min"
    processo: ""
    responsavel: ""

  nivel_5:
    situacao: "Tudo offline"
    acao: "Deploy pagina estatica com formulario"
    tempo: "1 min"
    url_backup: ""
    responsavel: ""
```

---

## E-commerce Contingency

### Payment Fallback Chain

```
Gateway Principal (Stripe)
    ↓ FAIL
Gateway Backup (PayPal)
    ↓ FAIL
Link de pagamento manual
    ↓ FAIL
Telefone para processar manualmente
```

### Capacity Management

| Componente | Requisito | Meta | Maximo |
|------------|-----------|------|--------|
| Usuarios simultaneos | 50K | 100K | 200K |
| Transacoes/segundo | 200 | 500 | 1000 |
| Tempo de resposta | 3s | 1s | 5s |
| Uptime | 99% | 99.9% | 100% |
| Taxa de erro | 1% | 0.1% | 2% |

```yaml
ecommerce_contingency:
  payment_fallback:
    primary: ""
    backup_1: ""
    backup_2: ""
    manual: ""

  capacity_limits:
    usuarios_simultaneos:
      minimo: ""
      target: ""
      maximo: ""
    transacoes_segundo:
      minimo: ""
      target: ""
```

---

## Sales Team Contingency

### Call Center Overflow

| Situacao | Indicador | Acao |
|----------|-----------|------|
| Fila normal | <30 calls | Operacao normal |
| Fila alta | 30-50 calls | Ativar time backup |
| Fila critica | >50 calls | All hands + callback system |

### Low Conversion Response

| Conversao | Status | Acao |
|-----------|--------|------|
| >15% | Verde | Manter |
| 10-15% | Amarelo | Revisar script + aumentar supervisao |
| <10% | Vermelho | Reuniao emergencial + ajuste de oferta |

```yaml
sales_contingency:
  call_center:
    normal:
      indicador: "<30 calls em fila"
      acao: "Operacao normal"
    alta:
      indicador: "30-50 calls"
      acao: "Ativar time backup"
      time_backup: ""
    critica:
      indicador: ">50 calls"
      acao: "All hands + callback system"

  conversion_response:
    verde:
      threshold: ">15%"
      acao: "Manter"
    amarelo:
      threshold: "10-15%"
      acao: ""
    vermelho:
      threshold: "<10%"
      acao: ""
```

---

## Communication Templates

### Site Down (Externo)

```
Subject: Atualizacao importante

Estamos enfrentando um volume excepcional de acessos.
Nossa equipe esta trabalhando para normalizar.

Voce NAO perdeu sua vaga - todos os bonus serao honrados.

Atualizacoes em: [Twitter/Status page]

Obrigado pela paciencia,
[Equipe]
```

### Internal Crisis Alert

```
🚨 ALERTA [NIVEL X]: [Descricao do problema]

Situacao: [O que esta acontecendo]
Impacto: [Quem/o que esta afetado]
Acao: [O que estamos fazendo]
ETA: [Quando esperamos resolver]
Owner: [Quem esta liderando]

Proximo update em: [X minutos]
```

---

## Pre-Launch Testing Checklist

### War Games (7 dias antes)

| Cenario | Testado | Funcionou | Ajustes |
|---------|---------|-----------|---------|
| Site down | [ ] | [ ] | |
| Payment fail | [ ] | [ ] | |
| Ad account ban | [ ] | [ ] | |
| Streaming fail | [ ] | [ ] | |
| Low conversion | [ ] | [ ] | |
| High support volume | [ ] | [ ] | |

```yaml
war_games:
  data_execucao: ""
  participantes: []
  cenarios_testados:
    - cenario: "Site down"
      testado: false
      funcionou: false
      ajustes: ""
```

---

## Output: Complete Contingency Plan

```yaml
contingency_plan:
  overview:
    launch: ""
    d_day: ""
    last_updated: ""

  matrix:
    critical: []
    operational: []

  escalation:
    niveis: []
    contatos: []

  tech_recovery:
    niveis: []

  ecommerce:
    payment_fallback: []
    capacity: {}

  sales:
    overflow: {}
    conversion_response: {}

  templates:
    external: []
    internal: []

  testing:
    war_games_date: ""
    cenarios_passed: ""

  status: ""  # ready, needs_testing, incomplete
```

---

## Quality Gate

```yaml
contingency_quality:
  - [ ] Todos problemas criticos mapeados
  - [ ] Responsavel definido para cada problema
  - [ ] Escalation path claro (4 niveis)
  - [ ] Tech disaster recovery testado
  - [ ] Payment fallback chain configurada
  - [ ] Templates de comunicacao prontos
  - [ ] War games executados
  - [ ] Contatos de emergencia atualizados
```

## Handoff

After completion:
- → Tech team para testar disaster recovery
- → `setup-war-room.md` para integrar com operacoes
- → Team leads para treinamento de cenarios

---
*Task: HZ_LAUNCH_005 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - Contingency Matrix*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
