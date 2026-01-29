# AIOS Framework - Livro de Ouro v2.1 (Complete)

## O Sistema Operacional Definitivo para Orquestração de Agentes IA

**Versão:** 2.1.0
**Status:** Living Document
**Última Atualização:** 2025-12-09
**Mantido Por:** AIOS Framework Team + Community
**Repositório Principal:** `SynkraAI/aios-core`

---

> **"Structure is Sacred. Tone is Flexible."**
> _— Fundamento filosófico do AIOS_

---

## 📣 IMPORTANTE: Sobre Este Documento

Este documento é a **versão consolidada v2.1** que incorpora todas as mudanças dos Sprints 2-5:

- ✅ **Modular Architecture** (4 módulos: core, development, product, infrastructure)
- ✅ **Squad System** (nova terminologia, substituindo "Expansion Pack")
- ✅ **Multi-Repo Strategy** (3 repositórios públicos + 2 privados)
- ✅ **Quality Gates 3 Layers** (Pre-commit, PR Automation, Human Review)
- ✅ **Story Template v2.0** (Cross-Story Decisions, CodeRabbit Integration)
- ✅ **npm Package Scoping** (@aios/core, @aios/squad-\*, @aios/mcp-presets)

**Referências Legadas:**

- `AIOS-LIVRO-DE-OURO.md` - Base v2.0.0 (Jan 2025)
- `AIOS-LIVRO-DE-OURO-V2.1.md` - Delta parcial
- `AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md` - Resumo de mudanças

---

## 📜 Open Source vs. Serviço - Business Model v2.1

### O Que Mudou de v2.0 para v2.1

**IMPORTANTE: v2.1 alterou fundamentalmente o business model!**

| Componente               | v2.0        | v2.1            | Rationale                  |
| ------------------------ | ----------- | --------------- | -------------------------- |
| **11 Agents**            | ✅ Open     | ✅ Open         | Core functionality         |
| **Workers (97+)**        | ❌ Closed   | ✅ **OPEN**     | Commodity, network effects |
| **Service Discovery**    | ❌ None     | ✅ **BUILT-IN** | Community needs it         |
| **Task-First Arch**      | ⚠️ Implicit | ✅ **EXPLICIT** | Architecture clarity       |
| **Clones (DNA Mental™)** | 🔒 Closed   | 🔒 **CLOSED**   | True moat (IP)             |
| **Expansion Packs**      | 🔒 Closed   | 🔒 **CLOSED**   | Domain expertise           |

