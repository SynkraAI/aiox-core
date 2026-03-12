# Zona Genialidade Squad

> Descubra sua Zona de Genialidade, encontre o Squad ideal e crie seu plano de monetizacao — tudo em 30 minutos.

## O que e este Squad?

O Zona Genialidade Squad identifica o perfil comportamental do usuario, mapeia sua zona de genialidade, recomenda qual squad criar/operar e entrega um plano de monetizacao concreto.

**Para quem:** Alunos do Cohort Fundamentals que precisam descobrir qual squad vai ser sua "squad genial" — a que podem criar e monetizar focando na zona de genialidade.

## Como Funciona

```
[30 min] Assessment unificado (Sim/Nao + Multipla Escolha)
              ↓
[Autonomo] 7 analistas processam seus dados
              ↓
[Entrega] Genius Zone Blueprint completo
           ├── Perfil comportamental
           ├── Squad recomendado
           └── Plano de monetizacao
```

**Experiencia do usuario:** Responda ~43 perguntas em 30 minutos. O squad faz o resto.

## Quick Start

```
# Pipeline completo ponta-a-ponta (RECOMENDADO)
/ZonaGenialidade:tasks:start

# Ou comandos individuais:
@zona-genialidade-chief *assess
@zona-genialidade-chief *blueprint
@zona-genialidade-chief *recommend-squad
@zona-genialidade-chief *help
```

## Agents

| Agent | Tier | Papel | Framework |
|-------|------|-------|-----------|
| `zona-genialidade-chief` | Orchestrator | Coordena fluxo, roteamento | - |
| `gay-hendricks` | Tier 0 | Diagnostico de zona | Zone of Genius Model |
| `don-clifton` | Tier 1 | Perfil de talentos | CliftonStrengths 34 |
| `dan-sullivan` | Tier 1 | Habilidade unica | Unique Ability |
| `roger-hamilton` | Tier 1 | Perfil de riqueza → squad | Wealth Dynamics |
| `alex-hormozi` | Tier 1 | Monetizacao | Value Equation + Grand Slam |
| `kathy-kolbe` | Tier 2 | Estilo de execucao | Kolbe Action Modes |
| `sally-hogshead` | Tier 2 | Posicionamento | Fascination Advantage |

## Tasks

| Task | Descricao | Interacao |
|------|-----------|-----------|
| `start` | **Pipeline completo ponta-a-ponta** (assessment → analise → matching → blueprint) | Hibrido |
| `run-assessment` | Assessment unificado de 30 min | Interativo |
| `analyze-genius-profile` | Analise multi-framework | Autonomo |
| `recommend-squad` | Recomendacao de squad | Autonomo |
| `generate-blueprint` | Blueprint final | Autonomo |

## Fluxo Detalhado

### Etapa 1: Assessment (30 min max)

O assessment unificado extrai dados para TODOS os 7 frameworks de uma vez:

| Secao | Tempo | Perguntas | Frameworks Alimentados |
|-------|-------|-----------|------------------------|
| Contexto Pessoal | 5 min | ~8 | Todos |
| Atividades e Energia | 8 min | ~12 | Hendricks, Sullivan, Kolbe |
| Talentos e Padroes | 7 min | ~10 | Clifton, Hogshead |
| Estilo de Negocios | 5 min | ~8 | Hamilton, Hormozi |
| Visao e Ambicao | 5 min | ~5 | Hormozi, Matching |

### Etapa 2: Analise (autonoma)

7 agentes analisam os mesmos dados de perspectivas diferentes:

```
Assessment Data
    ├── Gay Hendricks    → Zona atual + Upper Limit Problem
    ├── Don Clifton      → Top 5 talentos + dominio dominante
    ├── Dan Sullivan     → Unique Ability + mapa de delegacao
    ├── Roger Hamilton   → Wealth Profile + squad match
    ├── Alex Hormozi     → Value Equation + oferta draft
    ├── Kathy Kolbe      → Action Modes + estilo de execucao
    └── Sally Hogshead   → Arquetipo + posicionamento
```

### Etapa 3: Blueprint

Documento unificado com 10 secoes:

1. Perfil em 30 Segundos
2. Diagnostico de Zona (Hendricks)
3. Mapa de Talentos (Clifton)
4. Habilidade Unica (Sullivan)
5. Perfil de Riqueza (Hamilton)
6. Squad Recomendado
7. Plano de Monetizacao (Hormozi)
8. Estilo de Execucao (Kolbe)
9. Posicionamento (Hogshead)
10. Proximos Passos

## Quality Gates

| ID | Nome | Transicao | Blocking |
|----|------|-----------|----------|
| QG-001 | Intake Validated | Input → Assessment | Sim |
| QG-002 | Assessment Complete | Assessment → Analise | Sim |
| QG-003 | Profile Synthesized | Analise → Matching | Sim |
| QG-004 | Blueprint Reviewed | Output → Entrega | Sim |

## Fundacao de Pesquisa

Cada agente e baseado em um elite mind real com frameworks documentados:

| Mind | Obra Principal | Impacto |
|------|---------------|---------|
| Gay Hendricks | The Big Leap (2009) | 1M+ copias, conceito de Zone of Genius |
| Don Clifton | StrengthsFinder 2.0 | 35M+ assessments, APA Father of Strengths |
| Dan Sullivan | Strategic Coach | 35+ anos, 20K+ empreendedores |
| Roger Hamilton | Wealth Dynamics | 2.3M+ assessments |
| Alex Hormozi | $100M Offers/Leads | $200M+/ano portfolio |
| Kathy Kolbe | Kolbe A Index | 50+ anos de aplicacao |
| Sally Hogshead | Fascinate/How the World Sees You | 1M+ assessments |

## Dependencias Opcionais

Estes expansion-packs complementam o Zona Genialidade:

| Pack | Como Complementa |
|------|-------------------|
| `mentoria-engine` | Phase 1 (Genius Zone Discovery) ja implementada |
| `onboarding-intelligence` | DISC/Enneagram/Clifton profiling avancado |
| `innerlens` | Big Five analysis com fragments |
| `squad-creator` | Criar o squad recomendado |

## Estrutura de Diretorios

```
squads/zona-genialidade/
├── agents/
│   ├── zona-genialidade-chief.md
│   ├── gay-hendricks.md
│   ├── don-clifton.md
│   ├── dan-sullivan.md
│   ├── roger-hamilton.md
│   ├── alex-hormozi.md
│   ├── kathy-kolbe.md
│   └── sally-hogshead.md
├── tasks/
│   ├── start.md
│   ├── run-assessment.md
│   ├── analyze-genius-profile.md
│   ├── recommend-squad.md
│   └── generate-blueprint.md
├── data/
│   └── zona-genialidade-kb.md
├── config.yaml
└── README.md
```

---

_Squad Version: 1.0.0_
_Created: 2026-02-13_
_Research Foundation: 7 elite minds, 12 researched_
