# setup-war-room

## Metadata
```yaml
task_id: HZ_LAUNCH_004
agent: hormozi-launch
type: operations
complexity: high
estimated_time: 45-60min
source: "$100M Launch Playbook - War Room Operations"
```

## Purpose

Setup complete War Room operations for launch day — the command center that ensures flawless execution during the most critical 24-48 hours.

> "Clareza no papel, obsessao na execucao, resultado extraordinario." — Alex Hormozi

---

## Input Required

```yaml
war_room_context:
  d_day: ""
  venue: ""  # Fisico ou virtual
  team_size: ""
  expected_viewers: ""
  revenue_target: ""
```

---

## War Room Essentials (Kit de Guerra)

### 8 Documentos Criticos

| # | Documento | Descricao | Responsavel |
|---|-----------|-----------|-------------|
| 1 | WAR ROOM BIBLE | Documento unico com tudo | |
| 2 | CONTACT MATRIX | Telefones, WhatsApp, responsabilidades | |
| 3 | DYNAMIC FAQ | Atualizado em tempo real | |
| 4 | SCRIPTS BOOK | Todos os scripts por situacao | |
| 5 | EMERGENCY PROCEDURES | Passo a passo para cada crise | |
| 6 | VENDOR CONTACTS | Fornecedores com SLAs | |
| 7 | LEGAL CLEARANCES | Aprovacoes e disclaimers | |
| 8 | BACKUP PLANS | Plano B para cada sistema | |

```yaml
war_room_docs:
  bible:
    status: ""
    owner: ""
    location: ""
  contact_matrix:
    status: ""
    owner: ""
  dynamic_faq:
    status: ""
    owner: ""
    update_frequency: ""
  scripts_book:
    status: ""
    owner: ""
  emergency_procedures:
    status: ""
    owner: ""
  vendor_contacts:
    status: ""
    owner: ""
  legal_clearances:
    status: ""
    owner: ""
  backup_plans:
    status: ""
    owner: ""
```

---

## Communication Hierarchy

### Response Time by Urgency

| Nivel | Tipo | Canais | Tempo Resposta |
|-------|------|--------|----------------|
| CRITICO | Urgente | Ligacao → WhatsApp Guerra | < 1 min |
| URGENTE | Importante | Slack #emergency → SMS | < 15 min |
| IMPORTANTE | Normal | Slack canal do time → Email | < 1 hora |
| REGULAR | Baixo | Sistema gestao → Doc | < 4 horas |

```yaml
communication_hierarchy:
  critico:
    canais: ["Ligacao direta", "WhatsApp grupo guerra"]
    tempo_resposta: "< 1 min"
    quem_escala: ""
  urgente:
    canais: ["Slack #emergency", "SMS"]
    tempo_resposta: "< 15 min"
  importante:
    canais: ["Slack time", "Email"]
    tempo_resposta: "< 1 hora"
  regular:
    canais: ["Sistema gestao"]
    tempo_resposta: "< 4 horas"
```

---

## Meeting Cadence

### Pre-Lancamento

| Reuniao | Frequencia | Participantes | Duracao | Output |
|---------|-----------|---------------|---------|--------|
| SteerCo | Semanal | C-level + PO | 30min | Decisoes estrategicas |
| War Room | Diario (S-1) | Lideres | 15min | Status + blockers |
| Deep Dive | 2x/semana | Por area | 60min | Problemas especificos |
| All Hands | Semanal | Todos | 30min | Alinhamento geral |

### Durante Lancamento (D-Day)

| Horario | Reuniao | Duracao | Participantes |
|---------|---------|---------|---------------|
| 06:00 | Pre-flight check | 30min | Core team |
| 09:00 | Go-live briefing | 15min | Todos |
| 12:00 | Status update | 10min | Lideres |
| 15:00 | Numeros parciais | 10min | Lideres |
| 18:00 | Ajustes evening | 15min | Core |
| 21:00 | Wrap-up do dia | 30min | Core |
| 00:00 | Overnight briefing | 15min | Night shift |

```yaml
meeting_cadence:
  pre_lancamento:
    steerco:
      frequencia: "Semanal"
      participantes: []
      duracao: "30min"
    war_room_daily:
      frequencia: "Diario (S-1)"
      participantes: []
      duracao: "15min"

  dia_d:
    - horario: "06:00"
      reuniao: "Pre-flight check"
      duracao: "30min"
      participantes: []
```

---

## Command Center Dashboard

### Metricas em Tempo Real

| Metrica | Atualizacao | Target | Alerta |
|---------|-------------|--------|--------|
| Registros | Real-time | | <90% esperado/hora |
| Conversao | 5 min | >1% | <0.5% |
| Faturamento | 1 min | $X/min | <$Y/min |
| Tickets/Support | Real-time | <50 fila | >100 fila |
| Uptime | Real-time | 99.9% | <99% |
| Ad Spend | 15 min | Budget/hora | >110% budget |
| Refunds | 30 min | <2% | >3% |

