# EG_DBR_001 — Drum-Buffer-Rope Assessment

**Type:** Decision Heuristic
**Phase:** 2 (Scheduling e Throughput)
**Agent:** @kaizen:eliyahu-goldratt
**Pattern:** EG-DBR-001 (Drum-Buffer-Rope)

## Purpose

Avalia e implementa o sistema Drum-Buffer-Rope (DBR) para controle de fluxo e scheduling. O Drum (gargalo) dita o ritmo. O Buffer (tempo de proteção) absorve variabilidade. A Rope (sinal) controla a liberação de trabalho novo. Nunca libere trabalho mais rápido do que o gargalo pode processar.

## Configuration

```yaml
EG_DBR_001:
  name: "Drum-Buffer-Rope Assessment"
  phase: 2

  weights:
    drum_identification: 0.95
    buffer_sizing: 0.85
    rope_mechanism: 0.80
    wip_control: 0.90
    flow_stability: 0.85

  thresholds:
    buffer_consumption_warning: 0.66
    buffer_consumption_critical: 0.90
    wip_limit_ratio: 1.5
    rope_delay_max: 0.20
    drum_utilization_target: 0.95

  veto_conditions:
    - condition: "Trabalho novo liberado sem verificar capacidade do gargalo"
      action: "VETO — Rope desconectada. Liberar trabalho sem rope gera inventário, não throughput."
    - condition: "Buffer inexistente antes do gargalo"
      action: "VETO — Gargalo desprotegido. Qualquer variabilidade upstream para o sistema."
    - condition: "Múltiplos drums configurados"
      action: "VETO — Só existe UM drum. Reavalie qual recurso é a restrição real."
    - condition: "WIP crescendo apesar do sistema DBR implantado"
      action: "REVIEW — Rope está frouxa ou drum mudou de posição."

  decision_tree: |
    PASSO 1 — Identificar o Drum:
    IF restrição já identificada (EG_TOC_001) → usar como drum
    IF restrição não identificada → BLOQUEAR — rodar EG_TOC_001 primeiro

    PASSO 2 — Dimensionar o Buffer:
    IF variabilidade upstream é alta → buffer = 50% do lead time total
    IF variabilidade upstream é moderada → buffer = 33% do lead time total
    IF variabilidade upstream é baixa → buffer = 20% do lead time total
    IF buffer consumption > 66% frequentemente → ALERT — aumentar buffer
    IF buffer consumption > 90% → CRITICAL — gargalo em risco de inanição

    PASSO 3 — Configurar a Rope:
    IF sistema push (trabalho liberado por demanda) → converter para pull via rope
    IF WIP > 1.5x capacidade do drum → REDUZIR liberação imediatamente
    IF WIP estável e drum nunca fica ocioso → APPROVE — rope calibrada

    PASSO 4 — Monitorar Buffer:
    GREEN zone (0-33% consumo): fluxo saudável
    YELLOW zone (33-66% consumo): atenção — priorizar reposição
    RED zone (66-100% consumo): ação imediata — expediting necessário
    TERMINATION: Buffer consumido 100% → gargalo parou → throughput zero
```

## Application

**Input:** Restrição identificada (do EG_TOC_001), mapa de fluxo, dados de variabilidade, WIP atual
**Process:** Configurar drum (ritmo do gargalo), dimensionar buffer (proteção), implementar rope (controle de liberação). Monitorar buffer management.
**Output:** CONFIGURED (DBR implantado) | ALERT (buffer em risco) | VETO (pré-requisitos ausentes)

## Decision Tree