### Repositório Multi-Repo Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SYNKRA ORGANIZATION                                 │
│                                                                         │
│   PUBLIC REPOSITORIES (3)                                               │
│   ═══════════════════════                                               │
│                                                                         │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  SynkraAI/aios-core (Commons Clause)                         │   │
│   │  ─────────────────────────────────────                         │   │
│   │  • Core Framework & Orchestration Engine                       │   │
│   │  • 11 Base Agents (Dex, Luna, Aria, Quinn, etc.)              │   │
│   │  • Task Runner & Workflow Engine                               │   │
│   │  • Quality Gates System                                        │   │
│   │  • Service Discovery                                           │   │
│   │  • DISCUSSIONS HUB (Central community)                         │   │
│   │  npm: @aios/core                                               │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                              ▲                                         │
│                              │ peerDependency                          │
│   ┌──────────────────────────┼──────────────────────────┐              │
│   │                          │                          │              │
│   ▼                          │                          ▼              │
│   ┌─────────────────────┐    │    ┌─────────────────────────────┐     │
│   │ SynkraAI/         │    │    │ SynkraAI/mcp-ecosystem    │     │
│   │ aios-squads (MIT)   │    │    │ (Apache 2.0)                │     │
│   │ ─────────────────   │    │    │ ──────────────────────────  │     │
│   │ • ETL Squad         │    │    │ • Docker MCP Toolkit        │     │
│   │ • Creator Squad     │    │    │ • IDE Configurations        │     │
│   │ • MMOS Squad        │    │    │ • MCP Presets               │     │
│   │ npm: @aios/squad-*  │    │    │ npm: @aios/mcp-presets      │     │
│   └─────────────────────┘    │    └─────────────────────────────┘     │
│                              │                                         │
│   PRIVATE REPOSITORIES (2)   │                                         │
│   ════════════════════════   │                                         │
│                              │                                         │
│   ┌─────────────────────┐    │    ┌─────────────────────────────┐     │
│   │ SynkraAI/mmos     │    │    │ SynkraAI/certified-       │     │
│   │ (Proprietary + NDA) │    │    │ partners (Proprietary)      │     │
│   │ ─────────────────   │    │    │ ──────────────────────────  │     │
│   │ • MMOS Minds        │    │    │ • Premium Squads            │     │
│   │ • Cognitive Clones  │    │    │ • Partner Portal            │     │
│   │ • DNA Mental™       │    │    │ • Marketplace               │     │
│   └─────────────────────┘    │    └─────────────────────────────┘     │
│                              │                                         │
└──────────────────────────────┴─────────────────────────────────────────┘
```

### Competitive Positioning

| Framework     | Open-Source Completeness | Unique Differentiator          |
| ------------- | ------------------------ | ------------------------------ |
| LangChain     | ✅ Complete              | ❌ None (commodity)            |
| CrewAI        | ✅ Complete              | ❌ None (commodity)            |
| AutoGen       | ✅ Complete              | ❌ None (commodity)            |
| **AIOS v2.1** | ✅ **Complete**          | ✅ **Clones (DNA Mental™)** ⭐ |

**Analogia:** Linux é open source, mas Red Hat Enterprise Linux adiciona suporte e otimizações. Ambos são Linux, mas o valor agregado varia. AIOS funciona igual.

---

## 📖 Como Usar Este Livro

Este não é um documento para ser lido do início ao fim. É um **sistema de aprendizado em camadas**:

- 🚀 **Layer 0: DISCOVERY** - Descubra seu caminho (5 min)
- 🎯 **Layer 1: UNDERSTANDING** - 5 essays que ensinam o modelo mental (75 min)
- 🎨 **Layer 2: COMPONENT LIBRARY** - Catálogo completo de componentes
- 📋 **Layer 3: USAGE GUIDE** - Como usar AIOS v2.1 no seu contexto
- 📚 **Layer 4: COMPLETE REFERENCE** - Especificação técnica completa
- 🔄 **META: EVOLUTION** - Como contribuir e evoluir o framework

**A maioria das pessoas precisa apenas do Layer 1.** O resto existe para quando você precisar.

---

# 🚀 LAYER 0: DISCOVERY ROUTER

## Bem-vindo ao AIOS v2.1 - Vamos Encontrar Seu Caminho

### Learning Tracks Disponíveis

| Track                       | Tempo     | Melhor Para                              |
| --------------------------- | --------- | ---------------------------------------- |
| **Track 1: Quick Start**    | 15-30 min | Exploradores curiosos, decisores rápidos |
| **Track 2: Deep Dive**      | 1.5-2h    | Builders ativos com dores reais          |
| **Track 3: Mastery Path**   | Semanas   | Framework developers, power users        |
| **Track 4: Decision Maker** | 30-45 min | Líderes avaliando adoção                 |
| **Track 5: Targeted**       | Variável  | Precisa de algo específico               |
| **Track 6: v2.0 Upgrade**   | 45-60 min | Usuários v2.0 migrando                   |

---

# 🎯 LAYER 1: UNDERSTANDING

## Essay 1: Por Que AIOS Existe

### O Problema

Desenvolvimento com AI agents hoje é **caótico**:

- Agents sem coordenação
- Resultados inconsistentes
- Sem quality gates
- Contexto perdido entre sessões
- Cada projeto reinventa a roda

### A Solução

AIOS fornece **orquestração estruturada**:

- 11 agents especializados com personalidades
- Workflows multi-agent coordenados
- Quality Gates em 3 camadas
- Task-First Architecture para portabilidade
- Service Discovery para reutilização

---

## Essay 2: Estrutura é Sagrada

> "Quando as informações estão sempre nas mesmas posições, nosso cérebro sabe onde buscar rápido."

**FIXO (Structure):**

- Posições de template
- Ordem de seções
- Formatos de métricas
- Estrutura de arquivos
- Workflows de task

**FLEXÍVEL (Tone):**

- Mensagens de status
- Escolhas de vocabulário
- Uso de emoji
- Personalidade do agent
- Tom de comunicação

---

## Essay 3: Business Model v2.1

### Por Que Workers São Open-Source Agora?

1. **Workers são Commodity** - Any developer can write deterministic scripts
2. **Clones são Singularidade** - DNA Mental™ takes years to develop
3. **Maximum Adoption Strategy** - Zero friction to start
4. **Network Effects** - More users → More contributors → Better Workers

### O Que Permanece Proprietário?

- **Clones** - Cognitive emulation via DNA Mental™
- **Squads Premium** - Industry expertise (Finance, Healthcare, etc.)
- **Team Features** - Collaboration, shared memory
- **Enterprise** - Scale, support, SLAs

---

## Essay 4: Agent System

### Os 11 Agents v2.1

| Agent     | ID              | Archetype    | Responsabilidade        |
| --------- | --------------- | ------------ | ----------------------- |
| **Dex**   | `dev`           | Builder      | Code implementation     |
| **Quinn** | `qa`            | Guardian     | Quality assurance       |
| **Aria**  | `architect`     | Architect    | Technical architecture  |
| **Nova**  | `po`            | Visionary    | Product backlog         |
| **Kai**   | `pm`            | Balancer     | Product strategy        |
| **River** | `sm`            | Facilitator  | Process facilitation    |
| **Zara**  | `analyst`       | Explorer     | Business analysis       |
| **Dara**  | `data-engineer` | Architect    | Data engineering        |
| **Felix** | `devops`        | Optimizer    | CI/CD and operations    |
| **Uma**   | `ux-expert`     | Creator      | User experience         |
| **Pax**   | `aios-master`   | Orchestrator | Framework orchestration |

### Agent Activation

```bash
# Ativar agent
@dev             # Ativa Dex (Developer)
@qa              # Ativa Quinn (QA)
@architect       # Ativa Aria (Architect)
@aios-master     # Ativa Pax (Orchestrator)

