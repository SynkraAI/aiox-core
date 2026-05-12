<!-- Tradução: PT-BR | Original: /docs/en/architecture/high-level-architecture.md | Sincronização: 2026-01-26 -->

# Arquitetura de Alto Nível do AIOX v4

> 🌐 [EN](../../architecture/high-level-architecture.md) | **PT** | [ES](../../es/architecture/high-level-architecture.md)

---

**Versão:** 2.1.0
**Última Atualização:** 2025-12-09
**Status:** Documento Oficial de Arquitetura

---

## Índice

- [Visão Geral](#visão-geral)
- [Diagrama de Arquitetura](#diagrama-de-arquitetura)
- [Arquitetura Modular](#arquitetura-modular)
- [Estratégia Multi-Repo](#estratégia-multi-repo)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Componentes Principais](#componentes-principais)
- [Quality Gates](#quality-gates)

---

## Visão Geral

**AIOX (AI Operating System)** é um framework sofisticado para orquestração de agentes de IA, workers e humanos em fluxos de trabalho complexos de desenvolvimento de software. A versão 2.1 introduz uma arquitetura modular com 4 módulos, estratégia multi-repositório e quality gates de 3 camadas.

### Capacidades Principais v4.2

| Capacidade                    | Descrição                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **11 Agentes Especializados** | Dev, QA, Arquiteto, PM, PO, SM, Analista, Engenheiro de Dados, DevOps, UX, Master |
| **115+ Tarefas Executáveis**  | Criação de stories, geração de código, testes, deploy, documentação               |
| **52+ Templates**             | PRDs, stories, docs de arquitetura, regras de IDE, quality gates                  |
| **Arquitetura de 4 Módulos**  | Core, Development, Product, Infrastructure                                        |
| **3 Camadas de Quality Gate** | Pre-commit, Automação de PR, Revisão Humana                                       |
| **Estratégia Multi-Repo**     | 3 repositórios públicos + 2 privados                                              |
| **Sistema de Squads**         | Times modulares de agentes de IA (ETL, Creator, MMOS)                             |

---

## Diagrama de Arquitetura

### Arquitetura de 4 Módulos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRAMEWORK AIOX v4                                 │
│                     ═══════════════════                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        CLI / FERRAMENTAS                        │   │
│   │  (aiox agents, aiox tasks, aiox squads, aiox workflow)          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│          ┌────────────────────┼────────────────────┐                   │
│          │                    │                    │                   │
│          ▼                    ▼                    ▼                   │
│   ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐           │
│   │ DEVELOPMENT  │   │   PRODUCT    │   │ INFRASTRUCTURE  │           │
│   │   MODULE     │   │   MODULE     │   │    MODULE       │           │
│   │ ──────────── │   │ ──────────── │   │ ─────────────── │           │
│   │ • 11 Agentes │   │ • 52+ Tmpls  │   │ • 55+ Scripts   │           │
│   │ • 115+ Tasks │   │ • 11 Chklsts │   │ • Configs Tools │           │
│   │ • 7 Wrkflws  │   │ • Dados PM   │   │ • Integrações   │           │
│   │ • Scripts Dev│   │              │   │ • Adapters PM   │           │
│   └──────┬───────┘   └──────┬───────┘   └────────┬────────┘           │
│          │                  │                    │                     │
│          └──────────────────┼────────────────────┘                     │
│                             │                                          │
│                             ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      MÓDULO CORE                                │   │
│   │                      ═══════════                                │   │
│   │                                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│   │   │   Config    │  │  Registry   │  │    Quality Gates        │ │   │
│   │   │   System    │  │  (Service   │  │    (3 Camadas)          │ │   │
│   │   │             │  │  Discovery) │  │                         │ │   │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│   │                                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│   │   │    MCP      │  │   Session   │  │     Elicitation         │ │   │
│   │   │   System    │  │   Manager   │  │       Engine            │ │   │
│   │   │             │  │             │  │                         │ │   │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│   │                                                                  │   │
│   │   SEM DEPENDÊNCIAS INTERNAS (Camada de Fundação)                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Relacionamentos entre Módulos

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE DEPENDÊNCIA DE MÓDULOS                     │
│                                                                         │
│                         ┌──────────────┐                                │
│                         │  CLI/Tools   │                                │
│                         └──────┬───────┘                                │
│                                │                                        │
│              ┌─────────────────┼─────────────────┐                      │
│              │                 │                 │                      │
│              ▼                 ▼                 ▼                      │
│     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │
│     │  development/  │ │    product/    │ │infrastructure/ │           │
│     │                │ │                │ │                │           │
│     │  • Agentes     │ │  • Templates   │ │  • Scripts     │           │
│     │  • Tarefas     │ │  • Checklists  │ │  • Ferramentas │           │
│     │  • Workflows   │ │  • Dados PM    │ │  • Integrações │           │
│     └───────┬────────┘ └───────┬────────┘ └───────┬────────┘           │
│             │                  │                  │                     │
│             │         depende apenas de           │                     │
│             └──────────────────┼──────────────────┘                     │
│                                │                                        │
│                                ▼                                        │
│                      ┌────────────────┐                                 │
│                      │     core/      │                                 │
│                      │                │                                 │
│                      │  SEM DEPEND.   │                                 │
│                      │  INTERNAS      │                                 │
│                      └────────────────┘                                 │
│                                                                         │
│   REGRAS:                                                               │
│   • core/ não tem dependências internas                                 │
│   • development/, product/, infrastructure/ dependem APENAS de core/    │
│   • Dependências circulares são PROIBIDAS                               │
│   • CLI/Tools pode acessar qualquer módulo                              │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Estratégia Multi-Repo

### Estrutura de Repositórios

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORGANIZAÇÃO SYNKRA                                   │
│                                                                         │
│   REPOSITÓRIOS PÚBLICOS                                                 │
│   ═══════════════════                                                   │
│                                                                         │
│   ┌────────────────────┐     ┌────────────────────┐                    │
│   │  SynkraAI/         │     │  SynkraAI/         │                    │
│   │  aiox-core         │     │  aiox-squads       │                    │
│   │  (MIT)  │◄────│  (MIT)             │                    │
│   │                    │     │                    │                    │
│   │  • Core Framework  │     │  • ETL Squad       │                    │
│   │  • 11 Agentes Base │     │  • Creator Squad   │                    │
│   │  • Quality Gates   │     │  • MMOS Squad      │                    │
│   │  • Hub Discussões  │     │                    │                    │
│   └────────────────────┘     └────────────────────┘                    │
│            │                                                            │
│            │ dependência opcional                                       │
│            ▼                                                            │
│   ┌────────────────────┐                                               │
│   │  SynkraAI/         │                                               │
│   │  mcp-ecosystem     │                                               │
│   │  (Apache 2.0)      │                                               │
│   │                    │                                               │
│   │  • Docker MCP      │                                               │
│   │  • Configs IDE     │                                               │
│   │  • Presets MCP     │                                               │
│   └────────────────────┘                                               │
│                                                                         │
│   REPOSITÓRIOS PRIVADOS                                                 │
│   ════════════════════                                                  │
│                                                                         │
│   ┌────────────────────┐     ┌────────────────────┐                    │
│   │  SynkraAI/mmos     │     │  SynkraAI/         │                    │
│   │  (Proprietário+NDA)│     │  certified-partners│                    │
│   │                    │     │  (Proprietário)    │                    │
│   │  • MMOS Minds      │     │  • Squads Premium  │                    │
│   │  • DNA Mental™     │     │  • Portal Partners │                    │
│   └────────────────────┘     └────────────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Escopo de Pacotes npm

| Pacote                | Registry    | Licença        |
| --------------------- | ----------- | -------------- |
| `@aiox/core`          | npm público | MIT            |
| `@aiox/squad-etl`     | npm público | MIT            |
| `@aiox/squad-creator` | npm público | MIT            |
| `@aiox/squad-mmos`    | npm público | MIT            |
| `@aiox/mcp-presets`   | npm público | Apache 2.0     |

---

## Stack Tecnológico

| Categoria              | Tecnologia            | Versão  | Notas                            |
| ---------------------- | --------------------- | ------- | -------------------------------- |
| Runtime                | Node.js               | ≥18.0.0 | Plataforma para todos os scripts |
| Linguagem              | TypeScript/JavaScript | ES2022  | Desenvolvimento principal        |
| Definição              | Markdown + YAML       | N/A     | Agentes, tarefas, templates      |
| Gerenciador de Pacotes | npm                   | ≥9.0.0  | Gerenciamento de dependências    |
| Quality Gates          | Husky + lint-staged   | Latest  | Hooks de pre-commit              |
| Revisão de Código      | CodeRabbit            | Latest  | Revisão com IA                   |
| CI/CD                  | GitHub Actions        | N/A     | Workflows de automação           |

---

## Estrutura de Diretórios

### Estrutura Atual (v4)

```
aiox-core/
├── .aiox-core/                    # Camada do Framework
│   ├── core/                      # Módulo Core (fundação)
│   │   ├── config/                # Gerenciamento de configuração
│   │   ├── registry/              # Service Discovery
│   │   ├── quality-gates/         # Sistema QG de 3 camadas
│   │   ├── mcp/                   # Configuração global MCP
│   │   └── session/               # Gerenciamento de sessão
│   │
│   ├── development/               # Módulo Development
│   │   ├── agents/                # 11 definições de agentes
│   │   ├── tasks/                 # 115+ definições de tarefas
│   │   ├── workflows/             # 7 definições de workflows
│   │   └── scripts/               # Scripts de desenvolvimento
│   │
│   ├── product/                   # Módulo Product
│   │   ├── templates/             # 52+ templates
│   │   ├── checklists/            # 11 checklists
│   │   └── data/                  # Base de conhecimento PM
│   │
│   ├── infrastructure/            # Módulo Infrastructure
│   │   ├── scripts/               # 55+ scripts de infraestrutura
│   │   ├── tools/                 # CLI, MCP, configs locais
│   │   └── integrations/          # Adaptadores PM
│   │
│   └── docs/                      # Documentação do Framework
│       └── standards/             # Documentos de padrões
│
├── docs/                          # Documentação do Projeto
│   ├── stories/                   # Stories de desenvolvimento
│   ├── architecture/              # Docs de arquitetura
│   └── epics/                     # Planejamento de épicos
│
├── squads/                        # Implementações de Squads
│   ├── etl/                       # Squad ETL
│   ├── creator/                   # Squad Creator
│   └── mmos-mapper/               # Squad MMOS
│
├── .github/                       # Automação GitHub
│   ├── workflows/                 # Workflows CI/CD
│   ├── ISSUE_TEMPLATE/            # Templates de issues
│   └── CODEOWNERS                 # Propriedade do código
│
└── .husky/                        # Git hooks (QG Camada 1)
```

---

## Componentes Principais

### Visão Geral dos Módulos

| Módulo             | Caminho                      | Propósito             | Conteúdos Principais                 |
| ------------------ | ---------------------------- | --------------------- | ------------------------------------ |
| **Core**           | `.aiox-core/core/`           | Fundação do framework | Config, Registry, QG, MCP, Session   |
| **Development**    | `.aiox-core/development/`    | Artefatos de dev      | Agentes, Tarefas, Workflows, Scripts |
| **Product**        | `.aiox-core/product/`        | Artefatos PM          | Templates, Checklists, Dados         |
| **Infrastructure** | `.aiox-core/infrastructure/` | Config do sistema     | Scripts, Ferramentas, Integrações    |

### Sistema de Agentes

| Agente | ID              | Arquétipo    | Responsabilidade          |
| ------ | --------------- | ------------ | ------------------------- |
| Dex    | `dev`           | Builder      | Implementação de código   |
| Quinn  | `qa`            | Guardian     | Garantia de qualidade     |
| Aria   | `architect`     | Architect    | Arquitetura técnica       |
| Nova   | `po`            | Visionary    | Backlog do produto        |
| Kai    | `pm`            | Balancer     | Estratégia de produto     |
| River  | `sm`            | Facilitator  | Facilitação de processos  |
| Zara   | `analyst`       | Explorer     | Análise de negócios       |
| Dara   | `data-engineer` | Architect    | Engenharia de dados       |
| Felix  | `devops`        | Optimizer    | CI/CD e operações         |
| Uma    | `ux-expert`     | Creator      | Experiência do usuário    |
| Pax    | `aiox-master`   | Orchestrator | Orquestração do framework |

---

## Quality Gates

### Sistema de Quality Gate de 3 Camadas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QUALITY GATES 3 CAMADAS                             │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ CAMADA 1: PRE-COMMIT (Local)                                      │ │
│   │ ═══════════════════════════                                       │ │
│   │ • ESLint, Prettier, TypeScript                                    │ │
│   │ • Testes unitários (rápidos)                                      │ │
│   │ • Ferramenta: Husky + lint-staged                                 │ │
│   │ • Bloqueante: Não consegue fazer commit se falhar                 │ │
│   │ • Problemas capturados: 30%                                       │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ CAMADA 2: AUTOMAÇÃO DE PR (CI/CD)                                 │ │
│   │ ════════════════════════════════                                  │ │
│   │ • Revisão com IA CodeRabbit                                       │ │
│   │ • Testes de integração, análise de cobertura                      │ │
│   │ • Scan de segurança, benchmarks de performance                    │ │
│   │ • Ferramenta: GitHub Actions + CodeRabbit                         │ │
│   │ • Bloqueante: Checks necessários para merge                       │ │
│   │ • Problemas capturados: +50% adicional (80% total)                │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ CAMADA 3: REVISÃO HUMANA (Estratégica)                            │ │
│   │ ══════════════════════════════════                                │ │
│   │ • Alinhamento de arquitetura                                      │ │
│   │ • Correção da lógica de negócio                                   │ │
│   │ • Casos extremos, qualidade da documentação                       │ │
│   │ • Ferramenta: Expertise humana                                    │ │
│   │ • Bloqueante: Aprovação final necessária                          │ │
│   │ • Problemas capturados: 20% finais (100% total)                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   RESULTADO: 80% dos problemas capturados automaticamente              │
│              Tempo de revisão humana: 30 min/PR (vs 2-4h na v2.0)      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Documentos Relacionados

- [Sistema de Módulos](./module-system.md) - Arquitetura detalhada dos módulos
- [ARCHITECTURE-INDEX.md](./ARCHITECTURE-INDEX.md) - Índice completo da documentação
- [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](../../../.aiox-core/docs/standards/AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md) - Guia completo do framework

---

**Última Atualização:** 2025-12-09
**Versão:** 2.1.0
**Mantenedor:** @architect (Aria)
