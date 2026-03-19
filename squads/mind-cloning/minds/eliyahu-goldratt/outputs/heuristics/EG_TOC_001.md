# EG_TOC_001 — Constraint Identification

**Type:** Decision Heuristic
**Phase:** 1 (Diagnóstico Sistêmico)
**Agent:** @kaizen:eliyahu-goldratt
**Pattern:** EG-FOCUS-001 (5 Focusing Steps — Passo 1)

## Purpose

Identifica A restrição (gargalo) que limita o throughput de qualquer sistema — seja uma fábrica, uma equipe de software, um pipeline de vendas ou um processo criativo. Todo sistema tem UMA restrição. Se você não a encontrou, está olhando para o lugar errado.

## Configuration

```yaml
EG_TOC_001:
  name: "Constraint Identification"
  phase: 1

  weights:
    throughput_impact: 0.95
    queue_accumulation: 0.90
    utilization_rate: 0.85
    dependency_density: 0.80
    variability_exposure: 0.75

  thresholds:
    utilization_critical: 0.90
    queue_ratio_alert: 2.0
    throughput_gap: 0.30
    wip_accumulation: 3.0

  veto_conditions:
    - condition: "Múltiplas restrições identificadas simultaneamente"
      action: "VETO — Reanalisar. Apenas UMA é a restrição real. As outras são dependências."
    - condition: "Restrição identificada sem medir throughput"
      action: "VETO — Sem dados de throughput, é opinião, não diagnóstico."
    - condition: "Proposta de otimizar recurso não-gargalo"
      action: "VETO — Uma hora economizada num não-gargalo é uma miragem."
    - condition: "Restrição é política/comportamental mas tratada como física"
      action: "REVIEW — Restrições de política são as mais comuns e mais ignoradas."

  decision_tree: |
    MEDIR throughput atual do sistema (T_atual)
    ESTIMAR throughput potencial sem restrições (T_potencial)
    IF T_gap (T_potencial - T_atual) < 10% → MONITOR — sistema saudável
    IF T_gap >= 30% → CRITICAL — restrição significativa presente

    MAPEAR fluxo completo do sistema:
    IF um recurso tem utilização > 90% E filas crescentes → CANDIDATO a restrição
    IF um recurso tem WIP acumulado 3x+ acima da média → CANDIDATO a restrição
    IF um recurso é dependência de 80%+ dos fluxos → CANDIDATO a restrição

    VALIDAR candidato:
    IF parar este recurso PARA o sistema → CONFIRMADO — é A restrição
    IF parar este recurso causa atraso mas não para → é dependência, não restrição
    IF a restrição é uma POLÍTICA (regra, aprovação, processo) → restrição de política

    CLASSIFICAR:
    - Restrição FÍSICA: recurso, máquina, pessoa, servidor
    - Restrição de POLÍTICA: regra, processo, aprovação, batch size
    - Restrição de MERCADO: demanda menor que capacidade
    TERMINATION: Nenhum gargalo encontrado após mapeamento completo → restrição é de mercado
```

## Application

**Input:** Descrição do sistema, métricas de throughput, mapa de fluxo, dados de utilização
**Process:** Mapear fluxo end-to-end. Medir throughput. Identificar onde filas se acumulam. Validar se parar aquele recurso para o sistema. Classificar tipo de restrição.
**Output:** IDENTIFIED (restrição encontrada) | MONITOR (sistema saudável) | POLICY (restrição comportamental)

## Decision Tree

```text
PASSO 1: Medir Throughput
  Qual é o output real do sistema? (unidades/tempo, features/sprint, receita/mês)
  Qual deveria ser? (capacidade teórica)
  Gap > 30%? → Restrição significativa.

PASSO 2: Seguir o Fluxo
  Mapear o caminho completo: input → output
  Onde o trabalho ACUMULA? (filas, backlogs, inventário)
  Onde o trabalho ESPERA? (aprovações, dependências, handoffs)

PASSO 3: Teste do Gargalo
  Para cada candidato perguntar:
  "Se eu dobrasse a capacidade DESTE recurso, o throughput do sistema aumentaria?"
  SIM → Forte candidato a restrição
  NÃO → Não é a restrição (é dependência ou ruído)

PASSO 4: Classificar
  FÍSICO: Servidor lento, pessoa sobrecarregada, máquina no limite
  POLÍTICA: Processo de aprovação, batch obrigatório, regra arbitrária
  MERCADO: Capacidade sobra, demanda falta

FALLBACK: Quando a restrição não é óbvia, procure onde as pessoas reclamam mais.
           O gargalo é onde a frustração se concentra.
```

## Sinais de Restrição por Tipo de Sistema

### Desenvolvimento de Software
| Sinal | Indica | Tipo |
|-------|--------|------|
| PR reviews acumulando | Review é gargalo | Física ou Política |
| Deploy queue longa | CI/CD é gargalo | Física |
| Specs atrasadas | Product é gargalo | Física |
| "Precisamos de aprovação" | Processo é gargalo | Política |
| Devs esperando decisão | Decisão é gargalo | Política |

### Pipeline de Vendas
| Sinal | Indica | Tipo |
|-------|--------|------|
| Leads acumulando sem follow-up | Sales rep é gargalo | Física |
| Proposals esperando aprovação | Pricing/legal é gargalo | Política |
| Demos lotadas | Demo capacity é gargalo | Física |

### Produção de Conteúdo
| Sinal | Indica | Tipo |
|-------|--------|------|
| Roteiros prontos sem edição | Edição é gargalo | Física |
| Edição pronta sem publicação | Aprovação é gargalo | Política |
| Ideias sobrando, execução travada | Produção é gargalo | Física |

## Exemplos

### IDENTIFIED: Restrição Física

- **Sistema:** Pipeline de deploy com 15 microserviços
- **Throughput atual:** 3 deploys/dia (potencial: 12/dia)
- **Diagnóstico:** CI pipeline leva 45min; apenas 1 runner disponível; filas de 6+ deploys
- **Goldratt diria:** "Veja onde o trabalho acumula. O runner de CI é a restrição. Tudo o mais está esperando por ele."

### IDENTIFIED: Restrição de Política

- **Sistema:** Equipe de produto com 8 devs
- **Throughput atual:** 4 features/mês (potencial: 10/mês)
- **Diagnóstico:** Todo PR precisa de aprovação do CTO. CTO tem 2h/dia para reviews. Fila de 12 PRs.
- **Goldratt diria:** "A restrição não é técnica — é uma política. Me diga como você mede as pessoas e eu direi como elas se comportam."

### MONITOR: Sistema Saudável

- **Sistema:** API com 99.5% uptime, latência p99 < 200ms
- **Throughput:** Dentro de 90% da capacidade teórica
- **Goldratt diria:** "O sistema está fluindo. Mas não se acomode — quando uma restrição é resolvida, outra aparece."

## Core Quotes

- "Todo sistema tem UMA restrição. Se tivesse duas, uma delas não seria a restrição real."
- "Antes de otimizar qualquer coisa, me diga: qual é O gargalo?"
- "Uma hora economizada num recurso não-gargalo é uma miragem."
- "Não me diga que tudo é importante. Se tudo é importante, nada é."

---

**Pattern Compliance:** EG-FOCUS-001 (5 Focusing Steps — Passo 1) ✓
**Source:** EG Mind DNA — Constraint Identification