# Comandos de agent (prefix *)
*help            # Mostra comandos disponíveis
*task <name>     # Executa task específica
*exit            # Desativa agent
```

---

## Essay 5: Task-First Architecture

### A Filosofia

> **"Everything is a Task. Executors are attributes."**

### O Que Isso Significa

**Tradicional (Task-per-Executor):**

```yaml
# 2 implementações separadas para a mesma task
agent_task.md:
  executor: Agent (Sage)

worker_task.js:
  executor: Worker (market-analyzer.js)
```

**Task-First (Universal Task):**

```yaml
# UMA definição de task
task: analyzeMarket()
inputs: { market_data: object }
outputs: { insights: array }

# Executor é apenas um campo
responsavel_type: Humano   # Day 1
responsavel_type: Worker   # Week 10
responsavel_type: Agente   # Month 6
responsavel_type: Clone    # Year 2
```

### Migração Instantânea

- **Antes:** 2-4 dias (rewrite required)
- **Depois:** 2 segundos (change 1 field)

---

# 🎨 LAYER 2: COMPONENT LIBRARY

## Arquitetura Modular v2.1

### Os 4 Módulos

```
.aios-core/
├── core/              # Framework foundations
│   ├── config/        # Configuration management
│   ├── registry/      # Service Discovery
│   ├── quality-gates/ # 3-layer QG system
│   ├── mcp/           # MCP global configuration
│   └── session/       # Session management
│
├── development/       # Development artifacts
│   ├── agents/        # 11 agent definitions
│   ├── tasks/         # 115+ task definitions
│   ├── workflows/     # 7 workflow definitions
│   └── scripts/       # Dev support utilities
│
├── product/           # User-facing templates
│   ├── templates/     # 52+ templates
│   ├── checklists/    # 11 checklists
│   └── data/          # PM knowledge base
│
└── infrastructure/    # System configuration
    ├── scripts/       # 55+ infrastructure scripts
    ├── tools/         # CLI, MCP, local configs
    └── integrations/  # PM adapters (ClickUp, Jira)
```

### Module Dependencies

```
┌─────────────────────────────────────────────────────┐
│                 CLI / Tools                          │
│                     │                                │
│      ┌──────────────┼──────────────┐                │
│      ▼              ▼              ▼                │
│  development    product    infrastructure           │
│      │              │              │                │
│      └──────────────┼──────────────┘                │
│                     ▼                                │
│                   core                               │
│           (no dependencies)                          │
└─────────────────────────────────────────────────────┘

