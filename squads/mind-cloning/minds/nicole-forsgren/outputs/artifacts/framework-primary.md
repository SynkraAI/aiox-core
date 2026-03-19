# Framework Primário: DORA Metrics + Accelerate

**Type:** Primary Operating Framework
**Agent:** @kaizen:nicole-forsgren
**Status:** 7+ anos de pesquisa, 36.000+ profissionais, adotado pelo Google Cloud e centenas de organizações

## Overview

O framework DORA (DevOps Research and Assessment) define 4 métricas-chave que medem software delivery performance e provou estatisticamente que alta performance nessas métricas correlaciona com resultados organizacionais superiores (lucratividade, market share, produtividade). O modelo de Capabilities identifica os drivers que melhoram essas métricas, substituindo "maturity models" estáticos por melhoria contínua.

## Framework 1: As 4 Métricas DORA

### Throughput (Velocidade)

```text
MÉTRICA 1: DEPLOYMENT FREQUENCY (DF)
  Pergunta: "Com que frequência vocês fazem deploy para produção?"
  O que mede: Cadência de entrega — proxy para batch size

  Bandas:
    Elite:  On-demand (múltiplos por dia)
    High:   Diário a semanal
    Medium: Semanal a mensal
    Low:    Mensal a semestral

  Por que importa:
    - Batches menores = menos risco por deploy
    - Feedback mais rápido do mercado
    - Ciclo de aprendizado mais curto
    - Correlação forte com org performance

  Capabilities que impactam:
    - Continuous delivery
    - Trunk-based development
    - Working in small batches
    - Loosely coupled architecture

MÉTRICA 2: LEAD TIME FOR CHANGES (LT)
  Pergunta: "Quanto tempo do commit até produção?"
  O que mede: Velocidade e eficiência do pipeline de entrega

  Bandas:
    Elite:  < 1 hora
    High:   1 dia a 1 semana
    Medium: 1 semana a 1 mês
    Low:    1 mês a 6 meses

  Por que importa:
    - Pipeline eficiente = menos espera, menos desperdício
    - Feedback rápido para devs
    - Menor inventory de work-in-progress

  Capabilities que impactam:
    - Continuous integration
    - Test automation
    - Streamlining change approval
    - Version control for all artifacts
```

### Stability (Confiabilidade)

```text
MÉTRICA 3: MEAN TIME TO RESTORE (MTTR)
  Pergunta: "Quanto tempo para restaurar serviço após incidente?"
  O que mede: Capacidade de resposta e resiliência

  Bandas:
    Elite:  < 1 hora
    High:   < 1 dia
    Medium: 1 dia a 1 semana
    Low:    > 6 meses

  Por que importa:
    - Falhas são inevitáveis — velocidade de recovery é o diferencial
    - MTTR baixo = observabilidade boa, times empoderados
    - Impacto direto na experiência do usuário

  Capabilities que impactam:
    - Monitoring and observability
    - Loosely coupled architecture
    - Test data management
    - Team experimentation (blameless culture)

MÉTRICA 4: CHANGE FAILURE RATE (CFR)
  Pergunta: "Qual % de deploys causa falha em produção?"
  O que mede: Qualidade do processo de entrega

  Bandas:
    Elite:  0-15%
    High:   16-30%
    Medium: 16-30%
    Low:    16-30%

  Por que importa:
    - Indica maturidade do processo de qualidade
    - CFR alto com DF alto = pipeline quebrado
    - CFR baixo = confiança para deployar mais

  Capabilities que impactam:
    - Test automation
    - Continuous integration
    - Shift left on security
    - Peer review process
```

## Framework 2: A Grande Descoberta — Não É Trade-off

### O Mito

```text
MITO: "Se deployarmos mais rápido, vamos ter mais bugs."
MITO: "Velocidade e estabilidade são trade-offs."
MITO: "Qualidade exige ir devagar."
```

### A Realidade (Dados de 7+ Anos)

```text
REALIDADE: Elite performers são MELHORES em TODAS as 4 métricas.

  Elite vs. Low performers:
    - Deploy 973x mais frequentemente
    - Lead time 6.570x mais rápido
    - MTTR 6.570x mais rápido
    - CFR 3x menor

  POR QUÊ não é trade-off:
    1. Deploys pequenos = menos risco por deploy
    2. Menos risco = menos falhas (CFR menor)
    3. CI/CD = feedback rápido = bugs detectados antes
    4. Observabilidade = recovery rápido (MTTR baixo)
    5. É um CICLO VIRTUOSO, não trade-off

  As mesmas capabilities (CI/CD, automação, small batches)
  melhoram AMBOS throughput e stability simultaneamente.
```

## Framework 3: Capabilities Model

### Por que Capabilities, Não Maturity