```text
DIAGNÓSTICO DBR:

1. O DRUM está identificado?
   SIM → Qual é o ritmo (unidades/tempo)?
   NÃO → PARE. Rode EG_TOC_001 primeiro.

2. O BUFFER está dimensionado?
   Medir variabilidade do sistema upstream:
   ALTA (atrasos frequentes, imprevisíveis) → Buffer = 50% do lead time
   MÉDIA (atrasos ocasionais, padrão known) → Buffer = 33% do lead time
   BAIXA (fluxo previsível, poucos desvios) → Buffer = 20% do lead time

3. A ROPE está funcionando?
   Verificar: trabalho novo entra apenas quando gargalo tem capacidade?
   SIM → Rope ativa. Verificar WIP.
   NÃO → Rope desconectada. WIP vai crescer indefinidamente.

4. BUFFER MANAGEMENT (monitoramento contínuo):
   Verde (0-33%): Nenhuma ação. Fluxo saudável.
   Amarelo (33-66%): Monitorar. Priorizar itens que alimentam o buffer.
   Vermelho (66-100%): Ação imediata. Expediting no upstream.
   Preto (100%): Emergência. Gargalo parou.

FALLBACK: Se o drum muda de posição (após elevação), recalibrar todo o DBR.
```

## DBR por Tipo de Sistema

### Desenvolvimento de Software
| Componente | Implementação |
|-----------|---------------|
| Drum | Sprint capacity do time de review (ou CI runner, ou deploy pipeline) |
| Buffer | Itens "ready for review" no backlog — sempre manter 2-3 prontos |
| Rope | WIP limit — não iniciar nova feature até que uma saia do drum |

### Produção de Conteúdo
| Componente | Implementação |
|-----------|---------------|
| Drum | Capacidade de edição/produção (recurso mais escasso) |
| Buffer | Roteiros aprovados aguardando produção — manter 3-5 prontos |
| Rope | Não comissionar novos roteiros até liberar capacidade de edição |

### Pipeline de Vendas
| Componente | Implementação |
|-----------|---------------|
| Drum | Capacidade de demos/calls do closer |
| Buffer | Leads qualificados prontos para demo — manter fila de 1 semana |
| Rope | Não gerar mais leads que a capacidade de demo pode absorver |

## Buffer Management Visual

```text
|████████████░░░░░░░░░░░░░░░░░░| 33% — VERDE
 Fluxo saudável. Sem ação.

|████████████████████░░░░░░░░░░| 66% — AMARELO
 Atenção. Priorizar reposição do buffer.

|████████████████████████████░░| 90% — VERMELHO
 Ação imediata. Expediting upstream.

|██████████████████████████████| 100% — PRETO
 Emergência. Gargalo parado. Throughput = zero.
```

## Exemplos

### CONFIGURED: DBR em Equipe de Software

- **Drum:** Code review (2 reviewers, capacidade de 6 PRs/dia)
- **Buffer:** Pool de PRs "ready for review" — target de 4 PRs (66% de capacidade diária)
- **Rope:** WIP limit de 3 por dev. Novo trabalho só entra quando PR é merged.
- **Goldratt diria:** "O drum está batendo. O buffer está protegendo. A rope está controlando. Agora monitorem o buffer — ele conta a história do sistema."

### ALERT: Buffer em Risco

- **Situação:** Buffer de PRs caiu para 1 (de target 4). Review está consumindo mais rápido que dev produz.
- **Diagnóstico:** Upstream (desenvolvimento) tem bloqueio. Specs incompletas atrasando devs.
- **Goldratt diria:** "O buffer está amarelo caminhando para vermelho. Não olhem para o gargalo — olhem para o que está antes dele. O que está impedindo o upstream de alimentar o buffer?"

### VETO: Rope Desconectada

- **Situação:** PM continua adicionando features ao sprint sem verificar capacidade de review.
- **WIP:** 18 itens em progresso (capacidade real: 8)
- **Goldratt diria:** "A rope está cortada. Vocês estão empurrando trabalho para dentro do sistema sem perguntar se o gargalo pode absorver. Inventário cresce, throughput cai, todo mundo se sente ocupado mas nada sai."

## Core Quotes

- "Nunca libere trabalho mais rápido do que o gargalo pode processar."
- "O buffer é seu sistema de alerta precoce. Ignore-o e você descobre o problema quando já é tarde."
- "Se todo mundo está ocupado, o sistema está doente. Ocupação não é produtividade."
- "Não balanceie capacidade — balanceie FLUXO."

---

**Pattern Compliance:** EG-DBR-001 (Drum-Buffer-Rope) ✓
**Source:** EG Mind DNA — Drum-Buffer-Rope Assessment