Regras:
• core/ não tem dependências internas
• development/, product/, infrastructure/ dependem APENAS de core/
• Dependências circulares são PROIBIDAS
```

---

## Squad System (Novo em v2.1)

### Terminologia

| Termo Antigo   | Termo Novo         | Descrição              |
| -------------- | ------------------ | ---------------------- |
| Expansion Pack | **Squad**          | Modular AI agent teams |
| Squads/        | **squads/**        | Diretório de Squads    |
| pack.yaml      | **squad.yaml**     | Manifesto do Squad     |
| @expansion/\*  | **@aios/squad-\*** | npm scope              |

### Estrutura de Squad

```
squads/
├── etl-squad/
│   ├── squad.yaml         # Manifesto
│   ├── agents/            # Squad-specific agents
│   ├── tasks/             # Squad tasks
│   └── templates/         # Squad templates
│
├── creator-squad/
│   └── ...
│
└── mmos-squad/
    └── ...
```

### Squad Manifest (squad.yaml)

```yaml
name: etl-squad
version: 1.0.0
description: Data pipeline and ETL automation squad
license: MIT

peerDependencies:
  '@aios/core': '^2.1.0'

agents:
  - id: etl-orchestrator
    extends: data-engineer
  - id: data-validator
    extends: qa

tasks:
  - collect-sources
  - transform-data
  - validate-pipeline

exports:
  - agents
  - tasks
  - templates
```

---

## Quality Gates 3 Layers

### Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QUALITY GATES 3 LAYERS                              │
│                                                                         │
│   LAYER 1: LOCAL (Pre-commit)                                          │
│   ═════════════════════════════                                         │
│   • ESLint, Prettier, TypeScript                                        │
│   • Unit tests (fast)                                                   │
│   • Executor: Worker (deterministic)                                    │
│   • Tool: Husky + lint-staged                                          │
│   • Blocking: Can't commit if fails                                     │
│   • Catches: 30% of issues instantly                                    │
│                                                                         │
│   LAYER 2: PR AUTOMATION (CI/CD)                                       │
│   ══════════════════════════════                                        │
│   • CodeRabbit AI review                                                │
│   • Integration tests, coverage                                         │
│   • Security scan, performance                                          │
│   • Executor: Agent (QA) + CodeRabbit                                  │
│   • Tool: GitHub Actions + CodeRabbit App                              │
│   • Blocking: Required checks for merge                                 │
│   • Catches: Additional 50% (80% total)                                │
│                                                                         │
│   LAYER 3: HUMAN REVIEW (Strategic)                                    │
│   ════════════════════════════════                                      │
│   • Architecture alignment                                              │
│   • Business logic correctness                                          │
│   • Edge cases, documentation                                           │
│   • Executor: Human (Senior Dev / Tech Lead)                           │
│   • Tool: Human expertise + context                                     │
│   • Blocking: Final approval required                                   │
│   • Catches: Final 20% (100% total)                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Configuração

**Layer 1 - Pre-commit (.husky/pre-commit):**

```bash
#!/bin/sh
npx lint-staged
npm run typecheck
npm test -- --onlyChanged
```

**Layer 2 - GitHub Actions (.github/workflows/quality-gates-pr.yml):**

```yaml
name: Quality Gates PR
on: [pull_request]
jobs:
  layer2:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit --audit-level=high
```

**Layer 3 - CODEOWNERS:**

```
# Layer 3: Human review requirements
*.md @architecture-team
/src/core/ @senior-devs
/docs/architecture/ @architect
```

---

## Story Template v2.0

### Estrutura Completa

````markdown
# Story X.X: [Title]

**Epic:** [Parent Epic]
**Story ID:** X.X
**Sprint:** [Number]
**Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
**Points:** [Number]
**Status:** ⚪ Ready | 🔄 In Progress | ✅ Done
**Type:** 🔧 Infrastructure | 💻 Feature | 📖 Documentation | ✅ Validation

---

## 🔀 Cross-Story Decisions

| Decision        | Source     | Impact on This Story        |
| --------------- | ---------- | --------------------------- |
| [Decision Name] | [Story ID] | [How it affects this story] |

---

## 📋 User Story

**Como** [persona],
**Quero** [ação],
**Para** [benefício].

---

## ✅ Tasks

### Phase 1: [Name]

- [ ] **1.1** [Task description]
- [ ] **1.2** [Task description]

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN [context]
WHEN [action]
THEN [expected result]
```
````

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