```text
MATURITY MODEL (problemas):
  - Implica destino fixo ("nível 5 = pronto")
  - Assume que todos devem seguir o mesmo caminho
  - Foca em processo, não em outcomes
  - Cria complacência ("já somos nível 4")

CAPABILITIES MODEL (abordagem DORA):
  - Melhoria contínua sem destino fixo
  - Cada organização prioriza por contexto
  - Foca em outcomes (as 4 métricas)
  - Sempre há algo a melhorar
```

### As 24 Capabilities

| # | Capability | Categoria | Impacto DORA |
|---|-----------|-----------|--------------|
| 1 | Version control | Technical | DF, LT |
| 2 | Trunk-based development | Technical | DF, LT, CFR |
| 3 | Continuous integration | Technical | DF, LT, CFR |
| 4 | Continuous delivery | Technical | DF, LT |
| 5 | Test automation | Technical | LT, CFR |
| 6 | Loosely coupled architecture | Technical | DF, LT, MTTR |
| 7 | Empowering teams (tools) | Technical | DF, LT |
| 8 | Test data management | Technical | LT, CFR |
| 9 | Shift left on security | Technical | CFR |
| 10 | Monitoring & observability | Technical | MTTR |
| 11 | Working in small batches | Process | DF, LT, CFR |
| 12 | Team experimentation | Process | DF, CFR |
| 13 | Streamlining change approval | Process | DF, LT |
| 14 | Customer feedback | Process | DF |
| 15 | Visibility of work | Process | LT |
| 16 | Limiting WIP | Process | LT |
| 17 | Generative culture (Westrum) | Cultural | ALL |
| 18 | Learning culture | Cultural | ALL |
| 19 | Collaboration between teams | Cultural | DF, LT |
| 20 | Job satisfaction | Cultural | ALL |
| 21 | Transformational leadership | Cultural | ALL |
| 22 | Disaster recovery testing | Technical | MTTR |
| 23 | Proactive notifications | Technical | MTTR |
| 24 | Database change management | Technical | LT, CFR |

### Priorização de Capabilities

```text
PASSO 1: Meça as 4 métricas DORA
PASSO 2: Identifique a métrica mais fraca
PASSO 3: Consulte a tabela — quais capabilities impactam essa métrica?
PASSO 4: Avalie quais dessas capabilities estão ausentes
PASSO 5: Priorize pela que é mais viável construir agora
PASSO 6: Construa, meça novamente em 3 meses, repita
```

## Framework 4: Westrum Organizational Culture

### Os 3 Tipos

```text
PATHOLOGICAL (Power-oriented):
  - Mensageiros são punidos
  - Falhas são escondidas
  - Inovação é esmagada
  - Silos e information hoarding
  → Bloqueia qualquer melhoria técnica

BUREAUCRATIC (Rule-oriented):
  - Mensageiros são ignorados
  - Justiça é mantida
  - Inovação é tolerada
  - Processos sobre resultados
  → Permite melhoria lenta

GENERATIVE (Performance-oriented):
  - Mensageiros são treinados
  - Falhas levam a investigação
  - Inovação é implementada
  - Responsabilidades compartilhadas
  → CORRELAÇÃO FORTE com elite DORA performance
```

### Teste de Cultura

| Pergunta | Pathological | Bureaucratic | Generative |
|----------|-------------|-------------|------------|
| O que acontece quando alguém reporta um problema? | Punição | Ignorado | Treinamento |
| O que acontece quando há falha? | Busca culpados | Busca justiça | Busca causas-raiz |
| O que acontece com ideias novas? | Esmagadas | Toleradas | Implementadas |
| Como é o fluxo de informação? | Retido como poder | Seguindo regras | Livre e proativo |

## Framework 5: Deployment Pain & Burnout

### A Conexão

```text
ACHADO: Deployment pain correlaciona diretamente com burnout.

  Deploy doloroso → Times com medo de deploy → Deploys menos frequentes →
  Batches maiores → Mais risco → Mais falhas → Mais dor → CICLO VICIOSO

  Deploy indolor → Times confiantes → Deploys frequentes →
  Batches menores → Menos risco → Menos falhas → CICLO VIRTUOSO

IMPLICAÇÃO:
  Melhorar deployment frequency não é apenas métrica de performance.
  É métrica de BEM-ESTAR HUMANO.
```

## Integration: Como os Frameworks se Conectam

```text
Westrum Culture (foundation) → Capabilities (drivers) →
4 DORA Metrics (measurement) → Organizational Performance (outcome) →
Well-being & Retention (human impact)
```

Cultura é o solo. Capabilities são as sementes. Métricas DORA medem o crescimento. Performance organizacional é a colheita. E bem-estar humano é o que realmente importa.

---

**Source:** NF Mind DNA - DORA Metrics + Accelerate Operational Framework