```yaml
dashboard_metricas:
  - metrica: "Registros"
    atualizacao: "Real-time"
    target: ""
    alerta: ""
    responsavel: ""
  - metrica: "Conversao"
    atualizacao: "5 min"
    target: ">1%"
    alerta: "<0.5%"
    responsavel: ""
  - metrica: "Faturamento"
    atualizacao: "1 min"
    target: ""
    alerta: ""
    responsavel: ""
  - metrica: "Uptime"
    atualizacao: "Real-time"
    target: "99.9%"
    alerta: "<99%"
    responsavel: ""
```

---

## Physical Setup (Se Presencial)

### Divisao de Areas

| Area | Tamanho | Funcao | Capacidade |
|------|---------|--------|------------|
| Palco Principal | 200m2 | Apresentacao | Equipe tecnica |
| Green Room | 50m2 | Palestrantes | 6 speakers |
| Sala de Guerra | 40m2 | Comando | 15 pessoas |
| Areas de Apoio | 100m2 | Copa, descanso | 50 pessoas |
| Area Tecnica | 60m2 | Servidores, IT | 10 pessoas |

### Alimentacao

| Horario | Servico | Pessoas |
|---------|---------|---------|
| 06:00 | Cafe da manha | 50 |
| 09:00 | Coffee break continuo | 100 |
| 12:00 | Almoco completo | 150 |
| 15:00 | Lanche da tarde | 100 |
| 18:00 | Jantar | 100 |
| 21:00 | Pizza celebracao | 75 |

```yaml
physical_setup:
  venue: ""
  areas:
    palco:
      tamanho: ""
      capacidade: ""
    green_room:
      tamanho: ""
      capacidade: ""
    war_room:
      tamanho: ""
      capacidade: ""

  alimentacao:
    - horario: ""
      servico: ""
      pessoas: ""
```

---

## Os 10 Papeis Criticos

### Estrutura Organizacional

```
            DONO DO PROJETO
                  |
    ______________|______________
    |                            |
[EXECUCAO]                  [SUPORTE]
    |                            |
Lider de Vendas          Lider de Suporte
Dono do E-commerce       Montagem Estudio
Gerente de Midia         Facilities
Gerente de Marketing     Infraestrutura Tech
Gerente de Logistica
```

### Checklist de Papeis

| Papel | Nome | Contratado | Treinado | Certificado |
|-------|------|------------|----------|-------------|
| 1. Dono do Projeto | | [ ] | [ ] | [ ] |
| 2. Lider de Vendas | | [ ] | [ ] | [ ] |
| 3. Dono do E-commerce | | [ ] | [ ] | [ ] |
| 4. Gerente de Midia | | [ ] | [ ] | [ ] |
| 5. Gerente de Marketing | | [ ] | [ ] | [ ] |
| 6. Gerente de Logistica | | [ ] | [ ] | [ ] |
| 7. Lider de Suporte | | [ ] | [ ] | [ ] |
| 8. Montagem Estudio | | [ ] | [ ] | [ ] |
| 9. Facilities | | [ ] | [ ] | [ ] |
| 10. Infraestrutura Tech | | [ ] | [ ] | [ ] |

```yaml
papeis_criticos:
  - papel: "Dono do Projeto"
    nome: ""
    status: ""
    kpis:
      - metrica: "Receita do Lancamento"
        target: ""
        alerta: ""

  - papel: "Lider de Vendas"
    nome: ""
    status: ""
    kpis:
      - metrica: "Conversao"
        target: ">15%"
```

---

## Culture Code (Regras do War Room)

```
1. RESULTADO > EGO
   Decisoes pelo lancamento, nao por politica

2. TRANSPARENCIA RADICAL
   Problemas na mesa, solucoes em conjunto

3. VELOCIDADE > PERFEICAO
   70% pronto hoje > 100% amanha

4. OWNERSHIP TOTAL
   Seu problema = Meu problema

5. ENERGIA INFINITA
   Cansaco e temporario, resultado e forever

6. CELEBRATE SMALL WINS
   Cada vitoria importa e energiza

7. FAIL FAST, LEARN FASTER
   Erro nao e problema, nao aprender e
```

---

## Output: War Room Setup Complete

```yaml
war_room_setup:
  overview:
    d_day: ""
    venue: ""
    team_total: ""

  documentos:
    bible: ""
    contact_matrix: ""
    faq: ""
    scripts: ""
    emergency: ""
    vendors: ""
    legal: ""
    backups: ""

  comunicacao:
    hierarquia: []
    canais: []

  dashboard:
    metricas: []
    tools: []

  papeis:
    preenchidos: ""
    treinados: ""

  fisico:
    areas: []
    alimentacao: []

  status: ""  # ready, partial, not_ready
```

---

## Quality Gate

```yaml
war_room_quality:
  - [ ] 8 documentos criticos prontos
  - [ ] Contact matrix completo com todos telefones
  - [ ] Dashboard configurado com todas metricas
  - [ ] 10 papeis preenchidos e treinados
  - [ ] Hierarquia de comunicacao clara
  - [ ] Cadencia de reunioes definida
  - [ ] Areas fisicas/virtuais configuradas
  - [ ] Culture code comunicado ao time
```

## Handoff

After completion:
- → `create-contingency-plan.md` para matriz de riscos
- → Team leads para treinamento especifico
- → Tech team para setup de dashboard

---
*Task: HZ_LAUNCH_004 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - War Room Operations*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