| Attribute         | Value             | Rationale |
| ----------------- | ----------------- | --------- |
| Type              | [Type]            | [Why]     |
| Complexity        | [Low/Medium/High] | [Why]     |
| Test Requirements | [Type]            | [Why]     |

### Agent Assignment

| Role      | Agent | Responsibility |
| --------- | ----- | -------------- |
| Primary   | @dev  | [Task]         |
| Secondary | @qa   | [Task]         |

---

## 🧑‍💻 Dev Agent Record

### Execution Log

| Timestamp | Phase | Action | Result |
| --------- | ----- | ------ | ------ |

---

## 🧪 QA Results

### Test Execution Summary

| Check | Status | Notes |
| ----- | ------ | ----- |

````

---

## npm Package Scoping

### Package Structure

| Package | Registry | Depends On | License |
|---------|----------|------------|---------|
| `@aios/core` | npm public | - | Commons Clause |
| `@aios/squad-etl` | npm public | @aios/core | MIT |
| `@aios/squad-creator` | npm public | @aios/core | MIT |
| `@aios/squad-mmos` | npm public | @aios/core | MIT |
| `@aios/mcp-presets` | npm public | - | Apache 2.0 |

### Installation

```bash
# Core framework
npm install @aios/core

# Squads (require core as peer)
npm install @aios/squad-etl

# MCP presets (independent)
npm install @aios/mcp-presets
````

---

# 📋 LAYER 3: USAGE GUIDE

## Quick Start v2.1

### Installation (5 minutes)

```bash
# New project (Greenfield)
$ npx @SynkraAI/aios@latest init

# Existing project (Brownfield)
$ npx @SynkraAI/aios migrate v2.0-to-v2.1
```

### First Steps

```bash
# List available agents
$ aios agents list

# List available Squads
$ aios squads list

# Create your first story
$ aios stories create

# Execute a task
$ aios task develop-story --story=1.1
```

### Local Development (Multi-Repo)

```bash
# Clone all repos
mkdir -p ~/Workspaces/AIOS && cd ~/Workspaces/AIOS
gh repo clone SynkraAI/aios-core
gh repo clone SynkraAI/aios-squads
gh repo clone SynkraAI/mcp-ecosystem

# Link for local development
cd aios-core && npm install && npm link
cd ../aios-squads && npm install && npm link @aios/core

# VS Code workspace
code aios-workspace.code-workspace
```

---

## Service Discovery

### Finding Workers

```bash
# Search for workers
$ aios workers search "json parse"

Results (3 Workers):
📦 json-parser.js        ⭐⭐⭐⭐⭐ (47 projects)
📦 json-validator.js     ⭐⭐⭐⭐ (23 projects)
📦 json-transformer.js   ⭐⭐⭐ (15 projects)

# Get worker details
$ aios workers info json-parser

# Use worker in task
$ aios workers use json-parser --task my-task
```

### Time Saved

- **Before:** 2 hours (search, install, wrap)
- **After:** 30 seconds (search, use)

---

## Workflows

### Available Workflows

| Workflow                 | Use Case                | Agents Involved   |
| ------------------------ | ----------------------- | ----------------- |
| `greenfield-fullstack`   | New full-stack project  | All agents        |
| `brownfield-integration` | Add AIOS to existing    | dev, architect    |
| `fork-join`              | Parallel task execution | Multiple          |
| `organizer-worker`       | Delegated execution     | po, dev           |
| `data-pipeline`          | ETL workflows           | data-engineer, qa |

### Executing Workflows

```bash
# Start workflow
$ aios workflow greenfield-fullstack

# With parameters
$ aios workflow brownfield-integration --target=./existing-project
```

---

# 📚 LAYER 4: COMPLETE REFERENCE

## Source Tree v2.1 (Current)

```
@synkra/aios-core/                        # Root project
├── .aios-core/                        # Framework layer
│   ├── core/                          # Core module
│   │   ├── config/                    # Configuration
│   │   ├── registry/                  # Service Discovery
│   │   ├── quality-gates/             # 3-layer QG
│   │   ├── mcp/                       # MCP system
│   │   └── session/                   # Session mgmt
│   │
│   ├── development/                   # Development module
│   │   ├── agents/                    # 11 agents
│   │   ├── tasks/                     # 115+ tasks
│   │   ├── workflows/                 # 7 workflows
│   │   └── scripts/                   # Dev scripts
│   │
│   ├── product/                       # Product module
│   │   ├── templates/                 # 52+ templates
│   │   ├── checklists/                # 11 checklists
│   │   └── data/                      # PM data
│   │
│   ├── infrastructure/                # Infrastructure module
│   │   ├── scripts/                   # 55+ scripts
│   │   ├── tools/                     # CLI, MCP configs
│   │   └── integrations/              # PM adapters
│   │
│   └── docs/                          # Framework docs
│       └── standards/                 # This document lives here
│
├── docs/                              # Project docs
│   ├── stories/                       # Development stories
│   │   └── v2.1/                      # v2.1 stories
│   │       ├── sprint-1/
│   │       ├── sprint-2/
│   │       ├── sprint-3/
│   │       ├── sprint-4/
│   │       ├── sprint-5/
│   │       └── sprint-6/
│   │
│   ├── architecture/                  # Architecture docs
│   │   ├── multi-repo-strategy.md    # Multi-repo guide
│   │   ├── module-system.md          # Module architecture
│   │   └── ...
│   │
│   └── epics/                         # Epic planning
│
├── squads/                            # Squad implementations
│   ├── etl/                           # ETL Squad
│   ├── creator/                       # Creator Squad
│   └── mmos-mapper/                   # MMOS Squad
│
├── .github/                           # GitHub automation
│   ├── workflows/                     # CI/CD
│   │   ├── quality-gates-pr.yml      # Layer 2 QG
│   │   └── tests.yml                  # Test automation
│   │
│   ├── ISSUE_TEMPLATE/                # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md      # PR template
│   └── CODEOWNERS                     # Code ownership
│
├── .husky/                            # Git hooks (Layer 1)
│   ├── pre-commit
│   └── pre-push
│
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── COMMUNITY.md
├── SECURITY.md
├── LICENSE
└── CHANGELOG.md
```

---

## Key Metrics Comparison

### Installation

| Metric          | v2.0       | v2.1      | Improvement     |
| --------------- | ---------- | --------- | --------------- |
| Time to install | 2-4 hours  | 5 minutes | **96% faster**  |
| Steps required  | 15+ manual | 1 command | **93% simpler** |
| Success rate    | 60%        | 98%       | **+38%**        |

### Development Speed

| Metric                | v2.0     | v2.1       | Improvement       |
| --------------------- | -------- | ---------- | ----------------- |
| Find reusable Worker  | N/A      | 30 seconds | **∞**             |
| Quality issues caught | 20%      | 80%        | **4x**            |
| Executor migration    | 2-4 days | 2 seconds  | **99.99% faster** |

### Quality

| Metric              | v2.0       | v2.1          |
| ------------------- | ---------- | ------------- |
| Quality Gate Layers | 1 (manual) | 3 (automated) |
| Auto-caught issues  | 0%         | 80%           |
| Human review time   | 2-4h/PR    | 30min/PR      |

---

## Version History

| Version | Date       | Changes                                           |
| ------- | ---------- | ------------------------------------------------- |
| 2.0.0   | 2025-01-19 | Initial v2.0 release                              |
| 2.1.0   | 2025-12-09 | Modular arch, Squads, Multi-repo, QG3, Story v2.0 |

---

## Related Documents

- [Multi-Repo Strategy](../../architecture/multi-repo-strategy.md)
- [Module System](../../architecture/module-system.md)
- [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md)
- [STORY-TEMPLATE-V2-SPECIFICATION.md](./STORY-TEMPLATE-V2-SPECIFICATION.md)
- [STANDARDS-INDEX.md](./STANDARDS-INDEX.md)

---

**Última Atualização:** 2025-12-09
**Versão:** 2.1.0-complete
**Mantido Por:** AIOS Framework Team

---

_Este documento consolida AIOS-LIVRO-DE-OURO.md (v2.0) + deltas v2.1 em um único documento completo._
